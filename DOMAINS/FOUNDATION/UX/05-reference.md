# UX 05 — Reference & master data screens

> Mirrors [F-05 reference master data](../DOCS-EN/05-reference-master-data.md) ·
> Status: 🟡 DRAFT.

**Coverage:** `UNIT_OF_MEASUREMENTS`, `MEASUREMENT_GROUP`, `TIME_CONVERSIONS`,
`DOWNTIME_REASON`, `REJECT_REASON` — rule D-1.
**Also, since 2026-09-23 (PO decision):** the four location class lists (`SITE_CLASS`,
`AREA_CLASS`, `WORK_CENTER_CLASS`, `WORK_UNIT_CLASS`, F-01 §9.7–§9.10) and the asset
taxonomy (`ASSET_CLASS`, `ASSET_TYPE`, F-04 §9.2–§9.3) are managed here, each as its own
screen. The entities stay owned by their specs; only the screens live in Reference. (`04-asset.md`'s "screens live there per
story ownership" note is retired — no such screens were ever written there; both reason
taxonomies get their own screens here instead, alongside the other two, since all four
are F-05 entities with no asset-specific behavior of their own.)

**Each taxonomy is its own nav entry and its own screen (PO decision, 2026-09-02) —
supersedes the 2026-08-28 "consolidated screen with a section switcher" note.** All four
are small, flat, and independently referenced by other modules; grouping them under one
nav entry cost more discoverability (an incomplete site or a missing conversion factor
was one extra click away from being found) than the shared switcher saved. Same footing
as Equipment/Asset Placement/Products in the nav — not a catch-all screen.

## Reference data sidebar (PO decision, 2026-09-23)

> **Not here: data sources** (PO, 2026-09-25). They carry connection secrets and a live status, so they have their
> own sidebar group, **Connections** ([UX 13](13-data-source.md)).

All flat **pick-lists** — lists other screens choose a value from — live under one **Reference data**
group in the sidebar, in this order:

| # | Sidebar item | Screen | Entity | Spec |
|---|---|---|---|---|
| 1 | Units of measure | `SCR-FND-REF-001` | `UNIT_OF_MEASUREMENTS`, `MEASUREMENT_GROUP` | F-05 |
| 2 | Time conversions | `SCR-FND-REF-002` | `TIME_CONVERSIONS` | F-05 |
| 3 | Downtime reasons | `SCR-FND-REF-003` | `DOWNTIME_REASON` | F-05 |
| 4 | Reject reasons | `SCR-FND-REF-004` | `REJECT_REASON` | F-05 |
| 5 | Site classes | `SCR-FND-REF-005` | `SITE_CLASS` | F-01 |
| 6 | Area classes | `SCR-FND-REF-006` | `AREA_CLASS` | F-01 |
| 7 | Work center classes | `SCR-FND-REF-007` | `WORK_CENTER_CLASS` | F-01 |
| 8 | Work unit classes | `SCR-FND-REF-008` | `WORK_UNIT_CLASS` | F-01 |
| 9 | Asset classes | `SCR-FND-REF-009` | `ASSET_CLASS` | F-04 |
| 10 | Asset types | `SCR-FND-REF-010` | `ASSET_TYPE` | F-04 |

**Rule — one place to edit.** A list in this group is created and edited **only** on its Reference screen.
Every other screen that uses the list shows the value read-only (a picker, a badge, a column) and, where
it helps, links to the Reference screen. No second editor anywhere.

