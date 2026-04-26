"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/auth/client";

export default function PortalLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const safeNext = useMemo(() => {
    const next = searchParams.get("next") || "/portal/dashboard";
    return next.startsWith("/") ? next : "/portal/dashboard";
  }, [searchParams]);

  useEffect(() => {
    const emailFromQuery = searchParams.get("email") || "";
    if (emailFromQuery) {
      setEmail(emailFromQuery);
    }
  }, [searchParams]);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const normalizedEmail = email.trim().toLowerCase();

      if (!normalizedEmail || !password.trim()) {
        setErrorMessage("Email and password are required.");
        return;
      }

      const { error } = await supabaseBrowser.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setSuccessMessage("Login successful. Redirecting...");

      setTimeout(() => {
        router.push(safeNext);
        router.refresh();
      }, 700);
    } catch (error) {
      console.error("Portal login failed:", error);
      setErrorMessage("Authentication failed. Please check your network.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) {
      await handleLogin();
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f8fc] px-6 py-20 text-slate-900">
      <div className="mx-auto w-full max-w-md rounded-[2.5rem] border border-slate-200 bg-white p-10 shadow-xl">
        <Link
          href="/"
          className="text-sm font-bold text-slate-400 transition hover:text-blue-600"
        >
          ← Back to Marketing
        </Link>

        <div className="mb-10 mt-8">
          <p className="mb-3 text-xs font-black uppercase tracking-widest text-blue-600">
            Secure Access
          </p>
          <h1 className="mb-4 text-4xl font-black tracking-tight text-slate-900">
            Owner Portal
          </h1>
          <p className="text-sm leading-relaxed text-slate-500">
            Sign in to manage your activated AquaSync devices, view live
            telemetry, check alerts, and continue your ownership experience.
          </p>

          {searchParams.get("email") ? (
            <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-blue-700">
              Owner account found. Sign in to continue.
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <p className="px-2 text-[10px] font-black uppercase text-slate-400">
              Email Address
            </p>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white"
              placeholder="name@example.com"
              type="email"
            />
          </div>

          <div className="space-y-1">
            <p className="px-2 text-[10px] font-black uppercase text-slate-400">
              Password
            </p>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white"
              placeholder="••••••••"
              type="password"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading || !email.trim() || !password.trim()}
            className="w-full rounded-2xl bg-slate-900 px-5 py-4 font-black text-white shadow-lg transition hover:bg-black disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </div>

        {successMessage ? (
          <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-700">
            {successMessage}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-10 space-y-3 border-t border-slate-100 pt-8 text-center">
          <Link
            href="/portal/signup"
            className="block text-sm font-bold text-slate-400 transition hover:text-blue-600"
          >
            Don&apos;t have an account?{" "}
            <span className="text-blue-600">Create one</span>
          </Link>

          <Link
            href="/portal/activate"
            className="block text-sm font-bold text-slate-400 transition hover:text-blue-600"
          >
            Already purchased a device?{" "}
            <span className="text-blue-600">Activate it here</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
