import { redirect } from "next/navigation";

type TimelineContentProps = {
  params: Promise<{ locale: string }>;
};

export async function TimelineContent({ params }: TimelineContentProps) {
  const { locale } = await params;
  redirect(`/${locale}/dashboard?view=timeline`);
}

export default TimelineContent;

