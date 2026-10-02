# Handoff — MolcaDx FOUNDATION contest review → PO decisions & PRD-001 sync

## Repo & context

- Repo: `/home/isa_bot/app/molca/product/docs-molcadx` (docs-only repo, pre-implementation).
- Read `AGENTS.md` at repo root first — it is the working contract (PRD format §4, work rules §5 incl. **rule 1b PRD sync obligation**, changelog rule 3).
- Role being played: **Product Owner**. The user asked me to read the FOUNDATION implementation specs and contest them as PO.
- FOUNDATION specs live in `DOMAINS/FOUNDATION/DOCS-EN/` (F-00 map + 14 module files). PRDs live in `DOCS/prd/` (PRD-001 v0.2 is the declared single reference; PRD-003 v0.1 overlaps 48 stories and already contains several corrected versions).

## What happened this session

1. Ran a web-research test (OEE/ISO 22400-2) — confirmed `Availability = APT / PBT` matches PRD-001 v0.2's correction.
2. Ran a 5-lane parallel adversarial review of all FOUNDATION specs (subagent reviewers, read-only). **All 5 lanes returned verdict: BLOCK.**
3. Delivered the consolidated PO Contest Report in chat (2026-09-03). Key content below — the full findings live in the reviewer output artifacts, not duplicated elsewhere yet:
   - `/home/isa_bot/.pi/agent/sessions/--home-isa_bot-app-molca-product-docs-molcadx--/subagent-artifacts/dfc09ed4-2b1a-4419-8f0d-b37ea6920040_reviewer_0_output.md` — time-structure (site hierarchy, shift, fiscal year): 14 findings
   - `.../5c950ab3-b990-435c-976c-6345f08d0164_reviewer_0_output.md` — product-kpi: 20 findings, merge verdict BLOCK on 5 HIGH items
   - `.../62a90d8d-9707-4e64-b4c7-3976a37d0ac3_reviewer_0_output.md` — work-master: 13 findings incl. 2 BLOCKERs
   - `.../82c830b5-ffaa-4364-8b85-205d769535c3_reviewer_0_output.md` — prd-sync (rule-1b audit PRD-001/003 vs DOCS-EN): 18 findings, verdict BLOCK
   - Asset-ontology lane (retried after a provider stream failure; run id `295696e6-4223-4c88-ad32-b99b68b78424`): returned 3 BLOCKERs + 6 HIGH — full text is in the conversation (background-task completion message), artifact path if needed: `1f26a26e-...` was the failed first attempt (partial). Check the session's subagent-artifacts dir for the retry's output file.

## The 7 blockers (agreed summary — details in artifacts)

- **B1** `SHIFT_INSTANCE` generation unowned yet module marked ACTIVE (F-02, H-6).
- **B2** `WORK_ORDER_OPERATION` has no `defect_code_id` FK / row grain → scrap reasons unstoreable (F-08 §9.6).
- **B3** "Routing locked at release" has no snapshot mechanics → mid-WO operation-version changes unresolvable (F-08).
- **B4** W-1 (ERP vs MolcaDx as WO source) open; drafted `WORK_ORDER` entity fails under either answer.
- **B5** A-5 marked "resolved" citing an `ASSET_STATE_LOG` dual-recording schema that exists nowhere; ownership contradicts across F-00/F-04/F-05 (P-4). OEE Availability declared "Ready" on an unspec'd table.
- **B6** `ASSET` has two contradicting position fields: inline `work_unit_id`/`site_id` vs `ASSET_PLACEMENT` history; ABAC scope keys on the unmaintained inline field.
- **B7** `ASSET_TAGS.data_source_id` is a required FK to `DATA_SOURCE` — an entity with zero fields (Integration module unmodeled). Also heartbeat-per-connection blinds single dead tags.

Pattern to preserve in decisions: **the spec certifies things as "resolved" whose foundations don't exist** (A-5, APT "Ready", Shift "ACTIVE", "locked at release"). Revert false resolved-stamps.

## Next steps (proposed order — decisions before sync)

1. **Draft PO decision entries** for `LOGS/decisions/` (I recommended this first; user had not yet chosen). Six decisions needed:
   - W-1: WORK_ORDER source — ERP or MolcaDx
   - W-5: does repaired rework count as good output (Quality numerator)
   - small_stop → Availability or Performance loss
   - `WORK_CENTER.is_oee_tracked` — add field to F-01 §9.5 or redefine OEE gating
   - `ASSET_STATE_LOG` ownership (FOUNDATION vs production-domain) + where its §9 lives
   - Heartbeat granularity: connection-level vs per-tag
   Also: revert A-5→open, Shift ACTIVE→DRAFT, F-07 APT "Ready"→qualified; ops question whether any site skips shifts on certain days (no-rotation assumption).
2. **foundation-domain work package:** B2/B3/B6/B7 entity fixes; timestamp-granular effective dating for placement/tags/product-codes/components; `DATA_SOURCE` minimal spec; product-code changeover constraint fix (current rule rejects scheduling a future switch); `small_stop` state/enum alignment; reason-picker source rule for per-WORK_UNIT logging.
3. **PRD-001 rule-1b sync** (mostly mechanical — copy PRD-003's corrected text back): `is_oee_tracked` stories, KPI entity layer rewrite (KPI_FORMULA_SLOT/KPI_PARAMETERS/WORK_UNIT_KPI_BINDING/KPI_RESULT), remove role names → ABAC scope/action lines, fix deps (US-FND-ORG-002 → ABAC contract; US-FND-AST-004 → REF-001/003), wrong names (`DOWNTIME_REASON_EQUIPMENT`→`_ASSET` in **both** PRDs; WMS-002/003 `version`/`sequence_no`/`work_center_id` field fixes in **both** PRDs), retired entities (CREW/NON_WORKING_DAY/ROLE_ASSIGNMENT in §6/§7/§8/§9), header story count (62 vs 49).
4. Every doc change must be logged in `LOGS/CHANGELOG.md` same session (rule 3); new terms → `DOCS/01-glossary.md` (rule 7); decisions → `LOGS/decisions/`.

## Skills for the next session

- `grill-with-docs` (repo-local) — for stress-testing the PO decisions against the domain model before writing them.
- `prd-pilot` (repo-local, `.claude/skills/`) — after the sync, to verify DOCS-EN is sufficient to regenerate PRD stories.
- `unslop` (repo-local) — apply to any prose written into decisions/PRDs.
- `tech-writing-standards` — mandatory for all human-facing text per root AGENTS.md.
- Subagents (`reviewer` agent) worked well for parallel doc review; reuse for the sync verification pass.

## Open question to the user

At session end I asked: decisions first (`LOGS/decisions/`) or PRD-001 sync first? My recommendation: **decisions first** — several sync edits depend on their outcomes. User had not answered.
