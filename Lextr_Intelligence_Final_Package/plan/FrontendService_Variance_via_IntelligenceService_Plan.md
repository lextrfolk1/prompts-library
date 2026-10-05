# frontend-service Variance "Explain" → intelligence-service: Integration Plan

**Status:** PLANNED (not started)
**Repo to change:** `lextr/typescript/frontend-service` only. No backend changes, unless identity option C is chosen (see §5).
**Reference implementation:** `lextrai/intelligence-ui/src/features/variance/` (`varianceApiClient.ts`, `varianceConsoleStore.ts`, `components/VarianceExplanationDrawer.tsx`)
**Related doc:** `Surface_Map_Drawer_API_Inventory.md` §2
**Phases:**
- **Phase 1 (§6):** a 1:1 swap of the 8 existing `lexieApi` variance calls. Behaviour, bodies, query params and UI stay the same.
- **Phase 2 (§7):** new APIs (entities, available cycles, detect, history) and fixes for P1–P3. Do Phase 1 first.

---

## 1. Goal and routing

On the Workbench report's **Variance** tab, each MDRM row has an **Explain Variance** button. Today it calls **lexie-ai directly**. In the new model it must call **intelligence-service**, using the same variance APIs that intelligence-ui already uses.

```
CURRENT (today)  frontend-service ──/lexie/ai/api/v1/variance/*──────────▶ gateway ──▶ lexie-ai

FUTURE (target)  frontend-service ──/lexie/intelligence/api/v1/variance/*─▶ gateway ──▶ intelligence-service ──▶ lexie-ai
                             + X-Client-Id, X-User-Id                          (LexieVarianceController, 1:1 pass-through)
```

## 2. What already exists (no work needed)

| Item | Evidence |
|---|---|
| Gateway route `/lexie/intelligence/**` → intelligence-service (path rewritten to `/**`) | `lextr/java/config-service/.../gateway-service.yml:155-160` |
| All variance endpoints proxied 1:1 to lexie-ai at the same path | `intelligence-service/.../variance/controller/LexieVarianceController.java` |
| The proxy passes lexie's HTTP status and body through unchanged, so the 404 "not explained yet" still arrives as a 404 | `LexieVarianceController.passThrough` (line ~398) |
| The proxy returns `502` with an "unavailable" body if lexie-ai can't be reached | `LexieVarianceController.java:393` |
| Proxy timeouts: 30s for reads, 120s for detect, analyze and regenerate | `LexieVarianceController.java:33-34` |
| Response shapes match what frontend-service parses today (byte pass-through) | No response mapping is needed |
| **`X-Client-Id` and `X-User-Id` are required; without them intelligence-service returns 400.** The gateway does not add them | `@RequestHeader` on every endpoint |

## 3. Verified prerequisites (re-analysis 2026-10-04): shared by all four frontend-service plans

The Impact, Analytical and Rules plans refer to this section.

| # | Finding | Evidence | Impact on this plan |
|---|---|---|---|
| V1 | `getHttpWithPrefix` already applies the Authorization interceptor and a default `x-user-id` header | `frontend-service/src/shared-ui/services/http.ts:57-68` | Build the intelligence instance with `getHttpWithPrefix`, so Authorization is kept |
| V2 | That `x-user-id` is **captured once when the instance is created** (module load). It falls back to `localStorage.userId`, then to `"lextradmin"` | `http.ts:15-18,64` | The identity interceptor must set `X-User-Id` **on every request** (overriding the frozen default). `getUserId` is not exported: export it or repeat the same lookup |
| V3 | frontend-service has **no client/tenant id** in the user store (`IUserState = {profile, token}`). Some code hardcodes `clientId: "1"` (`drilldown.slice.ts:31`); intelligence-ui uses `VITE_LEXTR_CLIENT_ID=1` | `shared-ui/interfaces/index.ts:160`; `intelligence-ui/.env` | Default identity option B: `X-Client-Id` = `import.meta.env.VITE_LEXTR_CLIENT_ID ?? "1"`. Add `VITE_LEXTR_CLIENT_ID` to the frontend-service `.env*` files |
| V4 | Gateway CORS allows all headers (`allowedHeaders: "*"`); the dev route for intelligence-service is `http://localhost:8059` | `gateway-service.yml:55-69`; `gateway-service-dev.yml:24-25` | No gateway change needed |
| V5 | Variance is a raw byte pass-through: no `ApiResponse` envelope, no OPA gate, and the response shape is identical to today's | `LexieVarianceController.passThrough` | No response mapping needed |
| V6 | The proxy keeps `Content-Type` but **drops `Content-Disposition`** | `LexieVarianceController.java:396-401` | The evidence-pack filename comes from the existing `fallbackFileName` (`${analysisId}_export.zip`, `AiExplainationDetails.tsx:~413`). Keep it |

