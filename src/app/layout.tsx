import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Nunito } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { OfflineSyncProvider } from "@/components/offline/offline-sync-provider";
import { ThemeScheduleProvider } from "@/components/theme/theme-schedule-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-body-family",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-heading-family",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono-family",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "henrii",
  description: "Baby tracking PWA for feedings, sleep, diapers, and milestones.",
};

const themeBootstrapScript = `
(() => {
  try {
    const cookies = document.cookie.split("; ");
    const darkModeCookie = cookies.find((row) => row.startsWith("dark_mode_schedule="));
    const legacyCookie = cookies.find((row) => row.startsWith("henrii_theme_schedule="));

    let shouldUseDark = false;

    if (darkModeCookie) {
      const parsed = JSON.parse(decodeURIComponent(darkModeCookie.slice("dark_mode_schedule=".length)));
      const start = typeof parsed.start === "string" ? parsed.start : "19:00";
      const end = typeof parsed.end === "string" ? parsed.end : "07:00";

      const [startH, startM] = start.split(":").map((value) => Number.parseInt(value || "0", 10));
      const [endH, endM] = end.split(":").map((value) => Number.parseInt(value || "0", 10));
      const startMinutes = (Number.isFinite(startH) ? startH : 19) * 60 + (Number.isFinite(startM) ? startM : 0);
      const endMinutes = (Number.isFinite(endH) ? endH : 7) * 60 + (Number.isFinite(endM) ? endM : 0);
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      shouldUseDark =
        startMinutes > endMinutes
          ? currentMinutes >= startMinutes || currentMinutes < endMinutes
          : currentMinutes >= startMinutes && currentMinutes < endMinutes;
    } else {
      const parsed = legacyCookie
        ? JSON.parse(decodeURIComponent(legacyCookie.slice("henrii_theme_schedule=".length)))
        : {};
      const startHour = Number.isInteger(parsed.startHour) ? parsed.startHour : 7;
      const endHour = Number.isInteger(parsed.endHour) ? parsed.endHour : 19;
      const nowHour = new Date().getHours();
      shouldUseDark = nowHour >= endHour || nowHour < startHour;
    }

    document.documentElement.dataset.theme = shouldUseDark ? "dark" : "light";
    document.documentElement.classList.toggle("dark", shouldUseDark);
  } catch (_error) {
    document.documentElement.dataset.theme = "light";
    document.documentElement.classList.remove("dark");
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body
        className={`${inter.variable} ${nunito.variable} ${jetBrainsMono.variable} antialiased`}
      >
        <ServiceWorkerRegister />
        <OfflineSyncProvider />
        <ThemeScheduleProvider />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
