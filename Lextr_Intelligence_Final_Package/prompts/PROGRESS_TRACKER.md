# Lextr Intelligence Platform — Structured Prompt Progress Tracker

**Repository Branches:** `feature/lextr-intelligence-v1.38.0` (active; base implementation by another model, gap-filled here) · `feature/lextr-intelligence-reimplementation` (earlier, Waves 1–4)  
**Platform Version:** `v1.38.0`  
**Tracker Mode:** Evidence-based, prompt-by-prompt tracking  
**Current State:** Working on `feature/lextr-intelligence-v1.38.0`, LP by LP: each prompt verified against the base implementation, gaps filled additively (nothing removed). 247/251 DELIVERED, 0 IN_PROGRESS, 4 PENDING. Gates/tests NOT RUN (final pass). Per-change log in section 6. Last updated 2026-09-25.  

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
| **Wave 07** | Evidence Ledger, Merkle Chaining & AU-9 Integrity | 58 | 4 | 0 | 0 | 54 | 0 | 🟡 PARTIAL |
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
| **TOTAL** | **Full 18-Wave Platform Scope** | **251** | **4** | **0** | **0** | **247** | **0** | **98.4% delivered** |

---

## 3. Wave Execution & Verification Detail

This section is the operational tracker. Each prompt gets a row and must be updated independently.

### Wave 01 — Baseline Schema & UI Core Foundations

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-01.1_SQL` | `intelligence-service` | Baseline schema DDL and migration setup | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl); gap-fill svc 84c244c (V26 kh_ingestion_status) | 2026-09-25 | gates NOT RUN |
| `LP-02.1_TS` | `intelligence-ui` | Tenant + host shell foundation | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl); gap-fill ui dcd4850 (OPA-gated TenantThemeProvider, embed) | 2026-09-25 | gates NOT RUN |
| `LP-02.2_TS` | `intelligence-ui` | Masking-safe UI atoms and shared rendering | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl); gap-fill ui 2260772 (atom contracts) | 2026-09-25 | gates NOT RUN |

### Wave 02 — Run Protocol, Policy & SLM Baseline

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-03.2_JAVA` | `intelligence-service` | `/run` DTO contract and SemVer package | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl); gap-fill svc c079e09 (producer-exact VarianceExplanation, OutputType + V27, tenant header) | 2026-09-25 | gates NOT RUN |
| `LP-03.3_JAVA` | `intelligence-service` | Synchronous `/run` service and cache semantics | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl); gap-fill svc 6b4a3a7, c079e09 (refusal not fallback, STOMP, snake_case WebClient, error table) | 2026-09-25 | gates NOT RUN |
| `LP-03.5_TEST` | `intelligence-service` | Wire-through serialization test | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl); gap-fill svc c079e09 (RunContractProducerFieldsTest) | 2026-09-25 | gates NOT RUN |
| `LP-04.1_REGO` | `intelligence-service` | OPA root + shared policy bundles | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl); gap-fill svc c079e09 (evaluate entry, capability/embedding_call/masking/model_routing/mrm_approval, data loader) | 2026-09-25 | gates NOT RUN |
| `LP-05.1_JAVA` | `intelligence-service` | Model resolution and routing | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl); gap-fill svc c079e09 (OPA model_routing obeyed) | 2026-09-25 | gates NOT RUN |

### Wave 03 — Persistence, Human Review & Knowledge Hub

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-06.1_SQL` | `intelligence-service` | Control-plane persistence SQL | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl); gap-fill svc c8329da (V28 flush/review columns) | 2026-09-25 | gates NOT RUN |
| `LP-06.2_JAVA` | `intelligence-service` | Persist run writer consumer path | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl); gap-fill svc c8329da, 5cfac1d; lexie 74c0037 (producer confidence, sweep, RFC 8785, V30 explanation persisted) | 2026-09-25 | gates NOT RUN |
| `LP-06.4_TEST` | `intelligence-service` (+ `lexie-ai`) | Producer-to-consumer buffer test | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl); gap-fill svc c8329da (StrandedRunSweepTest) | 2026-09-25 | gates NOT RUN |
| `LP-06.5_SQL` | `intelligence-service` | Archive row + hash persistence | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl); gap-fill svc c8329da | 2026-09-25 | gates NOT RUN |
| `LP-06.6_JAVA` | `intelligence-service` | Archive write and fail-open refused path | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl); gap-fill svc c8329da (FileSystemPayloadStore + binding guard) | 2026-09-25 | gates NOT RUN |
| `LP-06.7_TEST` | `intelligence-service` (+ `lexie-ai`) | Archive round-trip and AU-9 assertions | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl); gap-fill svc c8329da | 2026-09-25 | gates NOT RUN |
| `LP-07.1_SQL` | `intelligence-service` | Review queue SQL reads | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl); gap-fill svc c8329da (agent_run_review_event) + 5ed04e5 (read side) | 2026-09-25 | gates NOT RUN |
| `LP-07.2_JAVA` | `intelligence-service` | Review queue service and state machine | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl); gap-fill svc c8329da (idempotent enqueue, review events) | 2026-09-25 | gates NOT RUN |
| `LP-07.4_JAVA` | `intelligence-service` | Review authorization transitions and actions | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-08.1_SQL` | `intelligence-service` | Knowledge hub statements and single retrieval query | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl); gap-fill svc 84c244c, c8329da | 2026-09-25 | gates NOT RUN |
| `LP-08.2_JAVA` | `intelligence-service` | Knowledge hub boundary and endpoint seam | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl); gap-fill svc c8329da, 25e02e3 (KH header stamp; embedding_chunk split) | 2026-09-25 | gates NOT RUN |
| `LP-08.3_JAVA` | `intelligence-service` | Knowledge hub orchestration service | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl); gap-fill svc 25e02e3 (retrieval through embedding_chunk_source) | 2026-09-25 | gates NOT RUN |
| `LP-08.6_TEST` | `intelligence-service` | Knowledge hub wire-through tests | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |

### Wave 04 — Skills 1/2/3, Masking Boundary & Assembly

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-09.1_PY` | `lexie-ai` | Skill 1 deterministic resolution | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-10.1_PY` | `lexie-ai` | Masking boundary and classification | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-10.4_PY` | `lexie-ai` | Prompt composition / grounding payload | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-11.1_PY` | `lexie-ai` | Skill 3 SLM assembly path | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-12.1_SQL` | `intelligence-service` | Preset and envelope SQL | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-12.2_JAVA` | `intelligence-service` | Preset API and SoD controls | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl); gap-fill svc 6b4a3a7 (transition legality; SoD input keys c079e09) | 2026-09-25 | gates NOT RUN |
| `LP-12.3_JAVA` | `intelligence-service` | Governed preset service lifecycle | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-12.4_JAVA` | `intelligence-service` | Preset DAO layer | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-12.5_TS` | `intelligence-ui` | Preset authoring UI | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl); gap-fill ui 45c583d (wizard wired to service) | 2026-09-25 | observed shown as recorded gap (D7) |
| `LP-12.7_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Four-eyes preset wire-through tests | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-12.8_PY` | `lexie-ai` | Instruction resolution and slot validation | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-13.3_TEST` | `intelligence-service` | Host adapter seam tests | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |

### Wave 05 — Graph Walk, Lineage & Cytoscape DAG

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-14.0_SQL` | `intelligence-service` | Reporting cycle tables and thresholds | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl); gap-fill svc 9faef0b (V29 close guard, run-cycle binding) | 2026-09-25 | gates NOT RUN |
| `LP-14.1_PY` | `lexie-ai` | Horizontal variance skill | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-14.2_JAVA` | `intelligence-service` | Variance run coordinator | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl); gap-fill svc 9faef0b (trusted OPA input, caller tenant) | 2026-09-25 | gates NOT RUN |
| `LP-14.3_REGO` | `intelligence-service` | `tool_scope_variance` policy | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-14.4_TEST` | `intelligence-service` (+ `lexie-ai`) | Variance wire-through tests | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl); gap-fill svc 9faef0b | 2026-09-25 | gates NOT RUN |
| `LP-15.1_TS` | `intelligence-ui` | Variance workspace UI | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl); gap-fill ui c1c161d (no fabricated confidence/narrative) | 2026-09-25 | gates NOT RUN |
| `LP-16.1_PY` | `lexie-ai` | SkillTwo vertical DAG walk | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-16.3_TEST` | `lexie-ai` | Vertical cross-layer tests | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-17.1_TS` | `intelligence-ui` | Drill workspace shell | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl); gap-fill ui c1c161d | 2026-09-25 | gates NOT RUN |
| `LP-17.2_CYTO` | `intelligence-ui` | Cytoscape/ELK DAG renderer | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-18.1_PY` | `lexie-ai` | Evidence substeps | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-19.1_PY` | `lexie-ai` | Re-run with analyst hypothesis | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-19.2_SQL` | `intelligence-service` | Rerun audit schema | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-19.3_JAVA` | `intelligence-service` | Re-run service and lineage preservation | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-19.4_TS` | `intelligence-ui` | Re-run overlay UI | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | OPEN: client-side system-driver tally when server count absent (their test depends on it) |
| `LP-19.5_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Rerun wire-through tests | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |

