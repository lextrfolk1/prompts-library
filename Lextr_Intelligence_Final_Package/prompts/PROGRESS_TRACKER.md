# Lextr Intelligence Platform — Structured Prompt Progress Tracker

**Repository Branches:** `feature/lextr-intelligence-reimplementation`  
**Platform Version:** `v1.38.0`  
**Tracker Mode:** Evidence-based, prompt-by-prompt tracking  
**Current State:** Reimplementation in progress on `feature/lextr-intelligence-reimplementation`. 8/251 prompts DELIVERED (code written; tests are run in a final pass, so evidence is an artifact reference with gates marked NOT RUN). Last updated 2026-09-24.  

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
| **Wave 03** | Persistence, Human Review & Knowledge Hub | 13 | 13 | 0 | 0 | 0 | 0 | ⏳ PENDING |
| **Wave 04** | Skills 1/2/3, Masking Boundary & Assembly | 12 | 12 | 0 | 0 | 0 | 0 | ⏳ PENDING |
| **Wave 05** | Graph Walk, Lineage & Cytoscape DAG | 16 | 16 | 0 | 0 | 0 | 0 | ⏳ PENDING |
| **Wave 06** | Assembly, Preset Management & Semantic Queries | 25 | 25 | 0 | 0 | 0 | 0 | ⏳ PENDING |
| **Wave 07** | Evidence Ledger, Merkle Chaining & AU-9 Integrity | 58 | 58 | 0 | 0 | 0 | 0 | ⏳ PENDING |
| **Wave 08** | Reason Code Registry, Locale Tokens & Multi-Tenancy | 24 | 24 | 0 | 0 | 0 | 0 | ⏳ PENDING |
| **Wave 09** | Cross-Product Integration Baseline | 0 | 0 | 0 | 0 | 0 | 0 | ⚪ Empty |
| **Wave 10** | UC10 Refine & Build, Report Store & Domain Resolution | 23 | 23 | 0 | 0 | 0 | 0 | ⏳ PENDING |
| **Wave 11** | Knowledge Graph Access Layer | 4 | 4 | 0 | 0 | 0 | 0 | ⏳ PENDING |
| **Wave 12** | External Witness & WORM Anchor | 5 | 5 | 0 | 0 | 0 | 0 | ⏳ PENDING |
| **Wave 13** | Population Reconciliation | 4 | 4 | 0 | 0 | 0 | 0 | ⏳ PENDING |
| **Wave 14** | Confidence Calibration & Ongoing Monitoring | 6 | 6 | 0 | 0 | 0 | 0 | ⏳ PENDING |
| **Wave 15** | Approval Workflow Substrate | 9 | 9 | 0 | 0 | 0 | 0 | ⏳ PENDING |
| **Wave 16** | Document Parsing Seam & Sandboxing | 22 | 22 | 0 | 0 | 0 | 0 | ⏳ PENDING |
| **Wave 17** | Chunking, Vector Split & OCR Provenance | 11 | 11 | 0 | 0 | 0 | 0 | ⏳ PENDING |
| **Wave 18** | Footnote Association & Drop Profiles | 11 | 11 | 0 | 0 | 0 | 0 | ⏳ PENDING |
| **TOTAL** | **Full 18-Wave Platform Scope** | **251** | **243** | **0** | **0** | **8** | **0** | **3.2% delivered** |

---

## 3. Wave Execution & Verification Detail

This section is the operational tracker. Each prompt gets a row and must be updated independently.

