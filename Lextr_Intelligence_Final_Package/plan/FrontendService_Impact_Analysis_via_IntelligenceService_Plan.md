# frontend-service Impact Analysis (UC2) → intelligence-service: Integration Plan

**Status:** PLANNED
**Repo to change:** `lextr/typescript/frontend-service` only
**Reference implementation:** `lextrai/intelligence-ui/src/features/impact/` (`impactApi.ts`, `components/ImpactWorkspace.tsx`, `components/ImpactSubjectGrid.tsx`, `types.ts`)
**Sibling plans:** `FrontendService_Variance_via_IntelligenceService_Plan.md` (shared routing and identity work)

---

## 1. Goal

Add Lexie's **Digital-Twin impact assessment** to frontend-service's adjustment flow, calling intelligence-service the same way intelligence-ui does.

```
FUTURE  frontend-service ──/lexie/intelligence/api/v1/impact/*─▶ gateway ──▶ intelligence-service ──▶ lexie-ai POST /run (UC2), GET /impact/subjects
                            + X-Client-Id, X-User-Id                         (ImpactRunCoordinator: persists the run, review and estate-ledger entry)
```

**Unlike Variance, this is not a 1:1 swap.** Today frontend-service makes **no lexie call for impact**:

| Today in frontend-service | API | Backend | Plan |
|---|---|---|---|
| Impacted lines on the adjustment screen (`ImpactedLines.tsx`, `useImpactedLines`) | `GET /rules/rules/fetch-impact-lines` (`UI_RULES.FETCH_IMPACT_ANALYSYS`) | rules-service (deterministic lineage) | **Keep, unchanged** |
| Bulk TSA impacted lines | `tsa/fetch-impacted-lines-for-file` | rules-service | **Keep, unchanged** |
| `RULES.SUBMIT_IMPACT_ANALYSIS` (`tsa/impact-analysis`) and the "Impact analysis in progress" websocket toasts in `App.tsx` | rules-service | rules-service | **Keep, unchanged** |
| Lexie Digital-Twin assessment (affected lines, edit-checks, Δ, honesty summary, evidence) | none | — | **New** (this plan) |

## 2. Facts (verified)

| Fact | Evidence |
|---|---|
| The gateway routes `/lexie/intelligence/**` to intelligence-service (prefix stripped) | `config-service/.../gateway-service.yml:155-160` |
| `POST /api/v1/impact/run?surface=` and `GET /api/v1/impact/subjects` | `intelligence-service/.../impact/controller/ImpactRunController.java:41,63` |
| Headers `X-Client-Id`, `X-User-Id` and `X-User-Functions` are declared optional, **but send them**: tenant scoping, the persisted run, review and the estate ledger use them | same file, lines 43-45, 65-67 |
| `entryPoint:"DRAWER"` is **refused unless `surface=CORE`** (`SURFACE_NOT_CORE`). frontend-service is Core, so it sends `surface=CORE` | `ImpactRunCoordinatorImpl.java:101` |
| Responses use the `ApiResponse` envelope `{success, data}` with a snake_case payload. intelligence-ui camelizes it in `featureClient.unwrap`; frontend-service must read snake_case or convert | `intelligence-ui/src/shell/featureClient.ts:34-43` |
| Request bodies go over the wire in snake_case (`toSnakeKeys`), except opaque maps (`initial_values`) | `featureClient.postJson` |
| intelligence-service calls lexie-ai `POST /run` and `GET /impact/subjects` | `lexie/client/LexieAiClient.java:38,53` |

## 2a. Verified prerequisites (re-analysis 2026-10-04)

Shared items: see `FrontendService_Variance_via_IntelligenceService_Plan.md` §3 (V1–V6). Impact-specific findings:

| # | Finding | Evidence | Impact on this plan |
|---|---|---|---|
| IM1 | **Global SNAKE_CASE, unknown keys ignored.** A camelCase request key is **silently dropped**, with no error | intelligence-ui `shell/wireCase.ts` header (`JacksonConfig`) | Every request key must be snake_case; only `initial_values` contents are verbatim |
| IM2 | lexie **requires** `adjustment_node_id`, `adjustment_report` and `delta_amount` | `lexie-ai/lexie_ai/run/dispatcher.py:313` | `delta_amount` must be a number (not null). Disable "Assess impact" until the adjustment value is entered |
| IM3 | Node refs are `taxonomy:<taxonomy_id>` (or an unprefixed taxonomy id matched exactly), and taxonomy ids are `FORM.<line>` | `lexie_ai/adapter/impact_ops.py:109-123` | `adjustment_node_id = ${formName}.${taxonomyId}`, the same format `ruleApi.fetchImpactAnalysis` already builds. **The subjects lookup (I2) is not needed** for the adjustment screen |
| IM4 | OPA readiness: `graph_ready=true`, **`cross_report_ready=false`**, **`evaluate_ready=false`** | `intelligence-service/.../opa/data/lextr/ai/impact/data.json`; `tool_scope_impact.rego:50-85` | Send `scope:"within_report"` only (cross_report is denied). Edit-check evaluation is denied, so render the edit-checks section as "unavailable" with the reason verbatim, not as "no breaks" |
| IM5 | `GET /impact/subjects`: intelligence-service marks the headers optional, but **lexie returns 400 without `X-Client-Id`/`X-User-Id`** | `lexie-ai/routes/impact_routers.py:47` | Always send the identity headers, including on I2 |
| IM6 | The `ApiResponse` envelope applies; a policy denial comes back as a refusal with a code and reason (for example `SURFACE_NOT_CORE`) | `ImpactRunController`, `ImpactRunCoordinatorImpl.java:101` | Unwrap `data`; render refusals verbatim |

