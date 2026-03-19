"use client";

import { useSyncExternalStore } from "react";
import { useLang } from "./lang-context";

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function LangToggle() {
  const { lang, setLang } = useLang();
  const mounted = useIsMounted();

  return (
    <button
      onClick={() => setLang(lang === "zh" ? "en" : "zh")}
      aria-label="Switch language"
      className="flex h-9 min-w-[2.5rem] items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-sm font-semibold px-2"
    >
      {mounted ? (lang === "zh" ? "EN" : "中") : null}
    </button>
  );
}
