import type { Metadata } from "next";
import { AdminNavbar } from "~/components/admin-navbar";
import { Navbar } from "~/components/navbar";
import { PageLoader } from "~/components/page-loader";
import { Providers } from "~/components/providers";
import "./globals.css";
import { AmbientBackground } from "~/components/ambient-background";
import { getToken } from "~/lib/auth-server";

const siteUrl = "https://0xhckr.dev";

export const metadata: Metadata = {
  title: "0xhckr | Mohammad Al-Ahdal | Software Developer",
  description:
    "Software developer, homelab enthusiast, and a lover of Nix. Making things by smashing my hands on my keyboard.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: "0xhckr | Mohammad Al-Ahdal | Software Developer",
    description:
      "Software developer, homelab enthusiast, and a lover of Nix. Making things by smashing my hands on my keyboard.",
    siteName: "0xhckr",
    images: [
      {
        url: `${siteUrl}/api/og?title=0xhckr&description=Mohammad%20Al-Ahdal%20%7C%20Software%20Developer`,
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "0xhckr | Mohammad Al-Ahdal | Software Developer",
    description:
      "Software developer, homelab enthusiast, and a lover of Nix. Making things by smashing my hands on my keyboard.",
    images: [
      `${siteUrl}/api/og?title=0xhckr&description=Mohammad%20Al-Ahdal%20%7C%20Software%20Developer`,
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const token = await getToken();
  return (
    <html lang="en" dir="ltr" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Mohammad Al-Ahdal",
              alternateName: "0xhckr",
              url: "https://0xhckr.dev",
              sameAs: [
                "https://github.com/0xhckr",
                "https://x.com/0xhckrdev",
                "https://linkedin.com/in/mohammadalahdal",
              ],
              jobTitle: "Software Developer",
              knowsAbout: [
                "TypeScript",
                "React",
                "Rust",
                "NixOS",
                "Tailwind CSS",
                "Next.js",
              ],
            }),
          }}
        />
      </head>
      <body className="antialiased">
        <Providers initialToken={token}>
          <PageLoader>
            <AmbientBackground />
            <Navbar />
            <AdminNavbar />
            <main className="relative z-10">{children}</main>
          </PageLoader>
        </Providers>
      </body>
    </html>
  );
}
