# F-07 — KPI formula (plain-language English)

> Rewritten from the ISO base 2026-08-24. Everything below is quoted directly from
> **ISO 22400-2:2014** — not summarized from memory, not restated from the previous
> draft of this file. The old content of this file (Molca's tag-mapping architecture)
> moved to [F-07.1](07-1-kpi-tag-mapping.md) unchanged; nothing there was deleted.
> Entity spec status: 🟡 DRAFT (no formula tables — see [§9](#9-entity-specification)).

## What this module is for

This is the **base**: the ISO elements and formulas MolcaDx's OEE family is built on,
stated the way the standard states them, before any Molca-specific mapping happens.
[F-07.1](07-1-kpi-tag-mapping.md) answers "which tag/entity fills each element." This file
**is** the formula — no restatement in [`04-metrics-framework.md`](../../../DOCS/04-metrics-framework.md#5-metrik-operasional-oee-family),
which covers product/behavior metrics, not manufacturing KPIs. Changing a formula means
editing this file, then logging the change; everything downstream (PRDs, screens,
Production's calc job) quotes it rather than restating it.

## Scope: which parts of ISO 22400-2 Molca adopts

ISO 22400-2 Clause 5 defines **29 time elements**, **16 logistical/quality elements**,
and Clause 6 describes **34 KPIs**. Molca v1 adopted a small, deliberate subset — the
**Production OEE family**. **Revisited 2026-09-10** (Product Owner request to widen ISO
22400-2 adoption as far as the actual data model allows): four more KPIs cleared the same
bar — every variable resolves to a field that already exists — and are adopted below.
Everything else stays `⛔ not yet`; see the [deferred catalog](#deferred-iso-22400-2-kpis--why-each-is-blocked)
for the reason per KPI.

| Adopted now | Elements/KPIs from ISO 22400-2 | Why |
|---|---|---|
| ✅ | POT, PBT, APT (§5.1.2.2, §5.1.2.4, §5.1.3.6) | Denominators/numerators of Availability |
| ✅ | PQ, GQ, SQ (§5.5.6, §5.5.4, §5.5.2), PRI (§5.1.2.5) | Inputs to Effectiveness and Quality ratio |
| ✅ | Availability, Effectiveness, Quality ratio, OEE index (Clause 6, Tables 7, 9–11) | The four numbers Molca screens show |
| ✅ | TBF, TTR (§5.1.4.1–2) + TTF (via TBF = TTF + TTR) | Basis for Molca's MTBF / MTTR / MTTF — see [below](#reliability-elements-iso-clause-514) |
| ✅ **new, 2026-09-10** | Actual order execution time (AOET) — read off `WORK_ORDER_OPERATION.actual_start`/`.actual_end` (PRODUCTION), same cross-domain borrowing already used for PQ/GQ/SQ | Denominator for Throughput rate and Production process ratio |
| ✅ **new, 2026-09-10** | Rework quantity (RWQ) — `WORK_ORDER_OPERATION.rework_qty` (PRODUCTION) | Numerator for Rework ratio |
| ✅ **new, 2026-09-10** | Throughput rate, Production process ratio, Scrap ratio, Rework ratio (Clause 6 catalog) | Every variable of each formula resolves to an already-adopted element or an existing PRODUCTION field at the same `WORK_ORDER_OPERATION` grain PQ/GQ/SQ already use — see [Newly adopted KPIs](#newly-adopted-kpis-2026-09-10) below |
| ✅ **new, 2026-09-10, PO decision** | Fall-off ratio (Clause 6 catalog, Quality domain), plus Throughput rate / Production process ratio / Scrap ratio / Rework ratio at **Production order** scope | `KPI_RESULT.aggregation_level` gains a `work_order` value resolving to PRODUCTION's `WORK_ORDER.work_order_id` — see [Production order scope](#production-order-scope--adopted-2026-09-10) below |
| ⛔ not yet | POET, PUST, APWT, AUPT, AUBT, APAT, AQT, ADOT, ADET, AUST, ATT and the KPIs built on them (worker efficiency, allocation ratio, allocation efficiency, utilization efficiency, NEE index, setup ratio, technical efficiency, equipment load ratio, etc.) | No Molca entity captures personnel time, transport time, actual unit busy/processing/setup/delay time, or equipment production capacity separately yet. Adding one of these later means adding the element here first, not inventing a Molca-only ratio |
| ⛔ not yet | RQ, RM, RMI, FGI, CI, CM, IGQ, PL, STL, OL, EPC, GP, IP and the KPIs built on them (FPY, actual-to-planned scrap ratio, machine/process capability indices, inventory/logistics ratios) | Quality-domain (SPC/inspection) and Inventory-domain KPIs need entities that don't exist yet, or a field Molca doesn't have (inspected-part count, planned scrap quantity) — see the [deferred catalog](#deferred-iso-22400-2-kpis--why-each-is-blocked) for the reason per KPI |

This table is the answer to **K-4** (resolved 2026-08-24, widened 2026-09-10): *Production
OEE family plus five more KPIs whose inputs already exist, not the full ISO element set.*
Widening the adopted set further is a Product Owner decision, made here, not a per-plant
one.

**Every KPI adopted above is a Production KPI (PO, 2026-09-27).** KPIs are selected, bound
and shown per domain — Production / Quality / Maintenance / Inventory (IEC 62264 MOM
categories; [PRODUCTION 00-overview](../../PRODUCTION/DOCS/00-overview.md) rule 1). All nine
adopted KPIs, plus MTTR / MTTF / MTBF, belong to **Production** today, including Quality
ratio, Scrap ratio, Rework ratio and Fall-off ratio, which the
[domain regrouping below](#production-domain-14-kpis) files under Quality, and the reliability
means it files under Maintenance: they come from the production equipment's own counters and
downtime intervals. Quality, Maintenance and Inventory have **no adopted KPI yet**. The slot
catalog carries this as `KPI_FORMULA_SLOT.domain`
([F-07.1 §9.1](07-1-kpi-tag-mapping.md#91-kpi_formula_slot)), and the KPI screens are a KPI item inside
each domain's sidebar group ([UX 07](../UX/07-kpi.md), 2026-09-28; an unlicensed domain shows as a locked group heading). Adopting a KPI for another domain, or moving one there once that domain exists, is
a PO decision made in this table.

### KPI → report page

Each adopted KPI is shown on one report page of its domain, the page whose loss it explains
(PO, 2026-09-27). This is a fixed placement table, not a KPI catalog entity — F-07 still has no
`KPI_INDEX` / `KPI_FORMULA` table (K-1). The pages themselves are specified by the owning
domain: Production's in [PRODUCTION 03-performance](../../PRODUCTION/DOCS/03-performance.md#report-pages--one-per-kpi-family-po-decision-2026-09-27).

| KPI | Domain | Report page | Why that page |
|---|---|---|---|
| OEE index | Production | Overview | The headline; the three components side by side |
| Availability | Production | Availability | Lost time: APT / PBT |
| Production process ratio | Production | Availability | Time share: APT / AOET |
| MTTR, MTTF, MTBF | Production | Availability | Built from the same unplanned stops that reduce APT |
| Performance (ISO Effectiveness) | Production | Performance | Lost speed: PRI × PQ / APT |
| Throughput rate | Production | Performance | Output per unit of time: PQ / AOET |
| Quality ratio | Production | Quality | Lost output: GQ / PQ |
| Scrap ratio | Production | Quality | SQ / PQ |
| Rework ratio | Production | Quality | RWQ / PQ |
| Fall-off ratio | Production | Quality (Job Order scope only) | Output lost across a routing |

A newly adopted KPI gets a row here in the same decision that adopts it. Quality, Maintenance
and Inventory have no rows until they adopt a KPI; their pages are then named in that domain's
docs.

**Same day, second pass (2026-09-10):** a second ISO 22400-2 chart covering the scopes the
first didn't (Production order, Defect type, Time period, Worker/workgroup, Stock, Plant,
Characteristic/measurements, Production order sequence) added **no new KPI or element to
this table** — it added **scope bindings** for KPIs already listed above: Availability,
Performance, Quality ratio, OEE index now also adopt at **Time period** scope; Throughput
rate and Production process ratio now also adopt at **Plant** scope. See
[New scope bindings](#new-scope-bindings-2026-09-10-second-chart) below for the full
per-scope check. It also flagged Production order and Defect type scope as blocked on
`KPI_RESULT.aggregation_level` gaps — **Production order scope was resolved later the
same day** by PO decision (`work_order` aggregation level added, see
[Production order scope — adopted](#production-order-scope--adopted-2026-09-10) below);
Defect type scope stays blocked.

## ISO time elements (Clause 5.1)

> Quoting ISO 22400-2:2014, Clause 5.1. "Shall be" is the standard's own normative language.

| Code | ISO name | ISO clause | Definition (normative) |
|------|----------|------------|--------------------------|
| **POT** | Planned operation time | §5.1.2.2 | "The planned time in which a work unit can be used. The operation time is a scheduled time." |
| **PBT** | Planned busy time | §5.1.2.4 | "The planned operation time minus the planned downtime." Note in the standard: the planned downtime can be used for planned maintenance work; the planned busy period is available for detailed planning of expected production orders. |
| **APT** | Actual production time | §5.1.3.6 | "The actual time during which a work unit is producing. It includes only the value-adding functions." |
| **PRI** | Planned run time per item | §5.1.2.5 | "The planned time for producing one quantity unit." (Cycle time in Molca's Work Master; the "quantity unit" is `OPERATION.uom_id`, see [below](#item-unit-of-pri-and-pq-po-2026-09-28).) |

Not adopted yet (§5.1.2.1, §5.1.2.3, §5.1.3.1–5, §5.1.3.7–14): POET, PUST, APWT, AUPT,
AUBT, APAT, AQT, ADOT, ADET, AUST, ATT — see [scope table](#scope-which-parts-of-iso-22400-2-molca-adopts).
**AOET (Actual order execution time) adopted 2026-09-10** — see the [scope table](#scope-which-parts-of-iso-22400-2-molca-adopts)
and [Newly adopted KPIs](#newly-adopted-kpis-2026-09-10).

**ISO gives no element named "unplanned downtime."** The standard reaches PBT by
subtracting *planned* downtime from POT, and reaches APT implicitly through the
Effectiveness/Availability formulas rather than naming a matching "unplanned downtime"
element. Molca's Availability walk (POT → planned DT → PBT → unplanned DT → APT) is a
Molca-specific two-step reconstruction of the same POT/PBT/APT relationship — restated in
full, with the `ASSET_STATE_LOG` / `DOWNTIME_REASON.downtime_category` mapping, in
[F-07.1](07-1-kpi-tag-mapping.md#availability).

## Logistical and quality elements (Clause 5.5, 5.6)

| Code | ISO name | ISO clause | Definition (normative) |
|------|----------|------------|--------------------------|
| **PQ** | Produced quantity | §5.5.6 | "The quantity that a work unit has produced in relation to a production order." |
| **GQ** | Good quantity | §5.5.4 | "The produced quantity that meets quality requirements." |
| **SQ** | Scrap quantity | §5.5.2 | "The produced quantity that did not meet quality requirements and either has to be scrapped or recycled." |

Not adopted yet (§5.5.1, §5.5.3, §5.5.5, §5.5.7–16, §5.6.1–2): POQ, PSQ, RQ, RM, RMI,
FGI, CI, CM, IGQ, PL, STL, OL, EPC, GP, IP — see [scope table](#scope-which-parts-of-iso-22400-2-molca-adopts).
**Rework quantity (RWQ) adopted 2026-09-10** from `WORK_ORDER_OPERATION.rework_qty`
(PRODUCTION) — not part of this ISO clause's own element list, a Molca field reused the
same way [F-07.1](07-1-kpi-tag-mapping.md) already reuses PRODUCTION fields elsewhere.

## Reliability elements (ISO Clause 5.1.4)

| Code | ISO name | ISO clause | Definition (normative) |
|------|----------|------------|--------------------------|
| **TBF** | Time between failures | §5.1.4.1 | "The actual unit busy time (AUBT) between two consecutive failures of a work unit including setup time, production time and repair time related to the orders being processed and without delay times." |
| **TTR** | Time to repair | §5.1.4.2 | "The actual time during which a work unit is unavailable due to a failure." |
| **TTF** | Time to failure | (implied by §5.1.4: TBF = TTF + TTR) | Gap from end of repair / restart until the next failure starts. |

**Molca means on unplanned stops (aligned with ISO §5.1.4 relationship):**

| Molca KPI | = mean of | Relationship |
|-----------|-----------|--------------|
| **MTTR** | TTR | mean `(ended_at − started_at)` over closed unplanned stops |
| **MTTF** | TTF | mean gap from restart to next unplanned stop start |
| **MTBF** | TBF | **MTTR + MTTF** = mean gap from one unplanned stop start to the next |

Only **unplanned (failure)** stops count; planned downtime, breaks, and small stops never end or start an interval; computed **per work unit**. Full formulas and gates: [F-07.1](07-1-kpi-tag-mapping.md#mttr-mttf-and-mtbf-from-unplanned-downtime-only).

ISO's normative TBF text spans AUBT (setup + production + repair). Molca does not adopt AUBT as a single tracked element (see [scope table](#scope-which-parts-of-iso-22400-2-molca-adopts)); the means above are taken from unplanned `ASSET_STATE_LOG` intervals so that **MTBF = MTTR + MTTF** still holds — matching ISO's TBF = TTF + TTR.

## KPI formulas (Clause 6)

> Quoting ISO 22400-2:2014, Clause 6, Tables 7, 9, 10, 11.

### Availability (ISO Clause 6, Table 9)

```
Availability = APT / PBT
```

ISO description: "Availability is a ratio that shows the relation between the actual
production time (APT) and the planned busy time (PBT) for a work unit." Unit: %.
Range: 0–100%. Trend: higher is better. ISO note: "Availability is also called degree
of utilization or capacity factor."

### Performance — ISO "Effectiveness" (Clause 6, Table 10)

```
Effectiveness = PRI × PQ / APT
```

ISO description: "Effectiveness represents the relationship between the planned target
cycle and the actual cycle, expressed as the planned runtime per item (PRI) multiplied by
the produced quantity (PQ) divided by the actual production time (APT)." Unit: %. Range:
0–100%. Trend: higher is better.

**Naming decision:** Molca's product-facing and Foundation-facing name for this KPI is
**Performance**, not "Effectiveness." This is a deliberate rename for plain language —
"Effectiveness" reads as a vague catch-all in a shopfloor screen; "Performance" (the
speed/cycle-time story, as distinct from "Availability" the uptime story and "Quality"
the good-parts story) reads as one leg of the familiar A/P/Q triad. The formula is
unchanged from ISO; only the label differs. Record this mapping once, here — do not
re-derive it per screen or PRD.

#### Micro-stops, small stops, and downtime (PO, 2026-10-01)

How long a stop lasts decides which KPI it hurts. Two thresholds set the boundaries:
`min_stop_seconds` (default 60 s) and `small_stop_max_seconds` (default 300 s), set per
work center with optional work unit override. Full setting, lookup order, validation, and
effective dating: [F-12 stop thresholds](12-configuration-service.md#confirmed-first-release-item-stop-thresholds-po-2026-10-01).

| Stop length | Counted as | KPI it lowers |
|---|---|---|
| shorter than `min_stop_seconds` | **not a stop event** — no downtime row; the lost time stays inside APT | **Performance** (speed loss: fewer items in the same APT) |
| `min_stop_seconds` up to `small_stop_max_seconds` | `small_stop` | **Performance** (not Availability) |
| longer than `small_stop_max_seconds` | real downtime, `planned` or `unplanned` by `DOWNTIME_REASON.downtime_category` | `planned` → removed before PBT; `unplanned` → **Availability** |

The same thresholds apply whether the stop came from a stalled counter or from an analog value
leaving its band ([F-07.1](07-1-kpi-tag-mapping.md#how-downtime-gets-detected-from-a-stalled-counter)).
A shift uses the thresholds valid on its `business_date`; changing them never recalculates a
closed shift.

#### Item unit of PRI and PQ (PO, 2026-09-28)

`PRI × PQ` only means something when both are in the **same item unit**. PRI is per
`OPERATION.uom_id` (pack, carton, kg — [F-08 §9.2.1](08-work-master.md#921-item-unit-and-conversion-po-2026-09-28));
PQ from a counter is in that tag's `ASSET_TAGS.uom_id`. When they differ, PQ is converted to
`OPERATION.uom_id` first, through the product's `PRODUCT_UOM_CONVERSION` rows active on the
`business_date` ([F-06 §9.4](06-product.md#94-product_uom_conversion--fromto-uom-conversion-factor-scoped-to-one-product)).
For a discrete/batch work unit the ideal time `PRI × PQ` is computed in this order:

```
count_basis = 'unit':   cycles = convert(sensor_count, tag uom → OPERATION.uom_id) / batch_size
count_basis = 'cycle':  cycles = sensor_count            (a cycle has no item unit to convert)
ideal_seconds (PRI × PQ) = cycles × cycle_time_value × TIME_CONVERSIONS.seconds_per_unit
Performance = ideal_seconds / APT
```

Example: WU_02 standard 216 s / carton, counter reports 1,200 pack, product conversion
1 carton = 12 pack → 1,200 ÷ 12 = 100 carton → 100 × 216 s = 21,600 s ideal time. With APT =
25,200 s (7 h), Performance = 21,600 / 25,200 = **85.7%**.

**Edge case:** no conversion path between the tag's unit and `OPERATION.uom_id` on the
`business_date` (row missing or closed) → Performance for that segment is **"cannot be
calculated"**, with the reason naming both units and the product. Never 0%, never the raw,
unconverted count. In a multi-SKU period the segment is excluded and the total flagged partial,
the same as a segment with no `OPERATION` ([F-07.1](07-1-kpi-tag-mapping.md#more-than-one-sku-in-the-same-period)).
Quality ratio (`GQ / PQ`) **calculates in one unit: the step's `OPERATION.uom_id`** (PO 2026-10-01, PRD-003 Q-28). Every
input is brought to that unit before GQ and PQ are formed, the same way PQ is converted above (`PRODUCT_UOM_CONVERSION`
active on `business_date`; for kg, the weight of one unit at this step — see
[Reject entered manually](#reject-entered-manually-in-any-unit--convert-to-the-step-unit-and-time-po-2026-09-30-2026-10-01)).
Two separate rules apply:

- **PLC tags** bound to Quality slots must still share one `ASSET_TAGS.uom_id`, **enforced when the tags are bound** — a
  mismatch is refused by the binding editor ([F-07.1 §9.4](07-1-kpi-tag-mapping.md#94-work_unit_kpi_binding), PO
  2026-09-28, [2026-09-28 decision](../../../LOGS/decisions/2026-09-28-work-master-per-domain-operation-uom.md)). This
  catches wiring mistakes; it is not a conversion rule.
- **Manual reject entry** may be in any unit that has a conversion path to `OPERATION.uom_id` for that product. The
  entered unit is stored on the reject row (PRODUCTION `WORK_ORDER_OPERATION_DEFECT.uom_id`) and converted before Quality
  is calculated.

### Quality (ISO "Quality ratio," Clause 6, Table 11)

```
Quality ratio = GQ / PQ
```

ISO description: "The quality ratio is the relationship between the good quantity (GQ)
and the produced quantity (PQ)." Unit: %. Range: 0–100%. Trend: higher is better. ISO
note: "This indicator is usable as real-time indicator for the operator level."

#### Which standard, and batch work units (PO, 2026-09-30, issue #58)

- **Standard as of the run date (Q1).** Performance reads the step's standard (cycle time or speed, and a
  station's override — [F-08 §9.2.2](08-work-master.md#922-operation_work_unit--which-stations-can-run-a-class-based-step-po-2026-09-30))
  valid on the shift's `business_date`, not the value at work-order release. A back-dated fix recalculates the
  affected past shifts (the editor warns; `AUDIT_LOG` records it).
- **Batch vs discrete** comes from `WORK_CENTER.type`: `process_cell` = batch, `production_line` = discrete.
- **Batch start and end (Q6):** the job step's start and close, or — on a process cell running without a job —
  the machine's `lot_marker` tag (rising edge = start, falling edge = end, [F-04 §9.7](04-asset-ontology.md)).
  With neither, the batch's Performance stays "pending".
- **A batch's output is known when it closes.** It is then split across the shifts and work units it ran on,
  **weighted by running time from `ASSET_STATE_LOG`**, never by clock hours (ISO 22400-2 Table 7; Q5). Until it
  closes, earlier shifts show Performance as **"pending, batch open"**; Availability shows normally. When it
  closes, those shifts are recalculated.
  Example: a batch runs 3 h in shift 1 and 1 h in shift 2 (running time) and closes with 800 kg → 600 kg to shift
  1, 200 kg to shift 2.
- **Input-side counters** (`ASSET_TAGS.count_side = input`) are converted to output with the step ratio and marked
  `derived`; a measured output count always wins.

#### Reject entered manually, in any unit — convert to the step unit and time (PO, 2026-09-30, 2026-10-01)

Some work units have **no reject sensor**: the operator enters the reject per work unit (PRODUCTION's reject entry,
`WORK_ORDER_OPERATION_DEFECT`). **The unit depends on the SKU and the site** — one SKU's reject is weighed (kg), another
is counted (pcs, punch). The operator picks the unit; it is stored on the reject row
(`WORK_ORDER_OPERATION_DEFECT.uom_id`). No new field (PO 2026-10-01, PRD-003 Q-28).

Before Quality is calculated, the reject is brought to the step's `OPERATION.uom_id`:

| Entered unit | Conversion |
|---|---|
| Same as `OPERATION.uom_id` (e.g. pieces at a step counted in pieces) | None |
| Another count/pack unit of the product | `PRODUCT_UOM_CONVERSION` active on `business_date` — same path as PQ in [Item unit of PRI and PQ](#item-unit-of-pri-and-pq-po-2026-09-28) |
| Weight (kg) | Weight of one unit at this step — below |

Weight is converted with numbers the step already has
([decision](../../../LOGS/decisions/2026-09-30-line-across-work-centers-reject-weight.md)):

```
reject units = reject weight ÷ weight of one unit at THIS step
reject time  = reject units × cycle time of THIS step (per unit; ÷ batch_size when the standard is per cycle)
```

- **Weight of one unit at this step** — derived from `PRODUCT_DETAIL.standard_weight` and the `planned_shrinkage` of
  later steps ([F-08 line across work centers](08-work-master.md#a-line-across-several-work-centers--biscuit-example-po-2026-09-30)),
  or, for a count unit such as `punch`, the declared weight of one unit (`1 punch = 20 g`). Wet before the shrinkage
  step, dry after it — each step uses its own weight, so wet and dry never mix.
- **Cycle time** — the step's `OPERATION` standard, in the same unit.

**Example (biscuit line, example data).** Mold, wet, counted in punches: 2 kg ÷ 20 g = **100 punches** → × 1 s =
**100 s lost**. Oven, dry, counted in pieces: 0.5 kg ÷ 0.96 g = **521 pcs** → × the oven's time per piece (e.g.
0.05 s) = **26 s lost**.

**Quality ratio at that work unit** uses the converted units, so GQ and PQ stay in one unit (the rule above): the
Mold counted 3,600 punches, reject = 100 punches → Quality = (3,600 − 100) ÷ 3,600 = **97.2%**.

**Edge cases.**

| Case | Result |
|---|---|
| No weight of one unit at that step (no `standard_weight`, or no weight for the count unit) | Reject stored in kg; Quality "cannot be calculated", reason "Weight per unit missing" — never a guessed number |
| Entered in a unit with no conversion path to `OPERATION.uom_id` for that product on `business_date` | Reject stored as entered; Quality "cannot be calculated", reason "No conversion for this unit" naming both units and the product — never a guessed number |
| No cycle time on the step | Reject units shown, reject time "cannot be calculated", reason "Cycle time missing" |
| Converted reject > the step's counted output for the period | Entry refused: "Reject is more than this shift's output" |
| No output count at all on that work unit (reject known, total unknown) | Reject time is exact; Quality ratio is shown only as **estimated** (total ≈ running time ÷ cycle time, which assumes full speed and overstates Quality), labelled as such |
| Entered after the shift closed | Accepted; that shift's KPIs are recalculated, same as other late corrections |

#### Rejects across work units add up in time, never in weight (PO, 2026-09-30)

1 kg of wet dough and 1 kg of baked biscuit are not the same amount of product. When rejects of several work units
are combined (a line, a work center, a site), each is first converted to **reject time** at its own step (above),
and the times are added. Adding kg across steps is not allowed. This follows the existing rule that roll-ups add
base terms, never averages.

### OEE (ISO "Overall equipment effectiveness index," Clause 6, Table 7)

```
OEE index = Availability × Effectiveness × Quality ratio
```

ISO description: "The OEE index represents the availability of a work unit, the
effectiveness of the work unit, and the quality ratio KPIs integrated in a single
indicator." Unit: %. Range: 0–100%. Trend: higher is better. ISO note: "OEE forms the
basis for improvements by better production information, identification of production
losses, and improvement of product quality by optimized processes," and warns that
comparing OEE across the equipment hierarchy is "only useful if the characteristics of
the work unit processes would be comparable" — benchmark criteria should be checked
first.

**In Molca's naming: `OEE = Availability × Performance × Quality`.** Same three factors,
Molca's Performance is ISO's Effectiveness (above).

## Newly adopted KPIs (2026-09-10)

> Added on Product Owner request to widen ISO 22400-2 adoption beyond the original v1
> Production OEE family. Same rule as everything above: adopted only because every
> variable already resolves to a field that exists today — no invented fields. Binding
> mechanics (which tag/field fills which slot) are in
> [F-07.1](07-1-kpi-tag-mapping.md#newly-adopted-kpis-2026-09-10). All four bind at
> **Work Unit** scope, same grain as Availability/Performance/Quality (per `WORK_UNIT` ×
> `SHIFT_INSTANCE`, via `WORK_ORDER_OPERATION`).

### Scrap ratio (ISO Clause 6 catalog, Quality domain)

```
Scrap ratio = SQ / PQ
```

Both SQ (Scrap quantity, §5.5.2) and PQ (Produced quantity, §5.5.6) are already-adopted
v1 elements — see [Logistical and quality elements](#logistical-and-quality-elements-clause-55-56).
Source: `WORK_ORDER_OPERATION.scrap_qty` / (`good_qty` + `scrap_qty` + `rework_qty`), same
row PQ/GQ/SQ already read for Quality. **Example:** shift produces 1,000 total, 950 good,
50 scrap → Scrap ratio = 50 / 1,000 = **5%**. **Edge case:** `PQ = 0` → "cannot compute,"
not 0%, same rule as Quality.

### Rework ratio (ISO Clause 6 catalog, Quality domain)

```
Rework ratio = RWQ / PQ
```

**RWQ (Rework quantity)** is a **new element**, not previously adopted: Molca reads it
from `WORK_ORDER_OPERATION.rework_qty` (PRODUCTION), the same field already named in
`total_output = good_qty + scrap_qty + rework_qty` ([01-planning.md § WORK_ORDER_OPERATION](../../PRODUCTION/DOCS/01-planning.md#work_order_operation--execution-and-output-per-shift)).
**Example:** 1,000 total, 950 good, 30 scrap, 20 rework → Rework ratio = 20 / 1,000 =
**2%**. **Edge case:** `PQ = 0` → "cannot compute."

### Throughput rate (ISO Clause 6 catalog, Production domain)

```
Throughput rate = PQ / AOET
```

**AOET (Actual order execution time)** is a **new element**, not previously adopted:
Molca reads it as `WORK_ORDER_OPERATION.actual_end − WORK_ORDER_OPERATION.actual_start`
(PRODUCTION) for the same row PQ is read from — the actual wall-clock window that
operation ran at that work unit, in that shift. **Example:** operation ran from 08:00 to
08:30 (30 min) and produced 600 units → Throughput rate = 600 / 30 = **20 units/min**.
**Edge case:** `actual_start`/`actual_end` not yet recorded (operation still open, or
never captured) → "no data," not a divide-by-zero 0.

### Production process ratio (ISO Clause 6 catalog, Production domain)

```
Production process ratio = APT / AOET
```

APT (Actual production time) is the same already-adopted Availability numerator; AOET is
the element defined above. **Example:** APT 378 min (from the Availability walkthrough in
[F-07.1](07-1-kpi-tag-mapping.md#availability)), AOET (that operation's actual window) 400
min → Production process ratio = 378 / 400 = **94.5%**. **Edge case:** `AOET = 0` or not
yet recorded → "no data."

**Not adopted alongside these:** Allocation ratio, Allocation efficiency, Utilization
efficiency, NEE index, Setup ratio, Technical efficiency, Equipment load ratio, Fall-off
ratio — see the [deferred catalog](#deferred-iso-22400-2-kpis--why-each-is-blocked) for why
each specific one is still blocked, even though some of them share AOET or PQ with the four
above.

## New scope bindings (2026-09-10, second chart)

> Same K-4 discipline, applied to a second ISO 22400-2 chart the Product Owner supplied,
> covering the scopes the first chart didn't show (Production order, Defect type, Time
> period, Worker/workgroup, Stock, Plant, Characteristic/measurements, Production order
> sequence). A KPI already adopted at Work Unit scope is **not** automatically adopted at
> a new scope — each combination is checked on its own against whether
> `KPI_RESULT.aggregation_level`/`period` ([F-07.1 §9.5](07-1-kpi-tag-mapping.md#95-kpi_result))
> actually supports that scope, not just whether the formula's variables exist.

### Time period scope — adopted, no new modeling needed

`KPI_RESULT.period` is already typed as "`shift_instance_id`, **or an explicit
`business_date` range**" ([F-07.1 §9.5](07-1-kpi-tag-mapping.md#95-kpi_result)) — that
second option already **is** "Time period" scope; nothing new to build. **Availability,
Performance (ISO Effectiveness), Quality ratio, OEE index** — the same Work Unit formulas
already adopted — are adopted over an explicit date range the identical way they're adopted
per shift: sum the same numerator/denominator terms (APT, PBT, PRI×PQ, GQ, PQ) across every
`SHIFT_INSTANCE` in the range, `sum_of_terms`, never an average of per-shift percentages
(same rollup discipline as the existing [OEE rollup rule](07-1-kpi-tag-mapping.md#oee)).
**NEE index stays `⛔ not yet`** at this scope too — it's blocked on AUPT (an element not
adopted at any scope), unrelated to Time period.

### Plant scope — adopted for Throughput rate and Production process ratio

"Plant" maps to **Site** in [01-site-hierarchy.md](01-site-hierarchy.md) ("a physical
factory location") — and `KPI_RESULT.aggregation_level` already has a `site` value
([F-07.1 §9.5](07-1-kpi-tag-mapping.md#95-kpi_result)), used today for Availability/OEE
rollups. **Throughput rate** (`PQ / AOET`) and **Production process ratio** (`APT / AOET`)
roll up to `site` the same `sum_of_terms` way: `ΣPQ / ΣAOET` and `ΣAPT / ΣAOET` across every
work unit at the site, never an average of per-line ratios. No new field, no new
`aggregation_level` value — this is the existing rollup rule applied to two KPIs that
weren't checked against it before. **Allocation ratio stays `⛔ not yet`** at Plant scope
too — it's blocked on AUBT (not adopted at any scope), unrelated to the aggregation level.

### Production order scope — adopted 2026-09-10

**Resolved same day, after this section first shipped as "blocked."** PO decision
(2026-09-10): `KPI_RESULT.aggregation_level` gains a `work_order` value, resolving to
PRODUCTION's `WORK_ORDER.work_order_id` — the only Job Order concept that exists today
(Production owns it; Maintenance/Quality/Inventory don't have one yet — see the forward
note in [F-07.1](07-1-kpi-tag-mapping.md#production-order-scope-2026-09-10-po-decision)).
This does **not** invent a new global `WORK_ORDER` concept shared by all domains — it
wires the gap to the one Job Order entity that already exists, per owning domain, exactly
as PO scoped it.

Allocation ratio, Throughput rate, Production process ratio, Allocation efficiency, Setup
ratio, Technical efficiency, Scrap ratio, Rework ratio, First pass yield (FPY), and
Fall-off ratio all appear at Production order scope on the chart:

- Allocation ratio, Allocation efficiency, Setup ratio, Technical efficiency — **still
  blocked**, same AUBT/AUST/AUPT/ADET element gaps as Work Unit scope (see
  [scope table](#scope-which-parts-of-iso-22400-2-molca-adopts)), independent of scope.
  Resolving the aggregation-level gap does not touch these — their blocker is the
  missing element, not the missing scope.
- FPY — **still blocked**, same "Inspected part" / Quality-domain gap as Work Unit scope.
- **Throughput rate, Production process ratio, Scrap ratio, Rework ratio — adopted.**
  Every variable (PQ, AOET, APT, SQ, RWQ) already existed per `WORK_ORDER_OPERATION` row;
  the missing piece was aggregating those rows to one `WORK_ORDER`, now resolved by the
  `work_order` aggregation level: `ΣPQ/ΣAOET`, `ΣAPT/ΣAOET`, `Σscrap_qty/Σtotal_output`,
  `Σrework_qty/Σtotal_output` across every `WORK_ORDER_OPERATION` row sharing that
  `work_order_id`, same `sum_of_terms` rollup discipline as Plant scope. Full wiring in
  [F-07.1](07-1-kpi-tag-mapping.md#production-order-scope-2026-09-10-po-decision).
- **Fall-off ratio — adopted, newly re-verified.** `(Produced quantity at first
  operation − Good quantity at current operation) / Produced quantity at first
  operation)` — both variables resolve to fields that already exist on
  `WORK_ORDER_OPERATION`: "produced quantity at first operation" is `total_output`
  (`good_qty + scrap_qty + rework_qty`) summed across every `WORK_ORDER_OPERATION` row
  for that `work_order_id` whose `operation_id` is the routing's first step
  (`OPERATION.step_number` minimum); "good quantity at current operation" is `good_qty`
  summed across every row for that `work_order_id` and the `operation_id` being
  evaluated. No missing variable — the blocker was purely the aggregation-level gap, now
  resolved the same way as the four ratios above. Formula, worked example, and edge cases
  in [F-07.1](07-1-kpi-tag-mapping.md#production-order-scope-2026-09-10-po-decision).

### Defect type scope — blocked, two gaps (one old, one new)

Scrap ratio, Rework ratio, FPY, and several Inventory-domain ratios (Actual to planned
scrap ratio, Finished/Integrated goods ratio, Production/Storage-transportation/Other loss
ratio) appear at Defect type scope, alongside OEE index, NEE index, Effectiveness, Quality
ratio.

**The defect-code split itself already exists as data**, contrary to what "no field
exists" would suggest: `WORK_ORDER_OPERATION_DEFECT` (PRODUCTION,
[01-planning.md § WORK_ORDER_OPERATION](../../PRODUCTION/DOCS/01-planning.md#work_order_operation--execution-and-output-per-shift))
is one row per `defect_code_id` (FK → FOUNDATION's `REJECT_REASON` since 2026-09-23 — was `QUALITY_DEFECT_CODE`; PRODUCTION's field rename pending) per
`WORK_ORDER_OPERATION`, carrying a `qty`. So Scrap ratio/Rework ratio **could** be broken
down by defect code by grouping `WORK_ORDER_OPERATION_DEFECT.qty` by `defect_code_id`
instead of by disposition — but two things still block adopting it:

1. **`KPI_RESULT.aggregation_level` has no `defect_code` value either** — same class of
   gap as Production order scope above, not the same instance (a defect-code dimension is
   a different axis than a work-order roll-up; resolving one doesn't resolve the other).
2. **`REJECT_REASON.disposition` (`scrap`/`rework`) doesn't exist yet** — this is
   **not a new gap**, it's the already-open **T-6** (was F-08 W-9, [05-reference-master-data.md §9.6](05-reference-master-data.md#96-whats-still-unknown)),
   needed even for the un-split `scrap_qty`/`rework_qty` totals `WORK_ORDER_OPERATION`
   already reads. A per-defect-code breakdown inherits the same open item, it doesn't add
   a second field gap.

**FPY** stays blocked the same reason as every scope — Quality domain / "Inspected part."
The **Inventory-domain ratios** (Actual to planned scrap ratio, Finished/Integrated goods
ratio, Production/Storage-transportation/Other loss ratio) stay blocked for the same
reasons already in the [deferred catalog](#deferred-iso-22400-2-kpis--why-each-is-blocked)
("Planned scrap quantity" field, "Consumed material"/Inventory domain) — Defect type scope
doesn't change either answer.

**OEE index, NEE index, Effectiveness, Quality ratio at Defect type scope — not adopted,
and not simply "blocked pending a field."** None of these formulas has a variable keyed by
defect code: `APT`, `PBT`, `PRI` are time/cycle elements with no defect dimension, and
`GQ` (good quantity) by definition excludes defective output, so it can't be sliced by
*which* defect occurred. Flagging this here rather than adopting or silently dropping it —
`TBD — perlu konfirmasi PO`: does "Defect type" scope for these four in the source chart
mean something other than "compute this ratio filtered to one defect code" (e.g. Pareto
context, or the chart's grouping is looser than a literal per-KPI scope binding)?

### Stock, Characteristic/measurements, Worker/workgroup — re-checked, no change

- **Stock — Inventory turns** (`Throughput / Average inventory`): still blocked, same
  reason as every Inventory-domain KPI — no Inventory domain exists
  ([deferred catalog](#deferred-iso-22400-2-kpis--why-each-is-blocked)). No new
  information in this chart changes that.
- **Characteristic, series of measurements — Cm, Cmk, Cp, Cpk**: still blocked — SPC
  sample statistics and specification limits need a Quality domain that doesn't exist.
  Same reason as before, confirmed, not re-derived.
- **Worker, workgroup — Worker efficiency**: still blocked — personnel time is explicitly
  out of FOUNDATION's scope (IDP owns roles/attendance). Same reason as before, confirmed.

### Production order sequence — Fall-off ratio

This chart's scope label ("Production order sequence") is the source name for the item
previously carried in the [deferred catalog](#deferred-iso-22400-2-kpis--why-each-is-blocked)
as "order-scope aggregation." **Resolved 2026-09-10** (PO decision) — see
[Production order scope — adopted](#production-order-scope--adopted-2026-09-10) above for
the formula, and [F-07.1](07-1-kpi-tag-mapping.md#production-order-scope-2026-09-10-po-decision)
for the full wiring and worked example.

## Deferred ISO 22400-2 KPIs — why each is blocked

> Revisited 2026-09-10 alongside the four adoptions above. Every row below was checked
> against FOUNDATION, PRODUCTION, and MAINTENANCE's actual current data model — not
> assumed blocked. A row moves out of this table only when the missing field/entity/domain
> it names actually gets built, same K-4 discipline as the rest of this file.

| KPI | Formula | Reason blocked |
|---|---|---|
| Worker efficiency | Actual personnel work time / Actual personnel attendance time | Personnel time is explicitly out of FOUNDATION's scope by design ([F-00](00-foundation.md) — roles/attendance live in the IDP, not modeled here). `TBD — perlu konfirmasi PO`: is Personnel attendance time ever meant to live in MolcaDx, and if so, which domain owns it? |
| Allocation ratio | Actual unit busy time / Actual order execution time | Actual unit busy time (AUBT) — setup + production + repair time as one tracked element — is not adopted; no entity separates setup/repair time from production time today |
| Allocation efficiency | Actual unit busy time / Planned busy time | Same AUBT gap as above |
| Utilization efficiency | Actual production time / Actual unit busy time | Same AUBT gap as above |
| NEE index | (Actual unit processing time / Planned busy time) × Effectiveness × Quality ratio | Actual unit processing time (AUPT) is not adopted — no entity tracks processing time separately from APT |
| Setup ratio | Actual unit setup time / Actual unit processing time | Actual unit setup time (AUST) and AUPT are not adopted — no entity tracks setup time as its own interval (`ASSET_STATE_LOG`/`DOWNTIME_REASON` categorizes planned/unplanned, not setup specifically) |
| Technical efficiency | Actual production time / (Actual production time + Actual unit delay time) | Actual unit delay time (ADET) is not adopted — no entity tracks delay time as its own category |
| Equipment load ratio | Produced quantity / Equipment production capacity | No "equipment production capacity" field exists on `ASSET`, `ASSET_TYPE`, `WORK_UNIT`, or `OPERATION`. `TBD — perlu konfirmasi PO`: should a capacity field be added to Equipment Taxonomy ([04-asset-ontology.md](04-asset-ontology.md)) or Work Master, and at what grain (per asset type, per work unit)? |
| ~~Fall-off ratio~~ | ~~(Produced quantity at first operation − Good quantity at current operation) / Produced quantity (first operation)~~ | **Resolved 2026-09-10 (PO decision) — moved to adopted.** `KPI_RESULT.aggregation_level` gained a `work_order` value resolving to PRODUCTION's `WORK_ORDER.work_order_id`; both variables already resolved to `WORK_ORDER_OPERATION` fields. See [Production order scope — adopted](#production-order-scope--adopted-2026-09-10) |
| Scrap ratio / Rework ratio / First pass yield (FPY), by defect type | Same formulas as above, broken down per `REJECT_REASON` (was `QUALITY_DEFECT_CODE`, merged 2026-09-23) | **New row, 2026-09-10 (second ISO chart).** `WORK_ORDER_OPERATION_DEFECT` (PRODUCTION) already carries qty per `defect_code_id`, but two gaps block adoption: (1) `KPI_RESULT.aggregation_level` has no `defect_code` value — a different axis than the (now-resolved) order-scope gap, not resolved by that fix; (2) disposition now lives on `WORK_ORDER_OPERATION_DEFECT` (T-6 closed 2026-09-24) — remaining gap is `KPI_RESULT.aggregation_level` lacking a `defect_code` axis value, not disposition. FPY stays blocked for its own reason (Quality domain) regardless. See [New scope bindings](#new-scope-bindings-2026-09-10-second-chart) |
| Actual to planned scrap ratio | Scrap quantity / Planned scrap quantity | No "planned scrap quantity" field exists on `WORK_ORDER`, `WORK_ORDER_OPERATION`, `ROUTING`, or `BOM` |
| First pass yield (FPY) | Good part / Inspected part | "Inspected part" implies a QC inspection/sampling record, which needs a Quality domain that doesn't exist yet (`AGENTS.md` §3 — Quality is a planned, not active, domain) |
| Machine capability index (Cm) | (USL − LSL) / (6 × standard deviation) | Needs specification limits (USL/LSL) and SPC sample statistics — no such fields exist anywhere in FOUNDATION; requires a Quality domain that doesn't exist yet |
| Critical machine capability index (Cmk) | min[(USL − mean) / (3σ), (mean − LSL) / (3σ)] | Same as Cm — Quality domain / SPC data required |
| Process capability index (Cp) | (USL − LSL) / (6 × estimated deviation) | Same as Cm — Quality domain / SPC data required |
| Critical process capability index (Cpk) | min[(USL − avg of avgs) / (3× est. dev.), (avg of avgs − LSL) / (3× est. dev.)] | Same as Cm — Quality domain / SPC data required |
| Corrective maintenance ratio | Corrective maintenance time / (Corrective maintenance time + Preventive maintenance time) | MAINTENANCE currently only models `ASSET_COMPONENT_LINK` (installation/swap history) — no work order, PM/CM time tracking exists yet ([MAINTENANCE/DOCS-EN/01-asset-history.md](../../MAINTENANCE/DOCS-EN/01-asset-history.md)) |
| Mean time to failure (MTTF) | Σ time to failure / failure event count | **Adopted 2026-09-24** as mean TTF on unplanned stops — see [Reliability elements](#reliability-elements-iso-clause-514) and [F-07.1](07-1-kpi-tag-mapping.md#mttr-mttf-and-mtbf-from-unplanned-downtime-only) |
| Inventory turns | Throughput / Average inventory | Needs an Inventory domain (stock levels) that doesn't exist yet |
| Finished goods ratio | Good quantity / Consumed material | "Consumed material" (actual material consumption against a `BOM_LINE`) isn't tracked anywhere — `BOM_LINE` is a standard recipe, not a consumption transaction. Needs an Inventory domain |
| Integrated goods ratio | Integrated good quantity / Consumed material | Same "Consumed material" gap, plus "Integrated good quantity" isn't a Molca concept anywhere |
| Production loss ratio | Production loss / Consumed material | Same "Consumed material" gap |
| Storage and transportation loss ratio | Storage and transportation loss / Consumed material | Same "Consumed material" gap; also needs an Inventory domain for warehouse/transport loss events |
| Other loss ratio | Other loss / Consumed material | Same "Consumed material" gap |
| Comprehensive energy consumption | (Σ metered energy by type × conversion coefficient + net energy exchange) / Produced quantity | No energy-metering entity exists anywhere in FOUNDATION, PRODUCTION, or MAINTENANCE |
| TEEP | OEE index × Utilization, Utilization = Planned busy time / Calendar time | No "Calendar time" element adopted (see [above](#production-domain-14-kpis)); not one of the 34 Clause 6 KPIs to begin with |

### MTTF (Mean time to failure) — adopted 2026-09-24

Earlier check (2026-09-10) left MTTF unadopted (no separate ISO element transcribed; MAINTENANCE had no failure-event entity). **Superseded 2026-09-24:** ISO 22400-2 §5.1.4 implies **TBF = TTF + TTR**, so TTF is the gap that makes MTBF = MTTR + MTTF. Molca adopts **MTTF** as the mean restart→next-unplanned-stop gap on the same unplanned `ASSET_STATE_LOG` intervals already used for MTTR — see [Reliability elements](#reliability-elements-iso-clause-514) and [F-07.1](07-1-kpi-tag-mapping.md#mttr-mttf-and-mtbf-from-unplanned-downtime-only).

Rich CM/PM failure history may still later live in MAINTENANCE; that does not block the Production reliability triad on unplanned stops.

## What Molca does not seed from this

| Concept | Why it stays out of v1 |
|---|---|
| `KPI_INDEX` / `KPI_PARAMETERS` / `KPI_FORMULA` as seeded master data | **Resolved (K-1):** fixed OEE-family recipes live in the product/job, not a per-plant-editable table. A seeded formula table lets a plant "design" Availability; every site would drift. |
| The other 25 ISO KPIs (worker efficiency, allocation/utilization efficiency, NEE index, setup ratio, FPY, process capability, inventory/logistics ratios, …) | **Resolved (K-4), widened 2026-09-10:** out of scope — see the [deferred catalog](#deferred-iso-22400-2-kpis--why-each-is-blocked) for the reason per KPI. Scrap ratio, Rework ratio, Throughput rate, and Production process ratio moved **into** scope 2026-09-10 — see [Newly adopted KPIs](#newly-adopted-kpis-2026-09-10). Fall-off ratio moved into scope the same day (Production order scope only) — see [Production order scope — adopted](#production-order-scope--adopted-2026-09-10). |

## ISO 22400-2 — full KPI catalog by MOM domain (reference)

> Source: the team's ISA-95/IEC 62264 + ISO 22400 working canvas
> (`operational-intelligence/iec-ios.tldraw`), diagram "ISO 22400-2 — KPIs by MOM Domain
> (33 of 34)". This regroups the same 33 KPIs from Clause 6 by **IEC 62264 MOM activity
> domain** (production / quality / maintenance / inventory operations management) instead
> of by ISO table structure. It is a **reference catalog**, not an adoption decision — only
> the nine KPIs in the [scope table](#scope-which-parts-of-iso-22400-2-molca-adopts) marked
> ✅ (Availability, Effectiveness/Performance, Quality ratio, OEE index, Throughput rate,
> Production process ratio, Scrap ratio, Rework ratio, Fall-off ratio) are built into Molca
> today — Fall-off ratio only at Production order scope, the rest at Work Unit scope (some
> also at Time period/Plant/Production order scope, see the [scope table](#scope-which-parts-of-iso-22400-2-molca-adopts)).
> Everything else below stays `⛔ not yet` until a Product Owner call widens the scope
> table further, per [K-4](#scope-which-parts-of-iso-22400-2-molca-adopts). Reasons are in
> the [deferred catalog](#deferred-iso-22400-2-kpis--why-each-is-blocked).

### Production domain (14 KPIs)

| KPI | Formula |
|---|---|
| Worker efficiency | Actual personnel work time / Actual personnel attendance time |
| Allocation ratio | Actual unit busy time / Actual order execution time |
| **Throughput rate** ✅ | Produced quantity / Actual order execution time |
| Allocation efficiency | Actual unit busy time / Planned busy time |
| Utilization efficiency | Actual production time / Actual unit busy time |
| **OEE index** ✅ | Availability × Effectiveness × Quality ratio |
| NEE index | (Actual unit processing time / Planned busy time) × Effectiveness × Quality ratio |
| **Availability** ✅ | Actual production time / Planned busy time |
| **Effectiveness** ✅ (Molca: Performance) | (Planned run time per item × Produced quantity) / Actual production time |
| Setup ratio | Actual unit setup time / Actual unit processing time |
| Technical efficiency | Actual production time / (Actual production time + Actual unit delay time) |
| **Production process ratio** ✅ | Actual production time / Actual order execution time |
| Equipment load ratio | Produced quantity / Equipment production capacity |
| TEEP (Total Effective Equipment Performance) | OEE index × Utilization, where Utilization = Planned busy time / Calendar time |

**TEEP is not one of the ISO 22400-2 Clause 6 KPIs** (it's outside the 34-KPI catalog this
canvas covers) — it's the wider industry-standard OEE extension that also charges the time a
work unit was never scheduled at all. Molca's canvas lists it next to OEE and Utilization as
a bullet, not as a formal card in the 33/34 grouping; it's placed in Production here because
it's built entirely from Production-domain elements (OEE plus Planned busy time / Calendar
time), same reasoning as TBF/TTR above. `⛔ not yet` per the [scope table](#scope-which-parts-of-iso-22400-2-molca-adopts) —
Molca v1 has no "Calendar time" element to build Utilization from.

**TBF, TTF, and TTR also sit in Production, not only Maintenance.** The canvas groups MTBF/MTTF/MTTR
under Maintenance as aggregate KPIs, but their inputs — [TBF / TTF / TTR](#reliability-elements-iso-clause-514)
— are measured off the production equipment's own downtime intervals (Molca: unplanned
`ASSET_STATE_LOG` on the production asset), not off a separate maintenance-system record.
**v1:** Production computes MTTR / MTTF / MTBF from those intervals (F-07.1). Maintenance may
later enrich with CM/PM history; it does not own a second formula path for the same means.

| Element | Formula |
|---|---|
| Time between failures (TBF) | §5.1.4.1 — actual unit busy time between two consecutive failures (setup + production + repair time, no delay time) |
| Time to repair (TTR) | §5.1.4.2 — actual time a work unit is unavailable due to a failure |

### Quality domain (10 KPIs)

| KPI | Formula |
|---|---|
| Machine capability index (Cm) | (Upper specification limit − Lower specification limit) / (6 × standard deviation) |
| Critical machine capability index (Cmk) | min[(USL − mean) / (3 × standard deviation), (mean − LSL) / (3 × standard deviation)] |
| Process capability index (Cp) | (Upper specification limit − Lower specification limit) / (6 × estimated deviation) |
| Critical process capability index (Cpk) | min[(USL − average of averages) / (3 × estimated deviation), (average of averages − LSL) / (3 × estimated deviation)] |
| Actual to planned scrap ratio | Scrap quantity / Planned scrap quantity |
| First pass yield (FPY) | Good part / Inspected part |
| **Scrap ratio** ✅ | Scrap quantity / Produced quantity |
| **Rework ratio** ✅ | Rework quantity / Produced quantity |
| **Fall-off ratio** ✅ (Production order scope only) | (Produced quantity at first operation − Good quantity at current operation) / Produced quantity (first operation) |
| **Quality ratio** ✅ | Good quantity / Produced quantity — canvas note: "raw good/defect counter signal" |

### Maintenance domain (4 KPIs)

| KPI | Formula |
|---|---|
| Mean operating time between failures (MTBF) | Σ time between failures / failure event count |
| Mean time to failure (MTTF) | Σ time to failure / failure event count |
| Mean time to repair (MTTR) | Σ time to repair / failure event count |
| Corrective maintenance ratio | Corrective maintenance time / (Corrective maintenance time + Preventive maintenance time) |

Molca's MTTR / MTTF / MTBF on unplanned `ASSET_STATE_LOG` intervals (per work unit) are defined in
[F-07.1](07-1-kpi-tag-mapping.md#mttr-mttf-and-mtbf-from-unplanned-downtime-only) and match the
ISO §5.1.4 relationship in [Reliability elements](#reliability-elements-iso-clause-514)
(MTBF = MTTR + MTTF). This canvas grouping lists all three; no "MWT" beyond what's listed here.

### Inventory operations management domain (6 KPIs)

| KPI | Formula |
|---|---|
| Inventory turns | Throughput / Average inventory |
| Finished goods ratio | Good quantity / Consumed material |
| Integrated goods ratio | Integrated good quantity / Consumed material |
| Production loss ratio | Production loss / Consumed material |
| Storage and transportation loss ratio | Storage and transportation loss / Consumed material |
| Other loss ratio | Other loss / Consumed material |

### Excluded from the domain grouping: comprehensive energy consumption (Table 24)

Doesn't map cleanly to any single MOM domain, so the canvas shows it separately (this is
the 34th KPI — the domain grouping above covers 33 of 34):

```
Comprehensive energy consumption =
  (Σ metered energy consumption by type × conversion coefficient + net energy exchange with environment)
  / Produced quantity
```

## Roadmap: which KPI targets which phase

> A planning table, not an adoption decision. Filling in `Phase` here doesn't adopt
> anything by itself — adoption still means giving the item its own ✅ row in the
> [scope table](#scope-which-parts-of-iso-22400-2-molca-adopts) above and logging the
> change, per [K-4](#scope-which-parts-of-iso-22400-2-molca-adopts). Every row already
> appears in the [MOM domain catalog](#iso-22400-2--full-kpi-catalog-by-mom-domain-reference)
> above; nothing here is a new fact about the standard, only a place to stage when each
> one moves. `Phase` is `TBD` except for the four v1 KPIs, the four v1.1 KPIs adopted
> 2026-09-10, and Molca's two simplified reliability numbers, which are already a settled
> fact per the scope table above — fill in the rest as Product decides.

| KPI | Domain | Formula | Phase |
|---|---|---|---|
| Availability | Production | Actual production time / Planned busy time | v1 (Work Unit + Time period scope, 2026-09-10) |
| Effectiveness (Molca: Performance) | Production | (Planned run time per item × Produced quantity) / Actual production time | v1 (Work Unit + Time period scope, 2026-09-10) |
| OEE index | Production | Availability × Effectiveness × Quality ratio | v1 (Work Unit + Time period scope, 2026-09-10) |
| Worker efficiency | Production | Actual personnel work time / Actual personnel attendance time | TBD |
| Allocation ratio | Production | Actual unit busy time / Actual order execution time | TBD |
| Throughput rate | Production | Produced quantity / Actual order execution time | v1.1 (Work Unit + Plant + Production order scope, 2026-09-10) |
| Allocation efficiency | Production | Actual unit busy time / Planned busy time | TBD |
| Utilization efficiency | Production | Actual production time / Actual unit busy time | TBD |
| NEE index | Production | (Actual unit processing time / Planned busy time) × Effectiveness × Quality ratio | TBD |
| Setup ratio | Production | Actual unit setup time / Actual unit processing time | TBD |
| Technical efficiency | Production | Actual production time / (Actual production time + Actual unit delay time) | TBD |
| Production process ratio | Production | Actual production time / Actual order execution time | v1.1 (Work Unit + Plant + Production order scope, 2026-09-10) |
| Equipment load ratio | Production | Produced quantity / Equipment production capacity | TBD |
| TEEP | Production | OEE index × Utilization, Utilization = Planned busy time / Calendar time | TBD |
| Quality ratio | Quality | Good quantity / Produced quantity | v1 (Work Unit + Time period scope, 2026-09-10) |
| Machine capability index (Cm) | Quality | (USL − LSL) / (6 × standard deviation) | TBD |
| Critical machine capability index (Cmk) | Quality | min[(USL − mean) / (3σ), (mean − LSL) / (3σ)] | TBD |
| Process capability index (Cp) | Quality | (USL − LSL) / (6 × estimated deviation) | TBD |
| Critical process capability index (Cpk) | Quality | min[(USL − avg of avgs) / (3× est. dev.), (avg of avgs − LSL) / (3× est. dev.)] | TBD |
| Actual to planned scrap ratio | Quality | Scrap quantity / Planned scrap quantity | TBD |
| First pass yield (FPY) | Quality | Good part / Inspected part | TBD |
| Scrap ratio | Quality | Scrap quantity / Produced quantity | v1.1 (Work Unit + Production order scope, 2026-09-10) |
| Rework ratio | Quality | Rework quantity / Produced quantity | v1.1 (Work Unit + Production order scope, 2026-09-10) |
| Fall-off ratio | Quality | (Produced quantity at first operation − Good quantity at current operation) / Produced quantity (first operation) | v1.1 (Production order scope, 2026-09-10) |
| Mean operating time between failures (MTBF) | Production (unplanned stops); Maintenance may later enrich | Σ time between failures / failure event count (= MTTR + MTTF) | v1 |
| Mean time to failure (MTTF) | Production (unplanned stops); Maintenance may later enrich | Σ time to failure / failure event count | v1 (adopted 2026-09-24) |
| Mean time to repair (MTTR) | Production (unplanned stops); Maintenance may later enrich | Σ time to repair / failure event count | v1 |
| Corrective maintenance ratio | Maintenance | Corrective maintenance time / (Corrective maintenance time + Preventive maintenance time) | TBD |
| Inventory turns | Inventory operations management | Throughput / Average inventory | TBD |
| Finished goods ratio | Inventory operations management | Good quantity / Consumed material | TBD |
| Integrated goods ratio | Inventory operations management | Integrated good quantity / Consumed material | TBD |
| Production loss ratio | Inventory operations management | Production loss / Consumed material | TBD |
| Storage and transportation loss ratio | Inventory operations management | Storage and transportation loss / Consumed material | TBD |
| Other loss ratio | Inventory operations management | Other loss / Consumed material | TBD |
| Comprehensive energy consumption | Not grouped (Table 24) | (Σ metered energy by type × conversion coefficient + net energy exchange) / Produced quantity | TBD |

Filling in a `Phase` value is Product's call to make here, row by row. Moving a row from
`TBD` into a real phase still requires the same three steps regardless of when it happens:
the missing Foundation element gets modeled somewhere real (F-04, F-05, F-08, or wherever it
belongs), the [scope table](#scope-which-parts-of-iso-22400-2-molca-adopts) above gets its
own ✅ row for it, and the change gets logged per K-4. This table is only the staging area.

## Two things this module does not redefine

| Concept | Owned by |
|---|---|
| Which tag/entity fills each ISO element for one work unit, primary/secondary assets, stall-based downtime detection, multi-SKU segmentation, MTTR/MTTF/MTBF interval math | [F-07.1 — KPI tag mapping](07-1-kpi-tag-mapping.md) |
| Product/behavior metrics (not manufacturing KPIs), PRD baselines/counter-metrics, event tracking conventions | Product Owner, [`04-metrics-framework.md`](../../../DOCS/04-metrics-framework.md) |
| `DOWNTIME_REASON` / `REJECT_REASON` taxonomy | [Reference & Master Data](05-reference-master-data.md) |
| Screens, "always show A/P/Q next to OEE" | `production-domain` |

## 9. Entity specification

**None in v1.** This module does not own `KPI_INDEX`, `KPI_PARAMETERS`, or `KPI_FORMULA`.
The elements above (POT, PBT, APT, PQ, GQ, SQ, PRI) are not stored as their own rows —
each is derived at calculation time from Shift, Equipment Taxonomy, Reference & Master
Data, Work Master, and work-order-operation quantities, per [F-07.1](07-1-kpi-tag-mapping.md).

## Status: what FOUNDATION already provides for `production-domain` to build on

Added 2026-09-03, since this file intersects `production-domain`'s territory (it computes
and displays these numbers; FOUNDATION only supplies the inputs) — a status statement so
that boundary doesn't have to be re-derived by reading every module's open questions.

**Qualified 2026-09-03 (contest review B1/B5) — the "nothing blocks" claim below no longer
holds unconditionally.** Two of the five rows rest on foundations that are themselves
unresolved: `SHIFT_INSTANCE`'s generator has no confirmed owner (B1 — [F-02](02-shift.md)
downgraded `ACTIVE` → `DRAFT`), and `ASSET_STATE_LOG` has no entity specification yet (B5 — ownership
since resolved 2026-09-28: PRODUCTION owns it, [decision 2026-09-28](../../../LOGS/decisions/2026-09-28-asset-status-ownership.md)). A
"Ready" claim citing either of those two is a claim about a table that either isn't owned or
doesn't exist yet — see the qualified rows below.

| Element | Resolves from | Status |
|---|---|---|
| POT, PBT | `SHIFT_INSTANCE` (derived from `SITE_SHIFT`, [F-02 §9](02-shift.md#9-entity-specification)) | **Qualified, not unconditionally Ready (B1, 2026-09-03).** The `SITE_SHIFT` overlap rule holds, and `SHIFT_INSTANCE`'s *structure* is stable, but its *generator* has no confirmed owner — a calc job needs `SHIFT_INSTANCE` rows to actually exist on schedule, and nothing guarantees that yet. Do not build against this as "Ready" until B1 resolves |
| Unplanned downtime, APT | `ASSET_STATE_LOG` + `DOWNTIME_REASON.downtime_category` ([F-04](04-asset-ontology.md), [F-05 §9.1](05-reference-master-data.md)) | **Not Ready (B5).** Owner settled 2026-09-28: PRODUCTION ([decision 2026-09-28](../../../LOGS/decisions/2026-09-28-asset-status-ownership.md)); the entity spec is PRODUCTION's to write ([PRODUCTION Monitoring](../../PRODUCTION/DOCS/02-monitoring.md)). "Ready" cannot be claimed for a table that doesn't exist in the spec yet. `DOWNTIME_REASON.downtime_category` itself (F-05) is fine; the blocker is `ASSET_STATE_LOG` |
| PRI (Performance standard) | `OPERATION.cycle_time_value` + `.time_conversion_id` ([F-08 §9.2](08-work-master.md#92-operation--one-step-of-a-routing-at-one-work-unit-with-its-standard)) | **Ready as of T-4 (resolved 2026-09-02).** Before T-4, `TIME_CONVERSIONS` had no numeric factor at all — `OPERATION.cycle_time_value` pointed at a conversion mechanism that couldn't actually convert anything. It now resolves to a real seconds figure (`cycle_time_value × TIME_CONVERSIONS.seconds_per_unit`), computed, never hand-typed. **2026-09-28:** PRI is per `OPERATION.uom_id` item; a counter in another unit is converted through `PRODUCT_UOM_CONVERSION` first ([above](#item-unit-of-pri-and-pq-po-2026-09-28)) |
| PQ, GQ, SQ | `ASSET_TAGS` (`total`/`good`/`reject` roles) or `WORK_ORDER_OPERATION` job quantities ([F-04 §9.7](04-asset-ontology.md#97-asset_tags--per-asset-tag--signal-declaration)) | Ready |
| Which standard applies (multi-SKU) | `product_code` tag → `ASSET_PRODUCT_CODES` → `PRODUCT` → `OPERATION` ([F-07.1](07-1-kpi-tag-mapping.md#more-than-one-sku-in-the-same-period)) | Ready, with one open edge: **K-5** (changeover-time bucketing) below |

**Still open, Foundation-side, before a fully faithful calc:**

| # | Gap | Owner |
|---|---|---|
| K-5 | Changeover time (between two SKU segments) isn't assigned anywhere yet — stays inside APT and inflates whichever segment's Performance it falls in, a documented distortion not a silent one | PO |
| — | Multi-SKU segment debounce window (PLC-only, no job dispatched) is `TBD` | `production-domain` |
| B1 | **New, 2026-09-03.** `SHIFT_INSTANCE`'s generator (POT/PBT's basis) has no confirmed owner — see [F-02](02-shift.md) H-6, module downgraded to `DRAFT` | unassigned — PO to confirm |
| B5 | `ASSET_STATE_LOG` (APT's basis) — **ownership resolved 2026-09-28: PRODUCTION** ([decision 2026-09-28](../../../LOGS/decisions/2026-09-28-asset-status-ownership.md)). Still waits on PRODUCTION's entity spec, not on FOUNDATION | `production-domain` |

Two of the four v1 KPI numbers (Availability, and any element that touches unplanned
downtime) are **not yet buildable end-to-end** — `production-domain` can model the calc
job's shape today, but PBT and APT specifically wait on B1 and B5 above. PQ/GQ/SQ/PRI
(Performance, Quality) have no such blocker.

## Next step

[F-07.1](07-1-kpi-tag-mapping.md) maps every element above onto a Foundation entity or
`tag_role`. Production applies the result on shopfloor and OEE screens. Widening the
[adopted scope](#scope-which-parts-of-iso-22400-2-molca-adopts) is a Product Owner call,
staged first on the [roadmap checklist](#roadmap-which-kpi-targets-which-phase) above, made
real by editing this file.
