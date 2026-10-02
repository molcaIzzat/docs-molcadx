# F-05 — Reference & Master Data

> Working spec. `foundation-domain` should review this module before it's treated as
> settled.

**In short:** this module holds the flat reference/classification tables that other
modules point at by foreign key, but that don't belong inside any single one of those
modules — a downtime reason isn't part of Equipment Taxonomy's asset classification, and a
unit-of-measure conversion isn't part of Product's or Work Master's own scope. These
entities are grouped together in this one module for the same reason: none of them
describes one specific asset, product, or work order — they're all classification/
reference masters, not configuration values (see the boundary rule in
[Configuration Service](12-configuration-service.md)) and not descriptors of one specific
entity elsewhere.

## What this module is for

It answers: **"what shared code/name lookup tables does the rest of the system need, that
aren't specific enough to one module to live inside it?"** Two families live here today:

1. **Cause taxonomies** — why did a machine stop, why was a unit rejected
   (`DOWNTIME_REASON`, `REJECT_REASON`), each scoped to the asset it applies to via a
   join table.
2. **Unit/time reference tables** — how a raw count converts into a duration or a
   different unit of measure (`TIME_CONVERSIONS`, `UNIT_OF_MEASUREMENTS`).

Neither family changes often, both get referenced by transactional and master data across
several modules, and neither is a "value allowed to differ between plants without a code
change" (which is what [Configuration Service](12-configuration-service.md) actually
owns) — that's the same reasoning already used to keep `UOM`-shaped tables out of that
module.

## Why it matters — what goes wrong without it

| If you skip this | What happens |
|---|---|
| Downtime/reject reasons live as free text on the state log | Root-cause and Pareto analysis becomes impossible — the #1 named failure mode for downtime data (see Equipment Taxonomy) |
| Every module defines its own private unit-conversion table | The same "1 case = 24 units" fact gets typed twice and drifts out of sync |
| A reason code is deleted instead of deactivated | Historical `ASSET_STATE_LOG`/defect records lose their parent lookup row |
| No asset-level scoping on reasons | Operators are shown irrelevant reasons (e.g. "product changeover" on a utility machine that never changes over) |

## Why these particular entities live together

This set — `DOWNTIME_REASON`/`DOWNTIME_REASON_ASSET`, `REJECT_REASON`/
`REJECT_REASON_ASSET`, `TIME_CONVERSIONS`, `UNIT_OF_MEASUREMENTS`, `MEASUREMENT_GROUP` —
is grouped here as a single cluster, separate from the asset, product, and work-order
clusters, for the following reasons:

- None of these entities describes *one specific* asset, product, or work order —
  they're all **shared code/name lookups** that other entities point at.
  `PRODUCT_UOM_CONVERSION` is a deliberate exception kept out of this module — it carries a
  `product_id` FK, so it belongs to [Product](06-product.md) instead.
- The two join tables (`DOWNTIME_REASON_ASSET`, `REJECT_REASON_ASSET`) scope a
  reason to *which asset it applies to*, the same shape both times — that repetition
  is itself a signal they belong to the same family.
- `TIME_CONVERSIONS`, `UNIT_OF_MEASUREMENTS`, and `MEASUREMENT_GROUP` are flat `code`/`name`
  masters with the same shape as each other and as the two reason tables (no product- or
  asset-specific columns) — see [Configuration Service](12-configuration-service.md)'s
  boundary rule for why that shape disqualifies them from being configuration.
  `MEASUREMENT_GROUP` in particular is the same shape as [Equipment Taxonomy](04-asset-ontology.md)'s
  `ASSET_CLASS` — a top-level taxonomy with no attribute values of its own.

## How the entities connect

```
ASSET (Equipment unit, from Equipment Taxonomy)
  ← DOWNTIME_REASON_ASSET → DOWNTIME_REASON   (downtime-cause taxonomy, scoped per asset)
  ← REJECT_REASON_ASSET   → REJECT_REASON     (reject/scrap-cause taxonomy, scoped per asset)

MEASUREMENT_GROUP
  ← UNIT_OF_MEASUREMENTS.measurement_group_id  (which physical dimension this unit
      measures — count, mass, volume, …)

UNIT_OF_MEASUREMENTS
  ← (referenced by) OPERATION.uom_id                    (Work Master, F-08 — moved from
      Product's PRODUCT_WORK_UNIT 2026-08-18; the item unit the standard is per,
      never a time unit — 2026-09-28)
  ← (referenced by) PRODUCT_UOM_CONVERSION.from_uom_id / .to_uom_id  (Product, F-06 —
      product-specific conversions live there, not here)
  ← (referenced by) ASSET_TAGS.uom_id  (Equipment Taxonomy, F-04 — what a `total`/`good`/
      `reject` tag is actually counting or weighing)

TIME_CONVERSIONS
  ← (referenced by) OPERATION.time_conversion_id  (Work Master, F-08 — the KPI
      operating-time formula's only known consumer, moved from Product 2026-08-18)
```

