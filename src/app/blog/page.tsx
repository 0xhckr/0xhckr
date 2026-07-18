import type { Metadata } from "next";
import Link from "next/link";
import { DitherHover } from "~/components/dither-hover";
import { PageHeader } from "~/components/page-header";
import { Reveal } from "~/components/reveal";
import { getPostMetaList } from "~/lib/blog";
import { generatePageMetadata } from "~/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Blog",
  description: "Thoughts on software, NixOS, homelabbing, and other things.",
  path: "/blog",
});

export const dynamic = "force-static";

export default function Blog() {
  const posts = getPostMetaList();

  return (
    <main id="main-content" tabIndex={-1}>
      <div className="mx-auto max-w-5xl px-5 pt-36 pb-24 sm:px-8 sm:pt-44">
        <PageHeader
          eyebrow="blog"
          title="Writing"
          description="Thoughts on software, NixOS, homelabbing, and other things."
        />

        <Reveal className="mt-16 sm:mt-20">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="reveal-item row-hover group relative block border-t hairline py-7 sm:py-8"
            >
              <DitherHover />
              <div className="relative flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-10">
                {post.date && (
                  <time
                    dateTime={post.date}
                    className="shrink-0 font-mono text-xs text-muted-foreground/70 tabular-nums sm:w-32"
                  >
                    {new Date(post.date).toLocaleDateString("en-CA", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                    })}
                  </time>
                )}
                <div className="min-w-0">
                  <h2 className="font-sans text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:text-accent sm:text-xl">
                    {post.title}
                  </h2>
                  {post.description && (
                    <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
                      {post.description}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
          <div className="reveal-item border-t hairline" />
        </Reveal>
      </div>
    </main>
  );
}
