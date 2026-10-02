# UC10 Analytical Assist: What Is Pending

- **Date:** 2026-10-02
- **Branch:** `feature/lextr-intelligence-v1.38.0` (intelligence-service, lexie-ai, intelligence-ui)
- **Plan of record:** `UC10_ANALYTICAL_ASSIST_DISCOVERY_PLAN.md` (local copy, not in this repo)

## Where it stands

All nine steps of the plan are built and tested in Intelligence.

| Suite | Result |
|---|---|
| JUnit (intelligence-service) | 720 passed |
| pytest (lexie-ai) | 1250 passed |
| vitest (intelligence-ui) | 528 passed |
| OPA tests (`tool_scope_analytical`) | 21/21 passed |
| Live API checks against local services | 38/38 passed |

**Today every ask ends at `CATALOG_NOT_READY`.** This is correct, not a defect: there is no report catalog to search until the Semantic Layer is bound.

- **What "catalog" means:** the list of report *definitions* that already exist (name, kind, elements, owner, visibility, entitlement). It holds no data values.
- **Why it comes from the Semantic Layer:** UC10 reads the catalog from the Semantic Layer and keeps no copy of its own, so there is no fallback list.

---

## 1. Report discovery (makes the `CATALOG_NOT_READY` card go away)

| # | Pending item | Owner | Status | Notes |
|---|---|---|---|---|
| 1.1 | Semantic Layer **report catalog** endpoint and its contract | Semantic Layer team | Blocked: no endpoint yet | Must return the reports a tenant can see: id, name, description, kind, elements, tags, owner, private flag, required entitlement. |
| 1.2 | lexie adapter for that endpoint | Intelligence (lexie-ai) | Ready to build once 1.1 exists | Implement `ReportCatalogSource` in `skills/analytical/catalog_source.py`, then bind it to the UC10 route in `lexie_ai/run/dispatcher.py`. The call stays on-prem (LP-24.5). |
| 1.3 | Set `catalog_ready: true` for the deployment | Deployment | Waits on 1.2 | `opa/data/lextr/ai/analytical/data.json` |

**Result once done:** asks return real `MATCHED` / `NO_MATCH_IN_INVENTORY` results and the screen shows match cards. The service→lexie path is already tested: run saved, review skipped on `CATALOG_NOT_READY`, ledger `RUN` row written.

## 2. Production prerequisites

| # | Pending item | Owner | Status | Why it matters |
|---|---|---|---|---|
| 2.1 | Apply migration `V44__lp24_analytical_ledger_actions.sql` in every environment | Deployment / DBA | Applied locally only | There is no Flyway, so it must be run by hand. Without it, apply and the ledger fail with a 409. |
| 2.2 | Seed an `ANALYTICAL_ASSIST` preset with no report type for each tenant | Platform / tenant onboarding | Not seeded | Until then a built-in default preset is used. It works, but it is not governed. |
| 2.3 | Core integration of the embedded panel | Lextr Core team | Not started on the Core side | Core mounts the panel at `an-lexie` and sends `X-Client-Id` / `X-User-Id` / `X-User-Functions` on every call (identity in the body is ignored). Core must apply batches with `surface=CORE`; any other surface is refused with `SURFACE_NOT_CORE`. |
| 2.4 | Entitlements from the gateway (for example an `X-User-Entitlements` header) | Gateway team | No contract yet | Without them, reports that need an entitlement are hidden from every viewer. |
| 2.5 | Bind the service's Semantic Layer **name conversion** client | Semantic Layer team, then Intelligence | Blocked | `UnboundSemanticLayerClient` must be replaced by a real client. Until then, operation targets render as `[UNRESOLVED]`; physical codes show only on an explicit `CATALOG_GAP`. |

## 3. Refine & build (full construction flow)

| # | Pending item | Owner | Status | Notes |
|---|---|---|---|---|
| 3.1 | lexie generates **operation batches** (LP-41.3) against Core's builder version | Intelligence (lexie-ai) | Waits on 1.1 / 2.5 | The batch review UI (per-op accept / reject, stale batches shown) and `POST /api/v1/analytical/batch/apply` are built and tested. lexie returns no batch yet. |
| 3.2 | lexie returns a **structured parse** of the ask (measure, dimensions, filters, period) | Intelligence (lexie-ai) | Waits on 1.1 | Shown as "not recorded" for now. It must come from the skill, not a browser-side parser. |
| 3.3 | **Period calendar** source | Lextr Core | No source identified | The period prompt shows "not recorded". |
| 3.4 | **Report Store** source (LP-45), then set `report_store_ready: true` | Lextr Core | No source identified | `report_store_ready` is `false`. |
| 3.5 | Core builder state (dataset, filters, columns, version) available to the panel | Lextr Core | Not started | The Core builder section shows "not recorded" rather than a stand-in. |

## 4. Open decisions

| # | Decision | Default today |
|---|---|---|
| 4.1 | Show physical names when the Semantic Layer is unreachable? This reverses the seam rule enforced by `AnalyticalSeamWireThroughTest` Gate 2 and needs DD-48 / LP-24.5 sign-off. | No: `[UNRESOLVED]` marker |
| 4.2 | Are KG, derived attributes and parameter defaults bound? If not, set `kg_ready`, `derive_ready`, `parameter_default_ready` to `false`. | `true` (unverified) |
| 4.3 | Remove the "build a default preset" fallback shared by every use case's resolver? | Kept (cross-feature design change) |
| 4.4 | Add an analytical record kind to HistoryDrawer `RECORD_KINDS`? | Not added (not in the plan) |

## 5. Housekeeping

- **Unused message keys:** about 20 `analytical.*` keys in `intelligence-ui/src/i18n/messages.en.ts` belong to the removed legacy screens (`analytical.AnalyticalWorkspace.001`–`.013`, `analytical.ConstructionProposalCard.*`, `analytical.uc10.freeText` / `.tryPrompt` / `.changed` / `.physical`). Removing them is optional.
- **Card wording:**
  - The `CATALOG_NOT_READY` title "Catalog Introspection Not Permitted" reads like an access denial. "Report catalog not ready" would be more accurate.
  - The footer "this execution run is logged" is inaccurate when policy refuses the ask: no run executes, only a ledger entry is written.
- **Dev test data:** tenant `client_001` in the local database holds test rows: `ana-…` / `apply-…` runs and `b-…` batch ledger rows, including three `agent_run` rows written before V44 that have no ledger entry.
- **Pre-existing failures:** six `evidence_test` OPA failures predate this work and are unrelated.
- **Not part of this work:** `lexie-ai/requirements.txt` (local `torch` pin) was already modified and should not be committed with UC10.
