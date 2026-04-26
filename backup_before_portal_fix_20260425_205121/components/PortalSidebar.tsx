"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Cpu,
  UserCircle2,
  Home,
  LogOut,
  Sparkles,
} from "lucide-react";
import { supabaseBrowser } from "@/lib/auth/client";
import ThemeToggle from "@/components/ThemeToggle";
import { useState } from "react";

type SidebarProps = {
  user: {
    id: string;
    email: string;
    fullName: string;
    profileImageUrl: string;
  };
  open: boolean;
  onClose: () => void;
};

const navItems = [
  { href: "/portal/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portal/devices", label: "My Devices", icon: Cpu },
  { href: "/portal/profile", label: "Profile", icon: UserCircle2 },
];

export default function PortalSidebar({ user, open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const initials = (
    user.fullName?.trim()?.[0] ||
    user.email?.trim()?.[0] ||
    "A"
  ).toUpperCase();

  async function handleSignOut() {
    try {
      setSigningOut(true);
      await supabaseBrowser.auth.signOut();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Sign out failed:", error);
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm transition lg:hidden ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[300px] flex-col border-r border-slate-200 bg-white/95 px-5 py-5 shadow-xl backdrop-blur dark:border-white/10 dark:bg-[#0f172a]/95 lg:z-30 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300`}
      >
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/portal/dashboard"
            className="flex items-center gap-3"
            onClick={onClose}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-blue-600">
                AquaSync
              </p>
              <h2 className="text-lg font-black tracking-tight">
                Owner Portal
              </h2>
            </div>
          </Link>

          <div className="lg:hidden">
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold dark:border-white/10"
            >
              Close
            </button>
          </div>
        </div>

        <div className="mb-6 rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-xl font-black text-slate-700 dark:bg-white/10 dark:text-white">
              {user.profileImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.profileImageUrl}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-lg font-black">
                {user.fullName || "AquaSync Owner"}
              </p>
              <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 font-bold transition ${
                  active
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/5"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <Link
            href="/"
            className="flex items-center gap-3 rounded-2xl px-4 py-3 font-bold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/5"
          >
            <Home className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
        </nav>

        <div className="mt-auto space-y-3">
          <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <div className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
              Theme
            </div>
            <ThemeToggle />
          </div>

          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 font-bold text-slate-900 transition hover:bg-slate-50 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            {signingOut ? "Signing Out..." : "Sign Out"}
          </button>
        </div>
      </aside>
    </>
  );
}
