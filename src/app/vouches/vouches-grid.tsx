"use client";

import { useQuery } from "convex/react";
import { ExternalLink } from "lucide-react";
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
    return <p className="mt-8 text-muted-foreground lowercase">Loading...</p>;
  }

  if (vouches.length === 0) {
    return (
      <p className="mt-8 text-muted-foreground lowercase">No vouches yet.</p>
    );
  }

  return (
    <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {vouches.map((vouch) => (
        <a
          key={vouch._id}
          href={vouch.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group block p-4 transition-colors hover:bg-foreground/5"
        >
          <div className="flex items-center gap-3">
            <FaviconImg url={vouch.url} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium group-hover:underline">
                {vouch.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {new URL(vouch.url).hostname}
              </p>
            </div>
            <ExternalLink className="size-4 shrink-0 text-muted-foreground/50 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </a>
      ))}
    </div>
  );
}
