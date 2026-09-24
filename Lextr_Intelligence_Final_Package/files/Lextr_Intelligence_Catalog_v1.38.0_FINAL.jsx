import { useState } from "react";

// ─── LEXTR THEME (light) ────────────────────────────────────────────────────
const C = {
  bg: "#FFFFFF", surface: "#F8FAFC", card: "#FFFFFF", border: "#E2E8F0", borderL: "#CBD5E1",
  teal: "#0D9488", tealD: "#0F766E", blue: "#2563EB", blueL: "#3B82F6",
  purple: "#7C3AED", purpleL: "#8B5CF6", amber: "#D97706", red: "#DC2626",
  green: "#059669", slate: "#64748B", text: "#1E293B", textM: "#475569", textD: "#94A3B8",
};
const MONO = "'JetBrains Mono', 'Fira Code', 'Courier New', monospace";
const STATUS = {
  confirmed: { label: "Confirmed", color: C.green },
  design:    { label: "Design",    color: C.blue },
  pending:   { label: "Pending Foundation", color: C.amber },
  reference: { label: "Reference", color: C.purple },
  revision:  { label: "In revision", color: C.amber },
};

// ─── PRIMITIVES ─────────────────────────────────────────────────────────────
const Tag = ({ label, color = C.teal }) => (
  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase",
    padding: "2px 7px", borderRadius: 4, border: `1px solid ${color}33`, color, background: `${color}15`, display: "inline-block" }}>{label}</span>
);
const Pill = ({ children, color = C.teal }) => (
  <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 9px", borderRadius: 20,
    background: `${color}20`, color, border: `1px solid ${color}30`, display: "inline-flex", alignItems: "center", gap: 4 }}>{children}</span>
);
const Arrow = ({ color = C.border }) => (
  <svg width={16} height={16} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
    <path d="M8 0 L8 14 M3 9 L8 14 L13 9" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Layer = ({ title, tag, color, children, style = {} }) => (
  <div style={{ border: `1px solid ${color}35`, borderRadius: 12, overflow: "hidden", background: `${color}08`, ...style }}>
    <div style={{ padding: "8px 14px", borderBottom: `1px solid ${color}25`, display: "flex", alignItems: "center", gap: 8, background: `${color}12` }}>
      <span style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: ".04em" }}>{title}</span>
      {tag && <Tag label={tag} color={color} />}
    </div>
    <div style={{ padding: 14 }}>{children}</div>
  </div>
);
const Card = ({ icon, label, color, children }) => (
  <div style={{ background: C.card, border: `1px solid ${color}30`, borderRadius: 10, padding: 12, borderLeft: `3px solid ${color}`, boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span style={{ fontSize: 11, fontWeight: 700, color }}>{label}</span>
    </div>
    <div style={{ fontSize: 10, color: C.textM, lineHeight: 1.6 }}>{children}</div>
  </div>
);
const SectionTitle = ({ children, color = C.teal }) => (
  <div style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 12 }}>{children}</div>
);
const StatusChip = ({ s }) => {
  const st = STATUS[s]; if (!st) return null;
  return <span style={{ fontSize: 7.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase",
    padding: "1px 5px", borderRadius: 3, color: st.color, background: `${st.color}18`, border: `1px solid ${st.color}30` }}>{st.label}</span>;
};

// ─── SIDEBAR NAV ────────────────────────────────────────────────────────────
const NAV_GROUPS = [
  { group: "ARCHITECTURE", items: [["pillars","Capability Map","confirmed"],["overview","Overview & Flow","confirmed"],["core","Intelligence Core","confirmed"],["entry","Entry Points & Lexie","confirmed"]] },
  { group: "DATA & SCHEMA", items: [["schema","Intelligence Schema","confirmed"],["kg","Knowledge Graph","confirmed"],["hub","Knowledge Hub","confirmed"]] },
  { group: "ENGINE", items: [["skills","Agent Skills","design"],["model","Model Abstraction","confirmed"],["masking","Masking & Handover","design"]] },
  { group: "CAPABILITIES", items: [["usecases","Use Cases","design"],["variance","Variance Analysis","confirmed"],["digitaltwin","Digital Twin (Lexie)","design"],["rulesassist","Rules & Logic Assist","design"],["analyticalassist","Analytical Report Assist","design"],["narrative","Narrative Generator","design"],["anomaly","Anomaly Detection","design"],["charts","Chart Set & Output","design"]] },
  { group: "GOVERNANCE", items: [["govconsole","Governance Console","reference"],["presetmgmt","Preset Management","confirmed"],["opa","OPA Policies","design"],["compliance","Compliance-by-Design","design"],["regmap","Regulatory Mapping","design"],["review","Human Review & MRM","confirmed"]] },
  { group: "PLATFORM", items: [["stack","Tech Stack","confirmed"],["apis","Adapter & APIs","confirmed"],["hostdeps","Host Dependencies","design"],["deploy","Deployment Model","confirmed"],["manifest","Deployment Manifest","reference"]] },
  { group: "DESIGN SYSTEM", items: [["dsshell","Shell & Theming","confirmed"],["dscomponents","Component Library","confirmed"],["dswiring","Core Wiring","confirmed"]] },
];
const PROCESS_TABS = [["sequence","Chat Sequence"],["required","Decisions Required"],["made","Decisions Made"],["pending","Pending / Blocked"]];

