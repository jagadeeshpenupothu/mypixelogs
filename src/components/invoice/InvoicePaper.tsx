import type { CSSProperties } from "react";

import {
  bankRows, calculate, formatDate, money, rupeesInWords, symbols, toNumber, totalRows,
  type Invoice, type InvoiceKind,
} from "@/lib/invoice/model";

const gray = "#6b7280";
const cellBox: CSSProperties = { border: "1px solid #d5dce5", padding: "0.35em 0.5em", overflowWrap: "anywhere" };
const multi: CSSProperties = { whiteSpace: "pre-line", overflowWrap: "anywhere" };
const right: CSSProperties = { textAlign: "right" };
const tableStyle: CSSProperties = { width: "100%", borderCollapse: "collapse", tableLayout: "fixed" };
const halves: CSSProperties = { display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1.5em" };

function Pair({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div style={multi}>
      <span style={{ color: gray }}>{label}</span>{" "}
      <span style={{ fontWeight: bold ? 700 : 400 }}>{value}</span>
    </div>
  );
}

function Totals({ invoice, kind, color }: { invoice: Invoice; kind: InvoiceKind; color: string }) {
  const currency = kind === "gst" ? "INR" : invoice.currency;
  return (
    <table style={tableStyle}>
      <tbody>
        {totalRows(invoice, kind).map(([label, value]) => (
          <tr key={label}>
            <td style={{ ...cellBox, width: "56%" }}>{label}</td>
            <td style={{ ...cellBox, ...right }}>{value}</td>
          </tr>
        ))}
        <tr style={{ background: color, color: "#fff", fontWeight: 700, fontSize: "1.15em" }}>
          <td style={{ padding: "0.4em 0.5em" }}>{kind === "gst" ? "Total" : "Amount due"}</td>
          <td style={{ padding: "0.4em 0.5em", ...right }} data-testid="invoice-total">
            {symbols[currency]} {money(calculate(invoice, kind).total, currency)}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function Bank({ invoice, kind }: { invoice: Invoice; kind: InvoiceKind }) {
  return bankRows(invoice, kind).map(([label, value]) => <Pair key={label} label={label} value={value} />);
}

const gstColumns = ["5%", "27%", "10%", "10%", "11%", "14%", "8%", "15%"];
const gstHead = ["#", "Description", "HSN/SAC", "Qty/Unit", "Rate (₹)", "Taxable (₹)", "GST %", "Amount (₹)"];

function GstPaper({ invoice }: { invoice: Invoice }) {
  const navy = "#1e3a5f";
  const totals = calculate(invoice, "gst");
  const alignOf = (i: number): CSSProperties => ({ textAlign: i === 1 ? "left" : [4, 5, 7].includes(i) ? "right" : "center" });
  const title: CSSProperties = { color: navy, fontWeight: 700 };
  return (
    <>
      <div style={halves}>
        <div>
          <div style={{ ...title, ...multi, fontSize: "1.8em", lineHeight: 1.2 }}>{invoice.fromName || "Your Business Name"}</div>
          <div style={multi}>{invoice.fromAddress}</div>
          <div style={multi}>{[invoice.fromPhone, invoice.fromEmail].filter(Boolean).join("  |  ")}</div>
          {invoice.fromGstin ? <Pair label="GSTIN" value={invoice.fromGstin} bold /> : null}
        </div>
        <div style={right}>
          <div style={{ ...title, fontSize: "1.9em", lineHeight: 1.2 }}>TAX INVOICE</div>
          <div style={{ color: gray, fontSize: "0.9em" }}>Original for recipient</div>
        </div>
      </div>
      <table style={{ ...tableStyle, marginTop: "1em" }}>
        <tbody>
          <tr style={{ background: "#f1f5f9" }}>
            <td style={cellBox}><Pair label="Invoice no." value={invoice.number} bold /></td>
            <td style={cellBox}><Pair label="Invoice date" value={formatDate(invoice.date)} bold /></td>
            <td style={cellBox}><Pair label="Due date" value={formatDate(invoice.due)} bold /></td>
          </tr>
          <tr>
            <td style={cellBox}><Pair label="Place of supply" value={invoice.place} /></td>
            <td style={cellBox}><Pair label="Reverse charge" value={invoice.reverseCharge ? "Yes" : "No"} /></td>
            <td style={cellBox}><Pair label="PO no." value={invoice.po} /></td>
          </tr>
        </tbody>
      </table>
      <table style={{ ...tableStyle, marginTop: "1em" }}>
        <tbody>
          <tr style={{ background: "#f1f5f9", ...title }}><td style={cellBox}>Bill to</td><td style={cellBox}>Ship to</td></tr>
          <tr style={{ verticalAlign: "top" }}>
            <td style={cellBox}>
              <div style={{ ...multi, fontWeight: 700 }}>{invoice.toName || "Customer name"}</div>
              {[invoice.toCompany, invoice.toAddress, invoice.toState].filter(Boolean).map((v, i) => <div key={i} style={multi}>{v}</div>)}
              {invoice.toGstin ? <Pair label="GSTIN" value={invoice.toGstin} /> : null}
            </td>
            <td style={cellBox}>
              <div style={{ ...multi, fontWeight: 700 }}>{invoice.shipName}</div>
              {[invoice.shipAddress, invoice.shipState].filter(Boolean).map((v, i) => <div key={i} style={multi}>{v}</div>)}
            </td>
          </tr>
        </tbody>
      </table>
      <table style={{ ...tableStyle, marginTop: "1em", fontSize: "0.94em" }}>
        <colgroup>{gstColumns.map((width, i) => <col key={i} style={{ width }} />)}</colgroup>
        <thead>
          <tr style={{ background: navy, color: "#fff" }}>
            {gstHead.map((label, i) => <th key={label} style={{ padding: "0.45em 0.35em", fontSize: "0.92em", ...alignOf(i) }}>{label}</th>)}
          </tr>
        </thead>
        <tbody>
          {totals.lines.map(({ item, taxable, amount }, index) => (
            <tr key={item.id} style={{ breakInside: "avoid" }}>
              {[index + 1, item.description, item.hsn, `${item.qty} ${item.unit}`.trim(), item.rate ? money(Math.round(toNumber(item.rate) * 100)) : "", money(taxable), item.gst, money(amount)]
                .map((value, i) => <td key={i} style={{ ...cellBox, ...alignOf(i) }}>{value}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ ...halves, marginTop: "1em", breakInside: "avoid" }}>
        <div>
          <div style={title}>Amount in words</div>
          <div style={{ marginBottom: "0.7em" }}>{rupeesInWords(totals.total)}</div>
          {bankRows(invoice, "gst").length ? <div style={title}>Bank details</div> : null}
          <Bank invoice={invoice} kind="gst" />
        </div>
        <Totals invoice={invoice} kind="gst" color={navy} />
      </div>
      <div style={{ ...halves, marginTop: "1.2em", breakInside: "avoid" }}>
        <div>{invoice.terms.trim() ? <><div style={title}>Terms</div><div style={multi}>{invoice.terms}</div></> : null}</div>
        <div style={right}>
          <div style={{ fontWeight: 700, marginBottom: "3.5em" }}>For {invoice.fromName || "Your Business Name"}</div>
          <div style={{ color: gray }}>Authorised signatory</div>
        </div>
      </div>
    </>
  );
}

function FreelancerPaper({ invoice }: { invoice: Invoice }) {
  const teal = "#0f766e";
  const title: CSSProperties = { color: teal, fontWeight: 700 };
  const totals = calculate(invoice, "freelancer");
  const pad: CSSProperties = { padding: "0.6em 0.4em", overflowWrap: "anywhere" };
  return (
    <>
      <div style={{ ...halves, alignItems: "center", borderBottom: `0.22em solid ${teal}`, paddingBottom: "1.2em" }}>
        <div>
          <div style={{ ...multi, fontSize: "2.3em", fontWeight: 700, lineHeight: 1.15 }}>{invoice.fromName || "Your Name"}</div>
          <div style={{ color: teal, fontSize: "1.1em" }}>{invoice.fromRole}</div>
        </div>
        <div style={right}>
          {[invoice.fromEmail, invoice.fromPhone, invoice.fromWebsite, invoice.fromAddress].filter(Boolean).map((v, i) => <div key={i} style={multi}>{v}</div>)}
        </div>
      </div>
      <div style={{ ...halves, marginTop: "1.5em" }}>
        <div>
          <div style={title}>Invoice to</div>
          <div style={{ ...multi, fontWeight: 700, fontSize: "1.15em" }}>{invoice.toName || "Client name"}</div>
          {[invoice.toCompany, invoice.toAddress, invoice.toEmail].filter(Boolean).map((v, i) => <div key={i} style={multi}>{v}</div>)}
        </div>
        <div style={{ background: "#e6f4f1", padding: "0.9em 1.1em" }}>
          <div style={{ ...title, fontSize: "1.65em", lineHeight: 1.3 }}>INVOICE</div>
          <Pair label="Invoice no." value={invoice.number} bold />
          {invoice.date ? <Pair label="Issued" value={formatDate(invoice.date)} /> : null}
          {invoice.due ? <Pair label="Due" value={formatDate(invoice.due)} bold /> : null}
          {invoice.project ? <Pair label="Project" value={invoice.project} /> : null}
        </div>
      </div>
      <table style={{ ...tableStyle, marginTop: "1.6em" }}>
        <colgroup>{["48%", "14%", "18%", "20%"].map((width) => <col key={width} style={{ width }} />)}</colgroup>
        <thead>
          <tr style={{ ...title, borderBottom: `2px solid ${teal}` }}>
            {["Description", "Hours / Qty", "Rate", "Amount"].map((label, i) => <th key={label} style={{ ...pad, textAlign: i ? "right" : "left" }}>{label}</th>)}
          </tr>
        </thead>
        <tbody>
          {totals.lines.map(({ item, amount }) => (
            <tr key={item.id} style={{ borderBottom: "1px solid #d1d5db", breakInside: "avoid" }}>
              <td style={pad}><div style={{ fontWeight: 700 }}>{item.description || " "}</div><div style={{ color: gray, fontSize: "0.9em" }}>{item.detail}</div></td>
              {[`${item.qty} ${item.unit}`.trim(), item.rate ? money(Math.round(toNumber(item.rate) * 100), invoice.currency) : "", money(amount, invoice.currency)]
                .map((value, i) => <td key={i} style={{ ...pad, ...right }}>{value}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ ...halves, marginTop: "1.2em", breakInside: "avoid" }}><div /><Totals invoice={invoice} kind="freelancer" color={teal} /></div>
      <div style={{ ...halves, gridTemplateColumns: "1fr 1fr", marginTop: "1.8em", breakInside: "avoid" }}>
        <div>{bankRows(invoice, "freelancer").length ? <div style={title}>Payment details</div> : null}<Bank invoice={invoice} kind="freelancer" /></div>
        <div>{invoice.terms.trim() ? <><div style={title}>Payment terms</div><div style={multi}>{invoice.terms}</div></> : null}</div>
      </div>
    </>
  );
}

export function InvoicePaper({ invoice, kind }: { invoice: Invoice; kind: InvoiceKind }) {
  return kind === "gst" ? <GstPaper invoice={invoice} /> : <FreelancerPaper invoice={invoice} />;
}
