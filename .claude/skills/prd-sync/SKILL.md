---
name: prd-sync
description: Brings the PRDs in the sibling repo prd-molcadx up to date with spec changes in docs-molcadx (AGENTS.md §5 rule 1b). Works from the git diff of DOMAINS/<DOMAIN>/DOCS-EN, UX and FLOW since each PRD's recorded sync point — not from the changelog and not by reading every document. Maps each changed spec section to the PRD stories that link to it or name its fields, reads only those in full, edits them, moves the sync point, and opens a PR. Use when the PO asks to sync / update a PRD after spec changes, or at the end of a session that changed DOCS-EN/UX/FLOW. Never creates new stories on its own (rule 1) — unmatched changes are reported for the PO to decide.
allowed-tools:
  - Read
  - Edit
  - Write
  - Bash
  - Grep
  - Glob
---

<what-to-do>

Sync one PRD (or all of them) to what changed in the specs since its last sync. The **git diff is
the source of truth**. The changelog is a hand-written summary and can be incomplete, so it is
never used to decide what changed. Reading every document is also not needed; read in full only
what the diff touches.

Paths: specs repo = the current repo (`docs-molcadx`). PRD repo = `../prd-molcadx/` (a sibling
checkout — see `AGENTS.md` §5 rule 1a). If `../prd-molcadx/` is missing, stop and tell the PO to
clone `molca-id/prd-molcadx` next to this repo.

## 0. Resolve which PRDs

| Domain folder | PRD folder in `prd-molcadx` |
|---|---|
| `DOMAINS/FOUNDATION/` | `PRD-003-foundation/` |
| `DOMAINS/PRODUCTION/` | `PRD-004-production/` |
| any other domain | no PRD yet — report changes only (rule 1: no PRD unless the PO asks) |

`PRD-001` is frozen. Never edit it.

A change in one domain can affect another domain's PRD (e.g. a FOUNDATION KPI formula change
affects `PRD-004` Performance Analysis). Step 3 searches **every live PRD** for each change, not
only the PRD of the changed domain.

## 1. Find each PRD's sync point

Each live PRD's `README.md` header table has a row:

```
| **Specs synced to** | `docs-molcadx@<sha>` (<date>) |
```

- Fetch first: `git fetch origin` in both repos.
- If `<sha>` is an ancestor of `origin/main` (`git merge-base --is-ancestor <sha> origin/main`), use it.
- If it is not (branch squash-merged or rebased), use the last commit on `origin/main` dated at or
  before `<date>`, and say so in the report.
- If the row is missing, stop and ask the PO for a starting point. Do not guess.

The target is `origin/main` of `docs-molcadx`, unless the PO names a branch (e.g. to sync against
an open spec PR). Say which target you used.

## 2. Diff the specs

```bash
git diff --stat <sync_sha>..<target> -- DOMAINS/*/DOCS-EN DOMAINS/*/DOCS DOMAINS/*/UX DOMAINS/*/FLOW DOCS/04-metrics-framework.md DOCS/01-glossary.md
git diff <sync_sha>..<target> -- <each changed file>
```

For every changed file, list the changed **sections** (the nearest `#` heading above each hunk),
and inside them the changed **entity names, field names, rule IDs and open-question IDs**
(e.g. `REJECT_REASON`, `disposition`, `T-6`, `AU-2`). Renamed or deleted headings matter too:
they break PRD anchors.

Ignore pure typo/format hunks, but list them in the report as "ignored (wording)".

## 3. Map changes to stories

For each changed section, search **all live PRD folders**:

1. **Links:** `grep -rn "<changed-file>.md#<anchor>"` and `grep -rn "<changed-file>.md"` across the
   PRD files. PRD links to specs use `https://github.com/molca-id/docs-molcadx/blob/main/...`.
2. **Names:** `grep -rn` for each changed entity / field / rule / question ID.
3. From each hit, find the story it belongs to: the nearest `#### US-...` heading above it, or the
   module file's "Open items" table, README, cross-cutting file, etc.

Build a table: *change → PRD file → story ID (or section) → why it matched*. A change with no match
goes in an **unmatched** list.

## 4. Read only what is affected, then edit

For each matched story: read the **whole changed spec section** (from the target commit) and the
**whole detail block** of the story. Nothing else unless a link inside them needs following.

