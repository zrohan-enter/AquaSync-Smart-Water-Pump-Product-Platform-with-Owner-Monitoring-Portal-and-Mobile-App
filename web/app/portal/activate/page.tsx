"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/auth/client";

export default function ActivatePage() {
  const [activationCode, setActivationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleActivate = async () => {
    try {
      setLoading(true);
      setMessage("");
      setErrorMessage("");

      const normalizedCode = activationCode.trim().toUpperCase();

      if (!normalizedCode) {
        setErrorMessage("Activation code is required.");
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabaseBrowser.auth.getUser();

      if (userError || !user) {
        setErrorMessage("Please sign in before activating your device.");
        return;
      }

      const response = await fetch("/api/activate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          activationCode: normalizedCode,
          userId: user.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error || "Activation failed.");
        return;
      }

      setMessage(
        "Activation successful. Your AquaSync device is now linked and ready for live monitoring. Redirecting to your dashboard...",
      );

      setTimeout(() => {
        router.push("/portal/dashboard");
      }, 1200);
    } catch (error) {
      console.error("Activation failed:", error);
      setErrorMessage("Something went wrong during activation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f8fc] px-6 py-20 text-slate-900">
      <div className="mx-auto w-full max-w-2xl rounded-[2.5rem] border border-slate-200 bg-white p-10 shadow-sm md:p-12">
        <Link
          href="/"
          className="text-sm font-bold text-blue-600 transition hover:opacity-80"
        >
          ← Back to Home
        </Link>

        <div className="mt-8 mb-10">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-blue-600">
            Activation Portal
          </p>

          <h1 className="mb-4 text-4xl font-black tracking-tight md:text-5xl">
            Link your AquaSync system
          </h1>

          <p className="text-lg leading-8 text-slate-600">
            Sign in with your owner account, then enter the activation code you
            received after purchase. Once activated, your device will unlock its
            connected ownership experience and begin appearing inside your owner
            dashboard.
          </p>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
            What happens after activation
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-4">
              <div className="mb-2 text-lg font-black">1. Device linked</div>
              <p className="text-sm leading-6 text-slate-600">
                Your purchased device is confirmed under your owner account.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-4">
              <div className="mb-2 text-lg font-black">
                2. Digital twin starts
              </div>
              <p className="text-sm leading-6 text-slate-600">
                The platform prepares telemetry tracking and ownership
                monitoring.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-4">
              <div className="mb-2 text-lg font-black">3. Dashboard opens</div>
              <p className="text-sm leading-6 text-slate-600">
                You can then view water level, motor state, alerts, and status.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-bold uppercase tracking-[0.15em] text-slate-500">
              Activation Code
            </span>
            <input
              value={activationCode}
              onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
              className="w-full rounded-2xl border border-slate-300 px-5 py-4 text-lg font-semibold tracking-[0.12em] uppercase outline-none transition focus:border-blue-500"
              placeholder="AC-XXXXXXXX"
            />
          </label>

          <button
            onClick={handleActivate}
            disabled={loading || !activationCode.trim()}
            className="w-full rounded-2xl bg-blue-600 px-5 py-4 text-lg font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Activating..." : "Activate Device"}
          </button>
        </div>

        {message ? (
          <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-green-700">
            {message}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            href="/portal/login"
            className="rounded-2xl border border-slate-300 bg-white px-6 py-4 text-center font-bold transition hover:bg-slate-50"
          >
            Sign in to Owner Portal
          </Link>

          <Link
            href="/products"
            className="rounded-2xl border border-slate-300 bg-white px-6 py-4 text-center font-bold transition hover:bg-slate-50"
          >
            Back to Products
          </Link>
        </div>
      </div>
    </main>
  );
}
