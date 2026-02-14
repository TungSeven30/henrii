import { redirect } from "next/navigation";

type NewBabyPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function NewBabyPage({ params }: NewBabyPageProps) {
  const { locale } = await params;
  redirect(`/${locale}/onboarding`);
}

