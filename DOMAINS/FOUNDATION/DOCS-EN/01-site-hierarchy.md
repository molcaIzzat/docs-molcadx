# F-01 — Site Hierarchy

> Concepts + entity specification (§9). Working spec. Entity spec status: 🟢 ACTIVE — ready to implement.

**In short:** Site Hierarchy is the five-level location tree (Enterprise → Site → Area →
Work Center → Work Unit) that every rollup number, every access rule, and every navigation
menu in MolcaDx is built on.

## What this module is for

A layered structure that answers **"where"** something happens — from the enterprise all
the way down to a work station. It's the backbone for three things at once: **rolling
numbers up**, **access control**, and **UI navigation**.

## Why it matters — what goes wrong without it

Without a firm hierarchy, numbers can't be summed upward — "plant OEE" becomes meaningless
because it's unclear which lines it's made of. Access also becomes binary — all-or-nothing
— when a Line A supervisor really shouldn't see Line B's data at all.

## Core concepts

**1. Standard levels (ISA-95 / IEC 62264):**

| Level | Standard name | Practical meaning |
|---|---|---|
| 1 | **Enterprise** | The company/group |
| 2 | **Site** | A physical factory location |
| 3 | **Area** | A functional section of the plant (assembly, painting, warehouse) |
| 4 | **Work Center** | A production line / work cell / process unit / storage zone |
| 5 | **Work Unit** | A station or machine position inside a work center |

ISA-95 has several names for level 4 depending on production type: *production line*
(discrete), *process cell* (batch), *production unit* (continuous), *storage zone*
(warehousing). One model can hold all four via a type attribute.

> **About tenant:** MolcaDx adds a top **ownership** layer, `TENANT`, that wraps this whole
> tree as the data-isolation and scoping key (one tenant = one customer). It is **not** a
> level in the ISA-95 / IEC 62264 hierarchy — that standard models physical plant only. The
> ISA-95 levels still start at Enterprise; tenant is the product's ownership boundary above
> them.

**2. Site is the main boundary.** In practice, it's three boundaries at once:
- **data boundary** — almost every query is scoped by site;
- **access boundary** — roles are granted within a site or below it;
- **time boundary** — timezone lives on the site, and every shift interpretation depends
  on it.

**3. Work center is the unit of measurement.** This is where capacity and OEE are usually
measured. Anything higher is too coarse to act on; anything lower often lacks enough data.

**4. Depth is an expensive decision.** Adding a level after the system is live means
touching **every** rollup, every access rule, and every screen. Depth gets fixed once, on
purpose, early.

## How the entities connect

```
TENANT               (ownership/isolation layer — wraps the tree; not an ISA-95 level)
└── ENTERPRISE       (the customer business — top of the ISA-95 tree)
    └── SITE         (physical factory; owns timezone — required)   ·· SITE_CLASS
        └── AREA     (functional grouping, e.g. Assembly, Painting, Warehouse)   ·· AREA_CLASS
            └── WORK_CENTER  (production line / cell — where capacity & OEE are measured)   ·· WORK_CENTER_CLASS
                └── WORK_UNIT     (station / machine position — the "functional location")   ·· WORK_UNIT_CLASS
                    └── ASSET     (the physical machine currently occupying that position)
```

Note this is a **separate tree** from Equipment Taxonomy's Class → Type → Instance hierarchy —
see [asset-ontology.md](04-asset-ontology.md). Site Hierarchy is a role/location structure;
Asset is the physical thing sitting inside it. Don't merge the two into one nested tree.

**`·· *_CLASS`** above marks a horizontal, cross-cutting classification — a flat lookup
(`SITE_CLASS`/`AREA_CLASS`/`WORK_CENTER_CLASS`/`WORK_UNIT_CLASS`, §9.7–§9.10) that groups
nodes at that level for reporting/filtering *regardless* of where they sit in the vertical
tree — e.g. tagging every "Packaging Line" `WORK_CENTER` the same way across different
`SITE`s. It's a single FK per node, not a parent/child nesting like `ASSET_CLASS` — see the
note in §9.7.

## Common pitfalls

1. **Mixing org structure with location structure.** A department isn't an area — the two
   intersect, they don't nest. `AREA_CLASS`/`WORK_CENTER_CLASS`/`WORK_UNIT_CLASS` (§9.7–§9.10)
   are how a cross-cutting grouping gets modeled instead — a flat tag per level, not a second
   parent.
