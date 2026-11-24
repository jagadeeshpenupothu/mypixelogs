"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { FileText, Plus, Printer, RotateCcw, Trash2 } from "lucide-react";

import { InvoicePaper } from "@/components/invoice/InvoicePaper";
import { Button } from "@/components/ui/button";
import {
  emptyInvoice, fileName, newItem, restoreInvoice,
  type Currency, type FieldKey, type Invoice, type InvoiceItem, type InvoiceKind,
} from "@/lib/invoice/model";

const inputClass =
  "w-full min-w-0 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70";

type FieldSpec = { key: FieldKey; label: string; type?: string; area?: boolean; placeholder?: string; wide?: boolean };

const sections: Record<InvoiceKind, { title: string; fields: FieldSpec[] }[]> = {
  gst: [
    { title: "Your business", fields: [
      { key: "fromName", label: "Business name", wide: true },
      { key: "fromAddress", label: "Address", area: true, wide: true, placeholder: "Address, city, state, PIN" },
      { key: "fromPhone", label: "Phone", type: "tel" }, { key: "fromEmail", label: "Email", type: "email" },
      { key: "fromGstin", label: "GSTIN", wide: true, placeholder: "15 characters" },
    ] },
    { title: "Invoice details", fields: [
      { key: "number", label: "Invoice number" }, { key: "date", label: "Invoice date", type: "date" },
      { key: "due", label: "Due date", type: "date" }, { key: "place", label: "Place of supply", placeholder: "State, code" },
      { key: "po", label: "PO number (optional)", wide: true },
    ] },
    { title: "Bill to", fields: [
      { key: "toName", label: "Customer name", wide: true }, { key: "toAddress", label: "Address", area: true, wide: true },
      { key: "toState", label: "State, code" }, { key: "toGstin", label: "GSTIN (if registered)" },
    ] },
    { title: "Ship to (optional)", fields: [
      { key: "shipName", label: "Name", wide: true }, { key: "shipAddress", label: "Delivery address", area: true, wide: true },
      { key: "shipState", label: "State, code", wide: true },
    ] },
  ],
  freelancer: [
    { title: "Your details", fields: [
      { key: "fromName", label: "Your name" }, { key: "fromRole", label: "What you do" },
      { key: "fromEmail", label: "Email", type: "email" }, { key: "fromPhone", label: "Phone", type: "tel" },
      { key: "fromWebsite", label: "Website" }, { key: "fromAddress", label: "City, country" },
    ] },
    { title: "Invoice details", fields: [
      { key: "number", label: "Invoice number" }, { key: "project", label: "Project name" },
      { key: "date", label: "Issue date", type: "date" }, { key: "due", label: "Due date", type: "date" },
    ] },
    { title: "Invoice to", fields: [
      { key: "toName", label: "Client name" }, { key: "toCompany", label: "Company" },
      { key: "toAddress", label: "Address", area: true, wide: true }, { key: "toEmail", label: "Email", type: "email", wide: true },
    ] },
  ],
};

