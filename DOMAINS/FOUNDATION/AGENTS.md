# AGENTS.md — Domain FOUNDATION

Index and working contract for **FOUNDATION** (agent: `foundation-domain`).
Part of MolcaDx. Global rules still apply: [`../../AGENTS.md`](../../AGENTS.md).

| | |
|---|---|
| **Agent name** | `foundation-domain` |
| **Created** | 2026-08-07 |
| **Requested by** | Product Owner |
| **Status** | 🟢 Active |
| **Agent definition** | [`../../.claude/agents/foundation-domain.md`](../../.claude/agents/foundation-domain.md) |

---

## 1. Mission

Be the **single source of truth for MolcaDx's base data model**: what an asset is, where it
sits, who owns it, what work runs on it, and when that work's clock runs, so every other
domain uses the same definitions, IDs, and hierarchy.

## 2. Document index (`DOMAINS/FOUNDATION/DOCS-EN/`)

**Working source:** English specs in [`DOCS-EN/`](DOCS-EN/README.md). One module = one file:
concept plus §9 when entities are modeled. The old Indonesian `DOMAINS/FOUNDATION/DOCS/` tree is
gone (git history still has it).

| # | Module | Document | Contents | Status |
|---|--------|----------|----------|--------|
| F-00 | — | [00-foundation.md](DOCS-EN/00-foundation.md) | Cross-module map: shared principles, ERD, ID/code/effective-dating rules | 🟡 DRAFT |
| F-00.1 | — | [00-1-authorization-permissions.md](DOCS-EN/00-1-authorization-permissions.md) | Authorization permission catalog: `foundation:<module>:<scope>:<action>` illustrative encoding, one row per module/scope/action grounded in each module's §9 | 🟡 DRAFT |
| F-01 | Site Hierarchy | [01-site-hierarchy.md](DOCS-EN/01-site-hierarchy.md) | Enterprise → site → area → work center → work unit | 🟢 ACTIVE |
| F-02 | Shift | [02-shift.md](DOCS-EN/02-shift.md) | Enterprise shift / site shift / shift instance; shift clock is POT, not PBT | 🟢 ACTIVE — `SHIFT_INSTANCE` generator owned by `production-domain` ([B1 closed](../../LOGS/decisions/2026-09-10-b1-shift-instance-generator-owner.md)) |
| F-03 | Yearly & Quarterly Declaration | [03-yearly-quarterly-declaration.md](DOCS-EN/03-yearly-quarterly-declaration.md) | Fiscal year/quarter window (`FISCAL_YEAR`) | 🟢 ACTIVE |
| F-04 | Equipment Taxonomy | [04-asset-ontology.md](DOCS-EN/04-asset-ontology.md) | Assets, classification, placement, tags | 🟡 DRAFT |
| F-05 | Reference & Master Data | [05-reference-master-data.md](DOCS-EN/05-reference-master-data.md) | Downtime/reject reasons, UOM, time conversion | 🟠 NEW |
| F-06 | Product | [06-product.md](DOCS-EN/06-product.md) | Product identity and UOM | 🟠 NEW |
| F-07 | KPI formula | [07-0-kpi-formula.md](DOCS-EN/07-0-kpi-formula.md) | ISO 22400-2 elements & OEE-family formulas, grepped from the standard | 🟡 DRAFT |
| F-07.1 | KPI tag mapping | [07-1-kpi-tag-mapping.md](DOCS-EN/07-1-kpi-tag-mapping.md) | Which Foundation entity/tag fills each F-07 element; not a v1 formula catalog | 🟡 DRAFT |
| F-08 | Work Master | [08-work-master.md](DOCS-EN/08-work-master.md) | Routing/operation (cycle time); BOM (defect codes merged into F-05 `REJECT_REASON`, 2026-09-23). `WORK_ORDER`/`WORK_ORDER_OPERATION` moved to PRODUCTION, 2026-09-03 | 🟡 DRAFT |
| F-09 | Workflow Engine | [09-workflow-engine.md](DOCS-EN/09-workflow-engine.md) | Concept only. Entities not modeled | 🟠 CONCEPT |
| F-10 | Notification | [10-notification.md](DOCS-EN/10-notification.md) | Concept only. Entities not modeled | 🟠 CONCEPT |
| F-11 | Integration | [11-integration.md](DOCS-EN/11-integration.md) | Concept only, ERP/peer-system connectivity — sensor/IoT connectivity moved to F-13, 2026-09-03 (B7) | 🟠 CONCEPT |
| F-12 | Configuration Service | [12-configuration-service.md](DOCS-EN/12-configuration-service.md) | Concept only. Entities not modeled | 🟠 CONCEPT |
| F-13 | Data Source | [13-data-source.md](DOCS-EN/13-data-source.md) | Sensor/IoT connection endpoints (`DATA_SOURCE`); gives `ASSET_TAGS.data_source_id` a real entity. New module, split from F-04/F-11, 2026-09-03 (B7). Heartbeat granularity still `TBD` (H-DS-1) | 🟠 NEW |
| F-14 | Audit Trail | [14-audit-trail.md](DOCS-EN/14-audit-trail.md) | Append-only audit of every write to an entity of **any domain** (`AUDIT_LOG`, FOUNDATION-owned shared infrastructure): who, when, before→after, effective date, reason, source, `domain_code`/`module_code`. Read per module via `<domain>:<module>:<scope>:audit_view`. PRD code `AUD`. Feature "Audit log" + capability "History" on every feature of every domain. New 2026-09-25 (PO). PLATFORM coverage open (AU-11) | 🟠 NEW |

