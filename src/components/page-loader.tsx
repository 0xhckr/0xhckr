"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { cn } from "~/lib/util";

gsap.registerPlugin(useGSAP);

export const PageLoader = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const overlayRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useGSAP(
    () => {
      if (!mounted) return;
      const overlay = overlayRef.current;
      const counter = counterRef.current;
      const bar = barRef.current;
      const mark = markRef.current;
      if (!overlay || !counter || !bar || !mark) return;

      const progress = { value: 0 };

      const tl = gsap.timeline({
        onComplete: () => {
          setIsLoading(false);
          window.dispatchEvent(new CustomEvent("page-ready"));
        },
      });

      tl.fromTo(
        mark,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
      );

      tl.to(
        progress,
        {
          value: 100,
          duration: 0.9,
          ease: "power2.inOut",
          onUpdate: () => {
            counter.textContent = String(Math.round(progress.value)).padStart(
              3,
              "0",
            );
            bar.style.transform = `scaleX(${progress.value / 100})`;
          },
        },
        "-=0.2",
      );

      tl.to(mark, { opacity: 0, y: -8, duration: 0.3, ease: "power2.in" });

      tl.to(overlay, {
        clipPath: "inset(0 0 100% 0)",
        duration: 0.7,
        ease: "power4.inOut",
      });

      return () => {
        tl.kill();
      };
    },
    { dependencies: [mounted] },
  );

  return (
    <div>
      {mounted && children}
      <div
        ref={overlayRef}
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center bg-background",
          !isLoading && "pointer-events-none",
        )}
        style={{ clipPath: "inset(0 0 0% 0)" }}
      >
        <div ref={markRef} className="flex flex-col items-center gap-4">
          <span className="loader-glitch font-mono text-sm tracking-[0.2em] text-foreground/90 uppercase select-none">
            0xhckr
          </span>
          <div className="h-px w-40 overflow-hidden bg-foreground/10">
            <div
              ref={barRef}
              className="h-full w-full origin-left bg-accent"
              style={{ transform: "scaleX(0)" }}
            />
          </div>
          <span
            ref={counterRef}
            className="font-mono text-[0.625rem] tracking-[0.3em] text-muted-foreground tabular-nums select-none"
          >
            000
          </span>
        </div>
      </div>
      {isLoading && (
        <div role="status" aria-live="polite" className="sr-only">
          Loading
        </div>
      )}
    </div>
  );
};
