import { useEffect, useState } from "react";

/** `value`, settled: it changes only after `value` has stayed the same for `delay` ms (a search box's server query). */
export function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}
