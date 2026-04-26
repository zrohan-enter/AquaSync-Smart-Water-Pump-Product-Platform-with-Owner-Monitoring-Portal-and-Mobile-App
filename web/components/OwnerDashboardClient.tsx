"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  const now = Date.now();
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

function useIsDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;

    const sync = () => {
      setIsDark(root.classList.contains("dark"));
    };

    sync();

    const observer = new MutationObserver(sync);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return isDark;
}

export default function OwnerDashboardClient({ initialData }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDark = useIsDarkMode();

  const [data, setData] = useState<DashboardPayload>(initialData);
  const [refreshing, setRefreshing] = useState(false);
  const [pollError, setPollError] = useState<string | null>(null);
  const [switchingDeviceId, setSwitchingDeviceId] = useState<string | null>(
    null,
  );

  const mountedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selectedDeviceFromUrl = searchParams.get("device");
  const effectiveDeviceId = selectedDeviceFromUrl || data.device.id;

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

  const ui = isDark
    ? {
        pageText: "#edf2ff",
        heading: "#ffffff",
        subtext: "#94a3b8",
        softText: "#64748b",
        panelBg: "rgba(10,17,32,0.88)",
        panelBorder: "rgba(255,255,255,0.08)",
        panelShadow: "0 24px 54px rgba(2,8,23,0.42)",
        cardBg: "rgba(255,255,255,0.04)",
        cardBg2: "rgba(255,255,255,0.06)",
        cardBorder: "rgba(255,255,255,0.08)",
        emptyBg: "rgba(255,255,255,0.04)",
        emptyBorder: "rgba(255,255,255,0.08)",
        buttonSoftBg: "rgba(255,255,255,0.05)",
        buttonSoftText: "#ffffff",
        tooltipBg: "#081120",
        tooltipBorder: "rgba(255,255,255,0.08)",
        gridStroke: "rgba(255,255,255,0.10)",
        axisStroke: "#94a3b8",
        activeDeviceShadow: "0 18px 38px rgba(37,99,235,0.32)",
      }
    : {
        pageText: "#0f172a",
        heading: "#0b1220",
        subtext: "#5f6f86",
        softText: "#8b9bb2",
        panelBg: "#ffffff",
        panelBorder: "rgba(15,23,42,0.08)",
        panelShadow: "0 18px 40px rgba(15,23,42,0.10)",
        cardBg: "#f8fbff",
        cardBg2: "#f3f7fc",
        cardBorder: "rgba(15,23,42,0.08)",
        emptyBg: "#f8fbff",
        emptyBorder: "rgba(15,23,42,0.10)",
        buttonSoftBg: "#ffffff",
        buttonSoftText: "#0f172a",
        tooltipBg: "#ffffff",
        tooltipBorder: "#dbe4ef",
        gridStroke: "#dbe4ef",
        axisStroke: "#64748b",
        activeDeviceShadow: "0 18px 38px rgba(37,99,235,0.22)",
      };

  const panelStyle: React.CSSProperties = {
    background: ui.panelBg,
    border: `1px solid ${ui.panelBorder}`,
    boxShadow: ui.panelShadow,
    borderRadius: "32px",
  };

  const cardStyle: React.CSSProperties = {
    background: ui.cardBg,
    border: `1px solid ${ui.cardBorder}`,
    borderRadius: "24px",
  };

  const softCardStyle: React.CSSProperties = {
    background: ui.cardBg2,
    border: `1px solid ${ui.cardBorder}`,
    borderRadius: "22px",
  };

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setData(initialData);
    setPollError(null);
    setRefreshing(false);
    setSwitchingDeviceId(null);
  }, [initialData]);

  async function fetchLatestDashboard(
    silent = false,
    deviceIdOverride?: string | null,
  ) {
    try {
      if (!silent && mountedRef.current) {
        setRefreshing(true);
      }

      const targetDeviceId = deviceIdOverride || effectiveDeviceId;
      const endpoint = targetDeviceId
        ? `/api/dashboard?device=${encodeURIComponent(targetDeviceId)}`
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
        if (mountedRef.current) {
          setPollError(`Refresh failed (${response.status})`);
        }
        return;
      }

      const nextData = await response.json();

      if (mountedRef.current) {
        setData((prev) => ({
          ...prev,
          ...nextData,
          allDevices:
            nextData.allDevices && nextData.allDevices.length > 0
              ? nextData.allDevices
              : prev.allDevices,
        }));
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
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (switchingDeviceId) {
      return;
    }

    intervalRef.current = setInterval(() => {
      fetchLatestDashboard(true, effectiveDeviceId);
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [effectiveDeviceId, switchingDeviceId]);

  function handleDeviceSwitch(deviceId: string) {
    if (deviceId === effectiveDeviceId) return;
    setSwitchingDeviceId(deviceId);
    router.push(`/portal/dashboard?device=${deviceId}`);
  }

  function StatCard({ label, value }: { label: string; value: string }) {
    return (
      <div className="p-6" style={panelStyle}>
        <p className="mb-2 text-sm font-medium" style={{ color: ui.subtext }}>
          {label}
        </p>
        <h3
          className="text-4xl font-black tracking-tight"
          style={{ color: ui.heading }}
        >
          {value}
        </h3>
      </div>
    );
  }

  return (
    <main className="space-y-6" style={{ color: ui.pageText }}>
      <section className="p-6" style={panelStyle}>
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-blue-600">
              My Devices
            </p>
            <h2
              className="font-display text-3xl font-black tracking-tight"
              style={{ color: ui.heading }}
            >
              Device Selection
            </h2>
          </div>

          <div
            className="rounded-2xl px-4 py-3 text-sm font-semibold"
            style={{
              background: ui.cardBg2,
              color: ui.subtext,
              border: `1px solid ${ui.cardBorder}`,
            }}
          >
            {allDevices.length} device{allDevices.length > 1 ? "s" : ""} linked
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {allDevices.map((item) => {
            const active = item.id === effectiveDeviceId;
            const switching = switchingDeviceId === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleDeviceSwitch(item.id)}
                disabled={switching}
                className="rounded-[1.5rem] p-4 text-left transition duration-200 hover:-translate-y-0.5 disabled:cursor-wait"
                style={
                  active
                    ? {
                        background:
                          "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                        color: "#ffffff",
                        border: "1px solid rgba(37,99,235,0.20)",
                        boxShadow: ui.activeDeviceShadow,
                        opacity: switching ? 0.88 : 1,
                      }
                    : {
                        ...cardStyle,
                        color: ui.heading,
                        opacity: switching ? 0.72 : 1,
                      }
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-80">
                    {item.activation_status}
                  </p>

                  {switching ? (
                    <span
                      className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em]"
                      style={{
                        background: active
                          ? "rgba(255,255,255,0.18)"
                          : ui.cardBg2,
                        color: active ? "#ffffff" : ui.subtext,
                        border: `1px solid ${
                          active ? "rgba(255,255,255,0.16)" : ui.cardBorder
                        }`,
                      }}
                    >
                      Loading
                    </span>
                  ) : null}
                </div>

                <p className="mt-2 break-all text-lg font-black">
                  {item.device_uuid}
                </p>
                <p className="mt-2 text-sm opacity-80">
                  {item.installation_location || "Location not assigned"}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="p-8" style={panelStyle}>
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.35em] text-blue-600">
                Owner Dashboard
              </p>
              <h1
                className="font-display text-5xl font-black tracking-tight md:text-6xl"
                style={{ color: ui.heading }}
              >
                AquaSync Control Center
              </h1>
              <p
                className="mt-4 text-lg leading-8"
                style={{ color: ui.subtext }}
              >
                Monitor your connected water system, review device health, and
                manage service activity from one premium control surface.
              </p>
            </div>

            <button
              onClick={() => fetchLatestDashboard(false, effectiveDeviceId)}
              disabled={refreshing || !!switchingDeviceId}
              className="rounded-2xl px-6 py-4 font-bold transition disabled:opacity-60"
              style={{
                background: ui.buttonSoftBg,
                color: ui.buttonSoftText,
                border: `1px solid ${ui.cardBorder}`,
              }}
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {pollError ? (
            <div className="mb-5 inline-flex rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
              {pollError}
            </div>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
            <div>
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.35em] text-blue-600">
                Connected Device
              </p>

              <h2
                className="font-display text-4xl font-black tracking-tight"
                style={{ color: ui.heading }}
              >
                AquaSync Pro
              </h2>
              <p
                className="mt-3 break-all text-2xl"
                style={{ color: ui.subtext }}
              >
                {device.device_uuid}
              </p>

              <div className="mt-10 grid gap-8 sm:grid-cols-2">
                <div>
                  <p className="text-sm" style={{ color: ui.subtext }}>
                    Activation
                  </p>
                  <p
                    className="mt-2 text-2xl font-black uppercase"
                    style={{ color: ui.heading }}
                  >
                    {device.activation_status || "ACTIVE"}
                  </p>
                </div>

                <div>
                  <p className="text-sm" style={{ color: ui.subtext }}>
                    Location
                  </p>
                  <p
                    className="mt-2 text-2xl font-black"
                    style={{ color: ui.heading }}
                  >
                    {device.installation_location || "Not assigned"}
                  </p>
                </div>

                <div>
                  <p className="text-sm" style={{ color: ui.subtext }}>
                    Last Sync
                  </p>
                  <p
                    className="mt-2 text-2xl font-black"
                    style={{ color: ui.heading }}
                  >
                    {timeAgo(latest?.created_at)}
                  </p>
                </div>

                <div>
                  <p className="text-sm" style={{ color: ui.subtext }}>
                    Connection
                  </p>
                  <div
                    className="mt-3 inline-flex items-center gap-3 rounded-full px-5 py-3 text-sm font-bold"
                    style={{
                      background: ui.cardBg2,
                      border: `1px solid ${ui.cardBorder}`,
                      color: ui.heading,
                    }}
                  >
                    <span
                      className={`h-3 w-3 rounded-full ${
                        motorOn ? "animate-pulse bg-green-500" : "bg-slate-400"
                      }`}
                    />
                    {motorOn ? "Online" : "Idle"}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-700 p-7 text-white shadow-[0_20px_48px_rgba(37,99,235,0.28)]">
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

        <aside className="p-8" style={panelStyle}>
          <p
            className="mb-6 text-sm font-bold uppercase tracking-[0.35em]"
            style={{ color: ui.softText }}
          >
            System State
          </p>

          <div className="space-y-4">
            <div className="p-5" style={softCardStyle}>
              <p className="text-sm" style={{ color: ui.subtext }}>
                System Health
              </p>
              <p
                className="mt-3 text-2xl font-black"
                style={{ color: ui.heading }}
              >
                {healthLabel}
              </p>
            </div>

            <div className="p-5" style={softCardStyle}>
              <p className="text-sm" style={{ color: ui.subtext }}>
                Maintenance
              </p>
              <p
                className="mt-3 text-2xl font-black"
                style={{ color: ui.heading }}
              >
                Not required
              </p>
            </div>

            <div className="p-5" style={softCardStyle}>
              <p className="text-sm" style={{ color: ui.subtext }}>
                Warnings
              </p>
              <p
                className="mt-3 text-2xl font-black"
                style={{ color: ui.heading }}
              >
                {alerts.length} active alerts
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <button className="w-full rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white transition hover:bg-blue-700">
              Request Technician
            </button>
            <button
              className="w-full rounded-2xl px-6 py-4 font-bold transition"
              style={{
                background: ui.buttonSoftBg,
                color: ui.buttonSoftText,
                border: `1px solid ${ui.cardBorder}`,
              }}
            >
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
        <div className="p-6" style={panelStyle}>
          <p className="mb-2 text-sm" style={{ color: ui.subtext }}>
            Operational Note
          </p>
          <h3
            className="text-3xl font-black leading-tight"
            style={{ color: ui.heading }}
          >
            {alerts.length > 0
              ? "System requires review due to unresolved alert conditions."
              : "System is operating normally with cloud sync active and no current warning events."}
          </h3>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="p-8" style={panelStyle}>
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.35em] text-blue-600">
                Telemetry Overview
              </p>
              <h2
                className="font-display text-4xl font-black tracking-tight"
                style={{ color: ui.heading }}
              >
                Water Level Trend
              </h2>
            </div>
            <div className="text-sm font-medium" style={{ color: ui.subtext }}>
              {chartData.length < 2
                ? "Waiting for more live samples..."
                : `${chartData.length} live samples`}
            </div>
          </div>

          <div className="h-[340px] w-full min-w-0">
            {chartData.length === 0 ? (
              <div
                className="flex h-full items-center justify-center rounded-[1.5rem]"
                style={{
                  background: ui.emptyBg,
                  border: `1px dashed ${ui.emptyBorder}`,
                  color: ui.subtext,
                }}
              >
                No telemetry history yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 12, right: 12, bottom: 12, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={ui.gridStroke} />
                  <XAxis
                    dataKey="time"
                    stroke={ui.axisStroke}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    stroke={ui.axisStroke}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "16px",
                      border: `1px solid ${ui.tooltipBorder}`,
                      background: ui.tooltipBg,
                      color: ui.heading,
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

        <div className="p-8" style={panelStyle}>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.35em] text-blue-600">
            Active Alerts
          </p>
          <h2
            className="mb-6 font-display text-4xl font-black tracking-tight"
            style={{ color: ui.heading }}
          >
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
                  className="rounded-[1.5rem] border border-red-200 bg-red-50 p-5"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-600">
                    {alert.severity || "Warning"}
                  </p>
                  <h3
                    className="mt-2 text-2xl font-black"
                    style={{ color: "#0f172a" }}
                  >
                    {alert.title || "System Alert"}
                  </h3>
                  <p className="mt-2 text-base text-slate-600">
                    {alert.message || "An alert condition was detected."}
                  </p>
                  <p className="mt-3 text-sm text-slate-500">
                    {formatDateTime(alert.created_at)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="p-8" style={panelStyle}>
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.35em] text-blue-600">
              Recent Activity
            </p>
            <h2
              className="font-display text-4xl font-black tracking-tight"
              style={{ color: ui.heading }}
            >
              Operational Timeline
            </h2>
          </div>

          <button
            onClick={() => fetchLatestDashboard(false, effectiveDeviceId)}
            disabled={refreshing || !!switchingDeviceId}
            className="rounded-2xl px-6 py-3 font-bold transition disabled:opacity-60"
            style={{
              background: ui.buttonSoftBg,
              color: ui.buttonSoftText,
              border: `1px solid ${ui.cardBorder}`,
            }}
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {motorEvents.length === 0 ? (
          <div
            className="rounded-[1.5rem] p-6"
            style={{
              background: ui.emptyBg,
              border: `1px dashed ${ui.emptyBorder}`,
              color: ui.subtext,
            }}
          >
            No recent motor events yet.
          </div>
        ) : (
          <div className="space-y-4">
            {motorEvents.map((event) => (
              <div
                key={event.id}
                className="flex flex-col justify-between gap-4 rounded-[1.5rem] p-6 md:flex-row md:items-center"
                style={softCardStyle}
              >
                <div>
                  <h3
                    className="text-2xl font-black"
                    style={{ color: ui.heading }}
                  >
                    Motor turned {event.new_status}
                  </h3>
                  <p className="mt-2 text-base" style={{ color: ui.subtext }}>
                    {event.reason || "Motor state updated."}
                  </p>
                </div>
                <div
                  className="text-sm font-bold"
                  style={{ color: ui.softText }}
                >
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
