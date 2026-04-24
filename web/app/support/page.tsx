import Link from "next/link";
export default function SupportPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900 px-6 py-20">
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="text-blue-600 font-bold">← Back to Home</Link>
        <h1 className="text-5xl font-black mt-8 mb-6">Support</h1>
        <p className="text-lg text-slate-600 leading-8 mb-6">
          Get product guidance, maintenance help, and owner portal support for your AquaSync system.
        </p>
        <div className="rounded-3xl border border-slate-200 p-8 bg-slate-50">
          <p><strong>Email:</strong> support@aquasync.demo</p>
          <p><strong>Hotline:</strong> +880-0000-000000</p>
          <p><strong>Hours:</strong> Sat–Thu, 9:00 AM – 6:00 PM</p>
        </div>
      </div>
    </main>
  );
}
