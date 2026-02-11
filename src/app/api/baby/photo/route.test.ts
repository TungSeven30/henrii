import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createSupabaseServerClientMock, createSupabaseAdminClientMock } = vi.hoisted(
  () => ({
    createSupabaseServerClientMock: vi.fn(),
    createSupabaseAdminClientMock: vi.fn(),
  })
);

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: createSupabaseServerClientMock,
}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: createSupabaseAdminClientMock,
}));

import { POST } from "./route";

// Helper to create a mock File with specific byte content
function createMockFile(
  name: string,
  bytes: Uint8Array,
  type?: string
): File {
  const blob = new Blob([bytes.buffer], { type: type || "application/octet-stream" });
  return new File([blob], name, { type: type || "application/octet-stream" });
}

// JPEG magic bytes: FF D8 FF
const jpegBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
// PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
const pngBytes = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
]);
// GIF magic bytes: 47 49 46 38 39 61 (GIF89a)
const gifBytes = new Uint8Array([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00,
]);
// WebP magic bytes: RIFF....WEBP
const webpBytes = new Uint8Array([
  0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
]);
// Some non-image bytes (simulating executable or script)
const maliciousBytes = new Uint8Array([
  0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, // Windows executable header
]);
// PHP script disguised as image
const phpBytes = new Uint8Array([
  0x3c, 0x3f, 0x70, 0x68, 0x70, // <?php
]);

function createPostSupabaseMock(options: { userId?: string | null; baby?: { id: string; owner_id: string } | null } = {}) {
  const userId = options.userId ?? "user_1";
  const baby = options.baby ?? { id: "baby_1", owner_id: "user_1" };

  const getUser = vi.fn().mockResolvedValue({
    data: { user: userId ? { id: userId } : null },
    error: userId ? null : { message: "Not authenticated" },
  });

  const babySingle = vi.fn().mockResolvedValue({
    data: baby,
    error: null,
  });

  const caregiverSingle = vi.fn().mockResolvedValue({
    data: null,
    error: null,
  });

  const from = vi.fn((table: string) => {
    if (table === "babies") {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: babySingle,
          })),
        })),
        update: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({ error: null }),
        })),
      };
    }
    if (table === "caregivers") {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: caregiverSingle,
              })),
            })),
          })),
        })),
      };
    }
    throw new Error(`Unexpected table: ${table}`);
  });

  const storageUpload = vi.fn().mockResolvedValue({ error: null });
  const storageGetPublicUrl = vi.fn().mockReturnValue({
    data: { publicUrl: "https://example.com/photo.jpg" },
  });

  const storage = {
    from: vi.fn(() => ({
      upload: storageUpload,
      getPublicUrl: storageGetPublicUrl,
    })),
  };

  return {
    supabase: {
      auth: { getUser },
      from,
      storage,
    },
    getUser,
    from,
    storage,
    storageUpload,
  };
}

function createPhotoUploadRequest(babyId: string, file: File): Request {
  const formData = new FormData();
  formData.append("babyId", babyId);
  formData.append("file", file);

  return new Request("https://app.henrii.app/api/baby/photo", {
    method: "POST",
    body: formData,
  });
}

