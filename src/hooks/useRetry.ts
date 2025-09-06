import { useState, useCallback } from 'react';

interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: boolean;
}

export function useRetry() {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const retry = useCallback(
    async <T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> => {
      const { maxAttempts = 3, delay = 1000, backoff = true } = options;

      setIsRetrying(true);
      setRetryCount(0);

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          setRetryCount(attempt);
          const result = await fn();
          setIsRetrying(false);
          setRetryCount(0);
          return result;
        } catch (error) {
          if (attempt === maxAttempts) {
            setIsRetrying(false);
            setRetryCount(0);
            throw error;
          }

          const waitTime = backoff ? delay * Math.pow(2, attempt - 1) : delay;
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
      }

      throw new Error('Max retry attempts reached');
    },
    []
  );

  return {
    retry,
    isRetrying,
    retryCount,
  };
}
