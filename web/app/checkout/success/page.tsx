import Link from "next/link";
type SuccessPageProps = {
  searchParams: {
    product?: string;
    code?: string;
  };
};
export default function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const product = searchParams.product ?? "AquaSync system";
  const code = searchParams.code ?? "PENDING-000";
  return (
    <main className="min-h-screen bg-white text-slate-900 flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
          <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-green-600">
          Purchase Confirmed
        </p>
        <h1 className="mb-4 text-4xl font-black tracking-tight">
          Your AquaSync order is ready
        </h1>
        <p className="mb-10 text-lg leading-8 text-slate-600">
          Thank you for choosing <span className="font-bold text-slate-900">{product}</span>.
          Your activation code has been generated successfully.
        </p>
        <div className="mb-10 rounded-3xl border border-slate-200 bg-slate-50 p-8">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
            Activation Code
          </p>
          <div className="text-3xl font-black tracking-wider text-blue-600">
            {code}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/portal/activate"
            className="rounded-2xl bg-blue-600 px-6 py-4 text-center font-bold text-white transition hover:bg-blue-700"
          >
            Go to Activation Portal
          </Link>
          <Link
            href="/products"
            className="rounded-2xl border border-slate-300 px-6 py-4 text-center font-bold transition hover:bg-slate-50"
          >
            Back to Products
          </Link>
        </div>
      </div>
    </main>
  );
}
