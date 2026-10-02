# UX 06 — Product screens

> Mirrors [F-06 product](../DOCS-EN/06-product.md) · Status: 🟡 DRAFT.

**Coverage:** `PRODUCT`, `PRODUCT_DETAIL`, `PRODUCT_UOM_CONVERSION`
(F-06 §9) — rule D-1. `PRODUCT_CYCLE` retired 2026-09-28 ([F-06 §9.3](../DOCS-EN/06-product.md#93-product_cycle--retired-2026-09-28), [2026-09-28 decision](../../../LOGS/decisions/2026-09-28-work-master-per-domain-operation-uom.md));
cycle time is entered only on the routing & operation editor `SCR-FND-WMS-003` (the Routing tab below).
**Also shown here (2026-09-30):** `BOM`, `BOM_LINE`, `ROUTING`, `OPERATION` (F-08) as the BOM and Routing tabs —
their coverage and editor rules stay in [UX 08](08-work-master.md).

## Screens

`SCR-FND-PRO-001`'s detail view is **tabbed**, not separate screens: selecting a product opens one detail
page with a **Measurement / Conversions / BOM / Routing / History** tab set.
`SCR-FND-PRO-003` is the Conversions tab on that page. **BOM** (`SCR-FND-WMS-002`) and **Routing**
(`SCR-FND-WMS-003`) became tabs here on 2026-09-30 — they were Production sidebar items
([2026-09-30 decision](../../../LOGS/decisions/2026-09-30-bom-routing-as-product-tabs.md)); their editor behavior
is specified in [UX 08](08-work-master.md), not repeated here. The **Cycle time** tab (`SCR-FND-PRO-002`) was
retired 2026-09-28; its ID is kept and never reused (per [`00-ux.md`](00-ux.md)). History is the audit
capability ([F-14](../DOCS-EN/14-audit-trail.md)), not a new screen ID.

**Product list — BOM and Routing status (2026-09-30).** The list shows two extra columns, **BOM** and
**Routing**, with the badges and "Only products without a BOM / routing" filters defined in
[UX 08](08-work-master.md#work-master-pages--bom-and-routing-on-product-detail-po-decision-2026-09-30). Badges
apply to `semi_finished` and `finished_good` (made); `raw_material`, `packaging` and `consumable` (bought) show "—".

**Product type and packaging level (2026-09-30, [decision](../../../LOGS/decisions/2026-09-30-product-type-packaging-phantom-bom-tree.md)).**
The type picker offers five values: Raw material · Packaging · Consumable · Semi-finished · Finished good
(`PRODUCT.product_type`, F-06 §9.1). Choosing **Packaging** shows a required **Packaging level** field
(Primary / Secondary, `PRODUCT.packaging_level`); any other type hides it. The product list gets a type
filter with the same five values, and the type shows as a badge on each row.

**No Production license:** the BOM and Routing tabs, both status columns and both filters are hidden. The
rest of the Product screens is never locked (FOUNDATION is bundled). A direct link to a hidden tab opens the
Measurement tab.

| SCR ID | Screen | Purpose | Entities (§9) | States worth noting | Stories |
|---|---|---|---|---|---|
| `SCR-FND-PRO-001` | Product list & tabbed detail | Declare products; detail attributes per `PRODUCT_DETAIL`, with **Measurement / Conversions / BOM / Routing / History** tabs on the same detail page (Cycle time tab retired 2026-09-28; BOM and Routing tabs added 2026-09-30, hidden without a Production license). List shows BOM and Routing status columns | `PRODUCT`, `PRODUCT_DETAIL` (BOM / Routing tabs: see UX 08) | Empty: "no products — declare one before routing/BOM"; unblocks the deferred step in `SCR-FND-AST-002` | KR 2.1, `story TBD — PRD-002 candidate` |
| ~~`SCR-FND-PRO-002`~~ | ~~Cycle time tab~~ **Retired 2026-09-28** — `PRODUCT_CYCLE` retired; cycle time is entered per work unit on `SCR-FND-WMS-003` (value + time unit + item unit). ID not reused | — | — | — | `US-FND-PRO-004` — needs PO review (rule 1b) |
| `SCR-FND-PRO-003` | ~~Product UOM conversions~~ **Conversion tab** on `SCR-FND-PRO-001`'s detail page | Per-product conversion rows; **cross-dimension conversion only via product-scoped rows** (F-00 rule). **One row covers both directions** (F-06 §9.4, 2026-09-28): the screen does not ask for or offer to create a reverse row. Since 2026-09-28 these rows also let an operation's item unit differ from the base UOM (`SCR-FND-WMS-003` blocks the save without one) | `PRODUCT_UOM_CONVERSION` | Error: generic cross-dimension conversion attempt rejected with the rule quoted | KR 2.1 |

| Key | Where / state | Text | Stories |
|---|---|---|---|
| `pro-001.tab.bom` | Product detail tab (Production licensed) | "BOM" (draft) | US-FND-WMS-002 |
| `pro-001.tab.routing` | Product detail tab (Production licensed) | "Routing" (draft) | US-FND-WMS-003 |
| `pro-001.list.col.bom` | Product list column | "BOM" (draft) | US-FND-WMS-002 |
| `pro-001.list.col.routing` | Product list column | "Routing" (draft) | US-FND-WMS-003 |
| `pro-001.list.not-made` | BOM / Routing column for a bought product (`raw_material`, `packaging`, `consumable`) | "—" (draft) | US-FND-WMS-002, US-FND-WMS-003 |
| `pro-001.field.type` | Product form, type picker | "Type" · options "Raw material" / "Packaging" / "Consumable" / "Semi-finished" / "Finished good" (draft) | `story TBD` |
| `pro-001.field.packaging-level` | Product form, shown only when type = Packaging | "Packaging level" · options "Primary" / "Secondary" (draft) | `story TBD` |
| `pro-001.error.packaging-level-missing` | Save blocked, type = Packaging without a level | "Choose a packaging level: Primary or Secondary." (draft) | `story TBD` |

## State notes

- Declaring the first `PRODUCT` is what unlocks `ASSET_PRODUCT_CODES` mapping
  ([FLOW-02](../FLOW/02-production-readiness.md) deferred edge) — the success state should say so
  explicitly.

## Open questions

| # | Question | Owner |
|---|---|---|
| UX-PRO-1 | Product vs item naming on screen — glossary says `ITEM` is retired; confirm single label "Product" | PO |
