"use client";

import { useState } from "react";
import Link from "next/link";
import { NavBar } from "../components/navbar";
import { useLang } from "../components/lang-context";
import { translations } from "../i18n/translations";

function analyze(text: string) {
  const chars = text.length;
  const charsNoSpace = text.replace(/\s/g, "").length;
  const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const lines = text === "" ? 0 : text.split("\n").length;
  const sentences = text.trim() === "" ? 0 : text.split(/[.!?]+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(words / 200));
  return { chars, charsNoSpace, words, lines, sentences, readingTime };
}

export default function WordCounterPage() {
  const { lang } = useLang();
  const t = translations[lang];

  const [text, setText] = useState("");
  const stats = analyze(text);

  const statItems = [
    { label: t.wordCounter.chars, value: stats.chars },
    { label: t.wordCounter.charsNoSpace, value: stats.charsNoSpace },
    { label: t.wordCounter.words, value: stats.words },
    { label: t.wordCounter.lines, value: stats.lines },
    { label: t.wordCounter.sentences, value: stats.sentences },
    { label: t.wordCounter.readingTime, value: stats.readingTime },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <NavBar variant="tool" title={`📝 ${t.home.tools["word-counter"].title}`} backLabel={t.common.back} />

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {statItems.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 text-center"
            >
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tabular-nums">
                {item.value.toLocaleString()}
              </div>
              <div className="text-base text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
                {item.label}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-base font-medium text-zinc-700 dark:text-zinc-300">
              {t.wordCounter.inputLabel}
            </label>
            {text && (
              <button
                onClick={() => setText("")}
                className="text-base text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              >
                {t.wordCounter.clear}
              </button>
            )}
          </div>
          <textarea
            className="w-full h-80 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 p-4 text-base focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none placeholder:text-zinc-400 leading-relaxed"
            placeholder={t.wordCounter.placeholder}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
      </main>
    </div>
  );
}
