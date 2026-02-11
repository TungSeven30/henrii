"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

type InstallPromptProps = {
  eventCount: number;
};

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const DISMISS_KEY = "henrii_install_prompt_dismissed";

function isIosDevice() {
  if (typeof navigator === "undefined") {
    return false;
  }

  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandaloneMode() {
  if (typeof window === "undefined") {
    return false;
  }

  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches || navigatorWithStandalone.standalone === true
  );
}

export function InstallPrompt({ eventCount }: InstallPromptProps) {
  const t = useTranslations("dashboard");
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.localStorage.getItem(DISMISS_KEY) === "1";
  });
  const [installed, setInstalled] = useState(() => isStandaloneMode());
  const [busy, setBusy] = useState(false);

  const eligible = useMemo(() => eventCount >= 3 && !installed && !dismissed, [eventCount, installed, dismissed]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  function dismiss() {
    setDismissed(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DISMISS_KEY, "1");
    }
  }

  async function installNow() {
    if (!deferredPrompt) {
      return;
    }

    setBusy(true);
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice.catch(() => ({ outcome: "dismissed" as const, platform: "" }));
    setBusy(false);

    if (choice.outcome === "accepted") {
      setInstalled(true);
      setDeferredPrompt(null);
      return;
    }
  }

  if (!eligible) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-border/70 bg-card p-4">
      <h2 className="font-heading text-base font-semibold">{t("installPromptTitle")}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{t("installPromptBody")}</p>

      {deferredPrompt ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void installNow()}
            disabled={busy}
            className="h-9 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground"
          >
            {busy ? `${t("installPromptAction")}...` : t("installPromptAction")}
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="h-9 rounded-full border border-border px-4 text-xs font-semibold"
          >
            {t("installPromptDismiss")}
          </button>
        </div>
      ) : isIosDevice() ? (
        <div className="mt-3">
          <p className="text-xs text-muted-foreground">{t("installPromptIosHint")}</p>
          <button
            type="button"
            onClick={dismiss}
            className="mt-2 h-8 rounded-full border border-border px-3 text-[11px] font-semibold"
          >
            {t("installPromptDismiss")}
          </button>
        </div>
      ) : null}
    </section>
  );
}
