# 2026-09-30 — Product type gains packaging and consumable; phantom BOM flag; BOM tree view

- **Decided by:** Product Owner (after discussion of the Ajinomoto 250g example, issue #58)
- **Reopens and resolves:** F-06 P-6 (was "three types are enough")
- **Changes the pick in:** issue #58 part A — packaging and consumable become `product_type` values, not a
  "material class" and a BOM line use
- **Domain:** FOUNDATION (F-06 Product, F-08 Work Master; UX 06, UX 08)

## Decisions

### A — `PRODUCT.product_type` has five values

`raw_material` · `packaging` · `consumable` · `semi_finished` · `finished_good`

The Ajinomoto example has materials that are bought and counted per unit but are not raw material in the
factory's language — the bag and the carton. Consumables (tape, lubricant) are bought too, but usually not
counted per unit. The five values match the SAP material types the ERP side already uses (ROH, VERP, HIBE,
HALB, FERT), so a product imported from an ERP keeps its type.

**Phantom is not a type.** A phantom is a semi-finished product that is never stocked — it passes straight to
the next step. It is still `semi_finished`; "phantom" describes how its BOM is used (decision C).

### B — Packaging level on the product

New field `PRODUCT.packaging_level`: `primary` (touches the product — the bag) or `secondary` (protects the
primary — the carton, the tape). Required when `product_type = packaging`, empty otherwise.

### C — Phantom flag on the BOM

New field `BOM.is_phantom` (boolean, default false). Allowed only on the BOM of a `semi_finished` product.
A phantom BOM is shown in the tree (dashed) and its components are counted as if they sat directly under the
parent. What a phantom means for stock and material requirement is the future Inventory domain's call — no
rule is invented here.

### D — BOM tab is a tree, on Product detail only (prepared, not required)

The BOM tab (`SCR-FND-WMS-002`) on the Product detail page shows the BOM **as a tree** — one view, no
Tree / Table switch like the site tree explorer. The product's own lines (first level) are edited in the tree;
deeper levels are other products' BOMs, read-only here with a link to edit them on that product. Each node shows
its type colour, quantity per 1 unit of the product rolled down the branch, and phantom nodes dashed. The tree is
shown only on the Product detail page for now.

**No product hierarchy has to be declared.** A single-level BOM is valid and shows as one level. A
semi-finished product without its own BOM shows as a leaf with "No BOM yet". The model (BOM nesting, F-08
core concept 2) already supports more levels; the tree is ready for them.

## Not in this decision

- **Material per routing step** (`BOM_LINE.operation_id`, line use consumed/produced) — issue #58 part A,
  still open. If it lands, its "consumable" line use is dropped: consumable is now a product type, and two
  places saying "consumable" could disagree.
- **Storage location** ("handled by warehouse X" in the example) — future Inventory domain.
- Whether a `consumable` line counts in a material requirement — Inventory, `TBD`.
