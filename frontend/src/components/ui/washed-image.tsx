import Image from "next/image";

import { cn } from "@/lib/utils";

export interface WashedImageProps {
  src?: string | null;
  alt: string;
  scrim?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function WashedImage({
  src,
  alt,
  scrim = false,
  sizes = "100vw",
  priority = false,
  className,
  children,
}: WashedImageProps) {
  return (
    <div className={cn("relative overflow-hidden bg-input", className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover washed"
        />
      ) : (
        <div
          role="img"
          aria-label={alt}
          className="absolute inset-0 bg-[repeating-linear-gradient(135deg,var(--color-accent-200)_0_14px,var(--color-input)_14px_28px)] opacity-70"
        />
      )}

      {scrim ? <div className="absolute inset-0 scrim" /> : null}
      {children ? <div className="relative h-full">{children}</div> : null}
    </div>
  );
}
