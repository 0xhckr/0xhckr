"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DitherHover } from "~/components/dither-hover";
import { PixelMountains } from "~/components/pixel-mountains";
import { ScrambleText } from "~/components/scramble-text";
import { onPageReady } from "~/lib/page-ready";
import { cn } from "~/lib/util";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const aboutParagraphs = [
  "I also dabble in a lot of homelabbing projects — currently self-hosting dokploy, pyrodactyl, and home assistant.",
  "I love and use NixOS and Nix on a daily basis. Reproducible builds, declarative config, pinned versioning for projects — it really is one of the best things I've ever integrated into my workflow.",
  "Most of my time goes into building web apps, wrangling servers, and convincing everyone that Linux is better than Windows.",
];

const projects: { title: string; href?: string; description: string }[] = [
  {
    title: "thenix.guide",
    href: "https://thenix.guide",
    description: "A guide to Nix and NixOS. (really just a propaganda piece).",
  },
  {
    title: "rocky.systems",
    href: "https://rocky.systems",
    description:
      "A group of friends who get together on Sundays to hack on code.",
  },
  {
    title: "itsasecret.dev",
    href: "https://itsasecret.dev",
    description:
      "A platform for managing secrets and environment variables with your team.",
  },
  {
    title: "???",
    description: "A development platform. More details soon.",
  },
];

const contactLinks = [
  { label: "github", href: "https://github.com/0xhckr", meta: "@0xhckr" },
  { label: "x", href: "https://x.com/0xhckrdev", meta: "@0xhckrdev" },
  {
    label: "linkedin",
    href: "https://linkedin.com/in/mohammadalahdal",
    meta: "mohammadalahdal",
  },
  { label: "email", href: "mailto:hello@0xhckr.dev", meta: "hello@0xhckr.dev" },
];

function SectionHeading({ index, title }: { index: string; title: string }) {
  return (
    <div className="fade-up flex items-baseline gap-4">
      <span className="font-mono text-xs text-accent">{index}</span>
      <h2 className="font-sans text-xl font-semibold tracking-tight text-foreground">
        <ScrambleText text={title} trigger="view" />
      </h2>
      <span className="h-px flex-1 bg-border" aria-hidden="true" />
    </div>
  );
}

const NoscriptContent = () => (
  <noscript>
    <article className="mx-auto max-w-2xl px-4 py-16 text-sm leading-relaxed text-gray-300 sm:px-8 sm:text-base">
      <h1>Hey, I'm 0xhckr.</h1>
      <p>
        also known as Mohammad Al-Ahdal. I build most things with TypeScript,
        React, and Tailwind. Currently on my journey to learn Rust.
      </p>
      {aboutParagraphs.map((p) => (
        <p key={p.slice(0, 24)}>{p}</p>
      ))}
      <h2>What I'm working on.</h2>
      {projects.map((p) => (
        <p key={p.title}>
          <a
            href={p.href}
            target={p.href ? "_blank" : undefined}
            rel={p.href ? "noopener noreferrer" : undefined}
          >
            {p.title}
          </a>{" "}
          — {p.description}
        </p>
      ))}
      <h2>Get in touch.</h2>
      {contactLinks.map((l) => (
        <p key={l.label}>
          <a href={l.href} target="_blank" rel="noopener noreferrer">
            {l.label}
          </a>
        </p>
      ))}
    </article>
  </noscript>
);

