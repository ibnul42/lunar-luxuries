import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TONES = {
  accent: "text-accent-700",
  sage: "text-sage-700",
} as const;

export interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  tone?: keyof typeof TONES;
  children: ReactNode;
  className?: string;
}

/** Icon, title and a short paragraph — values, perks, guarantees. */
export function FeatureCard({
  icon: Icon,
  title,
  tone = "accent",
  children,
  className,
}: FeatureCardProps) {
  return (
    <Card className={cn("h-full", className)}>
      <CardBody className="space-y-3 p-8 lg:p-9">
        <Icon
          size={26}
          strokeWidth={2.75}
          aria-hidden
          className={cn("mb-2", TONES[tone])}
        />
        <CardTitle>{title}</CardTitle>
        <p className="text-sm leading-relaxed text-muted">{children}</p>
      </CardBody>
    </Card>
  );
}
