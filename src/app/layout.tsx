import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import { Providers } from "~/components/providers";
import { PageLoader } from "~/components/page-loader";
import { Navbar } from "~/components/navbar";
import { AdminNavbar } from "~/components/admin-navbar";
import "./globals.css";
import { cn } from "~/lib/utils";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const departureMono = localFont({
  src: "../fonts/DepartureMono-Regular.otf",
  variable: "--font-departure-mono",
  weight: "400",
  style: "normal",
  display: "swap",
});

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={cn(
        "font-mono",
        dmSans.variable,
        departureMono.variable,
        jetbrainsMono.variable,
        "dark",
      )}
    >
      <head>
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
      <body
        className={`${dmSans.variable} ${departureMono.variable} antialiased`}
      >
        <ClerkProvider>
          <Providers>
            <PageLoader>
              <Navbar />
              <AdminNavbar />
              <main>{children}</main>
            </PageLoader>
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