### Wave 06 — Assembly, Preset Management & Semantic Queries

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-20.1_PY` | `lexie-ai` | Operational query skill | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-20.2_JAVA` | `intelligence-service` | Operational run coordinator | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-20.3_REGO` | `intelligence-service` | `tool_scope_operational` policy | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl); gap-fill svc 31d1ea8 (readiness from data docs) | 2026-09-25 | gates NOT RUN |
| `LP-20.5_TEST` | `intelligence-service` (+ `lexie-ai`) | Operational wire-through tests | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-21.1_PY` | `lexie-ai` | Semantic & reference skill | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-21.2_JAVA` | `intelligence-service` | Semantic coordinator and preset resolver | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl); gap-fill svc 31d1ea8 (RunResult intent/route_out) | 2026-09-25 | gates NOT RUN |
| `LP-21.3_REGO` | `intelligence-service` | `tool_scope_semantic` policy | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-21.4_TS` | `intelligence-ui` | Semantic workspace UI | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-21.5_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Semantic wire-through tests | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-22.1_SQL` | `intelligence-service` | Registered definition schema | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-22.2_JAVA` | `intelligence-service` | Registered definition controller | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-22.3_JAVA` | `intelligence-service` | Writer logical reconciliation | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl); gap-fill svc 31d1ea8 (lifecycle legality) | 2026-09-25 | gates NOT RUN |
| `LP-22.4_TS` | `intelligence-ui` | Skill registry UI | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-22.5_REGO` | `intelligence-service` | `mrm_sod` policy bundle | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-22.6_TEST` | `intelligence-service` (+ `intelligence-ui`) | Skill registry wire-through tests | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-37.1_PY` | `lexie-ai` | Impact analysis skill | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-37.2_JAVA` | `intelligence-service` | Impact preset resolver | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-37.3_REGO` | `intelligence-service` | `tool_scope_impact` policy | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl); gap-fill svc 31d1ea8 (both passes, AI_PROHIBITED) | 2026-09-25 | gates NOT RUN |
| `LP-37.4_TS` | `intelligence-ui` | Impact answer UI | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-37.5_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Impact wire-through tests | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-38.1_PY` | `lexie-ai` | Trend analysis skill | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | OPEN: two trend classifiers with different vocabularies — owner decision |
| `LP-38.2_JAVA` | `intelligence-service` | Trend preset resolver | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-38.3_REGO` | `intelligence-service` | `tool_scope_trend` policy | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl); gap-fill svc 31d1ea8 (series_ready fail-closed, AI_PROHIBITED) | 2026-09-25 | gates NOT RUN |
| `LP-38.4_TS` | `intelligence-ui` | Trend answer UI | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-38.5_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Trend wire-through tests | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |

