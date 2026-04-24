import Link from "next/link";

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
    <main className="min-h-screen bg-[#f6f8fc] text-slate-900">
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-3xl font-black tracking-tight text-blue-600"
          >
            AQUASYNC
          </Link>

          <div className="hidden items-center gap-8 text-sm font-bold uppercase tracking-[0.2em] text-slate-600 md:flex">
            <Link href="/products" className="hover:text-blue-600 transition">
              Products
            </Link>
            <Link href="/compare" className="hover:text-blue-600 transition">
              Compare
            </Link>
            <Link href="/technology" className="hover:text-blue-600 transition">
              Technology
            </Link>
            <Link href="/support" className="hover:text-blue-600 transition">
              Support
            </Link>
          </div>

          <Link
            href="/portal/login"
            className="rounded-2xl border border-slate-300 bg-white px-5 py-3 font-bold hover:bg-slate-50 transition"
          >
            Owner Portal
          </Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-blue-600">
            Connected Water Infrastructure
          </p>

          <h1 className="mb-6 text-6xl font-black leading-[1.05] tracking-tight">
            AquaSync for
            <span className="text-blue-600"> modern water control</span>
          </h1>

          <p className="mb-10 max-w-2xl text-xl leading-9 text-slate-600">
            AquaSync combines intelligent pump hardware, digital twin
            activation, live telemetry, and owner-focused monitoring into one
            premium water control platform. Our public website introduces the
            products and technology, while the owner portal delivers the private
            monitoring experience.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/products"
              className="rounded-2xl bg-slate-900 px-7 py-4 font-bold text-white transition hover:bg-black"
            >
              Explore Products
            </Link>
            <Link
              href="/portal/login"
              className="rounded-2xl border border-slate-300 bg-white px-7 py-4 font-bold transition hover:bg-slate-50"
            >
              Enter Owner Portal
            </Link>
          </div>
        </div>

        <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white">
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

            <div className="rounded-[2rem] border border-slate-200 p-6">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Flagship Model
              </p>
              <h2 className="mb-2 text-3xl font-black">AquaSync Pro</h2>
              <p className="mb-6 text-slate-500">
                ASP-100 • Digital Twin Ready
              </p>

              <div className="space-y-3 text-sm">
                <div className="rounded-2xl bg-slate-50 px-4 py-3 font-semibold">
                  Live monitoring
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 font-semibold">
                  Device activation
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 font-semibold">
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
            <h2 className="text-4xl font-black">Choose your AquaSync system</h2>
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
              className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                {product.model}
              </p>
              <h3 className="mb-3 text-3xl font-black">{product.name}</h3>
              <p className="mb-8 min-h-[96px] leading-7 text-slate-600">
                {product.description}
              </p>
              <div className="mb-8 text-4xl font-black">{product.price}</div>

              <div className="flex gap-3">
                <Link
                  href="/products"
                  className="flex-1 rounded-2xl bg-slate-900 px-5 py-4 text-center font-bold text-white hover:bg-black"
                >
                  View Product
                </Link>
                <Link
                  href="/compare"
                  className="rounded-2xl border border-slate-300 px-5 py-4 text-center font-bold hover:bg-slate-50"
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
          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-10 shadow-sm">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-blue-600">
              Public Brand Platform
            </p>
            <h2 className="mb-4 text-4xl font-black">
              Marketing website for everyone
            </h2>
            <p className="text-lg leading-8 text-slate-600">
              The AquaSync public site is open to everyone. Visitors can explore
              products, compare models, learn about our technology, follow our
              journey, and understand the value of connected water
              infrastructure.
            </p>
          </div>

          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-10 shadow-sm">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-blue-600">
              Private Owner Portal
            </p>
            <h2 className="mb-4 text-4xl font-black">
              Secure monitoring for customers
            </h2>
            <p className="text-lg leading-8 text-slate-600">
              After purchase and activation, owners enter a separate portal to
              manage their profile, link multiple devices, review telemetry,
              monitor motor status, and access alerts and lifecycle records.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-[2.5rem] border border-slate-200 bg-white p-10 shadow-sm">
          <div className="grid gap-10 lg:grid-cols-3">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-blue-600">
                Why AquaSync
              </p>
              <h2 className="text-4xl font-black leading-tight">
                Premium control for modern pump ownership
              </h2>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-50 p-5">
                <h3 className="mb-2 text-xl font-black">
                  Digital Twin Activation
                </h3>
                <p className="text-slate-600">
                  Every purchase can be linked to a unique device identity for
                  secure owner access and activation.
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-5">
                <h3 className="mb-2 text-xl font-black">Live Telemetry</h3>
                <p className="text-slate-600">
                  Monitor tank level, voltage, motor state, and system health
                  from one connected control surface.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-50 p-5">
                <h3 className="mb-2 text-xl font-black">
                  Owner Monitoring Portal
                </h3>
                <p className="text-slate-600">
                  Access alerts, activity history, diagnostics, profile tools,
                  and multiple devices from one secure account.
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-5">
                <h3 className="mb-2 text-xl font-black">Service Ready</h3>
                <p className="text-slate-600">
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
