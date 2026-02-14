import { canWriteToBaby, getBabyPremiumStatus } from "@/lib/billing/baby-plan";
import { getActiveBabyContext } from "@/lib/supabase/get-active-baby-context";
import { AppointmentsContent } from "./appointments-content";

type AppointmentsPageProps = {
  params: Promise<{ locale: string }>;
};

type AppointmentAttachmentRow = {
  id: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number;
  file_path: string;
  uploaded_by: string;
};

type AppointmentRow = {
  id: string;
  baby_id: string;
  created_by: string;
  client_uuid: string | null;
  title: string;
  scheduled_at: string;
  location: string | null;
  notes: string | null;
  reminder_hours_before: number;
  reminder_sent_at: string | null;
  status: "completed" | "scheduled" | "cancelled";
  created_at: string;
  updated_at: string;
  appointment_attachments: AppointmentAttachmentRow[] | null;
};

export default async function AppointmentsPage({ params }: AppointmentsPageProps) {
  const { locale } = await params;
  const { supabase, activeBabyId, userId } = await getActiveBabyContext(locale);
  const { data: baby } = await supabase
    .from("babies")
    .select("date_of_birth")
    .eq("id", activeBabyId)
    .single();
  const canWrite = await canWriteToBaby({ supabase, babyId: activeBabyId, userId });

  const [{ data: appointmentsData }, { premium }] = await Promise.all([
    supabase
      .from("appointments")
      .select(
        `
          id,
          baby_id,
          created_by,
          client_uuid,
          title,
          scheduled_at,
          location,
          notes,
          reminder_hours_before,
          status,
          reminder_sent_at,
          created_at,
          updated_at,
          appointment_attachments(id, file_name, mime_type, size_bytes, file_path, uploaded_by, created_at)
        `,
      )
      .eq("baby_id", activeBabyId)
      .order("scheduled_at", { ascending: false }),
    getBabyPremiumStatus({ supabase, babyId: activeBabyId }),
  ]);

  const normalizedStatus = (value: string): AppointmentRow["status"] =>
    value === "completed" || value === "cancelled" || value === "scheduled"
      ? value
      : "scheduled";

  const appointments: AppointmentRow[] = (appointmentsData ?? []).map((row) => ({
    ...row,
    status: normalizedStatus(row.status),
  }));

  return (
    <AppointmentsContent
      babyId={activeBabyId}
      userId={userId}
      babyDateOfBirth={baby?.date_of_birth ?? ""}
      premium={premium}
      canWrite={canWrite}
      appointments={appointments}
    />
  );
}
