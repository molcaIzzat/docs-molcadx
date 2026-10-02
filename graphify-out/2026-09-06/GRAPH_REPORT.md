# Graph Report - MolcaDX  (2026-09-06)

## Corpus Check
- 81 files · ~325,555 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 569 nodes · 889 edges · 29 communities (28 shown, 1 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 85 edges (avg confidence: 0.89)
- Token cost: 723,518 input · 0 output

## Community Hubs (Navigation)
- Shopfloor & OEE User Stories
- FOUNDATION Activity Flows
- UX Screen Declarations
- Agent Contract & Glossary
- FOUNDATION Module Map
- Platform Service Stories
- Cross-Agent Working Rules
- Job Scheduling & Capacity
- Site, Shift & Time Entities
- Master Data User Stories
- Grill & ADR Doc Skills
- Q3 Goals & Standards Track
- Asset Placement & Tag Resolution
- Equipment Taxonomy Entities
- Metrics Framework & Logging
- Work Center & Routing Entities
- KPI Binding & Tag Mapping
- PRD Format Machinery
- OEE Concept & ISO 22400
- Shift & Fiscal Glossary
- Product & BOM Entities
- Planned Domains & Coverage Gaps
- Performance & Quality Inputs
- Product Overview & Personas
- Reason Taxonomy & Config
- Metric Anatomy & PRD Checklist
- MOM Domain Vocabulary
- Reliability Metrics (MTTR/MTBF)
- PRD Naming Convention

## God Nodes (most connected - your core abstractions)
1. `PRD-001 — MolcaDx Core v0.2 (EN)` - 20 edges
2. `F-00 FOUNDATION Data Map` - 16 edges
3. `UX-00 — FOUNDATION UX Map` - 15 edges
4. `Resumable setup wizard` - 15 edges
5. `P-01 — Shopfloor Execution (spec)` - 15 edges
6. `P-03K — Job Schedule (concept)` - 15 edges
7. `P-01K — Shopfloor (concept)` - 13 edges
8. `OEE — Overall Equipment Effectiveness` - 13 edges
9. `ASSET_TAGS` - 12 edges
10. `P-02 — OEE Monitoring (spec)` - 12 edges

## Surprising Connections (you probably didn't know these)
- `ADR Format (Claude copy)` --semantically_similar_to--> `ADR Format (Antigravity copy)`  [INFERRED] [semantically similar]
  .claude/skills/grill-with-docs/ADR-FORMAT.md → .agents/skills/grill-with-docs/ADR-FORMAT.md
- `CONTEXT.md Format (Claude copy)` --semantically_similar_to--> `CONTEXT.md Format (Antigravity copy)`  [INFERRED] [semantically similar]
  .claude/skills/grill-with-docs/CONTEXT-FORMAT.md → .agents/skills/grill-with-docs/CONTEXT-FORMAT.md
- `unslop skill (Claude copy)` --semantically_similar_to--> `unslop skill (Antigravity copy)`  [INFERRED] [semantically similar]
  .claude/skills/unslop/SKILL.md → .agents/skills/unslop/SKILL.md
- `ADR Format (Claude copy)` --semantically_similar_to--> `ADR Format (Cursor copy)`  [INFERRED] [semantically similar]
  .claude/skills/grill-with-docs/ADR-FORMAT.md → .cursor/skills/grill-with-docs/ADR-FORMAT.md
- `CONTEXT.md Format (Claude copy)` --semantically_similar_to--> `CONTEXT.md Format (Cursor copy)`  [INFERRED] [semantically similar]
  .claude/skills/grill-with-docs/CONTEXT-FORMAT.md → .cursor/skills/grill-with-docs/CONTEXT-FORMAT.md

## Hyperedges (group relationships)
- **MolcaDx agent roster: PO orchestrating two domain agents** — _claude_agents_product_owner_product_owner_agent, _claude_agents_foundation_domain_foundation_domain_agent, _claude_agents_production_domain_production_domain_agent, _claude_skills_molca_domain_agent_skill_molca_domain_agent [EXTRACTED 1.00]
- **Grilling session writes CONTEXT.md and ADRs inline** — _claude_skills_grill_with_docs_skill_grill_with_docs, _claude_skills_grill_with_docs_context_format_context_md_format, _claude_skills_grill_with_docs_adr_format_adr_format, _claude_skills_grill_with_docs_skill_update_context_inline [EXTRACTED 1.00]
- **Same skills mirrored byte-identically across Claude, Cursor, and Antigravity** — _claude_skills_unslop_skill_unslop, _cursor_skills_unslop_skill_unslop, _agents_skills_unslop_skill_unslop, _claude_skills_grill_with_docs_skill_grill_with_docs, _cursor_skills_grill_with_docs_skill_grill_with_docs, _agents_skills_grill_with_docs_skill_grill_with_docs [INFERRED 0.95]
- **PRD quality gate: format, standard, metrics, readiness** — agents_user_story_prd_format, agents_eight_section_detail_block, docs_03_prd_standard_release_checklist, docs_04_metrics_framework_metric_anatomy, agents_readiness_test [EXTRACTED 1.00]
- **OEE computation chain from shift, sensor tags and asset placement** — docs_01_glossary_oee, docs_01_glossary_availability, docs_01_glossary_quality_ratio, docs_01_glossary_shift_instance, logs_handoff_2026_08_12_kpi_operating_time_tag_resolution_chain, docs_01_glossary_iso22400_time_elements [INFERRED 0.85]
- **Per-tool entry points converging on one product contract** — agents_molcadx_agent_contract, claude_claude_code_entry_point, gemini_antigravity_entry_point, agents_working_rules [EXTRACTED 1.00]
- **ISA-95 location tree levels (Tenant → Enterprise → Site → Area → Work Center → Work Unit)** — domains_foundation_docs_en_01_site_hierarchy_tenant, domains_foundation_docs_en_01_site_hierarchy_enterprise, domains_foundation_docs_en_01_site_hierarchy_site, domains_foundation_docs_en_01_site_hierarchy_area, domains_foundation_docs_en_01_site_hierarchy_work_center, domains_foundation_docs_en_01_site_hierarchy_work_unit [EXTRACTED 1.00]
- **Availability time walk: POT → planned DT → PBT → unplanned DT → APT** — domains_foundation_docs_en_02_shift_shift_instance, domains_foundation_docs_en_07_0_kpi_formula_pot, domains_foundation_docs_en_07_0_kpi_formula_pbt, domains_foundation_docs_en_07_0_kpi_formula_apt, domains_foundation_docs_en_05_reference_master_data_downtime_reason, domains_foundation_docs_en_07_0_kpi_formula_availability [EXTRACTED 1.00]
- **KPI binding resolution chain: work unit → placement → asset tag → slot → transform → result** — domains_foundation_docs_en_01_site_hierarchy_work_unit, domains_foundation_docs_en_04_asset_ontology_asset_placement, domains_foundation_docs_en_04_asset_ontology_asset_tags, domains_foundation_docs_en_07_1_kpi_tag_mapping_kpi_formula_slot, domains_foundation_docs_en_07_1_kpi_tag_mapping_work_unit_kpi_binding, domains_foundation_docs_en_07_1_kpi_tag_mapping_kpi_result [EXTRACTED 1.00]
- **FOUNDATION provisioning dependency chain (skeleton → readiness → journey)** — domains_foundation_flow_01_site_skeleton_flow_01_site_skeleton, domains_foundation_flow_02_production_readiness_flow_02_production_readiness, domains_foundation_ux_09_jrn_implementor_setup_ux_jrn_01_implementor_site_setup, domains_foundation_ux_09_jrn_implementor_setup_d1_validation_gate [EXTRACTED 1.00]
- **Daily runtime → KPI computation pipeline** — domains_foundation_flow_03_shift_generation_flow_03_shift_generation, domains_foundation_flow_04_daily_runtime_flow_04_daily_runtime, domains_foundation_flow_05_kpi_computation_flow_05_kpi_computation, domains_foundation_flow_04_daily_runtime_placement_resolved_at_event_timestamp, domains_foundation_ux_07_kpi_scr_fnd_kpi_003 [EXTRACTED 1.00]
- **SCR-FND-SIT-002 absorbs retired Shift and Fiscal screens** — domains_foundation_ux_01_site_hierarchy_scr_fnd_sit_002, domains_foundation_ux_02_shift_scr_fnd_shf_001, domains_foundation_ux_02_shift_scr_fnd_shf_002, domains_foundation_ux_03_fiscal_scr_fnd_fsc_001, domains_foundation_ux_01_site_hierarchy_shift_fiscal_tab_composition [EXTRACTED 1.00]
- **OEE calculation chain (A x P x Q from shopfloor entries)** — domains_production_docs_oee_monitoring_konsep_availability, domains_production_docs_oee_monitoring_konsep_performance, domains_production_docs_oee_monitoring_konsep_quality, domains_production_docs_oee_monitoring_konsep_oee, domains_production_docs_shopfloor_total_output, docs_prd_prd_001_molcadx_core_q3_en_us_fnd_kpi_004 [EXTRACTED 1.00]
- **Shift lifecycle — start, capture, close, correct** — domains_production_docs_shopfloor_flow_start_shift, domains_production_docs_shopfloor_flow_record_output, domains_production_docs_shopfloor_flow_record_downtime, domains_production_docs_shopfloor_flow_record_defect, domains_production_docs_shopfloor_flow_andon_escalation, domains_production_docs_shopfloor_flow_close_shift, domains_production_docs_shopfloor_data_correction_rules [EXTRACTED 1.00]
- **Q3 PRD lineage — PRD-002 absorbed into PRD-001 v0.2, PRD-003 forked for FOUNDATION** — docs_prd_prd_001_molcadx_core_q3_en_prd_001_molcadx_core_q3_en, docs_prd_prd_001_molcadx_core_q3_prd_001_molcadx_core_q3_id, docs_prd_prd_002_kpi_product_reference_data_en_prd_002_kpi_product_reference_data_en, docs_prd_prd_002_kpi_product_reference_data_prd_002_kpi_product_reference_data_id, docs_prd_prd_003_foundation_domain_en_prd_003_foundation_domain_en, docs_prd_prd_001_molcadx_core_q3_prd_001_molcadx_core_q3_pdf [EXTRACTED 1.00]

## Communities (29 total, 1 thin omitted)

### Community 0 - "Shopfloor & OEE User Stories"
Cohesion: 0.06
Nodes (65): PRODUCTION — OEE Monitoring, PRODUCTION — Shopfloor Execution, FOUNDATION — Calendar & Shift, US-FND-AST-004 — Manage the downtime reason code taxonomy (CLOSED — replaced by REF-001/002/003), US-FND-SHF-001 — Define shifts & their rotation pattern, US-FND-SHF-002 — Generate shift instances in advance, US-FND-SHF-003 — Manage the working calendar & exception days, US-FND-SHF-004 — Assign crews to shift instances (+57 more)

### Community 1 - "FOUNDATION Activity Flows"
Cohesion: 0.05
Nodes (51): 2026-08-26 FLOW series split into six diagrams, FLOW-00 — FOUNDATION Activity Overview, IEC 62264-3 activity mapping, Open question H-6 — shift-instance generation mechanism owner, Open question K-7 — write governance for WORK_UNIT_KPI_BINDING, Open question OEE-8 — planned downtime as Utilization, FLOW-01 — Site skeleton provisioning (A-1a), F-05 Reference & master data seed phase (+43 more)

### Community 2 - "UX Screen Declarations"
Cohesion: 0.06
Nodes (48): Three-tier model: constraint / implication / decision, Business code vs internal ID rule, crosses_midnight is derived, never stored, Mandatory SITE_SHIFT adoption per enterprise shift, Reason/UOM catalogs are reviewed master data, not enums, Deferred ASSET_PRODUCT_CODES → PRODUCT FK step, Routing/BOM version lock at work-order release, Rejections name what is blocking (+40 more)

### Community 3 - "Agent Contract & Glossary"
Cohesion: 0.06
Nodes (43): Mandatory Domain Folder Layout, foundation-domain agent, MolcaDx Agent Contract (AGENTS.md), Organization Module Removal (identity moves to SSO/Keycloak), product-owner agent, production-domain agent, Repo Map (paths and owners), Claude Code Entry Point (CLAUDE.md) (+35 more)

### Community 4 - "FOUNDATION Module Map"
Cohesion: 0.06
Nodes (38): FOUNDATION domain rules (one name, IDs never reused, no hard delete), foundation-domain agent (FOUNDATION domain contract), Single source of truth for the base data model, Deactivation, not deletion, Effective dating (valid_from / valid_to, close-and-open never UPDATE), F-00 FOUNDATION Data Map, Internal ID vs business code, Retired Calendar / working-day declaration module (+30 more)

### Community 5 - "Platform Service Stories"
Cohesion: 0.10
Nodes (37): FOUNDATION — Configuration Service, FOUNDATION — Integration & Service Monitoring, FOUNDATION — Notification, FOUNDATION — Organization (retired 2026-08-24), FOUNDATION — Site Hierarchy, FOUNDATION — Workflow Engine, PRD-001 — MolcaDx Core v0.2 (EN), US-FND-CFG-001 — Set tiered values and see where each comes from (+29 more)

### Community 6 - "Cross-Agent Working Rules"
Cohesion: 0.09
Nodes (33): unslop skill (Antigravity copy), Field semantics changes route through the Product Owner, Effective dating via valid_to, FLOW/ and UX/ SCR-* declaration series, foundation-domain agent, Internal IDs never reused, no hard delete, Log every doc change in the same session, PRD only on explicit request (+25 more)

### Community 7 - "Job Scheduling & Capacity"
Cohesion: 0.10
Nodes (32): PRODUCTION — Job Schedule, US-PROD-JOB-001 — Allocate jobs to lines & shifts with a capacity check, US-PROD-JOB-002 — Release jobs so operators can see them, US-PROD-JOB-003 — Surface carry-over in the next shift, US-PROD-JOB-004 — Reschedule with a recorded reason, Rule: corrections always leave a trace, Rule: every entry carries shift_instance_id and location context, Rule: PRODUCTION never invents entities — FOUNDATION owns them (+24 more)

### Community 8 - "Site, Shift & Time Entities"
Cohesion: 0.07
Nodes (31): AREA, AREA_CLASS, ENTERPRISE, SITE, SITE_CLASS, Site is the main data/access/time boundary, TENANT, business_date = the shift's start date (+23 more)

### Community 9 - "Master Data User Stories"
Cohesion: 0.14
Nodes (29): FOUNDATION — Asset Ontology / Equipment Taxonomy, FOUNDATION — KPI Formula & Tag Mapping, FOUNDATION — Product, FOUNDATION — Reference & Master Data, FOUNDATION — Work Master, US-FND-AST-001 — Manage the asset class & type taxonomy, US-FND-AST-002 — Register physical assets with their tag, US-FND-AST-003 — Record asset moves as placement history (+21 more)

### Community 10 - "Grill & ADR Doc Skills"
Cohesion: 0.13
Nodes (20): ADR Format (Antigravity copy), CONTEXT.md Format (Antigravity copy), grill-with-docs skill (Antigravity copy), ADR Format (Claude copy), ADR three-part qualification test, Lazy creation of docs/adr/, Sequential ADR numbering, CONTEXT-MAP.md multi-context map (+12 more)

### Community 11 - "Q3 Goals & Standards Track"
Cohesion: 0.20
Nodes (12): molca-domain-agent skill, Working Rules for All Agents, MolcaDx Glossary, Trigger rules (when an agent may create a PRD or a domain), Uncertainty handling (TBD with owner, never invent facts), IEC 62264 / ANSI-ISA-95 standard, 06 — ISA-95 / IEC 62264 & ISO 22400 Reference, Q3 sequencing critical path (Track 0 ERD gates Track 1B and 2.1) (+4 more)

### Community 12 - "Asset Placement & Tag Resolution"
Cohesion: 0.18
Nodes (11): Every number must trace back to a field, Place is separate from thing (position vs physical machine), ASSET_PLACEMENT, A position is not a machine, primary vs secondary placement_role on a WORK_UNIT, ISO 22400-2:2014 (manufacturing operations KPIs), F-07 KPI formula (ISO 22400-2 base), v1 adopted scope: Production OEE family only (K-4) (+3 more)

### Community 13 - "Equipment Taxonomy Entities"
Cohesion: 0.18
Nodes (11): ASSET, ASSET_CLASS, ASSET_COMPONENT_LINK, ASSET_TYPE, Class → Type → Instance catalog layering, ISO 14224 component nesting (Equipment unit → Subunit → Maintainable item → Part), ISO 14224 (equipment taxonomy & reliability data), Lifecycle status vs operational state (+3 more)

### Community 14 - "Metrics Framework & Logging"
Cohesion: 0.22
Nodes (10): Product Principles (shopfloor-first, measurable, no double work, offline-tolerant, single source of truth), Offline-first, Baseline rules, Analytics event convention (snake_case, mandatory properties, client_ts vs server_ts), 04 — Metrics Framework, Three metric layers (outcome / product / behavior), KR 1B.2 — Sync engine with 0 data loss, Track 1B — Platform and Edge Engineering (+2 more)

### Community 15 - "Work Center & Routing Entities"
Cohesion: 0.22
Nodes (10): Cross-cutting flat classification (deliberately no parent_class_id), WORK_CENTER, WORK_CENTER_CLASS, WORK_UNIT, WORK_UNIT_CLASS, Two-station infeed − outfeed reject derivation, Discrete/batch vs continuous standard field split on OPERATION, ROUTING (+2 more)

### Community 16 - "KPI Binding & Tag Mapping"
Cohesion: 0.24
Nodes (10): ASSET_PRODUCT_CODES, ASSET_TAGS, tag_role (business meaning) vs kind (data shape) split, No seeded KPI_INDEX / KPI_FORMULA master (K-1), KPI_FORMULA_SLOT, KPI_PARAMETERS, WORK_UNIT_KPI_BINDING, DATA_SOURCE (PLC / OPC UA / MQTT connection — no entity spec yet) (+2 more)

### Community 17 - "PRD Format Machinery"
Cohesion: 0.22
Nodes (9): Story Dependency Rules (no cycles, cross-domain explicit), Domain & Module Code Table, Eight Mandatory Detail-Block Sections, PRD-001 MolcaDx Core v0.2, PRD-003 FOUNDATION Domain, Readiness Test (designer & developer can start without asking PO), User Story ID Scheme US-<DOMAIN>-<MODUL>-<nnn>, US-PROD-OEE-003 — Show line OEE for the running shift (+1 more)

### Community 18 - "OEE Concept & ISO 22400"
Cohesion: 0.31
Nodes (9): Availability (APT / PBT), ISO 22400-2 time & quantity elements (POT, PBT, APT, ADOT, AUST, PQ, GQ, MTTR, MTBF), Loss tree, OEE (Availability × Performance × Quality), Quality ratio (GQ / PQ), One formula, one home (KPI formulas live in F-07, not here), ISO 22400-2 standard (KPI definitions), OEE computable from Production data alone (Quality/Maintenance modules are upsell, not prerequisite) (+1 more)

### Community 19 - "Shift & Fiscal Glossary"
Cohesion: 0.22
Nodes (9): Business date, Effective dating (valid_from/valid_to), Three Enterprise Shifts decision (07:00/15:00/23:00, same hours all sites), Fiscal year (FISCAL_YEAR), Shift instance, Shift pattern (retired concept), Effectiveness (Performance) formula, Operating time from sensor count × standard_cycle_time (computed at calculation time) (+1 more)

### Community 20 - "Product & BOM Entities"
Cohesion: 0.33
Nodes (9): UNIT_OF_MEASUREMENTS, ITEM retired — PRODUCT is the single entity, PRODUCT, PRODUCT_CYCLE, PRODUCT_DETAIL, PRODUCT_UOM_CONVERSION, BOM, BOM_LINE (+1 more)

### Community 21 - "Planned Domains & Coverage Gaps"
Cohesion: 0.29
Nodes (8): data-domain (planned), design-domain (planned), engineering-domain (planned), ops-domain (planned), Per-PRD responsibility matrix (author vs mandatory reviewer), Q3 coverage gaps (workflow engine entities, platform modules, Work Improvement, License Manager, missing domains), Track 1A — Monitoring and Controlling (service monitoring), Low Code Workflow Engine module

### Community 22 - "Performance & Quality Inputs"
Cohesion: 0.29
Nodes (8): PRI — Planned run time per item, SQ — Scrap quantity, Multi-SKU Performance segmentation (segment_and_sum), OPERATION, QUALITY_DEFECT_CODE, total_output = good_qty + scrap_qty + rework_qty, WORK_ORDER_OPERATION, Unit conversion resolved at calculation time, never stored on the tag

### Community 23 - "Product Overview & Personas"
Cohesion: 0.33
Nodes (7): MolcaDx Product Overview, Out of Scope (ERP finance, HRIS, VR/AR), Target Personas (operator, supervisor, plant manager, admin/IT), NFR must be numeric, PRD release checklist, Counter-metric requirement, PRD Template

### Community 24 - "Reason Taxonomy & Config"
Cohesion: 0.29
Nodes (7): Reason scoping per asset instance, not per ASSET_CLASS, DOWNTIME_REASON, DOWNTIME_REASON_ASSET, A downtime/reject reason is never free text, Stalled-counter downtime detection (stall_bucket + reason_match_enrich), Transform enum (closed menu of tag→slot transforms), F-12 Configuration Service

### Community 25 - "Metric Anatomy & PRD Checklist"
Cohesion: 0.40
Nodes (5): Given/When/Then acceptance criteria, Goal statement form (metric → baseline → target → date → data source), 03 — PRD Standard, Seven-part metric anatomy, KR measurability gap (no KR meets metric→baseline→target→date form)

### Community 26 - "MOM Domain Vocabulary"
Cohesion: 0.67
Nodes (3): Domain (repo ownership unit), MOM Activity Category (Production/Quality/Maintenance/Inventory), Four MOM domains (Production/Quality/Maintenance/Inventory)

### Community 27 - "Reliability Metrics (MTTR/MTBF)"
Cohesion: 0.67
Nodes (3): TBF — Time between failures, TTR — Time to repair, MTTR / MTBF from unplanned downtime only

## Ambiguous Edges - Review These
- `Stalled-counter downtime detection (stall_bucket + reason_match_enrich)` → `F-12 Configuration Service`  [AMBIGUOUS]
  DOMAINS/FOUNDATION/DOCS-EN/12-configuration-service.md · relation: conceptually_related_to

## Knowledge Gaps
- **62 isolated node(s):** `unslop skill (Antigravity copy)`, `unslop skill (Cursor copy)`, `Sequential ADR numbering`, `Example dialogue between dev and domain expert`, `Cross-reference stated behavior with code` (+57 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 135 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Stalled-counter downtime detection (stall_bucket + reason_match_enrich)` and `F-12 Configuration Service`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `PRD-001 — MolcaDx Core v0.2 (EN)` connect `Platform Service Stories` to `Shopfloor & OEE User Stories`, `Master Data User Stories`, `Job Scheduling & Capacity`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `F-00 FOUNDATION Data Map` connect `FOUNDATION Module Map` to `Reason Taxonomy & Config`, `Asset Placement & Tag Resolution`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `OPERATION` connect `Performance & Quality Inputs` to `KPI Binding & Tag Mapping`, `Product & BOM Entities`, `FOUNDATION Module Map`, `Work Center & Routing Entities`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `unslop skill (Antigravity copy)`, `unslop skill (Cursor copy)`, `Sequential ADR numbering` to the rest of the system?**
  _62 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Shopfloor & OEE User Stories` be split into smaller, more focused modules?**
  _Cohesion score 0.05721153846153846 - nodes in this community are weakly interconnected._
- **Should `FOUNDATION Activity Flows` be split into smaller, more focused modules?**
  _Cohesion score 0.05019607843137255 - nodes in this community are weakly interconnected._