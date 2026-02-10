"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type AppointmentAttachmentUploaderProps = {
  appointmentId: string;
  premium: boolean;
};

export function AppointmentAttachmentUploader({
  appointmentId,
  premium,
}: AppointmentAttachmentUploaderProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      return;
    }

    setSubmitting(true);
    setStatus(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/appointments/${appointmentId}/attachments`, {
        method: "POST",
        body: formData,
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setStatus(body.error ?? "Upload failed");
        return;
      }

      setFile(null);
      setStatus("Uploaded");
      router.refresh();
    } catch {
      setStatus("Upload failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="mt-2 flex flex-wrap items-center gap-2" onSubmit={handleSubmit}>
      {!premium ? (
        <p className="text-xs text-muted-foreground">
          Attachments are available on Premium.
        </p>
      ) : null}
      <input
        type="file"
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        className="max-w-64 text-xs"
        disabled={!premium}
      />
      <button
        type="submit"
        disabled={!premium || !file || submitting}
        className="inline-flex h-8 items-center rounded-full border border-border bg-background px-3 text-xs font-semibold transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Uploading..." : "Upload"}
      </button>
      {status ? <p className="text-xs text-muted-foreground">{status}</p> : null}
    </form>
  );
}
