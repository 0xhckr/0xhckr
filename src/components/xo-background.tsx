"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import { cn } from "~/lib/util";

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

// Extra rows generated above and below the viewport so chars are
// available as parallax shifts the layers.
const HEIGHT_MULT = 3;

function getGridDimensions(width: number, height: number): GridDimensions {
  return {
    cols: Math.ceil(width / CELL_SIZE),
    rows: Math.ceil((height * HEIGHT_MULT) / CELL_SIZE),
  };
}

function generateChars(width: number, height: number): XoChar[] {
  const totalHeight = height * HEIGHT_MULT;
  const { cols, rows } = getGridDimensions(width, height);
  const chars: XoChar[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (Math.random() > 0.4) continue;

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

export function XoBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [chars, setChars] = useState<XoChar[]>([]);
  const gridDimsRef = useRef<GridDimensions | null>(null);
  const isInitialRef = useRef(true);
  const viewportRef = useRef({ width: 0, height: 0 });

  useEffect(() => {
    const onResize = () => {
      viewportRef.current = { width: window.innerWidth, height: window.innerHeight };
      const newDims = getGridDimensions(window.innerWidth, window.innerHeight);
      // Only regenerate if grid dimensions actually changed (or first run)
      if (
        !gridDimsRef.current ||
        gridDimsRef.current.cols !== newDims.cols ||
        gridDimsRef.current.rows !== newDims.rows
      ) {
        gridDimsRef.current = newDims;
        setChars(generateChars(window.innerWidth, window.innerHeight));
      }
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useGSAP(
    () => {
      if (chars.length === 0) return;

      const container = containerRef.current;
      if (!container) return;

      const farLayer = container.querySelector(".xo-layer--far");
      const midLayer = container.querySelector(".xo-layer--mid");
      const nearLayer = container.querySelector(".xo-layer--near");
      if (!farLayer || !midLayer || !nearLayer) return;

      // Parallax: ScrollTrigger-driven y-offset per layer
      // Negative y so chars move UP when scrolling down
      // Far (most blurred) = slowest, Near (crisp) = fastest
      ScrollTrigger.create({
        trigger: document.documentElement,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5,
        onUpdate: (self) => {
          const scrollY = self.scroll();
          gsap.set(farLayer, { y: scrollY * -0.15 });
          gsap.set(midLayer, { y: scrollY * -0.25 });
          gsap.set(nearLayer, { y: scrollY * -0.35 });
        },
      });

      const allElements = container.querySelectorAll(".xo-char");
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
      allElements.forEach((el) => {
        const baseRotation = parseFloat(
          el.getAttribute("data-rotation") || "0",
      );
        const fadeInDuration = gsap.utils.random(1.5, 3);
        const holdDuration = gsap.utils.random(1, 3);
        const pauseDuration = gsap.utils.random(2, 5);
        const maxOpacity = gsap.utils.random(0.1, 0.75);
        const startDelay = gsap.utils.random(0, 6);
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
      });
    },
    { scope: containerRef, dependencies: [chars], revertOnUpdate: true },
  );

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {/* Far parallax layer — heaviest blur, slowest scroll */}
      <div
        className="xo-layer--far absolute will-change-transform"
        style={{
          top: -viewportRef.current.height,
          left: 0,
          width: viewportRef.current.width,
          height: viewportRef.current.height * HEIGHT_MULT,
        }}
      >
        {chars
          .filter((c) => c.depth === "far")
          .map((c) => (
            <span
              key={c.id}
              className="xo-char absolute font-mono blur-lg"
              data-rotation={c.rotation}
              style={{
                left: `${c.x}px`,
                top: `${c.y}px`,
                fontSize: `${c.size}px`,
                lineHeight: 1,
                color: c.color,
                opacity: 0,
                textShadow: `0 0 4px ${c.color}80`,
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
          height: viewportRef.current.height * HEIGHT_MULT,
        }}
      >
        {chars
          .filter((c) => c.depth === "mid")
          .map((c) => (
            <span
              key={c.id}
              className="xo-char absolute font-mono blur-sm"
              data-rotation={c.rotation}
              style={{
                left: `${c.x}px`,
                top: `${c.y}px`,
                fontSize: `${c.size}px`,
                lineHeight: 1,
                color: c.color,
                opacity: 0,
                textShadow: `0 0 4px ${c.color}80`,
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
          height: viewportRef.current.height * HEIGHT_MULT,
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
                textShadow: `0 0 4px ${c.color}80`,
              }}
            >
              {c.char}
            </span>
          ))}
      </div>
    </div>
  );
}
