/* ============================================================================
   LEXTR — STACK DECISION WORKBENCH
   ----------------------------------------------------------------------------
   A tech lead selects the stack, job by job, and records why. Everything on the
   screen was derived from the two source documents; nothing here was retyped.

   HOW A DECISION IS MADE
     Every item is one of three states: UNDECIDED, SELECTED or REJECTED. A job is
     "settled" once at least one of its items is SELECTED, or the lead explicitly
     records that NOTHING is selected for it - which is a real answer, and the
     one that applies wherever the right call is to build neither option.

   WHAT IT CHECKS AS YOU GO — these are warnings, never blocks. It is the lead's
   call to override any of them, and the override is recorded in the export.
     · two items selected that do the same job on opposite sides
     · a CHOICE settled with no comment explaining why
     · a job left undecided
     · an item selected whose own analysis says it is dead weight

   NO BROWSER STORAGE, DELIBERATELY. Selections live in memory and leave through
   Export. Auto-saving invisibly produces a decision record nobody can attribute
   or hand on; a downloaded file has a name, a reviewer and a date.

   TENANT CONFIGURABLE. Logo and stylesheet are configuration. Every colour is a
   CSS variable, so a tenant sheet restyles the whole surface without a rebuild.
   ========================================================================== */

import React, { useState, useMemo, useRef } from "react";

/* ---------------------------------------------------------------- tenant --- */
export const TENANT = {
  name: "Lextr Intelligence",
  logoUrl: null,            // e.g. "https://client.example/logo.svg"
  cssOverrideUrl: null,     // a tenant stylesheet; overrides the variables below
  clientId: null,           // never placed in a URL or query string
};

const TOKENS = `
.lxw{
  --ink:#12161c; --text:#33404f; --muted:#69788a; --line:#d8dee6; --soft:#f2f5f8;
  --bg:#fbfcfd; --blue:#2f5fd0; --amber:#b8770a; --green:#1f7a48; --red:#b3261e;
  --radius:8px;
  --font:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  --mono:ui-monospace,SFMono-Regular,Menlo,monospace;
  background:var(--bg); color:var(--text); font:14.5px/1.6 var(--font);
}
.lxw *{box-sizing:border-box}
.lxw h1{margin:0;font-size:18px;color:var(--ink)}
.lxw h2{font-size:14px;color:var(--ink);margin:26px 0 6px;padding-bottom:5px;border-bottom:2px solid var(--line)}
.lxw h3{margin:0;font-size:15px;color:var(--ink)}
.lxw .muted{color:var(--muted);font-size:12.6px}
.lxw .bar{position:sticky;top:0;z-index:5;background:#fff;border-bottom:1px solid var(--line);padding:12px 18px}
.lxw .row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.lxw .card{border:1px solid var(--line);background:#fff;border-radius:var(--radius);margin:12px 0;overflow:hidden}
.lxw .hd{padding:11px 14px;background:var(--soft);border-bottom:1px solid var(--line)}
.lxw .sides{display:grid;grid-template-columns:1fr 1fr}
.lxw .sides>div{padding:11px 14px}
.lxw .sides>div:first-child{border-right:1px solid var(--line)}
.lxw .lbl{font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--muted);margin-bottom:7px}
.lxw .chip{display:inline-flex;align-items:center;gap:6px;font-family:var(--mono);font-size:11.5px;
  border:1px solid var(--line);background:#fff;color:var(--ink);border-radius:6px;padding:4px 8px;margin:0 5px 5px 0;cursor:pointer}
.lxw .chip:hover{border-color:var(--blue)}
.lxw .chip.sel{border-color:var(--green);background:#f2fbf6;color:var(--green);font-weight:700}
.lxw .chip.rej{border-color:var(--red);background:#fdf4f3;color:var(--red);text-decoration:line-through}
.lxw .chip .mark{font-size:10px;opacity:.85}
.lxw .fact{font-family:var(--font);font-style:italic;border-style:dashed;color:var(--muted);cursor:default}
.lxw .pill{display:inline-block;font-size:9.5px;font-weight:700;padding:2px 8px;border-radius:9px;border:1px solid currentColor}
.lxw .CHOICE{color:var(--amber)} .lxw .AGREED{color:var(--green)}
.lxw .RUNNING_ONLY{color:var(--red)} .lxw .MANIFEST_ONLY{color:var(--blue)}
.lxw .settled{color:var(--green)} .lxw .open{color:var(--muted)}
.lxw textarea{width:100%;font:13px var(--font);color:var(--ink);border:1px solid var(--line);
  border-radius:6px;padding:8px 10px;resize:vertical;background:#fff}
.lxw textarea:focus{outline:none;border-color:var(--blue)}
.lxw button{font:12.5px var(--font);font-weight:600;padding:6px 11px;border:1px solid var(--line);
  border-radius:6px;background:#fff;color:var(--ink);cursor:pointer}
.lxw button:hover{border-color:var(--blue)}
.lxw button.primary{background:var(--blue);border-color:var(--blue);color:#fff}
.lxw select,.lxw input[type=text]{font:12.5px var(--font);padding:6px 9px;border:1px solid var(--line);border-radius:6px;background:#fff;color:var(--ink)}
.lxw .warn{border-left:3px solid var(--amber);background:#fffaf2;padding:8px 12px;border-radius:0 6px 6px 0;margin:8px 0;font-size:12.8px;color:var(--ink)}
.lxw .stop{border-left-color:var(--red);background:#fdf4f3}
.lxw .info{border-left:3px solid var(--blue);background:var(--soft);padding:10px 13px;border-radius:0 6px 6px 0;margin:10px 0;font-size:13px;color:var(--ink)}
.lxw .body{padding:20px 18px 90px;max-width:1120px}
.lxw .prog{height:7px;background:var(--soft);border-radius:4px;overflow:hidden;min-width:180px;flex:1}
.lxw .prog i{display:block;height:100%;background:var(--green)}
.lxw .rec{padding:11px 14px;border-top:1px solid var(--line);background:#f4fbf7;
  border-left:4px solid var(--green)}
.lxw .rec[data-rec="diverge"]{background:#fffaf2;border-left-color:var(--amber)}
.lxw .rec[data-rec="deferred"]{background:var(--soft);border-left-color:var(--muted)}
.lxw .recpick{font-size:14.5px;color:var(--ink);margin:5px 0 6px}
.lxw .recwhy{font-size:13.4px;color:var(--text)}
.lxw .reason{font-size:13.4px;color:var(--text)}
.lxw .pill.rec-match{color:var(--green)} .lxw .pill.rec-diverge{color:var(--amber)}
.lxw .pill.rec-undecided{color:var(--muted)} .lxw .pill.rec-deferred{color:var(--muted)}
.lxw .pill.rec-ownerDecided{color:var(--blue)}
.lxw .rec[data-rec="ownerDecided"]{background:#f4f7fd;border-left-color:var(--blue)}
.lxw details{margin:8px 0;font-size:13px} .lxw summary{cursor:pointer;font-weight:600;color:var(--ink)}
.lxw pre{font-family:var(--mono);font-size:11px;background:var(--soft);padding:10px;border-radius:6px;
  white-space:pre-wrap;word-break:break-word;max-height:280px;overflow:auto}
`;

