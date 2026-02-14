import { redirect } from "next/navigation";

type TimelinePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function TimelinePage(props: TimelinePageProps) {
  const { locale } = await props.params;
  redirect(`/${locale}/dashboard?view=timeline`);
}
