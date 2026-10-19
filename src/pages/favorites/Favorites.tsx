import React, { useEffect, useState } from 'react';
import { IonButton, IonContent, IonIcon, IonPage, IonText } from '@ionic/react';
import { heartOutline } from 'ionicons/icons';
import { useHistory } from 'react-router';
import { getArticles, getPresentations } from '../../api/content';
import AppBarPopOver from '../../components/layout/AppBarPopOver';
import DocumentCard from '../../components/DocumentCard';
import useFavorites from '../../hooks/useFavorites';
import { Article, Presentation } from '../../components/ArticleCarrousel';
import useMediaQuery, { DESKTOP_QUERY } from '../../hooks/useMediaQuery';
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

const FILTERS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'article', label: 'Artículos' },
  { value: 'presentation', label: 'Presentaciones' },
];

const Favorites: React.FC = () => {
  const history = useHistory();
  const { favorites, loading: favLoading, isLoggedIn, isFavorite, removeFavorite, addFavorite } = useFavorites();
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [allPresentations, setAllPresentations] = useState<Presentation[]>([]);
  const [contentLoading, setContentLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const isDesktop = useMediaQuery(DESKTOP_QUERY);

  useEffect(() => {
    if (!isLoggedIn) {
      history.replace('/');
      return;
    }
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
      const art = allArticles.find(a => a._id === fav.content_id);
      if (art) return { id: art._id, type: 'article', name: art.title, image: art.image, description: art.subtitle, category: art.category };
    } else {
      const pres = allPresentations.find(p => p._id === fav.content_id);
      if (pres) return { id: pres._id, type: 'presentation', name: pres.name, image: pres.cover || pres.slides?.[0] || '', description: '' };
    }
    return null;
  }).filter((item): item is FavoriteItem => item !== null);

  const isLoading = favLoading || contentLoading;

  /* El filtro solo existe en escritorio: en mobile la lista sigue completa, como siempre. */
  const activeFilter = isDesktop ? typeFilter : 'all';
  const visibleItems = activeFilter === 'all' ? resolvedItems : resolvedItems.filter(i => i.type === activeFilter);
  const countOf = (value: TypeFilter) => value === 'all' ? resolvedItems.length : resolvedItems.filter(i => i.type === value).length;

  return (
    <IonPage>
      <AppBarPopOver />
      <IonContent fullscreen class='app-dark-bg'>
        <div className='favorites-container'>
          <header className='favorites-header'>
            <h2 className='favorites-title'>Favoritos</h2>
            {isDesktop && !isLoading && resolvedItems.length > 0 && (
              <p className='favorites-count'>
                {resolvedItems.length} {resolvedItems.length === 1 ? 'guardado' : 'guardados'}
              </p>
            )}
          </header>

          {isDesktop && !isLoading && resolvedItems.length > 0 && (
            <div className='filter-pills favorites-pills'>
              {FILTERS.filter(f => f.value === 'all' || countOf(f.value) > 0).map(f => (
                <button
                  key={f.value}
                  className={`filter-pill ${typeFilter === f.value ? 'filter-pill--active' : ''}`}
                  onClick={() => setTypeFilter(f.value)}
                >
                  {f.label} <span className='favorites-pill__count'>{countOf(f.value)}</span>
                </button>
              ))}
            </div>
          )}

          {isLoading && (
            <div className='favorites-skeleton-list'>
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

          {!isLoading && resolvedItems.length === 0 && (isDesktop ? (
            <div className='favorites-empty-desk'>
              <div className='favorites-empty-desk__icon'><IonIcon icon={heartOutline} aria-hidden='true' /></div>
              <h3 className='favorites-empty-desk__title'>Todavía no guardas nada</h3>
              <p className='favorites-empty-desk__text'>
                Toca el corazón de cualquier artículo o presentación y quedará aquí, a la mano para cuando lo necesites.
              </p>
              <IonButton routerLink='/tab1' routerDirection='none' className='favorites-empty-desk__btn'>
                Explorar Aprende
              </IonButton>
            </div>
          ) : (
            <div className='favorites-empty'>
              <IonText>
                <p>Aún no tienes favoritos.</p>
                <p>Guarda artículos o presentaciones tocando el corazón en la lista.</p>
              </IonText>
            </div>
          ))}

          {/* Contenedor neutro en mobile (las tarjetas se apilan igual que antes); en
              escritorio es la cuadricula. */}
          {!isLoading && visibleItems.length > 0 && (
            <div className='favorites-grid'>
              {visibleItems.map(item => (
                <DocumentCard
                  key={item.id}
                  name={item.name}
                  description={item.description}
                  img_url={item.image}
                  id={item.id}
                  type={item.type}
                  category={isDesktop ? item.category : undefined}
                  imgAuthor={undefined}
                  imgPage={undefined}
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
