# UX 01 — Asset history screens

> Mirrors [M-01 Asset History](../DOCS-EN/01-asset-history.md) · Status: 🟡 DRAFT.
> Moved from FOUNDATION [`UX/04-asset.md`](../../FOUNDATION/UX/04-asset.md) (`SCR-FND-AST-006`)
> on 2026-09-10 — see [decision](../../../LOGS/decisions/2026-09-10-mom-domain-alignment.md).
> Content unchanged except ID rename and cross-references.

**Coverage:** `ASSET_COMPONENT_LINK` (M-01 §9.1). Lifecycle status history (M-01 §9.2) will
join this screen once its entity is modelled — not declared yet.

## Navigation

- `SCR-MNT-AST-001` is reached from the **Maintenance** group of the app sidebar, item
  **"Asset history"** (text key `nav-sidebar.item.asset-history`, defined in FOUNDATION
  [`UX/00-ux.md`](../../FOUNDATION/UX/00-ux.md) — not redefined here). The group holds
  PM checklist · KPI · Asset history (Work Master is shown by page name, not as a "Work Master" item — PO 2026-09-28; [decision 2026-09-28](../../../LOGS/decisions/2026-09-28-asset-status-ownership.md), decision 3).
- Today the item shows component swaps; lifecycle history is added later (M-01 §9.2).
- When the tenant is **not licensed** for Maintenance, the group shows as one locked heading and
  the item is hidden — state defined in PLATFORM
  [PLT-01 core concept 3a](../../PLATFORM/DOCS-EN/01-license-manager.md#core-concepts); cited, not
  redefined.
- The link from FOUNDATION `SCR-FND-AST-001`'s Table view (see screen row below) stays.

## Screens

| SCR ID | Screen | Purpose | Entities | States worth noting | Stories |
|---|---|---|---|---|---|
| `SCR-MNT-AST-001` | Component installation history — **list + timeline + install/swap action** | For a selected FOUNDATION `ASSET` (Equipment unit or any component level), **list:** its currently installed child components (Subunit/Maintainable item/Part, one level down only), each row showing the currently installed component (or "— none installed —"). **Detail (on select):** full installation history per component slot — the active row plus every replaced row below it, same/different Type both captured via `child_asset_id`; nothing is ever hidden or overwritten (FOUNDATION F-00 place ≠ thing, same principle one level deeper than `ASSET_PLACEMENT`). **Action — install/swap:** search an existing, already-registered `ASSET` (FOUNDATION `SCR-FND-AST-001`'s Table view) at the correct component level to install as a child of the selected parent — a `Part`-level asset is filtered out of the parent picker, not just rejected after, since it can never itself be a parent (M-01 §9.1); set effective date; save creates a new `ASSET_COMPONENT_LINK` row and, if replacing an active child, closes the prior row's `valid_to` — never deleted. Reachable both directly and via a link from the selected asset's row in FOUNDATION `SCR-FND-AST-001`'s Table view | `ASSET_COMPONENT_LINK` | Default: timeline per component slot; Empty (list): "no components installed" instead of blank; Empty (detail): "no installation history recorded" instead of an empty timeline; Error: installing a `Part`-level asset as a parent rejected, exact validation semantics still `TBD` (FOUNDATION `component_level` cross-reference, `UX-AST-4`) | `TBD — no PRD story yet; see below` |

## State notes

- Same rule as FOUNDATION's placement screens: swapping a component creates a new history
  row; the prior installation stays intact and visible — nothing is hidden or overwritten.

## Open questions

| # | Question | Owner |
|---|---|---|
| UX-MNT-1 | Exact `component_level` validation semantics against the `parent_asset_id` chain (does `component_level` have to agree with the depth implied by `parent_asset_id`, or can they drift?) — moved from FOUNDATION's `UX-AST-4`, still unresolved. Screen currently assumes the parent picker filters out `Part`-level assets outright — confirm once resolved | `foundation-domain` (the ambiguity is in FOUNDATION's F-04 §9.4/§9.5, not this domain's) |

## PRD status

This screen and its entity had a full PRD story (`US-FND-AST-005`) while still inside
FOUNDATION's PRD-003. That story is retired from PRD-003 as of 2026-09-10 (moved out of
FOUNDATION scope) — its content is preserved here and in
[`01-asset-history.md`](../DOCS-EN/01-asset-history.md), but MAINTENANCE has no PRD of its own
yet (rule 1 — a PRD is only created on explicit PO request). A `US-MNT-AST-001` story should
be written, carrying over `US-FND-AST-005`'s acceptance criteria and open questions, once PO
commissions a Maintenance PRD.
