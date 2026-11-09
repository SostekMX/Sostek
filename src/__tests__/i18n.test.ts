import es from '../i18n/es';
import en from '../i18n/en';
import { translate } from '../i18n/LanguageContext';
import { axisOf } from '../utils/axis';

const vars = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();

describe('diccionarios', () => {
  it('tienen las mismas llaves y variables en los dos idiomas', () => {
    const keys = Object.keys(es) as (keyof typeof es)[];
    expect(Object.keys(en).sort()).toEqual([...keys].sort());
    keys.forEach(k => expect([k, vars(en[k])]).toEqual([k, vars(es[k])]));
  });

  it('interpola y deja intacta una variable que no se paso', () => {
    expect(translate('en', 'common.of', { a: 2, b: 5 })).toBe('2 of 5');
    expect(translate('es', 'common.of', { a: 2 })).toBe('2 de {b}');
  });
});

describe('contenido traducido', () => {
  it('los ejes en ingles caen en el mismo eje que en espanol', () => {
    expect(axisOf('Environmental')).toBe(axisOf('Ambiental'));
    expect(axisOf('Economic')).toBe(axisOf('Económico'));
    expect(axisOf('Social')).toBe('social');
  });
});
