# FLOW-00 — FOUNDATION Activity Overview

> Working draft (`foundation-domain`). Series index for [`FLOW/`](.). Structural counterpart:
> [F-00 data map](../DOCS-EN/00-foundation.md). This series shows **behavior** — who does
> what, in what order, and where the decisions are — using only entities and rules already
> specified in `FOUNDATION/DOCS-EN/`. Nothing here introduces a new entity or field; anything
> a spec leaves open is marked with its open-question ID (`H-6`, `T-1`, …).

**Status:** 🟡 DRAFT — first cut, needs PO review.
**Notation:** Mermaid `flowchart` in UML activity style. Rounded box = start/end · box =
action · diamond = decision · `subgraph` = swimlane/phase · fork and join are shown as
multiple outgoing / multiple incoming arrows · `⚠` = unresolved question carried from specs.

## Series

| # | File | Diagram | Covers |
|---|---|---|---|
| FLOW-00 | this file | — | Notation, IEC 62264-3 mapping, traceability, open questions |
| FLOW-01 | [01-site-skeleton.md](01-site-skeleton.md) | A-1a | Reference data, site hierarchy, time declaration — one-time per site |
| FLOW-02 | [02-production-readiness.md](02-production-readiness.md) | A-1b | Assets/placement, product, KPI binding, work master — one-time per site, continues FLOW-01 |
| FLOW-03 | [03-shift-generation.md](03-shift-generation.md) | A-2a | Shift-instance generation, recurring, unattended (owner: `production-domain`, ⚠ H-6) |
| FLOW-04 | [04-daily-runtime.md](04-daily-runtime.md) | A-2b | Operator + PLC entry loop within an open shift, recurring |
| FLOW-05 | [05-kpi-computation.md](05-kpi-computation.md) | A-2c | Per-work-unit A/P/Q/OEE resolution from tags, recurring |
| FLOW-06 | [06-change-control.md](06-change-control.md) | A-3 | Master-data change control (effective dating) |

**2026-08-26 split.** The series originally shipped as three diagrams (provisioning,
daily runtime, change control). Split into six for three reasons, recorded here rather
than re-litigated per file:

1. **Provisioning (old FLOW-01)** conflated two audiences in one 20-node diagram — a
   reader setting up the site skeleton (reference data, hierarchy, time) had to wade
   through KPI-binding and routing detail meant for the production-readiness half, and
   vice versa. Split at the natural dependency seam: FLOW-01 ends where nothing further
   needs an asset, product, or KPI slot to exist yet; FLOW-02 picks up from there.
2. **Daily runtime (old FLOW-02)** bundled three activities of different character: an
   unattended recurring job (shift generation, owner `production-domain`), the
   attended operator/PLC loop, and downstream KPI computation — which, since F-07.1 §9
   gained its full entity spec (`KPI_FORMULA_SLOT`/`KPI_PARAMETERS`/
   `WORK_UNIT_KPI_BINDING`/`KPI_RESULT`), is no longer a single end-of-diagram box worth
   compressing. Split into FLOW-03/04/05.
3. **Domain-boundary leak.** Old FLOW-02's design-implications table cited
   `US-PROD-SHF-003` and `P-02 §2` — PRODUCTION-owned artifacts — as if FOUNDATION had
   derived them. Per [`FOUNDATION/AGENTS.md` §5.6](../AGENTS.md), FOUNDATION doesn't
   own PRODUCTION's screens or constraints. Those rows are removed from FLOW-04; FOUNDATION
   only lists implications whose constraint traces to a FOUNDATION-owned doc.

File numbering is now sequential (`01`…`06`), not aligned 1:1 with `DOCS-EN/` module
numbers — cross-references from `UX/` and `DOCS-EN/README.md` were updated in the same
session (rule: doc changes and their reference fixes land together).

## How flows relate to design (three tiers)

1. **Constraint — normative, owned here.** A decided rule any screen must respect
   ("a closed shift's numbers are final"). Lives in the diagram and its cited sources.
