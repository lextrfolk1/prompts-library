# UC10 Analytical Assist: prompts for pending items (intelligence-service, lexie-ai, intelligence-ui → frontend-service)

**Source:** `FrontendService_Analytical_Assist_via_IntelligenceService_Plan.md` §14.2 (D1–D9) and §14.3 (H1–H4); `PENDING_FEATURES.md` UC10 (10.10, 10.11, X.1, X.2, open decisions).
**Repos:** `lextrai/lexie-ai`, `lextrai/intelligence-service`, `lextrai/intelligence-ui` (all on `feature/lextr-intelligence-v1.38.0`), then `lextr/typescript/frontend-service` (`src/features/analytics/assist/`).
**Flow per prompt:** **Phase A** builds the backend and the intelligence-ui screen (the reference). **Phase B** migrates the same feature to frontend-service, one for one, only after Phase A is done. Both screens must show the same thing for the same ask.
**Reviewed:** 2026-10-08, against the code on that branch.

---

## 1. Review findings (verified in code)

| # | Finding | Evidence |
|---|---|---|
| R1 | lexie already returns, per match, `reason` (the "why" line) and on `report` `owner_id`, `is_private`, `required_entitlement`, `consolidation_nature`. **intelligence-service drops all of them** when it builds `CatalogMatchDto` | lexie `skills/analytical/d0_decision_core.py:64-88`; service `AnalyticalRunCoordinatorImpl.java:487-511`, `dto/CatalogMatchDto.java` |
| R2 | The interim catalog fills `owner_id` with the adapter name `"report_store"` and never sets `is_private` / `consolidation_nature`. Showing them as-is would display a fake owner | lexie `lexie_ai/adapter/analytical_catalog.py:66-73` |
| R3 | `AnalyticalQueryResult.confidence_score` defaults to a constant `0.95`; it is not computed from the ask. It must never be shown as intent confidence | lexie `skills/analytical_assist_skill.py:100` |
| R4 | The parse is rule-based (`AskParse`: `measure_phrase`, `dimensions`, `filters`, `period`, `period_is_absolute`) plus `measure_resolved` / `measure_candidates`. There is no clarification path and no suggested-refinement output | lexie `skills/analytical/ask_parse.py:40-46`; `analytical_assist_skill.py:317-318` |
| R5 | `ReportStoreAdapter` exists but the UC10 run never calls it; OPA `report_store_ready=false` | lexie `skills/analytical/report_store.py:87+`; `opa/data/lextr/ai/analytical/data.json` |
| R6 | intelligence-ui already reserves the match fields `lastRun`, `owner`, `vis`, `why` and shows "not recorded"; about 64 unused `analytical.uc10.*` keys hold the design's copy for asset narrowing, store hints and coverage | `intelligence-ui/src/features/analytical/analyticalData.ts:39-48`; `components/AnalyticalMatch.tsx:55`; `PENDING_FEATURES.md` Housekeeping |
| R7 | No source exists for a filing calendar / due dates (10.10), the Report Store (10.11), data assets per report or logical attribute names (X.1, X.2) | `PENDING_FEATURES.md` UC10 |

## 2. Classification of the pending items

| Prompt | Items | Readiness |
|---|---|---|
| **AA-1** Match provenance pass-through | D7 (why, consolidation, visibility, owner where real) | **READY** |
| **AA-2** Clarify and suggested refinements | D5, D2 | **READY** (rule-based, no model call) |
| **AA-3** Intent confidence | D1 | **DECISION**: owner must approve the deterministic definition below |
| **AA-4** Operation labels | D8 | op labels **READY**; logical attribute names **BLOCKED** on X.2 |
| **AA-5** Data assets, narrowing and plan options | D3, D9 | **BLOCKED** on X.1 (contract can be added now, empty) |
| **AA-6** Report Store hints | D4 | **BLOCKED** on 10.11 (source decision) |
| **AA-7** Due-date answer (UC12) | D6 | **BLOCKED** on 10.10 (filing calendar source) |
| — | H1, H2, H3 | Core / frontend-service Phase 2; out of scope here (intelligence-ui and the apply endpoint already exist) |
| — | H4 Run button | Stays excluded |

