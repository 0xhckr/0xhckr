"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCallback, useRef } from "react";
import { onPageReady } from "~/lib/page-ready";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const GLYPHS = "!<>-_\\/[]{}=+*^?#";

const randomGlyphs = (length: number) => {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
  }
  return out;
};

export function ScrambleText({
  text,
  className,
  trigger = "view",
  delay = 0,
}: {
  text: string;
  className?: string;
  trigger?: "ready" | "view" | "hover";
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  const play = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    tweenRef.current?.kill();
    const proxy = { v: 0 };
    tweenRef.current = gsap.to(proxy, {
      v: text.length,
      duration: Math.max(0.35, text.length * 0.03),
      ease: "none",
      delay,
      onUpdate: () => {
        const solved = Math.floor(proxy.v);
        let out = "";
        for (let i = 0; i < text.length; i++) {
          const ch = text[i];
          if (ch === " ") {
            out += " ";
          } else {
            out +=
              i < solved
                ? ch
                : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          }
        }
        el.textContent = out;
      },
      onComplete: () => {
        el.textContent = text;
      },
    });
  }, [text, delay]);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (trigger === "hover") return;

      let scrambled = "";
      for (const ch of text) {
        scrambled += ch === " " ? " " : randomGlyphs(1);
      }
      el.textContent = scrambled;

      if (trigger === "ready") {
        const cleanup = onPageReady(play);
        return () => {
          cleanup();
          tweenRef.current?.kill();
        };
      }

      const st = ScrollTrigger.create({
        trigger: el,
        start: "top 92%",
        once: true,
        onEnter: play,
      });
      return () => {
        st.kill();
        tweenRef.current?.kill();
      };
    },
    { scope: ref, dependencies: [text, trigger, delay] },
  );

  return (
    <span
      className={className}
      aria-label={text}
      onMouseEnter={trigger === "hover" ? play : undefined}
    >
      <span ref={ref} aria-hidden="true">
        {text}
      </span>
    </span>
  );
}
