# PRODUCTION — Monitoring

| | |
|---|---|
| **Module** | Production Monitoring |
| **Status** | 🟡 DRAFT |
| **Source** | Faris Figma, 2026-09-24 |
| **Depends on** | Planning dispatch + FOUNDATION tags / downtime & reject reasons (F-04, F-05, F-07.1) + [04-shift-instance.md](04-shift-instance.md) |
| **Owns** | `ASSET_STATE_LOG` (since 2026-09-28, [decision](../../../LOGS/decisions/2026-09-28-asset-status-ownership.md)) |

---

## Purpose

Give supervisors and operators **live visibility** of what is running, what is off target, and what losses are open — without owning master KPI formulas.

## Capabilities (Figma)

| Capability | Intent |
|------------|--------|
| **Dashboard** | At-a-glance production status for selected site / area / work units |
| **Event timeline** | Target results and ranking over the shift or selected window |
| **Live monitoring** | Real-time machine / Work Unit state and running Job Order context |
| **Losses list** | Open and recent production losses (downtime / speed / quality as bound tags allow) |

KPI numbers shown here use the **Production** domain KPI selection from FOUNDATION library config — not a separate formula dump.

## Log (monitoring)

- Who/when **edits loss reasons** (before/after detail)
- Who/when **adds rework**
- Downloadable log

(Figma items above.)

**Storage (PO decision 2026-09-25):** this log is a **view of the shared FOUNDATION `AUDIT_LOG`** ([F-14](../../FOUNDATION/DOCS-EN/14-audit-trail.md)), filtered to `domain_code = PROD`, `module_code = MON`. PRODUCTION has no log entity of its own.

- **Actions Monitoring writes:** generic `create`, `update`, `deactivate`, plus business actions `reason_corrected` (loss reason edit) and `rework_added`. Downloading this log itself is a generic `download` row owned by FOUNDATION `AUD`.
- **Permission:** read `production:mon:<scope>:audit_view`, download `production:mon:<scope>:audit_download`. Separate from permission to view the monitoring screens.
- **Rules from F-14, not redefined here:** one row per change with before/after, same transaction, append-only, reason required on person edits / deactivates / reactivates and on the business actions above, kept 3 years, actor display name kept.

Disposition for scrap vs rework stays on the **reject/actual** row (decision 2026-09-24 T-6 / JS-9 retarget) — not on `REJECT_REASON` master. Monitoring UI that edits reason or adds rework must leave the audit trail above.

## ASSET_STATE_LOG — operational state per asset, over time

**Owner: PRODUCTION (Monitoring). One owner, two write paths** (see *Who writes, who reads*). Decided by PO 2026-09-28
([decision](../../../LOGS/decisions/2026-09-28-asset-status-ownership.md)). This closes the
ownership half of FOUNDATION B5 / A-5. The recording-level half moved here as **SL-1**, closed by PO
2026-09-29: **per asset, `asset_id` and `work_unit_id` both required.**

