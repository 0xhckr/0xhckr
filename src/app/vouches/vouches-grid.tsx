"use client";

import { useQuery } from "convex/react";
import { ArrowUpRight } from "lucide-react";
import { DitherHover } from "~/components/dither-hover";
import { Reveal } from "~/components/reveal";
import { api } from "../../../convex/_generated/api";

function FaviconImg({ url }: { url: string }) {
  const hostname = new URL(url).hostname;
  const src = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;

  return (
    // biome-ignore lint/performance/noImgElement: external favicon URLs can't use next/image
    <img
      src={src}
      alt=""
      width={20}
      height={20}
      className="shrink-0 rounded-sm"
    />
  );
}

export function VouchesGrid() {
  const vouches = useQuery(api.vouches.list);

  if (vouches === undefined) {
    return (
      <p className="mt-16 font-mono text-xs text-muted-foreground">
        loading...
      </p>
    );
  }

  if (vouches.length === 0) {
    return (
      <p className="mt-16 font-mono text-xs text-muted-foreground">
        no vouches yet.
      </p>
    );
  }

  return (
    <Reveal className="mt-16 sm:mt-20">
      <div className="grid grid-cols-1 gap-px border hairline bg-border sm:grid-cols-2">
        {vouches.map((vouch) => (
          <a
            key={vouch._id}
            href={vouch.url}
            target="_blank"
            rel="noopener noreferrer"
            className="reveal-item group relative block bg-background px-6 py-6 transition-colors duration-300 hover:bg-foreground/[0.03]"
          >
            <DitherHover />
            <div className="relative flex items-center gap-4">
              <FaviconImg url={vouch.url} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-sans text-sm font-medium text-foreground transition-colors group-hover:text-accent">
                  {vouch.name}
                </p>
                <p className="truncate font-mono text-xs text-muted-foreground">
                  {new URL(vouch.url).hostname}
                </p>
              </div>
              <ArrowUpRight className="size-4 shrink-0 text-muted-foreground/40 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent" />
            </div>
          </a>
        ))}
      </div>
    </Reveal>
  );
}
