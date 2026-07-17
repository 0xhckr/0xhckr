"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { onPageReady } from "~/lib/page-ready";
import { cn } from "~/lib/util";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const items = gsap.utils.toArray<HTMLElement>(".reveal-item", el);
      if (items.length === 0) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(items, { opacity: 0, y: 24 });

        const cleanup = onPageReady(() => {
          for (const [i, item] of items.entries()) {
            gsap.to(item, {
              opacity: 1,
              y: 0,
              duration: 0.7,
              ease: "power3.out",
              delay: delay + i * 0.06,
              scrollTrigger: {
                trigger: item,
                start: "top 92%",
                once: true,
              },
            });
          }
        });
        return cleanup;
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(items, { opacity: 1, y: 0 });
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
