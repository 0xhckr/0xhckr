"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Link from "next/link";
import { useRef } from "react";
import { onPageReady } from "~/lib/page-ready";

gsap.registerPlugin(useGSAP);

interface Post {
  slug: string;
  title: string;
  description: string;
  date: string;
}

interface TypewriterPostsProps {
  posts: Post[];
}

export const TypewriterPosts = ({ posts }: TypewriterPostsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      const postEls = gsap.utils.toArray<HTMLElement>(".tw-post", container);
      if (postEls.length === 0) return;

      for (const el of postEls) {
        const chars = gsap.utils.toArray<HTMLElement>(".tw-char", el);
        gsap.set(chars, { opacity: 0 });
      }

      const animate = () => {
        const allChars = postEls.map((el) =>
          gsap.utils.toArray<HTMLElement>(".tw-char", el),
        );
        const maxChars = Math.max(...allChars.map((c) => c.length), 0);
        const staggerDelay = 0.15;
        const totalDuration = 1.5;
        const effectiveSlots =
          maxChars + (postEls.length - 1) * (staggerDelay / 0.04);
        const charDelay = Math.min(
          totalDuration / Math.max(effectiveSlots, 1),
          0.04,
        );

        postEls.forEach((el, pIdx) => {
          const chars = allChars[pIdx];
          const tl = gsap.timeline({ delay: pIdx * staggerDelay });
          for (let i = 0; i < chars.length; i++) {
            tl.to(chars[i], { opacity: 1, duration: charDelay }, i * charDelay);
          }
        });
      };

      onPageReady(animate);
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef} className="mt-6 space-y-6">
      {posts.map((post, pIdx) => (
        <div key={post.slug} className="tw-post">
          <Link
            href={`/blog/${post.slug}`}
            className="inline transition-colors"
          >
            {post.title.split(" ").flatMap((word, wIdx) => [
              <span key={`tw-${pIdx}-${wIdx}`} className="whitespace-nowrap">
                {word.split("").map((char, cIdx) => (
                  <span
                    key={`t-${pIdx}-${wIdx}-${cIdx}`}
                    className="tw-char inline-block text-[#2e6b7b] dark:text-[#7dd3e0]"
                    aria-hidden="true"
                  >
                    {char}
                  </span>
                ))}
              </span>,
              wIdx < post.title.split(" ").length - 1 ? " " : null,
            ]).filter(Boolean)}
            <span className="sr-only">{post.title}</span>
          </Link>
          {post.description && (
            <div className="mt-1">
              {post.description.split(" ").flatMap((word, wIdx) => [
                <span key={`dw-${pIdx}-${wIdx}`} className="whitespace-nowrap">
                  {word.split("").map((char, cIdx) => (
                    <span
                      key={`d-${pIdx}-${wIdx}-${cIdx}`}
                      className="tw-char inline-block"
                      aria-hidden="true"
                    >
                      {char}
                    </span>
                  ))}
                </span>,
                wIdx < post.description.split(" ").length - 1 ? " " : null,
              ]).filter(Boolean)}
              <span className="sr-only">{post.description}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
