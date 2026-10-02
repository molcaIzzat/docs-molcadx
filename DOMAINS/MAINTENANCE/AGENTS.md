# AGENTS.md — Domain MAINTENANCE

Index and working contract for **MAINTENANCE** (agent: `maintenance-domain`).
Part of MolcaDx. Global rules still apply: [`../../AGENTS.md`](../../AGENTS.md).

| | |
|---|---|
| **Agent name** | `maintenance-domain` |
| **Created** | 2026-09-10 |
| **Requested by** | Product Owner |
| **Status** | 🟢 Active |
| **Agent definition** | [`../../.claude/agents/maintenance-domain.md`](../../.claude/agents/maintenance-domain.md) |

---

## 1. Mission

Own **what happened to an asset over time** — maintenance work orders, repair/inspection
records, component installation and swap history, and the reliability metrics derived from
them (MTBF/MTTR/MTTF) — one of the four MOM operations domains per IEC 62264/ISA-95, built on
top of FOUNDATION's asset taxonomy and current placement, never redefining them.

See [decision 2026-09-10](../../LOGS/decisions/2026-09-10-mom-domain-alignment.md) for the
rule that separates this domain's scope from FOUNDATION's: FOUNDATION owns definitions and
current structure ("what an asset is," "where it sits now"); MAINTENANCE owns the timeline of
events recorded against it ("what happened to it, and when").

## 2. Document index (`DOMAINS/MAINTENANCE/DOCS-EN/`)

**Pattern: full** (`DOCS-EN/` + `UX/`), matching FOUNDATION's — this domain defines its own
entity (`ASSET_COMPONENT_LINK`) and already has a screen to declare. `FLOW/` not created yet;
add it once a behavior series is needed.

