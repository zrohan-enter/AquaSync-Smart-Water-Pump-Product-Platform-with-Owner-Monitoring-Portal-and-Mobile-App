import Link from "next/link";
export default function TechnologyPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900 px-6 py-20">
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="text-blue-600 font-bold">← Back to Home</Link>
        <h1 className="text-5xl font-black mt-8 mb-6">AquaSync Technology</h1>
        <p className="text-lg text-slate-600 leading-8">
          AquaSync combines digital twin activation, cloud-connected telemetry,
          real-time monitoring, and owner-focused service workflows to create a
          modern smart water pump platform.
        </p>
      </div>
    </main>
  );
}
