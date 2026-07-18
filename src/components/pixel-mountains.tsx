const COLS = 192;
const ROWS = 56;

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ridge(
  seed: number,
  step: number,
  min: number,
  max: number,
  pointy = false,
) {
  const rand = mulberry32(seed);
  const points: number[] = [];
  for (let x = 0, i = 0; x <= COLS + step; x += step, i++) {
    if (pointy) {
      const band = (max - min) * 0.45;
      points.push(i % 2 === 0 ? max - rand() * band : min + rand() * band);
    } else {
      points.push(min + rand() * (max - min));
    }
  }
  const heights: number[] = [];
  for (let x = 0; x < COLS; x++) {
    const i = Math.floor(x / step);
    const t = (x - i * step) / step;
    const s = pointy ? t : (1 - Math.cos(t * Math.PI)) / 2;
    const jitter = pointy ? (rand() - 0.5) * 2 : 0;
    heights.push(
      Math.round(points[i] + (points[i + 1] - points[i]) * s + jitter),
    );
  }
  return heights;
}

function silhouettePath(heights: number[]) {
  let d = `M0 ${ROWS} L0 ${heights[0]}`;
  for (let x = 0; x < COLS; x++) {
    d += ` L${x} ${heights[x]} L${x + 1} ${heights[x]}`;
  }
  return `${d} L${COLS} ${ROWS} Z`;
}

const TREE = ["..#..", ".###.", "..#..", ".###.", "#####", "..#..", "..#.."];

const back = ridge(11, 11, 12, 28, true);
const mid = ridge(22, 15, 22, 38, true);
const front = ridge(33, 14, 36, 46);

const stars: { x: number; y: number; bright: boolean }[] = [];
{
  const rand = mulberry32(44);
  for (let i = 0; i < 48; i++) {
    const x = Math.floor(rand() * COLS);
    const y = Math.floor(rand() * 22);
    if (Math.hypot(x - 148, y - 11) < 9) continue;
    stars.push({ x, y, bright: rand() < 0.3 });
  }
}

const sun: { x: number; y: number; halo: boolean }[] = [];
for (let dy = -6; dy <= 6; dy++) {
  for (let dx = -6; dx <= 6; dx++) {
    const d2 = dx * dx + dy * dy;
    if (d2 <= 16.5) sun.push({ x: 148 + dx, y: 11 + dy, halo: false });
    else if (d2 <= 36 && (dx + dy) % 2 === 0)
      sun.push({ x: 148 + dx, y: 11 + dy, halo: true });
  }
}

const snow: { x: number; y: number }[] = [];
{
  const rand = mulberry32(55);
  for (let x = 0; x < COLS; x++) {
    if (mid[x] > 27) continue;
    snow.push({ x, y: mid[x] });
    if (rand() < 0.45) snow.push({ x, y: mid[x] + 1 });
    if (rand() < 0.2) snow.push({ x, y: mid[x] + 2 });
  }
}

const rocks: { x: number; y: number }[] = [];
{
  const rand = mulberry32(66);
  for (let x = 0; x < COLS; x++) {
    for (let d = 1; d <= 3; d++) {
      if (rand() < 0.16) rocks.push({ x, y: front[x] + d });
    }
  }
}

const trees: { x: number; y: number }[] = [];
{
  const rand = mulberry32(77);
  let last = -12;
  for (let x = 8; x < COLS - 8; x++) {
    if (x - last < 10 || rand() > 0.09) continue;
    last = x;
    const top = front[x] - (TREE.length - 1);
    for (let ty = 0; ty < TREE.length; ty++) {
      for (let tx = 0; tx < TREE[ty].length; tx++) {
        if (TREE[ty][tx] === "#") trees.push({ x: x + tx - 2, y: top + ty });
      }
    }
  }
}

export function PixelMountains({ className }: { className?: string }) {
  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${COLS} ${ROWS}`}
        preserveAspectRatio="xMidYMax slice"
        shapeRendering="crispEdges"
        aria-hidden="true"
        className="block h-auto w-full"
      >
        <g fill="currentColor" className="text-foreground/25">
          {stars.map((s) => (
            <rect
              key={`s${s.x}-${s.y}`}
              x={s.x}
              y={s.y}
              width={1}
              height={1}
              opacity={s.bright ? 1 : 0.4}
            />
          ))}
        </g>
        <g fill="currentColor" className="text-accent">
          {sun.map((p) => (
            <rect
              key={`m${p.x}-${p.y}`}
              x={p.x}
              y={p.y}
              width={1}
              height={1}
              opacity={p.halo ? 0.25 : 1}
            />
          ))}
        </g>
        <path
          d={silhouettePath(back)}
          fill="currentColor"
          className="text-foreground/[0.07]"
        />
        <path
          d={silhouettePath(mid)}
          fill="currentColor"
          className="text-foreground/[0.12]"
        />
        <g fill="currentColor" className="text-foreground/30">
          {snow.map((p) => (
            <rect key={`w${p.x}-${p.y}`} x={p.x} y={p.y} width={1} height={1} />
          ))}
        </g>
        <path
          d={silhouettePath(front)}
          fill="currentColor"
          className="text-foreground/[0.18]"
        />
        <g fill="currentColor" className="text-foreground/[0.26]">
          {rocks.map((p) => (
            <rect key={`r${p.x}-${p.y}`} x={p.x} y={p.y} width={1} height={1} />
          ))}
        </g>
        <g fill="currentColor" className="text-foreground/30">
          {trees.map((p) => (
            <rect key={`t${p.x}-${p.y}`} x={p.x} y={p.y} width={1} height={1} />
          ))}
        </g>
      </svg>
    </div>
  );
}
