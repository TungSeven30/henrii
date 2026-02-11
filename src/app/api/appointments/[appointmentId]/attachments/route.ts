import { NextResponse } from "next/server";
import { canWriteToBaby, getBabyPremiumStatus } from "@/lib/billing/baby-plan";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sanitizeFileName } from "@/lib/files/sanitize-file-name";

const BUCKET_NAME = "appointment-attachments";
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

type RouteContext = {
  params: Promise<{ appointmentId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { appointmentId } = await context.params;
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: appointment, error: appointmentError } = await supabase
    .from("appointments")
    .select("id, baby_id")
    .eq("id", appointmentId)
    .single();

  if (appointmentError || !appointment) {
    return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
  }

  const canWrite = await canWriteToBaby({
    supabase,
    babyId: appointment.baby_id,
    userId: user.id,
  });
  if (!canWrite) {
    return NextResponse.json(
      { error: "Caregiver logging is read-only until premium is active for this baby." },
      { status: 403 },
    );
  }

  const plan = await getBabyPremiumStatus({
    supabase,
    babyId: appointment.baby_id,
  });
  if (!plan.premium) {
    return NextResponse.json(
      { error: "Appointment attachments require a premium subscription." },
      { status: 402 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file upload" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { error: "File too large. Maximum supported size is 10MB." },
      { status: 413 },
    );
  }

  const safeName = sanitizeFileName(file.name);
  const filePath = `${appointment.baby_id}/${appointment.id}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, { contentType: file.type || "application/octet-stream" });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 400 });
  }

  const { data: metadata, error: metadataError } = await supabase
    .from("appointment_attachments")
    .insert({
      appointment_id: appointment.id,
      baby_id: appointment.baby_id,
      uploaded_by: user.id,
      file_path: filePath,
      file_name: file.name,
      mime_type: file.type || null,
      size_bytes: file.size,
    })
    .select("id, file_name")
    .single();

  if (metadataError) {
    await supabase.storage.from(BUCKET_NAME).remove([filePath]);
    return NextResponse.json({ error: metadataError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, attachment: metadata });
}
