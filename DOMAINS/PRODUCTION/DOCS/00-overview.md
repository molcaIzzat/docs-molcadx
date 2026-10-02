# PRODUCTION — Overview

| | |
|---|---|
| **Domain** | PRODUCTION |
| **Owner** | `production-domain` |
| **Status** | 🟡 DRAFT |
| **Source** | Faris Figma Production columns, 2026-09-24 (`/workspace/work-knowledge/production-figma.jpg`) |
| **Index** | [`../AGENTS.md`](../AGENTS.md) |

---

## Mission

Define **how production is planned, executed, monitored, and analysed** in MolcaDx — on top of master data owned by [FOUNDATION](../../FOUNDATION/AGENTS.md). PRODUCTION does not redefine fiscal/shift, hierarchy, product, work master, ABAC, or KPI formula catalogs. It consumes them and owns the operational flows and runtime clocks.

## Four columns (Figma)

| Column | In PRODUCTION? | Doc |
|--------|----------------|-----|
| **Master Foundation** | Reference only — owned by FOUNDATION | Short map below; full specs stay in FOUNDATION |
| **Production Planning** (“Next to be ERP”) | Yes | [01-planning.md](01-planning.md) |
| **Production Monitoring** | Yes | [02-monitoring.md](02-monitoring.md) |
| **Production Performance Analysis** | Yes | [03-performance.md](03-performance.md) |

Plus ownership already decided: daily **`SHIFT_INSTANCE` generator** — [04-shift-instance.md](04-shift-instance.md).

**Work Master for Production** (what the Figma Process box means) — [05-work-master.md](05-work-master.md).

## Product rules (Faris + standards)

1. **KPIs per domain** — Production / Quality / Maintenance / Inventory each select and analyse their own KPIs. Not one global dump. Aligns IEC 62264-3 activity split and ISO 22400-2 Level-3 MOM KPIs. Catalog and formulas live in FOUNDATION F-07 / F-07.1; PRODUCTION binds and displays the Production set.
2. **Break/rest vs unplanned** — Break/rest is a **calendar exclusion from POT** (never an unplanned-downtime category). Planned maintenance shrinks **PBT**. Unplanned stop while expected to run shrinks **APT**.  
   **One sentence:** “Unplanned on break” ≠ classify break as unplanned.  
   Detail: [01-planning.md § Breaktime](01-planning.md#breaktime) and ot-it note 2026-09-24.
3. **Planning spine (IEC 62264 Part 4 min)** — Work Master → Work Directive → Job Order (+ Job Response when in scope). Schedule forms and interlocks sit on Work Schedule / Job List when multi-job is needed; they must not block the min spine. Workflow Spec deferred.

## Depends on FOUNDATION (do not duplicate)

| Figma “Master Foundation” slice | FOUNDATION home |
|---------------------------------|-----------------|
| Library config: fiscal / shift / hardware / ABAC / log service | F-02 Shift, F-03 Fiscal, F-00.1 ABAC, F-12 Config (concept), F-13 Data Source |
| KPI selection by domain (Production / Quality / Maintenance / Inventory) | F-07 formula + F-07.1 tag mapping — selection UI is library config, SoT stays FOUNDATION |
| Equipment hierarchy Enterprise→…→Equipment→Maintainable Item; data declaration for KPI | F-01 Site Hierarchy, F-04 Asset ontology + tags |
| Product Definition (SKU, form/time conversion) + Cycle Time (Work Master + SKU → Work Unit) | F-06 Product, F-05 time conversion, F-08 Work Master / OPERATION cycle time |
| Work Master (Process) | F-08 Work Master — Production view: [05-work-master.md](05-work-master.md) |
| Log service (who/when create·edit before/after·delete·download) | Pattern shared; PRODUCTION applies it on planning/monitoring/performance actions |

## Out of scope here

- Inventing master entities or conflicting schemas — raise via PO → FOUNDATION.
- Canonical KPI formulas — FOUNDATION F-07 / metrics framework.
- Screen chrome / Figma UI polish — design-domain when present; UX declarations may land under `PRODUCTION/UX/` later.
- Physical SOP — ops-domain.

## Status & next

🟡 DRAFT pending PO walkthrough of the Figma against these four docs. Entity detail for Job Order / defect actual continues prior PRODUCTION ownership (moved from F-08, 2026-09-03); this rewrite replaces the old P-01/P-02/P-03 Indonesian+EN pair files with English module docs aligned to the diagram.
