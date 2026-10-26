import { normalize, matchesSearch } from '../utils/search';

describe('normalize', () => {
  it('convierte a minusculas', () => {
    expect(normalize('HOLA')).toBe('hola');
  });

  it('elimina tildes y diacriticos', () => {
    expect(normalize('árbol')).toBe('arbol');
    expect(normalize('niño')).toBe('nino');
    expect(normalize('écologie')).toBe('ecologie');
    expect(normalize('zürich')).toBe('zurich');
  });

  it('permite buscar con o sin tilde el mismo resultado', () => {
    const titulo = 'Día Mundial de los Humedales';
    expect(normalize(titulo)).toContain(normalize('dia'));
    expect(normalize(titulo)).toContain(normalize('Día'));
  });

  it('maneja cadenas vacias sin error', () => {
    expect(normalize('')).toBe('');
  });

  it('maneja texto sin caracteres especiales sin cambios de contenido', () => {
    expect(normalize('sostenibilidad')).toBe('sostenibilidad');
  });
});

describe('matchesSearch', () => {
  const article = { category: 'Social', title: 'Agua limpia', tags: ['comunidad'] };

  it('busca en categoria, titulo y tags sin importar tildes', () => {
    expect(matchesSearch(article, 'AGUA')).toBe(true);
    expect(matchesSearch(article, 'comunidad')).toBe(true);
    expect(matchesSearch(article, 'energía')).toBe(false);
  });

  it('traduce el eje de la evaluacion a sus categorias', () => {
    expect(matchesSearch(article, 'Económico y Social')).toBe(true);
  });
});
