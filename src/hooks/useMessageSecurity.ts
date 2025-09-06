import { useState, useCallback } from 'react';
import { useAuthStore } from '@/store/auth';
import {
  validateMessageContent,
  MessageRateLimit,
  type ValidationResult,
} from '@/lib/message-validation';

export function useMessageSecurity() {
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState<string | null>(null);
  const { user } = useAuthStore();

  const validateAndSendMessage = useCallback(
    async (
      content: string,
      sendFunction: (content: string) => Promise<void>
    ): Promise<boolean> => {
      if (!user) {
        setBlockReason('Nicht angemeldet');
        setIsBlocked(true);
        return false;
      }

      const rateLimit = MessageRateLimit.getInstance(user.id);
      if (!rateLimit.canSendMessage()) {
        const remainingTime = Math.ceil(rateLimit.getRemainingTime() / 1000);
        setBlockReason(
          `Rate limit erreicht. Versuche es in ${remainingTime} Sekunden erneut.`
        );
        setIsBlocked(true);
        return false;
      }

      const validationResult: ValidationResult =
        validateMessageContent(content);

      if (!validationResult.isValid) {
        setBlockReason(validationResult.error || 'Validierungsfehler');
        setIsBlocked(true);
        return false;
      }

      try {
        await sendFunction(validationResult.sanitizedContent || content);

        setIsBlocked(false);
        setBlockReason(null);
        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Unbekannter Fehler beim Senden der Nachricht';

        setBlockReason(errorMessage);
        setIsBlocked(true);
        return false;
      }
    },
    [user]
  );

  const clearBlock = useCallback(() => {
    setIsBlocked(false);
    setBlockReason(null);
  }, []);

  return {
    isBlocked,
    blockReason,
    validateAndSendMessage,
    clearBlock,
  };
}
