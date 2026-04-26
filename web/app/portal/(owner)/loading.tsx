export default function PortalOwnerLoading() {
  return (
    <main className="page-enter space-y-6">
      <section className="glass-card rounded-[32px] px-8 py-8">
        <div className="mb-4 h-3 w-28 rounded-full bg-slate-200 dark:bg-white/10 shimmer" />
        <div className="mb-4 h-14 w-72 rounded-[20px] bg-slate-200 dark:bg-white/10 shimmer" />
        <div className="h-6 w-[28rem] max-w-full rounded-full bg-slate-200 dark:bg-white/10 shimmer" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="glass-card rounded-[32px] p-8">
          <div className="mb-6 h-10 w-64 rounded-[20px] bg-slate-200 dark:bg-white/10 shimmer" />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="h-28 rounded-[24px] bg-slate-200 dark:bg-white/10 shimmer" />
            <div className="h-28 rounded-[24px] bg-slate-200 dark:bg-white/10 shimmer" />
            <div className="h-28 rounded-[24px] bg-slate-200 dark:bg-white/10 shimmer" />
          </div>
        </div>

        <div className="glass-card rounded-[32px] p-8">
          <div className="mb-5 h-8 w-40 rounded-[20px] bg-slate-200 dark:bg-white/10 shimmer" />
          <div className="space-y-4">
            <div className="h-24 rounded-[24px] bg-slate-200 dark:bg-white/10 shimmer" />
            <div className="h-24 rounded-[24px] bg-slate-200 dark:bg-white/10 shimmer" />
            <div className="h-24 rounded-[24px] bg-slate-200 dark:bg-white/10 shimmer" />
          </div>
        </div>
      </section>
    </main>
  );
}