const DATA = {
"jobs": [
{
"id": "api-python",
"layer": "Runtime and API",
"name": "Serving the AI service's web API",
"what": "The plumbing that receives a request over HTTP, hands it to the code, and sends an answer back.",
"kind": "AGREED",
"choose": "Nothing to choose - both sides say FastAPI on Python, so this is settled and no argument below requires re-platforming the service that hosts it. Starlette sits underneath FastAPI and python-multipart is what lets it accept an uploaded file; neither was picked, they arrive with the choice.",
"verdict": "Keep. Pin python-multipart, which currently carries no version - an unpinned parser on the file-upload path is the one place a surprise version is also a way in.",
"recommends": [
"fastapi",
"starlette",
"uvicorn",
"python-multipart",
"Python 3"
],
"builtFact": null,
"manFact": null,
"items": [
{
"name": "fastapi",
"side": "both",
"ownerWhy": null,
"version": "",
"purpose": "Core API framework for the whole service",
"polarity": "TARGET STACK",
"manifestLoc": "build_context.pinned_stack.python_service"
},
{
"name": "starlette",
"side": "as-built only",
"ownerWhy": null,
"version": "",
"purpose": "ASGI layer underneath FastAPI",
"polarity": "RECORDED AS A DEFECT",
"manifestLoc": "LP-33"
},
{
"name": "uvicorn",
"side": "both",
"ownerWhy": null,
"version": "",
"purpose": "ASGI server",
"polarity": "TARGET STACK",
"manifestLoc": "build_context.pinned_stack.python_service"
},
{
"name": "python-multipart",
"side": "as-built only",
"ownerWhy": null,
"version": "",
"purpose": "Parses multipart file uploads for the ingestion endpoint",
"polarity": "NOT PRESENT",
"manifestLoc": ""
},
{
"name": "Python 3",
"side": "both",
"ownerWhy": null,
"version": "",
"purpose": "",
"polarity": "TARGET STACK",
"manifestLoc": "build_context.pinned_stack.python_service"
}
],
"built": [
"fastapi",
"starlette",
"uvicorn",
"python-multipart",
"Python 3"
],
"man": [
"fastapi",
"uvicorn",
"Python 3"
]
},
{
"id": "api-java",
"layer": "Runtime and API",
"name": "A second service that owns all database writes",
"what": "The manifest puts a separate Java service in front of the database so that exactly one thing can write to it.",
"kind": "MANIFEST_ONLY",
"choose": "This is not Java versus Python - the manifest wants BOTH, each doing a different job. The question is whether a second service is worth building. It buys one place that can enforce the single-transaction save, the tamper-evident evidence log, and the per-client isolation rule. It costs a second service, a second language and a network hop on every write. There is a third option nobody has put on the table: keep one service and enforce the same one-writer rule inside it. What the evidence log needs is that nothing can write around it - not that the writer is written in Java.",
"verdict": "Owner's call. The expensive outcome is half of each - a Java service that owns some writes while the Python one keeps others, which costs as much as the first option and guarantees as little as the second.",
"recommends": "OWNER",
"builtFact": null,
"manFact": null,
"items": [
{
"name": "Java 17",
"side": "manifest only",
"ownerWhy": null,
"version": "",
"purpose": "",
"polarity": "TARGET STACK",
"manifestLoc": "build_context.pinned_stack.backend"
},
{
"name": "Spring Boot",
"side": "manifest only",
"ownerWhy": null,
"version": "",
"purpose": "",
"polarity": "TARGET STACK",
"manifestLoc": "build_context.pinned_stack.backend"
},
{
"name": "Jackson",
"side": "manifest only",
"ownerWhy": null,
"version": "",
"purpose": "",
"polarity": "TARGET STACK",
"manifestLoc": "build_context.pinned_stack.backend"
}
],
"built": [],
"man": [
"Java 17",
"Spring Boot",
"Jackson"
]
},
{
"id": "push",
"layer": "Runtime and API",
"name": "Telling the browser when a long job has finished",
"what": "A push channel, so a slow job does not leave the user staring at a spinner on a request that eventually times out.",
"kind": "MANIFEST_ONLY",
"choose": "The running system has nothing here - ingestion is synchronous, and the user waits. That works while parsing takes under a second. It stops working the moment OCR is switched on, because reading a scanned document takes minutes, and a request held open for minutes is the wrong shape. The as-built design notes already anticipate this.",
"verdict": "Build it together with OCR, not after. The document status states already exist for it to report against.",
"recommends": [
"STOMP"
],
"builtFact": null,
"manFact": null,
"items": [
{
"name": "STOMP",
"side": "manifest only",
"ownerWhy": null,
"version": "",
"purpose": "",
"polarity": "TARGET STACK",
"manifestLoc": "build_context.pinned_stack.cache_realtime"
}
],
"built": [],
"man": [
"STOMP"
]
},
{
"id": "agents",
"layer": "Agent and orchestration",
"name": "Deciding what the AI does next",
"what": "Whether the AI follows a fixed short sequence of steps, or is given tools and left to work out its own route.",
"kind": "RUNNING_ONLY",
"choose": "The running system uses an agent framework, which is built for letting the model decide its own path. The manifest asks for the opposite: a fixed sequence of at most eight steps and no free roaming - because a fixed path has a predictable cost and a predictable answer, which is the whole argument for this product. Neither is written down as a decision. THIS ROW HAS SINCE MOVED: when it was written the framework appeared NOWHERE in the manifest, so nobody had to notice the disagreement. It is now declared as pinned_stack.agent_runtime - for its Knowledge and retrieval abstractions and explicitly NOT for its Agent loop - and validation_gates.step_ceiling makes the bound provable rather than intended. langgraph is named there too, to record that a second orchestration runtime is a second place the ceiling can be missed. What remains open is enforcement in the running code: the gate exists, the assertion does not.",
"verdict": "Keep it and cap it. Writing it down is done - the framework and the ceiling are both in the manifest now. What is left is the assertion against the running code: on a pay-per-word bill, a loop with no ceiling is an invoice with no ceiling, and a gate nothing runs is a paragraph.",
"recommends": [
"agno"
],
"builtFact": null,
"manFact": null,
"items": [
{
"name": "agno",
"side": "as-built only",
"ownerWhy": null,
"version": "",
"purpose": "Agent / Knowledge / vector-DB abstraction behind the legacy chatbot, rule summarizer, and MDRM suggestion reranker",
"polarity": "TARGET STACK",
"manifestLoc": "build_context"
},
{
"name": "langgraph",
"side": "as-built only",
"ownerWhy": null,
"version": "",
"purpose": "AgentRuntime adapter option",
"polarity": "DECLARED, NOT ADOPTED",
"manifestLoc": "build_context"
}
],
"built": [
"agno",
"langgraph"
],
"man": []
},
{
"id": "gen-model",
"layer": "Models - generation",
"name": "The model that writes the answer",
"what": "The thing that turns retrieved figures and documents into a sentence a person reads.",
"kind": "CHOICE",
"choose": "The running system calls a hosted model over the internet. The manifest ships a small model that runs on your own hardware, with a licensed big model as an option for clients who already have one. HOSTED IS BETTER TODAY AND WORSE LATER: it is the best quality available, needs no hardware and no one to look after it, but you pay per answer forever, the bill grows exactly as the product succeeds, and you cannot sell it to an institution that will not let market-sensitive data leave its building. LOCAL IS THE REVERSE: a fixed hardware cost whatever the volume, no data leaving the estate, and a model you own - against real hardware spend, a skill you do not have in-house today, and a quality bar nobody has measured. Which is cheaper is arithmetic nobody has done, not a fact about either.",
"verdict": "Build both behind the switch that already exists, and put a date on the local one. The adapter is cheap; the assumptions that spread while it is undecided are not.",
"recommends": [
"openai",
"Qwen3-4B"
],
"builtFact": null,
"manFact": null,
"items": [
{
"name": "openai",
"side": "as-built only",
"ownerWhy": null,
"version": "",
"purpose": "Chat completions and embeddings client used directly and via agno",
"polarity": "NOT PRESENT",
"manifestLoc": ""
},
{
"name": "Qwen3-4B",
"side": "manifest only",
"ownerWhy": null,
"version": "",
"purpose": "",
"polarity": "TARGET STACK",
"manifestLoc": "build_context.pinned_stack.models"
}
],
"built": [
"openai"
],
"man": [
"Qwen3-4B"
]
},
{
"id": "local-runtime",
"layer": "Models - generation",
"name": "Running a model on your own machine",
"what": "The libraries needed to load and run a model locally rather than calling one over the internet.",
"kind": "RUNNING_ONLY",
"choose": "These five are already installed and nothing imports them - they arrived as dependencies of something else. They are the largest single contributor to the size of the shipped image and to the list of security patches somebody has to track, and today they do nothing at all. They are also exactly what the local model above would need. So they are either dead weight or foundations, and which one depends entirely on the hosted-versus-local decision.",
"verdict": "Do not remove them on reflex and do not keep them by accident. If local is committed they become first-class and get pinned. If not, they leave the image. The one option with no argument for it is today's: installed, unpinned, unused and shipped.",
"recommends": "OWNER",
"builtFact": null,
"manFact": null,
"items": [
{
"name": "torch",
"side": "as-built only",
"ownerWhy": null,
"version": "",
"purpose": "Pulled in by agno / transformers; no direct import found in source — not used for local model inference",
"polarity": "NOT PRESENT",
"manifestLoc": ""
},
{
"name": "transformers",
"side": "as-built only",
"ownerWhy": null,
"version": "",
"purpose": "Pulled in by agno / transformers; no direct import found in source — not used for local model inference",
"polarity": "NOT PRESENT",
"manifestLoc": ""
},
{
"name": "tokenizers",
"side": "as-built only",
"ownerWhy": null,
"version": "",
"purpose": "Pulled in by agno / transformers; no direct import found in source — not used for local model inference",
"polarity": "NOT PRESENT",
"manifestLoc": ""
},
{
"name": "huggingface-hub",
"side": "as-built only",
"ownerWhy": null,
"version": "",
"purpose": "Pulled in by agno / transformers; no direct import found in source — not used for local model inference",
"polarity": "NOT PRESENT",
"manifestLoc": ""
},
{
"name": "safetensors",
"side": "as-built only",
"ownerWhy": null,
"version": "",
"purpose": "Pulled in by agno / transformers; no direct import found in source — not used for local model inference",
"polarity": "NOT PRESENT",
"manifestLoc": ""
}
],
"built": [
"torch",
"transformers",
"tokenizers",
"huggingface-hub",
"safetensors"
],
"man": []
},
{
"id": "embed-model",
"layer": "Models - embedding",
"name": "Turning text into numbers so it can be searched",
"what": "Every document is converted into a long list of numbers. Search works by finding the documents whose numbers are closest to the question's numbers. How LONG that list is decides both how good the search is and how much memory it costs.",
"kind": "CHOICE",
"choose": "The running system uses a hosted model producing a list of 1,536 numbers per chunk, deliberately trimmed down from 3,072 because the database index refuses to go above 2,000. The manifest specifies a small local model producing 384. THE DIFFERENCE IS FOUR TIMES THE MEMORY - roughly 6 KB per chunk against 1.5 KB - which also means four times the time to build the index and a search that stops fitting in memory four times sooner. When it stops fitting, search goes from instant to slow, and that is a cliff rather than a slope. Against that, the bigger model genuinely finds better matches, and a missed document in regulatory work is a wrong answer rather than a slow one. THE MANIFEST HAS ALREADY WRITTEN 384 INTO THE DATABASE with a constraint that blocks anything else, and names 1,536 by name as a proof-of-concept size that is not used - so the running system and the specification physically disagree. But the manifest's own rule is subtler than it looks: it says the width must be AGREED everywhere, not that it must be 384.",
"verdict": "Measure the two on your real documents and rule on the result. This is the one decision that gets more expensive every single month, because changing it later means re-processing every document you have ingested by then.",
"recommends": "OWNER",
"builtFact": "R-DIM",
"manFact": null,
"items": [
{
"name": "all-MiniLM-L6-v2",
"side": "manifest only",
"ownerWhy": null,
"version": "",
"purpose": "",
"polarity": "TARGET STACK",
"manifestLoc": "build_context.pinned_stack.models"
}
],
"built": [],
"man": [
"all-MiniLM-L6-v2"
]
},
{
"id": "relational-vector",
"layer": "Data store and vector index",
"name": "Where everything is stored, and how similar-document search works",
"what": "One ordinary database, with an add-on that lets it also do similarity search - so there is no separate search system to run.",
"kind": "AGREED",
"choose": "Both sides agree, which is a significant piece of luck: every disagreement in this document is about what goes IN the store, not about what the store is. One thing to confirm - the report says Postgres but never says which version, so matching the manifest's 16 is assumed rather than checked.",
"verdict": "Keep it. Confirm which major version of Postgres is actually running, because the report never says and matching the manifest is currently an assumption rather than a checked fact.",
"recommends": [
"PostgreSQL 16",
"pgvector"
],
"builtFact": null,
"manFact": null,
"items": [
{
"name": "PostgreSQL 16",
"side": "both",
"ownerWhy": null,
"version": "",
"purpose": "",
"polarity": "TARGET STACK",
"manifestLoc": "build_context.pinned_stack.database"
},
{
"name": "pgvector",
"side": "both",
"ownerWhy": null,
"version": "",
"purpose": "Vector column type + similarity operators in Postgres",
"polarity": "TARGET STACK",
"manifestLoc": "build_context.pinned_stack.database"
}
],
"built": [
"PostgreSQL 16",
"pgvector"
],
"man": [
"PostgreSQL 16",
"pgvector"
]
},
{
"id": "other-vector-store",
"layer": "Data store and vector index",
"name": "A second, separate search system",
"what": "A standalone search database, as an alternative to doing search inside Postgres.",
"kind": "RUNNING_ONLY",
"choose": "Neither side wants one. This is pinned in the dependency list and imported nowhere - it costs image size and a security-patch obligation, and it makes any reader believe a second search system is in play when it is not. The report found this itself, which is more than most codebases can say.",
"verdict": "Remove it from the dependency list. One line of work: it makes the shipped image smaller and removes a component somebody would otherwise keep patching for no reason.",
"recommends": [],
"builtFact": null,
"manFact": null,
"items": [
{
"name": "weaviate-client",
"side": "as-built only",
"ownerWhy": null,
"version": "",
"purpose": "unused pinned but not imported anywhere in source",
"polarity": "NOT PRESENT",
"manifestLoc": ""
}
],
"built": [
"weaviate-client"
],
"man": []
},
{
"id": "db-access",
"layer": "Data access and migration",
"name": "How code talks to the database",
"what": "The library that turns code into SQL and back.",
"kind": "CHOICE",
"choose": "The running system talks to the database from Python, through four overlapping libraries. The manifest has the Java service do it, with the SQL kept in separate files rather than buried in code. Two things are being decided at once here and they are worth separating. WHO writes is the architectural question above. HOW is smaller and clearer: SQL in its own file can be read and reviewed by someone who is not a programmer, which matters when a regulator asks what a query does. Note also that the manifest names SQLAlchemy only to record a fault - error messages from raw queries carry the query and its values into logs.",
"verdict": "Settle who writes first; the library follows from it. Fix the leaking error messages regardless of the answer.",
"recommends": "OWNER",
"builtFact": null,
"manFact": null,
"items": [
{
"name": "SQLAlchemy",
"side": "as-built only",
"ownerWhy": null,
"version": "",
"purpose": "Sync ORM/engine for Postgres",
"polarity": "RECORDED AS A DEFECT",
"manifestLoc": "LP-33, build_context"
},
{
"name": "asyncpg",
"side": "as-built only",
"ownerWhy": null,
"version": "",
"purpose": "Async Postgres driver/pool",
"polarity": "NOT PRESENT",
"manifestLoc": ""
},
{
"name": "psycopg",
"side": "as-built only",
"ownerWhy": null,
"version": "",
"purpose": "Additional sync Postgres drivers",
"polarity": "NOT PRESENT",
"manifestLoc": ""
},
{
"name": "psycopg2-binary",
"side": "as-built only",
"ownerWhy": null,
"version": "",
"purpose": "Additional sync Postgres drivers",
"polarity": "NOT PRESENT",
"manifestLoc": ""
},
{
"name": "NamedParameterJdbcTemplate",
"side": "manifest only",
"ownerWhy": null,
"version": "",
"purpose": "",
"polarity": "TARGET STACK",
"manifestLoc": "build_context.pinned_stack.backend"
}
],
"built": [
"SQLAlchemy",
"asyncpg",
"psycopg",
"psycopg2-binary"
],
"man": [
"NamedParameterJdbcTemplate"
]
},
{
"id": "migration-runner",
"layer": "Data access and migration",
"name": "Applying database changes safely",
"what": "The tool that applies changes to the database's structure in order, and keeps track of which ones have already run.",
"kind": "CHOICE",
"choose": "The running system applies plain SQL files itself. The manifest uses a tool that records a fingerprint of every applied file and STOPS DEAD if one has been edited since. That sounds fussy until you see the failure it prevents: two environments both report 'up to date' while actually running different structures, with nothing recording which is which - and it surfaces months later as one environment producing a believable figure and its twin producing a different believable figure.",
"verdict": "Adopt the tool and the stop-dead behaviour. This is cheap and the failure it prevents is close to undiagnosable.",
"recommends": [
"Flyway"
],
"builtFact": "R-STORAGE",
"manFact": null,
"items": [
{
"name": "Flyway",
"side": "manifest only",
"ownerWhy": null,
"version": "",
"purpose": "",
"polarity": "TARGET STACK",
"manifestLoc": "build_context.pinned_stack.database"
}
],
"built": [],
"man": [
"Flyway"
]
},
{
"id": "migration-testing",
"layer": "Data access and migration",
"name": "Checking database changes before they run",
"what": "Reading the SQL in a test to catch mistakes, without having to start a real database.",
"kind": "RUNNING_ONLY",
"choose": "Only the running system has this, and it is good. It makes tests fast and cheap, and it catches real errors before anything is applied. The manifest has no equivalent and does not mention it.",
"verdict": "The clearest case in this whole review of something the running system holds that the specification should take. Write it into the manifest.",
"recommends": [
"pglast"
],
"builtFact": null,
"manFact": null,
"items": [
{
"name": "pglast",
"side": "as-built only",
"ownerWhy": null,
"version": "",
"purpose": "Dev-only — parses migration SQL for tests without a live Postgres",
"polarity": "NOT PRESENT",
"manifestLoc": ""
}
],
"built": [
"pglast"
],
"man": []
},
{
"id": "pdf-read",
"layer": "Document parsing and OCR",
"name": "Getting the text out of a PDF",
"what": "Reading a filing so its words and figures can be searched and quoted.",
"kind": "CHOICE",
"choose": "The running system uses a simple reader that pulls out the text layer and nothing else. It has no idea what the page LOOKS like - so a two-column filing comes back with sentences alternating across the page, and a table comes back as a run of loose numbers with the rows and columns gone. The manifest uses a reader with a layout model that knows where things sit on the page. FOR REGULATORY FILINGS THE TABLE IS THE CONTENT, so this is not a quality improvement, it is the difference between usable and not. The sting is that the simple reader does not fail - it returns every word, so any check that counts words scores it perfect. The cost is honest: the better reader is a second service with its own image, its own models and its own delay, against two small libraries that need no infrastructure at all.",
"verdict": "Adopt the layout-aware reader, and keep the simple one for plain text files where layout adds nothing. Paying for a layout model on a .txt file is waste, not rigour.",
"recommends": [
"Docling",
"docling-serve",
"pypdf"
],
"builtFact": null,
"manFact": null,
"items": [
{
"name": "pypdf",
"side": "as-built only",
"ownerWhy": null,
"version": "",
"purpose": "Text-only extraction from PDF pages during ingestion",
"polarity": "NOT PRESENT",
"manifestLoc": ""
},
{
"name": "Docling",
"side": "manifest only",
"ownerWhy": null,
"version": "",
"purpose": "",
"polarity": "TARGET STACK",
"manifestLoc": "build_context.pinned_stack.document_parsing"
},
{
"name": "docling-serve",
"side": "manifest only",
"ownerWhy": null,
"version": "",
"purpose": "",
"polarity": "TARGET STACK",
"manifestLoc": "build_context.pinned_stack.document_parsing"
}
],
"built": [
"pypdf"
],
"man": [
"Docling",
"docling-serve"
]
},
{
"id": "table-structure",
"layer": "Document parsing and OCR",
"name": "Recognising that a table IS a table",
"what": "A model that works out which numbers belong in which row and column.",
"kind": "MANIFEST_ONLY",
"choose": "The running system has nothing for this at all. That is the specific mechanism behind the row above: without a table model, a table is just numbers in reading order, and nothing downstream can tell that 4.2 belonged to the second column of row seven. There is no as-built alternative to weigh - the choice is have it or do not.",
"verdict": "Comes with the layout-aware reader. It is the main reason to adopt it.",
"recommends": [
"TableFormer"
],
"builtFact": null,
"manFact": null,
"items": [
{
"name": "TableFormer",
"side": "manifest only",
"ownerWhy": null,
"version": "",
"purpose": "",
"polarity": "TARGET STACK",
"manifestLoc": "build_context.pinned_stack.document_parsing"
}
],
"built": [],
"man": [
"TableFormer"
]
},
{
"id": "word-docs",
"layer": "Document parsing and OCR",
"name": "Reading Word documents",
"what": "Pulling paragraphs and tables out of a .docx file.",
"kind": "RUNNING_ONLY",
"choose": "Only the running system names a library for this. The layout-aware reader handles Word files too, so this could be retired - but it does not have to be. A plain Word document has a structure the file itself already describes; there is nothing for a layout model to work out, so running one is pure cost.",
"verdict": "Keep it, and route by file type: the heavy reader for PDFs, the light one for the rest.",
"recommends": [
"python-docx"
],
"builtFact": null,
"manFact": null,
"items": [
{
"name": "python-docx",
"side": "as-built only",
"ownerWhy": null,
"version": "",
"purpose": "Paragraph and table text extraction from .docx",
"polarity": "NOT PRESENT",
"manifestLoc": ""
}
],
"built": [
"python-docx"
],
"man": []
},
{
"id": "ocr",
"layer": "Document parsing and OCR",
"name": "Reading a scanned page that has no text in it",
"what": "Turning a picture of a page into words. Needed for anything that was scanned rather than produced digitally.",
"kind": "CHOICE",
"choose": "The running system has NO OCR of any kind - the report checked for all the usual engines and found none - so a scanned filing is rejected, marked failed with the reason attached, and kept but never searchable. That is honest behaviour and better than a silent empty result. The manifest adds an engine, and three conditions that look like fussiness and are not. FIRST, the engine must be named explicitly, because the library's default setting lets it pick its own at run time - and in a bank, discovering in production that a component arrived under an unexpected licence is a procurement problem, not a technical one. SECOND, the language must be stated, because the default is Chinese. THIRD, and largest: turning OCR on BLINDS THE CHECK THAT WOULD CATCH IT GOING WRONG, because a second opinion sees nothing on a scanned page, so coverage computes as perfect against nothing at all. One number worth carrying: on a 78-page report, 99.9% character accuracy - about the best good OCR manages on a clean scan - is roughly eight wrong figures. Eight wrong figures in a filing is eight misstatements, not a 99.9% success.",
"verdict": "Add it, take all three conditions with it, and keep the loud rejection for anything OCR itself declines. Do not accept a percentage as the acceptance standard.",
"recommends": [
"RapidOCR"
],
"builtFact": "R-OCR0",
"manFact": null,
"items": [
{
"name": "RapidOCR",
"side": "manifest only",
"ownerWhy": null,
"version": "",
"purpose": "",
"polarity": "TARGET STACK",
"manifestLoc": "build_context.pinned_stack.ocr"
}
],
"built": [],
"man": [
"RapidOCR"
]
},
{
"id": "object-store",
"layer": "Object storage",
"name": "Keeping the original uploaded file",
"what": "Somewhere to put the actual PDF, separate from the database, so the source is never lost.",
"kind": "RUNNING_ONLY",
"choose": "Only the running system names anything, and it is well done - a swappable choice of storage, and a failed parse KEEPS the uploaded file rather than discarding it. The manifest names no storage at all, yet its evidence work depends on one. So both sides need this and only one wrote it down. There is one genuine disagreement buried underneath: on a storage failure the running system keeps the file and marks the document failed, while the manifest rolls the entire record back. Those are different promises about the same event.",
"verdict": "Write the storage into the manifest, and settle the failure behaviour deliberately rather than letting two answers coexist.",
"recommends": [
"boto3",
"google-cloud-storage"
],
"builtFact": null,
"manFact": null,
"items": [
{
"name": "boto3",
"side": "as-built only",
"ownerWhy": null,
"version": "",
"purpose": "S3 ObjectStore adapter option",
"polarity": "NOT PRESENT",
"manifestLoc": ""
},
{
"name": "google-cloud-storage",
"side": "as-built only",
"ownerWhy": null,
"version": "",
"purpose": "GCS object storage adapter (legacy platform pattern)",
"polarity": "NOT PRESENT",
"manifestLoc": ""
}
],
"built": [
"boto3",
"google-cloud-storage"
],
"man": []
},
{
"id": "cache",
"layer": "Cache",
"name": "Keeping frequently-used data close by",
"what": "A fast temporary store, so the same lookup is not repeated on every request.",
"kind": "RUNNING_ONLY",
"choose": "The cache itself is uncontroversial and both sides would want one. THE PROBLEM IS WHAT IS IN IT. The as-built report lists this as caching 'dataset names, sample data and columns'. The manifest describes the same code differently: three real rows from a client's ledger are cached at start-up and then SENT TO AN OUTSIDE MODEL on every rule-generation call. Both descriptions are true and only one of them names the risk, which is exactly why it has survived - nothing about the dependency list looks wrong. Masking is not the fix either: a masked ledger row still reveals how many rows there are, what the columns are called, and how varied the values are.",
"verdict": "Keep the cache. Stop sending real rows: describe the data instead - the dataset name, the column names, the types - and refuse actual values at the boundary. This one needs a name and a date, not a backlog entry.",
"recommends": [
"redis"
],
"builtFact": null,
"manFact": null,
"items": [
{
"name": "redis",
"side": "as-built only",
"ownerWhy": null,
"version": "",
"purpose": "Caches dataset names / sample data / columns for the rule generator tool",
"polarity": "NOT PRESENT",
"manifestLoc": ""
}
],
"built": [
"redis"
],
"man": []
},
{
"id": "policy",
"layer": "Policy and authorization",
"name": "Deciding what is and is not allowed",
"what": "Where the rules live: who may do what, which data may go where, and what the system refuses to do.",
"kind": "MANIFEST_ONLY",
"choose": "The manifest keeps every rule in a separate policy service, written in a rule language and versioned on its own. The running system has none of this - every refusal is an `if` statement somewhere in the code. THE DIFFERENCE IS WHAT YOU CAN SHOW SOMEONE. Asked 'show me the rule that stopped this', a rule file is an answer and a code review is not. It also matters that the same rule then applies everywhere at once, rather than being re-implemented slightly differently in each place that needs it. The cost is real: another service to run and another artefact to keep current.",
"verdict": "The largest thing on the list that has not been started. Begin with the two smallest useful rules - which tools a skill may call, and what may leave the building - because both turn behaviour that already exists into a stated rule without needing any new product.",
"recommends": [
"OPA/Rego"
],
"builtFact": null,
"manFact": null,
"items": [
{
"name": "OPA/Rego",
"side": "manifest only",
"ownerWhy": null,
"version": "",
"purpose": "",
"polarity": "TARGET STACK",
"manifestLoc": "build_context.pinned_stack.identity_authz"
}
],
"built": [],
"man": [
"OPA/Rego"
]
},
{
"id": "identity",
"layer": "Identity, config and secrets",
"name": "Proving who is asking",
"what": "Signing a user in, and giving the services a trustworthy answer to 'who is this'.",
"kind": "CHOICE",
"choose": "The running system has the building blocks - libraries for sign-in flows and for signing - but names no actual identity system, so from the report alone you cannot tell what authenticates a caller today. The manifest names a full identity server and a signed token between services. THIS ROW MATTERS MORE THAN IT LOOKS, because the manifest's rule for keeping one client's data away from another depends entirely on there being a verified identity to read the client from. No verified identity, no separation.",
"verdict": "Find out what authenticates a caller today before anything else on this page is scheduled. This and client separation are the same investigation.",
"recommends": "OWNER",
"builtFact": null,
"manFact": null,
"items": [
{
"name": "Authlib",
"side": "as-built only",
"ownerWhy": null,
"version": "",
"purpose": "Auth flows and signing/encryption primitives",
"polarity": "NOT PRESENT",
"manifestLoc": ""
},
{
"name": "cryptography",
"side": "as-built only",
"ownerWhy": null,
"version": "",
"purpose": "Auth flows and signing/encryption primitives",
"polarity": "NOT PRESENT",
"manifestLoc": ""
},
{
"name": "Keycloak",
"side": "manifest only",
"ownerWhy": null,
"version": "",
"purpose": "",
"polarity": "TARGET STACK",
"manifestLoc": "build_context.pinned_stack.identity_authz"
},
{
"name": "service-JWT",
"side": "manifest only",
"ownerWhy": null,
"version": "",
"purpose": "",
"polarity": "TARGET STACK",
"manifestLoc": "build_context.pinned_stack.identity_authz"
}
],
"built": [
"Authlib",
"cryptography"
],
"man": [
"Keycloak",
"service-JWT"
]
},
{
"id": "config-validation",
"layer": "Identity, config and secrets",
"name": "Checking that settings and inputs are valid",
"what": "Describing the shape data should have, and rejecting it politely when it does not.",
"kind": "AGREED",
"choose": "Both sides agree on the approach and there is nothing to weigh. Worth one line only because it is doing real work quietly: this is what turns a malformed request into a clear error instead of a crash.",
"verdict": "Keep it as is. The only thing worth adding later is that these same descriptions can generate the published interface documentation the manifest asks for and the running system does not yet produce.",
"recommends": [
"pydantic",
"pydantic-settings"
],
"builtFact": null,
"manFact": null,
"items": [
{
"name": "pydantic",
"side": "both",
"ownerWhy": null,
"version": "",
"purpose": "Request/response schemas and typed settings ( VarianceSettings )",
"polarity": "TARGET STACK",
"manifestLoc": "build_context.pinned_stack.python_service"
},
{
"name": "pydantic-settings",
"side": "as-built only",
"ownerWhy": null,
"version": "",
"purpose": "Request/response schemas and typed settings ( VarianceSettings )",
"polarity": "NOT PRESENT",
"manifestLoc": ""
}
],
"built": [
"pydantic",
"pydantic-settings"
],
"man": [
"pydantic"
]
},
{
"id": "config-files-secrets",
"layer": "Identity, config and secrets",
"name": "Where settings and passwords live",
"what": "How the system finds its configuration, and where its keys are kept.",
"kind": "RUNNING_ONLY",
"choose": "The running system reads settings from a local file, which is normal for development and is the thing that must not survive into a real deployment - the file currently holds a live API key. The manifest requires settings to come from outside the code and no secrets in the repository. One specific check while you are there: the YAML reader has a mode that will execute whatever the file tells it to. If any configuration comes from anywhere not fully trusted, using the safe mode is a security control rather than a style preference.",
"verdict": "Move secrets into the deployment's own secret store. Confirm every YAML read uses the safe mode.",
"recommends": [
"PyYAML"
],
"builtFact": null,
"manFact": null,
"items": [
{
"name": "python-dotenv",
"side": "as-built only",
"ownerWhy": null,
"version": "",
"purpose": "Loads .env (holds OPENAI_API_KEY )",
"polarity": "NOT PRESENT",
"manifestLoc": ""
},
{
"name": "PyYAML",
"side": "as-built only",
"ownerWhy": null,
"version": "",
"purpose": "YAML config parsing",
"polarity": "NOT PRESENT",
"manifestLoc": ""
}
],
"built": [
"python-dotenv",
"PyYAML"
],
"man": []
},
{
"id": "llm-tracing",
"layer": "Observability",
"name": "Recording what the AI was asked and what it said",
"what": "Keeping a trace of each model call so a slow or odd answer can be investigated.",
"kind": "RUNNING_ONLY",
"choose": "Only the running system has this, and it is useful. But it deserves a second look for a reason that has nothing to do with observability: TRACING CAPTURES THE PROMPT, and prompts on this platform can contain market-sensitive material. So a hosted trace service is another route by which data leaves the building - the same shape as the cache problem above, in a different costume. The manifest mentions this tool exactly once, in a note recording that it is missing from a specification where it should have been.",
"verdict": "Keep it, and classify what it captures. Whatever it records should pass the same leaving-the-building check as any other outbound call.",
"recommends": [
"langfuse"
],
"builtFact": null,
"manFact": null,
"items": [
{
"name": "langfuse",
"side": "as-built only",
"ownerWhy": null,
"version": "",
"purpose": "LLM call tracing for VarianceAI ( VAI_LLM_TRACING )",
"polarity": "RECORDED AS ABSENT",
"manifestLoc": "meta"
}
],
"built": [
"langfuse"
],
"man": []
},
{
"id": "telemetry",
"layer": "Observability",
"name": "Knowing whether the system is healthy",
"what": "Two separate things that get talked about as one: the INSTRUMENTATION that produces telemetry from your code, and the STORE that keeps it and answers questions about it.",
"kind": "CHOICE",
"choose": "THIS ROW WAS WRONG AND IS CORRECTED. It read 'two different tools for roughly one job, installed on two different sides' and recommended picking one. They are not the same layer. OpenTelemetry is instrumentation and transport - not a database, not a UI. Prometheus is the store: its own time-series database, a pull model, and the query language on top. Asking which to keep is like asking whether to keep the thermometer or the logbook. WHAT WAS ACTUALLY TRUE about the running system is narrower: it carries an OTel SDK AND langfuse, which are two TRACING paths, and that duplication is real. The metrics store was never in competition with either. THEY ALSO COMPOSE DIRECTLY NOW, which they did not when the manifest was written: Prometheus 3 ships a native OTLP receiver, so an OTel SDK pushes metrics straight to it with no Collector, and UTF-8 metric names mean OTel's dotted conventions need no hand translation. The Collector earns its place when traces and logs want processing on the same pipeline, not for metrics alone. THE COST OF ADOPTING OTel IS NOT OPERATIONAL, IT IS EXPOSURE. Auto-instrumentation records what the conventions say to record, not what a developer chose: db.statement and http.target become span attributes, and on this platform either can carry a ledger value. That is a new egress path and it is the reason to enable auto-instrumentation per library with redaction configured first, rather than wholesale.",
"verdict": "Take BOTH, because they are not alternatives: OpenTelemetry to instrument, Prometheus to store, joined by the native OTLP receiver. What genuinely does need resolving is the duplicate TRACING path - an OTel SDK and langfuse both capturing model calls - and that is a smaller question than the one this row used to pose.",
"recommends": [
"opentelemetry-*",
"Prometheus"
],
"builtFact": null,
"manFact": null,
"items": [
{
"name": "opentelemetry-*",
"side": "as-built only",
"ownerWhy": null,
"version": "",
"purpose": "Alternative/parallel tracing backend",
"polarity": "NOT PRESENT",
"manifestLoc": ""
},
{
"name": "Prometheus",
"side": "manifest only",
"ownerWhy": null,
"version": "",
"purpose": "",
"polarity": "TARGET STACK",
"manifestLoc": "build_context.pinned_stack.observability"
}
],
"built": [
"opentelemetry-*"
],
"man": [
"Prometheus"
]
},
{
"id": "logging",
"layer": "Observability",
"name": "Writing down what happened",
"what": "The running commentary a support engineer reads at three in the morning.",
"kind": "RUNNING_ONLY",
"choose": "Only the running system names a library; the manifest states the requirement - structured entries carrying no secrets and no sensitive data - without naming a tool. Those are compatible. The live concern is not the library but what gets written: the manifest identifies a pattern in this codebase where raw error text is passed straight through, and raw database errors carry the query and its values with them.",
"verdict": "Keep the library. Audit what actually reaches the log on a database failure.",
"recommends": [
"loguru"
],
"builtFact": null,
"manFact": null,
"items": [
{
"name": "loguru",
"side": "as-built only",
"ownerWhy": null,
"version": "",
"purpose": "Structured application logging",
"polarity": "NOT PRESENT",
"manifestLoc": ""
}
],
"built": [
"loguru"
],
"man": []
},
{
"id": "frontend",
"layer": "Front end",
"name": "The screens themselves",
"what": "The user interface: how it is built, how it is styled, how it draws charts.",
"kind": "MANIFEST_ONLY",
"choose": "Only the manifest names any of this, and that is CORRECT rather than a gap - the service being reviewed has no user interface at all, by design. One constraint is worth carrying to whoever builds the first screen, because it is far cheaper to hold from the start than to retrofit: no colours or logos baked into components, everything through named settings. That is what makes a client's own logo and stylesheet possible, and a single hard-coded colour in an early component is how that quietly stops being true.",
"verdict": "Nothing to decide here. Hold the no-hard-coded-branding rule from the first component.",
"recommends": [
"React 18",
"MUI",
"TypeScript",
"Zustand",
"recharts",
"lucide-react"
],
"builtFact": null,
"manFact": null,
"items": [
{
"name": "React 18",
"side": "manifest only",
"ownerWhy": null,
"version": "",
"purpose": "",
"polarity": "TARGET STACK",
"manifestLoc": "build_context.pinned_stack.frontend"
},
{
"name": "MUI",
"side": "manifest only",
"ownerWhy": null,
"version": "",
"purpose": "",
"polarity": "TARGET STACK",
"manifestLoc": "build_context.pinned_stack.frontend"
},
{
"name": "TypeScript",
"side": "manifest only",
"ownerWhy": null,
"version": "",
"purpose": "",
"polarity": "TARGET STACK",
"manifestLoc": "build_context.pinned_stack.frontend"
},
{
"name": "Zustand",
"side": "manifest only",
"ownerWhy": null,
"version": "",
"purpose": "",
"polarity": "TARGET STACK",
"manifestLoc": "build_context.pinned_stack.frontend"
},
{
"name": "recharts",
"side": "manifest only",
"ownerWhy": null,
"version": "",
"purpose": "",
"polarity": "TARGET STACK",
"manifestLoc": "build_context.pinned_stack.frontend"
},
{
"name": "lucide-react",
"side": "manifest only",
"ownerWhy": null,
"version": "",
"purpose": "",
"polarity": "TARGET STACK",
"manifestLoc": "build_context.pinned_stack.frontend"
}
],
"built": [],
"man": [
"React 18",
"MUI",
"TypeScript",
"Zustand",
"recharts",
"lucide-react"
]
},
{
"id": "embed-ui",
"layer": "Front end",
"name": "Putting Lextr screens inside someone else's application",
"what": "The mechanism that lets a Lextr screen appear inside a host product rather than as a separate site.",
"kind": "MANIFEST_ONLY",
"choose": "Only the manifest names it, and it follows from a decision already taken - several use cases are meant to appear inside the client's own product rather than standing alone. The choice being made is between shipping components the host compiles in, loading them at run time, or wrapping them so any framework can use them. They differ mainly in who has to rebuild when Lextr ships a change.",
"verdict": "Decide when the first embedded screen is built, not before.",
"recommends": "OWNER",
"builtFact": null,
"manFact": null,
"items": [
{
"name": "Module Federation",
"side": "manifest only",
"ownerWhy": null,
"version": "",
"purpose": "",
"polarity": "TARGET STACK",
"manifestLoc": "build_context.pinned_stack.frontend"
}
],
"built": [],
"man": [
"Module Federation"
]
},
{
"id": "graph-store",
"layer": "Graph",
"name": "Storing how figures are calculated from one another",
"what": "A store built for relationships - so 'which numbers feed this total, and which feed those' can be followed without a hundred database joins.",
"kind": "MANIFEST_ONLY",
"choose": "Only the manifest names one, and nothing is built against it yet. One thing here should NOT be left to drift: the licence. The tool named is offered under terms that, for software installed inside a bank, is a commercial and legal question rather than a technical one - and those move on a scale of quarters. The manifest itself records the question as open. Open is a perfectly good state for a decision nobody needs yet, right up until several capabilities are half-built against it.",
"verdict": "Start the licence conversation now. The alternatives differ enough that switching late is a rewrite, so the cost of deciding late is not the licence fee - it is the code written in the meantime.",
"recommends": "OWNER",
"builtFact": null,
"manFact": null,
"items": [
{
"name": "Neo4j",
"side": "manifest only",
"ownerWhy": null,
"version": "",
"purpose": "",
"polarity": "TARGET STACK",
"manifestLoc": "build_context.pinned_stack.graph"
}
],
"built": [],
"man": [
"Neo4j"
]
},
{
"id": "graph-viz",
"layer": "Graph",
"name": "Drawing the calculation chain on screen",
"what": "Turning that web of relationships into a picture an analyst can follow. Two parts: the renderer that draws it, and the LAYOUT ENGINE that decides where each node goes.",
"kind": "MANIFEST_ONLY",
"choose": "Manifest only, and not yet built — except that the owner has now added ELK as a standard, so this row has three entries and only two jobs. Cytoscape.js is the RENDERER. Dagre and ELK are both LAYOUT ENGINES for it, reached through cytoscape-dagre and cytoscape-elk, and they are alternatives: picking both means two engines that place the same nodes differently. THE MANIFEST'S OWN GATE ARGUES FOR REPLACING DAGRE, and it is worth quoting because it was written before this decision: validation_gates.CYTO requires 'a LAYOUT ASSERTION: render a fixed fixture graph and assert node and edge COUNTS and that no node position is NaN — DAGRE RETURNS NaN FOR A DISCONNECTED NODE and the canvas then renders empty with no error.' That clause exists because of the engine it names. It also requires 'a DETERMINISM ASSERTION: the same fixture laid out twice produces the same positions, because a layout that varies per run cannot be screenshot-tested and cannot be reviewed' — which binds whichever engine is chosen. ELK APPEARS NOWHERE IN THE MANIFEST: zero word-boundary occurrences, against sixteen for Dagre, and pinned_stack.graph reads 'Cytoscape.js + Dagre'. So adopting it is a manifest edit, not just a selection here — otherwise a developer generating LP-17.2 builds against Dagre and nobody finds out until review.",
"verdict": "Take ELK with Cytoscape.js and drop Dagre. It is the owner's standard, and the manifest's own gate was written around the failure mode of the engine it replaces. Two things must follow or the decision does not land: pinned_stack.graph has to name ELK, and validation_gates.CYTO's NaN clause has to be re-read against ELK rather than inherited — a clause naming dagre's behaviour proves nothing about a different engine, and keeping it unchanged would leave a gate that reads as coverage and is not.",
"recommends": [
"Cytoscape.js",
"ELK"
],
"builtFact": null,
"manFact": null,
"items": [
{
"name": "Cytoscape.js",
"side": "manifest only",
"ownerWhy": null,
"version": "",
"purpose": "",
"polarity": "TARGET STACK",
"manifestLoc": "build_context.pinned_stack.graph"
},
{
"name": "Dagre",
"side": "manifest only",
"ownerWhy": null,
"version": "",
"purpose": "",
"polarity": "TARGET STACK",
"manifestLoc": "build_context.pinned_stack.graph"
},
{
"name": "ELK",
"side": "owner standard",
"ownerWhy": "Owner standard for graph layout, added 2026-09-13. Zero occurrences in the manifest and none in the as-built report - it is here because it was decided, not because it was found. pinned_stack.graph still reads 'Cytoscape.js + Dagre'; until that is edited the decision lives only in this file.",
"version": "",
"purpose": "Owner standard for graph layout, added 2026-09-13. Zero occurrences in the manifest and none in the as-built report - it is here because it was decided, not because it was found. pinned_stack.graph still reads 'Cytoscape.js + Dagre'; until that is edited the decision lives only in this file.",
"polarity": "OWNER STANDARD",
"manifestLoc": ""
}
],
"built": [],
"man": [
"Cytoscape.js",
"Dagre",
"ELK"
]
},
{
"id": "deploy",
"layer": "Packaging and deployment",
"name": "How the software is shipped and run",
"what": "Packaging the services and running them somewhere, whether that is your infrastructure or the client's.",
"kind": "MANIFEST_ONLY",
"choose": "Only the manifest names any of this. The running system is described as one application with no packaging discussed - and one deployable with clean internal seams is EASIER to operate than four, so this is not a criticism. It becomes a real question because of decisions elsewhere: the layout-aware reader, a local model and a policy service are three more things to run, and whether they are three more containers or three more processes depends on whether you are shipping to your own infrastructure or into a client's.",
"verdict": "Write down the deployment target. It decides the shape of the packaging work and it is currently being assumed rather than chosen.",
"recommends": [
"Docker",
"Kubernetes",
"Helm"
],
"builtFact": null,
"manFact": null,
"items": [
{
"name": "Docker",
"side": "manifest only",
"ownerWhy": null,
"version": "",
"purpose": "",
"polarity": "TARGET STACK",
"manifestLoc": "build_context.pinned_stack.deploy"
},
{
"name": "Kubernetes",
"side": "manifest only",
"ownerWhy": null,
"version": "",
"purpose": "",
"polarity": "TARGET STACK",
"manifestLoc": "build_context.pinned_stack.deploy"
},
{
"name": "Helm",
"side": "manifest only",
"ownerWhy": null,
"version": "",
"purpose": "",
"polarity": "TARGET STACK",
"manifestLoc": "build_context.pinned_stack.deploy"
}
],
"built": [],
"man": [
"Docker",
"Kubernetes",
"Helm"
]
},
{
"id": "dataframes",
"layer": "Supporting libraries",
"name": "Working with tables of numbers in code",
"what": "The standard tools for holding a table of data in memory and doing arithmetic on it.",
"kind": "RUNNING_ONLY",
"choose": "Only the running system names them and there is no real choice to make - the numerical one is unavoidable under anything involving embeddings. One observation rather than an objection: the table library is the one the 'sample rows sent outside' problem is written in. That is not an argument against it, but its use near anything that talks to an outside model deserves a look.",
"verdict": "Keep. Write them into the manifest so they are not invisible to whoever builds next.",
"recommends": [
"pandas",
"numpy"
],
"builtFact": null,
"manFact": null,
"items": [
{
"name": "pandas",
"side": "as-built only",
"ownerWhy": null,
"version": "",
"purpose": "Tabular data handling",
"polarity": "NOT PRESENT",
"manifestLoc": ""
},
{
"name": "numpy",
"side": "as-built only",
"ownerWhy": null,
"version": "",
"purpose": "Numeric/vector array operations",
"polarity": "NOT PRESENT",
"manifestLoc": ""
}
],
"built": [
"pandas",
"numpy"
],
"man": []
},
{
"id": "serialization",
"layer": "Supporting libraries",
"name": "A particular file format for structured data",
"what": "A compact format for passing structured records between systems.",
"kind": "RUNNING_ONLY",
"choose": "Only the running system has it, and the report gives it no purpose beyond the format's own name. Neither side describes anything that needs it, which makes it the second-best candidate after the unused search client for a dependency nobody actually needs.",
"verdict": "Check whether anything calls it. If not, drop it.",
"recommends": [],
"builtFact": null,
"manFact": null,
"items": [
{
"name": "fastavro",
"side": "as-built only",
"ownerWhy": null,
"version": "",
"purpose": "Avro serialization",
"polarity": "NOT PRESENT",
"manifestLoc": ""
}
],
"built": [
"fastavro"
],
"man": []
}
],
"itemCount": 68,
"ownerAdded": [
"ELK"
],
"factLabels": {
"R-ENTRY": "Two ingestion entry points",
"R-TYPES": "Accepted file types",
"R-PIPE": "Five-stage pipeline: Parse, Mask, Chunk, Embed, Upsert",
"R-CHUNK": "Chunk size and overlap",
"R-UPLOAD": "Maximum upload size",
"R-HYBRID": "Hybrid search weighting",
"R-DIM": "Embedding width, truncated from native 3072",
"R-CAP": "The manifest-side cap the report already knows about",
"R-STATE": "Document state machine",
"R-FAILSAFE": "A failed parse keeps the uploaded object",
"R-MASKFIRST": "Masking runs before embedding",
"R-DETERM": "Determinism invariant on structured calls",
"R-DEGRADE": "Reasoning-family models degrade determinism rather than fail",
"R-OCR0": "No OCR engine and no image library anywhere",
"R-OCRERR": "A scanned PDF fails loudly and stays unindexed",
"R-PORTS": "Five swappable ports",
"R-CFG": "Adapter selection by environment setting",
"R-VECONE": "Only one vector store adapter is implemented",
"R-DEGRADEVIS": "Misconfiguration degrades visibly",
"R-NOLOCK": "No pyproject.toml and no lockfile",
"R-WEAVIATE": "A pinned dependency nothing imports",
"R-DORMANT-ETL": "The MDRM/rule ETL is present in code and not running",
"R-DORMANT-EMB": "A second embedding integration is dormant",
"R-CONFIGSRV": "An external Spring-Cloud-style config server supplies runtime values",
"R-STORAGE": "Postgres is the system of record; Redis caches; GCS is the legacy object store",
"R-RERANK": "Reranking is an LLM call, not a cross-encoder",
"R-CONTENTHASH": "Content-hash ids make re-ingestion of unchanged text a no-op"
},
"consLabels": {
"M-384": "Embedding width is CHECK-pinned to 384",
"M-POC": "1536 and 768 are named POC-mode and NOT used",
"M-SIBLING": "A non-384 tenant gets a sibling table, not a widened column",
"M-NODB": "lexie-ai holds NO DB grant and never persists",
"M-SOLEWRITER": "intelligence-service is the sole DB writer",
"M-ONPREM": "On-prem runs no external LLM API; MNPI stays on-site",
"M-PINCOMMIT": "Parser models pinned BY COMMIT, never fetched at runtime",
"M-OCRLANG": "OCR engine pinned and language required, not defaulted",
"M-CLIENTID": "client_id mandatory and indexed on every scoped row",
"M-NORLS": "Tenant isolation is enforced in OPA, not RLS",
"M-NOPOLICYDB": "Policy is never stored in the database",
"M-NOJPA": "No JPA, no inline SQL, SQL externalized",
"M-HNSW2000": "pgvector HNSW refuses more than 2000 dimensions",
"M-AGREEMENT": "The width is gated by AGREEMENT across its readings, never by its value",
"M-MIGRIMMUT": "An applied migration is never edited; the runner halts",
"M-CATCHALL": "A catch-all that echoes str(e) is an MNPI leak",
"M-NOSAMPLE": "Actual values are refused in a grounding payload",
"M-CACHECLASS": "A sample-row cache carries its source dataset's classification"
},
"layers": [
"Runtime and API",
"Agent and orchestration",
"Models - generation",
"Models - embedding",
"Data store and vector index",
"Data access and migration",
"Document parsing and OCR",
"Object storage",
"Cache",
"Policy and authorization",
"Identity, config and secrets",
"Observability",
"Front end",
"Graph",
"Packaging and deployment",
"Supporting libraries"
]
};

