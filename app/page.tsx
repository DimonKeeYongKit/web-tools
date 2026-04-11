"use client";

import Link from "next/link";
import Image from "next/image";
import { NavBar } from "./components/navbar";
import { useLang } from "./components/lang-context";
import { translations } from "./i18n/translations";

type ToolId = keyof typeof translations.zh.home.tools;

const toolsMeta: { id: ToolId; icon: string; href: string; color: string; isExternal?: boolean }[] = [
  { id: "qr-code", icon: "⬛", href: "/qr-code", color: "hover:border-purple-400 dark:hover:border-purple-500" },
  { id: "json-formatter", icon: "📋", href: "/json-formatter", color: "hover:border-yellow-400 dark:hover:border-yellow-500" },
  { id: "cyberchef", icon: "https://www.google.com/s2/favicons?domain=gchq.github.io/CyberChef", href: "https://gchq.github.io/CyberChef", color: "hover:border-blue-400 dark:hover:border-blue-500", isExternal: true },
  { id: "password-generator", icon: "🔐", href: "/password-generator", color: "hover:border-green-400 dark:hover:border-green-500" },
  { id: "word-counter", icon: "📝", href: "/word-counter", color: "hover:border-orange-400 dark:hover:border-orange-500" },
  { id: "uuid-generator", icon: "🔑", href: "/uuid-generator", color: "hover:border-pink-400 dark:hover:border-pink-500" },
  { id: "compound-interest-calculator", icon: "📈", href: "/compound-interest-calculator", color: "hover:border-red-400 dark:hover:border-red-500" },
  { id: "ifixit", icon: "https://www.google.com/s2/favicons?domain=www.ifixit.com", href: "https://www.ifixit.com/", color: "hover:border-gray-400 dark:hover:border-gray-500", isExternal: true },
  { id: "virustotal", icon: "https://www.google.com/s2/favicons?domain=www.virustotal.com", href: "https://www.virustotal.com/", color: "hover:border-teal-400 dark:hover:border-teal-500", isExternal: true },
  { id: "background-remover", icon: "🖼️", href: "/background-remover", color: "hover:border-cyan-400 dark:hover:border-cyan-500" },
];

export default function Home() {
  const { lang } = useLang();
  const t = translations[lang];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <NavBar variant="home" title="Web Tools" subtitle={t.home.subtitle} />
      <main className="max-w-4xl mx-auto px-4 md:px-5 py-6 md:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {toolsMeta.map((meta) => {
            const info = t.home.tools[meta.id as keyof typeof t.home.tools];
            const linkContent = (
              <>
                <div className="text-2xl mb-2.5">
                  {meta.icon.startsWith("http") ? (
                    <Image
                      src={meta.icon}
                      alt={`${meta.id} logo`}
                      width={28}
                      height={28}
                      className="w-7 h-7"
                      unoptimized
                    />
                  ) : (
                    meta.icon
                  )}
                </div>
                <h2 className="font-semibold text-sm md:text-base text-zinc-900 dark:text-zinc-50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {info.title}
                </h2>
                <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                  {info.description}
                </p>
              </>
            );

            if (meta.isExternal) {
              return (
                <a
                  key={meta.id}
                  href={meta.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group block rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 md:p-5 hover:shadow-lg transition-all duration-150 ${meta.color}`}
                >
                  {linkContent}
                </a>
              );
            }

            return (
              <Link
                key={meta.id}
                href={meta.href}
                className={`group block rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 md:p-5 hover:shadow-lg transition-all duration-150 ${meta.color}`}
              >
                {linkContent}
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}

