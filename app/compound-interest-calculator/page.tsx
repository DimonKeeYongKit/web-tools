"use client";

import { useState, useMemo } from "react";
import { useLang } from "@/app/components/lang-context";
import { NavBar } from "../components/navbar";
import { translations } from "../i18n/translations";

interface YearData {
  year: number;
  invested: number;
  interest: number;
  total: number;
}

type CompoundingFrequency = "yearly" | "monthly" | "daily";

export default function CompoundInterestCalculator() {
  const { lang } = useLang();
  const t = translations[lang];
  const [initialInvestment, setInitialInvestment] = useState(10000);
  const [monthlyInvestment, setMonthlyInvestment] = useState(1000);
  const [interestRate, setInterestRate] = useState(5);
  const [years, setYears] = useState(10);
  const [compoundingFrequency, setCompoundingFrequency] =
    useState<CompoundingFrequency>("yearly");

  const result = useMemo(() => {
    const annualInterestRate = interestRate / 100;
    let total = initialInvestment;
    const yearlyData: YearData[] = [];
    let investedAmount = initialInvestment;

    if (compoundingFrequency === "yearly") {
      for (let i = 1; i <= years; i++) {
        const yearStartTotal = total;
        let yearInvested = 0;
        for (let month = 0; month < 12; month++) {
          total += monthlyInvestment;
          yearInvested += monthlyInvestment;
        }
        investedAmount += yearInvested;
        const interestEarned =
          (yearStartTotal + yearInvested / 2) * annualInterestRate;
        total += interestEarned;

        yearlyData.push({
          year: i,
          invested: investedAmount,
          interest: interestEarned,
          total: total,
        });
      }
    } else {
      const periodsPerYear = compoundingFrequency === "monthly" ? 12 : 365;
      const periodInterestRate = annualInterestRate / periodsPerYear;
      const totalPeriods = years * periodsPerYear;
      const investmentPerPeriod =
        (monthlyInvestment * 12) / periodsPerYear;

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
          yearlyData.push({
            year: currentYear,
            invested: investedAmount,
            interest: yearlyInterest,
            total: total,
          });
          yearlyInterest = 0;
          lastYear = currentYear;
        }
      }
      // Add the last year's data if it wasn't pushed
      if (years > lastYear) {
        yearlyData.push({
          year: years,
          invested: investedAmount,
          interest: yearlyInterest,
          total: total,
        });
      }
    }

    return yearlyData;
  }, [
    initialInvestment,
    monthlyInvestment,
    interestRate,
    years,
    compoundingFrequency,
  ]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <NavBar
        variant="tool"
        title={`📈 ${t.home.tools["compound-interest-calculator"].title}`}
        backLabel={t.common.back}
      />
      <main className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-4">{t.compoundInterest.title}</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block mb-1">
              {t.compoundInterest.initialInvestment}
            </label>
            <input
              type="number"
              value={initialInvestment}
              onChange={(e) => setInitialInvestment(Number(e.target.value))}
              className="w-full p-2 border rounded bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
            />
          </div>
          <div>
            <label className="block mb-1">
              {t.compoundInterest.monthlyInvestment}
            </label>
            <input
              type="number"
              value={monthlyInvestment}
              onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
              className="w-full p-2 border rounded bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
            />
          </div>
          <div>
            <label className="block mb-1">
              {t.compoundInterest.interestRate}
            </label>
            <input
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full p-2 border rounded bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
            />
          </div>
          <div>
            <label className="block mb-1">{t.compoundInterest.years}</label>
            <input
              type="number"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full p-2 border rounded bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
            />
          </div>
          <div>
            <label className="block mb-1">
              {t.compoundInterest.compoundingFrequency}
            </label>
            <select
              value={compoundingFrequency}
              onChange={(e) =>
                setCompoundingFrequency(e.target.value as CompoundingFrequency)
              }
              className="w-full p-2 border rounded bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
            >
              <option value="yearly">{t.compoundInterest.yearly}</option>
              <option value="monthly">{t.compoundInterest.monthly}</option>
              <option value="daily">{t.compoundInterest.daily}</option>
            </select>
          </div>
        </div>

        {result.length > 0 && (
          <div className="mt-4">
            <h2 className="text-xl font-bold mb-2">
              {t.compoundInterest.results}
            </h2>
            <div className="hidden lg:grid lg:grid-cols-2 lg:gap-x-8">
              <div>
                <table className="w-full border-collapse border">
                  <thead>
                    <tr className="bg-gray-200 dark:bg-zinc-800">
                      <th className="border p-2 font-medium text-zinc-900 dark:text-zinc-50">
                        {t.compoundInterest.year}
                      </th>
                      <th className="border p-2 font-medium text-zinc-900 dark:text-zinc-50">
                        {t.compoundInterest.invested}
                      </th>
                      <th className="border p-2 font-medium text-zinc-900 dark:text-zinc-50">
                        {t.compoundInterest.interestEarned}
                      </th>
                      <th className="border p-2 font-medium text-zinc-900 dark:text-zinc-50">
                        {t.compoundInterest.total}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result
                      .slice(0, Math.ceil(result.length / 2))
                      .map((data, index) => (
                        <tr
                          key={data.year}
                          className={
                            index % 2 === 0
                              ? "bg-white dark:bg-zinc-900"
                              : "bg-gray-50 dark:bg-zinc-800"
                          }
                        >
                          <td className="border p-2 text-center">
                            {data.year}
                          </td>
                          <td className="border p-2 text-right">
                            {new Intl.NumberFormat(lang, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }).format(data.invested)}
                          </td>
                          <td className="border p-2 text-right">
                            {new Intl.NumberFormat(lang, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }).format(data.interest)}
                          </td>
                          <td className="border p-2 text-right font-semibold">
                            {new Intl.NumberFormat(lang, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }).format(data.total)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <div>
                <table className="w-full border-collapse border">
                  <thead>
                    <tr className="bg-gray-200 dark:bg-zinc-800">
                      <th className="border p-2 font-medium text-zinc-900 dark:text-zinc-50">
                        {t.compoundInterest.year}
                      </th>
                      <th className="border p-2 font-medium text-zinc-900 dark:text-zinc-50">
                        {t.compoundInterest.invested}
                      </th>
                      <th className="border p-2 font-medium text-zinc-900 dark:text-zinc-50">
                        {t.compoundInterest.interestEarned}
                      </th>
                      <th className="border p-2 font-medium text-zinc-900 dark:text-zinc-50">
                        {t.compoundInterest.total}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result
                      .slice(Math.ceil(result.length / 2))
                      .map((data, index) => (
                        <tr
                          key={data.year}
                          className={
                            (index + Math.ceil(result.length / 2)) % 2 === 0
                              ? "bg-white dark:bg-zinc-900"
                              : "bg-gray-50 dark:bg-zinc-800"
                          }
                        >
                          <td className="border p-2 text-center">
                            {data.year}
                          </td>
                          <td className="border p-2 text-right">
                            {new Intl.NumberFormat(lang, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }).format(data.invested)}
                          </td>
                          <td className="border p-2 text-right">
                            {new Intl.NumberFormat(lang, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }).format(data.interest)}
                          </td>
                          <td className="border p-2 text-right font-semibold">
                            {new Intl.NumberFormat(lang, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }).format(data.total)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="lg:hidden">
              <table className="w-full border-collapse border">
                <thead>
                  <tr className="bg-gray-200 dark:bg-zinc-800">
                    <th className="border p-2 font-medium text-zinc-900 dark:text-zinc-50">
                      {t.compoundInterest.year}
                    </th>
                    <th className="border p-2 font-medium text-zinc-900 dark:text-zinc-50">
                      {t.compoundInterest.invested}
                    </th>
                    <th className="border p-2 font-medium text-zinc-900 dark:text-zinc-50">
                      {t.compoundInterest.interestEarned}
                    </th>
                    <th className="border p-2 font-medium text-zinc-900 dark:text-zinc-50">
                      {t.compoundInterest.total}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.map((data, index) => (
                    <tr
                      key={data.year}
                      className={
                        index % 2 === 0
                          ? "bg-white dark:bg-zinc-900"
                          : "bg-gray-50 dark:bg-zinc-800"
                      }
                    >
                      <td className="border p-2 text-center">{data.year}</td>
                      <td className="border p-2 text-right">
                        {new Intl.NumberFormat(lang, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(data.invested)}
                      </td>
                      <td className="border p-2 text-right">
                        {new Intl.NumberFormat(lang, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(data.interest)}
                      </td>
                      <td className="border p-2 text-right font-semibold">
                        {new Intl.NumberFormat(lang, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(data.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
