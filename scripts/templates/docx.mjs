// Renders a spec as an A4 Word file. variant "google" avoids features Google Docs drops
// (tab leaders, tab stops on the margin) so the converted Google Doc looks the same.
import {
  AlignmentType, BorderStyle, Document, LeaderType, LevelFormat, Packer, Paragraph, ShadingType, Tab, Table,
  TableCell, TableLayoutType, TableRow, TabStopType, TextRun, VerticalAlign, WidthType,
} from "docx";

import { parts, plain } from "./spec.mjs";

const FONT = "Cambria";
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
  const ACCENT = spec.accent;
  const TAB = google ? W - 60 : W;
  const line = { style: BorderStyle.SINGLE, size: 4, color: "C9D1DC" };
  const BOX = { top: line, bottom: line, left: line, right: line };

  const runs = (text, extra = {}) => parts(text).map(([t, bold]) => new TextRun({ text: t, bold: bold || extra.bold, color: extra.color, size: extra.size }));
  const para = (text, opts = {}) => new Paragraph({ style: "BodyLine", alignment: opts.align, spacing: opts.after ? { after: opts.after } : undefined, children: runs(text, opts) });
  const bullet = (text, ref = "bullets") => new Paragraph({ style: "BulletItem", numbering: { reference: ref, level: 0 }, children: runs(text) });
  const cellPara = (text, opts = {}) => new Paragraph({ alignment: opts.align, spacing: { before: 0, after: 0 }, children: runs(text, opts) });

  function heading(text) {
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
        const header = new TableRow({
          tableHeader: true,
          children: block.columns.map((c, i) => cell([cellPara(c.label, { bold: true, color: "FFFFFF", align: align(c) })], widths[i], { boxed: true, fill: ACCENT })),
        });
        const body = block.rows.map((row) => new TableRow({ cantSplit: true, children: row.map((v, i) => cell([cellPara(v, { align: align(block.columns[i]) })], widths[i], { boxed: true })) }));
        children.push(grid(widths, [header, ...body], { boxed: true }));
        if (block.totals?.length) {
          const tw = scale([6, 2.4, 1.6]);
          const rows = block.totals.map(([label, value], i) => {
            const last = i === block.totals.length - 1;
            return new TableRow({ children: [
              cell([cellPara("")], tw[0]),
              cell([cellPara(label, { bold: last, color: last ? "FFFFFF" : undefined })], tw[1], { boxed: true, fill: last ? ACCENT : "F2F4F8" }),
              cell([cellPara(value, { bold: last, color: last ? "FFFFFF" : undefined, align: AlignmentType.RIGHT })], tw[2], { boxed: true, fill: last ? ACCENT : undefined }),
            ] });
          });
          children.push(grid(tw, rows));
        }
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
        { id: "DocTitle", name: "Title", basedOn: "Normal", next: "DocSubtitle", quickFormat: true, run: { size: pt(spec.titleSize ?? 30), bold: true, color: ACCENT }, paragraph: { spacing: { after: 60, line: 240 } } },
        { id: "DocSubtitle", name: "Subtitle", basedOn: "Normal", quickFormat: true, run: { size: pt(13.5) }, paragraph: { spacing: { after: 90 } } },
        { id: "Contact", name: "Contact Line", basedOn: "Normal", quickFormat: true, run: { size: pt(google ? 9 : 9.5) }, paragraph: { spacing: { after: 200 } } },
        { id: "Heading1", name: "heading 1", basedOn: "Normal", next: "BodyLine", quickFormat: true, run: { size: pt(13), bold: true, color: ACCENT }, paragraph: { spacing: { before: google ? 200 : 240, after: google ? 70 : 90, line: 240 }, keepNext: true, keepLines: true, outlineLevel: 0 } },
        { id: "EntryTitle", name: "Entry Title", basedOn: "Normal", next: "BodyLine", quickFormat: true, paragraph: { spacing: { after: 10 }, keepNext: true } },
        { id: "BodyLine", name: "Body", basedOn: "Normal", quickFormat: true, paragraph: { spacing: { after: 10 } } },
        { id: "BulletItem", name: "Bullet", basedOn: "Normal", quickFormat: true, paragraph: { spacing: { after: 10 } } },
        { id: "GroupHead", name: "Group Heading", basedOn: "Normal", quickFormat: true, run: { bold: true, color: ACCENT, size: pt(11) }, paragraph: { spacing: { after: 40 }, keepNext: true } },
        { id: "Gap", name: "Gap", basedOn: "Normal", paragraph: { spacing: { before: 0, after: 0, line: 120, lineRule: "exact" } } },
      ],
    },
    numbering: { config: [{ reference: "bullets", levels: [bulletLevel(500, 260)] }, { reference: "small", levels: [bulletLevel(300, 220)] }] },
    sections: [{ properties: { page: { size: { width: PAGE_W, height: 16838 }, margin: { top: 720, bottom: 600, left: MARGIN_X, right: MARGIN_X, header: 400, footer: 400 } } }, children }],
  });
  return Packer.toBuffer(doc);
}
