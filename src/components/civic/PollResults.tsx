'use client';

import { BarChart3, TrendingUp, Users, Award } from 'lucide-react';
import type { PollResults } from '@/lib/api';

interface PollResultsProps {
  results: PollResults;
  className?: string;
}

export function PollResults({ results, className = '' }: PollResultsProps) {
  const getParticipationColor = (rate: string) => {
    switch (rate) {
      case 'high':
        return 'text-green-600';
      case 'moderate':
        return 'text-yellow-600';
      case 'low':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const getParticipationText = (rate: string) => {
    switch (rate) {
      case 'high':
        return 'Hohe Beteiligung';
      case 'moderate':
        return 'Mittlere Beteiligung';
      case 'low':
        return 'Niedrige Beteiligung';
      default:
        return 'Keine Beteiligung';
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'clear_winner':
        return <Award className="h-5 w-5 text-yellow-500" />;
      case 'tie':
        return <BarChart3 className="h-5 w-5 text-blue-500" />;
      default:
        return <TrendingUp className="h-5 w-5 text-gray-500" />;
    }
  };

  const getResultText = (type: string) => {
    switch (type) {
      case 'clear_winner':
        return 'Klarer Sieger';
      case 'tie':
        return 'Unentschieden';
      case 'no_votes':
        return 'Keine Stimmen';
      default:
        return 'Unklares Ergebnis';
    }
  };

  const getVoteText = (count: number) => {
    return count === 1 ? '1 Stimme' : `${count} Stimmen`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-800">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Users className="h-4 w-4" />
            Gesamtstimmen
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {results.total_votes}
          </div>
        </div>

        <div className="rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-800">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <TrendingUp className="h-4 w-4" />
            Beteiligung
          </div>
          <div
            className={`text-lg font-semibold ${getParticipationColor(results.participation_rate)}`}
          >
            {getParticipationText(results.participation_rate)}
          </div>
        </div>

        <div className="rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-800">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            {getResultIcon(results.result_type)}
            Ergebnis
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {getResultText(results.result_type)}
          </div>
        </div>
      </div>

      {results.winners.length > 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950">
          <div className="mb-3 flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
            <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
              {results.winners.length === 1
                ? 'Gewinner'
                : 'Gewinner (Unentschieden)'}
            </h3>
          </div>
          <div className="space-y-2">
            {results.winners.map((winner) => (
              <div
                key={winner.option_id}
                className="font-medium text-yellow-900 dark:text-yellow-100"
              >
                • {winner.text}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          Detaillierte Ergebnisse
        </h3>

        {results.options.map((option) => {
          const isWinner = results.winners.some(
            (w) => w.option_id === option.option_id
          );

          return (
            <div
              key={option.option_id}
              className={`relative overflow-hidden rounded-lg border p-4 ${
                isWinner
                  ? 'border-yellow-300 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950'
                  : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
              }`}
            >
              <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`break-words font-medium ${
                      isWinner
                        ? 'text-yellow-900 dark:text-yellow-100'
                        : 'text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    {option.text}
                  </span>
                  {isWinner && (
                    <Award className="h-4 w-4 flex-shrink-0 text-yellow-500" />
                  )}
                </div>
                <div className="flex items-center gap-3 text-right">
                  <div
                    className={`font-semibold ${
                      isWinner
                        ? 'text-yellow-900 dark:text-yellow-100'
                        : 'text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    {getVoteText(option.votes)}
                  </div>
                  <div
                    className={`text-sm ${
                      isWinner
                        ? 'text-yellow-700 dark:text-yellow-300'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {option.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>

              <div
                className={`h-2 overflow-hidden rounded-full ${
                  isWinner
                    ? 'bg-yellow-200 dark:bg-yellow-900'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <div
                  className={`h-full transition-all duration-500 ${
                    isWinner
                      ? 'bg-yellow-500 dark:bg-yellow-600'
                      : 'bg-blue-500 dark:bg-blue-600'
                  }`}
                  style={{ width: `${option.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {results.total_votes === 0 && (
        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
          <BarChart3 className="mx-auto mb-3 h-12 w-12" />
          <p>Noch keine Stimmen abgegeben</p>
        </div>
      )}
    </div>
  );
}
