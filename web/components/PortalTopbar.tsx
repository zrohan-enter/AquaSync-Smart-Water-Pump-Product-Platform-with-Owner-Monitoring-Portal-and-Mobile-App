"use client";

import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

export default function PortalTopbar({
  onMenuClick,
  user,
}: {
  onMenuClick: () => void;
  user: {
    email: string;
    fullName: string;
    profileImageUrl: string;
  };
}) {
  const pathname = usePathname();

  const title = pathname.startsWith("/portal/profile")
    ? "Profile"
    : pathname.startsWith("/portal/devices")
      ? "My Devices"
      : "Dashboard";

  const subtitle = pathname.startsWith("/portal/profile")
    ? "Identity, contact, avatar, and owner details"
    : pathname.startsWith("/portal/devices")
      ? "All linked AquaSync systems"
      : "Live telemetry, service state, and device overview";

  const initials = (
    user.fullName?.trim()?.[0] ||
    user.email?.trim()?.[0] ||
    "A"
  ).toUpperCase();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/92 backdrop-blur-xl dark:border-white/10 dark:bg-[rgba(7,16,34,0.88)]">
      <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onMenuClick}
            className="inline-flex rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 shadow-sm transition hover:bg-slate-50 lg:hidden dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            type="button"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0">
            <p className="truncate font-display text-3xl font-black tracking-tight text-slate-950 dark:text-white">
              {title}
            </p>
            <p className="truncate text-sm text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {user.fullName || "AquaSync Owner"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {user.email}
            </p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white text-sm font-black text-slate-900 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white">
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
        </div>
      </div>
    </header>
  );
}
