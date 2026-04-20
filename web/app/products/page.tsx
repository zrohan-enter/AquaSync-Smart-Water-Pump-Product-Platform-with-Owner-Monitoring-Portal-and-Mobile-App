import Link from "next/link";
import { supabase } from "@/lib/supabase";
import PurchaseButton from "@/components/PurchaseButton";
export default async function ProductsPage() {
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, model, description, price")
    .order("created_at", { ascending: true });
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <nav className="flex justify-between items-center px-12 py-6 border-b bg-white border-slate-200">
        <Link href="/" className="text-2xl font-black tracking-tighter text-blue-600">
          AQUASYNC
        </Link>
        <div className="space-x-8 font-medium text-sm uppercase tracking-widest text-slate-600">
          <Link href="/products" className="text-blue-600">Products</Link>
          <Link href="/compare" className="hover:text-blue-600 transition">Compare</Link>
          <Link href="/portal/login" className="hover:text-blue-600 transition">Owner Portal</Link>
        </div>
      </nav>
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="mb-16">
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">Product Catalog</h1>
          <p className="text-slate-500 text-lg max-w-2xl">
            Explore the premium AquaSync lineup and simulate a real purchase flow.
          </p>
        </div>
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            Failed to load products: {error.message}
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-3">
            {products?.map((product) => (
              <div
                key={product.id}
                className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm hover:border-blue-300 transition"
              >
                <div className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">
                  {product.model}
                </div>
                <h2 className="text-2xl font-bold mb-4">{product.name}</h2>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed min-h-[72px]">
                  {product.description}
                </p>
                <div className="text-3xl font-black mb-8">
                  ৳{Number(product.price).toLocaleString()}
                </div>
                <PurchaseButton productId={product.id} productName={product.name} />
                <button className="w-full py-4 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition">
                  Details
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
