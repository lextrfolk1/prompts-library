#!/usr/bin/env python3
"""Build feature_catalog.json: what each prompt (logic point) added, where, and how to test it.

Joins five sources:
  1. files/prompts_by_wave.json           - the 59 logic points, 251 sub-tasks, tests_must_cover
  2. prompts/PROGRESS_TRACKER.md          - per-prompt status, evidence commits, notes/risks
  3. git diff <base>...<head> per repo    - files the branch added/modified, mapped to LP ids
  4. controllers / FastAPI routers        - HTTP endpoints each LP exposes
  5. intelligence-ui src/features/*/mount - UI screens (sidebar id + label)
plus feature-testing/tools/feature_summaries.json (hand-written plain-English summaries + manual checks).

Usage:
  python3 tools/build_feature_catalog.py [--repos /Users/tejal/codebase/lextrai] [--base main] [--head HEAD]
Re-run after any branch change; it is deterministic and read-only against the repos.
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
from collections import defaultdict
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT_DIR = HERE.parent
PKG = OUT_DIR.parent
REPOS = ("intelligence-service", "lexie-ai", "intelligence-ui")

LP_RE = re.compile(r"LP-(\d{2})(?:\.(\d{1,2}))?")
LP_PATH_RE = re.compile(r"lp[-_]?(\d{2})(?:[._](\d{1,2}))?", re.I)
UC_RE = re.compile(r"\bUC(1[0-2]|[1-9])(a|b)?\b")


def git(repo: Path, *args: str) -> str:
    return subprocess.run(["git", "-C", str(repo), *args], capture_output=True, text=True, check=True).stdout


def is_test(repo: str, path: str) -> bool:
    if repo == "intelligence-service":
        return path.startswith("src/test/")
    if repo == "lexie-ai":
        return path.startswith("tests/") or Path(path).name.startswith("test_")
    return bool(re.search(r"\.(test|spec)\.[tj]sx?$", path)) or "/__tests__/" in path


def kind_of(repo: str, path: str) -> str:
    p = path.lower()
    if is_test(repo, path):
        return "test"
    if p.endswith(".sql"):
        return "migration"
    if p.endswith(".rego"):
        return "policy"
    if p.endswith(".md"):
        return "doc"
    if "controller" in p or p.startswith("routes/"):
        return "api"
    if repo == "intelligence-ui" and p.startswith("src/"):
        return "ui"
    if p.endswith((".json", ".yaml", ".yml", ".properties", ".xml", ".toml", ".sh")):
        return "config"
    return "source"


def lp_refs(repo_dir: Path, path: str) -> dict[str, set[str]]:
    """{point_id: {sub_ids}} referenced by file content or path."""
    refs: dict[str, set[str]] = defaultdict(set)
    f = repo_dir / path
    text = ""
    if f.is_file() and f.stat().st_size < 2_000_000:
        try:
            text = f.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            pass
    for m in LP_RE.finditer(text):
        pid = f"LP-{m.group(1)}"
        refs[pid]
        if m.group(2):
            refs[pid].add(f"{pid}.{m.group(2)}")
    for m in LP_PATH_RE.finditer(path):
        pid = f"LP-{m.group(1)}"
        refs[pid]
        if m.group(2):
            refs[pid].add(f"{pid}.{m.group(2)}")
    return refs


def header_refs(repo_dir: Path, path: str, lines: int = 30) -> set[str]:
    """LP ids named in the file's header/docstring - the point the file declares it belongs to."""
    f = repo_dir / path
    try:
        head = "\n".join(f.read_text(encoding="utf-8", errors="ignore").splitlines()[:lines])
    except OSError:
        return set()
    return {f"LP-{m.group(1)}" for m in LP_RE.finditer(head)}


def commit_map(repo_dir: Path, base: str, head: str) -> dict[str, set[str]]:
    """path -> LP ids named in the subject of a commit that touched it (only subjects naming exactly one point)."""
    out: dict[str, set[str]] = defaultdict(set)
    log = git(repo_dir, "log", "--name-only", "--format=@@%s", f"{base}..{head}")
    current: set[str] = set()
    for line in log.splitlines():
        if line.startswith("@@"):
            ids = {f"LP-{m.group(1)}" for m in LP_RE.finditer(line)}
            current = ids if len(ids) == 1 else set()  # bulk multi-LP commits are ambiguous
        elif line.strip() and current:
            out[line.strip()] |= current
    return out


