export default function Loading() {
  return (
    <main className="min-h-screen bg-[#f6f8fc] px-6 py-10">
      <div className="max-w-7xl mx-auto animate-pulse">
        <div className="h-6 w-40 rounded bg-slate-200 mb-4" />
        <div className="h-16 w-[28rem] rounded bg-slate-200 mb-4" />
        <div className="h-8 w-[40rem] rounded bg-slate-200 mb-10" />

        <div className="grid gap-6 xl:grid-cols-3 mb-8">
          <div className="xl:col-span-2 h-80 rounded-[2rem] bg-white border border-slate-200" />
          <div className="h-80 rounded-[2rem] bg-white border border-slate-200" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 mb-8">
          <div className="h-36 rounded-[2rem] bg-white border border-slate-200" />
          <div className="h-36 rounded-[2rem] bg-white border border-slate-200" />
          <div className="h-36 rounded-[2rem] bg-white border border-slate-200" />
          <div className="h-36 rounded-[2rem] bg-white border border-slate-200" />
        </div>

        <div className="h-96 rounded-[2rem] bg-white border border-slate-200" />
      </div>
    </main>
  );
}
