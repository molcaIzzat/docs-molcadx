---
name: molca-web-design-system
description: >-
  Molca web design-system reference (Figma "Molca — Shadcn Design System").
  Use ONLY when adding or changing a component's design — its variants, sizes,
  states, or brand tokens — or when mapping a Figma node to shadcn, or when the
  user shares the Molca Figma link. NOT for general UI implementation or data
  work — use the `shadcn` and `tanstack-query` skills for building features.
---

# Molca Web Design System

Design specs for Molca **web** apps (backoffice / browser). Molca extends [shadcn/ui](https://ui.shadcn.com) with brand tokens and extra sizes/states (Light + Dark; brand flips to lime in dark).

For **implementation**, load the **Engineering** team:

- [`engineer/shadcn`](../../engineer/shadcn/SKILL.md)
- [`engineer/tanstack-query`](../../engineer/tanstack-query/SKILL.md) when fetching data

When **recreating a screen** from a design/prompt, also follow the designer's habits:
[`../design-conventions/`](../design-conventions/README.md) (reference, not a skill).

## Figma source

| Field | Value |
|-------|-------|
| File | [Molca — Shadcn Design System](https://www.figma.com/design/mvVIgPwuzefi1XA90TstQ6/Molca---Shadcn-Design-System) |
| File key | `mvVIgPwuzefi1XA90TstQ6` |
| Buttons canvas | node `164:223` |

See [references/figma-source.md](references/figma-source.md) for MCP workflow and node IDs.

## Design system catalog (Figma pages)

The file is far larger than the documented components below. Full page inventory:

- **❖ Foundations:** Logos, Color, Icons, Pagination, Buttons, Inputs, Boundary lines, Avatars, Badges + Tags, Checkbox groups, Tabs, Dropdowns, Switches, Progress indicators, Slider, Tooltips, Mobile Tab bar, File upload, Cursors, Card, Calendar, Carousel, Breadcrumbs, Alert
- **❖ Component Example:** Scrolling Banners, Cards, Navigation bar, Sidebars, Banners, Tables, Empty state, Footers, Filters, Modals, Steppers, Search, Navbar, Onboarding Modals — specced in [references/blocks.md](references/blocks.md)
- **❖ Page Example:** Digital Twin (Molca Factory), VR, AR, Web; Teams, Pricing, FAQs, Settings, Log In/Sign Up, Feedbacks

Variable collections (402 vars): **Primitives** (ramps, radius, spacing), **Tokens**
(semantic, Light/Dark), **Typography** (desktop/mobile). Read with the `figma-console`
plugin bridge (`figma_get_variables`) — no rate limit; see `figma-source.md`.

Documented: all **Foundations** — tokens (colors, typography, spacing/radius, icons)
and every component family (actions, forms, data-display, navigation, overlays,
feedback); plus the **Component Example** blocks ([blocks.md](references/blocks.md)) —
all with Figma variant matrices mapped to shadcn. The **Page Example** section
(full screens) is catalogued above but not specced — read the page via the plugin
bridge before implementing.

## Reference layout

| Category | Path | Contents |
|----------|------|----------|
| **Foundations** | [references/foundations/](references/foundations/) | [colors](references/foundations/colors.md), [typography](references/foundations/typography.md), [spacing & radius](references/foundations/spacing-radius.md), [icons](references/foundations/icons.md), [shadcn mapping](references/foundations/shadcn-mapping.md) |
| **Components** | [references/components/](references/components/) | Atomic UI by shadcn family |
| **Patterns** | [references/patterns/](references/patterns/) | Composed blocks (groups, splits, input+button) |

### Components (by category)

| Category | Documented |
|----------|------------|
| **Actions** | [button](references/components/actions/button.md), [icon-button](references/components/actions/icon-button.md) |
| **Forms** | [forms](references/components/forms.md) — input, checkbox, switch, slider, file upload |
| **Data display** | [data-display](references/components/data-display.md) — avatar, badge/tag, card, calendar, carousel |
| **Navigation** | [navigation](references/components/navigation.md) — tabs, breadcrumb, pagination, mobile tab bar |
| **Overlays** | [overlays](references/components/overlays.md) — dropdown, tooltip |
| **Feedback** | [feedback](references/components/feedback.md) — alert, progress |

### Patterns

| Pattern | Status |
|---------|--------|
| [Button patterns](references/patterns/button-patterns.md) | indexed (group, split, orientation) |

## Molca vs stock shadcn

| Area | Stock shadcn | Molca web |
|------|--------------|-----------|
| Primary brand | Theme-dependent | Near-black `#231f20` |
| Button label font | Inter / system | **Poppins Semi Bold** |
| Button sizes | `sm`, `default`, `lg`, `icon` | **`xs`–`xl`** + icon-only |
| Button types | shadcn variants | **Primary, Secondary, Tertiary, No Bg + Border, Destructive** |
| Extra states | hover, disabled, focus | **`selected`**; destructive uses **`focused`** |
| Button radius | Theme `--radius` | **12px** (Radius/xl); ghost 16px — plain rounded, no scallop |

Full mapping: [references/foundations/shadcn-mapping.md](references/foundations/shadcn-mapping.md).

## Workflow

1. Identify category (foundations / component / pattern).
2. Read Figma via MCP when available (`references/figma-source.md`).
3. Map tokens and variants using foundations mapping.
4. Hand off to **Engineering** (`shadcn`, `tanstack-query`) for code.

## Design compliance checklist

- [ ] Correct web design-system category and Figma node
- [ ] CSS variables / tokens, not hardcoded hex
- [ ] Poppins Semi Bold on button labels
- [ ] Button radius 12px (Radius/xl); brand flips to lime (`#cfff33`) in dark mode
- [ ] Accessible focus, disabled, icon-only labels
- [ ] Light/dark if tokens define both

## Resources

- [Figma — Buttons](https://www.figma.com/design/mvVIgPwuzefi1XA90TstQ6/Molca---Shadcn-Design-System?node-id=164-223)
- [shadcn/ui docs](https://ui.shadcn.com/docs)
