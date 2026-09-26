# Lextr Intelligence — features and how to test them

This lists the 52 things a user or an integrating system can actually **do** with Lextr Intelligence, found by scanning the code of
intelligence-service, lexie-ai and intelligence-ui. Each feature says where you use it, whether it works today,
how to test it, and which automated tests and live checks cover it.

**UI is compared with the approved prototype** (`files/Lextr_Intelligence_UI_v1.38.0_FINAL.jsx`):
- Each prototype screen is marked, from the code, as present in the real UI, a placeholder, or missing.
- Everything the prototype says a screen lets you do becomes a "Prototype UI" checklist item to verify on the real screen.
- Real screens that the prototype doesn't have are listed too.

**Not listed on purpose:** schema and migrations, OpenAPI, logging, datasource and config wiring, the error envelope, test gates,
observability probes, localisation plumbing, design documents and test harnesses. They support features but are not features.

## Start here

```bash
cd /Users/tejal/codebase/utils/prompts-library/Lextr_Intelligence_Final_Package/feature-testing
python3 run_feature_tests.py serve        # the testing page: opens http://127.0.0.1:8765
```

On the testing page:
1. Check the environment chips in the header.
2. Pick a feature.
3. Run its automated tests and live checks.
4. Work through its test steps, marking each Pass, Fail or Blocked with a note. The checklist saves to `results/manual_status.json`.
5. Export a report.

The same things from the command line:

```bash
python3 run_feature_tests.py list [--area Knowledge] [--status Available]
python3 run_feature_tests.py show kh-upload             # what it does, where, status, known issues, steps, endpoints, tests
python3 run_feature_tests.py test kh-upload [--repo lexie-ai]
python3 run_feature_tests.py suite                      # all three test suites once, verdict per feature
python3 run_feature_tests.py smoke [--only kh-upload] [--allow-writes]
python3 tools/build_feature_catalog.py                  # rebuild after the code changes
```

## Files

| File | What it is |
|---|---|
| [FEATURES.md](FEATURES.md) | The feature list, grouped by area, with status and how to test each feature. |
| [feature_catalog.json](feature_catalog.json) | The same data, read by the runner and the page. |
| [testing_ui.html](testing_ui.html) | The testing page, served by `run_feature_tests.py serve`. |
| [run_feature_tests.py](run_feature_tests.py) | The runner, using only the Python standard library. |
| [smoke_checks.json](smoke_checks.json) | Live API checks. Each one is linked to features by its URL. Read-only unless you pass `--allow-writes`. |
| [tools/features.json](tools/features.json) | **The only hand-written input.** Each feature, anchored to code: UI slice, controllers, lexie routes and test paths, plus its test steps and its prototype screen with what that screen should let you do. |
| [tools/build_feature_catalog.py](tools/build_feature_catalog.py) | Derives, from the code: endpoints, test files, every URL the UI calls (checked against the real endpoints), linked live checks and a status. |

## Status labels

Each status comes from the code, not from a claim:

| Status | Meaning |
|---|---|
| Available | Usable from its screen, and the screen's calls reach a real endpoint. |
| UI calls a missing endpoint | The screen calls a URL that no running service answers. It fails even with everything up. |
| Refused until Core adapter exists | The code refuses by design (`RUN_ADAPTER_UNBOUND`) until Lextr Core provides the adapter. |
| API works; UI shows sample data | The API is real, but the screen shows built-in sample data. |
| UI shows sample data only | A screen with no endpoint behind it. |
| API only / API only (UI not mounted) / API only (Lexie panel not live) | Test it through the API; the screen doesn't exist, isn't mounted, or depends on the Lexie panel, which doesn't launch real runs. |

## Running the stack for live checks and manual steps

| # | Service | Command |
|---|---|---|
| 1 | OPA (Docker) | `intelligence-service/scripts/opa-docker.sh`, then `… reload` after each restart (serves :8181) |
| 2 | config-service | `cd lextr/java/config-service && ./mvnw spring-boot:run` (serves :8888) |
| 3 | lexie-ai | `cd lexie-ai && ENV=dev ../.venv-lexie-ai/bin/python app.py` (listens on 5003) |
| 4 | intelligence-service | `LEXIE_URL=http://localhost:5003 mvn clean spring-boot:run` (serves :8059; its built-in default looks for lexie-ai on 8004) |
| 5 | UI | `cd intelligence-ui && npx vite`, then open http://localhost:5173/intelligence/ (proxies `/api` to :8059) |

## For an agent

- Don't edit, commit or push the product repos unless asked; report defects. Never commit in `lextr/java/config-service`.
- Use `smoke --allow-writes` only when the user allows test rows in the dev DB.
- `SKIPPED`, `NOT_RUN` and flaky passes are findings, never `PASS`.
- Report each feature's status, test verdicts, live-check results, and which steps passed, failed or couldn't be run.
