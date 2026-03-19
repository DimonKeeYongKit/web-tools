"use client";

import { useSyncExternalStore } from "react";
import type { Lang } from "../i18n/translations";

let _lang: Lang = "zh";
let _mounted = false;
const _listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  _listeners.add(cb);
  // Lazy init from localStorage on first client mount
  if (!_mounted && typeof window !== "undefined") {
    _mounted = true;
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved === "zh" || saved === "en") {
      _lang = saved;
      // Defer notification so React picks it up after hydration
      queueMicrotask(() => _listeners.forEach((l) => l()));
    }
  }
  return () => void _listeners.delete(cb);
}

export function setLang(lang: Lang) {
  _lang = lang;
  localStorage.setItem("lang", lang);
  _listeners.forEach((l) => l());
}

export function useLang() {
  const lang = useSyncExternalStore(
    subscribe,
    () => _lang,
    () => "zh" as Lang
  );
  return { lang, setLang };
}
