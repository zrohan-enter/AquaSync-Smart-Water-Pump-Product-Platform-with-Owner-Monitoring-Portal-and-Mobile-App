"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/auth/client";

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone_number: string | null;
  address: string | null;
  postal_code: string | null;
  profile_image_url: string | null;
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
            "id, email, full_name, phone_number, address, postal_code, profile_image_url",
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
          setEmail(safeProfile.email ?? user.email ?? "");
        } else {
          // If no profile row exists yet, prefill minimal values from auth
          setFullName("");
          setPhoneNumber("");
          setAddress("");
          setPostalCode("");
          setProfileImageUrl("");
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

  const handleSave = async () => {
    try {
      if (!userId) {
        setErrorMessage("No authenticated user found.");
        return;
      }

      setSaving(true);
      setMessage("");
      setErrorMessage("");

      if (!phoneNumber.trim() || !address.trim()) {
        setErrorMessage("Mobile number and address are required.");
        return;
      }

      const payload = {
        id: userId,
        email: email.trim().toLowerCase() || null,
        full_name: fullName.trim() || null,
        phone_number: phoneNumber.trim(),
        address: address.trim(),
        postal_code: postalCode.trim() || null,
        profile_image_url: profileImageUrl.trim() || null,
      };

      const { error } = await supabaseBrowser
        .from("profiles")
        .upsert([payload], { onConflict: "id" });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setMessage("Profile updated successfully.");
    } catch (error) {
      console.error("Profile save failed:", error);
      setErrorMessage("Something went wrong while saving profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f6f8fc] px-6 py-20 text-slate-900">
        <div className="mx-auto max-w-3xl rounded-[2.5rem] border border-slate-200 bg-white p-10 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-600">
            Owner Profile
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight">
            Loading your profile...
          </h1>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f8fc] px-6 py-12 text-slate-900 md:px-10 lg:px-14">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-blue-600">
              Owner Portal
            </p>
            <h1 className="text-5xl font-black tracking-tight">
              Profile Settings
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              Manage your AquaSync owner identity, contact details, and address
              information. These details are used to connect purchases, devices,
              and ownership records inside the portal.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/portal/dashboard"
              className="rounded-2xl border border-slate-300 bg-white px-6 py-4 font-bold transition hover:bg-slate-50"
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

        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.6fr]">
          <section className="rounded-[2.25rem] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-slate-500">
              Profile Preview
            </p>

            <div className="flex flex-col items-center text-center">
              <div className="mb-6 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-3xl font-black text-slate-500">
                {profileImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profileImageUrl}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (
                    fullName?.trim()?.[0] ||
                    email?.trim()?.[0] ||
                    "A"
                  ).toUpperCase()
                )}
              </div>

              <h2 className="text-2xl font-black">
                {fullName || "AquaSync Owner"}
              </h2>
              <p className="mt-2 break-all text-slate-500">
                {email || "No email"}
              </p>

              <div className="mt-8 w-full space-y-4">
                <div className="rounded-2xl bg-slate-50 p-4 text-left">
                  <p className="text-sm text-slate-500">Mobile Number</p>
                  <p className="mt-1 text-lg font-bold">
                    {phoneNumber || "Not set"}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 text-left">
                  <p className="text-sm text-slate-500">Address</p>
                  <p className="mt-1 text-lg font-bold">
                    {address || "Not set"}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 text-left">
                  <p className="text-sm text-slate-500">Postal Code</p>
                  <p className="mt-1 text-lg font-bold">
                    {postalCode || "Not set"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2.25rem] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="mb-6 text-sm font-bold uppercase tracking-[0.25em] text-slate-500">
              Edit Profile
            </p>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-bold uppercase tracking-[0.12em] text-slate-500">
                  Email
                </span>
                <input
                  value={email}
                  disabled
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-500 outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold uppercase tracking-[0.12em] text-slate-500">
                  Full Name
                </span>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full rounded-2xl border border-slate-300 px-5 py-4 outline-none transition focus:border-blue-500"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold uppercase tracking-[0.12em] text-slate-500">
                  Mobile Number *
                </span>
                <input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter mobile number"
                  className="w-full rounded-2xl border border-slate-300 px-5 py-4 outline-none transition focus:border-blue-500"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold uppercase tracking-[0.12em] text-slate-500">
                  Postal Code
                </span>
                <input
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="Enter postal code"
                  className="w-full rounded-2xl border border-slate-300 px-5 py-4 outline-none transition focus:border-blue-500"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-bold uppercase tracking-[0.12em] text-slate-500">
                  Address *
                </span>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter address"
                  className="min-h-[120px] w-full rounded-2xl border border-slate-300 px-5 py-4 outline-none transition focus:border-blue-500"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-bold uppercase tracking-[0.12em] text-slate-500">
                  Profile Image URL
                </span>
                <input
                  value={profileImageUrl}
                  onChange={(e) => setProfileImageUrl(e.target.value)}
                  placeholder="Paste image URL"
                  className="w-full rounded-2xl border border-slate-300 px-5 py-4 outline-none transition focus:border-blue-500"
                />
              </label>
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
                className="rounded-2xl border border-slate-300 bg-white px-8 py-4 font-bold transition hover:bg-slate-50"
              >
                Cancel
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
