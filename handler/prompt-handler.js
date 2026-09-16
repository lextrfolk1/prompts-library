#!/usr/bin/env node
/**
 * prompt-handler.js  —  Generic Manifest Prompt Utility
 * ──────────────────────────────────────────────────────
 * Reads any JSX/JS file that embeds a manifest as a JS object literal,
 * extracts it by brace-depth parsing (no eval), resolves a wave-ordered
 * execution flow, renders a work-prompt .md per sub-task, and tracks which
 * prompts have been applied so an agent can resume from where it left off.
 *
 * Zero external dependencies — pure Node.js (fs, path, process).
 *
 * GENERIC FLAGS (control what is read / where output goes)
 *   --file   <path>   -f <path>   Source JSX/JS file  [default: Lextr_Intelligence_Manifest_v8.jsx]
 *   --var    <name>   -v <name>   Variable name to extract  [default: MANIFEST]
 *   --out    <dir>    -o <dir>    Output folder  [default: ./prompts]
 *   --repo   <url>    -r <url>    Repository URL written into every prompt
 *   --branch <name>   -b <name>   Branch name written into every prompt
 *   --lang-order <list>  -l <list>  Comma-separated lang execution order
 *                                   [default: SQL,JAVA,REGO,PY,TS,CYTO,TEST]
 *
 * COMMANDS  (long form and shortcut)
 *   --validate       -val
 *   --flow           -fl
 *   --preview        -pre   <POINT-ID> <LANG>
 *   --generate       -gen   [--force]
 *   --status         -st
 *   --mark-applied   -ma    <SEQ>
 *   --resume         -res
 *
 * All commands accept the generic flags above. Example:
 *   node prompt-handler.js --file MyManifest.jsx --var MY_MANIFEST \
 *     --repo https://github.com/org/repo --branch main --validate
 */

"use strict";
const fs   = require("fs");
const path = require("path");

// ─────────────────────────────────────────────────────────────────────────────
// MODULE 0 — ARG PARSER
// Parses all CLI flags into a config object consumed by every module.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * parseArgs(argv) → Config
 *
 * Config shape:
 * {
 *   cmd:        string,          // first positional arg (e.g. "--validate")
 *   extraArgs:  string[],        // remaining positional args after cmd
 *   file:       string,          // absolute path to source JSX/JS
 *   varName:    string,          // JS variable name to extract
 *   outDir:     string,          // absolute path to output folder
 *   repo:       string,          // repo URL for prompt header
 *   branch:     string,          // branch name for prompt header
 *   langOrder:  string[],        // lang execution order
 *   force:      boolean,
 * }
 */
function parseArgs(argv) {
  const DEFAULT_FILE      = path.join(__dirname, "Lextr_Intelligence_Manifest_v8.jsx");
  const DEFAULT_VAR       = "MANIFEST";
  const DEFAULT_OUT       = path.join(__dirname, "prompts");
  const DEFAULT_REPO      = "<REPO NOT SET — pass --repo <url>>";
  const DEFAULT_BRANCH    = "<BRANCH NOT SET — pass --branch <name>>";
  const DEFAULT_LANG_ORDER = ["SQL", "JAVA", "REGO", "PY", "TS", "CYTO", "TEST"];

  const cfg = {
    cmd:       null,
    extraArgs: [],
    file:      DEFAULT_FILE,
    varName:   DEFAULT_VAR,
    outDir:    DEFAULT_OUT,
    repo:      DEFAULT_REPO,
    branch:    DEFAULT_BRANCH,
    langOrder: DEFAULT_LANG_ORDER,
    force:     false,
  };

  let i = 0;
  while (i < argv.length) {
    const a = argv[i];
    switch (a) {
      case "--file":
      case "-f":
        cfg.file = path.resolve(argv[++i] || "");
        break;
      case "--var":
      case "-v":
        cfg.varName = argv[++i] || DEFAULT_VAR;
        break;
      case "--out":
      case "-o":
        cfg.outDir = path.resolve(argv[++i] || DEFAULT_OUT);
        break;
      case "--repo":
      case "-r":
        cfg.repo = argv[++i] || DEFAULT_REPO;
        break;
      case "--branch":
      case "-b":
        cfg.branch = argv[++i] || DEFAULT_BRANCH;
        break;
      case "--lang-order":
      case "-l":
        cfg.langOrder = (argv[++i] || "").split(",").map(s => s.trim()).filter(Boolean);
        if (cfg.langOrder.length === 0) cfg.langOrder = DEFAULT_LANG_ORDER;
        break;
      case "--force":
        cfg.force = true;
        break;
      // command shortcuts — normalise to canonical long form
      case "-val":
        if (cfg.cmd === null) cfg.cmd = "--validate";
        break;
      case "-fl":
        if (cfg.cmd === null) cfg.cmd = "--flow";
        break;
      case "-pre":
        if (cfg.cmd === null) cfg.cmd = "--preview";
        break;
      case "-gen":
        if (cfg.cmd === null) cfg.cmd = "--generate";
        break;
      case "-st":
        if (cfg.cmd === null) cfg.cmd = "--status";
        break;
      case "-ma":
        if (cfg.cmd === null) cfg.cmd = "--mark-applied";
        break;
      case "-res":
        if (cfg.cmd === null) cfg.cmd = "--resume";
        break;
      default:
        if (a.startsWith("--") || a.startsWith("-")) {
          if (cfg.cmd === null) { cfg.cmd = a; }
        } else {
          if (cfg.cmd === null) { cfg.cmd = a; }
          else { cfg.extraArgs.push(a); }
        }
    }
    i++;
  }

  // Derived paths that depend on outDir
  cfg.historyFile = path.join(cfg.outDir, "applied-history.json");
  cfg.indexFile   = path.join(cfg.outDir, "00_FLOW_INDEX.md");

  // Build langPriority map from langOrder
  cfg.langPriority = {};
  cfg.langOrder.forEach((lang, idx) => { cfg.langPriority[lang] = idx; });

  return cfg;
}

