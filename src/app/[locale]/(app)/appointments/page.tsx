import { redirect } from "next/navigation";

type AppointmentsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AppointmentsPage({ params }: AppointmentsPageProps) {
  const { locale } = await params;
  redirect(`/${locale}/health`);
}

