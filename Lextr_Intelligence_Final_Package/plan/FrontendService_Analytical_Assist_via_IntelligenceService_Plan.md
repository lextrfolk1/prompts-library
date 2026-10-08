# frontend-service "Lexie Analytics Assist" → intelligence-ui Analytical Assist screen (UC10): Integration Plan

**Status:** PHASE 1 IMPLEMENTED (2026-10-06) on frontend-service branch `feature/analytical-assist-intelligence` (commits `f7d8259` + `afcea11`); manual §9 checks pending. Analysis 2026-10-06 replaces the 2026-10-04 draft. Implementation record: §13
**Approach:** **Option A.** Replace the entire Lexie Analytics Assist screen with intelligence-ui's Analytical Assist screen: the same sections, components, behaviour and wording, rebuilt in frontend-service styling (MUI and the frontend-service theme).
**Repo to change:** `lextr/typescript/frontend-service` only. No backend changes.
**Where:** Analytics tab → left menu **Lexie Analytics Assist** (`lexie-assist-id`), which today renders the static `LexiAssist` page.
**Reference implementation (read-only):** `lextrai/intelligence-ui/src/features/analytical/`: `components/AnalyticalWorkspace.tsx`, `AnalyticalFindBuild.tsx`, `AnalyticalRefineBuild.tsx`, `AnalyticalAskBar.tsx`, `AnalyticalMatch.tsx`, `CatalogNotReadyCard.tsx`, `AnalyticalPlan.tsx`, `OperationBatchReview.tsx`, `AnalyticalCoreBuilder.tsx`, `analyticalApi.ts`, `analyticalData.ts`, `types.ts`, `locales/analyticalLocale.ts`; strings in `intelligence-ui/src/i18n/messages.en.ts` (`analytical.uc10.*`, `analytical.CatalogNotReadyCard.*`, `analytical.OperationBatchReview.*`)
**Sibling plan:** `FrontendService_Variance_via_IntelligenceService_Plan.md` (shared prefix, identity headers, gateway route; §3 V1–V6)

---

## 1. Goal and routing

The Lexie Analytics Assist tab must show **the same screen as intelligence-ui's Analytical Assist**: the same sections in the same order, the same states and the same calls. The current static page and its right-hand column are removed. Only the visual styling comes from frontend-service (§7).

```
TODAY    LexiAssist (static) ── no API: setTimeout mocks; "exposure" in the text → best matches, else guided build; fake jobs

TARGET   AnalyticalAssistWorkspace ──POST /lexie/intelligence/api/v1/analytical/run──────────▶ gateway ──▶ intelligence-service ──▶ lexie-ai POST /run (UC10)
          (port of intelligence-ui    (──POST …/analytical/batch/apply?surface=CORE: Phase 2)       AnalyticalRunCoordinator: OPA gate, persists the run, queues it for review
           AnalyticalWorkspace)       + X-Client-Id, X-User-Id
```

The UC10 contract (`mountContract.ts`) says Core owns the Analytical Reporting screen and embeds the assist (`EMBEDDED`, anchor `an-lexie`). The assist finds reports, proposes how to build a new one, and proposes refinements to an existing one. **It never returns data values or runs a report.**

## 2. Current frontend-service page (all removed)

| Piece | File | Today | Plan |
|---|---|---|---|
| Menu entry, added on the client after "Ad-hoc reporting" | `features/analytics/layout.tsx:77-90` (inject), `:273-274` (render) | mounts `LexiAssist` | **Keep** the entry; render the new workspace |
| Page shell | `components/LexiAssist.tsx` | Two columns; mock timers, keyword logic, fake jobs | Replace with the ported workspace |
| Header, chips, search | `components/LexiSearch.tsx` | Static chips, fake "Intent confidence" | Delete (replaced by the header and ask bar) |
| Results | `components/LexiResults.tsx` | Hardcoded report cards, fake Run/Refine, quick filters | Delete (replaced by Find & build) |
| Lexie Signals card | `components/LexiSignals.tsx` | Hardcoded `T-1`, `Available`, `98%`, `Low` | Delete (intelligence-ui shows Signals inside Refine & build, collapsed and unsourced) |
| Execution Monitor | `components/LexiExecutionMonitor.tsx` | Fake jobs | Delete (replaced by "What was recorded" in Refine & build) |
| Types | `types/types.ts` | `ResultType`, `Job` | Delete once unused |

## 3. Backend contract (verified in code)

