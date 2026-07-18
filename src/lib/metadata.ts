import type { Metadata } from "next";

const siteUrl = "https://0xhckr.dev";
const siteName = "0xhckr";

function ogImageUrl(title: string, description: string, path?: string): string {
  const params = new URLSearchParams({ title, description });
  if (path) params.set("path", path);
  return `${siteUrl}/api/og?${params.toString()}`;
}

interface PageMeta {
  title: string;
  description: string;
  path?: string;
}

export function generatePageMetadata({
  title,
  description,
  path = "",
}: PageMeta): Metadata {
  const fullTitle = path ? `${title} | ${siteName}` : `${siteName} | ${title}`;
  const url = `${siteUrl}${path}`;
  const image = ogImageUrl(title, description, path || undefined);

  return {
    title: fullTitle,
    description,
    openGraph: {
      type: "website",
      locale: "en_US",
      url,
      title: fullTitle,
      description,
      siteName,
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
    },
    alternates: { canonical: url },
  };
}
