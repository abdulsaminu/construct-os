import { useState, useEffect } from 'react';

/**
 * Debounced value hook. Returns the debounced version of the input value.
 * Updates only after the specified delay of inactivity.
 */
export function useDebouncedValue<T>(value: T, delay: number = 250): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}