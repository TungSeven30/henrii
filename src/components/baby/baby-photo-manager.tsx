"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { PhotoUpload } from "@/components/baby/photo-upload";

type BabyPhotoManagerProps = {
  babyId: string;
  initialPhotoUrl: string | null;
};

export function BabyPhotoManager({ babyId, initialPhotoUrl }: BabyPhotoManagerProps) {
  const t = useTranslations("baby");
  const [photoUrl, setPhotoUrl] = useState<string | null>(initialPhotoUrl);

  async function handleUpload(url: string) {
    setPhotoUrl(url);
    toast.success(t("updated"));
  }

  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-border/70 bg-card/50 p-4">
      <PhotoUpload babyId={babyId} currentUrl={photoUrl} onUpload={handleUpload} />
    </div>
  );
}
