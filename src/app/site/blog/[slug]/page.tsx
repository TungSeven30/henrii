import { headers } from "next/headers";
import { redirect } from "next/navigation";

type Params = {
  params: Promise<{ slug: string }>;
};

export default async function SiteBlogPostRedirect({ params }: Params) {
  const { slug } = await params;
  const requestHeaders = await headers();
  const acceptLanguage = requestHeaders.get("accept-language")?.toLowerCase() ?? "";
  const locale = acceptLanguage.startsWith("vi") ? "vi" : "en";

  redirect(`/${locale}/blog/${slug}`);
}

