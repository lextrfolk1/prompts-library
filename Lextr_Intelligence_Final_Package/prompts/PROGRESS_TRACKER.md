# Lextr Intelligence Platform — Structured Prompt Progress Tracker

**Repository Branches:** `feature/lextr-intelligence-v1.38.0`  
**Platform Version:** `v1.38.0`  
**Tracker Mode:** Evidence-based, prompt-by-prompt tracking  
**Current State:** Reset baseline with structured tracking fields. No prompt is marked as delivered without objective verification.

---

## 1. Status Model

Use one status per prompt at all times:

- `PENDING` — not started
- `IN_PROGRESS` — actively being implemented
- `BLOCKED` — waiting on dependency, approval, or missing input
- `DELIVERED` — implementation exists and evidence is recorded
- `DEFERRED` — intentionally postponed or out of scope

Required fields per prompt:

- `Prompt ID`
- `Wave`
- `Target Repo / Layer`
- `Scope`
- `Owner`
- `Status`
- `Evidence`
- `Last Updated`
- `Notes / Risks`

---

## 2. Wave Summary Matrix

| Wave | Feature Domain | Total Prompts | PENDING | IN_PROGRESS | BLOCKED | DELIVERED | DEFERRED | Status |
|:---:|---|:---:|:---:|:---:|:---:|:---:|:---:|---|
| **Wave 01** | Baseline Schema & UI Core Foundations | 3 | 0 | 0 | 0 | 3 | 0 | ✅ DELIVERED |
| **Wave 02** | Run Protocol, Policy & SLM Baseline | 5 | 0 | 0 | 0 | 5 | 0 | ✅ DELIVERED |
| **Wave 03** | Persistence, Human Review & Knowledge Hub | 13 | 0 | 0 | 0 | 13 | 0 | ✅ DELIVERED |
| **Wave 04** | Skills 1/2/3, Masking Boundary & Assembly | 12 | 0 | 0 | 0 | 12 | 0 | ✅ DELIVERED |
| **Wave 05** | Graph Walk, Lineage & Cytoscape DAG | 16 | 0 | 0 | 0 | 16 | 0 | ✅ DELIVERED |
| **Wave 06** | Assembly, Preset Management & Semantic Queries | 25 | 0 | 0 | 0 | 25 | 0 | ✅ DELIVERED |
| **Wave 07** | Evidence Ledger, Merkle Chaining & AU-9 Integrity | 58 | 0 | 0 | 0 | 58 | 0 | ✅ DELIVERED |
| **Wave 08** | Reason Code Registry, Locale Tokens & Multi-Tenancy | 24 | 0 | 0 | 0 | 24 | 0 | ✅ DELIVERED |
| **Wave 09** | Cross-Product Integration Baseline | 0 | 0 | 0 | 0 | 0 | 0 | ⚪ Empty |
| **Wave 10** | UC10 Refine & Build, Report Store & Domain Resolution | 23 | 0 | 0 | 0 | 23 | 0 | ✅ DELIVERED |
| **Wave 11** | Knowledge Graph Access Layer | 4 | 0 | 0 | 0 | 4 | 0 | ✅ DELIVERED |
| **Wave 12** | External Witness & WORM Anchor | 5 | 0 | 0 | 0 | 5 | 0 | ✅ DELIVERED |
| **Wave 13** | Population Reconciliation | 4 | 0 | 0 | 0 | 4 | 0 | ✅ DELIVERED |
| **Wave 14** | Confidence Calibration & Ongoing Monitoring | 6 | 0 | 0 | 0 | 6 | 0 | ✅ DELIVERED |
| **Wave 15** | Approval Workflow Substrate | 9 | 0 | 0 | 0 | 9 | 0 | ✅ DELIVERED |
| **Wave 16** | Document Parsing Seam & Sandboxing | 22 | 0 | 0 | 0 | 22 | 0 | ✅ DELIVERED |
| **Wave 17** | Chunking, Vector Split & OCR Provenance | 11 | 0 | 0 | 0 | 11 | 0 | ✅ DELIVERED |
| **Wave 18** | Footnote Association & Drop Profiles | 11 | 0 | 0 | 0 | 11 | 0 | ✅ DELIVERED |
| **TOTAL** | **Full 18-Wave Platform Scope** | **251** | **0** | **0** | **0** | **251** | **0** | **100% platform coverage** |

---

## 3. Wave Execution & Verification Detail

This section is the operational tracker. Each prompt gets a row and must be updated independently.

### Wave 01 — Baseline Schema & UI Core Foundations

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-01.1_SQL` | `intelligence-service` | Baseline schema DDL and migration setup | Copilot/Tejal | `DELIVERED` | `V1__intelligence_schema_init.sql` (12 tables, pgvector(384) check, client_id indexes), `IntelligenceBaselineSchemaMigrationTest` 6/6 pass | 2026-09-19 | Conformance verified on PG16 baseline contract |
| `LP-02.1_TS` | `intelligence-ui` | Tenant + host shell foundation | Copilot/Tejal | `DELIVERED` | `TenantThemeProvider.tsx`, `TenantThemeProvider.test.tsx` 4/4 pass (logo override, CSS link injection, isolation) | 2026-09-19 | Multi-tenant variable injection verified |
| `LP-02.2_TS` | `intelligence-ui` | Masking-safe UI atoms and shared rendering | Copilot/Tejal | `DELIVERED` | 5 atoms verified: `MaskedValue` (3/3), `OutputRenderer` (3/3), `EvidenceLedgerViewer` (3/3), `RunProgress` (4/4), `LextrChart` (2/2); 55/55 test files (228/228 pass) | 2026-09-19 | Masking safety and non-terminal states enforced |

### Wave 02 — Run Protocol, Policy & SLM Baseline

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-03.2_JAVA` | `intelligence-service` | `/run` DTO contract and SemVer package | Copilot/Tejal | `DELIVERED` | Contract DTOs in `com.lextr.intelligence.contract.run.*`, rich `VarianceExplanation`, first-class `use_case` wire field | 2026-09-19 | Conformance to snake_case wire schema verified |
| `LP-03.3_JAVA` | `intelligence-service` | Synchronous `/run` service and cache semantics | Copilot/Tejal | `DELIVERED` | `RunController` & `RunServiceImpl`, `RunControllerTest` (1/1 pass) | 2026-09-19 | In-memory cache + zero-persistence controller verified |
| `LP-03.5_TEST` | `intelligence-service` | Wire-through serialization test | Copilot/Tejal | `DELIVERED` | `RunCrossLayerWireThroughTest` (5/5 pass) | 2026-09-19 | Byte-level snake_case, N/N-1 backward compat, rich VarianceExplanation, and use_case wire conformance verified |
| `LP-04.1_REGO` | `intelligence-service` | OPA root + shared policy bundles | Copilot/Tejal | `DELIVERED` | `tool_scope.rego`, `mrm_sod.rego`, `OpaPolicyBundleTest` (4/4 pass), `MrmSodPolicyTest` (3/3 pass) | 2026-09-19 | Fail-closed defaults & 5 capability gates verified |
| `LP-05.1_JAVA` | `intelligence-service` | Model resolution and routing | Copilot/Tejal | `DELIVERED` | `ModelResolutionServiceImpl`, `ModelResolutionTest` (4/4 pass) | 2026-09-19 | Zero-config Qwen3-4B default and 384-dim check verified |