2. **Implication — derived, owned here, non-normative.** What the constraint forces on
   whatever screen exists ("closed data shows an adjustments ledger, not an edit
   affordance"). Listed in each flow's *Design implications* table; a UX document may
   satisfy it differently as long as the constraint holds.
3. **Decision — normative, owned by the interaction layer** (`UX-xx` / `SCR-xxx`,
   declared per domain in `<DOMAIN>/UX/`). Picks the concrete screen, 7-state matrix, and
   copy for each implication.

A UX document that restates tier 1 is a defect (one behavior, one home). A flow document
that prescribes tier 3 is out of scope (screens are not FOUNDATION's). PRD Expectation
blocks cite tier-3 anchors once they exist.

## How this maps to IEC 62264-3

Activity names are grounded in IEC 62264-3:2016 (*Activity models of manufacturing
operations management*), whose generic template orders Level-3 work as: definition
management → resource management → detailed scheduling → dispatching → execution
management → data collection → tracking → performance analysis (§6.4–6.11). FOUNDATION
supplies the *definitions* those activities read and the *time context* they report
against:

| IEC 62264-3 activity                          | Clause   | What FOUNDATION contributes                                                                                      | Flow |
| --------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------- | ---- |
| Product definition management                 | §6.4     | `PRODUCT`, `ROUTING`, `OPERATION` cycle times, `BOM` (F-06/F-08)                                                  | FLOW-02 |
| Production resource management                | §6.5     | Site hierarchy, assets, placements, reason/UOM catalogs (F-01/F-04/F-05)                                          | FLOW-01, FLOW-02 |
| Detailed production scheduling                | §6.6     | `SHIFT_INSTANCE` time context, `FISCAL_YEAR` windows (F-02/F-03); generation itself is `production-domain` (H-6) | FLOW-01, FLOW-03 |
| Production dispatching / execution management | §6.7–6.8 | `ROUTING`/`BOM` version data `WORK_ORDER` locks onto at release (F-08); `WORK_ORDER` itself is PRODUCTION-owned, see [01-planning.md § WORK_ORDER](../../PRODUCTION/DOCS/01-planning.md#work_order--plan-becomes-a-transaction) | FLOW-02 |
| Production data collection                    | §6.9     | `ASSET_STATE_LOG` is PRODUCTION-owned ([PRODUCTION Monitoring](../../PRODUCTION/DOCS/02-monitoring.md), [decision 2026-09-28](../../../LOGS/decisions/2026-09-28-asset-status-ownership.md)); FOUNDATION supplies only the `DOWNTIME_REASON` / `ASSET_TAGS` taxonomies it points at (F-05, F-04). `WORK_ORDER_OPERATION` writes carrying `shift_instance_id` are PRODUCTION-owned, see [01-planning.md § WORK_ORDER_OPERATION](../../PRODUCTION/DOCS/01-planning.md#work_order_operation--execution-and-output-per-shift) — FOUNDATION only supplies the `SHIFT_INSTANCE` context (F-02) they carry | FLOW-04 |
| Production tracking                           | §6.10    | Shift close finality, signed-adjustment corrections (F-02 core concept 7)                                         | FLOW-04 |
| Production performance analysis               | §6.11    | KPI inputs: POT from instance hours, PBT computed downstream per ISO 22400-2 (F-07/F-07.1)                       | FLOW-05 |

## Traceability

Every diagram node traces to a decided rule — none invented here:

| Diagram element | Source |
|---|---|
| TENANT wraps tree, not ISA-95 level | [00-foundation §Shared principles](../DOCS-EN/00-foundation.md) |
| Internal ID vs business code; suggested patterns | [00-foundation §ID rules](../DOCS-EN/00-foundation.md) |
| Mandatory SITE_SHIFT adoption; POT clock; closed-shift finality; business_date = start | [02-shift §Core concepts](../DOCS-EN/02-shift.md), H-1/H-2/H-4/H-5 resolved there |
| Generation timing (daily, pre-day), mechanism external | [02-shift](../DOCS-EN/02-shift.md) H-6 |
| Primary/secondary placement asymmetry | [04-asset-ontology](../DOCS-EN/04-asset-ontology.md) A-9 |
| Placement resolved at event timestamp; per-metric tag resolution (Step 0 onward) | [07-1-kpi-tag-mapping](../DOCS-EN/07-1-kpi-tag-mapping.md) walkthrough |
| Category enum unplanned/planned/small_stop | [05-reference-master-data §9.1](../DOCS-EN/05-reference-master-data.md) |
| Utilization as unsigned proposal outside OEE chain | [PRODUCTION P-02 §2.1](../../PRODUCTION/DOCS/03-performance.md) |
| Versioned routing/BOM locked at WO release — `ROUTING`/`BOM` version-pin mechanism owned by FOUNDATION (still open, W-8), `WORK_ORDER`'s locked-version fields owned by PRODUCTION | [08-work-master](../DOCS-EN/08-work-master.md), [01-planning.md § WORK_ORDER](../../PRODUCTION/DOCS/01-planning.md#routingbom-locked-at-release-b3) |
| Close-and-open effective dating; deactivation over delete | [00-foundation §Effective dating](../DOCS-EN/00-foundation.md) |
| `KPI_RESULT` freshness fields; multi-SKU segmentation | [07-1-kpi-tag-mapping §9.5](../DOCS-EN/07-1-kpi-tag-mapping.md) |
| PRD-active changes route via PO | [FOUNDATION/AGENTS §Domain rules](../AGENTS.md) |

## Open questions this series makes visible

| ID | Question blocking a diagram edge | Owner |
|---|---|---|
| H-6 | What actually runs the `SHIFT_INSTANCE` generation job, and what UI shows gaps? (FLOW-03) | production-domain |
| — | Full value list of `SHIFT_INSTANCE.status` (draft/cancelled states?) | PO |
| T-1 | Real downtime/reject reason catalogs to seed (FLOW-01) | PO + ops |
| T-1 (was W-4) | Real reject / defect reason list — one list since 2026-09-23 (FLOW-02) | PO + ops |
| K-7 | Write governance for `WORK_UNIT_KPI_BINDING` (FLOW-02) | PO |
| OEE-8 | Whether planned downtime surfaces as `Utilization` (affects FLOW-04 labeling only) | PO |
| — | Should work-order release (routing/BOM version lock) get its own diagram instead of living inside FLOW-02's work-master phase? | PO |

## Next step

PO review of the six flows. On approval: link from [F-00](../DOCS-EN/00-foundation.md)
"Next step" section, and fold the ⚠ marks into each owner's queue above.
