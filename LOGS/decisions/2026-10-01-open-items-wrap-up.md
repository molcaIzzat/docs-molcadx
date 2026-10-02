# 2026-10-01 — Wrap-up of the open items from the 2026-09-30 Work Master session

- **Decided by:** Product Owner — "yes to all" on the recommended answers below
- **Domain:** PRODUCTION (planning, acting as PO across domains — AGENTS.md §5 rule 6), FOUNDATION (F-04, F-06, F-07.1, F-08)

## PRODUCTION — PLN-Q1 to PLN-Q8

| # | Decision |
|---|---|
| Q1 | `WORK_ORDER_OPERATION_DEFECT.uom_id` added (kg / pcs / punch) |
| Q2 | New `origin = manual`: the main source on a work unit with no reject tag; with a tag, manual stays `manual_override` |
| Q3 | Releasing a finished-good order creates **draft** orders for earlier stages (BOM + shrinkage); the planner can edit them |
| Q4 | `WORK_ORDER_OPERATION_LOT` gets `qty`, `uom_id`, `started_at`, `ended_at`, `closed_by`. Lot closes on the `lot_marker` tag, else operator "Close lot"; force-closed on product change; auto-closed at job end |
| Q5 | Batch ID across shifts: **not now** — a lot with start/end already groups one run |
| Q6 | `routing_version_locked` / `bom_version_locked` removed; `routing_id` / `bom_id` pin one released version |
| Q7 | `WORK_ORDER.product_flow_id` (default primary flow); `enforce_sequence` **blocks** the next step |
| Q8 | Parameter tags and out-of-range handling: **not now** (comes with the Quality domain) |

## FOUNDATION

- `PRODUCT_DETAIL.weight_uom_id` (mass unit) — the weights had no unit.
- Knife / tooling: **not modelled**; one cycle time per product.
- Ajinomoto example removed from F-08 (quantities looked gross, conflicting with the net rule); the biscuit example covers the cases.
- **`activity_signal` tag role decided:** kind `value`, any unit (current, voltage, vibration, pressure); Availability only, via the band check; never Performance or Quality.

## Parked, each with its own issue

- Weight deviation (#58 part C) → #60
- Paths that change during a batch → #61
- Approval / e-signature before release → #62