// ─────────────────────────────────────────────────────────────────────────────
// MODULE 1 — MANIFEST PARSER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * extractManifest(filePath, varName) → object
 *
 * Finds `const <varName> = ` in the file, then walks character-by-character
 * counting brace depth while respecting string literals. Works on any size
 * JSON blob embedded as a JS object literal — including 50 kB single-liners.
 */
function extractManifest(filePath, varName) {
  if (!fs.existsSync(filePath)) {
    throw new Error("File not found: " + filePath);
  }
  const src    = fs.readFileSync(filePath, "utf8");
  const MARKER = "const " + varName + " = ";
  const mIdx   = src.indexOf(MARKER);
  if (mIdx === -1) {
    throw new Error(
      "Cannot find '" + MARKER + "' in " + filePath + "\n" +
      "Tip: use --var <name> to specify a different variable name."
    );
  }

  // advance to the opening brace
  let i = mIdx + MARKER.length;
  while (i < src.length && src[i] !== "{") i++;
  if (i >= src.length) throw new Error("No opening { found after '" + MARKER + "'");

  const jsonStart = i;
  let depth   = 0;
  let inStr   = false;
  let strChar = "";
  let escaped = false;

  for (; i < src.length; i++) {
    const ch = src[i];
    if (escaped)                    { escaped = false; continue; }
    if (ch === "\\")                { escaped = true;  continue; }
    if (inStr) {
      if (ch === strChar)           inStr = false;
      continue;
    }
    if (ch === '"' || ch === "'")   { inStr = true; strChar = ch; continue; }
    if      (ch === "{")            { depth++; }
    else if (ch === "}") {
      depth--;
      if (depth === 0) { i++; break; }
    }
  }

  const blob = src.slice(jsonStart, i);
  try {
    return JSON.parse(blob);
  } catch (e) {
    throw new Error(
      "JSON.parse failed for '" + varName + "' in " + filePath + ": " + e.message + "\n" +
      "Tip: the extracted blob must be valid JSON (double-quoted keys, no trailing commas)."
    );
  }
}

/**
 * validateManifest(M) → string[]   (empty = valid)
 *
 * Checks the minimal structure the rest of the tool relies on:
 *   - M.points[]  with id, title, subtasks[]
 *   - M.exec.waves[]
 *   - No cycles in depends_on
 */
function validateManifest(M) {
  const issues = [];
  try {
    if (!M || typeof M !== "object") { issues.push("manifest is not an object"); return issues; }

    // points
    const pts = M.points || [];
    if (!Array.isArray(pts) || pts.length === 0) {
      issues.push("manifest.points is missing or empty — every manifest needs a points array");
      return issues;
    }
    const ids = new Set(pts.map(p => p && p.id));
    pts.forEach(p => {
      if (!p || !p.id || !p.title) issues.push("a point is missing id or title");
      (p.depends_on || []).forEach(d => {
        if (!ids.has(d)) issues.push((p.id || "?") + " depends on unknown id: " + d);
      });
      if (!Array.isArray(p.subtasks) || p.subtasks.length === 0)
        issues.push((p.id || "?") + " has no subtasks array");
      (p.subtasks || []).forEach(s => {
        if (!s.sub_id || !s.lang)
          issues.push((p.id || "?") + " has a subtask missing sub_id or lang");
      });
    });

    // waves
    const waves = (M.exec && M.exec.waves) || [];
    if (!Array.isArray(waves) || waves.length === 0)
      issues.push("manifest.exec.waves is missing — needed for flow ordering");

    // DAG cycle check
    const adj   = {};
    pts.forEach(p => { adj[p.id] = (p.depends_on || []).filter(d => ids.has(d)); });
    const state = {}; let cyclic = false;
    const dfs = u => {
      state[u] = 1;
      for (const v of (adj[u] || [])) {
        if (state[v] === 1) { cyclic = true; return; }
        if (!state[v]) dfs(v);
      }
      state[u] = 2;
    };
    pts.forEach(p => { if (!state[p.id]) dfs(p.id); });
    if (cyclic) issues.push("dependency cycle detected in depends_on graph");

  } catch (e) {
    issues.push("validation exception: " + String(e));
  }
  return issues;
}

