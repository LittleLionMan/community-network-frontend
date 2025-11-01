'use client';

import { useRef, useState, useEffect } from 'react';

interface SwipeableChatProps {
  onSwipeBack: () => void;
  children: React.ReactNode;
  enabled?: boolean;
}

export const SwipeableChat: React.FC<SwipeableChatProps> = ({
  onSwipeBack,
  children,
  enabled = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [touchCurrent, setTouchCurrent] = useState<number | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const [isVerticalScroll, setIsVerticalScroll] = useState(false);

  const swipeThreshold = 100;
  const maxSwipeDistance = 300;

  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch.clientX > 50) return;

      setTouchStart({ x: touch.clientX, y: touch.clientY });
      setIsVerticalScroll(false);
      setIsSwiping(false);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStart === null) return;

      const touch = e.touches[0];
      const diffX = touch.clientX - touchStart.x;
      const diffY = touch.clientY - touchStart.y;

      if (!isSwiping && !isVerticalScroll) {
        if (Math.abs(diffY) > Math.abs(diffX)) {
          setIsVerticalScroll(true);
          return;
        }
        if (Math.abs(diffX) > 10 && diffX > 0) {
          setIsSwiping(true);
        }
      }

      if (isVerticalScroll) {
        return;
      }

      if (isSwiping && diffX > 0) {
        setTouchCurrent(Math.min(diffX, maxSwipeDistance));

        if (diffX > 10) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = () => {
      if (touchStart === null) {
        reset();
        return;
      }

      if (
        isSwiping &&
        touchCurrent !== null &&
        touchCurrent >= swipeThreshold
      ) {
        onSwipeBack();
      }

      reset();
    };

    const reset = () => {
      setIsSwiping(false);
      setIsVerticalScroll(false);
      setTouchStart(null);
      setTouchCurrent(null);
    };

    container.addEventListener('touchstart', handleTouchStart, {
      passive: true,
    });
    container.addEventListener('touchmove', handleTouchMove, {
      passive: false,
    });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('touchcancel', reset);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', reset);
    };
  }, [
    enabled,
    touchStart,
    touchCurrent,
    isSwiping,
    isVerticalScroll,
    onSwipeBack,
  ]);

  const transform =
    isSwiping && touchCurrent !== null
      ? `translateX(${touchCurrent}px)`
      : 'translateX(0)';

  const opacity =
    isSwiping && touchCurrent !== null
      ? Math.max(1 - touchCurrent / maxSwipeDistance, 0.5)
      : 1;

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden"
      style={{
        transform,
        opacity,
        transition: isSwiping
          ? 'none'
          : 'transform 0.3s ease-out, opacity 0.3s ease-out',
      }}
    >
      {isSwiping && touchCurrent !== null && touchCurrent > 20 && (
        <div
          className="pointer-events-none absolute left-4 top-1/2 z-50 -translate-y-1/2"
          style={{
            opacity: Math.min(touchCurrent / swipeThreshold, 1),
          }}
        >
          <div className="rounded-full bg-indigo-600 p-3 shadow-lg">
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </div>
        </div>
      )}

      <div className="h-full w-full">{children}</div>
    </div>
  );
};
