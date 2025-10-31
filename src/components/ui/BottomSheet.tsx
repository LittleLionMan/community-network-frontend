'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  snapPoints?: number[];
  defaultSnap?: number;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  snapPoints = [0.9],
  defaultSnap = 0,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [snapIndex, setSnapIndex] = useState(defaultSnap);
  const sheetRef = useRef<HTMLDivElement>(null);

  const snapHeight = snapPoints[snapIndex] * window.innerHeight;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    const dragDistance = currentY - startY;
    const threshold = 100;

    if (dragDistance > threshold) {
      onClose();
    } else if (dragDistance < -threshold && snapIndex < snapPoints.length - 1) {
      setSnapIndex(snapIndex + 1);
    } else if (dragDistance > threshold / 2 && snapIndex > 0) {
      setSnapIndex(snapIndex - 1);
    }

    setIsDragging(false);
    setStartY(0);
    setCurrentY(0);
  };

  if (!isOpen) return null;

  const dragOffset = isDragging ? Math.max(0, currentY - startY) : 0;
  const transform = `translateY(${dragOffset}px)`;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black transition-opacity md:hidden"
        style={{
          opacity: isOpen ? 0.5 : 0,
        }}
        onClick={onClose}
      />

      <div
        ref={sheetRef}
        className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl bg-white shadow-2xl md:hidden"
        style={{
          height: `${snapHeight}px`,
          transform,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex flex-col items-center py-3">
          <div className="h-1.5 w-12 rounded-full bg-gray-300" />
        </div>

        {title && (
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
      </div>
    </>
  );
};