## 3. API mapping

Base: `SERVICE_PREFIX.INTELLIGENCE` (`/lexie/intelligence/`)

| # | When (frontend-service) | Method + path | Request | intelligence-ui equivalent |
|---|---|---|---|---|
| I1 | "Assess impact" on the adjustment screen (`MakeAdjustment.tsx` / `ImpactedLines.tsx`) | `POST api/v1/impact/run?surface=CORE` | `{adjustment_node_id, adjustment_report, delta_amount, initial_values, scope, entry_point:"DRAWER"}` | `runImpact(adj, "DRAWER", surface)` |
| I2 | Optional: pick a subject to assess when the adjustment has no node id yet | `GET api/v1/impact/subjects?limit=&offset=&q=&kind=&report=` | query only; empty filters not sent | `listSubjects` (`ImpactSubjectGrid.tsx`) |
| I3 | "Open Evidence Ledger" from the impact result | `GET api/v1/runs/{runId}` | — | `EvidenceDrawer` (`RunDetailController`) |

### 3.1 Field mapping: frontend-service `IAdjustmentForm` → `CoreAdjustment`

| `CoreAdjustment` (wire key) | frontend-service source | Notes |
|---|---|---|
| `adjustment_node_id` | `${formName}.${taxonomyId}` | **Verified** (IM3): matches lexie's taxonomy id exactly. No I2 lookup needed |
| `adjustment_report` | active report `formName` | required (IM2) |
| `delta_amount` | `tsaValNum` (the adjustment amount) | **required**, numeric, not null (IM2) |
| `initial_values` | `{ [nodeId]: currentValue }` if the screen has the current line value; otherwise `null` | opaque map: keys sent verbatim |
| `scope` | `"within_report"` **only** | `cross_report` is denied by OPA (IM4) |
| `entry_point` | `"DRAWER"` | requires `surface=CORE` |

## 4. Identity headers

Shared with the Variance plan: reuse `getIntelligenceIdentityHeaders()` (§4 of the Variance plan). Note that `IAdjustmentForm.clientId` already exists in frontend-service, a candidate source for `X-Client-Id` under option A.

## 5. Change list

| # | File | Change |
|---|---|---|
| C1 | `shared-ui/constants/index.ts` | `SERVICE_PREFIX.INTELLIGENCE = "/lexie/intelligence/"` (**skip if it already exists** from the Variance work) |
| C2 | `shared-ui/services/intelligenceIdentity.ts` / the shared intelligence http instance | **Reuse if present**; otherwise create as in the Variance plan |
| C3 | `shared-ui/constants/apiEndpoints.ts` | Add `INTELLIGENCE_IMPACT: { RUN: "api/v1/impact/run", SUBJECTS: "api/v1/impact/subjects", RUN_DETAIL: "api/v1/runs/{runId}" }` |
| C4 | `shared-ui/services/intelligenceImpactApi.ts` (new) | `runImpact(adjustment, entryPoint)` → I1 with `surface=CORE`, a snake_case body and `ApiResponse` unwrapping; `listSubjects(query)` → I2; `getRun(runId)` → I3. No axios timeout shorter than the service's work timeout |
| C5 | `features/workbench/hooks/useImpactAssessment.ts` (new) | `useMutation` for I1; `useQuery` for I2 (only if subject picking is in scope) |
| C6 | `features/workbench/components/ImpactAssessmentDrawer.tsx` (new) | Render the I1 result like intelligence-ui's `ImpactWorkspace` render model: affected lines, edit-checks, Δ shown verbatim, honesty summary, and an empty state when there is no impact. Include an "Open Evidence Ledger" link (I3) |
| C7 | `features/workbench/components/MakeAdjustment.tsx` (and/or `ImpactedLines.tsx`) | Add an **"Assess impact (Lexie)"** button that builds the `CoreAdjustment` (§3.1) and opens C6. Leave the existing `ImpactedLines` grid untouched |

Out of scope: changing the rules-service impact APIs or websocket toasts, the inline Ask-Lexie impact answer, and any backend changes.

## 6. Validation

- `tsc --noEmit` and lint pass on frontend-service.
- Manual check:
  - Make an adjustment on one FRY9C line, then click "Assess impact". Devtools shows `POST /lexie/intelligence/api/v1/impact/run?surface=CORE` with `X-Client-Id` and `X-User-Id`.
  - The drawer renders affected lines and edit-checks.
  - A run id is returned, and "Open Evidence Ledger" loads `GET /lexie/intelligence/api/v1/runs/{runId}`.
