# UX 02 — Shift screens

> Mirrors [F-02 shift](../DOCS-EN/02-shift.md) · behavior: [FLOW-01](../FLOW/01-site-skeleton.md) ·
> Status: 🟡 DRAFT.

**Coverage:** `ENTERPRISE_SHIFT`, `SITE_SHIFT`, `SHIFT_INSTANCE` (F-02 §9) — rule D-1.

**Retired screen note (2026-08-26, PO; revised 2026-08-28):** `SCR-FND-SHF-001`
(enterprise shift labels) and `SCR-FND-SHF-002` (site shift declaration) are **both
retired as standalone screens** — they now live as the two node-type variants of the
Shift panel inside `SCR-FND-SIT-002` ([`01-site-hierarchy.md`](01-site-hierarchy.md)):
`SCR-FND-SHF-001`'s declaration UI shows when the selected node is `ENTERPRISE`;
`SCR-FND-SHF-002`'s completion checklist shows when the selected node is `SITE`. Both IDs
are kept (never reused/renumbered per [`00-ux.md`](00-ux.md)) and point to their
respective panel. The two operational screens below (`SCR-FND-SHF-003`/`004`) are **not**
affected — see rationale in `01-site-hierarchy.md`'s "Shift & Fiscal panels".

## Screens

| SCR ID | Screen | Purpose | Entities (§9) | States worth noting | Stories |
|---|---|---|---|---|---|
| ~~`SCR-FND-SHF-001`~~ | ~~Enterprise shift labels~~ **Retired — see note above.** Now the "Shift" panel of `SCR-FND-SIT-002` on the `ENTERPRISE` node. Declares shift labels once, centrally. Existing rows are also **editable in place** — a pencil icon per row opens an edit dialog for `shift_label` (F-02 §9.1 already treats it as an ordinary declared field, not a closed/immutable record like `SHIFT_INSTANCE`) | — | `ENTERPRISE_SHIFT` | Empty: no shifts declared yet → "declare your first shift"; Edit: pencil icon per row opens a dialog to change `shift_label`; Error: cannot delete a label that sites adopted — names the sites | `US-FND-SHF-001` |
| ~~`SCR-FND-SHF-002`~~ | ~~Site shift declaration~~ **Retired — see note above.** Now the "Shift" panel of `SCR-FND-SIT-002` on the `SITE` node | — | `SITE_SHIFT` | Default: completion checklist per enterprise shift; midnight-crossing shown as a derived hint once both times are set — **no checkbox** (FLOW-01 implication); no break fields by design (H-2); Error: declaring/editing a window that overlaps another already-declared shift at the same site is rejected, naming the conflicting shift (new rule, resolved 2026-09-02, see F-02 §9.2) | `US-FND-SHF-001`, `US-FND-SHF-002` |
| `SCR-FND-SHF-003` | Shift instance monitor | Browse generated instances per site/date; surface duplicates and gaps for ops | `SHIFT_INSTANCE` | Empty: "no instances generated for this date" is an **alert condition**, not a blank page (H-6: no gaps allowed); Error: duplicate rejection message | `US-FND-SHF-002` |
| ~~`SCR-FND-SHF-004`~~ | ~~Crew assignment~~ **Retired 2026-09-25 (PO): not needed for now.** Was: assign a crew (regu) to a shift instance. No `CREW` entity exists since Organization was removed; the screen and its text are dropped rather than kept waiting. SCR ID and `shf-004.*` keys are not reused | — | — | — | ~~`US-FND-SHF-004`~~ |

## Screen text

