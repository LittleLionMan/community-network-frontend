'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Quote } from 'lucide-react';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { formatRelative } from '@/lib/forum-utils';
import type { QuotedPostSummary } from '@/types/forum';

interface QuotedPostDisplayProps {
  quotedPost: QuotedPostSummary;
  depth?: number;
}

export function QuotedPostDisplay({
  quotedPost,
  depth = 0,
}: QuotedPostDisplayProps) {
  const [isContentExpanded, setIsContentExpanded] = useState(depth === 0);
  const [areNestedQuotesVisible, setAreNestedQuotesVisible] = useState(false);

  const truncatedContent = quotedPost.content
    .replace(/<[^>]*>/g, '')
    .slice(0, 200);
  const isContentTruncated =
    quotedPost.content.replace(/<[^>]*>/g, '').length > 200;
  const hasNestedQuote = !!quotedPost.quoted_post;

  const borderColor =
    depth === 0
      ? 'border-community-500 bg-community-50'
      : depth === 1
        ? 'border-blue-400 bg-blue-50'
        : depth === 2
          ? 'border-indigo-400 bg-indigo-50'
          : depth === 3
            ? 'border-purple-400 bg-purple-50'
            : 'border-gray-300 bg-gray-50';

  return (
    <div className={`mb-3 rounded-lg border-l-4 ${borderColor} p-3`}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Quote className="h-3 w-3 text-gray-500" />
          <ProfileAvatar user={quotedPost.author} size="sm" />
          <div className="text-xs text-gray-600">
            <span className="font-medium">
              {quotedPost.author.display_name}
            </span>
            <span className="mx-1">·</span>
            <span>{formatRelative(quotedPost.created_at)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasNestedQuote && (
            <button
              onClick={() => setAreNestedQuotesVisible(!areNestedQuotesVisible)}
              className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800"
            >
              {areNestedQuotesVisible ? (
                <>
                  Vorherige ausblenden <ChevronUp className="h-3 w-3" />
                </>
              ) : (
                <>
                  Vorherige anzeigen <ChevronDown className="h-3 w-3" />
                </>
              )}
            </button>
          )}

          {isContentTruncated && (
            <button
              onClick={() => setIsContentExpanded(!isContentExpanded)}
              className="flex items-center gap-1 text-xs text-community-600 hover:text-community-700"
            >
              {isContentExpanded ? (
                <>
                  Weniger <ChevronUp className="h-3 w-3" />
                </>
              ) : (
                <>
                  Mehr <ChevronDown className="h-3 w-3" />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {hasNestedQuote && areNestedQuotesVisible && quotedPost.quoted_post && (
        <QuotedPostDisplay
          quotedPost={quotedPost.quoted_post}
          depth={depth + 1}
        />
      )}

      <div
        className="prose prose-sm max-w-none text-sm text-gray-700"
        dangerouslySetInnerHTML={{
          __html: isContentExpanded
            ? quotedPost.content
            : truncatedContent + (isContentTruncated ? '...' : ''),
        }}
      />
    </div>
  );
}
