---
name: prd-pilot
description: Measures whether a domain's DOCS-EN/UX/FLOW docs are sufficient to reproduce its real PRD stories, by having a fresh agent (with no access to the real PRD) write them from the docs alone, then diffing the result against the real PRD to produce a categorized gap list (genuine doc gap / harmless authoring choice / real inconsistency). Use when the PO wants to check PRD-to-docs consistency, measure doc completeness, or decide what to add to a domain's docs before trusting a PRD generated from them. Not for actually writing or editing a real PRD — this is read-only diagnostic.
allowed-tools:
  - Read
  - Write
  - Bash
  - Grep
  - Glob
  - Agent
---

<what-to-do>

Run a two-step experiment for one or more modules of a domain PRD, then report a
structured gap table. Never edit any real file (`../prd-molcadx/**`, `DOMAINS/**`,
`AGENTS.md`) as part of this skill — it is read-only diagnosis. If the report
surfaces something worth fixing, that is a separate, explicit follow-up the PO
decides on afterward.

## 0. Resolve scope

The caller names a domain (e.g. `FOUNDATION`) and either one module (e.g. `F-05`,
`F-07`) or `all`. Resolve:

- The domain's PRD file(s) — check `AGENTS.md` §2 for which PRD in `../prd-molcadx/` covers
  this domain (a domain may have its own PRD, like `PRD-003`, and/or be covered by
  the cross-domain `PRD-001`).
- Per module: its `DOCS-EN/NN-*.md` file(s) (a module can span more than one file,
  e.g. F-07 = `07-0-kpi-formula.md` + `07-1-kpi-tag-mapping.md`), its `UX/NN-*.md`
  file if one exists, and whether any `FLOW/*.md` file is load-bearing for it
  (check the module's own doc for FLOW cross-references — only include a FLOW file
  if the module's behavior genuinely depends on it, don't include the whole FLOW
  series by default).
- The domain's own shared foundational doc (e.g. `DOMAINS/FOUNDATION/DOCS-EN/00-foundation.md`)
  — always include this, every module inherits its global rules.
- The real story IDs for this module in the PRD: `grep -n "^#### \`US-<DOMAIN>-<MODULE_CODE>" <prd file>`
  using the module code table in `AGENTS.md` §4 (e.g. `REF`, `KPI`, `SIT`, `SHF`).
  Read each matched story's full block (through its Dependencies row) so you know
  exactly what Version B contains before briefing the diff agent.

For `all`: repeat step 0 for every in-scope module listed in the PRD's own "In
scope" section, then run steps 1–2 once per module. Launch step-1 agents for
independent modules in parallel (multiple `Agent` calls in one message) rather
than serially — they don't depend on each other. Keep each pair (write + its own
diff) sequential, since the diff needs the write's output file.

## 1. Write pilot — one fresh agent per module, zero access to the real PRD

Spawn with `subagent_type: general-purpose` (NOT `fork` — it must have no memory
of this conversation or any prior pilot). Use this prompt shape, filling in the
module-specific parts:

```
You are writing a Product Requirements Document for MolcaDx, a manufacturing
digital-transformation platform. Work in <repo path> (read-only for you except
one output file — see below).

Read these files, in this order, before writing anything:
1. AGENTS.md — repo contract (skim domain/layout, focus on §4 "PRD format" and §5 "working rules")
2. DOCS/03-prd-standard.md — the mandatory PRD checklist
3. DOCS/templates/prd-template.md — the skeleton to follow
4. DOCS/00-product-overview.md — persona list (§3, required by AGENTS.md §4)
5. DOCS/01-glossary.md — domain terminology
6. <domain>/DOCS-EN/00-<domain>.md — the domain's global rules
7. <the module's DOCS-EN file(s)> — the module's entities/rules
8. <domain>/UX/00-ux.md — UX doc conventions (SCR ID scheme)
9. <the module's UX file, if one exists>
[10. <any load-bearing FLOW file, only if genuinely needed>]

Do NOT read anything else in this repo. Specifically: do not open, list, or grep
anything under ../prd-molcadx/, do not open LOGS/CHANGELOG.md, do not open anything
under <domain>/FLOW/ beyond what's listed above, do not open any other domain's
folder. Treat those paths as if they don't exist, even if something you read
cross-references them.

Your task: write the full PRD user-story section for <module name/code>,
covering every screen/behavior implied by the UX file's SCR-* rows (or, if no UX
file exists, every entity/rule in the DOCS-EN file that implies a distinct user
action) — one story per screen/behavior at minimum, split further only if the
source material clearly demands it (see AGENTS.md §4's story-splitting
guidance). Follow the user-story format exactly: the summary table row, then the
full eight-part detail block (Story, Context, Expectation, Calculation, Data &
entities, Rules & constraints, Acceptance criteria, Metrics & events) for every
story — no part may say "cannot be specified" unless the source docs genuinely
leave it undetermined, in which case write `TBD — perlu konfirmasi PO` (or the
correct owner named in the source) with the specific open question. Never invent
a fact, field, role, or UI copy string not in what you read (AGENTS.md §5 rule
5). Every Calculation section must cite the actual source formula/rule and use
a real worked numeric example — reuse the source's own examples where it gives
one; if you must construct your own to illustrate an extension, explicitly label
it as constructed, not verbatim source fact.

Assign your own story IDs following the US-<DOMAIN>-<MODULE_CODE>-NNN pattern —
numbering doesn't need to match anything, you have no visibility into any
existing numbering.

Where to write it: create ONE new file at <scratchpad path>/<module>-prd-pilot.md
(outside the repo). Do not create, edit, or write to any file inside the repo.

When done, report back a short summary of which stories you wrote and which
fields you had to mark TBD (and to whom).
```

