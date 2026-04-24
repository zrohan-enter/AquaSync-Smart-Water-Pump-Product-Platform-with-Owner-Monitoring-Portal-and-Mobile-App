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
      <main className="min-h-screen bg-[#f6f8fc] px-6 py-20 text-slate-900 flex items-center justify-center">
        <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm text-center">
          <h1 className="mb-4 text-3xl font-black">Access Denied</h1>
          <p className="mb-8 text-slate-600">
            Please sign in to access your AquaSync digital twin.
          </p>
          <Link
            href="/portal/login"
            className="block w-full rounded-2xl bg-blue-600 py-4 font-bold text-white transition hover:bg-blue-700"
          >
            Go to Login
          </Link>
        </div>
      </main>
    );
  }

  // Fetch all devices owned by this user
  const { data: ownedDevices, error: devicesError } = await supabase
    .from("devices")
    .select(
      "id, device_uuid, activation_status, installation_location, firmware_version, created_at, product_id",
    )
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (devicesError || !ownedDevices || ownedDevices.length === 0) {
    return (
      <main className="min-h-screen bg-[#f6f8fc] px-6 py-20 text-slate-900">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm text-center">
          <h1 className="mb-4 text-4xl font-black">No Active Device</h1>
          <p className="mb-8 text-lg font-medium text-slate-600">
            Hello, {user.email}. You have not activated a device yet.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/portal/activate"
              className="rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white transition hover:bg-blue-700"
            >
              Activate Now
            </Link>
            <Link
              href="/products"
              className="rounded-2xl border border-slate-300 px-8 py-4 font-bold text-slate-900 transition hover:bg-slate-50"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Pick selected device if provided, otherwise newest device
  const activeDevice =
    ownedDevices.find((device) => device.id === selectedDeviceId) ??
    ownedDevices[0];

  if (!activeDevice) {
    return (
      <main className="min-h-screen bg-[#f6f8fc] px-6 py-20 text-slate-900">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm text-center">
          <h1 className="mb-4 text-4xl font-black">Device Selection Error</h1>
          <p className="mb-8 text-lg text-slate-600">
            We could not resolve the selected device for your account.
          </p>
          <Link
            href="/portal/dashboard"
            className="rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white transition hover:bg-blue-700"
          >
            Reload Dashboard
          </Link>
        </div>
      </main>
    );
  }

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
    <main className="min-h-screen bg-[#f6f8fc] text-slate-900">
      <div className="mx-auto max-w-[1400px] px-6 pt-10 md:px-10 lg:px-14">
        <div className="mb-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-blue-600">
                My Devices
              </p>
              <h2 className="text-3xl font-black tracking-tight">
                Device Selection
              </h2>
              <p className="mt-2 text-slate-600">
                Switch between all AquaSync devices linked to your owner
                account.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">
              {ownedDevices.length} device{ownedDevices.length > 1 ? "s" : ""}{" "}
              linked
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {ownedDevices.map((device) => {
              const isActive = device.id === activeDevice.id;

              return (
                <Link
                  key={device.id}
                  href={`/portal/dashboard?device=${device.id}`}
                  className={`rounded-2xl border px-5 py-4 transition ${
                    isActive
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <div className="text-sm font-bold uppercase tracking-[0.16em] opacity-80">
                    {device.activation_status || "PENDING"}
                  </div>
                  <div className="mt-1 text-lg font-black">
                    {device.device_uuid}
                  </div>
                  <div className="mt-1 text-sm opacity-80">
                    {device.installation_location || "Location not assigned"}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <OwnerDashboardClient
        initialData={{
          device: activeDevice,
          latestTelemetry: latestTelemetry.data ?? null,
          telemetryHistory: (telemetryHistory.data ?? []).reverse(),
          motorEvents: motorEvents.data ?? [],
          alerts: alerts.data ?? [],
        }}
      />
    </main>
  );
}
