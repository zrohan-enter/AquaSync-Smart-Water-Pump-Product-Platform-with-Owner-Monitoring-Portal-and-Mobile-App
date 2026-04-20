import React from 'react';
export default function Home() {
  const products = [
    { name: 'AquaSync Lite', model: 'ASL-80', price: '?12,999', features: ['Home Use', 'Mobile Alerts'] },
    { name: 'AquaSync Pro', model: 'ASP-100', price: '?18,500', features: ['Full Telemetry', 'Digital Twin', 'Priority Support'] },
    { name: 'AquaSync Max', model: 'ASM-200', price: '?25,999', features: ['Industrial Grade', 'Multi-Tank Sync', 'Admin Panel'] },
  ];
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Premium Navbar */}
      <nav className="flex justify-between items-center px-12 py-6 border-b sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="text-2xl font-black tracking-tighter text-blue-600">AQUASYNC</div>
        <div className="space-x-8 font-medium text-sm uppercase tracking-widest">
          <a href="/products" className="hover:text-blue-600 transition">Products</a>
          <a href="/technology" className="hover:text-blue-600 transition">Technology</a>
          <a href="/support" className="hover:text-blue-600 transition">Support</a>
        </div>
        <a href="/portal/login" className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-full hover:shadow-lg transition">
          Owner Portal
        </a>
      </nav>
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-32 px-4 bg-gradient-to-b from-blue-50 to-white">
        <h1 className="text-7xl font-extrabold tracking-tight mb-6">
          The <span className="text-blue-600">Smartest</span> Way <br /> to Manage Water.
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mb-12 leading-relaxed">
          AquaSync connects smart water pump products with live monitoring, digital twin activation,
          real-time telemetry, and owner-focused service management for the next generation of water infrastructure.
        </p>
        <div className="flex gap-4">
          <a href="/products" className="px-10 py-4 bg-slate-900 text-white rounded-full font-bold hover:bg-black transition">
            View Catalog
          </a>
          <a href="/compare" className="px-10 py-4 border-2 border-slate-900 rounded-full font-bold hover:bg-slate-50 transition">
            Compare Models
          </a>
        </div>
      </section>
      {/* Product Showcase */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-center mb-16">Select Your System</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product.model} className="p-8 rounded-3xl border border-slate-100 bg-slate-50 hover:border-blue-200 transition group">
              <div className="text-blue-600 font-bold mb-2">{product.model}</div>
              <h3 className="text-2xl font-bold mb-4">{product.name}</h3>
              <div className="text-3xl font-black mb-8">{product.price}</div>
              <ul className="space-y-3 mb-10 text-slate-500 text-sm">
                {product.features.map(f => <li key={f}>• {f}</li>)}
              </ul>
              <button className="w-full py-4 bg-white border border-slate-200 rounded-2xl font-bold group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition">
                Simulate Purchase
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
