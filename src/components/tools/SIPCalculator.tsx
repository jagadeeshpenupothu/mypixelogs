"use client";

import { useMemo, useState } from "react";
import { Check, Clipboard, IndianRupee } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type YearlyGrowthRow = {
  year: number;
  investment: number;
  returns: number;
  value: number;
};

const sipPresets = [1000, 5000, 10000, 25000, 50000];
const durationPresets = [5, 10, 15, 20, 30];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function calculateSip(monthlyInvestment: number, annualReturn: number, years: number) {
  const months = Math.max(1, Math.round(years * 12));
  const monthlyRate = annualReturn / 12 / 100;
  const totalInvestment = monthlyInvestment * months;

  if (monthlyRate === 0) {
    return {
      totalInvestment,
      estimatedReturns: 0,
      maturityValue: totalInvestment,
      months,
    };
  }

  const maturityValue =
    monthlyInvestment * (((1 + monthlyRate) ** months - 1) / monthlyRate) * (1 + monthlyRate);

  return {
    totalInvestment,
    estimatedReturns: maturityValue - totalInvestment,
    maturityValue,
    months,
  };
}

function calculateRequiredSip(targetAmount: number, annualReturn: number, years: number) {
  const months = Math.max(1, Math.round(years * 12));
  const monthlyRate = annualReturn / 12 / 100;

  if (monthlyRate === 0) {
    return targetAmount / months;
  }

  return targetAmount / ((((1 + monthlyRate) ** months - 1) / monthlyRate) * (1 + monthlyRate));
}

function createYearlyGrowth(monthlyInvestment: number, annualReturn: number, years: number) {
  const rows: YearlyGrowthRow[] = [];

  for (let year = 1; year <= Math.max(1, Math.round(years)); year += 1) {
    const result = calculateSip(monthlyInvestment, annualReturn, year);
    rows.push({
      year,
      investment: result.totalInvestment,
      returns: result.estimatedReturns,
      value: result.maturityValue,
    });
  }

  return rows;
}

function buildSummaryText({
  monthlyInvestment,
  annualReturn,
  years,
  totalInvestment,
  estimatedReturns,
  maturityValue,
  targetAmount,
  requiredSip,
}: {
  monthlyInvestment: number;
  annualReturn: number;
  years: number;
  totalInvestment: number;
  estimatedReturns: number;
  maturityValue: number;
  targetAmount: number;
  requiredSip: number;
}) {
  return [
    "MyPixelogs SIP Calculator",
    `Monthly Investment: ${formatCurrency(monthlyInvestment)}`,
    `Expected Annual Return: ${annualReturn}%`,
    `Duration: ${years} years`,
    `Total Investment: ${formatCurrency(totalInvestment)}`,
    `Estimated Returns: ${formatCurrency(estimatedReturns)}`,
    `Maturity Value: ${formatCurrency(maturityValue)}`,
    `Target Amount: ${formatCurrency(targetAmount)}`,
    `Required Monthly SIP: ${formatCurrency(requiredSip)}`,
  ].join("\n");
}

