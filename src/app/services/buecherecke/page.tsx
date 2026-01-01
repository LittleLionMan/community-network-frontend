'use client';

import { useState } from 'react';
import { BookOpen, Plus, TrendingUp, Users, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { BookCard } from '@/components/books/BookCard';
import { BookFilters } from '@/components/books/BookFilters';
import { AddBookModal } from '@/components/books/AddBookModal';
import { CreditBadge } from '@/components/books/CreditBadge';
import { useMarketplace, useMyOffers, useBookStats } from '@/hooks/useBooks';
import { useCanCreateMarketplaceOffer } from '@/hooks/useMarketplaceValidation';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';

export default function BuechereckePage() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'marketplace' | 'my-books'>(
    'marketplace'
  );
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);

  const { data: canCreateData, isLoading: isCheckingPermission } =
    useCanCreateMarketplaceOffer();

  const [filters, setFilters] = useState<{
    search?: string;
    condition?: string[];
    language?: string[];
    genre?: string[];
    topic?: string[];
    district?: string[];
    has_comments?: boolean;
  }>({
    condition: [],
    language: [],
    genre: [],
    topic: [],
    district: [],
    has_comments: false,
  });

  const [myBooksStatusFilter, setMyBooksStatusFilter] = useState<
    'active' | 'reserved' | 'completed' | undefined
  >('active');

  const userHasLocation = Boolean(user?.exact_address);

  const {
    data: marketplaceData,
    isLoading: isLoadingMarketplace,
    fetchNextPage: fetchNextMarketplacePage,
    hasNextPage: hasNextMarketplacePage,
    isFetchingNextPage: isFetchingNextMarketplacePage,
  } = useMarketplace({
    search: filters.search,
    condition:
      filters.condition && filters.condition.length > 0
        ? filters.condition
        : undefined,
    language:
      filters.language && filters.language.length > 0
        ? filters.language
        : undefined,
    genre:
      filters.genre && filters.genre.length > 0 ? filters.genre : undefined,
    topic:
      filters.topic && filters.topic.length > 0 ? filters.topic : undefined,
    district:
      filters.district && filters.district.length > 0
        ? filters.district
        : undefined,
    has_comments: filters.has_comments || undefined,
  });

  const marketplaceOffers =
    marketplaceData?.pages.flatMap((page) => page.items) ?? [];

  const {
    data: myOffersData,
    isLoading: isLoadingMyOffers,
    fetchNextPage: fetchNextMyOffersPage,
    hasNextPage: hasNextMyOffersPage,
    isFetchingNextPage: isFetchingNextMyOffersPage,
  } = useMyOffers(myBooksStatusFilter);

  const myOffers = myOffersData?.pages.flatMap((page) => page.items) ?? [];

  const { data: stats } = useBookStats();

  const canCreateOffer = canCreateData?.can_create ?? true;
  const canCreateReason = canCreateData?.reason;

  const getTooltipMessage = () => {
    if (!isAuthenticated) {
      return 'Bitte melde dich an';
    }
    if (canCreateReason === 'messages_disabled') {
      return 'Aktiviere zuerst Nachrichten in deinen Privacy-Einstellungen';
    }
    if (canCreateReason === 'strangers_disabled') {
      return 'Aktiviere zuerst "Nachrichten von Fremden" in deinen Privacy-Einstellungen';
    }
    return 'Buch anbieten';
  };

  const handleAddBookClick = () => {
    if (!canCreateOffer && canCreateReason) {
      router.push('/profile?tab=privacy');
    } else {
      setIsAddBookModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-amber-600 to-orange-700 p-4 shadow-xl backdrop-blur-sm dark:from-amber-900 dark:to-orange-900 md:mb-8 md:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2 md:gap-3">
                <div className="rounded-full bg-white/20 p-1.5 backdrop-blur-sm md:p-2">
                  <BookOpen className="h-6 w-6 text-white md:h-8 md:w-8" />
                </div>
                <h1 className="text-2xl font-bold text-white md:text-3xl">
                  Bücherecke
                </h1>
              </div>
              <p className="text-sm text-amber-100 md:text-base">
                Teile deine Bücher mit der Community
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              {isAuthenticated && user && <CreditBadge user={user} />}
              {isAuthenticated && (
                <div className="group relative">
                  <Button
                    onClick={handleAddBookClick}
                    disabled={isCheckingPermission}
                    className={`flex items-center justify-center gap-2 ${
                      !canCreateOffer
                        ? 'cursor-not-allowed bg-gray-300 text-gray-600 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-700'
                        : 'bg-white text-amber-700 hover:bg-amber-50'
                    }`}
                  >
                    {!canCreateOffer && (
                      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    )}
                    <Plus className="h-4 w-4" />
                    Buch anbieten
                  </Button>

                  {!canCreateOffer && (
                    <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 dark:bg-gray-700 sm:block">
                      {getTooltipMessage()}
                      <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                    </div>
                  )}

                  {!canCreateOffer && (
                    <div className="mt-1 block text-xs text-amber-100 sm:hidden">
                      {getTooltipMessage()}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {stats && (
          <div className="mb-4 hidden grid-cols-1 gap-4 sm:grid sm:grid-cols-3 md:mb-8">
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
                      Neu diese Woche
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {stats.new_this_week}
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
                      Erfolgreiche Transaktionen
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {stats.successful_exchanges}
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
                <>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                    {marketplaceOffers.map((offer) => (
                      <BookCard
                        key={offer.id}
                        offer={offer}
                        variant="marketplace"
                      />
                    ))}
                  </div>

                  {hasNextMarketplacePage && (
                    <div className="mt-8 text-center">
                      <Button
                        onClick={() => fetchNextMarketplacePage()}
                        disabled={isFetchingNextMarketplacePage}
                        variant="outline"
                        className="border-amber-600 text-amber-700 hover:bg-amber-50 dark:border-amber-500 dark:text-amber-400 dark:hover:bg-amber-900/20"
                      >
                        {isFetchingNextMarketplacePage ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
                            Lädt...
                          </>
                        ) : (
                          <>Mehr Bücher laden</>
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            {isAuthenticated && (
              <TabsContent value="my-books" className="p-6">
                <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
                  <Button
                    variant={
                      myBooksStatusFilter === undefined ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() => setMyBooksStatusFilter(undefined)}
                    className="shrink-0 px-3 text-xs"
                  >
                    Alle
                  </Button>
                  <Button
                    variant={
                      myBooksStatusFilter === 'active' ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() => setMyBooksStatusFilter('active')}
                    className="shrink-0 px-3 text-xs"
                  >
                    Aktiv
                  </Button>
                  <Button
                    variant={
                      myBooksStatusFilter === 'reserved' ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() => setMyBooksStatusFilter('reserved')}
                    className="shrink-0 px-3 text-xs"
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
                    className="shrink-0 px-3 text-xs"
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
                    <Button
                      onClick={handleAddBookClick}
                      disabled={!canCreateOffer}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Buch anbieten
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                      {myOffers.map((offer) => (
                        <BookCard
                          key={offer.id}
                          offer={offer}
                          variant="my-books"
                        />
                      ))}
                    </div>

                    {hasNextMyOffersPage && (
                      <div className="mt-8 text-center">
                        <Button
                          onClick={() => fetchNextMyOffersPage()}
                          disabled={isFetchingNextMyOffersPage}
                          variant="outline"
                          className="border-amber-600 text-amber-700 hover:bg-amber-50 dark:border-amber-500 dark:text-amber-400 dark:hover:bg-amber-900/20"
                        >
                          {isFetchingNextMyOffersPage ? (
                            <>
                              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
                              Lädt...
                            </>
                          ) : (
                            <>Mehr Bücher laden</>
                          )}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
            )}
          </Tabs>
        </Card>
      </div>

      {isAuthenticated && user && canCreateOffer && (
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
