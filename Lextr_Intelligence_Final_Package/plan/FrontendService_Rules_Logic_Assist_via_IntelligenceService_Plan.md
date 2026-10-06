# frontend-service Rules & Logic Assist (UC11) → intelligence-service: Integration Plan

**Status:** PLANNED
**Repo to change:** `lextr/typescript/frontend-service` only
**Where it lives:** the **individual rule edit screen**. A rule opens as a tab (`rule::<id>`) in `features/rules/RulesWorkspace.tsx` → `components/RuleDetailTabs.tsx` (tabs Graph, Expression, Rule Lineage, Rule Map, Execution).
**Reference implementation:** `lextrai/intelligence-ui/src/features/rules/` (`rulesApi.ts`, `types.ts`, `mountContract.ts`, `panelModel.ts`, `components/RulesAssistWorkspace.tsx`, `components/RulePicker.tsx`)
**Sibling plans:** `FrontendService_Variance_via_IntelligenceService_Plan.md` (shared routing and identity work)

---

## 1. Goal

Add the **Rules copilot** beside frontend-service's rule edit form, calling intelligence-service exactly as intelligence-ui does. Per the intelligence-ui contract, the copilot returns **checks and structural patches, never the rule or its approval**. Core keeps owning rule save and approval.

```
FUTURE  frontend-service (rule edit tab) ──/lexie/intelligence/api/intelligence/rules/*─▶ gateway ──▶ intelligence-service ──▶ lexie-ai POST /run (UC11), GET /rules/*
                                            + X-Client-Id, X-User-Id                        (RulesAssistCoordinator)
```

## 2. Current frontend-service lexie usage in Rules (what changes and what doesn't)

| Today | File | API (direct lexie, `/lexie/ai/`) | intelligence-service equivalent? | Plan |
|---|---|---|---|---|
| Rule documentation summary | `features/rules/components/RuleDocumentation.tsx:59` → `lexieApi.fetchRuleSummaryV2` | `POST api/v1/chatbot/ai/rule-summary` | **None** | **Keep on lexie** for now (no proxy exists) |
| MDRM recommendation in Rule Map | `features/rules/components/RuleMapTab.tsx:316` → `ruleApi.fetchMdrmRecommendation` | `POST api/v1/chatbot/ai/mdrm/recommend` | **None** | **Keep on lexie** for now |
| Global Ask-AI query → expression | `shared-ui/components/ui-components/AskAi.tsx:387` | `POST api/v1/chatbot/ai/query` | **None** | Out of scope (global, not rules-specific) |
| Rules copilot (checks and patches while editing) | none | — | `POST /api/intelligence/rules/assist` | **New** (this plan) |
| Rule detail, siblings and MDRM instruction as lexie translated them | none | — | `GET /api/intelligence/rules/{ruleRef}`, `/siblings`, `/instruction` | **New** (copilot side panel) |

To move the three `chatbot/ai/*` calls behind intelligence-service, intelligence-service first needs new proxy endpoints. That's a backend change, listed in §9 as follow-up.

## 3. Facts (verified)

