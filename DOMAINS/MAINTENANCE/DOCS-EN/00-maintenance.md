# M-00 — MAINTENANCE domain map

> 🟡 DRAFT.

## What this domain is

MAINTENANCE is one of the four Manufacturing Operations Management (MOM) domains defined by
**IEC 62264 / ISA-95** (Production, Quality, Maintenance, Inventory), sitting on top of the
shared object model that FOUNDATION provides (equipment, material, personnel definitions).
FOUNDATION answers "what is this asset, and where does it sit right now." MAINTENANCE answers
"what happened to this asset, and when" — the transactional/event side of asset management.

This split is not incidental — it is the same dividing rule already applied once before, when
`WORK_ORDER`/`WORK_ORDER_OPERATION` moved from FOUNDATION to PRODUCTION
([decision 2026-09-03](../../../LOGS/decisions/2026-09-03-foundation-contest-blockers.md)), and
formalized as a general rule in [decision 2026-09-10](../../../LOGS/decisions/2026-09-10-mom-domain-alignment.md):

> Definition/taxonomy/current structure ("what X is," "where X sits now") → **FOUNDATION**.
> Transactional/event instances ("X happened at time Y," a history of events, a work record)
> → **the owning MOM domain** (Production/Quality/Maintenance/Inventory).

## Why it exists

Component-level history — which bearing, sensor, or maintainable item is installed under a
machine, and the full trail of what was installed there before — was drafted inside
FOUNDATION's Equipment Taxonomy module (F-04 §9.5, `ASSET_COMPONENT_LINK`) before this domain
existed, with F-04's own text already flagging it as "raw material for a future Maintenance
domain," not FOUNDATION's own concern. On 2026-09-10, that content moved here.

## Relationship to FOUNDATION

MAINTENANCE **reads** FOUNDATION entities, it never redefines them:

- `ASSET` — the physical unit a maintenance record is about.
- `ASSET.component_level` — which of the 4 ISO 14224 layers (Equipment unit / Subunit /
  Maintainable item / Part) an asset sits at; governs whether it can carry an
  `ASSET_COMPONENT_LINK` history.
- `ASSET_PLACEMENT` — an asset's current work-unit location, used to resolve access scope for
  maintenance records (walked via `parent_asset_id` for component-level assets, same as
  FOUNDATION does internally).
- `ASSET.parent_asset_id` — current parent only, not history. MAINTENANCE owns the history;
  FOUNDATION owns the current pointer.
- `ASSET.lifecycle_status` — current value only. Same split as `parent_asset_id`: FOUNDATION
  keeps the current value (placement reads it, so it works without a Maintenance licence);
  MAINTENANCE owns lifecycle history and maintenance-driven transitions such as
  `under_maintenance` — entity not modelled yet, see [M-01 §9.2](01-asset-history.md#92-lifecycle-status-history--declared-entity-tbd)
  ([decision 2026-09-28](../../../LOGS/decisions/2026-09-28-asset-status-ownership.md)).

## Relationship to PRODUCTION

- `ASSET_STATE_LOG` (running / idle / down / setup, minute by minute) is **owned by PRODUCTION**
  ([decision 2026-09-28](../../../LOGS/decisions/2026-09-28-asset-status-ownership.md), decision 1 — resolves the old ownership blocker B5).
  PRODUCTION writes it; MAINTENANCE **reads** it for MTBF / MTTR / MTTF and for usage-based PM
  intervals ([M-02](02-work-master.md), WM-3), and **never writes it**.
- A tenant licensed for Maintenance but not Production has no state log. `TBD` — see question
  below; the decision parks it until a real customer needs it.

MAINTENANCE does not have its own site hierarchy, its own asset registry, or its own taxonomy
— all of that stays FOUNDATION's, referenced by FK only.

## Standards this domain draws on

| Standard | Relevance |
|---|---|
| **IEC 62264 / ISA-95** | Defines Maintenance as one of the four MOM operations domains |
| **ISO 14224** | Equipment taxonomy and reliability data for process industries — Equipment unit/Subunit/Maintainable item/Part nesting (inherited from FOUNDATION), and the source for future failure-mode/reliability metrics (MTBF/MTTR/MTTF) |
| **ISO 55000** | Organization-level asset management, lifecycle context |

## Modules

| Module | Entity | Status |
|---|---|---|
| [Asset History](01-asset-history.md) | `ASSET_COMPONENT_LINK`; lifecycle status history (entity `TBD`) | 🟡 DRAFT — component history moved from FOUNDATION 2026-09-10; lifecycle history declared 2026-09-28, not modelled |
| [Work Master](02-work-master.md) | `PM_PROCEDURE`/`PM_PROCEDURE_STEP` | 🟠 CONCEPT — PM checklist template per asset type, added 2026-09-12 |
| Work Order (planned) | `TBD` | Not modeled — dispatches Work Master (above) against a real `ASSET`; see `03-work-order.md` in `AGENTS.md` §2 |
| Reliability (planned) | `TBD` (MTBF/MTTR/MTTF) | Not modeled — waits on real failure/repair data being captured somewhere first. Uptime/downtime input comes from PRODUCTION's `ASSET_STATE_LOG` (read-only) |

## What's still unknown (needs PO/ops input, not guesswork)

| Question | Who needs to answer it |
|---|---|
| Does Molca track maintenance work orders (PM/CM) at all today, on paper or otherwise? What does that process look like? | Operations |
| Is a maintenance record ever entered by the same person who registers the asset in FOUNDATION, or always a separate maintenance/technician role? | Operations |
| MNT-Q1: A tenant licensed for Maintenance but not Production has no `ASSET_STATE_LOG`. Are MTBF/MTTR/MTTF and usage-based PM intervals simply unavailable there, or does Maintenance need another uptime source (manual entry, its own tag read)? Parked by decision 2026-09-28 until a real customer needs it | Product Owner |
| Lifecycle status history open questions LH-1…LH-5 ([M-01 §9.2](01-asset-history.md#92-lifecycle-status-history--declared-entity-tbd)) | Product Owner / `foundation-domain` / Operations |
| When should Work Order (maintenance) and Reliability modules actually get modeled — is there a Q3/Q4 goal driving this, or is Asset History the only immediate need? | Product Owner |
