import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getMarketingBlogPosts } from "@/lib/marketing-blog";
import { SafeImage } from "@/components/marketing/safe-image";

export const metadata: Metadata = {
  title: "henrii Blog",
  description: "Baby tracking tips and product updates from the henrii team.",
};

type Props = {
  params: Promise<{ locale: string }>;
};

function formatDate(rawDate: string, locale: string) {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(rawDate));
  } catch {
    return rawDate;
  }
}

export default async function MarketingBlogPage({ params }: Props) {
  const { locale } = await params;
  const posts = getMarketingBlogPosts();
  const t = await getTranslations("marketing.blog");

  if (posts.length === 0) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-16 md:py-20">
      <header className="space-y-3 text-center">
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground">
          {t("title")}
        </h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </header>

      <section className="mt-10 grid gap-6 md:grid-cols-2">
        {posts.map((post) => (
          <article
            key={post.slug}
            className="rounded-2xl border border-border bg-card overflow-hidden"
          >
            {post.coverImage ? (
              <SafeImage
                src={post.coverImage}
                fallbackSrc={post.coverImageFallback ?? "/marketing/article-cover.svg"}
                alt={post.title}
                className="h-48 w-full object-cover"
                loading="lazy"
              />
            ) : null}

            <div className="p-5">
              <p className="text-xs text-muted-foreground">
                {formatDate(post.date, locale)} · {post.readTime} min read
              </p>
              <h2 className="mt-2 text-xl font-bold text-foreground">{post.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{post.excerpt}</p>
              <p className="mt-4 text-xs text-muted-foreground">{post.author}</p>
              <div className="mt-4">
                <Link
                  href={`/${locale}/blog/${post.slug}`}
                  className="inline-flex text-sm font-medium text-primary hover:text-primary/80"
                >
                  {t("readMore")}
                </Link>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-10 text-center text-muted-foreground">
        {posts.length === 0 ? <p>{t("empty")}</p> : null}
      </section>
    </main>
  );
}
