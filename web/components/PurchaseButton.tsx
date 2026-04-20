"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function PurchaseButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handlePurchase = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          productName,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        alert(result.error || "Purchase failed");
        return;
      }
      router.push(
        `/checkout/success?product=${encodeURIComponent(productName)}&code=${encodeURIComponent(result.activationCode)}`
      );
    } catch (error) {
      alert("Something went wrong while simulating purchase.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <button
      onClick={handlePurchase}
      disabled={loading}
      className="w-full rounded-2xl bg-slate-900 py-4 font-bold text-white transition hover:bg-black disabled:opacity-60 mb-3"
    >
      {loading ? "Processing..." : "Simulate Purchase"}
    </button>
  );
}
