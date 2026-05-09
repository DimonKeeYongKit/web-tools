"use client";

import { useState, useMemo } from "react";
import { useLang } from "@/app/components/lang-context";
import { NavBar } from "../components/navbar";
import { translations } from "../i18n/translations";
import { NumberInput } from "../components/number-input";

interface YearData {
    year: number;
    invested: number;
    interest: number;
    total: number;
    realTotal: number;
    doubled?: boolean;
}

type CompoundingFrequency = "yearly" | "monthly" | "daily";
type DurationMode = "years" | "age";

export default function CompoundInterestCalculator() {
    const { lang } = useLang();
    const t = translations[lang];
    const [initialInvestment, setInitialInvestment] = useState("10000");
    const [monthlyInvestment, setMonthlyInvestment] = useState("0");
    const [interestRate, setInterestRate] = useState("5");
    const [years, setYears] = useState("30");
    const [currentAge, setCurrentAge] = useState("30");
    const [targetAge, setTargetAge] = useState("60");
    const [durationMode, setDurationMode] = useState<DurationMode>("years");
    const [compoundingFrequency, setCompoundingFrequency] =
        useState<CompoundingFrequency>("yearly");
    const [inflationEnabled, setInflationEnabled] = useState(false);
    const [inflationRate, setInflationRate] = useState("3");

    const effectiveYears =
        durationMode === "age"
            ? Math.max(
                  0,
                  Math.floor(
                      (parseFloat(targetAge) || 0) - (parseFloat(currentAge) || 0),
                  ),
              )
            : parseFloat(years) || 0;

    const result = useMemo(() => {
        const annualInterestRate = (parseFloat(interestRate) || 0) / 100;
        const inflRate = inflationEnabled
            ? (parseFloat(inflationRate) || 0) / 100
            : 0;
        const initialAmount = parseFloat(initialInvestment) || 0;
        const monthly = parseFloat(monthlyInvestment) || 0;
        let total = initialAmount;
        let investedAmount = initialAmount;
        let doublingTarget = initialAmount * 2;
        const yearlyData: YearData[] = [];

        const pushYear = (year: number, interest: number) => {
            const data: YearData = {
                year,
                invested: investedAmount,
                interest,
                total,
                realTotal: total / Math.pow(1 + inflRate, year),
            };
            if (initialAmount > 0 && total >= doublingTarget) {
                data.doubled = true;
                doublingTarget *= 2;
            }
            yearlyData.push(data);
        };

        if (compoundingFrequency === "yearly") {
            for (let i = 1; i <= effectiveYears; i++) {
                const yearStartTotal = total;
                const yearInvested = monthly * 12;
                total += yearInvested;
                investedAmount += yearInvested;
                const interestEarned =
                    (yearStartTotal + yearInvested / 2) * annualInterestRate;
                total += interestEarned;
                pushYear(i, interestEarned);
            }
        } else {
            const periodsPerYear = compoundingFrequency === "monthly" ? 12 : 365;
            const periodInterestRate = annualInterestRate / periodsPerYear;
            const totalPeriods = effectiveYears * periodsPerYear;
            const investmentPerPeriod = (monthly * 12) / periodsPerYear;

            let lastYear = 0;
            let yearlyInterest = 0;

            for (let i = 1; i <= totalPeriods; i++) {
                total += investmentPerPeriod;
                const interestEarned = total * periodInterestRate;
                total += interestEarned;
                yearlyInterest += interestEarned;
                investedAmount += investmentPerPeriod;

                const currentYear = Math.floor(i / periodsPerYear);
                if (currentYear > lastYear) {
                    pushYear(currentYear, yearlyInterest);
                    yearlyInterest = 0;
                    lastYear = currentYear;
                }
            }
            if (effectiveYears > lastYear) {
                pushYear(effectiveYears, yearlyInterest);
            }
        }

        return yearlyData;
    }, [
        initialInvestment,
        monthlyInvestment,
        interestRate,
        effectiveYears,
        compoundingFrequency,
        inflationEnabled,
        inflationRate,
    ]);

    const summary = useMemo(() => {
        if (result.length === 0) return null;
        const last = result[result.length - 1];
        return {
            finalAmount: last.total,
            totalInvested: last.invested,
            totalInterest: last.total - last.invested,
            realValue: last.realTotal,
        };
    }, [result]);

    const formatNum = (v: number) =>
        new Intl.NumberFormat(lang, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(v);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <NavBar
                variant="tool"
                title={`📈 ${t.home.tools["compound-interest-calculator"].title}`}
                backLabel={t.common.back}
            />
            <main className="max-w-4xl mx-auto px-4 md:px-5 py-6 md:py-8">
                <h1 className="text-xl md:text-2xl font-bold mb-3">
                    {t.compoundInterest.title}
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <div>
                        <label className="block mb-1 text-xs md:text-sm">
                            {t.compoundInterest.initialInvestment}
                        </label>
                        <NumberInput
                            value={initialInvestment}
                            onChange={setInitialInvestment}
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-xs md:text-sm">
                            {t.compoundInterest.monthlyInvestment}
                        </label>
                        <NumberInput
                            value={monthlyInvestment}
                            onChange={setMonthlyInvestment}
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-xs md:text-sm">
                            {t.compoundInterest.interestRate}
                        </label>
                        <NumberInput value={interestRate} onChange={setInterestRate} />
                    </div>
                    <div>
                        <label className="block mb-1 text-xs md:text-sm">
                            {t.compoundInterest.compoundingFrequency}
                        </label>
                        <select
                            value={compoundingFrequency}
                            onChange={(e) =>
                                setCompoundingFrequency(
                                    e.target.value as CompoundingFrequency,
                                )
                            }
                            className="w-full px-2.5 py-1.5 text-xs md:text-sm border rounded bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
                        >
                            <option value="yearly">{t.compoundInterest.yearly}</option>
                            <option value="monthly">{t.compoundInterest.monthly}</option>
                            <option value="daily">{t.compoundInterest.daily}</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
                            <label className="text-xs md:text-sm">
                                {t.compoundInterest.durationMode}
                            </label>
                            <div className="inline-flex rounded border border-zinc-300 dark:border-zinc-700 overflow-hidden text-xs">
                                <button
                                    type="button"
                                    onClick={() => setDurationMode("years")}
                                    className={`px-2 py-0.5 ${
                                        durationMode === "years"
                                            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                                            : "bg-white dark:bg-zinc-800"
                                    }`}
                                >
                                    {t.compoundInterest.byYears}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDurationMode("age")}
                                    className={`px-2 py-0.5 ${
                                        durationMode === "age"
                                            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                                            : "bg-white dark:bg-zinc-800"
                                    }`}
                                >
                                    {t.compoundInterest.byAge}
                                </button>
                            </div>
                        </div>
                        {durationMode === "years" ? (
                            <NumberInput
                                value={years}
                                onChange={(value) => {
                                    if (Number(value) <= 100) setYears(value);
                                }}
                                decimalPlaces={0}
                            />
                        ) : (
                            <div>
                                <div className="grid grid-cols-2 gap-2">
                                    <NumberInput
                                        value={currentAge}
                                        onChange={(value) => {
                                            if (Number(value) <= 120) setCurrentAge(value);
                                        }}
                                        decimalPlaces={0}
                                    />
                                    <NumberInput
                                        value={targetAge}
                                        onChange={(value) => {
                                            if (Number(value) <= 120) setTargetAge(value);
                                        }}
                                        decimalPlaces={0}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-1 text-[10px] md:text-xs text-zinc-500">
                                    <span>{t.compoundInterest.currentAge}</span>
                                    <span>{t.compoundInterest.targetAge}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 mb-4 text-xs md:text-sm">
                    <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={inflationEnabled}
                            onChange={(e) => setInflationEnabled(e.target.checked)}
                        />
                        {t.compoundInterest.inflationAdjustment}
                    </label>
                    {inflationEnabled && (
                        <div className="flex items-center gap-1.5">
                            <span>{t.compoundInterest.inflationRate}</span>
                            <div className="w-20">
                                <NumberInput
                                    value={inflationRate}
                                    onChange={setInflationRate}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {summary && (
                    <div
                        className={`grid ${
                            inflationEnabled
                                ? "grid-cols-2 md:grid-cols-4"
                                : "grid-cols-3"
                        } gap-2 md:gap-3 mb-4`}
                    >
                        <Stat
                            label={t.compoundInterest.finalAmount}
                            value={formatNum(summary.finalAmount)}
                            accent
                        />
                        <Stat
                            label={t.compoundInterest.totalInvested}
                            value={formatNum(summary.totalInvested)}
                        />
                        <Stat
                            label={t.compoundInterest.totalInterest}
                            value={formatNum(summary.totalInterest)}
                        />
                        {inflationEnabled && (
                            <Stat
                                label={t.compoundInterest.realValue}
                                value={formatNum(summary.realValue)}
                                muted
                            />
                        )}
                    </div>
                )}

                {result.length > 0 && (
                    <GrowthChart
                        data={result}
                        initial={parseFloat(initialInvestment) || 0}
                        showReal={inflationEnabled}
                        ageOffset={
                            durationMode === "age"
                                ? parseFloat(currentAge) || 0
                                : 0
                        }
                        labels={{
                            invested: t.compoundInterest.investedLabel,
                            interest: t.compoundInterest.interestLabel,
                            real: t.compoundInterest.realTotalLabel,
                        }}
                    />
                )}

                {result.length > 0 && (
                    <div className="mt-4">
                        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                            <h2 className="text-lg md:text-xl font-bold">
                                {t.compoundInterest.results}
                            </h2>
                            <div className="flex items-center gap-1.5 text-[11px] md:text-xs text-zinc-600 dark:text-zinc-400">
                                <span className="inline-block w-3 h-3 bg-yellow-200 dark:bg-yellow-800 border border-yellow-400 dark:border-yellow-700"></span>
                                {t.compoundInterest.doubledLegend}
                            </div>
                        </div>
                        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-x-8">
                            <div>
                                <YearTable
                                    rows={result.slice(0, Math.ceil(result.length / 2))}
                                    offset={0}
                                    ageOffset={
                                        durationMode === "age"
                                            ? parseFloat(currentAge) || 0
                                            : 0
                                    }
                                    t={t.compoundInterest}
                                    formatNum={formatNum}
                                />
                            </div>
                            <div>
                                <YearTable
                                    rows={result.slice(Math.ceil(result.length / 2))}
                                    offset={Math.ceil(result.length / 2)}
                                    ageOffset={
                                        durationMode === "age"
                                            ? parseFloat(currentAge) || 0
                                            : 0
                                    }
                                    t={t.compoundInterest}
                                    formatNum={formatNum}
                                />
                            </div>
                        </div>
                        <div className="lg:hidden">
                            <YearTable
                                rows={result}
                                offset={0}
                                ageOffset={
                                    durationMode === "age"
                                        ? parseFloat(currentAge) || 0
                                        : 0
                                }
                                t={t.compoundInterest}
                                formatNum={formatNum}
                            />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

function Stat({
    label,
    value,
    accent,
    muted,
}: {
    label: string;
    value: string;
    accent?: boolean;
    muted?: boolean;
}) {
    return (
        <div
            className={`p-2.5 md:p-3 rounded border ${
                accent
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                    : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
            }`}
        >
            <div
                className={`text-[10px] md:text-xs ${
                    muted ? "text-zinc-500" : "text-zinc-600 dark:text-zinc-400"
                }`}
            >
                {label}
            </div>
            <div
                className={`text-sm md:text-lg font-semibold mt-0.5 break-all ${
                    accent ? "text-emerald-700 dark:text-emerald-400" : ""
                } ${muted ? "text-zinc-500" : ""}`}
            >
                {value}
            </div>
        </div>
    );
}

function YearTable({
    rows,
    offset,
    ageOffset,
    t,
    formatNum,
}: {
    rows: YearData[];
    offset: number;
    ageOffset: number;
    t: typeof translations.zh.compoundInterest;
    formatNum: (v: number) => string;
}) {
    const useAge = ageOffset > 0;
    return (
        <table className="w-full border-collapse border text-xs md:text-sm">
            <thead>
                <tr className="bg-gray-200 dark:bg-zinc-800">
                    <th className="border p-1.5 font-medium text-zinc-900 dark:text-zinc-50">
                        {useAge ? t.ageColumn : t.year}
                    </th>
                    <th className="border p-1.5 font-medium text-zinc-900 dark:text-zinc-50">
                        {t.invested}
                    </th>
                    <th className="border p-1.5 font-medium text-zinc-900 dark:text-zinc-50">
                        {t.interestEarned}
                    </th>
                    <th className="border p-1.5 font-medium text-zinc-900 dark:text-zinc-50">
                        {t.total}
                    </th>
                </tr>
            </thead>
            <tbody>
                {rows.map((data, index) => (
                    <tr
                        key={data.year}
                        className={
                            data.doubled
                                ? "bg-yellow-200 dark:bg-yellow-800"
                                : (index + offset) % 2 === 0
                                    ? "bg-white dark:bg-zinc-900"
                                    : "bg-gray-50 dark:bg-zinc-800"
                        }
                    >
                        <td className="border p-1.5 text-center">
                            {useAge ? data.year + ageOffset : data.year}
                        </td>
                        <td className="border p-1.5 text-right">
                            {formatNum(data.invested)}
                        </td>
                        <td className="border p-1.5 text-right">
                            {formatNum(data.interest)}
                        </td>
                        <td className="border p-1.5 text-right font-semibold">
                            {formatNum(data.total)}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function GrowthChart({
    data,
    initial,
    showReal,
    ageOffset,
    labels,
}: {
    data: YearData[];
    initial: number;
    showReal: boolean;
    ageOffset: number;
    labels: { invested: string; interest: string; real: string };
}) {
    const W = 800;
    const H = 280;
    const padL = 56;
    const padR = 12;
    const padT = 12;
    const padB = 26;
    const innerW = W - padL - padR;
    const innerH = H - padT - padB;

    const points = [
        { year: 0, invested: initial, total: initial, realTotal: initial },
        ...data.map((d) => ({
            year: d.year,
            invested: d.invested,
            total: d.total,
            realTotal: d.realTotal,
        })),
    ];

    const maxX = points[points.length - 1].year || 1;
    const maxY = Math.max(
        ...points.map((p) => p.total),
        ...(showReal ? points.map((p) => p.realTotal) : [0]),
        1,
    );

    const xScale = (year: number) => padL + (year / maxX) * innerW;
    const yScale = (v: number) => padT + innerH - (v / maxY) * innerH;

    const baseline = padT + innerH;
    const investedArea =
        `M${xScale(0)},${baseline}` +
        points.map((p) => ` L${xScale(p.year)},${yScale(p.invested)}`).join("") +
        ` L${xScale(maxX)},${baseline} Z`;

    const interestArea =
        `M${xScale(points[0].year)},${yScale(points[0].invested)}` +
        points
            .slice(1)
            .map((p) => ` L${xScale(p.year)},${yScale(p.invested)}`)
            .join("") +
        [...points]
            .reverse()
            .map((p) => ` L${xScale(p.year)},${yScale(p.total)}`)
            .join("") +
        " Z";

    const investedLine =
        `M${xScale(points[0].year)},${yScale(points[0].invested)}` +
        points
            .slice(1)
            .map((p) => ` L${xScale(p.year)},${yScale(p.invested)}`)
            .join("");

    const totalLine =
        `M${xScale(points[0].year)},${yScale(points[0].total)}` +
        points
            .slice(1)
            .map((p) => ` L${xScale(p.year)},${yScale(p.total)}`)
            .join("");

    const realLine = showReal
        ? `M${xScale(points[0].year)},${yScale(points[0].realTotal)}` +
          points
              .slice(1)
              .map((p) => ` L${xScale(p.year)},${yScale(p.realTotal)}`)
              .join("")
        : "";

    const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * maxY);

    const xTickStep = Math.max(1, Math.ceil(maxX / 8));
    const xTicks: number[] = [];
    for (let i = 0; i <= maxX; i += xTickStep) xTicks.push(i);
    if (xTicks[xTicks.length - 1] !== maxX) xTicks.push(maxX);

    const formatTick = (v: number) => {
        if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + "M";
        if (v >= 1_000) return Math.round(v / 1_000) + "k";
        return v.toFixed(0);
    };

    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-3 mb-4">
            <svg
                viewBox={`0 0 ${W} ${H}`}
                className="w-full h-auto"
                preserveAspectRatio="none"
            >
                {yTicks.map((tick, i) => (
                    <g key={i}>
                        <line
                            x1={padL}
                            x2={padL + innerW}
                            y1={yScale(tick)}
                            y2={yScale(tick)}
                            className="stroke-zinc-200 dark:stroke-zinc-800"
                            strokeWidth="1"
                        />
                        <text
                            x={padL - 6}
                            y={yScale(tick)}
                            textAnchor="end"
                            dominantBaseline="middle"
                            className="fill-zinc-500"
                            fontSize="10"
                        >
                            {formatTick(tick)}
                        </text>
                    </g>
                ))}

                <path
                    d={investedArea}
                    className="fill-blue-400/60 dark:fill-blue-500/40"
                />
                <path
                    d={interestArea}
                    className="fill-emerald-400/70 dark:fill-emerald-500/50"
                />

                <path
                    d={investedLine}
                    fill="none"
                    strokeWidth="1.5"
                    className="stroke-blue-600 dark:stroke-blue-400"
                />
                <path
                    d={totalLine}
                    fill="none"
                    strokeWidth="1.5"
                    className="stroke-emerald-700 dark:stroke-emerald-400"
                />
                {showReal && (
                    <path
                        d={realLine}
                        fill="none"
                        strokeWidth="1.5"
                        strokeDasharray="5 4"
                        className="stroke-zinc-500"
                    />
                )}

                {xTicks.map((tick, i) => (
                    <text
                        key={i}
                        x={xScale(tick)}
                        y={H - padB + 14}
                        textAnchor="middle"
                        className="fill-zinc-500"
                        fontSize="10"
                    >
                        {ageOffset > 0 ? tick + ageOffset : tick}
                    </text>
                ))}
            </svg>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] md:text-xs mt-1 text-zinc-600 dark:text-zinc-400">
                <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-blue-400/60 dark:bg-blue-500/40 border border-blue-600 dark:border-blue-400" />
                    {labels.invested}
                </span>
                <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-emerald-400/70 dark:bg-emerald-500/50 border border-emerald-700 dark:border-emerald-400" />
                    {labels.interest}
                </span>
                {showReal && (
                    <span className="inline-flex items-center gap-1.5">
                        <svg width="14" height="6" viewBox="0 0 14 6">
                            <line
                                x1="0"
                                y1="3"
                                x2="14"
                                y2="3"
                                strokeDasharray="3 2"
                                strokeWidth="1.5"
                                className="stroke-zinc-500"
                            />
                        </svg>
                        {labels.real}
                    </span>
                )}
            </div>
        </div>
    );
}
