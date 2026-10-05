# frontend-service Analytical & Reporting Assist (UC10) → intelligence-service: Integration Plan

**Status:** PLANNED
**Repo to change:** `lextr/typescript/frontend-service` only
**Reference implementation:** `lextrai/intelligence-ui/src/features/analytical/` (`analyticalApi.ts`, `types.ts`, `mountContract.ts`, `components/AnalyticalWorkspace.tsx`)
**Sibling plans:** `FrontendService_Variance_via_IntelligenceService_Plan.md` (shared routing and identity work)

---

## 1. Goal

Replace the **mocked** "Lexie Analytics Assist" panel in frontend-service's Analytics screen with real calls to intelligence-service, the same calls intelligence-ui's Analytical Assist makes.

```
CURRENT  frontend-service LexiAssist ── no API (setTimeout mocks, keyword "exposure" → best-matches)

FUTURE   frontend-service ──/lexie/intelligence/api/v1/analytical/*─▶ gateway ──▶ intelligence-service ──▶ lexie-ai POST /run (UC10)
                            + X-Client-Id, X-User-Id                           (AnalyticalRunCoordinator: persists the run; batch apply only on surface CORE)
```

The intelligence-ui contract (`mountContract.ts`): Core owns the Analytical Reporting screen and embeds the assist panel at anchor `an-lexie` (mode EMBEDDED). The assist does **report discovery and build/refine operations, never values**. Report execution stays with Core's own analytics APIs.

## 2. Current frontend-service (to be replaced)

| Piece | File | Today |
|---|---|---|
| Menu entry "Lexie Analytics Assist" (`lexie-assist-id`) | `features/analytics/layout.tsx:78,167,273` | mounts `LexiAssist` |
| Search, refine and run state | `features/analytics/components/LexiAssist.tsx` | **Mock**: `setTimeout`; `resultType = query.includes('exposure') ? 'best-matches' : 'guided'`; the run job is a fake that completes after a timeout |
| Results UI | `components/LexiResults.tsx` (`ResultType = 'best-matches' \| 'guided' \| 'execution-started'`) | static content |
| Search, signals and execution monitor | `LexiSearch.tsx`, `LexiSignals.tsx`, `LexiExecutionMonitor.tsx` | local state only |

## 3. Facts (verified)

| Fact | Evidence |
|---|---|
| The gateway routes `/lexie/intelligence/**` to intelligence-service | `gateway-service.yml:155-160` |
| `POST /api/v1/analytical/run` and `POST /api/v1/analytical/batch/apply?surface=` | `intelligence-service/.../analytical/controller/AnalyticalRunController.java:33,46` |
| **`X-Client-Id` and `X-User-Id` are required** (400 without them). `X-User-Functions` and `X-User-Entitlements` are optional | same file, lines 35-38, 48-50 |
| Batch apply **only applies on `surface=CORE`**. frontend-service is Core, so it sends `CORE` | `AnalyticalRunCoordinatorImpl.java:181` |
| Responses use the `ApiResponse` envelope `{success, data}` with a snake_case payload; requests are snake_case | `intelligence-ui/src/shell/featureClient.ts` (`toSnakeKeys`, `unwrap`) |

## 3a. Verified prerequisites (re-analysis 2026-10-04)

Shared items: see `FrontendService_Variance_via_IntelligenceService_Plan.md` §3 (V1–V6). Analytical-specific findings:

| # | Finding | Evidence | Impact on this plan |
|---|---|---|---|
| AN1 | **Global SNAKE_CASE, unknown keys ignored.** A camelCase key is **silently dropped** (for example `targetReportId` would turn an anchored ask into a plain one) | intelligence-ui `shell/wireCase.ts` (`JacksonConfig`) | Build every body with snake_case keys |
| AN2 | OPA readiness: `catalog_ready=true` (`run` allowed), `handoff_ready=true` (`apply_batch` allowed), **`report_store_ready=false`** (`search_report_store` denied), and `kg_ready`, `derive_ready`, `parameter_default_ready` true | `opa/data/lextr/ai/analytical/data.json`; `tool_scope_analytical.rego:92-135` | A1 works. Matches come from the catalog only; report-store search is refused, so render any refusal verbatim |
| AN3 | **frontend-service's Analytics screen has no Core report id or builder version.** It has only dataset and query configs (`IQueryPayload`: `dataset_name`, `restatement_version`, `period`, `client_id`) | `features/analytics/interfaces/index.ts:21-31`, `services/analytics.api.ts` | **A2 (anchored refine) and A3 (batch apply) are blocked.** Ship A1 only; A2/A3 need a report id and version from Core's report builder first (follow-up) |
| AN4 | `X-User-Entitlements` is optional and only matters for instance asks; we send `is_instance_ask:false` | `AnalyticalRunController.java:38`; `tool_scope_analytical.rego` (`instance_entitlement_missing`) | Not needed for A1 |
| AN5 | `IQueryPayload.client_id` exists in Analytics | `interfaces/index.ts:30` | Must match `X-Client-Id`: use the same source (default `"1"`) |

