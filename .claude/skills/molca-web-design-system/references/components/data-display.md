# Data display

Source: Figma `mvVIgPwuzefi1XA90TstQ6`, Foundations → Avatars / Badges + Tags /
Card / Calendar / Carousel (variants via the plugin bridge).

## Avatar → shadcn `Avatar`
- **Avatar** — `Type` Default / Polygon / Icon Button / State / Verified / Placeholder · `Size` xs / sm / md / lg / xl / 2xl / 3xl · `Border` bool. Always include `AvatarFallback`.
- **Avatar group** — sizes xs–lg (overlapping stack).
- **Avatar info group** — `Type` Default / Button / File / Notification / Copy · size sm / md / lg (avatar + text).
- **Gradient Avatar** — numeric sizes 16–100 · `Color` Red/Orange/Yellow/Green/Turquoise/Aqua/Blue/Purple/Dark/Light · `Type` Gradient / Text.

## Badge / Tag → shadcn `Badge`
- **Badges** — `Size` sm / md / lg · `Type` Pill / Rectangle · `Icon` bool · `Color` Gray / Sky / Green / Blue / Purple / Pink / Orange / Red / White. Map Color to status/semantic tokens.
- **Tag** — size sm (compact, removable).

## Card → shadcn `Card`
- **Card** (responsive) — `Type` Desktop / Tablet · `Size` md / sm · `State` Default / Hover / Button-Hover. Use full `CardHeader/Title/Description/Content/Footer`.
- **card-data-1/2/3** — dashboard stat cards (Type 01/02, Trend Positive/Negative; Heading/Content; Default/Placeholder).

## Calendar → shadcn `Calendar` + `Popover`
- **Month and Year Selector**, **Date of Birth Picker**, **Date and Time Picker** — each `State` default / open (trigger + popover calendar).

## Carousel → shadcn `Carousel`
`type` in-place / modal / miniatures, plus a **carousel-thumbnail** (selected / unselected).
