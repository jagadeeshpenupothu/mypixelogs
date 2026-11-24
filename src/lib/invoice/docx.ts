import {
  AlignmentType, BorderStyle, Document, Packer, Paragraph, ShadingType, Table, TableCell,
  TableLayoutType, TableRow, TextRun, VerticalAlign, WidthType,
} from "docx";

import {
  bankRows, calculate, formatDate, money, rupeesInWords, splitLines, symbols, toNumber, totalRows,
  type Invoice, type InvoiceKind,
} from "@/lib/invoice/model";

const none = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorder = { top: none, bottom: none, left: none, right: none };
const line = { style: BorderStyle.SINGLE, size: 4, color: "D5DCE5" };
const box = { top: line, bottom: line, left: line, right: line };
const { RIGHT, CENTER } = AlignmentType;

type Align = (typeof AlignmentType)[keyof typeof AlignmentType];
type TextOptions = { bold?: boolean; size?: number; color?: string; align?: Align; after?: number };

const run = (text: string, o: TextOptions = {}) =>
  new TextRun({ text, bold: o.bold, size: o.size ?? 19, color: o.color ?? "1F2937" });
const para = (text: string, o: TextOptions = {}) =>
  new Paragraph({ alignment: o.align, spacing: { before: 0, after: o.after ?? 30 }, children: [run(text, o)] });
const pair = (label: string, value: string, bold = false) =>
  new Paragraph({ spacing: { after: 30 }, children: [run(`${label}  `, { color: "6B7280", size: 18 }), run(value, { bold })] });
const gap = (height = 160) =>
  new Paragraph({ spacing: { before: 0, after: 0, line: height, lineRule: "exact" }, children: [] });

type CellOptions = { fill?: string; border?: typeof box; top?: boolean; left?: number; right?: number };
const cell = (children: (Paragraph | Table)[], width: number, o: CellOptions = {}) =>
  new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders: o.border ?? noBorder,
    verticalAlign: o.top ? VerticalAlign.TOP : VerticalAlign.CENTER,
    shading: o.fill ? { type: ShadingType.CLEAR, color: "auto", fill: o.fill } : undefined,
    margins: { top: 55, bottom: 55, left: o.left ?? 90, right: o.right ?? 90 },
    children: children.length ? children : [para("")],
  });
const row = (cells: TableCell[], header = false) =>
  new TableRow({ children: cells, cantSplit: true, tableHeader: header });
