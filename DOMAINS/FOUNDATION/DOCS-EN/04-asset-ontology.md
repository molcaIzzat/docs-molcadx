# F-04 — Equipment Taxonomy

> Concepts + entity specification (§9). Working spec. Entity spec status: 🟡 DRAFT.

**In short:** Equipment Taxonomy depends on Site Hierarchy, not the other way around. An
asset can't be placed (`ASSET_PLACEMENT`) until the `WORK_UNIT` it attaches to already
exists (§9.6). Shopfloor depends on this module for `ASSET`, its classification, and
placement. The `DOWNTIME_REASON`/`REJECT_REASON` taxonomies it also needs live in
[Reference & Master Data](05-reference-master-data.md), not here. The operational-state log
(`ASSET_STATE_LOG`) is owned by PRODUCTION ([PRODUCTION Monitoring](../../PRODUCTION/DOCS/02-monitoring.md), [decision 2026-09-28](../../../LOGS/decisions/2026-09-28-asset-status-ownership.md)), outside this module's scope. Its one make-or-break rule: keep
**position** (a station on a line) and **machine** (the physical unit sitting there) as two
separate records, never one.

## What this module is for

It answers one question, consistently, for every physical thing in the factory
(machines, parts, gauges): **"What is this, what kind, part of what, and what
state is it in right now?"**

It's not just a list of machines. A list only stores names. This module also
stores how things relate: their category, their location, and their history.

## Why it matters: what goes wrong without it

| If you skip this | What happens |
|---|---|
| Everyone names machines their own way | "Mesin 3", "IM-03", and "Injection 3" get counted as three different machines in reports |
| Downtime is logged under free-text names | You can't total downtime by machine type, so root-cause analysis becomes impossible |
| A machine moves between lines with no record | Last month's line performance gets silently rewritten |
| Parts aren't linked to their parent machine | You never notice "this bearing model keeps failing across machines" |

## Three things to understand before anything else

**1. Three levels of detail.** Think of it like a product catalog:
- **Class** = the family ("Production Machine")
- **Type** = the model ("Injection Molding 250T, Brand X")
- **Instance** = the actual physical unit ("Machine IM-03, serial #88231")

This means you describe shared specs once (at Type level) instead of repeating them for every machine.

**2. A "position" is not the same as a "machine."** This is the idea most
often gotten wrong, and it's expensive to fix later.
- **Position** ("press station #2 on Line A") stays the same even when the
  machine there gets swapped out.
- **Machine** (the physical unit) has a serial number and can be moved, sold,
  or scrapped.

Line-performance history belongs to the *position*. Maintenance history
belongs to the *machine*. Merge them into one record and one of those two
histories breaks the moment a machine gets replaced.

**3. Two different kinds of "status."** Don't mix them:

| | Changes how often | Used for | Owner |
|---|---|---|---|
| **Lifecycle status** (planned → installed → running → decommissioned) | Monthly/yearly | Asset management | Current value: FOUNDATION. History and maintenance-driven changes: MAINTENANCE |
| **Operational state** (running/idle/down/setup) | Minute to minute | Uptime %, downtime tracking | PRODUCTION (MAINTENANCE reads) |

Owners per [decision 2026-09-28](../../../LOGS/decisions/2026-09-28-asset-status-ownership.md).

Mixing these is a classic mistake: operational state changes hundreds of
times a month and would flood the lifecycle history.

## How the entities connect

The rules above describe each piece on its own. Here's how they link up, in
one picture:

```
ASSET_CLASS
  → ASSET_TYPE                         [§9.1, §9.3]
    → ASSET (instance)                 [§9.1, §9.4]
      → ASSET.parent_asset_id → ASSET  [§9.4, §9.5]  (ISO 14224 component
          nesting: Equipment unit → Subunit → Maintainable item → Part, tracked per-row via
          ASSET.component_level. Part is the LAST level, a hard rule, not a guideline. ISO
          14224 defines nothing below it, so a Part-level ASSET must not have its own
          parent_asset_id children. This field holds the CURRENT parent only; see
          ASSET_COMPONENT_LINK below for history)
        → ASSET_COMPONENT_LINK          [§9.5]  (component swap history:
            child_asset_id/parent_asset_id/valid_from/valid_to, same pattern as
            ASSET_PLACEMENT below, one level deeper. Feeds the future Maintenance domain)
      → ASSET_PLACEMENT                [§9.6]  (asset_id MUST be an Equipment unit,
          parent_asset_id IS NULL. Subunit/Maintainable item/Part are NEVER placed directly;
          they inherit their site from the Equipment unit they're nested under)
        → WORK_UNIT                    [§9.4, §9.6]  (functional location. Max 1 active
          `primary` placement per WORK_UNIT, plus any number of active `secondary`
          placements: dedicated auxiliary equipment with no Availability of its own)
      → ASSET.lifecycle_status         [§9.4]  (planned → installed → operational → under_maintenance → idle → decommissioned.
          CURRENT value only, kept here; ASSET_PLACEMENT reads it. History + maintenance-driven
          transitions → MAINTENANCE, entity TBD)
      → ASSET_STATE_LOG                [PRODUCTION, not here]  (operational state, minute to minute.
          PRODUCTION writes it, MAINTENANCE reads it. 2026-09-28)
      → DOWNTIME_REASON / REJECT_REASON  [Reference & Master Data (05-reference-master-data.md)
          §9.1–§9.2]  (cause taxonomies, via DOWNTIME_REASON_ASSET / REJECT_REASON_ASSET
          joins, owned there, not this module. Consumed by PRODUCTION's operational-state log
          (ASSET_STATE_LOG) and defect recording, both entirely outside this module. Foundation's boundary ends
          here)
```

A few things the picture can't say on its own:

- **Class → Type → Instance is a catalog level, not a sequence of steps.**
  Nothing "moves" from Class to Type to Instance. An Instance simply belongs
  to a Type, which belongs to a Class, the same way a specific book belongs to
  a title, which belongs to a genre.
- **Lifecycle status and operational state hang off the same asset but stay
  apart on purpose.** If they were merged, the fast-changing operational data
  (which updates minute to minute) would flood the slow-changing
  asset-management record. They also have different owners
  ([decision 2026-09-28](../../../LOGS/decisions/2026-09-28-asset-status-ownership.md)): this module keeps only the **current**
  `ASSET.lifecycle_status` (the placement rule reads it, so it must work without a
  Maintenance licence); lifecycle **history** and maintenance-driven transitions (e.g.
  `under_maintenance`) belong to **MAINTENANCE** (entity `TBD`, not modelled yet) — same split
  as `parent_asset_id` vs `ASSET_COMPONENT_LINK` below. The operational-state log,
  `ASSET_STATE_LOG`, is owned by **PRODUCTION** ([PRODUCTION Monitoring](../../PRODUCTION/DOCS/02-monitoring.md)); MAINTENANCE
  reads it for MTBF/MTTR/MTTF and never writes it.
- **Moving a machine is new history, not an overwrite.** A change in position
  creates a new `ASSET_PLACEMENT` entry; the old one stays on record. That way
  last month's line performance doesn't silently change.
- **Swapping a component is new history too, not an overwrite: same rule, one
  level deeper.** When a bearing (Part) gets replaced, `parent_asset_id` on
  `ASSET` only ever points at whoever's installed *right now* — this module
  keeps only that current pointer. The full swap history, including cases
  where the replacement is a genuinely different Type and not just a new
  serial of the same one, is owned by the **Maintenance** domain's
  `ASSET_COMPONENT_LINK` (moved out of this module 2026-09-10, see
  [decision](../../../LOGS/decisions/2026-09-10-mom-domain-alignment.md) and
  [MAINTENANCE/DOCS-EN/01-asset-history.md](../../MAINTENANCE/DOCS-EN/01-asset-history.md)) —
  same reasoning that produced `ASSET_PLACEMENT` for machine-to-position, but
  this module only keeps the *current* state, not the trail.
- **A component doesn't get its own site.** Following ISO 14224's naming, a
  Subunit, Maintainable item, or Part (nested under a parent Equipment unit)
  inherits its parent's site and has no separate `WORK_UNIT` placement of its
  own. Its installation *history* lives in Maintenance's `ASSET_COMPONENT_LINK`,
  not here.
- **`DOWNTIME_REASON` is only required for "down_" states** (`down_unplanned` or
  `down_planned`) in PRODUCTION's operational log (`ASSET_STATE_LOG`), and this one taxonomy is
  what OEE's Availability number depends on. Get this wrong and downtime
  analysis breaks, even though Foundation only owns the taxonomy (now in
  [Reference & Master Data](05-reference-master-data.md)), not the log.
  `REJECT_REASON` plays the equivalent role for defect/reject recording instead.

## Other rules worth knowing

