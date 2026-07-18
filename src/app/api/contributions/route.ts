export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

const GITHUB_USER = "0xhckr";
const YEARS_BACK = 3;

let cached: { data: ContributionDay[]; at: number } | null = null;
const CACHE_TTL = 1000 * 60 * 60;

function parseContributions(svg: string): ContributionDay[] {
  const days = new Map<string, ContributionDay>();
  const dayRe =
    /id="(contribution-day-component-\d+-\d+)"[^>]*data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-level="(\d)"|data-date="(\d{4}-\d{2}-\d{2})"[^>]*id="(contribution-day-component-\d+-\d+)"[^>]*data-level="(\d)"/g;
  for (const m of svg.matchAll(dayRe)) {
    const id = m[1] ?? m[5];
    const date = m[2] ?? m[4];
    const level = Number(m[3] ?? m[6]) as ContributionDay["level"];
    days.set(id, { date, count: 0, level });
  }

  const tipRe =
    /<tool-tip[^>]*for="(contribution-day-component-\d+-\d+)"[^>]*>([^<]*)</g;
  for (const m of svg.matchAll(tipRe)) {
    const day = days.get(m[1]);
    if (!day) continue;
    const countMatch = m[2].match(/(\d[\d,]*) contribution/);
    day.count = countMatch ? Number(countMatch[1].replace(/,/g, "")) : 0;
  }

  return [...days.values()];
}

async function fetchYear(from?: string): Promise<ContributionDay[]> {
  const url = from
    ? `https://github.com/users/${GITHUB_USER}/contributions?from=${from}`
    : `https://github.com/users/${GITHUB_USER}/contributions`;
  const res = await fetch(url, { headers: { "User-Agent": "0xhckr.dev" } });
  if (!res.ok) throw new Error(`GitHub responded ${res.status}`);
  return parseContributions(await res.text());
}

export async function GET() {
  if (cached && Date.now() - cached.at < CACHE_TTL) {
    return Response.json(
      { days: cached.data },
      { headers: { "Cache-Control": "public, max-age=3600" } },
    );
  }

  const thisYear = new Date().getFullYear();
  const chunks = await Promise.all(
    [
      ...Array.from(
        { length: YEARS_BACK },
        (_, i) => `${thisYear - YEARS_BACK + i}-01-01`,
      ),
      undefined,
    ].map((from) => fetchYear(from)),
  );

  const byDate = new Map<string, ContributionDay>();
  for (const day of chunks.flat()) byDate.set(day.date, day);
  const data = [...byDate.values()].sort((a, b) => (a.date < b.date ? -1 : 1));

  cached = { data, at: Date.now() };

  return Response.json(
    { days: data },
    { headers: { "Cache-Control": "public, max-age=3600" } },
  );
}
