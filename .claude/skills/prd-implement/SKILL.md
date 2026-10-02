---
name: prd-implement
description: Implement the MolcaDx PRD (prd-molcadx) in the repo-molcadx module repos — find what changed in the PRD since each repo was last built, build the buildable stories in the right repo, carry cross-repo effects (a FOUNDATION field change that Planning or Performance reads), verify, and report. Use whenever the user asks to implement, apply, build or catch up on the PRD, a prd-sync, a PRD story ID (US-FND-*, US-PROD-*), or "the latest PRD changes" in any mes-*-fe repo — even if they just say "implement the prd" or point at ../prd-molcadx.
---

# prd-implement

Turn PRD changes into code across the MolcaDx module repos. The PRD is written by the Product Owner in
`prd-molcadx` (synced from the specs in `docs-molcadx` by the `prd-sync` skill). This skill is the other
half: it takes what changed there and lands it in the apps.

The job is mostly judgment about **what** to build and **where**. The code itself follows each repo's
existing patterns. A run that builds the right three things and flags five is better than one that builds
eight and invents two.

## Layout this skill expects

```
<product>/                      e.g. ~/app/molca/product
├── prd-molcadx/                the PRD (read-only for you)
├── docs-molcadx/               the specs the PRD links into (read-only; follow links only when a story says to)
└── repo-molcadx/
    ├── mes-master-data-fe-*    FOUNDATION (PRD-003)
    ├── mes-production-planning-fe-*, -monitoring-fe-*, -performance-fe-*   PRODUCTION (PRD-004)
    └── mes-portal-fe-*         launcher
```

Which story goes to which repo: `references/repo-map.md`. Read it before step 2.

## Step 1 — Find the delta per repo

Run `scripts/prd-delta.sh <product-dir>`. For each repo it prints the PRD commit the repo was last built
against and the PRD commits since:

- It first looks for a `PRD-synced: prd-molcadx@<sha>` trailer in the repo's git log — exact.
- Without one, it falls back to the repo's last commit date and picks the last PRD commit before it. Say
  in your report that the start point is a date guess, and name it.

Also `git pull`/`fetch` nothing without asking; work on what is checked out. Check `git status` in every
repo first: uncommitted changes that aren't yours (a local `vite.config.ts` tweak, say) are the user's work
in progress. Leave them alone and keep them out of anything you commit.

Then read the delta, cheapest first:
1. The `CHANGELOG.md` entries since the start point. Each prd-sync entry lists changed stories, **Backlog**
   and **Unmatched (PO decides)** items. This is your map.
2. The **current** text of each changed story (not the diff) — the story is the contract, the diff only tells
   you where to look. `awk '/^#### US-FND-WMS-003/,/^#### US-/' <file>` pulls one story.
3. Only if a story's *Calculation* or *Data & entities* points into `docs-molcadx`, follow that link (UX key
   tables for exact screen text, F-docs for fields). Local `../docs-molcadx` is fine; check it is on
   `origin/main`.

Skip `90-*`, `99-*`, frozen PRD-001, and history/change-note sections — they explain, they don't specify.

## Step 2 — Decide what to build (and what not to)

Sort every changed item into one bucket before writing code:

| Bucket | What goes here | What you do |
|---|---|---|
| **Build** | 🟢 stories, and the buildable parts of 🟡 stories, whose placement is clear | Implement in the repo the map names |
| **Carry** | A change in one repo that another repo *reads* — a field's meaning changed, an entity was retired, a formula gained a step | Update the reader too (see below) |
| **Flag** | 🔴 / 🟠 stories, anything `TBD`, "Unmatched — PO decides", a story whose target repo, screen or persona is unclear | Don't build. List it, with the exact question |
| **Ignore** | Wording-only changes, sync-point moves, status notes that change no behaviour | Mention in one line |

Why the Flag bucket matters: a 🟢 marker means the text is buildable, not that its *placement* is agreed.
When MolcaDx split into separate module repos, some stories still describe "the app" as one thing. If you
would have to choose a repo, a screen or an owner the PRD doesn't name, stop — draft a `docs-molcadx`
issue (Context / Ask / Related) for the user instead of building. If a PRD acceptance criterion requires a
navigation item for a page no story specifies (e.g. a Maintenance page with no Maintenance PRD), ask before
adding even a placeholder.

