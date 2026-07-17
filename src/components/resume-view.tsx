"use client";

import { Reveal } from "~/components/reveal";
import { ScrambleText } from "~/components/scramble-text";
import type { ResumeData } from "~/lib/resume";
import { cn } from "~/lib/util";

function SectionHeading({ index, title }: { index: string; title: string }) {
  return (
    <div className="reveal-item flex items-baseline gap-4">
      <span className="font-mono text-xs text-accent">{index}</span>
      <h2 className="font-sans text-xl font-semibold tracking-tight text-foreground">
        <ScrambleText text={title} trigger="view" />
      </h2>
      <span className="h-px flex-1 bg-border" aria-hidden="true" />
    </div>
  );
}

export function ResumeView({ data }: { data: ResumeData }) {
  const skillsByCategory = data.skills.reduce<
    Record<string, { name: string; isExpert: boolean }[]>
  >((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push({ name: skill.name, isExpert: skill.isExpert });
    return acc;
  }, {});

  return (
    <Reveal className="mt-16 space-y-20 sm:mt-20 sm:space-y-24">
      {/* profile */}
      <section>
        <SectionHeading index="01" title="profile" />
        <p className="reveal-item mt-8 max-w-2xl text-[0.9375rem] leading-relaxed text-muted-foreground sm:text-base">
          {data.profile}
        </p>
      </section>

      {/* experience */}
      <section>
        <SectionHeading index="02" title="experience" />
        <div className="mt-8">
          {data.experiences.map((exp) => (
            <div
              key={`${exp.company}-${exp.years.start}`}
              className="reveal-item border-t hairline py-8 last:border-b sm:py-10"
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                <h3 className="font-sans text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                  {exp.title}
                  <span className="text-accent"> @ </span>
                  {exp.company}
                </h3>
                <p className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
                  {exp.years.start} — {exp.years.end}
                </p>
              </div>
              <div className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {typeof exp.description === "string" ? (
                  <p>{exp.description}</p>
                ) : (
                  <ul className="space-y-2">
                    {exp.description.map((item) => (
                      <li key={item.slice(0, 32)} className="flex gap-3">
                        <span
                          className="mt-[0.55em] size-1 shrink-0 bg-accent"
                          aria-hidden="true"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* skills */}
      <section>
        <SectionHeading index="03" title="skills" />
        <div className="mt-8 space-y-8">
          {Object.entries(skillsByCategory).map(([category, skills]) => (
            <div key={category} className="reveal-item">
              <h3 className="label">{category}</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill.name}
                    className={cn(
                      "rounded-full border px-3 py-1 font-mono text-xs transition-colors",
                      skill.isExpert
                        ? "border-accent/40 text-accent"
                        : "border-border text-muted-foreground",
                    )}
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* education */}
      {data.education && (
        <section>
          <SectionHeading index="04" title="education" />
          <div className="reveal-item mt-8">
            <h3 className="font-sans text-lg font-semibold tracking-tight text-foreground">
              {data.education.degreeName}
            </h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {data.education.universityName}
            </p>
            <p className="mt-1.5 font-mono text-xs text-muted-foreground/70">
              {data.education.progression}
              {data.education.gpa ? ` · gpa: ${data.education.gpa}` : ""}
            </p>
          </div>
        </section>
      )}
    </Reveal>
  );
}
