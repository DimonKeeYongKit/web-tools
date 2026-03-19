"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { NavBar } from "../components/navbar";
import { useLang } from "../components/lang-context";
import { translations } from "../i18n/translations";

const CHAR_SETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{}|;:,.<>?",
};

function generatePassword(
  length: number,
  options: Record<string, boolean>
): string {
  const pool = Object.entries(options)
    .filter(([, v]) => v)
    .map(([k]) => CHAR_SETS[k as keyof typeof CHAR_SETS])
    .join("");
  if (!pool) return "";
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr, (n) => pool[n % pool.length]).join("");
}

export default function PasswordGeneratorPage() {
  const { lang } = useLang();
  const t = translations[lang];

  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    digits: true,
    symbols: false,
  });
  const [passwords, setPasswords] = useState<string[]>([]);
  const [count, setCount] = useState(5);
  const [copied, setCopied] = useState<number | null>(null);

  const generate = useCallback(() => {
    const results: string[] = [];
    for (let i = 0; i < count; i++) {
      results.push(generatePassword(length, options));
    }
    setPasswords(results);
    setCopied(null);
  }, [length, options, count]);

  function copy(i: number) {
    navigator.clipboard.writeText(passwords[i]);
    setCopied(i);
    setTimeout(() => setCopied(null), 2000);
  }

  function strengthColor(pw: string) {
    const score =
      (pw.length >= 12 ? 1 : 0) +
      (/[A-Z]/.test(pw) ? 1 : 0) +
      (/[0-9]/.test(pw) ? 1 : 0) +
      (/[^A-Za-z0-9]/.test(pw) ? 1 : 0);
    if (score <= 1) return "text-red-500";
    if (score === 2) return "text-orange-500";
    if (score === 3) return "text-yellow-500";
    return "text-green-500";
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <NavBar variant="tool" title={`🔐 ${t.home.tools["password-generator"].title}`} backLabel={t.common.back} />

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t.passwordGenerator.length}: {length}
            </label>
            <input
              type="range"
              min={6}
              max={64}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full accent-green-500"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(
              ["uppercase", "lowercase", "digits", "symbols"] as const
            ).map((key) => (
              <label
                key={key}
                className="flex items-center gap-2 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={options[key]}
                  onChange={(e) =>
                    setOptions((o) => ({ ...o, [key]: e.target.checked }))
                  }
                  className="rounded accent-green-500"
                />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                  {t.passwordGenerator.charSets[key]}
                </span>
              </label>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t.passwordGenerator.count}
              </label>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 px-3 py-1.5 text-sm focus:outline-none"
              >
                {[1, 5, 10, 20].map((n) => (
                  <option key={n} value={n}>
                    {`${n}${t.passwordGenerator.countUnit}`}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={generate}
              className="px-5 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
            >
              {t.passwordGenerator.generate}
            </button>
          </div>
        </div>

        {passwords.length > 0 && (
          <div className="space-y-2">
            {passwords.map((pw, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3"
              >
                <span
                  className={`font-mono text-sm break-all ${strengthColor(pw)}`}
                >
                  {pw}
                </span>
                <button
                  onClick={() => copy(i)}
                  className="shrink-0 text-sm px-3 py-1.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  {copied === i ? t.passwordGenerator.copied : t.passwordGenerator.copy}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
