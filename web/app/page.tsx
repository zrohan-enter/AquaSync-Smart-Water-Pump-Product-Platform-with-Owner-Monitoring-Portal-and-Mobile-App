import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

const products = [
  {
    name: "AquaSync Lite",
    model: "ASL-80",
    price: "৳12,999",
    description:
      "Affordable smart pump for home use with essential monitoring and mobile alerts.",
  },
  {
    name: "AquaSync Pro",
    model: "ASP-100",
    price: "৳18,500",
    description:
      "Flagship smart water pump with digital twin activation, live telemetry, and owner control.",
  },
  {
    name: "AquaSync Max",
    model: "ASM-200",
    price: "৳25,999",
    description:
      "High-capacity intelligent pump for larger buildings with premium monitoring workflows.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#eef3f9] text-slate-950 dark:bg-[#07101f] dark:text-white">
      <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/88 backdrop-blur-md dark:border-white/10 dark:bg-[rgba(7,16,31,0.88)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="font-display text-3xl font-black tracking-tight text-slate-950 dark:text-white"
          >
            AQUASYNC
          </Link>

          <div className="hidden items-center gap-8 text-sm font-bold uppercase tracking-[0.2em] text-slate-600 md:flex dark:text-slate-300">
            <Link href="/products" className="transition hover:text-blue-600">
              Products
            </Link>
            <Link href="/compare" className="transition hover:text-blue-600">
              Compare
            </Link>
            <Link href="/technology" className="transition hover:text-blue-600">
              Technology
            </Link>
            <Link href="/support" className="transition hover:text-blue-600">
              Support
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <ThemeToggle compact />
            </div>

            <Link
              href="/portal/login"
              className="rounded-full border border-slate-300 bg-white px-6 py-3 font-bold text-slate-900 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              Owner Portal
            </Link>
          </div>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-blue-600">
            Connected Water Infrastructure
          </p>

          <h1 className="font-display mb-6 text-6xl font-black leading-[1.02] tracking-tight text-slate-950 dark:text-white">
            AquaSync for
            <span className="text-blue-600"> modern water control</span>
          </h1>

          <p className="mb-10 max-w-2xl text-xl leading-9 text-slate-600 dark:text-slate-300">
            AquaSync combines intelligent pump hardware, digital twin
            activation, live telemetry, and owner-focused monitoring into one
            premium water control platform. The public website introduces the
            products and technology, while the owner portal delivers the private
            monitoring experience.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/products"
              className="rounded-full bg-[#071338] px-8 py-4 text-base font-bold !text-white transition hover:opacity-95"
              style={{ color: "#ffffff" }}
            >
              Explore Products
            </Link>

            <Link
              href="/portal/login"
              className="rounded-full border border-slate-300 bg-white px-8 py-4 text-base font-bold text-slate-900 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              Enter Owner Portal
            </Link>
          </div>
        </div>

        <div className="rounded-[2.5rem] border border-slate-200/90 bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[rgba(255,255,255,0.04)] dark:shadow-[0_22px_50px_rgba(2,8,23,0.45)]">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-lg">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-100">
                Telemetry Preview
              </p>
              <div className="mb-2 text-5xl font-black">57%</div>
              <p className="mb-6 text-blue-100">Current tank level</p>

              <div className="space-y-3 border-t border-white/20 pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-100">Motor State</span>
                  <span className="font-bold">OFF</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-100">Voltage</span>
                  <span className="font-bold">222.6V</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-100">Health Score</span>
                  <span className="font-bold">100/100</span>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-slate-50/80 p-6 dark:border-white/10 dark:bg-white/5">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Flagship Model
              </p>
              <h2 className="font-display mb-2 text-3xl font-black text-slate-950 dark:text-white">
                AquaSync Pro
              </h2>
              <p className="mb-6 text-slate-500 dark:text-slate-400">
                ASP-100 • Digital Twin Ready
              </p>

              <div className="space-y-3 text-sm">
                <div className="rounded-2xl bg-white px-4 py-3 font-semibold text-slate-900 shadow-sm dark:bg-white/5 dark:text-white">
                  Live monitoring
                </div>
                <div className="rounded-2xl bg-white px-4 py-3 font-semibold text-slate-900 shadow-sm dark:bg-white/5 dark:text-white">
                  Device activation
                </div>
                <div className="rounded-2xl bg-white px-4 py-3 font-semibold text-slate-900 shadow-sm dark:bg-white/5 dark:text-white">
                  Owner dashboard
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-blue-600">
              Built for every scale
            </p>
            <h2 className="font-display text-4xl font-black text-slate-950 dark:text-white">
              Choose your AquaSync system
            </h2>
          </div>

          <Link
            href="/products"
            className="hidden font-bold text-blue-600 md:block"
          >
            View full catalog →
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.model}
              className="rounded-[2rem] border border-slate-200/90 bg-white p-8 shadow-[0_16px_34px_rgba(15,23,42,0.07)] transition hover:-translate-y-1 hover:shadow-[0_24px_48px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-[rgba(255,255,255,0.04)] dark:shadow-[0_22px_50px_rgba(2,8,23,0.45)]"
            >
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                {product.model}
              </p>

              <h3 className="font-display mb-3 text-3xl font-black text-slate-950 dark:text-white">
                {product.name}
              </h3>

              <p className="mb-8 min-h-[96px] leading-7 text-slate-600 dark:text-slate-300">
                {product.description}
              </p>

              <div className="mb-8 text-4xl font-black text-slate-950 dark:text-white">
                {product.price}
              </div>

              <div className="flex gap-3">
                <Link
                  href="/products"
                  className="flex-1 rounded-full bg-[#071338] px-5 py-4 text-center font-bold !text-white transition hover:opacity-95"
                  style={{ color: "#ffffff" }}
                >
                  View Product
                </Link>

                <Link
                  href="/compare"
                  className="rounded-full border border-slate-300 bg-white px-5 py-4 text-center font-bold text-slate-900 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                >
                  Compare
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2.5rem] border border-slate-200/90 bg-white p-10 shadow-[0_18px_40px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[rgba(255,255,255,0.04)] dark:shadow-[0_22px_50px_rgba(2,8,23,0.45)]">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-blue-600">
              Public Brand Platform
            </p>
            <h2 className="font-display mb-4 text-4xl font-black text-slate-950 dark:text-white">
              Marketing website for everyone
            </h2>
            <p className="text-lg leading-8 text-slate-600 dark:text-slate-300">
              The AquaSync public site is open to everyone. Visitors can explore
              products, compare models, learn about our technology, follow our
              journey, and understand the value of connected water
              infrastructure.
            </p>
          </div>

          <div className="rounded-[2.5rem] border border-slate-200/90 bg-white p-10 shadow-[0_18px_40px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[rgba(255,255,255,0.04)] dark:shadow-[0_22px_50px_rgba(2,8,23,0.45)]">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-blue-600">
              Private Owner Portal
            </p>
            <h2 className="font-display mb-4 text-4xl font-black text-slate-950 dark:text-white">
              Secure monitoring for customers
            </h2>
            <p className="text-lg leading-8 text-slate-600 dark:text-slate-300">
              After purchase and activation, owners enter a separate portal to
              manage their profile, link multiple devices, review telemetry,
              monitor motor status, and access alerts and lifecycle records.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-[2.5rem] border border-slate-200/90 bg-white p-10 shadow-[0_18px_40px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[rgba(255,255,255,0.04)] dark:shadow-[0_22px_50px_rgba(2,8,23,0.45)]">
          <div className="grid gap-10 lg:grid-cols-3">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-blue-600">
                Why AquaSync
              </p>
              <h2 className="font-display text-4xl font-black leading-tight text-slate-950 dark:text-white">
                Premium control for modern pump ownership
              </h2>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 dark:border-white/10 dark:bg-white/5">
                <h3 className="mb-2 text-xl font-black text-slate-950 dark:text-white">
                  Digital Twin Activation
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Every purchase can be linked to a unique device identity for
                  secure owner access and activation.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 dark:border-white/10 dark:bg-white/5">
                <h3 className="mb-2 text-xl font-black text-slate-950 dark:text-white">
                  Live Telemetry
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Monitor tank level, voltage, motor state, and system health
                  from one connected control surface.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 dark:border-white/10 dark:bg-white/5">
                <h3 className="mb-2 text-xl font-black text-slate-950 dark:text-white">
                  Owner Monitoring Portal
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Access alerts, activity history, diagnostics, profile tools,
                  and multiple devices from one secure account.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 dark:border-white/10 dark:bg-white/5">
                <h3 className="mb-2 text-xl font-black text-slate-950 dark:text-white">
                  Service Ready
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Built for support, reporting, and long-term device lifecycle
                  management.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
