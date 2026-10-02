# AGENTS.md for domain \<DOMAIN-NAME\>

> Domain working-contract template. Used by the `molca-domain-agent` skill when creating a new
> domain.
>
> **Required layout:** every domain gets its own folder under `DOMAINS/`:
> `DOMAINS/<DOMAIN-NAME>/AGENTS.md` (this file, also the index) plus its documents, in one of
> two patterns (see §2): flat `DOCS/` (simple pattern, example
> [`PRODUCTION`](../../DOMAINS/PRODUCTION/AGENTS.md)) or numbered `DOCS-EN/` with optional
> `FLOW/`/`UX/` (full pattern, example [`FOUNDATION`](../../DOMAINS/FOUNDATION/AGENTS.md)).
>
> Links in the template body are written relative to `DOMAINS/<DOMAIN-NAME>/AGENTS.md`:
> two levels up to the repo root (`../../`), one level to a sibling domain (`../`).
> Once filled in, register it in [`AGENTS.md`](../../AGENTS.md) §1/§2/§3 +
> [`DOCS/02-domains.md`](../02-domains.md), then log it in
> [`LOGS/CHANGELOG.md`](../../LOGS/CHANGELOG.md). Delete this instruction block.

Index and working contract for domain **\<DOMAIN-NAME\>** (agent: `<agent-name>`).
Part of MolcaDx — global rules still apply: [`../../AGENTS.md`](../../AGENTS.md).

| | |
|---|---|
| **Agent name** | `<agent-name>` |
| **Created** | YYYY-MM-DD |
| **Requested by** | Product Owner |
| **Status** | 🟢 Active / 🟡 Planned |
| **Agent definition** | [`../../.claude/agents/<agent-name>.md`](../../.claude/agents/<agent-name>.md) |

---

## 1. Mission

> One sentence: what this domain owns, and which domain it builds on.
>
> Before locking scope, check that this domain (and the modules/features/stories it will
> produce) fits the platform taxonomy in [`DOCS/02-domains.md`](../02-domains.md)
> §"Taksonomi platform (8 level)" — Domain → Module → Feature → Capability → Action/Function.
> If it doesn't fit cleanly, the scope is mis-sized, not the taxonomy.

## 2. Document index

> Pick the **simple** or **full** pattern when locking the domain definition (skill
> `molca-domain-agent` step 2) and never mix them. Delete the table you don't use.

**Simple pattern** (`DOMAINS/<DOMAIN-NAME>/DOCS/`, example: [`PRODUCTION`](../../DOMAINS/PRODUCTION/AGENTS.md)):

| # | Document | Summary | Status |
|---|----------|---------|--------|
| X-01 | [file-name.md](DOCS/file-name.md) | | 🟡 DRAFT |

**Full pattern** (`DOMAINS/<DOMAIN-NAME>/DOCS-EN/`, one file = concept + §9 entities once
modeled; example: [`FOUNDATION`](../../DOMAINS/FOUNDATION/AGENTS.md)):

| # | Module | Document | Contents | Status |
|---|--------|----------|----------|--------|
| X-00 | — | [00-\<domain\>.md](DOCS-EN/00-<domain>.md) | Cross-module map: shared principles, ERD, ID/code/effective-dating rules | 🟡 DRAFT |
| X-01 | \<module name\> | [01-\<file-name\>.md](DOCS-EN/01-<file-name>.md) | | 🟠 NEW |

Also create `DOCS-EN/README.md` as the index (copy the format from
[`FOUNDATION/DOCS-EN/README.md`](../../DOMAINS/FOUNDATION/DOCS-EN/README.md)). `FLOW/`
(numbered behavior-flow series) and `UX/` (per-module screen declarations, `SCR-*`, 7-state
matrix) are optional. Add them later, once the domain has behavior or screens to declare,
not as a required part of creating the domain. If created, record them here.

Legend: 🟢 ACTIVE · 🟡 DRAFT (needs PO/field validation) · 🟠 NEW/CONCEPT (new/concept, entities
not yet modeled) · 🔴 RETIRED.

### Planned (create when needed, not automatically)

| Document | Contents |
|----------|----------|
| | |

## 3. Scope

**Does**
-

**Does not** (must name the domain that owns it instead)
-

## 4. Outputs (artifacts)

| Artifact | Location | When |
|----------|----------|------|
| | | |

## 5. Interfaces

| Direction | Other domain | What's exchanged | When |
|-----------|--------------|-------------------|------|
| In | | | |
| Out | | | |

## 6. Required reading before work

- [`../../AGENTS.md`](../../AGENTS.md): global rules
- [`../../DOCS/00-product-overview.md`](../../DOCS/00-product-overview.md), [`../../DOCS/01-glossary.md`](../../DOCS/01-glossary.md)
- \<other domain documents this one builds on, e.g. `../FOUNDATION/DOCS-EN/00-foundation.md`\>
- This file plus everything in `DOMAINS/<DOMAIN-NAME>/DOCS/` (simple) or whatever exists of
  `DOCS-EN/`, `FLOW/`, `UX/` (full)

## 7. Done when

- [ ] \<checklist item answerable yes/no\>
- [ ] No `TBD` in a section an active PRD depends on.
- [ ] Changes are logged in [`../../LOGS/CHANGELOG.md`](../../LOGS/CHANGELOG.md).

## 8. Domain-specific rules

1. \<domain-specific rule\>
2. Don't edit another domain's documents. Route the request to the Product Owner.
3. Don't write a PRD.
4. Log every change in `../../LOGS/CHANGELOG.md` in the same session.
5. Don't invent plant facts. Write `TBD — needs PO/ops confirmation` plus the specific question.
6. New documents under `DOMAINS/<DOMAIN-NAME>/DOCS/` or `DOCS-EN/`/`FLOW/`/`UX/` must be
   registered in the §2 index table.

## 9. Skills / tools used

| Skill | For |
|-------|-----|
| `pdf` | Export domain documents to PDF when asked |
