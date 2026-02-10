import { getTranslations } from "next-intl/server";

type TermsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function TermsPage({ params }: TermsPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  const sections = [
    {
      title: "Service scope",
      body: "henrii provides baby-tracking workflows and caregiver collaboration. It is an informational tool, not a medical device.",
    },
    {
      title: "Account responsibility",
      body: "You are responsible for access to your account and for caregiver invitations issued from your account.",
    },
    {
      title: "Billing and premium",
      body: "Premium unlocks advanced analytics, caregiver invite workflows, and PDF reporting. Plan details are shown in settings.",
    },
    {
      title: "Data ownership",
      body: "You retain ownership of the data you enter. You can export or remove it according to app controls and retention policy.",
    },
    {
      title: "Medical disclaimer",
      body: "Always consult licensed clinicians for diagnosis or treatment decisions. App trends and reminders are support signals only.",
    },
  ];

  return (
    <main className="henrii-page-narrow py-12 md:py-16">
      <header className="mb-10 space-y-3">
        <h1 className="henrii-title">{t("termsTitle")}</h1>
        <p className="text-sm text-muted-foreground">Last updated: February 9, 2026</p>
        <p className="text-muted-foreground">
          These terms define usage expectations for accounts, data handling, and premium features.
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
    </main>
  );
}