def endpoints_in(repo: str, repo_dir: Path, path: str) -> list[str]:
    f = repo_dir / path
    if not f.is_file():
        return []
    src = f.read_text(encoding="utf-8", errors="ignore")
    out = []
    if repo == "intelligence-service" and path.endswith("Controller.java"):
        base = ""
        m = re.search(r'@RequestMapping\(\s*(?:value\s*=\s*|path\s*=\s*)?"([^"]*)"', src)
        if m:
            base = m.group(1)
        for mm in re.finditer(r'@(Get|Post|Put|Patch|Delete)Mapping(?:\(\s*(?:value\s*=\s*|path\s*=\s*)?"?([^")]*)"?[^)]*\))?', src):
            out.append(f"{mm.group(1).upper()} {base}{mm.group(2) or ''}")
    elif repo == "lexie-ai" and path.startswith("routes/") and path.endswith(".py"):
        # full URL = include_router prefix (app.py) + APIRouter prefix (this file) + route path
        app_py = (repo_dir / "app.py").read_text(encoding="utf-8", errors="ignore") if (repo_dir / "app.py").exists() else ""
        for mm in re.finditer(r'@(\w+)\.(get|post|put|delete|patch)\(\s*[\'"]([^\'"]*)[\'"]', src):
            var = mm.group(1)
            own = re.search(rf'{var}\s*=\s*APIRouter\([^)]*prefix\s*=\s*[\'"]([^\'"]*)', src)
            mounted = re.search(rf'include_router\(\s*{var}\b[^)]*prefix\s*=\s*[\'"]([^\'"]*)', app_py)
            url = (mounted.group(1) if mounted else "") + (own.group(1) if own else "") + mm.group(3)
            out.append(f"{mm.group(2).upper()} {url}")
    return out


def ui_mounts(ui_dir: Path) -> dict[str, dict]:
    mounts = {}
    for f in sorted((ui_dir / "src" / "features").glob("*/mount.tsx")):
        src = f.read_text(encoding="utf-8", errors="ignore")
        g = lambda k: (re.search(rf'{k}:\s*["\']([^"\']+)["\']', src) or [None, None])[1]
        mounts[f.parent.name] = {
            "slice": f.parent.name,
            "screen_id": g("id"),
            "label": g("label"),
            "group": g("group"),
            "path": str(f.relative_to(ui_dir)),
        }
    return mounts


def parse_tracker(path: Path) -> dict[str, dict]:
    rows = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        m = re.match(r"\|\s*`(LP-\d{2}\.\d{1,2})_(\w+)`\s*\|(.*)", line)
        if not m:
            continue
        cells = [c.strip() for c in m.group(3).split("|")]
        if len(cells) < 7:
            continue
        rows[m.group(1)] = {
            "prompt_file_lang": m.group(2),
            "target_repo": cells[0].strip("`"),
            "tracker_scope": cells[1],
            "status": cells[3].strip("`"),
            "evidence": cells[4],
            "last_updated": cells[5],
            "notes_risks": cells[6],
        }
    return rows


