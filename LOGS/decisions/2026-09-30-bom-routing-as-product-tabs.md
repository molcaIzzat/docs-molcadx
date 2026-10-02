# 2026-09-30 — BOM and Routing move to Product detail tabs

- **Decided by:** Product Owner
- **Revises:** [2026-09-28 decision](2026-09-28-work-master-per-domain-operation-uom.md) decision A and its
  first addendum ("Work Master flattened in the sidebar") — BOM and Routing leave the Production sidebar group
- **Domain:** FOUNDATION (F-06 Product, F-08 Work Master) — navigation only; no entity, field or owner changes

## Decision

BOM (`SCR-FND-WMS-002`) and Routing (`SCR-FND-WMS-003`) are **tabs on the Product detail page**
(`SCR-FND-PRO-001`), not items in the Production sidebar group. Screen IDs are unchanged.

```
Product detail tabs:  Measurement · Conversions · BOM · Routing · History

(no heading)  shared FOUNDATION masters: site, shift, fiscal, asset, reference, product, connections
Production    KPI
Maintenance   PM checklist · KPI · Asset history
Quality       KPI
Inventory     KPI
```

## Why

- **The data is shared, the old screens looked Production-only.** `ROUTING`, `OPERATION`, `BOM`, `BOM_LINE`
  are FOUNDATION entities (F-08) because more than one domain reads them: KPI reads
  `OPERATION.cycle_time_value`, Inventory will read `BOM` for material consumption, Quality may attach
  inspection to an `OPERATION` ([2026-09-10](2026-09-10-mom-domain-alignment.md)). Putting their screens
  inside the Production group said the opposite.
- **A recipe belongs to one product.** Both editors already open per product. On the Product page the user
  sees the product, its units, its conversions and its recipe in one place.

## What changes

- **Product detail** gains two tabs, BOM and Routing, holding the existing editors unchanged (versioning,
  locking, cycle-time entry, errors).
- **Product list** keeps the "which products still lack a BOM or routing" view that the 2026-09-28 BOM /
  Routing lists gave: two status columns with the same badges ("No BOM yet", "No routing yet",
  "Cycle time missing", "No unit conversion", "Locked by \<work order\>") and the "Only products without a
  BOM / routing" filters. Badges apply to `semi_finished` and `finished_good` only — a `raw_material` shows
  "—" (bought, not made).
- **The separate BOM and Routing list pages are gone.** The "Routing for / BOM for \<product\>" header link is
  retired (both are tabs on the same page).
- **Sidebar keys** `nav-sidebar.item.bom` and `nav-sidebar.item.routing` retired, not reused.

## License gate — option A (hidden)

Tenant **without** a Production license: the BOM and Routing tabs, the two status columns and the two filters
are **hidden** on the Product screens. Same effect as before (the Production group was one locked heading with
its items hidden); the upsell stays on the locked Production heading. The Product screens themselves are never
locked (FOUNDATION is bundled).

Options not taken: **B** show read-only without Production, **C** always editable (no gate). Revisit — most
likely toward C — when Inventory or Quality starts reading BOM/Routing.

## Not changed

- Entities, fields, versioning and ownership of `ROUTING` / `OPERATION` / `BOM` / `BOM_LINE`.
- MAINTENANCE's PM checklist stays in the Maintenance group — a different entity by design (F-08 "Work Master
  per domain").
- "Work Master" is still the module name (ISA-95 term), not a menu or tab label.

## Consequences

- Spec: F-08 "Work Master per domain" section, UX 00 app shell, UX 06, UX 08 updated.
- PRD-003: `US-FND-WMS-002`, `US-FND-WMS-003` (and the product story behind `SCR-FND-PRO-001`) describe the old
  navigation — `prd-sync` backlog, not done in this session.
