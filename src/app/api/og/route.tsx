import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

const BG = "#0d0c0b";
const FG = "#e9e8e4";
const MUTED = "#82807b";
const ACCENT = "#00c28c";
const HAIRLINE = "rgba(255,255,255,0.08)";
const GRID_LINE = "rgba(255,255,255,0.04)";

async function loadDmSans(weight: 400 | 600): Promise<ArrayBuffer> {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=DM+Sans:wght@${weight}&display=swap`,
    { headers: { "User-Agent": "curl/8.0" } },
  ).then((r) => r.text());
  const url = css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/)?.[1];
  if (!url) throw new Error(`DM Sans ${weight} unavailable`);
  return fetch(url).then((r) => r.arrayBuffer());
}

async function loadFonts() {
  const [departure, dmSans400, dmSans600] = await Promise.all([
    fetch(
      "https://cdn.jsdelivr.net/gh/xeji01/departuremono@main/DepartureMono/DepartureMonoNerdFontMono-Regular.otf",
    ).then((r) => r.arrayBuffer()),
    loadDmSans(400).catch(() => null),
    loadDmSans(600).catch(() => null),
  ]);

  const fonts: {
    name: string;
    data: ArrayBuffer;
    weight: 400 | 600;
    style: "normal";
  }[] = [
    {
      name: "Departure Mono",
      data: departure,
      weight: 400,
      style: "normal",
    },
  ];
  if (dmSans400) {
    fonts.push({
      name: "DM Sans",
      data: dmSans400,
      weight: 400,
      style: "normal",
    });
  }
  if (dmSans600) {
    fonts.push({
      name: "DM Sans",
      data: dmSans600,
      weight: 600,
      style: "normal",
    });
  }
  return { fonts, hasSans: Boolean(dmSans400 && dmSans600) };
}

let fontsPromise: ReturnType<typeof loadFonts> | null = null;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get("title") ?? "0xhckr";
  const description =
    searchParams.get("description") ?? "Mohammad Al-Ahdal | Software Developer";
  const path = searchParams.get("path");

  fontsPromise ??= loadFonts();
  const { fonts, hasSans } = await fontsPromise;
  const sans = hasSans ? "DM Sans" : "Departure Mono";
  const truncate = (s: string, n: number) => {
    if (s.length <= n) return s;
    const cut = s.slice(0, n);
    const lastSpace = cut.lastIndexOf(" ");
    return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
  };
  const trimmed = title.trim();
  const bareTitle = truncate(trimmed.replace(/\.$/, ""), 160);
  const titleSize =
    bareTitle.length > 80 ? 56 : bareTitle.length > 25 ? 68 : 84;
  const showAccentDot = bareTitle.length <= 25 && !/[!?…]$/.test(bareTitle);
  const displayDescription = truncate(description, 170);

  return new ImageResponse(
    <div
      style={{
        position: "relative",
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: BG,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundImage: `linear-gradient(to right, ${GRID_LINE} 1px, transparent 1px), linear-gradient(to bottom, ${GRID_LINE} 1px, transparent 1px)`,
          backgroundSize: "72px 72px",
          backgroundRepeat: "repeat",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundImage: `linear-gradient(to bottom, rgba(13,12,11,0) 0%, rgba(13,12,11,0) 30%, ${BG} 80%)`,
        }}
      />
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
          width: "100%",
          padding: "72px 80px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "12px",
            fontFamily: "Departure Mono",
            fontSize: 22,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: MUTED,
          }}
        >
          <span style={{ color: ACCENT }}>{"//"}</span>
          <span>0xhckr.dev</span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "28px",
          }}
        >
          <h1
            style={{
              fontSize: titleSize,
              fontWeight: 600,
              fontFamily: sans,
              color: FG,
              letterSpacing: "-0.04em",
              textAlign: "left",
              width: "100%",
              margin: 0,
              lineHeight: 1.05,
            }}
          >
            {bareTitle}
            {showAccentDot ? <span style={{ color: ACCENT }}>.</span> : null}
          </h1>
          <p
            style={{
              fontSize: 28,
              fontWeight: 400,
              fontFamily: sans,
              color: MUTED,
              textAlign: "left",
              margin: 0,
              lineHeight: 1.45,
            }}
          >
            {displayDescription}
          </p>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "28px",
          }}
        >
          <div
            style={{
              display: "flex",
              width: "100%",
              height: 1,
              backgroundColor: HAIRLINE,
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                fontFamily: "Departure Mono",
                fontSize: 22,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: FG,
              }}
            >
              0xhckr
              <div
                style={{
                  width: 10,
                  height: 10,
                  backgroundColor: ACCENT,
                }}
              />
            </div>
            {path ? (
              <div
                style={{
                  display: "flex",
                  fontFamily: "Departure Mono",
                  fontSize: 20,
                  color: MUTED,
                }}
              >
                {path}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts,
      headers: {
        "Cache-Control":
          "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
