import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export interface ContactDetailProps {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
}

/** One labelled line of contact info. Render inside a `<dl>`. */
export function ContactDetail({
  icon: Icon,
  label,
  children,
}: ContactDetailProps) {
  return (
    <div className="flex gap-4">
      <Icon
        size={20}
        strokeWidth={2.75}
        aria-hidden
        className="mt-0.5 shrink-0 text-accent-700"
      />
      <div className="space-y-0.5 text-sm">
        <dt className="font-semibold text-text">{label}</dt>
        <dd className="leading-relaxed text-muted">{children}</dd>
      </div>
    </div>
  );
}
