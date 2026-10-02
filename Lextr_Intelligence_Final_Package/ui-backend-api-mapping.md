# UI → Backend API Mapping and Integration Test Plan: Lextr Intelligence

> Scope: `intelligence-ui` (Form UI) · `intelligence-service` (Java API) · `lexie-ai` (Python AI API)
> Branch analysed: `feature/lextr-intelligence-v1.38.0` in all three repos (after merging `origin/main`).
> **Revision 4 (2026-09-27):** API mapping (§3–§12), payload compatibility (§13), code-level candidates for the gaps (§14), the **integration test plan (§15) with a tracker (§16)**, and the **Phase 1 implementation status (§17)**. §13 and §16 describe the UI *before* Phase 1; §17 lists what the UI sends now.
> Static source analysis only: nothing was run or deployed. Expected results in §15 are predictions from code, and **§15 is where they get confirmed**.
> Paths are relative to the workspace root `/Users/tejal/codebase/lextrai/`. Gateway evidence comes from the sibling Core repo `/Users/tejal/codebase/lextr/` and is marked **[ext]**.

**Contents:**
1. Executive Summary
2. Project Structure
3. UI Feature → API Mapping
4. UI API Inventory
5. Java API Inventory
6. Python API Inventory
7. Backend APIs Without UI Consumers
8. UI APIs Without Backend Match
9. Possible Matches
10. Relationship Matrix
11. Findings
12. Limitations
13. **Payload Compatibility**
14. **Candidates for Missing Integrations**
15. **Integration Test Plan**
16. **Test Tracker**
17. **Implementation Status (Phase 1 + Phase 2)**

---

## 1. Executive Summary

### 1.1 Inventory

| Metric | Count | Notes |
|---|---:|---|
| UI features analysed | **37** | 21 sidebar destinations + Lexie panel (22 reachable), 5 Lexie inline answer renderers, 9 declared-unmounted slices, 1 orphaned screen (`PresetManagementScreen`) |
| UI API call sites found | **40** | 18 run from a reachable component; 22 sit in API clients or hooks that nothing reachable calls |
| Java APIs found | **87** | 31 `@RestController` classes |
| Python APIs found | **72** | 71 on 9 FastAPI routers + 1 app-level route (`/demo` static mount excluded) |
| Direct matches (path and method) | **16** | 10 Java, 6 Python |
| Possible matches (UI call site → backend) | **18** | Dormant clients whose path and method match exactly but that no reachable UI calls |
| UI call sites with no backend match | **6** | 2 of them are reachable (both `/api/v1/intelligence/run`) |
| Backend APIs with no identified UI consumer | **58 Java / 66 Python** | Java: 87 − 10 direct − 19 possible. Python: 72 − 6 direct |
| **Payload-compatible call sites (§13)** | **22 ✅ / 1 ⚠️ / 17 ❌** | Of the 16 direct matches, only **8** are payload-compatible (Knowledge Hub ×6, Evidence, Inbox decide) |
| **Gap candidates (§14)** | **11 / 9 / 5** | 11 needs have an existing endpoint and only need wiring. 9 are implemented in code but have no endpoint. 5 are true gaps |

### 1.2 Integration readiness (what §15 can test today)

| Status | Integrations | Test phase |
|---|---|---|
| 🟢 **Ready: expected to PASS now** | Knowledge Hub (6 calls, UI and API) · Evidence involvement (API; the UI needs a Core host with `governance.audit.view`) · Training (11, API-level) · Skill definitions (4, API-level) · Inbox decide (API-level) · Java→Python `/run` contract | P0, P1, P3 |
| 🟠 **Testable: expected to FAIL now (the test confirms the defect, then passes after the fix)** | Variance run and rerun · Semantic query · Anomaly · Peer benchmark · Forecast · Supervisory radar · Ratio · Inbox list · Preset draft and lifecycle | P2 |
| 🔴 **Blocked: nothing to call yet** | Lexie panel (no resolver) · Merkle · Multi-hop · AU9 export · HSM key list · Drop-profile rulings · Footnotes · Cross-UC review queue · Preset list · Model registry read · Peer data · Regulatory feed | P5 |

### 1.3 Top findings (details in §11, §13, §14)