Rules T-1 to T-4 in [`00-ux.md`](00-ux.md#screen-text--this-folder-is-the-source-po-decision-2026-09-25).
Text copied word for word from PRD-003 `02-shift.md`. `SCR-FND-SHF-001`/`002` are retired (panels of
`SCR-FND-SIT-002`) — their text lives in [`01-site-hierarchy.md`](01-site-hierarchy.md).

### SCR-FND-SHF-003 — Shift instance monitor

| Key | Where / state | Text | Stories |
|---|---|---|---|
| `shf-003.title` | Page title | "Shift calendar" (draft) | US-FND-SHF-002 |
| `shf-003.default` | Default state — calendar per site; each instance shows start, end, status | "\<shift label\> · \<start\>–\<end\> · \<status\>" (draft) | US-FND-SHF-002 |
| `shf-003.status.open` | Status label of an open instance (stored `open`) | "Open" (draft) | US-FND-SHF-002 |
| `shf-003.status.closed` | Status label of a closed instance (stored `closed`) | "Closed" (draft) | US-FND-SHF-002 |
| `shf-003.horizon` | Horizon marker — last date with generated instances | "Shifts generated up to \<date\>" (draft) | US-FND-SHF-002 |
| `shf-003.gap-count` | Next to the horizon marker — how many gap alerts (`shf-003.alert.gap`) the calendar's shown date range has; hidden at 0 (never "0"). Selecting it opens the generate control (the date-range picker of `shf-003.empty.generate`) (PO, 2026-10-01, UX-SHF-3) | "\<n\> gap(s) in this range" | US-FND-SHF-002 |
| `shf-003.alert.gap` | Production date missing an instance for one of the site's shifts — shown as an alert, not an empty cell (AC-7) | "No \<shift label\> generated for this date." (draft; see UX-SHF-2) | US-FND-SHF-002 |
| `shf-003.not-scheduled` | Date not in the production-date list — marked as not scheduled, not as a gap (AC-2) | "Not scheduled" (draft) | US-FND-SHF-002 |
| `shf-003.empty` | Empty state — no instances yet | "No shifts generated yet" | US-FND-SHF-002 |
| `shf-003.empty.generate` | Empty state — generate button (with a date-range picker) | "Generate shifts" (draft) | US-FND-SHF-002 |
| `shf-003.empty.no-hours` | Empty state — the site has **no declared `SITE_SHIFT` rows**, so there is nothing to generate. Shown **instead of** the generate button; a link to the `SITE` node's Shift panel in `SCR-FND-SIT-002` (PO, 2026-10-01) | "Declare shift hours for \<site\>" | US-FND-SHF-002 |
| `shf-003.loading` | Loading state | N/A — calendar placeholder, no text (PRD SHF-002 States) | US-FND-SHF-002 |
| `shf-003.error.generation-failed` | Error — generation stopped on one date; earlier dates stay saved | "Generation failed on date `<x>` — earlier dates remain saved" | US-FND-SHF-002 |
| `shf-003.error.duplicate` | Error — second instance for the same site, shift and date refused "with its own message" | "\<site\> already has \<shift label\> on \<date\>. It was not added again." (draft) | US-FND-SHF-002 |
| `shf-003.offline` | Offline state — PRD says "Not available" | "You're offline. Shift calendar needs a connection to load and generate shifts." (draft) | US-FND-SHF-002 |
| `shf-003.success` | Success — generation summary, plus the new horizon; a re-run reports 0 new (AC-4) | "`<n>` shift instances created for `<range>`" | US-FND-SHF-002 |
| `shf-003.no-permission` | No permission — PRD says "Read-only" | "You can view shifts but not generate them. Ask your Plant Admin/IT for access." (draft) | US-FND-SHF-002 |

### ~~SCR-FND-SHF-004 — Crew assignment~~

> **Retired 2026-09-25 (PO): not needed for now.** The screen text rows (`shf-004.*`) are removed;
> the keys are not reused. If crew assignment comes back, it starts from a new SCR ID once the
> crew-grouping question (FOUNDATION vs `production-domain`) is decided.

## State notes

- `SHIFT_INSTANCE.status` full value list is `TBD` (F-02 §9.3) — screens show open/closed
  today; any added state (draft/cancelled) must appear in the F-02 spec first, then here.
- **No shift hours, no generate (PO, 2026-10-01).** A site with zero declared
  `SITE_SHIFT` rows never offers "Generate shifts": a run would create nothing and still report success
  (`shf-003.success` with 0), a dead end. It shows `shf-003.empty.no-hours` instead, linking to where hours are
  declared. This differs from AC-4's re-run that reports 0 new: there the site has hours and the range is
  already generated.
- Closed instances render read-only with an entry point to the adjustments ledger
  (`SCR-PROD-SHF-008`, PRODUCTION UX pending) — no edit affordance (core concept 7).

## Open questions

| # | Question | Owner |
|---|---|---|
| UX-SHF-1 | Who may regenerate a missing instance for *today* — an ops screen, or a production-domain job only? | PO |
| UX-SHF-2 | Gap alert text on `SCR-FND-SHF-003` (`shf-003.alert.gap`): the Screens table above quotes "no instances generated for this date"; PRD-003 `US-FND-SHF-002` gives no wording for the alert (its only Empty text is "No shifts generated yet", for a site with no instances at all). Is the UX quote the approved alert text? | PO |
| ~~UX-SHF-3~~ | ~~Keep the gap count next to the horizon marker, and decide it together with UX-SHF-2?~~ **Resolved 2026-10-01 (PO): keep it** — `shf-003.gap-count`. It sits beside the per-date alerts, it does not replace them; their wording stays open in UX-SHF-2 | — |
