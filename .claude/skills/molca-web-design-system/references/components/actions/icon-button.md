# Icon Button

> **Category:** components / actions  
> Figma node `1334:774` · [Buttons canvas](https://www.figma.com/design/mvVIgPwuzefi1XA90TstQ6/Molca---Shadcn-Design-System?node-id=164-223)

Lightweight icon-only control for toolbars and dense UI. Separate from the main **Button** set's `Icon=Only` column but shares size scale.

## Variants

| Type | Sizes | States |
|------|-------|--------|
| Gray | sm | Default, Hover |
| Default | xs, sm, md, lg | Default, Hover |

## vs Button `Icon=Only`

| | Icon Button (`1334:774`) | Button icon-only column |
|--|--------------------------|-------------------------|
| Use | Toolbar, inline actions | Full button variant matrix (primary, secondary, …) |
| Types | Gray, Default | All Molca button types |
| States | Default, Hover | Default, Hover, Disabled, Selected |

## Implementation

```tsx
<Button variant="ghost" size="icon" aria-label="Settings">
  <SettingsIcon className="size-4" />
</Button>
```

Or a dedicated `IconButton` if the project already wraps gray/default types.

## Accessibility

- Required `aria-label` or `aria-labelledby`
- Min touch target 44px when used in touch-heavy layouts
