import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function BlogRedirect() {
  const requestHeaders = await headers();
  const acceptLanguage = requestHeaders.get("accept-language")?.toLowerCase() ?? "";
  const locale = acceptLanguage.startsWith("vi") ? "vi" : "en";

  redirect(`/${locale}/blog`);
}
