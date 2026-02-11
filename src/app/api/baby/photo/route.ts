import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function getFileExtension(filename: string) {
  const parts = filename.split(".");
  const raw = parts[parts.length - 1] ?? "jpg";
  const cleaned = raw.toLowerCase().replace(/[^a-z0-9]/g, "");
  return cleaned.length > 0 ? cleaned : "jpg";
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const babyId = formData.get("babyId");
  const file = formData.get("file");

  if (typeof babyId !== "string" || babyId.trim().length === 0) {
    return NextResponse.json({ error: "Missing babyId" }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Photo must be less than 5 MB" }, { status: 400 });
  }

  const { data: baby, error: babyError } = await supabase
    .from("babies")
    .select("id, owner_id")
    .eq("id", babyId)
    .maybeSingle();

  if (babyError || !baby) {
    return NextResponse.json({ error: "Baby profile not found" }, { status: 404 });
  }

  let hasAccess = baby.owner_id === user.id;
  if (!hasAccess) {
    const { data: caregiver } = await supabase
      .from("caregivers")
      .select("id")
      .eq("baby_id", babyId)
      .eq("user_id", user.id)
      .eq("invite_status", "accepted")
      .maybeSingle();
    hasAccess = Boolean(caregiver);
  }

  if (!hasAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let admin: ReturnType<typeof createSupabaseAdminClient>;
  try {
    admin = createSupabaseAdminClient();
  } catch {
    admin = null;
  }

  const ext = getFileExtension(file.name);
  const path = `${babyId}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const storageClient = admin ?? supabase;
  const { error: uploadError } = await storageClient.storage
    .from("baby-photos")
    .upload(path, file, { contentType: file.type || "application/octet-stream" });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 400 });
  }

  const { data } = storageClient.storage.from("baby-photos").getPublicUrl(path);
  const { error: updateError } = await supabase
    .from("babies")
    .update({ photo_url: data.publicUrl })
    .eq("id", babyId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  return NextResponse.json({ url: data.publicUrl });
}