def test_command(repo: str, tests: list[str], venv: str) -> str | None:
    if not tests:
        return None
    if repo == "intelligence-service":
        classes = sorted({Path(t).stem for t in tests if t.endswith(".java")})
        if not classes:
            return None
        return (f"cd intelligence-service && mvn -q test -Dsurefire.failIfNoSpecifiedTests=false "
                f"-Dtest='{','.join(classes)}'")
    if repo == "lexie-ai":
        py = sorted(t for t in tests if t.endswith(".py") and Path(t).name.startswith("test_"))
        return f"cd lexie-ai && {venv}/bin/pytest -q {' '.join(py)}" if py else None
    ts = sorted(t for t in tests if re.search(r"\.(test|spec)\.[tj]sx?$", t))
    return f"cd intelligence-ui && npx vitest run {' '.join(ts)}" if ts else None


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--repos", default="/Users/tejal/codebase/lextrai")
    ap.add_argument("--base", default="main")
    ap.add_argument("--head", default="HEAD")
    ap.add_argument("--venv", default="../.venv-lexie-ai", help="lexie-ai venv, relative to lexie-ai/")
    a = ap.parse_args()
    root = Path(a.repos)

    waves = json.loads((PKG / "files" / "prompts_by_wave.json").read_text())
    tracker = parse_tracker(PKG / "prompts" / "PROGRESS_TRACKER.md")
    summaries_path = HERE / "feature_summaries.json"
    summaries = json.loads(summaries_path.read_text()) if summaries_path.exists() else {}

    branch_info, per_point_files, per_point_eps, unmapped = {}, defaultdict(list), defaultdict(list), {}
    uc_by_point: dict[str, set[str]] = defaultdict(set)
    for repo in REPOS:
        rd = root / repo
        head_name = git(rd, "rev-parse", "--abbrev-ref", a.head).strip()
        ns = [l.split("\t") for l in git(rd, "diff", "--name-status", f"{a.base}...{a.head}").splitlines() if l]
        branch_info[repo] = {
            "branch": head_name,
            "head": git(rd, "rev-parse", "--short", a.head).strip(),
            "base": a.base,
            "commits_ahead": int(git(rd, "rev-list", "--count", f"{a.base}..{a.head}").strip()),
            "files_changed": len(ns),
            "shortstat": git(rd, "diff", "--shortstat", f"{a.base}...{a.head}").strip(),
            "commits": git(rd, "log", "--format=%h %s", f"{a.base}..{a.head}").splitlines(),
        }
        unmapped[repo] = []
        cmap = commit_map(rd, a.base, a.head)
        for st, *paths in ns:
            path = paths[-1]
            if st.startswith("D") or "__pycache__" in path or path.endswith((".pyc", ".class")):
                continue
            refs = lp_refs(rd, path)
            for pid in cmap.get(path, ()):
                refs[pid]
            hdr = header_refs(rd, path) | cmap.get(path, set())
            if not refs:
                unmapped[repo].append(path)
                continue
            eps = endpoints_in(repo, rd, path)
            try:
                ucs = set(UC_RE.findall((rd / path).read_text(encoding="utf-8", errors="ignore")))
            except OSError:
                ucs = set()
            for pid, subs in refs.items():
                per_point_files[pid].append({
                    "repo": repo, "path": path, "status": st[0], "kind": kind_of(repo, path),
                    "subtasks": sorted(subs), "points_in_file": len(refs),
                    "primary": len(refs) <= 3 or pid in hdr,
                })
                for e in eps:
                    per_point_eps[pid].append({"repo": repo, "endpoint": e, "file": path})
                if len(refs) <= 2:
                    uc_by_point[pid] |= {f"UC{n}{s}" for n, s in ucs}

    mounts = ui_mounts(root / "intelligence-ui")
    mount_points = defaultdict(list)
    for slice_name, m in mounts.items():
        feat_dir = root / "intelligence-ui" / "src" / "features" / slice_name
        refs: dict[str, int] = defaultdict(int)
        for f in feat_dir.rglob("*.ts*"):
            for mm in LP_RE.finditer(f.read_text(encoding="utf-8", errors="ignore")):
                refs[f"LP-{mm.group(1)}"] += 1
        for pid, n in refs.items():
            if pid != "LP-47" or slice_name in ("rules",):
                mount_points[pid].append({**m, "lp_mentions": n})

    features = []
    for w in waves:
        for p in w["points"]:
            pid = p["id"]
            files = sorted(per_point_files.get(pid, []), key=lambda x: (x["points_in_file"], x["repo"], x["path"]))
            primary = [f for f in files if f["primary"]]
            tests_by_repo = defaultdict(list)
            for f in primary:
                if f["kind"] == "test":
                    tests_by_repo[f["repo"]].append(f["path"])
            cmds = {r: c for r in REPOS if (c := test_command(r, tests_by_repo.get(r, []), a.venv))}
            subtasks = []
            for s in p["subtasks"]:
                t = tracker.get(s["sub_id"], {})
                subtasks.append({
                    "sub_id": s["sub_id"],
                    "lang": s["lang"],
                    "prompt_file": f"prompts/wave_{w['waveNum']:02d}/{s['sub_id']}_{s['lang']}.md",
                    "manifest_status": s.get("status"),
                    "tracker_status": t.get("status"),
                    "target_repo": t.get("target_repo"),
                    "summary": t.get("tracker_scope"),
                    "evidence": t.get("evidence"),
                    "notes_risks": t.get("notes_risks"),
                    "acceptance_criteria": s.get("tests_must_cover", []),
                    "files": sorted({f["repo"] + ":" + f["path"] for f in files if s["sub_id"] in f["subtasks"]}),
                })
            # prompt files live in the exec-wave folder; fix up if the folder differs
            for s in subtasks:
                if not (PKG / s["prompt_file"]).exists():
                    hit = list((PKG / "prompts").glob(f"wave_*/{s['sub_id']}_*.md"))
                    s["prompt_file"] = str(hit[0].relative_to(PKG)) if hit else None
            eps = sorted({(e["repo"], e["endpoint"]) for e in per_point_eps.get(pid, [])
                          if next((f for f in files if f["path"] == e["file"]), {}).get("primary")})
            summ = summaries.get(pid, {})
            features.append({
                "id": pid,
                "title": p["title"],
                "wave": w["waveNum"],
                "layer": p["layer"],
                "languages": p["lang_tags"],
                "use_cases": summ.get("use_cases") or sorted(uc_by_point.get(pid, set())),
                "domain": summ.get("domain"),
                "feature_summary": summ.get("summary"),
                "delivery": summ.get("delivery", "code"),
                "ui_screens": resolve_screens(summ.get("ui_slices"), mounts),
                "ui_slices_mentioning": sorted({m["slice"] for m in mount_points.get(pid, [])}),
                "endpoints": [{"repo": r, "endpoint": e} for r, e in eps],
                "manual_checks": summ.get("manual_checks", []),
                "known_gaps": summ.get("known_gaps", []),
                "needs_live": summ.get("needs_live", []),
                "tracker_status": sorted({s["tracker_status"] or "UNKNOWN" for s in subtasks}),
                "subtasks": subtasks,
                "test_files": {r: sorted(v) for r, v in tests_by_repo.items()},
                "test_commands": cmds,
                "implementation_files": {
                    r: sorted(f["path"] for f in primary if f["repo"] == r and f["kind"] != "test") for r in REPOS},
                "mentioned_in_files": len(files),
            })

    modules = build_modules(root, summaries.get("_modules", []), mounts, a.venv, a.base, a.head,
                            {f["id"] for f in features})

    baseline = build_baseline(root, summaries.get("_baseline", []), a.venv, a.base, a.head)

    catalog = {
        "schema": "lextr-feature-catalog/1",
        "generated_by": "feature-testing/tools/build_feature_catalog.py",
        "repos_root": str(root),
        "branches": branch_info,
        "totals": {
            "points": len(features),
            "subtasks": sum(len(f["subtasks"]) for f in features),
            "points_with_automated_tests": sum(1 for f in features if f["test_commands"]),
            "subtasks_delivered": sum(1 for f in features for s in f["subtasks"] if s["tracker_status"] == "DELIVERED"),
            "baseline_features": len(baseline),
            "baseline_with_automated_tests": sum(1 for b in baseline if b["test_commands"]),
        },
        "ui_mounts": list(mounts.values()),
        "platform_changes": summaries.get("_platform", []),
        "modules": modules,
        "baseline_features": baseline,
        "features": features,
        "unmapped_changed_files": {r: sorted(v) for r, v in unmapped.items()},
    }
    covered = {(r, p) for m in modules for r, ps in m["files"].items() for p in ps}
    catalog["files_in_no_module"] = {
        r: [p for p in git(root / r, "diff", "--name-only", "--diff-filter=AM", f"{a.base}...{a.head}").splitlines()
            if (r, p) not in covered and "__pycache__" not in p] for r in REPOS}
    (OUT_DIR / "feature_catalog.json").write_text(json.dumps(catalog, indent=2, ensure_ascii=False) + "\n")
    (OUT_DIR / "FEATURES.md").write_text(render_markdown(catalog))
    print(json.dumps(catalog["totals"]), "->", OUT_DIR / "feature_catalog.json", "+ FEATURES.md")


