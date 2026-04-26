"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/auth/client";

type PurchaseButtonProps = {
  productId: string;
  productName: string;
  price: string;
  modelCode?: string;
};

type PurchaseFormState = {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  postalCode: string;
};

type GuestStage = "email" | "signin" | "create";

const initialForm: PurchaseFormState = {
  email: "",
  password: "",
  fullName: "",
  phoneNumber: "",
  address: "",
  postalCode: "",
};

function normalizeBangladeshPhone(input: string) {
  const raw = input.trim().replace(/[^\d+]/g, "");

  if (/^\+8801\d{9}$/.test(raw)) return raw;
  if (/^8801\d{9}$/.test(raw)) return `+${raw}`;
  if (/^01\d{9}$/.test(raw)) return `+88${raw}`;

  return null;
}

export default function PurchaseButton({
  productId,
  productName,
  price,
  modelCode,
}: PurchaseButtonProps) {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  const [sessionLoading, setSessionLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState("");

  const [form, setForm] = useState(initialForm);
  const [guestStage, setGuestStage] = useState<GuestStage>("email");

  const [checkingEmail, setCheckingEmail] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [inlineError, setInlineError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let alive = true;

    async function loadSession() {
      try {
        const {
          data: { user },
        } = await supabaseBrowser.auth.getUser();

        if (!alive) return;

        setCurrentUserId(user?.id ?? null);
        setCurrentUserEmail(user?.email ?? "");
      } catch (error) {
        console.error("Failed to load session:", error);
      } finally {
        if (alive) {
          setSessionLoading(false);
        }
      }
    }

    loadSession();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const normalizedPhone = useMemo(
    () => normalizeBangladeshPhone(form.phoneNumber),
    [form.phoneNumber],
  );

  const isSignedIn = !!currentUserId;
  const isBusy =
    checkingEmail || authenticating || submitting || sessionLoading;

  function updateField(key: keyof PurchaseFormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function resetAndClose() {
    setForm(initialForm);
    setGuestStage("email");
    setCheckingEmail(false);
    setAuthenticating(false);
    setSubmitting(false);
    setInlineError("");
    setOpen(false);
  }

  async function refreshSession() {
    const {
      data: { user },
    } = await supabaseBrowser.auth.getUser();

    setCurrentUserId(user?.id ?? null);
    setCurrentUserEmail(user?.email ?? "");
    return user;
  }

  async function runPurchaseWithUser(userId: string, ownerEmail?: string) {
    const response = await fetch("/api/purchase", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId,
        productName,
        price,
        modelCode: modelCode ?? null,
        userId,
        address: form.address.trim(),
        postalCode: form.postalCode.trim(),
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.error || "Purchase failed");
    }

    const query = new URLSearchParams({
      product: result.productName || productName,
      code: result.activationCode,
      email: result.ownerEmail || ownerEmail || currentUserEmail,
      device: result.deviceUuid,
    });

    resetAndClose();
    router.push(`/checkout/success?${query.toString()}`);
    router.refresh();
  }

  async function handleSignedInPurchase() {
    if (!form.address.trim()) {
      setInlineError("Enter installation address.");
      return;
    }

    try {
      setSubmitting(true);
      setInlineError("");
      await runPurchaseWithUser(currentUserId!, currentUserEmail);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      setInlineError(message);
      setSubmitting(false);
    }
  }

  async function checkOwnerByEmail() {
    const normalizedEmail = form.email.trim().toLowerCase();

    if (!normalizedEmail) {
      setInlineError("Enter email.");
      return;
    }

    if (!form.address.trim()) {
      setInlineError("Enter installation address.");
      return;
    }

    try {
      setCheckingEmail(true);
      setInlineError("");

      const response = await fetch(
        `/api/owner-exists?email=${encodeURIComponent(normalizedEmail)}`,
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Failed to check owner account.");
      }

      setGuestStage(result.exists ? "signin" : "create");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      setInlineError(message);
    } finally {
      setCheckingEmail(false);
    }
  }

  async function handleExistingOwnerSignInAndPurchase() {
    const normalizedEmail = form.email.trim().toLowerCase();

    if (!normalizedEmail) {
      setInlineError("Enter email.");
      return;
    }

    if (!form.password.trim()) {
      setInlineError("Enter password.");
      return;
    }

    if (!form.address.trim()) {
      setInlineError("Enter installation address.");
      return;
    }

    try {
      setAuthenticating(true);
      setInlineError("");

      const { error } = await supabaseBrowser.auth.signInWithPassword({
        email: normalizedEmail,
        password: form.password,
      });

      if (error) {
        throw new Error(error.message);
      }

      const user = await refreshSession();

      if (!user?.id) {
        throw new Error("Could not verify signed-in owner.");
      }

      await runPurchaseWithUser(user.id, user.email || normalizedEmail);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Authentication failed";
      setInlineError(message);
      setAuthenticating(false);
      setSubmitting(false);
    }
  }

  async function handleCreateAndPurchase() {
    const normalizedEmail = form.email.trim().toLowerCase();

    if (!normalizedEmail) {
      setInlineError("Enter email.");
      return;
    }

    if (!form.password.trim() || form.password.length < 6) {
      setInlineError("Password must be at least 6 characters.");
      return;
    }

    if (!normalizedPhone) {
      setInlineError("Enter a valid BD mobile number.");
      return;
    }

    if (!form.address.trim()) {
      setInlineError("Enter installation address.");
      return;
    }

    try {
      setSubmitting(true);
      setInlineError("");

      const response = await fetch("/api/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          productName,
          price,
          modelCode: modelCode ?? null,
          email: normalizedEmail,
          password: form.password,
          fullName: form.fullName.trim(),
          phoneNumber: normalizedPhone,
          address: form.address.trim(),
          postalCode: form.postalCode.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Purchase failed");
      }

      const query = new URLSearchParams({
        product: result.productName || productName,
        code: result.activationCode,
        email: result.ownerEmail || normalizedEmail,
        device: result.deviceUuid,
      });

      resetAndClose();
      router.push(`/checkout/success?${query.toString()}`);
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      setInlineError(message);
      setSubmitting(false);
    }
  }

  async function handlePrimaryAction() {
    if (sessionLoading) return;

    if (isSignedIn) {
      await handleSignedInPurchase();
      return;
    }

    if (guestStage === "email") {
      await checkOwnerByEmail();
      return;
    }

    if (guestStage === "signin") {
      await handleExistingOwnerSignInAndPurchase();
      return;
    }

    await handleCreateAndPurchase();
  }

  function renderGuestRightPanel() {
    if (guestStage === "signin") {
      return (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">
              Returning owner
            </div>
            <div className="mt-2 break-all text-lg font-black text-slate-950">
              {form.email.trim().toLowerCase()}
            </div>
          </div>

          <input
            type="password"
            value={form.password}
            onChange={(e) => updateField("password", e.target.value)}
            placeholder="Password"
            className="w-full rounded-2xl border border-slate-300 bg-[#f4efb7] px-5 py-4 text-base outline-none transition focus:border-blue-500"
          />

          <button
            type="button"
            onClick={() => {
              setGuestStage("email");
              setInlineError("");
              updateField("password", "");
            }}
            className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Change Email
          </button>
        </div>
      );
    }

    if (guestStage === "create") {
      return (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-600">
              New account
            </div>
            <div className="mt-2 break-all text-lg font-black text-slate-950">
              {form.email.trim().toLowerCase()}
            </div>
          </div>

          <input
            type="password"
            value={form.password}
            onChange={(e) => updateField("password", e.target.value)}
            placeholder="Password"
            className="w-full rounded-2xl border border-slate-300 bg-[#f4efb7] px-5 py-4 text-base outline-none transition focus:border-blue-500"
          />

          <input
            type="tel"
            value={form.phoneNumber}
            onChange={(e) => updateField("phoneNumber", e.target.value)}
            placeholder="Mobile number"
            className="w-full rounded-2xl border border-slate-300 px-5 py-4 text-base outline-none transition focus:border-blue-500"
          />

          <input
            type="text"
            value={form.fullName}
            onChange={(e) => updateField("fullName", e.target.value)}
            placeholder="Full name"
            className="w-full rounded-2xl border border-slate-300 px-5 py-4 text-base outline-none transition focus:border-blue-500"
          />
        </div>
      );
    }

    return (
      <div className="relative h-full min-h-[260px] overflow-hidden rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top,#ffffff_0%,#f8fbff_48%,#f4f7fb_100%)] p-6">
        <div className="absolute inset-0 opacity-60">
          <div className="absolute -left-10 top-6 h-28 w-28 rounded-full bg-blue-100 blur-3xl" />
          <div className="absolute right-0 top-20 h-24 w-24 rounded-full bg-slate-100 blur-2xl" />
          <div className="absolute bottom-4 left-10 h-20 w-20 rounded-full bg-indigo-50 blur-2xl" />
        </div>

        <div className="relative flex h-full flex-col justify-between">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-blue-100 bg-white text-blue-600 shadow-sm">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6l4 2"
                  />
                </svg>
              </span>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.26em] text-slate-400">
                  Ready
                </div>
                <div className="text-sm font-medium text-slate-500">
                  We’ll shape the rest.
                </div>
              </div>
            </div>

            <div className="rounded-[22px] border border-white/70 bg-white/80 p-4 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset] backdrop-blur-sm">
              <div className="space-y-3">
                <div className="h-2.5 w-24 rounded-full bg-slate-200/90 animate-pulse" />
                <div className="h-11 w-full rounded-2xl bg-slate-100/95 animate-pulse" />
                <div className="h-11 w-full rounded-2xl bg-slate-100/95 animate-pulse [animation-delay:120ms]" />
                <div className="h-11 w-3/4 rounded-2xl bg-slate-100/95 animate-pulse [animation-delay:240ms]" />
              </div>
            </div>
          </div>

          <div className="relative mt-8 flex items-center gap-3 rounded-2xl border border-white/70 bg-white/70 px-4 py-3 backdrop-blur-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-500" />
            </span>
            <span className="text-sm font-medium text-slate-500">
              Continue to reveal the next layer.
            </span>
          </div>
        </div>
      </div>
    );
  }

  function renderPrimaryLabel() {
    if (sessionLoading) return "Loading";
    if (isSignedIn) return submitting ? "Completing..." : "Complete Purchase";
    if (guestStage === "email")
      return checkingEmail ? "Checking..." : "Continue";
    if (guestStage === "signin")
      return authenticating ? "Signing In..." : "Sign In & Purchase";
    return submitting ? "Creating..." : "Create & Purchase";
  }

  const modal = open ? (
    <div
      className="fixed inset-0 z-[1000] overflow-y-auto bg-black/45"
      onClick={(e) => {
        if (e.target === e.currentTarget) resetAndClose();
      }}
    >
      <div className="min-h-screen px-4 py-8 md:px-8 md:py-12">
        <div
          className="mx-auto w-full max-w-4xl rounded-[32px] border border-slate-200 bg-white shadow-2xl transition-all duration-300"
          style={{ boxSizing: "border-box", willChange: "transform, opacity" }}
        >
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-6 md:px-8">
            <div className="min-w-0 flex-1">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.35em] text-blue-600">
                Purchase
              </p>
              <h2 className="text-3xl font-black leading-tight text-slate-950 md:text-5xl">
                {productName}
              </h2>
            </div>

            <button
              type="button"
              onClick={resetAndClose}
              className="shrink-0 rounded-2xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Close
            </button>
          </div>

          <div className="px-6 py-6 md:px-8 md:py-8">
            <div className="grid gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-5 md:grid-cols-3">
              <div className="min-w-0">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
                  Product
                </p>
                <p className="text-2xl font-black text-slate-950">
                  {productName}
                </p>
              </div>

              <div className="min-w-0">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
                  Price
                </p>
                <p className="text-2xl font-black text-slate-950">{price}</p>
              </div>

              <div className="min-w-0">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
                  Model
                </p>
                <p className="text-2xl font-black text-slate-950">
                  {modelCode || "AquaSync"}
                </p>
              </div>
            </div>

            {inlineError ? (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
                {inlineError}
              </div>
            ) : null}

            {isSignedIn ? (
              <div className="mt-6 grid gap-5 md:grid-cols-[1fr_1.2fr]">
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 transition-all duration-300">
                  <p className="text-sm text-slate-500">Account</p>
                  <p className="mt-3 break-all text-2xl font-black text-slate-950">
                    {currentUserEmail}
                  </p>
                </div>

                <div className="space-y-4 rounded-[24px] border border-slate-200 bg-white p-1 transition-all duration-300">
                  <input
                    type="text"
                    value={form.postalCode}
                    onChange={(e) => updateField("postalCode", e.target.value)}
                    placeholder="Postal code"
                    className="w-full rounded-2xl border border-slate-300 px-5 py-4 text-base outline-none transition focus:border-blue-500"
                  />

                  <textarea
                    value={form.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    placeholder="Installation address"
                    rows={6}
                    className="w-full rounded-2xl border border-slate-300 px-5 py-4 text-base outline-none transition focus:border-blue-500"
                  />
                </div>
              </div>
            ) : (
              <div className="mt-6 grid gap-5 md:grid-cols-[1.08fr_0.92fr]">
                <div className="space-y-4 rounded-[24px] border border-slate-200 bg-white p-1 transition-all duration-300">
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="Email"
                    readOnly={guestStage !== "email"}
                    className={`w-full rounded-2xl border px-5 py-4 text-base outline-none transition ${
                      guestStage === "email"
                        ? "border-slate-300 focus:border-blue-500"
                        : "border-slate-200 bg-slate-50 text-slate-700"
                    }`}
                  />

                  <input
                    type="text"
                    value={form.postalCode}
                    onChange={(e) => updateField("postalCode", e.target.value)}
                    placeholder="Postal code"
                    className="w-full rounded-2xl border border-slate-300 px-5 py-4 text-base outline-none transition focus:border-blue-500"
                  />

                  <textarea
                    value={form.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    placeholder="Installation address"
                    rows={6}
                    className="w-full rounded-2xl border border-slate-300 px-5 py-4 text-base outline-none transition focus:border-blue-500"
                  />
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 transition-all duration-300">
                  <div className="transition-all duration-300">
                    {renderGuestRightPanel()}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handlePrimaryAction}
                disabled={isBusy}
                className="rounded-2xl bg-blue-600 px-8 py-4 text-base font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {renderPrimaryLabel()}
              </button>

              <button
                type="button"
                onClick={resetAndClose}
                disabled={checkingEmail || authenticating || submitting}
                className="rounded-2xl border border-slate-300 px-8 py-4 text-base font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl bg-[#071338] px-6 py-4 text-base font-bold text-white transition hover:opacity-95"
      >
        {sessionLoading
          ? "Purchase"
          : isSignedIn
            ? "Buy Another Device"
            : "Purchase"}
      </button>

      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}
