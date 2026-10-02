# MolcaDx

MolcaDx's product/domain glossary — resolved terms and relationships that cut across `AGENTS.md`,
`DOCS/`, and `DOMAINS/`. Not a spec; a glossary. Implementation details belong in `DOMAINS/<DOMAIN>/`,
decisions with lasting rationale belong in `LOGS/decisions/`.

## Language

**Domain** (as used in `AGENTS.md`/`DOCS/02-domains.md`):
A folder under `DOMAINS/`, owned by one agent, documenting one area of the product's data/behavior
(FOUNDATION, PRODUCTION, MAINTENANCE, and later Quality/Inventory). **As of 2026-09-10, a Domain is
also the sales/licensing unit** — confirmed by PO. A customer can buy a subset of Domains; FOUNDATION
is always bundled (it is the shared object model every Domain depends on, never sold on its own).
_Avoid_: Module (a Domain is coarser — see below), SKU (informal, not used in docs).

**Module** (PRD story-ID namespace, e.g. `SIT`, `AST`, `KPI`):
A grouping code used inside one Domain's user-story IDs (`US-<DOMAIN>-<MODULE>-<nnn>`). **Not** a
licensing unit — a customer cannot buy "just `AST`" separately from the rest of FOUNDATION. Distinct
from the platform-taxonomy "Module" level in `DOCS/02-domains.md` §"Taksonomi platform (8 level)"
(a launcher card), which is also not the same thing as a licensing unit.
_Avoid_: using "module" when "Domain" (the licensing unit) is meant, or vice versa.

**License Manager** (owned by **PLATFORM** as of 2026-09-10):
The system that tracks which Domains a tenant is entitled to. Entity not yet modeled — still
`TBD` what "not entitled" actually does at runtime (hidden screen? disabled action?
visible-but-locked?) — see "Flagged ambiguities" below.

**PLATFORM** (Domain, created 2026-09-10):
Cross-tenant, vendor-side administration — how Molca operates MolcaDx across every tenant.
Owns License Manager. The deliberate exception to "every Domain is per-tenant": PLATFORM's
data belongs to Molca, not to any one tenant, and it is never itself sold to a tenant (unlike
every other Domain).
_Avoid_: "admin domain" or "superadmin domain" (see **Superadmin** below — that's a Permission,
not this Domain's name).

**Superadmin** (Permission tier, not a Domain or a role name):
Gates who may open PLATFORM's screens (Molca's own staff). Distinct from a tenant's own
"Plant Admin/IT" persona, which operates inside a tenant's *licensed* Domains, not above them.

## Relationships

- **FOUNDATION** is never itself a sold Domain — it is bundled with every purchase, because
  **PRODUCTION**, **MAINTENANCE**, and any future MOM Domain all read FOUNDATION entities.
- A **Domain** may be licensed independently of every other Domain except FOUNDATION.
- **License Manager** (once built) governs which Domains a tenant has — it does not (yet) govern
  anything finer-grained (a single Module, Feature, or Capability within a licensed Domain).

## Example dialogue

> **Dev:** "If a tenant doesn't have Maintenance, does `ASSET.parent_asset_id` still work?"
> **PO:** "Yes — that's FOUNDATION, always there. What they lose is Maintenance's
> `ASSET_COMPONENT_LINK` trail and its screen. FOUNDATION never knows or cares what's licensed."

## Flagged ambiguities

- "Domain" was at risk of meaning three different things (a docs folder, a platform-taxonomy level,
  and now a sales unit) — resolved 2026-09-10: it's used here strictly as the docs-folder/agent
  sense, and *that same thing* is also the sales unit. The platform-taxonomy "Domain" row in
  `DOCS/02-domains.md` §"Taksonomi platform" already pointed at the same folders, so no new meaning
  was introduced, just a new consequence (licensing) attached to an existing one.
- **Resolved 2026-09-10 (same session, later):** which Domain owns License Manager — the new
  **PLATFORM** domain (`DOMAINS/PLATFORM/`), not FOUNDATION and not a MOM domain. PLATFORM is
  cross-tenant/vendor-side and is never itself sold, unlike every other Domain.
- **Still open:** what "not entitled to a Domain" means at runtime (hidden vs. disabled vs.
  visible-but-locked) — tracked as `PLATFORM/DOCS-EN/01-license-manager.md` A-3, the still-open
  half of `DOCS/goalsQ3.md` Q3-7. Do not treat as answered just because ownership is.
