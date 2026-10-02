# UX 04 — Asset & placement screens

> Mirrors [F-04 asset ontology](../DOCS-EN/04-asset-ontology.md) ·
> behavior: [FLOW-02](../FLOW/02-production-readiness.md) · Status: 🟡 DRAFT.

**Coverage:** `ASSET_CLASS`, `ASSET_TYPE`, `ASSET`, `ASSET_PLACEMENT`,
`ASSET_TAGS`, `ASSET_PRODUCT_CODES` (F-04 §9) — rule D-1. `ASSET_PRODUCT_CODES` is authored on the product's Routing tab (`SCR-FND-WMS-007`, [UX 08](08-work-master.md), 2026-09-30), not on an asset screen. `ASSET_STATE_LOG` is not a
FOUNDATION entity (owned by PRODUCTION since 2026-09-28, [decision 2026-09-28](../../../LOGS/decisions/2026-09-28-asset-status-ownership.md)) — its screen
lives in [PRODUCTION Monitoring](../../PRODUCTION/DOCS/02-monitoring.md), not here.
`ASSET_COMPONENT_LINK`'s screen moved to the Maintenance domain 2026-09-10 — see
[`MAINTENANCE/UX/01-asset-history.md`](../../MAINTENANCE/UX/01-asset-history.md)
(`SCR-MNT-AST-001`, was `SCR-FND-AST-006`).

