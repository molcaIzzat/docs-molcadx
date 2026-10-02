# M-02 — Work Master (`WMS`)

> 🟠 CONCEPT. First cut — entities sketched from the IEC 62264 Work Master/Schedule/Request/
> Job Order/Directive chain, applied to Maintenance specifically, **not** copied from
> PRODUCTION's `ROUTING`/`OPERATION` shape. A PM procedure is a checklist against an asset
> type, not a routing across work centers — the two don't share a data shape just because
> they're both called "Work Master."

## What this module is for

The **recipe** for planned maintenance: what has to be done, in what order, with what parts
and tools, to perform preventive maintenance (PM) on a class of asset. This is the template;
the actual scheduled/dispatched/executed instance of that template (Work Schedule → Work
Request → Job Order → Work Directive, per IEC 62264) is a **separate, not-yet-built** module —
see [`03-work-order.md`](#relationship-to-the-rest-of-the-iec-62264-chain) below, still `TBD`.

## Why it's shaped differently from PRODUCTION's Work Master

| PRODUCTION (`ROUTING`/`OPERATION`) | MAINTENANCE (`PM_PROCEDURE`) |
|---|---|
| Sequenced across multiple `WORK_CENTER`s (a product moves station to station) | Performed *at* the asset's own location — no cross-station sequencing |
| Standard is a rate or cycle time feeding an OEE Performance calculation | Standard is a checklist + duration estimate for labor/downtime planning — not an OEE input |
| Keyed to `PRODUCT` (what's being made) | Keyed to `ASSET_TYPE` (what's being maintained) |
| Triggered by demand (a `WORK_ORDER` to make N units) | Triggered by **time or usage interval** (every N days, or every N run-hours) — a genuinely different scheduling basis IEC 62264's generic "Work Schedule" box doesn't specify further |

Reusing `ROUTING`/`OPERATION`'s shape here would force PM steps to pretend they're
work-center-sequenced production steps, which they aren't. Same reasoning `AGENTS.md` already
applies elsewhere: don't generalize a shape across domains just because the box on a diagram
has the same label.

## 9. Entity specification

### 9.1 `PM_PROCEDURE` — a preventive-maintenance checklist for one asset type

| Field | Type | Required | Notes |
|---|---|---|---|
| `pm_procedure_id` | internal ID | Yes | Permanent, never reused |
| `asset_type_id` | FK → FOUNDATION `ASSET_TYPE` ([Equipment Taxonomy §9.3](../../FOUNDATION/DOCS-EN/04-asset-ontology.md#93-asset_type--modelspec-shared-technical-attributes)) | Yes | Every asset of this type shares the same procedure — same sharing pattern as `ASSET_TYPE.attributes`. Per-instance override (one specific asset needing a different procedure) is `TBD`, not assumed needed until a real case shows up |
| `procedure_code` | string | Yes | Business code, per [`00-foundation.md`](../../FOUNDATION/DOCS-EN/00-foundation.md)'s ID/code rules |
| `procedure_name` | string | Yes | e.g. "Pump — 500hr service" |
| `interval_basis` | enum | Yes | `calendar` (every N days) or `usage` (every N run-hours). Run-hours read from `ASSET_STATE_LOG`, owned by PRODUCTION since [decision 2026-09-28](../../../LOGS/decisions/2026-09-28-asset-status-ownership.md) (B5 resolved); MAINTENANCE reads it, never writes it. **`TBD`:** how run-hours are derived from the log and what happens on a tenant without Production — WM-3 |
| `interval_value` | integer | Yes | N, in the unit `interval_basis` implies (days, or run-hours) |
| `valid_from`, `valid_to` | date | Yes | Deactivate, never hard-delete (FOUNDATION §00 shared rule, same convention here) |

**Keys** ([F-00 keys rule](../../FOUNDATION/DOCS-EN/00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `pm_procedure_id` · Unique: — (whether `procedure_code` is unique is open question WM-5) · No overlap: —

**No cycle-time/rate field here — deliberately**, same reasoning `ROUTING` gives for why it
carries no cycle time either (that lives one level down): total estimated duration is the
sum of `PM_PROCEDURE_STEP.estimated_duration`, never a separate top-level figure that could
drift out of sync with the steps.

### 9.2 `PM_PROCEDURE_STEP` — one step of a procedure

| Field | Type | Required | Notes |
|---|---|---|---|
| `pm_procedure_step_id` | internal ID | Yes | Permanent, never reused |
| `pm_procedure_id` | FK → `PM_PROCEDURE` (§9.1) | Yes | |
| `step_number` | integer | Yes | Order within the procedure |
| `description` | string | Yes | What the technician does at this step |
| `estimated_duration` | numeric | No | Minutes. Planning input only — not an OEE/KPI element, see [scope note](#two-things-this-module-is-not) |
| `tool_required` | **TBD** | — | No `TOOL` master-data entity exists anywhere in FOUNDATION or MAINTENANCE today. `TBD — needs foundation-domain/PO confirmation`: does MolcaDx need a Tool entity, or is this free text for v1? Not invented here |
| `part_required` | **TBD** | — | No spare-parts/material entity exists — `BOM`/`BOM_LINE` (FOUNDATION F-08) model a *production recipe*, not a maintenance parts list, and reusing them would conflate the two. A real parts master needs an Inventory domain, which doesn't exist yet. `TBD — needs PO confirmation`, tracked the same way License Manager tracked "no Tenant entity" before F-01 was checked — don't assume `BOM_LINE` is reusable without checking it fits first |
| `valid_from`, `valid_to` | date | Yes | Same convention as §9.1 |

**Keys** ([F-00 keys rule](../../FOUNDATION/DOCS-EN/00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `pm_procedure_step_id` · Unique: — (whether `step_number` is unique within a procedure is open question WM-6) · No overlap: —

## Relationship to the rest of the IEC 62264 chain

`PM_PROCEDURE` is only the **Work Master** box. The rest of the chain — Work Schedule (e.g.
"monthly PM schedule for Line 1 equipment"), Work Request, Job Order (a dispatched PM work
order against one physical `ASSET`, with `Start`/`Hold`/`Cancel`/`Abort`/`Stop` commands and
dispatch status), and Work Directive (the as-run record: actual parts consumed, technician,
downtime logged) — is a **separate, larger module**, already flagged as planned but not
modeled in [`AGENTS.md` §2](../AGENTS.md#2-document-index-domainsmaintenancedocs-en)'s
`03-work-order.md` row. Building the Job Order/Directive side means designing a
`MAINTENANCE_WORK_ORDER` entity analogous in *role* to PRODUCTION's `WORK_ORDER`, but — same
principle as this file's own header — not copied from it verbatim; a maintenance work order
carries a technician/downtime/parts-consumed shape, not a shift/shop-floor-output shape.
Out of scope for this file; noted here only so the two pieces aren't confused as one.

## Two things this module is not

| Concept | Owned by |
|---|---|
| Which asset is currently where, current parent/component structure | `foundation-domain` — `PM_PROCEDURE` reads `ASSET`/`ASSET_TYPE`, never redefines them |
| OEE/Performance calculation, `cycle_time_value`/`standard_speed_value` | `foundation-domain` F-07 / `production-domain` — a PM step's `estimated_duration` is a labor/downtime planning input, never an OEE element |

## What's still unknown

| # | Question | Who needs to answer it |
|---|---|---|
| WM-1 | Per-instance PM procedure override (one specific `ASSET` needing a different checklist than its type's default) — needed, or is type-level always sufficient? | Product Owner |
| WM-2 | Tool and spare-part master data — does MolcaDx model these as real entities, and if so, in which domain (MAINTENANCE, or a future Inventory domain)? | Product Owner |
| WM-3 | Usage-based interval (`interval_basis = usage`) reads run-hours from `ASSET_STATE_LOG`. **Ownership resolved 2026-09-28:** PRODUCTION owns and writes it, MAINTENANCE only reads ([decision 2026-09-28](../../../LOGS/decisions/2026-09-28-asset-status-ownership.md)). Still open: (a) the recording level of the log (per Equipment unit / work unit) is now PRODUCTION's question — a component-level PM needs run-hours of its parent Equipment unit; (b) which states count as run-hours (`running` only, or `running` + `setup`?); (c) a Maintenance-licensed tenant without Production has no log — `usage` unavailable there? (M-00 MNT-Q1) | (a) `production-domain`; (b) Operations; (c) Product Owner |
| WM-4 | Is a `PM_PROCEDURE` ever versioned the way `ROUTING`/`BOM` need a release-time lock (W-8, FOUNDATION)? A PM work order started mid-procedure-change could face the same "instructions changed under me" problem `WORK_ORDER` already solves for production | Product Owner |
| WM-5 | Is `PM_PROCEDURE.procedure_code` unique — per tenant, among all rows or only rows with `valid_to` null? Not stated, so not in the Keys line | Product Owner |
| WM-6 | Is `PM_PROCEDURE_STEP.step_number` unique within one `pm_procedure_id` (among rows with `valid_to` null)? Not stated, so not in the Keys line | Product Owner |
