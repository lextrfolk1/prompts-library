# To-do Inbox as Notifications via intelligence-service: Implementation Plan

- **Created:** 2026-10-14
- **Last updated:** 2026-10-14 (built, tested live, committed)
- **Status:** **Built and tested end to end in dev.** Committed on `feature/todo-inbox-notifications`, not pushed.
- **Repos:** `intelligence-service` (Java), `lexie-frontend` (TypeScript). No change in `database-migration-platform` or `config-service`.
- **Spec:** `prompts/wave_16/LP-60.1` … `LP-60.4`; prototype `files/Lextr_Intelligence_UI_v1.38.0_FINAL.jsx:11632-12140`.
- **This file holds:** where the feature stands (§0), the decisions (§1), the shared contract every track codes against (§2), the parallel tracks and who owns which file (§3), each track's tasks (§4 to §8), integration and validation (§9) and what is left for later (§10).

---

## 0. Status

**Built.** The To-do Inbox lists what is waiting across five sources, read from existing tables; a row opens the item in its own module. A header badge shows the waiting count. Approve and Reject are not on the inbox page (D1); the decision workspace is kept, unregistered, as `InboxDecisionMount`.

**Commits** (`feature/todo-inbox-notifications`, not pushed):

| Repo | Commit |
|---|---|
| intelligence-service | `e794cfe` feat(inbox): To-do notifications read from existing tables |
| lexie-frontend | `2f53c4c` feat(inbox): To-do Inbox as a notification list that opens the item |

**Validation (2026-10-14, dev, client `1`):**

| Check | Result |
|---|---|
| JUnit `mvn test -Dtest='Inbox*'` | 24/24 (8 new in `InboxNotificationsTest`) |
| vitest `src/features/inbox` | 25/25 (list, pagination, decision-mount reference) |
| vitest, other touched areas | Pass: badge, review focus, skills focus, analytical, rules. **Not runnable:** training-data focus, Knowledge Hub focus and Presets focus tests fail on `could not find react-redux context value` from `@lextrfolk4/shared-ui`, the same error that already fails those screens' tests on `main` (§10 L7) |
| tsc (`tsconfig.app.json`) | 152 errors, identical file by file to `main`; 0 in changed files |
| SQL | All four `todo.notifications.*` queries run read-only on dev |
| Live API (service, gateway `/lexie/intelligence`, Vite proxy) | 39/39 meaningful checks: list = count, 10 snake_case fields, unique ids, newest first, `deep_link = /target/subject_id`, review ids = `/review/queue` (81/81), skill ids = definitions pending MRM (5/5), 400 without `X-Client-Id` or `X-User-Id`, client isolation, legacy `/inbox` endpoints unchanged, list ≤ 41 ms and count ≤ 30 ms |
| Browser (headless Chromium, :5173) | 22/22: badge count, list, search, focus re-read, keyboard Enter, badge click, legacy nav entry hidden, no Approve/Reject, no console errors or failed requests |
| Every source end to end | REVIEW_RUN → AI Risk & Controls run panel; SKILL_MRM → Skill Registry panel; TRAINING_ATTESTATION (seeded, then removed) → Datasets panel with Attest; KNOWLEDGE_ASSURANCE → Knowledge Hub document drawer; APPROVAL_CHAIN → Presets panel for a real preset, list for an unknown one |
| Acting in the module clears the item | MRM-approving `smoke_71d2f84e` dropped the count 87 → 86 and removed the row |
| Layout | Live resize 2560×1440 → 900×600 → back: no page scrollbar, rows scroll inside the table, header and filters pinned, pager on screen; columns scroll sideways below about 1100 px |

