# F-14 — Audit Trail

> Working spec. Entity spec status: 🟠 NEW — first version, 2026-09-25. Created by Product
> Owner decision (2026-09-25), PRD module code **`AUD`**. It is a separate module, **not** part
> of [Configuration Service](12-configuration-service.md). **Scope widened the same day (PO,
> 2026-09-25): the whole system, not FOUNDATION only.** FOUNDATION owns `AUDIT_LOG` as shared
> infrastructure that every domain writes to — the same way FOUNDATION owns `KPI_RESULT` and
> PRODUCTION writes it.

**In short:** `AUDIT_LOG` is one append-only row per change to a record of **any domain**. It answers
**who** created, edited, deactivated or reactivated the record, **when** they did it, **what the
values were before and after**, and — for effective-dated records — **from when the change is
valid** (`effective_from` / `effective_to`). It never replaces effective dating
(`valid_from`/`valid_to`): effective dating says *when the data is valid for the business*, the
audit trail says *who wrote it and when*, and shows the effective date next to it. Rows are
written by the system in the same transaction as the change and are never edited or deleted.

**Coverage:** every write to an entity of **any domain** — FOUNDATION, PRODUCTION, MAINTENANCE,
and any domain added later — whatever the source: UI, bulk import, API, or a system job (e.g. the
`SHIFT_INSTANCE` generator logs with `source = system` and the job as actor). Each row records the
owning domain and module of the written entity (`domain_code`, `module_code`). Reading the rows is
authorized **per owning module** (`<domain>:<module>:<scope>:audit_view`). PLATFORM (vendor-side,
cross-tenant) is still open (AU-11).

**Who owns what.** FOUNDATION owns the `AUDIT_LOG` shape and the rules in this file. Each domain
owns *which of its writes* happen and may declare its own business actions (core concept 9). No
domain keeps a separate audit log.

## What this module is for

It answers three questions a plant admin or implementor asks every week:

1. **"Who changed this, and when?"** — for one record (e.g. why did the cycle time on
   `OPERATION` "Press 2 / Step 3" change since Tuesday?).
2. **"What did it look like before?"** — the before and after value of each changed field.
3. **"What changed in this period?"** — a search across every module the reader may audit
   (master data, job orders, maintenance checklists, …), with filters, that can be downloaded.

### Where it sits in the platform taxonomy

From the PO's Figma (2026-09-25): every master-data box carries the note *"Log: who made the
dataset / who edited it (detail edit → before after) / who deleted the dataset / downloadable
log"*, and "Library Configuration" has a "Log service" box. Mapped onto the platform taxonomy
([`DOCS/02-domains.md`](../../../DOCS/02-domains.md) §"Taksonomi platform"):

