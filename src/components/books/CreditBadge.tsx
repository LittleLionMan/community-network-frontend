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
import { useAvailableRequestSlots } from '@/hooks/useTransactions';

interface CreditBadgeProps {
  user: User;
}

export function CreditBadge({ user }: CreditBadgeProps) {
  const [showInfoModal, setShowInfoModal] = useState(false);
  const { data: availableSlots } = useAvailableRequestSlots();

  const credits =
    availableSlots?.total_credits ?? user.book_credits_remaining ?? 0;
  const creditText = credits === 1 ? 'Credit' : 'Credits';

  return (
    <>
      <button
        onClick={() => setShowInfoModal(true)}
        className="group relative flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2 backdrop-blur-sm transition-all hover:bg-white/30"
      >
        <BookOpen className="h-4 w-4 text-white" />
        <span className="text-sm font-medium text-white">
          {credits} {creditText}
        </span>
        <Info className="h-3 w-3 text-white/70 transition-opacity group-hover:text-white" />

        <div className="pointer-events-none absolute -bottom-16 left-1/2 z-50 hidden w-56 -translate-x-1/2 rounded-lg border border-gray-200 bg-white p-2 text-xs text-gray-700 opacity-0 shadow-lg transition-opacity group-hover:block group-hover:opacity-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
          <p className="font-medium">
            {credits === 0
              ? 'Keine Credits verfügbar'
              : `${credits} ${creditText} verfügbar`}
          </p>
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
                🔄 Wie funktioniert das System?
              </h3>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>• Jeder startet mit 1 Credit</li>
                <li>
                  • Bei erfolgreicher Übergabe erhält die/der Anbietende 1
                  Credit
                </li>
                <li>• Die/Der Transaktionspartner/in gibt 1 Credit ab</li>
                <li>
                  • Credits sammeln sich durch erfolgreiche Transaktionen an
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                💡 Tipp
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Biete eigene Bücher an, um durch erfolgreiche Transaktioen
                Credits zu verdienen. Je mehr du gibst, desto mehr kannst du
                nehmen!
              </p>
            </div>
            <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                Aktueller Stand: {credits} {creditText}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
