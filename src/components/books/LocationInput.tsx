'use client';

import { useState, useEffect } from 'react';
import { MapPin, Check, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api';

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidated: (isValid: boolean, district?: string) => void;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
}

export function LocationInput({
  value,
  onChange,
  onValidated,
  placeholder = 'z.B. Beispielstraße 3, Ort',
  error,
  disabled,
}: LocationInputProps) {
  const [validationStatus, setValidationStatus] = useState<
    'idle' | 'validating' | 'valid' | 'invalid'
  >('idle');
  const [district, setDistrict] = useState<string | undefined>();
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null
  );

  useEffect(() => {
    if (debounceTimer) clearTimeout(debounceTimer);

    if (!value || value.length < 3) {
      setValidationStatus('idle');
      setDistrict(undefined);
      onValidated(false);
      return;
    }

    setValidationStatus('validating');

    const timer = setTimeout(async () => {
      try {
        const result = await apiClient.location.validate(value);

        if (result.valid) {
          setValidationStatus('valid');
          setDistrict(result.district);
          onValidated(true, result.district);
        } else {
          setValidationStatus('invalid');
          setDistrict(undefined);
          onValidated(false);
        }
      } catch (err) {
        setValidationStatus('invalid');
        setDistrict(undefined);
        onValidated(false);
      }
    }, 800);

    setDebounceTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [value]);

  const getIcon = () => {
    switch (validationStatus) {
      case 'validating':
        return <Loader2 className="h-4 w-4 animate-spin text-gray-400" />;
      case 'valid':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'invalid':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <MapPin className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div>
      <div className="relative">
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          error={error || validationStatus === 'invalid'}
          disabled={disabled}
          className="pr-10"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {getIcon()}
        </div>
      </div>

      {validationStatus === 'valid' && district && (
        <p className="mt-1 text-sm text-green-600 dark:text-green-400">
          ✓ Gefunden: {district}
        </p>
      )}

      {validationStatus === 'invalid' && value.length >= 3 && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          Standort konnte nicht gefunden werden
        </p>
      )}

      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Öffentlich wird nur dein Stadtteil angezeigt
      </p>
    </div>
  );
}
