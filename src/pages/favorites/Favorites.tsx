import React, { useEffect, useState } from 'react';
import { IonContent, IonPage, IonText } from '@ionic/react';
import { useHistory } from 'react-router';
import axios from 'axios';
import { BACKEND_URL } from '../../config';
import AppBarPopOver from '../../components/layout/AppBarPopOver';
import DocumentCard from '../../components/DocumentCard';
import useFavorites from '../../hooks/useFavorites';
import { Article, Presentation } from '../../components/ArticleCarrousel';
import './Favorites.css';

interface FavoriteItem {
  id: string;
  type: 'article' | 'presentation';
  name: string;
  image: string;
  description: string;
}

const Favorites: React.FC = () => {
  const history = useHistory();
  const { favorites, loading: favLoading, isLoggedIn, isFavorite, removeFavorite, addFavorite } = useFavorites();
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [allPresentations, setAllPresentations] = useState<Presentation[]>([]);
  const [contentLoading, setContentLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      history.replace('/');
      return;
    }
    Promise.all([
      axios.get(`${BACKEND_URL}/articles`),
      axios.get(`${BACKEND_URL}/presentations`),
    ]).then(([artRes, presRes]) => {
      if (artRes.data.success) setAllArticles(artRes.data.articles);
      if (presRes.data.success) setAllPresentations(presRes.data.presentations);
    }).catch(err => console.log(err))
      .finally(() => setContentLoading(false));
  }, []);

  const resolvedItems: FavoriteItem[] = favorites.map(fav => {
    if (fav.type === 'article') {
      const art = allArticles.find(a => a._id === fav.content_id);
      if (art) return { id: art._id, type: 'article', name: art.title, image: art.image, description: art.subtitle };
    } else {
      const pres = allPresentations.find(p => p._id === fav.content_id);
      if (pres) return { id: pres._id, type: 'presentation', name: pres.name, image: pres.slides[0] ?? '', description: '' };
    }
    return null;
  }).filter((item): item is FavoriteItem => item !== null);

  const isLoading = favLoading || contentLoading;

  return (
    <IonPage>
      <AppBarPopOver />
      <IonContent fullscreen class='app-dark-bg'>
        <div className='favorites-container'>
          <h2 className='favorites-title'>Favoritos</h2>

          {isLoading && (
            <img
              className="imageArticleLoading visible"
              src="/assets/Spinner-1s-200px_transparent.svg"
              alt="cargando"
              style={{ position: 'fixed' }}
            />
          )}

          {!isLoading && resolvedItems.length === 0 && (
            <div className='favorites-empty'>
              <IonText>
                <p>Aún no tienes favoritos.</p>
                <p>Guarda artículos o presentaciones tocando el corazón en la lista.</p>
              </IonText>
            </div>
          )}

          {!isLoading && resolvedItems.map(item => (
            <DocumentCard
              key={item.id}
              name={item.name}
              description={item.description}
              img_url={item.image}
              id={item.id}
              type={item.type}
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
      </IonContent>
    </IonPage>
  );
};

export default Favorites;
