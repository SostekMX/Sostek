import React, { useEffect, useState } from 'react';
import { IonContent, IonIcon, IonPage, useIonRouter, useIonViewWillEnter } from '@ionic/react';
import { Button, SegmentedControl } from 'glisse';
import { heartOutline } from 'ionicons/icons';
import { getArticles, getPresentations } from '../../api/content';
import AppBarPopOver from '../../components/layout/AppBarPopOver';
import DocumentCard from '../../components/DocumentCard';
import useFavorites from '../../hooks/useFavorites';
import { Article, Presentation } from '../../components/ArticleCarrousel';
import { readCache } from '../../utils/cache';
import { TKey, useI18n } from '../../i18n/LanguageContext';
import './Favorites.css';

interface FavoriteItem {
  id: string;
  type: 'article' | 'presentation';
  name: string;
  image: string;
  description: string;
  category?: string;
}

type TypeFilter = 'all' | FavoriteItem['type'];

const FILTERS: { value: TypeFilter; label: TKey }[] = [
  { value: 'all', label: 'fav.all' },
  { value: 'article', label: 'fav.articles' },
  { value: 'presentation', label: 'fav.presentations' },
];

const Favorites: React.FC = () => {
  const { t, localizeArticle } = useI18n();
  const { favorites, loading: favLoading, isLoggedIn, isFavorite, removeFavorite, addFavorite, refresh } = useFavorites();
  const router = useIonRouter();
  // Arranca con la cache que llena APRENDE; la peticion de abajo la pone al dia.
  const [allArticles, setAllArticles] = useState<Article[]>(() => readCache<Article[]>('articles') ?? []);
  const [allPresentations, setAllPresentations] = useState<Presentation[]>(() => readCache<Presentation[]>('presentations') ?? []);
  const [contentLoading, setContentLoading] = useState(() => readCache('articles') === null);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  /* Ionic deja la pagina montada: al volver hay que traer lo que se guardo en otra pantalla. */
  useIonViewWillEnter(refresh, [refresh]);

  useEffect(() => {
    Promise.all([
      getArticles(),
      getPresentations(),
    ]).then(([articlesData, presentationsData]) => {
      if (articlesData.success) setAllArticles(articlesData.articles);
      if (presentationsData.success) setAllPresentations(presentationsData.presentations);
    }).catch(err => console.error(err))
      .finally(() => setContentLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resolvedItems: FavoriteItem[] = favorites.map(fav => {
    if (fav.type === 'article') {
      const found = allArticles.find(a => a._id === fav.content_id);
      const art = found && localizeArticle(found);
      if (art && found) return { id: art._id, type: 'article', name: art.title, image: art.image, description: art.subtitle, category: found.category };
    } else {
      const pres = allPresentations.find(p => p._id === fav.content_id);
      if (pres) return { id: pres._id, type: 'presentation', name: pres.name, image: pres.cover || pres.slides?.[0] || '', description: '' };
    }
    return null;
  }).filter((item): item is FavoriteItem => item !== null);

  const isLoading = favLoading || contentLoading;

  const visibleItems = typeFilter === 'all' ? resolvedItems : resolvedItems.filter(i => i.type === typeFilter);
  const countOf = (value: TypeFilter) => value === 'all' ? resolvedItems.length : resolvedItems.filter(i => i.type === value).length;

  return (
    <IonPage>
      <AppBarPopOver />
      <IonContent fullscreen>
        <div className='page favorites'>
          <header className='page-head'>
            <h1 className='page-head__title'>{t('fav.title')}</h1>
            {!isLoading && resolvedItems.length > 0 && (
              <p className='page-head__lead'>
                {t(resolvedItems.length === 1 ? 'fav.savedOne' : 'fav.savedMany', { n: resolvedItems.length })}
              </p>
            )}
          </header>

          {!isLoading && resolvedItems.length > 0 && countOf('article') > 0 && countOf('presentation') > 0 && (
            <div className='segmented-wide favorites__filter'>
              <SegmentedControl
                aria-label={t('fav.title')}
                items={FILTERS.map(f => ({ value: f.value, label: `${t(f.label)} ${countOf(f.value)}` }))}
                value={typeFilter}
                onValueChange={v => setTypeFilter(v as TypeFilter)}
              />
            </div>
          )}

          {isLoading && (
            <div className='favorites__grid'>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className='doc-card-skeleton'>
                  <div className='doc-card-skeleton__image shimmer' />
                  <div className='doc-card-skeleton__body'>
                    <div className='doc-card-skeleton__badge shimmer' />
                    <div className='doc-card-skeleton__title shimmer' />
                    <div className='doc-card-skeleton__desc shimmer' />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && resolvedItems.length === 0 && (
            <div className='favorites__empty'>
              <IonIcon icon={heartOutline} aria-hidden='true' />
              <h2 className='favorites__empty-title'>{t('fav.emptyTitle')}</h2>
              <p>{t('fav.emptyText')}</p>
              <Button variant='filled' className='btn-lg' onClick={() => router.push('/tab1', 'none')}>{t('fav.explore')}</Button>
            </div>
          )}

          {!isLoading && visibleItems.length > 0 && (
            <div className='favorites__grid'>
              {visibleItems.map(item => (
                <DocumentCard
                  key={item.id}
                  name={item.name}
                  description={item.description}
                  img_url={item.image}
                  id={item.id}
                  type={item.type}
                  category={item.category}
                  isLoggedIn={isLoggedIn}
                  isFavorite={isFavorite(item.id)}
                  onToggleFavorite={() =>
                    isFavorite(item.id) ? removeFavorite(item.id) : addFavorite(item.id, item.type)
                  }
                />
              ))}
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Favorites;
