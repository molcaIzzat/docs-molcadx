# Forms

Source: Figma `mvVIgPwuzefi1XA90TstQ6`, Foundations → Inputs / Checkbox groups /
Switchs / Slider / File upload (variants read via the plugin bridge). Use the
semantic tokens in [`../../../../engineer/shadcn/references/molca-preset/globals.css`](../../../../engineer/shadcn/references/molca-preset/globals.css).

## Input → shadcn `Input` / `InputGroup`
- **Input Dropdown** — `Size` sm · `Type` Default / Leading icon / Trailing dropdown / Trailing Icon / Leading & Trailing Icon · `State` Default / Hover / Selected / Disabled · `Destructive` bool.
- **InputGroup** — `type` text / number / password · `affix` prefix / suffix / both · `onSurface`, `gapSpace` bools. → shadcn `InputGroup` + `InputGroupAddon`.
- **Textarea** — `Type` Default / Tags · states as above. → `Textarea`.
- **Verification code** — 4 digits, size sm / md. → `InputOTP`.

Map `Destructive=True` to `aria-invalid` + `data-invalid`; states to `hover:` / `focus-visible:` / `disabled:`.

## Checkbox → shadcn `Checkbox` / `RadioGroup`
- **Checkbox base** — `Type` Checkbox / Radiobutton / Some Selected (= indeterminate) · `Size` xs / sm · `State` Default / Hover / Selected.
- **Checkbox group item** — `Badge` yes/no · `Color` Brand / Black. → wrap in `Field` + `FieldLabel`.

## Switch → shadcn `Switch`
`Size` md / sm / xs · `Color` Brand / Gray / Black. (Figma `Type` axis holds internal placeholder names — ignore.)

## Slider → shadcn `Slider`
`Type` Default / Bottom label / Top floating · handle `Type` Default / Text / Tooltip · `State` Default / Disabled. Single + range (left/right control).

## File upload → (compose; no stock shadcn primitive)
- **Image upload** / **File upload** — `State` Default / Hover / Disabled / Error (+ Success for image).
- **File upload item** — progress bar/fill, icon File-type / Simple, `State` In progress / Complete / Error.
