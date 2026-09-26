#!/usr/bin/env python3
"""Feature test runner for Lextr Intelligence v1.38.0 (branch feature/lextr-intelligence-v1.38.0 vs main).

Reads feature_catalog.json (build it with tools/build_feature_catalog.py). Stdlib only.

  python3 run_feature_tests.py serve                      # the testing page in your browser (http://127.0.0.1:8765)
  python3 run_feature_tests.py preflight                  # what can run on this machine right now
  python3 run_feature_tests.py list [--domain Variance] [--uc UC10]
  python3 run_feature_tests.py show LP-14                 # summary, prompts, acceptance criteria, how to test
  python3 run_feature_tests.py show module:knowledge
  python3 run_feature_tests.py show BL-06                 # a feature that already existed on main
  python3 run_feature_tests.py test LP-14 [LP-37 ...] [--repo lexie-ai] [--dry-run]
  python3 run_feature_tests.py test module:impact
  python3 run_feature_tests.py suite [--repo lexie-ai]    # run whole repo suites once, map results to every feature
  python3 run_feature_tests.py smoke [--only LP-57] [--allow-writes]   # L2 live API checks

Results: results/<timestamp>-<cmd>.json and a row appended to results/RESULTS.md.
Exit code: 0 all passed, 1 something failed, 2 usage/environment error.
Env: LEXTR_REPOS (default /Users/tejal/codebase/lextrai), LEXIE_VENV (default <repos>/.venv-lexie-ai),
     SVC_URL, LEXIE_URL, OPA_URL, UI_URL.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import re
import shutil
import socket
import subprocess
import sys
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

HERE = Path(__file__).resolve().parent
CATALOG = HERE / "feature_catalog.json"
SMOKE = HERE / "smoke_checks.json"
RESULTS = HERE / "results"
REPOS = ("intelligence-service", "lexie-ai", "intelligence-ui")


def repos_root() -> Path:
    return Path(os.environ.get("LEXTR_REPOS", "/Users/tejal/codebase/lextrai"))


def venv() -> Path:
    return Path(os.environ.get("LEXIE_VENV", str(repos_root() / ".venv-lexie-ai")))


def load() -> dict:
    if not CATALOG.exists():
        sys.exit("feature_catalog.json missing - run: python3 tools/build_feature_catalog.py")
    return json.loads(CATALOG.read_text())


def resolve(cat: dict, key: str) -> dict:
    if key.startswith("module:"):
        mid = key.split(":", 1)[1]
        for m in cat["modules"]:
            if m["id"] == mid:
                return {**m, "_kind": "module"}
        sys.exit(f"unknown module {mid}; known: {', '.join(m['id'] for m in cat['modules'])}")
    k = key.upper()
    for b in cat.get("baseline_features", []):
        if b["id"] == k:
            return {**b, "_kind": "baseline"}
    if re.fullmatch(r"LP-\d{2}\.\d{1,2}", k):  # a single prompt -> its parent point
        k = k.split(".")[0]
    for f in cat["features"]:
        if f["id"] == k:
            return {**f, "_kind": "feature"}
    sys.exit(f"unknown feature {key}")


# ---------------------------------------------------------------- commands

def cmd_list(cat: dict, a) -> int:
    rows = cat["features"]
    if a.domain:
        rows = [f for f in rows if a.domain.lower() in (f["domain"] or "").lower()]
    if a.uc:
        rows = [f for f in rows if a.uc.upper() in [u.upper() for u in f["use_cases"]]]
    print(f"{'LP':6} {'wave':>4} {'delivery':10} {'tests s/l/u':11} {'domain':28} title")
    for f in rows:
        n = lambda r: len(f["test_files"].get(r, []))
        print(f"{f['id']:6} {f['wave']:>4} {f['delivery']:10} {n('intelligence-service'):>3}/{n('lexie-ai')}/{n('intelligence-ui'):<5} "
              f"{(f['domain'] or '')[:28]:28} {f['title'][:80]}")
    if not a.uc:
        bl = [b for b in cat.get("baseline_features", []) if not a.domain or a.domain.lower() in (b["domain"] or "").lower()]
        if bl:
            print("\nbaseline features already on main:")
            for b in bl:
                n = sum(len(v) for v in b["test_files"].values())
                print(f"{b['id']:6} {b['repo']:16} tests={n if n else 'none (manual)':<14} {b['name']}")
    if not a.domain and not a.uc:
        print("\nmodules:", ", ".join(f"module:{m['id']}" for m in cat["modules"]))
    return 0


def cmd_show(cat: dict, a) -> int:
    x = resolve(cat, a.key)
    if a.json:
        print(json.dumps(x, indent=2, ensure_ascii=False))
        return 0
    if x["_kind"] == "baseline":
        print(f"# {x['id']} - {x['name']}  [{x['repo']}, already on {x['on_base_branch']}]\n\n{x['feature_summary']}\n")
        for e in x["endpoints"]:
            print(f"  endpoint  {e['endpoint']}")
        if x["manual_checks"]:
            print("\n  manual checks (L3):")
            for m in x["manual_checks"]:
                print(f"    - {m}")
        for nt in x["notes"]:
            print(f"  NOTE: {nt}")
        if x["changed_by_branch"]:
            print(f"  changed by the branch since main: {', '.join(x['changed_by_branch'])}")
    elif x["_kind"] == "module":
        print(f"# module:{x['id']} - {x['name']}  [{x['use_case']}]  reach: {x['reach']}")
        print("related LPs:", ", ".join(x["related_points"]))
        for e in x["endpoints"]:
            print(f"  endpoint  {e['repo']:20} {e['endpoint']}")
    else:
        print(f"# {x['id']} - {x['title']}\n  wave {x['wave']} | {x['domain']} | UC {', '.join(x['use_cases'])} | delivery {x['delivery']}")
        print(f"\n{x['feature_summary'] or ''}\n")
        for s in x["ui_screens"]:
            print(f"  UI        {s.get('group')} > {s.get('label')}")
        for e in x["endpoints"]:
            print(f"  endpoint  {e['repo']:20} {e['endpoint']}")
        for s in x["subtasks"]:
            print(f"\n  [{s['sub_id']} {s['lang']}] {s['tracker_status']} - {s['summary']}\n    prompt: {s['prompt_file']}")
            for i, c in enumerate(s["acceptance_criteria"], 1):
                print(f"    AC{i}: {c[:220]}{'...' if len(c) > 220 else ''}")
        if x["manual_checks"]:
            print("\n  manual checks (L3):")
            for m in x["manual_checks"]:
                print(f"    - {m}")
        for g in x["known_gaps"]:
            print(f"  KNOWN GAP: {g}")
    print("\n  automated tests:")
    for r, files in x["test_files"].items():
        print(f"    {r}: {len(files)} files")
        for f in files:
            print(f"      {f}")
    for r, c in x["test_commands"].items():
        print(f"  cmd[{r}]: {c[:300]}{'...' if len(c) > 300 else ''}")
    return 0


def _junit(path: Path) -> list[dict]:
    """Parse JUnit XML (surefire / pytest / vitest) into testcase dicts."""
    out = []
    try:
        root = ET.parse(path).getroot()
    except (ET.ParseError, OSError):
        return out
    for tc in root.iter("testcase"):
        state = "passed"
        for tag in ("failure", "error"):
            if tc.find(tag) is not None:
                state = "failed"
        if tc.find("skipped") is not None:
            state = "skipped"
        msg = next((el.get("message") or (el.text or "")[:300] for el in tc if el.tag in ("failure", "error", "skipped")), "")
        out.append({"classname": tc.get("classname", ""), "name": tc.get("name", ""), "file": tc.get("file", ""),
                    "state": state, "message": (msg or "")[:300]})
    return out


def _owner(repo: str, case: dict, test_files: list[str]) -> str | None:
    """Which test file a JUnit case came from."""
    if repo == "intelligence-service":
        simple = case["classname"].split(".")[-1].split("$")[0]
        return next((t for t in test_files if Path(t).stem == simple), None)
    if repo == "lexie-ai":
        f = case["file"] or case["classname"].replace(".", "/") + ".py"
        return next((t for t in test_files if f.endswith(t) or t.endswith(f) or
                     Path(t).stem == case["classname"].split(".")[-1] or case["classname"].startswith(t[:-3].replace("/", "."))), None)
    return next((t for t in test_files if case["classname"].endswith(t) or t in case["classname"] or case["file"].endswith(t)), None)


def run_repo(repo: str, test_files: list[str] | None, out_dir: Path, dry: bool, timeout: int) -> dict:
    """Run tests for one repo (subset or whole suite) with JUnit output. Returns summary + cases."""
    rd = repos_root() / repo
    junit = out_dir / f"{repo}.xml"
    env = {**os.environ}
    if repo == "intelligence-service":
        cmd = ["mvn", "-q", "-B", "test", "-Dsurefire.failIfNoSpecifiedTests=false"]
        if test_files is not None:
            classes = sorted({Path(t).stem for t in test_files if t.endswith(".java")})
            if not classes:
                return {"repo": repo, "state": "no_tests", "cases": []}
            cmd.append("-Dtest=" + ",".join(classes))
    elif repo == "lexie-ai":
        py = str(venv() / "bin" / "python")
        if not Path(py).exists():
            py = sys.executable
        cmd = [py, "-m", "pytest", "-q", f"--junitxml={junit}", "-p", "no:cacheprovider"]
        if test_files is not None:
            files = [t for t in test_files if t.endswith(".py")]
            if not files:
                return {"repo": repo, "state": "no_tests", "cases": []}
            cmd += files
        # nothing injected: lexie-ai starts without OPENAI_API_KEY, and its bootstrap tests assert exactly
        # that degraded mode - a placeholder key would switch the LLM on and fail them
    else:
        cmd = ["npx", "vitest", "run", "--reporter=default", "--reporter=junit", f"--outputFile.junit={junit}"]
        if test_files is not None:
            files = [t for t in test_files if re.search(r"\.(test|spec)\.[tj]sx?$", t)]
            if not files:
                return {"repo": repo, "state": "no_tests", "cases": []}
            cmd += files
    printable = " ".join(cmd)
    if dry:
        print(f"[dry-run] (cd {rd} && {printable})")
        return {"repo": repo, "state": "dry_run", "command": printable, "cases": []}
    print(f"-> {repo}: {printable[:200]}{'...' if len(printable) > 200 else ''}", flush=True)
    if repo == "intelligence-service":  # surefire writes its own reports; clear stale ones first
        shutil.rmtree(rd / "target" / "surefire-reports", ignore_errors=True)
    try:
        p = subprocess.run(cmd, cwd=rd, env=env, capture_output=True, text=True, timeout=timeout)
        full = p.stdout + p.stderr
        rc, tail = p.returncode, full[-4000:]
    except subprocess.TimeoutExpired:
        return {"repo": repo, "state": "timeout", "command": printable, "cases": []}
    except FileNotFoundError as e:
        return {"repo": repo, "state": "env_error", "command": printable, "error": str(e), "cases": []}
    cases = []
    if repo == "intelligence-service":
        for x in sorted((rd / "target" / "surefire-reports").glob("TEST-*.xml")):
            cases += _junit(x)
    else:
        cases = _junit(junit)
    counts = {s: sum(1 for c in cases if c["state"] == s) for s in ("passed", "failed", "skipped")}
    # errors that are not a failed testcase: vitest unhandled errors, pytest collection errors
    unhandled = sorted(set(re.findall(r'originated in "([^"]+)"', full)) |
                       set(re.findall(r"ERROR collecting (\S+\.py)", full)))
    state = "passed" if rc == 0 and counts["failed"] == 0 else ("failed" if cases else "error")
    (out_dir / f"{repo}.log").write_text(tail)
    return {"repo": repo, "state": state, "exit_code": rc, "command": printable, "counts": counts, "cases": cases,
            "unhandled_error_files": unhandled,
            "log_tail": tail[-1500:] if state != "passed" else ""}


def verdict_for(feature: dict, repo_results: dict) -> dict:
    """Map repo-level JUnit cases onto one feature's test files."""
    per_repo, overall = {}, []
    for repo, files in feature["test_files"].items():
        rr = repo_results.get(repo)
        if not rr or rr["state"] in ("dry_run", "no_tests"):
            continue
        mine = [c for c in rr["cases"] if _owner(repo, c, files)]
        cnt = {s: sum(1 for c in mine if c["state"] == s) for s in ("passed", "failed", "skipped")}
        seen = {_owner(repo, c, files) for c in mine}
        errs = [f for f in rr.get("unhandled_error_files", []) if f in files]
        # non-zero exit with no failing case and nothing attributable: blame every feature in this run
        blind = rr["state"] == "failed" and not any(c["state"] == "failed" for c in rr["cases"]) \
            and not rr.get("unhandled_error_files")
        if rr["state"] in ("error", "timeout", "env_error") and not mine:
            v = "ERROR"
        elif errs or blind:
            v = "ERROR"
        elif cnt["failed"]:
            v = "FAIL"
        elif cnt["passed"]:
            v = "PASS"
        elif cnt["skipped"]:
            v = "SKIPPED"
        else:
            v = "NOT_RUN"
        per_repo[repo] = {"verdict": v, **cnt, "files_not_executed": sorted(set(files) - seen),
                          "failures": ([f"unhandled error raised while running {f} (see {repo}.log)" for f in errs] +
                                       (["runner exited non-zero with no failing testcase (see log)"] if blind else []) +
                                       [f"{c['classname']}::{c['name']} - {c['message']}" for c in mine if c["state"] == "failed"])[:20]}
        overall.append(v)
    order = ["ERROR", "FAIL", "NOT_RUN", "SKIPPED", "PASS"]
    top = next((o for o in order if o in overall), "NO_TESTS")
    return {"id": feature["id"], "title": feature.get("title") or feature.get("name"), "verdict": top, "repos": per_repo}


