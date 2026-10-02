# Decision — PRODUCTION English rewrite from Faris Figma (2026-09-24)

**Status:** Open for PO walkthrough (docs landed 🟡 DRAFT)  
**Owners:** PO + `production-domain` (po-molca executor)  
**Source:** Faris Figma Production columns (`production-figma.jpg`); ot-it breaktime note `OT-IT-BREAKTIME.md`; stacks after standards work on `docs/standards-gaps-prd-sync` (PR #31)

## Decision

1. **Delete** old PRODUCTION module pairs under `DOMAINS/PRODUCTION/DOCS/` (`shopfloor*`, `oee-monitoring*`, `job-schedule*`, `work-schedule-draft.md`) — former P-01 / P-02 / P-03.
2. **Replace** with English-only modules aligned to Figma columns:
   - `00-overview.md` — mission + four columns + rules
   - `01-planning.md` — Job Order, schedules, breaktime, interlocks, tracing
   - `02-monitoring.md` — dashboard, live, losses, logs
   - `03-performance.md` — OEE live/report, MTBR/MTTF, failure redefine, management KPI, heavy audit
   - `04-shift-instance.md` — keep B1 generator ownership brief
3. **FOUNDATION remains SoT** for Master Foundation column content; PRODUCTION only maps dependencies.
4. **KPIs per domain** (not one global dump).
5. **Break/rest:** exclusion from POT; never `downtime_category = unplanned`. Planned maintenance shrinks PBT; unplanned reduces APT. “Unplanned on break” ≠ classify break as unplanned. (ot-it / ISO 22400-2)
6. **Planning spine:** Work Master → Work Directive → Job Order (+ Job Response). Schedule forms must not block the min spine.

## Why

Figma is the agreed product shape for Production. Old docs mixed Indonesian konsep/spec pairs and drifted from Availability/break language fixed on the FOUNDATION side in PR #31. Faris asked for delete-and-rewrite English-only from the diagram.

## Doc touch

- `DOMAINS/PRODUCTION/AGENTS.md` (English index)
- `DOMAINS/PRODUCTION/DOCS/00`–`04-*.md` (new)
- `DOCS/02-domains.md` PRODUCTION blurb + outputs
- Root `AGENTS.md` PRODUCTION doc count/links
- `LOGS/CHANGELOG.md`

## Explicit non-decisions / TBD

- Failure-redefinition authorization matrix (performance module).
- Hard vs soft execution interlocks.
- MTBR/MTTF label ↔ F-07 MTBF/MTTR field aliasing.
- Full PRODUCTION PRD (none under `DOCS/prd/` yet — PRD-003 stays FOUNDATION).
- `ASSET_STATE_LOG` schema ownership (still B5 open).

## Supersedes

Index entries pointing at P-01 Shopfloor / P-02 OEE Monitoring / P-03 Job Schedule as the module set. Entity ownership of Job Order / defect actual (moved from F-08 earlier) is **not** moved back to FOUNDATION — only the doc filenames and column structure change.
