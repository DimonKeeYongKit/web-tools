"use client";

import { useState } from "react";
import Link from "next/link";
import { NavBar } from "../components/navbar";
import { useLang } from "../components/lang-context";
import { translations } from "../i18n/translations";

function generateUUID(): string {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => {
    const n = Number(c);
    const r = crypto.getRandomValues(new Uint8Array(1))[0];
    return (n ^ (r & (15 >> (n / 4)))).toString(16);
  });
}

export default function UUIDGeneratorPage() {
  const { lang } = useLang();
  const t = translations[lang];

  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState(10);
  const [copied, setCopied] = useState<string | null>(null);

  function generate() {
    setUuids(Array.from({ length: count }, generateUUID));
    setCopied(null);
  }

  function copy(uuid: string) {
    navigator.clipboard.writeText(uuid);
    setCopied(uuid);
    setTimeout(() => setCopied(null), 2000);
  }

  function copyAll() {
    navigator.clipboard.writeText(uuids.join("\n"));
    setCopied("all");
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <NavBar variant="tool" title={`🔑 ${t.home.tools["uuid-generator"].title}`} backLabel={t.common.back} />

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-base font-medium text-zinc-700 dark:text-zinc-300">
              {t.uuidGenerator.count}
            </label>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 px-3 py-1.5 text-base focus:outline-none"
            >
              {[1, 5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {`${n}${t.uuidGenerator.countUnit}`}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={generate}
            className="px-5 py-2 rounded-lg bg-pink-600 text-white text-base font-medium hover:bg-pink-700 transition-colors"
          >
            {t.uuidGenerator.generate}
          </button>
          {uuids.length > 1 && (
            <button
              onClick={copyAll}
              className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-base font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ml-auto"
            >
              {copied === "all" ? t.uuidGenerator.copiedAll : t.uuidGenerator.copyAll}
            </button>
          )}
        </div>

        {uuids.length > 0 && (
          <div className="space-y-2">
            {uuids.map((uuid) => (
              <div
                key={uuid}
                className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3"
              >
                <span className="font-mono text-base text-zinc-800 dark:text-zinc-200 tabular-nums">
                  {uuid}
                </span>
                <button
                  onClick={() => copy(uuid)}
                  className="shrink-0 text-base px-3 py-1.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  {copied === uuid ? t.uuidGenerator.copied : t.uuidGenerator.copy}
                </button>
              </div>
            ))}
          </div>
        )}

        {uuids.length === 0 && (
          <div className="flex items-center justify-center h-40 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600 text-base">
            {t.uuidGenerator.empty}
          </div>
        )}
      </main>
    </div>
  );
}
