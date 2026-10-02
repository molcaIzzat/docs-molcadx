# AGENTS.md — Domain PLATFORM

Index and working contract for **PLATFORM** (agent: `platform-domain`).
Part of MolcaDx. Global rules still apply: [`../../AGENTS.md`](../../AGENTS.md).

| | |
|---|---|
| **Agent name** | `platform-domain` |
| **Created** | 2026-09-10 |
| **Requested by** | Product Owner |
| **Status** | 🟢 Active |
| **Agent definition** | [`../../.claude/agents/platform-domain.md`](../../.claude/agents/platform-domain.md) |

---

## 1. Mission

Own **cross-tenant, vendor-side administration** — how Molca's own staff operate MolcaDx
across every tenant at once (which domains a tenant is entitled to, today; tenant
provisioning and cross-tenant observability, potentially later) — never a tenant's own
operational data, and never itself something a tenant licenses.

See [decision: MOM domain alignment, 2026-09-10](../../LOGS/decisions/2026-09-10-mom-domain-alignment.md)
for why FOUNDATION and the MOM domains (Production/Maintenance/Quality/Inventory) are all
*per-tenant*; PLATFORM is the deliberate exception, sitting above tenants entirely.

## 2. Document index (`DOMAINS/PLATFORM/DOCS-EN/`)

**Pattern: full** (`DOCS-EN/` + `UX/` + `FLOW/`) — this domain will define its own entity (tenant
domain-entitlement), has a screen to declare (the superadmin page), and now has its first
behavior flow (the entitlement check every gated screen in *any* domain performs).

| # | Module | Document | Contents | Status |
|---|--------|----------|----------|--------|
| PLT-00 | — | [00-platform.md](DOCS-EN/00-platform.md) | Cross-module map: mission, boundary with FOUNDATION/MOM domains | 🟡 DRAFT |
| PLT-01 | License Manager (`LIC`) | [01-license-manager.md](DOCS-EN/01-license-manager.md) | Tenant ↔ domain entitlement — which domains a tenant is licensed for. Answers half of [goalsQ3 Q3-7](../../DOCS/goalsQ3.md) | 🟠 CONCEPT — entity shape not yet modeled |

### Behavioral views (`FLOW/`)

| # | Document | Contents | Status |
|---|----------|----------|--------|
| FLOW-01 | [01-module-entitlement-check.md](FLOW/01-module-entitlement-check.md) | The check any license-gated screen (in any domain) performs against `TENANT_DOMAIN_ENTITLEMENT` — Module-level lock vs. Feature-level hide, plus the sidebar render (unlicensed domain group = one locked heading, 2026-09-28) | 🟠 CONCEPT |

### Interaction declarations (`UX/`)

| # | Document | Mirrors | Contents | Status |
|---|----------|---------|----------|--------|
| 01 | [01-license-manager.md](UX/01-license-manager.md) | PLT-01 | `SCR-PLT-LIC-*` — the "superadmin" entitlement page | 🟠 CONCEPT |

No `UX/00-ux.md` map yet — a single screen doesn't need one; add it once a second screen
exists, mirroring FOUNDATION's `UX/00-ux.md`. No `FLOW/00-flow.md` series index yet either,
same reasoning — one file doesn't need one.

Legend: 🟢 ACTIVE · 🟡 DRAFT (needs PO validation) · 🟠 NEW/CONCEPT · 🔴 RETIRED.

### Planned (create when needed, not automatically)

| Document | Contents |
|----------|----------|
| `02-tenant-provisioning.md` | Onboarding a new tenant, initial domain grants — `TBD`, not yet needed |
| `03-cross-tenant-observability.md` | Usage/health monitoring across tenants — `TBD`, not yet needed |

> **Work Improvement** ([goalsQ3 Q3-7](../../DOCS/goalsQ3.md)) is a *different* still-open
> item bundled with License Manager in that question — it is **not** resolved by this
> domain's creation. Its own domain is still `TBD — needs PO confirmation`.

## 3. Scope

**Does**
- Own tenant ↔ domain entitlement: which of FOUNDATION's licensable domains (Production,
  Maintenance, and future Quality/Inventory) a given tenant has bought.
- Declare the "superadmin" entitlement page — the screen where Molca staff view/grant/revoke
  a tenant's domain entitlements — under [`UX/`](UX/01-license-manager.md).
- Keep terms consistent with [`../../DOCS/01-glossary.md`](../../DOCS/01-glossary.md).

**Does not** (and who owns it)
- Any tenant's own operational data or master data — `foundation-domain` and the MOM domains.
  PLATFORM never reads or writes a tenant's `ASSET`, `SHIFT_INSTANCE`, etc.