const CHATS = [
  { n:"0", name:"Discovery & Blueprint", status:"done", produces:"Blueprint, SPEC_AI_Preset_Lexie, SPEC_Agent_Skill_Model, tech-stack 1-pager, this catalog" },
  { n:"0b", name:"Governance Console (LexIntl 0)", status:"done", produces:"Governance UI prototype: 7-step preset wizard, runtime policy register (OPA-AI-001 etc.), role mapping, MRM, audit/evidence, clause→policy extraction. Reconcile to Foundation contracts before build." },
  { n:"1", name:"Foundation Chat", status:"done", produces:"✓ schema · ✓ architecture · ✓ adapter · ✓ model layer · ✓ decision table (5 of 5 — complete)" },
  { n:"2", name:"Core Build Chat", status:"done", produces:"Engine complete (D1–D8 + #12) + UC1a vertical slice end-to-end: ✓ DAO · ✓ control plane · ✓ host adapter · ✓ model layer · ✓ skill runtime · ✓ persistence + review · ✓ preset wizard (MRM-gated) · ✓ recovery sweep · ✓ embeddings + retrieval + NLU/ask (all 4 entry points live). Widening to UC2–UC9 happens in the use-case chats (5–8)." },
  { n:"2b", name:"Design System & Shell", status:"done", produces:"Component foundation complete (6 deliverables): ✓ theming spine · ✓ app shell · ✓ contracts + client · ✓ D4 atoms · ✓ D5 evidence + review · ✓ D6 chart set. Masking held end-to-end (schema → chart tooltip). Shell-mounting the surfaces = chat 8 (Integration); the 3 backend wire confirmations are tracked separately. Use-case chats (5–7) build on this substrate." },
  { n:"3", name:"Knowledge Hub Chat", status:"done", produces:"Complete — the loop closes: ✓ D1 persistence + ingestion · ✓ D3 chunking + embedding (governed D8 path) · ✓ D2 management front-end (on 2b shell) · ✓ D5 retrieval as complementary context (reuses D8 retrieval, one space, OPA entitlement-gated, AI_PROHIBITED hard-stopped, query embedding governed). The corpus now grounds runs. D4 (full doc_type ranking model) reserved as a later enhancement — D5's doc_type bias is its placeholder." },
  { n:"4", name:"Preset Management", status:"done", produces:"Complete (6 deliverables): ✓ PM-1 wire + shell · ✓ PM-2 steps 1–3 · ✓ PM-3 steps 4–7 (regression risk closed) · ✓ PM-4 live validation + commit · ✓ PM-5 lifecycle + activation (MRM gate visible+honest, non-blocking SoD) · ✓ PM-6 preset governance audit (current-state + MRM record, transition-history gap flagged; reuses D5 evidence viewer + PM-5 chips). On the 2b shell/atoms + the D5 evidence viewer. Two integration edits flagged at wire-up (D5 viewer prop/path; runs-by-preset source)." },
  { n:"5", name:"Variance Analysis", status:"done", produces:"The flagship use-case (#1), feature-complete; the correction rerun (V-1…V-6) is COMPLETE — masking-display split, 4-level pyramid, and trend evidence all folded in, full suite 36/36 green. Shape: horizontal (V-2/V-3) + vertical bounded multi-path DAG drill-down (V-4 revised / V-5), report-aware via AI presets (Y-9C cell-based vs Y-14Q-H granular, proven end-to-end in V-6). Fine-tuned SLM (4,000+ samples). ✓ V-1 contract+presets+SLM+tool_scope · ✓ V-2 horizontal skill+run flow · ✓ V-3 horizontal screens · ✓ V-4 vertical DAG (convergent-node dedup, no double-count) · ✓ V-5 drill screens · ✓ V-6 report-type finalization + consolidated handoff. Full suite 23/23. Integration carries: KG wiring (OI-11), D6 DAG-trace as one agent_run (OI-8), EvidenceLedgerViewer shape (OI-10), real model_id. ANCHOR (10-Q/10-K) + FP&A RECON evidence sub-steps now BUILT & MERGED into the baseline (bounded SkillThree EVIDENCE — signal-only, never drivers/unmask; variance suite 48/48). GAP 1 — variance 'Re-run with my input' + analyst-attributed driver provenance + preset-change audit — COMPLETE (D1-D5): DriverProvenance system|analyst_attributed with nullable driver (analyst hypothesis = annotation, NOT a new DriverCategory; excluded from horizontal-weakness), analyst steer masked via MaskingBoundary.mask_text, POST /run/{runId}/rerun re-resolves the LATEST governed preset with parent_run_id lineage + an additive rerun_audit capturing any preset change; variance suite 52/52 (48+4). Two pre-existing seams to wire: a synchronous variance controller returning RunResult incl. runId, and the rich VarianceExplanation through the Java/HTTP boundary (closing the first closes the second)" },
  { n:"6", name:"Use-case chats (UC2…UC9)", status:"active", produces:"One UC per chat (relay; baton = this catalog). ✓ UC12 Operational Data Query BUILT (first UC build — D0 sim · D1 skill · D2 coordinator+preset · D3 Rego · D4 reference renderer · D5 reconciled deployment pkg; 9/9 skill tests · 8/8 UI parse-gate · 7/7 cross-language reconciliation). ✓ UC8 Semantic & Reference Query BUILT (chat 6) — D0 sim (6 scenarios) · D1 lexie-ai skill (bounded IntentRouter + 3 lanes + semantic_exposure_ops/_business_ops + contract delta) · D2 intelligence-service (SemanticRunCoordinator + SemanticPresetResolver + RunResult mirror dataset/intent/routeOut) · D3 tool_scope_semantic.rego (+ pre-existing variance-rego brace fix) · D4 features/semantic renderer (SemanticAnswer + DatasetTable/VersionDiffView/RouteOutNotice) · D5 reconciled deployment pkg upto_UC8. Whole-tree: 92 py_compile · 18/18 UC8 + 75/75 all skill suites · 113/113 Java structural (incl. 3 JUnit) · 11/11 Rego balanced + truth-table (360 cases) · 122 UI parse-gate · 9/9 cross-language reconciliation · 0 dup groups; 23 NEW (incl. 3 JUnit) + 4 MOD, ~2,415 SLOC. Remaining dependency-sound early builds with NO KG: UC3 Trend, UC4 Concentration, UC7 Validation. ✓ UC2 Impact Analysis BUILT (chat 6) — D0 sim · D1 impact skill (22/22) · D2 coordinator+preset+mirror · D3 tool_scope_impact (448-case truth-table) · D4 features/impact · A1 generalized subjects · D5 reconciled pkg upto_UC2 (12/12 reconciliation). Cross-report edge-gated (Core edges). KG/edge work: UC5a WALK-within, UC6 Risk, UC8 Semantic; then UC5b WALK-across + UC9 Lexie twin (last, orchestrates all)." },
  { n:"7", name:"Lexie Analytical Assist (UC10)", status:"todo", produces:"Report discovery & construction. New adapter ops (search_report_inventory, get_report_definition, build/handoff) + report_match_set output. Separate entry, same Core." },
  { n:"7b", name:"Rules & Logic Assist (UC11)", status:"todo", produces:"Authoring COPILOT for the human rule author — NOT validation (UC7) or impact-reading (UC2). Drafts rule syntax scoped to COE + MDRM/Taxonomy with a mandatory rationale, from 3 sources (Semantic Layer incl. enumerations/filter-lookups · registered regulatory docs · business strategy); commonality vs the EXISTING rules inventory (reuse/fork-edit); impact (rule change → other rules). Lextr Core owns the authoring platform/engine + the fixed published edit-check rules (Intelligence aligns them to Lextr grammar, never alters regulator logic). Propose-only; human authors & commits in Core. Sequenced LAST — after UC9 (twin) + UC10 (analytical), both inform it. PLAN CAREFULLY: open grammar/handoff fork (Intelligence emits Lextr grammar vs hands a structured intent to Core); new rule_draft output type (Deliverable-#1 delta); seam deps get_semantic_catalog + get_rules + build/handoff to Core authoring." },
  { n:"7c", name:"Audit & Evidence", status:"todo", produces:"The cross-product compliance surface — one pane of glass across agent/run evidence, presets, reviews, and policy events. Agent + overall, not preset-specific (preset's own audit lives in AI Preset Management). Reuses the D5 evidence viewer + status atoms; aggregates and makes auditable everything the engine records. Comes after the use-case builds so it aggregates them all. For the compliance function. SKILL PROVENANCE requirement (recorded): must show WHICH registered skill (id + version) ran, WHEN, and for WHAT purpose — today agent_run/agent_run_step capture intent + foundational skill (SKILL_1/2/3) + tool_called + preset + timestamps, but NOT the functional skill id+version (e.g. variance.horizontal v3); close via an additive skill_ref+skill_version column." },
  { n:"8", name:"UX/UI Integration", status:"todo", produces:"Integrate all surfaces into one coherent product: governance console + per-use-case screens + Lexie panel + analytical assist, on the shared shell, wired to the Core's Trigger API + persistence contract. The single owner of the whole front end." },
];
const REQUIRED = [
  ["UC9 v1 allow-list (D5 flag #3) — union of all patterns, or a narrower live subset at first launch?","SME + tech lead"],
  ["Neo4j GPL-3 — record deliberate decision before M4 / UC2","Tech lead + SME"],
  ["Fast-track vs. tool-calling — test Qwen3-4B reliability","Tech lead / AI"],
  ["Latency strategy — 35s baseline (caching, streaming, vLLM)","Tech lead"],
  ["'core' naming collision — schema vs. Lextr Core vs. Intelligence Core","Tech lead + SME"],
  ["Reviewer identity / separation of duties — same analyst or second person? Known shape (D7): coarse 'may approve at all' = Keycloak/OPA role; fine SoD (approver≠author, four-eyes) = an MRM-SoD OPA gate (lextr.ai.mrm_separation_of_duties) before envelopeDao.approve(), fed {envelope_id, author, approver, tenant}. Decision = confirm + build the gate","SME + compliance"],
  ["Before-run vs. after-run input surface (UX)","SME"],
  ["Brand-blue reconciliation (2b) — primary=#253DE0 (logo blue) for product chrome; teal=secondary + #2878cc=info preserved for lineage accents. Confirm chrome blue should equal logo blue, or specify a different chrome blue","SME"],
  ["Charting library (2b D6) — recharts used (isolated behind LextrChart). Confirm recharts is acceptable, or does Lextr Core already standardize on a charting lib (Chart.js / AG-Charts / ECharts)? Swap is internals-only if so","Tech lead"],
  ["MRM separation-of-duties identity (PM-5) — for the forbidden self-approval, is 'the author' the PRESET author (preset.createdBy, what PM-5 compares today) or the ENVELOPE creator/submitter? The envelope DTO carries no author field today. Server-side MRM-SoD OPA gate enforces regardless, but the warning note must reference the right identity. Ties into the open reviewer-identity-per-use-case decision","SME + compliance"],
];
const MADE = [
  ["Tech stack confirmed — Spring Boot, React.js, Neo4j, OPA, semantic-service","Discovery"],
  ["lexie-ai = full FastAPI service, 187 tests, working Qwen3-4B","Discovery"],
  ["SLM spec — Qwen3-4B + QLoRA, MiniLM-L6-v2 384-dim","Discovery"],
  ["Deployment — on-prem + SaaS A (default) / B (premium)","Discovery"],
  ["Model strategy — SLM out-of-box, LLM integration-ready, per-tenant","Discovery"],
  ["FRY9C KG — 1,885 nodes, 4,056 edges, loaded in Neo4j","Discovery"],
  ["intelligence schema greenfield; rename ai→intelligence","Discovery"],
  ["Three-part call assembly model (API + preset + user input)","Discovery"],
  ["Masking — semantic, RESTRICTED/CONFIDENTIAL only, handover protocol","Discovery"],
  ["Human review always-on, structural (not confidence-gated)","Discovery"],
  ["Preset = two-layer (expert prompt inside governance envelope)","Discovery"],
  ["One unified Lexie panel + Context:Auto + 3 trigger sources","Discovery"],
  ["Schema reviewed — V1 DDL drafted: 12 tables, typed enums, governance_envelope added","Foundation"],
  ["Evidence ledger lives in intelligence schema (Fork A)","Foundation"],
  ["embedding_store CHECK-pinned vector(384); sibling table for other dims (Fork B)","Foundation"],
  ["Review recorded at run level; 1:1 parent_run_id enough for M3–M4 (M:N at UC6)","Foundation"],
  ["data_classification enum: SENSITIVE masked, AI_PROHIBITED hard-deny","Foundation"],
  ["PK type = BIGINT GENERATED ALWAYS AS IDENTITY (was O1) — matches ERP DAO","Foundation"],
  ["Core is polyglot: Java intelligence-service (control plane) + Python lexie-ai (AI runtime)","Foundation"],
  ["intelligence-service is sole writer of the schema; lexie-ai persists via its HTTP API","Foundation"],
  ["Masking is host-side in the Core adapter (decision 6.2) — raw never enters the Core in SaaS","Foundation"],
  ["Evidence steps buffered in-run, flushed in one transaction before review","Foundation"],
  ["Tenancy (O2): single-tenant per deployment = isolation boundary; no RLS day 1","Foundation"],
  ["Multi-tenant built in: client_id everywhere addresses a multi-tenant host's slice today","Foundation"],
  ["Option-A seam confirmed (6.1): intelligence-service sole schema writer under its own FID","Foundation"],
  ["NLU (6.3): rules + embeddings to start (not SLM); /resolve contract swap-ready","Foundation"],
  ["Adapter = Python ABC in lexie-ai, reaches host via gateway HTTP — services, never DBs","Foundation"],
  ["Adapter enforces 3 boundary rules: mask-before-return, EXCLUDED never returned, client_id required","Foundation"],
  ["Edit-check split: definitions on rules service, traversal on graph_* (Skill 2)","Foundation"],
  ["client_id in adapter signatures AND at the persistence boundary. SUPERSEDED: this line read ≡ the other name at persistence, which is the reverse of what the schema does - db_conventions requires client_id on every scoped row and the DDL declares it on all twelve tables. The decision recorded here was overtaken and nobody closed it","Foundation"],
  ["Model layer (D4 final): generation + embedding are SEPARATE connector hierarchies","Foundation"],
  ["generate() returns GenerateResult (token counts + finish_reason); .text preserves SPEC contract","Foundation"],
  ["Routing most-specific-wins (preset→tenant→platform); degrade to Tier-1, never fail","Foundation"],
  ["Three OPA gates: pre-run + pre-external-call + pre-embedding; is_local() is the keyed property","Foundation"],
  ["Mixed embedding spaces: retrieval filters by active embedder model_id; embedder swap = re-embed","Foundation"],
  ["UC10 inventory knowledge: inference-first (structure + semantic layer), registration optional","Design"],
  ["Decision table (D5): 3 categories — Simple / Simple-agentic / Agentic-bounded; all max_steps ≤ 8","Foundation"],
  ["Simple use-cases (UC2, UC7) have no model_abstraction.call — physically cannot reach the model","Foundation"],
  ["UC2 re-baselined: within-report impact now, cross-report with the edge build","Foundation"],
  ["Rules & Logic Assist (UC11) scope LOCKED: an authoring COPILOT for the human rule author — NOT impact/validation reading. Drafts rule syntax (scoped to COE + MDRM/Taxonomy) with a mandatory rationale, from 3 sources (Semantic Layer incl. enumerations/filter-lookups · registered regulatory docs · business strategy); commonality analysis vs the EXISTING rules inventory (reuse/fork-edit); impact assessment (rule change → other rules). Lextr Core owns the authoring platform/engine + the fixed published edit-check rules (Intelligence aligns them to Lextr grammar, never alters regulator logic). Propose-only; human authors & commits in Core. Sequenced LAST, after UC9 + UC10 (both inform it). PLAN CAREFULLY. Open: grammar/handoff fork (Intelligence emits Lextr grammar vs hands structured intent to Core); new rule_draft output type (Deliverable-#1 delta); seam deps get_semantic_catalog + get_rules + build/handoff. Corrects the earlier catalog conflation that mapped Rules Assist onto UC2 Impact.","SME + Core"],
  ["Use-case → LHP capability tagging ADDED to the roadmap (new Capability column): UC2-UC9 are COMPONENTS OF the Digital Twin. UC9 = the ORCHESTRATION that composes them; UC3/UC4/UC5a/UC5b/UC6/UC7/UC8/UC12 = component skills. UC1a/b → Variance; UC2 → Digital Twin · Rules Assist (cross); UC10 → Analytical Report Assist; UC11 → Rules & Logic Assist.","SME"],
  ["UC12 Operational data query (NEW Digital Twin component): reasons over WORKFLOW/operational status — report due dates, where approval is sitting and since when, aging, routing — NOT data values or report metadata. Maps to the Orchestration Intelligence pillar; needs new Core-workflow adapter ops (get_workflow_status / get_approval_state) as a consume-from-host seam. Placed in the Digital Twin cluster, before UC9.","SME + Foundation"],
  ["[SUPERSEDED 2026-07-17 → see the UC2 SCOPE RE-DECISION entry below] Impact SIMULATION (what-if: 'impact of a $10 topside on MDRM 1245', 'impact of XYZ') is OWNED BY LEXTR CORE's engine, NOT Intelligence — Core needs it at topside/adjustment-passing time (show where else it impacts and by how much) and in several other places. Deferred; NOT an Intelligence UC. UC2 stays STRUCTURAL impact (graph traversal → downstream line/edit-check list). Intelligence may later call/surface Core's simulation but does not own it.","SME + Core"],
  ["UC2 BUILT (chat 6) + REBASELINE upto_UC2. Bounded DETERMINISTIC two-pass impact built across all 4 services + reconciled deployment pkg — NO SLM BY CONSTRUCTION (3 layers: no model port on ImpactSkill · ImpactPresetResolver.ModelBindingForbiddenException · no model op in tool_scope_impact.rego; denied under EVERY datum combination, proven). D1 lexie-ai: skills/impact (ImpactSkill = Skill-2 BFS reused direction=downstream, bounds as RECORDED stops, convergence-once; ImpactPropagator = topological Δ accumulation counted once per edge, first-order divided_by recompute on model-safe operands, honesty ladder computed→structural_only→direction_only + partial-operator-coverage rule; SimpleCheckEvaluator = closed-subset comparisons, REFUSES conditionals/multiplicatives/masked/unknown to undetermined+reason) + adapter/impact_ops.py (impact.get_dependents one-hop WITH operators · get_related_edit_checks · get_values dual-form · evaluate_edit_checks [SEAM: Core DAG engine authority]) + contract delta (RunRequest.adjustment; RunOutput.impact — additive optional). D2: ImpactPresetResolver (no-model + closed-op-set + output-type sanity) + ImpactRunCoordinator (honest-empty IS an answer: persisted+reviewed; needs_input persisted not reviewed) + Java mirror field-for-field w/ 7-arg AND 11-arg compat ctors + 2 draft presets (model_id null; bounds Y-9C 8/25/300/1000) + 14 JUnit. D3: tool_scope_impact.rego (5-op allow-list; graph_ready/cross_report_ready both passes/evaluate_ready=the DD-4 authority switch — deny routes the skill to local_simple, datum flip makes Core authoritative w/ zero code change; verbatim deny reasons lockstep rego↔python↔emitted; impact_-prefixed local rules avoid the composed-package graph_ready collision) + impact_data.json (3 datums default false) + 19 opa tests + 448-case Python truth-table (decision AND reason-set equality vs an independent implementation). D4: features/impact (ImpactAnswer/ImpactTable/ImpactPathView — ladder chips WITH reasons; direction_only NEVER shows a magnitude; evaluated_by provenance; bounds_hit recorded-stops banner; honest-empty renders the VERBATIM reason; lineage edges DERIVED from path[] — no contract change; token-only brand-free). A1 GENERALIZATION (approved mid-relay, applied additively): ANY subject node kind (element·line·cell·schedule·report·edit_check·rule·coa_account·attribute) + non-value change_kinds (rule_change/definition_change/mapping_change → Pass 1 + affected-check IDENTIFICATION, structural BY CONSTRUCTION, checks undetermined deferring to Core — nothing fabricated); policy provably kind-neutral (reachability per kind is graph CONTENT: seams S1 lines/schedules/cells · S2 check nodes · S3 COA mapping · S4 attributes each light up with ZERO code change); COA topside runs BOTH passes through the mapping edge (tested). Validation: py_compile 101/101 · 22/22 UC2 + 139/139 all skill suites + 17 runtime · Java structural 35 checks/117 files · Rego 13/13 balanced + 448-case truth-table · UI parse-gate 128/128 + 0 NEW import breaks (141 pre-existing barrels unchanged) + token parity + 24-assert FE-mirror lockstep · 12/12 cross-language reconciliation · D0 sim harness 56/56 + feature-sim 18/18 (both runnable in-package) · rebaselined from pristine upto_UC8: 0 files dropped, ADDED == exactly 35 NEW, 0 dup groups. 35 NEW + 4 MOD, ~7,4K/5,8K raw/SLOC NEW. Open: Core cross-report edges (gating) · evaluate_ready wire · edge-operator coverage 92/4,056 · A1 projections S1–S4 · host @/contracts impact delta · H1 BHCK2314 absent from extract · H3 op-naming unification at UC11 · Neo4j GPL-3 · deltaModelSafe precision at merge · element_dependency reconciliation now incl. OPERATOR SEMANTICS.","SME + Dev"],
  ["UC3 SURFACE PRE-DECISION (2026-07-18, Akhil — recorded BEFORE the UC3 build): UC3 Trend Analysis is a CONVERSATION capability (Digital Twin family) — the user asks a trend question in Lexie AI (Ask Lexie), and Lextr Intelligence answers INLINE in the Lexie panel (the UC8/UC12 posture): a trend CHART (mini line/area, shaped by the data as returned) + the TABULAR dataset (the series grid backing the chart) + the classification chip + the short narrative. Chart form follows data: a full window renders chart+table; sparse-but-classifiable renders table+chip honestly; insufficient model-safe points renders undetermined + reason and fabricates NO chart. The A2 lesson applied proactively: the surface decision is recorded up front (kickoff prompt decision 9 pre-seeded) instead of post-build — INLINE is the decided UC3 mode; no drawer is planned for UC3.","SME (Akhil), captured into the UC3 kickoff prompt"],
  ["UC2 SURFACE REFINEMENT A2 (2026-07-18, Akhil): UC2 is DUAL-SURFACE over ONE headless render-model — INLINE (an impact question asked in Ask Lexie renders in the Lexie panel, like UC8/UC12; the needs_input round-trip completes the adjustment) + DRAWER (triggered from a Core context — topside/adjustment screen · edit-check screen · report module — renders as a slide-over; Core injects launch_context + the adjustment block). Original intent was INLINE-only; DRAWER accepted (the capability rides Core context naturally). ZERO engine change BY ARCHITECTURE: both entry paths already exist on the frozen /run contract (question+needs_input vs launch_context+adjustment), features/impact ImpactAnswer is headless-mountable in either container, and D1/D2/D3 are surface-agnostic. Changes confined to the decision records: prototype UC_SURFACES dual badge + workspace/trigger entries, this MADE entry + the roadmap row, the D0 sim DD-9 card, the D4/deployment README DD-9 lines. Optional dense/compact prop on ImpactAnswer = deferred nice-to-have (flagged, not built). Manifest pickup at the next natural bump (stable_v3, UC3 D5).","SME (Akhil) + UC2 build"],
  ["UC2 SCOPE RE-DECISION (2026-07-17, Akhil — UC2_MapGap.md §0; recorded UC2 TURN 1): SUPERSEDES the earlier 'Impact SIMULATION owned by Core / value impact deferred / UC2 stays STRUCTURAL' re-baseline. UC2 = Impact Analysis covers BOTH passes: STRUCTURAL (bounded forward/downstream traversal → affected lines + edit-checks with path/edge-type/distance) AND MATERIAL (deterministic Δ propagation along edge operators → per-line Δ; affected edit-check evaluation breaks|clears|unchanged|undetermined). Canonical: $10 adjustment to BHCK2314 (Y-9C). Still NO SLM by construction (no model_abstraction.call on the allow-list; both passes arithmetic + rule evaluation; any summary is a template). Within-report LIVE now (material where edge operators present); cross-report EDGE-GATED fail-closed (0 edges until Core walk_component / element_dependency CROSS_REFERENCE; same gate family as UC8 R4). Degradation ladder computed → structural_only → direction_only → undetermined, each with a reason; never unmask, never fabricate. NOT validation (UC7), NOT rule authoring (UC11). Output impact_list / ranked_list (existing enums). Core's own topside-time simulation need remains Core-owned; operator semantics reconcile via the Intelligence↔Core element_dependency reconciliation.","SME (Akhil) + UC2 build"],
  ["Adjustment is OUT OF SCOPE for now — a FUTURE capability where the system RECOMMENDS adjustments based on history/patterns (a learned-recommendation flavor, distinct from impact and variance). No UC, no LHP capability, no tag yet. Impact's cross-capability tag is therefore Digital Twin · Rules Assist only.","SME"],
  ["Semantic Layer SCOPE (confirmed): a single meaning+location catalog of WHAT/WHERE/DEFINITION for EVERY object potentially referable in the UI — analysis, review, rules-writing, or anything Lextr Intelligence needs — across ALL domains (regulatory AND operational). Backend/product-health objects are ALSO registered (for triage) but flagged not-user-facing. Each object carries: identity · KIND/shape (data value vs status vs routing/chain) · CATEGORY/tag (what OPA tool_scope gates on + triage grouping) · EXPOSURE/visibility (user-facing vs health-only) · location/owner · plain-English definition. Holds NO values. Built by Lextr CORE (its object/semantic model); Intelligence consumes. Target-state = register everything; per-UC = populate that UC's slice incrementally.","SME + Core"],
  ["UC12 op model + dependency (confirmed, decision #5): NOT hundreds of named ops — a SMALL set of generic TYPED operational-read ops (read_operational_value, read_operational_chain) parameterized by the Semantic Layer descriptor; the Semantic Layer drives what/where/kind. tool_scope is bounded by operational-concept CATEGORY (workflow_status/deadline/approval_routing…), not per-question op names — adding a question needs only a registered concept, no new op/Rego entry. Still fails-closed (un-tagged/out-of-category denied); host capability handshake declares served categories. DEPENDENCY (consume-from-host seam): requires the Core Semantic Layer to model OPERATIONAL concepts with KIND + CATEGORY + EXPOSURE attributes; if absent, raise as a scoped Core Semantic Layer ENHANCEMENT. Build UC12 against the seam NOW (like UC1a data seams); do not block on Core.","SME + Core"],
  ["UC12 design decisions SETTLED (for the build prompt): (1) disambiguation = HYBRID — host owns the candidate set/truth of open+active; skill owns interaction (detect multiplicity → scope-by-context or prompt). (2) Core injects launchContext{report,period,mode} on /run. (3) active period is always a HOST READ; context only narrows. (4) clarification = needs_input result type → second /run (D1 output-shape delta). (6) review = LIGHTWEIGHT (evidenced+queued, not heavily gated). Surface mode = EMBEDDED (served+rendered by Intelligence, tenant CSS flows through).","SME"],
  ["UC12 BUILT (chat 6, first UC build) — build-time confirmations: (7) rendering ownership = HEADLESS — Intelligence serves a masking-safe render-model + ships a React/MUI REFERENCE renderer; the HOST owns the Lexie shell, final rendering, token→value resolution per requester, and tenant theming (logo/CSS/multi-tenant flow through the 2b theme primitives). (8) output template = the skill STAMPS output_type (closed vocab: narrative · narrative+dataset · needs_input) at compose; the renderer switches on it — no model-decided layout. (+normalization) NLU surface-form → Semantic Layer canonical meaning; the SLM never normalizes. tool_scope gates by CATEGORY (workflow_status·deadline·approval_routing), fail-closed = the data-value boundary (Case C). Deliverables: D0 sim · D1 lexie-ai skill (9/9 logic tests) · D2 intelligence-service coordinator+preset · D3 tool_scope_operational.rego · D4 intelligence-ui reference renderer (8/8 parse-gate) · D5 reconciled deployment pkg (7/7 cross-language reconciliation; 23 files, ~2,003 SLOC). Open: Core Semantic Layer operational concepts (resolve seam) · capability handshake (servedCategories / approval_routing_ready) · DB output_type enum += narrative+dataset, needs_input · UC12 preset authored in Preset Management (D7, MRM-gated) · structured per-row dataset table (render-model extension).","SME"],
  ["Deployment REBASELINE upto UC12 (consolidated platform package) + dev-team feedback remediation: the per-service deliverables merged into ONE micro-service modular tree — services/{lexie-ai · intelligence-service · policy-service-rego · intelligence-ui} + contracts/ (the inter-service seams) + docs/ + deploy/ (docker-compose scaffold). Deduplicated (0 content dups; archival README copies + the doubled schema DDL removed, empty package __init__.py preserved). Re-validated whole-tree: 73/73 lexie-ai py_compile · 115/115 UI parse-gate · UC12 9/9 skill tests · 7/7 cross-language reconciliation. Feedback triaged into SEAM/GAP/OPS/DONE: DONE — UI build config (package.json/tsconfig/vite/index.html) + Python manifests (pyproject/requirements) present, @Primary logging stubs removed (real evidence/review impls are primary). SEAM (host provides, not gaps) — adapter deferred methods (6 LIVE UC1a + ~14 deferred, each mapped to its UC), KG empty-until-edges, OPA policy DATA/*_ready datums, anchor/recon taxonomy source, JWT/Keycloak auth (merge-step), SLM serving. OPS — OPA instance + Postgres/pgvector + Qwen3-4B endpoint. GAP — first real compile/run pass, V3–V8 migration reconcile (MIGRATIONS.md), OI-9 /run casing round-trip. Added TRIAGE_AND_IMPACT_MAP.md (the buckets + a 'one change touches many' blast-radius map: /run contract + tool_scope are the cross-service surfaces + first-week order), per-service READMEs (all 4), and the deploy scaffold. Goal: a team that didn't write the code can triage it in 15 minutes.","SME + Dev"],
  ["UC8 RE-SCOPED (critical UC) → 'Semantic & Reference Query' (Core-aligned). Bounded intent-routed NL query surface over meaning·reference·value across regulatory + business. SOURCE-OF-TRUTH CORRECTED: regulatory definitions/references/versions come from the Lextr CORE Regulatory Ingestion GOLD COPY (regstruct.*: element_definition.composed_definition_txt [STD-INTEL-01], element_version, element_dependency CROSS_REFERENCE, report_definition/line/schedule), exposed via the SL C1 exposure contract (OP-SR-3 register; get_object/list_objects; jurisdiction/report/period/restatement filters; confidentiality at the exposure boundary), CONSUMED READ-ONLY via the adapter — binding C9 (PENDING in Core = the gating cross-project dependency). KH is user-maintained, NON-AUTHORITATIVE complementary context only. Build covers Phase A (live: B5/B6 value reads · R1/R3 definition+reference reads against the C1 contract · B2 glossary · the bounded intent router · the structured-dataset table) AND Phase B op-stubs+skill-paths (R5 version-diff · R4 cross-report · B4 entity resolution · B3 org/legal-vehicle · B6 non-financial concepts · B8 derived KPI). Routes B1 approval→UC12, B7 POP-variance→UC1. Open cross-project items: C9 SL exposure wiring; Intelligence↔Core element_dependency reconciliation (Core B.4); Phase-B host ops; non-financial concept registration. HTML sim is a MANDATORY deliverable.","SME"],
  ["UC8 BUILT (chat 6) + REBASELINE upto_UC8. Bounded intent-routed semantic/reference query built across all 4 services + reconciled deployment pkg. D1 lexie-ai: skills/semantic (bounded IntentRouter over the CLOSED intent set R1-R5·B2·B3·B4·B5·B6·B8 → 3 lanes: SL-exposure / data-plane / business-model; classify-then-extract SLM, deterministic dispatch, ≤8 steps no free-roam) + adapter/semantic_exposure_ops (R1-R5, fail-closed until binding C9) + semantic_business_ops (B3/B4/B8, fail-closed until Phase B); contract delta +Dataset/RouteOut, dataset on RunOutput, intent+route_out on RunResult (additive). D2 intelligence-service: SemanticRunCoordinator + SemanticPresetResolver (local-only + closed-intent + capability handshake exposureReady/graphReady/businessReady) + RunResult.java mirror (canonical 7-arg with backward-compat 3/5-arg overloads) + JUnit (RunResultTest/SemanticPresetResolverTest/SemanticRunCoordinatorTest, JUnit5+AssertJ+Mockito, structural-validated; mvn test at merge). D3 policy: tool_scope_semantic.rego (gate by intent → lane; exposure_ready/graph_ready/business_ready datums default-false fail-closed; AI_PROHIBITED hard-stop; partial semantic_deny_reason) + semantic_data.json + opa test suite; ALSO fixed the PRE-EXISTING tool_scope_variance.rego brace imbalance (whole bundle now 11/11 balanced → opa check/test runnable). D4 intelligence-ui: features/semantic (SemanticAnswer composes OutputRenderer + DatasetTable + VersionDiffView (R5) + RouteOutNotice; token-only/brand-free → logo/CSS/multi-tenant via 2b primitives). route_out = bounded deferral (B7→UC1, B1→UC12); UC8 never calls the neighbor, host/UC9 dispatches. Whole-tree validation: 92 py_compile · 18/18 UC8 + 75/75 all skill suites · 113/113 Java balanced+package↔path (incl. 3 JUnit) · 11/11 Rego balanced + truth-table (360 composed cases allow-XOR-deny, 5 verbatim deny-reasons) · 122 UI parse-gate + resolvable-import + token parity · 9/9 cross-language reconciliation (the spine PASS across the services that carry each invariant). Rebaselined from pristine upto_UC12: 0 baseline files dropped, ADDED == exactly 23 UC8 NEW files (20 production + 3 JUnit), 0 content-dup groups, 0 build noise, __init__.py integrity intact. 23 NEW (incl. 3 JUnit shipped for mvn test) + 4 MOD, ~2,415 SLOC. Open: binding C9 (gating) · graph_ready (R4) · business_ready (Phase B) · host @/contracts dataset/intent/routeOut + route_out OutputType · pre-existing UI broken barrels (repoint recipe shipped) · OI-9 /run casing wire test · composed_definition_txt→SLM SME confirm · Intelligence↔Core element_dependency reconciliation.","SME + Dev"],
  ["Governance Console UI prototyped (LexIntl 0): 7-step wizard, OPA register, MRM, audit, role mapping","Design"],
  ["Governance Console aligned to contracts: 6-value classification, OPA cost guardrails, no 'Never' review","Design"],
  ["UX/UI is its own workstream (Option A): early Design System & Shell chat + final Integration chat","Planning"],
  ["2b theming spine delivered: configurable logo + client-pointable CSS + multi-tenant theme resolution, centralized; adopted the lineage engine's tokens + Core chrome (not a new system); white-label entitlement carried-not-decided (OPA-resolved allowExternalStylesheet)","Design"],
  ["2b app shell delivered: nav (adopted Core chrome, @mui/icons-material), session/tenant context drives theme (SessionProvider→ThemeGate→TenantThemeProvider, per-tenant from first paint), Lexie mount + /ask seam; IntelligenceClientPort = seam-not-contract (provisional, replaced by generated types with no shell change); capabilities carried-not-decided, hiding≠securing","Design"],
  ["2b Contracts & Core-wiring delivered: FE contracts mirror the real backend (7-value classification, agent_run_step evidence, render-under-entitlement placeholders) — not an invented model; concrete IntelligenceClient fills the shell port with ZERO shell change (slice-2 seam bet paid off); useIntelligenceRun lifecycle honest about always-on review (lands in_review, confidence is signal-not-gate); STOMP stream with polling fallback","Design"],
  ["2b D4 component atoms delivered: MaskedValue fail-safe gate (renders value only when !masked && value!=null, masked label otherwise, never a leak, nothing resolved client-side); status/clarification/run-progress atoms consume real D2 contracts; clarification chip replaces the slice-2 stub; confidence=signal-not-gate, TRIGGERED=warning-not-error; all themed via theme.lextr (tenant re-theme recolours automatically)","Design"],
  ["2b D5 evidence viewer + review/approval UI delivered: EvidenceLedgerViewer renders agent_run_step verbatim (ordered, masked output under entitlement) — one canonical evidence display reused beyond review; PolicyCheckResult dual-sourced (verbatim if backend supplies, else conservative 'derived from evidence' fallback, labeled); review queue + accept/correct/reject; SoD posture correct — UI submits reviewerId + shows non-blocking author note, OPA MRM-SoD gate enforces server-side (UI never the gate)","Design"],
  ["2b D6 chart set delivered — completes the 2b component foundation. One canonical LextrChart (line/bar/table); masking holds at EVERY value surface (point suppressed to null, axis domain excludes masked, connectNulls=false so gaps aren't bridged, custom tooltip never shows raw, all-masked→notice) via the SAME PlaceholderResolution as narrative; confirmed dataset/chart shapes only, undefined OutputTypes→graceful unsupported (no guessing); D5 seam = single OutputRenderer swap, narrative unchanged; recharts (dependency decision, isolated behind LextrChart)","Design"],
  ["2b Design System & Shell COMPLETE — front-end foundation built and reviewed (6 deliverables): theme spine, app shell, contracts+client, atoms, evidence+review, charts. The substrate the use-case screen chats (5–7) build on; shell-mounting happens at Integration (chat 8). The masking/governance boundary held across the whole stack, schema → chart tooltip","Design"],
  ["Knowledge Hub D1: persistence + ingestion API (intelligence-service) — over regulatory_document → document_chunk → embedding_store, NO knowledge_hub table; doc_type 5 values verbatim; parents-first topological insert returning clientRef→chunk_id (A6); AI_PROHIBITED refused past CHUNKED (advanceHeaderStatus throws); OPA-resolved auth, client_id from context not body","Knowledge Hub"],
  ["Knowledge Hub D3: chunking + embedding (lexie-ai) — embeds through the INJECTED D8 EmbeddingResolver (embedding_call gate + dim safety + model_id-tagged store, same as a run chunk — NO parallel path); AI_PROHIBITED short-circuited BEFORE any embedding call (resolver never invoked, no vector); doc_type inherited from source_type for header-backed; leaf-only embedding default","Knowledge Hub"],
  ["Knowledge Hub D2: management front-end (intelligence-ui) — consumes the 2b atoms (MaskedValue, StatusChip, useCapabilities), NOT reinvented; classification UX = suggest→human-confirm (A4), AI_PROHIBITED surfaced loudly, UI-is-not-the-gate (entitlement shows/enables, server-side OPA authoritative); surfaces metadata + source-ref via MaskedValue, never vectors or content; first feature screen on the design system","Knowledge Hub"],
  ["Knowledge Hub D5: retrieval as complementary context — reuses the D8 retrieval path (same resolver, model_id=registry_id, KNN filters tenant+model_id → one space); classification entitlement gates what returns (OPA lextr.ai.knowledge_hub_retrieval, fail-closed, AI_PROHIBITED hard-stopped before OPA); the QUERY embedding is itself governed (RESTRICTED query embedded locally via embedding_call gate); masking left to the existing MaskingBoundary, adapter stays the host boundary","Knowledge Hub"],
  ["Knowledge Hub COMPLETE — the loop closes: ingest → chunk+embed (governed D8 path) → manage+classify → retrieve as complementary context (entitlement-gated, one space). The corpus now grounds runs, with the same governance as the rest of the product. D4 (full doc_type ranking model) reserved as a later enhancement","Knowledge Hub"],
  ["Chat scope split: 'AI Presets + Evidence' → renamed 'Preset Management' (authoring wizard + lifecycle + the preset's OWN governance/approval audit — presets are the governed artifact in regulatory reporting, so management = governance; 'AI' prefix dropped as redundant — the whole product is Intelligence). Cross-product audit (agent/run evidence + reviews + policy events, the compliance one-pane-of-glass) split out to a separate 'Audit & Evidence' chat (7b), placed late so the things it audits exist first","Planning"],
  ["Merged 'Variance — horizontal (M3)' and 'Variance — vertical (M4)' into a single 'Variance Analysis' chat — one coherent flagship capability, built as staged deliverables (horizontal-first then vertical drill-down), preserving the dependency (horizontal grounds vertical) and the per-deliverable review discipline, the way Preset Management was one chat with PM-1…PM-6. One chat, staged deliverables — not a single monolithic deliverable.","Planning"],
  ["Variance V-1: investigation contract + bounded-agent plan + adapter ops + tool_scope Rego + SLM registration + the two AI presets (the flagship's spec/seam layer — no skill executes yet). FROZEN: pyramid levels REPORT→FDL_COE→CONTRACT_TRANSACTIONS and the closed 5-category driver enum (rule/methodology change · business strategy [self/peer] · market event; +DQ issue [new/recurring] +controller input at txn level) with drivers_in_scope/assert_within_bounds as the bound. Skills realized against the real D5 names (SkillOne deterministic + SkillThree the only SLM caller; SkillTwo enum-declared-only = V-4 vertical). Q2 source split: structured facts → adapter ops (tool_scope-gated), strategy/market-event → KH retrieval via the existing get_complementary_context seam. Presets carry report_type + resolution_key (use_case×report_type), pin the local SLM external_eligible=false (from_classifications stays authoritative — never external, Q4), cost_guardrails token-ceiling enforced/USD deferred (Y-9C 6000/depth2, Y-14Q-H 12000/depth3, both draft); activation MRM-gated in Preset Management not here. Vertical ops DECLARED-NOT-CALLABLE, KG-gated via data.lextr.ai.variance.kg_ready (Q8). Both boundaries held (lexie-ai pure types/ABC no DB; tool_scope in Rego, Python registry a mirror, adapter fails closed). Required corrections folded to V-2: local Classification enum must mirror the full 7-value data_classification (MNPI+SENSITIVE missing); SLM max_classification must not exclude MNPI from the local fine-tune. Load-bearing integration item: variance Rego keys use_case/op vs D3's skill/operation — reconcile the pre-call input + avoid same-package deny_reason conflict, opa test the composed package.","Variance"],
  ["Variance V-2: horizontal skill + run flow end-to-end (lexie-ai + intelligence-service). VarianceHorizontalSkill realizes SkillOne (deterministic resolve, no SLM) → SkillThree (only SLM caller) on the D5 runtime via the frozen /run path: tool_scope-gated before every adapter op, MaskingBoundary.assert authoritative BEFORE model.call, cost OK/DEGRADE/STOP (DEGRADE drops complementary context as a recorded step, STOP returns a persisted reviewable stopped trace — never silent-truncate), from_classifications local-forced with a routed_local verify (RoutingViolation else), assert_within_bounds at the seam; produces the EvidenceTrace (no DB in lexie-ai). VariancePresetResolver reads the OPERATIONAL preset by (use_case×report_type), asserts externalEligible=false fail-closed; VarianceRunCoordinator is the thin resolve→/run→D6 persistRunWithTrace(one txn)→reviewQueue.enqueue(separate txn) seam (#12 gap noted). Both V-1 corrections applied (full 7-value Classification + masked-required set; max_classification→mnpi). 9/9 invariant suite passes (verified). Still open: D3 tool_scope.rego deny_reason must also become a partial rule before the composed lextr.ai.tool_scope package compiles (opa test dev-side); confirm max_classification covers SENSITIVE (canonical order puts it above MNPI); reconcile Protocol/Java seams vs real D5/D6/frozen-/run types (OI-7/8/9).","Variance"],
  ["Variance V-3: horizontal screens on the 2b shell (intelligence-ui/src/features/variance). VarianceWorkspace (pick report_type + level + cell/line → run → progress → result), VarianceResult, DriverFindingCard, api.ts (trigger via the shell HTTP client — no direct lexie call, no policy), types.ts, Zustand varianceStore (idle→running→reviewing/stopped/error). REUSES the 2b atoms from @shell/atoms — MaskedValue, OutputRenderer, LextrChart, EvidenceLedgerViewer, RunProgress — not rebuilt. Posture verified in code: masking held to the tooltip (figures render only via MaskedValue from backend display; UI cannot unmask), confidence is a signal chip never a gate, always-on review honest (completed→reviewing+banner, never auto-final), show/enable-never-gate (Run enables on valid inputs; OPA authorizes server-side), no policy/masking/classification in the UI, no hardcoded colors (theme tokens only → client CSS/tenant flow through), tenant from useTenant never in a query string, no browser storage. tsc --noEmit PASS (shimmed). Both V-2 close-outs applied: Rego variance_deny_reason rename (composed package compiles regardless of D3), max_classification→'sensitive' + canonical enum reorder. Load-bearing open (OI-10): reconcile reused-atom prop/path vs the real 2b package — settle EvidenceLedgerViewer prop once (V-3 'trace' vs PM-6 'run'). Carry: confirm RunResult shape + trigger path (OI-9), D4 max_classification semantics (OI-2), opa test composed package dev-side; shims not shipped.","Variance"],
  ["Variance vertical model corrected: single-dominant-path drill SUPERSEDED by a bounded multi-path DAG walk (the delivered single-path V-4 is held / in revision). The calc chain is multi-child and converging — a node fans out to several material children and a node can be reached by multiple paths; A→C arises because a branch is EXPLAINED EARLY at a non-leaf level (adjustment found there), not from skipping a level (next_level stays strict one-rung). Single-path under-explains variance (follows A→B→C, misses A→C). Corrected traversal: at each node run horizontal; if not weak the branch terminates (explained here); if weak and within bounds, fan out to the material children (top-N by ordinal contribution_rank — never by unmasking), descend one rung each, recurse; dedup a node reached by multiple parents (investigate once, record all incoming paths, attribute contribution without double-count, count cost once). Bounds keep it bounded-not-autonomous: per-branch depth (max_drill_depth) + per-node breadth (top-N materiality cut, new preset field N) + a GLOBAL ceiling on total nodes + cumulative tokens across the whole DAG (recorded stop, never silent). Carried from V-4: reused horizontal skill per node, KG fail-closed tool_scope gate (horizontal stands on denial), masking/routing/per-level cost, ordinal-rank/no-unmask selection. Evidence aggregates into one EvidenceTrace as a DAG (converged nodes marked) — D6 persists as one agent_run. Y-9C → shallow/small N; Y-14Q-H → deeper/larger N.","Variance"],
  ["Variance V-4 (revised, delivered): SkillTwo vertical drill-down realized as the bounded multi-path DAG walk (BFS over the calc chain). Verified in code: convergent node investigated and costed ONCE via a seen-set while every incoming edge is recorded (no double-count — dedicated test), fan-out to top-N material children by ordinal contribution_rank (no unmasking), strict one-rung next_level, early branch_terminated:explained for short branches (the A→C case, not a level skip). All four bounds fire with recorded stops: depth (max_drill_depth), breadth (drill_breadth_n top-N), global node ceiling (drill_node_ceiling), cumulative cost. KG fail-closed (tool_scope check on walk_calc_chain; on denial drilling stops and horizontal explanations stand); reuses the V-2 horizontal skill per node; masking/routing/per-level cost carried inside each run; confidence stays a signal (is_horizontal_weak structural). Returns one aggregated whole-DAG EvidenceTrace (per-node steps + fan-out + a convergence step where incoming_count>1) for D6 to persist as one agent_run. No DB in lexie-ai. Preset bounds confirmed: Y-9C depth2/N2/ceiling6, Y-14Q-H depth3/N4/ceiling24. 10/10 vertical DAG suite + 9/9 horizontal regression pass. Cleanup: stale single-path README_V4.md to be superseded. Carry: OI-11 (KG wiring + contribution_rank vs real gateway; kg_ready flips when production-ready), OI-8 (D6 persists the DAG trace as one agent_run incl. convergence provenance), OI-10 (EvidenceLedgerViewer shape; V-5 renders the DAG).","Variance"],
  ["Variance V-5 (delivered): vertical drill-down screens on the 2b shell rendering the V-4 DAG. DrillGraph (Cytoscape+ELK, the recorded stack — ELK replaced Dagre at the 2026-09-14 stack decision) draws the drill path with node id=key so a convergent node appears exactly ONCE with every incoming edge — convergence-once by construction, plus a provenance note where incomingCount>1. Selecting a node renders its per-node result by REUSING V-3 VarianceResult (new optional showReviewBanner prop, default true preserves V-3 — drill-level review banner shown once instead). Verified in code: graph colors entirely from theme.palette (no hardcoded hex → client themes flow through), node labels masking-safe (level+cellRef, no figures), figures only via MaskedValue, bounds/stops surfaced as honest banners (kg_not_ready→horizontal stands, node_ceiling, cost_stopped), confidence-as-signal, show/enable-never-gate, no policy/masking in UI, no browser storage, tenant not in URL. tsc PASS (shims incl. cytoscape/dagre); python regression 10/10+9/9. Carry: OI-10 (EvidenceLedgerViewer shape + swap DrillGraph to a shell Cytoscape atom if one exists), OI-8 (confirm /intelligence/variance/drill response vs the one agent_run).","Variance"],
  ["Variance V-6 (delivered, FINAL — feature complete): report-type finalization + consolidated handoff. A reference preset_loader reads the REAL Y-9C/Y-14Q-H preset JSONs into PresetSnapshots and test_report_type_e2e runs the SAME vertical DAG skill against the SAME calc-chain with each, proving report-awareness flows purely from the preset: Y-9C stops at FDL/COE (depth2/N2/ceiling6, never reaches Contract/Transactions), Y-14Q-H reaches Contract/Transactions with DQ_ISSUE + CONTROLLER_INPUT in scope (depth3/N4/ceiling24), same skill different shape (r14.nodes>r9.nodes). No new production behavior — proof + docs. README_HANDOFF.md consolidates V-1…V-6 (flow, file inventory, report-type matrix, a single OI table, validation summary); stale single-path README_V4 superseded to the DAG description. Full Python suite 23/23 (9 horizontal · 10 vertical DAG · 4 report-type e2e), verified by running them. Flagship UC#1 is now feature-complete end-to-end (contract → horizontal skill+screens → vertical DAG skill+screens → report-type proof); nav flipped to confirmed. Remaining work is dev-side integration carries only (OI-1/2/5/7/8/9/10/11) + SME-supplied model_id/artifact/version.","Variance"],
  ["Variance ANCHOR evidence — slice COMPLETE (Step 1 Python + Step 2 UI approved). New bounded horizontal EVIDENCE sub-step correlating a reg cell against the entity 10-Q/10-K (sibling of trend). AnchorConcordance{concordant,divergent,unavailable} + AnchorContext{concept, anchor_value, concordance, confidence, basis_caveat, note} on explanation.anchor; _anchor() gated on anchor_ready via OPA (default deny; deny-reason \"entity 10-Q/10-K not loaded\"), compares model_raw ONLY (UNAVAILABLE when masked — never unmask), reg-vs-GAAP caveat always attached (divergence is a FLAG, not a correction), signal-only confidence nudge ±0.03 clamped, adds NO driver. get_anchor_values op (requester-threaded); crosswalk SPLIT = central concept map + per-filer 10-Q resolution carrying confidence. step_9_anchor preset (Y-9C + Y-14Q-H) + PresetSnapshot anchor_enabled (Python+Java parity). Suite: horizontal 24/24, full 41/41. STEP 2 (UI): types.ts AnchorConcordance/AnchorContext + explanation.anchor seam; VarianceResult renders an \"Anchor — corroboration, not a driver\" block (anchorTone chip + concept, matched 10-Q/10-K figure via MaskedValue verbatim, lower-assurance confidence caption, the reg-vs-GAAP caveat ALWAYS shown, note; absent→nothing), theme-semantic tones, no client masking, not a DriverFindingCard. OI-9 wire-names: matched the file-wide camelCase convention (serializer does snake→camel; whole-file reconcile if not) — structurally verified, tsc is the shimmed gate. Open: concept-map data source (ships via Problem-1), anchor_ready per-entity (10-Q loaded; capability handshake), OI-9/OI-10 atom+wire reconcile at integration.","Variance"],
  ["Variance RECON evidence — slice COMPLETE (Step 1 Python + Step 2 UI approved). New bounded horizontal EVIDENCE sub-step: bottoms-up FP&A recon breaks roll up to the cell by REUSING the report calc-chain (the host op owns the rollup; finance data lands at L2/L3 on common COA/contract keys; NO bespoke map, so the horizontal skill needs no kg_ready). ReconBreak + ReconContext (breaks, explained_pct, residual_pct, note) on explanation.recon; _recon() gated on recon_ready via OPA (default deny; deny-reason FP&A feed not wired), classifies each free-form reason into the CLOSED DriverCategory set (deterministic keyword rules; catch-all CONTROLLER_INPUT), splits the delta into explained/residual on model-safe amounts ONLY (masked → split unavailable, breaks still surface; never unmask), signal-only nudge (clamped), adds NO driver. get_recon_breaks op (requester-threaded). step_10_recon preset (Y-9C enabled, Y-14Q-H not) + PresetSnapshot recon_enabled (Python+Java parity). Suite 43/43 on its V6 branch. STEP 2 (UI): types.ts ReconBreak/ReconContext + explanation.recon seam; VarianceResult renders a \"Recon — evidence, not a driver\" block (explained%/residual% summary, or an explicit \"split unavailable (amounts masked)\" caption when 0/0; a dated break list with each break a closed-set DriverCategory chip via DRIVER_LABEL + amount via MaskedValue verbatim + reason; note), never a DriverFindingCard, no client masking, no hardcoded hex. Built on the merged baseline so trend+anchor+recon all surface. Open: reason→driver mapping-table home (Problem-1/governance); confirm host owns the calc-chain rollup; break amount should arrive dual-form so MaskedValue gets the real classification (currently defaults internal).","Variance"],
  ["Variance anchor+recon MERGE (Option A): anchor (Steps 1+2) and recon (Step 1) were parallel branches off V6; merged into ONE unified baseline via 3-way merge. Resolved take-both additions and combined the shared _render_prompt call/signature, make_preset, FakeAdapter, and the nudge apply-site so BOTH anchor and recon nudges apply independently; restored AnchorContext.note + the ReconBreakRow dataclass decorator that the union had dropped. Full Python suite 48/48 green (19 base + 5 anchor + 7 recon horizontal + 13 vertical + 4 e2e); both presets parse; the rego unknown-op deny lists all five op-sets; UI parses. This unified package is the baseline for Recon Step 2 (UI).","Variance"],
  ["Variance INTEGRATION CHECKLIST (feature-complete; dev-side OIs before merge): OI-9/OI-10 — confirm serializer casing and align the UI type file, reconcile reused 2b atom props/paths; DATA HOMES — anchor concept-map + recon reason-to-driver table come from the Problem-1 family taxonomy/governance, not hardcoded; HOST-OWNED ROLLUP — confirm the host op owns the recon-to-cell calc-chain rollup (no kg_ready in the horizontal skill) and that break amounts arrive dual-form so MaskedValue gets the real classification (UI defaults internal); REAL TEST GATES — run real tsc, Maven (Java PresetSnapshot parity), OPA tests at integration (Python suite proven 48/48 here). anchor_ready/recon_ready/kg_ready are service-supplied OPA datums.","Variance"],
  ["OPEN PRODUCT ITEM (Variance, Option B): Y-14Q-H drills to Instrument (depth 3), NOT Atomic — so transaction-level DQ_ISSUE/CONTROLLER_INPUT are defined-but-unassessed for the flagship granular report. Chosen deliberately in the rerun; revisit by bumping the Y-14Q-H preset to depth 4 (reaches Atomic; node_ceiling 24 then bounds deep+wide drills as a recorded stop) if Y-14Q-H should assess Atomic drivers.","Variance"],
  ["Variance CORRECTION RERUN — COMPLETE (V-1…V-6 all approved): folded three confirmed changes into the V-series. #16 masking display ownership SPLIT — display is the HOST's per-requester entitlement decision rendered verbatim by Lextr, model masking stays Lextr's MaskingBoundary; ClassifiedValue is now dual-form (display + model_value/model_raw), __post_init__ guards the model path only, VarianceRequest carries requester threaded onto every adapter op. #17 pyramid is 4 frozen roles REPORT→FDL_COE→INSTRUMENT→ATOMIC (old CONTRACT_TRANSACTIONS splits); bottom-two labels domain-resolved from KG node type via resolve_level_label; depth ceiling 4; new frozen driver INSTRUMENT_LIFECYCLE at Instrument (confirmed, OI-A), DQ/controller at Atomic; bottom op split into get_instrument_detail (Instrument) + get_contract_transaction_detail re-scoped to Atomic. Trend — bounded horizontal EVIDENCE not a driver: TrendClassification/TrendContext + the VarianceExplanation.trend seam, get_series op gated on a new series_ready OPA datum mirroring kg_ready, preset trend_window=6. Anchor (10-Q/10-K) + FP&A recon remain SEPARATE later slices, out of scope. V-1 reviewed and APPROVED: package imports, py_compile clean, 4 roles + dual-form + trend types + requester landed; only the V-1 surface files changed (contract.py, variance_ops.py, presets, rego) — enforcement/skill/UI deferred to V-2…V-6. V-2 APPROVED: MaskingBoundary now checks the MODEL form (model_value/model_raw, ignores display); the horizontal skill puts model_value/model_raw in the prompt while display stays in user-facing evidence; requester threaded from /run (Keycloak principal) onto every adapter op; INSTRUMENT_LIFECYCLE→get_instrument_detail; trend sub-step series_ready-gated with a deterministic classifier, TrendContext on explanation.trend, signal-only confidence nudge, OI-G masked-series→trend-unavailable; PresetSnapshot carries trend_enabled/trend_window + a max_drill_depth≤4 guard; 19/19 horizontal suite green (vertical + report-type-e2e suites intentionally red until V-4/V-6). V-3 APPROVED (horizontal UI): types.ts to 4 roles + instrument_lifecycle driver, ClassifiedValue is display+classification with NO raw (the UI computes nothing — renders host-resolved display verbatim, can neither mask nor unmask), TrendClassification/TrendContext + the trend seam on the explanation; VarianceResult renders display via MaskedValue, the level via a new resolveLevelLabel(level, backendLabel?) helper, and a trend block labelled \"evidence, not a driver\" (chip + per-point series, absent→nothing); 4-role level picker; the UI never sends requester (server-side principal, never in a URL). OI-E resolved via an optional host/KG-supplied levelLabel with role-name fallback. Structurally verified (tsc is the shimmed build-chain gate; dev runs tsc against the real 2b package at integration, OI-10). V-4 APPROVED (vertical skill): the sole correction is _child_request now carrying requester=parent.requester so the host can resolve display per requester at every drilled node — the DAG walk already descended the four roles via next_level and already honoured the ≤4 ceiling, so no other behavioural change. Tests: a requester-propagation case spies the fake adapter to prove every drilled-node call carried the requester (never None), a four-level-reach case reaches an ATOMIC node at depth=4, and a contrast case proves depth=3 caps at Instrument before Atomic; convergence/breadth/node-ceiling/cost-stop/KG-fail-closed unchanged. Vertical suite 13/13 + horizontal regression 19/19, both run green. No DB in lexie-ai; one aggregated DAG trace for D6 (OI-8). V-5 APPROVED (drill UI): the last #17 fold — the DAG graph node label and the selected-node header now render the domain-resolved level via resolveLevelLabel(level, node.result.explanation?.levelLabel), role-name fallback when the host gives none; the redundant local LEVEL_SHORT map in DrillGraph plus its now-unused PyramidLevel import were removed so the shared resolveLevelLabel/LEVEL_ROLE_LABEL is the single source of truth. Host-resolved display + the trend block are inherited per node by reusing the V-3 VarianceResult (showReviewBanner=false); convergent-once, the provenance alert, and honest review/stop banners are unchanged; the UI sends no requester, uses no browser storage, no hardcoded colors. Structurally verified (shimmed tsc is the build-chain gate). OI-E open carry: confirm the backend populates explanation.levelLabel on DRILLED-node results too, not just the start node — until then drilled nodes safely fall back to the role label. V-6 APPROVED (report-type e2e + handoff), rerun CLOSED. The last deferred suite (test_report_type_e2e) was corrected to the 4-level pyramid and CONTRACT_TRANSACTIONS fully purged (only historical comments remain in contract.py): Y-9C depth 2 -> {report,fdl_coe}; Y-14Q-H depth 3 -> reaches Instrument (INSTRUMENT_LIFECYCLE in scope), CAPPED before Atomic. Full Python suite 36/36 green (19 horizontal + 13 vertical DAG + 4 report-type e2e). PRODUCT DECISION (Option B, confirmed with the true baseline in view): Y-14Q-H stays max_drill_depth=3 — the V-1..V-5 preset actually carried depth 4 (Atomic-reaching), so this is a deliberate DOWNGRADE: the granular report now stops at Instrument and does NOT assess Atomic-level DQ_ISSUE/CONTROLLER_INPUT. A future depth-4 preset is the lever if that ever needs to change. Minor dev cleanup: README_HANDOFF landed in two paths (docs/ and lexie-ai/docs/) — dedupe at integration.","Variance"],
  ["Preset Management PM-1: wire layer + wizard shell + step nav — D7 contract mirror (types.ts), typed client over the 9 D7 endpoints, Zustand wizard store. The three corrected values (6-value classification, per-run OPA cost budget, no-'Never' review) are BAKED INTO THE TYPE UNIONS — a prototype regression is now a compile error, not a runtime surprise; DataAccessTier kept distinct from DataClassification; skill_pattern is a SkillType composer (confirmed vs D7 validateStep2), not a dropdown; tsc --strict passes; zero-shell-edit extension contract for PM-2…PM-6","Preset Management"],
  ["Preset Management PM-2: steps 1–3 preset-authoring forms — Identity & scope (report_type null=agnostic handled), Skill plan (SKILL_1/2/3 composer matching D7 validateStep2 ascending tokens, max_steps 1–8 slider), Instruction + complementary context; forms bind via store setStepData with ZERO shell edits (extension contract demonstrated); unpinned Elements 3–5 captured generically not invented; prompt-template + KH-ref pickers flagged as future integrations (list endpoints not in D7's nine)","Preset Management"],
  ["Catalog model: Governance Console is the REFERENCE BLUEPRINT (origin map + reconciliation record), not a build target. The LexIntl 0 prototype sketched the whole governance vision (presets, knowledge hub, audit, policies, roles, MRM); each surface is built independently as its own feature/chat (Presets→Preset Mgmt, Knowledge Hub→chat 3, Audit→chat 7b, policies/roles/MRM→future). The Console view carries a 'where each surface is built' map; each built feature points back to it","Planning"],
  ["Preset Management PM-3: steps 4–7 envelope-authoring forms (the contract-sensitive unit) — the three corrected values render correctly (classification = 7-value union with AI_PROHIBITED hard-stop; cost = per-run budget not dropdowns; review = analyst/senior_management, no 'Never'); the two-axis Step 5 genuinely separated (sensitivity vs access-scope); MRM gate stated (operative gate in PM-5); AND corrected the read-DTO mirror against the real D7 Java records (PresetDto envelopeId/Key/Status, EnvelopeDto snake_case JSONB maps) — verified, not trusted. Regression risk fully closed: compile-enforced (PM-1) + correctly rendered (PM-3)","Preset Management"],
  ["Governance Console marked 'reference' (new 4th nav status, not confirmed/design) and moved to 1st in the GOVERNANCE group — it's the blueprint/origin map you read first, not a build deliverable; not 'completed' because it still prototypes unbuilt surfaces (policies/roles/MRM). Real features (Knowledge Hub, Preset Mgmt) keep their own homes; the blueprint points to them, doesn't contain them","Planning"],
  ["Preset Management PM-4: live per-step validation + commit path — validation is genuinely ADVISORY (Next never gated by validation; commit POST /presets is the real gate; validate failure swallowed); baseline-first auto-validate (the mount-seed is never validated, only genuine edits trigger the debounced 500ms validate — no nagging a fresh step); orchestration in hooks (store stays synchronous); the WizardShell change is a legitimate FOOTER extension (Create-preset on last step + advisory caption), not step-machinery; commit captures PresetDto into the lifecycle slice PM-5 reads (no rework)","Preset Management"],
  ["Preset Management PM-5: lifecycle & activation surfaces — the MRM gate made VISIBLE and honest (Activate disabled unless envelope MRM-approved, with state-reflective explanation text: operational / approved-permitted / requires-approval+current-status; server is final word on a race/409, UI doesn't paper over it); SoD note is NON-BLOCKING (author==approver shows a warning but approve gated by canReview not the SoD check — server-side MRM-SoD OPA gate enforces, matching D5 posture); entitlement show/enable with deny-only-on-explicit-false (correct fail-direction); reuses the 2b StatusChip + reads PM-4's lifecycle slice","Preset Management"],
  ["Preset Management PM-6: preset governance/approval audit view (FINAL PM deliverable — Preset Management complete) — preset-scoped governance evidence: identity & authorship (createdBy), current lifecycle + the MRM approval record (mrmApprovedBy/mrmApprovedAt), OPA policy bindings as {id,package} REFERENCES ONLY (caption: enforcement lives in policy-service), and the envelope governance config (tiers, excluded-never-returned, external-forbidden classifications, per-run cost budget, model allow/deny, review level). REUSES the D5 EvidenceLedgerViewer for referenced runs (not rebuilt) + the PM-5 StatusChips; loads via the existing usePresetLifecycle (no new endpoint). Transition-history gap rendered HONESTLY — current-state + MRM record only, explicit callout that full history needs a D7 field/endpoint (no fabricated timeline). Every read-DTO field verified against types.ts. Two integration edits flagged: confirm EvidenceLedgerViewer prop/path (assumed run) + any PlaceholderResolver, and a runs-by-preset source (none in D7's nine) to populate the runs section","Preset Management"],
  ["Deployment manifest added to the catalog (PLATFORM → Deployment Manifest, reference): the deployable system = the union of the deliverable ZIPS (Foundation, Core Build intelligence-service + lexie-ai, policy-service Rego, 2b front-end, Knowledge Hub, Preset Management), NOT this catalog (which is the map, not the code). Nothing auto-assembles across chats; at packaging time gather the zips into one chat and re-run the handoff-bundle assembly + generate the detailed catalog. Keep every zip in local storage — sandbox files don't persist across chats","Planning"],
  ["App shell owns the configurable-logo / client-CSS / multi-tenant-theming requirement centrally","Planning"],
  ["Core Build D1: intelligence-service DAO layer (NamedParameterJdbcTemplate, BIGINT GeneratedKeyHolder, externalized SQL)","Core Build"],
  ["Core Build D2: Trigger API + run service + governance gate + OPA client (fail-closed) + frozen /run contract","Core Build"],
  ["Core Build D3: host adapter (gateway HTTP, no DB; anti-wandering allow-list in OPA; AI_PROHIBITED defense)","Core Build"],
  ["Core Build D4: model layer (two connector hierarchies; from_classifications is the authoritative gate; degrade-never-fail)","Core Build"],
  ["Core Build D5: skill runtime — MaskingBoundary (authoritative masking check) + cost guardrail (stop never truncate) inline in Skill 3; allow-list stays in OPA","Core Build"],
  ["Core Build D6: persistence + review — evidence trace persisted in ONE transaction (consumer of D5's producer); always-on review queue + decision endpoint","Core Build"],
  ["UC1a vertical slice complete end-to-end across both services — every seam built, every boundary held (thinnest-path-first done)","Core Build"],
  ["tool_scope allow-list lives in OPA Rego and grows per use-case (standing build rule — adapter fails closed until a UC's ops are added)","Core Build"],
  ["/run contract refined: cost_guardrails added to the PresetSnapshot (intelligence-service populates from envelope; lexie-ai enforces post-call)","Core Build"],
  ["Core Build D7: 7-step preset wizard backend — validates to the 6-value classification enum, OPA cost-guardrail shape, analyst/senior_management review (no 'Never')","Core Build"],
  ["MRM gate enforced in code: activatePreset refuses unless the governance envelope is MRM-approved — draft→observed→operational preset + draft→pending→approved envelope lifecycles","Core Build"],
  ["Preset Registry (component 9) = resolution [D2 PresetRegistryService] + authoring [D7 PresetWizardService], kept separate so the run/trigger path is undisturbed","Core Build"],
  ["#12 persist→enqueue recovery sweep built: finds 'completed' runs stranded past a grace window, enqueues idempotently (reuses the guarded WHERE status='completed' UPDATE — re-run/race safe), review_level faithfully resolved from the run's own preset version","Core Build"],
  ["Core Build D8 (slice 1): embedding + retrieval data path — mixed-spaces model_id filter BUILT into the KNN WHERE (flips D4's 'dev team owns this' to done); 3rd OPA gate (embedding_call) fails closed for external; lexie-ai embeds, intelligence-service owns the pgvector store + KNN","Core Build"],
  ["Core Build D8b: NLU (rules→embedding-similarity fallback, §6.3) behind /resolve — reuses slice-1 EmbeddingResolver (inherits dim-safety + embedding gate); ambiguity → clarification chips, no run started (no guessing)","Core Build"],
  ["All 4 entry points now live into one Core: /trigger, in-module, event-driven, and /ask (resolves real classified intent → same governed run path)","Core Build"],
  ["Variance ANCHOR + RECON evidence sub-steps built & merged into the baseline: bounded SkillThree EVIDENCE — 10-Q/10-K anchor via the crosswalk split (central concept-map + per-filer lower-assurance resolution, anchor_ready-gated) and FP&A break decomposition into the CLOSED DriverCategory set (explained% vs residual%, recon→cell via the report's own calc-chain, recon_ready-gated). Signal-only — never drivers, never unmask. Python variance suite 48/48. Carry: anchor concept-map + recon reason→driver table come from the Problem-1 pipeline (not hardcoded), host owns the recon→cell rollup, break amounts arrive dual-form.","Variance"],
  ["GAP 1 COMPLETE — variance 'Re-run with my input' + analyst-attributed driver provenance + preset-change audit (D1-D5, validated, integration-ready overlay). lexie-ai: DriverProvenance {system, analyst_attributed}, DriverFinding.driver now Optional (analyst hypothesis = annotation with driver=None, NOT a new DriverCategory; counted out of is_horizontal_weak so it never suppresses a drill), VarianceRequest.analyst_input masked via a new MaskingBoundary.mask_text. intelligence-service: POST /run/{runId}/rerun re-resolves the LATEST governed preset (not a snapshot), parent_run_id lineage, additive rerun_audit jsonb (+migration) recording any preset change. intelligence-ui: provenance/nullable-driver types, rerunVarianceRun, analyst driver rendered distinctly, count/chart over SYSTEM drivers only. policy: NO new tool_scope op (re-run reuses existing variance ops; proven). Whole-tree green: lexie-ai 81 py_compile + 52 tests, UI 121/121 parse-gate, Java balanced + INSERT parity 30=30, rego balanced. Two PRE-EXISTING seams to wire: a synchronous variance controller returning RunResult incl. runId, and the rich VarianceExplanation through the Java/HTTP boundary (closing the first closes the second).","Variance"],
  ["Skill Registry surface added to the UI (governance/registry view, ALIGNED to AI Presets: tabular inventory → click a row → RHP detail). Skills are authored in code (lexie-ai under SDLC), NOT no-code configured — the surface reads + governs, never authors. Shows identity/version, lifecycle (draft→observed→operational, MRM-gated activation), the tag taxonomy (domain·capability·report-family·risk-tier·required-capability), the skill→tool_scope binding (OPA-externalized), the capability handshake (required-capability vs host-declared *_ready, which drives enable/disable), and versions. A LIVE impl needs NO change to /run or skill execution — additive + read-only: descriptive metadata from a lexie-ai skill MANIFEST + tool_scope ops from Rego + capability handshake + a NEW intelligence.skill_registry table (intelligence-service owns) for persisted lifecycle+MRM state + GET /intelligence/skills(+/{id}). = the Skill Management governance/registry module.","Planning"],
  ["Audit & Evidence skill-provenance requirement recorded: the audit must show which registered skill (id + version) ran, when, and for what purpose. Today agent_run captures intent/use_case/skill_pattern/preset/model/timestamps and agent_run_step captures step_name/skill(SKILL_1/2/3)/tool_called/preset/timestamp — when/purpose/tool/foundational-skill are present, but the FUNCTIONAL skill id+version is NOT (the gap). To be designed/built in the Audit & Evidence chat (additive skill_ref+skill_version column; no structural change).","Planning"],
]
const PENDINGB = [
  ["walk_component aggregation edges — exist in KG or to be added?","blocks UC5b across-report WALK"],
  ["customer_rating + grouping dims registered in meta.attribute?","blocks UC4 concentration"],
  ["Y-14Q-H Knowledge Graph — does equivalent graph exist?","blocks Y14Q-H presets"],
  ["KG item_name enrichment (CrossReferenceIndex) applied?","blocks M4 variance-vertical"],
  ["Live ai schema DDL verified against running host","informs Foundation schema work"],
  ["UC10 Lexie Analytical Assist — needs new adapter ops (inventory search, report definition, handoff)","scoped; own build chat"],
  ["Governance Console — 3 substantive divergences aligned (classification, cost, review); remaining UI specifics reference-level until governance build","mostly resolved"],
  ["Preset observation period (draft→observed promotion + observed→operational graduation) is a later deliverable — gated on Checkpoint/Human-Gate review outcomes (component 5) + Confidence & Scoring (component 11). D7 activatePreset currently allows draft→operational directly; tighten to require observed first if observation becomes mandatory","D7 flagged · needs components 5 + 11"],
  ["NLU thresholds (margin 0.08, embed_floor 0.40, rule_conf 0.95) are starting points — structure is proven, accuracy/recall unproven until tuned against real utterances","D8b flagged · tune in early usage"],
  ["fullWhite wordmark gap (2b) — brand kit ships only a white mark; <Logo form=full tone=white> falls back to the white mark. Commission a white wordmark or accept mark-on-dark","brand decision · not a code blocker"],
  ["2b front-end wire confirmations (typed defensively, none blocking): (1) does PolicyCheckResult arrive as RunResult.policyChecks or derive from evidence steps? (2) is placeholder-resolution under Core/host reporting layer rather than intelligence-service? (3) does the engine emit {{TOKEN}} output markers (TOKEN_RE)?","backend confirm · 2b D-Contracts/D4"],
  ["Knowledge Hub header-less status advance (D3 §5): D1 advances status only for header-backed docs; header-less docs keep status in root-chunk metadata with no advance endpoint, so D3 leaves them at CHUNKED after embedding (vectors persist either way — only displayed status lags). Add a small D1 metadata-status endpoint (or fold into D2/retrieval) to reach AVAILABLE","KH D3 flagged · small D1 follow-up"],
];