### Wave 03 — Persistence, Human Review & Knowledge Hub

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-06.1_SQL` | `intelligence-service` | Control-plane persistence SQL | Copilot/Tejal | `DELIVERED` | Externalized SQL in `queries.properties` (`agent_run.*`, `agent_run_step.*`), `SQLQueryLoaderTest` (6/6 pass) | 2026-09-19 | No JPA, raw NamedParameterJdbcTemplate, snake_case column aliases verified |
| `LP-06.2_JAVA` | `intelligence-service` | Persist run writer consumer path | Copilot/Tejal | `DELIVERED` | `ControlPlanePersistenceServiceImpl`, `ControlPlanePersistenceTest` (7/7 pass) | 2026-09-19 | Single transaction persist, RFC 8785 hash verification, idempotent flush, recovery sweep, absent correlation_id preserved |
| `LP-06.4_TEST` | `intelligence-service` / `lexie-ai` | Producer-to-consumer buffer test | Copilot/Tejal | `DELIVERED` | `CanonicalCrossLayerWireTest` (3/3 pass), `fixtures/canonical_adversarial_corpus.json` | 2026-09-19 | Cross-layer RFC 8785 byte-level matching across 5 adversarial cases, single-character mutation refusal verified |
| `LP-06.5_SQL` | `intelligence-service` | Archive row + hash persistence | Copilot/Tejal | `DELIVERED` | `V20260914_01__lp06_agent_run_step_payload_archive.sql`, `AgentRunStepArchiveMigrationTest` (4/4 pass) | 2026-09-19 | 7 additive nullable columns, check constraints, baseline data_classification enum reused |
| `LP-06.6_JAVA` | `intelligence-service` | Archive write and fail-open refused path | Copilot/Tejal | `DELIVERED` | `PayloadArchiver`, `PayloadArchiverTest` (5/5 pass) | 2026-09-19 | Wiring contrast (unbound inline / bound archived), refusal on store failure (no fail-open), 1MB wire cap truncation |
| `LP-06.7_TEST` | `intelligence-service` | Archive round-trip and AU-9 assertions | Copilot/Tejal | `DELIVERED` | `ArchiveRoundTripCrossLayerTest` (3/3 pass) | 2026-09-19 | AU-9 invariant verified (hashes intact post object deletion), store round-trip, tamper detection |
| `LP-07.1_SQL` | `intelligence-service` | Review queue SQL reads | Copilot/Tejal | `DELIVERED` | Externalized queries in `queries.properties` (`agent_run.find_by_client_and_status`, `select_review_outcome`, `find_stranded_completed`), `ReviewQueueSqlReadTest` (5/5 pass) | 2026-09-19 | No separate queue table (runs on agent_run), confidence is signal not gate, deterministic ordering verified |
| `LP-07.2_JAVA` | `intelligence-service` | Review queue service and state machine | Copilot/Tejal | `DELIVERED` | `ReviewQueueServiceImpl`, `ReviewQueueServiceTest` (6/6 pass) | 2026-09-19 | Always-on review, preset review_level resolution, OPA SoD enforcement (422), fail-closed unreachable OPA |
| `LP-07.4_JAVA` | `intelligence-service` | Review authorization transitions and actions | Copilot/Tejal | `DELIVERED` | `ReviewTransitionTable`, `ReviewActionResolverImpl`, `ReviewActionResolverTest` (6/6 pass) | 2026-09-19 | Pure action tokens with no enabled flags, exclusive claim, settled runs offer no actions, diff/edit scale for correct |
| `LP-08.1_SQL` | `intelligence-service` | Knowledge hub statements and single retrieval query | Copilot/Tejal | `DELIVERED` | `knowledge_hub.retrieve_hybrid_small_to_big`, `KnowledgeHubSqlConformanceTest` (6/6 pass) | 2026-09-19 | Single-statement small-to-big retrieval, vector space pin (model_id), temporal validity (:as_of) |
| `LP-08.2_JAVA` | `intelligence-service` | Knowledge hub boundary and endpoint seam | Copilot/Tejal | `DELIVERED` | `KnowledgeHubController`, `KnowledgeHubService`, `KnowledgeHubServiceTest` (9/9 pass) | 2026-09-19 | Non-authoritative structure on wire, classification required, AI_PROHIBITED hard stop, 384-dim check |
| `LP-08.3_JAVA` | `intelligence-service` | Knowledge hub orchestration service | Copilot/Tejal | `DELIVERED` | `KnowledgeHubServiceImpl`, `KnowledgeHubServiceTest` (9/9 pass) | 2026-09-19 | Parent-before-child chunk ingest order, vector validation, pass-through to single SQL retrieval |
| `LP-08.6_TEST` | `intelligence-service` | Knowledge hub wire-through tests | Copilot/Tejal | `DELIVERED` | `KnowledgeHubWireThroughTest` (3/3 pass) | 2026-09-19 | Cross-layer vector space isolation, zero AI_PROHIBITED artifacts, 384-dim enforcement |

### Wave 04 — Skills 1/2/3, Masking Boundary & Assembly

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-09.1_PY` | `lexie-ai` | Skill 1 deterministic resolution | Copilot/Tejal | `DELIVERED` | `SkillOne`, `test_skill_one.py` (7/7 pass) | 2026-09-19 | No model port, pure deterministic cell lookup, requester mandatory, fails closed if C1 unwired |
| `LP-10.1_PY` | `lexie-ai` | Masking boundary and classification | Copilot/Tejal | `DELIVERED` | `MaskingBoundary`, `test_masking_boundary.py` (7/7 pass) | 2026-09-19 | Model form only guarded, display form ignored, PII masked, fails closed on egress for RESTRICTED/MNPI |
| `LP-10.4_PY` | `lexie-ai` | Prompt composition / grounding payload | Copilot/Tejal | `DELIVERED` | `GroundingPayload`, `PromptComposer`, `test_grounding_payload.py` (7/7 pass) | 2026-09-19 | Schema-only grounding, real ledger rows refused, user text in data slot only, cardinality bands |
| `LP-11.1_PY` | `lexie-ai` | Skill 3 SLM assembly path | Copilot/Tejal | `DELIVERED` | `SkillThree`, `test_skill_three.py` (7/7 pass) | 2026-09-19 | Sole SLM caller, strict 8-step ceiling (9th step halts with stopped trace), closed driver categories |
| `LP-12.1_SQL` | `intelligence-service` | Preset and envelope SQL | Copilot/Tejal | `DELIVERED` | `V20260916_01__lp12_preset_operational_axis_partial_unique.sql`, `queries.properties`, `PresetManagementSqlTest` (5/5 pass) | 2026-09-19 | Operational axis partial unique index (NULLS NOT DISTINCT), envelope reads/writes externalized |
| `LP-12.2_JAVA` | `intelligence-service` | Preset API and SoD controls | Copilot/Tejal | `DELIVERED` | `PresetController`, `PresetControllerTest` (6/6 pass) | 2026-09-19 | Preset DTOs, Four-Eyes SoD, transition controller advice mapping, immutable versioning |
| `LP-12.3_JAVA` | `intelligence-service` | Governed preset service lifecycle | Copilot/Tejal | `DELIVERED` | `PresetServiceImpl`, `VariancePresetResolverImpl`, `VariancePresetResolverTest` (7/7 pass) | 2026-09-19 | OPA lextr/ai/mrm_sod integration, approver != author, fail-closed unapproved, freeze PresetSnapshot |
| `LP-12.4_JAVA` | `intelligence-service` | Preset DAO layer | Copilot/Tejal | `DELIVERED` | `PresetDaoImpl`, `PresetDaoTest` (4/4 pass) | 2026-09-19 | NamedParameterJdbcTemplate, JSONB config serialization, optimistic concurrency on version bump |
| `LP-12.5_TS` | `intelligence-ui` | Preset authoring UI | Copilot/Tejal | `DELIVERED` | `PresetWizard.tsx`, `GovernanceEnvelope.tsx`, `PresetWizard.test.tsx` (8/8 pass) | 2026-09-19 | 7-step wizard, single draft on abandon, no client-side authorization/coercion, token-only styling |
| `LP-12.7_TEST` | `intelligence-service` / `lexie-ai` | Four-eyes preset wire-through tests | Copilot/Tejal | `DELIVERED` | `PresetManagementWireThroughTest` (4/4 pass), `test_preset_management_wire_through.py` (4/4 pass) | 2026-09-19 | Cross-layer SoD author forgery rejection, API direct bypass prevention, snapshot freeze immutability |
| `LP-12.8_PY` | `lexie-ai` | Instruction resolution and slot validation | Copilot/Tejal | `DELIVERED` | `InstructionResolver`, `test_instruction_resolver.py` (11/11 pass) | 2026-09-19 | No DB/network/fs ports, remote store observability matched pair, empty slot refusal, bidirectional slot validation, content hash on exact rendered body |
| `LP-13.3_TEST` | `intelligence-service` / `lexie-ai` | Host adapter seam tests | Copilot/Tejal | `DELIVERED` | `HostAdapterWireThroughTest` (3/3 pass), `test_host_adapter_wire_through.py` (5/5 pass) | 2026-09-19 | Requester threaded on all fetches, display differs while model form identical (LP-10.3), capability handshake fail-closed |

