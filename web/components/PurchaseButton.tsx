"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

type PurchaseButtonProps = {
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
  productName,
  price,
  modelCode,
}: PurchaseButtonProps) {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  const updateField = (key: keyof PurchaseFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetAndClose = () => {
    setForm(initialForm);
    setSubmitting(false);
    setOpen(false);
  };

  const handlePurchase = async () => {
    if (!form.email.trim()) {
      alert("Email is required.");
      return;
    }

    if (!form.password.trim() || form.password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    if (!normalizedPhone) {
      alert("Please enter a valid Bangladesh mobile number, e.g. 01814511111");
      return;
    }

    if (!form.address.trim()) {
      alert("Address is required.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch("/api/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productName,
          price,
          modelCode: modelCode ?? null,
          email: form.email.trim(),
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
        email: result.ownerEmail,
        device: result.deviceUuid,
      });

      resetAndClose();
      router.push(`/checkout/success?${query.toString()}`);
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      alert(message);
      setSubmitting(false);
    }
  };

  const modal = open ? (
    <div
      className="fixed inset-0 z-[1000] overflow-y-auto bg-black/45"
      onClick={(e) => {
        if (e.target === e.currentTarget) resetAndClose();
      }}
    >
      <div className="min-h-screen px-4 py-8 md:px-8 md:py-12">
        <div
          className="mx-auto w-full max-w-5xl rounded-[32px] border border-slate-200 bg-white shadow-2xl"
          style={{ boxSizing: "border-box", willChange: "transform" }}
        >
          <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-6 md:flex-row md:items-start md:justify-between md:px-8">
            <div className="min-w-0 flex-1">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.35em] text-blue-600">
                Owner Registration During Purchase
              </p>
              <h2 className="text-3xl font-black leading-tight text-slate-950 md:text-5xl">
                Complete purchase for {productName}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-lg">
                Since you are not signed in, AquaSync will create your owner
                account first, then connect this purchased device to that
                account automatically.
              </p>
            </div>

            <button
              type="button"
              onClick={resetAndClose}
              className="shrink-0 self-start rounded-2xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Close
            </button>
          </div>

          <div className="px-6 py-6 md:px-8 md:py-8">
            <div className="grid gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-5 lg:grid-cols-3">
              <div className="min-w-0">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
                  Product
                </p>
                <p className="text-2xl font-black text-slate-950">
                  {productName}
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-600">
                  Price: {price}
                </p>
              </div>

              <div className="min-w-0">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
                  Flow
                </p>
                <p className="text-sm font-semibold leading-7 text-slate-700">
                  Create owner → Purchase → Generate activation code
                </p>
              </div>

              <div className="min-w-0">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
                  Portal Access
                </p>
                <p className="text-sm font-semibold leading-7 text-slate-700">
                  Device appears in your owner portal after activation
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-2">
              <div className="min-w-0">
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
                  Owner Account
                </p>

                <div className="space-y-4">
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="Owner email"
                    className="w-full rounded-2xl border border-slate-300 px-5 py-4 text-base outline-none transition focus:border-blue-500"
                  />

                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    placeholder="Password"
                    className="w-full rounded-2xl border border-slate-300 bg-[#f4efb7] px-5 py-4 text-base outline-none transition focus:border-blue-500"
                  />

                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    placeholder="Full name (optional)"
                    className="w-full rounded-2xl border border-slate-300 px-5 py-4 text-base outline-none transition focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="min-w-0">
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
                  Contact & Installation
                </p>

                <div className="space-y-4">
                  <div>
                    <input
                      type="tel"
                      value={form.phoneNumber}
                      onChange={(e) =>
                        updateField("phoneNumber", e.target.value)
                      }
                      placeholder="Mobile number (e.g. 01814511111)"
                      className="w-full rounded-2xl border border-slate-300 px-5 py-4 text-base outline-none transition focus:border-blue-500"
                    />
                    <p
                      className={`mt-2 text-sm ${
                        normalizedPhone ? "text-emerald-600" : "text-slate-500"
                      }`}
                    >
                      {normalizedPhone
                        ? `Will be saved as ${normalizedPhone}`
                        : "Use 11-digit BD number, e.g. 01814511111"}
                    </p>
                  </div>

                  <input
                    type="text"
                    value={form.postalCode}
                    onChange={(e) => updateField("postalCode", e.target.value)}
                    placeholder="Postal code (optional)"
                    className="w-full rounded-2xl border border-slate-300 px-5 py-4 text-base outline-none transition focus:border-blue-500"
                  />

                  <textarea
                    value={form.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    placeholder="Installation address"
                    rows={5}
                    className="w-full rounded-2xl border border-slate-300 px-5 py-4 text-base outline-none transition focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handlePurchase}
                disabled={submitting}
                className="rounded-2xl bg-blue-600 px-8 py-4 text-base font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting
                  ? "Creating owner & purchasing..."
                  : "Confirm Purchase"}
              </button>

              <button
                type="button"
                onClick={resetAndClose}
                disabled={submitting}
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
        Purchase & Create Owner Account
      </button>

      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}
