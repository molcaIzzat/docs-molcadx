# 2026-09-30 — A line across several work centers; reject entered by weight

- **Decided by:** Product Owner (step-by-step walk-through of a biscuit line: mixing → molding → oven → cooling → packing)
- **Domain:** FOUNDATION (F-08 Work Master, F-07 KPI Formula, UX 08); open questions raised to PRODUCTION

## Decisions

### A — One product per work center

A `ROUTING` is one product at one work center. A line through several work centers is modelled as **one product
per work center** (Dough @ Mixing → Baked biscuit @ Baking → Pack @ Packing), linked by the BOM. Reasons: OEE and
cycle time sit on the product that really runs; a shared dough works; traceability and the future Inventory
domain need a product (and lots) per stage.

A stage with its own work center is **not** phantom, even if never stocked — it needs its own jobs. Phantom is for
a stage with no work center of its own.

### B — Planning picks each work center's own output

Mixing is planned with Dough, Baking with Baked biscuit, Packing with the pack. Never a raw material. Automatic
creation of stage orders from the finished-good order is PRODUCTION's call (PLN-Q3).

### C — Routing steps pre-filled from the work center's flow

`EQUIPMENT_FLOW` (declared once per work center) pre-fills the routing's steps in order. Per step the user sets
output unit, cycle time or throughput, and planned shrinkage. A product can untick a machine it skips; parallel
machines are one class-based step (revised later the same day, [wave 1](2026-09-30-work-master-wave-1.md)); a later flow change flags the routing for review, never edits it silently.

### D — Weight of one unit at each step is derived

`standard_weight` (finished weight) ÷ Π (1 − shrinkage of later steps). "Wet" and "dry" are before and after the
shrinkage step — nobody marks work units wet or dry.

### E — Punching: cycle time per punch

A punching step can use `punch` as its output unit with a cycle time per punch (full normal speed, not the
operator's setting). Pieces per punch are not needed for its OEE. Weight of one punch (declared once) lets
rejects in kg convert.

### F — Reject entered by weight converts to units, then time

reject units = weight ÷ weight of one unit at that step; reject time = units × that step's cycle time. Quality
ratio at the work unit uses the converted units. Rejects across work units add up in **time**, never in kg.
No output count → Quality shown only as "estimated".

## Open questions raised to PRODUCTION

In `DOMAINS/PRODUCTION/DOCS/01-planning.md` § "Open questions raised from FOUNDATION": PLN-Q1 unit on
`WORK_ORDER_OPERATION_DEFECT.qty`; PLN-Q2 manual entry as primary source without a reject sensor; PLN-Q3 automatic
stage orders; PLN-Q4 lot quantity / time window / lot button; PLN-Q5 batch ID across shifts.

## Still open in FOUNDATION

- Unit of `PRODUCT_DETAIL.standard_weight` is not a field (kg assumed).
- Knife / tooling as an asset, if one product runs with several knives at different speeds.
- Tag role `activity_signal` — discussed, not decided. (`lot_marker` decided later the same day, issue #58 Q6.)