**Delivery split:**
- **Phase 1:** A1 (search/ask) replaces the mock.
- **Phase 2:** A2 and A3, once the Analytics screen exposes a Core report id and version.

## 4. API mapping

Base: `SERVICE_PREFIX.INTELLIGENCE` (`/lexie/intelligence/`)

| # | User action (frontend-service) | Replaces | Method + path | Request (wire, snake_case) | intelligence-ui equivalent |
|---|---|---|---|---|---|
| A1 | Search / ask (debounced text, chip click) | mock `setTimeout` + "exposure" keyword | `POST api/v1/analytical/run` | `{query}` | `runAnalytical(query)` |
| A2 | "Refine" an existing report (anchored ask) | mock `handleRefine` | `POST api/v1/analytical/run` | `{query, target_report_id, against_version}` | `runAnalytical(query, {targetReportId, againstVersion})` |
| A3 | Accept or reject the proposed operations, then "Build/Apply" | mock `handleRun` job | `POST api/v1/analytical/batch/apply?surface=CORE` | `{batch_id, target_report_id, against_version, current_core_version, operations:[{op_name, target_field, value, is_grounded, status, is_correction}], origin:"ASSIST", is_instance_ask:false}` | `applyAnalyticalBatch(batch, "CORE")` |

### 4.1 Response → UI state mapping (replaces `ResultType`)

| A1/A2 response field (snake_case) | frontend-service rendering |
|---|---|
| `catalog_state` / `status` = not ready, plus `narrative` | Show the reason verbatim (replaces the empty or guided state) |
| `matches[]` (non-empty) | "Best matches" list (replaces `'best-matches'`) |
| `construction_proposal` | "Guided build" view (replaces `'guided'`) |
| `operation_batch` (anchored ask) + `batch_rejections`, `batch_refusal` | Per-operation accept/reject list, then A3 |
| `route_out_uc` | "This question belongs to UC‹n›" hint, rendered verbatim |
| A3 `applied_count`, `rejected_count`, `omitted_count`, `stale`, `resulting_core_version` | Apply receipt (replaces the fake `'execution-started'` job). If `stale`, prompt a refresh and re-ask |

Running the built report itself stays with the existing Core analytics APIs (`ANALYTICS.*`, adhoc reports). The assist does not fetch values.

## 5. Identity headers

Shared: reuse `getIntelligenceIdentityHeaders()` from the Variance plan (§4). **Required here.**

## 6. Change list

| # | File | Change |
|---|---|---|
| C1 | `shared-ui/constants/index.ts` | `SERVICE_PREFIX.INTELLIGENCE` (**skip if present**) |
| C2 | identity and intelligence http instance | **Reuse if present**, otherwise create as in the Variance plan |
| C3 | `shared-ui/constants/apiEndpoints.ts` | `INTELLIGENCE_ANALYTICAL: { RUN: "api/v1/analytical/run", BATCH_APPLY: "api/v1/analytical/batch/apply" }` |
| C4 | `shared-ui/services/intelligenceAnalyticalApi.ts` (new) | `runAnalytical(query, anchor?)` → A1/A2; `applyBatch(batch)` → A3 with `surface=CORE`. Convert to snake_case and unwrap `ApiResponse` |
| C5 | `features/analytics/hooks/useAnalyticalAssist.ts` (new) | Mutations for run and apply, with debounce kept from `LexiAssist` |
| C6 | `features/analytics/components/LexiAssist.tsx` | Remove the mock timers and keyword logic; drive state from C5. Replace `ResultType` with the response-driven states in §4.1 |
| C7 | `features/analytics/components/LexiResults.tsx` (+ `types/types.ts`) | Render `matches`, `construction_proposal`, `operation_batch` (accept/reject per op), `narrative`/refusal and the apply receipt |
| C8 | `LexiExecutionMonitor.tsx` | Show real apply receipts (run id, counts, status) instead of fake jobs |

Out of scope: the Core analytics data APIs, the Analytics dashboard and query builder, inline Ask-Lexie answers, and backend changes.

## 7. Validation