Additional for the Phase 2 APIs:
- `lines/{mdrmId}/history`, `entities`, `cycles/available` and `detect` are 1:1 pass-throughs (`LexieVarianceController.java:45,53,68,208`), with no extra headers or gates.
- Analyzing a line runs detection itself, so detect is optional for Explain to work. It's needed only for the grid flags and to take `mdrm_id` from detection.

## 4. Current frontend-service flow

| Piece | File |
|---|---|
| Grid rows: `POST /workbench/table/variance`. **Stays as is** (not a lexie call) | `shared-ui/services/workBenchApi.ts` via `ReportTable.tsx` |
| "Explain Variance" cell button | `features/workbench/components/ReportTable.tsx:~631` |
| Drawer | `ExplainVarianceDrawer.tsx` → `AiExplainationDetails.tsx` |
| Hooks: `useCycle`, `useAnalysis`, `useAnalysisData`, `useVersions` | `features/workbench/hooks/useAnalysis.ts` |
| lexie calls (`lexAiHttp`, prefix `/lexie/ai/`) | `shared-ui/services/lexieApi.ts` |
| Endpoint constants | `shared-ui/constants/apiEndpoints.ts` → `API_ENDPOINTS.LEXAI.*` (variance keys) |

Problems in the current flow, fixed in Phase 2:
- **P1:** `runUntilNoActions` (`AiExplainationDetails.tsx:~360`) posts `available_actions[0]` in a loop, so it can approve without the user choosing. It sends no `comment`, `reason_code` or `edited_narrative`.
- **P2:** `legal_entity: "Citigroup"` is hardcoded (`useAnalysis.ts:44`).
- **P3:** The MDRM id is built as `${formName}.${taxonomyId}` instead of being taken from detection.

## 5. Decision required: identity headers

intelligence-service has no Spring Security or JWT check; it relies on `X-Client-Id` and `X-User-Id`. The gateway does not add them, and frontend-service currently sends only `Authorization` plus the frozen `x-user-id` (V2).

| Option | Source | Pros / cons |
|---|---|---|
| A | Keycloak token claims: `X-User-Id` from `preferred_username` (or `sub`); `X-Client-Id` from a tenant claim | Correct per user. Needs a tenant claim to exist in the token |
| **B (default for first cut)** | `X-Client-Id` = `VITE_LEXTR_CLIENT_ID ?? "1"`; `X-User-Id` = the `http.ts getUserId()` lookup, set per request (as intelligence-ui does in `shell/deploymentIdentity.ts`) | Fastest. One shared client id; the user id is only as good as `getUserId()` |
| C | Gateway filter derives the headers from the JWT | Cleanest. Backend change in gateway/config-service (config-service: local edits only, never commit) |

Header building lives in one function, `getIntelligenceIdentityHeaders()`, so switching options later is a one-file change.

---

## 6. Phase 1: 1:1 API replacement

### 6.1 Replacement table

The path after the prefix stays the same; only the prefix and the HTTP client change. Request bodies, query params and response shapes are unchanged.

