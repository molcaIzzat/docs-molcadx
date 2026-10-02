# 2026-09-25 — Tag node addresses are generated from the hierarchy (OPC UA)

> **2026-10-01:** the string identifier now separates segments with `/`, not `.`. The formula in this note is the decision as made on 2026-09-25. The current shape is [F-04 §9.7.1](../../DOMAINS/FOUNDATION/DOCS-EN/04-asset-ontology.md#971-generated-opc-ua-node-address).

- **Decided by:** Product Owner
- **Domain:** FOUNDATION (F-04 Equipment Taxonomy §9.7, F-13 Data Source §9.1, F-01 Site Hierarchy)
- **Partly reverses:** F-01 S-4 ("codes are internal only") — codes stay not floor-facing, but are
  now part of machine addresses

## Decision

Until now `ASSET_TAGS.node` was a hand-typed address (`PLC1.DB10.DBW4`). From now on:

1. The user declares only the tag: new field `ASSET_TAGS.tag_name` (e.g. `Total_Count`) plus the
   existing role/kind/uom/count_basis.
2. For OPC UA data sources with `node_naming = generated`, the NodeId is **generated** from where the
   asset is placed:

   ```
   nsu=<DATA_SOURCE.namespace_uri>;s=<site_code>.<area_code>.<work_center_code>.<work_unit_code>.<asset_tag>.<tag_name>
   ```

   e.g. `…;s=JKT1.AS.L01.S01.PCK01.Total_Count` and `…;s=JKT1.AS.L01.S02.PCK02.Total_Count`.
3. Molca owns the OPC UA side. MolcaDx produces a **tag hand-off list** per data source; Molca's
   hardware person configures the gateway/OPC UA server to expose exactly those NodeIds. The
   generated address is the source of truth; the server is configured to match it.
4. `DATA_SOURCE` gets `node_naming` (`generated` / `manual`) and `namespace_uri` (OPC UA only).
   `manual` keeps the old behaviour (hand-typed `node`) — always for MQTT.

## Basis

| | Fixed by a standard | Molca convention |
|---|---|---|
| NodeId = namespace + identifier type + value | IEC 62541-3 | — |
| `nsu=…;s=…` text form | IEC 62541 string encoding of an expanded NodeId | — |
| Namespace **URI** stored, not the `ns=` index | — (the index is the URI's position in the server's namespace array, and can change on restart) | Chosen for stability |
| Dotted path `SITE.AREA.WC.WU.ASSET.tag_name` | Not required by IEC 62541 or ISA-95 | Yes — order follows the ISA-95 levels F-01 already uses |

## Design choices made by `foundation-domain`

| Point | Choice | Why |
|---|---|---|
| Store the generated node per placement period, or compute it? | **Compute on read** (`generated_node` is derived, read-only, like `ASSET.site_id`) | A stored copy is a second source of truth that can drift from the codes it was built from — the B6 problem. Placements are effective-dated and code changes are in the Audit Trail, so a past address is recoverable. What the hardware side was actually given is the hand-off list |
| Per-level segment codes: new field, or change the `*_code` patterns? | **Change the suggested patterns** — `JKT1`, `AS`, `L01`, `S03` (was `JKT1-AS`, `JKT1-AS-L01`, `JKT1-AS-L01-S03`) | Only a *suggested* pattern changes; field meaning, type and uniqueness scope stay. Uniqueness already fits: area within site, work center within site, work unit within work center. A second code field would give every node two codes to keep in step |
| Charset | Letters, digits, `_` on every hierarchy code save; on `asset_tag` only when a tag is saved against a generated source | Hierarchy codes are internal, so the rule costs nothing. `asset_tag` is printed on the machine, so existing floor tags are not forced to change unless generated naming is used |
| Path starts at | Site | A `DATA_SOURCE` belongs to one site; a NodeId is resolved only against its own server and namespace URI. A save-time uniqueness check (same `namespace_uri` → no duplicate `generated_node`) covers two sources sharing one URI |
| Renaming a code that is in a live address | Warn with the count of changed addresses, confirm, then a new hand-off list | Blocking would make fixing a typo impossible. Open for PO: A-14 |
| Asset with no active placement | No address, tags not acquirable | Same as the existing rule "declaration before placement, acquisition needs a placement" |

## Consequences

- **Specs:** F-04 §9.7 (`tag_name`, `node` now conditional, `generated_node`) + new §9.7.1; open A-11…A-14.
  F-13 §9.1 (`node_naming`, `namespace_uri`; namespace leaves `connection_config`); open H-DS-5, H-DS-6.
  F-01 §9.3–§9.6 patterns + S-4 notes. F-00 business-code table (asset tag pattern `IM003`).
  F-07.1 one-line note (readings by `tag_id`, address from placement).
- **UX / FLOW:** `SCR-FND-DSR-001` (tag name typed, address read-only, export action, new text rows);
  `SCR-FND-SIT-001` code hint + charset error + rename confirm; `UX/04` state note; FLOW-01 code
  example; FLOW-02 hand-off step.
- **Glossary:** Tag name, Generated node, Tag hand-off list.
- **PRD-003:** not synced in this session (no PRD sync requested). Affected: `US-FND-DSR-001`,
  `US-FND-SIT-001` (code hint/validation), `US-FND-AST-002` (tag declaration).

## Follow-up decision (same day): multi-lane machine

- **Decided by:** Product Owner. One machine may be placed on **two or more work units at once** — the
  multi-lane case, one counter set per lane (`Lane1_Total_Count`, `Lane2_Total_Count`).

| Point | Choice | Why |
|---|---|---|
| Placement rule (F-04 §9.6) | An asset has exactly one active placement, except a multi-lane machine: several, all in one site, created only by an explicit "add a lane" at placement time. No flag on `ASSET` | Closes the gap (the old rule only stopped the same asset twice on the *same* work unit). The explicit choice stops a forgotten move from looking like a lane. One site keeps `ASSET.site_id` single and the Data Source one-site rule intact |
| How a tag is assigned to a lane | New `ASSET_TAGS.work_unit_id` (FK → `WORK_UNIT`), required when the asset has more than one active placement, validated against active placements | Not an FK to `ASSET_PLACEMENT`: placement rows are closed and reopened on swap/correction, so the FK would point at a closed row while the lane (the work unit) is unchanged. An unassigned per-lane tag is not read and is flagged — never counted in every lane |
| Machine-wide signals (`machine_state`, `downtime_reason`, `runtime`) | Apply to **every** lane; each lane's Availability is its own (not summed). **One** generated address, under the work unit in the tag's `work_unit_id` | A stop of the machine body stops every lane. Aliasing the register under each lane would give one `tag_id` several addresses and read one register several times. Open for PO/ops: A-15 |
| Primary/secondary | The machine may be `primary` on each of its work units (each lane has its own Availability). Existing rules stay per work unit: one active `primary` per work unit, same asset at most once per work unit | Consistent with F-07.1: KPI binding validation now also requires a per-lane tag's `work_unit_id` to equal the bound work unit; machine-wide tags may be bound on any lane |
| Access scope (F-00.1) | Tag scope = the tag's `work_unit_id`. Asset `view`: scope on any of its work units; `update`/`deactivate`: on all | An asset edit reaches every lane |

Addresses: `JKT1.AS.L01.S01.PCK01.Lane1_Total_Count`, `JKT1.AS.L01.S02.PCK01.Lane2_Total_Count`.
Changed in the same session: F-04 §9.4/§9.6/§9.7/§9.7.1 (rules 5, 8, 9; A-15), F-07.1 (where tags live, primary/secondary, step 0,
binding validation), F-00.1 AST rows, UX 04 / UX 13 notes and 2 text rows, FLOW-02 implication row, glossary
"Multi-lane machine".

## Still open

- A-11 hand-off list format; whether a tag needs a "configured by hardware" status.
- A-12 tags of an unplaced asset (confirm "no address, not acquired").
- A-13 `asset_tag` as the asset segment vs. a separate segment code (floor tags may contain `-`).
- A-14 warn vs. block on renaming a code in a live address.
- H-DS-5 namespace URI format; H-DS-6 who may export the hand-off list.
- A-15 machine-wide signals on a multi-lane machine: one address (default) vs gateway alias per lane.
