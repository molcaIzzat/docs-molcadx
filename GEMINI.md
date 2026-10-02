# Antigravity — MolcaDx

Antigravity loads **`GEMINI.md`** as its project instruction (and may also read
[`AGENTS.md`](AGENTS.md)). This file exists so the product contract is on the path this
tool actually opens.

**Read [`AGENTS.md`](AGENTS.md) before doing anything.** That file is the product contract
(index, domains, PRD rules, working rules). Do not copy it here — if they disagree,
`AGENTS.md` wins.

## This tool

| What | Where |
|------|--------|
| Skills | [`.agents/skills/`](.agents/skills/) |
| Domain agents (shared definitions) | [`.claude/agents/`](.claude/agents/) — same names as Claude: `product-owner`, `foundation-domain`, `production-domain` |

FOUNDATION working specs are [`DOMAINS/FOUNDATION/DOCS-EN/`](DOMAINS/FOUNDATION/DOCS-EN/README.md).
Log every doc change in [`LOGS/CHANGELOG.md`](LOGS/CHANGELOG.md) in the same session.
No PRD unless the Product Owner asked for one.