| # | frontend-service method (`lexieApi`) | Endpoint key (current → new) | HTTP | Current URL | New URL | intelligence-ui equivalent |
|---|---|---|---|---|---|---|
| R1 | `fetchCycles` | `LEXAI.FETCH_CYCLES` → `INTELLIGENCE_VARIANCE.OPEN_CYCLE` | POST | `/lexie/ai/api/v1/variance/cycles` | `/lexie/intelligence/api/v1/variance/cycles` | `openCycle` |
| R2 | `fetchVarianceAnalysis` | `LEXAI.FETCH_VARIANCE_ANALYSIS` → `INTELLIGENCE_VARIANCE.LINE_ANALYSIS` | GET | `/lexie/ai/api/v1/variance/cycles/{cycle}/lines/{taxonomyId}/analysis` | `/lexie/intelligence/api/v1/variance/cycles/{cycle}/lines/{taxonomyId}/analysis` | `getLineAnalysis` |
| R3 | `fetchAnalysisFallback` | `LEXAI.FETCH_VARIANCE_ANALYSIS_FALLBACK` → `INTELLIGENCE_VARIANCE.ANALYZE_LINE` | POST | `/lexie/ai/api/v1/variance/cycles/{cycle}/analyze/{taxonomyId}?force=true` | `/lexie/intelligence/api/v1/variance/cycles/{cycle}/analyze/{taxonomyId}?force=true` | `analyzeLine` |
| R4 | `fetchVarianceAnalysisData` | `LEXAI.FETCH_VARIANCE_ANALYSIS_DATA` → `INTELLIGENCE_VARIANCE.ANALYSIS` | GET | `/lexie/ai/api/v1/variance/analyses/{analysisId}` | `/lexie/intelligence/api/v1/variance/analyses/{analysisId}` | `getAnalysis` |
| R5 | `fetchVersions` | `LEXAI.FETCH_VERSIONS` → `INTELLIGENCE_VARIANCE.ANALYSIS_VERSIONS` | GET | `/lexie/ai/api/v1/variance/analyses/{analysisId}/versions` | `/lexie/intelligence/api/v1/variance/analyses/{analysisId}/versions` | `getAnalysisVersions` |
| R6 | `reRunAnalysisWithInput` | `LEXAI.RERUN_ANALYSIS_WITH_INPUT` → `INTELLIGENCE_VARIANCE.REGENERATE_LINE` | POST | `/lexie/ai/api/v1/variance/cycles/{cycle}/regenerate/{taxonomyId}?guidance=` | `/lexie/intelligence/api/v1/variance/cycles/{cycle}/regenerate/{taxonomyId}?guidance=` | `regenerateLine` |
| R7 | `reviewActions` (empty action) | `LEXAI.REVIEW_ACTION` → `INTELLIGENCE_VARIANCE.REVIEW` | GET | `/lexie/ai/api/v1/variance/analyses/{analysisId}/review` | `/lexie/intelligence/api/v1/variance/analyses/{analysisId}/review` | `getReviewState` |
| R8 | `reviewActions` (with action) | `LEXAI.REVIEW_ACTION` → `INTELLIGENCE_VARIANCE.REVIEW` | POST | `/lexie/ai/api/v1/variance/analyses/{analysisId}/review` | `/lexie/intelligence/api/v1/variance/analyses/{analysisId}/review` | `reviewAnalysis` |
| R9 | `downloadEvidencePack` | `LEXAI.DOWNLOAD_EVIDENCE_PACK` → `INTELLIGENCE_VARIANCE.EVIDENCE_PACK` | GET (blob) | `/lexie/ai/api/v1/variance/audit/analyses/{analysisId}/export` | `/lexie/intelligence/api/v1/variance/audit/analyses/{analysisId}/export` | `exportAnalysis` |

### 6.2 Call sites

| File:line | Call | Replacement |
|---|---|---|
| `features/workbench/hooks/useAnalysis.ts:14` (`useAnalysis`) | `lexieApi.fetchVarianceAnalysis` | R2 |
| `features/workbench/hooks/useAnalysis.ts:17` (`useAnalysis`, 404 fallback) | `lexieApi.fetchAnalysisFallback` | R3 |
| `features/workbench/hooks/useAnalysis.ts:31` (`useAnalysisData`) | `lexieApi.fetchVarianceAnalysisData` | R4 |
| `features/workbench/hooks/useAnalysis.ts:52` (`useCycle`) | `lexieApi.fetchCycles` | R1 |
| `features/workbench/hooks/useAnalysis.ts:63` (`useVersions`) | `lexieApi.fetchVersions` | R5 |
| `features/workbench/hooks/useAnalysis.ts:78` (`useFallbackAnalysis`; no callers found) | `lexieApi.fetchAnalysisFallback` | R3 |
| `features/workbench/components/ReRunWithInput.tsx:25` | `lexieApi.reRunAnalysisWithInput` | R6 |
| `features/workbench/components/AiExplainationDetails.tsx:323` | `lexieApi.reviewActions` | R7 / R8 |
| `features/workbench/components/AiExplainationDetails.tsx:409` | `lexieApi.downloadEvidencePack` | R9 |

### 6.3 Steps

