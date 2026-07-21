"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";
import { PixelMountains } from "~/components/pixel-mountains";
import { contactLinks, projects } from "~/lib/site-data";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const footer = footerRef.current;
      if (!footer) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const fadeUps = gsap.utils.toArray<HTMLElement>(".fade-up", footer);
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
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".fade-up", { opacity: 1, y: 0 });
      });
    },
    { scope: footerRef },
  );

  return (
    <footer ref={footerRef} className="relative z-10 border-t hairline">
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
                  target={l.href.startsWith("mailto:") ? undefined : "_blank"}
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
  );
}