Run order: AA-1 → AA-2 → AA-4 (op labels) → AA-3 after the decision → AA-5/6/7 only once their source exists.

**Delivered 2026-10-08 (uncommitted, tests written but NOT RUN):** AA-1, AA-2, AA-3 (proposed formula, pending owner sign-off) and AA-4 step 1, both phases. Deviations: AA-2 checks catalog readiness before clarifying (a not-ready catalog still wins) and returns `catalog_state: NO_MATCH_IN_INVENTORY` with the clarification (no new state); refinements offer catalog lines for an unresolved measure and "Filter to last quarter" for a missing period, never a dimension or filter; the match "why" reason now reads "Matched on the words: a, b" instead of a Python list. Not done: AA-4 step 2, AA-5, AA-6, AA-7 (blocked).

## 3. Rules shared by every prompt

- Wire format is snake_case end to end. lexie emits snake_case; service DTOs use the global SNAKE_CASE naming (records, no `@JsonProperty` needed unless the existing file uses it); intelligence-ui converts through `shell/wireCase.ts` as today.
- **Nothing is invented.** A field with no real source is `null` / absent and the UI shows "not recorded" (R2, R3). No constants dressed up as data.
- Every new response field is **optional and additive**: old clients and frontend-service Phase 1 keep working unchanged.
- UC10 never returns data values and never runs a report. Chips and suggestions **only fill the ask box**; they never submit (each run is persisted, queued for review and calls the LLM).
- Keep the existing per-repo structure; no new modules, no new dependencies, no refactors of unrelated code. Do not commit or push.
- Compile gates (must pass before reporting done):
  - lexie-ai: `python3 -m py_compile` on changed files.
  - intelligence-service: `mvn -B -q -DskipTests test-compile`.
  - intelligence-ui: `npx tsc --noEmit -p tsconfig.app.json`; no new errors versus the baseline.
- Tests: extend the existing UC10 suites (listed per prompt). Running them is the owner's call; report them as NOT RUN if not run.
- frontend-service Phase B rules (same as the frontend-service plan §7 / §9):
  - Port from the Phase A intelligence-ui change one for one: same fields, conditions, order and wording.
  - frontend-service types and bodies are **snake_case** (no wireCase); add fields to `assist/types.ts` with their wire names.
  - Styling from frontend-service: `AssistAtoms` (`ToneCard`, `TonePill`, `FieldLabel`, `NOT_RECORDED`), shared ui-components, MUI theme tones; no hex colours, no intelligence-ui inline styles; English strings inline (copied from `messages.en.ts`), no i18n layer.
  - Never touch the backend repos in Phase B. If Phase A's wire shape is missing something, stop and report it.
  - Gates: ESLint on touched files; scoped `tsc` per the frontend-service plan §9 (temporary tsconfig over `src/features/analytics/assist` with the `@/store` stub, deleted afterwards); the §9 greps (`baseTokens|VarianceAtoms|#[0-9a-fA-F]{6}` in `assist/`) return nothing.
- Report: files changed per repo and phase, gates run and their result, anything not done.

---

## 4. Prompts

### AA-1: Match provenance pass-through (D7) — READY

