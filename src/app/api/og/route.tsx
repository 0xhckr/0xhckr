import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get("title") ?? "0xhckr";
  const description =
    searchParams.get("description") ?? "Mohammad Al-Ahdal | Software Developer";

  const origin = request.nextUrl.origin;
  const fontRes = await fetch(`${origin}/fonts/DepartureMono-Regular.otf`);
  const fontData = await fontRes.arrayBuffer();

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        backgroundColor: "#000000",
        padding: "80px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexGrow: 1,
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "24px",
        }}
      >
        <h1
          style={{
            fontSize: 72,
            fontWeight: 700,
            fontFamily: "Departure Mono",
            color: "#3399cc",
            letterSpacing: "-0.02em",
            textAlign: "left",
            width: "100%",
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          # {title}
        </h1>
        <p
          style={{
            fontSize: 28,
            fontWeight: 400,
            fontFamily: "Departure Mono",
            color: "#a3a3a3",
            textAlign: "center",
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          {description}
        </p>
      </div>
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
