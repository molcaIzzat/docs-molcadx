# F-00 — FOUNDATION Data Map

> Working spec (`foundation-domain`). Index: [`README.md`](README.md).

**In short:** read this file first. It is the map that shows how every FOUNDATION module
connects, plus the rules that apply to all of them (IDs, versioning, effective dating). The
other files each describe one module on its own.

## What this document is for

Every other file in `DOMAINS/FOUNDATION/DOCS-EN/` describes **one module** in isolation. This file is
the only one that shows **how the modules connect** — the shared entity-relationship map —
plus the rules that apply across all of them (ID formats, versioning, effective dating).
Read this one first; it's the table of contents for the rest of the folder.

## Shared principles (apply to every FOUNDATION entity)

1. **One concept, one entity, one name.** The canonical name is set here; every other
   domain follows it.
2. **Internal IDs are permanent and never reused**, even if the business code changes.
3. **Master data is never hard-deleted.** It's deactivated with a `valid_to` date, because
   historical data still points at it.
4. **Time-variant data is explicit.** Anything whose value changes over time (a person's
   department, a machine's location, a site's shift hours) must carry `valid_from`/`valid_to` —
   never just overwritten in place.
5. **"Place" is separate from "thing."** A functional position on a line (e.g. "station 3")
   is a different entity from the physical machine currently occupying it.
6. **Every number must trace back to a field.** If a KPI formula needs a value, that value
   must exist as a field in one of these modules — no formula may reference something that
   isn't modeled here.
