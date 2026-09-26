# Lextr Intelligence v1.38.0 — testable feature list

Which features exist, and how to test each one. There are two scopes:

- **The 59 features the prompt-driven build added** (`LP-xx`). They were found by comparing
  `feature/lextr-intelligence-v1.38.0` with `main` in intelligence-service, lexie-ai and intelligence-ui,
  and mapping the result onto this package's manifest, prompts and tracker.
- **12 baseline features that already existed on `main`** (`BL-xx`), so the branch comparison does not list them:
  - BL-01 to BL-08: lexie-ai's VarianceAI application (cycles, detection, analysis, review, audit, configuration, knowledge base, runtime, demo data).
  - BL-09 to BL-11: the rules chatbot, rule description and summary, and MDRM recommendation. **These have no automated tests; manual checks only.**
  - BL-12: the UI screens that were on `main`.

`list`, `show`, `test`, `suite` and `smoke --only` accept `BL-xx` the same way as `LP-xx`.

| File | What it is |
|---|---|
| [FEATURES.md](FEATURES.md) | The feature list. It covers all 59 logic points, 31 capability modules, branch changes made outside the prompts, and the 12 baseline features (section 4). Each feature's detail section gives its prompts, acceptance criteria (as a checklist), how to test it and its known gaps. |
| [feature_catalog.json](feature_catalog.json) | The same data in machine-readable form, for agents and for the runner. |
| [run_feature_tests.py](run_feature_tests.py) | The runner, using only the Python standard library. Commands: `preflight`, `list`, `show`, `test`, `suite`, `smoke`. |
| [smoke_checks.json](smoke_checks.json) | Live API checks. Read-only unless you pass `--allow-writes`. |
| [tools/](tools/) | `build_feature_catalog.py` regenerates the two files above from the repos. `feature_summaries.json` is its only hand-written input: summaries, manual checks, known gaps and modules. |

The runner writes its output to `results/`, which git ignores.

## Quick start

```bash
cd /Users/tejal/codebase/utils/prompts-library/Lextr_Intelligence_Final_Package/feature-testing
python3 run_feature_tests.py preflight          # what can run here: toolchain, branches, live ports
python3 run_feature_tests.py list --uc UC10     # features, filterable by --uc or --domain
python3 run_feature_tests.py show LP-57         # summary, prompts, acceptance criteria, tests, manual checks (also BL-06)
python3 run_feature_tests.py test LP-57         # that feature's automated tests in every repo (also LP-57.2, module:impact)
python3 run_feature_tests.py suite              # all three repo suites once, verdict per feature
python3 run_feature_tests.py smoke              # live API checks (needs the stack running)
python3 tools/build_feature_catalog.py          # regenerate after a branch moves (read-only against the repos)
```

## Test levels and verdicts

| Level | What | Needs | Command |
|---|---|---|---|
| L0 | Unit, static and contract tests | Toolchain only (java + mvn, the lexie venv, UI node_modules) | `test` / `suite` |
| L1 | Tests that need Docker (Testcontainers), OPA or sibling repos; some skip when those are absent | Those dependencies | same |
| L2 | Live API smoke | The running stack (below) | `smoke` |
| L3 | Manual UI/API walkthrough | The running stack plus a browser | listed by `show` |

**Verdicts:**
- `PASS`: every mapped test passed.
- `FAIL`: a test case failed.
- `ERROR`: the runner errored, or an unhandled error was raised in one of the feature's test files.
- `SKIPPED`: only skipped cases ran.
- `NOT_RUN`: the feature's tests produced no results. LP-32's `secret-scan` test is excluded by the pom by default.
- `NO_TESTS`: nothing is mapped to the feature.

A failing test that belongs to no feature is reported as `UNMAPPED_FAIL`. Each run is saved to `results/<ts>-<cmd>.json` and logged in `results/RESULTS.md`.

## For an agent testing a feature

**Rules:**
- Don't edit, commit, push or switch branches in the product repos unless asked. Report defects rather than fixing them silently.
- Never commit in `lextr/java/config-service`.
- Use `smoke --allow-writes` only when the user allows test rows in the dev DB.
- Don't apply migrations to the shared dev DB (`[::1]:5433/lextr`).
- `SKIPPED`, `NOT_RUN` and flaky passes are findings, never `PASS`.

**Steps:**
1. Run `preflight`. If a repo's branch or HEAD differs from the catalog, run `tools/build_feature_catalog.py` first.
2. Run `show <LP>`. Its acceptance criteria are the definition of done. The full spec is the prompt file listed per sub-task (`prompts/wave_NN/LP-XX.Y_<LANG>.md`).
3. Run `test <LP>`. For a use case end to end, run `test module:<id>`; the ids are listed by `list`.
4. Run the UI gates: `cd intelligence-ui && scripts/lp47/lp47_run_suites.sh` must be all GREEN, with typecheck at 0 errors.
5. For L2 and L3, start the stack (below), then run `smoke --only <LP>` and work through the manual checks from `show`.
   - intelligence-service responses are wrapped as `{"data": …}`, and it expects `X-Client-Id: client_001` plus `X-User-Id`/`X-Principal-Id`.
   - A screen shown as `Lexie panel inline: X` is reached by asking in the Lexie panel.
   - A screen shown as `(declared unmounted)` has no UI by design; see `intelligence-ui/src/shell/declaredUnmounted.ts`.
6. Report, for each level:
   - the verdict and counts;
   - each failure, with its message and file:line;
   - which acceptance criteria are covered, and which are not;
   - known gaps, kept separate from new findings;
   - the results file.

**Live stack** (dev mode, one terminal each):

| # | Service | Command |
|---|---|---|
| 1 | OPA (Docker) | `intelligence-service/scripts/opa-docker.sh`, then `… reload` after each restart (serves :8181) |
| 2 | config-service | `cd lextr/java/config-service && ./mvnw spring-boot:run` (serves :8888) |
| 3 | lexie-ai | `cd lexie-ai && ENV=dev ../.venv-lexie-ai/bin/uvicorn app:app --port 8004` |
| 4 | intelligence-service | `mvn clean spring-boot:run` (serves :8059) |
| 5 | UI | `cd intelligence-ui && npx vite`, then open http://localhost:5173/intelligence/ (proxies `/api` to :8059) |

## Status as of 2026-09-26

The first full run of all three suites:

| Repo | Passed | Failed | Skipped |
|---|---|---|---|
| intelligence-service | 622 | 0 | 0 |
| lexie-ai | 1,237 | 0 | 8 |
| intelligence-ui | 407 | 0 | 0 |

The LP-47 gates are GREEN and the UI typecheck is at 0 errors. The 8 lexie-ai skips are 7 strict xfails for the canonicaliser (see "Still open") and 1 test that needs the `opa` binary.

**Fixed:** intelligence-service `33b6330`, lexie-ai `fdac52a`, intelligence-ui `4c3bd49`.
- The embed crash from its Emotion cache key.
- The evidence store silently failing every insert.
- UC9 returning canned answers without calling lexie-ai.
- The anomaly, lineage and swarm coordinators enqueuing runs they never persisted.
- Fabricated run ids.
- Missing reason codes in two policies.
- 32 UI type errors, including three silently dead MUI style props.
- Stale or over-broad tests.

The commit messages have the detail.

**Still open** (owner decision): lexie-ai's `service/variance/audit/events.canonical_json` is not RFC 8785. A compliant `intelligence/evidence/jcs.py` exists, but switching to it changes the variance audit-chain hashes, so events need a canonicalisation version first.
