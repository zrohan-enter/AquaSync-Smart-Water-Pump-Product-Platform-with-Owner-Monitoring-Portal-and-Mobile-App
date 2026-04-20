import Link from "next/link";
export default function ComparePage() {
  const specs = [
    { feature: "Target Use", lite: "Home / Flat", pro: "Residential Building", max: "Industrial Facility" },
    { feature: "Telemetry", lite: "Basic", pro: "Advanced", max: "Full Suite" },
    { feature: "Power Logic", lite: "Single Phase", pro: "Three Phase Ready", max: "High-Voltage Ready" },
    { feature: "Digital Twin", lite: "No", pro: "Yes", max: "Yes" },
    { feature: "Warranty", lite: "1 Year", pro: "3 Years", max: "5 Years" }
  ];
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <nav className="px-12 py-6 border-b border-slate-200">
        <Link href="/" className="text-2xl font-black text-blue-600">AQUASYNC</Link>
      </nav>
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h1 className="text-5xl font-black mb-12">Compare Models</h1>
        <div className="overflow-hidden rounded-3xl border border-slate-200">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-6 px-8 font-bold text-slate-400 uppercase text-xs tracking-widest">Feature</th>
                <th className="py-6 px-8 font-black text-xl">Lite</th>
                <th className="py-6 px-8 font-black text-xl text-blue-600">Pro</th>
                <th className="py-6 px-8 font-black text-xl">Max</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {specs.map((s) => (
                <tr key={s.feature} className="hover:bg-blue-50/30 transition">
                  <td className="py-6 px-8 font-bold text-slate-700">{s.feature}</td>
                  <td className="py-6 px-8 text-slate-500">{s.lite}</td>
                  <td className="py-6 px-8 font-semibold text-slate-900">{s.pro}</td>
                  <td className="py-6 px-8 text-slate-500">{s.max}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
