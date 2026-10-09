# frontend-service Rules & Logic Assist (UC11) → intelligence-service: Integration Plan

**Status:** PLANNED (revised 2026-10-09 after a gap analysis of the JSX, intelligence-ui and the LP-25 prompts)
**Repo to change:** `lextr/typescript/frontend-service` (one small backend prerequisite is listed separately in §9)
**Where it lives:** the **individual rule edit screen**. A rule opens as a tab (`rule::<id>`) in `features/rules/RulesWorkspace.tsx` → `components/RuleDetailTabs.tsx` (tabs Graph, Expression, Rule Lineage, Rule Map, Execution).
**Reference implementation:** `lextrai/intelligence-ui/src/features/rules/` (`rulesApi.ts`, `types.ts`, `renderModel.ts`, `panelModel.ts`, `draftModel.ts`, `components/useRulesWorkspace.ts`, `components/{Understand,Build,Check,Compare}Tab.tsx`, `components/RulesAssistWorkspace.tsx`)
**Reference design:** `files/Lextr_Intelligence_UI_v1.38.0_FINAL.jsx` `RulesAssistWorkspace` (lines 4112–4818) and fixtures (lines 1826–1990)
**Spec prompts:** `prompts/wave_07/LP-25.3_PY.md` (skill), `LP-25.5_JAVA.md` (coordinator), `LP-25.6_TS.md` (embedded slice), `LP-25.8_TS.md` (four-tab panel), `LP-25.9_TS.md` (LexiAI entry point)
**Sibling plans:** `FrontendService_Variance_via_IntelligenceService_Plan.md` (shared routing and identity work, already built)

### What changed in this revision

| # | Change | Why |
|---|---|---|
| Δ1 | **The `rule` payload is the translated structure, not `serializeRuleGraph` output** | lexie reads `rule.predicates[{id, attribute, op, values}]`. It translates `rule_json` only when it loads the rule itself by `rule_ref` (`lexie_ai/adapter/rules_ops.py:133` `translate_rule`). Raw `rule_json` would arrive with no predicates, so every check would run on an empty rule. LP-25.3 says the same thing: "the draft arrives as STRUCTURE". |
| Δ2 | **`rule_kind` is required** | LP-25.3: "an arriving rule with no rule kind is REFUSED, never defaulted". The value is mapped from Core's rule type name (`report` → `reporting`, `data quality` → `data_quality`, `edit check` → `edit_check`; `rules_ops.py:48`). |
| Δ3 | Scope goes from a check-only panel to the **four-tab copilot** (Understand, Build, Check, Compare), with patches applied **to the graph editor** | The goal is to support authoring while the rule is being written. LP-25.8 is the spec, and intelligence-ui already implements it at JSX parity. |
| Δ4 | C1 and C2 are **already built**: `SERVICE_PREFIX.INTELLIGENCE`, `shared-ui/services/intelligenceHttp.ts`, `shared-ui/services/intelligenceIdentity.ts` | Delivered with the Variance plan |
| Δ5 | **Registration requests are not an intelligence-service feature** (decided 2026-10-09) | Registering an operand is the Semantic Layer's, approved by its steward in semantic-service's own task queue (`wkfl.workflow_task`). A request stored in intelligence-service would be read by nobody. The panel hands the ask to the host (`onRequestRegistration`) or offers none (§9 B1) |
| Δ6 | The entry-state mapping is corrected: an editable existing rule is `assist`, a new version is `revise` | The LP-25 entry states are author (blank), assist (edit draft), revise (new version) and review (formal gate). The old plan mapped every edit to `revise`. |

---

## 1. Goal

Mount the **Rules copilot** beside frontend-service's rule editor, and have it call intelligence-service exactly as intelligence-ui does. Per DD-36 and DD-37, the copilot returns **checks and structural, node-anchored patches**. It never saves, approves or blocks the rule. Core (frontend-service and rule-service) keeps owning save, versioning and the maker-checker workflow, and the author can always finish the rule without the panel.

```
frontend-service (rule edit tab) ──/lexie/intelligence/api/intelligence/rules/*──▶ gateway ──▶ intelligence-service ──▶ lexie-ai POST /run (UC11), rule store
                                   + X-Client-Id, X-User-Id (getIntelligenceIdentityHeaders)    (RulesAssistCoordinator)
```

## 2. Gap analysis (2026-10-09)

### 2.1 Reference JSX vs intelligence-ui

intelligence-ui is at **JSX parity** on every element of the UC11 screen. Its only differences are additions.

