# Lextr Intelligence — 1.38.0 FINAL

The build-from-scratch release. Every figure below is read from the artefact it describes.

**Manifest sha256** `51c9133ae1e0150e79bb7e3d35e2f2b466f0d895c01d961c6b866f689e0b5b04`
— if the file you hold hashes differently, it is not the file this README describes.

## Start here

1. `Lextr_Intelligence_Manifest_v1.38.0_FINAL.jsx` is the source of truth. Everything else is
   generated from it or measured against it.
2. Open `Lextr_Intelligence_Map_v1.38.0_FINAL.html` in a browser — seven tabs, self-contained,
   no network. It is the fastest way to understand the estate.
3. The team's job is to generate a work prompt per sub-task from the manifest and build
   against it. **251 sub-tasks across 59 logic points, 18 waves.**

## The files

| File | Size | sha256 | What it is |
|---|---|---|---|
| `Lextr_Intelligence_Manifest_v1.38.0_FINAL.jsx` | 2,504,532 | `51c9133ae1e0` | **Source of truth.** 59 points, 251 lanes, 18 waves, 30 gates. |
| `Lextr_Intelligence_Map_v1.38.0_FINAL.html` | 514,096 | `0a8ef1aec59d` | Seven-tab estate map. Open in a browser. |
| `Lextr_Intelligence_Catalog_v1.38.0_FINAL.jsx` | 303,268 | `5786869a7dcb` | Estate catalogue. Identifiers aligned to `client_id` and ELK. |
| `LextrStackWorkbench_v1.38.0_FINAL.jsx` | 87,087 | `dff7e062fd49` | Stack decision surface, preloaded with the decisions taken. |
| `Lextr_Intelligence_UI_v1.38.0_FINAL.jsx` | 1,136,284 | `92506525c917` | The UI prototype. **Unmodified** — byte-identical to the handoff. |
| `Lextr_TechStack_Provenance_v1.38.0_FINAL.html` | 72,704 | `73f8593eb641` | Where every stack statement came from. |
| `Lextr_TechStack_SideBySide_v1.38.0_FINAL.html` | 53,790 | `4500618b033b` | The stack paired by job, in plain English. |
| `Lextr_Stack_Decision_v1.38.0_FINAL.json` | 17,944 | `8849f7f786e7` | The decision record: what was chosen, rejected and left open. |
| `Lextr_TechStack_Provenance_v1.38.0_FINAL.csv` | 23,931 | `0946e1a3a303` | The provenance register as data. |
| `Lextr_TechStack_Pairs_v1.38.0_FINAL.csv` | 30,473 | `80086717950e` | The side-by-side comparison as data. |
| `AUDIT_prompts_v1.38.0_FINAL.txt` | 1,038 | `d1af06bfe608` | All 251 prompts generated and measured. |
| `Lextr_Intelligence_TechStack_Increment_v1.38.0_FINAL.jsx` | 19,526 | `ea4b925a3590` | **Merge into the Enterprise Standards Catalog.** What Intelligence adds, where it diverges, what it does not use. |

`migrations/` — 5 files, **none applied**. `generator/` — everything needed to
regenerate and re-verify every artefact above.

## What the manifest contains

- **59 points · 251 lanes · 18 waves**, every point in exactly one wave,
  no dependency violations.
- **14 pinned_stack categories · 30 validation gates · 10 standards blocks** in
  every generated prompt.
- **`ddl_body` is the frozen baseline; `ddl_deltas` is the ledger** — 5 deltas,
  28 typed operations, **0 applied**. Effective schema = baseline + applied.
- Lane status: committed 69 · blocked 64 · not_started 53 · proposed 32 · ready 25 · in_progress 8

## Every prompt, generated and measured

```
  lanes            : 251  prompts generated: 251
  prompt size      : min 102,052  median 105,880  max 158,772 chars
  layers           : product_specific=226  global_standard=5  cross_product=13  platform=7
  emitted blocks   : 10 in every prompt
  languages        : JAVA, SQL, REGO, PY, TS, CYTO, TEST
```

Zero findings needing action. No prompt renders an `undefined` or `null` value, no `## `
section is empty, every lane carries its own language gate, and all 14 stack
categories reach every prompt.

## Gates

- **manifest edits, rulings, release and generated prompts** — 662/662 assertions passed
- **the migration sequence** — 91/91 assertions passed
- **the knowledge_artifact migration** — 40/40 assertions passed
- **map · product flow** — 1463/1463 assertions passed
- **map · database & ER** — 698/698 assertions passed
- **map · UI screens and the impact panel** — 935/935 assertions passed
- **tech-stack provenance** — 212/212 assertions passed
- **the stack, side by side** — 466/466 assertions passed
- **the decision workbench** — 929/929 assertions passed