1. **A JSON casing mismatch breaks most direct Java integrations.** `intelligence-service` sets a global `SNAKE_CASE` `ObjectMapper` ([JacksonConfig.java:21](intelligence-service/src/main/java/com/lextr/intelligence/config/JacksonConfig.java#L21)). The UI sends camelCase bodies to 8 Java endpoints, and those keys bind to `null` or defaults: the repo's own test [RunCrossLayerWireThroughTest.java:131-143](intelligence-service/src/test/java/com/lextr/intelligence/contract/RunCrossLayerWireThroughTest.java#L131-L143) asserts this. Responses come back in snake_case while the UI reads camelCase. Only DTOs with `@JsonProperty` names, or bodies the UI already writes in snake_case (definitions, training, evidence), line up.
2. **The Lexie panel and the Variance run call `/api/v1/intelligence/run`, which no backend exposes** (Java serves `POST /run`, JAVA-085). In production the Lexie panel never sends the request anyway, because `httpClient.resolve()` always returns a clarification ([httpHost.ts:29-30](intelligence-ui/src/shell/host/httpHost.ts#L29-L30)). **No resolver exists in either backend** (§14.2).
3. **The Core gateway has no route to intelligence-service**, and the UI's nginx has no `/api` proxy. Only Knowledge Hub (via `/lexie/ai/**`) is routed end to end outside the Vite dev proxy.
4. **The analytics endpoints compute only from data in the request body, and the UI never sends it.** Anomaly, Benchmark, Forecast and Radar return **REFUSED**. **Ratio silently computes from hard-coded fallback constants** ([RatioRunCoordinatorImpl.java:225-249](intelligence-service/src/main/java/com/lextr/intelligence/ratio/coordinator/impl/RatioRunCoordinatorImpl.java#L225-L249)), so users see plausible-looking numbers that are not from their filing.
5. **The variance run payload does not match lexie-ai's UC1a contract.** lexie-ai requires `cycle_id` and `mdrm_id`, and gets `report_type`, `level`, `cell` and periods. Semantic (UC8) is unbound in lexie-ai's dispatcher.
6. **The Inbox cannot show anything at runtime.** Pending items live in an in-memory map that only unit tests fill ([InboxServiceImpl.java:23-41](intelligence-service/src/main/java/com/lextr/intelligence/inbox/service/impl/InboxServiceImpl.java#L23-L41)), so `GET /api/v1/inbox` always returns `[]`.
7. **Several governance screens run on mock data while matching APIs or code exist** (Skill Registry, Presets, Runtime Policies, Training Data, Model Registry, Audit timeline). **Four unmounted slices have exact-contract Java code waiting for an endpoint**: Multi-hop, AU9 Export, HSM key list, Drop-profile rulings (§14.4).
8. **Knowledge is served twice.** The UI uses lexie-ai `/api/v1/variance/knowledge/*`; intelligence-service's `/knowledge/*` (JAVA-080–084) has no UI consumer.

---

## 2. Project Structure

| Application | Technology | Purpose | Location |
|---|---|---|---|
| Form UI | React 19, TypeScript, Vite 8, Zustand, MUI 9, Tailwind 4, `@lextrfolk4/shared-ui`. Uses the native `fetch` API (no Axios, no generated client) | Intelligence analyst and governance frontend. Runs standalone at `/intelligence/` or is embedded in Core (`src/embed`) | `intelligence-ui/` |
| Java API | Java 17, Spring Boot 3.3.4 (WebMVC), springdoc-openapi 2.6.0, WebClient, Flyway, OPA client. No Spring Security; identity comes from headers | Control plane: runs, presets, governance, evidence ledger, training registry, analytics UCs. Port `8059` | `intelligence-service/` |
| Python AI API | Python, FastAPI 0.115.14, uvicorn | AI runtime: `/run` dispatcher (skills UC1–UC12), VarianceAI (cycles, review, audit, knowledge/RAG), rules chatbot, training-job executor. Port `5003` | `lexie-ai/` |

### Project inventory

| Concern | Finding | Evidence |
|---|---|---|
| UI API base URL | `VITE_INTELLIGENCE_API_BASE` (default `''`, same-origin). Only some clients use it | [featureClient.ts:8](intelligence-ui/src/shell/featureClient.ts#L8), [httpHost.ts:14](intelligence-ui/src/shell/host/httpHost.ts#L14), [presetApi.ts:11](intelligence-ui/src/api/presetApi.ts#L11), [audit-evidence/api.ts:4](intelligence-ui/src/features/audit-evidence/api.ts#L4), [training-data/api.ts:4](intelligence-ui/src/features/training-data/api.ts#L4) |
| Clients that ignore the base | Hard-coded relative paths | [variance/api.ts:108,135](intelligence-ui/src/features/variance/api.ts#L108), [semantic/api.ts:17](intelligence-ui/src/features/semantic/api.ts#L17), [skills/api.ts:54-138](intelligence-ui/src/features/skills/api.ts#L54), [useIntelligenceRun.ts:18,53](intelligence-ui/src/hooks/useIntelligenceRun.ts#L18), [useSkills.ts:13](intelligence-ui/src/hooks/useSkills.ts#L13), [usePresetLifecycle.ts:52](intelligence-ui/src/hooks/usePresetLifecycle.ts#L52) |
| Gateway base (Knowledge Hub only) | `VITE_GATEWAY_URL` (default `http://localhost:8080`) + `/lexie/ai/` prefix | [KnowledgeHub.tsx:50-57](intelligence-ui/src/features/knowledge/components/KnowledgeHub.tsx#L50-L57) |
| Dev proxy | Vite proxies `/api` → `INTELLIGENCE_SERVICE_URL` (default `http://localhost:8059`) | [vite.config.ts:12-14](intelligence-ui/vite.config.ts#L12-L14) |
| Prod web server | nginx on port 3000 serves static files only; **no `/api` proxy** | [nginx.conf](intelligence-ui/nginx.conf) |
| Host seam | `DEV` or `VITE_LEXTR_HOST=reference` selects the in-memory `referenceHost`; otherwise `httpHost` | [main.tsx:13](intelligence-ui/src/main.tsx#L13) |
| Identity (UI) | `VITE_LEXTR_CLIENT_ID` / `VITE_LEXTR_PRINCIPAL` → `X-Client-Id`, `X-User-Id`, `X-Actor-Id` headers | [featureClient.ts:18-26](intelligence-ui/src/shell/featureClient.ts#L18-L26) |
| Feature flags | `VITE_LEXTR_AUDIT_EVIDENCE` (default false) | [deploymentFlags.ts:16](intelligence-ui/src/shell/deploymentFlags.ts#L16) |
| Feature registry | 21 mount contracts composed into the sidebar | [registry.ts:32-41](intelligence-ui/src/shell/registry.ts#L32-L41) |
| Java context path | None (no `server.servlet.context-path`, no `addPathPrefix`) | [application.yaml:10](intelligence-service/src/main/resources/application.yaml#L10) |
| Java JSON naming | Global `SNAKE_CASE`, `FAIL_ON_UNKNOWN_PROPERTIES=false` | [JacksonConfig.java:19-24](intelligence-service/src/main/java/com/lextr/intelligence/config/JacksonConfig.java#L19-L24) |
| Java authn/authz | No Spring Security. Tenant and actor come from headers (`X-Client-Id`, `X-Tenant-Id`, `X-User-Id`, `X-Actor-Id`, `X-Principal-Id`, `X-User-Functions`). Governance decisions go to OPA (`lextr.opa.url`). `ActorFilter` is off by default | [ActorWiring.java](intelligence-service/src/main/java/com/lextr/intelligence/evidence/actor/ActorWiring.java), [OpaClient.java](intelligence-service/src/main/java/com/lextr/intelligence/policy/client/OpaClient.java) |
| Java → Python | `LexieAiClient` `POST {LEXIE_URL}/run`. Health probe `GET /api/v1/chatbot/ai/health`. `LEXIE_URL` defaults to `http://localhost:8004` | [LexieAiClient.java:29-30](intelligence-service/src/main/java/com/lextr/intelligence/lexie/client/LexieAiClient.java#L29-L30), [application.yaml:13-15](intelligence-service/src/main/resources/application.yaml#L13-L15), [DependencyHealthIndicators.java:28-30](intelligence-service/src/main/java/com/lextr/intelligence/observability/DependencyHealthIndicators.java#L28-L30) |
| Java OpenAPI | springdoc (`/v3/api-docs`, generated at runtime; no checked-in spec) | [pom.xml:85-86](intelligence-service/pom.xml) |
| Python OpenAPI | FastAPI dynamic OpenAPI (`configure_dynamic_openapi`). The gateway aggregates `/lexie/ai/openapi.json` | [app.py:100](lexie-ai/app.py#L100), gateway-service.yml:35-36 **[ext]** |
| Python authn | Per-route `X-User-Id` header (some routes default it to `anonymous`/`demo-console`, others return 401) | [variance_routers.py:43-45](lexie-ai/routes/variance_routers.py#L43-L45), [variance_knowledge_routers.py:109-116](lexie-ai/routes/variance_knowledge_routers.py#L109-L116), [rules_execution_routers.py:27-34](lexie-ai/routes/rules_execution_routers.py#L27-L34) |
| Python → Java | None ("no outbound client to intelligence-service") | [lexie_ai/training/__init__.py:3](lexie-ai/lexie_ai/training/__init__.py#L3) |
| Core gateway | `/lexie/ai/**` → lexie-ai (`RewritePath=/lexie/ai/(?<segment>.*), /${segment}`), dev base `http://localhost:5003`. **No route for intelligence-service** | gateway-service.yml:148-153, gateway-service-dev.yml:22-23 **[ext]** |
| Generated clients | None in the UI | — |
| Other API consumers | lexie-ai `demo-ui/index.html` (variance console). Core `frontend-service` and `rules-service` call `api/v1/chatbot/ai/*` | [lexie-ai/demo-ui/index.html](lexie-ai/demo-ui/index.html), `lextr/typescript/frontend-service/src/shared-ui/constants/apiEndpoints.ts` **[ext]** |

---

## 3. UI Feature → API Mapping

Mapping Type is one of `Direct`, `Possible` or `No Backend Match`. The Confidence score rates the endpoint mapping. Contract defects (casing, headers) are listed under Evidence and lower the score.

| Feature | UI Component/Page | User Action | API ID | Backend | Method | Endpoint | Mapping Type | Confidence | Evidence |
|---|---|---|---|---|---|---|---|---:|---|
| Ask Lexie (global panel) | `LexiePanel` → `httpHost.run` | Ask a question | JAVA-085 | Java | POST | UI: `/api/v1/intelligence/run` · BE: `/run` | No Backend Match | 60 | [httpHost.ts:14,36](intelligence-ui/src/shell/host/httpHost.ts#L14); [RunController.java:21,40](intelligence-service/src/main/java/com/lextr/intelligence/run/controller/RunController.java#L21). Path differs and no rewrite exists. In prod `resolve()` always clarifies, so `run()` is never reached ([LexiePanel.tsx:38-41](intelligence-ui/src/components/organisms/LexiePanel.tsx#L38-L41)) |
| Variance Analysis (UC1) | `VarianceWorkspace` → `varianceStore` | Run variance | JAVA-085 | Java | POST | UI: `/api/v1/intelligence/run` · BE: `/run` | No Backend Match | 60 | [variance/api.ts:108](intelligence-ui/src/features/variance/api.ts#L108), [varianceStore.ts:32](intelligence-ui/src/features/variance/varianceStore.ts#L32). Body is camelCase `RunRequest`, so `client_id` is null and `@NotBlank` fails |
| Variance Analysis (UC1) | `VarianceResult` → `varianceStore` | Re-run with analyst input | JAVA-087 | Java | POST | `/run/{runId}/rerun` | Direct | 80 | [variance/api.ts:135](intelligence-ui/src/features/variance/api.ts#L135); [RerunController.java:27,42](intelligence-service/src/main/java/com/lextr/intelligence/rerun/controller/RerunController.java#L42). Path and method match, but there is no `/api` prefix (Vite proxies only `/api`) and a camelCase `clientId` fails `@NotBlank` ([RerunRequest.java:27](intelligence-service/src/main/java/com/lextr/intelligence/rerun/dto/RerunRequest.java#L27)) |
| Semantic & Reference (UC8) | `SemanticWorkspace` → `semanticStore` | Submit semantic query | JAVA-070 | Java | POST | `/api/v1/semantic/query` | Direct | 80 | [semantic/api.ts:17](intelligence-ui/src/features/semantic/api.ts#L17); [SemanticRunController.java:31-33](intelligence-service/src/main/java/com/lextr/intelligence/semantic/controller/SemanticRunController.java#L31). The server expects `RunRequest` (`client_id`, `input_payload.intent`). The UI sends top-level camelCase `clientId`, `query` and `intent` |
| Anomaly Detection (UC5) | `AnomalyMount` / `AnomalyWorkspace` | Execute run | JAVA-031 | Java | POST | `/api/v1/anomaly/run` | Direct | 85 | [anomaly/mount.tsx:12](intelligence-ui/src/features/anomaly/mount.tsx#L12); [AnomalyRunController.java:25](intelligence-service/src/main/java/com/lextr/intelligence/anomaly/controller/AnomalyRunController.java#L25). Field names match `AnomalyRunRequest`, but casing differs, so the server falls back to its defaults |
| Peer Benchmarking (UC7) | `BenchmarkMount` | Execute run | JAVA-061 | Java | POST | `/api/v1/peer-benchmark/run` | Direct | 85 | [benchmark/mount.tsx:12](intelligence-ui/src/features/benchmark/mount.tsx#L12); [PeerBenchmarkController.java:25](intelligence-service/src/main/java/com/lextr/intelligence/benchmark/controller/PeerBenchmarkController.java#L25). Same casing caveat |
| Forecast Projection (UC6) | `ForecastMount` | Execute run | JAVA-038 | Java | POST | `/api/v1/forecast/run` | Direct | 85 | [forecast/mount.tsx:12](intelligence-ui/src/features/forecast/mount.tsx#L12); [ForecastRunController.java:25](intelligence-service/src/main/java/com/lextr/intelligence/forecast/controller/ForecastRunController.java#L25). Same casing caveat |
| Ratio Reconciliation (UC4) | `RatioMount` | Execute run | JAVA-066 | Java | POST | `/api/v1/ratio/run` | Direct | 85 | [ratio/mount.tsx:13](intelligence-ui/src/features/ratio/mount.tsx#L13); [RatioRunController.java:22](intelligence-service/src/main/java/com/lextr/intelligence/ratio/controller/RatioRunController.java#L22). `executedBy` matches `RatioRunRequest.executedBy` in name; casing caveat applies |
| Supervisory Radar | `SupervisoryMount` | Execute run | JAVA-072 | Java | POST | `/api/v1/supervisory-radar/run` | Direct | 85 | [supervisory/mount.tsx:16](intelligence-ui/src/features/supervisory/mount.tsx#L16); [SupervisoryRadarController.java:25](intelligence-service/src/main/java/com/lextr/intelligence/supervisory/controller/SupervisoryRadarController.java#L25). Same casing caveat |
| Approvals Inbox | `InboxMount` | Load pending items | JAVA-054 | Java | GET | `/api/v1/inbox?surface=INTELLIGENCE` | Direct | 88 | [inbox/mount.tsx:22](intelligence-ui/src/features/inbox/mount.tsx#L22); [InboxController.java:24-28](intelligence-service/src/main/java/com/lextr/intelligence/inbox/controller/InboxController.java#L24). Headers and query match. The response `InboxItemRow` serialises as `subject_id` while the UI reads `subjectId` |
| Approvals Inbox | `InboxMount` | Approve / Reject | JAVA-055 | Java | POST | `/api/v1/inbox/{subjectId}/decide?subjectKind&capability&action&surface` | Direct | 92 | [inbox/mount.tsx:35-36](intelligence-ui/src/features/inbox/mount.tsx#L35-L36); [InboxController.java:34-43](intelligence-service/src/main/java/com/lextr/intelligence/inbox/controller/InboxController.java#L34-L43). `@RequestParam` names match exactly. `subjectKind` and `capability` are read from the loaded item, which the casing issue on JAVA-054 leaves undefined |
| Evidence Ledger (gov-audit) | `AuditEvidenceSurface` | Query AI involvement | JAVA-005 | Java | GET | `/api/intelligence/evidence/involvement` | Direct | 95 | [audit-evidence/api.ts:11-12](intelligence-ui/src/features/audit-evidence/api.ts#L11); [EvidenceLedgerController.java:38-42](intelligence-service/src/main/java/com/lextr/intelligence/evidence/controller/EvidenceLedgerController.java#L38-L42). Params and headers match. The UI model is snake_case (`run_id`). Gated by a capability and a flag |
| Knowledge Hub | `KnowledgeHub` | Load collections | PYTHON-047 | Python | GET | `/lexie/ai` + `/api/v1/variance/knowledge/collections` | Direct | 90 | [KnowledgeHub.tsx:257](intelligence-ui/src/features/knowledge/components/KnowledgeHub.tsx#L257); [variance_knowledge_routers.py:490](lexie-ai/routes/variance_knowledge_routers.py#L490). Gateway rewrite **[ext]** |
| Knowledge Hub | `KnowledgeHub` | List documents | PYTHON-043 | Python | GET | `…/knowledge/documents` | Direct | 90 | [KnowledgeHub.tsx:268](intelligence-ui/src/features/knowledge/components/KnowledgeHub.tsx#L268); [variance_knowledge_routers.py:374](lexie-ai/routes/variance_knowledge_routers.py#L374) |
| Knowledge Hub | `KnowledgeHub` | Chat with knowledge | PYTHON-049 | Python | POST | `…/knowledge/chat` | Direct | 92 | [KnowledgeHub.tsx:287-295](intelligence-ui/src/features/knowledge/components/KnowledgeHub.tsx#L287-L295); `ChatMessage{message,session_id,report,mdrm_id}` matches exactly ([variance_knowledge_routers.py:133-137](lexie-ai/routes/variance_knowledge_routers.py#L133-L137)) |
| Knowledge Hub | `KnowledgeHub` | New conversation | PYTHON-051 | Python | DELETE | `…/knowledge/chat/{session_id}` | Direct | 90 | [KnowledgeHub.tsx:318-320](intelligence-ui/src/features/knowledge/components/KnowledgeHub.tsx#L318-L320); [variance_knowledge_routers.py:587](lexie-ai/routes/variance_knowledge_routers.py#L587) |
| Knowledge Hub | `KnowledgeHub` | Upload files | PYTHON-042 | Python | POST | `…/knowledge/documents/upload` (multipart) | Direct | 90 | [KnowledgeHub.tsx:343-360](intelligence-ui/src/features/knowledge/components/KnowledgeHub.tsx#L343-L360); query params match the route signature ([variance_knowledge_routers.py:273](lexie-ai/routes/variance_knowledge_routers.py#L273)) |
| Knowledge Hub | `KnowledgeHub` | Paste text document | PYTHON-041 | Python | POST | `…/knowledge/documents` | Direct | 92 | [KnowledgeHub.tsx:390-402](intelligence-ui/src/features/knowledge/components/KnowledgeHub.tsx#L390-L402); `DocumentIngest` fields match ([variance_knowledge_routers.py:140-152](lexie-ai/routes/variance_knowledge_routers.py#L140-L152)) |
| Training Data (surface) | `TrainingDataWorkspace` (store only) | Datasets / health / samples / runs / eligibility / freeze / attest / approve / bulk / lineage | JAVA-009,014,016,019,021,013,012,011,027,018,017 | Java | GET/POST | `/api/intelligence/training/...` | Possible | 72 | `trainingApi` [training-data/api.ts:29-43](intelligence-ui/src/features/training-data/api.ts#L29-L43) matches [TrainingController.java:43-157](intelligence-service/src/main/java/com/lextr/intelligence/training/controller/TrainingController.java#L43) exactly, but nothing calls `trainingApi` (the workspace reads `useTrainingStore` only) |
| Skill Registry | `SkillRegistry` (uses `skillMocks`) | List / transition / MRM review / tag | JAVA-039,045,044,046 | Java | GET/POST/PATCH | `/api/v1/governance/definitions[...]` | Possible | 72 | [skills/api.ts:45-158](intelligence-ui/src/features/skills/api.ts#L45) matches [RegisteredDefinitionController.java:31-119](intelligence-service/src/main/java/com/lextr/intelligence/governance/controller/RegisteredDefinitionController.java#L31) with `@JsonProperty` snake_case DTOs. The screen imports `SKILL_SEED` from mocks instead ([SkillRegistry.tsx:5-7](intelligence-ui/src/features/skills/components/SkillRegistry.tsx#L5-L7)) |
| Preset Wizard (orphaned) | `PresetManagementScreen` → `PresetWizard` → `usePresetLifecycle` | Commit draft | JAVA-062 | Java | POST | `/api/v1/presets/draft` | Possible | 72 | [presetApi.ts:68](intelligence-ui/src/api/presetApi.ts#L68), [usePresetLifecycle.ts:25](intelligence-ui/src/hooks/usePresetLifecycle.ts#L25); snake_case body matches. `PresetManagementScreen` is never imported, so the screen is unreachable |
| Preset Wizard (orphaned) | `PresetWizard` / `GovernanceEnvelope` | Request activation | JAVA-065 | Java | POST | `/api/v1/presets/{id}/versions/{v}/lifecycle` | Possible | 60 | [presetApi.ts:72](intelligence-ui/src/api/presetApi.ts#L72); the server requires `X-Principal-Id` ([PresetController.java:41](intelligence-service/src/main/java/com/lextr/intelligence/preset/controller/PresetController.java#L41)), which the UI never sends |
| Preset Wizard (orphaned) | `presetApi.get` | — (no caller) | JAVA-064 | Java | GET | `/api/v1/presets/{id}/versions/{v}` | Possible | 65 | [presetApi.ts:76](intelligence-ui/src/api/presetApi.ts#L76); no call site |
| Preset Wizard (orphaned) | `GovernanceEnvelope` | Approve envelope | — (nearest JAVA-065) | — | POST | `/api/intelligence/presets/{id}/envelope/approve` | No Backend Match | 0 | [usePresetLifecycle.ts:52](intelligence-ui/src/hooks/usePresetLifecycle.ts#L52) |
| Legacy run hook | `useIntelligenceRun` (unused) | run / rerun | — (nearest JAVA-085/087) | — | POST | `/api/intelligence/run`, `/api/intelligence/run/{id}/rerun` | No Backend Match | 0 | [useIntelligenceRun.ts:18,53](intelligence-ui/src/hooks/useIntelligenceRun.ts#L18) |
| Legacy skills hook | `useSkills` (unused) | fetch skills | — (nearest JAVA-039) | — | GET | `/api/intelligence/skills` | No Backend Match | 0 | [useSkills.ts:13](intelligence-ui/src/hooks/useSkills.ts#L13) |
| Lexie inline renderers: Impact (UC2), Trend (UC3), Digital Twin (UC9), Analytical (UC10), Lineage, Swarm | `dispatcher.tsx` renderers | View answer of a Lexie run | JAVA-053, 079, 037, 030, 056, 073 | Java | POST | `/api/v1/{impact,trend,digital-twin,analytical}/run`, `/api/v1/lineage/extract`, `/api/v1/swarm/run` | Possible | 55–60 | Renderers show `/run` output keyed on `useCase` ([dispatcher.tsx:11-21](intelligence-ui/src/shell/lexie/dispatcher.tsx#L11-L21)). UI type names `LineageExtractionResponse` and `SwarmRunResponse` match the Java response DTOs (60). No direct call |
| Rules & Logic Assist (UC11) | Roadmap screen; full panel is Core-hosted | Draft rule | JAVA-006, 007, 008 | Java | POST/GET | `/api/intelligence/rules/...` | Possible | 50 | [rules/mount.tsx:1-5](intelligence-ui/src/features/rules/mount.tsx#L1-L5) says the panel is mounted by Core; [RulesAssistController.java:31-46](intelligence-service/src/main/java/com/lextr/intelligence/rules/controller/RulesAssistController.java#L31) |
| Analytical Assist (UC10) nav | Find & build | Ask for a report (empty ask by default) | JAVA-030 | Java | POST | `/api/v1/analytical/run` | Direct | 95 | [analytical/analyticalApi.ts](intelligence-ui/src/features/analytical/analyticalApi.ts) `runAnalytical`; identity in headers only (§17.7) |
| Analytical Assist (UC10) nav | Refine & build | Accept / reject each operation, apply the batch | JAVA-121 | Java | POST | `/api/v1/analytical/batch/apply?surface=` | Direct | 95 | [analytical/analyticalApi.ts](intelligence-ui/src/features/analytical/analyticalApi.ts) `applyAnalyticalBatch` (§17.7) |
| Document assurance tab (unreachable) | `knowledge/AssuranceTab.tsx` | View assurance result | JAVA-032 | Java | GET | `/api/v1/assurance/documents/{id}/status` | Possible | 55 | Only imported by tests. Its model (`anchorMatched`, `grounded`) resembles `AssuranceEvaluationResult`; not wired |
| Runtime Policies | `Policies` (uses `policiesMocks`) | Browse policies | JAVA-057 | Java | GET | `/api/v1/opa/policies` | Possible | 40 | [Policies.tsx:5](intelligence-ui/src/features/policies/components/Policies.tsx#L5); the endpoint lists loaded OPA policies (admin-style) |
| AI Risk & Controls | `ReviewQueue` (inline items) | Review AI outputs | PYTHON-055 | Python | GET | `/api/v1/variance/review/queue` | Possible | 35 | [ReviewQueue.tsx:9-12](intelligence-ui/src/features/risk/components/ReviewQueue.tsx#L9-L12) shows hard-coded UC1/UC12 items. The Python queue covers variance analyses only |
| HSM (unmounted) | `HsmSecurityWorkspace` | — | JAVA-051, 052 | Java | GET/POST | `/api/v1/hsm/{status,operations}` | Possible | 50 | [declaredUnmounted.ts:11](intelligence-ui/src/shell/declaredUnmounted.ts#L11) names the endpoint and explains why it is not mounted |
| TDM sandbox (unmounted) | TDM workspace | — | JAVA-069 | Java | POST | `/api/v1/sandbox/probes` | Possible | 50 | [declaredUnmounted.ts:16](intelligence-ui/src/shell/declaredUnmounted.ts#L16) |
| Streaming audit (unmounted) | `StreamingAuditWorkspace` | — | JAVA-071 | Java | POST | `/api/v1/streaming/ingest` | Possible | 55 | [declaredUnmounted.ts:15](intelligence-ui/src/shell/declaredUnmounted.ts#L15) ("renders an ingest batch RESPONSE") |
| Resilience (unmounted) | Resilience console | — | JAVA-067, 068 | Java | GET/POST | `/api/v1/resilience/*` | Possible | 45 | [declaredUnmounted.ts:12](intelligence-ui/src/shell/declaredUnmounted.ts#L12) |
| Export (unmounted) | `ExportWorkspace` | — | JAVA-003 | Java | POST | `/api/intelligence/evidence/export` | Possible | 40 | [declaredUnmounted.ts:9](intelligence-ui/src/shell/declaredUnmounted.ts#L9) (run-scoped export) |
| Tenant (unmounted) | Tenant admin | — | JAVA-074–078 | Java | GET/POST | `/api/v1/tenants/*` | Possible | 25 | [declaredUnmounted.ts:13](intelligence-ui/src/shell/declaredUnmounted.ts#L13): tenant admin is Core-owned |
| Merkle / Multi-hop / DropProfile ruling (unmounted) | respective workspaces | — | — | — | — | — | No Backend Match | 0 | [declaredUnmounted.ts:10,14,17](intelligence-ui/src/shell/declaredUnmounted.ts#L10) say no endpoint exists |
| Surface Map, Presets inventory, Model Registry, Role Mapping, Audit & Evidence timeline | respective components | Browse | — | — | — | — | (no API call) | — | Mock or inline data: [SurfaceMap.tsx:3](intelligence-ui/src/components/organisms/SurfaceMap.tsx#L3), [Presets.tsx:9](intelligence-ui/src/features/presets/components/Presets.tsx#L9), `RoleMapping` `ROLE_MAP`, `ModelRegistry`/`AuditEvidence` inline |

---

## 4. Complete UI API Inventory

Reach: **R** = runs from a reachable, mounted component. **D** = dormant (the client or hook exists but nothing reachable calls it). **G** = gated (capability and/or flag).

| API ID | UI Feature | Method | Endpoint (as sent) | Client/Service | Source | Reach | Backend Match | Confidence |
|---|---|---|---|---|---|---|---|---:|
| UI-01 | Ask Lexie | POST | `{BASE}/api/v1/intelligence/run` | `httpClient.run` | [httpHost.ts:14,36](intelligence-ui/src/shell/host/httpHost.ts#L14) | R (short-circuited) | None; nearest JAVA-085 | 60 |
| UI-02 | Variance run | POST | `/api/v1/intelligence/run` | `executeVarianceRun` | [variance/api.ts:108](intelligence-ui/src/features/variance/api.ts#L108) | R | None; nearest JAVA-085 | 60 |
| UI-03 | Variance rerun | POST | `/run/{parentRunId}/rerun` | `executeRerun` | [variance/api.ts:135](intelligence-ui/src/features/variance/api.ts#L135) | R | JAVA-087 | 80 |
| UI-04 | Semantic query | POST | `/api/v1/semantic/query` | `executeSemanticQuery` | [semantic/api.ts:17](intelligence-ui/src/features/semantic/api.ts#L17) | R | JAVA-070 | 80 |
| UI-05 | Anomaly | POST | `{BASE}/api/v1/anomaly/run` | `featureClient.postJson` | [anomaly/mount.tsx:12](intelligence-ui/src/features/anomaly/mount.tsx#L12) | R | JAVA-031 | 85 |
| UI-06 | Peer benchmark | POST | `{BASE}/api/v1/peer-benchmark/run` | `postJson` | [benchmark/mount.tsx:12](intelligence-ui/src/features/benchmark/mount.tsx#L12) | R | JAVA-061 | 85 |
| UI-07 | Forecast | POST | `{BASE}/api/v1/forecast/run` | `postJson` | [forecast/mount.tsx:12](intelligence-ui/src/features/forecast/mount.tsx#L12) | R | JAVA-038 | 85 |
| UI-08 | Ratio | POST | `{BASE}/api/v1/ratio/run` | `postJson` | [ratio/mount.tsx:13](intelligence-ui/src/features/ratio/mount.tsx#L13) | R | JAVA-066 | 85 |
| UI-09 | Supervisory radar | POST | `{BASE}/api/v1/supervisory-radar/run` | `postJson` | [supervisory/mount.tsx:16](intelligence-ui/src/features/supervisory/mount.tsx#L16) | R | JAVA-072 | 85 |
| UI-10 | Inbox list | GET | `{BASE}/api/v1/inbox?surface=INTELLIGENCE` | `getJson` | [inbox/mount.tsx:22](intelligence-ui/src/features/inbox/mount.tsx#L22) | R | JAVA-054 | 88 |
| UI-11 | Inbox decide | POST | `{BASE}/api/v1/inbox/{id}/decide?…` | `postJson` | [inbox/mount.tsx:36](intelligence-ui/src/features/inbox/mount.tsx#L36) | R | JAVA-055 | 92 |
| UI-12 | Evidence involvement | GET | `{BASE}/api/intelligence/evidence/involvement?anchorKind&anchorRef&from&to` | `fetchInvolvement` | [audit-evidence/api.ts:11](intelligence-ui/src/features/audit-evidence/api.ts#L11) | R, G | JAVA-005 | 95 |
| UI-13 | KH collections | GET | `{GW}/lexie/ai/api/v1/variance/knowledge/collections` | `api()` | [KnowledgeHub.tsx:257](intelligence-ui/src/features/knowledge/components/KnowledgeHub.tsx#L257) | R | PYTHON-047 | 90 |
| UI-14 | KH documents | GET | `{GW}/lexie/ai/api/v1/variance/knowledge/documents` | `api()` | [KnowledgeHub.tsx:268](intelligence-ui/src/features/knowledge/components/KnowledgeHub.tsx#L268) | R | PYTHON-043 | 90 |
| UI-15 | KH chat | POST | `{GW}/lexie/ai/api/v1/variance/knowledge/chat` | `api()` | [KnowledgeHub.tsx:287](intelligence-ui/src/features/knowledge/components/KnowledgeHub.tsx#L287) | R | PYTHON-049 | 92 |
| UI-16 | KH chat reset | DELETE | `{GW}/lexie/ai/api/v1/variance/knowledge/chat/{sid}` | `api()` | [KnowledgeHub.tsx:318](intelligence-ui/src/features/knowledge/components/KnowledgeHub.tsx#L318) | R | PYTHON-051 | 90 |
| UI-17 | KH upload | POST | `{GW}/lexie/ai/api/v1/variance/knowledge/documents/upload?…` | `api()` | [KnowledgeHub.tsx:356](intelligence-ui/src/features/knowledge/components/KnowledgeHub.tsx#L356) | R | PYTHON-042 | 90 |
| UI-18 | KH text ingest | POST | `{GW}/lexie/ai/api/v1/variance/knowledge/documents` | `api()` | [KnowledgeHub.tsx:390](intelligence-ui/src/features/knowledge/components/KnowledgeHub.tsx#L390) | R | PYTHON-041 | 92 |
| UI-19 | Training datasets | GET | `{BASE}/api/intelligence/training/datasets` | `trainingApi.datasets` | [training-data/api.ts:30](intelligence-ui/src/features/training-data/api.ts#L30) | D | JAVA-009 | 72 |
| UI-20 | Training health | GET | `…/training/datasets/{id}/health` | `trainingApi.health` | [training-data/api.ts:31](intelligence-ui/src/features/training-data/api.ts#L31) | D | JAVA-014 | 72 |
| UI-21 | Training samples | GET | `…/training/datasets/{id}/samples` | `trainingApi.samples` | [training-data/api.ts:32](intelligence-ui/src/features/training-data/api.ts#L32) | D | JAVA-016 | 72 |
| UI-22 | Training runs | GET | `…/training/runs` | `trainingApi.runs` | [training-data/api.ts:33](intelligence-ui/src/features/training-data/api.ts#L33) | D | JAVA-019 | 72 |
| UI-23 | Training eligibility | GET | `…/training/runs/eligibility?datasetId&examDatasetId` | `trainingApi.eligibility` | [training-data/api.ts:34-35](intelligence-ui/src/features/training-data/api.ts#L34) | D | JAVA-021 | 72 |
| UI-24 | Training freeze | POST | `…/training/datasets/{id}/freeze` | `trainingApi.freeze` | [training-data/api.ts:36-37](intelligence-ui/src/features/training-data/api.ts#L36) | D | JAVA-013 | 72 |
| UI-25 | Training attest | POST | `…/training/datasets/{id}/attest` | `trainingApi.attest` | [training-data/api.ts:38](intelligence-ui/src/features/training-data/api.ts#L38) | D | JAVA-012 | 72 |
| UI-26 | Training approve | POST | `…/training/datasets/{id}/approve` | `trainingApi.approve` | [training-data/api.ts:39](intelligence-ui/src/features/training-data/api.ts#L39) | D | JAVA-011 | 72 |
| UI-27 | Training bulk import | POST | `…/training/samples/bulk` | `trainingApi.bulkImport` | [training-data/api.ts:40](intelligence-ui/src/features/training-data/api.ts#L40) | D | JAVA-027 | 70 |
| UI-28 | Training lineage (model) | GET | `…/training/lineage/models/{modelId}` | `trainingApi.backward` | [training-data/api.ts:41](intelligence-ui/src/features/training-data/api.ts#L41) | D | JAVA-018 | 72 |
| UI-29 | Training lineage (dataset) | GET | `…/training/lineage/datasets/{datasetId}` | `trainingApi.forward` | [training-data/api.ts:42](intelligence-ui/src/features/training-data/api.ts#L42) | D | JAVA-017 | 72 |
| UI-30 | Skill definitions list | GET | `/api/v1/governance/definitions?kind&status` | `fetchDefinitions` | [skills/api.ts:55](intelligence-ui/src/features/skills/api.ts#L55) | D | JAVA-039 | 72 |
| UI-31 | Skill status transition | POST | `/api/v1/governance/definitions/{id}/status` | `transitionDefinitionStatus` | [skills/api.ts:77](intelligence-ui/src/features/skills/api.ts#L77) | D | JAVA-045 | 72 |
| UI-32 | Skill MRM review | POST | `/api/v1/governance/definitions/{id}/mrm` | `reviewDefinitionMrm` | [skills/api.ts:107](intelligence-ui/src/features/skills/api.ts#L107) | D | JAVA-044 | 72 |
| UI-33 | Skill tags | PATCH | `/api/v1/governance/definitions/{id}/tags` | `updateDefinitionTags` | [skills/api.ts:138](intelligence-ui/src/features/skills/api.ts#L138) | D | JAVA-046 | 72 |
| UI-34 | Preset draft | POST | `{BASE}/api/v1/presets/draft` | `presetApi.createDraft` | [presetApi.ts:68](intelligence-ui/src/api/presetApi.ts#L68) | D | JAVA-062 | 72 |
| UI-35 | Preset lifecycle | POST | `{BASE}/api/v1/presets/{id}/versions/{v}/lifecycle` | `presetApi.requestTransition` | [presetApi.ts:72](intelligence-ui/src/api/presetApi.ts#L72) | D | JAVA-065 | 60 |
| UI-36 | Preset get | GET | `{BASE}/api/v1/presets/{id}/versions/{v}` | `presetApi.get` | [presetApi.ts:76](intelligence-ui/src/api/presetApi.ts#L76) | D | JAVA-064 | 65 |
| UI-37 | Preset envelope approve | POST | `/api/intelligence/presets/{id}/envelope/approve` | `usePresetLifecycle.approveEnvelope` | [usePresetLifecycle.ts:52](intelligence-ui/src/hooks/usePresetLifecycle.ts#L52) | D | **None** | 0 |
| UI-38 | Legacy run | POST | `/api/intelligence/run` | `useIntelligenceRun.run` | [useIntelligenceRun.ts:18](intelligence-ui/src/hooks/useIntelligenceRun.ts#L18) | D | **None** | 0 |
| UI-39 | Legacy rerun | POST | `/api/intelligence/run/{id}/rerun` | `useIntelligenceRun.rerun` | [useIntelligenceRun.ts:53](intelligence-ui/src/hooks/useIntelligenceRun.ts#L53) | D | **None** | 0 |
| UI-40 | Legacy skills | GET | `/api/intelligence/skills` | `useSkills.fetchSkills` | [useSkills.ts:13](intelligence-ui/src/hooks/useSkills.ts#L13) | D | **None** | 0 |

`{BASE}` = `VITE_INTELLIGENCE_API_BASE` (default `''`). `{GW}` = `VITE_GATEWAY_URL` (default `http://localhost:8080`).

---

## 5. Java Backend API Inventory

Controller paths are relative to `intelligence-service/src/main/java/com/lextr/intelligence/`. Identity headers are shown in the Request column as `hdr:`. "UI Consumer" names the UI-## call site. Confidence is 0 when no UI consumer was identified.

| API ID | Method | Endpoint | Controller | Service | Request Model | Response Model | UI Consumer | Confidence |
|---|---|---|---|---|---|---|---|---:|
| JAVA-001 | POST | `/api/intelligence/evidence/erasures` | `evidence/controller/EvidenceLedgerController.java:67` | `EvidenceLifecycleEngine` | `ErasureBody`; hdr: X-Client-Id, X-User-Id | `ApiResponse<ErasureReport>` | — | 0 |
| JAVA-002 | GET | `/api/intelligence/evidence/erasures/reconciliation` | `EvidenceLedgerController.java:75` | `EvidenceLifecycleEngine` | hdr: X-Client-Id | `ApiResponse<List<ReconciliationFinding>>` | — | 0 |
| JAVA-003 | POST | `/api/intelligence/evidence/export` | `EvidenceLedgerController.java:46` | `EvidenceReadService` | params anchorKind/anchorRef/from/to; hdr: X-Client-Id, X-User-Id, X-User-Functions | `byte[]` (zip) | (Export slice, unmounted) | 40 |
| JAVA-004 | POST | `/api/intelligence/evidence/handback` | `EvidenceLedgerController.java:56` | `EvidenceReadService` | hdr: X-Client-Id, X-User-Id, X-User-Functions | `ApiResponse<HandBack>` | — | 0 |
| JAVA-005 | GET | `/api/intelligence/evidence/involvement` | `EvidenceLedgerController.java:38` | `EvidenceReadService` | params anchorKind/anchorRef/from/to; hdr: X-Client-Id, X-User-Id, X-User-Functions | `ApiResponse<Involvement>` | UI-12 | 95 |
| JAVA-006 | POST | `/api/intelligence/rules/assist` | `rules/controller/RulesAssistController.java:31` | `RulesAssistCoordinator.assist` → LexieAiClient | `AssistRequest`; hdr: X-Client-Id | `ApiResponse<AssistOutcome>` | (Core-hosted rules panel) | 50 |
| JAVA-007 | POST | `/api/intelligence/rules/runs/{runId}/acceptance` | `RulesAssistController.java:37` | `RulesAssistCoordinator.recordAcceptance` | `AcceptanceRequest` | `ApiResponse<AcceptanceReceipt>` | (Core) | 50 |
| JAVA-008 | GET | `/api/intelligence/rules/sessions/{sessionRef}/runs` | `RulesAssistController.java:46` | `RulesAssistDao` | hdr: X-Client-Id | `ApiResponse<List<Map>>` | (Core) | 50 |
| JAVA-009 | GET | `/api/intelligence/training/datasets` | `training/controller/TrainingController.java:43` | `DatasetService.list` | hdr: X-Client-Id | `ApiResponse<List<Dataset>>` | UI-19 (D) | 72 |
| JAVA-010 | POST | `/api/intelligence/training/datasets` | `TrainingController.java:48` | `DatasetService.createDraft` | `CreateDatasetRequest` | `ApiResponse<Dataset>` | — | 0 |
| JAVA-011 | POST | `/api/intelligence/training/datasets/{id}/approve` | `TrainingController.java:70` | `DatasetService.approve` | hdr: X-Client-Id, X-User-Id | `ApiResponse<Dataset>` | UI-26 (D) | 72 |
| JAVA-012 | POST | `/api/intelligence/training/datasets/{id}/attest` | `TrainingController.java:65` | `DatasetService.attest` | hdr | `ApiResponse<Dataset>` | UI-25 (D) | 72 |
| JAVA-013 | POST | `/api/intelligence/training/datasets/{id}/freeze` | `TrainingController.java:59` | `DatasetService.freeze` | `FreezeRequest{exam_dataset_id}` | `ApiResponse<Dataset>` | UI-24 (D) | 72 |
| JAVA-014 | GET | `/api/intelligence/training/datasets/{id}/health` | `TrainingController.java:54` | `DatasetService.health` | hdr | `ApiResponse<AnchorFreshness>` | UI-20 (D) | 72 |
| JAVA-015 | POST | `/api/intelligence/training/datasets/{id}/retire` | `TrainingController.java:75` | `DatasetService.retire` | hdr | `ApiResponse<Dataset>` | — | 0 |
| JAVA-016 | GET | `/api/intelligence/training/datasets/{id}/samples` | `TrainingController.java:80` | `SampleService.list` | hdr | `ApiResponse<List<Sample>>` | UI-21 (D) | 72 |
| JAVA-017 | GET | `/api/intelligence/training/lineage/datasets/{datasetId}` | `TrainingController.java:155` | `LineageService.forward` | hdr | `ApiResponse<List<Map>>` | UI-29 (D) | 72 |
| JAVA-018 | GET | `/api/intelligence/training/lineage/models/{modelId}` | `TrainingController.java:150` | `LineageService.backward` | hdr | `ApiResponse<List<Map>>` | UI-28 (D) | 72 |
| JAVA-019 | GET | `/api/intelligence/training/runs` | `TrainingController.java:108` | `RunService.list` (training) | hdr | `ApiResponse<List<Run>>` | UI-22 (D) | 72 |
| JAVA-020 | POST | `/api/intelligence/training/runs` | `TrainingController.java:120` | `RunService.initiate` | `InitiateRunRequest` | `ApiResponse<Run>` | — | 0 |
| JAVA-021 | GET | `/api/intelligence/training/runs/eligibility` | `TrainingController.java:114` | `RunService.eligibility` | params datasetId, examDatasetId | `ApiResponse<Map>` | UI-23 (D) | 72 |
| JAVA-022 | POST | `/api/intelligence/training/runs/{id}/advance` | `TrainingController.java:126` | `RunService.advance` | `AdvanceRequest` | `ApiResponse<Run>` | — | 0 |
| JAVA-023 | POST | `/api/intelligence/training/runs/{id}/evaluation` | `TrainingController.java:133` | `RunService.recordEvaluation` | `EvaluationMeasurement` | `ApiResponse<Run>` | — (executor callback?) | 0 |
| JAVA-024 | POST | `/api/intelligence/training/runs/{id}/fail` | `TrainingController.java:145` | `RunService.fail` | `FailRequest` | `ApiResponse<Run>` | — | 0 |
| JAVA-025 | POST | `/api/intelligence/training/runs/{id}/register` | `TrainingController.java:139` | `RunService.register` | `RegisterRequest` | `ApiResponse<Run>` | — | 0 |
| JAVA-026 | POST | `/api/intelligence/training/samples` | `TrainingController.java:85` | `SampleService.capture` | `SampleCapture` | `ApiResponse<Sample>` | — | 0 |
| JAVA-027 | POST | `/api/intelligence/training/samples/bulk` | `TrainingController.java:91` | `SampleService.bulkImport` | `List<SampleCapture>` | `ApiResponse<List<RowOutcome>>` | UI-27 (D) | 70 |
| JAVA-028 | POST | `/api/intelligence/training/samples/{id}/accept` | `TrainingController.java:97` | `SampleService.accept` | hdr | `ApiResponse<Sample>` | — | 0 |
| JAVA-029 | POST | `/api/intelligence/training/samples/{id}/revise` | `TrainingController.java:102` | `SampleService.revise` | `SampleCapture` | `ApiResponse<Sample>` | — | 0 |
| JAVA-030 | POST | `/api/v1/analytical/run` | `analytical/controller/AnalyticalRunController.java:32` | `AnalyticalRunCoordinator` → OPA `tool_scope_analytical` → LexieAiClient `/run` UC10 | `AnalyticalRunRequest{query, catalog_profile, preset_id}`; hdr: X-Client-Id, X-User-Id, X-User-Functions (contract changed 2026-10-02, §17.7) | `ApiResponse<AnalyticalRunResponse>` (adds `parse`) | Analytical Assist, Find & build / Refine & build | 95 |
| JAVA-031 | POST | `/api/v1/anomaly/run` | `anomaly/controller/AnomalyRunController.java:25` | `AnomalyRunCoordinator` | `AnomalyRunRequest` | `AnomalyRunResponse` (bare) | UI-05 | 85 |
| JAVA-032 | GET | `/api/v1/assurance/documents/{documentId}/status` | `assurance/controller/DocumentAssuranceController.java:38` | `DocumentAssuranceService` | hdr: X-Client-Id | `ApiResponse<AssuranceEvaluationResult>` | (AssuranceTab, unreachable) | 55 |
| JAVA-033 | POST | `/api/v1/assurance/runs` | `DocumentAssuranceController.java:22` | `DocumentAssuranceService` | `DocumentAssuranceRun` | `ApiResponse<AssuranceEvaluationResult>` | — | 0 |
| JAVA-034 | GET | `/api/v1/calibration/monitoring-metrics` | `calibration/controller/CalibrationGovernanceController.java:35` | `CalibrationService` | hdr | `ApiResponse<List<MonitoringMetricRow>>` | — | 0 |
| JAVA-035 | POST | `/api/v1/calibration/promote` | `CalibrationGovernanceController.java:26` | `CalibrationService` | `CalibratorPromotionCandidate` | `ApiResponse<CalibratorPromotionResult>` | — | 0 |
| JAVA-036 | GET | `/api/v1/calibration/thresholds/{key}` | `CalibrationGovernanceController.java:43` | `CalibrationService` | hdr | `ApiResponse<CalibrationThreshold>` | — | 0 |
| JAVA-037 | POST | `/api/v1/digital-twin/run` | `digitaltwin/controller/DigitalTwinRunController.java:25` | `DigitalTwinRunCoordinator` → LexieAiClient | `DigitalTwinRunRequest` | `ApiResponse<DigitalTwinRunResponse>` | (Digital Twin renderer, possible) | 55 |
| JAVA-038 | POST | `/api/v1/forecast/run` | `forecast/controller/ForecastRunController.java:25` | `ForecastRunCoordinator` | `ForecastRunRequest` | `ForecastRunResponse` | UI-07 | 85 |
| JAVA-039 | GET | `/api/v1/governance/definitions` | `governance/controller/RegisteredDefinitionController.java:31` | `RegisteredDefinitionService` | params kind, status; hdr: X-Tenant-Id / X-Client-Id | `ApiResponse<List<RegisteredDefinition>>` | UI-30 (D) | 72 |
| JAVA-040 | POST | `/api/v1/governance/definitions/sync` | `RegisteredDefinitionController.java:59` | same | `List<DefinitionSyncRequest>` | `ApiResponse<List<…>>` | — (lexie-ai skill sync / ops) | 0 |
| JAVA-041 | GET | `/api/v1/governance/definitions/tags` | `RegisteredDefinitionController.java:135` | same | — | `ApiResponse<TagTaxonomyDto>` | — | 0 |
| JAVA-042 | GET | `/api/v1/governance/definitions/{id}` | `RegisteredDefinitionController.java:47` | same | hdr | `ApiResponse<RegisteredDefinition>` | — | 0 |
| JAVA-043 | PATCH | `/api/v1/governance/definitions/{id}/enabled` | `RegisteredDefinitionController.java:119` | same | param enabled; hdr | `ApiResponse<RegisteredDefinition>` | — | 0 |
| JAVA-044 | POST | `/api/v1/governance/definitions/{id}/mrm` | `RegisteredDefinitionController.java:87` | same | `DefinitionMrmReviewRequest` (`@JsonProperty`) | `ApiResponse<RegisteredDefinition>` | UI-32 (D) | 72 |
| JAVA-045 | POST | `/api/v1/governance/definitions/{id}/status` | `RegisteredDefinitionController.java:71` | same | `DefinitionStatusTransitionRequest` | `ApiResponse<RegisteredDefinition>` | UI-31 (D) | 72 |
| JAVA-046 | PATCH | `/api/v1/governance/definitions/{id}/tags` | `RegisteredDefinitionController.java:103` | same | `DefinitionTagsUpdateRequest` | `ApiResponse<RegisteredDefinition>` | UI-33 (D) | 72 |
| JAVA-047 | GET | `/api/v1/governance/estate-ledger/integrity` | `governance/controller/EstateLedgerController.java:65` | `EstateLedgerService` | hdr | `ApiResponse<EstateLedgerIntegrityResult>` | — | 0 |
| JAVA-048 | POST | `/api/v1/governance/estate-ledger/read` | `EstateLedgerController.java:47` | `EstateLedgerService` | hdr | `ApiResponse<List<EstateLedgerEntry>>` | — | 0 |
| JAVA-049 | POST | `/api/v1/governance/estate-ledger/record` | `EstateLedgerController.java:26` | `EstateLedgerService` | `Map<String,Object>` | `ApiResponse<EstateLedgerEntry>` | — | 0 |
| JAVA-050 | GET | `/api/v1/governance/estate-ledger/subject/{subjectId}` | `EstateLedgerController.java:56` | `EstateLedgerService` | hdr | `ApiResponse<List<EstateLedgerEntry>>` | — (HistoryDrawer is a candidate) | 0 |
| JAVA-051 | POST | `/api/v1/hsm/operations` | `hsm/controller/HsmSecurityController.java:30` | `HsmSigningCoordinator` | `HsmOperationRequest` | `HsmOperationResponse` | (HSM slice, unmounted) | 50 |
| JAVA-052 | GET | `/api/v1/hsm/status` | `HsmSecurityController.java:25` | — | — | `HsmApplianceStatus` | (HSM slice, unmounted) | 50 |
| JAVA-053 | POST | `/api/v1/impact/run` | `impact/controller/ImpactRunController.java:26` | `ImpactRunCoordinator` → LexieAiClient | `ImpactRunRequest` | `ApiResponse<ImpactRunResponse>` | (Impact renderer, possible) | 55 |
| JAVA-054 | GET | `/api/v1/inbox` | `inbox/controller/InboxController.java:24` | `InboxService` | param surface; hdr: X-Client-Id, X-Actor-Id | `ApiResponse<List<InboxItemRow>>` | UI-10 | 88 |
| JAVA-055 | POST | `/api/v1/inbox/{subjectId}/decide` | `InboxController.java:34` | `InboxService.takeDecisionFromInbox` | params subjectKind, capability, action, surface, reason | `ApiResponse<EstateLedgerEntry>` | UI-11 | 92 |
| JAVA-056 | POST | `/api/v1/lineage/extract` | `lineage/controller/LineageGraphController.java:25` | `LineageGraphCoordinator` | `LineageExtractionRequest` | `LineageExtractionResponse` | (Lineage renderer, possible) | 60 |
| JAVA-057 | GET | `/api/v1/opa/policies` | `policy/controller/OpaPolicyController.java:28` | `OpaPolicyLoaderService` | — | `ApiResponse<Map>` | (Runtime Policies, possible) | 40 |
| JAVA-058 | POST | `/api/v1/opa/refresh` | `OpaPolicyController.java:34` | `OpaPolicyLoaderService` | — | `ApiResponse<Map>` | — (ops) | 0 |
| JAVA-059 | POST | `/api/v1/opa/refresh/{policyName}` | `OpaPolicyController.java:42` | `OpaPolicyLoaderService` | — | `ApiResponse<Map>` | — (ops) | 0 |
| JAVA-060 | POST | `/api/v1/operational/query` | `operational/controller/OperationalRunController.java:31` | `OperationalRunCoordinator` → LexieAiClient | `RunRequest` | `ApiResponse<AgentRunRecord>` | — (UC12 has no renderer) | 0 |
| JAVA-061 | POST | `/api/v1/peer-benchmark/run` | `benchmark/controller/PeerBenchmarkController.java:25` | `PeerBenchmarkCoordinator` | `PeerBenchmarkRequest` | `PeerBenchmarkResponse` | UI-06 | 85 |
| JAVA-062 | POST | `/api/v1/presets/draft` | `preset/controller/PresetController.java:27` | `PresetService.createDraft` | `CreatePresetDraftRequest`; hdr: X-Client-Id, X-Principal-Id | `ApiResponse<PresetDto>` | UI-34 (D) | 72 |
| JAVA-063 | GET | `/api/v1/presets/resolve` | `PresetController.java:52` | `PresetService.resolveOperationalPreset` | params | `ApiResponse<PresetDto>` | — (internal) | 0 |
| JAVA-064 | GET | `/api/v1/presets/{id}/versions/{version}` | `PresetController.java:63` | `PresetService.getPresetByIdAndVersion` | hdr | `ApiResponse<PresetDto>` | UI-36 (D) | 65 |
| JAVA-065 | POST | `/api/v1/presets/{id}/versions/{version}/lifecycle` | `PresetController.java:38` | `PresetService.requestActivation` | `PresetActivationRequest{target_state}`; hdr: X-Principal-Id **required** | `ApiResponse<PresetDto>` | UI-35 (D) | 60 |
| JAVA-066 | POST | `/api/v1/ratio/run` | `ratio/controller/RatioRunController.java:22` | `RatioRunCoordinator` | `RatioRunRequest` | `RatioRunResponse` | UI-08 | 85 |
| JAVA-067 | POST | `/api/v1/resilience/operations` | `resilience/controller/ResilienceController.java:32` | `ResilienceCoordinator` | `ResilienceOperationRequest` | `ResilienceOperationResponse` | (Resilience, unmounted) | 45 |
| JAVA-068 | GET | `/api/v1/resilience/topology` | `ResilienceController.java:27` | `DisasterRecoveryService` | — | `List<ClusterRegionInfo>` | (Resilience, unmounted) | 45 |
| JAVA-069 | POST | `/api/v1/sandbox/probes` | `sandbox/controller/TdmSandboxController.java:22` | `SandboxService.recordProbe` | `SandboxProbeRecord` | `ApiResponse<EstateLedgerEntry>` | (TDM, unmounted) | 50 |
| JAVA-070 | POST | `/api/v1/semantic/query` | `semantic/controller/SemanticRunController.java:31` | `SemanticRunCoordinator` → LexieAiClient | `RunRequest` (`@Valid`) | `ApiResponse<AgentRunRecord>` | UI-04 | 80 |
| JAVA-071 | POST | `/api/v1/streaming/ingest` | `streaming/controller/StreamingAuditController.java:25` | `StreamingAuditCoordinator` | `StreamIngestBatchRequest` | `StreamIngestBatchResponse` | (Streaming, unmounted) | 55 |
| JAVA-072 | POST | `/api/v1/supervisory-radar/run` | `supervisory/controller/SupervisoryRadarController.java:25` | `SupervisoryRadarCoordinator` | `SupervisoryRadarRequest` | `SupervisoryRadarResponse` | UI-09 | 85 |
| JAVA-073 | POST | `/api/v1/swarm/run` | `swarm/controller/SwarmRunController.java:25` | `SwarmGovernanceCoordinator` | `SwarmRunRequest` | `SwarmRunResponse` | (Swarm renderer, possible) | 60 |
| JAVA-074 | GET | `/api/v1/tenants` | `tenant/controller/TenantAdminController.java:25` | `TenantDao` | — | `List<TenantProfile>` | (Core-owned) | 25 |
| JAVA-075 | POST | `/api/v1/tenants/abac/evaluate` | `TenantAdminController.java:43` | `TenantSecurityCoordinator` | `AbacEvaluationRequest` | `AbacEvaluationResult` | — | 0 |
| JAVA-076 | POST | `/api/v1/tenants/admin/operations` | `TenantAdminController.java:37` | `TenantSecurityCoordinator` | `TenantAdminRequest` | `TenantAdminResponse` | (Core-owned) | 25 |
| JAVA-077 | GET | `/api/v1/tenants/{tenantId}` | `TenantAdminController.java:30` | `TenantDao` | — | `TenantProfile` | (Core-owned) | 25 |
| JAVA-078 | GET | `/api/v1/tenants/{tenantId}/abac/bindings` | `TenantAdminController.java:49` | `TenantDao` | — | `List<AbacAttributeBinding>` | (Core-owned) | 25 |
| JAVA-079 | POST | `/api/v1/trend/run` | `trend/controller/TrendRunController.java:26` | `TrendRunCoordinator` → LexieAiClient | `TrendRunRequest` | `ApiResponse<TrendRunResponse>` | (Trend renderer, possible) | 55 |
| JAVA-080 | GET | `/knowledge/documents/{id}` | `knowledge/controller/KnowledgeHubController.java:44` | `KnowledgeHubDao.readHeader` | hdr: X-Client-Id | `ApiResponse<Map>` | — (UI KH uses lexie-ai) | 30 |
| JAVA-081 | POST | `/knowledge/get_complementary_context` | `KnowledgeHubController.java:91` | `KnowledgeHubService` | `KnowledgeRetrieveRequest` | `ApiResponse<KnowledgeRetrieveResponse>` | — (service-to-service) | 0 |
| JAVA-082 | POST | `/knowledge/ingest` | `KnowledgeHubController.java:71` | `KnowledgeHubService.ingestDocument` | `KnowledgeIngestRequest` | `ApiResponse<KnowledgeIngestResponse>` | — (UI KH uses PYTHON-041) | 30 |
| JAVA-083 | POST | `/knowledge/ingest/batch` | `KnowledgeHubController.java:63` | `IngestionBatchService.ingest` | `IngestionBatchRequest` | `ApiResponse<IngestionBatchResponse>` | — | 30 |
| JAVA-084 | POST | `/knowledge/retrieve` | `KnowledgeHubController.java:81` | `KnowledgeHubService.retrieve` | `KnowledgeRetrieveRequest` | `ApiResponse<KnowledgeRetrieveResponse>` | — | 0 |
| JAVA-085 | POST | `/run` | `run/controller/RunController.java:40` | `RunService.executeRun` → LexieAiClient | `RunRequest` (`@Valid`); hdr: X-Client-Id (optional; must equal body) | `ApiResponse<RunResult>` | UI-01, UI-02 (path mismatch) | 60 |
| JAVA-086 | GET | `/run/{runId}` | `RunController.java:52` | `RunService.getRunStatus` | — | `ApiResponse<RunResult>` | — (polling; no UI) | 0 |
| JAVA-087 | POST | `/run/{runId}/rerun` | `rerun/controller/RerunController.java:42` | `RerunService.executeRerun` | `RerunRequest` (`@Valid`) | `ApiResponse<RerunResponse>` | UI-03 | 80 |

Not endpoints: `GlobalExceptionHandler.java`, `IngestionBatchRefusedException.java` and `PolicyDeniedException.java` matched the controller file-name pattern but declare no routes. Actuator health (`/actuator/health`, with readiness groups `db`, `opa`, `lexie`) and springdoc (`/v3/api-docs`, `/swagger-ui`) come from the framework and are not in the list.

---

## 6. Python AI Backend API Inventory

Router files are relative to `lexie-ai/`. The prefix is applied either by the router or at `include_router` in [app.py:106-121](lexie-ai/app.py#L106-L121).

| API ID | Method | Endpoint | Router | Function | Request Model | Response Model | UI Consumer | Confidence |
|---|---|---|---|---|---|---|---|---:|
| PYTHON-001 | GET | `/api/v1/chatbot/ai/health` | `routes/rules_execution_routers.py:40` | `health_check` | — | dict | — (Java health probe; Docker HEALTHCHECK) | 0 |
| PYTHON-002 | POST | `/api/v1/chatbot/ai/query-old` | `rules_execution_routers.py:45` | `generate_rule_ai` | `dict` | dict | — (legacy) | 0 |
| PYTHON-003 | POST | `/api/v1/chatbot/ai/query` | `rules_execution_routers.py:67` | `generate_rule_ai_agno` | `dict`; X-User-Id | dict | — (Core frontend-service **[ext]**) | 0 |
| PYTHON-004 | DELETE | `/api/v1/chatbot/ai/memory/{user_id}` | `rules_execution_routers.py:94` | `clear_memory` | path | dict | — | 0 |
| PYTHON-005 | POST | `/api/v1/chatbot/ai/rule-description` | `rules_execution_routers.py:116` | `generate_rule_description` | `RuleDescriptionRequest` | dict | — (Core rules-service **[ext]**) | 0 |
| PYTHON-006 | POST | `/api/v1/chatbot/ai/rule-summary` | `rules_execution_routers.py:145` | `generate_rule_summary` | `RuleSummaryRequest` | dict | — (Core frontend-service **[ext]**) | 0 |
| PYTHON-007 | POST | `/api/v1/chatbot/ai/knowledge/refresh` | `rules_execution_routers.py:169` | `refresh_knowledge` | query force | dict | — (ops) | 0 |
| PYTHON-008 | GET | `/api/v1/chatbot/ai/knowledge/status` | `rules_execution_routers.py:180` | `knowledge_status` | — | dict | — (ops) | 0 |
| PYTHON-009 | DELETE | `/api/v1/chatbot/ai/knowledge/clear` | `rules_execution_routers.py:200` | `clear_knowledge` | — | dict | — (ops) | 0 |
| PYTHON-010 | POST | `/api/v1/chatbot/ai/mdrm/recommend` | `rules_execution_routers.py:211` | `recommend_endpoint` | `MdrmSuggestionRequest` | dict | — (Core frontend-service **[ext]**) | 0 |
| PYTHON-011 | POST | `/run` | `routes/run_routers.py:16` | `run` → `RunDispatcher` | `RunRequest` (`lexie_ai/run/contract`) | `RunResult` | — (**internal**: Java LexieAiClient) | 0 |
| PYTHON-012 | POST | `/api/v1/training/jobs` | `routes/training_routers.py:43` | `submit_job` | `JobIn` | dict | — (training executor; no caller found) | 0 |
| PYTHON-013 | GET | `/api/v1/variance/audit/analyses/{analysis_id}/export` | `routes/variance_audit_routers.py:56` | `export_analysis` | path | file | — (demo-ui) | 0 |
| PYTHON-014 | GET | `/api/v1/variance/audit/analyses/{analysis_id}/manifest` | `variance_audit_routers.py:76` | `export_manifest` | path | JSON | — (demo-ui) | 0 |
| PYTHON-015 | GET | `/api/v1/variance/audit/cycles/{cycle_id}/export` | `variance_audit_routers.py:91` | `export_cycle` | query final_only | file | — | 0 |
| PYTHON-016 | POST | `/api/v1/variance/audit/cycles/{cycle_id}/notarize` | `variance_audit_routers.py:112` | `notarize_cycle` | path | JSON | — (demo-ui) | 0 |
| PYTHON-017 | GET | `/api/v1/variance/audit/cycles/{cycle_id}/verify` | `variance_audit_routers.py:128` | `verify_cycle` | path | JSON | — (demo-ui) | 0 |
| PYTHON-018 | POST | `/api/v1/variance/audit/verify-pack` | `variance_audit_routers.py:137` | `verify_uploaded_pack` | multipart | JSON | — | 0 |
| PYTHON-019 | GET | `/api/v1/variance/thresholds` | `routes/variance_config_routers.py:101` | `list_thresholds` | query report, include_superseded | JSON | — (demo-ui) | 0 |
| PYTHON-020 | POST | `/api/v1/variance/thresholds` | `variance_config_routers.py:148` | `upsert_threshold` | `ThresholdUpsert` | JSON (201) | — (demo-ui) | 0 |
| PYTHON-021 | DELETE | `/api/v1/variance/thresholds/{threshold_id}` | `variance_config_routers.py:206` | `end_date_threshold` | path | JSON | — (demo-ui) | 0 |
| PYTHON-022 | GET | `/api/v1/variance/model-config` | `variance_config_routers.py:250` | `list_model_config` | — | JSON | — (demo-ui) | 0 |
| PYTHON-023 | GET | `/api/v1/variance/model-config/history` | `variance_config_routers.py:268` | `model_config_history` | query setting_key, limit | JSON | — (demo-ui) | 0 |
| PYTHON-024 | PUT | `/api/v1/variance/model-config/{setting_key}` | `variance_config_routers.py:279` | `set_model_config` | `SettingChange` | JSON | — (demo-ui) | 0 |
| PYTHON-025 | DELETE | `/api/v1/variance/model-config/{setting_key}` | `variance_config_routers.py:332` | `revert_model_config` | query reason | JSON | — (demo-ui) | 0 |
| PYTHON-026 | GET | `/api/v1/variance/source-nodes` | `variance_config_routers.py:382` | `list_source_nodes` | query include_expired | JSON | — (demo-ui) | 0 |
| PYTHON-027 | GET | `/api/v1/variance/source-nodes/candidates` | `variance_config_routers.py:404` | `source_node_candidates` | query period | JSON | — (demo-ui) | 0 |
| PYTHON-028 | POST | `/api/v1/variance/source-nodes` | `variance_config_routers.py:421` | `add_source_node` | `SourceNodeUpsert` | JSON (201) | — (demo-ui) | 0 |
| PYTHON-029 | DELETE | `/api/v1/variance/source-nodes/{mapping_id}` | `variance_config_routers.py:437` | `end_date_source_node` | path | JSON | — (demo-ui) | 0 |
| PYTHON-030 | POST | `/api/v1/variance/thresholds/preview` | `variance_config_routers.py:452` | `preview_thresholds` | query report, cycle_id | JSON | — | 0 |
| PYTHON-031 | GET | `/api/v1/variance/cycles` | `variance_config_routers.py:484` | `list_cycles` | query report, status_filter | JSON | — (demo-ui) | 0 |
| PYTHON-032 | GET | `/api/v1/variance/cycles/{cycle_id}/completeness` | `variance_config_routers.py:496` | `cycle_completeness` | path | JSON | — (demo-ui) | 0 |
| PYTHON-033 | POST | `/api/v1/variance/cycles/{cycle_id}/close` | `variance_config_routers.py:521` | `close_cycle` | `CycleCloseRequest` | JSON | — (demo-ui) | 0 |
| PYTHON-034 | POST | `/api/v1/variance/cycles/{cycle_id}/reopen` | `variance_config_routers.py:545` | `reopen_cycle` | `CycleReopenRequest` | JSON | — (demo-ui) | 0 |
| PYTHON-035 | GET | `/api/v1/demo/status` | `routes/variance_demo_data_routers.py:134` | `demo_status` | — | JSON | — (demo fixture; disabled in prod) | 0 |
| PYTHON-036 | GET | `/api/v1/demo/diagnose` | `variance_demo_data_routers.py:143` | `diagnose` | query report | JSON | — (demo) | 0 |
| PYTHON-037 | GET | `/api/v1/demo/periods` | `variance_demo_data_routers.py:234` | `list_periods` | query report | JSON | — (demo) | 0 |
| PYTHON-038 | GET | `/api/v1/demo/lines` | `variance_demo_data_routers.py:276` | `list_lines` | query report | JSON | — (demo) | 0 |
| PYTHON-039 | POST | `/api/v1/demo/generate-period` | `variance_demo_data_routers.py:322` | `generate_period` | query params | JSON | — (demo) | 0 |
| PYTHON-040 | DELETE | `/api/v1/demo/periods/{period}` | `variance_demo_data_routers.py:470` | `delete_generated_period` | query report, restatement_version | JSON | — (demo) | 0 |
| PYTHON-041 | POST | `/api/v1/variance/knowledge/documents` | `routes/variance_knowledge_routers.py:227` | `ingest_document` | `DocumentIngest`; X-User-Id (401 if absent) | JSON (201) | UI-18 | 92 |
| PYTHON-042 | POST | `/api/v1/variance/knowledge/documents/upload` | `variance_knowledge_routers.py:273` | `upload_document` | multipart `file` + query params | JSON (201) | UI-17 | 90 |
| PYTHON-043 | GET | `/api/v1/variance/knowledge/documents` | `variance_knowledge_routers.py:374` | `list_documents` | query filters | JSON | UI-14 | 90 |
| PYTHON-044 | GET | `/api/v1/variance/knowledge/documents/{doc_id}` | `variance_knowledge_routers.py:415` | `get_document_detail` | path | JSON | — (KH possible) | 35 |
| PYTHON-045 | GET | `/api/v1/variance/knowledge/documents/{doc_id}/download` | `variance_knowledge_routers.py:439` | `download_document` | path | file | — (KH possible) | 30 |
| PYTHON-046 | POST | `/api/v1/variance/knowledge/documents/{doc_id}/archive` | `variance_knowledge_routers.py:462` | `archive_document` | path | JSON | — (KH possible) | 30 |
| PYTHON-047 | GET | `/api/v1/variance/knowledge/collections` | `variance_knowledge_routers.py:490` | `list_collections` | — | JSON | UI-13 | 90 |
| PYTHON-048 | GET | `/api/v1/variance/knowledge/search` | `variance_knowledge_routers.py:523` | `search_knowledge` | query q, report, mdrm_id, limit | JSON | — (KH possible) | 30 |
| PYTHON-049 | POST | `/api/v1/variance/knowledge/chat` | `variance_knowledge_routers.py:547` | `chat_with_knowledge` | `ChatMessage` | JSON (`session_id`, …) | UI-15 | 92 |
| PYTHON-050 | GET | `/api/v1/variance/knowledge/chat/{session_id}` | `variance_knowledge_routers.py:577` | `chat_history` | path | JSON | — (KH possible) | 35 |
| PYTHON-051 | DELETE | `/api/v1/variance/knowledge/chat/{session_id}` | `variance_knowledge_routers.py:587` | `chat_reset` | path | JSON | UI-16 | 90 |
| PYTHON-052 | POST | `/api/v1/variance/knowledge/documents/{doc_id}/relations` | `variance_knowledge_routers.py:595` | `create_relation` | `RelationCreate` | JSON (201) | — | 0 |
| PYTHON-053 | GET | `/api/v1/variance/knowledge/graph/{node_type}/{node_id}` | `variance_knowledge_routers.py:619` | `graph_neighborhood` | query max_hops, direction, relation_types | JSON | — (demo-ui) | 0 |
| PYTHON-054 | POST | `/api/v1/variance/knowledge/snapshots` | `variance_knowledge_routers.py:660` | `freeze_snapshot` | query snapshot_id, cycle_hint, as_of | JSON (201) | — | 0 |
| PYTHON-055 | GET | `/api/v1/variance/review/queue` | `routes/variance_review_routers.py:66` | `get_queue` | query assignee, tier, status_filter | `QueueResponse` | — (AI Risk & Controls, possible) | 35 |
| PYTHON-056 | GET | `/api/v1/variance/analyses/{analysis_id}` | `variance_review_routers.py:84` | `get_analysis` | path | JSON | — (demo-ui) | 0 |
| PYTHON-057 | GET | `/api/v1/variance/cycles/{cycle_id}/lines/{mdrm_id}/analysis` | `variance_review_routers.py:103` | `existing_analysis` | path | JSON | — (demo-ui) | 0 |
| PYTHON-058 | GET | `/api/v1/variance/cycles/{cycle_id}/approved` | `variance_review_routers.py:123` | `approved_explanations` | path | JSON | — | 0 |
| PYTHON-059 | GET | `/api/v1/variance/analyses/{analysis_id}/versions` | `variance_review_routers.py:145` | `get_analysis_versions` | path | JSON | — (demo-ui) | 0 |
| PYTHON-060 | GET | `/api/v1/variance/analyses/{analysis_id}/review` | `variance_review_routers.py:191` | `get_review_state` | path | `ReviewStateResponse` | — (demo-ui) | 0 |
| PYTHON-061 | POST | `/api/v1/variance/analyses/{analysis_id}/review` | `variance_review_routers.py:200` | `submit_review` | `ReviewActionRequest`; X-User-Id | `ReviewActionResponse` | — (demo-ui) | 0 |
| PYTHON-062 | GET | `/api/v1/variance/review/metrics` | `variance_review_routers.py:229` | `get_metrics` | — | JSON | — | 0 |
| PYTHON-063 | GET | `/api/v1/variance/health` | `routes/variance_routers.py:48` | `health` | — | JSON | — (health) | 0 |
| PYTHON-064 | GET | `/api/v1/variance/cycles/available` | `variance_routers.py:53` | `available_cycles` | query report, legal_entity | JSON | — (demo-ui) | 0 |
| PYTHON-065 | GET | `/api/v1/variance/entities` | `variance_routers.py:74` | `available_entities` | — | JSON | — (demo-ui) | 0 |
| PYTHON-066 | POST | `/api/v1/variance/cycles` | `variance_routers.py:102` | `open_cycle` | `OpenCycleRequest` | `CycleResponse` | — (demo-ui) | 0 |
| PYTHON-067 | POST | `/api/v1/variance/cycles/{cycle_id}/detect` | `variance_routers.py:122` | `run_detection` | `DetectRequest` + query | `DetectionResponse` | — (demo-ui) | 0 |
| PYTHON-068 | POST | `/api/v1/variance/cycles/{cycle_id}/analyze` | `variance_routers.py:155` | `analyze_cycle` | query tier, limit | JSON | — (demo-ui) | 0 |
| PYTHON-069 | POST | `/api/v1/variance/cycles/{cycle_id}/analyze/{mdrm_id}` | `variance_routers.py:200` | `analyze_line` | query force | JSON | — (demo-ui) | 0 |
| PYTHON-070 | POST | `/api/v1/variance/cycles/{cycle_id}/regenerate/{mdrm_id}` | `variance_routers.py:254` | `regenerate_line` | query guidance | JSON | — (demo-ui) | 0 |
| PYTHON-071 | GET | `/api/v1/variance/cycles/{cycle_id}` | `variance_routers.py:306` | `get_cycle` | path | `CycleResponse` | — | 0 |
| PYTHON-072 | GET | `/api/v1/variance/status` | `app.py:145` | (inline) | — | JSON | — (demo-ui, Docker comment) | 0 |

The `/demo` static mount serves the lexie-ai variance console and is disabled when `ENV` is production ([app.py:124-136](lexie-ai/app.py#L124-L136)). FastAPI also serves `/openapi.json` and `/docs`.

---

## 7. Backend APIs Without Identified UI Consumers

Every API here is labelled **"No UI consumer identified"**. None of this is a claim that the API is unused: many are consumed by Core, by ops tooling, by the lexie-ai demo console, or by the other backend.

### Java (58)

| API ID | Backend | Method | Endpoint | Purpose | Possible Consumer | Evidence |
|---|---|---|---|---|---|---|
| JAVA-001, 002, 004 | Java | POST/GET/POST | `/api/intelligence/evidence/{erasures, erasures/reconciliation, handback}` | GDPR-style erasure, reconciliation, evidence hand-back | Compliance ops / Core | No UI call; `ops/lp26_evidence_purge.sh` exists |
| JAVA-003 | Java | POST | `/api/intelligence/evidence/export` | Evidence pack export (zip) | Unmounted Export slice | [declaredUnmounted.ts:9](intelligence-ui/src/shell/declaredUnmounted.ts#L9) |
| JAVA-006, 007, 008 | Java | POST/POST/GET | `/api/intelligence/rules/*` | Rules assist (UC11) | Core-hosted `RulesAssistPanel` | [rules/mount.tsx:3-4](intelligence-ui/src/features/rules/mount.tsx#L3-L4) |
| JAVA-010, 015, 020, 022, 024, 025, 026, 028, 029 | Java | mixed | `/api/intelligence/training/*` (create dataset, retire, initiate/advance/fail/register run, capture/accept/revise sample) | Training data lifecycle mutations | Future Training Data UI; operators | `trainingApi` has no wrapper for these |
| JAVA-023 | Java | POST | `/api/intelligence/training/runs/{id}/evaluation` | Record evaluation result | lexie-ai training executor (`PYTHON-012`) via an operator. lexie-ai states it has no outbound client | [lexie_ai/training/__init__.py:3](lexie-ai/lexie_ai/training/__init__.py#L3) |
| JAVA-030, 037, 053, 056, 073, 079 | Java | POST | `/api/v1/{analytical,digital-twin,impact,trend,swarm}/run`, `/api/v1/lineage/extract` | Per-use-case run endpoints | Lexie inline renderers (they render `/run` output instead) | [dispatcher.tsx:11-21](intelligence-ui/src/shell/lexie/dispatcher.tsx#L11-L21) |
| JAVA-032, 033 | Java | GET/POST | `/api/v1/assurance/*` | Document assurance judging | Unreachable `AssuranceTab.tsx` | No import outside tests |
| JAVA-034, 035, 036 | Java | GET/POST/GET | `/api/v1/calibration/*` | Calibrator governance | Model Registry (currently inline data) | — |
| JAVA-040, 041, 042, 043 | Java | POST/GET/GET/PATCH | `/api/v1/governance/definitions/{sync, tags, {id}, {id}/enabled}` | Definition sync, taxonomy, detail, enable | lexie-ai skill-manifest sync / Skill Registry | — |
| JAVA-047–050 | Java | GET/POST/POST/GET | `/api/v1/governance/estate-ledger/*` | Estate ledger read/record/integrity | `HistoryDrawer` / `RowHistoryButton` (currently local) | — |
| JAVA-051, 052 | Java | POST/GET | `/api/v1/hsm/*` | HSM signing | Unmounted HSM slice | [declaredUnmounted.ts:11](intelligence-ui/src/shell/declaredUnmounted.ts#L11) |
| JAVA-057, 058, 059 | Java | GET/POST/POST | `/api/v1/opa/*` | OPA policy listing and reload | Ops (`scripts/opa-docker.sh`) | [OpaPolicyStartupLoader.java:15](intelligence-service/src/main/java/com/lextr/intelligence/policy/service/impl/OpaPolicyStartupLoader.java#L15) |
| JAVA-060 | Java | POST | `/api/v1/operational/query` | UC12 operational query | Lexie (UC12 has no renderer) | [useCaseAliases.ts:46-47](intelligence-ui/src/shell/lexie/useCaseAliases.ts#L46-L47) |
| JAVA-063 | Java | GET | `/api/v1/presets/resolve` | Resolve operational preset | Internal (run pipeline) | — |
| JAVA-067, 068 | Java | POST/GET | `/api/v1/resilience/*` | DR / chaos ops | Platform ops console | [declaredUnmounted.ts:12](intelligence-ui/src/shell/declaredUnmounted.ts#L12) |
| JAVA-069 | Java | POST | `/api/v1/sandbox/probes` | TDM probe record | Unmounted TDM slice | [declaredUnmounted.ts:16](intelligence-ui/src/shell/declaredUnmounted.ts#L16) |
| JAVA-071 | Java | POST | `/api/v1/streaming/ingest` | Streaming audit ingest | Unmounted Streaming slice / event producers | [declaredUnmounted.ts:15](intelligence-ui/src/shell/declaredUnmounted.ts#L15) |
| JAVA-074–078 | Java | GET/POST | `/api/v1/tenants/*` | Tenant admin, ABAC | Core | [declaredUnmounted.ts:13](intelligence-ui/src/shell/declaredUnmounted.ts#L13) |
| JAVA-080–084 | Java | GET/POST | `/knowledge/*` | Java Knowledge Hub (ingest, retrieve, complementary context) | Service-to-service / Core. Duplicates lexie-ai knowledge | §11 Duplicates |
| JAVA-086 | Java | GET | `/run/{runId}` | Run status polling | Core / async hosts | — |

### Python (66)

| API ID | Backend | Method | Endpoint | Purpose | Possible Consumer | Evidence |
|---|---|---|---|---|---|---|
| PYTHON-001 | Python | GET | `/api/v1/chatbot/ai/health` | Liveness | Java readiness probe, Docker HEALTHCHECK | [DependencyHealthIndicators.java:28-30](intelligence-service/src/main/java/com/lextr/intelligence/observability/DependencyHealthIndicators.java#L28), [Dockerfile:36](lexie-ai/Dockerfile#L36) |
| PYTHON-002–010 | Python | mixed | `/api/v1/chatbot/ai/*` | Rules chatbot, rule description/summary, MDRM recommend, knowledge refresh | Core `frontend-service` (`query`, `rule-summary`, `mdrm/recommend`), Core `rules-service` (`rule-description`) | `lextr/typescript/frontend-service/src/shared-ui/constants/apiEndpoints.ts`, `lextr/java/rules-service/.../RulesController.java` **[ext]** |
| PYTHON-011 | Python | POST | `/run` | AI run dispatcher | **Internal / non-UI**: intelligence-service `LexieAiClient` | [LexieAiClient.java:29-30](intelligence-service/src/main/java/com/lextr/intelligence/lexie/client/LexieAiClient.java#L29-L30), [app.py:107](lexie-ai/app.py#L107) |
| PYTHON-012 | Python | POST | `/api/v1/training/jobs` | Fine-tune job executor | Operator / orchestrator (no caller found) | [training_routers.py:43](lexie-ai/routes/training_routers.py#L43) |
| PYTHON-013–034, 053, 056–061, 063–072 | Python | mixed | `/api/v1/variance/*` (cycles, detection, analysis, review, audit, config, graph) | VarianceAI engine | lexie-ai `demo-ui/index.html` console | See the demo-ui path list in §2 |
| PYTHON-035–040 | Python | mixed | `/api/v1/demo/*` | Demo fixture data (disabled in prod) | demo-ui | [variance_demo_data_routers.py:30](lexie-ai/routes/variance_demo_data_routers.py#L30) |
| PYTHON-044, 045, 046, 048, 050, 052, 054 | Python | mixed | `/api/v1/variance/knowledge/{documents/{id}, download, archive, search, chat/{id} GET, relations, snapshots}` | Knowledge detail/curation | Knowledge Hub (not wired), demo-ui | Knowledge Hub has no affordance calling them |
| PYTHON-055, 062 | Python | GET | `/api/v1/variance/review/{queue,metrics}` | Variance review queue | AI Risk & Controls (inline data today) | [ReviewQueue.tsx:9-12](intelligence-ui/src/features/risk/components/ReviewQueue.tsx#L9-L12) |

---

## 8. UI APIs Without Backend Match

| UI API | Method | Endpoint | UI Feature | Expected Backend | Result | Evidence |
|---|---|---|---|---|---|---|
| UI-01 | POST | `/api/v1/intelligence/run` | Ask Lexie (reachable) | Java `/run` (JAVA-085) | **Path not found in Java or Python.** Nothing rewrites `/api/v1/intelligence/run` → `/run`. The Vite proxy forwards `/api` unchanged. nginx has no proxy. The gateway has no intelligence route | [httpHost.ts:14](intelligence-ui/src/shell/host/httpHost.ts#L14), [vite.config.ts:12-14](intelligence-ui/vite.config.ts#L12-L14), [RunController.java:21](intelligence-service/src/main/java/com/lextr/intelligence/run/controller/RunController.java#L21) |
| UI-02 | POST | `/api/v1/intelligence/run` | Variance Analysis (reachable) | Java `/run` (JAVA-085) | Same as UI-01. The body would also fail `@NotBlank client_id` because of casing | [variance/api.ts:108](intelligence-ui/src/features/variance/api.ts#L108) |
| UI-37 | POST | `/api/intelligence/presets/{id}/envelope/approve` | Preset envelope (dormant) | Java preset lifecycle | No envelope-approve route exists. Preset approval is `POST …/lifecycle` (JAVA-065) and MRM is decided server-side by OPA | [usePresetLifecycle.ts:52](intelligence-ui/src/hooks/usePresetLifecycle.ts#L52) |
| UI-38 | POST | `/api/intelligence/run` | Legacy hook (dormant) | Java `/run` | No match (a third spelling of the run path) | [useIntelligenceRun.ts:18](intelligence-ui/src/hooks/useIntelligenceRun.ts#L18) |
| UI-39 | POST | `/api/intelligence/run/{id}/rerun` | Legacy hook (dormant) | Java `/run/{id}/rerun` | No match. The body key `analyst_input` would bind under SNAKE_CASE, but the path is wrong | [useIntelligenceRun.ts:53](intelligence-ui/src/hooks/useIntelligenceRun.ts#L53) |
| UI-40 | GET | `/api/intelligence/skills` | Legacy hook (dormant) | Java definitions (JAVA-039) | No match. It expects `data.items`, while JAVA-039 returns `ApiResponse.data[]` | [useSkills.ts:13,18](intelligence-ui/src/hooks/useSkills.ts#L13) |

Reachable slices declared unmounted *because* no endpoint exists: **merkle** (no tree/proof endpoint), **multihop** (a route endpoint that does not exist), **governance/DropProfile** (no host view) ([declaredUnmounted.ts:10,14,17](intelligence-ui/src/shell/declaredUnmounted.ts#L10)). Both backends confirm this: no Merkle proof or multi-hop route exists in either inventory.

---

## 9. Possible API Matches

| UI Feature | Existing UI API | Possible Backend API | Backend | Why It Could Match | Missing Evidence | Confidence |
|---|---|---|---|---|---|---:|
| Ask Lexie / Variance run | UI-01, UI-02 | JAVA-085 `POST /run` | Java | Same `RunRequest` contract (clientId, presetKey, useCase, entryPoint, inputPayload, correlationId). The Vite comment assumes intelligence-service serves the `/api` path | A path rewrite `/api/v1/intelligence/run` → `/run` in any proxy. Also snake_case bodies | 60 |
| Training Data | UI-19…29 (`trainingApi`) | JAVA-009, 011–014, 016–019, 021, 027 | Java | Exact paths, methods, headers. Freeze body `exam_dataset_id` matches SNAKE_CASE | Any component calling `trainingApi`. The workspace reads a local store | 70–72 |
| Skill Registry | UI-30…33 (`skills/api.ts`) | JAVA-039, 045, 044, 046 | Java | Exact paths. `@JsonProperty` DTOs match the UI's snake_case bodies. `X-Tenant-Id` is accepted | The screen uses `SKILL_SEED` mocks. Default identities `client_001`/`admin_1` are hard-coded in the client | 72 |
| Preset Wizard | UI-34/35/36 | JAVA-062/065/064 | Java | Exact paths; snake_case bodies | `PresetManagementScreen` is never mounted. `X-Principal-Id` is required on lifecycle but never sent | 60–72 |
| Preset envelope approve | UI-37 | JAVA-065 | Java | Both move a preset toward operational under MRM/SoD | Different path and semantics (approve vs lifecycle transition) | 40 |
| Legacy run/rerun/skills hooks | UI-38/39/40 | JAVA-085/087/039 | Java | Same intent | Path spelling differs; hooks unused | 35–40 |
| Lexie Impact/Trend/Twin/Analytical renderers | — (render `/run` output) | JAVA-053/079/037/030 | Java | Dedicated per-UC endpoints return the result shapes the renderers display | The UI never calls them; the dispatcher expects `AgentRunLike` from `/run` | 55 |
| Lexie Lineage/Swarm renderers | — | JAVA-056/073 | Java | UI imports `LineageExtractionResponse`/`SwarmRunResponse`, the same names as the Java DTOs | No call site | 60 |
| Document assurance | — (`AssuranceTab.tsx`, unreachable) | JAVA-032 | Java | Assurance item model (anchor match, grounded) | Component not imported; no client | 55 |
| Streaming audit / HSM / TDM / Resilience / Export (unmounted) | — | JAVA-071 / 051-052 / 069 / 067-068 / 003 | Java | `declaredUnmounted.ts` names these endpoints or payloads explicitly | Slices unmounted; no client code | 40–55 |
| Rules & Logic Assist | — | JAVA-006/007/008 | Java | UC11 rules assist | The panel is Core-hosted | 50 |
| Runtime Policies | — (`policiesMocks`) | JAVA-057 | Java | Lists OPA policies | The UI "policies" model may differ from loaded Rego modules | 40 |
| AI Risk & Controls | — (inline items) | PYTHON-055 | Python | A review queue of AI outputs | The UI queue spans UC1/UC12; the Python queue covers variance analyses only | 35 |
| Knowledge Hub (detail, search, history) | — | PYTHON-044/048/050 | Python | Same router already used by the Hub | No UI affordance found | 30–35 |
| Knowledge Hub (Java variant) | UI-13…18 | JAVA-080–084 | Java | Same domain (document ingest/retrieve) | The UI demonstrably uses lexie-ai instead | 30 |
| Tenant admin (unmounted) | — | JAVA-074–078 | Java | Tenant/ABAC | Declared Core-owned | 25 |

---

## 10. API Relationship Matrix

`0` means no meaningful relationship identified. The matrix is split by domain so it stays readable; ranges such as "JAVA-009…027" are collapsed where every member scores the same.

### 10a. Analyst and Analytics features × Java

| UI Feature | 085 `/run` | 087 rerun | 070 semantic | 031 anomaly | 061 bench | 038 forecast | 066 ratio | 072 radar | 053 impact | 079 trend | 037 twin | 030 analyt. | 056 lineage | 073 swarm | 060 oper. | 006–008 rules |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| Ask Lexie | 60 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 25 | 0 |
| Variance Analysis | 60 | 80 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Semantic & Reference | 0 | 0 | 80 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Anomaly Detection | 0 | 0 | 0 | 85 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Peer Benchmarking | 0 | 0 | 0 | 0 | 85 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Forecast Projection | 0 | 0 | 0 | 0 | 0 | 85 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Ratio Reconciliation | 0 | 0 | 0 | 0 | 0 | 0 | 85 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Supervisory Radar | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 85 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Impact renderer (UC2) | 45 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 55 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Trend renderer (UC3) | 45 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 55 | 0 | 0 | 0 | 0 | 0 | 0 |
| Digital Twin renderer (UC9) | 45 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 55 | 0 | 0 | 0 | 0 | 0 |
| Analytical Assist (UC10) | 45 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 55 | 0 | 0 | 0 | 0 |
| Lineage renderer | 45 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 60 | 0 | 0 | 0 |
| Swarm renderer | 45 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 60 | 0 | 0 |
| Rules & Logic Assist (UC11) | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 50 |

### 10b. Governance, Evidence and Training features × Java

| UI Feature | 054 inbox | 055 decide | 005 involv. | 003 export | 009…027 training (11) | 039 defs | 044 mrm | 045 status | 046 tags | 062 draft | 064 get | 065 lifecycle | 057 opa | 032 assur. | 051/052 hsm | 069 tdm | 071 stream | 067/068 resil. | 074–078 tenant |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| Approvals Inbox | 88 | 92 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Evidence Ledger | 0 | 0 | 95 | 40 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Training Data | 0 | 0 | 0 | 0 | 72 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Skill Registry | 0 | 0 | 0 | 0 | 0 | 72 | 72 | 72 | 72 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Presets (inventory, mounted) | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 30 | 30 | 30 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Preset Wizard (orphaned) | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 72 | 65 | 60 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Runtime Policies | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 40 | 0 | 0 | 0 | 0 | 0 | 0 |
| Document assurance (unreachable) | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 55 | 0 | 0 | 0 | 0 | 0 |
| HSM (unmounted) | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 50 | 0 | 0 | 0 | 0 |
| TDM (unmounted) | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 50 | 0 | 0 | 0 |
| Streaming (unmounted) | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 55 | 0 | 0 |
| Resilience (unmounted) | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 45 | 0 |
| Export (unmounted) | 0 | 0 | 0 | 40 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Tenant (unmounted) | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 25 |

### 10c. Knowledge and Review features × Python (and Java duplicates)

| UI Feature | PY-041 ingest | PY-042 upload | PY-043 list | PY-047 colls | PY-049 chat | PY-051 reset | PY-044/048/050 detail/search/history | PY-055 review queue | JAVA-080–084 Java KH |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| Knowledge Hub | 92 | 90 | 90 | 90 | 92 | 90 | 35 | 0 | 30 |
| AI Risk & Controls | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 35 | 0 |

Features with no backend relationship at all (all zeros): **Surface Map, Model Registry, Role Mapping, Audit & Evidence (timeline), Merkle, Multi-hop, DropProfile ruling**.

---

## 11. Findings

### 11.1 Contract defects on direct integrations (highest impact)

| # | Finding | Affected | Evidence |
|---|---|---|---|
| F1 | **camelCase request bodies against a global SNAKE_CASE mapper.** Unknown keys are ignored (`FAIL_ON_UNKNOWN_PROPERTIES=false`), so fields silently bind to `null` or defaults. `/run`, `/run/{id}/rerun` and `/semantic/query` also carry `@NotBlank clientId`, so they return 400. | UI-02, 03, 04, 05, 06, 07, 08, 09 → JAVA-085, 087, 070, 031, 061, 038, 066, 072 | [JacksonConfig.java:21-22](intelligence-service/src/main/java/com/lextr/intelligence/config/JacksonConfig.java#L21-L22); the repo's own test [RunCrossLayerWireThroughTest.java:131-143](intelligence-service/src/test/java/com/lextr/intelligence/contract/RunCrossLayerWireThroughTest.java#L131-L143) |
| F2 | **snake_case responses read as camelCase.** UI types (`AnomalyRunResponse.runId`, `InboxItem.subjectId`, …) do not match the serialised `run_id`, `subject_id`. The Inbox decision then sends `subjectKind=undefined`. | UI-05…11 | [anomaly/types.ts:29-39](intelligence-ui/src/features/anomaly/types.ts#L29), [InboxWorkspace.tsx:7-17](intelligence-ui/src/features/inbox/InboxWorkspace.tsx#L7), [InboxItemRow.java:3-12](intelligence-service/src/main/java/com/lextr/intelligence/inbox/model/InboxItemRow.java#L3) |
| F3 | **The semantic query payload has the wrong shape.** The UI sends top-level `query`/`intent`/`exposureReady`…; the server reads `input_payload.intent` from `RunRequest`. | UI-04 → JAVA-070 | [semantic/api.ts:23-33](intelligence-ui/src/features/semantic/api.ts#L23-L33), [SemanticRunCoordinatorImpl.java:69-70](intelligence-service/src/main/java/com/lextr/intelligence/semantic/coordinator/impl/SemanticRunCoordinatorImpl.java#L69-L70) |
| F4 | **A required header is missing.** `PresetController.requestLifecycleTransition` requires `X-Principal-Id`; `presetApi` sends only `X-Client-Id`, and `usePresetLifecycle` does not even pass the client id. | UI-34/35 → JAVA-062/065 | [PresetController.java:41](intelligence-service/src/main/java/com/lextr/intelligence/preset/controller/PresetController.java#L41), [presetApi.ts:48-50](intelligence-ui/src/api/presetApi.ts#L48-L50), [usePresetLifecycle.ts:25,80](intelligence-ui/src/hooks/usePresetLifecycle.ts#L25) |

### 11.2 Version and path mismatches

- **The run endpoint has three spellings in the UI** (`/api/v1/intelligence/run`, `/api/intelligence/run`, `/run`), while the backend has one (`/run`). Only the rerun call (`/run/{id}/rerun`) matches the backend literally.
- **The Java service uses three URL conventions:** `/api/v1/*` (most), `/api/intelligence/*` (evidence, training, rules), and bare paths (`/run`, `/knowledge/*`). With no gateway route for this service, every consumer has to know all three.
- **The rerun call has no `/api` prefix**, so it bypasses the Vite `/api` proxy in dev ([variance/api.ts:135](intelligence-ui/src/features/variance/api.ts#L135) vs [vite.config.ts:13](intelligence-ui/vite.config.ts#L13)).
- **Five clients ignore `VITE_INTELLIGENCE_API_BASE`** (variance, semantic, skills, `useIntelligenceRun`, `useSkills`, envelope approve), so a deployment that sets the base still sends these to the UI origin.

### 11.3 Proxy and gateway dependencies

- **Knowledge Hub → lexie-ai** depends on the Core gateway route `/lexie/ai/**` with a prefix-stripping rewrite **[ext]**. This is verified, but it lives outside the analysed repos.
- **Every Java-bound UI call** depends on an `/api` → intelligence-service proxy. One exists only in dev (Vite). The prod nginx has none and the Core gateway has none. **Contradiction:** the Vite comment says the API is "same-origin", but nothing in production provides that origin.
- **Knowledge Hub hard-codes identity** `X-User-Id: "a.kumar"` ([KnowledgeHub.tsx:52](intelligence-ui/src/features/knowledge/components/KnowledgeHub.tsx#L52)) and the gateway default `http://localhost:8080` ([KnowledgeHub.tsx:50](intelligence-ui/src/features/knowledge/components/KnowledgeHub.tsx#L50)). It bypasses the host session that the other features use.
- **Java → lexie-ai port default mismatch.** `LEXIE_URL` defaults to `http://localhost:8004` ([application.yaml:14](intelligence-service/src/main/resources/application.yaml#L14)), but lexie-ai listens on `5003` ([Dockerfile:39](lexie-ai/Dockerfile#L39)), which is also what the gateway uses.

### 11.4 Duplicate and overlapping APIs

| Area | APIs | Note |
|---|---|---|
| Knowledge Hub | JAVA-080–084 `/knowledge/*` vs PYTHON-041–054 `/api/v1/variance/knowledge/*` | Two ingest/retrieve stacks. The UI uses only Python |
| Run dispatch | JAVA-085 `/run` (dispatch by `useCase`) vs per-UC JAVA-030/037/053/060/070/079 | Each per-UC endpoint also reaches lexie-ai. The UI uses `/run` for Lexie and per-UC for analytics |
| Training | JAVA-009–029 (dataset/run registry) vs PYTHON-012 `/api/v1/training/jobs` (executor) | Complementary rather than duplicate; the handoff between them is not coded (lexie-ai has no outbound client) |
| Review queues | PYTHON-055 (variance review) vs JAVA-054 inbox vs UI `ReviewQueue` inline | Three notions of "review" |
| Use-case codes | `UC11` is claimed by both `skills/rules` and `supervisory_radar_skill.py` | Documented in [useCaseAliases.ts:7-9,44-45](intelligence-ui/src/shell/lexie/useCaseAliases.ts#L7-L9) |
| Rules AI | PYTHON-003/005/006 (chatbot) vs JAVA-006 rules assist | Different consumers (Core vs Intelligence) |

### 11.5 Missing integrations (UI has the feature, backend has the API, nothing wires them)

1. Skill Registry → JAVA-039/044/045/046 (the client is written; the screen uses mocks).
2. Training Data → JAVA-009…029 (the client is written; the screen uses a local store).
3. Presets → JAVA-062/064/065 (the wizard is written but not mounted; the mounted `Presets` uses mocks).
4. Runtime Policies → JAVA-057 (mocks).
5. History drawers → JAVA-050 estate ledger by subject.
6. Lexie panel in `httpHost` → no resolver endpoint exists, so `run()` is unreachable ([httpHost.ts:6-8,29-30](intelligence-ui/src/shell/host/httpHost.ts#L6-L8)).

### 11.6 Apparently obsolete UI code

`useIntelligenceRun`, `useSkills`, `usePresetLifecycle.approveEnvelope`, `PresetManagementScreen`, `AssuranceTab`, `DocumentViewerProvenance` and `DocumentFootnotesView` are not reachable from `main.tsx` or the registry. Their paths use a `/api/intelligence/*` convention that the backend applies only to evidence, training and rules.

### 11.7 Features with unclear backend ownership

- **Rules & Logic Assist (UC11):** the UI shows a roadmap and says Core mounts the panel, while intelligence-service exposes `/api/intelligence/rules/*`.
- **Tenant admin:** declared Core-owned, yet intelligence-service exposes `/api/v1/tenants/*`.
- **AI Risk & Controls:** no backend owner identified.

### 11.8 Cross-service dependencies

```
intelligence-ui ──(same-origin /api, dev: Vite proxy)──► intelligence-service :8059
intelligence-ui ──(VITE_GATEWAY_URL /lexie/ai/**)──► Core gateway ──rewrite──► lexie-ai :5003
intelligence-service ──LexieAiClient POST /run──► lexie-ai /run          (PYTHON-011)
intelligence-service ──health GET /api/v1/chatbot/ai/health──► lexie-ai   (PYTHON-001)
intelligence-service ──► OPA (lextr.opa.url, default :8181)
Core frontend-service / rules-service ──► lexie-ai /api/v1/chatbot/ai/*   [ext]
```


### 11.9 Test-relevant findings added in revision 3

| # | Finding | Impact on testing | Evidence |
|---|---|---|---|
| F5 | **Inbox items are in-memory, filled only by tests.** `activeChains` is populated only by `registerChainStep`, which only `TodoRoutingWireThroughTest` calls | `GET /api/v1/inbox` always returns `[]`, and no API can create a pending item, so Inbox decide can only be tested against an arbitrary `subjectId` | [InboxServiceImpl.java:23-41](intelligence-service/src/main/java/com/lextr/intelligence/inbox/service/impl/InboxServiceImpl.java#L23-L41) |
| F6 | **Ratio uses built-in fallback operands when no data is sent** (it does not refuse) | A "passing" ratio run proves nothing about the user's data. The test must assert the values are *not* the fallback constants | [RatioRunCoordinatorImpl.java:225-249](intelligence-service/src/main/java/com/lextr/intelligence/ratio/coordinator/impl/RatioRunCoordinatorImpl.java#L225-L249) |
| F7 | **Dev mode always uses the reference host.** `import.meta.env.DEV` selects `referenceHost` (an in-memory client). The Lexie panel therefore never calls a backend under `npm run dev`, and under a prod build `resolve()` always clarifies | UI-01 cannot be tested end to end in any standalone mode | [main.tsx:13](intelligence-ui/src/main.tsx#L13), [referenceHost/index.ts:27-40](intelligence-ui/src/dev/referenceHost/index.ts#L27-L40) |
| F8 | **Capability gating in standalone mode.** The reference host grants only `training.view` and withholds `governance.audit.view`; the HTTP host grants none | Evidence Ledger is hidden in both standalone modes (test at API level). Training Data is visible only in dev, and its screen makes no API calls | [referenceHost/index.ts:42-53](intelligence-ui/src/dev/referenceHost/index.ts#L42-L53), [mountContract.ts:137-139](intelligence-ui/src/shell/mountContract.ts#L137-L139) |
| F9 | **The dev run fallback masks lexie-ai.** `lextr.run.local-fallback-enabled` defaults to `true` in the dev profile and returns a placeholder result when lexie-ai is down | Integration runs must set `LEXTR_RUN_LOCAL_FALLBACK=false`, or a missing lexie-ai looks like a pass | [application-dev.yaml:23-25](intelligence-service/src/main/resources/application-dev.yaml#L23-L25) |
| F10 | **`LEXIE_URL` default port mismatch** (8004 vs lexie-ai's 5003) | Set `LEXIE_URL=http://localhost:5003` | [application.yaml:14](intelligence-service/src/main/resources/application.yaml#L14), [lexie-ai/Dockerfile:39](lexie-ai/Dockerfile#L39) |
| F11 | **Seed data exists for presets:** envelope `ENV_VARIANCE_Y9C` (client `client_001`, status `approved`) and platform model rows | Use this envelope's id for preset-draft tests. The model registry has data but no read API | [V1__intelligence_schema_init.sql:609-653](intelligence-service/src/main/resources/db/migration/V1__intelligence_schema_init.sql#L609-L653) |

---

## 12. Analysis Limitations

- **Runtime configuration unavailable.** The deployed values of `VITE_INTELLIGENCE_API_BASE`, `VITE_GATEWAY_URL`, `INTELLIGENCE_SERVICE_URL`, `LEXIE_URL` and `ENV` are unknown. A deployment could set a base that includes a rewriting proxy, which would change the results for UI-01 and UI-02.
- **External gateway.** The Core gateway config was read from the sibling `lextr` repo (`config-service`) **[ext]**. The deployed gateway may differ. Any ingress, service mesh or CDN rules in front of the UI are not in the source.
- **Embedding host unknown.** When Core embeds the UI (`src/embed`), Core supplies its own `IntelligenceClient` and session. Its `resolve()`/`run()` endpoints are not in these repos, so Lexie-panel traffic under Core cannot be traced.
- **No runtime verification.** Casing findings F1–F2 are inferred from the `ObjectMapper` bean and a repo unit test, not from live requests. Some Spring MVC setups register a separate converter; none was found here.
- **External consumers.** Backend APIs marked "No UI consumer identified" may be called by Core services, scripts, the lexie-ai demo console, or third parties.
- **Generated OpenAPI not inspected.** The springdoc and FastAPI specs are produced at runtime; route inventories came from source annotations and decorators.
- **Dynamic URLs.** UI paths built from variables (`${BASE}${path}`, `API_BASE + AI_PREFIX + path`) were resolved by reading the literal call sites. Python routes were extracted by AST; Java routes by annotation parsing (multi-line annotations were checked by hand for the controllers listed).
- **Test-only code excluded.** `__tests__`, `*.test.*` and `src/test` were excluded from the consumer analysis.
- **Mock-only screens.** A screen that uses mock data was classified as having no API call. Its intended backend is inferred (a Possible match), not proven.

---

### Cross-check: every discovered API accounted for

| Classification | UI call sites | Java | Python |
|---|---:|---:|---:|
| Directly mapped | 16 | 10 | 6 |
| Possible match | 18 | 19 | 0 (the Python possibles in §9 are feature-level only) |
| No backend match | 6 | — | — |
| No UI consumer identified | — | 44 | 65 |
| Internal / non-UI API | — | 14 (OPA ops 057–059, preset resolve 063, run status 086, knowledge s2s 081/084, tenant ABAC 075, training executor callbacks 022–025, definitions sync 040, erasure reconciliation 002) | 1 (PYTHON-011 `/run`) |
| Unable to determine | 0 | 0 | 0 |
| **Total** | **40** | **87** | **72** |

---

## 13. Payload Compatibility Analysis (Request and Response)

This section compares **what the UI actually sends and reads** against **what the backend binds and returns**, field by field. It covers every UI call site, including those whose **path does not match**. For those, the nearest backend API is treated as a possible match and scored on payload fit alone.

### 13.1 Method and wire rules

| Rule | Effect | Evidence |
|---|---|---|
| **Java wire casing is snake_case** | Every Java DTO without an explicit `@JsonProperty` reads and writes `snake_case` keys (`clientId` ⇄ `client_id`). With `FAIL_ON_UNKNOWN_PROPERTIES=false`, a camelCase key is **silently ignored**: the field becomes `null`/`0`/`false`, or the server default from a compact constructor | [JacksonConfig.java:21-22](intelligence-service/src/main/java/com/lextr/intelligence/config/JacksonConfig.java#L21-L22), [RunCrossLayerWireThroughTest.java:131-143](intelligence-service/src/test/java/com/lextr/intelligence/contract/RunCrossLayerWireThroughTest.java#L131-L143) |
| `@RequestParam` / `@RequestHeader` / `@PathVariable` | Not affected by Jackson. Names must match literally (camelCase query params such as `subjectKind` and `datasetId` are fine) | Spring MVC binding |
| Java enums | Plain enums (anomaly, benchmark, forecast, ratio, radar) use the **constant name** (`BASELINE`). `RunStatus`, `OutputType` and the definition enums use `@JsonValue`/`@JsonProperty` **lowercase** values (`completed`, `narrative`, `operational`) | `RunStatus.java:24`, `OutputType.java:32`, `DefinitionStatus.java` |
| Java envelope | Most controllers return `ApiResponse{success, message, data}`. Analytics UC controllers (anomaly, benchmark, forecast, ratio, radar) return the **bare record**. `featureClient.unwrap` handles both | [ApiResponse.java](intelligence-service/src/main/java/com/lextr/intelligence/common/ApiResponse.java), [featureClient.ts:33-36](intelligence-ui/src/shell/featureClient.ts#L33-L36) |
| Python (FastAPI/Pydantic) | Field names are literal (snake_case). Unknown keys are ignored (`extra="ignore"` on the `/run` contract) | [lexie_ai/run/contract.py:24-33](lexie-ai/lexie_ai/run/contract.py#L24-L33) |

**Verdict legend.** ✅ Compatible as-is. ⚠️ Partially compatible (the call succeeds, but some fields are lost or defaulted). ❌ Incompatible (a 4xx, a refusal, or the UI cannot read the result).
**Payload Fit (0–100)** scores how close the two contracts are by field name, type and semantics, *if the path were routed*. It is independent of whether the path matches.

### 13.2 Summary: every UI call site

| UI API | Backend (path match?) | Request body / query | Headers | Response as read by UI | Verdict | Payload Fit |
|---|---|---|---|---|---|---:|
| UI-01 Ask Lexie `/run` | JAVA-085 (**path differs**) → PYTHON-011 | ❌ camelCase top level → `client_id` null → 400 `@NotBlank`. `input_payload` keys don't match any lexie-ai skill model | ✅ X-Client-Id (must equal body) | ❌ `useCase`/`runId` arrive as `use_case`/`run_id`; the dispatcher keys on `useCase` | ❌ | 55 |
| UI-02 Variance run | JAVA-085 (**path differs**) → PYTHON-011 UC1a | ❌ casing (400). `input_payload{report_type, level, cell, current_period, prior_period}` ≠ UC1a's required `cycle_id`, `mdrm_id` → `RUN_INPUT_INVALID` | ⚠️ no X-Client-Id; `X-Correlation-Id` sent | ❌ `varianceExplanation.drivers[{id, factor, impact_value…}]` ≠ `variance_explanation.drivers[{driver_name, contribution_pct…}]`. `confidenceScore`, `evidenceTrace` and `chartData` do not exist in `RunResult` | ❌ | 35 |
| UI-03 Variance rerun | JAVA-087 (path ✅) | ❌ 4/4 names match but camelCase → `client_id` null → 400 | ⚠️ no X-Client-Id | ⚠️ 5/5 names match `RerunResponse`; casing breaks the reads (`rerunRunId` vs `rerun_run_id`) | ❌ | 80 |
| UI-04 Semantic query | JAVA-070 (path ✅) → PYTHON-011 UC8 | ❌ structure differs: `query`, `intent`, `requester`, `*Ready` are top-level in the UI but belong in `input_payload`; `use_case` is missing; casing → 400. Downstream lexie-ai UC8 is `UnboundRoute` → refusal | ⚠️ none | ❌ UI expects `output` as an object and `outputVocab`; the server returns `AgentRunRecord` (`output` is a **String**, `output_type`, `evidence_trace_id`) | ❌ | 40 |
| UI-05 Anomaly | JAVA-031 (path ✅) | ⚠️ 100% name/type/enum parity, but camelCase → user inputs replaced by defaults (`FR_Y_9C`, `2026-Q2`, z=3.0, iqr=1.5), `client_id` null. **`series` never sent → always REFUSED** | ⚠️ X-Client-Id sent but not read by controller | ⚠️ 12/12 names and nested `AnomalyItem` 11/11 match; casing breaks the reads | ❌ | 70 |
| UI-06 Peer benchmark | JAVA-061 (path ✅) | ⚠️ same pattern; `cohortType` enum values identical. **`metrics` never sent → REFUSED** | ⚠️ | ⚠️ 13/13 + `MetricBenchmarkItem` 12/12 names match; casing | ❌ | 70 |
| UI-07 Forecast | JAVA-038 (path ✅) | ⚠️ same; `scenario` enum identical. **`metrics` never sent → REFUSED** | ⚠️ | ⚠️ 13/13 + `MetricForecast`/`ForecastPoint` match; casing | ❌ | 70 |
| UI-08 Ratio | JAVA-066 (path ✅) | ⚠️ `executedBy` matches by name (no `requester` field on this DTO). No compact-constructor defaults, so `report_id` and `period` are null. **`raw_schedule_data` is never sent, so the server computes from hard-coded fallback constants and returns ratios that look plausible but are not the user's data** | ⚠️ | ⚠️ 12/12 + `RatioItem`/`ReconciliationItem` match; casing | ❌ | 65 |
| UI-09 Supervisory radar | JAVA-072 (path ✅) | ⚠️ same; defaults requester `compliance_officer`. **`feed_items` never sent → REFUSED**; `severityFilter` never sent | ⚠️ | ⚠️ 12/12 + `ComplianceImpactItem` 10/10; casing | ❌ | 70 |
| UI-10 Inbox list | JAVA-054 (path ✅) | ✅ `surface` query | ✅ X-Client-Id, X-Actor-Id | ❌ 9/9 `InboxItemRow` names match, but served as `subject_id`… → `subjectId` undefined. **At runtime the list is always `[]`**: items come from an in-memory map only tests fill | ❌ | 85 |
| UI-11 Inbox decide | JAVA-055 (path ✅) | ✅ `subjectKind`, `capability`, `action`, `surface` are `@RequestParam`; `reason` optional, not sent | ✅ | ✅ response ignored | ⚠️ (params inherit `undefined` from UI-10) | 95 |
| UI-12 Evidence involvement | JAVA-005 (path ✅) | ✅ 4/4 query params (`anchorKind` is free text; server kinds: `REPORT_LINE, RULE, PRESET, DATASET, DEFINITION, REVIEW`) | ✅ X-Client-Id, X-User-Id, X-User-Functions | ✅ UI model is snake_case: `finding`, `runs[{run_id, role, review_decision}]`, `caveats[{day, state, signer, reference}]`; enums identical. `notes` is UI-only and optional | ✅ | 95 |
| UI-13 KH collections | PYTHON-047 (path ✅ via gateway) | ✅ — | ⚠️ `X-User-Id: a.kumar` hard-coded | ✅ stored, but **never rendered** (`corpusColumnDefs` unused) | ✅ | 95 |
| UI-14 KH documents | PYTHON-043 | ✅ | ⚠️ same | ✅ `documents[]`; grid fields `title, collection, status, classification, reporting_period, report, file_size_bytes, uploaded_at` all present | ✅ | 98 |
| UI-15 KH chat | PYTHON-049 | ✅ `ChatMessage{message, session_id, report, mdrm_id}` 4/4 | ⚠️ same | ✅ `session_id, answer, citations, insufficient_evidence` | ✅ | 98 |
| UI-16 KH chat reset | PYTHON-051 | ✅ path param | ⚠️ same | ✅ ignored | ✅ | 100 |
| UI-17 KH upload | PYTHON-042 | ✅ multipart `file` + 8/8 query params; `collection` and `classification` values are valid enum members | ⚠️ same | ✅ `status, error, reason_code, params` | ✅ | 98 |
| UI-18 KH text ingest | PYTHON-041 | ✅ 9/9 keys exist in `DocumentIngest` (`mdrm_affinity` as a list) | ⚠️ same (401 without X-User-Id) | ✅ `doc_id, chunks_written`; `note` not returned (UI falls back to `""`) | ✅ | 97 |
| UI-19…29 Training (dormant) | JAVA-009…027 (paths ✅) | ✅ freeze `{exam_dataset_id}`, eligibility `?datasetId&examDatasetId` literal | ✅ X-Client-Id, X-User-Id | ✅ UI types are snake_case and match field-for-field: `Dataset` 21/21, `Sample` 16/16, `Run` 18/18, `AnchorFreshness`, `RowOutcome`, eligibility `{eligible, reason_code, status}` | ✅ (not invoked) | 95 |
| UI-30…33 Skills (dormant) | JAVA-039/045/044/046 (paths ✅) | ✅ `@JsonProperty` DTOs: `target_status, rationale`; `decision, notes, rejection_reason, decision_id`; `labels, custom_tags`. Status and decision values are valid | ✅ X-Tenant-Id (precedence), X-User-Id | ✅ every UI `RegisteredDefinitionDto` field exists server-side | ✅ (not invoked; client defaults `client_001`/`admin_1`) | 95 |
| UI-34 Preset draft (dormant) | JAVA-062 (path ✅) | ❌ `envelope_id` is always null (`setEnvelopeId` never called) → `@NotNull` 400. `evidence_toggles{trend, anchor, recon}` ≠ `{trend_enabled, anchor_enabled, recon_enabled}` → dropped. The other 8 keys match | ⚠️ no X-Client-Id → server default `client_001` | ❌ UI reads `id`/`version`; server sends `preset_id`/`preset_version` → UI throws "Server returned no preset" | ❌ | 60 |
| UI-35 Preset lifecycle (dormant) | JAVA-065 (path ✅) | ✅ `{target_state: "OPERATIONAL"}` | ❌ required `X-Principal-Id` missing → 400 | ❌ same `id`/`version` issue | ❌ | 70 |
| UI-36 Preset get (dormant) | JAVA-064 (path ✅) | ✅ | ⚠️ | ❌ same `id`/`version` issue | ❌ | 70 |
| UI-37 Envelope approve | JAVA-065 (**path differs**) | ❌ no body (server needs `target_state`); path uses the string `preset_123` where the server expects `{id:Long}/versions/{version:Integer}` | ❌ no X-Principal-Id | ⚠️ reads `success`, `data.policy_code` (`ErrorDetail.policyCode` serialises as `policy_code` ✅) | ❌ | 20 |
| UI-38 Legacy run | JAVA-085 (**path differs**) | ❌ `{preset, part1, part3}` shares no field with `RunRequest` | ❌ none | ❌ reads top-level `output`, `confidence_score`, `evidence_trace`, `chart_data`; the server wraps in `data` and has no confidence/trace/chart | ❌ | 10 |
| UI-39 Legacy rerun | JAVA-087 (**path differs**) | ⚠️ `{analyst_input}` binds correctly (snake), but `client_id` is missing → 400 | ❌ | ❌ reads `output`/`part3` that `RerunResponse` doesn't have | ❌ | 30 |
| UI-40 Legacy skills | JAVA-039 (**path differs**) | ✅ — | ❌ none | ❌ reads `data.items`; the server returns `ApiResponse.data` as an array | ❌ | 25 |

**Totals (40 call sites):**
- ✅ **22** compatible: Knowledge Hub ×6, Evidence ×1, and the 15 dormant Training (11) and Skills (4) clients.
- ⚠️ **1** partial: Inbox decide.
- ❌ **17** incompatible: every run-contract call, all 5 analytics UCs, Inbox list, semantic, presets, and the legacy hooks.
- Of the **16 direct, path-matched** integrations, **8 are payload-compatible**: Knowledge Hub ×6, Evidence, and Inbox decide (inheriting the Inbox list bug). All **8 remaining Java direct matches fail on payload** (UI-03…10).

### 13.3 Field-level detail

#### A. Run contract: UI-01, UI-02, UI-38 → JAVA-085 `POST /run` → PYTHON-011 `POST /run`

Java forwards `RunRequest` unchanged to lexie-ai ([LexieAiClient.java:27-33](intelligence-service/src/main/java/com/lextr/intelligence/lexie/client/LexieAiClient.java#L27-L33)). The Java→Python leg is snake_case on both sides and **matches**.

| Field (Java wire) | Java `RunRequest` | lexie-ai `RunRequest` | UI-01 Lexie sends | UI-02 Variance sends | UI-38 legacy sends |
|---|---|---|---|---|---|
| `client_id` | `@NotBlank String` | `str, min_length=1` | `clientId` ❌ ignored → 400 | `clientId` ❌ (hard-coded `client-active-tenant`) | — ❌ |
| `use_case` | String | `str, min_length=1` | `useCase` ❌ | `useCase: "UC1a"` ❌ | — |
| `entry_point` | String | Optional | `entryPoint: "lexie"` ❌ | `entryPoint: "UI"` ❌ | — |
| `preset_key` | String | Optional | — | `presetKey` (optional) ❌ | `preset` ❌ |
| `input_payload` | `Map` | `Dict` | `inputPayload` ❌ | `inputPayload` ❌ | `part1`, `part3` ❌ |
| `correlation_id` | String | Optional | — | `correlationId` ❌ (header also sent) | — |
| `locale` | String | Optional | — | — | — |

**`input_payload` content vs what lexie-ai's skill for that use case requires** ([dispatcher.py:100-115,180-187](lexie-ai/lexie_ai/run/dispatcher.py#L100-L115)):

| Use case | lexie-ai requires | UI sends | Result |
|---|---|---|---|
| UC1a (Variance) | `cycle_id` (int), `mdrm_id`, optional `force`, `requester` | `report_type, level, cell, current_period, prior_period, backend_label` | ❌ `RUN_INPUT_INVALID (cycle_id, mdrm_id)`. `cell` carries an MDRM (`BHCK2170`), but under a different key. `cycle_id` must be resolved from report and period (e.g. via PYTHON-064 `/cycles/available`) |
| UC2 (Impact) | `ImpactQueryRequest`: `adjustment_node_id, adjustment_report, delta_amount`, … | `question, report_type, schedule?, mdrm?, period?, requester` | ❌ validation refusal |
| UC3 (Trend) | `TrendQueryRequest`: `node_id, report, periods[], values[]` | same as above | ❌ |
| UC8 / UC12 | `UnboundRoute("Lextr Core host")` | — | ❌ always refused in lexie-ai |
| LINEAGE / SWARM | not registered in the lexie-ai dispatcher | — | ❌ `RUN_USE_CASE_UNKNOWN` |

**Response** (`ApiResponse<RunResult>`):

| UI reads | Server sends | Match |
|---|---|---|
| `runId`, `clientId`, `useCase`, `status` | `run_id`, `client_id`, `use_case`, `status` (`completed`, `in_review`, …) | ❌ casing (`status` ✅) |
| `output.narrative`, `output.outputType` | `output.narrative`, `output.output_type` (`narrative`, `driver_breakdown`, …) | ⚠️ `narrative` ✅, type ❌ |
| `varianceExplanation.{cellIdentifier, pyramidRole, currentValue, priorValue, deltaAmount, deltaPct, driverCategory, drivers[{id, factor, driver, driverCategory, provenance, impact_value, impact_direction, explanation}]}` | `variance_explanation.{line_code, report_code, delta_pct, primary_driver, taxonomy_category, drivers[{driver_name, contribution_pct, category, driver_id, name, rank, reason, confidence, evidence_ids}], findings, …}` | ❌ only `deltaPct`↔`delta_pct` corresponds. The driver shapes are different models |
| `confidenceScore`, `evidenceTrace`, `chartData`, `systemDriverCount`, `rerunAudit` | not in `RunResult` | ❌ |
| `steps` | `steps[{step_id, step_order, tool_name, status, …}]` | ⚠️ name only |

#### B. Rerun: UI-03, UI-39 → JAVA-087 `POST /run/{runId}/rerun`

| Field | Java `RerunRequest` (wire) | UI-03 sends | UI-39 sends |
|---|---|---|---|
| `client_id` | `@NotBlank` | `clientId` ❌ → 400 | — ❌ → 400 |
| `analyst_input` | String | `analystInput` ❌ | `analyst_input` ✅ |
| `correlation_id` | String | `correlationId` ❌ | — |
| `input_payload_override` | Map | `inputPayloadOverride` ❌ | — |

Response `RerunResponse{rerun_run_id, parent_run_id, client_id, preset_changed, variance_explanation_stub}` vs UI `RerunApiResponse{rerunRunId, parentRunId, clientId, presetChanged, varianceExplanationStub}`: the names are identical and only the casing differs. UI-39 reads `output`/`part3`, which do not exist ❌.

#### C. Semantic query: UI-04 → JAVA-070 `POST /api/v1/semantic/query`

| UI sends (top level) | Where the server expects it | Result |
|---|---|---|
| `clientId` | `client_id` | ❌ casing → 400 |
| `query` | `input_payload.query` (not a `RunRequest` field) | ❌ dropped |
| `intent` (`R1_DEFINITION`…) | `input_payload.intent` ([SemanticRunCoordinatorImpl.java:69-70](intelligence-service/src/main/java/com/lextr/intelligence/semantic/coordinator/impl/SemanticRunCoordinatorImpl.java#L69-L70)) | ❌ dropped → preset resolved without intent |
| `presetKey`, `correlationId` | `preset_key`, `correlation_id` | ❌ casing |
| `requester`, `exposureReady`, `graphReady`, `businessReady` | no field | ❌ dropped |
| — | `use_case` (defaults task to `semantic_query`) | ⚠️ |

Response: UI `SemanticQueryResponse{runId, clientId, status, useCase, intent, outputVocab, output{narrative, composedDefinitionTxt, elementVersion, dependencies, lineageFormula, dataset, options, routeOut}, confidenceScore, evidenceTrace, correlationId}` vs server `AgentRunRecord{run_id, client_id, status, use_case, intent, output: String, output_type, confidence_score, evidence_trace_id, correlation_id, …36 fields}`. **`output` is a serialised string, not an object**, so every structured panel in `SemanticWorkspace` (route-out, definition, element version, dependencies) renders nothing. Downstream, lexie-ai has no UC8 route ❌.

#### D. Analytics UCs: UI-05…09 (parity is exact, apart from casing and missing data)

| Endpoint | UI sends | DTO fields the UI never sends | Server behaviour today | After a casing fix only |
|---|---|---|---|---|
| Anomaly | `clientId, requester, roles, reportId, period, zThreshold, iqrMultiplier` | **`series: List<MetricSeries{metricName, dataPoints[{label, value}]}>`** | camelCase ignored → defaults; `client_id` null goes into OPA input → REFUSED ("Insufficient data points", [AnomalyRunCoordinatorImpl.java:77-90](intelligence-service/src/main/java/com/lextr/intelligence/anomaly/coordinator/impl/AnomalyRunCoordinatorImpl.java#L77-L90)) | still REFUSED: no series |
| Peer benchmark | `clientId, requester, roles, reportId, period, cohortType` | **`metrics: List<PeerMetricDistribution{metricName, subjectValue, peerValues[]}>`** (≥4 peers) | REFUSED ([PeerBenchmarkCoordinatorImpl.java:81-91](intelligence-service/src/main/java/com/lextr/intelligence/benchmark/coordinator/impl/PeerBenchmarkCoordinatorImpl.java#L81-L91)) | still REFUSED |
| Forecast | `clientId, requester, roles, reportId, basePeriod, horizonQuarters, scenario` | **`metrics: List<MetricHistorySeries{metricName, history[{period, value}]}>`** (≥2) | REFUSED ([ForecastRunCoordinatorImpl.java:88-98](intelligence-service/src/main/java/com/lextr/intelligence/forecast/coordinator/impl/ForecastRunCoordinatorImpl.java#L88-L98)) | still REFUSED |
| Ratio | `clientId, reportId, period, executedBy, roles` | **`rawScheduleData: Map<String,Double>`**, `ratiosToCompute`, `reconciliationsToEvaluate`, `toleranceBps` | **Not refused.** Each formula falls back to built-in constants (`tier1_capital`=15,000,000, `total_rwa`=120,000,000, …; [RatioRunCoordinatorImpl.java:225-249](intelligence-service/src/main/java/com/lextr/intelligence/ratio/coordinator/impl/RatioRunCoordinatorImpl.java#L225-L249)), so the result is BALANCED/compliant from fixture numbers. `report_id`/`period` null | still fixture numbers; `raw_schedule_data` keys are `tier1_capital, total_rwa, cet1_capital, total_leverage_exposure, net_interest_income, average_earning_assets, non_interest_expense, total_revenue` (or MDRM `BHDM8274, BHDMA223, BHDMP859, BHDM7204`) |
| Supervisory radar | `clientId, requester, roles, reportId, period` | **`feedItems: List<RegulatoryFeedItem>`**, `severityFilter` | REFUSED ("No regulatory feed items", [SupervisoryRadarCoordinatorImpl.java:80-89](intelligence-service/src/main/java/com/lextr/intelligence/supervisory/coordinator/impl/SupervisoryRadarCoordinatorImpl.java#L80-L89)) | still REFUSED |

These endpoints **compute from data carried in the request body**; they do not fetch report data themselves. The UI workspaces only collect report, period and parameters (e.g. [AnomalyWorkspace.tsx:28](intelligence-ui/src/features/anomaly/components/AnomalyWorkspace.tsx#L28)). Either the UI (or a host) must supply the series, or the coordinators need a data-loading step. Response DTOs and enums (`AnomalyRunStatus`, `BenchmarkStatus`, `QuartileTier`, `ForecastStatus`, `RadarStatus`, `ImpactSeverity`, `ComplianceUrgency`, `PeerCohortType`, `MacroScenario`) match the UI types name-for-name and value-for-value. **The only response defect is casing.**

#### E. Presets: UI-34…37 → JAVA-062/064/065

| Draft field (wire) | Java `CreatePresetDraftRequest` | UI sends | Match |
|---|---|---|---|
| `preset_key`, `task`, `report_type` | `@NotBlank`, `@NotBlank`, optional | ✅ | ✅ |
| `envelope_id` | `@NotNull Long` | `envelope.envelopeId ?? null` (never set) | ❌ 400 |
| `external_eligible`, `max_steps` (8), `kg_depth_default` (1), `kg_depth_max` (3) | bool, `@Min1 @Max8`, `@Min1`, `@Min1 @Max5` | ✅ within bounds | ✅ |
| `cost_guardrails.max_tokens` | `CostGuardrailsDto.maxTokens` | ✅ | ✅ |
| `evidence_toggles` | `{trend_enabled, anchor_enabled, recon_enabled}` | `{trend, anchor, recon}` | ❌ silently false |
| `prompt_template_id, model_instruction, output_type, review_level, style, skill_pattern` | optional | — | ⚠️ server defaults |

Response `PresetDto{preset_id, preset_version, status, preset_key, …}` vs UI `PresetDto{id, version, status, preset_key}`: `id`/`version` never populate ❌.

### 13.4 Payload-level fix list (smallest change first)

| # | Fix | Resolves | Where |
|---|---|---|---|
| P1 | Either send snake_case from the UI's Java clients (`featureClient`, `variance/api.ts`, `semantic/api.ts`) **or** accept camelCase at the service. Note that a global change would also move the snake_case contract the Java→Python leg and the training/evidence/skills UIs rely on, so a per-controller or per-DTO `@JsonNaming(LowerCamelCase)` is safer | UI-03, 05–10 (casing), part of UI-01/02/04 | [featureClient.ts](intelligence-ui/src/shell/featureClient.ts), [JacksonConfig.java](intelligence-service/src/main/java/com/lextr/intelligence/config/JacksonConfig.java) |
| P2 | Map the variance form to UC1a's contract: `mdrm_id ← cell`, and `cycle_id` resolved from report and period (PYTHON-064) | UI-02 | [VarianceWorkspace.tsx:63-76](intelligence-ui/src/features/variance/components/VarianceWorkspace.tsx#L63-L76) |
| P3 | Nest semantic fields into `input_payload` and send `use_case: "UC8"`; parse `AgentRunRecord.output` (a JSON string); bind UC8 in lexie-ai | UI-04 | [semantic/api.ts:23-33](intelligence-ui/src/features/semantic/api.ts#L23-L33) |
| P4 | Supply the data arrays (`series`, `metrics`, `raw_schedule_data`, `feed_items`), or add a server-side loader keyed on report and period | UI-05…09 | coordinators in `intelligence-service/.../{anomaly,benchmark,forecast,ratio,supervisory}` |
| P5 | Rename the draft toggles to `*_enabled`, set `envelope_id`, send `X-Principal-Id`, read `preset_id`/`preset_version` | UI-34…36 | [usePresetLifecycle.ts](intelligence-ui/src/hooks/usePresetLifecycle.ts), [presetApi.ts](intelligence-ui/src/api/presetApi.ts) |
| P6 | Map the variance result view to `VarianceExplanation`/`DriverBreakdown` (or add an adapter) | UI-02 response | [VarianceResult.tsx:81-106](intelligence-ui/src/features/variance/components/VarianceResult.tsx#L81-L106) |
| P7 | Delete or replace the legacy hooks and envelope-approve (no backend contract fits) | UI-37…40 | `src/hooks/*` |

---

## 14. Candidates for Missing UI Integrations (code-level search of both backends)

§8 and §13 list what the UI calls or needs that currently has no working API. For each of those needs, this section searched **both backends' code, beyond their controllers**: services, coordinators, DAOs, skills and SQL. Each need is classified as:

- **Endpoint exists.** An HTTP API already serves the need; only wiring or payload fixes are required.
- **Code only.** The capability is implemented in a service, DAO or skill but **no endpoint exposes it**. Closing the gap needs one thin controller or route.
- **True gap.** Neither backend has an endpoint or the code.

Confidence uses the §7 scale. Scores for "code only" rate how well the implemented code fits the UI contract, not whether it is reachable.

### 14.1 How the search was done

| Step | Method |
|---|---|
| Java service code with no endpoint | Listed every public method on `*Service`/`*Dao`/`*Coordinator` interfaces, removed the ones called from any controller, then checked each remainder for indirect callers (coordinator → service) |
| Python code with no route | Keyword and AST search across `lexie_ai/`, `skills/`, `service/`, `routes/` for the capability (multi-hop, merkle, drop profile, footnote, intent/resolve, history/series), then checked whether a router or `/run` dispatcher route reaches it |
| Contract fit | Compared UI callback signatures and types (`features/*/types.ts`, workspace props) with Java record components and Pydantic fields |

Java services with **no path to any endpoint** (not even indirectly):

| Java code | Methods | Reached by an endpoint? |
|---|---|---|
| [MerkleTreeService.java](intelligence-service/src/main/java/com/lextr/intelligence/merkle/service/MerkleTreeService.java) | `buildAndPersistTree, generateProof, verifyProof, getTree, getTreeNodes, sealTree` | ❌ only used by `Au9ExportServiceImpl`, which is itself unexposed |
| [Au9ExportService.java](intelligence-service/src/main/java/com/lextr/intelligence/export/service/Au9ExportService.java) | `assembleExportBundle(clientId, runId, classification…), getExportBundle, verifyExportBundle` | ❌ |
| [MultiHopCoordinator.java](intelligence-service/src/main/java/com/lextr/intelligence/multihop/coordinator/MultiHopCoordinator.java) | `coordinateMultiHopRun(MultiHopRunRequest)` | ❌ |
| [DropProfileService.java](intelligence-service/src/main/java/com/lextr/intelligence/drops/DropProfileService.java) | `createProfile, getProfileByFamily, getLatestVersion, recordRuling, getRulings, declareDocumentDrop, …` (11) | ❌ |
| [ChunkReferenceService.java](intelligence-service/src/main/java/com/lextr/intelligence/footnote/ChunkReferenceService.java) | `getNotesForChunk(s), getUnresolvedMarkers, registerEdge(s), recordUnresolvedMarker` | ❌ |
| [HsmKeyManager.java](intelligence-service/src/main/java/com/lextr/intelligence/hsm/service/HsmKeyManager.java) | `listKeys(), getKey, provisionKey, rotateKey, getSlots` | ⚠️ `rotateKey` is reachable via `/api/v1/hsm/operations` `ROTATE_KEY`; **`listKeys` is not reachable** |
| [PopulationReconciliationService.java](intelligence-service/src/main/java/com/lextr/intelligence/reconciliation/PopulationReconciliationService.java) | `reconcilePopulation, getReconciliation, attestSubmission` | ❌ |
| [EmbeddingChunkService.java](intelligence-service/src/main/java/com/lextr/intelligence/chunking/service/EmbeddingChunkService.java) | `knnSearch, persistChunkWithSources, sourceElements` | ❌ |
| [AgentRunDao.java](intelligence-service/src/main/java/com/lextr/intelligence/persistence/dao/AgentRunDao.java) | `findByClientIdAndStatus`, `findReviewEvents`, `findStepsByRunId` (no run list or search endpoint) | ❌ (only `GET /run/{runId}`) |
| `ReviewQueueService` | `enqueue` (used by coordinators), **`submitReview`** | ⚠️ enqueue is internal; there is no reviewer endpoint |
| `intelligence.model_registry` table | only `UPDATE … set_trained_on` ([queries.properties:1347](intelligence-service/src/main/resources/queries.properties#L1347)) | ❌ no read query or DAO |

Python code with **no route**:

| lexie-ai code | What it does | Reached? |
|---|---|---|
| [skills/multihop_dispatcher.py](lexie-ai/skills/multihop_dispatcher.py) `MultiHopDispatcher.dispatch_chain(MultiHopRequest)` | Multi-skill hop chain with a hop budget | ❌ not in any router or the `/run` dispatcher |
| [skills/semantic_query_skill.py](lexie-ai/skills/semantic_query_skill.py) `SemanticQuerySkill` (incl. `classify_intent`, L212) | UC8 semantic answer and intent classifier | ❌ the `/run` dispatcher binds UC8 to `UnboundRoute` ([dispatcher.py:114](lexie-ai/lexie_ai/run/dispatcher.py#L114)) |
| [service/variance/detection/repositories.py](lexie-ai/service/variance/detection/repositories.py) `fetch_history` (L160), `fetch_values` (L212) | Trailing filed values per MDRM line (default 8 quarters); all values for a period | ⚠️ used internally by the variance orchestrator; no route returns a series |
| [lexie_ai/services/drops/drop_profile_proposer.py](lexie-ai/lexie_ai/services/drops/drop_profile_proposer.py) `DropProfileProposer` → `SmeQuestion` | Proposes drop profiles and SME questions | ❌ |
| [lexie_ai/services/chunking/footnote_associator.py](lexie-ai/lexie_ai/services/chunking/footnote_associator.py) | Associates footnotes with chunks during parsing | ⚠️ internal to ingestion |

### 14.2 Unmatched UI calls → candidates

| UI need | Candidate | Backend | Kind | Contract fit | Confidence |
|---|---|---|---|---|---:|
| UI-01/02 `POST /api/v1/intelligence/run` | JAVA-085 `POST /run` | Java | Endpoint exists | Same `RunRequest` fields (casing aside; §13-A) | 60 |
| UI-01/02 (alternative) | PYTHON-011 `POST /run` via gateway `/lexie/ai/run` | Python | Endpoint exists | The snake_case `RunRequest` is the same contract the UI shape targets. ⚠️ Going direct **skips intelligence-service's OPA, preset resolution, persistence and review queue**, so it is not a recommended path | 40 |
| UI-38 legacy `/api/intelligence/run` | JAVA-085 | Java | Endpoint exists | `{preset, part1, part3}` has no overlap | 30 |
| UI-39 legacy rerun | JAVA-087 `POST /run/{id}/rerun` | Java | Endpoint exists | `analyst_input` binds; `client_id` missing | 40 |
| UI-39 / UI-03 "re-run with analyst input" (UC1a only) | PYTHON-070 `POST /api/v1/variance/cycles/{cycle_id}/regenerate/{mdrm_id}?guidance=` | Python | Endpoint exists | Same intent: regenerate a line's explanation with analyst guidance. Keys differ (`guidance` query vs `analyst_input`; `cycle_id`/`mdrm_id` vs `parentRunId`) | 50 |
| UI-37 envelope approve | JAVA-065 `…/lifecycle` (the MRM approval gate runs inside activation, [PresetServiceImpl.java:96-102](intelligence-service/src/main/java/com/lextr/intelligence/preset/service/impl/PresetServiceImpl.java#L96-L102)) | Java | Endpoint exists (different semantics) | No separate "approve envelope" action exists in code. Envelope approval is only *checked*, never *recorded*, by this service | 40 |
| UI-40 `GET /api/intelligence/skills` | JAVA-039 `GET /api/v1/governance/definitions?kind=skill` | Java | Endpoint exists | Filtering by `kind=skill` gives exactly the skill list. The response is `ApiResponse.data[]`, not `{items}` | 60 |
| Lexie `resolve(question)` (httpHost says "no resolver endpoint") | `SemanticQuerySkill.classify_intent` | Python | Code only | Classifies **UC8 intents only** (R1–R4, B1, B7). It does not pick a use case across UC1–UC12 | 25 |
| (same) | JAVA-063 `GET /api/v1/presets/resolve` | Java | Endpoint exists | Resolves a *preset* from task and report. It does not resolve a question to a use case | 15 |
| (same) | PYTHON-003 `POST /api/v1/chatbot/ai/query` | Python | Endpoint exists | A rules-authoring agent that streams NDJSON. Not a resolver | 10 |
| **Result for the resolver** | — | — | **True gap** | No component in either backend maps a free-text question to `{useCase, entities}` | — |

### 14.3 Missing inputs for calls that do route (the §13 "never sent" data)

| UI need | Candidate | Backend | Kind | Fit | Confidence |
|---|---|---|---|---|---:|
| UC1a `cycle_id` (variance run) | PYTHON-064 `GET /api/v1/variance/cycles/available?report=&legal_entity=` → then PYTHON-031 `GET /cycles` / PYTHON-066 `POST /cycles` | Python | Endpoint exists | The UI has report and periods and needs a cycle id. `mdrm_id` = UI `cell` | 70 |
| Anomaly `series` (≥3 points per metric) | PYTHON-067 `POST /cycles/{id}/detect` → `items[{mdrm_id, current_value, previous_value, pct_variance, zscore_8q, tier}]` | Python | Endpoint exists | Already computes an **8-quarter z-score per line** from filed data. This is an overlapping anomaly capability, not a series feed | 55 |
| Anomaly `series` / Forecast `metrics[].history` | `repositories.fetch_history(report_nm, taxonomy_id, restatement_version, before_period, limit=8)` | Python | Code only | Returns `[{period, value}]` per line, exactly the `DataPoint{label,value}` / `HistoricalDataPoint{period,value}` shape | 65 |
| Ratio `raw_schedule_data` | `repositories.fetch_values(period, report_nm, restatement_version…)` | Python | Code only | All filed values for a period, keyed by line, which can map into `Map<String,Double>` | 55 |
| Peer benchmark `metrics[].peer_values` (≥4 peers) | Knowledge collection `peer_filings` (PYTHON-048 search) | Python | Endpoint exists (weak) | Document chunks, not numeric peer values | 20 |
| **Peer data** | — | — | **True gap** | No peer numeric data source in either backend | — |
| Supervisory `feed_items` | Knowledge collections `reporting_instructions` / `market_news` (PYTHON-043/048) | Python | Endpoint exists (weak) | Documents, not `RegulatoryFeedItem{regulatoryBody, alertType, publicationDate, affectedSchedules}` | 20 |
| **Regulatory feed** | — | — | **True gap** | No regulatory feed ingestion in either backend | — |
| Semantic UC8 execution | `SemanticQuerySkill` | Python | Code only | The skill exists; only the `/run` dispatcher binding is missing (`"UC8": UnboundRoute`) | 60 |

### 14.4 Mock-data and unmounted screens → candidates

| UI screen (need) | Candidate | Backend | Kind | Contract fit | Confidence |
|---|---|---|---|---|---:|
| **Export** `onGenerateBundle(clientId, runId, classification)` → `ExportBundle` | `Au9ExportService.assembleExportBundle(clientId, runId, classification…)` + `getExportBundle` | Java | Code only | **Exact**: `ExportBundle` 11/11 field names match `Au9ExportBundle`, and `RecipientClassification` has 7/7 identical enum values | 80 |
| (same, endpoint alternative) | JAVA-003 `POST /api/intelligence/evidence/export` | Java | Endpoint exists | Anchor-based evidence zip, not a run-scoped AU9 bundle | 40 |
| **HSM** `initialKeys: HsmKeyHandle[]` (the declared blocker) | `HsmKeyManager.listKeys()` | Java | Code only | **Exact**: `HsmKeyHandle` 10/10 names match | 80 |
| HSM `initialStatus`, `onRotateKey`, `onVerifyOffline` | JAVA-052 `GET /hsm/status`; JAVA-051 `POST /hsm/operations {operation: ROTATE_KEY \| VERIFY_DIGITAL_SEAL}` | Java | Endpoint exists | `HsmApplianceStatus` served; the operations switch supports both actions ([HsmSigningCoordinatorImpl.java:86-124](intelligence-service/src/main/java/com/lextr/intelligence/hsm/coordinator/impl/HsmSigningCoordinatorImpl.java#L86-L124)) | 75 |
| **Merkle** `initialTree/Nodes/Proof`, `onSealTree(treeId)`, `onVerifyProof(treeId, leafHash)` (declared "no endpoint") | `MerkleTreeService.getTree / getTreeNodes / sealTree / generateProof + verifyProof` | Java | Code only | Tree record 8/8 and node 9/9 names match. Proof differs: UI `targetLeafHash, leafIndex, steps[{level, position, siblingHash}], isValid` vs Java `targetHash, proofSteps[{siblingHash, isLeftSibling}], isVerified` | 70 |
| (Python alternative) | PYTHON-016/017 `notarize` / `verify` cycle | Python | Endpoint exists | Hash-chain notarization of variance audit packs, not a Merkle proof | 25 |
| **Multi-hop** `onDispatchRun(startingSkill, routeSequence, intent)` → `MultiHopRunResponse` (declared "route endpoint does not exist") | `MultiHopCoordinator.coordinateMultiHopRun(MultiHopRunRequest{clientId, initialIntent, startingSkill, targetRouteSequence, initialPayload, maxHops, executedBy, roles})` | Java | Code only | **Exact**: callback args map 3/3, and `MultiHopRunResponse` 10/10 names match | 80 |
| (Python alternative) | `MultiHopDispatcher.dispatch_chain(MultiHopRequest{client_id, initial_intent, starting_skill, target_route_sequence, …})` | Python | Code only | Same request fields; the result shape differs (`hop_count`, `hop_nodes`) | 55 |
| **DropProfile SME ruling** `onRuleQuestion(questionId, ruling KEEP\|DROP, reason)` | `DropProfileService.recordRuling(profileVersionId, clientId, questionId, ruling, reason, author)` + `getRulings` | Java | Code only | Args map 3/3; the server also needs `profileVersionId` | 75 |
| (question source) | `DropProfileProposer` → `SmeQuestion` | Python | Code only | Produces the questions the view asks | 55 |
| **Document footnotes** `passages[].footnotes: FootnoteItem[]` | `ChunkReferenceService.getNotesForChunks(clientId, chunkIds)` → `ChunkFootnote` | Java | Code only | 7/7 fields (`note_chunk_id, note_content, marker, scope, method, hop, text_source`). Java uses `@JsonProperty` snake_case; the UI type is camelCase | 70 |
| **Document assurance** `AssuranceTab` | JAVA-032 `GET /api/v1/assurance/documents/{id}/status` (+ `DocumentAssuranceDao.findLatestRun`) | Java | Endpoint exists | Assurance items (anchor match, grounded) | 55 |
| **Document provenance** `DocumentViewerProvenance` | PYTHON-044 `GET /knowledge/documents/{doc_id}` · JAVA-080 `GET /knowledge/documents/{id}` | Python / Java | Endpoint exists | Document header and chunks | 45 |
| **AI Risk & Controls** review queue (items: title, use case, confidence) | `AgentRunDao.findByClientIdAndStatus(clientId, IN_REVIEW)` + `ReviewQueueService.submitReview` | Java | Code only | `AgentRunRecord` has `use_case, confidence_score, review_level, status`. No list or review endpoint | 60 |
| (same) | PYTHON-055 `GET /api/v1/variance/review/queue` + PYTHON-061 `POST /analyses/{id}/review` | Python | Endpoint exists | Variance analyses only (UC1), not cross-UC | 40 |
| (same) | JAVA-054 `GET /api/v1/inbox` | Java | Endpoint exists | Pending approvals, not AI output review | 35 |
| **Audit & Evidence timeline** `{trace, module, action, actor, outcome}` | JAVA-048 `POST /api/v1/governance/estate-ledger/read` → `EstateLedgerEntry{event_id, run_id, event_type, subject_kind, capability, action, actor, …}` | Java | Endpoint exists | `trace←event_id/run_id`, `module←subject_kind/capability`, `action←action`, `actor←actor`. `outcome` is derivable from `event_type` | 65 |
| **Row history drawers** (`RowHistoryButton`) | JAVA-050 `GET /estate-ledger/subject/{subjectId}` | Java | Endpoint exists | Per-subject ledger | 60 |
| **Runtime Policies** `{name, id, category, scope, status, pkg, version}` | JAVA-057 `GET /api/v1/opa/policies` | Java | Endpoint exists | Returns loaded Rego packages (`pkg` ✅). Name, category, status and version are not modelled server-side | 45 |
| **Role Mapping** `{role, domain, caps[]}` | `TenantDao.findMembershipsByTenant` → `TenantMembership{userId, assignedRole}`; JAVA-078 `GET /tenants/{id}/abac/bindings` | Java | Code only / endpoint | Role assignments exist, but there is no role→capability catalogue | 35 |
| **Model Registry** `{name, type, jurisdiction, mrm, status}` | Table `intelligence.model_registry` (V1, V33) | Java | **Data only**: no read DAO or endpoint | Only an UPDATE query exists | 40 |
| (same) | JAVA-018 `GET /training/lineage/models/{modelId}` | Java | Endpoint exists | Per-model lineage, not a listing | 30 |
| (same) | PYTHON-022 `GET /api/v1/variance/model-config` | Python | Endpoint exists | Variance model settings (provider and model per setting), not an MRM registry | 30 |
| **Presets inventory** (list) | JAVA-064 `GET /presets/{id}/versions/{v}` (single), JAVA-063 `/resolve` (single) | Java | Endpoint exists (single only) | `PresetDao` has **no list method** (`findByIdAndVersion, findOperationalByAxis, insertDraft, updateStatus`) | 30 |
| **Presets list** | — | — | **True gap** | No list query in either backend | — |
| **Streaming / TDM / Resilience / Tenant** | JAVA-071 / JAVA-069 / JAVA-067-068 / JAVA-074-078 | Java | Endpoint exists | As in §9 | 25–55 |

### 14.5 Summary

| Kind | Needs | Items |
|---|---:|---|
| **Endpoint exists; wire it (plus the §13 payload fixes)** | 11 | run/rerun (JAVA-085/087), skills via `?kind=skill`, UC1a cycle lookup (PYTHON-064), HSM status/rotate/verify, assurance, audit timeline (JAVA-048), row history (JAVA-050), policies (JAVA-057), document detail (PYTHON-044), variance review (PYTHON-055/061), analyst-guided regenerate (PYTHON-070) |
| **Code only; needs one endpoint** | 9 | AU9 export bundle, HSM key list, Merkle tree/proof, multi-hop (Java and Python), DropProfile rulings (+ lexie-ai question proposer), footnotes, cross-UC review queue (`AgentRunDao` + `submitReview`), line history/values for anomaly/forecast/ratio (`fetch_history`/`fetch_values`), UC8 dispatcher binding |
| **True gap (nothing in either backend)** | 5 | question→use-case resolver for Lexie, preset listing, model registry read, peer cohort data, regulatory feed |

**Highest-value closes (exact contract already in code):**
1. Multi-hop (`MultiHopCoordinator`), 80.
2. Export (`Au9ExportService`), 80.
3. HSM key list (`HsmKeyManager.listKeys`), 80.
4. DropProfile ruling (`DropProfileService.recordRuling`), 75.

Each needs only a controller method, and each would let a slice currently in `declaredUnmounted.ts` be mounted.

---

## 15. Integration Test Plan

**Goal:** confirm every mapping in §3–§14 against running services. Each test states the request **exactly as the UI sends it today** and, where they differ, the **corrected wire payload** the backend accepts. That way the same test first confirms a defect and later verifies its fix.

### 15.1 Phases

| Phase | Purpose | Expected today | Exit criterion |
|---|---|---|---|
| **P0 Smoke** | Services up, dependencies wired, route counts match §5/§6 | PASS | All P0 pass |
| **P1 Green-path contracts** | Integrations predicted compatible (§13 ✅) | PASS | All P1 pass. Any failure means §13 was wrong: log it |
| **P2 Defect confirmation** | Integrations predicted incompatible (§13 ❌). Run the "UI-as-is" request (expect FAIL), then the "corrected" request (expect PASS) | as-is: FAIL · corrected: PASS | Every defect reproduced. After fixes P1–P7 (§13.4), the as-is request passes |
| **P3 Service-to-service** | Java→Python `/run` contract | PASS | All P3 pass |
| **P4 UI end to end** | Browser flows on reachable screens | See per-test | Recorded in §16 |
| **P5 Blocked** | Code-only and gap items (§14) | Not runnable | Unblocked when the endpoint exists |

### 15.2 Environment

| Component | Port | Start | Required settings |
|---|---:|---|---|
| PostgreSQL | 5433 | local instance, DB `lextr` | Flyway runs the intelligence-service migrations (V1…) at startup. lexie-ai schema: `python scripts/run_variance_migrations.py` |
| OPA | 8181 | `intelligence-service/scripts/opa-docker.sh start` | then `POST /api/v1/opa/refresh` (P0-04) |
| Core config-service | 8888 | Core repo **[ext]** | lexie-ai reads `backend-service/dev` from it ([config/config.py:8-21](lexie-ai/config/config.py#L8-L21)), unless DB env vars are set |
| **lexie-ai** | 5003 | `cd lexie-ai && uvicorn app:app --port 5003` | `ENV=dev`. Seed evidence: `python scripts/seed_variance_evidence.py` |
| **intelligence-service** | 8059 | `cd intelligence-service && mvn spring-boot:run` | `SPRING_PROFILES_ACTIVE=dev`, **`LEXIE_URL=http://localhost:5003`** (F10), **`LEXTR_RUN_LOCAL_FALLBACK=false`** (F9), `OPA_URL=http://localhost:8181`, `DB_URL`/`DB_USERNAME`/`DB_PASSWORD` |
| Core gateway | `$GW` (UI default `http://localhost:8080`) | Core repo **[ext]** | Route `/lexie/ai/**` → `http://localhost:5003`, already in gateway-service-dev.yml **[ext]** |
| **intelligence-ui** | Vite default | `cd intelligence-ui && npm run dev` → `/intelligence/` | `INTELLIGENCE_SERVICE_URL=http://localhost:8059`, `VITE_GATEWAY_URL=$GW`, `VITE_LEXTR_CLIENT_ID=client_001`, `VITE_LEXTR_PRINCIPAL=analyst_1` |

Shell variables used below:

```bash
export IS=http://localhost:8059   LX=http://localhost:5003   GW=http://localhost:8080
export CID=client_001             UID=analyst_1               UID2=validator_1
H_JSON='-H Content-Type:application/json'
```

### 15.3 Test data prerequisites

| ID | Data | How to create | Used by |
|---|---|---|---|
| D1 | OPA policies loaded | `curl -XPOST $IS/api/v1/opa/refresh` | all Java tests |
| D2 | A variance cycle (report FRY9C) | `curl -XPOST "$LX/api/v1/variance/cycles" $H_JSON -H "X-User-Id:$UID" -d '{"report":"FRY9C","period":"20260630","legal_entity":"<LE>"}'` → note `cycle_id`. Use `GET $LX/api/v1/variance/entities` for `<LE>`. Or use `POST $LX/api/v1/demo/generate-period?target=…&source=…` (dev only) | P2-01, P3-01/02 |
| D3 | A flagged MDRM line in D2 | `curl -XPOST "$LX/api/v1/variance/cycles/<cycle_id>/detect" $H_JSON -H "X-User-Id:$UID" -d '{}'` → pick an `items[].mdrm_id` | P2-01, P3-01/02 |
| D4 | Envelope id | `SELECT id FROM intelligence.governance_envelope WHERE client_id='client_001' AND envelope_key='ENV_VARIANCE_Y9C';` (seeded, F11) | P2-11 |
| D5 | A skill definition | P1-20 (sync) | P1-21…24 |
| D6 | A training dataset | P1-13 (create) | P1-14…19 |
| D7 | Evidence rows | produced by any successful run (P3-02) | P1-12 |
| D8 | An inbox item | **Cannot be created through the API (F5).** Use a known `subjectId` from a unit-test style registration, or treat P1-11 as a parameter-binding test only | P1-10/11 |

### 15.4 Test cases

`→` means the expected result today. A "✅ when" column names the fix (§13.4) that turns an expected FAIL into a PASS.

#### P0: Smoke

| Test | Request | Expected | Maps to |
|---|---|---|---|
| P0-01 | `curl $IS/actuator/health` | `UP`, including `db`, `opa`, `lexie` components | intelligence-service readiness group |
| P0-02 | `curl $LX/api/v1/chatbot/ai/health` | 200 | PYTHON-001 |
| P0-03 | `curl $LX/api/v1/variance/status` | 200, lists any degradations (should be none) | PYTHON-072 |
| P0-04 | `curl -XPOST $IS/api/v1/opa/refresh` | `success:true` | JAVA-058 |
| P0-05 | `curl -H "X-User-Id:$UID" $GW/lexie/ai/api/v1/chatbot/ai/health` | 200 (proves the gateway rewrite) | gateway **[ext]** |
| P0-06 | `curl $IS/v3/api-docs \| jq '.paths\|keys\|length'` and `curl $LX/openapi.json \| jq '.paths\|keys\|length'` | Path counts consistent with §5 (87 operations) and §6 (72). Differences mean the inventory drifted | §5, §6 |
| P0-07 | Stop lexie-ai, then `POST $IS/run` (P3-02 body) | A **failure**, not a placeholder result (proves F9 is off) | JAVA-085 |

#### P1: Green-path contracts (expected PASS)

| Test | UI call | Request | Expected response (assert) | Maps to |
|---|---|---|---|---|
| P1-01 | UI-13 | `curl -H "X-User-Id:$UID" $GW/lexie/ai/api/v1/variance/knowledge/collections` | 200 `{total_chunks, total_documents, collections[], available_collections[]}` | PYTHON-047 |
| P1-02 | UI-18 | `curl -XPOST $GW/lexie/ai/api/v1/variance/knowledge/documents $H_JSON -H "X-User-Id:$UID" -d '{"title":"IT memo","content":"Internal note on HC-C loan growth drivers.","collection":"internal_metadata","report":"FRY9C","mdrm_affinity":["BHCK2170"],"classification":"INTERNAL"}'` | 201 `{doc_id, status:"INDEXED", chunks_written>0}` | PYTHON-041 |
| P1-03 | UI-18 (negative) | same as P1-02 **without** `X-User-Id` | 401 (curation must be attributable) | PYTHON-041 |
| P1-04 | UI-17 | `curl -XPOST "$GW/lexie/ai/api/v1/variance/knowledge/documents/upload?collection=internal_metadata&classification=INTERNAL&report=FRY9C" -H "X-User-Id:$UID" -F file=@memo.txt` | 201 `{doc_id, status:"INDEXED"}`. A binary non-UTF-8 file gives `status:"FAILED"` with `reason_code` | PYTHON-042 |
| P1-05 | UI-14 | `curl -H "X-User-Id:$UID" $GW/lexie/ai/api/v1/variance/knowledge/documents` | `documents[]` contains the P1-02/04 `doc_id`s. Each row has `title, collection, status, classification, reporting_period, report, file_size_bytes, uploaded_at` | PYTHON-043 |
| P1-06 | UI-15 | `curl -XPOST $GW/lexie/ai/api/v1/variance/knowledge/chat $H_JSON -H "X-User-Id:$UID" -d '{"message":"What drives HC-C loan growth?","report":"FRY9C","mdrm_id":"BHCK2170"}'`, then repeat with the returned `session_id` | `{session_id, turn_index, answer, insufficient_evidence, citations[]}`. The second call has the same `session_id` and `turn_index` +1 | PYTHON-049 |
| P1-07 | UI-16 | `curl -XDELETE -H "X-User-Id:$UID" $GW/lexie/ai/api/v1/variance/knowledge/chat/<session_id>` then `GET …/chat/<session_id>` | `{note:"conversation cleared"}`, then `turns:[]` | PYTHON-051/050 |
| P1-08 | UI-12 | `curl "$IS/api/intelligence/evidence/involvement?anchorKind=REPORT_LINE&anchorRef=BHCK2170&from=2026-01-01&to=2026-12-31" -H "X-Client-Id:$CID" -H "X-User-Id:$UID" -H "X-User-Functions:analyst"` | `success:true`, `data.finding` ∈ {`NO_AI_INVOLVEMENT_RECORDED`, `AI_INVOLVEMENT_RECORDED`, `INDETERMINATE`}, `runs[{run_id, role, review_decision}]`, `caveats[{day, state}]` (snake_case, matching the UI model) | JAVA-005 |
| P1-09 | UI-12 (negative) | same without `X-User-Id` | 400 (missing required header) | JAVA-005 |
| P1-10 | UI-10 | `curl "$IS/api/v1/inbox?surface=INTELLIGENCE" -H "X-Client-Id:$CID" -H "X-Actor-Id:$UID"` | `data: []` (F5). **Record as a defect** | JAVA-054 |
| P1-11 | UI-11 | `curl -XPOST "$IS/api/v1/inbox/subj-it-1/decide?subjectKind=PRESET&capability=preset.activate&action=APPROVE&surface=INTELLIGENCE" -H "X-Client-Id:$CID" -H "X-Actor-Id:$UID"` | Parameters bind (not a 400 for missing params). Record the status and body: an unknown subject may be refused by policy | JAVA-055 |
| P1-12 | UI-12 after D7 | P1-08 with `anchorRef` = a line used in P3-02 | `finding:"AI_INVOLVEMENT_RECORDED"`, and `runs[]` includes the P3-02 `run_id` | JAVA-005 |
| P1-13 | (D6) | `curl -XPOST $IS/api/intelligence/training/datasets $H_JSON -H "X-Client-Id:$CID" -H "X-User-Id:$UID" -d '{"dataset_key":"it_ds_1","purpose":"training","use_case":"UC1a","task":"variance","report_type":"FRY9C"}'` | `data.id`, `status:"draft"`, all fields snake_case as in `TrainingDataset` | JAVA-010 |
| P1-14 | UI-19/21 | `GET $IS/api/intelligence/training/datasets` and `…/datasets/<id>/samples` (headers as above) | Lists include P1-13; fields match `TrainingDataset`/`TrainingSample` 21/21 and 16/16 | JAVA-009/016 |
| P1-15 | UI-27 | `POST …/training/samples/bulk` with `[{"dataset_id":<id>,"sample_key":"s1","load_path":"bulk_import","classification":"INTERNAL","masked":true,"payload":{"q":"…","a":"…"}}]` | `data[]` of `{row, sample_key, accepted, sample_id, refusal_code}` | JAVA-027 |
| P1-16 | UI-20 | `GET …/training/datasets/<id>/health` | `{anchors, fresh}` | JAVA-014 |
| P1-17 | UI-24/25/26 | `POST …/datasets/<id>/freeze` `{"exam_dataset_id":null}` → `…/attest` → `…/approve` (the approve step under `X-User-Id:$UID2` to test four-eyes) | Status progresses `frozen → attested → operational`, or the server's refusal code is shown verbatim | JAVA-013/012/011 |
| P1-18 | UI-22/23 | `GET …/training/runs` and `…/runs/eligibility?datasetId=<id>&examDatasetId=<id2>` | `{eligible, reason_code?, status?}` | JAVA-019/021 |
| P1-19 | UI-28/29 | `GET …/training/lineage/datasets/<id>` and `…/lineage/models/<modelId>` | 200 arrays | JAVA-017/018 |
| P1-20 | (D5) | `curl -XPOST $IS/api/v1/governance/definitions/sync $H_JSON -H "X-Client-Id:$CID" -d '[{"kind":"skill","definition_key":"it.skill","version":"1.0.0","display_name":"IT Skill"}]'` | `data[0].id`, `status:"draft"` | JAVA-040 |
| P1-21 | UI-30 / UI-40 candidate | `curl "$IS/api/v1/governance/definitions?kind=skill" -H "X-Tenant-Id:$CID"` | Contains `it.skill`; every `RegisteredDefinitionDto` field present | JAVA-039 |
| P1-22 | UI-31 | `POST …/definitions/<id>/status` `{"target_status":"observed","rationale":"IT"}` (`X-Tenant-Id`, `X-User-Id`) | `data.status:"observed"` | JAVA-045 |
| P1-23 | UI-32 | `POST …/definitions/<id>/mrm` `{"decision":"approved","notes":"IT","decision_id":"dec-it-1"}` (`X-User-Id:$UID2`) | `mrm_status:"approved"`, `mrm_approver:$UID2` | JAVA-044 |
| P1-24 | UI-33 | `PATCH …/definitions/<id>/tags` `{"labels":{"domain":"variance"},"custom_tags":{"it":true}}` | Echoed back in `labels`/`custom_tags` | JAVA-046 |

#### P2: Defect confirmation (as-is FAIL → corrected PASS)

| Test | UI call | As-is request (what the UI sends) | → today | Corrected request | ✅ when |
|---|---|---|---|---|---|
| P2-01 | UI-02 | `POST $IS/api/v1/intelligence/run` `{"clientId":"client_001","useCase":"UC1a","entryPoint":"UI","inputPayload":{"report_type":"FR Y-9C","level":"1","cell":"BHCK2170","current_period":"2026-Q2","prior_period":"2026-Q1"}}` | **404** (path) | `POST $IS/run` `-H X-Client-Id:$CID` `{"client_id":"client_001","use_case":"UC1a","entry_point":"UI","input_payload":{"cycle_id":<D2>,"mdrm_id":"<D3>","requester":"analyst_1"}}` → `data.status` ∈ {completed, in_review}, `data.variance_explanation` present | route + P1 + P2 |
| P2-02 | UI-02 body on the right path | as-is body to `POST $IS/run` | **400** `client_id is mandatory` | (corrected above) | P1 |
| P2-03 | UI-02 keys | corrected casing but UI keys: `input_payload:{"report_type":"FRY9C","cell":"BHCK2170",…}` | 200, `status:"failed"`, reason `RUN_INPUT_INVALID (cycle_id, mdrm_id)` | (corrected above) | P2 |
| P2-04 | UI-03 | `POST $IS/run/<runId>/rerun` `{"clientId":"client-active-tenant","analystInput":"Consider CRE paydowns"}` | **400** `client_id is mandatory` | `{"client_id":"client_001","analyst_input":"Consider CRE paydowns"}` → `{rerun_run_id, parent_run_id, preset_changed}` | P1 |
| P2-05 | UI-04 | `POST $IS/api/v1/semantic/query` `{"clientId":"client_001","query":"Define BHCK2170","intent":"R1_DEFINITION","exposureReady":true,"graphReady":true,"businessReady":false}` | **400** | `{"client_id":"client_001","use_case":"UC8","input_payload":{"query":"Define BHCK2170","intent":"R1_DEFINITION"}}` → today the run **fails in lexie-ai (UC8 `UnboundRoute`)**, and `data.output` is a string | P1 + P3 + UC8 binding |
| P2-06 | UI-05 | `POST $IS/api/v1/anomaly/run` `{"clientId":"client_001","reportId":"FRY9C","period":"2026-Q1","zThreshold":2.5,"iqrMultiplier":2}` | 200, **`overall_status:"REFUSED"`**, `report_id:"FR_Y_9C"`, `period:"2026-Q2"` (proves the inputs were ignored) | `{"client_id":"client_001","report_id":"FRY9C","period":"2026-Q1","z_threshold":2.5,"iqr_multiplier":2,"requester":"analyst_1","roles":["ANALYST"],"series":[{"metric_name":"NIM","data_points":[{"label":"Q1","value":3.1},{"label":"Q2","value":3.0},{"label":"Q3","value":3.2},{"label":"Q4","value":3.1},{"label":"Q5","value":5.9}]}]}` → `ANOMALIES_DETECTED` or `CLEAN` | P1 + P4 |
| P2-07 | UI-06 | `POST $IS/api/v1/peer-benchmark/run` `{"clientId":"client_001","reportId":"FRY9C","period":"2026-Q1","cohortType":"COMMUNITY_BANKS"}` | `REFUSED`, `cohort_type:"REGIONAL_BANKS"` (default) | `{…,"cohort_type":"COMMUNITY_BANKS","metrics":[{"metric_name":"ROA","subject_value":1.1,"peer_values":[0.8,0.9,1.0,1.2,1.3]}]}` → `BENCHMARKED`/`UNDERPERFORMING_PEERS` | P1 + P4 |
| P2-08 | UI-07 | `POST $IS/api/v1/forecast/run` `{"clientId":"client_001","reportId":"FRY9C","basePeriod":"2026-Q1","horizonQuarters":8,"scenario":"ADVERSE"}` | `REFUSED`, `horizon_quarters:4`, `scenario:"BASELINE"` | `{…,"base_period":"2026-Q1","horizon_quarters":8,"scenario":"ADVERSE","metrics":[{"metric_name":"CET1","history":[{"period":"2025-Q3","value":12.1},{"period":"2025-Q4","value":12.3},{"period":"2026-Q1","value":12.4}]}]}` → `PROJECTED`, `forecasts[0].projected_points` has length 8 | P1 + P4 |
| P2-09 | UI-08 | `POST $IS/api/v1/ratio/run` `{"clientId":"client_001","reportId":"FRY9C","period":"2026-Q1","executedBy":"analyst_1","roles":["ANALYST"]}` | 200 with **fallback numbers** (e.g. TIER1 = 15,000,000 / 120,000,000 = 12.5 %), `report_id:null` | `{"client_id":"client_001","report_id":"FRY9C","period":"2026-Q1","executed_by":"analyst_1","raw_schedule_data":{"tier1_capital":9000000,"total_rwa":100000000,"cet1_capital":8000000,"total_leverage_exposure":150000000}}` → TIER1 = 9.0 % (**assert it is not 12.5 %**) | P1 + P4 |
| P2-10 | UI-09 | `POST $IS/api/v1/supervisory-radar/run` `{"clientId":"client_001","reportId":"FRY9C","period":"2026-Q1"}` | `REFUSED` ("No regulatory feed items") | `{…,"feed_items":[{"feed_id":"f1","regulatory_body":"FED","alert_type":"RULE_CHANGE","title":"Capital rule update","publication_date":"2026-05-01","affected_schedules":["HC-R"],"summary_text":"…"}]}` → `NORMAL`/`CRITICAL_ACTION_REQUIRED`, `alerts[]` | P1 + P4 (feed source is a gap) |
| P2-11 | UI-34 | `POST $IS/api/v1/presets/draft` `{"preset_key":"it_preset","task":"UC1","report_type":"Y9C","envelope_id":null,"external_eligible":false,"max_steps":8,"kg_depth_default":1,"kg_depth_max":3,"cost_guardrails":{"max_tokens":4000},"evidence_toggles":{"trend":true,"anchor":false,"recon":false}}` | **400** (`envelope_id` `@NotNull`) | same with `"envelope_id":<D4>` and `"evidence_toggles":{"trend_enabled":true,"anchor_enabled":false,"recon_enabled":false}` + `X-Client-Id:$CID`, `X-Principal-Id:$UID` → `data.preset_id`, `data.preset_version` (**the UI reads `id`/`version`**) | P5 |
| P2-12 | UI-35 | `POST $IS/api/v1/presets/<id>/versions/<v>/lifecycle` `{"target_state":"OPERATIONAL"}` with only `X-Client-Id` | **400** (missing `X-Principal-Id`) | add `-H X-Principal-Id:$UID2` → a status change, or an OPA/MRM refusal with `policy_code` | P5 |
| P2-13 | UI-10 response | P1-10 against a service with a registered item (unit-test harness) | Rows use `subject_id`; the UI reads `subjectId` | — | P1 |
| P2-14 | UI-37/38/39/40 | `POST $IS/api/intelligence/presets/preset_123/envelope/approve`, `POST $IS/api/intelligence/run`, `POST $IS/api/intelligence/run/x/rerun`, `GET $IS/api/intelligence/skills` | **404** each (no backend) | Replacements: JAVA-065, JAVA-085, JAVA-087, JAVA-039 `?kind=skill` | P7 |

#### P3: Service-to-service (Java → Python)

| Test | Request | Expected | Maps to |
|---|---|---|---|
| P3-01 | `curl -XPOST $LX/run $H_JSON -d '{"client_id":"client_001","use_case":"UC1a","input_payload":{"cycle_id":<D2>,"mdrm_id":"<D3>"}}'` | `RunResult{run_id:"lexie-…", status, use_case:"UC1a", output{output_type, narrative}, variance_explanation{…}}` | PYTHON-011 |
| P3-02 | same body with `entry_point`, via `POST $IS/run -H X-Client-Id:$CID` | `ApiResponse.data` carries the lexie-ai result. Then `GET $IS/run/<run_id>` → 200 (persisted) | JAVA-085 → PYTHON-011, JAVA-086 |
| P3-03 | P3-02 with a header `X-Client-Id:other` | 400 "client_id does not match the authenticated tenant" | JAVA-085 tenant guard |
| P3-04 | `POST $LX/run` `{"client_id":"client_001","use_case":"UC2","input_payload":{"adjustment_node_id":"BHCK2170","adjustment_report":"FRY9C","delta_amount":1000000}}` | UC2 result (`run_id` and `client_id` are injected by the dispatcher, [dispatcher.py:141-147](lexie-ai/lexie_ai/run/dispatcher.py#L141-L147)) | PYTHON-011 UC2 |
| P3-05 | `POST $LX/run` UC2 with the Lexie-panel payload `{"question":"…","report_type":"FRY9C"}` | `status:"failed"`, `RUN_INPUT_INVALID` (confirms §13-A) | PYTHON-011 |
| P3-06 | `POST $LX/run` with `use_case` `LINEAGE`, `UC8`, `UC12` | `RUN_USE_CASE_UNKNOWN` / unbound refusal (confirms §14) | PYTHON-011 |

#### P4: UI end to end (browser, `npm run dev`, reference host)

| Test | Screen | Steps | Expected today |
|---|---|---|---|
| P4-01 | Knowledge Hub | Load, paste a text doc, upload a file, ask chat, start a new conversation | All work. Network tab shows `$GW/lexie/ai/...` with `X-User-Id: a.kumar` (**hard-coded, record it**). The collections response is fetched but not displayed |
| P4-02 | Anomaly / Benchmark / Forecast / Radar | Run with non-default inputs | REFUSED notice. The response JSON shows default report and period (P2-06…10) |
| P4-03 | Ratio | Run | Shows a "result" built from fallback constants (**defect F6**) |
| P4-04 | Variance Analysis | Run | Error: the Vite proxy forwards `/api/v1/intelligence/run` → 404 |
| P4-05 | Semantic & Reference | Submit a query | Error (400) |
| P4-06 | Approvals Inbox | Open | Empty list (F5) |
| P4-07 | Evidence Ledger | — | **Not visible** (the reference host withholds `governance.audit.view`, F8). Test via P1-08 or inside Core |
| P4-08 | Lexie panel | Ask "impact of Y-9C BHCK2170" | Reference client answer; **no network call** (F7) |
| P4-09 | Training Data | Open | Visible (`training.view`); no network calls (store only) |
| P4-10 | Skill Registry / Presets / Policies / Model Registry / Audit & Evidence / Role Mapping | Open | Mock data; no network calls |

#### P5: Blocked (need an endpoint first, §14)

| Test | Capability | Existing code | Proposed endpoint (for the backend team to confirm) |
|---|---|---|---|
| P5-01 | Multi-hop | `MultiHopCoordinator.coordinateMultiHopRun` | `POST /api/v1/multihop/run` |
| P5-02 | AU9 export bundle | `Au9ExportService.assembleExportBundle / getExportBundle` | `POST /api/v1/export/bundles`, `GET /api/v1/export/bundles/{id}` |
| P5-03 | HSM key list | `HsmKeyManager.listKeys` | `GET /api/v1/hsm/keys` |
| P5-04 | Merkle | `MerkleTreeService.getTree/getTreeNodes/sealTree/generateProof/verifyProof` | `GET /api/v1/merkle/trees/{id}`, `POST …/{id}/seal`, `POST …/{id}/proofs/verify` |
| P5-05 | Drop-profile SME ruling | `DropProfileService.recordRuling/getRulings` | `POST/GET /api/v1/drop-profiles/{versionId}/rulings` |
| P5-06 | Footnotes | `ChunkReferenceService.getNotesForChunks` | `GET /knowledge/chunks/footnotes?ids=` |
| P5-07 | Cross-UC review queue | `AgentRunDao.findByClientIdAndStatus`, `ReviewQueueService.submitReview` | `GET /api/v1/review/queue`, `POST /api/v1/review/{runId}` |
| P5-08 | Line history and values | lexie-ai `fetch_history` / `fetch_values` | `GET /api/v1/variance/lines/{mdrm_id}/history` |
| P5-09 | UC8 via `/run` | lexie-ai `SemanticQuerySkill` | bind `"UC8"` in `_skill_routes()` |
| P5-10 | Lexie resolver, preset list, model registry read, peer data, regulatory feed | none (true gaps) | design needed |

---

## 16. Test Tracker

Fill in **Status** (`Not run` / `Pass` / `Fail` / `Blocked`) and **Result / defect** as tests run. Each "Prediction" is what this analysis expects, so a mismatch means the analysis needs correcting.

| Test | Integration | Prediction | Status | Result / defect | Owner | Date |
|---|---|---|---|---|---|---|
| P0-01…07 | Smoke | Pass | Not run | | | |
| P1-01 | KH collections | Pass | Not run | | | |
| P1-02 | KH text ingest | Pass | Not run | | | |
| P1-03 | KH ingest without identity | Pass (401) | Not run | | | |
| P1-04 | KH upload | Pass | Not run | | | |
| P1-05 | KH document list | Pass | Not run | | | |
| P1-06 | KH chat | Pass | Not run | | | |
| P1-07 | KH chat reset | Pass | Not run | | | |
| P1-08/09 | Evidence involvement | Pass | Not run | | | |
| P1-10 | Inbox list | Pass (empty; defect F5) | Not run | | | |
| P1-11 | Inbox decide binding | Pass (params bind) | Not run | | | |
| P1-12 | Evidence after a run | Pass | Not run | | | |
| P1-13…19 | Training API | Pass | Not run | | | |
| P1-20…24 | Skill definitions API | Pass | Not run | | | |
| P2-01 | Variance run path | Fail (404) | Not run | | | |
| P2-02 | Variance run casing | Fail (400) | Not run | | | |
| P2-03 | Variance UC1a keys | Fail (`RUN_INPUT_INVALID`) | Not run | | | |
| P2-04 | Rerun casing | Fail (400) | Not run | | | |
| P2-05 | Semantic shape and UC8 | Fail | Not run | | | |
| P2-06 | Anomaly | Fail (defaults, REFUSED) | Not run | | | |
| P2-07 | Peer benchmark | Fail (REFUSED) | Not run | | | |
| P2-08 | Forecast | Fail (REFUSED) | Not run | | | |
| P2-09 | Ratio | Fail (fallback constants) | Not run | | | |
| P2-10 | Supervisory radar | Fail (REFUSED) | Not run | | | |
| P2-11 | Preset draft | Fail (400) | Not run | | | |
| P2-12 | Preset lifecycle | Fail (400) | Not run | | | |
| P2-13 | Inbox response casing | Fail | Not run | | | |
| P2-14 | Legacy and unmatched paths | Fail (404) | Not run | | | |
| P3-01…06 | Java→Python `/run` | Pass (P3-05/06 confirm refusals) | Not run | | | |
| P4-01…10 | UI end to end | per §15.4 P4 | Not run | | | |
| P5-01…10 | Code-only and gaps | Blocked | Blocked | | | |


---

## 17. Implementation Status: Phase 1 (UI-only fixes, 2026-09-27)

Plan: [integration-implementation-plan.md](integration-implementation-plan.md). **UI code only; no backend change.**
- Typecheck: `tsc --noEmit -p tsconfig.app.json` → 0 errors.
- LP-47 gates: reachability GREEN (stage `after`, so no slice changes); parse gate GREEN.
- vitest: NOT RUN (tests updated or added, listed below).
- Lint: no new findings in the changed files.

### 17.1 What the UI sends now

| UI call | Before (§13) | Now | §15 test: new prediction |
|---|---|---|---|
| UI-05…09 analytics (`featureClient`) | camelCase body → ignored; responses read camelCase | Body **snake_case** (`client_id`, `report_id`, `z_threshold`, …) via `wireCase.toSnakeKeys`; responses **camelCased** via `toCamelKeys` | P2-06…10: user inputs now bind. Runs still **REFUSED** (no data arrays; Ratio still uses fallback constants, Phase 3.1/3.2). The UI now shows the server's `stopReason`/`narrative` |
| UI-10/11 Inbox | response `subject_id` unread | Response camelCased, so `subjectId`/`subjectKind`/`capability` populate, and decide sends real values | P2-13 → **Pass**. The list is still empty at runtime (F5, Phase 3.3) |
| UI-01 Lexie (`httpHost`) | `POST /api/v1/intelligence/run`, camelCase | `POST {BASE}/run`, snake body, camelCased result | Path and casing fixed; still no resolver (§14.2), so no call in practice |
| UI-02 Variance run | `/api/v1/intelligence/run`, camelCase, `input_payload{report_type, level, cell, …}`, hard-coded `client-active-tenant` | 1) `GET {GW}/lexie/ai/api/v1/variance/cycles/available?report=FRY9C` resolves `cycle_id` for the period (refuses `VARIANCE_CYCLE_NOT_OPEN` / `_AMBIGUOUS` / `_EXECUTION_NOT_FOUND`, never guesses). 2) `POST {BASE}/run` `{client_id, use_case:"UC1a", entry_point, correlation_id, input_payload{cycle_id, mdrm_id:=cell, requester, …form fields}}` with `X-Client-Id`/`X-User-Id` from the session. 3) The VarianceAI record is adapted: `drivers[] → DriverFinding`, `subject → cell/current/prior/delta`, `confidence.score`. A `status:"failed"` run is raised as `REASON_CODE: narrative` | P2-01/02/03 → **Pass** once D2/D3 data exist |
| UI-03 Variance rerun | `/run/{id}/rerun` camelCase, literal tenant | `{BASE}/run/{id}/rerun` `{client_id, analyst_input, correlation_id, input_payload_override}`. The tenant is the **parent run's** server-issued `client_id`. Response camelCased | P2-04 → **Pass** |
| UI-04 Semantic | top-level camelCase `query/intent/*Ready`, `client-1` | `{client_id, use_case:"UC8", entry_point:"UI", preset_key, correlation_id, input_payload{query, intent, requester, exposure_ready, graph_ready, business_ready}}`, identity from the session. `AgentRunRecord` adapted (`output` string parsed + camelCased, `output_type`→`outputVocab`). A `failed` run is raised with its reason code | P2-05: request **binds**. The run is still refused by lexie-ai (`RUN_ADAPTER_UNBOUND`, owner decision G4 / Phase 3.4), and the UI now shows that reason |
| UI-13…18 Knowledge Hub | `X-User-Id: a.kumar` | `X-User-Id` = session principal (no principal → refused locally, `NO_IDENTITY`). URL built by the shared `lexieClient.lexieUrl` | P4-01: header is the session principal |
| UI-34 Preset draft | `envelope_id:null`, toggles `{trend, anchor, recon}`, no identity headers, read `id/version` | Refuses locally without an envelope (`ENVELOPE_REQUIRED`; new **Envelope ID** input in `GovernanceEnvelope`). Toggles → `{trend_enabled, anchor_enabled, recon_enabled}`. `X-Client-Id` + `X-Principal-Id` from the session. `preset_id/preset_version` adapted → `{id, version}` | P2-11 → **Pass** with D4 |
| UI-35 Preset lifecycle | no `X-Principal-Id` | `X-Principal-Id` = session principal | P2-12 → **Pass**, or the server's SoD/MRM refusal |
| UI-37 Envelope approve | `POST /api/intelligence/presets/{id}/envelope/approve` (404) | **Interim:** Approve requests the lifecycle transition (the service's only approval act: approver = `X-Principal-Id`, SoD and MRM gates server-side). Requires a committed draft | P2-14 (approve part) → hits JAVA-065. **Owner to confirm** (plan §3) |
| UI-30…33 Skills client | relative URL | `VITE_INTELLIGENCE_API_BASE` + `/api/v1/governance/definitions` (still dormant: Phase 2.8) | — |

### 17.2 Files changed (intelligence-ui)

| File | Change |
|---|---|
| `src/shell/wireCase.ts` (new) | deep `toSnakeKeys` / `toCamelKeys` |
| `src/shell/lexieClient.ts` (new) | gateway URL, identity headers, `lexieGet` |
| `src/shell/featureClient.ts` | snake request / camel response |
| `src/shell/host/httpHost.ts` | `/run`, casing |
| `vite.config.ts` | dev proxy `/run` → intelligence-service |
| `src/features/variance/api.ts`, `varianceStore.ts`, `components/VarianceWorkspace.tsx` | UC1a contract, cycle resolution, result adapter, session identity |
| `src/features/semantic/api.ts`, `semanticStore.ts`, `components/SemanticWorkspace.tsx` | RunRequest shape, AgentRunRecord adapter, session identity |
| `src/features/knowledge/components/KnowledgeHub.tsx` | session principal as `X-User-Id` |
| `src/api/presetApi.ts`, `src/hooks/usePresetLifecycle.ts`, `src/components/organisms/GovernanceEnvelope.tsx`, `src/i18n/messages.en.ts` | preset wire contract, envelope id input, approve → lifecycle |
| `src/features/skills/api.ts` | base URL |
| Tests | `shell/__tests__/wireCase.test.ts` (new); updated `semantic/__tests__/api.test.ts`, `semantic/__tests__/SemanticWorkspace.test.tsx` (host wrapper), `components/__tests__/PresetWizard.test.tsx` (host wrapper, tests 9–11 added), `variance/__tests__/VarianceWorkspace.test.tsx` (session argument) |

### 17.3 Still open after Phase 1

- **Phase 2** (additive endpoints + wiring): see the plan.
- **Phase 3** (owner decisions):
  - analytics data source
  - Ratio fallback constants
  - Inbox persistence
  - UC8 binding
  - Lexie resolver
  - prod gateway route
  - legacy hooks
  - confirming approve → lifecycle


---

### 17.4 Phase 2: additive endpoints and wiring (2026-09-27)

**Checks:**
- Java `mvn test-compile`: exit 0.
- UI `tsc`: 0 errors.
- LP-47 reachability: GREEN, stage `after` re-recorded (`reachable_slices` 26 → 30, `declared_unmounted` 9 → 5), with `LP47_SIMULATION.md` regenerated by the gate itself and mutants T05, T06 and T10 retargeted.
- Parse gate: GREEN.
- JUnit and vitest: NOT RUN.

**Correction to §14:** HSM keys are **already reachable**. `POST /api/v1/hsm/operations {operation:"GET_APPLIANCE_STATUS"}` returns `status`, `slots` and `keys` through the OPA tool-scope check and evidence steps (`HsmSigningCoordinatorImpl`), so the HSM slice needed only UI wiring.

**New Java endpoints** (IDs continue §5):

| API ID | Method | Endpoint | Over existing code | Governance | UI consumer |
|---|---|---|---|---|---|
| JAVA-088 | POST | `/api/v1/multihop/run` | `MultiHopCoordinator` | its own `tool_scope_multihop` gate | Multi-hop Orchestration (new mount) |
| JAVA-089 | GET | `/api/v1/review/queue` | `AgentRunDao.findByClientIdAndStatus(IN_REVIEW)` + `ReviewActionResolver` | tenant from `X-Client-Id`; actions from the transition table | AI Risk & Controls |
| JAVA-090 | GET | `/api/v1/review/{runId}` | `ReviewActionResolver.buildReviewReadModel` | tenant-scoped lookup (404) | — |
| JAVA-091 | POST | `/api/v1/review/{runId}/decision` | `ReviewQueueService.submitReview` | four-eyes via OPA inside the service (fails closed) | AI Risk & Controls |
| JAVA-092 | POST | `/api/v1/export/bundles` | `Au9ExportService.assembleExportBundle` | `ToolScopeGate` → `tool_scope_export` `assemble_export` (regulator recipients need REGULATORY_OFFICER / COMPLIANCE_DIRECTOR) | Evidence Export (new mount) |
| JAVA-093 | GET | `/api/v1/export/bundles/{bundleId}` | `getExportBundle` | `inspect_manifest`; another tenant's bundle → 404 | Evidence Export (download) |
| JAVA-094 | POST | `/api/v1/export/bundles/{bundleId}/verify` | `verifyExportBundle` | `verify_export`; tenant-checked | — |
| JAVA-095 | GET | `/api/v1/merkle/trees/{treeId}` | `MerkleTreeService.getTree` | `tool_scope_merkle` `fetch_tree`; tenant-scoped | Evidence Export → Merkle |
| JAVA-096 | GET | `/api/v1/merkle/trees/{treeId}/nodes?level=` | `getTreeNodes` (after the tenant check) | `fetch_leaf` | Evidence Export → Merkle |
| JAVA-097 | POST | `/api/v1/merkle/trees/{treeId}/seal` | `sealTree` | `seal_tree` with `is_sealed` | Evidence Export → Merkle |
| JAVA-098 | POST | `/api/v1/merkle/trees/{treeId}/proofs` | `generateProof` + `verifyProof` | `generate_proof` + `verify_proof` | Evidence Export → Merkle |

**UI wiring:**

| Screen | Now calls | Notes |
|---|---|---|
| HSM & Digital Seals (new, Risk & Compliance) | JAVA-051 `GET_APPLIANCE_STATUS`, `ROTATE_KEY` | `payload` sent wire-opaque (the coordinator reads `payload.keyAlias` verbatim). Offline verify with no loaded seal is refused locally (`HSM_NO_SEAL_LOADED`) |
| Multi-hop Orchestration (new, Analyst Workspace) | JAVA-088 | `maxHops` = 3 (the server's ceiling); `initialPayload` opaque |
| AI Risk & Controls | JAVA-089/091 | Buttons only for server-listed tokens; the fake "8" badge was removed |
| Evidence Export (new, Evidence; + Merkle) | JAVA-092/093/095–098 | Run id entered by the analyst; tenant from the session; checksums and canonical payloads kept verbatim (`responseOpaque`); proof adapted (`adaptProof`) |
| Skill Registry | JAVA-039 `?kind=skill` | `toSkillView` adapter; the seed is now only a test fixture; the fake "9" badge was removed |
| Training Data | JAVA-009/014/016/019/021 (`trainingApi`) | datasets, runs, per-dataset health and samples, per-run eligibility |
| Audit & Evidence timeline | JAVA-048 estate-ledger read | rows are ledger entries; absent facts render "—" |

**Shared seams:**
- `featureClient` now sends `X-User-Functions` (session roles) and accepts `opaque` / `responseOpaque`.
- New `ToolScopeGate` (Java) for routes that expose a service directly.
- The reviewer role is the first entry of `X-User-Functions`.

**§15 updates:** P5-01/02/03/04/07 are **no longer blocked**. Test them via JAVA-088, JAVA-092/093, JAVA-051 `GET_APPLIANCE_STATUS`, JAVA-095–098 and JAVA-089/091. P5-05 and P5-06 stay blocked (plan 3.10).

**New tests (not run):**
- JUnit: `MultiHopRunControllerTest`, `ReviewQueueControllerTest`, `ExportBundleControllerTest`, `MerkleTreeControllerTest`.
- vitest: `risk/__tests__/ReviewQueue.test.tsx`, `export/__tests__/exportMount.test.ts`, and additions to `wireCase.test.ts` and `SkillRegistry.test.tsx`; the `walkthroughAudit.test.tsx` fixtures were updated.

### 17.5 Run detail and analytics data (2026-09-28)

| Screen | Route now used | Notes |
|---|---|---|
| Evidence drawer (Variance result "Evidence"; Review Queue "Evidence") | **new** `GET /api/v1/runs/{runId}` (`RunDetailController`) | Persisted run: `agent_run`, steps (without raw input), variance explanation, review events, evidence links and chain validation. Tenant-scoped via `X-Client-Id`; 404 outside the tenant. Replaces the in-memory `GET /run/{id}` for this screen |
| Anomaly Detection (UC5) | `POST /api/v1/anomaly/run` + new `mdrm_ids` | With no `series`, the coordinator loads each line's filed history (≤8 points through the period) via **new** lexie `GET /api/v1/variance/lines/{mdrm_id}/history` |
| Forecast Projection (UC6) | `POST /api/v1/forecast/run` + new `mdrm_ids` | Same source, through `base_period` |
| Ratio Reconciliation (UC4) | `POST /api/v1/ratio/run` (unchanged payload) | With no `raw_schedule_data`, the coordinator loads the period's filed values keyed by taxonomy id via **new** lexie `GET /api/v1/variance/values`. Operand keys already accept `BHDM8274`/`BHDMA223`/`BHDMP859`/`BHDM7204`. If the tenant has several legal entities, lexie answers 400 naming them, and the run refuses with `MISSING_OPERANDS` |

Java reads lexie through `FiledValuesSource` (`lexieWebClient`). Report ids are normalised to `report_nm` (`FR_Y_9C` → `FRY9C`) and quarter labels to period-end dates (`2026-Q2` → `2026-06-30`). When lexie is unavailable, the data stays empty and the run refuses: nothing is interpolated or defaulted.

### 17.6 Knowledge Hub no longer calls lexie-ai directly (2026-09-28)

Knowledge Hub (UI-13 to UI-18) used to call `{GW}/lexie/ai/api/v1/variance/knowledge/*` from the browser with only `X-User-Id`. It now calls intelligence-service at `/api/v1/lexie/knowledge/*` (`LexieKnowledgeController`), which:
- requires `X-Client-Id` and `X-User-Id` (400 before lexie-ai is called);
- forwards both headers plus the service JWT (`lexieWebClient`);
- passes bodies and answers through as bytes, so lexie-ai's snake_case and its `{detail}` refusals reach the UI unchanged;
- answers 502 `{detail}` when lexie-ai is unreachable.

Only the six operations are exposed: collections, list documents, ingest text, upload (multipart, 25 MB), chat, chat reset. Multipart limits were raised to 25 MB to match lexie-ai's `MAX_UPLOAD_BYTES`.

Still direct: `variance/api.ts` `resolveVarianceCycle` → `/lexie/ai/api/v1/variance/cycles/available` (item 1 of the recommendation, not done). lexie-ai's knowledge store is not tenant-partitioned, so the tenant header is checked and forwarded, but lexie-ai does not filter by it.

### 17.7 New and changed endpoints since revision 3 (recorded 2026-10-02)

This section gives an inventory ID to every endpoint that exists in code but had none in §5 / §6. It continues the numbering after JAVA-098 and PYTHON-072. The list was built by extracting every `@*Mapping` in intelligence-service and every route in lexie-ai, then comparing against this document. Some of these were already described in prose in §17.5 / §17.6 without an ID.

**Changed contract: JAVA-030 `POST /api/v1/analytical/run` (UC10)**

| | Before | Now |
|---|---|---|
| Identity | `client_id`, `requester`, `roles`, `entitlements` in the body; requester defaulted to `analyst_user` | Headers only: `X-Client-Id`, `X-User-Id` (400 when missing or blank), `X-User-Functions`. Identity in the body is ignored. |
| Behaviour | Java keyword match returning a canned `REP-001` | OPA `tool_scope_analytical` `catalog_search` (a null response is a denial), then lexie `/run` UC10. `CATALOG_NOT_READY` from policy or lexie is returned verbatim and skips review. |
| Refusals | Unmapped | `TOOL_SCOPE_DENIED` 422, `LEXIE_REJECTED` 422, `LEXIE_UNAVAILABLE` 502, `LEXIE_TIMEOUT` 504, `LEXIE_CONTRACT_VIOLATION` 502, lexie's own reason code 422 |
| Response | — | Adds `parse` (null when the skill recorded none); `status` is `NOT_RUN` when policy stopped the ask |
| Ledger | none | Estate ledger `RUN` record, capability `analytical`, decision under `allow` |

**New Java endpoints** (controller paths relative to `intelligence-service/src/main/java/com/lextr/intelligence/`):

| API ID | Method | Endpoint | Controller | UI consumer |
|---|---|---|---|---|
| JAVA-099 | GET | `/api/v1/inbox/{subjectId}/detail` | `inbox/controller/InboxController.java:55` | To-do Inbox detail ([inbox/mount.tsx](intelligence-ui/src/features/inbox/mount.tsx)) |
| JAVA-100 | GET | `/api/v1/models` | `modelregistry/controller/ModelRegistryController.java:30` | Model Registry; Training Data model picker |
| JAVA-101 | GET | `/api/v1/opa/roles` | `policy/controller/OpaPolicyController.java:34` | Role Mapping |
| JAVA-102 | GET | `/api/v1/presets` | `preset/controller/PresetController.java:66` | Presets inventory ([presets/mount.tsx](intelligence-ui/src/features/presets/mount.tsx)) |
| JAVA-103 | GET | `/api/v1/presets/envelopes` | `preset/controller/PresetController.java:84` | Preset wizard, governance envelope picker (`api/presetApi.ts`) |
| JAVA-104 | GET | `/api/v1/runs` | `run/controller/RunDetailController.java:58` | Audit & Evidence run list |
| JAVA-105 | GET | `/api/v1/runs/{runId}` | `run/controller/RunDetailController.java:64` | Evidence drawer: Variance result, Review Queue (§17.5) |
| JAVA-106 | POST | `/api/v1/variance/run` | `variance/controller/VarianceRunController.java:37` | Variance run ([variance/api.ts](intelligence-ui/src/features/variance/api.ts)) |
| JAVA-107 | GET | `/api/v1/variance/lines/metadata` | `variance/controller/LexieVarianceController.java:200` | Variance console line picker |
| JAVA-108 | GET | `/api/v1/variance/lines/{mdrmId}/history` | `variance/controller/LexieVarianceController.java:208` | Variance console; analytics enrichment (§17.5) |
| JAVA-109 | GET | `/api/v1/variance/values` | `variance/controller/LexieVarianceController.java:217` | Variance console (`varianceApiClient.ts`) |
| JAVA-110 | GET | `/api/intelligence/drop-profiles` | `drops/DropProfileController.java:33` | Drop Profiles (`features/governance/dropProfileApi.ts`) |
| JAVA-111 | GET | `/api/intelligence/drop-profiles/{id}` | `drops/DropProfileController.java:38` | Drop Profiles |
| JAVA-112 | POST | `/api/intelligence/drop-profiles` | `drops/DropProfileController.java:43` | Drop Profiles |
| JAVA-113 | POST | `/api/intelligence/drop-profiles/{id}/versions` | `drops/DropProfileController.java:54` | Drop Profiles |
| JAVA-114 | GET | `/api/intelligence/drop-profiles/{id}/versions/{version}/rulings` | `drops/DropProfileController.java:64` | Drop Profiles, SME rulings |
| JAVA-115 | POST | `/api/intelligence/drop-profiles/{id}/questions/{questionId}/ruling` | `drops/DropProfileController.java:73` | Drop Profiles, SME ruling (OPA-gated) |
| JAVA-116 | POST | `/api/intelligence/training/samples/{id}/retire` | `training/controller/TrainingController.java:108` | Training Data (`features/training-data/api.ts`) |
| JAVA-117 | POST | `/api/intelligence/training/samples/{id}/revalidate` | `training/controller/TrainingController.java:115` | Training Data |
| JAVA-118 | GET | `/api/intelligence/training/samples/{id}/anchors` | `training/controller/TrainingController.java:121` | Training Data, sample anchors |
| JAVA-119 | GET | `/api/v1/lexie/knowledge/collections` | `knowledge/controller/LexieKnowledgeController.java:52` | Knowledge Hub (`knowledgeApiClient.ts`) (§17.6) |
| JAVA-120 | GET | `/api/v1/lexie/knowledge/documents` | `knowledge/controller/LexieKnowledgeController.java:58` | Knowledge Hub |
| JAVA-121 | POST | `/api/v1/analytical/batch/apply?surface=` | `analytical/controller/AnalyticalRunController.java:44` | Analytical Assist, Refine & build (`analyticalApi.ts`) |
| JAVA-122 | POST | `/api/v1/lexie/knowledge/documents` | `knowledge/controller/LexieKnowledgeController.java:65` | Knowledge Hub (ingest text) |
| JAVA-123 | POST | `/api/v1/lexie/knowledge/documents/upload` | `knowledge/controller/LexieKnowledgeController.java:73` | Knowledge Hub (multipart, 25 MB) |
| JAVA-124 | GET | `/api/v1/lexie/knowledge/documents/{docId}` | `knowledge/controller/LexieKnowledgeController.java:92` | Knowledge Hub document view |
| JAVA-125 | GET | `/api/v1/lexie/knowledge/documents/{docId}/download` | `knowledge/controller/LexieKnowledgeController.java:104` | Knowledge Hub |
| JAVA-126 | POST | `/api/v1/lexie/knowledge/documents/{docId}/archive` | `knowledge/controller/LexieKnowledgeController.java:112` | Knowledge Hub |
| JAVA-127 | GET | `/api/v1/lexie/knowledge/search` | `knowledge/controller/LexieKnowledgeController.java:119` | Knowledge Hub search |
| JAVA-128 | POST | `/api/v1/lexie/knowledge/chat` | `knowledge/controller/LexieKnowledgeController.java:126` | Knowledge Hub; Lexie panel; TDM sandbox probes |
| JAVA-129 | GET | `/api/v1/lexie/knowledge/chat/{sessionId}` | `knowledge/controller/LexieKnowledgeController.java:134` | Knowledge Hub chat history |
| JAVA-130 | DELETE | `/api/v1/lexie/knowledge/chat/{sessionId}` | `knowledge/controller/LexieKnowledgeController.java:141` | Knowledge Hub chat reset |
| JAVA-131 | GET | `/api/v1/lexie/knowledge/graph/{nodeType}/{nodeId}` | `knowledge/controller/LexieKnowledgeController.java:148` | Knowledge Hub graph view |

**JAVA-121 `POST /api/v1/analytical/batch/apply` (UC10, LP-41.4) in detail:**
- **Identity:** headers only. Body `client_id` / `requester` are replaced by the header values.
- **Surface:** `surface` must be `CORE`; any other value gets 422 `SURFACE_NOT_CORE`, and a missing one gets 400.
- **Validation:** every operation must carry a `status` (`ACCEPTED` / `REJECTED` / `OMITTED`), otherwise 400. An operation with unknown grounding is never applied; it counts as omitted.
- **Policy:** OPA `tool_scope_analytical` `apply_batch`, gated on `handoff_ready`.
- **Staleness:** if `against_version` ≠ `current_core_version`, the response is `REFUSED_STALE` with `stale: true`, nothing applied, and the batch still recorded.
- **Instance ask:** `is_instance_ask: true` returns `INSTANCE_STORE_RETRIEVED` and triggers no run.
- **Persistence:** one transaction holds the `agent_run` (operations as steps) and the estate ledger `ACCEPT_BATCH` record.
- **Migration:** requires `V44__lp24_analytical_ledger_actions.sql`, which adds `RUN` and `ACCEPT_BATCH` to the governed ledger actions. There is no Flyway, so it is applied by hand.

**New Python (lexie-ai) endpoints:**

| API ID | Method | Endpoint | Route | Consumer |
|---|---|---|---|---|
| PYTHON-073 | GET | `/api/v1/variance/lines/{mdrm_id}/history` | `routes/variance_routers.py:83` | intelligence-service JAVA-108 and analytics enrichment (§17.5) |
| PYTHON-074 | GET | `/api/v1/variance/values` | `routes/variance_routers.py:116` | intelligence-service JAVA-109 and Ratio enrichment (§17.5) |

**Changed Python contract: `POST /run` use case UC10**
- `extra_fields` now carries `catalog_state` and `construction_proposal`.
- `requester` is required; a missing one gets `RUN_INPUT_INVALID`.
- With no Semantic Layer catalog bound, the result is `completed` with `catalog_state: CATALOG_NOT_READY` and the `ANALYTICAL_CATALOG_UNBOUND` reason.

**Verified 2026-10-02:** live checks against local services, 38/38 for UC10 (JAVA-030, JAVA-121, the estate-ledger read, lexie `/run` UC10, OPA `tool_scope_analytical`).