/* THE OWNER'S DECISIONS OF 2026-09-13, PRELOADED so the file opens where they left off.
   Selections only - no comments were recorded in that pass, and inventing one would put
   words in the reviewer's mouth. Two things will read differently than they did then, and
   both are fixes rather than changes of position:
     * gen-model and pdf-read no longer raise a STOP. Selecting both sides IS the
       recommendation on those two, and the warning did not know that.
     * five jobs that read "deferred to you" now read "you decided", because a selection
       had in fact been made - including the embedding width and the graph store, which
       are one-way doors.
   graph-viz will read DIVERGE: it carries Dagre from that pass while the recommendation
   is now ELK. That is the file telling the truth about a decision taken since, not an
   error. */
const PRELOAD = {"fastapi": "selected", "starlette": "selected", "uvicorn": "selected", "python-multipart": "selected", "Python 3": "selected", "Java 17": "selected", "Spring Boot": "selected", "Jackson": "selected", "STOMP": "selected", "agno": "selected", "openai": "selected", "Qwen3-4B": "selected", "all-MiniLM-L6-v2": "selected", "PostgreSQL 16": "selected", "pgvector": "selected", "Flyway": "selected", "pglast": "selected", "pypdf": "selected", "Docling": "selected", "docling-serve": "selected", "TableFormer": "selected", "python-docx": "selected", "RapidOCR": "selected", "boto3": "selected", "google-cloud-storage": "selected", "redis": "selected", "OPA/Rego": "selected", "Keycloak": "selected", "service-JWT": "selected", "pydantic": "selected", "pydantic-settings": "selected", "PyYAML": "selected", "langfuse": "selected", "opentelemetry-*": "selected", "loguru": "selected", "React 18": "selected", "MUI": "selected", "TypeScript": "selected", "Zustand": "selected", "recharts": "selected", "lucide-react": "selected", "Module Federation": "selected", "Neo4j": "selected", "Cytoscape.js": "selected", "ELK": "selected", "NamedParameterJdbcTemplate": "selected", "Docker": "selected", "Kubernetes": "selected", "Helm": "selected", "pandas": "selected", "numpy": "selected", "Dagre": "rejected", "SQLAlchemy": "rejected", "asyncpg": "rejected", "psycopg": "rejected", "psycopg2-binary": "rejected", "Prometheus": "rejected"};
const PRELOAD_NOTE = "Loaded the owner's decisions as recorded. Selections and rejections "
  + "only - no comments have been recorded on any job, and eleven soft warnings are asking "
  + "for them.";

