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
      <div className="mb-8 flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link
            href={`/civic/polls/${pollId}`}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück zur Abstimmung
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Exportieren
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4" />
            Teilen
          </Button>
        </div>
      </div>

      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Abstimmungsergebnisse
        </h1>
        <h2 className="text-xl text-gray-700">{poll.question}</h2>

        <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
          <span>
            Erstellt am{' '}
            {format(parseISO(poll.created_at), 'dd.MM.yyyy', { locale: de })}
          </span>
          {poll.ends_at && (
            <span>
              • Beendet am{' '}
              {format(parseISO(poll.ends_at), 'dd.MM.yyyy', { locale: de })}
            </span>
          )}
          <span>
            •{' '}
            {poll.poll_type === 'admin'
              ? 'Community-Abstimmung'
              : 'Thread-Poll'}
          </span>
        </div>
      </div>

      <PollResults results={results} />
    </div>
  );
}