| JSX element | intelligence-ui | Status |
|---|---|---|
| Entry states author / assist / revise / review, "Try this" | `RulesAssistWorkspace.tsx` | ✅ |
| Core header: rule, rev, session | same | ✅ (shows "not recorded" when Core sends nothing) |
| Core draft lines, clause→predicate highlight, wavy underline per finding | `CoreRuleForm.tsx` | ✅ |
| Edit / Save draft / Submit, maker-checker track, committed receipt | `CoreRuleForm.tsx` + `coreRulesApi.ts` (rule-service) | ✅ (standalone page only) |
| Check / Re-check, How this works (6 cards), tab counts, suggested-next dot, guide line | `RulesAssistWorkspace.tsx`, `useRulesWorkspace.guide()` | ✅ |
| **Understand**: confidence from grounding coverage plus "to raise it", citation, instruction version vs gold copy, clause binding | `UnderstandTab.tsx` | ✅ |
| **Build**: Semantic Layer banner, attributes, values open in place, search, hidden-marked warning, In/Out toggles, retired lock, composed predicate, widens/narrows, two gates | `BuildTab.tsx` + `draftModel.compose` | ✅ |
| **Check**: stale banner, accept-all value corrections, patch accept, blocked operand → Request registration, all resolved, no confidence score, review gate | `CheckTab.tsx` | ✅ |
| **Compare**: blank-rule banner, two containment bars, Draft from anchor, KEEP/MODIFY/ADD/REMOVE table, risk note | `CompareTab.tsx` | ✅ |
| Additions not in the JSX | standalone rule picker, coverage line, choose replacement from candidates, version list, open evidence | ➕ |

**What is still missing:**

| # | Gap | Evidence | Where it gets fixed |
|---|---|---|---|
| G1 | The arrival banner shows only the question. The JSX also shows the handoff run id, semantic coverage, resolved n/m and the request language. | The `arrival` prop is just `{ question }` (`useRulesWorkspace.ts`) | lexie handoff payload. Out of scope here. |
| G2 | The inline LexiAI rule answer (target, two readings, "Accept — open in Rules Authoring") | JSX lines 838 and 17007. By design (LP-25.9, DD-40), Core hosts it, and intelligence-ui has only the harness file `harness/InlineRulesAnswer.tsx`. | frontend-service `AskAi`. Follow-up (§10). |
| G3 | **Registration requests: decided, not a gap.** intelligence-ui used to call `POST /runs/{runId}/registration-requests` and `GET /{ruleRef}/registration-requests`, which no service exposes. Removed 2026-10-09: no steward screen would ever read such a record. intelligence-ui now shows "Request registration" only when the host passes `onRequestRegistration`, and never calls a service for it. | semantic-service owns registration and its approval queue (`WorkflowTaskController`, `wkfl.workflow_task`) | Core routes the ask (§9 B1) |
| G4 | The content DTOs (`attributes`, `disposition`, `draft`, and patch `to`) are null while `catalog_ready=false` and no drafter is bound | PENDING_FEATURES 11.4–11.8; OPA `rules/data.json` | Deployment. The panel must show "not recorded" honestly. |
| G5 | **Every clause shows "no predicate" on every Core rule.** A clause counts as implemented only when a predicate carries `clause_ref` to it, and Core's `rule_json` filter steps have nowhere to store one, so nothing ever binds. The clauses are also a plain sentence split of the MDRM description, so cross-references ("see the Glossary entry…") and notes about other reports ("COMPARABILITY: … FR Y-11") show as unmet requirements. The guide line then claims "N clause(s) have no predicate. The rule will over-report", which the copilot cannot actually measure. | lexie `rules_ops.py` `instruction_of` (binding is `p.clause_ref == clause_id`) and `instruction_clauses` (regex split on sentence ends); `translate_rule` sets no `clause_ref`. Seen on BHCK3521 and the servicing-income line (9 clauses, all red). | Panel: honest display (RU7, C8). Core and Intelligence follow-ups: §9 B5–B7. |

### 2.2 Spec rules (LP-25.6 / 25.8 / 25.9) that frontend-service must keep

| Rule | Source |
|---|---|
| The panel is embedded beside Core's form, with no route of its own | LP-25.6, DD-36 |
| Accepting is a **structural patch on a node**, never text | LP-25.6, DD-37 |
| Accept-all reads `patch.auto_acceptable`. REMOVE and ADD are never in accept-all. | LP-25.6 |
| A stale patch can't be accepted. Stale findings are shown as STALE, never hidden. | LP-25.6 |
| No browser storage, and no `<a href>` in the panel | LP-25.6, LP-25.8 |
| Logical names only. Values are offered only when the lookup is **governed AND rules_eligible**. A retired value can't be newly included or excluded. | LP-25.8 |
| An unregistered operand can't be accepted. The action is a registration request to the Semantic Layer steward. | LP-25.8 |
| Confidence renders only on generated content, and its absence is explained on deterministic runs | LP-25.8 |
| Derivations collapse while authoring and are open at the review gate | LP-25.8 |
| On an arrived (LexiAI) draft, every operand is unverified | LP-25.9 |
| The copilot never blocks the conventional path | LP-25 background |
| A rule with no `rule_kind` is refused | LP-25.3 |

