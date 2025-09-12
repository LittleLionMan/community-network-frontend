'use client';

import {
  CheckCircle,
  XCircle,
  RefreshCw,
  Users,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  useJoinEvent,
  useLeaveEvent,
  useParticipationStatus,
} from '@/hooks/useEvents';
import { useAuthStore } from '@/store/auth';
import { toast } from '@/components/ui/toast';
import { isPast, parseISO } from 'date-fns';

interface JoinButtonProps {
  eventId: number;
  eventTitle: string;
  startDateTime: string;
  isFull?: boolean;
  isCreator?: boolean;
  maxParticipants?: number;
  currentParticipants: number;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

export function JoinButton({
  eventId,
  eventTitle,
  startDateTime,
  isFull = false,
  isCreator = false,
  className = '',
  size = 'default',
}: JoinButtonProps) {
  const { user, isAuthenticated } = useAuthStore();

  const joinMutation = useJoinEvent();
  const leaveMutation = useLeaveEvent();
  const { isParticipating, isLoading: participationLoading } =
    useParticipationStatus(eventId, user?.id || null);

  const isPastEvent = isPast(parseISO(startDateTime));
  const isJoining = joinMutation.isPending;
  const isLeaving = leaveMutation.isPending;
  const isProcessing = isJoining || isLeaving;

  const handleJoin = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated || !user) {
      toast.error(
        'Anmeldung erforderlich',
        'Du musst angemeldet sein, um Events beizutreten.'
      );
      return;
    }

    try {
      await joinMutation.mutateAsync(eventId);
      toast.success(
        'Erfolgreich angemeldet!',
        `Du nimmst jetzt an "${eventTitle}" teil.`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unbekannter Fehler';
      toast.error('Fehler beim Beitreten', errorMessage);
    }
  };

  const handleLeave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await leaveMutation.mutateAsync(eventId);
      toast.success(
        'Abgemeldet',
        `Du nimmst nicht mehr an "${eventTitle}" teil.`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unbekannter Fehler';
      toast.error('Fehler beim Abmelden', errorMessage);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (participationLoading) {
    return (
      <Button variant="outline" disabled size={size} className={className}>
        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
        <span className="sr-only sm:not-sr-only">Prüfen...</span>
      </Button>
    );
  }

  if (isCreator) {
    return (
      <div
        className={`flex items-center gap-2 text-sm text-gray-600 ${className}`}
      >
        <UserCheck className="h-4 w-4" />
        <span className="sr-only sm:not-sr-only">Dein Event</span>
      </div>
    );
  }

  if (isPastEvent) {
    return (
      <Button variant="outline" disabled size={size} className={className}>
        <XCircle className="mr-2 h-4 w-4" />
        <span className="sr-only sm:not-sr-only">Beendet</span>
      </Button>
    );
  }

  if (isParticipating) {
    return (
      <Button
        variant="outline"
        onClick={handleLeave}
        disabled={isProcessing}
        size={size}
        className={`hover:border-red-300 hover:bg-red-50 hover:text-red-700 ${className}`}
      >
        {isLeaving ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            <span className="sr-only sm:not-sr-only">Abmelden...</span>
          </>
        ) : (
          <>
            <XCircle className="mr-2 h-4 w-4" />
            <span className="sr-only sm:not-sr-only">Abmelden</span>
          </>
        )}
      </Button>
    );
  }

  if (isFull) {
    return (
      <Button variant="outline" disabled size={size} className={className}>
        <Users className="mr-2 h-4 w-4" />
        <span className="sr-only sm:not-sr-only">Ausgebucht</span>
      </Button>
    );
  }

  return (
    <Button
      onClick={handleJoin}
      disabled={isProcessing}
      size={size}
      className={className}
    >
      {isJoining ? (
        <>
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          <span className="sr-only sm:not-sr-only">Anmelden...</span>
        </>
      ) : (
        <>
          <CheckCircle className="mr-2 h-4 w-4" />
          <span className="sr-only sm:not-sr-only">Teilnehmen</span>
        </>
      )}
    </Button>
  );
}
