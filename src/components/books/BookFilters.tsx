'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

interface BookFiltersProps {
  filters: {
    search?: string;
    condition: string[];
    language?: string;
    category?: string;
    max_distance_km?: number;
    has_comments: boolean;
  };
  onFilterChange: (filters: BookFiltersProps['filters']) => void;
  userHasLocation: boolean;
}

export function BookFilters({
  filters,
  onFilterChange,
  userHasLocation,
}: BookFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null
  );

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
    const newConditions = filters.condition.includes(condition)
      ? filters.condition.filter((c) => c !== condition)
      : [...filters.condition, condition];

    onFilterChange({ ...filters, condition: newConditions });
  };

  const handleDistanceChange = (value: number[]) => {
    onFilterChange({ ...filters, max_distance_km: value[0] });
  };

  const handleReset = () => {
    setSearchInput('');
    onFilterChange({
      search: undefined,
      condition: [],
      language: undefined,
      category: undefined,
      max_distance_km: undefined,
      has_comments: false,
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.condition.length > 0 ||
    filters.language ||
    filters.category ||
    filters.max_distance_km ||
    filters.has_comments;

  const conditionOptions = [
    { value: 'new', label: 'Neu' },
    { value: 'like_new', label: 'Wie neu' },
    { value: 'good', label: 'Gut' },
    { value: 'acceptable', label: 'Akzeptabel' },
  ];

  return (
    <div className="mb-6 rounded-lg border border-amber-200 bg-white/50 p-4 backdrop-blur-sm dark:border-amber-800 dark:bg-gray-800/50">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
            Nur mit Rezensionen
          </label>
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Zustand
        </p>
        <div className="flex flex-wrap gap-3">
          {conditionOptions.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-2"
            >
              <Checkbox
                checked={filters.condition.includes(option.value)}
                onCheckedChange={() => handleConditionToggle(option.value)}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {userHasLocation && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Max. Distanz
            </p>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {filters.max_distance_km || 50} km
            </span>
          </div>
          <Slider
            value={[filters.max_distance_km || 50]}
            onValueChange={handleDistanceChange}
            min={1}
            max={50}
            step={1}
            className="w-full"
          />
        </div>
      )}

      {!userHasLocation && (
        <p className="mt-4 text-sm text-amber-700 dark:text-amber-300">
          💡 Füge einen Standort in deinem Profil hinzu, um die
          Distanz-Filterung zu nutzen
        </p>
      )}

      {hasActiveFilters && (
        <div className="mt-4 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Filter zurücksetzen
          </Button>
        </div>
      )}
    </div>
  );
}
