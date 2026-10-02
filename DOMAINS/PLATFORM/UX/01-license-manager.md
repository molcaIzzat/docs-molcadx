# UX 01 — License Manager screens

> Mirrors [PLT-01 License Manager](../DOCS-EN/01-license-manager.md) · Status: 🟠 CONCEPT.
> No entity exists yet (PLT-01 §9, still blocked on A-2) — this screen's layout is still
> provisional, but the **tenant-side runtime behavior it manages is now resolved (A-3)**,
> see below.

**Coverage:** the tenant ↔ domain/module entitlement record (name `TBD`, PLT-01).

## Screens

| SCR ID | Screen | Purpose | Entities | States worth noting | Stories |
|---|---|---|---|---|---|
| `SCR-PLT-LIC-001` | Tenant entitlement manager ("superadmin page") — **provisional, not yet designed** | For a selected tenant: which domains/modules they're entitled to (whole-domain or narrowed to a module, per PLT-01 A-1/A-4), grant/revoke action, module-trial state. Exact layout, fields, and even whether it's list-first or tenant-first is `TBD` pending PLT-01 A-2 (`TENANT` entity) | `TBD` — entity not modeled | Empty/Loading/Error/Offline/Success all `TBD` — cannot declare meaningfully before A-2 is answered | `TBD — no PRD story yet` |

## Tenant-side runtime behavior (resolved, A-3 — not this screen, the *consequence* of what it manages)

When a tenant lacks entitlement, behavior depends on taxonomy level, not one flat rule:
- **Module level** (a launcher card): **visible but locked** — an upsell surface, the tenant
  can see the module exists and doesn't have it.
- **Feature level** (a screen/sidebar item inside a module the tenant has, but lacks a finer
  grant for — per PLT-01 A-4's partial-grant case): **hidden** entirely, not shown at all.

This is a rule every domain's own screens must follow when gating on entitlement — it isn't
re-decided per domain/screen.

## Open questions

| # | Question | Owner |
|---|---|---|
| UX-PLT-2 | Is this page list-first (all tenants, drill into one) or search-first (find a tenant, see their grants)? Depends on expected tenant count, which nobody has stated yet | Product Owner |
| UX-PLT-3 | Exact visual treatment of "visible but locked" (Module level) and confirmation UX for module-trial expiry — not yet designed, waits on PLT-01 A-2/entity work | Product Owner + `design-domain` |

## PRD status

No PRD story exists yet for this screen or its entity (rule 1 — a PRD is written only on
explicit PO request). This file exists so the screen has a documented home, per the same
reasoning `SCR-MNT-AST-001` was declared in MAINTENANCE before its PRD existed.