- `tsc --noEmit` and lint pass on frontend-service.
- `grep -n "setTimeout" features/analytics/components/LexiAssist.tsx`: matches only remain for the input debounce.
- Manual check:
  - A free-text ask shows `POST /lexie/intelligence/api/v1/analytical/run` with the headers, and matches or a proposal render.
  - An anchored refine returns an `operation_batch`. Accepting or rejecting ops and applying shows `POST …/batch/apply?surface=CORE` and a receipt with counts.
  - With the catalog not ready, the narrative reason is shown verbatim.

## 8. Risks

| Risk | Mitigation |
|---|---|
| Anchored refine needs `target_report_id` and `against_version` from Core's report builder | **Confirmed missing** (AN3). Phase 1 ships A1 only; A2/A3 are Phase 2 |
| camelCase key silently dropped (AN1) | One snake_case body builder |
| Stale batch (`stale: true`) | Re-run A2 with the new `resulting_core_version` |
| snake/camel mismatch | One conversion helper; read the response with snake_case keys |

---

## 9. Implementation prompt

```text
TASK: Replace the mocked "Lexie Analytics Assist" in frontend-service's Analytics screen with real
intelligence-service calls, exactly as intelligence-ui's Analytical Assist (UC10) does.

REPO: lextr/typescript/frontend-service (change only this repo)
SPEC: utils/prompts-library/Lextr_Intelligence_Final_Package/plan/FrontendService_Analytical_Assist_via_IntelligenceService_Plan.md
REFERENCE (read-only): lextrai/intelligence-ui/src/features/analytical/
  (analyticalApi.ts, types.ts, mountContract.ts, components/AnalyticalWorkspace.tsx)

ROUTING / WIRE
- Prefix SERVICE_PREFIX.INTELLIGENCE = "/lexie/intelligence/" (reuse if it exists).
- REQUIRED headers X-Client-Id, X-User-Id via getIntelligenceIdentityHeaders() (reuse if it exists).
  Identity source: <<CHOOSE: A = Keycloak claims | B = env VITE_LEXTR_CLIENT_ID / VITE_LEXTR_PRINCIPAL>> (default B).
- Requests are snake_case JSON; responses are ApiResponse {success, data} with snake_case data.

STEPS
1. Ensure the prefix, intelligence http instance and identity headers exist (shared with Variance).
2. API_ENDPOINTS.INTELLIGENCE_ANALYTICAL = { RUN: "api/v1/analytical/run",
   BATCH_APPLY: "api/v1/analytical/batch/apply" }.
3. New shared-ui/services/intelligenceAnalyticalApi.ts:
   runAnalytical(query, anchor?) -> POST RUN body {query} or
     {query, target_report_id, against_version}
   applyBatch(batch) -> POST BATCH_APPLY?surface=CORE body
     {batch_id, target_report_id, against_version, current_core_version,
      operations:[{op_name, target_field, value, is_grounded, status, is_correction}],
      origin:"ASSIST", is_instance_ask:false}
4. New features/analytics/hooks/useAnalyticalAssist.ts (useMutation for both; keep the
   existing input debounce).
5. features/analytics/components/LexiAssist.tsx: remove the mock setTimeout results, the
   "exposure" keyword branching and the fake jobs; drive state from the hook.
6. LexiResults.tsx and types/types.ts: replace ResultType with response-driven rendering:
   matches -> best matches; construction_proposal -> guided build; operation_batch ->
   per-op accept/reject + Apply (A3); narrative / batch_refusal / batch_rejections /
   route_out_uc -> shown verbatim; apply receipt (applied/rejected/omitted counts, stale,
   resulting_core_version) -> LexiExecutionMonitor.
7. PHASE 1 ONLY: the Analytics screen has no Core report id/version (verified), so implement
   applyBatch and the anchored runAnalytical signature in the service, but keep the Refine and
   Apply UI disabled ("needs a report from the builder") and report this as not done.
   construction_proposal and matches render fully.

WIRE NOTE: intelligence-service is global SNAKE_CASE and IGNORES unknown keys. A camelCase key is
silently dropped. Use the same client id source for X-Client-Id as IQueryPayload.client_id.

DO NOT
- Change the Core analytics data APIs (ANALYTICS.*, adhoc-reports, clickhouse), the dashboard or
  the query builder.
- Fetch or display report values from the assist.
- Touch intelligence-service, lexie-ai, gateway or config-service.
- Add dependencies, refactor unrelated code, commit or push.

VALIDATE
- tsc --noEmit and lint on frontend-service.
- Report: files changed, validation run and its result, and whether anchored refine (A2/A3) is
  wired or blocked on missing report id/version.
```