const paymentFields: FieldSpec[] = [
  { key: "bankName", label: "Account name" }, { key: "bankNumber", label: "Account number" },
  { key: "bankCode", label: "IFSC / SWIFT" }, { key: "upi", label: "UPI ID" },
  { key: "terms", label: "Payment terms", area: true, wide: true },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="rounded-lg border border-border bg-card p-4">
      <legend className="px-1 text-sm font-semibold text-foreground">{title}</legend>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Labelled({ label, wide, children }: { label: string; wide?: boolean; children: ReactNode }) {
  return (
    <label className={`block min-w-0 ${wide ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export function InvoiceEditor({ kind, title }: { kind: InvoiceKind; title: string }) {
  const storageKey = `mypixelogs-invoice-${kind}`;
  const [invoice, setInvoice] = useState<Invoice>(emptyInvoice);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let saved: unknown = null;
    try {
      saved = JSON.parse(localStorage.getItem(storageKey) ?? "null");
    } catch {
      // Storage is blocked or the saved data is damaged: start fresh.
    }
    const loaded = restoreInvoice(saved);
    if (!saved) {
      const now = new Date();
      loaded.date = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser storage is only readable after mount
    setInvoice(loaded);
    setReady(true);
  }, [storageKey]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(invoice));
    } catch {
      // Editing still works without saving.
    }
  }, [invoice, ready, storageKey]);

  const patch = (change: Partial<Invoice>) => setInvoice((current) => ({ ...current, ...change }));
  const patchItem = (id: string, change: Partial<InvoiceItem>) =>
    setInvoice((current) => ({ ...current, items: current.items.map((item) => (item.id === id ? { ...item, ...change } : item)) }));

  const renderField = (field: FieldSpec) => (
    <Labelled key={field.key} label={field.label} wide={field.wide}>
      {field.area ? (
        <textarea className={inputClass} rows={2} maxLength={1000} placeholder={field.placeholder} value={invoice[field.key]} onChange={(e) => patch({ [field.key]: e.target.value })} />
      ) : (
        <input className={inputClass} type={field.type ?? "text"} autoComplete="off" maxLength={200} placeholder={field.placeholder} value={invoice[field.key]} onChange={(e) => patch({ [field.key]: e.target.value })} />
      )}
    </Labelled>
  );

  const itemInput = (item: InvoiceItem, key: Exclude<keyof InvoiceItem, "id">, label: string, options: { wide?: boolean; numeric?: boolean } = {}) => (
    <Labelled label={label} wide={options.wide}>
      <input className={inputClass} inputMode={options.numeric ? "decimal" : undefined} autoComplete="off" maxLength={300} value={item[key]} onChange={(e) => patchItem(item.id, { [key]: e.target.value })} />
    </Labelled>
  );

  async function downloadWord() {
    setBusy(true);
    setMessage("");
    try {
      const { invoiceToDocx } = await import("@/lib/invoice/docx");
      const url = URL.createObjectURL(await invoiceToDocx(invoice, kind));
      const link = document.createElement("a");
      link.href = url;
      link.download = `${fileName(invoice)}.docx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      setMessage("Word file downloaded.");
    } catch {
      setMessage("The Word file could not be made. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function savePdf() {
    const previous = document.title;
    document.title = fileName(invoice);
    window.addEventListener("afterprint", () => { document.title = previous; }, { once: true });
    window.print();
  }

  function clearAll() {
    if (!window.confirm("Clear everything you entered in this invoice?")) return;
    setInvoice(emptyInvoice());
    setMessage("Invoice cleared.");
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Fill in the details and download. Your entries are saved only in this browser and are not uploaded. Use Clear on a shared computer.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={downloadWord} disabled={!ready || busy}><FileText className="h-4 w-4" />{busy ? "Preparing..." : "Download Word"}</Button>
          <Button type="button" variant="outline" onClick={savePdf} disabled={!ready}><Printer className="h-4 w-4" />Print / Save PDF</Button>
          <Button type="button" variant="ghost" onClick={clearAll} disabled={!ready}><RotateCcw className="h-4 w-4" />Clear</Button>
        </div>
      </div>
      <p role="status" className="mt-2 min-h-5 text-sm text-muted-foreground">{message}</p>

      <div className="mt-2 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] xl:items-start">
        <form className="grid min-w-0 gap-4" onSubmit={(e) => e.preventDefault()} autoComplete="off">
          <div className="contents">
            {sections[kind].map((section) => <Section key={section.title} title={section.title}>{section.fields.map(renderField)}</Section>)}
          </div>

          <fieldset className="rounded-lg border border-border bg-card p-4">
            <legend className="px-1 text-sm font-semibold text-foreground">Items</legend>
            <div className="grid gap-4">
              {invoice.items.map((item, index) => (
                <div key={item.id} className="rounded-md border border-border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">Item {index + 1}</span>
                    <Button type="button" variant="ghost" size="icon" aria-label={`Remove item ${index + 1}`} disabled={invoice.items.length === 1}
                      onClick={() => patch({ items: invoice.items.filter((other) => other.id !== item.id) })}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">{itemInput(item, "description", "Description")}</div>
                    {kind === "freelancer" ? <div className="col-span-2">{itemInput(item, "detail", "Short detail (optional)")}</div> : itemInput(item, "hsn", "HSN/SAC")}
                    {kind === "gst" ? itemInput(item, "unit", "Unit") : null}
                    {itemInput(item, "qty", kind === "gst" ? "Quantity" : "Hours / quantity", { numeric: true })}
                    {itemInput(item, "rate", "Rate (before tax)", { numeric: true })}
                    {kind === "gst" ? itemInput(item, "gst", "GST %", { numeric: true }) : null}
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" disabled={invoice.items.length >= 200}
                onClick={() => patch({ items: [...invoice.items, newItem(invoice.items[invoice.items.length - 1].gst)] })}><Plus className="h-4 w-4" />Add item</Button>
            </div>
          </fieldset>

          <Section title={kind === "gst" ? "Tax" : "Totals"}>
            {kind === "gst" ? (
              <>
                <Labelled label="Type of sale" wide>
                  <select className={inputClass} value={invoice.supply} onChange={(e) => patch({ supply: e.target.value as Invoice["supply"] })}>
                    <option value="same">Within the state (CGST + SGST)</option>
                    <option value="different">Between states (IGST)</option>
                  </select>
                </Labelled>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={invoice.reverseCharge} onChange={(e) => patch({ reverseCharge: e.target.checked })} />Reverse charge</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={invoice.roundOff} onChange={(e) => patch({ roundOff: e.target.checked })} />Round to nearest rupee</label>
              </>
            ) : (
              <>
                <Labelled label="Currency">
                  <select className={inputClass} value={invoice.currency} onChange={(e) => patch({ currency: e.target.value as Currency })}>
                    <option value="INR">₹ INR</option><option value="USD">$ USD</option><option value="EUR">€ EUR</option><option value="GBP">£ GBP</option>
                  </select>
                </Labelled>
                {renderField({ key: "discount", label: "Discount amount" })}
                {renderField({ key: "taxPercent", label: "Tax %" })}
                {renderField({ key: "advance", label: "Advance paid" })}
              </>
            )}
          </Section>

          <Section title="Payment">{paymentFields.map(renderField)}</Section>
          {kind === "gst" ? <p className="text-xs text-muted-foreground">Check tax rates and invoice rules for your business with a tax professional.</p> : null}
        </form>

        <section aria-label="Invoice preview" className="min-w-0 xl:sticky xl:top-20">
          <div className="invoice-preview overflow-hidden rounded-lg border border-border shadow-sm">
            <div className="invoice-preview-page"><InvoicePaper invoice={invoice} kind={kind} /></div>
          </div>
        </section>
      </div>

      {ready ? createPortal(<div className="invoice-print" aria-hidden="true"><InvoicePaper invoice={invoice} kind={kind} /></div>, document.body) : null}
    </>
  );
}