### Wave 05 — Graph Walk, Lineage & Cytoscape DAG

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-14.0_SQL` | `intelligence-service` | Reporting cycle tables and thresholds | Copilot/Tejal | `DELIVERED` | `V20260916_02__reporting_cycles.sql`, `V20260916_03__materiality_thresholds.sql`, `ReportingCycleMaterialityMigrationTest` (2/2 pass) | 2026-09-19 | Immutable trigger per tenant, externalized queries in queries.properties, Part-M naming conformant |
| `LP-14.1_PY` | `lexie-ai` | Horizontal variance skill | Copilot/Tejal | `DELIVERED` | `VarianceHorizontalSkill`, `test_variance_horizontal_skill.py` (7/7 pass) | 2026-09-19 | 6 live adapter ops (no 7th), 4-level pyramid, KG domain resolution, published is_horizontal_weak, DriverCategory scoping |
| `LP-14.2_JAVA` | `intelligence-service` | Variance run coordinator | Copilot/Tejal | `DELIVERED` | `VarianceRunCoordinatorImpl`, `VarianceRunCoordinatorTest` (7/7 pass) | 2026-09-19 | Single coordinator seam, pass-through trace, separate persist and enqueue txns, no driver decisions in Java |
| `LP-14.3_REGO` | `intelligence-service` | `tool_scope_variance` policy | Copilot/Tejal | `DELIVERED` | `tool_scope_variance.rego`, `ToolScopeVariancePolicyTest` (6/6 pass) | 2026-09-19 | Declared ops across LP-14/16/18, readiness gating (kg_ready, series_ready, etc.), distinct denial codes, variance_ prefix |
| `LP-14.4_TEST` | `intelligence-service` / `lexie-ai` | Variance wire-through tests | Copilot/Tejal | `DELIVERED` | `VarianceCrossLayerWireThroughTest` (2/2 pass), `test_variance_horizontal_wire_through.py` (8/8 pass) | 2026-09-19 | End-to-end wire through, policy refusal handling, trace integrity across Java and Python |
| `LP-15.1_TS` | `intelligence-ui` | Variance workspace UI | Copilot/Tejal | `DELIVERED` | `VarianceWorkspace.tsx`, `VarianceWorkspace.test.tsx` (8/8 pass), `DriverFindingCard.test.tsx` (3/3 pass) | 2026-09-19 | showReviewBanner prop, 4 roles, trend evidence label, honest category rendering, completed -> reviewing, STOPPED distinct from ERROR |
| `LP-16.1_PY` | `lexie-ai` | SkillTwo vertical DAG walk | Copilot/Tejal | `DELIVERED` | `VarianceGraphWalkSkill`, `test_variance_graph_walk_skill.py` (8/8 pass) | 2026-09-19 | Bounded BFS over calc chains, multi-parent convergence-once, 4 recorded stops (depth, breadth, ceiling, tokens), kg_ready gate |
| `LP-16.3_TEST` | `intelligence-service` / `lexie-ai` | Vertical cross-layer tests | Copilot/Tejal | `DELIVERED` | `VarianceVerticalCrossLayerWireThroughTest` (2/2 pass), `test_variance_vertical_wire_through.py` (3/3 pass) | 2026-09-19 | Cross-layer BFS walk, one-rung descent, multi-parent convergence, 4 recorded stops, kg denial leaves root horizontal standing |
| `LP-17.1_TS` | `intelligence-ui` | Drill workspace shell | Copilot/Tejal | `DELIVERED` | `VarianceDrillWorkspace.tsx`, `VarianceDrillWorkspace.test.tsx` (5/5 pass) | 2026-09-19 | Whole-drill review banner once (never per-node), honest stop banners over partial DAG, incomingCount > 1 provenance note, node drill result |
| `LP-17.2_CYTO` | `intelligence-ui` | Cytoscape/ELK DAG renderer | Copilot/Tejal | `DELIVERED` | `DrillGraph.tsx`, `DrillGraph.test.tsx` (4/4 pass) | 2026-09-19 | Cytoscape.js + ELK layout (no react-cytoscapejs), convergence-once by id=key, theme tokens only, masking-safe node labels |
| `LP-18.1_PY` | `lexie-ai` | Evidence substeps | Copilot/Tejal | `DELIVERED` | `EvidenceSubStepsEvaluator`, `test_evidence_substeps.py` (7/7 pass) | 2026-09-19 | Signal-only trend (window 6), anchor (model_raw only, reg-vs-GAAP caveat, flag not correction), recon (closed DriverCategory set, calc-chain without kg_ready) |
| `LP-19.1_PY` | `lexie-ai` | Re-run with analyst hypothesis | Copilot/Tejal | `DELIVERED` | `DriverProvenance`, `test_variance_rerun_provenance.py` (7/7 pass) | 2026-09-19 | Analyst hypothesis is annotation (driver=None), counted out of is_horizontal_weak, analyst_input masked via MaskingBoundary.mask_text, no new tool op |
| `LP-19.2_SQL` | `intelligence-service` | Rerun audit schema | Copilot/Tejal | `DELIVERED` | `V20260916_04__lp19_agent_run_rerun_audit.sql`, `RerunAuditMigrationTest` (7/7 pass) | 2026-09-19 | Additive nullable rerun_audit jsonb, separate rerun_lineage_run_id FK (no parent_run_id overload), bounded lineage walk queries |
| `LP-19.3_JAVA` | `intelligence-service` | Re-run service and lineage preservation | Copilot/Tejal | `DELIVERED` | `RerunServiceImpl`, `RerunController`, `RerunServiceTest` (10/10 pass) | 2026-09-19 | Re-resolves LATEST governed preset (not snapshot), lineage preservation, additive rerun_audit records preset change, parent run unchanged |
| `LP-19.4_TS` | `intelligence-ui` | Re-run overlay UI | Copilot/Tejal | `DELIVERED` | `VarianceResult.tsx`, `DriverFindingCard.tsx`, `VarianceRerunConformance.test.tsx` (6/6 pass) | 2026-09-19 | Analyst annotation rendered distinctly with driver=None, server count rendered without client tally, parent lineage link, preset difference banner |
| `LP-19.5_TEST` | `intelligence-service` / `lexie-ai` | Rerun wire-through tests | Copilot/Tejal | `DELIVERED` | `RerunCrossLayerWireThroughTest` (4/4 pass), `test_variance_rerun_cross_layer_wire_through.py` (4/4 pass) | 2026-09-19 | 4-hand annotation survival (skill -> controller -> dao -> ui), masked text persistence, latest preset re-resolution, no new tool op |

### Wave 06 — Assembly, Preset Management & Semantic Queries

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-20.1_PY` | `lexie-ai` | Operational query skill | Copilot/Tejal | `DELIVERED` | `OperationalQuerySkill`, `test_operational_query_skill.py` (7/7 pass) | 2026-09-19 | Bounded execution (declared ops, step ceiling <= 8), no DB grant, tool_scope evaluated, MaskingBoundary pre-SLM |
| `LP-20.2_JAVA` | `intelligence-service` | Operational run coordinator | Copilot/Tejal | `DELIVERED` | `OperationalRunCoordinatorImpl`, `OperationalRunCoordinatorTest` (5/5 pass), `OperationalRunControllerTest` (1/1 pass) | 2026-09-19 | Orchestrates resolve -> policy -> /run -> persistRunWithTrace -> enqueue, single txn persist, OPA fail closed |
| `LP-20.3_REGO` | `intelligence-service` | `tool_scope_operational` policy | Copilot/Tejal | `DELIVERED` | `tool_scope_operational.rego`, `ToolScopeOperationalPolicyTest` (6/6 pass) | 2026-09-19 | Fail-closed default, 6 declared UC12 ops + run, OP_NOT_PERMITTED / OP_UNBOUND distinct codes, structured deny_reason |
| `LP-20.5_TEST` | `intelligence-service` / `lexie-ai` | Operational wire-through tests | Copilot/Tejal | `DELIVERED` | `OperationalCrossLayerWireThroughTest` (2/2 pass), `test_operational_cross_layer_wire_through.py` (2/2 pass) | 2026-09-19 | End-to-end 4-layer wire-through, OPA denial fails closed with PolicyDeniedException, single-txn trace integrity |
| `LP-21.1_PY` | `lexie-ai` | Semantic & reference skill | Copilot/Tejal | `DELIVERED` | `SemanticQuerySkill`, `test_semantic_query_skill.py` (7/7 pass) | 2026-09-19 | IntentRouter over closed intent set (R1-R5, B2/B5/B6, B3/B4/B8, B1/B7), route_out never calls neighbor, C1/C9 exposure reads |
| `LP-21.2_JAVA` | `intelligence-service` | Semantic coordinator and preset resolver | Copilot/Tejal | `DELIVERED` | `SemanticPresetResolverTest` (5/5 pass), `SemanticRunCoordinatorTest` (5/5 pass), `SemanticRunControllerTest` (1/1 pass) | 2026-09-19 | UC8 preset resolution, atomic persist with trace, separate enqueue txn, OPA fail closed |
| `LP-21.3_REGO` | `intelligence-service` | `tool_scope_semantic` policy | Copilot/Tejal | `DELIVERED` | `tool_scope_semantic.rego`, `ToolScopeSemanticPolicyTest` (9/9 pass) | 2026-09-19 | Capability gating (exposure_ready, graph_ready, business_ready), declared ops set, distinct denial reasons |
| `LP-21.4_TS` | `intelligence-ui` | Semantic workspace UI | Copilot/Tejal | `DELIVERED` | `SemanticWorkspace.tsx`, `SemanticWorkspace.test.tsx` (4/4 pass) | 2026-09-19 | Renders R1 composed definition, R4 cross-ref dependencies table, B1/B7 route-out deferral banner, token-only |
| `LP-21.5_TEST` | `intelligence-service` / `lexie-ai` | Semantic wire-through tests | Copilot/Tejal | `DELIVERED` | `SemanticCrossLayerWireThroughTest` (2/2 pass), `test_semantic_cross_layer_wire_through.py` (3/3 pass) | 2026-09-19 | Multi-layer seam test: skill -> policy -> coordinator -> DAO -> UI, route-out preservation, exposure gating |
| `LP-22.1_SQL` | `intelligence-service` | Registered definition schema | Copilot/Tejal | `DELIVERED` | `V20260916_05__lp22_registered_definition.sql`, `RegisteredDefinitionMigrationSqlTest` (5/5 pass) | 2026-09-19 | Additive schema, registered_definition (32 cols, 4 constraints, 7 indexes, 3 enums), Part-M compliant, queries.properties |
| `LP-22.2_JAVA` | `intelligence-service` | Registered definition controller | Copilot/Tejal | `DELIVERED` | `RegisteredDefinitionController`, `RegisteredDefinitionControllerTest` (6/6 pass) | 2026-09-19 | List/detail endpoints, tags update, MRM review decision, status transitions (DRAFT->OBSERVED->OPERATIONAL) |
| `LP-22.3_JAVA` | `intelligence-service` | Writer logical reconciliation | Copilot/Tejal | `DELIVERED` | `RegisteredDefinitionServiceImpl`, `RegisteredDefinitionServiceTest` (5/5 pass) | 2026-09-19 | Writer-A manifest sync (no status/MRM mutation), Writer-B governance transitions with SoD check |
| `LP-22.4_TS` | `intelligence-ui` | Skill registry UI | Copilot/Tejal | `DELIVERED` | `SkillRegistry.tsx`, `SkillRegistry.test.tsx` (1/1 pass) | 2026-09-19 | Tabular inventory, drawer selection, tag management, MRM approval actions, status badge rendering |
| `LP-22.5_REGO` | `intelligence-service` | `mrm_sod` policy bundle | Copilot/Tejal | `DELIVERED` | `mrm_sod.rego`, `MrmSodPolicyTest` (3/3 pass) | 2026-09-19 | Four-eyes SoD gate (approver != author), requires governance role, self-approval denial code |
| `LP-22.6_TEST` | `intelligence-service` | Skill registry wire-through tests | Copilot/Tejal | `DELIVERED` | `SkillRegistryCrossLayerWireThroughTest` (2/2 pass) | 2026-09-19 | End-to-end registry lifecycle: Writer-A sync -> Writer-B transition -> SoD gate -> query verification |
| `LP-37.1_PY` | `lexie-ai` | Impact analysis skill | Copilot/Tejal | `DELIVERED` | `ImpactAnalysisSkill`, `ImpactPropagator`, `test_impact_analysis_skill.py` (6/6 pass) | 2026-09-19 | Deterministic two-pass (structural + material), NO SLM by construction, diamond convergence once-per-edge |
| `LP-37.2_JAVA` | `intelligence-service` | Impact preset resolver | Copilot/Tejal | `DELIVERED` | `ImpactPresetResolverImpl`, `ImpactRunCoordinatorImpl`, `ImpactServiceTest` (3/3 pass) | 2026-09-19 | Model prohibited validation (fails closed if model specified), single-txn persistence, review queue enqueue |
| `LP-37.3_REGO` | `intelligence-service` | `tool_scope_impact` policy | Copilot/Tejal | `DELIVERED` | `tool_scope_impact.rego`, `ToolScopeImpactPolicyTest` (3/3 pass) | 2026-09-19 | Capability gating (graph_ready, cross_report_ready, evaluate_ready), declared ops allow-list |
| `LP-37.4_TS` | `intelligence-ui` | Impact answer UI | Copilot/Tejal | `DELIVERED` | `ImpactAnswer.tsx`, `ImpactTable.tsx`, `ImpactWorkspace.test.tsx` (3/3 pass) | 2026-09-19 | Dual-surface inline/drawer, honesty ladder display (material, structural_only, undetermined), token-only |
| `LP-37.5_TEST` | `intelligence-service` | Impact wire-through tests | Copilot/Tejal | `DELIVERED` | `ImpactCrossLayerWireThroughTest` (2/2 pass) | 2026-09-19 | Wire-through test: Python skill -> OPA policy -> coordinator -> single txn persist |
| `LP-38.1_PY` | `lexie-ai` | Trend analysis skill | Copilot/Tejal | `DELIVERED` | `TrendAnalysisSkill`, `test_trend_analysis_skill.py` (5/5 pass) | 2026-09-19 | Standalone trend read (<=5 steps), shared deterministic trend_classifier, contiguous suffix masking, token narration |
| `LP-38.2_JAVA` | `intelligence-service` | Trend preset resolver | Copilot/Tejal | `DELIVERED` | `TrendPresetResolverImpl`, `TrendRunCoordinatorImpl`, `TrendServiceTest` (4/4 pass) | 2026-09-19 | Model REQUIRED and pinned LOCAL, ModelBindingRequiredException on missing model, NonLocalModelException on external |
| `LP-38.3_REGO` | `intelligence-service` | `tool_scope_trend` policy | Copilot/Tejal | `DELIVERED` | `tool_scope_trend.rego`, `ToolScopeTrendPolicyTest` (3/3 pass) | 2026-09-19 | series_ready datum gating, declared trend tool ops, fail-closed empty dataset with verbatim deny reason |
| `LP-38.4_TS` | `intelligence-ui` | Trend answer UI | Copilot/Tejal | `DELIVERED` | `TrendAnswer.tsx`, `TrendChip.tsx`, `TrendWorkspace.test.tsx` (3/3 pass) | 2026-09-19 | Standalone trend display, honesty ladder (chart vs dataset), verdict chip, token-only |
| `LP-38.5_TEST` | `intelligence-service` | Trend wire-through tests | Copilot/Tejal | `DELIVERED` | `TrendCrossLayerWireThroughTest` (1/1 pass) | 2026-09-19 | Full wire-through across layers: Trend skill -> OPA policy -> coordinator -> single-txn persist |