A few things the picture can't say on its own:

- **This module owns the taxonomy, never the log.** `DOWNTIME_REASON`/`REJECT_REASON` are
  master data only — the operational log that actually records "this asset was down
  for this reason at this time" is `ASSET_STATE_LOG`, owned by PRODUCTION
  ([PRODUCTION Monitoring](../../PRODUCTION/DOCS/02-monitoring.md), [decision 2026-09-28](../../../LOGS/decisions/2026-09-28-asset-status-ownership.md)), entirely outside this module's scope. Same boundary Equipment
  Taxonomy draws for `ASSET_STATE_LOG` itself.
- **Asset-level scoping, not class-level.** The join tables scope per **asset
  instance** (`asset_id` FK → `ASSET`), a different, finer granularity than the old
  `REASON_CODE.applies_to_asset_class_id` it replaced.
- **`REJECT_REASON` has no category field at all** — flat `code`/`name`, unlike
  `DOWNTIME_REASON`'s `downtime_category` enum. This is a deliberate asymmetry, not an
  oversight.
- **`TIME_CONVERSIONS` is the only known consumer's only known consumer.** Nothing in this
  file's own scope reads it — it exists purely to be pointed at by
  `OPERATION.time_conversion_id` (Work Master, F-08 — moved from Product's
  `PRODUCT_WORK_UNIT` 2026-08-18), which is the field the KPI operating-time formula
  ultimately depends on.

## Common pitfalls

1. **Storing a reason as free text on the state log instead of an FK here.** Named
   repeatedly (in Equipment Taxonomy, in Shopfloor) as the single biggest cause of downtime
   analysis being useless.
2. **Scoping a reason to `ASSET_CLASS` instead of asset instance.** That was the old
   `REASON_CODE` model; these join tables scope per asset instance instead — don't
   regress to the coarser granularity.
3. **Hard-deleting a reason code, unit, or conversion row.** Historical records that
   reference it by ID would lose their lookup — deactivate with `deleted_at`/`valid_to`
   instead, per FOUNDATION's global rule.
4. **Assuming `REJECT_REASON` has the same category enum as `DOWNTIME_REASON`.** It
   doesn't — flat `code`/`name` only, by design.
5. **Treating `TIME_CONVERSIONS`/`UNIT_OF_MEASUREMENTS` as plant-configurable values.**
   They're reference master data referenced by other master/transactional entities, not a
   "differs per plant without a code change" setting — see the boundary rule in
   [Configuration Service](12-configuration-service.md).
6. **Assuming any two `UNIT_OF_MEASUREMENTS` rows can be converted generically.** `kg` and
   `pcs` belong to different `MEASUREMENT_GROUP` rows — that pairing is only meaningful for
   one specific product's known unit weight, which belongs in [Product](06-product.md)'s
   `PRODUCT_UOM_CONVERSION`, not a bare factor here.
7. **Letting implementors add a new `MEASUREMENT_GROUP` row from the floor.** Adding a UOM
   (a new weight or count label) is ordinary master-data work; adding a new *kind* of
   dimension is a governed schema-level change, the same weight as adding a new `tag_role`.

## Related modules

