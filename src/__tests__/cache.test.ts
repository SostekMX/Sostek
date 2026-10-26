import { readCache } from '../utils/cache';

describe('readCache', () => {
  afterEach(() => localStorage.clear());

  it('devuelve lo guardado', () => {
    localStorage.setItem('articles', JSON.stringify([{ _id: '1' }]));
    expect(readCache('articles')).toEqual([{ _id: '1' }]);
  });

  it('trata lo vacio y lo corrupto como sin cache', () => {
    expect(readCache('articles')).toBeNull();
    localStorage.setItem('articles', '{');
    expect(readCache('articles')).toBeNull();
  });
});