**Asset Registry re-shape (2026-09-17, decision by shipped frontend — superseding the
2026-08-24 [screen-merge decision](../../../LOGS/decisions/2026-09-04-asset-ontology-screen-merge.md)
for `SCR-FND-AST-001`'s scope, not its ID):** the 2026-09-04 merge put asset browsing and
Class/Type taxonomy editing into **one** screen (`SCR-FND-AST-001`, three view modes,
Table view doubling as the taxonomy editor). The shipped implementation instead splits
those two questions again, but along a different seam than before 2026-08-24:

- **`SCR-FND-AST-001` is now the Asset Registry** — asset-centric, one row per
  Equipment-unit `ASSET` (not the `ASSET_CLASS → ASSET_TYPE → ASSET` tree), merging in
  what used to be `SCR-FND-AST-003`'s "where is this machine" question. Two view modes
  (**Table**, **Diagram**), not three — the former **Tree** mode is dropped, its
  find-one-machine job absorbed by Table's own search.
- **Class/Type taxonomy authoring gets a screen again**, `SCR-FND-AST-007` (new ID —
  `SCR-FND-AST-002` stays retired per the "never reused" rule even though its underlying
  tree+dialog code is what this screen reuses). It has no nav entry of its own; it's
  reached from the Asset Registry's class/type breadcrumb links.
- **`SCR-FND-AST-003` (placement history, list+timeline+place/swap) is unchanged in
  shape** but also loses its nav entry — see its row below for what's still true and
  what moved.

## Screens

| SCR ID | Screen | Purpose | Entities (§9) | States worth noting | Stories |
|---|---|---|---|---|---|
| `SCR-FND-AST-001` | **Asset Registry** — list + detail, **Table / Diagram view modes** | **List** (`/assets`): one row per top-level Equipment-unit `ASSET` (`parent_asset_id IS NULL` — components never pad this list, they belong to their parent's detail). Row shows: **tag** (`asset_tag`, always present), **name** (`asset_name` when set — F-04 §9.4, added 2026-09-21 resolving UX-AST-6 — falling back to the derived name, `ASSET_TYPE.type_name` then `asset_tag`, for assets registered before the field existed or left blank), **class/type** badges, **active placement** (work center/work unit label(s) with `primary`/`secondary` badge and a position count when >1, or "unplaced"), **lifecycle status** (colored badge). Search box matches tag/name/serial. One **Filter** button opens a modal (class, lifecycle status, placement: all/placed/unplaced) — edits are drafted and only take effect on Apply, with a count badge on the trigger when any filter is active. **Table/Diagram** toggle: Table is the flat sortable list above; Diagram groups the same filtered rows into one card per `ASSET_CLASS` (unclassified assets grouped together), each a clickable row into the asset's detail — it answers "what does the fleet look like," Table answers "find me this tag." Selecting any row (either mode) opens the **detail** view (`/assets/$assetId`), not a modal: header (tag + status badges, name — same `asset_name`-or-derived logic as the list row, clickable taxonomy breadcrumb → `SCR-FND-AST-007`), **Edit asset** and **Place/swap** actions, a six-column meta strip (serial, component level, class, type, site, lifecycle), and two tabs — **Hierarchy & components** (taxonomy position breadcrumb + read-only ISO 14224 component tree, editing components happens on `SCR-FND-AST-007`) and **Placement history** (current active placement(s) + full effective-dated timeline, same shape as `SCR-FND-AST-003`'s own timeline) and **Tags** (2026-09-28, read-only: the machine's `ASSET_TAGS` — tag name, role, address (generated or typed), data source, work unit — plus a "Manage tags" link to `SCR-FND-DSR-002` filtered to this machine; tags are never created or edited here, [UX 13 § Declaring a tag](13-data-source.md#declaring-a-tag-po-decision-2026-09-28)). **Place/swap** opens the same mutation and 409 swap-confirmation path as `SCR-FND-AST-003`'s action — asset-first ("place this asset at...") instead of position-first ("place something at this work unit"), same result | `ASSET_CLASS`, `ASSET_TYPE`, `ASSET`, `ASSET_PLACEMENT` (read), `ASSET_TAGS`, `ASSET_PRODUCT_CODES` | Default (list): populated table/diagram; Empty (no assets registered at all): distinct message from Empty (filtered — search/filter matched nothing); Loading: skeleton rows; Detail not-found: asset id doesn't resolve → explicit "not found," not a blank page; Detail — Hierarchy tab Empty: "no components" when the asset has none; Detail — Placement tab Empty: "unplaced" (no active placement) and "no placements recorded" (empty timeline) are two different messages, never collapsed into one; Error (place/swap): second active `primary` rejected, incumbent named (A-9), same as `SCR-FND-AST-003` | `US-FND-AST-001`, `US-FND-AST-002`, `US-FND-AST-003` |
| ~~`SCR-FND-AST-002`~~ | *(retired 2026-09-04 — folded into `SCR-FND-AST-001`'s then-Table view; re-split 2026-09-17 into `SCR-FND-AST-007`, a new ID. `SCR-FND-AST-002` itself stays retired, never reused)* | — | — | — | — |
| `SCR-FND-AST-003` | Placement history — **list + timeline + place/swap action** | **List:** every `WORK_UNIT` (sourced from `SCR-FND-SIT-001`/`002`, not re-created here), each row showing its current active `primary` asset (or "— unplaced —") and `secondary` count; filterable by Site/Area/Work Center. **Detail (on select):** timeline per work unit — active `primary` (max 1) with full replaced-row history below it, active `secondary` rows (0..N) each with their own history; nothing is ever hidden or overwritten (F-00 place ≠ thing). **Action — place/swap:** search an existing, already-registered `ASSET` (`SCR-FND-AST-001`), restricted to Equipment-unit level only (`parent_asset_id IS NULL` — Subunit/Maintainable item/Part filtered out of the picker, not just rejected after); choose role (`primary`/`secondary`, locked to whichever control opened the action); set effective date; save creates a new row and, if replacing an active `primary`, closes the prior row's `valid_to` — it is never deleted. **No longer has its own nav entry (2026-09-17)** — the Asset Registry (`SCR-FND-AST-001`) is now the primary way in, and its detail page's own place/swap action reuses this same mutation and 409 conflict path asset-first instead of position-first. This screen stays reachable directly (URL) and via `SCR-FND-SIT-002`'s `WORK_UNIT` summary, which now also shows the full timeline inline (§ below) rather than only linking out | `ASSET_PLACEMENT` | Default: timeline view per work unit; Empty (list): unplaced work unit shows "— unplaced —", not blank/hidden; Empty (detail): "no placements recorded" instead of an empty timeline; Error: second active `primary` rejected with the incumbent named (A-9) | `US-FND-AST-003` |
| ~~`SCR-FND-AST-004`~~ | ~~Reason taxonomy~~ **Retired 2026-09-23.** Downtime/reject reasons are edited only on the Reference screens `SCR-FND-REF-003`/`004` (its flat-table + category-select behaviour moved there); which reasons apply to which machine moved to the asset form on `SCR-FND-AST-007`. ID not reused | — | — | — | — |
| ~~`SCR-FND-AST-005`~~ | ~~State log browser~~ **Retired 2026-09-28 (PO, [decision 2026-09-28](../../../LOGS/decisions/2026-09-28-asset-status-ownership.md)).** `ASSET_STATE_LOG` is owned by PRODUCTION; the browser is replaced by `SCR-PROD-MON-001` in [PRODUCTION Monitoring § ASSET_STATE_LOG](../../PRODUCTION/DOCS/02-monitoring.md#asset_state_log--operational-state-per-asset-over-time). Was: read-only timeline per asset/work unit showing the asset as of each event. ID not reused | — | — | — | — |
| ~~`SCR-FND-AST-006`~~ | *(moved to Maintenance domain 2026-09-10 — now [`SCR-MNT-AST-001`](../../MAINTENANCE/UX/01-asset-history.md); ID not reused)* | — | — | — | — |
| `SCR-FND-AST-007` | Asset Class/Type taxonomy editor — **Tree + Table view modes** | **New ID, 2026-09-17** for the Class/Type authoring screen that the 2026-09-04 merge had folded into `SCR-FND-AST-001`'s Table view. Tree (indented, expand/collapse) and Table (flat, filterable) modes over `ASSET_CLASS → ASSET_TYPE` (**read-only since 2026-09-23** — creating/editing a class or type moved to the Reference screens [`SCR-FND-REF-009`](05-reference.md) / [`SCR-FND-REF-010`](05-reference.md), PO decision; each class/type row here links on to its manager for editing); asset registration (tag, floor tag, lifecycle), **which downtime/reject reasons apply to this machine** (a tick list per machine, `DOWNTIME_REASON_ASSET`/`REJECT_REASON_ASSET`, `US-FND-REF-003` — moved from retired `SCR-FND-AST-004`, 2026-09-23; exact placement in the form `TBD`) and product-code mapping — the latter a **deferred step** shown with its reason until a `PRODUCT` exists (FLOW-02 implication). No nav entry — reached from `SCR-FND-AST-001`'s class/type breadcrumb links (which also work as the reverse: jump to the matching class/type row here, pre-filtered and highlighted), the same "reachable both directly and via a link" pattern used elsewhere in this doc. Also owns the asset "Edit" form that `SCR-FND-AST-001`'s detail page's **Edit asset** action reuses, rather than a second asset form drifting from this one | `ASSET_CLASS`, `ASSET_TYPE` (read only), `ASSET`, `ASSET_TAGS`, `ASSET_PRODUCT_CODES` | Default (Tree): hierarchy; Default (Table): flat filterable list; Default (product mapping): tag uniqueness enforced per site; Deferred: mapping step visibly locked with "needs a declared product" | `US-FND-AST-002`, `US-FND-REF-003` (class/type editing: `US-FND-AST-001` → `SCR-FND-REF-009`/`010`) |

## State notes

- Swapping a machine creates a new placement row; the work unit's history stays intact —
  the UI must make "history belongs to the position" visible (F-00 place ≠ thing).
- **Component tree has no replacement-history annotations (2026-09-17).** `SCR-FND-AST-001`'s
  Hierarchy & components tab reads the current `parent_asset_id` tree only — it does not
  show when a subunit/part was last swapped, because that history (`ASSET_COMPONENT_LINK`)
  doesn't exist on `ASSET` in this implementation yet; it's a Maintenance-domain entity
  ([`MAINTENANCE/UX/01-asset-history.md`](../../MAINTENANCE/UX/01-asset-history.md)) not yet
  wired into this tab. Not a bug to fix here — flagged so a future cross-link isn't
  mistaken for a regression.
- **Asset tag and place/swap change machine addresses (2026-09-25, F-04 §9.7.1).** `asset_tag` is a
  segment of generated OPC UA tag addresses, and a placement decides the rest of the address. On
  **Edit asset**, renaming `asset_tag` when the asset has tags on a generated data source asks for
  confirmation with the number of addresses that change; on **Place/swap**, saving tells the user the
  asset's tag addresses change from the effective date and a new tag hand-off list is needed
  (`SCR-FND-DSR-002`, Tags page since 2026-09-28). Proposed text (T-3a): Edit asset confirm — "This changes \<count\> tag addresses.
  The hardware team will need a new tag list." (draft); Place/swap after save — "From \<effective date\>,
  this machine's tag addresses change. Export a new tag list for the hardware team." (draft). Rows to be
  added to this file's screen text when its pilot reaches `SCR-FND-AST-001`/`007`.
- **Segment clash (PO, 2026-10-02, F-04 §9.7.1).** Saving an asset whose `asset_tag` would clean to the
  same address segment as another machine on the same work unit is refused, on **Edit asset** and on
  **Place/swap**. Text (draft, same as `dsr-001.error.segment-clash` in UX 13): "\<code 1\> and \<code 2\>
  both become \<segment\> in the tag address. Change one of them."
- **Multi-lane machine (2026-09-25, F-04 §9.6).** **Place/swap** on an asset that already has an active
  placement must ask: **move** it (close the old placement) or **add a lane** (keep both). Never keep
  both silently. "Add a lane" is refused if the new work unit is in another site. The Asset Registry
  row and detail show every active placement (the list already shows a position count when >1).
  After adding a lane, the machine's per-lane tags without a lane are flagged on the Tags page `SCR-FND-DSR-002` (2026-09-28; was `SCR-FND-DSR-001`).
  Proposed text (T-3a): question — "\<machine\> is already placed on \<work unit\>. Move it here, or add
  this as another lane?" (draft); buttons — "Move machine" / "Add lane" (draft); refused — "\<new work
  unit\> is in \<other site\>. All lanes of a machine must be in one site." (draft). The flag on
  `SCR-FND-DSR-002` is row `dsr-001.tags.lane-missing` in UX 13 (key unchanged).

## Open questions

| # | Question | Owner |
|---|---|---|
| ~~UX-AST-1~~ | ~~Downtime logging level per-asset vs per-line (A-5) changes whether SCR-FND-AST-005 filters by asset or work unit~~ **Moved to PRODUCTION 2026-09-28** — `SCR-FND-AST-005` retired; the recording level is PRODUCTION's open item SL-1 ([PRODUCTION Monitoring](../../PRODUCTION/DOCS/02-monitoring.md#asset_state_log--operational-state-per-asset-over-time)) | `production-domain` |
| UX-AST-2 | Should an unplaced `WORK_UNIT` be an alert condition on `SCR-FND-AST-003`'s list (same treatment as `SCR-FND-SHF-003`'s "no gaps allowed," H-6), or is unplaced just normal/expected (not yet commissioned)? | PO + ops |
| ~~UX-AST-3~~ | ~~Should `SCR-FND-AST-001` (asset detail, any view) show a read-only "currently placed at `WORK_UNIT` X" / "unplaced" field per asset, for the reverse lookup (asset → position)?~~ **Resolved 2026-09-17 — yes:** the Asset Registry's list row and detail page both show it; the reverse lookup (position → asset) stays on `SCR-FND-AST-003` and now also on `SCR-FND-SIT-002`'s `WORK_UNIT` section. | — |
| ~~UX-AST-4~~ | *(moved to Maintenance domain 2026-09-10, now `UX-MNT-1` in [`MAINTENANCE/UX/01-asset-history.md`](../../MAINTENANCE/UX/01-asset-history.md) — the ambiguity is still FOUNDATION's to resolve, only the question's home moved with the screen)* | foundation-domain |
| UX-AST-5 | `SCR-FND-AST-007` (Class/Type taxonomy) and `SCR-FND-AST-003` (placement history) both lost their nav entries 2026-09-17 in favor of the Asset Registry — is that permanent (both stay link-only, never nav-linked again), or a staging step toward retiring one or both screens outright? If either is meant to retire, its ID still can't be reused per the ID-grammar rule | PO |
| ~~UX-AST-6~~ | ~~`SCR-FND-AST-001`'s derived display name (`ASSET_TYPE.type_name`, falling back to `asset_tag` while unclassified — F-04 §9.4) was the shipped frontend's own workaround for `ASSET` having no name field of its own. Is the derived name acceptable long-term, or does Molca need a real `ASSET.name`/nickname field?~~ **Resolved 2026-09-21 (PO): yes — `asset_name` added (F-04 §9.4).** Optional free text; when unset, the existing derived-name fallback (`ASSET_TYPE.type_name` → `asset_tag`) still applies, so nothing already registered breaks. `SCR-FND-AST-007`'s Edit asset form gains an `asset_name` input; the Asset Registry's name column/header now reads `asset_name` first (§ below). | — |
| UX-AST-7 | `asset_name` (F-04 §9.4, new) has no uniqueness constraint — two assets can share a name (unlike `asset_tag`, unique per site). Is that intentional (a label, not an identifier — duplicates are a human problem, not a data problem), or should the Edit asset form warn on a same-site duplicate the way `asset_tag` hard-rejects one? | PO + Operations |
