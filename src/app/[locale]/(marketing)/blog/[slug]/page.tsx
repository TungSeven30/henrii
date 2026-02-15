import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SafeImage } from "@/components/marketing/safe-image";
import {
  getMarketingBlogPost,
  getMarketingBlogPosts,
  getPostBody,
} from "@/lib/marketing-blog";

type Params = {
  params: Promise<{ locale: string; slug: string }>;
};

export const dynamicParams = true;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  const normalizedSlug = decodeURIComponent(slug).trim().toLowerCase();
  const post = getMarketingBlogPost(locale, normalizedSlug);

  if (!post) {
    return {
      title: "Post not found",
      description: "Henrii blog post",
    };
  }

  return {
    title: `${post.title} — henrii`,
    description: post.excerpt,
  };
}

function renderBody(content: string) {
  const blocks = content.split(/\n\n+/);

  return (
    <div className="space-y-3">
      {blocks.map((block, i) => {
        const text = block.trim();

        if (!text) {
          return null;
        }

        if (text.startsWith("## ")) {
          return (
            <h2 key={i} className="font-heading text-2xl font-bold text-foreground">
              {text.replace("## ", "")}
            </h2>
          );
        }

        return (
          <p
            key={i}
            className="text-sm leading-relaxed text-muted-foreground md:text-base"
          >
            {text}
          </p>
        );
      })}
    </div>
  );
}

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

export default async function BlogPostPage({ params }: Params) {
  const { locale, slug } = await params;
  const normalizedSlug = decodeURIComponent(slug).trim().toLowerCase();
  const t = await getTranslations("marketing.blog");
  const post = getMarketingBlogPost(locale, normalizedSlug);

  if (!post) {
    notFound();
  }

  const body = getPostBody(post, locale);
  const related = getMarketingBlogPosts()
    .filter((candidate) => candidate.slug !== normalizedSlug)
    .slice(0, 2);

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 md:py-16">
      <Link
        href={`/${locale}/blog`}
        className="mb-6 inline-flex text-sm text-muted-foreground hover:text-foreground"
      >
        {t("backToBlog")}
      </Link>

      <article className="rounded-2xl border border-border bg-card p-6 md:p-8">
        <header className="space-y-2">
          <p className="text-xs text-muted-foreground">
            {formatDate(post.date, locale)} · {post.readTime} min read
          </p>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">{post.title}</h1>
          <p className="text-sm text-muted-foreground">{post.excerpt}</p>
        </header>

        {post.coverImage ? (
          <div className="mt-5">
            <SafeImage
              src={post.coverImage}
              fallbackSrc={post.coverImageFallback ?? "/marketing/article-cover.svg"}
              alt={post.title}
              className="w-full rounded-xl border border-border"
              loading="eager"
            />
          </div>
        ) : null}

        <section className="mt-8">{renderBody(body)}</section>
      </article>

      {related.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-xl font-bold text-foreground">{t("keepReading")}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {related.map((item) => (
              <Link
                key={item.slug}
                href={`/${locale}/blog/${item.slug}`}
                className="rounded-xl border border-border bg-card p-4 hover:border-primary/30"
              >
                <p className="text-xs text-muted-foreground">
                  {formatDate(item.date, locale)}
                </p>
                <h3 className="mt-1 font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

export function generateStaticParams() {
  const locales = ["en", "vi"] as const;
  return locales.flatMap((locale) =>
    getMarketingBlogPosts().map((post) => ({ locale, slug: post.slug })),
  );
}
