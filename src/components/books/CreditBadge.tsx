'use client';

import { useState } from 'react';
import { BookOpen, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { User } from '@/types';

interface CreditBadgeProps {
  user: User;
}

export function CreditBadge({}: CreditBadgeProps) {
  const [showInfoModal, setShowInfoModal] = useState(false);

  const getNextResetDate = () => {
    const lastReset = new Date('2025-01-01');
    const nextReset = new Date(lastReset);
    nextReset.setMonth(nextReset.getMonth() + 1);

    return nextReset.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <>
      <button
        onClick={() => setShowInfoModal(true)}
        className="group relative flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2 backdrop-blur-sm transition-all hover:bg-white/30"
      >
        <BookOpen className="h-4 w-4 text-white" />
        <span className="text-sm font-medium text-white">1/1 Credits</span>
        <Info className="h-3 w-3 text-white/70 transition-opacity group-hover:text-white" />

        <div className="pointer-events-none absolute -bottom-16 left-1/2 z-50 hidden w-48 -translate-x-1/2 rounded-lg border border-gray-200 bg-white p-2 text-xs text-gray-700 opacity-0 shadow-lg transition-opacity group-hover:block group-hover:opacity-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
          <p className="mb-1 font-medium">Nächste Aufladung:</p>
          <p>{getNextResetDate()}</p>
        </div>
      </button>

      <Dialog open={showInfoModal} onOpenChange={setShowInfoModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-amber-600" />
              Credit-System
            </DialogTitle>
            <DialogDescription>
              So funktioniert das Bücherbörse Credit-System
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                📚 Was sind Credits?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Credits erlauben dir, Bücher anzubieten. Ein Credit = Ein
                aktives Angebot.
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                🔄 Wie bekomme ich Credits?
              </h3>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>• Jeden Monat: Automatisch 1 Credit</li>
                <li>• Angebot abgeschlossen: Credit wird wieder frei</li>
                <li>• Angebot gelöscht: Credit wird wieder frei</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                ⏰ Nächste Aufladung
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {getNextResetDate()}
              </p>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                💡 <strong>Tipp:</strong> Wenn du mehrere Bücher gleichzeitig
                anbieten möchtest, schließe ein Angebot ab, um ein Credit
                freizumachen.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
