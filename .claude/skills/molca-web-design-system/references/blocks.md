# Blocks (Component Example)

Composed, multi-component sections from the Figma **❖ Component Example** section
(`mvVIgPwuzefi1XA90TstQ6`, read via the plugin bridge). These are blocks, not tokens —
**read the specific frame via the plugin bridge before implementing one** (most ship
Light + Dark example frames). Build from the preset Button + foundation components.

## Sidebar → shadcn `Sidebar`
`Sidebar` (`State`), `Nav item base` (`Type`, `State`), `Nav item dropdown` (`Open`),
`Nav featured card` (`Type`). Map to `Sidebar` / `SidebarMenu*` + collapsible groups.

## Modal → shadcn `Dialog` / `Sheet`
`Modal` (`size`), `modal-header` (`type`), `modal-footer` (`breakpoint`, `type`),
plus **Onboarding Modal** (`Type`). Always include `DialogTitle`.

## Table → shadcn `Table` (+ TanStack Table for data)
`table-items` (`Type`). Use `tanstack-query` for server data; TanStack Table for
sorting/paging/selection. Pair with the `Pagination` and `Filters` blocks.

## Filters → `Popover` + `ToggleGroup` / `Checkbox`
`Filter base` (`State`), `Filter element` (`Type`).

## Stepper → compose (no stock shadcn primitive)
`Steppers` (`Type`, `Size`), `Step button base` (`State`), `Step icon base`
(`Type`, `Size`, `State`).

## Empty state → shadcn `Empty`
`EmptyState` (`Type`).

## Search → shadcn `Command` (palette) / `Input` (inline)
`Search base` (`State`). Inline search uses the `InputSearch` pattern; global search
uses `Command` inside `Dialog`.

## Footer / Banner → compose
`Footer` (`Type`, `Breakpoint`); `Basic Banner` (`Type`, `Breakpoint`) with example
frames: Basic / Between-Justified / Inverted / Brand (Light + Dark). Inline page
banners can use `Alert`.

## Navigation bar / Page header → compose (+ `Breadcrumb`)
`Page-Header`, `Heading-Left` (`Back Button`, `Avatar`, `Subtitle`, `Tag`).

## Cards (composed examples) → shadcn `Card`
Ready-made layouts: Card With Thumbnail, Invite Member, Select Payment Method, User
Profile, Notifications Settings, Personal/Account Details, User Card, Card Fieldset
(each Light/Dark). Plus a `List` (`Type`) component.

## Scrolling banner → compose
Testimonials marquee (Light/Dark) — CSS animation / marquee.