LAST_RUN: dict = {}


def _write(kind: str, payload: dict) -> Path:
    RESULTS.mkdir(exist_ok=True)
    ts = dt.datetime.now().strftime("%Y%m%d-%H%M%S")
    out = RESULTS / f"{ts}-{kind}.json"
    out.write_text(json.dumps(payload, indent=2, ensure_ascii=False))
    md = RESULTS / "RESULTS.md"
    if not md.exists():
        md.write_text("# Feature test results log\n\n| When | Command | Scope | Summary | Detail |\n|---|---|---|---|---|\n")
    with md.open("a") as fh:
        fh.write(f"| {ts} | {kind} | {payload.get('scope', '')} | {payload.get('summary', '')} | [{out.name}]({out.name}) |\n")
    LAST_RUN.clear()
    LAST_RUN.update({"file": out.name, "kind": kind, **payload})
    return out


def cmd_test(cat: dict, a, whole_suite: bool = False) -> int:
    targets = [resolve(cat, k) for k in a.keys] if not whole_suite else [{**f, "_kind": "feature"} for f in cat["features"]] + \
        [{**b, "_kind": "baseline"} for b in cat.get("baseline_features", [])] + \
        [{**m, "_kind": "module"} for m in cat["modules"]]
    repos = [a.repo] if a.repo else list(REPOS)
    work = RESULTS / ("junit-" + dt.datetime.now().strftime("%Y%m%d-%H%M%S"))
    if not a.dry_run:
        work.mkdir(parents=True, exist_ok=True)
    repo_results = {}
    for repo in repos:
        if whole_suite:
            repo_results[repo] = run_repo(repo, None, work, a.dry_run, a.timeout)
        else:
            files = sorted({t for x in targets for t in x["test_files"].get(repo, [])})
            if files:
                repo_results[repo] = run_repo(repo, files, work, a.dry_run, a.timeout)
    if a.dry_run:
        return 0
    verdicts = [verdict_for(t, repo_results) | {"kind": t["_kind"]} for t in targets]
    tally = {}
    for v in verdicts:
        tally[v["verdict"]] = tally.get(v["verdict"], 0) + 1
    print("\n== per-repo")
    for r, rr in repo_results.items():
        print(f"  {r:22} {rr['state']:10} {rr.get('counts', '')}")
        if rr["state"] in ("error", "env_error", "timeout"):
            print("   ", (rr.get("error") or rr.get("log_tail", ""))[-800:].replace("\n", "\n    "))
    print("\n== per-feature")
    for v in verdicts:
        if whole_suite and v["kind"] == "module":
            continue
        detail = "  ".join(f"{r[:5]}:{d['verdict']}({d['passed']}p/{d['failed']}f/{d['skipped']}s)" for r, d in v["repos"].items())
        print(f"  {v['id']:8} {v['verdict']:8} {detail}")
        for r, d in v["repos"].items():
            for f in d["failures"][:5]:
                print(f"      FAIL {f[:200]}")
    # a failing case no feature or module claims must still be seen
    orphans = []
    for repo, rr in repo_results.items():
        owned = {t for x in targets for t in x["test_files"].get(repo, [])}
        for c in rr.get("cases", []):
            if c["state"] == "failed" and not _owner(repo, c, sorted(owned)):
                orphans.append(f"{repo}: {c['classname']}::{c['name']} - {c['message'][:200]}")
    if orphans:
        tally["UNMAPPED_FAIL"] = len(orphans)
        print("\n== failures not mapped to any feature")
        for o in orphans:
            print("  FAIL", o)
    summary = ", ".join(f"{k}={n}" for k, n in sorted(tally.items()))
    out = _write("suite" if whole_suite else "test", {
        "unmapped_failures": orphans,
        "scope": "all" if whole_suite else " ".join(a.keys), "summary": summary, "branches": cat["branches"],
        "repos": {r: {k: v for k, v in rr.items() if k != "cases"} for r, rr in repo_results.items()},
        "verdicts": verdicts})
    print(f"\n{summary}\nresults -> {out}")
    return 0 if not orphans and all(v["verdict"] in ("PASS", "NO_TESTS", "SKIPPED") for v in verdicts) else 1


