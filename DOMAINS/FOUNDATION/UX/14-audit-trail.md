# UX 14 — Audit log screens

> Mirrors [F-14 audit trail](../DOCS-EN/14-audit-trail.md) ·
> Status: 🟡 DRAFT (first version, 2026-10-02 — PO, prd-molcadx#24 item 23).

**Coverage:** `AUDIT_LOG` (F-14 §9.1) — rule D-1. Read-only: no screen writes an audit row except the
system itself, when a user downloads (F-14 §9.2).

**Not in this file yet:** the **History** capability — the per-record history view on each record's own
screen (`US-FND-AUD-002`). It reads the same rows filtered to one record; its screens are still to be
declared, per module (F-14 "Next step" 5).

## Audit log page (PO decision, 2026-10-02, prd-molcadx#24 item 23)

- **One page for the whole system.** `SCR-FND-AUD-001` shows `AUDIT_LOG` rows from every domain and module
  the user may read. It is central by the 2026-09-25 PO decision (F-14 "Where it sits").
- **Sidebar:** its own group **"Library configuration"**, item **"Audit log"**. This is the Figma
  "Library Configuration" group with its "Log service" box. Where the group sits in the sidebar is UX-AUD-1.
- **Read-only.** Nothing on the page edits or removes a row (F-14 core concept 4). The only action is
  **Download** of the filtered rows (`US-FND-AUD-004`).
- **Rows filtered by permission.** The page has no permission of its own. It shows only rows whose
  `domain_code` + `module_code` the user holds `<domain>:<module>:<scope>:audit_view` for, at a scope that
  covers the row's scope snapshot (F-14 §9.2, [F-00.1](../DOCS-EN/00-1-authorization-permissions.md#audit-trail-aud--14-audit-trailmd-9)).
  A user who holds none sees the page with no rows, not an error.
- **Every row names where it came from**, by name: "PRODUCTION · Production Planning", "FOUNDATION · Site
  Hierarchy" (names from the PRD module code table, [`AGENTS.md`](../../../AGENTS.md) §4). Opening a row
  goes to the record's screen **in its owning module**, not a FOUNDATION page.
- **Reason is shown on every row that has one.** A reason is required on every `update`, `deactivate`,
  `reactivate` and business action a person makes — **including `release` and `upload`** — and once per
  bulk import (F-14 §9.2, PO, 2026-10-02, prd-molcadx#24 item 23). Only `create`, `source = system`,
  `download` and `*_downloaded` rows may have none.

## Screens

| SCR ID | Screen | Purpose | Entities (§9) | States worth noting | Stories |
|---|---|---|---|---|---|
| `SCR-FND-AUD-001` | Audit log | Search every change the user may read. **Filters:** period (default last 7 days, at most `[proposed]` 366 days), person or job, domain and module, data type (`entity_type`), action, source, site / area. **Columns:** when · domain · module · who · action · data type · record code · what changed (short) · applies from · source. Import batches can be grouped into one line ("Import of \<n\> rows"). Opening a line shows its full `changes` (before → after per field), reason, effective dates, and a link to the record in its owning module. **Download** exports the filtered rows (`US-FND-AUD-004`) | `AUDIT_LOG` (read); one `AUDIT_LOG` row written by the system per download (`action = download`) | **Default** filtered table. **Empty** no row matches. **Loading** row placeholders. **Error** load failed, filters kept. **Offline** needs a connection, no cached rows. **Success** N/A — read-only page (download success = the file downloads). **No permission** no `audit_view` anywhere → page with no rows plus a note, not an error; Download hidden when the user holds no `audit_download`. Secret fields show "Hidden", never the value (F-14 core concept 8). Scope uses the snapshot on the row, not the record's current place | `US-FND-AUD-003`, `US-FND-AUD-004` |

## Screen text

Rules T-1…T-4 in [00-ux.md](00-ux.md#screen-text--this-folder-is-the-source-po-decision-2026-09-25).
Source: PRD-003 `US-FND-AUD-003`, `US-FND-AUD-004`. Texts the PRD gives word for word are written
without "(draft)"; the rest are drafts.

### SCR-FND-AUD-001 — Audit log

| Key | Where / state | Text | Stories |
|---|---|---|---|
| `aud-sidebar.group` | Sidebar group label | "Library configuration" (draft) | US-FND-AUD-003 |
| `aud-sidebar.item` | Sidebar item | "Audit log" (draft) | US-FND-AUD-003 |
| `aud-001.title` | Page title | "Audit log" (draft) | US-FND-AUD-003 |
| `aud-001.subtitle` | Under the title | "Every change you have access to, across all modules. Nothing here can be edited." (draft) | US-FND-AUD-003 |
| `aud-001.filter.period` | Filter: period | "Period" (draft) | US-FND-AUD-003 |
| `aud-001.filter.actor` | Filter: person or job | "Changed by" (draft) | US-FND-AUD-003 |
| `aud-001.filter.module` | Filter: domain and module | "Module" (draft) | US-FND-AUD-003 |
| `aud-001.filter.entity-type` | Filter: data type | "Data type" (draft) | US-FND-AUD-003 |
| `aud-001.filter.action` | Filter: action | "Action" (draft) | US-FND-AUD-003 |
| `aud-001.filter.source` | Filter: source | "Source" (draft) | US-FND-AUD-003 |
| `aud-001.filter.scope` | Filter: site / area | "Site / area" (draft) | US-FND-AUD-003 |
| `aud-001.columns` | Table columns | "When" · "Module" · "Changed by" · "Action" · "Data type" · "Record" · "What changed" · "Applies from" · "Source" (draft). "Module" shows "\<domain\> · \<module\>", e.g. "PRODUCTION · Production Planning" | US-FND-AUD-003 |
| `aud-001.action.label` | Action cell values, generic actions | "Created" · "Edited" · "Deactivated" · "Reactivated" · "Downloaded" (draft). Business actions show the owning domain's own label — `TBD — production-domain / maintenance-domain` (F-14 AU-12) | US-FND-AUD-003 |
| `aud-001.source.label` | Source cell values | "Screen" · "Import" · "API" · "System" (draft) | US-FND-AUD-003 |
| `aud-001.import-group` | One line for a grouped import batch | "Import of \<n\> rows" | US-FND-AUD-003 |
| `aud-001.detail.changes` | Row detail: list of changed fields | "\<field\>: \<before\> → \<after\>" (draft) | US-FND-AUD-003 |
| `aud-001.detail.reason` | Row detail: reason label | "Reason" (draft) | US-FND-AUD-003 |
| `aud-001.detail.no-reason` | Row detail: row with no reason (create, system job, download) | "No reason needed" (draft) | US-FND-AUD-003 |
| `aud-001.detail.effective` | Row detail: effective dates | "Applies from \<date\>" · "Old value applied until \<date\>" (draft) | US-FND-AUD-003 |
| `aud-001.detail.open-record` | Row detail: link to the record in its owning module | "Open \<record code\>" (draft) | US-FND-AUD-003 |
| `aud-001.secret` | Where a secret field's value would be | "Hidden" (draft) | US-FND-AUD-003 |
| `aud-001.default` | Default state | N/A — no text: the filtered table (rows above) | US-FND-AUD-003 |
| `aud-001.empty` | Empty state — no row matches the filters | "No changes match these filters" | US-FND-AUD-003 |
| `aud-001.loading` | Loading state | N/A — no text: row placeholders | US-FND-AUD-003 |
| `aud-001.error` | Load failed — filters kept | "The audit log couldn't load — try again" | US-FND-AUD-003 |
| `aud-001.offline` | Offline state | "The audit log needs a connection" | US-FND-AUD-003 |
| `aud-001.success` | Success | N/A — read-only page | US-FND-AUD-003 |
| `aud-001.no-permission` | User holds `audit_view` for no module — page with no rows, not an error | "You don't have access to the change history of any module. Ask your Plant Admin/IT for access." (draft) | US-FND-AUD-003 |
| `aud-001.error.period-too-long` | Period longer than the limit | "Choose a period of 366 days or less." (draft — the 366-day limit is `[proposed]` in the PRD) | US-FND-AUD-003 |
| `aud-001.action.download` | Download button, uses the current filters | "Download" (draft) | US-FND-AUD-004 |
| `aud-001.download.disabled` | Download, no rows to download — button disabled | N/A — no text: the button is disabled | US-FND-AUD-004 |
| `aud-001.download.loading` | Download being prepared | "Preparing file…" | US-FND-AUD-004 |
| `aud-001.download.error` | Download failed; no `download` row is written | "Download failed — try again" | US-FND-AUD-004 |
| `aud-001.download.offline` | Download while offline | "Downloading needs a connection" | US-FND-AUD-004 |
| `aud-001.download.success` | Download success | N/A — no text: the file downloads | US-FND-AUD-004 |
| `aud-001.download.no-permission` | User holds `audit_download` for no module | N/A — no text: the button is hidden | US-FND-AUD-004 |

## State notes

- **Offline:** no offline copy. An audit search must reflect what is stored now; a stale cached list would
  mislead an investigation.
- **No success state:** the page never saves. The only write is the system's `download` row (F-14 §9.2).

## Open questions

| # | Question | Owner |
|---|---|---|
| UX-AUD-1 | Where does the "Library configuration" group sit in the domain-grouped sidebar ([00-ux App shell](00-ux.md#app-shell--sidebar-grouped-by-domain-po-decision-2026-09-28)) — with the shared items at the top, or below the domain groups? Does anything else go in it besides Audit log? | PO |
| UX-AUD-2 | Is the import-batch grouping ("Import of \<n\> rows") on by default, or a toggle? The PRD says batches "can be grouped" | PO |
| UX-AUD-3 | Who sees `download` rows on this page (F-14 AU-13)? F-14 proposes: a user who holds `audit_view` for every module in the row's `download_filter`. `TBD — perlu konfirmasi PO` | PO |