## 3. Current frontend-service lexie usage in Rules (unchanged by this plan)

| Today | File | API (direct lexie, `/lexie/ai/`) | Plan |
|---|---|---|---|
| Rule documentation summary | `RuleDocumentation.tsx` → `lexieApi.fetchRuleSummaryV2` | `POST api/v1/chatbot/ai/rule-summary` | Keep on lexie (no proxy exists) |
| MDRM recommendation | `RuleMapTab.tsx` → `ruleApi.fetchMdrmRecommendation` | `POST api/v1/chatbot/ai/mdrm/recommend` | Keep on lexie |
| Global Ask-AI query → expression | `shared-ui/components/ui-components/AskAi.tsx` | `POST api/v1/chatbot/ai/query` | Out of scope (G2 follow-up) |
| **Rules copilot** | none | — | **New** (this plan) |

## 4. Facts (verified)

| Fact | Evidence |
|---|---|
| The gateway routes `/lexie/intelligence/**` to intelligence-service (prefix stripped) | `gateway-service.yml:155-160` |
| `SERVICE_PREFIX.INTELLIGENCE = "/lexie/intelligence/"`, `intelligenceHttp` and `getIntelligenceIdentityHeaders()` already exist | `shared-ui/constants/index.ts:46`, `shared-ui/services/intelligenceHttp.ts`, `intelligenceIdentity.ts:17` |
| `INTELLIGENCE_VARIANCE`, `_ANALYTICAL` and `_IMPACT` endpoint groups exist, but there is no `INTELLIGENCE_RULES` | `shared-ui/constants/apiEndpoints.ts:145-167` |
| A snake_case wire converter already exists in frontend-service | `features/workbench/impact/wireCase.ts` |
| Controller `/api/intelligence/rules`: `POST /assist`, `POST /runs/{runId}/acceptance?surface=`, `GET /sessions/{sessionRef}/runs`, `GET /catalog`, `GET /{ruleRef}`, `GET /{ruleRef}/siblings`, `GET /{ruleRef}/instruction` | `RulesAssistController.java:34-147` |
| Acceptance is recorded only for `surface=CORE`. Any other surface gets `SURFACE_NOT_CORE` (422). | `RulesAssistCoordinator.java:155`; PENDING 11.2 |
| Assist request (snake_case): `{entry_state, rule, authoring_session_ref, work_begun, draft_provenance, rule_ref?}`. intelligence-ui sends **either** `rule` **or** `rule_ref`. | `RulesAssistCoordinator.AssistRequest`; `intelligence-ui rulesApi.assistRules` |
| `ruleRef` is Core's numeric rule id; anything else gets a 400 | `RulesAssistController` javadoc |
| lexie's rule structure: `{rule_id, rule_kind, version, target, effective_from, effective_to, clauses, instruction_version, status, inputs[], predicates[{id, attribute, op: "IN"\|"NOT IN", values[], clause_ref?}], calculations[]}` | `rules_ops.py:153-170`; intelligence-ui `useRulesWorkspace.ruleForRun` |
| **The predicate id is the filter step id** in `rule_json`, so patches anchor to graph nodes | `rules_ops.py` `translate_rule` (`{"id": step.get("id"), ...}`) |
| Filter grammar: `a = 'v'`, `a <> 'v'`, `a IN ('x','y')`, `a NOT IN (...)`. Anything else is untranslated and isn't sent as a predicate. | `rules_ops.py:115` `parse_filter`; intelligence-ui `draftModel.parseCoreFilter` |
| Calculations come from `map` steps (`properties.expressions`) and `aggregate` steps (`properties.agg[]`, `group_by`). Inputs are the step input values starting `rl.` or `ds.`. | `rules_ops.py:137-150` |
| The editor graph is `RuleEditorNodeData[]` with `id`, `componentType` and `properties`. Filters hold `properties.filter_expression`. | `features/rules/utils/ruleGraph.ts:215-223, 589-605` |
| The tab knows `ruleId`, `version`, `latestVersion`, `status`, `isEditable`, `isNew`, `formName`, `nodeCode` and `rulesCategory`. Detail-tab state has `isOpenedFromAi`. | `features/rules/store/rules.slice.ts` (`RuleTab`, `RuleDetailTabsState`) |
| Responses come in the `ApiResponse` envelope `{success, data}`, snake_case. `output.extra_fields` is the render model, read verbatim. | intelligence-ui `shell/featureClient.ts`, `renderModel.toRenderModel` |

### 4a. Prerequisites and readiness (re-checked)

