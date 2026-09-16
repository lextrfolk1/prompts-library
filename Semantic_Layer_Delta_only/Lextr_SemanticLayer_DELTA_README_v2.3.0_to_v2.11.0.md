# READ ME — Incremental package · v2.3.0 → v2.11.0

**You built against v2.3.0. This package tells you only what changed.**
Do not read the full v2.11.0 manifest end to end — most of it you have already implemented.

---

## What is in this folder

| File | Use it for |
|---|---|
| `Lextr_SemanticLayer_DELTA_Manifest_v2.3.0_to_v2.11.0.html` | **Open this first.** Self-contained viewer, six tabs, no install. |
| `..._DELTA_Manifest_....jsx` | Viewer source, if you want it inside your own app. |
| `..._DELTA_Manifest_....json` | Machine-readable — drive your backlog or ticket import from this. |
| `..._DELTA_Manifest_....md` | The same content as text, for reviewing in a PR or printing. |
| `..._DELTA_DDL_v2.3.0_to_v2.11.0.sql` | The migration script. Additive only. |

---

## The shape of the change

| | v2.3.0 | v2.11.0 |
|---|---|---|
| Logic points | 21 | 44 |
| Sub-task lanes | 77 | 165 |
| Tables | 16 | 39 |

**Nothing was withdrawn.** Every v2.3.0 logic point still exists. The 44 points split into exactly three buckets:

- **9 UNCHANGED** — LP-02, 04, 07, 08, 09, 10, 11, 13, 21. The contract has not moved. **Do not modify them.** Re-run their existing tests as regression.
- **12 AMENDED** — existing code must change. Split by how disruptive:
  - **REWORK (5)** — LP-01, LP-12, LP-14, LP-17, LP-20. Something was *replaced*, so behaviour you already shipped changes.
  - **ADDITIVE (7)** — LP-03, LP-05, LP-06, LP-15, LP-16, LP-18, LP-19. Only additions.
- **23 NEW** — LP-22 … LP-44. Build from scratch.

Every amended point lists, field by field, what to **ADD** and what was **REMOVED**, plus new and changed sub-tasks. Every new point carries full scope, steps, tests and pre-build knowledge.

---

## Suggested order

1. **Apply the DDL delta.** 21 tables + 27 columns on `meta.attribute_catalog`. Additive; a landed migration is never edited.
2. **The 5 REWORK points.** These change shipped behaviour, so do them before anything builds on top.
3. **The 7 ADDITIVE points.**
4. **The 23 new points**, in wave order (the viewer shows each point's wave and dependencies).
5. **Leave LP-42 and LP-44 alone** until the owner approves them.

---

## The one that will cost you most

**LP-17 — Register Object wizard.** The object is no longer typed as free text: it is chosen from a governed **Schema → Object Type → Object** picker sourced from the registry. Four steps and four tests were removed, not merely added to, and the wizard gains a registration-queue default view. Budget for rework here, not a patch.

Close behind it, **LP-03 and LP-05** gain the full attribute-authoring contract — classification, exposure flags, semantic role, CDE class, the domain block, operational behaviour and effective dating — and the exposure read must return **everything** registration captured. That round-trip is enforced as a build gate in LP-39: a field captured in the UI but not returned by the API fails the build.

---

## Do NOT build

| Point | What | Why |
|---|---|---|
| **LP-42** | Logical hierarchies, migration V9 | owner approval pending |
| **LP-44** | Attribute promotion, migration V16 provenance columns | owner approval pending on five rulings; Core must also supply the workflow stages |

Both are commented out in the DDL script. `meta.governance_event` is **deferred** — it is commented out in v2.11.0 and the script does not create it.

---

## Testing

Every test listed under an amended or new point is a test you must add. Existing v2.3.0 tests stay valid unless they appear under **REMOVED**. Three gates are new and worth calling out:

- **Round-trip gate** — every field the registration UI captures must persist through LP-03 and return through LP-05.
- **Domain-decision coverage** — every attribute whose semantic role is `CODE` must declare a domain mode; no decision means registration fails.
- **Determinism** — phrase resolution must be exact-match only. Assert that no fuzzy, stemming, embedding or nearest-match code path exists.

---

## Open items you will hit

- `POL-DM-001` (domain-resolve policy) is **not yet authored** — it lands in the LP-14 bundle.
- `meta.attribute_text` (attribute-name localization) is a recorded gap; English names ship first.
- The LP-30 history-versus-audit decision is open, which is why `governance_event` is deferred.

If any of these blocks you, raise it to the owner rather than choosing an interpretation — a build never settles an open item.
