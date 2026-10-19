import { normalize } from './search';

/* Los tres ejes de la sostenibilidad atraviesan toda la app: son las categorias de los
   articulos, los recursos de las cartas de JUEGA y las areas de las evaluaciones. En
   escritorio cada uno tiene su color (--axis-*) para que se reconozcan de un vistazo. */
export type Axis = 'ambiental' | 'economico' | 'social';

export function axisOf(category: string | undefined | null): Axis | null {
  const c = normalize(category ?? '');
  if (c.includes('ambient') || c.includes('ecosistema')) return 'ambiental';
  if (c.includes('econom')) return 'economico';
  if (c.includes('social') || c.includes('sociedad')) return 'social';
  return null;
}
