# Molca ↔ shadcn mapping

Use this when translating Figma variant names to `button.tsx` (or other component) CVA props.

## Button `type` → shadcn `variant`

| Molca Figma `Type` | shadcn `variant` | Notes |
|--------------------|------------------|-------|
| Primary | `default` | Fill `#231f20`, white label, 12px radius (dark: lime `#cfff33`) |
| Secondary | `secondary` | Muted fill, same geometry family |
| Tertiary (Border Only) | `outline` | Transparent fill + `Border/secondary` (`#e5e5e5`) |
| No Bg + Border | `ghost` | Name = "No (Bg + Border)": no fill, **no** border — text only |
| Destructive | `destructive` | Error/delete actions |

Do not use shadcn `link` for Molca text buttons unless Figma explicitly matches link styling.

## Button `Size` → shadcn `size`

| Molca | Height (px) | shadcn `size` | Action |
|-------|-------------|---------------|--------|
| xs | 32 | *(custom)* | Add `xs` to `buttonVariants` |
| sm | 36 | `sm` | Direct map |
| md | 40 | `default` | Direct map |
| lg | 48 | `lg` | Direct map |
| xl | 56 | *(custom)* | Add `xl` to `buttonVariants` |
| Icon only | matches row height | `icon` | Square; use `aria-label` |

Icon-only columns in Figma use the same size names with `Icon=Only`.

## Button `State` → CSS / props

| Molca `State` | Implementation |
|---------------|----------------|
| Default | Base variant styles |
| Hover | `hover:` Tailwind + Figma hover token |
| Disabled | `disabled:` + reduced opacity; `disabled` prop |
| Selected | **`data-state="selected"`** or `aria-pressed` — not in stock shadcn |
| Focused | `focus-visible:ring-*` — destructive row uses **Focused** instead of Selected |
| Hover (Icon Button) | Separate gray/default type rows in `1334:774` |

## Button `Icon` → props

| Molca `Icon` | Code |
|--------------|------|
| Default | Text + optional leading/trailing lucide icons |
| Only | `size="icon"`, single icon, required `aria-label` |

Figma props: `iconLeading`, `iconTrailing`, `iconLeadingSwap`, `iconTrailingSwap`.

## Typography tokens (from Primary xs)

| Token | Value |
|-------|-------|
| `--font/family/Poppins` | Poppins |
| `--font/weight/semi-bold` | 600 |
| `--font/size/xs` | 12px |
| `--font/line-height/xs` | 16px |
| `--text/text-button` | white (on primary) |
| `--bg/button-(brand-bg)` | `#231f20` |
| `--radius/md` | 8px |
| `--radius/lg` | 10px |
| `--spacing/0.5-(2px)` | 2px |

Map these to shadcn CSS variables in `globals.css` / `@theme`, e.g. `--primary`, `--primary-foreground`, `--radius`.

## Component category index

| Figma component | Category | shadcn / pattern |
|-----------------|----------|------------------|
| Button | actions | `Button` |
| Icon Button | actions | `Button` icon variant or dedicated component |
| Button Group | patterns | `ToggleGroup` or grouped `Button`s |
| Button Split | patterns | `Button` + `DropdownMenu` |
| Button Orientation | patterns | Vertical `flex-col` group |
| Input Search | forms | `Input` + search icon |
| Input Group | forms | `InputGroup` |
| Dropdown Menu | overlays | `DropdownMenu` |
| Dropdown Select | forms | `Select` |
| Dropdown Popover | overlays | `Popover` + menu content |

When a row exists in Figma but not in the project's `components/ui`, add via `pnpx shadcn@latest add <name>` then apply Molca tokens.