export function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setHasScrolled(true);
    window.addEventListener("scroll", onScroll, { once: true, passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const heroLines = gsap.utils.toArray<HTMLElement>(
          ".reveal-line > span",
          container,
        );
        const heroMeta = gsap.utils.toArray<HTMLElement>(
          ".hero-meta",
          container,
        );

        gsap.set(heroMeta, { opacity: 0, y: 16 });

        const cleanup = onPageReady(() => {
          const nameEl = container.querySelector(".hero-name");
          const tl = gsap.timeline({ delay: 0.1 });
          tl.to(heroLines, {
            y: 0,
            duration: 1,
            stagger: 0.09,
            ease: "power4.out",
          });
          tl.add(() => {
            if (!nameEl) return;
            nameEl.classList.add("glitching");
            nameEl.addEventListener(
              "animationend",
              () => nameEl.classList.remove("glitching"),
              { once: true },
            );
          });
          tl.to(
            heroMeta,
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.08,
              ease: "power3.out",
            },
            "-=0.6",
          );
        });

        const fadeUps = gsap.utils.toArray<HTMLElement>(".fade-up", container);
        for (const el of fadeUps) {
          gsap.fromTo(
            el,
            { opacity: 0, y: 24 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power3.out",
              scrollTrigger: {
                trigger: el,
                start: "top 88%",
                once: true,
              },
            },
          );
        }

        return cleanup;
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".reveal-line > span", { y: 0 });
        gsap.set(".hero-meta, .fade-up", { opacity: 1, y: 0 });
      });
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef}>
      <NoscriptContent />
      <main id="main-content" tabIndex={-1}>
        {/* hero */}
        <section className="relative flex min-h-svh flex-col justify-center px-5 sm:px-8">
          <div className="mx-auto w-full max-w-5xl">
            <p className="hero-meta label">
              <span className="label-index">{"// "}</span>
              <ScrambleText
                text="mohammad al-ahdal"
                trigger="ready"
                delay={1}
              />
            </p>
            <h1 className="mt-6 font-sans text-[clamp(3rem,10vw,7.5rem)] leading-[0.95] font-semibold tracking-[-0.04em]">
              <span className="reveal-line">
                <span>Hey, I'm</span>
              </span>
              <span className="reveal-line">
                <span className="hero-name inline-block">
                  0xhckr<span className="text-accent">.</span>
                </span>
              </span>
            </h1>
            <p className="hero-meta mt-10 max-w-md text-[0.9375rem] leading-relaxed text-muted-foreground sm:mt-14 sm:text-base">
              I'm a software developer building most things with TypeScript,
              React, and Tailwind. Currently on my journey to learn Rust.
            </p>
          </div>

          <div className="hero-meta absolute inset-x-0 bottom-10 flex justify-center">
            <span
              className={cn(
                "font-mono text-[0.625rem] tracking-[0.2em] text-muted-foreground uppercase select-none transition-opacity duration-500",
                hasScrolled && "pointer-events-none opacity-0",
              )}
            >
              psst! there's more stuff below
            </span>
          </div>
        </section>

        {/* about */}
        <section className="px-5 py-24 sm:px-8 sm:py-32">
          <div className="mx-auto max-w-5xl">
            <SectionHeading index="01" title="about" />
            <div className="mt-10 grid gap-8 sm:mt-14 sm:grid-cols-3 sm:gap-10">
              {aboutParagraphs.map((p) => (
                <p
                  key={p.slice(0, 24)}
                  className="fade-up text-[0.9375rem] leading-relaxed text-muted-foreground"
                >
                  {p}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* work */}
        <section className="px-5 py-24 sm:px-8 sm:py-32">
          <div className="mx-auto max-w-5xl">
            <SectionHeading index="02" title="what i'm working on" />
            <div className="mt-10 sm:mt-14">
              {projects.map((p, i) => (
                <a
                  key={p.title}
                  href={p.href}
                  target={p.href ? "_blank" : undefined}
                  rel={p.href ? "noopener noreferrer" : undefined}
                  className="fade-up row-hover group relative block border-t hairline py-8 sm:py-10"
                >
                  <DitherHover />
                  <div className="relative flex items-baseline gap-5 sm:gap-8">
                    <span className="font-mono text-xs text-muted-foreground/60">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="glitch-hover font-sans text-2xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-accent sm:text-4xl">
                        {p.title}
                        <ArrowUpRight className="mb-0.5 ml-2.5 inline-block size-5 text-muted-foreground/50 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-accent sm:ml-3.5 sm:size-7" />
                      </h3>
                      <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
                        {p.description}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
              <div className="border-t hairline" />
            </div>
          </div>
        </section>

        {/* footer */}
        <footer className="border-t hairline">
          <div className="mx-auto grid max-w-5xl gap-12 px-5 py-16 sm:grid-cols-[1.4fr_1fr_1fr] sm:px-8 sm:py-20">
            <div className="fade-up">
              <p className="font-sans text-2xl font-semibold tracking-tight">
                0xhckr<span className="text-accent">.</span>
              </p>
            </div>
            <div className="fade-up">
              <p className="font-mono text-[0.625rem] tracking-[0.3em] text-accent uppercase">
                projects
              </p>
              <ul className="mt-5 space-y-3">
                {projects.map((p) => (
                  <li key={p.title}>
                    {p.href ? (
                      <a
                        href={p.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group font-mono text-sm text-muted-foreground transition-colors hover:text-accent"
                      >
                        {p.title}
                        <ArrowUpRight className="mb-0.5 ml-1.5 inline-block size-3.5 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100" />
                      </a>
                    ) : (
                      <span className="font-mono text-sm text-muted-foreground/50">
                        {p.title}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div className="fade-up">
              <p className="font-mono text-[0.625rem] tracking-[0.3em] text-accent uppercase">
                elsewhere
              </p>
              <ul className="mt-5 space-y-3">
                {contactLinks.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      target={
                        l.href.startsWith("mailto:") ? undefined : "_blank"
                      }
                      rel={
                        l.href.startsWith("mailto:")
                          ? undefined
                          : "noopener noreferrer"
                      }
                      className="group font-mono text-sm text-muted-foreground transition-colors hover:text-accent"
                    >
                      {l.label}
                      <ArrowUpRight className="mb-0.5 ml-1.5 inline-block size-3.5 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <PixelMountains />
        </footer>
      </main>
    </div>
  );
}
