"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { onPageReady } from "~/lib/page-ready";

gsap.registerPlugin(useGSAP);

interface Project {
  title: string;
  description: string;
  link: string;
}

interface TypewriterProjectsProps {
  projects: Project[];
}

export const TypewriterProjects = ({ projects }: TypewriterProjectsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      const projectEls = gsap.utils.toArray<HTMLElement>(
        ".tw-project",
        container,
      );
      if (projectEls.length === 0) return;

      for (const el of projectEls) {
        const chars = gsap.utils.toArray<HTMLElement>(".tw-char", el);
        gsap.set(chars, { opacity: 0 });
      }

      const animate = () => {
        const allChars = projectEls.map((el) =>
          gsap.utils.toArray<HTMLElement>(".tw-char", el),
        );
        const maxChars = Math.max(...allChars.map((c) => c.length), 0);
        const staggerDelay = 0.15;
        const totalDuration = 1.5;
        const effectiveSlots =
          maxChars + (projectEls.length - 1) * (staggerDelay / 0.04);
        const charDelay = Math.min(totalDuration / Math.max(effectiveSlots, 1), 0.04);

        projectEls.forEach((el, pIdx) => {
          const chars = allChars[pIdx];
          const tl = gsap.timeline({ delay: pIdx * staggerDelay });
          for (let i = 0; i < chars.length; i++) {
            tl.to(chars[i], { opacity: 1, duration: charDelay }, i * charDelay);
          }
        });
      };

      onPageReady(animate);
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef} className="mt-6 space-y-6">
      {projects.map((project, pIdx) => (
        <div key={pIdx} className="tw-project">
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground/70 transition-colors"
            aria-label={project.title}
          >
            {`[${project.title}](${project.link})`
              .split(" ")
              .flatMap((word, wIdx) => [
                <span key={`lw-${pIdx}-${wIdx}`} className="whitespace-nowrap">
                  {word.split("").map((char, cIdx) => (
                    <span
                      key={`l-${pIdx}-${wIdx}-${cIdx}`}
                      className="tw-char inline-block text-[#2e6b7b] dark:text-[#7dd3e0]"
                      aria-hidden="true"
                    >
                      {char}
                    </span>
                  ))}
                </span>,
                wIdx < `[${project.title}](${project.link})`.split(" ").length - 1 ? " " : null,
              ]).filter(Boolean)}
            <span className="sr-only">{project.title}</span>
          </a>
          <div className="mt-1">
            {project.description.split(" ").flatMap((word, wIdx) => [
                <span key={`dw-${pIdx}-${wIdx}`} className="whitespace-nowrap">
                  {word.split("").map((char, cIdx) => (
                    <span
                      key={`d-${pIdx}-${wIdx}-${cIdx}`}
                      className="tw-char inline-block"
                      aria-hidden="true"
                    >
                      {char}
                    </span>
                  ))}
                </span>,
                wIdx < project.description.split(" ").length - 1 ? " " : null,
              ]).filter(Boolean)}
            <span className="sr-only">{project.description}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
