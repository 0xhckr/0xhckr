"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";
import { ScrambleText } from "~/components/scramble-text";
import { onPageReady } from "~/lib/page-ready";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const aboutParagraphs = [
  "I also dabble in a lot of homelabbing projects — currently self-hosting dokploy, pyrodactyl, and home assistant.",
  "I love and use NixOS and Nix on a daily basis. Reproducible builds, declarative config, pinned versioning for projects — it really is one of the best things I've ever integrated into my workflow.",
  "Most of my time goes into building web apps, wrangling servers, and convincing everyone that Linux is better than Windows.",
];

const projects = [
  {
    title: "stoa.gg",
    href: "https://stoa.gg",
    description:
      "A private communications platform like Discord and Slack. Built using Tauri, LiveKit, and React.",
  },
  {
    title: "thenix.guide",
    href: "https://thenix.guide",
    description: "A guide to Nix and NixOS. (really just a propaganda piece).",
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
          <a href={p.href} target="_blank" rel="noopener noreferrer">
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
            <div className="mt-10 flex flex-col gap-6 sm:mt-14 sm:flex-row sm:items-end sm:justify-between">
              <p className="hero-meta max-w-md text-[0.9375rem] leading-relaxed text-muted-foreground sm:text-base">
                I build most things with TypeScript, React, and Tailwind.
                Currently on my journey to learn Rust.
              </p>
              <div className="hero-meta flex items-center gap-3 font-mono text-xs text-muted-foreground select-none">
                <span className="inline-block size-1.5 animate-pulse rounded-full bg-accent" />
                software developer
              </div>
            </div>
          </div>

          <div className="hero-meta absolute inset-x-0 bottom-10 flex justify-center">
            <div className="flex flex-col items-center gap-3">
              <span className="font-mono text-[0.625rem] tracking-[0.3em] text-muted-foreground uppercase select-none">
                scroll
              </span>
              <span className="h-10 w-px overflow-hidden bg-foreground/10">
                <span className="block h-full w-full origin-top animate-[scrollhint_1.8s_ease-in-out_infinite] bg-accent" />
              </span>
            </div>
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
                  target="_blank"
                  rel="noopener noreferrer"
                  className="fade-up row-hover group block border-t hairline py-8 sm:py-10"
                >
                  <div className="flex items-baseline gap-5 sm:gap-8">
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

        {/* contact */}
        <section className="px-5 py-24 sm:px-8 sm:py-32">
          <div className="mx-auto max-w-5xl">
            <SectionHeading index="03" title="get in touch" />
            <div className="mt-10 grid gap-px overflow-hidden border hairline bg-border sm:mt-14 sm:grid-cols-2">
              {contactLinks.map((l) => {
                const isExternal = !l.href.startsWith("mailto:");
                return (
                  <a
                    key={l.label}
                    href={l.href}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    className="fade-up group flex items-center justify-between gap-4 bg-background px-6 py-6 transition-colors duration-300 hover:bg-foreground/[0.03] sm:px-8 sm:py-8"
                  >
                    <div>
                      <p className="font-mono text-xs tracking-[0.15em] text-muted-foreground uppercase">
                        {l.label}
                      </p>
                      <p className="mt-1.5 font-sans text-base text-foreground/90 transition-colors group-hover:text-accent">
                        {l.meta}
                      </p>
                    </div>
                    <ArrowUpRight className="size-4 shrink-0 text-muted-foreground/40 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent" />
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        {/* footer */}
        <footer className="border-t hairline px-5 py-10 sm:px-8">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-xs text-muted-foreground">
              <span className="text-accent">©</span> 2026 0xhckr
            </p>
            <p className="font-mono text-xs text-muted-foreground/60">
              nixos · next.js · gsap
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
