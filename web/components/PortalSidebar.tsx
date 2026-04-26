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
        className={`fixed left-0 top-0 z-50 flex h-screen w-[300px] flex-col px-5 py-5 shadow-2xl backdrop-blur-2xl ${
          open ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 lg:z-30 lg:translate-x-0`}
        style={{
          background: "var(--sidebar-bg)",
          borderRight: "1px solid var(--border)",
        }}
      >
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/portal/dashboard"
            className="flex items-center gap-3"
            onClick={onClose}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-[0_8px_24px_rgba(37,99,235,0.35)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-blue-500 dark:text-blue-400">
                AquaSync
              </p>
              <h2 className="font-display text-lg font-black tracking-tight">
                Owner Portal
              </h2>
            </div>
          </Link>

          <div className="lg:hidden">
            <button
              onClick={onClose}
              className="rounded-xl px-3 py-2 text-sm font-bold"
              style={{
                border: "1px solid var(--border)",
              }}
            >
              Close
            </button>
          </div>
        </div>

        <div
          className="mb-6 rounded-[24px] p-4"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full text-xl font-black"
              style={{
                background: "var(--surface-soft)",
                border: "1px solid var(--border)",
              }}
            >
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
              <p
                className="truncate text-lg font-black"
                style={{ color: "#0f172a" }}
              >
                {user.fullName || "AquaSync Owner"}
              </p>
              <p className="truncate text-sm text-muted">{user.email}</p>
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
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 font-bold transition-all duration-300 ${
                  active
                    ? "bg-blue-600 text-white shadow-[0_12px_28px_rgba(37,99,235,0.28)]"
                    : "hover:opacity-90"
                }`}
                style={
                  active
                    ? undefined
                    : {
                        color: "var(--foreground)",
                        background: "transparent",
                      }
                }
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <Link
            href="/"
            className="flex items-center gap-3 rounded-2xl px-4 py-3 font-bold transition hover:opacity-90"
            style={{ color: "var(--foreground)" }}
          >
            <Home className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
        </nav>

        <div className="mt-auto space-y-3">
          <div
            className="rounded-[20px] p-4"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-muted-2">
              Theme
            </div>
            <ThemeToggle />
          </div>

          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 font-bold transition disabled:opacity-60"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
          >
            <LogOut className="h-4 w-4" />
            {signingOut ? "Signing Out..." : "Sign Out"}
          </button>
        </div>
      </aside>
    </>
  );
}
