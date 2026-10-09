# UC11 Rules & Logic Assist: catalog scope per job (Check vs Build vs Draft)

**Status:** DEFERRED (decided 2026-10-09: keep the current "attributes the rule uses" scope for now)
**Repo to change:** `lextrai/lexie-ai` only (intelligence-service and intelligence-ui need no change; the UI already renders a longer list)
**Files:** `lexie_ai/adapter/rules_semantic.py`, `skills/rules/skill.py`, `tests/rules/test_rules_semantic.py`, `tests/rules/test_rules_copilot.py` (or a new test module)
**Related:** `FrontendService_Rules_Logic_Assist_via_IntelligenceService_Plan.md` §9 B8; reference JSX `files/Lextr_Intelligence_UI_v1.38.0_FINAL.jsx` (Build tab, `RULES_ATTRS`, lines ~1891–1905 and ~4485–4640); spec `prompts/wave_07/LP-25.8_TS.md` (Build: "what can I use?")

---

## 1. Problem

`rules.get_catalog` returns the Semantic Layer entries only for the attributes the rule's filters **already use**
(`SemanticServiceRulesCatalog.catalog`, `rules_semantic.py`; the removed SQL reader worked the same way). The skill uses that
one catalog for three different jobs:

| Job | What it needs | Today |
|---|---|---|
| **Check** (conformance: are my values valid?) | Only the attributes the rule uses | ✅ correct |
| **Review** (formal gate, deterministic) | Only the attributes the rule uses | ✅ correct |
| **Build** ("what can I use?") | Every attribute registered on the dataset(s) the rule reads | ❌ lists only attributes already in the rule, so the author can never add a filter on a new attribute |
| **Draft from anchor** (author) | The dataset's usable attributes | ❌ a blank or filter-less rule gives the drafter an **empty** catalog, so it drafts nothing |

## 2. Evidence (2026-10-09)

- BHCK3521 (rule 127) after removing its only filter: Draft from anchor returned no predicates, with the drafter's rationale
  *"No predicates were drafted because the provided registered-attribute catalog is empty."*
- With a filter in place, the Build tab shows one card (`internal_reg_coa`). `regulatory_ledger_ds` has 24 registered attributes.
- The JSX's Build tab shows *"Attributes registered on DERIVATIVES"*, including `prod_hier_cd`, which the rule does not use
  (`used: null`) and which is marked "not rules-eligible" with its values withheld.

## 3. Decision (when picked up)

Split the catalog by job; the policy layer stays exactly as it is.

| Job | Catalog scope | Notes |
|---|---|---|
| Check (`checks.conformance`) | Attributes the rule uses | Unchanged |
| Review | Attributes the rule uses | Deterministic gate; no wider read |
| Build (`attributes` in the render model) | Every attribute semantic-service exposes on the rule's `ds.*` objects | Used ones keep `predicate_ids`; unused ones are listed too; non-rules-eligible or ungoverned ones are shown with values withheld (the UI already does this) |
| Draft (drafter context) | Only attributes that are `rules_eligible` **and** AI-exposed (`ai_exposed_flg`, `ai_exposure_cd` not BLOCKED) | The drafter never sees more than the Semantic Layer allows AI to see |

Unchanged guarantees: semantic-service still applies need-to-know grants, classification, masking and AI blocking to every attribute
it returns; lexie still applies POL-DM-001 to values. A rule that reads only other rules' outputs (no `ds.*` input) keeps today's
"match every object" behaviour for Check, and gets **no** Build/Draft widening (there is no dataset to list).

## 4. Design

1. `rules_semantic.py`: split the read into two calls on one object scan:
   - `catalog(client_id, rule)` (unchanged contract): entries for the rule's operands, for conformance.
   - `dataset_catalog(client_id, rule, limit=…)`: every exposed attribute of the rule's `ds.*` objects, same entry shape, plus
     `used: bool`. Reuse the object detail already fetched (one `/api/objects/{id}` per object, domains fetched once each).
   - A cap (default 200 attributes) for very wide objects; when it truncates, return `truncated: true` so Build can say so.