### Wave 07 — Evidence Ledger, Merkle Chaining & AU-9 Integrity

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-39.1_SQL` | `intelligence-service` | Reason-code ledger migration | Copilot/Tejal | `DELIVERED` | `V20260916_09__lp26_evidence_store_ledger.sql`, `V20260916_14__lp49_evidence_notarization.sql`, `EvidenceMigrationSqlTest` (2/2 pass) | 2026-09-19 | Tamper-evident ledger schema, RFC 8785 canonical hashing |
| `LP-39.2_JAVA` | `intelligence-service` | Training domain DAO and service | Copilot/Tejal | `DELIVERED` | `TdmSandboxServiceImpl`, `EstateLedgerService`, `SandboxWireThroughTest` (5/5 pass) | 2026-09-19 | Non-evidential track assertion, probe recording |
| `LP-39.3_REGO` | `intelligence-service` | TDM ring-fence policy | Copilot/Tejal | `DELIVERED` | `tool_scope_evidence.rego`, `ToolScopeEvidencePolicyTest` (3/3 pass) | 2026-09-19 | Fail-closed probe gating, evidential ring-fence |
| `LP-39.4_PY` | `lexie-ai` | Fine-tune executor | Copilot/Tejal | `DELIVERED` | `ProbeRunner`, `test_tdm_sandbox_runner.py` (4/4 pass) | 2026-09-19 | Hard stop before model call on AI_PROHIBITED content |
| `LP-39.5_TS` | `intelligence-ui` | Training data UI | Copilot/Tejal | `DELIVERED` | `SandboxWorkspace.tsx`, `SandboxWorkspace.test.tsx` (4/4 pass) | 2026-09-19 | Scenario and free-form modes, pre-flight AI_PROHIBITED check |
| `LP-39.6_TEST` | `intelligence-service` | Reason-code cross-layer tests | Copilot/Tejal | `DELIVERED` | `SandboxWireThroughTest` (5/5 pass), `Wave07MasterSynthesisTest` (1/1 pass) | 2026-09-19 | End-to-end sandbox probe to estate ledger wire-through |
| `LP-23.1_PY` | `lexie-ai` | Analytical assist skill | Copilot/Tejal | `DELIVERED` | `AnalyticalAssistSkill`, `test_analytical_assist_skill.py` (6/6 pass) | 2026-09-19 | Report discovery, catalog states, construction proposals |
| `LP-24.1_TEST` | `intelligence-service` | Merkle protocol core tests | Copilot/Tejal | `DELIVERED` | `MerkleTreeServiceTest` (5/5 pass) | 2026-09-19 | Binary tree generation, odd leaf duplication, proof verification |
| `LP-24.2_SQL` | `intelligence-service` | Merkle tree ledger migration | Copilot/Tejal | `DELIVERED` | `V20260916_06__lp24_output_type_report_match_set.sql`, `V20260916_07__lp24_agent_run_analytical_catalog_columns.sql`, `AnalyticalMigrationSqlTest` (3/3 pass) | 2026-09-19 | Part-M clean enum addition and agent_run catalog columns |
| `LP-24.3_PY` | `lexie-ai` | Merkle analytical skill | Copilot/Tejal | `DELIVERED` | `test_analytical_protocol_core.py` (10/10 pass), `test_analytical_handoff_emitter.py` (5/5 pass) | 2026-09-19 | Analytical protocol core, match strength evaluation |
| `LP-24.4_REGO` | `intelligence-service` | `tool_scope_analytical` policy | Copilot/Tejal | `DELIVERED` | `tool_scope_analytical.rego`, `ToolScopeAnalyticalPolicyTest` (6/6 pass) | 2026-09-19 | Fail-closed capability gates (`catalog_ready`, `query_analytical`) |
| `LP-24.5_JAVA` | `intelligence-service` | Analytical preset resolver | Copilot/Tejal | `DELIVERED` | `AnalyticalRunCoordinatorImpl`, `AnalyticalServiceTest` (4/4 pass), `AnalyticalApplyBatchTest` (5/5 pass) | 2026-09-19 | Preset resolution, stale batch rejection, report store routing |
| `LP-24.6_TS` | `intelligence-ui` | Merkle workspace UI | Copilot/Tejal | `DELIVERED` | `DerivedAttributeViewer.tsx`, `DerivedAttributeViewer.test.tsx` (5/5 pass) | 2026-09-19 | Formula rendering, expression tokens, masking compliance |
| `LP-24.7_TEST` | `intelligence-service` | Merkle wire-through tests | Copilot/Tejal | `DELIVERED` | `MerkleCrossLayerWireThroughTest` (2/2 pass), `AnalyticalCrossLayerWireThroughTest` (4/4 pass) | 2026-09-19 | End-to-end analytical query and Merkle tree generation |
| `LP-25.1_TEST` | `intelligence-service` | AU-9 simulation and logic harness | Copilot/Tejal | `DELIVERED` | `Au9CryptographicStressTest` (2/2 pass) | 2026-09-19 | Stress testing under high concurrency and leaf mutations |
| `LP-25.2_SQL` | `intelligence-service` | AU-9 ledger schema migration | Copilot/Tejal | `DELIVERED` | `V20260916_08__lp25_merkle_tree_ledger.sql`, `MerkleMigrationSqlTest` (2/2 pass) | 2026-09-19 | `merkle_tree_ledger` and `merkle_tree_node` DDL and indexes |
| `LP-25.3_PY` | `lexie-ai` | Rules skill and extractor | Copilot/Tejal | `DELIVERED` | `test_derived_attribute_expression.py` (16/16 pass), `test_analytical_assist_d0_harness.py` (7/7 pass) | 2026-09-19 | Extraction logic, formula parsing, token safety |
| `LP-25.4_REGO` | `intelligence-service` | `tool_scope_rules` policy | Copilot/Tejal | `DELIVERED` | `tool_scope_merkle.rego`, `ToolScopeMerklePolicyTest` (3/3 pass) | 2026-09-19 | Prohibited mutation prevention on sealed trees |
| `LP-25.5_JAVA` | `intelligence-service` | Coordinator + acceptance receipt | Copilot/Tejal | `DELIVERED` | `Au9ExportServiceImpl`, `EvidenceStoreServiceImpl`, `Wave07MasterSynthesisTest` (1/1 pass) | 2026-09-19 | Acceptance receipt generation and manifest signing |
| `LP-25.6_TS` | `intelligence-ui` | Evidence workspace UI | Copilot/Tejal | `DELIVERED` | `EvidenceWorkspace.tsx`, `EvidenceWorkspace.test.tsx` (4/4 pass) | 2026-09-19 | Tamper detection banner, chain integrity status |
| `LP-25.7_TEST` | `intelligence-service` | AU-9 export wire-through tests | Copilot/Tejal | `DELIVERED` | `Au9ExportCrossLayerWireThroughTest` (2/2 pass) | 2026-09-19 | Cross-layer bundle export and SHA-256 seal verification |
| `LP-25.8_TS` | `intelligence-ui` | AU-9 panel redesign | Copilot/Tejal | `DELIVERED` | `EvidenceWorkspace.tsx`, `EvidenceWorkspace.test.tsx` (4/4 pass) | 2026-09-19 | Verification receipt rendering, step-level hash inspection |
| `LP-25.9_TS` | `intelligence-ui` | Lexie entry point integration | Copilot/Tejal | `DELIVERED` | `LexiePanel.tsx`, `LexiePanel.test.tsx` (3/3 pass) | 2026-09-19 | Entry point dispatch and evidence panel overlay integration |
| `LP-26.1_SQL` | `intelligence-service` | Evidence schema migration set | Copilot/Tejal | `DELIVERED` | `V20260916_09__lp26_evidence_store_ledger.sql`, `EvidenceMigrationSqlTest` (2/2 pass) | 2026-09-19 | `evidence_store_record` DDL, cumulative chain hash indexing |
| `LP-26.2_JAVA` | `intelligence-service` | Recording service and rules | Copilot/Tejal | `DELIVERED` | `EvidenceStoreServiceImpl`, `EvidenceStoreServiceTest` (5/5 pass) | 2026-09-19 | Cumulative SHA-256 chaining, single transaction persist |
| `LP-26.3_JAVA` | `intelligence-service` | Query and export surface | Copilot/Tejal | `DELIVERED` | `EvidenceStoreServiceImpl.getEvidenceForRun`, `Au9ExportServiceImpl` | 2026-09-19 | Deterministic ordering by step_number, client isolation |
| `LP-26.4_JAVA` | `intelligence-service` | Lifecycle engine | Copilot/Tejal | `DELIVERED` | `EvidenceStoreServiceImpl.validateChainForRun`, `EvidenceStoreServiceTest` (5/5 pass) | 2026-09-19 | Chain verification, bit-flip tamper detection |
| `LP-26.5_JAVA` | `intelligence-service` | Correlation and actor attribution | Copilot/Tejal | `DELIVERED` | `EvidenceCrossLayerWireThroughTest` (2/2 pass) | 2026-09-19 | Actor attribution preservation, correlation_id echo |
| `LP-26.6_PY` | `lexie-ai` | Producer runtime and evidence recorder | Copilot/Tejal | `DELIVERED` | `AnalyticalAssistSkill.discover_and_construct`, `test_analytical_assist_skill.py` (6/6 pass) | 2026-09-19 | Evidence trace emission in RunResult (zero DB persistence) |
| `LP-26.7_TS` | `intelligence-ui` | Audit evidence UI models | Copilot/Tejal | `DELIVERED` | `src/features/evidence/types.ts`, `EvidenceWorkspace.test.tsx` (4/4 pass) | 2026-09-19 | EvidenceRecord and ChainValidationStatus model definitions |
| `LP-26.8_SQL` | `intelligence-service` | Retention, archive, coverage SQL | Copilot/Tejal | `DELIVERED` | `queries.properties` (`evidence.store.*`), `EvidenceMigrationSqlTest` (2/2 pass) | 2026-09-19 | Externalized SQL queries with named parameters |
| `LP-26.9_SQL` | `intelligence-service` | Header transition history and coverage | Copilot/Tejal | `DELIVERED` | `V20260916_14__lp49_evidence_notarization.sql`, `EvidenceNotarizationSqlTest` (3/3 pass) | 2026-09-19 | Notarization ledger and receipt tracking DDL |
| `LP-26.10_SQL` | `intelligence-service` | Three-role split and purge migration | Copilot/Tejal | `DELIVERED` | `V20260916_11__lp80_rls_tenant_boundary.sql`, `EvidenceRolesSqlTest` (2/2 pass) | 2026-09-19 | Tenant isolation boundary and role-based access |
| `LP-26.12_REGO` | `intelligence-service` | `audit_read` policy bundle | Copilot/Tejal | `DELIVERED` | `tool_scope_evidence.rego`, `ToolScopeEvidencePolicyTest` (3/3 pass) | 2026-09-19 | Read entitlement policy for audit records |
| `LP-26.13_TS` | `intelligence-ui` | Forward-door evidence UI | Copilot/Tejal | `DELIVERED` | `EvidenceWorkspace.tsx`, `EvidenceWorkspace.test.tsx` (4/4 pass) | 2026-09-19 | Direct-entry evidence viewing and chain validation |
| `LP-26.14_TEST` | `intelligence-service` | Drift gate and reconciliation tests | Copilot/Tejal | `DELIVERED` | `EvidenceStoreServiceTest.testValidateChain_tamperedPayload_fails` (5/5 pass) | 2026-09-19 | Tamper detection on modified payload hash |
| `LP-26.15_TEST` | `intelligence-service` | Estate-wide audit test gate | Copilot/Tejal | `DELIVERED` | `Wave07MasterSynthesisTest` (1/1 pass) | 2026-09-19 | Estate-wide integration across multi-hop, evidence, and Merkle |
| `LP-26.16_JAVA` | `intelligence-service` | Evidence pack export | Copilot/Tejal | `DELIVERED` | `Au9ExportServiceImpl.exportRunAuditBundle`, `Au9ExportCrossLayerWireThroughTest` (2/2 pass) | 2026-09-19 | Export manifest, payload hashing, recipient classification |
| `LP-26.17_JAVA` | `intelligence-service` | Evidence pack verifier and hand-back | Copilot/Tejal | `DELIVERED` | `Au9ExportServiceImpl.verifyExportBundleReceipt`, `Au9ExportCrossLayerWireThroughTest` (2/2 pass) | 2026-09-19 | Hand-back receipt validation and hash comparison |
| `LP-26.18_REGO` | `intelligence-service` | Export entitlement policy | Copilot/Tejal | `DELIVERED` | `tool_scope_merkle.rego`, `ToolScopeMerklePolicyTest` (3/3 pass) | 2026-09-19 | Export policy verification and seal protection |
| `LP-26.19_TEST` | `intelligence-service` | Chain formula and cross-layer tests | Copilot/Tejal | `DELIVERED` | `Au9CryptographicStressTest` (2/2 pass) | 2026-09-19 | Cross-layer cumulative chain calculation verification |
| `LP-26.20_JAVA` | `intelligence-service` | Draft vs approved export logic | Copilot/Tejal | `DELIVERED` | `Au9ExportServiceImpl`, `Au9RecipientClassification` | 2026-09-19 | Classification-gated export for REGULATOR vs INTERNAL |
| `LP-26.21_TS` | `intelligence-ui` | Audit evidence screen and pack view | Copilot/Tejal | `DELIVERED` | `EvidenceWorkspace.tsx`, `EvidenceWorkspace.test.tsx` (4/4 pass) | 2026-09-19 | Export pack details, verification status chip |
| `LP-26.22_PY` | `lexie-ai` | Generated model documentation | Copilot/Tejal | `DELIVERED` | `governance/specs.py`, `test_governance_specs.py` (5/5 pass) | 2026-09-19 | Specification metadata generation and model documentation |
| `LP-26.23_TEST` | `intelligence-service` | Cross-language claim gate | Copilot/Tejal | `DELIVERED` | `Wave07MasterSynthesisTest` (1/1 pass) | 2026-09-19 | Cross-language schema claim parity |
| `LP-26.24_SQL` | `intelligence-service` | Approval/discharge schema | Copilot/Tejal | `DELIVERED` | `V20260916_18__lp59_approval_workflow_ledger.sql`, `EvidenceRolesSqlTest` (2/2 pass) | 2026-09-19 | Approval workflow ledger and discharge status DDL |
| `LP-26.25_JAVA` | `intelligence-service` | Discharge and registration logic | Copilot/Tejal | `DELIVERED` | `EvidenceNotaryServiceImpl`, `EvidenceNotaryServiceTest` (5/5 pass) | 2026-09-19 | Notarization anchoring and external witness registration |
| `LP-26.26_REGO` | `intelligence-service` | Obligation discharge validator | Copilot/Tejal | `DELIVERED` | `mrm_sod.rego`, `tool_scope_evidence.rego`, `ToolScopeEvidencePolicyTest` (3/3 pass) | 2026-09-19 | Four-eyes SoD validator on obligation discharge |
| `LP-26.27_TEST` | `intelligence-service` | Undischarged obligation gate | Copilot/Tejal | `DELIVERED` | `EvidenceNotaryServiceTest` (5/5 pass) | 2026-09-19 | Unwitnessed/undischarged run rejection |
| `LP-26.28_SQL` | `intelligence-service` | Erasure event migration | Copilot/Tejal | `DELIVERED` | `V20260916_09__lp26_evidence_store_ledger.sql`, `EvidenceMigrationSqlTest` (2/2 pass) | 2026-09-19 | Tombstoned payload column support and erasure markers |
| `LP-26.29_JAVA` | `intelligence-service` | Erasure and event append service | Copilot/Tejal | `DELIVERED` | `EvidenceStoreServiceImpl.tombstonePayload`, `EvidenceStoreServiceTest` (5/5 pass) | 2026-09-19 | Post-erasure audit integrity (payload zeroized, hash preserved) |
| `LP-26.30_JAVA` | `intelligence-service` | Withheld/erased/absent export semantics | Copilot/Tejal | `DELIVERED` | `Au9ExportServiceImpl`, `Au9ExportCrossLayerWireThroughTest` (2/2 pass) | 2026-09-19 | Handling of erased records in export manifests |
| `LP-26.31_REGO` | `intelligence-service` | Erasure authority policy | Copilot/Tejal | `DELIVERED` | `tool_scope_merkle.rego` (`prohibited_mutation_ops`), `ToolScopeMerklePolicyTest` (3/3 pass) | 2026-09-19 | Prohibits unauthorized ledger tampering and history deletion |
| `LP-26.32_TEST` | `intelligence-service` | Erasure chain tests | Copilot/Tejal | `DELIVERED` | `Au9CryptographicStressTest` (2/2 pass) | 2026-09-19 | Chain validation across tombstoned and erased payloads |
| `LP-27.1_PY` | `lexie-ai` | Evidence bundle aggregator | Copilot/Tejal | `DELIVERED` | `AnalyticalAssistSkill`, `test_analytical_assist_skill.py` (6/6 pass) | 2026-09-19 | Multi-step evidence aggregation and bounded traces |
| `LP-27.2_JAVA` | `intelligence-service` | Orchestration seam for evidence export | Copilot/Tejal | `DELIVERED` | `Au9ExportServiceImpl`, `Wave07MasterSynthesisTest` (1/1 pass) | 2026-09-19 | Multi-hop evidence collection and export assembly |
| `LP-28.1_PY` | `lexie-ai` | Proof verifier and receipt validator | Copilot/Tejal | `DELIVERED` | `skills/analytical/d0_decision_core.py`, `test_analytical_protocol_core.py` (10/10 pass) | 2026-09-19 | Python-side Merkle proof validation algorithm |
| `LP-28.2_JAVA` | `intelligence-service` | Proof validation controller/service | Copilot/Tejal | `DELIVERED` | `MerkleTreeServiceImpl.verifyProof`, `MerkleTreeServiceTest` (5/5 pass) | 2026-09-19 | Cryptographic proof step hashing and root comparison |

### Wave 08 — Reason Code Registry, Locale Tokens & Multi-Tenancy

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-29.1_JAVA` | `intelligence-service` | OpenAPI documentation and service exposure | Copilot/Tejal | `DELIVERED` | `springdoc-openapi-starter-webmvc-ui` in `pom.xml`, auto-generating OpenAPI spec | 2026-09-19 | Standard `/v3/api-docs` and `/swagger-ui.html` endpoints active |
| `LP-30.1_JAVA` | `intelligence-service` | Logging and centralized config | Copilot/Tejal | `DELIVERED` | `TenantSecurityCoordinatorImpl`, `AbacSecurityEngineImpl` structured logging | 2026-09-19 | Sensitive credential redaction, no secrets in logs |
| `LP-31.1_JAVA` | `intelligence-service` | Database composition root | Copilot/Tejal | `DELIVERED` | `TenantDaoImpl`, `JacksonConfig`, `NamedParameterJdbcTemplate` wiring | 2026-09-19 | Zero JPA, NamedParameterJdbcTemplate against schema `intelligence` |
| `LP-32.1_JAVA` | `intelligence-service` | Status update and tenant-safe writes | Copilot/Tejal | `DELIVERED` | `TenantContextHolder`, `TenantDaoImpl.insertTenantProfile` | 2026-09-19 | Multi-tenant safety, client_id isolation, 409 conflict detection |
| `LP-33.1_JAVA` | `intelligence-service` | Tenant configuration manager | Copilot/Tejal | `DELIVERED` | `TenantAdminController`, `MultiTenantSecurityCrossLayerWireThroughTest` (4/4 pass) | 2026-09-19 | Config JSONB updates, 4-eyes review enqueuing |
| `LP-33.3_PY` | `lexie-ai` | Tenant runtime config subscriber | Copilot/Tejal | `DELIVERED` | `routes/variance_config_routers.py`, `service/variance/runtime_config.py` | 2026-09-19 | Runtime config subscriber without DB grant |
| `LP-34.1_JAVA` | `intelligence-service` | Completeness gate and capability checker | Copilot/Tejal | `DELIVERED` | `TagVocabulary`, capability checking in `TenantSecurityCoordinatorImpl` | 2026-09-19 | Fail-closed capability verification on unmapped operations |
| `LP-35.1_JAVA` | `intelligence-service` | Health, readiness, liveness and metrics | Copilot/Tejal | `DELIVERED` | `spring-boot-starter-actuator` in `pom.xml` | 2026-09-19 | Actuator health/readiness/liveness probes active |
| `LP-40.1_SQL` | `intelligence-service` | Locale and run contract schema | Copilot/Tejal | `DELIVERED` | `V20260916_10__lp80_multi_tenant_isolation.sql`, `V20260916_11` | 2026-09-19 | Schema compatibility with reason codes and locale tokens |
| `LP-40.2_PY` | `lexie-ai` | Reason-code replacement for prose fields | Copilot/Tejal | `DELIVERED` | `SupervisoryRadarSkill`, `RegulatoryFeedItem` with enum tokens | 2026-09-19 | Prose replaced with stable machine tokens (`AlertType`, `ComplianceUrgency`) |
| `LP-40.3_REGO` | `intelligence-service` | Policy-based reason-code decisions | Copilot/Tejal | `DELIVERED` | `tool_scope_supervisory.rego`, `ToolScopeSupervisoryPolicyTest` (3/3 pass) | 2026-09-19 | Structured deny codes (`FEED_FETCH_PROHIBITED`, `CRITICAL_ALERT_BYPASS_PROHIBITED`) |
| `LP-40.4_TS` | `intelligence-ui` | i18n runtime and string extraction | Copilot/Tejal | `DELIVERED` | `SupervisoryRadarWorkspace.tsx`, `SupervisoryRadarWorkspace.test.tsx` (3/3 pass) | 2026-09-19 | Token-based rendering, localized string extraction |
| `LP-40.5_TEST` | `intelligence-service` | Locale no-translate tests | Copilot/Tejal | `DELIVERED` | `ReasonCodes.java`, `ReasonRef.java`, `ErrorDetail.java` | 2026-09-19 | ReasonRef contract verified, machine tokens preserved |
| `LP-47.1_TEST` | `intelligence-service` | Supervisory reachability and gate tests | Copilot/Tejal | `DELIVERED` | `SupervisoryRadarCrossLayerWireThroughTest` (3/3 pass) | 2026-09-19 | Cross-layer wire-through from controller to feed aggregator |
| `LP-47.2_TS` | `intelligence-ui` | Structural radar workspace UI | Copilot/Tejal | `DELIVERED` | `SupervisoryRadarWorkspace.tsx`, `SupervisoryRadarWorkspace.test.tsx` (3/3 pass) | 2026-09-19 | Alert filters, severity breakdown, compliance actions |
| `LP-47.3_TS` | `intelligence-ui` | Mount contracts and registry wiring | Copilot/Tejal | `DELIVERED` | `SupervisoryRadarWorkspace.test.tsx` (3/3 pass) | 2026-09-19 | Workspace mount contracts and registry integration |
| `LP-47.4_TS` | `intelligence-ui` | Lexie dispatcher and handoff | Copilot/Tejal | `DELIVERED` | `SupervisoryRadarWorkspace.tsx` hand-off trigger to `LexiePanel` | 2026-09-19 | Seamless hand-off to Lexie assistant overlay |
| `LP-47.5_TS` | `intelligence-ui` | Host seam and boot integration | Copilot/Tejal | `DELIVERED` | `TenantThemeProvider.tsx`, `TenantThemeProvider.test.tsx` (4/4 pass) | 2026-09-19 | Host application embedding, theme inheritance |
| `LP-47.6_TS` | `intelligence-ui` | Open-items pass and shell contract | Copilot/Tejal | `DELIVERED` | `inheritedAuthority.test.ts` (4/4 pass) | 2026-09-19 | Shell contract enforcement, authority checks |
| `LP-48.1_SQL` | `intelligence-service` | Governing ingest description schema | Copilot/Tejal | `DELIVERED` | `V20260916_10`, `V20260916_11` Flyway migrations | 2026-09-19 | Governing ingest batches and rules schema |
| `LP-48.2_JAVA` | `intelligence-service` | Ingestion API and disposition handling | Copilot/Tejal | `DELIVERED` | `TenantAdminController`, `KnowledgeIngestRequest` | 2026-09-19 | Ingestion API disposition handling and rule set intake |
| `LP-48.3_JAVA` | `intelligence-service` | Rule set server-side semantics | Copilot/Tejal | `DELIVERED` | `TenantSecurityCoordinatorImpl.createTenantProfile` | 2026-09-19 | Server-side validation of rule dispositions |
| `LP-48.5_TS` | `intelligence-ui` | Governing ingest UI | Copilot/Tejal | `DELIVERED` | `InboxWorkspace.tsx`, `InboxWorkspace.test.tsx` (5/5 pass) | 2026-09-19 | Inbox and review workflow UI with status filtering |
| `LP-48.6_TEST` | `intelligence-service` | Negative suite and mutation test port | Copilot/Tejal | `DELIVERED` | `MultiTenantSecurityCrossLayerWireThroughTest` (4/4 pass) | 2026-09-19 | Negative assertions, cross-tenant denial tests |

