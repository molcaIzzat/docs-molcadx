# Feedback

Source: Figma `mvVIgPwuzefi1XA90TstQ6`, Foundations → Alert / Progress indicators
(variants via the plugin bridge). Use the status tokens (`--success`, `--warning`,
`--destructive`) from the preset `globals.css`.

## Alert → shadcn `Alert`
- **Alert** — `Color` Primary / Danger / Success / Warning · `Type` Title + Description / Title only. Map Danger → `--destructive`, Success → `--success`, Warning → `--warning`, Primary → brand.
- **Alert icon base** — `Color` Gray / Primary / Secondary / Success / Warning / Danger · `State` Default / Hover (leading status icon).

## Progress → shadcn `Progress`
- **Progress bar** — `Type` Default / Brand · `Size` xs / sm / md / xl · `Progress` 0–100% (10% steps) · `Label` False / Right.

## Toast
Not a Foundations page — use shadcn `sonner` for new shadcn surfaces. If the app uses a
non-shadcn UI library, use that library's toast instead.
