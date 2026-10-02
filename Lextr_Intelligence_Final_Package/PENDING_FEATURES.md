# Lextr Intelligence: Pending Work by Use Case and Feature

- **Last updated:** 2026-10-02
- **Branch:** `feature/lextr-intelligence-v1.38.0` (intelligence-service, lexie-ai, intelligence-ui)
- **How to use this file:** one section per use case or feature. Each lists what is built and what is pending, with an owner and what it waits on. Update the section when work lands; add a section when a use case is reviewed.

## Status at a glance

| Use case / feature | Status | Main blocker |
|---|---|---|
| [Cross-cutting](#cross-cutting) | Partly in place | Semantic Layer, Core integration, gateway entitlements |
| [Platform & integration](#platform--integration) | 3 required items open | Core gateway route, Lexie resolver, AU9 persistence |
| [UC10 Analytical Assist](#uc10-analytical-assist) | **Built and tested.** Waiting on external sources. | Semantic Layer report catalog |
| [UC2 Impact Analysis](#uc2-impact-analysis) | **Built and tested** (steps 1–8), including live API checks (23/23) and a browser E2E. With `LEXIE_IMPACT_GRAPH_URL` set, runs walk Core's Neo4j dependency graph (structural reach); unset, they are refused; the cross-report slice is an honest empty. **Not committed.** | Impact adapter (KG / Core graph) binding |
| [UC11 Rules & Logic Assist](#uc11-rules--logic-assist) | **Built and tested**, including live API checks (29/29). Every assist is refused until the rules adapter is bound. | Semantic Layer + rule store adapter |
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
- **Commits:** intelligence-service `13274aa`, lexie-ai `8e20dea`, intelligence-ui `c061eb5`.
- **What users see today:** every ask returns `CATALOG_NOT_READY`. This is correct while no catalog is bound.

> **What "catalog" means here:** the list of existing report *definitions* (name, kind, elements, owner, visibility, entitlement). It holds no data values. It comes from the Semantic Layer; Intelligence keeps no copy.

### Pending: report discovery (removes the `CATALOG_NOT_READY` card)

| # | Item | Owner | Waits on |
|---|---|---|---|
| 10.1 | Semantic Layer report catalog endpoint | Semantic Layer team | — (X.1) |
| 10.2 | lexie adapter implementing `ReportCatalogSource` (`skills/analytical/catalog_source.py`), bound in `lexie_ai/run/dispatcher.py`; stays on-prem (LP-24.5) | Intelligence | 10.1 |
| 10.3 | `catalog_ready: true` in `opa/data/lextr/ai/analytical/data.json` for the deployment | Deployment | 10.2 |

### Pending: production prerequisites

| # | Item | Owner | Waits on |
|---|---|---|---|
| 10.4 | Apply `V44__lp24_analytical_ledger_actions.sql` (adds `RUN`, `ACCEPT_BATCH` to the ledger's allowed actions) in every environment | Deployment / DBA | — (X.5) |
| 10.5 | Seed an `ANALYTICAL_ASSIST` preset with no report type per tenant | Platform | X.6 |
| 10.6 | Core mounts the panel at `an-lexie` and applies batches with `surface=CORE` | Lextr Core | X.3 |
| 10.7 | Entitlements reach lexie's visibility filter | Gateway | X.4 |

### Pending: Refine & build

| # | Item | Owner | Waits on |
|---|---|---|---|
| 10.8 | lexie generates operation batches (LP-41.3); the batch review UI and apply endpoint are already built | Intelligence | 10.1, X.2 |
| 10.9 | lexie returns a structured parse (measure, dimensions, filters, period); shown as "not recorded" today | Intelligence | 10.1 |
| 10.10 | Period calendar source | Lextr Core | Source decision |
| 10.11 | Report Store source (LP-45), then `report_store_ready: true` | Lextr Core | Source decision |
| 10.12 | Core builder state available to the panel | Lextr Core | — |

### Open decisions

- **Physical names on outage:** show physical names when the Semantic Layer is unreachable? Today the screen shows `[UNRESOLVED]`. Changing it needs DD-48 / LP-24.5 sign-off.
- **Readiness flags:** are KG, derived attributes and parameter defaults bound? If not, set `kg_ready` / `derive_ready` / `parameter_default_ready` to `false`.
- **History:** add an analytical kind to HistoryDrawer `RECORD_KINDS`?

### Housekeeping

- **Unused message keys:** about 20 `analytical.*` keys left from the removed legacy screens.
- **Card wording:** the `CATALOG_NOT_READY` title reads like an access denial ("Report catalog not ready" would be more accurate). The footer says "run is logged" even when the policy blocks the ask and no run executes.
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

**Status:** implemented on 2026-10-02 (plan steps 1–8). Commits: intelligence-service `be1bee6`, lexie-ai `ae711a5`, intelligence-ui `51f385c` (not pushed). Unit tests and live API checks pass. V45 is applied in dev.

- **Tests:** JUnit `RulesAssistTest` 14/14 and `QueryCatalogIntegrityTest` 2/2. OPA `tool_scope_rules` 20/20 (`opa check` passes under `--v0-compatible`, with and without `--strict`). pytest: rules, `/run` and evidence 55/55; reason-code and dispatcher suites 41/41. vitest: all 532 tests in 87 files pass, including the rules slice (30). Typecheck shows no errors in the touched files.
- **Live API checks (2026-10-02, `client_001`): 29/29 pass.** They cover the identity 400s on all 3 endpoints, the `RUN_ADAPTER_UNBOUND` refusal passed through (REFUSED, not persisted, reason verbatim), the origin gate, the OPA decisions (the ledger op allowed, readiness ops denied, `rules.draft` denied in review), `SURFACE_NOT_CORE` (422, like every policy denial), a 404 for an unknown run, and acceptance LINKED, then ALREADY_LINKED naming the first acceptor. In the database, `user_id` and `accepted_by` are set, there is one ACCEPT row, and refusals are recorded as SUGGEST/refused. The test run `uc11-httpcheck-*` stays in the dev DB.
- **Browser end-to-end test (2026-10-02): 32/32 pass.** Headless Chromium drives the real UI on :5173, through the vite proxy, to the service on :8059, then OPA on :8181, lexie on :5003 and Postgres.
  - **Screen:** the JSX layout with Core's rule, version and session shown as not recorded, no Submit for approval and no maker-checker ring, and one shell "How this works" with the 6-step rules flow.
  - **Request:** Check sends `X-Client-Id`, `X-User-Id` and `X-User-Functions` from the host session; the body carries no identity and no Core context.
  - **Response:** `REFUSED` / `RUN_ADAPTER_UNBOUND` from a lexie run, not saved, with the code and lexie's reason shown verbatim; no findings invented and no evidence link. Review sends `entry_state=review` and is refused the same way.
  - **Ledger:** one SUGGEST/refused row per call under `lextr.ai.tool_scope_rules`, keyed to the lexie run id.
  - **Health:** no browser console errors and no Postgres errors.
  - **Fixed during the run:** a React style warning on the tab buttons (`border` mixed with `borderBottom`).
- **Integration scripts (session scratchpad, not in a repo):** `uc11_http_checks.sh` (API, Core side) and `e2e/uc11_e2e.mjs` (browser; `playwright-core` installed in the scratchpad only).
- **What users see today:** pressing Check returns an honest refusal, `RUN_ADAPTER_UNBOUND`, with lexie's reason verbatim. Core's rule, version and session show as "not recorded" on the nav harness.
- **Decisions applied:** Q1, the radar label, is out of scope (11.9). Q2: `RulesAssistWorkspace` is the one renderer and `RulesAssistPanel` is deleted. Q3: "Submit for approval" and the step ring are removed. Q4: the route prefix `/api/intelligence/rules` is kept. Q5: the rules adapter seam exists and is unbound by default.

### Pending

| # | Item | Owner | Waits on | Status |
|---|---|---|---|---|
| 11.1 | Apply `V45__lp25_rules_ledger_actions.sql`. It adds `SUGGEST` and `ACCEPT` to the ledger's allowed actions, plus the nullable `agent_run.accepted_by` column. Without it, every assist and acceptance fails its ledger write. | Deployment / DBA | — (X.5) | Applied in dev; other environments open |
| 11.2 | Core sends `X-User-Id` (now required, 400 without it) and `X-User-Functions` on all 3 endpoints, and posts acceptance receipts with `?surface=CORE` (any other surface gets `SURFACE_NOT_CORE`, 422) | Lextr Core | X.3 | Open |
| 11.3 | Core mounts `RulesAssistWorkspace` and supplies `core` (the rule, its version, the authoring session, work begun), `onAcceptPatch`, `onRequestRegistration` and `openEvidence` | Lextr Core | X.3 | Open |
| 11.4 | A rules adapter implementing `RulesAdapterSource` (`skills/rules/adapter_source.py`): instruction and governed catalog from the Semantic Layer, siblings from the rule store. Bind it with a per-op `tool_scope_rules` PolicyGate in `RulesRoute`. Stays on-prem. | Intelligence | X.1, rule-store endpoint | Blocked |
| 11.5 | Set `instruction_ready` / `catalog_ready` / `rule_store_ready` to `true` in `opa/data/lextr/ai/rules/data.json` for the deployment | Deployment | 11.4 | Blocked |
| 11.6 | lexie returns the content DTOs: instruction, attributes, siblings, a node-anchored patch, confidence. Today they render as "not recorded"; the screen already renders them when present. | Intelligence | 11.4 | Blocked |
| 11.7 | Core workflow-status feed, so the panel can show Core's maker-checker position read-only. Nothing is drawn today. | Lextr Core | Feed contract | Open |
| 11.8 | Bind a drafter. Until then `rules.draft` is never called and Generate is not offered. | Intelligence | Model binding decision | Decision |
| 11.9 | Relabel the Supervisory Radar off UC11 (`skills/supervisory_radar_skill.py`, `SupervisoryRadarCoordinatorImpl.java:206`, the `useCaseAliases.ts` sources) | Owner | Radar id | Deferred (owner: leave as is) |
| 11.10 | **Ledger decision ids are always null.** The dev OPA server returns no `decision_id` (decision logging not configured), so every ledger row, UC10's included, has none. Found in the live checks. | Platform / Deployment | OPA config change | Open (platform-wide) |
| 11.11 | **Ledger ctx is not stored.** `EstateLedgerServiceImpl.estateRecord` keeps only `actor`, `track` and `to`; `session` and the other context are dropped and `canonical_payload` is `{}`, for every capability. Found in the live checks. | Intelligence (shared ledger) | Shared-service change approval | Open (platform-wide) |
| 11.12 | Add a rules kind to HistoryDrawer `RECORD_KINDS` (backed by `GET /sessions/{ref}/runs`) | Intelligence | Decision | Deferred (owner: not now) |
| 11.13 | Push the UC11 commits (`be1bee6`, `ae711a5`, `51f385c`) | Owner | Review | Open (committed locally, not pushed) |
| 11.14 | Dev test data: run `uc11-httpcheck-*` and its ACCEPT / SUGGEST ledger rows in `client_001` | Owner | — | Open (delete when no longer needed) |

**Open decisions:**
- **Radar id:** which use-case id should the Supervisory Radar take?
- **Rule-store endpoint:** which one will the adapter bind to?
- **Drafter:** which model, if any, backs `rules.draft`?

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