## 2. Diff — one fresh agent per module, reads both versions

Spawn with `subagent_type: general-purpose`. Give it: the pilot file path, the
real PRD file path + the exact story-ID range/headings you found in step 0, and
this task shape:

```
Two versions of the same PRD content exist — produce a precise gap analysis.

Version A (the pilot): <pilot file path> — written from scratch by a fresh
agent given only <list the exact files A was allowed to read>, barred from
../prd-molcadx/, LOGS/CHANGELOG.md, and other domains.

Version B (the real thing): <real PRD file path>, stories <ID list> (read each
full block).

1. Coverage diff: match A's stories to B's by subject (IDs may differ). Note
   anything either side has that the other doesn't.
2. Content diff per matched pair, across all 8 PRD parts, categorized into
   exactly one bucket:
   (a) Genuine domain-doc gap — B has a fact NOT derivable from the docs A read
       (UI copy, role name, numeric threshold, event name, persona, screen
       behavior). This is the real deliverable.
   (b) Authoring freedom — wording, ID numbers, persona choice among valid
       options, story-splitting granularity. Not a gap.
   (c) Real inconsistency — A and B contradict each other on a claimed fact.
       Say which is correct per the CURRENT source doc text (quote the line) —
       one side may be stale.
   Explicitly verify any shared arithmetic/worked examples against the source's
   own numbers; flag drift as bucket (c), not (a).
3. TBD comparison: for each item A marked TBD, check whether B has a real
   specific answer (a PO decision A had no access to) or B also leaves it
   open/unanswered (genuinely open product question, not a docs gap).
4. If the module's story set intersects another domain's territory (e.g. a
   FOUNDATION module whose calc/screens are stated as production-domain's job),
   check whether AGENTS.md's own module-ownership claims (§3/§4) still match
   what the real PRD actually contains — flag any drift there too, plainly.

Output: a markdown table for bucket (a) — | Story | PRD part | What's missing |
What B has that A couldn't derive |. A short table for bucket (c). A brief
bullet list for bucket (b). A one-paragraph verdict on roughly how much of B's
content, by information volume, could not have been produced from the docs A
read alone.

Do not fix, edit, or write to any file. Read-only. Report findings directly in
your final response, not to a file.
```

## 3. Aggregate and report

For a single module: relay the diff agent's report directly, compressed to the
essentials (don't just paste the raw agent output — pull out the bucket-(a)
table, the bucket-(c) table if non-empty, and the verdict sentence).

For `all`: after every module's diff completes, build one consolidated summary:
a single bucket-(a) table across all modules (module name as a leading column),
a list of any bucket-(c) inconsistencies found (these are bugs worth fixing
regardless of the broader reproducibility question), and a closing verdict
comparing modules — which ones are closest to fully reproducible, which have
the largest gaps, and whether the gap categories repeat across modules (a
repeated category, e.g. "no role names anywhere," is a signal to fix once at
the template level rather than per-module).

Never silently fix anything found. End by listing what you found as candidate
follow-ups and let the PO choose what to act on.

</what-to-do>
