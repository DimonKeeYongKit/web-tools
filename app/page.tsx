"use client";

import Link from "next/link";
import { NavBar } from "./components/navbar";
import { useLang } from "./components/lang-context";
import { translations } from "./i18n/translations";

type ToolId = keyof typeof translations.zh.home.tools;

const toolsMeta: { id: ToolId; icon: string; href: string; color: string }[] = [
  { id: "qr-code", icon: "⬛", href: "/qr-code", color: "hover:border-purple-400 dark:hover:border-purple-500" },
  { id: "json-formatter", icon: "📋", href: "/json-formatter", color: "hover:border-yellow-400 dark:hover:border-yellow-500" },
  { id: "base64", icon: "🔄", href: "/base64", color: "hover:border-blue-400 dark:hover:border-blue-500" },
  { id: "password-generator", icon: "🔐", href: "/password-generator", color: "hover:border-green-400 dark:hover:border-green-500" },
  { id: "word-counter", icon: "📝", href: "/word-counter", color: "hover:border-orange-400 dark:hover:border-orange-500" },
  { id: "uuid-generator", icon: "🔑", href: "/uuid-generator", color: "hover:border-pink-400 dark:hover:border-pink-500" },
];

export default function Home() {
  const { lang } = useLang();
  const t = translations[lang];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <NavBar variant="home" title="Web Tools" subtitle={t.home.subtitle} />
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {toolsMeta.map((meta) => {
            const info = t.home.tools[meta.id];
            return (
              <Link
                key={meta.id}
                href={meta.href}
                className={`group block rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 hover:shadow-lg transition-all duration-150 ${meta.color}`}
              >
                <div className="text-3xl mb-3">{meta.icon}</div>
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {info.title}
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                  {info.description}
                </p>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}

