"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import { cn } from "~/lib/util";
import { onPageReady } from "~/lib/page-ready";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const CHAR_SCROLL_PX = 8;
const GAP_PX = 200;

interface Line {
  markdownType?: "h1" | "h2" | "h3" | "link" | "comment";
  text: string;
  href?: string;
}

const story: { id: string; lines: Line[] }[] = [
  {
    id: "intro",
    lines: [
      { text: "Hey, I'm 0xhckr.", markdownType: "h1" },
      { text: "also known as Mohammad Al-Ahdal", markdownType: "comment" },
      { text: "I build most things with TypeScript, React," },
      { text: "and Tailwind. Currently on my journey to learn Rust." },
      { text: "" },
      { text: "I also dabble in a lot of homelabbing projects" },
      {
        text: "currently self-hosting dokploy",
      },
      {
        text: "pyrodactyl, and home assistant.",
      },
      { text: "" },
      { text: "I love and use NixOS and Nix on a daily basis." },
      { text: "Reproducible builds, declarative config," },
      { text: "pinned versioning for projects - It really" },
      {
        text: "is one of the best things",
      },
      {
        text: "I've ever integrated into my workflow.",
      },
      { text: "" },
      { text: "Most of my time goes into" },
      { text: "building web apps, wrangling servers," },
      {
        text: "and convincing everyone that",
      },
      {
        text: "Linux is better than Windows.​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​",
      },
      { text: "" },
    ],
  },
  {
    id: "projects",
    lines: [
      { text: "What I'm working on.", markdownType: "h2" },
      { text: "" },
      { text: "stoa.gg", href: "https://stoa.gg", markdownType: "link" },
      { text: "A private communications platform" },
      { text: "like Discord and Slack. Built using" },
      { text: "Tauri, LiveKit, and React." },
      { text: "" },
      {
        text: "thenix.guide",
        href: "https://thenix.guide",
        markdownType: "link",
      },
      { text: "A guide to Nix and NixOS." },
      {
        text: "(really just a propaganda piece).​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​",
      },
    ],
  },
  {
    id: "contact",
    lines: [
      {
        text: "Get in touch.",
        markdownType: "h2",
      },
      { text: "" },
      {
        text: "github",
        href: "https://github.com/0xhckr",
        markdownType: "link",
      },
      {
        text: "x",
        href: "https://x.com/0xhckrdev",
        markdownType: "link",
      },
      {
        text: "linkedin",
        href: "https://linkedin.com/in/mohammadalahdal",
        markdownType: "link",
      },
      {
        text: "email",
        href: "mailto:hello@0xhckr.dev",
        markdownType: "link",
      },
    ],
  },
];

interface SectionMeta {
  charCount: number;
}

const lineFullText = (l: Line) => {
  const prefix = l.markdownType === "h1" ? "# " : l.markdownType === "h2" ? "## " : l.markdownType === "h3" ? "### " : l.markdownType === "comment" ? "<!-- " : l.markdownType === "link" ? "[" : "";
  const suffix = l.markdownType === "link" ? `](${l.href})` : l.markdownType === "comment" ? " -->" : "";
  return `${prefix}${l.text}${suffix}`;
};

const twCharCount = (s: string) => s.replace(/ /g, "").length;

const sectionMeta: SectionMeta[] = [];
for (const section of story) {
  const charCount = section.lines
    .filter((l) => l.text.length > 0)
    .reduce((sum, l) => sum + twCharCount(lineFullText(l)), 0);
  sectionMeta.push({ charCount });
}

const firstLineCount = twCharCount(lineFullText(story[0].lines[0]));

interface ScrollRange {
  type: "section" | "gap";
  sectionIndex: number;
  startPx: number;
  endPx: number;
  charOffset: number;
  charCount: number;
}

const scrollRanges: ScrollRange[] = [];
let px = 0;

const section0Remaining = sectionMeta[0].charCount - firstLineCount;
scrollRanges.push({
  type: "section",
  sectionIndex: 0,
  startPx: px,
  endPx: px + section0Remaining * CHAR_SCROLL_PX,
  charOffset: firstLineCount,
  charCount: section0Remaining,
});
px += section0Remaining * CHAR_SCROLL_PX;

for (let i = 1; i < sectionMeta.length; i++) {
  scrollRanges.push({
    type: "gap",
    sectionIndex: i - 1,
    startPx: px,
    endPx: px + GAP_PX,
    charOffset: 0,
    charCount: 0,
  });
  px += GAP_PX;

  scrollRanges.push({
    type: "section",
    sectionIndex: i,
    startPx: px,
    endPx: px + sectionMeta[i].charCount * CHAR_SCROLL_PX,
    charOffset: 0,
    charCount: sectionMeta[i].charCount,
  });
  px += sectionMeta[i].charCount * CHAR_SCROLL_PX;
}

const totalScroll = px;