// The deployable system = the union of these deliverable zips (the actual CODE; this catalog is
// the map, not the code). At packaging time, gather these zips and assemble (newest wins on a
// shared filename) into one handoff bundle. Keep every zip in local storage — they don't persist
// across chats. [component, what it is, constituent deliverable zips, deploy target]
const DEPLOY_MANIFEST = [
  ["Foundation contracts", "Frozen schema (intelligence DDL), architecture, the /run contract — the shared contract layer everything builds against", "Foundation chat zips (00_foundation_contracts)", "shared / repo root"],
  ["Core engine — intelligence-service", "Java/Spring: DAO layer, Trigger API, governance gate, host adapter, model layer, skill runtime, persistence+review, preset wizard backend (D7), embedding/retrieval (D8), recovery sweep (#12)", "Core Build D1–D8 + #12 zips", "intelligence-service (sole schema writer)"],
  ["Core engine — lexie-ai", "Python/FastAPI AI runtime: skill execution, masking boundary, model connectors, NLU/resolve — NO DB grant, persists via intelligence-service HTTP only", "Core Build D3/D4/D5/D8/D8b zips", "lexie-ai"],
  ["Policy — policy-service (Rego)", "OPA policies: governance gate, tool_scope allow-list, cost guardrails, embedding_call, knowledge_hub_retrieval, MRM-SoD — all externalized, never in code", "Core Build + Knowledge Hub D5 .rego files", "policy-service"],
  ["Front-end foundation (2b)", "intelligence-ui substrate: theming spine (configurable logo, client CSS, multi-tenant), app shell, IntelligenceClient + contracts, component atoms (MaskedValue, status/clarification/progress), evidence+review surfaces, chart set", "2b theming/shell/contracts/D4/D5/D6 zips", "intelligence-ui"],
  ["Knowledge Hub", "Feature over regulatory_document → document_chunk → embedding_store: ingestion API (D1), chunking+embedding via D8 (D3), management UI (D2), retrieval as complementary context (D5)", "Knowledge Hub D1/D3/D2/D5 zips", "intelligence-service + lexie-ai + intelligence-ui"],
  ["Preset Management", "The 7-step wizard UI + lifecycle + governance audit on the D7 backend: wire+shell (PM-1), steps 1–3 (PM-2), steps 4–7 (PM-3), validation+commit (PM-4), lifecycle+MRM gate (PM-5), governance audit (PM-6)", "Preset Mgmt PM-1…PM-6 zips", "intelligence-ui"],
  ["Earlier handoff bundle (reference)", "The 166-file bundle assembled earlier (Core Build era) — the assembly PATTERN to re-run; superseded by a fresh full assembly at final packaging", "Lextr_Intelligence_Handoff.zip", "reference / re-assemble"],
];

// ─── SCHEMA TABLES ──────────────────────────────────────────────────────────
const TABLES = {
  model_registry: { name:"model_registry", icon:"🧠", color:C.teal, note:"TENANT-SCOPED",
    fields:[{name:"id",type:"BIGINT",pk:true},{name:"client_id",type:"TEXT",fk:true,note:"__platform__ = Tier-1"},{name:"tier",type:"ENUM",note:"platform|tenant"},{name:"model_type",type:"ENUM",note:"SLM|LLM|EMBEDDING|RERANKER"},{name:"model_id",type:"TEXT",note:"Qwen3-4B…"},{name:"connector_class",type:"TEXT",note:"QLoRAChatConnector"},{name:"adapter_path",type:"TEXT"},{name:"embedding_dim",type:"INTEGER",note:"384"},{name:"is_local",type:"BOOLEAN",note:"false⇒OPA blocks MNPI"},{name:"is_default",type:"BOOLEAN",note:"1 per type"},{name:"secrets_ref",type:"TEXT",note:"Vault key ref only"}],
    note2:"Three-tier routing. client_id='__platform__' is the Tier-1 default. Partial unique index: at most one default per (tenant, model_type). secrets_ref holds a Vault/KMS reference only — never a credential." },
  prompt_template: { name:"prompt_template", icon:"📝", color:C.blue, note:"GOVERNED",
    fields:[{name:"id",type:"BIGINT",pk:true},{name:"client_id",type:"TEXT",fk:true},{name:"template_key",type:"TEXT",idx:true},{name:"version",type:"INTEGER",note:"never overwritten"},{name:"task",type:"TEXT",note:"task axis"},{name:"report_type",type:"TEXT",note:"report axis"},{name:"body",type:"TEXT"},{name:"variables",type:"JSONB"},{name:"status",type:"ENUM"}],
    note2:"Versioned model-instruction templates. Unique on (tenant, template_key, version) — new rows, never overwrite. Element 1 of a preset." },
  governance_envelope: { name:"governance_envelope", icon:"🛡️", color:C.red, note:"NEW · MRM",
    fields:[{name:"id",type:"BIGINT",pk:true},{name:"client_id",type:"TEXT",fk:true},{name:"envelope_key",type:"TEXT",idx:true},{name:"version",type:"INTEGER"},{name:"status",type:"ENUM",note:"draft…approved"},{name:"allowed_model_ids",type:"BIGINT[]"},{name:"prohibited_model_ids",type:"BIGINT[]"},{name:"mnpi_rules",type:"JSONB"},{name:"cost_guardrails",type:"JSONB"},{name:"opa_policy_bindings",type:"JSONB",note:"refs only"},{name:"mrm_approved_by",type:"TEXT"}],
    note2:"Added beyond the named list (correctly). SPEC §1.2 makes the envelope a SEPARATE object from the preset, with its own versioning + MRM approval. opa_policy_bindings holds OPA package/id references only — the Rego lives in OPA, never in the DB." },
  preset: { name:"preset", icon:"🎛️", color:C.purple, note:"EXPERT LAYER",
    fields:[{name:"id",type:"BIGINT",pk:true},{name:"client_id",type:"TEXT",fk:true},{name:"preset_key",type:"TEXT",idx:true},{name:"version",type:"INTEGER"},{name:"task",type:"TEXT"},{name:"report_type",type:"TEXT"},{name:"envelope_id",type:"BIGINT",fk:true},{name:"prompt_template_id",type:"BIGINT",fk:true},{name:"complementary_context",type:"JSONB"},{name:"style",type:"JSONB"},{name:"guided_questions",type:"JSONB"},{name:"prompt_library",type:"JSONB"},{name:"model_id_override",type:"BIGINT",fk:true,note:"Tier-3"},{name:"skill_pattern",type:"TEXT",note:"1+2+3"},{name:"max_steps",type:"SMALLINT",note:"≤8 CHECK"},{name:"output_type",type:"ENUM"},{name:"status",type:"ENUM"},{name:"forked_from",type:"BIGINT",fk:true,note:"global fork"}],
    note2:"Two-axis (task × report_type), inside a governance_envelope. Carries the 5 preset elements + the runtime contract. CHECK pins max_steps 1–8 and kg_depth ≤5. forked_from supports client-forks-a-global-preset distribution." },
  agent_run: { name:"agent_run", icon:"▶", color:C.amber, note:"EVIDENCE · HEADER",
    fields:[{name:"id",type:"BIGINT",pk:true},{name:"run_id",type:"TEXT",note:"human-readable"},{name:"client_id",type:"TEXT",fk:true},{name:"preset_id",type:"BIGINT",fk:true},{name:"model_id",type:"BIGINT",fk:true,note:"used"},{name:"use_case",type:"TEXT",note:"UC1a…"},{name:"part1_context",type:"JSONB",note:"masked"},{name:"output",type:"JSONB",note:"+placeholders"},{name:"output_type",type:"ENUM"},{name:"confidence_score",type:"NUMERIC"},{name:"status",type:"ENUM"},{name:"review_decision",type:"ENUM",note:"accept|correct|reject"},{name:"reviewer_id",type:"TEXT"},{name:"parent_run_id",type:"BIGINT",fk:true,note:"1:1 drill-down"}],
    note2:"Run header + review outcome (review is run-level — of the assembled output, per SPEC §5.2). part1_context stores masked/structured context only, never raw RESTRICTED. parent_run_id is 1:1; the M:N senior-mgmt synthesis table lands with UC6 (M5+)." },
  agent_run_step: { name:"agent_run_step", icon:"⋯", color:C.green, note:"EVIDENCE · STEP",
    fields:[{name:"id",type:"BIGINT",pk:true},{name:"trace_id",type:"TEXT",idx:true,note:"…BHCK2150…"},{name:"run_id",type:"BIGINT",fk:true,idx:true},{name:"client_id",type:"TEXT",fk:true},{name:"step_number",type:"SMALLINT"},{name:"skill",type:"ENUM",note:"SKILL_1|2|3"},{name:"tool_called",type:"TEXT"},{name:"input",type:"JSONB"},{name:"masking_applied",type:"BOOLEAN"},{name:"masking_types",type:"ENUM[]",note:"which masks"},{name:"data_classification",type:"ENUM"},{name:"model_id",type:"BIGINT",fk:true},{name:"output_type",type:"ENUM"}],
    note2:"Per-step evidence ledger (MRM explainability). Full trace written before any output surfaces. masking_types[] is richer than a boolean; data_classification recorded per step. Reviewer rolls up to agent_run." },
  embedding_store: { name:"embedding_store", icon:"🔢", color:C.teal, note:"VECTOR(384)",
    fields:[{name:"id",type:"BIGINT",pk:true},{name:"client_id",type:"TEXT",fk:true},{name:"chunk_id",type:"BIGINT",fk:true,note:"ON DELETE CASCADE"},{name:"model_id",type:"BIGINT",fk:true,note:"which embedder"},{name:"embedding_dim",type:"INTEGER",note:"=384 CHECK"},{name:"embedding",type:"vector(384)",note:"HNSW cosine"}],
    note2:"pgvector, CHECK-pinned to 384 so a wider model can't silently truncate. Non-384 tenants get a sibling embedding_store_<dim> via later migration. HNSW cosine ANN index. model_id pins provenance per row." },
  document_chunk: { name:"document_chunk", icon:"📄", color:C.blue, note:"KNOWLEDGE HUB",
    fields:[{name:"id",type:"BIGINT",pk:true},{name:"client_id",type:"TEXT",fk:true},{name:"document_id",type:"BIGINT",fk:true,note:"nullable"},{name:"parent_chunk_id",type:"BIGINT",fk:true,note:"null⇒parent"},{name:"doc_type",type:"ENUM",note:"…walk_procedure"},{name:"mdrm_code",type:"TEXT",idx:true},{name:"content",type:"TEXT"},{name:"classification",type:"ENUM",note:"PUBLIC…AI_PROHIBITED"},{name:"is_parent",type:"BOOLEAN",note:"GENERATED"},{name:"metadata",type:"JSONB"}],
    note2:"Parent/child chunking. doc_type includes walk_procedure. document_id nullable — WALK_PROCEDURE / client docs aren't parsed regulatory_document rows. classification drives masking + the AI_PROHIBITED hard-deny." },
  regulatory_document: { name:"regulatory_document", icon:"📋", color:C.blue, note:"PARSER OUTPUT",
    fields:[{name:"id",type:"BIGINT",pk:true},{name:"client_id",type:"TEXT",fk:true},{name:"form_code",type:"TEXT",idx:true},{name:"source_type",type:"ENUM"},{name:"effective_date",type:"DATE"},{name:"schedule",type:"TEXT"},{name:"line_item",type:"TEXT"},{name:"mdrm_code",type:"TEXT",idx:true},{name:"content",type:"TEXT",note:"pre-chunking"},{name:"page_number",type:"INTEGER"}],
    note2:"Parser output, one row per section/table (PDF §1). The pre-chunking raw text; document_chunk references it." },
  cross_reference: { name:"cross_reference", icon:"🔀", color:C.amber, note:"MDRM LOOKUP",
    fields:[{name:"id",type:"BIGINT",pk:true},{name:"client_id",type:"TEXT",fk:true},{name:"form_code",type:"TEXT",note:"resolves across reports"},{name:"mdrm_code",type:"TEXT",idx:true},{name:"item_code",type:"TEXT",note:"e.g. 4340"},{name:"item_name",type:"TEXT",note:"trigram idx"},{name:"schedule",type:"TEXT",idx:true},{name:"line_item",type:"TEXT",idx:true},{name:"authoritative",type:"BOOLEAN"}],
    note2:"Persisted MDRM lookup (PDF §7). POC kept this in RAM; now persisted. form_code included so the same item_code resolves correctly across reports. Trigram GIN index on item_name for name-word search." },
  form_version: { name:"form_version", icon:"🗂️", color:C.slate, note:"INGEST LIFECYCLE",
    fields:[{name:"id",type:"BIGINT",pk:true},{name:"client_id",type:"TEXT",fk:true},{name:"form_code",type:"TEXT"},{name:"effective_date",type:"DATE"},{name:"artifact_type",type:"ENUM"},{name:"ingestion_status",type:"ENUM",note:"pending…completed"},{name:"chunk_count",type:"INTEGER"},{name:"ingested_at",type:"TIMESTAMPTZ"}],
    note2:"Ingestion lifecycle per (form, effective_date, artifact) (PDF §8). Tracks ingestion status + chunk count for the Knowledge Hub pipeline." },
  walk_mapping: { name:"walk_mapping", icon:"🔗", color:C.purple, note:"RECON · UC5b",
    fields:[{name:"id",type:"BIGINT",pk:true},{name:"client_id",type:"TEXT",fk:true},{name:"walk_key",type:"TEXT",idx:true,note:"Y9C_TOTAL_LOANS"},{name:"version",type:"INTEGER"},{name:"target_form_code",type:"TEXT"},{name:"target_mdrm_code",type:"TEXT"},{name:"components",type:"JSONB",note:"[{form,mdrm,operator,basis}]"},{name:"source_basis",type:"TEXT",note:"edit_check|rule|proc"},{name:"procedure_chunk_ids",type:"BIGINT[]",note:"→ walk_procedure"}],
    note2:"Postgres-side curated across-report WALK. Structural walk_component edges are owned by Neo4j; components here reference MDRM codes logically (cross-store, no FK). Links to WALK_PROCEDURE chunks for the interpretive methodology." },
};
const TABLE_ORDER = ["embedding_chunk","embedding_chunk_source","chunk_reference","chunk_reference_unresolved","model_registry","prompt_template","governance_envelope","preset","agent_run","agent_run_step","embedding_store","document_chunk","regulatory_document","cross_reference","form_version","walk_mapping"];

const SKILLS = [
  { n:"1", icon:"🔍", label:"Entity & State Resolver", color:C.blue, pattern:"Lookup · deterministic · max 3 steps",
    does:"Maps NL / partial identifiers to structured Part-1 context. MDRM→report/schedule, concept→MDRM, 'current period'→actual, scope refs→scope defs.",
    tools:["semantic_service.resolve_mdrm","semantic_service.resolve_concept","workflow_adapter.get_current_period","knowledge_graph.get_node","knowledge_hub.get_client_glossary"],
    cannot:"No data values. No generation. No writes. Cannot call Skill 3." },
  { n:"2", icon:"🕸️", label:"Graph Traversal", color:C.purple, pattern:"Depth-limited · 3 hops default, 5 max",
    does:"Follows dependency / aggregation edges. Downstream impacts, upstream deps, calculation chain, walk_component aggregation, related edit checks. Cross-report edges wired but empty until built.",
    tools:["knowledge_graph.get_downstream_impacts","knowledge_graph.get_upstream_dependencies","knowledge_graph.get_calculation_chain","knowledge_graph.get_walk_components","knowledge_graph.get_related_edit_checks"],
    cannot:"No data adapter (no values). No model calls. No writes. Cannot call Skill 1 or 3." },
  { n:"3", icon:"⚙️", label:"Multi-Step Assembly", color:C.amber, pattern:"Bounded-agentic · max 8 steps",
    does:"Orchestrates Skills 1+2 + masked data fetch + SLM synthesis. Only skill that calls the model. Decides analytical routing. Produces placeholder-token output.",
    tools:["skill_1.resolve","skill_2.traverse","data_adapter.get_values (masked)","data_adapter.get_grouped_aggregation","data_adapter.get_threshold_comparison","model_abstraction.call","evidence_ledger.record"],
    cannot:"No raw database. No tool outside its list. Cannot call another Skill 3 (no recursion)." },
];
/* ==============================================================================
 * GOVERNANCE CHAINS - one engine, five callers.
 *
 * Nothing in this catalog recorded that the estate HAS approval chains. What differs per
 * capability is roles, floors, preconditions and state names - not the mechanism.
 *
 * INHERITED AUTHORITY is the other half and matters as much: a capability that does not
 * own a workflow must NOT draw a step ring or a track strip, and a gate fails if an assist
 * surface does. Showing a workflow it does not own implies an approval that never happens.
 * ============================================================================== */
const GOV_CHAINS = [
  { cap:"Knowledge Hub",  spec:"KH_CHAIN_SPEC",     steps:"Submit \u2192 Review \u2192 (MRM)", floors:"RESTRICTED / MNPI classification", governs:true },
  { cap:"Presets",        spec:"PRESET_CHAIN_SPEC", steps:"Submit \u2192 Review \u2192 (MRM)", floors:"benchmark below threshold", governs:true },
  { cap:"Training Data",  spec:"TDM_CHAIN_SPEC",    steps:"Submitter \u2192 Reviewer \u2192 (MRM)", floors:"bound adapter, RESTRICTED / MNPI", governs:true },
  { cap:"Skill Registry", spec:"SKILL_CHAIN_SPEC",  steps:"Propose \u2192 Review \u2192 (MRM)", floors:"the skill's OWN risk tier; operations that ACT rather than read", governs:true },
  { cap:"Drop Profiles",  spec:"shared chain engine", steps:"Propose \u2192 Review \u2192 (MRM)", floors:"RESTRICTED corpus", governs:true },
  { cap:"Rules & Logic",     spec:"\u2014", steps:"inherits from Core", floors:"\u2014", governs:false },
  { cap:"Analytical Assist", spec:"\u2014", steps:"inherits from Core", floors:"\u2014", governs:false },
  { cap:"Impact Assessment", spec:"\u2014", steps:"inherits from Core", floors:"\u2014", governs:false },
  { cap:"Digital Twin",      spec:"\u2014", steps:"inherits from Core", floors:"\u2014", governs:false },
];

/* ==============================================================================
 * LEDGER ACTIONS - one estate-wide contiguous sequence, with gap detection.
 *
 * RECORD FIRST, APPLY SECOND. A refusal changes no state, so if it is not here it is
 * nowhere - and the only unrecorded events would be the ones somebody was STOPPED from
 * doing. A refusal carries no destination: recording one would claim a move that did not
 * happen.
 *
 * `witnessed: false` is stated on screen. There is no external notarisation, and a surface
 * implying otherwise would be worse than one that admits it.
 * ============================================================================== */
const LEDGER_ACTIONS = [
  { track:"INGESTION",      actions:"INGESTED, PIPELINE, PARSE, PARSE_REFUSED, DROP_DECLARED" },
  { track:"ASSURANCE",      actions:"ASSR_STARTED, ASSR_MEASURED, ASSR_JUDGED" },
  { track:"GOVERNANCE",     actions:"SUBMIT, ATTEST, APPROVE, REJECT, RETIRE, ROLLBACK, ESCALATE, FREEZE" },
  { track:"GOVERNANCE",     actions:"PRE_SUBMIT, PRE_APPROVE, PRE_REJECT" },
  { track:"GOVERNANCE",     actions:"TDM_SUBMIT, TDM_ATTEST, TDM_APPROVE, TDM_REJECT, TDM_LIFECYCLE" },
  { track:"GOVERNANCE",     actions:"SKL_PROMOTE, SKL_ACTIVATE, SKL_REJECT, SKL_RETIRE" },
  { track:"NON_EVIDENTIAL", actions:"sandbox runs - recorded and retrievable, kept off the governance record" },
];

