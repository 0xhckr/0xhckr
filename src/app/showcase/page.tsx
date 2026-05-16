import type { Metadata } from "next";
import { PageHeading } from "~/components/page-heading";
import { TypewriterProjects } from "~/components/typewriter-projects";
import { generatePageMetadata } from "~/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Showcase",
  description:
    "A collection of projects I've built - from communications platforms to developer tools.",
  path: "/showcase",
});

const projects = [
  {
    title: "stoa.gg",
    description: "a private communications platform like discord and slack.",
    link: "https://stoa.gg",
  },
  {
    title: "thenix.guide",
    description: "a guide to nix and nixos.",
    link: "https://thenix.guide",
  },
  {
    title: "tngl2github",
    description: "a quaint little mirror from tangled repositories to github.",
    link: "https://tangled.org/0xhckr.dev/tngl2github",
  },
];

export default function Showcase() {
  return (
    <main id="main-content" tabIndex={-1}>
      <div className="flex min-h-screen flex-col items-center px-4 sm:px-8">
        <div className="tw-content my-auto w-full max-w-2xl lowercase pb-navbar pt-admin-navbar">
          <PageHeading text="Showcase" inline />
          <TypewriterProjects projects={projects} />
        </div>
      </div>
    </main>
  );
}
