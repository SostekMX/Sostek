import { useState, useEffect } from 'react';
import axios from 'axios';

export interface Favorite {
  content_id: string;
  type: 'article' | 'presentation';
}

const useFavorites = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);
  const isLoggedIn = localStorage.getItem('login') === 'true';

  useEffect(() => {
    if (!isLoggedIn) return;
    const token = localStorage.getItem('token');
    setLoading(true);
    axios.get('http://localhost:8080/user/favorites', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      if (res.data.success) setFavorites(res.data.favorites);
    }).catch(err => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  const isFavorite = (id: string) => favorites.some(f => f.content_id === id);

  const addFavorite = async (content_id: string, type: 'article' | 'presentation') => {
    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:8080/user/favorites', { content_id, type }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(prev => [...prev, { content_id, type }]);
    } catch (err) {
      console.log(err);
    }
  };

  const removeFavorite = async (content_id: string) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:8080/user/favorites/${content_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(prev => prev.filter(f => f.content_id !== content_id));
    } catch (err) {
      console.log(err);
    }
  };

  return { favorites, loading, isLoggedIn, isFavorite, addFavorite, removeFavorite };
};

export default useFavorites;
