'use client';

import { useState, useEffect } from 'react';
import { Search, X, Globe, Tag, MapPin, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { MultiSelect } from '@/components/books/MultiSelect';
import { useFilterOptions } from '@/hooks/useBooks';

interface BookFiltersProps {
  filters: {
    search?: string;
    condition?: string[];
    language?: string[];
    category?: string[];
    district?: string[];
    has_comments?: boolean;
  };
  onFilterChange: (filters: BookFiltersProps['filters']) => void;
  userHasLocation: boolean;
}

const CONDITION_OPTIONS = [
  { value: 'new', label: 'Neu' },
  { value: 'like_new', label: 'Wie neu' },
  { value: 'good', label: 'Gut' },
  { value: 'acceptable', label: 'Akzeptabel' },
];

export function BookFilters({ filters, onFilterChange }: BookFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null
  );
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: filterOptions, isLoading: isLoadingOptions } =
    useFilterOptions();

  useEffect(() => {
    if (debounceTimer) clearTimeout(debounceTimer);

    const timer = setTimeout(() => {
      const trimmedSearch = searchInput.trim();
      onFilterChange({
        ...filters,
        search: trimmedSearch.length > 0 ? trimmedSearch : undefined,
      });
    }, 500);

    setDebounceTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [searchInput]);

  const handleConditionToggle = (condition: string) => {
    const currentConditions = filters.condition || [];
    const newConditions = currentConditions.includes(condition)
      ? currentConditions.filter((c) => c !== condition)
      : [...currentConditions, condition];

    onFilterChange({ ...filters, condition: newConditions });
  };

  const handleReset = () => {
    setSearchInput('');
    onFilterChange({
      search: undefined,
      condition: [],
      language: [],
      category: [],
      district: [],
      has_comments: false,
    });
  };

  const activeFilterCount = [
    filters.search ? 1 : 0,
    filters.condition?.length || 0,
    filters.language?.length || 0,
    filters.category?.length || 0,
    filters.district?.length || 0,
    filters.has_comments ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div className="mb-4 rounded-lg border border-amber-200 bg-white/50 p-3 backdrop-blur-sm dark:border-amber-800 dark:bg-gray-800/50">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 md:cursor-default"
        >
          Filter
          <ChevronDown
            className={`h-4 w-4 transition-transform md:hidden ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </button>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="flex items-center gap-1.5 border-amber-600 px-2 py-1 text-xs text-amber-700 hover:bg-amber-50 dark:border-amber-500 dark:text-amber-400 dark:hover:bg-amber-900/20"
          >
            <X className="h-3 w-3" />
            <span className="hidden sm:inline">Reset</span>({activeFilterCount})
          </Button>
        )}
      </div>

      <div className={`mt-3 space-y-3 ${!isExpanded ? 'hidden md:block' : ''}`}>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Titel, Autor, ISBN..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="has-comments"
              checked={filters.has_comments}
              onCheckedChange={(checked) =>
                onFilterChange({ ...filters, has_comments: !!checked })
              }
            />
            <label
              htmlFor="has-comments"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Nur mit Benutzerkommentaren
            </label>
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
            Zustand
          </p>
          <div className="flex flex-wrap gap-2">
            {CONDITION_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-1.5"
              >
                <Checkbox
                  checked={(filters.condition || []).includes(option.value)}
                  onCheckedChange={() => handleConditionToggle(option.value)}
                />
                <span className="text-xs text-gray-700 dark:text-gray-300">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {!isLoadingOptions && filterOptions && (
          <div className="grid gap-3 md:grid-cols-3">
            <MultiSelect
              label="Sprache"
              icon={<Globe className="h-4 w-4" />}
              options={filterOptions.languages}
              selected={filters.language || []}
              onChange={(selected) =>
                onFilterChange({
                  ...filters,
                  language: selected.length > 0 ? selected : undefined,
                })
              }
              placeholder="Alle Sprachen"
              maxDisplayed={2}
            />

            <MultiSelect
              label="Kategorie"
              icon={<Tag className="h-4 w-4" />}
              options={filterOptions.categories}
              selected={filters.category || []}
              onChange={(selected) =>
                onFilterChange({
                  ...filters,
                  category: selected.length > 0 ? selected : undefined,
                })
              }
              placeholder="Alle Kategorien"
              maxDisplayed={1}
            />

            <MultiSelect
              label="Stadtteil"
              icon={<MapPin className="h-4 w-4" />}
              options={filterOptions.districts}
              selected={filters.district || []}
              onChange={(selected) =>
                onFilterChange({
                  ...filters,
                  district: selected.length > 0 ? selected : undefined,
                })
              }
              placeholder="Alle Stadtteile"
              maxDisplayed={1}
            />
          </div>
        )}

        {isLoadingOptions && (
          <div className="mt-4 flex items-center justify-center py-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-600 border-t-transparent"></div>
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              Lade Filter-Optionen...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
