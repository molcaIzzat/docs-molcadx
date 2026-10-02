# `.claude/skills/` — skills for this repo

Claude Code loads every folder here as a project skill. The full list with when-to-use is in
[`AGENTS.md`](../../AGENTS.md) §6. This file only records **where each skill comes from**, so a copy can be
refreshed.

## Written for this repo (edit here)

| Skill | Purpose |
|---|---|
| `molca-domain-agent` | Create a new domain + agent |
| `prd-pilot` | Check whether the docs can reproduce a PRD |
| `prd-sync` | Sync PRDs in `../prd-molcadx` with spec changes |
| `molca-erd` | Keep the FigJam ERD equal to the specs (router, sections, priority tint) |
| `grill-with-docs`, `unslop` | Also mirrored in `.cursor/skills/` and `.agents/skills/` |

## Vendored copies (copied 2026-10-01; do not edit here, refresh from the source)

These were installed globally on one machine (`~/.agents/skills/`, linked from `~/.claude/skills/`).
They are copied here so that a fresh clone has them. The copies are the upstream files with no changes.

| Skill | Upstream | Note |
|---|---|---|
| `molca-prototype`, `molca-web-design-system`, `shadcn`, `tanstack-query-best-practices` | `git@github.com:molca-id/skills.git` (the `npx skills` lock names the source) | |
| `prd-implement`, `molca-ui`, `molca-ui-adopt` | Local only (not in a shared repo yet) | `molca-ui-adopt` refers to `~/.agents/skills/molca-ui-adopt/scripts/verify-theme.mjs`; from this repo, run `.claude/skills/molca-ui-adopt/scripts/verify-theme.mjs` instead |

To refresh a copy: `rm -rf .claude/skills/<name> && cp -rL ~/.agents/skills/<name> .claude/skills/<name>`,
then log it in `LOGS/CHANGELOG.md`. If a machine also has the global install, Claude Code shows both. They
are the same files, so either one works.

## Machine-global install (2026-10-02)

All 13 skills above are also installed in the machine-global store, so Cursor, Antigravity and pi can use
them and not only Claude Code. The repo copies stay the source of truth for this repo.

| Location | Role |
|---|---|
| `~/.agents/skills` → `/home/isa_bot/app/isa/agentic/skills` | the store itself |
| `~/.cursor/skills` | symlink to the same store |
| `~/.claude/skills/<name>` | one symlink per skill → `~/.agents/skills/<name>` |

To push a change made here to the store: `cp -r .claude/skills/<name> ~/.agents/skills/<name>` (delete the
old folder first). To add a new skill to all tools, copy it to the store and add the `~/.claude/skills/`
symlink. Two store files were newer than the repo copies and the repo copies replaced them on 2026-10-02:
`unslop/SKILL.md` and `prd-implement/scripts/prd-delta.sh`. Their store versions are kept in
`/home/isa_bot/app/isa/agentic/skills-backup-20261002/`.

## MCP servers

Project MCP servers are in [`/.mcp.json`](../../.mcp.json) (currently `figma-console`, used by `molca-erd`).
Setup on a new machine: [`molca-erd/references/setup.md`](molca-erd/references/setup.md). Tokens are read
from the environment and never committed.
