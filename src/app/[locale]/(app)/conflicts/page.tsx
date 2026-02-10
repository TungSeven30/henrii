import { getTranslations } from "next-intl/server";
import { getActiveBabyContext } from "@/lib/supabase/get-active-baby-context";
import { resolveConflictAction, resolveMutationConflictAction } from "./actions";

type ConflictsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; resolved?: string }>;
};

type SnapshotRecord = Record<string, unknown>;

function formatSnapshot(table: string, snapshot: SnapshotRecord, t: (key: string) => string) {
  if (table === "feedings") {
    const feedingType = String(snapshot.feeding_type ?? "bottle");
    const amountMl = Number(snapshot.amount_ml ?? 0);
    return `${t("types.feeding")} · ${feedingType}${amountMl ? ` · ${amountMl}ml` : ""}`;
  }

  if (table === "sleep_sessions") {
    const duration = Number(snapshot.duration_minutes ?? 0);
    return `${t("types.sleep")} · ${duration}m`;
  }

  const diaperType = String(snapshot.change_type ?? "wet");
  return `${t("types.diaper")} · ${diaperType}`;
}

export const dynamic = "force-dynamic";

function getConflictsFeedback(query: { error?: string; resolved?: string }) {
  if (query.error) {
    switch (query.error) {
      case "invalid_resolution":
      case "invalid_mutation_resolution":
        return { tone: "error" as const, message: "Invalid conflict resolution request." };
      case "resolve_failed":
      case "mutation_resolve_failed":
        return { tone: "error" as const, message: "Unable to resolve conflict." };
      default:
        return { tone: "error" as const, message: "Unable to complete request." };
    }
  }

  if (query.resolved === "1") {
    return { tone: "success" as const, message: "Conflict marked as resolved." };
  }

  return null;
}

export default async function ConflictsPage({ params, searchParams }: ConflictsPageProps) {
  const { locale } = await params;
  const query = await searchParams;
  const t = await getTranslations({ locale, namespace: "conflicts" });
  const { supabase, activeBabyId } = await getActiveBabyContext(locale);

  const [{ data: openConflicts }, { data: recentResolved }, { data: openMutationConflicts }] =
    await Promise.all([
    supabase
      .from("event_conflicts")
      .select(
        "id, event_table, event_1_happened_at, event_2_happened_at, event_1_snapshot, event_2_snapshot, status, created_at",
      )
      .eq("baby_id", activeBabyId)
      .eq("status", "open")
      .order("created_at", { ascending: false }),
    supabase
      .from("event_conflicts")
      .select("id, event_table, status, resolved_at")
      .eq("baby_id", activeBabyId)
      .neq("status", "open")
      .order("resolved_at", { ascending: false })
      .limit(20),
    supabase
      .from("mutation_conflicts")
      .select(
        "id, event_table, event_id, operation, expected_updated_at, actual_updated_at, created_at",
      )
      .eq("baby_id", activeBabyId)
      .eq("status", "open")
      .order("created_at", { ascending: false }),
  ]);
  const feedback = getConflictsFeedback(query);

  return (
    <main className="henrii-page">
      <h1 className="henrii-title">{t("title")}</h1>
      {feedback ? (
        <p className={feedback.tone === "error" ? "henrii-feedback-error" : "henrii-feedback-success"}>
          {feedback.message}
        </p>
      ) : null}
      <p className="henrii-subtitle">{t("body")}</p>

      <section className="space-y-3">
        <h2 className="font-heading text-xl font-semibold">
          {t("openTitle")} ({openConflicts?.length ?? 0})
        </h2>
        {openConflicts && openConflicts.length > 0 ? (
          openConflicts.map((conflict) => {
            const snapshotA = (conflict.event_1_snapshot ?? {}) as SnapshotRecord;
            const snapshotB = (conflict.event_2_snapshot ?? {}) as SnapshotRecord;

            return (
              <article
                key={conflict.id}
                className="henrii-card"
              >
                <p className="text-sm font-semibold">{t("potentialDuplicate")}</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-xl border border-border/70 bg-background p-3 text-sm">
                    <p>{formatSnapshot(conflict.event_table, snapshotA, t)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(conflict.event_1_happened_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-background p-3 text-sm">
                    <p>{formatSnapshot(conflict.event_table, snapshotB, t)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(conflict.event_2_happened_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <form action={resolveConflictAction}>
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="conflictId" value={conflict.id} />
                    <input type="hidden" name="action" value="keep_both" />
                    <button
                      type="submit"
                      className="inline-flex h-9 items-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground transition hover:brightness-95"
                    >
                      {t("keepBoth")}
                    </button>
                  </form>
                  <form action={resolveConflictAction}>
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="conflictId" value={conflict.id} />
                    <input type="hidden" name="action" value="dismiss" />
                    <button
                      type="submit"
                      className="inline-flex h-9 items-center rounded-full border border-border bg-background px-4 text-xs font-semibold transition hover:bg-accent"
                    >
                      {t("dismiss")}
                    </button>
                  </form>
                </div>
              </article>
            );
          })
        ) : (
          <p className="henrii-card-muted text-sm text-muted-foreground">
            {t("emptyOpen")}
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-xl font-semibold">
          {t("mutationTitle")} ({openMutationConflicts?.length ?? 0})
        </h2>
        {openMutationConflicts && openMutationConflicts.length > 0 ? (
          openMutationConflicts.map((conflict) => (
            <article
              key={conflict.id}
              className="henrii-card"
            >
              <p className="text-sm font-semibold">
                {conflict.event_table} · {conflict.operation}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("mutationExpected")}: {conflict.expected_updated_at ?? "none"}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("mutationActual")}: {conflict.actual_updated_at}
              </p>
              <form action={resolveMutationConflictAction} className="mt-3">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="conflictId" value={conflict.id} />
                <button
                  type="submit"
                  className="inline-flex h-9 items-center rounded-full border border-border bg-background px-4 text-xs font-semibold transition hover:bg-accent"
                >
                  {t("mutationMarkResolved")}
                </button>
              </form>
            </article>
          ))
        ) : (
          <p className="henrii-card-muted text-sm text-muted-foreground">
            {t("mutationEmpty")}
          </p>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="font-heading text-xl font-semibold">{t("resolvedTitle")}</h2>
        {recentResolved && recentResolved.length > 0 ? (
          <ul className="space-y-2">
            {recentResolved.map((item) => (
              <li
                key={item.id}
                className="rounded-xl border border-border/70 bg-card/95 px-3 py-2 text-sm text-muted-foreground"
              >
                {item.event_table} · {item.status} ·{" "}
                {item.resolved_at ? new Date(item.resolved_at).toLocaleString() : "—"}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{t("emptyResolved")}</p>
        )}
      </section>
    </main>
  );
}