| # | Fact | Evidence |
|---|---|---|
| B1 | Gateway routes `/lexie/intelligence/**` to intelligence-service and strips the prefix | `gateway-service.yml:155-160` (Variance plan §2) |
| B2 | `POST /api/v1/analytical/run`, body `{query, target_report_id?, against_version?}` (both anchor fields or neither) | `AnalyticalRunController.java:33`; `dto/AnalyticalRunRequest.java` |
| B3 | `X-Client-Id` and `X-User-Id` are **required** (400 when missing or blank). `X-User-Functions` and `X-User-Entitlements` are optional and not used by the `run` policy | `AnalyticalRunController.java:35-38,58-61`; `tool_scope_analytical.rego:93-96` |
| B4 | Success: `200 {success:true, data:AnalyticalRunResponse}`, snake_case: `run_id, agent_run_id, client_id, status, query, catalog_state, matches[], construction_proposal, route_out_uc, narrative, success, parse, operation_batch, batch_rejections, batch_refusal` | `dto/AnalyticalRunResponse.java`; global SNAKE_CASE (`intelligence-ui/src/shell/wireCase.ts`) |
| B5 | `matches[]` item: `report_id, name, description, kind, score (0..1), strength, elements[], tags[], matched_elements[{mdrm,name}], element_total, covers[], gaps[], unverified[]`. `construction_proposal`: `proposed_name, kind, suggested_elements[], missing_elements[], rationale, is_promoted`. `operation_batch`: `batch_id, target_report_id, against_version, requester_id, origin, operations[{op_name, target_field, value, aggregation_fn, is_grounded, grounding_notes}]`. `batch_rejections[]`: `{target, reason}`. **`parse`, `operation_batch` and `batch_rejections` are maps passed through from lexie unchanged** (Jackson doesn't rename map keys). They are snake_case because lexie emits them that way, so no case conversion is needed | `dto/CatalogMatchDto.java`; `AnalyticalRunCoordinatorImpl.java:105-108`; lexie `skills/analytical/handoff.py:105-112`, `refine_batch.py:39-50`, `analytical_assist_skill.py:317-318` |
| B6 | **"Catalog not ready" is not an error:** 200 with `catalog_state:"CATALOG_NOT_READY"`, `status:"NOT_RUN"`, and the reason in `narrative` | `AnalyticalRunCoordinatorImpl.java:85-91,421-425` |
| B7 | Errors: `{success:false, message, data:{code, params, policy_code, …}}`. Statuses: 400 (header or blank query), 422 (policy denial `POLICY_OP_DENIED`, or lexie refused), 409 (not persisted), lexie's status when lexie-ai is down | `GlobalExceptionHandler.java:29-40,113-142,200-205` |
| B8 | intelligence-service waits up to **60 s** for lexie `/run`. The gateway sets no response timeout on `/lexie/intelligence/**`, either per route or globally | `LexieAiClient.java:42`; `gateway-service.yml:155-160,221-223` |
| B9 | **Every `run` is persisted as an agent run and queued for review** (unless the catalog isn't ready) and uses the LLM. The UI submits only on Enter, exactly as intelligence-ui's `AnalyticalAskBar` does | `AnalyticalRunCoordinatorImpl.java:113-130`; `AnalyticalAskBar.tsx:32-33` |
| B10 | OPA readiness now: `catalog_ready=true`, `handoff_ready=true`, `report_store_ready=false`, `kg_ready`, `derive_ready`, `parameter_default_ready` true | `opa/data/lextr/ai/analytical/data.json` |
| B11 | `POST /api/v1/analytical/batch/apply?surface=CORE` (any other surface is refused, `SURFACE_NOT_CORE`). Body: `{batch_id, target_report_id, against_version, current_core_version, operations:[{op_name, target_field, value, is_grounded, status, is_correction}], origin:"ASSIST", is_instance_ask:false}`. Response: `{run_id, batch_id, target_report_id, applied_count, rejected_count, omitted_count, corrections_count, stale, resulting_core_version, status, message}` | `AnalyticalRunController.java:46-60`; `AnalyticalRunCoordinatorImpl.java:180-190`; `dto/BatchApplyResponse.java` |
| B12 | **Apply only records the analyst's decisions.** It returns `resulting_core_version = current_core_version + 1` when anything was applied, but changes no report. Core's builder has to perform the change | `AnalyticalRunCoordinatorImpl.java:282-310` |

## 4. Gaps found in frontend-service

| # | Gap | Evidence | Consequence |
|---|---|---|---|
| G1 | **No Core report builder id or version** on the Analytics screen (Ad-hoc reporting uses a dataset and query config; `saveAdhocReport` is commented out) | `features/analytics/interfaces/index.ts:21-31`; `services/analytics.api.ts:214` | Behave exactly as intelligence-ui does without a Core builder: refine anchors to `match.report_id` at `against_version = 1` (`AN_PREVIEW_VERSION`) and the batch is a **preview**; **Apply is disabled** with a reason. Phase 2 (§11) |
| G2 | The intelligence axios instance is private to `intelligenceVarianceApi.ts` | `shared-ui/services/intelligenceVarianceApi.ts:7-16` | Move it to a shared module first (S1) |
| G3 | The workspace uses `useIdentity().surface` to decide whether Apply is possible | `AnalyticalWorkspace.tsx:25,105` | frontend-service is Core: pass `surface="CORE"` as a constant. Apply stays disabled anyway (G1) |

## 5. API mapping

Base: `SERVICE_PREFIX.INTELLIGENCE` (`/lexie/intelligence/`). Identity comes from `getIntelligenceIdentityHeaders()` (already in frontend-service).

| # | Trigger (as in intelligence-ui) | Method + path | Body (snake_case, built explicitly) | intelligence-ui |
|---|---|---|---|---|
| A1 | Enter in the Find & build ask bar | `POST api/v1/analytical/run` | `{query}` | `AnalyticalFindBuild.submit` → `runAnalytical(q)` |
| A2 | Arriving on Refine & build from **Refine** on a match (the seed ask runs once), and Enter in the "describe the change" ask bar | `POST api/v1/analytical/run` | `{query, target_report_id: match.report_id, against_version: 1}`. **No anchor** when coming from "Build it here first" or when the refine mode is `none` | `AnalyticalRefineBuild.submit` → `runAnalytical(q, anchor)` |
| A3 | **Apply Accepted Operations** | `POST api/v1/analytical/batch/apply?surface=CORE` | B11 | `applyAnalyticalBatch`. **Phase 2 only** (G1, B12) |

## 6. Target screen: a one-for-one port of `AnalyticalWorkspace`

Same order and behaviour as intelligence-ui. Each block below is one component to port.

### 6.1 Workspace (`AnalyticalWorkspace.tsx`)

| Block | Content and behaviour |
|---|---|
| Screen head | Title "Lexie Analytical Assist", with the **How this works** button on the right. Both titles stay, as in intelligence-ui: this one and "Lexie Analytics Assist" in the Find & build header (§6.2) |
| **How this works** (from intelligence-ui's shell, `shell/walkthrough/HowThisWorks.tsx` + `flows.ts:71-76`, `destinationId="analytical"`) | A "How this works" button (help icon) opens a right-side panel (MUI `Drawer anchor="right"`, width 520, max 94vw) titled "Analytical Assist — from an ask to operations Core applies" and a Close button. Inside is a table with the columns Step / Who / Where / Gate and the 5 steps `how.analytical.1…5` (step, who, where, gate), numbered "1." to "5.". Clicking outside or Close closes it. Copy the text from `messages.en.ts` (`how.button`, `how.close`, `how.col.*`, `how.analytical.*`) |
| Tabs | **Find & build** / **Refine & build (NL ↔ Core)**. State: `tab`, `seedAsk`, `seedFrom`, `seedResult`. Find & build's `onBuild(q, r)` sets the seed with no match and switches to Refine; `onRefine(q, m, r)` sets the seed with the match and switches to Refine. Refine & build is keyed by `seedFrom.id ‖ seedAsk ‖ "blank"`, so it remounts for a new seed |
| Arrival card (hand-off from global Ask-Lexie) | **Not ported**: frontend-service has no hand-off into this tab yet |
| `DomainResolutionPanel` (footer) | **Not ported**: intelligence-ui passes `model={null}`, which renders a hidden element |

### 6.2 Find & build (`AnalyticalFindBuild.tsx`)

| Block | Content and behaviour |
|---|---|
| Header row | "Lexie Analytics Assist" + "intent-driven" pill + "EMBEDDED" pill; on the right, "wording:" with **Plain / Technical** toggle chips (local state only, as in intelligence-ui) |
| Saved prompts row | "Try an ask — saved prompts:" + "not recorded" |
| Ask bar (`AnalyticalAskBar`) | Placeholder "Ask for a report, or for a number — e.g. “exposure by counterparty”". Submits on **Enter or the "Ask" button** (as in intelligence-ui); typing never submits (B9) |
| Loading | "Asking Lexie…" (up to 60 s, B8) |
| Result header | "How sure I am that I understood this: not recorded" + "doesn’t block anything" pill. "Read as: measure **{parse.measure}** · by **{parse.dimensions}**. That’s how well I understood you — not whether a report exists." (a missing field reads "not recorded"; wording from `messages.en.ts`). If `parse.measure_resolved === false` and there is more than one `measure_candidates`, show the amber candidates line |
| `catalog_state === "CATALOG_NOT_READY"` | `CatalogNotReadyCard` with `narrative` shown verbatim; nothing else from the result |
| `route_out_uc` | Green "The answer" card: `narrative`, plus pills "Answered by {route_out_uc}" and "called in the backend" |
| Best matches | Label "Best matches" + the scoring note; one `AnalyticalMatch` card per match (§6.4) |
| No matches | "Nothing matched" card naming the parsed measure and dimensions, or the "could not resolve" line |
| All matches regulatory | "Regulatory reports are not built here" card |
| Guided report construction (`construction_proposal`, or no matches, and not all regulatory) | Dimensions / Measure / Period pills from `parse`; "offered alongside" pill when matches exist; **Build it here first** → `onBuild` |
| Refusal (B7) | `RefusalNotice` line "Refused: {data.code}" + `message` above the content |

### 6.3 Refine & build (`AnalyticalRefineBuild.tsx`)

| Block | Content and behaviour |
|---|---|
| Seed card (when there is a seed ask) | Mode label and reason from `anRefineMode(seedFrom)` (`build`, `scope`, `params`, `none`, `full`), the kind pill, and the ask in quotes. Green, or amber for mode `none` |
| Mode `none` | Red "Builder not offered" card; no ask bar and no batch |
| "Lexie · describe the change" card | "embedded in the builder" pill + "Core state not recorded"; ask bar (refine placeholder) submitting A2; "Asking Lexie…"; `AnalyticalPlan` (Measure, Dimensions, Filter and Period rows from `parse`, or "plan not recorded") |
| Operation batch | `operation_batch` → `anReviewBatch` → `OperationBatchReview` (§6.5) with `applyBlockedReason` set (G1) and the preview note "Preview: proposed against this report without a Core builder version…". Without a batch: `batch_refusal` ("No operation batch: {reason}") or "No operation batch was returned…". Then each `batch_rejections` entry as "{target}: {reason}" |
| Seed run on arrival | If the seed has a match (an anchor) and an ask, run A2 once on mount, guarded by a ref against StrictMode double effects |
| Core builder card (`AnalyticalCoreBuilder`, `core=null`) | "Dataset: not recorded" + "Core owns the builder…; none is recorded here" + the generate notice. Port only the `core=null` state |
| "What was recorded" card | Audit explanation; one row per apply receipt (batch, status, version, applied/rejected/omitted); "nothing applied yet" in Phase 1 |
| "Lexie signals" card | Collapsible, collapsed by default; "2 unsourced" amber pill; when open, the diagnostics text. **No values** |

### 6.4 Match card (`AnalyticalMatch.tsx` + `anMatchItem`)

Name, "last run · owner · visibility: not recorded", description, kind pill (`AN_KINDTONE`), score pill and score bar (`score × 100`; green ≥ 70, amber ≥ 40, grey otherwise), "covers" chips and "gap" chips, "unverified" chips + note, "Matched lines: name (mdrm) · …" + "+N more" from `element_total`, and a **Refine** button whose label follows the kind ("⚙ Refine" / "⚙ Refine scope" / "⚙ Refine parameters" / "⚙ Refine unavailable", disabled). An `operational` match shows an inert "Answered by UC12" button instead of Refine. **No Run button** (intelligence-ui shows a Core-only Run; UC10 never runs a report here). Fields the catalog does not return (`assets`, `panels`, `params`, `consolidation`, `entitled`, `why`) are not ported.

### 6.5 Operation batch review (`OperationBatchReview.tsx`)

Rendered only when `can_refine` and there are operations. Shows a "Proposed Operations Preview" header with `v{against_version}` / `v{current_core_version}`, the preview note, a stale warning when `is_stale` or `against_version < current_core_version`, and one row per operation: op name, target, value, rationale (`grounding_notes`), and "ungrounded" / "correction" pills. Per-row **Accepted / Rejected / Omitted** buttons; Accept is disabled for ungrounded operations, which start as Omitted. **Apply Accepted Operations** is disabled with `applyBlockedReason` = "Applying needs a saved report in the Core builder (report id and version)."

### 6.6 Not ported (not rendered by intelligence-ui's workspace today)

`AnalyticalPeriodPrompt`, `PeriodPrompt`, `StoreEntryPanel` (`report_store_ready=false`), `DerivedAttributeViewer`, `AnalyticalRefineSlice`, `DomainResolutionPanel`.

## 7. Styling: follow frontend-service, not intelligence-ui

intelligence-ui is the reference for **structure, behaviour and wording only**.

- Build with MUI and the existing `@/shared-ui/components/ui-components` (`Button`, `Chip`, `Input`, `Select`, `Typography`, `Box`, `Accordion`, …), in the look of existing frontend-service panels (for example the Variance drawer `AiExplainationDetails.tsx`: `Paper variant="outlined"` cards, MUI typography variants and spacing).
- Concrete conventions taken from `AiExplainationDetails.tsx` (as implemented):
  - Card: `Paper variant="outlined"`, `p: 2.5`, `borderRadius: 1`, `borderColor: divider` (tone: `alpha(palette.<tone>.main, 0.3)`), `bgcolor: background.paper` (tone: `alpha(…, 0.06)`), `boxShadow: theme.shadows[1]`.
  - Pill: shared `Chip size="sm"` with `sx` = `{bgcolor: alpha(main, 0.1), color: palette.<tone>.dark (light in dark mode), border: 1px solid alpha(main, 0.3)}` (the `chipStyles` pattern). The shared `Chip` spreads `sx` as a plain object, so build it with `useTheme()`, not an `sx` callback.
  - Section label: MUI `Typography variant="overline"`, `color: text.secondary`, `letterSpacing: 1`, `fontWeight: 700` (the `SectionLabel` pattern).
  - Buttons: shared `Button size="sm"` (`contained` for primary actions, `outlined` for secondary, `text` for Close).
  - Ask input: shared `Input size="sm"` with `startIcon` (search icon); Enter handled via `onKeyDown`.
  - Lexie signals: shared `Accordion variant="dashboard"` with a node `title` (label + pill), collapsed by default.
  - Body text: MUI `Typography` (`body2` / `caption` / `subtitle2`) with theme colours, as `features/analytics` components do. The shared `Typography` is not used because its `color` prop only takes palette keys (no `text.secondary`).
  - Kept MUI where no shared component exists: `Tabs`/`Tab`, `Drawer`, `Table`, `LinearProgress`, `Alert` (stale warning), `ToggleButtonGroup` (Accepted / Rejected / Omitted).
- Take colours from the MUI theme (`theme.palette.*`, `alpha()`). Map intelligence-ui's tones as: green → `success`, amber → `warning`, red → `error`, blue/teal → `info`/`primary`, gray → `text.secondary` / `divider`, purple → `secondary`. This keeps every app theme and dark mode working. Don't add new hex colours.
- Map intelligence-ui atoms to MUI: `Card` → `Paper variant="outlined"`; `Pill` → shared `Chip size="sm"` with a tone colour; `Btn` → `Button`; tab buttons → MUI `Tabs`/`Tab`; score bar → `LinearProgress` with a tone colour.
- Don't copy intelligence-ui's inline `style={{…}}` objects, `VarianceAtoms`, `baseTokens` or Tailwind classes.
- Write the English strings inline (as other frontend-service analytics components do), copying the wording from `messages.en.ts` and `locales/analyticalLocale.ts`. Don't add an i18n layer.

## 8. Change list

All new feature files go under `features/analytics/assist/`.

| # | File | Change |
|---|---|---|
| S1 | `shared-ui/services/intelligenceHttp.ts` (new) | Move `intelligenceHttp` (`getHttpWithPrefix(SERVICE_PREFIX.INTELLIGENCE)` + the identity interceptor) out of `intelligenceVarianceApi.ts` and export it. `intelligenceVarianceApi.ts` imports it; no behaviour change |
| S2 | `shared-ui/constants/apiEndpoints.ts` | Add `INTELLIGENCE_ANALYTICAL: { RUN: "api/v1/analytical/run", BATCH_APPLY: "api/v1/analytical/batch/apply" }` |
| S3 | `assist/types.ts` | Port `types.ts`, using **snake_case** wire fields (B4, B5, B11) so no case conversion is needed. Keep the review-side `OperationBatch` / `ProposedOperation` |
| S4 | `assist/analyticalAssist.api.ts` | `runAnalytical(query, anchor?)` → A1/A2, returning `response.data.data`. `applyBatch(batch)` → A3 with `surface=CORE`, body built key by key, `value` sent as is. `refusalOf(error)` → `{code: data.code ?? "HTTP_<status>", message}` |
| S5 | `assist/analyticalData.ts` | Port `anMatchItem`, `anRefineMode`, `anReviewBatch`, `AN_KINDTONE` (as theme tone names), `AN_PREVIEW_VERSION = 1`, adjusted for snake_case input |
| S6 | `assist/useRefusal.ts` + `assist/components/RefusalNotice.tsx` | Port `useRefusal` + `RefusalNotice` (`shell/RefusalNotice.tsx`), using the code from `refusalOf`. Hook and component are in separate files (one file fails `react-refresh/only-export-components`) |
| S7a | `assist/components/AssistAtoms.tsx` | `ToneCard`, `TonePill`, `FieldLabel`, `NotRecorded` / `NOT_RECORDED`: the §7 card / pill / label conventions in one place |
| S7 | `assist/components/AnalyticalAskBar.tsx`, `AnalyticalMatch.tsx`, `CatalogNotReadyCard.tsx`, `AnalyticalPlan.tsx`, `OperationBatchReview.tsx`, `CoreBuilderNotRecorded.tsx`, `HowThisWorks.tsx` | One-for-one ports (§6.1–6.5), styled per §7. `HowThisWorks` holds only the analytical flow (no `HOW_FLOWS` registry) |
| S8 | `assist/components/AnalyticalFindBuild.tsx`, `AnalyticalRefineBuild.tsx` | Ports of §6.2 and §6.3 (same state, effects and StrictMode guards); `surface="CORE"` (G3) |
| S9 | `assist/AnalyticalAssistWorkspace.tsx` | Port of §6.1 |
| S10 | `features/analytics/layout.tsx` | At `:273-274`, render `AnalyticalAssistWorkspace` instead of `LexiAssist`; keep the menu injection unchanged. Wrap it in a scrollable `Box` with `p: 3` |
| S11 | Delete `components/LexiAssist.tsx`, `LexiSearch.tsx`, `LexiResults.tsx`, `LexiSignals.tsx`, `LexiExecutionMonitor.tsx`, `types/types.ts` | Only once `grep` shows no other importers |

## 9. Validation

- `tsc --noEmit` on the touched files (the full `tsconfig.app.json` runs out of memory; see Variance §11) and lint on touched files.
  - Even a single file importing `@/shared-ui/constants` or `services/http.ts` runs out of memory: `constants/index.ts` pulls the whole `ui-components` barrel and `http.ts` pulls `@/store` (every slice). Use a temporary tsconfig that extends `tsconfig.app.json`, includes only `src/features/analytics/assist`, and maps `@/store` to a small stub via `paths`; delete it afterwards. Expect only the stub-related errors and the existing `constants/index.ts(363)` error.
  - Pre-existing lint errors on untouched lines (not part of this change): `layout.tsx` `no-explicit-any` ×2, `intelligenceVarianceApi.ts` `no-explicit-any` ×1.
- `grep -rn "LexiAssist\|LexiResults\|LexiSignals\|LexiExecutionMonitor\|LexiSearch" src` → no matches.
- `grep -rn "baseTokens\|VarianceAtoms\|#[0-9a-fA-F]\{6\}" src/features/analytics/assist` → no matches.
- Manual check (devtools), compared side by side with intelligence-ui's Analytical Assist on the same ask:
  - Typing sends nothing. Enter sends one `POST /lexie/intelligence/api/v1/analytical/run` with `X-Client-Id` and `X-User-Id`, body `{"query": …}`.
  - The same sections appear in the same order with the same states (matches, nothing matched, guided build, route-out, not ready).
  - "How this works" opens the right-side panel with the 5 steps (Step / Who / Where / Gate) and closes on Close or an outside click.
  - **Refine** on a match switches to Refine & build and sends one anchored run (`target_report_id`, `against_version: 1`). The batch renders with Accept/Reject/Omit and Apply disabled with its reason.
  - **Build it here first** switches to Refine & build with no anchor.
  - With `catalog_ready=false` in OPA `analytical/data.json`, only the not-ready card shows, with the narrative verbatim.
  - With lexie-ai stopped, the refusal line shows the code.
  - Works in every app theme and in dark mode.
  - Dashboard, Canned Reports and Ad-hoc reporting are unchanged.

## 10. Risks

| Risk | Mitigation |
|---|---|
| A run on every keystroke would fill the run ledger and review queue and spend LLM calls (B9) | Submit on Enter only, as in intelligence-ui |
| A camelCase key is silently dropped (for example `targetReportId` turns an anchored ask into a plain one) | snake_case types and bodies built key by key; no converter |
| Apply would record a version change Core never made (B12) | Apply stays disabled until Phase 2 |
| A run takes up to 60 s | "Asking Lexie…" state; no axios timeout below 60 s (the instance timeout is `0`) |
| StrictMode runs the seed ask twice, persisting two runs | Port intelligence-ui's `useRef` guards exactly |
| Screen drifts from intelligence-ui over time | List the ported source files in a header comment of each port; review against intelligence-ui when UC10 changes |
| Shared identity (option B: `X-Client-Id = 1`) | Same as the Variance plan §5 / §9 |

## 11. Phase 2 (after Ad-hoc reporting persists reports with an id and builder version)

- Anchor A2 to Core's saved report id and **current builder version** instead of `1`, and pass Core's builder state to the Core builder card.
- Enable Apply (A3). After a successful, non-stale apply, Core's builder applies the accepted operations and sets its version to `resulting_core_version`. If `stale` is returned, keep the batch visible as stale and ask again.
- Add apply receipts to "What was recorded".
- Optionally add the hand-off arrival card if global Ask-Lexie routes UC10 asks into this tab.

---

## 12. Implementation prompt (Phase 1)

```text
TASK: Replace the ENTIRE "Lexie Analytics Assist" screen in frontend-service's Analytics tab with a
one-for-one port of intelligence-ui's Analytical Assist screen (UC10 AnalyticalWorkspace): same
sections, order, states, behaviour and wording, calling intelligence-ui's APIs through
intelligence-service. Styling follows frontend-service (MUI + theme), NOT intelligence-ui.

REPO: lextr/typescript/frontend-service (change only this repo)
SPEC: utils/prompts-library/Lextr_Intelligence_Final_Package/plan/FrontendService_Analytical_Assist_via_IntelligenceService_Plan.md
      (§3 contract, §4 gaps, §6 screen, §7 styling, §8 change list; follow it exactly)
REFERENCE (read-only): lextrai/intelligence-ui/src/features/analytical/
   components/AnalyticalWorkspace.tsx, AnalyticalFindBuild.tsx, AnalyticalRefineBuild.tsx,
   AnalyticalAskBar.tsx, AnalyticalMatch.tsx, CatalogNotReadyCard.tsx, AnalyticalPlan.tsx,
   OperationBatchReview.tsx, AnalyticalCoreBuilder.tsx, analyticalApi.ts, analyticalData.ts, types.ts,
   locales/analyticalLocale.ts; lextrai/intelligence-ui/src/shell/RefusalNotice.tsx;
   lextrai/intelligence-ui/src/shell/walkthrough/HowThisWorks.tsx + flows.ts ("analytical" flow);
   strings: lextrai/intelligence-ui/src/i18n/messages.en.ts (analytical.uc10.*,
   analytical.CatalogNotReadyCard.*, analytical.OperationBatchReview.*, how.button, how.close,
   how.col.*, how.analytical.*)

ROUTING / WIRE
- Reuse SERVICE_PREFIX.INTELLIGENCE and getIntelligenceIdentityHeaders() (both exist).
- S1: move the intelligenceHttp instance and its identity interceptor out of
  shared-ui/services/intelligenceVarianceApi.ts into an exported shared-ui/services/intelligenceHttp.ts;
  intelligenceVarianceApi imports it (no behaviour change).
- POST api/v1/analytical/run body {query} or {query, target_report_id, against_version}.
  Responses are {success, data} with snake_case data; read response.data.data. Errors are
  {success:false, message, data:{code,...}}; show "Refused: <code>" plus message.
- CATALOG_NOT_READY is a 200 with catalog_state; show narrative verbatim, nothing else.
- snake_case types and bodies only (the service silently drops unknown/camelCase keys).

STEPS: S1-S11 of §8, in features/analytics/assist/.
- Port each component one for one (same state, effects, useRef StrictMode guards, conditions and
  order). Submit runs ONLY on Enter or the Ask button, never on typing (each run is persisted, queued for review and calls the LLM).
- surface is the constant "CORE". Refine anchors to match.report_id with against_version = 1
  (preview). "Build it here first" opens Refine & build with no anchor.
- OperationBatchReview: Accept disabled for ungrounded ops (they start Omitted); Apply DISABLED
  with "Applying needs a saved report in the Core builder (report id and version)." Implement
  applyBatch in the service, but don't call it from the UI.
- Port AnalyticalCoreBuilder's core=null state only. Lexie signals: collapsed, "2 unsourced", no values.
- Port "How this works" (analytical flow only): a button in the screen head opens a right-side MUI
  Drawer with the title, Close, and a Step / Who / Where / Gate table of the 5 how.analytical steps.
  Keep both titles ("Lexie Analytical Assist" screen head, "Lexie Analytics Assist" Find & build header).
- Do NOT port the arrival card, DomainResolutionPanel, PeriodPrompt, AnalyticalPeriodPrompt,
  StoreEntryPanel, DerivedAttributeViewer or AnalyticalRefineSlice.
- layout.tsx: render AnalyticalAssistWorkspace for "lexie-assist-id"; keep the menu injection.
- Delete LexiAssist, LexiSearch, LexiResults, LexiSignals, LexiExecutionMonitor and
  types/types.ts once nothing imports them.

STYLING (§7): MUI + @/shared-ui/components/ui-components in the look of existing frontend-service
panels (e.g. AiExplainationDetails). Colours from theme.palette / alpha() (green->success,
amber->warning, red->error, blue/teal->info/primary, gray->text.secondary/divider,
purple->secondary). Card->Paper variant="outlined", Pill->shared Chip size="sm", Btn->shared Button size="sm",
tabs->MUI Tabs, score bar->LinearProgress. NO inline style objects copied from intelligence-ui,
NO VarianceAtoms, baseTokens, Tailwind or new hex colours. Inline English strings copied from
messages.en.ts; no i18n layer.

DO NOT
- Change Dashboard, Canned Reports, Ad-hoc reporting, the query builder or ANALYTICS.* APIs.
- Fetch or display report values; add Run/Open buttons on matches.
- Touch intelligence-service, lexie-ai, intelligence-ui, gateway or config-service.
- Add dependencies, refactor unrelated code, commit or push.

VALIDATE
- tsc on touched files and lint on touched files (full tsconfig.app.json runs out of memory).
- grep -rn "LexiAssist\|LexiResults\|LexiSignals\|LexiExecutionMonitor\|LexiSearch" src -> no matches.
- grep -rn "baseTokens\|VarianceAtoms\|#[0-9a-fA-F]\{6\}" src/features/analytics/assist -> no matches.
- Report: files changed, validation run and its result, anything not done.
```

---

## 13. Implementation record (Phase 1)

| Item | Result |
|---|---|
| Branch / commit | frontend-service `feature/analytical-assist-intelligence` from `main` `5da86bc`; `f7d8259` (S1–S11), `afcea11` (styling aligned to §7 conventions) |
| Files | `shared-ui/services/intelligenceHttp.ts` (new); `shared-ui/services/intelligenceVarianceApi.ts`, `shared-ui/constants/apiEndpoints.ts`, `features/analytics/layout.tsx` (modified); `features/analytics/assist/` `AnalyticalAssistWorkspace.tsx`, `analyticalAssist.api.ts`, `analyticalData.ts`, `types.ts`, `useRefusal.ts`, `components/{AnalyticalAskBar, AnalyticalFindBuild, AnalyticalMatch, AnalyticalPlan, AnalyticalRefineBuild, AssistAtoms, CatalogNotReadyCard, CoreBuilderNotRecorded, HowThisWorks, OperationBatchReview, RefusalNotice}.tsx` (new); `LexiAssist`, `LexiSearch`, `LexiResults`, `LexiSignals`, `LexiExecutionMonitor`, `types/types.ts` (deleted) |
| Deviations from §6–§8 | Ask button kept alongside Enter (§6.2); wording from `messages.en.ts` where §6.2 paraphrased it; no Run button and inert "Answered by UC12" for operational matches (§6.4); `AssistAtoms.tsx` added (S7a); hook and `RefusalNotice` split (S6); the seed card's scope/params detail lines are not ported (the run never returns `entitled` / `params`) |
| Validated | §9 greps return nothing; ESLint clean on `assist/`, `intelligenceHttp.ts`, `apiEndpoints.ts`; scoped `tsc` (per §9) shows no errors in new or changed files |
| Not yet validated | Manual §9 checks (devtools, side-by-side with intelligence-ui, not-ready, lexie-ai down, themes / dark mode); `layout.tsx` under `tsc` (its import graph runs out of memory) |


---

## 14. Pending: gaps against the prototype (`files/Lextr_Intelligence_UI_v1.38.0_FINAL.jsx`, UC10 section)

**Status:** PENDING (reviewed 2026-10-06). The Phase 1 port matches the prototype's structure: tabs, Find → Refine hand-off, ask bar, wording toggle, "Read as…" line, match cards (score bar, coverage and gap chips, refine labels), no-match / regulatory / "The answer" / guided construction cards, seed / builder-not-offered / describe-the-change / what-was-recorded / Lexie-signals cards, operation batch with stale warning. The prototype runs on browser-side mock data; the port follows intelligence-ui and shows only what the service returns. The features below are therefore not present yet.

### 14.1 Can be added in frontend-service now (no backend change): DONE (2026-10-07, frontend-service `88b812e`)

Implemented: P1 in `AnalyticalFindBuild.tsx` (`fullCover` = some match with no gaps); P2 as `AN_SAVED_ASKS`, `AN_FREE_ASKS`, `AN_REFINE_TRY` in `analyticalData.ts`, rendered with `components/AskPromptChip.tsx` (fill the ask box only; free-text chips dashed; refine chips show the label and carry the full ask as `title`); P3 in `OperationBatchReview.tsx` (`secondary` tone row + note). Lint clean; scoped `tsc` (§9) clean on `assist/`. Manual check pending.

| # | Prototype feature | Prototype ref | Pending change |
|---|---|---|---|
| P1 | Guided construction offered **alongside partial matches**: shown unless one match covers the ask with no gaps | `…FINAL.jsx:2990-2993` | In `AnalyticalFindBuild.tsx`, show the guided card when `!allRegulatory && (construction_proposal \|\| visible.length === 0 \|\| !visible.some(m => (m.gaps \|\| []).length === 0))`. Departs from intelligence-ui; confirm before doing |
| P2 | Example asks: saved prompts + "… or free text" chips (Find & build) and "try:" prompts (Refine & build) | `:2713-2718`, `:3471-3486` | Static lists from the prototype (`AN_SAVED`, `AN_FREE`, refine "try:" pairs) as chips that **only fill the ask box**, never submit: each run is persisted, queued for review and calls the LLM (B9). The refine placeholder already says "or click a prompt to build one" |
| P3 | REPORT-LOCAL note on `derive_attribute` operations (secondary/purple tone) | `:3519-3525` | In `OperationBatchReview.tsx`, show "REPORT-LOCAL. A derived attribute is a DEFINITION, and definitions are governed — publishing every analyst’s private ratio into the Semantic Layer would end its single-meaning invariant. Promotion is a separate, governed act." under `derive_attribute` rows, with the row in the `secondary` tone |

### 14.2 Needs data the service does not return today

**2026-10-08:** D1 (intent confidence), D2 (refinement chips, catalog-grounded only), D5 (clarification), D7 partial (why line, owner / visibility / consolidation when the catalog records them; last run, panels and parameters still not recorded) and D8 op labels are delivered in lexie-ai, intelligence-service, intelligence-ui and frontend-service (uncommitted). See `Analytical_Assist_Pending_Backend_Prompts.md` §2. D3, D4, D6, D8 attribute names and D9 stay blocked.

| # | Prototype feature | Prototype ref | Needs |
|---|---|---|---|
| D1 | Intent confidence % ("I’m N% sure I understood this") | `:2724-2729` | A confidence field on `AnalyticalRunResponse` (shown as "not recorded" today) |
| D2 | ⊕ gap chips under the ask (refinement affordances) | `:2735-2743` | Suggested refinements in the run response |
| D3 | "Which data asset did you mean?" narrowing + "built on" provenance on match cards | `:2896-2924`, `:3130-3144` | Data asset(s) per match in `CatalogMatchDto` |
| D4 | Report Store cards: "Already submitted" (filed artefact, formats, ref) and "An executed copy may already exist" (store link) | `:2748-2805` | `report_store_ready=true` in OPA and a store result in the run response (StoreEntryPanel, §6.6) |
| D5 | Clarification card for an unclear ask (clarify and stop, no matches) | `:2809-2814` | A clarification field in the run response |
| D6 | Due-date answer with uniform date or per-schedule table, "Answered by UC12" | `:2836-2886` | Structured UC12 due-date data; today only `route_out_uc` + `narrative` |
| D7 | Match card: "why" line, dashboard panels (per-panel gaps), parameters, consolidation + entitled scopes, last run / owner / visibility values | `:3103-3215` | These fields in `CatalogMatchDto` (shown as "not recorded" / omitted today); also the seed card's scope / params lines (§6.3) |
| D8 | Operations with logical labels and op labels (`N(attr)`, `AN_OPS[op].label`) instead of raw `op_name` / `target_field` | `:3511-3518` | Logical labels from the Semantic Layer in the batch operations |
| D9 | Plan: dataset choice, maturity-banding choice, "Propose these operations" | `:3590+` (`AnalyticalPlan`) | Server-side plan with dataset candidates and banding options; operations are proposed by lexie, never built in the browser |

### 14.3 Phase 2 (§11) or a hand-off not built yet

| # | Prototype feature | Prototype ref | Needs |
|---|---|---|---|
| H1 | Working Core builder: dataset, filter, column tick boxes, preview / history / visualization, Generate, state version + "last change by" | `:3907+` (`AnalyticalCoreBuilder`), `:3462-3466` | Core report id + builder version from Ad-hoc reporting (G1) |
| H2 | Apply operations, version bump, receipts in "What was recorded" | `:3369-3403`, `:3560-3570` | Phase 2 Apply (A3), §11 |
| H3 | "arrived from LexiAI" card (ask, parse and matches carried over as structure) | `:4062-4072` | Global Ask-Lexie routing UC10 asks into this tab (§6.1, §11) |
| H4 | Match card **Run** button | `:3218-3221` | Out of scope for UC10 here (Core runs reports); stays excluded |

### 14.4 Not carried over on purpose (intelligence-ui dropped them)

"changed" pill next to Best matches (`:2889`), "UC10" in the screen title and the EMBEDDED pill (`:4060`, `:2704`), the prefilled and auto-shown "Exposure by counterparty" ask (`:2609`, would start a persisted run on open).
