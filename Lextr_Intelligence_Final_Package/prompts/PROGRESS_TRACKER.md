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
| **Wave 07** | Evidence Ledger, Merkle Chaining & AU-9 Integrity | 58 | 58 | 0 | 0 | 0 | 0 | 🟡 Planning |
| **Wave 08** | Reason Code Registry, Locale Tokens & Multi-Tenancy | 24 | 24 | 0 | 0 | 0 | 0 | 🟡 Planning |
| **Wave 09** | Cross-Product Integration Baseline | 0 | 0 | 0 | 0 | 0 | 0 | ⚪ Empty |
| **Wave 10** | UC10 Refine & Build, Report Store & Domain Resolution | 23 | 23 | 0 | 0 | 0 | 0 | 🟡 Planning |
| **Wave 11** | Knowledge Graph Access Layer | 4 | 4 | 0 | 0 | 0 | 0 | 🟡 Planning |
| **Wave 12** | External Witness & WORM Anchor | 5 | 5 | 0 | 0 | 0 | 0 | 🟡 Planning |
| **Wave 13** | Population Reconciliation | 4 | 4 | 0 | 0 | 0 | 0 | 🟡 Planning |
| **Wave 14** | Confidence Calibration & Ongoing Monitoring | 6 | 6 | 0 | 0 | 0 | 0 | 🟡 Planning |
| **Wave 15** | Approval Workflow Substrate | 9 | 9 | 0 | 0 | 0 | 0 | 🟡 Planning |
| **Wave 16** | Document Parsing Seam & Sandboxing | 22 | 22 | 0 | 0 | 0 | 0 | 🟡 Planning |
| **Wave 17** | Chunking, Vector Split & OCR Provenance | 11 | 11 | 0 | 0 | 0 | 0 | 🟡 Planning |
| **Wave 18** | Footnote Association & Drop Profiles | 11 | 11 | 0 | 0 | 0 | 0 | 🟡 Planning |
| **TOTAL** | **Full 18-Wave Platform Scope** | **251** | **218** | **0** | **0** | **33** | **0** | **13.1% structured baseline** |

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
| `LP-39.1_SQL` | `intelligence-service` | Reason-code ledger migration | — | `PENDING` | — | — | — |
| `LP-39.2_JAVA` | `intelligence-service` | Training domain DAO and service | — | `PENDING` | — | — | — |
| `LP-39.3_REGO` | `intelligence-service` | TDM ring-fence policy | — | `PENDING` | — | — | — |
| `LP-39.4_PY` | `lexie-ai` | Fine-tune executor | — | `PENDING` | — | — | — |
| `LP-39.5_TS` | `intelligence-ui` | Training data UI | — | `PENDING` | — | — | — |
| `LP-39.6_TEST` | `intelligence-service` | Reason-code cross-layer tests | — | `PENDING` | — | — | — |
| `LP-23.1_PY` | `lexie-ai` | Analytical assist skill | — | `PENDING` | — | — | — |
| `LP-24.1_TEST` | `intelligence-service` | Merkle protocol core tests | — | `PENDING` | — | — | — |
| `LP-24.2_SQL` | `intelligence-service` | Merkle tree ledger migration | — | `PENDING` | — | — | — |
| `LP-24.3_PY` | `lexie-ai` | Merkle analytical skill | — | `PENDING` | — | — | — |
| `LP-24.4_REGO` | `intelligence-service` | `tool_scope_analytical` policy | — | `PENDING` | — | — | — |
| `LP-24.5_JAVA` | `intelligence-service` | Analytical preset resolver | — | `PENDING` | — | — | — |
| `LP-24.6_TS` | `intelligence-ui` | Merkle workspace UI | — | `PENDING` | — | — | — |
| `LP-24.7_TEST` | `intelligence-service` | Merkle wire-through tests | — | `PENDING` | — | — | — |
| `LP-25.1_TEST` | `intelligence-service` | AU-9 simulation and logic harness | — | `PENDING` | — | — | — |
| `LP-25.2_SQL` | `intelligence-service` | AU-9 ledger schema migration | — | `PENDING` | — | — | — |
| `LP-25.3_PY` | `lexie-ai` | Rules skill and extractor | — | `PENDING` | — | — | — |
| `LP-25.4_REGO` | `intelligence-service` | `tool_scope_rules` policy | — | `PENDING` | — | — | — |
| `LP-25.5_JAVA` | `intelligence-service` | Coordinator + acceptance receipt | — | `PENDING` | — | — | — |
| `LP-25.6_TS` | `intelligence-ui` | Evidence workspace UI | — | `PENDING` | — | — | — |
| `LP-25.7_TEST` | `intelligence-service` | AU-9 export wire-through tests | — | `PENDING` | — | — | — |
| `LP-25.8_TS` | `intelligence-ui` | AU-9 panel redesign | — | `PENDING` | — | — | — |
| `LP-25.9_TS` | `intelligence-ui` | Lexie entry point integration | — | `PENDING` | — | — | — |
| `LP-26.1_SQL` | `intelligence-service` | Evidence schema migration set | — | `PENDING` | — | — | — |
| `LP-26.2_JAVA` | `intelligence-service` | Recording service and rules | — | `PENDING` | — | — | — |
| `LP-26.3_JAVA` | `intelligence-service` | Query and export surface | — | `PENDING` | — | — | — |
| `LP-26.4_JAVA` | `intelligence-service` | Lifecycle engine | — | `PENDING` | — | — | — |
| `LP-26.5_JAVA` | `intelligence-service` | Correlation and actor attribution | — | `PENDING` | — | — | — |
| `LP-26.6_PY` | `lexie-ai` | Producer runtime and evidence recorder | — | `PENDING` | — | — | — |
| `LP-26.7_TS` | `intelligence-ui` | Audit evidence UI models | — | `PENDING` | — | — | — |
| `LP-26.8_SQL` | `intelligence-service` | Retention, archive, coverage SQL | — | `PENDING` | — | — | — |
| `LP-26.9_SQL` | `intelligence-service` | Header transition history and coverage | — | `PENDING` | — | — | — |
| `LP-26.10_SQL` | `intelligence-service` | Three-role split and purge migration | — | `PENDING` | — | — | — |
| `LP-26.12_REGO` | `intelligence-service` | `audit_read` policy bundle | — | `PENDING` | — | — | — |
| `LP-26.13_TS` | `intelligence-ui` | Forward-door evidence UI | — | `PENDING` | — | — | — |
| `LP-26.14_TEST` | `intelligence-service` | Drift gate and reconciliation tests | — | `PENDING` | — | — | — |
| `LP-26.15_TEST` | `intelligence-service` | Estate-wide audit test gate | — | `PENDING` | — | — | — |
| `LP-26.16_JAVA` | `intelligence-service` | Evidence pack export | — | `PENDING` | — | — | — |
| `LP-26.17_JAVA` | `intelligence-service` | Evidence pack verifier and hand-back | — | `PENDING` | — | — | — |
| `LP-26.18_REGO` | `intelligence-service` | Export entitlement policy | — | `PENDING` | — | — | — |
| `LP-26.19_TEST` | `intelligence-service` | Chain formula and cross-layer tests | — | `PENDING` | — | — | — |
| `LP-26.20_JAVA` | `intelligence-service` | Draft vs approved export logic | — | `PENDING` | — | — | — |
| `LP-26.21_TS` | `intelligence-ui` | Audit evidence screen and pack view | — | `PENDING` | — | — | — |
| `LP-26.22_PY` | `lexie-ai` | Generated model documentation | — | `PENDING` | — | — | — |
| `LP-26.23_TEST` | `intelligence-service` | Cross-language claim gate | — | `PENDING` | — | — | — |
| `LP-26.24_SQL` | `intelligence-service` | Approval/discharge schema | — | `PENDING` | — | — | — |
| `LP-26.25_JAVA` | `intelligence-service` | Discharge and registration logic | — | `PENDING` | — | — | — |
| `LP-26.26_REGO` | `intelligence-service` | Obligation discharge validator | — | `PENDING` | — | — | — |
| `LP-26.27_TEST` | `intelligence-service` | Undischarged obligation gate | — | `PENDING` | — | — | — |
| `LP-26.28_SQL` | `intelligence-service` | Erasure event migration | — | `PENDING` | — | — | — |
| `LP-26.29_JAVA` | `intelligence-service` | Erasure and event append service | — | `PENDING` | — | — | — |
| `LP-26.30_JAVA` | `intelligence-service` | Withheld/erased/absent export semantics | — | `PENDING` | — | — | — |
| `LP-26.31_REGO` | `intelligence-service` | Erasure authority policy | — | `PENDING` | — | — | — |
| `LP-26.32_TEST` | `intelligence-service` | Erasure chain tests | — | `PENDING` | — | — | — |
| `LP-27.1_PY` | `lexie-ai` | Evidence bundle aggregator | — | `PENDING` | — | — | — |
| `LP-27.2_JAVA` | `intelligence-service` | Orchestration seam for evidence export | — | `PENDING` | — | — | — |
| `LP-28.1_PY` | `lexie-ai` | Proof verifier and receipt validator | — | `PENDING` | — | — | — |
| `LP-28.2_JAVA` | `intelligence-service` | Proof validation controller/service | — | `PENDING` | — | — | — |

