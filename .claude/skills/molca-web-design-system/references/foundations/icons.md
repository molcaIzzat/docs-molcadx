# Icons

Source: Figma `mvVIgPwuzefi1XA90TstQ6`, Foundations → Icons (read via the plugin bridge).

## The icon set is **lucide**

The Icons page holds **~1007** icon components named in lucide kebab-case
(`activity`, `alert-circle`, `align-center`, `arrow-big-down`, `app-window`, …).
So in code, **use [`lucide-react`](https://lucide.dev)** — do not export SVGs from Figma.

- Set the project's shadcn `iconLibrary` to `lucide` (`npx shadcn@latest` reads this).
- Convert Figma name → component: kebab-case → PascalCase, e.g. `alert-circle` → `AlertCircle`, `arrow-big-down` → `ArrowBigDown`.
- In shadcn buttons, pass icons with `data-icon` and **no sizing class** (the component sizes them); see the shadcn skill's [`rules/icons.md`](../../../../engineer/shadcn/rules/icons.md). Molca `md` button icon = 20px.

## Brand / payment glyphs (not in lucide)

A few brand icons live alongside the lucide set: **Visa, PayPal, MasterCard** (and
similar). These are not in `lucide-react` — export the specific node as SVG via the
plugin bridge (`figma_export`/screenshot) only when one is actually needed.
