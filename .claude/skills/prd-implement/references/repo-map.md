# Which repo builds which story

The PRD-004 README has an **Implementation repo** column, still `TBD — perlu konfirmasi PO` (as of
2026-09-28). Until the PO fills it in, use the mapping below, which the user has been working with. When
the README column is filled, **it wins** — update this file.

| Story prefix | PRD | Repo | Notes |
|---|---|---|---|
| `US-FND-*` (all FOUNDATION modules: SIT, SHF, FYR, AST, REF, PRO, WMS, KPI, AUD, DSR…) | PRD-003 | `mes-master-data-fe-*` | Includes the Production › BOM / Routing / KPI sidebar pages: they are FOUNDATION data shown under a domain heading |
| `US-PROD-PLN-*` | PRD-004 `01-planning.md` | `mes-production-planning-fe-*` | Job Orders; reads work master, products, shifts from the Master Data API |
| `US-PROD-MON-*` | PRD-004 `02-monitoring.md` | `mes-production-monitoring-fe-*` | Reads Planning API + Master Data `KPI_RESULT` |
| `US-PROD-PRF-*` | PRD-004 `03-performance.md` | `mes-production-performance-fe-*` | Reads Planning API + Master Data `KPI_RESULT` |
| launcher tiles, app list | — | `mes-portal-fe-*` | No PRD stories today |

## Cross-repo readers (for the Carry bucket)

Who reads what over HTTP. When the delta changes the meaning of one of these, update the reader.

| Master Data endpoint | Read by |
|---|---|
| `/work-master` (ROUTING, OPERATION, BOM) | Planning (job load), Performance (ideal minutes) |
| `/products`, `/products/conversions` | Planning, Performance |
| `/reference-data/time-conversions`, `/reference-data/units` | Planning, Performance |
| `/shifts/*`, `/sites`, `/areas`, `/work-centers`, `/work-units` | all Production apps |
| `/kpi-results` | Monitoring, Performance |
| `/audit-log` | Planning, Monitoring (PROD · PLN / MON rows) |

| Planning endpoint | Read by |
|---|---|
| `/job-orders/operations` | Master Data (`KPI_RESULT`, running product), Monitoring, Performance |

## Known placement decisions (don't re-litigate)

- Line / location picker: `US-FND-SIT-003` retired (docs-molcadx#46); a Production picker is parked — build it
  in **no** app until #46 produces a story.
- Maintenance pages (PM checklist, Asset history): no Maintenance PRD. Sidebar items exist per KPI-007 AC-13;
  the pages are placeholders only.
- Tags page (`SCR-FND-DSR-002`, 2026-09-28): part of `US-FND-DSR-001`, still 🔴 (waits on `CFG-001`), but the
  user asked to build it anyway (2026-09-28). Built: list across sources, filters, export of shown rows, tag
  count on Data sources, `tag_name`. Still not built (need the rest of DSR-001 or an answer): "Last read" /
  "Never read" (H-DS-1), Test read (no live connection), generated OPC UA addresses (`node_naming`,
  `namespace_uri` on DATA_SOURCE). A 🔴 story the user explicitly asks for is built; say what stays out.
