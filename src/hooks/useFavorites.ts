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
  const token = isLoggedIn ? sessionStorage.getItem('token') : null;

  /* Depende del token y no solo del montaje: Ionic deja montadas las paginas, asi que
     tras salir y entrar con otra cuenta APRENDE seguia con los favoritos del anterior. */
  useEffect(() => {
    if (!token) {
      setFavorites([]);
      return;
    }
    setLoading(true);
    getFavorites().then(data => {
      if (data.success) setFavorites(data.favorites);
    }).catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [token]);

  const isFavorite = (id: string) => favorites.some(f => f.content_id === id);

  /* El backend responde 200 con success:false (token vencido, "Ya esta en favoritos"),
     asi que hay que mirar success: antes el corazon se llenaba sin haberse guardado. */
  const addFavorite = async (content_id: string, type: 'article' | 'presentation') => {
    try {
      const data = await addFavoriteRequest(content_id, type);
      if (data.success) setFavorites(prev => [...prev, { content_id, type }]);
    } catch (err) {
      console.error(err);
    }
  };

  const removeFavorite = async (content_id: string) => {
    try {
      const data = await removeFavoriteRequest(content_id);
      if (data.success) setFavorites(prev => prev.filter(f => f.content_id !== content_id));
    } catch (err) {
      console.error(err);
    }
  };

  return { favorites, loading, isLoggedIn, isFavorite, addFavorite, removeFavorite };
};

export default useFavorites;