| Fact | Evidence |
|---|---|
| The gateway routes `/lexie/intelligence/**` to intelligence-service (prefix stripped), so the browser path is `/lexie/intelligence/api/intelligence/rules/...` | `gateway-service.yml:155-160` |
| Controller base `/api/intelligence/rules` with: `POST /assist`, `POST /runs/{runId}/acceptance?surface=`, `GET /sessions/{sessionRef}/runs`, `GET /catalog`, `GET /{ruleRef}`, `GET /{ruleRef}/siblings`, `GET /{ruleRef}/instruction` | `intelligence-service/.../rules/controller/RulesAssistController.java` |
| `/assist`, `/acceptance` and `/sessions/*/runs` **require** `X-Client-Id` and `X-User-Id`; catalog and rule reads declare them optional (send them anyway) | same file, lines 51-98 |
| Acceptance is **only recorded on `surface=CORE`**. frontend-service is Core, so it sends `CORE` | `RulesAssistCoordinator.java:155` |
| Assist request (wire, snake_case): `{entry_state, rule, authoring_session_ref, work_begun, draft_provenance, rule_ref?, invocation_origin?, correlation_id?, locale?}`. `rule` is an opaque map, sent verbatim | `RulesAssistCoordinator.AssistRequest` (line 51); `intelligence-ui rulesApi.assistRules` |
| `entry_state` ∈ `author \| assist \| revise \| review` | `intelligence-ui/src/features/rules/types.ts:3` |
| Outcome: `{status: COMPLETED\|REFUSED, refusal_code, refusal_reason, result:{run_id, status, steps[], output:{output_type, extra_fields}}, persisted}`. `extra_fields` is the skill's render model, read verbatim | `types.ts:168` |
| Acceptance body: `{accepted_rule_ref, accepted_rule_version}` | `RulesAssistController.AcceptanceRequest` (line 48) |
| Responses use the `ApiResponse` envelope `{success, data}` with snake_case data | `intelligence-ui/src/shell/featureClient.ts` |

## 3a. Verified prerequisites (re-analysis 2026-10-04)

Shared items: see `FrontendService_Variance_via_IntelligenceService_Plan.md` §3 (V1–V6). Rules-specific findings:

| # | Finding | Evidence | Impact on this plan |
|---|---|---|---|
| RU1 | **`ruleRef` is Core's numeric rule id.** Anything else is a 400 before the request reaches lexie | `RulesAssistController.java` (javadoc at line ~119) | `rule_ref` = `RuleTab.ruleId` (as a string). **No catalog lookup (R7) needed.** A new rule (`ruleId == null`) sends no `rule_ref` and skips R2–R4 |
| RU2 | **Global SNAKE_CASE, unknown keys ignored.** `AssistRequest` is a plain record, so a camelCase key is **silently dropped** | `RulesAssistCoordinator.java:51`; intelligence-ui `shell/wireCase.ts` | Use snake_case top-level keys; the `rule` map is sent unchanged |
| RU3 | OPA readiness: `instruction_ready=true` (R4 works), `rule_store_ready=true`, **`catalog_ready=false`**, which denies `rules.get_catalog` **and `rules.compose_predicate`** | `opa/data/lextr/ai/rules/data.json`; `tool_scope_rules.rego:5,61-81` | R7 is not used. The copilot **can't compose predicate patches** today: expect findings and checks, but few or no structural patch suggestions. Render the refusal or absence honestly |
| RU4 | lexie's rules routes return 400 without `X-Client-Id`/`X-User-Id`, even where intelligence-service marks them optional | `lexie-ai/routes/rules_routers.py:50,91` | Send the identity headers on every call (R1–R6) |
| RU5 | `rules.draft` is refused with `REVIEW_IS_DETERMINISTIC` in review | `tool_scope_rules.rego:87-94` | `entry_state:"review"` (read-only rule) gives checks only; the copilot doesn't draft |

## 4. API mapping: rule edit screen

Base: `SERVICE_PREFIX.INTELLIGENCE` (`/lexie/intelligence/`)