### Behavioral views (`FLOW/`)

| # | Document | Contents | Status |
|---|----------|----------|--------|
| FLOW-00 | [00-flow.md](FLOW/00-flow.md) | Series index: notation, IEC 62264-3 mapping, traceability, open questions | 🟡 DRAFT |
| FLOW-01 | [01-site-skeleton.md](FLOW/01-site-skeleton.md) | A-1a reference data, site hierarchy, time declaration — one-time per site | 🟡 DRAFT |
| FLOW-02 | [02-production-readiness.md](FLOW/02-production-readiness.md) | A-1b assets, product, KPI binding, work master — one-time per site, continues FLOW-01 | 🟡 DRAFT |
| FLOW-03 | [03-shift-generation.md](FLOW/03-shift-generation.md) | A-2a shift-instance generation, recurring, unattended (owner: `production-domain`) | 🟡 DRAFT |
| FLOW-04 | [04-daily-runtime.md](FLOW/04-daily-runtime.md) | A-2b operator + PLC entry loop within an open shift, recurring | 🟡 DRAFT |
| FLOW-05 | [05-kpi-computation.md](FLOW/05-kpi-computation.md) | A-2c per-work-unit A/P/Q/OEE resolution from tags, recurring | 🟡 DRAFT |
| FLOW-06 | [06-change-control.md](FLOW/06-change-control.md) | A-3 master-data change control (effective dating) | 🟡 DRAFT |

### Interaction declarations (`UX/`)

| # | Document | Mirrors | Contents | Status |
|---|----------|---------|----------|--------|
| 00 | [00-ux.md](UX/00-ux.md) | — | UX map: layer stack, `SCR-*` ID grammar, 7-state matrix, coverage rules D-1…D-4 | 🟡 DRAFT |
| 01 | [01-site-hierarchy.md](UX/01-site-hierarchy.md) | F-01 | `SCR-FND-SIT-*` | 🟡 DRAFT |
| 02 | [02-shift.md](UX/02-shift.md) | F-02 | `SCR-FND-SHF-*` | 🟡 DRAFT |
| 03 | [03-fiscal.md](UX/03-fiscal.md) | F-03 | `SCR-FND-FSC-*` | 🟡 DRAFT |
| 04 | [04-asset.md](UX/04-asset.md) | F-04 | `SCR-FND-AST-*` | 🟡 DRAFT |
| 05 | [05-reference.md](UX/05-reference.md) | F-05 | `SCR-FND-REF-*` | 🟡 DRAFT |
| 06 | [06-product.md](UX/06-product.md) | F-06 | `SCR-FND-PRO-*` | 🟡 DRAFT |
| 07 | [07-kpi.md](UX/07-kpi.md) | F-07.1 | `SCR-FND-KPI-*` — sidebar group KPI, one item per domain | 🟡 DRAFT |
| 08 | [08-work-master.md](UX/08-work-master.md) | F-08 | `SCR-FND-WMS-*` | 🟡 DRAFT |
| 13 | [13-data-source.md](UX/13-data-source.md) | F-13 (+ F-04 §9.7 `ASSET_TAGS`) | `SCR-FND-DSR-*` — sidebar group Connections | 🟡 DRAFT |
| 14 | [14-audit-trail.md](UX/14-audit-trail.md) | F-14 | `SCR-FND-AUD-001` Audit log — sidebar group Library configuration (2026-10-02) | 🟡 DRAFT |
| 09 | [09-jrn-implementor-setup.md](UX/09-jrn-implementor-setup.md) | FLOW-01, FLOW-02 | Journey: implementor site setup (composes 01–08) | 🟡 DRAFT |

Numbering mirrors `DOCS-EN/`; screens cite behavior (`FLOW/`), never restate it. PRODUCTION
keeps its own `UX/` series when PO green-lights it (deferred 2026-08-26). Visual design and
Figma handoff remain with a future `design-domain`.

Legend: 🟢 ACTIVE · 🟡 DRAFT (needs PO/plant validation) · 🟠 CONCEPT (not in the data model yet) · 🔴 RETIRED.

Organization and the working-day calendar are **not** FOUNDATION modules (SSO /
`production-domain`).

> Concept sections come from industry standards and practice (ISA-95/IEC 62264, ISO 22400,
> ISO 14224, BPMN, ISA-18.2, IEC 62443), **not from Molca plant research**. Anything
> specific to Molca is marked `TBD`.

### Planned (create when needed, not automatically)

| Document | Contents |
|----------|----------|
| `data-dictionary.md` | Field dictionary per entity: type, length, nullable, example values |
| `master-data-governance.md` | Who may create/change master data, approval flow, audit |

