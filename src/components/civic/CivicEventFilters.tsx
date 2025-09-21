'use client';

import { useState } from 'react';
import { Search, Filter, Grid, List, X, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEventCategories } from '@/hooks/useEvents';

interface CivicEventFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: number | null;
  onCategoryChange: (categoryId: number | null) => void;
  timeFilter: 'all' | 'today' | 'week' | 'month';
  onTimeFilterChange: (filter: 'all' | 'today' | 'week' | 'month') => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  resultsCount?: number;
}

export function CivicEventFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  timeFilter,
  onTimeFilterChange,
  viewMode,
  onViewModeChange,
  resultsCount,
}: CivicEventFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const { data: allCategories } = useEventCategories();
  const politicalCategories = allCategories || [];

  const timeFilters = [
    { key: 'all', label: 'Alle Events' },
    { key: 'today', label: 'Heute' },
    { key: 'week', label: 'Diese Woche' },
    { key: 'month', label: 'Diesen Monat' },
  ] as const;

  const hasActiveFilters =
    selectedCategory !== null || timeFilter !== 'all' || searchQuery.length > 0;

  const clearAllFilters = () => {
    onSearchChange('');
    onCategoryChange(null);
    onTimeFilterChange('all');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            placeholder="Politische Events durchsuchen..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filter
            {hasActiveFilters && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                !
              </span>
            )}
          </Button>

          <div className="flex rounded-md border border-gray-300">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewModeChange('list')}
              className={`border-l px-3 py-2 ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {timeFilters.map((filter) => (
          <Button
            key={filter.key}
            variant={timeFilter === filter.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTimeFilterChange(filter.key)}
            className="text-xs"
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {showFilters && (
        <div className="space-y-4 rounded-lg bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-blue-600" />
              <h3 className="font-medium text-gray-900">
                Politische Event Filter
              </h3>
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="flex items-center gap-1 text-xs"
              >
                <X className="h-3 w-3" />
                Alle löschen
              </Button>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Politische Kategorien
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => onCategoryChange(null)}
                className="text-xs"
              >
                Alle Kategorien
              </Button>
              {politicalCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={
                    selectedCategory === category.id ? 'default' : 'outline'
                  }
                  size="sm"
                  onClick={() => onCategoryChange(category.id)}
                  className="text-xs"
                >
                  {category.name}
                </Button>
              ))}
            </div>

            {politicalCategories.length === 0 && (
              <p className="mt-2 text-xs text-gray-500">
                Keine politischen Kategorien verfügbar. Alle Event-Kategorien
                werden angezeigt.
              </p>
            )}
          </div>
        </div>
      )}

      {resultsCount !== undefined && (
        <div className="text-sm text-gray-600">
          {resultsCount === 1
            ? '1 politisches Event gefunden'
            : `${resultsCount} politische Events gefunden`}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="ml-2 h-auto p-0 text-xs underline"
            >
              Filter zurücksetzen
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