| # | File | Change |
|---|---|---|
| S1 | `shared-ui/constants/index.ts` | Add `SERVICE_PREFIX.INTELLIGENCE = "/lexie/intelligence/"` |
| S2 | `shared-ui/constants/apiEndpoints.ts` | Add an `INTELLIGENCE_VARIANCE` block (keys from §6.1). Remove the 8 variance keys from `LEXAI` |
| S3 | `shared-ui/services/intelligenceIdentity.ts` (new) | `getIntelligenceIdentityHeaders()` (option from §5), evaluated **per request** (V2). Option B: `X-Client-Id` = `VITE_LEXTR_CLIENT_ID ?? "1"`, `X-User-Id` = the `http.ts getUserId()` lookup (V3). Add `VITE_LEXTR_CLIENT_ID=1` to the frontend-service `.env*` files |
| S4 | `shared-ui/services/intelligenceVarianceApi.ts` (new) | `getHttpWithPrefix(SERVICE_PREFIX.INTELLIGENCE)` plus a request interceptor that adds the S3 headers. Move the 8 methods here unchanged (same names and signatures); only the endpoint keys change. No axios timeout below 120s |
| S5 | `shared-ui/services/lexieApi.ts` | Remove the 8 variance methods. Keep `fetchRuleSummaryV2` and everything else |
| S6 | Call sites in §6.2 | Change `lexieApi.<method>` to `intelligenceVarianceApi.<method>`. No logic changes |

Phase 1 does **not** change: the review loop, `legal_entity`, the MDRM id format or the UI.

---

## 7. Phase 2: full Explain flow (on top of Phase 1)

Base for every row: `SERVICE_PREFIX.INTELLIGENCE` (`/lexie/intelligence/`) + `api/v1/variance/...`. **New** marks APIs that Phase 1 doesn't add.

### 7.1 Tab load and Explain click

| # | When | Method + path (after the prefix) | intelligence-ui method | Phase 1 method / note |
|---|---|---|---|---|
| 1 | Variance tab load (once) | `GET api/v1/variance/entities` | `getEntities` | **New**; replaces hardcoded `legal_entity` (P2) |
| 2 | Variance tab load (once) | `GET api/v1/variance/cycles/available?report=&legal_entity=` | `getAvailableCycles` | **New** |
| 3 | Tab load or first Explain | `POST api/v1/variance/cycles` body `{report, period, legal_entity, restatement_version, comparison_basis:"AS_FILED"}` | `openCycle` | `fetchCycles` (R1) |
| 4 | After the cycle opens | `POST api/v1/variance/cycles/{cycleId}/detect?include_items=true` | `runDetection` | **New**; gives `mdrm_id` and tier per line, fixes P3 |
| 5 | **Explain click** | `GET api/v1/variance/cycles/{cycleId}/lines/{mdrmId}/analysis` (404 means not explained yet) | `getLineAnalysis` | `fetchVarianceAnalysis` (R2) |
| 6 | If step 5 returns 404 | `POST api/v1/variance/cycles/{cycleId}/analyze/{mdrmId}?force=true` | `analyzeLine` | `fetchAnalysisFallback` (R3) |
| 7 | Drawer opens | `GET api/v1/variance/analyses/{analysisId}` | `getAnalysis` | `fetchVarianceAnalysisData` (R4) |
| 8 | Drawer opens | `GET api/v1/variance/analyses/{analysisId}/versions` | `getAnalysisVersions` | `fetchVersions` (R5) |
| 9 | Drawer opens | `GET api/v1/variance/lines/{mdrmId}/history?report=&through_period=&limit=8` | `getLineHistory` | **New**; trend sparkline |

As in intelligence-ui, the drawer content renders only after steps 7–9 have all resolved.

### 7.2 Actions inside the drawer