It is the minute-to-minute event log of what a machine is doing: running / idle / down / setup.
It is transactional ("X happened at time Y"), so it is not FOUNDATION master data
([splitting rule 2026-09-10](../../../LOGS/decisions/2026-09-10-mom-domain-alignment.md)).
It is the time basis for Availability (unplanned stops shrink APT) and for MTTR / MTTF / MTBF
([F-07.1](../../FOUNDATION/DOCS-EN/07-1-kpi-tag-mapping.md#mttr-mttf-and-mtbf-from-unplanned-downtime-only)).

Not the same thing as **lifecycle status** (`ASSET.lifecycle_status`, monthly/yearly). That stays
FOUNDATION (current value) and MAINTENANCE (history). This log never changes it.

### Who writes, who reads

| Party | Access | What for |
|---|---|---|
| **PRODUCTION** | **Only writer** | Rows from tags and operator downtime entry (below); reason corrections |
| ↳ data-platform Silver job | Writes on PRODUCTION's behalf | `plc` and `derived` rows (from `machine_state` / `downtime_reason` tags and stall / range detection) |
| ↳ MES app (operator entry) | Writes on PRODUCTION's behalf | `manual` rows and reasons added to existing rows |
| **MAINTENANCE** | Read only, never writes | MTBF / MTTR / MTTF; usage-based PM intervals if adopted (MAINTENANCE WM-3) |
| FOUNDATION | Does not store it | Keeps only the taxonomies the log points at: `DOWNTIME_REASON` (F-05) and `ASSET_TAGS` (F-04 §9.7) |

**Two write paths, one owner (PO 2026-09-29).** The Silver pipeline job and the MES app both write
this one table for PRODUCTION. That is not a second owner, and nobody builds a second state table:
the pipeline writes sensor rows, the app writes operator rows, both into `ASSET_STATE_LOG`.
**A Silver recompute never overwrites a reason an operator entered** (a row with `entered_by` set):
it may re-derive times, but the operator's `downtime_reason_id`, `entered_by` and `entered_at` stay.

**Tenant licensed for Maintenance but not Production:** there is no state log, because nobody
writes it. `TBD — needs PO confirmation` until a real customer needs it — see **SL-2**.

### Where rows come from

| Source | `source` value | How |
|---|---|---|
| Tag with `tag_role = machine_state` on the asset ([F-04 §9.7 `ASSET_TAGS`](../../FOUNDATION/DOCS-EN/04-asset-ontology.md#97-asset_tags--per-asset-tag--signal-declaration)) | `plc` | State change opens / closes a row directly |
| Tag with `tag_role = downtime_reason` (F-04 §9.7) | `plc` | Opens a stop directly, or enriches a detected stop with its `downtime_reason_id` |
| Stall or out-of-range detection on the primary asset ([F-07.1 stall](../../FOUNDATION/DOCS-EN/07-1-kpi-tag-mapping.md#how-downtime-gets-detected-from-a-stalled-counter), [range](../../FOUNDATION/DOCS-EN/07-1-kpi-tag-mapping.md#how-downtime-gets-detected-from-an-out-of-range-analog-value)) | `derived` | Row inferred from a stale `total` counter or a `speed` value outside its band; same row shape |
| Operator downtime entry | `manual` | Operator opens / closes a stop and picks a reason (reason may come later) |

Rules that come from FOUNDATION and are not redefined here:

1. **Placement is resolved at the event timestamp**, never the currently placed asset
   ([F-07.1](../../FOUNDATION/DOCS-EN/07-1-kpi-tag-mapping.md), FOUNDATION FLOW-04).
2. **Only the primary placement drives Availability.** Secondary assets only enrich (reason,
   quality counts) and get no state rows of their own for Availability (F-04 §9.6, A-9).
3. **Tags of an unplaced asset are not acquired** (F-04 §9.7), so they produce no rows.
4. **A stop with no reason is still recorded** and counts as **unplanned** until a reason is set.
   It is never dropped for lack of a reason (F-07.1).
5. **Planned vs unplanned vs small stop** is read from `DOWNTIME_REASON.downtime_category`
   ([F-05 §9.1](../../FOUNDATION/DOCS-EN/05-reference-master-data.md#91-downtime_reason-and-reject_reason)),
   not stored on the log row.
6. **Break is not downtime.** Authorized break/rest is excluded from POT through
   [Breaktime](01-planning.md#breaktime). It is never classified as unplanned, and planned
   downtime on the log shrinks PBT only. See **SL-3** for a wording conflict with FOUNDATION F-02.

### Reads (FOUNDATION and PRODUCTION entities)

`ASSET`, `ASSET_PLACEMENT`, `ASSET_TAGS` (F-04) · `WORK_UNIT` (F-01 §9.6) · `DOWNTIME_REASON`,
`DOWNTIME_REASON_ASSET` (F-05) · `SHIFT_INSTANCE` ([04-shift-instance.md](04-shift-instance.md)).

### Fields

Only fields already referenced elsewhere in the repo are listed. Everything else is
`TBD — needs PO/ops confirmation`. Do not add fields without PO.

| Field | Type | Required | Notes |
|---|---|---|---|
| `asset_state_log_id` | internal ID | Yes | Permanent, never reused. Name per F-00 keys rule, 2026-10-01 |
| `asset_id` | FK → `ASSET` (F-04) | Yes (SL-1) | Equipment unit that produced the event (primary placement). Recording is per asset: the `machine_state` tag belongs to an asset, and Maintenance MTBF / MTTR stay on the real machine |
| `work_unit_id` | FK → `WORK_UNIT` (F-01) | Yes (SL-1) | Resolved from `ASSET_PLACEMENT` active **at the event timestamp**. The reporting level for Availability and the ISO 22400 time model. One primary asset per work unit (F-07.1), so the work unit's state is its primary asset's state |
| `shift_instance_id` | FK → `SHIFT_INSTANCE` | Yes | Shift context (domain rule 3; F-02 lists this log as a `SHIFT_INSTANCE` consumer). A row spanning two shifts: split rule `TBD — needs PO/ops confirmation` |
| State value | enum `running` / `idle` / `down` / `setup` | Yes | Values from F-04 status table and the 2026-09-28 decision. Field name, and whether more values exist, `TBD — needs PO/ops confirmation` |
| `downtime_reason_id` | FK → `DOWNTIME_REASON` (F-05) | No | Null = unlabeled stop, treated as unplanned (rule 4). Must be scoped to the asset via `DOWNTIME_REASON_ASSET`. Which state values may carry a reason `TBD — needs PO/ops confirmation` |
| `source` | enum `plc` / `manual` / `derived` | Yes | Same enum `ASSET_TAGS` draft uses |
| `started_at` | timestamp tz | Yes | Event time (effective-dated at event time, not ingest time) |
| `ended_at` | timestamp tz | No | Null = still open. MTTR / MTTF / MTBF use closed intervals only |
| Work center context | — | — | Derivable from `work_unit_id`. Whether it is stored on the row `TBD — needs PO/ops confirmation` |
| `entered_by` | user id | Required when `source = manual`, or when a person set the reason on a `plc` / `derived` row; else null | Who entered it. Same pattern as the reject row in [Planning](01-planning.md) (SL-4) |
| `entered_at` | timestamp | Same as `entered_by` | When it was entered. Business data, not the audit trail: corrections still write `AUDIT_LOG` (below) |

**Keys** ([F-00 keys rule](../../FOUNDATION/DOCS-EN/00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `asset_state_log_id` · Unique: — (see SL-5) · No overlap: a `manual` row never overlaps a `plc` / `derived` row of the same `asset_id` (SL-4, PO 2026-09-29; late sensor rows still `TBD`, Overlap point 3)

### Operator entry — reject and offline behaviour

**Rejected, with a message the operator can act on** (exact copy `TBD` with design):

| Condition | Why |
|---|---|
| Asset has no active primary `ASSET_PLACEMENT` at the event time | No `work_unit_id` context (domain rule 3) |
| No `SHIFT_INSTANCE` covers the event time at that site | No `shift_instance_id` (domain rule 3) |
| Chosen reason is inactive or not scoped to this asset (`DOWNTIME_REASON_ASSET`) | F-05 scoping |
| `ended_at` before `started_at` | Negative duration |
| Edit on a row in a **closed** shift | Closed data is never edited in place; signed adjustment only (F-02) |

**Overlap with sensor rows (PO 2026-09-29, SL-4).** Same rule as rejects: the sensor is the source of
truth for **when**, the operator for **why**.

1. Where a `plc` or `derived` row covers the time, its `started_at` / `ended_at` stand. An operator
   entry for that asset and time does not create a second row. It adds or corrects the reason on the
   sensor row and sets `entered_by` / `entered_at`.
2. A `manual` row stands only where there is **no** `plc` / `derived` coverage for that asset and time.
3. Sensor rows that arrive **after** a `manual` row for the same time (late data, machine-log
   recovery): what happens to the manual row and its reason `TBD — needs PO/ops confirmation`.
   Proposed default (it-platform, 2026-09-29), not yet confirmed: sensor times replace the manual
   row, the operator's reason and `entered_by` / `entered_at` carry over, and the manual row is
   retired through `AUDIT_LOG`, never deleted.

**Offline:** `TBD — needs PO/ops confirmation` — see **SL-4** (queueing half still open).

**Corrections:** a reason change is the `reason_corrected` action in [Log (monitoring)](#log-monitoring)
and writes the shared `AUDIT_LOG` (F-14) with `domain_code = PROD`, `module_code = MON`. No silent
overwrite.

### Open questions

| ID | Question | Owner |
|---|---|---|
| ~~**SL-1**~~ | ~~Recording level: per asset or per work unit / line?~~ **Resolved 2026-09-29 (PO):** per asset, `asset_id` and `work_unit_id` both required; the work unit is resolved from placement at the event time and is the reporting level. Multi-asset work units need no extra rule: only the primary drives Availability (rule 2), and F-07.1 allows one primary per work unit. The browser filters by both | PO + ops |
| **SL-2** | Tenant licensed for Maintenance but not Production: no state log exists. Does Maintenance then get MTBF / MTTR at all, and from where? `TBD` until a real customer needs it (decision 2026-09-28) | PO |
| **SL-3** | FOUNDATION F-02 H-2 says a planned stop "including istirahat" is a state log row with a planned reason. PRODUCTION Breaktime says break is excluded from POT, not planned downtime. Which wording wins for a machine that stops during an authorized break? Same conflict as PRD-004 open question P-06. Needs FOUNDATION wording fix via PO | PO → `foundation-domain` |
| **SL-4** | Operator entry offline: does the device queue entries with the device timestamp and sync later? `TBD — needs PO/ops confirmation`. ~~When a manual row overlaps a `plc` / `derived` row, which wins?~~ **Resolved 2026-09-29 (PO):** sensor times win, the operator adds the reason with `entered_by` / `entered_at`, a manual stop stands only without sensor coverage (see Overlap above) | PO + ops |
| **SL-5** | Keys ([F-00 keys rule](../../FOUNDATION/DOCS-EN/00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01), 2026-10-01): may two rows of the **same `asset_id`** overlap in time when both are `plc` / `derived` (e.g. one from the `machine_state` tag, one from stall detection)? If not, add "at most one row per `asset_id` at any time" under No overlap. Only the manual-vs-sensor case is decided (SL-4) | `production-domain` / PO + ops |

### Screen — state log browser

| ID | Screen | Purpose | States |
|---|---|---|---|
| `SCR-PROD-MON-001` | State log browser | Read-only timeline of `ASSET_STATE_LOG`, filterable by work unit and by asset (SL-1 resolved 2026-09-29). Each row shows the asset **as of that event**, never the currently placed asset. Replaces FOUNDATION `SCR-FND-AST-005` (retired 2026-09-28, ID not reused) | **Empty:** "no state rows in range", which does **not** mean the asset was running. **Completeness marker** shows gaps in coverage. Open-shift rows marked provisional. **Offline / error / no permission:** `TBD` with design |

Permission to view: `TBD — needs PO confirmation` (pattern `production:mon:<scope>:…`, F-00.1).

## Boundaries

- Live OEE widgets may appear here for situational awareness; **OEE live + OEE report + management evaluation** are specified under [03-performance.md](03-performance.md).
- Reason code catalogs remain FOUNDATION F-05; PRODUCTION only records usage and edits on actuals.
- `ASSET_STATE_LOG` is **owned by PRODUCTION** and specified in this file ([§ ASSET_STATE_LOG](#asset_state_log--operational-state-per-asset-over-time), [decision 2026-09-28](../../../LOGS/decisions/2026-09-28-asset-status-ownership.md)). MAINTENANCE reads it, never writes it.
