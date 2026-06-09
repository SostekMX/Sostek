import React, { useEffect, useRef, useState } from 'react';
import { IonContent, IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonButton, IonIcon, IonList, IonItem, IonLabel, IonPopover } from '@ionic/react';
import { menuOutline, heart, personCircle, settings, logOut } from 'ionicons/icons';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_URL } from '../../config';
import './Documents.css';

interface Article {
  _id: string;
  title: string;
  subtitle: string;
  type: string;
  body: string;
  image: string;
  author: string;
  author_image: string;
  page_image: string;
  category: string;
}

interface RouteParams {
  id: string;
}

const Documents: React.FC = () => {
  const { id } = useParams<RouteParams>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const { current: popoverId } = useRef(`doc-menu-${Math.random().toString(36).substr(2, 6)}`);
  const history = useHistory();
  useLocation();

  const isUserLogged = localStorage.getItem('login') === 'true';

  useEffect(() => {
    axios.get(`${BACKEND_URL}/articles/${id}`)
      .then(res => {
        if (res.data.success) setArticle(res.data.article);
      })
      .catch(err => console.log(err))
      .finally(() => setLoadingData(false));
  }, [id]);

  function logOutUser() {
    localStorage.setItem('login', 'false');
    localStorage.removeItem('token');
    history.replace('/');
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tab1" text="" />
          </IonButtons>
          <IonButtons slot="end">
            <IonButton id={popoverId}>
              <IonIcon slot="icon-only" icon={menuOutline} />
            </IonButton>
            <IonPopover trigger={popoverId} triggerAction="click">
              <IonList>
                {isUserLogged && <IonItem href="/Favorites"><IonIcon icon={heart} color="secondary" />&nbsp;<IonLabel>Favoritos</IonLabel></IonItem>}
                {isUserLogged && <IonItem href="/Profile"><IonIcon icon={personCircle} color="secondary" />&nbsp;<IonLabel>Perfil</IonLabel></IonItem>}
                {!isUserLogged && <IonItem href="/"><IonIcon icon={personCircle} color="secondary" />&nbsp;<IonLabel>Iniciar Sesión</IonLabel></IonItem>}
                {isUserLogged && <IonItem><IonIcon icon={settings} color="secondary" />&nbsp;<IonLabel>Ajustes</IonLabel></IonItem>}
                {isUserLogged && <IonItem onClick={logOutUser}><IonIcon icon={logOut} color="secondary" />&nbsp;<IonLabel>Log Out</IonLabel></IonItem>}
              </IonList>
            </IonPopover>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen class="app-dark-bg">
        {loadingData && (
          <img
            className="doc-spinner"
            src="/assets/Spinner-1s-200px_transparent.svg"
            alt="cargando"
          />
        )}

        {!loadingData && article && (
          <>
            <div className="doc-hero">
              <img src={article.image} alt={article.title} className="doc-hero__img" loading="lazy" decoding="async" />
            </div>

            <div className="doc-content">
              {(article.page_image || article.author_image) && (
                <p className="doc-image-credit">
                  Imagen
                  {article.page_image && ` de ${article.page_image}`}
                  {article.author_image && ` por ${article.author_image}`}
                </p>
              )}

              <span className="doc-category-badge">{article.category}</span>
              <h1 className="doc-title">{article.title}</h1>
              {article.subtitle && <p className="doc-subtitle">{article.subtitle}</p>}
              {article.author && <p className="doc-author">{article.author}</p>}

              <div className="doc-divider" />

              <div className="doc-body">
                {article.body.split('\n').filter(p => p.trim()).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Documents;
