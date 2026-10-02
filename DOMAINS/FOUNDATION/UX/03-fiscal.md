# UX 03 — Fiscal year screens

> Mirrors [F-03 yearly & quarterly declaration](../DOCS-EN/03-yearly-quarterly-declaration.md) ·
> Status: 🔴 RETIRED.

**Coverage:** `FISCAL_YEAR` (F-03 §9) — rule D-1.

**Retired screen note (2026-08-26, PO; corrected 2026-09-03 — the 2026-08-28 revision's
"rare site-level override" was wrong, see below):** `SCR-FND-FSC-001` is **retired as a
standalone screen** — declaration lives as a Fiscal Year panel inside `SCR-FND-SIT-002`
([`01-site-hierarchy.md`](01-site-hierarchy.md)) on the `ENTERPRISE` node. The ID is kept
(never reused/renumbered per [`00-ux.md`](00-ux.md)) and points to that panel.
`FISCAL_YEAR` stays enterprise-level only per
[F-03](../DOCS-EN/03-yearly-quarterly-declaration.md) — the same panel on a `SITE` node is
**fully read-only**: it shows which enterprise-wide `FISCAL_YEAR` window currently
applies, nothing more. There is no site-level override — no button, no dialog, no
`FISCAL_YEAR_SITE_OVERRIDE` entity — per Y-2 in
[F-03](../DOCS-EN/03-yearly-quarterly-declaration.md) ("no site override needed —
enterprise-level always"), unchanged and unambiguous since before either revision of this
note; it does not make `FISCAL_YEAR` a site-owned entity.

## Screens

| SCR ID                | Screen                                                                                                     | Purpose       | Entities (§9)                                                                                                                                | States worth noting                                        | Stories |
| --------------------- | ---------------------------------------------------------------------------------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------- |
| ~~`SCR-FND-FSC-001`~~ | ~~Fiscal year declaration~~ **Retired — see note above.** Now the "Fiscal Year" panel of `SCR-FND-SIT-002` (declares on `ENTERPRISE`, read-only on `SITE` — no override) | `FISCAL_YEAR` | Error: overlapping windows rejected, conflicting row named; Empty (enterprise): current year undeclared → "declare your first fiscal year"; Empty (site): "fiscal context not set" | `story TBD — PRD-002 candidate` (KR 2.1 mandate, rule D-2) |         |

## State notes

- Fiscal context is a **reporting** concern: no transactional screen may block on it;
  screens that group by quarter show an explicit "no fiscal calendar" grouping fallback.

## Open questions

| # | Question | Owner |
|---|---|---|
| UX-FSC-1 | Does any Q3 screen actually group by fiscal quarter, or is this post-pilot? | PO |
