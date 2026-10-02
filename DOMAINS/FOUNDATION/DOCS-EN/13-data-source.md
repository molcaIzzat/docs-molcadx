# F-13 — Data Source

> Working spec. Entity spec status: 🟠 NEW — first version, 2026-09-03. Split out of
> [Integration](11-integration.md) by PO decision B7 (contest review). Minimal spec: this
> module exists to give `ASSET_TAGS.data_source_id` ([Equipment Taxonomy §9.7](04-asset-ontology.md#97-asset_tags--per-asset-tag--signal-declaration))
> a real entity to point at, not a full acquisition-architecture design.

**In short:** `DATA_SOURCE` is one PLC/OPC UA server/MQTT broker connection — the thing a
tag address (`PLC1.DB10.DBW4`) is read *through*. It is deliberately **not** the same
concept as [Integration](11-integration.md)'s ERP connectivity: different protocol family,
different volume, different failure mode, different owner of the resulting entities. Before
this module existed, `ASSET_TAGS.data_source_id` (Equipment Taxonomy §9.7) was a required
foreign key pointing at an entity with **zero fields defined anywhere** — this file closes
that gap (B7).

## What this module is for

It answers one question: **"which physical connection is this sensor tag actually read
through, and is that connection still alive?"** Every `ASSET_TAGS` row (Equipment Taxonomy
§9.7) declares a tag address, but an address on its own doesn't say *where* to dial in —
which PLC, which OPC UA server, which MQTT broker, with what credentials, on what network.
`DATA_SOURCE` is that connection record, one row per physical/logical endpoint, shared by
every tag read through it.

**What it is not for:** this module does not define ERP or peer-system connectivity — that
stays [Integration](11-integration.md)'s job (B7 explicitly keeps the two separate: same
"connects to something outside MolcaDx" instinct, but the protocols, volumes, and entity
shapes have nothing in common). It also does not store tag readings themselves — that's
downstream, in whichever entity the reading's `tag_role` lands on (e.g. `ASSET_STATE_LOG`
for a `downtime_reason`-role tag, owned by PRODUCTION since 2026-09-28 — [decision 2026-09-28](../../../LOGS/decisions/2026-09-28-asset-status-ownership.md),
[Equipment Taxonomy](04-asset-ontology.md) A-5).

## Why it matters — what goes wrong without it

| If you skip this | What happens |
|---|---|
| Tag declarations have nowhere to point for "which connection" | `ASSET_TAGS.data_source_id` is either dropped (losing real information: two tags on the same broker share a lot of operational context) or left as an unmodeled FK (the exact B7 blocker this module fixes) |
| No connection-level heartbeat | A dead PLC connection looks identical to "nothing changed" in an event-driven/listener model — silence never gets flagged, and downtime goes unnoticed until someone manually checks |
| Connection details scattered per-tag | Rotating a broker's credentials, or diagnosing "why did every tag on Line 3 go stale at once," becomes a per-tag hunt instead of one row's history |

## Core concepts

**1. One `DATA_SOURCE` row = one connection endpoint, many tags share it.** A single PLC or
MQTT broker typically serves many `ASSET_TAGS` rows across many assets. `DATA_SOURCE` is
declared once per endpoint; `ASSET_TAGS.data_source_id` (Equipment Taxonomy §9.7) is the
many-to-one link.

**2. Protocol shapes the connection, not the tag.** MQTT (topic-based pub/sub) and OPC UA
(node-based subscription) are structurally different — the endpoint's `protocol` field
determines what `connection_config` needs to contain (broker URL + topic prefix for MQTT;
server endpoint for OPC UA). This module does not standardize the two into one
shape; it declares which protocol a given connection uses and lets the config payload vary
accordingly. **Since 2026-09-25 the OPC UA namespace is its own field (`namespace_uri`, §9.1), not
part of `connection_config`**, because generated tag addresses are built from it (core concept below).