| # | Module | Document | Contents | Status |
|---|--------|----------|----------|--------|
| M-00 | — | [00-maintenance.md](DOCS-EN/00-maintenance.md) | Cross-module map: mission, standards, boundary with FOUNDATION | 🟡 DRAFT |
| M-01 | Asset History (`AST`) | [01-asset-history.md](DOCS-EN/01-asset-history.md) | `ASSET_COMPONENT_LINK` — component installation/swap history, moved from FOUNDATION F-04 §9.5, 2026-09-10. Lifecycle status history + maintenance-driven transitions (`under_maintenance`) — declared, entity `TBD` (§9.2, [decision 2026-09-28](../../LOGS/decisions/2026-09-28-asset-status-ownership.md)) | 🟡 DRAFT |
| M-02 | Work Master (`WMS`) | [02-work-master.md](DOCS-EN/02-work-master.md) | `PM_PROCEDURE`/`PM_PROCEDURE_STEP` — PM checklist per asset type, shaped for maintenance (not copied from PRODUCTION's `ROUTING`/`OPERATION`), 2026-09-12 | 🟠 CONCEPT |

### Interaction declarations (`UX/`)

| # | Document | Mirrors | Contents | Status |
|---|----------|---------|----------|--------|
| 01 | [01-asset-history.md](UX/01-asset-history.md) | M-01 | `SCR-MNT-AST-*` — moved from FOUNDATION `UX/04-asset.md` (`SCR-FND-AST-006`), 2026-09-10. Reached from sidebar Maintenance group → "Asset history" (2026-09-28) | 🟡 DRAFT |

No `UX/00-ux.md` map yet — a single screen doesn't need one; add it once a second screen
exists, mirroring FOUNDATION's `UX/00-ux.md`.

Legend: 🟢 ACTIVE · 🟡 DRAFT (needs PO/field validation) · 🟠 NEW/CONCEPT · 🔴 RETIRED.

### Planned (create when needed, not automatically)

| Document | Contents |
|----------|----------|
| `03-work-order.md` | Maintenance work order (PM/CM) — the Work Schedule/Request/Job Order/Directive chain that dispatches `PM_PROCEDURE` (M-02) against a real `ASSET`, plus corrective (unplanned) work orders and crew assignment — `TBD`, not modeled yet |
| `04-reliability.md` | MTBF/MTTR/MTTF formulas, failure-code taxonomy — `TBD`, waits on `03-work-order.md` and enough `ASSET_COMPONENT_LINK` history to be meaningful |

## 3. Scope

**Does**
- Own the transactional/event history of an asset: component installation and swap history
  (`ASSET_COMPONENT_LINK`) today; lifecycle status history and maintenance-driven transitions
  (entity `TBD`, [decision 2026-09-28](../../LOGS/decisions/2026-09-28-asset-status-ownership.md));
  maintenance work orders, repair/inspection records, and
  reliability metrics (MTBF/MTTR/MTTF) once modeled.
- Declare the interaction layer for its modules — screens and 7-state matrices under
  [`UX/`](UX/01-asset-history.md) — citing FOUNDATION entities by reference, never redefining
  them.
- Keep terms consistent with [`../../DOCS/01-glossary.md`](../../DOCS/01-glossary.md).

**Does not** (and who owns it)
- Asset taxonomy, current placement, or any other FOUNDATION entity definition:
  `foundation-domain`. MAINTENANCE reads `ASSET`/`ASSET_PLACEMENT`, it does not define or
  duplicate them.
- Current `ASSET.lifecycle_status` value and its allowed values: `foundation-domain`.
- `ASSET_STATE_LOG` (operational state log): `production-domain` owns and writes it;
  MAINTENANCE only reads it (MTBF/MTTR/MTTF, usage-based PM intervals).
- Physical database schema, indexes, migrations, API: `engineering-domain`.
- Operational metric formulas not specific to maintenance reliability (OEE, A/P/Q):
  `product-owner` / FOUNDATION's KPI formula module (F-07).
- Visual design, design system, Figma handoff: `design-domain` (not yet created).
- Real plant maintenance processes and SOPs: `ops-domain`.
- PRD: `product-owner`.

## 4. Outputs (artifacts)

| Artifact | Location | When |
|----------|----------|------|
| Cross-module map | `DOMAINS/MAINTENANCE/DOCS-EN/00-maintenance.md` | Exists |
| Entity model (`ASSET_COMPONENT_LINK`) | `DOMAINS/MAINTENANCE/DOCS-EN/01-asset-history.md` | Exists, moved from FOUNDATION |
| Screen declaration | `DOMAINS/MAINTENANCE/UX/01-asset-history.md` | Exists, moved from FOUNDATION |

## 5. Interfaces

| Direction | Other domain | What's exchanged | When |
|-----------|--------------|-------------------|------|
| In | `foundation-domain` | `ASSET`, `ASSET_PLACEMENT`, `ASSET.component_level`, `ASSET.lifecycle_status` (current value) — read-only, never redefined here | Always |
| In | `production-domain` | `ASSET_STATE_LOG` — read-only, for MTBF/MTTR/MTTF and usage-based PM intervals | Once Reliability / usage-based PM is modelled |
| In | `product-owner` | New entity needs from a PRD, once one is commissioned for this domain | When a Maintenance PRD is written |
| Out | `engineering-domain` | Entities, relations, integrity rules → basis for schema and API | Before technical design |
| Out | `data-domain` | MTBF/MTTR/MTTF dimensions and grain, once modeled | Before the tracking plan |
| Out | `design-domain` | Screen declarations under `UX/` | Before visual design |

## 6. Required reading before work

- [`../../AGENTS.md`](../../AGENTS.md): global rules
- [`../../DOCS/00-product-overview.md`](../../DOCS/00-product-overview.md), [`../../DOCS/01-glossary.md`](../../DOCS/01-glossary.md)
- [`../FOUNDATION/DOCS-EN/04-asset-ontology.md`](../FOUNDATION/DOCS-EN/04-asset-ontology.md): the taxonomy and current-placement model this domain builds on
- [`../../LOGS/decisions/2026-09-10-mom-domain-alignment.md`](../../LOGS/decisions/2026-09-10-mom-domain-alignment.md): the FOUNDATION/MAINTENANCE dividing rule
- This file plus everything in `DOMAINS/MAINTENANCE/DOCS-EN/` and `DOMAINS/MAINTENANCE/UX/`

## 7. Done when

- [ ] Every entity has a one-sentence definition, a primary key, required attributes, and its relations.
- [ ] Every entity says whether it is time-variant (needs effective dating) or not.
- [ ] New terms are in [`../../DOCS/01-glossary.md`](../../DOCS/01-glossary.md).
- [ ] No `TBD` in a section an active PRD depends on (none active yet for this domain).
- [ ] Changes are logged in [`../../LOGS/CHANGELOG.md`](../../LOGS/CHANGELOG.md).

## 8. Domain-specific rules

1. **Never redefine a FOUNDATION entity.** `ASSET`/`ASSET_PLACEMENT`/`ASSET.component_level`
   are read-only references here; a needed change to them goes through Product Owner to
   `foundation-domain`.
2. Don't edit another domain's documents. Route the request to the Product Owner.
3. Don't write a PRD.
4. Log every change in `../../LOGS/CHANGELOG.md` in the same session.
5. Don't invent plant facts. Write `TBD — needs PO/ops confirmation` plus the specific question.
6. New documents under `DOMAINS/MAINTENANCE/DOCS-EN/` or `UX/` must be registered in the §2
   index table.

## 9. Skills / tools used

| Skill | For |
|-------|-----|
| `scripts/export-doc.sh` | Export domain documents to PDF/Word when asked |
