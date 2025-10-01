'use client';

import { useState, useEffect } from 'react';
import {
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from '@/components/ui/toast';
import type { FlaggedContent } from '@/types/admin';

interface ContentItemProps {
  content: FlaggedContent;
  onModerate: (
    contentId: number,
    action: 'approve' | 'remove',
    reason?: string
  ) => void;
}

const ContentItem: React.FC<ContentItemProps> = ({ content, onModerate }) => {
  const [showFullContent, setShowFullContent] = useState(false);
  const [moderationReason, setModerationReason] = useState('');
  const [showReasonInput, setShowReasonInput] = useState(false);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'comment':
        return MessageSquare;
      case 'forum_post':
        return MessageSquare;
      case 'message':
        return MessageSquare;
      default:
        return MessageSquare;
    }
  };

  const handleModerate = (action: 'approve' | 'remove') => {
    if (action === 'remove' && !moderationReason.trim()) {
      setShowReasonInput(true);
      return;
    }
    onModerate(content.id, action, moderationReason.trim() || undefined);
    setModerationReason('');
    setShowReasonInput(false);
  };

  const ContentIcon = getContentTypeIcon(content.content_type);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex flex-1 items-start space-x-4">
          <div className="flex-shrink-0">
            <ContentIcon className="h-5 w-5 text-gray-400" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center space-x-2">
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getSeverityColor(content.severity)}`}
              >
                <AlertTriangle className="mr-1 h-3 w-3" />
                {content.severity} Priority
              </span>

              <span className="text-xs text-gray-500">
                {content.content_type.replace('_', ' ')}
              </span>

              <span className="text-xs text-gray-500">
                {new Date(content.flagged_at).toLocaleDateString('de-DE')}
              </span>
            </div>

            <div className="mb-3">
              <p className="text-sm text-gray-900">
                {showFullContent || content.content_text.length <= 200
                  ? content.content_text
                  : `${content.content_text.substring(0, 200)}...`}
              </p>

              {content.content_text.length > 200 && (
                <button
                  onClick={() => setShowFullContent(!showFullContent)}
                  className="mt-1 text-xs text-indigo-600 hover:text-indigo-800"
                >
                  {showFullContent ? 'Weniger anzeigen' : 'Mehr anzeigen'}
                </button>
              )}
            </div>

            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center">
                <User className="mr-1 h-3 w-3" />
                Autor: {content.author.display_name} ({content.author.email})
              </div>
              <div>Gemeldet von: {content.flagged_by.display_name}</div>
            </div>

            <div className="mt-2">
              <span className="text-xs text-gray-600">Grund: </span>
              <span className="text-xs text-gray-900">
                {content.flag_reason}
              </span>
            </div>

            {showReasonInput && (
              <div className="mt-3">
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Grund für Entfernung:
                </label>
                <textarea
                  value={moderationReason}
                  onChange={(e) => setModerationReason(e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="Warum wird dieser Inhalt entfernt?"
                />
              </div>
            )}
          </div>
        </div>

        <div className="ml-4 flex flex-col space-y-2">
          <button
            onClick={() => handleModerate('approve')}
            className="flex items-center rounded-md bg-green-50 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-100"
          >
            <CheckCircle className="mr-1 h-4 w-4" />
            Genehmigen
          </button>

          <button
            onClick={() => handleModerate('remove')}
            className="flex items-center rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Entfernen
          </button>

          {showReasonInput && (
            <div className="flex space-x-1">
              <button
                onClick={() => {
                  setShowReasonInput(false);
                  setModerationReason('');
                }}
                className="flex-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
              >
                Abbrechen
              </button>
              <button
                onClick={() => handleModerate('remove')}
                disabled={!moderationReason.trim()}
                className="flex-1 rounded-md bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700 disabled:opacity-50"
              >
                Bestätigen
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface FilterState {
  status: string;
  severity: string;
}

export function ContentModeration() {
  const [flaggedContent, setFlaggedContent] = useState<FlaggedContent[]>([]);
  const [totalContent, setTotalContent] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [highPriorityCount, setHighPriorityCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    status: 'pending',
    severity: '',
  });

  const fetchFlaggedContent = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await apiClient.admin.getFlaggedContent({
        page,
        size: 20,
        status: filters.status || undefined,
        severity: filters.severity || undefined,
      });

      setFlaggedContent(response.content || []);
      setTotalContent(response.total || 0);
      setPendingCount(response.pending_count || 0);
      setHighPriorityCount(response.high_priority_count || 0);
    } catch (error) {
      console.error('Failed to fetch flagged content:', error);
      toast.error('Fehler beim Laden der gemeldeten Inhalte');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModerate = async (
    contentId: number,
    action: 'approve' | 'remove',
    reason?: string
  ) => {
    try {
      await apiClient.admin.moderateContent(contentId, action, reason);
      toast.success(
        action === 'approve' ? 'Inhalt genehmigt' : 'Inhalt entfernt'
      );
      await fetchFlaggedContent(currentPage);
    } catch (error) {
      toast.error('Fehler bei der Moderation');
      console.log(error);
    }
  };

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters({ ...filters, ...newFilters });
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchFlaggedContent(currentPage);
  }, [currentPage, filters]);

  const totalPages = Math.ceil(totalContent / 20);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Content Moderation
          </h1>
          <p className="text-sm text-gray-600">
            Überprüfe und moderiere gemeldete Community-Inhalte
          </p>
        </div>

        <button
          onClick={() => fetchFlaggedContent(currentPage)}
          disabled={isLoading}
          className="flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          <RefreshCw
            className={`mr-1 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
          />
          Aktualisieren
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-800">
                Pending Review
              </p>
              <p className="text-lg font-bold text-yellow-900">
                {pendingCount}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">High Priority</p>
              <p className="text-lg font-bold text-red-900">
                {highPriorityCount}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center">
            <MessageSquare className="h-5 w-5 text-gray-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-800">Total Reports</p>
              <p className="text-lg font-bold text-gray-900">{totalContent}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-center space-x-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange({ status: e.target.value })}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Alle</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="approved">Approved</option>
              <option value="removed">Removed</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Priorität
            </label>
            <select
              value={filters.severity}
              onChange={(e) => handleFilterChange({ severity: e.target.value })}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Alle</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-indigo-600" />
        </div>
      ) : flaggedContent.length > 0 ? (
        <div className="space-y-4">
          {flaggedContent.map((content) => (
            <ContentItem
              key={content.id}
              content={content}
              onModerate={handleModerate}
            />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Keine gemeldeten Inhalte
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {filters.status === 'pending'
              ? 'Alle gemeldeten Inhalte wurden bearbeitet'
              : 'Keine Inhalte mit den gewählten Filtern gefunden'}
          </p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Zurück
          </button>

          <span className="text-sm text-gray-700">
            Seite {currentPage} von {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Weiter
          </button>
        </div>
      )}
    </div>
  );
}
