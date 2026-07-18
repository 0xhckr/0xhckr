"use client";

import { useEffect, useRef, useState } from "react";

interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

const GAP = 8;
const LEVEL_OPACITY = [0.06, 0.25, 0.45, 0.7, 1];

export function CommitGraph() {
  const ref = useRef<HTMLDivElement>(null);
  const [days, setDays] = useState<ContributionDay[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [hover, setHover] = useState<{
    day: ContributionDay;
    idx: number;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/contributions")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => {
        if (!cancelled) setDays(d.days ?? []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setSize({
        w: entry.contentRect.width,
        h: entry.contentRect.height,
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const n = days.length;
  let cols = Math.max(
    1,
    Math.round(Math.sqrt((n * size.w) / Math.max(1, size.h))),
  );
  let rows = Math.max(1, Math.ceil(n / cols));
  let minPitch = Math.ceil((size.w + GAP) / cols);
  let maxPitch = Math.max(1, Math.floor((size.h + GAP) / rows));
  while (minPitch > maxPitch && cols < n) {
    cols += 1;
    rows = Math.max(1, Math.ceil(n / cols));
    minPitch = Math.ceil((size.w + GAP) / cols);
    maxPitch = Math.max(1, Math.floor((size.h + GAP) / rows));
  }
  const pitch = minPitch <= maxPitch ? maxPitch : minPitch;
  const cell = Math.max(4, pitch - GAP);
  const gridW = cols * pitch - GAP;
  const gridH = rows * pitch - GAP;

  const cells = days.map((day, i) => ({
    day,
    x: (i % cols) * pitch,
    y: Math.floor(i / cols) * pitch,
  }));

  const offsetX = Math.floor((size.w - gridW) / 2);

  return (
    <div
      ref={ref}
      className="absolute inset-x-0 top-16 bottom-0 overflow-hidden"
    >
      {cells.length > 0 && size.w > 0 && size.h > 0 && (
        <svg
          width={gridW}
          height={gridH}
          viewBox={`0 0 ${gridW} ${gridH}`}
          shapeRendering="crispEdges"
          aria-hidden="true"
          className="block text-accent"
          style={{ transform: `translateX(${offsetX}px)` }}
          onMouseMove={(e) => {
            const t = e.target;
            if (t instanceof SVGRectElement) {
              const idx = Number(t.getAttribute("data-i"));
              const c = cells[idx];
              if (c) setHover({ day: c.day, idx, x: e.clientX, y: e.clientY });
            }
          }}
          onMouseLeave={() => setHover(null)}
        >
          {cells.map((c, i) => {
            const base =
              c.day.level === 0 ? LEVEL_OPACITY[0] : LEVEL_OPACITY[c.day.level];
            return (
              <rect
                key={c.day.date}
                data-i={i}
                x={c.x}
                y={c.y}
                width={cell}
                height={cell}
                fill="currentColor"
                opacity={hover && hover.idx !== i ? base * 0.5 : base}
                className={
                  c.day.level === 0
                    ? "text-foreground transition-opacity duration-150"
                    : "text-accent transition-opacity duration-150"
                }
              />
            );
          })}
        </svg>
      )}

      {hover && (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-[calc(100%+10px)] border border-border bg-popover px-2.5 py-1.5 font-mono text-[0.625rem] whitespace-nowrap text-popover-foreground shadow-md"
          style={{ left: hover.x, top: hover.y }}
        >
          <span className="text-accent">{hover.day.count}</span>{" "}
          {hover.day.count === 1 ? "commit" : "commits"} on{" "}
          {new Date(`${hover.day.date}T00:00:00`).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      )}
    </div>
  );
}