### Wave 08 — Reason Code Registry, Locale Tokens & Multi-Tenancy

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-29.1_JAVA` | `intelligence-service` | OpenAPI documentation and service exposure | — | `PENDING` | — | — | — |
| `LP-30.1_JAVA` | `intelligence-service` | Logging and centralized config | — | `PENDING` | — | — | — |
| `LP-31.1_JAVA` | `intelligence-service` | Database composition root | — | `PENDING` | — | — | — |
| `LP-32.1_JAVA` | `intelligence-service` | Status update and tenant-safe writes | — | `PENDING` | — | — | — |
| `LP-33.1_JAVA` | `intelligence-service` | Tenant configuration manager | — | `PENDING` | — | — | — |
| `LP-33.3_PY` | `lexie-ai` | Tenant runtime config subscriber | — | `PENDING` | — | — | — |
| `LP-34.1_JAVA` | `intelligence-service` | Completeness gate and capability checker | — | `PENDING` | — | — | — |
| `LP-35.1_JAVA` | `intelligence-service` | Health, readiness, liveness and metrics | — | `PENDING` | — | — | — |
| `LP-40.1_SQL` | `intelligence-service` | Locale and run contract schema | — | `PENDING` | — | — | — |
| `LP-40.2_PY` | `lexie-ai` | Reason-code replacement for prose fields | — | `PENDING` | — | — | — |
| `LP-40.3_REGO` | `intelligence-service` | Policy-based reason-code decisions | — | `PENDING` | — | — | — |
| `LP-40.4_TS` | `intelligence-ui` | i18n runtime and string extraction | — | `PENDING` | — | — | — |
| `LP-40.5_TEST` | `intelligence-service` | Locale no-translate tests | — | `PENDING` | — | — | — |
| `LP-47.1_TEST` | `intelligence-service` | Supervisory reachability and gate tests | — | `PENDING` | — | — | — |
| `LP-47.2_TS` | `intelligence-ui` | Structural radar workspace UI | — | `PENDING` | — | — | — |
| `LP-47.3_TS` | `intelligence-ui` | Mount contracts and registry wiring | — | `PENDING` | — | — | — |
| `LP-47.4_TS` | `intelligence-ui` | Lexie dispatcher and handoff | — | `PENDING` | — | — | — |
| `LP-47.5_TS` | `intelligence-ui` | Host seam and boot integration | — | `PENDING` | — | — | — |
| `LP-47.6_TS` | `intelligence-ui` | Open-items pass and shell contract | — | `PENDING` | — | — | — |
| `LP-48.1_SQL` | `intelligence-service` | Governing ingest description schema | — | `PENDING` | — | — | — |
| `LP-48.2_JAVA` | `intelligence-service` | Ingestion API and disposition handling | — | `PENDING` | — | — | — |
| `LP-48.3_JAVA` | `intelligence-service` | Rule set server-side semantics | — | `PENDING` | — | — | — |
| `LP-48.5_TS` | `intelligence-ui` | Governing ingest UI | — | `PENDING` | — | — | — |
| `LP-48.6_TEST` | `intelligence-service` | Negative suite and mutation test port | — | `PENDING` | — | — | — |

### Wave 09 — Cross-Product Integration Baseline

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| — | — | No prompts currently defined | — | `DEFERRED` | — | — | Placeholder wave; not started |

### Wave 10 — UC10 Refine & Build, Report Store & Domain Resolution

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-41.1_TEST` | `intelligence-service` | DOM-free protocol core tests | — | `PENDING` | — | — | — |
| `LP-41.2_REGO` | `intelligence-service` | UC10 analytical policy gates | — | `PENDING` | — | — | — |
| `LP-41.3_PY` | `lexie-ai` | Protocol core evaluator and mutation gate | — | `PENDING` | — | — | — |
| `LP-41.4_JAVA` | `intelligence-service` | Semantic resolution seam service | — | `PENDING` | — | — | — |
| `LP-41.5_TS` | `intelligence-ui` | Analytical refine slice UI | — | `PENDING` | — | — | — |
| `LP-41.6_TEST` | `intelligence-service` | Analytical seam wire-through tests | — | `PENDING` | — | — | — |