- Actually enforcing the behavior in running code. The *behavior itself* is resolved
  ([PLT-01](DOCS-EN/01-license-manager.md#core-concepts): visible-but-locked at Module level,
  hidden at Feature level, an unlicensed domain's sidebar group shown as one locked heading) — PLATFORM declares *what* the entitlement state is and what a
  lacking tenant should see; wiring that into each domain's actual screens is
  `engineering-domain`'s concern.
- Being sold to a tenant itself — unlike Production/Maintenance/etc., PLATFORM is not a
  licensing SKU. It's how Molca operates the product, not part of what a tenant buys.
- Work Improvement's domain placement — separate open question, not resolved here.
- Physical database schema, indexes, migrations, API: `engineering-domain`.
- Visual design, design system, Figma handoff: `design-domain` (not yet created).
- PRD: `product-owner`.

## 4. Outputs (artifacts)

| Artifact | Location | When |
|----------|----------|------|
| Cross-module map | `DOMAINS/PLATFORM/DOCS-EN/00-platform.md` | Exists |
| License Manager concept | `DOMAINS/PLATFORM/DOCS-EN/01-license-manager.md` | Exists — concept only, entity `TBD` |
| Superadmin page declaration | `DOMAINS/PLATFORM/UX/01-license-manager.md` | Exists — concept only, states `TBD` |

## 5. Interfaces

| Direction | Other domain | What's exchanged | When |
|-----------|--------------|-------------------|------|
| In | `product-owner` | Which domains exist and are licensable (drives what License Manager's grant list contains) | Whenever a new domain is created |
| In | `foundation-domain` | `TENANT` (F-01 §9.1) — the entity License Manager's entitlement record FKs to. PLATFORM reads it, never redefines it | Always |
| Out | `engineering-domain` | Entitlement state → basis for runtime access enforcement, once mechanism is decided | Before technical design |
| Out | `design-domain` | Superadmin page declaration | Before visual design |

## 6. Required reading before work

- [`../../AGENTS.md`](../../AGENTS.md): global rules
- [`../../DOCS/00-product-overview.md`](../../DOCS/00-product-overview.md), [`../../DOCS/01-glossary.md`](../../DOCS/01-glossary.md)
- [`../../DOCS/goalsQ3.md`](../../DOCS/goalsQ3.md) §6.5 Q3-7: the original open question this domain answers half of
- [`../../CONTEXT.md`](../../CONTEXT.md): resolved "Domain" terminology (also the licensing unit)
- [`../../LOGS/decisions/2026-09-10-mom-domain-alignment.md`](../../LOGS/decisions/2026-09-10-mom-domain-alignment.md): why PLATFORM sits outside both FOUNDATION and the MOM domains
- This file plus everything in `DOMAINS/PLATFORM/DOCS-EN/` and `DOMAINS/PLATFORM/UX/`

## 7. Done when

- [ ] Tenant-domain entitlement entity has a one-sentence definition, a primary key, required
      attributes, and its relations (candidate shape sketched — `tenant_id` now FKs to
      FOUNDATION's `TENANT`; `scope_ref` mechanism and trial mechanics still open).
- [x] Runtime behavior when unentitled is resolved by PO (visible-but-locked at Module level,
      hidden at Feature level) — not assumed.
- [ ] New terms are in [`../../DOCS/01-glossary.md`](../../DOCS/01-glossary.md).
- [ ] Changes are logged in [`../../LOGS/CHANGELOG.md`](../../LOGS/CHANGELOG.md).

## 8. Domain-specific rules

1. **Never model a tenant's own operational data.** If a request looks like it belongs to a
   tenant (not to Molca-the-vendor), it's out of scope — route to Product Owner.
2. **"Superadmin" is a Permission tier, not a role name or a domain name.** Keep it scoped to
   who may open PLATFORM's screens; don't let it drift into naming other things.
3. Don't edit another domain's documents. Route the request to the Product Owner.
4. Don't write a PRD.
5. Log every change in `../../LOGS/CHANGELOG.md` in the same session.
6. Don't invent product/commercial facts (pricing, entitlement mechanics, tenant model). Write
   `TBD — needs PO confirmation` plus the specific question.
7. New documents under `DOMAINS/PLATFORM/DOCS-EN/` or `UX/` must be registered in the §2 index
   table.

## 9. Skills / tools used

| Skill | For |
|-------|-----|
| `scripts/export-doc.sh` | Export domain documents to PDF/Word when asked |
