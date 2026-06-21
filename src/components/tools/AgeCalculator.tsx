"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Check, Clipboard, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ExactAge = {
  years: number;
  months: number;
  days: number;
};

const milestones = [1000, 5000, 10000];
const dayMs = 24 * 60 * 60 * 1000;
const zodiacSigns = [
  { name: "Capricorn", start: [12, 22], end: [1, 19] },
  { name: "Aquarius", start: [1, 20], end: [2, 18] },
  { name: "Pisces", start: [2, 19], end: [3, 20] },
  { name: "Aries", start: [3, 21], end: [4, 19] },
  { name: "Taurus", start: [4, 20], end: [5, 20] },
  { name: "Gemini", start: [5, 21], end: [6, 20] },
  { name: "Cancer", start: [6, 21], end: [7, 22] },
  { name: "Leo", start: [7, 23], end: [8, 22] },
  { name: "Virgo", start: [8, 23], end: [9, 22] },
  { name: "Libra", start: [9, 23], end: [10, 22] },
  { name: "Scorpio", start: [10, 23], end: [11, 21] },
  { name: "Sagittarius", start: [11, 22], end: [12, 21] },
];
const chineseZodiac = [
  "Rat",
  "Ox",
  "Tiger",
  "Rabbit",
  "Dragon",
  "Snake",
  "Horse",
  "Goat",
  "Monkey",
  "Rooster",
  "Dog",
  "Pig",
];

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(Math.max(0, Math.floor(value)));
}

function addYears(date: Date, years: number) {
  const nextDate = new Date(date);
  nextDate.setFullYear(nextDate.getFullYear() + years);
  return nextDate;
}

function addMonths(date: Date, months: number) {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + months);
  return nextDate;
}

function calculateExactAge(birthDate: Date, targetDate: Date): ExactAge {
  let years = targetDate.getFullYear() - birthDate.getFullYear();
  let cursor = addYears(birthDate, years);

  if (cursor > targetDate) {
    years -= 1;
    cursor = addYears(birthDate, years);
  }

  let months = 0;
  while (addMonths(cursor, months + 1) <= targetDate) {
    months += 1;
  }

  cursor = addMonths(cursor, months);
  const days = Math.floor((targetDate.getTime() - cursor.getTime()) / dayMs);

  return { years, months, days };
}

function getNextBirthday(birthDate: Date, targetDate: Date) {
  let nextBirthday = new Date(
    targetDate.getFullYear(),
    birthDate.getMonth(),
    birthDate.getDate(),
  );

  if (nextBirthday < targetDate) {
    nextBirthday = new Date(
      targetDate.getFullYear() + 1,
      birthDate.getMonth(),
      birthDate.getDate(),
    );
  }

  const daysRemaining = Math.ceil((nextBirthday.getTime() - targetDate.getTime()) / dayMs);
  return { nextBirthday, daysRemaining };
}

function getZodiacSign(date: Date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return (
    zodiacSigns.find((sign) => {
      const [startMonth, startDay] = sign.start;
      const [endMonth, endDay] = sign.end;

      if (startMonth > endMonth) {
        return (
          (month === startMonth && day >= startDay) ||
          (month === endMonth && day <= endDay)
        );
      }

      return (
        (month === startMonth && day >= startDay) ||
        (month === endMonth && day <= endDay) ||
        (month > startMonth && month < endMonth)
      );
    })?.name ?? "Unknown"
  );
}

function getChineseZodiac(year: number) {
  return chineseZodiac[(year - 1900) % 12];
}

function buildSummaryText({
  age,
  totalDays,
  nextBirthday,
  daysRemaining,
}: {
  age: ExactAge;
  totalDays: number;
  nextBirthday: Date;
  daysRemaining: number;
}) {
  return [
    `Age: ${age.years} Years ${age.months} Months ${age.days} Days`,
    `Total Days: ${Math.floor(totalDays)}`,
    `Next Birthday: ${daysRemaining} Days (${formatDate(nextBirthday)})`,
  ].join("\n");
}

