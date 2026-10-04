# Knowledge Hub OCR test documents

Three small documents for checking that Knowledge Hub OCR works: scanned PDFs and images are OCR'd, chunked by text source, checked for figures, and caveated in chat (LP-52 / LP-53 / LP-54).

All three contain the same scanned "Schedule HC – Balance Sheet" page: a heading, one sentence, and a 4-column table. Two table rows add up. The Securities row has a **deliberate arithmetic error** for the figure check to catch: 120 + 10 is printed as 135.

| File | What it is | Expected parse |
|---|---|---|
| `scanned.png` | The scanned page as an image | `parser: docling`, `ocr_pages: [1]`, `text_source: ocr`, `verdict: PARTIALLY_VERIFIED`, figures 6 verified / 3 suspect (`120 + 10 = 130, printed 135`) |
| `scanned.pdf` | The same page as an image-only PDF (no text layer) | Same as `scanned.png` |
| `mixed.pdf` | Page 1 has a real text layer ("Reporting Instructions – Schedule RC"); page 2 is the scan | `pages: 2`, `ocr_pages: [2]`, `text_source: mixed`. Page 1 elements are `extracted`, page 2 elements are `ocr`. Indexed as 2 chunks, never one chunk mixing both |

Last verified 2026-10-03 on lexie-ai with docling 2.132.0 and rapidocr 3.9.2, against the pinned models.

## 1. Directly through the extractor (no server)

```bash
cd /Users/tejal/codebase/lextrai/lexie-ai
T=/Users/tejal/codebase/utils/prompts-library/Lextr_Intelligence_Final_Package/feature-testing/test-documents/knowledge-hub-ocr
PYTHONPATH=. DOCLING_ARTIFACTS_PATH=$HOME/models/docling DOCLING_PDF_BACKEND=pypdfium2 \
  venv/bin/python $T/run_ocr.py $T/scanned.png $T/scanned.pdf $T/mixed.pdf
```

## 2. Through the upload endpoint (lexie-ai on 5003)

```bash
B=http://127.0.0.1:5003/api/v1/variance/knowledge
curl -s -X POST "$B/documents/upload?background=true" -H "X-User-Id: $USER" -F "file=@$T/mixed.pdf"   # 202 PARSING
curl -s "$B/documents/doc-mixed-pdf" | python3 -m json.tool | head -30                               # poll until INDEXED
```

Without `background=true` the upload waits for the parse and returns `201 INDEXED` directly.

## 3. Chat caveat (rule 9 of knowledge_chat 1.2.0)

Ask: *"Total loans increased due to commercial real estate originations – what does that Schedule HC balance sheet table show for Securities?"*

Expected: the answer gives the figures as **OCR readings**, names the page, quotes `120 + 10 = 130, printed 135`, and says 135 is likely misread and should be checked against the source.

## 4. Retrieval policy

`VAI_KH_OCR_RETRIEVAL=exclude_unverified` or `exclude_ocr` on lexie-ai: only the page-1 text-layer chunk of `mixed.pdf` should be retrievable.

## Local prerequisites (Intel Mac)

- `DOCLING_ARTIFACTS_PATH` set to the folder from `docling-tools models download layout tableformer code_formula rapidocr --rapidocr-backend-lang onnxruntime:en`. Check it with `venv/bin/python scripts/verify_ocr_artifacts.py $DOCLING_ARTIFACTS_PATH`.
- `DOCLING_PDF_BACKEND=pypdfium2`: the docling-parse wheel segfaults on Intel Macs and takes uvicorn down with it.
- venv: numpy 1.26.4, opencv-python 4.11, scipy 1.14.1 (torch 2.2.2 is the last Intel-Mac build).

## Rebuilding the documents

```bash
cd /Users/tejal/codebase/lextrai/lexie-ai && venv/bin/python $T/make_fixtures.py   # writes next to the script
```

Needs Pillow and pypdf, both already in the lexie-ai venv.
