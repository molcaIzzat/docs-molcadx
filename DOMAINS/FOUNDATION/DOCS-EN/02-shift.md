# F-02 — Shift

> Concepts + entity specification (§9). Working spec. Two-level Enterprise Shift / Site
> Shift; no rotation. Entity spec status: 🟢 **ACTIVE** — **restored 2026-09-10**
> ([B1 closed](../../../LOGS/decisions/2026-09-10-b1-shift-instance-generator-owner.md); was
> downgraded 2026-09-03, see
> [original blocker](../../../LOGS/decisions/2026-09-03-foundation-contest-blockers.md#b1--generator-shift_instance-tidak-berpemilik-f-02-h-6)).
> `SHIFT_INSTANCE` is the entity every production transaction attaches to; its generator
> (§H-6 below) is now owned by `production-domain` — one generator, one `SHIFT_INSTANCE`
> per site+shift+date, read by every MOM domain that needs shift/time context (not
> regenerated per domain).

**In short:** Shift is the most-referenced entity in MolcaDx. Nearly every production
number is reported per shift, and every production transaction must carry a
`shift_instance_id`. Shift is declared in two steps — an enterprise names its shifts,
then each site gives those shifts a real start and end time — and there is no rotation:
every shift a site has declared happens on every working day.

## What this module is for

It defines the shift labels and their clock hours (start time, end time), and gives
**every production transaction its time context**. A shift is the smallest meaningful
unit of analysis in manufacturing — almost every production number gets reported per
shift, not per hour or per day.

**What it is not for:** deciding *which dates* production actually runs (holidays,
planned shutdowns, "is this Tuesday a working day at all"). That's a separate concern
outside FOUNDATION's scope — see the note on `SHIFT_INSTANCE` generation below. Shift
only declares shift *structure*; it does not declare a calendar of occurrences.

## Why it matters — what goes wrong without it

Without a firm concept of shift, three things break immediately:
1. **Rollups** — output can't be summed into a meaningful work period.
2. **Accountability** — it's unclear which team produced which numbers.
3. **Comparison** — Shift 1 vs Shift 3 performance can't be compared, even though that's
   one of the most useful analyses a plant can run.

## Core concepts

**1. Two levels of declaration — identity, then reality.**

| Level                | Declares                                                                                                     | Example                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- |
| **Enterprise Shift** | The shift labels that exist across the enterprise — name only, no times                                      | "This enterprise has Shift 1, Shift 2, Shift 3" |
| **Site Shift**       | Which of the enterprise's shifts a given site actually runs, plus that site's real start and end time for it | "Site JKT1 runs Shift 1: 07:00–15:00"           |

An Enterprise Shift is declared **once**, centrally. Every site must then declare a
**Site Shift for every Enterprise Shift** — adoption is mandatory, not optional; a site
cannot skip one of the enterprise's declared shifts. What each site controls is the real
hours: the same label can carry different start/end times at different sites (Site A's
"Shift 1" might start at 06:00 while Site B's starts at 07:00), but every site must have
a Site Shift row for every Enterprise Shift that exists.

**Break time is not part of this declaration — resolved (H-2, 2026-08-19).** This module
only declares start time and end time. A lunch window is not a field on `SITE_SHIFT`, and
there is no `break_minutes` deduction. If the machine keeps running through a named break,
those minutes stay on the clock as runtime. If it actually stops and the reason is
**planned** (including istirahat), that stop is an `ASSET_STATE_LOG` row, not a shift
attribute. Recurring break classification (the Production Planning canvas table) is a later
`production-domain` story; it is not Foundation, and it does not write downtime by itself.

**2. No rotation, no pattern.** There used to be a "shift pattern" idea — a rotation
telling you which shift runs on which day. **That concept is removed.** On every working
day, **all** shifts a site has declared simply happen, cumulatively. If a site declared
three Site Shifts, all three happen every working day; there is no per-day selection
between them, and no `SHIFT_PATTERN` entity.

**3. Shift instance — the concrete, per-date row transactions attach to.**

| Layer | Contains | Example |
|---|---|---|
| Enterprise Shift | Shift label, enterprise-wide | "Shift 1" |
| Site Shift | That label's real start/end time at one site | S1 @ JKT1 = 07:00–15:00 |
| **Shift instance** | **One real shift, on one specific date, at one site** | S1 @ JKT1 on 2026-08-07 |

Transactions reference the **shift instance** — never Enterprise Shift or Site Shift
directly. That keeps a future hours change from corrupting past data.

**Out of scope for FOUNDATION:** exactly *which dates* get a `SHIFT_INSTANCE` generated,
and the mechanism that generates them, belongs to a separate concept owned by
`production-domain`. FOUNDATION only declares shift structure (which shifts exist, what
hours they run) — it does not need to model or understand how occurrences get scheduled.

**Is a row-per-site-per-shift-per-day too much data? No — volume was never the risk here.**
At 20 sites × 3 shifts × 365 days, that's ~22,000 rows/year; even 100 sites × 5 shifts over
10 years is only ~1.8 million rows — trivial for a relational database with a normal index
on `site_id` + `business_date`. The actual risk is **generation correctness**, which is
exactly why H-6 below is still open, not a solved detail: whatever generates these rows
must guarantee **no duplicates** (two rows for the same site/shift/date would split a real
shift's data across two records — needs a uniqueness constraint on
`site_id` + `site_shift_id` + `business_date`) and **no gaps** (a failed generation run
leaves a day with nothing for transactions to attach to). Neither guarantee exists yet
because the generation mechanism itself hasn't been decided.

**4. Business date — the concept most often gotten wrong.** A night shift crosses
midnight. Whose date does 01:00 output belong to?

Common industry practice: **one shift belongs to one production date**, usually the date
the shift **started**. So a 22:00–06:00 night shift on August 7 belongs entirely to
`business_date = 2026-08-07`, including the 03:00 output on August 8.

If this isn't fixed explicitly, daily reports will split the night shift in two and never
match the supervisor's own log.

> **Confirmed by Product Owner, 2026-08-12:** `business_date` = the shift's **start**
> date does match Molca's actual reporting practice. This closes H-4 below and resolves
> the risk noted in PRD-001 (R-02: the concern that `business_date` = shift start date
> might not match actual floor practice).

**5. The shift clock is POT.** Shift declares start and end only. In ISO 22400-2
that duration fills **POT** (planned operation time — scheduled time the work unit can
be used). It is **not** **PBT**. `PBT = POT − planned downtime` is computed in the KPI
layer ([kpi-formula.md](07-0-kpi-formula.md)). This module must not store `scheduled_minutes`
or PBT on `SHIFT_INSTANCE`. H-7 stays with `production-domain`.

**6. Every declared shift counts.** There is no production vs non-production flag on a
shift: every shift a site declares counts toward OEE. (Removed 2026-09-23, PO decision —
`ENTERPRISE_SHIFT.is_production_shift` no longer exists.)

**7. A closed shift is final.** Once closed, its hours and duration can't change.
Corrections are made as signed adjustments, never by editing the shift's definition —
otherwise already-shared reports would rewrite themselves.

**8. Handover between shifts.** An important practice systems often miss: information
passed from one shift to the next — a problem machine, an unfinished job, a quality note.
A system with no place for this stays paper-and-notebook-backed regardless of what else
it does.

## How the entities connect

```
ENTERPRISE → ENTERPRISE_SHIFT (label only — "Shift 1", "Shift 2", "Shift 3")
                    ↓ (every site must declare one SITE_SHIFT row per ENTERPRISE_SHIFT)
SITE → SITE_SHIFT (start time, end time — mandatory for every enterprise shift, per site)
             ↓ (generated per date — mechanism out of FOUNDATION's scope)
       SHIFT_INSTANCE (one real shift, on one date, at one site)
             → (referenced by every) WORK_ORDER_OPERATION / ASSET_STATE_LOG
```

`SHIFT_INSTANCE` is the time context Availability and other KPI ratios in
[oee-monitoring.md](../../PRODUCTION/DOCS/03-performance.md) attach to — but any scheduled-
time field those ratios need, and how it's computed, is entirely owned by that KPI layer,
not declared on `SHIFT_INSTANCE` here (see point 5 above).

## Common pitfalls

1. **Storing shifts as bare time ranges, with no instance entity.** Transactions lose
   their parent and rollups become fragile.
2. **Reintroducing a rotation/pattern concept.** There isn't one — all of a site's
   declared shifts happen every working day. A "which shift today" lookup table is a sign
   the model has drifted from this decision.
3. **Not fixing a business-date rule.** Daily reports and supervisor logs never agree.
4. **Storing local time with no timezone.** Multi-site data becomes impossible to compare.
5. **Declaring PBT (or `scheduled_minutes`) on `SHIFT_INSTANCE`.** The clock is ISO **POT**,
   not PBT. PBT is `POT − planned downtime` in the KPI layer — see point 5 above.
6. **Putting `break_minutes` on `SITE_SHIFT`.** That would shrink the clock whether or
   not the machine stopped. Breaks that actually happen are planned downtime on
   `ASSET_STATE_LOG` (H-2).
7. **No handover mechanism.** The notebook stays in use; the system just becomes extra
   work.
8. **Allowing edits to a closed shift.** Historical numbers stop being stable.
9. **Letting a site skip declaring one of the enterprise's shifts.** Adoption is
   mandatory, not optional — every site must have a `SITE_SHIFT` row (with its own real
   start/end time) for every `ENTERPRISE_SHIFT` that exists.

## What's still unknown

| #       | Question                                                                                                                                                                                                                                                                                                                                                                | Who needs to answer it |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| ~~H-1~~ | ~~How many Enterprise Shifts exist, and what real start/end times does each site give them?~~ **Resolved: 3 Enterprise Shifts — Shift 1 (07:00–14:59), Shift 2 (15:00–22:59), Shift 3 (23:00–06:59), same local hours at both sites.** Sites differ only in timezone (`Asia/Jakarta` vs `Asia/Tokyo`, [Site Hierarchy §9.3](01-site-hierarchy.md)), not in shift hours. | —                      |
| ~~H-2~~ | ~~Where and how is break time tracked, given it varies by area/line?~~ **Resolved 2026-08-19 — it is not tracked on Shift.** Clock = start/end only. Actual planned stops (including istirahat) live on `ASSET_STATE_LOG` with a planned `DOWNTIME_REASON`. A recurring break table, if any, is `production-domain` later and is not a PBT input.                       | —                      |
| ~~H-4~~ | ~~Does `business_date` = shift-start-date match Molca's actual reporting practice?~~ **Resolved 2026-08-12 — confirmed yes, by Product Owner.**                                                                                                                                                                                                                         | —                      |
| ~~H-5~~ | ~~How is overtime / an extra shift beyond the declared set recorded?~~ **Resolved: not tracked.** No overtime or extra-shift concept for now — see §9.3, `is_overtime` dropped.                                                                                                                                                                                         | —                      |
| H-6     | How and when does `SHIFT_INSTANCE` actually get generated, and **who owns building it**? **Resolved:** generated daily, before each business day begins; **owner is `production-domain`** ([B1 closed, 2026-09-10](../../../LOGS/decisions/2026-09-10-b1-shift-instance-generator-owner.md)). One generator, one row per site+shift+date, consumed by every MOM domain via FK — never regenerated per domain. Owner kept 2026-10-02; a stand-in runs in FOUNDATION master data until Production builds it (PO, 2026-10-02, prd-molcadx#24 item 14 — §9.3). | `production-domain` |
| H-7     | Where does Availability's time base live? **Not a Shift field.** Instance start/end fill ISO **POT** only. **PBT = POT − planned downtime** (ISO 22400-2) — [kpi-formula.md](07-0-kpi-formula.md). Never `PBT = shift`. Job: `production-domain`.                                                                                                                         | production-domain      |

## 9. Entity specification

> 🟡 DRAFT.

### 9.1 `ENTERPRISE_SHIFT` — the shift label, declared once at enterprise level

| Field                    | Type              | Required | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------ | ----------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `enterprise_shift_id`    | internal ID       | Yes      | Permanent, never reused                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `enterprise_id`          | FK → `ENTERPRISE` | Yes      | See [Site Hierarchy §9.2](01-site-hierarchy.md)                                                                                                                                                                                                                                                                                                                                                                                         |
| `shift_label`            | string            | Yes      | Name only, no times — e.g. "Shift 1". The real hours are declared per site in `SITE_SHIFT` (§9.2). **Resolved (H-1): 3 Enterprise Shifts** — "Shift 1", "Shift 2", "Shift 3"                                                                                                                                                                                                                                                            |
| `valid_from`, `valid_to` | date              | Yes      | Deactivate, never hard-delete (§00 shared rule)                                                                                                                                                                                                                                                                                                                                                                                         |

**Keys** (F-00 [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `enterprise_shift_id` · Unique: — (`shift_label`: H-8) · No overlap: —

### 9.2 `SITE_SHIFT` — a site's real start/end time for one enterprise shift

Every site must have exactly one `SITE_SHIFT` row per `ENTERPRISE_SHIFT` that exists —
adoption is mandatory (core concept 1).

| Field | Type | Required | Notes |
|---|---|---|---|
| `site_shift_id` | internal ID | Yes | Permanent, never reused |
| `site_id` | FK → `SITE` | Yes | See [Site Hierarchy §9.3](01-site-hierarchy.md) |
| `enterprise_shift_id` | FK → `ENTERPRISE_SHIFT` | Yes | |
| `start_time` | time | Yes | Site-local time (site's `timezone`, [Site Hierarchy §9.3](01-site-hierarchy.md)). **Resolved (H-1):** 07:00 (Shift 1) / 15:00 (Shift 2) / 23:00 (Shift 3), same local time at every site |
| `end_time` | time | Yes | Site-local time. **Exclusive** — the boundary instant the shift stops, not its last occupied minute (PO, 2026-10-02, prd-molcadx#24 item 15). If `end_time < start_time`, the shift crosses midnight — this is derived from comparing the two times, not stored as a separate `crosses_midnight` field. `end_time = start_time` is refused (see "Shift end time" below). **Resolved (H-1):** 14:59 / 22:59 / 06:59 respectively, written as the last minute; stored as the boundary these are `15:00` / `23:00` / `07:00` — Shift 3 (23:00–07:00) crosses midnight |
| `valid_from`, `valid_to` | date | Yes | A change to hours closes the old row and opens a new one — never edited in place (§00 shared rule; core concept 7, "a closed shift is final") |

**Keys** (F-00 [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `site_shift_id` · Unique: — · No overlap: one active row per (`site_id`, `enterprise_shift_id`) — "exactly one per `ENTERPRISE_SHIFT`" (§9.2); two active rows of one `site_id` never cover the same minutes of the day, across midnight too (time of day, not `valid_from`/`valid_to` — application check at save, §9.2 "No overlap within one site"; ranges are start-inclusive, end-exclusive, §9.2 "Shift end time")

**No break field — resolved (H-2).** Do not add `break_minutes` or break start–end on this
table. See core concept 1.

**No overlap within one site — new rule, resolved 2026-09-02 (PO).** A site's declared
shifts partition the day (core concept 1's "every site must have exactly one row per
`ENTERPRISE_SHIFT`" already implies this, now made explicit): two `SITE_SHIFT` rows for the
same `site_id` must never occupy overlapping minutes, including across midnight (a
`23:00–06:59` shift's tail occupies `00:00–06:59` the next calendar day, which must not
collide with another shift starting before `06:59`). Validated at declare/edit time;
rejected with the conflicting shift named, same shape as the existing delete-blocked error
above.

**Shift end time — exclusive (PO, 2026-10-02, prd-molcadx#24 item 15).** `end_time` is the
boundary instant, so a shift covers `[start_time, end_time)`. A `07:00–15:00` shift and a
`15:00–23:00` shift touch and do not overlap; there is no one-minute gap. The overlap check
above uses the same convention. `start_time = end_time` is refused at save with "Start and end
can't be the same time." — it is neither a zero-length shift nor a 24-hour shift. A 24-hour
shift may be added later if needed; it is not modelled now.

### 9.3 `SHIFT_INSTANCE` — one real shift, on one date, at one site

The entity every production transaction attaches to (`shift_instance_id`) — never
`ENTERPRISE_SHIFT` or `SITE_SHIFT` directly (core concept 3).

| Field | Type | Required | Notes |
|---|---|---|---|
| `shift_instance_id` | internal ID | Yes | Permanent, never reused |
| `site_shift_id` | FK → `SITE_SHIFT` | Yes | Which site/shift this occurrence is for |
| `business_date` | date | Yes | The production date this shift's entire output belongs to — the date the shift **started** (core concept 4, confirmed by PO 2026-08-12) |
| `start_datetime`, `end_datetime` | datetime | Yes | Concrete start/end for this occurrence, derived from `SITE_SHIFT.start_time`/`end_time` on `business_date` (crossing into the next calendar day if the shift crosses midnight) |
| `status` | enum | Yes | At minimum `open` / `closed` (core concept 7 — a closed shift's hours/duration can't change; corrections are signed adjustments, not edits). **Full value list is `TBD`** — e.g. whether a `draft` or `cancelled` state is also needed is not yet decided |

**Keys** (F-00 [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `shift_instance_id` · Unique: (`site_shift_id`, `business_date`) — §9.3; the site follows from `site_shift_id` · No overlap: —

**No `is_overtime` field — resolved (H-5).** Overtime and extra shifts beyond the declared
set are not tracked for now. If that need shows up later, it's a new field/mechanism added
then, not a placeholder carried in the schema today.

A uniqueness constraint on (`site_id` via `site_shift_id`, `site_shift_id`, `business_date`)
is required to prevent duplicate rows for the same site/shift/date splitting a real shift's
data across two records (see "Is a row-per-site-per-shift-per-day too much data?" above).

`SHIFT_INSTANCE` stores the clock only (ISO **POT** filler). It has **no PBT /
`scheduled_minutes` field** (core concept 5). **H-7:** `PBT = POT − planned downtime` in
the KPI layer — never `PBT = shift`. **H-6:** generated daily, before each business day
begins, by `production-domain` — one generator, consumed by every MOM domain via FK
([B1 closed, 2026-09-10](../../../LOGS/decisions/2026-09-10-b1-shift-instance-generator-owner.md)).

**Stand-in generator until Production builds one (PO, 2026-10-02, prd-molcadx#24 item 14).**
The owner stays `production-domain` (B1). Until Production builds its generator, a stand-in
runs inside FOUNDATION master data, with a placeholder list of production dates. It must move
to Production later. It is not the design: do not copy its date list or its placement into
specs or stories. Rules it must still follow: no duplicate and no gap per site+shift+date (§9.3).

### 9.4 Open questions

| # | Question | Owner |
|---|---|---|
| ~~H-1~~ | ~~How many Enterprise Shifts exist, and what real start/end times does each site give them?~~ **Resolved: 3 shifts (07:00–14:59 / 15:00–22:59 / 23:00–06:59), same local hours at both sites** (§9.1–§9.2). | — |
| ~~H-2~~ | ~~Where and how is break time tracked?~~ **Resolved: not on Shift.** No `break_minutes` on `SITE_SHIFT`. Planned actual stops are `ASSET_STATE_LOG`. Recurring classification is later Production, not this module. | — |
| ~~H-5~~ | ~~How is overtime / an extra shift beyond the declared set recorded?~~ **Resolved: not tracked — no `is_overtime` field** (§9.3). | — |
| ~~H-6~~ | ~~How and when does `SHIFT_INSTANCE` actually get generated, and who builds/owns it?~~ **Resolved:** daily, before each business day begins (§9.3); **owner is `production-domain`** ([B1 closed, 2026-09-10](../../../LOGS/decisions/2026-09-10-b1-shift-instance-generator-owner.md)). One generator, consumed by every MOM domain via FK. | `production-domain` |
| H-7 | Where does Availability's time base live? **Not a Shift field.** Instance start/end = ISO **POT** only. **PBT = POT − planned downtime** — [kpi-formula.md](07-0-kpi-formula.md). Never `PBT = shift`. | production-domain |
| H-8 | **Keys (2026-10-01).** Is `ENTERPRISE_SHIFT.shift_label` unique per `enterprise_id` (among active rows)? Not stated (§9.1); not listed in its **Keys** line until decided | `foundation-domain` / PO |
| ~~H-9~~ | ~~Is `end_time` the last occupied minute (inclusive) or the boundary instant? Does 14:59 touch 15:00 or leave a gap?~~ **Resolved 2026-10-02 (PO, prd-molcadx#24 item 15): exclusive boundary instant**; the overlap check uses the same convention (§9.2 "Shift end time") | — |
| ~~H-10~~ | ~~What happens when `start_time = end_time` (zero-length or 24-hour window)?~~ **Resolved 2026-10-02 (PO, prd-molcadx#24 item 15): refused at save** ("Start and end can't be the same time."); a 24-hour shift may be added later if needed (§9.2) | — |

## Next step

The entity spec (§9) is written. H-1, H-2, H-5, and now H-6 are resolved (generation timing
**and** ownership — `production-domain`, [B1 closed 2026-09-10](../../../LOGS/decisions/2026-09-10-b1-shift-instance-generator-owner.md)).
Module status restored to `ACTIVE`. H-7 stays with KPI: fill **POT** from instance hours,
compute **PBT = POT − planned downtime** (ISO), never store PBT on Shift.
