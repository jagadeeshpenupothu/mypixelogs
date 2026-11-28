// Renders a spec as an A4 Word file. variant "google" avoids features Google Docs drops
// (tab leaders, tab stops on the margin) so the converted Google Doc looks the same.
import {
  AlignmentType, BorderStyle, Document, LeaderType, LevelFormat, Packer, Paragraph, ShadingType, Tab, Table,
  TableCell, TableLayoutType, TableRow, TabStopType, TextRun, VerticalAlign, WidthType,
} from "docx";

import { resolveDesign, tint } from "./design.mjs";
import { parts, plain } from "./spec.mjs";

const TEXT = "1A1A1A";
const MUTED = "8496B0";
const PAGE_W = 11906;
const MARGIN_X = 760;
const W = PAGE_W - MARGIN_X * 2;
const pt = (n) => Math.round(n * 2);
const none = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const NO_BORDERS = { top: none, bottom: none, left: none, right: none };

export async function renderDocx(spec, variant = "word") {
  const google = variant === "google";
  const T = resolveDesign(spec);
  const ACCENT = T.accent;
  const FONT = T.body;
  const HEAD = T.head;
  const TAB = google ? W - 60 : W;
  const line = { style: BorderStyle.SINGLE, size: 4, color: "C9D1DC" };
  const BOX = { top: line, bottom: line, left: line, right: line };

  const runs = (text, extra = {}) => parts(text).map(([t, bold]) => new TextRun({ text: t, bold: bold || extra.bold, color: extra.color, size: extra.size, font: extra.font, characterSpacing: extra.spacing }));
  const para = (text, opts = {}) => new Paragraph({ style: "BodyLine", alignment: opts.align, spacing: opts.after ? { after: opts.after } : undefined, children: runs(text, opts) });
  const bullet = (text, ref = "bullets") => new Paragraph({ style: "BulletItem", numbering: { reference: ref, level: 0 }, children: runs(text) });
  const cellPara = (text, opts = {}) => new Paragraph({ alignment: opts.align, spacing: { before: 0, after: 0 }, children: runs(text, opts) });

  function heading(text) {
    const t = plain(text);
    if (T.heading === "bar")
      return new Paragraph({ style: "Heading1", shading: { type: ShadingType.CLEAR, color: "auto", fill: T.softer }, border: { left: { style: BorderStyle.SINGLE, size: 36, color: ACCENT, space: 6 } }, indent: { left: 120 }, children: [new TextRun(t)] });
    if (T.heading === "caps")
      return new Paragraph({ style: "Heading1", border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: T.accent2, space: 3 } }, children: [new TextRun({ text: t.toUpperCase(), size: pt(11.5), characterSpacing: 40 })] });
    if (T.heading === "shade")
      return new Paragraph({ style: "Heading1", shading: { type: ShadingType.CLEAR, color: "auto", fill: ACCENT }, indent: { left: 0 }, children: [new TextRun({ text: `  ${t}`, color: "FFFFFF" })] });
    if (google) return new Paragraph({ style: "Heading1", border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: MUTED, space: 2 } }, children: [new TextRun(plain(text))] });
    return new Paragraph({
      style: "Heading1",
      tabStops: [{ type: TabStopType.RIGHT, position: W, leader: LeaderType.UNDERSCORE }],
      children: [new TextRun(plain(text)), new TextRun({ children: ["  ", new Tab()], color: MUTED, bold: false })],
    });
  }

  function grid(widths, rows, opts = {}) {
    return new Table({
      width: { size: W, type: WidthType.DXA },
      columnWidths: widths,
      layout: TableLayoutType.FIXED,
      borders: opts.boxed ? { ...BOX, insideHorizontal: line, insideVertical: line } : { ...NO_BORDERS, insideHorizontal: none, insideVertical: none },
      rows,
    });
  }

  const cell = (children, width, opts = {}) =>
    new TableCell({
      width: { size: width, type: WidthType.DXA },
      borders: opts.borders ?? (opts.boxed ? BOX : NO_BORDERS),
      verticalAlign: opts.top ? VerticalAlign.TOP : VerticalAlign.CENTER,
      shading: opts.fill ? { type: ShadingType.CLEAR, color: "auto", fill: opts.fill } : undefined,
      margins: { top: opts.pad ?? 50, bottom: opts.pad ?? 50, left: opts.left ?? 100, right: 100 },
      children,
    });

  const scale = (weights) => {
    const total = weights.reduce((a, b) => a + b, 0);
    const out = weights.map((w) => Math.floor((w / total) * W));
    out[out.length - 1] += W - out.reduce((a, b) => a + b, 0);
    return out;
  };

  const children = [];
  for (const block of spec.blocks) {
    switch (block.type) {
      case "header": {
        // Letterhead-style top: logo box, organisation details, and the document title with its numbers.
        const hs = T.header ?? (block.style === "plain" ? "plain" : "band");
        const logoCell = (width, onColour, fill) => {
          const logoLine = { style: BorderStyle.DASHED, size: 8, color: onColour ? "FFFFFF" : "9AA5B8" };
          return cell([new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 }, children: runs("[YOUR LOGO]", { size: pt(8), color: onColour ? "FFFFFF" : "6B7280" }) })], width,
            { fill, borders: { top: logoLine, bottom: logoLine, left: logoLine, right: logoLine } });
        };
        const orgParas = (fg, align) => [
          new Paragraph({ alignment: align, spacing: { after: 30 }, children: runs(block.org ?? "", { bold: true, size: pt(hs === "centered" ? 17 : 14), color: fg ?? ACCENT, font: HEAD }) }),
          ...(block.lines ?? []).map((l) => new Paragraph({ alignment: align, spacing: { after: 0 }, children: runs(l, { size: pt(9), color: fg }) })),
        ];
        // Shrink the title until it fits on one line of its cell (wide fonts like Georgia and Arial need it).
        const glyph = { Georgia: 0.8, Arial: 0.74, "Times New Roman": 0.7, Cambria: 0.68, Calibri: 0.62 }[HEAD] ?? 0.7;
        const fitTitle = (cellTwips) => Math.min(spec.titleSize ?? 22, Math.floor((cellTwips / 20 - 14) / Math.max(1, plain(block.title).length * glyph)));
        const titleCell = hs === "split" ? scale([5.3, 4.7])[1] : block.logo === false ? scale([5.6, 4.4])[1] : scale([1.3, 4.5, 4.2])[2];
        const tSize = hs === "centered" ? Math.min(spec.titleSize ?? 22, Math.floor((W / 20) / Math.max(1, plain(block.title).length * glyph))) : fitTitle(titleCell);
        const titleParas = (fg, align = AlignmentType.RIGHT) => [
          new Paragraph({ alignment: align, spacing: { before: 40, after: 60, line: Math.round(tSize * 26), lineRule: "atLeast" }, children: runs(block.title, { bold: true, size: pt(tSize), color: fg ?? ACCENT, font: HEAD }) }),
          ...(block.meta ?? []).map(([l, v]) => new Paragraph({ alignment: align, spacing: { after: 0 }, children: [...runs(`${l}  `, { size: pt(9.5), color: fg }), ...runs(v, { bold: true, size: pt(9.5), color: fg })] })),
        ];
        if (hs === "centered") {
          // Centred letterhead: logo, name and details in the middle, a double rule, then the title.
          if (block.logo !== false) children.push(new Table({ alignment: AlignmentType.CENTER, width: { size: 1700, type: WidthType.DXA }, columnWidths: [1700], layout: TableLayoutType.FIXED, rows: [new TableRow({ children: [logoCell(1700, false)] })] }));
          children.push(...orgParas(undefined, AlignmentType.CENTER));
          children.push(new Paragraph({ spacing: { after: 140 }, border: { bottom: { style: BorderStyle.DOUBLE, size: 6, color: ACCENT, space: 6 } }, children: [] }));
          children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: runs(block.title, { bold: true, size: pt(tSize), color: ACCENT, font: HEAD, spacing: 30 }) }));
          if (block.meta?.length) children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: block.meta.flatMap(([l, v], i) => [...(i ? runs("     |     ", { color: "9AA5B8" }) : []), ...runs(`${l} `, { size: pt(9.5) }), ...runs(v, { bold: true, size: pt(9.5) })]) }));
          break;
        }
        if (hs === "split") {
          // Colour block with the organisation on the left, the title on white on the right.
          const widths = scale([5.3, 4.7]);
          const left = [];
          if (block.logo !== false) left.push(new Paragraph({ spacing: { after: 60 }, children: runs("[YOUR LOGO]", { size: pt(8), color: "FFFFFF" }) }));
          left.push(...orgParas("FFFFFF"));
          children.push(grid(widths, [new TableRow({ children: [cell(left, widths[0], { pad: 140, top: true, fill: ACCENT }), cell(titleParas(), widths[1], { pad: 140, top: true, borders: { ...NO_BORDERS, bottom: { style: BorderStyle.SINGLE, size: 24, color: T.accent2 } } })] })]));
          children.push(new Paragraph({ style: "Gap", children: [] }));
          break;
        }
        if (hs === "topbar") children.push(new Paragraph({ spacing: { before: 0, after: 140, line: 160, lineRule: "exact" }, shading: { type: ShadingType.CLEAR, color: "auto", fill: ACCENT }, border: { bottom: { style: BorderStyle.SINGLE, size: 18, color: T.accent2, space: 0 } }, children: [new TextRun({ text: " ", size: 4 })] }));
        const band = hs === "band";
        const fg = band ? "FFFFFF" : undefined;
        const widths = block.logo === false ? scale([5.6, 4.4]) : scale([1.3, 4.5, 4.2]);
        const pad = { pad: 120, top: true, fill: band ? ACCENT : undefined };
        const cells = [];
        if (block.logo !== false) cells.push(logoCell(widths[0], band, band ? ACCENT : undefined));
        cells.push(cell(orgParas(fg), widths[block.logo === false ? 0 : 1], pad), cell(titleParas(fg), widths[block.logo === false ? 1 : 2], pad));
        children.push(grid(widths, [new TableRow({ children: cells })]));
        if (hs === "plain") children.push(new Paragraph({ spacing: { after: 120 }, border: { bottom: { style: BorderStyle.SINGLE, size: 18, color: ACCENT, space: 4 } }, children: [] }));
        else if (hs === "topbar") children.push(new Paragraph({ spacing: { after: 120 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "C9D1DC", space: 4 } }, children: [] }));
        else children.push(new Paragraph({ style: "Gap", children: [] }));
        break;
      }
      case "parties": {
        const widths = scale(block.groups.map(() => 1));
        const boxLine = { style: BorderStyle.SINGLE, size: 4, color: "C9D1DC" };
        const boxed = { top: boxLine, bottom: boxLine, left: boxLine, right: boxLine };
        const cells = block.groups.map((g, i) => cell([
          new Paragraph({ spacing: { after: 50 }, children: runs(String(g.heading).toUpperCase(), { bold: true, size: pt(9), color: ACCENT }) }),
          ...g.lines.map((l, k) => new Paragraph({ spacing: { after: 0 }, children: runs(l, k === 0 ? { bold: true } : {}) })),
        ], widths[i], { top: true, pad: 90, borders: boxed, fill: T.softer }));
        children.push(grid(widths, [new TableRow({ children: cells })]));
        children.push(new Paragraph({ style: "Gap", children: [] }));
        break;
      }
      case "note": {
        const texts = [].concat(block.text);
        children.push(grid([W], [new TableRow({ children: [cell([
          ...(block.heading ? [new Paragraph({ spacing: { after: 40 }, children: runs(block.heading, { bold: true, color: ACCENT }) })] : []),
          ...texts.map((t) => new Paragraph({ spacing: { after: 30 }, children: runs(t, { size: pt(9.5) }) })),
        ], W, { pad: 100, fill: T.soft, borders: { ...NO_BORDERS, left: { style: BorderStyle.SINGLE, size: 18, color: ACCENT } } })] })]));
        children.push(new Paragraph({ style: "Gap", children: [] }));
        break;
      }
      case "title":
        children.push(new Paragraph({ style: "DocTitle", alignment: block.align === "center" ? AlignmentType.CENTER : undefined, children: [new TextRun(plain(block.text))] }));
        if (block.subtitle) children.push(new Paragraph({ style: "DocSubtitle", alignment: block.align === "center" ? AlignmentType.CENTER : undefined, children: runs(block.subtitle) }));
        break;
      case "contact":
        children.push(new Paragraph({
          style: "Contact",
          alignment: block.align === "center" ? AlignmentType.CENTER : undefined,
          border: block.rule === false ? undefined : { bottom: { style: BorderStyle.SINGLE, size: 18, color: ACCENT, space: 10 } },
          children: runs(block.items.join("  |  ")),
        }));
        break;
      case "heading":
        children.push(heading(block.text));
        break;
      case "text":
        for (const t of [].concat(block.text)) children.push(para(t, { align: block.align === "center" ? AlignmentType.CENTER : block.align === "right" ? AlignmentType.RIGHT : undefined, after: 80 }));
        break;
      case "entry":
        children.push(new Paragraph({
          style: "EntryTitle",
          tabStops: [{ type: TabStopType.RIGHT, position: TAB }],
          children: [...runs(block.title, { bold: true }), ...(block.after ? runs(`   |   ${block.after}`) : []), ...(block.right ? [new TextRun({ children: [new Tab(), plain(block.right)] })] : [])],
        }));
        for (const l of block.lines ?? []) children.push(para(l));
        for (const b of block.bullets ?? []) children.push(bullet(b));
        children.push(new Paragraph({ style: "Gap", children: [] }));
        break;
      case "bullets":
        for (const b of block.items) children.push(bullet(b));
        break;
      case "fields": {
        const cols = block.columns === 1 ? 1 : 2;
        const widths = cols === 1 ? scale([3, 7]) : scale([2.2, 2.8, 2.2, 2.8]);
        const rows = [];
        for (let i = 0; i < block.items.length; i += cols) {
          const cells = [];
          for (let c = 0; c < cols; c += 1) {
            const item = block.items[i + c] ?? ["", ""];
            cells.push(cell([cellPara(item[0], { bold: true })], widths[c * 2], { left: 0, pad: 30 }), cell([cellPara(item[1])], widths[c * 2 + 1], { pad: 30 }));
          }
          rows.push(new TableRow({ children: cells }));
        }
        children.push(grid(widths, rows));
        break;
      }
      case "table": {
        const widths = scale(block.columns.map((c) => c.width ?? 1));
        const align = (c) => (c.align === "right" ? AlignmentType.RIGHT : c.align === "center" ? AlignmentType.CENTER : undefined);
        const minimal = T.table === "minimal";
        const soft = { style: BorderStyle.SINGLE, size: 4, color: tint(ACCENT, 0.75) };
        const rowLines = { top: none, left: none, right: none, bottom: soft };
        const headFill = T.table === "solid" ? ACCENT : T.table === "tint" ? T.soft : undefined;
        const headColour = T.table === "solid" ? "FFFFFF" : ACCENT;
        const headBorders = minimal ? { top: none, left: none, right: none, bottom: { style: BorderStyle.SINGLE, size: 16, color: ACCENT } } : BOX;
        const header = new TableRow({
          tableHeader: true,
          children: block.columns.map((c, i) => cell([cellPara(c.label, { bold: true, color: headColour, align: align(c) })], widths[i], { borders: headBorders, fill: headFill })),
        });
        const body = block.rows.map((row, r) => new TableRow({ cantSplit: true, children: row.map((v, i) => cell([cellPara(v, { align: align(block.columns[i]) })], widths[i], { borders: minimal ? rowLines : BOX, fill: minimal && r % 2 === 1 ? T.softer : undefined })) }));
        // Totals sit in the same table as extra rows (label spanning the left columns), which every editor keeps aligned.
        const n = block.columns.length;
        const labelWidth = widths.slice(0, n - 1).reduce((a, b) => a + b, 0);
        const totals = (block.totals ?? []).map(([label, value], i, all) => {
          const last = i === all.length - 1;
          const color = last ? (minimal ? ACCENT : "FFFFFF") : undefined;
          const fill = last ? (minimal ? undefined : ACCENT) : minimal ? undefined : T.softer;
          const b = minimal ? (last ? { top: { style: BorderStyle.SINGLE, size: 16, color: ACCENT }, bottom: { style: BorderStyle.DOUBLE, size: 6, color: ACCENT }, left: none, right: none } : rowLines) : BOX;
          return new TableRow({ cantSplit: true, children: [
            new TableCell({ columnSpan: n - 1, width: { size: labelWidth, type: WidthType.DXA }, borders: b, shading: fill ? { type: ShadingType.CLEAR, color: "auto", fill } : undefined,
              margins: { top: 50, bottom: 50, left: 100, right: 100 }, children: [cellPara(label, { bold: last, color, align: AlignmentType.RIGHT })] }),
            cell([cellPara(value, { bold: last, color, align: AlignmentType.RIGHT })], widths[n - 1], { borders: b, fill }),
          ] });
        });
        children.push(grid(widths, [header, ...body, ...totals], { boxed: !minimal }));
        children.push(new Paragraph({ style: "Gap", children: [] }));
        break;
      }
      case "columns": {
        const n = block.groups.length;
        const widths = scale(n === 3 ? [35, 33, 32] : Array(n).fill(1));
        const divider = { style: BorderStyle.SINGLE, size: 6, color: "A6A6A6" };
        children.push(grid(widths, [new TableRow({
          children: block.groups.map((g, i) => cell([
            new Paragraph({ style: "GroupHead", children: [new TextRun(plain(g.heading))] }),
            ...g.items.map((it) => bullet(it, "small")),
          ], widths[i], { top: true, left: i === 0 ? 160 : 300, borders: { ...NO_BORDERS, left: i === 0 ? none : divider } })),
        })]));
        break;
      }
      case "signature": {
        const items = block.items ?? ["Authorised Signatory"];
        if (google) {
          // Google Docs rearranges borderless layout tables, so signature lines use centred tab stops instead.
          const n = items.length;
          const centres = n === 1 ? [Math.round(W * 0.78)] : items.map((_, i) => Math.round((W * (2 * i + 1)) / (2 * n)));
          const tabs = centres.map((position) => ({ type: TabStopType.CENTER, position }));
          const lineText = "_".repeat(n === 1 ? 30 : Math.max(18, Math.round(60 / n)));
          children.push(new Paragraph({ tabStops: tabs, spacing: { before: 520, after: 40 }, children: centres.map(() => new TextRun({ children: [new Tab(), lineText] })) }));
          children.push(new Paragraph({ tabStops: tabs, spacing: { after: 0 }, children: items.flatMap((label) => [new TextRun({ children: [new Tab()] }), ...runs(label)]) }));
          break;
        }
        const widths = scale(items.length === 1 ? [6, 4] : Array(items.length).fill(1));
        const cells = items.length === 1 ? [cell([cellPara("")], widths[0])] : [];
        items.forEach((label, i) => cells.push(cell([
          new Paragraph({ spacing: { before: 520, after: 0 }, border: { top: { style: BorderStyle.SINGLE, size: 6, color: TEXT, space: 4 } }, alignment: AlignmentType.CENTER, children: runs(label) }),
        ], widths[items.length === 1 ? 1 : i], { left: 200 })));
        children.push(grid(widths, [new TableRow({ children: cells })]));
        break;
      }
      case "spacer":
        children.push(new Paragraph({ spacing: { before: 0, after: 0, line: (block.size ?? 12) * 20, lineRule: "exact" }, children: [] }));
        break;
      default:
        break;
    }
  }

  const bulletLevel = (left, hanging) => ({ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left, hanging } }, run: { font: "Arial" } } });
  const body = google ? 245 : 264;
  const doc = new Document({
    creator: "MyPixelogs",
    title: spec.title,
    description: plain(spec.description).slice(0, 250),
    styles: {
      default: { document: { run: { font: FONT, size: pt(10.5), color: TEXT } } },
      paragraphStyles: [
        { id: "Normal", name: "Normal", run: { font: FONT, size: pt(10.5), color: TEXT }, paragraph: { spacing: { before: 0, after: 0, line: body } } },
        { id: "DocTitle", name: "Title", basedOn: "Normal", next: "DocSubtitle", quickFormat: true, run: { font: HEAD, size: pt(spec.titleSize ?? 30), bold: true, color: ACCENT }, paragraph: { spacing: { after: 60, line: 240 } } },
        { id: "DocSubtitle", name: "Subtitle", basedOn: "Normal", quickFormat: true, run: { size: pt(13.5) }, paragraph: { spacing: { after: 90 } } },
        { id: "Contact", name: "Contact Line", basedOn: "Normal", quickFormat: true, run: { size: pt(google ? 9 : 9.5) }, paragraph: { spacing: { after: 200 } } },
        { id: "Heading1", name: "heading 1", basedOn: "Normal", next: "BodyLine", quickFormat: true, run: { font: HEAD, size: pt(13), bold: true, color: ACCENT }, paragraph: { spacing: { before: google ? 200 : 240, after: google ? 70 : 90, line: 240 }, keepNext: true, keepLines: true, outlineLevel: 0 } },
        { id: "EntryTitle", name: "Entry Title", basedOn: "Normal", next: "BodyLine", quickFormat: true, paragraph: { spacing: { after: 10 }, keepNext: true } },
        { id: "BodyLine", name: "Body", basedOn: "Normal", quickFormat: true, paragraph: { spacing: { after: 10 } } },
        { id: "BulletItem", name: "Bullet", basedOn: "Normal", quickFormat: true, paragraph: { spacing: { after: 10 } } },
        { id: "GroupHead", name: "Group Heading", basedOn: "Normal", quickFormat: true, run: { font: HEAD, bold: true, color: ACCENT, size: pt(11) }, paragraph: { spacing: { after: 40 }, keepNext: true } },
        { id: "Gap", name: "Gap", basedOn: "Normal", paragraph: { spacing: { before: 0, after: 0, line: 120, lineRule: "exact" } } },
      ],
    },
    numbering: { config: [{ reference: "bullets", levels: [bulletLevel(500, 260)] }, { reference: "small", levels: [bulletLevel(300, 220)] }] },
    sections: [{ properties: { page: { size: { width: PAGE_W, height: 16838 }, margin: { top: 720, bottom: 600, left: MARGIN_X, right: MARGIN_X, header: 400, footer: 400 } } }, children }],
  });
  return Packer.toBuffer(doc);
}
