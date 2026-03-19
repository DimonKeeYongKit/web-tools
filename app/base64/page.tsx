"use client";

import { useState } from "react";
import Link from "next/link";
import { NavBar } from "../components/navbar";
import { useLang } from "../components/lang-context";
import { translations } from "../i18n/translations";

export default function Base64Page() {
  const { lang } = useLang();
  const t = translations[lang];

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [error, setError] = useState("");

  function convert() {
    setError("");
    try {
      if (mode === "encode") {
        setOutput(btoa(unescape(encodeURIComponent(input))));
      } else {
        setOutput(decodeURIComponent(escape(atob(input))));
      }
    } catch {
      setError(mode === "decode" ? t.base64.errorDecode : t.base64.errorEncode);
      setOutput("");
    }
  }

  function swap() {
    setInput(output);
    setOutput("");
    setMode((m) => (m === "encode" ? "decode" : "encode"));
    setError("");
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <NavBar variant="tool" title={`🔄 ${t.home.tools["base64"].title}`} backLabel={t.common.back} />

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        <div className="flex items-center gap-2 p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 w-fit">
          <button
            onClick={() => { setMode("encode"); setOutput(""); setError(""); }}
            className={`px-4 py-2 rounded-md text-base font-medium transition-colors ${
              mode === "encode"
                ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-sm"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            }`}
          >
            {t.base64.encodeTab}
          </button>
          <button
            onClick={() => { setMode("decode"); setOutput(""); setError(""); }}
            className={`px-4 py-2 rounded-md text-base font-medium transition-colors ${
              mode === "decode"
                ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-sm"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            }`}
          >
            {t.base64.decodeTab}
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-base font-medium text-zinc-700 dark:text-zinc-300">
            {mode === "encode" ? t.base64.inputLabelEncode : t.base64.inputLabelDecode}
          </label>
          <textarea
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 p-3 text-base font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder:text-zinc-400"
            rows={5}
            placeholder={mode === "encode" ? t.base64.placeholderEncode : t.base64.placeholderDecode}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={convert}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white text-base font-medium hover:bg-blue-700 transition-colors"
          >
            {mode === "encode" ? t.base64.encode : t.base64.decode}
          </button>
          {output && (
            <button
              onClick={swap}
              className="px-5 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-base font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {t.base64.swap}
            </button>
          )}
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-red-700 dark:text-red-400 text-base">
            ❌ {error}
          </div>
        )}

        {output && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-base font-medium text-zinc-700 dark:text-zinc-300">
                {mode === "encode" ? t.base64.resultLabelEncode : t.base64.resultLabelDecode}
              </label>
              <button
                onClick={() => navigator.clipboard.writeText(output)}
                className="text-base text-blue-600 dark:text-blue-400 hover:underline"
              >
                {t.base64.copy}
              </button>
            </div>
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 text-base font-mono text-zinc-800 dark:text-zinc-200 break-all whitespace-pre-wrap">
              {output}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
