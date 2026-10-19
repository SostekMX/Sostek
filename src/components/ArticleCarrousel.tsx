import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import { chevronBack, chevronForward, heart, heartOutline } from 'ionicons/icons';
import DocumentCard from './DocumentCard';
import './ArticleCarrousel.css';
import AppContext from '../context/AppContext';
import useFavorites from '../hooks/useFavorites';
import { normalize, CATEGORY_RECOMMENDATIONS } from '../utils/search';
import { axisOf } from '../utils/axis';
import useMediaQuery, { DESKTOP_QUERY } from '../hooks/useMediaQuery';

export interface Article {
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
  tags: string[];
}

export interface Presentation {
  _id: string;
  name: string;
  cover?: string;
  slides: string[];
}

interface Props {
  articlesData: Article[] | null | undefined;
  loadingData: boolean;
  presentations: Presentation[] | null | undefined;
}

const ALL = 'Todos';

/* Cuantos articulos ocupa la portada de escritorio: uno grande y cuatro al lado. */
const FEATURE_COUNT = 5;

const axisClass = (category?: string) => {
  const axis = axisOf(category);
  return axis ? `axis-${axis}` : '';
};

const ArticleCarrousel: React.FC<Props> = ({ articlesData, loadingData, presentations }) => {
  const [topic, setTopic] = useState(ALL);
  const { search } = useContext(AppContext);
  const { isLoggedIn, isFavorite, addFavorite, removeFavorite } = useFavorites();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const presRowRef = useRef<HTMLDivElement>(null);
  const [presOverflow, setPresOverflow] = useState(false);

  const searchNorm = normalize(search);
  const recommendedCategories = CATEGORY_RECOMMENDATIONS[searchNorm];

  const matchingArticles = useMemo(() => (articlesData ?? []).filter(article => {
    /* Se busca contra categoría, título y tags: el seed de artículos llena `tags`
       (desde la columna keywords del CSV), así que mirar solo la categoría dejaría fuera
       artículos cuyo tema solo aparece ahí. */
    const campos = [article.category, article.title, ...(article.tags ?? [])].map(c => normalize(c ?? ''));
    const terminos = recommendedCategories ?? [searchNorm];
    return terminos.some(termino => campos.some(campo => campo.includes(termino)));
  }), [articlesData, recommendedCategories, searchNorm]);

  /* Los temas salen de los datos, ordenados por cuántos artículos tienen: si mañana se
     siembra una categoría nueva aparece sola. Los conteos siguen a la búsqueda activa. */
  const topics = useMemo(() => {
    const counts = new Map<string, number>();
    matchingArticles.forEach(a => {
      if (a.category) counts.set(a.category, (counts.get(a.category) ?? 0) + 1);
    });
    return Array.from(counts.entries()).sort(([a, x], [b, y]) => (y - x) || a.localeCompare(b));
  }, [matchingArticles]);

  // Si una búsqueda nueva deja fuera el tema elegido, se vuelve a Todos en vez de quedar en blanco.
  const activeTopic = topics.some(([name]) => name === topic) ? topic : ALL;
  const visibleArticles = activeTopic === ALL
    ? matchingArticles
    : matchingArticles.filter(a => a.category === activeTopic);

  const visiblePresentations = (presentations ?? [])
    .filter(pres => normalize(pres.name ?? '').includes(searchNorm));

  /* Portada de revista: solo en escritorio, con "Todos" y sin busqueda, que es cuando la
     lista esta en su orden natural (lo mas nuevo primero). Los articulos de la portada no
     se repiten en la cuadricula de abajo. */
  const showFeature = isDesktop && !loadingData && activeTopic === ALL && !searchNorm
    && visibleArticles.length > FEATURE_COUNT;
  const [lead, ...sideArticles] = showFeature ? visibleArticles.slice(0, FEATURE_COUNT) : [];
  const gridArticles = showFeature ? visibleArticles.slice(FEATURE_COUNT) : visibleArticles;

  /* Las flechas de la fila de presentaciones solo aparecen si la fila no cabe. */
  useEffect(() => {
    const row = presRowRef.current;
    if (!row || !isDesktop) return;
    const check = () => setPresOverflow(row.scrollWidth > row.clientWidth + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(row);
    return () => ro.disconnect();
  }, [isDesktop, visiblePresentations.length, loadingData]);

  const scrollPres = (dir: 1 | -1) =>
    presRowRef.current?.scrollBy({ left: dir * presRowRef.current.clientWidth * 0.8, behavior: 'smooth' });

  const skeletons = Array.from({ length: 4 }).map((_, i) => (
    <div key={i} className='doc-card-skeleton'>
      <div className='doc-card-skeleton__image shimmer' />
      <div className='doc-card-skeleton__body'>
        <div className='doc-card-skeleton__badge shimmer' />
        <div className='doc-card-skeleton__title shimmer' />
        <div className='doc-card-skeleton__desc shimmer' />
      </div>
    </div>
  ));

  return (
    <div className='aprende-page'>
      <header className='aprende-header'>
        <h1 className='aprende-header__title'>Aprende</h1>
        <p className='aprende-header__subtitle'>
          Artículos y presentaciones sobre sostenibilidad, escritos por la comunidad SOSTEK.
          {' '}{isDesktop ? 'Filtra por tema o usa el buscador de arriba.' : 'Filtra por tema o busca con la lupa.'}
        </p>
      </header>

      {showFeature && lead && (
        <section className='aprende-feature' aria-label='Lo más reciente'>
          <div className='aprende-lead-wrap'>
            <Link to={`/Documents/${lead._id}`} className={`aprende-lead ${axisClass(lead.category)}`}>
              <img src={lead.image} alt='' className='aprende-lead__img' />
              <div className='aprende-lead__body'>
                {lead.category && <span className='aprende-axis-chip'>{lead.category}</span>}
                <h2 className='aprende-lead__title'>{lead.title}</h2>
                {lead.subtitle && <p className='aprende-lead__subtitle'>{lead.subtitle}</p>}
                {lead.author && <p className='aprende-lead__author'>Por {lead.author}</p>}
              </div>
            </Link>
            {isLoggedIn && (
              <button
                className={`document-card__fav-btn aprende-lead__fav ${isFavorite(lead._id) ? 'document-card__fav-btn--active' : ''}`}
                aria-label={isFavorite(lead._id) ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                aria-pressed={isFavorite(lead._id)}
                onClick={() => isFavorite(lead._id) ? removeFavorite(lead._id) : addFavorite(lead._id, 'article')}
              >
                <IonIcon icon={isFavorite(lead._id) ? heart : heartOutline} />
              </button>
            )}
          </div>

          <div className='aprende-side'>
            <h2 className='aprende-side__title'>También reciente</h2>
            {sideArticles.map(article => (
              <Link key={article._id} to={`/Documents/${article._id}`} className={`aprende-side__item ${axisClass(article.category)}`}>
                <img src={article.image} alt='' className='aprende-side__img' loading='lazy' />
                <span className='aprende-side__text'>
                  {article.category && <span className='aprende-side__axis'>{article.category}</span>}
                  <span className='aprende-side__name'>{article.title}</span>
                  {article.author && <span className='aprende-side__author'>{article.author}</span>}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {!loadingData && visiblePresentations.length > 0 && (
        <section className='aprende-section'>
          <div className='aprende-section__head'>
            <h2 className='aprende-section__title'>Presentaciones</h2>
            {isDesktop && presOverflow && (
              <div className='aprende-row-nav'>
                <button className='aprende-row-nav__btn' aria-label='Presentaciones anteriores' onClick={() => scrollPres(-1)}>
                  <IonIcon icon={chevronBack} />
                </button>
                <button className='aprende-row-nav__btn' aria-label='Más presentaciones' onClick={() => scrollPres(1)}>
                  <IonIcon icon={chevronForward} />
                </button>
              </div>
            )}
          </div>
          <div className='aprende-grid aprende-grid--row' ref={presRowRef}>
            {visiblePresentations.map(pres => (
              <DocumentCard
                key={pres._id}
                name={pres.name}
                description=""
                img_url={pres.cover || pres.slides?.[0] || ''}
                id={pres._id}
                type="presentation"
                meta={`${pres.slides?.length ?? 0} diapositivas`}
                imgAuthor={undefined}
                imgPage={undefined}
                isLoggedIn={isLoggedIn}
                isFavorite={isFavorite(pres._id)}
                onToggleFavorite={() =>
                  isFavorite(pres._id) ? removeFavorite(pres._id) : addFavorite(pres._id, 'presentation')
                }
              />
            ))}
          </div>
        </section>
      )}

      <section className='aprende-section'>
        <h2 className='aprende-section__title'>{showFeature ? 'Más artículos' : 'Artículos'}</h2>

        {!loadingData && topics.length > 1 && (
          <div className='filter-pills aprende-pills'>
            {[[ALL, matchingArticles.length] as [string, number], ...topics].map(([name, count]) => (
              <button
                key={name}
                className={`filter-pill ${activeTopic === name ? 'filter-pill--active' : ''} ${axisClass(name)}`}
                onClick={() => setTopic(name)}
              >
                {name} <span className='aprende-pill__count'>{count}</span>
              </button>
            ))}
          </div>
        )}

        <div className='aprende-grid aprende-grid--list'>
          {loadingData && skeletons}
          {!loadingData && gridArticles.map(article => (
            <DocumentCard
              key={article._id}
              name={article.title}
              description={article.subtitle || article.body}
              img_url={article.image}
              id={article._id}
              type={article.type}
              category={article.category}
              meta={article.author}
              imgAuthor={article.author_image || undefined}
              imgPage={article.page_image || undefined}
              isLoggedIn={isLoggedIn}
              isFavorite={isFavorite(article._id)}
              onToggleFavorite={() =>
                isFavorite(article._id) ? removeFavorite(article._id) : addFavorite(article._id, 'article')
              }
            />
          ))}
        </div>

        {!loadingData && visibleArticles.length === 0 && (
          <p className='aprende-empty'>
            {search ? `No hay artículos que coincidan con “${search}”.` : 'Todavía no hay artículos publicados.'}
          </p>
        )}
      </section>
    </div>
  );
};

export default ArticleCarrousel;
