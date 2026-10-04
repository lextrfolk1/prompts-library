# Surface Map — Drawer Features API Inventory

Source: `intelligence-ui/src/shell/surfaceCatalogue.ts` (rows rendered by `components/organisms/SurfaceMap.tsx`).
Call chain for every API: **intelligence-ui → intelligence-service → lexie-ai** (when proxied). Identity is sent as headers (`X-Client-Id`, `X-User-Id`, `X-User-Functions`) via `shell/featureClient.ts`.

## 1. Surface Map tab: what each row means

Each row shows **UC · Name · Capability · Mode · Status**. Mode labels:

| Mode | Meaning |
|---|---|
| DEDICATED | Full screen (nav destination) |
| INLINE | Answer rendered inside the Ask-Lexie panel |
| DRAWER | Slide-over panel opened over a host screen |
| MICRO | Small in-context popover |
| PANEL | The Ask-Lexie panel itself |
| EMBEDDED | Panel that Core embeds in its own screen |

Status: a row with `go` is **BUILT** when that destination is mounted in the registry and **ROADMAP** when it isn't (live check in `withLiveStatus`). Rows with only `ask` or `drawer` keep their catalogued status.

### Drawer-mode surfaces

| UC | Surface | Status | Click action | UI entry |
|---|---|---|---|---|
| UC1 | Variance Analysis | BUILT | `go: variance` | `features/variance` → `VarianceWorkspace` + `VarianceExplanationDrawer` |
| UC2 | Impact Analysis | BUILT | `go: impact` (+ `ask: impact` inline) | `features/impact` → `ImpactWorkspace` (drawer) / `ImpactAnswer` (inline) |
| UC5a/b | Lineage Walk | ROADMAP | none (not clickable) | No code, no API |
| GOV | Evidence Ledger | BUILT | `drawer: evidence` (Row ignores this, so it isn't clickable from the map) | `components/organisms/EvidenceDrawer.tsx` (opened from Variance and Impact) |
| GOV | Contextual Trigger (MICRO) | BUILT | `go: variance` | Same as UC1 |

A shared drawer that isn't in the catalogue: **History Drawer** (`components/organisms/HistoryDrawer.tsx`, opened by `RowHistoryButton`). See §5.

---

## 2. UC1: Variance Analysis (Drawer)

UI client: `features/variance/varianceApiClient.ts` (`varianceApi.*`), called from `varianceConsoleStore.ts` and `VarianceWorkspace.tsx`.
Service: `variance/controller/LexieVarianceController.java` forwards each call 1:1 to lexie-ai at the same path.

| # | Step / UI action | UI method (file) | intelligence-service API | lexie-ai route (file) | Description |
|---|---|---|---|---|---|
| 1 | Workspace load: period list | `getAvailableCycles` (`varianceConsoleStore.loadPeriods`) | `GET /api/v1/variance/cycles/available` | `GET /api/v1/variance/cycles/available` (`variance_routers.py`) | Filed executions/periods and any existing cycles |
| 2 | Workspace load: entity filter | `getEntities` (`loadPeriods`) | `GET /api/v1/variance/entities` | `GET /api/v1/variance/entities` (`variance_routers.py`) | Legal entities; whether the data is entity-scoped |
| 3 | "Load" grid | `openCycle` (`loadGrid`) | `POST /api/v1/variance/cycles` | `POST /api/v1/variance/cycles` (`variance_routers.py`) | Opens (or reuses) a variance cycle for a report, period and entity |
| 4 | "Load" grid | `runDetection` (`loadGrid`) | `POST /api/v1/variance/cycles/{cycleId}/detect?include_items=true` | `POST /api/v1/variance/cycles/{cycle_id}/detect` (`variance_routers.py`) | Threshold detection; returns the flagged line items |
| 5 | "Load" grid | `getLineMetadata` (`loadGrid`) | `GET /api/v1/variance/lines/metadata?report=` | **`GET /api/v1/demo/lines`** (path is rewritten by the service) | MDRM line descriptions, schedules, taxonomy labels |
| 6 | Row "Explain": reuse | `getLineAnalysis` (`explain`) | `GET /api/v1/variance/cycles/{cycleId}/lines/{mdrmId}/analysis` | same (`variance_review_routers.py`) | Returns the line's existing analysis; a 404 means none yet |
| 7 | Row "Explain": generate | `analyzeLine` (`explain`) | `POST /api/v1/variance/cycles/{cycleId}/analyze/{mdrmId}?force=true` | same (`variance_routers.py`) | Runs the LLM explanation for one line |
| 8 | Drawer opens | `getAnalysis` (`showRecord`) | `GET /api/v1/variance/analyses/{analysisId}` | same (`variance_review_routers.py`) | Full analysis record: drivers, narrative, evidence |
| 9 | Drawer opens | `getAnalysisVersions` (`showRecord`) | `GET /api/v1/variance/analyses/{analysisId}/versions` | same (`variance_review_routers.py`) | Version list; the user can click any version |
| 10 | Drawer opens | `getLineHistory` (`showRecord`) | `GET /api/v1/variance/lines/{mdrmId}/history?report=&through_period=&limit=8` | same (`variance_routers.py`) | Filed history for the trend sparkline |
| 11 | Drawer: click a version | `getAnalysis` + 9 + 10 (`openVersion`) | same as 8–10 | same | Shows that version of the analysis |
| 12 | Drawer "Steer / Regenerate" | `regenerateLine` (`regenerate`) | `POST /api/v1/variance/cycles/{cycleId}/regenerate/{mdrmId}?guidance=` | same (`variance_routers.py`) | Re-runs the explanation with the user's guidance |
| 13 | Drawer Accept / Edit / Reject / Second-approve (pre-check) | `getReviewState` (`review`) | `GET /api/v1/variance/analyses/{analysisId}/review` | same (`variance_review_routers.py`) | Available actions; auto-CLAIM if needed |
| 14 | Same buttons | `reviewAnalysis` (`review`) | `POST /api/v1/variance/analyses/{analysisId}/review` | same (`variance_review_routers.py`) | `CLAIM`, `ACCEPT`, `EDIT`, `REJECT` (reason + comment), `SECOND_APPROVE`; followed by a re-read (8–10) |
| 15 | "Explain all" | `analyzeCycle` (`VarianceWorkspace.tsx:78`) | `POST /api/v1/variance/cycles/{cycleId}/analyze` | same (`variance_routers.py`) | Batch-explains every flagged line in the cycle |

All 15 rows above are **ACTIVE**.

### Unused / deprecated Variance APIs

> **Status: UNUSED · DEPRECATED.** Nothing in the UI calls these. They are flagged in this doc only; the code has no deprecation annotations. Each still exists in `varianceApiClient.ts`, and `LexieVarianceController` still forwards it to lexie-ai at the same path.

| # | UI method (`varianceApiClient.ts`) | intelligence-service API | Status |
|---|---|---|---|
| D1 | `getCycle` | `GET /api/v1/variance/cycles/{cycleId}` | UNUSED · DEPRECATED |
| D2 | `getValues` | `GET /api/v1/variance/values?…` | UNUSED · DEPRECATED |
| D3 | `getApproved` | `GET /api/v1/variance/cycles/{cycleId}/approved` | UNUSED · DEPRECATED |
| D4 | `getReviewQueue` | `GET /api/v1/variance/review/queue` | UNUSED · DEPRECATED |
| D5 | `getReviewMetrics` | `GET /api/v1/variance/review/metrics` | UNUSED · DEPRECATED |
| D6 | `getStatus` | `GET /api/v1/variance/status` | UNUSED · DEPRECATED |
| D7 | `exportAnalysis` | `GET /api/v1/variance/audit/analyses/{analysisId}/export` | UNUSED · DEPRECATED |
| D8 | `getAnalysisManifest` | `GET /api/v1/variance/audit/analyses/{analysisId}/manifest` | UNUSED · DEPRECATED |
| D9 | `exportCycle` | `GET /api/v1/variance/audit/cycles/{cycleId}/export` | UNUSED · DEPRECATED |
| D10 | `notarizeCycle` | `POST /api/v1/variance/audit/cycles/{cycleId}/notarize` | UNUSED · DEPRECATED |
| D11 | `verifyCycle` | `GET /api/v1/variance/audit/cycles/{cycleId}/verify` | UNUSED · DEPRECATED |
| D12 | `getThresholds` | `GET /api/v1/variance/thresholds` | UNUSED · DEPRECATED |
| D13 | `getModelConfig` | `GET /api/v1/variance/model-config` | UNUSED · DEPRECATED |
| D14 | `getCompleteness` | `GET /api/v1/variance/cycles/{cycleId}/completeness` | UNUSED · DEPRECATED |
| D15 | `closeCycle` | `POST /api/v1/variance/cycles/{cycleId}/close` | UNUSED · DEPRECATED |
| D16 | `reopenCycle` | `POST /api/v1/variance/cycles/{cycleId}/reopen` | UNUSED · DEPRECATED |

### Unused / deprecated legacy Variance code

| # | Item | API | Why it's unused | Status |
|---|---|---|---|---|
| D17 | `api.ts` → `executeVarianceRun` | `POST /api/v1/variance/run` (`VarianceRunController`) | Only `varianceStore.ts` (`useVarianceStore`) calls it, and no component imports that store | UNUSED · DEPRECATED |
| D18 | `api.ts` → `executeRerun` | `POST {BASE}/run/{parentRunId}/rerun` | Same as D17 | UNUSED · DEPRECATED |
| D19 | `VarianceDrillWorkspace` / `VarianceResult` (component) | none directly; hosts an `EvidenceDrawer` | Not mounted anywhere outside tests | UNUSED · DEPRECATED |

---

## 3. UC2: Impact Analysis (Drawer + Inline)

UI client: `features/impact/impactApi.ts`.
Service: `impact/controller/ImpactRunController.java` → `ImpactRunCoordinatorImpl` → `LexieAiClient`.

| # | Step / UI action | UI function (file) | intelligence-service API | lexie-ai route (file) | Description |
|---|---|---|---|---|---|
| 1 | Subject grid load, search, filter, paging | `listSubjects` (`ImpactSubjectGrid.tsx`) | `GET /api/v1/impact/subjects?limit=&offset=&q=&kind=&report=` | `GET /impact/subjects` (`impact_routers.py`) | Nodes from the dependency graph that an adjustment can be assessed on |
| 2 | "Assess" (drawer) | `runImpact(adj, "DRAWER", surface)` (`ImpactWorkspace.tsx`) | `POST /api/v1/impact/run?surface=` | `POST /run` (`run_routers.py`, UC2 dispatch) | Affected lines, edit-checks and Δ; the service persists the run, the review and the estate-ledger entry. Body: `adjustmentNodeId, adjustmentReport, deltaAmount, initialValues, scope, entryPoint` |
| 3 | Ask Lexie "impact" (inline) | `runImpact(adj, "INLINE", …)` (`ImpactAnswer.tsx`, via `shell/lexie/dispatcher.tsx`) | `POST /api/v1/impact/run?surface=` | `POST /run` | Same render model as the drawer, shown inline in the Lexie answer |
| 4 | "Open Evidence Ledger" | `EvidenceDrawer` | `GET /api/v1/runs/{runId}` | n/a (served by intelligence-service) | See §4 |

---

## 4. GOV: Evidence Ledger (Drawer)

| UI action | Component | intelligence-service API | Backend | Description |
|---|---|---|---|---|
| Open the ledger for a run (from Impact, or legacy `VarianceResult`) | `components/organisms/EvidenceDrawer.tsx` | `GET /api/v1/runs/{runId}` | `run/controller/RunDetailController.java` (tenant-scoped DB read; no lexie-ai call) | Persisted `agent_run_step` rows (step, tool, output summary, masking/classification) and the evidence hash-chain verdict (CHAIN VALID / BROKEN / NO EVIDENCE) |

---

## 5. Shared: History Drawer (not in the catalogue)

| UI action | Component | intelligence-service API | Backend | Used in |
|---|---|---|---|---|
| Row "history" button | `HistoryDrawer.tsx` via `RowHistoryButton.tsx` | `GET /api/v1/governance/estate-ledger/subject/{subjectId}` | `governance/controller/EstateLedgerController.java` | Model Registry, Training Data, Policies, Audit & Evidence, Drop Profiles, Skill Registry, Review Queue |

---

## 6. UC5a/b: Lineage Walk (Drawer, ROADMAP)

No UI, client, or endpoint exists. The row has no `go` or `ask`, so it isn't clickable.

## 7. Observations

1. **Evidence Ledger row isn't clickable.** `SurfaceMap.Row` only handles `go` and `ask`. The catalogue sets `drawer: "evidence"`, which nothing reads.
2. **`lines/metadata` path is rewritten.** The service maps it to lexie-ai `/api/v1/demo/lines`, which is a demo router, in what is otherwise a 1:1 proxy.
3. **Two `/cycles` meanings in lexie-ai.** `POST /cycles` is in `variance_routers.py` (open cycle). `GET /cycles` is in `variance_config_routers.py` (list). The UI uses only the POST.
4. **The legacy `/variance/run` path is unused and deprecated** (D17–D19 in §2). Memory notes that the Variance tab uses the cycle/analysis APIs instead.
5. **16 variance client methods and their proxy endpoints have no UI caller and are deprecated** (D1–D16 in §2).
