# PLT-00 — PLATFORM domain map

> 🟡 DRAFT.

## What this domain is

PLATFORM owns **cross-tenant, vendor-side administration** — how Molca's own staff operate
MolcaDx across every tenant at once. It is the deliberate exception to a pattern that holds
everywhere else in this repo: FOUNDATION (the shared object model) and every MOM domain
(Production, Maintenance, and later Quality/Inventory) are all *per-tenant* — their data
belongs to one tenant at a time. PLATFORM's data belongs to Molca, not to any one tenant.

## Why it exists

A grilling session on 2026-09-10 established that **Domain is also MolcaDx's sales/licensing
unit** — a customer buys a subset of domains (FOUNDATION always bundled, never sold alone).
That immediately raised a question nothing in the repo answered: who manages *which* domains
a given tenant has bought, and where does that management screen live? `DOCS/goalsQ3.md` had
already flagged half of this (Q3-7: "License Manager — belum punya domain") without an owner.
PLATFORM is that owner.

See [`CONTEXT.md`](../../../CONTEXT.md) for the resolved "Domain" terminology and
[decision: MOM domain alignment](../../../LOGS/decisions/2026-09-10-mom-domain-alignment.md)
for the FOUNDATION/MOM-domain split this domain sits outside of.

## Relationship to other domains

PLATFORM **reads** which domains exist (a fact `product-owner`/`AGENTS.md` establishes when a
domain is created), and manages entitlement records against them. It does not read or write
any tenant's own operational data:

- It does not touch FOUNDATION's `ASSET`, `SITE`, etc. — a tenant's master data is invisible
  to PLATFORM.
- It does not touch PRODUCTION's or MAINTENANCE's transactional data.
- It is not itself a MOM domain and not itself sold — a tenant never "buys PLATFORM."

## What "superadmin" means here

**Superadmin is a Permission tier — who may open PLATFORM's screens — not a role that does
anything else, and not a domain name.** It gates Molca's own staff, never a tenant's own
Plant Admin/IT persona (that persona operates within a tenant's licensed domains; superadmin
operates above all tenants). Keeping this distinction explicit is why the domain isn't called
"superadmin" itself — see the naming discussion in this session's grill.

## Modules

| Module | Entity | Status |
|---|---|---|
| [License Manager](01-license-manager.md) | Tenant ↔ domain entitlement (name `TBD`) | 🟠 CONCEPT — no entity modeled yet |
| Tenant Provisioning (planned) | `TBD` | Not modeled |
| Cross-tenant Observability (planned) | `TBD` | Not modeled |

## What's still unknown (needs PO/engineering input, not guesswork)

Most of License Manager's open questions are answered — see
[PLT-01](01-license-manager.md#whats-still-unknown) for the full table. Summary:

- **Resolved:** entitlement can be partial (module-level, even data-scoped — e.g. only some
  `WORK_UNIT`s); a grant can be a trial; runtime behavior is visible-but-locked at Module
  level, hidden at Feature level; every grant/change must be attributable; `TENANT` already
  exists in FOUNDATION (F-01 §9.1), linked to a Keycloak Organization via `keycloak_org_id`
  ([decision, 2026-09-11](../../../LOGS/decisions/2026-09-11-tenant-keycloak-organizations.md)).
- **Still open:**

| Question | Who needs to answer it |
|---|---|
| Do platform-support domains (Design/Engineering/Data/Ops, once built) also need entitlement gating, or is gating only for MOM domains? | Product Owner |
| Whether per-Feature (not just per-Module) grants are ever needed, beyond the data-scoped case already confirmed | Product Owner |
| Whether "superadmin" needs its own permission tiers, or attribution alone (PLT-01 A-5) is enough | Product Owner |
| Tenant provisioning order — is the Keycloak Organization created before or after FOUNDATION's `TENANT` row, who triggers it | Product Owner (not urgent until real tenant onboarding) |
