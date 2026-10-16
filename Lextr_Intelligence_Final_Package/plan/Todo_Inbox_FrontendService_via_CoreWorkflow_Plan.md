# To-do Inbox: Core workflow items in the lexie-frontend inbox: Implementation Plan

- **Created:** 2026-10-15. **Revised:** 2026-10-16. The owner rejected the first design, a To-do page in frontend-service. Core items now appear in the existing lexie-frontend To-do Inbox, and a click opens the item in frontend-service.
- **Status:** Built and committed on `feature/core-todo-inbox` in three repos. Not pushed; no PRs yet.

  | Repo | Commit |
  |---|---|
  | intelligence-service | `d48525c` |
  | frontend-service | `19149fc` |
  | lexie-frontend | `a137555` |

- **Builds on:** the lexie-frontend To-do Inbox (`plan/Todo_Inbox_Notifications_via_IntelligenceService_Plan.md`, merged 2026-10-14). It is a notification list of items waiting for action. A click opens the item in its own module. The inbox has no Approve or Reject.
- **Spec link:** LP-60 describes the master inbox as "Core routes; it does not decide." This change is LP-60's single list of Intelligence and Core items.
- **This file holds:**

  | § | Topic |
  |---|---|
  | 1 | What exists |
  | 2 | Decisions |
  | 3 | Impacted services |
  | 4 | Contract |
  | 5 | What was built |
  | 6 | Validation |
  | 7 | Known gaps |
  | 8 | Test data |
  | 9 | Production follow-ups |

---

## 1. What exists

**One table holds every Core workflow.** `data.workflow_detail` has one row per workflow instance:
- `id`, `workflow_master_id`, `module_name`, `status`, `comments`
- `created_by/on`, `updated_by/on`
- `client_id` (INTEGER)

**What "waiting for action" means comes from the definitions.** `meta.workflow_master.workflow_name` points to the active `meta.workflow_metadata.workflow_json`. That JSON lists `transitions` (the actions allowed in each state) and `endStates`.

`supp_workflow` (supplemental uploads) has no active definition of its own. It is read against `two_stage_approval_workflow`, the generic DRAFT → PENDING_APPROVAL definition.

**Each feature's own table links an item to its workflow:**

| Feature | Table | Key the page opens on |
|---|---|---|
| Rules | `meta.rule_detail.workflow_id` | rule name and version |
| Data Manager | `data.su_upload_control.workflow_id`, plus `meta.node_hierarchy` | node id and node code |
| Report Store | `data.report_store_control.workflow_id` | form name |
| Semantic | `wkfl.workflow_task.workflow_id` | `entity_ref` (the object id); `description_txt` and `assigned_to` also come from this table |

**Deployment:** frontend-service runs at `app.lextr.ai`, and lexie-frontend runs at `app.lextr.ai/intelligence`. They share one origin when deployed. Locally they run on different ports: :3000 and :5173.

---

## 2. Decisions

| # | Decision | Why |
|---|---|---|
| D1 | **Read only existing tables.** No new table, column, migration or DDL. Every feature join is a `LEFT JOIN`. | Owner constraint. |
| D2 | **The query lives in the existing To-do in intelligence-service:** one more source, `CORE_WORKFLOW`, in `queries.properties`. No change in workflow-service or semantic-service. | Owner decision 2026-10-15. |
| D3 | **Pending = the status has transitions and is not an end state** of its definition. There is no hard-coded status list. | New definitions and states need no code change. |
| D4 | **One list, in lexie-frontend.** The endpoint gets a `scope` parameter: `intelligence` (the default, so existing callers are unchanged), `core` or `all`. The lexie inbox reads `scope=all`. | Owner decisions: no new feature in the lexie To-do and no new tab in frontend-service; the items join the existing list. |
| D5 | **A click opens frontend-service in the same browser tab** at the item's deep link. | Owner decision. |
| D6 | **Links carry the key the page already opens on** (§4.3), plus `workflowId` on every link. | Pages open items by name or node, not by workflow id. |
| D7 | **Who it waits for:** a status with a `submit` action waits on the maker (`created_by`). A status with `approve` waits on an approver, who is never the maker (four-eyes). Otherwise anyone can act. `wkfl.workflow_task.assigned_to` overrides both when set. | Uses only data already in the tables. |
| D8 | **No decision in the inbox.** The row opens the feature page, which has the existing workflow buttons. | Same as LP-60 and the Intelligence inbox. |
| D9 | **After login, frontend-service returns to the page that was asked for.** It does not go to Home. | An inbox click while logged out has to reach the item. |

---

## 3. Impacted services

| Service | Change |
|---|---|
| **intelligence-service** | Query key `todo.notifications.core_workflow`. `CORE_WORKFLOW` source and module map in `InboxServiceImpl`. A `scope` parameter on `/notifications` and `/count`. Nullable `status`, `waiting_on` and `yours` fields on `TodoNotification`. Tests. |
| **lexie-frontend** | `features/inbox`: fetches with `scope=all`; Core rows get a green "why" label (status, plus yours or waiting on others); a click goes to frontend-service. Labels in `messages.en.ts`. Tests. |
| **frontend-service** | Shared hook `useInboxLink`. Link handling in Rules, Data Manager and Semantic. The return-after-login fix in `MainLayout` and `Login`. Tests. **No new page, menu entry or tab.** |
| gateway-service | No change. `/lexie/intelligence/**` already routes to intelligence-service. |
| workflow-service, semantic-service, rules-service, su-service, workbench-service, reportgeneration-service | No change. |
| database-migration-platform, config-service | No change. |
| Postgres | Read only. |

