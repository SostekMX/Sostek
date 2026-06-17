import { useState, useEffect } from 'react';
import { getFavorites, addFavorite as addFavoriteRequest, removeFavorite as removeFavoriteRequest } from '../api/user';

export interface Favorite {
  content_id: string;
  type: 'article' | 'presentation';
}

const useFavorites = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);
  const isLoggedIn = sessionStorage.getItem('login') === 'true';

  useEffect(() => {
    if (!isLoggedIn) return;
    setLoading(true);
    getFavorites().then(data => {
      if (data.success) setFavorites(data.favorites);
    }).catch(err => console.error(err))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isFavorite = (id: string) => favorites.some(f => f.content_id === id);

  const addFavorite = async (content_id: string, type: 'article' | 'presentation') => {
    try {
      await addFavoriteRequest(content_id, type);
      setFavorites(prev => [...prev, { content_id, type }]);
    } catch (err) {
      console.error(err);
    }
  };

  const removeFavorite = async (content_id: string) => {
    try {
      await removeFavoriteRequest(content_id);
      setFavorites(prev => prev.filter(f => f.content_id !== content_id));
    } catch (err) {
      console.error(err);
    }
  };

  return { favorites, loading, isLoggedIn, isFavorite, addFavorite, removeFavorite };
};

export default useFavorites;
