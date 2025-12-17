'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, MessageSquare, Edit, Trash2, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOffer } from '@/lib/api';
import { useDeleteOffer } from '@/hooks/useBooks';
import { EditBookModal } from './EditBookModal';
import { DeleteBookModal } from './DeleteBookModal';
import { getBookCoverUrl, CONDITION_LABELS } from '@/lib/book-utils';

interface BookCardProps {
  offer: BookOffer;
  variant: 'marketplace' | 'my-books';
}

export function BookCard({ offer, variant }: BookCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const deleteOffer = useDeleteOffer();

  const coverUrl = getBookCoverUrl(
    offer.custom_cover_image_url || offer.book?.cover_image_url
  );

  const handleDeleteConfirm = async () => {
    try {
      await deleteOffer.mutateAsync(offer.id);
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  if (variant === 'marketplace') {
    return (
      <Link
        href={`/services/buecherecke/book/${offer.book_id}`}
        className="group relative block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="aspect-[2/3] overflow-hidden rounded-lg shadow-md transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={offer.book?.title || 'Buch'}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <BookOpen className="h-16 w-16 text-amber-400" />
            )}
          </div>

          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-100 transition-opacity duration-300 md:opacity-0 ${
              isHovered ? 'md:opacity-100' : ''
            }`}
          >
            <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
              <h3 className="mb-1 line-clamp-2 text-sm font-semibold">
                {offer.book?.title}
              </h3>
              <p className="mb-2 truncate text-xs text-gray-300">
                {offer.book?.authors.join(', ')}
              </p>

              <div className="mb-2 flex items-center gap-2 text-xs">
                {offer.location_district && (
                  <div className="flex items-center gap-1 text-amber-200">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{offer.location_district}</span>
                  </div>
                )}
              </div>
              <Badge variant="secondary" className="bg-amber-600/80 text-white">
                {CONDITION_LABELS[offer.condition]}
              </Badge>
              {offer.distance_km && (
                <div className="flex items-center gap-1 text-gray-200">
                  <MapPin className="h-3 w-3" />
                  <span>{offer.distance_km.toFixed(1)} km</span>
                </div>
              )}
            </div>

            {offer.all_user_comments && offer.all_user_comments.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-amber-200">
                <MessageSquare className="h-3 w-3" />
                <span>{offer.all_user_comments.length} Rezensionen</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <>
      <div
        className="group relative block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="aspect-[2/3] overflow-hidden rounded-lg shadow-md transition-all duration-300">
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={offer.book?.title || 'Buch'}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <BookOpen className="h-16 w-16 text-amber-400" />
            )}
          </div>

          <div className="absolute right-2 top-2">
            <Badge
              variant={
                offer.reserved_until
                  ? 'warning'
                  : !offer.is_available
                    ? 'secondary'
                    : 'success'
              }
              className="px-1.5 py-0.5 text-[10px]"
            >
              {offer.reserved_until
                ? 'Reserv.'
                : !offer.is_available
                  ? 'Abgesch.'
                  : 'Aktiv'}
            </Badge>
          </div>

          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-100 transition-opacity duration-300 md:opacity-0 ${
              isHovered ? 'md:opacity-100' : ''
            }`}
          >
            <div className="absolute bottom-0 left-0 right-0 p-2">
              <h3 className="mb-0.5 line-clamp-1 text-xs font-semibold text-white md:line-clamp-2 md:text-sm">
                {offer.book?.title}
              </h3>
              <p className="mb-3 line-clamp-1 text-[10px] text-gray-300 md:text-xs">
                {offer.book?.authors.join(', ')}
              </p>

              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-white/20 bg-white/10 px-2 py-1 text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsEditModalOpen(true);
                  }}
                >
                  <Edit className="h-3 w-3 md:mr-1" />
                  <span className="hidden md:inline">Edit</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-400/20 bg-red-500/10 px-2 py-1 text-red-300 hover:bg-red-500/20"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsDeleteModalOpen(true);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditBookModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        offer={offer}
        onSuccess={() => setIsEditModalOpen(false)}
      />

      <DeleteBookModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        bookTitle={offer.book?.title}
        isPending={deleteOffer.isPending}
      />
    </>
  );
}