**Finding Carry items.** For each entity or field the delta touched, grep every repo for its API shape
(`cycleTimeValue`, `uomId`, `/work-master`, `PRODUCT_CYCLE`…). The Production apps read FOUNDATION through
the Master Data API, so a meaning change there (e.g. `OPERATION.uom_id` becoming an item unit) silently
changes their numbers. Worked example: `references/example-2026-09-28.md`.

Show the user the bucket list before a large build (more than ~one repo or ~10 files). For a small delta,
go ahead and report at the end.

## Step 3 — Build

Work repo by repo, FOUNDATION first (the others read it).

- **Read before you write.** Each repo has its own `AGENTS.md`/`CLAUDE.md` (Vite+ toolchain: `vp`, not
  `npm`). Match the surrounding code: comment density, naming, the PRD-ID-in-comment habit
  (`// PRD-003 WMS-003 rule 9: …`), refusal shapes, i18n files (`en` and `id`).
- **Screen text is copied, never written.** Where the story or its UX doc gives a key and text
  (`nav-sidebar.item.bom` "BOM"), use it word for word, keeping the key in a comment. Where no text is
  declared, use the repo's `tbdCopy()` helper or a minimal label, and list it under "choices made".
- **Rules live in the API; screens mirror them.** Enforce a save rule server-side (structured
  `refusal(...)`), then show it in the UI. Pure rules go in `*-rules.ts` / pure modules with unit tests
  named after the AC (`it("… (WMS-003 AC-15)")`).
- **Shared rules across repos.** When the same rule is needed in several repos (a unit-conversion resolver,
  a KPI engine), keep one source in master-data and copy it, with a header naming the source and "keep the
  copies in step". Diff the copies before finishing.
- **Retired things are removed**, not hidden: routes, tabs, API endpoints, types, locale keys, tests.
  Remove their locale keys from both languages.
- **Seed data follows the PRD's worked example** when a change makes the old seed contradict the rule (e.g.
  a conversion stored backwards). Say so in the report — other apps' demos change with it.
- Don't invent a field, rule, number or label. If you need one, it goes in Flag.

## Step 4 — Verify

In each changed repo:

```bash
vp run -r test              # package test scripts (plain `vp test` at the root picks up node_modules)
./apps/web/node_modules/.bin/tsc -b     # web typecheck (run inside apps/web); API: tsc --noEmit -p apps/api
vp check --fix              # format + lint
```

`npx` fails on these repos (pnpm devEngines) — call the local binaries. Building the web app (`vp build` in
`apps/web`) regenerates `routeTree.gen.ts` after route files change.

If the user's dev servers are running (`ss -ltnp | grep :3`), smoke-test the changed screens in the browser
and hit the changed endpoints with `rtk proxy curl -s …` (the plain `curl` output is rewritten by a hook and
won't parse as JSON). Check a PRD worked example end to end where one exists — e.g. 1,200 pack → 100 carton
→ 21,600 s. The first load of the dev server can render blank for a few seconds; wait before concluding
it's broken.

Report failures with their output. Don't call something verified that you didn't run.

## Step 5 — Report

Use this shape (plain language; the reader is the PO as much as a developer):

```
I've implemented <which PRD syncs / commits> in <repos>. <Repos> needed no changes: <why>.
<One line: tests / typecheck / lint status, and whether you checked it in the browser.> Nothing is committed yet.

**<Repo>**
- **<Change in user terms>:** <what it does now>. <The AC or example it satisfies, if checked.>

**Choices I made that you may want to check**
- **<Topic>:** <what you decided and why; the alternative>.

**Not built (needs a decision)**
- <Item> — <exact question> — <who decides>.

<One closing question: usually whether to commit, and how.>
```

## Step 6 — Commit (only when asked)

Don't commit unprompted. When the user says to, one commit per repo, on a branch if the repo is on its
default branch, excluding files that were dirty before you started. End each message with a trailer so the
next run knows exactly where to start:

```
feat: PRD-003 WMS-003 item unit, BOM/Routing pages, domain sidebar

PRD-synced: prd-molcadx@<HEAD sha of prd-molcadx you built from>
```
