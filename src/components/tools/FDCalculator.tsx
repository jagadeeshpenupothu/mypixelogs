"use client";

import { useMemo, useState } from "react";
import { Check, Clipboard, IndianRupee } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type CompoundingFrequency = "yearly" | "half-yearly" | "quarterly" | "monthly";

type BreakdownRow = {
  year: number;
  openingBalance: number;
  interestEarned: number;
  closingBalance: number;
};

const depositPresets = [10000, 50000, 100000, 500000, 1000000];
const interestPresets = [6, 7, 8, 9];

const compoundingOptions: Array<{
  label: string;
  value: CompoundingFrequency;
  periods: number;
}> = [
  { label: "Yearly", value: "yearly", periods: 1 },
  { label: "Half-Yearly", value: "half-yearly", periods: 2 },
  { label: "Quarterly", value: "quarterly", periods: 4 },
  { label: "Monthly", value: "monthly", periods: 12 },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function getPeriods(frequency: CompoundingFrequency) {
  return compoundingOptions.find((option) => option.value === frequency)?.periods ?? 4;
}

function getTenureYears(years: number, months: number) {
  return Math.max(0, years) + Math.max(0, months) / 12;
}

function calculateFd(
  principal: number,
  annualRate: number,
  years: number,
  months: number,
  frequency: CompoundingFrequency,
) {
  const safePrincipal = Math.max(0, principal);
  const tenureYears = Math.max(0, getTenureYears(years, months));
  const periodsPerYear = getPeriods(frequency);
  const rate = Math.max(0, annualRate) / 100;
  const maturityAmount =
    tenureYears === 0
      ? safePrincipal
      : safePrincipal * (1 + rate / periodsPerYear) ** (periodsPerYear * tenureYears);

  return {
    principal: safePrincipal,
    interestEarned: maturityAmount - safePrincipal,
    maturityAmount,
    tenureYears,
  };
}

function createYearlyBreakdown(
  principal: number,
  annualRate: number,
  years: number,
  months: number,
  frequency: CompoundingFrequency,
) {
  const totalYears = Math.max(1, Math.ceil(getTenureYears(years, months)));
  const rows: BreakdownRow[] = [];
  let previousValue = Math.max(0, principal);

  for (let year = 1; year <= totalYears; year += 1) {
    const currentTenure = Math.min(year, getTenureYears(years, months));
    const result = calculateFd(principal, annualRate, currentTenure, 0, frequency);
    rows.push({
      year,
      openingBalance: previousValue,
      interestEarned: result.maturityAmount - previousValue,
      closingBalance: result.maturityAmount,
    });
    previousValue = result.maturityAmount;
  }

  return rows;
}

function buildSummaryText({
  depositAmount,
  interestRate,
  tenureYears,
  tenureMonths,
  frequency,
  principal,
  interestEarned,
  maturityAmount,
}: {
  depositAmount: number;
  interestRate: number;
  tenureYears: number;
  tenureMonths: number;
  frequency: CompoundingFrequency;
  principal: number;
  interestEarned: number;
  maturityAmount: number;
}) {
  return [
    "MyPixelogs FD Calculator",
    `Deposit Amount: ${formatCurrency(depositAmount)}`,
    `Interest Rate: ${interestRate}% p.a.`,
    `Tenure: ${tenureYears} years ${tenureMonths} months`,
    `Compounding: ${compoundingOptions.find((option) => option.value === frequency)?.label}`,
    `Principal: ${formatCurrency(principal)}`,
    `Interest Earned: ${formatCurrency(interestEarned)}`,
    `Maturity Amount: ${formatCurrency(maturityAmount)}`,
  ].join("\n");
}

export function FDCalculator() {
  const [depositAmount, setDepositAmount] = useState(100000);
  const [interestRate, setInterestRate] = useState(7.5);
  const [tenureYears, setTenureYears] = useState(5);
  const [tenureMonths, setTenureMonths] = useState(0);
  const [frequency, setFrequency] = useState<CompoundingFrequency>("quarterly");
  const [comparisonRate, setComparisonRate] = useState(8);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => calculateFd(depositAmount, interestRate, tenureYears, tenureMonths, frequency),
    [depositAmount, frequency, interestRate, tenureMonths, tenureYears],
  );

  const comparisonResult = useMemo(
    () => calculateFd(depositAmount, comparisonRate, tenureYears, tenureMonths, frequency),
    [comparisonRate, depositAmount, frequency, tenureMonths, tenureYears],
  );

  const yearlyBreakdown = useMemo(
    () => createYearlyBreakdown(depositAmount, interestRate, tenureYears, tenureMonths, frequency),
    [depositAmount, frequency, interestRate, tenureMonths, tenureYears],
  );

  const principalPercent =
    result.maturityAmount > 0 ? Math.round((result.principal / result.maturityAmount) * 100) : 0;
  const interestPercent =
    result.maturityAmount > 0 ? Math.round((result.interestEarned / result.maturityAmount) * 100) : 0;

  async function copySummary() {
    await navigator.clipboard.writeText(
      buildSummaryText({
        depositAmount,
        interestRate,
        tenureYears,
        tenureMonths,
        frequency,
        principal: result.principal,
        interestEarned: result.interestEarned,
        maturityAmount: result.maturityAmount,
      }),
    );
    setCopied(true);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <aside className="space-y-6">
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-foreground">FD details</h2>
          </div>

          <div className="mt-5 space-y-5">
            <label className="block text-sm font-medium text-foreground">
              Deposit Amount (INR)
              <Input
                type="number"
                min={0}
                value={depositAmount}
                onChange={(event) => {
                  setDepositAmount(Number(event.target.value));
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

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-medium text-foreground">
                Years
                <Input
                  type="number"
                  min={0}
                  value={tenureYears}
                  onChange={(event) => {
                    setTenureYears(Number(event.target.value));
                    setCopied(false);
                  }}
                  className="mt-2"
                />
              </label>
              <label className="block text-sm font-medium text-foreground">
                Months
                <Input
                  type="number"
                  min={0}
                  max={11}
                  value={tenureMonths}
                  onChange={(event) => {
                    setTenureMonths(Math.min(11, Number(event.target.value)));
                    setCopied(false);
                  }}
                  className="mt-2"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Compounding frequency</h2>
          <div className="mt-5 grid grid-cols-2 gap-2">
            {compoundingOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setFrequency(option.value);
                  setCopied(false);
                }}
                className={cn(
                  "rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-primary",
                  frequency === option.value && "border-primary/40 bg-primary/10 text-primary",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <PresetPanel
          title="Quick deposits"
          values={depositPresets}
          selectedValue={depositAmount}
          formatter={formatCurrency}
          onSelect={(value) => {
            setDepositAmount(value);
            setCopied(false);
          }}
        />

        <PresetPanel
          title="Quick interest"
          values={interestPresets}
          selectedValue={interestRate}
          formatter={(value) => `${value}%`}
          onSelect={(value) => {
            setInterestRate(value);
            setCopied(false);
          }}
        />

        <Button type="button" className="w-full" onClick={copySummary}>
          {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
          {copied ? "Copied" : "Copy FD Summary"}
        </Button>
      </aside>

      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <ResultCard label="Principal" value={formatCurrency(result.principal)} />
          <ResultCard label="Interest Earned" value={formatCurrency(result.interestEarned)} />
          <ResultCard label="Maturity Amount" value={formatCurrency(result.maturityAmount)} featured />
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Principal vs interest</h2>
          <div className="mt-6 space-y-5">
            <BreakdownBar
              label="Principal Amount"
              value={formatCurrency(result.principal)}
              percent={principalPercent}
            />
            <BreakdownBar
              label="Interest Earned"
              value={formatCurrency(result.interestEarned)}
              percent={interestPercent}
              muted
            />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Comparison mode</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr_1fr]">
            <label className="block text-sm font-medium text-foreground">
              FD A Rate
              <Input value={interestRate} readOnly className="mt-2" />
            </label>
            <label className="block text-sm font-medium text-foreground">
              FD B Rate
              <Input
                type="number"
                min={0}
                step={0.1}
                value={comparisonRate}
                onChange={(event) => setComparisonRate(Number(event.target.value))}
                className="mt-2"
              />
            </label>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-sm font-semibold text-muted-foreground">Maturity Difference</p>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {formatCurrency(comparisonResult.maturityAmount - result.maturityAmount)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Yearly breakdown</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Opening balance, interest earned, and closing balance by year.
              </p>
            </div>
            <p className="text-sm font-semibold text-muted-foreground">
              {result.tenureYears.toFixed(1)} years
            </p>
          </div>

          <div className="mt-5 max-h-[520px] overflow-auto rounded-lg border border-border">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="sticky top-0 bg-muted text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Year</th>
                  <th className="px-4 py-3 font-semibold">Opening Balance</th>
                  <th className="px-4 py-3 font-semibold">Interest Earned</th>
                  <th className="px-4 py-3 font-semibold">Closing Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {yearlyBreakdown.map((row) => (
                  <tr key={row.year} className="bg-background">
                    <td className="px-4 py-3 font-medium text-foreground">{row.year}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatCurrency(row.openingBalance)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatCurrency(row.interestEarned)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatCurrency(row.closingBalance)}</td>
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

function PresetPanel({
  title,
  values,
  selectedValue,
  formatter,
  onSelect,
}: {
  title: string;
  values: number[];
  selectedValue: number;
  formatter: (value: number) => string;
  onSelect: (value: number) => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <div className="mt-5 grid grid-cols-2 gap-2">
        {values.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onSelect(value)}
            className={cn(
              "rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-primary",
              selectedValue === value && "border-primary/40 bg-primary/10 text-primary",
            )}
          >
            {formatter(value)}
          </button>
        ))}
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
