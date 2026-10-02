# F-03 — Yearly & Quarterly Declaration

> Concepts + entity specification (§9). Working spec. Split from the old Calendar module
> (working-day calendar is not FOUNDATION — see "What this module does NOT cover").
> Entity spec status: 🟢 ACTIVE — ready to implement.

**In short:** this module answers one question only — **"from when to when does a
business year (and its quarters) run?"** It is a pure declaration of a reporting window.
It does not decide which days are worked, and it does not calculate anything.

## What this module is for

`FISCAL_YEAR` sets the annual window that numbers get bucketed into for reporting. It is
**enterprise-level only — no site override** (see Y-2 below, resolved). That's the entire
scope: **when does the year start and end, and how do quarters split inside it.**

## What this module does NOT cover

This used to be bundled with a working/non-working day calendar (`NON_WORKING_DAY`,
`SHIFT_CALENDAR`) in a single "Calendar" module. **That holiday/exception-calendar concept
is retired entirely** — the PO decided a fixed exception list doesn't fit, since holidays
and working patterns vary per enterprise/tenant/site with no settled way to declare them.

"Which dates production is actually planned on" is a separate concern, owned entirely by
`production-domain`. It is not part of this module and not part of FOUNDATION — FOUNDATION
does not need to model or understand how those occurrences get scheduled.

For shift structure (labels, real hours, break), see [Shift](02-shift.md) — that is also a
separate module now, not folded in here.

## Why it matters — what goes wrong without it

| If you skip this | What happens |
|---|---|
| No fixed fiscal window | "Q1 2026" means a different date range in every report, and totals never reconcile |
| Quarter split left ad-hoc | Week-based reporting (4-5-4 etc.) drifts between spreadsheets and the system |
| Fiscal year edited after the fact | Already-closed periods' totals silently shift |

## Two modes

A fiscal year is configured with a **mode switch**:

| `calendar_basis` | How the year is defined |
|---|---|
| `monthly` | From month to month — `start = 1st of start_month`, `end = last day of end_month` |
| `weekly_iso` | Window picked by **dates**, then a quarter pattern is chosen |

For `monthly`, the dates derive themselves, so the window is always month-aligned. For
`weekly_iso`, the user picks the week-anchored start/end date, then picks how quarters
split.

## The conditional quarter pattern

When `calendar_basis = weekly_iso`, an extra option appears to choose how each quarter
is built:

| Pattern | Quarter split |
|---|---|
| `4-5-4` | 4-week, 5-week, 4-week |
| `4-4-5` | 4-week, 4-week, 5-week |
| `5-4-4` | 5-week, 4-week, 4-week |

Each quarter is 13 weeks no matter which pattern is chosen. The pattern only matters in
`weekly_iso` mode — it is **hidden and ignored** in `monthly` mode.

## How the entities connect

```
ENTERPRISE → FISCAL_YEAR (enterprise-level only — no SITE override)
```

That's the whole picture — `FISCAL_YEAR` does not connect to Shift or to any
holiday/working-day concept; it only tags a date range with a year/quarter label for
reporting.

## Common pitfalls

1. **Editing a past fiscal year.** Changing the window for a year that's already closed
   would rewrite already-shared reports; changes only apply going forward.
2. **Showing `period_pattern` in `monthly` mode.** It should be hidden, not just optional
   — surfacing it invites someone to fill in a value that means nothing in that mode.
3. **Conflating this with a working-day calendar.** This module never decides which days
   are worked — that's Work Schedule (`production-domain`), not this file.

## What's still unknown

| # | Question | Who needs to answer it |
|---|---|---|
| ~~Y-1~~ | ~~Is Molca's fiscal year month-aligned, or week-based (52/53-week)?~~ **Resolved: month-aligned.** `calendar_basis = monthly` is the confirmed mode. | — |
| ~~Y-2~~ | ~~Does any site actually need a fiscal-year override, or is enterprise-level always enough?~~ **Resolved: no site override needed — enterprise-level always.** | — |
| Y-3 | **Keys (2026-10-01).** Not stated for `FISCAL_YEAR` (§9.1): is `fiscal_year_label` unique per `enterprise_id`, and may two active rows of one enterprise have overlapping `start_date`–`end_date` windows? Not listed in its **Keys** line until decided | `foundation-domain` / PO |
| Y-4 | **Versions (2026-10-02).** Can one version be replaced by more than one row (two rows with the same `previous_version_id`), or is the chain always linear? If linear, `previous_version_id` is unique among non-null rows. Not listed in the **Keys** line until decided | `foundation-domain` / PO |

