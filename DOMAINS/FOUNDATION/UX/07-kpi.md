# UX 07 — KPI binding screens

> Mirrors [F-07.1 KPI tag mapping](../DOCS-EN/07-1-kpi-tag-mapping.md) ·
> behavior: [FLOW-02](../FLOW/02-production-readiness.md) (binding), [FLOW-05](../FLOW/05-kpi-computation.md) (result) ·
> Status: 🟡 DRAFT.

**Coverage:** `KPI_FORMULA_SLOT`, `KPI_PARAMETERS`, `WORK_UNIT_KPI_BINDING`, `KPI_RESULT`
(F-07.1 §9) — rule D-1. `SCR-FND-KPI-004` (KPI Calculation) adds no new entity — a
view-only reflection of the same four, added under the existing Feature/Capability
"KPI Calculation" / "view KPI calculation breakdown" within this module.

## KPI item inside each domain group (PO decision, 2026-09-28)

KPIs are selected, bound and shown per domain ([F-07.1 §9.1](../DOCS-EN/07-1-kpi-tag-mapping.md#91-kpi_formula_slot)
`KPI_FORMULA_SLOT.domain`). Since 2026-09-28 the sidebar is grouped **by domain**
([UX 00 § App shell](00-ux.md#app-shell--sidebar-grouped-by-domain-po-decision-2026-09-28), [2026-09-28 decision](../../../LOGS/decisions/2026-09-28-work-master-per-domain-operation-uom.md)):
each MOM domain group holds a **KPI** item. This replaces the 2026-09-27 "KPI" sidebar group with one item
per domain.

| Domain group | KPI item opens | Filter |
|---|---|---|
| Production | `SCR-FND-KPI-002` | `KPI_FORMULA_SLOT.domain = production` |
| Maintenance | `SCR-FND-KPI-002` | `domain = maintenance` |
| Quality | `SCR-FND-KPI-002` | `domain = quality` |
| Inventory | `SCR-FND-KPI-002` | `domain = inventory` |

- Each KPI item opens the work-unit binding editor for that domain's slots only. The slot catalog (`SCR-FND-KPI-001`),
  result browser (`-003`) and KPI Calculation (`-004`) are sections of the per-KPI side panel on that page (below,
  2026-09-28) and keep the same domain filter — a Production page never lists another domain's slots or results.
- **Domain not licensed** ([F-07.1 K-9](../DOCS-EN/07-1-kpi-tag-mapping.md#whats-still-unknown), revised 2026-09-28):
  the domain group shows as **one locked heading** and its items, including KPI, are hidden. State and text:
  [UX 00 § App shell](00-ux.md#app-shell--sidebar-grouped-by-domain-po-decision-2026-09-28); upsell surface:
  [PLATFORM FLOW-01](../../PLATFORM/FLOW/01-module-entitlement-check.md),
  [PLT-01 core concept 3a](../../PLATFORM/DOCS-EN/01-license-manager.md#core-concepts).
- A licensed domain with no adopted KPI yet still shows its KPI item, which opens to the empty state (text
  below) — today that is Quality, Maintenance and Inventory for any tenant licensed for them.

## KPI page: cards, one side panel per KPI (PO decision, 2026-09-28)

Each KPI takes **different inputs**: Availability needs a status tag, Performance a counter plus a cycle
time, Rework ratio comes from job data with nothing to bind. One slot catalog page and one result page
covering every KPI did not fit that, so:

- **Removed:** the "KPI Formula Slots" and "KPI results" header buttons on the KPI page. The Cards /
  Diagram toggle stays.
- **Click a KPI card → side panel** (opens from the right, the page stays visible behind it) for **that KPI
  only**, in the work units of the current site / area / work center filter. Sections, top to bottom:

| # | Section | Shows | Was | Edits? |
|---|---|---|---|---|
| 1 | Formula | The F-07 formula and its slots (`KPI_FORMULA_SLOT`, this KPI only) | `SCR-FND-KPI-001` page | No — closed catalog (K-1); "suggest change" goes to the PO |
| 2 | Inputs | Per slot: where it comes from — a tag (`tag_role` + legal `transform`s from `KPI_PARAMETERS`) or job data ("nothing to bind") | `SCR-FND-KPI-001` / `-004` | No |
| 3 | Work units | One row per work unit: each bindable slot bound (tag + transform + detection method) or "not bound", with **Bind** on unbound slots → `SCR-FND-KPI-002` for that work unit + slot. **Reject quantity is a list (PO 2026-10-02):** one row per bound reject tag showing machine + reject reason, plus **+ Add reject tag**; Good and Total quantity stay one tag each. **Downtime interval is the same shape (K-13, 2026-10-02):** one main row (the timing method: direct tag, register bank, stall or range) plus a list of reason tags used to label stops (`reason_match_enrich`), from the primary or any secondary machine, with **+ Add reason tag** ([F-07.1 § more than one machine](../DOCS-EN/07-1-kpi-tag-mapping.md#more-than-one-machine-on-one-work-unit--the-bindings-decide-po-2026-10-02)). The unit conversion rule (`kpi-004.conversion.*`) shows here | `SCR-FND-KPI-004` | Only through **Bind** / **Edit binding** → `SCR-FND-KPI-002` |
| 4 | Latest result | Per work unit: latest `KPI_RESULT` value, `computed_at`, `is_stale`; "not computed" ≠ 0% | `SCR-FND-KPI-003` page | No |

- A KPI "worked out from job data" shows sections 1, 2 and 4; section 3 reads "Nothing to bind — this KPI
  comes from job data." A KPI "waiting on B5" shows sections 1–3 and section 4 reads the card's waiting text.
- The panel keeps the page's domain (one domain per page, below): a Production panel never lists another
  domain's slots or results.
- **Screen IDs stay.** `SCR-FND-KPI-001`, `-003` and `-004` are no longer separate pages; they are the panel
  sections above and keep their IDs, states and text keys (IDs are never reused, [UX 00](00-ux.md#id-grammar)).
  `SCR-FND-KPI-002` stays the page under the cards.
- **Unbound slot → declared tags.** "Not bound" with no tag declared for that machine links to the Tags page
  `SCR-FND-DSR-002` ([UX 13](13-data-source.md)) filtered to that machine.

| Key | Where / state | Text | Stories |
|---|---|---|---|
| `kpi-panel.section.formula` | Panel section 1 heading | "Formula" (draft) | US-FND-KPI-007 |
| `kpi-panel.section.inputs` | Panel section 2 heading | "Inputs" (draft) | US-FND-KPI-007 |
| `kpi-panel.section.work-units` | Panel section 3 heading | "Work units" (draft) | US-FND-KPI-002 |
| `kpi-panel.section.result` | Panel section 4 heading | "Latest result" (draft) | US-FND-KPI-007 |
| `kpi-panel.input.job-data` | Inputs row for a slot from job data | "From job data — nothing to bind" (draft) | US-FND-KPI-007 |
| `kpi-panel.work-units.none-to-bind` | Section 3, KPI from job data | "Nothing to bind — this KPI comes from job data." (draft) | US-FND-KPI-007 |
| `kpi-panel.slot.not-bound` | Section 3, unbound slot | "Not bound" + button "Bind" (draft) | US-FND-KPI-002 |
| `kpi-panel.slot.optional` | Section 3, unbound slot with `KPI_FORMULA_SLOT.required = false` (e.g. Speed check) | "Optional — not bound" + button "Bind" (draft, PO 2026-10-02). Never counted in the card's "\<n\> of \<m\> bound" | US-FND-KPI-002 |
| `kpi-panel.slot.no-tag` | Section 3, unbound slot and the machine has no tag for this role | "No tag declared for \<machine\>." + link "Declare a tag" → `SCR-FND-DSR-002` tag form, machine and role pre-filled ([UX 13 § Declaring a tag](13-data-source.md#declaring-a-tag-po-decision-2026-09-28)) (draft) | US-FND-KPI-002, US-FND-DSR-001 |
| `kpi-panel.result.not-computed` | Section 4, no `KPI_RESULT` yet | "Not computed yet" (draft) — never 0% | US-FND-KPI-007 |

## Screens

| SCR ID | Screen | Purpose | Entities (§9) | States worth noting | Stories |
|---|---|---|---|---|---|
| `SCR-FND-KPI-001` | Slot & parameters catalog — **panel sections 1–2 since 2026-09-28** (above), not a page | **Read-only** reference of the formula slots of the domain it was opened from (`KPI_FORMULA_SLOT.domain`, see the domain groups above), and which tag-role + transform combinations are legal — seeded, never implementor-writable (K-1 boundary) | `KPI_FORMULA_SLOT`, `KPI_PARAMETERS` | N/A offline: read-only reference; No-permission: explains the K-1 boundary and who owns changes | KR 2.1, serves `US-PROD-OEE-001` |
| `SCR-FND-KPI-002` | Work-unit binding editor — the KPI page under the cards; the panel's **Bind** opens it on one work unit + slot | Pick one legal combination per slot per work unit, with a worked preview (F-07.1 §9.4 pattern). Exception: `quality.reject` takes several tags, from any machine placed on the work unit, all summed (PO 2026-10-02). Shows one domain's slots — the domain group whose KPI item was opened (Production / Maintenance / Quality / Inventory) | `WORK_UNIT_KPI_BINDING` | Default: only `KPI_PARAMETERS`-legal combinations offered; Error: binding without a declared tag rejected, naming the tag; Access: site-scoped admin (or enterprise), same role model as every other FOUNDATION master-data screen — K-7 resolved | KR 2.1, serves OEE screens |
| `SCR-FND-KPI-003` | KPI result browser — **panel section 4 since 2026-09-28**, not a page | Inspect computed `KPI_RESULT` rows per work unit/shift | `KPI_RESULT` | Default: `computed_at` + `is_stale` always visible (freshness is never implied); Empty: "not computed" ≠ 0% | serves `US-PROD-OEE-003/005` |
| `SCR-FND-KPI-004` | KPI Calculation (view-only) — **panel section 3 since 2026-09-28**, not a page | For one KPI × work unit: show the F-07 formula, which tags feed each slot (`tag_role`/`transform`, F-07.1), and which downtime-detection method applies (direct tag, register bank, stall, or range) — a live read of existing config, not a hand-authored doc that can drift. **No create/edit anywhere on this screen** | `KPI_FORMULA_SLOT`, `KPI_PARAMETERS`, `WORK_UNIT_KPI_BINDING` (read-only) | Default: formula + per-slot tag/transform/detection method, read-only; Empty: any unbound bindable slot reads "not mapped yet," per slot — never blocks the rest of the page; Loading: skeleton, no stale numbers held as if fresh; Error: last successfully loaded breakdown stays visible, marked stale, with retry; Offline: last cached breakdown + offline marker; No-permission: explains the work unit's scope and who to contact, same pattern as `SCR-FND-KPI-002`; Success: n/a (view-only, no submit action) | Flow: [FLOW-05 §"Activity: user opens the KPI Calculation page"](../FLOW/05-kpi-computation.md#activity-user-opens-the-kpi-calculation-page-view-only) |

## State notes

- **One domain per page (PO, 2026-09-27).** The KPI screens always work inside the domain group they were
  opened from (above). A domain with no slots shows the empty state `kpi-002.empty.domain`, never a
  Production slot list.
- The catalog screen is deliberately read-only: formula ownership is F-07/F-07.1's; a
  "suggest change" affordance routes to the Product Owner, it does not edit.
- `SCR-FND-KPI-004` is deliberately view-only for a different reason than the catalog
  screen: it isn't a closed master (K-1/K-7 boundary) but a **derived read** of
  `WORK_UNIT_KPI_BINDING`, which is already implementor-editable on `SCR-FND-KPI-002`. This
  screen exists so nobody hand-writes a "how KPI X is calculated" doc that can drift from
  the actual binding — a change action here routes to `SCR-FND-KPI-002` (or, for the
  closed catalog itself, to `SCR-FND-KPI-001`/Product Owner), it never edits in place.

## Screen text

Rules: [UX 00 § Screen text](00-ux.md). Only the rows this decision needs; the rest of the KPI screens'
text is not written yet.

| Key | Where / state | Text | Stories |
|---|---|---|---|
| ~~`kpi-sidebar.group`~~ | **Retired 2026-09-28** — no KPI group any more; the item label is `nav-sidebar.item.kpi` ([UX 00](00-ux.md#app-shell--sidebar-grouped-by-domain-po-decision-2026-09-28)). Key not reused | — | US-FND-KPI-007 |
| ~~`kpi-sidebar.item.production`~~ | **Retired 2026-09-28** — replaced by group label `nav-sidebar.group.production`. Key not reused | — | US-FND-KPI-007 |
| ~~`kpi-sidebar.item.quality`~~ | **Retired 2026-09-28** — replaced by `nav-sidebar.group.quality`. Key not reused | — | US-FND-KPI-007 |
| ~~`kpi-sidebar.item.maintenance`~~ | **Retired 2026-09-28** — replaced by `nav-sidebar.group.maintenance`. Key not reused | — | US-FND-KPI-007 |
| ~~`kpi-sidebar.item.inventory`~~ | **Retired 2026-09-28** — replaced by `nav-sidebar.group.inventory`. Key not reused | — | US-FND-KPI-007 |
| `kpi-002.empty.domain` | Empty — this domain has no KPI slots yet | "No \<domain\> KPIs yet." (draft) | US-FND-KPI-007 |
| `kpi-002.error.quality-uom-mismatch` | `SCR-FND-KPI-002`, save refused — Quality tags of one work unit in different units (F-07.1 §9.4, PO 2026-09-28) | "Cannot save: the Quality tags on \<work unit\> must all use the same unit. \<tag\> is in \<unit A\>, \<tag\> is in \<unit B\>. Pick tags in one unit." (draft) | US-FND-KPI-007, US-FND-KPI-003 |
| `kpi-004.conversion.rule` | `SCR-FND-KPI-004`, Performance slot, counter unit ≠ standard's item unit — shows the **rule**, not live numbers | "Counter: \<counter unit\> → standard per \<item unit\>: ÷ \<factor\> (1 \<item unit\> = \<factor\> \<counter unit\>)" — e.g. "Counter: pack → standard per carton: ÷ 12 (1 carton = 12 pack)" (draft) | US-FND-KPI-008 |
| `kpi-004.conversion.product` | `SCR-FND-KPI-004`, which product the rule is for (PO, 2026-09-28, [decision](../../../LOGS/decisions/2026-09-28-work-master-per-domain-operation-uom.md)): the product **running now** on this work unit (resolved from its `product_code` tag); if nothing is running, the **last product run** | "Rule for \<product code\> — running now" / "Rule for \<product code\> — last run \<date time\>" (draft) | US-FND-KPI-008 |
| `kpi-004.conversion.missing` | `SCR-FND-KPI-004`, same slot, no conversion path | "Cannot be calculated: no \<counter unit\> ↔ \<item unit\> conversion for \<product code\>" (draft) | US-FND-KPI-008 |
| `kpi-002.empty.domain.note` | Empty — line under it | "Molca hasn't adopted a KPI for \<domain\> yet. Production KPIs are under Production." (draft) | US-FND-KPI-007 |

## Open questions

| # | Question | Owner |
|---|---|---|
| ~~UX-KPI-2~~ | ~~Domain groups on the KPI screens: show empty domains or hide them?~~ **Resolved 2026-09-27 (PO):** show them — and the split is in the **sidebar** (one item per domain), not groups on one page. Empty text drafted below. Refined the same day by K-9: only domains the tenant is entitled to are shown. **Superseded 2026-09-28:** sidebar grouped by domain; KPI is an item in each domain group, and an unlicensed domain shows as a locked group heading ([UX 00](00-ux.md#app-shell--sidebar-grouped-by-domain-po-decision-2026-09-28)) | — |
| ~~UX-KPI-1~~ | ~~Who may write `WORK_UNIT_KPI_BINDING` (K-7) — decides whether SCR-FND-KPI-002 is implementor-facing or PO-facing~~ **Resolved 2026-09-03 (PO), matching K-7 in [F-07.1](../DOCS-EN/07-1-kpi-tag-mapping.md#9-entity-specification): implementor-facing.** `SCR-FND-KPI-002` takes the site-scoped admin role already used across FOUNDATION (Site Hierarchy, Shift, Products, Reference Data) — no bespoke role, no PO gate. `SCR-FND-KPI-001` (the slot/parameter catalog) stays PO/`foundation-domain`-only, unaffected by this — that boundary was never in question. | — |
