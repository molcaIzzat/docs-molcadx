# F-08 — Work Master

> Concepts + entity specification (§9). `ROUTING` / `OPERATION` are the 2026-08-18
> redesign. `BOM` is drafted from the old Indonesian Work Master
> §9 (ITEM renamed to `PRODUCT`; UOM lives in Reference & Master Data). Working spec.
> Entity spec status: 🟡 DRAFT.
>
> **Structural move, 2026-09-03 (PO decision, contest review):** `WORK_ORDER` and
> `WORK_ORDER_OPERATION` are **no longer defined in this document.** They moved to domain
> **PRODUCTION** (joining the Job Schedule module), because they are transactional/execution
> data (a concrete instance of "making something," written live by shopfloor) rather than
> master/recipe data ("how to make something"). Looking for `WORK_ORDER`? It now lives in
> [`DOMAINS/PRODUCTION/`](../../PRODUCTION/AGENTS.md). This move also carries B2 (missing
> `defect_code_id` FK on `WORK_ORDER_OPERATION`) and W-1/B4 (ERP vs MolcaDx as WO source) to
> `production-domain` to resolve — they are no longer FOUNDATION open questions. `ROUTING`,
> `OPERATION`, `BOM`, `BOM_LINE` **stay** in FOUNDATION as master/recipe
> data; `WORK_ORDER` references them by FK across the domain boundary, it does not redefine
> them. History is preserved in git and in
> [`LOGS/decisions/2026-09-03-foundation-contest-blockers.md`](../../../LOGS/decisions/2026-09-03-foundation-contest-blockers.md).
>
> **Licensing note, 2026-09-12:** this module's *data* stays owned by FOUNDATION, but its
> *license gate* is PRODUCTION — a tenant without Production licensed has nothing to route
> or bill-of-material for, so PLATFORM's License Manager checks Production entitlement, not
> FOUNDATION, before showing these screens. Data ownership and license gate are different
> questions; don't assume "FOUNDATION owns it" means "every tenant always sees it." See
> [`PLATFORM/DOCS-EN/01-license-manager.md`](../../PLATFORM/DOCS-EN/01-license-manager.md#module-license-gate--data-ownership).

**In short:** Work Master defines what the factory makes, what it's made from, and the
steps to make it — and it owns the one number (**standard cycle time**, on `OPERATION`)
that both OEE and scheduling depend on.

## What this module is for

It answers three questions about anything the factory makes: **what** is being made
(`PRODUCT`), **from what** (BOM — bill of materials), and **through what steps** (routing).

## Work Master per domain — the data stays where it is (PO, 2026-09-28)

The sidebar is grouped **by domain** ([UX 00 § App shell](../UX/00-ux.md#app-shell--sidebar-grouped-by-domain-po-decision-2026-09-28)).
Production's work master is **not** in the Production group: since 2026-09-30 its **BOM** and **Routing**
screens are **tabs on the Product detail page** (Measurement · Conversions · BOM · Routing · History), because
the data is shared and a recipe belongs to one product
([2026-09-30 decision](../../../LOGS/decisions/2026-09-30-bom-routing-as-product-tabs.md)). Maintenance's
**PM checklist** stays an item in the Maintenance group. There is **no "Work Master" menu item or tab**:
"Work Master" stays the module name (ISA-95 term). Shared masters (Product, Site hierarchy, Reference data, …)
sit at the top of the sidebar with no domain heading.
Unlike KPI, **the data shape differs per domain and is not generalized** into one entity:

| Domain | What its work master holds (where it is edited) | Owner |
|---|---|---|
| Production | `ROUTING` / `OPERATION` / `BOM` / `BOM_LINE` (§9 below) — **BOM** and **Routing** tabs on the Product detail page (2026-09-30) | FOUNDATION — stays here, because KPI, Inventory and Quality read it too (shared object model, [2026-09-10](../../../LOGS/decisions/2026-09-10-mom-domain-alignment.md)) |
| Maintenance | `PM_PROCEDURE` / `PM_PROCEDURE_STEP` — item **PM checklist** in the Maintenance group | MAINTENANCE — [M-02](../../MAINTENANCE/DOCS-EN/02-work-master.md), not moved |
| Quality | `TBD` — not modelled; no entity invented and no sidebar item until the Quality domain exists | — |
| Inventory | `TBD` — not modelled; no entity invented and no sidebar item until the Inventory domain exists | — |

Navigation only: it moves no entity and changes no owner. Screen split:
[UX 08](../UX/08-work-master.md#work-master-pages--bom-and-routing-on-product-detail-po-decision-2026-09-30).
A tenant without a Production license does not see the BOM and Routing tabs; a domain the tenant is not
licensed for shows as one locked group heading, its items hidden.
Record: [2026-09-28 decision](../../../LOGS/decisions/2026-09-28-work-master-per-domain-operation-uom.md), revised by the [2026-09-30 decision](../../../LOGS/decisions/2026-09-30-bom-routing-as-product-tabs.md).

## Why it matters — what goes wrong without it

| If you skip this | What happens |
|---|---|
| No written time standard | Performance can't be calculated — there's nothing to compare actual output against |
| Process order only lives in a supervisor's head | Scheduling can't be automated; when that person leaves, the knowledge leaves with them |
| Product definitions differ across documents | Component counts stop matching actual material usage |

## Core concepts

**1. `PRODUCT` is one entity, not three.** Raw material, work-in-progress, and finished
goods are the same entity with a type flag — because one process's output is the next
process's input. Splitting them into three tables forces data-copying at every handoff.
**Resolved 2026-08-18: this is the same entity as [Product](06-product.md)'s `PRODUCT`**,
not a separate `ITEM` — `PRODUCT.product_type` (`raw_material`/`packaging`/`consumable`/
`semi_finished`/`finished_good`, five values since 2026-09-30) already is this flag. Every reference to "item" elsewhere in this
document means `PRODUCT`; `ITEM` is retired as a name.
`BOM`/`ROUTING` FK into `PRODUCT`, owned by [Product](06-product.md), not into a table defined
here. `WORK_ORDER` (now PRODUCTION, see the note at the top of this document) also FKs into
`PRODUCT` the same way, across the domain boundary.

**2. BOM answers "from what."** A component list with quantities and a scrap factor,
needed to build one unit of a `PRODUCT`. It nests — a component can have its own BOM.
**This nesting is also the answer to [Product](06-product.md)'s former P-6:** a
finished good's `BOM` lines are semi-finished products, whose own `BOM` lines are raw
material — the FG → semi-finished → raw hierarchy falls out of `BOM` nesting per product,
not from `PRODUCT.product_type` or a separate family/category master.

**Multi-level is prepared, not required (PO, 2026-09-30).** A tenant does not have to declare a product
hierarchy: a single-level BOM (finished good → its materials) is valid. When a semi-finished line gets its
own BOM, the BOM tab's tree view ([UX 08](../UX/08-work-master.md)) shows the extra level with no other change.
A semi-finished product that is **never stocked** — it passes straight into the next step — has a
**phantom** BOM (`BOM.is_phantom`, §9.3). It is still `semi_finished`; phantom is a property of how its BOM is
used, not a product type ([2026-09-30 decision](../../../LOGS/decisions/2026-09-30-product-type-packaging-phantom-bom-tree.md)).

### Planned input — net recipe plus losses (PO, 2026-09-30)

BOM lines are the **net** recipe; planned losses are added on top ([decision](../../../LOGS/decisions/2026-09-30-bom-net-recipe-shrinkage-base-qty.md)):

```
planned qty of a component per 1 unit of the product
  = (qty_per_unit ÷ base_qty) × (1 + scrap_factor) ÷ Π (1 − planned_shrinkage of the line's step and each later step)
```

| | Varies by | Field |
|---|---|---|
| Component scrap | Material | `BOM_LINE.scrap_factor` |
| Shrinkage | Process at a work unit | `OPERATION.planned_shrinkage` |
| Reject | Actual event | `REJECT_REASON` — counted in PRODUCTION, the only loss in OEE Quality |

**Example.** Mix recipe, base 1,000 kg: A 700 kg, B 300 kg; A scrap 0.02. 100 kg of mix on Mixer 1
(shrinkage 0.05): A = 100 × 0.7 × 1.02 ÷ 0.95 = **75.16 kg**, B = 100 × 0.3 ÷ 0.95 = **31.58 kg**. Same BOM on
Mixer 2 (0.03): A = 73.61 kg, B = 30.93 kg.

**Edge cases.** `planned_shrinkage` empty → 0. A value ≥ 1 is rejected on save (would mean nothing comes out).
No routing for the product → no shrinkage applied (scrap only), flagged "No routing yet". **Lines tied to a step**
(`BOM_LINE.operation_id`, 2026-09-30) are inflated only by the shrinkage of their step and the steps after it; a
line without a step enters at the first step, so every step's shrinkage applies to it. Levels stay apart: the mix's shrinkage
sits on the mix's routing, not the pack's. Actual shrinkage = 1 − output ÷ input, calculated by PRODUCTION.

*Worked example:* see [a line across several work centers — biscuit example](#a-line-across-several-work-centers--biscuit-example-po-2026-09-30) below. (An Ajinomoto 250g example was removed 2026-10-01: its quantities looked gross, which conflicts with the net rule — [decision](../../../LOGS/decisions/2026-10-01-open-items-wrap-up.md).)

**3. Routing + Operation answer "through what."** **Resolved 2026-08-18 (formerly P-1,
tracked in [Product](06-product.md)):** `ROUTING` and `OPERATION` are the *same* routing
concept Product's `PRODUCT_WORK_CENTER`/`PRODUCT_ROUTE_OVERRIDE`/`PRODUCT_WORK_UNIT` used to
describe under different names — not two things. Those three tables are retired; their
content now lives here, as `ROUTING` (§9.1) and `OPERATION` (§9.2):

- **`ROUTING`** — `PRODUCT` × `WORK_CENTER`: "this product can run at this work center."
  This is the old `PRODUCT_WORK_CENTER`'s identity, without its coarse cycle-time field
  (see §9.1's note on why that field didn't survive the merge).
- **`OPERATION`** — one step within a `ROUTING`, at a specific `WORK_UNIT`, with a
  `step_number` (old `PRODUCT_ROUTE_OVERRIDE`'s job) **and** that step's cycle time or
  standard rate (old `PRODUCT_WORK_UNIT`'s job — `cycle_time_value`/`batch_size` for
  discrete/batch, `standard_speed_value`/`speed_uom_id` for continuous), plus **standard
  setup time** (changeover) and a standard **crew size**, which Product's tables never had.

**4. Standard cycle time is the single most influential number in the whole system.** It
shows up in two critical places: it's the numerator of **Performance** in OEE, and it's
the basis of **capacity** in scheduling. Because of that it **must be versioned over time**
— standards change as processes improve, and if a historical calculation used today's
latest version instead of what was actually in force back then, last month's OEE would
silently change every time the standard gets updated. Nobody could trust a report that
changes itself.

**5. Work order is the bridge from plan to transaction.** It turns a plan into an order:
this `PRODUCT`, this quantity, this time window. When released, **the routing and BOM
version get locked** so a later master-data change can't rewrite work that's already in
progress. `WORK_ORDER` itself is now defined in PRODUCTION (see the note at the top of this
document); this concept stays here because "locked at release" is a constraint on
FOUNDATION's own `ROUTING`/`BOM` — **the locking mechanism has no version-pin field yet
to lock onto, see the B3 open item under §9.1/§9.3 below.**

**6. Output is defined the same way everywhere.**
`total_output = good + scrap + rework`. A defective unit is still a *produced* unit — it
consumed machine time and material. Treating it as "not produced" makes Performance look
worse and Quality look better than reality.

### A line across several work centers — biscuit example (PO, 2026-09-30)

A `ROUTING` is one product at one work center (§9.1). A line that runs through several work centers is therefore
modelled as **one product per work center**, linked by the BOM ([decision](../../../LOGS/decisions/2026-09-30-line-across-work-centers-reject-weight.md)). Example data, not a customer spec.

```
Site hierarchy                        Products (BOM chain)                  Routing (one per product)
MIXING   Mixer 1 ┐                    Dough          semi_finished, kg      Dough @ Mixing
         Mixer 2 ┴─► WORK_UNIT_FLOW    ▲ 0.96 g per biscuit (net)
BAKING   Mold → Oven → Cooling        Baked biscuit  semi_finished, pcs     Baked biscuit @ Baking
         (EQUIPMENT_FLOW) ─► WORK_UNIT_FLOW   ▲ 40 pcs per pack
PACKING  Packer                       Biscuit X pack finished_good          Pack @ Packing
```

**Why one product per work center, not one product with three routings.**

- Each work center makes its own output, so OEE and cycle time sit on the product that really runs there. With
  one product, a mixer would carry a "pack" standard that does not exist.
- A shared dough (one dough → several biscuits) only works this way.
- Traceability and the future Inventory domain need a product per stage. Otherwise dough and baked biscuits
  have no lot and no stock of their own: supplier lot → dough lot → biscuit lot → pack lot.
- A stage that is **never stocked** but still has its **own work center** (the dough here) is **not** phantom:
  it needs its own jobs for its own OEE. `BOM.is_phantom` is for a stage with **no work center of its own**
  (e.g. a premix poured by hand into the mixer).

**Planning picks each work center's own output product** — Dough at Mixing, Baked biscuit at Baking, the pack at
Packing — never a raw material. Whether PRODUCTION creates the stage orders from the finished-good order
automatically is PRODUCTION's decision (open question in its planning doc). The quantities follow from BOM and
shrinkage: 5,000 packs → 200,000 biscuits → 200,000 × 0.96 g ÷ (1 − 0.04) = **200 kg** of wet dough.

**Routing steps are pre-filled from the work center's flow.** The order of machines inside a work center is
declared once in the site hierarchy (`EQUIPMENT_FLOW`, [F-01 §9.11](01-site-hierarchy.md)). Adding a product to a
work center pre-fills one `OPERATION` per work unit, in flow order (`step_number` follows the flow). Per step the
user sets only: **output unit** (`uom_id`), **cycle time or throughput**, **planned shrinkage**. Rules:

| Case | Rule |
|---|---|
| The product skips a machine | Untick that step for this product; the flow stays as it is for other products |
| Parallel machines (Mixer 1 and Mixer 2 both feed the Mold) | **One** step with a machine-class requirement (class Mixer); both stations are listed in `OPERATION_WORK_UNIT` (§9.2.2), each with an optional cycle-time override |
| The flow changes later (a machine is added) | Existing routings do not change by themselves. The product list shows "Flow changed — review routing"; saving the new step opens a new routing version |

**Weight of one unit at each step is derived, not declared.** "Wet" and "dry" are simply before and after the step
that has shrinkage. Nobody marks a work unit wet or dry.

```
weight of one unit leaving step k = PRODUCT_DETAIL.standard_weight ÷ Π (1 − planned_shrinkage of each later step)
```

| Baking routing | Output unit | Cycle time | Shrinkage | Weight of one unit (derived) |
|---|---|---|---|---|
| 1 Mold | punch | 1 s / punch | 0 | 1.00 g per piece (wet) · 20 g per punch |
| 2 Oven | pcs | … | **0.04** | 0.96 g (dry) |
| 3 Cooling | pcs | … | 0 | 0.96 g (dry) |

`standard_weight` is the finished weight of the product at the end of its own routing (0.96 g), in
`PRODUCT_DETAIL.weight_uom_id` (a mass unit, added 2026-10-01). The calculation converts it to the unit of the
reject or count as needed.

**Punching: cycle time per punch.** A cutting / punching step can use **punch** as its output unit (a count unit):
cycle time "1 s / punch" or throughput "60 punches per minute", the machine counter declared with
`ASSET_TAGS.count_basis = cycle`, `batch_size` left at 1. Performance at that step is then fully in punches — pieces
per punch are not needed. The **cycle time is the normal full speed** for that product (and knife, if knives
differ), not the speed the operator happens to set — otherwise Performance always reads 100%. To convert rejects in
kg (F-07), declare the **weight of one punch** (pieces only, no trim, wet) as a product conversion, e.g.
`1 punch = 20 g`. A count unit produced at one step only (like punch) is weighed at that step. With weight per punch
and weight per piece known, pieces per punch follow (20 g ÷ 1 g = 20). **Knife / tooling is not modelled (PO, 2026-10-01):** one cycle time per product; revisit when one product
runs with several knives at different speeds.

**How to measure `planned_shrinkage` — weigh test.** Weigh some pieces before the step and the same pieces after it:
100 g → 96 g gives 1 − 96 ÷ 100 = 0.04. Repeat and average. The same test gives `standard_weight` (0.96 g). QA / R&D
may already know it from moisture specs. Unknown → leave empty (0). Per product and per work unit (a thick dough and
an old oven lose more).

## How the entities connect

```
PRODUCT  (owned by Product, F-06 — retires the separate "ITEM" name)
├── PRODUCT_FLOW (one way of making it) — groups one BOM + its routings (§9.0)
├── BOM → BOM_LINE (component, qty, scrap factor, dispensing tolerance)
└── ROUTING                        (PRODUCT × WORK_CENTER — "runs at this work center")
      └── OPERATION                (PRODUCT × WORK_CENTER × WORK_UNIT × step_number —
                                     cycle_time_value/batch_size or standard_speed_value/
                                     speed_uom_id, + standard_setup_time, crew_size,
                                     planned_shrinkage, yield_min/max_pct, max_hold_time)
            ├── OPERATION_WORK_UNIT    (eligible stations of a class-based step, §9.2.2)
            ├── OPERATION_DEPENDENCY   (what a step waits for, §9.2.3)
            ├── OPERATION_PARAMETER    (settings the step runs within, §9.2.4)
            ├── OPERATION_INSTRUCTION  (ordered sub-steps, confirm flag, §9.2.5 — 2026-10-01)
            └── OPERATION_CHECK        (in-process checks the operator records, §9.2.6 — 2026-10-01)
BOM_LINE also carries: entry step (operation_id), dispensing tolerance (2026-10-01)

--- domain boundary: FOUNDATION ends here, PRODUCTION continues below ---

WORK_ORDER (PRODUCTION — FKs into FOUNDATION's PRODUCT, ROUTING, BOM; locks a
            ROUTING + BOM version at release time)
      → WORK_ORDER_OPERATION (PRODUCTION — FKs into FOUNDATION's OPERATION, WORK_UNIT,
                               SHIFT_INSTANCE; executed at a WORK_UNIT, in a SHIFT_INSTANCE)
            → good_qty / scrap_qty / rework_qty, split by REJECT_REASON (FOUNDATION, F-05)
```

`total_output = good_qty + scrap_qty + rework_qty` — this single definition feeds every
downstream metric.

`OPERATION` is now the KPI operating-time formula's cycle-time source — see
[`07-0-kpi-formula.md`](07-0-kpi-formula.md) and §9.2 below. It replaces
`PRODUCT_WORK_UNIT.cycle_time_value` everywhere that field used to be cited. It is also the
only cycle-time source: Product's `PRODUCT_CYCLE` was retired 2026-09-28 (see
[F-06 §9.3](06-product.md#93-product_cycle--retired-2026-09-28)). When the counter's unit
differs from `OPERATION.uom_id`, the KPI step converts through the product's
`PRODUCT_UOM_CONVERSION` rows (§9.2.1).

## Common pitfalls

1. **Standard cycle time without versioning** — historical calculations become unstable.
2. **Editing the routing of a work order that's already running** — shopfloor work stops
   matching its own instructions.
3. **Cycle time taken from ideal lab conditions** — Performance always looks bad, and
   operators stop trusting the number.
4. **Hiding under-plan production** — that gap is exactly the most valuable data for
   improvement.
5. **Free-text defect codes** — kills any ability to do Pareto analysis on Quality.
6. **Referencing the retired `ITEM`/`PRODUCT_WORK_CENTER`/`PRODUCT_ROUTE_OVERRIDE`/
   `PRODUCT_WORK_UNIT` names.** `ITEM` is `PRODUCT` ([Product](06-product.md), owned there);
   the other three are `ROUTING`/`OPERATION` (§9.1–§9.2 above, owned here) since the
   2026-08-18 restructuring. Older notes or diagrams using the old names haven't been
   updated everywhere yet — treat any hit on those names as stale.

## What's still unknown

| # | Question | Who needs to answer it |
|---|---|---|
| ~~W-1~~ | ~~Do work orders come from an external ERP, or get created in MolcaDx?~~ **Moved to PRODUCTION, 2026-09-03 (decision B4)** — `WORK_ORDER` is no longer defined in this document; this question travels with it. No longer a FOUNDATION open item. | `production-domain` |
| ~~W-2~~ | ~~Does Molca use multi-operation routing, or is one line = one process?~~ **Resolved: multi-operation**, already modeled — one `ROUTING` has many `OPERATION` rows, ordered by `step_number` (§9.2), inherited from Product's former `PRODUCT_ROUTE_OVERRIDE`. | — |
| W-3 | Is `standard_cycle_time` documented today? Where? | Operations |
| ~~W-4~~ | ~~What's the current list of `QUALITY_DEFECT_CODE`s?~~ **Moved 2026-09-23:** defect codes merged into `REJECT_REASON`; the real list is F-05 T-1 | — |
| ~~W-5~~ | ~~Does repaired rework count as good output?~~ **Moved to PRODUCTION, 2026-09-03** — this question is about `WORK_ORDER_OPERATION.good_qty`/`rework_qty`, both fields on the entity that moved (§9.6 note below). It travels with `WORK_ORDER_OPERATION`, not repeated here. | `production-domain` |
| ~~W-6~~ | ~~`OPERATION.uom_id`/`.time_conversion_id` pairing (§9.2) is not validated anywhere — should it be enforced (e.g. `uom_id` restricted to a time-unit subset, or a check that a matching `TIME_CONVERSIONS` row exists), or left as operational convention? **Inherited from Product's former P-4**, unresolved.~~ **Resolved 2026-09-28 (PO, [decision](../../../LOGS/decisions/2026-09-28-work-master-per-domain-operation-uom.md)):** the two fields no longer overlap. `time_conversion_id` is the only time unit; `uom_id` is the **item** unit the standard is per (pack, carton, kg). Validation is a `PRODUCT_UOM_CONVERSION` check at save — see [§9.2.1](#921-item-unit-and-conversion-po-2026-09-28). | — |
| ~~W-7~~ | ~~`OPERATION.standard_setup_time`/`.crew_size` (§9.2) — required or optional?~~ **Resolved 2026-09-30 (PO, issue #58):** both optional; setup time gets its unit (`setup_time_conversion_id`) | — |
| ~~W-9~~ | ~~`QUALITY_DEFECT_CODE` needs a `disposition` field~~ **Moved 2026-09-23 to F-05 T-6; closed 2026-09-24** — disposition is on the reject/actual, not on `REJECT_REASON` ([decision](../../../LOGS/decisions/2026-09-24-disposition-on-reject-actual.md)) | — |
| ~~W-8~~ | ~~No version identifier for a `WORK_ORDER` to pin to (B3).~~ **Resolved 2026-09-30 (PO, issue #58):** `version` + `status` on `ROUTING` and `BOM`, one row per version; the work order pins by `routing_id` / `bom_id` ([versions and status](#versions-and-status-po-2026-09-30)). PRODUCTION to drop its placeholders (PLN-Q6) | — |
| W-10 | **New 2026-10-01 (EBR).** Hold time **across routings**: dough made at Mixing must be molded at Baking within 2 hours — a different product and work center, so `OPERATION.max_hold_time` of the last Mixing step has no successor. Is this needed, and where does it live (on the consuming `BOM_LINE`? a shelf life on the semi-finished product?) | PO + Operations |
| W-11 | **New 2026-10-01.** Hold time per successor: with parallel steps, does a step ever need a **different** limit to each successor (Bake → Glaze 1 h, Bake → Print 4 h)? And is a **minimum** wait (dough resting, cooling before packing) needed? | Operations |
| W-12 | **New 2026-10-01.** Dispensing tolerance is symmetric ±. Do real recipes need asymmetric limits (−0 / +2%, never under-dose)? | Operations / QA |
| W-13 | **New 2026-10-01.** IPC frequency: is a frequency **by quantity** ("every 500 packs") needed? When one run holds several lots, is a `once` check per run or per lot? (Second half depends on PRODUCTION's lot model) | Operations + `production-domain` |
| W-14 | **New 2026-10-01.** Instructions: maximum text length, attachments (picture, SOP document link), more than one language? | PO |
| W-15 | **New 2026-10-01.** Yield on a step whose output is counted (pieces) while its loss is mass (oven): is a yield in pieces enough, or is a mass yield needed too (which needs a weight per piece at that step)? | PO + QA |
| W-16 | **New 2026-10-01, proposed by `foundation-domain`, not confirmed by PO.** Lines dispensed out of recipe ratio: is the theoretical output set by the limiting component (smallest per-line figure, common pharma rule), or another rule? | PO + QA |
| W-17 | **New 2026-10-01, proposed by `foundation-domain`, not confirmed by PO.** A change to `dispense_tolerance_*` on a released BOM: new BOM version (`BOM_LINE` has no effective dates), or make the tolerance effective-dated like `OPERATION_PARAMETER`? | PO |
| ~~W-18~~ | ~~**Keys (2026-10-01).** Not stated, so not in the **Keys** lines: (a) is (`routing_id`, `step_number`) unique among `OPERATION` rows on any date, now that parallel machines are one class-based step and parallel steps use `OPERATION_DEPENDENCY`? (b) is a duplicate (`operation_id`, `predecessor_operation_id`) pair in `OPERATION_DEPENDENCY` rejected? (c) may one `BOM` list the same `component_product_id` on two lines (e.g. entering at two steps)?~~ **Closed (PO, 2026-10-02, prd-molcadx#24 item 18):** dated `OPERATION` rows of one step share a stable `step_id`; step child tables key on `step_id`, not `operation_id` (§9.2 "Step identity"). `OPERATION`'s No-overlap is one active row per `step_id`. Sub-questions (a)–(c) were not decided and move to W-20 | — |
| W-20 | **New 2026-10-02 (carried from W-18).** Still not stated, so not in the **Keys** lines: (a) is (`routing_id`, `step_number`) unique among active `OPERATION` rows on any date (different `step_id`s with one number)? (b) is a duplicate (`step_id`, `predecessor_step_id`) pair in `OPERATION_DEPENDENCY` rejected? (c) may one `BOM` list the same `component_product_id` on two lines (e.g. entering at two steps)? `TBD — perlu konfirmasi PO` | `foundation-domain` / PO |
| W-21 | **New 2026-10-02.** `BOM_LINE.operation_id` (§9.4) names the step a line enters or comes out at. It points at one dated `OPERATION` row, so it has the same problem `step_id` fixed for step child tables (§9.2). Should it become `BOM_LINE.step_id`? `TBD — perlu konfirmasi PO` | `foundation-domain` / PO |
| W-19 | **Keys (2026-10-01).** `BOM.valid_from`/`valid_to` says "ranges must not overlap for the same product", but since wave 2 several flows of one product are active side by side and [versions and status](#versions-and-status-po-2026-09-30) says one released version **per flow** per date. Is the per-product note outdated (the rule is per `flow_id`)? The **Keys** line uses the per-flow rule | `foundation-domain` / PO |

**Not in scope of the 2026-10-01 EBR step detail** ([decision](../../../LOGS/decisions/2026-10-01-work-master-ebr-step-detail.md)):
**per-step sign-off / second-person verification** (depends on GitHub issue #62, e-signature) and a **line-clearance
gate** before a step. Both are deferred until the PO confirms pharma as a target market. No field is reserved for them.

> ~~P-3~~ (Product's former question — does the coarse work-center-level cycle time ever
> act as a fallback for a missing per-work-unit row) **is resolved by this restructuring,
> not answered**: `ROUTING` no longer carries a cycle-time field at all (see §9.1's note).
> `OPERATION` is now the sole source, at the work-unit level — there is nothing left to be
> a fallback *for*.

## 9. Entity specification

> 🟡 DRAFT. `ITEM` is `PRODUCT` (F-06). Do not add a second item table. `UOM` is
> `UNIT_OF_MEASUREMENTS` in [Reference & Master Data](05-reference-master-data.md), not
> owned here.

### 9.0 `PRODUCT_FLOW` — one way of making a product (PO, 2026-09-30)

A product can be made in more than one way — e.g. a tablet by direct compression, dry granulation or wet
granulation. Each way uses **different materials and steps**, so each needs its own BOM **and** its own routings,
all active at the same time. A **flow** groups them ([decision](../../../LOGS/decisions/2026-09-30-work-master-wave-2-flows-parameters.md)). Same idea as SAP's production
version and ISA-95's alternative work masters.

| Field | Type | Required | Notes |
|---|---|---|---|
| `product_flow_id` | internal ID | Yes | Permanent, never reused |
| `product_id` | FK → `PRODUCT` | Yes | |
| `flow_code` | string | Yes | Unique per product (`WET-GRAN`) |
| `flow_name` | string | Yes | "Wet granulation" |
| `is_primary` | boolean | Yes | The flow a work order uses unless the planner picks another. **Exactly one** primary per product on any date |
| `status` | enum | Yes | `draft` / `released` / `retired`. A work order can pick only a `released` flow |
| `valid_from`, `valid_to` | date | Yes | Deactivate, never hard-delete |

**Keys** (F-00 [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `product_flow_id` · Unique: (`product_id`, `flow_code`) — "unique per product" · No overlap: exactly one `is_primary` row per `product_id` on any date

- **One flow = one BOM + its routings** (one routing per work center the flow passes through): `BOM.flow_id` and
  `ROUTING.flow_id` point here.
- **Every product has at least one flow.** A product created without choosing one gets a flow "Standard"
  (`is_primary = true`) automatically; existing products and their BOM / routings are moved into it. A product
  made only one way never sees the word "flow".
- **The work order picks the flow** (default = primary); the flow decides which BOM and routings apply. How
  PRODUCTION stores that choice is its call (PLN-Q7).
- **Not modelled:** a path that changes **during** a batch based on a result ("too wet → dry again"). That is
  execution logic — PRODUCTION / Workflow Engine, later.

### 9.1 `ROUTING` — a product can run at this work center

| Field | Type | Required | Notes |
|---|---|---|---|
| `routing_id` | internal ID | Yes | Permanent, never reused |
| `product_id` | FK → `PRODUCT` ([Product §9.1](06-product.md#91-product--the-thing-being-made)) | Yes | |
| `work_center_id` | FK → `WORK_CENTER` ([Site Hierarchy §9.5](01-site-hierarchy.md)) | Yes | Which work center this product can run at |
| `flow_id` | FK → `PRODUCT_FLOW` (§9.0) | Yes | **Added 2026-09-30 (wave 2).** The flow this routing belongs to. Its product must be the flow's product |
| `enforce_sequence` | boolean | Yes, default `false` | **Added 2026-09-30 (wave 2).** `true` = at execution the steps **must** be done in their order (EBR "step procedure mandatory"). FOUNDATION only declares it; the blocking rule is PRODUCTION's (PLN-Q7) |
| `version` | integer | Yes | **Added 2026-09-30 (W-8).** 1, 2, 3… per `flow_id` + `work_center_id`. Each version is its own row — a new version is a new `routing_id`. See [versions and status](#versions-and-status-po-2026-09-30) |
| `status` | enum | Yes | **Added 2026-09-30 (W-8).** `draft` (editable, no job can use it) / `released` (usable, read-only — a structural change opens the next version) / `retired` (closed, `valid_to` set). IEC 62264-2 §6.1.2 |
| `is_primary` | boolean | Yes, default `false` | **Added 2026-09-30.** The default routing for this flow at this work center, when the flow has more than one there. At most **one** primary per `flow_id` + `work_center_id` on any date |
| `valid_from`, `valid_to` | date | Yes | Deactivate, never hard-delete (§00 shared rule) |

**Keys** (F-00 [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `routing_id` · Unique: (`flow_id`, `work_center_id`, `version`) — versions numbered 1, 2, 3… per `flow_id` + `work_center_id` · No overlap: at most one `is_primary` row per (`flow_id`, `work_center_id`) on any date; at most one `released` version per (`flow_id`, `work_center_id`) on any date ([versions and status](#versions-and-status-po-2026-09-30)); at most one `draft` routing per `flow_id` (PO, 2026-10-02, prd-molcadx#24 item 19) — per flow or per flow + work center: [versions and status](#versions-and-status-po-2026-09-30)

**No cycle-time field here — deliberately.** The old `PRODUCT_WORK_CENTER` carried a coarse,
work-center-level `work_center_cycle_time` alongside this same identity. That field did not
survive the 2026-08-18 merge: `OPERATION` (§9.2) is now the only cycle-time source, at the
finer work-unit level, so there is nothing left for a coarse rollup to be a fallback for
(former P-3, resolved by removal — see "What's still unknown" above). `ROUTING` is pure
identity: this product runs at this work center, full stop; the *how fast* and *in what
order* live on `OPERATION`. **Versioned since 2026-09-30 (W-8 closed):** each version is its own row with
`version` + `status`, so a `WORK_ORDER` (PRODUCTION) pins a version simply by its `routing_id` — see
[versions and status](#versions-and-status-po-2026-09-30).

### 9.2 `OPERATION` — one step of a routing, at one work unit, with its standard

One row = one `WORK_UNIT` in a `ROUTING`'s sequence, carrying that step's cycle time (or
standard rate) and standard setup/crew. This merges what used to be two separate Product
tables — `PRODUCT_ROUTE_OVERRIDE` (sequencing) and `PRODUCT_WORK_UNIT` (cycle time) — into
one, plus two fields (`standard_setup_time`, `crew_size`) neither of those tables had.

| Field | Type | Required | Notes |
|---|---|---|---|
| `operation_id` | internal ID | Yes | Permanent, never reused. Identifies **one dated row** of a step: a standard change closes this row and opens a new one with a new `operation_id` |
| `step_id` | internal ID | Yes | **Added 2026-10-02 (PO, 2026-10-02, prd-molcadx#24 item 18).** The **step's** stable identity. Every dated row of the same step shares one `step_id`; a standard change (new `operation_id`) keeps it. Permanent, never reused. All rows of one `step_id` have the same `routing_id`. Tables that belong to a step point at `step_id`, not `operation_id` — see "Step identity" below |
| `routing_id` | FK → `ROUTING` (§9.1) | Yes | Which product/work-center pairing this step belongs to |
| `work_unit_id` | FK → `WORK_UNIT` ([Site Hierarchy §9.6](01-site-hierarchy.md)) | Conditional | This step's specific station — inherited from `PRODUCT_ROUTE_OVERRIDE`. **Required unless `required_work_unit_class_id` is set** (2026-09-30); then the eligible stations are listed in `OPERATION_WORK_UNIT` (§9.2.2) and this field stays empty |
| `required_work_unit_class_id` | FK → `WORK_UNIT_CLASS` ([Site Hierarchy §9.10](01-site-hierarchy.md)) | No | **Added 2026-09-30 — machine-class requirement** (IEC 62264-2 §6.1.9 equipment class, mapped to the work-unit class). "Any Mixer can run this step." The step's `cycle_time_value` is the class default; a station can override it in `OPERATION_WORK_UNIT` |
| `step_name` | string | Yes | **Added 2026-09-30.** Readable name of the step ("Mix", "Bake", "Cool"). Pre-filled from the work unit's name when the routing is pre-filled from the flow |
| `step_type` | string | No | **Added 2026-09-30; free text since 2026-10-01 (PO).** What kind of work the step does, typed by the user ("Mixing", "Baking", "Quality check"). The input **suggests step types already used in the tenant**, so the same kind of step keeps the same name across products; a new value can still be typed. **No system logic reads it.** A step counts for Performance when it has a standard (`cycle_time_value` or `standard_speed_value`). Replaces the process library (`PROCESS`, dropped 2026-10-01 before merge) |
| `step_number` | integer | Yes | This work unit's position in the routing's sequence — inherited from `PRODUCT_ROUTE_OVERRIDE`. **Since 2026-09-30 pre-filled from the work center's `EQUIPMENT_FLOW` order**; parallel **machines** are one class-based step (§9.2.2), parallel **steps** use `OPERATION_DEPENDENCY` (§9.2.3) ([line across work centers](#a-line-across-several-work-centers--biscuit-example-po-2026-09-30)) |
| `cycle_time_value` | numeric | No | **Required for discrete/batch work units, not applicable for continuous** — see the type split below. Time to produce `batch_size` items of `uom_id`, in `time_conversion_id`'s time unit — e.g. `20` + seconds + `pack` reads "20 seconds / pack". **The KPI operating-time formula's cycle-time multiplier** — see [`07-0-kpi-formula.md`](07-0-kpi-formula.md). A user may instead type a throughput rate (e.g. "500 per hour," "hour" picked via `time_conversion_id`); the rate is per `uom_id` item ("500 packs per hour"), and the system derives `cycle_time_value` from that rate and `batch_size` at entry time — only `cycle_time_value` is persisted, no separate stored rate field. **Saved as typed (PO, 2026-09-28, [2026-09-28 decision](../../../LOGS/decisions/2026-09-28-work-master-per-domain-operation-uom.md)):** the rate keeps the time unit the user picked — `cycle_time_value = batch_size ÷ rate` in that unit (`batch_size = 1`: "500 per hour" → `1/500` = `0.002`) and `time_conversion_id` = that unit (hour); **no normalisation to seconds** (seconds appear only at calculation time, via `TIME_CONVERSIONS.seconds_per_unit`). **Precision (PO, 2026-09-28, [decision](../../../LOGS/decisions/2026-09-28-work-master-per-domain-operation-uom.md)):** `cycle_time_value` keeps **up to 6 decimal places** — the same limit as `PRODUCT_UOM_CONVERSION.conversion_value`. A derived rate is rounded half-up to 6 places (e.g. "700 per hour" → 0.001429 hour; "500 per hour" → 0.002 hour, exact). |
| `uom_id` | FK → `UNIT_OF_MEASUREMENTS` ([Reference & Master Data §9.4](05-reference-master-data.md#94-measurement_group-and-unit_of_measurements)) | No | **Required for discrete/batch, not applicable for continuous.** **The item unit the standard is per** — e.g. `pack`, `carton`, `kg`. Never a time unit; the time unit is `time_conversion_id` only. **Changed 2026-09-28 (PO, resolves W-6):** this field used to be described as the time unit, which duplicated `time_conversion_id` and left no field saying *what item* the cycle time is per. May differ from `PRODUCT.base_uom_id` and from the counter tag's `ASSET_TAGS.uom_id` — machines on one routing count in different units (a filler counts packs, a cartoner counts cartons). Save rule and conversion: [§9.2.1](#921-item-unit-and-conversion-po-2026-09-28) |
| `time_conversion_id` | FK → `TIME_CONVERSIONS` ([Reference & Master Data §9.3](05-reference-master-data.md#93-time_conversions)) | No | **Required for discrete/batch, not applicable for continuous.** **The only time unit on this row.** Converts the raw `cycle_time_value` × count figure to seconds, the module's common base unit. The factor lives on `TIME_CONVERSIONS.seconds_per_unit`; the conversion is computed automatically by the backend, not entered as a separate value |
| `batch_size` | integer | No | **Discrete/batch only.** Default 1. How many units one `cycle_time_value` duration corresponds to. Only relevant to the formula when the resolved product-code tag's `ASSET_TAGS.count_basis` ([Equipment Taxonomy §9.7](04-asset-ontology.md#97-asset_tags--per-asset-tag--signal-declaration)) is `'unit'` — the raw per-unit sensor count is first converted to `uom_id` items (§9.2.1), then divided by this before multiplying by `cycle_time_value`. When `count_basis = 'cycle'`, this field isn't part of the operating-time calculation at all |
| `standard_speed_value` | numeric | No | **Continuous work units only.** The target/standard rate for this product at this work unit (e.g. 500 kg/hour) — the continuous-flow equivalent of `cycle_time_value`, rate-based instead of duration-based. Compared against actual performance via either a `speed`-role tag's direct reading, or `runtime × standard_speed_value` (theoretical output) vs. a `total`/`good`-role tag's actual count — whichever tags the asset has. The comparison itself is a KPI-layer concern, not computed here |
| `speed_uom_id` | FK → `UNIT_OF_MEASUREMENTS` ([Reference & Master Data §9.4](05-reference-master-data.md#94-measurement_group-and-unit_of_measurements)) | No | **Continuous work units only.** The rate unit `standard_speed_value` is recorded in (e.g. kg/hour, units/min) — must match the unit the corresponding `speed`-role tag reports in |
| `standard_setup_time` | numeric | No | Standard changeover time for this operation. New field — neither Product table had it. Optional; empty = no setup standard (W-7 closed 2026-09-30) |
| `setup_time_conversion_id` | FK → `TIME_CONVERSIONS` ([Reference & Master Data §9.3](05-reference-master-data.md#93-time_conversions)) | Conditional | **Added 2026-09-30 (W-7).** The time unit of `standard_setup_time` ("15 minutes"). Required when `standard_setup_time` is set |
| `crew_size` | integer | No | Standard crew size for this operation. New field — neither Product table had it. Optional; empty = not tracked (W-7 closed 2026-09-30) |
| `planned_shrinkage` | numeric (fraction, 0 ≤ x < 1) | No | **Added 2026-09-30.** Mass the process itself is expected to lose at this step on this work unit — evaporation, moisture, crystallisation. `0.05` = 5%. Empty = 0. Not a reject (no reason code, not in OEE Quality) and not component scrap (that is `BOM_LINE.scrap_factor`). Differs per work unit for the same product and recipe (Mixer 1 5%, Mixer 2 3%). Used only to plan input — see [planned input](#planned-input--net-recipe-plus-losses-po-2026-09-30); actual shrinkage is calculated by PRODUCTION, not stored here ([decision](../../../LOGS/decisions/2026-09-30-bom-net-recipe-shrinkage-base-qty.md)) |
| `yield_min_pct`, `yield_max_pct` | numeric (percent) | No | **Added 2026-10-01 (PO, EBR).** Allowed range of the step's **actual yield**, in percent of its theoretical output — definition, example and edge cases in [§9.2.7](#927-yield-limits-and-hold-time-po-2026-10-01-ebr). Both empty = no yield check. Either may be set alone (one-sided). `0 ≤ yield_min_pct ≤ yield_max_pct`; `yield_max_pct` may be above 100 (a step can gain mass, e.g. water in granulation). A standard change (effective-dated) |
| `max_hold_time` | numeric | No | **Added 2026-10-01 (PO, EBR).** Longest allowed wait between the **end of this step** and the **start of each step that follows it** ([§9.2.7](#927-yield-limits-and-hold-time-po-2026-10-01-ebr)). Must be > 0. Empty = no limit. A standard change (effective-dated) |
| `hold_time_conversion_id` | FK → `TIME_CONVERSIONS` ([Reference & Master Data §9.3](05-reference-master-data.md#93-time_conversions)) | Conditional | **Added 2026-10-01 (PO, EBR).** Time unit of `max_hold_time` ("2 hours"). Required when `max_hold_time` is set — same pattern as `setup_time_conversion_id` |
| `valid_from`, `valid_to` | date | Yes | A change closes the old row and opens a new one — a shift that ran under the old value must keep reading it at its own `business_date` (§00 shared rule) |

**Keys** (F-00 [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `operation_id` · Unique: — (`step_number`: W-20) · No overlap: one active row per `step_id` on any date (PO, 2026-10-02, prd-molcadx#24 item 18)

**Step identity (PO, 2026-10-02, prd-molcadx#24 item 18).** `OPERATION` is effective-dated, so one step is several rows over time (20 s / pack until
30 Sep, 18 s / pack from 1 Oct). A child row keyed on `operation_id` would point at one of those rows only, and would
be orphaned the day the standard changes. So:

- Every dated row of one step carries the same `step_id`. The row in force on a date is the one with that `step_id`
  whose `valid_from` ≤ date and `valid_to` empty or later.
- Tables that belong to a step — `OPERATION_WORK_UNIT` (§9.2.2), `OPERATION_DEPENDENCY` (§9.2.3),
  `OPERATION_PARAMETER` (§9.2.4), `OPERATION_INSTRUCTION` (§9.2.5), `OPERATION_CHECK` (§9.2.6) — key on `step_id`.
  Their field was named `operation_id` until 2026-10-02.
- Example: step "Mix" has `step_id` S-7. Row op-41 (600 s / batch, to 30 Sep) and row op-58 (540 s / batch, from
  1 Oct) both carry S-7. Its parameter "Mixing time" points at S-7 and applies on both sides of the change.
- `BOM_LINE.operation_id` (§9.4) also points at a step but is a BOM child, not a step child. Whether it moves to
  `step_id` too: W-21.

**`step_number` is not the same fact as `WORK_UNIT_FLOW`** ([Site Hierarchy
§9.12](01-site-hierarchy.md#912-work_unit_flow--position-topology-across-work_centers)).
`step_number` orders one `PRODUCT`'s stations within one `ROUTING` — a per-product plan.
`WORK_UNIT_FLOW` records which `WORK_UNIT` is physically upstream/downstream of another,
a fixed layout fact true regardless of which product is running. A two-station Quality
derivation or an auxiliary-equipment link reads `WORK_UNIT_FLOW`, not `step_number` — do
not derive one from the other.

**Which field set applies is decided by `WORK_UNIT`'s owning `WORK_CENTER.type`**
([Site Hierarchy §9.5](01-site-hierarchy.md)):

- **`production_line`/`process_cell` (discrete/batch)** — `cycle_time_value` + `batch_size`.
- **`production_unit` (continuous)** — `standard_speed_value` + `speed_uom_id`.

Exactly one set applies per row, depending on the work unit's type; the other set's fields
are left null. `storage_zone` work units are not expected to carry an `OPERATION` row.

#### 9.2.1 Item unit and conversion (PO, 2026-09-28)

`uom_id` says which item the standard is per; `time_conversion_id` says which time unit the
number is in. "20 seconds / pack" is `cycle_time_value = 20`, `time_conversion_id` → seconds,
`uom_id` → `pack`. Weight units work the same way ("0.4 seconds / kg" is `uom_id` → `kg`) —
no special case. Record: [2026-09-28 decision](../../../LOGS/decisions/2026-09-28-work-master-per-domain-operation-uom.md).

**Converting between item units.** The only conversion source is the product's own
[`PRODUCT_UOM_CONVERSION`](06-product.md#94-product_uom_conversion--fromto-uom-conversion-factor-scoped-to-one-product)
rows. A **conversion path** between two units of one product is: the same unit (no
conversion); one row between them, read forward (`× conversion_value`) or backward
(`÷ conversion_value`); or two such rows joined through `PRODUCT.base_uom_id`. A row counts
only if it is active on the date asked about (`valid_from` ≤ date, `valid_to` null or later).

**Save rule.** On save, if `uom_id` ≠ `PRODUCT.base_uom_id` of the routing's product, a
conversion path between `uom_id` and the base UOM must exist, active on the operation's
`valid_from`. Otherwise the save is blocked with:

> "Cannot save: there is no unit conversion between \<uom_id unit\> and \<base UOM unit\> for
> product \<product code\> on \<valid_from\>. Add it on the product's Conversions tab, then save
> again."

**Worked example.** Product conversion: 1 carton = 12 pack (base UOM `pack`).

| Step | Work unit | Standard | Counter tag reports |
|---|---|---|---|
| 10 | WU_01 (filler) | 20 s / pack | packs |
| 20 | WU_02 (cartoner) | 216 s / carton | packs |

Counter at WU_02 reports **1,200 pack** (`count_basis = unit`, `batch_size = 1`):
1,200 ÷ 12 = **100 carton** → 100 × 216 s = **21,600 s** ideal operating time.

**Order of the operating-time computation** (discrete/batch; formula home:
[F-07](07-0-kpi-formula.md#item-unit-of-pri-and-pq-po-2026-09-28)):

1. `count_basis = 'unit'`: convert the counter from `ASSET_TAGS.uom_id` to `OPERATION.uom_id`
   through the conversion path, **active on the `business_date`**; then divide by
   `batch_size` to get cycles.
2. `count_basis = 'cycle'`: the counter already counts machine cycles (one cycle =
   `batch_size` items of `uom_id`); no item conversion applies.
3. Cycles × `cycle_time_value` × `TIME_CONVERSIONS.seconds_per_unit` = ideal seconds.

**No path at run time.** If the counter tag's unit cannot be converted to `uom_id` on the
`business_date` (row missing, or closed by then), Performance for that segment shows
**"cannot be calculated"** with the reason naming the two units and the product — never 0%,
and never an unconverted count.

Continuous work units (`standard_speed_value` / `speed_uom_id`) are unchanged by this rule.

#### 9.2.2 `OPERATION_WORK_UNIT` — which stations can run a class-based step (PO, 2026-09-30)

Used only when the step has `required_work_unit_class_id`. One row per eligible station, pre-filled with the work
center's work units of that class; the user can remove one. Replaces the interim "parallel machines share a
`step_number`" rule ([decision](../../../LOGS/decisions/2026-09-30-work-master-wave-1.md)).

| Field | Type | Required | Notes |
|---|---|---|---|
| `operation_work_unit_id` | internal ID | Yes | Permanent, never reused |
| `step_id` | → `OPERATION.step_id` (§9.2) | Yes | Was `operation_id` until 2026-10-02 (PO, 2026-10-02, prd-molcadx#24 item 18). The step must have `required_work_unit_class_id` set |
| `work_unit_id` | FK → `WORK_UNIT` | Yes | Must be of that class and in the routing's work center |
| `cycle_time_value` | numeric | No | Override for this station (ISO 22400-2 §5.1.2.5). Empty = the step's class default. Same time unit and item unit as the step |
| `valid_from`, `valid_to` | date | Yes | Effective-dated like `OPERATION` |

**Keys** (F-00 [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `operation_work_unit_id` · Unique: — · No overlap: one active row per (`step_id`, `work_unit_id`) — "one row per eligible station"

**Which standard a job uses:** the station it actually ran on → its override if set, else the step's default.
Example: step "Mix", class Mixer, default 600 s / batch; Mixer 2 override 540 s. A batch on Mixer 1 is measured
against 600 s, on Mixer 2 against 540 s.

#### 9.2.3 `OPERATION_DEPENDENCY` — steps that run side by side (PO, 2026-09-30)

By default steps run in `step_number` order, one after the other. When some steps run **in parallel** or join
later, the routing lists what each step waits for (IEC 62264-2 §6.1.15).

| Field | Type | Required | Notes |
|---|---|---|---|
| `operation_dependency_id` | internal ID | Yes | Permanent, never reused |
| `step_id` | → `OPERATION.step_id` | Yes | The step that waits. Was `operation_id` until 2026-10-02 (PO, 2026-10-02, prd-molcadx#24 item 18) |
| `predecessor_step_id` | → `OPERATION.step_id` | Yes | The step it waits for. Same routing version; not itself; no loops (rejected on save). Was `predecessor_operation_id` until 2026-10-02 |

**Keys** (F-00 [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `operation_dependency_id` · Unique: — (W-20) · No overlap: —

**Rule:** a routing version with **no** dependency rows is a straight line in `step_number` order (every routing
before 2026-09-30). With **any** rows, order comes from them only. Example: Glaze and Print both wait for Bake;
Pack waits for both.

#### 9.2.4 `OPERATION_PARAMETER` — parameter standards of a step (PO, 2026-09-30)

The process settings a step must run within — the "parameter standard" of an EBR (ISA-88 recipe parameters,
IEC 62264-2 parameter specification). Example, step "Mix": mixing time 10 min (8–12), speed 30 rpm (25–35).

| Field | Type | Required | Notes |
|---|---|---|---|
| `operation_parameter_id` | internal ID | Yes | Permanent, never reused |
| `step_id` | → `OPERATION.step_id` (§9.2) | Yes | Was `operation_id` until 2026-10-02 (PO, 2026-10-02, prd-molcadx#24 item 18) |
| `parameter_name` | string | Yes | "Mixing time", "Inlet temperature". Unique per step |
| `target_value` | numeric | No | The set point. At least one of target / min / max is required |
| `min_value`, `max_value` | numeric | No | Allowed range; `min_value` ≤ `target_value` ≤ `max_value` when set |
| `uom_id` | FK → `UNIT_OF_MEASUREMENTS` | Yes | Unit of the values (min, rpm, °C) |
| `is_critical` | boolean | Yes, default `false` | A critical process parameter (CPP): an out-of-range value is a deviation, not just a warning |
| `valid_from`, `valid_to` | date | Yes | A **standard** change (effective-dated, same routing version); adding or removing a parameter is **structural** (new version) |

**Keys** (F-00 [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `operation_parameter_id` · Unique: — · No overlap: (`step_id`, `parameter_name`) — "unique per step"; rows are effective-dated, so per date

- **Which live tag measures it** (to compare actual values against the range) is `TBD` — the mapping to
  `ASSET_TAGS` and what happens on an out-of-range value belong to PRODUCTION / the future Quality domain
  (PLN-Q8). FOUNDATION only holds the standard.
- A class-based step (§9.2.2) has one set of parameters for all its stations.

#### 9.2.5 `OPERATION_INSTRUCTION` — ordered sub-steps of a step (PO, 2026-10-01, EBR)

The written work instructions inside one step, in order — the "procedure" lines of an EBR master recipe (ISA-88
recipe procedure below the operation level). FOUNDATION holds the text the operator must follow; **recording that
an instruction was done or confirmed is execution, `TBD` → PRODUCTION** (raised there, not decided here).
Record: [decision](../../../LOGS/decisions/2026-10-01-work-master-ebr-step-detail.md).

| Field | Type | Required | Notes |
|---|---|---|---|
| `operation_instruction_id` | internal ID | Yes | Permanent, never reused |
| `step_id` | → `OPERATION.step_id` (§9.2) | Yes | Was `operation_id` until 2026-10-02 (PO, 2026-10-02, prd-molcadx#24 item 18) |
| `sequence` | integer | Yes | Order inside the step, 1, 2, 3… Unique per step on any date |
| `instruction_text` | text | Yes | What the operator does, in plain words. Maximum length, attachments (picture, SOP link) and translation: `TBD` (W-14) |
| `requires_confirmation` | boolean | Yes, default `false` | `true` = the operator must confirm this instruction is done before moving on. FOUNDATION only declares it; what "confirm" records and whether it blocks the next instruction is PRODUCTION's call |
| `valid_from`, `valid_to` | date | Yes | Changing the **text** or the confirmation flag is a **standard** change (effective-dated, same routing version); adding, removing or **re-ordering** an instruction is **structural** (new version) — same split as `OPERATION_PARAMETER` |

**Keys** (F-00 [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `operation_instruction_id` · Unique: — · No overlap: (`step_id`, `sequence`) on any date

**Examples** (example data, not a customer spec):

| Line | Step | # | Instruction | Confirm |
|---|---|---|---|---|
| Food — biscuit dough | Mix (Mixer, Mixing) | 1 | Add water and sugar, mix 2 min at low speed | — |
| | | 2 | Add flour and fat, mix 8 min at high speed | — |
| | | 3 | Stop the mixer, scrape the bowl, mix 1 more minute | Yes |
| Pharma — tablet, wet granulation | Granulate (granulator) | 1 | Check the 1.0 mm screen is fitted | Yes |
| | | 2 | Load the dry blend, mix 3 min | — |
| | | 3 | Add the binder solution over 3–5 min with the chopper on | Yes |

- An instruction is **not** a step: it has no work unit, no cycle time, no yield of its own. If a sub-step needs its
  own station or standard, it is a separate `OPERATION`.
- Measured values do not go in the text ("record the temperature") — they are `OPERATION_CHECK` rows (§9.2.6).
  Settings the machine must run within are `OPERATION_PARAMETER` rows (§9.2.4).
- A class-based step (§9.2.2) has one instruction list for all its stations.

#### 9.2.6 `OPERATION_CHECK` — in-process checks of a step (PO, 2026-10-01, EBR)

The **in-process checks (IPC)** the operator measures or judges during the step and records — tablet weight, dough
temperature, seal integrity, pH. FOUNDATION holds what to check, the range and how often; **recording results and
handling an out-of-range result is execution, `TBD` → PRODUCTION / future Quality domain** (raised there).

**How it differs from `OPERATION_PARAMETER` (§9.2.4):**

| | `OPERATION_PARAMETER` | `OPERATION_CHECK` |
|---|---|---|
| What it is | A **setting** the step must run within (mixer speed, oven temperature) | A **result** the operator measures on the product or process (tablet weight, core temperature) |
| Where the value comes from | The machine / its set point (live tag mapping `TBD`) | The operator measures and enters it |
| How often | Holds the whole time the step runs | At a set frequency (once, start-middle-end, every N minutes) |
| Value types | Numeric only | Numeric, pass/fail, or text |

**Keys** (F-00 [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `operation_check_id` · Unique: — · No overlap: (`step_id`, `check_name`) on any date

| Field | Type | Required | Notes |
|---|---|---|---|
| `operation_check_id` | internal ID | Yes | Permanent, never reused |
| `step_id` | → `OPERATION.step_id` (§9.2) | Yes | Was `operation_id` until 2026-10-02 (PO, 2026-10-02, prd-molcadx#24 item 18) |
| `sequence` | integer | Yes | Display order inside the step |
| `check_name` | string | Yes | "Tablet weight", "Dough temperature", "Seal leak test". Unique per step on any date |
| `value_type` | enum | Yes | `numeric` / `pass_fail` / `text`. `pass_fail`: the operator picks Pass or Fail; Fail is out of range. `text`: a free observation, never out of range |
| `target_value` | numeric | No | `numeric` only. The aimed value |
| `min_value`, `max_value` | numeric | Conditional | `numeric` only: **at least one of `min_value` / `max_value` is required** (a check with no limit is not a check). `min_value` ≤ `target_value` ≤ `max_value` when set. Empty for the other types |
| `uom_id` | FK → `UNIT_OF_MEASUREMENTS` | Conditional | Required for `numeric` (g, °C, pH); empty for the other types |
| `sample_count` | integer | Yes, default `1` | How many samples the operator measures **each time** the check is due (e.g. 10 tablets). Each sample is compared to the range on its own; averages and other statistics are `TBD` (PRODUCTION / Quality) |
| `frequency_type` | enum | Yes, default `once` | When the check is due during one run of the step for one job: `once` (once per run) / `start_middle_end` (three times per run) / `interval` (every N time units while the step runs). Whether "once" means per run or per lot when a run holds several lots is `TBD` (W-13, PRODUCTION) |
| `frequency_interval_value` | numeric | Conditional | Required when `frequency_type = interval` ("every **30** minutes"), > 0; empty otherwise |
| `frequency_interval_conversion_id` | FK → `TIME_CONVERSIONS` ([Reference & Master Data §9.3](05-reference-master-data.md#93-time_conversions)) | Conditional | Time unit of `frequency_interval_value`; required with it |
| `is_critical` | boolean | Yes, default `false` | `true` = an out-of-range result is a **deviation**, not just a warning. Not allowed on `text` checks (rejected on save) |
| `valid_from`, `valid_to` | date | Yes | Changing a value (range, sample count, frequency, critical flag, name) is a **standard** change; adding or removing a check is **structural** (new version) — same split as `OPERATION_PARAMETER` |

**Examples** (example data):

| Line | Step | Check | Type | Range | Samples | Frequency | Critical |
|---|---|---|---|---|---|---|---|
| Food — biscuit | Bake | Biscuit core temperature | numeric | min 95 °C | 3 | every 30 min | Yes |
| Food — biscuit | Pack | Seal leak test | pass_fail | — | 5 | start_middle_end | Yes |
| Pharma — tablet | Compress | Tablet weight | numeric | 245–255 mg, target 250 | 10 | every 15 min | Yes |
| Pharma — tablet | Compress | Tablet appearance | text | — | 1 | once | No |

- Not modelled: a frequency by quantity ("every 500 packs") — `TBD` (W-13). What "middle" means in time (half of the
  planned run time, or of the actual one) is PRODUCTION's call when it prompts the operator.
- A class-based step (§9.2.2) has one set of checks for all its stations.

#### 9.2.7 Yield limits and hold time (PO, 2026-10-01, EBR)

Two standards on `OPERATION` (§9.2 table). FOUNDATION holds the limits; **measuring the actual yield, timing the
wait and acting on a breach is execution, `TBD` → PRODUCTION** (raised there).

**Yield.** For one job at one step:

```
theoretical output of step k = the step's actual input, converted to the step's output unit (OPERATION.uom_id)
                               at the net recipe ratio — no scrap_factor, no planned_shrinkage, no loss at all
actual yield of step k (%)   = 100 × actual primary output of step k ÷ theoretical output of step k
```

- **Actual input** of a step = the actual quantity of every `consumed` `BOM_LINE` entering at this step
  (`BOM_LINE.operation_id`, §9.4; a line without a step enters at the first step) + the actual output of the
  step(s) it follows (the previous step in `step_number` order, or every predecessor in `OPERATION_DEPENDENCY`,
  §9.2.3). Measured by PRODUCTION.
- **Conversion:** lines through the net ratio `qty_per_unit ÷ base_qty` (the calculated step ratio, §9.4);
  the previous step's output through the product's conversion path (§9.2.1).
- **Component scrap is outside yield.** `scrap_factor` is material lost **before** it enters the step
  (handling, trim); only what actually entered counts as input.
- **Expected yield at standard = 100 × (1 − `planned_shrinkage`)** of this step, because the
  [planned-input formula](#planned-input--net-recipe-plus-losses-po-2026-09-30) assumes exactly that loss.
  The yield range is the allowed spread around it. On save, a range that does not contain the expected yield gets a
  **warning, not a block** ("Expected yield 95% is outside 96–99%").
- **Output unit matters.** Shrinkage is a mass loss. A step whose output is counted in pieces (oven: pieces in =
  pieces out) has expected yield 100% in pieces even when `planned_shrinkage` = 0.04 — its yield range should be
  written in that sense. Whether such a step also needs a mass yield is `TBD` (W-15).

**Example.** Mix recipe as in [planned input](#planned-input--net-recipe-plus-losses-po-2026-09-30): base 1,000 kg,
A 700 kg, B 300 kg; Mixer 1 `planned_shrinkage` 0.05; yield range 93–97%.
Actually dispensed: A 73.5 kg, B 31.5 kg. Theoretical output = 73.5 ÷ 0.7 = 105 kg (B gives the same, 31.5 ÷ 0.3).
Actual mix out = 100 kg → yield = 100 × 100 ÷ 105 = **95.2%** — inside 93–97%. Expected yield = 100 × (1 − 0.05) = 95%.

**Edge cases.**

| Case | Answer |
|---|---|
| Actual input is 0 or not recorded | "Cannot be calculated", never 0% or 100% |
| Lines dispensed out of recipe ratio (A gives 105 kg, B gives 100 kg) | **Proposed, not decided (W-16):** theoretical output = the **smallest** of the per-line figures (the limiting component) — here 100 kg. A line of a `consumable` product is left out (as in the material requirement) |
| No conversion path from an input to the output unit | "Cannot be calculated", naming the two units — never an unconverted figure (same rule as §9.2.1) |
| Yield above 100% | Possible (mass gain, weighing error). Inside `yield_max_pct` → fine; above → out of range |
| Only `yield_min_pct` set | Only low yield is out of range |
| A class-based step | One range for all stations |
| Out-of-range result | What happens (warning, deviation, block) is PRODUCTION's / Quality's call |

**Hold time.** `max_hold_time` + `hold_time_conversion_id` on a step = the longest allowed wait from the **end of
this step** to the **start of the step that follows it**, for the same job. Example: wet granulation "Granulate" →
"Dry", `max_hold_time` 2 hours: granules finished 08:00 must enter the dryer by 10:00.

| Routing shape | Which step the limit applies to |
|---|---|
| Straight line (no `OPERATION_DEPENDENCY` rows) | The next step in `step_number` order that the product uses |
| With dependencies (§9.2.3) | **Every** step that lists this step as predecessor, each timed separately with the same limit (Bake → Glaze and Bake → Print, both within 1 hour). A different limit per successor is not supported — `TBD` (W-11) |
| Last step of the routing | No successor in this routing → the limit has no effect. A hold across routings (dough at Mixing → molding at Baking, a different product and work center) is `TBD` (W-10) |

A minimum wait (resting time) is not modelled (W-11).

### 9.3 `BOM` — from what, for one product

Versioned and time-variant. A component can have its own BOM (nesting). Kept from the
Indonesian Work Master entity list; `item_id` is `product_id`.

| Field | Type | Required | Notes |
|---|---|---|---|
| `bom_id` | internal ID | Yes | Permanent, never reused |
| `product_id` | FK → `PRODUCT` ([Product §9.1](06-product.md#91-product--the-thing-being-made)) | Yes | The parent being made |
| `base_qty` | numeric | Yes, default `1` | **Added 2026-09-30 — recipe base quantity.** The quantity of the parent the lines are written for ("per 1,000 kg", "per 40 packs"). Must be > 0. Not a batch size: a real batch can be any size, the recipe scales. Label on screen: "Recipe base quantity" ([decision](../../../LOGS/decisions/2026-09-30-bom-net-recipe-shrinkage-base-qty.md)) |
| `base_uom_id` | FK → `UNIT_OF_MEASUREMENTS` | Yes, default the product's `base_uom_id` | **Added 2026-09-30.** Unit of `base_qty`. Must be the product's base unit or have a conversion path to it on `valid_from` (same rule as `OPERATION.uom_id`, §9.2.1) |
| `flow_id` | FK → `PRODUCT_FLOW` (§9.0) | Yes | **Added 2026-09-30 (wave 2).** The flow this BOM belongs to |
| `version` | integer | Yes | **Added 2026-09-30 (W-8).** 1, 2, 3… per `flow_id`. Each version is its own row (own `bom_id`) |
| `status` | enum | Yes | **Added 2026-09-30 (W-8).** `draft` / `released` / `retired` — same meaning as on `ROUTING` (§9.1) |
| `is_phantom` | boolean | Yes, default `false` | **Added 2026-09-30.** `true` = this semi-finished product is never stocked; it passes straight into the next step. Allowed only when the product's `product_type = semi_finished` — rejected otherwise. Shown dashed in the BOM tree; its lines are counted as if they sat directly under each parent that uses it. What a phantom means for stock and material requirement is the future Inventory domain's call (`TBD`) |
| `valid_from`, `valid_to` | date | Yes | A new version closes the old row. Ranges must not overlap for the same product |

**Keys** (F-00 [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `bom_id` · Unique: (`flow_id`, `version`) — versions numbered per `flow_id` · No overlap: at most one `released` version per `flow_id` on any date ([versions and status](#versions-and-status-po-2026-09-30)); at most one `draft` BOM per `flow_id` (PO, 2026-10-02, prd-molcadx#24 item 19); the "same product" wording on `valid_from`/`valid_to`: W-19

### 9.4 `BOM_LINE` — one component on a BOM

| Field | Type | Required | Notes |
|---|---|---|---|
| `bom_line_id` | internal ID | Yes | Permanent, never reused |
| `bom_id` | FK → `BOM` (§9.3) | Yes | |
| `component_product_id` | FK → `PRODUCT` | Yes | Circular BOM is rejected. A `produced` line names a `semi_finished` product (issue #58 Q3: named product; a material class is not supported) |
| `operation_id` | FK → `OPERATION` | No | **Added 2026-09-30 — material per step** (IEC 62264-2 §6.1.13). The step where this line **enters** (`consumed`) or **comes out** (`produced`). Must be a step of a routing of the same product. Empty = enters at the first step |
| `line_use` | enum | Yes, default `consumed` | **Added 2026-09-30.** `consumed` / `produced`. **No `consumable` value** — consumable is a `product_type` ([2026-09-30 decision](../../../LOGS/decisions/2026-09-30-product-type-packaging-phantom-bom-tree.md)); a line of a consumable product is left out of the material requirement |
| `is_primary_output` | boolean | Conditional | **Added 2026-09-30.** Only on `produced` lines. A step with produced lines has **exactly one** primary; the step's `uom_id` is the primary line's unit, and cycle time, Performance and the step ratio count only the primary line |
| `qty_per_unit` | numeric | Yes | Must be > 0. **Per `BOM.base_qty` of the parent** (2026-09-30) — with the default `base_qty = 1` this is per 1 unit, as before. **Net**: what the recipe needs, without expected losses (losses: `scrap_factor` below, `OPERATION.planned_shrinkage` §9.2) |
| `uom_id` | FK → `UNIT_OF_MEASUREMENTS` ([Reference & Master Data §9.4](05-reference-master-data.md#94-measurement_group-and-unit_of_measurements)) | Yes | |
| `scrap_factor` | numeric (fraction, ≥ 0) | No | Extra material expected to be lost handling **this component** (film trim, residue). `0.05` = 5%, the same unit PRD-003 uses. Empty = 0. Varies by material, not by work unit — process loss is `OPERATION.planned_shrinkage` |
| `dispense_tolerance_type` | enum | No | **Added 2026-10-01 (PO, EBR).** `percent` / `absolute`. How far the weighed (dispensed) quantity of this line may be from its target. Empty = no dispensing check. Only on `consumed` lines; not allowed on a line of a `consumable` product (left out of the material requirement) |
| `dispense_tolerance_value` | numeric | Conditional | **Added 2026-10-01 (PO, EBR).** Required when `dispense_tolerance_type` is set, empty otherwise. Symmetric **±**: `percent` → ± this % of the target (`1` = ±1%, must be > 0 and < 100); `absolute` → ± this quantity in the line's `uom_id` (`0.2` = ±0.2 kg, must be > 0) |

**Keys** (F-00 [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `bom_line_id` · Unique: partial — one `is_primary_output = true` row per (`bom_id`, `operation_id`) among `produced` lines ("exactly one primary" per step); component per BOM: W-18 · No overlap: — (not effective-dated)

A BOM already locked on a released `WORK_ORDER` (now PRODUCTION, see the note at the top of
this document) is not edited in place. Make a new BOM version.

**Dispensing tolerance (PO, 2026-10-01, EBR).** The **target** a weighing is compared to is the line's planned
quantity for the job: the [planned-input formula](#planned-input--net-recipe-plus-losses-po-2026-09-30) × the job
quantity (so it already includes `scrap_factor` and `planned_shrinkage`). Allowed range = target ± tolerance.
Example: component A, planned 75.16 kg for the job. `percent` 1 → 74.41–75.91 kg. `absolute` 0.2 → 74.96–75.36 kg.
Asymmetric limits (−0 / +2%) are not supported — `TBD` (W-12). **Proposed, not decided (W-17):** like `qty_per_unit`, a change on a released BOM opens a
new BOM version. This is the **standard** part of GitHub issue #60 (weight deviation); recording the weighed
quantity, comparing it and handling a deviation stay **parked with #60** (PRODUCTION / future Quality and Inventory).

**Material per step (2026-09-30).** All quantities stay per `BOM.base_qty` of the finished product of this BOM.
The **step ratio** (how much of a line one unit of a step's primary output needs) is **calculated** from the
quantities, never stored, and only between units of one measurement group. Planned shrinkage now applies per
line: a line is inflated only by the `planned_shrinkage` of its own step and the steps after it (see
[planned input](#planned-input--net-recipe-plus-losses-po-2026-09-30)); a line without `operation_id` enters at
the first step.

### Versions and status (PO, 2026-09-30)

W-8 closed ([decision](../../../LOGS/decisions/2026-09-30-work-master-wave-1.md)). `ROUTING` and `BOM` each carry `version` + `status`, one row per version.

| Change | Example | What happens |
|---|---|---|
| **Structural** | Add or remove a step or a line, change a step's station or class, change a line's component or entry step; add, remove or re-order an instruction (§9.2.5); add or remove a parameter or a check (§9.2.4, §9.2.6); any BOM line change, incl. its dispensing tolerance (BOM lines are not effective-dated) | Only on a `draft`. On a `released` version it opens the **next version** as a `draft` copy; the old one stays released until the new one is released, then is `retired` |
| **Standard** | Cycle time, speed, setup time, shrinkage, a station's override; yield range, hold time (2026-10-01); a parameter's or check's values; an instruction's text or confirmation flag | Effective-dated `OPERATION` / `OPERATION_WORK_UNIT` row inside the same version — no new version |

- **Pin at release.** A `WORK_ORDER` (PRODUCTION) pins the version by its `routing_id` and `bom_id` — both
  already point at one version row. Only `released` versions can be picked. PRODUCTION's
  `routing_version_locked` / `bom_version_locked` placeholders can therefore go (raised to PRODUCTION, PLN-Q6).
- **Cycle time as of the run date (issue #58 Q1).** A job follows the steps and lines of its pinned version, but
  its **standard** (cycle time, speed — and since 2026-10-01 yield range, hold time, instruction text, check and
  parameter values) is read **as of the shift's `business_date`**, not as of release. A
  back-dated standard fix is allowed and recalculates the affected past shifts; the editor warns "This changes
  KPIs of \<n\> past shifts", and the change is recorded in `AUDIT_LOG` (who, when, before → after, F-14).
- **One released version per date:** at most one `released` version of a **flow's** BOM, and of a flow's
  routing per work center, is active on any date (per flow since wave 2 — several flows of one product are active
  side by side).
- **One draft at a time (PO, 2026-10-02, prd-molcadx#24 item 19):** a flow has at most **one** `draft` BOM and at most **one** `draft` routing.
  Starting a second draft (a new version, or a copy of a released one) is refused while the open draft exists, and
  the error names that draft's version. `TBD — perlu konfirmasi PO`: for routings, is the limit one draft per **flow** in total, or one per
  flow **at each work center** (routing versions are numbered per flow + work center)?

### 9.5–9.6 `WORK_ORDER` / `WORK_ORDER_OPERATION` — moved to PRODUCTION, 2026-09-03

These two entities used to be specified at this position (§9.5 `WORK_ORDER`, §9.6
`WORK_ORDER_OPERATION`). **They are no longer defined here.** PO decision (contest review,
2026-09-03) moved both to domain **PRODUCTION**, joining the Job Schedule module, because they
are transactional/execution data written live by shopfloor, not master/recipe data. See the
note at the top of this document and
[`LOGS/decisions/2026-09-03-foundation-contest-blockers.md`](../../../LOGS/decisions/2026-09-03-foundation-contest-blockers.md)
for the full reasoning. Their new spec, including the B2 fix (`defect_code_id` FK on
`WORK_ORDER_OPERATION`) and the W-1/B4 answer (ERP vs MolcaDx as WO source), lives in
[`DOMAINS/PRODUCTION/`](../../PRODUCTION/AGENTS.md), not here. §9.5/§9.6 are intentionally
left as a pointer rather than renumbered away, so an old link or reference to "F-08 §9.5/§9.6"
still lands somewhere useful instead of 404ing silently.

`ROUTING` (§9.1) and `BOM` (§9.3) still carry the FK surface `WORK_ORDER` locks onto at
release — see W-8 above for the still-open version-pin mechanism those FKs need.

### ~~9.7 `QUALITY_DEFECT_CODE`~~ — retired 2026-09-23, merged into `REJECT_REASON`

**PO decision ([record](../../../LOGS/decisions/2026-09-23-defect-code-merged-into-reject-reason.md)):** defect codes and reject reasons are the same thing. `QUALITY_DEFECT_CODE`
had the same shape as F-05's `REJECT_REASON` (`code`, `name`, validity dates) but no per-asset scoping, so
`REJECT_REASON` ([F-05 §9.1](05-reference-master-data.md#91-downtime_reason-and-reject_reason)) is kept as the
single list and this entity is retired. Its open questions moved with it: the real list (W-4) is F-05 T-1, the
`disposition` field (W-9) is F-05 T-6. Section number kept so old links don't break.


## Part-4 execution spine (minimum for next FE / PRODUCTION handoff)

IEC 62264-4 separates **work definition** (how to do work) from **job execution** (a concrete dispatch). Molca already keeps recipe objects here (`ROUTING` / `OPERATION` / `BOM`) and moved transactional `WORK_ORDER` / `WORK_ORDER_OPERATION` to PRODUCTION.

**Minimum useful spine for the next FE slice (do not implement the full Part-4 catalogue):**

1. **Work Master** (template work definition) — today's F-08 recipe objects above.
2. **Work Directive** — job-specific copy derived from the master for one job order (PRODUCTION owns when built).
3. **Job Order** — dispatched unit of scheduled work (PRODUCTION; states: `dispatched` → `executing` → `completed` / `failed`).
4. **Job Response** — execution result / close-out (add when status/close is in the same slice).

**Explicitly defer** unless the slice already needs multi-job time windows or BPMN-style orchestration: Work Schedule, Job List, Work Performance, Workflow Specification.

Keep IEC 62264-2 Operations Definition / Schedule as Level-4 exchange references — do not duplicate those objects inside F-08.


## Next step

`ROUTING` / `OPERATION` / `BOM` / `BOM_LINE` are specified and stay
in FOUNDATION. `WORK_ORDER` / `WORK_ORDER_OPERATION` moved to PRODUCTION 2026-09-03 (see the
note at the top of this document) — W-1 and W-5 travel with them and are no longer answered
here. The defect list (W-4) and its `disposition` field (W-9) moved to F-05 with `REJECT_REASON` (2026-09-23). W-6 is resolved (2026-09-28, `uom_id` is the item unit); W-7 is a follow-up on `OPERATION` fields. **W-8 is
new and cross-domain:** `ROUTING`/`BOM` need a version-pin mechanism before "locked at
release" is more than a sentence — design jointly with `production-domain`, do not decide
unilaterally.
