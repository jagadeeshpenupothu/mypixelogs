"""Renders a template spec (JSON) as a one-page A4 Excel workbook. Also used for Google Sheets.

Usage: python3 scripts/templates/xlsx.py automation/specs/<slug>.json out.xlsx
Layout: a 12-column grid; every block spans columns in proportion to its widths.
"""
import json
import math
import re
import sys

from openpyxl import Workbook
from openpyxl.cell.rich_text import CellRichText, TextBlock
from openpyxl.cell.text import InlineFont
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter as L
from openpyxl.worksheet.page import PageMargins

spec = json.load(open(sys.argv[1], encoding="utf-8"))
OUT = sys.argv[2]
FONT, TEXT, MUTED = "Cambria", "1A1A1A", "8496B0"
A = spec.get("accent", "1B2F5B").replace("#", "").upper()
COLS, COL_W = 12, 8.0  # 12 columns x 8 chars ~ A4 width at 10.5pt
CHARS = COLS * COL_W * 1.12

wb = Workbook()
ws = wb.active
ws.title = "Template"
ws.sheet_view.showGridLines = False
for c in range(1, COLS + 1):
    ws.column_dimensions[L(c)].width = COL_W
row = 1
thin = Side(style="thin", color="C9D1DC")
BOX = Border(left=thin, right=thin, top=thin, bottom=thin)


def parts(text):
    return [(p[2:-2], True) if p.startswith("**") and p.endswith("**") else (p, False) for p in re.split(r"(\*\*[^*]+\*\*)", str(text or "")) if p]


def plain(text):
    return str(text or "").replace("**", "")


def value(text, size=10.5, bold=False, color=TEXT):
    ps = parts(text)
    if len(ps) == 1 or all(b == ps[0][1] for _, b in ps):
        return plain(text)
    return CellRichText(*[TextBlock(InlineFont(rFont=FONT, sz=size, b=(b or bold), color=color), t) for t, b in ps])


def put(r, c1, c2, text, size=10.5, bold=False, color=TEXT, align="left", wrap=False, fill=None, border=None, indent=0):
    cell = ws.cell(row=r, column=c1)
    cell.value = value(text, size, bold, color)
    cell.font = Font(name=FONT, size=size, bold=bold, color=color)
    cell.alignment = Alignment(horizontal=align, vertical="top" if wrap else "center", wrap_text=wrap, indent=indent)
    if c2 > c1:
        ws.merge_cells(start_row=r, start_column=c1, end_row=r, end_column=c2)
    for c in range(c1, c2 + 1):
        if fill:
            ws.cell(row=r, column=c).fill = PatternFill("solid", fgColor=fill)
        if border:
            ws.cell(row=r, column=c).border = border
    return cell


def lines_for(text, span_cols, size=10.5):
    width = span_cols * COL_W * 1.12 * (10.5 / size)
    return max(1, math.ceil(len(plain(text)) / max(width, 1)))


def line(text="", size=10.5, bold=False, color=TEXT, height=None, wrap=True, indent=0, align="left"):
    global row
    put(row, 1, COLS, text, size, bold, color, align=align, wrap=wrap, indent=indent)
    ws.row_dimensions[row].height = height or 15 * lines_for(text, COLS, size) * (size / 10.5)
    row += 1


def gap(h=6):
    global row
    ws.row_dimensions[row].height = h
    row += 1


def underline(r, color, style="thin"):
    for c in range(1, COLS + 1):
        ws.cell(row=r, column=c).border = Border(bottom=Side(style=style, color=color))


def spans(weights):
    total = sum(weights)
    raw = [w / total * COLS for w in weights]
    out = [max(1, round(x)) for x in raw]
    while sum(out) > COLS:
        out[out.index(max(out))] -= 1
    while sum(out) < COLS:
        out[out.index(max(out))] += 1
    starts, s = [], 1
    for n in out:
        starts.append((s, s + n - 1))
        s += n
    return starts


