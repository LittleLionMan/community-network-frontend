// src/components/auth/PasswordStrength.tsx
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { passwordCriteria } from '@/lib/auth-schemas';

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

export function PasswordStrength({
  password,
  className,
}: PasswordStrengthProps) {
  return (
    <div className={cn('mt-2 space-y-1', className)}>
      <p className="mb-2 text-xs text-gray-600">Passwort muss enthalten:</p>
      {passwordCriteria.map((criterion) => {
        const isValid = criterion.test(password);
        return (
          <div
            key={criterion.key}
            className={cn(
              'flex items-center gap-2 text-xs transition-colors',
              isValid ? 'text-green-600' : 'text-gray-500'
            )}
          >
            {isValid ? (
              <Check className="h-3 w-3 flex-shrink-0" />
            ) : (
              <X className="h-3 w-3 flex-shrink-0" />
            )}
            <span>{criterion.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// Default export for easier importing
export default PasswordStrength;