| Action | Method + path | intelligence-ui method | Phase 1 method |
|---|---|---|---|
| Click a version | Steps 7–9 with that `analysisId` | `openVersion` | — |
| Re-run with my input | `POST api/v1/variance/cycles/{cycleId}/regenerate/{mdrmId}?guidance=` | `regenerateLine` | `reRunAnalysisWithInput` (R6) |
| Pre-check before any review action | `GET api/v1/variance/analyses/{analysisId}/review`. If `available_actions` includes `CLAIM`, then `POST …/review {action:"CLAIM"}` | `getReviewState` | `reviewActions` (R7); replaces the `runUntilNoActions` loop (P1) |
| Approve | `POST …/review {action:"APPROVE", comment}` | `reviewAnalysis` | `reviewActions` (R8) |
| Edit and approve | `POST …/review {action:"APPROVE_WITH_EDITS", edited_narrative, comment}` | `reviewAnalysis` | R8 |
| Reject | `POST …/review {action:"REJECT", reason_code, comment}` | `reviewAnalysis` | R8 |
| Needs info | `POST …/review {action:"NEEDS_INFO", comment}` | `reviewAnalysis` | R8 |
| Second approve | `POST …/review {action:"SECOND_APPROVE"}` | `reviewAnalysis` | R8 |
| After any review action | Steps 7–9 again | `showRecord` | — |
| Evidence pack | `GET api/v1/variance/audit/analyses/{analysisId}/export` (`responseType: blob`) | `exportAnalysis` | `downloadEvidencePack` (R9) |

`CLAIM` is needed before `APPROVE`, `APPROVE_WITH_EDITS`, `REJECT` and `NEEDS_INFO` (intelligence-ui `NEEDS_CLAIM`, `varianceConsoleStore.ts:39`).

### 7.3 Change list

| # | File | Change |
|---|---|---|
| C1 | `shared-ui/constants/apiEndpoints.ts` | Add `ENTITIES`, `AVAILABLE_CYCLES`, `DETECT`, `LINE_HISTORY` to `INTELLIGENCE_VARIANCE` |
| C2 | `shared-ui/services/intelligenceVarianceApi.ts` | Add `getEntities`, `getAvailableCycles`, `runDetection`, `getLineHistory`. Keep the Phase 1 methods and names |
| C3 | `features/workbench/hooks/useAnalysis.ts` | Add `useEntities`, `useAvailableCycles`, `useDetection`, `useLineHistory` and a review mutation. Replace the hardcoded `legal_entity` (P2) |
| C4 | `features/workbench/components/AiExplainationDetails.tsx` | Take the MDRM id from the detection item (P3). Replace `runUntilNoActions` with explicit buttons (P1, §7.2). Add the history sparkline |

Out of scope: the workbench grid API, `ruleApi.ts`, intelligence-service and lexie-ai code, Explain-all, cycle close/reopen, and threshold/model-config admin.

---

## 8. Validation

Both phases:
- `tsc --noEmit` and lint pass on frontend-service.
- `grep -rn "api/v1/variance" src`: matches appear only under `INTELLIGENCE_VARIANCE`.
- In devtools, every variance request goes to `/lexie/intelligence/...` and carries `X-Client-Id` and `X-User-Id`.

Phase 1:
- `grep -rnE "lexieApi\.(fetchCycles|fetchVersions|fetchVariance|fetchAnalysisFallback|reRunAnalysisWithInput|reviewActions|downloadEvidencePack)" src`: no matches.
- Manual check in the Variance tab: Explain works for a new line (404, then analyze) and an existing one; Re-run, review and evidence pack work.

Phase 2 (one FRY9C MDRM):
- Explain on a new line: 404, then analyze, then the drawer opens. Explain again: the existing analysis loads with no analyze call.
- Approve, Reject and Needs info each require an explicit click; nothing is approved automatically.
- With lexie-ai down, the drawer shows the 502 message instead of a blank state.

## 9. Risks

| Risk | Mitigation |
|---|---|
| Missing headers return 400 for every call | S3 is required, and §8 checks the headers |
| Analyze can take up to 120s | Keep the loading state, and don't set an axios timeout shorter than 120s on the intelligence instance |
| Identity option B attributes reviews to a shared client and a possibly stale user id | Note it as a known limitation, and move to A or C before production review use |
| Phase 1 keeps the `runUntilNoActions` auto-approve loop | Schedule Phase 2 soon after Phase 1 |
| Detection returns no item for a row (Phase 2) | Disable or hide Explain for that row. Lexie's analyze route also returns 404 "not detected in cycle", so show that message |

---

## 10. Implementation prompts

> Copy a block into a new session that has `lextr/typescript/frontend-service` and `lextrai/intelligence-ui` as working directories. Run Phase 1, then Phase 2.

### 10.1 Phase 1: 1:1 replacement