2. `_TenantRules` / `RulesAdapter`: add `get_dataset_catalog(rule)` (None when unavailable, like `get_catalog`).
3. `skills/rules/skill.py`:
   - Gate the wider read under the same op `rules.get_catalog` (no new op, so `adapter_ops`, the manifest and Rego stay identical).
   - Not called in `review`.
   - `checks.conformance(rule, catalog)` keeps the operand catalog.
   - `attributes` (Build) built from the dataset catalog; `predicate_ids` from the rule.
   - Drafter context `catalog`: the dataset catalog filtered to rules-eligible and AI-exposed attributes.
4. No change to intelligence-service (`extra_fields` is passed through) or intelligence-ui (`BuildTab` already renders unused,
   not-eligible and withheld attributes).

## 5. Tests

- Build lists unused attributes of the dataset, with `used=false`, and keeps `predicate_ids` on the used one.
- Draft context excludes attributes that are not rules-eligible, not AI-exposed, or BLOCKED; a blank rule gets a non-empty context
  when the dataset has eligible attributes.
- Conformance findings are unchanged (only operands are checked).
- Review makes no dataset read.
- A rule with only `rl.*` inputs gets no widening.
- The cap truncates and reports `truncated: true`.
- Policy: an attribute semantic-service withholds never appears in either list.

## 6. Risks

| Risk | Mitigation |
|---|---|
| Larger payloads and drafter prompts on wide objects | Cap plus `truncated` flag; drafter gets eligible + AI-exposed only |
| The drafter sees attributes it did not see before | Only those the Semantic Layer marks rules-eligible and AI-exposed, after semantic-service's own AI-exposure policy |
| Build looks crowded with non-eligible attributes | Expected (JSX does the same); it shows the steward what to enable |

## 7. Data note

In dev today every attribute of `regulatory_ledger_ds` except `internal_reg_coa` is semantic-**off** (registered before the
Register-screen fix, frontend-service PR #77). After this change, Build would list them as not rules-eligible with values withheld,
and the drafter would still see only `internal_reg_coa` until a steward enables more.

---

## 8. Implementation prompt

```text
TASK: Split UC11's catalog by job in lexie-ai. Check and Review keep the attributes the rule uses; Build lists every attribute
semantic-service exposes on the rule's ds.* objects; the drafter gets only rules-eligible AND AI-exposed attributes.

REPO: lextrai/lexie-ai (change only this repo)
SPEC: utils/prompts-library/Lextr_Intelligence_Final_Package/plan/RulesAssist_Catalog_Scope_Plan.md

STEPS
1. lexie_ai/adapter/rules_semantic.py: add dataset_catalog(client_id, rule, limit=200) -> {"attributes": {...}, "truncated": bool},
   same entry shape as catalog() plus "used"; one object-detail read per ds.* object and one domain read per domain, shared with
   catalog(). No widening when the rule has no ds.* input.
2. lexie_ai/adapter/rules_ops.py _TenantRules: get_dataset_catalog(rule) -> dict | None (None when unbound or unavailable).
3. skills/rules/skill.py: under the existing rules.get_catalog decision (no new op), and not in review: read the dataset catalog;
   conformance keeps the operand catalog; "attributes" come from the dataset catalog; the drafter context gets it filtered to
   rules_eligible and ai_exposed (exposure not BLOCKED).
4. Tests per plan §5.

DO NOT
- Add an op, change adapter_ops / skill.manifest.json / Rego, or touch intelligence-service or intelligence-ui.
- Read Semantic Layer tables directly; read only through semantic-service.

VALIDATE
- pytest tests/rules (the pre-existing test_origin_vocabulary_agrees_sql_and_java failure is known).
- Live: BHCK3521 Build lists regulatory_ledger_ds attributes; Draft from anchor on a blank rule gets a non-empty context.
```
