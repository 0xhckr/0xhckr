"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { cn } from "~/lib/util";
import { onPageReady } from "~/lib/page-ready";

gsap.registerPlugin(useGSAP);

export const PageHeading = ({
  text,
  inline = false,
}: {
  text: string;
  inline?: boolean;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      const cursor = cursorRef.current;
      if (!container) return;

      const chars = gsap.utils.toArray<HTMLElement>(".tw-char", container);
      if (chars.length === 0) return;

      gsap.set(chars, { opacity: 0 });

      const moveCursor = (char: HTMLElement) => {
        if (!cursor) return;
        cursor.style.left = `${char.offsetLeft + char.offsetWidth}px`;
        cursor.style.top = `${char.offsetTop}px`;
        cursor.style.fontSize = getComputedStyle(char).fontSize;
      };

      const animate = () => {
        const tl = gsap.timeline();
        for (let i = 0; i < chars.length; i++) {
          tl.add(
            () => {
              chars[i].style.opacity = "1";
              moveCursor(chars[i]);
            },
            i * 0.04,
          );
        }
      };

      onPageReady(animate);
    },
    { scope: containerRef },
  );

  if (inline) {
    return (
      <div ref={containerRef} className="relative tw-content">
        <h1>
          {(`# ${text}`.split(" ").flatMap((word, wIdx) => [
            <span key={`w-${wIdx}`} className="whitespace-nowrap">
              {word.split("").map((char, cIdx) => (
                <span
                  key={`${wIdx}-${cIdx}`}
                  className="tw-char inline-block text-2xl sm:text-4xl font-bold text-[#003c3c] dark:text-[#5eead4]"
                  aria-hidden="true"
                >
                  {char}
                </span>
              ))}
            </span>,
            wIdx < `# ${text}`.split(" ").length - 1 ? " " : null,
          ])).filter(Boolean)}
          <span className="sr-only">{text}</span>
        </h1>
        <span
          ref={cursorRef}
          className={cn("tw-cursor")}
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    <main id="main-content" tabIndex={-1}>
      <div className="flex h-screen items-center justify-center px-4 sm:px-8">
        <div
          ref={containerRef}
          className="tw-content relative w-full max-w-2xl overflow-hidden lowercase"
        >
          <h1>
            {(`# ${text}`.split(" ").flatMap((word, wIdx) => [
              <span key={`w-${wIdx}`} className="whitespace-nowrap">
                {word.split("").map((char, cIdx) => (
                  <span
                    key={`${wIdx}-${cIdx}`}
                    className="tw-char inline-block text-2xl sm:text-4xl font-bold text-[#003c3c] dark:text-[#5eead4]"
                    aria-hidden="true"
                  >
                    {char}
                  </span>
                ))}
              </span>,
              wIdx < `# ${text}`.split(" ").length - 1 ? " " : null,
            ])).filter(Boolean)}
            <span className="sr-only">{text}</span>
          </h1>
          <span
            ref={cursorRef}
            className={cn("tw-cursor")}
            aria-hidden="true"
          />
        </div>
      </div>
    </main>
  );
};
