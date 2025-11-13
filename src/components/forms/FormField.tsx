import * as React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface FormFieldProps {
  label: string;
  error?: string;
  success?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function FormField({
  label,
  error,
  success,
  required = false,
  children,
  className,
  id,
}: FormFieldProps) {
  const generatedId = React.useId();
  const fieldId = id || generatedId;
  const errorId = `${fieldId}-error`;
  const successId = `${fieldId}-success`;

  const childWithProps = React.cloneElement(
    children as React.ReactElement,
    {
      id: fieldId,
      'aria-describedby': error ? errorId : success ? successId : undefined,
      'aria-invalid': error ? 'true' : 'false',
    } as Record<string, unknown>
  );

  return (
    <div className={cn('space-y-2', className)}>
      <label
        htmlFor={fieldId}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && (
          <span
            className="ml-1 text-red-500 dark:text-red-400"
            aria-label="Pflichtfeld"
          >
            *
          </span>
        )}
      </label>

      {childWithProps}

      {error && (
        <div
          id={errorId}
          className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && !error && (
        <div
          id={successId}
          className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400"
          aria-live="polite"
        >
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}
    </div>
  );
}
