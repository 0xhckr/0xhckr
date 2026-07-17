import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get("title") ?? "0xhckr";
  const description =
    searchParams.get("description") ?? "Mohammad Al-Ahdal | Software Developer";

  const fontRes = await fetch(
    "https://cdn.jsdelivr.net/gh/xeji01/departuremono@main/DepartureMono/DepartureMonoNerdFontMono-Regular.otf",
  );
  const fontData = await fontRes.arrayBuffer();

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#101010",
        padding: "80px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          fontFamily: "Departure Mono",
          fontSize: 24,
          color: "#8f8b82",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            backgroundColor: "#e2a63d",
          }}
        />
        0xhckr.dev
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
            fontSize: 84,
            fontWeight: 700,
            fontFamily: "Departure Mono",
            color: "#ece7db",
            letterSpacing: "-0.02em",
            textAlign: "left",
            width: "100%",
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          {title}
        </h1>
        <p
          style={{
            fontSize: 28,
            fontWeight: 400,
            fontFamily: "Departure Mono",
            color: "#8f8b82",
            textAlign: "left",
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          {description}
        </p>
      </div>
      <div
        style={{
          display: "flex",
          width: "100%",
          height: 1,
          backgroundColor: "rgba(255,255,255,0.12)",
        }}
      />
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Departure Mono",
          data: fontData,
          weight: 400,
          style: "normal",
        },
      ],
    },
  );
}