### Wave 01 — Baseline Schema & UI Core Foundations

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-01.1_SQL` | `intelligence-service` | Baseline schema DDL and migration setup | - | `DELIVERED` | `intelligence-service`: `src/main/resources/db/migration/V1__intelligence_schema_init.sql`, `V2__uc1a_seed.sql` (byte-exact `ddl_body`), `V3__knowledge_hub_ingestion.sql`, `V4__register_variance_slm.sql` (fixed 2026-09-24); test `src/test/resources/db/LP-01.1_schema_verify.sql`; README `docs/deliverables/LP-01.1_README.md`; gates NOT RUN | 2026-09-24 | V1 provisional until Part-M (Option A). V3 fixed (own `kh_ingestion_status` type, B1); V4 fixed (mapped to V1 `model_registry`). SME must set Flyway placeholders `variance_slm_model_id`, `variance_fine_tune_version`, `variance_slm_artifact_uri` before migrate |
| `LP-02.1_TS` | `intelligence-ui` | Tenant + host shell foundation | - | `DELIVERED` | `intelligence-ui`: `src/components/themes/{TenantThemeProvider,ExternalStylesheet,Logo,SurfaceContainer,fallbackTheme,tenantTypes}`, `src/embed/{index,mountIntelligence,IntelligenceElement}`; tests `themes/__tests__/*`, `embed/__tests__/*`; README `LP-02.1-README.md`; tests NOT RUN | 2026-09-24 | Module Federation plugin + Vite lib build not wired; OPA stylesheet-decision route open; React 19 vs pinned 18; run `npm install` for @emotion/cache lock entry |
| `LP-02.2_TS` | `intelligence-ui` | Masking-safe UI atoms and shared rendering | - | `DELIVERED` | `intelligence-ui`: adapted `atoms/{MaskedValue,RunProgress,LextrChart}`, `organisms/{EvidenceLedgerViewer,OutputRenderer}`, `store/useIntelligenceStore`; overlay contract `atoms/overlayContract.ts`; `src/embed/atoms.ts`; tests `__tests__/atomsContract.test.tsx` (all 15 tests_must_cover mapped), `MaskedValue.test.tsx`; README `LP-02.2-README.md`; tests NOT RUN | 2026-09-24 | OI-10 settled = run-shaped. ledgerState/display strings from service open; real-browser run + focus trap not asserted; React 19 vs pinned 18 |

### Wave 02 — Run Protocol, Policy & SLM Baseline

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-03.2_JAVA` | `intelligence-service` | `/run` DTO contract and SemVer package | - | `DELIVERED` | `intelligence-service`: `pom.xml` (single project; `run-contract` classifier jar), `contract/run/v1/*`, `run/RunController`, `common/*`, `exception/*`, `config/*`; tests `contract/run/v1/*Test`, `run/RunEntryPointsTest`, `run/RunWireThroughTest`, `run/RunLaneWritesNothingTest`; README `docs/deliverables/LP-03.2_README.md`; `mvn test-compile` clean; tests NOT RUN | 2026-09-24 | ApiResponse/ErrorDetail/mapping authored early for LP-33 (confirm correlation_id {state,value}); no auth/tenant resolution yet |
| `LP-03.3_JAVA` | `intelligence-service` | Synchronous `/run` service and cache semantics | - | `DELIVERED` | `intelligence-service`: `run/{RunService,RunServiceImpl,LexieRuntimeClient,WebClientLexieRuntimeClient,RunResultStore,InMemoryRunResultStore}`, `config/WebSocketConfig`; tests `run/RunServiceImplTest`, `run/RunLaneWritesNothingTest`; README `docs/deliverables/LP-03.3_README.md`; `mvn test-compile` clean; tests NOT RUN | 2026-09-24 | lexie-ai `/api/v1/intelligence/run` not yet published (skill lanes) → /run 502 until then; in-memory result store is single-instance; contract release process unowned |
| `LP-03.5_TEST` | `intelligence-service` | Wire-through serialization test | - | `DELIVERED` | `intelligence-service`: `src/test/java/.../run/RunWireThroughTest.java` (plain-mapper host side, STOMP converter path, camelCase mutant); README `docs/deliverables/LP-03.5_README.md`; `mvn test-compile` clean; tests NOT RUN | 2026-09-24 | N-1 additive case lives in contract `AdditiveVocabularyTest` |
| `LP-04.1_REGO` | `intelligence-service` | OPA root + shared policy bundles | - | `DELIVERED` | `intelligence-service`: `src/main/resources/opa/` (.manifest, lextr.ai.{evaluate,common,tool_scope,capability,cost_guardrails,model_routing,embedding_call,masking,mrm_sod}, detector + registry data); tests `src/test/resources/opa/lextr/ai/bundle_test.rego`, `policy/OpaBundleOwnershipTest`; README `docs/deliverables/LP-04.1_README.md`; `opa check --strict` clean (OPA 1.4.2); `opa test` NOT RUN | 2026-09-24 | Use-case packages namespaced `lextr.ai.tool_scope_uc.<uc>` (manifest says tool_scope_<uc>) — LP-24.4/25.4/37.3/38.3 must follow; owner to confirm local-only set {RESTRICTED, MNPI}; bundle deploy to policy-service pending |
| `LP-05.1_JAVA` | `intelligence-service` | Model resolution and routing | - | `DELIVERED` | `intelligence-service`: `model/*` (ModelResolutionServiceImpl, ModelRegistryDao/Impl), `policy/*` (OpaPolicyClient fail-closed), `util/SQLQueryLoaderUtil`, `queries.properties`; tests `model/ModelResolutionServiceImplTest`, `exception/ErrorMappingConformanceTest`, `JavaLaneGateTest`; README `docs/deliverables/LP-05.1_README.md`; `mvn test-compile` clean; tests NOT RUN | 2026-09-24 | RoutingViolation has no mapping row — gate asserts it (declared gap) for LP-33; egress not assertable here (LP-10) |

### Wave 03 — Persistence, Human Review & Knowledge Hub

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-06.1_SQL` | `intelligence-service` | Control-plane persistence SQL | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-06.2_JAVA` | `intelligence-service` | Persist run writer consumer path | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-06.4_TEST` | `intelligence-service` (+ `lexie-ai`) | Producer-to-consumer buffer test | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-06.5_SQL` | `intelligence-service` | Archive row + hash persistence | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-06.6_JAVA` | `intelligence-service` | Archive write and fail-open refused path | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-06.7_TEST` | `intelligence-service` (+ `lexie-ai`) | Archive round-trip and AU-9 assertions | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-07.1_SQL` | `intelligence-service` | Review queue SQL reads | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-07.2_JAVA` | `intelligence-service` | Review queue service and state machine | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-07.4_JAVA` | `intelligence-service` | Review authorization transitions and actions | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-08.1_SQL` | `intelligence-service` | Knowledge hub statements and single retrieval query | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-08.2_JAVA` | `intelligence-service` | Knowledge hub boundary and endpoint seam | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-08.3_JAVA` | `intelligence-service` | Knowledge hub orchestration service | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-08.6_TEST` | `intelligence-service` | Knowledge hub wire-through tests | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |

### Wave 04 — Skills 1/2/3, Masking Boundary & Assembly

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-09.1_PY` | `lexie-ai` | Skill 1 deterministic resolution | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-10.1_PY` | `lexie-ai` | Masking boundary and classification | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-10.4_PY` | `lexie-ai` | Prompt composition / grounding payload | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-11.1_PY` | `lexie-ai` | Skill 3 SLM assembly path | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-12.1_SQL` | `intelligence-service` | Preset and envelope SQL | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-12.2_JAVA` | `intelligence-service` | Preset API and SoD controls | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-12.3_JAVA` | `intelligence-service` | Governed preset service lifecycle | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-12.4_JAVA` | `intelligence-service` | Preset DAO layer | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-12.5_TS` | `intelligence-ui` | Preset authoring UI | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-12.7_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Four-eyes preset wire-through tests | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-12.8_PY` | `lexie-ai` | Instruction resolution and slot validation | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-13.3_TEST` | `intelligence-service` | Host adapter seam tests | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |

### Wave 05 — Graph Walk, Lineage & Cytoscape DAG

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-14.0_SQL` | `intelligence-service` | Reporting cycle tables and thresholds | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-14.1_PY` | `lexie-ai` | Horizontal variance skill | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-14.2_JAVA` | `intelligence-service` | Variance run coordinator | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-14.3_REGO` | `intelligence-service` | `tool_scope_variance` policy | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-14.4_TEST` | `intelligence-service` (+ `lexie-ai`) | Variance wire-through tests | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-15.1_TS` | `intelligence-ui` | Variance workspace UI | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-16.1_PY` | `lexie-ai` | SkillTwo vertical DAG walk | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-16.3_TEST` | `lexie-ai` | Vertical cross-layer tests | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-17.1_TS` | `intelligence-ui` | Drill workspace shell | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-17.2_CYTO` | `intelligence-ui` | Cytoscape/ELK DAG renderer | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-18.1_PY` | `lexie-ai` | Evidence substeps | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-19.1_PY` | `lexie-ai` | Re-run with analyst hypothesis | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-19.2_SQL` | `intelligence-service` | Rerun audit schema | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-19.3_JAVA` | `intelligence-service` | Re-run service and lineage preservation | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-19.4_TS` | `intelligence-ui` | Re-run overlay UI | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-19.5_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Rerun wire-through tests | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |

### Wave 06 — Assembly, Preset Management & Semantic Queries

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-20.1_PY` | `lexie-ai` | Operational query skill | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-20.2_JAVA` | `intelligence-service` | Operational run coordinator | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-20.3_REGO` | `intelligence-service` | `tool_scope_operational` policy | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-20.5_TEST` | `intelligence-service` (+ `lexie-ai`) | Operational wire-through tests | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-21.1_PY` | `lexie-ai` | Semantic & reference skill | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-21.2_JAVA` | `intelligence-service` | Semantic coordinator and preset resolver | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-21.3_REGO` | `intelligence-service` | `tool_scope_semantic` policy | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-21.4_TS` | `intelligence-ui` | Semantic workspace UI | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-21.5_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Semantic wire-through tests | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-22.1_SQL` | `intelligence-service` | Registered definition schema | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-22.2_JAVA` | `intelligence-service` | Registered definition controller | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-22.3_JAVA` | `intelligence-service` | Writer logical reconciliation | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-22.4_TS` | `intelligence-ui` | Skill registry UI | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-22.5_REGO` | `intelligence-service` | `mrm_sod` policy bundle | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-22.6_TEST` | `intelligence-service` (+ `intelligence-ui`) | Skill registry wire-through tests | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-37.1_PY` | `lexie-ai` | Impact analysis skill | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-37.2_JAVA` | `intelligence-service` | Impact preset resolver | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-37.3_REGO` | `intelligence-service` | `tool_scope_impact` policy | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-37.4_TS` | `intelligence-ui` | Impact answer UI | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-37.5_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Impact wire-through tests | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-38.1_PY` | `lexie-ai` | Trend analysis skill | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-38.2_JAVA` | `intelligence-service` | Trend preset resolver | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-38.3_REGO` | `intelligence-service` | `tool_scope_trend` policy | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-38.4_TS` | `intelligence-ui` | Trend answer UI | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-38.5_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Trend wire-through tests | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |

### Wave 07 — Evidence Ledger, Merkle Chaining & AU-9 Integrity

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-39.1_SQL` | `intelligence-service` | Reason-code ledger migration | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-39.2_JAVA` | `intelligence-service` | Training domain DAO and service | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-39.3_REGO` | `intelligence-service` | TDM ring-fence policy | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-39.4_PY` | `lexie-ai` | Fine-tune executor | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-39.5_TS` | `intelligence-ui` | Training data UI | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-39.6_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Reason-code cross-layer tests | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-23.1_PY` | `lexie-ai` | Analytical assist skill | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-24.1_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Merkle protocol core tests | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-24.2_SQL` | `intelligence-service` | Merkle tree ledger migration | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-24.3_PY` | `lexie-ai` | Merkle analytical skill | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-24.4_REGO` | `intelligence-service` | `tool_scope_analytical` policy | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-24.5_JAVA` | `intelligence-service` | Analytical preset resolver | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-24.6_TS` | `intelligence-ui` | Merkle workspace UI | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-24.7_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Merkle wire-through tests | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-25.1_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | AU-9 simulation and logic harness | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-25.2_SQL` | `intelligence-service` | AU-9 ledger schema migration | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-25.3_PY` | `lexie-ai` | Rules skill and extractor | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-25.4_REGO` | `intelligence-service` | `tool_scope_rules` policy | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-25.5_JAVA` | `intelligence-service` | Coordinator + acceptance receipt | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-25.6_TS` | `intelligence-ui` | Evidence workspace UI | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-25.7_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | AU-9 export wire-through tests | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-25.8_TS` | `intelligence-ui` | AU-9 panel redesign | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-25.9_TS` | `intelligence-ui` | Lexie entry point integration | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-26.1_SQL` | `intelligence-service` | Evidence schema migration set | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-26.2_JAVA` | `intelligence-service` | Recording service and rules | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-26.3_JAVA` | `intelligence-service` | Query and export surface | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-26.4_JAVA` | `intelligence-service` | Lifecycle engine | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-26.5_JAVA` | `intelligence-service` | Correlation and actor attribution | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-26.6_PY` | `lexie-ai` | Producer runtime and evidence recorder | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-26.7_TS` | `intelligence-ui` | Audit evidence UI models | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-26.8_SQL` | `intelligence-service` | Retention, archive, coverage SQL | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-26.9_SQL` | `intelligence-service` | Header transition history and coverage | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-26.10_SQL` | `intelligence-service` | Three-role split and purge migration | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-26.12_REGO` | `intelligence-service` | `audit_read` policy bundle | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-26.13_TS` | `intelligence-ui` | Forward-door evidence UI | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-26.14_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Drift gate and reconciliation tests | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-26.15_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Estate-wide audit test gate | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-26.16_JAVA` | `intelligence-service` | Evidence pack export | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-26.17_JAVA` | `intelligence-service` | Evidence pack verifier and hand-back | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-26.18_REGO` | `intelligence-service` | Export entitlement policy | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-26.19_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Chain formula and cross-layer tests | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-26.20_JAVA` | `intelligence-service` | Draft vs approved export logic | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-26.21_TS` | `intelligence-ui` | Audit evidence screen and pack view | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-26.22_PY` | `lexie-ai` | Generated model documentation | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-26.23_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Cross-language claim gate | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-26.24_SQL` | `intelligence-service` | Approval/discharge schema | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-26.25_JAVA` | `intelligence-service` | Discharge and registration logic | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-26.26_REGO` | `intelligence-service` | Obligation discharge validator | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-26.27_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Undischarged obligation gate | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-26.28_SQL` | `intelligence-service` | Erasure event migration | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-26.29_JAVA` | `intelligence-service` | Erasure and event append service | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-26.30_JAVA` | `intelligence-service` | Withheld/erased/absent export semantics | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-26.31_REGO` | `intelligence-service` | Erasure authority policy | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-26.32_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Erasure chain tests | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-27.1_PY` | `lexie-ai` | Evidence bundle aggregator | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-27.2_JAVA` | `intelligence-service` | Orchestration seam for evidence export | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-28.1_PY` | `lexie-ai` | Proof verifier and receipt validator | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-28.2_JAVA` | `intelligence-service` | Proof validation controller/service | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |

### Wave 08 — Reason Code Registry, Locale Tokens & Multi-Tenancy

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-29.1_JAVA` | `intelligence-service` | OpenAPI documentation and service exposure | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-30.1_JAVA` | `intelligence-service` | Logging and centralized config | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-31.1_JAVA` | `intelligence-service` | Database composition root | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-32.1_JAVA` | `intelligence-service` | Status update and tenant-safe writes | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-33.1_JAVA` | `intelligence-service` | Tenant configuration manager | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-33.3_PY` | `lexie-ai` | Tenant runtime config subscriber | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-34.1_JAVA` | `intelligence-service` | Completeness gate and capability checker | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-35.1_JAVA` | `intelligence-service` | Health, readiness, liveness and metrics | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-40.1_SQL` | `intelligence-service` | Locale and run contract schema | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-40.2_PY` | `lexie-ai` | Reason-code replacement for prose fields | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-40.3_REGO` | `intelligence-service` | Policy-based reason-code decisions | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-40.4_TS` | `intelligence-ui` | i18n runtime and string extraction | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-40.5_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Locale no-translate tests | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-47.1_TEST` | `intelligence-ui` | Supervisory reachability and gate tests | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-47.2_TS` | `intelligence-ui` | Structural radar workspace UI | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-47.3_TS` | `intelligence-ui` | Mount contracts and registry wiring | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-47.4_TS` | `intelligence-ui` | Lexie dispatcher and handoff | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-47.5_TS` | `intelligence-ui` | Host seam and boot integration | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-47.6_TS` | `intelligence-ui` | Open-items pass and shell contract | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-48.1_SQL` | `intelligence-service` | Governing ingest description schema | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-48.2_JAVA` | `intelligence-service` | Ingestion API and disposition handling | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-48.3_JAVA` | `intelligence-service` | Rule set server-side semantics | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-48.5_TS` | `intelligence-ui` | Governing ingest UI | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-48.6_TEST` | `intelligence-service` (+ `intelligence-ui`) | Negative suite and mutation test port | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |

### Wave 09 — Cross-Product Integration Baseline

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| — | — | No prompts currently defined | — | `DEFERRED` | — | 2026-09-24 | Placeholder wave; not started |

### Wave 10 — UC10 Refine & Build, Report Store & Domain Resolution

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-41.1_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | DOM-free protocol core tests | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-41.2_REGO` | `intelligence-service` | UC10 analytical policy gates | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-41.3_PY` | `lexie-ai` | Protocol core evaluator and mutation gate | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-41.4_JAVA` | `intelligence-service` | Semantic resolution seam service | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-41.5_TS` | `intelligence-ui` | Analytical refine slice UI | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-41.6_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Analytical seam wire-through tests | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-41.7_JAVA` | `intelligence-service` | Logical/physical resolution seam service | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-41.8_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Fail-closed wire-through for resolution seam | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-42.1_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Report-local scope & grounding core tests | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-42.2_REGO` | `intelligence-service` | High risk tier policy gates | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-42.3_PY` | `lexie-ai` | Derived attribute expression evaluator | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-42.4_JAVA` | `intelligence-service` | Derived attribute evidence & expression service | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-42.5_TS` | `intelligence-ui` | Inline placement & expression UI display | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-45.1_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Decision core for instance outcome tests | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-45.2_REGO` | `intelligence-service` | Report store search policy gating | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-45.3_PY` | `lexie-ai` | Metadata-only report store adapter | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-45.4_JAVA` | `intelligence-service` | Report store instance evidence service | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-45.5_TS` | `intelligence-ui` | Report store instance outcome UI display | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-46.0_SQL` | `intelligence-service` | Domain resolution persistence schema migration | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-46.1_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Exact/ambiguous/unresolved decision core tests | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-46.2_JAVA` | `intelligence-service` | Domain resolution evidence service | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-46.3_PY` | `lexie-ai` | Domain resolution adapter client | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-46.4_TS` | `intelligence-ui` | Domain resolution review UI display | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |

### Wave 11 — Knowledge Graph Access Layer

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-44.1_TEST` | `intelligence-service` (+ `lexie-ai`) | Op catalogue & graph traversal bounds tests | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-44.2_REGO` | `intelligence-service` | Graph traversal & named op policy gating | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-44.3_PY` | `lexie-ai` | Knowledge graph client with named ops | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-44.4_JAVA` | `intelligence-service` | Knowledge graph traversal & evidence service | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |

### Wave 12 — External Witness & WORM Anchor

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-49.1_SQL` | `intelligence-service` | Notarization receipt schema migration | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-49.2_JAVA` | `intelligence-service` | External notary service & receipt ledger | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-49.3_SQL` | `intelligence-service` | WORM retention boundary schema | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-49.4_TS` | `intelligence-ui` | Witness status & notary badge UI display | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-49.5_TEST` | `intelligence-service` (+ `intelligence-ui`) | External witness & WORM anchor wire-through tests | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |

### Wave 13 — Population Reconciliation

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-50.1_SQL` | `intelligence-service` | Inventory reconciliation schema migration | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-50.2_JAVA` | `intelligence-service` | Inventory population join & reconciliation service | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-50.3_JAVA` | `intelligence-service` | Core inventory contract interface & binding | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-50.4_TEST` | `intelligence-service` | Population reconciliation wire-through tests | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |

### Wave 14 — Confidence Calibration & Ongoing Monitoring

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-51.1_PY` | `lexie-ai` | Confidence formula definition | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-51.2_PY` | `lexie-ai` | Calibrator fitting logic | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-51.3_JAVA` | `intelligence-service` | Calibration service and promotion records | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-51.4_SQL` | `intelligence-service` | Calibration threshold schema | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-51.5_TS` | `intelligence-ui` | Confidence visual grammar | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-51.6_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Confidence calibration wire-through tests | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |

### Wave 15 — Approval Workflow Substrate

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-59.1_PY` | `lexie-ai` | Chain engine | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-59.2_PY` | `lexie-ai` | Capability specs and wrappers | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-59.3_REGO` | `intelligence-service` | Chain entitlement policy | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-59.4_TS` | `intelligence-ui` | Step ring and approval UI | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-59.5_TS` | `intelligence-ui` | Inherited authority gate | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-59.6_JAVA` | `intelligence-service` | Estate ledger service | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-59.7_JAVA` | `intelligence-service` | Actor directory and guardrails | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-59.8_SQL` | `intelligence-service` | Approval ledger schema extension | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-59.9_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Approval workflow wire-through tests | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |

### Wave 16 — Document Parsing Seam & Sandboxing

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-52.1_PY` | `lexie-ai` | Docling pipeline config | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-52.2_PY` | `lexie-ai` | Adapter and `ParsedChunk` contract | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-52.3_PY` | `lexie-ai` | Traversal and reconciliation logic | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-52.4_PY` | `lexie-ai` | Label policy and error handling | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-52.5_REGO` | `intelligence-service` | Parsing `tool_scope` policy | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-52.6_TEST` | `lexie-ai` (+ `intelligence-service`) | Parsing seam wire-through tests | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-57.1_PY` | `lexie-ai` | Exam runner | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-57.2_PY` | `lexie-ai` | Grading facets | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-57.3_REGO` | `intelligence-service` | Assurance gating policy | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-57.4_SQL` | `intelligence-service` | Assurance schema migration | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-57.5_JAVA` | `intelligence-service` | Assurance orchestration service | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-57.6_TS` | `intelligence-ui` | Assurance surface UI | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-57.7_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Assurance wire-through tests | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-58.1_REGO` | `intelligence-service` | `tdm_sandbox` policy | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-58.2_PY` | `lexie-ai` | Sandbox probe runner | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-58.3_JAVA` | `intelligence-service` | Sandbox run persistence | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-58.4_TS` | `intelligence-ui` | Sandbox surface UI | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-58.5_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Sandbox wire-through tests | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-60.1_REGO` | `intelligence-service` | `todo_routing` policy | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-60.2_JAVA` | `intelligence-service` | Inbox service and step logic | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-60.3_TS` | `intelligence-ui` | Inbox workspace UI | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-60.4_TEST` | `intelligence-service` (+ `intelligence-ui`) | Todo routing wire-through tests | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |

### Wave 17 — Chunking, Vector Split & OCR Provenance

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-53.1_PY` | `lexie-ai` | Chunking rules and boundaries | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-53.2_SQL` | `intelligence-service` | Document chunk schema migration | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-53.3_SQL` | `intelligence-service` | Vector-store re-pointing and cleanup | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-53.4_JAVA` | `intelligence-service` | Chunk retrieval and provenance DAO | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-53.5_TEST` | `intelligence-service` (+ `lexie-ai`) | Chunking wire-through tests | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-54.1_PY` | `lexie-ai` | OCR configuration and language seam | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-54.2_PY` | `lexie-ai` | Text source provenance logic | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-54.3_PY` | `lexie-ai` | Figure verification logic | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-54.4_PY` | `lexie-ai` | Completeness checks and verification gate | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-54.5_TS` | `intelligence-ui` | Provenance viewer UI | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-54.6_TEST` | `lexie-ai` (+ `intelligence-service`, `intelligence-ui`) | OCR provenance wire-through tests | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |

### Wave 18 — Footnote Association & Drop Profiles

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-55.1_PY` | `lexie-ai` | Superscript capture | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-55.2_PY` | `lexie-ai` | Footnote association logic | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-55.3_SQL` | `intelligence-service` | Chunk reference edge tables | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-55.4_JAVA` | `intelligence-service` | Footnote retrieval join | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-55.5_TS` | `intelligence-ui` | Footnote display UI | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-55.6_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Footnote wire-through tests | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-56.1_PY` | `lexie-ai` | Drop profile proposer | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-56.2_REGO` | `intelligence-service` | `drop_profile` OPA policy | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-56.3_JAVA` | `intelligence-service` | Versioned drop profile service | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-56.4_TS` | `intelligence-ui` | SME ruling surface | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |
| `LP-56.5_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Drop profile wire-through tests | - | `PENDING` | - | 2026-09-24 | Ready for reimplementation |

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