## 9. Entity specification

> 🟡 DRAFT.

### 9.1 `FISCAL_YEAR` — the reporting-window declaration

Enterprise-level only — no `SITE` override (Y-2, resolved). `FISCAL_YEAR` delivers both
`calendar_basis` modes as real, selectable options — `monthly` and `weekly_iso` both ship.
Y-1 only confirms which mode Molca's own fiscal year happens to use (`monthly`); it's a
fact about Molca's calendar, not a scope decision restricting which modes the product
supports.

| Field | Type | Required | Notes |
|---|---|---|---|
| `fiscal_year_id` | internal ID | Yes | Permanent, never reused |
| `enterprise_id` | FK → `ENTERPRISE` | Yes | See [Site Hierarchy §9.2](01-site-hierarchy.md). No `site_id` — enterprise-level only (Y-2) |
| `fiscal_year_label` | string | Yes | e.g. "FY2026" — the label reports group by |
| `lineage_id` | internal ID | Yes | Same value on every version of one declaration — groups a fiscal year with its corrections (PO, 2026-10-02, prd-molcadx#24 item 16). Set on the first version and copied to each new one; never changed. Not unique on its own |
| `previous_version_id` | FK → `FISCAL_YEAR` | No | The version this row replaced. Null on the first version of a lineage (PO, 2026-10-02, prd-molcadx#24 item 16) |
| `calendar_basis` | enum | Yes | `monthly` or `weekly_iso` (see "Two modes" above) — both delivered. **Can't be changed** on a declaration: a save that changes it is refused with a message, not turned into a new declaration (PO, 2026-10-02, prd-molcadx#24 item 16). Message: draft text `sit-002.fiscal-ent.amend.mode-change` in [UX 01](../UX/01-site-hierarchy.md) (2026-10-02) — it names the other way out: declare a new fiscal year in the other mode |
| `start_month`, `end_month` | integer (1–12) | Required when `calendar_basis = monthly`; not applicable when `weekly_iso` | The year runs `start = 1st of start_month` to `end = last day of end_month`. Must not be shown or filled in for a `weekly_iso` row |
| `start_date`, `end_date` | date | Required for both modes | Derived for `monthly` (from `start_month`/`end_month`); entered directly for `weekly_iso`, where this is the field that actually carries the window |
| `period_pattern` | enum | Required when `calendar_basis = weekly_iso`; not applicable when `monthly` | `4-5-4` / `4-4-5` / `5-4-4` — how each 13-week quarter splits. Hidden per-row whenever that row's own `calendar_basis = monthly` (common pitfall 2) — a per-row UI rule, not a sign `weekly_iso` itself is deferred |
| `valid_from`, `valid_to` | date | Yes | A past, already-closed fiscal year is never edited (common pitfall 1) — a correction closes the old row and opens a new one, applying only going forward. **Half-open** ([F-00](00-foundation.md), PO 2026-10-02): the old row's `valid_to` = the new row's `valid_from`, not the day before (§00 shared rule) |

**Keys** (F-00 [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `fiscal_year_id` · Unique: — (Y-3; `lineage_id` is shared by all versions, so not unique; `previous_version_id`: Y-4) · No overlap: — (Y-3)

### 9.2 Open questions

None remain for either mode — Y-1 and Y-2 are both resolved (see "What's still unknown"
above). Y-3 (keys, 2026-10-01) and Y-4 (versions, 2026-10-02) are open, in the same table.

## Next step

Build `FISCAL_YEAR` against §9.1, supporting both `monthly` and `weekly_iso` as real,
selectable modes for any enterprise/tenant.
