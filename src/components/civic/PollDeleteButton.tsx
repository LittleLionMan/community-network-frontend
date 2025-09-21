// src/components/civic/PollDeleteButton.tsx
'use client';

import { useState } from 'react';
import { Trash2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDeletePoll } from '@/hooks/usePolls';
import { useAuthStore } from '@/store/auth';
import { toast } from '@/components/ui/toast';

interface PollDeleteButtonProps {
  poll: {
    id: number;
    question: string;
    creator: {
      id: number;
    };
    total_votes: number;
    poll_type: 'admin' | 'thread';
  };
  onSuccess?: () => void;
  variant?: 'button' | 'danger';
  size?: 'sm' | 'default' | 'lg';
}

export function PollDeleteButton({
  poll,
  onSuccess,
  size = 'default',
}: PollDeleteButtonProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const { user } = useAuthStore();
  const deletePollMutation = useDeletePoll();

  const isCreator = user?.id === poll.creator.id;
  const canDelete = isCreator || user?.is_admin;
  const isDeleting = deletePollMutation.isPending;
  const hasVotes = poll.total_votes > 0;

  const handleDeleteClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    if (confirmText !== poll.question) {
      toast.error(
        'Bestätigung fehlgeschlagen',
        'Die Frage stimmt nicht überein.'
      );
      return;
    }

    try {
      await deletePollMutation.mutateAsync(poll.id);

      toast.success(
        'Abstimmung gelöscht',
        `"${poll.question}" wurde erfolgreich gelöscht.`
      );

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Delete poll error:', error);

      if (error instanceof Error) {
        if (error.message.includes('403')) {
          toast.error(
            'Nicht berechtigt',
            'Du bist nicht berechtigt, diese Abstimmung zu löschen.'
          );
        } else if (error.message.includes('404')) {
          toast.error(
            'Abstimmung nicht gefunden',
            'Die Abstimmung existiert nicht mehr.'
          );
        } else {
          toast.error(
            'Fehler beim Löschen',
            'Die Abstimmung konnte nicht gelöscht werden. Bitte versuche es später erneut.'
          );
        }
      } else {
        toast.error(
          'Fehler beim Löschen',
          'Ein unbekannter Fehler ist aufgetreten.'
        );
      }
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setConfirmText('');
  };

  if (!canDelete) {
    return null;
  }

  if (!showConfirmation) {
    return (
      <Button
        variant="outline"
        size={size}
        onClick={handleDeleteClick}
        disabled={isDeleting}
        className="flex items-center gap-2"
      >
        <Trash2 className="h-4 w-4" />
        Abstimmung löschen
      </Button>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-red-300 bg-red-50 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
        <div className="flex-1">
          <h4 className="font-medium text-red-900">
            Abstimmung wirklich löschen?
          </h4>
          <p className="mt-1 text-sm text-red-700">
            Diese Aktion kann nicht rückgängig gemacht werden. Die Abstimmung
            wird unwiderruflich gelöscht.
          </p>

          {hasVotes && (
            <div className="mt-3 rounded-md bg-red-100 p-3">
              <p className="text-sm font-medium text-red-800">
                ⚠️ Achtung: {poll.total_votes}{' '}
                {poll.total_votes === 1 ? 'Stimme wurde' : 'Stimmen wurden'}{' '}
                bereits abgegeben!
              </p>
              <p className="mt-1 text-xs text-red-700">
                Alle Abstimmungsergebnisse gehen verloren.
              </p>
            </div>
          )}

          {poll.poll_type === 'admin' && (
            <div className="mt-3 rounded-md bg-red-100 p-3">
              <p className="text-sm font-medium text-red-800">
                🏛️ Admin-Community-Abstimmung
              </p>
              <p className="mt-1 text-xs text-red-700">
                Das Löschen einer Admin-Abstimmung kann Auswirkungen auf
                wichtige Community-Entscheidungen haben.
              </p>
            </div>
          )}

          <div className="mt-4">
            <label className="block text-sm font-medium text-red-900">
              Gib die Frage zur Bestätigung ein:
            </label>
            <p className="mb-2 break-words font-mono text-sm text-red-800">
              {poll.question}
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Frage eingeben..."
              className="w-full rounded-md border border-red-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              disabled={isDeleting}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          disabled={isDeleting}
        >
          Abbrechen
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleConfirmDelete}
          disabled={isDeleting || confirmText !== poll.question}
          className="flex items-center gap-2 border-red-300 bg-red-600 text-white hover:border-red-400 hover:bg-red-700 disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-500"
        >
          {isDeleting ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Löschen...
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4" />
              Endgültig löschen
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