```text
TASK: Carry the per-match provenance lexie already computes through intelligence-service to the
intelligence-ui match card: the "why" line, consolidation nature, visibility and owner. Show only
real values; anything without a real source stays "not recorded".

REPOS: Phase A lextrai/lexie-ai, lextrai/intelligence-service, lextrai/intelligence-ui;
       Phase B lextr/typescript/frontend-service
SPEC: utils/prompts-library/Lextr_Intelligence_Final_Package/plan/Analytical_Assist_Pending_Backend_Prompts.md
      (§1 R1, R2, R6; §3 shared rules)
PROTOTYPE (wording only): files/Lextr_Intelligence_UI_v1.38.0_FINAL.jsx AnalyticalMatch (:3103-3215)

PHASE A — backend + intelligence-ui
lexie-ai
- skills/analytical/d0_decision_core.py: make ReportCatalogEntry.owner_id Optional[str] = None.
- lexie_ai/adapter/analytical_catalog.py: the interim ReportStoreCatalog sets owner_id=None (it has
  no owner; today it writes the adapter name). Leave is_private / consolidation_nature unset.
- Make sure CatalogMatch.reason serialises as plain text in the /run payload (ReasonText -> str).
- Check every consumer of owner_id (visibility filter in d0_decision_core) still behaves: a None
  owner is never "the viewer's own private report".

intelligence-service
- dto/CatalogMatchDto.java: add why (String), owner_id (String), is_private (Boolean),
  required_entitlement (String), consolidation_nature (String). Keep the existing short constructors
  compiling (pass nulls).
- AnalyticalRunCoordinatorImpl.matches(): read row.reason and report.owner_id / is_private /
  required_entitlement / consolidation_nature; null when absent. No defaults.

intelligence-ui
- types.ts AnalyticalReportMatch: add the five optional fields (camelCase after wireCase).
- analyticalData.ts anMatchItem: map why, owner, vis (is_private true -> "private", false ->
  "shared", null -> undefined), consolidation. lastRun stays undefined (no source).
- AnalyticalMatch.tsx: render the "why" line under the description when present; owner / visibility
  in the existing "Last run · owner · visibility" line (missing parts stay "not recorded");
  consolidation_nature "consolidated-only" -> refine label "⚙ Refine unavailable" exactly as
  anRefineMode / the prototype define it. Use existing analytical.uc10.* keys where they exist; add
  keys to messages.en.ts only when none fits.

DO NOT: show the adapter name as an owner; add last-run, panels or parameters (no source; D7 rest
stays "not recorded"); change scoring, the visibility filter's rules or the OPA policy.

TESTS (extend): lexie tests/test_analytical_catalog_binding.py, test_analytical_assist_skill.py;
service AnalyticalCrossLayerWireThroughTest, AnalyticalRunControllerTest;
ui __tests__/AnalyticalBackendFields.test.tsx.
VALIDATE (Phase A): §3 compile gates.

PHASE B — frontend-service (lextr/typescript/frontend-service, after Phase A is done)
- assist/types.ts: add why, owner_id, is_private, required_entitlement, consolidation_nature to the match type.
- assist/analyticalData.ts anMatchItem: same mapping as Phase A (vis "private" / "shared" / undefined; lastRun stays undefined).
- assist/components/AnalyticalMatch.tsx: "why" line under the description; owner / visibility in the existing "Last run · owner · visibility" line (NOT_RECORDED when missing); "consolidated-only" -> "⚙ Refine unavailable" via anRefineMode.
DO NOT (Phase B): change lexie-ai, intelligence-service, intelligence-ui, gateway or config-service.
VALIDATE (Phase B): §3 frontend-service gates. Report per §3.
```

### AA-2: Clarify an unclear ask, and suggest refinements (D5, D2) — READY

