"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

export default function ThemeToggle({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(
      "aquasync-theme",
    ) as ThemeMode | null;
    const systemDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    const nextTheme: ThemeMode =
      saved === "dark" || saved === "light"
        ? saved
        : systemDark
          ? "dark"
          : "light";

    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    setTheme(nextTheme);
    setReady(true);
  }, []);

  function applyTheme(nextTheme: ThemeMode) {
    setTheme(nextTheme);
    window.localStorage.setItem("aquasync-theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  }

  if (!ready) {
    return (
      <div className="flex items-center gap-1 rounded-full border border-slate-300 bg-white p-1 dark:border-white/10 dark:bg-white/5">
        <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-white/10" />
        <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-white/10" />
      </div>
    );
  }

  if (compact) {
    const lightActive = theme === "light";
    const darkActive = theme === "dark";

    return (
      <div className="relative flex items-center rounded-full border border-slate-300 bg-white p-1 shadow-sm dark:border-white/10 dark:bg-white/5">
        <button
          type="button"
          onClick={() => applyTheme("light")}
          aria-label="Light mode"
          className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full transition ${
            lightActive
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
          }`}
        >
          <Sun className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => applyTheme("dark")}
          aria-label="Dark mode"
          className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full transition ${
            darkActive
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
          }`}
        >
          <Moon className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-2 gap-2 rounded-2xl p-1"
      style={{ background: "var(--surface-soft)" }}
    >
      <button
        type="button"
        onClick={() => applyTheme("light")}
        className="flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-300"
        style={{
          background:
            theme === "light" ? "var(--surface-strong)" : "transparent",
          color: theme === "light" ? "var(--foreground)" : "var(--muted)",
          border:
            theme === "light"
              ? "1px solid var(--border)"
              : "1px solid transparent",
        }}
      >
        <Sun className="h-4 w-4" />
        Light
      </button>

      <button
        type="button"
        onClick={() => applyTheme("dark")}
        className="flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-300"
        style={{
          background:
            theme === "dark" ? "var(--surface-strong)" : "transparent",
          color: theme === "dark" ? "var(--foreground)" : "var(--muted)",
          border:
            theme === "dark"
              ? "1px solid var(--border)"
              : "1px solid transparent",
        }}
      >
        <Moon className="h-4 w-4" />
        Dark
      </button>
    </div>
  );
}
