export function normalize(s: string): string {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

// Traduce el eje más débil de una evaluación a los términos con que se buscan los
// artículos que la refuerzan. Las llaves son las categorías tal como vienen sembradas
// desde las Google Sheets de las evaluaciones — el segundo eje no está normalizado y
// aparece con las dos palabras en ambos órdenes, así que van los dos. En Atlas los ejes se
// llaman "Ambiental" y "Económico y Social": el primero ya calza solo contra la categoría,
// el segundo no calza con ninguna tal cual y dejaba la página vacía.
export const CATEGORY_RECOMMENDATIONS: Record<string, string[]> = {
  [normalize('ECOSISTEMA')]: [normalize('ambiental'), normalize('ecosistema'), normalize('medio ambiente')],
  [normalize('Economía y sociedad')]: [normalize('economico'), normalize('social')],
  [normalize('Sociedad y Economía')]: [normalize('economico'), normalize('social')],
  [normalize('Económico y Social')]: [normalize('economico'), normalize('social')],
};