| Module | Relationship |
|---|---|
| [Equipment Taxonomy](04-asset-ontology.md) | `ASSET` (Equipment unit) is the FK target of both join tables' `asset_id`. |
| [PRODUCTION Monitoring](../../PRODUCTION/DOCS/02-monitoring.md) | Owns `ASSET_STATE_LOG` ([decision 2026-09-28](../../../LOGS/decisions/2026-09-28-asset-status-ownership.md)). Consumes `DOWNTIME_REASON` (via `ASSET_STATE_LOG.downtime_reason_id`) and `REJECT_REASON` (via defect recording) — its own operational recording stays outside this module's scope, same boundary as Equipment Taxonomy drew. |
| [Product](06-product.md) | `PRODUCT_UOM_CONVERSION.from_uom_id`/`.to_uom_id` are FKs into this module's `UNIT_OF_MEASUREMENTS`. `PRODUCT_UOM_CONVERSION` itself is owned there, not here. |
| [Work Master](08-work-master.md) | `OPERATION.time_conversion_id`/`.uom_id` (§9.2, moved from Product's `PRODUCT_WORK_UNIT` 2026-08-18) are FKs into this module's `TIME_CONVERSIONS`/`UNIT_OF_MEASUREMENTS`. Also already assumed (by [KPI & Reference Data](07-0-kpi-formula.md) and [Configuration Service](12-configuration-service.md)) to own a `UOM` entity of its own — unclear whether that's the same table as this module's `UNIT_OF_MEASUREMENTS`. See §9.6, T-3. |
| [KPI & Reference Data](07-0-kpi-formula.md) | References `DOWNTIME_REASON`/`REJECT_REASON` when asking whether it needs its own per-asset scoping layer on top of the join tables here (K-2/K-3 there). |

## 9. Entity specification

> 🟡 DRAFT.

### 9.1 `DOWNTIME_REASON` and `REJECT_REASON`

> **Downtime and reject are two separate taxonomies, not one branching `category`.**
> `DOWNTIME_REASON` and `REJECT_REASON` are separate masters with their own IDs and
> lifecycle — quality/reject causes never mix with downtime causes in the same table.
> `DOWNTIME_REASON.downtime_category` only distinguishes 3 coarse values
> (`unplanned`/`planned`/`small_stop`); whether a more detailed sub-category is also needed
> is `TBD` until `ops-domain` confirms — see T-2 below.

**`DOWNTIME_REASON`** — downtime-cause taxonomy:

| Field | Type | Notes |
|---|---|---|
| `downtime_reason_id` | internal ID | PK |
| `downtime_category` | enum | `unplanned` / `planned` / `small_stop` — replaces the old `is_planned` boolean; `small_stop` covers micro-stops that previously only existed in `shopfloor.md` prose, with no enum value of their own. For detected stops, the duration boundaries (below `min_stop_seconds` = not a stop; above `small_stop_max_seconds` = real downtime) are the [stop thresholds](12-configuration-service.md#confirmed-first-release-item-stop-thresholds-po-2026-10-01) (PO, 2026-10-01) |
| `code` | string | |
| `name` | string | |
| `created_at`, `updated_at`, `deleted_at` | timestamp tz | |

**Keys** (F-00 [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `downtime_reason_id` · Unique: — (`code`: T-7) · No overlap: —

**`REJECT_REASON`** — reject/scrap-cause taxonomy, a separate entity from `DOWNTIME_REASON`:

| Field | Type | Notes |
|---|---|---|
| `reject_reason_id` | internal ID | PK |
| `code` | string | |
| `name` | string | |
| `created_at`, `updated_at`, `deleted_at` | timestamp tz | |

**Keys** (F-00 [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `reject_reason_id` · Unique: — (`code`: T-7) · No overlap: —

> `REJECT_REASON` **has no category field at all** — flat code/name. **Since 2026-09-23 it is the
> only reject/defect list** — `QUALITY_DEFECT_CODE` (F-08 §9.7) was merged into it
> ([decision](../../../LOGS/decisions/2026-09-23-defect-code-merged-into-reject-reason.md)). Defect recording in Production points here (see
> [`shopfloor.md` §3.4](../../PRODUCTION/DOCS/02-monitoring.md#log-monitoring)), not
> `DOWNTIME_REASON`/`ASSET_STATE_LOG`.
>
> **Disposition is not on this master (T-6 closed 2026-09-24).** Scrap / rework / hold lives on the
> reject **actual** (`WORK_ORDER_OPERATION_DEFECT.disposition`), not on `REJECT_REASON`. Reason code is
> the slice key; disposition is the quantity fate. See
> [decision](../../../LOGS/decisions/2026-09-24-disposition-on-reject-actual.md).

### 9.2 `DOWNTIME_REASON_ASSET` and `REJECT_REASON_ASSET` — asset-scoped join tables

**`DOWNTIME_REASON_ASSET`** — join table, scoped per **asset instance**, not per
`ASSET_CLASS` (a different granularity from the old `applies_to_asset_class_id`):

| Field | Type | Notes |
|---|---|---|
| `downtime_reason_asset_id` | internal ID | PK. Permanent, never reused. Added 2026-10-01 ([keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)) |
| `downtime_reason_id` | FK → `DOWNTIME_REASON` | |
| `asset_id` | FK → `ASSET` (Equipment unit) | |
| `downtime_code`, `asset_tag` | string | Denormalized copies of the parent's codes — for readability, not the source of truth |
| `created_at`, `updated_at`, `deleted_at` | timestamp tz | |

**Keys** (F-00 [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `downtime_reason_asset_id` · Unique: — (pair: T-8) · No overlap: —

**`REJECT_REASON_ASSET`** — join table, same shape as `DOWNTIME_REASON_ASSET`:

| Field | Type | Notes |
|---|---|---|
| `reject_reason_asset_id` | internal ID | PK. Permanent, never reused. Added 2026-10-01 ([keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)) |
| `reject_reason_id` | FK → `REJECT_REASON` | |
| `asset_id` | FK → `ASSET` (Equipment unit) | |
| `reject_code`, `asset_tag` | string | Denormalized copies |
| `created_at`, `updated_at`, `deleted_at` | timestamp tz | |

**Keys** (F-00 [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `reject_reason_asset_id` · Unique: — (pair: T-8) · No overlap: —

> The final `DOWNTIME_REASON` and `REJECT_REASON` lists are `TBD` and must come from
> `ops-domain` — this is the single biggest factor in whether downtime/reject analysis is
> useful. The detailed 7-value category field that used to live on `REASON_CODE.category`
> is also `TBD` — unclear whether it's still needed on top of the coarser
> `downtime_category`, or fully replaced by free-text `code`/`name`.

### 9.3 `TIME_CONVERSIONS`

`TIME_CONVERSIONS` has these fields:

| Field | Type | Notes |
|---|---|---|
| `time_conversions_id` | internal ID | PK |
| `code` | string | |
| `name` | string | |
| `seconds_per_unit` | numeric | Required. The number of seconds this row's declared duration equals. The system derives it automatically — never a second, separately-stored, manually-entered figure. Replaces the earlier stray `time_conversions` string field (T-4, resolved below). |

**Keys** (F-00 [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `time_conversions_id` · Unique: — (`code`: T-7) · No overlap: —

Only known consumer: `OPERATION.time_conversion_id` ([Work Master §9.2](08-work-master.md#92-operation--one-step-of-a-routing-at-one-work-unit-with-its-standard),
moved from Product's `PRODUCT_WORK_UNIT` 2026-08-18), the FK the KPI operating-time
formula's cycle-time multiplier ultimately resolves through — resolving to a value in
**seconds**, the module's common base unit. This resolves the placement
question both [Product](06-product.md) and [Configuration Service](12-configuration-service.md)
previously left open: `TIME_CONVERSIONS` is defined here, not in either of those two modules.

**Declaring a row: quantity + a fixed base unit, never a raw seconds figure typed by
hand (PO, 2026-09-02).** A plant admin creating or editing a `TIME_CONVERSIONS` row picks
a whole quantity and one of a small, fixed set of base time units (second/minute/hour/day
— not their own table, not user-extensible, just the picker this one screen offers) and
the screen computes `seconds_per_unit = quantity × that unit's seconds` for them — "30" +
"minutes" → `1800`, "3" + "hours" → `10800`. Only the computed `seconds_per_unit` (plus
`code`/`name`, the row's own label) persists; the quantity/unit pair used to produce it is
not stored separately, so re-editing a row re-derives a friendly quantity/unit by picking
the largest whole unit that divides `seconds_per_unit` evenly (`10800` → "3" / hours), not
by remembering what was originally typed. This is why a row's `code`/`name` are free-text
labels (e.g. "Standard changeover"), not restricted to naming a base unit itself — a row
can represent any admin-declared duration, base units included ("Hours" = 1 × hour =
`3600`) or any other named duration ("Standard changeover" = 30 × minute = `1800`).

### 9.4 `MEASUREMENT_GROUP` and `UNIT_OF_MEASUREMENTS`

**`MEASUREMENT_GROUP` — new, added alongside `UNIT_OF_MEASUREMENTS` rather than as an
enum column on it.** Same shape as `ASSET_CLASS` ([Equipment Taxonomy §9.2](04-asset-ontology.md#92-asset_class--top-level-taxonomy)):
a top-level taxonomy, purely organizational, no attribute values of its own. It answers
one question, what kind of physical quantity does a unit measure, so the system can tell
"same dimension, different scale" (`kg` vs `g`, `pcs` vs `box`) apart from "genuinely
different dimension" (`kg` vs `pcs`) without a human reading the unit symbol.

| Field | Type | Notes |
|---|---|---|
| `measurement_group_id` | internal ID | PK |
| `code` | string | |
| `name` | string | e.g. "Count", "Mass", "Volume" |
| `valid_from`, `valid_to` | date | Yes, deactivate rather than hard-delete, same rule as every other master here |

**Keys** (F-00 [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `measurement_group_id` · Unique: — (`code`: T-7) · No overlap: —

**Why a table instead of an enum baked into the column type:** every other classification
this module owns, `DOWNTIME_REASON`, `REJECT_REASON`, is a real table for the same reason,
the list needs to grow through the normal master-data review process, not a schema
migration, and it needs `valid_from`/`valid_to` like everything else in FOUNDATION. An enum
literal can't be effective-dated or reasoned about the way a row can.

**Seed rows** (standard physical dimensions a packaging/manufacturing line actually
measures, still `TBD` against Molca's real UOM catalog, see T-5):

| `code` | Covers | Example `UNIT_OF_MEASUREMENTS.unit` rows |
|---|---|---|
| `count` | Discrete pieces | `pcs`, `box`, `case`, `carton` |
| `mass` | Weight | `kg`, `g`, `ton` |
| `volume` | Liquid/bulk fill | `L`, `mL` |
| `length` | Linear dimension | `m`, `cm`, `mm` |
| `other` | Anything not yet covered, a catch-all, not a resolved category | `TBD` |

`UNIT_OF_MEASUREMENTS` has these fields:

| Field | Type | Notes |
|---|---|---|
| `uom_id` | internal ID | PK |
| `code` | string | |
| `name` | string | |
| `unit` | string | The unit symbol/label itself (e.g. `kg`, `pcs`, `box`) — distinct from `code`/`name`, which is not further explained |
| `measurement_group_id` | FK → `MEASUREMENT_GROUP` | **New.** Two consumers already need this answer today: `ASSET_TAGS.uom_id` ([Equipment Taxonomy §9.7](04-asset-ontology.md#97-asset_tags--per-asset-tag--signal-declaration)) has to say whether a `total`/`good`/`reject` tag is counting pieces or weighing them, and `OPERATION`'s standard ([Work Master §9.2](08-work-master.md#92-operation--one-step-of-a-routing-at-one-work-unit-with-its-standard)) is per an item unit (`OPERATION.uom_id`) that must convert to the product's base UOM through `PRODUCT_UOM_CONVERSION`, or Performance silently divides the wrong things ([§9.2.1](08-work-master.md#921-item-unit-and-conversion-po-2026-09-28), 2026-09-28). |

**Keys** (F-00 [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `uom_id` · Unique: — (`code`: T-7) · No overlap: —

**Adding a new `UNIT_OF_MEASUREMENTS` row is ordinary master-data maintenance** (adding
"ton" as a new weight unit, or a plant-specific case-size label), the same as adding a new
`DOWNTIME_REASON`. **Adding a new `MEASUREMENT_GROUP` row is not** — it's a governed,
`foundation-domain`-reviewed addition, the same weight as adding a new `tag_role` or
`placement_role` value, because two plants disagreeing on what counts as one dimension
breaks the one thing this table exists to guarantee: that the system, not a human reading
a label, can tell two units apart.

> **A same-`measurement_group_id` pair converts here or in `PRODUCT_UOM_CONVERSION`; a
> cross-group pair (`kg` ↔ `pcs`) is never generic** — that only makes sense for one
> specific product's known unit weight, which is exactly why [Product](06-product.md)'s
> `PRODUCT_UOM_CONVERSION` is scoped by `product_id` rather than living as a flat factor in
> this table. `measurement_group_id` is what a future validation rule reads to require that
> scoping instead of allowing a bare, product-agnostic `kg`-to-`pcs` factor.

> **Possible overlap, not yet resolved — see §9.6, T-3.** [KPI & Reference Data](07-0-kpi-formula.md)
> and [Configuration Service](12-configuration-service.md) both assume a `UOM` entity lives
> in [Work Master](08-work-master.md). Whether that's the same table as
> `UNIT_OF_MEASUREMENTS` here, or genuinely different, is undecided — that call belongs to
> `foundation-domain`.

### 9.5 Rules

- Never hard-delete a row in any of the entities above — deactivate with
  `deleted_at`/`valid_to` per FOUNDATION's global rule (see
  [`00-foundation.md`](00-foundation.md) rule 3). Historical `ASSET_STATE_LOG`, defect, and
  cycle-time records may still point at a row that's no longer offered for new entry.
- `asset_id` on both join tables must reference an Equipment unit (`parent_asset_id IS
  NULL` on `ASSET`) — same rule Equipment Taxonomy enforces for `ASSET_PLACEMENT` (see
  [`04-asset-ontology.md` §9.6](04-asset-ontology.md#96-asset-to-work-unit-placement-rules)).
  This file does not re-derive that rule, only inherits it via the FK.

### 9.6 What's still unknown

| # | Question | Owner |
|---|---|---|
| T-1 | What are the real `DOWNTIME_REASON` and `REJECT_REASON` lists used today? (Also covers the old F-08 W-4 defect code list, merged 2026-09-23.) | `ops-domain` |
| T-2 | Does a more detailed sub-category still exist above the coarser 3-value `downtime_category`, or is that enum the whole taxonomy? | `ops-domain` |
| ~~T-3~~ | ~~Is `UNIT_OF_MEASUREMENTS` (this file) the same table as the `UOM` entity [KPI & Reference Data](07-0-kpi-formula.md) and [Configuration Service](12-configuration-service.md) already assumed lives in [Work Master](08-work-master.md), or genuinely different?~~ **Resolved: same table, owned here.** [`08-work-master.md`](08-work-master.md) §9 states it twice: *"UOM lives in Reference & Master Data"* (top-of-file note) and *"`UOM` is `UNIT_OF_MEASUREMENTS` in Reference & Master Data, not owned here"* (§9 preamble). Work Master, Product, and KPI tag mapping all FK into this file's `UNIT_OF_MEASUREMENTS` — there is no second table. | — |
| ~~T-4~~ | ~~Is the stray `time_conversions` string field on `TIME_CONVERSIONS` (§9.3) a genuine field or a modeling defect that should be dropped once confirmed against real Operations/Engineering data?~~ **Resolved: modeling defect, dropped.** The stray field is replaced with a numeric `seconds_per_unit` factor field (§9.3). The target/base unit is **seconds**, not the previously-undecided "TBD, implied hours." The converted value is always backend-computed as `raw_value × seconds_per_unit` — never manually entered as a second, separately-stored figure. | — |
| ~~T-6~~ | ~~Does `REJECT_REASON` need a `disposition` field?~~ **Resolved 2026-09-24:** **no** — disposition (`scrap`/`rework`/`hold`) is on the reject/actual (`WORK_ORDER_OPERATION_DEFECT`), not on the reason-code master. Optional UI default from reason is allowed; capture may override. See [decision](../../../LOGS/decisions/2026-09-24-disposition-on-reject-actual.md). | — |
| T-5 | Are the proposed `MEASUREMENT_GROUP` seed rows (`count`/`mass`/`volume`/`length`/`other`, §9.4) complete for Molca's real UOM catalog, or are there dimensions this list is missing? | Operations + `foundation-domain` |
| T-7 | **Keys (2026-10-01).** Uniqueness of `code` is not stated on `DOWNTIME_REASON`, `REJECT_REASON`, `TIME_CONVERSIONS`, `MEASUREMENT_GROUP` or `UNIT_OF_MEASUREMENTS` (§9.1–§9.4). Unique per tenant? Among rows with `deleted_at` null / active rows only (partial unique), or all rows? Not listed in their **Keys** lines until decided | `foundation-domain` / PO |
| T-8 | **Keys (2026-10-01).** May the same pair appear twice in `DOWNTIME_REASON_ASSET` (`downtime_reason_id`, `asset_id`) or `REJECT_REASON_ASSET` (`reject_reason_id`, `asset_id`) among rows with `deleted_at` null? Not stated (§9.2). If not, a partial unique index | `foundation-domain` / PO |

## Next step

T-3 (the possible naming/ownership overlap with Work Master's assumed `UOM`) should be
resolved before this module is promoted past draft — building two schemas for what might be
one table wastes engineering time and risks the two drifting apart.