```text
TASK: Re-route frontend-service's Workbench Variance "Explain Variance" API calls from lexie-ai
(direct, /lexie/ai/) to intelligence-service (/lexie/intelligence/). This is a 1:1 swap:
same paths after the prefix, same bodies, query params and response handling.

REPO: lextr/typescript/frontend-service (change only this repo)
SPEC: utils/prompts-library/Lextr_Intelligence_Final_Package/plan/FrontendService_Variance_via_IntelligenceService_Plan.md
      (§3 prerequisites, §5 identity, §6 Phase 1)
REFERENCE (read-only): lextrai/intelligence-ui/src/features/variance/varianceApiClient.ts

ROUTING
- Gateway already routes /lexie/intelligence/** -> intelligence-service -> lexie-ai. No backend change.
- intelligence-service REQUIRES headers X-Client-Id and X-User-Id on every call (400 otherwise).
  Identity source: <<CHOOSE: A = Keycloak claims | B = env VITE_LEXTR_CLIENT_ID + getUserId()>>
  (default B).
  Default B, concretely: X-Client-Id = import.meta.env.VITE_LEXTR_CLIENT_ID ?? "1";
  X-User-Id = same lookup as shared-ui/services/http.ts getUserId() (authConfig.getUserId ->
  localStorage "userId" -> "lextradmin"); export getUserId from http.ts rather than duplicating it.
  Set both headers in a request interceptor (per request). getHttpWithPrefix's own "x-user-id"
  default is captured once at module load, so the interceptor must override it.
  Add VITE_LEXTR_CLIENT_ID=1 to frontend-service .env files.
- Build the instance with getHttpWithPrefix (it keeps the Authorization interceptor).
- intelligence-service drops Content-Disposition; keep downloadEvidencePack's fallbackFileName.

STEPS
S1 shared-ui/constants/index.ts: add SERVICE_PREFIX.INTELLIGENCE = "/lexie/intelligence/".
S2 shared-ui/constants/apiEndpoints.ts: add API_ENDPOINTS.INTELLIGENCE_VARIANCE:
     OPEN_CYCLE         "api/v1/variance/cycles"
     LINE_ANALYSIS      "api/v1/variance/cycles/{cycle}/lines/{taxonomyId}/analysis"
     ANALYZE_LINE       "api/v1/variance/cycles/{cycle}/analyze/{taxonomyId}?force=true"
     ANALYSIS           "api/v1/variance/analyses/{analysisId}"
     ANALYSIS_VERSIONS  "api/v1/variance/analyses/{analysisId}/versions"
     REGENERATE_LINE    "api/v1/variance/cycles/{cycle}/regenerate/{taxonomyId}"
     REVIEW             "api/v1/variance/analyses/{analysisId}/review"
     EVIDENCE_PACK      "api/v1/variance/audit/analyses/{analysisId}/export"
   Then remove the 8 variance keys from API_ENDPOINTS.LEXAI (FETCH_CYCLES, FETCH_VARIANCE_ANALYSIS,
   FETCH_VARIANCE_ANALYSIS_FALLBACK, FETCH_VARIANCE_ANALYSIS_DATA, FETCH_VERSIONS,
   RERUN_ANALYSIS_WITH_INPUT, REVIEW_ACTION, DOWNLOAD_EVIDENCE_PACK).
S3 New shared-ui/services/intelligenceIdentity.ts exporting getIntelligenceIdentityHeaders():
   returns { "X-Client-Id", "X-User-Id" } from the chosen identity source.
S4 New shared-ui/services/intelligenceVarianceApi.ts:
   - const intelligenceHttp = getHttpWithPrefix(SERVICE_PREFIX.INTELLIGENCE);
     add a request interceptor merging getIntelligenceIdentityHeaders(); no timeout < 120s.
   - Move these methods from lexieApi UNCHANGED in name, signature and buildUrl usage,
     switching only to intelligenceHttp + INTELLIGENCE_VARIANCE keys:
     fetchCycles, fetchVarianceAnalysis, fetchAnalysisFallback, fetchVarianceAnalysisData,
     fetchVersions, reRunAnalysisWithInput, reviewActions, downloadEvidencePack (keep blob).
   - export default intelligenceVarianceApi.
S5 shared-ui/services/lexieApi.ts: delete those 8 methods; keep fetchRuleSummaryV2 and the
   lexAiHttp export.
S6 Update call sites to intelligenceVarianceApi.<same method>:
     features/workbench/hooks/useAnalysis.ts:14,17,31,52,63,78
     features/workbench/components/ReRunWithInput.tsx:25
     features/workbench/components/AiExplainationDetails.tsx:323,409
   Import changes only. No logic changes.

DO NOT
- Change behaviour, the review loop, legal_entity, MDRM id format or UI (that is Phase 2).
- Add new APIs (entities, cycles/available, detect, history).
- Touch the workbench grid API, intelligence-service, lexie-ai, gateway or config-service.
- Add dependencies, refactor unrelated code, commit or push.

VALIDATE
- tsc --noEmit and lint on frontend-service.
- grep -rn "api/v1/variance" src -> only INTELLIGENCE_VARIANCE.
- grep -rnE "lexieApi\.(fetchCycles|fetchVersions|fetchVariance|fetchAnalysisFallback|reRunAnalysisWithInput|reviewActions|downloadEvidencePack)" src -> no matches.
- Report: files changed, validation run and its result, anything not done.
```

