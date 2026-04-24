"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/auth/client";

type PurchaseButtonProps = {
  productId: string;
  productName: string;
};

export default function PurchaseButton({
  productId,
  productName,
}: PurchaseButtonProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [showGuestForm, setShowGuestForm] = useState(false);

  const [ownerEmail, setOwnerEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [fullName, setFullName] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        const {
          data: { user },
        } = await supabaseBrowser.auth.getUser();

        if (mounted) {
          setCurrentUserId(user?.id ?? null);
        }
      } catch (error) {
        console.error("Session check failed:", error);
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    }

    checkSession();

    return () => {
      mounted = false;
    };
  }, []);

  const submitPurchase = async (payload: Record<string, unknown>) => {
    try {
      setLoading(true);

      const response = await fetch("/api/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Purchase failed");
        return;
      }

      router.push(
        `/checkout/success?product=${encodeURIComponent(
          productName,
        )}&code=${encodeURIComponent(result.activationCode)}`,
      );
    } catch (error) {
      console.error("Purchase failed:", error);
      alert("Something went wrong while simulating purchase.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrimaryPurchase = async () => {
    if (checkingSession || loading) return;

    // Logged-in owner → buy directly
    if (currentUserId) {
      await submitPurchase({
        productId,
        productName,
        userId: currentUserId,
      });
      return;
    }

    // Guest user → open owner creation form
    setShowGuestForm(true);
  };

  const handleGuestPurchase = async () => {
    if (
      !ownerEmail.trim() ||
      !password.trim() ||
      !phoneNumber.trim() ||
      !address.trim()
    ) {
      alert("Email, password, mobile number, and address are required.");
      return;
    }

    await submitPurchase({
      productId,
      productName,
      ownerEmail: ownerEmail.trim().toLowerCase(),
      password,
      phoneNumber: phoneNumber.trim(),
      address: address.trim(),
      fullName: fullName.trim() || null,
      postalCode: postalCode.trim() || null,
      profileImageUrl: profileImageUrl.trim() || null,
    });
  };

  return (
    <div className="w-full">
      <button
        onClick={handlePrimaryPurchase}
        disabled={loading || checkingSession}
        className="mb-3 w-full rounded-2xl bg-slate-900 py-4 font-bold text-white transition hover:bg-black disabled:opacity-60"
      >
        {checkingSession
          ? "Checking account..."
          : loading
            ? "Processing..."
            : currentUserId
              ? "Simulate Purchase"
              : "Purchase & Create Owner Account"}
      </button>

      {!showGuestForm ? null : (
        <div className="mt-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-blue-600">
              Owner Registration During Purchase
            </p>
            <h3 className="text-2xl font-black text-slate-950">
              Complete purchase for {productName}
            </h3>
            <p className="mt-2 text-slate-600">
              Since you are not signed in, we will create your owner account and
              link this device to it automatically.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="email"
              placeholder="Email address *"
              value={ownerEmail}
              onChange={(e) => setOwnerEmail(e.target.value)}
              className="rounded-2xl border border-slate-300 px-5 py-4 outline-none focus:border-blue-500"
            />

            <input
              type="password"
              placeholder="Password *"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-2xl border border-slate-300 px-5 py-4 outline-none focus:border-blue-500"
            />

            <input
              type="text"
              placeholder="Mobile number *"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="rounded-2xl border border-slate-300 px-5 py-4 outline-none focus:border-blue-500"
            />

            <input
              type="text"
              placeholder="Full name (optional)"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="rounded-2xl border border-slate-300 px-5 py-4 outline-none focus:border-blue-500"
            />

            <input
              type="text"
              placeholder="Postal code (optional)"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="rounded-2xl border border-slate-300 px-5 py-4 outline-none focus:border-blue-500"
            />

            <input
              type="text"
              placeholder="Profile image URL (optional)"
              value={profileImageUrl}
              onChange={(e) => setProfileImageUrl(e.target.value)}
              className="rounded-2xl border border-slate-300 px-5 py-4 outline-none focus:border-blue-500"
            />

            <textarea
              placeholder="Address *"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="md:col-span-2 min-h-[120px] rounded-2xl border border-slate-300 px-5 py-4 outline-none focus:border-blue-500"
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={handleGuestPurchase}
              disabled={loading}
              className="rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Creating owner & purchasing..." : "Confirm Purchase"}
            </button>

            <button
              onClick={() => setShowGuestForm(false)}
              disabled={loading}
              className="rounded-2xl border border-slate-300 bg-white px-6 py-4 font-bold text-slate-900 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
