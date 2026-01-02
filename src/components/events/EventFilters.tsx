'use client';

import { useState } from 'react';
import { Search, Filter, Grid, List, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEventCategories } from '@/hooks/useEvents';

interface EventFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: number | null;
  onCategoryChange: (categoryId: number | null) => void;
  timeFilter: 'all' | 'today' | 'week' | 'month' | 'past';
  onTimeFilterChange: (
    filter: 'all' | 'today' | 'week' | 'month' | 'past'
  ) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  resultsCount?: number;
}

export function EventFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  timeFilter,
  onTimeFilterChange,
  viewMode,
  onViewModeChange,
  resultsCount,
}: EventFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const { data: categories } = useEventCategories();

  const timeFilters = [
    { key: 'all', label: 'Alle Events' },
    { key: 'today', label: 'Heute' },
    { key: 'week', label: 'Diese Woche' },
    { key: 'month', label: 'Diesen Monat' },
    { key: 'past', label: 'Abgeschlossene Events' },
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
            placeholder="Events durchsuchen..."
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
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-community-600 text-xs text-white">
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
            <h3 className="font-medium text-gray-900">Filter</h3>
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
              Kategorie
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => onCategoryChange(null)}
                className="text-xs"
              >
                Alle
              </Button>
              {categories?.map((category) => (
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
          </div>
        </div>
      )}

      {resultsCount !== undefined && (
        <div className="text-sm text-gray-600">
          {resultsCount === 1
            ? '1 Event gefunden'
            : `${resultsCount} Events gefunden`}
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
