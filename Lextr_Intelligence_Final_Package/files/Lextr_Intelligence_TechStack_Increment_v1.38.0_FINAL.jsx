// =============================================================================
// LEXTR INTELLIGENCE - INCREMENTAL TECH STACK
// Manifest 1.38.0 - stack decided 2026-09-14 - 51 selected, 6 rejected.
// Merge into the Enterprise Standards Catalog's TECH section.
//
//   new         the standard has no equivalent - merge as-is
//   divergent   both name something for the same job and they DISAGREE
//   absent      the standard names it, Intelligence does not use it
//
// Every STD-* entry in the catalogue is enf:"Mandatory" with "Governance review" as the
// only exception route. So the three divergences are not preferences - each leaves a
// Mandatory standard broken until somebody rules on it, which is why they are shown
// first and the sixteen additions are shown below them.
//
// Styled to the catalogue it merges into: same tokens, families and lx-* conventions,
// and the same tenant theming, so it reads as one of the family rather than a visitor.
// =============================================================================
import React, { useState } from "react";

const INCREMENT = {
 "meta": {
  "manifest": "1.38.0",
  "decided": "2026-09-14",
  "selected": 51,
  "rejected": 6,
  "categories": 14
 },
 "new": [
  {
   "layer": "Vector search",
   "tech": "pgvector",
   "why": "Postgres extension; embedding_store with an HNSW cosine index. The standard's PostgreSQL layer has no vector capability, and this is an EXTENSION to the existing database rather than a new store - nothing else in the estate changes.",
   "std": "STD-ARCH-003 (metadata layer separation) — the vector table lives in the intelligence schema, not meta or data."
  },
  {
   "layer": "Local model runtime",
   "tech": "Qwen3-4B (QLoRA adapter, 4-bit NF4)",
   "why": "The on-prem small language model. Required, not optional: MNPI cannot leave the building, so a hosted-only design cannot serve the on-prem tier.",
   "std": "STD-AIP-* — model governance applies; the model_registry row carries is_local, which OPA reads to decide MNPI eligibility."
  },
  {
   "layer": "Hosted model connector",
   "tech": "openai",
   "why": "The SaaS tier, behind the same port as the local model. BOTH tiers were selected on 2026-09-14, which makes per-deployment model resolution mandatory rather than optional.",
   "std": "STD-AIP-*"
  },
  {
   "layer": "Embeddings",
   "tech": "all-MiniLM-L6-v2 @ 384",
   "why": "DECIDED 2026-09-14. A 768-dimension Qwen3-Embedding candidate is registered in a sibling table for measurement; the decision stands until numbers replace it. NOTE for whoever runs that measurement: all-MiniLM-L6-v2 truncates input at 256 word pieces and the chunker emits 3,000-character chunks.",
   "std": "STD-AIP-*"
  },
  {
   "layer": "Agent runtime",
   "tech": "agno",
   "why": "Bounded agentic workflow — a three-skill pipeline, not agents making decisions. langgraph is present in the running estate and NOT adopted.",
   "std": "STD-AIP-*"
  },
  {
   "layer": "Document parsing",
   "tech": "Docling + docling-serve; TableFormer; pypdf; python-docx",
   "why": "Layout-aware parsing for regulatory PDFs, ROUTED BY FILE TYPE: layout awareness is what makes a table survive as a table and is worth a second service for a filing; paying for a layout model on a .txt is waste. The simple readers are named so the routing is a stated design rather than a leftover.",
   "std": "—"
  },
  {
   "layer": "OCR",
   "tech": "RapidOCR",
   "why": "Scanned regulatory documents.",
   "std": "—"
  },
  {
   "layer": "Object storage",
   "tech": "boto3 (S3) / google-cloud-storage (legacy GCS)",
   "why": "Behind one ObjectStore port, selected per deployment; an UNBOUND store is a supported configuration. Content-addressed evidence payloads keyed on payload_hash, written inside the persist transaction. The standard names no object store at all.",
   "std": "STD-GOV-* — evidence retention."
  },
  {
   "layer": "Observability",
   "tech": "OpenTelemetry (instrumentation and transport, OTLP)",
   "why": "ADOPTED 2026-09-14 as the observability standard; Prometheus REJECTED. THE BACKEND IS NOT NAMED — the destination is deployment configuration, which is the strongest form of vendor neutrality and also a real gap until a deployment names an OTLP endpoint. The endpoint is a required setting and an unset one FAILS STARTUP rather than exporting into nothing. The standard's TECH.layers names no observability stack, so there is nothing here to disagree with — but the enterprise catalogue's own observability line lists 'Prometheus, ELK, SonarQube', which this supersedes for Intelligence.",
   "std": "STD-ENG-* — and note the OTLP endpoint is itself an egress destination: on the on-prem tier it must terminate inside the building."
  },
  {
   "layer": "LLM tracing",
   "tech": "langfuse",
   "why": "Model-call tracing. CARRIES AN EGRESS OBLIGATION: traces capture prompts, prompts here can carry MNPI, so a hosted trace store passes the same gate as any other outbound call.",
   "std": "STD-GOV-*"
  },
  {
   "layer": "Structured logging",
   "tech": "loguru",
   "why": "No secrets, no MNPI in a log line.",
   "std": "STD-ENG-*"
  },
  {
   "layer": "Graph visualisation",
   "tech": "Cytoscape.js + ELK (Eclipse Layout Kernel)",
   "why": "Lineage and calculation-chain rendering. ELK REPLACED Dagre on 2026-09-14 and Dagre is rejected. react-cytoscapejs is PROHIBITED — it recreates the cy instance on every render. NAME COLLISION WORTH READING TWICE: this ELK is the Eclipse Layout Kernel, NOT the ELK stack (Elasticsearch/Logstash/Kibana) which the enterprise catalogue lists under observability. Same three letters, two technologies, one estate.",
   "std": "—"
  },
  {
   "layer": "Micro-frontend",
   "tech": "Module Federation",
   "why": "A use case renders as inline, modal or drawer inside Lextr Core. Tenant theming flows through TENANT.logoUrl and TENANT.cssOverrideUrl; token-only, brand-free.",
   "std": "STD-UXC-*"
  },
  {
   "layer": "Migration testing",
   "tech": "pglast",
   "why": "Migration SQL is PARSED IN TESTS without standing up Postgres. It came from the running estate rather than from any specification, and the stack review called it the clearest case of something the running system holds that the specification should take.",
   "std": "STD-ENG-*"
  },
  {
   "layer": "Config",
   "tech": "pydantic-settings; PyYAML",
   "why": "Typed settings. PyYAML is read with safe_load ONLY — the default loader executes constructors, so on any config path that is not fully trusted this is a security control rather than a style preference.",
   "std": "STD-ENG-*"
  },
  {
   "layer": "Upload handling",
   "tech": "python-multipart",
   "why": "Arrives under FastAPI rather than being chosen, and is pinned deliberately: an unpinned parser on the upload path is an attack surface.",
   "std": "STD-ENG-*"
  }
 ],
 "divergent": [
  {
   "job": "Frontend state",
   "standard": "Redux Toolkit",
   "intelligence": "Zustand",
   "conflict": "Intelligence selected Zustand on 2026-09-14. The standard's Frontend layer names Redux Toolkit. Both are state containers for the same job, so this is a real disagreement rather than an addition.",
   "route": "Either Intelligence takes a governance exception, or the standard widens to permit Zustand for embedded micro-frontends. A merge that appends Zustand beside Redux Toolkit without saying they conflict leaves a Mandatory standard silently broken."
  },
  {
   "job": "Frontend grid / charts",
   "standard": "AG Grid",
   "intelligence": "recharts (+ lucide-react for icons)",
   "conflict": "Intelligence renders charts with recharts and does not use AG Grid. The standard names AG Grid in the same layer.",
   "route": "Governance review, or scope the standard's AG Grid requirement to the reporting surfaces where it is actually load-bearing."
  },
  {
   "job": "Python compute",
   "standard": "Dask",
   "intelligence": "pandas + numpy",
   "conflict": "The standard names Dask for distributed ETL and analytical compute. Intelligence does tabular and vector work in-process with pandas and numpy and introduces no distributed compute.",
   "route": "Defensible on scale grounds — Intelligence is not an ETL surface — but it is a divergence and should be recorded as one, not discovered later."
  }
 ],
 "absent": [
  {
   "layer": "Analytics store",
   "tech": "ClickHouse",
   "why": "Intelligence performs no aggregation-heavy reporting; the ledger summary lives in the reporting estate. Not a gap — an absence somebody decided."
  },
  {
   "layer": "Messaging",
   "tech": "Kafka",
   "why": "Intelligence uses STOMP for live run updates and has no async event-driven inter-service comms of its own. If a future use case needs one, Kafka is the standard's answer and should be taken rather than replaced."
  },
  {
   "layer": "Realtime",
   "tech": "pg_notify",
   "why": "Not used. Run progress rides STOMP; nothing in Intelligence triggers from a DB channel."
  },
  {
   "layer": "Gateway / Config",
   "tech": "Spring Cloud Gateway + Config",
   "why": "Not named in the Intelligence stack. Whether intelligence-service sits behind the enterprise gateway is a DEPLOYMENT question nobody has answered, and the answer affects how identity reaches the service."
  },
  {
   "layer": "ORM / data access",
   "tech": "Spring Data Neo4j",
   "why": "The standard pairs Neo4j with Spring Data Neo4j. Intelligence names Neo4j and does not name the binding — an open detail rather than a divergence."
  }
 ],
 "rejected": [
  "Dagre",
  "Prometheus",
  "SQLAlchemy",
  "asyncpg",
  "psycopg",
  "psycopg2-binary"
 ],
 "inherits": "Java 17 / Spring Boot, PostgreSQL + Flyway + NamedParameterJdbcTemplate, Keycloak + OPA, Neo4j, Redis, STOMP, React 18 + MUI, Docker / Kubernetes / Helm — unchanged."
};