**2a. Who names the tag address: `node_naming` (PO decision 2026-09-25).** A connection
either lets MolcaDx **generate** each tag's address from the hierarchy (`generated` — OPC UA
`nsu=<namespace_uri>;s=<SITE>/<AREA>/<WC>/<WU>/<ASSET>/<tag_name>` (slash separator since 2026-10-01), or, since 2026-09-28, MQTT
`[<topic_root>/]<SITE>/<AREA>/<WC>/<WU>/<ASSET>/<tag_name>` (topic root optional), [Equipment Taxonomy §9.7.1](04-asset-ontology.md#971-generated-opc-ua-node-address)),
or takes a hand-typed address per tag (`manual` — a machine's or vendor's own OPC UA server with
fixed node names, or MQTT topics a device publishes in its own structure). Under `generated`, each
segment is the code **cleaned**: any character that is not a letter, digit or `_` becomes `_`, so real
codes such as `FI-2` or `ANRITSU 57-1` give `FI_2` and `ANRITSU_57_1`; two siblings that clean to the
same segment are refused (PO, 2026-10-02, prd-molcadx#24 item 2). Under `generated`, Molca owns the OPC UA side: MolcaDx produces a
**tag hand-off list** and Molca's hardware person configures the gateway/server to expose exactly
those NodeIds. See the [decision](../../../LOGS/decisions/2026-09-25-generated-opcua-tag-nodes.md).

**3. Event-driven, not polling — inherited from Integration's prior analysis.** Both MQTT
(native pub/sub) and OPC UA (subscription with server-side keep-alive) support
listener/subscription delivery directly, not a workaround. This was decided before the B7
split and still holds; it's restated here because it's this module's concern now, not
Integration's.

**4. Heartbeat/staleness detection is a connection-level concern — but the granularity is
still genuinely open, do not assume an answer (H-DS-1 below).** Silence in a pure listener
model doesn't distinguish "nothing changed" from "connection died." A prior draft of this
material (before the B7 split) claimed this was "resolved: connection-level, not per-tag" —
that claim is **withdrawn as part of this session's blocker cleanup** (the same pattern as
A-5/B1: a "resolved" stamp that was never actually backed by a written decision). The
reasoning for connection-level heartbeat is plausible (neither MQTT LWT nor OPC UA
subscription keep-alive can answer "is this one specific tag still alive," only "is this
connection still alive," and a per-tag interval would false-positive on legitimately
long-silent tags like `downtime_reason`) — but plausible is not the same as decided. See
H-DS-1.

**5. Delivery reliability for `delta_counter`-role tags is a known, accepted gap, not
blocking.** A dropped `delta_counter` event (Equipment Taxonomy §9.7's `kind` enum) is
permanently lost, unlike `cumulative_counter`, which self-corrects on the next reading. MQTT
QoS 1/2 would close this if it becomes a real problem; not designed further here.

## How the entities connect

```
DATA_SOURCE  (one connection: PLC / OPC UA server / MQTT broker)      [§9.1]
  → ASSET_TAGS.data_source_id  (many tags per connection)             [Equipment Taxonomy §9.7]
       → ASSET  (Equipment-unit level only, same restriction as ASSET_PLACEMENT)
```

`DATA_SOURCE` carries a `site_id` FK into Site Hierarchy (§9.1, resolved H-DS-4,
2026-09-04) — it is also referenced *from* `ASSET_TAGS`, but that FK no longer points at
nothing. A single `DATA_SOURCE` can still serve tags belonging to assets across more than
one `WORK_UNIT` (e.g. one PLC driving several stations on the same line), so it does not
inherit a `work_unit`-level scope the way `ASSET_TAGS` does from `ASSET` — but it is
physically wired into exactly one `SITE`, so it does inherit that level.

## Common pitfalls

1. **Assuming heartbeat granularity is settled.** It isn't (H-DS-1) — don't build staleness
   alerting against an assumed per-connection or per-tag model without confirming which one
   this module actually specifies once H-DS-1 resolves.
2. **Merging this back into Integration.** The two were split for a reason (B7) — different
   protocol family, different volume, different entity shape. Re-merging loses that clarity.
3. **Storing tag readings on `DATA_SOURCE`.** This entity is the connection, not the data
   stream. Readings land wherever the consuming domain records them (e.g.
   `ASSET_STATE_LOG`), never here.
4. **Treating `connection_config` as a fixed shape across protocols.** MQTT and OPC UA need
   different fields inside it (core concept 2) — don't force one schema onto both.

## Standards this module draws on

| Standard | Relevance |
|---|---|
| **MQTT (OASIS)** | Pub/sub messaging, Last-Will-and-Testament for connection-liveness signaling |
| **OPC UA (IEC 62541)** | Node-based industrial data access, subscription/keep-alive model |
| **ISA-95 / IEC 62264** | Level 2/1 (control & devices) as the layer this module reaches down into |

## Related modules

| Module | Relationship |
|---|---|
| [UX 13 — Data source screens](../UX/13-data-source.md) | Declares `SCR-FND-DSR-001` (data sources + their `ASSET_TAGS`), in its own sidebar group **Connections**, not Reference data (PO, 2026-09-25) |
| [Equipment Taxonomy](04-asset-ontology.md) | `ASSET_TAGS.data_source_id` (§9.7) FKs into this module's `DATA_SOURCE` (§9.1). This is the FK B7 was raised against |
| [Integration](11-integration.md) | Sibling module, ERP/peer-system side. Split from this module 2026-09-03 (B7) — the two do not share a mechanism |
| Shopfloor (`production-domain`) | Consumes readings acquired through a `DATA_SOURCE`-declared connection; this module does not store the readings themselves |

## What's still unknown

| # | Question | Who needs to answer it |
|---|---|---|
| H-DS-1 | **Heartbeat/staleness granularity: connection-level or per-tag?** Explicitly reopened by decision B7 (2026-09-03) — a prior claim that this was "resolved: connection-level" is withdrawn, it was never backed by a written decision. Connection-level is the more defensible default (protocols only expose connection liveness natively, and per-tag would false-positive on legitimately silent tags), but this module does not assume it. **Do not build staleness alerting against either answer until this resolves.** | `foundation-domain` + `production-domain` (Integration/Shopfloor consumers) |
| H-DS-2 | Exact `connection_config` shape per protocol (MQTT vs OPC UA) — what fields are actually required, how credentials are stored securely (not plaintext, per Integration's security principle), is `TBD` | `foundation-domain` + `engineering-domain` |
| H-DS-3 | Does a `DATA_SOURCE` need its own lifecycle status (active/disabled) independent of `valid_from`/`valid_to`, e.g. to temporarily pause acquisition without deactivating the row's identity? `TBD` | `foundation-domain` |
| H-DS-5 | ~~**Namespace URI format** (§9.1 `namespace_uri`): what URI does Molca's hardware person set on each OPC UA server (e.g. one per site, one per tenant)?~~ **Format resolved (PO, 2026-10-02, prd-molcadx#24 item 4):** default one per site, `urn:molca:<SITE>` (cleaned site code), pre-filled and editable per gateway (§9.1). **Still open:** must a `namespace_uri` be unique per tenant (or may two sites' gateways share one)? `TBD — needs PO/Operations confirmation` | PO / Operations |
| H-DS-6 | **Who may export the tag hand-off list** ([Equipment Taxonomy §9.7.1](04-asset-ontology.md#971-generated-opc-ua-node-address) rule 6)? The list is setup data without credentials; is it covered by `foundation:dsr:site:view`, or does it need its own action in the permission catalog? `TBD — needs PO confirmation` | PO |
| H-DS-7 | **MQTT topic root, when used** (§9.1 `topic_root`, optional, PO 2026-09-28): one value per tenant, per environment (test/production), or per broker? Any naming rule? `TBD — needs PO/Operations confirmation` | PO / Operations |
| ~~H-DS-4~~ | ~~Is tenant-wide scope (no `site_id`/`enterprise_id` FK at all) actually correct, or should `DATA_SOURCE` carry a `site_id` (or `enterprise_id`) FK?~~ **Resolved by PO decision, 2026-09-04: `DATA_SOURCE` carries a required `site_id` FK into Site Hierarchy (§9.1).** A PLC/OPC UA server/MQTT broker is physically tied to one site — it does not float across a tenant's unrelated enterprises/sites the way a fully tenant-global lookup (e.g. `DOWNTIME_REASON`) does. The "serves tags across more than one `WORK_UNIT`" reasoning still rules out `work_unit`-level scoping (sharing within a site is expected), but not `site`-level — a `DATA_SOURCE` cannot be shared *across* sites. ABAC scope narrowed from `tenant` to `site` accordingly ([00-1-authorization-permissions.md](00-1-authorization-permissions.md#data-source-dsr--13-data-sourcemd-9)). | — |

## 9. Entity specification

> 🟠 NEW — minimal spec, first pass. Fields beyond identity/protocol/heartbeat are
> intentionally not filled in until H-DS-2 answers the connection-config shape question.

### 9.1 `DATA_SOURCE` — one connection/endpoint

| Field | Type | Required | Notes |
|---|---|---|---|
| `data_source_id` | internal ID | Yes | Permanent, never reused |
| `site_id` | FK → `SITE` ([Site Hierarchy §9.3](01-site-hierarchy.md#93-site--physical-factory-location-the-main-dataaccesstime-boundary)) | Yes | **Added 2026-09-04, resolves H-DS-4.** A PLC/OPC UA server/MQTT broker is physically wired into one site; it cannot be shared across sites. Does not narrow to `area`/`work_center`/`work_unit` — a single connection can still serve tags across more than one `WORK_UNIT` within that site |
| `name` | string | Yes | Human-readable label, e.g. "Line 3 PLC" — what an admin picks from a list when declaring an `ASSET_TAGS` row |
| `protocol` | enum | Yes | `mqtt` / `opcua` / other, `TBD` if more protocols are needed. Determines the shape of `connection_config` (core concept 2) |
| `node_naming` | enum | Yes | **Added 2026-09-25.** `generated` / `manual`. `generated` is allowed when `protocol = opcua` or (since 2026-09-28) `protocol = mqtt`: every tag on this source gets its address from the hierarchy ([Equipment Taxonomy §9.7.1](04-asset-ontology.md#971-generated-opc-ua-node-address)) and `ASSET_TAGS.node` stays empty. `manual`: each tag's `ASSET_TAGS.node` is typed by hand. Changing it on a source with active tags changes every tag's address (§9.7.1 rule 7). **Default (PO, 2026-09-28):** `generated` for a new `opcua` or `mqtt` source; `manual` is kept for OPC UA servers whose node names Molca can't set (a machine's or vendor's own server) and for MQTT topics a device publishes in its own structure, or several signals in one message |
| `namespace_uri` | string | Conditional | **Added 2026-09-25.** OPC UA only. The server namespace **URI** used in generated addresses (`nsu=…`). Required when `protocol = opcua` and `node_naming = generated`; optional for a `manual` OPC UA source; empty for `mqtt` (a generated MQTT source uses the optional `topic_root` instead). The URI is stored, never the numeric namespace index (`ns=`), because the index can change when the server restarts. **Default (PO, 2026-10-02, prd-molcadx#24 item 4):** one URI per site, `urn:molca:<SITE>`, where `<SITE>` is the site code cleaned the same way as an address segment (`FI-2` → `urn:molca:FI_2`). The form pre-fills it for a new generated OPC UA source; the user may change it per gateway. So a gateway with no known namespace URI can still be used. Gateways of one site share the default; [§9.7.1 rule 3](04-asset-ontology.md#971-generated-opc-ua-node-address) keeps their addresses unique. Must it be unique per tenant: H-DS-5 |
| `topic_root` | string | Conditional | **Added 2026-09-28 (PO).** MQTT only. **Optional** (PO, 2026-09-28). A prefix in front of generated topics (e.g. `molca`). Empty → the topic starts at the site segment (`JKT1/AS/…`), fine for a broker used only by Molca's gateway. Filled → for a broker shared with other systems, or test and production on one broker. Allowed only when `protocol = mqtt` and `node_naming = generated`; empty otherwise. Same character rule as the other segments. Format when used: `TBD` (H-DS-7) |
| `connection_config` | key-value | Yes | Protocol-specific connection details (broker URL for MQTT; server endpoint for OPC UA — the namespace moved to `namespace_uri` above, 2026-09-25, and the MQTT topic root to `topic_root`, 2026-09-28). Exact required sub-fields are `TBD`, see H-DS-2. Credentials must not be stored in plaintext — mechanism `TBD`, same open item |
| `heartbeat_interval` / `last_seen_at` | numeric / timestamp | No | **Granularity `TBD` — see H-DS-1.** Whether this pair lives only on `DATA_SOURCE` (connection-level) or needs a parallel per-tag shape is not decided. Placeholder fields, not a committed schema |
| `valid_from`, `valid_to` | date | Yes | Deactivate, never hard-delete (§00 shared rule) |

**Keys** (F-00 [keys rule](00-foundation.md#keys-and-constraints-on-every-table-po-2026-10-01)): PK `data_source_id` · Unique: — (whether `namespace_uri` is unique per tenant: H-DS-5) · No overlap: —

**Deliberately not yet specified:** any field implying a resolved answer to H-DS-1 (e.g. a
committed `last_seen_at` *per tag*) or H-DS-2 (a fixed `connection_config` sub-schema). Adding
those now would repeat the exact mistake this module was created to fix — a field that reads
as settled when it isn't.

**Validation rule — no cross-site sharing (resolves H-DS-4).** Every `ASSET_TAGS` row
([Equipment Taxonomy §9.7](04-asset-ontology.md#97-asset_tags--per-asset-tag--signal-declaration))
pointing at a given `data_source_id` must belong to an `ASSET` whose current site (via
`ASSET_PLACEMENT` → `WORK_UNIT` → ... → `SITE`) matches that `DATA_SOURCE.site_id`. A
`DATA_SOURCE` may serve many `ASSET_TAGS` across many `WORK_UNIT`s and `WORK_CENTER`s, but
never across more than one `SITE`. Declaring an `ASSET_TAGS` row against a `DATA_SOURCE` in a
different site than the asset's own site must be rejected at save time.

## What depends on Configuration Service and the transformation gap (PO, 2026-10-02, prd-molcadx#24 item 13)

`US-FND-DSR-001` was marked blocked as a whole on `US-FND-CFG-001` (Configuration Service, [F-12](12-configuration-service.md))
and on the transformation gap (no `scale` / `offset` / interpretation field on `DATA_SOURCE` or `ASSET_TAGS`). Only a
small part actually waits on them.

| Waits on CFG-001 and the transformation gap | Does not wait |
|---|---|
| The **interpreted** value: Test read showing a converted value or a named state next to the raw one | Connections: create, edit, deactivate data sources (§9.1) |
| What to do with a value that has **no interpretation** (unknown state code) | Tag declaration, with Test read showing the **raw** value |
| Validation of a `scale` / `offset` that does not exist yet | The generated address ([§9.7.1](04-asset-ontology.md#971-generated-opc-ua-node-address)), segment cleaning, namespace and topic rules (§9.1) |
| | Uniqueness: of the address on the server, `(asset_id, tag_name)`, the one-site rule (§9.1) |
| | The "Missing for KPIs" panel ([UX 13](../UX/13-data-source.md)) |
| | Export of the tag hand-off list (§9.7.1 rule 6) |

The right-hand column can be built now. Which of the left-hand items need CFG-001 itself, and which need only an
answer to the transformation gap, is `TBD — perlu konfirmasi PO`: if the answer is "raw units always, no scale or
offset", is the CFG-001 dependency dropped from this story?

## Next step

H-DS-1 (heartbeat granularity) is the question every downstream staleness/monitoring screen
depends on — resolve it before building connection-health UI. H-DS-2 (connection-config
shape) blocks `engineering-domain` from starting schema/API work. Neither blocks
`ASSET_TAGS.data_source_id` from existing as a real FK today (§9.1 above gives it an entity
to point at) — that part of B7 is closed. H-DS-4 (site scope) is now resolved (§9.1,
2026-09-04) — `DATA_SOURCE.site_id` is required and cross-site sharing is disallowed.
