"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Device = {
  id: string;
  device_uuid: string;
  activation_status: string;
  installation_location: string | null;
  firmware_version?: string | null;
  created_at: string;
  owner_id?: string | null;
};

type TelemetryRow = {
  id?: string;
  water_level_percent: number | null;
  voltage_v: number | null;
  current_a?: number | null;
  power_kw?: number | null;
  energy_kwh?: number | null;
  motor_status: string | null;
  mode?: string | null;
  health_score?: number | null;
  error_code?: string | null;
  created_at: string;
};

type MotorEvent = {
  id: string;
  old_status: string | null;
  new_status: string | null;
  reason: string | null;
  created_at: string;
};

type AlertItem = {
  id: string;
  title?: string | null;
  message?: string | null;
  severity?: string | null;
  is_resolved?: boolean | null;
  created_at: string;
};

type DashboardPayload = {
  device: Device;
  allDevices: Device[];
  latestTelemetry: TelemetryRow | null;
  telemetryHistory: TelemetryRow[];
  motorEvents: MotorEvent[];
  alerts: AlertItem[];
};

type Props = {
  initialData: DashboardPayload;
};

function formatTime(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(value?: string | null) {
  if (!value) return "No sync";
  const now = new Date().getTime();
  const then = new Date(value).getTime();
  const diffSec = Math.max(0, Math.floor((now - then) / 1000));

  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} min ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hr ago`;
  return `${Math.floor(diffSec / 86400)} day ago`;
}

function getHealthLabel(score: number, alertsCount: number) {
  if (alertsCount > 0) return "Needs attention";
  if (score >= 90) return "Stable";
  if (score >= 65) return "Monitor";
  return "Needs attention";
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
      <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <h3 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white">
        {value}
      </h3>
    </div>
  );
}

export default function OwnerDashboardClient({ initialData }: Props) {
  const router = useRouter();

  const [data, setData] = useState<DashboardPayload>(initialData);
  const [refreshing, setRefreshing] = useState(false);
  const [pollError, setPollError] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const latest = data.latestTelemetry;
  const device = data.device;
  const alerts = data.alerts ?? [];
  const motorEvents = data.motorEvents ?? [];
  const telemetryHistory = data.telemetryHistory ?? [];
  const allDevices = data.allDevices ?? [];

  const waterLevel = latest?.water_level_percent ?? 0;
  const voltage = latest?.voltage_v ?? 0;
  const current = latest?.current_a ?? 0;
  const power = latest?.power_kw ?? 0;
  const energy = latest?.energy_kwh ?? 0;
  const motorStatus = latest?.motor_status ?? "OFF";
  const healthScore = latest?.health_score ?? 0;
  const motorOn = motorStatus === "ON";

  const healthLabel = getHealthLabel(healthScore, alerts.length);

  const chartData = useMemo(() => {
    return telemetryHistory.map((row) => ({
      time: formatTime(row.created_at),
      waterLevel: row.water_level_percent ?? 0,
      created_at: row.created_at,
    }));
  }, [telemetryHistory]);

  async function fetchLatestDashboard(silent = false) {
    try {
      if (!silent && mountedRef.current) setRefreshing(true);

      const deviceId = data.device?.id;
      const endpoint = deviceId
        ? `/api/dashboard?device=${encodeURIComponent(deviceId)}`
        : "/api/dashboard";

      const response = await fetch(endpoint, {
        method: "GET",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-store",
          Pragma: "no-cache",
        },
      });

      if (response.status === 401) {
        router.push("/portal/login");
        return;
      }

      if (!response.ok) {
        if (mountedRef.current)
          setPollError(`Refresh failed (${response.status})`);
        return;
      }

      const nextData = await response.json();

      if (mountedRef.current) {
        setData((prev) => ({
          ...prev,
          device: nextData.device,
          latestTelemetry: nextData.latestTelemetry,
          telemetryHistory: nextData.telemetryHistory,
          motorEvents: nextData.motorEvents,
          alerts: nextData.alerts,
        }));
        setPollError(null);
      }
    } catch (error) {
      console.error("Dashboard polling failed:", error);
      if (mountedRef.current) {
        setPollError("Live refresh temporarily unavailable");
      }
    } finally {
      if (!silent && mountedRef.current) setRefreshing(false);
    }
  }

  useEffect(() => {
    mountedRef.current = true;

    intervalRef.current = setInterval(() => {
      fetchLatestDashboard(true);
    }, 5000);

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [data.device?.id]);

  return (
    <main className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-blue-600">
              My Devices
            </p>
            <h2 className="text-3xl font-black tracking-tight">
              Device Selection
            </h2>
          </div>

          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 dark:bg-white/5 dark:text-slate-300">
            {allDevices.length} device{allDevices.length > 1 ? "s" : ""} linked
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {allDevices.map((item) => {
            const active = item.id === device.id;

            return (
              <Link
                key={item.id}
                href={`/portal/dashboard?device=${item.id}`}
                className={`rounded-[1.5rem] border p-4 transition ${
                  active
                    ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                    : "border-slate-200 bg-white hover:-translate-y-0.5 hover:shadow-sm dark:border-white/10 dark:bg-white/5"
                }`}
              >
                <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-80">
                  {item.activation_status}
                </p>
                <p className="mt-2 break-all text-lg font-black">
                  {item.device_uuid}
                </p>
                <p className="mt-2 text-sm opacity-80">
                  {item.installation_location || "Location not assigned"}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.35em] text-blue-600">
                Owner Dashboard
              </p>
              <h1 className="text-5xl font-black tracking-tight text-slate-950 dark:text-white md:text-6xl">
                AquaSync Control Center
              </h1>
              <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">
                Monitor your connected water system, review device health, and
                manage service activity from one premium control surface.
              </p>
            </div>

            <button
              onClick={() => fetchLatestDashboard(false)}
              disabled={refreshing}
              className="rounded-2xl border border-slate-300 bg-white px-6 py-4 font-bold text-slate-900 transition hover:bg-slate-50 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {pollError ? (
            <div className="mb-5 inline-flex rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
              {pollError}
            </div>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
            <div>
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.35em] text-blue-600">
                Connected Device
              </p>

              <h2 className="text-4xl font-black tracking-tight">
                AquaSync Pro
              </h2>
              <p className="mt-3 break-all text-2xl text-slate-500 dark:text-slate-400">
                {device.device_uuid}
              </p>

              <div className="mt-10 grid gap-8 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Activation
                  </p>
                  <p className="mt-2 text-2xl font-black uppercase">
                    {device.activation_status || "ACTIVE"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Location
                  </p>
                  <p className="mt-2 text-2xl font-black">
                    {device.installation_location || "Not assigned"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Last Sync
                  </p>
                  <p className="mt-2 text-2xl font-black">
                    {timeAgo(latest?.created_at)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Connection
                  </p>
                  <div className="mt-3 inline-flex items-center gap-3 rounded-full bg-slate-100 px-5 py-3 text-sm font-bold text-slate-700 dark:bg-white/10 dark:text-slate-200">
                    <span
                      className={`h-3 w-3 rounded-full ${
                        motorOn ? "bg-green-500 animate-pulse" : "bg-slate-400"
                      }`}
                    />
                    {motorOn ? "Online" : "Idle"}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-700 p-7 text-white shadow-sm">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.35em] text-white/90">
                Live Summary
              </p>

              <div className="text-6xl font-black leading-none">
                {waterLevel}%
              </div>
              <p className="mt-3 text-xl text-white/90">Current water level</p>

              <div className="my-7 h-px bg-white/20" />

              <div className="space-y-4 text-lg">
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Motor</span>
                  <span className="font-black">{motorStatus}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Voltage</span>
                  <span className="font-black">{voltage}V</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Health</span>
                  <span className="font-black">{healthScore}/100</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
          <p className="mb-6 text-sm font-bold uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">
            System State
          </p>

          <div className="space-y-4">
            <div className="rounded-[1.5rem] border border-slate-200 p-5 dark:border-white/10">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                System Health
              </p>
              <p className="mt-3 text-2xl font-black">{healthLabel}</p>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 p-5 dark:border-white/10">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Maintenance
              </p>
              <p className="mt-3 text-2xl font-black">Not required</p>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 p-5 dark:border-white/10">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Warnings
              </p>
              <p className="mt-3 text-2xl font-black">
                {alerts.length} active alerts
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <button className="w-full rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white transition hover:bg-blue-700">
              Request Technician
            </button>
            <button className="w-full rounded-2xl border border-slate-300 bg-white px-6 py-4 font-bold text-slate-900 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10">
              View Reports
            </button>
          </div>
        </aside>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Water Level" value={`${waterLevel}%`} />
        <StatCard label="Motor Status" value={`${motorStatus}`} />
        <StatCard label="Voltage" value={`${voltage}V`} />
        <StatCard label="Health Score" value={`${healthScore}`} />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Current" value={`${current}A`} />
        <StatCard label="Power Usage" value={`${power} kW`} />
        <StatCard label="Energy" value={`${energy} kWh`} />
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
            Operational Note
          </p>
          <h3 className="text-3xl font-black leading-tight">
            {alerts.length > 0
              ? "System requires review due to unresolved alert conditions."
              : "System is operating normally with cloud sync active and no current warning events."}
          </h3>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.35em] text-blue-600">
                Telemetry Overview
              </p>
              <h2 className="text-4xl font-black tracking-tight">
                Water Level Trend
              </h2>
            </div>
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {chartData.length < 2
                ? "Waiting for more live samples..."
                : `${chartData.length} live samples`}
            </div>
          </div>

          <div className="h-[340px] w-full min-w-0">
            {chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                No telemetry history yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 12, right: 12, bottom: 12, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                  <XAxis
                    dataKey="time"
                    stroke="#64748b"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    stroke="#64748b"
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "16px",
                      border: "1px solid #e2e8f0",
                      background: "#ffffff",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="waterLevel"
                    stroke="#2563eb"
                    strokeWidth={4}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.35em] text-blue-600">
            Active Alerts
          </p>
          <h2 className="mb-6 text-4xl font-black tracking-tight">
            Attention Center
          </h2>

          {alerts.length === 0 ? (
            <div className="rounded-[1.5rem] border border-green-200 bg-green-50 p-6 text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-200">
              No unresolved alerts. Your AquaSync system is stable.
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="rounded-[1.5rem] border border-red-200 bg-red-50 p-5 dark:border-red-500/20 dark:bg-red-500/10"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-600 dark:text-red-300">
                    {alert.severity || "Warning"}
                  </p>
                  <h3 className="mt-2 text-2xl font-black">
                    {alert.title || "System Alert"}
                  </h3>
                  <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
                    {alert.message || "An alert condition was detected."}
                  </p>
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                    {formatDateTime(alert.created_at)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.35em] text-blue-600">
              Recent Activity
            </p>
            <h2 className="text-4xl font-black tracking-tight">
              Operational Timeline
            </h2>
          </div>

          <button
            onClick={() => fetchLatestDashboard(false)}
            disabled={refreshing}
            className="rounded-2xl border border-slate-300 bg-white px-6 py-3 font-bold text-slate-900 transition hover:bg-slate-50 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {motorEvents.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
            No recent motor events yet.
          </div>
        ) : (
          <div className="space-y-4">
            {motorEvents.map((event) => (
              <div
                key={event.id}
                className="flex flex-col justify-between gap-4 rounded-[1.5rem] border border-slate-200 p-6 md:flex-row md:items-center dark:border-white/10"
              >
                <div>
                  <h3 className="text-2xl font-black">
                    Motor turned {event.new_status}
                  </h3>
                  <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
                    {event.reason || "Motor state updated."}
                  </p>
                </div>
                <div className="text-sm font-bold text-slate-400 dark:text-slate-500">
                  {timeAgo(event.created_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
