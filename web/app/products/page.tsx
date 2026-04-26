import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { supabase } from "@/lib/supabase";
import PurchaseButton from "@/components/PurchaseButton";

export default async function ProductsPage() {
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, model, description, price")
    .order("created_at", { ascending: true });

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
            <Link href="/products" className="text-blue-600">
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
              className="rounded-full border border-slate-300 bg-white px-5 py-3 font-bold text-slate-900 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              Owner Portal
            </Link>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-16 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-blue-600">
              Product Catalog
            </p>
            <h1 className="font-display mb-5 text-5xl font-black tracking-tight text-slate-950 md:text-6xl dark:text-white">
              Explore the AquaSync lineup
            </h1>
            <p className="max-w-3xl text-lg leading-9 text-slate-600 dark:text-slate-300">
              Discover our connected smart water pump systems built for premium
              monitoring, digital twin ownership, and real-time infrastructure
              control. This public product catalog is open to everyone, while
              activated customers continue into the private owner portal.
            </p>
          </div>

          <div className="rounded-[2rem] border border-slate-200/90 bg-white p-6 shadow-[0_16px_34px_rgba(15,23,42,0.07)] dark:border-white/10 dark:bg-[rgba(255,255,255,0.04)] dark:shadow-[0_22px_50px_rgba(2,8,23,0.45)]">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
              Purchase Flow
            </p>
            <div className="grid gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 font-semibold text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white">
                Browse product
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 font-semibold text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white">
                Purchase
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 font-semibold text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white">
                Activate digital twin
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 font-semibold text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white">
                Monitor in owner portal
              </div>
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
            Failed to load products: {error.message}
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {products?.map((product) => (
              <div
                key={product.id}
                className="rounded-[2.25rem] border border-slate-200/90 bg-white p-8 shadow-[0_16px_34px_rgba(15,23,42,0.07)] transition hover:-translate-y-1 hover:shadow-[0_24px_48px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-[rgba(255,255,255,0.04)] dark:shadow-[0_22px_50px_rgba(2,8,23,0.45)]"
              >
                <div className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                  {product.model}
                </div>

                <h2 className="font-display mb-4 text-3xl font-black text-slate-950 dark:text-white">
                  {product.name}
                </h2>

                <p className="mb-8 min-h-[96px] text-sm leading-7 text-slate-500 dark:text-slate-300">
                  {product.description}
                </p>

                <div className="mb-8 text-4xl font-black text-slate-950 dark:text-white">
                  ৳{Number(product.price).toLocaleString()}
                </div>

                <div className="space-y-3">
                  <PurchaseButton
                    productId={product.id}
                    productName={product.name}
                    price={`৳${Number(product.price).toLocaleString()}`}
                    modelCode={product.model}
                  />

                  <button className="w-full rounded-full border border-slate-300 bg-white py-4 font-bold text-slate-900 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <section className="mt-20 rounded-[2.5rem] border border-slate-200/90 bg-white p-10 shadow-[0_18px_40px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[rgba(255,255,255,0.04)] dark:shadow-[0_22px_50px_rgba(2,8,23,0.45)]">
          <div className="grid gap-10 lg:grid-cols-3">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-blue-600">
                Why AquaSync
              </p>
              <h2 className="font-display text-4xl font-black leading-tight text-slate-950 dark:text-white">
                Public product platform. Private owner experience.
              </h2>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 dark:border-white/10 dark:bg-white/5">
                <h3 className="mb-2 text-xl font-black text-slate-950 dark:text-white">
                  Universal Marketing Site
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Anyone can browse products, compare models, explore
                  technology, and learn about the AquaSync journey.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 dark:border-white/10 dark:bg-white/5">
                <h3 className="mb-2 text-xl font-black text-slate-950 dark:text-white">
                  Account-Aware Purchase Flow
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Purchases attach smoothly to an existing owner or create a new
                  owner account only when needed.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 dark:border-white/10 dark:bg-white/5">
                <h3 className="mb-2 text-xl font-black text-slate-950 dark:text-white">
                  Digital Twin Activation
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Each purchased device receives an activation code and becomes
                  a linked digital twin inside the owner portal.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 dark:border-white/10 dark:bg-white/5">
                <h3 className="mb-2 text-xl font-black text-slate-950 dark:text-white">
                  Live Monitoring Portal
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  After activation, owners can access telemetry, alerts, events,
                  profile tools, and multiple devices from one account.
                </p>
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
