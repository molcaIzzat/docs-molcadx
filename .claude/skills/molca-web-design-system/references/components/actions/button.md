# Button

> **Category:** components / actions  
> Figma: [Buttons canvas](https://www.figma.com/design/mvVIgPwuzefi1XA90TstQ6/Molca---Shadcn-Design-System?node-id=164-223) · component set `11458:35124`

**Description (from Figma):** An interactive element that triggers an action when clicked or tapped.

## Variant matrix

### Types (rows in Figma) — exact `Type` values

1. **Primary** — brand-filled (`#231f20`), white text, 12px radius → shadcn `default`
2. **Secondary** — secondary fill → shadcn `secondary`
3. **Tertiary (Border Only)** — transparent fill + `Border/secondary` (`#e5e5e5`), brand text → shadcn `outline`
4. **No Bg + Border** — name reads as "No (Bg + Border)": neither background nor border, text-only (brand-colored) → shadcn `ghost`
5. **Destructive** — error/delete actions (`Type=Destructive`) → shadcn `destructive`

### Sizes (columns)

`xs` · `sm` · `md` · `lg` · `xl` · icon-only variants for each

### States (within each cell)

| Type | States |
|------|--------|
| Primary, Secondary, Tertiary (Border Only), No Bg + Border | Default, Hover, Disabled, **Selected** |
| Destructive | Default, Hover, **Focused**, Disabled |

### Icon modes

- **Default** — label "Button" with leading + trailing circle icons (placeholder lucide icons in dev)
- **Only** — square icon button per size column (see also [icon-button.md](icon-button.md))

## Visual signature

Buttons are **plain rounded rectangles** — `cornerRadius 12px` (Radius/xl) on filled/outline variants, `16px` (Radius/2xl) on the No Bg + Border (ghost) variant. There is **no scalloped/wavy edge** (an earlier draft of this doc claimed one; verified false against the Figma geometry).

State deltas (verified on the `md` column via the Figma plugin):

| Variant | Default | Hover | Selected | Focused |
|---------|---------|-------|----------|---------|
| Primary | fill `#231f20`, text white | `bg/90` | same as default | — |
| Secondary | fill `#f5f5f5`, text `#231f20` | — | fill darkens to `#e5e5e5` | — |
| Tertiary (Border Only) | 2px border `#e5e5e5` | — | border darkens to `#a1a1a1` | — |
| No Bg + Border (ghost) | text only | bg `accent` | same as default | — |
| Destructive | fill `#fb2c36` **+ 2px** `#fb2c36` border, white text | `bg/90` | — | transparent fill, `#fb2c36` border + text |

## Token snapshot (Primary, md, Default)

From the Figma plugin on the Button component set (`11458:35124`):

```
Background: BG/button (brand-bg) → #231f20  (dark mode: #cfff33 lime)
Text:       Text/text-button     → #ffffff   (dark mode: #231f20)
Font:       Poppins Semi Bold (600)
Corner radius: 12px (Radius/xl)
Gap: ~4px between icon and label
Icon size: 20px (md)
```

## shadcn implementation notes

Extend `components/ui/button.tsx`:

```tsx
const buttonVariants = cva(/* ... */, {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground rounded-xl",
      secondary: "...",
      outline: "...",
      ghost: "...",
      destructive: "...",
    },
    size: {
      xs: "h-8 px-2.5 text-xs",
      sm: "h-9 px-3 text-sm",
      default: "h-10 px-4",
      lg: "h-12 px-6",
      xl: "h-14 px-7 text-base",
      icon: "size-10",
      "icon-xs": "size-8",
    },
  },
})
```

Add `data-[state=selected]:` styles for toggle-like selected buttons.

Variant mapping: [../../foundations/shadcn-mapping.md](../../foundations/shadcn-mapping.md).

Compound usages (groups, splits): [../../patterns/button-patterns.md](../../patterns/button-patterns.md).

## Accessibility

- Icon-only: always `aria-label`
- Disabled: native `disabled` or `aria-disabled` + no pointer events
- Destructive focus: visible `focus-visible` ring distinct from primary
- Selected: `aria-pressed="true"` when acting as toggle
