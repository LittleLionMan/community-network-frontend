'use client';

import { useState } from 'react';
import { CheckCircle, RefreshCw, Vote, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVoteOnPoll, useRemoveVote } from '@/hooks/usePolls';
import { useAuthStore } from '@/store/auth';
import { toast } from '@/components/ui/toast';
import type { Poll } from '@/lib/api';

interface VotingInterfaceProps {
  poll: Poll;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'button' | 'inline';
  className?: string;
}

export function VotingInterface({
  poll,
  size = 'default',
  variant = 'button',
  className = '',
}: VotingInterfaceProps) {
  const { isAuthenticated } = useAuthStore();
  const [selectedOption, setSelectedOption] = useState<number | null>(
    poll.user_vote || null
  );

  const voteOnPoll = useVoteOnPoll();
  const removeVote = useRemoveVote();

  const isVoting = voteOnPoll.isPending;
  const isRemoving = removeVote.isPending;
  const isProcessing = isVoting || isRemoving;

  const handleVote = async (optionId: number) => {
    if (!isAuthenticated) {
      toast.error(
        'Anmeldung erforderlich',
        'Du musst angemeldet sein, um abstimmen zu können.'
      );
      return;
    }

    try {
      await voteOnPoll.mutateAsync({ pollId: poll.id, optionId });
      setSelectedOption(optionId);
      toast.success(
        'Stimme abgegeben!',
        'Deine Stimme wurde erfolgreich gespeichert.'
      );
    } catch (error) {
      console.error('Vote error:', error);
      toast.error(
        'Fehler beim Abstimmen',
        'Deine Stimme konnte nicht gespeichert werden. Bitte versuche es erneut.'
      );
    }
  };

  const handleRemoveVote = async () => {
    try {
      await removeVote.mutateAsync(poll.id);
      setSelectedOption(null);
      toast.success('Stimme entfernt', 'Deine Stimme wurde entfernt.');
    } catch (error) {
      console.error('Remove vote error:', error);
      toast.error(
        'Fehler beim Entfernen',
        'Deine Stimme konnte nicht entfernt werden.'
      );
    }
  };

  if (!isAuthenticated) {
    return (
      <Button variant="outline" size={size} disabled className={className}>
        <Vote className="mr-2 h-4 w-4" />
        Anmelden zum Abstimmen
      </Button>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`space-y-3 ${className}`}>
        {poll.options.map((option) => {
          const isSelected = selectedOption === option.id;
          const percentage =
            poll.total_votes > 0
              ? (option.vote_count / poll.total_votes) * 100
              : 0;

          return (
            <div
              key={option.id}
              className={`relative overflow-hidden rounded-lg border transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <button
                onClick={() => handleVote(option.id)}
                disabled={isProcessing}
                className="w-full p-4 text-left transition-colors hover:bg-gray-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {isSelected && (
                        <CheckCircle className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <span className="font-medium text-gray-900">
                      {option.text}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{option.vote_count} Stimmen</span>
                    <span>({percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              </button>

              {poll.total_votes > 0 && (
                <div className="h-1 bg-gray-100">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}

        {selectedOption && (
          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveVote}
              disabled={isProcessing}
              className="flex items-center gap-2"
            >
              {isRemoving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Entfernen...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
                  Stimme entfernen
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Button variant
  if (selectedOption) {
    return (
      <Button
        variant="outline"
        size={size}
        onClick={handleRemoveVote}
        disabled={isProcessing}
        className={`flex items-center gap-2 ${className}`}
      >
        {isRemoving ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="sr-only sm:not-sr-only">Entfernen...</span>
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="sr-only sm:not-sr-only">Abgestimmt</span>
          </>
        )}
      </Button>
    );
  }

  return (
    <Button
      variant="default"
      size={size}
      onClick={() => {
        // For button variant, we need to show options in a modal or redirect to poll page
        window.location.href = `/civic/polls/${poll.id}`;
      }}
      disabled={isProcessing}
      className={`flex items-center gap-2 ${className}`}
    >
      <Vote className="h-4 w-4" />
      <span className="sr-only sm:not-sr-only">Abstimmen</span>
    </Button>
  );
}
