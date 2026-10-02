# Typography

Source: Figma `mvVIgPwuzefi1XA90TstQ6`, **Typography** collection (modes: `desktop`,
`mobile`), via the plugin bridge.

## Families

| Token | Value | Use |
|-------|-------|-----|
| `Font/family/Poppins` | Poppins | UI / body / buttons (Semi Bold on button labels) |
| `Font/family/Molca Bold` | Molca Bold | brand / display headings |
| `Font/family/Molca Medium` | Molca Medium | brand / display |

## Weights

`Thin, Extra Light, Light, Regular, Medium, Semi Bold, Bold, Extra Bold, Black`.
UI most-used: **Regular (400)**, **Medium (500)**, **Semi Bold (600)**.

## Size & line-height scale (px)

| Token | Size | Line-height | Mobile override |
|-------|------|-------------|-----------------|
| `xxxs` | 8 | — | |
| `xxs` | 10 | 12 | lh 16 |
| `xs` | 12 | 16 | |
| `sm` | 14 | 20 | |
| `base` | 16 | 24 | size 14 |
| `lg` | 18 | 28 | |
| `xl` | 20 | 28 | |
| `2xl` | 24 | 32 | |
| `3xl` | 30 | 36 | size 24 |
| `4xl` | 36 | 40 | |
| `5xl` | 48 | 48 | |
| `6xl` | 60 | 60 | |
| `7xl` | 72 | 72 | |
| `8xl` | 96 | 96 | |
| `9xl` | 128 | 128 | |

Letter-spacing and paragraph-spacing tokens (`xs`) are `0`. Values are identical
across desktop/mobile except the overrides noted above.

## Tailwind v4 mapping (suggestion)

```css
@theme inline {
  --font-sans: "Poppins", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Molca Bold", var(--font-sans);
  --text-xs: 12px;  --text-sm: 14px;  --text-base: 16px; --text-lg: 18px;
  --text-xl: 20px;  --text-2xl: 24px; --text-3xl: 30px;  /* … */
}
```
