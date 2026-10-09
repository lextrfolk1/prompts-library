# frontend-service Rules & Logic Assist (UC11) via intelligence-service: Status, Pending Work and Plans

- **Last updated:** 2026-10-09
- **Branch:** `feature/lextr-intelligence-v1.38.0` (intelligence-service, lexie-ai, intelligence-ui)
- **Design:** `files/Lextr_Intelligence_UI_v1.38.0_FINAL.jsx`: `RulesAssistWorkspace` (lines 4112–4818), fixtures (1826–1990), Lexie inline answer (~838), LexiePanel handoff (~17007)
- **Spec prompts:** `prompts/wave_07/LP-25.1` … `LP-25.9`
- **This file holds:** where UC11 stands (§1), the spec rules any host must keep (§2), everything pending (§3), the frontend-service integration plan (§4) and the catalog-scope plan (§5). It replaces the UC11 section of `PENDING_FEATURES.md` and `RulesAssist_Catalog_Scope_Plan.md`.

---

## 1. Status

**Built and running end to end in dev.** The copilot returns checks and node-anchored structural patches. It never saves, approves or blocks the rule (DD-36, DD-37). Core owns save, versioning and the maker-checker workflow.

| Layer | What is built |
|---|---|
| lexie-ai | Rules skill `skills/rules/` (contract, checks, patches, compare, skill, manifest). Core rule store `lexie_ai/adapter/rules_ops.py` (Core's meta tables, read-only). Governed catalog through semantic-service `rules_semantic.py` (POL-DM-001 applied to values). Drafter `rules_drafter.py` (bound per deployment). Read routes `routes/rules_routers.py`. Dispatcher `RulesRoute`. |
| intelligence-service | `/api/intelligence/rules/*`: assist, acceptance (`surface=CORE` only), session runs, catalog, rule detail, siblings, instruction. `RulesAssistCoordinator` (origin gate, OPA, review guard, session-bounded persistence, ledger). OPA `tool_scope_rules` with readiness data all `true`. |
| intelligence-ui | `features/rules/`: the one renderer `RulesAssistWorkspace` at JSX parity (entry states, Core form, track, receipt, four tabs, How this works). Standalone nav page with rule picker; Save draft and Submit go to rule-service. Ask Lexie hands rules asks (typed or clicked) to Rules Authoring. |

**Commits** (`feature/lextr-intelligence-v1.38.0`):

| Repo | Pushed | Local, not pushed |
|---|---|---|
| intelligence-service | `be1bee6` | `2396232` |
| lexie-ai | `ae711a5` | `bf05b65`, `b978fec` |
| intelligence-ui | `51f385c` | `4171d8e`, `170e9c1`, `cd05014`, `7add832` |

**Validation (2026-10-09):**

| Check | Result |
|---|---|
| JUnit `RulesAssistTest` | 24/24 |
| pytest `tests/rules` | 137 pass, 1 known failure (`test_origin_vocabulary_agrees_sql_and_java`: the migrations are no longer in intelligence-service) |
| vitest `src/features/rules` + `src/components/__tests__` | all pass |
| Live API, every catalog rule (77) | detail 77/77, siblings 77/77, instruction 74/77 (3 `INSTRUCTION_NOT_FOUND`), `/assist` in all four entry states 308/308 COMPLETED; every finding has a severity; no draft without `generate:true`; review never drafts |
| Identity and surface | 400 without `X-Client-Id` or `X-User-Id` on every endpoint; acceptance from another surface 422 `SURFACE_NOT_CORE` |
| Browser (headless, :5173) | Check, every tab, Build compose and apply, accept a patch, Re-check, review gate, Draft from anchor on a blank rule, How this works, Ask Lexie → Accept → arrival banner; no HTTP ≥ 400, no console errors |

**Deviations from the JSX, accepted:**
- Content is thinner than the fixtures where Core's data is thin (§3: 11.15, 11.16).
- The inline Lexie rules answer (two readings) is hosted by Core (LP-25.9, DD-40).
- "Request registration" appears only when the host passes `onRequestRegistration`, because registering an operand is the Semantic Layer steward's job.
- The arrival banner shows only the question (11.18).

---

## 2. Spec rules every host must keep

| Rule | Source |
|---|---|
| The panel is embedded beside Core's form, with no route of its own; the entry states belong to the host, not the panel | LP-25.6, LP-25.9, DD-36 |
| `rule_kind` is required; a rule without it is refused, never defaulted | LP-25.3 |
| REVIEW never generates (skill capabilities, Rego, coordinator) | LP-25.3/4/5, DD-33 |
| Accepting is a structural patch on a node, never text. Accept-all reads `patch.auto_acceptable`; REMOVE and ADD are never in it. | LP-25.6, DD-37 |
| A stale patch can't be accepted. Stale findings are shown as STALE, never hidden. | LP-25.6 |
| No browser storage, and no `<a href>` in the panel | LP-25.6, LP-25.8 |
| Logical names only. Values are offered only when governed AND rules-eligible; a retired value can't be newly included or excluded. | LP-25.8 |
| Confidence renders only on generated content (grounding coverage, attributes and literals resolved); its absence is explained on deterministic runs | LP-25.8 |
| Derivations collapse while authoring and are open at the review gate | LP-25.8 |
| On an arrived (Lexie) draft, every operand is unverified | LP-25.9 |
| Identity travels only in headers; acceptance only from `surface=CORE` | LP-25.5 |
| The copilot never blocks the conventional path | LP-25 background |

---

## 3. Pending

| # | Item | Owner | Waits on | Status |
|---|---|---|---|---|
| 11.1 | Apply `V45__lp25_rules_ledger_actions.sql` (`SUGGEST`/`ACCEPT` ledger actions, `agent_run.accepted_by`). Without it every assist and acceptance fails its ledger write. | Deployment / DBA | — | Applied in dev; other environments open |
| 11.2 | Core sends `X-Client-Id`, `X-User-Id` (required, 400 without it) and `X-User-Functions` on every endpoint, and posts acceptance receipts with `?surface=CORE`. Risk: any Core caller that sends only `X-Client-Id` breaks. | Lextr Core | — | Open |
| 11.3 | Core mounts the copilot in its rule editor (§4) and supplies the rule, its version, the authoring session, work begun, `onAcceptPatch`, `onRequestRegistration` and `openEvidence` | Lextr Core (frontend-service) | §4 | Planned |
| 11.8 | Choose the drafter for `rules.draft` (`LEXIE_RULES_DRAFTER`) in each deployment; only a model approved for this data | Intelligence / Deployment | Model approval | Bound in dev |
| 11.9 | Relabel the Supervisory Radar off UC11 (`skills/supervisory_radar_skill.py`, `SupervisoryRadarCoordinatorImpl.java:206`, the `useCaseAliases.ts` sources). Ask Lexie works around it for rules answers. | Owner | Radar id | Deferred |
| 11.10 | Ledger decision ids are always null: the dev OPA server has no decision logging | Platform / Deployment | OPA config | Open (platform-wide) |
| 11.11 | Ledger ctx is not stored: `EstateLedgerServiceImpl.estateRecord` keeps only `actor`, `track` and `to` | Intelligence (shared ledger) | Shared-service approval | Open (platform-wide) |
| 11.12 | A rules kind in HistoryDrawer `RECORD_KINDS` (backed by `GET /sessions/{ref}/runs`) | Intelligence | Decision | Deferred |
| 11.13 | Push the local commits (§1) | Owner | Review | Open |
| 11.14 | Dev test data: run `uc11-httpcheck-*` and about 330 SUGGEST ledger rows from the 2026-10-09 sweep, in the dev tenant | Owner | — | Delete when no longer needed |
| 11.15 | **Clause binding is never recorded on Core rules**, so every clause shows "no predicate" and the guide says the rule "will over-report". Store `clause_ref` on the filter step's `properties` in `rule_json` and have `translate_rule` read it; tell requirements from notes (cross-references, glossary, comparability) in the MDRM source; later, suggest a binding (POSSIBLE) for the author to confirm. | Lextr Core (rule-service, editor) + lexie-ai | Core change | Open |
| 11.16 | Logical names and value descriptions: semantic-service holds no logical name for `internal_reg_coa` (the code is shown) and no descriptions for COA values | Semantic Layer | Data | Open |
| 11.17 | Catalog scope per job (§5): Build lists only the attributes the rule uses, and a blank rule drafts against an empty catalog (coverage 0.00) | lexie-ai | — | Deferred (decided 2026-10-09) |
| 11.18 | Handoff provenance (Lexie run id, semantic coverage, resolved n/m, language) in the Ask Lexie → Rules handoff, so the arrival banner can show it | lexie-ai | Handoff payload | Open |
| 11.19 | A semantic-service endpoint that raises the steward's registration task (`wkfl.workflow_task`: entity, rule ref, requested by), passed to the panel as `onRequestRegistration` | Lextr Core (semantic-service) | — | Open |
| 11.20 | Ship a Spanish catalogue. The i18n runtime ships only complete catalogues (all codes; `localeCatalogue.test.ts`), so Spanish can't be enabled for Rules alone. | Intelligence | Translation source and review | Open (decided 2026-10-09: wait) |
| 11.21 | Which tab Check opens. Today it follows the guide, which on Core rules is almost always Understand because of 11.15. Options: go to Check when there are findings; stay on the current tab; keep following the guide. | Owner | Decision | Decision |
| 11.22 | Retired-value patches and accept-all can't be seen in dev: no dev rule uses a retired value (the code path is fixed and tested against the live OPA) | Semantic Layer / Owner | Test data | Open |

**Open decisions:** the radar's use-case id (11.9); the drafter outside dev (11.8); which tab Check opens (11.21).

---

## 4. frontend-service integration (Core's rule editor)

**Status:** PLANNED. **Repo:** `lextr/typescript/frontend-service`.
**Where it lives:** the individual rule edit screen. A rule opens as a tab (`rule::<id>`) in `features/rules/RulesWorkspace.tsx` → `components/RuleDetailTabs.tsx` (tabs Graph, Expression, Rule Lineage, Rule Map, Execution).
**Reference implementation:** `lextrai/intelligence-ui/src/features/rules/` (`rulesApi.ts`, `types.ts`, `renderModel.ts`, `panelModel.ts`, `draftModel.ts`, `components/useRulesWorkspace.ts`, `components/{Understand,Build,Check,Compare}Tab.tsx`).

```
frontend-service (rule edit tab) ──/lexie/intelligence/api/intelligence/rules/*──▶ gateway ──▶ intelligence-service ──▶ lexie-ai POST /run (UC11), rule store
                                   + X-Client-Id, X-User-Id (getIntelligenceIdentityHeaders)    (RulesAssistCoordinator)
```

**Key decisions:**
- **The `rule` payload is the translated structure, never raw `rule_json`.** lexie reads `rule.predicates[{id, attribute, op, values}]`. It translates `rule_json` itself only when it loads the rule by `rule_ref` (`rules_ops.py` `translate_rule`).
- **`rule_kind` is required.** It is mapped from Core's rule type name: `report` → `reporting`, `data quality` → `data_quality`, `edit check` → `edit_check`.
- **Entry states:** a new rule is `author`, an editable existing rule `assist`, a new version `revise`, a read-only or awaiting-approval rule `review`.
- **Registration is not an intelligence-service call.** The panel hands it to the host (`onRequestRegistration`, 11.19) or offers none.
- **Shared plumbing already exists:** `SERVICE_PREFIX.INTELLIGENCE`, `shared-ui/services/intelligenceHttp.ts` and `intelligenceIdentity.ts` came with the Variance plan.

### 4.1 Current lexie usage in Rules (unchanged)

| Today | File | API (direct lexie, `/lexie/ai/`) | Plan |
|---|---|---|---|
| Rule documentation summary | `RuleDocumentation.tsx` → `lexieApi.fetchRuleSummaryV2` | `POST api/v1/chatbot/ai/rule-summary` | Keep on lexie |
| MDRM recommendation | `RuleMapTab.tsx` → `ruleApi.fetchMdrmRecommendation` | `POST api/v1/chatbot/ai/mdrm/recommend` | Keep on lexie |
| Global Ask-AI query → expression | `shared-ui/components/ui-components/AskAi.tsx` | `POST api/v1/chatbot/ai/query` | Out of scope (§4.8) |
| **Rules copilot** | none | — | **New** |

### 4.2 Facts (verified)

| Fact | Evidence |
|---|---|
| The gateway routes `/lexie/intelligence/**` to intelligence-service (prefix stripped) | `gateway-service.yml:155-160` |
| `SERVICE_PREFIX.INTELLIGENCE`, `intelligenceHttp` and `getIntelligenceIdentityHeaders()` exist | `shared-ui/constants/index.ts:46`, `shared-ui/services/intelligenceHttp.ts`, `intelligenceIdentity.ts:17` |
| `INTELLIGENCE_VARIANCE`, `_ANALYTICAL` and `_IMPACT` endpoint groups exist; there is no `INTELLIGENCE_RULES` | `shared-ui/constants/apiEndpoints.ts:145-167` |
| A snake_case wire converter exists | `features/workbench/impact/wireCase.ts` |
| Assist request (snake_case): `{entry_state, rule, authoring_session_ref, work_begun, draft_provenance, rule_ref?, generate?}`; send **either** `rule` **or** `rule_ref`; `generate:true` only on the author's explicit Draft from anchor | `RulesAssistCoordinator.AssistRequest`; intelligence-ui `rulesApi.assistRules` |
| `ruleRef` is Core's numeric rule id; anything else is a 400 | `RulesAssistController` |
| lexie's rule structure: `{rule_id, rule_kind, version, target, effective_from, effective_to, clauses, instruction_version, status, inputs[], predicates[{id, attribute, op: "IN"\|"NOT IN", values[], clause_ref?}], calculations[]}` | `rules_ops.py` `translate_rule`; intelligence-ui `useRulesWorkspace.ruleForRun` |
| The predicate id is the filter step id in `rule_json`, so patches anchor to graph nodes | `rules_ops.py` `translate_rule` |
| Filter grammar: `a = 'v'`, `a <> 'v'`, `a IN ('x','y')`, `a NOT IN (...)`; anything else is untranslated and not sent as a predicate | `rules_ops.py` `parse_filter`; intelligence-ui `draftModel.parseCoreFilter` |
| Calculations come from `map` steps (`properties.expressions`) and `aggregate` steps (`properties.agg[]`, `group_by`); inputs are step input values starting `rl.` or `ds.` | `rules_ops.py` `translate_rule` |
| The editor graph is `RuleEditorNodeData[]` with `id`, `componentType`, `properties`; filters hold `properties.filter_expression` | `features/rules/utils/ruleGraph.ts:215-223, 589-605` |
| The tab knows `ruleId`, `version`, `latestVersion`, `status`, `isEditable`, `isNew`, `formName`, `nodeCode`, `rulesCategory`; detail-tab state has `isOpenedFromAi` | `features/rules/store/rules.slice.ts` |
| Responses come in `ApiResponse {success, data}`, snake_case; `output.extra_fields` is the render model, read verbatim | intelligence-ui `shell/featureClient.ts`, `renderModel.toRenderModel` |

### 4.3 Readiness

| # | Finding | Impact |
|---|---|---|
| RU1 | `rule_ref` = `String(RuleTab.ruleId)`. A new rule has no `rule_ref`, so R2–R4 are skipped. | — |
| RU2 | Global SNAKE_CASE: `AssistRequest` drops unknown camelCase keys silently | Send snake_case top-level keys; `rule` unchanged |
| RU3 | OPA readiness is all `true` in dev (instruction, catalog, rule store) | Build values, patches and containment are returned. Another deployment must set its own `data.json`; when a gate is off, show "not recorded". |
| RU4 | lexie returns 400 without `X-Client-Id`/`X-User-Id` | Send the identity headers on every call |
| RU5 | `rules.draft` is refused in review; the drafter is bound per deployment (11.8) | Offer Draft from anchor only in `author` on a blank rule; show `draft_status` DRAFTER_UNBOUND / DRAFT_DENIED verbatim |
| RU6 | Registration belongs to the Semantic Layer steward | Show the disabled "operand not registered" state; "Request registration" only via `onRequestRegistration` into semantic-service (11.19) |
| RU7 | Clause binding is never recorded on Core rules (11.15) | When no predicate carries a `clause_ref`, show each clause with a grey "binding not recorded" pill instead of red "no predicate", leave them out of the Understand count, and drop the "will over-report" guide line |

### 4.4 API mapping (base `SERVICE_PREFIX.INTELLIGENCE`)

| # | When | Method + path | Request | intelligence-ui equivalent |
|---|---|---|---|---|
| R1 | Check / Re-check (manual; optionally debounced ≥1.5s after an edit once the panel has run) | `POST api/intelligence/rules/assist` | §4.5 | `assistRules` |
| R2 | Panel opens (existing rule) | `GET api/intelligence/rules/{ruleRef}` | — | `getRule` |
| R3 | Panel opens (existing rule) | `GET api/intelligence/rules/{ruleRef}/siblings` | — | `getRuleSiblings` |
| R4 | Panel opens (existing rule) | `GET api/intelligence/rules/{ruleRef}/instruction` | — | `getRuleInstruction` |
| R5 | After Core saves or approves a version the copilot advised on | `POST api/intelligence/rules/runs/{runId}/acceptance?surface=CORE` | `{accepted_rule_ref, accepted_rule_version}` | service-only |
| R6 | Optional: run history for the session | `GET api/intelligence/rules/sessions/{sessionRef}/runs` | — | service-only |
| — | Not used: the rule catalog (the editor already has its rule) and any registration call | — | — | — |

### 4.5 Assist request: field mapping

| Wire field | Source | Notes |
|---|---|---|
| `entry_state` | `isNew` → `author`; read-only or awaiting checker/approval → `review`; new version of an approved rule → `revise`; otherwise `assist` | Derived from the tab, not a user toggle. Changing state clears the run. |
| `rule` | null while the editor is clean and the rule exists; otherwise `toCopilotRule(...)` | Never raw `rule_json` |
| `rule_ref` | `String(ruleId)` only when `rule` is null | |
| `authoring_session_ref` | `${tabId}@${openedAt}`, stable for the life of the tab | Persistence key for R5/R6 |
| `work_begun` | editor dirty | |
| `draft_provenance` | `isOpenedFromAi ? "lexie_handoff" : "typed"` | On a handoff every operand renders unverified |
| `generate` | `true` only from Draft from anchor | Check never drafts |

**`toCopilotRule`** (editor dirty, or a new rule):

| Field | Value |
|---|---|
| `rule_id` | `String(ruleId)`, or the tab id for a new rule |
| `rule_kind` | R2 `ruleKind`; for a new rule, map the selected rule type name. Unknown → don't call R1; show "choose a rule type first". |
| `version`, `target`, `effective_from`, `status` | From R2 (`version`, `target`, `period`, `ruleStatus`). New rule: `0`, `formName && nodeCode ? \`${formName}.${nodeCode}\` : null`, the toolbar `effectivePeriod`, `"DRAFT"` |
| `effective_to`, `instruction_version` | `null` |
| `clauses` | `[]` |
| `inputs` | live step input values starting `rl.` or `ds.` |
| `predicates` | one per filter node whose `filter_expression` parses: `{id: node.id, attribute, op, values, clause_ref: null}` |
| `calculations` | from live `map` and `aggregate` nodes, shaped as `translate_rule` |
| (local) `untranslated` | filter node ids that didn't parse; listed in the panel |

### 4.6 Change list

| # | File | Change |
|---|---|---|
| C1 | `shared-ui/constants/apiEndpoints.ts` | Add `INTELLIGENCE_RULES: { ASSIST, RULE, SIBLINGS, INSTRUCTION, ACCEPTANCE, SESSION_RUNS }` (§4.4) |
| C2 | `features/rules/assist/` (new): `types.ts`, `renderModel.ts`, `panelModel.ts`, `draftModel.ts`, `copilotRule.ts` | Copy intelligence-ui's DOM-free modules verbatim; point i18n at frontend-service's `t()` and copy the `rules.*` keys. New `copilotRule.ts`: `toCopilotRule(nodes, edges, ruleTab, detail, toolbar)` per §4.5. |
| C3 | `shared-ui/services/intelligenceRulesApi.ts` (new) | `assist`, `getRule`, `getSiblings`, `getInstruction`, `recordAcceptance` (always `?surface=CORE`), `getSessionRuns`. Snake_case requests through the wire converter, with `rule` and `extra_fields`/`output_payload` excluded from conversion. |
| C4 | `features/rules/hooks/useRulesAssist.ts` (new) | Port of `useRulesWorkspace`'s copilot half only (no picker, no rule-service calls), keyed by `tabId`, reading the editor nodes and edges from the rules slice. Same derived state and `guide()`; loads R2–R4 when `ruleId` is set. |
| C5 | `features/rules/utils/applyCopilotPatch.ts` (new) | Applies a patch to the editor graph: MODIFY sets `filter_expression = coreFilter(to)` (or the author's choice from `candidates`); REMOVE deletes the filter node and rewires; ADD inserts a filter node before the first filter. Through the existing editor actions, so undo, dirty and both views stay consistent. Never saves. |
| C6 | `features/rules/assist/components/` (new): `RulesAssistPanel.tsx` + the four tabs | Port intelligence-ui's panel half (not `CoreRuleForm`: Graph and Expression are Core's form). MUI and theme tokens; behaviour per §2 and RU5–RU7. |
| C7 | `features/rules/components/RuleDetailTabs.tsx` | A "Rules Assist" toggle opens a collapsible right-side panel (collapsed by default, state per tab in the slice) mounting `RulesAssistPanel` |
| C8 | `RuleFlowNode.tsx` (and Expression view if feasible) | Read-only decorations: highlight nodes bound to the lit clause; severity outline on nodes named in open, non-stale findings |
| C9 | `RuleWorkFlowActions.tsx` / `RuleToolbar.tsx` save and approve success | If the tab has a copilot run id, call R5 without waiting; never block the save; afterwards findings show stale against the new version |
| C10 | `features/rules/assist/__tests__/` | `toCopilotRule` (fixture graph → predicates, untranslated, calculations, inputs), `applyCopilotPatch` (MODIFY, REMOVE rewire, ADD insert), accept-all excludes REMOVE/ADD, stale accept disabled |

**Out of scope:** `RuleDocumentation`, the MDRM recommendation, the global `AskAi` inline answer (§4.8), the rule save and approve APIs, and any change to intelligence-service, lexie-ai, gateway or config-service.

### 4.7 Validation and risks

**Validate:** `tsc --noEmit`, lint and the new unit tests, then manually:
- **Existing editable rule:**
  - opening the panel calls R2–R4 with the identity headers;
  - Check sends `entry_state:"assist"`, `rule:null` and `rule_ref`.
- **After editing a filter:**
  - the earlier findings show STALE;
  - Re-check sends `rule.predicates` with ids equal to the filter node ids, and no `rule_ref`.
- **Patches:**
  - accepting a MODIFY changes the node in Graph and Expression and leaves the editor dirty, with nothing saved;
  - accept-all never includes REMOVE or ADD;
  - a stale patch is disabled.
- **New rule:** sends `author` with a `rule_kind`; with no rule type chosen, Check is disabled and says why.
- **Read-only rule:** sends `review`; derivations are open, Draft from anchor is hidden, and the review gate shows.
- **Clause binding (RU7):** every Core rule today shows "binding not recorded".
- **Opened from Ask-AI:** sends `lexie_handoff`, and every attribute shows as unverified.
- **Save or approve after a run:** posts the acceptance with `surface=CORE`.
- **Nothing else changes:** existing Rules behaviour is the same with the panel closed.

| Risk | Mitigation |
|---|---|
| Raw `rule_json` sent as `rule` gives empty checks | `toCopilotRule`, with a unit test against a real `rule_json` fixture |
| Missing `rule_kind` is refused | Take it from R2 or the selected type; disable Check when unknown |
| Filter syntax differs from lexie's grammar | Port `parse_filter` exactly; list unparsed filters as "not translated" |
| Patch node ids don't match graph node ids | Predicate id = `node.id` both ways; an unknown `node_id` shows "node no longer in the draft" |
| REMOVE breaks the graph's connections | Port `removeStep`'s rewire, with a unit test |
| Too many R1 calls | Manual Check; debounced re-check only after a first run and only while the panel is open |
| A patch persisted without review | Patches change only local editor state; Core save is the only way to persist |

### 4.8 Follow-ups after §4

- **Inline rule answer in `AskAi`:** render the UC11 inline projection (target, readings, "Accept — open in Rules Authoring") from the same render model; Accept opens the rule tab with `isOpenedFromAi=true`.
- Move `rule-summary` and `mdrm/recommend` behind intelligence-service once proxies exist.

### 4.9 Implementation prompt

```text
TASK: Add the Rules & Logic Assist copilot (UC11) to frontend-service's INDIVIDUAL RULE EDIT screen
(RuleDetailTabs) as a collapsible side panel with four tabs (Understand, Build, Check, Compare), calling
intelligence-service exactly as intelligence-ui does. The copilot returns checks and node-anchored patches only;
accepting a patch edits the graph editor locally. Core keeps owning save, versioning and approval.

REPO: lextr/typescript/frontend-service (change only this repo)
SPEC: utils/prompts-library/Lextr_Intelligence_Final_Package/plan/FrontendService_Rules_Logic_Assist_via_IntelligenceService_Plan.md §2 and §4
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
- assist body: {entry_state, rule, authoring_session_ref, work_begun, draft_provenance, rule_ref?, generate?}.
  Send rule:null + rule_ref=String(ruleId) while the editor is clean and the rule exists; otherwise send
  rule=toCopilotRule(...) and NO rule_ref. generate:true only from Draft from anchor.
- NEVER send serializeRuleGraph / raw rule_json as `rule` (lexie reads rule.predicates only).

STEPS
1. apiEndpoints.ts: INTELLIGENCE_RULES = { ASSIST: "api/intelligence/rules/assist",
   RULE: "api/intelligence/rules/{ruleRef}", SIBLINGS: "api/intelligence/rules/{ruleRef}/siblings",
   INSTRUCTION: "api/intelligence/rules/{ruleRef}/instruction",
   ACCEPTANCE: "api/intelligence/rules/runs/{runId}/acceptance",
   SESSION_RUNS: "api/intelligence/rules/sessions/{sessionRef}/runs" }. No registration endpoints.
2. shared-ui/services/intelligenceRulesApi.ts: assist, getRule, getSiblings, getInstruction,
   recordAcceptance(runId, {accepted_rule_ref, accepted_rule_version}) -> ?surface=CORE, getSessionRuns.
3. features/rules/assist/: copy intelligence-ui types.ts, renderModel.ts, panelModel.ts and the pure helpers of
   draftModel.ts (parseCoreFilter, coreFilter, compose, marksOf, samePredicate, setPredicate); wire i18n to
   frontend-service t() and copy the rules.* message keys.
4. features/rules/assist/copilotRule.ts: toCopilotRule(nodes, edges, ruleTab, detail, toolbar) ->
   {rule_id, rule_kind, version, target, effective_from, effective_to:null, clauses:[], instruction_version:null,
    status, inputs, predicates, calculations} + untranslated[] (plan §4.5). Predicate id = filter node id.
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
   the rule; derivations open only in review; confidence only on generated content (coverage + attributes and
   literals resolved); refusal code/reason verbatim; untranslated filters listed. "Request registration" only
   via onRequestRegistration into semantic-service, never via intelligence-service; show the disabled
   "operand not registered" state. "Draft from anchor" only in author on a blank rule.
   Understand (RU7): if no predicate carries clause_ref (every Core rule today), show each clause with a grey
   "binding not recorded" pill instead of red "no predicate", leave them out of the tab count, and never say
   the rule will over-report. Do not infer bindings from clause text.
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
- Add registration-request calls to intelligence-service, call the rule catalog, or move RuleDocumentation /
  RuleMapTab / AskAi off lexie.
- Touch intelligence-service, lexie-ai, gateway or config-service. Add dependencies, refactor unrelated code,
  commit or push.

VALIDATE
- tsc --noEmit, lint and the new unit tests on frontend-service.
- Report: files changed, validation run and its result, the entry-state mapping used, how rule_kind is resolved
  for new rules, and anything not done.
```

---

## 5. Catalog scope per job (11.17)

**Status:** DEFERRED (decided 2026-10-09: keep the "attributes the rule uses" scope for now). **Repo:** `lextrai/lexie-ai` only; intelligence-service passes `extra_fields` through and intelligence-ui's Build tab already renders unused, not-eligible and withheld attributes.

**Problem.** `rules.get_catalog` returns Semantic Layer entries only for the attributes the rule already uses (`SemanticServiceRulesCatalog.catalog`), and the skill uses that one catalog for every job:

| Job | Needs | Today |
|---|---|---|
| Check (conformance) | The attributes the rule uses | Correct |
| Review (deterministic gate) | The attributes the rule uses | Correct |
| Build ("what can I use?") | Every attribute on the rule's datasets | Lists only attributes already in the rule, so a filter on a new attribute can't be composed |
| Draft from anchor | The dataset's usable attributes | A blank rule gets an empty catalog, so the draft has coverage 0.00 |

**Evidence (2026-10-09):** BHCK3521 with its only filter removed drafted no predicates ("the provided registered-attribute catalog is empty"). With the filter in place Build shows one card (`internal_reg_coa`) while `regulatory_ledger_ds` has 24 registered attributes. The JSX Build tab lists every attribute on the object, including unused and not-eligible ones.

**Design (when picked up).** Split the catalog by job; the policy layer is unchanged.
1. `rules_semantic.py`: keep `catalog(client_id, rule)` for the operands; add `dataset_catalog(client_id, rule, limit=200)` returning every exposed attribute of the rule's `ds.*` objects (same entry shape plus `used`), from the same object and domain reads, with `truncated: true` past the cap. No widening for a rule with no `ds.*` input.
2. `_TenantRules`: add `get_dataset_catalog(rule)` (None when unavailable).
3. `skills/rules/skill.py`: under the existing `rules.get_catalog` decision (no new op, so `adapter_ops`, the manifest and Rego stay identical) and never in review. Conformance keeps the operand catalog; Build's `attributes` come from the dataset catalog; the drafter gets it filtered to rules-eligible and AI-exposed (exposure not BLOCKED).

Semantic-service still applies need-to-know, classification, masking and AI blocking to every attribute; lexie still applies POL-DM-001 to values. In dev today only `internal_reg_coa` on `regulatory_ledger_ds` is semantic-enabled, so Build would list the rest as not rules-eligible with values withheld, and the drafter would still see one attribute until a steward enables more.

**Tests:**
- Build lists unused attributes (`used=false`) and keeps `predicate_ids` on used ones.
- The draft context excludes attributes that are not rules-eligible, not AI-exposed or BLOCKED, and a blank rule gets a non-empty context.
- Conformance is unchanged.
- Review makes no dataset read.
- A rule with only `rl.*` inputs gets no widening.
- The cap reports `truncated`.
- An attribute semantic-service withholds never appears.

**Risks:** larger payloads on wide objects (cap plus `truncated`); the drafter sees more attributes (only eligible and AI-exposed ones); a crowded Build list (expected, as in the JSX).

```text
TASK: Split UC11's catalog by job in lexie-ai. Check and Review keep the attributes the rule uses; Build lists every attribute
semantic-service exposes on the rule's ds.* objects; the drafter gets only rules-eligible AND AI-exposed attributes.

REPO: lextrai/lexie-ai (change only this repo)
SPEC: utils/prompts-library/Lextr_Intelligence_Final_Package/plan/FrontendService_Rules_Logic_Assist_via_IntelligenceService_Plan.md §5

STEPS
1. lexie_ai/adapter/rules_semantic.py: add dataset_catalog(client_id, rule, limit=200) -> {"attributes": {...}, "truncated": bool},
   same entry shape as catalog() plus "used"; one object-detail read per ds.* object and one domain read per domain, shared with
   catalog(). No widening when the rule has no ds.* input.
2. lexie_ai/adapter/rules_ops.py _TenantRules: get_dataset_catalog(rule) -> dict | None (None when unbound or unavailable).
3. skills/rules/skill.py: under the existing rules.get_catalog decision (no new op), and not in review: read the dataset catalog;
   conformance keeps the operand catalog; "attributes" come from the dataset catalog; the drafter context gets it filtered to
   rules_eligible and ai_exposed (exposure not BLOCKED).
4. Tests per §5.

DO NOT
- Add an op, change adapter_ops / skill.manifest.json / Rego, or touch intelligence-service or intelligence-ui.
- Read Semantic Layer tables directly; read only through semantic-service.

VALIDATE
- pytest tests/rules (the pre-existing test_origin_vocabulary_agrees_sql_and_java failure is known).
- Live: BHCK3521 Build lists regulatory_ledger_ds attributes; Draft from anchor on a blank rule gets a non-empty context.
```
