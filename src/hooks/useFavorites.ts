import { useState, useEffect, useCallback, useRef } from 'react';
import { getFavorites, addFavorite as addFavoriteRequest, removeFavorite as removeFavoriteRequest } from '../api/user';
import { isLoggedIn as isUserLoggedIn } from '../utils/session';

export interface Favorite {
  content_id: string;
  type: 'article' | 'presentation';
}

const useFavorites = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const requestId = useRef(0);
  const isLoggedIn = isUserLoggedIn();
  const token = isLoggedIn ? sessionStorage.getItem('token') : null;

  /* El token cambia entre sesiones. Ignorar respuestas atrasadas evita mostrar
     favoritos de una cuenta anterior si la petición termina después del logout. */
  const refreshFavorites = useCallback(async () => {
    const currentRequest = ++requestId.current;
    if (!token) {
      setFavorites([]);
      setLoadError(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await getFavorites();
      if (!response?.success || !Array.isArray(response.favorites)) {
        throw new Error('Respuesta de favoritos inválida');
      }
      if (currentRequest !== requestId.current) return;
      setFavorites(response.favorites);
      setLoadError(false);
    } catch (error) {
      if (currentRequest !== requestId.current) return;
      console.error('Error loading favorites:', error);
      setLoadError(true);
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void refreshFavorites();
    return () => { requestId.current += 1; };
  }, [refreshFavorites]);

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

  return { favorites, loading, loadError, isLoggedIn, isFavorite, addFavorite, removeFavorite, refreshFavorites };
};

export default useFavorites;