```text
TASK: (1) When an ask cannot be read, lexie returns a clarification and stops: no catalog search, no
matches, no construction proposal. (2) For a readable ARTIFACT ask, lexie returns suggested
refinements derived from what the parse lacks. Both are rule-based (no model call) and flow through
intelligence-service to intelligence-ui.

REPOS: Phase A lextrai/lexie-ai, lextrai/intelligence-service, lextrai/intelligence-ui;
       Phase B lextr/typescript/frontend-service
SPEC: Analytical_Assist_Pending_Backend_Prompts.md §1 R4, §3
PROTOTYPE (wording only): FINAL.jsx scenario "unclear" (:790-794), clarify card (:2806-2811),
      gap chips (:2735-2743, gapChips :2389)

PHASE A — backend + intelligence-ui
lexie-ai (skills/analytical_assist_skill.py + skills/analytical/ask_parse.py)
- Unclear = parse has no measure_phrase AND no dimensions AND no filters (after stop words and
  report-name stripping). Then: return status COMPLETED, catalog_state unchanged by catalog (do NOT
  call catalog_search), matches [], construction_proposal None, and
  clarification = {"head": <reason code text>, "asks": [<1-3 questions>]}.
  Use reason codes in lexie_ai/reason_codes (add ANALYTICAL_ASK_UNCLEAR + question codes); wording
  from the prototype: "I cannot act on this, and I am not going to guess." / "Which measure do you
  mean?" / "Are you asking to re-present a number, or to change one?".
- The OPA gate and run persistence are unchanged (the run is still recorded).
- suggested_refinements: only when there is a measure and no route_out_uc. A list of
  {"kind": "dimension"|"period"|"filter", "label": str, "ask": str}, built from what is MISSING
  in the parse: no dimensions -> "Slice by <dimension>" for dimensions the matched reports' elements
  support (none -> omit); no period -> "Filter to last quarter"; cap 3. "ask" is the full ask text
  the chip would put in the box (original ask + the refinement). Never invent a dimension the
  catalog does not carry.
- Add both fields to AnalyticalQueryResult and the /run payload.

intelligence-service
- AnalyticalRunResponse: add clarification (Map<String,Object>) and suggested_refinements
  (List<Map<String,Object>>), passed through like parse (maps, unchanged keys). Keep the existing
  constructors compiling.

intelligence-ui
- types.ts / analyticalApi.ts: the two optional fields.
- AnalyticalFindBuild.tsx: clarification -> amber card (head + asks list) and nothing else from the
  result (same precedence as the prototype: clarify hides the answer card and matches).
  suggested_refinements -> "⊕ <label>" chips under the "Read as" line; clicking fills the ask box
  with item.ask, never submits.

DO NOT: call a model; auto-submit; show chips for a route-out (FACT) answer.

TESTS (extend): lexie test_analytical_assist_skill.py (unclear ask stops before catalog_search;
refinements never name a dimension absent from the catalog); service AnalyticalRunControllerTest
(fields pass through); ui AnalyticalWorkspace.test.tsx (clarify card; chip fills, does not submit).
VALIDATE (Phase A): §3 compile gates.

PHASE B — frontend-service (lextr/typescript/frontend-service, after Phase A is done)
- assist/types.ts: clarification {head, asks[]}, suggested_refinements [{kind, label, ask}].
- assist/components/AnalyticalFindBuild.tsx: amber ToneCard (warning) for clarification, hiding the answer card and matches exactly as Phase A; "⊕ <label>" chips under the "Read as" line reusing AskPromptChip (fills the ask box, never submits).
DO NOT (Phase B): change lexie-ai, intelligence-service, intelligence-ui, gateway or config-service.
VALIDATE (Phase B): §3 frontend-service gates. Report per §3.
```

### AA-3: Intent confidence (D1) — DECISION REQUIRED before running

Owner decision needed (`PENDING_FEATURES.md` open decision "Intent confidence"): is a **deterministic parse-completeness score** acceptable as "how sure I am that I understood this"? Proposed definition: measure resolved to one catalog line 0.5, measure phrase present but unresolved 0.3 (several candidates 0.2), +0.2 if dimensions parsed, +0.15 if a period parsed, +0.15 if no stop-word-only remainder; clarify case (AA-2) 0.0–0.2. If not approved, D1 stays "not recorded".

