export default function LocaleLoading() {
  return (
    <main className="mx-auto max-w-5xl space-y-4 px-4 py-8 sm:px-6">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="h-24 animate-pulse rounded-2xl bg-muted" />
        <div className="h-24 animate-pulse rounded-2xl bg-muted" />
        <div className="h-24 animate-pulse rounded-2xl bg-muted" />
      </div>
      <div className="h-56 animate-pulse rounded-2xl bg-muted" />
    </main>
  );
}