- Machines can nest inside each other, following ISO 14224's naming:
  **Equipment unit → Subunit → Maintainable item → Part**. **Part is a hard
  stop, not a soft cap.** ISO 14224 defines nothing past it, so a Part-level
  asset must never be given its own child. `ASSET.component_level` (§9.4)
  records which of the 4 levels a given asset sits at, so this is now
  enforceable. The exact validation semantics are still `TBD`, see §9.5.
- Never delete an asset once it's been scrapped. Deactivate it instead, so
  historical data doesn't lose its parent record.
- Never let "reason for downtime" be free text. This is *the* number one
  cause of downtime analysis being useless.

## Standards this module draws on

| Standard | Relevance |
|---|---|
| **IEC 62264 / ISA-95** | Equipment hierarchy model and *equipment class* definition |
| **ISO 14224** | Equipment taxonomy and reliability data for process industries, source of the Equipment unit/Subunit/Maintainable item/Part nesting and failure-code taxonomy |
| **ISO 55000** | Organization-level asset management, lifecycle context |

## Related modules

| Module | Relationship |
|---|---|
| [Site Hierarchy](01-site-hierarchy.md) | Assets occupy a *work unit*; the location hierarchy is the container |
| [Reference & Master Data](05-reference-master-data.md) | Owns `DOWNTIME_REASON`/`REJECT_REASON` and their asset-scoped join tables. `asset_id` on both join tables FKs back into this module's `ASSET` |
| [Work Master](08-work-master.md) | Operations run at a work center; assets are what execute them |
| [Shift](02-shift.md) | Asset status is always recorded in shift context |
| [PRODUCTION Monitoring](../../PRODUCTION/DOCS/02-monitoring.md) | **Owns `ASSET_STATE_LOG`** ([spec](../../PRODUCTION/DOCS/02-monitoring.md#asset_state_log--operational-state-per-asset-over-time)) (operational state, [decision 2026-09-28](../../../LOGS/decisions/2026-09-28-asset-status-ownership.md)). Uses `ASSET`, `ASSET_PLACEMENT`, `ASSET_TAGS`, `DOWNTIME_REASON`, and `REJECT_REASON` when recording downtime/defect. Its operational recording is outside this module's scope |
| [Data Source](13-data-source.md) | `ASSET_TAGS.data_source_id` (§9.7) FKs into `DATA_SOURCE` — which PLC/OPC UA server/MQTT broker a tag is read from. New module, split out of Integration 2026-09-03 (B7) |
| [Integration](11-integration.md) | System-to-system integration (ERP) only, since B7 — sensor/IoT connections moved to [Data Source](13-data-source.md) |
| [Product](06-product.md) | `ASSET_PRODUCT_CODES.product_id` (§9.7) FKs into `PRODUCT`. Resolves a raw product-code tag value to the product actually running |
| [Maintenance](../../MAINTENANCE/DOCS-EN/00-maintenance.md) | Owns `ASSET_COMPONENT_LINK` (moved out of this module 2026-09-10) — component-swap history, raw material for MTBF/MTTR/MTTF, not Availability. Also owns lifecycle-status **history** and maintenance-driven transitions (entity `TBD`, [decision 2026-09-28](../../../LOGS/decisions/2026-09-28-asset-status-ownership.md)). Reads PRODUCTION's `ASSET_STATE_LOG` for MTBF/MTTR/MTTF, never writes it. Reads this module's `ASSET`, `ASSET.component_level`, `ASSET_PLACEMENT`; redefines none of them |

## What's still unknown (needs factory input, not guesswork)

| Question | Who needs to answer it |
|---|---|
| What are the real machine classes/types at Molca (across all 4 component levels, not just top-level machines)? Doesn't block registering an asset. `asset_type_id` is nullable, see §9.4. | Operations |
| What's the current list of downtime reason codes? (Moved to [Reference & Master Data](05-reference-master-data.md) T-1; kept here only as a pointer.) | Operations |
| ~~Is machine status read automatically from PLC, or logged by hand?~~ **Resolved: both, and the storage boundary stays as already documented.** A tag with `tag_role = downtime_reason` (see the tag-mapping note below) lets status be read automatically, but the reading itself is never stored on the tag-definition table. It goes to `ASSET_STATE_LOG`, owned by PRODUCTION ([decision 2026-09-28](../../../LOGS/decisions/2026-09-28-asset-status-ownership.md)), same boundary this module already draws everywhere else (see [Reference & Master Data](05-reference-master-data.md)). | — |
| ~~Do machines have scannable tags (QR/barcode)?~~ **Resolved: this was already answered by the existing schema, not a gap.** `asset_tag` (§9.4, required) *is* the scannable QR/barcode field: "the code on the machine body, what an operator reads/scans." It's a separate field from `serial_number` (optional, manufacturer-issued). Don't conflate the two. | — |
| **Asset's declared tag mapping** (`ASSET_TAGS`): which PLC/sensor tag addresses (e.g. `PLC1.DB10.DBW4`) belong to which `ASSET`, and what signal each one is. **Since 2026-09-25, for OPC UA sources the address is generated from the asset's placement, not typed** (§9.7.1). Splits *data shape* (`kind`: cumulative_counter/delta_counter/value/boolean/enum) from *business meaning* (`tag_role`: product_code/total/good/reject/machine_state/downtime_reason/reject_reason/speed/runtime), a cleaner split than one enum doing both jobs. An asset's tags can't be acquired (by Telegraf or any collector) until that asset has an active `ASSET_PLACEMENT` (a `WORK_UNIT`); declaration can happen before placement, acquisition cannot. **Now specified, see §9.7.** `asset_id` is Equipment-unit-level only, same restriction as `ASSET_PLACEMENT`, **resolved as A-6a.** A `(asset_id, raw_value)` uniqueness constraint on `ASSET_PRODUCT_CODES` (one active product per raw code, per asset) is also **resolved as A-6b.** **A-6c (heartbeat/staleness granularity) reopened 2026-09-03 (decision B7)** — earlier text here claimed "resolved: connection-level, not per-tag," but that granularity choice was never actually specified anywhere, only asserted. `DATA_SOURCE` now has its own module, [Data Source](13-data-source.md), and the granularity question lives there as an explicit open item, not decided here or assumed. `data_source_id` on `ASSET_TAGS` (§9.7) now FKs into that module's `DATA_SOURCE` entity. | Engineering + `production-domain` (Integration) |
| ~~Should downtime be logged per-machine or per-line? **Reopened 2026-09-03 (decision B5, = A-5 below).**~~ **Ownership resolved 2026-09-28 ([decision 2026-09-28](../../../LOGS/decisions/2026-09-28-asset-status-ownership.md)): `ASSET_STATE_LOG` owner = PRODUCTION.** The recording-level question itself (per asset vs per work unit) **moved to PRODUCTION as SL-1** ([PRODUCTION Monitoring](../../PRODUCTION/DOCS/02-monitoring.md#asset_state_log--operational-state-per-asset-over-time)) — resolved there 2026-09-29: per asset, both FKs required. See A-5 in §9.8. | — (moved to `production-domain`) |
| ~~Does `ASSET` need a real name/nickname field, or does the shipped Asset Registry's derived display name (`ASSET_TYPE.type_name`, fallback `asset_tag`) stay the answer?~~ **Resolved 2026-09-21 (PO): yes** — `asset_name` added, §9.4. Optional, free text, falls back to the derived name (`ASSET_TYPE.type_name` → `asset_tag`) when unset, so existing assets with no name keep working exactly as they do today. | — |

## 9. Entity specification

> 🟡 DRAFT.

### 9.1 Three layers: Class → Type → Instance

| Layer | Entity | Example | Purpose |
|---|---|---|---|
| **Class** | `ASSET_CLASS` | Production Machine, Utility, Measuring Instrument, Vehicle | Top-level taxonomy, purely organizational. Groups assets for reporting/filtering. Carries no attribute values of its own (see §9.2) |
| **Type** | `ASSET_TYPE` | Injection Molding 250T, Air Compressor 75kW | Model/spec; **this is where shared technical attribute values actually live** (§9.3). Every instance of this Type inherits them, rather than repeating them per machine |
| **Instance** | `ASSET` | Machine IM-03, serial #X | The actual physical unit (§9.4) |

`ASSET_CLASS` may nest (`parent_class_id`) so the taxonomy can be refined without splitting entities.

### 9.2 `ASSET_CLASS` — top-level taxonomy

| Field | Type | Required | Notes |
|---|---|---|---|
| `asset_class_id` | internal ID | Yes | Permanent, never reused |
| `code` | string | Yes | Business code, see [`00-foundation.md`](00-foundation.md)'s ID/code rules |
| `name` | string | Yes | e.g. "Production Machine", "Utility", see A-1 for real values |
| `parent_class_id` | FK → `ASSET_CLASS` | No | Self-nesting, so the taxonomy can be refined without splitting entities (§9.1) |
| `valid_from`, `valid_to` | date | Yes | |

**Keys** (F-00 [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `asset_class_id` · Unique: — (`code`: A-17) · No overlap: —

**Deliberately no attribute-value field here.** `ASSET_CLASS` is purely organizational. It
groups assets for reporting/filtering (e.g. "show me all Utility assets"), and nothing in
this module's design currently makes system behavior (OEE calculation, tag roles,
reason-code scoping) depend on which class an asset belongs to. If a future need for
class-level behavior shows up (e.g. auto-excluding a class from Availability), that would be
a new, explicit rule wired in the consuming module (e.g. `oee-monitoring.md`), not something
`ASSET_CLASS` grants automatically today.

### 9.3 `ASSET_TYPE` — model/spec, shared technical attributes

| Field | Type | Required | Notes |
|---|---|---|---|
| `asset_type_id` | internal ID | Yes | Permanent, never reused |
| `asset_class_id` | FK → `ASSET_CLASS` | Yes | Which class this Type belongs to |
| `code` | string | Yes | Business code |
| `name` | string | Yes | e.g. "Injection Molding 250T" |
| `manufacturer`, `model` | string | No | The nameplate manufacturer/model for this Type. This is the only place it's recorded. `ASSET` (§9.4) has no instance-level `manufacturer`/`model` of its own; every `ASSET` reads it from its Type, same as `attributes` |
| `attributes` | key-value | No | **The actual shared technical spec values** for this Type, e.g. `clamping_force_tons: 250`, `voltage: 380`. Every `ASSET` of this Type inherits these; they are not supposed to be re-entered per instance |
| `valid_from`, `valid_to` | date | Yes | |

**Keys** (F-00 [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `asset_type_id` · Unique: — (`code`: A-17) · No overlap: —

**`ASSET_TYPE.attributes` is the single shared source for a Type's spec values.** Every
`ASSET` instance of a given Type reads from here rather than storing its own copy. Two
machines of the same "Injection Molding 250T" always agree on `clamping_force_tons`, for
example, because neither one owns that value independently. `ASSET.attributes` (§9.4) exists
only for genuine per-instance *exceptions*; see its note there.

### 9.4 `ASSET` — core attributes

| Field | Type | Required | Notes |
|---|---|---|---|
| `asset_id` | internal ID | Yes | Permanent, never reused |
| `asset_tag` | string | Yes | The code on the machine body, what an operator reads/scans. Unique within site |
| `asset_name` | string | No | **Added 2026-09-21, resolving `UX/04-asset.md` UX-AST-6.** A human-friendly per-instance label ("Packer 3", "West Line Filler"), free text, no uniqueness constraint. Screens display `asset_name` when set; fall back to `ASSET_TYPE.type_name`, then `asset_tag`, when it isn't (same fallback chain the Asset Registry already used before this field existed). Deliberately optional and separate from `asset_tag` — the tag is the scannable identifier (§"What's still unknown" above), this is a label a human chose, and two identical `ASSET_TYPE`s no longer have to show the same name |
| `asset_type_id` | FK | No | Nullable, an asset can be registered before its Class/Type is known and classified later. Until classified, it has none of Type's shared attributes, including `manufacturer`/`model`, see "What's still unknown" |
| `serial_number` | string | No | From the manufacturer |
| `site_id` | derived, read-only | No | **Not a writable field — resolved B6, 2026-09-03.** Never set or updated directly. Derived from the asset's current `ASSET_PLACEMENT` row (the one with `valid_to IS NULL`, §9.6): `site_id` of the `WORK_UNIT` that placement points at. A multi-lane machine has several such rows, all in one site by rule (§9.6, 2026-09-25), so the value stays single. If the asset has no active `ASSET_PLACEMENT` (not yet installed, or an Equipment-unit-level asset that was deactivated from its last placement), it has **no current site** — display as "unplaced," not a stale value from a previous placement. **Component-level assets** (`parent_asset_id` not null) have no `ASSET_PLACEMENT` of their own (§9.5); their derived site is their top-level Equipment unit's current placement, walked via `parent_asset_id`. **Open (A-10):** how a genuinely brand-new asset that has never been placed gets recorded as "sitting at Site X's receiving dock" before its first `ASSET_PLACEMENT` exists — `TBD — needs PO/ops confirmation`: does registration require an immediate placement, or is there a legitimate "registered, not yet placed, but physically at a site" state this model needs to represent? |
| `work_unit_id` | *(removed — see B6)* | — | **Removed 2026-09-03 (decision B6).** This field used to duplicate what `ASSET_PLACEMENT` (§9.6) already tracks with full history, and the two disagreed about which one was authoritative — reviewers found ABAC scope checks reading this inline field while placement history moved on independently, which meant an asset's *access scope* and its *actual floor location* could silently diverge. `ASSET_PLACEMENT` (latest row, `valid_to IS NULL`) is now the **only** source of an asset's current functional position. Any code or screen that read `ASSET.work_unit_id` must read `ASSET_PLACEMENT` instead. |
| `parent_asset_id` | FK | No | For components, see §9.5. **Current parent only, not history** |
| `component_level` | enum | Yes | `equipment_unit` / `subunit` / `maintainable_item` / `part`, which of the 4 ISO 14224 layers this `ASSET` sits at (§9.5). Required so the "Part is a hard stop" rule can actually be validated at write time, instead of recomputing depth by walking `parent_asset_id` on every insert. **TBD:** exact application-level validation logic (e.g. does `component_level` have to match `parent_asset_id`'s chain, or can they drift?) is not yet decided |
| `lifecycle_status` | enum | Yes | `planned` / `installed` / `operational` / `under_maintenance` / `idle` / `decommissioned`. **Current value only** ([decision 2026-09-28](../../../LOGS/decisions/2026-09-28-asset-status-ownership.md)): this field stays here because `ASSET_PLACEMENT` (§9.6) reads it — only `operational` machines occupy a station — so it must work without a Maintenance licence. Lifecycle **history** and maintenance-driven transitions belong to MAINTENANCE (entity `TBD`, not modelled yet) |
| `commissioning_date` | date | No | Basis for asset-age calculation |
| `owner_org_unit_id` | FK | No | Responsible unit |
| `attributes` | key-value | No | **Instance-level exceptions only.** A value that deviates from what `ASSET_TYPE.attributes` (§9.3) declares for this asset's Type (e.g. this specific unit was recalibrated to a non-standard tolerance). Not where the shared spec itself lives; that's on the Type now. **TBD:** whether Molca actually needs instance-level overrides at all, or whether this field should be dropped once confirmed |
| `valid_from`, `valid_to` | date | Yes | |

**Keys** (F-00 [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `asset_id` · Unique: `asset_tag` within site (§9.4) — the site is derived from `ASSET_PLACEMENT`, not a stored column, so an application check, not a plain index (A-18) · No overlap: —

### 9.5 Component structure

- `ASSET` can be the parent of another `ASSET` (`parent_asset_id`), following **ISO 14224**:
  **Equipment unit** (top-level `ASSET`) → **Subunit** → **Maintainable item** → **Part**.
- **Depth is locked at 4 layers (Equipment unit → Subunit → Maintainable item → Part), not
  a recommendation, a requirement.** A `Part`-level `ASSET` must not be the parent
  (`parent_asset_id`) of another `ASSET`, because ISO 14224 defines nothing past it. This is
  now enforceable: `ASSET.component_level` (§9.4) records which of the 4 layers a given
  `ASSET` sits at, so the application can reject a `parent_asset_id` assignment where the
  would-be parent's `component_level = part` with a simple check; no recursive
  `parent_asset_id`-chain walk needed at write time. Exact validation semantics (whether
  `component_level` must always agree with the depth implied by `parent_asset_id`, or can be
  set independently) are still `TBD`, see §9.4.
- A component inherits `site_id` from its parent; a component does not occupy its own
  `WORK_UNIT`. **Only the top-level Equipment unit can ever have an `ASSET_PLACEMENT`**
  (hard rule, see §9.6).
- **`parent_asset_id` only stores the current parent**, same role as `work_unit_id` in §9.4,
  not history. Component-swap history (Part/Maintainable item/Subunit replaced, whether with
  the same Type or a different one) is **owned by the Maintenance domain's
  `ASSET_COMPONENT_LINK`**, not this module — moved out 2026-09-10, see
  [decision](../../../LOGS/decisions/2026-09-10-mom-domain-alignment.md).

**`ASSET_COMPONENT_LINK`** moved to the Maintenance domain 2026-09-10 — see
[`MAINTENANCE/DOCS-EN/01-asset-history.md`](../../MAINTENANCE/DOCS-EN/01-asset-history.md) for
its full entity specification. This module keeps only the current pointer
(`ASSET.parent_asset_id` above); the installation/swap trail is Maintenance's concern, not
FOUNDATION's.

### 9.6 Asset-to-work-unit placement rules

**`ASSET_PLACEMENT`** — field table added 2026-10-01 for the [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01), written from the rules below. No new business field.

| Field | Type | Required | Notes |
|---|---|---|---|
| `asset_placement_id` | internal ID | Yes | Permanent, never reused |
| `asset_id` | FK → `ASSET` (§9.4) | Yes | Equipment unit only (`parent_asset_id IS NULL`) — first rule below |
| `work_unit_id` | FK → `WORK_UNIT` ([Site Hierarchy §9.6](01-site-hierarchy.md)) | Yes | The station the asset stands on |
| `placement_role` | enum | Yes | `primary` / `secondary` — rules below |
| `valid_from`, `valid_to` | `TBD` — date or timestamp (A-19) | Yes | A move closes the old row and opens a new one. `valid_to` empty = the current placement (§9.4). **Half-open range (PO, 2026-10-02, prd-molcadx#24 item 21):** a row is active from `valid_from` up to, but not including, `valid_to`. When a new placement starts, the old row's `valid_to` = the new row's `valid_from` — not the day before |

**Keys** (F-00 [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `asset_placement_id` · Unique: — · No overlap: at most one active `primary` row per `work_unit_id`; at most one active row per (`work_unit_id`, `asset_id`), any role (rules below)

- **Only an `ASSET` at the Equipment unit layer (`parent_asset_id IS NULL`) may be placed
  into a `WORK_UNIT`.** `ASSET_PLACEMENT.asset_id` must reference an Equipment unit, never
  a Subunit, Maintainable item, or Part. This matches §9.5: components don't get their own
  `WORK_UNIT`, they inherit location from the Equipment unit they're nested under. This must
  be enforced in the application (e.g. check `parent_asset_id IS NULL` before creating an
  `ASSET_PLACEMENT`), not left as a documentation-only convention.
- **A `WORK_UNIT` has at most one active `primary` placement at a time, plus any number of
  active `secondary` placements.** `ASSET_PLACEMENT.placement_role` is `primary` or
  `secondary`:
  - **`primary`.** The asset that drives this work unit's Availability and is the
    downtime-detection reference (see [KPI inputs](07-1-kpi-tag-mapping.md#multiple-assets-under-one-work-unit--primary-vs-secondary)).
    Exactly one active `primary` row per `WORK_UNIT`; this is the original "at most one
    asset" rule, renamed, not loosened.
  - **`secondary`.** Dedicated auxiliary equipment permanently paired to the primary asset
    (e.g. an inline checkweigher wired to one specific packer) that has **no Availability of
    its own** and only contributes tags toward that work unit's Quality and/or
    downtime-reason enrichment. Any number of active `secondary` rows are allowed, but no two
    active placements (primary or secondary, on the same work unit) may reference the same
    asset at once.
  - **Resolved 2026-08-20**, after real PLC tag mapping showed a packer and its dedicated
    checkweigher grouped under one work unit's tag set, with the checkweigher having no
    downtime state of its own, see decision A-9 below.
  - **If an auxiliary machine ever needs its own tracked Availability/OEE, it does not belong
    here as `secondary`.** Give it its own `WORK_UNIT` (with its own `primary` placement) and
    connect the two work units with `WORK_UNIT_FLOW` (`work-unit-flow-draft.md`) instead.
    `secondary` is only for equipment with no independent uptime story.
- **One asset, one active placement — except a multi-lane machine (PO decision 2026-09-25,
  [decision](../../../LOGS/decisions/2026-09-25-generated-opcua-tag-nodes.md)).** The rule above
  only stopped the same asset appearing twice on the **same** work unit; nothing stopped it being
  active on two work units at once. Now: an asset normally has **exactly one** active placement.
  It may have active placements on **several work units at once** only as a **multi-lane
  machine** — one machine body with a separate counter set per lane (e.g. `Lane1_Total_Count`,
  `Lane2_Total_Count`), each lane modelled as its own `WORK_UNIT`.
  - There is **no multi-lane flag on `ASSET`.** "Multi-lane" is simply the state of having more
    than one active placement. The guard is at placement time: placing an asset that already has
    an active placement must ask whether this is a **move** (close the old row) or an **added
    lane** (keep both). Silently keeping both is not allowed, so a forgotten move can't turn a
    machine into a multi-lane machine by accident.
  - All of a multi-lane machine's active placements must be in **one `SITE`** (so the derived
    `ASSET.site_id`, §9.4, stays a single value, and the one-site rule of
    [Data Source §9.1](13-data-source.md#91-data_source--one-connectionendpoint) still holds).
    They may sit in different `WORK_CENTER`s.
  - **Role per lane: the machine may be `primary` on each of its work units** — each lane has its
    own Availability. The existing rules apply per work unit, unchanged: at most one active
    `primary` per work unit, and the same asset at most once per work unit. `secondary` on one lane
    and `primary` on another is allowed too; each placement's role is judged on its own work unit.
  - Every per-lane tag must be assigned to exactly one of those work units — see
    `ASSET_TAGS.work_unit_id` (§9.7). Nothing may be counted in two work units.
- A move is recorded as placement history (`ASSET_PLACEMENT`: `asset_id`, `work_unit_id`,
  `placement_role`, `valid_from`, `valid_to`), **never** by overwriting a `work_unit_id`
  field on `ASSET` — that field no longer exists (§9.4, B6, 2026-09-03).
- **Closing the old placement: half-open (PO, 2026-10-02, prd-molcadx#24 item 21).** The old
  row's `valid_to` is set to the new row's `valid_from`, the same value — not the day before. This is the
  shared [F-00 half-open rule](00-foundation.md), applied here.
  A row covers `valid_from ≤ t < valid_to`, so at the move moment exactly one of the two rows
  is active and there is no gap between them. Example: PCK01 moves from `S01` to `S02` with
  `valid_from = 2026-10-05`; the `S01` row gets `valid_to = 2026-10-05`. On 2026-10-04 PCK01
  is on `S01`; from 2026-10-05 it is on `S02`. Whether these values are dates or timestamps is
  still open (A-19).
- **`ASSET_PLACEMENT` is the sole source of truth for an asset's current location — read
  or write it there, never on `ASSET`.** Before B6 (2026-09-03), `ASSET` also carried inline
  `work_unit_id`/`site_id` fields that could be written independently of `ASSET_PLACEMENT`,
  and ABAC scope checks read the inline fields while placement history could move on
  without them — the two could silently disagree about where an asset actually was. The
  inline `work_unit_id` is removed and `site_id` is now derived read-only from the current
  placement (§9.4). Any consumer that scoped access, reporting, or KPI attribution off
  `ASSET.work_unit_id`/`ASSET.site_id` must be repointed at `ASSET_PLACEMENT` (see the ABAC
  catalog, [00-1-authorization-permissions.md](00-1-authorization-permissions.md) AST rows).
- Historical analysis always uses the placement(s) that were active **at the time of the
  event**, both the `primary` and any `secondary` rows that applied then, since a
  `secondary` asset can itself be swapped or removed on its own timeline.

### 9.7 `ASSET_TAGS` — per-asset tag → signal declaration

Declares which PLC/sensor tags belong to which `ASSET`, and what each one means.
Acquisition (a collector actually reading the tag) requires an active `ASSET_PLACEMENT` for
the asset. Declaration does not.

**PO decision 2026-09-25 ([decision](../../../LOGS/decisions/2026-09-25-generated-opcua-tag-nodes.md)):**
the user declares the tag itself (`tag_name` plus role/kind/uom/…). Where the tag's data
source uses `node_naming = generated` ([Data Source §9.1](13-data-source.md#91-data_source--one-connectionendpoint),
OPC UA or MQTT since 2026-09-28), the address is **generated** from the asset's placement in the hierarchy
(§9.7.1), not typed. `node` is typed by hand only for `node_naming = manual` sources (a machine's or
vendor's own OPC UA server, or MQTT topics a device publishes on its own).

| Field | Type | Required | Notes |
|---|---|---|---|
| `tag_id` | internal ID | Yes | Permanent, never reused |
| `asset_id` | FK → `ASSET` | Yes | The asset this tag belongs to. **Resolved (A-6a): Equipment-unit level only** (`parent_asset_id IS NULL`), same restriction as `ASSET_PLACEMENT` (§9.6). A component cannot carry its own tag declaration directly; a component's signal is declared against its parent Equipment unit |
| `data_source_id` | FK → `DATA_SOURCE` ([Data Source §9.1](13-data-source.md#91-data_source--one-connectionendpoint)) | Yes | Which PLC/OPC UA server/MQTT broker this tag is read from. **Moved 2026-09-03 (decision B7):** `DATA_SOURCE` is its own module now, not part of Integration — Integration stays system-to-system (ERP), `DATA_SOURCE` is sensor/IoT connections |
| `work_unit_id` | FK → `WORK_UNIT` | Conditional | **Added 2026-09-25 (multi-lane machine, §9.6).** Which of the asset's work units this tag belongs to. **Required when the asset has more than one active placement**; optional (and, if set, must equal the only placement's work unit) otherwise. Must match one of the asset's **active** placements; if that placement closes, the tag has no work unit until reassigned (no address, not acquired — §9.7.1 rule 5). **Per-lane roles** (`product_code`, `total`, `good`, `reject`, `reject_reason`, `speed`) count **only** in this work unit. **Machine-wide roles** (`machine_state`, `downtime_reason`, `runtime`) still apply to **every** work unit the machine is placed on; for them this field only places the single generated address (§9.7.1 rule 9). A per-lane tag left unassigned on a multi-lane machine is not acquired and is flagged, rather than counted in every lane. Points at the work unit, **not** at an `ASSET_PLACEMENT` row: placement rows are closed and reopened (swap, re-placement, correction), so a placement FK would dangle on a closed row while the lane itself — the work unit — has not changed |
| `tag_name` | string | Yes | **Added 2026-09-25.** The tag's own name on the machine, e.g. `Total_Count`, `NG_Seal_Overload`. Letters, digits and `_` only — no `/` (the separator of a generated address, §9.7.1). Unique per asset among active rows (`(asset_id, tag_name)`, `valid_to` null or in the future) |
| `node` | string | Conditional | Hand-typed protocol address — an MQTT topic or an OPC UA NodeId, e.g. `PLC1.DB10.DBW4`. **Required only when the tag's `DATA_SOURCE.node_naming = manual`; must be empty when `generated`** (the address comes from `generated_node` instead). Unchanged meaning for manual sources |
| `generated_node` | derived, read-only | — | **Added 2026-09-25. Not stored, not writable.** For `node_naming = generated` sources: the OPC UA NodeId built from the asset's placement active at the time asked about, §9.7.1. Empty when the source is `manual`, or when the asset has no active placement (the tag is then not acquirable, same as the existing rule above) |
| `kind` | enum | Yes | Data shape: `cumulative_counter` / `delta_counter` / `value` / `boolean` / `enum` |
| `tag_role` | enum | Yes | Business meaning: `product_code` / `total` / `good` / `reject` / `machine_state` / `downtime_reason` / `reject_reason` / `speed` / `runtime` / **`activity_signal`** (added 2026-10-01, PO: kind `value`, unit on `uom_id` — motor current, voltage from a load sensor, vibration, pressure. Shows **whether the machine is working**; feeds **Availability only**, through the band check (range detection, F-07.1), never Performance or Quality. For machines with no counter and no speed signal. [decision](../../../LOGS/decisions/2026-10-01-open-items-wrap-up.md)) / **`lot_marker`** (added 2026-09-30, issue #58 Q6: kind `boolean`, a **level** signal — 1 while a batch / lot is open, 0 when closed; rising edge = start, falling edge = end. Optional; without it, batch start and end come from the job step's start and close. Never feeds a KPI value directly — it only marks boundaries. [decision](../../../LOGS/decisions/2026-09-30-work-master-wave-1.md)) / **`measured_total`** (added 2026-10-02 (PO, 2026-10-02, prd-molcadx#24 item 3): a running total of a **measured quantity** — weight, volume — e.g. a checkweigher's `Total_Weight`, `Total_Good_Weight`, `Total_NG_Weight`. `uom_id` required. **No KPI slot accepts it**, so it is never summed into piece counts or any OEE input. A weight total must not use `total` / `good` / `reject`. The role for a **per-piece** measurement (one weight per pack) stays open on docs-molcadx#60. Per lane or machine-wide on a multi-lane machine: A-20) |
| `reject_reason_id` | FK → `REJECT_REASON` ([Reference & Master Data](05-reference-master-data.md)) | No | Only set when `tag_role = reject`. Molca's PLCs expose **one register per reject reason**, not one generic counter plus a separate reason signal. Reason A's count and reason B's count tick independently, on different registers. This field says which reason a given `reject` row's register is dedicated to. Several tags (`tag_name`s) can point at the **same** `reject_reason_id` (e.g. `NG_Seal_Overload` and `NG_Seal_Overload_2`, the same cause on two stations) so Pareto analysis aggregates them as one reason, not two |
| `downtime_reason_id` | FK → `DOWNTIME_REASON` ([Reference & Master Data](05-reference-master-data.md)) | No | Only set when `tag_role = downtime_reason`. Same per-register pattern as reject: Molca's PLCs expose one dedicated boolean per specific fault (`Emergency_Stop`, `Thermal_Trip`, `Servo_Alarm_1_axis`, …), not one generic alarm signal. Several tags (`tag_name`s) can point at the same `downtime_reason_id` (e.g. `Servo_Alarm_1_axis` … `Servo_Alarm_Axis_20` as one "servo alarm" reason) for the same aggregation reason as `reject_reason_id` |
| `uom_id` | FK → `UNIT_OF_MEASUREMENTS` ([Reference & Master Data](05-reference-master-data.md)) | No | Required for `total`/`good`/`reject`/`speed`/`runtime`/`measured_total`. On `total`/`good`/`reject` it names the unit of the count (`pcs`, `pack`, `carton`). **Weight totals are not `total`/`good`/`reject` (PO, 2026-10-02, prd-molcadx#24 item 3):** a checkweigher's `Total_Weight`/`Total_Good_Weight`/`Total_NG_Weight` use `measured_total` with a mass unit (g, kg), so grams are never added to piece counts. Its piece counters (`Product_Count`/`Good_Condition_Count`/`NG_Condition_Count`) keep `total`/`good`/`reject`. Not applicable for `product_code`/`downtime_reason`/`machine_state` |
| `count_side` | enum | Conditional | **Added 2026-09-30 (issue #58).** `output` (default) / `input`. Only for `total` / `good` / `reject`. `input` = the counter sits on the material going **in** (e.g. dough fed to the mold); the platform converts input-side counts to output with the step's quantities (F-08 step ratio) and marks them `derived`. **A measured output count always wins over a derived one** for the same work unit and period. The counter's unit stays `uom_id` |
| `count_basis` | enum | No | **`unit` / `cycle`.** Declares what one increment of this counter actually represents. Required when `tag_role = total`/`good`/`reject`: `unit` means the counter ticks once per individual piece; `cycle` means it ticks once per machine cycle, where one cycle yields `OPERATION.batch_size` ([Work Master §9.2](08-work-master.md#92-operation--one-step-of-a-routing-at-one-work-unit-with-its-standard), moved from Product 2026-08-18) units at once. This is what Work Master's operating-time formula reads to decide whether `sensor_count` needs dividing by `batch_size` before multiplying by `cycle_time_value`, declared explicitly per tag rather than assumed globally, since different assets can wire their counters differently |
| `valid_from`, `valid_to` | date | Yes | A tag mapping is rewired, not overwritten, e.g. a hand-typed register address changes, `tag_name` changes, or a role is reassigned. An asset **move** does not need a new row: under generated naming the same `tag_id` simply gets a new `generated_node` from the move date (§9.7.1) |

**Keys** (F-00 [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `tag_id` · Unique: — · No overlap: (`asset_id`, `tag_name`) among active rows (`tag_name` note); `generated_node` per `namespace_uri` among active tags — a derived value, so an application check at save (§9.7.1 rule 3)

`total`/`good`/`reject` are the counts the KPIs add up, in the unit `uom_id` names. **A
running total of a measured quantity (weight, volume) is `measured_total`, not one of these
three (PO, 2026-10-02, prd-molcadx#24 item 3).** Earlier text here let a checkweigher's weight
totals use `total`/`good`/`reject` with `uom = kg`; that let KPIs add grams to piece counts,
so it is withdrawn. `measured_total` rows are declared and exported like any tag, but no KPI
slot binds them.

`reject` and `downtime_reason` are both declared **per cause, one row per register/trigger**
(via `reject_reason_id`/`downtime_reason_id` above) rather than as a single undifferentiated
signal. One asset can have many `reject` rows and many `downtime_reason` rows, each
dedicated to one register, with several registers allowed to resolve to the same reason.

`machine_state` is a separate role from `downtime_reason`. It reports **whether** the
machine is running or stopped (e.g. `Machine_Run`/`Machine_Stop`), not **why**. It is the
generic state signal, the same relationship `total`/`good` (generic) have to `reject`
(per-cause breakdown).

A `runtime`-role tag is typically `kind = cumulative_counter`, but the counter is not
necessarily counting in seconds. A PLC often increments in seconds, minutes, or an arbitrary
pulse unit, so `uom_id` on a `runtime` tag must declare **the raw unit the counter actually
increments in**, not "seconds" by assumption. Turning that raw value into an actual
seconds figure is a conversion, not a read. The same conversion mechanism `OPERATION.time_conversion_id`
([Work Master §9.2](08-work-master.md#92-operation--one-step-of-a-routing-at-one-work-unit-with-its-standard),
moved from Product's `PRODUCT_WORK_UNIT` 2026-08-18) already uses against `TIME_CONVERSIONS`
([Reference & Master Data §9.3](05-reference-master-data.md#93-time_conversions)) — computed
automatically from `TIME_CONVERSIONS.seconds_per_unit`, never entered by hand.
This table only declares that the tag exists and what it means. It does not store readings and
does not perform the conversion itself; the raw reading lands wherever the consuming domain
records it (e.g. `ASSET_STATE_LOG` for a `downtime_reason`-role tag), and converting/aggregating
it into seconds is downstream work outside this module's scope.

**`ASSET_PRODUCT_CODES`** resolves a raw `product_code` tag value to an actual `PRODUCT`:

| Field | Type | Required | Notes |
|---|---|---|---|
| `asset_product_code_id` | internal ID | Yes | Permanent, never reused |
| `tag_id` | FK → `ASSET_TAGS` | Yes | Must reference a tag with `tag_role = product_code` |
| `raw_value` | string | Yes | The raw value read off the PLC, e.g. `"12"`, unconstrained string, no format assumed |
| `product_id` | FK → `PRODUCT` | Yes | |
| `valid_from`, `valid_to` | **timestamp** (tz) | Yes | A code can be rewired to a different product over an asset's life, versioned, never overwritten. **Timestamps since 2026-09-30 (issue #58 part B)**, not dates, so a mid-shift changeover is attributed to the right product. An edit closes the old row and opens a new one. Authored on the product's Routing tab (product codes, grouped by work unit — [UX 08](../UX/08-work-master.md)); the data stays owned here |

**Keys** (F-00 [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `asset_product_code_id` · Unique: — · No overlap: (`asset_id`, `raw_value`) — `asset_id` is reached through `tag_id → ASSET_TAGS.asset_id`, a join, so an application check, not an exclusion constraint on this table alone (A-6b)

**Uniqueness constraint: resolved (A-6b).** For a given asset (via `tag_id →
`ASSET_TAGS.asset_id``), the same `raw_value` must resolve to exactly one active
`product_id` at a time. A `(asset_id, raw_value)` pair cannot have two rows both active
(`valid_to` null or in the future) simultaneously. Different assets may reuse the same
`raw_value` for different products (raw PLC codes are asset-local), but within one
asset, one code must mean one product, never two at once.

**Codes are per asset, and one product may have several (PO, 2026-10-01).** Each asset has its own codes: the
mapping is read per asset (through `tag_id → ASSET_TAGS.asset_id`), never shared across assets. The rule above
works one way only: one code → one product. The reverse is allowed — one product may have **several active codes on
the same asset** (e.g. `12` and `112` both mean `FG-1001` on `PCK01`, two recipes on the HMI) and different codes on
different assets (`12` on the filler, `A7` on the cartoner). The uniqueness check is on `(asset_id, raw_value)`,
**not** on `tag_id`: an asset with two `product_code` tags still may not map one raw value to two products at once.

**Changing a code mapping (PO, 2026-10-02, prd-molcadx#24 items 5–7, 10).** Codes are authored on the Routing tab
(`SCR-FND-WMS-007`, [UX 08](../UX/08-work-master.md)); the rules below hold wherever a row is written.

- **Timestamps, not dates.** `valid_from` / `valid_to` are timestamps (tz), so a mid-shift changeover is attributed to
  the right product (also prd-molcadx#24 item 11).
- **Back-dated change: warn with a shift count (item 5).** Master Data stores no tag readings, so it cannot count the
  shifts that really hold readings of that code. The warning counts the site's **closed** `SHIFT_INSTANCE` rows whose
  time overlaps the changed period, and says "up to \<n\> shifts". The real number can be lower.
- **Ending a code in the past warns too (item 6).** An End time before now re-attributes readings in the same way, so it
  shows the same back-dated warning.
- **Master Data does not recalculate (item 5).** On every add, End or Delete, Master Data emits the event
  `product_code_mapping_changed` with the work unit, the raw code, and the old and new period. PRODUCTION listens and
  recalculates the affected KPIs. The event payload beyond these four facts, and how it is delivered: `TBD — perlu
  konfirmasi PO` (does it follow the Notification / Integration event pattern, or a direct call?).
- **Reason required on End and Delete (item 10).** Both ask for a reason and write it to `AUDIT_LOG`
  ([Audit Trail](14-audit-trail.md) rule 5). Add needs no reason.
- **Permission (item 7).** `foundation:ast:work_unit:update` ([F-00.1](00-1-authorization-permissions.md)), checked at
  **site** scope for now: a user with that permission on the work unit's site may edit. Checking at work-unit scope comes
  later.

#### 9.7.1 Generated OPC UA node address

> **PO decision 2026-09-25** — [decision note](../../../LOGS/decisions/2026-09-25-generated-opcua-tag-nodes.md).
> Applies to tags whose `DATA_SOURCE` has `node_naming = generated`
> ([Data Source §9.1](13-data-source.md#91-data_source--one-connectionendpoint)) — `protocol = opcua`
> (NodeId below) or, **since 2026-09-28 (PO)**, `protocol = mqtt` (topic, see "MQTT topic" below). The
> heading keeps its OPC UA name so existing links still work.

**Shape:**

```
nsu=<DATA_SOURCE.namespace_uri>;s=<site_code>/<area_code>/<work_center_code>/<work_unit_code>/<asset_tag>/<tag_name>
```

**MQTT topic (PO, 2026-09-28).** Same segments, same order, `/` as the separator, with the data
source's topic root in front **only when it is set** (`topic_root` is optional):

```
[<DATA_SOURCE.topic_root>/]<site_code>/<area_code>/<work_center_code>/<work_unit_code>/<asset_tag>/<tag_name>
e.g.  JKT1/AS/L01/S01/PCK01/Total_Count          (no topic root — broker used only by Molca)
      molca/JKT1/AS/L01/S01/PCK01/Total_Count    (topic root "molca" — shared broker)
```

- **One value per topic.** Acquisition is Telegraf, which reads one value per topic and can take tags
  from the topic path. A payload that carries several signals in one message (e.g. one JSON per machine)
  is not covered by this shape — such a source stays `manual`.
- Segments are cleaned the same way (below: anything not a letter, digit or `_` becomes `_`), which also
  keeps out MQTT's reserved `/`, `+` and `#`. Topics are case-sensitive; letters keep their case.
- Rules 1–9 below apply unchanged, reading "address" for `generated_node`. For rule 3 (unique), the
  scope is active tags on data sources that share the same broker and the same `topic_root` (empty counts
  as one value), instead of the same `namespace_uri`. For rule 6, the hand-off list goes to whoever configures the gateway that publishes.
  Topic root, when used: [Data Source H-DS-7](13-data-source.md#whats-still-unknown).

The five hierarchy/asset segments are read from the `ASSET_PLACEMENT` row active at the time
asked about (`WORK_UNIT` → `WORK_CENTER` → `AREA` → `SITE`, [Site Hierarchy §9.3–§9.6](01-site-hierarchy.md#93-site--physical-factory-location-the-main-dataaccesstime-boundary)).
Primary and secondary placements are treated the same — the asset segment tells them apart.
For a **multi-lane machine** (§9.6) the work unit is the tag's own `ASSET_TAGS.work_unit_id`,
so each lane's counter still gets exactly one address:

| Tag | Assigned work unit | `generated_node` |
|---|---|---|
| `Lane1_Total_Count` | `S01` | `nsu=<namespace_uri>;s=JKT1/AS/L01/S01/PCK01/Lane1_Total_Count` |
| `Lane2_Total_Count` | `S02` | `nsu=<namespace_uri>;s=JKT1/AS/L01/S02/PCK01/Lane2_Total_Count` |
| `Machine_Run` (machine-wide) | `S01` (address only) | `nsu=<namespace_uri>;s=JKT1/AS/L01/S01/PCK01/Machine_Run` — applies to both lanes |

**Example.** Two packers, each with a `Total_Count` tag, placed on two stations of the same line:

| Asset (`asset_tag`) | Placed on | `generated_node` |
|---|---|---|
| `PCK01` | `JKT1` › `AS` › `L01` › `S01` | `nsu=<namespace_uri>;s=JKT1/AS/L01/S01/PCK01/Total_Count` |
| `PCK02` | `JKT1` › `AS` › `L01` › `S02` | `nsu=<namespace_uri>;s=JKT1/AS/L01/S02/PCK02/Total_Count` |

**What the standard fixes and what Molca chose.** IEC 62541-3 (OPC UA address space model)
fixes the NodeId structure: a namespace, an identifier type, and an identifier value. `s=`
is the String identifier type; the `nsu=…;s=…` text form is the standard's string encoding
of an expanded NodeId. **The slash-separated path inside the string is a Molca convention** (separator changed from `.` to `/` on 2026-10-01). Neither
IEC 62541 nor ISA-95 (IEC 62264) requires a NodeId to spell out the equipment hierarchy;
the segment order simply follows the ISA-95 levels Site Hierarchy already uses.

**Namespace URI, not index.** The address stores the namespace **URI** (`nsu=`), never the
numeric index (`ns=`). The index is only the URI's position in the server's namespace array,
and it can change when the server restarts or is reconfigured; the URI does not.

**Segments.**

- **Each segment is the code, cleaned (PO, 2026-10-02, prd-molcadx#24 item 2).** Real codes are
  kept as they are (`ANRITSU 57-1`, `MITSUM-1`, `FI-2`). When the address is built, every
  character that is not a letter, digit or `_` becomes `_`. So no segment ever holds `/` (the
  separator), `.`, `-` or a space. There is **no separate segment-code field** on `ASSET` or on
  the location levels. Cleaning is part of building the address, so it is derived like the rest
  of `generated_node` (rule 2), never stored.
- **Worked example** (`FI-2`, `FI2-1`, `ANRITSU 57-1` and `MITSUM-1` are real FI-2 codes; `PKG` and `ST02` are made up). Site `FI-2`, area `PKG`, work center `FI2-1`, work unit `ST02`, asset
  `ANRITSU 57-1`, tag `Total_Count`:

  | Code (as stored) | Segment (cleaned) |
  |---|---|
  | `FI-2` | `FI_2` |
  | `FI2-1` | `FI2_1` |
  | `ST02` | `ST02` (unchanged) |
  | `ANRITSU 57-1` | `ANRITSU_57_1` |
  | `MITSUM-1` | `MITSUM_1` |

  `generated_node` = `nsu=<namespace_uri>;s=FI_2/PKG/FI2_1/ST02/ANRITSU_57_1/Total_Count`.
- **Two siblings that clean to the same segment are refused.** Under one parent, no two
  children may give the same cleaned segment: two areas of one site, two work centers of one
  area, two work units of one work center, two assets placed on one work unit. Example: assets `MITSUM-1` and `MITSUM 1` on the same work unit both clean to
  `MITSUM_1`. The save that would cause the clash (code save, asset placement, tag save) is
  refused with an error naming **both** codes. This is checked on top of rule 3 (unique on the
  server).
- Hierarchy segments are the per-level `*_code` fields (`JKT1`, `AS`, `L01`, `S01`). Their
  suggested patterns were changed on 2026-09-25 from "embeds the parent" (`JKT1-AS-L01-S03`) to
  one segment per level, so joining them does not repeat — see [Site Hierarchy S-4](01-site-hierarchy.md#913-open-questions).
- The asset segment is `ASSET.asset_tag` (§9.4, unique within site, so unique within a work
  unit too), cleaned as above. `asset_tag` is floor-facing (printed on the machine), so it is
  never changed to fit the address. Before 2026-10-02 an `asset_tag` with other characters
  (e.g. `IM-003`) blocked generated naming for that asset's tags; that rule is withdrawn (A-13).
- `tag_name` already allows only letters, digits and `_` (§9.7), so cleaning never changes it.
- The path starts at the site. Tenant and enterprise are left out: one `DATA_SOURCE` belongs
  to exactly one site ([Data Source §9.1](13-data-source.md#91-data_source--one-connectionendpoint)),
  `site_code` is unique within the enterprise, and a NodeId is only ever resolved against its own
  server and namespace URI — so the site segment is already enough to tell addresses apart on one
  server. The uniqueness rule below covers the remaining edge case (two sources sharing one URI).

**Rules.**

1. **Readings and history are keyed by `tag_id`, never by address.** A new address after a move
   or a rename changes nothing in stored readings or KPI history.
2. **Derived on read, not stored.** `generated_node` is computed from the placement, cleaned codes,
   `asset_tag`, `tag_name` and `namespace_uri` in force at the moment asked about — the same
   pattern as `ASSET.site_id` (§9.4, derived from placement). Storing a copy per placement period
   would create a second source of truth that can disagree with the codes it came from (the B6
   problem). What the hardware side was actually given is recorded by the **tag hand-off list**
   (rule 6), not by a stored column. Past addresses stay recoverable: placements are
   effective-dated, and code changes are in the [Audit Trail](14-audit-trail.md).
3. **Unique on the server.** Among active tags whose data sources share the same
   `namespace_uri`, no two may produce the same `generated_node`. Checked at save time
   (tag save, placement save, code rename); the save is refused and names the tag that already
   uses the address. With `(asset_id, tag_name)` unique and site-level codes unique this can only
   fail when two data sources share one URI, but it is checked anyway.
4. **Asset move → new address from the move date.** When a new `ASSET_PLACEMENT` opens, the same
   `tag_id` gets its new `generated_node` from that placement's `valid_from`. The server does not
   follow on its own: a new tag hand-off list is needed, and until the hardware side configures the
   new NodeIds, reads on the new address fail. Whether MolcaDx tracks that "configured" step: A-11.
5. **No active placement → no address.** An asset with no active `ASSET_PLACEMENT` has no
   `generated_node`; its tags are declared but not acquirable — the same rule as §9.7's intro
   ("declaration can happen before placement, acquisition cannot"). Screens show "no address —
   asset not placed", not a stale address from the last placement. Open for confirmation: A-12.
   The same applies to a multi-lane machine's tag whose assigned `work_unit_id` no longer has an
   active placement, or a per-lane tag left unassigned: no address, not acquired, flagged.
6. **Tag hand-off list.** MolcaDx produces, per data source, the list of every `generated_node`
   with its `tag_name`, `tag_role`, `kind`, `uom_id`, `count_basis`, reason (`reject_reason_id` /
   `downtime_reason_id`), `asset_tag`, work unit, and the date the address takes effect. It is
   handed to Molca's hardware person, who configures the gateway / OPC UA server to expose
   **exactly** those NodeIds. **The generated address is the source of truth; the server is
   configured to match it**, never the reverse. Connection credentials are never in the list
   ([Data Source](13-data-source.md) H-DS-2). File format, and whether each export is kept: A-11.
7. **Codes in the path are effectively frozen.** Renaming `site_code`/`area_code`/`work_center_code`/`work_unit_code`,
   `asset_tag` or `tag_name`, or changing a data source's `namespace_uri` or `node_naming`, changes
   live addresses. The save shows how many active `generated_node`s will change and asks for
   confirmation; afterwards a new hand-off list is needed. Warn-and-confirm vs. block: A-14.
8. **Manual sources are unchanged.** For `node_naming = manual` (a machine's or vendor's own OPC UA
   server with fixed node names, or MQTT topics a device publishes in its own structure) the hand-typed
   `node` is the address, as before. (Until 2026-09-28 MQTT was always manual.)
   The multi-lane `work_unit_id` rules (§9.7) apply to manual sources too — they decide where a
   tag counts, not only its address.
9. **Machine-wide signals on a multi-lane machine: one address, every lane.** `machine_state`,
   `downtime_reason` and `runtime` describe the one machine body, so one stop downs every lane.
   They apply to every work unit the machine is placed on, and each lane's Availability is
   computed on its own from that same state — lane downtimes are never summed into one lane.
   The tag keeps **one** generated address, under the work unit named in its `work_unit_id`
   (required anyway once there are two placements); the gateway does not alias the register under
   each lane. Aliasing (one address per lane for the same register) was rejected as the default:
   one `tag_id` would have several addresses, and the collector would read one register several
   times. Open for PO: A-15.

### 9.8 Open questions

| # | Question | Owner |
|---|---|---|
| A-1 | What are the real `ASSET_CLASS` and `ASSET_TYPE` values at Molca (across all 4 component levels, not just top-level machines)? Still open, but no longer blocks registering an asset. `asset_type_id` is nullable (§9.4). | ops-domain |
| ~~A-3~~ | ~~Is asset status read automatically from PLC, or logged manually first?~~ **Resolved: both, see "What's still unknown" above.** | — |
| ~~A-4~~ | ~~Do assets have a scannable physical tag (QR/barcode)?~~ **Resolved: already covered by `asset_tag` (§9.4).** | — |
| ~~A-5~~ | ~~Downtime recording level: per asset or per work unit/line? Reopened 2026-09-03 (decision B5): `ASSET_STATE_LOG` had no §9 spec in FOUNDATION and no settled owner.~~ **Ownership resolved 2026-09-28 ([decision 2026-09-28](../../../LOGS/decisions/2026-09-28-asset-status-ownership.md)): owner = PRODUCTION** (PRODUCTION writes, MAINTENANCE reads). FOUNDATION will not specify `ASSET_STATE_LOG`. The recording-level question (per asset vs per work unit) **moved to PRODUCTION as SL-1** ([PRODUCTION Monitoring](../../PRODUCTION/DOCS/02-monitoring.md#asset_state_log--operational-state-per-asset-over-time)); resolved there 2026-09-29: per asset, `asset_id` and `work_unit_id` both required. | — (moved to `production-domain`) |
| ~~A-6~~ | ~~`ASSET_TAGS`/`ASSET_PRODUCT_CODES` are now shaped and declared (§9.7). (a) must `asset_id` be restricted to Equipment-unit-level `ASSET`s? (b) unique constraint on `(asset_id, raw_value)`? (c) heartbeat/staleness detection for a silent tag?~~ **Resolved: all three.** (a) Equipment-unit-level only, same as `ASSET_PLACEMENT`. (b) yes, one active `product_id` per `(asset_id, raw_value)` pair at a time. (c) tracked at `DATA_SOURCE` (connection) level, not per-tag, matches how OPC UA subscription keep-alive / MQTT LWT actually work; a per-tag interval would be unreliable given tags are event-driven. See [Integration](11-integration.md). | — |
| ~~A-7~~ | ~~Does `ASSET.manufacturer`/`.model` still need to exist alongside `ASSET_TYPE.manufacturer`/`.model`?~~ **Resolved: dropped.** `ASSET` no longer has instance-level `manufacturer`/`model`. Every `ASSET` reads it from `ASSET_TYPE` (§9.3). An asset registered before classification (`asset_type_id` null, §9.4) simply has no manufacturer/model until it's classified, same as it has none of Type's `attributes`. | — |
| A-8 | Does Molca actually need per-instance `attributes` overrides (§9.4), or is `ASSET_TYPE.attributes` (§9.3) alone sufficient, in which case `ASSET.attributes` should be dropped rather than kept as unused schema? | foundation-domain |
| ~~A-9~~ | ~~Can a `WORK_UNIT` ever legitimately have more than one active `ASSET_PLACEMENT`?~~ **Resolved: yes, but asymmetric.** Real PLC tag mapping (Vertical Packer line) showed a packer and its dedicated checkweigher grouped under one work unit, with the checkweigher having no downtime state of its own. §9.6 now allows one active `primary` placement (unchanged "at most one" for Availability) plus any number of active `secondary` placements (auxiliary equipment, Quality/reason-enrichment only, no Availability). Equipment that needs its own tracked Availability must get its own `WORK_UNIT` instead, see [KPI inputs](07-1-kpi-tag-mapping.md#multiple-assets-under-one-work-unit--primary-vs-secondary). | — |
| A-10 | How does a newly registered asset that has never had an `ASSET_PLACEMENT` get recorded as "physically at Site X" (e.g. sitting in a receiving dock before first install)? `ASSET.site_id` is now derived from `ASSET_PLACEMENT` (§9.4, B6) and reads as "unplaced" until a placement exists — is that acceptable, or does registration need to force an immediate placement, or is a lighter-weight "site only, no work unit yet" placement shape needed? | PO / ops |
| A-11 | **Tag hand-off list (§9.7.1 rule 6):** what file format does Molca's hardware person need (CSV, OPC UA NodeSet XML, gateway-specific import)? Does MolcaDx keep a record of each export? Does a tag need a "configured on the server / confirmed by hardware" status, so a newly generated address is not treated as live (and read failures are not raised as faults) until hardware confirms it? `TBD — needs PO/Operations confirmation` | PO / Operations |
| A-12 | **Tags of an unplaced asset (§9.7.1 rule 5):** confirm that an asset with no active `ASSET_PLACEMENT` has no generated address and its tags are simply not acquired (consistent with §9.7's existing "acquisition needs an active placement" rule). Should the hand-off list show such tags as "not placed" or leave them out? `TBD — needs PO/Operations confirmation` | PO / Operations |
| ~~A-13~~ | ~~**`asset_tag` as an address segment (§9.7.1):** `asset_tag` is the code printed on the machine body (floor-facing, §9.4), and the old suggested pattern `IM-003` contains `-`, which the segment charset forbids. The suggested pattern is now `IM003` (F-00), but real floor tags may already carry `-` or `/`. Keep `asset_tag` as the segment (and refuse generated naming for non-conforming tags), or add a separate segment code on `ASSET`?~~ **Resolved (PO, 2026-10-02, prd-molcadx#24 item 2):** real codes stay as they are; each address segment is the code **cleaned** (any character that is not a letter, digit or `_` becomes `_`, `ANRITSU 57-1` → `ANRITSU_57_1`). Applies to location codes too (`FI-2` → `FI_2`). No separate segment-code field. Two siblings that clean to the same segment are refused, naming both. See §9.7.1 "Segments" | — |
| A-14 | **Renaming a code that is in a live address (§9.7.1 rule 7):** warn with the count of changed addresses and let the user confirm (current spec), or block the rename while generated tags depend on it? `TBD — needs PO confirmation` | PO |
| A-15 | **Machine-wide signals on a multi-lane machine (§9.7.1 rule 9):** default is one address under one assigned work unit, applied to every lane. Does Molca's hardware person prefer the gateway to alias the register under each lane's path instead (one address per lane, same register)? Or does any real machine have a per-lane stop signal, which would then be declared as a per-lane `machine_state` tag assigned to that lane? `TBD — needs PO/Operations confirmation` | PO / Operations |
| A-16 | **Tag template per machine type (future improvement, PO 2026-09-28 — not a blocker).** Machines of one `ASSET_TYPE` usually expose the same signals, yet each `ASSET_TAGS` row is declared per machine. Should `ASSET_TYPE` carry a tag template (tag name, `kind`, `tag_role`, `uom_id`/`count_basis`) that creates a machine's tags when it is placed on a generated source? Needs a new entity; not designed until the PO asks. Also open: the default `kind` and default tag name per `tag_role` used to pre-fill the tag form ([UX 13 § Declaring a tag](../UX/13-data-source.md#declaring-a-tag-po-decision-2026-09-28)) | `foundation-domain` / PO |
| A-17 | **Keys (2026-10-01).** Uniqueness of `code` on `ASSET_CLASS` and `ASSET_TYPE` (§9.2, §9.3) is not stated. Unique per tenant? Among active rows only? Not listed in their **Keys** lines until decided | `foundation-domain` / PO |
| A-18 | **Keys (2026-10-01).** `ASSET.asset_tag` is "unique within site" (§9.4), but the site is derived from the current `ASSET_PLACEMENT`, and an unplaced asset has no site (A-10). Which scope does the check use for an unplaced asset (tenant? enterprise?), is it re-checked when an asset moves to another site, and does it cover all rows or active rows only? | `foundation-domain` / PO |
| A-19 | **Keys (2026-10-01).** Type of `ASSET_PLACEMENT.valid_from`/`valid_to` (§9.6) is not stated anywhere. Consumers resolve the placement "active at the event timestamp" ([F-07.1](07-1-kpi-tag-mapping.md), PRODUCTION SL-1), and `ASSET_PRODUCT_CODES` moved to timestamps for mid-shift changes; a `date` cannot place a mid-shift swap. Date or timestamp (tz)? **Partly decided (PO, 2026-10-02, prd-molcadx#24 item 21):** ranges are **half-open** — the old row's `valid_to` = the new row's `valid_from` (§9.6). Still open: date or timestamp | `foundation-domain` / PO |
| A-20 | **New 2026-10-02.** `measured_total` (§9.7, PO 2026-10-02): on a multi-lane machine, is it a per-lane role (counts only in its `ASSET_TAGS.work_unit_id`) or machine-wide? It feeds no KPI, so this only decides whether `work_unit_id` is required for it. Same open point the PRD lists for `lot_marker` / `activity_signal`. `TBD — perlu konfirmasi PO` | PO / `foundation-domain` |

> A-2 (the final `DOWNTIME_REASON`/`REJECT_REASON` lists) moved to
> [Reference & Master Data](05-reference-master-data.md) T-1 along with the entities it
> asks about, not repeated here to avoid two open questions asking the same thing in two
> files.

## Next step

A-1 above (machine classes) and T-1 in
[Reference & Master Data](05-reference-master-data.md) (reason codes) are the two answers
that most determine whether downtime analysis is usable at all. Get these from
Operations before building any downtime-reporting screen. A-10 is still open. A-5's ownership
part is resolved ([decision 2026-09-28](../../../LOGS/decisions/2026-09-28-asset-status-ownership.md)): `ASSET_STATE_LOG` is owned by
PRODUCTION, and the per-asset vs per-work-unit recording level was PRODUCTION's
SL-1 ([02-monitoring.md](../../PRODUCTION/DOCS/02-monitoring.md#asset_state_log--operational-state-per-asset-over-time)), resolved 2026-09-29: per asset, both FKs required.