| # | When (rule edit tab) | Method + path | Request | intelligence-ui equivalent |
|---|---|---|---|---|
| R1 | Panel opens / "Check rule" / after a significant edit (debounced) | `POST api/intelligence/rules/assist` | `{entry_state, rule, authoring_session_ref, work_begun, draft_provenance:"typed", rule_ref?}` | `assistRules(entryState, core, arrived, ruleRef)` |
| R2 | Panel: rule as lexie read it (predicates, target line) | `GET api/intelligence/rules/{ruleRef}` | — | `getRule` |
| R3 | Panel: related rules (share an input or target line) | `GET api/intelligence/rules/{ruleRef}/siblings` | — | `getRuleSiblings` |
| R4 | Panel: target-line MDRM instruction (clauses) | `GET api/intelligence/rules/{ruleRef}/instruction` | — | `getRuleInstruction` |
| R5 | After Core saves or approves a version the copilot advised on | `POST api/intelligence/rules/runs/{runId}/acceptance?surface=CORE` | `{accepted_rule_ref, accepted_rule_version}` | (service-only; intelligence-ui doesn't call it, because Core owns approval) |
| R6 | Optional: history of copilot runs for this editing session | `GET api/intelligence/rules/sessions/{authoringSessionRef}/runs` | — | (service-only) |
| R7 | **Not used.** `ruleRef` = numeric `ruleId` (RU1), and the catalog is OPA-gated off (RU3) | `GET api/intelligence/rules/catalog` | — | `listRules` (`RulePicker.tsx`) |

### 4.1 Field mapping: frontend-service rule tab → assist request

| Wire field | frontend-service source | Notes |
|---|---|---|
| `entry_state` | `isNew` → `"author"`; `isEditable` → `"revise"`; read-only (`!isEditable`) → `"review"`; explicit "Ask copilot" → `"assist"` | from `RuleTab` (`store/rules.slice.ts:45`) and `selectIsEditableByTabId` |
| `rule` | `serializeRuleGraph(editor)` (`features/rules/utils/ruleGraph.ts:589`): the rule_json Core saves | opaque: do not convert its keys |
| `authoring_session_ref` | the stable tab id (`rule::<id>`) plus an open timestamp, kept for the life of the tab | must stay stable across R1 calls in one edit session |
| `work_begun` | `true` once the editor is dirty | |
| `draft_provenance` | `"typed"` (`"lexie_handoff"` only if the rule came from Lexie) | |
| `rule_ref` | `String(RuleTab.ruleId)` for an existing rule; omitted when `ruleId` is null (new rule) | **Verified** (RU1): Core's numeric rule id |

## 5. Identity headers

Shared: reuse `getIntelligenceIdentityHeaders()` from the Variance plan (§4). **Required for R1, R5 and R6.**

## 6. Change list

| # | File | Change |
|---|---|---|
| C1 | `shared-ui/constants/index.ts` | `SERVICE_PREFIX.INTELLIGENCE` (**skip if present**) |
| C2 | identity and intelligence http instance | **Reuse if present**, otherwise create as in the Variance plan |
| C3 | `shared-ui/constants/apiEndpoints.ts` | `INTELLIGENCE_RULES: { ASSIST: "api/intelligence/rules/assist", CATALOG: "api/intelligence/rules/catalog", RULE: "api/intelligence/rules/{ruleRef}", SIBLINGS: "api/intelligence/rules/{ruleRef}/siblings", INSTRUCTION: "api/intelligence/rules/{ruleRef}/instruction", ACCEPTANCE: "api/intelligence/rules/runs/{runId}/acceptance", SESSION_RUNS: "api/intelligence/rules/sessions/{sessionRef}/runs" }` |
| C4 | `shared-ui/services/intelligenceRulesApi.ts` (new) | One method per R1–R7. Requests in snake_case **except** `rule` (opaque); unwrap `ApiResponse`; leave `extra_fields` keys verbatim. Encode `ruleRef` with `encodeURIComponent` |
| C5 | `features/rules/hooks/useRulesAssist.ts` (new) | Debounced R1 mutation keyed by `tabId`; queries for R2–R4 when `ruleId` is set (`ruleRef = String(ruleId)`, RU1). No R7 |
| C6 | `features/rules/components/RulesAssistPanel.tsx` (new) | Side panel rendering, following intelligence-ui `RulesAssistWorkspace` / `panelModel.ts`: check verdicts (APPLICABLE / NOT_APPLICABLE / UNAVAILABLE, passed, findings with PROVEN / POSSIBLE certainty), structural patch suggestions from `extra_fields`, instruction clauses, siblings, and the refusal reason verbatim |
| C7 | `features/rules/components/RuleDetailTabs.tsx` | Mount `RulesAssistPanel` beside the tab content on the individual rule edit tab (toggle button; collapsed by default). Pass `tabId`, `RuleTab` and the editor state. Patches are **shown, not auto-applied**; "Apply patch" only edits the local editor state, and the user still saves through Core |
| C8 | Core save / approve flow (`RuleWorkFlowActions.tsx` / `RuleToolbar.tsx`) | After a successful save or approve, if a copilot `run_id` exists for this tab, fire R5 with `{accepted_rule_ref, accepted_rule_version}` (fire-and-forget; log failures) |

Out of scope: `RuleDocumentation` (`chatbot/ai/rule-summary`), `RuleMapTab` MDRM recommend, global `AskAi`, rule save and approval APIs, and backend changes.

## 7. Validation

- `tsc --noEmit` and lint pass on frontend-service.
- Manual check, opening an existing rule in edit mode:
  - The panel shows `POST /lexie/intelligence/api/intelligence/rules/assist` with `X-Client-Id` and `X-User-Id`, `entry_state:"revise"`, and the rule JSON unchanged.
  - Checks and findings render.
  - Siblings and instruction load for a resolved `ruleRef`.
- A new rule sends `entry_state:"author"` with no `rule_ref`.
- A read-only rule sends `entry_state:"review"`.
- Save or approve after a copilot run triggers `POST …/runs/{runId}/acceptance?surface=CORE`.
- A REFUSED outcome shows `refusal_code` and `refusal_reason` verbatim.
- Existing Rules behaviour (save, approve, documentation, rule map, lineage, execution) is unchanged.

## 8. Risks

| Risk | Mitigation |
|---|---|
| A non-numeric `ruleRef` returns 400 | Always use `ruleId` (RU1); never `ruleName` |
| No patch suggestions while `catalog_ready=false` | Expected (RU3). Show checks and findings; enabling it is a deployment change in OPA `rules/data.json`, not frontend work |
| The `rule` map gets key-converted to snake_case and breaks lexie's reading | Mark `rule` as opaque in the converter; send `serializeRuleGraph` output unchanged |
| Too many R1 calls while typing | Debounce (≥1s) plus an explicit "Check rule" button |
| A patch is applied without review | Patches only update local editor state on click; Core save stays the only persistence path |

## 9. Follow-up (backend, separate plan)

Add intelligence-service proxies so the remaining direct lexie calls can move too: `POST /api/v1/chatbot/ai/rule-summary`, `POST /api/v1/chatbot/ai/mdrm/recommend` (and `query` for AskAi). Then switch `RuleDocumentation.tsx` and `RuleMapTab.tsx` to `/lexie/intelligence/`.

---

## 10. Implementation prompt

```text
TASK: Add the Rules & Logic Assist copilot (UC11) to frontend-service's INDIVIDUAL RULE EDIT
screen (RuleDetailTabs), calling intelligence-service exactly as intelligence-ui does. The copilot
returns checks and patch suggestions only. Core keeps owning save and approval.

REPO: lextr/typescript/frontend-service (change only this repo)
SPEC: utils/prompts-library/Lextr_Intelligence_Final_Package/plan/FrontendService_Rules_Logic_Assist_via_IntelligenceService_Plan.md
REFERENCE (read-only): lextrai/intelligence-ui/src/features/rules/
  (rulesApi.ts, types.ts, panelModel.ts, renderModel.ts, components/RulesAssistWorkspace.tsx,
   components/RulePicker.tsx)

ROUTING / WIRE
- Prefix SERVICE_PREFIX.INTELLIGENCE = "/lexie/intelligence/" (reuse if it exists). Browser paths
  become /lexie/intelligence/api/intelligence/rules/...
- REQUIRED headers X-Client-Id, X-User-Id via getIntelligenceIdentityHeaders() (reuse if it exists).
  Identity source: <<CHOOSE: A = Keycloak claims | B = env VITE_LEXTR_CLIENT_ID / VITE_LEXTR_PRINCIPAL>> (default B).
- Requests are snake_case JSON EXCEPT the opaque `rule` map (send verbatim). Responses are
  ApiResponse {success, data}, snake_case; output.extra_fields is read verbatim.

STEPS
1. Ensure the prefix, intelligence http instance and identity headers exist (shared with Variance).
2. API_ENDPOINTS.INTELLIGENCE_RULES = {
     ASSIST: "api/intelligence/rules/assist",
     CATALOG: "api/intelligence/rules/catalog",
     RULE: "api/intelligence/rules/{ruleRef}",
     SIBLINGS: "api/intelligence/rules/{ruleRef}/siblings",
     INSTRUCTION: "api/intelligence/rules/{ruleRef}/instruction",
     ACCEPTANCE: "api/intelligence/rules/runs/{runId}/acceptance",
     SESSION_RUNS: "api/intelligence/rules/sessions/{sessionRef}/runs" }
3. New shared-ui/services/intelligenceRulesApi.ts:
   assist({entry_state, rule, authoring_session_ref, work_begun, draft_provenance, rule_ref?})
   listCatalog({search?, rule_type?, status?, report?, period?, limit, offset})  (omit empty filters)
   getRule(ruleRef), getSiblings(ruleRef), getInstruction(ruleRef)   (encodeURIComponent ruleRef)
   recordAcceptance(runId, {accepted_rule_ref, accepted_rule_version}) -> POST ACCEPTANCE?surface=CORE
   getSessionRuns(sessionRef)
4. New features/rules/hooks/useRulesAssist.ts (per tabId):
   - entry_state: RuleTab.isNew -> "author"; editable -> "revise"; read-only -> "review".
   - rule = serializeRuleGraph(editor) from features/rules/utils/ruleGraph.ts (verbatim).
   - authoring_session_ref = stable per open tab (tabId + open timestamp).
   - work_begun = editor dirty; draft_provenance = "typed".
   - rule_ref = String(RuleTab.ruleId) (Core's numeric rule id; anything else is a 400).
     ruleId null (new rule) -> no rule_ref; skip R2-R4. Do NOT call listCatalog (the catalog is
     OPA-gated off: catalog_ready=false).
   - Expect few or no patch suggestions today (rules.compose_predicate is gated by
     catalog_ready=false). Render checks/findings and an honest "no suggestions" state.
   - Debounced (>=1s) assist mutation plus a manual "Check rule" trigger; queries for R2-R4.
5. New features/rules/components/RulesAssistPanel.tsx rendering, per intelligence-ui panelModel:
   check verdicts (applicability, passed, findings PROVEN/POSSIBLE), patch suggestions from
   extra_fields, instruction clauses, siblings, refusal_code/refusal_reason verbatim.
   "Apply patch" only updates the local editor state for this tab; it never saves.
6. features/rules/components/RuleDetailTabs.tsx: add a collapsible copilot side panel on the
   individual rule tab (collapsed by default) mounting RulesAssistPanel with tabId.
7. In the existing Core save/approve success path (RuleWorkFlowActions.tsx / RuleToolbar.tsx):
   if this tab has a copilot run_id, call recordAcceptance(run_id, {accepted_rule_ref,
   accepted_rule_version}) fire-and-forget; log failures. Do not block the save.

DO NOT
- Move RuleDocumentation (chatbot/ai/rule-summary), RuleMapTab MDRM recommend or global AskAi
  off lexie. No intelligence-service proxy exists for them (see plan §9).
- Change rule save/approve APIs or let the copilot save, approve or auto-apply patches.
- Touch intelligence-service, lexie-ai, gateway or config-service.
- Add dependencies, refactor unrelated code, commit or push.

VALIDATE
- tsc --noEmit and lint on frontend-service.
- Report: files changed, validation run and its result, how ruleRef was resolved (direct vs
  catalog), and anything not done.
```
