# Spacing & radius

Source: Figma `mvVIgPwuzefi1XA90TstQ6`, **Primitives** collection, via the plugin bridge.

## Radius (px)

| Token | px | | Token | px |
|-------|----|--|-------|----|
| `Radius/none` | 0 | | `Radius/xl` | 12 |
| `Radius/xxs` | 2 | | `Radius/2xl` | 16 |
| `Radius/xs` | 4 | | `Radius/3xl` | 20 |
| `Radius/sm` | 6 | | `Radius/4xl` | 24 |
| `Radius/md` | 8 | | `Radius/full` | 9999 |
| `Radius/lg` | 10 | | | |

Buttons use **`xl` (12px)**; the No Bg + Border (ghost) variant uses **`2xl` (16px)**.

## Spacing (px)

4px base grid: `0, 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64, 72, 76, 80, 96,
128, 160, 192, 224, 256, 320, 384, 480, 560, 640, 720, 768, 1024, 1280, 1440,
1600, 1920`. Token names embed the px, e.g. `Spacing/4 (16px)`, `Spacing/0․5 (2px)`.

## Tailwind v4 mapping (suggestion)

```css
@theme inline {
  --radius-sm: 6px; --radius-md: 8px; --radius-lg: 10px;
  --radius-xl: 12px; --radius-2xl: 16px;
}
```
Tailwind's default 4px spacing scale already matches this grid — no override needed.
