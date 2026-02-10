import type { Metadata } from "next";
import { MarketingNavbar } from "@/components/marketing/navbar";
import { HeroSection } from "@/components/marketing/hero-section";
import { FeaturesSection } from "@/components/marketing/features-section";
import { DifferentiatorsSection } from "@/components/marketing/differentiators-section";
import { HowItWorksSection } from "@/components/marketing/how-it-works-section";
import { PricingSection } from "@/components/marketing/pricing-section";
import { FaqSection } from "@/components/marketing/faq-section";
import { CtaSection } from "@/components/marketing/cta-section";
import { MarketingFooter } from "@/components/marketing/footer";

export const metadata: Metadata = {
  title: "henrii — Track tiny moments",
  description:
    "A baby tracker that works when you can barely keep your eyes open. Track feedings, sleep, diapers, vaccinations, and growth. One hand. One tap. Done.",
  openGraph: {
    title: "henrii — Track tiny moments",
    description:
      "A baby tracker built for sleep-deprived parents. Track feedings, sleep, diapers, vaccinations, and growth. Works offline. One-handed.",
    type: "website",
    siteName: "henrii",
  },
  twitter: {
    card: "summary_large_image",
    title: "henrii — Track tiny moments",
    description:
      "A baby tracker built for sleep-deprived parents. One hand. One tap. Done.",
  },
};

export default function MarketingPage() {
  return (
    <>
      <MarketingNavbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <DifferentiatorsSection />
        <HowItWorksSection />
        <PricingSection />
        <FaqSection />
        <CtaSection />
      </main>
      <MarketingFooter />
    </>
  );
}
