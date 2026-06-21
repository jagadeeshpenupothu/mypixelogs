"use client";

import { useMemo, useState } from "react";
import { Check, Clipboard, IndianRupee } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type GstMode = "add" | "remove";

const gstRates = [3, 5, 12, 18, 28];
const amountPresets = [100, 500, 1000, 5000, 10000, 50000];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

function calculateGst(amount: number, gstRate: number, mode: GstMode) {
  const safeAmount = Math.max(0, amount);
  const safeRate = Math.max(0, gstRate);

  if (mode === "add") {
    const baseAmount = safeAmount;
    const gstAmount = (baseAmount * safeRate) / 100;
    const finalAmount = baseAmount + gstAmount;

    return {
      baseAmount,
      gstAmount,
      finalAmount,
      cgstRate: safeRate / 2,
      sgstRate: safeRate / 2,
      cgstAmount: gstAmount / 2,
      sgstAmount: gstAmount / 2,
    };
  }

  const finalAmount = safeAmount;
  const baseAmount = finalAmount / (1 + safeRate / 100);
  const gstAmount = finalAmount - baseAmount;

  return {
    baseAmount,
    gstAmount,
    finalAmount,
    cgstRate: safeRate / 2,
    sgstRate: safeRate / 2,
    cgstAmount: gstAmount / 2,
    sgstAmount: gstAmount / 2,
  };
}

function buildCopyText({
  amount,
  gstRate,
  mode,
  gstAmount,
  finalAmount,
  baseAmount,
  cgstRate,
  sgstRate,
  cgstAmount,
  sgstAmount,
}: {
  amount: number;
  gstRate: number;
  mode: GstMode;
  gstAmount: number;
  finalAmount: number;
  baseAmount: number;
  cgstRate: number;
  sgstRate: number;
  cgstAmount: number;
  sgstAmount: number;
}) {
  return [
    "MyPixelogs GST Calculator",
    `Mode: ${mode === "add" ? "Add GST" : "Remove GST"}`,
    `Amount: ${formatCurrency(amount)}`,
    `GST: ${gstRate}%`,
    `Base Amount: ${formatCurrency(baseAmount)}`,
    `GST Amount: ${formatCurrency(gstAmount)}`,
    `CGST: ${cgstRate}% (${formatCurrency(cgstAmount)})`,
    `SGST: ${sgstRate}% (${formatCurrency(sgstAmount)})`,
    `Final Amount: ${formatCurrency(finalAmount)}`,
  ].join("\n");
}

export function GSTCalculator() {
  const [mode, setMode] = useState<GstMode>("add");
  const [amount, setAmount] = useState(1000);
  const [gstRate, setGstRate] = useState(18);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => calculateGst(amount, gstRate, mode), [amount, gstRate, mode]);

  async function copyCalculation() {
    await navigator.clipboard.writeText(
      buildCopyText({
        amount,
        gstRate,
        mode,
        ...result,
      }),
    );
    setCopied(true);
  }

  function updateAmount(nextAmount: number) {
    setAmount(nextAmount);
    setCopied(false);
  }

  function updateRate(nextRate: number) {
    setGstRate(nextRate);
    setCopied(false);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <aside className="space-y-6">
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-foreground">GST details</h2>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => {
                setMode("add");
                setCopied(false);
              }}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground transition",
                mode === "add" && "bg-background text-foreground shadow-sm",
              )}
            >
              Add GST
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("remove");
                setCopied(false);
              }}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground transition",
                mode === "remove" && "bg-background text-foreground shadow-sm",
              )}
            >
              Remove GST
            </button>
          </div>

          <div className="mt-5 space-y-5">
            <label className="block text-sm font-medium text-foreground">
              Amount (INR)
              <Input
                type="number"
                min={0}
                value={amount}
                onChange={(event) => updateAmount(Number(event.target.value))}
                className="mt-2"
              />
            </label>

            <label className="block text-sm font-medium text-foreground">
              GST Rate (%)
              <Input
                type="number"
                min={0}
                step={0.1}
                value={gstRate}
                onChange={(event) => updateRate(Number(event.target.value))}
                className="mt-2"
              />
            </label>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">GST rates</h2>
          <div className="mt-5 grid grid-cols-5 gap-2">
            {gstRates.map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => updateRate(rate)}
                className={cn(
                  "rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-primary",
                  gstRate === rate && "border-primary/40 bg-primary/10 text-primary",
                )}
              >
                {rate}%
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Quick amounts</h2>
          <div className="mt-5 grid grid-cols-2 gap-2">
            {amountPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => updateAmount(preset)}
                className={cn(
                  "rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-primary",
                  amount === preset && "border-primary/40 bg-primary/10 text-primary",
                )}
              >
                {formatCurrency(preset)}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <ResultCard label="Base Amount" value={formatCurrency(result.baseAmount)} />
          <ResultCard label="GST Amount" value={formatCurrency(result.gstAmount)} featured />
          <ResultCard label="Final Amount" value={formatCurrency(result.finalAmount)} />
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <h2 className="text-lg font-semibold text-foreground">GST breakdown</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                GST is split equally as CGST and SGST.
              </p>
            </div>
            <Button type="button" variant="outline" onClick={copyCalculation}>
              {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
              {copied ? "Copied" : "Copy Calculation"}
            </Button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <BreakdownCard
              label="CGST"
              rate={result.cgstRate}
              value={formatCurrency(result.cgstAmount)}
            />
            <BreakdownCard
              label="SGST"
              rate={result.sgstRate}
              value={formatCurrency(result.sgstAmount)}
            />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Calculation summary</h2>
          <div className="mt-5 space-y-4">
            <InfoRow label="Mode" value={mode === "add" ? "Add GST" : "Remove GST"} />
            <InfoRow label="Input Amount" value={formatCurrency(amount)} />
            <InfoRow label="GST Rate" value={`${gstRate}%`} />
            <InfoRow label="CGST + SGST" value={`${result.cgstRate}% + ${result.sgstRate}%`} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultCard({
  label,
  value,
  featured,
}: {
  label: string;
  value: string;
  featured?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-6 shadow-sm",
        featured && "border-primary/40 bg-primary/5",
      )}
    >
      <p className="text-sm font-semibold text-muted-foreground">{label}</p>
      <p className="mt-3 text-3xl font-bold tracking-normal text-foreground">{value}</p>
    </div>
  );
}

function BreakdownCard({ label, rate, value }: { label: string; rate: number; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-5">
      <p className="text-sm font-semibold text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold text-foreground">{rate}%</p>
      <p className="mt-1 text-sm font-medium text-muted-foreground">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border pb-3 last:border-b-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}
