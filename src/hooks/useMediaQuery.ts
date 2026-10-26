import { useEffect, useState } from 'react';

/* Mismo corte que el IonSplitPane de App.tsx: desde aqui la app es la version de escritorio. */
export const DESKTOP_QUERY = '(min-width: 768px)';

export default function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    // Safari < 14 (y el matchMedia simulado de los tests) solo tienen la API vieja addListener.
    if (mql.addEventListener) {
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    }
    mql.addListener(onChange);
    return () => mql.removeListener(onChange);
  }, [query]);

  return matches;
}
