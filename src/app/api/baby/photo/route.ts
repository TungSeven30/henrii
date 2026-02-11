import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed image types with their magic bytes signatures
const ALLOWED_IMAGE_TYPES = {
  jpg: {
    mimeType: "image/jpeg",
    signatures: [[0xff, 0xd8, 0xff]], // JPEG starts with FF D8 FF
  },
  jpeg: {
    mimeType: "image/jpeg",
    signatures: [[0xff, 0xd8, 0xff]],
  },
  png: {
    mimeType: "image/png",
    signatures: [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]], // PNG signature
  },
  gif: {
    mimeType: "image/gif",
    signatures: [
      [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
      [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], // GIF89a
    ],
  },
  webp: {
    mimeType: "image/webp",
    signatures: [[0x52, 0x49, 0x46, 0x46]], // RIFF header (followed by file size and WEBP)
  },
} as const;

type AllowedImageExtension = keyof typeof ALLOWED_IMAGE_TYPES;

function getFileExtension(filename: string): AllowedImageExtension | null {
  const parts = filename.split(".");
  const raw = parts[parts.length - 1] ?? "";
  const cleaned = raw.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (cleaned in ALLOWED_IMAGE_TYPES) {
    return cleaned as AllowedImageExtension;
  }
  return null;
}

async function validateImageContent(
  file: File,
  expectedExtension: AllowedImageExtension
): Promise<{ valid: boolean; actualType?: string }> {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const typeConfig = ALLOWED_IMAGE_TYPES[expectedExtension];

  // Check if file matches any of the allowed signatures for the expected type
  for (const signature of typeConfig.signatures) {
    if (signature.length > bytes.length) continue;
    
    let matches = true;
    for (let i = 0; i < signature.length; i++) {
      if (bytes[i] !== signature[i]) {
        matches = false;
        break;
      }
    }
    if (matches) {
      return { valid: true };
    }
  }

  // Special check for WebP - need to verify "WEBP" at bytes 8-11
  if (expectedExtension === "webp") {
    const riffHeader = [0x52, 0x49, 0x46, 0x46]; // RIFF
    const webpMarker = [0x57, 0x45, 0x42, 0x50]; // WEBP
    
    let hasRiff = true;
    for (let i = 0; i < 4; i++) {
      if (bytes[i] !== riffHeader[i]) {
        hasRiff = false;
        break;
      }
    }
    
    let hasWebp = true;
    for (let i = 0; i < 4; i++) {
      if (bytes[8 + i] !== webpMarker[i]) {
        hasWebp = false;
        break;
      }
    }
    
    if (hasRiff && hasWebp) {
      return { valid: true };
    }
  }

  // Detect actual file type for error reporting
  let detectedType = "unknown";
  
  // Check for JPEG
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    detectedType = "jpeg";
  } else if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    detectedType = "png";
  } else if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    detectedType = "gif";
  } else if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
    detectedType = "webp";
  }

  return { valid: false, actualType: detectedType };
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

  // Validate file extension is allowed
  const ext = getFileExtension(file.name);
  if (!ext) {
    return NextResponse.json(
      { error: "Invalid file type. Allowed: jpg, jpeg, png, gif, webp" },
      { status: 400 }
    );
  }

  // Validate actual file content using magic bytes
  const validation = await validateImageContent(file, ext);
  if (!validation.valid) {
    return NextResponse.json(
      { 
        error: `File content does not match extension. Expected ${ext}, detected ${validation.actualType || "unknown"}` 
      },
      { status: 400 }
    );
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
