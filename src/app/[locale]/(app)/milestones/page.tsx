import { redirect } from "next/navigation";

type MilestonesPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function MilestonesPage(props: MilestonesPageProps) {
  const { locale } = await props.params;
  redirect(`/${locale}/growth#milestones`);
}
