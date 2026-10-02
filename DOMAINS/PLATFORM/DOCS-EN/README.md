# PLATFORM — working specs (English)

This folder is the **working source of truth** for PLATFORM. Cross-domain docs, PRDs, and
agents should link here.

**Writing standard:** [ISO 24495-1](https://www.iso.org/standard/78907.html) (Plain
Language). **Answer first**, **easy to scan**, **plain words**, **end with what to do next**.

PLATFORM is cross-tenant, vendor-side administration — how Molca operates MolcaDx across
every tenant, never a tenant's own data, and never itself a licensed domain. See
[decision 2026-09-10](../../../LOGS/decisions/2026-09-10-mom-domain-alignment.md) for why it
sits outside both FOUNDATION and the MOM domains.

| # | Module | File | Status |
|---|---|---|---|
| PLT-00 | — | [00-platform.md](00-platform.md) | 🟡 DRAFT |
| PLT-01 | License Manager | [01-license-manager.md](01-license-manager.md) | 🟠 CONCEPT |

## Behavioral views (`FLOW/`) and interaction declarations (`UX/`)

`FLOW/` has one flow so far: [`../FLOW/01-module-entitlement-check.md`](../FLOW/01-module-entitlement-check.md)
— the generic check any license-gated screen (in any domain) performs, cited rather than
redrawn per screen. `UX/` has one screen: [`../UX/01-license-manager.md`](../UX/01-license-manager.md)
(`SCR-PLT-LIC-*`).

Start with [PLT-00](00-platform.md) — the map of how this domain relates to the rest of
MolcaDx.
