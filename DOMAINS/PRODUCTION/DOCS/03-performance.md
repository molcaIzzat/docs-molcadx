# PRODUCTION — Performance Analysis

| | |
|---|---|
| **Module** | Production Performance Analysis |
| **Status** | 🟡 DRAFT |
| **Source** | Faris Figma, 2026-09-24 |
| **Depends on** | FOUNDATION F-07 / F-07.1 (Availability = APT/PBT, OEE family); Production KPI selection |

---

## Purpose

Turn shift and order actuals into **reports for every Production KPI** — OEE and what explains it — plus management KPI evaluation and a **heavy audit trail** for anything that changes reported performance.

## Report pages — one per KPI family (PO decision, 2026-09-27)

Production reporting is **not OEE only**. Every KPI F-07 has adopted is a Production KPI
([F-07](../../FOUNDATION/DOCS-EN/07-0-kpi-formula.md#scope-which-parts-of-iso-22400-2-molca-adopts)),
and each one explains a specific loss. So the reports are organised as **four pages**: an OEE
overview, plus one page per OEE component. Each KPI sits on the page whose loss it explains
(F-07 [KPI → report page](../../FOUNDATION/DOCS-EN/07-0-kpi-formula.md#kpi--report-page)).

| Page | Question it answers | KPIs on it | Loss it explains (ISO time / quantity model) |
|---|---|---|---|
| **Overview** | How are we doing overall? | OEE index; A × P × Q side by side; the OEE loss waterfall | All three |
| **Availability** | Where did the time go? | Availability, Production process ratio, MTTR / MTTF / MTBF; downtime split planned / unplanned and by `DOWNTIME_REASON` | Lost time: PBT → APT |
| **Performance** | Did we run at standard speed? | Performance (ISO Effectiveness), Throughput rate; per-SKU run segments | Lost speed: PRI × PQ vs APT |
| **Quality** | How much came out good? | Quality ratio, Scrap ratio, Rework ratio, Fall-off ratio; rejects by `REJECT_REASON` | Lost output: PQ → GQ |

**Rules for every page:**

1. **Two views on each page, not separate products.** *Live* = the running shift, provisional
   until the shift closes. *Period* = any `business_date` range. The Figma's "OEE live dashboard"
   and "OEE report" become these two views, available on all four pages.
2. **Scope is a filter.** Levels: work unit, area / site, Job Order. A KPI shows only at a scope
   F-07 adopted it for; any other level reads "Not calculated at this level", never blank or 0%.

| KPI | Work unit, per shift | Date range (work unit) | Area / site | Job Order |
|---|:---:|:---:|:---:|:---:|
| Availability, Performance, Quality ratio, OEE | ✅ | ✅ | ✅ | — |
| Throughput rate, Production process ratio | ✅ | — | ✅ site | ✅ |
| Scrap ratio, Rework ratio | ✅ | — | — | ✅ |
| Fall-off ratio | — | — | — | ✅ |
| MTTR, MTTF, MTBF | ✅ | ✅ | — | — |

3. **Every number is read from `KPI_RESULT`**
   ([F-07.1 §9.5](../../FOUNDATION/DOCS-EN/07-1-kpi-tag-mapping.md#95-kpi_result)). The pages
   compute nothing; rollups follow F-07 (`sum_of_terms`, never an average of percentages).
4. **The breakdowns (by reason, by SKU segment) are analysis, not correction.** Fixing a stop's
   reason or adding rework stays in [Monitoring](02-monitoring.md) (losses list, live, act now).
   The Availability and Quality pages link to the Monitoring losses list; they never become a
   second place to edit reasons.
5. **Rejects by reason is per work unit / period only.** Per-defect-type KPIs (Scrap / Rework
   ratio by `REJECT_REASON` as their own `KPI_RESULT`) stay blocked (F-07 Defect type scope); the
   Quality page may show reject **quantities** by reason from `WORK_ORDER_OPERATION_DEFECT`, not
   ratios per reason.
6. **MTTR / MTTF / MTBF sit on Availability for now** (Production computes them from its own
   unplanned stops, F-07.1). If the Maintenance domain later adopts reliability KPIs, moving them is
   a PO decision.
7. **Other domains reuse the pattern.** When Quality, Maintenance or Inventory adopt KPIs, each
   gets its own report pages grouped by KPI family (e.g. Maintenance: Reliability, Preventive
   maintenance; Quality: Process capability; Inventory: Material loss) — defined in that domain's
   docs, placed by the same F-07 table.

**Figma needs the same change** — `TBD — design`: the Production Figma still shows *OEE live
dashboard* / *OEE report* as separate features. Until it is redrawn as Overview / Availability /
Performance / Quality with Live and Period views, this section wins.

### What happened to the Figma features

| Figma feature (2026-09-24) | Now |
|---|---|
| OEE live dashboard | The **Live** view of each page |
| OEE report (with MTBR, MTTF) | The **Period** view of each page; MTTR / MTTF / MTBF on Availability |
| OEE KPI for Management | Unchanged — management rollups (below), now for every Production KPI adopted at site level, not OEE only |
| OEE Performance (report dashboard, KPI evaluation) | Unchanged — evaluation against targets (below) |

### Naming note (Figma vs FOUNDATION)

Figma labels **MTBR** and **MTTF**. Alias locked 2026-09-24:

- Figma **MTBR** = **MTTR** (Mean Time To Repair) — mean duration of a closed unplanned stop.
- **MTTF** (Mean Time To Failure) = mean gap from restart to the next unplanned stop start (ISO TTF).
- **MTBF** (Mean Time Between Failures) = MTTR + MTTF = mean gap from one unplanned stop start to the next (ISO TBF).

Formulas, gates, and “only unplanned / per work unit” rules: [F-07.1](../../FOUNDATION/DOCS-EN/07-1-kpi-tag-mapping.md#mttr-mttf-and-mtbf-from-unplanned-downtime-only). Do not invent a second calculation path.

Availability chain reminder (do not fork): **PBT = POT − planned downtime**; unplanned reduces **APT**. Break/rest never enters as unplanned — see [01-planning.md § Breaktime](01-planning.md#breaktime).

## Failure redefinition

Figma: dashed note **“Pendefinisian ulang failure”** (failure redefinition) feeding the OEE report.

- Product intent: allow authorized reclassification of what counts as failure / which interval feeds reliability or loss trees **after** capture, with audit.
- Rules for what may be redefined, by whom, and whether it recalculates closed reports: **TBD — PO**.
- Any redefine must hit the heavy audit log below.

## Management OEE KPI + performance evaluation

- **OEE KPI for Management** — rolled views for management audience (site / product / period). Shows OEE and every other Production KPI adopted at site level (today also Throughput rate and Production process ratio); product views use Job Order results.
- **OEE performance** — report dashboard + **KPI evaluation** against targets from FOUNDATION KPI selection / baselines (metrics framework).

Rollups follow F-07 aggregation rules (`sum_of_terms` etc.); PRODUCTION does not invent alternate OEE math.

## Heavy audit log

Who/when (and before/after where applicable) for:

- Reason edits
- Rework adds
- Report reset
- Report override
- Approvals
- Downloads

(Figma items above.) This log covers actions that change published performance numbers. Storage and rules are the same as the Planning and Monitoring logs.

**Storage (PO decision 2026-09-25):** a **view of the shared FOUNDATION `AUDIT_LOG`** ([F-14](../../FOUNDATION/DOCS-EN/14-audit-trail.md)), filtered to `domain_code = PROD`, `module_code = PRF`. PRODUCTION has no log entity of its own.

- **Actions Performance writes:** generic `create`, `update`, `deactivate`, plus business actions `report_reset`, `report_overridden`, `report_approved`, and `report_downloaded` when a user downloads a report (F-14 core concept 9 — no `changes`; `download_filter` + `download_row_count` instead). Downloading this log itself is a generic `download` row owned by FOUNDATION `AUD`. The report entity these act on is **not modelled yet** — `TBD — needs PO`: what is the report record (per shift / per period / per scope), and which states does reset / override / approve move it between?
- **Reason edits and rework adds** (Figma items) are written by Monitoring (`module_code = MON`, `reason_corrected` / `rework_added`), not by Performance. `TBD — needs PO`: does the Performance log view also show those MON rows, and if so does the viewer need `production:mon:<scope>:audit_view` as well?
- **Permission:** read `production:prf:<scope>:audit_view`, download `production:prf:<scope>:audit_download`. Separate from permission to view the OEE report.
- **Rules from F-14, not redefined here:** one row per change with before/after, same transaction, append-only, reason required on person edits / deactivates / reactivates and on the business actions above (except `*_downloaded`), kept 3 years, actor display name kept.

## Boundaries

- Canonical element definitions and OEE family formulas: FOUNDATION F-07.
- Tag → element binding: F-07.1.
- Maintenance domain may later own richer CM/PM history; until then reliability on the OEE report stays the PRODUCTION performance view over shared unplanned intervals.
