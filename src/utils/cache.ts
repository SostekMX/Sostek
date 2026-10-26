/* Cache de contenido en localStorage. Una entrada corrupta cuenta como vacia: antes un
 * JSON.parse sin try tumbaba la pagina entera. */
export function readCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
