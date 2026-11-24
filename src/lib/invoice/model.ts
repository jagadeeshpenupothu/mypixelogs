export type InvoiceKind = "gst" | "freelancer";
export type Currency = "INR" | "USD" | "EUR" | "GBP";

export type InvoiceItem = {
  id: string;
  description: string;
  detail: string;
  hsn: string;
  qty: string;
  unit: string;
  rate: string;
  gst: string;
};

export const fieldKeys = [
  "fromName", "fromRole", "fromAddress", "fromPhone", "fromEmail", "fromWebsite", "fromGstin",
  "number", "date", "due", "po", "project", "place",
  "toName", "toCompany", "toAddress", "toState", "toEmail", "toGstin",
  "shipName", "shipAddress", "shipState",
  "discount", "taxPercent", "advance",
  "bankName", "bankNumber", "bankCode", "upi", "terms",
] as const;

export type FieldKey = (typeof fieldKeys)[number];

export type Invoice = Record<FieldKey, string> & {
  items: InvoiceItem[];
  currency: Currency;
  supply: "same" | "different";
  reverseCharge: boolean;
  roundOff: boolean;
};

let nextId = 0;

export function newItem(gst = "18"): InvoiceItem {
  nextId += 1;
  return {
    id: `item-${nextId}-${Math.random().toString(36).slice(2, 8)}`,
    description: "", detail: "", hsn: "", qty: "1", unit: "", rate: "", gst,
  };
}

export function emptyInvoice(): Invoice {
  const fields = Object.fromEntries(fieldKeys.map((key) => [key, ""])) as Record<FieldKey, string>;
  return {
    ...fields,
    number: "INV-001",
    items: [{ ...newItem(), id: "item-first" }],
    currency: "INR",
    supply: "same",
    reverseCharge: false,
    roundOff: true,
  };
}

/** Accepts saved data of any shape and returns a safe, complete invoice. */
export function restoreInvoice(saved: unknown): Invoice {
  const base = emptyInvoice();
  if (!saved || typeof saved !== "object") return base;
  const data = saved as Record<string, unknown>;
  for (const key of fieldKeys) if (typeof data[key] === "string") base[key] = data[key] as string;
  if (Array.isArray(data.items) && data.items.length > 0) {
    base.items = data.items.slice(0, 200).map((raw) => {
      const item = newItem();
      if (raw && typeof raw === "object") {
        for (const key of ["description", "detail", "hsn", "qty", "unit", "rate", "gst"] as const) {
          const value = (raw as Record<string, unknown>)[key];
          if (typeof value === "string") item[key] = value;
        }
      }
      return item;
    });
  }
  if (["INR", "USD", "EUR", "GBP"].includes(data.currency as string)) base.currency = data.currency as Currency;
  if (data.supply === "different") base.supply = "different";
  base.reverseCharge = data.reverseCharge === true;
  base.roundOff = data.roundOff !== false;
  return base;
}

export function toNumber(value: string) {
  const number = Number(value.replace(/,/g, "").trim());
  return Number.isFinite(number) && number > 0 ? number : 0;
}

/** Amounts are whole paise (or cents), so totals never drift. */
const minor = (value: number) => Math.round((value + Number.EPSILON) * 100);

