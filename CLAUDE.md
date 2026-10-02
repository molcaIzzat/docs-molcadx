# Claude Code — MolcaDx

Claude Code does **not** auto-load root [`AGENTS.md`](AGENTS.md). This file exists so that
contract still gets into the session.

**Read [`AGENTS.md`](AGENTS.md) before doing anything.** That file is the product contract
(index, domains, PRD rules, working rules). Do not copy it here — if they disagree,
`AGENTS.md` wins.

@AGENTS.md

## This tool

| What | Where |
|------|--------|
| Domain agents | [`.claude/agents/`](.claude/agents/) — `product-owner`, `foundation-domain`, `production-domain` |
| Skills | [`.claude/skills/`](.claude/skills/) |
| MCP servers | [`.mcp.json`](.mcp.json) — `figma-console` (ERD in FigJam, skill `molca-erd`); setup: [`.claude/skills/molca-erd/references/setup.md`](.claude/skills/molca-erd/references/setup.md) |

FOUNDATION working specs are [`DOMAINS/FOUNDATION/DOCS-EN/`](DOMAINS/FOUNDATION/DOCS-EN/README.md).
Log every doc change in [`LOGS/CHANGELOG.md`](LOGS/CHANGELOG.md) in the same session.
No PRD unless the Product Owner asked for one.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