Edit the story so it matches the spec. Keep the PRD's format (`AGENTS.md` §4, `DOCS/03-prd-standard.md`):
all 8 parts, "not applicable" never deleted, plain language, exact field names in section 5, formulas
with a worked example. Then fix everything that follows from the edit:

- the story's **Status** line and its row in the module's Stories table;
- the module's **Open items** table (close resolved items, add new ones with owner);
- counts in the module Totals line and the PRD `README.md` (modules table, totals, blockers);
- `30-release-risks-questions.md` open-questions table if an ID there changed;
- broken anchors to renamed headings anywhere in the PRD;
- a row in the module file's **Change notes** and in `99-history.md` (decision log) when a decision drove it.

Rules while editing:
- **Screen text comes from `UX/`.** When a changed UX doc's `## Screen text` block touches a story's screen,
  copy the text into the story's Expectation **word for word**, with its key (e.g. `sit-004.empty`). Never
  reword it. Text the PRD has but the UX doc lacks: report it as unmatched (the PO decides whether it goes in UX).
- **Never invent** a field, rule or number the spec doesn't have. If the spec is ambiguous, write
  `TBD — needs PO confirmation` with the exact question.
- **Never create a new story** or a new module file (rule 1). A spec change that needs a new story goes
  in the unmatched list for the PO.
- **Never close or retire a story silently** (§4 dependency rule 4): if a spec change makes a story
  obsolete, mark it in the report and let the PO decide; if it is a dependency of other stories, list them.
- If the spec contradicts itself or another domain's spec, don't pick a side: add an open item and
  report it as a real inconsistency.
- **Markdown must render in GitHub and Obsidian** (`DOCS/03-prd-standard.md` §3.6). When copying spec or
  UX text, escape placeholders as `\<count\>` (it still displays `<count>`, so it is still word for word);
  not inside `` `code` ``, code blocks or link targets. Formula boxes are callouts,
  `> [!note]- Exact formula (for developers)`, never `<details>`. No table inside a list item; every
  table row has the header's cell count and sits on one line.

## 5. Check links and rendering

Run a link and anchor check over every PRD file you edited: relative links must resolve inside
`prd-molcadx`, and every `docs-molcadx/blob/main/...#anchor` must exist at the target commit
(GitHub slug rules: lowercase, drop punctuation except `-` and `_`, spaces → `-`). Fix anything broken
that you introduced.

Then check rendering (`DOCS/03-prd-standard.md` §3.6) over the same files, run from `prd-molcadx`:

```bash
python3 ../docs-molcadx/.claude/skills/prd-sync/check_render.py <edited .md files>
```

It prints nothing when clean. It flags bare `<placeholder>` / HTML outside code (only `<br>` allowed,
`<details>` included), tables indented under a list item, tables without a `|---|` row, rows whose cell
count differs from the header, and a missing blank line after a table. Fix what you introduced; report
what was already there.

## 6. Move the sync point and log it

- Update the `**Specs synced to**` row in each synced PRD README to `docs-molcadx@<target sha>` and today's date.
- `prd-molcadx/CHANGELOG.md`: one entry — the sync range, each story changed and why, anything unmatched.
- **Do not log the sync in `docs-molcadx/LOGS/CHANGELOG.md`.** The PRD changelog is the record of the sync;
  the decision that caused the spec change is already logged in docs-molcadx (`AGENTS.md` §5 rule 1a). Only
  exception: if the sync found a **spec problem** (a real inconsistency, or a spec gap the PO must answer),
  add one line about that finding under the session's entry. **No frontend repo paths** in that changelog.

## 7. Branch, commit, PR

In `prd-molcadx`: branch `docs/prd-sync-<yyyy-mm-dd>` from `origin/main`, commit, push, open a PR
(base `main`). PR body: the sync range, the change → story table, the unmatched list, and every
`TBD` you added. End with the repo's attribution line. Commit in `docs-molcadx` only if you logged a
spec problem there (step 6). Never commit `.claude/settings.json`.

## 8. Report to the PO (short)

1. Sync range per PRD and the target used.
2. Stories changed (ID → one line why).
3. **Unmatched changes** — spec changes no story covers. These need the PO: new story, or no PRD impact.
4. Stories that may be obsolete, and real inconsistencies found.
5. PR link(s).

</what-to-do>
