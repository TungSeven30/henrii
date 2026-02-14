import { redirect } from "next/navigation";

type Params = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function LocaleSiteBlogPostRedirect({ params }: Params) {
  const { locale, slug } = await params;
  redirect(`/${locale}/blog/${slug}`);
}