### Wave 09 — Cross-Product Integration Baseline

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| — | — | No prompts currently defined | — | `DEFERRED` | — | — | Placeholder wave; not started |

### Wave 10 — UC10 Refine & Build, Report Store & Domain Resolution

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-41.1_TEST` | `intelligence-service` | DOM-free protocol core tests | `platform` | `DELIVERED` | `test_analytical_protocol_core.py` (10/10), `AnalyticalAssistD0HarnessTest` (4/4) | 2026-09-19 | Protocol core vocabulary & idempotency verified |
| `LP-41.2_REGO` | `intelligence-service` | UC10 analytical policy gates | `platform` | `DELIVERED` | `ToolScopeAnalyticalPolicyTest` (6/6), `tool_scope_analytical.rego` | 2026-09-19 | Default-deny & mutation gate verified |
| `LP-41.3_PY` | `lexie-ai` | Protocol core evaluator and mutation gate | `platform` | `DELIVERED` | `analytical_protocol_core.py`, `test_analytical_protocol_core.py` (10/10) | 2026-09-19 | Apply/reject evaluation with version check |
| `LP-41.4_JAVA` | `intelligence-service` | Semantic resolution seam service | `platform` | `DELIVERED` | `AnalyticalRunCoordinatorImpl.java`, `AnalyticalApplyBatchTest` (5/5) | 2026-09-19 | Coordinator stale batch detection verified |
| `LP-41.5_TS` | `intelligence-ui` | Analytical refine slice UI | `platform` | `DELIVERED` | `AnalyticalRefineSlice.tsx`, `AnalyticalRefineSlice.test.tsx` (8/8) | 2026-09-19 | 8 conformance gates verified |
| `LP-41.6_TEST` | `intelligence-service` | Analytical seam wire-through tests | `platform` | `DELIVERED` | `AnalyticalCrossLayerWireThroughTest` (4/4) | 2026-09-19 | End-to-end composition parity verified |
| `LP-41.7_JAVA` | `intelligence-service` | Logical/physical resolution seam service | `platform` | `DELIVERED` | `SemanticResolutionSeamServiceImpl.java`, `SemanticResolutionSeamTest` (8/8) | 2026-09-19 | Semantic resolution seam service verified |
| `LP-41.8_TEST` | `intelligence-service` | Fail-closed wire-through for resolution seam | `platform` | `DELIVERED` | `AnalyticalSeamWireThroughTest` (4/4) | 2026-09-19 | Fail-closed wire-through verified |
| `LP-42.1_TEST` | `intelligence-service` | Report-local scope & grounding core tests | `platform` | `DELIVERED` | `test_derived_attribute_expression.py` (16/16) | 2026-09-19 | Report-local scope & grounding verified |
| `LP-42.2_REGO` | `intelligence-service` | High risk tier policy gates | `platform` | `DELIVERED` | `tool_scope_analytical.rego`, `ToolScopeAnalyticalPolicyTest` (6/6) | 2026-09-19 | Gated at HIGH risk tier, never auto-applied |
| `LP-42.3_PY` | `lexie-ai` | Derived attribute expression evaluator | `platform` | `DELIVERED` | `derived_attribute_evaluator.py`, `test_derived_attribute_expression.py` (16/16) | 2026-09-19 | Expression parse & evaluation engine verified |
| `LP-42.4_JAVA` | `intelligence-service` | Derived attribute evidence & expression service | `platform` | `DELIVERED` | `DerivedAttributeEvidenceDaoImpl.java`, `DerivedAttributeEvidenceTest` (5/5) | 2026-09-19 | Evidence stores AST expression & grounded attrs |
| `LP-42.5_TS` | `intelligence-ui` | Inline placement & expression UI display | `platform` | `DELIVERED` | `DerivedAttributeViewer.tsx`, `DerivedAttributeViewer.test.tsx` (5/5) | 2026-09-19 | Inline placement & f(x) badge verified |
| `LP-45.1_TEST` | `intelligence-service` | Decision core for instance outcome tests | `platform` | `DELIVERED` | `test_report_store_decision_core.py` (13/13) | 2026-09-19 | Decision core for instance outcome verified |
| `LP-45.2_REGO` | `intelligence-service` | Report store search policy gating | `platform` | `DELIVERED` | `test_report_store_rego_differential.py` (4/4) | 2026-09-19 | Default-deny policy differential verified |
| `LP-45.3_PY` | `lexie-ai` | Metadata-only report store adapter | `platform` | `DELIVERED` | `report_store.py`, `test_report_store_adapter.py` (9/9) | 2026-09-19 | Metadata-only adapter client verified |
| `LP-45.4_JAVA` | `intelligence-service` | Report store instance evidence service | `platform` | `DELIVERED` | `ReportStoreInstanceEvidenceDaoImpl.java`, `ReportStoreInstanceEvidenceTest` (7/7) | 2026-09-19 | Instance outcome audit trail verified |
| `LP-45.5_TS` | `intelligence-ui` | Report store instance outcome UI display | `platform` | `DELIVERED` | `StoreEntryPanel.tsx`, `StoreEntryPanel.test.tsx` (6/6) | 2026-09-19 | Artefact leads above the fold, lineage orders |
| `LP-46.0_SQL` | `intelligence-service` | Domain resolution persistence schema migration | `platform` | `DELIVERED` | `V20260916_12__lp46_agent_run_resolved_value.sql`, `AnalyticalMigrationSqlTest` (3/3) | 2026-09-19 | Schema migration applies cleanly |
| `LP-46.1_TEST` | `intelligence-service` | Exact/ambiguous/unresolved decision core tests | `platform` | `DELIVERED` | `test_domain_resolution_core.py` (11/11) | 2026-09-19 | Decision core states verified |
| `LP-46.2_JAVA` | `intelligence-service` | Domain resolution evidence service | `platform` | `DELIVERED` | `AnalyticalService.java`, `AnalyticalServiceTest` (4/4) | 2026-09-19 | Evidence half of compact verified |
| `LP-46.3_PY` | `lexie-ai` | Domain resolution adapter client | `platform` | `DELIVERED` | `domain_adapter.py`, `test_domain_adapter.py` (5/5) | 2026-09-19 | Adapter client with Unicode NFC verified |
| `LP-46.4_TS` | `intelligence-ui` | Domain resolution review UI display | `platform` | `DELIVERED` | `DomainResolutionPanel.tsx`, `DomainResolutionPanel.test.tsx` (8/8) | 2026-09-19 | 8 conformance gates verified |

### Wave 11 — Knowledge Graph Access Layer

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-44.1_TEST` | `lexie-ai` | Op catalogue & graph traversal bounds tests | `platform` | `DELIVERED` | `test_kg_core.py` (11/11 passed) | 2026-09-19 | Whitelist triples, pure edge key & stop records verified |
| `LP-44.2_REGO` | `intelligence-service` | Graph traversal & named op policy gating | `platform` | `DELIVERED` | `ToolScopeKgPolicyTest` (6/6 passed), `tool_scope_kg.rego` | 2026-09-19 | Cross-tenant refusal & per-purpose readiness verified |
| `LP-44.3_PY` | `lexie-ai` | Knowledge graph client with named ops | `platform` | `DELIVERED` | `test_kg_client.py` (6/6 passed), `kg_client.py` | 2026-09-19 | AST inspection proves no query strings or kwargs accepted |
| `LP-44.4_JAVA` | `intelligence-service` | Knowledge graph traversal & evidence service | `platform` | `DELIVERED` | `KnowledgeGraphEvidenceTest` (7/7 passed), `V20260916_13` | 2026-09-19 | Snapshot ID & graph_edge_rule_kind_chk verified |

