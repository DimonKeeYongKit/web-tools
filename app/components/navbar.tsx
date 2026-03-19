"use client";

import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { LangToggle } from "./lang-toggle";

interface NavBarProps {
  /** On the home page, show site title + subtitle. On tool pages, show back link + tool title. */
  variant: "home";
  title: string;
  subtitle: string;
}

interface ToolNavBarProps {
  variant: "tool";
  title: string;
  backLabel: string;
}

export function NavBar(props: NavBarProps | ToolNavBarProps) {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4 h-24">
        {props.variant === "home" ? (
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
              🛠️ {props.title}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              {props.subtitle}
            </p>
          </div>
        ) : (
          <>
            <Link
              href="/"
              className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-sm transition-colors shrink-0"
            >
              {props.backLabel}
            </Link>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 truncate">
              {props.title}
            </h1>
          </>
        )}
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <LangToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
