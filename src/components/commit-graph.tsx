"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

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
  const tipRef = useRef<HTMLDivElement>(null);
  const [tipPos, setTipPos] = useState<{ left: number; top: number } | null>(
    null,
  );

  useLayoutEffect(() => {
    const el = tipRef.current;
    if (!hover || !el) {
      setTipPos(null);
      return;
    }
    const { width, height } = el.getBoundingClientRect();
    const pad = 8;
    const cx = Math.min(
      Math.max(hover.x, width / 2 + pad),
      window.innerWidth - width / 2 - pad,
    );
    let top = hover.y - height - 10;
    if (top < pad) top = hover.y + 16;
    setTipPos({ left: cx - width / 2, top });
  }, [hover]);

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
  const half = Math.ceil(n / 2);
  const bandBudget = Math.max(1, (size.h - Math.round(size.h * 0.3)) / 2);
  let cols = Math.max(
    1,
    Math.round(Math.sqrt((Math.max(1, half) * size.w) / bandBudget)),
  );
  let rows = Math.max(1, Math.ceil(half / cols));
  let minPitch = Math.ceil((size.w + GAP) / cols);
  let maxPitch = Math.max(1, Math.floor((bandBudget + GAP) / rows));
  while (minPitch > maxPitch && cols < half) {
    cols += 1;
    rows = Math.max(1, Math.ceil(half / cols));
    minPitch = Math.ceil((size.w + GAP) / cols);
    maxPitch = Math.max(1, Math.floor((bandBudget + GAP) / rows));
  }
  const pitch = minPitch <= maxPitch ? maxPitch : minPitch;
  const cell = Math.max(4, pitch - GAP);
  const gridW = cols * pitch - GAP;

  const totalRows = Math.max(1, Math.ceil(n / cols));
  const topRows = Math.max(1, Math.floor(totalRows / 2));
  const split = Math.min(n, topRows * cols);
  const m = n - split;
  const rowsBottom = Math.max(1, Math.ceil(m / cols));
  const bottomY = size.h - (rowsBottom * pitch - GAP);
  const rem = m % cols;

  const cells: { day: ContributionDay | null; x: number; y: number }[] =
    days.map((day, i) => {
      if (i < split) {
        return {
          day,
          x: (i % cols) * pitch,
          y: Math.floor(i / cols) * pitch,
        };
      }
      const j = i - split;
      let col: number;
      let row: number;
      if (rem > 0 && j < rem) {
        col = j;
        row = 0;
      } else if (rem > 0) {
        col = (j - rem) % cols;
        row = 1 + Math.floor((j - rem) / cols);
      } else {
        col = j % cols;
        row = Math.floor(j / cols);
      }
      return { day, x: col * pitch, y: bottomY + row * pitch };
    });

  if (rem > 0) {
    for (let col = rem; col < cols; col++) {
      cells.push({ day: null, x: col * pitch, y: bottomY });
    }
  }

  const offsetX = Math.floor((size.w - gridW) / 2);

  return (
    <div
      ref={ref}
      className="absolute inset-x-0 top-16 bottom-0 overflow-hidden"
    >
      {cells.length > 0 && size.w > 0 && size.h > 0 && (
        <svg
          width={gridW}
          height={size.h}
          viewBox={`0 0 ${gridW} ${size.h}`}
          shapeRendering="crispEdges"
          aria-hidden="true"
          className="block text-accent"
          style={{ transform: `translateX(${offsetX}px)` }}
          onMouseMove={(e) => {
            const t = e.target;
            if (t instanceof SVGRectElement) {
              const idx = Number(t.getAttribute("data-i"));
              const c = cells[idx];
              if (c?.day)
                setHover({ day: c.day, idx, x: e.clientX, y: e.clientY });
              else setHover(null);
            }
          }}
          onMouseLeave={() => setHover(null)}
        >
          {cells.map((c, i) => {
            const base =
              !c.day || c.day.level === 0
                ? LEVEL_OPACITY[0]
                : LEVEL_OPACITY[c.day.level];
            return (
              <rect
                key={c.day ? c.day.date : `pad-${c.x}`}
                data-i={i}
                x={c.x}
                y={c.y}
                width={cell}
                height={cell}
                fill="currentColor"
                opacity={hover && hover.idx !== i ? base * 0.5 : base}
                className={
                  !c.day || c.day.level === 0
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
          ref={tipRef}
          className="pointer-events-none fixed z-50 border border-border bg-popover px-2.5 py-1.5 font-mono text-[0.625rem] whitespace-nowrap text-popover-foreground shadow-md"
          style={
            tipPos ?? { left: hover.x, top: hover.y, visibility: "hidden" }
          }
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
