"use client";

import { type KeyboardEvent, type ReactNode, useId, useRef } from "react";

import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: ReactNode;
  content: ReactNode;
}

export interface TabsProps {
  tabs: readonly TabItem[];
  value: string;
  onChange: (id: string) => void;
  /** Accessible name of the tab strip. */
  label: string;
  variant?: "underline" | "segmented";
  className?: string;
  panelClassName?: string;
}

const VARIANTS = {
  /** Product page: the design's underlined text tabs. */
  underline: {
    list: "flex gap-8 overflow-x-auto border-b border-border",
    tab: "-mb-px shrink-0 border-b-2 py-4 text-[15px] font-semibold whitespace-nowrap transition-colors",
    active: "border-accent-500 text-text",
    idle: "border-transparent text-muted hover:text-text",
  },
  /** Admin Settings and Account: pill segments on a tinted track. */
  segmented: {
    list: "flex w-full gap-1 overflow-x-auto rounded-pill bg-input p-1 sm:inline-flex sm:w-auto",
    // Equal shares of the track on phones; natural widths from `sm`.
    tab: "h-10 flex-1 rounded-pill px-3 text-sm font-semibold whitespace-nowrap transition-colors sm:flex-none sm:px-5",
    active: "bg-surface text-text shadow-panel",
    idle: "text-muted hover:text-text",
  },
} as const;

/**
 * WAI-ARIA tabs, controlled. Arrow keys move between tabs and activate them
 * (automatic activation, since every panel is already rendered client-side);
 * Home/End jump to the ends. Only the selected tab is in the tab order.
 * The prototypes use `<div onClick>` (README §2 a11y note 5).
 */
export function Tabs({
  tabs,
  value,
  onChange,
  label,
  variant = "underline",
  className,
  panelClassName,
}: TabsProps) {
  const baseId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const styles = VARIANTS[variant];
  const index = Math.max(
    0,
    tabs.findIndex((tab) => tab.id === value),
  );

  function focusTab(next: number) {
    const tab = tabs[(next + tabs.length) % tabs.length];
    if (!tab) return;
    onChange(tab.id);
    listRef.current
      ?.querySelector<HTMLButtonElement>(
        `#${CSS.escape(`${baseId}-tab-${tab.id}`)}`,
      )
      ?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const moves: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowLeft: index - 1,
      Home: 0,
      End: tabs.length - 1,
    };
    const next = moves[event.key];
    if (next === undefined) return;
    event.preventDefault();
    focusTab(next);
  }

  const active = tabs[index];

  return (
    <div className={className}>
      <div
        ref={listRef}
        role="tablist"
        aria-label={label}
        onKeyDown={onKeyDown}
        className={styles.list}
      >
        {tabs.map((tab) => {
          const selected = tab.id === active?.id;
          return (
            <button
              key={tab.id}
              id={`${baseId}-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(tab.id)}
              className={cn(styles.tab, selected ? styles.active : styles.idle)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {active ? (
        <div
          id={`${baseId}-panel-${active.id}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${active.id}`}
          tabIndex={0}
          className={cn("pt-8", panelClassName)}
        >
          {active.content}
        </div>
      ) : null}
    </div>
  );
}
