import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import type { Message, MessageUser } from '@/types/message';

interface SearchResult {
  message: Message;
  conversation_id: number;
  other_participant: MessageUser;
}

interface MessageSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMessage: (conversationId: number, messageId: number) => void;
}

export const MessageSearch: React.FC<MessageSearchProps> = ({
  isOpen,
  onClose,
  onSelectMessage,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    timeRange: 'all',
    messageType: 'all',
  });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const searchMessages = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        setTimeout(() => {
          const mockResults: SearchResult[] = [
            {
              message: {
                id: 1,
                conversation_id: 1,
                sender: { id: 2, display_name: 'Anna Mueller' },
                content: `Das ist eine Testnachricht mit "${query}" drin.`,
                message_type: 'text',
                created_at: new Date(Date.now() - 86400000).toISOString(),
                is_edited: false,
                is_deleted: false,
                is_read: true,
              },
              conversation_id: 1,
              other_participant: { id: 2, display_name: 'Anna Mueller' },
            },
          ];
          setResults(mockResults);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Search failed:', error);
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(searchMessages, 300);
    return () => clearTimeout(timeoutId);
  }, [query, filters]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-50 pt-20">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
        <div className="border-b p-4">
          <div className="flex items-center space-x-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nachrichten durchsuchen..."
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-3 flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filters.timeRange}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, timeRange: e.target.value }))
                }
                className="rounded border border-gray-300 px-2 py-1 text-sm"
              >
                <option value="all">Alle Zeiten</option>
                <option value="day">Letzter Tag</option>
                <option value="week">Letzte Woche</option>
                <option value="month">Letzter Monat</option>
              </select>
            </div>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600"></div>
              <span className="ml-2 text-gray-600">Suche läuft...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="divide-y">
              {results.map((result) => (
                <button
                  key={`${result.conversation_id}-${result.message.id}`}
                  onClick={() => {
                    onSelectMessage(result.conversation_id, result.message.id);
                    onClose();
                  }}
                  className="w-full p-4 text-left hover:bg-gray-50"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 text-sm font-medium text-white">
                      {result.other_participant.display_name
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">
                          {result.other_participant.display_name}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(
                            new Date(result.message.created_at),
                            {
                              addSuffix: true,
                              locale: de,
                            }
                          )}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                        {result.message.content}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : query.trim() ? (
            <div className="p-8 text-center text-gray-500">
              <Search className="mx-auto mb-2 h-12 w-12 text-gray-300" />
              <p>Keine Nachrichten gefunden für {query}</p>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>Gib einen Suchbegriff ein, um Nachrichten zu durchsuchen</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
