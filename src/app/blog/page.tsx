import type { Metadata } from "next";
import { PageHeading } from "~/components/page-heading";
import { TypewriterPosts } from "~/components/typewriter-posts";
import { getPostMetaList } from "~/lib/blog";
import { generatePageMetadata } from "~/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Blog",
  description: "Thoughts on software, NixOS, homelabbing, and other things.",
  path: "/blog",
});

export default function Blog() {
  const posts = getPostMetaList();

  return (
    <main id="main-content" tabIndex={-1}>
      <div className="flex min-h-screen flex-col items-center px-4 sm:px-8">
        <div className="tw-content my-auto w-full max-w-2xl lowercase pb-navbar pt-admin-navbar">
          <PageHeading text="Blog" inline />
          <TypewriterPosts posts={posts} />
        </div>
      </div>
    </main>
  );
}
