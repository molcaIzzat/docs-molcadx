# PLT-01 — License Manager (`LIC`)

> 🟠 CONCEPT, entity sketched not finalized. **All five open questions (A-1–A-5) are now
> answered** — A-1/A-3/A-4/A-5 by PO directly (2026-09-10); A-2 by
> [decision, 2026-09-11](../../../LOGS/decisions/2026-09-11-tenant-keycloak-organizations.md):
> `TENANT` already exists in FOUNDATION (F-01 §9.1) — the real question was its relationship
> to Keycloak, resolved as Keycloak Organizations + a `keycloak_org_id` pointer field.

## What this module is for

Tracking **which domains a tenant is entitled to** — the record License Manager reads and
writes, and the thing the "superadmin" page ([`UX/01-license-manager.md`](../UX/01-license-manager.md))
lets Molca staff view and change. Answers half of
[`goalsQ3.md` Q3-7](../../../DOCS/goalsQ3.md) ("License Manager — belum punya domain"); the
other half of that question (Work Improvement's domain) is unrelated and still open.

## Why it matters — what goes wrong without it

Without a real entitlement record and a screen to manage it, "a tenant only bought
Production" is an unenforceable sentence — nobody (and nothing) can look up what a tenant
is actually licensed for, and nothing stops a tenant's own admin from reaching into a domain
they never paid for.

## Core concepts

**1. A grant is domain-level by default, but can go finer — resolved (A-1/A-4).**
`Domain` is still the licensing unit and the coarse case ("tenant X has domain Y"), but a
grant can narrow to a specific Module within that domain, and can be scoped further by data
— e.g. a tenant with 3 `WORK_UNIT`s might only be entitled to a module on some of them, not
all. This makes the entitlement record richer than a flat `(tenant_id, domain_code)` pair
(see §9). Whether per-Feature (not just per-Module) grants are ever needed is still
`TBD — needs PO confirmation`.

**2. Trial is a real, named state — resolved (A-1).** A grant can be a **module trial**, not
just an active/inactive license. Exact trial mechanics (duration, what happens on expiry) are
not yet specified — only that the state itself must exist, not be bolted on later.

**3. Runtime behavior depends on taxonomy level — resolved (A-3).** At the **Module** view
(a launcher card), a tenant without entitlement sees it **visible but locked** — a real
upsell surface, not a hidden feature. At the **Feature** level (a screen/sidebar item inside
a licensed Module the tenant lacks a finer grant for), it is **hidden** entirely. These are
deliberately different: Module-level lock is discovery ("this exists, you don't have it"),
Feature-level hide is scoping ("this doesn't apply to what you have"). Applies to whichever
domain/screen is being gated — PLATFORM does not re-decide this per screen.

**3a. The sidebar is grouped by domain; an unlicensed domain shows as one locked group
heading — resolved 2026-09-28 (PO,
[decision](../../../LOGS/decisions/2026-09-28-work-master-per-domain-operation-uom.md)).**
The app sidebar has FOUNDATION's universal Modules (used by every domain) at the top with **no
umbrella heading** plus **one group per MOM domain** (Production, Maintenance, Quality, Inventory),
each holding that domain's per-domain configuration (today: BOM, Routing, KPI in Production; PM checklist, KPI, Asset history in Maintenance). When the tenant
is **not entitled to a domain**, that domain's group renders as a **single locked heading**:
collapsed, lock icon, not expandable. Clicking it opens the existing upsell / "contact your
administrator" surface. The group's items are **not listed**. This is the **one upsell surface
in navigation**. How it relates to the other states:

| Where | Tenant lacks the domain | Tenant has the domain, lacks a finer grant (concept 1) |
|---|---|---|
| Sidebar — domain group | **Locked heading**, items not listed (this concept) | Group shown; the individual item is **hidden** (concept 3, Feature level) |
| Module launcher card | Visible but locked (concept 3) | Visible but locked (concept 3) |
| Screen reached by direct URL / deep link | **Visible-but-locked screen state**, unchanged | `TBD — needs PO confirmation`: does a deep link to a hidden Feature land on the locked screen state, or a "not found / not available" page? |

This **replaces** the earlier split in navigation, where a domain's KPI sidebar item was
*hidden* without entitlement ([F-07.1 K-9](../../FOUNDATION/DOCS-EN/07-1-kpi-tag-mapping.md#whats-still-unknown),
2026-09-27) while the Production Work Master screens were *visible but locked* (2026-09-12
note, [gate table](#module-license-gate--data-ownership)). A missing
**domain** no longer hides items one by one — the whole group collapses to the locked heading.
Feature-level hide (concept 3) still applies, but only **inside a group the tenant is
entitled to**. The shared items at the top are universal and never locked.

**4. Every grant/change is attributable — resolved (A-5).** Who granted, revoked, or changed
an entitlement — and when — must be recorded, not just the entitlement's current state. Read
as an audit-trail requirement on the entity itself (`granted_by`/`granted_at` or equivalent),
not necessarily distinct permission tiers within "superadmin" — whether tiering is *also*
needed (e.g. read-only support staff vs. staff who can grant/revoke) is still ambiguous and
not assumed resolved by this answer.

**5. FOUNDATION as a whole is never a grant target — but individual FOUNDATION Modules can
still be license-gated. Revised 2026-09-12, corrects an overstatement.** The original claim
here ("FOUNDATION is bundled, full stop") was too broad. What's actually true: FOUNDATION's
*universal* Modules (needed by any tenant regardless of which MOM domain they bought — Site
Hierarchy, Shift, Fiscal Year, base Asset registration, Reference Data, Product identity) are
bundled and never gated. But a FOUNDATION Module can be **functionally meaningless without a
specific MOM domain** — Work Master (`ROUTING`/`OPERATION`/`BOM`) is the clear case: there's
nothing to route or bill-of-material for a tenant who never licensed Production. For a Module
like that, **the license check follows the consuming domain, not the hosting domain**:
FOUNDATION still owns and maintains the entity, but License Manager gates the *screen* on
"does this tenant have Production," not on "does this tenant have FOUNDATION" (which isn't a
licensable thing to begin with). See [Module license-gate table](#module-license-gate--data-ownership)
below for which FOUNDATION Modules are universal vs. gated.

**6. Not all domains are licensable.** MOM domains (Production, Maintenance, and future
Quality/Inventory) are licensable. Design/Engineering/Data/Ops (platform-support domains) —
`TBD` whether they're ever tenant-facing enough to need a grant at all; today they don't
exist and nothing depends on this answer yet.

## Module license-gate ≠ data ownership

A Module's entry in `AGENTS.md` §4 says which domain **owns and maintains** its entities.
That is a separate question from which domain's license **gates whether the tenant can see
the Module's screens at all** — usually the same domain, but not always. First pass at
classifying FOUNDATION's own Modules; not exhaustive, not final:

| FOUNDATION Module | Data owner | License gate | Why |
|---|---|---|---|
| Site Hierarchy (`SIT`), Shift (`SHF`), Fiscal Year (`FYR`), Equipment Taxonomy (`AST`), Reference & Master Data (`REF`), Product (`PRO`) | FOUNDATION | **Universal — no gate** | Every tenant needs these regardless of which MOM domain(s) they licensed; they're the shared backbone, not one domain's concern |
| **Work Master (`WMS`)** | FOUNDATION | **PRODUCTION** | Resolved 2026-09-12 (this session). Routing/BOM/cycle-time-standard is meaningless without a licensed Production domain to execute against it |
| KPI Formula & Tag Mapping (`KPI`) | FOUNDATION | **`TBD` — deliberately not decided here** | Now spans Production (OEE/A-P-Q), and — per the widened 2026-09-10 catalog — future Maintenance (MTBF/MTTR), Quality (Cp/Cpk), Inventory (turns) KPIs too. A single module-level gate is probably **wrong shape** for this one; likely needs per-KPI or per-scope gating once those MOM domains actually exist and have their own KPI stories. Flagged, not solved |
| Workflow Engine (`WFE`), Notification (`NTF`), Integration (`INT`), Configuration (`CFG`), Data Source (`DSR`) | FOUNDATION | **Universal (tentative) — no single MOM domain owns these** | Cross-cutting platform infrastructure (low-code workflow, alerts, ERP/sensor connectivity, tiered config) used by whichever domains need them, not tied to exactly one MOM domain's license. Lower confidence than the `SIT`/`SHF`/etc. row — revisit if a real case shows up where this needs a gate |

**Mechanism implication:** this table is static product configuration (which domain gates
which Module), not a per-tenant record — it doesn't belong in `TENANT_DOMAIN_ENTITLEMENT`
(§9) itself. When License Manager checks "can this tenant see the Work Master screen," it
looks up **Work Master → gated by Production**, then checks the tenant's entitlement against
`domain_code = PRODUCTION` — never against `FOUNDATION`, which was never a grant target to
begin with (core concept 5).

**Sidebar placement follows the gate, not the data owner (2026-09-28, core concept 3a).**
A per-domain configuration sits in the sidebar group of the domain that **gates** it. Production
Production's Work Master (`BOM` and `ROUTING`/`OPERATION`, FOUNDATION data) sits in the **Production** group as two
items, **BOM** and **Routing**; Maintenance's Work Master (`PM_PROCEDURE`, MAINTENANCE data) sits in the
**Maintenance** group as **PM checklist** (flattened 2026-09-28 — no "Work Master" menu item); each
domain's KPI item sits in that domain's group. Universal Modules (first and last rows above) sit in
the shared items at the top of the sidebar (no heading) and never lock. So one domain entitlement check decides the
whole group: entitled → group opens normally; not entitled → one locked heading. The table above
still answers *which domain* gates a screen. Concept 3a answers *what the sidebar shows* when that
check fails. The KPI row stays `TBD` at the per-KPI level. At the sidebar level the gate is per
domain group.

## What's still unknown

| #   | Question                                                                                                                                                                                                | Who needs to answer it                                                      | Answer                                                                                                                  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| A-1 | Exact entity shape for a tenant's domain entitlement — a simple grant table (`tenant_id`, `domain_code`, `granted_from`/`granted_to`) or something richer (seat counts, per-site grants, trial/expiry)? | Product Owner + `engineering-domain`                                        | try something richer, with some possibilities of module trial                                                           |
| A-2 | Is there a formal `TENANT` entity anywhere already (IDP/Keycloak), or does one need to be defined, and by whom?                                                                                         | Product Owner + `foundation-domain`                                         | **Resolved 2026-09-11:** yes — [F-01 §9.1](../../FOUNDATION/DOCS-EN/01-site-hierarchy.md#91-tenant--ownershipisolation-layer). Identity/membership/SSO live in a Keycloak Organization; FOUNDATION's `TENANT` is the business record, linked by `keycloak_org_id`. See [decision](../../../LOGS/decisions/2026-09-11-tenant-keycloak-organizations.md) |
| A-3 | What happens at runtime when a tenant lacks a domain's entitlement — hidden screen, disabled action, or visible-but-locked with an upsell message?                                                      | Product Owner — still-open half of [goalsQ3 Q3-7](../../../DOCS/goalsQ3.md) | visible but locked on modules view while on feature it will be hidden                                                   |
| A-4 | Is a grant ever partial (e.g. one Module within a domain), or always whole-domain?                                                                                                                      | Product Owner                                                               | yes, partial even it can be decided by the data. for example i have 3 work unit that i want to use only on some modules |
| A-5 | Who actually operates the superadmin page — is "superadmin" one flat permission, or does it have its own tiers (e.g. read-only support staff vs. staff who can grant/revoke)?                           | Product Owner                                                               | make it an attributeable                                                                                                |
## 9. Entity specification

> 🟠 Sketch — shape follows from A-1/A-4/A-5, and A-2's resolution unblocks the `tenant_id`
> FK. Still not finalized: exact `scope_ref` mechanism and trial mechanics (see below).

Working name `TENANT_DOMAIN_ENTITLEMENT` (`TBD`, not final). Candidate shape, per A-1
("richer," module trial), A-2 (`TENANT` FK now unblocked), A-4 (partial grants, scoped by
data), A-5 (attributable):

| Field | Notes |
|---|---|
| `tenant_id` | FK → FOUNDATION `TENANT` ([F-01 §9.1](../../FOUNDATION/DOCS-EN/01-site-hierarchy.md#91-tenant--ownershipisolation-layer)) — resolved A-2, [decision](../../../LOGS/decisions/2026-09-11-tenant-keycloak-organizations.md) |
| `domain_code` | Which Domain (`AGENTS.md` §3) this grant is against |
| `module_code` | Nullable — null means whole-domain grant; set means narrowed to one Module (core concept 1) |
| `scope_ref` | `TBD` shape — per A-4's own example (3 `WORK_UNIT`s, entitled on some, not all), a grant can be scoped to specific FOUNDATION data, not just a domain/module code. Whether this is a single FK, a list, or a different mechanism entirely is not decided — needs `foundation-domain` input on what's referenceable |
| `status` | At minimum active/inactive **plus `trial`** (core concept 2) — full enum `TBD` |
| `granted_by`, `granted_at` | Attribution (core concept 4) — every grant/change traceable to who and when |
| `valid_from`, `valid_to` | Effective dating, same convention as every other MolcaDx master data entity |

Not yet decided: trial duration/expiry mechanics, exact `scope_ref` mechanism, whether
`module_code`+`scope_ref` can combine (module-level narrowing *and* data-level narrowing at
once) or are mutually exclusive.

## Related modules

| Module | Relationship |
|---|---|
| [PLT-00](00-platform.md) | Domain map and boundary this module operates inside |
| `AGENTS.md` §3 (root) | Source of truth for which domains exist and are (in principle) licensable |