const table = (columns: number[], rows: TableRow[]) =>
  new Table({
    width: { size: columns.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths: columns, layout: TableLayoutType.FIXED, rows,
  });

function totalsTable(invoice: Invoice, kind: InvoiceKind, color: string) {
  const totals = calculate(invoice, kind);
  const rows = totalRows(invoice, kind).map(([label, value]) =>
    row([cell([para(label, { after: 0 })], 2600, { border: box }), cell([para(value, { align: RIGHT, after: 0 })], 2000, { border: box })]));
  const symbol = symbols[kind === "gst" ? "INR" : invoice.currency];
  const strong = { bold: true, size: 22, color: "FFFFFF", after: 0 };
  rows.push(row([
    cell([para(kind === "gst" ? "Total" : "Amount due", strong)], 2600, { fill: color }),
    cell([para(`${symbol} ${money(totals.total, kind === "gst" ? "INR" : invoice.currency)}`, { ...strong, align: RIGHT })], 2000, { fill: color }),
  ]));
  return table([2600, 2000], rows);
}

const lines = (values: string[]) => values.filter((v) => v.trim()).flatMap((v) => splitLines(v)).map((v) => para(v));

function gstContent(invoice: Invoice) {
  const navy = "1E3A5F";
  const light = "F1F5F9";
  const totals = calculate(invoice, "gst");
  const columns = [480, 2826, 960, 900, 1080, 1380, 820, 1760];
  const aligns: (Align | undefined)[] = [CENTER, undefined, CENTER, CENTER, RIGHT, RIGHT, CENTER, RIGHT];
  const head = ["#", "Description", "HSN/SAC", "Qty/Unit", "Rate (₹)", "Taxable (₹)", "GST %", "Amount (₹)"];
  const itemRows = totals.lines.map(({ item, taxable, amount }, index) =>
    row([
      String(index + 1), item.description, item.hsn, `${item.qty} ${item.unit}`.trim(),
      item.rate ? money(Math.round(toNumber(item.rate) * 100)) : "", money(taxable), item.gst, money(amount),
    ].map((text, i) => cell([para(text, { size: 18, align: aligns[i], after: 0 })], columns[i], { border: box }))));
  const title = (text: string) => para(text, { bold: true, color: navy, size: 18 });

  return [
    table([6206, 4000], [row([
      cell([para(invoice.fromName, { bold: true, size: 34, color: navy, after: 60 }),
        ...lines([invoice.fromAddress, [invoice.fromPhone, invoice.fromEmail].filter(Boolean).join("  |  ")]),
        ...(invoice.fromGstin ? [pair("GSTIN", invoice.fromGstin, true)] : [])], 6206, { left: 0, top: true }),
      cell([para("TAX INVOICE", { bold: true, size: 36, color: navy, align: RIGHT, after: 60 }),
        para("Original for recipient", { size: 17, color: "6B7280", align: RIGHT })], 4000, { right: 0, top: true }),
    ])]),
    gap(),
    table([3402, 3402, 3402], [
      row([["Invoice no.", invoice.number], ["Invoice date", formatDate(invoice.date)], ["Due date", formatDate(invoice.due)]]
        .map(([k, v]) => cell([pair(k, v, true)], 3402, { fill: light, border: box }))),
      row([["Place of supply", invoice.place], ["Reverse charge", invoice.reverseCharge ? "Yes" : "No"], ["PO no.", invoice.po]]
        .map(([k, v]) => cell([pair(k, v)], 3402, { border: box }))),
    ]),
    gap(),
    table([5103, 5103], [
      row(["Bill to", "Ship to"].map((t) => cell([title(t)], 5103, { fill: light, border: box }))),
      row([
        cell([para(invoice.toName, { bold: true }), ...lines([invoice.toCompany, invoice.toAddress, invoice.toState]),
          ...(invoice.toGstin ? [pair("GSTIN", invoice.toGstin)] : [])], 5103, { border: box, top: true }),
        cell([para(invoice.shipName, { bold: true }), ...lines([invoice.shipAddress, invoice.shipState])], 5103, { border: box, top: true }),
      ]),
    ]),
    gap(),
    table(columns, [
      row(head.map((t, i) => cell([para(t, { bold: true, size: 17, color: "FFFFFF", align: aligns[i], after: 0 })], columns[i], { fill: navy })), true),
      ...itemRows,
    ]),
    gap(),
    table([5606, 4600], [row([
      cell([title("Amount in words"), para(rupeesInWords(totals.total), { after: 120 }),
        ...(bankRows(invoice, "gst").length ? [title("Bank details"), ...bankRows(invoice, "gst").map(([k, v]) => pair(k, v))] : [])], 5606, { left: 0, top: true }),
      cell([totalsTable(invoice, "gst", navy), gap(20)], 4600, { left: 0, right: 0, top: true }),
    ])]),
    gap(),
    table([5606, 4600], [row([
      cell(invoice.terms.trim() ? [title("Terms"), ...lines([invoice.terms])] : [], 5606, { left: 0, top: true }),
      cell([para(`For ${invoice.fromName}`, { bold: true, align: RIGHT, after: 640 }),
        para("Authorised signatory", { size: 18, color: "6B7280", align: RIGHT })], 4600, { right: 0, top: true }),
    ])]),
  ];
}

function freelancerContent(invoice: Invoice) {
  const teal = "0F766E";
  const c = invoice.currency;
  const totals = calculate(invoice, "freelancer");
  const columns = [5006, 1300, 1900, 2000];
  const title = (text: string) => para(text, { bold: true, color: teal, size: 18, after: 60 });
  const bottom = (color: string, size: number) => ({ ...noBorder, bottom: { style: BorderStyle.SINGLE, size, color } }) as unknown as typeof box;
  const banks = bankRows(invoice, "freelancer");

  return [
    table([5606, 4600], [row([
      cell([para(invoice.fromName, { bold: true, size: 44, color: "111827", after: 40 }),
        ...(invoice.fromRole ? [para(invoice.fromRole, { color: teal, size: 22 })] : [])], 5606, { left: 0 }),
      cell([invoice.fromEmail, invoice.fromPhone, invoice.fromWebsite, ...splitLines(invoice.fromAddress)]
        .filter(Boolean).map((v) => para(v, { align: RIGHT })), 4600, { right: 0 }),
    ])]),
    new Paragraph({ spacing: { before: 120, after: 240 }, border: { bottom: { style: BorderStyle.SINGLE, size: 18, color: teal, space: 1 } }, children: [] }),
    table([5606, 4600], [row([
      cell([title("Invoice to"), para(invoice.toName, { bold: true, size: 22 }),
        ...lines([invoice.toCompany, invoice.toAddress, invoice.toEmail])], 5606, { left: 0, top: true }),
      cell([para("INVOICE", { bold: true, size: 32, color: teal, after: 80 }),
        ...[["Invoice no.", invoice.number], ["Issued", formatDate(invoice.date)], ["Due", formatDate(invoice.due)], ["Project", invoice.project]]
          .filter(([, v]) => v).map(([k, v]) => pair(k, v, k === "Invoice no." || k === "Due"))], 4600, { fill: "E6F4F1", left: 220, top: true }),
    ])]),
    gap(320),
    table(columns, [
      row(["Description", "Hours / Qty", "Rate", "Amount"].map((t, i) =>
        cell([para(t, { bold: true, color: teal, size: 18, align: i ? RIGHT : undefined, after: 0 })], columns[i], { border: bottom(teal, 12) })), true),
      ...totals.lines.map(({ item, amount }) => row([
        cell([para(item.description, { bold: true, after: 0 }), ...(item.detail ? [para(item.detail, { size: 17, color: "6B7280", after: 0 })] : [])], columns[0], { border: bottom("D1D5DB", 4) }),
        ...[`${item.qty} ${item.unit}`.trim(), item.rate ? money(Math.round(toNumber(item.rate) * 100), c) : "", money(amount, c)]
          .map((t, i) => cell([para(t, { align: RIGHT, after: 0 })], columns[i + 1], { border: bottom("D1D5DB", 4) })),
      ])),
    ]),
    gap(200),
    table([5606, 4600], [row([cell([], 5606), cell([totalsTable(invoice, "freelancer", teal), gap(20)], 4600, { left: 0, right: 0 })])]),
    gap(300),
    table([5103, 5103], [row([
      cell(banks.length ? [title("Payment details"), ...banks.map(([k, v]) => pair(k, v))] : [], 5103, { left: 0, top: true }),
      cell(invoice.terms.trim() ? [title("Payment terms"), ...lines([invoice.terms])] : [], 5103, { right: 0, top: true }),
    ])]),
  ];
}

export async function invoiceToDocx(invoice: Invoice, kind: InvoiceKind): Promise<Blob> {
  const document = new Document({
    creator: "MyPixelogs",
    title: `Invoice ${invoice.number}`,
    styles: { default: { document: { run: { font: "Arial", size: 19 } } } },
    sections: [{
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 737, bottom: 680, left: 850, right: 850 } } },
      children: kind === "gst" ? gstContent(invoice) : freelancerContent(invoice),
    }],
  });
  return Packer.toBlob(document);
}
