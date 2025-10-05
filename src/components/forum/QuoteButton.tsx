'use client';

import { Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuoteButtonProps {
  onQuote: () => void;
  disabled?: boolean;
}

export function QuoteButton({ onQuote, disabled = false }: QuoteButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onQuote}
      disabled={disabled}
      title="Zitieren"
      className="text-gray-600 hover:text-gray-900"
    >
      <Quote className="h-4 w-4" />
    </Button>
  );
}
