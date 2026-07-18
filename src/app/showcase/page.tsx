import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { DitherHover } from "~/components/dither-hover";
import { PageHeader } from "~/components/page-header";
import { Reveal } from "~/components/reveal";
import { generatePageMetadata } from "~/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Showcase",
  description:
    "A collection of projects I've built - from communications platforms to developer tools.",
  path: "/showcase",
});

const projects: { title: string; description: string; link?: string }[] = [
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
    title: "0xhckr.dev",
    description: "my personal portfolio site.",
    link: "https://0xhckr.dev",
  },
  {
    title: "itsasecret.dev",
    description:
      "a platform for managing secrets and environment variables with your team.",
    link: "https://itsasecret.dev",
  },
  {
    title: "rocky.systems",
    description: "a group of friends who hack on code together every sunday.",
    link: "https://rocky.systems",
  },
  {
    title: "???",
    description: "a development platform. more details soon.",
  },
  {
    title: "peep.codes",
    description: "a build-your-own pr reviewer for your workflows.",
    link: "https://peep.codes",
  },
  {
    title: "gojo",
    description: "jj version control with a slick terminal ui.",
    link: "https://github.com/0xhckr/gojo",
  },
];

export default function Showcase() {
  return (
    <main id="main-content" tabIndex={-1}>
      <div className="mx-auto max-w-5xl px-5 pt-36 pb-24 sm:px-8 sm:pt-44">
        <PageHeader
          eyebrow="showcase"
          title="Selected work"
          description="A collection of projects I've built — from communications platforms to developer tools."
        />

        <Reveal className="mt-16 sm:mt-20">
          {projects.map((project, i) => (
            <a
              key={project.title}
              href={project.link}
              target={project.link ? "_blank" : undefined}
              rel={project.link ? "noopener noreferrer" : undefined}
              className="reveal-item row-hover group relative block border-t hairline py-8 sm:py-10"
            >
              <DitherHover />
              <div className="relative flex items-baseline gap-5 sm:gap-8">
                <span className="font-mono text-xs text-muted-foreground/60">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h2 className="glitch-hover font-sans text-2xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-accent sm:text-4xl">
                    {project.title}
                    <ArrowUpRight className="mb-0.5 ml-2.5 inline-block size-5 text-muted-foreground/50 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-accent sm:ml-3.5 sm:size-7" />
                  </h2>
                  <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
                    {project.description}
                  </p>
                </div>
              </div>
            </a>
          ))}
          <div className="reveal-item border-t hairline" />
        </Reveal>
      </div>
    </main>
  );
}
