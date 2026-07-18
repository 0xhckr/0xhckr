# AGENTS.md — 0xhckr.dev

## Project Overview

Personal portfolio/site built with **vinext** (Next.js 16 App Router API on Vite, deployed to Cloudflare Workers), **React 19**, **Tailwind CSS v4**, and **GSAP** for animations. Auth is **Better Auth** (passkey-only) backed by a locally-installed Convex component. Managed via **pnpm** with a **Nix flake** dev shell.

## Essential Commands

```bash
pnpm dev          # Start vinext dev server (localhost:3000, runs in workerd)
pnpm build        # convex deploy + vinext build (production)
pnpm start        # Serve the built Worker locally (wrangler dev)
pnpm deploy       # Build + deploy to Cloudflare Workers (@vinext/cloudflare)
pnpm lint         # Run Biome linter
pnpm format       # Format code with Biome (writes in place)
```

The Nix flake (`flake.nix`) provides `pnpm`, `nodejs_22`, and `biome` in the dev shell. Enter via `direnv allow` (`.envrc` contains `use flake`). It also exports `SSL_CERT_FILE` — workerd needs it for outbound TLS (Convex, Google Fonts) on NixOS.

## Toolchain Requirements

- **Node.js**: 22 (pinned in `package.json` engines)
- **pnpm**: 10.22.0 (pinned via `packageManager` field — corepack will enforce)
- **Biome**: 2.2.0 (linter + formatter, replaces ESLint/Prettier)
- **Vite 8** via **vinext**: `vite.config.ts` wires `vinext()` + `@cloudflare/vite-plugin`; `worker/index.ts` is the Worker entry (required — delegates to `vinext/server/fetch-handler`)
- **Tailwind CSS**: v4 via `@tailwindcss/vite` (no `tailwind.config`, no PostCSS config — configuration is CSS-first via `@theme` blocks in `globals.css`)
- **next/* types**: come from `vinext/types` (see `next-env.d.ts`); the `next` package is NOT installed

## Auth (Better Auth, passkey-only)

- Local component install in `convex/betterAuth/` (passkey needs schema changes, so the npm component can't be used). Regenerate schema after plugin changes: `cd convex/betterAuth && npx auth generate --output schema.ts -y`
- Server config: `convex/auth.ts` (`createAuthOptions`), client: `src/lib/auth-client.ts`, server helpers: `src/lib/auth-server.ts` (`isAuthenticated`, `getToken`, `fetchAuthQuery`, ...)
- Sign-in is passkey-only (`/sign-in`). First-passkey bootstrap is pre-auth but self-locks: it requires `PASSKEY_SETUP_TOKEN` (Convex env var) and only works while zero passkeys exist
- Admin gating: `src/proxy.ts` (Next 16 proxy convention, optimistic cookie check) + per-layout email allowlist (`hackr@hackr.sh`) in `src/app/admin/*/layout.tsx`
- Env vars on the Convex deployment (set via `npx convex env set`): `BETTER_AUTH_SECRET`, `SITE_URL`, `PASSKEY_SETUP_TOKEN`
- Pin `better-auth` to `~1.6.15` — `@convex-dev/better-auth` types break on newer 1.6.x. `@better-fetch/fetch@1.1.21` and `@better-auth/utils@0.4.1` are direct deps to keep peer type resolution unified

## Architecture

```
src/
  app/             # App Router (layout.tsx, page.tsx, globals.css)
  components/      # React components
  lib/             # Utilities (cn helper, auth-client/auth-server)
convex/
  betterAuth/      # Locally-installed Better Auth component (schema, adapter)
worker/
  index.ts         # Cloudflare Worker entry for vinext
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

- **Tailwind v4 has no config file**: Theme customization happens in CSS via `@theme inline {}` directives. Don't create a `tailwind.config.js/ts` or a `postcss.config` — Tailwind runs through `@tailwindcss/vite`.
- **sharp is ignored**: `pnpm-workspace.yaml` ignores the `sharp` dependency (image optimization uses it but it can fail in Nix environments).
- **Biome domains**: The linter has Next.js and React recommended rule domains enabled — it will catch Next-specific issues.
- **`noUnknownAtRules` is off**: Biome's CSS lint rule for unknown at-rules is disabled because Tailwind v4 uses at-rules like `@theme` that Biome doesn't recognize.
- **`VINEXT_KV_CACHE`**: the KV namespace id in `wrangler.jsonc` must be created with `npx wrangler kv namespace create VINEXT_KV_CACHE` and pasted in before deploying.
- **MDX blog posts** are read from `content/` via `fs` + `gray-matter` (no `@next/mdx` — vinext doesn't run webpack loaders).

<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->
