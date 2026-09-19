# [Project Name] — Generic Progress Tracker Template

**Repository / Area:** `repo-or-area-name`  
**Version / Release:** `vX.Y.Z`  
**Tracker Mode:** Evidence-based, item-by-item tracking  
**Current State:** Template baseline. No work item is marked as delivered without objective evidence.

---

## 1. Status Model

Use one status per item at all times:

- `PENDING` — not started
- `IN_PROGRESS` — actively being worked
- `BLOCKED` — waiting on dependency, approval, or missing input
- `DELIVERED` — implementation exists and evidence is recorded
- `DEFERRED` — intentionally postponed or out of scope

Required fields per item:

- `Item ID`
- `Phase / Wave`
- `Area / Layer`
- `Scope`
- `Owner`
- `Status`
- `Evidence`
- `Last Updated`
- `Notes / Risks`

---

## 2. Phase Summary Matrix

| Phase / Wave | Area / Domain | Total Items | PENDING | IN_PROGRESS | BLOCKED | DELIVERED | DEFERRED | Status |
|:---:|---|:---:|:---:|:---:|:---:|:---:|:---:|---|
| **Phase 01** | [Domain / Area] | 0 | 0 | 0 | 0 | 0 | 0 | ⚪ Planning |
| **Phase 02** | [Domain / Area] | 0 | 0 | 0 | 0 | 0 | 0 | ⚪ Planning |
| **Phase 03** | [Domain / Area] | 0 | 0 | 0 | 0 | 0 | 0 | ⚪ Planning |
| **Phase 04** | [Domain / Area] | 0 | 0 | 0 | 0 | 0 | 0 | ⚪ Planning |
| **Phase 05** | [Domain / Area] | 0 | 0 | 0 | 0 | 0 | 0 | ⚪ Planning |
| **Phase 06** | [Domain / Area] | 0 | 0 | 0 | 0 | 0 | 0 | ⚪ Planning |
| **TOTAL** | **Project Scope** | **0** | **0** | **0** | **0** | **0** | **0** | **0% baseline** |

---

## 3. Item Register

This section is the operational tracker. Each item gets a row and must be updated independently.

### Phase 01 — [Phase Name]

| Item ID | Area / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `ITEM_ID_01` | `repo-layer` | Short description of the scope | — | `PENDING` | — | — | — |
| `ITEM_ID_02` | `repo-layer` | Short description of the scope | — | `PENDING` | — | — | — |

### Phase 02 — [Phase Name]

| Item ID | Area / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `ITEM_ID_03` | `repo-layer` | Short description of the scope | — | `PENDING` | — | — | — |

### Phase 03 — [Phase Name]

| Item ID | Area / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `ITEM_ID_04` | `repo-layer` | Short description of the scope | — | `PENDING` | — | — | — |

### Phase 04 — [Phase Name]

| Item ID | Area / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `ITEM_ID_05` | `repo-layer` | Short description of the scope | — | `PENDING` | — | — | — |

---

## 4. Tracking Rules

1. Every item must have a status set explicitly.
2. `DELIVERED` requires evidence (test output, validation result, review signoff, or artifact reference).
3. `BLOCKED` requires a clear blocker and owner.
4. `DEFERRED` must have a reason and review date.
5. Do not carry forward stale “delivered” states without fresh verification.

---

## 5. Suggested Review Cadence

- Daily: update item status and blockers
- Weekly: validate evidence against current implementation or repo state
- At milestones: confirm all final `DELIVERED` items still match actual outcomes

---

## 6. Quick Copy Template

Use this single-row pattern when adding new entries:

| Item ID | Area / Layer | Scope | Owner | Status | Evidence | Last Updated | Notes / Risks |
|:---:|---|---|---|---|---|---|---|
| `ITEM_ID_X` | `area-layer` | Short description of the scope | `owner-name` | `PENDING` | `link/test/result` | `YYYY-MM-DD` | `risk or note` |
