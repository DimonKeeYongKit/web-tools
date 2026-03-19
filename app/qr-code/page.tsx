"use client";

import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { NavBar } from "../components/navbar";
import { useLang } from "../components/lang-context";
import { translations } from "../i18n/translations";

type Format = "svg" | "png" | "jpg" | "webp";

const FORMAT_OPTIONS: { value: Format; label: string }[] = [
  { value: "svg",  label: "SVG" },
  { value: "png",  label: "PNG" },
  { value: "jpg",  label: "JPG" },
  { value: "webp", label: "WebP" },
];

const EXPORT_SIZE = 1024; // rasterize at high resolution

export default function QRCodePage() {
  const { lang } = useLang();
  const t = translations[lang];

  const [text, setText] = useState("");
  const [size, setSize] = useState(256);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [fgColor, setFgColor] = useState("#000000");
  const [format, setFormat] = useState<Format>("png");
  const svgRef = useRef<SVGSVGElement>(null);

  function getSVGString(): string {
    if (!svgRef.current) return "";
    return new XMLSerializer().serializeToString(svgRef.current);
  }

  function triggerDownload(url: string, ext: string) {
    const a = document.createElement("a");
    a.href = url;
    a.download = `qrcode.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function download() {
    if (!svgRef.current) return;

    if (format === "svg") {
      const blob = new Blob([getSVGString()], { type: "image/svg+xml" });
      triggerDownload(URL.createObjectURL(blob), "svg");
      return;
    }

    // Rasterize via canvas
    const svgString = getSVGString();
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = EXPORT_SIZE;
      canvas.height = EXPORT_SIZE;
      const ctx = canvas.getContext("2d")!;
      // Fill background for JPG (no transparency)
      if (format === "jpg") {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, EXPORT_SIZE, EXPORT_SIZE);
      }
      ctx.drawImage(img, 0, 0, EXPORT_SIZE, EXPORT_SIZE);
      URL.revokeObjectURL(svgUrl);

      const mimeMap: Record<string, string> = {
        png:  "image/png",
        jpg:  "image/jpeg",
        webp: "image/webp",
      };
      const dataUrl = canvas.toDataURL(mimeMap[format], 0.92);
      triggerDownload(dataUrl, format);
    };
    img.src = svgUrl;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <NavBar variant="tool" title={`⬛ ${t.home.tools["qr-code"].title}`} backLabel={t.common.back} />

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        <div className="space-y-2">
          <label className="text-base font-medium text-zinc-700 dark:text-zinc-300">
            {t.qrCode.inputLabel}
          </label>
          <textarea
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 p-3 text-base focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none placeholder:text-zinc-400"
            rows={4}
            placeholder={t.qrCode.placeholder}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-base font-medium text-zinc-700 dark:text-zinc-300">
              {t.qrCode.size}: {size}px
            </label>
            <input
              type="range"
              min={128}
              max={512}
              step={32}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full accent-purple-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-base font-medium text-zinc-700 dark:text-zinc-300">
              {t.qrCode.bgColor}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-10 h-10 rounded border border-zinc-300 dark:border-zinc-700 cursor-pointer"
              />
              <span className="text-base text-zinc-500 font-mono">{bgColor}</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-base font-medium text-zinc-700 dark:text-zinc-300">
              {t.qrCode.fgColor}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="w-10 h-10 rounded border border-zinc-300 dark:border-zinc-700 cursor-pointer"
              />
              <span className="text-base text-zinc-500 font-mono">{fgColor}</span>
            </div>
          </div>
        </div>

        {text ? (
          <div className="flex flex-col items-center gap-6 p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <QRCodeSVG
              ref={svgRef}
              value={text}
              size={size}
              bgColor={bgColor}
              fgColor={fgColor}
            />
            <p className="text-base text-zinc-400 break-all max-w-xs text-center">
              {text}
            </p>

            {/* Format selector */}
            <div className="w-full space-y-2">
              <p className="text-base font-medium text-zinc-700 dark:text-zinc-300 text-center">
                {t.qrCode.formatLabel}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {FORMAT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFormat(opt.value)}
                    className={`rounded-lg border px-3 py-2.5 text-base font-bold tracking-wide transition-colors ${
                      format === opt.value
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300"
                        : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={download}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-purple-600 text-white text-base font-medium hover:bg-purple-700 transition-colors"
            >
              {t.qrCode.download} {format.toUpperCase()}
              {format !== "svg" && (
                <span className="ml-1.5 opacity-70 text-base">({EXPORT_SIZE}×{EXPORT_SIZE}px)</span>
              )}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center h-48 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600 text-base">
            {t.qrCode.empty}
          </div>
        )}
      </main>
    </div>
  );
}

