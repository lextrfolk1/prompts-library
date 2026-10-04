# Prompt — Knowledge Hub end-to-end test

Paste everything below the line into a fresh Claude Code session opened at `/Users/tejal/codebase/lextrai`.

---

You are testing the **Knowledge Hub** of Lextr Intelligence end to end, on the local stack, and producing a pass/fail report. **This is a test run, not a fix run.** Do not modify code, config, or the venv. If something fails, record it with evidence, form a hypothesis about the cause from the code, and move on.

## Rules

- Work read-only, except for what the tests themselves create: uploaded test documents, chat sessions, and archive calls on those documents. Give every document you create a title starting with `E2E ` and use `X-User-Id: e2e-tester` so they are easy to find.
- Never delete anything. At the end, **archive** every document you created (archiving is part of the test).
- Never print secrets. To check a process's environment, grep only the variable names listed here.
- Do not restart services yourself. If a test needs a restart with different settings (case K2), mark it `BLOCKED (needs restart)` and describe what to set.
- Lexie responses can be raw JSON or wrapped as `{"success":…, "data": …}`. Read `data` when present.
- Before asserting a request or response shape, confirm it in the code. Do not guess:
  - `intelligence-service/src/main/java/com/lextr/intelligence/knowledge/controller/LexieKnowledgeController.java` (proxy, `/api/v1/lexie/knowledge`)
  - `lexie-ai/routes/variance_knowledge_routers.py` (the real routes)
  - `intelligence-ui/src/features/knowledge/` (UI and `knowledgeApiClient.ts`)

## Stack

| Service | Where | Notes |
|---|---|---|
| intelligence-ui | http://localhost:5173/intelligence/ (Vite) | forwards `/api` to 8059 |
| intelligence-service | http://localhost:8059/api/v1/lexie/knowledge | needs headers `X-Client-Id: e2e` and `X-User-Id: e2e-tester` |
| lexie-ai | http://127.0.0.1:5003/api/v1/variance/knowledge | started with `DOCLING_ARTIFACTS_PATH`, `DOCLING_PDF_BACKEND=pypdfium2`, optionally `DOCLING_MAX_CONCURRENT` / `VAI_KH_OCR_RETRIEVAL` |

**Test through intelligence-service (8059) unless a case says otherwise**, because that's the path the UI uses. Call lexie-ai (5003) directly only to tell a proxy fault from a lexie fault.

## Test data

- OCR documents, with expected results in their README: `/Users/tejal/codebase/utils/prompts-library/Lextr_Intelligence_Final_Package/feature-testing/test-documents/knowledge-hub-ocr/`
  - `scanned.png`, `scanned.pdf`: one scanned page; the Securities row has a deliberate arithmetic error (`120 + 10` printed as `135`)
  - `mixed.pdf`: page 1 is a real text layer, page 2 is the scan
- Generate the rest in your scratchpad with the lexie-ai venv (`/Users/tejal/codebase/lextrai/lexie-ai/venv/bin/python`, which has python-docx):
  - `e2e-policy.txt`: a few paragraphs of plain text with a unique phrase such as "zebra-quartz retention rule"
  - `e2e-memo.docx`: two paragraphs plus a 3×3 table with a unique phrase
  - `e2e-sheet.xlsx`: any bytes, for the unsupported-type case
  - `e2e-empty.txt`: zero bytes
  - `e2e-huge.txt`: 26 MB

## Cases

Run them in order. For each, record the HTTP status, the key response fields, and PASS / FAIL / BLOCKED.

**A. Preflight**
- A1: all three services answer. For lexie, `GET /api/v1/chatbot/ai/health` returns 200; for intelligence-service, `GET .../collections` returns 200.
- A2: the lexie process on 5003 has `DOCLING_ARTIFACTS_PATH` and `DOCLING_PDF_BACKEND` set. Use `ps eww -p <pid> | tr ' ' '\n' | grep -E '^(DOCLING_|VAI_KH_OCR)'`.
- A3: the OCR models match their pins. From `lexie-ai/`, run `venv/bin/python scripts/verify_ocr_artifacts.py <DOCLING_ARTIFACTS_PATH>`; expect "match the pinned commits".