| # | Finding | Impact |
|---|---|---|
| RU1 | `rule_ref` = `String(RuleTab.ruleId)`. A new rule (`ruleId == null`) has no `rule_ref`, so R2–R4 are skipped. | No catalog lookup (R7 unused) |
| RU2 | Global SNAKE_CASE: `AssistRequest` drops unknown camelCase keys **silently** | Snake_case top-level keys. `rule` is sent unchanged (it's already snake_case). |
| RU3 | OPA: `instruction_ready=true`, `rule_store_ready=true`, `catalog_ready=false`, which denies `rules.get_catalog` and `rules.compose_predicate` | Build and patch `to` values will mostly be empty. Show "not recorded" and don't invent anything. |
| RU4 | lexie returns 400 without `X-Client-Id`/`X-User-Id`, even where intelligence-service marks them optional | Send the identity headers on every call |
| RU5 | `rules.draft` is refused in review (`REVIEW_IS_DETERMINISTIC`), and no drafter is bound (11.8) | Hide "Draft from anchor" in review. Show `draft_status` DRAFTER_UNBOUND / DRAFT_DENIED verbatim. |
| RU6 | Registration belongs to the Semantic Layer steward (G3, Δ5) | Show the disabled "operand not registered" state with the steward note. Show "Request registration" only if frontend-service has a route into semantic-service's steward queue (§9 B1), passed as `onRequestRegistration`; otherwise none. Never call intelligence-service for it. |
| RU7 | Clause binding is never recorded on Core rules (G5) | When **no** predicate in the rule carries a `clause_ref`, show each clause with a grey "binding not recorded" pill, not the red "no predicate"; leave unbound clauses out of the Understand tab count; and drop the "will over-report" guide line. Keep the red "no predicate" only when the rule does record bindings and this clause has none. |

## 5. API mapping: rule edit screen

Base: `SERVICE_PREFIX.INTELLIGENCE` (`/lexie/intelligence/`)

| # | When | Method + path | Request | intelligence-ui equivalent |
|---|---|---|---|---|
| R1 | "Check" / "Re-check" (manual), and optionally debounced (≥1.5s) after an edit once the panel has run | `POST api/intelligence/rules/assist` | §5.1 | `assistRules` |
| R2 | Panel opens (existing rule) | `GET api/intelligence/rules/{ruleRef}` | — | `getRule`: also the metadata source for §5.1 |
| R3 | Panel opens (existing rule) | `GET api/intelligence/rules/{ruleRef}/siblings` | — | `getRuleSiblings` |
| R4 | Panel opens (existing rule) | `GET api/intelligence/rules/{ruleRef}/instruction` | — | `getRuleInstruction` |
| R5 | After Core saves or approves a version the copilot advised on | `POST api/intelligence/rules/runs/{runId}/acceptance?surface=CORE` | `{accepted_rule_ref, accepted_rule_version}` | service-only |
| R6 | Optional: run history for this session | `GET api/intelligence/rules/sessions/{sessionRef}/runs` | — | service-only |
| R8 | **Not used.** Registration is not an intelligence-service call (G3) | — | — | — |
| R7 | **Not used** (RU1, RU3) | `GET api/intelligence/rules/catalog` | — | `listRules` |

### 5.1 Assist request: field mapping

| Wire field | Source | Notes |
|---|---|---|
| `entry_state` | `RuleTab.isNew` → `author`; read-only (`!isEditable`) or status awaiting checker/approval → `review`; editable and creating a new version of an approved rule (`version > approved version` / "new version" flow) → `revise`; otherwise editable → `assist` | Derived from the tab, not a user toggle (the JSX toggle is a demo control). Changing state clears the run (`changeEntry`). |
| `rule` | **null** while the editor is clean and the rule exists; otherwise `toCopilotRule(...)` (§6 C4) | Mirrors `useRulesWorkspace.ruleForRun`. Never send raw `rule_json` (Δ1). |
| `rule_ref` | `String(ruleId)` **only when `rule` is null** | Mirrors `assistRules` |
| `authoring_session_ref` | `${tabId}@${openedAt}`, stable for the life of the tab | Persistence key for R5 and R6 |
| `work_begun` | editor dirty | |
| `draft_provenance` | `isOpenedFromAi ? "lexie_handoff" : "typed"` | On a handoff, every operand renders as unverified (LP-25.9) |

**`toCopilotRule`**, built when the editor is dirty or the rule is new:

| Field | Value |
|---|---|
| `rule_id` | `String(ruleId)`, or the tab id for a new rule |
| `rule_kind` | R2 `ruleKind`; for a new rule, map the selected rule type name (`report`/`data quality`/`edit check`). **If it's unknown, don't call R1**: show "choose a rule type first" (Δ2). |
| `version`, `target`, `effective_from`, `status` | from R2 (`version`, `target`, `period`, `ruleStatus`). For a new rule: `version: 0`, `target: formName && nodeCode ? \`${formName}.${nodeCode}\` : null`, the toolbar `effectivePeriod`, and `"DRAFT"` |
| `effective_to`, `instruction_version` | `null` |
| `clauses` | `[]` |
| `inputs` | live filter/step input values starting `rl.` or `ds.` |
| `predicates` | one per **filter node** whose `filter_expression` parses (`parseCoreFilter`): `{id: node.id, attribute, op, values, clause_ref: null}` |
| `calculations` | from the live `map` and `aggregate` nodes, in the same shape as `translate_rule` |
| (local only) `untranslated` | filter node ids that didn't parse. Show them in the panel the way intelligence-ui shows `untranslatedSteps`. |

## 6. Change list (frontend-service)

| # | File | Change |
|---|---|---|
| C1 | `shared-ui/constants/index.ts` | **Exists**: `SERVICE_PREFIX.INTELLIGENCE`. No change. |
| C2 | `shared-ui/services/intelligenceHttp.ts`, `intelligenceIdentity.ts` | **Exist**. Reuse them. |
| C3 | `shared-ui/constants/apiEndpoints.ts` | Add `INTELLIGENCE_RULES: { ASSIST, RULE, SIBLINGS, INSTRUCTION, ACCEPTANCE, SESSION_RUNS }` (paths in §5). |
| C4 | `features/rules/assist/` (new folder): `types.ts`, `renderModel.ts`, `panelModel.ts`, `draftModel.ts`, `copilotRule.ts` | Copy intelligence-ui's DOM-free modules verbatim (types, `toRenderModel`, `allFindings`, `isStale`, `autoAcceptable`, `derivationsOpen`, `unverified`, `codeText`/`codeWhy`/`codeKind`/`basisText`/`verdictText`, `parseCoreFilter`, `coreFilter`, `compose`, `marksOf`, `samePredicate`). Point the i18n lookups at frontend-service's `t()` and copy the `rules.*` message keys. **New** `copilotRule.ts`: `toCopilotRule(nodes, edges, ruleTab, detail, toolbar)` per §5.1. |
| C5 | `shared-ui/services/intelligenceRulesApi.ts` (new) | `assist`, `getRule`, `getSiblings`, `getInstruction`, `recordAcceptance(runId, body)` (always `?surface=CORE`), `getSessionRuns`. Use snake_case requests through the existing wire converter, with `rule` and `extra_fields`/`output_payload` excluded from conversion. Unwrap `ApiResponse`. Encode `ruleRef` with `encodeURIComponent`. |
| C6 | `features/rules/hooks/useRulesAssist.ts` (new) | A port of `useRulesWorkspace`'s **copilot half only** (no picker, no rule-service calls). Keyed by `tabId`, it reads the editor nodes and edges from the rules slice. State: `outcome`, `computedAt`, `edits` (incremented on every editor change for this tab), `accepted`, `litClause`, `tab`. It derives `model`, `stale`, `open`, `blocking`, `autoOpen`, `clauses`, `clauseBound`, `unbound`, `siblings`, `anchor`, `blank` and `guide()`, the same as intelligence-ui. It loads R2–R4 when `ruleId` is set. `check()` sends R1 per §5.1. |
| C7 | `features/rules/utils/applyCopilotPatch.ts` (new) | Applies a `FindingPatch` **to the editor graph**, not to text. **MODIFY**: set the node `patch.node_id`'s `filter_expression = coreFilter(to)`; when `to` is null, the author picks from `candidates`, the retired value is dropped and the choice added. **REMOVE**: delete the filter node and reconnect its input to its consumers (port `draftModel.removeStep`). **ADD**: insert a filter node in front of the first filter, or the first step reading `ds.`/`rl.` (port `insertFilter`). Dispatch through the existing editor actions so undo, dirty and the Graph and Expression views stay consistent. **Never save.** |
| C8 | `features/rules/assist/components/` (new): `RulesAssistPanel.tsx`, `UnderstandTab.tsx`, `BuildTab.tsx`, `CheckTab.tsx`, `CompareTab.tsx` | Port the intelligence-ui panel half (header: entry-state pill, How this works, Check/Re-check; tab strip with counts and the suggested-next dot; guide line; refusal notice; the four tabs). **Leave out `CoreRuleForm`**: frontend-service's Graph and Expression tabs are Core's form. Styling follows frontend-service's MUI and theme tokens (no hard-coded colours, no `<a href>`, no browser storage). Behaviour per §2.2. "Request registration" only via `onRequestRegistration` into semantic-service (RU6). "Draft from anchor" is shown only in `author` and only when the run reports `draft_status` other than DRAFTER_UNBOUND. Understand tab follows RU7: when the rule records no clause binding, clauses read "binding not recorded" (grey), are not counted, and the guide does not claim over-reporting. |
| C9 | `features/rules/components/RuleDetailTabs.tsx` | A toolbar toggle "Rules Assist" opens a collapsible right-side panel (collapsed by default, state kept per tab in the slice, not in storage) that mounts `RulesAssistPanel` with `tabId`. It is shown for every rule tab, Graph and Expression alike. |
| C10 | `features/rules/components/RuleFlowNode.tsx` (and Expression view if feasible) | Read-only decorations from the hook: highlight the node(s) bound to `litClause`, and show a wavy or red/amber outline on nodes named in open, non-stale findings. Mirrors the JSX left pane. |
| C11 | `RuleWorkFlowActions.tsx` / `RuleToolbar.tsx` save and approve success path | If the tab has a copilot `run_id`, call R5 `{accepted_rule_ref: String(ruleId), accepted_rule_version: savedVersion}` without waiting on it, and log failures. Never block the save. After the save, reset `edits`/`computedAt` so findings show as stale against the new version. |
| C12 | `features/rules/assist/__tests__/` | Unit tests for `toCopilotRule` (fixture graph → expected predicates, untranslated ids, calculations, inputs) and `applyCopilotPatch` (MODIFY, REMOVE rewire, ADD insert), plus a click test that accept-all excludes REMOVE and ADD and that a stale patch is disabled. Port the relevant cases from intelligence-ui `__tests__/rulesAssist.test.tsx`. |

**Out of scope:** `RuleDocumentation`, the RuleMapTab MDRM recommendation, the global `AskAi` and its inline rule answer (G2), the rule save and approve APIs, Core workflow-status feed (11.7), and any change to intelligence-service, lexie-ai, gateway or config-service (except §9 B1, which is tracked separately).

## 7. Validation

- `tsc --noEmit`, lint and the new unit tests pass on frontend-service.
- Manual check on an **existing editable rule**:
  - Opening the panel calls R2–R4 with `X-Client-Id` and `X-User-Id`.
  - Check sends `entry_state:"assist"`, `rule:null` and `rule_ref:"<ruleId>"`.
  - The result is either findings or a REFUSED notice with `refusal_code` and `refusal_reason` verbatim.
- Edit a filter in the Graph, then Re-check:
  - The request now carries `rule.predicates` whose ids equal the filter node ids, and no `rule_ref`.
  - The earlier findings showed **STALE** before the re-check.
- Accept a MODIFY patch: the filter node's expression changes in Graph and Expression, the editor is dirty, and nothing is saved.
- Accept-all never includes REMOVE or ADD. A stale patch's Accept button is disabled.
- A new rule sends `entry_state:"author"` with no `rule_ref` and a `rule_kind`. With no rule type chosen, Check is disabled and says why.
- A read-only rule sends `entry_state:"review"`: derivations are open, "Draft from anchor" is hidden, and the review-gate block shows.
- On a Core rule with no `clause_ref` anywhere (every rule today), Understand shows "binding not recorded" on each clause, its tab count is 0, and the guide line does not say the rule will over-report (RU7).
- A rule opened from Ask-AI sends `draft_provenance:"lexie_handoff"`, and Build marks every attribute unverified.
- Save or approve after a run sends `POST …/runs/{runId}/acceptance?surface=CORE`.
- Existing Rules behaviour (save, approve, documentation, rule map, lineage, execution) is unchanged with the panel closed.

## 8. Risks

| Risk | Mitigation |
|---|---|
| Raw `rule_json` sent as `rule` gives empty checks | `toCopilotRule` (Δ1), with a unit test against a real rule_json fixture |
| A missing `rule_kind` is refused | Take it from R2, or map the selected type; disable Check when it's unknown (Δ2) |
| frontend-service's filter syntax differs from lexie's grammar (for example `==` or unquoted values) | Unparsed filters are listed as "not translated", not dropped silently. Port lexie's `parse_filter` regex exactly. |
| Patch node ids don't match graph node ids | Predicate id = `node.id` both ways. When a `node_id` isn't found, ignore the patch and show "node no longer in the draft". |
| REMOVE breaks the graph's connections | Port `removeStep`'s rewire logic, with a unit test |
| Few or no Build values or patch `to` values while `catalog_ready=false` | Expected (RU3/G4). Render "not recorded". Enabling it is a deployment change. |
| A dead "Request registration" button | Shown only when the host routes it into semantic-service's steward queue (RU6, §9 B1) |
| Too many R1 calls | Manual Check. A debounced re-check runs only after the first manual run and only when the panel is open. |
| A patch is persisted without review | Patches change only local editor state. Core save stays the only way to persist. |

## 9. Backend prerequisites and follow-ups (separate plans)

| # | Item | Repo | Blocks |
|---|---|---|---|
| B1 | **Steward request through semantic-service** (replaces the earlier intelligence-service endpoint idea). Add a semantic-service endpoint that raises a `wkfl.workflow_task` for registering an attribute (entity, rule ref, requested by), so it appears in the steward's existing approval list; frontend-service passes it as `onRequestRegistration`. | Lextr Core (semantic-service) | "Request registration" in frontend-service (RU6) |
| B2 | Bind the rules adapter and set `catalog_ready` (11.4/11.5) | lexie-ai, OPA data | Build values, composed and patch `to` values (G4) |
| B3 | Bind a drafter (11.8) | lexie-ai | "Draft from anchor" generating anything |
| B4 | Send the handoff provenance (run id, semantic coverage, resolved n/m, language) in the Ask-AI → rule handoff | lexie-ai | G1 banner |
| B5 | **Store the clause binding in Core.** Add `clause_ref` to the filter step's `properties` in `rule_json` (Core's rule-service and the editor), and have lexie's `translate_rule` read it. Then an author's "this predicate implements §n" choice survives Save, and the copilot can measure binding. | Lextr Core (rule-service, frontend-service editor) + lexie-ai | Real "implemented / no predicate" on Understand (G5) |
| B6 | **Tell requirements from notes.** Mark cross-reference, glossary and comparability sentences as notes rather than clauses, preferably in the MDRM source or Core's instruction store; a text heuristic in lexie's `instruction_clauses` is the fallback and can misclassify. | Core / lexie-ai | Clean clause list (G5) |
| B7 | **Suggested binding.** lexie proposes "this predicate likely implements §n" as POSSIBLE, for the author to confirm (then stored per B5). Needs the catalog (B2) and a model. | lexie-ai | Faster binding once B5 exists |
| B8 | **Catalog scope per job** (`RulesAssist_Catalog_Scope_Plan.md`). The catalog holds only the attributes the rule already uses, so Build cannot offer a new attribute and Draft from anchor gets an empty catalog on a blank rule. Keep Check and Review on the used attributes; give Build every exposed attribute of the rule's `ds.*` objects and the drafter the rules-eligible, AI-exposed ones. Until then, frontend-service's Build tab lists only attributes already in the rule. | lexie-ai | Build and drafting on new attributes |