### Wave 11 — Knowledge Graph Access Layer

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-42.1_JAVA` | `intelligence-service` | Knowledge graph access service | — | `PENDING` | — | — | — |
| `LP-42.2_JAVA` | `intelligence-service` | Access layer validation and queries | — | `PENDING` | — | — | — |
| `LP-42.3_REGO` | `intelligence-service` | Graph access policy gating | — | `PENDING` | — | — | — |
| `LP-42.4_TEST` | `intelligence-service` | Graph access wire-through tests | — | `PENDING` | — | — | — |

### Wave 12 — External Witness & WORM Anchor

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-43.1_JAVA` | `intelligence-service` | Witness ingest and validation | — | `PENDING` | — | — | — |
| `LP-43.2_SQL` | `intelligence-service` | WORM anchor schema | — | `PENDING` | — | — | — |
| `LP-43.3_JAVA` | `intelligence-service` | Anchor signing and verification | — | `PENDING` | — | — | — |
| `LP-43.4_TS` | `intelligence-ui` | Witness and anchor UI display | — | `PENDING` | — | — | — |
| `LP-43.5_TEST` | `intelligence-service` | External witness wire-through tests | — | `PENDING` | — | — | — |

### Wave 13 — Population Reconciliation

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-44.1_JAVA` | `intelligence-service` | Reconciliation runner logic | — | `PENDING` | — | — | — |
| `LP-44.2_SQL` | `intelligence-service` | Reconciliation schema | — | `PENDING` | — | — | — |
| `LP-44.3_TS` | `intelligence-ui` | Population diff UI | — | `PENDING` | — | — | — |
| `LP-44.4_TEST` | `intelligence-service` | Reconciliation verification tests | — | `PENDING` | — | — | — |

### Wave 14 — Confidence Calibration & Ongoing Monitoring

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-51.1_PY` | `lexie-ai` | Confidence formula definition | — | `PENDING` | — | — | — |
| `LP-51.2_PY` | `lexie-ai` | Calibrator fitting logic | — | `PENDING` | — | — | — |
| `LP-51.3_JAVA` | `intelligence-service` | Calibration service and promotion records | — | `PENDING` | — | — | — |
| `LP-51.4_SQL` | `intelligence-service` | Calibration threshold schema | — | `PENDING` | — | — | — |
| `LP-51.5_TS` | `intelligence-ui` | Confidence visual grammar | — | `PENDING` | — | — | — |
| `LP-51.6_TEST` | `intelligence-service` | Confidence calibration wire-through tests | — | `PENDING` | — | — | — |

