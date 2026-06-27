"use client";

import { useRef } from "react";

export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onPointerDown = (e: React.PointerEvent) => {
    const element = ref.current;

    if (!element) return;

    // Only left mouse button
    if (e.pointerType === "mouse" && e.button !== 0) {
      return;
    }

    isDragging.current = true;

    startX.current =
      e.clientX - element.getBoundingClientRect().left;

    scrollLeft.current = element.scrollLeft;

    element.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const element = ref.current;

    if (!element || !isDragging.current) return;

    const x =
      e.clientX -
      element.getBoundingClientRect().left;

    const distance =
      (x - startX.current) * 1.2;

    element.scrollLeft =
      scrollLeft.current - distance;
  };

  const stopDragging = (
    e: React.PointerEvent
  ) => {
    const element = ref.current;

    if (!element) return;

    isDragging.current = false;

    try {
      element.releasePointerCapture(
        e.pointerId
      );
    } catch {}
  };

  return {
    ref,
    onPointerDown,
    onPointerMove,
    onPointerUp: stopDragging,
    onPointerLeave: stopDragging,
  };
}