## 10. Follow-up (frontend, after this plan)

- **G2 inline rule answer in `AskAi`:** render the UC11 inline projection (target, readings, "Accept — open in Rules Authoring") from the same render model. Accept opens the rule tab with `isOpenedFromAi=true`, so this plan's provenance path lights up.
- Move `rule-summary` and `mdrm/recommend` behind intelligence-service once proxies exist.

---

## 11. Implementation prompt

```text
TASK: Add the Rules & Logic Assist copilot (UC11) to frontend-service's INDIVIDUAL RULE EDIT screen
(RuleDetailTabs) as a collapsible side panel with four tabs (Understand, Build, Check, Compare), calling
intelligence-service exactly as intelligence-ui does. The copilot returns checks and node-anchored patches only;
accepting a patch edits the graph editor locally. Core keeps owning save, versioning and approval.

REPO: lextr/typescript/frontend-service (change only this repo)
SPEC: utils/prompts-library/Lextr_Intelligence_Final_Package/plan/FrontendService_Rules_Logic_Assist_via_IntelligenceService_Plan.md
REFERENCE (read-only): lextrai/intelligence-ui/src/features/rules/ (types.ts, renderModel.ts, panelModel.ts,
  draftModel.ts, rulesApi.ts, components/useRulesWorkspace.ts, components/{Understand,Build,Check,Compare}Tab.tsx,
  components/RulesAssistWorkspace.tsx); lexie-ai/lexie_ai/adapter/rules_ops.py (parse_filter, translate_rule)
DESIGN (read-only): Lextr_Intelligence_Final_Package/files/Lextr_Intelligence_UI_v1.38.0_FINAL.jsx lines 4112-4818
SPEC PROMPTS: prompts/wave_07/LP-25.6_TS.md, LP-25.8_TS.md, LP-25.9_TS.md

REUSE (do not recreate): SERVICE_PREFIX.INTELLIGENCE, shared-ui/services/intelligenceHttp.ts,
  getIntelligenceIdentityHeaders(), features/workbench/impact/wireCase.ts.

WIRE
- Paths /lexie/intelligence/api/intelligence/rules/... with X-Client-Id and X-User-Id on EVERY call.
- Requests snake_case; `rule` is not key-converted; response output.extra_fields / output_payload read verbatim.
- assist body: {entry_state, rule, authoring_session_ref, work_begun, draft_provenance, rule_ref?}.
  Send rule:null + rule_ref=String(ruleId) while the editor is clean and the rule exists; otherwise send
  rule=toCopilotRule(...) and NO rule_ref.
- NEVER send serializeRuleGraph / raw rule_json as `rule` (lexie reads rule.predicates only).

STEPS
1. apiEndpoints.ts: INTELLIGENCE_RULES = { ASSIST: "api/intelligence/rules/assist",
   RULE: "api/intelligence/rules/{ruleRef}", SIBLINGS: "api/intelligence/rules/{ruleRef}/siblings",
   INSTRUCTION: "api/intelligence/rules/{ruleRef}/instruction",
   ACCEPTANCE: "api/intelligence/rules/runs/{runId}/acceptance",
   SESSION_RUNS: "api/intelligence/rules/sessions/{sessionRef}/runs" }. No registration endpoints (registration is semantic-service's).
2. shared-ui/services/intelligenceRulesApi.ts: assist, getRule, getSiblings, getInstruction,
   recordAcceptance(runId, {accepted_rule_ref, accepted_rule_version}) -> ?surface=CORE, getSessionRuns.
3. features/rules/assist/: copy intelligence-ui types.ts, renderModel.ts, panelModel.ts and the pure helpers of
   draftModel.ts (parseCoreFilter, coreFilter, compose, marksOf, samePredicate, setPredicate); wire i18n to
   frontend-service t() and copy the rules.* message keys.
4. features/rules/assist/copilotRule.ts: toCopilotRule(nodes, edges, ruleTab, detail, toolbar) ->
   {rule_id, rule_kind, version, target, effective_from, effective_to:null, clauses:[], instruction_version:null,
    status, inputs, predicates, calculations} + untranslated[] (plan §5.1). Predicate id = filter node id.
   Port parse_filter's grammar exactly. rule_kind from R2 ruleKind, else map rule type name
   (report->reporting, data quality->data_quality, edit check->edit_check); unknown -> caller disables Check.
5. features/rules/hooks/useRulesAssist.ts (per tabId): port useRulesWorkspace's copilot half (no picker, no
   rule-service). entry_state derived: isNew->author; read-only or awaiting checker/approval->review;
   new version of an approved rule->revise; else assist. authoring_session_ref = `${tabId}@${openedAt}`.
   draft_provenance = isOpenedFromAi ? "lexie_handoff" : "typed". edits counter bumps on every editor change;
   stale = isStale(...). Load R2-R4 when ruleId is set. Manual check(); optional debounced re-check (>=1.5s)
   only after a first manual run and only while the panel is open.
6. features/rules/utils/applyCopilotPatch.ts: MODIFY sets filter_expression=coreFilter(to) on node patch.node_id
   (to null -> author's choice from candidates replaces the dropped value); REMOVE deletes the filter node and
   rewires its input to its consumers; ADD inserts a filter node before the first filter (or first ds./rl.
   reader). Dispatch via existing editor actions. Never save.
7. features/rules/assist/components/: RulesAssistPanel + Understand/Build/Check/Compare tabs ported from
   intelligence-ui (NOT CoreRuleForm). MUI + theme tokens; no hard-coded colours; no <a href>; no browser
   storage. Keep: accept-all reads patch.auto_acceptable (REMOVE/ADD excluded); stale patches disabled and
   findings shown STALE; values only when governed AND rules_eligible; retired values locked unless already in
   the rule; derivations open only in review; confidence only on generated content; refusal code/reason
   verbatim; untranslated filters listed. Show "Request registration" only when routed into semantic-service's steward queue (RU6), never via intelligence-service;
   show the disabled "operand not registered" state. "Draft from anchor" only in author.
   Understand (plan RU7, G5): if no predicate carries clause_ref (every Core rule today), show each clause
   with a grey "binding not recorded" pill instead of red "no predicate", leave them out of the tab count,
   and never say the rule will over-report. Do not infer bindings from clause text.
8. RuleDetailTabs.tsx: a "Rules Assist" toggle opening a collapsible right-side panel (collapsed by default,
   open state per tab in the rules slice) mounting RulesAssistPanel with tabId.
9. RuleFlowNode.tsx: read-only highlight for nodes bound to the lit clause and severity outline for nodes
   named in open non-stale findings.
10. RuleWorkFlowActions.tsx / RuleToolbar.tsx save/approve success: if the tab has a copilot run_id, call
    recordAcceptance(runId, {accepted_rule_ref: String(ruleId), accepted_rule_version: savedVersion})
    fire-and-forget; log failures; never block the save.
11. Tests: toCopilotRule (fixture rule_json graph -> predicates/untranslated/calculations/inputs),
    applyCopilotPatch (MODIFY/REMOVE rewire/ADD insert), accept-all excludes REMOVE/ADD, stale accept disabled.

DO NOT
- Send raw rule_json as `rule`, or omit rule_kind.
- Let the copilot save, approve, auto-apply patches, or block Core's controls.
- Add registration-request calls to intelligence-service (registration is semantic-service's), call the catalog, or move RuleDocumentation / RuleMapTab /
  AskAi off lexie.
- Touch intelligence-service, lexie-ai, gateway or config-service. Add dependencies, refactor unrelated code,
  commit or push.

VALIDATE
- tsc --noEmit, lint and the new unit tests on frontend-service.
- Report: files changed, validation run and its result, the entry-state mapping used, how rule_kind is resolved
  for new rules, and anything not done.
```
