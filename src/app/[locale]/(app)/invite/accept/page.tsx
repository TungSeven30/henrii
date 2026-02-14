import { redirect } from "next/navigation";

type InviteAcceptPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string | string[] }>;
};

function getToken(value: string | string[] | undefined): string {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return "";
}

export default async function InviteAcceptPage({ params, searchParams }: InviteAcceptPageProps) {
  const { locale } = await params;
  const query = await searchParams;
  const token = getToken(query.token).trim();

  if (!token) {
    redirect(`/${locale}/dashboard`);
  }

  redirect(`/${locale}/invite/${encodeURIComponent(token)}`);
}

