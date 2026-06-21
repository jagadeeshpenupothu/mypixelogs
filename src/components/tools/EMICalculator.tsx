"use client";

import { useMemo, useState } from "react";
import { Check, Clipboard, Download, IndianRupee } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type AmortizationRow = {
  month: number;
  principal: number;
  interest: number;
  balance: number;
};

const presets = [
  { label: "₹1 Lakh", value: 100000 },
  { label: "₹5 Lakh", value: 500000 },
  { label: "₹10 Lakh", value: 1000000 },
  { label: "₹25 Lakh", value: 2500000 },
  { label: "₹50 Lakh", value: 5000000 },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function calculateEmi(principal: number, annualRate: number, years: number) {
  const months = Math.max(1, Math.round(years * 12));
  const monthlyRate = annualRate / 12 / 100;

  if (monthlyRate === 0) {
    const emi = principal / months;
    return {
      emi,
      totalPayment: principal,
      totalInterest: 0,
      months,
    };
  }

  const emi =
    (principal * monthlyRate * (1 + monthlyRate) ** months) /
    ((1 + monthlyRate) ** months - 1);
  const totalPayment = emi * months;

  return {
    emi,
    totalPayment,
    totalInterest: totalPayment - principal,
    months,
  };
}

function createAmortization(principal: number, annualRate: number, years: number) {
  const { emi, months } = calculateEmi(principal, annualRate, years);
  const monthlyRate = annualRate / 12 / 100;
  let balance = principal;
  const rows: AmortizationRow[] = [];

  for (let month = 1; month <= months; month += 1) {
    const interest = monthlyRate === 0 ? 0 : balance * monthlyRate;
    const principalPaid = month === months ? balance : Math.min(emi - interest, balance);
    balance = Math.max(0, balance - principalPaid);

    rows.push({
      month,
      principal: principalPaid,
      interest,
      balance,
    });
  }

  return rows;
}

function buildSummaryText({
  loanAmount,
  interestRate,
  tenureYears,
  emi,
  totalInterest,
  totalPayment,
}: {
  loanAmount: number;
  interestRate: number;
  tenureYears: number;
  emi: number;
  totalInterest: number;
  totalPayment: number;
}) {
  return [
    "MyPixelogs EMI Calculator",
    `Loan Amount: ${formatCurrency(loanAmount)}`,
    `Interest Rate: ${interestRate}% p.a.`,
    `Tenure: ${tenureYears} years`,
    `Monthly EMI: ${formatCurrency(emi)}`,
    `Total Interest: ${formatCurrency(totalInterest)}`,
    `Total Payment: ${formatCurrency(totalPayment)}`,
  ].join("\n");
}

function downloadSummaryCard(summary: {
  loanAmount: number;
  interestRate: number;
  tenureYears: number;
  emi: number;
  totalInterest: number;
  totalPayment: number;
}) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const context = canvas.getContext("2d");

  if (!context) return;

  context.fillStyle = "#0B1220";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#171717";
  context.roundRect(70, 70, 1060, 490, 30);
  context.fill();
  context.fillStyle = "#3B82F6";
  context.roundRect(110, 110, 78, 78, 16);
  context.fill();
  context.fillStyle = "#FFFFFF";
  context.font = "700 30px Arial";
  context.fillText("mp", 130, 160);
  context.font = "700 34px Arial";
  context.fillText("MyPixelogs EMI calculator", 215, 157);
  context.font = "800 70px Arial";
  context.fillText(formatCurrency(summary.emi), 110, 290);
  context.font = "500 28px Arial";
  context.fillStyle = "#A3A3A3";
  context.fillText("Monthly EMI", 110, 335);

  const rows = [
    `Loan: ${formatCurrency(summary.loanAmount)}`,
    `Interest: ${summary.interestRate}% p.a. | Tenure: ${summary.tenureYears} years`,
    `Total Interest: ${formatCurrency(summary.totalInterest)}`,
    `Total Payment: ${formatCurrency(summary.totalPayment)}`,
  ];

  context.font = "600 28px Arial";
  context.fillStyle = "#FAFAFA";
  rows.forEach((row, index) => {
    context.fillText(row, 110, 405 + index * 42);
  });

  const url = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = url;
  link.download = "mypixelogs-emi-summary.png";
  link.click();
}