def _get(obj, path: str):
    for part in path.split("."):
        if isinstance(obj, dict) and part in obj:
            obj = obj[part]
        else:
            return KeyError
    return obj


def cmd_smoke(cat: dict, a) -> int:
    spec = json.loads(SMOKE.read_text())
    d = spec["defaults"]
    urls = {"SVC": os.environ.get("SVC_URL", d["SVC"]), "LEXIE": os.environ.get("LEXIE_URL", d["LEXIE"]),
            "OPA": os.environ.get("OPA_URL", d["OPA"]), "UI": os.environ.get("UI_URL", d["UI"])}
    m = re.match(r"(https?://[^/]+)", urls["UI"])
    urls["UI_ORIGIN"] = m.group(1) if m else urls["UI"]
    saved, results = {}, []
    for c in spec["checks"]:
        if a.only and not any(o.upper() == f.upper() or o in f for o in a.only for f in c["features"]) and c["id"] not in a.only:
            continue
        if c.get("mutating") and not a.allow_writes:
            results.append({"id": c["id"], "features": c["features"], "result": "SKIPPED", "why": "mutating (use --allow-writes)"})
            continue
        if c.get("depends_on") and c["depends_on"] not in saved.get("_ok", set()):
            results.append({"id": c["id"], "features": c["features"], "result": "SKIPPED", "why": f"depends on {c['depends_on']}"})
            continue
        url = c["url"].format(**urls, **{k: v for k, v in saved.items() if k != "_ok"})
        headers = {k: v for k, v in {**d["headers"], **c.get("headers", {})}.items() if v is not None}
        data = json.dumps(c["body"]).encode() if "body" in c else None
        req = urllib.request.Request(url, data=data, method=c["method"], headers=headers)
        status, body = None, ""
        try:
            with urllib.request.urlopen(req, timeout=a.timeout) as resp:
                status, body = resp.status, resp.read().decode("utf-8", "ignore")
        except urllib.error.HTTPError as e:
            status, body = e.code, e.read().decode("utf-8", "ignore")
        except (urllib.error.URLError, socket.timeout, ConnectionError) as e:
            results.append({"id": c["id"], "features": c["features"], "url": url, "result": "UNREACHABLE", "why": str(e)[:200]})
            continue
        problems = []
        exp = c.get("expect", {})
        if status not in exp.get("status", [200]):
            problems.append(f"status {status} not in {exp.get('status')}")
        js = None
        if exp.get("json") or exp.get("json_has") or c.get("save"):
            try:
                js = json.loads(body)
            except ValueError:
                problems.append("body is not JSON")
        if js is not None:
            for path, want in exp.get("json", {}).items():
                got = _get(js, path)
                if got != want:
                    problems.append(f"{path}={got if got is not KeyError else '<missing>'} want {want}")
            for path in exp.get("json_has", []):
                if _get(js, path) is KeyError:
                    problems.append(f"missing {path}")
            for k, path in c.get("save", {}).items():
                if _get(js, path) is not KeyError:
                    saved[k] = _get(js, path)
        for s in exp.get("body_contains", []):
            if s not in body:
                problems.append(f"body lacks '{s}'")
        ok = not problems
        if ok:
            saved.setdefault("_ok", set()).add(c["id"])
        results.append({"id": c["id"], "features": c["features"], "method": c["method"], "url": url, "status": status,
                        "result": "PASS" if ok else "FAIL", "problems": problems, "note": c.get("note"),
                        "body_head": "" if ok else body[:400]})
    tally = {}
    for r in results:
        tally[r["result"]] = tally.get(r["result"], 0) + 1
        print(f"  {r['result']:11} {r['id']:36} {','.join(r['features']):22} {'; '.join(r.get('problems', [])) or r.get('why', '')}")
    summary = ", ".join(f"{k}={n}" for k, n in sorted(tally.items()))
    out = _write("smoke", {"scope": " ".join(a.only or ["all"]), "summary": summary, "urls": urls, "checks": results})
    print(f"\n{summary}\nresults -> {out}")
    return 0 if tally.get("FAIL", 0) == 0 and tally.get("UNREACHABLE", 0) == 0 else 1