const TypewriterLine = ({
  markdownType,
  text,
  href,
  blank,
}: {
  markdownType?: "h1" | "h2" | "h3" | "link" | "comment";
  text: string;
  href?: string;
  blank: boolean;
}) => {
  if (blank) return <div className="h-5 sm:h-7" />;

  const Component =
    markdownType === "h1"
      ? "h1"
      : markdownType === "h2"
        ? "h2"
        : markdownType === "h3"
          ? "h3"
          : "span";

  const classes = cn("tw-char inline-block", {
    "text-2xl sm:text-4xl font-bold text-[#003c3c] dark:text-[#5eead4]":
      markdownType === "h1",
    "text-xl sm:text-3xl font-semibold": markdownType === "h2",
    "text-lg sm:text-2xl font-medium": markdownType === "h3",
    "underline decoration-foreground/30 hover:decoration-foreground/70 transition-colors text-[#2e6b7b] dark:text-[#7dd3e0]":
      markdownType === "link",
    "text-xs sm:text-sm text-[#6b7280]": markdownType === "comment",
  });

  const prefix =
    markdownType === "h1"
      ? "# "
      : markdownType === "h2"
        ? "## "
        : markdownType === "h3"
          ? "### "
          : markdownType === "comment"
            ? "<!-- "
            : markdownType === "link"
              ? `[`
              : "";
  const suffix =
    markdownType === "link"
      ? `](${href})`
      : markdownType === "comment"
        ? " -->"
        : "";
  const full = `${prefix}${text}${suffix}`;
  const words = full.split(" ");
  const chars = words.flatMap((word, wIdx) => [
    <span key={`w-${wIdx}`} className="whitespace-nowrap">
      {word.split("").map((char, cIdx) => (
        <span key={`${wIdx}-${cIdx}`} className={classes} aria-hidden="true">
          {char}
        </span>
      ))}
    </span>,
    wIdx < words.length - 1 ? " " : null,
  ]).filter(Boolean);
  if (href) {
    const isExternal = !href.startsWith("mailto:");
    return (
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="inline underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground/70 transition-colors"
        aria-label={text}
      >
        {chars}
        <span className="sr-only">{text}</span>
      </a>
    );
  }
  return <Component className={cn("inline")}>{chars}</Component>;
};

