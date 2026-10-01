import type { ReactNode } from "react";

import { WashedImage } from "@/components/ui/washed-image";
import { cn } from "@/lib/utils";

export interface MediaSplitProps {
  image: {
    alt: string;
    src?: string | null;
    /** Aspect ratio per breakpoint, e.g. `aspect-4/3 lg:aspect-square`. */
    className?: string;
  };
  /** Puts the image on the left from `lg` up. Phones always read text first. */
  mediaFirst?: boolean;
  priority?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Copy beside a washed photograph — two columns from `lg`, stacked below it.
 * The copy stays first in the DOM, so reading order never depends on layout.
 */
export function MediaSplit({
  image,
  mediaFirst = false,
  priority = false,
  children,
  className,
}: MediaSplitProps) {
  return (
    <div
      className={cn(
        "grid items-center gap-10 lg:grid-cols-2 lg:gap-16",
        className,
      )}
    >
      <div>{children}</div>
      <WashedImage
        alt={image.alt}
        src={image.src}
        priority={priority}
        sizes="(min-width: 1024px) 50vw, 100vw"
        className={cn(
          "rounded-panel shadow-card",
          mediaFirst && "lg:order-first",
          image.className,
        )}
      />
    </div>
  );
}
