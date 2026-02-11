"use client";

import { useRef, useState, useImperativeHandle, forwardRef } from "react";
import { useTranslations } from "next-intl";
import { Camera, Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";
<<<<<<< HEAD
import { createClient } from "@/lib/supabase/client";
=======
>>>>>>> security-audit-2026-02-11

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

interface PhotoUploadProps {
  babyId: string | null;
  currentUrl: string | null;
  onUpload: (url: string) => void;
}

export interface PhotoUploadHandle {
  /** Upload the pending file (selected before the baby existed) using the new baby ID. */
  uploadPending: (newBabyId: string) => Promise<string | null>;
}

async function uploadFile(file: File, targetBabyId: string): Promise<string> {
<<<<<<< HEAD
  const supabase = createClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${targetBabyId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("baby-photos")
    .upload(path, file, { upsert: true });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from("baby-photos")
    .getPublicUrl(path);

  return urlData.publicUrl;
=======
  const formData = new FormData();
  formData.append("babyId", targetBabyId);
  formData.append("file", file);

  const response = await fetch("/api/baby/photo", {
    method: "POST",
    body: formData,
  });

  const payload = (await response.json().catch(() => null)) as
    | { url?: string; error?: string }
    | null;
  if (!response.ok || !payload?.url) {
    throw new Error(payload?.error ?? "Failed to upload photo");
  }

  return payload.url;
>>>>>>> security-audit-2026-02-11
}

export const PhotoUpload = forwardRef<PhotoUploadHandle, PhotoUploadProps>(
  function PhotoUpload({ babyId, currentUrl, onUpload }, ref) {
    const t = useTranslations("baby");
    const inputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const pendingFileRef = useRef<File | null>(null);

    const displayUrl = previewUrl ?? currentUrl;

    useImperativeHandle(ref, () => ({
      async uploadPending(newBabyId: string): Promise<string | null> {
        const file = pendingFileRef.current;
        if (!file) return null;

        try {
          const url = await uploadFile(file, newBabyId);
          pendingFileRef.current = null;
          return url;
<<<<<<< HEAD
        } catch {
          toast.error(t("photoUploadError"));
=======
        } catch (error) {
          toast.error(error instanceof Error ? error.message : t("photoUploadError"));
>>>>>>> security-audit-2026-02-11
          return null;
        }
      },
    }));

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.[0];
      if (!file) return;

      // Reset so the same file can be re-selected
      e.target.value = "";

      if (file.size > MAX_FILE_SIZE) {
        toast.error(t("photoTooLarge"));
        return;
      }

      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);

      if (!babyId) {
        pendingFileRef.current = file;
        return;
      }

      setIsUploading(true);
      try {
        const url = await uploadFile(file, babyId);
        onUpload(url);
<<<<<<< HEAD
      } catch {
        toast.error(t("photoUploadError"));
=======
      } catch (error) {
        toast.error(error instanceof Error ? error.message : t("photoUploadError"));
>>>>>>> security-audit-2026-02-11
        setPreviewUrl(null);
      } finally {
        setIsUploading(false);
      }
    }

    return (
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="relative size-24 rounded-full overflow-hidden bg-muted flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={displayUrl ? t("changePhoto") : t("uploadPhoto")}
        >
          {displayUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element -- blob preview URLs are incompatible with next/image */
            <img
              src={displayUrl}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <Camera className="size-8 text-muted-foreground" />
          )}

          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
              <Loader2 className="size-6 text-white animate-spin" />
            </div>
          )}

          <span className="absolute bottom-0 right-0 flex items-center justify-center size-7 rounded-full bg-primary text-primary-foreground shadow-sm">
            <Pencil className="size-3.5" />
          </span>
        </button>

        <span className="text-xs text-muted-foreground">
          {displayUrl ? t("changePhoto") : t("uploadPhoto")}
        </span>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    );
  },
);
