# F-00.1 — Authorization permission catalog (ABAC illustrative encoding)

> Working spec (`foundation-domain`). Companion to
> [00-foundation.md](00-foundation.md#authorization-attribute-contract-abac--what-foundation-exposes-what-stays-in-the-idp)'s
> "Authorization attribute contract (ABAC)" section — read that section first.

**In short:** this file is the concrete catalog behind the `foundation:\<module_code\>:
\<scope_level\>:\<action\>` illustrative encoding — one row per real module/scope/action
combination, grounded in each module's own §9 entity specification. It is not a new
authorization model; it restates the resource-attribute FK chain and the fixed
`view`/`create`/`update`/`deactivate`/`import` action vocabulary that [00-foundation.md](00-foundation.md)
already declares, mapped onto the actual entities in each of FOUNDATION's 14 real modules
(12 as of this file's original writing, plus [Data Source](13-data-source.md), split out
2026-09-03, decision B7, and [Audit Trail](14-audit-trail.md), 2026-09-25 — whose read actions `audit_view` /
`audit_download` apply to every module, per owning module).

**2026-09-03 sweep — `import` added where the module's own text actually supports it.**
`import` is **not** added to every entity that has `create`; per
[00-foundation.md](00-foundation.md)'s ABAC section, it is its own action with a different
blast radius, and only entities whose own `DOCS-EN` file has explicit supporting text (a
named "list" open question, an explicit equivalence to another entity already treated as
ordinary bulk-loadable master data, or the ABAC section's own worked example) get a row.
Flat, code+name reference rows that are self-nesting taxonomies (e.g. `ASSET_CLASS`), have
explicit anti-bulk governance language (e.g. `MEASUREMENT_GROUP`), or are described only
via a single-row entry mechanism (e.g. `TIME_CONVERSIONS`'s quantity+unit picker) did not
get one — see the per-module notes below for what was checked and rejected.

## How to read this catalog

- **Scope level** is the node in the Site Hierarchy FK chain
  (`tenant → enterprise → site → area → work_center → work_unit`) that a given entity's
  own FK actually resolves to — read from that module's own §9, never guessed from the
  module's name.
- Where **create** differs from **view/update/deactivate**, it is because creating a
  child row requires access at the *parent's* level (you don't yet have the child's own
  ID to scope against), while acting on an existing row is scoped at its *own* level. Both
  are shown as separate columns when they differ.
- **Not every action applies to every entity.** An entity with no `valid_from`/`valid_to`
  (or equivalent versioning field) in its own §9 spec cannot support `deactivate` as a
  first-class action — this is called out per row, not papered over, per
  [00-foundation.md](00-foundation.md) rule 3 (never hard-delete) colliding with a real
  spec gap in a few modules below.
- **`TBD` rows never invent a scope level, entity, or field.** Where a module's own doc
  doesn't yet support an answer, the row says exactly what's missing and who owns
  resolving it, per [`../../../AGENTS.md`](../../../AGENTS.md) §5 rule 5.
- This catalog is illustrative shorthand for PRD stories, same disclaimer as
  [00-foundation.md](00-foundation.md): the literal string format an actual IDP
  integration uses is `engineering-domain`'s call, not FOUNDATION's.

---

## Site Hierarchy (`SIT`) — [01-site-hierarchy.md](01-site-hierarchy.md) §9

Six fixed levels, one table per level, each with its own FK to its parent — `create` is
therefore always scoped to the **parent** level, `view`/`update`/`deactivate` to the
entity's **own** level.

| Module | Entity | Scope level(s) | Applicable actions | Example permission string |
|---|---|---|---|---|
| SIT | `TENANT` | `tenant` (own level; no FOUNDATION-owned parent above it) | `view`, `update`, `deactivate`. `create` is `TBD` — tenant creation/onboarding is a platform-level concern (the reverted PLATFORM domain work touched this); not modeled here | `foundation:sit:tenant:update` |
| SIT | `ENTERPRISE` | create: `tenant` · view/update/deactivate: `enterprise` | `view`, `create`, `update`, `deactivate` (has `valid_from`/`valid_to`, §9.2) | `foundation:sit:enterprise:update` |
| SIT | `SITE` | create: `enterprise` · view/update/deactivate: `site` | `view`, `create`, `update`, `deactivate` (§9.3) | `foundation:sit:site:update` |
| SIT | `AREA` | create: `site` · view/update/deactivate: `area` | `view`, `create`, `update`, `deactivate` (§9.4) | `foundation:sit:area:update` |
| SIT | `WORK_CENTER` | create: `area` · view/update/deactivate: `work_center` | `view`, `create`, `update`, `deactivate` (§9.5) | `foundation:sit:work_center:update` |
| SIT | `WORK_UNIT` | create: `work_center` · view/update/deactivate: `work_unit` | `view`, `create`, `update`, `deactivate` (§9.6) | `foundation:sit:work_unit:update` |
| SIT | `SITE_CLASS` / `AREA_CLASS` / `WORK_CENTER_CLASS` / `WORK_UNIT_CLASS` | `tenant` — these four cross-cutting lookups (§9.7–§9.10) carry no FK to the Site Hierarchy tree at all (flat `code`/`name`), the same "no FK → resolves upward" rule 00-foundation.md's ABAC section states | `view`, `create`, `update`, `deactivate` (all four have `valid_from`/`valid_to`) | `foundation:sit:tenant:update` |

**`import` checked, not added anywhere in this module.** `TENANT`/`ENTERPRISE`/`SITE`/
`AREA`/`WORK_CENTER`/`WORK_UNIT` are hierarchical, each requiring its parent's ID to be
declared first (§9.1–§9.6) — [01-site-hierarchy.md](01-site-hierarchy.md) never describes
bulk-declaring a level, and S-1's resolution ("2 sites for launch, one with 2 areas, one
with 4") reads as a handful of individually-declared rows, not a CSV load. The four
`*_CLASS` lookups (§9.7–§9.10) are flat `code`/`name`, but their only open question (S-5,
"what groupings does the floor/PO actually need") asks what values should exist at all,
not how a settled list would be loaded — no "list"/CSV/bulk language exists for them the
way it does for `DOWNTIME_REASON`/`REJECT_REASON` below (the old `QUALITY_DEFECT_CODE` merged into `REJECT_REASON` 2026-09-23), so they stay `create`-only,
not `import`, until the module's own text says otherwise.

## Calendar & Shift (`SHF`) — [02-shift.md](02-shift.md) §9

| Module | Entity | Scope level(s) | Applicable actions | Example permission string |
|---|---|---|---|---|
| SHF | `ENTERPRISE_SHIFT` | `enterprise` (own level for all actions — `enterprise_id` FK, §9.1) | `view`, `create`, `update`, `deactivate` (has `valid_from`/`valid_to`) | `foundation:shf:enterprise:create` |
| SHF | `SITE_SHIFT` | `site` (own level for all actions — `site_id` FK, §9.2; every site must declare one row per `ENTERPRISE_SHIFT`, so `create` is also site-scoped, not enterprise-scoped, since the enterprise-level identity already exists) | `view`, `create`, `update`, `deactivate` (has `valid_from`/`valid_to`; "a closed shift is final" — corrections are signed adjustments, not free edits to a closed row) | `foundation:shf:site:update` |
| SHF | `SHIFT_INSTANCE` | `site` (inherited via `site_shift_id → SITE_SHIFT.site_id`, §9.3 — no direct `site_id` field) | `view` only, from FOUNDATION's own scope. `create` is **not a normal admin action** — generation is daily/automatic, mechanism owned by `production-domain` (H-6). `update`/`deactivate` — `TBD`: §9.3 has no `valid_from`/`valid_to`, only a `status` enum (`open`/`closed`, "full value list is `TBD`"); closing/correcting a shift instance is core concept 7's "signed adjustment," not a plain field update, and its owner (FOUNDATION admin vs `production-domain`) is not stated in §9.3 | `foundation:shf:site:view` |

**`import` checked, not added anywhere in this module.** `ENTERPRISE_SHIFT` is a small,
named set declared once ("Shift 1"/"Shift 2"/"Shift 3" — core concept 1, H-1 resolved at 3
rows), not a list a plant loads via file. `SITE_SHIFT` is mandatory-adoption but
individually time-declared per site ("Site JKT1 runs Shift 1: 07:00–15:00" — core concept
1) — [02-shift.md](02-shift.md) never mentions loading many `SITE_SHIFT` rows from a file,
and its overlap-validation rule (§9.2, resolved 2026-09-02) is written for one row being
declared/edited at a time. `SHIFT_INSTANCE` is generated automatically, not admin-declared
at all (H-6) — a transactional/generated row, the module's own "poor candidate" shape.

## Yearly & Quarterly Declaration (`FYR`) — [03-yearly-quarterly-declaration.md](03-yearly-quarterly-declaration.md) §9

Confirmed by reading §9.1 directly, not assumed: `FISCAL_YEAR` carries only an
`enterprise_id` FK ("No `site_id` — enterprise-level only (Y-2)"). Y-2 is resolved ("no
site override needed — enterprise-level always"), so this is genuinely enterprise-only,
not a gap.

| Module | Entity | Scope level(s) | Applicable actions | Example permission string |
|---|---|---|---|---|
| FYR | `FISCAL_YEAR` | `enterprise` (own level for all actions — no narrower level exists, Y-2 resolved) | `view`, `create`, `update`, `deactivate` (has `valid_from`/`valid_to`, §9.1; "a past, already-closed fiscal year is never edited" — a correction closes the old row and opens a new one, same as any other FOUNDATION master) | `foundation:fyr:enterprise:view` |

**`import` checked, not added.** One `FISCAL_YEAR` row declares one enterprise's one
reporting year (start/end + quarter pattern) — [03-yearly-quarterly-declaration.md](03-yearly-quarterly-declaration.md)
describes it as a single configuration decision made per enterprise per year ("a mode
switch," "the user picks the week-anchored start/end date"), never a list of rows loaded
at once. No good `import` candidate in this module.

## Equipment Taxonomy (`AST`) — [04-asset-ontology.md](04-asset-ontology.md) §9

| Module | Entity | Scope level(s) | Applicable actions | Example permission string |
|---|---|---|---|---|
| AST | `ASSET_CLASS` | `tenant` — §9.2 has no FK to Site Hierarchy at all, only a self-referencing `parent_class_id` | `view`, `create`, `update`, `deactivate` (has `valid_from`/`valid_to`) | `foundation:ast:tenant:create` |
| AST | `ASSET_TYPE` | `tenant` — §9.3 FKs only to `ASSET_CLASS`, no Site Hierarchy FK | `view`, `create`, `update`, `deactivate` (has `valid_from`/`valid_to`) | `foundation:ast:tenant:update` |
| AST | `ASSET` | **create:** `tenant`/`site` at registration time — `site_id` is no longer a writable field on `ASSET` (B6, 2026-09-03), so `create`'s scope is `TBD`: how a not-yet-placed asset gets registered against a site is A-10, open. **view/update/deactivate:** derived from the asset's current `ASSET_PLACEMENT` row (§9.4, §9.6) — `work_unit` if an active placement exists (a multi-lane machine has several, F-04 §9.6, 2026-09-25: `view` needs scope on **any** of them; `update`/`deactivate` need scope on **all** of them, since the change reaches every lane), else `TBD` per A-10 | `view`, `create`, `update`, `deactivate` (has `valid_from`/`valid_to`) | `foundation:ast:work_unit:view` |
| AST | `ASSET_PLACEMENT` | `work_unit` (own level — `work_unit_id` FK, §9.6). **This is now the only authoritative source of an asset's location for scope resolution** (B6, 2026-09-03) — do not read `ASSET`'s old inline `work_unit_id`, it no longer exists | `view`, `create`, `update`, `deactivate` (a move closes the old row and opens a new one, per §9.6 — same effective-dating shape as `valid_from`/`valid_to` even though the field pair isn't spelled out in a table) | `foundation:ast:work_unit:create` |
| AST | `ASSET_TAGS` | `work_unit` — inherited via `asset_id`'s current `ASSET_PLACEMENT.work_unit_id` (§9.7, redirected from `ASSET.site_id` per B6). **Multi-lane machine (several active placements, F-04 §9.6, 2026-09-25):** the tag's own `ASSET_TAGS.work_unit_id` | `view`, `create`, `update`, `deactivate` (has `valid_from`/`valid_to`; "a tag mapping is rewired, not overwritten") | `foundation:ast:work_unit:update` |
| AST | `ASSET_PRODUCT_CODES` | `work_unit` — inherited via `tag_id → ASSET_TAGS.asset_id`'s current `ASSET_PLACEMENT.work_unit_id` (§9.7, redirected from `ASSET.site_id` per B6); for a multi-lane machine, via `tag_id → ASSET_TAGS.work_unit_id` | `view`, `create`, `update`, `deactivate` (has `valid_from`/`valid_to`) | `foundation:ast:work_unit:update` — **checked at site scope for now** (the app models ABAC scope at site level only); work-unit scope later (PO, 2026-10-02, prd-molcadx#24 item 7) |
| ~~AST~~ | ~~`ASSET_STATE_LOG`~~ | **Moved to PRODUCTION 2026-09-28** ([decision 2026-09-28](../../../LOGS/decisions/2026-09-28-asset-status-ownership.md), resolving B5/P-4) — not a FOUNDATION entity. Its permission row belongs in [PRODUCTION Monitoring](../../PRODUCTION/DOCS/02-monitoring.md). No `foundation:ast:*` string was ever assigned to it, so none is retired or freed; the existing `foundation:ast:*` strings stay with the other AST entities and are never reused for it | — | — |

**`import` checked, not added anywhere in this module.** `ASSET_CLASS`/`ASSET_TYPE` (§9.2–§9.3)
look like classic flat reference rows but are **deliberately not flat** — `ASSET_CLASS`
self-nests (`parent_class_id`, "so the taxonomy can be refined without splitting
entities"), unlike Site Hierarchy's genuinely flat `*_CLASS` lookups, and the module's only
open question about them (A-1, "what are the real `ASSET_CLASS` and `ASSET_TYPE` values")
asks what the taxonomy should contain, not how a settled list would be bulk-loaded — no
CSV/list/bulk language anywhere in [04-asset-ontology.md](04-asset-ontology.md) for either.
`ASSET`/`ASSET_PLACEMENT`/`ASSET_TAGS`/`ASSET_PRODUCT_CODES` are per-instance,
effective-dated registrations tied to one physical machine, tag, or placement at a time —
the module's own "poor candidate" shape (deeply relational, versioned, not a code+name
list). `ASSET_STATE_LOG` is PRODUCTION's (2026-09-28), not in this catalog. `ASSET_COMPONENT_LINK` moved to the Maintenance domain 2026-09-10 — its permission row
now lives in [`MAINTENANCE/DOCS-EN/01-asset-history.md`](../../MAINTENANCE/DOCS-EN/01-asset-history.md#authorization).

## Reference & Master Data (`REF`) — [05-reference-master-data.md](05-reference-master-data.md) §9

| Module | Entity | Scope level(s) | Applicable actions | Example permission string |
|---|---|---|---|---|
| REF | `DOWNTIME_REASON` | `tenant` — §9.1 has no FK to Site Hierarchy at all (flat `code`/`name`) | `view`, `create`, `update`, `deactivate` (uses `deleted_at`, not `valid_from`/`valid_to` — same deactivation intent, different field name; §9.1), **`import`** — see justification below the table | `foundation:ref:tenant:import` |
| REF | `REJECT_REASON` | `tenant` — same shape as `DOWNTIME_REASON`, no category field, §9.1 | `view`, `create`, `update`, `deactivate` (`deleted_at`), **`import`** — see justification below the table | `foundation:ref:tenant:import` |
| REF | `DOWNTIME_REASON_ASSET` | `work_unit` — inherited via `asset_id`'s current `ASSET_PLACEMENT.work_unit_id` ([Equipment Taxonomy §9.6](04-asset-ontology.md), redirected from `ASSET.site_id` per B6, 2026-09-03, since that field is no longer writable); the join table itself carries no Site Hierarchy FK | `view`, `create`, `deactivate` (`deleted_at`). `update` — `TBD`: §9.2 lists only denormalized display fields (`downtime_code`, `asset_tag`) alongside the two FKs; no field on the join row itself is described as editable in place. No `import` — this join scopes a reason to one specific asset, not a flat setup list; §9.2 never describes bulk-declaring the join | `foundation:ref:work_unit:create` |
| REF | `REJECT_REASON_ASSET` | `work_unit` — inherited via `asset_id`'s current `ASSET_PLACEMENT.work_unit_id`, same shape as `DOWNTIME_REASON_ASSET` (redirected from `ASSET.site_id` per B6) | `view`, `create`, `deactivate` (`deleted_at`). `update` — same `TBD` as `DOWNTIME_REASON_ASSET`. No `import`, same reasoning as `DOWNTIME_REASON_ASSET` | `foundation:ref:work_unit:create` |
| REF | `TIME_CONVERSIONS` | `tenant` — §9.3 has no Site Hierarchy FK | `view`, `create`, `update`. `deactivate` — `TBD`: §9.3's own field table lists only `time_conversions_id`/`code`/`name`/`seconds_per_unit` — **no `valid_from`/`valid_to`/`deleted_at` field at all**, even though §9.5's "Rules" section states the never-hard-delete rule applies to "any of the entities above." This is a spec gap between §9.3's table and §9.5's rule text — `foundation-domain` needs to add the missing versioning field before `deactivate` can be a real action. No `import` — see justification below the table | `foundation:ref:tenant:update` |
| REF | `MEASUREMENT_GROUP` | `tenant` — §9.4 has no Site Hierarchy FK | `view`, `create`, `update`, `deactivate` (has `valid_from`/`valid_to`). Note: adding a new row here is explicitly a governed, `foundation-domain`-reviewed change, not ordinary master-data maintenance — same weight as a new `tag_role` value, per §9.4's own text. No `import` — see justification below the table | `foundation:ref:tenant:create` |
| REF | `UNIT_OF_MEASUREMENTS` | `tenant` — §9.4 FKs only to `MEASUREMENT_GROUP`, no Site Hierarchy FK | `view`, `create`, `update`. `deactivate` — `TBD`: §9.4's field table (`uom_id`/`code`/`name`/`unit`/`measurement_group_id`) has **no `valid_from`/`valid_to`/`deleted_at` field**, the same gap as `TIME_CONVERSIONS` above — `foundation-domain` to confirm and add. **`import`** — see justification below the table | `foundation:ref:tenant:import` |

**`import` justifications, this module:**

- **`DOWNTIME_REASON` / `REJECT_REASON` — added.** §9.2's open question T-1 ("What are
  the real `DOWNTIME_REASON` and `REJECT_REASON` lists used today?... must come from
  `ops-domain`") names both entities' content as a *list* to be supplied wholesale, and
  [00-foundation.md](00-foundation.md)'s own ABAC worked example cites "a UOM or
  downtime-reason list" as the illustrative `import` case. Both are flat `code`/`name`
  with no Site Hierarchy FK — the "codes+names loaded once during setup" shape.
  `TBD — foundation-domain: does import for DOWNTIME_REASON/REJECT_REASON insert-only or
  upsert-by-code?`
- **`UNIT_OF_MEASUREMENTS` — added.** §9.4's own text equates adding a row here to
  "ordinary master-data maintenance... the same as adding a new `DOWNTIME_REASON`," and
  00-foundation.md's ABAC example separately names "a UOM... list" as the `import`
  illustration. Flat `code`/`name`/`unit`, only FK is `measurement_group_id`.
  `TBD — foundation-domain: does import for UNIT_OF_MEASUREMENTS insert-only or
  upsert-by-code (e.g. re-uploading a UOM list to correct existing rows)?`
- **`TIME_CONVERSIONS` — checked, not added.** Same flat shape as `UNIT_OF_MEASUREMENTS`,
  but §9.3 describes declaring a row through a specific single-record mechanism, not a
  loadable list: "a plant admin creating or editing a `TIME_CONVERSIONS` row picks a
  quantity and one of a small, fixed set of base time units... the screen computes
  `seconds_per_unit`" — the persisted value is always derived from that one-row
  quantity+unit picker, never typed or loaded directly. No T-x open question calls this
  entity's content a "list" the way T-1 does for the two reason tables. No good basis for
  `import` in this module's own text.
- **`MEASUREMENT_GROUP` — checked, not added.** §9.4 explicitly says the opposite of a
  self-service bulk load: "Adding a new `MEASUREMENT_GROUP` row is not [ordinary
  maintenance] — it's a governed, `foundation-domain`-reviewed addition... because two
  plants disagreeing on what counts as one dimension breaks the one thing this table
  exists to guarantee." A governed, reviewed, one-at-a-time addition is the opposite of an
  `import` candidate.
- **`DOWNTIME_REASON_ASSET` / `REJECT_REASON_ASSET` — checked, not added.** These are join
  rows scoping one reason to one specific `asset_id` (§9.2) — a relational, per-asset
  decision, not a flat setup list; nothing in this module describes bulk-declaring the
  join itself (only the parent reason lists, T-1, which is the entities already covered
  above).

## Product (`PRO`) — [06-product.md](06-product.md) §9

**Finding, not an assumption:** none of the entities below (three live, `PRODUCT_CYCLE` retired 2026-09-28) carry any FK to Site
Hierarchy or to `TENANT`/`ENTERPRISE` in their §9 field tables. Per
[00-foundation.md](00-foundation.md)'s ABAC rule ("no site/area/work-unit FK... resolves to
`enterprise` or `tenant` scope — never no scope"), the broadest available default is
`tenant`, but this module's own doc never actually says whether Product identity is meant
to be tenant-global or per-enterprise. Marked `TBD` below rather than assumed.

| Module | Entity | Scope level(s) | Applicable actions | Example permission string |
|---|---|---|---|---|
| PRO | `PRODUCT` | `TBD` — no `tenant_id`/`enterprise_id` FK in §9.1 at all; defaulting to `tenant` per the ABAC "no FK" rule, but whether Product should instead be enterprise-scoped is unconfirmed — `foundation-domain`/PO to decide | `view`, `create`, `update`, `deactivate` (has `valid_from`/`valid_to`, §9.1) | `foundation:pro:tenant:create` |
| PRO | `PRODUCT_DETAIL` | `TBD` — inherits `PRODUCT`'s same open scope question (1:1 via `product_id`, §9.2) | `view`, `create`, `update`, `deactivate` (has `valid_from`/`valid_to`) | `foundation:pro:tenant:update` |
| ~~PRO~~ | ~~`PRODUCT_CYCLE`~~ | **Retired 2026-09-28** — entity retired ([06-product.md §9.3](06-product.md#93-product_cycle--retired-2026-09-28)); cycle time is edited on Work Master's `OPERATION` (WMS row). The `foundation:pro:*` strings stay in use by the other PRO entities; none is freed or reused | — | — |
| PRO | `PRODUCT_UOM_CONVERSION` | `TBD` — inherits `PRODUCT`'s same open scope question (§9.4) | `view`, `create`, `update`, `deactivate` (has `valid_from`/`valid_to`) | `foundation:pro:tenant:update` |

**`import` checked, not added anywhere in this module.** None of the entities is a
flat, code+name lookup — `PRODUCT` carries physical/UOM identity fields beyond `code`/
`name` (§9.1), and `PRODUCT_DETAIL`/`PRODUCT_UOM_CONVERSION` are all 1:1
or per-UOM-per-product child rows with their own effective-dating (§9.2–§9.4).
[06-product.md](06-product.md) never mentions loading a product catalog, a list, a CSV, or
onboarding many products at once — every worked example describes one product's own
attributes. No good `import` candidate found in this module's own text.

## KPI (`KPI`) — [07-1-kpi-tag-mapping.md](07-1-kpi-tag-mapping.md) §9

| Module | Entity | Scope level(s) | Applicable actions | Example permission string |
|---|---|---|---|---|
| KPI | `KPI_FORMULA_SLOT` | **N/A — not scoped to any Site Hierarchy node at all.** A fixed, seeded, global catalog (§9.1) shared by every tenant, not per-tenant/per-site data | **No `create`/`update`/`deactivate` for a normal admin, at any scope, ever.** Resolved K-7 (confirming K-1): only `foundation-domain`/PO changes this catalog, and that happens as a doc/schema change, not through an ABAC-gated admin screen. `view` is the only in-product action, available to any authenticated scope | not a permission string — no ABAC-gated write action exists for this entity |
| KPI | `KPI_PARAMETERS` | Same as `KPI_FORMULA_SLOT` — global, seeded catalog (§9.3) | Same as `KPI_FORMULA_SLOT`: `view` only in-product; no admin `create`/`update`/`deactivate` at any scope (K-7, confirming K-1) | not a permission string — no ABAC-gated write action exists for this entity |
| KPI | `WORK_UNIT_KPI_BINDING` | `work_unit` (own level — `work_unit_id` FK, §9.4). Resolved K-7: "ordinary FOUNDATION admin role, scoped to the site owning that work unit (or enterprise scope)" — i.e. a `site`- or `enterprise`-level IDP claim that covers the binding's `work_unit_id` also satisfies this | `view`, `create`, `update`, `deactivate` (has `valid_from`/`valid_to`; "a rebind never corrupts history") | `foundation:kpi:work_unit:update` |
| KPI | `KPI_RESULT` | `work_unit` (own level — `work_unit_id` FK, §9.5) | `view` only, within FOUNDATION's scope — per this task's own note and §9.5's text, `production-domain` (the calc job) is the writer; FOUNDATION does not gate a `create`/`update`/`deactivate` action on this entity. No `valid_from`/`valid_to` either — it's a computed result row, not master data, so `deactivate` would not apply even if FOUNDATION did write it | `foundation:kpi:work_unit:view` |

**Domain (2026-09-27).** `KPI_FORMULA_SLOT.domain` ([§9.1](07-1-kpi-tag-mapping.md#91-kpi_formula_slot)) adds **no permission of its own**: the KPI item inside each of the four domain sidebar groups (Production / Maintenance / Quality / Inventory, [UX 07](../UX/07-kpi.md), regrouped 2026-09-28) use the rows above unchanged — `foundation:kpi:<scope>:…` on the work unit's scope, whatever the domain. Entitlement is a separate check, not a permission: a domain the tenant isn't entitled to shows as **one locked group heading**, its items (KPI included) hidden (PLATFORM License Manager, [PLT-01 core concept 3a](../../PLATFORM/DOCS-EN/01-license-manager.md#core-concepts); [F-07.1 K-9](07-1-kpi-tag-mapping.md#whats-still-unknown), resolved 2026-09-27, revised 2026-09-28).

**`import` checked, not added anywhere in this module.** `KPI_FORMULA_SLOT`/
`KPI_PARAMETERS` are never implementor-writable at any scope, by any action (K-1/K-7) —
`import` doesn't apply to an entity with no admin write action at all. `WORK_UNIT_KPI_BINDING`
is "the pick, per work unit" (§9.4) — a deeply relational row (FKs into `WORK_UNIT`,
`KPI_FORMULA_SLOT`, `ASSET_TAGS`, validated against live placement) resolved one work unit
at a time; [07-1-kpi-tag-mapping.md](07-1-kpi-tag-mapping.md) describes it as "a normal
site-scoped master-data edit" (K-7), never a bulk load, and its worked example walks
through binding one work unit's slots individually. `KPI_RESULT` is a computed,
`production-domain`-written row, not master data. No good `import` candidate in this
module.

## Work Master (`WMS`) — [08-work-master.md](08-work-master.md) §9

| Module | Entity | Scope level(s) | Applicable actions | Example permission string |
|---|---|---|---|---|
| WMS | `ROUTING` | `work_center` (own level — `work_center_id` FK, §9.1) | `view`, `create`, `update`, `deactivate` (has `valid_from`/`valid_to`) | `foundation:wms:work_center:create` |
| WMS | `OPERATION` | `work_unit` (own level — `work_unit_id` FK, §9.2) | `view`, `create`, `update`, `deactivate` (has `valid_from`/`valid_to`; "a change closes the old row and opens a new one") | `foundation:wms:work_unit:update` |
| WMS | `BOM` | `TBD` — §9.3 FKs only to `product_id`; inherits `PRODUCT`'s own open scope question from the Product module above (no direct Site Hierarchy FK on `BOM` itself) | `view`, `create`, `update`, `deactivate` (has `valid_from`/`valid_to`; ranges must not overlap for the same product) | `foundation:wms:tenant:create` |
| WMS | `BOM_LINE` | `TBD` — same inherited scope question as `BOM` (§9.4, FKs to `bom_id`/`component_product_id` only) | `view`, `create`, `update`. `deactivate` — `TBD`: §9.4's field table has no `valid_from`/`valid_to` of its own (versioning happens at the parent `BOM` level, per §9.3's note that a locked BOM gets a new version rather than an edited line) | `foundation:wms:tenant:create` |
| ~~WMS~~ | ~~`QUALITY_DEFECT_CODE`~~ | **Retired 2026-09-23** — merged into `REJECT_REASON`; permissions are the REF `REJECT_REASON` row (tenant, incl. `import`) | — | — |

**`WORK_ORDER`/`WORK_ORDER_OPERATION` removed from this table, 2026-09-03.** Both entities
moved to domain PRODUCTION (structural decision, contest review) — they no longer have a
FOUNDATION §9 spec to read a scope level from. Their ABAC rows, including the still-open
`site_id`/scope question (former P-2 below) and the deactivate-shape `TBD`, are now
`production-domain`'s to define in its own ABAC-equivalent documentation, not repeated here.

**`import` checked, not added on `ROUTING`/`OPERATION`/`BOM`/`BOM_LINE`.**
`ROUTING`/`OPERATION` are effective-dated, per-work-center/per-work-unit steps with
standards attached (§9.1–§9.2) — deeply relational, not a flat list; nothing in
[08-work-master.md](08-work-master.md) describes loading many routing steps from a file.
`BOM`/`BOM_LINE` are product-specific structures with non-overlap constraints across
versions (§9.3–§9.4) — same reasoning.

## Data Source (`DSR`) — [13-data-source.md](13-data-source.md) §9

New module, 2026-09-03 (decision B7).

| Module | Entity | Scope level(s) | Applicable actions | Example permission string |
|---|---|---|---|---|
| DSR | `DATA_SOURCE` | `site` — **narrowed from `tenant` to `site` by PO decision, 2026-09-04 (resolves H-DS-4).** §9.1 now carries a required `site_id` FK ([13-data-source.md §9.1](13-data-source.md#91-data_source--one-connectionendpoint)): a PLC/OPC UA server/MQTT broker is physically wired into one site, so tenant-level scope was over-broad — it let the scope claim reach every site under a tenant even though a single connection can never serve more than one site. A single connection can still serve tags across more than one `WORK_UNIT`/`WORK_CENTER` *within* that site, so scope does not narrow further to `work_unit` | `view`, `create`, `update`, `deactivate` (has `valid_from`/`valid_to`) | `foundation:dsr:site:update` |

**`import` checked, not added.** `DATA_SOURCE` is a handful of connection endpoints (one per
PLC/broker), not a bulk-loadable list — [13-data-source.md](13-data-source.md) describes no
"list"/CSV language for it.

## Audit Trail (`AUD`) — [14-audit-trail.md](14-audit-trail.md) §9

New module, 2026-09-25 (PO decision); scope widened the same day to **the whole system**.
`AUDIT_LOG` rows are **written only by the system**, in the same transaction as the change they
describe ([14-audit-trail.md §9.2](14-audit-trail.md#92-rules)). No user can create, edit,
deactivate or import an audit row at any scope.

**Reading is authorized per owning module, not per `AUD`.** Every audit row carries the
`domain_code` + `module_code` of the entity it describes
([14-audit-trail.md §9.1](14-audit-trail.md#91-audit_log--one-append-only-row-per-change)).
The permission is:

> `<domain>:<module>:<scope>:audit_view` — read that module's audit rows (History capability,
> Audit log feature)
> `<domain>:<module>:<scope>:audit_download` — download them

`<domain>` is the permission prefix (`foundation`, `production`, `maintenance`, …), `<module>`
the lower-case PRD module code, `<scope>` the row's snapshotted `scope_level` (taken at write
time, not the record's current location). A claim at a broader level covers rows snapshotted
below it. Both actions are **separate from `view` on the record itself** (AU-8): seeing a `SITE`
does not mean seeing who edited it.

**The Audit log feature (`AUD`) has no permission of its own.** It searches across modules but
returns only rows whose `module_code` the subject holds `audit_view` for; a download contains
only rows the subject holds `audit_download` for. Who may read the `download` rows themselves is
open (AU-13).

| Module | Entity | Scope level(s) | Applicable actions | Example permission string |
|---|---|---|---|---|
| every FOUNDATION module (`SIT`, `SHF`, `FYR`, `AST`, `REF`, `PRO`, `KPI`, `WMS`, `DSR`, …) | `AUDIT_LOG` rows with `domain_code = FND` and that `module_code` | The row's `scope_level` — whatever that module's entity resolves to in the tables above | `audit_view`, `audit_download` | `foundation:sit:site:audit_view` · `foundation:wms:work_unit:audit_download` |
| PRODUCTION modules (e.g. `PLN`) | `AUDIT_LOG` rows with `domain_code = PROD` | As resolved by `production-domain` for its entity; `tenant` until then | `audit_view`, `audit_download` | `production:pln:site:audit_view` |
| MAINTENANCE modules (`AST`, `WMS`) | `AUDIT_LOG` rows with `domain_code = MNT` | As resolved by `maintenance-domain` for its entity | `audit_view`, `audit_download` | `maintenance:wms:tenant:audit_view` |
| AUD | `AUDIT_LOG` — write | — | **No `create`/`update`/`deactivate`/`import` for anyone, at any scope, ever.** Append-only, system-written | not a permission string — no ABAC-gated write action exists |
| AUD | Audit log feature | — | No permission of its own — filters by the per-module `audit_view` above | — |

**PRODUCTION and MAINTENANCE have no permission catalog of their own yet.** Their strings follow
the same `<domain>:<module>:<scope>:audit_view` / `:audit_download` pattern; each domain lists
its real rows when it writes its catalog. The scope level in the examples above is illustrative
until then.

**`import` checked, not added.** Audit rows are never loaded from a file — an imported audit
row would be evidence nobody can vouch for.

## Workflow Engine (`WFE`), Notification (`NTF`), Integration (`INT`), Configuration Service (`CFG`)

These four modules are concept-only — [09-workflow-engine.md](09-workflow-engine.md),
[10-notification.md](10-notification.md), [11-integration.md](11-integration.md), and
[12-configuration-service.md](12-configuration-service.md) all state "not modeled yet" in
[00-foundation.md](00-foundation.md)'s own module table, and none has a §9 entity
specification to read an FK chain from.

| Module | Entity | Scope level(s) | Applicable actions | Example permission string |
|---|---|---|---|---|
| WFE | (none modeled) | `TBD — foundation-domain: scope level undetermined, no entity spec exists yet` | `TBD` | — |
| NTF | (none modeled) | `TBD — foundation-domain: scope level undetermined, no entity spec exists yet` | `TBD` | — |
| INT | (none modeled) | `TBD — foundation-domain: scope level undetermined, no entity spec exists yet` | `TBD` | — |
| CFG | (none modeled) | `TBD — foundation-domain: scope level undetermined, no entity spec exists yet` | `TBD` | — |

This is expected and correct given each module's current status, not a gap in this
catalog — a scope level cannot be read off an entity spec that doesn't exist yet. Revisit
this section once any of these four modules gets a real §9.

## Open questions surfaced while building this catalog

| # | Question | Owner |
|---|---|---|
| P-1 (new) | Is `PRODUCT` (and everything that FKs into it — `PRODUCT_DETAIL`, `PRODUCT_UOM_CONVERSION`, `BOM`, `BOM_LINE`) meant to be tenant-global or per-enterprise scoped? No FK exists in §9 of either [06-product.md](06-product.md) or [08-work-master.md](08-work-master.md) to answer this | `foundation-domain` / PO |
| ~~P-2~~ | ~~Does `WORK_ORDER` need a direct `site_id` FK, given its own text says `wo_number` is "unique within the site" but the field table has no such field?~~ **Moot as of 2026-09-03** — `WORK_ORDER` moved to domain PRODUCTION (structural decision, contest review); this question travels with it, no longer a FOUNDATION open item. | `production-domain` |
| P-3 (new) | `TIME_CONVERSIONS` and `UNIT_OF_MEASUREMENTS` ([05-reference-master-data.md §9.3–§9.4](05-reference-master-data.md)) have no `valid_from`/`valid_to`/`deleted_at` field in their own tables, despite §9.5's rule that no entity in that file is hard-deleted. Which is correct — add the field, or is deactivation genuinely not needed for these two? | `foundation-domain` |
| ~~P-4~~ | ~~`ASSET_STATE_LOG` — module table vs F-04 text disagreed about its owner.~~ **Resolved 2026-09-28 ([decision 2026-09-28](../../../LOGS/decisions/2026-09-28-asset-status-ownership.md)): owner = PRODUCTION.** Module table fixed; FOUNDATION does not specify it | — |
| P-5 (new) | `TENANT` creation/onboarding — is this a FOUNDATION admin action at all, or entirely a platform-level concern outside this model? | `foundation-domain` / PO |
| P-6 (new, 2026-09-03 `import` sweep) | For each entity that gained an `import` row (`DOWNTIME_REASON`, `REJECT_REASON`, `UNIT_OF_MEASUREMENTS`, `QUALITY_DEFECT_CODE`): does a re-upload insert-only (reject rows whose `code` already exists) or upsert-by-code (update the existing row's `name`/other fields)? None of the four modules' own text says either way yet — per [00-foundation.md](00-foundation.md)'s ABAC section, this is a per-entity decision for that entity's own `DOCS-EN` file, not assumed here | `foundation-domain` |

## Next step

Resolve P-1 through P-6 above. P-1 through P-5 block giving a firm (non-`TBD`) permission
string to `PRODUCT`'s whole family, `WORK_ORDER`, `TIME_CONVERSIONS`/
`UNIT_OF_MEASUREMENTS`, and `TENANT` creation (`ASSET_STATE_LOG` left this list 2026-09-28 — PRODUCTION owns it). P-6 blocks writing a
concrete import UI/API spec for the four entities that got an `import` row in the
2026-09-03 sweep — the *whether* `import` applies is settled, the insert-vs-upsert
mechanics are not. Everything else in this catalog is grounded directly in an existing §9
FK chain and needs no further confirmation to be cited in a PRD story.
