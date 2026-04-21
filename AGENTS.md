# AGENTS.md — 0xhckr.dev

## Project Overview

Personal portfolio/site built with **Next.js 16** (App Router), **React 19**, **Tailwind CSS v4**, and **GSAP** for animations. Managed via **pnpm** with a **Nix flake** dev shell.

## Essential Commands

```bash
pnpm dev          # Start dev server (localhost:3000)
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run Biome linter
pnpm format       # Format code with Biome (writes in place)
```

The Nix flake (`flake.nix`) provides `pnpm`, `nodejs_22`, and `biome` in the dev shell. Enter via `direnv allow` (`.envrc` contains `use flake`).

## Toolchain Requirements

- **Node.js**: 22 (pinned in `package.json` engines)
- **pnpm**: 10.22.0 (pinned via `packageManager` field — corepack will enforce)
- **Biome**: 2.2.0 (linter + formatter, replaces ESLint/Prettier)
- **Tailwind CSS**: v4 (uses `@tailwindcss/postcss` plugin, no `tailwind.config` file — configuration is CSS-first via `@theme` blocks in `globals.css`)

## Architecture

```
src/
  app/             # Next.js App Router (layout.tsx, page.tsx, globals.css)
  components/      # React components
  lib/             # Utilities (cn helper)
public/            # Static assets
```

- **Path alias**: `~/*` maps to `./src/*` (configured in `tsconfig.json` `paths`). Use this for all internal imports.
- **Layout**: `RootLayout` wraps all pages with DM Sans and Departure Mono fonts and the `PageLoader` component.
- **PageLoader** (`src/components/page-loader.tsx`): A client component that renders an animated grid overlay (GSAP) on page load, then reveals content.

## UI Components

Install all new UI components from **COSS UI** (`https://coss.com/ui`) instead of shadcn/ui. Do not use shadcn/ui as a source for any new component.

## Code Conventions

- **Styling**: Tailwind CSS v4 classes. No `tailwind.config` — use `@theme inline {}` blocks in CSS for custom theme tokens (see `globals.css`).
- **Class merging**: Use `cn()` from `~/lib/util` (clsx + tailwind-merge) for conditional/merged class names.
- **Imports**: Use `~/` path alias for internal imports (e.g., `~/lib/util`, `~/components/page-loader`).
- **Formatting**: 2-space indentation (Biome enforced). Biome auto-organizes imports.
- **GSAP**: Registered via `gsap.registerPlugin(useGSAP)` in components that use `@gsap/react`. Always register before use.

## Gotchas

- **Tailwind v4 has no config file**: Theme customization happens in CSS via `@theme inline {}` directives. Don't create a `tailwind.config.js/ts` — it won't work.
- **sharp is ignored**: `pnpm-workspace.yaml` ignores the `sharp` dependency (Next.js image optimization uses it but it can fail in Nix environments).
- **Biome domains**: The linter has Next.js and React recommended rule domains enabled — it will catch Next-specific issues.
- **`noUnknownAtRules` is off**: Biome's CSS lint rule for unknown at-rules is disabled because Tailwind v4 uses at-rules like `@theme` that Biome doesn't recognize.

<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->
