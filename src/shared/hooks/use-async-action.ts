import { useCallback, useState } from 'react';

/**
 * Hook for handling async actions with loading states
 * Provides a consistent way to manage loading states for buttons and actions
 */
export function useAsyncAction<T extends unknown[], R = void>() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (
      action: (...args: T) => Promise<R>,
      ...args: T
    ): Promise<R | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await action(...args);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    execute,
    reset,
  };
}