// ─────────────────────────────────────────────────────────────────────────────
// MODULE 2 — FLOW RESOLVER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * resolveFlow(manifest, cfg) → FlowItem[]
 *
 * FlowItem: { seqNo, seqPad, waveIndex, waveName, waveFolder, point, subtask }
 *
 * Ordering:
 *   1. exec.waves in manifest order
 *   2. Within wave: topological sort of points via depends_on
 *   3. Within point: subtasks ordered by cfg.langPriority (unknown langs → end)
 */
function resolveFlow(manifest, cfg) {
  const points = manifest.points || [];
  const byId   = Object.fromEntries(points.map(p => [p.id, p]));
  const waves  = (manifest.exec && manifest.exec.waves) || [];

  const flow = [];
  let seq = 1;

  waves.forEach((waveEntry, wIdx) => {
    const waveName   = waveEntry.wave || ("Wave " + (wIdx + 1));
    const waveNum    = String(wIdx + 1).padStart(2, "0");
    const waveFolder = "wave-" + waveNum;

    const wavePoints = (waveEntry.points || []).map(id => byId[id]).filter(Boolean);
    const sorted     = topoSort(wavePoints, byId);

    sorted.forEach(point => {
      const subtasks = [...(point.subtasks || [])].sort((a, b) => {
        const pa = cfg.langPriority[a.lang] !== undefined ? cfg.langPriority[a.lang] : 99;
        const pb = cfg.langPriority[b.lang] !== undefined ? cfg.langPriority[b.lang] : 99;
        return pa - pb;
      });

      subtasks.forEach(subtask => {
        flow.push({ seqNo: seq, seqPad: String(seq).padStart(3, "0"),
          waveIndex: wIdx + 1, waveName, waveFolder, point, subtask });
        seq++;
      });
    });
  });

  return flow;
}