export function EMICalculator() {
  const [loanAmount, setLoanAmount] = useState(500000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(5);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => calculateEmi(Math.max(0, loanAmount), Math.max(0, interestRate), Math.max(0.1, tenureYears)),
    [interestRate, loanAmount, tenureYears],
  );

  const amortization = useMemo(
    () => createAmortization(Math.max(0, loanAmount), Math.max(0, interestRate), Math.max(0.1, tenureYears)),
    [interestRate, loanAmount, tenureYears],
  );

  const principalPercent =
    result.totalPayment > 0 ? Math.round((loanAmount / result.totalPayment) * 100) : 0;
  const interestPercent =
    result.totalPayment > 0 ? Math.round((result.totalInterest / result.totalPayment) * 100) : 0;

  const summary = {
    loanAmount,
    interestRate,
    tenureYears,
    emi: result.emi,
    totalInterest: result.totalInterest,
    totalPayment: result.totalPayment,
  };

  async function copyResults() {
    await navigator.clipboard.writeText(buildSummaryText(summary));
    setCopied(true);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <aside className="space-y-6">
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-foreground">Loan details</h2>
          </div>

          <div className="mt-5 space-y-5">
            <label className="block text-sm font-medium text-foreground">
              Loan Amount (INR)
              <Input
                type="number"
                min={0}
                value={loanAmount}
                onChange={(event) => {
                  setLoanAmount(Number(event.target.value));
                  setCopied(false);
                }}
                className="mt-2"
              />
            </label>

            <label className="block text-sm font-medium text-foreground">
              Interest Rate (Annual %)
              <Input
                type="number"
                min={0}
                step={0.1}
                value={interestRate}
                onChange={(event) => {
                  setInterestRate(Number(event.target.value));
                  setCopied(false);
                }}
                className="mt-2"
              />
            </label>

            <label className="block text-sm font-medium text-foreground">
              Loan Tenure (Years)
              <Input
                type="number"
                min={0.1}
                step={0.5}
                value={tenureYears}
                onChange={(event) => {
                  setTenureYears(Number(event.target.value));
                  setCopied(false);
                }}
                className="mt-2"
              />
            </label>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Quick presets</h2>
          <div className="mt-5 grid grid-cols-2 gap-2">
            {presets.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => {
                  setLoanAmount(preset.value);
                  setCopied(false);
                }}
                className={cn(
                  "rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-primary",
                  loanAmount === preset.value && "border-primary/40 bg-primary/10 text-primary",
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Export</h2>
          <div className="mt-5 grid gap-3">
            <Button type="button" variant="outline" onClick={copyResults}>
              {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
              {copied ? "Copied" : "Copy Results"}
            </Button>
            <Button type="button" onClick={() => downloadSummaryCard(summary)}>
              <Download className="h-4 w-4" />
              Download Summary Card
            </Button>
          </div>
        </div>
      </aside>

      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <ResultCard label="Monthly EMI" value={formatCurrency(result.emi)} featured />
          <ResultCard label="Total Interest" value={formatCurrency(result.totalInterest)} />
          <ResultCard label="Total Payment" value={formatCurrency(result.totalPayment)} />
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Payment breakdown</h2>
          <div className="mt-6 space-y-5">
            <BreakdownBar
              label="Principal Amount"
              value={formatCurrency(loanAmount)}
              percent={principalPercent}
            />
            <BreakdownBar
              label="Interest Amount"
              value={formatCurrency(result.totalInterest)}
              percent={interestPercent}
              muted
            />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Amortization table</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Month-by-month principal, interest, and balance.
              </p>
            </div>
            <p className="text-sm font-semibold text-muted-foreground">{result.months} months</p>
          </div>

          <div className="mt-5 max-h-[520px] overflow-auto rounded-lg border border-border">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="sticky top-0 bg-muted text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Month</th>
                  <th className="px-4 py-3 font-semibold">Principal</th>
                  <th className="px-4 py-3 font-semibold">Interest</th>
                  <th className="px-4 py-3 font-semibold">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {amortization.map((row) => (
                  <tr key={row.month} className="bg-background">
                    <td className="px-4 py-3 font-medium text-foreground">{row.month}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatCurrency(row.principal)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatCurrency(row.interest)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatCurrency(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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

function BreakdownBar({
  label,
  value,
  percent,
  muted,
}: {
  label: string;
  value: string;
  percent: number;
  muted?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="font-semibold text-foreground">{label}</span>
        <span className="font-medium text-muted-foreground">
          {value} ({percent}%)
        </span>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full", muted ? "bg-muted-foreground" : "bg-primary")}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  );
}
