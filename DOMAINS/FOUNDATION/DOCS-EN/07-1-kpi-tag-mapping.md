# F-07.1 — KPI tag mapping (how inputs are wired from Foundation)

> Working spec. v1 seeds `KPI_FORMULA_SLOT`, `KPI_PARAMETERS`, `WORK_UNIT_KPI_BINDING`, and
> `KPI_RESULT` — see [§9](#9-entity-specification). None of these are implementor-writable;
> `KPI_INDEX` / `KPI_FORMULA` as a per-plant-editable table is still not v1, see K-1 in
> [F-07](07-0-kpi-formula.md#what-molca-does-not-seed-from-this).
> Entity spec status: 🟡 DRAFT (tables below; write governance resolved, see K-7).

This module assumes the ISO 22400-2 elements and formulas in
[F-07](07-0-kpi-formula.md) as given. It answers a different question:
**which Foundation entity or tag fills each ISO element for one work unit, and
in what order do the pieces resolve?** Implementors declare **signals**
(`tag_role` on the asset). They do not declare "how we calculate OEE" — that
stays fixed in [F-07](07-0-kpi-formula.md) alone.

**You can show Availability without showing OEE.** Each metric in the Production OEE
family lights up when **its own** inputs exist. Missing a required input → **"no data"**
for that metric, never 0%. OEE is only the product `A × P × Q` when **all three** are
computable. A line with shift + actual stops and no output yet still gets Availability.

## Why it matters

| If you skip this | What happens |
|---|---|
| Treat OEE as one blob | A line that only has downtime data is forced to hide Availability, or fake P and Q as 0% |
| Put PBT on a tag or equal PBT to the shift clock | Violates ISO 22400-2 (`PBT = POT − planned downtime`). The shift fills **POT** only |
| Seed `KPI_FORMULA` per site | Plant "designs" Availability; every site drifts |

## Metrics light up independently

Adopted set = **Production OEE family** plus **MTTR / MTTF / MTBF** from the same unplanned
stops (not a Maintenance module, not extra tags), plus, since 2026-09-10, **Throughput
rate, Production process ratio, Scrap ratio, and Rework ratio** — see
[Newly adopted KPIs (2026-09-10)](#newly-adopted-kpis-2026-09-10) below — plus, also
2026-09-10, **Fall-off ratio** and those same four ratios at **Production order scope** —
see [Production order scope (2026-09-10, PO decision)](#production-order-scope-2026-09-10-po-decision)
below. Formulas for all of these live in [F-07](07-0-kpi-formula.md); this file only wires
inputs.

| Metric | Show when | Hide as |
|---|---|---|
| **Availability** | PBT and APT both computable | "no data" — not 0% |
| **Performance** | Availability inputs + output + the work unit's standard (`OPERATION`) | "no data" |
| **Quality** | good quantity and total output both computable, total > 0 | "no data" (including total = 0 → "cannot compute", not 0%) |
| **OEE** | A, P, and Q all computable | "no data" — do **not** show a lone OEE number |
| **MTTR** | ≥1 **closed** unplanned downtime in the period | "no data" — not 0 s |
| **MTTF** | ≥2 closed unplanned downtimes (so there is a restart→next-stop gap) | "no data" — not 0 s |
| **MTBF** | ≥2 closed unplanned downtimes (MTTR and MTTF both computable) | "no data" — not 0 s |

So: **Availability-only is a valid screen** for a work unit that has a shift instance and
state (sensor or tap) and does not yet have counts or a cycle/speed standard.

If you **do** show OEE, two layout rules apply: never a naked OEE number (always A, P,
and Q), and **always the loss waterfall** for that same period (see OEE below). That is
not optional chrome. Availability-only screens have **no** OEE waterfall — P and Q losses
do not exist yet.

`WORK_CENTER.is_oee_tracked` (when used) means "this line is in the OEE family at all,"
not "always render the composite."

## Where tags live

Tags attach to the **asset**, not to the work unit. KPIs are shown per **work unit**.
At calculation time:

```
WORK_UNIT → ASSET_PLACEMENT (active, primary) → ASSET → ASSET_TAGS
WORK_UNIT → ASSET_PLACEMENT (active, secondary, any count) → ASSET → ASSET_TAGS
```

A work unit can have **one active `primary` placement plus any number of active
`secondary` placements** ([F-04 §9.6](04-asset-ontology.md#96-asset-to-work-unit-placement-rules)).
The primary asset drives Availability and is the downtime-detection reference; a
secondary asset is dedicated auxiliary equipment (e.g. an inline checkweigher) with no
Availability of its own — see
[multiple assets under one work unit](#multiple-assets-under-one-work-unit--primary-vs-secondary).

**Multi-lane machine (2026-09-25, [F-04 §9.6](04-asset-ontology.md#96-asset-to-work-unit-placement-rules)).**
One machine may be placed on several work units at once, one per lane. The join above then
keeps only the tags that belong to **this** work unit: per-lane roles (`product_code`, `total`,
`good`, `reject`, `reject_reason`, `speed`) only where `ASSET_TAGS.work_unit_id` = this work unit;
machine-wide roles (`machine_state`, `downtime_reason`, `runtime`) on every lane the machine is
placed on. A counter is never counted in two work units.

A tag is how a PLC fills an operational table (or a telemetry store reduced into the
same shape). No tag → operator tap on the **same** tables. No fake `ASSET_TAGS`
row for a signal the machine does not actually send (no hand-typed `node`, no real register
behind the `tag_name`).

Tags are resolved and read by `tag_id`, never by address. Since 2026-09-25 an OPC UA tag's
address is generated from the placement active at the time
([F-04 §9.7.1](04-asset-ontology.md#971-generated-opc-ua-node-address)), so the placement walk above
already gives the address too — a move changes the address, not the `tag_id` or its KPI history.

Do not add `tag_role` values named after KPIs (`availability_tag`). Roles are signals:
`product_code`, `total`, `good`, `reject`, `machine_state`, `downtime_reason`,
`reject_reason`, `speed`, `runtime`.

### Multiple assets under one work unit — primary vs secondary

Real PLC tag mapping (the Vertical Packer line) showed a packer and its dedicated
checkweigher grouped under **one** work unit's tag set — the checkweigher has no
downtime state of its own, it only measures what the packer already produced.

- **Exactly one asset on that work unit is `primary`.** Its `downtime_reason` /
  `machine_state` / `runtime` tags are what Availability and the downtime-detection
  mechanism (below) read. Its `total` tag, if it has one, is the **stall-detection
  reference** — the one counter whose staleness actually means "this work unit stopped."
- **Any other asset on the work unit is `secondary`.** It has no Availability inputs at
  all — a secondary asset's role is limited to Quality (`good`/`total`/`reject`) and/or
  contributing candidate signals to downtime-**reason** enrichment (below). A secondary
  asset's own `total` tag, if it has one, is never watched for stalling and never opens
  or closes a downtime event by itself — it exists for cross-check / two-station-style
  math only ([two stations](#two-stations-total-of-one-machine-minus-total-of-another)), because a
  buffer between primary and secondary equipment means their counters can legitimately
  disagree on exactly when a stop started.
- **This is why an asset never needs to be told "which tag is used to calculate
  downtime" as a separate declaration.** `tag_role` already says that (`downtime_reason`
  / `machine_state` / `runtime` are the candidates); `placement_role = primary` says
  *whose* tags of those roles count for this work unit's Availability, when more than
  one asset is present.
- **A multi-lane machine is `primary` on each of its lanes** (each lane is its own
  work unit with its own Availability, F-04 §9.6). All lanes read the same machine-wide
  `machine_state`/`downtime_reason`/`runtime` tags, so one machine stop is downtime on every
  lane — each lane's Availability computed on its own, never one lane's downtime summed into
  another's. Rolling up to line/area sums the base terms per work unit, as usual, so a
  10-minute stop on a 2-lane machine is 10 minutes of downtime on each of the 2 work units.
  Stall detection uses **that lane's** `total` counter.
- A secondary asset that ever needs its **own** tracked Availability/OEE does not belong
  here — give it its own `WORK_UNIT` and connect the two via
  [`WORK_UNIT_FLOW`](01-site-hierarchy.md#912-work_unit_flow--position-topology-across-work_centers)
  instead.

### How downtime gets detected from a stalled counter

This is an alternative acquisition pattern to "a boolean tag directly opens/closes an
`ASSET_STATE_LOG` row" — both exist in practice; this one is driven by the **primary**
asset's `total` tag going stale, then matching a reason afterward, rather than a reason
tag driving the stop directly.

1. **Watch the primary asset's `total` tag.** While it keeps incrementing, the work unit
   is producing. The moment it stops incrementing, start a clock from the timestamp of
   the last real increment.
2. **Bucket by stall duration** once the counter resumes (or the period closes with it
   still stalled), using the two [stop thresholds](12-configuration-service.md#confirmed-first-release-item-stop-thresholds-po-2026-10-01) resolved for this work unit
   (`WORK_UNIT` → `WORK_CENTER` → `SITE` → global default 60 s / 300 s), valid on the
   shift's `business_date` (PO, 2026-10-01, closes K-6):
   - shorter than `min_stop_seconds` → **not a stop event**; no row is created and the lost
     time counts as speed loss (Performance);
   - `min_stop_seconds` up to `small_stop_max_seconds` → `small_stop` (Performance loss, not
     Availability — same rule as [Micro-stops](07-0-kpi-formula.md#micro-stops-small-stops-and-downtime-po-2026-10-01));
   - longer than `small_stop_max_seconds` → real downtime event (Availability),
     `planned`/`unplanned` from the matched reason (step 3; unlabeled = `unplanned`).
3. **Match the stalled window against candidate reason tags** — any `downtime_reason`
   -role tag on the **primary or any secondary** asset that turned on, or incremented,
   during that same window (e.g. a machine-stop flag, a film-switching signal, a
   changeover-related counter on a secondary asset). The matched tag's
   `downtime_reason_id` enriches the event.
4. **No reason tag active in that window** → the event still gets created (the stall
   itself is the evidence a stop happened) but stays unlabeled — same existing rule as
   any other open/unlabeled stop: treated as **unplanned** until a reason is set, never
   discarded for lack of a match.
5. The enriched result lands in the same `ASSET_STATE_LOG` / downtime-event shape either
   way — this section describes **how the row gets filled**, not a different table or a
   different Availability formula.

### How downtime gets detected from an out-of-range analog value

A second, distinct acquisition pattern, sitting next to stall detection above rather than
replacing it — both exist in practice, and a work unit binds exactly **one** of the two (see
[competing transforms](#92-transform-enum)). This one has **no counter and no "last
increment."** It is a live threshold check on a continuous signal (speed, RPM, a percentage
register) on the **primary** asset's `speed`-role tag (or `activity_signal`-role tag, added 2026-10-01 for a
machine with no speed — motor current, voltage, vibration): the work unit is considered down
whenever the value sits **outside** a normal operating band, running whenever it sits
**inside** it.

1. **Watch the primary asset's `speed`-role tag against its configured band.** While the
   value stays inside the band (example given by Product: 40–100 means running, anything
   outside means down), the work unit is producing. The moment the value leaves the band,
   start a clock from the timestamp it crossed the boundary.
2. **The band itself is per-tag configuration, not a Foundation constant.** Who owns the
   lower/upper bound (a single global default vs. per-`ASSET_TAGS`/per-`WORK_UNIT`
   override), and where it lives, is still unresolved — see **K-10** below (split out of K-8
   on 2026-10-01).
3. **Bucket by out-of-range duration, once the value returns inside the band (or the period
   closes with it still outside)** — with **the same pair of [stop thresholds](12-configuration-service.md#confirmed-first-release-item-stop-thresholds-po-2026-10-01) stall
   detection uses** (PO, 2026-10-01, closes the threshold part of K-8): shorter than
   `min_stop_seconds` → not a stop event (speed loss); up to `small_stop_max_seconds` →
   `small_stop` (Performance loss); longer → real downtime event (Availability). There is no
   separate threshold per detection method.
4. **Match the out-of-range window against candidate reason tags**, same rule as stall
   detection — any `downtime_reason`-role tag on the **primary or any secondary** asset that
   turned on, or incremented, during that window enriches the event with a
   `downtime_reason_id`.
5. **No reason tag active in that window** → same rule as stall detection: the event is
   still created (the out-of-range excursion is the evidence) but stays unlabeled, treated as
   **unplanned** until a reason is set.
6. The enriched result lands in the same `ASSET_STATE_LOG` / downtime-event shape as every
   other detection path — this section describes **how the row gets filled from a range
   check**, not a different table or a different Availability formula.

**Not the same mechanism as stall.** Stall watches a `total` counter go stale (stop
incrementing); range detection watches a `speed`-role value leave a band. A work unit's
primary asset may have a `total` tag, a range-checkable analog tag, both, or neither — which
one (if any) is the authoritative Availability timing source for that work unit is the
`WORK_UNIT_KPI_BINDING` pick on `availability.downtime_reason`, same as the choice between
`stall_bucket` and `reason_tag_drives_stop`.

## How one work unit's KPI resolves from tags, end to end

The per-metric tables below are the reference. This section is the walkthrough that
connects them — what the calc job actually does, in order, for one work unit over one
period.

**Step 0 — resolve which asset's tags even apply.** A work unit has no tags of its own;
it borrows whichever asset is placed there **at the timestamp of the event being
calculated**, not whichever asset is placed there now — and it may borrow from more than
one asset at once:

```
WORK_UNIT → ASSET_PLACEMENT (primary row active at that timestamp) → ASSET → ASSET_TAGS
WORK_UNIT → ASSET_PLACEMENT (any secondary rows active at that timestamp) → ASSET → ASSET_TAGS
```

For a multi-lane machine (F-04 §9.6) the join also filters by `ASSET_TAGS.work_unit_id`
for per-lane roles — see [where tags live](#where-tags-live).

Every step after this depends on that join. Get the placement wrong (e.g. use today's
asset for a shift last week after a machine swap, or read a secondary asset's tags as if
they were the primary's) and every metric below reads the wrong machine's data.

**Availability — no `product_code` needed, just state, and only from the `primary`
asset.** `POT` is not a tag at all; it comes from `SHIFT_INSTANCE` ([F-02](02-shift.md)).
Planned and unplanned downtime come from the primary asset's `downtime_reason` tags (one
register per fault) writing into `ASSET_STATE_LOG` — either directly, or inferred from a
stalled `total` counter (see
[stalled-counter detection](#how-downtime-gets-detected-from-a-stalled-counter)) or an
out-of-range analog value (see
[range detection](#how-downtime-gets-detected-from-an-out-of-range-analog-value)) and then
reason-matched — split by `DOWNTIME_REASON.downtime_category`. `PBT = POT − planned DT`,
`APT = PBT − unplanned DT`. No `downtime_reason` / `machine_state` / `runtime` tag at all
on the primary asset → Availability is "no data," not 0%. A secondary asset's
`downtime_reason` tags can still **enrich** which reason a stop gets labeled with, but
they never **drive** Availability on their own — only the primary's stall/state decides
whether a stop exists at all. See
[primary vs secondary](#multiple-assets-under-one-work-unit--primary-vs-secondary).

**Performance — this is where `product_code` enters.**
Which `OPERATION` (cycle time or speed standard) applies is resolved from that asset's
`product_code` tag (via `ASSET_PRODUCT_CODES`) or from the dispatched job. Output comes
from `total`, or `good` + `reject`, on the same asset. If more than one SKU ran in the
period, segment `APT` by `product_code` transition (or by `WORK_ORDER_OPERATION`) and
sum per segment — see [multi-SKU Performance](#more-than-one-sku-in-the-same-period). No
`OPERATION` for that product × work unit → Performance "no data"; Availability is
unaffected.

**Quality — read from the bindings, across every machine they name.**
The work unit's `quality.*` bindings ([§9.4](#94-work_unit_kpi_binding)) say which tags
count. Σ reject is the sum of **every** active `quality.reject` binding on the work unit,
whichever placed machine each tag sits on. A machine's reject that has no binding is not
counted. Fill order under [Quality](#quality) below, and the rule for
[more than one machine](#more-than-one-machine-on-one-work-unit--the-bindings-decide-po-2026-10-02).
Fallback case: if this work unit's own
counters aren't trustworthy and reject is derived from a neighboring station's `total`
instead, resolve the neighbor through
[`WORK_UNIT_FLOW`](01-site-hierarchy.md#912-work_unit_flow--position-topology-across-work_centers)
(upstream/downstream — see
[two stations](#two-stations-total-of-one-machine-minus-total-of-another)), then repeat **Step 0**
for that neighbor's own currently-placed asset before reading its `total` tag. Do not
assume the neighboring work unit's asset is the same one recorded at any other time.

**OEE — no tag of its own.** `OEE = A × P × Q`, only once all three are computable for
this same work unit and the same period. A metric missing at any step above stops OEE
from existing for that period — it does not fall back to treating the missing piece as
zero.

## Metrics and which tags they use

Tags never *are* the metric. They fill `ASSET_STATE_LOG` or quantity series. The job
then computes the metric. No tag → operator tap on those same tables. A tag listed
as **not used** must not be wired into that metric (e.g. `total` does not make
Availability).

`product_code` is not an OEE input. It only resolves which `OPERATION` (and thus
which cycle/speed standard) applies. Without it, the running product must come from
the job.

### Availability

`Availability = APT / PBT` — see [F-07](07-0-kpi-formula.md#availability-iso-clause-6-table-9) for the ISO definition.

Two different subtractions — do not mix them:

| From | Subtract | Result |
|------|----------|--------|
| **POT** | **Planned** downtime | **PBT** — time still *meant* for production |
| **PBT** | **Unplanned** downtime | **APT** — time the unit actually *produced* |

**Unplanned downtime** is a real stop you did **not** plan (breakdown, wait, unlabeled
open downtime). Those minutes are still inside **PBT** (they were supposed to be busy).
They are **removed from APT**. Example: PBT 420 min, unplanned stop 42 min → APT 378.
Availability = 378 / 420.

**Planned** downtime is the other cut: it comes out of **POT** to make PBT. It does
**not** also come out of APT.

| | Source | `tag_role` |
|---|---|---|
| **POT** | `SHIFT_INSTANCE` start→end — scheduled time the work unit can be used | **none** |
| Planned downtime | ISO element subtracted from POT. Molca: `ASSET_STATE_LOG` + `DOWNTIME_REASON.downtime_category = planned` | `downtime_reason` (boolean per reason + `downtime_reason_id`); optional `runtime` or `machine_state` (cannot split planned vs unplanned **alone**) |
| **PBT** | **ISO: `POT − planned downtime`.** Never equal to the shift clock. | **none** |
| Unplanned downtime | Same log, `unplanned` (and open stops with no reason yet). **Subtract from PBT to get APT** — not from POT | same three roles; treat as unplanned until a planned reason is set |
| **APT** | ISO: time the unit is producing. Molca v1: `PBT − unplanned downtime` (no stop row = still producing) | **none** as a role. `runtime` can *feed* the log, not replace PBT |

**Do not use for Availability:** `total` (except as the stall-detection reference, see
[stalled-counter detection](#how-downtime-gets-detected-from-a-stalled-counter)), `good`,
`reject`, `reject_reason`, `product_code`. Those mix Performance/Quality into A.
`speed` is the one exception with a named path: outside its normal Performance use, a
`speed`-role tag **can** drive Availability, but only through
[range detection](#how-downtime-gets-detected-from-an-out-of-range-analog-value) (the
`range_bucket` transform) — never as a direct value substituted into the A formula.

### Performance

Uses APT from Availability, plus output and a standard. ISO calls this element
**Effectiveness** ([F-07](07-0-kpi-formula.md#performance--iso-effectiveness-clause-6-table-10)); Molca's product-facing name is **Performance**.

| | Source | `tag_role` |
|---|---|---|
| APT | from Availability | see above |
| Standard (discrete/batch) | `OPERATION.cycle_time_value` per `OPERATION.uom_id` item (+ `batch_size` if `count_basis = unit`); a counter in another unit is converted through `PRODUCT_UOM_CONVERSION` first ([F-07](07-0-kpi-formula.md#item-unit-of-pri-and-pq-po-2026-09-28), 2026-09-28) | **none** |
| Standard (continuous) | `OPERATION.standard_speed_value` | **none** |
| Actual output | job qty **or** counters | `total`, or `good` + `reject` |
| Optional speed check (continuous) | compare to standard | `speed`, **or** `runtime` × standard vs `total`/`good` |
| Which standard | job or PLC product | `product_code` (maps via `ASSET_PRODUCT_CODES`) |
| Micro-stops | `small_stop` on the reason, not Availability; stops shorter than `min_stop_seconds` are not events at all (speed loss) — [stop thresholds](12-configuration-service.md#confirmed-first-release-item-stop-thresholds-po-2026-10-01) | `downtime_reason` with that category — Performance loss, not a tag of its own |

**Do not use for Performance:** treating `total`/`good` as Availability time (OEE-7
blend). Counter → seconds, if used, is derived at calc time from `OPERATION` +
`count_basis` (+ `PRODUCT_UOM_CONVERSION` when the tag's unit differs from
`OPERATION.uom_id`), not a `tag_role`.

#### More than one SKU in the same period

One `cycle_time_ideal` for the whole period is only correct if one SKU ran the whole
time. A shift (or any Performance window) that runs several SKUs must **segment APT by
SKU run, apply each segment's own standard, then sum** — never one blended standard for
the period.

```
Performance = Σᵢ (standard_i × output_i) / APT
```

where segment *i* is a contiguous run of one product on that work unit, `standard_i` is
that product's `OPERATION.cycle_time_value` (or `standard_speed_value`) valid on the
instance's `business_date`, and `output_i` is the output counted inside that segment
only.

**Segment boundaries — first that works:**

| Have | Segment by |
|------|------------|
| Job dispatched to the work unit | `WORK_ORDER_OPERATION` start/end per operation instance — the job already carries `product_code` |
| PLC only, no job | `product_code` tag transitions on `ASSET_TAGS`, debounced (a single noisy read must not split a run — debounce window `TBD`, Production) |
| Neither | Performance stays **"no data"** for that window — do not blend an average standard across unknown SKUs |

**Changeover time** (between the last unit of SKU A and the first unit of SKU B) is
**not assigned to either segment's ideal-time math.** Whether it lands as its own
Performance loss bucket or as planned downtime (`DOWNTIME_REASON.downtime_category`) is
**K-5**, open below — until resolved, changeover minutes stay inside APT and inflate
Performance loss for whichever segment they fall in (documented as a known distortion,
not silently correct).

A segment with no matching `OPERATION` for its `product_code` × work unit does not
blend into the sum — it is excluded and the total is flagged partial (see it as its own
"no data" sub-range on the drill-down, not folded into the others' average).

### Quality

`Quality = good / total` (`total > 0`) — ISO calls this **Quality ratio** ([F-07](07-0-kpi-formula.md#quality-iso-quality-ratio-clause-6-table-11)): `GQ / PQ`.

That formula does **not** change. **`total − reject` is how you fill `good`** when the
line has no `good` tag — same ratio: `(total − Σ reject) / total`.

Fill **one** pair, in this order (first that works). Do not mix a job total with a PLC
`reject` **tag**, or a `good` tag with a job scrap, in the same ratio — they count the same
units from two systems and double-count. Manual reject entry is **not** a PLC reject tag:
the pair "total + manual reject" below is allowed.

| Have | Then |
|------|------|
| `good` and `total` (tags or the same job row) | Use them. `reject` is Pareto / waterfall split only |
| `total` and `reject`, no `good` | `good = total − Σ reject` (every active `quality.reject` binding on this work unit, on any machine, same UOM — [more than one machine](#more-than-one-machine-on-one-work-unit--the-bindings-decide-po-2026-10-02)). Need `total > Σ reject` |
| Machine `total` tag (or job total) and **manual reject entry**, no `good` (PO 2026-10-01, PRD-003 Q-28) | `good = total − Σ reject (converted)` — each `WORK_ORDER_OPERATION_DEFECT` row converted from its `uom_id` to `OPERATION.uom_id` first ([F-07](07-0-kpi-formula.md#reject-entered-manually-in-any-unit--convert-to-the-step-unit-and-time-po-2026-09-30-2026-10-01)). Result `source_tier = manual` (lowest tier, [§9.5](#95-kpi_result)). A row with no conversion path → Quality "cannot be calculated", reason "No conversion for this unit" |
| `good` and `reject`, no `total` | `total = good + Σ reject` |
| Only one of the three | **"no data"** — cannot invent the missing side |

If **all three** exist: compute `good + Σ reject` and compare to `total`. Match (within
a small count tolerance `TBD`) → use `good` / `total`. Mismatch → **anomaly**, not a
silent `total − reject` overwrite (double-count or a stuck counter).

Job quantities use the same idea: `total_output = good + scrap + rework`. `reject` tags
are the PLC stand-in for scrap (and whatever NG the register counts). Do not add job
`rework_qty` on top of `Σ reject` from tags for the same units.

| | Source | `tag_role` |
|---|---|---|
| Good | job `good_qty`, or `good` tag, or **`total − Σ reject`** | `good`, or derive |
| Total | job total, or `total` tag, or **`good + Σ reject`** | `total`, or derive |
| Reject | split and/or derivation of good/total | `reject` + `reject_reason_id` per register |

**Do not use for Quality:** `runtime`, `machine_state`, `downtime_reason`, `speed`.

**One unit for all Quality tags — enforced at binding (PO, 2026-09-28, [2026-09-28 decision](../../../LOGS/decisions/2026-09-28-work-master-per-domain-operation-uom.md)).** Every
tag bound to a work unit's Quality slots (`quality.good`, `quality.total`, `quality.reject`,
including a `second_asset_tag_id`) must share one `ASSET_TAGS.uom_id`. The binding editor
refuses a mismatch — rule in [§9.4](#94-work_unit_kpi_binding), text key
`kpi-002.error.quality-uom-mismatch` ([UX 07](../UX/07-kpi.md#screen-text)). This check is
for **wiring mistakes** on PLC tags only.

**Quality calculates in one unit (PO 2026-10-01, PRD-003 Q-28).** That unit is the step's
`OPERATION.uom_id`. Every input is brought to it before GQ / PQ, the same way Performance
converts PQ ([F-07 §Item unit of PRI and PQ](07-0-kpi-formula.md#item-unit-of-pri-and-pq-po-2026-09-28)).
**Manual reject entry** is separate from the binding check: the operator may enter in any
unit that has a conversion path to `OPERATION.uom_id` for that product; the entered unit is
stored on `WORK_ORDER_OPERATION_DEFECT.uom_id` (PRODUCTION) and converted before Quality.

#### More than one machine on one work unit — the bindings decide (PO, 2026-10-02)

A work unit can hold several machines in a row (for example Vertical Line A: packer, then
checkweigher, then a reject station). Each machine may send its own `reject` tags, one
per `reject_reason_id`. The calc job does **not** go looking for them. **The work unit's
`WORK_UNIT_KPI_BINDING` rows are the whole list** — what is bound counts, what is not
bound does not.

| Slot | How many active bindings | How the value is formed |
|---|---|---|
| `quality.reject` | **Any number**, one per reject tag, on any machine placed on the work unit | **SQ = Σ** of every bound reject tag for the period, converted to one unit first ([one unit](#quality)). Each row keeps its machine (`ASSET_TAGS.asset_id`) and its `reject_reason_id`, so the reject Pareto can be shown per reason, per machine |
| `quality.good` | **One** | One count point: the machine where good units leave the work unit (the last machine, outfeed) |
| `quality.total` | **One** | One count point: the machine where units enter the work unit (the first machine, infeed), or derived as `good + Σ reject` when not bound |

**Why only one `good` and one `total`.** On a line in a row, every unit passes every
machine. Adding the `total` (or `good`) tags of all the machines counts the same unit once
per machine. Rejects can be added, because a unit is rejected at one machine and leaves
the line there.

**Fill order** is the same table as above, with Σ reject read across machines:

| Bound | Then |
|---|---|
| `good` + reject rows | `total = good + Σ reject` |
| `total` + reject rows | `good = total − Σ reject` |
| `good` + `total` + reject rows | Use `good` / `total`. Check `total ≈ good + Σ reject` (`reconcile_check`); a mismatch beyond tolerance is an **anomaly** — usually a machine's reject tag that is not bound, or a buffer between machines |

**Worked example — Vertical Line A, one shift.** Bindings: `quality.total` = packer
`total` (1,000 pcs); `quality.reject` = packer `reject` / "Seal leak" (12), packer
`reject` / "Film tear" (5), checkweigher `reject` / "Underweight" (23);
`quality.good` = checkweigher `good` (960).

- Σ reject = 12 + 5 + 23 = **40**
- Check: 960 + 40 = 1,000 = `total` → match
- Quality = 960 / 1,000 = **96.0 %**
- Pareto: Underweight 23 (checkweigher), Seal leak 12 (packer), Film tear 5 (packer)

If the checkweigher's "Underweight" tag were not bound: Σ reject = 17, check 960 + 17 =
977 ≠ 1,000 → **anomaly**, not a silent 96 %.

**What this does not change.**
- Quality % is still **per work unit**. A machine that needs its **own** Quality % gets its
  own `WORK_UNIT` ([secondary assets](#multiple-assets-under-one-work-unit--primary-vs-secondary)).
  `KPI_RESULT` has no machine or reason axis; the per-machine Pareto is a drill-down over
  the bound reject tags, not a stored result.
- A multi-lane machine binds only its own lane's tags (F-04 §9.6, [§9.4](#94-work_unit_kpi_binding)).
- Machines **side by side** (parallel, each making good units) on one work unit: `TBD`,
  **K-16**.

#### Two stations: `total` of one machine minus `total` of another

This is **not** another Quality formula. It is another way to **fill reject (or good)**
on **one** work unit. Quality stays `GQ / PQ`. ISO **PQ** / **GQ** / **SQ** still apply
to that work unit only.

**Do not use `total_M2 − total_M1` as a literal by machine number.** Subtract
**infeed − outfeed** (same UOM, same shift window), both from `tag_role = total` on
**two** assets (`WORK_UNIT → placement → ASSET_TAGS`).

| If “machine 1” is… | Then reject on machine 1 |
|--------------------|---------------------------|
| **Upstream** (feeds machine 2; 2 counts what got through) | `max(0, total_1 − total_2)` — pieces that left 1 but did not arrive as count on 2. **Recommended default.** Then `good_1 = total_2` if 2 is counting good-through, else `good_1 = total_1 − reject_1`. |
| **Downstream** of machine 2 (2 is infeed) | Then the PO wording holds: `max(0, total_2 − total_1)` as reject on 1. |

`total_2 − total_1` with **1 upstream** is usually **negative** (upstream counts ≥
downstream). Do not take a negative as extra good.

**When this path is valid:** one-piece (or tight) flow, same UOM, one next station, no
rework loop, counts comparable for the same `SHIFT_INSTANCE`. **WIP buffer, scrap pulled
before the next counter, or three WUs on one asset:** **`TBD` — need Operations**; until
then do not use this path (Quality **"no data"** or use on-machine `good`/`reject`).

This derived reject feeds **machine 1’s** Quality and waterfall only — not machine 2’s
OEE.

### OEE

`OEE = Availability × Performance × Quality` — ISO: `Availability × Effectiveness × Quality ratio`
([F-07](07-0-kpi-formula.md#oee-iso-overall-equipment-effectiveness-index-clause-6-table-7)).

**No tags of its own.** It only exists when all three metrics above are computable.
There is no `oee` role.

**Waterfall — required whenever OEE exists.** Possible because OEE is defined from
**loss types**, not from a fourth sensor. If A, P, and Q compute, the three steps
compute. Do not show OEE without this chart.

Start the OEE waterfall at **PBT** (ISO busy time), never at the shift clock. The clock
is **POT**. Planned downtime is the bar **before** PBT (`POT → PBT`), not an OEE factor.

| Step | Bar | Loss type | Time (or equivalent) |
|------|-----|-----------|----------------------|
| −1 | POT | — (scheduled) | `SHIFT_INSTANCE` duration |
| 0 | PBT | ISO planned downtime removed | `PBT = POT − planned downtime` |
| 1 | → APT | **Availability** | unplanned DT (`ASSET_STATE_LOG` / `downtime_reason`, incl. open unlabeled) |
| 2 | → net run | **Performance** | residue: APT minus ideal time for total output (Σ per-SKU `OPERATION` × count when the period spans more than one SKU — [multi-SKU Performance](#more-than-one-sku-in-the-same-period)); plus `small_stop` |
| 3 | → good run | **Quality** | share of output that is not good (`reject` / scrap / rework) |
| 4 | fully productive | **OEE** | `OEE × PBT` (same number as A×P×Q) |

Drill-down on a bar uses the same tags/tables as that metric (unplanned reasons on
step 1, `reject_reason` on step 3). Fine splits (breakdown vs changeover vs material)
stay `TBD` in Production until Operations confirms they still exist on
`DOWNTIME_REASON` — the waterfall still works with the three houses.

**Planned downtime is not an OEE (A×P×Q) bar.** It sits on `POT → PBT` (ISO). Show that
segment if you want the full shift story — loading / Utilization — not as a fourth OEE
factor.

**Not possible:** OEE waterfall on Availability-only (no Performance/Quality losses).
**Not possible:** inventing bars from tags that this module forbids for that metric (`total`
on the Availability step).

### MTTR, MTTF, and MTBF (from unplanned downtime only)

No extra tags. Same `ASSET_STATE_LOG` rows that cut **APT**:
`DOWNTIME_REASON.downtime_category = unplanned` (including open-then-closed stops
that were unlabeled and stayed unplanned). **Not** `planned`. **Not** `small_stop`
(those are Performance; counting them would make MTTF/MTBF a micro-stop statistic).
**Not** authorized break/rest. Only failure (unplanned) stops **end or start** an interval.
Computed **per work unit**.

Order the **closed** unplanned intervals in the period (`started_at` … `ended_at`,
then runtime again). Aligns with ISO 22400-2 §5.1.4: **TTR**, **TTF**, **TBF = TTF + TTR**.

| Metric | ISO element | Meaning | Formula |
|--------|-------------|---------|---------|
| **MTTR** | mean TTR (§5.1.4.2) | Mean time to repair: how long an unplanned stop lasts **until the unit is runtime again** | `Σ (ended_at − started_at) / n` for n closed unplanned stops |
| **MTTF** | mean TTF | Mean time to failure: gap **from restart to the next unplanned stop start** | `Σ (started_at_{i+1} − ended_at_i) / (n − 1)` for n ≥ 2 |
| **MTBF** | mean TBF (§5.1.4.1) | Mean time between failures: **MTTR + MTTF** = mean gap from one unplanned stop **start** to the next | `Σ (started_at_{i+1} − started_at_i) / (n − 1)` for n ≥ 2 (equivalently MTTR + MTTF when both defined over the same stops) |

Still-open unplanned downtime: skip until closed (do not use a running clock as a finished repair). `n = 0` → all three **"no data"**. `n = 1` → MTTR yes; MTTF and MTBF **"cannot compute"**.

This is reliability **from Production unplanned stops**, not a Maintenance work-order module. Element definitions: [F-07](07-0-kpi-formula.md#reliability-elements-iso-clause-514). Molca computes the means on unplanned `ASSET_STATE_LOG` intervals per work unit — matching ISO's TTR / TTF / TBF relationship (TBF = TTF + TTR).

### Newly adopted KPIs (2026-09-10)

Four more metrics, all **Work Unit scope**, same grain as Availability/Performance/Quality
(per `WORK_UNIT` × `SHIFT_INSTANCE`). None of them introduce a new `tag_role` — they read
fields already declared for PQ/GQ/SQ, plus two fields on `WORK_ORDER_OPERATION`
(PRODUCTION) that weren't previously wired into a KPI: `rework_qty` and
`actual_start`/`actual_end`.

| Metric | Formula (F-07) | Inputs | Source |
|---|---|---|---|
| Scrap ratio | `SQ / PQ` | Same `quality.reject` / `quality.total` slots as Quality | No new slot |
| Rework ratio | `RWQ / PQ` | `WORK_ORDER_OPERATION.rework_qty` / `quality.total` (PQ) | New: **RWQ has no `tag_role`** — it is a job-quantity field, same non-tag treatment as `good_qty`/`scrap_qty` job quantities already documented under [Quality](#quality) |
| Throughput rate | `PQ / AOET` | `quality.total` (PQ) / `WORK_ORDER_OPERATION.actual_end − .actual_start` (AOET) | New: **AOET has no `tag_role`** either — a job-level timestamp pair, not a PLC signal, same non-tag treatment `SHIFT_INSTANCE` gets for POT |
| Production process ratio | `APT / AOET` | Same `availability.downtime_reason`-derived APT / AOET above | No new slot for APT; AOET as above |

**Why AOET and RWQ aren't `tag_role`s:** every existing `tag_role` (`total`, `good`,
`reject`, `downtime_reason`, `machine_state`, `runtime`, `speed`, `product_code`) names a
PLC/telemetry signal on `ASSET_TAGS`. AOET and RWQ are **job data** on
`WORK_ORDER_OPERATION` (PRODUCTION) — the same non-tag category `SHIFT_INSTANCE` (POT) and
job `good_qty`/`scrap_qty`/`rework_qty` already occupy. Extending [§9.1 `KPI_FORMULA_SLOT`](#91-kpi_formula_slot)
follows the same seeded-and-closed discipline as every other slot:

| `slot_id` | `metric` | `iso_element` | `bindable` |
|---|---|---|---|
| `throughput.order_execution_time` | throughput / production_process | AOET | false — resolved directly from `WORK_ORDER_OPERATION.actual_start`/`.actual_end` for the same row PQ/APT already read, never bound per work unit the way a `tag_role` is |
| `rework.output` | rework | RWQ | false — resolved directly from `WORK_ORDER_OPERATION.rework_qty`, same non-bindable treatment as `reliability.interval` |

Both slots are `bindable = false` for the same reason `reliability.interval` already is:
there is nothing for a site admin to pick, since the value comes straight off the job
record rather than competing tag-role/transform combinations. No new row is needed in
`WORK_UNIT_KPI_BINDING` for either — `KPI_RESULT` simply reads the field.

**Edge cases, same "no data, never 0%" discipline as the rest of this file:**

| Situation | Result |
|---|---|
| `actual_start`/`actual_end` not yet recorded on `WORK_ORDER_OPERATION` (operation still open, or timestamps never captured) | Throughput rate and Production process ratio: `status = no_data` |
| `AOET` computes to 0 (start = end, bad data) | `status = anomaly`, not a divide-by-zero crash |
| `rework_qty` not recorded (module predates `WORK_ORDER_OPERATION_DEFECT`, or defect-code split isn't active for that WO — see [01-planning.md § WORK_ORDER_OPERATION](../../PRODUCTION/DOCS/01-planning.md#work_order_operation--execution-and-output-per-shift)) | Rework ratio: `status = no_data`, not 0% |
| `PQ = 0` | Scrap ratio and Rework ratio: `status = cannot_compute`, same rule as Quality |

**Covered by a later addition, same day:** Fall-off ratio's inputs exist but its
order-scope aggregation didn't — resolved by the `work_order` aggregation level below.

### Production order scope (2026-09-10, PO decision)

`KPI_RESULT.aggregation_level` gains a `work_order` value ([§9.5](#95-kpi_result)),
resolving to PRODUCTION's `WORK_ORDER.work_order_id`
([01-planning.md § WORK_ORDER](../../PRODUCTION/DOCS/01-planning.md#work_order--plan-becomes-a-transaction)) —
the only Job Order concept that exists today (see the forward note in §9.5). A result at
this level rolls up every `WORK_ORDER_OPERATION` row sharing that `work_order_id` —
across every `operation_id` and every `shift_instance_id` that touched the order — same
`sum_of_terms` discipline as `site`/Plant scope, never an average of per-shift or
per-operation ratios.

| Metric | Formula (F-07) | Production order rollup |
|---|---|---|
| Throughput rate | `PQ / AOET` | `Σ PQ / Σ AOET` across every `WORK_ORDER_OPERATION` row for that `work_order_id` |
| Production process ratio | `APT / AOET` | `Σ APT / Σ AOET` across the same rows |
| Scrap ratio | `SQ / PQ` | `Σ scrap_qty / Σ total_output` across the same rows |
| Rework ratio | `RWQ / PQ` | `Σ rework_qty / Σ total_output` across the same rows |
| **Fall-off ratio** *(newly adopted here)* | `(PQ_first_op − GQ_current_op) / PQ_first_op` | `PQ_first_op` = `Σ total_output` (`good_qty + scrap_qty + rework_qty`) of every `WORK_ORDER_OPERATION` row for that `work_order_id` whose `operation_id` resolves to the routing's first step (`OPERATION.step_number` = minimum for the `WORK_ORDER.routing_id`). `GQ_current_op` = `Σ good_qty` of every `WORK_ORDER_OPERATION` row for that `work_order_id` and the `operation_id` being evaluated (the "current" step) |

**Fall-off ratio, worked example.** Work order `WO-1042`, routing has 3 operations.
First operation (step 1) ran across two shifts: total_output 500 + 480 = 980. Current
operation being evaluated is step 3, which ran one shift: good_qty 860. Fall-off ratio =
(980 − 860) / 980 = **12.2%** — the share of what entered the routing at step 1 that
didn't come out good at step 3.

**Edge cases:** a `work_order_id` with no `WORK_ORDER_OPERATION` row yet for the first
operation → `status = no_data` (cannot establish `PQ_first_op`). A row missing
`actual_start`/`actual_end` is excluded from `AOET`-based sums only (Throughput rate,
Production process ratio) and the result is flagged partial, same rule as the multi-SKU
segment exclusion under [Performance](#more-than-one-sku-in-the-same-period) — it does not
block Scrap ratio/Rework ratio/Fall-off ratio for the same order, since those don't use
AOET. `PQ_first_op = 0` → Fall-off ratio `status = cannot_compute`, same rule as Quality.

**Forward note (not a spec):** this section binds Production order scope to PRODUCTION's
`WORK_ORDER` because that is the only Job Order concept that exists today. Per PO
direction, order-scope aggregation is expected to live **per owning domain** going
forward — Maintenance/Quality/Inventory will eventually have their own Job Order concept
(same IEC 62264 Work Master → Work Schedule → Work Request → Job Order → Work Directive
pattern, instantiated separately per MOM domain per
[2026-09-10 decision](../../../LOGS/decisions/2026-09-10-mom-domain-alignment.md)), each
presumably needing its own `aggregation_level` value once it exists. That shape is **not**
designed here — out of scope for this decision, which only unblocks the KPIs that were
waiting on Production's own `WORK_ORDER`.

### Tag role → metrics (reverse)

| `tag_role` | Feeds | Does not feed |
|---|---|---|
| `downtime_reason` | Availability (via state log + reason category); Performance if `small_stop`; **MTTR/MTTF/MTBF** if `unplanned` | Quality, OEE directly |
| `runtime` | Availability (optional APT helper); Performance (continuous, optional) | Quality |
| `machine_state` | Availability (optional; still need reason to class planned) | Quality |
| `total` | Performance, Quality | Availability |
| `good` | Performance (if used as output), Quality (direct or via `good + reject`) | Availability |
| `reject` | Quality (split **or** to derive good/total); Performance if part of total | Availability |
| `reject_reason` | Quality Pareto only | A, P, OEE math |
| `speed` | Performance (continuous, optional); Availability **only** via `range_bucket` (see [range detection](#how-downtime-gets-detected-from-an-out-of-range-analog-value)) | Quality |
| `activity_signal` | **Availability only**, via `range_bucket` — e.g. running while motor current is inside its band (added 2026-10-01) | Performance, Quality |
| `product_code` | Which `OPERATION` for Performance | Not a quantity or a time |
| `measured_total` | **Nothing.** A running total of a measured quantity (e.g. checkweigher `Total_Weight` in grams), `uom_id` required, added 2026-10-02 ([F-04 §9.7](04-asset-ontology.md#97-asset_tags--per-asset-tag--signal-declaration), PO, prd-molcadx#24 item 3). No `KPI_PARAMETERS` row accepts it, so it can never be bound to a slot | A, P, Q, OEE — never summed with piece counts |

## Two things this module does not redefine

| Concept | Owned by |
|---|---|
| `DOWNTIME_REASON` / `REJECT_REASON` and per-asset scoping | [Reference & Master Data](05-reference-master-data.md) |
| UOM / time conversion | [Reference & Master Data](05-reference-master-data.md) §9.3–§9.4 (T-3 vs Work Master still open there) |
| ISO elements & the four formulas themselves | [F-07](07-0-kpi-formula.md) |
| Screens, "always show A/P/Q next to OEE," and `KPI_RESULT`'s freshness bookkeeping (`computed_at`, `is_stale`) | `production-domain` |

## What's still unknown

| # | Question | Who |
|---|---|---|
| K-2 | Extra scoping here for reasons, or is `DOWNTIME_REASON_ASSET` enough? | Operations + PO |
| K-3 | If K-2 is still yes — what gap? | Operations |
| K-5 | Changeover time between two SKU segments in the same Performance window (see [multi-SKU Performance](#more-than-one-sku-in-the-same-period)) — its own Performance-loss bucket, or a `planned` `DOWNTIME_REASON` category? | Operations + PO |
| ~~K-6~~ | ~~Stall-duration threshold that separates a `small_stop` from real downtime in [stalled-counter detection](#how-downtime-gets-detected-from-a-stalled-counter) (Vertical Packer line observed ~5 min) — one global default, or configurable per `WORK_UNIT`/`WORK_UNIT_CLASS`? Where does the value live — `05-reference-master-data.md` or a `production-domain` job config?~~ **Resolved 2026-10-01 (PO): configurable per `WORK_CENTER`, optional `WORK_UNIT` override.** Two thresholds, `min_stop_seconds` (below = not a stop, speed loss) and `small_stop_max_seconds` (up to = `small_stop`, above = real downtime). Lookup `WORK_UNIT` → `WORK_CENTER` → `SITE` → global default 60 s / 300 s. Effective-dated, audited, never recalculates closed shifts. The value lives in [Configuration Service](12-configuration-service.md#confirmed-first-release-item-stop-thresholds-po-2026-10-01); its storage table is `TBD` for engineering | — |
| ~~K-8~~ | ~~The normal-operating band (e.g. 40–100) in [range detection](#how-downtime-gets-detected-from-an-out-of-range-analog-value) is per-tag config, `TBD` who owns it — same shape as K-6. Narrower question K-6 didn't have to answer: does the **small_stop/downtime duration threshold** get **one shared value across both detection methods** (stall and range), or does each detection method carry its **own** threshold? Until resolved, treat them as separately configurable, not assumed shared.~~ **Resolved 2026-10-01 (PO): one shared pair.** Stall and range detection use the same [stop thresholds](12-configuration-service.md#confirmed-first-release-item-stop-thresholds-po-2026-10-01) as K-6; no per-method threshold. The band-ownership part is **not** answered by this decision and moves to K-10 | — |
| K-10 | Who owns the normal-operating band (e.g. 40–100) in [range detection](#how-downtime-gets-detected-from-an-out-of-range-analog-value), and where does it live: one value per `ASSET_TAGS` row, a `WORK_UNIT` override, or a [Configuration Service](12-configuration-service.md) setting like the stop thresholds? Is it effective-dated like them? (Split out of K-8, 2026-10-01) | Operations + PO |
| K-11 | Duration vs category. (a) A detected stop lasts longer than `small_stop_max_seconds`, but its matched reason has `downtime_category = small_stop` — is it real downtime (duration wins) or `small_stop` (reason wins)? (b) Do the [stop thresholds](12-configuration-service.md#confirmed-first-release-item-stop-thresholds-po-2026-10-01) also apply to stops an operator opens manually (`origin = manual`), or only to `derived` stall/range detection? The 2026-10-01 decision names the two detection methods only | PO + Operations |
| K-12 | **Keys (2026-10-01).** `KPI_RESULT` (§9.5). (a) `inputs_used` holds a list of `WORK_UNIT_KPI_BINDING` rows, and F-00 keys rule 5 forbids list-valued columns: a child table (one row per result × binding, own PK) or other storage? Same question for `waterfall` (a list of bars). (b) Natural key: the spec says "one row per work unit, per metric, per period", but `period` is either a `shift_instance_id` or a `business_date` range (two shapes, no single column), `aggregation_level` may be `area`/`site`/`work_order` (what does `work_unit_id` hold then?), and it is not said whether a recompute replaces the row or adds one. Until answered, no Unique rule is listed | `foundation-domain` + `production-domain` / PO |
| ~~K-13~~ | ~~**Keys (2026-10-01).** `WORK_UNIT_KPI_BINDING` (§9.4) says "one row per work unit, per position", but the worked example has two active rows for `availability.downtime_reason` (the timing transform + `reason_match_enrich`). What is the No-overlap rule?~~ **Resolved 2026-10-02 (PO, prd-molcadx#24 item 20):** per (`work_unit_id`, `slot_id`), **one** active row with the slot's main transform; **plus** any number of `reason_match_enrich` rows on `availability.downtime_reason`; **plus** any number of rows on `quality.reject` (summed, [more than one machine](#more-than-one-machine-on-one-work-unit--the-bindings-decide-po-2026-10-02)). A second main row is refused; an enrichment or reject row is never refused for being a second row. Written into the §9.4 **Keys** line | — |
| K-17 | `performance.product_code` is required unless jobs are dispatched to the work unit (§9.1, 2026-10-02). Which fact tells FOUNDATION that a work unit runs on dispatched jobs — a flag on `WORK_UNIT`, the presence of `OPERATION_WORK_UNIT` rows, or a PRODUCTION signal? Until decided, "Missing for KPIs" shows the product-code gap with the wording "…unless jobs are dispatched here" | PO + `production-domain` |
| K-16 | Machines **side by side** on one work unit (parallel, each one making good units — not in a row). Then `good` and `total` would be summed across machines, unlike the in-a-row rule in [more than one machine](#more-than-one-machine-on-one-work-unit--the-bindings-decide-po-2026-10-02). Allow several `quality.good` / `quality.total` rows for this case, or require each parallel machine to be its own work unit? (2026-10-02) | Operations + PO |
| K-14 | **Keys (2026-10-01).** Is (`slot_id`, `tag_role`, `transform`) unique among active `KPI_PARAMETERS` rows, and is `rank` unique per `slot_id`? Not stated (§9.3) | `foundation-domain` |
| K-15 | **Keys (2026-10-01).** `KPI_FORMULA_SLOT.slot_id` is a readable string (`quality.total`) used as the PK. F-00 keys rule 1 asks for a surrogate `<entity>_id` with the natural key as a unique constraint. Add `kpi_formula_slot_id` and keep `slot_id` unique (the FKs on `KPI_PARAMETERS`/`WORK_UNIT_KPI_BINDING` would change), or accept the exception for a seeded, closed catalog whose keys never change? | `foundation-domain` / PO |
| ~~K-9~~ | ~~Is a domain's KPI sidebar item hidden for a tenant not entitled to that domain, or always shown?~~ **Resolved 2026-09-27 (PO): hidden.** A tenant sees a KPI sidebar item only for domains it is entitled to (PLATFORM License Manager). An entitled domain with no adopted KPI still shows, opening to the empty state. Matches [PLT-01 core concept 3](../../PLATFORM/DOCS-EN/01-license-manager.md#core-concepts): a sidebar item is Feature level, and Feature-level items without entitlement are hidden, not locked. **Revised 2026-09-28 (PO, [2026-09-28 decision](../../../LOGS/decisions/2026-09-28-work-master-per-domain-operation-uom.md)):** the sidebar is now grouped by domain. A domain the tenant is not licensed for shows as **one locked group heading** (collapsed, lock icon, not expandable, opens the upsell surface); its items, including KPI, are hidden. See [UX 00 § App shell](../UX/00-ux.md#app-shell--sidebar-grouped-by-domain-po-decision-2026-09-28), [PLT-01 core concept 3a](../../PLATFORM/DOCS-EN/01-license-manager.md#core-concepts) (replaces the concept 3 reading above for the sidebar) | — |
| ~~K-7~~ | ~~Who's allowed to write `KPI_PARAMETERS` rows versus `WORK_UNIT_KPI_BINDING` rows — same governance tier, or different?~~ **Resolved (PO, 2026-09-03): two different tiers, confirming the split the question already suspected.** `KPI_FORMULA_SLOT`/`KPI_PARAMETERS` (the catalog of legal combinations — `SCR-FND-KPI-001`) stay **never implementor-writable**, same K-1 boundary as `KPI_FORMULA` itself — no admin role, at any scope, edits which tag-role-and-transform combinations exist; changes go through `foundation-domain`/PO. `WORK_UNIT_KPI_BINDING` (picking one already-legal combination for one work unit — `SCR-FND-KPI-002`) is the **ordinary FOUNDATION admin role, scoped to the site owning that work unit** (or enterprise scope) — the same access model already used for every other master-data write in this domain (Site Hierarchy, Shift, Products, Reference Data). No new role or ABAC scheme needed; this is a normal site-scoped master-data edit, not a formula-design act. | — |

Resolved in the [F-07](07-0-kpi-formula.md) rewrite of 2026-08-24: no seeded `KPI_INDEX`/`KPI_FORMULA` master (fixed OEE-family recipes in product/job, implementor declares tags not formulas), and the v1 element subset (Production OEE family only, other ISO KPIs wait — widened 2026-09-10 to five more KPIs, see [F-07](07-0-kpi-formula.md#scope-which-parts-of-iso-22400-2-molca-adopts)).

## 9. Entity specification

Four entities. `KPI_FORMULA_SLOT` names the positions the formulas above need filled.
`KPI_PARAMETERS` says which tag-role-and-transform combinations are legal for each
position — this is the "first that works" logic in the per-metric tables above, restated
as data instead of prose. `WORK_UNIT_KPI_BINDING` is the pick: one row per work unit, per
position, mandatory, not an override sitting beside automatic resolution. `KPI_RESULT` is
what the calc job hands back. None of the four are `KPI_INDEX`/`KPI_FORMULA` — the formula
math above still doesn't move, and none of these tables are implementor-writable (see K-7).

### 9.1 `KPI_FORMULA_SLOT`

One named input position inside a fixed formula, nothing else. Quality's formula
(`GQ / PQ`) has three positions: good, total, reject. Availability's formula has one:
whatever opens and closes the downtime interval. A slot names the *position*, not the
value and not the source — the same way `tag_role` names a signal's meaning without
saying which physical register carries it.

Seeded and closed, same discipline as `tag_role`: a new row only when the adopted ISO
scope in [F-07](07-0-kpi-formula.md#scope-which-parts-of-iso-22400-2-molca-adopts)
actually widens, never per plant.

| Field | Type | Notes |
|---|---|---|
| `slot_id` | string, PK | e.g. `availability.downtime_reason`, `quality.total` |
| `domain` | enum | **Added 2026-09-27 (PO).** `production` \| `quality` \| `maintenance` \| `inventory` — the IEC 62264 MOM category whose KPIs this slot feeds, i.e. which domain selects, binds and displays them ([PRODUCTION 00-overview](../../PRODUCTION/DOCS/00-overview.md) rule 1, "KPIs per domain"). Required. The KPI screens show one domain at a time, picked from one sidebar item per domain ([UX 07](../UX/07-kpi.md)). See "Domain of a slot" below |
| `metric` | enum | `availability` \| `performance` \| `quality` \| `reliability` \| `throughput` \| `rework` (the last two added with the [2026-09-10 slots](#newly-adopted-kpis-2026-09-10)) |
| `iso_element` | string, nullable | Which F-07 element this slot fills (`APT`, `GQ`, `PQ`, `SQ`, …); null for a helper slot with no direct ISO element |
| `bindable` | boolean | `false` for a slot computed purely from another slot's already-bound data — see `reliability.interval` below |
| `required` | boolean | **Added 2026-10-02 (PO).** `true` = the metric is "no data" without this slot. `false` = an optional check; the metric computes without it. Only required slots appear as gaps ("Missing for KPIs", [UX 13](../UX/13-data-source.md)); an unbound optional slot reads "Optional — not bound" ([UX 07](../UX/07-kpi.md)). Meaningful only when `bindable = true` |

**Keys** (F-00 [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `slot_id` (a string natural key used as the PK, K-15) · Unique: — · No overlap: —

Seed rows:

| `slot_id` | `domain` | `metric` | `iso_element` | `bindable` | `required` |
|---|---|---|---|---|---|
| `availability.downtime_reason` | production | Availability | splits POT into planned/unplanned against PBT | true | true (the main timing row; enrichment rows are extra, K-13) |
| `quality.good` | production | Quality | GQ | true | true — **one of** `good` / `total`: any two of good, total, reject fill Quality ([fill order](#quality)), so the gap is "Quality needs two of Good / Total / Reject", one row per work unit, not one per slot |
| `quality.total` | production | Quality | PQ | true | true — same "two of three" rule as `quality.good` |
| `quality.reject` | production | Quality | SQ | true | true — same "two of three" rule as `quality.good` |
| `performance.output` | production | Performance | PQ (Performance's own copy) | true | true |
| `performance.product_code` | production | Performance | resolves which `OPERATION` supplies PRI | true | true, **unless** jobs are dispatched to the work unit (the job carries the product, [segment boundaries](#more-than-one-sku-in-the-same-period)). How master data knows a work unit runs on dispatched jobs: `TBD`, **K-17** |
| `performance.speed_check` | production | Performance | none — sanity check only | true | **false** — Performance = ideal cycle time × total count / APT needs no `speed` or `runtime` tag |
| `reliability.interval` | production | MTTR / MTTF / MTBF | TBF/TTF/TTR-derived | false — computed from `availability.downtime_reason`'s own closed events, never bound directly | — |
| `throughput.order_execution_time` | production | throughput / production_process | AOET | false — see [Newly adopted KPIs](#newly-adopted-kpis-2026-09-10) | — |
| `rework.output` | production | rework | RWQ | false — see [Newly adopted KPIs](#newly-adopted-kpis-2026-09-10) | — |

**Domain of a slot (PO, 2026-09-27).** Every slot seeded today is `production`: every KPI
Molca has adopted ([F-07 scope table](07-0-kpi-formula.md#scope-which-parts-of-iso-22400-2-molca-adopts))
is a **Production KPI**, bound per work unit and shown by PRODUCTION. That includes the ones
the ISO 22400-2 regrouping files under another domain
([F-07](07-0-kpi-formula.md#production-domain-14-kpis)): Quality ratio, Scrap ratio, Rework
ratio and Fall-off ratio (grouped under Quality) and MTTR / MTTF / MTBF (grouped under
Maintenance). They are computed from the production equipment's own counters and downtime
intervals, so v1 keeps them in Production. `quality`, `maintenance` and `inventory` have
**no slots yet** — rows arrive only when F-07 adopts a KPI for that domain (same
seeded-and-closed rule as above), and their KPI items (inside each licensed domain's sidebar group) open to an empty state until
then. Moving an already-adopted KPI to another domain once that domain exists (e.g. Scrap
ratio to Quality) is a PO decision, not automatic.

### 9.2 Transform enum

The fixed menu of ways a bound tag becomes a slot's value. Closed, same governance as
`tag_role` — not its own seeded table, a value on `KPI_PARAMETERS.transform` and
`WORK_UNIT_KPI_BINDING.transform` below.

| Transform | What it does | Tags needed | Feeds |
|---|---|---|---|
| `none` | Passes the tag's value straight through | 1 | Any slot where the tag already is the value |
| `unit_convert` | Converts the tag's raw unit into the unit the formula expects, via `MEASUREMENT_GROUP` ([F-05 §9.4](05-reference-master-data.md#94-measurement_group-and-unit_of_measurements)) | 1 | Any quantity slot |
| `counter_to_duration` | Turns a running counter into a time value via `OPERATION.cycle_time_value`, valid at the instance's `business_date` — converting the count to `OPERATION.uom_id` first when the tag's unit differs ([F-08 §9.2.1](08-work-master.md#921-item-unit-and-conversion-po-2026-09-28)) | 1 | `performance.speed_check`, discrete/batch standards |
| `infeed_outfeed_derive` | Subtracts a paired asset's `total` tag from this one's — see [two stations](#two-stations-total-of-one-machine-minus-total-of-another) | 2 | `quality.good` or `quality.reject` |
| `complement_derive` | Fills the missing side of good/total/reject from the other two, as bound on this work unit — Σ reject may span several machines ([more than one machine](#more-than-one-machine-on-one-work-unit--the-bindings-decide-po-2026-10-02)) — see [Quality](#quality) | 2 | `quality.good`, `quality.total`, or `quality.reject` |
| `reconcile_check` | When all three of good/total/reject exist, flags a mismatch beyond tolerance as an anomaly instead of silently overwriting — see [Quality](#quality) | 3 | `quality.good`, `quality.total`, `quality.reject` — checks only, produces no new value |
| `segment_and_sum` | Splits the period into contiguous single-product runs and applies each run's own standard — see [multi-SKU Performance](#more-than-one-sku-in-the-same-period) | 1–2 | `performance.output` |
| `reason_tag_drives_stop` | Watches the primary asset's bank of `downtime_reason` registers directly; whichever one goes active opens the event and supplies the label in one step | 1+ | `availability.downtime_reason`, when a work unit has reliable per-fault registers |
| `stall_bucket` | Watches the primary asset's `total` tag go stale and buckets the stall duration — see [stalled-counter detection](#how-downtime-gets-detected-from-a-stalled-counter) | 1 | `availability.downtime_reason` (timing only, unlabeled) |
| `range_bucket` | Watches the primary asset's `speed`- or `activity_signal`-role tag (2026-10-01) against a configured normal-operating band and buckets the out-of-range duration — see [range detection](#how-downtime-gets-detected-from-an-out-of-range-analog-value) | 1 | `availability.downtime_reason` (timing only, unlabeled) |
| `reason_match_enrich` | Matches a stalled, out-of-range, or open downtime window against any `downtime_reason` tag, primary or secondary, active in that window, to label the event | 1+ | `availability.downtime_reason` (label only, never opens or closes the event) |
| `speed_vs_standard_check` | Compares a live `speed` tag, or `runtime` × standard, against actual output as a sanity check | 1–2 | `performance.speed_check` — check only, does not feed `performance.output` |
| `interval_mean` | Means the duration (MTTR), the restart→next gap (MTTF), or start→start (MTBF = MTTR + MTTF) across closed unplanned `ASSET_STATE_LOG` intervals | 0 new | `reliability.interval` — reuses whatever fed `availability.downtime_reason` |

For `availability.downtime_reason` specifically, four of these compete for the *same*
authoritative timing role — `none` with a direct boolean tag, `reason_tag_drives_stop`
with a register bank, `stall_bucket` off a stalled counter, or `range_bucket` off an
out-of-range analog value. A work unit binds exactly one. `reason_match_enrich` is never
the authoritative one; it only labels an event one of the other four already opened.

### 9.3 `KPI_PARAMETERS`

Which combinations are legal, per slot. Seeded by Product and `foundation-domain`,
**never implementor-writable** — the exact boundary K-1 already drew around the rejected
`KPI_FORMULA` table. `KPI_PARAMETERS` answers a narrower question than that table did:
which declared `tag_role`, processed by which transform, may fill a slot — not "what's
the formula."

| Field | Type | Notes |
|---|---|---|
| `parameter_id` | internal ID, PK | |
| `slot_id` | FK → `KPI_FORMULA_SLOT` | |
| `tag_role` | enum, `tag_role` from [F-04 §9.7](04-asset-ontology.md#97-asset_tags--per-asset-tag--signal-declaration) | |
| `transform` | enum, see [§9.2](#92-transform-enum) | |
| `rank` | integer, nullable | Priority order where more than one combination is legal for the same slot — e.g. Quality's good+total, then total+reject, then good+reject |
| `valid_from` / `valid_to` | date | Deactivate rather than hard-delete, same rule as every other FOUNDATION master |

**Keys** (F-00 [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `parameter_id` · Unique: — (K-14) · No overlap: —

Every `tag_role` → slot mapping already stated in the per-metric tables above
([Availability](#availability), [Performance](#performance), [Quality](#quality)) is a
`KPI_PARAMETERS` row waiting to be seeded. This section doesn't restate them as data —
the tables above stay the readable source; this entity is how the calc job reads the
same thing.

### 9.4 `WORK_UNIT_KPI_BINDING`

The pick, per work unit. Mandatory for every bindable slot on every work unit, not an
override sitting beside automatic resolution — this replaces re-deriving the "first that
works" order in code at calculation time. The row states outright which tag and which
math.

| Field | Type | Notes |
|---|---|---|
| `binding_id` | internal ID, PK | |
| `work_unit_id` | FK → `WORK_UNIT` | |
| `slot_id` | FK → `KPI_FORMULA_SLOT` | |
| `asset_tag_id` | FK → `ASSET_TAGS` | Must belong to an asset actually placed on that work unit at `valid_from`, validated through the [`WORK_UNIT → ASSET_PLACEMENT → ASSET`](#where-tags-live) join, not any tag in the system. **Multi-lane machine (2026-09-25):** a per-lane-role tag must also have `ASSET_TAGS.work_unit_id` = this `work_unit_id` — Lane 2's counter can't be bound to Lane 1. Machine-wide roles may be bound on any of the machine's work units |
| `transform` | enum | Must appear in `KPI_PARAMETERS` for that `slot_id` — never invented on the spot |
| `second_asset_tag_id` | FK → `ASSET_TAGS`, nullable | Only when `transform` needs a pair (`infeed_outfeed_derive`) |
| `valid_from` / `valid_to` | date | Same effective-dating as every other FOUNDATION entity — a rebind never corrupts history |

**Keys** (F-00 [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `binding_id` · Unique: — · No overlap: (`work_unit_id`, `slot_id`) over `valid_from`/`valid_to` for the main-transform row, except `reason_match_enrich` rows and `quality.reject` rows, which may overlap (K-13, resolved 2026-10-02)

**Binding validation — Quality unit (PO, 2026-09-28, [2026-09-28 decision](../../../LOGS/decisions/2026-09-28-work-master-per-domain-operation-uom.md)).** On save, all active
bindings of one work unit whose `slot_id` is `quality.good` / `quality.total` /
`quality.reject` (both `asset_tag_id` and `second_asset_tag_id`) must resolve to the same
`ASSET_TAGS.uom_id` over the overlapping `valid_from`/`valid_to` range. A mismatch is
**refused**, not converted: "Cannot save: the Quality tags on \<work unit\> must all use the same unit. \<tag\> is in \<unit A\>, \<tag\> is in \<unit B\>. Pick tags in one unit." (`kpi-002.error.quality-uom-mismatch`, UX 07).
This check covers bound PLC tags only. Manual reject entry is not a binding and is not
checked here — it may be in any unit with a conversion path to `OPERATION.uom_id`
([§Quality](#quality), PO 2026-10-01).

**How many rows per slot (PO, 2026-10-02).** `quality.reject` may have any number of active
rows on one work unit, one per reject tag, on any machine placed there; the calc job sums
them all. `quality.good` and `quality.total` have one active row each. Rule and example:
[more than one machine](#more-than-one-machine-on-one-work-unit--the-bindings-decide-po-2026-10-02).
Every other slot has one active main row; `availability.downtime_reason` may add any number
of `reason_match_enrich` rows next to it (K-13, resolved 2026-10-02, prd-molcadx#24 item 20).
Saving a second main row on a slot is refused; saving a second reject or enrichment row is not.

**Worked example.** One work unit with a primary asset (the line itself) and a secondary
asset (its inline checkweigher), matching the
[primary/secondary shape](#multiple-assets-under-one-work-unit--primary-vs-secondary)
already described above:

| `slot_id` | `asset_tag_id` (asset) | `transform` |
|---|---|---|
| `quality.total` | primary asset's `total` tag | `none` |
| `quality.good` | secondary asset's `total` tag | `infeed_outfeed_derive`, paired against the primary's `total` tag |
| `availability.downtime_reason` | primary asset's `total` tag | `stall_bucket` |
| `availability.downtime_reason` (enrichment) | primary asset's `downtime_reason` tags, plus any candidate on the secondary asset | `reason_match_enrich` |

No priority-order lookup runs at calculation time — these four rows say exactly which tag
and which math, for this work unit, until one of them is rebound.

### 9.5 `KPI_RESULT`

One row per work unit, per metric, per period — the calc job's output record. Every field
below is dictated directly by a rule already stated elsewhere in this file;
`production-domain` owns only the two marked fields (freshness bookkeeping) and however
any of this renders on a screen.

| Field | Type | Notes |
|---|---|---|
| `kpi_result_id` | internal ID, PK | Permanent, never reused. Added 2026-10-01 ([keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)) |
| `work_unit_id`, `metric` | FK, enum | Which work unit, which KPI. Values (2026-09-27): `availability`, `performance`, `quality`, `oee`, `mttr`, `mttf`, `mtbf`, `throughput_rate`, `production_process_ratio`, `scrap_ratio`, `rework_ratio`, `fall_off_ratio` (the last five adopted 2026-09-10, listed here since 2026-09-27; `fall_off_ratio` only with `aggregation_level = work_order`). Each value's domain and report page: [F-07 KPI → report page](07-0-kpi-formula.md#kpi--report-page). A new value is added in the same decision that adopts the KPI |
| `period` | `shift_instance_id`, or an explicit `business_date` range | **The `business_date` range option is ISO 22400-2's "Time period" scope** — already modeled, not new. Availability/Performance/Quality ratio/OEE index adopt at this scope 2026-09-10 by using this option instead of `shift_instance_id`, same `sum_of_terms` rollup across every `SHIFT_INSTANCE` in the range — see [F-07](07-0-kpi-formula.md#new-scope-bindings-2026-09-10-second-chart) |
| `value` | numeric, nullable | |
| `status` | enum | `computed` / `no_data` / `cannot_compute` / `anomaly` — the ["no data, never 0%"](#metrics-light-up-independently) rule, not a value field overloaded with a fake zero |
| `inputs_used` | `TBD` (K-12) | The actual bindings this result resolved through — a drill-down points at the row, not "the calc job decided somehow". A list of `WORK_UNIT_KPI_BINDING` rows, so not a stored column (F-00 keys rule 5): child table or other storage, K-12 |
| `binding_effective_at` | timestamp | The basis used to pick binding versions, so a machine swap last week doesn't get read through this week's binding |
| `source_tier` | enum, `plc` / `manual` / `derived` | The lowest tier among every contributing tag — see the OEE-7 note in [`tag-declaration-draft.md`](tag-declaration-draft.md) |
| `is_provisional` | boolean | True while the period is still `open` — the existing ["temporary" rule](#why-it-matters) applies to the result, not just the screen |
| `is_anomaly` | boolean | True if `reconcile_check` fired a mismatch on any input |
| `waterfall` | the [OEE waterfall](#oee) bars, populated | Only present when OEE exists |
| `aggregation_level` / `aggregation_method` | `work_unit`/`area`/`site`/`work_order`, `none`/`sum_of_terms` | Never an average of OEE across work units — the existing [rollup rule](#oee). **`site` = "Plant" scope** in ISO 22400-2 naming — Throughput rate and Production process ratio adopt at this level 2026-09-10, same `sum_of_terms` rule, see [F-07](07-0-kpi-formula.md#new-scope-bindings-2026-09-10-second-chart). **`work_order` = "Production order" scope**, added 2026-09-10 (PO decision) — resolves to PRODUCTION's `WORK_ORDER.work_order_id` ([01-planning.md § WORK_ORDER](../../PRODUCTION/DOCS/01-planning.md#work_order--plan-becomes-a-transaction)), aggregating every `WORK_ORDER_OPERATION` row sharing that `work_order_id`, same `sum_of_terms` discipline. Unblocks Fall-off ratio, Throughput rate, Production process ratio, Scrap ratio, Rework ratio at Production order scope — see [F-07](07-0-kpi-formula.md#production-order-scope--adopted-2026-09-10). **Forward note:** this binds specifically to PRODUCTION's `WORK_ORDER` because Production is currently the only MOM domain with a Job Order concept (IEC 62264 Work Master → Work Schedule → Work Request → Job Order → Work Directive pattern, [00-foundation.md](00-foundation.md)). When Maintenance/Quality/Inventory eventually get their own Job Order entities, `aggregation_level = work_order` will need a domain-qualifier (it won't say *whose* work order) — not designed here, flagged for that future work. **No `defect_code` value exists yet** — Defect type scope stays blocked on this (F-07, same section) |
| `computed_at`, `is_stale` — **owned by `production-domain`** | timestamp, boolean | Freshness bookkeeping, not derived from any rule in this file |

**Keys** (F-00 [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `kpi_result_id` · Unique: `TBD` (K-12) — the spec says one row per work unit, per metric, per period · No overlap: —

## Next step

Production applies `KPI_RESULT` ([§9.5](#95-kpi_result)) on shopfloor and OEE screens —
including an Availability-only view. K-7 is resolved (site-scoped admin writes
`WORK_UNIT_KPI_BINDING`; the `KPI_FORMULA_SLOT`/`KPI_PARAMETERS` catalog itself stays
PO/`foundation-domain`-only) — `SCR-FND-KPI-001/002` in [UX 07](../UX/07-kpi.md) can now
be built. K-2/K-3 stay with Operations if reason lists still feel too wide per machine.
K-6 and K-8 are resolved (2026-10-01): one shared pair of [stop thresholds](12-configuration-service.md#confirmed-first-release-item-stop-thresholds-po-2026-10-01) per work
center / work unit for both detection methods. K-10 (who owns the range-detection band) stays
open — a **view-only** reflection of whichever detection method a work unit binds is now also
buildable: `SCR-FND-KPI-004` in [UX 07](../UX/07-kpi.md).