// Tenant theming, per LP-02's contract: the logo and the stylesheet are BOTH configurable,
// so a client renders this in their own identity without a fork.
const THEMES = {
  lextr: { name: "Lextr", logo: "L", vars: {
    "--bg": "#f6f5f1", "--surface": "#ffffff", "--surface-2": "#f0eee8",
    "--ink": "#1c1b18", "--muted": "#6b6a64", "--line": "#dcd9d0",
    "--brand": "#1f3864", "--brand-2": "#2e75b6", "--accent": "#b45309",
    "--ok": "#15803d", "--chip": "#eef2f9" } },
  aurora: { name: "Aurora Bank", logo: "A", vars: {
    "--bg": "#0f1419", "--surface": "#161c24", "--surface-2": "#1d2632",
    "--ink": "#e9edf2", "--muted": "#94a0ad", "--line": "#2a3542",
    "--brand": "#36c2a8", "--brand-2": "#5fd8c2", "--accent": "#e0b341",
    "--ok": "#4ade80", "--chip": "#1d2632" } },
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
.lxi { font-family:'IBM Plex Sans',ui-sans-serif,system-ui,sans-serif; color:var(--ink); background:var(--bg); min-height:100vh; }
.lxi-display { font-family:'Fraunces',Georgia,serif; letter-spacing:-.012em; font-weight:600; }
.lxi-mono { font-family:'IBM Plex Mono',ui-monospace,monospace; }
.lxi-surface { background:var(--surface); border:1px solid var(--line); }
.lxi-conflict { box-shadow: inset 4px 0 0 0 var(--accent); }
.lxi-chip { background:var(--chip); border:1px solid var(--line); border-radius:3px;
  padding:2px 7px; font-size:11.5px; display:inline-block; }
.lxi a:focus-visible, .lxi button:focus-visible { outline:2px solid var(--brand-2); outline-offset:2px; }
@media (prefers-reduced-motion: reduce) { .lxi * { animation:none !important; transition:none !important; } }
`;

export default function TechStackIncrement({ tenant = "lextr", logoUrl = null,
                                             cssOverrideUrl = null }) {
  const [t, setT] = useState(tenant);
  const th = THEMES[t] || THEMES.lextr;
  const [open, setOpen] = useState(null);
  const D = INCREMENT;
  const box = { maxWidth: 1080, margin: "0 auto", padding: "0 28px" };

  return (
    <div className="lxi" style={{ ...th.vars }}>
      <style>{CSS}</style>
      {cssOverrideUrl ? <link rel="stylesheet" href={cssOverrideUrl} /> : null}

      <header style={{ borderBottom: "1px solid var(--line)", background: "var(--surface)" }}>
        <div style={{ ...box, display: "flex", alignItems: "center", gap: 14,
                      padding: "18px 28px" }}>
          {logoUrl
            ? <img src={logoUrl} alt="" style={{ height: 28 }} />
            : <span className="lxi-display" style={{ width: 30, height: 30, borderRadius: 4,
                background: "var(--brand)", color: "#fff", display: "grid",
                placeItems: "center", fontSize: 16 }}>{th.logo}</span>}
          <div style={{ flex: 1 }}>
            <div className="lxi-display" style={{ fontSize: 17 }}>Lextr Intelligence · tech stack increment</div>
            <div style={{ fontSize: 12.5, color: "var(--muted)" }}>
              Manifest {D.meta.manifest} · decided {D.meta.decided} · to merge into the
              Enterprise Standards Catalog
            </div>
          </div>
          <select value={t} onChange={(e) => setT(e.target.value)}
            style={{ font: "inherit", fontSize: 12.5, padding: "5px 8px",
                     background: "var(--surface-2)", color: "var(--ink)",
                     border: "1px solid var(--line)", borderRadius: 4 }}>
            {Object.entries(THEMES).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
          </select>
        </div>
      </header>

      <main style={{ ...box, padding: "34px 28px 64px" }}>
        <p style={{ maxWidth: "68ch", fontSize: 15, lineHeight: 1.65, marginTop: 0 }}>
          Intelligence runs on the enterprise platform and inherits it: {D.inherits} What
          follows is only the delta — and it starts with the part that cannot simply be
          appended.
        </p>

        {/* THE HERO: the three conflicts. Additions merge on sight; these do not. */}
        <section style={{ marginTop: 38 }}>
          <h2 className="lxi-display" style={{ fontSize: 26, margin: "0 0 6px" }}>
            Three things the two documents disagree about
          </h2>
          <p style={{ fontSize: 13.5, color: "var(--muted)", maxWidth: "70ch",
                      margin: "0 0 18px" }}>
            Both name a technology for the same job and they name different ones. Every
            standard in the catalogue is mandatory, and governance review is the only
            exception route — so merging the additions while leaving these unstated would
            leave three mandatory standards quietly broken.
          </p>
          {D.divergent.map((d, i) => (
            <article key={i} className="lxi-surface lxi-conflict"
              style={{ borderRadius: 5, padding: "16px 20px", marginBottom: 12 }}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>{d.job}</div>
              <div style={{ display: "flex", gap: 26, flexWrap: "wrap", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 11.5, color: "var(--muted)" }}>Standard says</div>
                  <div className="lxi-mono" style={{ fontSize: 13.5 }}>{d.standard}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11.5, color: "var(--muted)" }}>Intelligence chose</div>
                  <div className="lxi-mono" style={{ fontSize: 13.5, color: "var(--accent)" }}>
                    {d.intelligence}</div>
                </div>
              </div>
              <p style={{ fontSize: 13.5, lineHeight: 1.6, margin: "0 0 8px", maxWidth: "74ch" }}>
                {d.conflict}</p>
              <p style={{ fontSize: 13.5, lineHeight: 1.6, margin: 0, maxWidth: "74ch",
                          color: "var(--brand)" }}>{d.route}</p>
            </article>
          ))}
        </section>

        <section style={{ marginTop: 44 }}>
          <h2 className="lxi-display" style={{ fontSize: 22, margin: "0 0 6px" }}>
            {D.new.length} additions the standard has no equivalent for
          </h2>
          <p style={{ fontSize: 13.5, color: "var(--muted)", margin: "0 0 16px" }}>
            These merge as they are. Select one to read why it is here.
          </p>
          <div className="lxi-surface" style={{ borderRadius: 5, overflow: "hidden" }}>
            {D.new.map((n, i) => (
              <div key={i} style={{ borderTop: i ? "1px solid var(--line)" : "none" }}>
                <button onClick={() => setOpen(open === i ? null : i)}
                  aria-expanded={open === i}
                  style={{ width: "100%", textAlign: "left", font: "inherit", cursor: "pointer",
                           background: open === i ? "var(--surface-2)" : "transparent",
                           border: "none", padding: "12px 18px", display: "flex",
                           gap: 16, alignItems: "baseline", color: "var(--ink)" }}>
                  <span style={{ minWidth: 168, fontSize: 13, color: "var(--muted)" }}>{n.layer}</span>
                  <span className="lxi-mono" style={{ flex: 1, fontSize: 13.5 }}>{n.tech}</span>
                  <span className="lxi-chip">{n.std}</span>
                </button>
                {open === i ? (
                  <p style={{ margin: 0, padding: "2px 18px 16px 202px", fontSize: 13.5,
                              lineHeight: 1.65, maxWidth: "80ch", color: "var(--ink)" }}>
                    {n.why}</p>) : null}
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginTop: 44 }}>
          <h2 className="lxi-display" style={{ fontSize: 22, margin: "0 0 6px" }}>
            {D.absent.length} things in the standard Intelligence does not use
          </h2>
          <p style={{ fontSize: 13.5, color: "var(--muted)", margin: "0 0 16px",
                      maxWidth: "70ch" }}>
            Recorded so nobody fills them by accident. An absence stated is an absence
            somebody decided.
          </p>
          {D.absent.map((a, i) => (
            <div key={i} style={{ display: "flex", gap: 16, alignItems: "baseline",
                                  padding: "9px 0", borderTop: "1px solid var(--line)" }}>
              <span style={{ minWidth: 168, fontSize: 13, color: "var(--muted)" }}>{a.layer}</span>
              <span className="lxi-mono" style={{ minWidth: 190, fontSize: 13.5 }}>{a.tech}</span>
              <span style={{ flex: 1, fontSize: 13.5, lineHeight: 1.6, maxWidth: "62ch" }}>
                {a.why}</span>
            </div>
          ))}
        </section>

        <section style={{ marginTop: 44 }}>
          <h2 className="lxi-display" style={{ fontSize: 22, margin: "0 0 6px" }}>
            Considered and turned down
          </h2>
          <p style={{ fontSize: 13.5, color: "var(--muted)", margin: "0 0 14px",
                      maxWidth: "70ch" }}>
            Recorded because undecided and rejected look identical in an export, and someone
            who finds one of these in an older document should be able to tell which it was.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {D.rejected.map((r) => (
              <span key={r} className="lxi-chip lxi-mono"
                style={{ textDecoration: "line-through", color: "var(--muted)" }}>{r}</span>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export { INCREMENT };
