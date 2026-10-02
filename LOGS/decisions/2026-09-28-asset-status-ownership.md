# 2026-09-28 — Asset status ownership: operational state → PRODUCTION, lifecycle split

- **Decided by:** Product Owner
- **Resolves:** B5 / A-5 (`ASSET_STATE_LOG` ownership and recording level owner)
- **Domain:** FOUNDATION (F-04 Equipment Taxonomy), PRODUCTION, MAINTENANCE
- **Rule applied:** [2026-09-10 splitting rule](2026-09-10-mom-domain-alignment.md) — definition /
  current master value → FOUNDATION; "X happened at time Y" (events, history) → the owning MOM domain.

## Decisions

### 1 — Operational state (`ASSET_STATE_LOG`) is owned by PRODUCTION

- Minute-by-minute event log (running / idle / down / setup) = transactional → not FOUNDATION.
- **One owner, not two.** PRODUCTION writes it (from `machine_state` / `downtime_reason` tags and
  operator downtime entries) and uses it for Availability. **MAINTENANCE reads it** for
  MTBF / MTTR / MTTF and never writes it.
- The state log browser leaves FOUNDATION: `SCR-FND-AST-005` retired (ID not reused), replaced by a
  PRODUCTION screen.
- FOUNDATION keeps only the taxonomies the log points at: `DOWNTIME_REASON` (F-05) and the tag
  declaration `ASSET_TAGS` (F-04 §9.7).
- **Open:** a tenant licensed for Maintenance but not Production has no state log — `TBD` until a
  real customer needs it.

### 2 — Lifecycle status is split, same pattern as the component swap

| | Component swap (2026-09-10) | Lifecycle status (this decision) |
|---|---|---|
| **FOUNDATION keeps** | `ASSET.parent_asset_id` — current parent | `ASSET.lifecycle_status` — current value; the placement rule ("only `operational` machines occupy a station") reads it, so it must work without a Maintenance licence |
| **MAINTENANCE owns** | `ASSET_COMPONENT_LINK` — swap history | Lifecycle history and maintenance-driven transitions (e.g. `under_maintenance`) — entity `TBD`, not modelled yet |

### 3 — Sidebar consequence

- The state log appears in PRODUCTION's app, not in the setup sidebar.
- The Maintenance domain group gains **Asset history** (component swaps today, lifecycle history later):
  Work Master · KPI · Asset history.

## F-04 status table after this decision

| | Changes how often | Used for | Owner |
|---|---|---|---|
| **Lifecycle status** | Monthly/yearly | Asset management | Current value: FOUNDATION. History and maintenance-driven changes: MAINTENANCE |
| **Operational state** | Minute to minute | Uptime %, downtime tracking | PRODUCTION (MAINTENANCE reads) |
