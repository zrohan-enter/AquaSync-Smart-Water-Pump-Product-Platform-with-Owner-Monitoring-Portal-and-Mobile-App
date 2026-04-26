import Link from "next/link";
import OwnerDashboardClient from "@/components/OwnerDashboardClient";
import { createClient } from "@/lib/auth/server";

type DashboardPageProps = {
  searchParams: Promise<{
    device?: string;
  }>;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;
  const selectedDeviceId = params.device ?? null;

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return (
      <main className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-white/10 dark:bg-white/5">
        <h1 className="mb-4 text-3xl font-black">Access Denied</h1>
        <p className="mb-8 text-slate-600 dark:text-slate-300">
          Please sign in to access your AquaSync digital twin.
        </p>
        <Link
          href="/portal/login"
          className="inline-flex rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white transition hover:bg-blue-700"
        >
          Go to Login
        </Link>
      </main>
    );
  }

  const { data: ownedDevices, error: devicesError } = await supabase
    .from("devices")
    .select(
      "id, device_uuid, activation_status, installation_location, firmware_version, created_at, product_id",
    )
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (devicesError || !ownedDevices || ownedDevices.length === 0) {
    return (
      <main className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-white/10 dark:bg-white/5">
        <h1 className="mb-4 text-4xl font-black">No Active Device</h1>
        <p className="mb-8 text-lg font-medium text-slate-600 dark:text-slate-300">
          Hello, {user.email}. You have not activated a device yet.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/portal/activate"
            className="rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white transition hover:bg-blue-700"
          >
            Activate Now
          </Link>
          <Link
            href="/products"
            className="rounded-2xl border border-slate-300 px-8 py-4 font-bold text-slate-900 transition hover:bg-slate-50 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
          >
            Browse Catalog
          </Link>
        </div>
      </main>
    );
  }

  const activeDevice =
    ownedDevices.find((device) => device.id === selectedDeviceId) ??
    ownedDevices[0];

  const [latestTelemetry, telemetryHistory, motorEvents, alerts] =
    await Promise.all([
      supabase
        .from("telemetry_logs")
        .select("*")
        .eq("device_id", activeDevice.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),

      supabase
        .from("telemetry_logs")
        .select(
          "water_level_percent, voltage_v, current_a, power_kw, energy_kwh, motor_status, mode, health_score, error_code, created_at",
        )
        .eq("device_id", activeDevice.id)
        .order("created_at", { ascending: false })
        .limit(20),

      supabase
        .from("motor_events")
        .select("*")
        .eq("device_id", activeDevice.id)
        .order("created_at", { ascending: false })
        .limit(5),

      supabase
        .from("alerts")
        .select("*")
        .eq("device_id", activeDevice.id)
        .eq("is_resolved", false)
        .order("created_at", { ascending: false }),
    ]);

  return (
    <OwnerDashboardClient
      initialData={{
        device: activeDevice,
        allDevices: ownedDevices,
        latestTelemetry: latestTelemetry.data ?? null,
        telemetryHistory: (telemetryHistory.data ?? []).reverse(),
        motorEvents: motorEvents.data ?? [],
        alerts: alerts.data ?? [],
      }}
    />
  );
}
