# UX 13 — Data source screens

> Mirrors [F-13 data source](../DOCS-EN/13-data-source.md) · tag declarations from
> [F-04 §9.7](../DOCS-EN/04-asset-ontology.md#97-asset_tags--per-asset-tag--signal-declaration) ·
> Status: 🟡 DRAFT (first version, 2026-09-25).

**Coverage:** `DATA_SOURCE` (F-13 §9.1) and `ASSET_TAGS` (F-04 §9.7) — rule D-1. `ASSET_TAGS` had no
screen before this file; the entity stays owned by F-04, only its screen lives here (same pattern as
the class lists in [UX 05](05-reference.md)).

## Connections sidebar group (PO decision, 2026-09-25)

Data sources get their **own sidebar group, "Connections"** — not the Reference data group. Reference
data holds flat pick-lists of codes and names ([UX 05](05-reference.md)); a data source is live setup:
it carries connection secrets (`connection_config`, never shown to anyone) and a connection status
(`last_seen_at`). Integration (F-11) can add its items to this group once it has entities.

| # | Sidebar item | Screen | Entities | Spec |
|---|---|---|---|---|
| 1 | Data sources | `SCR-FND-DSR-001` | `DATA_SOURCE` (tag count per source) | F-13, F-04 |
| 2 | Tags | `SCR-FND-DSR-002` (2026-09-28) | `ASSET_TAGS` | F-04 §9.7, F-13 |

## Tags page (PO decision, 2026-09-28)

MolcaDx only **declares** the tags (nodes): name, address, machine, role. The hardware person configures
the OPC UA server elsewhere, from the hand-off list. So the declared tags need their own page — until now
they were only visible inside one selected data source (UX-DSR-1).

- **New item "Tags"** in the Connections group → `SCR-FND-DSR-002`: every declared `ASSET_TAGS` row in the
  site, across all data sources. Tag create / edit / Test read move here (same form, rules and text as
  before; the `dsr-001.tags.*`, `dsr-001.error.*` tag rows and `dsr-001.action.test-read` keep their keys
  and now render on this page — keys are never renamed or reused).
- **`SCR-FND-DSR-001` keeps the connections only**; each source row shows its tag count, linking to
  Tags filtered to that source.
- **Export tag list moves to the Tags page** and exports **the rows the current filter shows** — per data
  source, per site or per work center (answers the "where" part of UX-DSR-2; file format still F-04 A-11).
- **Reached from elsewhere:** the KPI side panel's "No tag declared for \<machine\>" link
  ([UX 07](07-kpi.md#kpi-page-cards-one-side-panel-per-kpi-po-decision-2026-09-28)) and the asset form
  ([UX 04](04-asset.md)) open this page filtered to that machine.

## Declaring a tag (PO decision, 2026-09-28)

Improvements to how a tag is declared on the Tags page. No new entity or field — only order, defaults and
entry points.

- **Address naming stays a choice per data source, default "Build from location".** Some sites connect
  straight to a machine's or vendor's OPC UA server whose node names are fixed, so typed addresses are still
  needed (`DATA_SOURCE.node_naming`, [F-13](../DOCS-EN/13-data-source.md)). A new OPC UA source starts on
  "Build from location"; the user switches to "Type each address" only for that case. **MQTT too (2026-09-28):**
  a new MQTT source also starts on "Build from location" (topic `[<topic root>/]SITE/AREA/WC/WU/ASSET/TAG`, topic root optional, one
  value per topic, [F-04 §9.7.1](../DOCS-EN/04-asset-ontology.md#971-generated-opc-ua-node-address)); "Type each
  address" is for topics a device publishes in its own structure, or several signals in one message.
  The choice is per source, never per tag — one server never mixes both kinds.
- **Typed addresses stay visible.** The Tags page has a filter "Typed addresses" (tags on a
  `node_naming = manual` source), so the exceptions can be reviewed.
- **Tag form, field order:**

| # | Field | Why here |
|---|---|---|
| 1 | Data source | Decides whether the address is typed or generated |
| 2 | Machine | Limited to machines in the source's site (`dsr-001.error.site-mismatch` can't happen from the form) |
| 3 | Role (`tag_role`) | Pre-fills kind, and shows the unit / counting basis and reason fields only when the role needs them (F-04 §9.7) |
| 4 | Tag name | Pre-filled from the role (e.g. role Total → `Total_Count`); editable; same character rule |
| 5 | Work unit | Only when the machine is placed on more than one work unit (`dsr-001.tags.field.lane`) |
| — | Address | Generated source: **live read-only preview** as the fields are filled, with `dsr-001.tags.address.generated-hint`; machine not placed → `dsr-001.tags.address.not-placed`. Typed source: a text field |

  The pre-filled kind and tag name are suggestions — the user can change them. The role → default kind and
  role → default tag name lists are `TBD — foundation-domain` (F-04 §9.7 has the enums, not the defaults).
- **Start from what is missing.** The Tags page shows a **"Missing for KPIs"** panel above the list when any
  work unit in the filter has a **required** bindable KPI slot (`KPI_FORMULA_SLOT.bindable = true` and `required = true`, F-07.1 §9.1 — optional slots such as `performance.speed_check` never appear, PO 2026-10-02) with no
  `WORK_UNIT_KPI_BINDING` **and** no tag on a machine placed there whose `tag_role` `KPI_PARAMETERS` marks
  legal for that slot. One row per work unit × slot, with **Declare**; the three Quality slots make **one** row ("needs two of Good / Total / Reject"). Each row starts with the **work center name**, because work unit codes such as `S01` repeat across lines. Derived on read; nothing stored.
- **Declare from a gap opens the form pre-filled.** Declare (above) and the KPI side panel's "Declare a tag"
  ([UX 07](07-kpi.md#kpi-page-cards-one-side-panel-per-kpi-po-decision-2026-09-28)) open the tag form with the
  machine and role filled in. When the slot allows more than one role, the role field lists only those.
- **Edit in one place.** Tags are created and edited only here. The asset detail shows a read-only **Tags**
  tab with a "Manage tags" link to this page filtered to the machine ([UX 04](04-asset.md)).
- **Future improvement, not built now — tag template per machine type.** Declaring the same signals on every
  machine of one `ASSET_TYPE` is repeated work. A template on the type, applied when a machine is placed, would
  cut that down. It needs a new entity, so it is logged as [F-04 A-16](../DOCS-EN/04-asset-ontology.md#98-open-questions),
  not designed here.

| Key | Where / state | Text | Stories |
|---|---|---|---|
| `dsr-002.filter.typed` | Filter toggle | "Typed addresses" (draft) | US-FND-DSR-001 |
| `dsr-002.missing.title` | "Missing for KPIs" panel heading | "Missing for KPIs" (draft) | US-FND-DSR-001, US-FND-KPI-007 |
| `dsr-002.missing.row` | One row in the panel | "\<work center\> · \<work unit\> · \<KPI\> needs a \<role\> tag" + button "Declare" (draft) | US-FND-DSR-001, US-FND-KPI-007 |
| `dsr-002.missing.row.quality` | The one Quality row per work unit | "\<work center\> · \<work unit\> · Quality needs two of Good / Total / Reject" + button "Declare" (draft, 2026-10-02) | US-FND-DSR-001, US-FND-KPI-007 |
| `dsr-002.missing.row.product-code` | Product-code gap (K-17) | "\<work center\> · \<work unit\> · Performance needs a Product Code tag, unless jobs are dispatched here" + button "Declare" (draft, 2026-10-02) | US-FND-DSR-001, US-FND-KPI-007 |
| `dsr-002.missing.none` | Panel hidden | N/A — no text: the panel is not shown | US-FND-DSR-001 |
| `dsr-002.form.address-preview` | Tag form, generated source, address preview label | "Address" (draft) | US-FND-DSR-001 |

## Screens

| SCR ID | Screen | Purpose | Entities (§9) | States worth noting | Stories |
|---|---|---|---|---|---|
| `SCR-FND-DSR-001` | Data sources (tags moved to `SCR-FND-DSR-002`, 2026-09-28 — the tag behavior in this row now applies there) | List the site's connections (name, protocol, address naming — generated or typed, short summary of connection settings); select one to see and edit its **Asset Tags list** (tag name, address, machine, signal role, how to read the value, unit or counting basis) with a **Test read** per tag showing the raw value. **Address (2026-09-25, F-04 §9.7.1):** the user types only the **tag name**; on a `generated` source the address is shown **read-only**, built from where the machine is placed; on a `manual` source (a machine's or vendor's own OPC UA server, or MQTT topics a device publishes itself) the address is typed as before. **Lane (2026-09-25, multi-lane machine, F-04 §9.6):** when the machine is placed on more than one work unit, the tag form shows a required **lane / work unit** picker limited to the machine's active placements; per-lane tags without a lane are flagged and not read. **Action — export tag hand-off list** per data source: the file Molca's hardware person uses to configure the OPC UA server (format open, F-04 A-11) | `DATA_SOURCE`, `ASSET_TAGS` | Credentials are **never** displayed, to any role (F-13 H-DS-2); "last seen" is a placeholder diagnostic only, never an alert, while H-DS-1 is open; Test read shows the **raw** value only (transformation gap, F-13); a tag's machine must sit in the connection's site — refused otherwise; machine not placed → no address shown (not a stale one), tag not read; address already used by another tag → refused; changing address naming or namespace on a source with tags → warns with the number of addresses that change | `US-FND-DSR-001` |
| `SCR-FND-DSR-002` | Tags (2026-09-28) | Every declared tag in the site, across data sources: create / edit / Test read (rules as in `SCR-FND-DSR-001` above) and **Export tag list** of the filtered rows. **Columns:** tag name · address · machine · work unit · role · data source · last read (`TBD`, H-DS-1). **Filters:** data source, work center, machine, "Never read", "No work unit". Search by tag name or address | `ASSET_TAGS` (read/write), `DATA_SOURCE` (read) | **Empty:** no tag declared → `dsr-002.empty`; filter matches nothing → `dsr-002.empty.filter`. **"Last read" / "Never read" is `TBD` — waits on H-DS-1** ([F-13](../DOCS-EN/13-data-source.md), whether `last_seen_at` exists per tag); until then the column and the "Never read" filter are not built. When it is, it is diagnostic only, never an alert. Unplaced machine → no address (not a stale one). Credentials never shown. Other states as `SCR-FND-DSR-001` | `US-FND-DSR-001` |

## Screen text

Rules T-1…T-4 in [00-ux.md](00-ux.md#screen-text--this-folder-is-the-source-po-decision-2026-09-25).
Source: PRD-003 `US-FND-DSR-001`. English for now (UX-0-1).

### SCR-FND-DSR-001 — Data sources & tags

| Key | Where / state | Text | Stories |
|---|---|---|---|
| `dsr-sidebar.group` | Sidebar group label | "Connections" | US-FND-DSR-001 |
| `dsr-sidebar.item` | Sidebar item | "Data sources" | US-FND-DSR-001 |
| `dsr-001.title` | Page title | "Data sources" (draft) | US-FND-DSR-001 |
| `dsr-001.summary` | Counts: data sources declared, tags that never read a value | "\<n\> data sources · \<m\> tags have never read a value" (draft) | US-FND-DSR-001 |
| `dsr-001.sources.columns` | Source list columns: name, protocol, connection settings summary, last seen | "Name" · "Protocol" · "Connection" · "Last seen" (draft) | US-FND-DSR-001 |
| `dsr-001.last-seen.note` | Marker that "last seen" is diagnostic only | "For checking only. It doesn't raise alerts." (draft) | US-FND-DSR-001 |
| `dsr-001.sources.naming` | Source form: address naming field (generated / typed) and its two options | Field "Tag addresses" · options "Build from location" / "Type each address" (draft) | US-FND-DSR-001 |
| `dsr-001.sources.namespace` | Source form: namespace URI field (OPC UA only) | "Namespace URI" (draft) | US-FND-DSR-001 |
| `dsr-001.sources.namespace.hint` | Under the namespace URI field on a new generated OPC UA source, pre-filled `urn:molca:<site code cleaned>` (F-13 §9.1, PO 2026-10-02, prd-molcadx#24 item 4) | "Filled in for this site. Change it only if the gateway uses another URI." (draft) | US-FND-DSR-001 |
| `dsr-001.sources.topic-root` | Source form: topic root field (MQTT, "Build from location" only), optional | "Topic root (optional)" (draft) | US-FND-DSR-001 |
| `dsr-001.sources.topic-root.hint` | Under the topic root field | "Leave empty if only Molca publishes to this broker. Fill it in if the broker is shared, for example with molca." (draft) | US-FND-DSR-001 |
| `dsr-001.tags.columns` | Tag list columns: tag name, address, machine, signal role, how to read the value, unit / counting basis | "Tag name" · "Address" · "Machine" · "Role" · "Value type" · "Unit / counted per" (draft) | US-FND-DSR-001 |
| `dsr-001.tags.field.tag-name` | Tag form: tag name field label | "Tag name" (draft) | US-FND-DSR-001 |
| `dsr-001.tags.address.generated-hint` | Under the read-only address on a generated source | "Built from where the machine is placed. It changes if the machine moves." (draft) | US-FND-DSR-001 |
| `dsr-001.tags.address.not-placed` | Address cell when the machine is not placed | "No address — machine not placed" (draft) | US-FND-DSR-001 |
| `dsr-001.error.tag-name-chars` | Under Tag name: character outside letters, digits, `_` | "Use only letters, numbers and _ in the tag name." (draft) | US-FND-DSR-001 |
| ~~`dsr-001.error.asset-tag-chars`~~ | ~~Save refused: the machine's tag has characters a generated address can't use~~ **Retired 2026-10-02** (PO, prd-molcadx#24 item 2): such characters are now replaced by `_` in the address, not refused (F-04 §9.7.1). Key not reused | — | US-FND-DSR-001 |
| `dsr-001.error.segment-clash` | Save refused: two siblings under one parent give the same address segment after cleaning (F-04 §9.7.1, PO 2026-10-02, prd-molcadx#24 item 2) | "\<code 1\> and \<code 2\> both become \<segment\> in the tag address. Change one of them." (draft) | US-FND-DSR-001 |
| `dsr-001.tags.address.cleaned-hint` | Under the read-only address when a code was cleaned | "Characters other than letters, numbers and _ are shown as _ in the address." (draft) | US-FND-DSR-001 |
| `dsr-001.error.address-taken` | Save refused: another tag already has this address | "\<tag name\> on \<machine\> already uses this address." (draft) | US-FND-DSR-001 |
| `dsr-001.confirm.address-change` | Confirm when changing address naming or namespace on a source with tags | "This changes \<count\> tag addresses. The hardware team will need a new tag list." (draft) | US-FND-DSR-001 |
| `dsr-001.tags.field.lane` | Tag form: work unit picker, shown only for a machine placed on more than one work unit | "Work unit" (draft) | US-FND-DSR-001 |
| `dsr-001.tags.lane-missing` | Flag on a per-lane tag with no work unit on a multi-lane machine | "No work unit — this tag isn't counted." (draft) | US-FND-DSR-001 |
| `dsr-001.action.export-handoff` | Export tag hand-off list button — on the Tags page `SCR-FND-DSR-002` since 2026-09-28 | "Export tag list" (draft) | US-FND-DSR-001 |
| `dsr-001.action.test-read` | Test read button | "Test read" | US-FND-DSR-001 |
| `dsr-001.test-read.waiting` | Test read in progress | "Reading…" (draft) | US-FND-DSR-001 |
| `dsr-001.default` | Default state | N/A — no text: the lists above | US-FND-DSR-001 |
| `dsr-001.empty` | Empty state — no data source yet, plus a note that automatic recording mode needs one | "No data sources yet." + "Automatic recording needs a data source to read machine signals." (draft) | US-FND-DSR-001 |
| `dsr-001.loading` | Loading state | N/A — no text: skeleton | US-FND-DSR-001 |
| `dsr-001.error.test-read` | Test read failed — the protocol's own message word for word, plus likely causes | `<protocol message>` + "Test read failed" (heading) + "Check the address, the connection settings, and that the server can be reached." (draft) | US-FND-DSR-001 |
| `dsr-001.error.site-mismatch` | Save refused: the tag's machine is not in the connection's site | "\<machine\> is at \<machine site\>, but this data source is at \<source site\>. Choose a data source at \<machine site\>." (draft) | US-FND-DSR-001 |
| `dsr-001.offline` | Offline state — PRD: "Unavailable" | "You're offline. Data sources needs a connection to load and save changes." (draft) | US-FND-DSR-001 |
| `dsr-001.success` | Tag saved, test-read raw value appears | N/A — no text: the saved row and the raw value | US-FND-DSR-001 |
| `dsr-001.no-permission` | No permission — read-only | "You can view data sources and tags but not change them. Ask your Plant Admin/IT for access." (draft) | US-FND-DSR-001 |
| `dsr-001.credentials.hidden` | Where credentials would be | "Hidden" (draft) | US-FND-DSR-001 |

### SCR-FND-DSR-002 — Tags

| Key | Where / state | Text | Stories |
|---|---|---|---|
| `dsr-sidebar.item.tags` | Sidebar item | "Tags" (draft) | US-FND-DSR-001 |
| `dsr-002.title` | Page title | "Tags" (draft) | US-FND-DSR-001 |
| `dsr-002.columns` | Tag list columns | "Tag name" · "Address" · "Machine" · "Work unit" · "Role" · "Data source" · "Last read" (draft) | US-FND-DSR-001 |
| `dsr-002.never-read` | Last read cell, tag never read a value — only if H-DS-1 gives a per-tag `last_seen_at` | "Never read" (draft) | US-FND-DSR-001 |
| `dsr-002.filter.never-read` | Filter toggle — same H-DS-1 condition | "Never read" (draft) | US-FND-DSR-001 |
| `dsr-002.filter.no-work-unit` | Filter toggle | "No work unit" (draft) | US-FND-DSR-001 |
| `dsr-002.empty` | No tag declared in the site | "No tags yet." + "Declare a tag for each machine signal the KPIs need." (draft) | US-FND-DSR-001 |
| `dsr-002.empty.filter` | Filter matches no tag | "No tags match these filters." (draft) | US-FND-DSR-001 |
| `dsr-002.export.scope` | Next to Export tag list | "Exports the \<n\> tags shown." (draft) | US-FND-DSR-001 |
| `dsr-001.sources.tag-count` | `SCR-FND-DSR-001`, tag count link per source | "\<n\> tags" (draft) | US-FND-DSR-001 |

## State notes

- Only part of the story waits on `US-FND-CFG-001` and the transformation gap: the interpreted value, the
  unknown-value case and scale / offset validation. Connections, tags with raw Test read, the generated address,
  namespace and topic rules, uniqueness, the "Missing for KPIs" panel and export do not
  ([F-13](../DOCS-EN/13-data-source.md), PO 2026-10-02, prd-molcadx#24 item 13).
- Any interpreted/transformed value (scale, offset, named state) is **not** shown until F-13's
  transformation gap is decided — Test read shows raw only.

## Open questions

| # | Question | Owner |
|---|---|---|
| ~~UX-DSR-1~~ | ~~Is the tag list a pane under the selected source (as the PRD describes), or also reachable from the machine's asset form in UX 04?~~ **Resolved 2026-09-28 (PO):** its own page, `SCR-FND-DSR-002` Tags, reachable from the Connections group, the asset form and the KPI side panel (see Tags page above). The PRD's 'pane under the source' wording is now out of date (`US-FND-DSR-001`) | — |
| UX-DSR-2 | ~~Where does the tag hand-off list export live — per data source only, or also per site / per work center?~~ **Where: resolved 2026-09-28 (PO)** — on the Tags page, exporting the filtered rows (per source, site or work center). **Still open:** file format (F-04 A-11) | Operations |
