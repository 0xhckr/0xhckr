"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface GridDimensions {
  cols: number;
  rows: number;
}

type Depth = "far" | "mid" | "near";

interface XoChar {
  id: number;
  char: "x" | "o" | "+";
  x: number;
  y: number;
  size: number;
  rotation: number;
  color: string;
  depth: Depth;
}

const COLORS = [
  "#ff00ff", // magenta
  "#00ffff", // cyan
  "#ff006e", // hot pink
  "#8b5cf6", // purple
  "#06b6d4", // teal
  "#f472b6", // pink
  "#a855f7", // violet
  "#22d3ee", // light cyan
  "#e879f9", // fuchsia
  "#2dd4bf", // turquoise
];

const CELL_SIZE = 100;

/**
 * Multi-layer text-shadow that simulates bloom / glow.
 * Far depth gets the heaviest, softest bloom; near gets a tighter, sharper glow.
 */
function getBloomShadow(color: string, depth: Depth, isMobile: boolean): string {
  // On mobile: fewer layers for performance
  if (isMobile) {
    if (depth === "far") {
      return `0 0 10px ${color}90, 0 0 30px ${color}60, 0 0 60px ${color}30`;
    }
    if (depth === "mid") {
      return `0 0 8px ${color}90, 0 0 24px ${color}50`;
    }
    return `0 0 6px ${color}a0, 0 0 16px ${color}50`;
  }
  if (depth === "far") {
    return [
      `0 0 8px ${color}c0`,
      `0 0 20px ${color}a0`,
      `0 0 40px ${color}70`,
      `0 0 80px ${color}50`,
      `0 0 120px ${color}30`,
    ].join(", ");
  }
  if (depth === "mid") {
    return [
      `0 0 7px ${color}c0`,
      `0 0 18px ${color}90`,
      `0 0 36px ${color}60`,
      `0 0 60px ${color}30`,
    ].join(", ");
  }
  // near — tight, punchy glow
  return [
    `0 0 6px ${color}e0`,
    `0 0 16px ${color}a0`,
    `0 0 30px ${color}60`,
  ].join(", ");
}

// Extra rows generated above and below the viewport so chars are
// available as parallax shifts the layers.
const HEIGHT_MULT_DESKTOP = 3;
const HEIGHT_MULT_MOBILE = 2;

// Probability of placing a char in a cell.
const FILL_RATE_DESKTOP = 0.8;
const FILL_RATE_MOBILE = 0.5;

function getGridDimensions(width: number, height: number, heightMult: number): GridDimensions {
  return {
    cols: Math.ceil(width / CELL_SIZE),
    rows: Math.ceil((height * heightMult) / CELL_SIZE),
  };
}

function generateChars(width: number, height: number, isMobile: boolean): XoChar[] {
  const heightMult = isMobile ? HEIGHT_MULT_MOBILE : HEIGHT_MULT_DESKTOP;
  const fillRate = isMobile ? FILL_RATE_MOBILE : FILL_RATE_DESKTOP;
  const { cols, rows } = getGridDimensions(width, height, heightMult);
  const chars: XoChar[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (Math.random() > fillRate) continue;

      chars.push({
        id: row * cols + col,
        char: (["x", "o", "+"] as const)[Math.floor(Math.random() * 3)],
        x:
          col * CELL_SIZE + Math.random() * (CELL_SIZE * 0.6) + CELL_SIZE * 0.2,
        y:
          row * CELL_SIZE + Math.random() * (CELL_SIZE * 0.6) + CELL_SIZE * 0.2,
        size: Math.random() * 16 + 10,
        rotation: Math.random() * 360,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        depth: (["far", "mid", "near"] as const)[Math.floor(Math.random() * 3)],
      });
    }
  }

  return chars;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

