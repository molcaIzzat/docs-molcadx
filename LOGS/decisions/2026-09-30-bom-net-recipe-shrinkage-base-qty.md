# 2026-09-30 — Net recipe, planned shrinkage per step, recipe base quantity

- **Decided by:** Product Owner (step-by-step walk-through, mixer example)
- **Pulls forward:** issue #58 Q2 (planned loss on routing steps — was "no, wave 2")
- **Domain:** FOUNDATION (F-08 Work Master; UX 08)

## Decisions

### A — BOM lines are the net recipe; losses are added on top

A `BOM_LINE` quantity is what the recipe needs for the product, **without** expected losses. Two kinds of planned
loss are added on top, each where it varies:

| Loss | Varies by | Field |
|---|---|---|
| **Component scrap** — material lost handling that component (film trim, residue in a pipe) | Material | `BOM_LINE.scrap_factor` (existing; unit fixed as a fraction, 0.05 = 5%) |
| **Shrinkage** — mass lost by the process itself (evaporation, moisture, crystallisation) | Process at a work unit | **`OPERATION.planned_shrinkage`** (new, fraction) |

Rejects stay separate: counted, with a `REJECT_REASON`, and the only loss in OEE Quality. Actual shrinkage is
**calculated** by PRODUCTION / the data platform (input used vs output made) and compared with the plan — never
stored in FOUNDATION.

### B — One formula per product

The recipe does not change by work unit (same mixer, same product → same recipe). Only the loss can differ, and
that sits on each work unit's `OPERATION`. No per-work-unit BOM.

### C — Recipe base quantity

`BOM.base_qty` + `BOM.base_uom_id`: the quantity the lines are written for — "per 1,000 kg", "per 40 packs".
Default `1` in the product's base unit, which is today's behaviour. The plant types the recipe the way it weighs
it; per-unit quantities and percentages are calculated. On screen it is labelled **"Recipe base quantity"**, not
"batch size" — a real batch can be 800 or 1,200 kg and the recipe scales.

## Planned input — formula

For a product made on a routing:

```
planned qty of a component per 1 unit of the product
  = (qty_per_unit ÷ base_qty) × (1 + scrap_factor) ÷ Π (1 − planned_shrinkage of each OPERATION on that routing)
```

Worked example (mixer, recipe base 1,000 kg: A 700 kg, B 300 kg; A scrap 2%; Mixer 1 shrinkage 5%), 100 kg of mix:
A = 100 × 0.7 × 1.02 ÷ 0.95 = **75.16 kg**, B = 100 × 0.3 ÷ 0.95 = **31.58 kg**. Mixer 2 with 3% shrinkage uses the
same BOM: A = 73.61 kg, B = 30.93 kg.

**Until material per step exists (#58 part A),** every step's shrinkage on the routing applies to every line of the
product's BOM. When lines are tied to steps, a line is inflated only by the steps from where it enters onward.
Multi-level BOMs keep losses apart naturally: the mix's shrinkage sits on the mix's routing, not the pack's.

## Parked — not in this decision

- New tag role `activity_signal` (downtime from motor current / voltage / vibration, Availability only) —
  discussed, not yet decided. `lot_marker` was decided later the same day (issue #58 Q6).
- Lot quantity and lot time window on `WORK_ORDER_OPERATION_LOT`, lot closing rules — PRODUCTION's call
  (`production-domain`).
- Weight deviation / per-piece measurement role (`quality_measurement`) — #58 part C, parked by PO.
