import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const BUCKET_NAME = "appointment-attachments";

type RouteContext = {
  params: Promise<{ attachmentId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { attachmentId } = await context.params;
  const supabase = await createSupabaseServerClient();
  const requestUrl = new URL(request.url);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.redirect(new URL("/", requestUrl.origin), 303);
  }

  const { data: attachment, error: attachmentError } = await supabase
    .from("appointment_attachments")
    .select("file_path")
    .eq("id", attachmentId)
    .single();

  if (attachmentError || !attachment) {
    return NextResponse.json({ error: "Attachment not found" }, { status: 404 });
  }

  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(attachment.file_path, 60);

  if (signedUrlError || !signedUrlData?.signedUrl) {
    return NextResponse.json({ error: "Unable to generate signed URL" }, { status: 400 });
  }

  return NextResponse.redirect(signedUrlData.signedUrl, 302);
}