export function XoBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [chars, setChars] = useState<XoChar[]>([]);
  const gridDimsRef = useRef<GridDimensions | null>(null);
  const isInitialRef = useRef(true);
  const viewportRef = useRef({ width: 0, height: 0 });
  const isMobile = useIsMobile();

  const heightMult = isMobile ? HEIGHT_MULT_MOBILE : HEIGHT_MULT_DESKTOP;

  useEffect(() => {
    const onResize = () => {
      viewportRef.current = { width: window.innerWidth, height: window.innerHeight };
      const newDims = getGridDimensions(window.innerWidth, window.innerHeight, heightMult);
      // Only regenerate if grid dimensions actually changed (or first run)
      if (
        !gridDimsRef.current ||
        gridDimsRef.current.cols !== newDims.cols ||
        gridDimsRef.current.rows !== newDims.rows
      ) {
        gridDimsRef.current = newDims;
        isInitialRef.current = true;
        setChars(generateChars(window.innerWidth, window.innerHeight, isMobile));
      }
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isMobile, heightMult]);

  useGSAP(
    (_context, contextSafe) => {
      if (chars.length === 0) return;

      const container = containerRef.current;
      if (!container) return;

      const farLayer = container.querySelector(".xo-layer--far");
      const midLayer = container.querySelector(".xo-layer--mid");
      const nearLayer = container.querySelector(".xo-layer--near");
      if (!farLayer || !midLayer || !nearLayer || !contextSafe) return;

      // --- Scroll-driven parallax (y-offset per layer) ---
      const scrollState = { y: 0 };

      // --- Cursor-driven parallax (desktop only) ---
      const cursorState = { x: 0, y: 0 };
      let removeCursorListeners: (() => void) | null = null;

      // Desktop: quickTo for smooth scroll + cursor combined parallax
      // Mobile: direct gsap.set for scroll-only parallax (no cursor, less GPU)
      const farXQ = isMobile ? null : gsap.quickTo(farLayer, "x", { duration: 0.6, ease: "power2.out" });
      const farYQ = isMobile ? null : gsap.quickTo(farLayer, "y", { duration: 0.6, ease: "power2.out" });
      const midXQ = isMobile ? null : gsap.quickTo(midLayer, "x", { duration: 0.5, ease: "power2.out" });
      const midYQ = isMobile ? null : gsap.quickTo(midLayer, "y", { duration: 0.5, ease: "power2.out" });
      const nearXQ = isMobile ? null : gsap.quickTo(nearLayer, "x", { duration: 0.4, ease: "power2.out" });
      const nearYQ = isMobile ? null : gsap.quickTo(nearLayer, "y", { duration: 0.4, ease: "power2.out" });

      const CURSOR_RANGE = { far: -15, mid: -30, near: -50 };

      function updateLayers() {
        const sy = scrollState.y;
        const cx = cursorState.x;
        const cy = cursorState.y;
        if (isMobile) {
          gsap.set(farLayer, { y: sy * -0.15 });
          gsap.set(midLayer, { y: sy * -0.25 });
          gsap.set(nearLayer, { y: sy * -0.35 });
        } else {
          farXQ!(cx * CURSOR_RANGE.far);
          farYQ!(sy * -0.15 + cy * CURSOR_RANGE.far);
          midXQ!(cx * CURSOR_RANGE.mid);
          midYQ!(sy * -0.25 + cy * CURSOR_RANGE.mid);
          nearXQ!(cx * CURSOR_RANGE.near);
          nearYQ!(sy * -0.35 + cy * CURSOR_RANGE.near);
        }
      }

      ScrollTrigger.create({
        trigger: document.documentElement,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5,
        onUpdate: (self) => {
          scrollState.y = self.scroll();
          updateLayers();
        },
      });

      if (!isMobile) {
        const onMouseMove = contextSafe((e: MouseEvent) => {
          cursorState.x = (e.clientX / window.innerWidth - 0.5) * 2;
          cursorState.y = (e.clientY / window.innerHeight - 0.5) * 2;
          updateLayers();
        });

        const onMouseLeave = contextSafe(() => {
          cursorState.x = 0;
          cursorState.y = 0;
          updateLayers();
        });

        window.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseleave", onMouseLeave);
        removeCursorListeners = () => {
          window.removeEventListener("mousemove", onMouseMove);
          document.removeEventListener("mouseleave", onMouseLeave);
        };
      }

      // --- Per-char animations ---
      const allElements = container!.querySelectorAll(".xo-char");
      if (allElements.length === 0) return;

      // Only flash to invisible on initial mount, not on resize updates
      if (isInitialRef.current) {
        gsap.set(allElements, {
          opacity: 0,
          rotation: (i) =>
            parseFloat(allElements[i].getAttribute("data-rotation") || "0"),
        });
        isInitialRef.current = false;
      }

      // Each char gets its own looping tween with random timing
      // On mobile: only opacity animation, no drift/rotation to reduce GPU load
      allElements.forEach((el) => {
        const baseRotation = parseFloat(
          el.getAttribute("data-rotation") || "0",
      );
        const maxOpacity = gsap.utils.random(0.1, 0.75);
        const startDelay = gsap.utils.random(0, 6);

        if (!isMobile) {
          const fadeInDuration = gsap.utils.random(1.5, 3);
          const holdDuration = gsap.utils.random(1, 3);
          const pauseDuration = gsap.utils.random(2, 5);
          const rotationSpeed = gsap.utils.random(5, 20);
          const angle = gsap.utils.random(0, Math.PI * 2);
          const speed = gsap.utils.random(3, 8);
          const vx = Math.cos(angle) * speed;
          const vy = Math.sin(angle) * speed;

          // Continuous slow drift
          gsap.to(el, {
            x: vx * 60,
            y: vy * 60,
            duration: 60,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });

          // Continuous slow rotation
          gsap.to(el, {
            rotation: baseRotation + 360 * Math.sign(rotationSpeed),
            duration: 360 / Math.abs(rotationSpeed),
            repeat: -1,
            ease: "none",
          });

          // Fade in/out
          gsap.to(el, {
            opacity: maxOpacity,
            duration: fadeInDuration,
            delay: startDelay,
            repeat: -1,
            yoyo: true,
            repeatDelay: holdDuration + pauseDuration,
            ease: "power2.inOut",
          });
        } else {
          // Mobile: only a simple fade pulse — no transforms
          const fadeDuration = gsap.utils.random(3, 6);
          gsap.to(el, {
            opacity: maxOpacity,
            duration: fadeDuration,
            delay: startDelay,
            repeat: -1,
            yoyo: true,
            repeatDelay: gsap.utils.random(3, 6),
            ease: "power2.inOut",
          });
        }
      });

      // Cleanup DOM listeners (GSAP context revert handles tweens/ScrollTriggers)
      return () => {
        removeCursorListeners?.();
      };
    },
    {
      scope: containerRef,
      dependencies: [chars],
      revertOnUpdate: true,
    },
  );

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
      style={{ filter: "brightness(1.15) contrast(1.08) saturate(1.3)" }}
    >
      {/* Far parallax layer — heaviest blur, slowest scroll */}
      <div
        className="xo-layer--far absolute will-change-transform"
        style={{
          top: -viewportRef.current.height,
          left: 0,
          width: viewportRef.current.width,
          height: viewportRef.current.height * heightMult,
        }}
      >
        {chars
          .filter((c) => c.depth === "far")
          .map((c) => (
            <span
              key={c.id}
              className={"xo-char absolute font-mono" + (isMobile ? "" : " blur-lg")}
              data-rotation={c.rotation}
              style={{
                left: `${c.x}px`,
                top: `${c.y}px`,
                fontSize: `${c.size}px`,
                lineHeight: 1,
                color: c.color,
                opacity: 0,
                textShadow: getBloomShadow(c.color, c.depth, isMobile),
              }}
            >
              {c.char}
            </span>
          ))}
      </div>
      {/* Mid parallax layer — light blur, medium scroll speed */}
      <div
        className="xo-layer--mid absolute will-change-transform"
        style={{
          top: -viewportRef.current.height,
          left: 0,
          width: viewportRef.current.width,
          height: viewportRef.current.height * heightMult,
        }}
      >
        {chars
          .filter((c) => c.depth === "mid")
          .map((c) => (
            <span
              key={c.id}
              className={"xo-char absolute font-mono" + (isMobile ? "" : " blur-sm")}
              data-rotation={c.rotation}
              style={{
                left: `${c.x}px`,
                top: `${c.y}px`,
                fontSize: `${c.size}px`,
                lineHeight: 1,
                color: c.color,
                opacity: 0,
                textShadow: getBloomShadow(c.color, c.depth, isMobile),
              }}
            >
              {c.char}
            </span>
          ))}
      </div>
      {/* Near parallax layer — crisp, fastest scroll */}
      <div
        className="xo-layer--near absolute will-change-transform"
        style={{
          top: -viewportRef.current.height,
          left: 0,
          width: viewportRef.current.width,
          height: viewportRef.current.height * heightMult,
        }}
      >
        {chars
          .filter((c) => c.depth === "near")
          .map((c) => (
            <span
              key={c.id}
              className="xo-char absolute font-mono"
              data-rotation={c.rotation}
              style={{
                left: `${c.x}px`,
                top: `${c.y}px`,
                fontSize: `${c.size}px`,
                lineHeight: 1,
                color: c.color,
                opacity: 0,
                textShadow: getBloomShadow(c.color, c.depth, isMobile),
              }}
            >
              {c.char}
            </span>
          ))}
      </div>
    </div>
  );
}
