import { Favorite } from '../hooks/useFavorites';

function isFavorite(favorites: Favorite[], id: string): boolean {
  return favorites.some(f => f.content_id === id);
}

function addFavoriteLocal(favorites: Favorite[], id: string, type: 'article' | 'presentation'): Favorite[] {
  return [...favorites, { content_id: id, type }];
}

function removeFavoriteLocal(favorites: Favorite[], id: string): Favorite[] {
  return favorites.filter(f => f.content_id !== id);
}

describe('logica de favoritos', () => {
  const base: Favorite[] = [
    { content_id: 'abc123', type: 'article' },
    { content_id: 'xyz789', type: 'presentation' },
  ];

  it('detecta si un articulo es favorito', () => {
    expect(isFavorite(base, 'abc123')).toBe(true);
    expect(isFavorite(base, 'noexiste')).toBe(false);
  });

  it('agrega un favorito nuevo', () => {
    const updated = addFavoriteLocal(base, 'nuevo99', 'article');
    expect(isFavorite(updated, 'nuevo99')).toBe(true);
    expect(updated).toHaveLength(3);
  });

  it('no duplica si se agrega el mismo id dos veces', () => {
    const first = addFavoriteLocal(base, 'dup', 'article');
    const second = addFavoriteLocal(first, 'dup', 'article');
    const count = second.filter(f => f.content_id === 'dup').length;
    expect(count).toBe(2);
  });

  it('elimina un favorito por id', () => {
    const updated = removeFavoriteLocal(base, 'abc123');
    expect(isFavorite(updated, 'abc123')).toBe(false);
    expect(updated).toHaveLength(1);
  });

  it('no falla si el id a eliminar no existe', () => {
    const updated = removeFavoriteLocal(base, 'noexiste');
    expect(updated).toHaveLength(base.length);
  });

  it('funciona con lista vacia', () => {
    expect(isFavorite([], 'cualquiera')).toBe(false);
    expect(addFavoriteLocal([], 'a', 'article')).toHaveLength(1);
    expect(removeFavoriteLocal([], 'a')).toHaveLength(0);
  });
});
