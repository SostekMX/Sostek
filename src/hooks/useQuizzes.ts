import { useCallback, useEffect, useState } from 'react';
import { getQuizzes } from '../api/content';
import { readCache } from '../utils/cache';
import { OLD_QUIZ_CACHE_KEY, Quiz, QUIZ_CACHE_KEY } from '../utils/quiz';

/* Mismo patron que EVALUATE: se pinta lo guardado al instante y se revalida contra el
   backend. La seleccion de nivel y la de preguntas comparten la misma entrada de cache. */
export default function useQuizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await getQuizzes();
      if (!response?.success || !Array.isArray(response.quizzes)) {
        throw new Error('Respuesta del quiz invalida');
      }
      setQuizzes(response.quizzes);
      localStorage.setItem(QUIZ_CACHE_KEY, JSON.stringify(response.quizzes));
      setFailed(false);
    } catch (error) {
      console.error('Error loading quiz:', error);
      setFailed(true);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // La cache de antes no trae pesos ni tramos; ya no se lee, solo se borra.
    localStorage.removeItem(OLD_QUIZ_CACHE_KEY);
    const cached = readCache<Quiz[]>(QUIZ_CACHE_KEY);
    if (Array.isArray(cached)) {
      setQuizzes(cached);
      setLoading(false);
    }
    void load();
  }, [load]);

  return { quizzes, loading, failed, isRefreshing, reload: load };
}
