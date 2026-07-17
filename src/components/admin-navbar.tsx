"use client";

import { useAuth } from "@clerk/nextjs";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { onPageReady } from "~/lib/page-ready";
import { cn } from "~/lib/util";

gsap.registerPlugin(useGSAP);

const adminLinks = [
  { href: "/admin/resumes", label: "resumes" },
  { href: "/admin/cover-letters", label: "letters" },
  { href: "/admin/job-postings", label: "jobs" },
  { href: "/admin/vouches", label: "vouches" },
];

export function AdminNavbar() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useAuth();
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const bar = ref.current;
      if (!bar) return;
      gsap.set(bar, { y: 16, opacity: 0 });
      const cleanup = onPageReady(() => {
        gsap.to(bar, {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power3.out",
          delay: 0.4,
        });
      });
      return cleanup;
    },
    { scope: ref },
  );

  if (!isLoaded || !isSignedIn) return null;

  return (
    <nav
      ref={ref}
      className="fixed inset-x-0 bottom-5 z-40 flex justify-center px-5"
      aria-label="Admin navigation"
    >
      <div className="flex items-center gap-5 rounded-full border hairline bg-background/80 px-6 py-2.5 backdrop-blur-md">
        <span className="font-mono text-[0.625rem] tracking-[0.25em] text-accent uppercase select-none">
          admin
        </span>
        <span className="h-3 w-px bg-border" aria-hidden="true" />
        {adminLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "font-mono text-xs transition-colors",
              pathname.startsWith(link.href)
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