---

## 4. Contract

### 4.1 Endpoint (intelligence-service, existing)

`GET /api/v1/inbox/notifications?scope=intelligence|core|all`, and `GET /api/v1/inbox/notifications/count` with the same parameter.

- **Headers:** the same as before. `X-Client-Id` and `X-User-Id` are required (400 without them); `X-User-Functions` is optional.
- **Scopes:**

  | Scope | Returns |
  |---|---|
  | `intelligence` (default) | Exactly the earlier sources |
  | `core` | Only `CORE_WORKFLOW` rows |
  | `all` | Both lists, merged and sorted by `raised_at` newest first (missing dates last), capped at 200. The count is the sum of both counts. |
  | anything else | 400 |

- **Core client id:** Core's `client_id` is an INTEGER. A client id that isn't a number returns no Core rows, not an error.
- **Errors:** a failing Core read is logged and returns no Core rows. The Intelligence list still returns.

### 4.2 Core row

| Field | Value |
|---|---|
| `id` | `CORE_WORKFLOW:<workflow id>` |
| `source` | `CORE_WORKFLOW` |
| `subject_kind` | `module_name` |
| `subject_id` | the workflow id |
| `title` | The first of these that exists:<br>1. the semantic task's `description_txt`<br>2. the item name (`<rule> v<version>`, the upload's file name, or the report form)<br>3. `comments`<br>4. `Workflow #<id>` |
| `module` / `target` | From the module map: `rules_service` → Rules / `rules`; `supplemental_upload` → Data Manager / `dataManager`; `semantic_governance` → Semantic / `semantic`; `report_generation` → Report Store / `reportStore`; `workbench` → Workbench / `workbench`. An unmapped module returns the raw name and a null `target` and `deep_link`. |
| `raised_at` / `raised_by` | `updated_on` / `created_by` |
| `deep_link` | §4.3 |
| `status` | for example `DRAFT` or `PENDING_APPROVAL` (new nullable field) |
| `waiting_on` | `MAKER`, `APPROVER` or `ANY` (new nullable field) |
| `yours` | Boolean, worked out with D7 from `X-User-Id` (new nullable field) |

The new fields are `@JsonInclude(NON_NULL)`, so Intelligence rows look exactly as they did before.

### 4.3 Deep links

| Module | Link |
|---|---|
| Rules | `/rules?workflowId=…&ruleId=…&ruleName=…&version=…` |
| Data Manager | `/dataManager?workflowId=…&nodeId=…&nodeCode=…` |
| Report Store | `/reportStore?workflowId=…&nodeCode=<form name>` |
| Semantic | `/semantic?workflowId=…&entityRef=…` |
| Workbench | `/workbench?workflowId=…` |

A key is left out when its feature table has no row for the workflow. The page then opens without selecting an item.

### 4.4 Where lexie sends the click

`coreAppUrl(deepLink)` in `features/inbox/notificationData.ts` builds the address. The click goes there with `window.location.assign`, in the same tab. The base address is chosen in this order:
1. `VITE_CORE_APP_URL`, when set.
2. `http://localhost:3000`, in dev.
3. The same origin, when deployed (`app.lextr.ai`).

Intelligence rows still use `ctx.navigate(target)`, as before.

### 4.5 How a frontend-service page handles the link

`shared-ui/hooks/useInboxLink(keys, open, ready)` works like this:
- It runs only when `workflowId` is in the URL. Without it, the page's own use of the URL is untouched.
- It waits until the page is ready and its workspace tab is the active one.
- It passes the link's keys to `open`.
- It then removes `workflowId` and those keys from the URL with replace, so Back and refresh don't reopen the item.

---

## 5. What was built