### Wave 07 — Evidence Ledger, Merkle Chaining & AU-9 Integrity

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-39.1_SQL` | `intelligence-service` | TDM schema: 4 tables + 5 enums (V32), model_registry lineage columns (V33), query keys | - | `DELIVERED` | svc 2f0c6b6 (V32 objects: 4 tables, 5 enums; V33 model_registry trained_on_* nullable, no FK; 31 training.* keys; TrainingSchemaTest) | 2026-09-25 | spec counts 47 keys over a larger surface; 31 cover this service. FKs to registered_definition ride the pending LP-22 contract |
| `LP-39.2_JAVA` | `intelligence-service` | TDM services, DAOs, OPA gates, TrainingController, ContentSchemaSource | - | `DELIVERED` | svc 2f0c6b6, ec828c5 (training/: records, 5 DAOs, services, 4 OPA gates, TrainingController, ContentSchemaSource; TrainingServicesTest) | 2026-09-25 | gates NOT RUN |
| `LP-39.3_REGO` | `intelligence-service` | lextr.ai.tdm_ring_fence / tdm_contamination / tdm_training_env (mrm_sod reused) | - | `DELIVERED` | svc 2f0c6b6, ec828c5 (tdm_ring_fence 001-004, tdm_contamination 006, tdm_training_env 007, mrm_sod reused; training_data.json; src/test/opa/tdm_test.rego) | 2026-09-25 | OPA-TDM-006/007 need owner sign-off (extend the original five packages); training_env_ready shipped false |
| `LP-39.4_PY` | `lexie-ai` | Out-of-band fine-tune executor (Trainer port, Evaluator, job surface) | - | `DELIVERED` | lexie 23dd185 (lexie_ai/training executor, NullTrainer, Evaluator, POST /api/v1/training/jobs; tests/training) | 2026-09-25 | Trainer port unfilled and evaluator model call unwired (deployment seams, per spec) |
| `LP-39.5_TS` | `intelligence-ui` | Training Data feature slice (5 tabs, exported registration) | - | `DELIVERED` | ui 64854f2 (features/training-data: 5 tabs, store, wire types, exported registration; trainingData.test.tsx) | 2026-09-25 | registration exported; shell nav not edited (host must mount it) |
| `LP-39.6_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | TDM wire-through + Python-vs-OPA policy differential | - | `DELIVERED` | svc ec828c5 (TrainingWireThroughTest); lexie 0db1dbe (216-case Python-vs-OPA differential, 216/216 at authoring) | 2026-09-25 | differential found and fixed an unmeasured-overlap reason bug |
| `LP-23.1_PY` | `lexie-ai` | Analytical assist skill | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-24.1_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Merkle protocol core tests | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-24.2_SQL` | `intelligence-service` | Merkle tree ledger migration | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-24.3_PY` | `lexie-ai` | Merkle analytical skill | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-24.4_REGO` | `intelligence-service` | `tool_scope_analytical` policy | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-24.5_JAVA` | `intelligence-service` | Analytical preset resolver | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-24.6_TS` | `intelligence-ui` | Merkle workspace UI | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-24.7_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Merkle wire-through tests | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-25.1_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | UC11 logic harness (entry state x rule kind) | - | `DELIVERED` | lexie 1d70226 (tests/rules/test_rules_harness.py over shared fixtures.json) | 2026-09-25 | D0 simulation core not in the package; harness states expected outcomes as data instead |
| `LP-25.2_SQL` | `intelligence-service` | UC11 schema: enum values (_01) + agent_run columns (_02) | - | `DELIVERED` | svc 1008804 (V34 rule_draft + doc_type values; V35 invocation_origin, authoring_session_ref, accepted_rule_ref/_version/_at, uc11 origin CHECK, acceptance pair CHECK, 2 partial indexes; 7 rules.run.* keys) | 2026-09-25 | origin + session written IN the insert (svc ee6d961) because the CHECK fires on INSERT |
| `LP-25.3_PY` | `lexie-ai` | Bounded rules skill (deterministic layer leads) | - | `DELIVERED` | lexie fee7f05 (skills/rules: contract, adapter_ops, checks, skill, manifest; fixtures + tests) | 2026-09-25 | rule_kind required from Core (DEC-LP-25-3 recommended option) |
| `LP-25.4_REGO` | `intelligence-service` | lextr.ai.tool_scope_rules | - | `DELIVERED` | svc 1008804 (ops, 3 readiness gates via data, fan-out cap datum, polarity eligibility, review denies model op, ledger ungated; src/test/opa/tool_scope_rules_test.rego) | 2026-09-25 | readiness data shipped true (current behaviour) |
| `LP-25.5_JAVA` | `intelligence-service` | UC11 coordinator, acceptance receipt, session-bounded persistence | - | `DELIVERED` | svc ee6d961 (rules/: RulesDecisions, RulesAssistDao, RulesAssistCoordinator, RulesAssistController /api/intelligence/rules/*; RulesAssistTest) | 2026-09-25 | gates NOT RUN |
| `LP-25.6_TS` | `intelligence-ui` | Embedded RulesAssistPanel slice (DD-36) | - | `DELIVERED` | ui 953078f (features/rules: mount contract as data, patch acceptance, no storage/anchors) | 2026-09-25 | Core mounts the panel; the Intelligence demo shell keeps its roadmap screen |
| `LP-25.7_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | UC11 cross-language reconciliation | - | `DELIVERED` | lexie 1d70226 (tests/rules/test_rules_cross_language.py reading all three repos) | 2026-09-25 | skips when sibling repos absent |
| `LP-25.8_TS` | `intelligence-ui` | Four-tab panel redesign + GovernedValuesTable | - | `DELIVERED` | ui 953078f (Understand/Build/Check/Compare, include/exclude IN/NOT IN, retired blocked, registration request) | 2026-09-25 | click-tested controls |
| `LP-25.9_TS` | `intelligence-ui` | LexiAI entry point (one render model, two projections) | - | `DELIVERED` | ui 953078f (ASK_WIRING UC11, shell rulesArrived/openRulesFromLexie, LexiePanel handoff, harness-only inline renderer) | 2026-09-25 | only en-US shipped; es asserted via test catalogue |
| `LP-26.1_SQL` | `intelligence-service` | Evidence schema migration set | - | `DELIVERED` | svc 55c96e7 (V36: generic GUC fence, tenant-day chain trigger, monotonic head, run/step provenance + refusal/traversal CHECKs, one PLAN per run, agent_run_anchor 4 roles, evidence_ledger_day) | 2026-09-25 | agent_run_step fence admits one additive `input` merge (LP-42.4/45.4) - recorded deviation |
| `LP-26.2_JAVA` | `intelligence-service` | Recording service and rules | - | `DELIVERED` | svc fd13fc2 (evidence/recording/RecordingRules; EvidenceLedgerCoreTest) | 2026-09-25 | gates NOT RUN |
| `LP-26.3_JAVA` | `intelligence-service` | Query and export surface | - | `DELIVERED` | svc fd13fc2 (query/EvidenceQueryCore, EvidenceLedgerDao, EvidenceReadService, EvidenceLedgerController /api/intelligence/evidence) | 2026-09-25 | gates NOT RUN |
| `LP-26.4_JAVA` | `intelligence-service` | Lifecycle engine | - | `DELIVERED` | svc fd13fc2 (lifecycle/EvidenceLifecycleEngine + PortsImpl + Wiring; no scheduler) | 2026-09-25 | lifecycle runs on request; ops/lp26_evidence_purge.sh for operators |
| `LP-26.5_JAVA` | `intelligence-service` | Correlation and actor attribution | - | `DELIVERED` | svc fd13fc2, 89d9639 (correlation/CorrelationContext; actor/ActorContext + ActorWiring; EvidenceSpringWiringTest) | 2026-09-25 | actor attribution ships OFF (lextr.evidence.actor.enabled) |
| `LP-26.6_PY` | `lexie-ai` | Producer runtime and evidence recorder | - | `DELIVERED` | lexie fea13ae (runtime/correlation, skill_identity, plan, evidence_lp26; adapter/denial_recording, correlated_gateway) | 2026-09-25 | gates NOT RUN |
| `LP-26.7_TS` | `intelligence-ui` | Audit evidence UI models | - | `DELIVERED` | ui 1750499 (features/audit-evidence/model decision-core port); svc c6beb03 (shared corpora) | 2026-09-25 | gates NOT RUN |
| `LP-26.8_SQL` | `intelligence-service` | Retention, archive, coverage SQL | - | `DELIVERED` | svc 55c96e7 (V37: evidence_retention extend-only + prospective lowering, 180-day floor, evidence_archive receipts, ledger marker, evidence_day_coverage ranking) | 2026-09-25 | gates NOT RUN |
| `LP-26.9_SQL` | `intelligence-service` | Header transition history and coverage | - | `DELIVERED` | svc 55c96e7 (V38: agent_run_event chained; header-history trigger; evidence_coverage + verify_chain_coverage() from the catalogue) | 2026-09-25 | satisfies LP-49.2's dependency |
| `LP-26.10_SQL` | `intelligence-service` | Three-role split and purge migration | - | `DELIVERED` | svc 55c96e7 (V38 evidence_purge_day whole-day only, tombstone + receipt; ops/lp26_evidence_roles.sql, ops/lp26_evidence_purge.sh) | 2026-09-25 | role grants are an ops script, not a migration (roles are cluster objects) |
| `LP-26.12_REGO` | `intelligence-service` | `audit_read` policy bundle | - | `DELIVERED` | svc fd13fc2, fc7cabb (lextr.ai.audit_read AUDIT-001..007 + obligations; audit_read_data; src/test/opa/evidence_test.rego) | 2026-09-25 | gates NOT RUN |
| `LP-26.13_TS` | `intelligence-ui` | Forward-door evidence UI | - | `DELIVERED` | ui 1750499 (components/InvolvementPanel forward door; auditEvidence.test.tsx) | 2026-09-25 | gates NOT RUN |
| `LP-26.14_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Drift gate and reconciliation tests | - | `DELIVERED` | lexie 33627fa (tests/evidence_lp26/test_lp26_gates.py drift gate, both directions) | 2026-09-25 | skips when sibling repos absent |
| `LP-26.15_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Estate-wide audit test gate | - | `DELIVERED` | lexie 33627fa (estate audit: every LP-26 source named by a gate); svc 89d9639 (closes the 7 unnamed Spring classes) | 2026-09-25 | static pre-check green at authoring |
| `LP-26.16_JAVA` | `intelligence-service` | Evidence pack export | - | `DELIVERED` | svc fd13fc2 (export/EvidencePackWriter, PackFormat) | 2026-09-25 | gates NOT RUN |
| `LP-26.17_JAVA` | `intelligence-service` | Evidence pack verifier and hand-back | - | `DELIVERED` | svc fd13fc2 (export/verify/PackVerifier, verdict incl. manifestHash; hand-back reports issued-by-us separately) | 2026-09-25 | gates NOT RUN |
| `LP-26.18_REGO` | `intelligence-service` | Export entitlement policy | - | `DELIVERED` | svc fd13fc2 (export entitlement in lextr.ai.audit_read) | 2026-09-25 | gates NOT RUN |
| `LP-26.19_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Chain formula and cross-layer tests | - | `DELIVERED` | svc c6beb03 (corpora chain_formula/tamper_evidence + SharedCorpusTest); lexie 33627fa (Python chain mirror) | 2026-09-25 | one formula, two implementations, one corpus |
| `LP-26.20_JAVA` | `intelligence-service` | Draft vs approved export logic | - | `DELIVERED` | svc fd13fc2 (export/ExportDisposition draft vs approved) | 2026-09-25 | gates NOT RUN |
| `LP-26.21_TS` | `intelligence-ui` | Audit evidence screen and pack view | - | `DELIVERED` | ui 1750499 (DispositionBadge + pack view over shared disposition corpus) | 2026-09-25 | gates NOT RUN |
| `LP-26.22_PY` | `lexie-ai` | Generated model documentation | - | `DELIVERED` | lexie fea13ae (runtime/model_documentation generator, claims.json, LIMITATIONS.md) | 2026-09-25 | gates NOT RUN |
| `LP-26.23_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Cross-language claim gate | - | `DELIVERED` | lexie 33627fa (every documented control implemented and tested) | 2026-09-25 | gates NOT RUN |
| `LP-26.24_SQL` | `intelligence-service` | Approval/discharge schema | - | `DELIVERED` | svc 55c96e7 (V39 evidence_read_event, evidence_export_pack) | 2026-09-25 | gates NOT RUN |
| `LP-26.25_JAVA` | `intelligence-service` | Discharge and registration logic | - | `DELIVERED` | svc fd13fc2, 89d9639 (EvidenceReadService: no answer without its record; undischargeable allow refused) | 2026-09-25 | gates NOT RUN |
| `LP-26.26_REGO` | `intelligence-service` | Obligation discharge validator | - | `DELIVERED` | svc fd13fc2 (obligation_defects in lextr.ai.audit_read) | 2026-09-25 | gates NOT RUN |
| `LP-26.27_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Undischarged obligation gate | - | `DELIVERED` | lexie 33627fa (every obligation destination has a writer) | 2026-09-25 | gates NOT RUN |
| `LP-26.28_SQL` | `intelligence-service` | Erasure event migration | - | `DELIVERED` | svc 55c96e7 (V40 evidence_payload_erasure, chained, no body) | 2026-09-25 | gates NOT RUN |
| `LP-26.29_JAVA` | `intelligence-service` | Erasure and event append service | - | `DELIVERED` | svc fd13fc2, 89d9639 (lifecycle erasure path + PayloadStore.delete) | 2026-09-25 | gates NOT RUN |
| `LP-26.30_JAVA` | `intelligence-service` | Withheld/erased/absent export semantics | - | `DELIVERED` | svc fd13fc2 (EvidenceQueryCore.PayloadState WITHHELD / ERASED / ABSENT) | 2026-09-25 | gates NOT RUN |
| `LP-26.31_REGO` | `intelligence-service` | Erasure authority policy | - | `DELIVERED` | svc fd13fc2 (lextr.ai.evidence_lifecycle: purge four-eyes by principal, retention lowering, erasure separate) | 2026-09-25 | DEC-LP-26-1: erasure authorities shipped EMPTY (deny) - owner to name |
| `LP-26.32_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Erasure chain tests | - | `DELIVERED` | lexie 33627fa (erasure row chained, carries no body); svc fc7cabb (evidence_test.rego) | 2026-09-25 | gates NOT RUN |
| `LP-27.1_PY` | `lexie-ai` | Evidence bundle aggregator | - | `PENDING` | - | 2026-09-25 | PROPOSED/unbuilt in spec; v1.38.0 used the number for other features — design doc, step 7 |
| `LP-27.2_JAVA` | `intelligence-service` | Orchestration seam for evidence export | - | `PENDING` | - | 2026-09-25 | PROPOSED/unbuilt in spec; v1.38.0 used the number for other features — design doc, step 7 |
| `LP-28.1_PY` | `lexie-ai` | Proof verifier and receipt validator | - | `PENDING` | - | 2026-09-25 | PROPOSED/unbuilt in spec; v1.38.0 used the number for other features — design doc, step 7 |
| `LP-28.2_JAVA` | `intelligence-service` | Proof validation controller/service | - | `PENDING` | - | 2026-09-25 | PROPOSED/unbuilt in spec; v1.38.0 used the number for other features — design doc, step 7 |

