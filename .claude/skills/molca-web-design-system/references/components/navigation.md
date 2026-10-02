# Navigation

Source: Figma `mvVIgPwuzefi1XA90TstQ6`, Foundations → Tabs / Breadcrumbs /
Pagination / Mobile Tab bar (variants via the plugin bridge).

## Tabs → shadcn `Tabs`
- **Tab button base** — `Type` Button gray / Underline brand / Underline black / Icon · `Size` sm / md / lg · `Full-width` bool · `State` Default / Hover / Selected.
- **Horizontal tabs** — `Type` Button white border / Underline brand / Underline black / Icon · `Full width` bool. Selected = brand/black underline or filled, per Type.

## Breadcrumbs → shadcn `Breadcrumb`
- **Breadcrumbs** — `Divider` Chevron / Slash · `Breakpoint` Desktop.
- **Breadcrumb item** — `Icon` bool · `State` Default / Hover / Selected; current item non-interactive.

## Pagination → shadcn `Pagination`
- **Pagination and item per page** — `Options` xs / sm / md / lg / xl, plus an "item per page" select.

## Mobile Tab bar → (compose; no stock shadcn primitive)
- **Tab Bar Item** — `State` Selected / Default.
- **Tab bar** — version variants; bottom nav for mobile/AR/VR surfaces.
