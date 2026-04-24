"use client";

import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/auth/client";

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await supabaseBrowser.auth.signOut();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className="rounded-2xl border border-slate-300 bg-white px-8 py-4 text-lg font-bold text-slate-900 transition hover:bg-slate-50"
    >
      Sign Out
    </button>
  );
}
