# Overlays

Source: Figma `mvVIgPwuzefi1XA90TstQ6`, Foundations → Dropdowns / Tooltips
(variants via the plugin bridge). See also button patterns
[`patterns/button-patterns.md`](../patterns/button-patterns.md) for trigger compositions.

## Dropdown → shadcn `DropdownMenu` / `Select`
- **Dropdown list item** — `Type` Default / Trailing / Leading + Checkbox / Leading + Radio / Divider · `State` Default / Hover / Focus / Disabled. Items go inside `DropdownMenuGroup`; checkbox/radio rows → `DropdownMenuCheckboxItem` / `DropdownMenuRadioItem`.
- **Dropdown list header** — `Type` Header / Avatar group → `DropdownMenuLabel`.
- **Avatar Dropdown** — avatar trigger, `Open` bool.
- **Scroll bar** — large / medium / small (long menus → `ScrollArea`).
- Container radius 12px (Radius/xl); destructive items use `--destructive`.

## Tooltip → shadcn `Tooltip`
- **Tooltip** — directional: `↑ ← → ↓` (maps to `side="top|left|right|bottom"`).
- **Tip** — `Type` Success / Prompt / Error (semantic colored tip; use status tokens).
