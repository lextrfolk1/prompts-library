#!/usr/bin/env python3
"""Build feature_catalog.json and FEATURES.md: the functional features of Lextr Intelligence and how to test them.

The features themselves are defined in tools/features.json (what a user can do, anchored to code).
Everything else is derived from the code on the checked-out branches:
  - endpoints        from the Spring controllers and lexie-ai's FastAPI routers
  - test files       expanded from each feature's test path prefixes
  - UI wiring        every URL the feature's UI code calls, checked against the real endpoints
  - live checks      smoke_checks.json entries whose URL hits one of the feature's endpoints
  - status           a plain label (Available / UI calls a missing endpoint / API only / ...)

Usage: python3 tools/build_feature_catalog.py [--repos /Users/tejal/codebase/lextrai]
Read-only against the repos; re-run after the code changes.
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT_DIR = HERE.parent
REPOS = ("intelligence-service", "lexie-ai", "intelligence-ui")
SVC_TEST_ROOT = "src/test/java/com/lextr/intelligence/"


def git(repo: Path, *args: str) -> str:
    return subprocess.run(["git", "-C", str(repo), *args], capture_output=True, text=True, check=True).stdout.strip()


def norm(path: str) -> str:
    """Comparable URL path: template variables -> {}, no query, no trailing slash."""
    path = path.split("?", 1)[0]
    return re.sub(r"\$\{[^}]*\}|\{[^}]*\}", "{}", path).rstrip("/") or "/"


# ---------------------------------------------------------------- endpoints

def service_endpoints(svc: Path) -> dict[str, list[str]]:
    """Controller class name -> ['POST /api/v1/impact/run', ...]."""
    out = {}
    for f in sorted((svc / "src/main/java").rglob("*Controller.java")):
        src = f.read_text(encoding="utf-8", errors="ignore")
        m = re.search(r'@RequestMapping\(\s*(?:value\s*=\s*|path\s*=\s*)?"([^"]*)"', src)
        base = m.group(1) if m else ""
        eps = []
        for mm in re.finditer(r'@(Get|Post|Put|Patch|Delete)Mapping(\([^)]*\))?', src):
            # @XMapping, @XMapping("/p"), @XMapping(value = "/p"), @XMapping({"", "/"}): take the first quoted path
            q = re.search(r'"([^"]*)"', mm.group(2) or "")
            eps.append(f"{mm.group(1).upper()} {base}{q.group(1) if q else ''}")
        out[f.stem] = eps
    return out


def lexie_endpoints(lexie: Path) -> dict[str, list[str]]:
    """Route file -> ['POST /api/v1/variance/cycles', ...] with include_router and APIRouter prefixes applied."""
    app_py = (lexie / "app.py").read_text(encoding="utf-8", errors="ignore")
    out = {}
    for f in sorted((lexie / "routes").glob("*.py")):
        src = f.read_text(encoding="utf-8", errors="ignore")
        eps = []
        for mm in re.finditer(r'@(\w+)\.(get|post|put|delete|patch)\(\s*[\'"]([^\'"]*)[\'"]', src):
            var = mm.group(1)
            own = re.search(rf'{var}\s*=\s*APIRouter\([^)]*prefix\s*=\s*[\'"]([^\'"]*)', src)
            mounted = re.search(rf'include_router\(\s*{var}\b[^)]*prefix\s*=\s*[\'"]([^\'"]*)', app_py)
            eps.append(f"{mm.group(2).upper()} {(mounted.group(1) if mounted else '')}{(own.group(1) if own else '')}{mm.group(3)}")
        out[f"routes/{f.name}"] = eps
    return out


# ---------------------------------------------------------------- UI wiring

# absolute API paths only; a helper's relative path such as "/runs" (joined to a BASE elsewhere) is not an endpoint
URL_RE = re.compile(r"""[`'"]((?:\$\{BASE\})?/(?:api/|run(?=[/?`'"])|knowledge(?=[/?`'"]))[^`'"\s]{0,120})[`'"]""")


def ui_calls(ui: Path, feature: dict) -> list[str]:
    files = []
    for s in feature.get("ui", {}).get("slices", []):
        files += [p for p in (ui / "src/features" / s).rglob("*.ts*") if "__tests__" not in p.parts]
    files += [ui / f for f in feature.get("ui", {}).get("files", []) if (ui / f).exists()]
    urls = set()
    for f in files:
        src = f.read_text(encoding="utf-8", errors="ignore")
        base = re.search(r'const BASE\s*=\s*`[^`]*?(/[^`]*)`', src)
        for u in URL_RE.findall(src):
            if u.startswith("${BASE}"):
                if not base:
                    continue
                u = base.group(1) + u[len("${BASE}"):]
            urls.add(u)
    return sorted(urls)


def classify_call(url: str, svc_paths: set[str], lexie_paths: set[str]) -> str:
    n = norm(url)
    if n in svc_paths:
        return "ok"
    if n in lexie_paths:
        # the dev server proxies /api to intelligence-service, which does not serve lexie-ai's routes
        return "lexie-only"
    return "missing"


# ---------------------------------------------------------------- tests

def all_test_files(root: Path) -> dict[str, list[str]]:
    svc = sorted(str(p.relative_to(root / "intelligence-service"))
                 for p in (root / "intelligence-service" / SVC_TEST_ROOT).rglob("*Test.java"))
    lexie = sorted(str(p.relative_to(root / "lexie-ai")) for p in (root / "lexie-ai/tests").rglob("test_*.py"))
    ui = sorted(str(p.relative_to(root / "intelligence-ui")) for p in (root / "intelligence-ui/src").rglob("*.test.ts*"))
    return {"intelligence-service": svc, "lexie-ai": lexie, "intelligence-ui": ui}


def expand_tests(prefixes: dict, files: dict) -> dict[str, list[str]]:
    out = {}
    for repo, pre in prefixes.items():
        pre = [SVC_TEST_ROOT + p if repo == "intelligence-service" else p for p in pre]
        hit = sorted(f for f in files[repo] if f.startswith(tuple(pre))) if pre else []
        if hit:
            out[repo] = hit
    return out


def test_command(repo: str, tests: list[str], venv: str) -> str:
    if repo == "intelligence-service":
        return ("cd intelligence-service && mvn -q test -Dsurefire.failIfNoSpecifiedTests=false "
                f"-Dtest='{','.join(sorted({Path(t).stem for t in tests}))}'")
    if repo == "lexie-ai":
        return f"cd lexie-ai && {venv}/bin/python -m pytest -q {' '.join(tests)}"
    return f"cd intelligence-ui && npx vitest run {' '.join(tests)}"


# ---------------------------------------------------------------- prototype parity

def real_screens(ui: Path) -> dict[str, str]:
    """Real UI destinations: mount id -> label, from every feature slice's mount/registration and the shell."""
    out = {}
    for f in list((ui / "src/features").glob("*/mount.tsx")) + list((ui / "src/features").glob("*/index.ts")) + [ui / "src/shell/shellMounts.tsx"]:
        src = f.read_text(encoding="utf-8", errors="ignore")
        for m in re.finditer(r'\bid:\s*"([a-z0-9-]+)"', src):
            lab = re.search(r'label:\s*"([^"]+)"', src[m.start():m.start() + 400])
            out.setdefault(m.group(1), lab.group(1) if lab else m.group(1))
    for slice_dir in (ui / "src/features").iterdir():  # an id declared in index.ts takes its label from the slice's mount.tsx
        mt = slice_dir / "mount.tsx"
        if slice_dir.name in out and out[slice_dir.name] == slice_dir.name and mt.exists():
            lab = re.search(r'label:\s*"([^"]+)"', mt.read_text(encoding="utf-8", errors="ignore"))
            if lab:
                out[slice_dir.name] = lab.group(1)
    return out


def prototype_screens(pkg: Path, proto: dict, real: dict) -> dict:
    src = (pkg / proto["file"]).read_text(encoding="utf-8", errors="ignore")
    out = {}
    for sid, s in proto["screens"].items():
        m = re.search(rf'^(?:function|const) {s["component"]}\b', src, re.M)
        rs = s.get("real_screen")
        if s.get("real_overlay"):
            parity = "Overlay (not a sidebar screen)"
        elif rs and rs in real:
            parity = "Placeholder in real UI" if s.get("placeholder") else "Screen present"
        else:
            parity = "Missing in real UI"
        out[sid] = {**s, "id": sid, "line": src[:m.start()].count("\n") + 1 if m else None,
                    "real_label": real.get(rs), "parity": parity}
    return out


# ---------------------------------------------------------------- status

def status_of(f: dict) -> str:
    where = f.get("where", "")
    issues = " ".join(f.get("known_issues", []))
    if any(c["status"] != "ok" for c in f["ui_calls"]):
        return "UI calls a missing endpoint"
    if "RUN_ADAPTER_UNBOUND" in issues:
        return "Refused until Core adapter exists"
    if "sample data" in issues.lower():
        return "API works; UI shows sample data" if f["endpoints"] else "UI shows sample data only"
    if where.startswith("Lexie panel"):
        return "API only (Lexie panel not live)"
    if where.startswith(("Not mounted", "Not on any screen")):
        return "API only (UI not mounted)"
    if where.startswith(("No screen", "No Intelligence screen")):
        return "API only"
    return "Available"


# ---------------------------------------------------------------- build

def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--repos", default="/Users/tejal/codebase/lextrai")
    ap.add_argument("--venv", default="../.venv-lexie-ai", help="lexie-ai venv, relative to lexie-ai/")
    a = ap.parse_args()
    root = Path(a.repos)
    spec = json.loads((HERE / "features.json").read_text())
    smoke = json.loads((OUT_DIR / "smoke_checks.json").read_text())

    svc_eps = service_endpoints(root / "intelligence-service")
    lex_eps = lexie_endpoints(root / "lexie-ai")
    svc_paths = {norm(e.split(" ", 1)[1]) for eps in svc_eps.values() for e in eps}
    lex_paths = {norm(e.split(" ", 1)[1]) for eps in lex_eps.values() for e in eps}
    tests = all_test_files(root)
    real = real_screens(root / "intelligence-ui")
    proto = prototype_screens(OUT_DIR.parent, spec["prototype"], real) if spec.get("prototype") else {}

    features = []
    for d in spec["features"]:
        eps = []
        for c in d.get("service", []):
            if c not in svc_eps:
                raise SystemExit(f"{d['id']}: no controller {c}")
            eps += [{"repo": "intelligence-service", "endpoint": e} for e in svc_eps[c]]
        for r in d.get("lexie", []):
            if r["file"] not in lex_eps:
                raise SystemExit(f"{d['id']}: no lexie route file {r['file']}")
            for e in lex_eps[r["file"]]:
                if not r.get("match") or re.search(r["match"], e.split(" ", 1)[1]):
                    eps.append({"repo": "lexie-ai", "endpoint": e})
        if d.get("lexie_run"):
            eps.append({"repo": "lexie-ai", "endpoint": f"POST /run  (use_case {d['lexie_run']})"})
        calls = [{"url": u, "status": classify_call(u, svc_paths, lex_paths)} for u in ui_calls(root / "intelligence-ui", d)]
        tf = expand_tests(d.get("tests", {}), tests)
        missing_tests = {r: [p for p in pre if not any(t.startswith((SVC_TEST_ROOT + p) if r == "intelligence-service" else p)
                                                        for t in tests[r])]
                         for r, pre in d.get("tests", {}).items()}
        ep_paths = {norm(e["endpoint"].split(" ", 1)[1].split("  ")[0]) for e in eps}
        checks = []
        for c in smoke["checks"]:
            if norm(re.sub(r"^\{[A-Z_]+\}", "", c["url"])) not in ep_paths:
                continue
            uc = (c.get("body") or {}).get("use_case")
            # a /run check belongs to the use case it sends, not to every feature that has a /run endpoint
            if uc and norm(re.sub(r"^\{[A-Z_]+\}", "", c["url"])) == "/run" and d["id"] != "run-api" and d.get("lexie_run") != uc:
                continue
            checks.append(c["id"])
        f = {
            "id": d["id"], "name": d["name"], "area": d["area"], "what": d["what"],
            "where": d.get("ui", {}).get("where", ""),
            "ui_calls": calls,
            "endpoints": eps,
            "steps": d.get("steps", []), "expect": d.get("expect", []),
            "known_issues": d.get("known_issues", []),
            "built_by": d.get("built_by", []),
            "test_files": tf,
            "test_prefixes_matching_nothing": {r: v for r, v in missing_tests.items() if v},
            "test_commands": {r: test_command(r, v, a.venv) for r, v in tf.items()},
            "smoke_checks": checks,
            "prototype": ({**d["prototype"], **{k: proto[d["prototype"]["screen"]][k] for k in ("label", "group", "line", "parity", "real_label")},
                           "real_note": proto[d["prototype"]["screen"]].get("real_note")} if d.get("prototype") else None),
        }
        f["status"] = status_of(f)
        features.append(f)

    branches = {r: {"branch": git(root / r, "rev-parse", "--abbrev-ref", "HEAD"), "head": git(root / r, "rev-parse", "--short", "HEAD")}
                for r in REPOS}
    statuses: dict[str, int] = {}
    for f in features:
        statuses[f["status"]] = statuses.get(f["status"], 0) + 1
    catalog = {
        "schema": "lextr-feature-catalog/2",
        "generated_by": "feature-testing/tools/build_feature_catalog.py",
        "branches": branches,
        "areas": spec["areas"],
        "totals": {"features": len(features), "with_automated_tests": sum(1 for f in features if f["test_files"]),
                   "with_live_checks": sum(1 for f in features if f["smoke_checks"]), "by_status": statuses},
        "not_features": spec["_readme"].split("Not listed on purpose: ", 1)[-1].split(" - they support", 1)[0],
        "prototype": {"file": spec["prototype"]["file"], "screens": list(proto.values()),
                      "real_screens_not_in_prototype": sorted(
                          f"{lab} ({rid})" for rid, lab in real.items()
                          if rid not in {p.get("real_screen") for p in proto.values()} and rid != "surfaces")} if proto else None,
        "features": features,
    }
    (OUT_DIR / "feature_catalog.json").write_text(json.dumps(catalog, indent=2, ensure_ascii=False) + "\n")
    (OUT_DIR / "FEATURES.md").write_text(render_markdown(catalog))
    print(json.dumps(catalog["totals"]), "->", OUT_DIR / "feature_catalog.json", "+ FEATURES.md")


def render_markdown(c: dict) -> str:
    L = ["# Lextr Intelligence — features and how to test them", "",
         "_Generated by `tools/build_feature_catalog.py` from `tools/features.json` and the code; do not edit by hand._", "",
         "Only things a user or an integrating system can **do**. Not listed on purpose: " + c["not_features"] + ".", "",
         "Code: " + " · ".join(f"`{r}` {b['branch']}@{b['head']}" for r, b in c["branches"].items()), "",
         f"**{c['totals']['features']} features** · {c['totals']['with_automated_tests']} with automated tests · "
         f"{c['totals']['with_live_checks']} with live checks", "",
         "| Status | Features |", "|---|---|"]
    for s, n in sorted(c["totals"]["by_status"].items(), key=lambda x: -x[1]):
        L.append(f"| {s} | {n} |")
    if c.get("prototype"):
        pr = c["prototype"]
        L += ["", "## UI compared with the prototype", "",
              f"Reference: `{pr['file']}`, the approved UI prototype. Each prototype screen, and whether the real intelligence-ui has it:", "",
              "| Prototype screen | Group | Real UI | Prototype line |", "|---|---|---|---|"]
        for p in pr["screens"]:
            real = f"{p['parity']}" + (f" — {p['real_label']}" if p.get("real_label") else "") + (f" ({p['real_note']})" if p.get("real_note") else "")
            L.append(f"| {p['label']} | {p['group']} | {real} | {p['line'] or '—'} |")
        if pr["real_screens_not_in_prototype"]:
            L += ["", "Real UI screens with no prototype screen: " + ", ".join(pr["real_screens_not_in_prototype"]) + "."]
    for area in c["areas"]:
        fs = [f for f in c["features"] if f["area"] == area]
        if not fs:
            continue
        L += ["", f"## {area}", "", "| Feature | Where | Status | Tests |", "|---|---|---|---|"]
        for f in fs:
            n = sum(len(v) for v in f["test_files"].values())
            L.append(f"| [{f['name']}](#{f['id']}) | {f['where']} | {f['status']} | {n or '—'} |")
    L += ["", "## Feature detail", ""]
    for f in c["features"]:
        L += [f'<a id="{f["id"]}"></a>', f"### {f['name']}", "", f"`{f['id']}` · {f['area']} · **{f['status']}**", "",
              f["what"], "", f"**Where:** {f['where']}", ""]
        if f["known_issues"]:
            L += ["**Known issues**", ""] + [f"- ⚠ {x}" for x in f["known_issues"]] + [""]
        bad = [x for x in f["ui_calls"] if x["status"] != "ok"]
        if bad:
            L += ["**UI calls that do not reach a service**", ""] + [
                f"- `{x['url']}` — " + ("a lexie-ai route; the dev proxy sends it to intelligence-service" if x["status"] == "lexie-only" else "no service exposes it")
                for x in bad] + [""]
        if f.get("prototype"):
            pr = f["prototype"]
            L += [f"**Prototype: {pr['label']}** — {pr['parity']} (prototype line {pr['line']}). The prototype says this screen lets you:", ""] + \
                 [f"- [ ] {x}" for x in pr["does"]] + [""]
        L += ["**How to test**", ""] + [f"{i}. {s}" for i, s in enumerate(f["steps"], 1)] + [""]
        if f["expect"]:
            L += ["**Expected**", ""] + [f"- [ ] {x}" for x in f["expect"]] + [""]
        for r in f["test_commands"]:
            L.append(f"- Automated ({r}, {len(f['test_files'][r])} files): `python3 run_feature_tests.py test {f['id']} --repo {r}`")
        if not f["test_commands"]:
            L.append("- No automated tests.")
        if f["smoke_checks"]:
            L.append(f"- Live checks: `python3 run_feature_tests.py smoke --only {f['id']}` ({', '.join(f['smoke_checks'])})")
        if f["endpoints"]:
            L.append("- Endpoints: " + "; ".join(f"`{e['endpoint']}`" for e in f["endpoints"]))
        if f["built_by"]:
            L.append("- Built by prompts: " + ", ".join(f["built_by"]))
        L.append("")
    return "\n".join(L) + "\n"


if __name__ == "__main__":
    main()
