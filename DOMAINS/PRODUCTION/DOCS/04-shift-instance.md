# PRODUCTION — SHIFT_INSTANCE generator

| | |
|---|---|
| **Topic** | Daily `SHIFT_INSTANCE` generation |
| **Status** | 🟢 Decided (mechanism ownership) · schema remains FOUNDATION |
| **Decision** | [B1 closed 2026-09-10](../../../LOGS/decisions/2026-09-10-b1-shift-instance-generator-owner.md) |

---

## Ownership

**`production-domain` owns the generator** that creates one `SHIFT_INSTANCE` row per active `SITE_SHIFT` per business date, before the day starts, enforcing FOUNDATION rules (no duplicate / no gap per site+shift+date — F-02 §9.3).

- **Schema** of `SHIFT_INSTANCE`: FOUNDATION F-02.
- **Generator process**: PRODUCTION (this doc).
- **Consumers**: every MOM domain that needs time context (Maintenance, Quality, Inventory later) via FK to the **same** row — no second generator.

### Stand-in until this generator exists (PO, 2026-10-02, prd-molcadx#24 item 14)

The owner stays `production-domain` (B1). Until Production builds this generator, a stand-in runs inside FOUNDATION master data with a placeholder list of production dates. It must move here later. It is not the design: its date list and its placement are temporary and must not be copied into specs or stories. It still follows the F-02 §9.3 rules (no duplicate, no gap per site+shift+date). Which dates get an instance is still Production's to decide.

## PBT rule (H-7)

Fill PBT from **POT − planned downtime** in the KPI layer. Never write PBT onto `SHIFT_INSTANCE` itself. Break/rest is handled when defining POT (exclusion), not as planned downtime on the instance row — see [01-planning.md § Breaktime](01-planning.md#breaktime).

## Flow pointer

Behavioral view: FOUNDATION [FLOW-03 shift generation](../../FOUNDATION/FLOW/03-shift-generation.md) (owner confirmed production-domain).