describe("POST /api/baby/photo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createSupabaseAdminClientMock.mockImplementation(() => {
      throw new Error("Admin client not available");
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("file content type validation", () => {
    it("should accept valid JPEG file with correct extension", async () => {
      const { supabase, storageUpload } = createPostSupabaseMock();
      createSupabaseServerClientMock.mockResolvedValue(supabase);

      const file = createMockFile("photo.jpg", jpegBytes, "image/jpeg");
      const request = createPhotoUploadRequest("baby_1", file);

      const response = await POST(request);
      expect(response.status).toBe(200);
      expect(storageUpload).toHaveBeenCalled();
    });

    it("should accept valid PNG file with correct extension", async () => {
      const { supabase, storageUpload } = createPostSupabaseMock();
      createSupabaseServerClientMock.mockResolvedValue(supabase);

      const file = createMockFile("photo.png", pngBytes, "image/png");
      const request = createPhotoUploadRequest("baby_1", file);

      const response = await POST(request);
      expect(response.status).toBe(200);
      expect(storageUpload).toHaveBeenCalled();
    });

    it("should accept valid GIF file with correct extension", async () => {
      const { supabase, storageUpload } = createPostSupabaseMock();
      createSupabaseServerClientMock.mockResolvedValue(supabase);

      const file = createMockFile("photo.gif", gifBytes, "image/gif");
      const request = createPhotoUploadRequest("baby_1", file);

      const response = await POST(request);
      expect(response.status).toBe(200);
      expect(storageUpload).toHaveBeenCalled();
    });

    it("should accept valid WebP file with correct extension", async () => {
      const { supabase, storageUpload } = createPostSupabaseMock();
      createSupabaseServerClientMock.mockResolvedValue(supabase);

      const file = createMockFile("photo.webp", webpBytes, "image/webp");
      const request = createPhotoUploadRequest("baby_1", file);

      const response = await POST(request);
      expect(response.status).toBe(200);
      expect(storageUpload).toHaveBeenCalled();
    });

    it("should reject file with mismatched extension and content (JPEG content with PNG extension)", async () => {
      const { supabase, storageUpload } = createPostSupabaseMock();
      createSupabaseServerClientMock.mockResolvedValue(supabase);

      // JPEG content but PNG extension - attack vector
      const file = createMockFile("malicious.png", jpegBytes, "image/png");
      const request = createPhotoUploadRequest("baby_1", file);

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain("File content does not match extension");
      expect(body.error).toContain("png");
      expect(body.error).toContain("jpeg");
      expect(storageUpload).not.toHaveBeenCalled();
    });

    it("should reject file with mismatched extension and content (PNG content with JPG extension)", async () => {
      const { supabase, storageUpload } = createPostSupabaseMock();
      createSupabaseServerClientMock.mockResolvedValue(supabase);

      // PNG content but JPG extension
      const file = createMockFile("malicious.jpg", pngBytes, "image/jpeg");
      const request = createPhotoUploadRequest("baby_1", file);

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain("File content does not match extension");
      expect(body.error).toContain("jpg");
      expect(body.error).toContain("png");
      expect(storageUpload).not.toHaveBeenCalled();
    });

    it("should reject executable file disguised as image", async () => {
      const { supabase, storageUpload } = createPostSupabaseMock();
      createSupabaseServerClientMock.mockResolvedValue(supabase);

      // Windows executable disguised as JPG
      const file = createMockFile("malware.jpg", maliciousBytes, "image/jpeg");
      const request = createPhotoUploadRequest("baby_1", file);

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain("File content does not match extension");
      expect(storageUpload).not.toHaveBeenCalled();
    });

    it("should reject PHP script disguised as image", async () => {
      const { supabase, storageUpload } = createPostSupabaseMock();
      createSupabaseServerClientMock.mockResolvedValue(supabase);

      // PHP script disguised as PNG
      const file = createMockFile("shell.png", phpBytes, "image/png");
      const request = createPhotoUploadRequest("baby_1", file);

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain("File content does not match extension");
      expect(storageUpload).not.toHaveBeenCalled();
    });

    it("should reject files with disallowed extensions", async () => {
      const { supabase, storageUpload } = createPostSupabaseMock();
      createSupabaseServerClientMock.mockResolvedValue(supabase);

      // Try to upload a .exe file
      const file = createMockFile("malware.exe", jpegBytes);
      const request = createPhotoUploadRequest("baby_1", file);

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain("Invalid file type");
      expect(storageUpload).not.toHaveBeenCalled();
    });

    it("should reject files with dangerous extensions even with image content", async () => {
      const { supabase, storageUpload } = createPostSupabaseMock();
      createSupabaseServerClientMock.mockResolvedValue(supabase);

      // Valid JPEG content but .php extension
      const file = createMockFile("shell.php", jpegBytes);
      const request = createPhotoUploadRequest("baby_1", file);

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain("Invalid file type");
      expect(storageUpload).not.toHaveBeenCalled();
    });

    it("should handle empty or missing extension", async () => {
      const { supabase, storageUpload } = createPostSupabaseMock();
      createSupabaseServerClientMock.mockResolvedValue(supabase);

      const file = createMockFile("noextension", jpegBytes, "image/jpeg");
      const request = createPhotoUploadRequest("baby_1", file);

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain("Invalid file type");
      expect(storageUpload).not.toHaveBeenCalled();
    });
  });
});
