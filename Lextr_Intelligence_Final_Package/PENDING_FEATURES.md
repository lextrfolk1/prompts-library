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
| [UC2 Impact Analysis](#uc2-impact-analysis) | Discovery plan done, **not implemented** | Plan decisions; KG edges in lexie |
| [UC11 Rules & Logic Assist](#uc11-rules--logic-assist) | Discovery plan done, **not implemented** | Plan decisions; rules adapter |
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
| X.3 | **Core integration:** embedded panels send identity in `X-Client-Id` / `X-User-Id` / `X-User-Functions` (identity in the body is ignored) and use `surface=CORE` for workflow acts | UC10 now; UC2 and UC11 once built | Lextr Core team | — |
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

**Status:** planned; discovery plan dated 2026-10-02. **No implementation yet.** The screen runs on seeded scenarios.

| # | Pending item | Owner | Waits on |
|---|---|---|---|
| 2.1 | Identity from headers only (400 when missing); drop the `analyst_user` / `FR_Y_9C` defaults; a null OPA response is a denial | Intelligence | — |
| 2.2 | Readiness: `cross_report_ready` and `evaluate_ready` set to `false`; add `tool_scope_impact_test.rego` | Intelligence | — |
| 2.3 | Coordinator delegates to lexie `/run` UC2, deleting the local one-hop arithmetic; persist honest-empty and needs_input runs | Intelligence | — |
| 2.4 | Estate ledger `RUN` record (capability `impact`, decision under `allow`); CORE surface guard | Intelligence | — |
| 2.5 | lexie skill reads its own edges from the KG (`kg_client.get_dependents`) and wires the OPA evaluator | Intelligence | KG binding |
| 2.6 | UI on one render model: delete `IMPACT_SCENARIOS`, add featureClient calls with `useRefusal`, show "not recorded" for gaps | Intelligence | 2.3 |
| 2.7 | UI conventions: `HowThisWorks destinationId="impact"`, i18n, `useIdentity()` surface, token colours | Intelligence | — |
| 2.8 | ImpactPathView (Cytoscape + ELK, LP-37.4) | Intelligence | Decision (deferred) |

**Open decisions:**
- **Host-grid rows:** with no Core feed, show an empty state or a subject picker?
- **OPA package name:** keep the current package or rename it?
- **Catalogue row:** change it to BUILT / dual?
- **Path view:** build it now or later?

**Risk:** the `agent_run` schema mismatch (LP-37.2 B3) may surface when runs are persisted.

---

## UC11 Rules & Logic Assist

**Status:** planned; discovery plan dated 2026-10-02. **No implementation yet.** The lexie route is `UnboundRoute("rules")`, so every assist call is refused.

| # | Pending item | Owner | Waits on |
|---|---|---|---|
| 11.1 | Require `X-User-Id` and read `X-User-Functions` on all 3 endpoints; persist the invoker and the acceptor | Intelligence | X.3 coordination with Core |
| 11.2 | Pass lexie refusals through (e.g. `RUN_ADAPTER_UNBOUND`) instead of reporting COMPLETED | Intelligence | — |
| 11.3 | Readiness `false` until the adapter is bound; policy tests; confirm the Rego v1 syntax loads under the dev OPA flags | Intelligence | — |
| 11.4 | Estate ledger records `SUGGEST` / `ACCEPT`, refusals included (LP-59 record-first) | Intelligence | Ledger vocabulary migration (as V44 did for UC10) |
| 11.5 | Rules adapter (Semantic Layer + rule store) bound in `lexie_ai/run/dispatcher.py` | Intelligence | X.1, rule-store endpoint |
| 11.6 | UI mounts `RulesAssistPanel` from the `/assist` render model; delete the `RULES_*` seeds and the local confidence; loading, error and "not recorded" states | Intelligence | 11.2 |
| 11.7 | Remove the owned-workflow illusion ("Submit for approval", step ring) or show Core's status read-only | Intelligence | Decision |
| 11.8 | Conventions: shared `HowThisWorks destinationId="rules"`, `useIdentity()` surface, 62 hex colours → tokens, wire `openEvidence` | Intelligence | — |
| 11.9 | Relabel the Supervisory Radar off UC11 | Owner decision | Decision |

**Open decisions:**
- **Radar id:** which use-case id should the Supervisory Radar take?
- **Seeded workspace:** retire it, or keep it as a design reference?
- **Approval UI:** remove it, or show Core's status read-only?
- **Route prefix:** keep `/api/intelligence/rules` or move to `/api/v1/rules`?
- **Rule-store endpoint:** which one will the adapter bind to?

**Risk:** requiring `X-User-Id` can break Core callers that send only `X-Client-Id`.

---

## Other screens (not reviewed in this pass)

These are not yet assessed against current code. Add a section when each is reviewed:
- UC1 Variance
- UC3 / UC8 / UC9 / UC12 inline answers
- Presets, Knowledge Hub, Drop Profiles, To-do Inbox
- Training Data & Models, Runtime Policies, Model Registry
- AI Risk & Controls, Audit & Evidence, Role Mapping, Governance Profiles
- Skill Registry, the Lexie panel

Most of these are already wired to the API. Find a screen's real gaps by checking it against the reference JSX (`files/Lextr_Intelligence_UI_v1.38.0_FINAL.jsx`) and the code, as the UC2 and UC11 discovery plans in this folder do.