### 10.2 Phase 2: full Explain flow

```text
TASK: Extend frontend-service's Workbench Variance "Explain Variance" flow (already routed via
intelligence-service by Phase 1) with the remaining variance APIs intelligence-ui uses, and fix
the review auto-loop, the hardcoded legal entity and the MDRM id format.

PRECONDITION: Phase 1 is implemented (SERVICE_PREFIX.INTELLIGENCE, intelligenceIdentity.ts,
intelligenceVarianceApi.ts, API_ENDPOINTS.INTELLIGENCE_VARIANCE exist). If not, do Phase 1 first.

REPO: lextr/typescript/frontend-service (change only this repo)
SPEC: utils/prompts-library/Lextr_Intelligence_Final_Package/plan/FrontendService_Variance_via_IntelligenceService_Plan.md
      (§4 problems P1-P3, §7 Phase 2; follow it exactly)
REFERENCE (read-only): lextrai/intelligence-ui/src/features/variance/
    varianceApiClient.ts, varianceConsoleStore.ts, components/VarianceExplanationDrawer.tsx

DO
1. C1: add to API_ENDPOINTS.INTELLIGENCE_VARIANCE:
     ENTITIES          GET  api/v1/variance/entities
     AVAILABLE_CYCLES  GET  api/v1/variance/cycles/available
     DETECT            POST api/v1/variance/cycles/{cycle}/detect
     LINE_HISTORY      GET  api/v1/variance/lines/{mdrmId}/history
   Query params (include_items=true, report, legal_entity, through_period, limit=8) go via
   buildUrl's query argument, as the existing methods do.
2. C2: in shared-ui/services/intelligenceVarianceApi.ts add getEntities, getAvailableCycles,
   runDetection, getLineHistory. Keep the Phase 1 methods and their names.
3. C3: in features/workbench/hooks/useAnalysis.ts add useEntities, useAvailableCycles,
   useDetection(cycleId), useLineHistory(mdrmId, report, throughPeriod) and a review mutation.
   Replace the hardcoded legal_entity "Citigroup" with the selected/first entity from useEntities.
   Explain sequence: line analysis -> if 404 -> analyze(force=true) -> analysis + versions +
   history (render the drawer only when all three resolved).
4. C4: in features/workbench/components/AiExplainationDetails.tsx:
   - use the detection item's mdrm_id for the row (match by taxonomyId) instead of
     `${formName}.${taxonomyId}`; if no item, show lexie's "not detected" message.
   - DELETE runUntilNoActions. Review = GET review state -> if available_actions has "CLAIM" and
     action in {APPROVE, APPROVE_WITH_EDITS, REJECT, NEEDS_INFO} POST {action:"CLAIM"} ->
     POST the user's chosen action with its fields -> re-read analysis/versions/history.
     Buttons: Approve(comment), Edit & approve(edited_narrative, comment),
     Reject(reason_code, comment), Needs info(comment), Second approve.
   - add the history sparkline from getLineHistory (reuse an existing chart component if one
     exists; otherwise a minimal inline SVG).

DO NOT
- Change the workbench grid API (workBenchApi.fetchReportTableByType / table/variance).
- Touch intelligence-service, lexie-ai, gateway or config-service.
- Add dependencies. Refactor unrelated code. Commit or push.

VALIDATE
- tsc --noEmit and lint on frontend-service.
- grep -rn "api/v1/variance" src -> only under INTELLIGENCE_VARIANCE.
- grep -rn "runUntilNoActions\|Citigroup" src/features/workbench -> no matches.
- Report: files changed, what was validated, anything not done.
```
