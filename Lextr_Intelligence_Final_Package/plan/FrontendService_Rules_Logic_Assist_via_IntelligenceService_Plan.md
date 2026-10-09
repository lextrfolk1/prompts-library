# frontend-service Rules & Logic Assist (UC11) via intelligence-service: Status, Pending Work and Plans

- **Last updated:** 2026-10-10
- **Branch:** `feature/lextr-intelligence-v1.38.0` (intelligence-service, lexie-ai, intelligence-ui); `feature/rules-logic-assist` (frontend-service, uncommitted)
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
| frontend-service | `src/features/rules/assist/` (panel, four tabs, `useRulesAssist`, `copilotRule` = TS port of `translate_rule`, `applyCopilotPatch`), `shared-ui/services/intelligenceRulesApi.ts`; toggle and panel in `RuleDetailTabs`; receipt after Core's save / APPROVE (§4). Uncommitted. |
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

**frontend-service validation (2026-10-10):**

| Check | Result |
|---|---|
| vitest `src/features/rules` | 6 files, 31 tests pass |
| eslint (touched paths) | new files clean; edited Core files keep their existing counts |
| tsc | whole project runs out of memory even on `main` (`src/shared-ui/interfaces/index.ts`); the pure assist modules typecheck with 0 errors; the rest NOT CHECKED by tsc |
| Live API flow (panel modules, in screen order, dev gateway) | 8/8: VIEW review; revise with a REMOVE patch accepted on the graph and re-checked (no findings, persisted); assist after a Build edit; new rule; 176 Draft from anchor; Lexie handoff; guards (unsupported type makes no call, review never drafts, `surface=PANEL` 422); only `/api/intelligence/rules/*` called, never `/lexie/ai` or rule-service save/workflow |
| Browser UI | NOT CHECKED |
| Findings | Empty drafts (11.17, 11.31, 11.33) and no anchor for a new empty rule (11.29, 11.30, 11.32) |

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
| 11.3 | Core mounts the copilot in its rule editor (§4): VIEW (MDRM popup, pending approval) and EDIT (Rules workspace tab), with entry state, rule, version, authoring session, work begun, patches into the graph and the acceptance receipt | Lextr Core (frontend-service) | — | Implemented, uncommitted (`feature/rules-logic-assist`, 2026-10-10); browser UI not checked |
| 11.8 | Choose the drafter for `rules.draft` (`LEXIE_RULES_DRAFTER`) in each deployment; only a model approved for this data | Intelligence / Deployment | Model approval | Bound in dev |
| 11.9 | Relabel the Supervisory Radar off UC11 (`skills/supervisory_radar_skill.py`, `SupervisoryRadarCoordinatorImpl.java:206`, the `useCaseAliases.ts` sources). Ask Lexie works around it for rules answers. | Owner | Radar id | Deferred |
| 11.10 | Ledger decision ids are always null: the dev OPA server has no decision logging | Platform / Deployment | OPA config | Open (platform-wide) |
| 11.11 | Ledger ctx is not stored: `EstateLedgerServiceImpl.estateRecord` keeps only `actor`, `track` and `to` | Intelligence (shared ledger) | Shared-service approval | Open (platform-wide) |
| 11.12 | A rules kind in HistoryDrawer `RECORD_KINDS` (backed by `GET /sessions/{ref}/runs`) | Intelligence | Decision | Deferred |
| 11.13 | Push the local commits (§1) | Owner | Review | Open |
| 11.14 | Dev test data: run `uc11-httpcheck-*` and about 330 SUGGEST ledger rows from the 2026-10-09 sweep, in the dev tenant | Owner | — | Delete when no longer needed |
| 11.15 | **Clause binding is never recorded on Core rules**, so every clause shows "no predicate" and the guide says the rule "will over-report". Store `clause_ref` on the filter step's `properties` in `rule_json` and have `translate_rule` read it; tell requirements from notes (cross-references, glossary, comparability) in the MDRM source; later, suggest a binding (POSSIBLE) for the author to confirm. | Lextr Core (rule-service, editor) + lexie-ai | Core change | Open |
| 11.16 | Logical names and value descriptions: semantic-service holds no logical name for `internal_reg_coa` (the code is shown) and no descriptions for COA values | Semantic Layer | Data | Open |
| 11.17 | Catalog scope per job (§5): Build lists only the attributes the rule uses, and a blank rule drafts against an empty catalog (coverage 0.00). Confirmed live 2026-10-10: rule 176's draft is GENERATED with 0 predicates, model rationale "the provided registered-attribute catalog is empty" (`rules_semantic.py:71-73`). **Needed when** Draft from anchor or Build composition is part of a demo or release; Check, Review, patches and Compare work without it. | lexie-ai | Backend unfreeze | Built 2026-10-10, uncommitted; live check after lexie-ai restart |
| 11.18 | Handoff provenance (Lexie run id, semantic coverage, resolved n/m, language) in the Ask Lexie → Rules handoff, so the arrival banner can show it | lexie-ai | Handoff payload | Open |
| 11.19 | A semantic-service endpoint that raises the steward's registration task (`wkfl.workflow_task`: entity, rule ref, requested by), passed to the panel as `onRequestRegistration` | Lextr Core (semantic-service) | — | Open |
| 11.20 | Ship a Spanish catalogue. The i18n runtime ships only complete catalogues (all codes; `localeCatalogue.test.ts`), so Spanish can't be enabled for Rules alone. | Intelligence | Translation source and review | Open (decided 2026-10-09: wait) |
| 11.21 | Which tab Check opens. Today it follows the guide, which on Core rules is almost always Understand because of 11.15. Options: go to Check when there are findings; stay on the current tab; keep following the guide. | Owner | Decision | Decision |
| 11.22 | Retired-value patches and accept-all can't be seen in dev: no dev rule uses a retired value (the code path is fixed and tested against the live OPA) | Semantic Layer / Owner | Test data | Open |
| 11.23 | frontend-service sends `X-User-Functions` from the build env (`VITE_LEXTR_FUNCTIONS`, as Impact does), not the logged-in user's functions; the shared `intelligenceIdentity` has no functions | Lextr Core (frontend-service / auth) | User functions in the profile | Open |
| 11.24 | The inline UC11 rules answer in frontend-service `AskAi` (LP-25.9, DD-40: Core draws it from the render model); AskAi keeps `/lexie/ai/` query → expression today | Lextr Core (frontend-service) | §4 done | Deferred |
| 11.25 | Core leaves the graph editable on a PENDING_APPROVAL rule (only Save is hidden, `RuleToolbar.tsx:703`); the panel treats it as `review` and offers no writes, but Core's own editor doesn't lock | Lextr Core (frontend-service) | Decision | Open |
| 11.26 | An unsaved (new or cloned) rule has no `target`: lexie's target is `form_nm.taxonomy_nm` and the editor tab holds no taxonomy name before save, so the panel sends `target:null` (instruction and siblings come only after save or a first Check) | Lextr Core (frontend-service) | — | Open; fix planned as 11.30 |
| 11.27 | Core rule types `DATASET`, `TAXONOMY`, `CHILDRULE` and `LEDGER` have no copilot `rule_kind`; the panel disables Check with the reason. Whether UC11 should cover them is a product decision. | Owner | Decision | Decision |
| 11.28 | **Empty draft reads as success.** When a draft is GENERATED with 0 predicates, the guide says "Drafted. Grounding coverage is 0.00 — open Understand…". Fix: the guide and Understand say "Nothing was drafted" and show the model's rationale verbatim; the confidence block stays (it is generated content). Hook `guide()` and `UnderstandTab`. | Lextr Core (frontend-service) | — | Done 2026-10-10 (frontend-service, uncommitted) |
| 11.29 | **A new, empty rule dead-ends.** With no input and no target, lexie finds no siblings (`siblings_of` matches only a shared input or the same target, `rules_ops.py:199-212`), so there is no anchor and no Draft from anchor. Fix: when the rule is `author`, blank and reads no `ds.`/`rl.` input, the guide says to add the step that reads the dataset, then Check. | Lextr Core (frontend-service) | — | Done 2026-10-10 (frontend-service, uncommitted) |
| 11.30 | **Target for an unsaved rule** (fixes 11.26). Reuse Core's own match (`RuleMapTab.tsx:246-257`: the form's MDRM line whose `taxonomyId` equals the rule name) and send `target = <form>.<line>`; keep `null` when there is no match. Gives same-target siblings, a better anchor than a shared dataset (test: 127's anchor 117 shares only the dataset, 0% containment, verdict "related"). | Lextr Core (frontend-service) | Confirm the new rule's `formName` is the form code (`CreateRule` sets it from the tree node's name) | Built 2026-10-10, uncommitted; live check after lexie-ai restart |
| 11.31 | **`rl.`-only rules stay empty after §5.** Rule 176 reads only `rl.BHCK3521`; §5 says "no widening for a rule with no `ds.*` input", so its draft would still be empty. Amend §5: follow an `rl.X` input back to rule X's `ds.*` inputs (depth cap) for the dataset catalog. **Needed together with 11.17.** | lexie-ai | Backend unfreeze | Built 2026-10-10, uncommitted; live check after lexie-ai restart |
| 11.32 | **Sibling fallback by form** for a rule with no input and no target: match rules on the same form (e.g. FRY9C) as a weaker anchor. **Needed only if 11.30 can't supply the target.** | lexie-ai | 11.30 outcome | Optional |
| 11.33 | **Enable more attributes for rules** in semantic-service (data, not code). Only `internal_reg_coa` on `regulatory_ledger_ds` is rules-eligible in dev, so even after 11.17 the drafter sees one attribute. **Needed before drafts are worth showing.** | Semantic Layer steward | — | Open (data) |
| 11.34 | **Formula check** against the instruction (§6): an excluded item used, a line copying another line, an included item missing. Flags BHCK3196 (`AMOUNT_BHCK3521 + 0`, clause 5 excludes item 3521). | lexie-ai | Go-ahead | Built 2026-10-10, uncommitted; live check after lexie-ai restart |
| 11.35 | **Demote `PREDICATE_UNTRACEABLE`** while clause binding is unrecorded: POSSIBLE, no REMOVE patch (§6) | lexie-ai | Go-ahead | Built 2026-10-10, uncommitted; live check after lexie-ai restart |
| 11.36 | Copy for the §6 codes in both renderers | frontend-service, intelligence-ui | 11.34 | Built 2026-10-10, uncommitted; live check after lexie-ai restart |
| 11.37 | **Draft the whole rule** (steps, not only predicates) (§6) | lexie-ai | Slice 1 accepted | Planned (slice 2) |
| 11.38 | **Apply the draft to the graph** (§6) | frontend-service | 11.37 | Planned (slice 2) |
| 11.39 | **Column lookup fails for rule inputs.** Core's node properties panel calls `POST /rules/api/metadata/dataset/{name}` for every input value (`RulePropertiesPanel.tsx:613-679`, `selectedDatasets`), including `rl.*` rule outputs (500 "Dataset not found with name: rl.BHCKB488") and upstream node outputs (`filter_0_out0`). It uses `Promise.all`, so one failure empties the column list for the whole node, `ds.*` columns included. A calculated rule's formula builder therefore offers no columns (e.g. `AMOUNT_BHCKB488`) and the author types them. Fix (§6): only `ds.*` goes to the metadata endpoint; an `rl.X` input takes its columns from rule X's outputs (rule-service read: `search-rule` → `fetch-rule-by-name-and-version` → map outputs, aggregate columns and group-by); `Promise.allSettled` so one input can't blank the others. | Lextr Core (frontend-service) | Go-ahead | Built 2026-10-10, uncommitted; live check after lexie-ai restart |

**Open decisions:** whether Draft from anchor and Build composition are in the next demo or release, which is what makes 11.17, 11.31 and 11.33 needed; the radar's use-case id (11.9); the drafter outside dev (11.8); which tab Check opens (11.21); rule kinds for other Core types (11.27); frontend-service Q1–Q4 (§4.10).

---

## 4. frontend-service integration (Core's rule editor)

**Status:** IMPLEMENTED, uncommitted, on `feature/rules-logic-assist` (2026-10-09). Q1–Q4 resolved as proposed. Unit tests (31) pass. A live API flow test passed 8/8 on 2026-10-10: the panel's own modules called in screen order against the dev gateway (VIEW, revise with a REMOVE patch accepted and re-checked, assist, new rule, rule 176 draft, Lexie handoff, guards, network). Browser UI NOT CHECKED. A brand-new blank rule gets no siblings, so Draft from anchor never shows for it. Deviation: the R5 receipt is sent only when the run had at least one accepted patch. **Repo:** `lextr/typescript/frontend-service`, branch `feature/rules-logic-assist` (from local `main`).
**Where it lives:** one rule's detail screen, `features/rules/components/RuleDetailTabs.tsx` (tabs Graph, Expression, Rule Lineage, Rule Map, Execution). It renders in two hosts:
- **EDIT:** the Rules workspace (`RulesTabs.tsx:97`). The tab id is `${ruleName}::${version}` (`rules.slice.ts:159`).
- **VIEW:** the Workbench MDRM popup (`features/workbench/components/MdrmRules.tsx:62`), opened `isEditable:false, hideToolbar:true`.

**Reference implementation:** `lextrai/intelligence-ui/src/features/rules/`. Port the pure modules, the four tabs and the panel header. Do not port `RulePicker`, `CoreRuleForm`, `coreRulesApi`, the entry-state switcher or `patchRuleJson`: in frontend-service, Core's editor is the form.

```
frontend-service RuleDetailTabs ──${VITE_GATEWAY_URL}/lexie/intelligence/api/intelligence/rules/*──▶ gateway ──▶ intelligence-service ──▶ lexie-ai POST /run (UC11), rule store
  (VIEW popup / EDIT tab)          X-Client-Id, X-User-Id (intelligenceHttp interceptor)              (RulesAssistController,
                                   X-User-Functions (per call, VITE_LEXTR_FUNCTIONS, as impactApi)      RulesAssistCoordinator)
```

**Key decisions:**
- **The panel is a copilot.** It never saves, approves or blocks. Save stays `RuleToolbar.handleSaveRule` and workflow stays `RuleWorkFlowActions.handleWorkflowAction`.
- **The `rule` payload is the translated structure, never raw `rule_json`.** `toCopilotRule` is a TypeScript port of `rules_ops.translate_rule` over `serializeRuleGraph(editor.nodes, editor.edges, ruleName)`, the same payload Core saves. Predicate id = filter node id = rule_json step id (`ruleGraph.ts:363,481` keep `component.id`).
- **The host sets the entry state; the panel has no switcher** (§4.5.1).
- **Patches edit the live graph through the editor's own Redux actions** (`updateRuleEditorNode`, `setRuleEditorGraph`). Graph and Expression both read `state.rules.editors[tabId]` (`RuleGraphEditor.tsx:323-350`, `RuleExpressionTab.tsx:85-86`), so both views follow and the existing dirty check (`RuleToolbar.isRuleChanged`) sees the change. Nothing is saved.
- **Panel state lives in the rules slice**, under `ruleDetailTabs[tabId].assist`. `switchRuleVersion` migrates it (`rules.slice.ts:537`) and `closeRuleTab` drops it (`:212`). Nothing goes in browser storage.
- **Registration is not an intelligence-service call.** frontend-service passes no `onRequestRegistration` (11.19 is open), so the panel shows the disabled "operand not registered" state and no request button.

### 4.1 Lexie usage in Rules: what stays on direct lexie

| Today | File | API (direct lexie, `/lexie/ai/`) | Plan |
|---|---|---|---|
| Rule documentation summary | `RuleDocumentation.tsx:59` → `lexieApi.fetchRuleSummaryV2` | `POST api/v1/chatbot/ai/rule-summary` | Keep on lexie, unchanged |
| MDRM recommendation | `RuleMapTab.tsx:316` → `ruleApi.fetchMdrmRecommendation` | `POST api/v1/chatbot/ai/mdrm/recommend` | Keep on lexie, unchanged |
| Ask-AI query → expression (rule authoring) | `AskAi.tsx:31-60` (streams `FETCH_EXPRESSION_FROM_QUERY`), approval `AskAi.tsx:499-517` | `POST api/v1/chatbot/ai/query` | Keep on lexie, unchanged. Its approved rule is the **lexie handoff** (§4.5.3). |
| AskAi inline UC11 rules answer (LP-25.9, DD-40) | none | — | **Out of scope** (11.24) |
| **Rules copilot** | none | — | **New**, through intelligence-service only. It never calls `/lexie/ai/`. |

### 4.2 Facts (verified 2026-10-09)

| # | Fact | Evidence |
|---|---|---|
| F1 | The gateway routes `/lexie/intelligence/**` to intelligence-service (prefix stripped) | `gateway-service.yml:155-160` |
| F2 | `SERVICE_PREFIX.INTELLIGENCE = "/lexie/intelligence/"` exists. `intelligenceHttp` adds `X-Client-Id` (env `VITE_LEXTR_CLIENT_ID`) and `X-User-Id` (logged-in user) on every request. | `shared-ui/constants/index.ts:46`, `shared-ui/services/intelligenceHttp.ts:8-14`, `intelligenceIdentity.ts:17-20` |
| F3 | `X-User-Functions` is **not** in the shared interceptor. impactApi adds it per call from `VITE_LEXTR_FUNCTIONS` (`analyst` in `.env`/`.env.development`); with none set it refuses `NO_IDENTITY`. | `features/workbench/impact/impactApi.ts:34-42` |
| F4 | Endpoint groups exist for `INTELLIGENCE_VARIANCE`, `_ANALYTICAL` and `_IMPACT`; there is no `INTELLIGENCE_RULES` | `shared-ui/constants/apiEndpoints.ts:145-167` |
| F5 | There is a snake_case wire converter with `opaque` / `responseOpaque` | `features/workbench/impact/wireCase.ts` |
| F6 | Controller base `/api/intelligence/rules`. `assist`, `runs/{runId}/acceptance` and `sessions/{ref}/runs` need `X-Client-Id` + `X-User-Id`; `X-User-Functions` is optional. Acceptance needs `?surface=` and only accepts `CORE`, else 422 `SURFACE_NOT_CORE`. | `RulesAssistController.java:34-70`, `RulesAssistCoordinator.java:154-160` |
| F7 | `AssistRequest(entryState, invocationOrigin, authoringSessionRef, workBegun, rule, draftProvenance, correlationId, locale, ruleRef, generate)`. With no origin, the origin is the header user. | `RulesAssistCoordinator.java:52-54, 189-194` |
| F8 | `translate_rule`: predicates come from `filter` steps (`params.properties.filter_expression` via `parse_filter`, `id` = step id); unparsed filters go to `untranslated`; calculations come from `map` (`expressions`) and `aggregate` (`agg[]`, `group_by`); inputs are step input values starting `rl.`/`ds.`; `target = form_nm.taxonomy_nm`; `rule_kind = RULE_KINDS[type.lower()]`, otherwise the raw type passes through and is refused | `lexie_ai/adapter/rules_ops.py:50-51, 118-133, 158-194` |
| F9 | The editor keeps step ids and serialises back to Core's legacy `{workflow, connection}` shape, with filter `properties.filter_expression`, map `properties.expressions`, aggregate `properties.{group_by, agg}` | `ruleGraph.ts:363, 481, 589-700` |
| F10 | Editor input references are `inputValues[key] = "${label}_${port}"`. Deleting a node drops its edges but **does not rewire** them. | `rules.slice.ts:111-143, 374-394`; `RuleGraphEditor.tsx:489-505` |
| F11 | No undo history exists in the editor | (no undo/history in `RuleGraphEditor.tsx` or `rules.slice.ts`) |
| F12 | Rule types are `DATASET, REPORT, DATA QUALITY, EDIT CHECK, TAXONOMY, CHILDRULE, LEDGER`. CreateRule requires a type, and the tab detail carries `ruleTypeName` / `ruleTypeId`. | `constants/ruleTypes.ts:1-9`; `CreateRule.tsx:152, 185, 217` |
| F13 | `isOpenedFromAi` is **transient**: AskAi approval sets it (`AskAi.tsx:508-512`), every Graph/Expression switch resets it to false (`rules.slice.ts:419` via `RuleDetailTabs.tsx:399`), and RuleExpressionTab clears it once applied (`RuleExpressionTab.tsx:69-73`) | as cited |
| F14 | `DynamicTabs` has a `rightContent` slot on the tab strip, which is visible in both hosts (VIEW hides the toolbar) | `shared-ui/components/Tabs.tsx:39, 154-164`; `RuleDetailTabs.tsx:353` |
| F15 | Copy: Rules uses the server locale `t(key, fallback)` (`useRulesLocale.ts`); the impact port keeps its own verbatim `messages.ts`. Theme: impact's `tokens.ts` maps the MUI theme to intelligence-ui's colour roles. | `features/workbench/impact/{messages,tokens}.ts` |
| F16 | Tests: vitest + Testing Library are installed with no `test` script (`npx vitest run <path>`); `lint` = `eslint .`, `build` = `tsc --noEmit && vite build`; existing rules test `store/rules.slice.test.ts` | `package.json` |

### 4.3 frontend-service flows (B1–B4)

**B1 – VIEW vs EDIT, and the maker-checker states.**
- Editability is per tab: `RuleTab.isEditable`, default `true` (`rules.slice.ts:165`), read by `createIsEditableByTabIdSelector` (`rules.selector.ts:118-121`).
  - Only the Workbench MDRM popup opens a rule read-only (`MdrmRules.tsx:62`).
  - When read-only, the palette is hidden (`RuleGraphEditor.tsx:839`), the Expression editor is read-only (`RuleExpressionTab.tsx:226`) and node controls are disabled (`RuleFlowNode.tsx:739-786`).
- Workflow states are `draft, pending_approval, rejected, discarded/discard, approved` (`shared-ui/constants/enums.ts:14-21`).
  - Menu (`workflowActions.tsx:21-71`): DRAFT offers SUBMIT and DISCARD; PENDING_APPROVAL offers APPROVE, REJECT, SEND_BACK and RECALL; REJECTED offers resubmit and DISCARD; APPROVED and DISCARDED offer nothing.
- In PENDING_APPROVAL the toolbar hides Save (`RuleToolbar.tsx:~703`, `!isPendingApproval`), but the graph stays editable (11.25).
- rules-service saves a DRAFT in place. Saving an APPROVED, REJECTED or DISCARD rule creates version max+1 as DRAFT (`rules-service RuleServiceImpl.java:207-233`). Editing an approved rule in the Rules workspace therefore means authoring a new version.
- New rules: CreateRule opens `ruleId:0, version:0, isNew:true` (`CreateRule.tsx:172-200`). Clone opens `ruleId:0, version:0` without `isNew` (`RuleWorkFlowActions.tsx:350-371`).

**B2 – Where the panel fits.**
- A "Rules Assist" toggle goes in `DynamicTabs.rightContent` in `RuleDetailTabs`, so both hosts get it, the toolbar-less VIEW popup included.
- When open, the tab body becomes a two-column flex: Core's tabs on the left (`flex:1`), the panel on the right (fixed width, about 400px, own scroll, collapsible).
- The panel is shown only on the Graph and Expression tabs. Lineage, Rule Map and Execution keep full width while the toggle stays on.
- The MDRM popup is 70vh tall (`MdrmRules.tsx:108-111`), so the panel scrolls inside it.

**B3 – Today's Lexie authoring flow, end to end.**
1. AskAi (screen `rules`) puts the active rule's `ruleJson` into the chat context and hydrates a physical expression (`AskAi.tsx:225-321`).
2. It streams `POST /lexie/ai/api/v1/chatbot/ai/query` (`AskAi.tsx:31-60`); `generate_rule_from_query` returns an expression (`:458`).
3. On approval, AskAi dispatches `activateRuleDetailTab({detailTabId:"expression", isOpenedFromAi:true, expression})` on the active rule tab (`:499-517`).
4. RuleExpressionTab writes that expression into the draft and clears the flag (`RuleExpressionTab.tsx:69-77`).
5. Switching to Graph converts it to graph nodes (`RuleDetailTabs.tsx:386-392` → `executionApi.expressionToRule`).

The AI-authored mark is that transient flag (F13), so the copilot latches it (§4.5.3).

**B4 – Save, version and approve paths (where the acceptance receipt goes).**
- **Save:** `RuleToolbar.handleSaveRule` → `ruleApi.saveRule(payload)`. On success it dispatches `setRuleDetail`, `setOriginalRuleDetail` and `updateRuleTab({ruleId, isNew:false, status, version, latestVersion})` (`RuleToolbar.tsx:~370-410`). The receipt is sent after that `updateRuleTab`, with `accepted_rule_ref = savedRuleId`, `accepted_rule_version = responseData.version`.
- **Workflow:** `RuleWorkFlowActions.handleWorkflowAction` → `ruleApi.updateRuleWorkflow` → `setRuleDetail` and `updateRuleTab({status, version})` (`RuleWorkFlowActions.tsx:144-195`). The receipt is sent there only when `action === "APPROVE"`.
- **Version switch:** `switchRuleVersion` moves the tab to `${ruleName}::${v}` and drops that tab's editor and detail (`rules.slice.ts:508-545`). Findings then show STALE against the new version (`isStale`, version mismatch).

### 4.4 Readiness

| # | Finding | Impact |
|---|---|---|
| RU1 | `rule_ref = String(ruleId)` when `ruleId > 0`. A new or cloned rule (`ruleId` 0 or null) has no `rule_ref`, so R2–R4 are skipped. | Compare is empty until saved; Draft from anchor needs an anchor (§4.5.4) |
| RU2 | Global SNAKE_CASE: `AssistRequest` silently drops unknown camelCase keys | Snake_case top-level keys; `rule` opaque; response `extra_fields`/`output_payload`/`workflow` opaque |
| RU3 | OPA readiness is all `true` in dev | Other deployments set their own `data.json`. When a gate is off, show "not recorded". |
| RU4 | 400 without `X-Client-Id`/`X-User-Id` | Shared interceptor (F2) plus `X-User-Functions` per call (F3) |
| RU5 | `rules.draft` is refused in review; the drafter is bound per deployment (11.8) | Draft from anchor only in `author` on a blank rule; show `draft_status` DRAFTER_UNBOUND / DRAFT_DENIED verbatim |
| RU6 | Registration belongs to the Semantic Layer steward (11.19) | Disabled "operand not registered" state; no request button (no `onRequestRegistration`) |
| RU7 | Clause binding is never recorded on Core rules (11.15) | If no clause has `bound_predicate_ids` and no live predicate carries `clause_ref`: grey "binding not recorded" pill instead of red "no predicate"; unbound count 0 (no Understand badge); the `guide.unbound` / `blockingUnbound` lines (with "will over-report") never show; no binding inferred from clause text |

### 4.5 Host contract

#### 4.5.1 Entry state (derived, never a toggle)

| Screen | Condition (first match) | `entry_state` | Why |
|---|---|---|---|
| VIEW | `isEditable === false` (MDRM popup) | `review` (**Q1**) | Read-only, so a deterministic gate with no generation and derivations open. A plain approved rule is the main case here; see Q1. |
| VIEW | status `pending_approval` | `review` | The checker's gate (LP-25.6). Save is hidden by Core. |
| EDIT | `isNew` or `!ruleId` (create, clone) | `author` | Blank or cloned rule |
| EDIT | status `approved`, `rejected`, `discard`/`discarded` | `revise` | Saving creates a new version (B1). **Q2** confirms rejected/discarded. |
| EDIT | otherwise (`draft`) | `assist` | Editing a draft in place |

- Status is `detail.status ?? ruleTab.status`, normalised as `workflowActions.normalizeStatus` does (lower case, spaces to `_`).
- A change of entry state (for example after Submit, or a version switch) clears the run, the accepted findings and `wantDraft`.
- "VIEW" in the panel means `entry_state === "review"`, which hides every write affordance (§4.5.5).

#### 4.5.2 Assist request: field mapping

| Wire field | Source | Notes |
|---|---|---|
| `entry_state` | §4.5.1 | |
| `rule` | `null` when the editor is **clean** and `ruleId > 0`; otherwise `toCopilotRule(...)` | Never raw `rule_json`. VIEW is always clean, so VIEW always sends `rule:null`. |
| `rule_ref` | `String(ruleId)` only when `rule` is null | |
| `authoring_session_ref` | `assist.sessionRef = ${tabId}@${firstOpenedAt}`, set once on first panel open and kept across `switchRuleVersion` | Needed for persistence (R5/R6) |
| `work_begun` | editor dirty | |
| `draft_provenance` | `assist.aiAuthored ? "lexie_handoff" : "typed"` | §4.5.3 |
| `generate` | `true` only from Draft from anchor (and re-checks in `author` after it) | Check never drafts; never in `review` |

**Clean** means `fingerprint(serializeRuleGraph(editor))` equals `fingerprint(originalRuleDetails[tabId].ruleJson)` (the same normalisation as `RuleToolbar.normalizeRuleJson` and `isRuleJsonEqual`), and no pending Expression draft differs from the graph. An uninitialised editor counts as clean.

**`toCopilotRule(nodes, edges, ruleTab, detail, toolbar, r2)`** returns `{rule, untranslated}`. The rule is `translate_rule(serializeRuleGraph(nodes, edges, ruleName))` with:

| Field | Value |
|---|---|
| `rule_id` | `String(ruleId)` when > 0, else `tabId` |
| `rule_kind` | R2 `ruleKind` when R2 is OK; else map `detail.ruleTypeName`: REPORT→`reporting`, DATA QUALITY→`data_quality`, EDIT CHECK→`edit_check`. Unknown or empty → no call; Check disabled with "Rules Assist covers report, data-quality and edit-check rules; this rule's type is {type}". |
| `version` | `ruleTab.version` (0 for new) |
| `target` | R2 `target`; new rule: `null` (11.26: Core holds no taxonomy name for an unsaved rule) |
| `effective_from` | toolbar `effectivePeriod` (ISO), else R2 `period`, else null |
| `effective_to`, `instruction_version` | `null` |
| `clauses` | `[]` |
| `status` | `detail.status` upper-cased, `DRAFT` for new |
| `inputs`, `predicates`, `calculations` | as `translate_rule` (F8); predicate `{id: node.id, attribute, op, values}`; `parse_filter` ported exactly (intelligence-ui `parseCoreFilter`) |
| local `untranslated` | filter node ids that didn't parse; listed in Check as "not translated: {ids}" |

#### 4.5.3 Lexie relationship

- Lexie authoring (AskAi), rule-summary and mdrm/recommend stay on direct lexie, unchanged (§4.1).
- **AI-authored provenance:** `activateRuleDetailTab` sets a sticky `assist.aiAuthored = true` when called with `isOpenedFromAi:true`. Nothing else resets it, so tab switches (F13) don't lose it.
  - It clears when that tab saves successfully, because the saved rule is then Core's typed record (**Q3**).
  - While it is set, `/assist` sends `draft_provenance:"lexie_handoff"`; Build marks every attribute unverified (`panelModel.unverified`); a provenance banner shows "Drafted by Lexie from Ask AI".
  - This adds one field to that reducer. It doesn't touch AskAi.
- **The AskAi inline UC11 answer is out of scope** (11.24). AskAi keeps answering through `/lexie/ai/`.

#### 4.5.4 Anchor and Draft from anchor

- Draft from anchor shows only in `author` on a blank rule (no live predicates and no generated draft) when `anchor != null`.
- The anchor is `model.disposition.anchor`, or the first non-superseded sibling.
- A new rule has no `rule_ref` and so no R3 siblings. Its siblings arrive only from a first Check (`model.siblings`), so a blank new rule's flow is Check → Compare → Draft from anchor.
- The generated draft is shown, never applied by itself. Accepting the draft into the graph is out of scope, as in intelligence-ui, where it renders in Understand.

#### 4.5.5 Where frontend-service keeps each §2 rule

| §2 rule | Enforced at |
|---|---|
| Embedded beside Core's form, no route; the host owns entry states | `RulesAssistPanel` mounted only by `RuleDetailTabs`; entry state from `useRulesAssist.entryStateFor(ruleTab, detail)`; no switcher, no route |
| `rule_kind` required, never defaulted | `toCopilotRule` returns `rule_kind:null` → hook blocks the call and shows the reason; unit test |
| REVIEW never generates | `generate` only when `entry==="author"`; Draft button hidden outside author; unit test |
| Accept is a node patch; accept-all reads `auto_acceptable`, no REMOVE/ADD | `applyCopilotPatch` (graph) + `panelModel.autoAcceptable` verbatim; unit test |
| Stale patch can't be accepted; stale shown | `isStale(model, ruleTab.version, computedFingerprint, liveFingerprint)`; Accept/Replace disabled; STALE pills; unit test |
| No browser storage, no `<a href>` | state in the rules slice only; buttons only; source-scan unit test |
| Logical names; values only governed AND rules-eligible; retired locked | BuildTab port as is |
| Confidence only on generated content | UnderstandTab/CheckTab port as is |
| Derivations collapsed authoring, open in review | `derivationsOpen(entry)` |
| Arrived draft: every operand unverified | `assist.aiAuthored` → `lexie_handoff` → `unverified()` |
| Identity in headers; acceptance only `surface=CORE` | `intelligenceRulesApi` (headers per call, `surface` hard-coded `CORE`, not a parameter) |
| Never blocks the conventional path | panel collapsed by default; no Core control disabled or wrapped; receipt fire-and-forget after Core's success branch |
| VIEW write-free | `entry==="review"` hides Accept, Replace-with, Accept-all, Build In/Out + Apply, Draft from anchor |

### 4.6 API mapping (base `SERVICE_PREFIX.INTELLIGENCE`, every call with `X-Client-Id`, `X-User-Id`, `X-User-Functions`)

| # | When | Method + path | Request |
|---|---|---|---|
| R1 | Check / Re-check (manual only) | `POST api/intelligence/rules/assist` | §4.5.2 |
| R2 | First panel open, `ruleId > 0` | `GET api/intelligence/rules/{ruleRef}` | — |
| R3 | same | `GET api/intelligence/rules/{ruleRef}/siblings` | — |
| R4 | same | `GET api/intelligence/rules/{ruleRef}/instruction` | — |
| R5 | After a successful Core save, or workflow APPROVE, of a tab whose last run is `persisted` with a `runId` | `POST api/intelligence/rules/runs/{runId}/acceptance?surface=CORE` | `{accepted_rule_ref, accepted_rule_version}` |
| — | Not used: catalog, session runs (R6, deferred with 11.12), any registration call | — | — |

R2–R4 are cached per tab in the slice (`assist.reads`) and re-read after a save or version switch. Responses are `ApiResponse {success, data}`. `success:false` (or an HTTP error) becomes a refusal code shown verbatim and never throws into Core's screen.

### 4.7 Change list

| # | File | Change |
|---|---|---|
| C1 | `shared-ui/constants/apiEndpoints.ts` | Add `INTELLIGENCE_RULES: {ASSIST, RULE, SIBLINGS, INSTRUCTION, ACCEPTANCE}` |
| C2 | `features/rules/assist/` (new): `types.ts`, `renderModel.ts`, `panelModel.ts`, `draftModel.ts` (pure helpers only: `coreFilter`, `parseCoreFilter`, `fromDto`, `marksOf`, `compose`, `samePredicate`, `setPredicate`), `messages.ts` (the `rules.*` en strings the ported components use, verbatim, as impact's `messages.ts`), `tokens.ts` (reuse impact's `useImpactTokens`; no new colours) | Copied from intelligence-ui; i18n pointed at the local `t` |
| C3 | `features/rules/assist/copilotRule.ts` (new) | `translateRule(ruleJson)` (port of `translate_rule`/`parse_filter`), `ruleKindOf(typeName)`, `toCopilotRule(...)`, `graphFingerprint(...)` |
| C4 | `shared-ui/services/intelligenceRulesApi.ts` (new) | `assist`, `getRule`, `getSiblings`, `getInstruction`, `recordAcceptance(runId, body)` (`?surface=CORE` fixed). Uses `intelligenceHttp` + `X-User-Functions` per call, as impactApi; `toSnakeKeys` with `opaque:["rule"]`, `toCamelKeys` with `responseOpaque:["extra_fields","output_payload","workflow"]`. |
| C5 | `features/rules/store/rules.slice.ts` (+ `rules.slice.d.ts`, selector) | `RuleDetailTabsState.assist?: {open, tab, sessionRef, aiAuthored, outcome, computedFingerprint, accepted[], wantDraft, reads}` plus reducers `setRulesAssist{Open,Tab,Run,Reads,Accepted}`, `clearRulesAssistProvenance`; `activateRuleDetailTab` latches `aiAuthored`. No other reducer changes. |
| C6 | `features/rules/assist/useRulesAssist.ts` (new) | Port of `useRulesWorkspace`'s copilot half keyed by `tabId`: entry state (§4.5.1), clean/dirty, `check()`, `accept()`, `acceptAll()`, `applyBuild()`, `guide()` (RU7), reads R2–R4; working predicates = live graph via `translateRule` |
| C7 | `features/rules/assist/applyCopilotPatch.ts` (new) | Pure `(nodes, edges, patch, opts) → {nodes, edges}`. MODIFY sets the filter node's `properties.filter_expression = coreFilter(to)` (or the `choice` replacing the dropped value). REMOVE deletes the filter node and rewires its consumers to its producer: edges and `inputValues` references `${label}_${port}`. ADD inserts a `createRuleEditorNode("filter")` in front of the first filter (or the first `ds.`/`rl.` reader), taking that node's input and feeding it. Unknown `node_id` throws `NODE_NOT_IN_DRAFT` (shown as "node no longer in the draft"). The hook dispatches the result through `setRuleEditorGraph` (or `updateRuleEditorNode` for MODIFY). |
| C8 | `features/rules/assist/components/` (new): `RulesAssistPanel.tsx`, `UnderstandTab.tsx`, `BuildTab.tsx`, `CheckTab.tsx`, `CompareTab.tsx`, `atoms.tsx` | Port of the panel half of `RulesAssistWorkspace` (header with entry-state pill, Check/Re-check, How this works, tab strip with counts and suggested-next dot, guide line, refusal, arrival banner) and the four tabs. MUI + theme tokens; RU7; VIEW hides writes. |
| C9 | `features/rules/components/RuleDetailTabs.tsx` | Toggle in `rightContent`; two-column body when open on Graph/Expression |
| C10 | `RuleToolbar.tsx` (save success) and `RuleWorkFlowActions.tsx` (APPROVE success) | `void recordRulesAcceptance(tabId, ruleId, version)`: a helper in `useRulesAssist`/api reads the tab's run from the slice and posts R5 only if persisted. `.catch` logs a warning. Called after Core's own dispatches; never awaited, never toasts. |
| C11 | `features/rules/assist/__tests__/` | §4.8 unit tests |

Node decorations (severity outline on `RuleFlowNode`) are dropped from this round (**Q4**): they mean editing an 800-line node renderer for a visual that is not in the §2 rules.

**Out of scope:** `RuleDocumentation`, `RuleMapTab`, `AskAi` (unchanged); the inline UC11 answer (11.24); rule-service save and workflow APIs; any change to intelligence-service, lexie-ai, OPA, gateway or config-service.

### 4.8 Validation and risks

**Unit tests (C11, vitest):**
- `toCopilotRule`: a real `rule_json` fixture (BHCK3521 shape) through `deserializeRuleJson` gives predicate ids equal to the filter node ids, `untranslated`, `calculations` (map and aggregate) and `inputs`; an unknown type gives `rule_kind:null`.
- `applyCopilotPatch`: MODIFY (with `to`, and with `choice`); REMOVE rewires edges and `inputValues`; ADD inserts in front of the first filter; an unknown node throws.
- Accept-all: `autoOpen` excludes REMOVE and ADD.
- Stale: after a graph change Accept is disabled (hook or CheckTab render).
- Entry state: view/pending → review; new/clone → author; approved/rejected → revise; draft → assist.
- AI-authored: after `activateRuleDetailTab({isOpenedFromAi:true})` and then a tab switch, the request carries `lexie_handoff`.
- Receipt: after save success R5 is called with `surface=CORE`; a rejected R5 promise doesn't change the save outcome; with no persisted run nothing is called.
- Source scan: no `localStorage`/`sessionStorage`/`indexedDB`, no `href` in `features/rules/assist`.

**Gates:** `npx tsc --noEmit`, `npx eslint src/features/rules src/shared-ui/services/intelligenceRulesApi.ts src/shared-ui/constants/apiEndpoints.ts`, `npx vitest run src/features/rules`.

**Live (dev stack; never Save, Submit or Approve on a real rule):**
- **API through the gateway:** R2–R4 on 127; `/assist` in the four states; the toCopilotRule structure for BHCK3521 gives the same findings as `rule_ref`; generate on 176; identity 400s; acceptance from `surface=PANEL` gives 422; a structure with no `rule_kind` is REFUSED.
- **Browser:** VIEW (popup, BHCK3521); EDIT (draft, or the APPROVED rule as revise, unsaved); NEW (CreateRule; type gating; Draft from anchor); AI-authored (AskAi approval); regression with the panel closed; network health (only `/lexie/intelligence/api/intelligence/rules/` for the copilot; no `/lexie/ai/` from it; no rule-service save or workflow calls).

| Risk | Mitigation |
|---|---|
| Raw `rule_json` sent as `rule` gives empty checks | `toCopilotRule` + fixture test; live parity check vs `rule_ref` |
| `rule_kind` missing | From R2 or the type name; Check disabled with the reason |
| Filter syntax differs | `parse_filter` ported verbatim; unparsed filters listed |
| Patch node ids drift | Predicate id = node id both ways; unknown id shown, never guessed |
| REMOVE breaks the dataflow | Rewire edges **and** `inputValues` (F10); unit test |
| No undo (F11) | Patches are explicit, one per click; Core's Save is the only persistence, and closing the tab discards edits as today |
| An Expression-tab edit not yet converted to graph | Counts as dirty; the panel says "apply the expression (switch to Graph) before Check"; Check is disabled until then |
| PENDING_APPROVAL graph is still editable in Core (11.25) | The panel is review: no Accept or Build apply. Core's own editability is unchanged. |
| Receipt failure | Fire-and-forget after success; idempotent server side (ALREADY_LINKED) |
| Too many R1 calls / SUGGEST ledger rows | Manual Check only (no debounce) |
| `X-User-Functions` comes from the build env, not the user | Same as impact; recorded as 11.23 |

### 4.9 Implementation prompt

```text
TASK: Add the UC11 Rules & Logic Assist copilot to frontend-service's rule VIEW (Workbench MDRM popup, and any
pending-approval rule) and EDIT (Rules workspace tab) screens: a collapsible right-side panel in RuleDetailTabs
with Understand / Build / Check / Compare, calling intelligence-service through the gateway exactly as
intelligence-ui does. The copilot returns checks and node-anchored patches; accepting a patch edits the live
editor graph only. Core keeps save, versioning and the maker-checker workflow.

REPO: lextr/typescript/frontend-service only. Branch feature/rules-logic-assist from local main. No commit/push.
SPEC: utils/prompts-library/Lextr_Intelligence_Final_Package/plan/FrontendService_Rules_Logic_Assist_via_IntelligenceService_Plan.md §2, §4
REFERENCE (read-only): lextrai/intelligence-ui/src/features/rules/ (types, renderModel, panelModel, draftModel,
  rulesApi, components/useRulesWorkspace, {Understand,Build,Check,Compare}Tab, RulesAssistWorkspace);
  lexie-ai/lexie_ai/adapter/rules_ops.py (parse_filter, translate_rule). Do NOT port RulePicker, CoreRuleForm,
  coreRulesApi, the entry-state switcher or patchRuleJson.
REUSE: SERVICE_PREFIX.INTELLIGENCE, intelligenceHttp (X-Client-Id, X-User-Id), impactApi's X-User-Functions
  pattern (VITE_LEXTR_FUNCTIONS), features/workbench/impact/wireCase.ts and tokens.ts, serializeRuleGraph,
  deserializeRuleJson, createRuleEditorNode, setRuleEditorGraph, updateRuleEditorNode.

WIRE
- ${VITE_GATEWAY_URL}/lexie/intelligence/api/intelligence/rules/...; X-Client-Id, X-User-Id, X-User-Functions on
  EVERY call. Requests snake_case, `rule` opaque; responses extra_fields/output_payload/workflow opaque.
- assist {entry_state, rule, authoring_session_ref, work_begun, draft_provenance, rule_ref?, generate?}:
  rule:null + rule_ref=String(ruleId) while the editor is clean and ruleId>0; else rule=toCopilotRule(...) and
  NO rule_ref. generate:true only from Draft from anchor (author only). Never raw rule_json.
- rule_kind: R2 ruleKind, else ruleTypeName REPORT->reporting, DATA QUALITY->data_quality, EDIT CHECK->edit_check;
  anything else -> no call, Check disabled with the reason.
- R5 acceptance ?surface=CORE (constant) after Core's save success or APPROVE success, only for a persisted run;
  fire-and-forget; never blocks or alters the save.

ENTRY STATE (§4.5.1): isEditable===false -> review; pending_approval -> review; isNew || !ruleId -> author;
approved|rejected|discard(ed) -> revise; else assist. review hides Accept, Replace-with, Accept-all, Build In/Out
and Apply, and Draft from anchor; shows findings with derivations open and the review gate.

STEPS (plan §4.7 C1-C11)
1. apiEndpoints INTELLIGENCE_RULES; shared-ui/services/intelligenceRulesApi.ts.
2. features/rules/assist/: types, renderModel, panelModel, draftModel pure helpers, messages (rules.* en,
   verbatim), copilotRule (translateRule/parse_filter port, ruleKindOf, toCopilotRule, graphFingerprint).
3. rules.slice: ruleDetailTabs[tabId].assist {open, tab, sessionRef, aiAuthored, outcome, computedFingerprint,
   accepted, wantDraft, reads}; reducers; activateRuleDetailTab latches aiAuthored on isOpenedFromAi:true;
   cleared after that tab's successful save.
4. assist/applyCopilotPatch.ts: MODIFY / REMOVE with rewire (edges + inputValues) / ADD before the first filter.
5. assist/useRulesAssist.ts: copilot half of useRulesWorkspace keyed by tabId; working predicates = translateRule
   of the live graph; stale = version mismatch or fingerprint changed since the run (accepting a patch advances
   the run fingerprint, as intelligence-ui advances computedAt); guide() with RU7.
6. assist/components/: RulesAssistPanel + four tabs (MUI, theme tokens, no hard-coded colours, no <a href>,
   no browser storage). RU7: "binding not recorded" grey pill, unbound=0, no over-report guide line.
   Untranslated filters listed. No "Request registration" (no onRequestRegistration).
7. RuleDetailTabs: "Rules Assist" toggle in DynamicTabs rightContent; panel beside Graph/Expression.
8. RuleToolbar save success / RuleWorkFlowActions APPROVE success: void recordRulesAcceptance(...).
9. Tests (§4.8).

DO NOT
- Send raw rule_json, omit rule_kind, or default it.
- Let the copilot save, approve, auto-apply, or disable/wrap any Core control.
- Call /lexie/ai/ from the copilot, call the rule catalog, or add registration calls.
- Touch AskAi, RuleDocumentation, RuleMapTab, intelligence-service, lexie-ai, OPA, gateway or config-service.
- Add dependencies, refactor unrelated code, use browser storage, commit or push.

VALIDATE: tsc --noEmit; eslint on the touched paths; vitest src/features/rules; then plan §4.8 live checks.
Report files changed, validation results, and anything NOT CHECKED.
```

### 4.10 Open questions (Phase 1) — answered 2026-10-09: all as proposed

| # | Question | Proposal (adopted) |
|---|---|---|
| Q1 | Entry state for a plain APPROVED rule opened read-only (MDRM popup) | `review`: deterministic only, derivations open. The gate line reads as evidence ("No blocking findings" or "N blocking findings in the approved version"), not "do not approve". Alternative: `assist` with writes hidden. |
| Q2 | REJECTED and DISCARD(ED) rules in the editor | `revise`, because rules-service saves them as a new version (B1) |
| Q3 | When the Lexie-handoff provenance ends | It clears on that tab's first successful save. Alternative: for the life of the tab. |
| Q4 | Node decorations on the graph (old C8) | Leave them out of this round |

### 4.11 Follow-ups after §4

- Inline UC11 rules answer in AskAi (11.24).
- Move `rule-summary` and `mdrm/recommend` behind intelligence-service once proxies exist.
- Run history in the panel (R6) with 11.12.

---

## 5. Catalog scope per job (11.17)

**Status:** BUILT 2026-10-10 with the 11.31 amendment (uncommitted; lexie-ai `rules_semantic.dataset_catalog`, `rules_ops.datasets_of`, `skill._attributes` / `_draft_catalog`; frontend-service shows `attributes_truncated`). Previously deferred 2026-10-09. **Repo:** `lextrai/lexie-ai` only; intelligence-service passes `extra_fields` through and intelligence-ui's Build tab already renders unused, not-eligible and withheld attributes.

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

**Live finding and decision (2026-10-10):** with the dataset catalog the drafter proposed `internal_reg_coa` codes, but two runs chose different codes (`120304030200` vs `240101050000`) and reported grounding coverage 1.00: none of the 138 COA values has a description (each one's description is the code), so the choice was a guess. Drafts also ran 32–60+ s, and intelligence-service's 60 s lexie timeout (`LexieAiClient.java:42`) returned 504 `LEXIE_TIMEOUT`. Decision (lexie-ai only, intelligence-service stays frozen): a literal is RESOLVED only when it is ACTIVE **and described**; undescribed values are not offered to the model (`values_undescribed`, prompt `uc11_rule_draft@3`) and it is told not to choose them. In dev the draft is therefore "Nothing was drafted", naming the missing descriptions; once 11.16 adds COA descriptions the same path drafts grounded filters. The Understand tab flags a drafted filter whose value is unverified.

**Amendment (11.31, 2026-10-10):** for a rule whose inputs are only `rl.*`, follow each `rl.X` back to rule X's `ds.*` inputs (depth cap, cycle-safe) and scope the dataset catalog to those objects. Without it rule 176 (`rl.BHCK3521` only) still drafts nothing. Extra test: an `rl.`-only rule gets its upstream rule's datasets.

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

---

## 6. Authoring value: formula checks and whole-rule drafting (11.34–11.38)

**Status:** Slice 1 BUILT 2026-10-10 (uncommitted: lexie-ai, frontend-service, intelligence-ui); slice 2 planned. lexie-ai unfrozen for this work (user decision 2026-10-10).

**Why.** A sweep of all 77 dev rules (Check in `assist`, 2026-10-10) showed the copilot reads almost nothing of Core's rule estate:

| Rule shape | Rules | What the copilot reads |
|---|---|---|
| Base: one filter on `ds.regulatory_ledger_ds` → `sum(transaction_amount)` | 13 | one predicate |
| Calculated: reads `rl.*` rules → one `map` formula | 64 | nothing (calculations are display-only, `rules_ops.py:17-20`) |

- Findings: 13, all `PREDICATE_UNTRACEABLE` (caused by 11.15, not by the rules), each with a REMOVE patch that widens the rule to the whole ledger; 0 blocking; `commonality` NOT_APPLICABLE on 64 rules; all 156 sibling matches "related".
- Every one of the 64 formulas is `AMOUNT_<other line> + 0`: the line reports another line's amount unchanged.
- A real error goes unflagged: BHCK3196's instruction clause 5 "Excludes … realized gains (losses) on held-to-maturity securities (… item 3521)", and its formula is `AMOUNT_BHCK3521 + 0`.

**Prototype yield (read-only, dev data):** excluded item used: 1 (BHCK3196); a line copying another line unchanged: 64; an Includes clause names an item the formula doesn't use: 4 (BHCK3196 → 1773, BHCK4135 → A458, BHCK4340 → 4340, A458, BHCKA220 → 3545, 3548). Only 7 of 64 instructions carry item references, so the include/exclude checks are sparse by nature; the copy check covers all 64.

### Slice 1 (build first)

| # | Change | Repo | Detail |
|---|---|---|---|
| 11.34 | **New `calculation` check** | lexie-ai `skills/rules/checks.py`, `skill.py` | Reads `calculations` (map / aggregate expressions) and the instruction clauses. Line references in a formula: `AMOUNT_<rule_nm>` tokens and `rl.<rule_nm>` inputs. Item references in a clause: `item(s) <code>[, <code>…]`; the clause's lead word classifies it (`Excludes…` → excluded, `Includes…` / `Report…` → included, otherwise ignored). An item code becomes a line by the target's mnemonic (`FRY9C.BHCK3196` → `BHCK` + `3521`). Findings: `CALC_USES_EXCLUDED_ITEM` (POSSIBLE, warning; params `clause`, `item`, `line`), `CALC_COPIES_LINE` (PROVEN, warning; the formula is one line reference with `+ 0` / `* 1` / nothing, and that line is not the target), `CALC_MISSING_INCLUDED_ITEM` (POSSIBLE, warning). No patch in slice 1: the finding names the clause and the formula; the author edits the Map node. NOT_APPLICABLE with no calculations; UNAVAILABLE with no instruction. Coverage key `calculation`. |
| 11.35 | **Demote untraceable predicates while binding is unrecorded** | lexie-ai `checks.py`, `patches.py` | When no clause carries `bound_predicate_ids` and no predicate carries `clause_ref` (11.15), `PREDICATE_UNTRACEABLE` becomes POSSIBLE with param `binding_recorded:false` and **no REMOVE patch**. Unchanged once binding is recorded. |
| 11.36 | **Copy for the new codes** | frontend-service `assist/messages.ts`, intelligence-ui `i18n/messages.en.ts` | `rules.code.*`, `rules.kind.*`, `rules.codeWhy.*` for the three codes, and the panel's "binding not recorded" wording for 11.35. intelligence-service passes `extra_fields` through (verify no Java enumerates check names). |
| 11.30 | **Target for an unsaved rule** (already pending) | frontend-service | Core's own match (`RuleMapTab`: the form's MDRM line whose `taxonomyId` equals the rule name); no match → `null`. With 11.34, a new calculated rule gets its instruction and the formula checks before its first save. |
| 11.39 | **Columns for rule inputs** | frontend-service `RulePropertiesPanel.tsx` | Send only `ds.*` inputs to `api/metadata/dataset/{name}`; resolve an `rl.X` input's columns from rule X's stored `rule_json` outputs (read endpoints only); skip upstream node outputs; `Promise.allSettled`. Removes the 500 seen on `rl.BHCKB488` and gives the formula builder `AMOUNT_<line>` columns. vitest: an `rl.` input lists the referenced rule's outputs; one failing input keeps the others' columns. |

**Tests (slice 1):** pytest: BHCK3196 fixture (clause 5 text, `AMOUNT_BHCK3521 + 0`) gives `CALC_USES_EXCLUDED_ITEM` + `CALC_COPIES_LINE`; an Includes item not used gives `CALC_MISSING_INCLUDED_ITEM`; a formula of two lines gives no copy finding; no calculations → NOT_APPLICABLE; no instruction → UNAVAILABLE; review state runs it (deterministic); untraceable without binding → POSSIBLE, no patch; with binding → unchanged. vitest: new codes render; 11.30 target derivation (match / no match). Live: the 77-rule sweep repeated (expected 1 / 64 / 4 as above, 13 untraceable without REMOVE).

### Slice 2 (after slice 1 is accepted)

| # | Change | Repo | Detail |
|---|---|---|---|
| 11.37 | **Draft the whole rule** | lexie-ai `rules_drafter.py` | The draft returns steps, not only predicates: base rule = dataset → filter(s) → aggregate; calculated rule = `map` formula over line references built from the instruction's included items minus excluded ones. Each line reference is RESOLVED only when a rule for that line exists; grounding coverage counts them. Schema `uc11_rule_draft@3`. |
| 11.38 | **Apply the draft to the graph** | frontend-service `applyCopilotPatch` / Understand | An "Apply draft" button (author only, not stale) writes the drafted steps into Core's editor graph through `setRuleEditorGraph`; nothing is saved. Replaces §4.5.4's "shown, never applied". |

**Risks:** clause text is free-form, so include/exclude classification is a heuristic (POSSIBLE, never blocking, derivation names the clause); item codes outside the target's mnemonic (other forms, e.g. FFIEC items) are ignored, not guessed; `CALC_COPIES_LINE` fires on all 64 dev rules (placeholder data) and may need to be POSSIBLE where a copy is legitimate.
