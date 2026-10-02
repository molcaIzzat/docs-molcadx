# UX 01 — Site Hierarchy screens

> Mirrors [F-01 site hierarchy](../DOCS-EN/01-site-hierarchy.md) ·
> behavior: [FLOW-01](../FLOW/01-site-skeleton.md), [FLOW-06](../FLOW/06-change-control.md) ·
> Status: 🟡 DRAFT.

**Coverage:** `TENANT`, `SITE`, `AREA`, `WORK_CENTER`, `WORK_UNIT`, `EQUIPMENT_FLOW`
(F-01 §9) — rule D-1.
**Also declared here (2026-08-26, PO; revised 2026-09-03; `EQUIPMENT_FLOW` added 2026-09-17):** `ENTERPRISE_SHIFT` (F-02)
declaration stays a separate step (see `02-shift.md`'s retirement note — it lives on
`SCR-FND-SIT-002` as an `ENTERPRISE` node panel), while `SITE_SHIFT` (F-02) and
`FISCAL_YEAR` (F-03, **read-only** on `SITE` — no override, per Y-2) fold into
`SCR-FND-SIT-002`'s bottom sections on a `SITE` node — the same tree, not a separate
menu. See "Shift & Fiscal panels" below and the retirement notes in
[`02-shift.md`](02-shift.md) / [`03-fiscal.md`](03-fiscal.md). This is a
**screen-composition decision only** — `ENTERPRISE_SHIFT`/`SITE_SHIFT` stay owned by
[F-02](../DOCS-EN/02-shift.md) and `FISCAL_YEAR` by
[F-03](../DOCS-EN/03-yearly-quarterly-declaration.md); no entity moves.

## Screens

