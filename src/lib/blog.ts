import matter from "gray-matter";

const postFiles = import.meta.glob("/content/blog/*.mdx", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
}

interface Post {
  meta: PostMeta;
  content: string;
}

const posts: Record<string, Post> = Object.fromEntries(
  Object.entries(postFiles).map(([filePath, raw]) => {
    const slug =
      filePath
        .split("/")
        .at(-1)
        ?.replace(/\.mdx$/, "") ?? filePath;
    const { data, content } = matter(raw);
    return [
      slug,
      {
        meta: {
          slug,
          title: data.title ?? slug,
          description: data.description ?? "",
          date: String(data.date ?? ""),
        },
        content,
      },
    ];
  }),
);

export function getPostMetaList(): PostMeta[] {
  return Object.values(posts)
    .map((post) => post.meta)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): Post {
  const post = posts[slug];
  if (!post) {
    throw new Error(`Post not found: ${slug}`);
  }
  return post;
}

export function getAllSlugs(): string[] {
  return Object.keys(posts);
}
