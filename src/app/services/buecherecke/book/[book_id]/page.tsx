'use client';

import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Globe,
  Tag,
  User,
  MapPin,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMarketplace } from '@/hooks/useBooks';
import { useAuthStore } from '@/store/auth';
import { BookOffer } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const conditionLabels = {
  new: 'Neu',
  like_new: 'Wie neu',
  good: 'Gut',
  acceptable: 'Akzeptabel',
};

const getCoverUrl = (url?: string | null): string | null => {
  if (!url) {
    return null;
  }

  if (url.startsWith('/uploads/')) {
    return `${API_BASE_URL}${url}`;
  }

  return url;
};

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const bookId = Number(params.book_id);

  const { data: offers = [], isLoading } = useMarketplace({
    book_id: bookId,
  });

  const book = offers[0]?.book;

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-amber-600 border-t-transparent"></div>
            <p className="text-gray-600">Lade Buch-Details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück
        </Button>
        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
          <BookOpen className="mx-auto mb-4 h-16 w-16 text-red-400" />
          <h2 className="mb-2 text-xl font-semibold text-red-900">
            Buch nicht gefunden
          </h2>
          <p className="text-red-700">
            Das gesuchte Buch konnte nicht gefunden werden.
          </p>
        </div>
      </div>
    );
  }

  const coverUrl = getCoverUrl(book.cover_image_url);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zur Übersicht
      </Button>

      {/* Book Header */}
      <div className="mb-8 grid gap-8 md:grid-cols-[300px_1fr]">
        {/* Cover */}
        <div className="flex items-center justify-center md:justify-start">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={book.title}
              className="h-auto max-h-[450px] w-auto max-w-[300px] rounded-lg object-contain shadow-xl"
            />
          ) : (
            <div className="flex h-[450px] w-full max-w-[300px] items-center justify-center rounded-lg bg-gradient-to-br from-amber-100 to-amber-200 shadow-xl">
              <BookOpen className="h-24 w-24 text-amber-400" />
            </div>
          )}
        </div>

        {/* Book Info */}
        <div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
            {book.title}
          </h1>
          <p className="mb-4 text-xl text-gray-600 dark:text-gray-400">
            {book.authors.join(', ')}
          </p>

          <div className="mb-6 space-y-2 text-sm text-gray-600 dark:text-gray-400">
            {book.isbn_13 && (
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <span>ISBN-13: {book.isbn_13}</span>
              </div>
            )}
            {book.publisher && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Verlag: {book.publisher}</span>
              </div>
            )}
            {book.published_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Erschienen: {book.published_date}</span>
              </div>
            )}
            {book.page_count && book.page_count > 0 && (
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>{book.page_count} Seiten</span>
              </div>
            )}
            {book.language && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>Sprache: {book.language.toUpperCase()}</span>
              </div>
            )}
          </div>

          {book.categories && book.categories.length > 0 && (
            <div className="mb-6">
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Kategorien:
              </p>
              <div className="flex flex-wrap gap-2">
                {book.categories.map((category, idx) => (
                  <Badge key={idx} variant="secondary">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {book.description && (
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Beschreibung:
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {book.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Available Offers */}
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Verfügbare Angebote ({offers.length})
        </h2>

        {offers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400">
                Aktuell keine Angebote für dieses Buch verfügbar.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {offers.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                currentUserId={user?.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* All Reviews */}
      {offers.some(
        (o) => o.all_user_comments && o.all_user_comments.length > 0
      ) && (
        <div>
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
            Rezensionen ({offers[0].all_user_comments?.length || 0})
          </h2>
          <div className="space-y-4">
            {offers[0].all_user_comments?.map((comment, idx) => (
              <Card key={idx}>
                <CardContent className="pt-6">
                  <div className="mb-2 flex items-center gap-3">
                    {comment.user.profile_image_url ? (
                      <img
                        src={comment.user.profile_image_url}
                        alt={comment.user.display_name}
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                        <User className="h-5 w-5 text-amber-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {comment.user.display_name}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Badge variant="secondary" className="text-xs">
                          {comment.condition_label}
                        </Badge>
                        <span>•</span>
                        <span>
                          {new Date(comment.created_at).toLocaleDateString(
                            'de-DE'
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {comment.comment}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OfferCard({
  offer,
  currentUserId,
}: {
  offer: BookOffer;
  currentUserId?: number;
}) {
  const isOwnOffer = currentUserId === offer.owner_id;

  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {offer.owner?.profile_image_url ? (
              <img
                src={offer.owner.profile_image_url}
                alt={offer.owner.display_name}
                className="h-12 w-12 rounded-full"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <User className="h-6 w-6 text-amber-600" />
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {offer.owner?.display_name}
              </p>
              <Badge
                variant="secondary"
                className="mt-1 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
              >
                {conditionLabels[offer.condition]}
              </Badge>
            </div>
          </div>
          {isOwnOffer && (
            <Badge variant="outline" className="border-blue-300 text-blue-700">
              Dein Angebot
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 space-y-2 text-sm">
          {offer.location_district && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <MapPin className="h-4 w-4" />
              <span>{offer.location_district}</span>
            </div>
          )}
          {offer.distance_km !== null && offer.distance_km !== undefined && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <MapPin className="h-4 w-4" />
              <span>{offer.distance_km.toFixed(1)} km entfernt</span>
            </div>
          )}
        </div>

        {offer.user_comment && (
          <div className="mb-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
            <div className="mb-1 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <MessageSquare className="h-4 w-4" />
              <span>Kommentar:</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {offer.user_comment}
            </p>
          </div>
        )}

        {!isOwnOffer && (
          <Button className="w-full bg-amber-600 hover:bg-amber-700">
            Anfrage senden
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
