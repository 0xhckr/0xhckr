import type { Metadata } from "next";
import { Home } from "~/components/home";
import { generatePageMetadata } from "~/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Mohammad Al-Ahdal | Software Developer",
  description:
    "Software developer, homelab enthusiast, and a lover of Nix. Making things by smashing my hands on my keyboard.",
});

export default function HomePage() {
  return <Home />;
}
