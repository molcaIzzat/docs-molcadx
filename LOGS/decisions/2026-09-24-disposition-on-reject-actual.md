# Decision — disposition on reject/actual, not on REJECT_REASON (2026-09-24)

**Status:** Closed  
**Owners:** PO + foundation-domain + production-domain  
**Closes:** F-05 **T-6** (was F-08 W-9); retargets PRODUCTION **JS-9**

## Decision

`REJECT_REASON` stays a flat code/name taxonomy (no `disposition` field).  
Scrap vs rework vs hold is recorded on the **reject/actual** row — today `WORK_ORDER_OPERATION_DEFECT.disposition` (`scrap` | `rework` | `hold`) — optionally defaulted from a suggested reason but always overridable at capture time.

Scrap aggregation = Σ qty where disposition = `scrap` (ISO 22400-2 scrap quantity idea). Rework = Σ where disposition = `rework`. Do **not** sum “all rejects with reason X” unless each row already carries disposition.

## Why

ISO 22400-2 treats scrap quantity (SQ) and rework quantity (RQ) as quantity elements; defect type is a slice/axis for KPI breakdown, not a substitute for disposition. Putting disposition only on the reason-code master forces every use of that code into one fate and breaks override on the floor.

## Doc touch

- `DOMAINS/FOUNDATION/DOCS-EN/05-reference-master-data.md` (T-6 closed)
- `DOMAINS/FOUNDATION/UX/05-reference.md` (REF-004 copy)
- `DOMAINS/PRODUCTION/DOCS/job-schedule.md`, `shopfloor.md`, `oee-monitoring.md`, `job-schedule-konsep.md`
- PRD-003 sync notes in `99-history.md` / closed-story hygiene where needed

## Explicit non-decisions

- Full Quality domain still absent — this only places disposition on PRODUCTION’s existing defect actual.
- Whether successful rework re-enters `good_qty` stays TBD (shopfloor).