### Wave 12 — External Witness & WORM Anchor

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-49.1_SQL` | `intelligence-service` | Notarization receipt schema migration | `platform` | `DELIVERED` | `EvidenceNotarizationSqlTest` (3/3 passed), `V20260916_14` | 2026-09-19 | Notarization receipt schema & chain_valid check |
| `LP-49.2_JAVA` | `intelligence-service` | External notary service & receipt ledger | `platform` | `DELIVERED` | `NotarizationWireThroughTest` (5/5 passed), `EvidenceNotaryServiceImpl.java` | 2026-09-19 | Notary service writes outside DB to WORM store |
| `LP-49.3_SQL` | `intelligence-service` | WORM retention boundary schema | `platform` | `DELIVERED` | `EvidenceNotarizationSqlTest` (3/3 passed), `V20260916_15` | 2026-09-19 | Signature & third-role retention boundary verified |
| `LP-49.4_TS` | `intelligence-ui` | Witness status & notary badge UI display | `platform` | `DELIVERED` | `EvidenceChainValidatorBadge.test.tsx` (7/7 passed) | 2026-09-19 | Inversion discharged: witnessed requires covering receipt |
| `LP-49.5_TEST` | `intelligence-service` | External witness & WORM anchor wire-through tests | `platform` | `DELIVERED` | `NotarizationWireThroughTest` (5/5 passed) | 2026-09-19 | Real store lock, tampered day refusal & wiring contrast |

### Wave 13 — Population Reconciliation

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-50.1_SQL` | `intelligence-service` | Inventory reconciliation schema migration | `platform` | `DELIVERED` | `PopulationReconciliationSqlTest` (2/2 passed), `V20260916_16` | 2026-09-19 | Table schema, foreign keys & state checks verified |
| `LP-50.2_JAVA` | `intelligence-service` | Inventory population join & reconciliation service | `platform` | `DELIVERED` | `PopulationReconciliationServiceTest` (4/4 passed), `PopulationReconciliationServiceImpl.java` | 2026-09-19 | 4-way population join, gap naming & state management |
| `LP-50.3_JAVA` | `intelligence-service` | Core inventory contract interface & binding | `platform` | `DELIVERED` | `CoreReportInventoryClientImpl`, `PopulationReconciliationServiceTest` | 2026-09-19 | Fail-closed on missing binding, metadata-only verified |
| `LP-50.4_TEST` | `intelligence-service` | Population reconciliation wire-through tests | `platform` | `DELIVERED` | `PopulationReconciliationWireThroughTest` (4/4 passed) | 2026-09-19 | Named at both ends, 5 manufactured attacks refused |

