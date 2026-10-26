import React, { useEffect, useRef, useState } from 'react';
import { IonContent, IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonButton, IonIcon, IonList, IonItem, IonLabel, IonPopover, IonTitle, ScrollDetail, useIonRouter } from '@ionic/react';
import { menuOutline, heart, heartOutline, personCircle, logOut, arrowBackOutline } from 'ionicons/icons';
import { useParams } from 'react-router';
import { useHistory } from 'react-router-dom';
import { getArticle } from '../../api/content';
import { clearSession, isLoggedIn } from '../../utils/session';
import { axisOf } from '../../utils/axis';
import useFavorites from '../../hooks/useFavorites';
import useMediaQuery, { DESKTOP_QUERY } from '../../hooks/useMediaQuery';
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
  bibliography?: string;
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
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const scrollElRef = useRef<HTMLElement | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const toolbarTitleRef = useRef<HTMLIonTitleElement>(null);

  const isUserLogged = isLoggedIn();

  useEffect(() => {
    // Ionic reusa la pagina entre ids: sin este reinicio un fallo dejaba el articulo anterior.
    setArticle(null);
    setLoadingData(true);
    getArticle(id)
      .then(data => {
        if (data.success) setArticle(data.article);
      })
      .catch(err => console.error(err))
      .finally(() => setLoadingData(false));
  }, [id]);

  /* Progreso de lectura y titulo en el toolbar: se escriben directo en el DOM porque el
     evento llega en cada frame de scroll y no hace falta re-renderizar el articulo entero. */
  async function handleScroll(e: CustomEvent<ScrollDetail>) {
    if (!scrollElRef.current) {
      scrollElRef.current = await (e.target as HTMLIonContentElement).getScrollElement();
    }
    const el = scrollElRef.current;
    const max = el.scrollHeight - el.clientHeight;
    const progress = max > 0 ? Math.min(1, e.detail.scrollTop / max) : 0;
    progressRef.current?.style.setProperty('transform', `scaleX(${progress})`);
    toolbarTitleRef.current?.classList.toggle('docd-toolbar-title--visible', e.detail.scrollTop > 340);
  }

  function logOutUser() {
    clearSession();
    history.replace('/');
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="dark-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tab1" text={isDesktop ? 'Aprende' : ''} />
          </IonButtons>
          {/* En escritorio el titulo aparece en la barra cuando la portada ya salio de la vista. */}
          {isDesktop && article && (
            <IonTitle ref={toolbarTitleRef} className="docd-toolbar-title">{article.title}</IonTitle>
          )}
          <IonButtons slot="end">
            <IonButton id={popoverId} className="dark-toolbar__menu-btn">
              <IonIcon slot="icon-only" icon={menuOutline} />
            </IonButton>
            <IonPopover trigger={popoverId} triggerAction="click">
              <IonList>
                {isUserLogged && <IonItem href="/Favorites"><IonIcon icon={heart} color="secondary" />&nbsp;<IonLabel>Favoritos</IonLabel></IonItem>}
                {isUserLogged && <IonItem href="/Profile"><IonIcon icon={personCircle} color="secondary" />&nbsp;<IonLabel>Perfil</IonLabel></IonItem>}
                {!isUserLogged && <IonItem href="/"><IonIcon icon={personCircle} color="secondary" />&nbsp;<IonLabel>Iniciar Sesión</IonLabel></IonItem>}
                {isUserLogged && <IonItem onClick={logOutUser}><IonIcon icon={logOut} color="secondary" />&nbsp;<IonLabel>Log Out</IonLabel></IonItem>}
              </IonList>
            </IonPopover>
          </IonButtons>
        </IonToolbar>
        {isDesktop && article && (
          <div className={`docd-progress axis-${axisOf(article.category) ?? 'ambiental'}`} aria-hidden="true">
            <div ref={progressRef} className="docd-progress__fill" />
          </div>
        )}
      </IonHeader>

      <IonContent
        fullscreen
        class={isDesktop ? 'docd-content' : 'app-dark-bg'}
        scrollEvents={isDesktop}
        onIonScroll={isDesktop ? handleScroll : undefined}
      >
        {isDesktop && <ArticleDesktop article={article} loading={loadingData} />}
        {!isDesktop && <>
        {loadingData && (
          <div className="doc-skeleton">
            <div className="doc-skeleton__hero shimmer" />
            <div className="doc-skeleton__content">
              <div className="doc-skeleton__badge shimmer" />
              <div className="doc-skeleton__title shimmer" />
              <div className="doc-skeleton__subtitle shimmer" />
              <div className="doc-skeleton__divider shimmer" />
              <div className="doc-skeleton__line shimmer" />
              <div className="doc-skeleton__line shimmer" />
              <div className="doc-skeleton__line doc-skeleton__line--short shimmer" />
              <div className="doc-skeleton__line shimmer" />
              <div className="doc-skeleton__line doc-skeleton__line--mid shimmer" />
            </div>
          </div>
        )}

        {!loadingData && !article && (
          <p className="page-message">
            No pudimos cargar este art&iacute;culo. Puede que ya no est&eacute; publicado o que no haya conexi&oacute;n.
          </p>
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

              {article.bibliography && (
                <div className="doc-bibliography">
                  <div className="doc-divider" />
                  <p className="doc-bibliography__label">Bibliografía</p>
                  {article.bibliography.split('\n').filter(l => l.trim()).map((line, i) => (
                    <p key={i} className="doc-bibliography__entry">{line}</p>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
        </>}
      </IonContent>
    </IonPage>
  );
};

/* Escritorio: lectura de revista. Portada a lo ancho con el titulo encima, texto a ~68
   caracteres y una columna lateral pegajosa con los datos del articulo. Es un render aparte
   para que la version mobile de arriba no cambie en nada. */
const ArticleDesktop: React.FC<{ article: Article | null; loading: boolean }> = ({ article, loading }) => {
  const router = useIonRouter();

  if (loading) {
    return (
      <div className="docd" aria-busy="true">
        <div className="docd-hero docd-hero--skeleton shimmer" />
        <div className="docd-layout">
          <div className="docd-body">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className={`docd-skeleton__line shimmer${i % 4 === 3 ? ' docd-skeleton__line--short' : ''}`} />
            ))}
          </div>
          <div className="docd-aside">
            <div className="docd-skeleton__aside shimmer" />
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="docd-error">
        <p className="docd-error__title">No pudimos cargar este art&iacute;culo</p>
        <p className="docd-error__text">
          Puede que ya no est&eacute; publicado o que no haya conexi&oacute;n. Revisa tu conexi&oacute;n y vuelve a intentarlo.
        </p>
        <button className="docd-button" onClick={() => router.push('/tab1', 'back')}>
          <IonIcon icon={arrowBackOutline} aria-hidden="true" />
          Volver a Aprende
        </button>
      </div>
    );
  }

  const axis = axisOf(article.category);
  const paragraphs = article.body.split('\n').filter(p => p.trim());
  const minutes = Math.max(1, Math.round(article.body.split(/\s+/).length / 200));
  const bibliography = (article.bibliography ?? '').split('\n').filter(l => l.trim());

  return (
    <div className={`docd axis-${axis ?? 'ambiental'}`}>
      <header className="docd-hero">
        <img src={article.image} alt="" className="docd-hero__img" decoding="async" />
        <div className="docd-hero__inner">
          <div className="docd-hero__text">
            {article.category && <span className="docd-chip">{article.category}</span>}
            <h1 className="docd-title">{article.title}</h1>
            {article.subtitle && <p className="docd-subtitle">{article.subtitle}</p>}
          </div>
        </div>
      </header>

      <div className="docd-layout">
        <article className="docd-body">
          {paragraphs.map((para, i) => <p key={i}>{para}</p>)}

          {bibliography.length > 0 && (
            <section className="docd-biblio" aria-labelledby="docd-biblio-title">
              <h2 id="docd-biblio-title" className="docd-biblio__title">Bibliograf&iacute;a</h2>
              <ol className="docd-biblio__list">
                {bibliography.map((line, i) => <li key={i}>{line}</li>)}
              </ol>
            </section>
          )}
        </article>

        <ArticleAside article={article} minutes={minutes} />
      </div>
    </div>
  );
};

/* Componente aparte para que useFavorites (que pide los favoritos al backend) solo corra
   en escritorio. */
const ArticleAside: React.FC<{ article: Article; minutes: number }> = ({ article, minutes }) => {
  const router = useIonRouter();
  const { isLoggedIn, isFavorite, addFavorite, removeFavorite } = useFavorites();
  const saved = isFavorite(article._id);
  const credit = [
    article.page_image && `de ${article.page_image}`,
    article.author_image && `por ${article.author_image}`,
  ].filter(Boolean).join(' ');

  return (
    <aside className="docd-aside" aria-label="Sobre este artículo">
      <dl className="docd-facts">
        {article.author && (
          <div className="docd-fact">
            <dt>Escrito por</dt>
            <dd className="docd-fact__author">{article.author}</dd>
          </div>
        )}
        <div className="docd-fact">
          <dt>Lectura</dt>
          <dd>{minutes} min</dd>
        </div>
        {credit && (
          <div className="docd-fact docd-fact--credit">
            <dt>Imagen</dt>
            <dd>{credit}</dd>
          </div>
        )}
      </dl>

      <div className="docd-actions">
        {isLoggedIn && (
          <button
            className={`docd-button docd-button--fav${saved ? ' docd-button--saved' : ''}`}
            aria-pressed={saved}
            onClick={() => (saved ? removeFavorite(article._id) : addFavorite(article._id, 'article'))}
          >
            <IonIcon icon={saved ? heart : heartOutline} aria-hidden="true" />
            {saved ? 'Guardado en favoritos' : 'Guardar en favoritos'}
          </button>
        )}
        <button className="docd-button docd-button--quiet" onClick={() => router.push('/tab1', 'back')}>
          <IonIcon icon={arrowBackOutline} aria-hidden="true" />
          Volver a Aprende
        </button>
      </div>
    </aside>
  );
};

export default Documents;
