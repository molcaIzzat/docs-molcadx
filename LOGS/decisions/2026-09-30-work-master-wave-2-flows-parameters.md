# 2026-09-30 — Work Master wave 2: flows, parameter standards

- **Decided by:** Product Owner, prompted by an EBR (electronic batch record) "Product Standard" screen: one product,
  several flows (direct compression / dry / wet granulation), process + sub-process per step, parameter standards
- **PO answer:** option **A** — several flows per product, chosen per work order. Option B (paths that change during a
  batch) not now
- **Domain:** FOUNDATION (F-00, F-08, UX 08); two questions raised to PRODUCTION (PLN-Q7, PLN-Q8)
- **Builds on:** [wave 1](2026-09-30-work-master-wave-1.md)

## Decisions

### A — `PRODUCT_FLOW`: one way of making a product

Each flow has its own BOM and routings, active side by side. `BOM.flow_id`, `ROUTING.flow_id`. Every product has ≥1
flow; a "Standard" primary flow is created automatically, and existing BOM / routings move into it. Exactly one
primary flow per product per date; the work order picks a released flow (default primary). Version rules become
"per flow". `ROUTING.is_primary` now means primary among a flow's routings at one work center.

### B — ~~Process library~~ (dropped 2026-10-01, PO)

A `PROCESS` reference table was added, then dropped before merge: it meant the same as `OPERATION.step_type`.
The PO kept **step type** (free text, suggesting types already used in the tenant).

### C — Parameter standards

New `OPERATION_PARAMETER`: parameter name, target, min, max, unit, critical flag, effective-dated. Values change as a
standard (same version); adding / removing a parameter is structural (new version). FOUNDATION holds the standard only;
tag mapping and out-of-range handling → PRODUCTION / Quality (PLN-Q8).

### D — Enforce step order (flag only)

`ROUTING.enforce_sequence`. The blocking rule at execution is PRODUCTION's (PLN-Q7).

## Not in this decision

- Paths that change during a batch (conditions, loops) — option B, later, PRODUCTION / Workflow Engine.
- QA approval / e-signature before a flow or routing is released — later, with the Workflow Engine (F-09).
- EBR-specific product data (dosage form, strength) — out of scope.
- Whether EBR / pharma is a MolcaDx target at all — PO did not say; wave 2 is written to be useful for food lines too.
