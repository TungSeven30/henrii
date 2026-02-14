import { redirect } from "next/navigation";

type Params = {
  params: Promise<{ locale: string }>;
};

export default async function LocaleSiteBlogRedirect({ params }: Params) {
  const { locale } = await params;
  redirect(`/${locale}/blog`);
}

