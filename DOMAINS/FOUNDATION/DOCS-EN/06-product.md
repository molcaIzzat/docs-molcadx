# F-06 — Product

> Working spec. `foundation-domain` should review this module before it's treated as
> settled. Entity spec status: 🟡 DRAFT.
>
> **2026-08-18 restructuring:** `PRODUCT_WORK_CENTER`, `PRODUCT_ROUTE_OVERRIDE`, and
> `PRODUCT_WORK_UNIT` — including the cycle-time/KPI-formula content and all of P-1, P-3,
> P-4, P-5, P-7 — moved to [Work Master](08-work-master.md) as `ROUTING`/`OPERATION`. This
> module now owns product **identity and physical/UOM attributes only**; routing, cycle
> time, and standard rate are Work Master's job. See Work Master §9 for that content.
>
> **2026-09-28 (PO):** `PRODUCT_CYCLE` retired (§9.3). Cycle time lives only on Work
> Master's `OPERATION`, whose `uom_id` now names the item the standard is per. Product keeps
> identity and physical facts only: Measurement (`PRODUCT_DETAIL`), Conversions
> (`PRODUCT_UOM_CONVERSION`, now read by the KPI conversion step) and History. See the
> [2026-09-28 decision](../../../LOGS/decisions/2026-09-28-work-master-per-domain-operation-uom.md).

**In short:** Product is what MolcaDx makes — its identity, physical attributes, and how
its quantities convert between units. **Where** it runs and **how fast** it's supposed to
run are now [Work Master](08-work-master.md)'s job (`ROUTING`/`OPERATION`), not this
module's.

## What this module is for

It answers: **"what is this product, and what are its physical/tracking/UOM attributes?"**
Everything about *where* a product runs and *how fast* is Work Master's `ROUTING`/
`OPERATION` (see [`08-work-master.md`](08-work-master.md)) — this module supplies the
`PRODUCT` identity those tables FK into, nothing more on that front.

## Why it matters — what goes wrong without it

| If you skip this | What happens |
|---|---|
| No stable `PRODUCT` identity | Nothing else — BOM, routing, tags, KPIs — has anything to FK into |
| No per-product UOM conversion | A product counted in "boxes" on one work unit and "kg" on another can't be reconciled without a manual fudge factor |
| No asset→product code mapping | A PLC that reports "which product is running" as a raw code can't be resolved back to a `PRODUCT` |

## How the entities connect

```
PRODUCT
  ├── PRODUCT_DETAIL              (weight envelope, dimensions, barcode, batch/shelf-life — 1:1)
  └── PRODUCT_UOM_CONVERSION      (from_uom → to_uom conversion factor, scoped to this product —
                                    also read by the KPI step that converts a counter to
                                    OPERATION.uom_id, 2026-09-28)

ASSET_PRODUCT_CODES (owned by Equipment Taxonomy, §9.7 there)
  └── product_id → PRODUCT        (resolves a PLC/SCADA-reported raw product code to a PRODUCT
                                    — this module supplies the FK target only, not the entity)

ROUTING / OPERATION (owned by Work Master, §9.1–§9.2 there — see 2026-08-18 note above)
  └── product_id → PRODUCT        (this module supplies the FK target only, not the entity —
                                    routing/cycle-time content lives entirely in Work Master now)
```

- **`PRODUCT`** — `product_id` (PK), `code`, `name`, `product_type` (raw material /
  packaging / consumable / semi-finished / finished good, 2026-09-30), `packaging_level`
  (primary / secondary, packaging only), `base_uom_id` (the default counting unit everything else,
  including `PRODUCT_UOM_CONVERSION`, converts from/to). The thing being made. **Also the
  entity Work Master used to call `ITEM`** — same entity, one name, see Work Master core
  concept 1.
- **`PRODUCT_DETAIL`** — physical and tracking attributes for this product: weight envelope
  (`min_weight`/`max_weight`/`standard_weight`), dimensions (`length`/`width`/`height`),
  `barcode`, and lot/shelf-life tracking flags (`is_batch_tracked`, `shelf_life_days`).
