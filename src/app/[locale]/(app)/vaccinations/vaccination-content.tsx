import { redirect } from "next/navigation";

type VaccinationsContentProps = {
  params: Promise<{ locale: string }>;
};

export async function VaccinationsContent({ params }: VaccinationsContentProps) {
  const { locale } = await params;
  redirect(`/${locale}/health`);
}

export default VaccinationsContent;

