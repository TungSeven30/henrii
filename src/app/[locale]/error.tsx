"use client";

type LocaleErrorProps = {
  error: Error;
  reset: () => void;
};

export default function LocaleError({ error, reset }: LocaleErrorProps) {
  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-10 sm:px-6">
      <section className="rounded-2xl border border-destructive/40 bg-destructive/10 p-5">
        <h1 className="font-heading text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error.message || "The page failed to load. Please retry."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 h-10 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground"
        >
          Try again
        </button>
      </section>
    </main>
  );
}
