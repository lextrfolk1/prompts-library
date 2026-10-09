# Lextr Intelligence: Pending Work by Use Case and Feature

- **Last updated:** 2026-10-09
- **Branch:** `feature/lextr-intelligence-v1.38.0` (intelligence-service, lexie-ai, intelligence-ui)
- **How to use this file:** one section per use case or feature. Each lists what is built and what is pending, with an owner and what it waits on. Update the section when work lands; add a section when a use case is reviewed.

## Status at a glance

| Use case / feature | Status | Main blocker |
|---|---|---|
| [Cross-cutting](#cross-cutting) | Partly in place | Semantic Layer, Core integration, gateway entitlements |
| [Platform & integration](#platform--integration) | 3 required items open | Core gateway route, Lexie resolver, AU9 persistence |
| [UC10 Analytical Assist](#uc10-analytical-assist) | **Built and tested.** Discovery, parse and operation batches run on an interim Postgres catalog (report store + MDRM), verified live. Committed on the feature branches, not pushed. | Semantic Layer report catalog; tenant mapping (10.13) |
| [UC2 Impact Analysis](#uc2-impact-analysis) | **Built and tested** (steps 1–8), including live API checks (23/23) and a browser E2E. With `LEXIE_IMPACT_GRAPH_URL` set, runs walk Core's Neo4j dependency graph (structural reach); unset, they are refused; the cross-report slice is an honest empty. **Not committed.** | Impact adapter (KG / Core graph) binding |
| [UC11 Rules & Logic Assist](#uc11-rules--logic-assist) | **Built and running in dev.** All 77 rules check in all four entry states (308/308); the rule store, the catalog through semantic-service and a drafter are bound in dev. Some commits are local, not pushed. | Core mount and identity (11.2, 11.3); clause binding in Core (11.15) |
| [Other screens](#other-screens-not-reviewed-in-this-pass) | Not reviewed in this pass | — |

**Status meanings:**
- **Built:** code is committed and tests pass.
- **Planned:** a discovery plan exists, with no code yet.
- **Blocked:** waits on a source, contract or decision outside Intelligence.

---

## Cross-cutting

These items affect more than one use case.

| # | Pending item | Affects | Owner | Waits on |
|---|---|---|---|---|
| X.1 | **Semantic Layer report catalog** endpoint and contract | UC10 (discovery), UC11 (rule catalog) | Semantic Layer team | — |
| X.2 | **Semantic Layer name conversion** (physical → logical), replacing `UnboundSemanticLayerClient` | UC10 operations, any screen showing attributes | Semantic Layer team, then Intelligence | X.1 contract |
| X.3 | **Core integration:** embedded panels send identity in `X-Client-Id` / `X-User-Id` / `X-User-Functions` (identity in the body is ignored) and use `surface=CORE` for workflow acts | UC10 and UC11 now; UC2 once built | Lextr Core team | — |
| X.4 | **Entitlements from the gateway** (for example an `X-User-Entitlements` header) | UC10 visibility; any entitlement-gated read | Gateway team | Contract |
| X.5 | **Migrations applied by hand:** there is no Flyway, so each migration (currently V44) must be applied in every environment | All | Deployment / DBA | — |
| X.6 | **Governed presets per tenant:** every resolver builds a default preset when none is seeded. Decide whether to seed real presets and remove that fallback. | UC2, UC3, UC9, UC10, others | Platform | Decision |
| X.7 | **Readiness datums reflect reality:** a datum stays `false` until its adapter is bound (pattern applied in UC10). Each use case must confirm its own. | All OPA-gated use cases | Each use case owner | Binding status |
| X.8 | **Pre-existing failures:** 6 `evidence_test` OPA tests fail on HEAD, unrelated to recent work | Evidence lifecycle policy | Evidence owner | — |

---

## Platform & integration

These are required items still open from the earlier integration plan. Everything else in that plan is done or was deliberately deferred.

| # | Pending item | Why it is required | Owner | Waits on |
|---|---|---|---|---|
| P.1 | **Core gateway route** `/intelligence-api/**` → intelligence-service (`RewritePath=/intelligence-api/(?<segment>.*), /${segment}`), with the UI built using `VITE_INTELLIGENCE_API_BASE=${GATEWAY}/intelligence-api` | There is no production route to intelligence-service today; it is only reachable in dev through the Vite proxy. | Lextr Core (config-service `gateway-service.yml`) | — |
| P.2 | **Lexie panel resolver:** lexie-ai `POST /api/v1/resolve` → `{use_case, entities{report, schedule, mdrm, period}, clarification?}`, fronted by intelligence-service `POST /api/v1/intelligence/resolve`; `httpHost.resolve` calls it | The Lexie panel cannot route a question to a use case; `httpHost.resolve` returns nothing because no resolver endpoint exists. | Intelligence (lexie-ai, service, UI) | — |
| P.3 | **Persist AU9 export bundles** in a new `intelligence.au9_export_bundle` table (new migration plus DAO, replacing the in-memory map in `Au9ExportServiceImpl`) | Regulatory evidence bundles are lost on restart and are not shared across nodes, so they cannot back a regulatory hand-off. | Intelligence (service) | — |

---

## UC10 Analytical Assist

**Status:** built and tested.

- **Tests:** JUnit, pytest, vitest, OPA (21/21), and live API checks (38/38) all pass.
- **Commits:** intelligence-service `13274aa`, lexie-ai `8e20dea`, intelligence-ui `c061eb5`; catalog, parse, batch and UI follow-up: intelligence-service `65ecc21`, lexie-ai `9c7480e`, intelligence-ui `a5ada45`, config-service `a741e19` (`feat/lexie-impact-bindings`); run preset and measure fixes: intelligence-service `32c04a7`, lexie-ai `54f3004`; evidence test gates: lexie-ai `e971cd3`, `2acb3dc`.
- **What users see today:** while no catalog is bound, every ask returns `CATALOG_NOT_READY`. On 2026-10-03 an **interim catalog** was bound (committed):
  - `ReportStoreCatalog` (`lexie_ai/adapter/analytical_catalog.py`) reads `meta.report_store_metadata` (6 forms), with each form's active MDRM items as elements.
  - It is bound only by config: `lexie.analytical_catalog: report_store`. The tenant's Core client id comes from `tenant_profile.core_client_id` (10.13).
  - With it, `catalog_ready: true`, and asks return MATCHED / NO_MATCH, a structured parse and, when anchored, an operation batch. Live checks matched SQL ground truth.

> **What "catalog" means here:** the list of existing report *definitions* (name, kind, elements, owner, visibility, entitlement). It holds no data values. It comes from the Semantic Layer; Intelligence keeps no copy.

- **2026-10-08 additions** (commits in `plan/Analytical_Assist_Pending_Backend_Prompts.md` §2): ranking by what a report carries (measure 0.6 / 0.45) + named (0.3) + idf-weighted shared words (0.4); clarification for unclear asks; refinement chips; intent confidence; Semantic Layer dataset candidates (semantic-service approved objects, rendered in logical names by intelligence-service, LP-41.7); Report Store artefact cards and functional Run in frontend-service; operation target naming (DD-48).

### Pending: report discovery (removes the `CATALOG_NOT_READY` card)

| # | Item | Owner | Waits on |
|---|---|---|---|
| 10.1 | Semantic Layer report catalog endpoint | Semantic Layer team | — (X.1) |
| 10.2 | lexie adapter implementing `ReportCatalogSource` (`skills/analytical/catalog_source.py`), bound in `lexie_ai/run/dispatcher.py`; stays on-prem (LP-24.5). **Interim:** `ReportStoreCatalog` over Postgres is built and bound by config; the Semantic Layer adapter is still pending. | Intelligence | 10.1 |
| 10.3 | `catalog_ready: true` in `opa/data/lextr/ai/analytical/data.json` for the deployment. **Done** (committed); lexie still answers `CATALOG_NOT_READY` wherever no catalog or tenant is bound. | Deployment | 10.2 |
| 10.13 | ~~Tenant mapping as a trusted input~~ **Done:** `V9__tenant_profile_core_client_id.sql` adds `tenant_profile.core_client_id` (`client_001` → 1, applied locally). lexie's catalog reads it by the validated tenant id — never from the request (generic `/run` forwards the caller's payload) — and caches it; the `lexie.analytical_catalog_tenants` config key is removed. A tenant with no core id stays `CATALOG_NOT_READY` | Intelligence | — |

### Pending: production prerequisites

| # | Item | Owner | Waits on |
|---|---|---|---|
| 10.4 | ~~Apply the ledger migration adding `RUN` / `ACCEPT_BATCH`~~ **Done:** the squashed `V6__evidence_ledger.sql` allows both, and the local DB constraint does (126 `RUN`, 9 `ACCEPT_BATCH` rows) | Deployment / DBA | — |
| 10.5 | ~~Seed an `ANALYTICAL_ASSIST` preset with no report type~~ **Done:** `V8__seed_analytical_assist_preset.sql` seeds `ENV_ANALYTICAL_ASSIST` (no model; binds `lextr.ai.tool_scope_analytical`) and the operational family-less preset `UC10_ANALYTICAL_DISCOVERY` for `client_001`; applied locally. The code fallback stays for unseeded tenants (X.6) | Platform | — |
| 10.6 | Core mounts the panel at `an-lexie` and applies batches with `surface=CORE` | Lextr Core | X.3 |
| 10.7 | Entitlements reach lexie's visibility filter. **Path done:** `X-User-Entitlements` → controller → coordinator → lexie `entitlements`. Still needs the gateway to send the header (X.4); the interim catalog carries no entitlement column, so nothing is filtered on today's data | Gateway | X.4 |

### Pending: Refine & build

| # | Item | Owner | Waits on |
|---|---|---|---|
| 10.8 | lexie generates operation batches (LP-41.3); the batch review UI and apply endpoint are already built. **Backend built**: an anchored run (`target_report_id` + `against_version`) returns `operation_batch`, `batch_rejections` and `batch_refusal`. Every operation of the ask travels in the batch; dimensions, filters, relative periods and unresolved measures are flagged `is_grounded: false` with a note (no Semantic Layer to resolve them), and the apply path never applies an ungrounded operation. `batch_rejections` now holds only what the report's refine mode forbids. | Intelligence | — |
| 10.9 | lexie returns a structured parse (measure, dimensions, filters, period). **Backend built**, rule-based with no model call. The measure resolves to a catalog element only on an exact line name; several lines with that name leave it unresolved and return them as `measure_candidates`; anything else keeps the ask's own words with no candidates (a word inside a line name no longer resolves to that line: "exposure by counterparty" used to read as the hedge-funds OTC derivatives line). Whole report names, groups and tags are taken out of the measure ("FRY9C goodwill" → GOODWILL). Each match also returns `covers` / `gaps` / `unverified`: the measure is covered or a gap only where the report carries elements; dimensions and filters stay unverified until X.2. | Intelligence | — |
| 10.14 | Render the new response fields. **Intelligence UI done:** match cards show `covers` (✓), `gaps` (⚠), `unverified` (?) and the matched MDRM lines with "+N more"; an unresolved measure lists its candidates; refining a match runs the ask anchored to that report at preview version 1 and reviews the returned batch — ungrounded operations shown but not acceptable, Apply disabled off Core with its reason, `batch_refusal` and mode rejections shown. **Still Core's:** rendering these inside Core, and anchoring to Core's real builder version | Lextr Core | 10.6 |
| 10.15 | ~~Ask Lexie route for UC10~~ **Done:** when the resolver picks UC10, the Lexie panel no longer calls generic `/run` (which skipped `tool_scope_analytical`); it offers "Open in Analytical Assist", which carries the question to the workspace, where it is submitted once through `/api/v1/analytical/run` under the UC10 policy | Intelligence | — |
| 10.16 | ~~Run button~~ **Done (2026-10-08):** off Core (intelligence-ui) disabled with a reason; on Core (frontend-service) functional through Core's own report generation (formats, AFT validation, generateBulkReport, Report Store) | Lextr Core | — |
| 10.10 | Period calendar source | Lextr Core | Source decision |
| 10.11 | Report Store source (LP-45), then `report_store_ready: true` | Lextr Core | Source decision |
| 10.12 | Core builder state available to the panel | Lextr Core | — |

### Open decisions

- **Intent confidence:** built 2026-10-08 as a deterministic parse-completeness score (lexie `ask_parse.intent_confidence`); the weights await owner sign-off.
- **FACT asks:** answering due dates ("When is FR Y-9C due?") needs a filing calendar (10.10); not built.
- **Functions check:** `tool_scope_analytical` never reads `X-User-Functions` (a run with no functions gets the same answer as an analyst's). Add a function gate?

- **Physical names on outage:** show physical names when the Semantic Layer is unreachable? Today the screen shows `[UNRESOLVED]`. Changing it needs DD-48 / LP-24.5 sign-off.
- **Readiness flags:** are KG, derived attributes and parameter defaults bound? If not, set `kg_ready` / `derive_ready` / `parameter_default_ready` to `false`.
- **History:** add an analytical kind to HistoryDrawer `RECORD_KINDS`?

### Housekeeping

- **Unused message keys:** the 41 keys of the removed legacy screens are deleted. About 64 `analytical.uc10.*` keys with no use yet remain on purpose: they are the design's copy for 10.14 (asset narrowing, store hints, coverage).
- ~~**Card wording**~~ **Done:** title "Report catalog not ready (CATALOG_NOT_READY)"; the footer no longer claims a run was logged when the policy blocked it.
- **Run preset recorded:** a UC10 run now records `agent_run.preset_id` / `preset_version` (the seeded `UC10_ANALYTICAL_DISCOVERY`); a run on the code fallback preset leaves them NULL. Other use cases still do not record a preset. SQL checked locally; live check pending an intelligence-service restart.
- **Evidence test gates:** the LP-26 and rules gates read every `V*__*.sql` migration instead of named files, and `claims.json` finds a claimed control by what implements it (`implements: fn_evidence_fence` under the migration folder), so a migration squash no longer breaks them.
- **Dev test data:** tenant `client_001` in the local database holds test runs and ledger rows.

---

## UC2 Impact Analysis

**Status:** implemented on 2026-10-02 (plan steps 1–8; step 8, ImpactPathView, built on owner request after first being deferred). Branch `feature/lextr-intelligence-v1.38.0` in all three repos, **uncommitted** (owner: do not commit yet). No migration needed: `RUN` is already a governed ledger action (V44/V45) and no table was added.

- **Tests:** JUnit `ImpactServiceTest` 17/17 (incl. controller 400s, ledger, surface guard, mocked `LexieAiClient`), `ImpactCrossLayerWireThroughTest` 2/2, `ToolScopeImpactPolicyTest` 3/3. OPA `tool_scope_impact_test.rego` 16/16, policy coverage 97.2% (`opa check --strict --v0-compatible` clean; the 6 `evidence_test` failures predate this work). pytest: `tests/impact` + `test_impact_analysis_skill.py` + `test_run_route.py` + no-composed-prose 40/40; full lexie suite 491 passed / 1 skipped / 7 xfailed. vitest: `features/impact` 22/22 (incl. a real headless Cytoscape + ELK layout: no NaN position, deterministic twice, top-down); whole suite 546/547 (the 1 failure is the pre-existing hardcoded-string gate in `knowledge/KhSubcomponents.tsx`). Typecheck 76 → 73 errors, none in touched files.
- **LP-47 gates:** unchanged from baseline, already RED before this work: reachability (`governance` slice reachable but declared unmounted), typecheck debt (73, declared 0), gate mutants (anchor `const TENANTS = {` missing in App.tsx). None of them involves impact.
- **Live API checks (2026-10-02, `client_001`): 23/23 pass** (`intelligence-service/scripts/impact-live-check.sh`). They cover the 400s for each identity header, the OPA decisions (within-report allowed, `CROSS_REPORT_NOT_READY`, `EVALUATE_NOT_READY`, model op denied), the lexie `/run` UC2 calls (`RUN_ADAPTER_UNBOUND`, `needs_input`), the svc refusal passed through verbatim, the cross-report honest empty (persisted and reviewed, verbatim policy reason), needs_input (persisted, not reviewed), and `SURFACE_NOT_CORE` (422) for a DRAWER run off the Core surface.
- **Browser E2E (headless Chromium, :5173): 16/16 pass, no console or page errors.** It checks the honest empty grid, no seeded subjects, no use-case codes in visible text, "not recorded" for Core's period, the HowThisWorks impact flow, and no impact call without a Core adjustment.
- **Inline path (2026-10-02, follow-up):** the generic `/run` lane refuses a complete UC2 adjustment (`IMPACT_RUN_NOT_GOVERNED`, 422) so impact is only ever computed through the governed `/api/v1/impact/run`; an Ask-Lexie question still gets `needs_input`, and its answer now carries a form for exactly the missing fields that posts `entry_point=INLINE` to the governed endpoint. The UC9 twin's UC2 branch asks for the adjustment instead of inventing `BHCK2170` / `FRY9C` / `100.0`.
- **Graph bound (2026-10-02):** `GraphImpactAdapter` (`lexie_ai/adapter/impact_ops.py`) reads Core's `DEPENDS_ON` projection in Neo4j (Taxonomy → Rule → Dataset) over its HTTP API; it is bound only when `LEXIE_IMPACT_GRAPH_URL` is set (credentials from the config service), otherwise UC2 stays `RUN_ADAPTER_UNBOUND`. The projection has no edge operators, so every reached node is STRUCTURAL_ONLY with no Δ (the propagator no longer defaults a missing operator to `sum`, and structural reach now walks every hop). Live: `dataset:ds.regulatory_ledger_ds` reached 154 nodes (77 rules, 77 FR Y-9C lines) over all 154 edges, depth 4, persisted and reviewed. Node refs are `taxonomy:<id>`, `rule:<id>`, `dataset:<name>`.
- **Decisions applied:** host grid = honest empty state (no picker, no seeds); OPA package kept as `lextr.ai.tool_scope_impact`; catalogue row BUILT, `go: "impact"` + `ask: "impact"` (dual = DRAWER + INLINE; `SurfaceMode` has no dual value, so none was added); ImpactPathView built afterwards (decision reversed by owner).

### Pending

| # | Item | Owner | Waits on | Status |
|---|---|---|---|---|
| 2.10 | Core mounts `ImpactWorkspace` with `adjustments` (its launch context), `period` and `openEvidence`, and calls with `?surface=CORE`, `X-User-Id` and `X-User-Functions` (required, 400 without) | Lextr Core | X.3 | Open |
| 2.14 | `agent_run` schema mismatch (LP-37.2 B3). Honest-empty and needs_input runs persisted fine live; no mismatch surfaced. | — | — | Watch |
| 2.15 | Ledger decision ids are null (same as 11.10: the dev OPA has no decision logging) | Platform | OPA config | Open (platform-wide) |

---

## UC11 Rules & Logic Assist

**Status:** built and running end to end in dev (validated 2026-10-09). The rule store (Core's meta tables), the governed catalog (through semantic-service) and a drafter are bound in dev, and all three OPA readiness gates are on. intelligence-ui is at parity with the reference JSX `RulesAssistWorkspace`.
Commits on `feature/lextr-intelligence-v1.38.0`:
- intelligence-service: `be1bee6` (pushed), `2396232` (local)
- lexie-ai: `ae711a5` (pushed), `bf05b65`, `b978fec` (local)
- intelligence-ui: `51f385c` (pushed), `4171d8e`, `170e9c1`, `cd05014` (local), plus the 2026-10-09 test and wording pass (uncommitted at the time of writing)

- **Tests (2026-10-09):**
  - JUnit `RulesAssistTest`: 24/24
  - pytest `tests/rules`: 137 pass, 1 known failure (`test_origin_vocabulary_agrees_sql_and_java`: the migrations are no longer in intelligence-service, so the test finds no SQL)
  - vitest `src/features/rules` + `src/components/__tests__`: 87/87
  - `tsc`: clean on the touched files
  - OPA `opa test`: not re-run (no `opa` binary on the validation machine)
- **Live API sweep (2026-10-09, tenant `1`):** every rule in the catalog (77) through detail, instruction, siblings and `/assist` in all four entry states.
  - detail 77/77, siblings 77/77, instruction 74/77 (3 `INSTRUCTION_NOT_FOUND`), `/assist` 308/308 COMPLETED
  - every finding has a severity, and every patch has all 10 fields
  - no draft without `generate:true`; review never drafts
  - identity: 400 without `X-Client-Id` or `X-User-Id` on all 5 endpoints; acceptance on another surface: 422 `SURFACE_NOT_CORE`
- **Browser (2026-10-09, headless Chromium on :5173):**
  - BHCK3521 through Check, every tab, Build (values, search, In, apply), accepting a patch, Re-check and review
  - Draft from anchor on a blank rule (BHCK3196)
  - How this works
  - Ask Lexie → Accept → arrival banner, typed and clicked
  - no HTTP ≥ 400 and no console errors (other than the AG Grid licence banner)
- **What users see today:**
  - findings with server severity and node-anchored patches
  - Semantic Layer attributes and governed values
  - sibling containment and the KEEP/MODIFY/ADD/REMOVE disposition
  - Core's maker-checker track
  - a generated draft with grounding coverage (attributes and literals resolved)
- **Fixed on 2026-10-09:**
  - lexie-ai: `rules.compose_predicate` is asked with the polarity and value it gates on (it was always denied, so no retired-value patch or accept-all ever reached the panel); proposals require governed AND rules-eligible; the drafter returns the confidence breakdown; the run carries `rule_instruction_version`
  - intelligence-ui: Check moves to the guide's tab; Draft from anchor only on a blank rule; no fixture confidence in Ask Lexie; a typed UC11 ask gets the Rules handoff; the answer is shown once
- **Decisions applied:**
  - Q1: the radar label is out of scope (11.9).
  - Q2: `RulesAssistWorkspace` is the one renderer.
  - Q3: Save draft and Submit call rule-service on the standalone page.
  - Q4: the route prefix `/api/intelligence/rules` is kept.
  - Registration requests belong to semantic-service's steward queue; the panel offers one only through `onRequestRegistration`.

### Pending

| # | Item | Owner | Waits on | Status |
|---|---|---|---|---|
| 11.1 | Apply `V45__lp25_rules_ledger_actions.sql`. It adds `SUGGEST` and `ACCEPT` to the ledger's allowed actions, plus the nullable `agent_run.accepted_by` column. Without it, every assist and acceptance fails its ledger write. | Deployment / DBA | — (X.5) | Applied in dev; other environments open |
| 11.2 | Core sends `X-User-Id` (required, 400 without it) and `X-User-Functions` on all endpoints, and posts acceptance receipts with `?surface=CORE` (any other surface gets `SURFACE_NOT_CORE`, 422) | Lextr Core | X.3 | Open |
| 11.3 | Core mounts `RulesAssistWorkspace` and supplies `core` (the rule, its version, the authoring session, work begun), `onAcceptPatch`, `onRequestRegistration` and `openEvidence` | Lextr Core | X.3 | Open |
| 11.4 | Rules adapter: `CoreRuleStore` (`lexie_ai/adapter/rules_ops.py`) over Core's meta tables, the catalog through semantic-service (`rules_semantic.py`), per-op `tool_scope_rules` gate | Intelligence | — | Done in dev |
| 11.5 | `instruction_ready` / `catalog_ready` / `rule_store_ready` in `opa/data/lextr/ai/rules/data.json` | Deployment | — | All `true`; set per deployment |
| 11.6 | lexie returns instruction, attributes, siblings with containment, disposition, node-anchored patches and confidence | Intelligence | — | Done |
| 11.7 | Core's maker-checker position: the workflow definition is read from Core's meta tables and drawn; position comes from the rule status | Lextr Core / Intelligence | — | Done (read-only) |
| 11.8 | Drafter for `rules.draft` (`LEXIE_RULES_DRAFTER`) | Intelligence | Model approval per deployment | Bound in dev; choose per deployment |
| 11.9 | Relabel the Supervisory Radar off UC11 (`skills/supervisory_radar_skill.py`, `SupervisoryRadarCoordinatorImpl.java:206`, the `useCaseAliases.ts` sources). Ask Lexie works around it for rules answers. | Owner | Radar id | Deferred (owner: leave as is) |
| 11.10 | **Ledger decision ids are always null.** The dev OPA server returns no `decision_id` (decision logging not configured). | Platform / Deployment | OPA config change | Open (platform-wide; not re-checked 2026-10-09) |
| 11.11 | **Ledger ctx is not stored.** `EstateLedgerServiceImpl.estateRecord` keeps only `actor`, `track` and `to`. | Intelligence (shared ledger) | Shared-service change approval | Open (platform-wide; not re-checked 2026-10-09) |
| 11.12 | Add a rules kind to HistoryDrawer `RECORD_KINDS` (backed by `GET /sessions/{ref}/runs`) | Intelligence | Decision | Deferred (owner: not now) |
| 11.13 | Push the local UC11 commits (svc `2396232`; lexie `bf05b65`, `b978fec`; ui `4171d8e`, `170e9c1`, `cd05014` and later) | Owner | Review | Open |
| 11.14 | Dev test data: run `uc11-httpcheck-*`, and about 330 SUGGEST ledger rows from the 2026-10-09 sweep, in the dev tenant | Owner | — | Open (delete when no longer needed) |
| 11.15 | **Clause binding is never recorded on Core rules**, so every clause shows "no predicate" and the guide says the rule "will over-report". Store `clause_ref` on the filter step (plan B5), tell requirements from notes (B6), suggest bindings (B7). | Lextr Core + Intelligence | Core rule-service / editor change | Open |
| 11.16 | Logical names and value descriptions: semantic-service holds no logical name for `internal_reg_coa` (the code is shown) and no descriptions for COA values | Semantic Layer | Data | Open |
| 11.17 | Catalog scope per job (`RulesAssist_Catalog_Scope_Plan.md`): Build lists only the attributes the rule uses, and drafts on a blank rule have an empty catalog (coverage 0.00) | Intelligence | — | Planned |
| 11.18 | Handoff provenance (run id, semantic coverage, resolved n/m, language) in the Ask Lexie → Rules handoff; the banner shows only the question until then (plan G1/B4) | Intelligence | lexie handoff payload | Open |
| 11.19 | A semantic-service endpoint that raises the steward's registration task, passed as `onRequestRegistration` (plan B1) | Lextr Core (semantic-service) | — | Open |
| 11.20 | Ship a Spanish catalogue. The i18n runtime only ships complete catalogues (all codes, enforced by `localeCatalogue.test.ts`); only en-US ships. | Intelligence | Translation source and review | Open |
| 11.21 | Decide which tab Check opens. Today it follows the guide, which on Core rules is almost always Understand (because of 11.15). | Owner | Decision | Decision |

**Open decisions:**
- **Radar id:** which use-case id should the Supervisory Radar take?
- **Drafter:** which model backs `rules.draft` outside dev?
- **Check tab (11.21):** go to Check when there are findings, stay on the current tab, or keep following the guide?

**Risk:** making `X-User-Id` required breaks any Core caller that sends only `X-Client-Id`.

---

## Other screens (not reviewed in this pass)

These are not yet assessed against current code. Add a section when each is reviewed:
- UC1 Variance
- UC3 / UC8 / UC9 / UC12 inline answers
- Presets, Knowledge Hub, Drop Profiles, To-do Inbox
- Training Data & Models, Runtime Policies, Model Registry
- AI Risk & Controls, Audit & Evidence, Role Mapping, Governance Profiles
- Skill Registry, the Lexie panel

Most of these are already wired to the API. Find a screen's real gaps by checking it against the reference JSX (`files/Lextr_Intelligence_UI_v1.38.0_FINAL.jsx`) and the code, as the UC2 discovery plan in this folder does.