for block in spec["blocks"]:
    t = block["type"]
    center = "center" if block.get("align") == "center" else "left"
    if t == "title":
        size = spec.get("titleSize", 30) * 0.85
        line(plain(block["text"]), size, True, A, height=size * 1.45, wrap=False, align=center)
        if block.get("subtitle"):
            line(block["subtitle"], 13, height=20, wrap=False, align=center)
    elif t == "contact":
        line("  |  ".join(block["items"]), 8.5, height=16, wrap=False, align=center)
        if block.get("rule", True):
            underline(row - 1, A, "medium")
        gap(4)
    elif t == "heading":
        gap(9)
        line(plain(block["text"]), 12.5, True, A, height=19, wrap=False)
        underline(row - 1, MUTED)
        gap(4)
    elif t == "text":
        for txt in block["text"] if isinstance(block["text"], list) else [block["text"]]:
            line(txt, align=block.get("align", "left"))
    elif t == "entry":
        title = f"**{plain(block['title'])}**" + (f"   |   {block['after']}" if block.get("after") else "")
        put(row, 1, 9, title, bold=not block.get("after"))
        put(row, 10, COLS, block.get("right", ""), align="right")
        ws.row_dimensions[row].height = 15
        row += 1
        for l in block.get("lines", []):
            line(l)
        for b in block.get("bullets", []):
            line(f"•  {b}", indent=1)
        gap(5)
    elif t == "bullets":
        for b in block["items"]:
            line(f"•  {b}", indent=1)
    elif t == "fields":
        two = block.get("columns", 2) != 1
        layout = [(1, 3), (4, 6), (7, 9), (10, 12)] if two else [(1, 4), (5, 12)]
        step = 2 if two else 1
        items = block["items"]
        for i in range(0, len(items), step):
            h = 1
            for k in range(step):
                if i + k < len(items):
                    lab, val = items[i + k]
                    put(row, *layout[k * 2], lab, bold=True)
                    c1, c2 = layout[k * 2 + 1]
                    put(row, c1, c2, val, wrap=True)
                    h = max(h, lines_for(val, c2 - c1 + 1))
            ws.row_dimensions[row].height = 16 * h
            row += 1
    elif t == "table":
        cols = block["columns"]
        sp = spans([c.get("width", 1) for c in cols])
        for (c1, c2), c in zip(sp, cols):
            put(row, c1, c2, c["label"], bold=True, color="FFFFFF", align=c.get("align", "left"), fill=A, border=BOX)
        ws.row_dimensions[row].height = 18
        row += 1
        for r in block["rows"]:
            h = 1
            for (c1, c2), c, v in zip(sp, cols, r):
                put(row, c1, c2, v, align=c.get("align", "left"), wrap=True, border=BOX)
                h = max(h, lines_for(v, c2 - c1 + 1))
            ws.row_dimensions[row].height = 16 * h
            row += 1
        for i, (lab, val) in enumerate(block.get("totals", [])):
            last = i == len(block["totals"]) - 1
            put(row, 8, 10, lab, bold=last, color="FFFFFF" if last else TEXT, fill=A if last else "F2F4F8", border=BOX)
            put(row, 11, 12, val, bold=last, color="FFFFFF" if last else TEXT, align="right", fill=A if last else None, border=BOX)
            ws.row_dimensions[row].height = 16
            row += 1
        gap(6)
    elif t == "columns":
        groups = block["groups"]
        sp = spans([1] * len(groups))
        depth = 1 + max(len(g["items"]) for g in groups)
        divider = Side(style="thin", color="A6A6A6")
        for (c1, c2), g in zip(sp, groups):
            for i in range(depth):
                text = g["heading"] if i == 0 else (f"•  {g['items'][i - 1]}" if i - 1 < len(g["items"]) else "")
                cell = put(row + i, c1, c2, text, size=11 if i == 0 else 10.5, bold=i == 0, color=A if i == 0 else TEXT, indent=1)
                if c1 > 1:
                    cell.border = Border(left=divider)
        for i in range(depth):
            ws.row_dimensions[row + i].height = 15
        row += depth
    elif t == "signature":
        items = block.get("items", ["Authorised Signatory"])
        gap(30)
        sp = [(9, 12)] if len(items) == 1 else spans([1] * len(items))
        for (c1, c2), s in zip(sp, items):
            put(row, c1, c2, s, align="center")
            for c in range(c1, c2 + 1):
                ws.cell(row=row, column=c).border = Border(top=Side(style="thin", color=TEXT))
        ws.row_dimensions[row].height = 16
        row += 1
    elif t == "spacer":
        gap(block.get("size", 12))

last = row - 1
ws.print_area = f"A1:{L(COLS)}{last}"
ws.page_setup.paperSize = ws.PAPERSIZE_A4
ws.page_setup.orientation = "portrait"
ws.page_setup.fitToWidth = 1
ws.page_setup.fitToHeight = 1
ws.sheet_properties.pageSetUpPr.fitToPage = True
ws.page_margins = PageMargins(left=0.5, right=0.5, top=0.5, bottom=0.45, header=0.2, footer=0.2)
ws.print_options.horizontalCentered = True
wb.properties.title = spec["title"]
wb.properties.creator = "MyPixelogs"
wb.save(OUT)
