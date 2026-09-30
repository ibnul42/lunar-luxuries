"use client";

import { useEffect, useId, useRef, useState } from "react";

/**
 * A click/keyboard disclosure: Escape closes it and puts focus back on the
 * trigger, a press anywhere outside dismisses it.
 *
 * README §2 a11y note 2 — the design opens these menus on `mouseenter` only,
 * which cannot be reached by touch or keyboard. Every dropdown in the header
 * shares this so that fix cannot regress in one of them.
 *
 * Wire the returned refs and `panelId` up as:
 *   <div ref={wrapperRef}>
 *     <button ref={triggerRef} aria-expanded={open} aria-controls={panelId} />
 *     <Card id={panelId} hidden={!open} />
 */
export function useDisclosure() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    function onPointerDown(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return { open, setOpen, panelId, wrapperRef, triggerRef };
}