def cmd_preflight(cat: dict, a) -> int:
    for n, ok, d in preflight_rows(cat):
        print(f"  {'OK ' if ok else '-- '} {n:40} {d}")
    print("\nL0/L1 automated tests need: java+mvn, lexie venv, node_modules. L2 smoke needs the live services.")
    return 0


def preflight_rows(cat: dict) -> list[tuple[str, bool, str]]:
    root = repos_root()
    rows = []

    def chk(name, ok, detail=""):
        rows.append((name, ok, detail))

    for r in REPOS:
        rd = root / r
        if not rd.exists():
            chk(f"repo {r}", False, f"missing at {rd}")
            continue
        br = subprocess.run(["git", "-C", str(rd), "rev-parse", "--abbrev-ref", "HEAD"], capture_output=True, text=True).stdout.strip()
        hd = subprocess.run(["git", "-C", str(rd), "rev-parse", "--short", "HEAD"], capture_output=True, text=True).stdout.strip()
        exp = cat["branches"][r]
        chk(f"repo {r}", br == exp["branch"], f"on {br}@{hd}; catalog built from {exp['branch']}@{exp['head']}"
            + ("" if hd == exp["head"] else " -> HEAD moved: rebuild catalog"))
    chk("java", shutil.which("java") is not None, shutil.which("java") or "not on PATH")
    chk("mvn", shutil.which("mvn") is not None, shutil.which("mvn") or "not on PATH (intelligence-service tests)")
    py = venv() / "bin" / "python"
    has_pytest = py.exists() and subprocess.run([str(py), "-c", "import pytest"], capture_output=True).returncode == 0
    chk("lexie venv + pytest", has_pytest, str(py))
    chk("node/npx", shutil.which("npx") is not None, shutil.which("npx") or "not on PATH")
    chk("ui node_modules", (root / "intelligence-ui" / "node_modules" / "vitest").exists(), "npm ci in intelligence-ui if missing")
    chk("opa cli (optional, rego unit tests)", shutil.which("opa") is not None, shutil.which("opa") or "not installed; Docker OPA still works")
    for name, port in (("intelligence-service :8059", 8059), ("lexie-ai :5003", 5003), ("OPA :8181", 8181),
                       ("UI vite :5173", 5173), ("config-service :8888", 8888)):
        s = socket.socket()
        s.settimeout(0.5)
        ok = s.connect_ex(("127.0.0.1", port)) == 0
        s.close()
        chk(f"live {name}", ok, "listening" if ok else "not running (needed only for smoke / manual checks)")
    return rows


