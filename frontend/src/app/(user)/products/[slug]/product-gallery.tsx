"use client";

import { useState } from "react";

import { WashedImage } from "@/components/ui/washed-image";
import type { ProductImage } from "@/lib/catalog";
import { cn } from "@/lib/utils";

/** The design always shows four frames; empty ones stay as visible placeholders. */
const FRAMES = 4;

/**
 * Main 4:5 image plus thumbnails. Thumbnails are real buttons with
 * `aria-pressed`, not the prototype's `<div onClick>`.
 */
export function ProductGallery({
  name,
  images,
}: {
  name: string;
  images: ProductImage[];
}) {
  const frames = Array.from(
    { length: Math.max(FRAMES, images.length) },
    (_, i) => images[i] ?? { url: "", alt: `${name} — view ${i + 1}` },
  );
  const [active, setActive] = useState(0);
  const current = frames[active]!;

  return (
    <div className="flex flex-col gap-4">
      <WashedImage
        src={current.url || null}
        alt={current.alt}
        priority
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="aspect-4/5 rounded-panel shadow-tile"
      />
      <div className="grid grid-cols-4 gap-3">
        {frames.map((frame, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Show image ${index + 1} of ${frames.length}`}
            aria-pressed={index === active}
            onClick={() => setActive(index)}
            className={cn(
              "overflow-hidden rounded-thumb outline-2 outline-offset-2 transition-[outline-color]",
              index === active ? "outline-accent-500" : "outline-transparent",
            )}
          >
            <WashedImage
              src={frame.url || null}
              alt=""
              sizes="12vw"
              className="pointer-events-none aspect-square"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
