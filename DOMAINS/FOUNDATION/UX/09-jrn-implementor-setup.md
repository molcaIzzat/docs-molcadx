# UX-JRN 01 — Implementor site setup (journey)

> Composes: [UX 01](01-site-hierarchy.md)…[UX 08](08-work-master.md) ·
> behavior backbone: [FLOW-01](../FLOW/01-site-skeleton.md), [FLOW-02](../FLOW/02-production-readiness.md) · Status: 🟡 DRAFT.

**Persona:** internal implementor (PRD-001 §2, this quarter's target user) — desktop, long
sessions, stable network, tolerates dense screens when value and impact are clear.
**Trigger:** a new site or line goes live on MolcaDx.
**Success metric:** **G2** `waktu_setup_site_oleh_implementor` — full site setup until the
first output is recorded, **0 developer help, 0 code change** (PRD-001 §3). Events:
`master_data_setup_started` → `first_output_recorded`.

## Journey flow

```mermaid
flowchart TD
    START(["New site onboarding"]) --> OPEN["Open setup wizard —
    SCR-FND-SIT-001 · progress shown per FLOW-01/FLOW-02 phase,
    resumable across sessions"]

    OPEN --> REF["F-05 seed reference data —
    SCR-FND-REF-001 (UOM), SCR-FND-REF-002 (time conversions)
    reason taxonomies (downtime/reject) live in SCR-FND-AST-004"]
    REF --> HIER["F-01/F-02/F-03 declare hierarchy + time —
    SCR-FND-SIT-001, SCR-FND-SIT-002 (single screen: the ENTERPRISE
    node's Shift/Fiscal Year tabs absorb former SCR-FND-SHF-001/
    SCR-FND-FSC-001; each SITE node's tabs absorb former
    SCR-FND-SHF-002) — declaring Enterprise Shift is a prerequisite
    the moment the ENTERPRISE node exists, not a later phase"]
    HIER --> AST["F-04 register assets & placement —
    SCR-FND-AST-001, SCR-FND-AST-002, SCR-FND-AST-003
    product-code mapping visibly deferred"]
    AST --> PRO["F-06 declare products —
    SCR-FND-PRO-001, SCR-FND-PRO-003
    unblocks the deferred mapping"]
    PRO --> MAP["Back to F-04 — finish product-code mapping
    SCR-FND-AST-002 deferred step"]
    MAP --> BIND["F-07.1 bind KPI tags per work unit —
    SCR-FND-KPI-002 (KPI › Production) with worked preview"]
    BIND --> WMS["F-08 work master —
    SCR-FND-WMS-002 (BOM), SCR-FND-WMS-003 (Routing) —
    tabs on the product detail page"]
    WMS --> GATE{"Validation gate —
    D-1 coverage check"}

    GATE -->|"gaps found"| GAPS["Gate lists every missing entity
    as a link to its screen — nothing silent"]
    GAPS --> OPEN
    GATE -->|"complete"| DONE(["Site ready —
    hand over to shift operations
    first_output_recorded starts G2 clock end"])
```

## Wizard-level states (the journey itself)

| State | Behavior |
|---|---|
| Default | Phase progress bar mirrors FLOW-01 then FLOW-02 order; each phase shows its coverage status (D-1) |
| Resumed | Partial setup reopens at the first incomplete phase — no phase is silently skipped |
| Validation gate | Lists every missing entity as a navigable link; **nothing blocks silently** |
| Handover | Completion receipt names what is still `TBD` (e.g. real reason catalogs ⚠ T-1) so ops knows the caveats |

## Rules this journey obeys

- Phases appear in **FLOW-01 then FLOW-02 order** — the wizard may not reorder them (dependency-true).
- The wizard **composes** screens; it adds no fields of its own (rule D-3).
- The only hard gate is D-1 coverage; everything else stays editable later via
  [FLOW-06](../FLOW/06-change-control.md) change control.

## Open questions

| # | Question | Owner |
|---|---|---|
| UX-JRN-1 | May phases run in parallel tabs for a second implementor, or is setup single-threaded by design? | PO |
| UX-JRN-2 | Is the wizard also the *editing* home later, or does day-2 editing move to the module screens? | PO |