function downloadShareCard({
  age,
  totalDays,
  totalWeeks,
  nextBirthday,
  daysRemaining,
}: {
  age: ExactAge;
  totalDays: number;
  totalWeeks: number;
  nextBirthday: Date;
  daysRemaining: number;
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
  context.fillText("MyPixelogs age calculator", 215, 157);
  context.font = "800 62px Arial";
  context.fillText(`${age.years} Years ${age.months} Months`, 110, 285);
  context.font = "500 28px Arial";
  context.fillStyle = "#A3A3A3";
  context.fillText(`${age.days} Days`, 110, 330);

  const rows = [
    `Total Days: ${formatNumber(totalDays)}`,
    `Total Weeks: ${formatNumber(totalWeeks)}`,
    `Next Birthday: ${formatDate(nextBirthday)}`,
    `Days Remaining: ${formatNumber(daysRemaining)}`,
  ];

  context.font = "600 28px Arial";
  context.fillStyle = "#FAFAFA";
  rows.forEach((row, index) => {
    context.fillText(row, 110, 405 + index * 42);
  });

  const url = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = url;
  link.download = "mypixelogs-age-summary.png";
  link.click();
}

export function AgeCalculator() {
  const todayValue = toDateInputValue(new Date());
  const [birthDateValue, setBirthDateValue] = useState("2000-01-01");
  const [targetDateValue, setTargetDateValue] = useState(todayValue);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const birthDate = startOfDay(new Date(birthDateValue));
    const targetDate = startOfDay(new Date(targetDateValue || todayValue));
    const safeTargetDate = targetDate < birthDate ? birthDate : targetDate;
    const age = calculateExactAge(birthDate, safeTargetDate);
    const totalDays = Math.floor((safeTargetDate.getTime() - birthDate.getTime()) / dayMs);
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = age.years * 12 + age.months;
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;
    const nextBirthday = getNextBirthday(birthDate, safeTargetDate);
    const bornDay = new Intl.DateTimeFormat("en-IN", { weekday: "long" }).format(birthDate);

    return {
      birthDate,
      targetDate: safeTargetDate,
      age,
      totalDays,
      totalWeeks,
      totalMonths,
      totalHours,
      totalMinutes,
      nextBirthday: nextBirthday.nextBirthday,
      daysRemaining: nextBirthday.daysRemaining,
      bornDay,
      zodiac: getZodiacSign(birthDate),
      chineseZodiac: getChineseZodiac(birthDate.getFullYear()),
    };
  }, [birthDateValue, targetDateValue, todayValue]);

  async function copySummary() {
    await navigator.clipboard.writeText(
      buildSummaryText({
        age: result.age,
        totalDays: result.totalDays,
        nextBirthday: result.nextBirthday,
        daysRemaining: result.daysRemaining,
      }),
    );
    setCopied(true);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <aside className="space-y-6">
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-foreground">Date inputs</h2>
          </div>

          <div className="mt-5 space-y-5">
            <label className="block text-sm font-medium text-foreground">
              Date of Birth
              <Input
                type="date"
                value={birthDateValue}
                max={targetDateValue}
                onChange={(event) => {
                  setBirthDateValue(event.target.value);
                  setCopied(false);
                }}
                className="mt-2"
              />
            </label>

            <label className="block text-sm font-medium text-foreground">
              Calculate Age On
              <Input
                type="date"
                value={targetDateValue}
                onChange={(event) => {
                  setTargetDateValue(event.target.value);
                  setCopied(false);
                }}
                className="mt-2"
              />
            </label>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Birthday info</h2>
          <div className="mt-5 space-y-4">
            <InfoRow label="Born On" value={result.bornDay} />
            <InfoRow label="Zodiac" value={result.zodiac} />
            <InfoRow label="Chinese Zodiac" value={result.chineseZodiac} />
          </div>
        </div>

        <div className="grid gap-3">
          <Button type="button" variant="outline" onClick={copySummary}>
            {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
            {copied ? "Copied" : "Copy Age Summary"}
          </Button>
          <Button
            type="button"
            onClick={() =>
              downloadShareCard({
                age: result.age,
                totalDays: result.totalDays,
                totalWeeks: result.totalWeeks,
                nextBirthday: result.nextBirthday,
                daysRemaining: result.daysRemaining,
              })
            }
          >
            <Download className="h-4 w-4" />
            Download Share Card
          </Button>
        </div>
      </aside>

      <div className="space-y-6">
        <div className="rounded-lg border border-primary/40 bg-primary/5 p-6 shadow-sm">
          <p className="text-sm font-semibold text-muted-foreground">Age</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <AgeValue label="Years" value={result.age.years} />
            <AgeValue label="Months" value={result.age.months} />
            <AgeValue label="Days" value={result.age.days} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">Next Birthday</h2>
            <p className="mt-4 text-3xl font-bold text-foreground">{formatDate(result.nextBirthday)}</p>
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              {formatNumber(result.daysRemaining)} Days Remaining
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">You have lived</h2>
            <p className="mt-4 text-3xl font-bold text-foreground">{formatNumber(result.totalDays)} Days</p>
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              {formatNumber(result.totalWeeks)} Weeks
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Fun stats</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatBox label="Total Months" value={formatNumber(result.totalMonths)} />
            <StatBox label="Total Weeks" value={formatNumber(result.totalWeeks)} />
            <StatBox label="Total Hours" value={formatNumber(result.totalHours)} />
            <StatBox label="Total Minutes" value={formatNumber(result.totalMinutes)} />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Milestones</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {milestones.map((milestone) => {
              const completed = result.totalDays >= milestone;
              const milestoneDate = new Date(result.birthDate.getTime() + milestone * dayMs);

              return (
                <div key={milestone} className="rounded-lg border border-border bg-background p-5">
                  <p className="text-sm font-semibold text-muted-foreground">
                    {formatNumber(milestone)} Days
                  </p>
                  <p className={cn("mt-2 text-lg font-bold", completed ? "text-primary" : "text-foreground")}>
                    {completed ? "Completed" : "Upcoming"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{formatDate(milestoneDate)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function AgeValue({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <p className="text-4xl font-bold tracking-normal text-foreground">{value}</p>
      <p className="mt-2 text-sm font-semibold text-muted-foreground">{label}</p>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <p className="text-sm font-semibold text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
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
