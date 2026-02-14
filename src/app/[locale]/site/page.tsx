import { redirect } from "next/navigation";
import type { Metadata } from "next";

type Params = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "henrii",
};

export default async function LocaleSiteRedirect({ params }: Params) {
  const { locale } = await params;
  redirect(`/${locale}`);
}
