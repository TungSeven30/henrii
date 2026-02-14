import { getTranslations } from "next-intl/server";

type Appointment = {
  id: string;
  title: string;
  scheduled_at: string;
  location?: string | null;
  status?: string | null;
};

type AppointmentsContentProps = {
  babyId: string;
  appointments: Appointment[];
};

export async function AppointmentsContent({ babyId, appointments }: AppointmentsContentProps) {
  const t = await getTranslations("appointments");

  if (!appointments.length) {
    return <p className="text-sm text-muted-foreground">{t("empty", { defaultValue: "No appointments yet." })}</p>;
  }

  return (
    <section className="henrii-card">
      <p className="mb-2 text-xs text-muted-foreground">
        {t("showingFor", { defaultValue: "Appointments" })}: {babyId}
      </p>
      <ul className="space-y-2">
        {appointments.map((appointment) => (
          <li key={appointment.id} className="rounded-xl border border-border/70 px-3 py-2 text-sm">
            <p className="font-medium">{appointment.title}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(appointment.scheduled_at).toLocaleString()} · {appointment.location ?? "—"} · {appointment.status ?? "scheduled"}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

