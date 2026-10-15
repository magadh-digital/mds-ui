import { useEffect, useState } from "react";

/**
 * `value`, settled for `delay` ms. Lives apart from `console/pickers.tsx`, which loads the data client
 * (`src/data/api.ts` reads `location` at import), so any file can use it, tests included.
 */
export function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}