**Deviations from this plan, accepted by the owner:**
- **Module label** for review rows is "AI Risk & Controls" (the nav name), not "Review Queue" (§2.3).
- **Knowledge source query** fixed after live testing (§2.3): Knowledge Hub documents are lexie-ai ids (`doc-…`), so the join to `regulatory_document` is a `LEFT JOIN`, and real runs are `PENDING`, so the filter is `judgement_status IN ('PENDING','PENDING_REVIEW')`.
- **Table style matches the Skill Registry** (C3): a card around the grid, a two-line item cell and a coloured pill per source. This overrides LP-60.3's "no outer container".
- **Pagination and fixed layout** added to C3: 20/50/100 rows per page; the heading, search and pager stay fixed and only the rows scroll. Width stays at the shared 1440 px (a full-width inbox was tried and reverted for consistency).
- **Presets opens the item too** (E4, added in §8).
- **E2 state:** the Datasets surface is `DatasetsTab` with `openKey` (`TdmLive.tsx:409`), not the `openId` states named in §8 (those are Samples and Runs). Its panel now remounts on a new focus, so switching dataset groups resets the panel's local state.
- **Dependencies:** Track C ran `npm ci` in lexie-frontend before the owner had approved it. Lockfile only; no tracked file changed.

**Dev data left by testing:** skill `smoke_71d2f84e` is MRM-approved; estate ledger rows #1359 (`SUBMIT` for test preset `inbox-e2e-preset`) and #1360 (`SUBMIT` for `UC1A_VARIANCE_Y9C`) are permanent (the ledger is append-only). The inbox therefore shows 88 items in dev, and `UC1A_VARIANCE_Y9C` appears as waiting at step 2 although its own panel shows its chain approved.

---

## 1. Decisions

| # | Decision | Why |
|---|---|---|
| D1 | The inbox is a **notification list**. A row says what needs action and opens the feature's own page. No Approve or Reject on the inbox page. | Owner decision 2026-10-14. LP-60 already treats acting on the artefact's own panel as the same act, so the decision path stays in the modules. |
| D2 | **Pull, not push.** The list loads on open; a header badge polls a count every 60 s and on window focus. | Owner decision. No websocket, SSE or notification-service work. |
| D3 | **No new table, no migration.** Every row is read from tables that already exist. | Owner constraint, and LP-60.2: "a work-item table would be a second answer to 'what is waiting'". |
| D4 | **No Core surface** for this feature. The new endpoints take no `surface` parameter. | Owner decision. |
| D5 | **Client-wide visibility** in this version: everyone in the client sees every pending item. | Simplest correct first version. Per-function filtering is §10. |
| D6 | **Keep the decision UI as a reference.** `InboxWorkspace.tsx`, `inboxData.ts` and their tests stay unchanged. The current mount wiring moves to an unregistered `InboxDecisionMount.tsx`. Backend `/inbox`, `/decide` and `/detail` stay. | Owner decision: the next phase will build actions and needs the reference. |
| D7 | The **approval-chain source** (ledger `SUBMIT` rows, existing `derive()`) is included even though it returns nothing today. | It fills in without inbox changes once modules write `SUBMIT` rows (§10). |

---

## 2. Shared contract (fixed; every track codes against this)

Do not change this section without telling every track.

### 2.1 Endpoints (intelligence-service, `InboxController`)

| Method | Path | Headers | Response |
|---|---|---|---|
| GET | `/api/v1/inbox/notifications` | `X-Client-Id` (required), `X-User-Id` (required), `X-User-Functions` (optional, ignored in this version) | `ApiResponse<List<TodoNotification>>`, newest first, at most 200 rows |
| GET | `/api/v1/inbox/notifications/count` | same | `ApiResponse<TodoNotificationCount>` |

A missing or blank `X-Client-Id` or `X-User-Id` is a 400, using the controller's existing `present(...)` helper.

### 2.2 Row shape (wire is snake_case; the frontend reads camelCase through `featureClient`)

```json
{
  "id": "REVIEW_RUN:run_01JDX",
  "source": "REVIEW_RUN",
  "subject_kind": "agent_run",
  "subject_id": "run_01JDX",
  "title": "variance · explain_movement",
  "module": "AI Risk & Controls",
  "target": "review",
  "raised_at": "2026-10-14T09:12:00Z",
  "raised_by": "j.doe",
  "deep_link": "/review/run_01JDX"
}
```

Count: `{ "count": 7 }`. It equals the length of the list before the 200 cap.

