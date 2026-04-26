"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/auth/client";

type DeviceRow = {
  id: string;
  device_uuid: string;
  activation_status: string | null;
  installation_location: string | null;
  firmware_version: string | null;
  created_at: string;
  owner_id: string | null;
  product_id?: string | null;
};

type ActivationRow = {
  device_id: string;
  activation_code: string;
  is_used: boolean | null;
  assigned_to_user_id: string | null;
  created_at: string;
};

type DeviceWithActivation = DeviceRow & {
  activation_code?: string | null;
  activation_is_used?: boolean | null;
};

export default function DevicesPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState<DeviceWithActivation[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadDevices() {
      try {
        setLoading(true);
        setErrorMessage("");

        const {
          data: { user },
          error: userError,
        } = await supabaseBrowser.auth.getUser();

        if (userError || !user) {
          router.push("/portal/login");
          return;
        }

        if (!mounted) return;

        setUserEmail(user.email ?? "");

        const { data: deviceData, error: deviceError } = await supabaseBrowser
          .from("devices")
          .select(
            "id, device_uuid, activation_status, installation_location, firmware_version, created_at, owner_id, product_id",
          )
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false });

        if (deviceError) {
          setErrorMessage(deviceError.message);
          return;
        }

        const baseDevices = (deviceData as DeviceRow[]) ?? [];

        if (baseDevices.length === 0) {
          setDevices([]);
          return;
        }

        const deviceIds = baseDevices.map((device) => device.id);

        const { data: activationData, error: activationError } =
          await supabaseBrowser
            .from("device_activations")
            .select(
              "device_id, activation_code, is_used, assigned_to_user_id, created_at",
            )
            .in("device_id", deviceIds)
            .order("created_at", { ascending: false });

        if (activationError) {
          setErrorMessage(activationError.message);
          return;
        }

        const activationMap = new Map<string, ActivationRow>();

        ((activationData as ActivationRow[]) ?? []).forEach((row) => {
          if (!activationMap.has(row.device_id)) {
            activationMap.set(row.device_id, row);
          }
        });

        const mergedDevices: DeviceWithActivation[] = baseDevices.map(
          (device) => {
            const activation = activationMap.get(device.id);

            return {
              ...device,
              activation_code: activation?.activation_code ?? null,
              activation_is_used: activation?.is_used ?? null,
            };
          },
        );

        if (mounted) {
          setDevices(mergedDevices);
        }
      } catch (error) {
        console.error("Failed to load devices:", error);
        if (mounted) {
          setErrorMessage("Failed to load your devices.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDevices();

    return () => {
      mounted = false;
    };
  }, [router]);

  async function handleCopy(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 1800);
    } catch (error) {
      console.error("Copy failed:", error);
      alert("Failed to copy activation code.");
    }
  }

  if (loading) {
    return (
      <main className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm dark:border-white/10 dark:bg-white/5">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-blue-600">
          Owner Portal
        </p>
        <h1 className="text-5xl font-black tracking-tight">
          Loading devices...
        </h1>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-blue-600">
              Owner Portal
            </p>
            <h1 className="text-5xl font-black tracking-tight">My Devices</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              View all AquaSync devices connected to your owner account, check
              status, and jump directly into the live dashboard.
            </p>
            {userEmail ? (
              <p className="mt-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
                Signed in as {userEmail}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/portal/dashboard"
              className="rounded-2xl border border-slate-300 bg-white px-6 py-4 font-bold transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            >
              Open Dashboard
            </Link>

            <Link
              href="/portal/profile"
              className="rounded-2xl border border-slate-300 bg-white px-6 py-4 font-bold transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            >
              Profile Settings
            </Link>

            <Link
              href="/portal/activate"
              className="rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white transition hover:bg-blue-700"
            >
              Activate Device
            </Link>
          </div>
        </div>
      </section>

      {errorMessage ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
          {errorMessage}
        </div>
      ) : null}

      {devices.length === 0 ? (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-white/10 dark:bg-white/5">
          <h2 className="mb-4 text-4xl font-black">No devices linked yet</h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            Your owner account is active, but there are no AquaSync devices
            connected yet.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/portal/activate"
              className="rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white transition hover:bg-blue-700"
            >
              Activate Device
            </Link>

            <Link
              href="/products"
              className="rounded-2xl border border-slate-300 px-8 py-4 font-bold text-slate-900 transition hover:bg-slate-50 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
            >
              Browse Products
            </Link>
          </div>
        </section>
      ) : (
        <>
          <section className="rounded-[2rem] border border-slate-200 bg-white px-6 py-5 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Linked Devices
                </p>
                <h2 className="mt-2 text-3xl font-black">
                  {devices.length} device{devices.length > 1 ? "s" : ""} found
                </h2>
              </div>

              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 dark:bg-white/5 dark:text-slate-300">
                Multi-device owner view
              </div>
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {devices.map((device) => {
              const isInactive = device.activation_status !== "ACTIVE";
              const code = device.activation_code ?? null;

              return (
                <div
                  key={device.id}
                  className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-white/10 dark:bg-white/5"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <span
                      className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] ${
                        device.activation_status === "ACTIVE"
                          ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                      }`}
                    >
                      {device.activation_status ?? "UNKNOWN"}
                    </span>

                    <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">
                      {new Date(device.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="mb-3 break-all text-2xl font-black">
                    {device.device_uuid}
                  </h3>

                  <div className="space-y-3 text-slate-600 dark:text-slate-300">
                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Location
                      </p>
                      <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                        {device.installation_location || "Not assigned"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Firmware
                      </p>
                      <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                        {device.firmware_version || "1.0.0"}
                      </p>
                    </div>

                    {isInactive ? (
                      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/20 dark:bg-blue-500/10">
                        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-blue-600 dark:text-blue-300">
                          Activation Code
                        </p>
                        <p className="mt-2 break-all text-xl font-black text-slate-950 dark:text-white">
                          {code || "Code not found"}
                        </p>

                        {code ? (
                          <div className="mt-4 flex flex-wrap gap-3">
                            <button
                              onClick={() => handleCopy(code)}
                              className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                            >
                              {copiedCode === code ? "Copied" : "Copy Code"}
                            </button>

                            <Link
                              href={`/portal/activate?code=${encodeURIComponent(code)}`}
                              className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                            >
                              Activate Now
                            </Link>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href={`/portal/dashboard?device=${device.id}`}
                      className="flex-1 rounded-2xl bg-slate-900 px-5 py-4 text-center font-bold text-white transition hover:bg-black dark:bg-white dark:text-slate-950"
                    >
                      Open Dashboard
                    </Link>

                    <Link
                      href="/portal/profile"
                      className="rounded-2xl border border-slate-300 px-5 py-4 text-center font-bold transition hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/10"
                    >
                      Owner
                    </Link>
                  </div>
                </div>
              );
            })}
          </section>
        </>
      )}
    </main>
  );
}