const StoryContent = () => (
  <noscript>
    <article className="mx-auto max-w-2xl px-4 py-16 text-sm leading-relaxed text-gray-700 dark:text-gray-300 sm:px-8 sm:text-base">
      <h1>{story[0].lines.find((l) => l.markdownType === "h1")?.text}</h1>
      {story.map((section) => (
        <section key={section.id}>
          {section.lines
            .filter((l) => l.text.length > 0 && l.markdownType !== "h1")
            .map((line, i) => {
              if (line.href) {
                return (
                  <p key={i}>
                    <a
                      href={line.href}
                      target={
                        line.href.startsWith("mailto:") ? undefined : "_blank"
                      }
                      rel="noopener noreferrer"
                    >
                      {line.text}
                    </a>
                  </p>
                );
              }
              return <p key={i}>{line.text}</p>;
            })}
        </section>
      ))}
    </article>
  </noscript>
);
export const StoryScroll = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<(HTMLDivElement | null)[]>([]);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const scrollReadyRef = useRef(false);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let dismissed = false;
    const cleanup = onPageReady(() => {
      const timer = setTimeout(() => {
        if (!dismissed && window.scrollY === 0) setShowScrollHint(true);
      }, 750);
      const onScroll = () => {
        if (window.scrollY > 40) {
          dismissed = true;
          const el = scrollHintRef.current;
          if (el) el.classList.remove("animate-pulse");
          setShowScrollHint(false);
        }
      };
      window.addEventListener("scroll", onScroll, { passive: true });
    });
    return () => {
      cleanup();
      setShowScrollHint(false);
    };
  }, []);

  useGSAP(
    () => {
      const el = scrollHintRef.current;
      if (!el || !showScrollHint) return;
      el.classList.remove("animate-pulse");
      const chars = gsap.utils.toArray<HTMLElement>(".scroll-hint-char", el);
      if (chars.length === 0) return;
      gsap.set(chars, { opacity: 0 });
      const tl = gsap.timeline();
      for (let i = 0; i < chars.length; i++) {
        tl.to(chars[i], { opacity: 1, duration: 0.05 }, i * 0.06);
      }
      tl.add(() => {
        gsap.set(chars, { clearProps: "opacity" });
        el.classList.add("animate-pulse");
      });
      return () => {
        tl.kill();
      };
    },
    { scope: scrollHintRef, dependencies: [showScrollHint] },
  );

  useGSAP(
    () => {
      const container = containerRef.current;
      const sections = sectionsRef.current.filter(Boolean) as HTMLDivElement[];
      const cursor = cursorRef.current;
      if (!container) return;

      const allChars = gsap.utils.toArray<HTMLElement>(".tw-char", container);
      if (allChars.length === 0) return;

      gsap.set(allChars, { opacity: 0 });

      const charsBySection: HTMLElement[][] = [];
      let idx = 0;
      for (const meta of sectionMeta) {
        charsBySection.push(allChars.slice(idx, idx + meta.charCount));
        idx += meta.charCount;
      }

      const firstLineChars = charsBySection[0].slice(0, firstLineCount);

      const moveCursor = (char: HTMLElement) => {
        if (!cursor) return;
        cursor.style.left = `${char.offsetLeft + char.offsetWidth}px`;
        cursor.style.top = `${char.offsetTop}px`;
        const fontSize = getComputedStyle(char).fontSize;
        cursor.style.fontSize = fontSize;
      };

      const showSectionFull = (sIdx: number) => {
        for (const c of charsBySection[sIdx]) c.style.opacity = "1";
        const chars = charsBySection[sIdx];
        moveCursor(chars[chars.length - 1]);
      };

      let currentSection = 0;
      const shownPerSection: number[] = [firstLineCount];

      ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: `+=${totalScroll}`,
        onUpdate: (self) => {
          if (!scrollReadyRef.current) return;

          const scrollPx = self.progress * totalScroll;

          let range = scrollRanges[scrollRanges.length - 1];
          for (const r of scrollRanges) {
            if (scrollPx <= r.endPx) {
              range = r;
              break;
            }
          }

          if (range.type === "gap") {
            const gapSection = range.sectionIndex;
            if (currentSection !== gapSection) {
              sections[currentSection].style.display = "none";
              for (const c of charsBySection[currentSection])
                c.style.opacity = "0";
              currentSection = gapSection;
              sections[currentSection].style.display = "block";
              showSectionFull(currentSection);
              shownPerSection[currentSection] =
                charsBySection[currentSection].length;
            }
            return;
          }

          const { sectionIndex, charOffset, charCount, startPx, endPx } = range;
          const localProgress = Math.min(
            (scrollPx - startPx) / (endPx - startPx),
            1,
          );
          const totalShown = charOffset + Math.round(localProgress * charCount);

          if (sectionIndex !== currentSection) {
            sections[currentSection].style.display = "none";
            for (const c of charsBySection[currentSection])
              c.style.opacity = "0";
            currentSection = sectionIndex;
            sections[currentSection].style.display = "block";
            shownPerSection[currentSection] = charOffset;
          }

          const prev = shownPerSection[currentSection] ?? 0;
          const chars = charsBySection[currentSection];

          if (prev < totalShown) {
            for (let i = prev; i < totalShown; i++)
              chars[i].style.opacity = "1";
          } else if (prev > totalShown) {
            for (let i = totalShown; i < prev; i++)
              chars[i].style.opacity = "0";
          }

          shownPerSection[currentSection] = totalShown;

          const ci = totalShown - 1;
          if (ci >= 0) moveCursor(chars[ci]);
        },
      });

      onPageReady(() => {
        if (firstLineChars.length === 0) {
          scrollReadyRef.current = true;
          return;
        }

        const tl = gsap.timeline({
          onComplete: () => {
            scrollReadyRef.current = true;
          },
        });

        for (let i = 0; i < firstLineChars.length; i++) {
          tl.add(() => {
            firstLineChars[i].style.opacity = "1";
            moveCursor(firstLineChars[i]);
          }, i * 0.04);
        }
      });
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef} className="relative">
      <StoryContent />
      <main id="main-content" tabIndex={-1}>
        <div className="sticky top-0 z-10 flex h-screen items-center justify-center px-4 sm:px-8">
          <div className="tw-content relative w-full max-w-2xl overflow-hidden lowercase">
            {story.map((section, sIdx) => (
              <div
                key={section.id}
                ref={(el) => {
                  sectionsRef.current[sIdx] = el;
                }}
                className="tw-section"
                style={{ display: sIdx === 0 ? "block" : "none" }}
              >
                {section.lines.map((line, i) => (
                  <div key={i} className="tw-block mb-1">
                    <TypewriterLine
                      markdownType={line.markdownType}
                      text={line.text}
                      href={line.href}
                      blank={line.text.length === 0}
                    />
                  </div>
                ))}
              </div>
            ))}
            <span
              ref={cursorRef}
              className={cn("tw-cursor")}
              aria-hidden="true"
            />
          </div>
        </div>
        <div style={{ height: `${totalScroll}px` }} />
      </main>
      <div
        ref={scrollHintRef}
        className={cn(
          "fixed bottom-8 left-1/2 -translate-x-1/2 z-30 transition-all duration-500",
          showScrollHint
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2 pointer-events-none",
        )}
        aria-hidden="true"
      >
        <span className="text-xs sm:text-sm text-foreground/50 tracking-wide select-none font-mono">
          {"scroll down".split("").map((char, i) => (
            <span
              key={i}
              className="scroll-hint-char inline-block"
              aria-hidden="true"
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
};