### 2.3 Sources

| `source` | Table and condition | `subject_id` | `title` | `raised_at` / `raised_by` | `module` | `target` |
|---|---|---|---|---|---|---|
| `REVIEW_RUN` | `intelligence.agent_run`, `status = 'in_review'`. This is the same filter as `GET /api/v1/review/queue` (`ReviewQueueController.java:57-61`). | `run_id` | `use_case · intent` | `COALESCE(completed_at, created_at)` / `user_id` | AI Risk & Controls | `review` |
| `TRAINING_ATTESTATION` | `intelligence.training_dataset`, `status = 'frozen'` (frozen, not yet attested) | `CAST(id AS text)` | `dataset_key v<version>` | `COALESCE(frozen_at, created_at)` / `frozen_by` | Training Data & Models | `training` |
| `SKILL_MRM` | `intelligence.registered_definition`, `mrm_status = 'pending' AND status NOT IN ('deprecated','retired')` | `definition_key` | `display_name version` | `COALESCE(observed_at, created_at)` / `author` | Skill Registry | `skills` |
| `KNOWLEDGE_ASSURANCE` | latest `intelligence.document_assurance_run` per `document_id` (`DISTINCT ON`), kept when `judgement_status IN ('PENDING','PENDING_REVIEW')`, `LEFT JOIN intelligence.regulatory_document d ON CAST(d.id AS text) = document_id` (Knowledge Hub ids are lexie-ai `doc-…` ids, so most runs have no match) | `document_id` | `d.form_code · d.description`, else `document_id` | `created_at` / `created_by` | Knowledge Hub | `knowledge` |
| `APPROVAL_CHAIN` | `InboxServiceImpl.derive()` rows with `state = 'OPEN'` (estate ledger) | `subjectId` | `label`, else `subjectId` | `createdAt` / `initiatedBy` | from `MODULES[kind][0]` | from `MODULES[kind][1]` |

`deep_link` is always `/<target>/<subject_id>`. Every query filters `client_id = :client_id` and takes `LIMIT :limit`.

### 2.4 Frontend shell contract (`lexie-frontend/src/shell/mountContract.ts`)

```ts
export interface NavFocus { subjectId: string }
export interface ShellContext {
  navigate(destinationId: string, focus?: NavFocus): void; // focus is optional: existing callers are unchanged
  /** Set when the screen was opened from a link that names an item; null otherwise. */
  focus: NavFocus | null;
  /** The screen calls this once it has opened the item, so a later visit does not reopen it. */
  consumeFocus(): void;
  // ...existing members unchanged
}
```

### 2.5 Frontend types (`lexie-frontend/src/features/inbox/notificationData.ts`, created by Track C)

```ts
export type TodoSource = "REVIEW_RUN" | "TRAINING_ATTESTATION" | "SKILL_MRM" | "KNOWLEDGE_ASSURANCE" | "APPROVAL_CHAIN";
export interface TodoNotification {
  id: string; source: TodoSource; subjectKind: string; subjectId: string; title: string;
  module: string; target: string; raisedAt: string | null; raisedBy: string | null; deepLink: string;
}
export interface TodoNotificationCount { count: number }
```

### 2.6 i18n keys (all added by Track C to `src/i18n/messages.en.ts`)

| Key | English |
|---|---|
| `inbox.notice.title` | To-do Inbox |
| `inbox.notice.subtitle` | Items waiting for action. Open one to act on it in its own module. |
| `inbox.notice.th.item` / `.module` / `.why` / `.raised` / `.raisedBy` | ITEM / MODULE / WHY / RAISED / RAISED BY |
| `inbox.notice.source.REVIEW_RUN` | AI output waiting for review |
| `inbox.notice.source.TRAINING_ATTESTATION` | Dataset frozen, waiting for attestation |
| `inbox.notice.source.SKILL_MRM` | Skill waiting for model-risk approval |
| `inbox.notice.source.KNOWLEDGE_ASSURANCE` | Assurance result waiting for review |
| `inbox.notice.source.APPROVAL_CHAIN` | Approval step waiting |
| `inbox.notice.empty` | Nothing is waiting for action. |
| `inbox.notice.open` | Open in {module} |
| `inbox.badge.label` | {count} items waiting in the To-do Inbox |
| `inbox.notice.page.range` / `.of` / `.size` / `.prev` / `.next` (*added with pagination*) | {from}–{to} of {total} / Page {page} of {pages} / Rows per page / Previous page / Next page |

