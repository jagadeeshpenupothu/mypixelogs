// Renders a spec as a one-page A4 HTML document (794 x 1123 px), used to import the template into Canva.
import { parts, plain } from "./spec.mjs";

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const rich = (text) => parts(text).map(([t, b]) => (b ? `<span class="b">${esc(t)}</span>` : esc(t))).join("");

export function renderHtml(spec) {
  const A = `#${spec.accent}`;
  const out = [];
  for (const block of spec.blocks) {
    const center = block.align === "center" ? ' style="text-align:center"' : "";
    switch (block.type) {
      case "title":
        out.push(`<p class="title"${center}>${esc(plain(block.text))}</p>`);
        if (block.subtitle) out.push(`<p class="subtitle"${center}>${rich(block.subtitle)}</p>`);
        break;
      case "contact":
        out.push(`<p class="contact${block.rule === false ? " norule" : ""}"${center}>${block.items.map(rich).join("&nbsp; | &nbsp;")}</p>`);
        break;
      case "heading":
        out.push(`<div class="h"><span>${esc(plain(block.text))}</span><span class="line"></span></div>`);
        break;
      case "text":
        for (const t of [].concat(block.text)) out.push(`<p class="para"${block.align ? ` style="text-align:${block.align}"` : ""}>${rich(t)}</p>`);
        break;
      case "entry":
        out.push(`<div class="row"><p><span class="b">${rich(block.title)}</span>${block.after ? ` &nbsp;|&nbsp; ${rich(block.after)}` : ""}</p><p>${esc(block.right ?? "")}</p></div>`);
        for (const l of block.lines ?? []) out.push(`<p>${rich(l)}</p>`);
        for (const b of block.bullets ?? []) out.push(`<p class="li">•&nbsp; ${rich(b)}</p>`);
        out.push('<div class="gap"></div>');
        break;
      case "bullets":
        for (const b of block.items) out.push(`<p class="li">•&nbsp; ${rich(b)}</p>`);
        break;
      case "fields": {
        const cols = block.columns === 1 ? 1 : 2;
        out.push(`<div class="fields c${cols}">${block.items.map(([l, v]) => `<p><span class="b">${rich(l)}</span></p><p>${rich(v)}</p>`).join("")}</div>`);
        break;
      }
      case "table": {
        const total = block.columns.reduce((s, c) => s + (c.width ?? 1), 0);
        const th = block.columns.map((c) => `<th style="width:${(((c.width ?? 1) / total) * 100).toFixed(1)}%;text-align:${c.align ?? "left"}">${esc(c.label)}</th>`).join("");
        const rows = block.rows.map((r) => `<tr>${r.map((v, i) => `<td style="text-align:${block.columns[i].align ?? "left"}">${rich(v)}</td>`).join("")}</tr>`).join("");
        out.push(`<table class="grid"><thead><tr>${th}</tr></thead><tbody>${rows}</tbody></table>`);
        if (block.totals?.length) {
          out.push(`<table class="totals">${block.totals.map(([l, v], i) => `<tr class="${i === block.totals.length - 1 ? "last" : ""}"><td>${esc(l)}</td><td>${esc(v)}</td></tr>`).join("")}</table>`);
        }
        out.push('<div class="gap"></div>');
        break;
      }
      case "columns":
        out.push(`<div class="cols">${block.groups.map((g) => `<div class="col"><p class="gh">${esc(g.heading)}</p>${g.items.map((it) => `<p class="li s">•&nbsp; ${rich(it)}</p>`).join("")}</div>`).join("")}</div>`);
        break;
      case "signature": {
        const items = block.items ?? ["Authorised Signatory"];
        out.push(`<div class="sig${items.length === 1 ? " one" : ""}">${items.map((s) => `<p>${rich(s)}</p>`).join("")}</div>`);
        break;
      }
      case "spacer":
        out.push(`<div style="height:${Math.round((block.size ?? 12) * 1.333)}px"></div>`);
        break;
      default:
        break;
    }
  }

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>${esc(spec.title)} – MyPixelogs (for Canva import)</title>
<style>
body{margin:0;background:#fff}
.page{width:794px;height:1123px;box-sizing:border-box;padding:48px 51px 40px;background:#fff;font-family:Cambria,Georgia,"Times New Roman",serif;font-size:14px;line-height:1.32;color:#1a1a1a;overflow:hidden}
p{margin:0}.b{font-weight:700}
.title{font-size:${Math.round((spec.titleSize ?? 30) * 1.333)}px;font-weight:700;color:${A};line-height:1.05;margin-bottom:4px}
.subtitle{font-size:18px;margin-bottom:6px}
.contact{font-size:12.5px;padding-bottom:9px;border-bottom:3px solid ${A}}.contact.norule{border:0}
.h{display:flex;align-items:center;gap:10px;margin:15px 0 6px;font-size:17px;font-weight:700;color:${A}}.h .line{flex:1;height:1px;background:#8496b0}
.row{display:flex;justify-content:space-between;gap:16px}.gap{height:8px}.para{margin-bottom:5px}
.li{padding-left:33px;text-indent:-17px}.li.s{padding-left:20px;text-indent:-14px}
.fields{display:grid;column-gap:12px;row-gap:3px}.fields.c2{grid-template-columns:22% 28% 22% 28%}.fields.c1{grid-template-columns:30% 70%}
table{border-collapse:collapse;width:100%;font-size:13px}
.grid th{background:${A};color:#fff;font-weight:700;padding:5px 7px;border:1px solid #c9d1dc}.grid td{padding:5px 7px;border:1px solid #c9d1dc;vertical-align:top}
.totals{width:40%;margin-left:auto}.totals td{padding:4px 7px;border:1px solid #c9d1dc}.totals td:first-child{background:#f2f4f8}.totals td:last-child{text-align:right}
.totals tr.last td{background:${A};color:#fff;font-weight:700}
.cols{display:flex}.col{flex:1;padding:0 8px 0 20px;border-left:1px solid #a6a6a6}.col:first-child{border:0;padding-left:11px}.gh{font-size:14.5px;font-weight:700;color:${A};margin-bottom:3px}
.sig{display:flex;justify-content:space-around;gap:40px;margin-top:46px}.sig.one{justify-content:flex-end}.sig p{min-width:190px;border-top:1px solid #1a1a1a;padding-top:4px;text-align:center}
</style></head>
<body><div class="page" data-document-role="page" data-label="${esc(spec.title)}">
${out.join("\n")}
</div></body></html>
`;
}