export function calculate(invoice: Invoice, kind: InvoiceKind) {
  const lines = invoice.items.map((item) => {
    const taxable = minor(toNumber(item.qty) * toNumber(item.rate));
    const percent = kind === "gst" ? Math.min(toNumber(item.gst), 100) : 0;
    const half = Math.round((taxable * percent) / 200);
    const gst = invoice.supply === "same" ? half * 2 : Math.round((taxable * percent) / 100);
    return { item, taxable, gst, amount: taxable + (invoice.reverseCharge ? 0 : gst) };
  });
  const subtotal = lines.reduce((sum, line) => sum + line.taxable, 0);

  if (kind === "gst") {
    const gst = lines.reduce((sum, line) => sum + line.gst, 0);
    const same = invoice.supply === "same";
    const exact = subtotal + (invoice.reverseCharge ? 0 : gst);
    const total = invoice.roundOff ? Math.round(exact / 100) * 100 : exact;
    return {
      lines, subtotal, total, roundOff: total - exact,
      cgst: same ? gst / 2 : 0, sgst: same ? gst / 2 : 0, igst: same ? 0 : gst,
      discount: 0, tax: 0, advance: 0,
    };
  }

  const discount = Math.min(minor(toNumber(invoice.discount)), subtotal);
  const tax = Math.round(((subtotal - discount) * Math.min(toNumber(invoice.taxPercent), 100)) / 100);
  const advance = Math.min(minor(toNumber(invoice.advance)), subtotal - discount + tax);
  return {
    lines, subtotal, discount, tax, advance, total: subtotal - discount + tax - advance,
    roundOff: 0, cgst: 0, sgst: 0, igst: 0,
  };
}

export function money(amount: number, currency: Currency = "INR") {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(amount / 100);
}

export const symbols: Record<Currency, string> = { INR: "₹", USD: "$", EUR: "€", GBP: "£" };

export function formatDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
}

const ones = "Zero One Two Three Four Five Six Seven Eight Nine Ten Eleven Twelve Thirteen Fourteen Fifteen Sixteen Seventeen Eighteen Nineteen".split(" ");
const tens = "x x Twenty Thirty Forty Fifty Sixty Seventy Eighty Ninety".split(" ");

function words(n: number): string {
  if (n < 20) return ones[n];
  if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ` ${ones[n % 10]}` : "");
  const steps: [number, string][] = [[10000000, "Crore"], [100000, "Lakh"], [1000, "Thousand"], [100, "Hundred"]];
  for (const [size, name] of steps) {
    if (n >= size) return `${words(Math.floor(n / size))} ${name}${n % size ? ` ${words(n % size)}` : ""}`;
  }
  return "";
}

export function rupeesInWords(amount: number) {
  const paise = amount % 100;
  return `Rupees ${words(Math.floor(amount / 100))}${paise ? ` and ${words(paise)} Paise` : ""} Only`;
}

/** Labels shared by the preview and the Word file, so both always match. */
export function totalRows(invoice: Invoice, kind: InvoiceKind) {
  const t = calculate(invoice, kind);
  const c = invoice.currency;
  if (kind === "gst") {
    const suffix = invoice.reverseCharge ? " (payable by recipient)" : "";
    return [
      ["Taxable value", money(t.subtotal)],
      ...(invoice.supply === "same"
        ? [[`CGST${suffix}`, money(t.cgst)], [`SGST / UTGST${suffix}`, money(t.sgst)]]
        : [[`IGST${suffix}`, money(t.igst)]]),
      ...(invoice.roundOff ? [["Round off", money(t.roundOff)]] : []),
    ];
  }
  return [
    ["Subtotal", money(t.subtotal, c)],
    ...(t.discount ? [["Discount", `- ${money(t.discount, c)}`]] : []),
    ...(t.tax ? [[`Tax (${toNumber(invoice.taxPercent)}%)`, money(t.tax, c)]] : []),
    ...(t.advance ? [["Advance paid", `- ${money(t.advance, c)}`]] : []),
  ];
}

export function bankRows(invoice: Invoice, kind: InvoiceKind) {
  return [
    ["Account name", invoice.bankName],
    ["Account no.", invoice.bankNumber],
    [kind === "gst" ? "IFSC" : "IFSC / SWIFT", invoice.bankCode],
    ["UPI", invoice.upi],
  ].filter(([, value]) => value.trim());
}

export function fileName(invoice: Invoice) {
  const safe = invoice.number.replace(/[^a-z0-9-]+/gi, "-").replace(/^-+|-+$/g, "");
  return `invoice-${safe || "draft"}`;
}

export const splitLines = (value: string) => value.split(/\r?\n/).filter((line) => line.trim());
