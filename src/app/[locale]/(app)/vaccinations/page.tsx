import { redirect } from "next/navigation";

type VaccinationsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function VaccinationsPage(props: VaccinationsPageProps) {
  const { locale } = await props.params;
  redirect(`/${locale}/health`);
}
