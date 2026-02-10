"use client";

import { useState } from "react";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email) {
      return;
    }

    setBusy(true);
    setStatus(null);
    const response = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email,
        locale: navigator.language?.startsWith("vi") ? "vi" : "en",
        source: "landing",
      }),
    }).catch(() => null);

    if (!response?.ok) {
      const body = (await response?.json().catch(() => ({}))) as { error?: string } | undefined;
      setStatus(body?.error ?? "Unable to join waitlist.");
      setBusy(false);
      return;
    }

    setStatus("You're on the waitlist.");
    setEmail("");
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="flex w-full max-w-md flex-col gap-2 sm:flex-row">
      <input
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        type="email"
        required
        placeholder="parent@example.com"
        className="h-11 flex-1 rounded-full border border-black/10 bg-white/80 px-4 text-sm shadow-sm backdrop-blur"
      />
      <button
        type="submit"
        disabled={busy}
        className="h-11 rounded-full bg-black px-5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {busy ? "Joining..." : "Join waitlist"}
      </button>
      {status ? <p className="text-xs text-black/60 sm:basis-full">{status}</p> : null}
    </form>
  );
}
