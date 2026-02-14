import { getTranslations } from "next-intl/server";
import { AppointmentAttachmentUploader } from "@/components/health/appointment-attachment-uploader";
import {
  AppointmentArtwork,
  GrowthArtwork,
  MilestoneArtwork,
  VaccinationArtwork,
  type HealthFeatureCardConfig,
} from "@/components/health/feature-artwork";
import { Link } from "@/i18n/navigation";
import { getBabyPremiumStatus } from "@/lib/billing/baby-plan";
import { getActiveBabyContext } from "@/lib/supabase/get-active-baby-context";
import {
  createAppointmentAction,
  markVaccinationCompletedAction,
  seedVaccinationsAction,
} from "./actions";

type HealthPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    error?: string;
    seeded?: string;
    updated?: string;
    appointment?: string;
  }>;
};

export const dynamic = "force-dynamic";

const healthCards: readonly HealthFeatureCardConfig[] = [
  {
    href: "/vaccinations" as const,
    artwork: VaccinationArtwork,
    labelKey: "vaccinations" as const,
    subtitleKey: "vaccinationsSubtitle" as const,
    gradient: "from-henrii-amber/25 via-henrii-amber/15 to-henrii-amber/5",
    iconColor: "text-henrii-amber",
  },
  {
    href: "/growth" as const,
    artwork: GrowthArtwork,
    labelKey: "growth" as const,
    subtitleKey: "growthSubtitle" as const,
    gradient: "from-henrii-purple/25 via-henrii-purple/15 to-henrii-purple/5",
    iconColor: "text-henrii-purple",
  },
  {
    href: "/milestones" as const,
    artwork: MilestoneArtwork,
    labelKey: "milestones" as const,
    subtitleKey: "milestonesSubtitle" as const,
    gradient: "from-henrii-green/25 via-henrii-green/15 to-henrii-green/5",
    iconColor: "text-henrii-green",
  },
  {
    href: "/appointments" as const,
    artwork: AppointmentArtwork,
    labelKey: "appointments" as const,
    subtitleKey: "appointmentsSubtitle" as const,
    gradient: "from-henrii-blue/25 via-henrii-blue/15 to-henrii-blue/5",
    iconColor: "text-henrii-blue",
  },
] as const;

function getHealthFeedback(query: {
  error?: string;
  seeded?: string;
  updated?: string;
  appointment?: string;
}) {
  if (query.error) {
    switch (query.error) {
      case "read_only":
        return {
          tone: "error" as const,
          message: "Caregiver logging is read-only until premium is active for this baby.",
        };
      case "missing_dob":
        return { tone: "error" as const, message: "Missing date of birth for schedule generation." };
      case "vaccination_seed_failed":
        return { tone: "error" as const, message: "Unable to seed vaccination schedule." };
      case "missing_vaccination":
        return { tone: "error" as const, message: "Missing vaccination to update." };
      case "vaccination_update_failed":
        return { tone: "error" as const, message: "Unable to update vaccination status." };
      case "missing_appointment_fields":
        return { tone: "error" as const, message: "Please fill appointment title and date/time." };
      case "invalid_appointment_datetime":
        return { tone: "error" as const, message: "Appointment date/time is invalid." };
      case "appointment_create_failed":
        return { tone: "error" as const, message: "Unable to create appointment." };
      default:
        return { tone: "error" as const, message: "Unable to complete request." };
    }
  }

  if (query.seeded === "1") {
    return { tone: "success" as const, message: "Vaccination schedule generated." };
  }

  if (query.updated === "1") {
    return { tone: "success" as const, message: "Vaccination marked as completed." };
  }

  if (query.appointment === "1") {
    return { tone: "success" as const, message: "Appointment created." };
  }

  return null;
}

