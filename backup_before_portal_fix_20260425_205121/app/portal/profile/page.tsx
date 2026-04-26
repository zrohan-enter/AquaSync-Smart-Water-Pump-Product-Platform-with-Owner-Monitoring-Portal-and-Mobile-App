"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/auth/client";
import ProfileAvatarUploader from "@/components/ProfileAvatarUploader";

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone_number: string | null;
  address: string | null;
  postal_code: string | null;
  profile_image_url: string | null;
  bio: string | null;
  timezone: string | null;
};

export default function ProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [bio, setBio] = useState("");
  const [timezone, setTimezone] = useState("Asia/Dhaka");

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        setLoading(true);
        setErrorMessage("");
        setMessage("");

        const {
          data: { user },
          error: userError,
        } = await supabaseBrowser.auth.getUser();

        if (userError || !user) {
          router.push("/portal/login");
          return;
        }

        if (!mounted) return;

        setUserId(user.id);
        setEmail(user.email ?? "");

        const { data: profile, error: profileError } = await supabaseBrowser
          .from("profiles")
          .select(
            "id, email, full_name, phone_number, address, postal_code, profile_image_url, bio, timezone",
          )
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          setErrorMessage(profileError.message);
          return;
        }

        const safeProfile = profile as ProfileRow | null;

        if (safeProfile) {
          setFullName(safeProfile.full_name ?? "");
          setPhoneNumber(safeProfile.phone_number ?? "");
          setAddress(safeProfile.address ?? "");
          setPostalCode(safeProfile.postal_code ?? "");
          setProfileImageUrl(safeProfile.profile_image_url ?? "");
          setBio(safeProfile.bio ?? "");
          setTimezone(safeProfile.timezone ?? "Asia/Dhaka");
          setEmail(safeProfile.email ?? user.email ?? "");
        }
      } catch (error) {
        console.error("Profile load failed:", error);
        setErrorMessage("Failed to load profile.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [router]);

  async function handleSave() {
    try {
      if (!userId) {
        setErrorMessage("No authenticated user found.");
        return;
      }

      setSaving(true);
      setMessage("");
      setErrorMessage("");

      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: userId,
          email,
          full_name: fullName,
          phone_number: phoneNumber,
          address,
          postal_code: postalCode,
          profile_image_url: profileImageUrl,
          bio,
          timezone,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result?.error || "Failed to save profile.");
        return;
      }

      setMessage("Profile updated successfully.");
    } catch (error) {
      console.error("Profile save failed:", error);
      setErrorMessage("Something went wrong while saving profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm dark:border-white/10 dark:bg-white/5">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-600">
          Owner Profile
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight">
          Loading your profile...
        </h1>
      </main>
    );
  }

  const initials = (
    fullName?.trim()?.[0] ||
    email?.trim()?.[0] ||
    "A"
  ).toUpperCase();

  return (
    <main className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-blue-600">
              Owner Portal
            </p>
            <h1 className="text-5xl font-black tracking-tight">
              Profile Settings
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              Manage identity, photo, contact details, and installation records.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/portal/dashboard"
              className="rounded-2xl border border-slate-300 bg-white px-6 py-4 font-bold transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            >
              Back to Dashboard
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

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.6fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
            Profile Preview
          </p>

          <ProfileAvatarUploader
            currentUrl={profileImageUrl}
            initials={initials}
            onUploaded={(url) => setProfileImageUrl(url)}
          />

          <div className="mt-6 text-center">
            <h2 className="text-2xl font-black">
              {fullName || "AquaSync Owner"}
            </h2>
            <p className="mt-2 break-all text-slate-500 dark:text-slate-400">
              {email || "No email"}
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Mobile Number
              </p>
              <p className="mt-1 text-lg font-bold">
                {phoneNumber || "Not set"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Address
              </p>
              <p className="mt-1 text-lg font-bold">{address || "Not set"}</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Timezone
              </p>
              <p className="mt-1 text-lg font-bold">
                {timezone || "Asia/Dhaka"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
          <p className="mb-6 text-sm font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
            Edit Profile
          </p>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Email
              </span>
              <input
                value={email}
                disabled
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-500 outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Full Name
              </span>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter full name"
                className="w-full rounded-2xl border border-slate-300 px-5 py-4 outline-none transition focus:border-blue-500 dark:border-white/10 dark:bg-white/5"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Mobile Number *
              </span>
              <input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter mobile number"
                className="w-full rounded-2xl border border-slate-300 px-5 py-4 outline-none transition focus:border-blue-500 dark:border-white/10 dark:bg-white/5"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Postal Code
              </span>
              <input
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="Enter postal code"
                className="w-full rounded-2xl border border-slate-300 px-5 py-4 outline-none transition focus:border-blue-500 dark:border-white/10 dark:bg-white/5"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Timezone
              </span>
              <input
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="Asia/Dhaka"
                className="w-full rounded-2xl border border-slate-300 px-5 py-4 outline-none transition focus:border-blue-500 dark:border-white/10 dark:bg-white/5"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Address *
              </span>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter address"
                className="min-h-[120px] w-full rounded-2xl border border-slate-300 px-5 py-4 outline-none transition focus:border-blue-500 dark:border-white/10 dark:bg-white/5"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Bio
              </span>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="A short owner profile or note..."
                className="min-h-[120px] w-full rounded-2xl border border-slate-300 px-5 py-4 outline-none transition focus:border-blue-500 dark:border-white/10 dark:bg-white/5"
              />
            </label>
          </div>

          {message ? (
            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-200">
              {message}
            </div>
          ) : null}

          {errorMessage ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
              {errorMessage}
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>

            <Link
              href="/portal/dashboard"
              className="rounded-2xl border border-slate-300 bg-white px-8 py-4 font-bold transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            >
              Cancel
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
