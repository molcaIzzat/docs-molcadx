# M-01 — Asset History (`AST`)

> 🟡 DRAFT. Moved out of FOUNDATION ([`04-asset-ontology.md`](../../FOUNDATION/DOCS-EN/04-asset-ontology.md)
> §9.5) on 2026-09-10 — see [decision](../../../LOGS/decisions/2026-09-10-mom-domain-alignment.md).
> §9.1 is unchanged from the FOUNDATION original except for cross-references. §9.2 (lifecycle
> status history, declared only) added 2026-09-28.

## What this module owns

Two histories of a FOUNDATION `ASSET`:

1. **Component installation/swap history** — `ASSET_COMPONENT_LINK` (§9.1), modelled.
2. **Lifecycle status history** — declared 2026-09-28 ([decision 2026-09-28](../../../LOGS/decisions/2026-09-28-asset-status-ownership.md)), entity **not modelled yet**
   (§9.2).

### Component installation/swap history

The installation/swap history of a **component** — a Subunit, Maintainable item, or Part
(one of ISO 14224's four nesting layers) — against its parent asset. This is the same
"history belongs to the position, not the thing" pattern FOUNDATION already uses for
`ASSET_PLACEMENT` (machine-to-work-unit), one level deeper: component-to-parent-asset.

Module code: **`AST`**, shared with FOUNDATION's Equipment Taxonomy module by the same
convention already used for `SHF` (shared between FOUNDATION Shift and PRODUCTION Shopfloor)
— disambiguated by domain prefix in story IDs (`US-FND-AST-*` vs `US-MNT-AST-*`), never by a
new code.

## Why it's separate from FOUNDATION

- **Moving a machine is new history, not an overwrite** (FOUNDATION's `ASSET_PLACEMENT`).
  **Swapping a component is new history too, not an overwrite: same rule, one level deeper.**
  When a bearing (Part) gets replaced, `ASSET.parent_asset_id` only ever points at whoever's
  installed *right now* — that pointer is FOUNDATION's, current-state only. The full swap
  history, including cases where the replacement is a genuinely different Type and not just a
  new serial of the same one, lives here in `ASSET_COMPONENT_LINK`.
- **A component doesn't get its own site.** Following ISO 14224's naming, a Subunit,
  Maintainable item, or Part (nested under a parent Equipment unit) inherits its parent's site
  and has no separate `WORK_UNIT` placement of its own (FOUNDATION, §9.5/§9.6). What it *does*
  have is its own installation history, tracked here.
- This exists because Maintenance needs "what was installed here, and when" as raw material
  for future failure-analysis metrics (MTBF/MTTF) — none of which can be built retroactively
  once history has already been lost.

## 9. Entity specification

### 9.1 `ASSET_COMPONENT_LINK` — installation history of a component against its parent

| Field | Type | Required | Notes |
|---|---|---|---|
| `asset_component_link_id` | internal ID | Yes | Permanent, never reused |
| `child_asset_id` | FK → FOUNDATION `ASSET` | Yes | The component (Subunit/Maintainable item/Part) installed |
| `parent_asset_id` | FK → FOUNDATION `ASSET` | Yes | The physical parent this component is installed in |
| `valid_from`, `valid_to` | date | Yes | `valid_to` null = still installed now |

**Keys** ([F-00 keys rule](../../FOUNDATION/DOCS-EN/00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `asset_component_link_id` · Unique: — · No overlap: — (whether a component can be installed in only one parent at a time is open question AH-1)

Replacing a component, whether same Type/new serial, or a genuinely different Type, always
closes the old row (`valid_to`) and opens a new one, never overwrites. Because `child_asset_id`
points at a FOUNDATION `ASSET` that already carries its own `asset_type_id` and
`serial_number`, both replacement cases are captured automatically with no extra field needed.

**Constraints inherited from FOUNDATION, not redefined here:**
- Depth is locked at 4 layers (Equipment unit → Subunit → Maintainable item → Part). A
  `Part`-level `ASSET` (`component_level = part`, FOUNDATION §9.4) must never be a parent —
  ISO 14224 defines nothing past it.
- Exact validation semantics — whether `ASSET.component_level` must always agree with the
  depth implied by `parent_asset_id`, or the two can drift — are `TBD`, tracked as FOUNDATION
  open question `UX-AST-4` ([`FOUNDATION/UX/04-asset.md`](../../FOUNDATION/UX/04-asset.md)).
  This module's screen (`SCR-MNT-AST-001`) assumes the filter-out behavior pending that answer.
- Only components (`parent_asset_id` not null on the child) get an `ASSET_COMPONENT_LINK` row;
  Equipment-unit-to-`WORK_UNIT` placement stays exclusively on FOUNDATION's `ASSET_PLACEMENT`
  — the two histories are never merged.
- This module does **not** write `ASSET.parent_asset_id` itself. Whether/how FOUNDATION's
  current-parent pointer is kept consistent with the latest `ASSET_COMPONENT_LINK` row is
  `TBD — needs foundation-domain confirmation`.

### 9.2 Lifecycle status history — declared, entity `TBD`

> Added 2026-09-28 by [decision 2026-09-28](../../../LOGS/decisions/2026-09-28-asset-status-ownership.md) (decision 2). Not modelled: no entity
> name, no fields. Nothing below may be built on until the open questions LH-1…LH-5 are answered.

Same split as the component swap, applied to lifecycle status:

| | Component swap (2026-09-10) | Lifecycle status (2026-09-28) |
|---|---|---|
| **FOUNDATION keeps** | `ASSET.parent_asset_id` — current parent | `ASSET.lifecycle_status` — current value only ([F-04](../../FOUNDATION/DOCS-EN/04-asset-ontology.md)). The placement rule ("only `operational` machines occupy a station") reads it, so it must work without a Maintenance licence |
| **MAINTENANCE owns** | `ASSET_COMPONENT_LINK` — swap history (§9.1) | Lifecycle history (every past value, when it changed) and maintenance-driven transitions (e.g. into and out of `under_maintenance`) — **entity `TBD`** |

What is already fixed:

- MAINTENANCE reads `ASSET.lifecycle_status`; it never redefines the field or its allowed values.
  The value list stays FOUNDATION's.
- History is never overwritten or hard-deleted, same rule as §9.1.

**Open questions (`TBD — needs PO/ops confirmation`):**

| # | Question | Who needs to answer it |
|---|---|---|
| LH-1 | Is FOUNDATION's audit trail (`AUDIT_LOG`, [F-14](../../FOUNDATION/DOCS-EN/14-audit-trail.md)) enough as lifecycle history (it already records before → after, who, when, reason on every `ASSET` change)? Or does MAINTENANCE need its own event entity — e.g. to link a transition to a future maintenance work order, carry a maintenance reason code, or feed MTBF/MTTR without querying the audit log? | Product Owner, with `foundation-domain` (audit-log fitness) |
| LH-2 | Who sets `under_maintenance` before maintenance work orders exist (`03-work-order.md` not modelled)? A technician by hand on the asset, a supervisor, or nobody until work orders ship? | Operations / Product Owner |
| LH-3 | Once work orders exist, does opening/closing a maintenance work order change `ASSET.lifecycle_status` automatically? If yes, MAINTENANCE writes a FOUNDATION field — how is that write granted (FOUNDATION API, event, or FOUNDATION-owned action MAINTENANCE calls)? | `foundation-domain` via Product Owner |
| LH-4 | Which transitions are "maintenance-driven" (MAINTENANCE) vs "asset-management" (FOUNDATION: e.g. commissioning, decommissioning)? The decision names only `under_maintenance` as an example | Product Owner |
| LH-5 | On a tenant **without** a Maintenance licence, is lifecycle history still kept (only in `AUDIT_LOG`), and does it become visible if Maintenance is licensed later? | Product Owner / `platform-domain` |

## Authorization

| Module | Entity | Scope level(s) | Applicable actions | Example permission string |
|---|---|---|---|---|
| AST | `ASSET_COMPONENT_LINK` | `work_unit` — inherited via `parent_asset_id` walked up to the top-level Equipment unit's current `ASSET_PLACEMENT.work_unit_id` (FOUNDATION §9.5/§9.6) | `view`, `create`, `deactivate` (closes old row on replacement). `update` — `TBD`: only close-and-reopen (versioning) is specified, not an in-place edit action | `maintenance:ast:work_unit:create` |
| AST | Lifecycle status history (§9.2) | `TBD` — entity not modelled | `TBD` | `TBD` |

## Related modules

| Module | Relationship |
|---|---|
| [FOUNDATION — Equipment Taxonomy](../../FOUNDATION/DOCS-EN/04-asset-ontology.md) | Supplies `ASSET`, `ASSET.component_level`, `ASSET_PLACEMENT`, `ASSET.lifecycle_status` (current value); this module reads them, redefines none |
| [FOUNDATION — Audit Trail](../../FOUNDATION/DOCS-EN/14-audit-trail.md) | Candidate store for lifecycle history — whether it is enough is LH-1 |

## What's still unknown

| Question | Who needs to answer it |
|---|---|
| Exact `component_level` validation semantics against the `parent_asset_id` chain (`UX-AST-4`) | `foundation-domain` |
| Whether/how `ASSET.parent_asset_id` is kept consistent with the latest `ASSET_COMPONENT_LINK` row | `foundation-domain` |
| `update` action semantics for an in-place edit of an existing row | `maintenance-domain` (this module) |
| Lifecycle status history — LH-1…LH-5 (§9.2) | See §9.2 |
| **AH-1** — `ASSET_COMPONENT_LINK`: is a component installed in at most one parent at any time (No overlap on `child_asset_id` over `valid_from`/`valid_to`)? And can a parent hold more than one component in the same slot at once — or is there no slot concept? Not stated, so not in the Keys line | `maintenance-domain` with Operations, via Product Owner |