export default async function HealthPage({ params, searchParams }: HealthPageProps) {
  const { locale } = await params;
  const query = await searchParams;
  const t = await getTranslations({ locale, namespace: "health" });
  const { supabase, activeBabyId } = await getActiveBabyContext(locale);
  const plan = await getBabyPremiumStatus({
    supabase,
    babyId: activeBabyId,
  });

  const [{ data: baby }, { data: vaccinations }, { data: appointments }, { data: attachments }] =
    await Promise.all([
    supabase
      .from("babies")
      .select("name, date_of_birth, country_code")
      .eq("id", activeBabyId)
      .single(),
    supabase
      .from("vaccinations")
      .select("id, vaccine_name, due_date, status, completed_at")
      .eq("baby_id", activeBabyId)
      .order("due_date", { ascending: true }),
    supabase
      .from("appointments")
      .select("id, title, scheduled_at, location, status")
      .eq("baby_id", activeBabyId)
      .order("scheduled_at", { ascending: true }),
    supabase
      .from("appointment_attachments")
      .select("id, appointment_id, file_name, size_bytes")
      .eq("baby_id", activeBabyId)
      .order("created_at", { ascending: false }),
  ]);

  const attachmentsByAppointmentId = new Map<
    string,
    Array<{ id: string; file_name: string; size_bytes: number }>
  >();
  for (const attachment of attachments ?? []) {
    const existing = attachmentsByAppointmentId.get(attachment.appointment_id) ?? [];
    existing.push(attachment);
    attachmentsByAppointmentId.set(attachment.appointment_id, existing);
  }
  const feedback = getHealthFeedback(query);

  return (
    <main className="henrii-page">
      <h1 className="henrii-title">{t("title")}</h1>
      {feedback ? (
        <p className={feedback.tone === "error" ? "henrii-feedback-error" : "henrii-feedback-success"}>
          {feedback.message}
        </p>
      ) : null}
      <p className="henrii-subtitle">
        {t("forBaby")}: <span className="font-semibold text-foreground">{baby?.name ?? "Unknown"}</span>
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        {healthCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-xl border border-border/70 bg-card px-3 py-3 text-left transition-colors hover:border-foreground/30 hover:bg-card/90"
          >
            <div
              className={`mb-2 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient}`}
            >
              <card.artwork className={`h-6 w-6 ${card.iconColor}`} />
            </div>
            <p className="text-sm font-medium">{t(card.labelKey)}</p>
            <p className="text-xs text-muted-foreground">{t(card.subtitleKey)}</p>
          </Link>
        ))}
      </div>

      <section id="vaccinations" className="henrii-card">
        <h2 className="font-heading text-xl font-semibold">{t("vaccinations")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("vaccinationsBody")}</p>
        <form action={seedVaccinationsAction} className="mt-4 flex flex-wrap items-end gap-3">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="dateOfBirth" value={baby?.date_of_birth ?? ""} />
          <label className="grid gap-1 text-sm">
            {t("country")}
            <select
              name="countryCode"
              className="henrii-select"
              defaultValue={baby?.country_code ?? "US"}
            >
              <option value="US">US</option>
              <option value="GB">GB</option>
              <option value="VN">VN</option>
            </select>
          </label>
          <button type="submit" className="henrii-btn-primary">
            {t("seedSchedule")}
          </button>
        </form>
        {vaccinations && vaccinations.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {vaccinations.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">{item.vaccine_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("dueDate")}: {item.due_date} · {t("status")}: {item.status}
                  </p>
                </div>
                {item.status !== "completed" ? (
                  <form action={markVaccinationCompletedAction}>
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="vaccinationId" value={item.id} />
                    <button
                      type="submit"
                      className="inline-flex h-8 items-center rounded-full border border-border px-3 text-xs font-semibold"
                    >
                      {t("markDone")}
                    </button>
                  </form>
                ) : (
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">
                    {item.completed_at ?? ""}
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">{t("emptyVaccinations")}</p>
        )}
      </section>

      <section id="appointments" className="henrii-card">
        <h2 className="font-heading text-xl font-semibold">{t("appointments")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("appointmentsBody")}</p>
        <form action={createAppointmentAction} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="locale" value={locale} />
          <label className="grid gap-1 text-sm sm:col-span-2">
            {t("appointmentTitle")}
            <input
              name="title"
              required
              className="henrii-input"
              placeholder="Pediatric check-up"
            />
          </label>
          <label className="grid gap-1 text-sm">
            {t("scheduledAt")}
            <input
              name="scheduledAt"
              type="datetime-local"
              required
              className="henrii-input"
            />
          </label>
          <label className="grid gap-1 text-sm">
            {t("location")}
            <input
              name="location"
              className="henrii-input"
              placeholder="Clinic address"
            />
          </label>
          <label className="grid gap-1 text-sm sm:col-span-2">
            {t("notes")}
            <textarea name="notes" className="henrii-textarea" />
          </label>
          <button type="submit" className="henrii-btn-primary sm:col-span-2">
            {t("createAppointment")}
          </button>
        </form>

        {appointments && appointments.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {appointments.map((item) => (
              <li
                key={item.id}
                className="rounded-xl border border-border/70 px-3 py-2 text-sm"
              >
                <p className="font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(item.scheduled_at).toLocaleString()} · {item.location ?? "—"} ·{" "}
                  {item.status}
                </p>
                <AppointmentAttachmentUploader appointmentId={item.id} premium={plan.premium} />
                {attachmentsByAppointmentId.get(item.id)?.length ? (
                  <ul className="mt-2 space-y-1">
                    {attachmentsByAppointmentId.get(item.id)?.map((attachment) => (
                      <li key={attachment.id} className="text-xs text-muted-foreground">
                        <a
                          className="underline"
                          href={`/api/appointments/attachments/${attachment.id}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {attachment.file_name}
                        </a>{" "}
                        ({Math.max(1, Math.round(attachment.size_bytes / 1024))} KB)
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">{t("emptyAppointments")}</p>
        )}
      </section>
    </main>
  );
}
