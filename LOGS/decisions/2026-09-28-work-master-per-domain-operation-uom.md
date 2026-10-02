# 2026-09-28 — Work Master per domain, operation item unit, `PRODUCT_CYCLE` retired

- **Decided by:** Product Owner
- **Resolves:** W-6 (`OPERATION.uom_id`/`.time_conversion_id` pairing), UX-WMS-2; revises the 2026-09-27 KPI sidebar group and K-9
- **Domain:** FOUNDATION (F-06 Product, F-07 KPI Formula, F-08 Work Master); navigation touches MAINTENANCE M-02 and PLATFORM PLT-01
- **Revised in part 2026-09-30:** BOM and Routing left the Production sidebar group and became tabs on the
  Product detail page — [2026-09-30 decision](2026-09-30-bom-routing-as-product-tabs.md). The rest of decision A
  (domain-grouped sidebar, locked heading) still holds.

## Decisions

### A — Sidebar grouped by domain; data stays where it is

The app sidebar is grouped **by domain**, not by function. This replaces the KPI sidebar group
(2026-09-27) and the first draft of this decision (a "Work Master" group with one item per domain).

```
(no heading)  shared FOUNDATION masters: site, shift, fiscal, asset, reference, product, connections
Production    Work Master · KPI
Maintenance   Work Master · KPI
Quality   🔒  (locked heading when not licensed)
Inventory 🔒
```

- **Shared items at the top, no heading** — everything every domain uses; none of it belongs to one
  domain. No umbrella "Master data" label (PO, same day): Reference data and Connections keep their
  own group headings.
- **A domain group** holds only configs that vary per domain — Work Master and KPI today. A future
  per-domain config goes there; a shared one goes to the shared items at the top.
- **Not licensed:** the domain group shows as **one locked heading** (collapsed, lock icon, not
  expandable). Clicking it opens the upsell surface. Its items are hidden. A direct link to a screen
  of that domain still lands on the visible-but-locked screen state. This resolves UX-WMS-2 and
  replaces the K-9 "hidden, not locked" sidebar-item rule.

**Why by domain:** licences are sold per domain, so the sidebar follows what the tenant bought; one
locked heading is a single, consistent upsell spot; per-domain configs don't multiply into
identical four-item groups.

The Work Master **data shape differs per domain** and is not generalized into one table:

| Domain group | Work Master holds | Owner |
|---|---|---|
| Production | `ROUTING` / `OPERATION` / `BOM` / `BOM_LINE` (process recipe) | FOUNDATION F-08 — **stays in FOUNDATION** |
| Maintenance | `PM_PROCEDURE` / `PM_PROCEDURE_STEP` (PM checklist per asset type) | MAINTENANCE M-02 |
| Quality | Test / inspection spec | `TBD` — no domain yet, nothing modelled |
| Inventory | Movement / handling procedure | `TBD` — no domain yet, nothing modelled |

**Why Production's recipe stays in FOUNDATION (option 1 of 2):** other domains read it — KPI reads
`OPERATION.cycle_time_value`, Inventory will read `BOM` for material use, Quality will read
operations. That is the shared-object-model rule from
[2026-09-10](2026-09-10-mom-domain-alignment.md). Moving it to PRODUCTION (option 2) would make
KPI (FOUNDATION) depend on a MOM domain, which that split was designed to avoid. Consistent with
[2026-09-24 Production Work Master view](2026-09-24-production-work-master-view.md): no second
Production catalog.

### B — `OPERATION.uom_id` is the item unit, not a time unit

Before: `OPERATION.uom_id` was documented as the time unit — the same job as `time_conversion_id`.
No field said **what item** the cycle time is per, so "20 seconds / pack" had nothing behind "pack".

Machines along one routing count in different units (a filler counts packs, a cartoner counts
cartons). Now:

- `OPERATION.uom_id` = the item unit the standard is per (pack, carton, kg).
- `time_conversion_id` = the time unit, alone.
- The KPI converts the counter's unit to the operation's unit through the product's own
  `PRODUCT_UOM_CONVERSION` (F-06 §9.4).

