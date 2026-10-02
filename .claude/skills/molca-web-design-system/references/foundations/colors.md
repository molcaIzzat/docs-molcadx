# Colors

Source: Figma "Molca — Shadcn Design System" (`mvVIgPwuzefi1XA90TstQ6`), collections
**Primitives** (raw ramps) and **Tokens** (semantic, Light/Dark), via the plugin bridge.

## Molca brand primitives

| Token | Hex |
|-------|-----|
| `Color/Molca/primary-lime` | `#CFFF33` |
| `Color/Molca/primary-lime-disable` | `#5A5F33` |
| `Color/Molca/primary-black` | `#231F20` |
| `Color/Molca/primary-black-90` | `#231F20` @ 90% |
| `Color/Molca/primary-black-85` | `#231F20` @ 85% |
| `Color/Molca/black` | `#010101` |
| `Color/Molca/divider` | `#2C2C2C` |

## Semantic tokens (Light / Dark)

These map to shadcn CSS variables — see the implemented theme in
[`engineer/shadcn/references/molca-preset/globals.css`](../../../../engineer/shadcn/references/molca-preset/globals.css).

| Token | Light | Dark |
|-------|-------|------|
| `Text/primary` | `#1D293D` | `#F5F5F5` |
| `Text/secondary` | `#525252` | `#D4D4D4` |
| `Text/tertiary (helper)` | `#737373` | `#A1A1A1` |
| `Text/quaternary (placeholder)` | `#A1A1A1` | `#737373` |
| `Text/brand` | `#231F20` | `#CFFF33` |
| `Text/text-button` | `#FFFFFF` | `#231F20` |
| `Text/success` | `#00C950` | `#B9F8CF` |
| `Text/error` | `#FB2C36` | `#FF6467` |
| `Text/warning` | `#FF6900` | `#FFD6A7` |
| `BG/primary (app-background)` | `#FAFAFA` | `#010101` |
| `BG/secondary (card-surface)` | `#FFFFFF` | `#231F20` |
| `BG/tertiary (section-grouping)` | `#F5F5F5` | `#404040` |
| `BG/quaternary` | `#E5E5E5` | `#525252` |
| `BG/button (brand-bg)` | `#231F20` | `#CFFF33` |
| `BG/input field` | `#FAFAFA` | `#010101` |
| `BG/success` | `#DCFCE7` | `#00C950` |
| `BG/error` | `#FB2C36` | `#FF6467` |
| `BG/warning` | `#FFEDD4` | `#FF6900` |
| `Border/primary` | `#D4D4D4` | `#525252` |
| `Border/secondary` | `#E5E5E5` | `#404040` |
| `Border/tertiary` | `#F5F5F5` | `#262626` |
| `Border/brand` | `#2C2C2C` | `#2C2C2C` |
| `Border/error` | `#FB2C36` | `#FF6467` |

> **Dark mode flips the brand to lime** (`#CFFF33`) with dark text (`#231F20`).

## Primitive ramps

Tailwind-style 50–950 ramps available as `Color/<Ramp>/<step>`:
**Slate, Gray, Zinc, Neutral, Stone, Red, Orange, Yellow, Lime, Green, Emerald,
Teal, Cyan, Sky, Blue, Indigo, Violet, Purple, Fuschia, Pink, Rose**, plus
`Color/Alpha/{white,black}-{0..100}` opacity steps. Prefer the **semantic tokens**
above over raw ramps in code.
