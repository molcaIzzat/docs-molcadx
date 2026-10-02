---
name: molca-erd
description: Update, redraw or re-route the MolcaDx logical ERD in FigJam (file "FigJam Brainstorm OI", page "ERD — spec <date>") from the entity specs in DOMAINS/*/DOCS-EN and DOMAINS/PRODUCTION/DOCS, via the figma-console MCP Desktop Bridge. Use when the PO asks to update/sync/fix the ERD, add a new entity or FK to it, make its lines stop overlapping, regroup it by domain sections, or colour it by scope priority (Must/Could/Won't). Not for physical DB schema (engineering-domain) and not for editing the specs themselves.
---

# molca-erd

Keeps the FigJam ERD equal to the specs. The ERD is **derived**: specs are the source of truth, and the
ERD never adds a field the spec doesn't state (AGENTS.md §5 rule 5).

First time on this machine? Follow [`references/setup.md`](references/setup.md) (MCP server, Desktop
Bridge plugin). Where each table comes from: [`references/spec-sources.md`](references/spec-sources.md).

## What is on the page

| Thing | Name / shape | Owned by |
|---|---|---|
| Table | FigJam `TABLE` named `erd:<KEY>`. Row 0 = `TABLE \| <table_name> \| <DOMAIN · MODULE>` (header fill = module colour). Rows 1..n = `<type> \| <column> \| <note>`; notes use `PK`, `FK`, `nullable`, `conditional`, `UQ (1:1)` | `scripts/tables.js` |
| Line | `GROUP` named `erd-rel:<CHILD>.<fk>><PARENT>`: attached end connector (crow's foot) + vector path + attached end connector. One per FK column. Colour = parent header colour | `scripts/route.js` |
| Domain box | `SECTION` per domain: `FOUNDATION domain` (top), `MAINTENANCE domain`, `PRODUCTION domain` (lower row) | `scripts/sections.js` |
| Priority tint | Body cell fill: green Must · yellow Could · red Won't · white not in the scope sheet | `scripts/priority.js` |
| Title | `TEXT` "MolcaDx ERD — from specs (…), <date>" above FOUNDATION | edit by hand |
| Legend | the one `SHAPE_WITH_TEXT`, right of FOUNDATION | edit by hand |

Grid: columns at x = 0, 1300, 2600 … (table width 730, gutter 570), tables stacked from y = 400 with
160 px gaps. The router assumes this grid: a table off-grid becomes its own column.

## Workflow

Each script is a whole `figma_execute` `code` value: read the file and pass its full text. Use timeout
30000. Scripts are idempotent, so re-running is always safe.

1. **Connect.** Call `figma_list_open_files`. The ERD file must be active. If not, see setup.md step 5.
2. **Find the spec delta.**
   - Take the date in the page title. That is the last sync.
   - Run `git log --since=<date> --stat -- DOMAINS`.
   - Delegate the comparison to one Explore agent. Give it the current ERD dump: read all tables with a
     short `figma_execute` that prints `name`, then each row's `type | column | note`.
   - Ask it for, per table: ADD/REMOVE/CHANGE column with `file:line` evidence, NEW tables with full
     columns and module, new FK relations, and items it found unclear.
   - Spot-check two of its citations before you edit.
3. **Edit tables.** Paste `scripts/tables.js` followed by an EDITS block that calls `setRows`,
   `addRowAfter` and `newTable`.
   - Clone a new table from a table in the same module, so the header colour carries over.
   - Then call `restack(parent)` for each parent you touched.
   - If the run fails half-way, check what exists before re-running: runs are not transactional.
4. **Relations.** Add or remove entries in `RELS` at the top of `scripts/route.js`, one per FK column.
   Commit that change with the rest.
5. **Layout.**
   - A new FOUNDATION table goes in the column of its module, next to what it links to; add a column
     if one gets too tall.
   - A new MAINTENANCE or PRODUCTION table needs an entry in `LOWER` in `scripts/sections.js`.
   - Run `sections.js` whenever a column changed height or a domain gained a table. It deletes the
     lines, so run step 6 right after.
6. **Route lines.** Run `scripts/route.js`. The result must show `fails: []`, `tableHits: 0` and
   `overlaps: 0`.
7. **Priority.** Run `scripts/priority.js` if a table was added or the PO's scope sheet changed. Update
   its lists from the sheet first.
8. **Finish.**
   - Set the title date and the page name `ERD — spec <YYYY-MM-DD>`.
   - Update the legend's open items.
   - Take a screenshot with `figma_capture_screenshot` (no `nodeId` = whole page).
   - Report the changes as a table and list the spec conflicts you found, e.g. a Must table with a
     required FK to a Won't table.
9. **Repo.**
   - The ERD lives only in Figma. A pure ERD refresh changes no repo document.
   - If you changed this skill (RELS, LOWER, priority lists), log it in `LOGS/CHANGELOG.md` (rule 3).

## Figma API gotchas (all hit in practice)

- Use `await figma.getNodeByIdAsync(id)`. Sync `getNodeById` throws: the page uses `documentAccess: dynamic-page`.
- FigJam tables: use `insertRow(i)` and `removeRow(i)`. `insertRowAfter` does not exist. Row height
  comes from `cellAt(r,0).height`. Cell background: `cellAt(r,c).fills = [...]`.
- Load fonts before setting text: `await figma.loadFontAsync(cell.text.fontName)`. A shape's text
  lives in `shape.text`.
- Returning raw node props can fail with "Cannot unwrap symbol". Wrap them in
  `JSON.parse(JSON.stringify(x))`, and return only plain values.
- When deleting while iterating `page.children`, skip `n.removed`. Removing a group also removes its
  children, which are still in your snapshot.
- Inside a SECTION, `x`/`y` are relative. Use `absoluteTransform[0][2]` / `[1][2]` for page
  coordinates. Re-parent with `section.appendChild(t)`, then reset `t.x`/`t.y` relative to the section.
- Elbowed FigJam connectors cannot be given waypoints. The router fakes them with a vector body plus
  two short STRAIGHT connectors. They stay attached at the table ends only: **moving a table by hand
  leaves its lines behind, so re-run `route.js`.**
- `figma_take_screenshot` uses the REST token and fails when it has expired. `figma_capture_screenshot`
  goes through the bridge and always works. A whole-page capture is around 0.11× scale: fine for
  layout, too small for text.

## Rules

- No new field, entity or relation without a spec line behind it. Put "unclear" items in the legend's
  open items, not on a table.
- Logical model: key and business columns only. No audit timestamps.
- Never touch the old physical ERD on page "nge-ERD".
- Do not edit PRDs from this skill (no PRD sync unless asked).
