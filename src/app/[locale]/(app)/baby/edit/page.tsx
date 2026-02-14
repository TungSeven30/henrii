import { redirect } from "next/navigation";

type BabyEditPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function BabyEditPage({ params }: BabyEditPageProps) {
  const { locale } = await params;
  redirect(`/${locale}/baby`);
}

