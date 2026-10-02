# Tag Declaration — working draft (EN)

> **This is a working draft, not an official spec.** It captures a design conversation
> between the Product Owner and this assistant. Nothing here is committed until it's
> merged into [Integration](11-integration.md) — that merge still needs to happen, and the
> content may change in the process. Source discussion: this session, 2026-08-10.

**In short:** this draft decides how a PLC/SCADA tag gets declared against a physical
asset — FOUNDATION's job. It does not decide how a KPI gets calculated from
that tag — that stays with `production-domain`.

## What this is trying to solve

A machine can have a sensor (PLC/SCADA) feeding it live data. Before that data can feed
any KPI formula, MolcaDx needs to know: *which tag, attached to which asset, means what*.
That declaration is FOUNDATION's job. Calculating a KPI from that data is not — that stays
with `production-domain` / `04-metrics-framework.md`. See [`integration.md`](11-integration.md)
§3.2 for the existing tag-mapping concept this draft extends.

## Decisions made so far

| # | Question | Decision |
|---|----------|----------|
| 1 | Does a tag attach to the work unit or the physical asset? | **Asset.** A tag address (e.g. `PLC1.DB10.DBW4`) is wired into the machine's own controller — it's a property of the physical unit, not the position it happens to occupy. Swapping a machine always means re-mapping tags anyway, since the new machine has its own controller with its own addresses; attaching to work unit never actually avoided that work. **KPI continuity across a swap is handled separately** — see "Resolving a tag for a work unit" below, not by attaching the tag to the work unit itself. |
| 2 | One tag per asset, or many? | **Many.** A single machine can have a state/downtime tag, a production counter tag, and others — each feeding a different raw element. |
| 3 | Is the raw-element list fixed or open? | **Fixed**, following the ISO 22400 element set (e.g. `APT`, `ADOT`, `PQ`, `GQ` — see `DOCS/06-isa95-iso22400-standards.md` and the fuller catalog in the sister project's `002-iso22400-summary.md`). Open to adding elements later if a real need shows up — not open to inventing per-client names. |
| 5 | Does a tag mapping change over time? | **Yes — `valid_from`/`valid_to`**, same pattern as every other FOUNDATION entity (`foundation.md` §4.3). Closing an old mapping row and opening a new one, never editing in place, so historical KPI data still points at whatever tag was actually live at the time. |
| 6 | Who declares the mapping? | **The implementor**, self-service, at site setup — not engineering per client. This is load-bearing: Goals Q3 KR 2.1 commits to implementor-only site setup with no developer involvement. |
| 7 | What happens with no tag declared? | **That work unit simply doesn't get a KPI computed for the elements it has no tag for.** Not a zero, not an error — same "no data" treatment already used elsewhere (e.g. `oee-monitoring.md` §1.4). |
| 8 | Where does a unit-conversion rule (e.g. counter → seconds) live? | **Not on the tag mapping — resolved at calculation time.** A tag is flagged as "this is a count, needs duration conversion," but the actual multiplier is looked up live from **`OPERATION.cycle_time_value`** (see [Work Master §9.2](08-work-master.md#92-operation--one-step-of-a-routing-at-one-work-unit-with-its-standard)), valid for whatever product is running on that work unit at that `business_date`. Storing a fixed multiplier on the tag would go stale the moment the work unit switches to a product with a different cycle time — the same reasoning already applied to cycle time elsewhere (`oee-monitoring.md` §2.2 rule 1: "use the standard that was in force at the time"). **Correction 2026-08-12:** earlier drafts of this decision cited `OPERATION.standard_cycle_time`, which was wrong at the time — there was no `OPERATION` entity anywhere yet, and the field actually lived on Product's `PRODUCT_WORK_UNIT.cycle_time_value` instead. **Correction 2026-08-18:** that has now flipped back — `PRODUCT_WORK_UNIT` was retired and merged into a real, fully-specified `OPERATION` entity in Work Master (§9.2 there), which now legitimately carries `cycle_time_value`. This isn't a reversion to the 2026-08-12 mistake: that `OPERATION` was an undefined placeholder; this one is a specified table with its own field list, owned by Work Master. |

## Still open

| # | Question | Owner | Notes |
|---|----------|-------|-------|
| 4 | What happens when a tag's incoming data doesn't match its declared type (e.g. a state tag starts sending numbers)? | `engineering-domain` (once it exists) | This is a pipeline/ingestion question, not FOUNDATION's to answer. The user is already building real infrastructure adjacent to this (`oee-opcua-gateway` project, Telegraf as the collection agent) — validation logic likely belongs in that layer, translating raw signals into the shape FOUNDATION declares before anything reaches `ASSET_STATE_LOG`. |
| — | Reliability tier for `source = derived` data (the counter-conversion case) | `product-owner` | Already captured as **OEE-7** in `DOMAINS/PRODUCTION/DOCS/03-performance.md` §9 — converting a counter to duration blends Availability loss and Performance loss together, so derived data may need a lower-confidence marker than `plc`/`manual` sources. |

## Sketch of the entity shape (illustrative, not final)

```
ASSET_TAGS
├── asset_id            FK → ASSET
├── tag_ref              the external tag/address (e.g. PLC1.DB10.DBW4, OPC UA node id)
├── raw_element          enum, fixed list (state | counter | measurement | ...)
├── needs_conversion     boolean — true for counter-type tags that need a duration derived from them
├── source                plc | manual | derived  (matches ASSET_STATE_LOG.source)
├── valid_from / valid_to
```

This is deliberately incomplete — it's meant to show the shape of the decisions above,
not to be copied into `integration.md` as-is. `foundation-domain` should own the final
field list, naming, and placement (`integration.md` vs. a new module) when this gets
formalized.

## Resolving a tag for a work unit (KPI continuity across an asset swap)

A KPI trend line is drawn against a **work unit** (the stable rollup point — see
`site-hierarchy.md`), not against whichever machine happens to occupy it today. So when a
formula needs "the tag for this work unit," it resolves in two hops, at read/calculation
time — it is never stored as a direct edge:

```
WORK_UNIT → ASSET_PLACEMENT (active row) → ASSET → ASSET_TAGS
```

This means swapping a machine doesn't corrupt the work unit's history: old readings stay
attributed to the old `ASSET_PLACEMENT` row and the old asset's tags; new readings
resolve through the new placement to the new asset's tags. Nothing needs to be
re-pointed on the work unit itself — the join just picks up whichever placement is active
`as of` a given timestamp.

## Next step

Open question #4 (validation of mismatched tag data) needs `engineering-domain` input once
that domain exists. Until then, this draft stays unmerged — don't treat the entity sketch
above as buildable.
