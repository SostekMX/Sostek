import { axisOf } from '../utils/axis';

describe('axisOf', () => {
  it('reconoce las categorias de los articulos', () => {
    expect(axisOf('Ambiental')).toBe('ambiental');
    expect(axisOf('Económico')).toBe('economico');
    expect(axisOf('Social')).toBe('social');
  });

  it('reconoce los nombres de eje de las evaluaciones', () => {
    expect(axisOf('ECOSISTEMA')).toBe('ambiental');
    // Eje mixto: manda el primero que se nombra
    expect(axisOf('Economía y sociedad')).toBe('economico');
  });

  it('devuelve null si no hay categoria o no calza', () => {
    expect(axisOf(undefined)).toBeNull();
    expect(axisOf('')).toBeNull();
    expect(axisOf('Presentación')).toBeNull();
  });
});
