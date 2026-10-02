# PRODUCTION — Work Master (what it is for Production)

| | |
|---|---|
| **Module** | Work Master — Production view |
| **Status** | 🟢 AKTIF (2026-09-27, issue #42 — WM-P-3 closed, WM-P-2 parked with owner, creator map added; ot-it spot-check done 2026-09-27 — Directive creator = production execution management) |
| **Source** | Faris Figma 2026-09-24 (Process under Master Foundation); Faris note same day: Production Work Master was not yet named; Work room 2026-09-27 (Faris + ot-it + it-platform) |
| **SoT for recipe data** | [FOUNDATION F-08 Work Master](../../FOUNDATION/DOCS-EN/08-work-master.md) |

---

## One sentence

**Work Master is the process recipe** — how a SKU is made (steps, materials, standard cycle time, eligible Work Units). It is owned by **FOUNDATION (F-08)**. Production does **not** keep a second Work Master catalog. Production **uses** that recipe to plan and run Job Orders.

## Why this doc exists

Faris asked (2026-09-24) what Work Master means *for Production* because the Figma shows it but Production docs had not named it. This is the Production-facing answer — not a rewrite of F-08.

## What the Figma shows

Under **Master Foundation**:

- **Work Master (Process)** — process definition for the plant (example label on the board: Work Master for Kanimex).
- **Cycle Time** links **Work Master + SKU → Work Unit** — the standard time Production planning and OEE Performance depend on.
- That package feeds **Production Planning → Job Order** (upload schedule, dispatch, interlocks, tracing).

So on the board, Work Master sits with Foundation masters; Planning only *consumes* it.

## Object split (IEC 62264 Part 4 — keep clean)

| Object | Owner | What it is | Production cares about |
|--------|-------|------------|------------------------|
| **Work Master** | FOUNDATION F-08 | Template work definition: routing / operations / BOM / standard cycle time / process | Pick the right recipe for an SKU + line |
| **Work Directive** | PRODUCTION (when modeled) | Job-specific copy of the master for *one* Job Order | Freeze routing/BOM identity (and overrides) for that order; carry interlock notes. Not the OEE Performance join |
| **Job Order** | PRODUCTION | Dispatched unit of scheduled work (today’s `WORK_ORDER` family) | Schedule form, target, machine, sequence, approval, break windows, tracing |
| **Job Response** | PRODUCTION (when close-in-scope) | Execution result / close-out | Achievement, actuals → Monitoring & Performance |

**Do not invent a fifth “Production Work Master” entity.** If the plant needs a different process version, that is a new **Work Master version** in F-08 (or a Directive override), not a parallel Production master table.

Schedule upload forms and multi-job lists are **Work Schedule / Job List** when needed — they sit *on* this spine; they do not replace Work Master.

## What Production needs from Work Master

From F-08 (and F-06 SKU), Planning must be able to read:

1. **Process / operation sequence** — steps and order for the SKU on a line.
2. **Eligible Work Center / Work Unit** — where the job may run (ties Cycle Time → Work Unit on the Figma).
3. **Standard cycle time** — for target, live achievement %, and OEE Performance.
4. **BOM / material list** — for the execution interlock “material availability.”
5. **Setup / crew standards** (when declared on OPERATION) — for readiness checks.

## What is *not* Work Master

| Concern | Home |
|---------|------|
| Daily target, priority 1st/2nd/3rd, schedule approval | Job Order / schedule forms — [01-planning.md](01-planning.md) |
| Recurring / one-time break windows | Planning breaktime (shapes POT; not unplanned) |
| Material → WIP → FG lot tracing for a run | Job Order / actuals + tracing |
| Live losses, reason edits, rework | [02-monitoring.md](02-monitoring.md) |
| OEE live/report, MTTR/MTTF/MTBF, management KPI | [03-performance.md](03-performance.md) |

## License gate (already decided)

F-08 data stays FOUNDATION-owned; **screens are license-gated by PRODUCTION** (tenant without Production has nothing to route). See F-08 header + PLATFORM License Manager. This doc does not change that.


## Standards confirm (ot-it 2026-09-24)

There is **no separate Production Work Master**. Planning’s Job Order (and schedule forms) **references FOUNDATION F-08 Work Master** (`ROUTING` / `OPERATION` / `BOM`, including cycle time SKU→Work Unit). Add **Work Directive** only when a released job must freeze/override the master; keep **Job Response** for close/status. Interlocks are rules on Job Order / Directive. Breaktime stays on the shift/work calendar that defines POT — Production documents how Job Orders sit in that calendar, not a new break entity on Work Master. Defer Work Schedule / Job List / Workflow Spec unless Planning already needs multi-job timelines or BPMN-style orchestration.

**Locked 2026-09-27 (Work room — Faris + ot-it + it-platform):** FOUNDATION owns Work Master (F-08). Production **consumes** it and freezes **work-plan identity** per job — routing/BOM version via Work Directive, or the interim `routing_version_locked` / `bom_version_locked` below (W-8). That freeze is **not** a cycle-time snapshot for OEE. No second Production-owned recipe catalog (IEC 62264-4 §7.2 / §4.2.4). Master data stays outside the bronze–silver–gold pipeline.

## Who creates what (IEC 62264-4 §4.2.4)

Each Part-4 object is created and updated by a different Part-3 activity. The table names that activity and who does it in MolcaDx, so integrators know which side owns each write. **ot-it spot-check 2026-09-27** (issue #42 / PR #43) — Directive creator corrected below.

| Object | Part-3 activity that creates / updates it | Who in MolcaDx | Status in MolcaDx |
|--------|-------------------------------------------|----------------|-------------------|
| **Work Master** | Definition management | FOUNDATION admin, on F-08 screens (license-gated by PRODUCTION) | ✅ Modeled — `ROUTING` / `OPERATION` / `BOM` / `BOM_LINE` (F-08) |
| **Work Directive** | Production execution management (copies the master for one job; IEC 62264-4 §4.2.4 / 62264-3 §6.8.3) | System, on `WORK_ORDER` release | ⏸ Interim — snapshot fields on `WORK_ORDER`, see below. Entity ships with B3 lock (F-08 W-8) or job-level overrides (WM-P-1) |
| **Job Order** | Detailed production scheduling creates; production dispatching releases it to the Work Unit | Planner (manual — MolcaDx is the primary path, W-1/B4) | ✅ Modeled — `WORK_ORDER` / `WORK_ORDER_OPERATION` ([01-planning.md](01-planning.md#entities)) |
| **Job Response** | Production execution management + production data collection | Sensor (Silver) as source of truth; operator / MES override | 🟡 Partial — actuals on `WORK_ORDER_OPERATION` (+ `_DEFECT`, `_LOT`). The result of **one** Job Order (§9.5) |
| **Work Schedule** | Detailed production scheduling | — | ⏸ Deferred — schedule upload form covers it until multi-job timelines are needed |
| **Job List** | Production dispatching | — | ⏸ Deferred — same trigger as Work Schedule |
| **Work Request** | Detailed production scheduling (from the Level-4 plan) | — | ⏸ Deferred — no ERP path today (W-1/B4) |
| **Work Performance** | Production tracking (rollup that answers a Work Request, §9) | — | ⏸ Deferred — **Job Response ≠ Work Performance.** Never fold Work Performance into Job Response; model it when Work Request ships |

## Interim Directive-equivalent on `WORK_ORDER`

Until the Work Directive entity ships (WM-P-1 trigger), these `WORK_ORDER` fields stand in for it. They are *Directive-equivalent until modeled* — not a second Work Master.

| Field | Set when | What it freezes | Blocked by |
|-------|----------|-----------------|------------|
| `routing_version_locked` | `draft` → `released` | The `ROUTING` version — and through it every `OPERATION` step's **identity** (sequence, Work Unit, setup, crew). Not the OEE cycle-time join | F-08 W-8 — no version-pin field on `ROUTING` yet |
| `bom_version_locked` | `draft` → `released` | The `BOM` version, and through it every `BOM_LINE` | F-08 W-8 — no version-pin field on `BOM` yet |

No cycle-time (or speed) field is copied onto the job. No other snapshot field is added for Performance.

**Two different guarantees — do not merge them** ([01-planning.md B3 point 2](01-planning.md#routingbom-locked-at-release-b3); Work 2026-09-27 with ot-it + it-platform):

- **Job work plan** (which steps and materials this job runs under) → the **locked** routing/BOM version above (when W-8 exists).
- **OEE Performance** (Silver) → `OPERATION.cycle_time_value` or `standard_speed_value` **effective on `business_date`** (F-07). Silver does **not** read a frozen cycle-time field on the job. Watch: a master value is never edited in place — a correction closes the old `OPERATION` row and opens a new one (F-08 §9.2). If that new row is back-dated to cover a past `business_date`, recomputation changes Performance for that day. Wanting PRI (planned run time per item, ISO 22400-2 §5.1.2.5 — see [F-07](../../FOUNDATION/DOCS-EN/07-0-kpi-formula.md)) “as released” later is a product choice on W-8 — not required by ISO 22400, and not baked into Silver now.

## Closed

- **WM-P-1** — Directive when freeze/override/audit/multi-freeze; else WO snapshot fields = interim Directive (ot-it 2026-09-24).
- **WM-P-3** — Figma "Cycle Time" is a **UI label only**. It maps to `OPERATION.cycle_time_value` (+ `uom_id`, `batch_size`) on discrete/batch Work Units and to `OPERATION.standard_speed_value` (+ `speed_uom_id`) on continuous ones (F-08 §9.2). No new field. ISO 22400-2 §5.1.2.5 planned time per item (2026-09-27).

## Open (do not invent)

| # | Question | Owner | Parked |
|---|----------|-------|--------|
| ~~WM-P-1~~ | ~~When persist Work Directive vs copy onto Job Order?~~ **Closed 2026-09-24 (ot-it Part-4):** Persist an explicit **Work Directive** when (1) release must **freeze** routing/BOM identity (B3 lock), (2) the job may **override** master without editing F-08, (3) audit needs “which recipe this job ran under” separate from the live master, or (4) several Job Orders from one master with different freezes/overrides. Otherwise **Job Order–only** with immutable snapshot fields at release is a thin interim — label those fields *Directive-equivalent until modeled*; they are **not** a second Work Master. Implement Directive entity when B3 lock or overrides ship — not before. | — | — |
| WM-P-2 | Which F-08 fields are mandatory on schedule upload before dispatch? **Floor already set by the release rule** ([01-planning.md](01-planning.md#work_order-status)): an active `ROUTING` and `BOM` on `planned_start`. **Still open:** must every `OPERATION` on that routing also carry its standard (`cycle_time_value` or `standard_speed_value`) before dispatch, or may a job run and show achievement % as "can't be calculated"? And are `standard_setup_time` / `crew_size` needed (F-08 W-7)? | PO + ops | 2026-09-27 |
| ~~WM-P-3~~ | ~~Cycle Time on Figma vs `OPERATION` time fields~~ **Closed 2026-09-27** — see Closed above. | — | — |
| WM-P-4 | **Process-segment library** — reusable steps shared across products (S-6a-adjacent). | PO | Deferred past Q3 |

## Next

1. PO + ops answer WM-P-2.
2. Ship the Work Directive entity only when F-08 W-8 (B3 lock) is decided or job-level overrides are needed.