const USE_CASES = [
  /* SIX CAPABILITIES THE ESTATE SHIPS AND THIS REGISTER DID NOT CARRY. */
  { uc:"KH", name:"Knowledge Hub \u2014 ask the corpus", skills:"retrieval", out:"answer + citation", color:C.blue, milestone:"built", note:"Answers carry page_number and parent_path \u2014 an answer without a citation is an assertion. Untraced, never fabricated." },
  { uc:"DP", name:"Drop Profiles", skills:"\u2014", out:"a governed definition", color:C.amber, milestone:"built", note:"What a parse deliberately does not ingest. Scoped to a document FAMILY, versioned; every parse records the profile id and version. It is the only place content is deliberately made uncitable." },
  { uc:"TDM", name:"Training Data & Models", skills:"\u2014", out:"curated datasets, attestation", color:C.teal, milestone:"built", note:"Register, curate, freeze, attest, approve. Sandbox runs on the NON_EVIDENTIAL track." },
  { uc:"SKL", name:"Skill Registry", skills:"\u2014", out:"a governed catalogue", color:C.teal, milestone:"built", note:"Skill LOGIC stays in lexie-ai under SDLC. The registry surface is additive and read-only relative to the /run contract." },
  { uc:"RISK", name:"AI Risk & Controls", skills:"\u2014", out:"a review queue", color:C.amber, milestone:"built", note:"AI Risk RAISES; it does not decide. Confidence is a signal and gates nothing." },
  { uc:"TODO", name:"To-do Inbox", skills:"\u2014", out:"routed work", color:C.blue, milestone:"built", note:"Core routes; it does not decide \u2014 SURFACE_ROUTES_ONLY." },
  { uc:"UC1a", name:"Variance — horizontal", skills:"1 + 3", out:"narrative", color:C.teal, milestone:"M3", note:"Flagship stage 1. Single-level explanation, fewest dependencies." },
  { uc:"UC1b", name:"Variance — vertical", skills:"1 + 2 + 3", out:"narrative", color:C.amber, milestone:"M4", note:"Flagship stage 2. Drill-down via calculation chain. Gated on KG production-ready." },
  { uc:"UC12", name:"Operational data query", skills:"1 + 3", out:"narrative / narrative+dataset / needs_input", color:C.blue, milestone:"M5+", note:"BUILT (chat 6). 'When is the Y-9C due? Where is the approval sitting and since when?' Reasons over WORKFLOW / operational status (deadlines, approval routing, aging) — NOT data values or report metadata. Maps to Orchestration Intelligence. Two generic typed host-routed ops (read_operational_value/_chain), tool_scope gated by CATEGORY. A Digital Twin component." },
  { uc:"UC8", name:"Semantic & reference query", skills:"1 + 2 + 3", out:"narrative / narrative+dataset / needs_input", color:C.purple, milestone:"M5+", note:"RE-SCOPED (critical UC): bounded intent-routed NL query over meaning·reference·value across regulatory + business. Regulatory reads CONSUME the Lextr Core gold copy (regstruct.*) via the SL exposure contract C1, READ-ONLY via adapter (C9 pending); composed_definition_txt (STD-INTEL-01) = definition contract, element_version = versions, element_dependency CROSS_REFERENCE = cross-report. Business = host data plane (get_values/get_grouped_aggregation) + business model (entity/org/KPI). KH = NON-authoritative complementary context only. Owns R1 cell-def · R2 table-def · R3 reg-ref · R4 cross-report · R5 version-diff · B2 code-dict · B3 org · B4 counterparty · B5 value · B6 segmented · B8 KPI; routes B1 approval→UC12, B7 POP-variance→UC1." },
  { uc:"UC2", name:"Impact analysis", skills:"1 + 2", out:"impact_list / ranked_list", color:C.teal, milestone:"BUILT", note:"BUILT (chat 6): deterministic two-pass — forward walk (Skill-2 reused, bounds recorded) + Δ propagation (convergence-once) + affected edit-check evaluation (breaks/clears/unchanged/undetermined). NO SLM by construction. A1: any subject node kind (incl. internal COA) + rule/definition/mapping changes (structural by construction). Within-report LIVE; cross-report edge-gated (fail-closed, verbatim reason). SURFACE (A2): DUAL — INLINE (Ask Lexie) + DRAWER (Core context: topside · edit-check · report module), one headless render-model. (NOT Rules & Logic Assist — UC11; UC11 will COMPOSE this read primitive.)" },
  { uc:"UC3", name:"Trend analysis", skills:"1 + 3", out:"dataset/chart", color:C.teal, milestone:"post-M3", note:"'Last 5 quarters off-balance-sheet EOD.' SURFACE (SME 2026-07-18): conversation capability (Digital Twin) — asked in Lexie AI, answered INLINE in the Lexie panel: trend chart (mini line/area, shaped by the data as returned) + tabular dataset + classification chip + narrative." },
  { uc:"UC4", name:"Concentration analysis", skills:"1 + 3", out:"dataset/chart", color:C.blue, milestone:"post-M3", note:"'Concentration by customer rating.' Grouped aggregation → pie/treemap." },
  { uc:"UC5a", name:"WALK — within report", skills:"1 + 2 + 3", out:"reconciliation", color:C.amber, milestone:"M4", note:"Same pattern as variance-vertical. Waterfall output." },
  { uc:"UC5b", name:"WALK — across report", skills:"1 + 2 + 3", out:"reconciliation", color:C.purple, milestone:"M5+", note:"Y9C ← FRY14Q-A + 14M + 14Q-H1 + 14Q-K. Needs walk_component edges." },
  { uc:"UC6", name:"Risk appetite scan", skills:"1 + 3", out:"ranked list", color:C.purple, milestone:"M5+", note:"Senior-mgmt mode. Pre-computed boolean comparisons — no raw RESTRICTED values." },
  { uc:"UC7", name:"Validation check", skills:"1 + 2", out:"validation", color:C.green, milestone:"post-M3", note:"'Validate' button. Mechanical edit-check check — cites rule, never asserts correctness." },
  { uc:"UC9", name:"Digital Twin — orchestration (Lexie)", skills:"all", out:"all types", color:C.slate, milestone:"last", note:"The ORCHESTRATION that composes the Digital Twin component skills (UC3–UC8, UC12). Picks and runs the right pattern at runtime. Built last, on proven parts." },
  { uc:"UC10", name:"Lexie Analytical Assist", skills:"1 + 3 (embedding match)", out:"report_match_set", color:C.blue, milestone:"design", note:"Report discovery & construction by intent. Searches the report inventory → ranked % matches with gap chips → run as-is / refine / build from scratch → hands to the analytical builder. Reasons over the report catalog, not the numbers. Inventory knowledge is inference-first (structure + semantic layer), registration optional. Separate entry point, same Core engine. Lightweight-governed: discovery evidenced, review gates at execution." },
  { uc:"UC11", name:"Rules & Logic Assist (authoring copilot)", skills:"1 + 2 + 3", out:"rule_draft", color:C.amber, milestone:"last (after UC9 + UC10)", note:"Copilot for the human RULE AUTHOR — not validation/impact-reading. Lextr CORE owns the rule-authoring platform/engine + hosts the fixed published edit-check rules (Intelligence only aligns those to Lextr grammar for fast execution, never alters regulator logic). The assist helps the author WRITE rule syntax from regulatory instruction + internal business process: drafts a proposed rule scoped to COE + MDRM/Taxonomy with a MANDATORY rationale; draws on three sources — Semantic Layer (object/attribute/definition/ENUMERATIONS/filter-lookups), registered regulatory docs (instruction/template), business strategy; COMMONALITY analysis against the EXISTING rules inventory (reuse / fork-edit); IMPACT assessment (rule change → other rules). Human always authors & commits in Core; propose-only, with rationale. PLAN CAREFULLY before any build. OPEN grammar/handoff fork: Intelligence emits Lextr grammar itself vs hands a structured intent to Core to render. New output type rule_draft (Deliverable-#1 delta). Seam deps (consume-from-host): get_semantic_catalog, get_rules, build/handoff to Core authoring." },
];
// UC → LHP capability tag (UC2-UC9 are components of the Digital Twin; UC9 = the orchestration).
const UC_CAPABILITY = { UC1a:"Variance", UC1b:"Variance", UC2:"Digital Twin · Rules", UC3:"Digital Twin", UC4:"Digital Twin", UC5a:"Digital Twin", UC5b:"Digital Twin", UC6:"Digital Twin", UC7:"Digital Twin", UC8:"Digital Twin", UC9:"Digital Twin", UC12:"Digital Twin", UC10:"Analytical Assist", UC11:"Rules Assist" };
const CAP_COLOR = { "Variance": C.teal, "Digital Twin": C.red, "Digital Twin · Rules": C.purple, "Analytical Assist": C.blue, "Rules Assist": C.amber };
// ─── DELIVERABLE #5 · AGENTIC-VS-SIMPLE DECISION TABLE ──────────────────────
const DECISION_CATS = {
  simple:   { label: "Simple", color: C.green, note: "No model call, no orchestration. Skills 1/2 only — resolve, then traverse or look up. Deterministic, one pass. No model_abstraction.call on the allow-list, so it physically cannot reach the model." },
  slinear:  { label: "Simple-agentic", color: C.blue, note: "Skill 3 runs a fixed, short, linear sequence — resolve → fetch → synthesise. Calls the model, but the step list is declared in the preset, not discovered. No branching, no KG." },
  bounded:  { label: "Agentic (bounded)", color: C.amber, note: "Skill 3 with one conditional beat (drill only if explanation weak; traverse then decide what to fetch). Declared, capped sequence — the branching earns 'agentic', not loops or self-direction." },
};
const DECISION_TABLE = [
  { uc:"UC1a", cat:"slinear", steps:6, kg:"no", allow:"get_values · get_complementary_context · model_abstraction.call · evidence_ledger.record", out:"narrative" },
  { uc:"UC1b", cat:"bounded", steps:8, kg:"prod", allow:"UC1a set + graph_calculation_chain", out:"narrative" },
  { uc:"UC2", cat:"simple", steps:3, kg:"split", allow:"impact.get_dependents · impact.get_related_edit_checks · impact.get_values · impact.evaluate_edit_checks† · evidence_ledger.record — NO model_abstraction.call (by construction)", out:"impact_list / ranked_list" },
  { uc:"UC3", cat:"slinear", steps:5, kg:"no", allow:"get_values (multi-period) · model_abstraction.call · evidence_ledger.record", out:"dataset / chart" },
  { uc:"UC4", cat:"slinear", steps:5, kg:"no", allow:"get_grouped_aggregation · model_abstraction.call · evidence_ledger.record", out:"dataset / chart" },
  { uc:"UC5a", cat:"bounded", steps:8, kg:"yes", allow:"graph_calculation_chain · get_values · model_abstraction.call · evidence_ledger.record", out:"reconciliation" },
  { uc:"UC5b", cat:"bounded", steps:8, kg:"walk", allow:"UC5a set + graph_walk_components + get_complementary_context (WALK_PROCEDURE)", out:"reconciliation" },
  { uc:"UC6", cat:"bounded", steps:6, kg:"no", allow:"get_threshold_comparison · model_abstraction.call · evidence_ledger.record", out:"ranked_list" },
  { uc:"UC7", cat:"simple", steps:3, kg:"edit", allow:"graph_related_edit_checks · get_rules", out:"validation" },
  { uc:"UC8", cat:"bounded", steps:8, kg:"opt", allow:"intent_router (CLOSED set → 3 lanes) · SL-EXPOSURE reads (get_element_definition[composed_definition_txt] / get_report_structure / get_element_versions / get_element_dependencies — Core gold copy via C1, read-only, C9 pending) · resolve_concept (business-term→Taxonomy enrichment) · get_values / get_grouped_aggregation (data plane) · entity / org / KPI reads (Phase-B stubs) · model_abstraction.call · evidence_ledger.record — tool_scope gates by INTENT→op; route_out → UC12 / UC1", out:"narrative / narrative+dataset / needs_input" },
  { uc:"UC12", cat:"slinear", steps:5, kg:"no", allow:"resolve_concept (Semantic Layer: what/where/kind/category) · read_operational_value† / read_operational_chain† (generic typed host-routed ops) · model_abstraction.call · evidence_ledger.record — tool_scope gates by operational-concept CATEGORY (workflow_status · deadline · approval_routing), not per-question op names", out:"narrative / narrative+dataset / needs_input" },
  { uc:"UC9", cat:"bounded", steps:8, kg:"yes", allow:"union of all patterns (orchestrates the others)", out:"all types" },
  { uc:"UC10", cat:"slinear", steps:6, kg:"no", allow:"search_report_inventory† · get_report_definition† · BaseEmbeddingConnector.embed · build/handoff† · evidence_ledger.record", out:"report_match_set ‡" },
  { uc:"UC11", cat:"bounded", steps:8, kg:"yes", allow:"resolve_concept/mdrm · get_semantic_catalog† · get_complementary_context (reg docs) · get_rules† (commonality vs existing rules) · graph_related_edit_checks / rule-dependency (impact) · model_abstraction.call · build/handoff† (Core authoring) · evidence_ledger.record", out:"rule_draft ‡‡" },
];
const KG_TAGS = {
  no:   { label: "No KG", color: C.textD },
  prod: { label: "KG · prod", color: C.green },
  yes:  { label: "KG · yes", color: C.green },
  edit: { label: "KG · edit checks", color: C.green },
  walk: { label: "KG · walk_component (empty)", color: C.amber },
  split:{ label: "KG · within-now / cross-report pending", color: C.amber },
  opt:  { label: "KG · optional", color: C.textM },
};
const CHART_SET = [
  ["Line","Change over time (1–2 series)",C.teal],["Area","Volume over time, magnitude",C.teal],
  ["Stacked area","Composition over time",C.blue],["Bar","Compare discrete periods/cats",C.blue],
  ["Stacked bar","Composition within periods",C.purple],["Pie / donut","Concentration at a point (<8)",C.purple],
  ["Treemap","Hierarchical concentration",C.amber],["Scatter","Relationship of two measures",C.amber],
  ["Waterfall","Build-up / reconciliation (WALK)",C.green],
];
const COMPLIANCE_PROPS = [
  ["Explainability","Every output traces to data, reasoning and source via the evidence ledger.","Supports model-risk explainability (e.g. SR 11-7)"],
  ["Full audit trail","Step-level evidence per run: inputs, outputs, masking, classification, reviewer, timestamp.","Supports audit & traceability expectations"],
  ["Human oversight","Every AI output reviewed before it surfaces. Human-in-the-loop → human-on-the-loop.","Supports human-accountability expectations"],
  ["Data classification & MNPI","Masking + OPA enforce MNPI→local-SLM. AI never sees raw restricted values.","Supports information-barrier / data governance (e.g. BCBS 239)"],
  ["Model governance","Preset governance envelope, MRM approval, versioned prompts & models, re-eval on change.","Supports model lifecycle governance"],
  ["Tenant isolation","Multi-tenant scoping by client_id; on-prem keeps data on-site.","Supports data residency & segregation"],
];

// ─── HOST DEPENDENCIES ──────────────────────────────────────────────────────
// What Intelligence needs (capability, host-agnostic) → how Lextr Core serves it (the first adapter impl).
// type: universal (any reporting host has it) · expected (most do) · provided (Intelligence brings its own)
const DEP_TYPES = {
  universal: { label: "Universal", color: C.green, note: "any regulatory reporting host has this" },
  expected:  { label: "Expected", color: C.amber, note: "most hosts have it; not guaranteed" },
  provided:  { label: "Intelligence-provided", color: C.teal, note: "Intelligence brings its own; no host dependency" },
};
const HOSTDEPS = [
  { cap: "Resolve MDRM / business concept", core: "meta.mdrm_dictionary · meta.attribute · meta.logical_name", type: "universal", via: "semantic-service" },
  { cap: "Resolve report / schedule / hierarchy", core: "meta.node_hierarchy · meta.resource_page_taxonomy", type: "universal", via: "semantic-service" },
  { cap: "Current period / restatement version", core: "data.rpt_run_control (period, restatement_version)", type: "universal", via: "workflow adapter" },
  { cap: "Fetch a reported value (masked)", core: "data.rpt_tax_fact (prov_id for lineage)", type: "universal", via: "data adapter + masking" },
  { cap: "Read edit-check results", core: "data.rpt_edit_check_fact (eval, fail_subset)", type: "expected", via: "data adapter" },
  { cap: "Read a rule + its lineage", core: "meta.rule_master · meta.rule_detail · meta.rule_on_rule_mapping", type: "expected", via: "rules adapter" },
  { cap: "Grouped aggregation (concentration)", core: "data.financial_ledger_ds + meta.attribute grouping dims", type: "expected", via: "data adapter" },
  { cap: "Correlate an async AI run", core: "data.async_request_tracker (exec_id)", type: "expected", via: "trigger API" },
  { cap: "Identity / entitlement / role", core: "Keycloak + meta.role_master · meta.role_action_map", type: "universal", via: "platform identity" },
  { cap: "Live UI updates (read-only subscribe)", core: "pg_notify channels", type: "expected", via: "event subscription" },
  { cap: "Knowledge Graph (lineage, edges, walk)", core: "— Intelligence owns this (Neo4j FRY9C graph)", type: "provided", via: "Skill 2" },
  { cap: "Masking & data classification logic", core: "— Intelligence owns masking; host supplies classification tags", type: "provided", via: "masking layer" },
  { cap: "Embeddings / vector store", core: "— Intelligence owns intelligence.embedding_store", type: "provided", via: "model abstraction" },
  { cap: "Presets, evidence ledger, agent runs", core: "— Intelligence owns the entire intelligence schema", type: "provided", via: "Intelligence Core" },
];

// ─── ADAPTER OPERATIONS (Deliverable #3) ────────────────────────────────────
const ADAPTER_OPS = [
  { grp: "Capability / versioning", color: C.slate, ops: [
    ["adapter_version()", "stable contract version"],
    ["capabilities(client_id)", "which optional ops this host supports — Core degrades gracefully, never assumes"],
  ]},
  { grp: "Skill 1 · entity & state resolution", color: C.blue, ops: [
    ["resolve_mdrm(code)", "MDRM → metadata"],
    ["resolve_concept(text)", "business language → MDRM set (semantic-service)"],
    ["get_current_period(report_type)", "open period, or None → 'use last closed?' prompt"],
    ["get_client_glossary()", "client semantic map"],
    ["resolve_scope(scope_ref)", "'all reports' / 'Y9C' → structured scope"],
  ]},
  { grp: "Semantic catalog", color: C.teal, ops: [
    ["get_semantic_catalog(scope)", "tier-filtered grounding; NEVER returns EXCLUDED; empty/degraded on a host with no semantic layer"],
  ]},
  { grp: "Rules / edit checks", color: C.amber, ops: [
    ["get_rules(mdrm_set)", "rule definitions (cites the rule, never asserts truth)"],
    ["get_related_edit_checks(mdrm)", "edit-check definitions — traversal is Skill 2, not here"],
  ]},
  { grp: "Skill 2 · Knowledge Graph (structural, no values)", color: C.purple, ops: [
    ["graph_get_node(mdrm)", "node lookup"],
    ["graph_downstream_impacts(mdrm, depth)", "depth-capped"],
    ["graph_upstream_dependencies(mdrm, depth)", "depth-capped"],
    ["graph_calculation_chain(mdrm)", "formula path; within- + cross-report"],
    ["graph_nested_downstream_impacts(mdrm, max_depth)", "nested traversal"],
    ["graph_walk_components(target_mdrm)", "across-report WALK (UC5b) — empty until walk_component edges exist"],
  ]},
  { grp: "Skill 3 · data retrieval (MASKED) + analytics", color: C.green, ops: [
    ["get_values(mdrm_set, period)", "values returned ALREADY MASKED per cell tier; EXCLUDED omitted"],
    ["get_threshold_comparison(mdrm_set, preset, period)", "pre-computed booleans — AI reasons on booleans, not raw values"],
    ["get_grouped_aggregation(mdrm_set, period, group_by, metric)", "concentration (UC4); group_by must be in meta.attribute or raises"],
  ]},
  { grp: "Complementary grounding", color: C.blue, ops: [
    ["get_complementary_context(preset_id)", "Knowledge Hub assets bound to the preset (Element 2); respects classification"],
  ]},
  { grp: "Write — the ONE write op (permission-gated)", color: C.red, ops: [
    ["write_back_result(result)", "review-accepted only · target ALLOWED tier · idempotency key · never writes raw restricted"],
  ]},
];
const ADAPTER_SERVICES = [
  ["resolve_*, get_semantic_catalog", "semantic-service (FastAPI)", "logical↔physical, catalog, ai_* grounding; tier filter from catalog object"],
  ["get_current_period", "workflow service (Java)", "open-period lookup; None when none open"],
  ["get_client_glossary, get_complementary_context", "Knowledge Hub (via Core)", "client map + preset grounding; classification respected"],
  ["get_rules, get_related_edit_checks", "rules service (Java)", "rule / edit-check definitions; cites the rule"],
  ["graph_*", "Neo4j via Core graph endpoint", "depth caps; cross-report + walk_component. Subject to Neo4j GPL-3 open decision"],
  ["get_values, get_threshold_comparison, get_grouped_aggregation", "data-service (FastAPI, Dask) / ClickHouse", "masking + tier filter applied host-side, before the gateway response"],
  ["write_back_result", "reportgen / workbench (Java)", "permission-gated; idempotency key; review-accepted runs only"],
];

// ─── GOVERNANCE CONSOLE (from "LexIntl 0 Governance" chat — UI prototype) ────
const GOV_NAV = [
  { group: "Content", items: ["Knowledge Hub", "Configuration"] },
  { group: "Governance", items: ["Runtime Policies Catalog", "AI Presets", "Skill Registry"] },
  { group: "Oversight", items: ["Role & Capability Mapping", "AI Governance & Risk Controls", "Audit & Evidence"] },
];
const PRESET_WIZARD = [
  ["1", "Purpose", "Preset name · primary persona · business purpose · expected output type · criticality"],
  ["2", "Prompt & Inputs", "System prompt · user input fields · output format · prompt version"],
  ["3", "Knowledge Source", "Tag Knowledge Hub assets — the grounding bound to the preset (Element 2)"],
  ["4", "Narrative Style", "Tone, structure, disclosure conventions for the generated output"],
  ["5", "Runtime Controls", "Runtime policies (OPA refs) · data classification (PUBLIC / INTERNAL / CONFIDENTIAL / RESTRICTED / SENSITIVE / MNPI · AI_PROHIBITED hard-denies) · cost guardrail (governance_envelope.cost_guardrails, OPA-resolved) · human-review trigger (Always / High-risk — never Off)"],
  ["6", "Benchmark & MRM", "Benchmark dataset · expected similarity · hallucination check · explainability check · MRM reviewer · approval SLA"],
  ["7", "Activate", "Preset summary → Submit for MRM / AI Governance Approval · Save as Draft · Generate Evidence Pack"],
];
const OPA_REGISTER = [
  /* TWELVE PACKAGES THE UI ENFORCES AND THIS REGISTER DID NOT NAME. Codes below were read
     from the decision sites in ui25.jsx; where a package's refusal codes were not adjacent
     to its `pkg:` reference the entry states the CONDITION rather than guessing a code. */
  ["OPA-AI-010", "Tool Scope", "an operation not in the allow-list", "Adapter fails closed \u2014 refused, not guessed", C.red],
  ["OPA-AI-011", "Cost Guardrails", "token budget exceeded", "Refuse; NEVER silent-truncate", C.red],
  ["OPA-AI-012", "MRM Separation of Duties", "the approver authored the artefact", "Refuse \u2014 approval is refused for whoever authored it", C.red],
  ["OPA-AI-013", "Preset Lifecycle", "draft \u2192 observed \u2192 operational", "Governs SUBMIT / APPROVE / REJECT on a preset", C.amber],
  ["OPA-AI-014", "Skill Lifecycle", "promote, activate, retire", "NO_TOOL_SCOPE refuses activation of a skill with no bound operations; NOT_OBSERVED precedes the role check", C.amber],
  ["OPA-AI-015", "TDM Registration", "a dataset entering curation", "Governs registration of training data", C.amber],
  ["OPA-AI-016", "TDM Lifecycle", "freeze, attest, approve", "CONTAMINATED \u00b7 NOT_CHECKED \u00b7 NO_SUBJECT \u00b7 READY", C.amber],
  ["OPA-AI-017", "TDM Sandbox", "a sandbox run", "Recorded on the NON_EVIDENTIAL track \u2014 retrievable, kept off the governance record", C.blue],
  ["OPA-AI-018", "TDM Export", "exporting a dataset as uploaded", "The panel shows what would happen; taking it is the act", C.amber],
  ["OPA-AI-019", "Drop Profile", "what a parse deliberately does not ingest", "DROP_DECLARED. Refused with no function set, not the submitter, no scope, or a reason under 12 characters", C.amber],
  ["OPA-AI-020", "To-do Routing", "an intent on a surface", "SURFACE_ROUTES_ONLY \u2014 Core routes; it does not decide", C.blue],
  ["OPA-MCA-033", "MCA Separation of Duties", "control assessment", "Separation of duties on MCA", C.red],
  ["OPA-REG-015", "Regulatory Review", "a narrative destined for a filing", "Human review inserted", C.amber],
  ["OPA-AI-001", "External LLM Restriction", "MNPI / restricted detected", "Force Lextr SLM, block external routing", C.red],
  ["OPA-REG-014", "High-Risk Submission Review", "High-risk regulatory narrative", "Insert human approval workflow", C.amber],
  ["OPA-MCA-032", "TopSide BD20 Additional Approver", "TopSide adjustment", "Maker-checker — extra approver", C.blue],
  ["OPA-COST-018", "Runtime Cost Guardrail", "LLM runtime request", "Enforce max cost / request", C.purple],
];
const GOV_DOMAINS = [
  ["Knowledge", "Regulatory SME / Reg Reporting Ops", "Regulatory instructions, procedures, glossary, prior narratives — the grounding corpus"],
  ["Runtime Policies", "Risk / Compliance / Policy Admin", "Executable runtime decisions — guardrails, gating, escalation, routing (OPA)"],
  ["Configuration", "Lextr Admin / Implementation", "Build-time report setup — templates, edit checks, mappings, workflow orchestration"],
];
const GOV_AISUBTABS = ["Model Inventory", "AI Policy Register", "Data Sovereignty & MNPI", "Jurisdictional Controls", "Benchmark & Validation", "Runtime Monitoring"];
const GOV_AUDIT = ["Audit Log", "Agent Trace", "Evidence Vault"];
const GOV_RECONCILE = [
  ["Data classification — enforced", "6-value enum (PUBLIC/INTERNAL/CONFIDENTIAL/RESTRICTED/SENSITIVE/MNPI + AI_PROHIBITED), validated server-side in the D7 wizard backend — a malformed preset never reaches the DB", C.green],
  ["Cost guardrail — enforced", "per-run budget (max_tokens_per_run, max_cost_per_run_usd) on the envelope (D4 shape); authored in D7, enforced post-call in D5 — not fixed dropdown tiers", C.green],
  ["Human-review trigger — enforced", "analyst / senior_management only; 'Never' is not a valid review level in the D7 backend. Structural review always-on", C.green],
  ["MRM gate — enforced in code", "D7 activatePreset refuses to make a preset operational unless its governance envelope is MRM-approved — human-in-the-loop, not UI-suggested", C.green],
];

const PILLARS = [
  { name: "Regulatory Reasoning", icon: "🧠", color: C.teal,
    bullets: ["Cross-report intelligence (Y-9C, Y-14Q)","Detect inconsistencies & anomalies","Explains drivers of change","Gap identification"],
    maps: "UC1a/b Variance · UC8 Semantic query" },
  { name: "Orchestration Intelligence", icon: "🗂️", color: C.blue,
    bullets: ["AI-driven prioritization","Dynamic workflow routing","Deadline & risk-aware execution","Lifecycle tracking"],
    maps: "Event-driven trigger · rides Core workflow engine · not yet a numbered UC" },
  { name: "Data & Control Intelligence", icon: "🔬", color: C.purple,
    bullets: ["Advanced validation beyond rules","Cross-report integrity","Lineage-aware anomaly detection","Continuous data monitoring"],
    maps: "UC7 Validation · UC2 cross-report integrity" },
  { name: "Rules & Logic Assist", icon: "⚖️", color: C.amber,
    bullets: ["Assist in rule creation (graph + expression + NL)","Suggest rule improvements & optimization","Detect overlaps, redundancies, conflicts","Trace rules to regulatory lines & disclosures"],
    maps: "UC11 Rules & Logic Assist — authoring copilot (sequenced LAST, after UC9 + UC10; plan carefully). NOT UC2 Impact." },
  { name: "Analytical & Reporting Assist", icon: "📊", color: C.green,
    bullets: ["Variance analysis & explanation","Trend identification & anomaly insights","Drill-down to underlying data/contracts","AI-assisted report narratives & disclosures"],
    maps: "UC1a/b · UC3 Trend · UC4 Concentration · UC5 WALK" },
  { name: "Analyst Digital Twin (Lexie)", icon: "🤖", color: C.red,
    bullets: ["Natural language interaction","Context-aware insights across the platform","Learns analyst workflow and preferences","Analyst digital twin for investigation & execution"],
    maps: "UC9 Full Lexie Digital Twin (built last)" },
];
const GOVERNED_BY_DESIGN = ["Explainable outputs","Full auditable & lineage ready","Policy-driven AI usage","User-controlled execution","SLM-first, LLM optional"];

// ─── REGULATORY MAPPING ─────────────────────────────────────────────────────
// Framed as: regulation principle → the Lextr Intelligence design feature that supports it.
// NOTE: design features that SUPPORT a client's obligations — not assertions of compliance.
const REG_PILLS = ["SR 11-7","BCBS 239","CCAR / DFAST","Reg YY","MNPI / Info-barrier","NIST AI RMF","MAS TRM"];
const REGMAP = [
  { reg: "SR 11-7 — Model Risk Management (Fed / OCC)", color: C.red, items: [
    ["Model validation", "Independent validation with documented results", "Evidence ledger stores every run + step + confidence; held-out evaluation set on preset change"],
    ["Ongoing monitoring", "Track model performance over time", "agent_run history; preset re-evaluation; confidence scoring per output"],
    ["Change management", "Document all model changes", "prompt_template + preset versioned (never overwritten); governance envelope changes require MRM sign-off"],
    ["Model inventory", "Maintain a complete model inventory", "model_registry: every model, adapter, embedding, per tenant, with approval record"],
    ["Effective challenge", "Human review and challenge of outputs", "Human review always-on, structural; accept / correct / reject + rationale recorded"],
  ]},
  { reg: "BCBS 239 — Risk Data Aggregation & Reporting", color: C.amber, items: [
    ["P3 Accuracy", "Reconcile risk data against source", "WALK reconciliation (UC5); cross-report integrity via Knowledge Graph edges"],
    ["P6 Adaptability", "Produce ad-hoc risk data on demand", "Lexie ad-hoc queries; trend & concentration; grouped aggregation"],
    ["P7 Accuracy & integrity", "Data reflects the stated as-at date", "period + restatement_version as first-class dimensions; adapter reads point-in-time"],
    ["P11 Timeliness & lineage", "Audit who changed what, when", "evidence ledger append-only; masking + classification recorded per step"],
  ]},
  { reg: "CCAR / DFAST — Stress Testing & Reporting (FR Y-14)", color: C.purple, items: [
    ["Reproducible results", "Same inputs → same result", "Deterministic skill runtime (temp 0.0); model + preset version recorded per run"],
    ["Restatements", "Support corrections with audit", "Versioned outputs; agent_run history preserves prior + corrected"],
    ["Point-in-time", "'As reported' vs 'as corrected'", "period + restatement_version; adapter queries either view"],
    ["Cross-report consistency", "Y-9C ↔ Y-14Q reconciliation", "Across-report WALK (UC5b); walk_component edges in Knowledge Graph"],
  ]},
  { reg: "MNPI / Information Barriers + NIST AI RMF", color: C.teal, items: [
    ["Information barrier", "MNPI must not leak through the model", "Masking layer: AI never sees raw RESTRICTED/CONFIDENTIAL values; OPA enforces MNPI→local-SLM"],
    ["Data residency", "Sensitive data stays in scope", "On-prem deployment SLM-only; tenant isolation by client_id"],
    ["AI governance (NIST AI RMF)", "Govern, map, measure, manage AI risk", "Governed-by-design: bounded agents, evidence ledger, human review, preset governance"],
    ["Explainability", "AI decisions must be explainable", "Step-level evidence trace; placeholder-token handover; cited rules for validation"],
  ]},
];




