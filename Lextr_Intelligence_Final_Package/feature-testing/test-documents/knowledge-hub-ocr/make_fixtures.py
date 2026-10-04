"""Rebuilds the OCR test documents (default: next to this script): scanned.png, scanned.pdf (image-only), mixed.pdf (text page + scanned page)."""
import io
import os
import sys

from PIL import Image, ImageDraw, ImageFont
from pypdf import PdfReader, PdfWriter

out = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(os.path.abspath(__file__))
os.makedirs(out, exist_ok=True)


def font(size):
    for path in ("/System/Library/Fonts/Supplemental/Arial.ttf", "/Library/Fonts/Arial.ttf",
                 "/System/Library/Fonts/Helvetica.ttc"):
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def scanned_page():
    img = Image.new("RGB", (1700, 2200), "white")
    d = ImageDraw.Draw(img)
    big, body = font(56), font(40)
    d.text((150, 150), "Schedule HC - Balance Sheet", fill="black", font=big)
    d.text((150, 300), "Total loans increased during the quarter due to", fill="black", font=body)
    d.text((150, 360), "commercial real estate originations.", fill="black", font=body)
    rows = [("Line", "Prior", "Change", "Current"),
            ("Loans", "244", "34", "278"),
            ("Deposits", "500", "25", "525"),
            ("Securities", "120", "10", "135")]          # 120 + 10 != 135 -> SUSPECT
    y = 500
    for row in rows:
        x = 150
        for cell in row:
            d.rectangle([x, y, x + 320, y + 80], outline="black", width=3)
            d.text((x + 20, y + 18), cell, fill="black", font=body)
            x += 320
        y += 80
    return img


img = scanned_page()
img.save(os.path.join(out, "scanned.png"))
img.save(os.path.join(out, "scanned.pdf"), "PDF", resolution=200)

# mixed.pdf: page 1 has a real text layer (reportlab-free: a minimal hand-written PDF), page 2 is the scan
text_pdf = (b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
            b"2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n"
            b"3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R"
            b"/Resources<</Font<</F1 5 0 R>>>>>>endobj\n")
stream = (b"BT /F1 16 Tf 72 720 Td (Reporting Instructions - Schedule RC) Tj 0 -28 Td "
          b"(Report all loans held for investment at amortized cost.) Tj ET")
text_pdf += b"4 0 obj<</Length %d>>stream\n" % len(stream) + stream + b"\nendstream endobj\n"
text_pdf += b"5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\ntrailer<</Size 6/Root 1 0 R>>\nstartxref\n0\n%%EOF"

writer = PdfWriter()
writer.add_page(PdfReader(io.BytesIO(text_pdf)).pages[0])
writer.add_page(PdfReader(os.path.join(out, "scanned.pdf")).pages[0])
with open(os.path.join(out, "mixed.pdf"), "wb") as f:
    writer.write(f)
print("fixtures written to", out)
