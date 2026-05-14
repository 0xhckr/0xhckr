"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { cn } from "~/lib/util";

gsap.registerPlugin(useGSAP);

interface XoChar {
  id: number;
  char: "x" | "o" | "+";
  x: number;
  y: number;
  size: number;
  rotation: number;
  color: string;
  blur: boolean;
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

function generateChars(width: number, height: number): XoChar[] {
  const cols = Math.ceil(width / CELL_SIZE);
  const rows = Math.ceil(height / CELL_SIZE);
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
        blur: Math.random() > 0.6,
      });
    }
  }

  return chars;
}

export function XoBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [chars, setChars] = useState<XoChar[]>([]);

  useEffect(() => {
    const onResize = () => {
      setChars(generateChars(window.innerWidth, window.innerHeight));
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useGSAP(
    () => {
      if (chars.length === 0) return;

      const elements = containerRef.current?.querySelectorAll(".xo-char");
      if (!elements || elements.length === 0) return;

      gsap.set(elements, { opacity: 0, rotation: (i) => parseFloat(elements[i].getAttribute("data-rotation") || "0") });

      // Each char gets its own looping tween with random timing
      elements.forEach((el) => {
        const baseRotation = parseFloat(el.getAttribute("data-rotation") || "0");
        const fadeInDuration = gsap.utils.random(1.5, 3);
        const holdDuration = gsap.utils.random(1, 3);
        const pauseDuration = gsap.utils.random(2, 5);
        const maxOpacity = gsap.utils.random(0.3, 0.75);
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
          ease: "none",
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
      {chars.map((c) => (
        <span
          key={c.id}
          className={cn("xo-char absolute font-mono", c.blur && "blur-xs")}
          data-rotation={c.rotation}
          style={{
            left: `${c.x}px`,
            top: `${c.y}px`,
            fontSize: `${c.size}px`,
            lineHeight: 1,
            color: c.color,
            textShadow: `0 0 4px ${c.color}80`,
          }}
        >
          {c.char}
        </span>
      ))}
    </div>
  );
}
