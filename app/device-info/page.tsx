"use client";

import { useEffect, useState } from "react";
import { NavBar } from "../components/navbar";
import { useLang } from "../components/lang-context";
import { translations } from "../i18n/translations";

type Item = { label: string; value: string; mono?: boolean };
type Section = { title: string; icon: string; items: Item[] };

function parseBrowser(ua: string): { name: string; version: string } {
  const tests: { name: string; re: RegExp }[] = [
    { name: "Edge", re: /Edg\/([\d.]+)/ },
    { name: "Opera", re: /OPR\/([\d.]+)/ },
    { name: "Chrome", re: /Chrome\/([\d.]+)/ },
    { name: "Firefox", re: /Firefox\/([\d.]+)/ },
    { name: "Safari", re: /Version\/([\d.]+).*Safari/ },
  ];
  for (const t of tests) {
    const m = ua.match(t.re);
    if (m) return { name: t.name, version: m[1] };
  }
  return { name: "Unknown", version: "" };
}

function parseOS(ua: string): string {
  if (/Windows NT 10/.test(ua)) return "Windows 10/11";
  if (/Windows NT 6\.3/.test(ua)) return "Windows 8.1";
  if (/Windows NT 6\.2/.test(ua)) return "Windows 8";
  if (/Windows NT 6\.1/.test(ua)) return "Windows 7";
  if (/Mac OS X ([\d_.]+)/.test(ua)) return "macOS " + RegExp.$1.replace(/_/g, ".");
  if (/Android ([\d.]+)/.test(ua)) return "Android " + RegExp.$1;
  if (/(iPhone|iPad|iPod).*OS ([\d_]+)/.test(ua)) return "iOS " + RegExp.$2.replace(/_/g, ".");
  if (/Linux/.test(ua)) return "Linux";
  return "Unknown";
}

function parseDevice(ua: string): string {
  if (/iPhone/.test(ua)) return "iPhone";
  if (/iPad/.test(ua)) return "iPad";
  if (/Android.*Mobile/.test(ua)) return "Android Phone";
  if (/Android/.test(ua)) return "Android Tablet";
  if (/Macintosh/.test(ua)) return "Mac";
  if (/Windows/.test(ua)) return "Windows PC";
  if (/Linux/.test(ua)) return "Linux PC";
  return "Unknown";
}

function deviceEmoji(device: string): string {
  if (device.includes("iPhone") || device.includes("Phone")) return "📱";
  if (device.includes("iPad") || device.includes("Tablet")) return "📱";
  if (device.includes("Mac")) return "💻";
  if (device.includes("Windows")) return "🖥️";
  if (device.includes("Linux")) return "🐧";
  return "🖥️";
}

type Summary = {
  device: string;
  os: string;
  browser: string;
  viewportW: number;
  viewportH: number;
  ua: string;
};