export function SIPCalculator() {
  const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
  const [annualReturn, setAnnualReturn] = useState(12);
  const [years, setYears] = useState(15);
  const [targetAmount, setTargetAmount] = useState(10000000);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => calculateSip(Math.max(0, monthlyInvestment), Math.max(0, annualReturn), Math.max(1, years)),
    [annualReturn, monthlyInvestment, years],
  );

  const yearlyGrowth = useMemo(
    () => createYearlyGrowth(Math.max(0, monthlyInvestment), Math.max(0, annualReturn), Math.max(1, years)),
    [annualReturn, monthlyInvestment, years],
  );

  const requiredSip = useMemo(
    () => calculateRequiredSip(Math.max(0, targetAmount), Math.max(0, annualReturn), Math.max(1, years)),
    [annualReturn, targetAmount, years],
  );

  const investmentPercent =
    result.maturityValue > 0 ? Math.round((result.totalInvestment / result.maturityValue) * 100) : 0;
  const returnsPercent =
    result.maturityValue > 0 ? Math.round((result.estimatedReturns / result.maturityValue) * 100) : 0;

  async function copySummary() {
    await navigator.clipboard.writeText(
      buildSummaryText({
        monthlyInvestment,
        annualReturn,
        years,
        totalInvestment: result.totalInvestment,
        estimatedReturns: result.estimatedReturns,
        maturityValue: result.maturityValue,
        targetAmount,
        requiredSip,
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
            <h2 className="text-lg font-semibold text-foreground">SIP details</h2>
          </div>

          <div className="mt-5 space-y-5">
            <label className="block text-sm font-medium text-foreground">
              Monthly Investment (INR)
              <Input
                type="number"
                min={0}
                value={monthlyInvestment}
                onChange={(event) => {
                  setMonthlyInvestment(Number(event.target.value));
                  setCopied(false);
                }}
                className="mt-2"
              />
            </label>

            <label className="block text-sm font-medium text-foreground">
              Expected Annual Return (%)
              <Input
                type="number"
                min={0}
                step={0.1}
                value={annualReturn}
                onChange={(event) => {
                  setAnnualReturn(Number(event.target.value));
                  setCopied(false);
                }}
                className="mt-2"
              />
            </label>

            <label className="block text-sm font-medium text-foreground">
              Investment Duration (Years)
              <Input
                type="number"
                min={1}
                value={years}
                onChange={(event) => {
                  setYears(Number(event.target.value));
                  setCopied(false);
                }}
                className="mt-2"
              />
            </label>
          </div>
        </div>

        <PresetPanel
          title="Quick SIP amounts"
          values={sipPresets}
          selectedValue={monthlyInvestment}
          formatter={formatCurrency}
          onSelect={(value) => {
            setMonthlyInvestment(value);
            setCopied(false);
          }}
        />

        <PresetPanel
          title="Quick durations"
          values={durationPresets}
          selectedValue={years}
          formatter={(value) => `${value} Years`}
          onSelect={(value) => {
            setYears(value);
            setCopied(false);
          }}
        />

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Goal mode</h2>
          <label className="mt-5 block text-sm font-medium text-foreground">
            Target Amount
            <Input
              type="number"
              min={0}
              value={targetAmount}
              onChange={(event) => {
                setTargetAmount(Number(event.target.value));
                setCopied(false);
              }}
              className="mt-2"
            />
          </label>
          <div className="mt-5 rounded-lg border border-border bg-background p-4">
            <p className="text-sm font-semibold text-muted-foreground">Required Monthly SIP</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{formatCurrency(requiredSip)}</p>
          </div>
        </div>

        <Button type="button" className="w-full" onClick={copySummary}>
          {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
          {copied ? "Copied" : "Copy SIP Summary"}
        </Button>
      </aside>

      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <ResultCard label="Total Investment" value={formatCurrency(result.totalInvestment)} />
          <ResultCard label="Estimated Returns" value={formatCurrency(result.estimatedReturns)} />
          <ResultCard label="Maturity Value" value={formatCurrency(result.maturityValue)} featured />
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Investment vs returns</h2>
          <div className="mt-6 overflow-hidden rounded-full bg-muted">
            <div className="flex h-4">
              <div className="bg-primary" style={{ width: `${investmentPercent}%` }} />
              <div className="bg-muted-foreground" style={{ width: `${returnsPercent}%` }} />
            </div>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <BreakdownCard
              label="Investment Amount"
              value={formatCurrency(result.totalInvestment)}
              percent={investmentPercent}
            />
            <BreakdownCard
              label="Returns Amount"
              value={formatCurrency(result.estimatedReturns)}
              percent={returnsPercent}
            />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Yearly growth table</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Estimated investment value at the end of each year.
              </p>
            </div>
            <p className="text-sm font-semibold text-muted-foreground">{years} years</p>
          </div>

          <div className="mt-5 max-h-[520px] overflow-auto rounded-lg border border-border">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="sticky top-0 bg-muted text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Year</th>
                  <th className="px-4 py-3 font-semibold">Investment</th>
                  <th className="px-4 py-3 font-semibold">Returns</th>
                  <th className="px-4 py-3 font-semibold">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {yearlyGrowth.map((row) => (
                  <tr key={row.year} className="bg-background">
                    <td className="px-4 py-3 font-medium text-foreground">{row.year}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatCurrency(row.investment)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatCurrency(row.returns)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatCurrency(row.value)}</td>
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

function BreakdownCard({ label, value, percent }: { label: string; value: string; percent: number }) {
  return (
    <div className="rounded-lg border border-border bg-background p-5">
      <p className="text-sm font-semibold text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
      <p className="mt-1 text-sm font-medium text-muted-foreground">{percent}% of maturity value</p>
    </div>
  );
}
