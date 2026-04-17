import { PageHeading } from "~/components/page-heading";
import { TypewriterPosts } from "~/components/typewriter-posts";
import { getPostMetaList } from "~/lib/blog";

export default function Blog() {
  const posts = getPostMetaList();

  return (
    <main id="main-content" tabIndex={-1}>
      <div className="flex min-h-screen flex-col items-center justify-center px-4 sm:px-8">
        <div className="tw-content w-full max-w-2xl lowercase">
          <PageHeading text="Blog" inline />
          <TypewriterPosts posts={posts} />
        </div>
      </div>
    </main>
  );
}
