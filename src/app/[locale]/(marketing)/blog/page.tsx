import { Metadata } from "next";
import { getPostsByCategory, type BlogPost, blogPosts } from "@/lib/marketing-blog";
import { MarketingFooter } from "@/components/marketing/footer";
import { MarketingNavbar } from "@/components/marketing/navbar";
import { ArrowLeft, ArrowRight, Clock, Tag } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

const CATEGORIES = [
  { value: "all", labelKey: "all" },
  { value: "parenting", labelKey: "parenting" },
  { value: "product", labelKey: "product" },
  { value: "tips", labelKey: "tips" },
] as const;

function formatDate(dateString: string, locale: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export const metadata: Metadata = {
  title: "henrii Blog",
  description: "Stories and updates from the henrii team.",
};

export default function BlogPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams?: { category?: string };
}) {
  const t = useTranslations("marketing");
  const locale = params.locale;
  const requested = searchParams?.category;
  const allowedCategories: ReadonlyArray<BlogPost["category"]> = [
    "parenting",
    "product",
    "tips",
  ];
  const activeCategory =
    requested && allowedCategories.includes(requested as BlogPost["category"]) ? requested : "all";

  const filtered =
    activeCategory === "all"
      ? [...blogPosts]
      : getPostsByCategory(activeCategory as BlogPost["category"]);

  const posts = filtered.sort((a, b) => b.date.localeCompare(a.date));
  const featured = posts[0];
  const rest = posts.slice(1);

  const categoryColors: Record<BlogPost["category"], string> = {
    parenting: "bg-henrii-pink/15 text-pink-700 dark:text-pink-300",
    tips: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    product: "bg-henrii-blue/15 text-blue-700 dark:bg-henrii-blue/30 dark:text-blue-300",
  };

  const categoryClass =
    activeCategory === "all"
      ? "bg-foreground text-background"
      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground";

  return (
    <div className="min-h-screen bg-background">
      <MarketingNavbar />

      <main className="container pt-24 pb-16 md:pb-24">
        <section className="mb-12 max-w-3xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("blog.backToHome")}
          </Link>

          <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-3">
            {t("blog.title")}
          </h1>
          <p className="text-lg text-muted-foreground">{t("blog.subtitle")}</p>
        </section>

        <div className="mb-12 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const href = cat.value === "all" ? "/blog" : `/blog?category=${cat.value}`;
            const isActive = activeCategory === cat.value;

            return (
              <Link
                key={cat.value}
                href={href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive ? categoryClass : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                {t(`blog.categories.${cat.labelKey}`)}
              </Link>
            );
          })}
        </div>

        {featured && (
          <section className="mb-12">
            <Link href={`/blog/${featured.slug}`} className="group block">
              <article className="rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                {featured.coverImage && (
                  <div className="relative overflow-hidden">
                    <img
                      src={featured.coverImage}
                      alt={featured.title}
                      className="h-56 sm:h-64 w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="eager"
                    />
                  </div>
                )}

                <div className="p-6 md:p-8">
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${categoryColors[featured.category]}`}
                    >
                      <Tag className="h-3.5 w-3.5" />
                      {featured.category}
                    </span>
                    <span className="text-xs text-muted-foreground">{formatDate(featured.date, locale)}</span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {featured.readTime} min read
                    </span>
                  </div>

                  <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {featured.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">{featured.excerpt}</p>

                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all">
                    {t("blog.readMore")}
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </article>
            </Link>
          </section>
        )}

        {rest.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {rest.map((post) => (
              <Link href={`/blog/${post.slug}`} key={post.slug} className="group">
                <article className="h-full rounded-xl border border-border bg-card overflow-hidden hover:border-primary/30 hover:shadow-md transition-all duration-300">
                  {post.coverImage && (
                    <div className="relative overflow-hidden">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="h-44 w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${categoryColors[post.category]}`}
                      >
                        {post.category}
                      </span>
                      <span className="text-xs text-muted-foreground">{formatDate(post.date, locale)}</span>
                    </div>

                    <h3 className="font-heading text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {post.readTime} min
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </section>
        )}

        {posts.length === 0 && (
          <section className="py-20 text-center">
            <p className="text-lg text-muted-foreground">{t("blog.empty")}</p>
          </section>
        )}
      </main>

      <MarketingFooter />
    </div>
  );
}