7. **`TENANT` is an ownership layer, not a physical level.** It wraps the tree as the top
   data-isolation and scoping key (one tenant = one customer). It is **not** part of the
   IEC 62264 / ISA-95 levels, which model physical plant only — see Site Hierarchy.
   **`region` is not the tenant** (PO, 2026-10-02, prd-molcadx#24 item 1). `region` is a deployment
   boundary above the tenant: one region may hold many tenants. Data is scoped by `tenant_id`, which
   comes from the login token — see [Keys and constraints](#keys-and-constraints-on-every-table-po-2026-10-01) rule 6.

## Modules and where their entities live

| Module                         | File                                                                     | Entities it owns                                                                                                                                                                                                                                                                            |
| ------------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reference & Master Data        | [05-reference-master-data.md](05-reference-master-data.md)               | `DOWNTIME_REASON`, `DOWNTIME_REASON_ASSET`, `REJECT_REASON`, `REJECT_REASON_ASSET`, `TIME_CONVERSIONS`, `UNIT_OF_MEASUREMENTS`                                                                                                                                                              |
| Site Hierarchy                 | [01-site-hierarchy.md](01-site-hierarchy.md)                             | `TENANT`, `SITE`, `AREA`, `WORK_CENTER`, `WORK_UNIT`                                                                                                                                                                                                                                        |
| Shift                          | [02-shift.md](02-shift.md)                                               | `ENTERPRISE_SHIFT`, `SITE_SHIFT`, `SHIFT_INSTANCE`                                                                                                                                                                                                                                          |
| Yearly & Quarterly Declaration | [03-yearly-quarterly-declaration.md](03-yearly-quarterly-declaration.md) | `FISCAL_YEAR`                                                                                                                                                                                                                                                                               |
| Equipment Taxonomy             | [04-asset-ontology.md](04-asset-ontology.md)                             | `ASSET_CLASS`, `ASSET_TYPE`, `ASSET`, `ASSET_PLACEMENT`, `ASSET_COMPONENT_LINK`, `ASSET_TAGS`, `ASSET_PRODUCT_CODES`. **`ASSET_STATE_LOG` is not FOUNDATION's — owned by PRODUCTION** ([PRODUCTION Monitoring](../../PRODUCTION/DOCS/02-monitoring.md), [decision 2026-09-28](../../../LOGS/decisions/2026-09-28-asset-status-ownership.md), resolving B5/A-5). `ASSET.lifecycle_status` keeps only the current value here; lifecycle history belongs to MAINTENANCE (entity `TBD`). (`DOWNTIME_REASON`/`REJECT_REASON` and their asset joins live in [Reference & Master Data](05-reference-master-data.md); `ASSET_PRODUCT_CODES.product_id` FKs into Product) |
| Product                        | [06-product.md](06-product.md)                                           | `PRODUCT`, `PRODUCT_DETAIL`, `PRODUCT_UOM_CONVERSION` (`PRODUCT_CYCLE` retired 2026-09-28 — cycle time lives only on Work Master's `OPERATION`)                                                                                                                                                                                                |
| KPI inputs                     | [07-0-kpi-formula.md](07-0-kpi-formula.md)                               | **No formula entities in v1.** Declares where OEE-family inputs come from (PBT, APT, standards, counts).                                                                                                                                                                                    |
| Work Master                    | [08-work-master.md](08-work-master.md)                                   | `PRODUCT_FLOW`, `ROUTING`, `OPERATION`, `OPERATION_WORK_UNIT`, `OPERATION_DEPENDENCY`, `OPERATION_PARAMETER`, `OPERATION_INSTRUCTION`, `OPERATION_CHECK` (2026-09-30: flows, class-based steps, dependencies, parameter standards; 2026-10-01 EBR step detail: instructions, in-process checks, yield range, hold time, dispensing tolerance on `BOM_LINE` — `ROUTING`/`OPERATION` both FK into Product's `PRODUCT` — `ITEM` is retired, see 08-work-master.md core concept 1), `BOM`, `BOM_LINE` (`QUALITY_DEFECT_CODE` retired 2026-09-23, merged into Reference's `REJECT_REASON`). **`WORK_ORDER`/`WORK_ORDER_OPERATION` moved to domain PRODUCTION 2026-09-03** — no longer owned here, see [08-work-master.md](08-work-master.md)'s note at the top |
| Workflow Engine                | [09-workflow-engine.md](09-workflow-engine.md)                           | not modeled yet — concept only                                                                                                                                                                                                                                                              |
| Notification                   | [10-notification.md](10-notification.md)                                 | not modeled yet — concept only                                                                                                                                                                                                                                                              |
| Integration                    | [11-integration.md](11-integration.md)                                   | not modeled yet — concept only. **Scope narrowed 2026-09-03 (B7): ERP/peer-system integration only**, sensor/IoT moved out |
| Configuration Service          | [12-configuration-service.md](12-configuration-service.md)               | not modeled yet — concept only                                                                                                                                                                                                                                                              |
| Data Source                    | [13-data-source.md](13-data-source.md)                                   | `DATA_SOURCE`. **New module, 2026-09-03 (B7)** — split from Integration/Equipment Taxonomy. Heartbeat granularity `TBD` (H-DS-1) |
| Audit Trail                    | [14-audit-trail.md](14-audit-trail.md)                                   | `AUDIT_LOG`. **New module, 2026-09-25 (PO)** — append-only who/when/before→after (+ effective date) record of every write to an entity of **any domain**, any source (UI, import, API, system job). FOUNDATION owns it as shared infrastructure every domain writes to; rows carry `domain_code`/`module_code` and are read per module (`audit_view`). Not a replacement for effective dating. PLATFORM coverage open (AU-11) |

> **Retired module — Calendar / working-day declaration.** FOUNDATION no longer models a
> holiday/non-working-day calendar (`NON_WORKING_DAY`, `SHIFT_CALENDAR`). Which dates
> production is actually planned on is a separate concern, owned entirely by
> `production-domain` — FOUNDATION does not need to model or understand it. The
> fiscal-year half of the old Calendar module survives on its own as
> [Yearly & Quarterly Declaration](03-yearly-quarterly-declaration.md).

## How the entities connect

```
TENANT (ownership/isolation layer — wraps the tree, not an ISA-95 level)
  └── ENTERPRISE → SITE → AREA → WORK_CENTER → WORK_UNIT → (occupied by) ASSET

ASSET_CLASS → ASSET_TYPE → ASSET → (nests into) ASSET (component)
ASSET → ASSET_PLACEMENT (placement history — sole source of an asset's current location, B6 2026-09-03)
ASSET → ASSET_STATE_LOG (operational-state log — owned by PRODUCTION, not FOUNDATION; decision 2026-09-28)

PRODUCT → PRODUCT_FLOW (one way of making it, ≥1 per product, 2026-09-30) → BOM + ROUTING (per flow)
PRODUCT → BOM  (Work Master; "ITEM" is retired — same entity as PRODUCT, see 08-work-master.md)
PRODUCT → ROUTING → (runs at) WORK_CENTER
              └── OPERATION → (specific step at) WORK_UNIT, cycle time/standard rate source
                               for sensor-count KPI conversion
                    └── OPERATION_PARAMETER / OPERATION_INSTRUCTION / OPERATION_CHECK
                        (step standards: settings, sub-steps, in-process checks — 2026-09-30 / 2026-10-01)
--- domain boundary: FOUNDATION ends, PRODUCTION continues below (moved 2026-09-03) ---
PRODUCT → WORK_ORDER [PRODUCTION] → WORK_ORDER_OPERATION [PRODUCTION] → (executed at) WORK_UNIT
PRODUCT ← ASSET_PRODUCT_CODE ← ASSET (resolves "what's running" from a PLC tag)

ENTERPRISE → ENTERPRISE_SHIFT (label only) → (every site declares real start/end time for each, mandatory) SITE_SHIFT
SITE → SITE_SHIFT → SHIFT_INSTANCE (generation mechanism out of FOUNDATION's scope, owned by
       production-domain — B1 closed 2026-09-10; one generator, consumed by every MOM domain)
SHIFT_INSTANCE → (time context for) WORK_ORDER_OPERATION [PRODUCTION]

ENTERPRISE → FISCAL_YEAR (rare SITE-level override — pure reporting-window declaration)

<any record of any domain> ← AUDIT_LOG (one append-only row per change; polymorphic domain_code + module_code + entity_type + entity_id, no hard FK — F-14, shared infrastructure)
```

Three things worth noticing in this picture:

- **Site Hierarchy and Equipment Taxonomy are deliberately separate trees.** A `WORK_UNIT` is a
  *position* ("press station #2"); an `ASSET` is the *physical machine* sitting in it right
  now. Swap the machine and the position's history stays intact.
- **Everything that produces or consumes numbers eventually routes through `SHIFT_INSTANCE`.**
  It's the most-referenced entity in the whole system — see [02-shift.md](02-shift.md).
- **There is no shift rotation/pattern.** Every shift a site has declared (via `SITE_SHIFT`)
  happens on every working day — no per-day selection between them.
- **Access and roles live in the identity provider (SSO/Keycloak), not in this model.**
  MolcaDx does not store users or roles; authorization is scoped (tenant/enterprise/site)
  by the IDP. See the [authorization attribute contract](#authorization-attribute-contract-abac--what-foundation-exposes-what-stays-in-the-idp)
  below for exactly what FOUNDATION does and doesn't own here — this is a sharpening of
  the boundary, not a reversal of the 2026-08-24 Organization retirement.
- **Tenant wraps the whole tree.** `TENANT` is the customer ownership boundary (data
  isolation + scoping). It sits above Enterprise and is not counted among the ISA-95
  physical levels.

## Authorization attribute contract (ABAC) — what FOUNDATION exposes, what stays in the IDP

Resolved 2026-09-03 (PO). This sharpens the rule above — it does not reopen Organization,
`CREW`, or any form of per-user role storage, all of which stay retired (2026-08-24, roles
moved to the IDP). PRD stories across FOUNDATION were independently found to invent
concrete role names (`admin`, `supervisor`, `plant_manager`) with no doc to back them —
this section is the actual, traceable answer a story should cite instead.

An ABAC decision is `allow = policy(subject attributes, resource attributes, action,
environment)`. FOUNDATION owns exactly one of those four — the rest are explicitly out of
scope, same as today:

| Ingredient | Who owns it | FOUNDATION's role |
|---|---|---|
| **Subject attributes** (who — role, site/enterprise assignment, permission claims) | IDP, 100% | None. Never stored, never named in a story. |
| **Resource attributes** (what's being acted on) | **FOUNDATION** | See below — this is the real contribution |
| **Action** | Shared vocabulary, declared here | Fixed, small set (below) |
| **Environment** (time, network, device) | Out of scope entirely | None |

**Resource attributes — already modeled, now declared as a contract.** Every FOUNDATION
entity resolves, via its own existing FK chain, to exactly one node in the Site Hierarchy
tree: `tenant_id` → `enterprise_id` → `site_id` → `area_id` → `work_center_id` →
`work_unit_id`. That chain **is** the resource-attribute set an external authorization
layer evaluates against — nothing new is modeled here, it is the same FK structure
[Site Hierarchy](01-site-hierarchy.md) already specifies, named explicitly so it can be
cited as the answer to "what scope does this resource carry." An entity with no
site/area/work-unit FK (e.g. `ENTERPRISE_SHIFT`, `TIME_CONVERSIONS`) resolves to
`enterprise` or `tenant` scope — never "no scope."

**Action vocabulary — fixed, five values.** `view` / `create` / `update` / `deactivate` /
`import`. No `delete`: FOUNDATION never hard-deletes (see ID/versioning rules below), so
there is no action for it to gate.

**Plus `audit_view` / `audit_download`, on every module (added 2026-09-25, PO).** Reading and
downloading audit rows ([Audit Trail, F-14](14-audit-trail.md)) is authorized **per owning
module**: `<domain>:<module>:<scope>:audit_view` and `:audit_download` (e.g.
`foundation:sit:site:audit_view`, `production:pln:site:audit_view`). Both are separate from
`view` on the record. The Audit log feature (`AUD`) has no permission of its own. The five values
above stay the vocabulary for acting on master data. See the
[`AUD` rows](00-1-authorization-permissions.md#audit-trail-aud--14-audit-trailmd-9).

**`import` is its own action, not just repeated `create`.** A bulk multi-row load from an
uploaded file (CSV today; the format may widen later) has a materially different blast
radius and failure shape than a single-row `create` — one bad row shouldn't (and, per
partial-failure handling elsewhere in this repo's PRDs, doesn't) block the other 499, and a
plant may reasonably want to grant ad-hoc single-record `create` more widely than bulk
`import`, since one mistake in an import affects far more rows at once. Whether a given
entity's import behaves as insert-only or upsert-by-code (e.g. re-uploading a UOM list to
correct existing rows, not just add new ones) is a **per-entity decision made where that
entity is specified** (its own `DOCS-EN` file), never assumed uniformly here — the catalog
in [`00-1-authorization-permissions.md`](00-1-authorization-permissions.md) states which
entities actually support `import` and which don't; most FOUNDATION entities (anything a
plant declares one row at a time, like a single `SITE` or `ENTERPRISE_SHIFT`) never will.

**What a PRD story writes from now on, instead of a role name:**
> Access: `update` on a resource scoped at `site` — any subject whose IDP-asserted scope
> claim covers that resource's `site_id` (or a broader `enterprise`/`tenant` claim).

Never "the `admin` role" — FOUNDATION cannot verify a role exists, let alone who holds it.
It can and does guarantee every resource's scope attribute is always resolvable, which is
the only half of the decision it is positioned to make. Which subject attributes actually
satisfy that claim, and what the IDP calls its roles, remain entirely outside this model.

### An illustrative encoding — not a mandate

Everything above is a **logical** scope/action contract — a resource resolves to a node in
the FK chain, and the action is one of four fixed values. Whether an actual IDP integration
represents that as a literal permission string, a set of claim attributes, or something
else entirely is **not FOUNDATION's call to make** — same boundary this file already draws
for "physical schema, APIs... belong to `engineering-domain`, which doesn't exist yet." The
format below exists only so a PRD story has one consistent, readable shorthand to write in
an acceptance criterion; treat it as illustrative, not as the literal string an IDP will
actually issue or check.

**Illustrative format:** `foundation:<module_code>:<scope_level>:<action>`

- `module_code` — the PRD module code from [`../../../AGENTS.md`](../../../AGENTS.md) §4
  (`SIT`, `SHF`, `FYR`, `AST`, `REF`, `PRO`, `KPI`, `WMS`, …).
- `scope_level` — one node name from the resource-attribute FK chain above (`tenant`,
  `enterprise`, `site`, `area`, `work_center`, `work_unit`) — whichever level that
  module's entity actually resolves to, never invented per story.
- `action` — one of the five fixed values (`view` / `create` / `update` / `deactivate` /
  `import`), or `audit_view` / `audit_download` (any module, F-14).

**Examples:**
- `foundation:sit:site:update` — update access to a Site Hierarchy resource, scoped to
  one site (e.g. editing that `SITE`'s own fields).
- `foundation:fyr:enterprise:view` — view access to Fiscal Year data, enterprise-scoped —
  there is no narrower scope, since Y-2 resolved "no site override" for `FISCAL_YEAR`.
- `foundation:ref:enterprise:import` — bulk-load a CSV of reference rows (e.g. a UOM or
  downtime-reason list), enterprise-scoped, for an entity the catalog confirms supports
  `import`. Not implied just because an entity supports `create`.

**The full catalog — one row per real module/scope/action combination, grounded in each
module's own §9 entity spec — is
[`00-1-authorization-permissions.md`](00-1-authorization-permissions.md).** That file is
the concrete reference; this section only declares the shape.

## ID, code, and versioning rules

**Two different kinds of identifier — never confuse them:**

| Kind | Example | Nature | Used for |
|---|---|---|---|
| **Internal ID** (`*_id`) | UUID / bigint | Permanent, meaningless to humans, never changes | Relationships between tables |
| **Business code** (`*_code`, `*_tag`, `*_number`) | `IM-03`, `WO-2026-00184` | Meaningful to humans, **can change** | Shown to users, scanned, printed |

Relationships always use the internal ID. A business code is never a foreign key — if the
factory renames a machine tag next year, every historical record that referenced it by ID
stays correct.

**Suggested business-code patterns** (only if the factory doesn't already have its own —
if real naming exists on the floor, use that instead of forcing a new scheme):

| Entity | Pattern | Example |
|---|---|---|
| Site | 3–4 letters/digits | `JKT1` |
| Area | 2 letters (own segment only) | `AS` |
| Work center | `L<nn>` (own segment only) | `L01` |
| Work unit | `S<nn>` (own segment only) | `S03` |
| Asset tag | `<2-letter class><nnn>` | `IM003` |
| Work order | `WO-<year>-<nnnnn>` | `WO-2026-00184` |

**2026-09-25 — codes that are part of machine addresses.** Site/area/work center/work unit
codes and `asset_tag` are segments of generated OPC UA tag addresses
([F-04 §9.7.1](04-asset-ontology.md#971-generated-opc-ua-node-address)): one segment per level
(no parent prefix, so the joined path `JKT1/AS/L01/S03/IM003` doesn't repeat). Site, area, work center
and class codes may contain `-` (real plant codes such as `FI-2`, `FI2-1`). They are cleaned only when
the generated address is built: every character that is not a letter, digit or `_` becomes `_`; if two
sibling codes clean to the same segment, the save is refused (PO, 2026-10-02, prd-molcadx#24 item 24).
The address rule itself is owned by [F-04 §9.7.1](04-asset-ontology.md#971-generated-opc-ua-node-address).
They still **can** change, but a rename changes a live address the OPC UA server must
match, so it is warned and confirmed, not silent. The full dashed form (`JKT1-AS-L01-S03`) is
display only, joined from the segments.

**Effective dating** — the rule: a change to a time-variant value means **close the old
row** (`valid_to`) **and open a new one** — never `UPDATE` in place. Every FOUNDATION
master carries `valid_from`/`valid_to` by default; the entities below are a sample, **not
an exhaustive list** — check the owning module's `§9` before assuming an entity is
exempt: `ASSET`, `ASSET_PLACEMENT`, `ASSET_TAGS`, `BOM`, `ROUTING`, `OPERATION`,
`ENTERPRISE_SHIFT`, `SITE_SHIFT`, `FISCAL_YEAR`,
`PRODUCT_UOM_CONVERSION` (`QUALITY_DEFECT_CODE` merged into `REJECT_REASON`, 2026-09-23).

**Half-open ranges, everywhere (PO, 2026-10-02, prd-molcadx#24 item 21).** Every
`valid_from`/`valid_to` pair, in every domain, is a **half-open** range: a row is in force from
`valid_from` **up to, but not including**, `valid_to` — `[valid_from, valid_to)`. `valid_to` empty =
still in force.
- **A change** closes the old row with `valid_to` = the new row's `valid_from`, **the same value** —
  never the day (or minute) before. At the change moment exactly one row is in force, with no gap and
  no overlap.
- **Deactivation** sets `valid_to` to the effective date: the row is no longer in force **on** that date.
- **"In force at t"** means `valid_from <= t AND (valid_to IS NULL OR t < valid_to)`. Never `<=` on
  `valid_to`, never `BETWEEN`.
- **No overlap** (keys rule 4) checks the same half-open range (PostgreSQL range bound `'[)'`).
- Same convention as shift hours (`end_time` exclusive, [F-02](02-shift.md)) and placement
  ([F-04 §9.6](04-asset-ontology.md#96-asset-to-work-unit-placement-rules)). Whether a given pair is a
  date or a timestamp stays each entity's own field type (e.g. A-19); the half-open rule holds for both.

**Example.** Fiscal year FY2026 v1 runs from 2026-01-01. A correction effective 2026-04-01 sets v1
`valid_to` = 2026-04-01 and opens v2 with `valid_from` = 2026-04-01. On 2026-03-31 v1 is in force; on
2026-04-01 v2 is.

**Deactivation, not deletion.** No master data is physically deleted. Deactivating sets
`valid_to`; the record disappears from new-entry pickers but stays visible in historical
data. Deactivating a node that still has open transactions must be rejected, with a message
naming what's blocking it.

### Keys and constraints on every table (PO, 2026-10-01)

Applies to **every entity in every domain** (FOUNDATION, PRODUCTION, MAINTENANCE, PLATFORM), not only
FOUNDATION masters. **Why:** change data capture (Debezium) keys every change event on the table's primary key.
On PostgreSQL, a table in the publication with no primary key (no replica identity) refuses `UPDATE` and
`DELETE`. The Audit Trail also needs one stable row id per record ([F-14](14-audit-trail.md)).

1. **One primary key per table, a single surrogate column** (internal ID, permanent, never reused — shared
   principle 2). New entities name it `<entity>_id`; an existing key name already used by specs, PRDs or code
   (e.g. `wo_operation_id`) stays as it is — the rule is about having the key, not renaming it. This includes
   join tables, history tables, logs, results and configuration values. A
   natural or composite key never replaces it; it is declared as a unique constraint instead. A spec table with no
   primary key is not finished.
2. **The primary key is never updated.** Business codes change; the key does not. A changed key would reach the
   CDC stream as a delete plus a create.
3. **Every entity section lists its keys** in a **Keys** line right under its field table:
   - **PK** — the surrogate key column;
   - **Unique** — natural keys that hold for **all rows** or for rows filtered by a stored column (e.g. "among rows
     with `deleted_at` null"). Built as a unique index, partial when filtered;
   - **No overlap** — effective-dated rules of the kind "at most one active row per … at any time". They depend on
     the `valid_from`/`valid_to` range, so a plain unique index cannot express them.
   Only rules the spec already states are listed. A rule that seems needed but is not decided goes to the module's
   open questions, never into the Keys line.
4. **"No overlap" is enforced by a database exclusion constraint** (PO, 2026-10-02, prd-molcadx#24 item 11): PostgreSQL
   `btree_gist` on a range column built from `valid_from`/`valid_to`. Not an application check: two saves running at
   the same time can each pass an app check and still overlap. Works with CDC. ~~**E-1** — exclusion constraint or
   application check?~~ **Resolved 2026-10-02 (PO): exclusion constraint.**
5. **No list-valued columns** in a stored entity. A field that holds "a list of rows" (e.g. which bindings a result
   used) is a child table with its own primary key, or `TBD` until modelled.
6. **Keys and FKs are scoped by `tenant_id`, not `region`** (PO, 2026-10-02, prd-molcadx#24 item 1). A unique key that
   holds "per tenant" includes `tenant_id`; no key or FK includes `region`. `region` is a deployment boundary above the
   tenant (one region, many tenants). `tenant_id` comes from the login token, not from user input.
   `TBD — engineering` (**E-2**): which token claim carries `tenant_id` (exact claim name)?

## Rules for changing this model

1. Adding a new entity/field is `foundation-domain`'s call — must be logged in
   [`../../../LOGS/CHANGELOG.md`](../../../LOGS/CHANGELOG.md).
2. Changing a field's meaning, cardinality, or time rule **that an active PRD already
   depends on** must go through the Product Owner and be recorded as a decision in
   `LOGS/decisions/`.
3. Every new term must be added to
   [`../../../DOCS/01-glossary.md`](../../../DOCS/01-glossary.md).

## Open questions, at a glance

| Priority | Question | Module | ID |
|---|---|---|---|
| 🔴 High | Today's list of downtime reason codes | Reference & Master Data | T-1 |
| 🔴 High | List of reject / quality defect reasons (one list since 2026-09-23) | Reference & Master Data | T-1 (was W-4) |
| ~~🔴 High~~ | ~~Downtime logging level: per-asset or per-line~~ **Moved to PRODUCTION 2026-09-28** — `ASSET_STATE_LOG` owner = PRODUCTION ([decision 2026-09-28](../../../LOGS/decisions/2026-09-28-asset-status-ownership.md)); the recording level is PRODUCTION's open item SL-1 now | Equipment Taxonomy → PRODUCTION | ~~A-5~~ |
| 🟡 Low | Real values for the site/area/work-center/work-unit classification lookups | Site Hierarchy | S-5 |
| 🟠 Medium | Work order source: ERP or MolcaDx | Work Master | W-1 |
| 🟠 Medium | Where/how break time is tracked, given it varies by area/line | Shift | H-2 |
| 🟡 Low | Existing on-floor coding conventions | — | §4.2 |
| 🟡 Low | Is Molca's fiscal year month-aligned or week-based? | Yearly & Quarterly Declaration | Y-1 |
| ~~🟠 Medium~~ | ~~How "No overlap" (one active row at a time) is enforced: exclusion constraint on the range, or an application check~~ **Resolved 2026-10-02 (PO): database exclusion constraint (`btree_gist` + range column)** — see [Keys and constraints](#keys-and-constraints-on-every-table-po-2026-10-01) rule 4 | all modules (engineering) | ~~E-1~~ |
| 🟠 Medium | Which login-token claim carries `tenant_id` (exact claim name) — see [Keys and constraints](#keys-and-constraints-on-every-table-po-2026-10-01) rule 6 | all modules (engineering) | E-2 |
| 🟠 Medium | Uniqueness rules the specs don't decide yet, raised by the 2026-10-01 keys pass (codes unique in which scope, active vs all rows, list-valued fields) | each module's open questions | S-8, S-9, H-8, Y-3, A-17–A-19, T-7, T-8, P-8, P-9, K-12–K-15, W-18, W-19, AU-14 |

## Not covered here

The exact `mermaid` ER diagram syntax and full field-level detail for each entity live in
the module files themselves (§9 of each). This map only shows how the pieces relate —
for exact field types, required/optional, and constraints, open the module file.

## Next step

Pick the module you actually need from the table above and open that file. If
you're new to this repo, read them in this order: **Reference & Master Data** → Site
Hierarchy → Shift → Yearly & Quarterly Declaration → **Equipment Taxonomy** → Product → KPI &
Reference Data → **Work Master**, then the concept modules last (Workflow Engine →
Notification → Integration → Configuration Service → **Data Source**, new 2026-09-03), then
**Audit Trail** (F-14, new 2026-09-25 — cross-cutting, reads last because it records writes to
every module of every domain rather than defining master data of its own).
Data Source reads last because it is the newest, smallest module (one entity, minimal spec)
and exists to close a single FK gap (`ASSET_TAGS.data_source_id`) — plus, since 2026-09-25,
to say whether a connection's tag addresses are generated from the hierarchy (`node_naming`,
`namespace_uri`) — it is not a prerequisite for reading any other module. That follows dependencies: Reference &
Master Data is read first only because several later modules (Equipment Taxonomy's join
tables, Product's `TIME_CONVERSIONS`/`UNIT_OF_MEASUREMENTS` FKs) point at it, not because
it's more settled than they are — Equipment Taxonomy needs the
`WORK_UNIT` from Site Hierarchy, so it can't come first, and **it now reads after Shift
and Yearly & Quarterly Declaration for the same reason: it is the
least-settled module among that group right now** — per the Product Owner, "I don't have any idea about
how asset will be declared yet," so it's ordered after the modules that are already
stable rather than ahead of them; **Product sits right before KPI & Reference Data because
it supplies the `PRODUCT` identity Work Master's `ROUTING`/`OPERATION` FK into**; **Work
Master now reads right after KPI & Reference Data** (moved 2026-08-20, PO decision — it is
more load-bearing/mature than the four concept-only platform modules) even though its
own remaining unspecified parts (`BOM`, `WORK_ORDER`) are still some of the newest content
in FOUNDATION; the four concept modules (Workflow Engine, Notification, Integration,
Configuration Service — all 🟡 DRAFT, entities not yet modeled) are kept last.
>
> **Resolved 2026-08-20 — reading-order gap fixed by the Work Master move:** the operating-time
> formula's actual cycle-time source, `OPERATION.cycle_time_value`, lives in Work Master
> ([08-work-master.md](08-work-master.md) §9.2). Work Master was previously numbered
> F-12 and read dead last, after KPI & Reference Data (F-07) — the field the KPI formula
> depends on was read *after* the formula itself. Work Master is now F-08, read
> immediately after KPI & Reference Data, closing that gap.
