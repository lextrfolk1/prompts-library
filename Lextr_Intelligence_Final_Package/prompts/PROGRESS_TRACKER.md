# Lextr Intelligence Platform — Structured Prompt Progress Tracker

**Repository Branches:** `feature/lextr-intelligence-v1.38.0` (active; base implementation by another model, gap-filled here) · `feature/lextr-intelligence-reimplementation` (earlier, Waves 1–4)  
**Platform Version:** `v1.38.0`  
**Tracker Mode:** Evidence-based, prompt-by-prompt tracking  
**Current State:** Working on `feature/lextr-intelligence-v1.38.0`, LP by LP: each prompt verified against the base implementation, gaps filled additively (nothing removed). 188/251 DELIVERED, 2 IN_PROGRESS, 61 PENDING. Gates/tests NOT RUN (final pass). Per-change log in section 6. Last updated 2026-09-25.  

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
| **Wave 07** | Evidence Ledger, Merkle Chaining & AU-9 Integrity | 58 | 50 | 0 | 0 | 8 | 0 | 🟡 PARTIAL |
| **Wave 08** | Reason Code Registry, Locale Tokens & Multi-Tenancy | 24 | 11 | 2 | 0 | 11 | 0 | 🟡 PARTIAL |
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
| **TOTAL** | **Full 18-Wave Platform Scope** | **251** | **61** | **2** | **0** | **188** | **0** | **74.9% delivered** |

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
| `LP-39.1_SQL` | `intelligence-service` | Reason-code ledger migration | - | `PENDING` | - | 2026-09-25 | v1.38.0 built "master synthesis" under this number (kept); training data to build — step 3 |
| `LP-39.2_JAVA` | `intelligence-service` | Training domain DAO and service | - | `PENDING` | - | 2026-09-25 | v1.38.0 built "master synthesis" under this number (kept); training data to build — step 3 |
| `LP-39.3_REGO` | `intelligence-service` | TDM ring-fence policy | - | `PENDING` | - | 2026-09-25 | v1.38.0 built "master synthesis" under this number (kept); training data to build — step 3 |
| `LP-39.4_PY` | `lexie-ai` | Fine-tune executor | - | `PENDING` | - | 2026-09-25 | v1.38.0 built "master synthesis" under this number (kept); training data to build — step 3 |
| `LP-39.5_TS` | `intelligence-ui` | Training data UI | - | `PENDING` | - | 2026-09-25 | v1.38.0 built "master synthesis" under this number (kept); training data to build — step 3 |
| `LP-39.6_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Reason-code cross-layer tests | - | `PENDING` | - | 2026-09-25 | v1.38.0 built "master synthesis" under this number (kept); training data to build — step 3 |
| `LP-23.1_PY` | `lexie-ai` | Analytical assist skill | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-24.1_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Merkle protocol core tests | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-24.2_SQL` | `intelligence-service` | Merkle tree ledger migration | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-24.3_PY` | `lexie-ai` | Merkle analytical skill | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-24.4_REGO` | `intelligence-service` | `tool_scope_analytical` policy | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-24.5_JAVA` | `intelligence-service` | Analytical preset resolver | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-24.6_TS` | `intelligence-ui` | Merkle workspace UI | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-24.7_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Merkle wire-through tests | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | gates NOT RUN |
| `LP-25.1_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | AU-9 simulation and logic harness | - | `PENDING` | - | 2026-09-25 | v1.38.0 built a Merkle ledger under this number (kept); rules copilot to build — step 4 |
| `LP-25.2_SQL` | `intelligence-service` | AU-9 ledger schema migration | - | `PENDING` | - | 2026-09-25 | v1.38.0 built a Merkle ledger under this number (kept); rules copilot to build — step 4 |
| `LP-25.3_PY` | `lexie-ai` | Rules skill and extractor | - | `PENDING` | - | 2026-09-25 | v1.38.0 built a Merkle ledger under this number (kept); rules copilot to build — step 4 |
| `LP-25.4_REGO` | `intelligence-service` | `tool_scope_rules` policy | - | `PENDING` | - | 2026-09-25 | v1.38.0 built a Merkle ledger under this number (kept); rules copilot to build — step 4 |
| `LP-25.5_JAVA` | `intelligence-service` | Coordinator + acceptance receipt | - | `PENDING` | - | 2026-09-25 | v1.38.0 built a Merkle ledger under this number (kept); rules copilot to build — step 4 |
| `LP-25.6_TS` | `intelligence-ui` | Evidence workspace UI | - | `PENDING` | - | 2026-09-25 | v1.38.0 built a Merkle ledger under this number (kept); rules copilot to build — step 4 |
| `LP-25.7_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | AU-9 export wire-through tests | - | `PENDING` | - | 2026-09-25 | v1.38.0 built a Merkle ledger under this number (kept); rules copilot to build — step 4 |
| `LP-25.8_TS` | `intelligence-ui` | AU-9 panel redesign | - | `PENDING` | - | 2026-09-25 | v1.38.0 built a Merkle ledger under this number (kept); rules copilot to build — step 4 |
| `LP-25.9_TS` | `intelligence-ui` | Lexie entry point integration | - | `PENDING` | - | 2026-09-25 | v1.38.0 built a Merkle ledger under this number (kept); rules copilot to build — step 4 |
| `LP-26.1_SQL` | `intelligence-service` | Evidence schema migration set | - | `PENDING` | - | 2026-09-25 | partial on v1.38.0 (evidence_chain, agent_run_event only) — step 5 |
| `LP-26.2_JAVA` | `intelligence-service` | Recording service and rules | - | `PENDING` | - | 2026-09-25 | partial on v1.38.0 (evidence_chain, agent_run_event only) — step 5 |
| `LP-26.3_JAVA` | `intelligence-service` | Query and export surface | - | `PENDING` | - | 2026-09-25 | partial on v1.38.0 (evidence_chain, agent_run_event only) — step 5 |
| `LP-26.4_JAVA` | `intelligence-service` | Lifecycle engine | - | `PENDING` | - | 2026-09-25 | partial on v1.38.0 (evidence_chain, agent_run_event only) — step 5 |
| `LP-26.5_JAVA` | `intelligence-service` | Correlation and actor attribution | - | `PENDING` | - | 2026-09-25 | partial on v1.38.0 (evidence_chain, agent_run_event only) — step 5 |
| `LP-26.6_PY` | `lexie-ai` | Producer runtime and evidence recorder | - | `PENDING` | - | 2026-09-25 | partial on v1.38.0 (evidence_chain, agent_run_event only) — step 5 |
| `LP-26.7_TS` | `intelligence-ui` | Audit evidence UI models | - | `PENDING` | - | 2026-09-25 | partial on v1.38.0 (evidence_chain, agent_run_event only) — step 5 |
| `LP-26.8_SQL` | `intelligence-service` | Retention, archive, coverage SQL | - | `PENDING` | - | 2026-09-25 | partial on v1.38.0 (evidence_chain, agent_run_event only) — step 5 |
| `LP-26.9_SQL` | `intelligence-service` | Header transition history and coverage | - | `PENDING` | - | 2026-09-25 | partial on v1.38.0 (evidence_chain, agent_run_event only) — step 5 |
| `LP-26.10_SQL` | `intelligence-service` | Three-role split and purge migration | - | `PENDING` | - | 2026-09-25 | partial on v1.38.0 (evidence_chain, agent_run_event only) — step 5 |
| `LP-26.12_REGO` | `intelligence-service` | `audit_read` policy bundle | - | `PENDING` | - | 2026-09-25 | partial on v1.38.0 (evidence_chain, agent_run_event only) — step 5 |
| `LP-26.13_TS` | `intelligence-ui` | Forward-door evidence UI | - | `PENDING` | - | 2026-09-25 | partial on v1.38.0 (evidence_chain, agent_run_event only) — step 5 |
| `LP-26.14_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Drift gate and reconciliation tests | - | `PENDING` | - | 2026-09-25 | partial on v1.38.0 (evidence_chain, agent_run_event only) — step 5 |
| `LP-26.15_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Estate-wide audit test gate | - | `PENDING` | - | 2026-09-25 | partial on v1.38.0 (evidence_chain, agent_run_event only) — step 5 |
| `LP-26.16_JAVA` | `intelligence-service` | Evidence pack export | - | `PENDING` | - | 2026-09-25 | partial on v1.38.0 (evidence_chain, agent_run_event only) — step 5 |
| `LP-26.17_JAVA` | `intelligence-service` | Evidence pack verifier and hand-back | - | `PENDING` | - | 2026-09-25 | partial on v1.38.0 (evidence_chain, agent_run_event only) — step 5 |
| `LP-26.18_REGO` | `intelligence-service` | Export entitlement policy | - | `PENDING` | - | 2026-09-25 | partial on v1.38.0 (evidence_chain, agent_run_event only) — step 5 |
| `LP-26.19_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Chain formula and cross-layer tests | - | `PENDING` | - | 2026-09-25 | partial on v1.38.0 (evidence_chain, agent_run_event only) — step 5 |
| `LP-26.20_JAVA` | `intelligence-service` | Draft vs approved export logic | - | `PENDING` | - | 2026-09-25 | partial on v1.38.0 (evidence_chain, agent_run_event only) — step 5 |
| `LP-26.21_TS` | `intelligence-ui` | Audit evidence screen and pack view | - | `PENDING` | - | 2026-09-25 | partial on v1.38.0 (evidence_chain, agent_run_event only) — step 5 |
| `LP-26.22_PY` | `lexie-ai` | Generated model documentation | - | `PENDING` | - | 2026-09-25 | partial on v1.38.0 (evidence_chain, agent_run_event only) — step 5 |
| `LP-26.23_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Cross-language claim gate | - | `PENDING` | - | 2026-09-25 | partial on v1.38.0 (evidence_chain, agent_run_event only) — step 5 |
| `LP-26.24_SQL` | `intelligence-service` | Approval/discharge schema | - | `PENDING` | - | 2026-09-25 | partial on v1.38.0 (evidence_chain, agent_run_event only) — step 5 |
| `LP-26.25_JAVA` | `intelligence-service` | Discharge and registration logic | - | `PENDING` | - | 2026-09-25 | partial on v1.38.0 (evidence_chain, agent_run_event only) — step 5 |
| `LP-26.26_REGO` | `intelligence-service` | Obligation discharge validator | - | `PENDING` | - | 2026-09-25 | partial on v1.38.0 (evidence_chain, agent_run_event only) — step 5 |
| `LP-26.27_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Undischarged obligation gate | - | `PENDING` | - | 2026-09-25 | partial on v1.38.0 (evidence_chain, agent_run_event only) — step 5 |
| `LP-26.28_SQL` | `intelligence-service` | Erasure event migration | - | `PENDING` | - | 2026-09-25 | partial on v1.38.0 (evidence_chain, agent_run_event only) — step 5 |
| `LP-26.29_JAVA` | `intelligence-service` | Erasure and event append service | - | `PENDING` | - | 2026-09-25 | partial on v1.38.0 (evidence_chain, agent_run_event only) — step 5 |
| `LP-26.30_JAVA` | `intelligence-service` | Withheld/erased/absent export semantics | - | `PENDING` | - | 2026-09-25 | partial on v1.38.0 (evidence_chain, agent_run_event only) — step 5 |
| `LP-26.31_REGO` | `intelligence-service` | Erasure authority policy | - | `PENDING` | - | 2026-09-25 | partial on v1.38.0 (evidence_chain, agent_run_event only) — step 5 |
| `LP-26.32_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Erasure chain tests | - | `PENDING` | - | 2026-09-25 | partial on v1.38.0 (evidence_chain, agent_run_event only) — step 5 |
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
| `LP-40.1_SQL` | `intelligence-service` | Locale and run contract schema | - | `DELIVERED` | svc 2a32f6f (RunLocale, V31, RunLocaleTest) | 2026-09-25 | gates NOT RUN |
| `LP-40.2_PY` | `lexie-ai` | Reason-code replacement for prose fields | - | `DELIVERED` | lexie 44369ec (reason_codes.py + reason_codes.en.json, 43 codes; 46 sites / 15 modules; tests/test_no_composed_prose.py AST gate) | 2026-09-25 | renderings byte-identical; DTO fields still typed str (code on ReasonText) — exposing reason_code on wire DTOs is a follow-up |
| `LP-40.3_REGO` | `intelligence-service` | Policy-based reason-code decisions | - | `DELIVERED` | svc 2a32f6f (reason_code+params, policy_reasons.en.json, byte-verified) | 2026-09-25 | gates NOT RUN |
| `LP-40.4_TS` | `intelligence-ui` | i18n runtime and string extraction | - | `IN_PROGRESS` | - | 2026-09-25 | next: 40.2 PY codes, 40.4 TS i18n, 40.5 no-translate gate |
| `LP-40.5_TEST` | `intelligence-service` (+ `lexie-ai`, `intelligence-ui`) | Locale no-translate tests | - | `IN_PROGRESS` | - | 2026-09-25 | next: 40.2 PY codes, 40.4 TS i18n, 40.5 no-translate gate |
| `LP-47.1_TEST` | `intelligence-ui` | Supervisory reachability and gate tests | - | `PENDING` | - | 2026-09-25 | not started on v1.38.0 — step 6 |
| `LP-47.2_TS` | `intelligence-ui` | Structural radar workspace UI | - | `PENDING` | - | 2026-09-25 | not started on v1.38.0 — step 6 |
| `LP-47.3_TS` | `intelligence-ui` | Mount contracts and registry wiring | - | `PENDING` | - | 2026-09-25 | not started on v1.38.0 — step 6 |
| `LP-47.4_TS` | `intelligence-ui` | Lexie dispatcher and handoff | - | `PENDING` | - | 2026-09-25 | not started on v1.38.0 — step 6 |
| `LP-47.5_TS` | `intelligence-ui` | Host seam and boot integration | - | `PENDING` | - | 2026-09-25 | not started on v1.38.0 — step 6 |
| `LP-47.6_TS` | `intelligence-ui` | Open-items pass and shell contract | - | `PENDING` | - | 2026-09-25 | not started on v1.38.0 — step 6 |
| `LP-48.1_SQL` | `intelligence-service` | Governing ingest description schema | - | `PENDING` | - | 2026-09-25 | not started on v1.38.0 — step 6 |
| `LP-48.2_JAVA` | `intelligence-service` | Ingestion API and disposition handling | - | `PENDING` | - | 2026-09-25 | not started on v1.38.0 — step 6 |
| `LP-48.3_JAVA` | `intelligence-service` | Rule set server-side semantics | - | `PENDING` | - | 2026-09-25 | not started on v1.38.0 — step 6 |
| `LP-48.5_TS` | `intelligence-ui` | Governing ingest UI | - | `PENDING` | - | 2026-09-25 | not started on v1.38.0 — step 6 |
| `LP-48.6_TEST` | `intelligence-service` (+ `intelligence-ui`) | Negative suite and mutation test port | - | `PENDING` | - | 2026-09-25 | not started on v1.38.0 — step 6 |

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
| `LP-49.2_JAVA` | `intelligence-service` | External notary service & receipt ledger | - | `DELIVERED` | verified on `feature/lextr-intelligence-v1.38.0` (base impl) | 2026-09-25 | Depends on LP-26.9 verify_chain_coverage() (Java substitute until LP-26 build) |
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
| Wave 07 | VERIFIED — REBUILD PENDING | LP-23/24 covered; LP-25, LP-39, LP-40 built under wrong numbers (their Merkle ledger / master synthesis / ratio kept); LP-26 partial (2/9 tables); LP-27/28 proposed |
| Wave 08 | LP-29..35, LP-40.1, LP-40.3 DELIVERED (gates NOT RUN); LP-40.2/40.4/40.5 IN_PROGRESS; LP-47/48 PENDING | step 2 in progress |
| Wave 09 | n/a | folder empty |
| Waves 10–18 | VERIFIED + GAP-FILLED | step 1 complete; LP-49.2 waits on LP-26.9 |
| Owner decisions open | — | secret-scan enforcement date (red on arrival); coverage-gate enforcement date; trend/analytical/impact/operational/digital-twin readiness data docs shipped `true`; prod now requires OTLP endpoint; dev-yaml password kept by instruction |

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
| 12 | LP-49 | covered except LP-49.2's dependency on LP-26.9 verify_chain_coverage() (Java substitute) — resolves with LP-26 build | pending LP-26 | — |
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
| 08 | LP-40.4 / LP-40.5 | not started | IN_PROGRESS | — |
| 08 | LP-47 / LP-48 | not started | pending (step 6) | — |
