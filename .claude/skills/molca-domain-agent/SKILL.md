---
name: molca-domain-agent
description: >-
  Creates a new domain agent for MolcaDx (e.g. design, engineering, data, ops)
  complete with domain documents, an agent definition under .claude/agents/,
  registration in AGENTS.md, and a changelog entry. Use ONLY when the Product
  Owner explicitly asks for a new domain/agent ("create an agent for domain X",
  "add domain X"). Not for writing a PRD.
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Bash
---

# Creating a new domain agent for MolcaDx

One domain = one folder = one agent = one row in root `AGENTS.md`.
This skill keeps all four in sync.

## Required layout (folder-scoped)

Every domain lives under `DOMAINS/`, one folder per domain, with `AGENTS.md` as its index
plus working contract. Two document patterns are already in use. Pick one when locking the
domain definition (step 2) and never mix them:

```
DOMAINS/
└── <DOMAIN-NAME>/
    ├── AGENTS.md
    ├── DOCS/            simple pattern: flat, one file may merge concept+spec or split
    ├── DOCS-EN/         full pattern: numbered modules, one file = concept + §9 entities
    ├── FLOW/            optional, full pattern: numbered behavior-flow series (FLOW-00, 01, …)
    └── UX/              optional, full pattern: per-module screen declarations (SCR-*, 7-state matrix)
```

| Pattern | Example | Use when |
|---------|---------|----------|
| **Full** (`DOCS-EN/` + `FLOW/` + `UX/`) | [`DOMAINS/FOUNDATION/`](../../../DOMAINS/FOUNDATION/AGENTS.md) | The domain has data entities that need formal definition (fields, relations, effective dating) **and/or** behavior/screens complex enough to document separately from the concept |
| **Simple** (`DOCS/`) | [`DOMAINS/PRODUCTION/`](../../../DOMAINS/PRODUCTION/AGENTS.md) | The domain is mostly flow/business rules on top of another domain's entities (it doesn't define its own entities), and doesn't yet need a separate FLOW/UX series |

`FLOW/` and `UX/` are not created automatically alongside `DOCS-EN/`. Both get added later,
once the domain genuinely has behavior or screens to declare, the same way it happened for
FOUNDATION. If it's unclear which pattern a domain needs, start with simple and move to full
once its entities start needing formal fields and relations.

Domain folder names are UPPERCASE; agent names are `kebab-case` ending in `-domain`.

Root-level `DOCS/` is only for cross-domain documents (product overview, glossary, PRD
standard, metrics framework, ways of working, goals), not a place for domain contracts.

## When to use this

✅ The PO asks for a new domain/agent.
❌ Never create a domain automatically as a side effect of other work.
❌ Never use this for a PRD; use `DOCS/templates/prd-template.md` instead.

## Steps

### 1. Read context first

Required before writing anything:
- `AGENTS.md` (current domain list)
- `DOCS/02-domains.md` (scope already planned; the domain may already be sketched out there),
  including its "Taksonomi platform (8 level)" section — every new domain/module/feature/story
  must be placeable in that Domain → Module → Feature → Capability → Action/Function hierarchy.
  A new PRD module code is NOT automatically a new Feature — verify the actual level against
  the real/planned UI (launcher card, sidebar item, or a panel nested inside another screen)
  before declaring it
- `DOCS/templates/domain-agent-template.md`

If the domain already exists in the active list → don't duplicate it, offer to change the
existing one instead.

### 2. Lock the domain definition

Decide the following (ask the PO only when genuinely ambiguous; if the scope is already in
`02-domains.md`, use that):

| To lock | Rule |
|---------|------|
| Agent name | `kebab-case`, ending `-domain` except `product-owner`. Example: `design-domain` |
| Mission | One sentence |
| Does / does not | "Does not" must name the domain that owns it instead, to prevent overlap |
| Output | Artifact + concrete file location under `DOCS/` |
| Interface | What it receives from and gives to other domains |
| Done-when | A checklist answerable yes/no |

Boundary check: if a domain's scope touches more than 2 other domains across all its outputs,
that's a sign it's too big. Propose splitting it with the PO before continuing.

### 3. Create the domain folder and its working contract

Copy `DOCS/templates/domain-agent-template.md` → `DOMAINS/<DOMAIN-NAME>/AGENTS.md` and fill in
**every** section (including the §2 index table, matching the pattern locked in step 2).