/** topoSort — stable DFS topological sort within a set of points */
function topoSort(points, byId) {
  const ids     = new Set(points.map(p => p.id));
  const result  = [];
  const visited = new Set();

  const visit = p => {
    if (visited.has(p.id)) return;
    visited.add(p.id);
    (p.depends_on || []).filter(d => ids.has(d) && byId[d]).forEach(d => visit(byId[d]));
    result.push(p);
  };

  points.forEach(p => visit(p));
  points.forEach(p => { if (!visited.has(p.id)) result.push(p); }); // safety
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// MODULE 3 — PROMPT RENDERER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * langLabel(k, manifest) — resolves a lang code to its human label.
 * Uses manifest.lang_tax[k].label if present, falls back to the key itself.
 */
function langLabel(k, manifest) {
  return (manifest.lang_tax && manifest.lang_tax[k] && manifest.lang_tax[k].label) || k;
}

/**
 * productName(manifest) — resolves the product name for use in upstream block.
 * Uses manifest.product_estate.products[0], falls back to "this product".
 */
function productName(manifest) {
  const prods = manifest.product_estate && manifest.product_estate.products;
  return (Array.isArray(prods) && prods[0]) ? prods[0] : "this product";
}

/** repoHeader — generic, uses cfg.repo and cfg.branch */
function repoHeader(cfg) {
  return [
    "## Exposed codebase (this session)",
    "- Repository: " + cfg.repo,
    "- Branch: "     + cfg.branch,
    "- All reads and writes stay within this branch's structure and conventions.",
    "- Repository topology is OPEN (monorepo vs multi-repo vs shared package) — do not assume a layout; flag layout-dependent choices."
  ];
}

/** sharedLayerBlock — product name from manifest, not hardcoded */
function sharedLayerBlock(p, manifest) {
  if (!p.upstream || !p.upstream.length) return [];
  const prod = productName(manifest);
  return [
    "## UPSTREAM/DOWNSTREAM INTEGRATION (this point consumes external contract objects — treat them as fixed)",
    "- " + prod + " is an independent product; the ONLY external surfaces are the upstream/downstream objects listed below.",
    "- Upstream objects this point leverages (consume read-only; never redefine): " + p.upstream.join("; ") + ".",
    "- Fail closed if the upstream contract is not yet wired; never fabricate the missing surface.",
    "- Raise any needed change to the upstream owner as a proposal; do not alter the external contract locally."
  ];
}

/** discoveryBlock — fully generic, no hardcoded product references */
function discoveryBlock(p) {
  const base = [
    "## STEP 1 — Discover before you write (NON-WAIVABLE, do this first)",
    "Search the exposed branch BEFORE writing any code. Report these sections, then proceed:",
    "- SEARCHED: the exact terms and paths you searched.",
    "- FOUND: each existing file/class/method/component that overlaps this sub-task, and what it does.",
    "- DECISION: REUSE (extend/call it) | ADAPT (minimal change to an adjacent asset) | BUILD (nothing fits — say why)."
  ];
  if (p.upstream && p.upstream.length) {
    base.push(
      "- UPSTREAM: this point consumes external contract objects (" + p.upstream.join("; ") +
      "). Confirm you are reading the published contract, not re-implementing it; " +
      "flag if the upstream binding is not yet available (fail closed)."
    );
  }
  base.push(
    "Rules: if an existing controller/service/DAO/method/component/policy/migration covers this, EXTEND or CALL it —",
    "never author a parallel one; never create a second class/endpoint/table/column/component that overlaps an existing one.",
    "Honor low-code order: reuse > configuration > extension > new."
  );
  return base;
}

/** priorCorrectionsBlock — uses adjustments stored on the subtask */
function priorCorrectionsBlock(sub) {
  const adj = sub.adjustments || [];
  if (adj.length === 0) return [];
  const out = ["## PRIOR CORRECTIONS — apply these; do not repeat the corrected mistakes"];
  adj.forEach(a =>
    out.push("- [" + (a.class || a.type || "NOTE") + "] " + a.summary + (a.reason ? " — " + a.reason : ""))
  );
  out.push("Carry these forward. CONTRACT/STANDARD/DECISION items are owner-approved proposals; do not act beyond what was approved.");
  return out;
}

/**
 * ddlBlock — renders an embedded DDL block if the manifest has ddl_body.
 * Generic: uses ddl_ownership fields if present, gracefully omits them if not.
 */
function ddlBlock(manifest) {
  if (!manifest.ddl_body) return [];
  const own = manifest.ddl_ownership || {};
  const lines = [
    "",
    "## Full DDL — copy-run ready" + (own.baseline_migration ? " (apply as " + own.baseline_migration + ")" : ""),
  ];
  if (own.team_owns) lines.push(own.team_owns);
  lines.push("```sql", manifest.ddl_body, "```");
  return lines;
}

/**
 * stackBlock — renders the pinned stack section generically.
 *
 * If manifest.build_context.pinned_stack exists, renders every key-value pair
 * whose value is a non-empty string. No hardcoded field names — whatever the
 * manifest defines is printed.
 *
 * Falls back gracefully when build_context is absent.
 */
function stackBlock(manifest) {
  const bc  = manifest.build_context || {};
  const stk = bc.pinned_stack || {};
  const entries = Object.entries(stk).filter(([, v]) => v && typeof v === "string");
  if (entries.length === 0) return [];
  return [
    "## Pinned stack (use exactly; introduce nothing new)",
    ...entries.map(([k, v]) => "- " + k + ": " + v)
  ];
}

/**
 * governanceBlock — renders governance constraints generically.
 * Uses manifest.build_context.governance_constraints if present.
 */
function governanceBlock(manifest) {
  const bc = manifest.build_context || {};
  const gc = bc.governance_constraints || [];
  if (gc.length === 0) return [];
  return [
    "## Governance bars (non-waivable)",
    ...gc.map(g => "- " + g)
  ];
}

/**
 * fixedContractBlock — renders fixed contracts for a point.
 * Uses point.fixed_contracts if present; emits nothing otherwise.
 */
function fixedContractBlock(point) {
  const fc = point.fixed_contracts || [];
  if (fc.length === 0) return [];
  return [
    "## Fixed contract — build against this exactly.",
    "## Schema / API design changes flow upstream (downstream-only), never made unilaterally.",
    ...fc.map(c => "- " + c)
  ];
}

/**
 * renderPrompt(point, subtask, manifest, cfg) → string
 *
 * Fully generic renderer. Every section is driven by manifest data:
 *   - langLabel     → manifest.lang_tax
 *   - productName   → manifest.product_estate.products
 *   - repo/branch   → cfg.repo / cfg.branch
 *   - stack         → manifest.build_context.pinned_stack  (any keys)
 *   - governance    → manifest.build_context.governance_constraints
 *   - DDL embed     → manifest.ddl_body  (any point whose sub has isDdlSubtask flag,
 *                     OR point.id==="LP-01" && lang==="SQL" for backwards compat)
 *   - corrections   → subtask.adjustments[]
 *
 * null entries in the lines array are filtered before the final join.
 */
function renderPrompt(point, subtask, manifest, cfg) {
  const ll      = k => langLabel(k, manifest);
  const corr    = priorCorrectionsBlock(subtask);
  const hasCorr = corr.length > 0;
  const meta    = manifest.meta || {};

  // DDL embed: backwards-compat LP-01/SQL check + generic isDdlSubtask flag
  const embedDdl = subtask.isDdlSubtask || (point.id === "LP-01" && subtask.lang === "SQL");

  // Version from meta — use manifest_version, version, or package fallback
  const version = meta.manifest_version || meta.version || meta.package || "unknown";

  // Generator label
  const generator = meta.generator || meta.generated_by || "prompt-handler";

  const lines = [
    // ── header ──────────────────────────────────────────────────────────────
    "# WORK PROMPT — " + subtask.sub_id + " · " + ll(subtask.lang) + " · " + (subtask.layer || ""),
    "(parent " + point.id + " — " + point.title + " · layer=" + (point.layer || "") + ")",
    "(generated from Manifest " + version + " · " + generator + ")",
    "",

    // ── role ────────────────────────────────────────────────────────────────
    "## Role",
    "You are the developer's AI copilot for ONE sub-task. First discover what already exists in the",
    "exposed repo, decide REUSE/ADAPT/BUILD, then deliver code the developer reviews, owns, and commits.",
    "Do not exceed scope. Do not alter any fixed contract.",
    "",

    // ── repo/branch ─────────────────────────────────────────────────────────
    ...repoHeader(cfg),
    "",

    // ── upstream block (only if point.upstream is non-empty) ────────────────
    ...sharedLayerBlock(point, manifest),
    (point.upstream && point.upstream.length) ? "" : null,

    // ── discovery (STEP 1) ──────────────────────────────────────────────────
    ...discoveryBlock(point),
    "",

    // ── prior corrections (only if adjustments exist) ───────────────────────
    ...corr,
    hasCorr ? "" : null,

    // ── parent point summary ─────────────────────────────────────────────────
    "## Parent logic point",
    "- " + point.id + " — " + point.title +
      ((point.tech_stack && point.tech_stack.length) ? " · " + point.tech_stack.join("/") : "") +
      ((point.lang_tags  && point.lang_tags.length)  ? " · " + point.lang_tags.join("/")  : "") +
      " · layer=" + (point.layer || ""),
    "- " + (point.parallel_group ? "Wave " + point.parallel_group : "ungrouped") +
      " · prerequisites: " + ((point.depends_on || []).join(", ") || "none"),
    "",

    // ── background ───────────────────────────────────────────────────────────
    "## Background (decided — do not re-open)",
    point.background || "(no background provided)",
    "",

    // ── STEP 2 ───────────────────────────────────────────────────────────────
    "## STEP 2 — Deliver this sub-task (" + ll(subtask.lang) + " · " + (subtask.layer || "") + ")",
    "Scope: " + (subtask.scope || "(no scope provided)"),
    "- If DECISION = REUSE: wire to the existing asset and write the conformance test proving the tests below pass.",
    "- If DECISION = ADAPT: make the minimal extension/configuration to the asset you found. Do not fork it.",
    "- If DECISION = BUILD: create new, following the branch's conventions.",

    // ── optional DDL embed ───────────────────────────────────────────────────
    ...(embedDdl ? ddlBlock(manifest) : []),
    "",

    // ── tests must cover ─────────────────────────────────────────────────────
    "## Tests must cover (>=90%; tests ship inside this sub-task)",
    ...(subtask.tests_must_cover || []).map(t => "- " + t),
    (!(subtask.tests_must_cover && subtask.tests_must_cover.length)) ? "- (no test criteria specified in manifest)" : null,
    "",

    // ── pinned stack (generic — renders whatever keys exist) ─────────────────
    ...stackBlock(manifest),
    (stackBlock(manifest).length > 0) ? "" : null,

    // ── fixed contract ───────────────────────────────────────────────────────
    ...fixedContractBlock(point),
    (fixedContractBlock(point).length > 0) ? "" : null,

    // ── governance bars ───────────────────────────────────────────────────────
    ...governanceBlock(manifest),
    (governanceBlock(manifest).length > 0) ? "" : null,

    // ── reference ────────────────────────────────────────────────────────────
    "## Reference (behavior only — never copy prototype code)",
    ...(point.reference_pointers
      ? Object.entries(point.reference_pointers).map(([k, v]) => "- " + k + ": " + v)
      : ["- (no reference pointers in manifest)"]),
    "",

    // ── STEP 3 ───────────────────────────────────────────────────────────────
    "## STEP 3 — At completion, emit an ADJUSTMENTS record",
    "If the reviewer corrected anything, output an ADJUSTMENTS block so future prompts are pre-corrected.",
    "For each correction give: SUMMARY (what), REASON (why), and CLASS:",
    "- IMPLEMENTATION — a coding/wiring fix. Safe to auto-apply to the manifest.",
    "- CONTRACT | STANDARD | DECISION — touches data model, a standard, or a fixed decision.",
    "  Do NOT apply; raise as a PROPOSAL to the owner. The ring-fence holds: corrections never silently",
    "  rewrite schema, standards, or fixed decisions.",
    "",

    // ── output instructions ──────────────────────────────────────────────────
    "## Output",
    "Lead with STEP 1 findings (SEARCHED / FOUND / DECISION" +
      (point.layer === "shared" ? " / CROSS-PRODUCT" : "") + "), then the",
    "implementation for this sub-task + its tests, then the STEP 3 ADJUSTMENTS block (or \"ADJUSTMENTS: none\")."
  ];

  return lines.filter(x => x !== null).join("\n");
}

// ─────────────────────────────────────────────────────────────────────────────
// MODULE 4 — FILE WRITER
// ─────────────────────────────────────────────────────────────────────────────

/** slugify — kebab-case slug, max 50 chars */
function slugify(str) {
  return (str || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50)
    .replace(/-$/g, "");
}

/** buildFilename — e.g. "001_LP-01_SQL_apply-the-intelligence-schema.md" */
function buildFilename(item) {
  return item.seqPad + "_" + item.point.id + "_" + item.subtask.lang + "_" + slugify(item.subtask.scope) + ".md";
}

/**
 * writePromptFiles(flow, manifest, cfg) → { written, skipped, total }
 * Creates cfg.outDir/wave-NN/ folders and writes one .md per flow item.
 */
function writePromptFiles(flow, manifest, cfg) {
  fs.mkdirSync(cfg.outDir, { recursive: true });

  let written = 0, skipped = 0;

  flow.forEach(item => {
    const dir   = path.join(cfg.outDir, item.waveFolder);
    fs.mkdirSync(dir, { recursive: true });

    const fname = buildFilename(item);
    const fpath = path.join(dir, fname);
    if (fs.existsSync(fpath) && !cfg.force) { skipped++; return; }

    fs.writeFileSync(fpath, renderPrompt(item.point, item.subtask, manifest, cfg), "utf8");
    written++;
  });

  writeFlowIndex(flow, cfg);

  return { written, skipped, total: flow.length };
}

/** writeFlowIndex — writes cfg.outDir/00_FLOW_INDEX.md */
function writeFlowIndex(flow, cfg) {
  const lines = [
    "# Prompt Flow Index",
    "",
    "Work through files numerically. Generated by prompt-handler.js.",
    "",
    "| SEQ | Wave | Point | Title | Lang | Sub-task ID | File |",
    "|-----|------|-------|-------|------|-------------|------|"
  ];

  flow.forEach(item => {
    const fname = buildFilename(item);
    const fpath = item.waveFolder + "/" + fname;
    const title = (item.point.title || "").slice(0, 45).replace(/\|/g, "\\|");
    lines.push(
      "| " + item.seqPad +
      " | " + item.waveName.replace(/\|/g, "\\|") +
      " | " + item.point.id +
      " | " + title +
      " | " + item.subtask.lang +
      " | " + item.subtask.sub_id +
      " | `" + fpath + "` |"
    );
  });

  fs.writeFileSync(cfg.indexFile, lines.join("\n") + "\n", "utf8");
}

// ─────────────────────────────────────────────────────────────────────────────
// MODULE 5 — HISTORY TRACKER
// ─────────────────────────────────────────────────────────────────────────────

function loadHistory(cfg, manifestVersion) {
  if (!fs.existsSync(cfg.historyFile)) {
    return { manifest_version: manifestVersion, generated_at: new Date().toISOString(), applied: {} };
  }
  try {
    return JSON.parse(fs.readFileSync(cfg.historyFile, "utf8"));
  } catch (_) {
    return { manifest_version: manifestVersion, generated_at: new Date().toISOString(), applied: {} };
  }
}

function saveHistory(h, cfg) {
  fs.mkdirSync(cfg.outDir, { recursive: true });
  fs.writeFileSync(cfg.historyFile, JSON.stringify(h, null, 2) + "\n", "utf8");
}

function cmdMarkApplied(seqPad, flow, manifest, cfg) {
  const item = flow.find(i => i.seqPad === seqPad);
  if (!item) {
    console.error("ERROR: No prompt with seq " + seqPad + ". Valid range: 001–" + String(flow.length).padStart(3, "0"));
    process.exit(1);
  }
  const meta = manifest.meta || {};
  const ver  = meta.manifest_version || meta.version || "unknown";
  const h    = loadHistory(cfg, ver);
  h.applied[seqPad] = {
    applied_at: new Date().toISOString(),
    point_id:   item.point.id,
    sub_id:     item.subtask.sub_id,
    lang:       item.subtask.lang
  };
  saveHistory(h, cfg);
  console.log("✓  Marked " + seqPad + " (" + item.subtask.sub_id + " · " + item.subtask.lang + ") as DONE");
}

function cmdStatus(flow, manifest, cfg) {
  const meta    = manifest.meta || {};
  const ver     = meta.manifest_version || meta.version || "unknown";
  const h       = loadHistory(cfg, ver);
  const applied = h.applied || {};
  const W       = [5, 8, 6, 14, 10, 9, 22];
  const col     = (s, w) => String(s == null ? "" : s).padEnd(w).slice(0, w);
  const hr      = "─".repeat(76);

  console.log(
    col("SEQ",    W[0]) + col("POINT",  W[1]) + col("LANG",    W[2]) +
    col("SUB-ID", W[3]) + col("WAVE",   W[4]) + col("STATUS",  W[5]) + "APPLIED AT"
  );
  console.log(hr);

  let nDone = 0, nPending = 0;
  flow.forEach(item => {
    const rec    = applied[item.seqPad];
    const status = rec ? "DONE" : "PENDING";
    if (rec) nDone++; else nPending++;
    console.log(
      col(item.seqPad,           W[0]) +
      col(item.point.id,         W[1]) +
      col(item.subtask.lang,     W[2]) +
      col(item.subtask.sub_id,   W[3]) +
      col("W" + item.waveIndex,  W[4]) +
      col(status,                W[5]) +
      (rec ? rec.applied_at : "—")
    );
  });
  console.log(hr);
  console.log("Applied: " + nDone + "  |  Pending: " + nPending + "  |  Total: " + flow.length);
}

function cmdResume(flow, manifest, cfg) {
  const meta    = manifest.meta || {};
  const ver     = meta.manifest_version || meta.version || "unknown";
  const h       = loadHistory(cfg, ver);
  const applied = h.applied || {};
  const next    = flow.find(i => !applied[i.seqPad]);
  const nDone   = Object.keys(applied).length;

  if (!next) {
    console.log("🎉  All " + flow.length + " prompts applied — nothing left to do.");
    return;
  }
  const fname = buildFilename(next);
  const fpath = path.join(cfg.outDir, next.waveFolder, fname);
  console.log("Resuming from prompt " + next.seqPad);
  console.log("Applied: " + nDone + "  |  Remaining: " + (flow.length - nDone) + "  |  Total: " + flow.length);
  console.log("");
  console.log("Next:");
  console.log("  SEQ    : " + next.seqPad);
  console.log("  Point  : " + next.point.id + " — " + next.point.title);
  console.log("  Lang   : " + next.subtask.lang + "  (" + langLabel(next.subtask.lang, manifest) + ")");
  console.log("  Sub-ID : " + next.subtask.sub_id);
  console.log("  File   : " + fpath);
  console.log("");
  console.log("After applying:");
  console.log("  node prompt-handler.js --mark-applied " + next.seqPad);
}

// ─────────────────────────────────────────────────────────────────────────────
// MODULE 6 — CLI
// ─────────────────────────────────────────────────────────────────────────────

function printUsage() {
  console.log(`
prompt-handler.js  —  Generic Manifest Prompt Utility
══════════════════════════════════════════════════════

Reads any JSX/JS file containing an embedded manifest object, extracts all
sub-task work prompts, writes them as ordered .md files, and tracks which
prompts an agent has applied so work can be resumed at any time.

GENERIC FLAGS  (can be combined with any command)
─────────────────────────────────────────────────
  --file   <path>   -f <path>    Source file  [default: Lextr_Intelligence_Manifest_v8.jsx]
  --var    <name>   -v <name>    Variable name to extract  [default: MANIFEST]
  --out    <dir>    -o <dir>     Output folder  [default: ./prompts]
  --repo   <url>    -r <url>     Repository URL written into every prompt
  --branch <name>   -b <name>    Branch name written into every prompt
  --lang-order <l>  -l <l>       Comma-separated execution order  [default: SQL,JAVA,REGO,PY,TS,CYTO,TEST]

COMMANDS
────────
  --validate    -val
      Parse the manifest + integrity check. Exit 0 = OK, exit 1 = error.

  --flow        -fl
      Print the complete ordered flow table (SEQ, Wave, Point, Lang, Sub-task, Scope).

  --preview     -pre    <POINT-ID> <LANG>
      Print the fully rendered work prompt for one sub-task to stdout.
      Example:  node prompt-handler.js -pre LP-01 SQL

  --generate    -gen    [--force]
      Write all prompt .md files to <out>/wave-NN/ folders.
      Skips existing files unless --force is also passed.
      Also writes <out>/00_FLOW_INDEX.md.

  --status      -st
      Print every prompt as DONE or PENDING with applied timestamps.

  --mark-applied  -ma   <SEQ>
      Record that prompt SEQ has been applied.
      Example:  node prompt-handler.js -ma 001

  --resume      -res
      Show the next pending prompt and the command to continue.

EXAMPLES
────────
  # Default manifest — short flags
  node prompt-handler.js -val
  node prompt-handler.js -gen -r https://github.com/org/repo -b main
  node prompt-handler.js -pre LP-22 JAVA
  node prompt-handler.js -ma 001
  node prompt-handler.js -res
  node prompt-handler.js -st

  # Different manifest file and variable
  node prompt-handler.js -f SemlayerManifest.jsx -v SEMLAYER_MANIFEST -o ./sl-prompts -val

  # Custom language order
  node prompt-handler.js -l PY,TS,JAVA,SQL,TEST -gen
`);
}

function printFlow(flow, manifest) {
  const col = (s, w) => String(s == null ? "" : s).padEnd(w).slice(0, w);
  const meta = manifest.meta || {};
  const ver  = meta.manifest_version || meta.version || "unknown";

  console.log(
    col("SEQ", 4) + "  " + col("WAVE", 8) + "  " + col("POINT", 8) + "  " +
    col("LANG", 6) + "  " + col("SUB-TASK-ID", 13) + "  SCOPE"
  );
  console.log("─".repeat(90));
  flow.forEach(item => {
    console.log(
      col(item.seqPad,          4) + "  " +
      col("W" + item.waveIndex, 8) + "  " +
      col(item.point.id,        8) + "  " +
      col(item.subtask.lang,    6) + "  " +
      col(item.subtask.sub_id, 13) + "  " +
      (item.subtask.scope || "").slice(0, 55)
    );
  });
  console.log("─".repeat(90));
  const waveCount = new Set(flow.map(i => i.waveIndex)).size;
  console.log(
    "Total: " + flow.length + " prompts  |  " + waveCount + " waves  |  manifest v" + ver
  );
}

// ─── entry point ─────────────────────────────────────────────────────────────

function main() {
  const cfg = parseArgs(process.argv.slice(2));

  if (!cfg.cmd) {
    printUsage();
    process.exit(0);
  }

  // ── parse manifest ──────────────────────────────────────────────────────────
  let manifest;
  try {
    manifest = extractManifest(cfg.file, cfg.varName);
  } catch (e) {
    console.error("ERROR (parser): " + e.message);
    process.exit(1);
  }

  // ── --validate ──────────────────────────────────────────────────────────────
  if (cfg.cmd === "--validate") {
    const issues = validateManifest(manifest);
    const pts    = manifest.points || [];
    const subs   = pts.reduce((a, p) => a + (p.subtasks || []).length, 0);
    const waves  = ((manifest.exec && manifest.exec.waves) || []).length;
    const meta   = manifest.meta || {};
    const ver    = meta.manifest_version || meta.version || "unknown";
    if (issues.length === 0) {
      console.log(
        "MANIFEST OK · " + pts.length + " points · " + subs + " sub-tasks · " +
        waves + " waves · v" + ver + "  [" + path.basename(cfg.file) + " / " + cfg.varName + "]"
      );
      process.exit(0);
    } else {
      console.error("MANIFEST INVALID — " + issues.length + " issue(s):");
      issues.forEach(i => console.error("  · " + i));
      process.exit(1);
    }
  }

  // ── resolve flow ────────────────────────────────────────────────────────────
  let flow;
  try {
    flow = resolveFlow(manifest, cfg);
  } catch (e) {
    console.error("ERROR (flow resolver): " + e.message);
    process.exit(1);
  }

  // ── --flow ──────────────────────────────────────────────────────────────────
  if (cfg.cmd === "--flow") {
    printFlow(flow, manifest);
    process.exit(0);
  }

  // ── --preview <POINT-ID> <LANG> ─────────────────────────────────────────────
  if (cfg.cmd === "--preview") {
    const ptId = cfg.extraArgs[0];
    const lang = cfg.extraArgs[1];
    if (!ptId || !lang) {
      console.error("Usage: node prompt-handler.js --preview <POINT-ID> <LANG>");
      console.error("Example: node prompt-handler.js --preview LP-01 SQL");
      process.exit(1);
    }
    const item = flow.find(i => i.point.id === ptId && i.subtask.lang === lang);
    if (!item) {
      const avail = flow.filter(i => i.point.id === ptId).map(i => i.subtask.lang).join(", ");
      console.error(
        "ERROR: No sub-task for " + ptId + "/" + lang +
        (avail ? ".  Available langs for " + ptId + ": " + avail : "  (point not found)")
      );
      process.exit(1);
    }
    console.log(renderPrompt(item.point, item.subtask, manifest, cfg));
    process.exit(0);
  }

  // ── --generate ──────────────────────────────────────────────────────────────
  if (cfg.cmd === "--generate") {
    const result = writePromptFiles(flow, manifest, cfg);
    console.log("✓  Generated " + result.written + " prompt files  →  " + cfg.outDir);
    if (result.skipped > 0)
      console.log("   Skipped " + result.skipped + " existing files (pass --force to overwrite)");
    console.log("   Flow index: " + cfg.indexFile);
    const waveSummary = {};
    flow.forEach(i => { waveSummary[i.waveFolder] = (waveSummary[i.waveFolder] || 0) + 1; });
    Object.entries(waveSummary).forEach(([w, n]) =>
      console.log("   " + w + "/  —  " + n + " prompt" + (n !== 1 ? "s" : ""))
    );
    process.exit(0);
  }

  // ── --status ────────────────────────────────────────────────────────────────
  if (cfg.cmd === "--status") {
    cmdStatus(flow, manifest, cfg);
    process.exit(0);
  }

  // ── --mark-applied <SEQ> ────────────────────────────────────────────────────
  if (cfg.cmd === "--mark-applied") {
    const raw = cfg.extraArgs[0];
    if (!raw) {
      console.error("Usage: node prompt-handler.js --mark-applied <SEQ>  (e.g. 001)");
      process.exit(1);
    }
    cmdMarkApplied(String(raw).padStart(3, "0"), flow, manifest, cfg);
    process.exit(0);
  }

  // ── --resume ────────────────────────────────────────────────────────────────
  if (cfg.cmd === "--resume") {
    cmdResume(flow, manifest, cfg);
    process.exit(0);
  }

  // unknown command
  console.error("Unknown command: " + cfg.cmd);
  printUsage();
  process.exit(1);
}

main();
