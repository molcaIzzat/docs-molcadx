---
name: molca-ui
description: >-
  Build UI with the Molca design system and the @molca shadcn registry. Use when
  implementing or editing Molca screens/components/blocks, when the project uses the
  @molca registry or molca-theme, or when the user mentions Molca UI, Molca brand
  tokens, app-shell, settings, data-table, or async-select. Delegates component
  discovery to the shadcn CLI/MCP so it never goes stale.
---

# Molca UI

The **`@molca` registry is the source of truth** — not this file. This skill tells you
how to *use* the registry correctly and encodes the brand conventions the registry
can't describe on its own. **Discover components; don't assume their APIs.**

Registry: `https://molca-web-ui-kit.vercel.app/r/{name}.json` (namespace `@molca`).

## 1. Discover before you build

Never hand-write a Molca component from memory. Ask the registry:

```bash
shadcn info --json                 # this project: framework, tailwind, aliases, installed items
shadcn search @molca               # everything Molca publishes
shadcn view @molca/app-shell       # a component's real files, deps, and API
shadcn add @molca/<name>           # install it (pulls registryDependencies too)
```

If a `@molca` MCP server is connected, prefer its search/view/add tools — same idea.

If `components.json` has no `@molca` entry, add it:

```json
"registries": { "@molca": "https://molca-web-ui-kit.vercel.app/r/{name}.json" }
```

## 2. Start a Molca app

`shadcn add @molca/molca-base` — installs the theme + Molca button. That's the
foundation; add blocks on top.

## 3. Brand & theme rules (the part the registry can't teach)

- Style is **`radix-nova`**, base color neutral, icons **lucide**, fonts **Poppins**
  (sans) with **Molca Medium/Bold** for headings/display, radius `0.5rem`, buttons `12px`.
- **The brand color flips**: `#231f20` (near-black) in light, **lime `#cfff33`** in dark.
  Never hardcode it — use the `brand` / `primary` tokens.
- **Always use semantic tokens, never raw hex.** Beyond the shadcn defaults, Molca adds:
  `text-secondary` / `text-tertiary` / `text-quaternary`, `success` + `success-foreground`,
  `warning` + `warning-foreground`, `brand`, `bg-input`, `border-secondary`, `border-brand`.
  These are per-mode (vivid in dark), so a token is always correct where a hex isn't.
- Comes from `@molca/molca-theme`. Don't redefine these variables in a consuming app.

## 4. i18n & RTL

- Molca blocks share **`@molca/i18n`** — an *isolated* i18next instance that never
  collides with a host app's global i18n. Each block registers its own namespace via
  `registerMessages()`, so **one language switcher drives them all**. Ships English + `id`.
- When you add strings to a block, register them in that block's namespace — don't reach
  into a global instance.
- RTL is off by default (`components.json` → `"rtl": false`). Flip it there, not per-component.

## 5. Compose, don't rebuild

Reach for the block that already exists before writing layout from scratch:

| Need | Use |
|------|-----|
| App frame (sidebar + top bar + dashboard) | `@molca/app-shell` — pass `children` to fill it |
| Preferences / profile / danger-zone screen | `@molca/settings` — pass `active` + `onSelect` to bind a router |
| Sortable/filterable table w/ pagination | `@molca/data-table` |
| Server-searched (debounced) single/multi combobox | `@molca/async-select` |
| Status callout | `@molca/alert` (default/success/warning/destructive) |

Extend these via their props before forking their source. `view` the component first to
see what props/slots it already gives you.

## Golden rules

1. **Discover with the CLI/MCP** — this file lists *what exists* and *the conventions*; the
   registry holds the current API. Check it every time.
2. **Semantic tokens only.** No hex, no per-app theme overrides.
3. **Compose Molca blocks** before building new layout.
4. **One shared i18n**, per-block namespaces.
