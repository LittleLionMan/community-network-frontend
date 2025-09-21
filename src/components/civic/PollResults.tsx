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

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-gray-50 p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            Gesamtstimmen
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {results.total_votes}
          </div>
        </div>

        <div className="rounded-lg bg-gray-50 p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <TrendingUp className="h-4 w-4" />
            Beteiligung
          </div>
          <div
            className={`text-lg font-semibold ${getParticipationColor(results.participation_rate)}`}
          >
            {getParticipationText(results.participation_rate)}
          </div>
        </div>

        <div className="rounded-lg bg-gray-50 p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            {getResultIcon(results.result_type)}
            Ergebnis
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {getResultText(results.result_type)}
          </div>
        </div>
      </div>

      {results.winners.length > 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-900">
              {results.winners.length === 1
                ? 'Gewinner'
                : 'Gewinner (Unentschieden)'}
            </h3>
          </div>
          <div className="space-y-2">
            {results.winners.map((winner) => (
              <div
                key={winner.option_id}
                className="font-medium text-yellow-800"
              >
                • {winner.text}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Detaillierte Ergebnisse</h3>

        {results.options.map((option) => {
          const isWinner = results.winners.some(
            (w) => w.option_id === option.option_id
          );

          return (
            <div
              key={option.option_id}
              className={`relative overflow-hidden rounded-lg border p-4 ${
                isWinner
                  ? 'border-yellow-300 bg-yellow-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">
                    {option.text}
                  </span>
                  {isWinner && <Award className="h-4 w-4 text-yellow-500" />}
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    {option.votes} Stimmen
                  </div>
                  <div className="text-sm text-gray-600">
                    {option.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`h-full transition-all duration-500 ${
                    isWinner ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${option.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {results.total_votes === 0 && (
        <div className="py-8 text-center text-gray-500">
          <BarChart3 className="mx-auto mb-3 h-12 w-12" />
          <p>Noch keine Stimmen abgegeben</p>
        </div>
      )}
    </div>
  );
}
