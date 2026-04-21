"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { type ResumeData } from "~/lib/resume";
import { onPageReady } from "~/lib/page-ready";

gsap.registerPlugin(useGSAP);

interface TypewriterResumeProps {
  data: ResumeData;
}

function TypewriterText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <>
      {text
        .split(" ")
        .flatMap((word, wIdx) => [
          <span key={`w-${wIdx}`} className="whitespace-nowrap">
            {word.split("").map((char, cIdx) => (
              <span
                key={`${wIdx}-${cIdx}`}
                className={`tw-char inline-block ${className ?? ""}`}
                aria-hidden="true"
              >
                {char}
              </span>
            ))}
          </span>,
          wIdx < text.split(" ").length - 1 ? " " : null,
        ])
        .filter(Boolean)}
      <span className="sr-only">{text}</span>
    </>
  );
}

function Heading({ text }: { text: string }) {
  return (
    <h2 className="mb-3">
      <TypewriterText
        text={text}
        className="text-lg sm:text-xl font-semibold text-[#003c3c] dark:text-[#5eead4]"
      />
    </h2>
  );
}

function SkillBadge({ name, isExpert }: { name: string; isExpert: string }) {
  return (
    <span
      className={`tw-skill inline-block rounded px-2 py-0.5 text-xs sm:text-sm mr-1.5 mb-1.5 ${
        isExpert === "yes"
          ? "bg-[#003c3c]/10 dark:bg-[#5eead4]/10 text-[#003c3c] dark:text-[#5eead4] font-semibold"
          : "bg-foreground/5 text-foreground/70"
      }`}
    >
      {name}
    </span>
  );
}

export const TypewriterResume = ({ data }: TypewriterResumeProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      const sectionEls = gsap.utils.toArray<HTMLElement>(
        ".tw-resume-section",
        container,
      );
      if (sectionEls.length === 0) return;

      for (const el of sectionEls) {
        const chars = gsap.utils.toArray<HTMLElement>(".tw-char", el);
        gsap.set(chars, { opacity: 0 });
      }

      const skillBadges = gsap.utils.toArray<HTMLElement>(
        ".tw-skill",
        container,
      );
      gsap.set(skillBadges, { opacity: 0, y: 8 });

      const animate = () => {
        const allChars = sectionEls.map((el) =>
          gsap.utils.toArray<HTMLElement>(".tw-char", el),
        );
        const maxChars = Math.max(...allChars.map((c) => c.length), 0);
        const staggerDelay = 0.2;
        const totalDuration = 1.5;
        const effectiveSlots =
          maxChars + (sectionEls.length - 1) * (staggerDelay / 0.04);
        const charDelay = Math.min(
          totalDuration / Math.max(effectiveSlots, 1),
          0.04,
        );

        sectionEls.forEach((el, sIdx) => {
          const chars = allChars[sIdx];
          const tl = gsap.timeline({ delay: sIdx * staggerDelay });
          for (let i = 0; i < chars.length; i++) {
            tl.to(chars[i], { opacity: 1, duration: charDelay }, i * charDelay);
          }
          tl.to(
            gsap.utils.toArray<HTMLElement>(".tw-skill", el),
            {
              opacity: 1,
              y: 0,
              duration: 0.3,
              stagger: 0.03,
              ease: "power2.out",
            },
            chars.length > 0 ? ">-=0.1" : 0,
          );
        });
      };

      onPageReady(animate);
    },
    { scope: containerRef },
  );

  const skillsByCategory = data.skills.reduce<
    Record<string, { name: string; isExpert: string }[]>
  >((acc, skill) => {
    const key = skill.category;
    if (!acc[key]) acc[key] = [];
    acc[key].push({ name: skill.name, isExpert: skill.isExpert });
    return acc;
  }, {});

  return (
    <div ref={containerRef} className="mt-8 space-y-10">
      {/* Profile */}
      <div className="tw-resume-section">
        <Heading text="## profile" />
        <TypewriterText text={data.profile} />
      </div>

      {/* Experience */}
      <div className="tw-resume-section">
        <Heading text="## experience" />
        <div className="space-y-5">
          {data.experiences.map((exp, idx) => (
            <div key={idx}>
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5">
                <div className="inline">
                  <TypewriterText
                    text={`${exp.title} @ ${exp.company}`}
                    className="font-semibold text-[#2e6b7b] dark:text-[#7dd3e0]"
                  />
                </div>
                <div className="whitespace-nowrap shrink-0">
                  <TypewriterText
                    text={`${exp.years.start} - ${exp.years.end}`}
                    className="text-xs sm:text-sm text-foreground/50"
                  />
                </div>
              </div>
              <div className="mt-1">
                {typeof exp.description === "string" ? (
                  <TypewriterText text={exp.description} />
                ) : (
                  <ul className="list-disc list-inside space-y-1">
                    {exp.description.map((item, i) => (
                      <li key={i}>
                        <TypewriterText text={item} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="tw-resume-section">
        <Heading text="## skills" />
        <div className="space-y-3">
          {Object.entries(skillsByCategory).map(([category, skills]) => (
            <div key={category}>
              <TypewriterText
                text={category}
                className="text-xs sm:text-sm text-foreground/50 tracking-wider"
              />
              <div className="mt-1">
                {skills.map((skill) => (
                  <SkillBadge
                    key={skill.name}
                    name={skill.name}
                    isExpert={skill.isExpert}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {data.education && (
        <div className="tw-resume-section">
          <Heading text="## education" />
          <div>
            <TypewriterText
              text={data.education.degreeName}
              className="font-semibold text-[#2e6b7b] dark:text-[#7dd3e0]"
            />
            <div className="mt-0.5">
              <TypewriterText text={data.education.universityName} />
            </div>
            <div className="mt-0.5">
              <TypewriterText
                text={data.education.progression}
                className="text-xs sm:text-sm text-foreground/50"
              />
            </div>
            {data.education.gpa && (
              <div className="mt-0.5">
                <TypewriterText
                  text={`gpa: ${data.education.gpa}`}
                  className="text-xs sm:text-sm text-foreground/50"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
