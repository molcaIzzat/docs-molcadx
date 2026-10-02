# 2026-09-23 — Defect codes merged into reject reasons

- **Decided by:** Product Owner
- **Resolves:** Q-18 ("are `REJECT_REASON` and `QUALITY_DEFECT_CODE` the same thing?")
- **Domain:** FOUNDATION (F-05 Reference & Master Data, F-08 Work Master)

## Decision

Defect codes and reject reasons are **the same list**. `REJECT_REASON` (F-05) is kept;
`QUALITY_DEFECT_CODE` (F-08 §9.7) is retired.

## Why `REJECT_REASON` survives

| | `REJECT_REASON` (kept) | `QUALITY_DEFECT_CODE` (retired) |
|---|---|---|
| Shape | `code`, `name`, validity dates | Same |
| Per-machine scoping | Yes (`REJECT_REASON_ASSET`) | No |
| License gate | None (Reference data) | Gated by Production (Work Master) |
| Already used by | KPI Quality inputs, shopfloor, asset screens | PRODUCTION job defect rows, Work Master |

Keeping the one that already has per-machine scoping and no license gate means nothing is lost and no
tenant needs a Production license to maintain its reject list.

## Consequences

- **Specs:** F-08 §9.7 retired (section number kept). F-05 `REJECT_REASON` notes it is the only reject/defect
  list. F-08 open questions move to F-05: the real list (W-4) is T-1, the `disposition` field (W-9) is T-6.
- **UX:** `SCR-FND-WMS-005` retired; defect codes are edited on `SCR-FND-REF-004` (Reference data sidebar
  item 4). Sidebar item 11 removed.
- **PRD-003:** `US-FND-WMS-005` closed into `US-FND-REF-002` (ID not reused). 50 live stories.
- **Still open:** F-05 T-6 — does a reject reason need a `scrap`/`rework` disposition?

## Cross-domain follow-up (rule 6 — for `production-domain`, routed by PO)

PRODUCTION documents still point at `QUALITY_DEFECT_CODE`: `job-schedule.md`, `job-schedule-konsep.md`,
`oee-monitoring.md`, `shopfloor.md`. `WORK_ORDER_OPERATION_DEFECT.defect_code_id` should become a foreign key
to `REJECT_REASON` (field rename is PRODUCTION's call). Not edited here.