- ~~**`PRODUCT_CYCLE`**~~ — **retired 2026-09-28** (§9.3). It restated cycle time per item
  but nothing read it, and it could contradict `OPERATION`, where cycle time actually depends
  on the machine. Cycle time per item now lives only on Work Master's `OPERATION`
  (`cycle_time_value` + `time_conversion_id` + `uom_id`, [F-08 §9.2.1](08-work-master.md#921-item-unit-and-conversion-po-2026-09-28)).
- **`PRODUCT_UOM_CONVERSION`** — a from/to UOM conversion factor scoped to this specific
  product (a generic UOM table can't know that "1 case of Product A = 24 units" while
  "1 case of Product B = 36 units"). It carries a `product_id` FK, which is why it's owned
  here and not in [Reference & Master Data](05-reference-master-data.md), alongside
  `TIME_CONVERSIONS`/`UNIT_OF_MEASUREMENTS` — those two are shared reference masters with
  no product-specific column; this one is scoped to exactly one product and fails that
  module's own boundary rule. **Deliberately kept generic, not named/shaped as
  `PRODUCT_PACKAGING`** — packaging-level conversions (each/pack/case/pallet) are today's
  only real example, but a product-specific density conversion (e.g. "1 liter of Product X
  = 0.95 kg," which varies by product the same way packaging ratios do) needs the exact same
  shape. Narrowing the name to packaging now would exclude that later. **Read by KPI
  (2026-09-28):** when a counter's unit differs from `OPERATION.uom_id`, the operating-time
  step converts through this product's rows, and an `OPERATION` whose `uom_id` is not the base
  UOM cannot be saved without a conversion path here
  ([F-08 §9.2.1](08-work-master.md#921-item-unit-and-conversion-po-2026-09-28)).
- **`ASSET_PRODUCT_CODES`** — maps whatever raw product code a PLC/SCADA tag reports
  (`raw_value`) to a `PRODUCT`. This module does not own this entity — it's declared and
  owned by [Equipment Taxonomy §9.7](04-asset-ontology.md#97-asset_tags--per-asset-tag--signal-declaration),
  scoped per `ASSET_TAGS` row (`tag_id`, where `tag_role = product_code`), not directly
  per `ASSET`. `PRODUCT` only supplies the `product_id` FK target. This is how "which
  product is currently running" gets resolved from sensor data rather than typed in by an
  operator.

All time-variant fields here (conversion factors, in particular) follow the same rule as everywhere
else in FOUNDATION: a change closes the old row (`valid_to`) and opens a new one — see
[`00-foundation.md`](00-foundation.md)'s ID/code and versioning rules.

## How this resolves the KPI operating-time formula

**Moved to [Work Master §9.2](08-work-master.md#92-operation--one-step-of-a-routing-at-one-work-unit-with-its-standard)
(2026-08-18).** The full formula — `sensor_count`/`batch_size`/`count_basis` division,
`uom_id`/`time_conversion_id` conversion to seconds, the discrete-vs-continuous split, the
throughput-rate data-entry note — now lives there, since `OPERATION` (not anything in this
module) is the KPI source. This module no longer has any cycle-time content of its own
(`PRODUCT_CYCLE` retired 2026-09-28). What the formula does read here is
`PRODUCT_UOM_CONVERSION`, to turn a counter's unit into `OPERATION.uom_id`.

## Common pitfalls

1. **Looking for cycle time, routing, or `OPERATION` in this file.** They moved to
   [Work Master](08-work-master.md) (`ROUTING`/`OPERATION`, §9.1–§9.2) on 2026-08-18. This
   module only has `PRODUCT` identity, `PRODUCT_DETAIL`, and `PRODUCT_UOM_CONVERSION` now
   (`PRODUCT_CYCLE` retired 2026-09-28).
2. **Declaring cycle time per product.** Cycle time lives only on `OPERATION` (Work Master
   §9.2), per work unit, because it depends on the machine — one product can run 20 s / pack
   on the filler and 216 s / carton on the cartoner. A product-level figure has no machine
   and can only drift from the routing. What this module owns is the conversion between the
   units (`PRODUCT_UOM_CONVERSION`, 1 carton = 12 pack).
3. **Reading a raw PLC product code straight into reports** instead of resolving it
   through `ASSET_PRODUCT_CODES` — the same code can mean a different product on
   different assets.

## Related modules

| Module | Relationship |
|---|---|
| [Work Master](08-work-master.md) | Owns `ROUTING`/`OPERATION` (§9.1–§9.2) — both FK into this module's `PRODUCT`. Also uses `PRODUCT` as the entity it used to call `ITEM` (retired name, see Work Master core concept 1) |
| [Equipment Taxonomy](04-asset-ontology.md) | Owns `ASSET_PRODUCT_CODES` (§9.7) — its `product_id` FKs into this module's `PRODUCT`; this module does not own or redefine that entity |
| [Reference & Master Data](05-reference-master-data.md) | Owns `TIME_CONVERSIONS` (§9.3) and `UNIT_OF_MEASUREMENTS` (§9.4) — `PRODUCT.base_uom_id` and `PRODUCT_UOM_CONVERSION.from_uom_id`/`.to_uom_id` are FKs into those tables (`PRODUCT_CYCLE.uom_id`/`.time_conversion_id` retired with that entity, 2026-09-28) |
| [KPI & Reference Data](07-0-kpi-formula.md) | Reads Work Master's `OPERATION.cycle_time_value` as the operating-time formula's cycle-time multiplier, and this module's `PRODUCT_UOM_CONVERSION` to convert a counter's unit to `OPERATION.uom_id` (2026-09-28) |

## What's still unknown

| # | Question | Who needs to answer it |
|---|---|---|
| ~~P-2~~ | ~~Can a product have more than one `PRODUCT_CYCLE` row active at once, or is it one active row per UOM with `is_main_uom` picking the default?~~ **Resolved: multiple rows active at once, one per UOM** — `is_main_uom` only makes sense as a flag if there's more than one active row to default among. Exactly one row per product carries `is_main_uom = true`. **Moot 2026-09-28** — `PRODUCT_CYCLE` retired (§9.3). | — |
| ~~P-6~~ | ~~Is `PRODUCT.product_type`'s three-way split (`raw_material`/`semi_finished`/`finished_good`) enough, or does Molca need a finer-grained product family/category (its own master table, `ASSET_CLASS`/`ASSET_TYPE`-style) for reporting rollups?~~ **Resolved 2026-08-19: `product_type` stays a flat 3-value flag, no separate hierarchy master needed.** The FG → semi-finished → raw hierarchy the question was reaching for already exists as **BOM nesting** — a finished good's `BOM` lines are semi-finished products, whose own `BOM` lines are raw materials (Work Master core concept 2). That's owned by [Work Master](08-work-master.md), not this module — see that file's `BOM` note. **2026-09-30 (PO): the 3-value part is superseded** — `product_type` now has five values (`packaging`, `consumable` added) plus `packaging_level`; still no hierarchy master ([decision](../../../LOGS/decisions/2026-09-30-product-type-packaging-phantom-bom-tree.md)). | — |

> **P-1, P-3, P-4, P-5, P-7 moved to [Work Master](08-work-master.md) on 2026-08-18**, along
> with the tables they were about (`PRODUCT_WORK_CENTER`/`PRODUCT_ROUTE_OVERRIDE`/
> `PRODUCT_WORK_UNIT`). P-1, P-5, and P-7 are resolved there; P-3 is resolved by removal
> (the field it was about no longer exists); P-4 is still open, renumbered W-6. Not repeated
> here — see Work Master §9's "What's still unknown."
>
> The open questions on `ASSET_PRODUCT_CODES` (whether `asset_id`/`tag_id` scoping
> must be Equipment-unit-level only, a uniqueness constraint on `(asset_id, raw_value)`,
> and heartbeat/staleness detection) live as A-6 in
> [Equipment Taxonomy §9.8](04-asset-ontology.md#98-open-questions), where that entity is
> owned — not repeated here.

## 9. Entity specification

> 🟡 DRAFT.

### 9.1 `PRODUCT` — the thing being made

| Field | Type | Required | Notes |
|---|---|---|---|
| `product_id` | internal ID | Yes | Permanent, never reused |
| `code` | string | Yes | Business code — see [`00-foundation.md`](00-foundation.md)'s ID/code rules |
| `name` | string | Yes | |
| `product_type` | enum | Yes | `raw_material` / `packaging` / `consumable` / `semi_finished` / `finished_good` (five values since 2026-09-30, [decision](../../../LOGS/decisions/2026-09-30-product-type-packaging-phantom-bom-tree.md); same split as SAP ROH / VERP / HIBE / HALB / FERT). What the product is: bought raw material, bought packaging, bought consumable (not counted per unit), or made. Stays a flat flag, not a hierarchy — the FG/semi/raw hierarchy is BOM nesting, owned by [Work Master](08-work-master.md) (P-6, §9.6). **Phantom is not a type** — it is a flag on a semi-finished product's `BOM` ([F-08 §9.3](08-work-master.md#93-bom--from-what-for-one-product)) |
| `packaging_level` | enum | Conditional | `primary` (touches the product, e.g. the bag) / `secondary` (protects the primary, e.g. the carton, the tape). **Required when `product_type = packaging`, empty otherwise** — saving a packaging product without it, or a non-packaging product with it, is rejected. Added 2026-09-30 |
| `base_uom_id` | FK → `UNIT_OF_MEASUREMENTS` ([Reference & Master Data §9.4](05-reference-master-data.md#94-measurement_group-and-unit_of_measurements)) | Yes | The default unit this product is counted in. `PRODUCT_UOM_CONVERSION.from_uom_id` should normally match this — a conversion "from" something other than the base UOM is unusual, not forbidden |
| `valid_from`, `valid_to` | date | Yes | Deactivate, never hard-delete (§00 shared rule) — phase-out is closing `valid_to`, there is no separate `status`/`is_active` field, matching every other FOUNDATION master |

**Keys** (F-00 [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `product_id` · Unique: — (`code`: P-8) · No overlap: —

### 9.2 `PRODUCT_DETAIL` — physical & tracking attributes, 1:1 with `PRODUCT`

| Field | Type | Required | Notes |
|---|---|---|---|
| `product_detail_id` | internal ID | Yes | Permanent, never reused |
| `product_id` | FK → `PRODUCT` | Yes | One row per product (1:1) |
| `min_weight`, `max_weight`, `standard_weight` | numeric | Yes | The weight envelope for this product — the tolerance bounds a checkweigher's per-piece weight reading is classified against. Which `tag_role` that per-piece reading uses is open on docs-molcadx#60. A weigher's weight **running totals** use `tag_role = measured_total`, never `total`/`good`/`reject` ([F-04 §9.7](04-asset-ontology.md#97-asset_tags--per-asset-tag--signal-declaration), PO, 2026-10-02, prd-molcadx#24 item 3) |
| `weight_uom_id` | FK → `UNIT_OF_MEASUREMENTS` ([Reference & Master Data §9.4](05-reference-master-data.md#94-measurement_group-and-unit_of_measurements)) | Yes | **Added 2026-10-01 (PO).** The unit of `min_weight`, `max_weight` and `standard_weight` — must be in the *mass* measurement group (g, kg). Used to convert a reject entered by weight (F-07) and the weight of one unit at each step (F-08) ([decision](../../../LOGS/decisions/2026-10-01-open-items-wrap-up.md)) |
| `length`, `width`, `height` | numeric | No | Physical dimensions. Optional — only needed where packaging/logistics calculations (carton fill, pallet count) consume them; nothing in this module's own KPI scope reads them yet |
| `barcode` | string | No | GTIN/EAN or internal barcode, for scan-based identification at receiving/shopfloor |
| `is_batch_tracked` | boolean | Yes | Whether instances of this product must be tracked by lot/batch number downstream (quality/traceability). Default `false` |
| `shelf_life_days` | integer | No | Days from production before expiry. Null for products with no shelf life |
| `valid_from`, `valid_to` | date | Yes | |

**Keys** (F-00 [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `product_detail_id` · Unique: — · No overlap: one active row per `product_id` — "one row per product (1:1)", effective-dated

> **§9.3–9.5 retired 2026-08-18.** `PRODUCT_WORK_CENTER`, `PRODUCT_ROUTE_OVERRIDE`, and
> `PRODUCT_WORK_UNIT` used to live here. They moved to
> [Work Master §9.1–§9.2](08-work-master.md#9-entity-specification)
> as `ROUTING`/`OPERATION` — see this file's top-of-file note and "Related modules" above.

### 9.3 ~~`PRODUCT_CYCLE`~~ — retired 2026-09-28

**Retired 2026-09-28 (PO, [2026-09-28 decision](../../../LOGS/decisions/2026-09-28-work-master-per-domain-operation-uom.md)).** This entity restated
cycle time per item (per-pack, per-carton) at product level, with `uom_id`,
`time_conversion_id`, `cycle_time_value` and `is_main_uom`. It is retired because:

- **Nothing read it** — not the KPI calculation, not PRODUCTION.
- **It contradicted `OPERATION`.** Cycle time depends on the machine: the product could say
  18 s / pack while its routing said 20 s on one work unit and 18 s on another.
- **Its per-item purpose is covered by `OPERATION.uom_id`**, which now names the item the
  standard is per ([F-08 §9.2.1](08-work-master.md#921-item-unit-and-conversion-po-2026-09-28)).

`product_cycle_id` values are never reused. Existing rows are closed with `valid_to`, not
deleted. Section number kept so old links don't break; §9.4 onward are not renumbered.

### 9.4 `PRODUCT_UOM_CONVERSION` — from/to UOM conversion factor, scoped to one product

| Field | Type | Required | Notes |
|---|---|---|---|
| `product_uom_conversion_id` | internal ID | Yes | Permanent, never reused |
| `product_id` | FK → `PRODUCT` | Yes | Scopes this conversion to one specific product — the reason it's owned here, not in [Reference & Master Data](05-reference-master-data.md) alongside `TIME_CONVERSIONS`/`UNIT_OF_MEASUREMENTS` |
| `from_uom_id` | FK → `UNIT_OF_MEASUREMENTS` ([Reference & Master Data §9.4](05-reference-master-data.md#94-measurement_group-and-unit_of_measurements)) | Yes | |
| `to_uom_id` | FK → `UNIT_OF_MEASUREMENTS` ([Reference & Master Data §9.4](05-reference-master-data.md#94-measurement_group-and-unit_of_measurements)) | Yes | |
| `conversion_value` | numeric | Yes | The multiplier from `from_uom_id` to `to_uom_id` |
| `valid_from`, `valid_to` | date | Yes | |

**Keys** (F-00 [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `product_uom_conversion_id` · Unique: — · No overlap: — (same pair on one date: P-9)

**One row covers both directions (PO, 2026-09-28).** A row read forward multiplies by `conversion_value`
(`from_uom_id` → `to_uom_id`); read backward it divides (`to_uom_id` → `from_uom_id`). Example: the row
"1 carton = 12 pack" (`from` carton, `to` pack, `conversion_value` 12) also turns 1,200 pack into 100 carton.
Nobody has to enter the reverse row. If both directions exist for the same pair on the same date, the row
read **forward** is used, so the result never depends on rounding in the other row. This is the
conversion path rule [Work Master §9.2.1](08-work-master.md#921-item-unit-and-conversion-po-2026-09-28)
and the KPI conversion step rely on.

### 9.5 Entities referenced here but owned elsewhere

- **`ASSET_PRODUCT_CODES`** — owned by
  [Equipment Taxonomy §9.7](04-asset-ontology.md#97-asset_tags--per-asset-tag--signal-declaration).
  Its `product_id` field FKs into this module's `PRODUCT`; this module does not define or
  duplicate that table.
- **`ROUTING`**, **`OPERATION`** — owned by
  [Work Master §9.1–§9.2](08-work-master.md#9-entity-specification)
  (moved from this module 2026-08-18). Both FK into this module's `PRODUCT`.
- **`TIME_CONVERSIONS`**, **`UNIT_OF_MEASUREMENTS`** — owned by
  [Reference & Master Data §9.3–§9.4](05-reference-master-data.md#93-time_conversions).
  `PRODUCT_UOM_CONVERSION` (§9.4 above) FKs into `UNIT_OF_MEASUREMENTS` rather than
  redefining it (`PRODUCT_CYCLE`, §9.3, retired 2026-09-28).

### Ready for Performance — released routings only (PO, 2026-10-02, prd-molcadx#24 item 17)

A product is **ready for Performance** on a work unit on a date when it has a base unit (`base_uom_id`) **and** an
`OPERATION` on that work unit (directly, or as a station of a class-based step, [F-08 §9.2.2](08-work-master.md#922-operation_work_unit--which-stations-can-run-a-class-based-step-po-2026-09-30))
in force on that date, **on a routing whose `status = released`** ([F-08 §9.1](08-work-master.md#91-routing--a-product-can-run-at-this-work-center)).
A `draft` routing never counts: no job can use it, so its steps cannot give a Performance standard. A bought product (`raw_material`, `packaging`, `consumable`)
needs no operation step to count as ready.

Example: product `FG-1001` has routing version 1 `released` and version 2 `draft` at line L01. Only version 1's steps
decide readiness. A product whose only routing at L01 is a `draft` is **not ready** there.

### 9.6 Open questions

| # | Question | Owner |
|---|---|---|
| ~~P-2~~ | ~~Can a product have more than one `PRODUCT_CYCLE` row (§9.3) active at once, or is it one active row per UOM?~~ **Resolved: multiple, one per UOM, exactly one flagged `is_main_uom`.** **Moot 2026-09-28** — `PRODUCT_CYCLE` retired. | — |
| ~~P-6~~ | ~~Is `PRODUCT.product_type` (§9.1)'s three-way split enough, or does Molca need a dedicated product family/category master for reporting rollups?~~ **Resolved: no family/category master — the hierarchy is BOM nesting (FG's `BOM` lines are semi-finished, whose own `BOM` lines are raw material), owned by [Work Master](08-work-master.md) core concept 2.** **Reopened and resolved again 2026-09-30 (PO):** the three-way split was not enough — `packaging` and `consumable` added (five values), plus `packaging_level`; still no family master ([decision](../../../LOGS/decisions/2026-09-30-product-type-packaging-phantom-bom-tree.md)) | — |
| ~~P-10~~ | ~~Since routings have a `status` (2026-09-30), does a product whose only routing at the line is `draft` count as ready for Performance, or only one with a `released` routing?~~ **Resolved (PO, 2026-10-02, prd-molcadx#24 item 17):** released routings only — see "Ready for Performance" above | — |
| P-8 | **Keys (2026-10-01).** Uniqueness of `PRODUCT.code` (§9.1) is not stated. Unique per tenant? Per enterprise? Among active rows only, or all rows? Not listed in its **Keys** line until decided | `foundation-domain` / PO |
| P-9 | **Keys (2026-10-01).** May one product have two active `PRODUCT_UOM_CONVERSION` rows for the same (`from_uom_id`, `to_uom_id`) on one date? §9.4 only rules on the two opposite directions ("read forward wins"). If not, a No-overlap rule on (`product_id`, `from_uom_id`, `to_uom_id`) | `foundation-domain` / PO |

> P-1, P-3, P-4, P-5, P-7 moved to [Work Master](08-work-master.md) 2026-08-18 along with
> `PRODUCT_WORK_CENTER`/`PRODUCT_ROUTE_OVERRIDE`/`PRODUCT_WORK_UNIT` — see that file's §9
> "What's still unknown" (P-4 is there as W-6). `ASSET_PRODUCT_CODES`' own open
> questions are tracked as A-6 in
> [Equipment Taxonomy §9.8](04-asset-ontology.md#98-open-questions). Neither is repeated
> here.

## Next step

No open questions remain on this module except P-8 and P-9 (keys, 2026-10-01). P-10 (readiness with routing versions) was resolved 2026-10-02. P-1 through P-7 are all resolved or moved —
P-1/P-5/P-7 moved to [Work Master](08-work-master.md) as `ROUTING`/`OPERATION`, P-3 resolved
by removal, P-4 moved as W-6, P-2 and P-6 resolved in place (2026-08-18 and 2026-08-19).