export default function DeviceInfoPage() {
  const { lang } = useLang();
  const t = translations[lang];
  const [summary, setSummary] = useState<Summary | null>(null);
  const [sections, setSections] = useState<Section[] | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    function collect() {
      const ua = navigator.userAgent;
      const browser = parseBrowser(ua);
      const os = parseOS(ua);
      const device = parseDevice(ua);
      const screenW = window.screen.width;
      const screenH = window.screen.height;
      const availW = window.screen.availWidth;
      const availH = window.screen.availHeight;
      const viewportW = window.innerWidth;
      const viewportH = window.innerHeight;
      const dpr = window.devicePixelRatio;
      const colorDepth = window.screen.colorDepth;
      const orientation = screen.orientation?.type ?? "-";
      const lang_ = navigator.language;
      const langs = navigator.languages?.join(", ") ?? "-";
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const cores = navigator.hardwareConcurrency ?? 0;
      const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
      const online = navigator.onLine;
      const cookies = navigator.cookieEnabled;
      const touch = navigator.maxTouchPoints > 0;
      const platform = navigator.platform;

      setSummary({
        device,
        os,
        browser: `${browser.name}${browser.version ? " " + browser.version : ""}`,
        viewportW,
        viewportH,
        ua,
      });

      setSections([
        {
          title: t.deviceInfo.sectionDisplay,
          icon: "🖼️",
          items: [
            { label: t.deviceInfo.screen, value: `${screenW} × ${screenH}` },
            { label: t.deviceInfo.availScreen, value: `${availW} × ${availH}` },
            { label: t.deviceInfo.viewport, value: `${viewportW} × ${viewportH}` },
            { label: t.deviceInfo.dpr, value: String(dpr) },
            { label: t.deviceInfo.colorDepth, value: `${colorDepth}-bit` },
            { label: t.deviceInfo.orientation, value: orientation },
          ],
        },
        {
          title: t.deviceInfo.sectionSystem,
          icon: "⚙️",
          items: [
            { label: t.deviceInfo.os, value: os },
            { label: t.deviceInfo.platform, value: platform },
            { label: t.deviceInfo.cores, value: cores ? String(cores) : "-" },
            { label: t.deviceInfo.memory, value: mem ? `${mem} GB` : "-" },
          ],
        },
        {
          title: t.deviceInfo.sectionLocale,
          icon: "🌐",
          items: [
            { label: t.deviceInfo.language, value: lang_ },
            { label: t.deviceInfo.languages, value: langs },
            { label: t.deviceInfo.timezone, value: tz },
          ],
        },
        {
          title: t.deviceInfo.sectionNetwork,
          icon: "📡",
          items: [
            { label: t.deviceInfo.online, value: online ? t.deviceInfo.yes : t.deviceInfo.no },
            { label: t.deviceInfo.touch, value: touch ? t.deviceInfo.yes : t.deviceInfo.no },
            { label: t.deviceInfo.cookies, value: cookies ? t.deviceInfo.yes : t.deviceInfo.no },
          ],
        },
      ]);
    }
    collect();
    window.addEventListener("resize", collect);
    return () => window.removeEventListener("resize", collect);
  }, [t]);

  function copyAll() {
    if (!sections || !summary) return;
    const lines: string[] = [];
    lines.push(`${t.deviceInfo.device}: ${summary.device}`);
    lines.push(`${t.deviceInfo.os}: ${summary.os}`);
    lines.push(`${t.deviceInfo.browser}: ${summary.browser}`);
    for (const s of sections) {
      lines.push("");
      lines.push(`[${s.title}]`);
      for (const i of s.items) lines.push(`${i.label}: ${i.value}`);
    }
    lines.push("");
    lines.push(`${t.deviceInfo.userAgent}: ${summary.ua}`);
    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <NavBar variant="tool" title={`📱 ${t.home.tools["device-info"].title}`} backLabel={t.common.back} />

      <main className="max-w-4xl mx-auto px-4 md:px-5 py-6 md:py-8 space-y-5">
        {summary && (
          <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-indigo-50 via-white to-sky-50 dark:from-indigo-950/40 dark:via-zinc-900 dark:to-sky-950/40 p-5 md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="text-5xl md:text-6xl shrink-0">{deviceEmoji(summary.device)}</div>
                <div className="min-w-0">
                  <div className="text-xl md:text-2xl font-semibold text-zinc-900 dark:text-zinc-50 truncate">
                    {summary.device}
                  </div>
                  <div className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 mt-0.5 truncate">
                    {summary.os} · {summary.browser}
                  </div>
                  <div className="text-xs md:text-sm text-zinc-500 dark:text-zinc-500 mt-0.5 font-mono">
                    {summary.viewportW} × {summary.viewportH}
                  </div>
                </div>
              </div>
              <button
                onClick={copyAll}
                className="shrink-0 px-3.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/70 backdrop-blur text-zinc-700 dark:text-zinc-300 text-xs md:text-sm font-medium hover:bg-white dark:hover:bg-zinc-800 transition-colors"
              >
                {copied ? t.deviceInfo.copied : t.deviceInfo.copyAll}
              </button>
            </div>
          </div>
        )}

        {sections && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sections.map((section) => (
              <div
                key={section.title}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden"
              >
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                  <span className="text-base">{section.icon}</span>
                  <h2 className="text-xs md:text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                    {section.title}
                  </h2>
                </div>
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {section.items.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between gap-3 px-4 py-2.5 text-xs md:text-sm"
                    >
                      <span className="text-zinc-500 dark:text-zinc-400 shrink-0">{item.label}</span>
                      <span className="font-mono text-zinc-800 dark:text-zinc-200 text-right break-all">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {summary && (
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
              <span className="text-base">🪪</span>
              <h2 className="text-xs md:text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                {t.deviceInfo.userAgent}
              </h2>
            </div>
            <p className="px-4 py-3 text-xs md:text-sm font-mono text-zinc-700 dark:text-zinc-300 break-all leading-relaxed">
              {summary.ua}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
