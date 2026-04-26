"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import PortalSidebar from "@/components/PortalSidebar";
import PortalTopbar from "@/components/PortalTopbar";

type PortalShellProps = {
  children: ReactNode;
  user: {
    id: string;
    email: string;
    fullName: string;
    profileImageUrl: string;
  };
};

export default function PortalShell({ children, user }: PortalShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setSidebarOpen(false);
    setPageLoading(true);

    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 480);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100">
      <PortalSidebar
        user={user}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-[300px]">
        <PortalTopbar onMenuClick={() => setSidebarOpen(true)} user={user} />

        <div className="relative px-4 pb-8 pt-4 md:px-6 lg:px-8 lg:pt-8">
          {pageLoading ? (
            <div className="pointer-events-none absolute inset-x-4 top-4 z-10 md:inset-x-6 lg:inset-x-8 lg:top-8">
              <div className="glass-card overflow-hidden rounded-[28px] px-6 py-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-blue-500 soft-float" />
                  <div className="text-sm font-semibold text-slate-500 dark:text-slate-300">
                    Loading your next view
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="shimmer h-24 rounded-[22px] bg-slate-100 dark:bg-white/5" />
                  <div className="shimmer h-24 rounded-[22px] bg-slate-100 dark:bg-white/5" />
                  <div className="shimmer h-24 rounded-[22px] bg-slate-100 dark:bg-white/5" />
                </div>
              </div>
            </div>
          ) : null}

          <div className="page-enter">{children}</div>
        </div>
      </div>
    </div>
  );
}