### Wave 15 — Approval Workflow Substrate

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-59.1_PY` | `lexie-ai` | Chain engine | — | `PENDING` | — | — | — |
| `LP-59.2_PY` | `lexie-ai` | Capability specs and wrappers | — | `PENDING` | — | — | — |
| `LP-59.3_REGO` | `intelligence-service` | Chain entitlement policy | — | `PENDING` | — | — | — |
| `LP-59.4_TS` | `intelligence-ui` | Step ring and approval UI | — | `PENDING` | — | — | — |
| `LP-59.5_TS` | `intelligence-ui` | Inherited authority gate | — | `PENDING` | — | — | — |
| `LP-59.6_JAVA` | `intelligence-service` | Estate ledger service | — | `PENDING` | — | — | — |
| `LP-59.7_JAVA` | `intelligence-service` | Actor directory and guardrails | — | `PENDING` | — | — | — |
| `LP-59.8_SQL` | `intelligence-service` | Approval ledger schema extension | — | `PENDING` | — | — | — |
| `LP-59.9_TEST` | `intelligence-service` | Approval workflow wire-through tests | — | `PENDING` | — | — | — |

### Wave 16 — Document Parsing Seam & Sandboxing

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-52.1_PY` | `lexie-ai` | Docling pipeline config | — | `PENDING` | — | — | — |
| `LP-52.2_PY` | `lexie-ai` | Adapter and `ParsedChunk` contract | — | `PENDING` | — | — | — |
| `LP-52.3_PY` | `lexie-ai` | Traversal and reconciliation logic | — | `PENDING` | — | — | — |
| `LP-52.4_PY` | `lexie-ai` | Label policy and error handling | — | `PENDING` | — | — | — |
| `LP-52.5_REGO` | `intelligence-service` | Parsing `tool_scope` policy | — | `PENDING` | — | — | — |
| `LP-52.6_TEST` | `intelligence-service` | Parsing seam wire-through tests | — | `PENDING` | — | — | — |
| `LP-57.1_PY` | `lexie-ai` | Exam runner | — | `PENDING` | — | — | — |
| `LP-57.2_PY` | `lexie-ai` | Grading facets | — | `PENDING` | — | — | — |
| `LP-57.3_REGO` | `intelligence-service` | Assurance gating policy | — | `PENDING` | — | — | — |
| `LP-57.4_SQL` | `intelligence-service` | Assurance schema migration | — | `PENDING` | — | — | — |
| `LP-57.5_JAVA` | `intelligence-service` | Assurance orchestration service | — | `PENDING` | — | — | — |
| `LP-57.6_TS` | `intelligence-ui` | Assurance surface UI | — | `PENDING` | — | — | — |
| `LP-57.7_TEST` | `intelligence-service` | Assurance wire-through tests | — | `PENDING` | — | — | — |
| `LP-58.1_REGO` | `intelligence-service` | `tdm_sandbox` policy | — | `PENDING` | — | — | — |
| `LP-58.2_PY` | `lexie-ai` | Sandbox probe runner | — | `PENDING` | — | — | — |
| `LP-58.3_JAVA` | `intelligence-service` | Sandbox run persistence | — | `PENDING` | — | — | — |
| `LP-58.4_TS` | `intelligence-ui` | Sandbox surface UI | — | `PENDING` | — | — | — |
| `LP-58.5_TEST` | `intelligence-service` | Sandbox wire-through tests | — | `PENDING` | — | — | — |
| `LP-60.1_REGO` | `intelligence-service` | `todo_routing` policy | — | `PENDING` | — | — | — |
| `LP-60.2_JAVA` | `intelligence-service` | Inbox service and step logic | — | `PENDING` | — | — | — |
| `LP-60.3_TS` | `intelligence-ui` | Inbox workspace UI | — | `PENDING` | — | — | — |
| `LP-60.4_TEST` | `intelligence-service` | Todo routing wire-through tests | — | `PENDING` | — | — | — |

