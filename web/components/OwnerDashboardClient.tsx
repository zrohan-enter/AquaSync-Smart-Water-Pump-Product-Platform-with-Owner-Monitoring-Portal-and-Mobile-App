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
import { supabaseBrowser } from "@/lib/auth/client";

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
    <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
      <p className="mb-3 text-xl text-slate-500">{label}</p>
      <h3 className="text-5xl md:text-6xl font-black tracking-tight text-slate-950">
        {value}
      </h3>
    </div>
  );
}

export default function OwnerDashboardClient({ initialData }: Props) {
  const router = useRouter();

  const [data, setData] = useState<DashboardPayload>(initialData);
  const [refreshing, setRefreshing] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [pollError, setPollError] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const latest = data.latestTelemetry;
  const device = data.device;
  const alerts = data.alerts ?? [];
  const motorEvents = data.motorEvents ?? [];
  const telemetryHistory = data.telemetryHistory ?? [];

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
      voltage: row.voltage_v ?? 0,
      power: row.power_kw ?? 0,
      created_at: row.created_at,
    }));
  }, [telemetryHistory]);

  async function fetchLatestDashboard(silent = false) {
    try {
      if (!silent && mountedRef.current) {
        setRefreshing(true);
      }

      const response = await fetch("/api/dashboard", {
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
        console.error("Dashboard refresh failed:", response.status);
        if (mountedRef.current) {
          setPollError(`Refresh failed (${response.status})`);
        }
        return;
      }

      const nextData: DashboardPayload = await response.json();

      if (mountedRef.current) {
        setData(nextData);
        setPollError(null);
      }
    } catch (error) {
      console.error("Dashboard polling failed:", error);
      if (mountedRef.current) {
        setPollError("Live refresh temporarily unavailable");
      }
    } finally {
      if (!silent && mountedRef.current) {
        setRefreshing(false);
      }
    }
  }

  useEffect(() => {
    mountedRef.current = true;

    intervalRef.current = setInterval(() => {
      fetchLatestDashboard(true);
    }, 5000);

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await supabaseBrowser.auth.signOut();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Sign out failed:", error);
    } finally {
      if (mountedRef.current) {
        setSigningOut(false);
      }
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f8fc] px-6 py-12 text-slate-900 md:px-10 lg:px-14">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-4xl">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.35em] text-blue-600">
              Owner Dashboard
            </p>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-950">
              AquaSync Control Center
            </h1>
            <p className="mt-5 max-w-3xl text-xl leading-10 text-slate-600">
              Monitor your connected water system, review device health, and
              manage service activity from one premium control surface.
            </p>

            {pollError ? (
              <div className="mt-5 inline-flex rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                {pollError}
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => fetchLatestDashboard(false)}
              disabled={refreshing}
              className="rounded-2xl border border-slate-300 bg-white px-8 py-4 text-lg font-bold text-slate-900 transition hover:bg-slate-50 disabled:opacity-60"
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <Link
              href="/"
              className="rounded-2xl bg-slate-950 px-8 py-4 text-lg font-bold text-white transition hover:bg-black"
            >
              Back to Home
            </Link>

            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="rounded-2xl border border-slate-300 bg-white px-8 py-4 text-lg font-bold text-slate-900 transition hover:bg-slate-50 disabled:opacity-60"
            >
              {signingOut ? "Signing Out..." : "Sign Out"}
            </button>
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[2fr_1fr]">
          <section className="rounded-[2.25rem] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.5fr_0.8fr]">
              <div>
                <p className="mb-4 text-sm font-bold uppercase tracking-[0.35em] text-blue-600">
                  Connected Device
                </p>

                <h2 className="text-4xl font-black tracking-tight text-slate-950">
                  AquaSync Pro
                </h2>

                <p className="mt-3 break-all text-2xl text-slate-500">
                  {device.device_uuid}
                </p>

                <div className="mt-10 grid gap-8 sm:grid-cols-2">
                  <div>
                    <p className="text-lg text-slate-500">Activation</p>
                    <p className="mt-2 text-2xl font-black uppercase">
                      {device.activation_status || "ACTIVE"}
                    </p>
                  </div>

                  <div>
                    <p className="text-lg text-slate-500">Location</p>
                    <p className="mt-2 text-2xl font-black">
                      {device.installation_location || "Not assigned"}
                    </p>
                  </div>

                  <div>
                    <p className="text-lg text-slate-500">Last Sync</p>
                    <p className="mt-2 text-2xl font-black">
                      {timeAgo(latest?.created_at)}
                    </p>
                  </div>

                  <div>
                    <p className="text-lg text-slate-500">Connection</p>
                    <div className="mt-3 inline-flex items-center gap-3 rounded-full bg-slate-100 px-5 py-3 text-lg font-bold text-slate-700">
                      <span
                        className={`h-3.5 w-3.5 rounded-full ${
                          motorOn
                            ? "bg-green-500 animate-pulse"
                            : "bg-slate-400"
                        }`}
                      />
                      {motorOn ? "Online" : "Idle"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-700 p-8 text-white shadow-sm">
                <p className="mb-4 text-sm font-bold uppercase tracking-[0.35em] text-white/90">
                  Live Summary
                </p>

                <div className="text-7xl font-black leading-none">
                  {waterLevel}%
                </div>
                <p className="mt-3 text-2xl text-white/90">
                  Current water level
                </p>

                <div className="my-8 h-px bg-white/20" />

                <div className="space-y-4 text-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Motor</span>
                    <span className="flex items-center gap-3 font-black">
                      {motorOn ? (
                        <span className="h-3.5 w-3.5 rounded-full bg-green-300 animate-pulse" />
                      ) : null}
                      {motorStatus}
                    </span>
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
          </section>

          <aside className="rounded-[2.25rem] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
            <p className="mb-6 text-sm font-bold uppercase tracking-[0.35em] text-slate-500">
              System State
            </p>

            <div className="space-y-5">
              <div className="rounded-[1.5rem] border border-slate-200 p-5">
                <p className="text-lg text-slate-500">System Health</p>
                <p className="mt-3 text-2xl font-black">{healthLabel}</p>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 p-5">
                <p className="text-lg text-slate-500">Maintenance</p>
                <p className="mt-3 text-2xl font-black">Not required</p>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 p-5">
                <p className="text-lg text-slate-500">Warnings</p>
                <p className="mt-3 text-2xl font-black">
                  {alerts.length} active alerts
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <button className="w-full rounded-2xl bg-blue-600 px-6 py-4 text-lg font-bold text-white transition hover:bg-blue-700">
                Request Technician
              </button>

              <button className="w-full rounded-2xl border border-slate-300 bg-white px-6 py-4 text-lg font-bold text-slate-900 transition hover:bg-slate-50">
                View Reports
              </button>
            </div>
          </aside>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Water Level" value={`${waterLevel}%`} />
          <StatCard label="Motor Status" value={`${motorStatus}`} />
          <StatCard label="Voltage" value={`${voltage}V`} />
          <StatCard label="Health Score" value={`${healthScore}`} />
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Current" value={`${current}A`} />
          <StatCard label="Power Usage" value={`${power} kW`} />
          <StatCard label="Energy" value={`${energy} kWh`} />
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="mb-3 text-xl text-slate-500">Operational Note</p>
            <h3 className="text-3xl font-black leading-tight text-slate-950">
              {alerts.length > 0
                ? "System requires review due to unresolved alert conditions."
                : "System is operating normally with cloud sync active and no current warning events."}
            </h3>
          </div>
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[2fr_1fr]">
          <section className="min-w-0 rounded-[2.25rem] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.35em] text-blue-600">
              Telemetry Overview
            </p>

            <div className="mb-8 flex items-center justify-between gap-4">
              <h2 className="text-4xl font-black tracking-tight text-slate-950">
                Water Level Trend
              </h2>
              <div className="text-sm font-medium text-slate-500">
                {chartData.length < 2
                  ? "Waiting for more live samples..."
                  : `${chartData.length} live samples`}
              </div>
            </div>

            <div className="h-[340px] w-full min-w-0">
              {chartData.length === 0 ? (
                <div className="flex h-full items-center justify-center rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 text-slate-500">
                  No telemetry history yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 12, right: 12, bottom: 12, left: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
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
          </section>

          <section className="rounded-[2.25rem] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.35em] text-blue-600">
              Active Alerts
            </p>
            <h2 className="mb-8 text-4xl font-black tracking-tight text-slate-950">
              Attention Center
            </h2>

            {alerts.length === 0 ? (
              <div className="rounded-[1.5rem] border border-green-200 bg-green-50 p-6 text-xl text-green-700">
                No unresolved alerts. Your AquaSync system is stable.
              </div>
            ) : (
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="rounded-[1.5rem] border border-red-200 bg-red-50 p-5"
                  >
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-600">
                      {alert.severity || "Warning"}
                    </p>
                    <h3 className="mt-2 text-2xl font-black text-slate-950">
                      {alert.title || "System Alert"}
                    </h3>
                    <p className="mt-2 text-lg text-slate-600">
                      {alert.message || "An alert condition was detected."}
                    </p>
                    <p className="mt-3 text-sm font-medium text-slate-500">
                      {formatDateTime(alert.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="mt-8 rounded-[2.25rem] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.35em] text-blue-600">
                Recent Activity
              </p>
              <h2 className="text-4xl font-black tracking-tight text-slate-950">
                Operational Timeline
              </h2>
            </div>

            <button
              onClick={() => fetchLatestDashboard(false)}
              disabled={refreshing}
              className="rounded-2xl border border-slate-300 bg-white px-6 py-3 text-lg font-bold text-slate-900 transition hover:bg-slate-50 disabled:opacity-60"
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {motorEvents.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-500">
              No recent motor events yet.
            </div>
          ) : (
            <div className="space-y-4">
              {motorEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex flex-col justify-between gap-4 rounded-[1.5rem] border border-slate-200 p-6 md:flex-row md:items-center"
                >
                  <div>
                    <h3 className="text-2xl font-black text-slate-950">
                      Motor turned {event.new_status}
                    </h3>
                    <p className="mt-2 text-lg text-slate-600">
                      {event.reason || "Motor state updated."}
                    </p>
                  </div>
                  <div className="text-lg font-bold text-slate-400">
                    {timeAgo(event.created_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