> **Work Improvement** and **License Manager** are named in [Goals Q3](../../DOCS/goalsQ3.md)
> but sit **outside** FOUNDATION, and their domain is not chosen yet. No documents for
> them here.

## 3. Scope

**Does**
- Define base entities: site hierarchy, asset, work master, shift, yearly/quarterly
  declaration, product, KPI inputs.
- Entity relationships, cardinality, and integrity rules.
- ID, naming, versioning, and effective dating for master data.
- Classification and taxonomies (asset class, downtime types, defect categories, work
  order types).
- Keep master-data terms consistent with [`../../DOCS/01-glossary.md`](../../DOCS/01-glossary.md).
- Declare the interaction layer for its modules — screens and their 7-state matrices under
  [`UX/`](UX/00-ux.md) — citing behavior ([`FLOW/`](FLOW/00-flow.md)), never restating it.

**Does not** (and who owns it)
- Physical database schema, indexes, migrations, API: `engineering-domain`.
- Operational metric formulas and definitions: `product-owner` via
  [`../../DOCS/04-metrics-framework.md`](../../DOCS/04-metrics-framework.md). FOUNDATION only
  supplies the entities and fields those formulas need.
- Visual design, design system, Figma handoff: `design-domain` (not yet created). FOUNDATION
  declares screens and states in [`UX/`](UX/00-ux.md); it does not produce visuals.
- Real plant processes and SOPs: `ops-domain`. FOUNDATION models the result, it does not
  set the process.
- PRD: `product-owner`.

## 4. Artifacts

| Artifact | Location | When |
|----------|----------|------|
| Ontology and entity model | `DOMAINS/FOUNDATION/DOCS-EN/00-foundation.md` | Exists. Update when entities change |
| Field dictionary per entity | `DOMAINS/FOUNDATION/DOCS-EN/data-dictionary.md` | When engineering starts schema design |
| Taxonomy/code lists | inside the relevant module file | When a new category is agreed |
| Behavior flow series | `DOMAINS/FOUNDATION/FLOW/` | Exists. Update when an activity changes |
| Screen declarations | `DOMAINS/FOUNDATION/UX/` | Exists. New module → new doc mirroring `DOCS-EN/` numbering |

## 5. Interfaces

| Direction | Other domain | What is exchanged | When |
|-----------|--------------|-------------------|------|
| In | `ops-domain` | Real plant structure, line/machine names, shift patterns, downtime types | Plant discovery |
| In | `product-owner` | New entity needs from a PRD | When a PRD is written |
| Out | `engineering-domain` | Entities, relations, integrity rules → basis for schema and API | Before technical design |
| Out | `data-domain` | Dimensions and grain for metrics and events | Before the tracking plan |
| Out | `design-domain` | Hierarchy and attributes that must show in UI (e.g. Site → Line picker) | Before screen design |

## 6. Required reading before work

- [`../../AGENTS.md`](../../AGENTS.md): global rules
- [`../../DOCS/00-product-overview.md`](../../DOCS/00-product-overview.md), [`../../DOCS/01-glossary.md`](../../DOCS/01-glossary.md)
- [`../../DOCS/04-metrics-framework.md`](../../DOCS/04-metrics-framework.md): entities here must support those formulas
- This file plus everything in `DOMAINS/FOUNDATION/DOCS-EN/`
- [`FLOW/00-flow.md`](FLOW/00-flow.md): behavior series these entities must support
- [`UX/00-ux.md`](UX/00-ux.md): screen declarations citing those flows

## 7. Done when

- [ ] Every entity has a one-sentence definition, a primary key, required attributes, and its relations.
- [ ] Every relation has explicit cardinality (1:1, 1:N, N:M) and a rule for parent delete/deactivate.
- [ ] Every entity says whether it is time-variant (needs effective dating) or not.
- [ ] New terms are in [`../../DOCS/01-glossary.md`](../../DOCS/01-glossary.md).
- [ ] Every entity used by a formula in `04-metrics-framework.md` has the fields that formula needs.
- [ ] No `TBD` on an entity used by an active PRD.
- [ ] Changes are in [`../../LOGS/CHANGELOG.md`](../../LOGS/CHANGELOG.md).

## 8. Domain rules

1. **One concept, one entity, one name.** If two domains use different names for the same
   thing, FOUNDATION sets the canonical name.
2. **IDs are never reused.** A deactivated asset keeps its ID forever.
3. **Master data is never hard-deleted.** Deactivate with an effective date, because
   history still points at it.
4. **Changing an entity already used by an active PRD goes through Product Owner.** The
   impact is cross-domain.
5. Do not edit another domain's documents. Ask Product Owner.
6. Do not write a PRD.
7. Log every change in `../../LOGS/CHANGELOG.md` in the same session.
8. Do not invent plant facts. Write `TBD — needs PO/ops confirmation` plus the specific
   question.

## 9. Skills / tools

| Skill | For |
|-------|-----|
| `pdf` | Export foundation documents to PDF when asked |
| `molca-domain-agent` | Product Owner only, to create a new domain. Not this agent |
