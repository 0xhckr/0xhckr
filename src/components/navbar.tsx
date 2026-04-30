"use client";

import { SignInButton, SignOutButton, useAuth } from "@clerk/nextjs";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "~/lib/util";

gsap.registerPlugin(useGSAP);

const navLinks = [
  { href: "/", label: "home" },
  { href: "/showcase", label: "showcase" },
  { href: "/blog", label: "blog" },
  { href: "/resume", label: "resume" },
];

export function Navbar() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const desktopRef = useRef<HTMLDivElement>(null);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [menuOpen, closeMenu]);

  useGSAP(
    () => {
      const container = desktopRef.current;
      if (!container) return;
      const chars = gsap.utils.toArray<HTMLElement>(".nav-char", container);
      if (chars.length === 0) return;

      gsap.set(chars, { opacity: 0 });

      const onReady = () => {
        window.removeEventListener("page-ready", onReady);
        const tl = gsap.timeline({ delay: 0.5 });
        for (let i = 0; i < chars.length; i++) {
          tl.to(chars[i], { opacity: 1, duration: 0.03 }, i * 0.03);
        }
      };

      window.addEventListener("page-ready", onReady);
      return () => {
        window.removeEventListener("page-ready", onReady);
      };
    },
    { scope: desktopRef },
  );

  useGSAP(
    () => {
      const btn = mobileToggleRef.current;
      if (!btn) return;
      const chars = gsap.utils.toArray<HTMLElement>(".menu-btn-char", btn);
      if (chars.length === 0) return;

      gsap.set(chars, { opacity: 0 });

      const onReady = () => {
        window.removeEventListener("page-ready", onReady);
        const tl = gsap.timeline({ delay: 1 });
        for (let i = 0; i < chars.length; i++) {
          tl.to(chars[i], { opacity: 1, duration: 0.03 }, i * 0.03);
        }
      };

      window.addEventListener("page-ready", onReady);
      return () => {
        window.removeEventListener("page-ready", onReady);
      };
    },
    { scope: mobileToggleRef },
  );

  useGSAP(
    () => {
      const panel = menuRef.current;
      if (!panel) return;

      const links = gsap.utils.toArray<HTMLElement>(".menu-link", panel);
      if (links.length === 0) return;

      gsap.set(links, { opacity: 0, y: 12 });

      if (menuOpen) {
        gsap.to(links, {
          opacity: 1,
          y: 0,
          duration: 0.25,
          stagger: 0.06,
          ease: "power2.out",
        });
      } else {
        gsap.to(links, {
          opacity: 0,
          y: 12,
          duration: 0.15,
          stagger: 0.03,
          ease: "power2.in",
        });
      }
    },
    { scope: menuRef, dependencies: [menuOpen] },
  );

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 flex justify-end"
      aria-label="Main navigation"
    >
      <div className="fixed inset-x-0 bottom-0 h-40 -z-[11] pointer-events-none bg-gradient-to-t from-black/80 to-transparent" />
      <div className="fixed inset-x-0 bottom-0 h-40 -z-10 pointer-events-none backdrop-blur-xl [mask-image:linear-gradient(to_top,black,transparent)]" />
      <div
        ref={desktopRef}
        className="hidden sm:block font-mono text-sm text-foreground/50 select-none mr-4 mb-4"
      >
        <span
          className="inline-flex items-center justify-end gap-4"
          aria-hidden="true"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "inline-flex hover:text-foreground/80 transition-colors",
                pathname === link.href ? "text-foreground/80" : "",
              )}
            >
              {link.label.split("").map((char, i) => (
                <span key={i} className="nav-char inline-block">
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </Link>
          ))}
          {isLoaded && isSignedIn ? (
            <SignOutButton redirectUrl="/">
              <span
                className={cn(
                  "inline-flex cursor-pointer hover:text-foreground/80 transition-colors",
                )}
              >
                {"sign-out".split("").map((char, i) => (
                  <span key={i} className="nav-char inline-block">
                    {char}
                  </span>
                ))}
              </span>
            </SignOutButton>
          ) : (
            <SignInButton mode="modal">
              <span
                className={cn(
                  "inline-flex cursor-pointer hover:text-foreground/80 transition-colors",
                )}
              >
                {"login".split("").map((char, i) => (
                  <span key={i} className="nav-char inline-block">
                    {char}
                  </span>
                ))}
              </span>
            </SignInButton>
          )}
        </span>
      </div>

      <div className="sm:hidden flex flex-col items-end gap-2 mr-4 mb-4">
        <button
          ref={mobileToggleRef}
          type="button"
          className="font-mono text-sm text-foreground/50 select-none hover:text-foreground/80 transition-colors"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen
            ? "close".split("").map((char, i) => (
                <span key={i} className="inline-block">
                  {char}
                </span>
              ))
            : "menu".split("").map((char, i) => (
                <span key={i} className="menu-btn-char inline-block">
                  {char}
                </span>
              ))}
        </button>

        <div
          ref={menuRef}
          id="mobile-menu"
          role="dialog"
          aria-label="Navigation menu"
          className={cn(
            "fixed inset-0 z-[-1] flex items-center justify-center bg-black/60 backdrop-blur-md transition-all",
            menuOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0",
          )}
          onClick={closeMenu}
        >
          <div
            className="flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className={cn(
                  "menu-link text-sm font-mono transition-colors",
                  pathname === link.href
                    ? "text-foreground/90"
                    : "text-foreground/60 hover:text-foreground/90",
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