---

## 3. Parallel tracks and file ownership

Four tracks start at the same time, coding against §2. A track edits **only** the files it owns. That rule is what makes parallel work merge cleanly.

| Track | Repo | Owns (create or edit) | Must not touch | Depends on |
|---|---|---|---|---|
| **A: backend API** | intelligence-service | `inbox/model/TodoNotification.java`, `inbox/model/TodoNotificationCount.java`, `inbox/dao/InboxDao.java`, `inbox/dao/impl/InboxDaoImpl.java`, `inbox/service/InboxService.java`, `inbox/service/impl/InboxServiceImpl.java`, `inbox/controller/InboxController.java`, `resources/queries.properties` (new `todo.notifications.*` keys only), `test/.../inbox/InboxNotificationsTest.java` | Existing `read`, `decide`, `detail` behaviour | §2 only |
| **B: shell focus** | lexie-frontend | `src/shell/mountContract.ts`, `src/App.tsx`, `src/features/knowledge/mount.tsx`, `src/shell/__tests__/navigateFocus.test.tsx` | `features/inbox/*`, `i18n/*` | §2.4 only |
| **C: inbox list** | lexie-frontend | `src/features/inbox/notificationData.ts`, `NotificationList.tsx`, `InboxDecisionMount.tsx`, `mount.tsx`, `__tests__/NotificationList.test.tsx`, `src/i18n/messages.en.ts` | `InboxWorkspace.tsx`, `inboxData.ts`, existing inbox tests, `shell/*`, `App.tsx` | §2.2, §2.4, §2.5 |
| **D: header badge** | lexie-frontend | `src/components/atoms/TodoBadge.tsx`, `src/components/atoms/__tests__/TodoBadge.test.tsx` | `App.tsx` (Track B adds the one line that renders the badge), `i18n/*` | §2.1, §2.5, §2.6 |
| **E: open the item** (after B merges) | lexie-frontend | E1 `features/risk/*`, E2 `features/training-data/*`, E3 `features/skills/*`: one screen each, so E1, E2 and E3 run in parallel | everything else | Track B merged |
| **F: docs** (last) | prompts-library | `PENDING_FEATURES.md`, `ui-backend-api-mapping.md`, this file's status | code | A to E merged |

**Merge order:** A, B, C and D in any order, but for a green frontend build B goes before C and D, because C and D call `ctx.navigate(target, focus)`. Then E1, E2 and E3. Then F.

**Building before B merges:** C and D can be developed and unit-tested before B lands. Their tests build their own `ShellContext` mock with the §2.4 shape. Only `tsc` across the whole app needs B.

---

## 4. Track A: backend API (intelligence-service)

Pattern to follow: Controller → Service interface → DAO interface → Impl; `NamedParameterJdbcTemplate`; SQL in `queries.properties` loaded through `SQLQueryLoaderUtil.getQuery`; Jackson SNAKE_CASE is global, so Java records use camelCase names.

