# 2026-09-30 — Work Master wave 1 (issue #58 parts A and B)

- **Decided by:** Product Owner — issue #58 items agreed in the Work room 2026-09-30; Q1, Q4 (updated) and Q6
  answered "yes" in the same session
- **Closes:** W-7, W-8 (F-08)
- **Domain:** FOUNDATION (F-04, F-07, F-08, UX 04, UX 08, FLOW-02); one question raised to PRODUCTION (PLN-Q6)
- **Builds on:** the other 2026-09-30 decisions (product tabs; product types / phantom / tree; net recipe /
  shrinkage; line across work centers). Where #58's original pick differs, those decisions win — see "Changed picks"

## Part A — BOM and Routing

| Item | Decision |
|---|---|
| Version + status (W-8) | `version` + `status` (`draft` / `released` / `retired`) on `ROUTING` and `BOM`; one row per version. Structural change → next version; standard change (cycle time, speed, setup, shrinkage, override) → effective-dated row in the same version. A work order pins by `routing_id` / `bom_id` |
| Step name + type | `OPERATION.step_name`, `step_type`. **2026-10-01 (PO): `step_type` is free text**, no system logic; a step counts for Performance when it has a standard |
| Setup time unit (W-7) | `OPERATION.setup_time_conversion_id`; setup time and crew size optional |
| Primary routing | `ROUTING.is_primary`; at most one per product per work center per date |
| Machine-class requirement | `OPERATION.required_work_unit_class_id` + new `OPERATION_WORK_UNIT` (eligible stations, optional cycle-time override). Replaces "parallel machines share a step number" |
| Step dependencies | New `OPERATION_DEPENDENCY`; no rows = straight line in step order |
| Material per step | `BOM_LINE.operation_id`, `line_use` (`consumed` / `produced`), `is_primary_output`. Step ratio calculated, never stored. Shrinkage applies per line from its entry step onward |
| `scrap_factor` unit | Fraction (done earlier today) |
| Counter side | `ASSET_TAGS.count_side` (`output` default / `input`); input counts converted and marked `derived`; measured output wins |
| Batch vs discrete | From `WORK_CENTER.type` (`process_cell` batch, `production_line` discrete). Batch output split across shifts by running time; "pending, batch open" until it closes |

## Part B — product codes

Section `SCR-FND-WMS-007` inside the product's Routing tab, grouped by work unit; data stays in F-04
`ASSET_PRODUCT_CODES`, whose `valid_from` / `valid_to` become timestamps. Flags for a code with no step and a step
with no code; "Seen but not mapped" list from the platform's unassigned table; a late mapping re-attributes past rows
and recalculates shifts. **No PRD story written** — the issue's "done when" asks for one; rule 1 needs the PO to ask.

## Questions

- **Q1:** standard read as of the shift's `business_date`; back-dated fixes recalculate, with a warning and `AUDIT_LOG`.
- **Q4 (updated):** product codes live inside the product's Routing tab (Routing is itself a Product tab now).
- **Q6:** batch start/end = job step start/close, plus an optional `lot_marker` tag (level signal). The same role
  marks lots. Tag role added to F-04.

## Changed picks (vs issue #58 as written)

- Packaging: `product_type = packaging` + `packaging_level`, not a material class.
- Consumable: a `product_type`; no `consumable` line use.
- Q2: planned loss on steps now (`planned_shrinkage`), not wave 2.
- Q3: a produced line names a semi-finished product; material classes not supported.

## Not in this decision

- Part C (weight deviation, Q7–Q9) — parked by PO.
- Tag role `activity_signal` — still parked.
