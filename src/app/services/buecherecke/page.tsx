'use client';

import { useState } from 'react';
import { BookOpen, Plus, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { BookCard } from '@/components/books/BookCard';
import { BookFilters } from '@/components/books/BookFilters';
import { AddBookModal } from '@/components/books/AddBookModal';
import { CreditBadge } from '@/components/books/CreditBadge';
import { useMarketplace, useMyOffers, useBookStats } from '@/hooks/useBooks';
import { useAuthStore } from '@/store/auth';

export default function BuechereckePage() {
  const { isAuthenticated, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'marketplace' | 'my-books'>(
    'marketplace'
  );
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: undefined as string | undefined,
    condition: [] as string[],
    language: undefined as string | undefined,
    category: undefined as string | undefined,
    max_distance_km: undefined as number | undefined,
    has_comments: false,
  });

  const [myBooksStatusFilter, setMyBooksStatusFilter] = useState<
    'active' | 'reserved' | 'completed' | undefined
  >('active');

  const userHasLocation = Boolean(user?.location);

  const { data: marketplaceOffers = [], isLoading: isLoadingMarketplace } =
    useMarketplace({
      search: filters.search,
      condition: filters.condition.length > 0 ? filters.condition : undefined,
      language: filters.language,
      category: filters.category,
      max_distance_km:
        userHasLocation && filters.max_distance_km
          ? filters.max_distance_km
          : undefined,
      has_comments: filters.has_comments || undefined,
    });

  const { data: myOffers = [], isLoading: isLoadingMyOffers } =
    useMyOffers(myBooksStatusFilter);

  const { data: stats } = useBookStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-amber-600 to-orange-700 p-8 shadow-xl backdrop-blur-sm dark:from-amber-900 dark:to-orange-900">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <div className="rounded-full bg-white/20 p-2 backdrop-blur-sm">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white">Bücherecke</h1>
              </div>
              <p className="text-amber-100">
                Teile deine Bücher mit der Community
              </p>
            </div>

            <div className="flex items-center gap-3">
              {isAuthenticated && user && <CreditBadge user={user} />}
              {isAuthenticated && (
                <Button
                  onClick={() => setIsAddBookModalOpen(true)}
                  className="flex items-center gap-2 bg-white text-amber-700 hover:bg-amber-50"
                >
                  <Plus className="h-4 w-4" />
                  Buch anbieten
                </Button>
              )}
            </div>
          </div>
        </div>

        {stats && (
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="border-amber-200 bg-white/80 backdrop-blur-sm dark:border-amber-800 dark:bg-gray-800/80">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BookOpen className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Verfügbare Bücher
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {stats.available_offers}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-amber-200 bg-white/80 backdrop-blur-sm dark:border-amber-800 dark:bg-gray-800/80">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Gesamt Angebote
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {stats.total_offers}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-amber-200 bg-white/80 backdrop-blur-sm dark:border-amber-800 dark:bg-gray-800/80">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-amber-700 dark:text-amber-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Verschiedene Bücher
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {stats.total_books}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        <Card className="border-amber-200 bg-white/90 backdrop-blur-sm dark:border-amber-800 dark:bg-gray-800/90">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as 'marketplace' | 'my-books')}
          >
            <div className="border-b border-gray-200 px-6 pt-6 dark:border-gray-700">
              <TabsList className="bg-amber-100 dark:bg-amber-900/30">
                <TabsTrigger value="marketplace">Marktplatz</TabsTrigger>
                {isAuthenticated && (
                  <TabsTrigger value="my-books">Meine Bücher</TabsTrigger>
                )}
              </TabsList>
            </div>

            <TabsContent value="marketplace" className="p-6">
              <BookFilters
                filters={filters}
                onFilterChange={setFilters}
                userHasLocation={userHasLocation}
              />

              {isLoadingMarketplace ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="aspect-[2/3] animate-pulse rounded-lg bg-amber-100 dark:bg-gray-700"
                    />
                  ))}
                </div>
              ) : marketplaceOffers.length === 0 ? (
                <div className="py-12 text-center">
                  <BookOpen className="mx-auto mb-4 h-12 w-12 text-amber-400" />
                  <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Keine Bücher gefunden
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Versuche andere Filtereinstellungen
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                  {marketplaceOffers.map((offer) => (
                    <BookCard
                      key={offer.id}
                      offer={offer}
                      variant="marketplace"
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {isAuthenticated && (
              <TabsContent value="my-books" className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Button
                    variant={
                      myBooksStatusFilter === undefined ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() => setMyBooksStatusFilter(undefined)}
                  >
                    Alle
                  </Button>
                  <Button
                    variant={
                      myBooksStatusFilter === 'active' ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() => setMyBooksStatusFilter('active')}
                  >
                    Aktiv
                  </Button>
                  <Button
                    variant={
                      myBooksStatusFilter === 'reserved' ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() => setMyBooksStatusFilter('reserved')}
                  >
                    Reserviert
                  </Button>
                  <Button
                    variant={
                      myBooksStatusFilter === 'completed'
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    onClick={() => setMyBooksStatusFilter('completed')}
                  >
                    Abgeschlossen
                  </Button>
                </div>

                {isLoadingMyOffers ? (
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="aspect-[2/3] animate-pulse rounded-lg bg-amber-100 dark:bg-gray-700"
                      />
                    ))}
                  </div>
                ) : myOffers.length === 0 ? (
                  <div className="py-12 text-center">
                    <BookOpen className="mx-auto mb-4 h-12 w-12 text-amber-400" />
                    <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Noch keine Bücher
                    </h3>
                    <p className="mb-4 text-gray-600 dark:text-gray-400">
                      Biete dein erstes Buch an
                    </p>
                    <Button onClick={() => setIsAddBookModalOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Buch anbieten
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                    {myOffers.map((offer) => (
                      <BookCard
                        key={offer.id}
                        offer={offer}
                        variant="my-books"
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>
        </Card>
      </div>

      {isAuthenticated && user && (
        <AddBookModal
          isOpen={isAddBookModalOpen}
          onClose={() => setIsAddBookModalOpen(false)}
          onSuccess={() => {
            setIsAddBookModalOpen(false);
            setActiveTab('my-books');
          }}
        />
      )}
    </div>
  );
}
