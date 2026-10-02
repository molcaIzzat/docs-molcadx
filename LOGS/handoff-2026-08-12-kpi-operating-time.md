# Handoff — KPI operating-time from sensor + FOUNDATION model re-consolidation

> **Purpose:** hand this to the next agent to continue the **KPI operating-time** design
> thread. It records what was already decided this session (in `FOUNDATION/DOCS-EN/`, EN-first)
> and the open question still being worked. Companion to the session log in
> [`LOGS/CHANGELOG.md`](CHANGELOG.md).

**Working language:** English. These companion docs follow the **ISO 24495-1 (Plain
Language)** writing standard — see [`FOUNDATION/DOCS-EN/README.md`](../DOMAINS/FOUNDATION/DOCS-EN/README.md).

---

## 1. What this session already decided (do not redo)

All changes are **EN-first** — only `FOUNDATION/DOCS-EN/` was edited. The Indonesian
`../DOCS/`, `FOUNDATION/AGENTS.md`, `PRD-001`, and `goalsQ3` still use the **old** module
numbers and were intentionally left behind.

| Decision | Where it landed | Notes |
|---|---|---|
| **`TENANT`** = ownership/isolation layer above the ISA-95 tree (not a level) | `00-foundation.md`, `01-site-hierarchy.md`, `09-configuration-service.md` | ISA-95 levels still start at Enterprise |
| **`FISCAL_YEAR`** = annual reporting window, enterprise-owned | `03-calendar.md` | `calendar_basis`: `monthly` \| `weekly_iso`; `period_pattern` (`4-5-4`/`4-4-5`/`5-4-4`) required **iff** `weekly_iso` |
| **Organization module removed** (SSO/Keycloak) | `02-organization.md` deleted | `ORG_UNIT`, `EMPLOYEE`, `USER_ACCOUNT`, `ROLE`, `ROLE_ASSIGNMENT`, `CREW` dropped; identity comes from the IDP |
| **Calendar/Shift = separate tables, not one** | `03-calendar.md`, `04-shift.md` | 3 concepts: Shift, Calendar, Shift Instance — see §4 |
| **Work Master moved to last, renumbered** | all module files | New order in §3 |
| Reading-order + stale-link fixes | `00-foundation.md`, `README.md` | |

All of this is logged in [`LOGS/CHANGELOG.md`](CHANGELOG.md) under **2026-08-12**.

---

## 2. Current FOUNDATION module order (EN, after restructure)

```
F-01 Site Hierarchy        F-06 Workflow Engine
F-02 Asset Ontology        F-07 Notification
F-03 Calendar              F-08 Integration
F-04 Shift                 F-09 Configuration Service
F-05 KPI & Reference Data  F-10 Work Master   (moved to last)
```

Note: **Organization (old F-02) does not exist here anymore.**

---

## 3. The model agreed so far (calendar + shift + fiscal year + availability)

**Three separate tables (do not merge into one `window_time`):**

```
SHIFT        (what a time slot looks like: start/end, break, crosses_midnight)
CALENDAR_DAY (which days work + exceptions: working / non_working + category)
SHIFT_INSTANCE (generated rows per site/work center per date; referenced by every transaction)
```

- **Fiscal year** buckets reporting only — it does **not** decide working days or shift times.
- **Availability is reduced only by unplanned downtime** (sensor events). **Planned
  maintenance lowers utilization, not availability.**
- `scheduled_minutes` = **shift duration − break** (proposed; no planned-downtime subtraction —
  confirm below in §6 Q1).
- **Unplanned downtime** = a sensor event with **start + end**, both driven by the sensor,
  recorded in `ASSET_STATE_LOG`. No manual duration entry; no planned/unplanned feature to build.

---

## 4. The active design thread — KPI operating-time from sensor count

**Where it starts:** this is the design goal we were working toward. It lives mostly in
`FOUNDATION/DOCS-EN/05-kpi-formula.md` (KPI_INDEX / KPI_PARAMETERS / KPI_FORMULA) and
`tag-declaration-draft.md`.

**What the user intends:**

> Scheduled time and operating time will be **based on sensor-sent data**. Operating time is
> declared from the sensor **count**, converted to hours using the **product/operation
> conversion** (standard cycle time) defined in FOUNDATION.

Current state of the thread:

- A tag (`EQUIPMENT_TAG`) attaches to **equipment (ASSET)**, not to the work unit.
- A tag is resolved for a work unit at calculation time: `WORK_UNIT → ASSET_PLACEMENT
  (active) → ASSET → EQUIPMENT_TAG`.
- A **counter-type tag** is flagged `needs_conversion = true`; the duration is derived from
  the **sensor count × `OPERATION.standard_cycle_time`** in force at `business_date`
  (see `tag-declaration-draft.md`, decision 8).
- This conversion is done at **calculation time**, not stored as a fixed multiplier.

### Gap the user flagged

> "I see you didn't have the docs about product."

**Confirmed true:** there is **no "Product" doc** in `FOUNDATION/DOCS-EN/`. The product /
operation basis (ITEM, OPERATION, `standard_cycle_time`) lives in **Work Master
(`10-work-master.md`)**, which was just moved to the last position. Decide whether that is
enough, or whether a dedicated Product reference is needed (§6 Q3).

---

## 5. Suggested skills for the next agent

- **`tech-writing-standards`** — required for any prose edit; these companions follow it.
- **`ce-brainstorm`** or **`ce-plan`** — if the KPI operating-time design needs a structured
  pass before writing.
- **`handoff`** — to produce the next handoff when this thread closes.

---

## 6. Open questions to resolve

| # | Question | Suggested owner |
|---|---|---|
| Q1 | Confirm `scheduled_minutes = shift duration − break` (no planned-downtime subtraction)? | PO + foundation-domain |
| Q2 | Confirm the KPI operating-time derivation: `operating_time = Σ (sensor count × cycle_time)` — where the count and the `cycle_time` come from, and whether it is **computed on read** or **snapshotted** on the closed shift. | foundation-domain + production-domain |
| Q3 | Is **Work Master (F-10)** sufficient as the "product" home, or is a dedicated **Product** companion doc needed? | PO |
| Q4 | Sync the EN-first changes back to Indonesian `../DOCS/` (and fix PRD/goalsQ3 old F-numbers). | foundation-domain + PO |

---

## 7. Reference paths (read these first)

- Map / current order: [`FOUNDATION/DOCS-EN/00-foundation.md`](../DOMAINS/FOUNDATION/DOCS-EN/00-foundation.md)
- KPI config module: [`FOUNDATION/DOCS-EN/05-kpi-formula.md`](../FOUNDATION/DOCS-EN/05-kpi-formula.md)
- Calendar + FISCAL_YEAR: [`FOUNDATION/DOCS-EN/03-calendar.md`](../FOUNDATION/DOCS-EN/03-calendar.md)
- Shift + scheduled_minutes: [`FOUNDATION/DOCS-EN/04-shift.md`](../FOUNDATION/DOCS-EN/04-shift.md)
- Product/operation basis (cycle time): [`FOUNDATION/DOCS-EN/10-work-master.md`](../FOUNDATION/DOCS-EN/10-work-master.md)
- Tag + counter→hours conversion: [`FOUNDATION/DOCS-EN/tag-declaration-draft.md`](../DOMAINS/FOUNDATION/DOCS-EN/tag-declaration-draft.md)
- Session log: [`LOGS/CHANGELOG.md`](CHANGELOG.md) (2026-08-12 entries)
