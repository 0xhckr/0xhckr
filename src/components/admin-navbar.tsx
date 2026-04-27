"use client";

import { useAuth } from "@clerk/nextjs";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { cn } from "~/lib/util";

gsap.registerPlugin(useGSAP);

const adminLinks = [
  { href: "/admin/resumes", label: "resumes" },
  { href: "/admin/cover-letters", label: "letters" },
  { href: "/admin/job-postings", label: "jobs" },
];

export function AdminNavbar() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const container = ref.current;
      if (!container) return;
      const chars = gsap.utils.toArray<HTMLElement>(".admin-nav-char", container);
      if (chars.length === 0) return;

      gsap.set(chars, { opacity: 0 });
      gsap.to(chars, {
        opacity: 1,
        duration: 0.03,
        stagger: 0.03,
        delay: 0.3,
      });
    },
    { scope: ref },
  );



  return (
    <nav
      className="fixed inset-x-0 top-0 z-30 flex justify-end"
      aria-label="Admin navigation"
    >
      <div className="fixed inset-x-0 top-0 h-40 -z-[11] pointer-events-none bg-gradient-to-b from-black/80 to-transparent" />
      <div className="fixed inset-x-0 top-0 h-40 -z-10 pointer-events-none backdrop-blur-xl [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div
        ref={ref}
        className="block font-mono text-sm text-foreground/50 select-none mr-4 mt-4"
      >
        <div className="inline-flex items-center gap-4">
          {isSignedIn && adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "inline-flex hover:text-foreground/80 transition-colors",
                pathname === link.href ? "text-foreground/80" : "",
              )}
            >
              {link.label.split("").map((char, i) => (
                <span key={i} className="admin-nav-char inline-block">
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
