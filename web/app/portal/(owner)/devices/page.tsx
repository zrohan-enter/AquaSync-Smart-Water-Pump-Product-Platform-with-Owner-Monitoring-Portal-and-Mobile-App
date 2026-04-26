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

const forceWhiteText = {
  color: "#ffffff",
  WebkitTextFillColor: "#ffffff",
};

function formatDateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

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

        if (!mounted) return;
        setDevices(mergedDevices);
      } catch (error) {
        console.error("Failed to load devices:", error);
        setErrorMessage("Failed to load your devices.");
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
      window.setTimeout(() => {
        setCopiedCode((current) => (current === code ? null : current));
      }, 1500);
    } catch (error) {
      console.error("Copy failed:", error);
      setErrorMessage("Failed to copy activation code.");
    }
  }

  return (
    <main className="page-enter min-h-screen">
      {loading ? (
        <div className="space-y-6">
          <div className="glass-card rounded-[2.5rem] p-8">
            <div className="shimmer h-8 w-56 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
            <div className="mt-4 shimmer h-5 w-80 rounded-xl bg-slate-200/80 dark:bg-white/10" />
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="glass-card rounded-[2rem] p-7">
                <div className="shimmer h-8 w-24 rounded-full bg-slate-200/80 dark:bg-white/10" />
                <div className="mt-5 shimmer h-8 w-full rounded-2xl bg-slate-200/80 dark:bg-white/10" />
                <div className="mt-3 shimmer h-6 w-2/3 rounded-xl bg-slate-200/80 dark:bg-white/10" />
                <div className="mt-6 shimmer h-20 w-full rounded-[1.25rem] bg-slate-200/80 dark:bg-white/10" />
                <div className="mt-4 shimmer h-20 w-full rounded-[1.25rem] bg-slate-200/80 dark:bg-white/10" />
                <div className="mt-4 shimmer h-28 w-full rounded-[1.25rem] bg-slate-200/80 dark:bg-white/10" />
                <div className="mt-5 shimmer h-14 w-full rounded-[1.25rem] bg-slate-200/80 dark:bg-white/10" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <section className="glass-card mb-6 rounded-[2.5rem] p-8">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="mb-3 text-xs font-black uppercase tracking-[0.28em] text-blue-600">
                  Owner Portal
                </p>
                <h1 className="font-display text-5xl font-black tracking-tight text-slate-950 dark:text-white">
                  My Devices
                </h1>
                <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                  View all AquaSync devices connected to your owner account,
                  check status, and jump directly into the live dashboard.
                </p>
                {userEmail ? (
                  <p className="mt-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
                    Signed in as {userEmail}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/portal/dashboard"
                  className="rounded-2xl border border-slate-300 bg-white px-6 py-4 font-bold text-slate-900 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                >
                  Open Dashboard
                </Link>

                <Link
                  href="/portal/profile"
                  className="rounded-2xl border border-slate-300 bg-white px-6 py-4 font-bold text-slate-900 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                >
                  Profile Settings
                </Link>

                <Link
                  href="/portal/activate"
                  className="rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white transition hover:bg-blue-700"
                  style={forceWhiteText}
                >
                  Activate Device
                </Link>
              </div>
            </div>
          </section>

          {errorMessage ? (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
              {errorMessage}
            </div>
          ) : null}

          {devices.length === 0 ? (
            <div className="glass-card rounded-[2.5rem] p-12 text-center">
              <h2 className="mb-4 text-4xl font-black text-slate-950 dark:text-white">
                No devices linked yet
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                Your owner account is active, but there are no AquaSync devices
                connected yet. Activate a purchased device to begin monitoring.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/portal/activate"
                  className="rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white transition hover:bg-blue-700"
                  style={forceWhiteText}
                >
                  Activate Device
                </Link>

                <Link
                  href="/products"
                  className="rounded-2xl border border-slate-300 bg-white px-8 py-4 font-bold text-slate-900 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                >
                  Browse Products
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="glass-card mb-6 rounded-[2rem] px-6 py-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                      Linked Devices
                    </p>
                    <h2 className="mt-2 text-3xl font-black text-slate-950 dark:text-white">
                      {devices.length} device{devices.length > 1 ? "s" : ""}{" "}
                      found
                    </h2>
                  </div>

                  <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 dark:bg-white/5 dark:text-slate-300">
                    Multi-device owner view
                  </div>
                </div>
              </div>

              <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {devices.map((device) => {
                  const code = device.activation_code ?? null;
                  const isInactive =
                    (device.activation_status || "").toUpperCase() !== "ACTIVE";

                  return (
                    <div
                      key={device.id}
                      className="glass-card rounded-[2rem] p-7 transition-all duration-300 hover:-translate-y-0.5"
                    >
                      <div className="mb-5 flex items-start justify-between gap-3">
                        <span
                          className={`inline-flex rounded-full px-4 py-2 text-sm font-black uppercase tracking-[0.16em] ${
                            isInactive
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                          }`}
                        >
                          {isInactive ? "Inactive" : "Active"}
                        </span>

                        <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                          {formatDateLabel(device.created_at)}
                        </span>
                      </div>

                      <h3 className="break-all text-[1.1rem] font-black leading-snug text-slate-950 dark:text-white">
                        {device.device_uuid}
                      </h3>

                      <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Location
                        </p>
                        <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                          {device.installation_location || "Not assigned"}
                        </p>
                      </div>

                      <div className="mt-4 rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Firmware
                        </p>
                        <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                          {device.firmware_version || "1.0.0"}
                        </p>
                      </div>

                      {isInactive ? (
                        <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/20 dark:bg-blue-500/10">
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
                                style={forceWhiteText}
                              >
                                Activate Now
                              </Link>
                            </div>
                          ) : null}
                        </div>
                      ) : null}

                      <div className="mt-6 flex flex-wrap gap-3">
                        <Link
                          href={`/portal/dashboard?device=${device.id}`}
                          className={`flex-1 rounded-2xl px-5 py-4 text-center font-bold transition ${
                            isInactive
                              ? "border border-slate-200 bg-slate-100 text-slate-400 dark:border-white/10 dark:bg-white/5 dark:text-slate-500"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                          style={!isInactive ? forceWhiteText : undefined}
                        >
                          Open Dashboard
                        </Link>

                        <Link
                          href="/portal/profile"
                          className="rounded-2xl border border-slate-300 bg-white px-5 py-4 text-center font-bold text-slate-900 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
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
        </>
      )}
    </main>
  );
}