# ---------------------------------------------------------------- serve: the local testing page

UI_FILE = HERE / "testing_ui.html"
MANUAL = RESULTS / "manual_status.json"


def latest_results() -> dict:
    """Newest automated verdict per feature id and newest smoke result per check id, from results/*.json."""
    verdicts, smoke, runs = {}, {}, []
    for f in sorted(RESULTS.glob("*.json")):
        if f.name == MANUAL.name:
            continue
        try:
            payload = json.loads(f.read_text())
        except (ValueError, OSError):
            continue
        for v in payload.get("verdicts", []):
            verdicts[v["id"]] = {**v, "file": f.name}
        for c in payload.get("checks", []):
            smoke[c["id"]] = {**c, "file": f.name}
        runs.append({"file": f.name, "kind": f.stem.split("-", 2)[-1], "scope": payload.get("scope", ""),
                     "summary": payload.get("summary", ""), "unmapped_failures": payload.get("unmapped_failures", []),
                     "repos": {r: {k: v for k, v in d.items() if k in ("state", "counts", "exit_code")}
                               for r, d in payload.get("repos", {}).items()}})
    return {"verdicts": verdicts, "smoke": smoke, "runs": list(reversed(runs))}


def serve(cat: dict, port: int) -> int:
    import contextlib
    import io
    import threading
    import types
    import webbrowser
    from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

    jobs: dict[str, dict] = {}
    busy = threading.Lock()

    class Log(io.StringIO):
        def __init__(self, job):
            super().__init__()
            self.job = job

        def write(self, text):
            self.job["log"] += text
            sys.__stdout__.write(text)
            return len(text)

    def run_job(job, body):
        ns = types.SimpleNamespace(keys=body.get("keys") or [], repo=body.get("repo") or None, dry_run=False,
                                   timeout=int(body.get("timeout") or (30 if body["kind"] == "smoke" else 3600)),
                                   only=body.get("keys") or None, allow_writes=bool(body.get("allow_writes")))
        try:
            with contextlib.redirect_stdout(Log(job)):
                LAST_RUN.clear()
                if body["kind"] == "smoke":
                    job["rc"] = cmd_smoke(cat, ns)
                else:
                    job["rc"] = cmd_test(cat, ns, whole_suite=body["kind"] == "suite")
            job["result"] = dict(LAST_RUN)
            job["state"] = "done"
        except BaseException as e:  # a job must never take the server down
            job["log"] += f"\nERROR: {e!r}\n"
            job["state"] = "error"
        finally:
            busy.release()

    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *args):
            pass

        def _send(self, code, obj=None, raw=None, ctype="application/json"):
            data = raw if raw is not None else json.dumps(obj, default=str).encode()
            self.send_response(code)
            self.send_header("Content-Type", ctype)
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(data)

        def _body(self):
            n = int(self.headers.get("Content-Length") or 0)
            return json.loads(self.rfile.read(n) or b"{}")

        def do_GET(self):
            path = self.path.split("?", 1)[0]
            if path in ("/", "/index.html"):
                return self._send(200, raw=UI_FILE.read_bytes(), ctype="text/html; charset=utf-8")
            if path == "/api/catalog":
                return self._send(200, raw=CATALOG.read_bytes())
            if path == "/api/smoke-spec":
                return self._send(200, raw=SMOKE.read_bytes())
            if path == "/api/preflight":
                return self._send(200, [{"name": n, "ok": ok, "detail": d} for n, ok, d in preflight_rows(cat)])
            if path == "/api/latest":
                return self._send(200, latest_results())
            if path == "/api/manual":
                return self._send(200, json.loads(MANUAL.read_text()) if MANUAL.exists() else {})
            if path.startswith("/api/jobs/"):
                job = jobs.get(path.rsplit("/", 1)[-1])
                return self._send(200, job) if job else self._send(404, {"error": "no such job"})
            return self._send(404, {"error": "not found"})

        def do_POST(self):
            path = self.path.split("?", 1)[0]
            if path == "/api/rebuild":
                # regenerate the list from the repos, then serve the new catalog to this and every later run
                if not busy.acquire(blocking=False):
                    return self._send(409, {"error": "a run is in progress; rebuild after it finishes"})
                try:
                    p = subprocess.run([sys.executable, str(HERE / "tools" / "build_feature_catalog.py")],
                                       capture_output=True, text=True, timeout=600)
                    if p.returncode != 0:
                        return self._send(500, {"error": (p.stderr or p.stdout)[-800:]})
                    cat.clear()
                    cat.update(load())
                    return self._send(200, {"rebuilt": True, "output": p.stdout.strip()[-400:]})
                finally:
                    busy.release()
            if path == "/api/manual":
                RESULTS.mkdir(exist_ok=True)
                MANUAL.write_text(json.dumps(self._body(), indent=2, ensure_ascii=False))
                return self._send(200, {"saved": True})
            if path == "/api/run":
                body = self._body()
                if body.get("kind") not in ("test", "suite", "smoke"):
                    return self._send(400, {"error": "kind must be test, suite or smoke"})
                if body["kind"] == "test" and not body.get("keys"):
                    return self._send(400, {"error": "test needs keys"})
                if not busy.acquire(blocking=False):
                    return self._send(409, {"error": "a run is already in progress"})
                jid = dt.datetime.now().strftime("%H%M%S%f")
                jobs[jid] = {"id": jid, "state": "running", "log": "", "request": body,
                             "started": dt.datetime.now().isoformat(timespec="seconds")}
                threading.Thread(target=run_job, args=(jobs[jid], body), daemon=True).start()
                return self._send(202, {"job": jid})
            return self._send(404, {"error": "not found"})

    httpd = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    url = f"http://127.0.0.1:{port}/"
    print(f"Feature testing page: {url}   (Ctrl+C to stop)")
    with contextlib.suppress(Exception):
        webbrowser.open(url)
    with contextlib.suppress(KeyboardInterrupt):
        httpd.serve_forever()
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("list"); p.add_argument("--domain"); p.add_argument("--uc")
    p = sub.add_parser("show"); p.add_argument("key"); p.add_argument("--json", action="store_true")
    for name in ("test", "suite"):
        p = sub.add_parser(name)
        if name == "test":
            p.add_argument("keys", nargs="+", help="LP-14, LP-14.2, module:impact ...")
        p.add_argument("--repo", choices=REPOS)
        p.add_argument("--dry-run", action="store_true")
        p.add_argument("--timeout", type=int, default=3600)
    p = sub.add_parser("smoke"); p.add_argument("--only", nargs="*"); p.add_argument("--allow-writes", action="store_true")
    p.add_argument("--timeout", type=int, default=30)
    sub.add_parser("preflight")
    p = sub.add_parser("serve", help="open the local testing page"); p.add_argument("--port", type=int, default=8765)
    a = ap.parse_args()
    cat = load()
    if a.cmd == "list":
        return cmd_list(cat, a)
    if a.cmd == "show":
        return cmd_show(cat, a)
    if a.cmd == "test":
        return cmd_test(cat, a)
    if a.cmd == "suite":
        return cmd_test(cat, a, whole_suite=True)
    if a.cmd == "smoke":
        return cmd_smoke(cat, a)
    if a.cmd == "serve":
        return serve(cat, a.port)
    return cmd_preflight(cat, a)


if __name__ == "__main__":
    sys.exit(main())
