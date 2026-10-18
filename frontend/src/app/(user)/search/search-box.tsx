"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { controlClasses } from "@/components/ui/field";

const DEBOUNCE_MS = 250;

/**
 * Live search: typing updates `?q=` after a short pause, and the server
 * renders the results — so a search is linkable and survives a reload. It is
 * still a real `<form role="search">`, so Enter submits without JavaScript.
 */
export function SearchBox({ initial }: { initial: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const first = useRef(true);

  useEffect(() => {
    // Don't navigate on mount — the URL already says what's shown.
    if (first.current) {
      first.current = false;
      return;
    }
    const timer = setTimeout(() => {
      const q = value.trim();
      startTransition(() => {
        router.replace(
          q ? `${pathname}?q=${encodeURIComponent(q)}` : pathname,
          {
            scroll: false,
          },
        );
      });
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [value, pathname, router]);

  return (
    <form
      role="search"
      action={pathname}
      className="relative"
      aria-busy={isPending}
    >
      <label htmlFor="search-q" className="sr-only">
        Search the store
      </label>
      <Search
        size={20}
        strokeWidth={2.75}
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-6 -translate-y-1/2 text-muted"
      />
      <input
        id="search-q"
        type="search"
        name="q"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search for candles, jewelry, gifts…"
        autoComplete="off"
        // A visitor who opened /search came here to type.
        autoFocus={!initial}
        maxLength={100}
        className={controlClasses("h-15 rounded-pill pr-6 pl-15 text-[17px]")}
      />
    </form>
  );
}