| # | Task | Done when |
|---|---|---|
| A1 | Add four SQL keys to `queries.properties` below the existing `todo.detail.*` block (around line 1598): `todo.notifications.review_run`, `.training_attestation`, `.skill_mrm`, `.knowledge_assurance`. Each selects `subject_id, title, raised_at, raised_by` per §2.3 and takes `:client_id` and `:limit`. Read-only `SELECT` only. | Each query runs in psql against dev and returns the four columns. |
| A2 | Add `record TodoNotification(...)` and `record TodoNotificationCount(long count)` in `inbox/model/`, with fields exactly as §2.2. | Compiles. |
| A3 | `InboxDao`: add `List<Map<String,Object>> notifications(String sourceKey, String clientId, int limit)`. The impl looks the key up in a fixed `Map<source, sqlKey>`; an unknown key throws `IllegalArgumentException`. | Unit test: unknown key rejected. |
| A4 | `InboxService` and `InboxServiceImpl`: add `List<TodoNotification> notifications(String clientId, String actorId, List<String> functions)` and `long notificationCount(...)`. Run the four DAO sources plus `derive(clientId, null, actorId, functions)` filtered to `OPEN`, map each to `TodoNotification` per §2.3, sort by `raisedAt` descending with nulls last, cap at 200. The count is the size before the cap. **One source failing must not empty the list:** catch per source, log at WARN with the source name, and skip it. | Unit tests below. |
| A5 | `InboxController`: add `@GetMapping("/notifications")` and `@GetMapping("/notifications/count")`, with headers per §2.1 and the same `present(...)` and `functions(...)` helpers as `read`. | Controller tests below. |
| A6 | `InboxNotificationsTest.java` with mocked DAO, ledger and policy: (a) each source maps to the right `target`, `module` and `deep_link`; (b) rows from all sources come back newest first; (c) cap at 200 while count reports the full total; (d) one source throwing still returns the others; (e) an approval-chain row in state `APPROVED` is excluded; (f) missing `X-Client-Id` or `X-User-Id` gives 400; (g) JSON keys are snake_case. | `mvn -q test -Dtest='Inbox*'` passes, existing `InboxControllerTest` and `InboxServiceImplTest` included. |

**Live check:**
```bash
curl -s "$IS/api/v1/inbox/notifications" -H "X-Client-Id:$CID" -H "X-User-Id:$UID" | jq '.data | length, .[0]'
curl -s "$IS/api/v1/inbox/notifications/count" -H "X-Client-Id:$CID" -H "X-User-Id:$UID" | jq .data
```
The list length (when 200 or fewer) equals the count. Every `REVIEW_RUN` `subject_id` also appears in `GET /api/v1/review/queue`.

---

## 5. Track B: shell focus (lexie-frontend)

Today `ShellContext.navigate(id)` is `setScreen` (`App.tsx:91`), so a link that names an item lands on the inventory.

| # | Task | Done when |
|---|---|---|
| B1 | `mountContract.ts`: add `NavFocus`, change `navigate` to `navigate(destinationId, focus?)`, and add `focus` and `consumeFocus` per §2.4. | `tsc` passes; existing callers compile unchanged. |
| B2 | `App.tsx`: add `const [focus, setFocus] = useState<NavFocus \| null>(null)`. `navigate: (id, f) => { setFocus(f ?? null); setScreen(id); }`. `consumeFocus: () => setFocus(null)`. The sidebar click (around line 219) also clears focus. The `byId` aliases (`inbox` → `todo`, `training-data` → `training`) keep working. | Unit test B4. |
| B3 | `App.tsx`: render `<TodoBadge ctx={ctx} />` beside `<IdentityBar />`. Until Track D merges, keep this line commented out with a pointer to this plan; enable it in the merge that brings D in. | The badge shows in the header after D merges. |
| B4 | `knowledge/mount.tsx`: `content: (ctx) => <KnowledgeHub deepLink={ctx.focus} onConsumed={ctx.consumeFocus} />`. `KnowledgeHub` already opens `deepLink.subjectId` (`KnowledgeHub.tsx:1633-1690`). | Test: navigating to `knowledge` with `{ subjectId: "51" }` opens document 51. |
| B5 | `src/shell/__tests__/navigateFocus.test.tsx`: navigate with focus sets it; a sidebar click clears it; `consumeFocus` clears it; navigate without focus clears an old one. | `npx vitest run src/shell` passes. |

---

## 6. Track C: inbox notification list (lexie-frontend)