def build_baseline(root: Path, defs: list[dict], venv: str, base: str, head: str) -> list[dict]:
    """Features that already existed on the base branch (main), which the prompt diff does not cover."""
    out = []
    for d in defs:
        repo = d["repo"]
        rd = root / repo
        on_base = [p for p in git(rd, "ls-tree", "-r", "--name-only", base).splitlines() if "__pycache__" not in p]
        changed = set(git(rd, "diff", "--name-only", f"{base}...{head}").splitlines())
        src = sorted(p for p in on_base if p.startswith(tuple(d.get("paths", []))) and not is_test(repo, p))
        eps = []
        for r in d.get("routes", []):
            route_files = [r["file"]]
            src = sorted(set(src) | {r["file"]})
            for rf in route_files:
                for e in endpoints_in(repo, rd, rf):
                    path = e.split(" ", 1)[-1]
                    if not r.get("match") or re.search(r["match"], path):
                        eps.append({"repo": repo, "endpoint": e})
        tests = [t for t in d.get("tests", []) if (rd / t).exists()]
        missing = sorted(set(d.get("tests", [])) - set(tests))
        out.append({
            "id": d["id"], "title": d["name"], "name": d["name"], "domain": d.get("domain"), "repo": repo,
            "feature_summary": d.get("summary"), "on_base_branch": base,
            "source_files": src,
            "changed_by_branch": sorted(p for p in src if p in changed),
            "endpoints": eps,
            "test_files": {repo: tests} if tests else {},
            "test_files_missing": missing,
            "test_commands": {repo: c} if (c := test_command(repo, tests, venv)) else {},
            "manual_checks": d.get("manual_checks", []),
            "needs_live": d.get("needs_live", []),
            "notes": d.get("notes", []),
        })
    return out


