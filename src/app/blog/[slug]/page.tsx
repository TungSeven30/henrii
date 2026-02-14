import { headers } from "next/headers";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function MarketingBlogSlugRedirect({ params }: Props) {
  const requestHeaders = await headers();
  const acceptLanguage = requestHeaders.get("accept-language")?.toLowerCase() ?? "";
  const locale = acceptLanguage.startsWith("vi") ? "vi" : "en";
  const { slug } = await params;

  redirect(`/${locale}/blog/${slug}`);
}