| # | Task | Done when |
|---|---|---|
| C1 | Create `InboxDecisionMount.tsx`: move `InboxMount` (current `mount.tsx:26-87`) into it unchanged and export it as `InboxDecisionMount`. Add a header comment: kept as the reference for the decision phase (LP-60) and not registered in the shell. | The file compiles; no registry entry points to it. |
| C2 | Create `notificationData.ts` with the §2.5 types and `sourceLabel(source): MessageCode` returning `inbox.notice.source.<source>`. | Compiles. |
| C3 | Create `NotificationList.tsx`: the estate's standard inventory grid with search and per-column filters, **no outer card** (LP-60.3; *superseded on 2026-10-14: the owner asked for the Skill Registry style, so the grid sits in a card with a two-line item cell, a coloured pill per source, pagination at 20/50/100, and a fixed heading and pager with rows scrolling inside the table, see §0*), theme tokens only and no new hex literals. Columns: item (title + subject id), module, why (`sourceLabel`), raised, raised by. Copy the grid markup and classes from `InboxWorkspace.tsx`; do not import from it. A row click calls `onOpen(row)`; there is no side panel and no decision control. States: loading, empty (`inbox.notice.empty`), error (through `RefusalNotice`). | Test C6. |
| C4 | Rewrite `mount.tsx`: a new `NotificationsMount` loads `getJson<TodoNotification[]>("/api/v1/inbox/notifications", ctx.session)`, re-reads on window focus, and on open calls `ctx.navigate(row.target, { subjectId: row.subjectId })`. Keep `mount` (id `todo`) and `inboxLegacyMount` (id `inbox`, hidden) exports with the same ids, labels and icon; only `content` changes. | The registry still resolves `todo` and `inbox`. |
| C5 | Add the §2.6 keys to `messages.en.ts` beside the existing `inbox.*` block (around line 1153). Leave existing keys alone; the decision mount still uses them. | `npx vitest run src/i18n` (key coverage) passes. |
| C6 | `__tests__/NotificationList.test.tsx`: renders one row per item with the right "why" label; a row click calls `navigate("knowledge", { subjectId: "51" })`; the empty state shows; no Approve or Reject control exists in the DOM. The existing `InboxWorkspace.test.tsx` and `InboxCanonical.test.tsx` still pass unchanged. | `npx vitest run src/features/inbox` passes. |

---

## 7. Track D: header badge (lexie-frontend)

| # | Task | Done when |
|---|---|---|
| D1 | `TodoBadge.tsx`: `({ ctx }: { ctx: ShellContext })`. Fetches `/api/v1/inbox/notifications/count` on mount, every 60 s, and on window `focus`; clears the interval on unmount. Shows a `CheckCircle` icon with the count; hidden when the count is 0 or the call fails (it never shows an error in the header). `aria-label` uses `inbox.badge.label`. A click calls `ctx.navigate("todo")`. Theme tokens only. | Test D2. |
| D2 | `TodoBadge.test.tsx` with fake timers and mocked `getJson`: shows 7; refreshes after 60 s; hidden at 0 and on error; a click navigates to `todo`; unmount stops polling. | `npx vitest run src/components/atoms` passes. |

---

## 8. Track E: open the exact item (after B merges; E1 to E3 in parallel)

Each screen reads `ctx.focus`. If its subject is in the screen's data, the screen opens it in the panel it already has, then calls `ctx.consumeFocus()`. If the screen has no selection state, it lands on the list and the track records that in §10. **Do not add a new panel to a screen in this plan.**

| # | Screen | Where to look | Subject id it receives |
|---|---|---|---|
| E1 | AI Risk & Controls (`review`) | `features/risk/mount.tsx:33-35` (`ReviewMount`), `features/risk/api.ts` | `run_id` |
| E2 | Training Data & Models (`training`) | `features/training-data/mount.tsx:69-82`; *corrected:* the Datasets surface is `DatasetsTab` with `openKey` (`components/TdmLive.tsx:409`); the `openId` states at `:1252` and `:2341` are Samples and Runs | dataset `id` as text |
| E3 | Skill Registry (`skills`) | `features/skills/mount.tsx:70`, `components/SkillRegistry.tsx` | `definition_key` |
| E4 | Presets (`presets`), *added 2026-10-14* | `features/presets/mount.tsx`, `components/Presets.tsx` (existing `rhp` panel state) | preset `id` (`PRE-01`), `presetKey` or `presetId`, whichever the ledger `SUBMIT` carries |

