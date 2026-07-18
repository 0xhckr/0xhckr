"use client";

import { useEffect, useRef } from "react";

const CELL = 7;
const GROWTH = 1.2;
const FALLOFF = 2.4;

const BAYER = [
  0 / 16,
  8 / 16,
  2 / 16,
  10 / 16,
  12 / 16,
  4 / 16,
  14 / 16,
  6 / 16,
  3 / 16,
  11 / 16,
  1 / 16,
  9 / 16,
  15 / 16,
  7 / 16,
  13 / 16,
  5 / 16,
];

export function DitherHover() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let cols = 1;
    let rows = 1;
    let raf = 0;
    let progress = 0;
    let target = 0;
    let color = "#34d399";

    const draw = () => {
      ctx.clearRect(0, 0, cols, rows);
      if (progress <= 0.001) return;
      const maxDist = Math.hypot(cols, rows);
      ctx.fillStyle = color;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const b = BAYER[(y % 4) * 4 + (x % 4)];
          const dist = Math.hypot(x - cols, y - rows) / maxDist;
          const density = progress * GROWTH - dist * FALLOFF;
          if (density <= b) continue;
          ctx.globalAlpha = density > 0.85 ? 0.4 : 0.3;
          ctx.fillRect(x, y, 1, 1);
        }
      }
      ctx.globalAlpha = 1;
    };

    const measure = () => {
      const rect = parent.getBoundingClientRect();
      cols = Math.max(1, Math.ceil(rect.width / CELL));
      rows = Math.max(1, Math.ceil(rect.height / CELL));
      canvas.width = cols;
      canvas.height = rows;

      const probe = document.createElement("span");
      probe.style.color = "var(--accent)";
      probe.style.display = "none";
      parent.appendChild(probe);
      const resolved = getComputedStyle(probe).color;
      probe.remove();
      if (resolved) color = resolved;

      draw();
    };

    const tick = () => {
      progress += (target - progress) * 0.13;
      if (Math.abs(target - progress) < 0.002) {
        progress = target;
        draw();
        raf = 0;
        return;
      }
      draw();
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const enter = () => {
      target = 1;
      if (reduced) {
        progress = 1;
        draw();
      } else {
        start();
      }
    };

    const leave = () => {
      target = 0;
      if (reduced) {
        progress = 0;
        draw();
      } else {
        start();
      }
    };

    const ro = new ResizeObserver(measure);
    ro.observe(parent);
    measure();

    parent.addEventListener("pointerenter", enter);
    parent.addEventListener("pointerleave", leave);

    return () => {
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
      parent.removeEventListener("pointerenter", enter);
      parent.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full [image-rendering:pixelated]"
    />
  );
}