2. **Forgetting timezone on the site.** A multi-timezone company will get colliding
   production dates.
3. **Dangling nodes.** A line with no area, an area with no site — rollups start leaking.
4. **Deleting old nodes.** Historical data loses its home; deactivate with an effective
   date instead.
5. **Forcing a new naming scheme onto `*_name`** when the floor already has years of
   established naming — `*_name` should hold whatever operators actually call it (e.g. "Line
   2"), not an invented label. `*_code` (§9.3–§9.6) is the separate, purely internal
   systematic identifier and is never floor-facing — see S-4, resolved. Since 2026-09-25 it
   is also a segment of generated OPC UA tag addresses, so treat it as frozen once tags use it
   (S-4 note).

## What's still unknown

| # | Question | Who needs to answer it |
|---|---|---|
| ~~S-1~~ | ~~How many real sites and areas for the first release?~~ **Resolved: 2 sites for launch — one with 2 areas, one with 4 areas (6 areas total).** | — |
| ~~S-2~~ | ~~Are all plants in the same timezone / how should `SITE.timezone` be stored?~~ **Resolved: per-site IANA timezone name** (e.g. `Asia/Jakarta`), regardless of whether the 2 sites share a zone — data stays UTC, this field drives shift/`business_date` interpretation per site. | — |
| ~~S-3~~ | ~~Is the `WORK_UNIT` level actually used, or does the model stop at line level?~~ **Resolved: used.** Reflected in §9.6. | — |
| ~~S-4~~ | ~~What line/station naming is already used on the floor?~~ **Resolved: floor naming goes in `*_name`** (free text, no imposed pattern); `*_code` (§9.3–§9.6) stays a purely internal systematic identifier, never floor-facing, so it doesn't need to match existing conventions. **Partly reversed 2026-09-25:** codes are still not floor-facing, but they are now part of machine addresses (generated OPC UA NodeIds) — one segment per level, and effectively frozen; see §9.13 S-4. | — |
| S-5 | What cross-cutting groupings (`SITE_CLASS`/`AREA_CLASS`/`WORK_CENTER_CLASS`/`WORK_UNIT_CLASS`, §9.7–§9.10) does the floor/PO actually need? | Product Owner + Operations |

## 9. Entity specification

> 🟡 DRAFT.

The hierarchy is modeled as **five fixed tables, one per level**, each carrying an FK to
its parent level — not a single self-referencing tree. Depth is therefore fixed by schema
(exactly `TENANT → ENTERPRISE → SITE → AREA → WORK_CENTER → WORK_UNIT`), so no separate
`depth` field is needed — unlike `ASSET_CLASS` in [Equipment Taxonomy](04-asset-ontology.md),
which nests itself and does need one.

### 9.1 `TENANT` — ownership/isolation layer

| Field | Type | Required | Notes |
|---|---|---|---|
| `tenant_id` | internal ID | Yes | Permanent, never reused |
| `tenant_code` | string | Yes | Human-facing code; unique across MolcaDx. Exact format: `TBD — needs confirmation from PO/Operations` (no pattern for tenant codes is suggested anywhere in this file or in `00-foundation.md`'s business-code table) |
| `tenant_name` | string | Yes | |
| `keycloak_org_id` | string | Yes | External ID of this tenant's **Keycloak Organization** ([decision, 2026-09-11](../../../LOGS/decisions/2026-09-11-tenant-keycloak-organizations.md)). `TENANT` is FOUNDATION's business record — the row `ENTERPRISE`/`SITE`/etc. FK to and the row PLATFORM's License Manager grants domains against. Membership, SSO, and IdP federation for this tenant live in Keycloak under this Organization, not here — this field is a pointer, not a duplication. Same split already applied to Organization/roles (2026-08-24): identity stays in the IDP, business data stays in FOUNDATION |
| `valid_from`, `valid_to` | date | Yes | Deactivate, never hard-delete (§00 shared rule) |

**Keys** (F-00 [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `tenant_id` · Unique: `tenant_code` (across MolcaDx) · No overlap: —

### 9.2 `ENTERPRISE` — top of the ISA-95 tree

| Field | Type | Required | Notes |
|---|---|---|---|
| `enterprise_id` | internal ID | Yes | Permanent, never reused |
| `tenant_id` | FK → `TENANT` | Yes | Owning tenant |
| `enterprise_code` | string | Yes | Exact format: `TBD — needs confirmation from PO/Operations` (no suggested pattern exists for this level) |
| `enterprise_name` | string | Yes | |
| `valid_from`, `valid_to` | date | Yes | |

**Keys** (F-00 [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `enterprise_id` · Unique: — (`enterprise_code`: S-8) · No overlap: —

### 9.3 `SITE` — physical factory location, the main data/access/time boundary

| Field | Type | Required | Notes |
|---|---|---|---|
| `site_id` | internal ID | Yes | Permanent, never reused |
| `enterprise_id` | FK → `ENTERPRISE` | Yes | |
| `site_code` | string | Yes | Purely internal, systematic identifier — **resolved (S-4), not floor-facing**, but a segment of generated tag addresses since 2026-09-25 (S-4 note, effectively frozen). Letters, digits, `_` and `-` (PO, 2026-10-02, prd-molcadx#24 item 24); cleaned when a generated address is built ([F-04 §9.7.1](04-asset-ontology.md#971-generated-opc-ua-node-address)). Suggested pattern: 3–4 letters/digits, e.g. `JKT1`. Unique within the enterprise |
| `site_name` | string | Yes | What operators actually call this site (e.g. "Jakarta Plant 1") — free text, no imposed pattern — **resolved (S-4)** |
| `timezone` | string | Yes | IANA timezone name per site (e.g. `Asia/Jakarta`) — **resolved (S-2)**. All timestamps are still stored in UTC; this field is what shift boundaries and `business_date` are derived against for this site, not a different storage form. Required because every shift interpretation depends on it (see "Site is the main boundary" above) |
| `site_class_id` | FK → `SITE_CLASS` (§9.7) | No | Cross-cutting classification (e.g. region, plant type) — independent of the `enterprise_id` parent above |
| `valid_from`, `valid_to` | date | Yes | |

**Keys** (F-00 [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `site_id` · Unique: (`enterprise_id`, `site_code`) — "unique within the enterprise" (all rows or active rows only: S-9) · No overlap: —

### 9.4 `AREA` — functional section of a site

| Field | Type | Required | Notes |
|---|---|---|---|
| `area_id` | internal ID | Yes | Permanent, never reused |
| `site_id` | FK → `SITE` | Yes | |
| `area_code` | string | Yes | Purely internal, systematic identifier — **resolved (S-4), not floor-facing**, but a segment of generated tag addresses since 2026-09-25 (S-4 note, effectively frozen). Letters, digits, `_` and `-` (PO, 2026-10-02, prd-molcadx#24 item 24); cleaned when a generated address is built ([F-04 §9.7.1](04-asset-ontology.md#971-generated-opc-ua-node-address)). Suggested pattern: 2 letters, **own segment only** (was `<SITE>-<2 letters>` until 2026-09-25), e.g. `AS`. Unique within the site |
| `area_name` | string | Yes | What operators actually call this area (e.g. Assembly, Painting, Warehouse) — free text, no imposed pattern — **resolved (S-4)** |
| `area_class_id` | FK → `AREA_CLASS` (§9.8) | No | Cross-cutting classification — independent of the `site_id` parent above |
| `valid_from`, `valid_to` | date | Yes | |

**Keys** (F-00 [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `area_id` · Unique: (`site_id`, `area_code`) — "unique within the site" (S-9) · No overlap: —

### 9.5 `WORK_CENTER` — production line / process cell / production unit / storage zone

| Field | Type | Required | Notes |
|---|---|---|---|
| `work_center_id` | internal ID | Yes | Permanent, never reused |
| `area_id` | FK → `AREA` | Yes | |
| `work_center_code` | string | Yes | Purely internal, systematic identifier — **resolved (S-4), not floor-facing**, but a segment of generated tag addresses since 2026-09-25 (S-4 note, effectively frozen). Letters, digits, `_` and `-` (PO, 2026-10-02, prd-molcadx#24 item 24); cleaned when a generated address is built ([F-04 §9.7.1](04-asset-ontology.md#971-generated-opc-ua-node-address)). Suggested pattern: `L<nn>`, **own segment only** (was `<AREA>-L<nn>` until 2026-09-25), e.g. `L01`. Unique within the site (unchanged — so line numbers run across the whole site, not per area) |
| `work_center_name` | string | Yes | What operators actually call this line (e.g. "Line 2") — free text, no imposed pattern — **resolved (S-4)** |
| `type` | enum | Yes | ISA-95 uses a different name per production type at this level — this field carries that distinction in one model: `production_line` (discrete) / `process_cell` (batch) / `production_unit` (continuous) / `storage_zone` (warehousing) |
| `work_center_class_id` | FK → `WORK_CENTER_CLASS` (§9.9) | No | Cross-cutting classification (e.g. "Packaging Line", "Utility Line") — lets a rollup group work centers across different `AREA`/`SITE` parents, independent of `type` above, which only distinguishes ISA-95 production type |
| `valid_from`, `valid_to` | date | Yes | |

**Keys** (F-00 [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `work_center_id` · Unique: (site, `work_center_code`) — "unique within the site"; the site is reached through `area_id → AREA.site_id`, a join, so an application check, not a plain index (S-9) · No overlap: —

### 9.6 `WORK_UNIT` — station or machine position, the functional location

| Field | Type | Required | Notes |
|---|---|---|---|
| `work_unit_id` | internal ID | Yes | Permanent, never reused |
| `work_center_id` | FK → `WORK_CENTER` | Yes | |
| `work_unit_code` | string | Yes | Purely internal, systematic identifier — **resolved (S-4), not floor-facing**, but a segment of generated tag addresses since 2026-09-25 (S-4 note, effectively frozen). Letters, digits, `_` only (`-` allowed? S-10). Suggested pattern: `S<nn>`, **own segment only** (was `<WC>-S<nn>` until 2026-09-25), e.g. `S03`. Unique within the work center |
| `work_unit_name` | string | Yes | What operators actually call this station — free text, no imposed pattern — **resolved (S-4)** |
| `work_unit_class_id` | FK → `WORK_UNIT_CLASS` (§9.10) | No | Cross-cutting classification (e.g. "Manual Station", "Automated Station") — independent of the `work_center_id` parent above |
| `valid_from`, `valid_to` | date | Yes | |

**Keys** (F-00 [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `work_unit_id` · Unique: (`work_center_id`, `work_unit_code`) — "unique within the work center" (S-9) · No overlap: —

`WORK_UNIT` deliberately has **no field pointing at the asset currently occupying it**
(e.g. no `current_asset_id`). That relationship is history, not a current-value column —
it lives entirely in `ASSET_PLACEMENT` (see [Equipment Taxonomy §9.6](04-asset-ontology.md#96-asset-to-work-unit-placement-rules)),
which enforces "at most one active **`primary`** `ASSET` per `WORK_UNIT`" — a work unit can
additionally have any number of active **`secondary`** placements (dedicated auxiliary
equipment with no Availability of its own, e.g. an inline checkweigher), see F-04 §9.6.

**Deactivating a node — what blocks it.** Deactivation is refused while the node or anything
below it still has live work. Every blocker found is named; if none, the node and everything below it
get `valid_to` = the effective date.

- jobs on it that are waiting, scheduled, running or on hold (`WORK_ORDER_OPERATION`);
- machine stops on it that haven't ended (`ASSET_STATE_LOG` with `ended_at` null);
- **open shifts — only when the node is a `SITE`** (PO, 2026-10-02, prd-molcadx#24 item 12). Shifts belong
  to a site: `SHIFT_INSTANCE` has no `work_center_id` ([F-02 §9.3](02-shift.md#93-shift_instance--one-real-shift-on-one-date-at-one-site)).
  Area, work center and work unit deactivation does not count shifts.

```
blocker_count =
    COUNT(WORK_ORDER_OPERATION WHERE work_unit_id ∈ subtree(node)
                                 AND status ∈ {pending, scheduled, in_progress, on_hold})
  + COUNT(ASSET_STATE_LOG      WHERE work_unit_id ∈ subtree(node) AND ended_at IS NULL)
  + (node is a SITE ?
     COUNT(SHIFT_INSTANCE si JOIN SITE_SHIFT ss ON si.site_shift_id = ss.site_shift_id
           WHERE ss.site_id = node.site_id AND si.status = 'open')
     : 0)
```

### 9.7 `SITE_CLASS` — cross-cutting classification for `SITE`

| Field | Type | Required | Notes |
|---|---|---|---|
| `site_class_id` | internal ID | Yes | Permanent, never reused |
| `code` | string | Yes | Business code — see [`00-foundation.md`](00-foundation.md)'s ID/code rules. May contain `-` (applies to all four class codes, §9.7–§9.10) (PO, 2026-10-02, prd-molcadx#24 item 24) |
| `name` | string | Yes | e.g. "Region: East", "Owned", "Contract Manufacturer" — real values `TBD`, see S-5 |
| `valid_from`, `valid_to` | date | Yes | |

**Keys** (F-00 [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `site_class_id` · Unique: — (`code`: S-8) · No overlap: —

### 9.8 `AREA_CLASS` — cross-cutting classification for `AREA`

| Field | Type | Required | Notes |
|---|---|---|---|
| `area_class_id` | internal ID | Yes | Permanent, never reused |
| `code` | string | Yes | Business code |
| `name` | string | Yes | e.g. "Assembly-type", "Warehouse-type" — real values `TBD`, see S-5 |
| `valid_from`, `valid_to` | date | Yes | |

**Keys** (F-00 [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `area_class_id` · Unique: — (`code`: S-8) · No overlap: —

### 9.9 `WORK_CENTER_CLASS` — cross-cutting classification for `WORK_CENTER`

| Field | Type | Required | Notes |
|---|---|---|---|
| `work_center_class_id` | internal ID | Yes | Permanent, never reused |
| `code` | string | Yes | Business code |
| `name` | string | Yes | e.g. "Packaging Line", "Utility Line" — real values `TBD`, see S-5 |
| `valid_from`, `valid_to` | date | Yes | |

**Keys** (F-00 [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `work_center_class_id` · Unique: — (`code`: S-8) · No overlap: —

### 9.10 `WORK_UNIT_CLASS` — cross-cutting classification for `WORK_UNIT`

| Field | Type | Required | Notes |
|---|---|---|---|
| `work_unit_class_id` | internal ID | Yes | Permanent, never reused |
| `code` | string | Yes | Business code |
| `name` | string | Yes | e.g. "Manual Station", "Automated Station" — real values `TBD`, see S-5 |
| `valid_from`, `valid_to` | date | Yes | |

**Keys** (F-00 [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `work_unit_class_id` · Unique: — (`code`: S-8) · No overlap: —

**Deliberately flat, no `parent_class_id`.** Unlike `ASSET_CLASS` ([Equipment Taxonomy
§9.2](04-asset-ontology.md#92-asset_class--top-level-taxonomy)), these four don't self-nest —
each is a simple lookup list scoped to exactly one Site Hierarchy level, not a taxonomy that
gets refined over time. Each node (`SITE`/`AREA`/`WORK_CENTER`/`WORK_UNIT`) carries a single
class FK (§9.3–§9.6) — one class per node, not many-to-many. If a real need for a node to
belong to more than one class at once shows up, that's the signal to add a join table then,
not upfront.

**Purely organizational, same as `ASSET_CLASS`.** These group nodes for reporting/filtering
(e.g. "roll up OEE for every `WORK_CENTER_CLASS = Packaging Line` across all sites") and
carry no attribute values of their own. Nothing in this module's design makes system
behavior depend on which class a node belongs to — that would be a new, explicit rule wired
into the consuming module, not something these classes grant automatically.

### 9.11 `EQUIPMENT_FLOW` — position topology inside one `WORK_CENTER`

> Documented 2026-09-17 to match the shipped Site Hierarchy screen — this entity existed
> in the implementation with no prior FOUNDATION spec; back-filled here rather than left
> undocumented.

| Field | Type | Required | Notes |
|---|---|---|---|
| `equipment_flow_id` | internal ID | Yes | Permanent, never reused |
| `work_center_id` | FK → `WORK_CENTER` | Yes | Both work units below MUST belong to this same work center, enforced at write time — a prior implementation accepted any `WORK_UNIT` plant-wide as either end; that gap is closed |
| `from_work_unit_id` | FK → `WORK_UNIT` | Yes | Must belong to `work_center_id` above |
| `to_work_unit_id` | FK → `WORK_UNIT` | Yes | Must belong to `work_center_id` above. Self-reference (`from_work_unit_id = to_work_unit_id`) rejected; the same `(from_work_unit_id, to_work_unit_id)` pair can't be declared twice |
| `valid_from`, `valid_to` | date | Yes | |

**Keys** (F-00 [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `equipment_flow_id` · Unique: (`from_work_unit_id`, `to_work_unit_id`) — "can't be declared twice" (S-9) · No overlap: —

Despite the entity name, `EQUIPMENT_FLOW` doesn't record which **asset** is involved —
it's a property of **position topology**: which `WORK_UNIT` feeds which, inside one
`WORK_CENTER`. Swapping the machine standing on either `WORK_UNIT` (`ASSET_PLACEMENT`,
[F-04 §9.6](04-asset-ontology.md#96-asset-to-work-unit-placement-rules)) never touches
this table — the line's shape and the machine on it are independent facts. The screen
label reads "Line flow"; the entity name in the implementation is unchanged (renaming it
is a later cleanup, not blocking). A `WORK_UNIT` not yet appearing in any
`EQUIPMENT_FLOW` row for its work center is a normal, expected state (not yet wired into
the line's sequence), not an error condition.

**Confirmed 2026-09-21 (PO) — a different entity from PRD-003's `WORK_UNIT_FLOW`, not the
same one under two names.** `US-FND-AST-003` and `US-FND-KPI-003` cite `WORK_UNIT_FLOW` for
two jobs `EQUIPMENT_FLOW` cannot do: (a) connecting auxiliary equipment that needs its own
tracked Availability — deliberately *not* a `secondary` placement, which has no Availability
of its own (§9.6) — and (b) resolving the neighbouring station for the two-station Quality
derivation path ([PRD-003 `US-FND-KPI-003`](https://github.com/molca-id/prd-molcadx/blob/main/PRD-003-foundation/07-kpi.md#us-fnd-kpi-003)).
Both uses need to name a `WORK_UNIT` **outside** the current `WORK_CENTER` — a line's
two-station Quality check or its auxiliary-equipment chain isn't bounded by one work
center — which `EQUIPMENT_FLOW`'s `work_center_id`-scoped write constraint (this section,
above) structurally rules out. `EQUIPMENT_FLOW` stays what it is: read-only position
topology for the Site Hierarchy screen's "Line flow" panel, one work center only, no asset
and no KPI role. `WORK_UNIT_FLOW` remains a real entity — see §9.12 below, now specified
rather than "who specs it."

### 9.12 `WORK_UNIT_FLOW` — position topology across `WORK_CENTER`s

> Specified 2026-09-21, resolving S-6. `EQUIPMENT_FLOW` (§9.11) and `WORK_UNIT_FLOW` are
> siblings, same shape, different scope — not the same entity under two names. Owned here
> (FOUNDATION, Site Hierarchy) because it's a structural fact about the plant's physical
> layout, exactly like `EQUIPMENT_FLOW`; PRODUCTION reads it, it doesn't own it — same
> read/write split as `ASSET`/`ASSET_PLACEMENT` and `ROUTING`/`OPERATION`.

| Field | Type | Required | Notes |
|---|---|---|---|
| `work_unit_flow_id` | internal ID | Yes | Permanent, never reused |
| `from_work_unit_id` | FK → `WORK_UNIT` | Yes | No `work_center_id` scoping — may belong to any `WORK_CENTER`, including a different one than `to_work_unit_id`'s |
| `to_work_unit_id` | FK → `WORK_UNIT` | Yes | Self-reference and duplicate `(from_work_unit_id, to_work_unit_id)` pairs rejected, same rule as `EQUIPMENT_FLOW` |
| `valid_from`, `valid_to` | date | Yes | |

**Keys** (F-00 [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `work_unit_flow_id` · Unique: (`from_work_unit_id`, `to_work_unit_id`) — same rule as `EQUIPMENT_FLOW` (S-9) · No overlap: —

**Why this can't just be `EQUIPMENT_FLOW` with the `work_center_id` constraint dropped.**
It could be, schema-wise — the shapes are identical. They're kept as two entities instead
of one because they answer different questions for different consumers: `EQUIPMENT_FLOW`
is what the Site Hierarchy screen's "Line flow" panel edits, one work center at a time, for
humans arranging a line. `WORK_UNIT_FLOW` is what the KPI calculation job reads, plant-wide,
to answer "what's physically upstream/downstream of this work unit" regardless of which
work center either side sits in — [F-07.1 §"Quality"](07-1-kpi-tag-mapping.md#quality)'s
neighbouring-station lookup and the auxiliary-equipment-with-its-own-Availability case
(same doc, "Multiple assets under one work unit") both need this.

**Not derived from `ROUTING`/`OPERATION` (`08-work-master.md` §9.1–9.2).** `OPERATION.step_number`
orders stations **per product**, inside one `ROUTING` — a fact about what a specific SKU
does, not about which stations are physically wired together. Two products can route
through the same two stations in either order, or skip one; the physical upstream/downstream
relationship between the stations doesn't change with them. `WORK_UNIT_FLOW` records that
fixed physical fact once; `ROUTING`/`OPERATION` records the per-product path over it. Neither
substitutes for the other.

**No UX screen owns creating/editing `WORK_UNIT_FLOW` yet.** Data model only, resolving the
citation in PRD-003 (`US-FND-AST-003`, `US-FND-KPI-003`) — see S-6a below for who builds the
authoring screen and where it lives.

**Standards line (2026-09-24):** equipment hierarchy / `EQUIPMENT_FLOW` = containment and roles
inside a line (IEC 62264-1 role-based equipment view). `WORK_UNIT_FLOW` = plant-wide position
topology that KPI / process consumers read (work-unit / process-segment scope, ISO 22400). It is
**not** a second copy of the Line-flow editor. Per-product path stays on `ROUTING`/`OPERATION`
(§ above); do not collapse process-segment dependency into the equipment topology screen.

### 9.13 Open questions

| # | Question | Owner |
|---|---|---|
| ~~S-1~~ | ~~How many real sites and areas for the first release?~~ **Resolved: 2 sites for launch — one with 2 areas, one with 4 areas (6 areas total).** | — |
| ~~S-2~~ | ~~Exact storage design for `SITE.timezone`.~~ **Resolved: per-site IANA timezone name (§9.3)** — data itself stays UTC; the field drives per-site shift/`business_date` interpretation. | — |
| S-3 | ~~Is `WORK_UNIT` actually used, or does the model stop at line level?~~ **Resolved: used.** Reflected in §9.6. | — |
| ~~S-4~~ | ~~What line/station naming is already used on the floor?~~ **Resolved: goes in `*_name`, not `*_code`.** `*_code` (§9.3–§9.6) is purely internal, never floor-facing (not printed, scanned, or exported to ERP); `*_name` is free text holding whatever the floor actually calls it. **Partly reversed 2026-09-25 (PO, [decision](../../../LOGS/decisions/2026-09-25-generated-opcua-tag-nodes.md)):** codes are still not floor-facing, but they are now **part of machine addresses** — each is one segment of a generated OPC UA NodeId ([Equipment Taxonomy §9.7.1](04-asset-ontology.md#971-generated-opc-ua-node-address)), e.g. `…;s=JKT1/AS/L01/S03/PCK01/Total_Count` (slash separator since 2026-10-01). Three consequences: (1) the suggested patterns changed from "embeds the parent" (`JKT1-AS-L01-S03`) to **one segment per level** (`JKT1`, `AS`, `L01`, `S03`) so the joined path doesn't repeat; (2) codes may use only letters, digits and `_` (no `/`, no `.`, no `-`, no spaces), checked on every save — **changed 2026-10-02 (PO, 2026-10-02, prd-molcadx#24 item 24):** site, area, work center and class codes may also contain `-` (real plant codes `FI-2`, `FI2-1`). They are cleaned only when a generated address is built: every character that is not a letter, digit or `_` becomes `_`; if two sibling codes clean to the same segment, the save is refused. The address rule is owned by [F-04 §9.7.1](04-asset-ontology.md#971-generated-opc-ua-node-address); (3) a code that appears in a live address is **effectively frozen** — renaming it changes the address the OPC UA server must expose, so the save warns with the number of affected tags (F-04 §9.7.1 rule 7, open A-14). The full dashed form (`JKT1-AS-L01-S03`) is no longer a stored code; screens that need it join the segments. | — |
| S-5 | Real values for `SITE_CLASS`/`AREA_CLASS`/`WORK_CENTER_CLASS`/`WORK_UNIT_CLASS` (§9.7–§9.10) — what groupings does the floor/PO actually need for cross-site rollups and filtering? | Product Owner + Operations |
| ~~S-6~~ | ~~`EQUIPMENT_FLOW` (§9.11) was found already implemented with no prior FOUNDATION spec, and PRD-003 (`US-FND-AST-003`, `US-FND-KPI-003`) already cites a same-shaped `WORK_UNIT_FLOW` entity that was never specified either — are these the same entity?~~ **Resolved 2026-09-21 (PO): no, two different entities, both now specified.** `EQUIPMENT_FLOW` (§9.11) stays scoped to one `WORK_CENTER`. `WORK_UNIT_FLOW` (§9.12, new) is its plant-wide sibling, owned here in FOUNDATION, read by PRODUCTION's KPI job — not derivable from `ROUTING`/`OPERATION` step order (§9.12 explains why). | — |
| S-6a | `WORK_UNIT_FLOW` (§9.12) has no authoring screen yet — Line flow edits `EQUIPMENT_FLOW` only. **Clarified 2026-09-24:** the missing UX is for plant-wide **process/work-unit topology** (KPI consumers), **not** a duplicate equipment-flow editor. Still open: where that authoring lives (SITE panel vs standalone vs defer). Not blocking F-08 / F-07.1 readers. | Product Owner + `foundation-domain` |
| ~~S-7~~ | ~~UX raised `UX-SIT-3`: the implemented data model has no `valid_from`/`valid_to` on `AREA`/`WORK_CENTER`/`WORK_UNIT`, even though §9.4–§9.6 already spec them — was that spec entry a real confirmed need or inherited blindly from the F-00 rule?~~ **Resolved 2026-09-22 (PO): confirmed as spec'd** — `AREA`/`WORK_CENTER`/`WORK_UNIT` keep `valid_from`/`valid_to` exactly as in §9.4–§9.6, needed so a retired line/area/station can disappear from pickers while historical data stays intact (`US-FND-SIT-002`). Separate from `ASSET_PLACEMENT`'s own effective dating, untouched by this decision. No spec change — the remaining gap is implementation adding the columns. | — |
| S-8 | **Keys (2026-10-01).** Uniqueness of `ENTERPRISE.enterprise_code` and of `code` on `SITE_CLASS`/`AREA_CLASS`/`WORK_CENTER_CLASS`/`WORK_UNIT_CLASS` (§9.2, §9.7–§9.10) is not stated. Unique per tenant? Per enterprise? Not listed in their **Keys** lines until decided | `foundation-domain` / PO |
| S-9 | **Keys (2026-10-01).** The code rules on `SITE`/`AREA`/`WORK_CENTER`/`WORK_UNIT` ("unique within …") and the "pair can't be declared twice" rule on `EQUIPMENT_FLOW`/`WORK_UNIT_FLOW` don't say whether they hold over **all rows** (a retired code or pair can never be used again — plain unique index) or only among **active rows** (a deactivated one may come back — then it is a No-overlap rule on `valid_from`/`valid_to`). Listed as Unique for now, as written | `foundation-domain` / PO |
| S-10 | **Codes (2026-10-02).** prd-molcadx#24 item 24 allows `-` in site, area, work center and class codes. Does `WORK_UNIT.work_unit_code` (§9.6) allow `-` too, with the same cleaning when the address is built? Letters, digits and `_` only until decided | `foundation-domain` / PO |

## Next step

The entity spec (§9) is now written using the suggested business-code patterns from
`00-foundation.md` as placeholders. S-1 (2 sites, 6 areas total for launch), S-2 (per-site
IANA `timezone`), and S-4 (`*_code` internal/systematic, `*_name` carries floor naming; since 2026-09-25 one
segment per level and part of generated tag addresses) are all resolved. The real remaining next step is getting **S-5** answered concretely by
Product Owner/Operations — real values for the four cross-cutting `*_CLASS` lookups — before
any site is actually created in the system.