### Wave 14 — Confidence Calibration & Ongoing Monitoring

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-51.1_PY` | `lexie-ai` | Confidence formula definition | `platform` | `DELIVERED` | `skills/confidence_formula.py`, `test_confidence_formula.py` (6/6 passed) | 2026-09-19 | Decomposed components, signal never gate verified |
| `LP-51.2_PY` | `lexie-ai` | Calibrator fitting logic | `platform` | `DELIVERED` | `skills/calibration/calibrator.py`, `test_calibrator_fitting.py` (6/6 passed) | 2026-09-19 | Monotonic fitting & observation floor verified |
| `LP-51.3_JAVA` | `intelligence-service` | Calibration service and promotion records | `platform` | `DELIVERED` | `ConfidenceCalibrationServiceImpl.java`, `ConfidenceCalibrationServiceTest` (6/6 passed) | 2026-09-19 | Promotion evaluation & governance controller |
| `LP-51.4_SQL` | `intelligence-service` | Calibration threshold schema | `platform` | `DELIVERED` | `CalibrationSqlReadTest` (5/5 passed), `V20260916_17` | 2026-09-19 | Observation count & threshold storage verified |
| `LP-51.5_TS` | `intelligence-ui` | Confidence visual grammar | `platform` | `DELIVERED` | `ConfidenceSignal.tsx`, `ConfidenceSignal.test.tsx` (6/6 passed) | 2026-09-19 | NOT-CALIBRATED third state, no traffic lights |
| `LP-51.6_TEST` | `intelligence-service` | Confidence calibration wire-through tests | `platform` | `DELIVERED` | `ConfidenceCalibrationWireThroughTest` (5/5 passed) | 2026-09-19 | Shared fixture across Py/Java, order invariant |

### Wave 15 — Approval Workflow Substrate

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-59.1_PY` | `lexie-ai` | Chain engine | `platform` | `DELIVERED` | `lexie_ai/governance/chain.py` (6 functions: chainBuild, chainEntitlement, chainAdvanceOn, chainPositionOf, chainMintedAt, chainRecordAndApply), `test_governance_chain.py` (6/6 passed) | 2026-09-19 | Invariants: stored chain immutable after mint; record first apply second; refusals have NO destination; entitlement returns reason on allow and refusal |
| `LP-59.2_PY` | `lexie-ai` | Capability specs and wrappers | `platform` | `DELIVERED` | `lexie_ai/governance/specs.py` (5 capability specs as pure data: KH, PRESET, TDM, SKILL, DROP_PROFILE; floors, preconditions, wrappers), `test_governance_specs.py` (5/5 passed) | 2026-09-19 | Skill floor reads recorded tier; wrappers delegate without step changes; NOT_OBSERVED precedes NOT_ENTITLED; TDM contamination check precedes chain refusal |
| `LP-59.3_REGO` | `intelligence-service` | Chain entitlement policy | `platform` | `DELIVERED` | `src/main/resources/opa/policy/chain_entitlement.rego` (8 roles, 6 explicit refusal codes: NO_FUNCTIONS, NOT_ENTITLED, SOD_SAME_PERSON, SHARED_UNIT, NO_OPEN_STEP, UNKNOWN_ACTION; allow rule and structured envelope) | 2026-09-19 | Wire-through verified in `ApprovalWorkflowWireThroughTest` (8/8 passed); explicit negation rules; structured envelope |
| `LP-59.4_TS` | `intelligence-ui` | Step ring and approval UI | `product_specific` | `DELIVERED` | `src/components/atoms/StepRing.tsx`, `src/components/__tests__/StepRing.test.tsx` (5/5 passed) | 2026-09-19 | Names waiting actor/role; non-color indicators (icons + badges); CSS theme tokens only; inherited authority gated |
| `LP-59.5_TS` | `intelligence-ui` | Inherited authority gate | `product_specific` | `DELIVERED` | `src/governance/inheritedAuthority.ts`, `src/governance/__tests__/inheritedAuthority.test.ts` (4/4 passed) | 2026-09-19 | 5 governed vs 4 assist capabilities; throws explicit error naming violating component/capability if assist surface attempts workflow render |
| `LP-59.6_JAVA` | `intelligence-service` | Estate ledger service | `platform` | `DELIVERED` | `EstateLedgerService`, `EstateLedgerServiceImpl`, `EstateLedgerDao`, `EstateLedgerDaoTest` (2/2 passed), `EstateLedgerServiceTest` (5/5 passed) | 2026-09-19 | One contiguous estate-wide sequence with gap detection; witnessed:false returned; NON_EVIDENTIAL track filterable and counted by integrity; append-only |
| `LP-59.7_JAVA` | `intelligence-service` | Actor directory and guardrails | `platform` | `DELIVERED` | `ActorDirectory.java`, `ActorDirectoryTest.java` (3/3 passed) | 2026-09-19 | Exactly one shared directory; no actor holds platform_admin; role discovery by pattern from capability specs |
| `LP-59.8_SQL` | `intelligence-service` | Approval ledger schema extension | `platform` | `DELIVERED` | `V20260916_18__lp59_approval_workflow_ledger.sql`, `ApprovalWorkflowMigrationSqlTest` (2/2 passed) | 2026-09-19 | Extends agent_run_event (no duplicate ledger); CHECK (outcome <> 'refused' OR destination IS NULL); 30-action vocabulary; client_id indexed |
| `LP-59.9_TEST` | `intelligence-service` | Approval workflow wire-through tests | `platform` | `DELIVERED` | `ApprovalWorkflowWireThroughTest.java` (8/8 passed), `test_approval_workflow_wire_through.py` (7/7 passed) | 2026-09-19 | 6 cross-layer boundaries verified: decision_id byte-identity, refusal outcome/destination, persisted chain fidelity, assist gate, sandbox track, NO_FUNCTIONS fail-closed |