**Example:** step 20 at WU_02 = 216 s / carton; product conversion 1 carton = 12 pack. The counter
reports 1,200 pack → 1,200 ÷ 12 = 100 carton → 100 × 216 s = **21,600 s** ideal operating time.

**Order of computation:** conversion applies only when the counter tag's `count_basis = 'unit'`
— convert the count to `OPERATION.uom_id` → divide by `batch_size` → × `cycle_time_value` ×
`seconds_per_unit`. A `count_basis = 'cycle'` counter counts machine cycles, which have no item
unit, so it skips conversion.

**Conversion path:** same unit; one `PRODUCT_UOM_CONVERSION` row read forward (×) or backward (÷);
or two rows joined through `PRODUCT.base_uom_id`. Only rows active on the date asked about count.

Missing conversion: blocked at save; at runtime the KPI shows "cannot be calculated", never 0%.

**UX-WMS-2 (resolved same day):** hidden sidebar item (K-9) vs visible-but-locked screens
(2026-09-12) — settled by the locked domain heading in A.

### C — `PRODUCT_CYCLE` retired

- **Nothing read it** — not the KPI formula, not PRODUCTION (checked across the repo).
- **It contradicted Work Master.** One product showed 18 s / pack on Product while its routing had
  20 s and 18 s at two work units. Cycle time depends on the machine, so it belongs on `OPERATION`.
- **Its per-unit purpose is covered by B.**

Product keeps identity and physical facts only: Measurement, Conversions
(`PRODUCT_UOM_CONVERSION`, now read by the KPI), History.

## Consequences

- Spec: F-06 §9.3 retired, F-07 formula gains a conversion step, F-08 §9.2 `uom_id` redefined,
  W-6 closed, UX 06 Cycle Time tab retired, UX 00/07/08 domain-first sidebar, PLATFORM PLT-01 +
  entitlement FLOW gain the locked-heading state.
- PRD-003: stories touching `PRODUCT_CYCLE` and `OPERATION` cycle time need `prd-sync` — backlog,
  not done in this session (see changelog).

## Addendum (same day) — Work Master flattened in the sidebar

"Work Master" is not a menu item. Each domain group lists its pages by what they are:

```
Production    BOM · Routing · KPI
Maintenance   PM checklist · KPI · Asset history
Quality       KPI            (Work Master TBD, no item until modelled)
Inventory     KPI
```

**Why:** BOM and Routing are independent — different entities (`BOM`/`BOM_LINE` vs
`ROUTING`/`OPERATION`), separate versioning, different readers (Inventory vs KPI/planning) and editors.
Tabs added a click without meaning. "Work Master" stays the spec/module name (ISA-95 term).

- `SCR-FND-WMS-002` (BOM) and `SCR-FND-WMS-003` (Routing) become separate pages; IDs unchanged. Each has
  its own item picker; the last picked item carries over between the two.
- `nav-sidebar.item.work-master` retired; `bom`, `routing`, `pm-checklist` added.
- `SCR-FND-WMS-001` "Items & UOM" duplicates the Product screens — retirement proposed (UX-WMS-3), not done.

## Addendum (same day) — four follow-up answers

| Question | PO answer |
|---|---|
| Quality tags in different units (good in pcs, total in kg) | **Blocked at binding** — good/total/reject on one work unit must share one unit; Quality never converts. Error key `kpi-002.error.quality-uom-mismatch` |
| Rate typed on Routing ("500 per hour") | **Saved as typed** — stored in the time unit the user picked, not normalised to seconds. The "row worth exactly 1 second" check (`ref-002.summary.one-second-row`) is retired. Decimal precision of `cycle_time_value`: `TBD` (PO/Engineering) |
| KPI breakdown when counter and standard units differ | **Show the rule**, not live numbers — keys `kpi-004.conversion.rule` / `.missing` |
| `SCR-FND-WMS-001` "Items & UOM" | **Retired** (duplicate of Product screens), ID not reused. UX-WMS-3 resolved |