**What does not belong here** — data that belongs to one specific item stays on that item's screen:
a site's shift hours (`SCR-FND-SIT-002`), a product's conversions (tab of
`SCR-FND-PRO-001`), a product's BOM and routing with its cycle times (`SCR-FND-WMS-002`/`003`), a machine's placement
(`SCR-FND-AST-003`), and **which reasons apply to which machine** (`DOWNTIME_REASON_ASSET` /
`REJECT_REASON_ASSET`, on the machine's asset form, `SCR-FND-AST-007`).

**Defect codes = reject reasons (PO, 2026-09-23).** `QUALITY_DEFECT_CODE` was merged into `REJECT_REASON`
([decision](../../../LOGS/decisions/2026-09-23-defect-code-merged-into-reject-reason.md)), so defect codes are
item 4, **Reject reasons**, and are not license-gated. Whether a reject reason carries a `scrap`/`rework`
disposition is F-05 T-6.

## Screens

| SCR ID            | Screen                  | Purpose                                                                                                                                                          | Entities (§9)                               | States worth noting                                                                                                                                                                                                                                                                                                                                                                             | Stories                                 |
| ----------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `SCR-FND-REF-005` | Site class manager | Maintain the flat `SITE_CLASS` list (code + name) used to group sites across sites for reporting — no nesting, no attributes, one class per node, grouping only ([F-01 §9.7–§9.10](../DOCS-EN/01-site-hierarchy.md#97-site_class--cross-cutting-classification-for-site)). Each row shows how many active sites use it | `SITE_CLASS` | Empty: list starts empty; classes are optional — real values `TBD` (S-5, e.g. "Region: East", "Contract Manufacturer"); Deactivated: no longer offered in the node Class picker, existing nodes keep it in history; deactivating a class still in use `TBD` (foundation-domain) | `US-FND-SIT-004` |
| `SCR-FND-REF-006` | Area class manager | Maintain the flat `AREA_CLASS` list (code + name) used to group areas across sites for reporting — no nesting, no attributes, one class per node, grouping only ([F-01 §9.7–§9.10](../DOCS-EN/01-site-hierarchy.md#97-site_class--cross-cutting-classification-for-site)). Each row shows how many active areas use it | `AREA_CLASS` | Empty: list starts empty; classes are optional — real values `TBD` (S-5, e.g. "Assembly-type", "Warehouse-type"); Deactivated: no longer offered in the node Class picker, existing nodes keep it in history; deactivating a class still in use `TBD` (foundation-domain) | `US-FND-SIT-004` |
| `SCR-FND-REF-007` | Work center class manager | Maintain the flat `WORK_CENTER_CLASS` list (code + name) used to group work centers across sites for reporting — no nesting, no attributes, one class per node, grouping only ([F-01 §9.7–§9.10](../DOCS-EN/01-site-hierarchy.md#97-site_class--cross-cutting-classification-for-site)). Each row shows how many active work centers use it | `WORK_CENTER_CLASS` | Empty: list starts empty; classes are optional — real values `TBD` (S-5, e.g. "Packaging Line", "Utility Line"); Deactivated: no longer offered in the node Class picker, existing nodes keep it in history; deactivating a class still in use `TBD` (foundation-domain) | `US-FND-SIT-004` |
| `SCR-FND-REF-008` | Work unit class manager | Maintain the flat `WORK_UNIT_CLASS` list (code + name) used to group work units across sites for reporting — no nesting, no attributes, one class per node, grouping only ([F-01 §9.7–§9.10](../DOCS-EN/01-site-hierarchy.md#97-site_class--cross-cutting-classification-for-site)). Each row shows how many active work units use it | `WORK_UNIT_CLASS` | Empty: list starts empty; classes are optional — real values `TBD` (S-5, e.g. "Manual Station", "Automated Station"); Deactivated: no longer offered in the node Class picker, existing nodes keep it in history; deactivating a class still in use `TBD` (foundation-domain) | `US-FND-SIT-004` |
| `SCR-FND-REF-009` | Asset class manager | Create/edit the `ASSET_CLASS` taxonomy — classes may nest via `parent_class_id`, organizational only, no attribute values ([F-04 §9.2](../DOCS-EN/04-asset-ontology.md#92-asset_class--top-level-taxonomy)). Moved here from `SCR-FND-AST-007` (PO decision, 2026-09-23). Tree + Table view; each row shows how many assets use it | `ASSET_CLASS` | Error: cannot deactivate a class that still has active types — names them; cannot delete a class with assets — names them; soft hint only for deep nesting (never blocks save) | `US-FND-AST-001` |
| `SCR-FND-REF-010` | Asset type manager | Create/edit `ASSET_TYPE` rows under a class — code, name, manufacturer, model and the shared technical `attributes` (key-value, new keys need no code change) ([F-04 §9.3](../DOCS-EN/04-asset-ontology.md#93-asset_type--modelspec-shared-technical-attributes)). Moved here from `SCR-FND-AST-007` (PO decision, 2026-09-23). Each row shows how many assets use it | `ASSET_TYPE` (reads `ASSET_CLASS`) | Empty: a type with no assets is valid (prepared ahead); Error: duplicate code names the holder | `US-FND-AST-001` |
| `SCR-FND-REF-001` | UOM manager             | Maintain units grouped by `MEASUREMENT_GROUP` — the dimension-vs-scale distinction is visible (kg vs g same group; kg vs pcs never converts generically)         | `UNIT_OF_MEASUREMENTS`, `MEASUREMENT_GROUP` | Error: deleting a group with units rejected, units named; ⚠ T-5 seed list TBD                                                                                                                                                                                                                                                                                                                   | `US-FND-REF-004` (was closed `US-FND-WMS-001`), KR 2.1                |
| `SCR-FND-REF-002` | Time conversion manager | Maintain `TIME_CONVERSIONS` — per T-4 (resolved), each row carries a numeric `seconds_per_unit` factor, backend-computed, never a manually-typed converted value | `TIME_CONVERSIONS`                          | Default: worked example shown per row (F-05 §9.5 pattern); **Declare via quantity + a fixed base unit (second/minute/hour/day), never a raw seconds figure** (resolved 2026-09-02) — "30" + "minutes" computes `1800`, shown alongside the friendly form in the list; re-editing a row re-derives quantity/unit from the stored factor by picking the largest whole unit that divides it evenly | KR 2.1, `story TBD — PRD-002 candidate` |
| `SCR-FND-REF-003` | Downtime reason manager | Maintain the `DOWNTIME_REASON` taxonomy (`unplanned`/`planned`/`small_stop`)                                                                                     | `DOWNTIME_REASON`                           | Empty: catalog starts empty by design — seeding is part of provisioning; Downtime reasons are **one flat table** ordered by `downtime_category`, with a category select above it (moved from retired `SCR-FND-AST-004`); Empty (filtered): "no matches for this category", distinct from the no-rows empty state | `story TBD`                             |
| `SCR-FND-REF-004` | Reject reason manager   | Maintain the `REJECT_REASON` taxonomy — deliberately no category field, a separate entity from `DOWNTIME_REASON` — **also the defect code list** since `QUALITY_DEFECT_CODE` merged in (2026-09-23); disposition lives on the reject/actual (F-05 T-6 closed 2026-09-24) — not on this master | `REJECT_REASON`                             | Empty: catalog starts empty by design — seeding is part of provisioning                                                                                                                                                                                                                                                                                                                         | `story TBD`                             |

## Screen text

Rules T-1 to T-4 in [00-ux.md](00-ux.md#screen-text--this-folder-is-the-source-po-decision-2026-09-25).
Text is copied word for word from PRD-003 (`05-reference-master-data.md`, `01-site-hierarchy.md`
`US-FND-SIT-004`, `04-equipment-taxonomy.md` `US-FND-AST-001`) and from the Screens table above.
`N/A — no text` means the PRD describes that state as visual only (a placeholder, a row that appears);
there is no message to write. Where the PRD describes a message but gives no exact words, the row is
`TBD — PO` and the Where column says what the message must convey.

### Reference data sidebar — shared text

| Key | Where / state | Text | Stories |
|---|---|---|---|
| `ref-sidebar.group` | Sidebar group label | "Reference data" | all below |
| `ref-sidebar.item.units` | Sidebar item 1 → `SCR-FND-REF-001` | "Units of measure" | US-FND-REF-004 |
| `ref-sidebar.item.time-conversions` | Sidebar item 2 → `SCR-FND-REF-002` | "Time conversions" | US-FND-REF-005 |
| `ref-sidebar.item.downtime-reasons` | Sidebar item 3 → `SCR-FND-REF-003` | "Downtime reasons" | US-FND-REF-001 |
| `ref-sidebar.item.reject-reasons` | Sidebar item 4 → `SCR-FND-REF-004` | "Reject reasons" | US-FND-REF-002 |
| `ref-sidebar.item.site-classes` | Sidebar item 5 → `SCR-FND-REF-005` | "Site classes" | US-FND-SIT-004 |
| `ref-sidebar.item.area-classes` | Sidebar item 6 → `SCR-FND-REF-006` | "Area classes" | US-FND-SIT-004 |
| `ref-sidebar.item.work-center-classes` | Sidebar item 7 → `SCR-FND-REF-007` | "Work center classes" | US-FND-SIT-004 |
| `ref-sidebar.item.work-unit-classes` | Sidebar item 8 → `SCR-FND-REF-008` | "Work unit classes" | US-FND-SIT-004 |
| `ref-sidebar.item.asset-classes` | Sidebar item 9 → `SCR-FND-REF-009` | "Asset classes" | US-FND-AST-001 |
| `ref-sidebar.item.asset-types` | Sidebar item 10 → `SCR-FND-REF-010` | "Asset types" | US-FND-AST-001 |

### SCR-FND-REF-001 — UOM manager

| Key                                | Where / state                                                                                          | Text                                                                                                                         | Stories                        |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `ref-001.title`                    | Page title                                                                                             | TBD — PO (see UX-REF-2)                                                                                                      | US-FND-REF-004                 |
| `ref-001.summary`                  | Per measurement group: active units, and units used as a product's base unit                           | TBD — PO                                                                                                                     | US-FND-REF-004                 |
| `ref-001.group-heading`            | Section heading per measurement group                                                                  | "\<measurement group name\>" (e.g. "Mass", "Count" — data, not copy)                                                           | US-FND-REF-004                 |
| `ref-001.table.columns`            | Unit row columns: code, name, symbol, group                                                            | TBD — PO (PRD names the columns, gives no labels)                                                                            | US-FND-REF-004                 |
| `ref-001.action.add-unit`          | Button to add a unit                                                                                   | TBD — PO                                                                                                                     | US-FND-REF-004                 |
| `ref-001.action.add-group`         | Button to create a measurement group — only on the `foundation-domain` review path                     | TBD — PO                                                                                                                     | US-FND-REF-004                 |
| `ref-001.link.product-conversions` | Link to the per-product conversion screen, with a short note on why conversions are per product (AC-4) | TBD — PO                                                                                                                     | US-FND-REF-004                 |
| `ref-001.form.fields`              | Unit form labels: code, name, symbol, measurement group                                                | TBD — PO                                                                                                                     | US-FND-REF-004                 |
| `ref-001.form.save`                | Form button                                                                                            | "Save"                                                                                                                       | US-FND-REF-004                 |
| `ref-001.default`                  | Default state                                                                                          | N/A — no text: units grouped by measurement group (rows above)                                                               | US-FND-REF-004                 |
| `ref-001.empty`                    | Empty state                                                                                            | "No units yet"                                                                                                               | US-FND-REF-004                 |
| `ref-001.empty.consequence`        | Empty state, consequence line — must say products cannot be saved, because the base unit is mandatory  | TBD — PO                                                                                                                     | US-FND-REF-004                 |
| `ref-001.loading`                  | Loading state                                                                                          | N/A — no text: "A table placeholder"                                                                                         | US-FND-REF-004                 |
| `ref-001.error.save`               | Save error — form keeps everything typed; PRD: "a message that the save failed" (see UX-REF-3)         | TBD — PO                                                                                                                     | US-FND-REF-004                 |
| `ref-001.offline`                  | Offline state — PRD: "Not available" (see UX-REF-3)                                                    | TBD — PO                                                                                                                     | US-FND-REF-004                 |
| `ref-001.success`                  | Success — new row at the top of its group, "marked new"; the marker label is not given                 | TBD — PO                                                                                                                     | US-FND-REF-004                 |
| `ref-001.no-permission`            | No permission (PRD: as in US-FND-REF-001)                                                              | "Only subjects whose IDP-asserted scope claim covers the tenant can change reference master data. Contact your plant admin." | US-FND-REF-004, US-FND-REF-001 |
| `ref-001.error.duplicate-code`     | Save, code already used — message under the code field naming the unit (or group) already using it     | TBD — PO                                                                                                                     | US-FND-REF-004                 |
| `ref-001.error.symbol-required`    | Save, symbol empty — under the symbol field                                                            | "Unit symbol is required"                                                                                                    | US-FND-REF-004                 |
| `ref-001.error.group-required`     | Save, measurement group empty                                                                          | "Measurement group is required"                                                                                              | US-FND-REF-004                 |
| `ref-001.error.group-has-units`    | Delete a measurement group that still has units — refused, names the units                             | TBD — PO                                                                                                                     | US-FND-REF-004                 |

### SCR-FND-REF-002 — Time conversion manager

| Key | Where / state | Text | Stories |
|---|---|---|---|
| `ref-002.title` | Page title | TBD — PO (see UX-REF-2) | US-FND-REF-005 |
| ~~`ref-002.summary.one-second-row`~~ | ~~Shows whether a row worth exactly 1 second exists~~ **Retired 2026-09-28 (PO, [2026-09-28 decision](../../../LOGS/decisions/2026-09-28-work-master-per-domain-operation-uom.md))** — throughput entry is saved in the unit the user picked, so no 1-second row is needed. Key not reused | — | — |
| `ref-002.table.columns` | Columns: code, name, friendly form, stored seconds, usage count (operations; product cycle times dropped — `PRODUCT_CYCLE` retired 2026-09-28) | TBD — PO (PRD names the columns, gives no labels) | US-FND-REF-005 |
| `ref-002.friendly-form` | Table cell; also how the Edit dialog reopens a row | "\<quantity\> \<base unit\>" — e.g. "30 minutes", "3 hours", "90 seconds", "1 day" | US-FND-REF-005 |
| `ref-002.seconds` | Table cell, stored seconds | "\<seconds\> s" — e.g. "1,800 s" | US-FND-REF-005 |
| `ref-002.action.add` | Main button | "Add time conversion" | US-FND-REF-005 |
| `ref-002.dialog.fields` | Add / Edit dialog labels: code, name, quantity, base unit | TBD — PO | US-FND-REF-005 |
| `ref-002.dialog.base-unit.options` | Base unit picker options (fixed: second / minute / hour / day) | TBD — PO (PRD lists the four, gives no labels) | US-FND-REF-005 |
| `ref-002.dialog.preview` | Live read-only preview under the inputs | "= \<seconds\> seconds" — e.g. "= 1,800 seconds" | US-FND-REF-005 |
| `ref-002.dialog.save` | Dialog button | "Save" | US-FND-REF-005 |
| `ref-002.default` | Default state | N/A — no text: table (rows above) | US-FND-REF-005 |
| `ref-002.empty` | Empty state | "No time conversions yet" | US-FND-REF-005 |
| `ref-002.empty.consequence` | Empty state, consequence line — must say no operation cycle time can be saved (its time unit is mandatory) and no operation standard can be turned into seconds (product cycle time dropped — `PRODUCT_CYCLE` retired 2026-09-28) | TBD — PO | US-FND-REF-005 |
| `ref-002.loading` | Loading state | N/A — no text: "A table placeholder" | US-FND-REF-005 |
| `ref-002.error.save` | Save error — dialog keeps everything typed | "Could not save. Your entries are not lost. Try saving again." | US-FND-REF-005 |
| `ref-002.offline` | Offline state — PRD: "Not available; master data needs a connection" (see UX-REF-3) | TBD — PO | US-FND-REF-005 |
| `ref-002.success` | Success — new row at the top, "marked new", showing friendly form and seconds; the marker label is not given | TBD — PO | US-FND-REF-005 |
| `ref-002.no-permission` | No permission | "Only subjects whose IDP-asserted scope claim covers the tenant can change time conversions. Contact your plant admin." | US-FND-REF-005 |
| `ref-002.error.quantity` | Save, quantity 0, negative or not whole | "Quantity must be a whole number greater than 0" | US-FND-REF-005 |
| `ref-002.error.duplicate-code` | Save, code already used — message under the field naming the existing row | TBD — PO | US-FND-REF-005 |
| `ref-002.warning.same-seconds` | Two rows worth the same seconds — whether the screen warns at all is still open (PRD open item "unique factor", `foundation-domain`) | TBD — PO | US-FND-REF-005 |

### SCR-FND-REF-003 — Downtime reason manager

| Key | Where / state | Text | Stories |
|---|---|---|---|
| `ref-003.title` | Page title | TBD — PO (see UX-REF-2) | US-FND-REF-001 |
| `ref-003.summary` | Number of active reasons per class | TBD — PO | US-FND-REF-001 |
| `ref-003.filter.class` | Class select above the table, and its options (unplanned, planned, small stop) | TBD — PO (PRD names the three classes, gives no labels) | US-FND-REF-001 |
| `ref-003.table.columns` | Columns: code, name, class | TBD — PO (PRD names the columns, gives no labels) | US-FND-REF-001 |
| `ref-003.action.add` | Main button | "Add reason" | US-FND-REF-001 |
| `ref-003.form.fields` | Form labels: code, name, class | TBD — PO | US-FND-REF-001 |
| `ref-003.form.save` | Form button | "Save" | US-FND-REF-001 |
| `ref-003.default` | Default state | N/A — no text: table (rows above) | US-FND-REF-001 |
| `ref-003.empty` | Empty state | "No downtime reasons yet" | US-FND-REF-001 |
| `ref-003.empty.consequence` | Empty state, consequence line — must say every stop will be recorded unlabelled and counted as unplanned | TBD — PO | US-FND-REF-001 |
| `ref-003.empty.filtered` | Empty after filtering by class (from the Screens table above) | "no matches for this category" | US-FND-REF-001 |
| `ref-003.warning.planned-empty` | No active reason in the planned class (AC-4) — must say planned stops will be recorded as unplanned while that class is empty | TBD — PO | US-FND-REF-001 |
| `ref-003.loading` | Loading state (filters stay usable) | N/A — no text: "A table placeholder" | US-FND-REF-001 |
| `ref-003.error.save` | Save error — form keeps everything typed | "Could not save. Your entries are not lost. Try saving again." | US-FND-REF-001 |
| `ref-003.offline` | Offline state — loaded data stays readable, add button disabled | "A connection is required to change master data" | US-FND-REF-001 |
| `ref-003.success` | Success — new row at the top, "marked new"; the marker label is not given | TBD — PO | US-FND-REF-001 |
| `ref-003.no-permission` | No permission — read only, no edit buttons | "Only subjects whose IDP-asserted scope claim covers the tenant can change reference master data. Contact your plant admin." | US-FND-REF-001 |
| `ref-003.error.duplicate-code` | Save, code already used — message under the code field naming the reason already using it | TBD — PO | US-FND-REF-001 |
| `ref-003.error.class-required` | Save, no class chosen — under the class field | "Reason class is required" | US-FND-REF-001 |
| `ref-003.error.class-change-blocked` | Change the class of a reason past stops use (AC-5) — must say past Availability would change, and the way out: deactivate it and create a new reason | TBD — PO | US-FND-REF-001 |

### SCR-FND-REF-004 — Reject reason manager

| Key | Where / state | Text | Stories |
|---|---|---|---|
| `ref-004.title` | Page title | TBD — PO (see UX-REF-2) | US-FND-REF-002 |
| `ref-004.summary` | Number of active reject reasons | TBD — PO | US-FND-REF-002 |
| `ref-004.search` | Search field | TBD — PO | US-FND-REF-002 |
| `ref-004.table.columns` | Columns: code, name | TBD — PO (PRD names the columns, gives no labels) | US-FND-REF-002 |
| `ref-004.action.add` | Button to add a reject reason | TBD — PO | US-FND-REF-002 |
| `ref-004.form.fields` | Form labels: code, name | TBD — PO | US-FND-REF-002 |
| `ref-004.form.save` | Form button | "Save" | US-FND-REF-002 |
| `ref-004.default` | Default state | N/A — no text: table (rows above) | US-FND-REF-002 |
| `ref-004.empty` | Empty state | "No reject reasons yet" | US-FND-REF-002 |
| `ref-004.empty.consequence` | Empty state, consequence line — must say the reject Pareto will have no breakdown and every reject lands in a single bar | TBD — PO | US-FND-REF-002 |
| `ref-004.loading` | Loading state | N/A — no text: "A table placeholder" | US-FND-REF-002 |
| `ref-004.error.save` | Save error — form keeps everything typed; PRD: "a message that the save failed" (see UX-REF-3) | TBD — PO | US-FND-REF-002 |
| `ref-004.offline` | Offline state — PRD: "Not available, like all master data" (see UX-REF-3) | TBD — PO | US-FND-REF-002 |
| `ref-004.success` | Success — new row at the top, "marked new"; the marker label is not given | TBD — PO | US-FND-REF-002 |
| `ref-004.no-permission` | No permission (PRD: as in US-FND-REF-001) | "Only subjects whose IDP-asserted scope claim covers the tenant can change reference master data. Contact your plant admin." | US-FND-REF-002, US-FND-REF-001 |
| `ref-004.error.duplicate-code` | Save, code already used — message under the field naming the reason already using it | TBD — PO | US-FND-REF-002 |
| `ref-004.error.name-required` | Save, name empty — under the name field | "Reason name is required" | US-FND-REF-002 |

### SCR-FND-REF-001 … 004 — Deactivate a row (shared)

Same text on all four F-05 lists.

| Key | Where / state | Text | Stories |
|---|---|---|---|
| `ref-deactivate.action` | Button on the selected row | "Deactivate" | US-FND-REF-006 |
| `ref-deactivate.impact` | Impact list lines: old records using the row; machines losing this reason's tick; open entries blocking it | TBD — PO | US-FND-REF-006 |
| `ref-deactivate.effective-date` | Effective date field label | TBD — PO | US-FND-REF-006 |
| `ref-deactivate.confirm` | Confirm button | TBD — PO | US-FND-REF-006 |
| `ref-deactivate.default` | Default state | N/A — no text: impact list (rows above) | US-FND-REF-006 |
| `ref-deactivate.empty` | Empty state | N/A — PRD: "not applicable" | US-FND-REF-006 |
| `ref-deactivate.loading` | Loading — impact placeholder, confirm locked; pressing confirm must say the impact is still being worked out (AC-7) | TBD — PO | US-FND-REF-006 |
| `ref-deactivate.error` | Impact could not be computed | "Could not compute impact. Deactivation was not performed." | US-FND-REF-006 |
| `ref-deactivate.offline` | Offline state — PRD: "Not available" (see UX-REF-3) | TBD — PO | US-FND-REF-006 |
| `ref-deactivate.success` | Success — row greyed out, stays in the table | "inactive since \<date\>" | US-FND-REF-006 |
| `ref-deactivate.no-permission` | No permission — no "Deactivate" button, the access needed is explained (PRD: as in US-FND-REF-001) | "Only subjects whose IDP-asserted scope claim covers the tenant can change reference master data. Contact your plant admin." | US-FND-REF-006, US-FND-REF-001 |
| `ref-deactivate.error.blocked` | Refused because something blocks it — names each blocker (e.g. count and some product names; the open stop) | TBD — PO | US-FND-REF-006 |
| `ref-deactivate.error.past-date` | Save, effective date in the past | "The effective date cannot be in the past. Historical data must not change." | US-FND-REF-006 |

### SCR-FND-REF-005 … 008 — Location class lists

One set of text for the four lists. **What changes per level:** the level noun in the page title and
sidebar label — Site (`-005`), Area (`-006`), Work center (`-007`), Work unit (`-008`); see
`ref-sidebar.item.*`. Everything else is the same.

| Key | Where / state | Text | Stories |
|---|---|---|---|
| `ref-class.title` | Page title (level noun changes) — same as its sidebar label, per the 00-ux copy style | "\<Level\> classes" (draft) — "Site classes" · "Area classes" · "Work center classes" · "Work unit classes" | US-FND-SIT-004 |
| `ref-class.subtitle` | Under the title — new key 2026-10-02 | "Group \<levels\> across plants for reports. Classes are optional." (draft) | US-FND-SIT-004 |
| `ref-class.summary` | Number of classes on this level | "\<n\> classes" (draft) | US-FND-SIT-004 |
| `ref-class.table.columns` | Columns: code, name, number of active items using it | "Code" · "Name" · "Used by" (draft); the "Used by" cell reads "\<n\> \<levels\>" (draft), e.g. "4 sites" | US-FND-SIT-004 |
| `ref-class.action.add` | Add action | "Add \<level\> class" (draft) | US-FND-SIT-004 |
| `ref-class.dialog.title` | Add / Edit dialog title — new key 2026-10-02 | "Add \<level\> class" · "Edit \<level\> class" (draft) | US-FND-SIT-004 |
| `ref-class.dialog.fields` | Add / Edit dialog labels: code, name (only these two) | "Code" · "Name" (draft) | US-FND-SIT-004 |
| `ref-class.dialog.save` | Dialog save button | "Save" (draft) | US-FND-SIT-004 |
| `ref-class.action.deactivate` | Deactivate a class (sets its end date) | "Deactivate" (draft) | US-FND-SIT-004 |
| `ref-class.deactivate.confirm` | Deactivate confirmation, body — new key 2026-10-02. Says what the Screens table above says happens | "Deactivate \<class name\>? It will no longer be offered when you pick a class. \<Levels\> that already use it keep it in their history." (draft) | US-FND-SIT-004 |
| `ref-class.deactivate.confirm-button` | Deactivate confirmation, buttons — new key 2026-10-02 | "Deactivate" · "Cancel" (draft) | US-FND-SIT-004 |
| `ref-class.default` | Default state | N/A — no text: list (rows above) | US-FND-SIT-004 |
| `ref-class.empty` | Empty state — empty list plus an Add action; classes are optional | "No \<level\> classes yet." + "Classes are optional. Add one when you want to group \<levels\> in reports." (draft) | US-FND-SIT-004 |
| `ref-class.loading` | Loading state | N/A — no text: "A list placeholder" | US-FND-SIT-004 |
| `ref-class.error.save` | Save error — dialog stays open with everything typed, says the class was not saved | "Couldn't save. Your changes are still here — try again." (draft, 00-ux copy style; UX-REF-3 still open for the other screens) | US-FND-SIT-004 |
| `ref-class.offline` | Offline state — PRD: "Not available (master data needs a connection)" | "You're offline. \<Level\> classes needs a connection to load and save changes." (draft, 00-ux copy style) | US-FND-SIT-004 |
| `ref-class.success` | Success | N/A — no text: the dialog closes and the new class appears in its list | US-FND-SIT-004 |
| `ref-class.no-permission` | No permission — lists readable, not changeable; must explain that tenant access is needed | "You can view these classes but not change them. Changing them needs access for the whole company. Ask your Plant Admin/IT for access." (draft) | US-FND-SIT-004 |
| `ref-class.error.required` | Save, code or name empty — under the empty field | "Code is required" · "Name is required" (draft) | US-FND-SIT-004 |
| `ref-class.error.in-use` | Deactivate a class active items still use — whether this is refused is undecided (`foundation-domain`, UX-REF-4) | TBD — PO | US-FND-SIT-004 |

**Placeholders in the `ref-class.*` rows** (2026-10-02): `<Level>` / `<level>` = "Site", "Area", "Work
center", "Work unit" (capital only at the start of a sentence); `<levels>` / `<Levels>` = its plural ("sites",
"work centers"). All `ref-class.*` drafts above were written 2026-10-02 (PO, 2026-10-02, prd-molcadx#24
item 25) so the four class pages no longer show `[TBD copy: ref-class.*]`. Three keys are new:
`ref-class.subtitle`, `ref-class.dialog.title`, `ref-class.deactivate.confirm` (+ `.confirm-button`). No
duplicate-code key: whether a class code must be unique is still F-01 S-8.

### SCR-FND-REF-009 — Asset class manager

| Key | Where / state | Text | Stories |
|---|---|---|---|
| `ref-009.title` | Page title | TBD — PO (see UX-REF-2) | US-FND-AST-001 |
| `ref-009.summary` | How many classes and how many types are defined | TBD — PO | US-FND-AST-001 |
| `ref-009.view-switch` | Tree / Table view switch | TBD — PO (PRD names a Tree and a Table view, gives no labels) | US-FND-AST-001 |
| `ref-009.table.columns` | Class row: code, name, parent class, number of assets using it | TBD — PO | US-FND-AST-001 |
| `ref-009.action.add` | Add a class | TBD — PO | US-FND-AST-001 |
| `ref-009.form.fields` | Form labels: code, name, parent class | TBD — PO | US-FND-AST-001 |
| `ref-009.default` | Default state | N/A — no text: tree / table (rows above) | US-FND-AST-001 |
| `ref-009.empty` | Empty state | "No asset classes yet" | US-FND-AST-001 |
| `ref-009.empty.note` | Empty state, short note — must say Class → Type → Instance is the modelled shape | TBD — PO | US-FND-AST-001 |
| `ref-009.loading` | Loading state | N/A — no text: "Table skeleton" | US-FND-AST-001 |
| `ref-009.error.save` | Save error — input intact plus a save failure message (see UX-REF-3) | TBD — PO | US-FND-AST-001 |
| `ref-009.offline` | Offline state — PRD: "Unavailable" (see UX-REF-3) | TBD — PO | US-FND-AST-001 |
| `ref-009.success` | Success | N/A — no text: the new node is selected, and the form is ready for the next entry | US-FND-AST-001 |
| `ref-009.no-permission` | No permission — read only | "Only subjects whose IDP-asserted scope claim covers the tenant may change the asset taxonomy." | US-FND-AST-001 |
| `ref-009.error.duplicate-code` | Save, code already used — inline, names the existing holder | TBD — PO | US-FND-AST-001 |
| `ref-009.error.has-active-types` | Deactivate a class that still has active types — refused, names the types | TBD — PO | US-FND-AST-001 |
| `ref-009.error.has-assets` | A class with machines can't be deleted — names them | TBD — PO | US-FND-AST-001 |
| `ref-009.hint.deep-nesting` | Optional soft hint on deep nesting; never blocks save (AC-3: "optional soft UX") | "trees deeper than 3 class levels — consider simplifying" | US-FND-AST-001 |

### SCR-FND-REF-010 — Asset type manager

The state texts of US-FND-AST-001 are one table for both managers; only the rows that apply to types are
copied here.

| Key | Where / state | Text | Stories |
|---|---|---|---|
| `ref-010.title` | Page title | TBD — PO (see UX-REF-2) | US-FND-AST-001 |
| `ref-010.table.columns` | Type row, listed under its class: code, name, manufacturer, model, shared attributes, number of assets using it | TBD — PO | US-FND-AST-001 |
| `ref-010.action.add` | Add a type | TBD — PO | US-FND-AST-001 |
| `ref-010.form.fields` | Form labels: code, name, class, manufacturer, model, attributes (key-value) | TBD — PO | US-FND-AST-001 |
| `ref-010.default` | Default state | N/A — no text: type list (rows above) | US-FND-AST-001 |
| `ref-010.empty` | Empty state — no types yet (the PRD's "No asset classes yet" is the class list's) | TBD — PO | US-FND-AST-001 |
| `ref-010.loading` | Loading state | N/A — no text: "Table skeleton" | US-FND-AST-001 |
| `ref-010.error.save` | Save error — input intact plus a save failure message (see UX-REF-3) | TBD — PO | US-FND-AST-001 |
| `ref-010.offline` | Offline state — PRD: "Unavailable" (see UX-REF-3) | TBD — PO | US-FND-AST-001 |
| `ref-010.success` | Success | N/A — no text: the new node is selected, and the form is ready for the next entry | US-FND-AST-001 |
| `ref-010.no-permission` | No permission — read only | "Only subjects whose IDP-asserted scope claim covers the tenant may change the asset taxonomy." | US-FND-AST-001 |
| `ref-010.error.duplicate-code` | Save, code already used (e.g. `IM250X`) — inline, names the existing holder | TBD — PO | US-FND-AST-001 |


## State notes

- These are reviewed master-data catalogs, not settings enums (2026-08-21
  `MEASUREMENT_GROUP` decision) — each list carries review/approval status per row.

## Open questions

| # | Question | Owner |
|---|---|---|
| UX-REF-1 | Who approves a new UOM row — implementor freely, or a reviewer role? | PO |
| UX-REF-2 | Is each Reference page title the same as its sidebar label (e.g. "Downtime reasons"), or the screen name in the Screens table (e.g. "Downtime reason manager")? The PRD gives neither, so every `ref-*.title` row is `TBD — PO`. | PO |
| UX-REF-3 | Offline and save-error texts exist word for word only on some screens: offline "A connection is required to change master data" (`ref-003`); save error "Could not save. Your entries are not lost. Try saving again." (`ref-002`, `ref-003`). The other Reference screens only describe the same message ("Not available", "a message that the save failed"). Use these texts on every Reference screen? | PO |
| UX-REF-4 | Deactivating a location class that active sites / areas / work centers / work units still use: refuse it (and name them), or allow it with a warning? `ref-class.error.in-use` waits on this (`TBD — perlu konfirmasi PO`) | PO + `foundation-domain` |