def build_modules(root: Path, defs: list[dict], mounts: dict, venv: str, base: str, head: str,
                  known_points: set[str] = frozenset()) -> list[dict]:
    """Capability modules by code location - catches everything the LP tags miss."""
    changed = {r: [p for p in git(root / r, "diff", "--name-only", "--diff-filter=AM", f"{base}...{head}").splitlines()
                   if "__pycache__" not in p] for r in REPOS}
    out = []
    for d in defs:
        svc_prefixes = [f"src/main/java/com/lextr/intelligence/{p}/" for p in d.get("service_pkgs", [])] + \
                       [f"src/test/java/com/lextr/intelligence/{p}/" for p in d.get("service_pkgs", [])] + \
                       d.get("extra_paths", [])
        ui_prefixes = [f"src/features/{s}/" for s in d.get("ui_slices", [])] + d.get("ui_paths", [])
        lx_prefixes = d.get("lexie_paths", [])
        # lexie tests: match by skill stem, e.g. skills/impact_analysis_skill.py -> tests/test_impact_analysis_skill.py
        lx_test_keys = {Path(p.rstrip("/")).stem.replace("_skill", "") for p in lx_prefixes if p.startswith("skills/")}
        files = {
            "intelligence-service": [p for p in changed["intelligence-service"] if p.startswith(tuple(svc_prefixes))] if svc_prefixes else [],
            "intelligence-ui": [p for p in changed["intelligence-ui"] if p.startswith(tuple(ui_prefixes))] if ui_prefixes else [],
            "lexie-ai": [p for p in changed["lexie-ai"] if lx_prefixes and (p.startswith(tuple(lx_prefixes)) or (
                p.startswith("tests/") and any(k and k in Path(p).stem for k in lx_test_keys)))],
        }
        eps, lps, tests = [], defaultdict(int), {}
        for r, ps in files.items():
            for p in ps:
                eps += [{"repo": r, "endpoint": e} for e in endpoints_in(r, root / r, p)]
                for pid in lp_refs(root / r, p):
                    lps[pid] += 1
            tests[r] = sorted(p for p in ps if is_test(r, p))
        out.append({
            **{k: d[k] for k in ("id", "name", "use_case", "reach") if k in d},
            "ui_screens": [{k: mounts[s][k] for k in ("screen_id", "label", "group")} for s in d.get("ui_slices", []) if s in mounts],
            "endpoints": eps,
            "related_points": [p for p, _ in sorted(lps.items(), key=lambda x: -x[1]) if not known_points or p in known_points],
            "files": {r: sorted(v) for r, v in files.items()},
            "test_files": {r: v for r, v in tests.items() if v},
            "test_commands": {r: c for r in REPOS if (c := test_command(r, tests.get(r, []), venv))},
        })
    return out


