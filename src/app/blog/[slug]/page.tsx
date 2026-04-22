import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { PageHeading } from "~/components/page-heading";
import { getAllSlugs, getPostBySlug } from "~/lib/blog";
import { generatePageMetadata } from "~/lib/metadata";

interface PageProps {
  params: Promise<{ slug: string }>;
}

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

  let post;
  try {
    post = getPostBySlug(slug);
  } catch {
    notFound();
  }

  return (
    <main id="main-content" tabIndex={-1}>
      <article className="mx-auto max-w-2xl px-4 pb-navbar pt-admin-navbar sm:px-8">
        <header className="mb-8">
          <PageHeading text={post.meta.title} inline />
          <time
            // only show date, not time
            dateTime={post.meta.date}
            className="mt-2 block text-sm text-foreground/50 font-mono"
          >
            {new Date(post.meta.date).toLocaleDateString("en-CA", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </header>
        <div className="blog-prose max-w-none">
          <MDXRemote source={post.content} />
        </div>
      </article>
    </main>
  );
}
