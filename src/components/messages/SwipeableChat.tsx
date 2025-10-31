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
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchCurrent, setTouchCurrent] = useState<number | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);

  const swipeThreshold = 100;
  const maxSwipeDistance = 300;

  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch.clientX > 50) return;

      setTouchStart(touch.clientX);
      setIsSwiping(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStart === null) return;

      const touch = e.touches[0];
      const diff = touch.clientX - touchStart;

      if (diff > 0) {
        setTouchCurrent(Math.min(diff, maxSwipeDistance));

        if (diff > 10) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = () => {
      if (touchStart === null || touchCurrent === null) {
        setIsSwiping(false);
        setTouchStart(null);
        setTouchCurrent(null);
        return;
      }

      const swipeDistance = touchCurrent;

      if (swipeDistance >= swipeThreshold) {
        onSwipeBack();
      }

      setIsSwiping(false);
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

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, touchStart, touchCurrent, onSwipeBack]);

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
      className="relative h-full w-full"
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

      {children}
    </div>
  );
};
