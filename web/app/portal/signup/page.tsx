"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/auth/browser";

export default function PortalSignupPage() {
  const router = useRouter();
  const supabaseBrowser = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [fullName, setFullName] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSignup = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const normalizedEmail = email.trim().toLowerCase();

      if (
        !normalizedEmail ||
        !password.trim() ||
        !phoneNumber.trim() ||
        !address.trim()
      ) {
        setErrorMessage(
          "Email, password, mobile number, and address are required.",
        );
        return;
      }

      const { data, error } = await supabaseBrowser.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: fullName.trim() || null,
            phone_number: phoneNumber.trim(),
            address: address.trim(),
            postal_code: postalCode.trim() || null,
            profile_image_url: profileImageUrl.trim() || null,
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      const userId = data.user?.id;

      if (userId) {
        const { error: profileError } = await supabaseBrowser
          .from("profiles")
          .upsert(
            [
              {
                id: userId,
                email: normalizedEmail,
                full_name: fullName.trim() || null,
                phone_number: phoneNumber.trim(),
                address: address.trim(),
                postal_code: postalCode.trim() || null,
                profile_image_url: profileImageUrl.trim() || null,
              },
            ],
            { onConflict: "id" },
          );

        if (profileError) {
          setErrorMessage(profileError.message);
          return;
        }
      }

      setSuccessMessage(
        "Owner account created successfully. You can now sign in and activate your device.",
      );

      setTimeout(() => {
        router.push("/portal/login");
      }, 1000);
    } catch (err) {
      console.error("Signup failed:", err);
      setErrorMessage("An unexpected error occurred during signup.");
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
          <p className="mb-3 text-xs font-black uppercase tracking-widest text-blue-600">
            Identity Registration
          </p>
          <h1 className="mb-4 text-4xl font-black tracking-tight md:text-5xl">
            Join AquaSync
          </h1>
          <p className="text-sm leading-relaxed text-slate-500 md:text-base">
            Create your owner account to activate devices, manage profile
            details, and access live telemetry through the AquaSync portal.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">
              Email Address *
            </span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white"
              placeholder="name@example.com"
              type="email"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">
              Password *
            </span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white"
              placeholder="Create secure password"
              type="password"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">
              Mobile Number *
            </span>
            <input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white"
              placeholder="Enter mobile number"
              type="text"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">
              Full Name
            </span>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white"
              placeholder="Enter full name"
              type="text"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">
              Address *
            </span>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white"
              placeholder="Enter address"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">
              Postal Code
            </span>
            <input
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white"
              placeholder="Enter postal code"
              type="text"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">
              Profile Image URL
            </span>
            <input
              value={profileImageUrl}
              onChange={(e) => setProfileImageUrl(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white"
              placeholder="Paste image URL"
              type="text"
            />
          </label>
        </div>

        <button
          onClick={handleSignup}
          disabled={
            loading ||
            !email.trim() ||
            !password.trim() ||
            !phoneNumber.trim() ||
            !address.trim()
          }
          className="mt-6 w-full rounded-2xl bg-blue-600 px-5 py-4 font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Registering..." : "Create Owner Account"}
        </button>

        {successMessage ? (
          <div className="mt-6 rounded-2xl border border-green-100 bg-green-50 p-4 text-sm font-bold text-green-700">
            {successMessage}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-8 border-t border-slate-100 pt-8 text-center space-y-3">
          <Link
            href="/portal/login"
            className="block text-sm font-bold text-slate-400 transition hover:text-blue-600"
          >
            Already have an account?{" "}
            <span className="text-blue-600">Sign in</span>
          </Link>

          <Link
            href="/products"
            className="block text-sm font-bold text-slate-400 transition hover:text-blue-600"
          >
            Continue browsing products
          </Link>
        </div>
      </div>
    </main>
  );
}
