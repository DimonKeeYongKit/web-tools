"use client";

import { useEffect, useState } from "react";
import { UAParser } from "ua-parser-js";
import { isBot } from "ua-parser-js/bot-detection";
import { NavBar } from "../components/navbar";
import { useLang } from "../components/lang-context";
import { translations } from "../i18n/translations";

type Item = { label: string; value: string; mono?: boolean };
type Section = { title: string; icon: string; items: Item[] };

type UABrand = { brand: string; version: string };
type HighEntropy = {
  architecture?: string;
  bitness?: string;
  model?: string;
  platformVersion?: string;
  fullVersionList?: UABrand[];
  uaFullVersion?: string;
};
type UAData = {
  brands?: UABrand[];
  mobile?: boolean;
  platform?: string;
  getHighEntropyValues?: (hints: string[]) => Promise<HighEntropy>;
};
type ConnectionInfo = {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
};
type BatteryManager = {
  level: number;
  charging: boolean;
};

function deviceEmoji(type: string | undefined, osName: string): string {
  switch (type) {
    case "mobile":
    case "wearable":
      return "📱";
    case "tablet":
      return "📱";
    case "console":
      return "🎮";
    case "smarttv":
      return "📺";
    case "xr":
      return "🥽";
    case "embedded":
      return "🔌";
  }
  if (/mac|ios/i.test(osName)) return "💻";
  if (/windows/i.test(osName)) return "🖥️";
  if (/linux|chrome ?os|ubuntu|fedora|debian/i.test(osName)) return "🐧";
  return "🖥️";
}

function getGPU(): string {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      (canvas.getContext("webgl") as WebGLRenderingContext | null) ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    if (!gl) return "-";
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    if (ext) {
      const renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) as string;
      if (renderer) return renderer;
    }
    const fallback = gl.getParameter(gl.RENDERER) as string;
    return fallback || "-";
  } catch {
    return "-";
  }
}

function formatBytes(n: number): string {
  if (n >= 1024 ** 3) return (n / 1024 ** 3).toFixed(2) + " GB";
  if (n >= 1024 ** 2) return (n / 1024 ** 2).toFixed(2) + " MB";
  if (n >= 1024) return (n / 1024).toFixed(2) + " KB";
  return n + " B";
}

// Maps Windows UA-CH platformVersion to "Windows 10" vs "Windows 11".
// Microsoft maps Win 11 to platformVersion major >= 13.
function winVersionFromCH(platformVersion: string): string {
  const major = parseInt(platformVersion.split(".")[0] ?? "0", 10);
  if (major >= 13) return "Windows 11";
  if (major > 0) return "Windows 10";
  return "Windows";
}

type Summary = {
  device: string;
  deviceType?: string;
  os: string;
  browser: string;
  viewportW: number;
  viewportH: number;
  ua: string;
};

