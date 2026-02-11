"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

const CONFIRMATION_WORD = "DELETE";

export function DeleteAccountDialog() {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const isConfirmed = confirmation === CONFIRMATION_WORD;

  function handleDelete() {
    if (!isConfirmed) return;

    setIsDeleting(true);

    try {
      const form = document.createElement("form");
      form.method = "POST";
      form.action = `/api/account/delete?locale=${locale}`;
      document.body.appendChild(form);
      form.submit();
    } catch {
      setIsDeleting(false);
      toast.error(t("deleteBody"));
      router.push("/settings");
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setConfirmation("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10">
          <Trash2 className="size-4" />
          {t("deleteAction")}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-destructive">{t("deleteTitle")}</DialogTitle>
          <DialogDescription>
            {t("deleteBody")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-muted-foreground">
            <p className="font-medium text-destructive">{t("deleteTitle")}:</p>
            <ul className="mt-1.5 list-disc pl-5 space-y-0.5">
              <li>{t("deleteBody")}</li>
              <li>{t("signOut")}</li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {t("deleteAccountConfirm")}{" "}
              <strong className="text-foreground">{CONFIRMATION_WORD}</strong>
            </p>
            <Input
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder={CONFIRMATION_WORD}
              autoComplete="off"
              disabled={isDeleting}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isDeleting}
          >
            {tCommon("cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
          >
            {isDeleting ? <Loader2 className="size-4 animate-spin" /> : null}
            {t("deleteAction")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
