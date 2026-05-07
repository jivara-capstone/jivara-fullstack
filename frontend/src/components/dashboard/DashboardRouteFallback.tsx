export default function DashboardRouteFallback() {
  return (
    <div className="min-h-[60vh] px-5 py-8 lg:ml-[280px] lg:px-10">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="h-10 w-48 animate-pulse rounded-2xl bg-line/70" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-[28px] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]" />
          ))}
        </div>
        <div className="h-80 animate-pulse rounded-[32px] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]" />
      </div>
    </div>
  );
}
