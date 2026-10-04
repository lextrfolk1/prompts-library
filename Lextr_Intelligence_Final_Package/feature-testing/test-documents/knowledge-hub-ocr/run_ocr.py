"""Run each file through lexie-ai's extractor directly (no server). From lexie-ai/:
    PYTHONPATH=. DOCLING_ARTIFACTS_PATH=~/models/docling DOCLING_PDF_BACKEND=pypdfium2 \
      venv/bin/python <this folder>/run_ocr.py <this folder>/*.pdf <this folder>/*.png
"""
import json
import sys
import time
import warnings

warnings.filterwarnings("ignore")
from service.variance.knowledge.extraction import BINARY_EXTRACTORS, ExtractionError  # noqa: E402

for path in sys.argv[1:]:
    name = path.rsplit("/", 1)[-1]
    suffix = "." + name.rsplit(".", 1)[-1]
    t = time.time()
    try:
        ex = BINARY_EXTRACTORS[suffix](open(path, "rb").read(), name)
        print(f"=== {name} OK in {time.time() - t:.1f}s")
        print(json.dumps(ex.parse, indent=1)[:1500])
        print("--- text:\n" + ex.text[:800])
        print("--- segments:", [(s["page_number"], s["text_source"], s["figures_needing_review"], s["text"][:40])
                                for s in ex.segments])
    except ExtractionError as e:
        print(f"=== {name} FAILED in {time.time() - t:.1f}s: {e}")
