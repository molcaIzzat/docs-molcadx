# UX 08 — Work master screens

> Mirrors [F-08 work master](../DOCS-EN/08-work-master.md) ·
> behavior: [FLOW-02](../FLOW/02-production-readiness.md), [FLOW-06](../FLOW/06-change-control.md) ·
> Status: 🟡 DRAFT.

> **Structural move, 2026-09-03 (PO decision, contest review):** `WORK_ORDER` and
> `WORK_ORDER_OPERATION` are no longer F-08 entities — they moved to domain **PRODUCTION**
> (Job Schedule module, see [`DOMAINS/PRODUCTION/DOCS/01-planning.md` § Entities](../../PRODUCTION/DOCS/01-planning.md#entities)).
> Rule D-1 ("every §9 entity of the module appears in ≥1 screen") no longer applies to these
> two — they aren't F-08 §9 entities anymore. `SCR-FND-WMS-004` and `SCR-FND-WMS-006` below
> describe screens for those moved entities; they are kept in this document **out of
> FOUNDATION's scope**, not deleted, because PRODUCTION's own `UX/` series doesn't exist yet
> ([`UX/00-ux.md`](00-ux.md) "Scope note 2026-08-26") and this is currently the only place
> those screens are described at all. `production-domain` should port/retire these rows into
> its own `UX/` doc once that series starts, using new `SCR-PROD-*` IDs — per the ID rule in
> [`UX/00-ux.md`](00-ux.md#id-grammar), the `SCR-FND-WMS-004`/`SCR-FND-WMS-006` IDs themselves
> are never reused or renumbered even after that happens. See
> [`LOGS/decisions/2026-09-03-foundation-contest-blockers.md`](../../../LOGS/decisions/2026-09-03-foundation-contest-blockers.md).

**Coverage:** `ROUTING`, `OPERATION`, `BOM` (F-08 §9) — rule D-1. Defect codes merged into `REJECT_REASON` (2026-09-23) and are edited on the Reference reject reason manager `SCR-FND-REF-004`.
`WORK_ORDER`/`WORK_ORDER_OPERATION` screens are listed below for continuity but are out of
FOUNDATION's D-1 coverage — see the structural-move note above.

**License-gated, 2026-09-12 — new state applies to every screen below (`SCR-FND-WMS-002`,
`-003`; `-001` and `-005` since retired):** these are Module-level screens gated by **Production**, not
FOUNDATION (data ownership ≠ license gate, see
[`PLATFORM/DOCS-EN/01-license-manager.md`](../../PLATFORM/DOCS-EN/01-license-manager.md#module-license-gate--data-ownership)).
**No entitlement:** tenant lacks a Production license → screen is **visible but locked** (an
upsell surface, not hidden) — the check and its state are declared once in
[`PLATFORM/FLOW/01-module-entitlement-check.md`](../../PLATFORM/FLOW/01-module-entitlement-check.md),
cited here rather than redrawn per screen. This is a **different** state from "No permission"
below (which is about a subject's ABAC scope claim within a tenant that *does* have Production
— two different gates, don't conflate them).
**2026-09-30:** now that BOM and Routing are tabs on the Product detail page, "no entitlement" means the
tabs are **hidden**, not shown locked — the upsell surface is the locked Production group heading
([2026-09-30 decision](../../../LOGS/decisions/2026-09-30-bom-routing-as-product-tabs.md), option A).

## Work master pages — BOM and Routing on Product detail (PO decision, 2026-09-30)

**BOM (`SCR-FND-WMS-002`) and Routing (`SCR-FND-WMS-003`) are tabs on the Product detail page**
(`SCR-FND-PRO-001`, [UX 06](06-product.md)): **Measurement · Conversions · BOM · Routing · History**. IDs unchanged.
They are no longer items in the Production sidebar group
([2026-09-30 decision](../../../LOGS/decisions/2026-09-30-bom-routing-as-product-tabs.md), revising the
[2026-09-28 decision](../../../LOGS/decisions/2026-09-28-work-master-per-domain-operation-uom.md)):
the data is FOUNDATION's and other domains read it (KPI today, Inventory and Quality later), and a recipe
belongs to one product. There is **no "Work Master" menu item or tab** — "Work Master" stays the
spec/module name (ISA-95 term).

| Domain | Where its work master is edited | Entities | Owner |
|---|---|---|---|
| Production | **BOM** and **Routing** tabs on the Product detail page (`SCR-FND-PRO-001`) | `PRODUCT` (read), `BOM`, `BOM_LINE`, `ROUTING`, `OPERATION` | FOUNDATION F-08 |
| Maintenance | **PM checklist** item in the Maintenance sidebar group → screens of [MAINTENANCE M-02](../../MAINTENANCE/DOCS-EN/02-work-master.md) — no MAINTENANCE `UX/` doc for M-02 yet (`TBD — maintenance-domain`); linked, not redrawn here | `PM_PROCEDURE`, `PM_PROCEDURE_STEP` | MAINTENANCE M-02 |
| Quality | none — work master `TBD`, not modelled | — | — |
| Inventory | none — work master `TBD`, not modelled | — | — |

- **BOM and Routing stay separate tabs** — different entities, versioning, readers and editors. Moving
  between them no longer needs a link: they are neighbouring tabs of the same product.
- **Gap view moves to the Product list (2026-09-30).** The 2026-09-28 BOM / Routing list pages (which showed
  products **without** a BOM or routing) are retired; the Product list carries the same information as two
  status columns, with the same badges and filters. The product is part of the detail page's address, so
  back/forward and shared links to a product's BOM or Routing tab work.

| Product list column | Shows | Badges |
|---|---|---|
| BOM | Current BOM version (`valid_from` → `valid_to` or "open") · component count | "No BOM yet" · "Locked by \<work order\>" |
| Routing | Current routing version · operation count | "No routing yet" · "Cycle time missing" (an operation without `standard_cycle_time`) · "No unit conversion" (F-08 §9.2.1 path missing on the current version) · "Locked by \<work order\>" |

  - **Badges only for products that are made:** `semi_finished` and `finished_good`. A bought product
    (`raw_material`, `packaging`, `consumable`) shows "—" in both columns, so "No BOM yet" would be noise.
  - **Filters (added to the Product list):** "Only products without a BOM" / "Only products without a
    routing". Rows needing action (no BOM / routing, missing cycle time, no conversion) can be sorted to the top.
  - Only the placement changed. The editor behavior below (versioning, locking, cycle-time entry, errors) is
    unchanged.

**No Production license (option A, 2026-09-30):** the BOM and Routing tabs, the two status columns and the two
filters are **hidden** on the Product screens. The upsell stays on the locked Production group heading
([UX 00 § App shell](00-ux.md#app-shell--sidebar-grouped-by-domain-po-decision-2026-09-28)). The Product screens
themselves are never locked (FOUNDATION is bundled). A direct link to a product's BOM or Routing tab lands on the
product's Measurement tab.

| Key | Where / state | Text | Stories |
|---|---|---|---|
| ~~`wms-picker.label`~~ | **Retired 2026-09-28** — no picker. Key not reused | — | US-FND-WMS-002, US-FND-WMS-003 |
| ~~`wms-picker.placeholder`~~ | **Retired 2026-09-28** — no picker. Key not reused | — | US-FND-WMS-002, US-FND-WMS-003 |
| ~~`wms-picker.empty`~~ | **Retired 2026-09-28** — replaced by `wms-list.empty`. Key not reused | — | US-FND-WMS-002, US-FND-WMS-003 |
| ~~`wms-list.empty`~~ | **Retired 2026-09-30** — no separate BOM / Routing list; the Product list's own empty state applies. Key not reused | — | US-FND-WMS-002, US-FND-WMS-003 |
| ~~`wms-002.list.columns`~~ | **Retired 2026-09-30** — replaced by `pro-001.list.col.bom`. Key not reused | — | US-FND-WMS-002 |
| ~~`wms-003.list.columns`~~ | **Retired 2026-09-30** — replaced by `pro-001.list.col.routing`. Key not reused | — | US-FND-WMS-003 |
| `wms-002.badge.none` | Product list, BOM column, made product has no BOM | "No BOM yet" (draft) | US-FND-WMS-002 |
| `wms-003.badge.none` | Product list, Routing column, made product has no routing | "No routing yet" (draft) | US-FND-WMS-003 |
| `wms-003.badge.cycle-time-missing` | Product list, Routing column, an operation has no cycle time | "Cycle time missing" (draft) | US-FND-WMS-003 |
| `wms-003.badge.no-conversion` | Product list, Routing column, an operation's item unit has no conversion path | "No unit conversion" (draft) | US-FND-WMS-003 |
| `wms-list.badge.locked` | Product list, BOM or Routing column, current version locked by a released work order | "Locked by \<work order\>" (draft) | US-FND-WMS-002, US-FND-WMS-003 |
| `wms-list.filter.without` | Product list filter toggle | "Only products without a BOM" / "Only products without a routing" (draft) | US-FND-WMS-002, US-FND-WMS-003 |
| ~~`wms-list.link.other`~~ | **Retired 2026-09-30** — BOM and Routing are neighbouring tabs; no cross-page link. Key not reused | — | US-FND-WMS-002, US-FND-WMS-003 |

### BOM tab — a tree, on Product detail only (PO decision, 2026-09-30)

The BOM tab (`SCR-FND-WMS-002`) on the Product detail page shows the BOM **as a tree** — the product at the
top, its components below, their own components below those. **One view, no view-mode switch** (unlike the
site tree explorer's Tree / Diagram / Table). The tree is shown **only on the Product detail page** for now.
Record: [2026-09-30 decision](../../../LOGS/decisions/2026-09-30-product-type-packaging-phantom-bom-tree.md), decision D.

- **Prepared, not required.** No product hierarchy has to be declared. A single-level BOM shows as one level.
  A `semi_finished` line with no BOM of its own is a leaf with the "No BOM yet" badge and a link to that
  product's BOM tab.
- **Top node:** the product and its **recipe base quantity** ("Quantities per 1,000 kg"; default "per 1 \<unit\>").
- **Each node:** code — name · type badge (and "Primary" / "Secondary" for packaging) · quantity **as typed**
  (per the parent's recipe base quantity) · **% of the batch** when the line's unit is in the same measurement
  group as the base unit (mass with mass) · **quantity per 1 unit of this product** (divided by the base
  quantity and multiplied down the branch; a missing unit conversion shows "No unit conversion" on the node
  instead of a number). All **net** — the tree shows the recipe; scrap and shrinkage are planning, not shown
  here ([F-08 planned input](../DOCS-EN/08-work-master.md#planned-input--net-recipe-plus-losses-po-2026-09-30)).
- **Editing happens in the tree, first level only.** The product's own BOM lines (first level) are editable:
  "Add component" under the top node; selecting a first-level node opens its line (component, `qty_per_unit`,
  `uom_id`, `scrap_factor`) for edit or removal. Deeper levels belong to other products' BOMs — **read-only
  here**, with "Open \<product\> BOM" to edit them on that product's page. Versioning, locking and errors are
  unchanged (Screens below): an edit on a locked version starts the next version.
- **Phantom** (`BOM.is_phantom`): node drawn dashed with a "Phantom" badge; its lines still show beneath it.
- **As of:** a date picker (default today) resolves which BOM version of each product is used; each node shows
  its version's `valid_from`. Editing is allowed only when "As of" is today.
- **Same component under two parents:** shown under both. Circular BOMs cannot exist (blocked on save, F-08 §9.4).
- **Folded** below the first level by default when the tree has more than 20 nodes.

| Key | Where / state | Text | Stories |
|---|---|---|---|
| `wms-002.tree.add` | Button under the top node | "Add component" (draft) | US-FND-WMS-002 |
| `wms-002.tree.open-child` | Deeper (read-only) node | "Open \<product code\> BOM" (draft) | US-FND-WMS-002 |
| `wms-002.tree.read-only` | Hover / long-press on a deeper node | "Part of \<product code\>'s BOM — edit it there." (draft) | US-FND-WMS-002 |
| `wms-002.tree.as-of` | Date picker label | "As of" (draft) | US-FND-WMS-002 |
| `wms-002.tree.past-read-only` | "As of" set to a past date | "Showing the BOM as of \<date\>. Switch to today to edit." (draft) | US-FND-WMS-002 |
| `wms-002.tree.qty-per-top` | Node, rolled-up quantity | "\<qty\> \<unit\> per \<product unit\>" (draft) | US-FND-WMS-002 |
| `wms-002.base-qty.label` | BOM version field | "Recipe base quantity" (draft) | US-FND-WMS-002 |
| `wms-002.base-qty.summary` | Top node | "Quantities per \<base qty\> \<unit\>" (draft) | US-FND-WMS-002 |
| `wms-002.tree.percent` | Node, share of the batch | "\<n\>% of batch" (draft) | US-FND-WMS-002 |
| `wms-003.shrinkage.label` | Routing editor, operation field | "Planned shrinkage (%)" · hint "Mass lost by the process at this work unit (evaporation, moisture). Not rejects." (draft) | US-FND-WMS-003 |
| `wms-003.error.shrinkage-range` | Save blocked, shrinkage ≥ 100% or < 0 | "Planned shrinkage must be from 0 to less than 100%." (draft) | US-FND-WMS-003 |
| `wms-003.badge.flow-changed` | Product list, Routing column, work center flow changed since this routing version | "Flow changed — review routing" (draft) | US-FND-WMS-003 |
| `wms-003.step.unit-weight` | Routing step, derived weight of one unit (read-only) | "\<weight\> per \<unit\> (wet)" / "(dry)" — "wet" before the shrinkage step, "dry" after (draft) | US-FND-WMS-003 |
| `wms-003.step.skip` | Routing step checkbox | "Used by this product" (draft) | US-FND-WMS-003 |
| `wms-002.tree.phantom` | Node badge, phantom BOM | "Phantom" (draft) | US-FND-WMS-002 |
| `wms-002.tree.empty` | Product has no BOM on the chosen date | "No BOM on \<date\>." + "Add component" (draft) | US-FND-WMS-002 |
| `wms-002.error.phantom-not-semi` | Save blocked, phantom on a non-semi-finished product | "Only a semi-finished product can have a phantom BOM." (draft) | US-FND-WMS-002 |

Tab and column labels (`pro-001.tab.bom`, `pro-001.tab.routing`, `pro-001.list.col.bom`,
`pro-001.list.col.routing`) are defined in [UX 06](06-product.md).

### Flows and parameter standards (PO decision, 2026-09-30, wave 2)

Record: [decision](../../../LOGS/decisions/2026-09-30-work-master-wave-2-flows-parameters.md).

- **Flow bar** above the BOM and Routing tabs: one tab per flow ("Standard", "Wet granulation", "+ Add flow"), the
  primary marked. The BOM and Routing tabs show the **selected flow's** BOM and routings. A product with a single
  flow shows no flow bar — the flow stays invisible until a second one is added.
- **Add flow:** name + code; optionally "Copy from \<flow\>" (copies its BOM and routings as drafts).
- **Routing:** toggle "Steps must be done in order" (`enforce_sequence`).
- **Parameters** section under each step: a table — parameter, target, min, max, unit, "Critical". Adding or
  removing a row is a structural edit (new version on a released routing); changing a value is a standard edit.

| Key | Where / state | Text | Stories |
|---|---|---|---|
| `wms-flow.tab.add` | Flow bar | "+ Add flow" (draft) | `story TBD` |
| `wms-flow.primary` | Flow tab badge | "Primary" (draft) | `story TBD` |
| `wms-flow.copy-from` | Add-flow dialog | "Copy from \<flow\>" (draft) | `story TBD` |
| `wms-003.enforce-sequence` | Routing toggle | "Steps must be done in order" (draft) | US-FND-WMS-003 |
| `wms-003.params.title` | Step section | "Parameters" (draft) | `story TBD` |
| `wms-003.params.columns` | Parameter table | "Parameter" · "Target" · "Min" · "Max" · "Unit" · "Critical" (draft) | `story TBD` |
| `wms-003.params.error.range` | Save blocked | "Min must not be above target, and target not above max." (draft) | `story TBD` |

### EBR step detail — instructions, checks, yield, hold time, dispensing tolerance (PO decision, 2026-10-01)

Record: [decision](../../../LOGS/decisions/2026-10-01-work-master-ebr-step-detail.md). Spec:
[F-08 §9.2.5–§9.2.7, §9.4](../DOCS-EN/08-work-master.md#925-operation_instruction--ordered-sub-steps-of-a-step-po-2026-10-01-ebr).

Screen text added 2026-10-01. No new `SCR` ID: everything sits on the existing Routing tab (`SCR-FND-WMS-003`)
and BOM tab (`SCR-FND-WMS-002`).

- **Routing tab, under each step** (beside the Parameters section, same pattern):
  - **Instructions:** a numbered list, drag to re-order, one text per row, a "Must be confirmed" checkbox per row.
    Adding, removing or re-ordering is a structural edit (new version on a released routing); editing the text or
    the checkbox is a standard edit.
  - **Checks:** a table, one row per check. Type decides the fields: *Number* shows target / min / max / unit;
    *Pass / fail* and *Note* hide them. "How often" shows the interval fields only for "Every …". Adding or removing
    a row is structural; changing a value is standard.
  - **Yield range and hold time:** two fields in the step's standards, next to planned shrinkage. The yield field
    shows the expected yield at standard as a hint; a range that does not contain it gives a warning on save, never
    a block (F-08 §9.2.7).
- **BOM tab, line editor** (first-level consumed lines only): a "Dispensing tolerance" field — type ± % or ±
  quantity, then the value. Hidden on a produced line and on a line of a `consumable` product. The tree node shows
  the tolerance after the quantity when set.

| Key | Where / state | Text | Stories |
|---|---|---|---|
| `wms-003.instr.title` | Step section | "Instructions" (draft) | US-FND-WMS-003 |
| `wms-003.instr.empty` | Step section, no rows | "No instructions for this step." (draft) | US-FND-WMS-003 |
| `wms-003.instr.add` | Button | "Add instruction" (draft) | US-FND-WMS-003 |
| `wms-003.instr.confirm` | Checkbox per row | "Must be confirmed" (draft) | US-FND-WMS-003 |
| `wms-003.instr.error.empty` | Save blocked, row without text | "Write the instruction, or remove the row." (draft) | US-FND-WMS-003 |
| `wms-003.checks.title` | Step section | "Checks" (draft) | US-FND-WMS-003 |
| `wms-003.checks.empty` | Step section, no rows | "No checks for this step." (draft) | US-FND-WMS-003 |
| `wms-003.checks.add` | Button | "Add check" (draft) | US-FND-WMS-003 |
| `wms-003.checks.columns` | Check table | "Check" · "Type" · "Target" · "Min" · "Max" · "Unit" · "Samples" · "How often" · "Critical" (draft) | US-FND-WMS-003 |
| `wms-003.checks.type.options` | Type picker (`numeric` / `pass_fail` / `text`) | "Number" · "Pass / fail" · "Note" (draft) | US-FND-WMS-003 |
| `wms-003.checks.frequency.options` | How-often picker (`once` / `start_middle_end` / `interval`) | "Once per run" · "Start, middle and end" · "Every \<n\> \<time unit\>" (draft) | US-FND-WMS-003 |
| `wms-003.checks.error.no-limit` | Save blocked, number check with neither min nor max | "A number check needs a min, a max, or both." (draft) | US-FND-WMS-003 |
| `wms-003.checks.error.range` | Save blocked, min > target or target > max | "Min must not be above target, and target not above max." (draft) | US-FND-WMS-003 |
| `wms-003.checks.error.unit` | Save blocked, number check without unit | "Pick a unit for this check." (draft) | US-FND-WMS-003 |
| `wms-003.checks.error.interval` | Save blocked, "Every …" without value > 0 or time unit | "Enter how often, more than 0, with its time unit." (draft) | US-FND-WMS-003 |
| `wms-003.checks.error.critical-note` | Save blocked, critical on a Note check | "A note can't be critical." (draft) | US-FND-WMS-003 |
| `wms-003.checks.error.duplicate` | Save blocked, name already used in the step | "\<check name\> is already a check on this step." (draft) | US-FND-WMS-003 |
| `wms-003.yield.label` | Step standard | "Yield range (%)" · "Min" · "Max" (draft) | US-FND-WMS-003 |
| `wms-003.yield.hint` | Under the yield field | "Expected at standard: \<expected\>%" (draft) | US-FND-WMS-003 |
| `wms-003.yield.warn` | Save warning, range does not contain the expected yield (F-08 §9.2.7) | "Expected yield \<expected\>% is outside \<min\>–\<max\>%" | US-FND-WMS-003 |
| `wms-003.yield.error.range` | Save blocked, min above max or below 0 | "Min yield must be 0 or more and not above max." (draft) | US-FND-WMS-003 |
| `wms-003.hold.label` | Step standard, value + time unit | "Max hold time" (draft) | US-FND-WMS-003 |
| `wms-003.hold.hint` | Under the hold field | "Longest wait from the end of this step to the start of the next." (draft) | US-FND-WMS-003 |
| `wms-003.hold.error` | Save blocked, value not > 0 or no time unit | "Hold time must be more than 0, with a time unit." (draft) | US-FND-WMS-003 |
| `wms-002.line.tolerance` | Line editor field | "Dispensing tolerance" · "± %" · "± quantity" (draft) | US-FND-WMS-002 |
| `wms-002.line.tolerance.summary` | BOM tree node, after the quantity | "± \<value\>%" / "± \<value\> \<unit\>" (draft) | US-FND-WMS-002 |
| `wms-002.error.tolerance-value` | Save blocked, type set without value | "Enter the tolerance, or clear the type." (draft) | US-FND-WMS-002 |
| `wms-002.error.tolerance-percent` | Save blocked, % not > 0 or not < 100 | "Tolerance must be more than 0% and less than 100%." (draft) | US-FND-WMS-002 |
| `wms-002.error.tolerance-absolute` | Save blocked, quantity not > 0 | "Tolerance must be more than 0." (draft) | US-FND-WMS-002 |

### Routing tab — versions, steps and product codes (PO decision, 2026-09-30, issue #58)

Record: [decision](../../../LOGS/decisions/2026-09-30-work-master-wave-1.md). The editor behavior in Screens below still applies; these are additions.

- **Version bar** at the top of the tab: "Version \<n\>" + status badge (Draft / Released / Retired) + "Primary"
  toggle per work center. A released version is read-only: a structural edit (add / remove a step, change a
  station or class) asks "Start version \<n+1\> as a draft?" and opens the copy. "Release" on a draft makes it
  usable by work orders and retires the previous released version from the release date. **One draft at a time**
  (F-08 versions and status, PO 2026-10-02, prd-molcadx#24 item 19): while a draft exists, "Start version \<n+1\> as a
  draft?" is refused with `wms-003.error.draft-exists` (routing) or `wms-002.error.draft-exists` (BOM).
- **Standard edits stay in the version** (cycle time, speed, setup time, shrinkage, a station override): the
  field's validity-range prompt as today. A **back-dated** standard edit shows the warning
  "This changes KPIs of \<n\> past shifts" before save.
- **Each step:** step name, step type (free text; suggests types already used in the tenant), station **or** machine class,
  cycle time or throughput, setup time with its unit, shrinkage, "Used by this product".
- **Machine class step:** choosing a class lists the work center's stations of that class, each with an optional
  cycle-time override (empty = the class default).
- **Parallel steps:** each step has "Waits for" (multi-select of other steps). All empty = a straight line in step
  order. A loop is refused on save.
- **Product codes** (`SCR-FND-WMS-007`, part B) — a section inside the Routing tab, **grouped by work unit**: for
  each station, the raw codes its PLC sends for this product (`ASSET_PRODUCT_CODES`, owned by F-04), with start and
  end **date and time**. Flags: "Code with no step at this work unit" and "Step with no code". A list
  "Seen but not mapped" shows codes the machines sent that match no product (fed from the platform's unassigned
  table); mapping one later re-attributes the past rows, and PRODUCTION recalculates the affected shifts (see
  "Mapping into the past" below).

**BOM tree additions:** each first-level line shows its entry step ("enters at: Mix") and, for a produced line,
"Produced at \<step\>" with a "Primary output" mark.

| Key | Where / state | Text | Stories |
|---|---|---|---|
| `wms-003.version.label` | Version bar | "Version \<n\>" (draft) | US-FND-WMS-003 |
| `wms-003.version.status` | Version badge | "Draft" / "Released" / "Retired" (draft) | US-FND-WMS-003 |
| `wms-003.version.primary` | Toggle | "Primary routing at \<work center\>" (draft) | US-FND-WMS-003 |
| `wms-003.version.new-draft` | Structural edit on a released version | "Start version \<n+1\> as a draft?" (draft) | US-FND-WMS-003 |
| `wms-003.version.release` | Button on a draft | "Release" (draft) | US-FND-WMS-003 |
| `wms-003.warn.backdated` | Save of a back-dated standard | "This changes KPIs of \<n\> past shifts." (draft) | US-FND-WMS-003 |
| `wms-003.step.type` | Step field, free text with suggestions of step types already used in the tenant | "Step type" · placeholder "e.g. Mixing, Quality check" (draft) | US-FND-WMS-003 |
| `wms-003.step.class` | Step field | "Machine class" (draft) | US-FND-WMS-003 |
| `wms-003.step.override` | Station row under a class step | "Cycle time on \<station\> (empty = default)" (draft) | US-FND-WMS-003 |
| `wms-003.step.waits-for` | Step field | "Waits for" (draft) | US-FND-WMS-003 |
| `wms-003.error.loop` | Save blocked | "These steps wait for each other in a loop: \<steps\>." (draft) | US-FND-WMS-003 |
| `wms-003.error.draft-exists` | New draft refused, flow already has a draft routing (PO 2026-10-02, prd-molcadx#24 item 19) | "Version \<n\> is already a draft. Release it before starting another version." (draft) | US-FND-WMS-003 |
| `wms-002.error.draft-exists` | New draft refused, flow already has a draft BOM (PO 2026-10-02, prd-molcadx#24 item 19) | "BOM version \<n\> is already a draft. Release it before starting another version." (draft) | US-FND-WMS-002 |
| `wms-007.title` | Product codes section | "Product codes" (draft) | US-FND-WMS-006 |
| `wms-007.flag.no-step` | Code row | "Code with no step at this work unit" (draft) | US-FND-WMS-006 |
| `wms-007.flag.no-code` | Step row | "Step with no code" (draft) | US-FND-WMS-006 |
| `wms-007.unmapped.title` | List | "Seen but not mapped" (draft) | US-FND-WMS-006 |
| `wms-002.line.enters-at` | BOM tree node | "Enters at: \<step\>" (draft) | US-FND-WMS-002 |
| `wms-002.line.produced-at` | BOM tree node, produced line | "Produced at \<step\>" · "Primary output" (draft) | US-FND-WMS-002 |

### Product codes section — full screen spec (`SCR-FND-WMS-007`, 2026-10-01)

Fills in the outline above. Data: [F-04 §9.7 `ASSET_PRODUCT_CODES`](../DOCS-EN/04-asset-ontology.md#97-asset_tags--per-asset-tag--signal-declaration),
owned by Equipment Taxonomy. Purpose: tell the platform which raw code a machine's `product_code` tag sends when
**this product** runs, so Performance can pick the right standard when no job is dispatched
([F-07.1 segment boundaries](../DOCS-EN/07-1-kpi-tag-mapping.md#more-than-one-sku-in-the-same-period)).

**Layout.** A section "Product codes" at the bottom of the Routing tab, below the steps of the routing shown.

- **One group per work unit** used by the shown routing's steps: a step's own work unit, or every station listed
  under a machine-class step. Group header: work unit name and code.
- **Inside a group, one block per `product_code` tag** on the machines placed on that work unit (primary and
  secondary; on a multi-lane machine only the tag whose `ASSET_TAGS.work_unit_id` is this work unit). Block header:
  "\<asset tag\> · \<tag name\>". Codes belong to a tag, so a work unit with two code tags shows two blocks.
- **A work unit with no `product_code` tag** shows one line instead of a block, with a link to the Tags page
  (`SCR-FND-DSR-002`). Such a work unit is identified by the dispatched job, so it is never flagged.
- **Rows** in a block: raw value · from · to · status. Times are shown in the **site's timezone**, with the zone.
  Status: *Active* (from ≤ now, no to or to in the future), *Scheduled* (from in the future), *Ended* (to in the past).
  Ended rows are hidden until "Show ended codes" is on.
- **Actions:** "Add code" per block opens a dialog — raw value, from (date + time, default now), to (optional).
  Per active or scheduled row: "End" (asks for the end time, default now). There is no edit in place: a change of
  product or raw value is an end plus a new row (F-04 §9.7 — a row is never overwritten). A row whose from is still
  in the future can be deleted outright, since it never applied.
- **Reason required on End and Delete** (PO, 2026-10-02, prd-molcadx#24 item 10). Both prompts have a required
  reason field (`wms-007.field.reason`); it is written to `AUDIT_LOG` (F-14 rule 5). Add has no reason field.
- **Raw value** is kept exactly as typed: `12` and `012` are two different codes (F-04: no format assumed).
- **Several codes per product:** a block may hold several active rows for this product (`12` and `112` on
  `PCK01`). Codes are per machine, so each block is independent. The overlap check is per machine, across all its
  `product_code` tags (F-04 §9.7, PO 2026-10-01).

**Flags** (shown on the group or row they concern). **Both flags read the product's primary flow only** — its
released routings (PO, 2026-10-02, prd-molcadx#24 item 9; see UX-WMS-5). A step of another flow never raises or
clears a flag.

- **"Code with no step at this work unit"** — an active code maps this product on a work unit where none of the
  primary flow's **released** routings has a step (directly or as a station of a class step) on that date. Performance
  for that segment is excluded and the total flagged partial (F-07.1), so the flag says why.
- **"Step with no code"** — a step of a released routing of the primary flow sits on a work unit that **has** a `product_code` tag, but
  that tag has no active code for this product. A PLC-only run of this product there cannot be identified. Not shown
  for a work unit with no `product_code` tag.

**"Seen but not mapped"** — under each work unit group, the raw values its `product_code` tags reported that matched
no active code at the time they were read (for any product). Columns: raw value · tag · first seen · last seen.
Action per row: "Map to this product", which opens "Add code" with the raw value and tag filled in and **from =
first seen**. Where these readings are stored and how long they are kept: UX-WMS-4.

**Mapping into the past.** A code whose from is in the past (typed, or taken from "Seen but not mapped"), **or an End
time in the past** (PO, 2026-10-02, prd-molcadx#24 item 6), re-attributes that period's readings — the same rule as a
back-dated standard. Before save it shows `wms-007.warn.backdated`. **The count** (PO, 2026-10-02, prd-molcadx#24
item 5) is the number of the site's **closed** shift instances that overlap the changed period, worded "up to \<n\>
shifts" — Master Data holds no readings, so it cannot tell which of those shifts really read this code. After save the
change is written to `AUDIT_LOG` (F-14) and Master Data emits `product_code_mapping_changed` (work unit, code, old and
new period). **PRODUCTION recalculates** the affected KPIs; Master Data does not (F-04 §9.7).

**Rules on save** (F-04 §9.7, A-6b): on one machine, one raw value means one product at a time — an overlap is
refused, naming the other product. To after from. Raw value and from required. Only tags with role `product_code`.

| State | What the user sees |
|---|---|
| Default | Groups, blocks and rows as above |
| Empty block | "No product codes yet for this work unit" (existing) and "Add code" |
| No code tag | `wms-007.no-tag` with a link to the Tags page |
| Loading | Placeholder rows, no text |
| Save blocked | Dialog stays open with the input kept, plus the error |
| Past mapping | `wms-007.warn.backdated` before save — also on End with a past end time |
| Offline | Not editable; the last loaded codes stay readable |
| No permission | Read-only: no "Add code", "End", "Delete" or "Map to this product" (PO, 2026-10-02, prd-molcadx#24 item 8). Editing needs `foundation:ast:work_unit:update` (F-00.1), **checked at site scope for now** — on the work unit's site; work-unit scope comes later (PO, 2026-10-02, prd-molcadx#24 item 7) |
| No entitlement | Hidden with the Routing tab (tenant without Production) |

| Key | Where / state | Text | Stories |
|---|---|---|---|
| `wms-007.block.header` | Block header | "\<asset tag\> · \<tag name\>" (draft) | US-FND-WMS-006 |
| `wms-007.columns` | Code rows | "Code" · "From" · "To" · "Status" (draft) | US-FND-WMS-006 |
| `wms-007.status` | Row status | "Active" · "Scheduled" · "Ended" (draft) | US-FND-WMS-006 |
| `wms-007.show-ended` | Toggle | "Show ended codes" (draft) | US-FND-WMS-006 |
| `wms-007.add` | Button per block | "Add code" (draft) | US-FND-WMS-006 |
| `wms-007.dialog.title` | Add dialog | "Add product code for \<product code\>" (draft) | US-FND-WMS-006 |
| `wms-007.field.raw` | Dialog field | "Code sent by the machine" · hint "Exactly as the PLC sends it. 12 and 012 are different codes." (draft) | US-FND-WMS-006 |
| `wms-007.field.from` · `.to` | Dialog fields | "From" · "To (optional)" (draft) | US-FND-WMS-006 |
| `wms-007.end` | Row action and its prompt | "End" · "End this code at" (draft) | US-FND-WMS-006 |
| `wms-007.delete-scheduled` | Row action, from still in the future | "Delete" (draft) | US-FND-WMS-006 |
| `wms-007.no-tag` | Work unit with no `product_code` tag | "No product code tag on this work unit — the job decides the product here. Declare a tag" (draft) | US-FND-WMS-006 |
| `wms-007.unmapped.columns` | "Seen but not mapped" list | "Code" · "Tag" · "First seen" · "Last seen" (draft) | US-FND-WMS-006 |
| `wms-007.unmapped.map` | Row action | "Map to this product" (draft) | US-FND-WMS-006 |
| `wms-007.warn.backdated` | Save of a code with from in the past, or an End time in the past (PO 2026-10-02, prd-molcadx#24 items 5–6) | "This changes KPIs of up to \<n\> past shifts." (draft) | US-FND-WMS-006 |
| `wms-007.field.reason` | Required field in the End and Delete prompts (PO 2026-10-02, prd-molcadx#24 item 10) | "Reason" · placeholder "Why is this code ending or being removed?" (draft) | US-FND-WMS-006 |
| `wms-007.error.reason` | End or Delete blocked, no reason | "Enter a reason." (draft) | US-FND-WMS-006 |
| `wms-007.error.overlap` | Save blocked, A-6b | "Code \<code\> on \<asset tag\> already means \<other product\> from \<from\>. End it there first." (draft) | US-FND-WMS-006 |
| `wms-007.error.required` | Save blocked | "Enter the code and the start time." (draft) | US-FND-WMS-006 |
| `wms-007.error.order` | Save blocked, to not after from | "The end must be after the start." (draft) | US-FND-WMS-006 |

## Screens

| SCR ID | Screen | Purpose | Entities (§9) | States worth noting | Stories |
|---|---|---|---|---|---|
| ~~`SCR-FND-WMS-001`~~ | ~~Items & UOM~~ **Retired 2026-09-28 (PO, [2026-09-28 decision](../../../LOGS/decisions/2026-09-28-work-master-per-domain-operation-uom.md)).** Products and their units are managed on the Product screens `SCR-FND-PRO-*`. ID not reused | — | — | — | `US-FND-WMS-001` (closed) |
| `SCR-FND-WMS-002` | BOM tab (on Product detail) | **BOM tab of `SCR-FND-PRO-001`** (2026-09-30; was a list page). Versioned BOM with a scrap factor per line (`scrap_factor`, F-08); closing a version is explicit. **Phantom** checkbox on the BOM version (`is_phantom`, 2026-09-30), shown only for a `semi_finished` product. Shown and edited **as a tree** (section above). **Recipe base quantity** + unit on the BOM version (`base_qty`, `base_uom_id`, 2026-09-30; default 1 in the product's base unit); line quantities are per that base and **net** ([decision](../../../LOGS/decisions/2026-09-30-bom-net-recipe-shrinkage-base-qty.md)) | `BOM` | Default: version list with valid_from/valid_to; released versions read-only | `US-FND-WMS-002` |
| `SCR-FND-WMS-003` | Routing tab (on Product detail) — routing & operation editor | **Routing tab of `SCR-FND-PRO-001`** (2026-09-30; was a list page). **Planned shrinkage** per operation, entered as % and stored as a fraction (`planned_shrinkage`, 2026-09-30) — the same product can have a different value on each work unit. **Steps pre-filled from the work center's flow** (`EQUIPMENT_FLOW`, 2026-09-30): adding the product to a work center lists its work units in flow order; the user sets output unit, cycle time or throughput, and shrinkage per step, and can untick a machine the product skips. Parallel machines appear as alternatives for one step. Each step shows the **derived weight of one unit** (e.g. "1.00 g wet", "0.96 g dry"), read-only. **Flow changed later** → product list badge "Flow changed — review routing"; nothing changes until the user saves a new version ([decision](../../../LOGS/decisions/2026-09-30-line-across-work-centers-reject-weight.md)) Ordered operations per product at a work unit; `standard_cycle_time` **effective-dated** — edits close the old row and open a new one (FLOW-06 implication: validity-range fields + "this closes the current record" confirm). **Cycle time entry (2026-09-28):** three fields — value, time unit (`time_conversion_id`), item unit (`uom_id`); shown as one phrase, e.g. "20 seconds / pack". The item-unit picker offers only the product's base UOM plus units with a conversion path to it on the row's `valid_from` ([F-08 §9.2.1](../DOCS-EN/08-work-master.md#921-item-unit-and-conversion-po-2026-09-28)). Throughput mode ("500 per hour") reads as per item: "500 packs per hour", and is **saved as typed** — stored in the time unit picked (hour), not converted to seconds ([F-08 §9.2](../DOCS-EN/08-work-master.md), PO 2026-09-28) | `ROUTING`, `OPERATION` | Default: version timeline; historical OEE never shifts when standards change (core rule 2.2 of P-02). **Empty picker:** only the base UOM listed, with a link to the product's Conversions tab (`SCR-FND-PRO-003`) to add others. **Error (save blocked, no conversion path):** "Cannot save: there is no unit conversion between \<uom_id unit\> and \<base UOM unit\> for product \<product code\> on \<valid_from\>. Add it on the product's Conversions tab, then save again." | `US-FND-WMS-003` — ⚠ R-01: standard cycle time may not exist on the floor |
| `SCR-FND-WMS-004` | ⚠ Out of FOUNDATION scope, 2026-09-03 — Work order create & release | Create WOs; release locks routing/BOM versions — the lock is **shown**, not implied | `WORK_ORDER`, `WORK_ORDER_OPERATION` (PRODUCTION, [01-planning.md § WORK_ORDER](../../PRODUCTION/DOCS/01-planning.md#work_order--plan-becomes-a-transaction)) | Success: released WO lists its locked versions; Error: release blocked naming what's missing. Release behavior now governed by PRODUCTION's `routing_version_locked`/`bom_version_locked` fields (still `TBD` pending FOUNDATION's B3 version-pin mechanism — see [01-planning.md § Routing/BOM locked at release (B3)](../../PRODUCTION/DOCS/01-planning.md#routingbom-locked-at-release-b3)) | `US-FND-WMS-004` — story ownership needs PO review per rule 1b (PRD-active story citing an entity that moved domains) |
| ~~`SCR-FND-WMS-005`~~ | ~~Defect code taxonomy~~ **Retired 2026-09-23** — defect codes merged into `REJECT_REASON`; edited on `SCR-FND-REF-004` (Reference data sidebar item 4). ID not reused | — | — | — | `US-FND-WMS-005` closed → `US-FND-REF-002` |
| `SCR-FND-WMS-006` | ⚠ Out of FOUNDATION scope, 2026-09-03 — Operation progress | Read-mostly view of `WORK_ORDER_OPERATION` rows per shift — quantities, status; feeds shopfloor and OEE | `WORK_ORDER_OPERATION` (PRODUCTION, [01-planning.md § WORK_ORDER_OPERATION](../../PRODUCTION/DOCS/01-planning.md#work_order_operation--execution-and-output-per-shift)) | Default: carries `shift_instance_id` visibly (every transaction's parent). Grain note: `scrap_qty`/`rework_qty` shown here are now derived (summed from child `WORK_ORDER_OPERATION_DEFECT` rows), not directly entered, once the defect-code split (B2) is active — see job-schedule.md §2.2 | serves `US-PROD-SHF-007`, OEE screens |
| `SCR-FND-WMS-007` | Product codes — section of the Routing tab (2026-09-30, issue #58 part B) | Author raw PLC product codes per work unit for this product; flags; "Seen but not mapped" list | `ASSET_PRODUCT_CODES` (F-04 §9.7, owned there) | Empty: "No product codes yet for this work unit". Unmapped list empty: nothing shown. Timestamps, not dates (F-04 §9.7). Reason required on End and Delete. **Full spec: § Product codes section (2026-10-01)** | `US-FND-WMS-006` |

## State notes

- Version locking is the screen's core job: after release, the routing/BOM editor shows
  "locked by WO-2026-00184" on the locked versions — edits create the *next* version.

## Open questions

| # | Question | Owner |
|---|---|---|
| ~~UX-WMS-1~~ | ~~Where do work orders come from — ERP or MolcaDx (W-1)?~~ **Resolved 2026-09-12** — MolcaDx is the primary path (planner creates manually); `SCR-FND-WMS-004`/PRODUCTION's WO screen is full CRUD, not an import+release screen. ERP stays a possible future connection. See [01-planning.md § Source of WORK_ORDER](../../PRODUCTION/DOCS/01-planning.md#source-of-work_order-w-1b4--resolved-2026-09-12). No longer a FOUNDATION open item; row kept for history | `production-domain` |
| ~~UX-WMS-3~~ | ~~`SCR-FND-WMS-001` (Items & UOM) duplicates the Product screens — retire it?~~ **Resolved 2026-09-28 (PO): retired** (see Screens; [2026-09-28 decision](../../../LOGS/decisions/2026-09-28-work-master-per-domain-operation-uom.md)) | — |
| ~~UX-WMS-2~~ | ~~**New 2026-09-28 — conflict, not resolved silently.** The Work Master sidebar mirrors KPI K-9 (item **hidden** for a domain the tenant isn't entitled to), but the 2026-09-12 license-gate note says the Production Work Master screens are **visible but locked** for a tenant without Production (an upsell surface). With the sidebar item hidden, where does that locked surface appear — only on a Module launcher card (PLT-01 concept 3, Module level = locked), or should the Production item stay visible-but-locked as an exception to K-9?~~ **Resolved 2026-09-28 (PO):** sidebar grouped by domain; an unlicensed domain shows as **one locked group heading** (collapsed, lock icon, opens the upsell surface), its items hidden ([UX 00 § App shell](00-ux.md#app-shell--sidebar-grouped-by-domain-po-decision-2026-09-28)). The locked heading is the upsell surface; no per-item lock | — |
| UX-WMS-4 | **New 2026-10-01.** "Seen but not mapped" needs a record of raw codes read with no active mapping (raw value, tag, first seen, last seen). No entity holds it yet. Who owns it — FOUNDATION next to `ASSET_PRODUCT_CODES`, or PRODUCTION, which reads the PLC values — and how long is it kept? Whichever owns it, the table needs its own PK and a declared unique key, per the [F-00 keys rule](../DOCS-EN/00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01) | PO → `foundation-domain` / `production-domain` |
| UX-WMS-5 | **New 2026-10-01.** Codes are per product, not per flow. When a product has two flows with routings at the same work center, which routing's step does a code resolve to for Performance — the primary flow's, or the primary routing's (`is_primary`)? **Partly answered (PO, 2026-10-02, prd-molcadx#24 item 9):** the two flags on `SCR-FND-WMS-007` read the primary flow only. Still open: which step Performance resolves a code to | PO → `foundation-domain` |
