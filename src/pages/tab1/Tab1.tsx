import { IonContent, IonHeader, IonPage } from '@ionic/react';
import React, { useCallback, useEffect, useState } from 'react';
import { getArticles, getPresentations } from '../../api/content';
import ArticleCarrousel, { Article, Presentation } from '../../components/ArticleCarrousel';
import AppBarPopOver from '../../components/layout/AppBarPopOver';
import { readCache } from '../../utils/cache';

const Tab1: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadContent = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [articleResponse, presentationResponse] = await Promise.allSettled([
        getArticles(),
        getPresentations(),
      ]);
      const articlesOk = articleResponse.status === 'fulfilled'
        && articleResponse.value?.success === true
        && Array.isArray(articleResponse.value.articles);
      const presentationsOk = presentationResponse.status === 'fulfilled'
        && presentationResponse.value?.success === true
        && Array.isArray(presentationResponse.value.presentations);

      if (articlesOk && articleResponse.status === 'fulfilled') {
        const updated = [...articleResponse.value.articles].reverse();
        setArticles(updated);
        localStorage.setItem('articles', JSON.stringify(updated));
      }
      if (presentationsOk && presentationResponse.status === 'fulfilled') {
        const updated = presentationResponse.value.presentations;
        setPresentations(updated);
        localStorage.setItem('presentations', JSON.stringify(updated));
      }
      setLoadError(!articlesOk || !presentationsOk);
    } catch (error) {
      console.error('Error loading content:', error);
      setLoadError(true);
    } finally {
      setLoadingData(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const cachedArticles = readCache<Article[]>('articles');
    const cachedPresentations = readCache<Presentation[]>('presentations');
    if (Array.isArray(cachedArticles)) setArticles(cachedArticles);
    if (Array.isArray(cachedPresentations)) setPresentations(cachedPresentations);
    if (Array.isArray(cachedArticles) || Array.isArray(cachedPresentations)) setLoadingData(false);
    void loadContent();
  }, [loadContent]);

  return (
    <IonPage>
      <AppBarPopOver />
      <IonContent fullscreen class='app-dark-bg'>
        <IonHeader collapse="condense" />
        {loadError && (
          <div className='content-load-error' role='alert'>
            <h2 className='content-load-error__title'>No pudimos cargar todo el contenido</h2>
            <p className='content-load-error__description'>
              {articles.length || presentations.length
                ? 'Puedes seguir consultando los recursos disponibles. Intenta actualizar nuevamente.'
                : 'Revisa tu conexión e intenta cargar el contenido otra vez.'}
            </p>
            <button
              type='button'
              className='content-load-error__button'
              disabled={isRefreshing}
              onClick={() => void loadContent()}
            >
              {isRefreshing ? 'Reintentando...' : 'Reintentar'}
            </button>
          </div>
        )}
        <ArticleCarrousel
          articlesData={articles}
          loadingData={loadingData}
          presentations={presentations}
          loadError={loadError}
        />
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