| # | Item | Status |
|---|---|---|
| A1 | `todo.notifications.core_workflow`: the definition (own, or the two-stage fallback), the semantic task, and one row each from `rule_detail`, `su_upload_control` + `node_hierarchy` and `report_store_control`. Uses `jsonb_exists` instead of `?`. | Done |
| A2 | `CORE_WORKFLOW` source in `InboxServiceImpl`: title, deep link, `status`, `waiting_on`, `yours`; a failing read returns no Core rows; a non-numeric client returns no Core rows. | Done |
| A3 | The `scope` parameter on `/notifications` and `/count`, including the `all` merge and cap. | Done |
| A4 | `CoreWorkflowNotificationsTest` plus the updated `InboxNotificationsTest`. | Done, 34/34 pass |
| L1 | lexie-frontend `mount.tsx`: fetches with `scope=all`; Core rows go to frontend-service in the same tab. | Done |
| L2 | `notificationData.ts`: the `CORE_WORKFLOW` source, `whyLabel(row)`, `CORE_STATUS_LABELS`, `coreAppUrl`. `NotificationList.tsx`: a green tone for Core rows. Labels in `messages.en.ts`. | Done |
| L3 | `NotificationList.test.tsx`: 3 Core tests. | Done |
| F1 | `useInboxLink` hook, with tests. | Done |
| F2 | Rules: `useOpenRuleFromLink` in `RulesWorkspace` opens the rule's tab by name and version, the same tab a grid click opens. | Done, verified in the browser |
| F3 | Data Manager: `su/layout.tsx` selects the library (Report or Dataset) that holds the node, then opens the node. | Done, verified in the browser |
| F4 | Semantic: `SemanticPage.tsx` opens the WORKFLOW tab. | Done. It does not select the object (§7 G2). |
| F5 | Login: `MainLayout` passes the requested page to `/auth`, and `Login` returns to it with its path and query instead of `/`. | Done, verified in the browser |

---

## 6. Validation

| Check | Result |
|---|---|
| intelligence-service tests | 34/34 pass |
| API on dev (client 1, `lextradmin`) | `intelligence` 86, `core` 9, `all` 95, `bad` → `VALIDATION_ERROR` |
| lexie-frontend tests | 37/38 pass. The one failure is the hardcoded-strings test, which fails on `main` too (13 existing strings). `tsc` shows 152 errors, the same as `main`, and none in `features/inbox`. |
| frontend-service | 5/5 tests pass. `vite build` passes. eslint is clean on the new files. Two errors in `Login.tsx` and `MainLayout.tsx` are already on `main` (`any`, and `useMemo` after an early return). Full `tsc` runs out of memory on `main` as well. |
| Browser: login return | Logged out, opened `/dataManager?workflowId=1&nodeId=11&nodeCode=regulatory_ledger` → `/auth` → Login → back on `/dataManager?…` with Data Management open. |
| Browser: rule link | Opened `/rules?workflowId=79&ruleId=193&ruleName=BHCKB497&version=1` → login → the `BHCKB497` rule tab opened. |

---

## 7. Known gaps

| # | Gap | Effect |
|---|---|---|
| G1 | **frontend-service does not save its login across page loads.** `store/index.ts` saves only the slice `"auth"`, but the token is in `user`. | Every inbox click (a full page load) asks for login again, and a login in another tab doesn't carry over. After login, the user still lands on the item (D9). The owner chose not to save the token: the mock token contains the password. The proper fix is SSO (§9 P1). |
| G2 | **Semantic** opens the WORKFLOW tab but does not select the object from `entityRef`. | The user finds the item in the workflow list. |
| G3 | **Workbench** links carry only `workflowId`. Workbench has no handler for it yet. | Opens the Workbench page, not the item. |
| G4 | **Report Store** links carry `nodeCode` (the form name), but `reportStore/layout.tsx` selects a report only by `nodeId`. It has no handler for the link yet. | Opens the Report Store page, not the report. Not checked in the browser: there is no real pending report on dev. |
| G5 | **A workflow with no row in its feature table** (no rule, upload or report) gets a link with `workflowId` only. | Opens the module page, not the item. Workflows created through the app have the row. |

---

## 8. Test data on dev

- The test rows are `data.workflow_detail` ids 86–94, client 1, with comments starting `[todo-test]`. Only the pending ones appear in the inbox; 93 (approved) is a negative case.
- They have no rows in the feature tables, so their links open the module page only (G5).
- The two real pending items are workflow 80 (Semantic) and workflow 1 (Data Manager, node 11 `regulatory_ledger`).
- To see a rule open from the inbox, send a real rule for approval in frontend-service. That creates a properly linked workflow.
- **Cleanup**, only when the owner asks:

  ```sql
  DELETE FROM data.workflow_detail WHERE comments LIKE '[todo-test]%';
  ```

---

## 9. Production follow-ups (not in this change)

| # | Item |
|---|---|
| P1 | **SSO (Keycloak, `VITE_SSO_ENABLED=true`)** in frontend-service: a shared session, so going from lexie to Core doesn't ask for login; short-lived tokens that refresh; gateway token checks. This replaces the mock login, which keeps the password inside the token. |
| P2 | Identity comes from the `X-Client-Id` and `X-User-Id` headers, not from a checked token. |
| P3 | No module-entitlement filter: a user sees Core items for modules they may not have access to. |
| P4 | intelligence-service reads Core schemas (`data`, `meta`, `wkfl`) directly. This needs either a service API or an agreed read-only grant. |
| P5 | No index supports the query. Consider `data.workflow_detail (client_id, updated_on)` and `workflow_id` indexes on the feature tables. |
| P6 | Role-based "yours", from entitlements instead of maker and approver only. |
| P7 | Close G2 to G4: select the semantic object from `entityRef`, open a Workbench item from `workflowId`, and open a Report Store report from its form name. |
| P8 | Due dates: `wkfl.workflow_task.due_dt` exists, but only for semantic items. |
| P9 | Acting from the inbox (approve or reject in place), once the read-only inbox is proven. |
