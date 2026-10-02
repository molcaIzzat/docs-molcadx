# FOUNDATION — working specs (English)

This folder is the **working source of truth** for FOUNDATION. Cross-domain docs, PRDs,
and agents should link here. The Indonesian `DOMAINS/FOUNDATION/DOCS/` tree was removed.

**Writing standard:** [ISO 24495-1](https://www.iso.org/standard/78907.html) (Plain
Language). **Answer first**, **easy to scan**, **plain words**, **end with what to do next**.

Organization is not a FOUNDATION module (users and roles live in SSO/Keycloak). Calendar
as working/non-working days is **not** FOUNDATION — that belongs to `production-domain`.
The fiscal-year half of the old Calendar module is F-03 below.

| # | Module | File | Status |
|---|---|---|---|
| F-00 | — | [00-foundation.md](00-foundation.md) | 🟡 DRAFT |
| F-01 | Site Hierarchy | [01-site-hierarchy.md](01-site-hierarchy.md) | 🟢 ACTIVE |
| F-02 | Shift | [02-shift.md](02-shift.md) | 🟢 ACTIVE |
| F-03 | Yearly & Quarterly Declaration | [03-yearly-quarterly-declaration.md](03-yearly-quarterly-declaration.md) | 🟢 ACTIVE |
| F-04 | Equipment Taxonomy | [04-asset-ontology.md](04-asset-ontology.md) | 🟡 DRAFT |
| F-05 | Reference & Master Data | [05-reference-master-data.md](05-reference-master-data.md) | 🟠 NEW |
| F-06 | Product | [06-product.md](06-product.md) | 🟠 NEW |
| F-07 | KPI formula | [07-0-kpi-formula.md](07-0-kpi-formula.md) | 🟡 DRAFT |
| F-07.1 | KPI tag mapping | [07-1-kpi-tag-mapping.md](07-1-kpi-tag-mapping.md) | 🟡 DRAFT |
| F-08 | Work Master | [08-work-master.md](08-work-master.md) | 🟡 DRAFT |
| F-09 | Workflow Engine | [09-workflow-engine.md](09-workflow-engine.md) | 🟠 CONCEPT |
| F-10 | Notification | [10-notification.md](10-notification.md) | 🟠 CONCEPT |
| F-11 | Integration | [11-integration.md](11-integration.md) | 🟠 CONCEPT |
| F-12 | Configuration Service | [12-configuration-service.md](12-configuration-service.md) | 🟠 CONCEPT |
| F-13 | Data Source | [13-data-source.md](13-data-source.md) | 🟠 NEW |
| F-14 | Audit Trail | [14-audit-trail.md](14-audit-trail.md) | 🟠 NEW |

## Working drafts (not yet merged into a numbered module)

| File | What it's about |
|---|---|
| [tag-declaration-draft.md](tag-declaration-draft.md) | How a PLC/SCADA tag gets declared against an asset — extends [Integration](11-integration.md) |
| [work-unit-flow-draft.md](work-unit-flow-draft.md) | Physical line topology (which machine feeds which) — extends [Site Hierarchy](01-site-hierarchy.md) |
| [../FLOW/00-flow.md](../FLOW/00-flow.md) | Behavioral view of FOUNDATION, numbered series FLOW-00…06 — overview · [site skeleton](../FLOW/01-site-skeleton.md) · [production readiness](../FLOW/02-production-readiness.md) · [shift generation](../FLOW/03-shift-generation.md) · [daily runtime](../FLOW/04-daily-runtime.md) · [KPI computation](../FLOW/05-kpi-computation.md) · [change control](../FLOW/06-change-control.md). Companion to [F-00](00-foundation.md); phases aligned to IEC 62264-3 §6 |
| [../UX/00-ux.md](../UX/00-ux.md) | Interaction declarations — one screen inventory per module, numbered like this folder (`F-01` ↔ `UX 01`), plus the implementor-setup journey. Screens cite [FLOW/](../FLOW/00-flow.md) behavior, never restate it |

Start with [F-00](00-foundation.md) — the map of how the modules connect.