```text
TASK: Return a real intent confidence for each UC10 run and show it as the prototype does. It says
how well the ask was understood, not whether a report exists, and blocks nothing.

REPOS: Phase A lextrai/lexie-ai, lextrai/intelligence-service, lextrai/intelligence-ui;
       Phase B lextr/typescript/frontend-service
SPEC: Analytical_Assist_Pending_Backend_Prompts.md §1 R3, §4 AA-3 (approved definition), §3
PREREQUISITE: AA-2 delivered (the clarify case scores low).

PHASE A — backend + intelligence-ui
lexie-ai
- New pure function intent_confidence(parse, measure_resolved, candidates, clarified) -> float in
  skills/analytical/ask_parse.py implementing the APPROVED definition exactly; clamp to [0,1], round
  to 2 dp. Emit it as parse["intent_confidence"] (inside parse so no new top-level field).
- Remove the 0.95 default from AnalyticalQueryResult.confidence_score or set it from the same
  function; nothing may emit a constant confidence.

intelligence-service: no code change (parse is passed through); add a wire-through assertion.

intelligence-ui
- AnalyticalFindBuild.tsx: replace "How sure I am that I understood this: not recorded" with
  "I’m {N}% sure I understood this" when parse.intent_confidence is a number; keep the
  "doesn’t block anything" pill; keep "not recorded" when absent.

DO NOT: gate, sort or hide anything on the confidence; call a model.
TESTS: lexie unit test table for the function; service AnalyticalCrossLayerWireThroughTest;
ui AnalyticalBackendFields.test.tsx.
VALIDATE (Phase A): §3 compile gates.

PHASE B — frontend-service (lextr/typescript/frontend-service, after Phase A is done)
- assist/types.ts: parse.intent_confidence (number, optional).
- assist/components/AnalyticalFindBuild.tsx: "I’m {N}% sure I understood this" when present, else the current "not recorded" line; keep the "doesn’t block anything" pill.
DO NOT (Phase B): change lexie-ai, intelligence-service, intelligence-ui, gateway or config-service.
VALIDATE (Phase B): §3 frontend-service gates. Report per §3.
```

### AA-4: Operation labels (D8) — op labels READY, attribute names BLOCKED on X.2

```text
TASK: In the operation batch review, show the operation's label (e.g. "add filter") instead of the
raw op_name, and the attribute's logical name when the Semantic Layer resolves it.

REPOS: Phase A lextrai/intelligence-ui (step 1), lextrai/intelligence-service (step 2, only when X.2 is bound);
       Phase B lextr/typescript/frontend-service
SPEC: Analytical_Assist_Pending_Backend_Prompts.md §2, §3
PROTOTYPE: FINAL.jsx AN_OPS (:592-600), batch rows (:3511-3518)

PHASE A — intelligence-ui / intelligence-service
Step 1 (now, intelligence-ui only)
- analyticalData.ts: AN_OP_LABELS = add_column "add column", remove_column "remove column",
  add_filter "add filter", remove_filter "remove filter", add_aggregation "add aggregation",
  derive_attribute "derive attribute", set_dataset "change dataset" (labels via messages.en.ts).
  Unknown op_name -> show op_name unchanged.
- OperationBatchReview.tsx: pill shows the label; tone purple/secondary for derive_attribute (as
  already done for the REPORT-LOCAL note), green otherwise. target_field stays physical.

Step 2 (BLOCKED until a real SemanticLayerClient replaces UnboundSemanticLayerClient, X.2)
- intelligence-service: run the batch through SemanticResolutionSeamService before returning it and
  add target_label per operation (null when unresolved). Do not rename target_field.
- intelligence-ui: show target_label when present, else target_field with the existing
  [UNRESOLVED] treatment (DD-48 / LP-24.5 decides whether physical names are shown on outage).

DO NOT: hard-code attribute display names in the UI.
TESTS: ui OperationBatchReview cases in AnalyticalBackendFields.test.tsx; step 2: service
AnalyticalSeamWireThroughTest.
VALIDATE (Phase A): §3 compile gates.

PHASE B — frontend-service (lextr/typescript/frontend-service, after Phase A is done)
- Step 1: assist/analyticalData.ts AN_OP_LABELS (same labels, inline English); assist/components/OperationBatchReview.tsx pill shows the label, secondary tone for derive_attribute, success otherwise; unknown op_name unchanged.
- Step 2 (only after Phase A step 2): show target_label when present, else target_field with the same unresolved treatment as intelligence-ui.
DO NOT (Phase B): change lexie-ai, intelligence-service, intelligence-ui, gateway or config-service.
VALIDATE (Phase B): §3 frontend-service gates. Report per §3.
```