// ─── V1 SCHEMA DDL (Foundation chat, SME-reviewed draft) ────────────────────
const SCHEMA_DDL = `-- =====================================================================
-- Lextr Intelligence  |  intelligence schema  |  Flyway migration (DRAFT)
-- V1__intelligence_schema_init.sql
-- ---------------------------------------------------------------------
-- Deliverable #1 of the Foundation chat. Integration-ready DRAFT, not
-- production-ready: not yet run against the live stack/test suite.
-- Owned downstream by the development team for review/test/security/merge.
--
-- TARGET: PostgreSQL 14+ (GENERATED ALWAYS AS IDENTITY; HNSW needs pgvector 0.5+)
-- STACK ALIGNMENT: PostgreSQL + SQL scripts + Flyway (Tech Stack Overview).
--   DDL lives in Flyway migrations; runtime DAO SQL stays in
--   queries.properties via SQLQueryLoaderUtil (Engineering Reference Pack).
--
-- RESOLVED DECISIONS (agreed with SME):
--  D0  PRIMARY KEY TYPE = BIGINT GENERATED ALWAYS AS IDENTITY.
--      Matches the ERP GeneratedKeyHolder DAO template exactly. The Python
--      ingestion pipeline must therefore use DB-returned generated keys (insert
--      -> returning id) rather than minting uuid4 client-side; pipeline upserts
--      key on the natural unique constraints already defined per table
--      (e.g. document_chunk has no natural key, so ingestion inserts and reads
--      back the id — see note on document_chunk).
--  D1  TENANT ISOLATION = in-code at the Intelligence Core layer + the
--      DEPLOYMENT BOUNDARY. NO Postgres RLS. Authorization stays in OPA
--      (Blueprint Table 6; user preference: policy externalized in OPA).
--      Day-1 deployment model: Lextr Intelligence (the AI piece) is
--      SINGLE-TENANT PER DEPLOYMENT on customer infra — one AI instance serves
--      one tenant, so the deployment itself is the isolation boundary (stronger
--      than RLS; there is no second tenant in the same DB to protect against).
--  D2  MULTI-TENANT PROVISION IS BUILT IN, NOT DEFERRED. client_id stays
--      mandatory + indexed on every table, every Core query stays tenant-scoped
--      in code, and the adapter always passes client_id to the host. Reason: the
--      underlying DATA platform (Lextr Core / host) MAY be multi-tenant in a
--      single instance even while the AI piece is single-tenant per deploy, so
--      client_id is the live join key that lets one AI deployment address the
--      correct tenant slice of a multi-tenant host TODAY — not just future-proofing.
--      NOT built day 1: Postgres RLS, and the SaaS shared inference pool. A
--      hosted multi-tenant AI tier becomes an explicit later milestone; the
--      column + code scoping make that path additive, not a rewrite.
--  D3  Evidence ledger (agent_run / agent_run_step) lives in \`intelligence\`
--      (Fork A, agreed). SPEC §5 / Blueprint Table 12 references to a
--      \`provenance\` home are treated as superseded for this build.
--  D4  Embedding dimension (Fork B, agreed): physical default column is
--      vector(384); every row carries model_id + embedding_dim. A tenant on a
--      non-384 model gets a sibling table (embedding_store_<dim>) created by a
--      later migration — embedding_store is CHECK-pinned to 384 so a wider
--      model can never silently truncate here.
--  D5  Dimensions in the GPT4_Mode PDF (1536 / 768) are POC-mode and are NOT
--      used. Production = all-MiniLM-L6-v2 @ 384 (SPEC §8.4 / user constraint).
--
-- ADDED BEYOND THE NAMED LIST (transparent; reject if unwanted):
--  + governance_envelope — SPEC §1.2 makes the envelope a SEPARATE object from
--    the preset with its own versioning/MRM approval. \`preset\` references it;
--    without it the preset table is structurally incomplete.
--
-- DELIBERATELY DE-SCOPED for this deliverable (offered next turn):
--  - review_action (two-level review log, SPEC §5.2/5.3) + agent_run_source
--    (M:N senior-mgmt synthesis -> underlying analyst runs). Senior-management
--    synthesis is a senior-mgmt-mode feature (UC6 / Mode 2), which is M5+; no
--    M3-M4 use-case produces it. So parent_run_id (1:1 drill-down) is
--    SUFFICIENT for M3-M4; agent_run_source (M:N) is added when UC6 lands.
--    Review outcome is captured inline on agent_run; reviewer is recorded at
--    the RUN level (review is of the assembled output, not per step, §5.2).
--  - preset_style / guided_question / prompt_library_entry as normalized
--    child tables. Held as jsonb on \`preset\` for v1 (static per §1.3); promote
--    to tables when they need independent querying/versioning.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. Schema rename (ai -> intelligence) and extensions
-- ---------------------------------------------------------------------
-- \`ai\` is confirmed greenfield/empty (Blueprint Table 22). Rename if present,
-- else create. Near-zero risk because there are no tables to migrate.
--
-- SCHEMA OWNERSHIP (D1/6.1): all DML on \`intelligence\` is performed by
-- \`intelligence-service\` under a dedicated schema-owner functional ID (FID)
-- holding DML rights on this schema; \`lexie-ai\` holds NO grant on the DB and
-- reaches persistence only via intelligence-service's HTTP API. This single
-- writer is what the BIGINT identity keys (D0) assume. GRANT/role statements
-- are environment-specific and owned by the dev/infra team — not issued here.
-- (If the team standardizes a specific FID name/role, swap it in at deploy.)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'ai')
     AND NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'intelligence')
  THEN
    EXECUTE 'ALTER SCHEMA ai RENAME TO intelligence';
  ELSE
    EXECUTE 'CREATE SCHEMA IF NOT EXISTS intelligence';
  END IF;
END
$$;

CREATE EXTENSION IF NOT EXISTS vector;     -- pgvector: embedding_store
CREATE EXTENSION IF NOT EXISTS pg_trgm;    -- trigram lookup for cross_reference _by_name_words

SET search_path TO intelligence, public;

-- ---------------------------------------------------------------------
-- 1. Enumerated types (regulated product -> typed taxonomies)
-- ---------------------------------------------------------------------
CREATE TYPE intelligence.source_type AS ENUM
    ('instruction', 'edit_check', 'data_dictionary', 'form');                 -- PDF SourceType

CREATE TYPE intelligence.doc_type AS ENUM
    ('instruction', 'edit_check', 'data_dictionary', 'form', 'walk_procedure'); -- + WALK_PROCEDURE; extend via migration

CREATE TYPE intelligence.ingestion_status AS ENUM
    ('pending', 'ingesting', 'completed', 'failed');                          -- PDF FormVersion

CREATE TYPE intelligence.data_classification AS ENUM
    ('PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED', 'MNPI', 'SENSITIVE', 'AI_PROHIBITED'); -- masking §4.1 + KH MNPI
-- Enforcement model (the schema RECORDS the tier; it does NOT enforce it):
--   PUBLIC / INTERNAL ............ pass through unmasked.
--   CONFIDENTIAL / RESTRICTED .... masked by the masking layer (semantic form) before any skill sees them.
--   MNPI ......................... masked AND OPA forces local SLM (is_local=true) at all routing tiers; never external.
--   SENSITIVE .................... masked by the masking layer (e.g. specific provenance fields).
--   AI_PROHIBITED ................ HARD DENY: the adapter / Scoped Tool Registry never returns it and OPA blocks it.
--                                  It is never masked because it never reaches a skill. Recorded here so the ledger
--                                  and document_chunk.classification can mark content that must never be embedded,
--                                  retrieved, or routed to a model.

CREATE TYPE intelligence.model_type AS ENUM
    ('SLM', 'LLM', 'EMBEDDING', 'RERANKER');

CREATE TYPE intelligence.model_tier AS ENUM
    ('platform', 'tenant');                                                   -- routing tiers 1/2; tier 3 = preset override

CREATE TYPE intelligence.output_type AS ENUM
    ('narrative', 'dataset', 'chart', 'reconciliation', 'validation', 'impact_list', 'ranked_list'); -- §4 + use-case map

CREATE TYPE intelligence.skill_type AS ENUM
    ('SKILL_1', 'SKILL_2', 'SKILL_3');

CREATE TYPE intelligence.masking_type AS ENUM
    ('none', 'relative_change', 'entity_token', 'threshold_boolean', 'rank_ordinal', 'client_token'); -- masking §4.2

CREATE TYPE intelligence.run_status AS ENUM
    ('created', 'running', 'completed', 'in_review', 'accepted', 'corrected', 'rejected', 'failed');

CREATE TYPE intelligence.review_level AS ENUM
    ('analyst', 'senior_management');                                         -- SPEC §5.2

CREATE TYPE intelligence.review_decision AS ENUM
    ('accept', 'correct', 'reject');                                          -- SPEC §5.2

CREATE TYPE intelligence.preset_status AS ENUM
    ('draft', 'observed', 'operational', 'retired');                          -- distribution model §1.5

CREATE TYPE intelligence.envelope_status AS ENUM
    ('draft', 'pending_approval', 'approved', 'rejected', 'retired');         -- MRM states

CREATE TYPE intelligence.lifecycle_status AS ENUM
    ('draft', 'active', 'retired');                                           -- generic for templates/mappings/models

-- =====================================================================
-- 2. MODEL & GOVERNANCE LAYER
-- =====================================================================

-- ---------------------------------------------------------------------
-- model_registry — tenant-scoped, embedding-dim-aware (Blueprint Table 8)
-- Drives BaseLLMConnector resolution + the three-tier routing.
-- ---------------------------------------------------------------------
CREATE TABLE intelligence.model_registry (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    client_id       text NOT NULL,                  -- '__platform__' sentinel for Tier-1 default rows
    tier            intelligence.model_tier NOT NULL DEFAULT 'tenant',
    model_type      intelligence.model_type NOT NULL,
    model_id        text NOT NULL,                  -- e.g. 'Qwen3-4B', 'sentence-transformers/all-MiniLM-L6-v2'
    connector_class text NOT NULL,                  -- e.g. 'QLoRAChatConnector', 'OpenAIConnector'
    adapter_path    text,                           -- QLoRA adapter path (SLM rows)
    embedding_model text,                           -- for SLM rows that pair an embedder; or self for EMBEDDING rows
    embedding_dim   integer,                        -- EMBEDDING/SLM rows; 384 today (Fork B)
    is_local        boolean NOT NULL,               -- false => OPA blocks call for MNPI/RESTRICTED/on-prem (SPEC §8)
    is_default      boolean NOT NULL DEFAULT false,
    params          jsonb NOT NULL DEFAULT '{}'::jsonb,  -- quantization=4bit NF4, lora_rank=16, alpha=32, temperature, max_tokens, enable_thinking=false ...
    secrets_ref     text,                           -- Vault/KMS key reference ONLY — never a credential (Table 8)
    status          intelligence.lifecycle_status NOT NULL DEFAULT 'active',
    created_by      text,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT model_registry_embedding_dim_chk
        CHECK (embedding_dim IS NULL OR embedding_dim > 0),
    CONSTRAINT model_registry_uq UNIQUE (client_id, model_type, model_id)
);
-- At most one default per (tenant, model_type)
CREATE UNIQUE INDEX model_registry_one_default_uq
    ON intelligence.model_registry (client_id, model_type)
    WHERE is_default;
CREATE INDEX model_registry_client_idx ON intelligence.model_registry (client_id, model_type);

-- ---------------------------------------------------------------------
-- prompt_template — versioned model-instruction templates (Blueprint §4.3)
-- ---------------------------------------------------------------------
CREATE TABLE intelligence.prompt_template (
    id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    client_id     text NOT NULL,                    -- '__platform__' for Lextr-published base templates
    template_key  text NOT NULL,
    version       integer NOT NULL DEFAULT 1,
    task          text,                             -- task axis: variance_explanation, dq_check, ...
    report_type   text,                             -- report-type axis: Y-9C, Y-14Q-H, ...
    body          text NOT NULL,                    -- system prompt template (placeholder-templated)
    variables     jsonb NOT NULL DEFAULT '[]'::jsonb,
    status        intelligence.lifecycle_status NOT NULL DEFAULT 'draft',
    created_by    text,
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT prompt_template_uq UNIQUE (client_id, template_key, version)
);
CREATE INDEX prompt_template_task_idx ON intelligence.prompt_template (client_id, task, report_type);

-- ---------------------------------------------------------------------
-- governance_envelope — MRM-approved envelope a preset lives inside (SPEC §1.2)
-- OPA policies are NOT stored here. Only the binding REFERENCE (package/id) is
-- stored; the Rego lives in OPA (user preference: policy externalized in OPA).
-- ---------------------------------------------------------------------
CREATE TABLE intelligence.governance_envelope (
    id                   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    client_id            text NOT NULL,
    envelope_key         text NOT NULL,
    version              integer NOT NULL DEFAULT 1,
    status               intelligence.envelope_status NOT NULL DEFAULT 'draft',
    allowed_model_ids    bigint[] NOT NULL DEFAULT '{}',   -- references model_registry.id (array -> no FK by design)
    prohibited_model_ids bigint[] NOT NULL DEFAULT '{}',
    mnpi_rules           jsonb NOT NULL DEFAULT '{}'::jsonb,  -- data-access rules (which classifications/schemas)
    data_access          jsonb NOT NULL DEFAULT '{}'::jsonb,  -- allowed schemas / governance tiers (ALLOWED/RESTRICTED/EXCLUDED)
    cost_guardrails      jsonb NOT NULL DEFAULT '{}'::jsonb,  -- e.g. OPA-COST-018 limits: max_tokens, max_cost_per_run
    opa_policy_bindings  jsonb NOT NULL DEFAULT '[]'::jsonb,  -- e.g. [{"id":"OPA-AI-001","package":"lextr.ai.model_routing"}]
    mrm_approved_by      text,
    mrm_approved_at      timestamptz,
    created_by           text,
    created_at           timestamptz NOT NULL DEFAULT now(),
    updated_at           timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT governance_envelope_uq UNIQUE (client_id, envelope_key, version)
);
CREATE INDEX governance_envelope_status_idx ON intelligence.governance_envelope (client_id, status);

-- ---------------------------------------------------------------------
-- preset — packaged expert knowledge for a task x report-type (SPEC §1.3)
-- Lives inside a governance_envelope; carries the 5 preset elements.
-- ---------------------------------------------------------------------
CREATE TABLE intelligence.preset (
    id                   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    client_id            text NOT NULL,
    preset_key           text NOT NULL,
    version              integer NOT NULL DEFAULT 1,
    task                 text NOT NULL,             -- task axis
    report_type          text,                      -- report-type axis (null = report-agnostic)
    envelope_id          bigint NOT NULL REFERENCES intelligence.governance_envelope (id),
    -- Element 1 — model instruction (via template ref OR inline)
    prompt_template_id   bigint REFERENCES intelligence.prompt_template (id),
    model_instruction    text,
    -- Element 2..5
    complementary_context jsonb NOT NULL DEFAULT '{}'::jsonb,  -- Knowledge Hub asset refs (Element 2)
    style                jsonb NOT NULL DEFAULT '{}'::jsonb,    -- preset-level style override (Element 3 cascade)
    guided_questions     jsonb NOT NULL DEFAULT '[]'::jsonb,    -- Element 4
    prompt_library       jsonb NOT NULL DEFAULT '[]'::jsonb,    -- Element 5 (starter prompts)
    -- runtime contract
    model_id_override    bigint REFERENCES intelligence.model_registry (id),  -- Tier-3 preset model override
    skill_pattern        text,                      -- e.g. '1+3', '1+2', '1+2+3'
    is_agentic           boolean NOT NULL DEFAULT false,
    max_steps            smallint NOT NULL DEFAULT 6,   -- Skill 3 cap (SPEC §2.3)
    kg_depth_default     smallint NOT NULL DEFAULT 3,   -- Skill 2 depth (SPEC §2.2)
    kg_depth_max         smallint NOT NULL DEFAULT 5,
    output_type          intelligence.output_type,
    review_level         intelligence.review_level NOT NULL DEFAULT 'analyst',
    status               intelligence.preset_status NOT NULL DEFAULT 'draft',
    is_global            boolean NOT NULL DEFAULT false,  -- Lextr-published base preset
    forked_from          bigint REFERENCES intelligence.preset (id),  -- client fork of a global preset
    created_by           text,
    created_at           timestamptz NOT NULL DEFAULT now(),
    updated_at           timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT preset_uq UNIQUE (client_id, preset_key, version),
    CONSTRAINT preset_max_steps_chk CHECK (max_steps BETWEEN 1 AND 8),       -- SPEC: cannot exceed 8
    CONSTRAINT preset_kg_depth_chk  CHECK (kg_depth_default >= 1 AND kg_depth_max BETWEEN kg_depth_default AND 5)
);
CREATE INDEX preset_axis_idx     ON intelligence.preset (client_id, task, report_type);
CREATE INDEX preset_envelope_idx ON intelligence.preset (envelope_id);
CREATE INDEX preset_status_idx   ON intelligence.preset (client_id, status);

-- =====================================================================
-- 3. KNOWLEDGE / GROUNDING LAYER  (PDF data models as starting design)
-- =====================================================================

-- ---------------------------------------------------------------------
-- regulatory_document — parser output, one per section/table (PDF §1)
-- ---------------------------------------------------------------------
CREATE TABLE intelligence.regulatory_document (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    client_id       text NOT NULL,
    form_code       text NOT NULL,                  -- FRY9C, FFIEC031, ...
    source_type     intelligence.source_type NOT NULL,
    effective_date  date NOT NULL,
    schedule        text,
    section         text,
    line_item       text,
    mdrm_code       text,
    content         text NOT NULL,                  -- raw parsed text (pre-chunking)
    raw_source_path text,
    page_number     integer,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX reg_doc_form_idx ON intelligence.regulatory_document (client_id, form_code, effective_date);
CREATE INDEX reg_doc_mdrm_idx ON intelligence.regulatory_document (client_id, mdrm_code);

-- ---------------------------------------------------------------------
-- document_chunk — parent/child chunks (PDF §2). doc_type incl. walk_procedure.
-- document_id is nullable: WALK_PROCEDURE / Knowledge-Hub client docs are not
-- parsed regulatory_document rows.
-- BIGINT identity note (D0): ids are DB-generated, so the ingestion pipeline
-- must insert PARENT chunks first, read back their ids (insert ... returning id),
-- then insert child chunks with parent_chunk_id set — it cannot pre-mint the
-- self-reference client-side as it did with uuid4. Within a batch, order by
-- parent-before-child.
-- ---------------------------------------------------------------------
CREATE TABLE intelligence.document_chunk (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    client_id       text NOT NULL,
    document_id     bigint REFERENCES intelligence.regulatory_document (id),
    parent_chunk_id bigint REFERENCES intelligence.document_chunk (id),  -- NULL => this IS a parent
    doc_type        intelligence.doc_type NOT NULL,
    form_code       text,
    effective_date  date,
    schedule        text,
    section         text,
    line_item       text,
    mdrm_code       text,
    content         text NOT NULL,
    token_count     integer,
    chunk_index     integer,
    classification  intelligence.data_classification NOT NULL DEFAULT 'INTERNAL',  -- KH classification
    metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,  -- flat metadata contract (PDF §2)
    is_parent       boolean GENERATED ALWAYS AS (parent_chunk_id IS NULL) STORED,
    created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX doc_chunk_doc_idx    ON intelligence.document_chunk (document_id);
CREATE INDEX doc_chunk_parent_idx ON intelligence.document_chunk (parent_chunk_id);
CREATE INDEX doc_chunk_form_idx   ON intelligence.document_chunk (client_id, form_code, doc_type);
CREATE INDEX doc_chunk_mdrm_idx   ON intelligence.document_chunk (client_id, mdrm_code);

-- ---------------------------------------------------------------------
-- embedding_store — child-chunk vectors. Default physical dim = 384 (Fork B).
-- Divergent-dim tenants get a sibling table embedding_store_<dim> (later
-- migration). The CHECK guarantees no wider vector lands here by mistake.
-- ---------------------------------------------------------------------
CREATE TABLE intelligence.embedding_store (
    id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    client_id     text NOT NULL,
    chunk_id      bigint NOT NULL REFERENCES intelligence.document_chunk (id) ON DELETE CASCADE,
    model_id      bigint NOT NULL REFERENCES intelligence.model_registry (id),  -- which embedder produced this (Fork B)
    embedding_dim integer NOT NULL DEFAULT 384,
    embedding     vector(384) NOT NULL,
    created_at    timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT embedding_store_dim_chk CHECK (embedding_dim = 384),
    CONSTRAINT embedding_store_chunk_model_uq UNIQUE (chunk_id, model_id)
);
-- Cosine ANN (PDF distance metric). For high tenant counts, consider partial
-- per-tenant indexes or partitioning — flagged, not done here.
CREATE INDEX embedding_store_hnsw_idx
    ON intelligence.embedding_store USING hnsw (embedding vector_cosine_ops);
CREATE INDEX embedding_store_client_idx ON intelligence.embedding_store (client_id);

-- ---------------------------------------------------------------------
-- cross_reference — persisted MDRM lookup (PDF §7 MdrmEntry).
-- POC kept this in RAM; persisted here (any runtime cache is derived from it).
-- form_code included so the same item_code resolves correctly ACROSS reports.
-- ---------------------------------------------------------------------
CREATE TABLE intelligence.cross_reference (
    id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    client_id     text NOT NULL,
    form_code     text NOT NULL,
    mdrm_code     text NOT NULL,                    -- canonical, uppercase
    mnemonic      text,
    item_code     text,                             -- short code e.g. '4340'
    item_name     text,
    schedule      text,
    line_item     text,
    description   text,
    source_type   intelligence.source_type,
    authoritative boolean NOT NULL DEFAULT false,   -- merge semantics (PDF §7)
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT cross_reference_uq UNIQUE (client_id, form_code, mdrm_code)
);
CREATE INDEX cross_ref_mdrm_idx     ON intelligence.cross_reference (client_id, mdrm_code);     -- _by_mdrm
CREATE INDEX cross_ref_line_idx     ON intelligence.cross_reference (client_id, line_item);     -- _by_line_item
CREATE INDEX cross_ref_schedule_idx ON intelligence.cross_reference (client_id, schedule);      -- _by_schedule
CREATE INDEX cross_ref_name_trgm_idx                                                            -- _by_name_words
    ON intelligence.cross_reference USING gin (item_name gin_trgm_ops);

-- ---------------------------------------------------------------------
-- form_version — ingestion lifecycle per (form, effective_date, artifact) (PDF §8)
-- ---------------------------------------------------------------------
CREATE TABLE intelligence.form_version (
    id               bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    client_id        text NOT NULL,
    form_code        text NOT NULL,
    effective_date   date NOT NULL,
    artifact_type    intelligence.source_type NOT NULL,
    ingestion_status intelligence.ingestion_status NOT NULL DEFAULT 'pending',
    chunk_count      integer NOT NULL DEFAULT 0,
    ingested_at      timestamptz,
    created_at       timestamptz NOT NULL DEFAULT now(),
    updated_at       timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT form_version_uq UNIQUE (client_id, form_code, effective_date, artifact_type)
);
CREATE INDEX form_version_status_idx ON intelligence.form_version (client_id, ingestion_status);

-- ---------------------------------------------------------------------
-- walk_mapping — across-report WALK reconciliation (UC5b).
-- The STRUCTURAL cross-report aggregation edges (walk_component) live in the
-- Knowledge Graph (Neo4j). This table is the Postgres-side CURATED mapping:
-- target line = ordered components, sourced from edit checks / rules / business
-- procedure, plus links to WALK_PROCEDURE chunks (the interpretive methodology).
-- Components reference MDRM codes logically (cross-store), not via FK.
-- ---------------------------------------------------------------------
CREATE TABLE intelligence.walk_mapping (
    id                  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    client_id           text NOT NULL,
    walk_key            text NOT NULL,              -- e.g. 'Y9C_TOTAL_LOANS'
    version             integer NOT NULL DEFAULT 1,
    target_form_code    text NOT NULL,              -- FRY9C
    target_mdrm_code    text NOT NULL,              -- the number being reconciled
    target_schedule     text,
    components          jsonb NOT NULL,             -- [{form_code, mdrm_code, schedule, operator:add|subtract, basis:edit_check|rule|procedure, ref_id}]
    source_basis        text,                       -- edit_check | rule | business_procedure | mixed
    procedure_chunk_ids bigint[] NOT NULL DEFAULT '{}',  -- document_chunk ids (doc_type='walk_procedure')
    status              intelligence.lifecycle_status NOT NULL DEFAULT 'draft',
    created_by          text,
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT walk_mapping_uq UNIQUE (client_id, walk_key, version)
);
CREATE INDEX walk_mapping_target_idx ON intelligence.walk_mapping (client_id, target_form_code, target_mdrm_code);

-- =====================================================================
-- 4. EVIDENCE LEDGER  (Fork A: lives in intelligence)
-- =====================================================================

-- ---------------------------------------------------------------------
-- agent_run — one row per Intelligence call (the run header + review outcome)
-- Holds the structured output + placeholder map (handover protocol §4.4).
-- part1_context stores the MASKED/structured context only — never raw
-- RESTRICTED values.
-- ---------------------------------------------------------------------
CREATE TABLE intelligence.agent_run (
    id                  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    run_id              text NOT NULL,              -- human-readable, e.g. 'run_20250527_001'
    client_id           text NOT NULL,
    preset_id           bigint REFERENCES intelligence.preset (id),
    preset_version      integer,                    -- snapshot at run time
    model_id            bigint REFERENCES intelligence.model_registry (id),  -- model actually used
    use_case            text,                       -- UC1a, UC2, ...
    intent              text,                       -- variance_explanation, impact_analysis, ...
    skill_pattern       text,
    part1_context       jsonb,                      -- structured API/process context (masked)
    part3_user_input    text,                       -- analyst enrichment (Part 3, optional)
    output              jsonb,                      -- {analysis, placeholders{}, confidence_score, evidence_trace_id}
    output_type         intelligence.output_type,
    confidence_score    numeric(4,3),
    status              intelligence.run_status NOT NULL DEFAULT 'created',
    observed_mode       boolean NOT NULL DEFAULT true,  -- observed mode is the default (§1.5)
    evidence_trace_id   text,
    -- review outcome (run-level; reviewer recorded here — review is of the output)
    review_level        intelligence.review_level,
    reviewer_id         text,
    reviewer_role       text,
    review_decision     intelligence.review_decision,
    review_rationale    text,
    correction          jsonb,                      -- corrected output, if decision = correct
    confidence_at_review numeric(4,3),
    reviewed_at         timestamptz,
    parent_run_id       bigint REFERENCES intelligence.agent_run (id),  -- senior-mgmt synthesis -> analyst run (1:1 drill-down)
    user_id             text,                       -- requesting user
    started_at          timestamptz,
    completed_at        timestamptz,
    duration_ms         integer,
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT agent_run_run_id_uq UNIQUE (client_id, run_id),
    CONSTRAINT agent_run_conf_chk CHECK (confidence_score IS NULL OR confidence_score BETWEEN 0 AND 1),
    CONSTRAINT agent_run_conf_rev_chk CHECK (confidence_at_review IS NULL OR confidence_at_review BETWEEN 0 AND 1)
);
CREATE INDEX agent_run_status_idx ON intelligence.agent_run (client_id, status);
CREATE INDEX agent_run_preset_idx ON intelligence.agent_run (preset_id);
CREATE INDEX agent_run_parent_idx ON intelligence.agent_run (parent_run_id);

-- ---------------------------------------------------------------------
-- agent_run_step — the per-step evidence ledger (SPEC §5).
-- Records masking applied, data classification, model used, output type.
-- Reviewer is rolled up at the run level (agent_run) per SPEC §5.2.
-- ---------------------------------------------------------------------
CREATE TABLE intelligence.agent_run_step (
    id                 bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    trace_id           text NOT NULL,               -- e.g. 'evt_20250527_HC-C_BHCK2150_001'
    run_id             bigint NOT NULL REFERENCES intelligence.agent_run (id) ON DELETE CASCADE,
    client_id          text NOT NULL,
    step_number        smallint NOT NULL,
    step_name          text NOT NULL,
    skill              intelligence.skill_type,
    tool_called        text,
    input              jsonb,
    output_summary     text,
    output_node_count  integer,
    masking_applied    boolean NOT NULL DEFAULT false,
    masking_types      intelligence.masking_type[] NOT NULL DEFAULT '{}',  -- which masks (richer than §5 boolean)
    data_classification intelligence.data_classification,
    model_id           bigint REFERENCES intelligence.model_registry (id),    -- model used at this step (if any)
    output_type        intelligence.output_type,
    preset_id          bigint,                         -- snapshot
    user_id            text,
    "timestamp"        timestamptz NOT NULL DEFAULT now(),
    duration_ms        integer,
    created_at         timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT agent_run_step_uq UNIQUE (run_id, step_number)
);
CREATE INDEX agent_run_step_run_idx   ON intelligence.agent_run_step (run_id);
CREATE INDEX agent_run_step_trace_idx ON intelligence.agent_run_step (trace_id);

-- ---------------------------------------------------------------------
-- Selected table comments for the dev team
-- ---------------------------------------------------------------------
COMMENT ON TABLE intelligence.agent_run      IS 'Evidence ledger header: one row per Intelligence call. Output stores placeholder tokens only; raw RESTRICTED values are resolved at render by the reporting layer under entitlement.';
COMMENT ON TABLE intelligence.agent_run_step IS 'Per-step evidence ledger (MRM explainability artifact). The full trace is written before any output surfaces to a human reviewer.';
COMMENT ON TABLE intelligence.walk_mapping   IS 'Postgres-side curated across-report WALK reconciliation. Structural walk_component edges are owned by the Neo4j Knowledge Graph; components here reference MDRM codes logically (cross-store).';
COMMENT ON TABLE intelligence.embedding_store IS 'Default physical dim = vector(384). Tenants on a non-384 model use a sibling table embedding_store_<dim>; embedding_dim/model_id pin provenance per row.';
COMMENT ON COLUMN intelligence.model_registry.is_local IS 'False blocks external model calls for MNPI/RESTRICTED data and on-prem deployments (OPA-enforced). True (local SLM) always permitted.';
COMMENT ON COLUMN intelligence.governance_envelope.opa_policy_bindings IS 'Reference to OPA policy packages/ids only. Rego policy is externalized in OPA, never stored in the DB.';
COMMENT ON COLUMN intelligence.document_chunk.classification IS 'Masking/governance tier. CONFIDENTIAL/RESTRICTED/MNPI/SENSITIVE are masked by the masking layer before any skill use; MNPI additionally forces local SLM via OPA. AI_PROHIBITED chunks must never be embedded, retrieved, or routed to a model — adapter/OPA hard-deny.';

-- =====================================================================
-- END V1__intelligence_schema_init.sql
-- =====================================================================
`;

