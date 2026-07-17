import { ArrowLeft } from "lucide-react";
import { marked } from "marked";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "~/components/page-header";
import { getAllSlugs, getPostBySlug } from "~/lib/blog";
import { generatePageMetadata } from "~/lib/metadata";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-static";

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  try {
    const { meta } = getPostBySlug(slug);
    return generatePageMetadata({
      title: meta.title,
      description: meta.description,
      path: `/blog/${meta.slug}`,
    });
  } catch {
    return { title: "Not Found | 0xhckr" };
  }
}

export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params;

  let post: ReturnType<typeof getPostBySlug>;
  try {
    post = getPostBySlug(slug);
  } catch {
    notFound();
  }

  const html = await marked(post.content);

  return (
    <main id="main-content" tabIndex={-1}>
      <article className="mx-auto max-w-3xl px-5 pt-36 pb-24 sm:px-8 sm:pt-44">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground transition-colors hover:text-accent"
        >
          <ArrowLeft className="size-3.5" />
          all posts
        </Link>

        <header className="mt-10 mb-12 border-b hairline pb-12">
          <PageHeader eyebrow="writing" title={post.meta.title} />
          <time
            dateTime={post.meta.date}
            className="mt-6 block font-mono text-xs text-muted-foreground"
          >
            {new Date(post.meta.date).toLocaleDateString("en-CA", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </header>
        <div
          className="blog-prose max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>
    </main>
  );
}