function CopyIconButton({
  copied,
  onCopy,
  ariaLabel,
}: {
  copied: boolean;
  onCopy: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      onClick={onCopy}
      aria-label={ariaLabel}
      className="shrink-0 p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 dark:text-zinc-500 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 transition-colors"
    >
      {copied ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3.5 h-3.5 text-emerald-500"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3.5 h-3.5"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}

export default function DeviceInfoPage() {
  const { lang } = useLang();
  const t = translations[lang];
  const [summary, setSummary] = useState<Summary | null>(null);
  const [sections, setSections] = useState<Section[] | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey((cur) => (cur === key ? null : cur));
    }, 2000);
  }

  function copySection(section: Section) {
    const lines = [`[${section.title}]`];
    for (const i of section.items) lines.push(`${i.label}: ${i.value}`);
    copyText(lines.join("\n"), `section:${section.title}`);
  }

  useEffect(() => {
    let cancelled = false;

    async function collect() {
      const ua = navigator.userAgent;
      const uaData = (navigator as Navigator & { userAgentData?: UAData }).userAgentData;

      // Baseline parse via ua-parser-js — handles in-app browsers, niche OSes,
      // engines, vendor/model and CPU arch when UA-CH is unavailable.
      const parsed = UAParser(ua);

      let hints: HighEntropy = {};
      if (uaData?.getHighEntropyValues) {
        try {
          hints = await uaData.getHighEntropyValues([
            "architecture",
            "bitness",
            "model",
            "platformVersion",
            "fullVersionList",
            "uaFullVersion",
          ]);
        } catch {
          // ignore — fall back to ua-parser-js
        }
      }
      if (cancelled) return;

      // Browser — prefer UA-CH brands, fall back to ua-parser-js
      let browserName = "";
      let browserVersion = "";
      if (uaData?.brands?.length) {
        const real =
          uaData.brands.find((b) => !/Not.?A.?Brand/i.test(b.brand)) ?? uaData.brands[0];
        browserName = real.brand;
        const fullMatch = hints.fullVersionList?.find((b) => b.brand === real.brand);
        browserVersion = fullMatch?.version ?? hints.uaFullVersion ?? real.version;
      } else {
        browserName = parsed.browser.name ?? "Unknown";
        browserVersion = parsed.browser.version ?? "";
      }

      // OS — combine UA-CH platform + platformVersion when available
      let osName = parsed.os.name
        ? `${parsed.os.name}${parsed.os.version ? " " + parsed.os.version : ""}`
        : "Unknown";
      let osVersionDisplay = parsed.os.version ?? "-";
      if (uaData?.platform) {
        if (uaData.platform === "Windows" && hints.platformVersion) {
          osName = winVersionFromCH(hints.platformVersion);
          osVersionDisplay = hints.platformVersion;
        } else if (hints.platformVersion) {
          osName = `${uaData.platform} ${hints.platformVersion}`;
          osVersionDisplay = hints.platformVersion;
        } else if (!parsed.os.name) {
          osName = uaData.platform;
        }
      }

      // Device — UA-CH model wins; otherwise use ua-parser-js vendor + model
      const vendor = parsed.device.vendor ?? "";
      const modelName = hints.model || parsed.device.model || "";
      const deviceType = parsed.device.type;
      let device: string;
      if (modelName) {
        device = vendor && !modelName.startsWith(vendor) ? `${vendor} ${modelName}` : modelName;
      } else if (vendor) {
        device = vendor;
      } else if (deviceType) {
        device = deviceType.charAt(0).toUpperCase() + deviceType.slice(1);
      } else if (/mac|ios/i.test(parsed.os.name ?? "")) {
        // iPadOS 13+ reports as Macintosh; distinguish via touch points
        device = navigator.maxTouchPoints > 1 ? "iPad" : "Mac";
      } else if (/windows/i.test(parsed.os.name ?? "")) {
        device = "Windows PC";
      } else if (/linux|ubuntu|fedora|chrome ?os/i.test(parsed.os.name ?? "")) {
        device = "Linux PC";
      } else {
        device = "Unknown";
      }

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
      const gpu = getGPU();

      // Network info
      const conn = (navigator as Navigator & { connection?: ConnectionInfo }).connection;

      // Pointer / preferences via matchMedia
      const pointer = window.matchMedia("(pointer: coarse)").matches
        ? t.deviceInfo.pointerCoarse
        : window.matchMedia("(pointer: fine)").matches
        ? t.deviceInfo.pointerFine
        : t.deviceInfo.pointerNone;
      const colorScheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? t.deviceInfo.schemeDark
        : window.matchMedia("(prefers-color-scheme: light)").matches
        ? t.deviceInfo.schemeLight
        : t.deviceInfo.schemeAuto;
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // Battery (async, may reject on unsupported browsers)
      let battery: BatteryManager | null = null;
      const getBattery = (
        navigator as Navigator & { getBattery?: () => Promise<BatteryManager> }
      ).getBattery;
      if (getBattery) {
        try {
          battery = await getBattery.call(navigator);
        } catch {
          battery = null;
        }
      }
      if (cancelled) return;

      // Storage estimate
      let storageStr = t.deviceInfo.notSupported;
      if (navigator.storage?.estimate) {
        try {
          const est = await navigator.storage.estimate();
          if (est.quota != null && est.usage != null) {
            storageStr = `${formatBytes(est.usage)} / ${formatBytes(est.quota)}`;
          } else if (est.quota != null) {
            storageStr = formatBytes(est.quota);
          }
        } catch {
          // ignore
        }
      }
      if (cancelled) return;

      const archDisplay = hints.architecture ?? parsed.cpu.architecture ?? "-";
      const engineDisplay = parsed.engine.name
        ? `${parsed.engine.name}${parsed.engine.version ? " " + parsed.engine.version : ""}`
        : "-";
      const deviceTypeDisplay = deviceType ?? t.deviceInfo.typeDesktop;
      const bot = isBot(ua);

      setSummary({
        device,
        deviceType,
        os: osName,
        browser: `${browserName}${browserVersion ? " " + browserVersion : ""}`,
        viewportW,
        viewportH,
        ua,
      });

      setSections([
        {
          title: t.deviceInfo.sectionIdentity,
          icon: "🆔",
          items: [
            { label: t.deviceInfo.deviceType, value: deviceTypeDisplay },
            { label: t.deviceInfo.vendor, value: vendor || "-" },
            { label: t.deviceInfo.model, value: modelName || "-" },
            { label: t.deviceInfo.os, value: osName },
            { label: t.deviceInfo.osVersion, value: osVersionDisplay },
            { label: t.deviceInfo.platform, value: platform },
            {
              label: t.deviceInfo.browser,
              value: `${browserName}${browserVersion ? " " + browserVersion : ""}`,
            },
            { label: t.deviceInfo.engine, value: engineDisplay },
            { label: t.deviceInfo.bot, value: bot ? t.deviceInfo.yes : t.deviceInfo.no },
          ],
        },
        {
          title: t.deviceInfo.sectionHardware,
          icon: "⚙️",
          items: [
            { label: t.deviceInfo.arch, value: archDisplay },
            { label: t.deviceInfo.bitness, value: hints.bitness ? `${hints.bitness}-bit` : "-" },
            { label: t.deviceInfo.cores, value: cores ? String(cores) : "-" },
            { label: t.deviceInfo.memory, value: mem ? `${mem} GB` : "-" },
            { label: t.deviceInfo.gpu, value: gpu },
            {
              label: t.deviceInfo.battery,
              value: battery ? `${Math.round(battery.level * 100)}%` : t.deviceInfo.notSupported,
            },
            {
              label: t.deviceInfo.charging,
              value: battery
                ? battery.charging
                  ? t.deviceInfo.pluggedIn
                  : t.deviceInfo.onBattery
                : "-",
            },
            { label: t.deviceInfo.storage, value: storageStr },
          ],
        },
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
          title: t.deviceInfo.sectionConnection,
          icon: "📡",
          items: [
            { label: t.deviceInfo.online, value: online ? t.deviceInfo.yes : t.deviceInfo.no },
            { label: t.deviceInfo.networkType, value: conn?.effectiveType ?? "-" },
            {
              label: t.deviceInfo.downlink,
              value: conn?.downlink != null ? `${conn.downlink} Mb/s` : "-",
            },
            { label: t.deviceInfo.rtt, value: conn?.rtt != null ? `${conn.rtt} ms` : "-" },
            {
              label: t.deviceInfo.saveData,
              value:
                conn?.saveData == null
                  ? "-"
                  : conn.saveData
                  ? t.deviceInfo.yes
                  : t.deviceInfo.no,
            },
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
          title: t.deviceInfo.sectionPrefs,
          icon: "🎛️",
          items: [
            { label: t.deviceInfo.colorScheme, value: colorScheme },
            {
              label: t.deviceInfo.reducedMotion,
              value: reducedMotion ? t.deviceInfo.yes : t.deviceInfo.no,
            },
            { label: t.deviceInfo.pointer, value: pointer },
            { label: t.deviceInfo.touch, value: touch ? t.deviceInfo.yes : t.deviceInfo.no },
            { label: t.deviceInfo.cookies, value: cookies ? t.deviceInfo.yes : t.deviceInfo.no },
          ],
        },
      ]);
    }

    collect();
    const onResize = () => {
      collect();
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", onResize);
    };
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
                <div className="text-5xl md:text-6xl shrink-0">{deviceEmoji(summary.deviceType, summary.os)}</div>
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
                <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base">{section.icon}</span>
                    <h2 className="text-xs md:text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide truncate">
                      {section.title}
                    </h2>
                  </div>
                  <CopyIconButton
                    copied={copiedKey === `section:${section.title}`}
                    onCopy={() => copySection(section)}
                    ariaLabel={`Copy ${section.title}`}
                  />
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
            <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base">🪪</span>
                <h2 className="text-xs md:text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide truncate">
                  {t.deviceInfo.userAgent}
                </h2>
              </div>
              <CopyIconButton
                copied={copiedKey === "ua"}
                onCopy={() => copyText(summary.ua, "ua")}
                ariaLabel={`Copy ${t.deviceInfo.userAgent}`}
              />
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