**5,496 assertions in total.** Every gate has a mutation harness beside it in
`generator/` — a gate that has never been shown to fail is a gate nobody has tested.

## Decisions taken

The stack was decided job by job in the workbench: **51 selected,
6 rejected** across 29 of 32 jobs. Notable rulings:

- **OpenTelemetry is the observability standard.** Prometheus rejected. The backend is
  deployment configuration and is **not named** — that is a real gap, not a resolved
  question, and an unset OTLP endpoint fails startup rather than exporting into nothing.
- **ELK replaces Dagre** as the graph layout engine, carried into the CYTO gate, the
  language label and the two lanes that build it.
- **`NamedParameterJdbcTemplate`**, no JPA, SQL externalised — the Java control plane is
  the sole DB writer; the four Python DB libraries are rejected.
- **Part-M is a day-one standard**, not a reconciliation debt. See "what is still owed".
- **DEC-LP-02-1 settled as specification** — nothing is built, so the question answers
  itself.

## Standards conformance

The standard this manifest called "Part-M" has been located: it is the **Enterprise
Metadata Standard**, published as the Lextr Standards Catalog — 53 entries, every one
`Mandatory`, with "Governance review" as the exception route. Measured against `ddl_body`:

| | |
|---|---|
| STD-NAM-002 snake_case | **PASS** — 0 non-conforming |
| STD-NAM-003 names ≤ 32 chars | **PASS** — 257 objects, 0 over |
| STD-NAM-009 controlled suffixes | **63 of 153** suffixed columns approved |
| STD-MDT-002 lifecycle columns | **FAIL** — `document_chunk`, `embedding_store`, `agent_run_step` |
| STD-SEM-001 `semantic_group_cd` | **FAIL** — 0 occurrences across 202 columns |
| STD-ARCH-003 layer separation | **DIVERGENT** — one `intelligence` schema, standard names `meta` + `data` |

The unapproved suffix tails are `_type` (10), `_code` (10), `_key` (4), `_ids` (3),
`_date` (3) — several are near-misses for approved forms (`_code` vs `_cd`, `_date` vs
`_dt`), which is the cheapest class of fix.

## What is still owed, and by whom

**Three appendices, and they are all that stand between `LP-01.1` and being authorable:**
the approved abbreviation list, the full suffix list (**Appendix C**) and the governed
semantic-group set (**Appendix E**). The rules are readable; the lists are referenced and
not reproduced. **Owner.**

**A governance ruling on STD-ARCH-003** — one schema versus `meta` + `data`. Architectural,
not a migration.

**Three open stack jobs** — `local-runtime`, `other-vector-store`, `serialization`. Two are
recommended drops nobody confirmed; `local-runtime` follows from the Qwen3-4B selection.

**An accessibility bar.** The manifest records that none exists anywhere in these points —
zero occurrences of `wcag`, `aria-`, `tabIndex`, `screen reader` — alongside 164
`div`-onClick handlers. Cheaper to set before the components exist than after. **Owner.**

**Where OTLP terminates.** See above.

## Known limitations of this package

- **The catalogue's schema section predates the rebuild baseline.** It still lists
  `regulatory_document` and does not list `knowledge_artifact`. Correct for the estate being
  discarded, wrong for the one being built. It should be regenerated alongside the V1
  baseline, once Part-M lands.
- **`ddl_body` index names say `tenant`** — `ix_regdoc_tenant_sha`,
  `ix_regdoc_tenant_status` — while its own columns say `client_id`. A ledger delta, not an
  edit to the baseline.
- **`LP-36` has no sub-tasks**, so it generates no prompt and whatever it carries reaches
  nobody by construction.
- **Ten lanes (4%) share a lane scope** with another lane — layer boilerplate with the
  parameter unfilled. Their prompts still differ, because the point-level fields do.

## Rebuilding any artefact

```
cd generator
node make_decision.js        # the decision record, from decisions_input.json
python3 close_gap.py         # the manifest: rulings, release, gates, ledger, counts
python3 build_tab5.py        # the map, chained in order
python3 build_tab6.py
python3 build_tab7.py
python3 fix_catalog.py       # catalogue identifier alignment
python3 build_provenance.py  # provenance -> side-by-side -> workbench
python3 build_stackpairs.py
python3 build_workbench.py
python3 audit_sync.py        # cross-artefact agreement
node audit_prompts.js        # generate all 251 prompts and measure them
```

`LEXTR_MANIFEST` and `LEXTR_MANIFEST_JSON` override which manifest the chain reads.