### Wave 08 — Reason Code Registry, Locale Tokens & Multi-Tenancy

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-29.1_JAVA` | `intelligence-service` | OpenAPI documentation and service exposure | - | `DELIVERED` | svc 5ed04e5 (OpenApiConfig, @Tag x28, route-coverage gate) | 2026-09-25 | gates NOT RUN |
| `LP-30.1_JAVA` | `intelligence-service` | Logging and centralized config | - | `DELIVERED` | svc 5ed04e5 (logback-spring, redaction, correlation MDC) | 2026-09-25 | gates NOT RUN |
| `LP-31.1_JAVA` | `intelligence-service` | Database composition root | - | `DELIVERED` | svc 5ed04e5 (Hikari, startup SQL check, key-coverage + width gate) | 2026-09-25 | gates NOT RUN |
| `LP-32.1_JAVA` | `intelligence-service` | Status update and tenant-safe writes | - | `DELIVERED` | svc 5ed04e5 (service-JWT, lextr.ai.runtime_config, secret scan opt-in) | 2026-09-25 | gates NOT RUN |
| `LP-33.1_JAVA` | `intelligence-service` | Tenant configuration manager | - | `DELIVERED` | svc 5ed04e5 (TransitionConflict 409 with (status, action)) | 2026-09-25 | gates NOT RUN |
| `LP-33.3_PY` | `lexie-ai` | Tenant runtime config subscriber | - | `DELIVERED` | lexie 32e073d (errors.py at composition root; lock 422) | 2026-09-25 | gates NOT RUN |
| `LP-34.1_JAVA` | `intelligence-service` | Completeness gate and capability checker | - | `DELIVERED` | svc 5ed04e5 (completeness gate, -Pcoverage-gate) | 2026-09-25 | gates NOT RUN |
| `LP-35.1_JAVA` | `intelligence-service` | Health, readiness, liveness and metrics | - | `DELIVERED` | svc 5ed04e5 (probes, readiness, required OTLP, fail-closed retry) | 2026-09-25 | gates NOT RUN |
| `LP-40.1_SQL` | `intelligence-service` | Locale on /run contract, RunResult and agent_run | - | `DELIVERED` | svc 2a32f6f (RunLocale, V31, RunLocaleTest) | 2026-09-25 | gates NOT RUN |
| `LP-40.2_PY` | `lexie-ai` | Reason codes replace composed prose in lexie-ai | - | `DELIVERED` | lexie 44369ec (reason_codes.py + reason_codes.en.json, 43 codes; 46 sites / 15 modules; tests/test_no_composed_prose.py AST gate) | 2026-09-25 | renderings byte-identical; DTO fields still typed str (code on ReasonText) — exposing reason_code on wire DTOs is a follow-up |
| `LP-40.3_REGO` | `intelligence-service` | Reason codes + params on every deny reason (verbatim rendering) | - | `DELIVERED` | svc 2a32f6f (reason_code+params, policy_reasons.en.json, byte-verified) | 2026-09-25 | gates NOT RUN |
| `LP-40.4_TS` | `intelligence-ui` | i18n runtime, string extraction, Intl formatting | - | `DELIVERED` | ui c3f3ecc (src/i18n runtime; 912 strings / 99 files -> 891 codes; Intl helpers; hardcodedStrings + localeCatalogue tests) | 2026-09-25 | en-US only shipped; some extracted units are sentence fragments (render identically) — merge into parameterised messages before translation |
| `LP-40.5_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | No-translate list and explicit locale fallback | - | `DELIVERED` | ui c3f3ecc (localeCatalogue.test.tsx: no-translate byte-identical, explicit visible fallback) | 2026-09-25 | UC11 LexiAI EN/ES mockup assertions not located in estate — to promote when the mockup is provided |
| `LP-47.1_TEST` | `intelligence-ui` | Supervisory reachability and gate tests | - | `DELIVERED` | ui 1abf10b (scripts/lp47: lp47_inventory.py, ui_reachability_gate.py exact STAGE table pre-lp47/after, LP47_SIMULATION.md recomputed from embedded inventory, lp47_d0_mutate.py: 11 tree expectations + 10 checker mutants, 10/10 killed incl. comment-blind regex and ceiling) | 2026-09-25 | gate GREEN on the unrepaired tree in its recorded mode; kickoff diagnostics not present in this estate (nothing to promote) |
| `LP-47.2_TS` | `intelligence-ui` | Structural radar workspace UI | - | `DELIVERED` | ui 1abf10b (measured 0 unresolvable relative imports on this tree -> 0 moves; scripts/lp47/parse_gate.mjs over 296 files with a failing control) | 2026-09-25 | this estate was never flattened; the spec's 46-move plan does not apply. Parse gate uses declared typescript, not undeclared esbuild |
| `LP-47.3_TS` | `intelligence-ui` | Mount contracts and registry wiring | - | `DELIVERED` | ui 1abf10b (shell/mountContract.ts surface|navItem, composeRegistry refuses duplicate/empty/core-content/core-surface/unknown-parent; features/*/mount.tsx x20; reachable slices 10 -> 26 of 35, stranded 25 -> 0, 9 declared unmounted with reasons; gov-audit behind governance.audit.view + VITE_LEXTR_AUDIT_EVIDENCE default false; registry.test.tsx) | 2026-09-25 | newly mounted: anomaly, benchmark, forecast, ratio, supervisory, inbox, training-data, gov-audit. Declared: export, merkle, hsm, resilience, tenant, multihop, streaming, tdm, governance |
| `LP-47.4_TS` | `intelligence-ui` | Lexie dispatcher and handoff | - | `DELIVERED` | ui 1abf10b (LexiePanel launches runs: resolve -> planRun -> run -> dispatch; shell/lexie/useCaseAliases.ts (14 lexie-ai constants, sources named), dispatcher.tsx; dark renderers 7 -> 0; lexieDispatch.test.tsx re-derives constants from lexie-ai Python) | 2026-09-25 | FOUND: UC11 claimed by rules AND supervisory_radar; demo asks label UC6/UC7 differently from lexie-ai (forecast/benchmark) - recorded, not re-authored |
| `LP-47.5_TS` | `intelligence-ui` | Host seam and boot integration | - | `DELIVERED` | ui 1abf10b (shell/host: HostProvider fail-closed default, httpHost with runtime probes, dev/referenceHost withholds governance.audit.view, never accepts/unmasks; main.tsx sole importer; boot splash on var(--lx-boot-accent, CanvasText); brand hex out of App; hostSeam.test.tsx with mutant) | 2026-09-25 | vite build NOT RUN (standing rule); embed exports HostProvider for Core |
| `LP-47.6_TS` | `intelligence-ui` | Open-items pass and shell contract | - | `DELIVERED` | ui 1abf10b (entities carried into the run by planRun; NavItem content mandatory for Intelligence, one CoreOwnedPlaceholder; typecheck debt 38 -> 32 (App NAV typing x5, TENANTS index x1); scripts/lp47/lp47_run_suites.sh with declared known-red register + declared-tooling check) | 2026-09-25 | a red that stops being red fails the runner |
| `LP-48.1_SQL` | `intelligence-service` | Governing ingest description schema | - | `DELIVERED` | svc ac003d4 (V41 regulatory_document.description: ADD COLUMN IF NOT EXISTS, nullable, no default, no backfill; read_header query + GET /knowledge/documents/{id}; KnowledgeHubDescriptionMigrationTest) | 2026-09-25 | live UI upload goes through lexie-ai, which keeps the description in document metadata (lexie 46b03f0) |
| `LP-48.2_JAVA` | `intelligence-service` | Ingestion API and disposition handling | - | `DELIVERED` | svc ac003d4, f798adf (POST /knowledge/ingest/batch: per-file ACCEPTED/REJECTED/FAILED with closed KH_INGEST_* codes + params; verdict derived; nothing accepted/parsed/sent -> 422 ApiResponse with non-null ErrorDetail from the advice; English fallback off by default, owner + end; kh_ingest_batch in lextr.ai.tool_scope_parsing, unreachable OPA denies; AI_PROHIBITED shared hard stop; IngestionBatchServiceTest); lexie 46b03f0 (upload route answers with reason_code + params) | 2026-09-25 | DEVIATION: LP-48 was to author no Rego - no package declared an ingestion op, so ONE op was registered in tool_scope_parsing (+ src/test/opa/tool_scope_parsing_test.rego) |
| `LP-48.3_JAVA` | `intelligence-service` | Rule set server-side semantics | - | `DELIVERED` | svc ac003d4, f798adf (IngestionRule enumerable table, one code per rule, each rule carries its witness; duplicates in-batch + against existing content_sha256; extensions = lexie's live parser set; IngestionRuleTableTest iterates values()) | 2026-09-25 | a rule added to the table is exercised with no test edit |
| `LP-48.5_TS` | `intelligence-ui` | Governing ingest UI | - | `DELIVERED` | ui a7f66fb (description field; rules.ts courtesy table + DispositionFileList with reason per file, remove, clear refused/all; upload disabled via canCommit; HowThisWorks + 8 flows / 43 steps; RowHistoryButton + HistoryDrawer on Model Registry, Training Data, AI Risk & Controls, Audit & Evidence) | 2026-09-25 | existing HistoryDrawer kinds fabricate actors/dates (prototype carry-over, untouched); the 5 new kinds derive from record fields only |
| `LP-48.6_TEST` | `intelligence-service` (+ `intelligence-ui`) | Negative suite and mutation test port | - | `DELIVERED` | ui a7f66fb (khIngestNegative.test.tsx + walkthroughAudit.test.tsx: rules, cross-language agreement with IngestionRule.java, mutants for rule removal x7, catalogue gap, canCommit, first-match, flow removal, short flow, stopPropagation); lexie 46b03f0 (static code-set test) | 2026-09-25 | prototype suites ui25_kh_negative.mjs / ui25_n34_negative.mjs are not in the package - equivalent assertions ported, counts differ from 31/83 |

### Wave 09 — Cross-Product Integration Baseline

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| — | — | No prompts currently defined | — | `DEFERRED` | — | 2026-09-24 | Placeholder wave; not started |

### Wave 10 — UC10 Refine & Build, Report Store & Domain Resolution

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-41.1_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | DOM-free protocol core tests | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-41.2_REGO` | `intelligence-service` | UC10 analytical policy gates | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-41.3_PY` | `lexie-ai` | Protocol core evaluator and mutation gate | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-41.4_JAVA` | `intelligence-service` | Semantic resolution seam service | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-41.5_TS` | `intelligence-ui` | Analytical refine slice UI | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-41.6_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Analytical seam wire-through tests | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-41.7_JAVA` | `intelligence-service` | Logical/physical resolution seam service | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-41.8_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Fail-closed wire-through for resolution seam | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-42.1_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Report-local scope & grounding core tests | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-42.2_REGO` | `intelligence-service` | High risk tier policy gates | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-42.3_PY` | `lexie-ai` | Derived attribute expression evaluator | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-42.4_JAVA` | `intelligence-service` | Derived attribute evidence & expression service | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-42.5_TS` | `intelligence-ui` | Inline placement & expression UI display | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-45.1_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Decision core for instance outcome tests | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-45.2_REGO` | `intelligence-service` | Report store search policy gating | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-45.3_PY` | `lexie-ai` | Metadata-only report store adapter | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-45.4_JAVA` | `intelligence-service` | Report store instance evidence service | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-45.5_TS` | `intelligence-ui` | Report store instance outcome UI display | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-46.0_SQL` | `intelligence-service` | Domain resolution persistence schema migration | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-46.1_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Exact/ambiguous/unresolved decision core tests | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-46.2_JAVA` | `intelligence-service` | Domain resolution evidence service | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-46.3_PY` | `lexie-ai` | Domain resolution adapter client | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-46.4_TS` | `intelligence-ui` | Domain resolution review UI display | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |

### Wave 11 — Knowledge Graph Access Layer

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-44.1_TEST` | `intelligence-service` (+ `lexie-ai`) | Op catalogue & graph traversal bounds tests | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-44.2_REGO` | `intelligence-service` | Graph traversal & named op policy gating | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-44.3_PY` | `lexie-ai` | Knowledge graph client with named ops | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-44.4_JAVA` | `intelligence-service` | Knowledge graph traversal & evidence service | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |

### Wave 12 — External Witness & WORM Anchor

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-49.1_SQL` | `intelligence-service` | Notarization receipt schema migration | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-49.2_JAVA` | `intelligence-service` | External notary service & receipt ledger | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | LP-26.9 verify_chain_coverage() now exists (V38); Java substitute kept |
| `LP-49.3_SQL` | `intelligence-service` | WORM retention boundary schema | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-49.4_TS` | `intelligence-ui` | Witness status & notary badge UI display | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-49.5_TEST` | `intelligence-service` (+ `intelligence-ui`) | External witness & WORM anchor wire-through tests | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |

### Wave 13 — Population Reconciliation

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-50.1_SQL` | `intelligence-service` | Inventory reconciliation schema migration | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-50.2_JAVA` | `intelligence-service` | Inventory population join & reconciliation service | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl); gap-fill svc 5cfac1d (cycle-derived populations) | 2026-09-25 | gates NOT RUN |
| `LP-50.3_JAVA` | `intelligence-service` | Core inventory contract interface & binding | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-50.4_TEST` | `intelligence-service` | Population reconciliation wire-through tests | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |

### Wave 14 — Confidence Calibration & Ongoing Monitoring

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-51.1_PY` | `lexie-ai` | Confidence formula definition | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-51.2_PY` | `lexie-ai` | Calibrator fitting logic | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-51.3_JAVA` | `intelligence-service` | Calibration service and promotion records | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-51.4_SQL` | `intelligence-service` | Calibration threshold schema | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-51.5_TS` | `intelligence-ui` | Confidence visual grammar | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-51.6_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Confidence calibration wire-through tests | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |

### Wave 15 — Approval Workflow Substrate

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-59.1_PY` | `lexie-ai` | Chain engine | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-59.2_PY` | `lexie-ai` | Capability specs and wrappers | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-59.3_REGO` | `intelligence-service` | Chain entitlement policy | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-59.4_TS` | `intelligence-ui` | Step ring and approval UI | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-59.5_TS` | `intelligence-ui` | Inherited authority gate | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-59.6_JAVA` | `intelligence-service` | Estate ledger service | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-59.7_JAVA` | `intelligence-service` | Actor directory and guardrails | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-59.8_SQL` | `intelligence-service` | Approval ledger schema extension | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-59.9_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Approval workflow wire-through tests | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |

### Wave 16 — Document Parsing Seam & Sandboxing

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-52.1_PY` | `lexie-ai` | Docling pipeline config | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-52.2_PY` | `lexie-ai` | Adapter and `ParsedChunk` contract | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-52.3_PY` | `lexie-ai` | Traversal and reconciliation logic | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-52.4_PY` | `lexie-ai` | Label policy and error handling | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-52.5_REGO` | `intelligence-service` | Parsing `tool_scope` policy | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-52.6_TEST` | `lexie-ai` (+ `intelligence-service`) | Parsing seam wire-through tests | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-57.1_PY` | `lexie-ai` | Exam runner | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-57.2_PY` | `lexie-ai` | Grading facets | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-57.3_REGO` | `intelligence-service` | Assurance gating policy | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-57.4_SQL` | `intelligence-service` | Assurance schema migration | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-57.5_JAVA` | `intelligence-service` | Assurance orchestration service | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-57.6_TS` | `intelligence-ui` | Assurance surface UI | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-57.7_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Assurance wire-through tests | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-58.1_REGO` | `intelligence-service` | `tdm_sandbox` policy | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-58.2_PY` | `lexie-ai` | Sandbox probe runner | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-58.3_JAVA` | `intelligence-service` | Sandbox run persistence | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-58.4_TS` | `intelligence-ui` | Sandbox surface UI | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-58.5_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Sandbox wire-through tests | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-60.1_REGO` | `intelligence-service` | `todo_routing` policy | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-60.2_JAVA` | `intelligence-service` | Inbox service and step logic | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-60.3_TS` | `intelligence-ui` | Inbox workspace UI | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-60.4_TEST` | `intelligence-service` (+ `intelligence-ui`) | Todo routing wire-through tests | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |

### Wave 17 — Chunking, Vector Split & OCR Provenance

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-53.1_PY` | `lexie-ai` | Chunking rules and boundaries | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-53.2_SQL` | `intelligence-service` | Document chunk schema migration | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-53.3_SQL` | `intelligence-service` | Vector-store re-pointing and cleanup | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl); gap-fill svc 25e02e3 | 2026-09-25 | gates NOT RUN |
| `LP-53.4_JAVA` | `intelligence-service` | Chunk retrieval and provenance DAO | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl); gap-fill svc 25e02e3 | 2026-09-25 | gates NOT RUN |
| `LP-53.5_TEST` | `intelligence-service` (+ `lexie-ai`) | Chunking wire-through tests | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-54.1_PY` | `lexie-ai` | OCR configuration and language seam | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-54.2_PY` | `lexie-ai` | Text source provenance logic | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-54.3_PY` | `lexie-ai` | Figure verification logic | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-54.4_PY` | `lexie-ai` | Completeness checks and verification gate | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-54.5_TS` | `intelligence-ui` | Provenance viewer UI | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-54.6_TEST` | `lexie-ai` (+ `intelligence-service`, `intelligence-ui`) | OCR provenance wire-through tests | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |

### Wave 18 — Footnote Association & Drop Profiles

| Prompt ID | Target Repo / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `LP-55.1_PY` | `lexie-ai` | Superscript capture | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-55.2_PY` | `lexie-ai` | Footnote association logic | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-55.3_SQL` | `intelligence-service` | Chunk reference edge tables | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-55.4_JAVA` | `intelligence-service` | Footnote retrieval join | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-55.5_TS` | `intelligence-ui` | Footnote display UI | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-55.6_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Footnote wire-through tests | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-56.1_PY` | `lexie-ai` | Drop profile proposer | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-56.2_REGO` | `intelligence-service` | `drop_profile` OPA policy | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-56.3_JAVA` | `intelligence-service` | Versioned drop profile service | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-56.4_TS` | `intelligence-ui` | SME ruling surface | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-56.5_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Drop profile wire-through tests | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |

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

## 6. Gap-fill log — `feature/lextr-intelligence-v1.38.0`

Base implementation by another model on `feature/lextr-intelligence-v1.38.0`; entries below record what was missing and added (additive only, nothing removed). Gates NOT RUN.

### 6.0 Status summary (as of 2026-09-25)

Agreed order: (1) verify/fix waves 10–18 → (2) Wave 8 platform LP-29..35 + LP-40 → (3) LP-39 → (4) LP-25 → (5) LP-26 → (6) LP-47/48 → (7) LP-27/28 as design docs.

| Scope | Status | Notes |
|---|---|---|
| Waves 01–06 | VERIFIED + GAP-FILLED | per-prompt rows below; open: LP-19.4 client tally, LP-38.1 two classifiers |
| Wave 07 | LP-39, LP-25, LP-26 (31 lanes) DELIVERED (steps 3-5 complete); LP-27/28 design pending | LP-23/24 covered; their Merkle ledger / master synthesis / ratio kept; LP-26 rebuilt on V36-V40 alongside their evidence_chain/agent_run_event (extended, not duplicated) |
| Wave 08 | ALL DELIVERED: LP-29..35, LP-40, LP-47 (6), LP-48 (5) (gates NOT RUN except LP-47 static gates GREEN and LP-48 tool_scope_parsing Rego tests 6/6) | steps 2 and 6 complete |
| Wave 09 | n/a | folder empty |
| Waves 10–18 | VERIFIED + GAP-FILLED | step 1 complete; LP-49.2 dependency now met by V38 verify_chain_coverage() |
| Owner decisions open | — | secret-scan enforcement date (red on arrival); coverage-gate enforcement date; trend/analytical/impact/operational/digital-twin readiness data docs shipped `true`; prod now requires OTLP endpoint; dev-yaml password kept by instruction; OPA-TDM-006/007 sign-off; DEC-LP-26-1 erasure authorities (shipped empty = deny); LP-47 UC11 use-case collision (rules vs supervisory_radar) and demo UC6/UC7 labels; resilience console ownership; LP-48 ingestion op registered in tool_scope_parsing (LP-48 said no Rego of its own); prototype HistoryDrawer kinds fabricate actors/dates; agent_run_step additive-input fence deviation; training_env_ready shipped false; Training Data surface exported (host must mount); en-US only shipped, extracted UI fragments to merge before translation |
| Next | step 7 — LP-27/28 as design docs (4 lanes) | last pending |

| Wave | Prompt | Gap found | Added | Commit |
|---|---|---|---|---|
| pre | cross-cutting | non-RFC 8785 canonicaliser; exception text in responses; fail-open /run fallback; unbounded cache; no STOMP; no preset transition legality; tenant CSS injected without OPA | JsonCanonicalizer + shared corpus (Java+Python), hardened GlobalExceptionHandler + 502, RunServiceImpl refusal/STOMP/LRU, PresetServiceImpl legality, OPA-gated TenantThemeProvider + embed | svc 6b4a3a7, lexie 74c0037, ui dcd4850 |
| 01 | LP-01.1 | regulatory_document reused form_version enum (B1) | V26 kh_ingestion_status | svc 84c244c |
| 01 | LP-02.1 | covered by pre-row port | — | ui dcd4850 |
| 01 | LP-02.2 | empty unmasked display blank; RunProgress crash on unknown status; no ledger state; no output_type dispatch; chart formats figures | atom patches + embed/atoms.ts | ui 2260772 |
| 02 | LP-03.2 | VarianceExplanation dropped producer fields; OutputType failed on unseen value and diverged from DB enum (insert cast failure); tenant trusted from body | producer-exact records, tolerant OutputType + V27, X-Client-Id match on /run | svc c079e09 |
| 02 | LP-03.3 | lexie WebClient camelCase (OI-9); error table off-manifest; correlation not three-state | snake_case codecs, status rows, ErrorDetail.correlationState | svc c079e09 |
| 02 | LP-03.5 | no producer-field / three-state test | RunContractProducerFieldsTest | svc c079e09 |
| 02 | LP-04.1 | no evaluate entry, capability, embedding_call, masking, model_routing; mrm_approval called but absent; mrm_sod input keys mismatched; data docs never loaded | ported packages + mrm_approval + evaluate adapter; loader uploads opa/data | svc c079e09 |
| 02 | LP-05.1 | OPA routing never consulted | resolveModelForClassification via lextr.ai.model_routing | svc c079e09 |
| 03 | LP-06.1 / LP-07.1 | output_hash, correlation, determinism, claim columns and review event table absent (record fields silently dropped) | V28 + insert persists them | svc c8329da |
| 03 | LP-06.2 | confidence fabricated as 0.95; "sweep later enqueues" but no sweep | producer confidence; scheduled StrandedRunSweep | svc c8329da |
| 03 | LP-06.4 / LP-06.7 | no sweep test | StrandedRunSweepTest | svc c8329da |
| 03 | LP-06.5 / LP-06.6 | binding ignored (always inline); no real store | FileSystemPayloadStore + PayloadStoreBindingGuard | svc c8329da |
| 03 | LP-07.2 | repeated enqueue reset status and cleared reviewer/decision | idempotent guard + review events | svc c8329da |
| 03 | LP-07.4 | covered (transition table + resolver present) | — | — |
| 03 | LP-08.1 / LP-08.2 | KH header fields never written | mark_ingested (hash, tier, lifecycle) | svc c8329da |
| 03 | LP-08.3 / LP-08.6 | covered (single-statement retrieval, NON_AUTHORITATIVE mark present) | — | — |
| 04 | LP-09.1 / LP-10.1 / LP-10.4 / LP-11.1 / LP-12.8 | covered (skill_one, masking/boundary, masking/grounding_payload, skill_three + driver_category, instruction/instruction_resolver) | — | — |
| 04 | LP-12.1 / LP-12.2 / LP-12.3 / LP-12.4 | covered (V4 partial unique index; lifecycle legality added in pre-row) | — | svc 6b4a3a7 |
| 04 | LP-12.5 | wizard called non-existent routes; denial never shown; status set client-side; no activate control; observed not shown | presetApi + wired hook/wizard + PresetLifecycleStage; tests updated | ui 45c583d |
| 04 | LP-12.7 / LP-13.3 | covered (preset tests; test_host_adapter_wire_through.py) | — | — |
| 05 | LP-14.0 | close/reopen rules unenforced; agent_run.cycle_id never written | V29 close guard trigger; bind_cycle (caller-named only) | svc 9faef0b |
| 05 | LP-14.1 / LP-14.3 / LP-16.1 / LP-16.3 / LP-17.2 / LP-18.1 / LP-19.1 / LP-19.2 / LP-19.3 / LP-19.5 | covered (all ops registered in tool_scope_variance; rerun re-resolves latest preset; analyst provenance) | — | — |
| 05 | LP-14.2 / LP-14.4 | payload could overwrite trusted OPA input keys and assert *_ready; lexie-echoed tenant persisted | trusted keys applied last, *_ready stripped (3 coordinators); caller tenant enforced | svc 9faef0b |
| 05 | LP-15.1 / LP-17.1 | fabricated 0.95 confidence and narrative fallback | absent renders as absent | ui c1c161d |
| 05 | LP-19.4 | OPEN: client-side system-driver tally used when server count absent (their conformance test depends on it; server wire field unconfirmed) | not changed | — |
| 06 | LP-20.1 / LP-20.2 / LP-20.5 / LP-21.1 / LP-21.3 / LP-21.4 / LP-21.5 / LP-22.1 / LP-22.2 / LP-22.4 / LP-22.5 / LP-22.6 / LP-37.1 / LP-37.2 / LP-37.4 / LP-37.5 / LP-38.2 / LP-38.4 / LP-38.5 | covered | — | — |
| 06 | LP-20.3 / LP-37.3 / LP-38.3 | readiness datums hard-coded true (fail-open, never falsifiable); impact cross-report single-gated; no AI_PROHIBITED stop in impact/trend | default-false datums from opa/data docs (shipped true); both passes for cross_report; hard-stops | svc 31d1ea8 |
| 06 | LP-21.2 | RunResult lacked intent / route_out | additive components | svc 31d1ea8 |
| 06 | LP-22.3 | only draft->operational was refused; retired->operational etc. allowed | LEGAL_NEXT table | svc 31d1ea8 |
| 06 | LP-38.1 | OPEN: two trend classifiers (variance evidence_substeps vs skills/shared) with different vocabularies; spec's own LP-18 vs LP-38 verdict sets differ — owner decision needed | not changed | — |
| 07 | LP-25 / LP-26 / LP-27 / LP-28 / LP-39 / LP-40 | BUILT UNDER WRONG NUMBERS (Merkle ledger, regulatory export, multi-hop, master synthesis, ratio) or partial (LP-26: 2 of 9 tables) — scheduled as from-scratch builds (steps 2-7 of the agreed order) | pending | — |
| 08 | LP-29..35 / LP-47 / LP-48 | never started — scheduled (step 2 / step 6) | pending | — |
| 10 | LP-41 / LP-42 / LP-45 / LP-46 | covered (handoff/expression/report_store/domain adapter; category errors; value_desc honesty) | — | — |
| 11 | LP-44 | covered (per-op readiness, cross-tenant raises, named-op client) | — | — |
| 12 | LP-49 | covered; LP-49.2's dependency on LP-26.9 verify_chain_coverage() resolved by the LP-26 build | V38 | svc 55c96e7 |
| 13 | LP-50.1 / LP-50.3 / LP-50.4 | covered (generated gate columns, fail-closed inventory fetch) | — | — |
| 13 | LP-50.2 | populations caller-supplied; variance explanation never persisted | V30 agent_run.variance_explanation + reconcilePopulationFromCycle | svc 5cfac1d |
| 14 | LP-51 | covered (versioned formula, population calibrator, NOT-CALIBRATED state) | — | — |
| 15 | LP-59 | covered (chain.py engine, specs, chain_entitlement, StepRing/TrackStrip, inheritedAuthority, agent_run_event ledger) | — | — |
| 16 | LP-52 / LP-57 / LP-58 / LP-60 | covered (parsing seam, assurance keyed on document version, tdm_sandbox, todo_routing) | — | — |
| 17 | LP-53.3 / LP-53.4 x LP-08 | split migrated but LP-08 ingest/retrieval not re-pointed (FK violation / wrong passages) | ingest via embedding_chunk(+source); retrieval joins through embedding_chunk_source | svc 25e02e3 |
| 17 | LP-54 | covered | — | — |
| 18 | LP-55 / LP-56 | covered (chunk_reference edges, notes_for queries, drop_profile) | — | — |
| 08 | LP-29.1 | no OpenAPI config/annotations; no route-coverage check | OpenApiConfig (error envelope described) + @Tag on 28 controllers; OpenApiRouteCoverageTest w/ positive control | svc 5ed04e5 |
| 08 | LP-30.1 | no logging config, no redaction, correlation not on records | logback-spring.xml (key=value), LogRedactor + converter, CorrelationMdcFilter (three-state); LogRedactorTest | svc 5ed04e5 |
| 08 | LP-31.1 | missing SQL key failed only at first call; no width-agreement gate | Hikari externalized; QueryCatalogStartupCheck; QueryKeyCoverageTest (+ 384 agreement, HNSW ≤2000) | svc 5ed04e5 |
| 08 | LP-32.1 | no service-JWT; no lextr.ai.runtime_config; no secret scan | ServiceJwtSigner + WebClient filter; runtime_config.rego + data; SecretScanTest (@Tag secret-scan, opt-in) | svc 5ed04e5 |
| 08 | LP-33.1 | 409 conflicts carried no (status, action) | TransitionConflictException → 409 ILLEGAL_TRANSITION | svc 5ed04e5 |
| 08 | LP-33.3 | lexie-ai had zero exception handlers; str(e) leaks; lock refusal 409 prose | lexie_ai/errors.py at composition root; lock → 422 RUNTIME_CONFIG_KEY_NOT_EDITABLE; test updated | lexie 32e073d |
| 08 | LP-34.1 | no coverage enforcement, no completeness gate | CompletenessGateTest (ops vs allow-list, write-without-read) w/ positive controls; -Pcoverage-gate JaCoCo 90%; review-event read added (gate finding) | svc 5ed04e5 |
| 08 | LP-35.1 | no probes/readiness, OTLP optional, no retry policy | probes + OPA/lexie readiness indicators; required OTLP (dev default); bounded fail-closed OPA retry | svc 5ed04e5 |
| 08 | LP-40.1 | no locale on any contract | RunLocale (explicit default, REQUEST/DEFAULT), locale on RunRequest/RunResult, V31 agent_run.locale + locale_source; RunLocaleTest | svc 2a32f6f |
| 08 | LP-40.3 | 31 prose deny reasons, no codes | reason_code + typed params in 30 packages; i18n/policy_reasons.en.json (17 codes) byte-verified against opa; PolicyReasonCodeCatalogueTest | svc 2a32f6f |
| 08 | LP-40.2 | ~50 composed prose fields in lexie-ai skills | reason(CODE, **params) + catalogue; 46 sites converted; AST gate w/ positive controls | lexie 44369ec |
| 08 | LP-40.4 | no i18n runtime; ~900 hardcoded strings | src/i18n (typed t, Intl, fallback); codemod 912 strings -> 891 codes; harness + catalogue tests | ui c3f3ecc |
| 08 | LP-40.5 | no no-translate / fallback enforcement | params byte-identical across locales; explicit visible fallback (LocaleFallbackNotice) | ui c3f3ecc |
| 08 | LP-47.1 / 47.2 | no reachability measure or gate | inventory + exact-stage gate + recomputed simulation + 21-mutant proof; parse gate with control (0 unresolved imports here - no moves) | ui 1abf10b |
| 08 | LP-47.3 / 47.6 | 25 of 35 slices unreachable; hardcoded NAV + if-chain | composed mount registry (surface/navItem), 8 new destinations, 9 declared-unmounted, gov-audit double-guarded, M6 enforced at composition; typecheck 38 -> 32 | ui 1abf10b |
| 08 | LP-47.4 | Lexie never launched a run; 7 answer renderers dark | resolve -> planRun (no default report, entities carried) -> run -> useCase dispatcher; alias table reconciled against lexie-ai | ui 1abf10b |
| 08 | LP-47.5 | no host seam; vendor blue in shell | HostProvider (fail-closed), http + reference hosts, system-colour boot splash | ui 1abf10b |
| 08 | LP-48.1 | no description on a document | V41 nullable column, no backfill, header read model | svc ac003d4 |
| 08 | LP-48.2 / 48.3 | KH ingest: one document, no duplicate check, no per-file outcome, prose errors, no tool_scope | batch API with per-file dispositions + closed codes, enumerable rule table with witnesses, derived verdict, 422 envelope, tool_scope_parsing op, fallback declared; lexie upload route emits the same codes | svc ac003d4, f798adf; lexie 46b03f0 |
| 08 | LP-48.5 / 48.6 | no description, no reasons per file, no walkthroughs, no audit on four screens | disposition list + courtesy rules, 8 walkthrough flows, per-row history on 4 screens, mutation-tested suites | ui a7f66fb |
| 08 | LP-47 / LP-48 | not started | pending (step 6) | — |
| 07 | LP-25.2 | no UC11 schema (number used for Merkle ledger) | V34/V35 split, closed origin vocabulary, acceptance pair, partial indexes, 7 keys | svc 1008804 |
| 07 | LP-25.3 | no rules skill | skills/rules deterministic layer + orchestrator | lexie fee7f05 |
| 07 | LP-25.4 | no tool_scope_rules | policy + Rego tests | svc 1008804 |
| 07 | LP-25.5 | no coordinator | rules/ decisions, DAO, coordinator, controller; origin in insert | svc ee6d961 |
| 07 | LP-25.6 / 25.8 / 25.9 | no UI | features/rules panel, shell plumbing, ASK_WIRING | ui 953078f |
| 07 | LP-25.1 / 25.7 | no harness / reconciliation | scenario harness + cross-language reconciliation | lexie 1d70226 |
| 07 | LP-39.1 | no TDM schema (number used for "master synthesis") | V32/V33 split migrations, DB-level guarantees, writer-pure queries | svc 2f0c6b6 |
| 07 | LP-39.2 | no TDM services | training/ package: DAOs, services with gate ordering, controller, ContentSchemaSource | svc 2f0c6b6 |
| 07 | LP-39.3 | no TDM policies | tdm_ring_fence / tdm_contamination / tdm_training_env + data + Rego tests | svc 2f0c6b6, ec828c5 |
| 07 | LP-39.4 | no executor | lexie_ai/training (measures, never judges; no DB/HTTP client) | lexie 23dd185 |
| 07 | LP-39.5 | no UI | features/training-data (5 tabs) | ui 64854f2 |
| 07 | LP-39.6 | no wire-through | Java end-to-end + 216-case OPA differential (fixed OVERLAP_UNMEASURED) | svc ec828c5, lexie 0db1dbe |
| 07 | LP-26.1 / 26.8 / 26.9 / 26.10 / 26.24 / 26.28 | only evidence_chain + agent_run_event (2 of 9 tables); no fence on steps, no chain formula, no retention/purge/erasure | V36-V40: generic fence, tenant-day chain, anchors, retention extend-only, archive receipts, header history, catalogue-driven coverage, whole-day purge, read/export/erasure tables; ops role + purge scripts | svc 55c96e7 |
| 07 | LP-26.2-26.5 / 26.16-26.18 / 26.20 / 26.25 / 26.26 / 26.29-26.31 | no recording rules, query core, pack export/verify, lifecycle, discharge, erasure; no audit_read / evidence_lifecycle policies | evidence/ recording, query, export(+verify), policy, lifecycle, correlation, actor (OFF), dao, service, controller; audit_read + evidence_lifecycle Rego + tests | svc fd13fc2, fc7cabb, 612ece0, c0d853b, 89d9639 |
| 07 | LP-26.6 / 26.22 | no producer correlation/plan/denial recording; no generated model documentation | runtime correlation, skill identity, plan, denial recording, correlated gateway; model_documentation generator + claims | lexie fea13ae |
| 07 | LP-26.7 / 26.13 / 26.21 | their timeline UI only | audit-evidence decision core, InvolvementPanel, DispositionBadge over shared corpora | ui 1750499, svc c6beb03 |
| 07 | LP-26.14 / 26.15 / 26.19 / 26.23 / 26.27 / 26.32 | no gates | drift, estate audit (found 7 unnamed classes -> fixed), Python chain mirror, claims, obligation writers, erasure | lexie 33627fa, svc 89d9639 |