const FILENAME = "lextr-stack-decision.json";

const REC_LABEL = {
  ownerDecided: "no recommendation — you decided",
  match: "your selection matches it",
  diverge: "you have chosen differently",
  undecided: "not yet decided",
  deferred: "deferred to you",
};

const KIND_LABEL = {
  CHOICE: "both sides answer, differently",
  AGREED: "both sides answer the same way",
  RUNNING_ONLY: "only in the running system",
  MANIFEST_ONLY: "only in the manifest",
};

/* ------------------------------------------------------------- utilities --- */
const nextState = s => (s === "selected" ? "rejected" : s === "rejected" ? "undecided" : "selected");
const sideOf = it => (it.side === "both" ? "agreed" : it.side === "as-built only" ? "built" : "manifest");

/* HOW A SELECTION IS COMPARED TO THE RECOMMENDATION.
   Comparing SETS, not lists, and only over the items this job actually offers - so a
   different click order is not a divergence, and neither is an item from another job. */
function recStatus(job, sel, nothing) {
  if (job.recommends === "OWNER") {
    /* DEFERRED IS A STATE OF THE RECOMMENDATION, NOT OF THE DECISION, and returning it
       regardless masked the thing that matters most. In the first export five of the
       seven deferred jobs HAD been decided - including the embedding width and the graph
       store, both one-way doors - and every one of them still read "deferred to you". A
       panel that cannot show the owner has answered is worse than one that says nothing. */
    const picked = job.items.filter(i => sel[i.name] === "selected").map(i => i.name);
    if (picked.length || nothing) return { kind: "ownerDecided", picked };
    return { kind: "deferred" };
  }
  const picked = job.items.filter(i => sel[i.name] === "selected").map(i => i.name).sort();
  const want = [...job.recommends].sort();
  const decided = picked.length > 0 || !!nothing;
  if (!decided) return { kind: "undecided", want };
  const same = picked.length === want.length && picked.every((x, n) => x === want[n]);
  if (want.length === 0) return { kind: nothing && picked.length === 0 ? "match" : "diverge", want };
  return { kind: same ? "match" : "diverge", want, picked };
}

