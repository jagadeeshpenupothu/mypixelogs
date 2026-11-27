// Renders a spec as a pdfLaTeX document for Overleaf.
import { parts, plain } from "./spec.mjs";

const tex = (s) =>
  String(s ?? "")
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/([&%$#_{}])/g, "\\$1")
    .replace(/~/g, "$\\sim$")
    .replace(/\^/g, "\\^{}")
    .replace(/\|/g, "\\textbar{}")
    .replace(/–/g, "--")
    .replace(/—/g, "---")
    .replace(/₹/g, "Rs.\\,");
const rich = (text) => parts(text).map(([t, b]) => (b ? `\\textbf{${tex(t)}}` : tex(t))).join("");

export function renderTex(spec) {
  const out = [];
  for (const block of spec.blocks) {
    const center = block.align === "center";
    switch (block.type) {
      case "title":
        out.push(`${center ? "\\begin{center}" : ""}{\\color{accent}\\fontsize{${spec.titleSize ?? 30}}{${(spec.titleSize ?? 30) + 4}}\\selectfont\\bfseries ${tex(plain(block.text))}}\\par\\vspace{3pt}`);
        if (block.subtitle) out.push(`{\\fontsize{13.5}{16}\\selectfont ${rich(block.subtitle)}}\\par\\vspace{4pt}`);
        if (center) out.push("\\end{center}");
        break;
      case "contact":
        out.push(`{\\fontsize{8.8}{11}\\selectfont ${block.items.map(rich).join(" \\enspace\\textbar\\enspace ")}}\\par`);
        if (block.rule !== false) out.push("\\vspace{5pt}{\\color{accent}\\rule{\\linewidth}{1.8pt}}\\par");
        break;
      case "heading":
        out.push(`\\section{${tex(plain(block.text))}}`);
        break;
      case "text":
        for (const t of [].concat(block.text)) out.push(`${block.align === "right" ? "\\hfill " : ""}${rich(t)}\\par\\vspace{4pt}`);
        break;
      case "entry":
        out.push(`\\entry{${rich(block.title)}${block.after ? ` \\enspace{\\normalfont\\textbar\\enspace ${rich(block.after)}}` : ""}}{${tex(block.right ?? "")}}`);
        for (const l of block.lines ?? []) out.push(`${rich(l)}\\par`);
        if (block.bullets?.length) out.push(`\\begin{itemize}\n${block.bullets.map((b) => `  \\item ${rich(b)}`).join("\n")}\n\\end{itemize}`);
        out.push("\\vspace{4pt}");
        break;
      case "bullets":
        out.push(`\\begin{itemize}\n${block.items.map((b) => `  \\item ${rich(b)}`).join("\n")}\n\\end{itemize}`);
        break;
      case "fields": {
        const two = block.columns !== 1;
        const rows = [];
        for (let i = 0; i < block.items.length; i += two ? 2 : 1) {
          const cells = [block.items[i], two ? block.items[i + 1] ?? ["", ""] : null].filter(Boolean).flatMap(([l, v]) => [`\\textbf{${rich(l)}}`, rich(v)]);
          rows.push(`${cells.join(" & ")} \\\\`);
        }
        out.push(`\\begin{tabularx}{\\linewidth}{@{}${two ? "p{0.2\\linewidth}X p{0.2\\linewidth}X" : "p{0.3\\linewidth}X"}@{}}\n${rows.join("\n")}\n\\end{tabularx}\\par\\vspace{2pt}`);
        break;
      }
      case "table": {
        const total = block.columns.reduce((s, c) => s + (c.width ?? 1), 0);
        const spec2 = block.columns.map((c) => {
          const w = (((c.width ?? 1) / total) * 0.96).toFixed(3);
          const al = c.align === "right" ? "\\raggedleft" : c.align === "center" ? "\\centering" : "\\raggedright";
          return `>{${al}\\arraybackslash}p{${w}\\linewidth}`;
        }).join("|");
        const head = block.columns.map((c) => `\\textcolor{white}{\\textbf{${tex(c.label)}}}`).join(" & ");
        const rows = block.rows.map((r) => `${r.map(rich).join(" & ")} \\\\ \\hline`).join("\n");
        out.push(`{\\setlength{\\tabcolsep}{4pt}\\renewcommand{\\arraystretch}{1.25}\\arrayrulecolor{rulegray}\n\\noindent\\begin{tabular}{|${spec2}|}\\hline\n\\rowcolor{accent}${head} \\\\ \\hline\n${rows}\n\\end{tabular}}\\par`);
        if (block.totals?.length) {
          const t = block.totals.map(([l, v], i) => (i === block.totals.length - 1 ? `\\rowcolor{accent}\\textcolor{white}{\\textbf{${tex(l)}}} & \\textcolor{white}{\\textbf{${tex(v)}}} \\\\ \\hline` : `${tex(l)} & ${tex(v)} \\\\ \\hline`)).join("\n");
          out.push(`\\vspace{2pt}{\\setlength{\\tabcolsep}{4pt}\\renewcommand{\\arraystretch}{1.25}\\arrayrulecolor{rulegray}\\hfill\\begin{tabular}{|p{0.22\\linewidth}|>{\\raggedleft\\arraybackslash}p{0.14\\linewidth}|}\\hline\n${t}\n\\end{tabular}}\\par`);
        }
        out.push("\\vspace{4pt}");
        break;
      }
      case "columns": {
        const n = block.groups.length;
        const cols = Array(n).fill("X").join("!{\\color{divider}\\vrule}@{\\hspace{10pt}}");
        const cells = block.groups.map((g) => `\\group{${tex(g.heading)}}{${g.items.map((it) => `\\item ${rich(it)}`).join(" ")}}`).join(" &\n");
        out.push(`\\begin{tabularx}{\\linewidth}{@{\\hspace{6pt}}${cols}@{}}\n${cells} \\\\\n\\end{tabularx}`);
        break;
      }
      case "signature": {
        const items = block.items ?? ["Authorised Signatory"];
        out.push(`\\vspace{32pt}\\noindent${items.length === 1 ? "\\hfill" : ""}${items.map((s) => `\\parbox[t]{0.3\\linewidth}{\\centering\\rule{\\linewidth}{0.5pt}\\\\ ${rich(s)}}`).join("\\hfill")}\\par`);
        break;
      }
      case "spacer":
        out.push(`\\vspace{${block.size ?? 12}pt}`);
        break;
      default:
        break;
    }
  }

  return `% ${spec.title} - MyPixelogs (https://mypixelogs.netlify.app/templates/${spec.slug})
% Free to use. Replace the sample text with your own, then click Recompile. Compiles with pdfLaTeX.
\\documentclass[10pt]{article}
\\usepackage[a4paper, top=12.7mm, bottom=10.5mm, left=13.4mm, right=13.4mm]{geometry}
\\usepackage[T1]{fontenc}
\\usepackage[utf8]{inputenc}
\\usepackage{charter}
\\usepackage[table]{xcolor}
\\usepackage[explicit]{titlesec}
\\usepackage{enumitem}
\\usepackage{tabularx}
\\usepackage{array}
\\usepackage[hidelinks]{hyperref}
\\usepackage{microtype}
\\definecolor{accent}{HTML}{${spec.accent}}
\\definecolor{rulegray}{HTML}{8496B0}
\\definecolor{divider}{HTML}{A6A6A6}
\\pagestyle{empty}
\\setlength{\\parindent}{0pt}
\\titleformat{\\section}{\\color{accent}\\fontsize{13}{15}\\bfseries}{}{0pt}{#1\\hspace{8pt}{\\color{rulegray}\\leaders\\hrule height 0.6pt\\hfill\\kern0pt}}
\\titlespacing*{\\section}{0pt}{10pt}{4pt}
\\setlist[itemize]{leftmargin=18pt, label=\\textbullet, itemsep=0pt, topsep=1pt, parsep=0pt}
\\newcommand{\\entry}[2]{\\textbf{#1}\\hfill #2\\par}
\\newcommand{\\group}[2]{\\begin{minipage}[t]{\\linewidth}{\\color{accent}\\bfseries\\fontsize{11}{13}\\selectfont #1}\\par\\vspace{1pt}\\begin{itemize}[leftmargin=12pt, topsep=0pt, partopsep=0pt]#2\\end{itemize}\\end{minipage}}
\\begin{document}
\\fontsize{10.5}{13.2}\\selectfont
${out.join("\n\n")}
\\end{document}
`;
}
