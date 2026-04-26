"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = window.localStorage.getItem("aquasync-theme");
    const systemDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const nextTheme =
      saved === "dark" || (!saved && systemDark) ? "dark" : "light";

    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  }, []);

  function applyTheme(nextTheme: "light" | "dark") {
    setTheme(nextTheme);
    window.localStorage.setItem("aquasync-theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        onClick={() => applyTheme("light")}
        className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition ${
          theme === "light"
            ? "bg-white text-slate-900 shadow-sm"
            : "bg-transparent text-slate-500 hover:bg-white/60 dark:text-slate-300 dark:hover:bg-white/5"
        }`}
      >
        <Sun className="h-4 w-4" />
        Light
      </button>

      <button
        onClick={() => applyTheme("dark")}
        className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition ${
          theme === "dark"
            ? "bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950"
            : "bg-transparent text-slate-500 hover:bg-white/60 dark:text-slate-300 dark:hover:bg-white/5"
        }`}
      >
        <Moon className="h-4 w-4" />
        Dark
      </button>
    </div>
  );
}