function jobStatus(job, sel) {
  const states = job.items.map(i => sel[i.name] || "undecided");
  const chosen = job.items.filter((_, n) => states[n] === "selected");
  return { chosen, settled: chosen.length > 0, states };
}

/* Warnings are advisory. Each names the job, so the export can carry any the
   lead consciously overrode rather than silently dropping them. */
function warningsFor(job, sel, note, nothing) {
  const w = [];
  const { chosen, settled } = jobStatus(job, sel);
  const rs0 = recStatus(job, sel, nothing);
  const fromBuilt = chosen.filter(i => sideOf(i) === "built").length;
  const fromMan = chosen.filter(i => sideOf(i) === "manifest").length;
  /* THE RECOMMENDATION CAN ITSELF BE "TAKE BOTH", and the first version of this warning
     did not know that. It fired on gen-model (hosted AND local, behind the port) and on
     pdf-read (layout-aware AND simple, routed by file type) - both of which are exactly
     what the review recommended. Two STOP warnings on a decision that matched the advice
     is a gate crying wolf, and a gate that cries wolf on its own correct cases is one
     nobody reads. It now defers to the recommendation and fires only where the selection
     goes beyond it. */
  const recBoth = job.recommends !== "OWNER"
    && job.recommends.filter(n => sideOf(job.items.find(i => i.name === n) || {}) === "built").length > 0
    && job.recommends.filter(n => sideOf(job.items.find(i => i.name === n) || {}) === "manifest").length > 0;
  const matchesRec = rs0.kind === "match";
  if (fromBuilt && fromMan && !(recBoth && matchesRec))
    w.push({ level: "stop", text:
      "Two things doing the same job are selected, one from each side. That may be "
      + "deliberate — routing by file type, say — but if it is not, you have picked "
      + "both answers to one question." });
  else if (fromBuilt && fromMan)
    w.push({ level: "info", text:
      "Both sides are selected, and that IS the recommendation here — one behind the "
      + "other, or routed by input. Recorded so it does not read as an oversight." });
  if (job.kind === "CHOICE" && settled && !(note || "").trim())
    w.push({ level: "warn", text:
      "This is a genuine choice between two answers and no reason is recorded. In six "
      + "months the selection will be visible and the reasoning will not." });
  if (!settled && !nothing)
    w.push({ level: "warn", text: "Nothing selected yet, and 'nothing' has not been chosen either." });
  if (settled && nothing)
    w.push({ level: "stop", text: "Marked as 'nothing selected' while items are selected. Pick one." });
  const rs = rs0;
  if (rs.kind === "diverge" && !(note || "").trim())
    w.push({ level: "warn", text:
      "This differs from the recommendation and no reason is recorded. Diverging is "
      + "entirely fine - the recommendation is an argument, not an instruction - but the "
      + "next person needs to know what you saw that it did not." });
  chosen.forEach(i => {
    if (/dead weight|imported nowhere|no direct import|nobody actually needs/i.test(job.choose)
        && /weaviate|fastavro|torch|transformers|tokenizers|huggingface-hub|safetensors/.test(i.name))
      w.push({ level: "warn", text:
        i.name + " is selected, and the analysis for this job records it as unused today. "
        + "Fine if you are selecting it for what comes next — worth a note if so." });
  });
  return w;
}

