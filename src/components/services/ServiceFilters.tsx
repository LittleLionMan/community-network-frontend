import { useState } from 'react';
import { Search, Filter, Grid, List, X, HandHeart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ServiceFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  serviceType: 'all' | 'offering' | 'seeking';
  onServiceTypeChange: (type: 'all' | 'offering' | 'seeking') => void;
  excludeOwn: boolean;
  onExcludeOwnChange: (exclude: boolean) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  resultsCount?: number;
  isAuthenticated?: boolean;
}

export function ServiceFilters({
  searchQuery,
  onSearchChange,
  serviceType,
  onServiceTypeChange,
  excludeOwn,
  onExcludeOwnChange,
  viewMode,
  onViewModeChange,
  resultsCount,
  isAuthenticated = false,
}: ServiceFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const serviceTypes = [
    { key: 'all', label: 'Alle Services', icon: null },
    { key: 'offering', label: 'Wird angeboten', icon: HandHeart },
    { key: 'seeking', label: 'Wird gesucht', icon: Eye },
  ] as const;

  const hasActiveFilters =
    serviceType !== 'all' || excludeOwn || searchQuery.length > 0;

  const clearAllFilters = () => {
    onSearchChange('');
    onServiceTypeChange('all');
    onExcludeOwnChange(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            placeholder="Services durchsuchen..."
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
        {serviceTypes.map((type) => {
          const IconComponent = type.icon;
          return (
            <Button
              key={type.key}
              variant={serviceType === type.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => onServiceTypeChange(type.key)}
              className="flex items-center gap-1 text-xs"
            >
              {IconComponent && <IconComponent className="h-3 w-3" />}
              {type.label}
            </Button>
          );
        })}
      </div>

      {showFilters && (
        <div className="space-y-4 rounded-lg bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Erweiterte Filter</h3>
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

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Service Typ
              </label>
              <div className="flex flex-wrap gap-2">
                {serviceTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <Button
                      key={type.key}
                      variant={serviceType === type.key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onServiceTypeChange(type.key)}
                      className="flex items-center gap-1 text-xs"
                    >
                      {IconComponent && <IconComponent className="h-3 w-3" />}
                      {type.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {isAuthenticated && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Persönliche Einstellungen
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="exclude-own"
                    checked={excludeOwn}
                    onChange={(e) => onExcludeOwnChange(e.target.checked)}
                    className="mr-2 h-4 w-4 rounded border-gray-300 text-community-600 focus:ring-community-500"
                  />
                  <label
                    htmlFor="exclude-own"
                    className="cursor-pointer text-sm text-gray-700"
                  >
                    Eigene Services ausblenden
                  </label>
                </div>
              </div>
            )}

            <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center">
              <div className="text-sm text-gray-500">
                <p className="font-medium">Standort-Filter</p>
                <p>Wird in einer zukünftigen Version verfügbar sein</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {resultsCount !== undefined && (
        <div className="text-sm text-gray-600">
          {resultsCount === 1
            ? '1 Service gefunden'
            : `${resultsCount} Services gefunden`}
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