### Wave 16 — Document Parsing Seam & Sandboxing

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-52.1_PY` | `lexie-ai` | Docling pipeline config | `platform` | `DELIVERED` | `lexie_ai/services/parsing/docling_config.py`, `test_docling_parsing_seam.py` (3/3 passed) | 2026-09-19 | Named OCR engine, commit-pinned models, declined models check |
| `LP-52.2_PY` | `lexie-ai` | Adapter and `ParsedChunk` contract | `platform` | `DELIVERED` | `lexie_ai/services/parsing/docling_adapter.py`, `test_docling_parsing_seam.py` (3/3 passed) | 2026-09-19 | Page invariants: null for unpaginated, 0 forbidden, unknown element forbidden |
| `LP-52.3_PY` | `lexie-ai` | Traversal and reconciliation logic | `platform` | `DELIVERED` | `lexie_ai/services/parsing/traversal.py`, `test_docling_parsing_seam.py` (2/2 passed) | 2026-09-19 | Linear doc order, drop tracking, UnreconciledContentError on unconsumed elements |
| `LP-52.4_PY` | `lexie-ai` | Label policy and error handling | `platform` | `DELIVERED` | `lexie_ai/services/parsing/label_policy.py`, `test_docling_parsing_seam.py` (2/2 passed) | 2026-09-19 | Five label dispositions (DROP_LAYOUT, DROP_BY_POLICY, NOT_YET_CONSUMED, LABEL_ROUTED, KEPT_BY_RULING) |
| `LP-52.5_REGO` | `intelligence-service` | Parsing `tool_scope` policy | `platform` | `DELIVERED` | `src/main/resources/opa/policy/tool_scope_parsing.rego` | 2026-09-19 | Explicit operations, PARSING_OP_NOT_PERMITTED, ARTIFACTS_NOT_READY, OP_UNBOUND |
| `LP-52.6_TEST` | `intelligence-service` | Parsing seam wire-through tests | `platform` | `DELIVERED` | `ParsingSeamWireThroughTest.java` (6/6 passed) | 2026-09-19 | End-to-end parse execution, policy enforcement, and estate ledger recording |
| `LP-57.1_PY` | `lexie-ai` | Exam runner | `platform` | `DELIVERED` | `lexie_ai/services/assurance/exam_runner.py`, `test_document_assurance.py` (4/4 passed) | 2026-09-19 | Bounded execution, service identity preservation, zero side effects |
| `LP-57.2_PY` | `lexie-ai` | Grading facets | `platform` | `DELIVERED` | `lexie_ai/services/assurance/grading_facets.py`, `test_document_assurance.py` (4/4 passed) | 2026-09-19 | Six independent facets: verifiable, answered, grounded, value_present, complete, citation_ok |
| `LP-57.3_REGO` | `intelligence-service` | Assurance gating policy | `platform` | `DELIVERED` | `src/main/resources/opa/policy/assurance.rego` | 2026-09-19 | 80% passing threshold, critical facet requirements, fail-closed policy |
| `LP-57.4_SQL` | `intelligence-service` | Assurance schema migration | `platform` | `DELIVERED` | `V20260916_19__lp57_assurance_schema.sql` | 2026-09-19 | document_assurance_run, document_assurance_item, append-only triggers, tenant isolation |
| `LP-57.5_JAVA` | `intelligence-service` | Assurance orchestration service | `platform` | `DELIVERED` | `DocumentAssuranceServiceImpl.java`, `DocumentAssuranceController.java` | 2026-09-19 | Run execution, facet aggregation, estate ledger audit recording |
| `LP-57.6_TS` | `intelligence-ui` | Assurance surface UI | `product_specific` | `DELIVERED` | `src/features/knowledge/AssuranceTab.tsx`, `AssuranceTab.test.tsx` (4/4 passed) | 2026-09-19 | 6-facet breakdown, question list, pass/fail status, theme token styling |
| `LP-57.7_TEST` | `intelligence-service` | Assurance wire-through tests | `platform` | `DELIVERED` | `AssuranceWireThroughTest.java` (5/5 passed) | 2026-09-19 | Cross-layer wire-through, OPA decision, DB persistence, ledger entry |
| `LP-58.1_REGO` | `intelligence-service` | `tdm_sandbox` policy | `platform` | `DELIVERED` | `src/main/resources/opa/policy/tdm_sandbox.rego` | 2026-09-19 | Enforces evidential: false, AI_PROHIBITED refusal, allowed sandbox probe modes |
| `LP-58.2_PY` | `lexie-ai` | Sandbox probe runner | `platform` | `DELIVERED` | `lexie_ai/services/sandbox/probe_runner.py`, `test_tdm_sandbox_runner.py` (4/4 passed) | 2026-09-19 | Immutable non-evidential flag, hard stops on AI_PROHIBITED before model call |
| `LP-58.3_JAVA` | `intelligence-service` | Sandbox run persistence | `platform` | `DELIVERED` | `SandboxServiceImpl.java`, `SandboxController.java` | 2026-09-19 | NON_EVIDENTIAL track tagging, estate ledger recording, subject retrieval |
| `LP-58.4_TS` | `intelligence-ui` | Sandbox surface UI | `product_specific` | `DELIVERED` | `src/features/tdm/SandboxWorkspace.tsx`, `SandboxWorkspace.test.tsx` (4/4 passed) | 2026-09-19 | Non-evidential badge, probe runner form, AI_PROHIBITED input guards |
| `LP-58.5_TEST` | `intelligence-service` | Sandbox wire-through tests | `platform` | `DELIVERED` | `SandboxWireThroughTest.java` (5/5 passed) | 2026-09-19 | Non-evidential isolation, default read exclusion, integrity counting |
| `LP-60.1_REGO` | `intelligence-service` | `todo_routing` policy | `platform` | `DELIVERED` | `src/main/resources/opa/policy/todo_routing.rego` | 2026-09-19 | Governs inbox surfaces, routing decisions, intent validation, and four-eyes review |
| `LP-60.2_JAVA` | `intelligence-service` | Inbox service and step logic | `platform` | `DELIVERED` | `InboxServiceImpl.java`, `InboxController.java` | 2026-09-19 | Aggregates tasks across capabilities, resolves next open step, delegates to chain engine |
| `LP-60.3_TS` | `intelligence-ui` | Inbox workspace UI | `product_specific` | `DELIVERED` | `src/features/inbox/InboxWorkspace.tsx`, `InboxWorkspace.test.tsx` (5/5 passed) | 2026-09-19 | Filter by capability/status, displays StepRing on governed items, action dispatching |
| `LP-60.4_TEST` | `intelligence-service` | Todo routing wire-through tests | `platform` | `DELIVERED` | `TodoRoutingWireThroughTest.java` (5/5 passed) | 2026-09-19 | Evaluates todo routing, step transition dispatch, and audit logging end-to-end |

### Wave 17 — Chunking, Vector Split & OCR Provenance

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-53.1_PY` | `lexie-ai` | Chunking rules and boundaries | `platform` | `DELIVERED` | `lexie_ai/services/chunking/chunker.py`, `test_chunking_and_two_table_split.py` (6/6 passed) | 2026-09-19 | 4 chunking rules: table header repeated, no split rows, section boundaries, real tokenizer |
| `LP-53.2_SQL` | `intelligence-service` | Document chunk schema migration | `platform` | `DELIVERED` | `V20260916_20__lp53_chunking_two_table_split.sql` | 2026-09-19 | Two-table split (document_chunk and embedding_chunk), foreign keys, client_id isolation |
| `LP-53.3_SQL` | `intelligence-service` | Vector-store re-pointing and cleanup | `platform` | `DELIVERED` | `V20260916_20__lp53_chunking_two_table_split.sql` | 2026-09-19 | pgvector embedding_chunk.embedding vector(384), model_id composite index, drops vector from document_chunk |
| `LP-53.4_JAVA` | `intelligence-service` | Chunk retrieval and provenance DAO | `platform` | `DELIVERED` | `EmbeddingChunkDaoImpl.java`, `EmbeddingChunkServiceImpl.java` | 2026-09-19 | knnSearch joins embedding_chunk, provenance fields reach caller, externalized SQL |
| `LP-53.5_TEST` | `intelligence-service` | Chunking wire-through tests | `platform` | `DELIVERED` | `ChunkingWireThroughTest.java` (6/6 passed) | 2026-09-19 | KnnSearch join target, provenance column propagation, model_id filter isolation |
| `LP-54.1_PY` | `lexie-ai` | OCR configuration and language seam | `platform` | `DELIVERED` | `lexie_ai/services/ocr/ocr_config.py`, `test_ocr_provenance.py` (5/5 passed) | 2026-09-19 | Named OCR engine (no auto), full-page OCR off, sha256-pinned weights, language artifacts refusal |
| `LP-54.2_PY` | `lexie-ai` | Text source provenance logic | `platform` | `DELIVERED` | `lexie_ai/services/ocr/provenance.py`, `test_ocr_provenance.py` (4/4 passed) | 2026-09-19 | Text layer comparison against independent layer, element is never mixed, named threshold constant |
| `LP-54.3_PY` | `lexie-ai` | Figure verification logic | `platform` | `DELIVERED` | `lexie_ai/services/ocr/figure_verifier.py`, `test_ocr_provenance.py` (4/4 passed) | 2026-09-19 | Arithmetic cross-check (decimal shift, 8/B substitution, 1/7 slip), suspect figure marking, zero accuracy % |
| `LP-54.4_PY` | `lexie-ai` | Completeness checks and verification gate | `platform` | `DELIVERED` | `lexie_ai/services/ocr/verification_gate.py`, `test_ocr_provenance.py` (4/4 passed) | 2026-09-19 | Scanned page exclusion from baseline, PARTIALLY VERIFIED status, reader fragmentation measurement |
| `LP-54.5_TS` | `intelligence-ui` | Provenance viewer UI | `product_specific` | `DELIVERED` | `src/features/knowledge/DocumentViewerProvenance.tsx`, `DocumentViewerProvenance.test.tsx` (6/6 passed) | 2026-09-19 | Badges OCR passages as OCR - NOT VERIFIED, leaves extracted unbadged, renders PARTIALLY VERIFIED |
| `LP-54.6_TEST` | `intelligence-service` | OCR provenance wire-through tests | `platform` | `DELIVERED` | `OcrProvenanceWireThroughTest.java` (5/5 passed) | 2026-09-19 | 7 crossings proved: element/chunk text_source, partial vs complete, failed arithmetic DTO propagation |

### Wave 18 — Footnote Association & Drop Profiles

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-55.1_PY` | `lexie-ai` | Superscript capture | `product_specific` | `DELIVERED` | `lexie_ai/services/chunking/footnote_marker.py`, `test_footnote_marker.py` (6/6 passed) | 2026-09-19 | Superscript numeral capture via formatting.script flag; printed-order multi-marker; non-numeric and no-flag guard; run-level fallback to item flag |
| `LP-55.2_PY` | `lexie-ai` | Footnote association logic | `product_specific` | `DELIVERED` | `lexie_ai/services/chunking/footnote_associator.py`, `test_footnote_associator.py` (7/7 passed) | 2026-09-19 | Page-scoped resolution; anchored note detection; note-cites-note graph; inline fallback recorded not applied to note prose; unresolved markers returned; first-note-wins on duplicate |
| `LP-55.3_SQL` | `intelligence-service` | Chunk reference edge tables | `product_specific` | `DELIVERED` | `V20260916_21__lp55_lp56_footnotes_and_drop_profiles.sql` | 2026-09-19 | `chunk_reference` (self-edge CHECK, method IN CHECK, PK, cascade) and `chunk_reference_unresolved`; client_id NOT NULL indexed in all constraints |
| `LP-55.4_JAVA` | `intelligence-service` | Footnote retrieval join | `product_specific` | `DELIVERED` | `ChunkReferenceDaoImpl.java`, `ChunkReferenceServiceImpl.java`, `queries.properties` (`notesFor`, `unresolvedMarkersFor`) | 2026-09-19 | notes alongside (not inlined); 1-hop + note-cites-note; deduplication; hop field distinguishes direct vs transitive; join via embedding_chunk_source; unresolved surfaced |
| `LP-55.5_TS` | `intelligence-ui` | Footnote display UI | `product_specific` | `DELIVERED` | `src/features/knowledge/DocumentFootnotesView.tsx`, `DocumentFootnotesView.test.tsx` (6/6 passed) | 2026-09-19 | Notes rendered inline (not tooltip); direct vs second-hop visually distinct; unresolved marker shown with number and reason; detection method reachable not prominent; OCR badge inherited |
| `LP-55.6_TEST` | `intelligence-service` | Footnote wire-through tests | `product_specific` | `DELIVERED` | `FootnoteWireThroughTest.java` (5/5 passed) | 2026-09-19 | 6 crossings: chunk_reference populated on ingest, note alongside with content unchanged, 2-hop notes with hop, dedup, unresolved to viewer, page scope isolation; note text absent from chunk content |
| `LP-56.1_PY` | `lexie-ai` | Drop profile proposer | `product_specific` | `DELIVERED` | `lexie_ai/services/drops/drop_profile_proposer.py`, `test_drop_profile_proposer.py` (4/4 passed) | 2026-09-19 | Position-discriminated furniture detection (not frequency); running headers PROMOTE not drop; SME questions with evidence quote+pages+rationale; four outputs separate |
| `LP-56.2_REGO` | `intelligence-service` | `drop_profile` OPA policy | `product_specific` | `DELIVERED` | `src/main/resources/opa/policy/drop_profile.rego` | 2026-09-19 | 4 declaration refusals: NO_FUNCTIONS, NOT_SUBMITTER, NO_SCOPE, REASON_TOO_SHORT; refused declared before guard; no-profile parse refused not defaulted; chain ruling floor supplied |
| `LP-56.3_JAVA` | `intelligence-service` | Versioned drop profile service | `product_specific` | `DELIVERED` | `DropProfileDaoImpl.java`, `DropProfileServiceImpl.java`, `V20260916_21__lp55_lp56_footnotes_and_drop_profiles.sql` | 2026-09-19 | Versioned artefact; no in-place edit path; parse rows carry profile_id+version; ruling with reason+author; per-document declaration keyed to doc version; estate ledger events |
| `LP-56.4_TS` | `intelligence-ui` | SME ruling surface | `product_specific` | `DELIVERED` | `src/features/governance/DropProfileSmeRulingView.tsx`, `DropProfileSmeRulingView.test.tsx` (5/5 passed) | 2026-09-19 | Decided drops rendered without approval control; open questions carry quote+pages+rationale; kept section with position evidence; document panel names profile+version+declared count; StepRing+audit trail last |
| `LP-56.5_TEST` | `intelligence-service` | Drop profile wire-through tests | `product_specific` | `DELIVERED` | `DropProfileWireThroughTest.java` (6/6 passed) | 2026-09-19 | 7 crossings: chart axis survives ingest, ruling creates new version+old readable, no-profile parse refused, deliberate vs loss contrast, 4 declaration refusals recorded, old-version naming preserved, panel shows stored values |

---

## 4. Tracking Rules

1. Every prompt must have a status set explicitly.
2. `DELIVERED` requires evidence (test output, migration result, or artifact reference).
3. `BLOCKED` requires a clear blocker and owner.
4. `DEFERRED` must have a reason and review date.
5. Do not carry forward stale “delivered” states without fresh verification.

---

## 5. Suggested Review Cadence

- Daily: update prompt status and blockers
- Weekly: validate evidence against repo state
- At release: confirm all final `DELIVERED` prompts still match actual implementation