### AA-5: Data assets, asset narrowing and plan options (D3, D9) — BLOCKED on X.1

```text
TASK: Add "data assets" per catalog match end to end, the "Which data asset did you mean?"
narrowing card and the "built on" line on match cards; then server-side plan options (dataset
candidates, maturity-banding candidates) for the Refine & build plan.

PRECONDITION: the Semantic Layer report catalog (X.1) returns the data asset(s) each report is built
on, and the banding source (Knowledge Hub convention) is named. Until then do ONLY step 1.

REPOS: Phase A lextrai/lexie-ai, lextrai/intelligence-service, lextrai/intelligence-ui;
       Phase B lextr/typescript/frontend-service
SPEC: Analytical_Assist_Pending_Backend_Prompts.md §3
PROTOTYPE: FINAL.jsx asset narrowing (:2896-2924), built-on (:3130-3144), AnalyticalPlan (:3590+),
      maturity bands (:602+)

PHASE A — backend + intelligence-ui
Step 1 (contract only, allowed now)
- lexie ReportCatalogEntry: data_assets: List[{"asset_id","name"}] = []; ReportStoreCatalog leaves
  it empty. Service CatalogMatchDto: data_assets (List<Map>), passed through. UI types only.
- UI renders nothing while every match has an empty list.

Step 2 (after X.1)
- Bind the Semantic Layer adapter's data assets. UI: narrowing card when the visible matches span
  more than one distinct asset (chips filter the visible matches client-side; no new run); "built
  on <asset>" line on each card. Use the existing unused analytical.uc10.* asset keys.
- Plan options: lexie returns plan_options {datasets:[...], banding_candidates:[{id,label,source}]}
  for an anchored run; banding candidates carry their source (a banding lifted from a document is a
  PROPOSAL). The UI choice is sent back as part of the next ask; lexie still proposes the
  operations — the browser never builds operations.

DO NOT: derive assets from report names or tags; build operations in the browser.
TESTS: lexie catalog binding test; service wire-through; ui AnalyticalWorkspace.test.tsx.
VALIDATE (Phase A): §3 compile gates.

PHASE B — frontend-service (lextr/typescript/frontend-service, after Phase A is done)
- Step 1: assist/types.ts data_assets only; nothing rendered.
- Step 2 (after Phase A step 2): asset narrowing card (filters visible matches client-side, no new run) and "built on <asset>" line in AnalyticalMatch; plan options in AnalyticalPlan, sent back with the next ask exactly as Phase A does.
DO NOT (Phase B): change lexie-ai, intelligence-service, intelligence-ui, gateway or config-service.
VALIDATE (Phase B): §3 frontend-service gates. Report per §3.
```

### AA-6: Report Store hints (D4) — BLOCKED on 10.11

