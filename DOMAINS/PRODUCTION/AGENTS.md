# AGENTS.md — Domain PRODUCTION

Index and working contract for **PRODUCTION** (agent: `production-domain`).
Part of MolcaDx. Global rules still apply: [`../../AGENTS.md`](../../AGENTS.md).

| | |
|---|---|
| **Agent name** | `production-domain` |
| **Created** | 2026-08-07 |
| **Requested by** | Product Owner |
| **Status** | 🟢 Active |
| **Agent definition** | [`../../.claude/agents/production-domain.md`](../../.claude/agents/production-domain.md) |
| **Docs language** | English (rewrite 2026-09-24 from Faris Figma; old P-01/P-02/P-03 pair files removed) |

---

## 1. Mission

Define **how production is planned, run, monitored, and analysed** in MolcaDx — schedules and dispatch, live losses, OEE/performance, and the shared daily `SHIFT_INSTANCE` generator — on entities owned by [FOUNDATION](../FOUNDATION/AGENTS.md).

PRODUCTION **consumes** FOUNDATION; it does not fork master schemas (fiscal/shift, hierarchy, product, work master, ABAC, KPI catalogs).

## 2. Document index (`DOMAINS/PRODUCTION/DOCS/`)

| # | Module | Document | Contents | Status |
|---|--------|----------|----------|--------|
| — | Overview | [00-overview.md](DOCS/00-overview.md) | Mission, four Figma columns, KPI-per-domain + break rules, FOUNDATION dependency map | 🟡 DRAFT |
| P-Plan | Planning | [01-planning.md](DOCS/01-planning.md) | Job Order, schedules, breaktime, interlocks, tracing, Part-4 spine, **Entities** (`WORK_ORDER` / `WORK_ORDER_OPERATION` / `_DEFECT` / lot hook) | 🟡 DRAFT |
| P-Mon | Monitoring | [02-monitoring.md](DOCS/02-monitoring.md) | Dashboard, event timeline, live monitoring, losses list, reason/rework log, **Entity** `ASSET_STATE_LOG` (owned since 2026-09-28), screen `SCR-PROD-MON-001` state log browser, open questions SL-2…4 (SL-1 resolved 2026-09-29) | 🟡 DRAFT |
| P-Perf | Performance | [03-performance.md](DOCS/03-performance.md) | Report pages per KPI family (Overview / Availability / Performance / Quality, each Live + Period), MTTR/MTTF/MTBF, failure redefine, management KPI, heavy audit log | 🟡 DRAFT |
| P-Shift | Shift instance | [04-shift-instance.md](DOCS/04-shift-instance.md) | B1 ownership of `SHIFT_INSTANCE` generator | 🟢 Decided |
| P-WM | Work Master (Production view) | [05-work-master.md](DOCS/05-work-master.md) | What Figma Process/Work Master means for Production — consumes F-08; no second catalog; Part-4 creator map; interim Directive-equivalent on `WORK_ORDER` | 🟢 ACTIVE (2026-09-27, #42) |

Legend: 🟢 ACTIVE / decided · 🟡 DRAFT · 🔴 obsolete.

**Source of this structure:** Faris Figma Production columns, 2026-09-24. Decision log: [`../../LOGS/decisions/2026-09-24-production-figma-rewrite.md`](../../LOGS/decisions/2026-09-24-production-figma-rewrite.md).

### Removed (do not restore without PO)

Old Indonesian/EN pairs under `DOCS/`: `shopfloor*`, `oee-monitoring*`, `job-schedule*`, `work-schedule-draft.md` (P-01 / P-02 / P-03). Content replaced by the modules above; git history retains them.

## 3. Depends on FOUNDATION (short map)

| Need | FOUNDATION home |
|------|-----------------|
| Fiscal / shift clock, `SHIFT_INSTANCE` schema | F-02, F-03 |
| Hierarchy & assets / tags for KPI declaration | F-01, F-04, F-13 |
| SKU, UOM, time conversion | F-05, F-06 |
| Work Master, cycle time, routing | F-08 |
| KPI formulas & tag mapping; domain KPI selection SoT | F-07, F-07.1 |
| ABAC permission patterns | F-00.1 |
| Break vs POT/PBT/APT | F-07 Availability chain + [01-planning § Breaktime](DOCS/01-planning.md#breaktime) |

## 4. Scope

**Does**

- Production Planning: Job Order / schedule upload·download, dispatch, breaktime windows, execution interlocks, material→WIP→FG lot hook on job actual + schedule log; owns `WORK_ORDER` / `WORK_ORDER_OPERATION` / `WORK_ORDER_OPERATION_DEFECT` / `WORK_ORDER_OPERATION_LOT`.
- Production Monitoring: dashboard, event timeline, live monitoring, losses list, reason-edit / rework logs; owns `ASSET_STATE_LOG` (operational state, one writer; MAINTENANCE reads — [decision 2026-09-28](../../LOGS/decisions/2026-09-28-asset-status-ownership.md)).
- Production Performance: OEE live & report (incl. MTTR/MTTF/MTBF per Figma), failure redefinition (rules TBD), management OEE KPI & evaluation, heavy audit log.
- **`SHIFT_INSTANCE` generator** ([B1](../../LOGS/decisions/2026-09-10-b1-shift-instance-generator-owner.md)): one shared daily generator for all MOM domains.
- Operational rules on top of FOUNDATION entities (offline, correction trails, shift context on actuals).

**Does not**

- Master-data entity definitions — `foundation-domain`.
- Canonical metric formulas — FOUNDATION F-07 / `product-owner` metrics framework.
- Screen visual design — `design-domain`.
- Physical DB/API/PLC — `engineering-domain`.
- Plant SOPs — `ops-domain`.
- Writing PRDs — `product-owner`.

## 5. Interfaces

| Direction | Peer | Exchange |
|-----------|------|----------|
| In | `foundation-domain` | Entities, IDs, effective dating, KPI elements |
| In | `ops-domain` | Floor practice, device/network constraints |
| In | `product-owner` | Priority, canonical success metrics |
| Out | `product-owner` | Functional requirement raw material for a future PRODUCTION PRD |
| Out | `design-domain` | Flows, states, required fields per screen |
| Out | `engineering-domain` | Business rules, validation, offline/conflict behaviour |
| Out | `data-domain` | Events & grain for tracking |
| Out | `maintenance-domain` | Shared `SHIFT_INSTANCE`; `ASSET_STATE_LOG` read-only (MTBF / MTTR / MTTF) |

## 6. Must-read before working

- [`../../AGENTS.md`](../../AGENTS.md)
- [`../../DOCS/00-product-overview.md`](../../DOCS/00-product-overview.md), [`../../DOCS/01-glossary.md`](../../DOCS/01-glossary.md)
- [`../../DOCS/04-metrics-framework.md`](../../DOCS/04-metrics-framework.md)
- [`../FOUNDATION/DOCS-EN/00-foundation.md`](../FOUNDATION/DOCS-EN/00-foundation.md) — **required**
- This file + all of `DOMAINS/PRODUCTION/DOCS/`
- ot-it breaktime lens (workspace): `/workspace/work-knowledge/OT-IT-BREAKTIME.md` when rewriting Availability/break copy

## 7. Definition of done

- [ ] Every flow has actor, trigger, steps, validation, outcome.
- [ ] Every capture names the FOUNDATION entity used — no invented master fields.
- [ ] Offline / reject behaviour stated where operators enter data.
- [ ] Every displayed number names formula source (F-07 / metrics framework).
- [ ] Correction rules (who, until when, audit) written.
- [ ] No silent `TBD` on flows in an active PRODUCTION PRD (none yet — keep TBDs explicit).
- [ ] Changes logged in [`../../LOGS/CHANGELOG.md`](../../LOGS/CHANGELOG.md).

## 8. Domain rules

1. **Do not create master entities.** Need something new → PO → FOUNDATION.
2. **One number, one definition.** Same formula and source everywhere it appears.
3. **Actuals carry `shift_instance_id` and location context** (`work_center_id`, `work_unit_id` when relevant).
4. **No silent overwrite** of entered data — corrections leave who/when/old value.
   The record goes to the shared FOUNDATION `AUDIT_LOG` ([F-14](../FOUNDATION/DOCS-EN/14-audit-trail.md)), `domain_code = PROD`, `module_code = PLN/MON/PRF` — PRODUCTION has no log entity of its own.
5. Do not edit other domains’ docs — escalate via PO.
6. Do not write PRDs.
7. Log every change in `CHANGELOG.md` same session.
8. Do not invent plant facts — write `TBD — needs PO/ops` + the question.
9. **KPIs per domain** — do not dump all MOM KPIs into Production screens.
10. **Break ≠ unplanned** — see planning breaktime rule.

## 9. Skills / tools

| Skill | Use |
|-------|-----|
| `pdf` | Export production docs when asked |
| `molca-prototype` | Shopfloor prototypes for operator validation (on PO request) |
