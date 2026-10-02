# MAINTENANCE — working specs (English)

This folder is the **working source of truth** for MAINTENANCE. Cross-domain docs, PRDs,
and agents should link here.

**Writing standard:** [ISO 24495-1](https://www.iso.org/standard/78907.html) (Plain
Language). **Answer first**, **easy to scan**, **plain words**, **end with what to do next**.

MAINTENANCE is one of the four MOM operations domains per IEC 62264/ISA-95 (alongside
Production, Quality, Inventory), sitting on top of FOUNDATION's shared object model — it owns
the *event history* of an asset (what happened to it, and when), never the asset's taxonomy
or current placement. See [decision 2026-09-10](../../../LOGS/decisions/2026-09-10-mom-domain-alignment.md).

| # | Module | File | Status |
|---|---|---|---|
| M-00 | — | [00-maintenance.md](00-maintenance.md) | 🟡 DRAFT |
| M-01 | Asset History | [01-asset-history.md](01-asset-history.md) | 🟡 DRAFT |
| M-02 | Work Master | [02-work-master.md](02-work-master.md) | 🟠 CONCEPT |

## Behavioral views (`FLOW/`) and interaction declarations (`UX/`)

`FLOW/` not created yet. `UX/` has one screen so far:
[`../UX/01-asset-history.md`](../UX/01-asset-history.md) (`SCR-MNT-AST-*`).

Start with [M-00](00-maintenance.md) — the map of how this domain relates to FOUNDATION.