**B. Upload and ingest**
- B1: `.txt` upload, synchronous (no `background`). Expect 201, `status: INDEXED`, `chunks_written ≥ 1`, and a `parse` block absent or empty.
- B2: paste-text ingest (`POST /documents` with a JSON body; read `DocumentIngest` for the fields). Expect INDEXED.
- B3: `.docx` upload. Expect INDEXED, `parse.parser: python-docx`; the detail chunks contain the table text.
- B4: `scanned.png` with `?background=true`. Expect 202 `PARSING`, then poll `GET /documents/{doc_id}` every 3s, for up to 10 minutes, until INDEXED. Record the time taken. Check the parse report: `parser: docling`, `ocr_pages: [1]`, `text_source: ocr`, `verdict: PARTIALLY_VERIFIED`, `figures.suspect_count: 3`, and `suspect` containing `120 + 10 = 130, printed 135`.
- B5: `scanned.pdf` with `?background=true`. Same expectations as B4, plus `pdf_backend: pypdfium2`.
- B6: `mixed.pdf` without `background`. Expect a 201 that waits for the parse, `pages: 2`, `ocr_pages: [2]`, `text_source: mixed`, and 2 chunks: one text-layer, one OCR, never mixed.
- B7: re-upload B1's file unchanged. Expect `skipped: true` ("Unchanged content"), and the document still INDEXED.

**C. Refusals**
- C1: `.xlsx`. Expect FAILED with a reason naming the supported types (lexie records it, and the original is kept).
- C2: empty file. Expect 422.
- C3: 26 MB file. Expect 413.
- C4: in the code, confirm the three type lists match: lexie `SUPPORTED_SUFFIXES`, Java `IngestionRule.SUPPORTED_EXTENSIONS`, and UI `ingestion/rules.ts SUPPORTED_EXTENSIONS` (including png/jpg/jpeg/tif/tiff/bmp/webp).

**D. Inventory and detail**
- D1: `GET /documents` lists every E2E document. Filter by `status=FAILED`, then by `q=E2E`. Check paging (`limit`/`offset`).
- D2: `GET /documents/{id}` for B4 and B6. Expect the `parse` block to be present, `chunk_count` to match, and the excerpts to be readable.
- D3: `GET /documents/{id}/download` gives a URL, or a clear "not held" answer. If lexie's object store is GCS without credentials, record that as a degradation, not a failure.

**E. Retrieval and chat**
- E1: `GET /search?q=<B1 unique phrase>`. The B1 document ranks first.
- E2: search for "Total loans increased commercial real estate originations". The OCR documents are returned.
- E3: chat question answered by B1/B3 content. Expect a grounded answer, citations naming the right `doc_id`s, and `insufficient_evidence: false`.
- E4: OCR caveat. Ask: *"Total loans increased due to commercial real estate originations — what does that Schedule HC balance sheet table show for Securities?"* The answer must give the figures as OCR readings, name the page, quote `120 + 10 = 130, printed 135`, and must **not** state 135 as an established value.
- E5: multi-turn. Ask a follow-up using `session_id` from E3 with a pronoun ("what about its effective date?"). Then `GET /chat/{session_id}` shows the turns and `DELETE /chat/{session_id}` clears them.
- E6: a question nothing in the corpus answers ("What is the capital of Peru?"). Expect `insufficient_evidence: true` and no outside knowledge.

**K. Archive and policy**
- K1: archive the B1 document (`POST /documents/{id}/archive`). Its status becomes ARCHIVED, and E1's search no longer returns it.
- K2 (needs a restart, so mark BLOCKED unless already set): with `VAI_KH_OCR_RETRIEVAL=exclude_unverified`, E2's search returns only the text-layer chunk of `mixed.pdf`.

**U. UI** (use browser automation if this session has it; otherwise write these up as a manual checklist with exact clicks)
- U1: open http://localhost:5173/intelligence/ and go to Knowledge Hub. The ingest drop zone lists image types and the file picker accepts `.png`.
- U2: upload `scanned.png` through the UI. The entry shows as uploading while lexie parses in the background, then shows indexed with chunks embedded.
- U3: open the document in the viewer. Expect the amber "OCR · 1 page(s)" pill and the note naming the pages, the verdict and the figures needing review.
- U4: Ask/chat panel: E4's question shows the OCR caveat, and its citations open the document.

## Finish

1. Archive every remaining `E2E` document you created.
2. Write the report to `/Users/tejal/codebase/utils/prompts-library/Lextr_Intelligence_Final_Package/feature-testing/results/kh-e2e-<YYYYMMDD-HHMM>.md`:
   - a summary line: N pass / N fail / N blocked;
   - a table: case | what was done | expected | actual (status code + key fields) | result;
   - for each FAIL: a short evidence excerpt and a hypothesis pointing to `file:line`;
   - degradations seen (object store, masking salt, …) kept separate from failures.
3. Reply with the summary line, the failures, and the report path. Do not attempt fixes.