### Wave 17 — Chunking, Vector Split & OCR Provenance

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-53.1_PY` | `lexie-ai` | Chunking rules and boundaries | — | `PENDING` | — | — | — |
| `LP-53.2_SQL` | `intelligence-service` | Document chunk schema migration | — | `PENDING` | — | — | — |
| `LP-53.3_SQL` | `intelligence-service` | Vector-store re-pointing and cleanup | — | `PENDING` | — | — | — |
| `LP-53.4_JAVA` | `intelligence-service` | Chunk retrieval and provenance DAO | — | `PENDING` | — | — | — |
| `LP-53.5_TEST` | `intelligence-service` | Chunking wire-through tests | — | `PENDING` | — | — | — |
| `LP-54.1_PY` | `lexie-ai` | OCR configuration and language seam | — | `PENDING` | — | — | — |
| `LP-54.2_PY` | `lexie-ai` | Text source provenance logic | — | `PENDING` | — | — | — |
| `LP-54.3_PY` | `lexie-ai` | Figure verification logic | — | `PENDING` | — | — | — |
| `LP-54.4_PY` | `lexie-ai` | Completeness checks and verification gate | — | `PENDING` | — | — | — |
| `LP-54.5_TS` | `intelligence-ui` | Provenance viewer UI | — | `PENDING` | — | — | — |
| `LP-54.6_TEST` | `intelligence-service` | OCR provenance wire-through tests | — | `PENDING` | — | — | — |

### Wave 18 — Footnote Association & Drop Profiles

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-55.1_PY` | `lexie-ai` | Superscript capture | — | `PENDING` | — | — | — |
| `LP-55.2_PY` | `lexie-ai` | Footnote association logic | — | `PENDING` | — | — | — |
| `LP-55.3_SQL` | `intelligence-service` | Chunk reference tables | — | `PENDING` | — | — | — |
| `LP-55.4_JAVA` | `intelligence-service` | Footnote retrieval joins and services | — | `PENDING` | — | — | — |
| `LP-55.5_TS` | `intelligence-ui` | Footnote display UI | — | `PENDING` | — | — | — |
| `LP-55.6_TEST` | `intelligence-service` | Footnote wire-through tests | — | `PENDING` | — | — | — |
| `LP-56.1_PY` | `lexie-ai` | Drop profile proposer | — | `PENDING` | — | — | — |
| `LP-56.2_REGO` | `intelligence-service` | `drop_profile` policy | — | `PENDING` | — | — | — |
| `LP-56.3_JAVA` | `intelligence-service` | Versioned drop profile service | — | `PENDING` | — | — | — |
| `LP-56.4_TS` | `intelligence-ui` | SME ruling surface | — | `PENDING` | — | — | — |
| `LP-56.5_TEST` | `intelligence-service` | Drop profile wire-through tests | — | `PENDING` | — | — | — |

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