- A refused or denied response (for example `SURFACE_NOT_CORE`, or an unknown node) shows its reason verbatim, not a blank drawer.
- The existing Impacted Lines grid and bulk TSA flow behave exactly as before.

## 7. Risks

| Risk | Mitigation |
|---|---|
| A taxonomy id not in lexie's graph | The run comes back refused or empty. Render the reason verbatim (IM3, IM6) |
| Edit-checks always unavailable while `evaluate_ready=false` | Show "edit-check evaluation unavailable" rather than "no breaks" (IM4). Enabling it is a deployment data change in OPA `impact/data.json`, not frontend work |
| camelCase key silently dropped | One snake_case builder for the body (IM1) |
| The snake/camel mismatch leaves fields blank | Use one helper to convert the request to snake_case and read the response with snake_case keys (or camelize once) |
| Users confuse two "impact" views | Label them "Impacted lines (lineage)" and "Lexie impact assessment" |

---

## 8. Implementation prompt

```text
TASK: Add Lexie's Digital-Twin impact assessment (UC2) to frontend-service's adjustment screen,
calling intelligence-service exactly as intelligence-ui does. Do NOT replace the existing
rules-service impacted-lines grid. This is an addition.

REPO: lextr/typescript/frontend-service (change only this repo)
SPEC: utils/prompts-library/Lextr_Intelligence_Final_Package/plan/FrontendService_Impact_Analysis_via_IntelligenceService_Plan.md
REFERENCE (read-only): lextrai/intelligence-ui/src/features/impact/ (impactApi.ts, types.ts,
  components/ImpactWorkspace.tsx, components/ImpactSubjectGrid.tsx, renderModel.ts)

ROUTING / WIRE
- Prefix: SERVICE_PREFIX.INTELLIGENCE = "/lexie/intelligence/" (reuse if it exists).
- Headers on every call: X-Client-Id, X-User-Id (and X-User-Functions if available) via
  getIntelligenceIdentityHeaders() (reuse if it exists; otherwise create per the Variance plan, §4).
  Identity source: <<CHOOSE: A = Keycloak/IAdjustmentForm.clientId | B = env VITE_LEXTR_CLIENT_ID / VITE_LEXTR_PRINCIPAL>> (default B).
- Requests are snake_case JSON, except opaque map initial_values (keys verbatim).
- Responses are ApiResponse {success, data}; data is snake_case. Unwrap data.

STEPS
1. C1/C2: ensure SERVICE_PREFIX.INTELLIGENCE, the intelligence http instance and identity headers exist.
2. C3: API_ENDPOINTS.INTELLIGENCE_IMPACT = { RUN: "api/v1/impact/run",
   SUBJECTS: "api/v1/impact/subjects", RUN_DETAIL: "api/v1/runs/{runId}" }.
3. C4: new shared-ui/services/intelligenceImpactApi.ts:
   runImpact(adj, entryPoint="DRAWER") -> POST RUN?surface=CORE body
     {adjustment_node_id, adjustment_report, delta_amount, initial_values, scope, entry_point}
   listSubjects({limit, offset, q?, kind?, report?}) -> GET SUBJECTS (omit empty filters)
   getRun(runId) -> GET RUN_DETAIL
4. C5: new features/workbench/hooks/useImpactAssessment.ts (useMutation for runImpact;
   useQuery for listSubjects, used only for node-id resolution).
5. C6: new features/workbench/components/ImpactAssessmentDrawer.tsx rendering the run result
   like intelligence-ui ImpactWorkspace (affected lines, edit-checks, delta verbatim, honesty
   summary, empty state, REFUSED/denied reason verbatim, "Open Evidence Ledger" -> getRun).
6. C7: in features/workbench/components/MakeAdjustment.tsx add an "Assess impact (Lexie)" button:
   build CoreAdjustment from the form:
     adjustment_node_id = `${formName}.${taxonomyId}`   (verified lexie taxonomy id format)
     adjustment_report  = active formName                 (required)
     delta_amount       = tsaValNum                       (required number; disable button until set)
     scope              = "within_report"                 (cross_report is OPA-denied)
     initial_values     = null unless the current value is known
   Then call runImpact and open the drawer. listSubjects is NOT needed here.
7. In the drawer, render edit-checks as "unavailable" with the verbatim reason when the run says
   evaluation was not performed (OPA evaluate_ready=false today), never as "no breaks".

WIRE NOTE: intelligence-service is global SNAKE_CASE and IGNORES unknown keys. A camelCase key is
silently dropped, so build the body with snake_case keys explicitly.
Send identity headers on EVERY call, including listSubjects: lexie returns 400 without them.

DO NOT
- Modify ImpactedLines.tsx behaviour, useImpactedLines, ruleApi impact calls, BulkTsaUpload or
  the App.tsx impact websocket toasts.
- Touch intelligence-service, lexie-ai, gateway or config-service.
- Add dependencies, refactor unrelated code, commit or push.

VALIDATE
- tsc --noEmit and lint on frontend-service.
- Report: files changed, validation run and its result, anything not done, and whether
  adjustment_node_id resolution needed the subjects lookup.
```
