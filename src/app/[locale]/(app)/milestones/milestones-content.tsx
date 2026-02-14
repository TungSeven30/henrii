import { redirect } from "next/navigation";

type MilestonesContentProps = {
  params: Promise<{ locale: string }>;
};

export async function MilestonesContent({ params }: MilestonesContentProps) {
  const { locale } = await params;
  redirect(`/${locale}/growth`);
}

export default MilestonesContent;

