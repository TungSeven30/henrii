import { getTranslations } from "next-intl/server";

type PrivacyPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  const sections = [
    {
      title: "Information we collect",
      body: "Account email, baby profile details, and the logs you enter (feeding, sleep, diapers, growth, milestones, vaccinations, appointments).",
    },
    {
      title: "How we use data",
      body: "To run sync, caregiver sharing, reminders, analytics, and export tools. We only process data required to provide the app.",
    },
    {
      title: "Security and storage",
      body: "Data is protected in transit and at rest. Offline entries are stored locally on your device first, then synced when connection returns.",
    },
    {
      title: "Sharing",
      body: "Data is only shared with caregivers you explicitly invite, and trusted processors needed to deliver the service.",
    },
    {
      title: "Your controls",
      body: "You can export your data, revoke caregiver access, and request account deletion from settings.",
    },
  ];

  return (
    <main className="henrii-page-narrow py-12 md:py-16">
      <header className="mb-10 space-y-3">
        <h1 className="henrii-title">{t("privacyTitle")}</h1>
        <p className="text-sm text-muted-foreground">Last updated: February 9, 2026</p>
        <p className="text-muted-foreground">
          henrii is built for families, so privacy defaults are strict. Data access is baby-scoped
          and enforced with row-level authorization controls.
        </p>
      </header>

      <div className="space-y-4">
        {sections.map((section) => (
          <section key={section.title} className="henrii-card">
            <h2 className="font-heading text-xl font-semibold">{section.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
          </section>
        ))}
      </div>

      <section className="henrii-card-danger mt-6">
        <h2 className="font-heading text-xl font-semibold">{t("deleteTitle")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("deleteBody")}</p>
      </section>
    </main>
  );
}
