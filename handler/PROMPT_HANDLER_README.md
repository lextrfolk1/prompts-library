# Prompt Handler Utility

Reads `Lextr_Intelligence_Manifest_v8.jsx`, extracts all sub-task work prompts from the embedded MANIFEST, organises them into a wave-ordered folder structure, and tracks which prompts an AI agent has already applied — so work can be resumed at any time.

## Prerequisites

- Node.js ≥ 16
- No `npm install` needed — zero external dependencies

## Quick Start

```bash
# 1. Verify the manifest was parsed correctly
node prompt-handler.js --validate

# 2. See the full ordered list of prompts
node prompt-handler.js --flow

# 3. Generate all prompt files to disk
node prompt-handler.js --generate

# 4. Open the first prompt and paste into your AI agent
cat prompts/wave-01/001_LP-01_SQL_*.md

# 5. Mark it as applied
node prompt-handler.js --mark-applied 001

# 6. See what's next
node prompt-handler.js --resume
```

---

## How It Works

The JSX file contains a `MANIFEST` object with **39 logic points** (LP-01 → LP-39), each with sub-tasks across different technologies. The utility:

1. **Parses** the `MANIFEST` JSON out of the JSX using brace-depth counting (the blob is a single ~50 kB line — simple regex would fail)
2. **Resolves the flow** — walks `exec.waves` in order, topologically sorts LPs by `depends_on`, then orders sub-tasks within each LP by tech layer (`SQL → JAVA → REGO → PY → TS → CYTO → TEST`)
3. **Renders a prompt** for every sub-task — the same `workPrompt()` text the browser console generates, ported verbatim to Node.js
4. **Writes `.md` files** into numbered, wave-organised folders
5. **Tracks history** in `applied-history.json` so the agent can pick up where it left off

---

## Commands

| `--validate` | Parse manifest + integrity check. Exit 0 = OK, exit 1 = errors |
| `--flow` | Print the full ordered flow table (SEQ, Wave, LP, Lang, Sub-task ID, Scope) |
| `--preview LP-01 SQL` | Print the rendered prompt for one sub-task to stdout |
| `--generate` | Write all prompt `.md` files to `prompts/` |
| `--generate --force` | Same, but overwrite existing files |
| `--status` | Show every prompt as DONE or PENDING with timestamps |
| `--mark-applied 001` | Record prompt 001 as applied (writes to `applied-history.json`) |
| `--resume` | Show the next pending prompt and the exact command to continue |

---

## Output Structure

```
prompts/
  00_FLOW_INDEX.md              ← master ordered table of all prompts
  wave-01/
    001_LP-01_SQL_apply-the-intelligence-schema-as-fly.md
    002_LP-02_TS_tenant-theming-embeddable-design-syste.md
  wave-02/
    003_LP-03_JAVA_...md
    004_LP-03_SQL_...md
    005_LP-03_REGO_...md
    ...
  wave-03/
    ...
  wave-06/
    ...LP-22 (Skill Registry)...
    ...LP-37 (UC2 Impact)...
    ...LP-38 (UC3 Trend)...
  wave-07/
    ...LP-39 (TDM)...
    ...LP-25 (UC11 Rules)...
  wave-08/
    ...global standards (LP-29 → LP-35)...
  wave-09/
    NNN_LP-36_TEST_...md
  applied-history.json          ← tracks which prompts are done
```

### File naming

Every file is named:

```
{SEQ}_{LP-ID}_{LANG}_{scope-slug}.md
```

For example:
```
001_LP-01_SQL_apply-the-intelligence-schema-as-flyway.md
025_LP-11_JAVA_skill-3-assembly-slm-the-only-slm-call.md
137_LP-36_TEST_cross-manifest-recon-gate-standing-test.md
```

The numeric prefix keeps files in the correct order in any file explorer.

---

## Execution Order

Prompts are ordered by three rules applied in sequence:

1. **Wave** — Wave 1 through Wave 9, respecting the manifest's sequencing rationale
2. **`depends_on`** — within a wave, LPs are topologically sorted so prerequisites come first (e.g. LP-22 before LP-39, since TDM depends on the Skill Registry)
3. **Language layer** — within a logic point, sub-tasks follow build order:

| Priority | Lang | Layer |
|----------|------|-------|
| 0 | SQL | Schema (must exist before the service) |
| 1 | JAVA | Backend service |
| 2 | REGO | OPA policy |
| 3 | PY | Python AI runtime |
| 4 | TS | Frontend |
| 5 | CYTO | Graph/viz |
| 6 | TEST | Wire-through tests (always last) |

---

## Each Prompt File

Every `.md` file contains a complete, self-contained work prompt with these sections:

```
# WORK PROMPT — {sub_id} · {lang} · {layer}

## Role
## Exposed codebase (this session)
## UPSTREAM/DOWNSTREAM INTEGRATION   ← only if the LP has upstream deps
## STEP 1 — Discover before you write (NON-WAIVABLE)
## Prior corrections                  ← only if adjustments exist
## Parent logic point
## Background (decided — do not re-open)
## STEP 2 — Deliver this sub-task
## Tests must cover (>=90%)
## Pinned stack
## Fixed contract
## Governance bars (non-waivable)
## Reference
## STEP 3 — Emit ADJUSTMENTS record at completion
## Output
```

LP-01/SQL additionally embeds the full DDL body inline so the agent has the schema copy-run ready.

---

## History File

`prompts/applied-history.json` is created automatically on the first `--mark-applied` call:

```json
{
  "manifest_version": "1.8.0",
  "generated_at": "2026-08-25T10:00:00.000Z",
  "applied": {
    "001": {
      "applied_at": "2026-08-25T10:05:00.000Z",
      "lp_id": "LP-01",
      "sub_id": "LP-01.1",
      "lang": "SQL"
    },
    "002": {
      "applied_at": "2026-08-25T11:20:00.000Z",
      "lp_id": "LP-02",
      "sub_id": "LP-02.1",
      "lang": "TS"
    }
  }
}
```

---

## Repo / Branch Placeholders

Each prompt contains:

```
- Repository: <REPO NOT SET — fill in the console>
- Branch: <BRANCH NOT SET — fill in the console>
```

Before feeding a prompt to your agent, replace these two values with the actual repo URL and branch you're working on. You can do this with a simple find-replace in your editor, or prepend the info at the top of the prompt.

---

## Agent Workflow (end-to-end)

```bash
# One-time setup
node prompt-handler.js --generate

# Per-prompt loop
cat prompts/wave-01/001_LP-01_SQL_*.md   # read the prompt
# → paste into AI agent, get the deliverable, review it
node prompt-handler.js --mark-applied 001

cat prompts/wave-01/002_LP-02_TS_*.md
# → paste into AI agent ...
node prompt-handler.js --mark-applied 002

# Check progress any time
node prompt-handler.js --status

# Resume after a break
node prompt-handler.js --resume
```

---

## Manifest Version

This utility was built against manifest **v1.8.0** (`package: stable_v8`).  
Current counts: **39 logic points · 137 sub-tasks · 9 waves**.

If the JSX file is updated to a new manifest version, re-run `--generate --force` to regenerate all prompt files from the updated data.