```text
TASK: For a matched regulatory report, tell the analyst when a filed artefact ("Already submitted":
formats, filing ref) or an executed copy ("An executed copy may already exist") is in the Report
Store, through the existing StoreEntryPanel.

PRECONDITION: Lextr Core has decided the Report Store source (10.11) and report_store_ready is set
true for the deployment in opa/data/lextr/ai/analytical/data.json.

REPOS: Phase A lextrai/lexie-ai, lextrai/intelligence-service, lextrai/intelligence-ui;
       Phase B lextr/typescript/frontend-service
SPEC: Analytical_Assist_Pending_Backend_Prompts.md §1 R5, §3; LP-45; report_store_decision_core.py
PROTOTYPE: FINAL.jsx store cards (:2748-2805)

PHASE A — backend + intelligence-ui
- lexie: when OPA readiness says report_store_ready and ReportStoreAdapter.is_configured(), call
  search_instances for the top matches (tenant-checked; CrossTenantSecurityException and
  InstanceEntitlementRequiredException become a store_refusal, never a crash) and return
  store_hints [{report_id, state: "SUBMITTED"|"EXECUTED", formats, filing_ref, store_link}].
  Zero run trigger (trigger_run stays False). No values.
- service: pass store_hints / store_refusal through AnalyticalRunResponse.
- ui: render StoreEntryPanel under the matching card; hidden when store_hints is absent.

DO NOT: execute, download or preview report contents; flip report_store_ready in this change.
TESTS: lexie report_store decision tests + skill test; service wire-through; ui StoreEntryPanel test.
VALIDATE (Phase A): §3 compile gates.

PHASE B — frontend-service (lextr/typescript/frontend-service, after Phase A is done)
- assist/types.ts: store_hints, store_refusal.
- New assist/components/StoreEntryPanel.tsx ported from intelligence-ui's StoreEntryPanel (only the states Phase A renders), shown under the matching card; hidden when store_hints is absent. Remove StoreEntryPanel from the frontend-service plan §6.6 "not ported" list.
DO NOT (Phase B): change lexie-ai, intelligence-service, intelligence-ui, gateway or config-service.
VALIDATE (Phase B): §3 frontend-service gates. Report per §3.
```

### AA-7: Due-date answer via UC12 (D6) — BLOCKED on 10.10

```text
TASK: Answer a FACT ask about due dates ("When is FR Y-9C due?") with structured data: one date when
uniform, else a per-schedule table, labelled "Answered by UC12", with the reports that carry it
underneath.

PRECONDITION: a filing-calendar / due-date source exists (10.10) and UC12 has a Core host adapter
(today UC12 is refused with RUN_ADAPTER_UNBOUND in lexie_ai/run/dispatcher.py).

REPOS: Phase A lextrai/lexie-ai, lextrai/intelligence-service, lextrai/intelligence-ui;
       Phase B lextr/typescript/frontend-service
SPEC: Analytical_Assist_Pending_Backend_Prompts.md §3; PENDING_FEATURES.md open decision "FACT asks"
PROTOTYPE: FINAL.jsx due-date card (:2836-2886)

PHASE A — backend + intelligence-ui
- lexie: when route_out_uc = UC12_OPERATIONAL and the ask is a due-date ask, call the bound calendar
  source and return route_out_answer {kind:"DUE_DATE", report, uniform_date | schedules:[{schedule,
  due_date}], source}. Without a bound source keep today's narrative-only answer.
- service: pass route_out_answer through.
- ui: render the uniform line or the table inside the existing green "The answer" card.

DO NOT: compute due dates from rules of thumb or hard-coded calendars.
TESTS: lexie skill test with a fake calendar source; service wire-through; ui render test.
VALIDATE (Phase A): §3 compile gates.

PHASE B — frontend-service (lextr/typescript/frontend-service, after Phase A is done)
- assist/types.ts: route_out_answer.
- assist/components/AnalyticalFindBuild.tsx: inside the existing "The answer" card, the uniform date line or a per-schedule MUI Table, as Phase A renders it.
DO NOT (Phase B): change lexie-ai, intelligence-service, intelligence-ui, gateway or config-service.
VALIDATE (Phase B): §3 frontend-service gates. Report per §3.
```

---

## 5. After each prompt

- Phase B runs only after Phase A is done for the same prompt; a blocked step stays blocked in both phases.
- Compare both screens on the same ask (intelligence-ui Analytical Assist vs frontend-service Lexie Analytics Assist): same sections, same states, same wording.
- Update `PENDING_FEATURES.md` UC10, and the frontend-service plan §14.2 rows (and §13 implementation record), as each prompt is delivered.
