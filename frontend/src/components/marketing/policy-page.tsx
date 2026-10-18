import type { ReactNode } from "react";
import { TriangleAlert } from "lucide-react";

export interface PolicySection {
  title: string;
  body: ReactNode;
}

export interface PolicyPageProps {
  kicker: string;
  title: string;
  updated?: string;
  intro?: ReactNode;
  sections: readonly PolicySection[];
  /**
   * README §7: Terms and Privacy must not launch with placeholder text. The
   * banner keeps that visible until legal has signed the copy off.
   */
  draft?: boolean;
  children?: ReactNode;
}

/** Long-form text pages — Shipping & Returns, Privacy, Terms. */
export function PolicyPage({
  kicker,
  title,
  updated,
  intro,
  sections,
  draft = false,
  children,
}: PolicyPageProps) {
  return (
    <article className="shell max-w-3xl pt-10 pb-section-y-sm lg:pt-14 lg:pb-section-y-lg">
      <p className="mb-3 kicker text-accent-700">{kicker}</p>
      <h1 className="font-display text-[34px] leading-tight sm:text-title">
        {title}
      </h1>
      {updated ? (
        <p className="mt-3 text-sm text-muted">Last updated {updated}</p>
      ) : null}

      {draft ? (
        <p
          role="note"
          className="mt-8 flex gap-3 rounded-card border border-accent-300 bg-accent-100 px-5 py-4 text-sm text-accent-900"
        >
          <TriangleAlert
            size={18}
            strokeWidth={2.5}
            aria-hidden
            className="mt-0.5 shrink-0"
          />
          Draft copy from the design, pending legal review. Not yet binding.
        </p>
      ) : null}

      {intro ? (
        <div className="mt-8 text-[17px] leading-relaxed text-text-secondary">
          {intro}
        </div>
      ) : null}

      <div className="mt-10 space-y-10">
        {sections.map((section) => (
          <section key={section.title} className="space-y-3">
            <h2 className="font-display text-[22px] leading-snug">
              {section.title}
            </h2>
            <div className="space-y-3 text-[16px] leading-relaxed text-text-secondary [&_a]:font-semibold [&_a]:text-accent-700 [&_a:hover]:text-accent-800">
              {section.body}
            </div>
          </section>
        ))}
      </div>

      {children}
    </article>
  );
}
