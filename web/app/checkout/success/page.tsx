import Link from "next/link";

type SuccessPageProps = {
  searchParams: Promise<{
    product?: string;
    code?: string;
    email?: string;
    device?: string;
  }>;
};

export default async function CheckoutSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const params = await searchParams;

  const product = params.product ?? "AquaSync system";
  const code = params.code ?? "PENDING-000";
  const email = params.email ?? null;
  const deviceUuid = params.device ?? null;

  return (
    <main className="min-h-screen bg-[#f6f8fc] text-slate-900 px-6 py-20">
      <div className="mx-auto w-full max-w-3xl rounded-[2.5rem] border border-slate-200 bg-white p-10 shadow-sm md:p-14">
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
          <svg
            className="h-10 w-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-green-600">
          Purchase Confirmed
        </p>

        <h1 className="mb-5 text-4xl font-black tracking-tight md:text-5xl">
          Welcome to AquaSync
        </h1>

        <p className="mb-10 max-w-2xl text-lg leading-8 text-slate-600">
          Your <span className="font-bold text-slate-900">{product}</span> has
          been registered in our system. Your digital twin has been created and
          is now ready for activation through the owner portal.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Activation Code
            </p>
            <div className="break-all text-3xl font-black tracking-wider text-blue-600">
              {code}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Device UUID
            </p>
            <div className="break-all text-xl font-black tracking-wide text-slate-900">
              {deviceUuid ?? "Will appear after device registration"}
            </div>
          </div>
        </div>

        {email ? (
          <div className="mt-6 rounded-[2rem] border border-blue-200 bg-blue-50 p-6">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
              Linked Owner Account
            </p>
            <p className="text-lg font-bold text-slate-900">{email}</p>
            <p className="mt-2 text-slate-600">
              This purchase has already been connected to the owner account
              above. After activation, the device will appear inside that owner
              portal.
            </p>
          </div>
        ) : (
          <div className="mt-6 rounded-[2rem] border border-amber-200 bg-amber-50 p-6">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
              Owner Portal Reminder
            </p>
            <p className="text-slate-700">
              Activate this device from the owner portal using the activation
              code shown above. If the owner account was created during
              purchase, sign in using those account credentials first.
            </p>
          </div>
        )}

        <div className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-6">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
            Next Steps
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="mb-2 text-lg font-black">1. Sign in</div>
              <p className="text-sm leading-6 text-slate-600">
                Open the owner portal and sign in using the owner account linked
                to this purchase.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="mb-2 text-lg font-black">2. Activate</div>
              <p className="text-sm leading-6 text-slate-600">
                Enter the activation code to unlock the digital twin and connect
                the device to live monitoring.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="mb-2 text-lg font-black">3. Monitor</div>
              <p className="text-sm leading-6 text-slate-600">
                Open the dashboard to view telemetry, alerts, and motor status
                in real time.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <Link
            href="/portal/activate"
            className="rounded-2xl bg-blue-600 px-6 py-4 text-center font-bold text-white transition hover:bg-blue-700"
          >
            Activate Now
          </Link>

          <Link
            href="/portal/login"
            className="rounded-2xl border border-slate-300 bg-white px-6 py-4 text-center font-bold transition hover:bg-slate-50"
          >
            Owner Portal
          </Link>

          <Link
            href="/products"
            className="rounded-2xl border border-slate-300 bg-white px-6 py-4 text-center font-bold transition hover:bg-slate-50"
          >
            Back to Products
          </Link>
        </div>
      </div>
    </main>
  );
}