**Done when:** each screen has a test where `ctx.focus = { subjectId }` opens that item and calls `consumeFocus` once, and a test that an unknown subject id leaves the list as it is.

---

## 9. Integration and validation (after A to E merge)

| Check | Command or step | Pass |
|---|---|---|
| Backend tests | `mvn -q test -Dtest='Inbox*'` | all pass |
| Frontend tests | `npx vitest run src/features/inbox src/shell src/components/atoms src/features/knowledge src/features/risk src/features/training-data src/features/skills` | all pass |
| Type check | `npx tsc --noEmit` | 0 new errors compared with `main` |
| Live API | §4 curls on dev | list and count agree; review rows match the review queue |
| Browser | Open To-do Inbox → rows from at least two sources → click a Knowledge row → the document opens → click a Review row → that run opens (or the list, if E1 recorded a gap) → the badge count drops after the item is acted on in its module and the window regains focus | as described |
| Reference intact | `InboxWorkspace.tsx`, `inboxData.ts` and `InboxDecisionMount.tsx` compile; `/api/v1/inbox`, `/decide`, `/detail` respond as before | unchanged |

Results are recorded in §0.

**How to run the frontend tests here:** a plain `npx vitest run` cannot load any test that imports `@lextrfolk4/shared-ui` (`Cannot find module …/sockjs-client/dist/sockjs`). Until `vite.config.ts` is fixed (L7), run with a temporary config that extends `vite.config.ts` and sets `test.server.deps.inline: ["@lextrfolk4/shared-ui"]`, then delete it.

---

## 10. Later (out of scope here)

| # | Item | Where |
|---|---|---|
| L1 | Modules write `SUBMIT`, `APPROVE` and `REJECT` estate-ledger rows, so the `APPROVAL_CHAIN` source fills in. Preset lifecycle (`PresetController.java:40`) and training freeze (`TrainingController.java:59`) do not call `EstateLedgerService.estateRecord` today; Knowledge Hub has no submit endpoint. | intelligence-service: preset, training and knowledge services |
| L2 | Per-function visibility (D5): filter rows by `X-User-Functions` and the LP-59 actor directory. | `InboxServiceImpl.notifications` |
| L3 | Act from the inbox: register `InboxDecisionMount` again or merge its panel into the notification list (LP-60.2 and LP-60.3). | lexie-frontend `features/inbox` |
| L4 | More sources once they have a clear "waiting" state: `governance_envelope.status = 'pending_approval'` (no frontend screen today), drop-profile rulings. | intelligence-service |
| L5 | Due dates and risk floors: `InboxServiceImpl.java:177-178` passes a null `dueAt` and no floors (comment above `chainFor`). | intelligence-service |
| L6 | Core surface for notifications (D4). | both |
| L7 | Frontend test setup: inline `@lextrfolk4/shared-ui` in `vite.config.ts` (`test.server.deps.inline`) and give its components a Redux `Provider` in tests, so the Training, Knowledge Hub and Presets tests (including the new focus tests) can run. They already fail the same way on `main`. | lexie-frontend `vite.config.ts`, `vitest.setup.ts` |
| L8 | Count without fetching rows: `/count` reads up to 10,000 rows per source and counts in Java. A `SELECT COUNT(*)` key per source is cheaper. | `queries.properties`, `InboxServiceImpl.notificationCount` |
| L9 | AI output review has no action on the screen the row opens: the AI Risk & Controls panel "raises; it does not decide". Point `REVIEW_RUN` at the screen where review is taken, or accept the read-only landing. | product decision, then `InboxServiceImpl` sources map |
| L10 | Archived documents: a pending assurance run on an archived Knowledge Hub document still raises a to-do. Decide whether the Knowledge query should exclude them. | product decision, then `todo.notifications.knowledge_assurance` |
| L11 | A wrong-method request (e.g. POST on a GET endpoint) returns 500 instead of 405 across intelligence-service, not only the inbox. | intelligence-service global exception handler |
