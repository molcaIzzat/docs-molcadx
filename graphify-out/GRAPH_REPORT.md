# Graph Report - docs-molcadx  (2026-10-01)

## Corpus Check
- 76 files · ~224,802 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 638 nodes · 1081 edges · 42 communities (34 shown, 8 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 84 edges (avg confidence: 0.84)
- Token cost: 444,307 input · 0 output

## Community Hubs (Navigation)
- ISA-95 Standards & Hierarchy
- PRODUCTION Domain & Flows
- Assets, Work Units & Reasons
- PO Agents & PRD Skills
- Work Master Execution Chain
- Product, UOM & Work Master
- Audit Trail & Workflow
- Domain Agents & Glossary
- Planning Sections
- PRD Sync & Render Check
- KPI Binding Screens
- PRD Template Sections
- Reject Reasons & Defects
- Audit Log Spec
- Product Screens
- Asset State Log
- Changelog Decisions
- Domain Agent Template
- Line Across Work Centers
- Grill-with-docs Skill
- Line Decision Note
- Ways of Working
- OPC UA Tag Decision
- Generated OPC UA Tags
- Net Recipe & Shrinkage
- Product Tabs Decision
- Product Types Decision
- Work Master Waves 1-2
- Wave 2 Flows Note
- Wave 1 Note
- Repo Entry Points
- Unslop Skill
- Net Recipe Note
- Open Items Wrap-up
- Export Script
- Workflow Concepts
- Counter-metric Rule
- Metric Anatomy
- Integration Module
- Issue Template Config
- Contest Blockers Decision

## God Nodes (most connected - your core abstractions)
1. `F-08 Work Master` - 41 edges
2. `UX-00 UX Map` - 29 edges
3. `F-07.1 KPI Tag Mapping` - 28 edges
4. `F-14 Audit Trail` - 25 edges
5. `UX 08 Work master screens` - 25 edges
6. `PRODUCTION Work Master (Production view)` - 20 edges
7. `Decision: Work Master per domain, operation UOM, PRODUCT_CYCLE retired` - 20 edges
8. `Changelog` - 19 edges
9. `F-07 KPI Formula` - 18 edges
10. `FLOW-02 Production Readiness Provisioning` - 18 edges

## Surprising Connections (you probably didn't know these)
- `Entities` --references--> `main()`  [INFERRED]
  DOMAINS/PRODUCTION/DOCS/01-planning.md → scripts/check-md-links.py
- `DOWNTIME_REASON` --semantically_similar_to--> `REJECT_REASON`  [INFERRED] [semantically similar]
  DOMAINS/FOUNDATION/DOCS-EN/05-reference-master-data.md → LOGS/decisions/2026-09-23-defect-code-merged-into-reject-reason.md
- `7. Branch, commit, PR` --references--> `main()`  [INFERRED]
  .claude/skills/prd-sync/SKILL.md → scripts/check-md-links.py
- `License gate option A (hidden tabs)` --semantically_similar_to--> `Work Master screens license-gated by PRODUCTION`  [INFERRED] [semantically similar]
  LOGS/decisions/2026-09-30-bom-routing-as-product-tabs.md → DOMAINS/PRODUCTION/DOCS/05-work-master.md
- `03 PRD Standard` --implements--> `User-story PRD format (8-part detail block)`  [INFERRED]
  DOCS/03-prd-standard.md → AGENTS.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **MOM domain ownership framework applied to PRODUCTION's SHIFT_INSTANCE generator role** — logs_decisions_2026_09_10_b1_shift_instance_generator_owner, domains_production_agents [EXTRACTED 1.00]
- **ISA-95 equipment hierarchy (Enterprise > Site > Area > Work Center > Work Unit)** — domains_foundation_docs_en_01_site_hierarchy_enterprise, domains_foundation_docs_en_01_site_hierarchy_site, domains_foundation_docs_en_01_site_hierarchy_area, domains_foundation_docs_en_01_site_hierarchy_work_center, domains_foundation_docs_en_01_site_hierarchy_work_unit [EXTRACTED 1.00]
- **Shift model: enterprise label > site timing > instance** — domains_foundation_docs_en_02_shift_enterprise_shift, domains_foundation_docs_en_02_shift_site_shift, domains_foundation_docs_en_02_shift_shift_instance [EXTRACTED 1.00]
- **PRD governance: standard, template, sync and pilot** — docs_03_prd_standard_prd_standard, docs_templates_prd_template_prd_template, _claude_skills_prd_sync_skill_prd_sync, _claude_skills_prd_pilot_skill_prd_pilot, agents_user_story_prd_format [INFERRED 0.85]
- **Per-work-unit KPI resolution chain** — domains_foundation_docs_en_01_site_hierarchy_work_unit, domains_foundation_docs_en_04_asset_ontology_asset_placement, domains_foundation_docs_en_04_asset_ontology_asset_tags, domains_foundation_docs_en_07_1_kpi_tag_mapping_work_unit_kpi_binding, domains_foundation_docs_en_07_1_kpi_tag_mapping_kpi_formula_slot, domains_foundation_docs_en_07_1_kpi_tag_mapping_kpi_parameters, domains_foundation_docs_en_07_1_kpi_tag_mapping_kpi_result [EXTRACTED 1.00]
- **ISO 22400-2 OEE family** — domains_foundation_docs_en_07_0_kpi_formula_availability, domains_foundation_docs_en_07_0_kpi_formula_performance, domains_foundation_docs_en_07_0_kpi_formula_quality, domains_foundation_docs_en_07_0_kpi_formula_oee [EXTRACTED 1.00]
- **FOUNDATION FLOW provisioning-to-KPI series** — domains_foundation_flow_01_site_skeleton, domains_foundation_flow_02_production_readiness, domains_foundation_flow_04_daily_runtime, domains_foundation_flow_05_kpi_computation [EXTRACTED 1.00]
- **License-gated navigation pattern** — domains_platform_flow_01_module_entitlement_check_entitlement_check_flow, domains_platform_docs_en_01_license_manager_module_license_gate_table, domains_platform_docs_en_01_license_manager_locked_domain_heading, domains_platform_docs_en_01_license_manager_module_lock_vs_feature_hide, domains_foundation_ux_07_kpi_kpi_per_domain_sidebar, domains_foundation_ux_08_work_master_work_master_license_gate, domains_platform_docs_en_01_license_manager_tenant_domain_entitlement [EXTRACTED 1.00]
- **Production Job Order entity family** — domains_production_docs_01_planning_work_order, domains_production_docs_01_planning_work_order_operation, domains_production_docs_01_planning_work_order_operation_defect, domains_production_docs_01_planning_work_order_operation_lot, domains_production_docs_01_planning_routing_bom_locked_at_release_b3 [EXTRACTED 1.00]
- **Product detail tab set (Measurement/Conversions/BOM/Routing/History)** — domains_foundation_ux_06_product_scr_fnd_pro_001, domains_foundation_ux_06_product_scr_fnd_pro_003, domains_foundation_ux_08_work_master_scr_fnd_wms_002, domains_foundation_ux_08_work_master_scr_fnd_wms_003, domains_foundation_ux_08_work_master_scr_fnd_wms_007, domains_foundation_ux_08_work_master_product_flow_bar [EXTRACTED 1.00]
- **Work Master wave 1-2 model additions** — logs_decisions_2026_09_30_work_master_wave_1_routing_bom_versioning, logs_decisions_2026_09_30_work_master_wave_1_operation_work_unit, logs_decisions_2026_09_30_work_master_wave_1_operation_dependency, logs_decisions_2026_09_30_bom_net_recipe_shrinkage_base_qty_planned_shrinkage, logs_decisions_2026_09_30_bom_net_recipe_shrinkage_base_qty_bom_base_qty, logs_decisions_2026_09_30_work_master_wave_2_flows_parameters_product_flow, logs_decisions_2026_09_30_work_master_wave_2_flows_parameters_operation_parameter, logs_decisions_2026_09_30_work_master_wave_2_flows_parameters_enforce_sequence [INFERRED 0.85]
- **IEC 62264-4 Work Master to Job Response spine** — domains_production_docs_05_work_master_work_master, domains_production_docs_05_work_master_work_directive, domains_production_docs_05_work_master_job_order, domains_production_docs_05_work_master_job_response [EXTRACTED 1.00]
- **Reject capture and quality quantity flow** — logs_decisions_2026_09_23_defect_code_merged_into_reject_reason_reject_reason, domains_production_docs_01_planning_work_order_operation_defect, logs_decisions_2026_09_24_disposition_on_reject_actual_disposition, logs_decisions_2026_09_30_line_across_work_centers_reject_weight_reject_by_weight [INFERRED 0.85]

## Communities (42 total, 8 thin omitted)

### Community 0 - "ISA-95 Standards & Hierarchy"
Cohesion: 0.06
Nodes (53): 06 — ISA-95/IEC 62264 & ISO 22400 Standards, Role-based equipment hierarchy (Enterprise→Site→Area→Work Center→Work Unit), Four MOM domains (Production/Quality/Maintenance/Inventory), OEE computable from Production domain data alone, AREA, ENTERPRISE, EQUIPMENT_FLOW / WORK_UNIT_FLOW topology, SITE/AREA/WORK_CENTER/WORK_UNIT_CLASS classifications (+45 more)

### Community 1 - "PRODUCTION Domain & Flows"
Cohesion: 0.06
Nodes (47): FLOW-03 Shift-instance generation, SCR-FND-WMS-004 Work order create & release (out of scope), SCR-FND-WMS-006 Operation progress (out of scope), PRODUCTION AGENTS.md, Depends on FOUNDATION (do not duplicate), Four columns (Figma), Mission, Out of scope here (+39 more)

### Community 2 - "Assets, Work Units & Reasons"
Cohesion: 0.07
Nodes (50): Site Hierarchy and Equipment Taxonomy as separate trees, WORK_UNIT, ASSET, ASSET_PLACEMENT, ASSET_STATE_LOG (PRODUCTION-owned), DOWNTIME_REASON, DOWNTIME_REASON_ASSET / REJECT_REASON_ASSET, F-07 KPI Formula (+42 more)

### Community 3 - "PO Agents & PRD Skills"
Cohesion: 0.07
Nodes (48): product-owner agent, Break/rest is not unplanned downtime rule, production-domain agent, PRD pilot gap categories (doc gap / authoring choice / inconsistency), prd-pilot skill, prd-sync skill, PRD sync point (Specs synced to), Domain & module code registry (FND/PROD/MNT) (+40 more)

### Community 4 - "Work Master Execution Chain"
Cohesion: 0.07
Nodes (37): Closed, PRODUCTION Work Master (Production view), Interim Directive-equivalent on `WORK_ORDER`, Job Order (WORK_ORDER), Job Response, License gate (already decided), Next, Object split (IEC 62264 Part 4 — keep clean) (+29 more)

### Community 5 - "Product, UOM & Work Master"
Cohesion: 0.09
Nodes (34): ASSET_PRODUCT_CODES, TIME_CONVERSIONS, MEASUREMENT_GROUP / UNIT_OF_MEASUREMENTS, PRODUCT, PRODUCT_DETAIL, PRODUCT_UOM_CONVERSION, F-08 Work Master, BOM (+26 more)

### Community 6 - "Audit Trail & Workflow"
Cohesion: 0.13
Nodes (30): AUDIT_LOG, F-09 Workflow Engine module, F-14 Audit Trail, Audit log rules (append-only, same transaction), Per-module audit_view permission, Effective dating vs audit trail, MAINTENANCE AGENTS.md, Maintenance work order (03-work-order, planned) (+22 more)

### Community 7 - "Domain Agents & Glossary"
Cohesion: 0.12
Nodes (25): foundation-domain agent definition, maintenance-domain agent definition, platform-domain agent definition, molca-domain-agent SKILL, Molca domain-agent creation skill (concept), CONTEXT.md (MolcaDx glossary), 00 - Product Overview: MolcaDx, Persona (target user, term) (+17 more)

### Community 8 - "Planning Sections"
Cohesion: 0.08
Nodes (26): Breaktime, Download form, Entities, Execution interlock / checklist, Explicit non-goals, Forms & views, Job Order, Log (planning) (+18 more)

### Community 9 - "PRD Sync & Render Check"
Cohesion: 0.10
Nodes (22): cells(), check(), Check Markdown files render in GitHub and Obsidian (DOCS/03-prd-standard.md…, 0. Resolve which PRDs, 1. Find each PRD's sync point, 2. Diff the specs, 3. Map changes to stories, 4. Read only what is affected, then edit (+14 more)

### Community 10 - "KPI Binding Screens"
Cohesion: 0.11
Nodes (23): UX 07 KPI binding screens, KPI item per domain sidebar group, KPI side panel per KPI, SCR-FND-KPI-001 Slot & parameters catalog, SCR-FND-KPI-002 Work-unit binding editor, SCR-FND-KPI-003 KPI result browser, SCR-FND-KPI-004 KPI Calculation (view-only), Address naming: Build from location (+15 more)

### Community 11 - "PRD Template Sections"
Cohesion: 0.09
Nodes (23): 10. Risiko, 11. Open questions, 12. Decision log, 1. Masalah, 2. Target user, 3. Tujuan & metrik (maks. 3), 4. Scope, 5.1 \<Judul Domain\> (+15 more)

### Community 12 - "Reject Reasons & Defects"
Cohesion: 0.13
Nodes (19): Scrap ratio, QUALITY_DEFECT_CODE (retired, merged into REJECT_REASON), SCR-FND-REF-004 Reject reason manager, WORK_ORDER_OPERATION_DEFECT, 2026-09-23 — Defect codes merged into reject reasons, Consequences, Cross-domain follow-up (rule 6 — for `production-domain`, routed by PO), Decision (+11 more)

### Community 13 - "Audit Log Spec"
Cohesion: 0.12
Nodes (16): 9.1 `AUDIT_LOG` — one append-only row per change, 9.2 Rules, 9.3 Example rows, 9. Entity specification, Common pitfalls, Core concepts, F-14 — Audit Trail, How the entities connect (+8 more)

### Community 14 - "Product Screens"
Cohesion: 0.23
Nodes (16): FLOW-06 Master-data change control, UX 06 Product screens, Product type & packaging level, SCR-FND-PRO-001 Product list & tabbed detail, SCR-FND-PRO-002 Cycle time tab (retired), SCR-FND-PRO-003 Conversions tab, UX 08 Work master screens, Product flow bar (+8 more)

### Community 15 - "Asset State Log"
Cohesion: 0.15
Nodes (13): ASSET_STATE_LOG — operational state per asset, over time, Boundaries, Capabilities (Figma), Fields, Log (monitoring), Open questions, Operator entry — reject and offline behaviour, PRODUCTION — Monitoring (+5 more)

### Community 16 - "Changelog Decisions"
Cohesion: 0.20
Nodes (12): Work Master screens license-gated by PRODUCTION, Changelog, KPI_FORMULA_SLOT.domain (KPI per domain), Generated MQTT topic (DATA_SOURCE.topic_root), Production report pages per KPI family, Sidebar grouped by domain with locked heading, Decision: BOM and Routing as Product tabs, License gate option A (hidden tabs) (+4 more)

### Community 17 - "Domain Agent Template"
Cohesion: 0.18
Nodes (11): 1. Mission, 2. Document index, 3. Scope, 4. Outputs (artifacts), 5. Interfaces, 6. Required reading before work, 7. Done when, 8. Domain-specific rules (+3 more)

### Community 18 - "Line Across Work Centers"
Cohesion: 0.22
Nodes (11): Decision: Line across work centers, reject by weight, EQUIPMENT_FLOW pre-fills routing steps, One product per work center, PLN-Q1..Q5 questions raised to PRODUCTION, Reject entered by weight -> units -> time, BOM.is_phantom, lot_marker tag role, activity_signal tag role (+3 more)

### Community 19 - "Grill-with-docs Skill"
Cohesion: 0.20
Nodes (10): ADR Format (Antigravity grill-with-docs), CONTEXT.md Format (Antigravity grill-with-docs), grill-with-docs SKILL (Antigravity), ADR Format (Claude grill-with-docs), CONTEXT.md Format (Claude grill-with-docs), grill-with-docs SKILL (Claude), Grill-with-docs skill (concept), ADR Format (Cursor grill-with-docs) (+2 more)

### Community 20 - "Line Decision Note"
Cohesion: 0.20
Nodes (10): 2026-09-30 — A line across several work centers; reject entered by weight, A — One product per work center, B — Planning picks each work center's own output, C — Routing steps pre-filled from the work center's flow, D — Weight of one unit at each step is derived, Decisions, E — Punching: cycle time per punch, F — Reject entered by weight converts to units, then time (+2 more)

### Community 21 - "Ways of Working"
Cohesion: 0.25
Nodes (7): 05 — Ways of Working, 1. Peran Product Owner sebagai orchestrator, 2. Alur dari permintaan sampai rilis, 3. Aturan pemicu (penting), 4. Definition of Ready (sebelum developer/designer mulai), 5. Definition of Done, 6. Penanganan ketidakpastian

### Community 22 - "OPC UA Tag Decision"
Cohesion: 0.29
Nodes (7): 2026-09-25 — Tag node addresses are generated from the hierarchy (OPC UA), Basis, Consequences, Decision, Design choices made by `foundation-domain`, Follow-up decision (same day): multi-lane machine, Still open

### Community 23 - "Generated OPC UA Tags"
Cohesion: 0.52
Nodes (7): ASSET_TAGS (tag_name, work_unit_id), DATA_SOURCE (node_naming, namespace_uri), Decision: Generated OPC UA tag nodes, Generated OPC UA NodeId from hierarchy, IEC 62541 (OPC UA), Multi-lane machine placement, Tag hand-off list

### Community 24 - "Net Recipe & Shrinkage"
Cohesion: 0.48
Nodes (7): 2026-09-30 — Net recipe, planned shrinkage per step, recipe base quantity, BOM.base_qty / base_uom_id (Recipe base quantity), Decision: BOM net recipe, shrinkage, base qty, BOM lines as net recipe, Parked — not in this decision, Planned input formula, OPERATION.planned_shrinkage

### Community 25 - "Product Tabs Decision"
Cohesion: 0.29
Nodes (7): 2026-09-30 — BOM and Routing move to Product detail tabs, Consequences, Decision, License gate — option A (hidden), Not changed, What changes, Why

### Community 26 - "Product Types Decision"
Cohesion: 0.29
Nodes (7): 2026-09-30 — Product type gains packaging and consumable; phantom BOM flag; BOM tree view, A — `PRODUCT.product_type` has five values, B — Packaging level on the product, C — Phantom flag on the BOM, D — BOM tab is a tree, on Product detail only (prepared, not required), Decisions, Not in this decision

### Community 27 - "Work Master Waves 1-2"
Cohesion: 0.29
Nodes (7): Decision: Work Master wave 1, OPERATION_DEPENDENCY, OPERATION_WORK_UNIT, ROUTING/BOM version + status (W-8), Decision: Work Master wave 2 flows and parameters, ROUTING.enforce_sequence, OPERATION_PARAMETER

### Community 28 - "Wave 2 Flows Note"
Cohesion: 0.29
Nodes (7): 2026-09-30 — Work Master wave 2: flows, parameter standards, A — `PRODUCT_FLOW`: one way of making a product, B — ~~Process library~~ (dropped 2026-10-01, PO), C — Parameter standards, D — Enforce step order (flag only), Decisions, Not in this decision

### Community 29 - "Wave 1 Note"
Cohesion: 0.33
Nodes (6): 2026-09-30 — Work Master wave 1 (issue #58 parts A and B), Changed picks (vs issue #58 as written), Not in this decision, Part A — BOM and Routing, Part B — product codes, Questions

### Community 30 - "Repo Entry Points"
Cohesion: 0.40
Nodes (4): CLAUDE.md (Claude Code entrypoint), Domain/Module/Feature/Capability declaration template, 8-level platform taxonomy declaration rule, docs-molcadx README

### Community 31 - "Unslop Skill"
Cohesion: 0.50
Nodes (4): unslop SKILL (Antigravity), unslop SKILL (Claude), Unslop skill (concept), unslop SKILL (Cursor)

### Community 32 - "Net Recipe Note"
Cohesion: 0.50
Nodes (4): A — BOM lines are the net recipe; losses are added on top, B — One formula per product, C — Recipe base quantity, Decisions

### Community 33 - "Open Items Wrap-up"
Cohesion: 0.50
Nodes (4): 2026-10-01 — Wrap-up of the open items from the 2026-09-30 Work Master session, FOUNDATION, Parked, each with its own issue, PRODUCTION — PLN-Q1 to PLN-Q8

## Ambiguous Edges - Review These
- `F-14 Audit Trail` → `Lifecycle status history (entity TBD)`  [AMBIGUOUS]
  DOMAINS/MAINTENANCE/DOCS-EN/01-asset-history.md · relation: conceptually_related_to

## Knowledge Gaps
- **253 isolated node(s):** `Download form`, `Execution interlock / checklist`, `Explicit non-goals`, `Forms & views`, `Log (planning)` (+248 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 277 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `F-14 Audit Trail` and `Lifecycle status history (entity TBD)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `F-08 Work Master` connect `Product, UOM & Work Master` to `ISA-95 Standards & Hierarchy`, `PRODUCTION Domain & Flows`, `Assets, Work Units & Reasons`, `Work Master Execution Chain`, `Audit Trail & Workflow`, `Domain Agents & Glossary`, `Reject Reasons & Defects`, `Product Screens`, `Changelog Decisions`, `Line Across Work Centers`, `Net Recipe & Shrinkage`, `Work Master Waves 1-2`?**
  _High betweenness centrality (0.226) - this node is a cross-community bridge._
- **Why does `F-14 Audit Trail` connect `Audit Trail & Workflow` to `ISA-95 Standards & Hierarchy`, `PRODUCTION Domain & Flows`, `Assets, Work Units & Reasons`, `Product, UOM & Work Master`, `Domain Agents & Glossary`, `Audit Log Spec`, `Product Screens`?**
  _High betweenness centrality (0.134) - this node is a cross-community bridge._
- **Why does `PRODUCTION — Planning (“Next to be ERP”)` connect `Planning Sections` to `PRODUCTION Domain & Flows`?**
  _High betweenness centrality (0.129) - this node is a cross-community bridge._
- **What connects `Download form`, `Execution interlock / checklist`, `Explicit non-goals` to the rest of the system?**
  _253 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ISA-95 Standards & Hierarchy` be split into smaller, more focused modules?**
  _Cohesion score 0.06458635703918723 - nodes in this community are weakly interconnected._
- **Should `PRODUCTION Domain & Flows` be split into smaller, more focused modules?**
  _Cohesion score 0.06184012066365008 - nodes in this community are weakly interconnected._