export default function App() {
  const [section, setSection] = useState("pillars");
  const [process, setProcess] = useState(null);
  const [activeTable, setActiveTable] = useState("preset");
  const [showDDL, setShowDDL] = useState(false);
  const T = TABLES[activeTable];

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: MONO, display: "flex", flexDirection: "column" }}>
      {/* HEADER + PROCESS BAR */}
      <div style={{ padding: "18px 28px 0", borderBottom: `1px solid ${C.border}`, background: `linear-gradient(180deg, ${C.surface} 0%, ${C.bg} 100%)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg, ${C.teal}, ${C.blue})`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "#FFFFFF", boxShadow: `0 0 24px ${C.teal}30` }}>L</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-.01em" }}>Lextr Intelligence — Architecture &amp; Build Catalog</div>
            <div style={{ fontSize: 10.5, color: C.textD, marginTop: 2 }}>Vertical AI · Adapter-isolated · SLM-first · Bounded agents · Governed by design · Multi-tenant</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 7 }}>
            <Pill color={C.green}>Foundation 5/5</Pill><Pill color={C.green}>Decided 94</Pill><Pill color={C.amber}>Required 10</Pill><Pill color={C.red}>Pending 12</Pill>
          </div>
        </div>
        <div style={{ display: "flex", gap: 0 }}>
          {PROCESS_TABS.map(([id, label]) => (
            <button key={id} onClick={() => setProcess(process === id ? null : id)} style={{
              padding: "9px 18px", fontSize: 11.5, fontWeight: 700, background: "transparent", border: "none",
              cursor: "pointer", fontFamily: "inherit", color: process === id ? C.amber : C.textM,
              borderBottom: `2px solid ${process === id ? C.amber : "transparent"}`, transition: "all .15s" }}>{label}</button>
          ))}
          {process && (
            <button onClick={() => setProcess(null)} style={{ marginLeft: "auto", padding: "9px 14px", fontSize: 10.5,
              fontWeight: 700, background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", color: C.teal }}>✕ back to content</button>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flex: 1 }}>
        {/* LEFT SIDEBAR */}
        <div style={{ width: 248, flexShrink: 0, borderRight: `1px solid ${C.border}`, padding: "20px 0", background: C.surface }}>
          {NAV_GROUPS.map(g => (
            <div key={g.group} style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: C.textD, letterSpacing: ".12em", padding: "0 22px 8px" }}>{g.group}</div>
              {g.items.map(([id, label, st]) => {
                const active = section === id && !process;
                return (
                  <button key={id} onClick={() => { setSection(id); setProcess(null); }} style={{
                    width: "100%", textAlign: "left", padding: "7px 22px", fontSize: 12, fontWeight: active ? 700 : 500,
                    background: active ? `${C.teal}12` : "transparent", border: "none", cursor: "pointer", fontFamily: "inherit",
                    color: active ? C.teal : C.textM, borderLeft: `2px solid ${active ? C.teal : "transparent"}`,
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, transition: "all .12s" }}>
                    <span>{label}</span><StatusChip s={st} />
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* MAIN PANEL */}
        <div style={{ flex: 1, padding: 26, overflow: "auto" }}>

          {process === "sequence" && (
            <div>
              <SectionTitle color={C.amber}>Chat Sequence — the build roadmap</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {CHATS.map(c => {
                  const col = c.status === "done" ? C.green : c.status === "active" ? C.amber : c.status === "next" ? C.teal : C.textD;
                  const badge = c.status === "done" ? "✓ done" : c.status === "active" ? "◐ in progress" : c.status === "next" ? "▶ next" : "○ todo";
                  return (
                    <div key={c.n} style={{ display: "grid", gridTemplateColumns: "40px 200px 90px 1fr", gap: 14, alignItems: "center",
                      padding: "11px 14px", background: C.card, border: `1px solid ${col}30`, borderRadius: 8, borderLeft: `3px solid ${col}` }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: col }}>{c.n}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{c.name}</span>
                      <Pill color={col}>{badge}</Pill>
                      <span style={{ fontSize: 10, color: C.textM, lineHeight: 1.5 }}>{c.produces}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {process === "required" && (
            <div><SectionTitle color={C.amber}>Decisions Required — needs an owner&rsquo;s call</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {REQUIRED.map(([t, o], i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 14px", background: `${C.amber}0C`, border: `1px solid ${C.amber}25`, borderRadius: 8 }}>
                    <span style={{ fontSize: 12, color: C.amber }}>⚠</span>
                    <div style={{ flex: 1 }}><div style={{ fontSize: 11.5, color: C.text, lineHeight: 1.5 }}>{t}</div><div style={{ fontSize: 9.5, color: C.textD, marginTop: 3 }}>{o}</div></div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {process === "made" && (
            <div><SectionTitle color={C.green}>Decisions Made — the design audit trail</SectionTitle>
              <div style={{ fontSize: 10.5, color: C.textM, marginBottom: 12 }}>{MADE.length} decisions, grouped by phase. The phase order traces the build: Discovery → Foundation (the 5 locked contracts) → Design (use-case + governance) → Planning → Core Build (delivered components).</div>
              {["Discovery","Foundation","Design","Planning","Core Build"].map(phase => {
                const rows = MADE.filter(([, when]) => when === phase);
                if (!rows.length) return null;
                const col = phase === "Foundation" ? C.teal : phase === "Core Build" ? C.amber : phase === "Design" ? C.purple : phase === "Planning" ? C.blue : C.slate;
                return (
                  <div key={phase} style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: col, letterSpacing: ".04em", textTransform: "uppercase" }}>{phase}</span>
                      <span style={{ fontSize: 9.5, color: C.textD }}>{rows.length}</span>
                      <div style={{ flex: 1, height: 1, background: C.border }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {rows.map(([t], i) => (
                        <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 13px", background: `${col}0A`, border: `1px solid ${col}25`, borderRadius: 8 }}>
                          <span style={{ fontSize: 11, color: col }}>✓</span>
                          <span style={{ flex: 1, fontSize: 11, color: C.text, lineHeight: 1.5 }}>{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {process === "pending" && (
            <div><SectionTitle color={C.red}>Pending / Blocked — waiting on input or dependency</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {PENDINGB.map(([t, b], i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 14px", background: `${C.red}0C`, border: `1px solid ${C.red}25`, borderRadius: 8 }}>
                    <span style={{ fontSize: 12, color: C.red }}>◐</span>
                    <div style={{ flex: 1 }}><div style={{ fontSize: 11.5, color: C.text, lineHeight: 1.5 }}>{t}</div><div style={{ fontSize: 9.5, color: C.amber, marginTop: 3 }}>{b}</div></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!process && section === "pillars" && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>AI-powered regulatory intelligence layer</div>
                <div style={{ fontSize: 11, color: C.textM, marginTop: 3 }}>Delivering explainable, governed reporting and up to 80%+ efficiency gains. Six capability pillars on a governed-by-design foundation.</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
                {PILLARS.map(p => (
                  <div key={p.name} style={{ background: C.card, border: `1px solid ${p.color}30`, borderRadius: 12, borderTop: `3px solid ${p.color}`, padding: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: 18 }}>{p.icon}</span>
                      <span style={{ fontSize: 12.5, fontWeight: 800, color: p.color }}>{p.name}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 10 }}>
                      {p.bullets.map(b => (
                        <div key={b} style={{ fontSize: 10, color: C.textM, lineHeight: 1.4, display: "flex", gap: 6 }}>
                          <span style={{ color: p.color }}>•</span><span>{b}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: 8.5, color: C.textD, fontStyle: "italic", borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>{p.maps}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16, background: `${C.teal}0A`, border: `1px solid ${C.teal}30`, borderRadius: 12, padding: "14px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: C.teal }}>Governed by Design</span>
                  {GOVERNED_BY_DESIGN.map(g => <Pill key={g} color={C.teal}>{g}</Pill>)}
                </div>
              </div>
            </div>
          )}

          {!process && section === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Layer title="ENTRY POINTS" tag="4 trigger sources, 1 Core" color={C.blue}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
                  <Card icon="💬" label="Lexie Panel" color={C.teal}>General-purpose conversational. Context: Auto or off. Quick in/out. NLU resolves intent + entities. <strong style={{ color: C.green }}>/ask live (D8)</strong> — real classified intent into the governed run path.</Card>
                  <Card icon="🖱️" label="In-Module Trigger" color={C.blue}>Explain / Drill-down / Validate buttons in report screens. Part-1 context from the screen.</Card>
                  <Card icon="⚡" label="Event-Driven" color={C.purple}>Fired by a platform event (close, edit-check fail). No human trigger — review still gates output.</Card>
                  <Card icon="🔎" label="Lexie Analytical Assist" color={C.amber}>Dedicated surface in Analytical Reporting (UC10). Plain-English intent → ranked report matches → run / refine / build. Separate entry, same Core. <em>Design.</em></Card>
                </div>
              </Layer>
              <div style={{ display: "flex", justifyContent: "center" }}><div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}><Arrow color={C.teal} /><span style={{ fontSize: 9, color: C.textD }}>assemble 3-part call · select preset · enter Core</span></div></div>
              <Layer title="THREE-PART CALL ASSEMBLY" tag="every AI call" color={C.amber}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                  <Card icon="①" label="API / Process Context" color={C.blue}>Always present. <code style={{ color: C.amber }}>&#123;report, mdrm, period, current, prior, variance&#125;</code></Card>
                  <Card icon="②" label="Preset (Expert Layer)" color={C.purple}>Model instruction + complementary context + style. Closes SLM↔LLM gap to 93%.</Card>
                  <Card icon="③" label="User Input (optional)" color={C.teal}>Unified box: free text and/or library pick. Guided questions. The &ldquo;Add context&rdquo; door.</Card>
                </div>
              </Layer>
              <div style={{ display: "flex", justifyContent: "center" }}><div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}><Arrow color={C.teal} /><span style={{ fontSize: 9, color: C.textD }}>masking · governance resolves model · skills run · human review · render</span></div></div>
              <Layer title="GROUNDING & DATA — via adapter only" tag="masked at boundary" color={C.purple}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                  <Card icon="🕸️" label="Knowledge Graph" color={C.purple}>FRY9C: 1,885 nodes, 4,056 edges (within-report). Cross-report + walk_component edges to be built. Skill 2 traverses.</Card>
                  <Card icon="📚" label="Knowledge Hub" color={C.blue}>Client docs classified + vectorized. doc_type incl. WALK_PROCEDURE.</Card>
                  <Card icon="🗂️" label="Semantic Service (Core)" color={C.teal}>Attribute catalog + pairing. Business-concept→MDRM. Grouping dims.</Card>
                </div>
              </Layer>
            </div>
          )}

          {!process && section === "core" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <SectionTitle>Intelligence Core — polyglot, four services <StatusChip s="confirmed" /></SectionTitle>
                <div style={{ fontSize: 11, color: C.textM, lineHeight: 1.6, marginBottom: 4 }}>
                  Deliverable #2. The Core can&rsquo;t be one process: the ERP conventions (Controller→Service→DAO, NamedParameterJdbcTemplate, no JPA) are Java-only, but the confirmed Core asset <code style={{ color: C.teal }}>lexie-ai</code> (187 tests, working Qwen3-4B) is Python. So the Core splits — a Java control plane that owns the schema, and the extended Python AI runtime, with OPA and the SLM service alongside.
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ background: C.card, border: `1px solid ${C.blue}40`, borderRadius: 12, borderTop: `3px solid ${C.blue}`, padding: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 16 }}>☕</span>
                    <span style={{ fontSize: 12.5, fontWeight: 800, color: C.blue }}>intelligence-service</span>
                    <Tag label="NEW · Java / Spring Boot" color={C.blue} />
                  </div>
                  <div style={{ fontSize: 10, color: C.textM, lineHeight: 1.6, marginBottom: 8 }}>The control plane. Owns <strong>all</strong> intelligence-schema persistence and follows the ERP exactly. Does no AI itself. Sole writer of the schema, under a dedicated schema-owner functional ID (FID).</div>
                  <div style={{ fontSize: 9.5, color: C.blueL, fontFamily: MONO, lineHeight: 1.7 }}>
                    Contextual Trigger API · Preset Registry + 7-step wizard · Governance binding · model_registry CRUD · agent_run lifecycle · Evidence Ledger persistence · Checkpoint / review queue
                  </div>
                </div>
                <div style={{ background: C.card, border: `1px solid ${C.teal}40`, borderRadius: 12, borderTop: `3px solid ${C.teal}`, padding: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 16 }}>🐍</span>
                    <span style={{ fontSize: 12.5, fontWeight: 800, color: C.teal }}>lexie-ai</span>
                    <Tag label="EXTENDED · Python / FastAPI" color={C.teal} />
                  </div>
                  <div style={{ fontSize: 10, color: C.textM, lineHeight: 1.6, marginBottom: 8 }}>The AI runtime. Calls the host adapter for all data, returns runs + traces to intelligence-service. Reaches persistence only via that service&rsquo;s HTTP API.</div>
                  <div style={{ fontSize: 9.5, color: C.teal, fontFamily: MONO, lineHeight: 1.7 }}>
                    NLU (rules + embeddings) · 3 bounded skills · Scoped Tool Registry · Model Abstraction · Retrieval · Masking-consumption boundary · Confidence scoring · 3-part assembly · evidence-step capture
                  </div>
                </div>
                <div style={{ background: C.card, border: `1px solid ${C.purple}40`, borderRadius: 12, borderTop: `3px solid ${C.purple}`, padding: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 16 }}>🔐</span>
                    <span style={{ fontSize: 12.5, fontWeight: 800, color: C.purple }}>policy-agent / policy-service</span>
                    <Tag label="EXTENDED · OPA / Rego" color={C.purple} />
                  </div>
                  <div style={{ fontSize: 10, color: C.textM, lineHeight: 1.6, marginBottom: 8 }}>The Governance Wrapper&rsquo;s enforcement engine, consulted by both services. Policy stays externalized in OPA.</div>
                  <div style={{ fontSize: 9.5, color: C.purpleL, fontFamily: MONO, lineHeight: 1.7 }}>
                    Model routing (MNPI→local) · cost guardrails · data-tier gates · pre-external-call gate · only binding refs stored in DB
                  </div>
                </div>
                <div style={{ background: C.card, border: `1px solid ${C.amber}40`, borderRadius: 12, borderTop: `3px solid ${C.amber}`, padding: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 16 }}>⚡</span>
                    <span style={{ fontSize: 12.5, fontWeight: 800, color: C.amber }}>SLM inference service</span>
                    <Tag label="EXISTS → packaged" color={C.amber} />
                  </div>
                  <div style={{ fontSize: 10, color: C.textM, lineHeight: 1.6, marginBottom: 8 }}>Serves Qwen3-4B + QLoRA out-of-process, so SaaS Option A → B is a config change, not a rebuild.</div>
                  <div style={{ fontSize: 9.5, color: C.amber, fontFamily: MONO, lineHeight: 1.7 }}>
                    Qwen3-4B + QLoRA · embeddings (MiniLM-L6-v2) · reranker · independent, swappable per deployment
                  </div>
                </div>
              </div>

              <Layer title="RUN FLOW" tag="where governance, masking, ledger sit" color={C.green}>
                <div style={{ fontSize: 10, color: C.textM, lineHeight: 1.9 }}>
                  {[["1","Entry","React → intelligence-service /trigger (Part 1 in hand) or /ask (natural language)"],
                    ["1b","Resolve (Lexie only)","intelligence-service → lexie-ai /resolve → intent, entities, report_type; ambiguous → one-tap clarification chips"],
                    ["2","Preset selection (DB)","intelligence-service picks preset by task × report_type, loads governance_envelope, resolves model via 3-tier routing"],
                    ["3","Governance gate (OPA)","is the model permitted for this classification + deployment? If not, degrade to Tier-1 local SLM — never fail. Cost guardrails checked"],
                    ["4","Run","intelligence-service → lexie-ai /run with preset snapshot, Part 1 identity, Part 3 input, resolved model, depth limits, run_id"],
                    ["5","Bounded execution","skills call only allow-listed tools via the adapter; values arrive already masked; Skill 3 calls model abstraction, which re-checks OPA before any external call"],
                    ["6","Output","lexie-ai returns output (placeholder tokens), placeholders map, confidence_score, evidence_trace[]"],
                    ["7","Persist + gate","intelligence-service writes agent_run + all steps in ONE transaction (trace complete before review), enqueues to review — structural, always"],
                    ["8","Render","on accept/correct, host reporting layer resolves placeholders under entitlement; corrections feed the Local Knowledge Store → fine-tuning"]].map(([n,t,d])=>(
                    <div key={n} style={{ display: "flex", gap: 10, padding: "3px 0", alignItems: "baseline" }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: C.green, minWidth: 18 }}>{n}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: C.text, minWidth: 130 }}>{t}</span>
                      <span style={{ fontSize: 9.5, color: C.textM, flex: 1 }}>{d}</span>
                    </div>
                  ))}
                </div>
              </Layer>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Card icon="🛡️" label="Masking — host-side (confirmed 6.2)" color={C.red}>Performed in the Lextr Core adapter impl, so in SaaS raw RESTRICTED/MNPI never enters the Core process. lexie-ai asserts a MaskingBoundary as defense-in-depth, not the masking site. On-prem may mask in-process (data stays local).</Card>
                <Card icon="📒" label="Evidence durability" color={C.green}>Steps buffered in-run (max 8), flushed in one transactional write at completion — no per-step HTTP in the hot path, full trace durable before output can surface. Live progress via STOMP /topic/intelligence/run/&#123;runId&#125;.</Card>
              </div>

              <div style={{ background: `${C.green}0C`, border: `1px solid ${C.green}25`, borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.green, marginBottom: 5 }}>All Deliverable #2 decisions resolved</div>
                <div style={{ fontSize: 10, color: C.textM, lineHeight: 1.7 }}>
                  <strong style={{ color: C.green }}>6.1 Option-A seam — confirmed.</strong> intelligence-service is the sole owner/writer of the schema, all DML under a dedicated schema-owner functional ID (FID); lexie-ai holds no DB grant, reaches persistence only via HTTP. &nbsp;·&nbsp; <strong style={{ color: C.green }}>6.2 Masking — host-side.</strong> &nbsp;·&nbsp; <strong style={{ color: C.green }}>6.3 NLU — rules + embeddings to start</strong> (not SLM extraction); the /resolve contract is implementation-agnostic so an SLM extractor can swap in later. &nbsp;·&nbsp; <strong style={{ color: C.green }}>Tenancy — single-tenant per deployment</strong> is the day-1 isolation boundary; client_id everywhere keeps multi-tenant additive. Deliverable #3 (the adapter interface) is unblocked.
                </div>
              </div>
            </div>
          )}

          {!process && section === "entry" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <SectionTitle color={C.purple}>Entry Points &amp; Lexie Interaction</SectionTitle>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
                <Card icon="💬" label="Lexie Panel" color={C.teal}>Floating, general-purpose, conversational. Context: Auto.</Card>
                <Card icon="🖱️" label="In-Module Trigger" color={C.blue}>Explain / Drill-down / Validate buttons on report screens.</Card>
                <Card icon="⚡" label="Event-Driven" color={C.purple}>Platform event fires it; review still gates output.</Card>
                <Card icon="🔎" label="Lexie Analytical Assist" color={C.amber}>Dedicated Analytical Reporting surface (UC10). <em>Design.</em></Card>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Card icon="💬" label="Lexie Panel — unified" color={C.teal}>One panel. &ldquo;Context: Auto&rdquo; control (inferred from screen, or off). Run surface: [Run →] + [+ Add context]. Action buttons: Graph · Table · Drill-down · Validate.</Card>
                <Card icon="🔁" label="Run UX — one place, two doors" color={C.blue}>Direct Run (preset + API context only) OR Add context (unified input box + guided questions). Confidence score nudges enrichment, never gates.</Card>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.amber, marginBottom: 8 }}>Output types</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10 }}>
                  <Card icon="📝" label="Narrative" color={C.teal}>Text + placeholder tokens resolved at render under entitlement.</Card>
                  <Card icon="📊" label="Dataset / Chart" color={C.blue}>Mini-chart in Lexie OR routed to Core analytics (preset-defined).</Card>
                  <Card icon="⇄" label="Reconciliation" color={C.amber}>WALK output. Waterfall + variance flag.</Card>
                  <Card icon="🛡️" label="Validation" color={C.green}>Edit-check verification. Cites the rule.</Card>
                  <Card icon="🔎" label="Report match set" color={C.amber}>UC10: ranked report candidates + gap chips. <em>Design.</em></Card>
                </div>
              </div>

              <div style={{ paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: C.text }}>UC10 · Lexie Analytical Assist</span>
                  <StatusChip s="design" /><span style={{ fontSize: 9.5, color: C.textD }}>report discovery &amp; construction — separate entry, same Core</span>
                </div>
                <div style={{ fontSize: 10.5, color: C.textM, lineHeight: 1.6, marginBottom: 12 }}>
                  A dedicated surface in the Analytical Reporting module (its own left-nav item, not the floating panel). The user types plain-English intent (&ldquo;counterparty breakdown by rating, market value and exposure&rdquo;); the engine reasons over the <strong>report inventory</strong> — not the numbers — and returns ranked matches. The distinction that makes it a new use-case: every other analytical UC reasons over data values; this one reasons over the <em>catalog of reports</em>, then hands off to the existing analytical builder to actually run.
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 12 }}>
                  <Card icon="🔎" label="Match" color={C.teal}>Intent → embedding similarity against report metadata → ranked % matches, each with ✓ covered and ⚠ missing dimension/measure chips (the gap analysis).</Card>
                  <Card icon="🔧" label="Three doors" color={C.blue}>Run as-is · Refine (seed the builder from the matched report&rsquo;s definition) · Build from scratch (guided dimensions / measures / filters).</Card>
                  <Card icon="▶" label="Handoff" color={C.purple}>The chosen/constructed report goes to the existing Analytical Reporting builder (column picker, filters, aggregations, sync/async) — where execution + review happen.</Card>
                </div>
                <div style={{ background: `${C.green}0A`, border: `1px solid ${C.green}25`, borderRadius: 10, padding: "12px 16px", marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.green, marginBottom: 5 }}>Inventory knowledge — inference-first, registration optional (decided)</div>
                  <div style={{ fontSize: 10, color: C.textM, lineHeight: 1.7 }}>
                    Baseline knowledge is <strong style={{ color: C.green }}>inferred from structure</strong> — a report&rsquo;s dimensions, measures, enrichments and filters, enriched with the <strong>semantic layer&rsquo;s</strong> attribute-level business meaning (the <code style={{ color: C.teal }}>ai_*</code> grounding fields the adapter already surfaces). Every report is discoverable the moment it exists, no curation step, never stale. <strong style={{ color: C.green }}>Registration is an optional enrichment</strong>: purpose, audience, authoritative-flag and tags <em>boost</em> ranking and let UC10 mark the sanctioned report — but an unregistered report is still found, ranked on structure alone. Registration earns rank + a trust badge; it never gates discovery. Match ranks on a composite signal (structure/semantic always · registration when present · usage signal later).
                  </div>
                  <div style={{ fontSize: 9.5, color: C.amber, lineHeight: 1.6, marginTop: 6, paddingTop: 6, borderTop: `1px solid ${C.border}` }}>
                    ⚠ Swing factor: inference quality depends on how rich the semantic layer&rsquo;s <code style={{ color: C.amber }}>ai_*</code> business-context fields actually are. Rich → inference-first is strong; sparse → it degrades to raw column-name matching. The build chat should check what&rsquo;s populated today; thin metadata may argue for light required registration (one-line purpose + authoritative flag) on the reports that matter most. <strong style={{ color: C.amber }}>Tier filter is separate from registration</strong> — EXCLUDED/RESTRICTED columns are never surfaced regardless of registration; permission lives at the attribute tier, not the registration layer.
                  </div>
                </div>
                <div style={{ background: `${C.amber}0A`, border: `1px solid ${C.amber}25`, borderRadius: 10, padding: "12px 16px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.amber, marginBottom: 5 }}>Scope for the build chat — what changes vs. Deliverables #1–#4</div>
                  <div style={{ fontSize: 10, color: C.textM, lineHeight: 1.7 }}>
                    <strong style={{ color: C.amber }}>Adapter (D3) — the real new work:</strong> new operations <code style={{ color: C.teal }}>search_report_inventory(intent)</code>, <code style={{ color: C.teal }}>get_report_definition(report_id)</code> (for gap analysis + refine), and a build/handoff op to the report builder. The adapter&rsquo;s EXCLUDED-never-returned rule must cover the inventory + dimension surface, not just the data surface. &nbsp;·&nbsp; <strong style={{ color: C.amber }}>Schema (D1):</strong> one enum value <code style={{ color: C.teal }}>output_type = report_match_set</code>; discovery creates a lightweight-governed agent_run. &nbsp;·&nbsp; <strong style={{ color: C.amber }}>Entry points (D2):</strong> a 4th trigger source — additive; the Core engine is unchanged. &nbsp;·&nbsp; <strong style={{ color: C.green }}>Model layer (D4): no change</strong> — same generation + embedding connectors (the % match <em>is</em> embedding similarity). &nbsp;·&nbsp; <strong style={{ color: C.amber }}>Governance:</strong> lightweight — discovery/match is evidenced; the always-on structural review gate applies when a report is actually run against data.
                  </div>
                </div>
              </div>
            </div>
          )}

          {!process && section === "schema" && (
            <div>
              <div style={{ fontSize: 12, color: C.textM, marginBottom: 14 }}>
                <StatusChip s="confirmed" /> &nbsp;Click a table to explore. The <code style={{ color: C.teal }}>intelligence</code> schema V1 migration is reviewed and all decisions are resolved — 12 tables, typed enums, evidence ledger in-schema, <strong style={{ color: C.green }}>BIGINT identity keys</strong> (ERP DAO template). Tenancy: <strong style={{ color: C.green }}>single-tenant per deployment</strong> is the isolation boundary (no RLS day 1), but <code style={{ color: C.teal }}>client_id</code> is mandatory everywhere so one AI deployment can address the correct slice of a multi-tenant host. The full DDL is at the bottom of this view.
              </div>
              <div style={{ display: "flex", gap: 20 }}>
                <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
                  {TABLE_ORDER.map(k => (
                    <div key={k} onClick={() => setActiveTable(k)} style={{
                      background: activeTable === k ? `${TABLES[k].color}18` : C.card,
                      border: `1px solid ${activeTable === k ? TABLES[k].color : C.border}`, borderRadius: 10, overflow: "hidden", cursor: "pointer",
                      boxShadow: activeTable === k ? `0 0 20px ${TABLES[k].color}30` : "none", transition: "all .18s" }}>
                      <div style={{ padding: "8px 12px", borderBottom: `1px solid ${activeTable === k ? TABLES[k].color + "40" : C.border}`,
                        display: "flex", alignItems: "center", gap: 8, background: activeTable === k ? `${TABLES[k].color}25` : `${TABLES[k].color}12` }}>
                        <span style={{ fontSize: 14 }}>{TABLES[k].icon}</span>
                        <span style={{ fontSize: 11, fontWeight: 800, color: TABLES[k].color }}>{TABLES[k].name}</span>
                        {TABLES[k].note && <Tag label={TABLES[k].note} color={TABLES[k].color} />}
                      </div>
                      <div style={{ padding: "8px 12px" }}>
                        {TABLES[k].fields.map((f, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 8, padding: "3px 0", borderBottom: i < TABLES[k].fields.length - 1 ? `1px solid ${C.border}` : "none" }}>
                            {f.pk && <span style={{ fontSize: 8, color: C.amber, fontWeight: 900 }}>PK</span>}
                            {f.fk && <span style={{ fontSize: 8, color: C.purple, fontWeight: 900 }}>FK</span>}
                            {f.idx && <span style={{ fontSize: 8, color: C.blue, fontWeight: 900 }}>IDX</span>}
                            {!f.pk && !f.fk && !f.idx && <span style={{ fontSize: 8, color: "transparent" }}>··</span>}
                            <span style={{ fontSize: 10.5, color: C.text, flex: 1, fontFamily: MONO }}>{f.name}</span>
                            <span style={{ fontSize: 9.5, color: C.textD, fontFamily: MONO }}>{f.type}</span>
                            {f.note && <span style={{ fontSize: 8.5, color: C.textM, fontStyle: "italic" }}>{f.note}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ width: 290, flexShrink: 0 }}>
                  <div style={{ position: "sticky", top: 10, background: C.card, border: `1px solid ${T.color}50`, borderRadius: 12, padding: 16, boxShadow: `0 0 30px ${T.color}20` }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: T.color, marginBottom: 8 }}>{T.icon} {T.name}</div>
                    <div style={{ fontSize: 11, color: C.textM, lineHeight: 1.7 }}>{T.note2}</div>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 18 }}>
                <button onClick={() => setShowDDL(!showDDL)} style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "9px 16px", fontFamily: "inherit",
                  background: showDDL ? `${C.teal}18` : C.card, border: `1px solid ${showDDL ? C.teal : C.border}`,
                  borderRadius: 8, cursor: "pointer", color: showDDL ? C.teal : C.textM, fontSize: 11.5, fontWeight: 700, width: "100%" }}>
                  <span style={{ fontSize: 13 }}>{showDDL ? "▾" : "▸"}</span>
                  <span>V1__intelligence_schema_init.sql</span>
                  <Tag label="V1 · reviewed" color={C.green} />
                  <span style={{ marginLeft: "auto", fontSize: 9.5, color: C.textD, fontWeight: 500 }}>{showDDL ? "hide" : "view full DDL"}</span>
                </button>
                {showDDL && (
                  <div style={{ marginTop: 10, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
                    <div style={{ padding: "8px 14px", borderBottom: `1px solid ${C.border}`, background: C.surface, display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 10, color: C.textM }}>Flyway migration · PostgreSQL 14+ · 12 tables · pgvector + pg_trgm</span>
                      <span style={{ marginLeft: "auto", fontSize: 9, color: C.green }}>all decisions resolved · BIGINT keys · single-tenant/deploy · no RLS day 1</span>
                    </div>
                    <pre style={{ margin: 0, padding: "14px 16px", fontSize: 10, lineHeight: 1.5, color: C.textM,
                      fontFamily: MONO, overflowX: "auto", maxHeight: 560, overflowY: "auto", whiteSpace: "pre" }}>{SCHEMA_DDL}</pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {!process && section === "kg" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <SectionTitle color={C.purple}>Knowledge Graph (Neo4j) <StatusChip s="confirmed" /></SectionTitle>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                <Card icon="📊" label="FRY9C — loaded" color={C.green}>1,885 nodes · 4,056 edges · 6,502 edit checks. Production-capable. Loaded in Neo4j.</Card>
                <Card icon="🔗" label="Edge types" color={C.purple}>Present today: calculation (sum/minus/divided_by), reference, edit-check (within-report). <strong style={{ color: C.amber }}>Not yet present:</strong> cross-report + walk_component (aggregation) edges — to be built from edit-checks / rules / business procedure.</Card>
                <Card icon="⚠️" label="Pending" color={C.amber}>Cross-report + walk_component edges do not yet exist (D3 re-confirmed) — graph_walk_components &amp; cross-report calc-chain return empty until built. Plus item_name enrichment before M4, Y-14Q-H graph existence, Neo4j GPL-3 decision.</Card>
              </div>
              <Card icon="🔬" label="Traversal capabilities (Skill 2)" color={C.blue}>get_downstream_impacts · get_upstream_dependencies · get_calculation_chain · get_walk_components · get_related_edit_checks. Depth-limited (3 default, 5 max). Cross-report traversal wired in the adapter but returns empty until cross-report edges are built.</Card>
            </div>
          )}

          {!process && section === "hub" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <SectionTitle color={C.blue}>Knowledge Hub <StatusChip s="confirmed" /></SectionTitle>
              <div style={{ fontSize: 11, color: C.textM, lineHeight: 1.6 }}>
                Complete (chat 3) — the curated retrieval corpus that grounds runs as complementary context. The real build-out of the Knowledge-Hub surface the Governance Console prototyped. The loop closes: ingest → chunk + embed (via the governed D8 path) → manage + classify → retrieve, entitlement-gated, one vector space.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
                <Card icon="📥" label="Capture & classify (D1/D2)" color={C.teal}>Documents ingested into regulatory_document → document_chunk (parents-first); classification suggest→human-confirm (A4) over the 6-value enum (+ AI_PROHIBITED); management UI on the 2b shell.</Card>
                <Card icon="📑" label="Document types" color={C.blue}>instruction · edit_check · data_dictionary · form · walk_procedure (the 5 frozen doc_type values; header-less client docs/walk-procedures carried via nullable document_id).</Card>
                <Card icon="🔢" label="Embed via the D8 path (D3)" color={C.purple}>Chunks embedded through the injected D8 EmbeddingResolver (embedding_call gate, model_id-tagged store) — no parallel path; AI_PROHIBITED short-circuited BEFORE any embedding call.</Card>
                <Card icon="🎯" label="Retrieve as context (D5)" color={C.green}>get_complementary_context reuses D8 retrieval (one space, model_id filter); classification entitlement gates what returns (OPA, fail-closed); the query embedding is itself governed. D4 (full doc_type ranking) reserved later.</Card>
              </div>
            </div>
          )}

          {!process && section === "skills" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ fontSize: 12, color: C.textM }}><StatusChip s="design" /> &nbsp;Three bounded skills. Composition downward only: <code style={{ color: C.amber }}>Skill 3 → Skills 1, 2</code>. No circular calls. Fixed tool allow-lists = the no-wandering guarantee in code.</div>
              {SKILLS.map(s => (
                <div key={s.n} style={{ background: C.card, border: `1px solid ${s.color}35`, borderRadius: 12, borderLeft: `4px solid ${s.color}`, overflow: "hidden" }}>
                  <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, background: `${s.color}10` }}>
                    <span style={{ fontSize: 22 }}>{s.icon}</span>
                    <div><div style={{ fontSize: 13, fontWeight: 800, color: s.color }}>Skill {s.n} · {s.label}</div><div style={{ fontSize: 10, color: C.textD, marginTop: 2 }}>{s.pattern}</div></div>
                  </div>
                  <div style={{ padding: 16, display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: C.textD, letterSpacing: ".08em", marginBottom: 6 }}>DOES</div>
                      <div style={{ fontSize: 11, color: C.textM, lineHeight: 1.6, marginBottom: 12 }}>{s.does}</div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: C.red, letterSpacing: ".08em", marginBottom: 6 }}>CANNOT</div>
                      <div style={{ fontSize: 11, color: C.textM, lineHeight: 1.6 }}>{s.cannot}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: C.textD, letterSpacing: ".08em", marginBottom: 6 }}>TOOL ALLOW-LIST</div>
                      {s.tools.map(t => <div key={t} style={{ fontSize: 9.5, color: s.color, fontFamily: MONO, padding: "3px 0", borderBottom: `1px solid ${C.border}` }}>→ {t}</div>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!process && section === "model" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <SectionTitle>Model Abstraction — Three-Tier Routing <StatusChip s="confirmed" /></SectionTitle>
              {[["1","Lextr ships","Lextr default SLM (Qwen3-4B, configurable, may grow). All tenants, all deployments. The floor — always available, always local.",C.green],
                ["2","Client (governed)","Tenant-level override — different SLM, client adapter, or licensed LLM. 7-step approval. In model_registry per tenant.",C.amber],
                ["3","Preset author","Preset-level override within tenant's governed bounds. Re-evaluation vs held-out set. OPA enforces MNPI→SLM regardless.",C.purple]].map(([n, who, what, col]) => (
                <div key={n} style={{ display: "flex", gap: 14, alignItems: "center", padding: "12px 16px", background: C.card, border: `1px solid ${col}30`, borderRadius: 10, borderLeft: `3px solid ${col}`, boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: col }}>{n}</span>
                  <div style={{ width: 140 }}><span style={{ fontSize: 12, fontWeight: 700, color: col }}>{who}</span></div>
                  <span style={{ flex: 1, fontSize: 11, color: C.textM, lineHeight: 1.5 }}>{what}</span>
                </div>
              ))}
              <Card icon="📐" label="Confirmed SLM spec" color={C.blue}>Qwen3-4B + QLoRA (4-bit NF4, rank 16, alpha 32) · MiniLM-L6-v2 embeddings 384-dim · ms-marco reranker · enable_thinking=False (enforced in the connector, not caller-passed) · independent out-of-process inference service.</Card>

              <div style={{ marginTop: 4, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: C.text }}>Model-access layer — Deliverable #4</span>
                  <StatusChip s="confirmed" /><span style={{ fontSize: 9.5, color: C.textD }}>two connector hierarchies</span>
                </div>
                <div style={{ fontSize: 10.5, color: C.textM, lineHeight: 1.6, marginBottom: 12 }}>
                  Split into <strong style={{ color: C.teal }}>two independent hierarchies</strong> — generation (<code style={{ color: C.teal }}>BaseLLMConnector</code>, the model_abstraction.call only Skill 3 reaches) and embedding (<code style={{ color: C.teal }}>BaseEmbeddingConnector</code>, used by ingestion + retrieval). A confirmed divergence from SPEC §8.1&rsquo;s single interface: different models, scaled independently, swappable per vendor without cross-impact. The schema already supported it — model_type distinguishes SLM/LLM/EMBEDDING/RERANKER as separate rows. Lives in lexie-ai; reads model_registry via intelligence-service&rsquo;s API (no DB grant, per 6.1).
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                  <Card icon="🔧" label="BaseLLMConnector — generation" color={C.teal}><code style={{ color: C.teal }}>generate()</code> → GenerateResult (text + token counts + finish_reason) · <code style={{ color: C.teal }}>is_local()</code> (the single property the OPA gate keys on) · <code style={{ color: C.teal }}>model_descriptor()</code> for the ledger. Default: <strong style={{ color: C.green }}>QLoRAChatConnector</strong> wrapping qlora_llm.py against the out-of-process inference service; is_local=True; enable_thinking=False enforced in the connector.</Card>
                  <Card icon="🔢" label="BaseEmbeddingConnector — embedding" color={C.blue}><code style={{ color: C.blue }}>embed()</code> · <code style={{ color: C.blue }}>get_embedding_dim()</code> (must equal the tenant&rsquo;s store width) · <code style={{ color: C.blue }}>is_local()</code> · <code style={{ color: C.blue }}>model_descriptor()</code>. Default: <strong style={{ color: C.green }}>MiniLMEmbeddingConnector</strong> (all-MiniLM-L6-v2, 384-dim, local). Resolved + scaled separately — own registry row, own resolver, own gate.</Card>
                </div>

                <Layer title="GENERATION RESOLUTION + OPA GATE" tag="most-specific-wins · never fail" color={C.purple}>
                  <div style={{ fontSize: 10, color: C.textM, lineHeight: 1.8 }}>
                    {[["1","Resolve","preset override (Tier 3) → tenant default (Tier 2) → platform default (Tier 1). Each tier is a row (or absence) in model_registry"],
                      ["2","Envelope check","ConnectorFactory refuses a model the preset&rsquo;s governance_envelope prohibits (ModelProhibitedError) — before the OPA gate"],
                      ["3","OPA gate","query lextr/ai/model_routing: is_local=true → allow; external → allow only if not restricted-data AND not on-prem; MNPI never external"],
                      ["4","Degrade, never fail","if not allowed, fall back to Tier-1 local SLM (SPEC §8.3) — the run never fails for routing"]].map(([n,t,d])=>(
                      <div key={n} style={{ display: "flex", gap: 10, padding: "2px 0", alignItems: "baseline" }}>
                        <span style={{ fontSize: 10, fontWeight: 800, color: C.purple, minWidth: 16 }}>{n}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: C.text, minWidth: 120 }}>{t}</span>
                        <span style={{ fontSize: 9.5, color: C.textM, flex: 1 }}>{d}</span>
                      </div>
                    ))}
                  </div>
                </Layer>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
                  <Card icon="🔢" label="Embedding resolution — independent" color={C.blue}>Own lookup: tenant embedder → platform MiniLM. No preset-level embedder override (the embedder is a tenant/deployment property, not per-task). Dimension safety in the resolver: refuses an embedder whose dim ≠ the tenant&rsquo;s active embedding_store width (EmbeddingDimMismatchError) before query vectors land in the wrong space.</Card>
                  <Card icon="⚠️" label="Mixed embedding spaces" color={C.amber}>A consequence of the split: vectors from different embedders aren&rsquo;t comparable. Two safeguards (both in Deliverable #1): every embedding_store row carries its model_id, so retrieval must <strong>filter by the active embedder&rsquo;s model_id</strong>; and changing a tenant&rsquo;s embedder requires <strong>re-embedding</strong> the corpus (a backfill, not a silent swap). The dev team owns the retrieval-side model_id filter.</Card>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
                  <Card icon="🔐" label="Three OPA enforcement points" color={C.red}>Pre-run in intelligence-service (validates the declared model up front) · pre-external-call in lexie-ai&rsquo;s ModelRouter (defense in depth — a field resolving RESTRICTED mid-run still forces local) · pre-embedding in EmbeddingResolver (blocks embedding RESTRICTED/MNPI text with an external embedder). Rego in policy-service, never in code.</Card>
                  <Card icon="💰" label="Cost guardrails + evidence" color={C.amber}>Reads governance_envelope.cost_guardrails via OPA (max tokens/run, max cost/run). GenerateResult token counts feed post-call accounting — over-budget runs degrade or stop, never silently truncate. Every call records model_id, tier, is_local, tokens, finish_reason to agent_run_step.</Card>
                </div>

                <div style={{ marginTop: 12, background: `${C.green}0A`, border: `1px solid ${C.green}25`, borderRadius: 10, padding: "12px 16px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.green, marginBottom: 5 }}>Resolved (SME approved)</div>
                  <div style={{ fontSize: 10, color: C.textM, lineHeight: 1.6 }}>
                    <strong style={{ color: C.green }}>generate() returns GenerateResult</strong> — the widen is confirmed (token control + richer output for cost guardrails and the ledger; .text preserves the string contract). &nbsp;·&nbsp; <strong style={{ color: C.green }}>Generation + embedding are separate connectors</strong> — confirmed, with the embedding resolver, the third OPA gate, and the retrieval model_id filter all now part of the design. &nbsp;·&nbsp; <strong style={{ color: C.textM }}>Scope:</strong> Tier-2/3 generation + vendor embedding connectors are stubs; only the QLoRA + MiniLM defaults are built out (the shipped pair).
                  </div>
                </div>
              </div>
            </div>
          )}

          {!process && section === "masking" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <SectionTitle color={C.red}>Masking &amp; Handover <StatusChip s="design" /></SectionTitle>
              <Card icon="🛡️" label="Semantic masking — not value suppression" color={C.red}>Only RESTRICTED/CONFIDENTIAL masked; INTERNAL/PUBLIC pass through. $120m → &ldquo;+20% vs prior&rdquo;. Client → [ENTITY_1]. $120m vs $95m → &ldquo;ABOVE_THRESHOLD: YES (126%)&rdquo;. AI reasons on relative/boolean form.</Card>
              <Card icon="🔢" label="Threshold comparisons — pre-computed" color={C.amber}>System computes the boolean before the AI sees it. AI reasons on &ldquo;above_threshold: true, rank 1&rdquo; — never the raw value or threshold.</Card>
              <Card icon="🔄" label="Handover protocol" color={C.purple}>AI output carries placeholder tokens. Core's reporting layer resolves them at render under the user's entitlement. AI never touches actual values end-to-end. Evidence ledger records masking + classification tier.</Card>
            </div>
          )}

          {!process && section === "usecases" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}><SectionTitle color={C.teal}>Use-Case Catalog <StatusChip s="design" /></SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <div style={{ display: "grid", gridTemplateColumns: "62px 1.2fr 60px 96px 54px 128px 1.5fr", gap: 10, padding: "2px 12px" }}>
                  {["UC","Use case","Skills","Output","Milestone","Capability (LHP)","Notes"].map(h => <span key={h} style={{ fontSize: 8.5, fontWeight: 700, color: C.textD, letterSpacing: ".05em", textTransform: "uppercase" }}>{h}</span>)}
                </div>
                {USE_CASES.map(u => (
                  <div key={u.uc} style={{ display: "grid", gridTemplateColumns: "62px 1.2fr 60px 96px 54px 128px 1.5fr", gap: 10, alignItems: "center",
                    padding: "9px 12px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, borderLeft: `3px solid ${u.color}` }}>
                    <Tag label={u.uc} color={u.color} />
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: C.text }}>{u.name}</span>
                    <span style={{ fontSize: 9.5, color: C.textM, fontFamily: MONO }}>{u.skills}</span>
                    <Pill color={u.color}>{u.out}</Pill>
                    <span style={{ fontSize: 9.5, fontWeight: 700, color: (u.milestone.includes("M5") || u.milestone === "last") ? C.textD : u.color }}>{u.milestone}</span>
                    <Pill color={CAP_COLOR[UC_CAPABILITY[u.uc]] || C.slate}>{UC_CAPABILITY[u.uc] || "—"}</Pill>
                    <span style={{ fontSize: 9.5, color: C.textM, lineHeight: 1.5 }}>{u.note}</span>
                  </div>
                ))}
              </div>

              <div style={{ paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: C.text }}>Agentic-vs-Simple Decision Table — Deliverable #5</span>
                  <StatusChip s="confirmed" />
                </div>
                <div style={{ fontSize: 10.5, color: C.textM, lineHeight: 1.6, marginBottom: 12 }}>
                  Per use-case: category, tool allow-list (from the real adapter ops), output type, step ceiling (preset CHECK ≤ 8), and KG readiness against the actual FRY9C graph. The distinction is <strong>bounded orchestration, never autonomy</strong>. Every row obeys the same hard limits: max_steps ≤ 8, structural review always on (UC10 lightweight), every step ledgered, masking at the adapter boundary, allow-list enforced in code.
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 12 }}>
                  {Object.values(DECISION_CATS).map(c => (
                    <div key={c.label} style={{ background: C.card, border: `1px solid ${c.color}30`, borderRadius: 8, borderLeft: `3px solid ${c.color}`, padding: "9px 12px", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: c.color, marginBottom: 4 }}>{c.label}</div>
                      <div style={{ fontSize: 9, color: C.textM, lineHeight: 1.5 }}>{c.note}</div>
                    </div>
                  ))}
                </div>

                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "58px 1.2fr 110px 2.4fr 70px 44px 150px", gap: 8, padding: "8px 12px", background: C.surface, borderBottom: `1px solid ${C.border}` }}>
                    {["UC","Name","Category","Tool allow-list (+ S1 base resolve)","Output","Steps","KG"].map(h => <span key={h} style={{ fontSize: 8.5, fontWeight: 700, color: C.textD, letterSpacing: ".05em", textTransform: "uppercase" }}>{h}</span>)}
                  </div>
                  {DECISION_TABLE.map((r, i) => {
                    const u = USE_CASES.find(x => x.uc === r.uc) || { color: C.slate, name: r.uc };
                    const cat = DECISION_CATS[r.cat]; const kg = KG_TAGS[r.kg];
                    return (
                      <div key={r.uc} style={{ display: "grid", gridTemplateColumns: "58px 1.2fr 110px 2.4fr 70px 44px 150px", gap: 8, padding: "8px 12px", borderBottom: i < DECISION_TABLE.length - 1 ? `1px solid ${C.border}` : "none", alignItems: "center" }}>
                        <Tag label={r.uc} color={u.color} />
                        <span style={{ fontSize: 10, fontWeight: 600, color: C.text }}>{u.name}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, color: cat.color }}>{cat.label}</span>
                        <span style={{ fontSize: 8.5, color: C.textM, fontFamily: MONO, lineHeight: 1.45 }}>{r.allow}</span>
                        <span style={{ fontSize: 8.5, color: C.textM, fontFamily: MONO }}>{r.out}</span>
                        <span style={{ fontSize: 11, fontWeight: 800, color: r.steps === 8 ? C.amber : C.textM, textAlign: "center" }}>{r.steps}</span>
                        <span style={{ fontSize: 8.5, fontWeight: 600, color: kg.color }}>{kg.label}</span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ fontSize: 9, color: C.textD, marginTop: 6, lineHeight: 1.5 }}>
                  S1 base resolve set (implicit every row): resolve_mdrm · resolve_concept · get_current_period · get_client_glossary · graph_get_node. &nbsp; † new adapter ops — additive D3 extension (UC10 inventory ops; UC12 generic operational-read ops, category-gated). &nbsp; ‡ report_match_set, ‡‡ rule_draft — new output_type enum values (D1 delta).
                </div>

                <div style={{ marginTop: 4, background: `${C.green}0A`, border: `1px solid ${C.green}25`, borderRadius: 10, padding: "12px 16px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.green, marginBottom: 5 }}>What the table establishes — and the two honest corrections in it</div>
                  <div style={{ fontSize: 10, color: C.textM, lineHeight: 1.7 }}>
                    <strong style={{ color: C.green }}>Guardrail by construction:</strong> the two Simple rows (UC2, UC7) have no model_abstraction.call on their allow-list — a &ldquo;simple&rdquo; use-case <em>physically cannot</em> reach the model. &nbsp;·&nbsp; <strong style={{ color: C.amber }}>UC2 re-baselined:</strong> &ldquo;buildable now&rdquo; → within-report impact now, cross-report with the edge build (the delivered graph has 0 cross-report edges — same gate as UC5b). &nbsp;·&nbsp; <strong style={{ color: C.amber }}>UC5b</strong> waits on walk_component edges; graph_walk_components returns empty until built. &nbsp;·&nbsp; <strong style={{ color: C.blue }}>UC10</strong> routes through the embedding resolver + embedding gate, not the generation router — the % match is similarity, no generation model. &nbsp;·&nbsp; <strong style={{ color: C.textM }}>Open (flag #3):</strong> UC9&rsquo;s v1 allow-list — union of all patterns, or a narrower live subset at first launch? The one item still to decide.
                  </div>
                </div>
              </div>
            </div>
          )}

          {!process && section === "variance" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}><SectionTitle color={C.teal}>Variance Analysis — flagship UC #1 <StatusChip s="confirmed" /></SectionTitle>
              <div style={{ fontSize: 11, color: C.textM, lineHeight: 1.7 }}>
                One coherent capability built as <strong>staged deliverables (V-1…V-6)</strong> on the one Core — the Preset Management pattern, not a monolith. <strong>Horizontal-first</strong> (explain a number at a pyramid level against the fixed drivers, M3), then <strong>vertical drill-down</strong> when horizontal is weak (M4, KG-gated). Built chat 5 (active). The two presets — <strong>Y-9C variance</strong> (cell-based) and <strong>Y-14Q-H variance</strong> (granular) — are two presets of the same skill, the governed home for the fine-tuned SLM (4,000+ samples).
              </div>

              <Layer title="Investigation model — frozen" tag="bounded agent" color={C.teal}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <Card icon="🪜" label="Pyramid levels (fixed)" color={C.teal}>REPORT → FDL/COE → INSTRUMENT → ATOMIC — four frozen roles (correction rerun). Bottom-two labels are domain-specific, resolved from KG node type (securities position/trade · cards card/debit-credit · loans contract/transaction). Depth is a ceiling of 4. Descending a level is vertical (SkillTwo / V-4); the agent may not invent a level.</Card>
                  <Card icon="🎯" label="Driver set (closed enum)" color={C.teal}>rule/methodology change · business strategy (self/peer) · market event; INSTRUMENT adds the new instrument_lifecycle (maturity/amortization/prepayment/origination/roll-off, confirmed); ATOMIC adds DQ issue (new/recurring) + controller input. drivers_in_scope/assert_within_bounds is the bound — no wander.</Card>
                  <Card icon="🧩" label="Skills (real D5 names)" color={C.blue}>Horizontal = SkillOne (deterministic resolve, no SLM) + SkillThree (only SLM caller). SkillTwo enum-declared only = V-4 vertical.</Card>
                  <Card icon="🔀" label="Driver sourcing" color={C.blue}>Structured facts → adapter ops (tool_scope-gated). Strategy + market-event → Knowledge Hub retrieval via the existing get_complementary_context seam (entitlement-gated).</Card>
                </div>
              </Layer>

              <Layer title="Staged deliverables" tag="V-6 done · correction rerun COMPLETE" color={C.amber}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  <Card icon="✅" label="V-1 contract + seam ✓" color={C.green}>Investigation contract + bounded-agent plan + adapter ops + tool_scope Rego + SLM registration + the two AI presets. Spec/seam layer — no skill executes yet.</Card>
                  <Card icon="✅" label="V-2 horizontal skill + flow ✓" color={C.green}>SkillOne+SkillThree on the D5 runtime via the frozen /run path: tool_scope-gated ops, MaskingBoundary before model.call, cost OK/DEGRADE/STOP (never truncate), local-forced routing, bounds guard, evidence trace → D6 persist + always-on review. Both V-1 corrections applied; 9/9 invariants pass.</Card>
                  <Card icon="✅" label="V-3 horizontal screens ✓" color={C.green}>On the 2b shell: pick report type + level + cell/line → run → result. Reuses MaskedValue, OutputRenderer, LextrChart, EvidenceLedgerViewer, RunProgress from @shell/atoms (not rebuilt). Masking to the tooltip, confidence-as-signal, always-on-review honest, show/enable-never-gate, no policy/hardcoded colors/browser storage in the UI.</Card>
                  <Card icon="✅" label="V-4 vertical skill (DAG) ✓" color={C.green}>SkillTwo as a bounded multi-path DAG walk (BFS): fan out to top-N material children by ordinal contribution_rank (no unmask), one rung via next_level, early-terminate a branch when explained (the short A→C case). Convergent node investigated/costed ONCE, every incoming edge recorded (no double-count). Bounds: depth + breadth-N + global node ceiling + cumulative cost, all recorded stops. KG fail-closed (horizontal stands); reuses the horizontal skill per node; one aggregated DAG trace → one agent_run. 10/10 vertical + 9/9 horizontal regression.</Card>
                  <Card icon="✅" label="V-5 vertical screens ✓" color={C.green}>DrillGraph (Cytoscape+ELK): convergent node rendered once by construction (node id=key) with all incoming edges; per-node result reuses V-3 VarianceResult (showReviewBanner default-preserving), provenance for convergent nodes, drill-level review banner once, bounds/stops as honest banners. Graph colors from the theme palette (no hardcoded); no policy/masking/storage in the UI; tenant not in URL.</Card>
                  <Card icon="✅" label="V-6 report-type finalize ✓" color={C.green}>Y-9C vs Y-14Q-H proven end-to-end: a reference preset_loader reads the real preset JSONs and the same DAG skill diverges purely from the preset — Y-9C stops at FDL/COE (depth2/N2/ceiling6), Y-14Q-H reaches Contract/Transactions with DQ + controller drivers in scope (depth3/N4/ceiling24). Consolidated handoff README across V-1…V-6; stale single-path README_V4 superseded. Full suite 23/23.</Card>
                </div>
              </Layer>

              <Layer title="Correction rerun — masking · 4-level pyramid · trend" tag="correction rerun COMPLETE · V-1…V-6 approved" color={C.green}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <Card icon="🔐" label="#16 masking split ✓ (V-1)" color={C.green}>Display ownership split: the HOST resolves display per requester (Lextr renders verbatim); Lextr&rsquo;s MaskingBoundary governs only the model path. ClassifiedValue is dual-form (display + model_value/model_raw); requester threaded onto every adapter op. Enforcement WIRED in V-2 — MaskingBoundary checks the model form; 19/19 horizontal green.</Card>
                  <Card icon="🪜" label="#17 4-level pyramid ✓ (V-1)" color={C.green}>Four frozen roles REPORT→FDL/COE→INSTRUMENT→ATOMIC; bottom-two labels domain-resolved from KG node type; new frozen driver INSTRUMENT_LIFECYCLE at Instrument (confirmed), DQ/controller at Atomic; bottom op split (get_instrument_detail + Atomic). Depth ceiling 4; traversal ceiling enforced in V-4.</Card>
                  <Card icon="📈" label="Trend evidence ✓ (V-1 surface)" color={C.green}>Bounded horizontal EVIDENCE, not a driver: TrendClassification/TrendContext + the VarianceExplanation.trend seam; get_series op gated on a new series_ready OPA datum (mirrors kg_ready); preset trend_window=6. Classifier DELIVERED in V-2 (deterministic; OI-G masked-series→unavailable).</Card>
                  <Card icon="✅" label="V-6 done — rerun complete" color={C.green}>All six steps approved. Report-type e2e corrected to the 4-level pyramid (CONTRACT_TRANSACTIONS purged); report-type matrix re-proven — Y-9C depth 2 (FDL/COE), Y-14Q-H depth 3 (Instrument, Option B). Consolidated handoff README. Full suite 36/36 green. Open product item: Y-14Q-H does not assess Atomic DQ/controller at depth 3 — depth-4 is the lever. Anchor + recon remain separate later slices.</Card>
                </div>
              </Layer>

              <Layer title="Evidence enhancements — anchor &middot; recon" tag="anchor + recon enhancement slices COMPLETE (merged · trend+anchor+recon all surfaced)" color={C.green}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <Card icon="⚓" label="Anchor — slice COMPLETE (Step 1 + 2)" color={C.green}>Bounded horizontal EVIDENCE: a reg cell vs the entity 10-Q/10-K. AnchorContext{"{concept, anchor_value, concordance, confidence, basis_caveat}"} on explanation.anchor; gated on anchor_ready in OPA (default deny; needs the entity 10-Q loaded), compares model-safe figures ONLY (never unmask), the reg-vs-GAAP caveat is always shown so divergence reads as a FLAG not a correction, signal-only nudge, adds NO driver. Crosswalk split = central concept map + per-filer 10-Q resolution carrying confidence. Suite 24/24 horizontal, 41/41 full. Step 2 (UI) DONE: VarianceResult shows an "Anchor — corroboration, not a driver" block (concordance chip + matched 10-Q/10-K via MaskedValue + lower-assurance confidence + the reg-vs-GAAP caveat always shown). OI-9 followed the file-wide camelCase convention.</Card>
                  <Card icon="📒" label="Recon — slice COMPLETE (Step 1 + 2)" color={C.green}>Bounded horizontal EVIDENCE: FP&amp;A daily/close BREAKS roll up to the cell by REUSING the calc-chain (host op owns the rollup; no bespoke map; no kg_ready needed). Reasons classify into the CLOSED driver set; delta splits explained%/residual% on model-safe amounts only; recon_ready OPA gate; signal-only, adds no driver. Merged with anchor onto V6 — full suite 48/48 green. Step 2 (UI) DONE: VarianceResult shows a recon block (explained%/residual% or "split unavailable" caption; dated breaks with closed-set driver chips + amounts via MaskedValue). Anchor + recon enhancement pair COMPLETE.</Card>
                  <Card icon="🧩" label="Shape" color={C.blue}>Both are siblings of the shipped trend sub-step; each ships in 2 steps (Python: contract + op + rego + preset + skill + tests, then UI). These are the deferred enhancement slices from the correction rerun; anchor and recon run in parallel build chats.</Card>
                </div>
              </Layer>

              <Layer title="Variance integration checklist — dev-side OIs before merge" tag="feature-complete &middot; hand to dev" color={C.amber}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <Card icon="🔗" label="OI-9 / OI-10 — wire + atoms" color={C.amber}>Confirm the intelligence-service serializer casing (camelCase vs snake_case) and align the whole UI type file consistently; reconcile reused 2b atom prop/paths (MaskedValue, EvidenceLedgerViewer, RunProgress) against the real package. The shimmed tsc is the build-chain gate; dev runs tsc against the real 2b package at integration.</Card>
                  <Card icon="🧮" label="Data homes (from Problem-1)" color={C.amber}>Anchor central concept-map (which canonical concept a cell tracks) and recon reason&rarr;driver classification table currently ship as stub/keyword rules with flagged OIs. Real source is the ingested family taxonomy / governance via the Problem-1 pipeline. Do not hardcode.</Card>
                  <Card icon="🔁" label="Host-owned rollups + dual-form" color={C.amber}>Confirm the host op owns the recon&rarr;cell calc-chain rollup (so the horizontal skill needs no kg_ready). Confirm break amounts arrive dual-form (display + classification) so MaskedValue gets the real classification (UI currently defaults internal). Anchor_ready / recon_ready / kg_ready are service-supplied OPA datums, set per deployment/entity.</Card>
                  <Card icon="🧪" label="Real test gates" color={C.amber}>Python suite proven here 48/48 (base+anchor+recon horizontal + vertical + e2e). At integration: run real tsc, Maven (Java PresetSnapshot parity), and OPA test (tool_scope_variance_test.rego: anchor_ready/recon_ready allow+deny). README_MERGE documents what was combined.</Card>
                </div>
              </Layer>

              <Layer title="V-1 detail — reviewed & recorded" tag="integration-ready draft" color={C.green}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <Card icon="📦" label="What it built" color={C.green}>contract.py (frozen levels + driver enum + bounded plan + masking-aware ClassifiedValue), variance_ops.py (4 horizontal host ops as ABC + 3 vertical declared-not-callable + op registry), tool_scope_variance.rego (+tests), the SLM registration migration, and the Y-9C / Y-14Q-H preset JSONs (createPreset → draft).</Card>
                  <Card icon="🛡️" label="Both boundaries held" color={C.green}>lexie-ai is pure types + an ABC — no DB, evidence emitted not persisted. tool_scope lives in Rego; the Python registry is a reconciliation mirror, not an auth source; the adapter fails closed; KG-readiness is a policy datum (data.lextr.ai.variance.kg_ready).</Card>
                  <Card icon="🔒" label="Routing + presets" color={C.blue}>Presets pin the local SLM external_eligible=false; from_classifications stays authoritative → variance never external. cost_guardrails token-ceiling enforced / USD deferred (Y-9C 6000/depth2, Y-14Q-H 12000/depth3). Activation MRM-gated in Preset Management, not here.</Card>
                  <Card icon="🛠️" label="V-1 corrections — applied in V-2 ✓" color={C.green}>(1) Classification now mirrors the full 7-value data_classification (SENSITIVE + MNPI added; masked-required set complete). (2) SLM max_classification raised to 'mnpi'. Residual: canonical enum orders SENSITIVE above MNPI, so confirm a &lsquo;mnpi&rsquo; ceiling does not exclude SENSITIVE (set to highest non-prohibited) and align the contract enum order to canonical (OI-2).</Card>
                </div>
                <div style={{ marginTop: 10, background: `${C.red}0A`, border: `1px solid ${C.red}25`, borderRadius: 10, padding: "11px 15px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.green, marginBottom: 5 }}>Feature complete — remaining items are integration carries</div>
                  <div style={{ fontSize: 10, color: C.textM, lineHeight: 1.7 }}>
                    <strong style={{ color: C.green }}>Resolved across V-2…V-5:</strong> 7-value classification + MNPI/SENSITIVE masking; Rego composition (<code>variance_deny_reason</code> partial); <code>max_classification=sensitive</code>; EvidenceLedgerViewer prop settled to <code>run</code>. <strong style={{ color: C.amber }}>Carries to dev integration (handoff README OI table):</strong> KG wiring + <code>contribution_rank</code> vs real gateway (OI-11, flip <code>kg_ready</code> when ready); D6 persists the multi-node DAG trace as one <code>agent_run</code> incl. convergence provenance + confirm <code>/run</code>+<code>/drill</code> response shapes (OI-8); confirm real <code>EvidenceLedgerViewer</code> shape + swap DrillGraph to a shell Cytoscape atom if one exists (OI-10); <code>opa test</code> composed package; SME supplies real <code>model_id</code>/artifact/version. Full suite 23/23 (9 horizontal · 10 vertical DAG · 4 report-type e2e).
                  </div>
                </div>
              </Layer>
            </div>
          )}

          {!process && section === "charts" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <SectionTitle color={C.blue}>Foundational Chart Set</SectionTitle>
                <div style={{ fontSize: 10, color: C.textD, marginBottom: 10 }}>AI selects chart from query intent; user can override. Output carries a dataset that renders as any of these.</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {CHART_SET.map(([t, q, c]) => (
                    <div key={t} style={{ display: "flex", alignItems: "center", gap: 12, padding: "7px 12px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 7, borderLeft: `3px solid ${c}` }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: c, width: 90 }}>{t}</span>
                      <span style={{ fontSize: 10, color: C.textM }}>{q}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <SectionTitle color={C.purple}>Routing — chart vs. analytical</SectionTitle>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <Card icon="📊" label="Lexie mini-chart" color={C.teal}>Small data (≤~20 points), ad-hoc, conversational, for understanding. Renders within the panel; preserves drill-into-data.</Card>
                  <Card icon="🗄️" label="Core analytics" color={C.blue}>Large data, known saved query, recurring, for distribution/compliance. Governed report lineage.</Card>
                  <div style={{ fontSize: 10, color: C.textD, background: `${C.amber}10`, padding: "10px 12px", borderRadius: 8, lineHeight: 1.6 }}>
                    ✦ Routing is a <strong style={{ color: C.amber }}>preset-defined, deterministic</strong> decision made by Skill 3 before the data fetch — recorded in the evidence ledger. Not AI-guessed per query.
                  </div>
                </div>
              </div>
            </div>
          )}

          {!process && section === "digitaltwin" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <SectionTitle color={C.red}>Digital Twin (Lexie) — context-aware floater</SectionTitle>
              <div style={{ fontSize: 10, color: C.textD, marginBottom: 4 }}>The analyst's digital twin. Surfaces as an always-available floating panel across every surface — not a left-rail tab like the others.</div>
              <Card icon="🤖" label="Always available" color={C.red}>Mounted once in the app shell (Lexie launcher + panel); persists across tabs. Natural-language interaction, context-aware to whatever surface the analyst is on.</Card>
              <Card icon="🧭" label="Orchestrates the patterns" color={C.amber}>Maps to UC9 — picks and runs the right use-case skill at runtime (variance, trend, walk, semantic …). Built LAST, on the proven parts.</Card>
              <Card icon="📒" label="Same governance" color={C.slate}>Every Lexie action runs through the same bounded skill runtime, OPA gates, masking boundary, and always-on review as the rail use-cases. No special path.</Card>
              <div style={{ fontSize: 10, color: C.textD, background: `${C.amber}10`, padding: "10px 12px", borderRadius: 8, lineHeight: 1.6 }}>✦ Status: capability defined; UC9 orchestration design comes after the individual use-cases land.</div>
            </div>
          )}

          {!process && section === "rulesassist" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <SectionTitle color={C.amber}>Rules & Logic Assist (UC11) — authoring copilot</SectionTitle>
              <div style={{ fontSize: 10, color: C.textD, marginBottom: 4 }}>A copilot for the human RULE AUTHOR. NOT validation (UC7) and NOT impact-reading (UC2). Lextr Core owns the authoring platform/engine and the fixed published edit-check rules; Intelligence only aligns those to Lextr grammar for fast execution, never altering regulator logic.</div>
              <Card icon="📝" label="Drafts rule syntax" color={C.amber}>Proposes a rule scoped to COE + MDRM/Taxonomy with a mandatory rationale — what it recommends and why.</Card>
              <Card icon="📚" label="Three sources" color={C.blue}>Semantic Layer (object · attribute · definition · enumerations · filter-lookups), registered regulatory docs (instruction · template), and business strategy. Reasons over metadata + documents, not data values.</Card>
              <Card icon="🔁" label="Commonality vs existing rules" color={C.teal}>Checks the EXISTING rules inventory so the author can reuse or fork-and-edit instead of duplicating.</Card>
              <Card icon="🕸️" label="Impact assessment" color={C.purple}>If a rule changes, which other rules are affected (rule-dependency / edit-check edges).</Card>
              <Card icon="⚖️" label="Human in the loop" color={C.slate}>Propose-only — the human authors and commits in Core. Sequenced LAST, after UC9 + UC10 (both inform it).</Card>
              <div style={{ fontSize: 10, color: C.textD, background: `${C.amber}10`, padding: "10px 12px", borderRadius: 8, lineHeight: 1.6 }}>✦ PLAN CAREFULLY. Open: grammar/handoff fork (Intelligence emits Lextr grammar vs hands a structured intent to Core to render); new rule_draft output type; seam deps get_semantic_catalog + get_rules + build/handoff.</div>
            </div>
          )}

          {!process && section === "analyticalassist" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <SectionTitle color={C.blue}>Analytical Report Assist (UC10)</SectionTitle>
              <div style={{ fontSize: 10, color: C.textD, marginBottom: 4 }}>Report discovery and construction by intent. Reasons over the report CATALOG, not the numbers.</div>
              <Card icon="🔎" label="Intent to report matches" color={C.blue}>Plain-English intent searches the report inventory → ranked % matches with gap chips (embedding similarity, no new model work).</Card>
              <Card icon="🛠️" label="Run / refine / build" color={C.teal}>Run as-is, refine, or build from scratch → hands off to the existing analytical builder, which owns execution and review.</Card>
              <Card icon="🚪" label="Separate entry point" color={C.purple}>A dedicated Analytical Reporting surface (not the floating Lexie panel) routing into the same Core. Lightweight-governed: discovery evidenced, review gates at execution.</Card>
              <div style={{ fontSize: 10, color: C.textD, background: `${C.amber}10`, padding: "10px 12px", borderRadius: 8, lineHeight: 1.6 }}>✦ Own build chat (stage 7). Additive adapter ops (search_report_inventory, get_report_definition, build/handoff) + a new report_match_set output type.</div>
            </div>
          )}

          {!process && section === "narrative" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <SectionTitle color={C.teal}>Narrative Generator</SectionTitle>
              <div style={{ fontSize: 10, color: C.textD, marginBottom: 4 }}>A capability PILLAR, not a standalone use-case. Generates narratives at two levels: edit-check / variance explanations and report-level disclosure narratives.</div>
              <Card icon="📝" label="Realized through existing outputs" color={C.teal}>Built on the narrative output that use-cases already produce (UC1a/UC1b variance, UC7 validation), plus a report-level narrative synthesis step.</Card>
              <Card icon="📄" label="Two levels" color={C.blue}>Edit-check / variance narrative (why a number or check moved) and report-level narrative (the disclosure / MD&A-style write-up across a report).</Card>
              <Card icon="🔒" label="Same handover" color={C.slate}>Narratives carry placeholder tokens resolved at render under entitlement; masking and review hold exactly as for variance.</Card>
              <div style={{ fontSize: 10, color: C.textD, background: `${C.amber}10`, padding: "10px 12px", borderRadius: 8, lineHeight: 1.6 }}>✦ Status: capability defined; use-case decomposition (and whether the report-level step is its own UC) to be designed.</div>
            </div>
          )}

          {!process && section === "anomaly" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <SectionTitle color={C.purple}>Anomaly Detection — input-data DQ</SectionTitle>
              <div style={{ fontSize: 10, color: C.textD, marginBottom: 4 }}>Running data-quality checks on the INPUT data. Distinct from Variance and from regulatory edit-checks — this is upstream DQ on the data itself.</div>
              <Card icon="🔬" label="DQ on input data" color={C.purple}>Advanced validation on incoming data: completeness, consistency, range/outlier, referential and lineage-aware checks — beyond the published rules.</Card>
              <Card icon="🔀" label="NOT variance" color={C.amber}>Variance EXPLAINS a number you asked about; Anomaly Detection SCANS the input data for quality issues. Different intent, different trigger.</Card>
              <Card icon="🧱" label="Upstream of UC7" color={C.blue}>Sits before the regulatory edit-check validation (UC7): catches data problems at the source, independent of the regulator's rule logic. Maps to the Data & Control Intelligence pillar.</Card>
              <div style={{ fontSize: 10, color: C.textD, background: `${C.amber}10`, padding: "10px 12px", borderRadius: 8, lineHeight: 1.6 }}>✦ Status: capability defined; use-case decomposition to be designed (continuous monitoring vs on-demand scan).</div>
            </div>
          )}

          {!process && section === "presetmgmt" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <SectionTitle color={C.purple}>Preset Management <StatusChip s="confirmed" /></SectionTitle>
              <div style={{ fontSize: 11, color: C.textM, lineHeight: 1.6 }}>
                The complete preset story — built in <strong style={{ color: C.purple }}>chat 4</strong> on the <strong>D7 wizard backend</strong> and the <strong>2b</strong> shell/atoms. In regulatory reporting the preset <em>is</em> the governed artifact, so management = governance: authoring, lifecycle, MRM approval, and the preset's own audit. The real build-out of the AI-Presets surface the Governance Console prototyped. (Cross-product audit is the separate Audit &amp; Evidence chat.)
              </div>
              <Layer title="THE THREE CORRECTED VALUES — compile-enforced (PM-1)" tag="regression-proof" color={C.green}>
                <div style={{ fontSize: 10.5, color: C.textM, lineHeight: 1.6, marginBottom: 8 }}>
                  The pre-Foundation prototype had three wrong values; D7 corrected them; PM-1 baked the corrections into the TypeScript unions, so a regression to the prototype is a <strong style={{ color: C.green }}>compile error</strong>, not a runtime surprise. The PM-3 forms render only these legal shapes.
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  <Card icon="🏷️" label="6-value classification" color={C.green}>PUBLIC / INTERNAL / CONFIDENTIAL / RESTRICTED / SENSITIVE / MNPI (+ AI_PROHIBITED) — not the prototype's 4. A distinct ALLOWED/RESTRICTED/EXCLUDED tier axis is kept separate (scope vs sensitivity).</Card>
                  <Card icon="💰" label="Per-run cost budget" color={C.green}>max_tokens_per_run + max_cost_per_run_usd on the envelope, OPA-resolved — not fixed dropdown tiers.</Card>
                  <Card icon="👤" label="Review = analyst / senior_mgmt" color={C.green}>&ldquo;Never&rdquo; is not a valid review level; deliberately absent from the union. Structural review always-on.</Card>
                </div>
              </Layer>
              <Layer title="THE BUILD — 6 deliverables on the PM-1 spine" tag="complete (PM-1…PM-6)" color={C.green}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <Card icon="🧩" label="PM-1 wire + shell ✓" color={C.green}>D7 contract mirror, typed client over the 9 endpoints, Zustand store, stepper + step nav. The corrected values compile-enforced. Zero-shell-edit extension contract for PM-2…PM-6.</Card>
                  <Card icon="📝" label="PM-2 steps 1–3 ✓" color={C.green}>Preset-authoring forms: Identity &amp; scope (report-agnostic null handling), Skill plan (the SKILL_1/2/3 composer matching D7 validateStep2, max_steps 1–8), Instruction + complementary context.</Card>
                  <Card icon="🛡️" label="PM-3 steps 4–7 ✓" color={C.green}>Envelope authoring — the contract-sensitive unit, passed. The three corrected values render correctly (7-value classification + AI_PROHIBITED hard-stop, per-run cost budget not dropdowns, no-"Never" review); two-axis Step 5 genuinely separated; read-DTO mirror corrected vs the real D7 records.</Card>
                  <Card icon="✓" label="PM-4 live validation ✓" color={C.green}>Debounced POST /presets/validate/{"{step}"}, issues inline; baseline-first (no nagging a fresh step); advisory not gating — commit POST /presets is the real gate. Commit captures into the lifecycle slice PM-5 reads.</Card>
                  <Card icon="🔄" label="PM-5 lifecycle + MRM gate ✓" color={C.green}>draft→observed→operational; activate blocked+explained unless envelope MRM-approved (state-reflective text, server is final word); fork-global; non-blocking author=approver SoD note (server enforces); entitlement show/enable, deny-only-on-explicit-false.</Card>
                  <Card icon="📜" label="PM-6 preset audit ✓" color={C.green}>Authored-by, MRM record (mrmApprovedBy/At), lifecycle, policy bindings as {"{id, package}"} references only. Reuses the D5 evidence viewer + PM-5 chips; loads via usePresetLifecycle. Transition history rendered honestly — current-state + MRM record only, gap flagged (no fabricated timeline). All read-DTO fields verified vs types.ts.</Card>
                </div>
              </Layer>
              <div style={{ background: `${C.amber}0C`, border: `1px solid ${C.amber}30`, borderRadius: 10, padding: "11px 15px", fontSize: 10.5, color: C.textM, lineHeight: 1.6 }}>
                <strong style={{ color: C.amber }}>Boundaries held:</strong> policy in OPA (bindings captured as {"{id, package}"} references, never evaluated); identity/SoD server-side (UI submits, never gates — hiding ≠ securing); consumes the real D7 contract, doesn't invent a form model. <strong style={{ color: C.amber }}>Open:</strong> prompt-template + Knowledge-Hub-ref pickers need list endpoints not yet in D7's nine (manual entry until then); preset transition-history is a D7 contract gap (render current state, flag the rest).
              </div>
            </div>
          )}

          {!process && section === "govconsole" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <SectionTitle color={C.purple}>Governance Console <StatusChip s="reference" /></SectionTitle>
                <div style={{ fontSize: 11, color: C.textM, lineHeight: 1.6, marginTop: 4 }}>
                  <strong style={{ color: C.purple }}>Reference blueprint, not a build target.</strong> This is the originating governance prototype (the <code style={{ color: C.purple }}>LexIntl 0 Governance</code> chat) that sketched the <em>whole</em> governance vision as one UI — presets, knowledge hub, audit, runtime policies, role mapping, MRM. Each surface is now built independently as its own feature/chat; this view stays as the origin map showing where each piece lives, and as the record of where the three prototype-divergences (classification, cost guardrail, review trigger) were caught and reconciled. The build of each surface is its own nav view, not here.
                </div>
                <div style={{ background: `${C.purple}0A`, border: `1px solid ${C.purple}25`, borderRadius: 10, padding: "11px 15px", marginTop: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.purple, marginBottom: 7 }}>Where each prototyped surface is built</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 10.5, lineHeight: 1.5 }}>
                    <div style={{ color: C.text }}><span style={{ color: C.green, fontWeight: 700 }}>✓ Presets</span> → built: <strong>Preset Management</strong> (chat 4, on the D7 backend)</div>
                    <div style={{ color: C.text }}><span style={{ color: C.green, fontWeight: 700 }}>✓ Knowledge Hub</span> → built: <strong>Knowledge Hub</strong> (chat 3, complete)</div>
                    <div style={{ color: C.text }}><span style={{ color: C.amber, fontWeight: 700 }}>◷ Audit &amp; Evidence</span> → planned: <strong>Audit &amp; Evidence</strong> (chat 7b, cross-product)</div>
                    <div style={{ color: C.textM }}><span style={{ color: C.textD, fontWeight: 700 }}>○ Runtime policies · role mapping · MRM workflow</span> → not yet built (future governance work; prototyped only here)</div>
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 8 }}>Console navigation — 7 governance surfaces</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                  {GOV_NAV.map(g => (
                    <div key={g.group} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: C.textD, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 6 }}>{g.group}</div>
                      {g.items.map(it => <div key={it} style={{ fontSize: 10.5, color: C.text, padding: "2px 0" }}>{it}</div>)}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 8 }}>AI Presets — the governed 7-step wizard</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {PRESET_WIZARD.map(([n, t, d]) => (
                    <div key={n} style={{ display: "flex", gap: 12, alignItems: "baseline", padding: "7px 12px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, borderLeft: `3px solid ${C.purple}` }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: C.purple, minWidth: 16 }}>{n}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: C.text, minWidth: 130 }}>{t}</span>
                      <span style={{ fontSize: 9.5, color: C.textM, flex: 1, lineHeight: 1.5 }}>{d}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 8 }}>Runtime Policies Catalog — named OPA register</div>
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "120px 1.4fr 1.2fr 1.4fr", gap: 8, padding: "8px 14px", background: C.surface, borderBottom: `1px solid ${C.border}` }}>
                    {["Policy ID","Name","Trigger","Action"].map(h => <span key={h} style={{ fontSize: 9, fontWeight: 700, color: C.textD, letterSpacing: ".05em", textTransform: "uppercase" }}>{h}</span>)}
                  </div>
                  {GOV_CHAINS.map((c) => (
                    <div key={c.cap} style={{ display: "grid", gridTemplateColumns: "1.1fr 1.1fr 1.2fr 1.6fr", gap: 8, padding: "8px 14px", borderBottom: `1px solid ${C.border}` }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: c.governs ? C.text : C.textD }}>{c.cap}</span>
                      <span style={{ fontSize: 10, color: C.textD }}>{c.spec}</span>
                      <span style={{ fontSize: 10.5, color: C.textD }}>{c.steps}</span>
                      <span style={{ fontSize: 10.5, color: C.textD }}>{c.floors}</span>
                    </div>
                  ))}
                  {LEDGER_ACTIONS.map((l, li) => (
                    <div key={l.track + li} style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 8, padding: "8px 14px", borderBottom: `1px solid ${C.border}` }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: C.textD }}>{l.track}</span>
                      <span style={{ fontSize: 10.5, color: C.textD }}>{l.actions}</span>
                    </div>
                  ))}
                  {OPA_REGISTER.map(([id, name, trig, act, col], i) => (
                    <div key={id} style={{ display: "grid", gridTemplateColumns: "120px 1.4fr 1.2fr 1.4fr", gap: 8, padding: "8px 14px", borderBottom: i < OPA_REGISTER.length - 1 ? `1px solid ${C.border}` : "none", alignItems: "center" }}>
                      <span style={{ fontSize: 9.5, color: col, fontFamily: MONO, fontWeight: 700 }}>{id}</span>
                      <span style={{ fontSize: 10, color: C.text, fontWeight: 600 }}>{name}</span>
                      <span style={{ fontSize: 9.5, color: C.textM }}>{trig}</span>
                      <span style={{ fontSize: 9.5, color: C.textM }}>{act}</span>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 9, color: C.textD, marginTop: 5 }}>OPA-AI-001 is the same MNPI→local rule confirmed in Deliverable #4&rsquo;s model-routing Rego. Catalog shows 4 representative policies; the prototype scoped 64.</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 8 }}>Role &amp; Capability Mapping — domain ownership</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {GOV_DOMAINS.map(([d, owner, purpose]) => (
                      <div key={d} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px" }}>
                        <div style={{ fontSize: 10.5, fontWeight: 700, color: C.blue }}>{d} <span style={{ color: C.textD, fontWeight: 500 }}>· {owner}</span></div>
                        <div style={{ fontSize: 9.5, color: C.textM, marginTop: 2, lineHeight: 1.4 }}>{purpose}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 8 }}>Oversight surfaces</div>
                  <Card icon="🛡️" label="AI Governance & Risk Controls" color={C.purple}>{GOV_AISUBTABS.join(" · ")}. Jurisdictional pills (e.g. RBI 2024). MRM dashboard: governed models, MRM-certified, open compliance items, MNPI controls, next validation.</Card>
                  <div style={{ height: 8 }} />
                  <Card icon="📒" label="Audit & Evidence" color={C.green}>{GOV_AUDIT.join(" · ")}. Each record: summary · supporting sources (verified/unverified) · policy enforcement results (PASS / TRIGGERED) — e.g. materiality 10% configured vs 18.2% actual → TRIGGERED.</Card>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 8 }}>Knowledge Hub — clause → policy extraction</div>
                <div style={{ fontSize: 10, color: C.textM, lineHeight: 1.6, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px" }}>
                  6-step asset registration (Register → Select Usage → Load Content → AI Extraction → Route Pipeline → Approve &amp; Publish). AI mines document clauses into candidate OPA policies with confidence scores — e.g. <em>&ldquo;External LLM prohibited for MNPI&rdquo;</em> @96% → OPA-AI-001; <em>&ldquo;human review required for high-risk narrative&rdquo;</em> @91% → OPA-REG-014. A clause becomes a governable runtime policy, not just text.
                </div>
              </div>

              <div style={{ background: `${C.green}0A`, border: `1px solid ${C.green}25`, borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.green, marginBottom: 6 }}>✓ Enforced in the D7 wizard backend — the prototype divergences are now server-side rules, not just intentions</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {GOV_RECONCILE.map(([was, now, col], i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 10, fontSize: 9.5, lineHeight: 1.45 }}>
                      <span style={{ color: C.textM }}><span style={{ color: col, fontWeight: 700 }}>{was}</span></span>
                      <span style={{ color: C.text }}>{now}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!process && section === "opa" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <SectionTitle color={C.red}>OPA Policies — externalised <StatusChip s="design" /></SectionTitle>
              <Layer title="POLICY CATEGORIES" tag="Rego · OPA bundle server" color={C.red}>
                <div style={{ fontSize: 10.5, color: C.textM, lineHeight: 1.9 }}>
                  {[["Model routing","if data_classification ∈ {MNPI, RESTRICTED} OR deployment = on-prem → local SLM only"],
                    ["Cost guardrails","per-tenant token/cost ceilings; downgrade to SLM when exceeded"],
                    ["Data access tier","ALLOWED / RESTRICTED / EXCLUDED per schema; adapter never returns EXCLUDED"],
                    ["Human-review trigger","all outputs → review queue; review model per use-case"],
                    ["MRM approval gate","preset governance envelope changes require MRM sign-off"],
                    ["Role & capability","rides on platform Keycloak + OPA identity; Intelligence consumes it"]].map(([l, e]) => (
                    <div key={l} style={{ marginBottom: 8 }}>
                      <div style={{ color: C.red, fontWeight: 700, fontSize: 10.5 }}>{l}</div>
                      <div style={{ color: C.textD, fontSize: 9.5, marginLeft: 8 }}>→ {e}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 8, padding: "8px 10px", background: `${C.red}12`, borderRadius: 7, fontSize: 9.5, color: C.textD, border: `1px solid ${C.red}25` }}>
                  Policies live in the OPA bundle server (already in the platform). New rule = new .rego file. Zero application code change. Per preference: policies always externalised in OPA, never in code.
                </div>
              </Layer>
            </div>
          )}

          {!process && section === "compliance" && (
            <div><SectionTitle color={C.green}>Compliance-by-Design Properties <StatusChip s="design" /></SectionTitle>
              <div style={{ fontSize: 10.5, color: C.textD, marginBottom: 14, background: `${C.amber}0C`, padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.amber}25` }}>
                ⚠ These are <strong style={{ color: C.amber }}>design properties that support a client&rsquo;s compliance obligations</strong> — not assertions that the product is compliant with any regulation. Compliance is a determination made by the client&rsquo;s compliance function and their regulator. The right column maps a property to the kind of regulatory expectation it helps address.
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {COMPLIANCE_PROPS.map(([p, d, maps]) => (
                  <div key={p} style={{ display: "grid", gridTemplateColumns: "180px 1.6fr 1fr", gap: 14, alignItems: "center", padding: "11px 14px", background: C.card, border: `1px solid ${C.green}25`, borderRadius: 8, borderLeft: `3px solid ${C.green}` }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: C.green }}>{p}</span>
                    <span style={{ fontSize: 10.5, color: C.textM, lineHeight: 1.5 }}>{d}</span>
                    <span style={{ fontSize: 9.5, color: C.textD, fontStyle: "italic", lineHeight: 1.5 }}>{maps}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!process && section === "regmap" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                <SectionTitle color={C.amber}>Regulatory Mapping <StatusChip s="design" /></SectionTitle>
                <div style={{ marginLeft: "auto", display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {REG_PILLS.map(r => <Pill key={r} color={C.amber}>{r}</Pill>)}
                </div>
              </div>
              <div style={{ fontSize: 10.5, color: C.textD, marginBottom: 16, background: `${C.amber}0C`, padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.amber}25`, lineHeight: 1.6 }}>
                ⚠ <strong style={{ color: C.amber }}>The ring-fence made visible.</strong> Each regulatory principle maps to the specific Lextr Intelligence design feature that supports a client&rsquo;s ability to meet it — defining the boundary every governed behaviour traces to. These are <strong style={{ color: C.amber }}>design features that support obligations</strong>, not assertions of compliance; compliance is determined by the client&rsquo;s compliance function and their regulator. Applicable regulations depend on the institution&rsquo;s jurisdiction, charter and activities. Not legal advice.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {REGMAP.map(block => (
                  <div key={block.reg} style={{ background: C.card, border: `1px solid ${block.color}30`, borderRadius: 12, overflow: "hidden" }}>
                    <div style={{ padding: "10px 16px", background: `${block.color}12`, borderBottom: `1px solid ${block.color}25` }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: block.color }}>{block.reg}</span>
                    </div>
                    <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
                      {block.items.map(([principle, req, feature]) => (
                        <div key={principle}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: block.color }}>{principle}</div>
                          <div style={{ fontSize: 9.5, color: C.textD, marginTop: 2 }}>{req}</div>
                          <div style={{ fontSize: 10, color: C.textM, marginTop: 3, lineHeight: 1.5 }}>
                            <span style={{ color: block.color }}>→ </span>{feature}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!process && section === "review" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <SectionTitle color={C.teal}>Human Review &amp; MRM <StatusChip s="confirmed" /></SectionTitle>
              <Card icon="👤" label="Always-on, structural" color={C.teal}>Every AI output goes through a reviewer before surfacing. NOT confidence-gated — applies to all outputs, all use-cases. Human-in-the-loop, evolving to human-on-the-loop as a deliberate, governed, per-use-case decision.</Card>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Card icon="🧑‍💼" label="Analyst-level review" color={C.blue}>Variance, DQ, impact, narrative. Reviewer = senior analyst / controller / second analyst (per use-case in Role &amp; Capability mapping). Accept · Correct · Reject + reason → feeds local knowledge store.</Card>
                <Card icon="🏛️" label="Senior-mgmt level" color={C.purple}>Portfolio scans, risk appetite. Produced from already-reviewed analyst outputs. Lighter-touch compliance review. References underlying review IDs.</Card>
              </div>
              <Card icon="📋" label="Review evidence record" color={C.green}>AI output version · reviewer identity + role · action (accept/correct/reject) · correction + rationale · confidence at review · observed-mode flag · timestamp.</Card>
            </div>
          )}

          {!process && section === "stack" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <SectionTitle>Tech Stack — Confirmed <StatusChip s="confirmed" /></SectionTitle>
              <Layer title="PLATFORM (Lextr Core)" tag="exists today" color={C.blue}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8, fontSize: 10, color: C.textM, lineHeight: 1.7 }}>
                  {[["Frontend","React.js 18, MUI, Redux, AG Grid (off Next.js)"],["Backend","Java 17, Spring Boot 3, Spring Cloud Gateway"],
                    ["Python svc","FastAPI (Uvicorn, Pydantic), Dask"],["Database","PostgreSQL (JDBC, Flyway), SQL-first"],
                    ["Graph","Neo4j (Spring Data Neo4j)"],["Semantic","semantic-service (FastAPI, built-in)"],
                    ["Analytics","ClickHouse"],["Cache/RT","Redis; STOMP/SockJS; pg_notify"],
                    ["Messaging","Kafka"],["Identity","Keycloak (OIDC/OAuth2) + OPA"],
                    ["Deploy","Docker, Kubernetes, Helm; GCP + on-prem"],["Observability","OpenTelemetry (instrumentation; Prometheus REJECTED 2026-09-14), ELK stack \u2014 Elasticsearch/Logstash/Kibana, NOT the Eclipse Layout Kernel adopted for graph layout, SonarQube"]].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", gap: 8, padding: "3px 0", borderBottom: `1px solid ${C.border}` }}>
                      <span style={{ color: C.blueL, fontWeight: 700, width: 80 }}>{k}</span><span>{v}</span>
                    </div>
                  ))}
                </div>
              </Layer>
              <Layer title="INTELLIGENCE STACK" tag="the Vertical AI product" color={C.teal}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8, fontSize: 10, color: C.textM, lineHeight: 1.7 }}>
                  {[["Service","lexie-ai (FastAPI, 187 tests) — Core extends it"],["SLM","Qwen3-4B + QLoRA (4-bit NF4), inference service"],
                    ["Embeddings","all-MiniLM-L6-v2, 384-dim, local GPU"],["Reranker","cross-encoder/ms-marco-MiniLM-L-6-v2"],
                    ["LLM path","BaseLLMConnector — client licence, never MNPI"],["Vector","intelligence.embedding_store → vector(384)"],
                    ["Governance","OPA/Rego (platform)"],["Secrets","on-prem Vault / SaaS cloud KMS"]].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", gap: 8, padding: "3px 0", borderBottom: `1px solid ${C.border}` }}>
                      <span style={{ color: C.teal, fontWeight: 700, width: 80 }}>{k}</span><span>{v}</span>
                    </div>
                  ))}
                </div>
              </Layer>
            </div>
          )}

          {!process && section === "apis" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <SectionTitle color={C.teal}>Adapter &amp; APIs — IntelligenceHostAdapter <StatusChip s="confirmed" /></SectionTitle>
              <div style={{ fontSize: 10.5, color: C.textM, background: `${C.teal}0C`, padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.teal}25`, lineHeight: 1.6 }}>
                Deliverable #3, confirmed. The adapter is the <strong style={{ color: C.teal }}>only</strong> data path out of the Core — a Python ABC inside <code style={{ color: C.teal }}>lexie-ai</code>, reaching the host through the <strong>platform gateway over HTTP</strong> (Keycloak JWT, OPA-authorized): host <em>services</em>, never tables or DBs. That is what keeps &ldquo;no direct host-DB access&rdquo; literally true. One interface, one implementation per host; Lextr Core first.
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                <Card icon="🛡️" label="Masking before return" color={C.red}>Values come back already masked for any RESTRICTED/CONFIDENTIAL/MNPI/SENSITIVE cell. A skill physically cannot receive a raw restricted value — the impl masks before the boundary.</Card>
                <Card icon="🚫" label="EXCLUDED never returned" color={C.amber}>The AI governance tier (ALLOWED/RESTRICTED/EXCLUDED) is a Core field but an Intelligence control. EXCLUDED + AI_PROHIBITED are hard-denied here — not masked, not tokenised, not at all.</Card>
                <Card icon="🔑" label="client_id on every call" color={C.blue}>client_id is required on every operation. Until the identifiers were aligned this line gave TWO names for one column and called them equivalent — the join key that selects the right tenant's slice of a multi-tenant host. Not optional, not defaulted.</Card>
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 8 }}>The interface — ~18 operations by skill surface</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {ADAPTER_OPS.map(g => (
                    <div key={g.grp} style={{ background: C.card, border: `1px solid ${g.color}30`, borderRadius: 8, borderLeft: `3px solid ${g.color}`, padding: "9px 14px", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
                      <div style={{ fontSize: 10.5, fontWeight: 700, color: g.color, marginBottom: 6 }}>{g.grp}</div>
                      {g.ops.map(([sig, note]) => (
                        <div key={sig} style={{ display: "flex", gap: 10, padding: "2px 0", alignItems: "baseline" }}>
                          <span style={{ fontSize: 10, color: C.text, fontFamily: MONO, minWidth: 290 }}>{sig}</span>
                          <span style={{ fontSize: 9.5, color: C.textM, flex: 1, lineHeight: 1.4 }}>{note}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 8 }}>LextrCoreAdapter — operation → host service (via gateway)</div>
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1.3fr 1.8fr", gap: 0, padding: "8px 14px", background: C.surface, borderBottom: `1px solid ${C.border}` }}>
                    {["Adapter operation(s)","Host service","Notes"].map(h => <span key={h} style={{ fontSize: 9, fontWeight: 700, color: C.textD, letterSpacing: ".06em", textTransform: "uppercase" }}>{h}</span>)}
                  </div>
                  {ADAPTER_SERVICES.map(([op, svc, note], i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1.6fr 1.3fr 1.8fr", gap: 0, padding: "8px 14px", borderBottom: i < ADAPTER_SERVICES.length - 1 ? `1px solid ${C.border}` : "none", alignItems: "center" }}>
                      <span style={{ fontSize: 9.5, color: C.teal, fontFamily: MONO }}>{op}</span>
                      <span style={{ fontSize: 10, color: C.text, fontWeight: 600 }}>{svc}</span>
                      <span style={{ fontSize: 9.5, color: C.textM, lineHeight: 1.4 }}>{note}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: `${C.amber}0A`, border: `1px solid ${C.amber}25`, borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.amber, marginBottom: 5 }}>Wired now, data follows</div>
                <div style={{ fontSize: 10, color: C.textM, lineHeight: 1.6 }}>
                  Contract is final, but two graph items carry forward (data/store, not contract): <strong style={{ color: C.amber }}>cross-report graph edges don&rsquo;t yet exist</strong> in the FRY9C artifact — so <code style={{ color: C.purple }}>graph_walk_components</code> and cross-report <code style={{ color: C.purple }}>graph_calculation_chain</code> are in the contract but return empty until walk_component edges are built from edit-checks/rules/procedure (blocks UC2/UC5b). And the <strong style={{ color: C.amber }}>Neo4j GPL-3 decision</strong> sits under every <code style={{ color: C.purple }}>graph_*</code> op — if the graph store changes, only LextrCoreAdapter&rsquo;s graph methods change. That containment is the point of the adapter.
                </div>
              </div>
              <div style={{ background: `${C.blue}0A`, border: `1px solid ${C.blue}25`, borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.blue, marginBottom: 5 }}>Proposed — UC10 Lexie Analytical Assist (pending build chat)</div>
                <div style={{ fontSize: 10, color: C.textM, lineHeight: 1.6 }}>
                  Report discovery needs operations the current contract doesn&rsquo;t have — reasoning over the report <em>inventory</em>, not the data: <code style={{ color: C.teal }}>search_report_inventory(intent, client_id)</code> → ranked matches + gap analysis · <code style={{ color: C.teal }}>get_report_definition(report_id, client_id)</code> → dimensions/measures/filters for gap chips + refine · a build/handoff op to the analytical builder. These are <strong style={{ color: C.blue }}>additive</strong> — the existing contract is unchanged — and the EXCLUDED-never-returned rule extends to the inventory + dimension surface. Finalised in the Lexie Analytical Assist build chat.
                </div>
              </div>
            </div>
          )}

          {!process && section === "hostdeps" && (
            <div>
              <SectionTitle color={C.teal}>Host Dependencies <StatusChip s="design" /></SectionTitle>
              <div style={{ fontSize: 10.5, color: C.textD, marginBottom: 14, background: `${C.teal}0C`, padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.teal}25`, lineHeight: 1.6 }}>
                Intelligence depends on the <strong style={{ color: C.teal }}>adapter contract</strong>, never on host tables directly. Each capability it needs maps to the Lextr Core objects that serve it (the first adapter implementation). A different host would serve the same capabilities from different objects. The <strong style={{ color: C.teal }}>type</strong> marks what any host must have versus what Intelligence brings itself — the checklist for standalone packaging. Essentials only; expands as the Foundation chat confirms the adapter.
              </div>
              <div style={{ display: "flex", gap: 14, marginBottom: 14, flexWrap: "wrap" }}>
                {Object.values(DEP_TYPES).map(d => (
                  <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 9.5, color: C.textM }}>
                    <span style={{ width: 9, height: 9, borderRadius: 2, background: d.color, display: "inline-block" }} />
                    <strong style={{ color: d.color }}>{d.label}</strong> — {d.note}
                  </div>
                ))}
              </div>
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1.7fr 1fr 130px", gap: 0, padding: "9px 14px", background: C.surface, borderBottom: `1px solid ${C.border}` }}>
                  {["Capability Intelligence needs","Lextr Core objects that serve it","Served via","Type"].map(h => (
                    <span key={h} style={{ fontSize: 9.5, fontWeight: 700, color: C.textD, letterSpacing: ".06em", textTransform: "uppercase" }}>{h}</span>
                  ))}
                </div>
                {HOSTDEPS.map((d, i) => {
                  const dt = DEP_TYPES[d.type];
                  return (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1.3fr 1.7fr 1fr 130px", gap: 0, padding: "9px 14px",
                      borderBottom: i < HOSTDEPS.length - 1 ? `1px solid ${C.border}` : "none", borderLeft: `3px solid ${dt.color}`,
                      background: d.type === "provided" ? `${C.teal}08` : "transparent", alignItems: "center" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{d.cap}</span>
                      <span style={{ fontSize: 10, color: d.type === "provided" ? C.teal : C.textM, fontFamily: MONO }}>{d.core}</span>
                      <span style={{ fontSize: 9.5, color: C.textD }}>{d.via}</span>
                      <span><Tag label={dt.label} color={dt.color} /></span>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 14, background: `${C.amber}0A`, border: `1px solid ${C.amber}25`, borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.amber, marginBottom: 5 }}>Standalone packaging checklist</div>
                <div style={{ fontSize: 10, color: C.textM, lineHeight: 1.6 }}>
                  A non-Lextr-Core host implements <code style={{ color: C.teal }}>IntelligenceHostAdapter</code> against its own objects. <strong style={{ color: C.green }}>Universal</strong> capabilities any reporting host can satisfy. <strong style={{ color: C.amber }}>Expected</strong> capabilities a host may need to build or expose (rule lineage, edit-check results, grouping dimensions). <strong style={{ color: C.teal }}>Intelligence-provided</strong> capabilities travel with the product — the host supplies nothing. The host must also expose a data-classification scheme for the masking layer to key on.
                </div>
              </div>
            </div>
          )}

          {!process && section === "deploy" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <SectionTitle>Deployment Model <StatusChip s="confirmed" /></SectionTitle>
              {[["On-premises","Client runs Lextr entirely in their own infra. Regulatory data never leaves.","SLM-only. No external LLM API. Non-negotiable.",C.green],
                ["SaaS — Option A (default)","Lextr-hosted shared SLM inference pool. Tenant isolation at Core layer. Cost-efficient.","SLM pool + LLM where classification & governance allow. Never MNPI.",C.amber],
                ["SaaS — Option B (premium)","Per-tenant isolated inference. Auto-covered under Option A architecture.","A routing/config change, not architectural. For larger regulated clients.",C.purple]].map(([m, cfg, ai, col]) => (
                <div key={m} style={{ display: "grid", gridTemplateColumns: "200px 1.4fr 1.2fr", gap: 14, padding: "12px 16px", background: C.card, border: `1px solid ${col}30`, borderRadius: 10, borderLeft: `3px solid ${col}` }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: col }}>{m}</span>
                  <span style={{ fontSize: 10.5, color: C.textM, lineHeight: 1.5 }}>{cfg}</span>
                  <span style={{ fontSize: 10, color: C.textD, lineHeight: 1.5 }}>{ai}</span>
                </div>
              ))}
            </div>
          )}

          {!process && section === "manifest" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <SectionTitle color={C.purple}>Deployment Manifest <StatusChip s="reference" /></SectionTitle>
              <div style={{ background: `${C.amber}0C`, border: `1px solid ${C.amber}35`, borderRadius: 10, padding: "12px 16px", fontSize: 11, color: C.text, lineHeight: 1.6 }}>
                <strong style={{ color: C.amber }}>The deployable system is the union of the deliverable zips below — not this catalog.</strong> This file is the <em>map</em>; the actual code lives in the zips each build chat produced. Nothing auto-assembles them across chats. At packaging time, gather these zips into one chat and assemble the handoff bundle (newest wins on a shared filename). <strong style={{ color: C.red }}>Keep every zip in your own storage</strong> — sandbox files don't persist across chats; losing a zip means re-exporting from its build chat.
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {DEPLOY_MANIFEST.map(([comp, what, zips, target]) => (
                  <div key={comp} style={{ display: "grid", gridTemplateColumns: "190px 1.5fr", gap: 14, padding: "11px 15px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, borderLeft: `3px solid ${C.purple}` }}>
                    <div>
                      <div style={{ fontSize: 11.5, fontWeight: 700, color: C.text }}>{comp}</div>
                      <div style={{ fontSize: 9.5, color: C.textD, marginTop: 3 }}>→ {target}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10.5, color: C.textM, lineHeight: 1.5 }}>{what}</div>
                      <div style={{ fontSize: 10, color: C.purple, marginTop: 5, fontWeight: 600 }}>📦 {zips}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 10.5, color: C.textM, lineHeight: 1.6 }}>
                <strong>At final packaging:</strong> (1) gather every zip listed above into one chat; (2) Claude re-runs the handoff-bundle assembly (the <code>Lextr_Intelligence_Handoff.zip</code> pattern) across the full set, deduplicated and organized by service, with a HANDOFF_README; (3) the detailed catalog is generated alongside. Both need the deliverable code in-context at generation time — the catalog alone carries decisions + contracts, not the source.
              </div>
            </div>
          )}

          {!process && section === "dsshell" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <SectionTitle color={C.blue}>Shell &amp; Theming <StatusChip s="confirmed" /></SectionTitle>
              <div style={{ fontSize: 11, color: C.textM, lineHeight: 1.6 }}>
                The front-end foundation, built in the <strong style={{ color: C.blue }}>2b Design System &amp; Shell</strong> chat. Toward a fully-functional UX/UI: the shell every surface mounts inside, plus the theming spine that owns appearance. <strong>Adopt-not-invent</strong> — it adopted the lineage engine's tokens and the running Core chrome rather than building a parallel look.
              </div>
              <Layer title="THE THREE HARD REQUIREMENTS — owned centrally in the theming spine" tag="delivered" color={C.green}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  <Card icon="🏷️" label="Configurable logo" color={C.green}>A client replaces the product logo with their own. <code style={{ color: C.blue }}>&lt;Logo&gt;</code> reads the tenant-resolved manifest by form × tone — never imports a fixed asset. Client overrides use a URL (src); inline SVG only for trusted defaults.</Card>
                  <Card icon="🎨" label="Client-pointable CSS" color={C.green}>Every token is a <code style={{ color: C.blue }}>--lx-*</code> custom property; the tenant's external stylesheet is injected LAST so it overrides any token by cascade. URL comes from the governed manifest, never user input.</Card>
                  <Card icon="🏢" label="Multi-tenant theming" color={C.green}>A pure <code style={{ color: C.blue }}>resolveTenantTheme(manifest)</code> keyed by clientId; switching re-resolves. A white-label is just a manifest — no code change.</Card>
                </div>
              </Layer>
              <Layer title="APP SHELL — the frame that mounts it" tag="delivered" color={C.green}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <Card icon="🧭" label="Navigation" color={C.blue}>Icon rail + contextual nav panel + top tabs — adopted from the Core analytical screens. @mui/icons-material (locked stack), not the prototype's lucide.</Card>
                  <Card icon="🔐" label="Session / tenant / entitlement" color={C.blue}>SessionProvider carries user + clientId + capability set. Composition order <code style={{ color: C.blue }}>Session→ThemeGate→TenantThemeProvider</code> resolves the tenant FIRST, so theming is per-tenant from first paint (no wrong-brand flash).</Card>
                  <Card icon="💬" label="Lexie mount + /ask seam" color={C.teal}>Floating launcher + panel where /ask connects. The seam, not the contract — wired to the IntelligenceClientPort.</Card>
                  <Card icon="🛡️" label="Capabilities carried, not decided" color={C.amber}>Server-resolved (Keycloak/OPA), carried in the session; useCapability shows/hides. Hiding ≠ securing — the authoritative gate is server-side on every call.</Card>
                </div>
              </Layer>
              <div style={{ background: `${C.amber}0C`, border: `1px solid ${C.amber}30`, borderRadius: 10, padding: "11px 15px", fontSize: 10.5, color: C.textM, lineHeight: 1.6 }}>
                <strong style={{ color: C.amber }}>Open decision:</strong> brand-blue reconciliation — primary <code>#253DE0</code> (logo blue) for chrome; teal + <code>#2878cc</code> preserved for lineage accents. Confirm chrome blue = logo blue, or specify a different chrome blue. · <strong style={{ color: C.amber }}>Brand item:</strong> a white full-wordmark isn't in the kit (mark-on-dark fallback for now).
              </div>
            </div>
          )}

          {!process && section === "dscomponents" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <SectionTitle color={C.blue}>Component Library <StatusChip s="confirmed" /></SectionTitle>
              <div style={{ fontSize: 11, color: C.textM, lineHeight: 1.6 }}>
                The shared atoms every use-case screen, the evidence viewer, and the review UI reuse — built once against the <strong>real Core contracts</strong> (not an invented display model) and themed via <code style={{ color: C.blue }}>theme.lextr</code>, so a tenant re-theme recolours everything automatically.
              </div>
              <Layer title="DELIVERED ATOMS" tag="D4" color={C.green}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <Card icon="🔒" label="MaskedValue — the load-bearing one" color={C.red}>Render-under-entitlement, in the UI. Shows the real value ONLY when <code>!masked &amp;&amp; value!=null</code>; otherwise the classification-toned masked label — never a leak. The front end resolves nothing locally; masking is the default, the value is the narrow exception.</Card>
                  <Card icon="🏷️" label="Status chips" color={C.teal}>One base chip + semantic wrappers off the real enums (RunStatus, ReviewLevel, ReviewDecision, PolicyResult, DataClassification). Single statusTokens map = one source of truth for label + tone.</Card>
                  <Card icon="💡" label="Clarification chips" color={C.purple}>The canonical one-tap NLU atom over Ambiguity[] — replaces the slice-2 Lexie stub. Keyboard-accessible.</Card>
                  <Card icon="⏳" label="Run progress" color={C.blue}>The ~35s lifecycle, honest about always-on review (&ldquo;awaiting human review&rdquo;, not &ldquo;done&rdquo;). Confidence is shown as a signal — no green/red — never a gate. TRIGGERED is a warning, not an error.</Card>
                </div>
              </Layer>
              <Layer title="DELIVERED — the governance surfaces (D5)" tag="D5" color={C.green}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <Card icon="📜" label="Evidence ledger viewer" color={C.green}>Renders RunResult / EvidenceStep verbatim — the per-step trace ordered by step, masking applied + tiers, policy PASS/TRIGGERED (dual-sourced, derived fallback labeled), model + classification. Output under entitlement via MaskedText. One canonical display, reused beyond review.</Card>
                  <Card icon="✅" label="Review / approval UI" color={C.green}>The always-on review queue (level-filtered) + accept/correct/reject. SoD is server-side (OPA MRM-SoD gate); the UI submits reviewerId and shows a non-blocking author note — never claims to be the gate.</Card>
                </div>
              </Layer>
              <Layer title="DELIVERED — chart set (D6)" tag="D6" color={C.green}>
                <Card icon="📊" label="LextrChart — one canonical chart" color={C.green}>Line/bar/table for the dataset/chart OutputTypes, standalone + embedded in the evidence viewer. Masking holds at EVERY value surface: points suppressed to null, axis domain excludes masked, gaps not bridged, tooltip never shows raw, all-masked→notice — via the same entitlement resolution as narrative. Undefined OutputTypes render a graceful "unsupported" notice (no guessing). recharts, isolated behind the component.</Card>
              </Layer>
            </div>
          )}

          {!process && section === "dswiring" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <SectionTitle color={C.blue}>Core Wiring <StatusChip s="confirmed" /></SectionTitle>
              <div style={{ fontSize: 11, color: C.textM, lineHeight: 1.6 }}>
                How the front end connects to the engine built in Core Build — the &ldquo;consume the real model, don't invent one&rdquo; layer. Every type mirrors a confirmed backend contract.
              </div>
              <Layer title="THE CLIENT — fills the shell port with ZERO shell change" tag="delivered" color={C.green}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <Card icon="🔌" label="IntelligenceClient" color={C.green}>Extends the shell's IntelligenceClientPort and maps ResolveResponse → the port's AskResult at the boundary — so the provider takes it with no shell edit. The slice-2 seam-not-contract bet, paid off.</Card>
                  <Card icon="📋" label="Contracts mirror the backend" color={C.blue}>7-value DataClassification (matches D1), agent_run_step evidence shape (matches D6), render-under-entitlement placeholders (§4.4). camelCase with snake_case origins documented inline.</Card>
                  <Card icon="🔄" label="useIntelligenceRun lifecycle" color={C.teal}>launch → trigger → STOMP progress → getRun → result. Falls back to polling when STOMP isn't wired. Surfaces phase: in_review honestly; confidence is a signal, never a gate.</Card>
                  <Card icon="🛡️" label="Boundaries upheld" color={C.amber}>Policy stays in OPA — PolicyCheckResult.policyId is a reference; the FE renders PASS/TRIGGERED, never evaluates. Placeholders resolve server-side under entitlement; the FE never holds raw values.</Card>
                </div>
              </Layer>
              <div style={{ background: `${C.amber}0C`, border: `1px solid ${C.amber}30`, borderRadius: 10, padding: "11px 15px", fontSize: 10.5, color: C.textM, lineHeight: 1.6 }}>
                <strong style={{ color: C.amber }}>Backend confirmations (typed defensively, none blocking):</strong> (1) does PolicyCheckResult arrive as RunResult.policyChecks or derive from evidence steps? (2) is placeholder-resolution under Core / the host reporting layer rather than intelligence-service? (3) does the engine emit <code>{"{{TOKEN}}"}</code> output markers?
              </div>
            </div>
          )}

        </div>
      </div>

      <div style={{ padding: "14px 28px", borderTop: `1px solid ${C.border}`, fontSize: 9.5, color: C.textD, fontStyle: "italic" }}>
        Lextr Intelligence · Architecture &amp; Build Catalog · left = system content, top = process state · evolves as the build progresses
      </div>
    </div>
  );
}
