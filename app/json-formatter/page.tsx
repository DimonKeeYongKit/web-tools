"use client";

import { useState } from "react";
import Link from "next/link";
import { NavBar } from "../components/navbar";
import { useLang } from "../components/lang-context";
import { translations } from "../i18n/translations";

export default function JSONFormatterPage() {
  const { lang } = useLang();
  const t = translations[lang];

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [indent, setIndent] = useState(2);

  function format() {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, indent));
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  }

  function minify() {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  }

  function copyOutput() {
    navigator.clipboard.writeText(output);
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <NavBar variant="tool" title={`📋 ${t.home.tools["json-formatter"].title}`} backLabel={t.common.back} />

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t.jsonFormatter.indent}
            </label>
            <select
              value={indent}
              onChange={(e) => setIndent(Number(e.target.value))}
              className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value={2}>{t.jsonFormatter.twoSpaces}</option>
              <option value={4}>{t.jsonFormatter.fourSpaces}</option>
              <option value={1}>{t.jsonFormatter.oneTab}</option>
            </select>
          </div>
          <button
            onClick={format}
            className="px-4 py-2 rounded-lg bg-yellow-500 text-white text-sm font-medium hover:bg-yellow-600 transition-colors"
          >
            {t.jsonFormatter.format}
          </button>
          <button
            onClick={minify}
            className="px-4 py-2 rounded-lg bg-zinc-700 text-white text-sm font-medium hover:bg-zinc-800 transition-colors"
          >
            {t.jsonFormatter.minify}
          </button>
          {output && (
            <button
              onClick={copyOutput}
              className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ml-auto"
            >
              {t.jsonFormatter.copyResult}
            </button>
          )}
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-red-700 dark:text-red-400 text-sm font-mono">
            ❌ {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t.jsonFormatter.inputLabel}
            </label>
            <textarea
              className="w-full h-96 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 p-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
              placeholder='{"key": "value"}'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t.jsonFormatter.outputLabel}
            </label>
            <textarea
              className="w-full h-96 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 p-3 text-sm font-mono focus:outline-none resize-none"
              value={output}
              readOnly
              placeholder={t.jsonFormatter.outputPlaceholder}
              spellCheck={false}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
