'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Share2, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PollResults } from '@/components/civic/PollResults';
import { usePoll, usePollResults } from '@/hooks/usePolls';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

interface PollResultsPageProps {
  params: Promise<{ id: string }>;
}

export default function PollResultsPage({ params }: PollResultsPageProps) {
  const resolvedParams = use(params);
  const pollId = parseInt(resolvedParams.id);

  const { data: poll } = usePoll(pollId);
  const { data: results, isLoading, error } = usePollResults(pollId, true);

  const handleExport = () => {
    if (!poll || !results) return;

    const data = {
      poll: {
        id: poll.id,
        question: poll.question,
        type: poll.poll_type,
        created_at: poll.created_at,
        ends_at: poll.ends_at,
        total_votes: results.total_votes,
      },
      results: results.options,
      summary: {
        winners: results.winners,
        result_type: results.result_type,
        participation_rate: results.participation_rate,
      },
      exported_at: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `poll-${pollId}-results.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-1/2 rounded bg-gray-200"></div>
          <div className="h-32 rounded bg-gray-200"></div>
        </div>
      </div>
    );
  }

  if (error || !poll || !results) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <BarChart3 className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Ergebnisse nicht verfügbar
          </h3>
          <p className="text-gray-600">
            Die Abstimmungsergebnisse konnten nicht geladen werden.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" asChild className="w-full sm:w-auto">
          <Link
            href={`/civic/polls/${pollId}`}
            className="flex items-center justify-center gap-2 sm:justify-start"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück zur Abstimmung
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="flex-1 sm:flex-none"
          >
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Exportieren</span>
          </Button>
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Share2 className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Teilen</span>
          </Button>
        </div>
      </div>

      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
          Ergebnis
        </h1>
        <h2 className="mb-4 text-lg text-gray-700 dark:text-gray-300 sm:text-xl">
          {poll.question}
        </h2>
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <span className="font-medium">Erstellt am</span>
            <span>
              {format(parseISO(poll.created_at), 'dd.MM.yyyy', { locale: de })}
            </span>
          </div>
          {poll.ends_at && (
            <>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center gap-1.5">
                <span className="font-medium">Beendet am</span>
                <span>
                  {format(parseISO(poll.ends_at), 'dd.MM.yyyy', { locale: de })}
                </span>
              </div>
            </>
          )}
          <span className="hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5">
            <span className="font-medium">Typ</span>
            <span>
              {poll.poll_type === 'admin'
                ? 'Community-Abstimmung'
                : 'Thread-Poll'}
            </span>
          </div>
        </div>
      </div>

      <PollResults results={results} />
    </div>
  );
}