def resolve_screens(slices: list[str] | None, mounts: dict) -> list[dict]:
    out = []
    for s in slices or []:
        if s in mounts:
            out.append({k: mounts[s][k] for k in ("screen_id", "label", "group", "path")})
        else:  # pseudo-screens: "lexie:<renderer>", "all", or a declared-unmounted slice
            label = {"all": "every screen (shell)"}.get(s, s.replace("lexie:", "Lexie panel inline: ") if s.startswith("lexie:") else f"{s} (declared unmounted)")
            out.append({"screen_id": None, "label": label, "group": "—", "path": None})
    return out


def render_markdown(c: dict) -> str:
    L = ["# Lextr Intelligence v1.38.0 — Feature Catalog (branch vs main)", "",
         "_Generated by `tools/build_feature_catalog.py` — do not edit by hand; edit `tools/feature_summaries.json` and re-run._", "",
         "## Branches compared", "", "| Repo | Branch | Head | Commits ahead of main | Diff |", "|---|---|---|---|---|"]
    for r, b in c["branches"].items():
        L.append(f"| {r} | `{b['branch']}` | `{b['head']}` | {b['commits_ahead']} | {b['shortstat']} |")
    t = c["totals"]
    L += ["", f"**{t['points']} logic points · {t['subtasks']} prompts · {t['subtasks_delivered']} DELIVERED per tracker · "
              f"{t['points_with_automated_tests']} points with automated tests mapped · "
              f"{t.get('baseline_features', 0)} baseline features already on main (section 4).**", "",
          "Test levels used below: **L0** automated unit/static (no infra) · **L1** automated needing DB/OPA/sibling repos · "
          "**L2** live API smoke (`run_feature_tests.py smoke`) · **L3** manual UI/API check.", "",
          "## 1. Feature index (by logic point)", "",
          "| LP | Domain | Feature | UC | Wave | Delivery | Automated tests (svc/lexie/ui) | UI screen |", "|---|---|---|---|---|---|---|---|"]
    for f in c["features"]:
        n = lambda r: len(f["test_files"].get(r, []))
        ui = ", ".join(s["label"] for s in f["ui_screens"] if s.get("label")) or "—"
        L.append(f"| [{f['id']}](#{f['id'].lower()}) | {f['domain'] or ''} | {f['title']} | {', '.join(f['use_cases']) or '—'} | "
                 f"{f['wave']} | {f['delivery']} | {n('intelligence-service')}/{n('lexie-ai')}/{n('intelligence-ui')} | {ui} |")
    L += ["", "## 2. Capability modules (by code location)", "",
          "Every changed file belongs to a module, including files that carry no LP tag.", "",
          "| Module | UC | Reachable via | Endpoints | Tests (svc/lexie/ui) | Related LPs |", "|---|---|---|---|---|---|"]
    for m in c["modules"]:
        n = lambda r: len(m["test_files"].get(r, []))
        L.append(f"| **{m['name']}** (`{m['id']}`) | {m['use_case']} | {m['reach']} | {len(m['endpoints'])} | "
                 f"{n('intelligence-service')}/{n('lexie-ai')}/{n('intelligence-ui')} | {', '.join(m['related_points'][:8])} |")
    L += ["", "## 3. Branch changes outside the prompt set", "", "| Repo | Commit | Change | How to test |", "|---|---|---|---|"]
    for p in c["platform_changes"]:
        L.append(f"| {p['repo']} | `{p['commit']}` | {p['change']} | {p['test']} |")
    bl = c.get("baseline_features", [])
    if bl:
        L += ["", f"## 4. Baseline features already on {c['branches']['lexie-ai']['base']}", "",
              "These existed before the prompt-driven build, so the branch diff does not list them. Their tests run in",
              "`suite` like any other; `show BL-xx` / `test BL-xx` work the same way as for an LP.", "",
              "| ID | Domain | Feature | Repo | Endpoints | Automated tests | Files changed by the branch |", "|---|---|---|---|---|---|---|"]
        for b in bl:
            n = sum(len(v) for v in b["test_files"].values())
            L.append(f"| [{b['id']}](#{b['id'].lower()}) | {b['domain']} | {b['name']} | {b['repo']} | {len(b['endpoints'])} | "
                     f"{n if n else '**none - manual only**'} | {len(b['changed_by_branch'])} of {len(b['source_files'])} |")
        L.append("")
        for b in bl:
            L += [f"### {b['id']}", "", f"**{b['name']}** — {b['repo']}, on `{b['on_base_branch']}` before the build", "", b["feature_summary"] or "", ""]
            if b["endpoints"]:
                L.append("- **Endpoints:** " + "; ".join(f"`{e['endpoint']}`" for e in b["endpoints"]))
            L += ["", "**How to test**", ""]
            for r, cmd in b["test_commands"].items():
                L.append(f"- L0/L1 `{r}`: `{cmd}`" if len(cmd) < 400 else f"- L0/L1 `{r}`: {len(b['test_files'][r])} test files — `python3 run_feature_tests.py test {b['id']}`")
            if not b["test_commands"]:
                L.append("- No automated tests exist for this feature.")
            L.append(f"- Runner: `python3 run_feature_tests.py test {b['id']}`")
            for mc in b["manual_checks"]:
                L.append(f"- L3 manual: {mc}")
            if b["needs_live"]:
                L.append(f"- Live dependencies for manual checks: {', '.join(b['needs_live'])}")
            for nt in b["notes"]:
                L.append(f"- Note: {nt}")
            if b["changed_by_branch"]:
                L.append(f"- Changed by the branch since main: {', '.join(f'`{x}`' for x in b['changed_by_branch'])}")
            L.append("")
    L += ["", "## 5. Feature detail (by logic point)", ""]
    for f in c["features"]:
        L += [f"### {f['id']}", "", f"**{f['title']}** — wave {f['wave']}, {f['layer']}, {'/'.join(f['languages'])}", ""]
        if f["feature_summary"]:
            L += [f["feature_summary"], ""]
        if f["delivery"] != "code":
            L += [f"> Delivery: **{f['delivery']}** — no runnable code expected.", ""]
        if f["ui_screens"]:
            L.append("- **UI:** " + "; ".join(f"{s.get('group')} › {s.get('label')}" for s in f["ui_screens"] if s.get("label")))
        if f["endpoints"]:
            L.append("- **Endpoints:** " + "; ".join(f"`{e['endpoint']}` ({e['repo']})" for e in f["endpoints"][:12]))
        L += ["", "**Prompts**", "", "| Prompt | Status | What it delivered | # acceptance criteria |", "|---|---|---|---|"]
        for s in f["subtasks"]:
            L.append(f"| [{s['sub_id']}](../{s['prompt_file']}) {s['lang']} | {s['tracker_status']} | {s['summary'] or ''} | {len(s['acceptance_criteria'])} |")
        L.append("")
        for s in f["subtasks"]:
            if not s["acceptance_criteria"]:
                continue
            L.append(f"<details><summary>{s['sub_id']} acceptance criteria ({len(s['acceptance_criteria'])})</summary>\n")
            for i, ac in enumerate(s["acceptance_criteria"], 1):
                L.append(f"- [ ] **{s['sub_id']}/AC{i}** — {ac.replace('|', '/')}")
            L.append("\n</details>\n")
        L += ["", "**How to test**", ""]
        if f["test_commands"]:
            for r, cmd in f["test_commands"].items():
                L.append(f"- L0/L1 `{r}`: `{cmd}`" if len(cmd) < 400 else f"- L0/L1 `{r}`: {len(f['test_files'][r])} test files — `python3 run_feature_tests.py test {f['id']} --repo {r}`")
        else:
            L.append("- No automated tests mapped.")
        L.append(f"- Runner: `python3 run_feature_tests.py test {f['id']}`")
        for mc in f["manual_checks"]:
            L.append(f"- L3 manual: {mc}")
        if f["needs_live"]:
            L.append(f"- Live dependencies for manual checks: {', '.join(f['needs_live'])}")
        for g in f["known_gaps"]:
            L.append(f"- ⚠ Known gap: {g}")
        for s in f["subtasks"]:
            n = (s["notes_risks"] or "").replace("gates NOT RUN", "").strip(" .;-")
            if len(n) > 3:
                L.append(f"- Tracker note {s['sub_id']}: {n}")
        L.append("")
    return "\n".join(L) + "\n"


if __name__ == "__main__":
    main()