**Simple pattern:** create `DOMAINS/<DOMAIN-NAME>/DOCS/` with its initial documents; §2 holds a
flat `Document | Summary | Status` table.

**Full pattern:** create `DOMAINS/<DOMAIN-NAME>/DOCS-EN/` with its `README.md` index (example:
[`FOUNDATION/DOCS-EN/README.md`](../../../DOMAINS/FOUNDATION/DOCS-EN/README.md)) and its initial
modules: one file per module, numbered `<CODE>-00`, `<CODE>-01`, and so on, starting with
`<CODE>-00` as the cross-module map (following
[F-00](../../../DOMAINS/FOUNDATION/DOCS-EN/00-foundation.md)). Each file combines the concept
(definition, problem it solves, standards referenced, common pitfalls) with §9 entities once
those are modeled. A module not yet modeled stays `🟠 CONCEPT`; it isn't left blank. Don't
create `FLOW/`/`UX/` yet unless the domain clearly needs them now. That's a separate, later
step, not a required part of standing up a new domain.

Don't leave a section empty; if something isn't known yet, write
`TBD — needs PO confirmation` plus the specific question.

### 4. Write the agent definition

Write `.claude/agents/<agent-name>.md`:

```markdown
---
name: <agent-name>
description: <when this agent gets called, naming the specific trigger>
tools: Read, Write, Edit, Glob, Grep, Bash
---

You are the **<domain-name>** domain agent for the MolcaDx product.

Before working, read:
- `AGENTS.md`
- `DOCS/00-product-overview.md`, `DOCS/01-glossary.md`
- `DOMAINS/<DOMAIN-NAME>/AGENTS.md` (your working contract)
- `DOMAINS/<DOMAIN-NAME>/DOCS/` (the documents you maintain)
- <other domain documents that this one builds on>

Your scope, outputs, and done-when checklist live in `DOMAINS/<DOMAIN-NAME>/AGENTS.md`. Follow it.

Required rules:
1. Never edit another domain's documents. Route the request to the Product Owner instead.
2. Never write a PRD; PRDs belong to `product-owner` and are only written on explicit request.
3. Log every change under `DOCS/` in `LOGS/CHANGELOG.md` in the same session.
4. Never invent product facts. Write `TBD — needs PO confirmation` plus the question.
5. Use terms from `DOCS/01-glossary.md`; register any new term there.
```

Keep `description` specific; it's what the runtime uses to select the agent.

### 5. Register it (don't skip this)

1. `AGENTS.md` §1: add the `DOMAINS/<DOMAIN-NAME>/` folder row to the repo map.
2. `AGENTS.md` §2: add the domain's row to the **Documents per domain** table (link to
   `DOMAINS/<DOMAIN-NAME>/AGENTS.md` + its document list).
3. `AGENTS.md` §3: add or move the row into the **Active** table, filling in responsibilities
   and links to `DOMAINS/<DOMAIN-NAME>/AGENTS.md` and `.claude/agents/<agent-name>.md`.
4. `DOCS/02-domains.md`: move the entry from "Planned" to "Active domains," fill in its
   details, and update the per-PRD responsibility matrix and cross-domain dependency diagram.
5. `DOCS/01-glossary.md`: register any new terms this domain introduces.

### 6. Log it

Add an entry at the top of `LOGS/CHANGELOG.md`, following the format in `LOGS/README.md`:
type `add`, naming the files created, why the domain was created, and its impact on how work
is split across other domains.

### 7. Report back to the PO

Give a short summary: agent name, its scope, the files created, and the list of `TBD` items
still waiting on a PO answer.

## Done-when checklist

- [ ] `DOMAINS/<DOMAIN-NAME>/AGENTS.md` fully filled in, including the §2 index table, and
      states which pattern it uses (simple/full)
- [ ] `DOMAINS/<DOMAIN-NAME>/DOCS/` (simple) or `DOCS-EN/` + `README.md` (full) holds the
      initial documents, all registered in the index
- [ ] Full pattern: `FLOW/` and `UX/` are **not** created unless the domain clearly needs them now
- [ ] `.claude/agents/<agent-name>.md` created
- [ ] `AGENTS.md` §1, §2, and §3 updated
- [ ] `DOCS/02-domains.md` updated (domain detail + responsibility matrix + dependency diagram)
- [ ] `DOCS/01-glossary.md` updated if new terms were introduced
- [ ] `LOGS/CHANGELOG.md` entry added
- [ ] No scope overlap with an existing domain
- [ ] No domain file left behind under root `DOCS/`
