---
name: molca-prototype
description: >-
  Build a fast Molca UI prototype (Vite + React + shadcn). Use when asked to
  prototype or mock up a Molca screen, feature, or flow. Runs end-to-end
  without prompts.
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

# Molca prototype

Turn a screen/feature description into a running **Vite + React + shadcn** prototype that
already looks like Molca. This skill orchestrates existing pieces — it doesn't restate them:

- **What to build** → [`designer/design-conventions`](../../designer/design-conventions/README.md)
  (the recipe per screen: which block, the flow, the states to cover).
- **How it looks** → the **Molca registry** (`molca-base` = theme + button) + the
  [`shadcn`](../shadcn/SKILL.md) skill for the CLI.
- **Data** (only if the prototype needs it) → [`tanstack-query`](../tanstack-query/SKILL.md);
  otherwise mock with local state.

## Operating mode — run it autonomously
This skill is often driven by non-engineers (PMs). **Don't pause to ask** — pick sensible
defaults and keep going until the app builds *and* renders. Every CLI call must be
**non-interactive**: an unanswered prompt leaves you stuck. If a feature isn't fully
specified, build a reasonable version with mock data and note the assumption at the end.

## Step 1 — Scaffold once (Vite + Tailwind + shadcn)
If there's no `package.json`/`components.json` yet:
```bash
pnpm create vite@latest <app> --template react-ts
cd <app> && pnpm i
pnpm add tailwindcss @tailwindcss/vite
```
Wire Tailwind v4 + the `@` alias **before** `shadcn init` (it validates them):
- `src/index.css` → replace contents with `@import "tailwindcss";`
- `vite.config.ts` → add the `tailwindcss()` plugin and
  `resolve: { alias: { '@': path.resolve(__dirname, './src') } }`
- `tsconfig.json` **and** `tsconfig.app.json` → `compilerOptions.paths = { "@/*": ["./src/*"] }`
  (set `paths` only — **no `baseUrl`**; it's deprecated in TS 6 and fails the build)

Init shadcn **non-interactively** — bare `init` hangs on a preset picker:
```bash
pnpm dlx shadcn@latest init --base radix --preset nova --yes
```

Apply the Molca look. The registry is a **private** repo, so `shadcn add molca-id/skills/molca-base`
and the SSH form both fail (resolved as a `ui.shadcn.com` item). Build the registry from a local
checkout of `molca-id/skills` and add the built files:
```bash
# in the molca-id/skills checkout (the repo this skill ships from):
pnpm dlx shadcn@latest build registry.json -o /tmp/molca-r
# back in <app> — theme cssVars + the Molca button:
pnpm dlx shadcn@latest add /tmp/molca-r/molca-theme.json /tmp/molca-r/button.json --yes
```
Load the brand font (the theme sets `font-sans: Poppins`, but doesn't ship it):
```bash
pnpm add @fontsource/poppins   # import 400/500/600/700 in src/main.tsx
```
**Done when** `pnpm dev` runs with Molca tokens applied (brand `#231f20`, Poppins,
dark mode flips brand to lime `#cfff33`).

## Step 2 — Build each screen from its recipe
For every screen the user names:
1. **Match the recipe** in design-conventions (cheat-sheet) → note the starter block.
2. **Install it**: `pnpm dlx shadcn@latest add @shadcn/<block> --yes` (e.g. `sidebar-07`,
   `dashboard-01`, `data-table-demo`, `login-03`). Add `button-patterns` for the composed bits.
   **Never overwrite `button.tsx`** — the Molca button is customized; exclude `button` from the
   add list (a blanket `--yes` will clobber it).
3. **Assemble** per the recipe; wire mock data with local state.
4. **Honor the conventions** (don't re-derive — read the recipe):
   - Container by action: **data entry = modal or drawer per the recipe; confirmations = `AlertDialog`**.
   - lucide icons via the component's icon slot; semantic tokens, never raw hex; light + dark.
5. **Cover the states** the recipe lists (default · empty · loading · error · filtered · success).

**Done when** the screen renders all its required states, not just the happy path.

## Gotchas (these silently break the build or blank the screen)
- **Molca button ≠ stock shadcn.** Variants: `default · secondary · outline · ghost · destructive`.
  Sizes: `xs · sm · md · lg · xl` + `icon-xs…icon-xl`. The default size is **`md`, not `default`**.
  Stock components that hardcode `size="default"` (notably `alert-dialog.tsx`'s action/cancel) won't
  typecheck — change those to `size="md"`.
- **Sidebar tooltips need a provider.** `SidebarMenuButton`'s `tooltip` prop renders a Radix
  `Tooltip`; with no `TooltipProvider` the app throws on mount and renders a **blank page**. Wrap the
  app once at the root: `<TooltipProvider>…</TooltipProvider>`.
- **Routing + login blanks on reload.** In-memory auth resets on refresh/deep-link and bounces to
  `/login` (reads as "broken"). If the prototype has both routing and login, persist auth/role to
  `sessionStorage`.

## Step 3 — Verify it actually renders
A clean build does **not** prove the app works — runtime errors (e.g. the Tooltip one above) blank
the page while `pnpm build` stays green. So do both:
1. `pnpm build` — catches type errors (the size/`baseUrl` issues surface here).
2. **Smoke-test the runtime.** Load it headless, screenshot, and read the console. Cached Chromium is
   usually at `~/.cache/ms-playwright/chromium-*/chrome-linux64/chrome`; `pnpm add -D playwright`,
   drive it (seed `sessionStorage` to skip login), then remove the dev dep — or use the `verify` /
   `run` skills. **Zero console errors + a non-empty `<body>` = good.**

## Scope (it's a prototype)
Favor speed: mock data over real APIs, local state over a store. Default to one screen at a time, but
build the full set when asked. Skip auth/persistence unless the prototype is specifically about them
(beyond the lightweight `sessionStorage` note above).