| Taxonomy level | What it is here | Where it shows |
|---|---|---|
| **Feature** — "Audit log" | The Figma "Log service": search, filter and download audit rows across **every module of every domain** the reader holds `audit_view` for. **Central by PO decision (2026-09-25):** one page for the whole system, and every row on it shows the domain and module it came from (§9.2) | Stays in FOUNDATION, under "Library Configuration" in the Master Data module. Screen: `SCR-FND-AUD-001` Audit log, sidebar group "Library configuration" ([UX 14](../UX/14-audit-trail.md); PO, 2026-10-02, prd-molcadx#24 item 23) |
| **Capability** — "History" | Per-record history on **every feature of every domain** — FOUNDATION master data (Site Hierarchy, Shift, Asset, Product, …), PRODUCTION (Job Order, …), MAINTENANCE (PM procedure, …) | A "History" view on each record, reading the same `AUDIT_LOG` rows filtered to that record |

Both read the same entity. There is one audit store for the whole system, not one per module or
per domain. PRODUCTION's "Log (planning)" ([01-planning.md](../../PRODUCTION/DOCS/01-planning.md))
is this same store, not a second one.

**Figma "delete" means FOUNDATION "deactivate".** FOUNDATION never hard-deletes master data
([00-foundation.md](00-foundation.md) shared principle 3). What the Figma calls "who deleted the
dataset" is recorded as `action = deactivate` — the write that sets `valid_to` (or `deleted_at`
on the entities that use that field, e.g. [Reference & Master Data §9.1](05-reference-master-data.md#91-downtime_reason-and-reject_reason)).

## Why it matters — what goes wrong without it

| If you skip this | What happens |
|---|---|
| No record of who changed master data | A wrong cycle time or a deactivated reason code can't be traced to a person or an import. Nobody can answer "why did OEE move since Tuesday" |
| One log per domain | "Who released this job order, and was the routing edited just before?" needs two logs with two shapes, two retention rules and two permission models |
| Only effective dating, no audit | You know a new `OPERATION` version became valid on 1 October, but not who created it, when they did it, or whether it came from a bulk import |
| Audit rows can be edited or deleted | The log proves nothing. An audit trail is only worth something if nobody, including admins, can change it |
| Audit written outside the change's transaction | The log says a change happened that was actually rolled back, or misses a change that did happen |
| One log per module | "What changed in site JKT1 last week" needs a search across ten tables with ten shapes |

## Core concepts

**1. One row per change, per record.** Every successful create, update, deactivate, reactivate or
domain business action (core concept 9) on one record writes exactly one `AUDIT_LOG` row. The row lists every field that
changed, each with its before and after value. A bulk import of 500 rows writes up to 500 audit
rows, all sharing one `import_batch_id`.

**An effective-dated edit is one change, not two.** In the database, editing a time-variant
value closes the old row (`valid_to`) and opens a new row (`valid_from`)
([00-foundation.md](00-foundation.md) §"Effective dating"). In the audit trail that is **one**
`AUDIT_LOG` row (`action = update`): it links both rows (`previous_version_entity_id` = old row,
`entity_id` = new row), lists the business fields that changed with before and after, and carries
the effective dates (`effective_from` = new row's `valid_from`, `effective_to` = old row's
`valid_to`). A deactivation records the `valid_to` it set in `effective_to`. The reader sees
"who changed what, when they did it, and from when it applies" in one line.

**2. Audit trail and effective dating answer different questions. Neither replaces the other —
the audit row shows both.**

| | Effective dating (`valid_from`/`valid_to`) | Audit trail (`AUDIT_LOG`) |
|---|---|---|
| Question | When is this value valid for the business? | Who wrote this, and when? |
| Time axis | Business time (can be future or past) | Write time (always "now", UTC) |
| Lives on | The master record itself | A separate append-only row |
| Used by | KPI formulas, pickers, history-correct reports | Traceability, investigation, compliance |

*Example.* On **2026-09-25** at 09:14 UTC, implementor Rina changes the standard cycle time of an
`OPERATION` from 20 s to 18 s, effective **2026-10-01**.

- **Effective dating** (on the master rows): the old row `op-77` gets `valid_to = 2026-09-30`;
  a new row `op-78` opens with cycle time 18 s and `valid_from = 2026-10-01`.
- **Audit trail** (one `AUDIT_LOG` row): *on 2026-09-25 09:14 UTC, Rina changed cycle time
  20 s → 18 s, effective 2026-10-01* — `action = update`, `previous_version_entity_id = op-77`
  (closed), `entity_id = op-78` (opened), `effective_to = 2026-09-30`,
  `effective_from = 2026-10-01`. See the row in §9.3.

KPI calculation for 2026-09-28 still uses 20 s — the audit trail doesn't change that. And if
someone asks on 2026-10-03 "who set 18 s, and when?", effective dating can't answer; the audit
trail can.

**3. Written in the same transaction as the change.** The audit row and the change it describes
commit together or not at all. A failed or rejected change (validation error, blocked
deactivation, conflict) writes **no** audit row. The audit trail records what *happened* to the
data, not what someone *tried*.

**4. Append-only, for everyone.** No UI, API, import or admin action edits or deletes an audit
row. There is no `update` or `deactivate` action on `AUDIT_LOG` at any scope
([permissions](00-1-authorization-permissions.md#audit-trail-aud--14-audit-trailmd-9)).
Removing rows is only ever the result of the retention rule: 3 years (AU-1); what happens after is AU-1b.

**5. The actor comes from the IDP; FOUNDATION stores no users.** FOUNDATION stores no users or
roles ([ABAC contract](00-foundation.md#authorization-attribute-contract-abac--what-foundation-exposes-what-stays-in-the-idp)).
The audit row stores the IDP subject id (`actor_subject_id`, the token's `sub`) as the
reference. It also stores a **snapshot** of the display name at write time
(`actor_display_name`). Reason: IDP accounts get renamed or removed, and a history screen that
shows a bare UUID for a person who left last year is useless. The snapshot is personal data, so
it is kept permanently and never blanked, even on a deletion request (AU-3, resolved
2026-09-25); the customer records the legal basis at onboarding. The snapshot is never used for authorization.

**A system job is an actor too.** When a job writes an entity (`source = system`),
`actor_type = service`, `actor_subject_id` is the job's IDP service-account subject, and
`actor_display_name` is the job's name (e.g. "Shift instance generator"). This holds whichever
domain built the job and whichever domain owns the entity.

**6. Scope is snapshotted at write time.** ABAC decides who may read which audit rows. Each row
therefore stores the Site Hierarchy chain the changed record resolved to **at the moment of the
write** (`tenant_id` → … → `work_unit_id`, down to the level the record resolves to). It is a
snapshot, not a live join: if an asset is later moved to another site, its old audit rows stay
readable to the site that owned it then. Entities whose own scope is still `TBD` (e.g. `PRODUCT`
family, P-1 in [00-1-authorization-permissions.md](00-1-authorization-permissions.md)) record
`tenant` scope until that question is answered. For other domains' entities, the owning domain
says which Site Hierarchy node its entity resolves to (e.g. `WORK_ORDER`'s site scope is
`production-domain`'s call, former P-2); until it does, the row records `tenant` scope.

**7. Only writes and downloads are logged, not reads.** Opening a record or a History view writes
nothing. Downloading audit rows **is** logged, as its own `AUDIT_LOG` row (`action = download`),
because a download takes data out of the system. Downloading a domain's own data (a schedule, a
report) is logged too, as that domain's **download business action** (core concept 9), not as
`download`. Whether reads should ever be logged is AU-4
(proposed: no).

**8. Secrets are never copied into the audit trail.** Some fields hold credentials, e.g.
`DATA_SOURCE.connection_config` ([Data Source §9.1](13-data-source.md#91-data_source--one-connectionendpoint)).
For such fields the audit row records *that* the field changed, never the value. Which fields are
flagged secret is decided by the owning module; today only `connection_config` is a known case
(AU-6).

**9. Generic actions plus domain business actions.** Every domain uses the generic actions
`create` / `update` / `deactivate` / `reactivate` (and `download`, only for downloading audit rows
themselves). A domain
**may declare its own business actions** on its own entities when a generic `update` would hide
what happened — a job order being *released* is not the same event as its quantity being edited.
The owning domain declares the action name and its meaning in its own spec; FOUNDATION does not
invent them. Every business action still carries `changes` (before → after, e.g.
`status: draft → released`) and a **reason** wherever a person acts (AU-2).
**This includes `release` and `upload`** (PO, 2026-10-02, prd-molcadx#24 item 23): a person who
releases a job order gives a reason, and a schedule upload takes one reason for the whole upload,
copied to every row of its `import_batch_id` (same as a bulk import). Rule 5 already said "every
business action"; this names the two that were asked about. The only business actions without a
reason are the `*_downloaded` ones (below).

Known so far — PRODUCTION needs at least:

| Action | Typical entity | Before → after example |
|---|---|---|
| `release` | `WORK_ORDER` | `status: draft → released` |
| `hold` / `resume` | `WORK_ORDER` | `status: in_progress → on_hold` / back |
| `cancel` | `WORK_ORDER` | `status: released → cancelled` |
| `upload` | `WORK_ORDER` (schedule upload) | one row per created/changed job order, shared `import_batch_id` |
| `reason_corrected` | `WORK_ORDER_OPERATION_DEFECT` | `reject_reason_id: A → B` |
| `rework_added` | `WORK_ORDER_OPERATION_DEFECT` | new rework quantity row |
| `report_reset` / `report_overridden` / `report_approved` | a report entity **not modeled yet** (`production-domain`) | `TBD` until that entity exists |

**Download business actions (PO, 2026-09-25).** When a user downloads a domain's own data — not
audit rows — the owning domain logs it under its own action name, ending in `_downloaded`. The
generic `download` stays reserved for downloading audit rows (`entity_type = AUDIT_LOG`). A download
business action is the one kind of business action with **no `changes`**: nothing changed. Instead it
fills `download_filter` (what was downloaded) and `download_row_count`, like a `download` row.
`entity_id` is empty when the file covers many records. No reason is asked, as for `download`
(PO, 2026-09-25). Scope snapshot: the scope of the filter used (e.g. the site the schedule was
filtered to), `tenant` if unfiltered (PO, 2026-09-25).

| Action | Domain · module | Typical entity | What is recorded |
|---|---|---|---|
| `schedule_downloaded` | PROD · `PLN` | `WORK_ORDER` | `download_filter` (date range, work units), `download_row_count` |
| `report_downloaded` | PROD · `PRF` | a report entity **not modeled yet** | `download_filter` (report, period, scope), `download_row_count` |

The exact entity each PRODUCTION action applies to is `production-domain`'s to confirm (AU-12).

## What is covered

Every write to an entity of **any domain**, **whatever the source**: UI, bulk import, API, or a
system job (PO rule, 2026-09-25). Today that is:

**FOUNDATION (`FND`)**

| Module | Entities |
|---|---|
| [Site Hierarchy](01-site-hierarchy.md) | `TENANT`, `ENTERPRISE`, `SITE`, `AREA`, `WORK_CENTER`, `WORK_UNIT`, `SITE_CLASS`, `AREA_CLASS`, `WORK_CENTER_CLASS`, `WORK_UNIT_CLASS`, `EQUIPMENT_FLOW`, `WORK_UNIT_FLOW` |
| [Shift](02-shift.md) | `ENTERPRISE_SHIFT`, `SITE_SHIFT`, `SHIFT_INSTANCE` (generated by `production-domain`'s job → `source = system`, job as actor; B1) |
| [Yearly & Quarterly Declaration](03-yearly-quarterly-declaration.md) | `FISCAL_YEAR` |
| [Equipment Taxonomy](04-asset-ontology.md) | `ASSET_CLASS`, `ASSET_TYPE`, `ASSET`, `ASSET_PLACEMENT`, `ASSET_TAGS`, `ASSET_PRODUCT_CODES` |
| [Reference & Master Data](05-reference-master-data.md) | `DOWNTIME_REASON`, `DOWNTIME_REASON_ASSET`, `REJECT_REASON`, `REJECT_REASON_ASSET`, `TIME_CONVERSIONS`, `MEASUREMENT_GROUP`, `UNIT_OF_MEASUREMENTS` |
| [Product](06-product.md) | `PRODUCT`, `PRODUCT_DETAIL`, `PRODUCT_UOM_CONVERSION` (`PRODUCT_CYCLE` retired 2026-09-28; rows already logged for it stay readable) |
| [KPI tag mapping](07-1-kpi-tag-mapping.md) | `WORK_UNIT_KPI_BINDING`; `KPI_RESULT` (written by `production-domain`'s calc job → `source = system`; volume question AU-5); `KPI_FORMULA_SLOT` / `KPI_PARAMETERS` (seeded catalogs — logged when a seed/migration writes them, `source = system`) |
| [Work Master](08-work-master.md) | `ROUTING`, `OPERATION`, `BOM`, `BOM_LINE` |
| [Data Source](13-data-source.md) | `DATA_SOURCE` |

**PRODUCTION (`PROD`)**

| Module | Entities |
|---|---|
| Production Planning (`PLN`) — [01-planning.md](../../PRODUCTION/DOCS/01-planning.md) | `WORK_ORDER`, `WORK_ORDER_OPERATION`, `WORK_ORDER_OPERATION_DEFECT`, `WORK_ORDER_OPERATION_LOT` |

**MAINTENANCE (`MNT`)**

| Module | Entities |
|---|---|
| Asset History (`AST`) — [01-asset-history.md](../../MAINTENANCE/DOCS-EN/01-asset-history.md) | `ASSET_COMPONENT_LINK` |
| Work Master (`WMS`) — [02-work-master.md](../../MAINTENANCE/DOCS-EN/02-work-master.md) | `PM_PROCEDURE`, `PM_PROCEDURE_STEP` |

**Any entity of any domain added later is covered by default.** Its spec does not need to opt
in; it only needs to say which `module_code` owns it and which scope it resolves to.

**Not settled yet:**

- **PLATFORM** (vendor-side, cross-tenant, e.g. `TENANT_DOMAIN_ENTITLEMENT`) — covered or not is
  open (AU-11). Its rows have no tenant scope, which the scope snapshot (core concept 6) assumes.
- **`ASSET_STATE_LOG`** — owner settled 2026-09-28: PRODUCTION ([decision 2026-09-28](../../../LOGS/decisions/2026-09-28-asset-status-ownership.md)), so
  `domain_code` = `PROD`, `module_code` = `MON` ([PRODUCTION Monitoring](../../PRODUCTION/DOCS/02-monitoring.md#asset_state_log--operational-state-per-asset-over-time)).
- **Workflow Engine / Notification / Integration / Configuration Service** — concept-only, no
  entities to audit yet. See "Related modules" for how F-12's history relates.

## How the entities connect

```
<any record of any domain>  (domain_code + module_code + entity_type + entity_id, no hard FK)
  ← AUDIT_LOG  (one row per change; many rows per record over time)       [§9.1]
       → tenant_id / enterprise_id / site_id / … / work_unit_id  (scope snapshot for ABAC)
       → actor_subject_id  (IDP subject, not a FOUNDATION entity)
```

`AUDIT_LOG` has no foreign key to the records it describes. It points at them by
`entity_type` + `entity_id` so one table can cover every entity of every domain, and so an audit row
stays valid even though the record it points at can itself never be hard-deleted.

## Common pitfalls

1. **Treating effective dating as the audit trail.** `valid_from`/`valid_to` say when a value is
   valid for the business, not who wrote it or when. Keep both.
2. **Treating the audit trail as effective dating.** Don't reconstruct "what was the cycle time
   on 28 September" from audit rows. That's what the effective-dated master rows are for.
3. **Writing the audit row outside the change's transaction.** It either lies (rollback after the
   log) or misses changes (crash before the log).
4. **Logging failed attempts as changes.** A rejected save writes no audit row. Import error
   reports are a separate artifact, not audit rows.
5. **Giving admins an "edit" or "clean up" button on the log.** Nobody edits or deletes audit
   rows. Not even `foundation-domain` in-product.
6. **Copying secrets into before/after values.** Record that `connection_config` changed, never
   its content.
7. **Using `actor_display_name` for anything but display.** It is a snapshot. Identity and
   authorization always go through `actor_subject_id` and the IDP.
8. **Scoping audit reads by the record's *current* location.** Scope is snapshotted at write time
   (core concept 6).
9. **Building a second audit log in another domain.** There is one store. A domain adds its
   entities and business actions to it; it does not build its own.
10. **Hiding a business event inside a generic `update`.** If a domain has a named transition
    (release, hold, cancel), declare it as a business action (core concept 9).
11. **Letting the Audit log feature bypass module permissions.** It only returns rows whose
    `module_code` the reader holds `audit_view` for.

## Standards this module draws on

| Standard | Relevance |
|---|---|
| **ISA-95 / IEC 62264-3** | Master-data management activities expect a record of changes to definitions (equipment, material, process segments) |
| **21 CFR Part 11 / EU GMP Annex 11** *(reference only, not a stated Molca requirement)* | The usual shape of a regulated audit trail: who, when, before/after, reason, secure and not editable. Whether any Molca customer actually needs Part 11 compliance is `TBD — needs PO confirmation` (see AU-2) |

## Related modules

| Module | Relationship |
|---|---|
| Every FOUNDATION master-data module (F-01 … F-08, F-13) | Their writes produce `AUDIT_LOG` rows; each master-data feature shows the "History" capability read from this module |
| PRODUCTION ([01-planning.md](../../PRODUCTION/DOCS/01-planning.md)) and MAINTENANCE ([DOCS-EN](../../MAINTENANCE/DOCS-EN/README.md)) | Write their entities' changes to `AUDIT_LOG` with their own `domain_code`/`module_code`, and declare their business actions (core concept 9). PRODUCTION's "Log (planning)" is this store. Neither has a permission catalog yet; their read strings follow the same `<domain>:<module>:<scope>:audit_view` pattern |
| [Configuration Service (F-12)](12-configuration-service.md) | F-12 core concept 4 requires "history & rollback" for configuration values. **Overlap:** both record who / when / before → after. **Difference:** F-12 also needs *rollback* (restore a previous version), which the audit trail never offers — `AUDIT_LOG` is read-only evidence, not a version store. F-12 has no entities yet; when it is modeled, whether configuration writes also land in `AUDIT_LOG` (proposed: yes, as FOUNDATION writes) is AU-7 |
| [Workflow Engine (F-09)](09-workflow-engine.md) | F-09 core concept 5 ("auditability") is about the history of one *workflow instance* (which step, which branch). That is workflow runtime state, not a write to a FOUNDATION record, and is not stored here |
| [F-00.1 Authorization catalog](00-1-authorization-permissions.md#audit-trail-aud--14-audit-trailmd-9) | Declares the per-module read pattern `<domain>:<module>:<scope>:audit_view` / `:audit_download`. `AUD` has no permission of its own |
| [FLOW-06 Change control](../FLOW/06-change-control.md) | Its "Edit in place with audit trail" step is this module |

## What's still unknown

| # | Question | Who needs to answer it |
|---|---|---|
| ~~AU-1~~ | **Resolved 2026-09-25 (PO): rows are kept 3 years** from `occurred_at`. **Still open (AU-1b):** what happens after 3 years — purge, or archive to cold storage? Until answered, nothing older than 3 years is deleted | PO + `engineering-domain` (AU-1b) |
| ~~AU-2~~ | **Resolved 2026-09-25 (PO): a reason is required.** Applied as: required on every `update`, `deactivate` and `reactivate` made by a person (`source` = `ui` or `api`); one reason per bulk import, copied to every row of that `import_batch_id`; not asked on `create` (optional) or on `source = system` (the job's name is the reason). The save is refused without it | — |
| ~~AU-3~~ | **Resolved 2026-09-25 (PO): keep the name.** `actor_display_name` is stored and **never blanked**, not even on a deletion request — the audit row stays fully append-only. The legal basis for keeping it (company policy / employment contract under Indonesia's PDP Law) must be recorded by the customer at onboarding; that is a contract task, not a system feature | — |
| AU-4 | **Are reads/views ever logged?** Proposed: **no** — only writes and downloads. Confirm, or name the records whose viewing must be logged | PO |
| AU-5 | **Volume of system-job rows.** Per the PO rule, `SHIFT_INSTANCE` and `KPI_RESULT` writes by `production-domain` jobs are covered. `KPI_RESULT` may be written very often (per work unit, per calc run). Is one audit row per result row acceptable, or should a calc run write one summary row per run (with `transaction_id`)? Affects storage and AU-1 | PO + `production-domain` + `engineering-domain` |
| AU-6 | **Which fields are secret?** Only `DATA_SOURCE.connection_config` is known today (masked, core concept 8). Each module must flag its own secret fields; is there any other? | `foundation-domain` + `engineering-domain` |
| AU-7 | **Does Configuration Service (F-12) write into `AUDIT_LOG` once modeled?** Proposed: yes for the who/when/before-after record; rollback stays F-12's own feature | `foundation-domain` + PO |
| ~~AU-8~~ | **Resolved 2026-09-25 (PO): yes, its own permission — now per owning module** (PO, 2026-09-25, system-wide scope). `<domain>:<module>:<scope>:audit_view` (e.g. `foundation:sit:site:audit_view`) is separate from `view` on the record itself — a person who can see a `SITE` does not automatically see who edited it. Replaces the earlier `foundation:aud:<scope>:view` | — |
| AU-9 | **Download format and size limit.** Proposed CSV (same format family as `import`). Is there a row limit per download, and is it synchronous or a background job? | PO + `engineering-domain` |
| AU-10 | **Reactivation.** `reactivate` is in the action list, but no FOUNDATION module says today whether a deactivated record can be reactivated (clearing `valid_to` / `deleted_at`) or must be recreated as a new row. Per-entity decision in each module | `foundation-domain` |
| AU-11 | **Is PLATFORM covered?** PLATFORM entities (e.g. `TENANT_DOMAIN_ENTITLEMENT`, still a sketch in [PLT-01](../../PLATFORM/DOCS-EN/01-license-manager.md)) are vendor-side and cross-tenant: their rows have no `tenant_id` scope, and tenant users must never read them. Covered by `AUDIT_LOG` (then how is it scoped and who reads it), or a separate vendor-side log? Not decided | PO + `platform-domain` |
| AU-12 | **PRODUCTION business actions — exact entity and meaning.** Which entity each of `release`, `hold`, `resume`, `cancel`, `upload`, `reason_corrected`, `rework_added` applies to, and what counts as the change (core concept 9 is a first mapping). The three `report_*` actions wait on the report entity, not modeled yet | `production-domain` |
| AU-13 | **Who reads download rows?** A `download` row belongs to `AUD`, and `AUD` has no permission of its own. Proposed: a download row is visible to a subject who holds `audit_view` for every `module_code` in its `download_filter` | PO |
| AU-14 | **Keys (2026-10-01).** `changes` (§9.1) is a list of `{field, before, after}`, and F-00 keys rule 5 forbids list-valued columns in a stored entity. A child table (one row per changed field, own PK, FK to `audit_log_id`), or other storage? `TBD` until modelled | `foundation-domain` + `engineering-domain` |

## 9. Entity specification

> 🟠 NEW — first pass. Physical storage (partitioning, indexes, write path) belongs to
> `engineering-domain`.

### 9.1 `AUDIT_LOG` — one append-only row per change

One row per successful change to one record of any domain, plus one row per download of audit
rows.
Not time-variant: no `valid_from`/`valid_to` — a row is a fact about one moment and never changes.

| Field | Type | Required | Notes |
|---|---|---|---|
| `audit_log_id` | internal ID | Yes | Permanent, never reused |
| `occurred_at` | timestamp (UTC) | Yes | Write time = commit time of the change's transaction. Never business time — that is the record's own `valid_from`/`valid_to` |
| `domain_code` | string | Yes | Owning domain of the written entity, the PRD domain code: `FND` / `PROD` / `MNT` / … `FND` for a download row. Read-permission key, with `module_code` |
| `module_code` | string | Yes | Owning module of the written entity, the PRD module code within that domain: e.g. `SIT`, `WMS` (FND) · `PLN` (PROD) · `AST`, `WMS` (MNT). `AUD` for a download row. Codes are only unique within a domain (`WMS` exists in FND and MNT), so always read with `domain_code` |
| `action` | string | Yes | Generic: `create` / `update` / `deactivate` / `reactivate` / `download` (`download` = audit rows only; a domain's own data uses its `*_downloaded` business action, core concept 9). Plus any **business action** the owning domain declares for its entity (core concept 9, e.g. PRODUCTION `release`, `hold`, `cancel`). **No `delete`** — FOUNDATION never hard-deletes; the Figma "delete" is `deactivate` (sets `valid_to`, or `deleted_at` on entities using that field). An effective-dated edit (close old row + open new row) is **one** `update` row, not a `deactivate` plus a `create`. `reactivate` only where the owning module allows it (AU-10). `download` is used only with `entity_type = AUDIT_LOG` |
| `entity_type` | string | Yes | Canonical entity name as written in the owning module's spec, e.g. `SITE`, `OPERATION`, `WORK_ORDER`, `PM_PROCEDURE`. `AUDIT_LOG` for a download row |
| `entity_id` | internal ID | Yes, except `download` | The record's internal ID (`*_id`) after the change. For an effective-dated edit: the **new** row's ID (the row that was opened). No hard FK — polymorphic across entities. Empty for `download` |
| `entity_code` | string | No | Snapshot of the record's business code at write time (e.g. `JKT1-AS-L01`), for readable search. Display only — the record is identified by `entity_id` ([00-foundation.md](00-foundation.md) ID rules) |
| `previous_version_entity_id` | internal ID | Yes for an effective-dated edit | The **old** row's ID — the row this change closed. Together with `entity_id` it links both rows of one close-and-open change, so the History capability can follow one business record across versions. Empty for in-place edits, creates of a brand-new record, deactivations and downloads |
| `effective_from` | date | Yes when the change sets a `valid_from` | The business date the change starts to apply: the new row's `valid_from` (effective-dated edit or `create`). Empty for entities without `valid_from`/`valid_to` (e.g. `deleted_at` entities) |
| `effective_to` | date | Yes when the change sets a `valid_to` | The business date the old value stops applying: the old row's `valid_to` (effective-dated edit), or the `valid_to` a `deactivate` set. For `deleted_at` entities (e.g. `DOWNTIME_REASON`), the `deleted_at` date |
| `changes` | list of `{field, before, after}` | Yes for every action except `download` and `*_downloaded` | Every business field that changed. For an effective-dated edit: `before` = value on the old row, `after` = value on the new row (e.g. cycle time 20 s → 18 s); the `valid_from`/`valid_to` pair is carried in `effective_from`/`effective_to`, not repeated here. `create`: `before` empty for every field. Unchanged fields are not listed. Secret fields: listed with `before`/`after` masked, never the value (core concept 8, AU-6). Empty for `download` |
| `reason` | string | Yes for `update` / `deactivate` / `reactivate` / any business action by a person, and for `source = import` | Free text the user gave (AU-2, resolved 2026-09-25). One reason per import batch, copied to its rows. Optional on `create`; empty for `source = system` |
| `source` | enum | Yes | `ui` / `import` / `api` / `system`. `system` = a job, not a person — whichever domain built it (e.g. `production-domain`'s `SHIFT_INSTANCE` generator) |
| `import_batch_id` | internal ID | Yes when `source = import` | Same value on every audit row written by one bulk import. Rejected import rows write no audit row (core concept 3) |
| `transaction_id` | internal ID | Yes | Groups audit rows written in one transaction — e.g. one save that changes several records, or one system-job run |
| `actor_type` | enum | Yes | `user` / `service`. `service` whenever `source = system` |
| `actor_subject_id` | string | Yes | IDP subject id (`sub`) of the person, or of the job's service account, that made the write. Not a FK — FOUNDATION stores no users |
| `actor_display_name` | string | No | Snapshot at write time: the person's display name from the IDP token, or the job's name (e.g. "Shift instance generator"). Display only, never used for authorization. Kept permanently, never blanked (AU-3, resolved 2026-09-25). |
| `tenant_id` | internal ID | Yes | Scope snapshot at write time (core concept 6). Always filled |
| `enterprise_id`, `site_id`, `area_id`, `work_center_id`, `work_unit_id` | internal ID | No | Scope snapshot, filled down to the level the record resolved to at write time, empty below it. Entities with `TBD` scope (e.g. `PRODUCT` family, P-1) fill `tenant_id` only |
| `scope_level` | enum | Yes | `tenant` / `enterprise` / `site` / `area` / `work_center` / `work_unit` — the deepest level filled above. What ABAC evaluates against |
| `download_filter` | key-value | Yes for `download` and `*_downloaded` | The filter used for the download (period, domains/modules, entity types, scope, actor, action). Empty otherwise |
| `download_row_count` | integer | Yes for `download` and `*_downloaded` | Number of rows in the downloaded file (audit rows for `download`, the domain's rows for `*_downloaded`). Empty otherwise |

**Keys** (F-00 [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `audit_log_id` · Unique: — · No overlap: — (not effective-dated)

### 9.2 Rules

- **Append-only.** No UI, API, import or admin path updates or deletes an `AUDIT_LOG` row. The
  only removal ever allowed is the retention rule: rows are kept **3 years** (AU-1); what happens
  after that is AU-1b.
- **A reason is required** on every `update`, `deactivate`, `reactivate` and business action a
  person makes, and once per bulk import (AU-2). A save without it is refused before anything is written.
  **Named explicitly: `release` and `upload` need a reason too** — `upload` takes one reason per upload,
  copied to every row of its batch. Only `download` and the `*_downloaded` actions take none (PO, 2026-10-02,
  prd-molcadx#24 item 23).
- **Same transaction.** The audit row commits in the same transaction as the change. If the
  change fails or is rejected, no audit row exists.
- **Written by the system only.** No user creates an audit row directly. The permission catalog
  has no `create`/`update`/`deactivate`/`import` action for `AUD`.
- **Every covered write produces a row.** A write path to a covered entity that skips the audit
  row is a defect, not a configuration choice. This applies to every domain's write paths and
  every job.
- **Every row names its owner.** `domain_code` + `module_code` are always the owner of the written
  entity, never the domain of the screen or job that made the write.
- **One close-and-open = one audit row.** An effective-dated edit writes exactly one row with
  `previous_version_entity_id` (old, closed), `entity_id` (new, opened), `effective_to` and
  `effective_from`. Never two separate rows for the close and the open.
- **Downloads are recorded.** Every download of audit rows writes one `AUDIT_LOG` row
  (`action = download`) in the same transaction that produces the file.
- **Reads are not recorded.** Opening a record, the History view or the Audit log feature writes
  nothing (AU-4).
- **Read access is per owning module**, ABAC on `domain_code` + `module_code` + the scope
  snapshot: `<domain>:<module>:<scope>:audit_view` to read (History capability, Audit log
  feature), `<domain>:<module>:<scope>:audit_download` to download. `<domain>` is the permission
  prefix (`foundation`, `production`, `maintenance`), `<module>` the lower-case module code. A
  claim at a broader level (e.g. `enterprise`) covers rows snapshotted below it.
- **The Audit log feature has no permission of its own.** It searches across modules but returns
  only rows whose `module_code` the reader holds `audit_view` for at a covering scope; a download
  contains only rows the reader holds `audit_download` for. A reader with no `audit_view`
  anywhere sees an empty feature, not an error.
- **The Audit log feature always shows where a row came from** (PO, 2026-09-25). Every row on the
  page shows its domain and module by name (e.g. "PRODUCTION · Production Planning", "FOUNDATION ·
  Site Hierarchy" — the names in the PRD module code table, [`AGENTS.md`](../../../AGENTS.md) §4),
  read from `domain_code` + `module_code`. Opening a row goes to the record's screen **in its owning
  module** (a `WORK_ORDER` opens in Production Planning), not a FOUNDATION page. Every downloaded
  file has `domain_code` and `module_code` columns.

### 9.3 Example rows

**Effective-dated edit** — core concept 2's example: *on 2026-09-25 Rina changed cycle time
20 s → 18 s, effective 2026-10-01.*

Master rows after the save (effective dating, [Work Master §9.2](08-work-master.md#92-operation--one-step-of-a-routing-at-one-work-unit-with-its-standard)):

| `OPERATION` row | `cycle_time_value` | `valid_from` | `valid_to` | What happened |
|---|---|---|---|---|
| `op-77` | 20 s | 2026-01-01 | **2026-09-30** | Closed by this change |
| `op-78` | **18 s** | **2026-10-01** | — | Opened by this change |

The one audit row that describes it:

| Field | Value |
|---|---|
| `audit_log_id` | `a-101` |
| `occurred_at` | 2026-09-25 09:14:03Z |
| `action` | `update` |
| `entity_type` / `entity_code` | `OPERATION` / `JKT1-AS-L01-S03 step 3` |
| `previous_version_entity_id` → `entity_id` | `op-77` (closed) → `op-78` (opened) |
| `effective_to` / `effective_from` | 2026-09-30 / 2026-10-01 |
| `changes` | `cycle_time_value`: 20 → 18 (seconds) |
| `reason` | "New die, trial confirmed" |
| `source` / `actor_type` | `ui` / `user` |
| `actor_subject_id` / `actor_display_name` | `9f3c…` / Rina |
| `scope_level` | `work_unit` (full chain snapshotted) |

**Deactivation** — a downtime reason deactivated from the Reference screen:

| `action` | `entity_type` | `effective_to` | `changes` | `reason` |
|---|---|---|---|---|
| `deactivate` | `DOWNTIME_REASON` | 2026-09-25 (`deleted_at`) | `deleted_at`: empty → 2026-09-25 10:02Z | "Merged into code DT-07" |

**PRODUCTION business action** — a supervisor releases a Job Order:

| Field | Value |
|---|---|
| `occurred_at` | 2026-09-25 13:40:11Z |
| `domain_code` / `module_code` | `PROD` / `PLN` |
| `action` | `release` |
| `entity_type` / `entity_code` | `WORK_ORDER` / `WO-2026-00184` |
| `changes` | `status`: `draft` → `released`; `routing_version_locked`: empty → locked version; `bom_version_locked`: empty → locked version |
| `reason` | "Material staged, line 1 free from 14:00" |
| `source` / `actor_type` / `actor_display_name` | `ui` / `user` / Budi (supervisor) |
| `scope_level` | `tenant` until `production-domain` settles `WORK_ORDER`'s site scope (core concept 6) |
| Who can read it | a subject holding `production:pln:<scope>:audit_view` |

**System job** — the `SHIFT_INSTANCE` generator (built by `production-domain`)
creates tomorrow's instances:

| `action` | `entity_type` | `source` | `actor_type` | `actor_display_name` | `transaction_id` |
|---|---|---|---|---|---|
| `create` | `SHIFT_INSTANCE` | `system` | `service` | Shift instance generator | `tx-run-0926` (same for every instance of this run) |

## Next step

AU-1 (3 years), AU-2 (reason required), AU-3 (keep the name) and AU-8 (own read permission, now
per module) are resolved. Next:

1. **AU-1b** (after 3 years) before engineering designs storage — volume is now system-wide.
2. **AU-11** (PLATFORM) and **AU-13** (who reads download rows) — PO.
3. **AU-12** — `production-domain` confirms its business actions; MAINTENANCE declares any of its own.
4. PRODUCTION and MAINTENANCE add their `audit_view` / `audit_download` strings when they write a
   permission catalog.
5. The Audit log feature's screen is declared: `SCR-FND-AUD-001` in [UX 14](../UX/14-audit-trail.md)
   (PO, 2026-10-02, prd-molcadx#24 item 23). The History capability's per-record screens are still to be
   declared in `UX/` (FOUNDATION first; other domains in their own UX series). **AU-9** (download format)
   is open for the PO.
