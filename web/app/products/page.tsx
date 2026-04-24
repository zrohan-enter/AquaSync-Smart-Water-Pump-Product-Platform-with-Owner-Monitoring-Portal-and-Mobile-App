import Link from "next/link";
import { supabase } from "@/lib/supabase";
import PurchaseButton from "@/components/PurchaseButton";

export default async function ProductsPage() {
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, model, description, price")
    .order("created_at", { ascending: true });

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

          <Link
            href="/portal/login"
            className="rounded-2xl border border-slate-300 bg-white px-5 py-3 font-bold transition hover:bg-slate-50"
          >
            Owner Portal
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end mb-16">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-blue-600">
              Product Catalog
            </p>
            <h1 className="mb-5 text-5xl font-black tracking-tight md:text-6xl">
              Explore the AquaSync lineup
            </h1>
            <p className="max-w-3xl text-lg leading-9 text-slate-600">
              Discover our connected smart water pump systems built for premium
              monitoring, digital twin ownership, and real-time infrastructure
              control. This public product catalog is open to everyone, while
              activated customers continue into the private owner portal.
            </p>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
              Purchase Flow
            </p>
            <div className="grid gap-3">
              <div className="rounded-2xl bg-slate-50 px-4 py-3 font-semibold">
                Browse product
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 font-semibold">
                Simulate purchase
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 font-semibold">
                Create / link owner account
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 font-semibold">
                Activate digital twin
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 font-semibold">
                Monitor in owner portal
              </div>
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            Failed to load products: {error.message}
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {products?.map((product) => (
              <div
                key={product.id}
                className="rounded-[2.25rem] border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
              >
                <div className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                  {product.model}
                </div>

                <h2 className="mb-4 text-3xl font-black">{product.name}</h2>

                <p className="mb-8 min-h-[96px] text-sm leading-7 text-slate-500">
                  {product.description}
                </p>

                <div className="mb-8 text-4xl font-black">
                  ৳{Number(product.price).toLocaleString()}
                </div>

                <div className="space-y-3">
                  <PurchaseButton
                    productId={product.id}
                    productName={product.name}
                  />

                  <button className="w-full rounded-2xl border border-slate-200 py-4 font-bold transition hover:bg-slate-50">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <section className="mt-20 rounded-[2.5rem] border border-slate-200 bg-white p-10 shadow-sm">
          <div className="grid gap-10 lg:grid-cols-3">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-blue-600">
                Why AquaSync
              </p>
              <h2 className="text-4xl font-black leading-tight">
                Public product platform. Private owner experience.
              </h2>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-50 p-5">
                <h3 className="mb-2 text-xl font-black">
                  Universal Marketing Site
                </h3>
                <p className="text-slate-600">
                  Anyone can browse products, compare models, explore
                  technology, and learn about the AquaSync journey.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <h3 className="mb-2 text-xl font-black">
                  Account-Aware Purchase Flow
                </h3>
                <p className="text-slate-600">
                  Purchases can attach to an existing owner or create a new
                  owner account during checkout.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-50 p-5">
                <h3 className="mb-2 text-xl font-black">
                  Digital Twin Activation
                </h3>
                <p className="text-slate-600">
                  Each purchased device receives an activation code and becomes
                  a linked digital twin inside the owner portal.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <h3 className="mb-2 text-xl font-black">
                  Live Monitoring Portal
                </h3>
                <p className="text-slate-600">
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
