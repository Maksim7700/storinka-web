"use client";

import { useCallback, useRef } from "react";

// Shared "scroll the live preview when a form field gets focus" hook.
//
// The site editor / customizer / edit flow all have the same split-pane layout:
//   <section ref={previewRef}>      ← live <Component content={...} />
//   <aside><ContentForm onFieldFocus={focusPreview} /></aside>
//
// `focusPreview(anchorKey)` finds the matching `[data-section="<anchorKey>"]`
// inside `previewRef.current` and scrolls it into view. It also briefly
// highlights the section so the user can see WHAT moved (the scroll alone is
// easy to miss when the form field is small and the preview is huge).
//
// The highlight class is defined in `globals.css` (`.cs-preview-highlight`)
// so the keyframe animation lives in one place. We add the class, then strip
// it after the animation finishes so re-focusing the same field can re-trigger.

export function usePreviewScroll() {
  const previewRef = useRef<HTMLElement>(null);
  const lastScrolledRef = useRef<string | null>(null);
  const lastHighlightedRef = useRef<HTMLElement | null>(null);

  const focusPreview = useCallback((key: string) => {
    // Don't re-scroll if the user is still typing in the same field — that
    // would yank the preview around on every keystroke.
    if (lastScrolledRef.current === key) return;

    const root = previewRef.current;
    if (!root) return;

    // CSS.escape so weird keys (e.g. with hyphens / brackets) don't break the
    // selector. Browsers without it (very old Safari) silently skip the scroll.
    const selectorKey =
      typeof CSS !== "undefined" && CSS.escape ? CSS.escape(key) : key;
    const el = root.querySelector<HTMLElement>(`[data-section="${selectorKey}"]`);
    if (!el) return;

    lastScrolledRef.current = key;
    el.scrollIntoView({ behavior: "smooth", block: "start" });

    // Strip the highlight from the previously focused section first so two
    // back-to-back focuses still produce two visible pulses.
    if (lastHighlightedRef.current && lastHighlightedRef.current !== el) {
      lastHighlightedRef.current.classList.remove("cs-preview-highlight");
    }

    // Re-trigger the animation: removing the class then re-adding on the next
    // frame restarts it (otherwise the browser caches the keyframe state).
    el.classList.remove("cs-preview-highlight");
    // requestAnimationFrame is available in browsers; SSR not relevant — this
    // hook is "use client" + only called inside event handlers.
    requestAnimationFrame(() => {
      el.classList.add("cs-preview-highlight");
    });
    lastHighlightedRef.current = el;
  }, []);

  return { previewRef, focusPreview };
}