| SCR ID            | Screen                   | Purpose                                                                                                                                                               | Entities (§9)                 | States worth noting                                                                                                                                 | Stories          |
| ----------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| `SCR-FND-SIT-001` | Site tree explorer — **Tree / Diagram / Table view modes** | Navigate and edit the Enterprise→Site→Area→Work Center→Work Unit tree via three user-switchable view modes sharing one node selection and detail pane: **Tree** (indented collapsible list, chevron expand/collapse, connector lines via left borders), **Diagram** (boxes + connectors, expand/collapse per level), and **Table** (flat, type-filterable list — All/Site/Area/Work Center/Work Unit chips — one row per node). Every node's row/box in all three modes carries a "more actions" (⋮) menu with **Edit** (dialog with that node kind's own fields; not shown for Enterprise) and **Add {child kind}** (dialog with the create form; not shown for Work Unit, which has no child entity) — editing is dialog-based, not inline on the canvas or in the pane; business codes free text with the suggested pattern (`JKT1-AS-L01-S03`) as a hint | all 5 | Default: collapsed below Area, focused node highlighted; Empty: "start with Enterprise" seed node; Error: rejection **renders the blocking entity as a link inside the pane** (FLOW-06 implication) | `US-FND-SIT-001` |
| `SCR-FND-SIT-002` | Node detail & deactivate — **+ Shift & Fiscal panels on `SITE`, Line flow on `WORK_CENTER`** | Read-only detail pane (title, code, type badge) for the selected node; **Edit** and deactivate happen in a dialog opened from the node's "more actions" menu, not in the pane — deactivate lives in the Edit dialog's footer (enabled — `valid_from`/`valid_to` confirmed by UX-SIT-3, 2026-09-22); code changes show effective dating. **When the selected node is `SITE`**, the detail pane grows two bottom sections: **Shift** (per-`ENTERPRISE_SHIFT` completion checklist, real start/end time for this site — absorbs former `SCR-FND-SHF-002`) and **Fiscal Year** (this enterprise's declared `FISCAL_YEAR` windows, **fully read-only** — shows which enterprise-wide window currently applies, no override, no `FISCAL_YEAR_SITE_OVERRIDE` entity — absorbs former `SCR-FND-FSC-001`, per Y-2). **When the selected node is `WORK_CENTER`** (2026-09-17), the pane grows a **Line flow** section: `EQUIPMENT_FLOW` rows scoped to that work center only, read as a chain diagram (each declared path drawn `from → to`, a position feeding more than one successor draws as separate paths, unconnected work units listed separately) and edited as a plain `from`/`to` edge table (add/delete); the add dialog restricts both ends to work units belonging to this work center, rejects a self-loop and a duplicate `(from, to)` pair before submit — absorbs the former standalone `/equipment-flows` screen, which had no such restriction and is retired (§ "Retired screen" below). **When the selected node is `WORK_UNIT`**, the pane instead shows an Asset Placement section: current `primary`/`secondary` summary plus the full effective-dated placement timeline for that position (Role / Asset / From / To / Status, same column layout as `SCR-FND-AST-001`'s asset-detail placement tab) — this section is read-only, it never originates a placement; place/swap only happens from `SCR-FND-AST-001`. **When the selected node is `AREA`**, the pane shows a short note that shift/fiscal settings live on the `SITE` node instead of a blank pane (an empty pane previously read as "still loading"). Enterprise-level declaration (`ENTERPRISE_SHIFT` labels) stays a separate step — see state notes | all 5 + `ENTERPRISE_SHIFT`, `SITE_SHIFT`, `FISCAL_YEAR`, `EQUIPMENT_FLOW`, `ASSET_PLACEMENT` (read) | Error: rejection **renders the blocking entity as a link** (open transactions) — FLOW-06 implication; deactivated nodes marked, absent from pickers; Shift panel Default: completion checklist per enterprise shift, midnight-crossing shown as a derived hint once both times are set — **no checkbox** (FLOW-01 implication); Shift panel Empty: enterprise hasn't declared any `ENTERPRISE_SHIFT` yet → panel shows "declare enterprise shifts first" with a link out, not a blank form; Fiscal panel Empty: "fiscal context not set" (mirrors `SCR-FND-FSC-001`'s empty state); Line flow Empty (fewer than 2 work units): "needs at least two work units" with Add disabled; Line flow Empty (2+ work units, no rows yet): "no flow declared yet"; Line flow Error: self-loop and duplicate-edge both rejected inline in the add dialog before submit; Area note: plain informational text, not an error/empty state; Work Unit placement timeline Empty: "no placements recorded" | `US-FND-SIT-002`, `US-FND-SHF-001`, `US-FND-SHF-002` |
| ~~`SCR-FND-SIT-003`~~ | ~~Location context picker~~ | **Retired 2026-09-27 (PO, [issue #46](https://github.com/molca-id/docs-molcadx/issues/46)).** Was: Site→Area→Work Center selection carried across the app, persisted per user. No FOUNDATION app (Master Data) shows a context picker. A picker in the Production apps (most likely Production Monitoring) is parked until the PO decides; if it comes back it gets a new `SCR-PROD-*` ID. SCR ID and `sit-003.*` keys are not reused | — | — | ~~`US-FND-SIT-003`~~ |

### Shift & Fiscal panels, Line flow, Asset Placement, Area note — scope inside `SCR-FND-SIT-002`

- **Why here, not their own screens (2026-08-26, PO; revised 2026-09-03; Line flow and
  Area note added 2026-09-17):** the tree already has `SITE`, `WORK_CENTER`, `WORK_UNIT`,
  and `AREA` nodes, so every attached item has a natural node to hang off — no separate
  top-level menu is needed for any of them. On `SITE`: give real hours to every
  enterprise shift (`SITE_SHIFT`) and read the enterprise's `FISCAL_YEAR` window that
  currently applies. On `WORK_CENTER`: edit that work center's own `EQUIPMENT_FLOW` rows
  (line topology, i.e. which position feeds which — despite the entity's name, this is
  never about which asset is involved, see [F-01 §9.11](../DOCS-EN/01-site-hierarchy.md#911-equipment_flow--position-topology-inside-one-work_center)).
  On `WORK_UNIT`: read that position's Asset Placement summary and full timeline. On
  `AREA`: nothing is owned here, so the pane says where the relevant settings actually
  live instead of rendering blank. This does **not** apply to `SHIFT_INSTANCE`
  browsing/crew assignment (per-date operational monitoring, not one-time declaration) —
  those stay on their own screens, see [`02-shift.md`](02-shift.md). `ENTERPRISE_SHIFT`
  label declaration is a separate step on the `ENTERPRISE` node, not one of these panels
  — see `02-shift.md`.
- **Retired screen (2026-09-17):** the standalone `/equipment-flows` list — every
  `EQUIPMENT_FLOW` row in the plant in one flat table, either end pickable from any
  `WORK_UNIT` regardless of work center — is retired; its nav entry is removed and its
  behavior (both ends constrained to the same work center, self-loop and duplicate-edge
  rejected) is only correct on the `WORK_CENTER` Line flow section above. No new screen
  ID is assigned to Line flow — it is a section of `SCR-FND-SIT-002`, same as Shift/
  Fiscal Year/Asset Placement.
- **Plain sections, not tabs (revised 2026-09-03; extended 2026-09-17).**
  `SCR-FND-SIT-002`'s detail pane is otherwise read-only (title, code, type badge); Shift
  and Fiscal Year render as plain bottom sections on a `SITE` node, Line flow as a plain
  bottom section on a `WORK_CENTER` node, Asset Placement as a plain bottom section on a
  `WORK_UNIT` node, and the informational note as a plain bottom section on an `AREA`
  node — no tab bar anywhere. Editing the node itself (Code/Name/etc.) happens in the
  separate Edit dialog opened from the "more actions" menu, not in one of these sections.
- **Still owned by F-01/F-02/F-03/F-04.** `EQUIPMENT_FLOW` is F-01's own entity (§9.11),
  read/written here directly — it is a Site Hierarchy fact (position topology inside one
  work center), not borrowed from another module. Shift/Fiscal sections read/write
  `SITE_SHIFT` and read `FISCAL_YEAR` exactly as F-02/F-03 specify, and the Asset
  Placement section only ever *reads* `ASSET_PLACEMENT` (F-04); this doc only decides
  where each form or summary lives.
- **Site Shift stays a completion step, not a creation step.** `SCR-FND-SIT-002`'s Shift
  section on a `SITE` node can only offer times for `ENTERPRISE_SHIFT` rows that already
  exist — it never creates a new enterprise-wide label from inside a site's detail pane
  (that would let one site's setup silently create global structure). The Fiscal Year
  section is stricter still: the `SITE` node is **fully read-only** there, per Y-2 — no
  override, no dialog, no `FISCAL_YEAR_SITE_OVERRIDE` entity. The `WORK_UNIT` section
  follows the same read-only discipline for `ASSET_PLACEMENT` — it never originates a
  new placement row (place/swap lives on `SCR-FND-AST-001` only). The `WORK_CENTER` Line
  flow section is the one exception that **does** write here directly (add/delete an
  `EQUIPMENT_FLOW` row), because F-01 owns that entity outright.

## Screen text

Rules T-1 to T-4 in [`00-ux.md`](00-ux.md#screen-text--this-folder-is-the-source-po-decision-2026-09-25).
Text copied word for word from PRD-003 (`01-site-hierarchy.md`, `02-shift.md`,
`03-yearly-quarterly-declaration.md`) or from this file's own Screens table / State notes where the
PRD gives none. English for now (UX-0-1). A state row reading `N/A — …` means the PRD describes that
state as a visual change or placeholder with no words; `TBD — PO` means words are needed but not decided.

### SCR-FND-SIT-001 — Site tree explorer

| Key                               | Where / state                                                                                  | Text                                                                                                                                                                       | Stories                        |
| --------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `sit-001.title`                   | Page title                                                                                     | "Site Hierarchy"                                                                                                                                                           | US-FND-SIT-001                 |
| `sit-001.nav.site-hierarchy`      | Sidebar entry                                                                                  | "Site Hierarchy"                                                                                                                                                           | US-FND-SIT-001                 |
| `sit-001.nav.sites`               | Sidebar sub-link (Table view, filtered)                                                        | "Sites"                                                                                                                                                                    | US-FND-SIT-001                 |
| `sit-001.nav.areas`               | Sidebar sub-link (Table view, filtered)                                                        | "Areas"                                                                                                                                                                    | US-FND-SIT-001                 |
| `sit-001.nav.work-centers`        | Sidebar sub-link (Table view, filtered)                                                        | "Work Centers"                                                                                                                                                             | US-FND-SIT-001                 |
| `sit-001.nav.work-units`          | Sidebar sub-link (Table view, filtered)                                                        | "Work Units"                                                                                                                                                               | US-FND-SIT-001                 |
| `sit-001.view.tree`               | View-mode button                                                                               | "Tree"                                                                                                                                                                     | US-FND-SIT-001                 |
| `sit-001.view.diagram`            | View-mode button                                                                               | "Diagram"                                                                                                                                                                  | US-FND-SIT-001                 |
| `sit-001.view.table`              | View-mode button                                                                               | "Table"                                                                                                                                                                    | US-FND-SIT-001                 |
| `sit-001.search` | Search box above the hierarchy, shared by Tree, Diagram and Table (PO, 2026-10-01) | "Search code or name" | US-FND-SIT-001 |
| `sit-001.search.clear` | Clear button inside the search box | "Clear search" | US-FND-SIT-001 |
| `sit-001.empty.no-match` | Search returns nothing | "No match for \<search text\>" | US-FND-SIT-001 |
| `sit-001.chip.all`                | Table view filter chip                                                                         | "All"                                                                                                                                                                      | US-FND-SIT-001                 |
| `sit-001.chip.site`               | Table view filter chip                                                                         | "Site"                                                                                                                                                                     | US-FND-SIT-001                 |
| `sit-001.chip.area`               | Table view filter chip                                                                         | "Area"                                                                                                                                                                     | US-FND-SIT-001                 |
| `sit-001.chip.work-center`        | Table view filter chip                                                                         | "Work Center"                                                                                                                                                              | US-FND-SIT-001                 |
| `sit-001.chip.work-unit`          | Table view filter chip                                                                         | "Work Unit"                                                                                                                                                                | US-FND-SIT-001                 |
| `sit-001.table.columns`           | Table view column headers                                                                      | TBD — PO                                                                                                                                                                   | US-FND-SIT-001                 |
| `sit-001.toggle.show-deactivated` | Toggle above the hierarchy                                                                     | "show deactivated"                                                                                                                                                         | US-FND-SIT-002                 |
| `sit-001.badge.missing-shifts`    | Alert badge on a `SITE` row/box, all three views; hidden at 0 (never "0")                      | "\<missing shift count\>"                                                                                                                                                    | US-FND-SIT-001, US-FND-SHF-001 |
| `sit-001.menu.edit`               | ⋮ menu item (not on Enterprise)                                                                | "Edit"                                                                                                                                                                     | US-FND-SIT-001                 |
| `sit-001.menu.add`                | ⋮ menu item (not on Work Unit), e.g. "Add Site", "Add Work Center"                             | "Add \<child kind\>"                                                                                                                                                         | US-FND-SIT-001                 |
| `sit-001.dialog.title-edit`       | Edit dialog title                                                                              | "Edit \<kind\>" (draft)                                                                                                                                                      | US-FND-SIT-001                 |
| `sit-001.dialog.title-add`        | Add dialog title                                                                               | "Add \<kind\>" (draft)                                                                                                                                                       | US-FND-SIT-001                 |
| `sit-001.field.code`              | Dialog field label (all kinds)                                                                 | "Code"                                                                                                                                                                     | US-FND-SIT-001                 |
| `sit-001.field.code.hint`         | Code field hint, per kind — own segment only since 2026-09-25 (F-01 S-4)                       | Site "JKT1" · Area "AS" · Work Center "L01" · Work Unit "S03"                                                                                                              | US-FND-SIT-001                 |
| `sit-001.field.name`              | Dialog field label (all kinds)                                                                 | "Name"                                                                                                                                                                     | US-FND-SIT-001                 |
| `sit-001.field.timezone`          | Dialog field label (Site only)                                                                 | "Timezone"                                                                                                                                                                 | US-FND-SIT-001                 |
| `sit-001.field.type`              | Dialog field label (Work Center only)                                                          | "Type"                                                                                                                                                                     | US-FND-SIT-001                 |
| `sit-001.field.type.options`      | Work Center type option labels (four values)                                                   | "Production line (discrete)" · "Process cell (batch)" · "Production unit (continuous)" · "Storage zone (warehousing)" (draft)                                              | US-FND-SIT-001                 |
| `sit-001.field.class`             | Dialog field label, last field, optional (all four kinds)                                      | "Class"                                                                                                                                                                    | US-FND-SIT-001                 |
| `sit-001.button.save`             | Dialog primary button                                                                          | "Save"                                                                                                                                                                     | US-FND-SIT-001                 |
| `sit-001.error.duplicate-code`    | Under Code field, code already used                                                            | "Code \<code\> is already used by \<node name\>. Use another code."                                                                                                            | US-FND-SIT-001                 |
| `sit-001.error.timezone-required` | Under Timezone field, none chosen                                                              | "Timezone is required"                                                                                                                                                     | US-FND-SIT-001                 |
| `sit-001.error.type-required`     | Under Type field, none chosen                                                                  | "Type is required" (draft)                                                                                                                                                 | US-FND-SIT-001                 |
| `sit-001.error.name-too-long`     | Name over 80 characters                                                                        | "Name can be up to 80 characters." (draft)                                                                                                                                 | US-FND-SIT-001                 |
| `sit-001.error.code-too-long`     | Code over 20 characters                                                                        | "Code can be up to 20 characters." (draft)                                                                                                                                 | US-FND-SIT-001                 |
| `sit-001.error.code-chars` | Under Code field: a character outside letters, digits, `_` and `-` (F-01 S-4; `-` allowed for site, area, work center and class codes since 2026-10-02; work unit codes letters, digits and `_` only until S-10) | "Use only letters, numbers, _ and - in the code." (draft) · work unit: "Use only letters, numbers and _ in the code." (draft) | US-FND-SIT-001 |
| `sit-001.error.segment-clash` | Save refused: this code and a sibling's become the same address segment after cleaning (F-04 §9.7.1, PO 2026-10-02) — same text as `dsr-001.error.segment-clash` | "\<code 1\> and \<code 2\> both become \<segment\> in the tag address. Change one of them." (draft) | US-FND-SIT-001 |
| `sit-001.confirm.code-in-address` | Edit dialog: saving a new code that is part of live machine tag addresses (F-04 §9.7.1 rule 7) | "Changing this code changes \<count\> machine tag addresses. The hardware team will need a new tag list. Save anyway?" (draft)                                               | US-FND-SIT-001                 |
| `sit-001.default`                 | Default state                                                                                  | N/A — no text: tree folded below Area, focused node highlighted                                                                                                            | US-FND-SIT-001                 |
| `sit-001.empty`                   | Empty state — seed item                                                                        | "start with Enterprise"                                                                                                                                                    | US-FND-SIT-001                 |
| `sit-001.empty.note`              | Empty state — note that other modules are waiting on this                                      | "No sites yet. Shifts, machines and production data all need a place here first." (draft)                                                                                  | US-FND-SIT-001                 |
| `sit-001.loading`                 | Loading state                                                                                  | N/A — no text: PRD shows "a tree placeholder" only                                                                                                                         | US-FND-SIT-001                 |
| `sit-001.error.save`              | Save error, dialog stays open with input kept                                                  | "Could not save — your input has not been lost. Try saving again."                                                                                                         | US-FND-SIT-001                 |
| `sit-001.error.blocking-link`     | Save refused because of another item — link shown in the pane                                  | "Couldn't save because of \<item name\>. Open it to see why." (draft)                                                                                                        | US-FND-SIT-001                 |
| `sit-001.offline`                 | Offline state                                                                                  | "A connection is required to change master data"                                                                                                                           | US-FND-SIT-001                 |
| `sit-001.success`                 | Success confirmation (dialog closes, new item selected)                                        | "\<node name\> saved." (draft)                                                                                                                                               | US-FND-SIT-001                 |
| `sit-001.no-permission`           | No permission, in the pane (no ⋮ menu anywhere)                                                | "Only subjects whose IDP-asserted scope claim covers this site (or a broader `enterprise`/`tenant` claim) may change the location structure. Contact your Plant Admin/IT." | US-FND-SIT-001                 |

### SCR-FND-SIT-002 — Node detail & deactivate (+ Shift, Fiscal Year, Line flow, Asset Placement, Area note)

**Node pane and Deactivate (Edit dialog footer)**

| Key | Where / state | Text | Stories |
|---|---|---|---|
| `sit-002.pane.title` | Detail pane title | "\<node name\>" | US-FND-SIT-001 |
| `sit-002.pane.code` | Detail pane code | "\<node code\>" | US-FND-SIT-001 |
| `sit-002.pane.type-badge` | Detail pane type badge labels | "Enterprise" · "Site" · "Area" · "Work Center" · "Work Unit" (draft) | US-FND-SIT-001 |
| `sit-002.button.deactivate` | Edit dialog footer button | "Deactivate" | US-FND-SIT-002 |
| `sit-002.field.effective-date` | Deactivate — effective date label | "Inactive from" (draft) | US-FND-SIT-002 |
| `sit-002.impact.descendants` | Impact list — items below that will be deactivated too | "\<count\> items below this will be deactivated too." (draft) | US-FND-SIT-002 |
| `sit-002.impact.blockers` | Impact list — things still running that block it | "\<count\> things still in use here are blocking this." (draft) | US-FND-SIT-002 |
| `sit-002.impact.modules` | Impact list — modules that use this item | "Used in: \<module list\>" (draft) | US-FND-SIT-002 |
| `sit-002.button.confirm` | Deactivate confirm button | "Deactivate \<kind\>" (draft) | US-FND-SIT-002 |
| `sit-002.default` | Default state | N/A — no text: read-only title, code, type badge | US-FND-SIT-001 |
| `sit-002.empty` | Empty state | N/A — PRD: "not applicable" | US-FND-SIT-002 |
| `sit-002.loading` | Loading — impact list placeholder, confirm locked | "Working out the impact…" (draft)                                                           | US-FND-SIT-002 |
| `sit-002.error.impact` | Impact could not be computed | "Could not compute impact — deactivation was not performed." | US-FND-SIT-002 |
| `sit-002.error.blocked` | Deactivation refused, names each blocker (e.g. work order number) | "Can't deactivate \<node name\>. Still in use: \<blocker list\>." (draft) | US-FND-SIT-002 |
| `sit-002.error.past-date` | Effective date in the past | "The effective date cannot be in the past — corrections to the past are handled as flagged adjustments." | US-FND-SIT-002 |
| `sit-002.offline` | Offline state | "You're offline. Site Hierarchy needs a connection to load and save changes." (draft) | US-FND-SIT-002 |
| `sit-002.success` | Success — item stays in tree greyed out | "inactive since \<date\>" | US-FND-SIT-002 |
| `sit-002.no-permission` | No permission — Deactivate unavailable, access explained | "Only subjects whose IDP-asserted scope claim covers this site (or a broader `enterprise`/`tenant` claim) may change the location structure. Contact your Plant Admin/IT." | US-FND-SIT-002 |

**Shift section — `ENTERPRISE` node (shift labels)**

| Key | Where / state | Text | Stories |
|---|---|---|---|
| `sit-002.shift.heading` | Section heading (Enterprise and Site) | "Shift" | US-FND-SHF-001 |
| `sit-002.shift-ent.row.adopted` | Row — how many sites set hours for the label | "Hours set at \<count\> of \<total\> sites" (draft) | US-FND-SHF-001 |
| `sit-002.shift-ent.button.add` | Main button | "Add enterprise shift" | US-FND-SHF-001 |
| `sit-002.shift-ent.dialog.title-edit` | Pencil → edit dialog title | "Edit shift" (draft) | US-FND-SHF-001 |
| `sit-002.shift-ent.field.label` | Shift label field label | "Shift name" (draft) | US-FND-SHF-001 |
| `sit-002.shift-ent.action.delete` | Delete action label | "Delete" (draft) | US-FND-SHF-001 |
| `sit-002.shift-ent.default` | Default state | N/A — no text: list of labels | US-FND-SHF-001 |
| `sit-002.shift-ent.empty` | Empty — no shifts declared | "declare your first shift" | US-FND-SHF-001 |
| `sit-002.shift-ent.empty.warning` | Empty — warning under it | "Without shifts, no site can declare hours and no production transaction can be recorded." | US-FND-SHF-001 |
| `sit-002.shift-ent.loading` | Loading state | N/A — no text: PRD shows "a placeholder layout" only | US-FND-SHF-001 |
| `sit-002.shift-ent.error.delete-blocked` | Delete refused, names the sites using the label | "Can't delete \<shift name\>. These sites have hours for it: \<site list\>." (draft) | US-FND-SHF-001 |
| `sit-002.shift-ent.offline` | Offline state | "You're offline. Site Hierarchy needs a connection to load and save changes." (draft) | US-FND-SHF-001 |
| `sit-002.shift-ent.success` | Success state | "\<shift name\> saved." (draft) | US-FND-SHF-001 |
| `sit-002.shift-ent.no-permission` | No permission — read-only, no pencil, no Add | "You can view shifts but not change them. Ask your Plant Admin/IT for access." (draft) | US-FND-SHF-001 |

**Shift section — `SITE` node (site hours checklist)**

| Key | Where / state | Text | Stories |
|---|---|---|---|
| `sit-002.shift-site.columns` | Checklist column headers (label, start, end) | "Shift" · "Start" · "End" (draft) | US-FND-SHF-001 |
| `sit-002.shift-site.badge.missing` | Badge — lines with no hours yet | "\<n\> missing" | US-FND-SHF-001 |
| `sit-002.shift-site.hint.crosses-midnight` | Hint once both times set and end < start (no checkbox) | "crosses midnight" | US-FND-SHF-001 |
| `sit-002.shift-site.default` | Default state | N/A — no text: one checklist line per enterprise shift | US-FND-SHF-001 |
| `sit-002.shift-site.empty` | Empty — company has no shifts yet | "declare enterprise shifts first" | US-FND-SHF-001 |
| `sit-002.shift-site.empty.link` | Empty — link to the enterprise shift step | "Go to enterprise shifts" (draft) | US-FND-SHF-001 |
| `sit-002.shift-site.loading` | Loading state | N/A — no text: PRD shows "a placeholder layout" only | US-FND-SHF-001 |
| `sit-002.shift-site.error.overlap` | Hours overlap another shift, names it (e.g. "Shift 3"); input kept | "These hours overlap \<shift name\>. Change the start or end time." (draft) | US-FND-SHF-001 |
| `sit-002.shift-site.error.same-time` | Start and end are the same time — refused (F-02, PO 2026-10-02); input kept | "Start and end can't be the same time." | US-FND-SHF-001 |
| `sit-002.shift-site.offline` | Offline state | "You're offline. Site Hierarchy needs a connection to load and save changes." (draft) | US-FND-SHF-001 |
| `sit-002.shift-site.success` | Success — line marked complete, missing count and tree badge drop | N/A — no text: PRD describes a visual change only | US-FND-SHF-001 |
| `sit-002.shift-site.no-permission` | No permission — read-only, times not editable | "You can view this site's shift hours but not change them. Ask your Plant Admin/IT for access." (draft) | US-FND-SHF-001 |

**Fiscal Year section — `ENTERPRISE` node (declare, amend)**

| Key | Where / state | Text | Stories |
|---|---|---|---|
| `sit-002.fiscal.heading` | Section heading (Enterprise and Site) | "Fiscal Year" | US-FND-FYR-001 |
| `sit-002.fiscal-ent.row` | List row, newest first | "\<label\> · \<mode\> · \<start date\> to \<end date\>" | US-FND-FYR-001 |
| `sit-002.fiscal-ent.row.status` | Row status | TBD — PO | US-FND-FYR-001 |
| `sit-002.fiscal-ent.button.declare` | Main button | "Declare fiscal year" | US-FND-FYR-001 |
| `sit-002.fiscal-ent.field.labels` | Form field labels (label, mode, start/end month, start/end date, quarter pattern) | "Name" · "Mode" · "Start month" · "End month" · "Start date" · "End date" · "Quarter pattern" (draft) | US-FND-FYR-001 |
| `sit-002.fiscal-ent.field.mode.options` | Mode option labels (monthly, weekly ISO) | "Monthly" · "Weekly (ISO)" (draft) | US-FND-FYR-001 |
| `sit-002.fiscal-ent.week-count` | Year length in weeks shown on the form (weekly mode) | "\<count\> weeks" (draft) | US-FND-FYR-001 |
| `sit-002.fiscal-ent.warning.not-monday` | Weekly start date not a Monday (saved with warning) | "This date isn't a Monday. ISO weeks start on Monday, so every week in this year will start mid-week." (draft) | US-FND-FYR-001 |
| `sit-002.fiscal-ent.error.overlap` | Overlaps an existing year, names it and its date range | "These dates overlap \<label\> (\<start date\> to \<end date\>). Choose dates outside it." (draft) | US-FND-FYR-001 |
| `sit-002.fiscal-ent.error.duplicate-label` | Label already used in the enterprise | "\<label\> is already used. Use another name." (draft) | US-FND-FYR-001 |
| `sit-002.fiscal-ent.error.label-too-long` | Label over 20 characters | "Name can be up to 20 characters." (draft) | US-FND-FYR-001 |
| `sit-002.fiscal-ent.default` | Default state | N/A — no text: list of declared years | US-FND-FYR-001 |
| `sit-002.fiscal-ent.empty` | Empty — current year not declared | "declare your first fiscal year" | US-FND-FYR-001 |
| `sit-002.fiscal-ent.empty.meaning` | Empty — what it means (no period report can group by year/quarter) | "Until a fiscal year is declared, reports can't group figures by year or quarter." (draft) | US-FND-FYR-001 |
| `sit-002.fiscal-ent.loading` | Loading state | N/A — no text: PRD shows "a list placeholder" only | US-FND-FYR-001 |
| `sit-002.fiscal-ent.error.save` | Save error, form keeps input | "Could not save. Your entries are not lost." | US-FND-FYR-001 |
| `sit-002.fiscal-ent.offline` | Offline state | "You're offline. Site Hierarchy needs a connection to load and save changes." (draft) | US-FND-FYR-001 |
| `sit-002.fiscal-ent.success` | Success — new year at top, range in full | "\<label\> · \<mode\> · \<start date\> to \<end date\>" (e.g. "FY2026 · monthly · 2026-01-01 to 2026-12-31") | US-FND-FYR-001 |
| `sit-002.fiscal-ent.no-permission` | No permission | "Only subjects whose IDP-asserted scope claim covers the enterprise (or a broader `tenant` claim) can declare a fiscal year. Contact your plant admin." | US-FND-FYR-001 |
| `sit-002.fiscal-ent.button.amend` | Action on the selected year | "Amend" | US-FND-FYR-002 |
| `sit-002.fiscal-ent.amend.impact` | Amend impact list (closed periods, dates that move) | "\<count\> closed periods in this range" · "\<count\> production dates move to another year or quarter" (draft) | US-FND-FYR-002 |
| `sit-002.fiscal-ent.amend.loading` | Impact loading, confirm locked | "Working out the impact…" (draft)                                                           | US-FND-FYR-002 |
| `sit-002.fiscal-ent.amend.blocked` | Range already closed — refused straight away with reason | "Can't amend \<label\>. Its dates have already closed." (draft) | US-FND-FYR-002 |
| `sit-002.fiscal-ent.amend.error.impact` | Impact could not be computed | "Could not compute impact. No change was made." | US-FND-FYR-002 |
| `sit-002.fiscal-ent.amend.error.past-date` | Effective date in the past | "The effective date cannot be in the past. Closed periods must not change." | US-FND-FYR-002 |
| `sit-002.fiscal-ent.amend.error.closed-period` | Would move closed periods — names count and date range | "Can't save. This would move \<count\> closed periods (\<start date\> to \<end date\>). Closed periods must not change." (draft) | US-FND-FYR-002 |
| `sit-002.fiscal-ent.amend.error.gap` | Would leave dates in no fiscal year | "Can't save. \<start date\> to \<end date\> would belong to no fiscal year." (draft) | US-FND-FYR-002 |
| `sit-002.fiscal-ent.amend.mode-change` | **Changed 2026-10-02 (F-03, PO):** a save that changes the mode is refused — no longer turned into a new declaration | "Can't change the mode of \<label\>. Keep this mode, or declare a new fiscal year in the other mode." (draft) | US-FND-FYR-002 |
| `sit-002.fiscal-ent.amend.history` | History list heading (old and new versions) | "History" (draft) | US-FND-FYR-002 |

**Fiscal Year section — `SITE` node (read-only, no override)**

| Key | Where / state | Text | Stories |
|---|---|---|---|
| `sit-002.fiscal-site.default` | Default — which enterprise-wide year applies here | "\<label\> · \<start date\> to \<end date\> · set for the whole company" (draft) | US-FND-FYR-001 |
| `sit-002.fiscal-site.empty` | Empty — no year applies | "fiscal context not set" | US-FND-FYR-001 |
| `sit-002.fiscal-site.loading` | Loading state | "Loading fiscal year…" (draft) | US-FND-FYR-001 |
| `sit-002.fiscal-site.error` | Error state | "Couldn't load the fiscal year. Try again." (draft) | US-FND-FYR-001 |
| `sit-002.fiscal-site.offline` | Offline state | "You're offline. Site Hierarchy needs a connection to load and save changes." (draft) | US-FND-FYR-001 |
| `sit-002.fiscal-site.success` | Success state | N/A — read-only section, no write action (Y-2) | US-FND-FYR-001 |
| `sit-002.fiscal-site.no-permission` | No permission | "You don't have access to this site's fiscal year. Ask your Plant Admin/IT for access." (draft) | US-FND-FYR-001 |

**Line flow section — `WORK_CENTER` node** (no PRD story yet; text from this file's Screens table)

| Key | Where / state | Text | Stories |
|---|---|---|---|
| `sit-002.line-flow.heading` | Section heading | "Line flow" | — |
| `sit-002.line-flow.columns` | Edge table column headers (from, to) | "From" · "To" (draft) | — |
| `sit-002.line-flow.button.add` | Add edge button | "Add" | — |
| `sit-002.line-flow.action.delete` | Delete edge action | "Delete" (draft) | — |
| `sit-002.line-flow.unconnected` | Heading for unconnected work units | "Not connected yet" (draft) | — |
| `sit-002.line-flow.error.self-loop` | Add dialog — from = to | "A work unit can't feed itself. Pick two different work units." (draft) | — |
| `sit-002.line-flow.error.duplicate` | Add dialog — (from, to) already declared | "\<from\> → \<to\> is already in the line flow." (draft) | — |
| `sit-002.line-flow.default` | Default state | N/A — no text: chain diagram + edge table | — |
| `sit-002.line-flow.empty.too-few` | Empty — fewer than 2 work units, Add disabled | "needs at least two work units" | — |
| `sit-002.line-flow.empty.no-rows` | Empty — 2+ work units, no rows yet | "no flow declared yet" | — |
| `sit-002.line-flow.loading` | Loading state | "Loading line flow…" (draft) | — |
| `sit-002.line-flow.error` | Error state (other than the two inline rejections above) | "Couldn't save. Your changes are still here — try again." (draft) | — |
| `sit-002.line-flow.offline` | Offline state | "You're offline. Site Hierarchy needs a connection to load and save changes." (draft) | — |
| `sit-002.line-flow.success` | Success state | "Line flow saved." (draft) | — |
| `sit-002.line-flow.no-permission` | No permission | "You can view this line flow but not change it. Ask your Plant Admin/IT for access." (draft) | — |

**Asset Placement section — `WORK_UNIT` node (read-only)**

| Key | Where / state | Text | Stories |
|---|---|---|---|
| `sit-002.placement.heading` | Section heading | "Asset Placement" | US-FND-SIT-001 |
| `sit-002.placement.summary` | Current `primary`/`secondary` summary labels | "Primary: \<asset name\>" · "Secondary: \<count\>" (draft) | US-FND-SIT-001 |
| `sit-002.placement.col.role` | Timeline column | "Role" | US-FND-SIT-001 |
| `sit-002.placement.col.asset` | Timeline column | "Asset" | US-FND-SIT-001 |
| `sit-002.placement.col.from` | Timeline column | "From" | US-FND-SIT-001 |
| `sit-002.placement.col.to` | Timeline column | "To" | US-FND-SIT-001 |
| `sit-002.placement.col.status` | Timeline column | "Status" | US-FND-SIT-001 |
| `sit-002.placement.default` | Default state | N/A — no text: summary + timeline | US-FND-SIT-001 |
| `sit-002.placement.empty` | Empty — no placement rows | "no placements recorded" | US-FND-SIT-001 |
| `sit-002.placement.loading` | Loading state | "Loading placements…" (draft) | US-FND-SIT-001 |
| `sit-002.placement.error` | Error state | "Couldn't load placements. Try again." (draft) | US-FND-SIT-001 |
| `sit-002.placement.offline` | Offline state | "You're offline. Site Hierarchy needs a connection to load and save changes." (draft) | US-FND-SIT-001 |
| `sit-002.placement.success` | Success state | N/A — read-only section; place/swap lives on `SCR-FND-AST-001` | US-FND-SIT-001 |
| `sit-002.placement.no-permission` | No permission | "You don't have access to the machines at this position. Ask your Plant Admin/IT for access." (draft) | US-FND-SIT-001 |

**Area note — `AREA` node**

| Key | Where / state | Text | Stories |
|---|---|---|---|
| `sit-002.area-note` | Informational note: shift/fiscal settings live on the `SITE` node (not an empty/error state) | "Shift and fiscal year settings are on the site. Select \<site name\> to see them." (draft) | US-FND-SIT-001 |

### ~~SCR-FND-SIT-003 — Location context picker~~ (retired 2026-09-27)

Retired with `US-FND-SIT-003` (PO, [issue #46](https://github.com/molca-id/docs-molcadx/issues/46)). The nine
`sit-003.*` keys (label, value, default, empty, loading, error, offline, success, no-permission) are removed and
not reused. The last text they held is in git history and in PRD-003 `90-closed-stories.md`.

## State notes

- **Search and keyboard (PO, 2026-10-01).** The search box
  (`sit-001.search`) matches node **code or name** and works the same in all three views: it keeps the matches
  **plus their ancestors**, expanded, so each match is shown in place. Clearing it returns to the default fold
  (below Area). The Tree view is keyboard-operable following the WAI-ARIA treeview pattern: ↑/↓ move, → expands
  or enters, ← collapses or goes to the parent, Home/End go to the first/last visible row, Enter/Space select.
- **Master-detail, dialog-based editing:** every node's row/box, in **all three view
  modes** (Tree, Diagram, Table), carries a "more actions" (⋮) menu with **Edit** (that
  node kind's own fields — Code/Name/Timezone for Site, Code/Name for Area, Code/Name/Type
  for Work Center, Code/Name for Work Unit (**no Type on Work Unit**, F-01 §9.6); not shown
  for Enterprise, which has no fields of its own) and **Add {child kind}** (not shown for
  Work Unit, which has no child entity). Both open as dialogs — **no floating or inline
  forms** on the canvas or in the pane.
- **Class picker in every node dialog (2026-09-23).** Edit and Add for Site, Area, Work
  Center **and** Work Unit end with an optional **Class** select, after the kind's own
  fields. It lists only that level's active classes (site classes on a Site, and so on),
  maintained on the Reference class managers `SCR-FND-REF-005`–`008`
  ([`05-reference.md`](05-reference.md)). At most one class per node; leaving it empty
  saves. A deactivated class is not offered, but a node that already has one keeps
  showing it. Classes group nodes for reporting only — nothing else in this screen
  changes with the class (F-01 §9.3–§9.10).
  The detail pane itself is near-purely read-only display (title, code, type badge) plus
  whatever attaches below it for that node kind: the Shift/Fiscal Year panels for
  Enterprise/Site, Line flow for Work Center, an Asset Placement summary + timeline for
  Work Unit, or an informational note for Area. Every write action this pane exposes —
  the Shift/Fiscal Year panel actions and the Line flow add/delete included — follows
  this same dialog-based pattern, not an inline form.
- **Positions only — assets never appear on this tree.** `WORK_UNIT` is a position; the
  machine standing in it is an `ASSET`. This pane's Asset Placement section only ever
  *displays* the current summary and timeline; the place/swap action itself lives on
  `SCR-FND-AST-001`'s asset detail (2026-09-17 — moved off the retired standalone
  placement screen, see [`04-asset.md`](04-asset.md)). No drag-and-drop of machines,
  ever.
- **Deactivated nodes** render dashed/gray under a "show deactivated" toggle — never
  silently removed (F-00 deactivation rule). `valid_from`/`valid_to` are confirmed needed on
  `SITE`/`AREA`/`WORK_CENTER`/`WORK_UNIT` per F-01 §9.4–§9.6 (resolved `UX-SIT-3`) — the gap is
  implementation catch-up (columns not yet added), not a spec question.
- **Three view modes, one screen:** Tree / Diagram / Table are user-switchable buttons,
  not a canvas-plus-accessibility-fallback pair — Table is a first-class flat,
  type-filterable list (All/Site/Area/Work Center/Work Unit chips), not only an
  accessibility affordance. Diagram carries ARIA treeview semantics; Tree and Table are
  natively accessible list structures. Selecting a node in any mode updates the same
  detail pane — keyboard and screen-reader users are never locked out.
- **No left-pane collapse:** the hierarchy panel always renders full-size; it does not
  fold or collapse to a rail.
- **Missing-shift indicator on `SITE` nodes, in all three view modes.** A `SITE` whose
  `SITE_SHIFT` adoption is incomplete (fewer declared rows than existing
  `ENTERPRISE_SHIFT` labels — same "N missing" count as the Shift panel's own badge)
  shows a small solid alert count directly on its row/box, so an incomplete site is
  visible on the tree/diagram/table itself, not only after opening its detail pane's
  Shift section. `Area`/`Work Center`/`Work Unit` nodes never carry this — shift adoption is
  a site-level concept. Absent for a fully-declared site, not a "0" badge.
- **Scale guard:** collapse below Area by default; per-subtree focus mode for large sites.
- **Panel collapse:** both the hierarchy panel and the detail pane collapse independently
  to a narrow icon rail (chevron toggle in each panel's header) — lets either panel
  reclaim width from the other; state is session-local, not persisted.
- **Sidebar quick-links (screen-composition decision only, 2026-08-28):** Sites, Areas,
  Work Centers, and Work Units each get a sub-link under the sidebar's "Site Hierarchy"
  entry — all land on this same `SCR-FND-SIT-001` screen in Table view, pre-filtered to
  that kind. Not separate screens; no entity moves.
- **Timezone is a locked list, not free text.** The `SITE` node's Timezone field (on
  create and on edit) is a searchable select constrained to the real IANA timezone
  list — the opposite of the Code field's free-text rule above. Don't conflate the two:
  Code is free text with a suggested pattern as a hint; Timezone only accepts a
  valid zone. **Since 2026-09-25 Code is limited to letters, digits and `_`** (it is a segment
  of generated machine tag addresses, F-01 S-4 / F-04 §9.7.1) — still typed freely, not picked,
  and the hint shows only that level's own segment (`AS`, not `JKT1-AS`).

## Layout sketch (interaction, not visual design)

```
ENTERPRISE Molca
└─ SITE JKT1
   ├─ AREA Assembly
   │   ├─ WC JKT1-AS-L01
   │   │   ├─ WU JKT1-AS-L01-S03   ← position only; no machines drawn here
   │   │   └─ WU JKT1-AS-L01-S04
   │   └─ WC JKT1-AS-L02 …
   └─ AREA Pack …
[ each node row/box → ⋮ "more actions" menu: Edit (dialog) · Add {child kind} (dialog) ]
[ selected node → detail pane (read-only): title, code, type badge ]
[ node = SITE → pane also shows, below the above:
    Shift        — per-ENTERPRISE_SHIFT start/end completion checklist (SITE_SHIFT)
    Fiscal Year  — enterprise-wide FISCAL_YEAR window that currently applies (read-only, no override) ]
[ node = WORK_CENTER → pane also shows:
    Line flow    — EQUIPMENT_FLOW chain(s) scoped to this work center's own WORK_UNITs;
                   edit as a from/to edge table, both ends locked to this work center ]
[ node = WORK_UNIT → pane also shows:
    Asset Placement — current primary/secondary summary + full read-only timeline;
                      place/swap happens on SCR-FND-AST-001, not here ]
[ node = AREA → pane shows an informational note only: shift/fiscal settings live on
                the SITE node above, not here ]
```

## Open questions

| # | Question | Owner |
|---|---|---|
| ~~UX-SIT-1~~ | ~~Tree depth display on small screens — collapse levels below Area by default?~~ **Resolved 2026-08-26 — yes:** collapse below Area is the default at all sizes; per-subtree focus mode for large sites. | — |
| ~~UX-SIT-2~~ | ~~Should Shift and Fiscal Year get their own top-level screens, or live inside Site Hierarchy's detail pane?~~ **Resolved 2026-08-26 (PO), revised 2026-09-03 — inside `SCR-FND-SIT-002`**: `ENTERPRISE` node declares `ENTERPRISE_SHIFT` labels (own panel); `SITE` node completes `SITE_SHIFT` and reads (never overrides) `FISCAL_YEAR`, per Y-2. `SCR-FND-SHF-003`/`004` (instance monitor, crew assignment) are unaffected — see "Shift & Fiscal panels" above. | — |
| ~~UX-SIT-3~~ | ~~`SITE`/`AREA`/`WORK_CENTER`/`WORK_UNIT` have no `valid_from`/`valid_to` field in the implemented data model — is deactivation actually needed for these entities, or was that state note inherited from the general F-00 rule without confirming these specific entities need it? If needed, `foundation-domain` must add the field to F-01 §9 before this can be built for real.~~ **Resolved 2026-09-22 (PO): yes, kept exactly as already spec'd in F-01 §9.4–§9.6** — `AREA`/`WORK_CENTER`/`WORK_UNIT` each keep their own `valid_from`/`valid_to` so a retired line/area/station can disappear from pickers while historical data stays intact (`US-FND-SIT-002`). This is separate from `ASSET_PLACEMENT`'s own effective dating (which asset occupies a work unit and when) — untouched by this decision. The remaining gap is implementation: the columns still need to be added to the actual data model, the spec already has them. | — |
| ~~UX-SIT-4~~ | ~~`EQUIPMENT_FLOW` was found already built with no prior FOUNDATION spec (back-filled 2026-09-17, F-01 §9.11/§9.12 S-6) — should the entity keep its current name even though the screen label reads "Line flow", or is a rename to something like `WORK_UNIT_FLOW` worth doing?~~ **Resolved 2026-09-21 (PO): no rename — `EQUIPMENT_FLOW` and `WORK_UNIT_FLOW` are different entities**, not two names for one thing (see F-01 §9.11 vs. §9.12, S-6). `EQUIPMENT_FLOW` keeps its name and stays scoped to this screen's "Line flow" panel; `WORK_UNIT_FLOW` (F-01 §9.12) is PRD-003's separate, now-specified entity for cross-work-center flow used by KPI/Quality — unaffected by this screen, and has no authoring screen of its own yet (S-6a). | — |
