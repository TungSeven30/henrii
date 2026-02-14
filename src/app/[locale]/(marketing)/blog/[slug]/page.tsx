import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, ArrowRight, Clock, Tag } from "lucide-react";
import { getPostBySlug, getPostsByCategory, type BlogPost } from "@/lib/marketing-blog";
import { MarketingFooter } from "@/components/marketing/footer";
import { MarketingNavbar } from "@/components/marketing/navbar";
import { getTranslations } from "next-intl/server";

function formatDate(dateString: string, locale: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function categoryColor(category: BlogPost["category"]) {
  if (category === "parenting") return "bg-henrii-pink/20 text-pink-700 dark:text-pink-300";
  if (category === "tips") return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
  return "bg-henrii-blue/20 text-blue-700 dark:text-blue-300";
}

function parseInline(content: string) {
  const pieces = content.split(/(\*\*.+?\*\*)/g);
  return pieces.map((piece, index) => {
    if (piece.startsWith("**") && piece.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-foreground">
          {piece.slice(2, -2)}
        </strong>
      );
    }

    return <span key={index}>{piece}</span>;
  });
}

function renderBody(content: string) {
  const blocks = content.split("\n\n");

  return (
    <div className="prose prose-sm max-w-none text-muted-foreground md:prose-base">
      {blocks.map((rawBlock, index) => {
        const block = rawBlock.trim();
        if (!block) {
          return null;
        }

        const lines = block.split("\n");
        const hasBulletList = lines.every((line) => line.startsWith("- "));

        if (block.startsWith("## ")) {
          return (
            <h2 key={index} className="font-heading text-2xl md:text-3xl font-bold text-foreground mt-10 mb-4">
              {block.replace("## ", "")}
            </h2>
          );
        }

        if (block.startsWith("### ")) {
          return (
            <h3 key={index} className="font-heading text-xl md:text-2xl font-bold text-foreground mt-8 mb-3">
              {block.replace("### ", "")}
            </h3>
          );
        }

        if (hasBulletList) {
          return (
            <ul key={index} className="space-y-2 list-disc pl-5 my-4">
              {lines.map((line, lineIndex) => (
                <li key={lineIndex} className="leading-relaxed">
                  {parseInline(line.replace(/^- /, ""))}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={index} className="leading-relaxed my-4">
            {parseInline(block)}
          </p>
        );
      })}
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = getPostBySlug(params.slug);

  if (!post) {
    return {
      title: "Post not found",
    };
  }

  return {
    title: `henrii Blog · ${post.title}`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const { slug, locale } = params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const t = await getTranslations("marketing");
  const related = getPostsByCategory(post.category)
    .filter((item) => item.slug !== post.slug)
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <MarketingNavbar />

      <main className="container pt-24 pb-16 md:pb-24">
        {post.coverImage && (
          <div className="mb-10 rounded-2xl overflow-hidden shadow-lg">
            <img
              src={post.coverImage}
              alt={post.title}
              className="h-56 w-full object-cover sm:h-72 md:h-80"
            />
          </div>
        )}

        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("blog.backToBlog")}
        </Link>

        <article className="mx-auto max-w-3xl">
          <div className="mb-4 flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${categoryColor(post.category)}`}
            >
              <Tag className="h-3 w-3" />
              {post.category}
            </span>
            <span className="text-sm text-muted-foreground">{formatDate(post.date, locale)}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {post.readTime} min read
            </span>
            <span>•</span>
            <span className="text-sm text-muted-foreground">{post.author}</span>
          </div>

          <h1 className="font-heading text-3xl md:text-5xl font-bold text-foreground leading-tight">{post.title}</h1>

          <div className="mx-auto mt-10 border-b border-border pb-10">
            {renderBody(post.body)}
          </div>

          <section className="mt-16 rounded-2xl border border-border bg-card p-8 text-center">
            <p className="font-heading text-xl md:text-2xl font-bold text-foreground">
              {t("blog.postCtaTitle")}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{t("blog.postCtaText")}</p>
            <Link
              href="/signup"
              className="inline-flex mt-6 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-henrii-pink-hover transition-colors"
            >
              {t("nav.signup")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </section>

          {related.length > 0 && (
            <section className="mt-16">
              <h2 className="font-heading text-2xl font-bold text-foreground mb-6">{t("blog.keepReading")}</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {related.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/blog/${item.slug}`}
                    className="rounded-xl border border-border p-4 hover:border-primary/30 transition-colors"
                  >
                    <span
                      className={`mb-2 inline-flex rounded-full px-2.5 py-1 text-xs ${categoryColor(item.category)}`}
                    >
                      {item.category}
                    </span>
                    <h3 className="font-heading text-base font-semibold text-foreground">
                      {item.title}
                    </h3>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </main>

      <MarketingFooter />
    </div>
  );
}
