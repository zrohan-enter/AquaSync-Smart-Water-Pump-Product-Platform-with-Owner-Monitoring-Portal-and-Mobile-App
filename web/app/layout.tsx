import "./globals.css";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "AquaSync",
  description: "Smart Water Pump Product Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakarta.variable} ${sora.variable}`}
    >
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var saved = localStorage.getItem("aquasync-theme");
                  var systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                  var nextTheme = saved === "dark" || (!saved && systemDark) ? "dark" : "light";
                  document.documentElement.classList.toggle("dark", nextTheme === "dark");
                } catch (e) {}
              })();
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