/* --------------------------------------------------------------- widgets --- */
function Logo() {
  if (TENANT.logoUrl)
    return <img src={TENANT.logoUrl} alt={TENANT.name} style={{ height: 22, display: "block" }} />;
  return <span style={{ fontWeight: 700, color: "var(--ink)", fontSize: 15 }}>{TENANT.name}</span>;
}

function ExternalStylesheet() {
  if (!TENANT.cssOverrideUrl) return null;
  return <link rel="stylesheet" href={TENANT.cssOverrideUrl} />;
}

function Chip({ item, state, onClick }) {
  const cls = state === "selected" ? "chip sel" : state === "rejected" ? "chip rej" : "chip";
  const mark = state === "selected" ? "\u2713" : state === "rejected" ? "\u2717" : "\u25cb";
  return (
    <button type="button" className={cls} data-item={item.name} data-state={state}
      onClick={onClick} title={item.purpose || item.manifestLoc || ""}>
      <span className="mark">{mark}</span>{item.name}
    </button>
  );
}

function FactChip({ text }) {
  return <span className="chip fact" data-fact="1">{"\u25b8 " + text}</span>;
}

/* ------------------------------------------------------------------- job --- */
function JobCard({ job, sel, note, nothing, onToggle, onNote, onNothing }) {
  const { chosen, settled } = jobStatus(job, sel);
  const rs = recStatus(job, sel, nothing);
  const warns = warningsFor(job, sel, note, nothing);
  const built = job.items.filter(i => sideOf(i) !== "manifest");
  const man = job.items.filter(i => sideOf(i) !== "built");
  return (
    <div className="card" data-job={job.id} data-settled={settled || nothing ? "yes" : "no"}>
      <div className="hd">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h3>{job.name}</h3>
          <span>
            <span className={"pill " + job.kind}>{KIND_LABEL[job.kind]}</span>{" "}
            <span className={"pill " + (settled || nothing ? "settled" : "open")}>
              {settled ? chosen.length + " selected" : nothing ? "nothing, deliberately" : "open"}
            </span>
          </span>
        </div>
        <div className="muted" style={{ marginTop: 4 }}>{job.what}</div>
      </div>

      <div className="sides">
        <div>
          <div className="lbl">In the running system</div>
          {built.length === 0 && !job.builtFact && <span className="muted">nothing at all</span>}
          {built.map(i => (
            <Chip key={i.name} item={i} state={sel[i.name] || "undecided"}
              onClick={() => onToggle(i.name)} />
          ))}
          {job.builtFact && <FactChip text={DATA.factLabels[job.builtFact]} />}
        </div>
        <div>
          <div className="lbl">In the manifest</div>
          {man.length === 0 && !job.manFact && <span className="muted">nothing at all</span>}
          {man.map(i => (
            <Chip key={i.name} item={i} state={sel[i.name] || "undecided"}
              onClick={() => onToggle(i.name)} />
          ))}
          {job.manFact && <FactChip text={DATA.consLabels[job.manFact]} />}
        </div>
      </div>

      <div className="rec" data-rec={rs.kind}>
        <div className="row" style={{ justifyContent: "space-between", alignItems: "baseline" }}>
          <div className="lbl" style={{ margin: 0, color: "var(--green)" }}>Claude recommends</div>
          <span className={"pill rec-" + rs.kind} data-recpill={rs.kind}>{REC_LABEL[rs.kind]}</span>
        </div>
        <div className="recpick" data-recpick="1">
          {job.recommends === "OWNER"
            ? <i>No recommendation \u2014 this one turns on something neither document contains.</i>
            : job.recommends.length === 0
              ? <b>Select nothing here.</b>
              : <span><b>Select:</b> {job.recommends.join(", ")}
                  {job.items.length > job.recommends.length &&
                    <span className="muted"> &middot; reject the rest</span>}</span>}
        </div>
        <div className="recwhy" data-recwhy="1">{job.verdict}</div>
      </div>

      <div style={{ padding: "11px 14px", borderTop: "1px solid var(--line)" }}>
        <div className="lbl">Why one over the other</div>
        <p className="reason" data-reason="1" style={{ margin: "0 0 10px" }}>{job.choose}</p>

        {warns.map((w, n) => (
          <div key={n} className={w.level === "stop" ? "warn stop" : "warn"} data-warn={w.level}>
            {w.text}
          </div>
        ))}

        <div className="lbl" style={{ marginTop: 12 }}>Your decision and reasoning</div>
        <textarea rows={3} value={note || ""} data-note={job.id}
          placeholder="Why this one? What did it turn on? Anything the next person needs to know."
          onChange={e => onNote(job.id, e.target.value)} />
        <label className="row" style={{ marginTop: 8, fontSize: 12.6 }}>
          <input type="checkbox" checked={!!nothing} data-nothing={job.id}
            onChange={e => onNothing(job.id, e.target.checked)} />
          <span className="muted">Deliberately selecting nothing for this job</span>
        </label>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- app --- */
export default function LextrStackWorkbench() {
  const [sel, setSel] = useState(PRELOAD);
  const [notes, setNotes] = useState({});
  const [nothing, setNothing] = useState({});
  const [layer, setLayer] = useState("all");
  const [kind, setKind] = useState("all");
  const [only, setOnly] = useState("all");
  const [reviewer, setReviewer] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportText, setExportText] = useState("");
  const [importText, setImportText] = useState("");
  const [msg, setMsg] = useState(PRELOAD_NOTE);
  const fileRef = useRef(null);

  const toggle = name => setSel(s => ({ ...s, [name]: nextState(s[name] || "undecided") }));
  const setNote = (id, v) => setNotes(n => ({ ...n, [id]: v }));
  const setNo = (id, v) => setNothing(n => ({ ...n, [id]: v }));

  const stats = useMemo(() => {
    let settled = 0, selected = 0, rejected = 0, warnStop = 0, warnSoft = 0;
    let match = 0, diverge = 0, deferred = 0, ownerDecided = 0;
    DATA.jobs.forEach(j => {
      const st = jobStatus(j, sel);
      if (st.settled || nothing[j.id]) settled++;
      const ws = warningsFor(j, sel, notes[j.id], nothing[j.id]);
      warnStop += ws.filter(w => w.level === "stop").length;
      warnSoft += ws.filter(w => w.level === "warn").length;
      const rs = recStatus(j, sel, nothing[j.id]);
      if (rs.kind === "match") match++;
      if (rs.kind === "diverge") diverge++;
      if (rs.kind === "deferred") deferred++;
      if (rs.kind === "ownerDecided") ownerDecided++;
    });
    Object.values(sel).forEach(v => { if (v === "selected") selected++; if (v === "rejected") rejected++; });
    return { settled, selected, rejected, warnStop, warnSoft, match, diverge, deferred,
             ownerDecided, total: DATA.jobs.length };
  }, [sel, notes, nothing]);

  const shown = DATA.jobs.filter(j => {
    if (layer !== "all" && j.layer !== layer) return false;
    if (kind !== "all" && j.kind !== kind) return false;
    const st = jobStatus(j, sel);
    const done = st.settled || nothing[j.id];
    if (only === "open" && done) return false;
    if (only === "settled" && !done) return false;
    if (only === "flagged" && warningsFor(j, sel, notes[j.id], nothing[j.id]).length === 0) return false;
    const rk = recStatus(j, sel, nothing[j.id]).kind;
    if (only === "diverge" && rk !== "diverge") return false;
    if (only === "deferred" && rk !== "deferred") return false;
    if (only === "ownerDecided" && rk !== "ownerDecided") return false;
    return true;
  });

  function buildExport() {
    return {
      artifact: "lextr-stack-decision",
      version: 1,
      reviewer: reviewer || null,
      takenAt: new Date().toISOString(),
      clientId: TENANT.clientId,
      totals: { jobs: DATA.jobs.length, items: DATA.itemCount, ...stats },
      jobs: DATA.jobs.map(j => {
        const st = jobStatus(j, sel);
        const ws = warningsFor(j, sel, notes[j.id], nothing[j.id]);
        return {
          id: j.id, layer: j.layer, name: j.name, kind: j.kind,
          selected: st.chosen.map(i => i.name),
          rejected: j.items.filter(i => sel[i.name] === "rejected").map(i => i.name),
          undecided: j.items.filter(i => !sel[i.name] || sel[i.name] === "undecided").map(i => i.name),
          nothingDeliberately: !!nothing[j.id],
          recommended: j.recommends === "OWNER" ? "deferred to the owner" : j.recommends,
          agreesWithRecommendation: recStatus(j, sel, nothing[j.id]).kind,
          comment: (notes[j.id] || "").trim() || null,
          /* warnings still open at export time - so an override is on the record
             rather than lost the moment somebody clicks Export */
          warningsAtExport: ws.map(w => w.level + ": " + w.text),
        };
      }),
    };
  }

  /* THE DOWNLOAD BUG THIS REPLACES, because it is worth not repeating: the anchor was
     never added to the document. A DETACHED ANCHOR'S click() IS SILENTLY IGNORED in a
     sandboxed iframe and in some browsers - no file, no error, nothing to see. Two changes:
     the anchor is now attached before the click and removed after, AND the payload is
     always shown on screen as well, because an iframe without download permission will
     block the file however correctly it is written. A decision you cannot get out of the
     tool is a decision you have not made. */
  function download() {
    const text = JSON.stringify(buildExport(), null, 2);
    setExportText(text);
    setExportOpen(true);
    try {
      const blob = new Blob([text], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = FILENAME;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 0);
      setMsg("Download started. If nothing appeared, copy it from the panel below.");
    } catch (err) {
      setMsg("This page cannot download files here - copy it from the panel below.");
    }
  }

  function copyJson() {
    const text = exportText || JSON.stringify(buildExport(), null, 2);
    if (navigator.clipboard) navigator.clipboard.writeText(text);
    setMsg("Decision JSON copied.");
  }

  function applyRecommendations() {
    const s = {}, no = {};
    DATA.jobs.forEach(j => {
      if (j.recommends === "OWNER") return;         // never auto-decide what was deferred
      j.items.forEach(i => { s[i.name] = j.recommends.indexOf(i.name) >= 0 ? "selected" : "rejected"; });
      if (j.recommends.length === 0) no[j.id] = true;
    });
    setSel(s); setNothing(no);
    setMsg("Applied every recommendation. The " + DATA.jobs.filter(j => j.recommends === "OWNER").length
      + " deferred to you are untouched.");
  }

  function markdown() {
    const e = buildExport();
    const L = ["# Lextr stack decision", "",
      "Reviewer: " + (e.reviewer || "(not named)"), "Taken: " + e.takenAt,
      "Settled: " + e.totals.settled + " of " + e.totals.jobs + " jobs", ""];
    DATA.layers.forEach(l => {
      const js = e.jobs.filter(j => j.layer === l);
      if (!js.length) return;
      L.push("## " + l);
      js.forEach(j => {
        L.push("### " + j.name + "  (" + j.kind + ")");
        L.push("- Selected: " + (j.selected.length ? j.selected.join(", ")
          : (j.nothingDeliberately ? "nothing, deliberately" : "NOT YET DECIDED")));
        if (j.rejected.length) L.push("- Rejected: " + j.rejected.join(", "));
        L.push("- Claude recommended: " + (Array.isArray(j.recommended)
          ? (j.recommended.length ? j.recommended.join(", ") : "nothing") : j.recommended));
        if (j.agreesWithRecommendation === "diverge") L.push("- **Diverges from the recommendation**");
        if (j.comment) L.push("- Why: " + j.comment);
        j.warningsAtExport.forEach(x => L.push("- [open warning] " + x));
        L.push("");
      });
    });
    return L.join("\n");
  }

  function copyMarkdown() {
    const t = markdown();
    if (navigator.clipboard) navigator.clipboard.writeText(t);
    setMsg("Summary copied.");
  }

  function doImport() {
    try {
      const p = JSON.parse(importText);
      if (p.artifact !== "lextr-stack-decision") throw new Error("not a decision file");
      const s = {}, n = {}, no = {};
      p.jobs.forEach(j => {
        (j.selected || []).forEach(i => { s[i] = "selected"; });
        (j.rejected || []).forEach(i => { s[i] = "rejected"; });
        if (j.comment) n[j.id] = j.comment;
        if (j.nothingDeliberately) no[j.id] = true;
      });
      setSel(s); setNotes(n); setNothing(no);
      setReviewer(p.reviewer || "");
      setImportOpen(false); setImportText("");
      setMsg("Loaded " + p.jobs.length + " jobs.");
    } catch (err) {
      setMsg("Could not read that file: " + err.message);
    }
  }

  const pct = Math.round((stats.settled / stats.total) * 100);

  return (
    <div className="lxw">
      <ExternalStylesheet />
      <style>{TOKENS}</style>

      <div className="bar">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div className="row"><Logo /><h1 style={{ fontSize: 15, fontWeight: 500 }}>&middot; stack decision</h1></div>
          <div className="row">
            <input type="text" placeholder="Reviewer name" value={reviewer} data-reviewer="1"
              onChange={e => setReviewer(e.target.value)} />
            <button type="button" data-applyrec="1" onClick={applyRecommendations}>Apply all recommendations</button>
            <button type="button" onClick={() => setImportOpen(o => !o)}>Import</button>
            <button type="button" onClick={copyMarkdown}>Copy summary</button>
            <button type="button" className="primary" data-export="1" onClick={download}>Export decision</button>
          </div>
        </div>

        <div className="row" style={{ marginTop: 10 }}>
          <span className="muted" data-progress="1">
            {stats.settled} of {stats.total} jobs settled &middot; {stats.selected} items selected
            &middot; {stats.rejected} rejected
          </span>
          <span className="prog"><i style={{ width: pct + "%" }} /></span>
          {stats.warnStop > 0 &&
            <span className="pill RUNNING_ONLY" data-stopcount="1">{stats.warnStop} to look at</span>}
          {stats.warnSoft > 0 &&
            <span className="pill CHOICE" data-warncount="1">{stats.warnSoft} soft warnings</span>}
          <span className="muted" data-recstats="1">
            {stats.match} match the recommendation &middot; {stats.diverge} diverge
            &middot; {stats.ownerDecided} you decided &middot; {stats.deferred} still deferred
          </span>
        </div>

        <div className="row" style={{ marginTop: 8 }}>
          <select value={layer} data-filter="layer" onChange={e => setLayer(e.target.value)}>
            <option value="all">All layers</option>
            {DATA.layers.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <select value={kind} data-filter="kind" onChange={e => setKind(e.target.value)}>
            <option value="all">All kinds</option>
            {Object.keys(KIND_LABEL).map(k => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}
          </select>
          <select value={only} data-filter="only" onChange={e => setOnly(e.target.value)}>
            <option value="all">Everything</option>
            <option value="open">Still open</option>
            <option value="settled">Settled</option>
            <option value="flagged">Flagged</option>
            <option value="diverge">Diverging from the recommendation</option>
            <option value="deferred">Still deferred to you</option>
            <option value="ownerDecided">You decided (no recommendation)</option>
          </select>
          <span className="muted" data-shown="1">{shown.length} shown</span>
          {msg && <span className="muted" data-msg="1">{msg}</span>}
        </div>

        {exportOpen && (
          <div style={{ marginTop: 10 }} data-exportpanel="1">
            <div className="row">
              <b style={{ fontSize: 13 }}>{FILENAME}</b>
              <button type="button" data-copyjson="1" onClick={copyJson}>Copy JSON</button>
              <button type="button" onClick={download}>Download again</button>
              <button type="button" onClick={() => setExportOpen(false)}>Close</button>
            </div>
            <div className="muted" style={{ margin: "6px 0" }}>
              If no file appeared, this page is running somewhere downloads are blocked.
              Copy the text below and save it yourself &mdash; it is the same file.
            </div>
            <textarea rows={10} readOnly value={exportText} data-exporttext="1" />
          </div>
        )}
        {importOpen && (
          <div style={{ marginTop: 10 }}>
            <textarea rows={5} value={importText} data-import="1"
              placeholder="Paste a previously exported decision file here."
              onChange={e => setImportText(e.target.value)} />
            <div className="row" style={{ marginTop: 6 }}>
              <button type="button" className="primary" data-doimport="1" onClick={doImport}>Load it</button>
              <span className="muted">This replaces whatever is on screen now.</span>
            </div>
          </div>
        )}
      </div>

      <div className="body">
        <div className="info">
          <b>Click an item to cycle it:</b> undecided &rarr; selected &rarr; rejected &rarr; undecided.
          A job counts as settled once something is selected, or once you tick
          &ldquo;deliberately nothing&rdquo;. Warnings never block you &mdash; if you override one,
          it travels into the export so the override is on the record rather than lost.
        </div>
        <div className="info">
          <b>Nothing is saved in the browser.</b> Use <i>Export decision</i> to write the file, and
          <i> Import</i> to pick the work back up. A decision record with a reviewer and a date on it
          can be handed to someone; one that lives invisibly in a browser cannot.
        </div>

        {DATA.layers.filter(l => shown.some(j => j.layer === l)).map(l => (
          <div key={l}>
            <h2>{l}</h2>
            {shown.filter(j => j.layer === l).map(j => (
              <JobCard key={j.id} job={j}
                sel={sel} note={notes[j.id]} nothing={nothing[j.id]}
                onToggle={toggle} onNote={setNote} onNothing={setNo} />
            ))}
          </div>
        ))}

        {shown.length === 0 && <p className="muted">Nothing matches those filters.</p>}

        <h2>The decision as it stands</h2>
        <details>
          <summary>Show the export payload</summary>
          <pre data-payload="1">{JSON.stringify(buildExport(), null, 2)}</pre>
        </details>
      </div>
    </div>
  );
}
