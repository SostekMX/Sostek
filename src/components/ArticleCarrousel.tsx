import React, { useContext, useMemo, useState } from 'react';
import DocumentCard from './DocumentCard';
import './ArticleCarrousel.css';
import AppContext from '../context/AppContext';
import useFavorites from '../hooks/useFavorites';
import { normalize, CATEGORY_RECOMMENDATIONS } from '../utils/search';

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

const ArticleCarrousel: React.FC<Props> = ({ articlesData, loadingData, presentations }) => {
  const [topic, setTopic] = useState(ALL);
  const { search } = useContext(AppContext);
  const { isLoggedIn, isFavorite, addFavorite, removeFavorite } = useFavorites();

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
          Filtra por tema o busca con la lupa.
        </p>
      </header>

      {!loadingData && visiblePresentations.length > 0 && (
        <section className='aprende-section'>
          <h2 className='aprende-section__title'>Presentaciones</h2>
          <div className='aprende-grid aprende-grid--row'>
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
        <h2 className='aprende-section__title'>Artículos</h2>

        {!loadingData && topics.length > 1 && (
          <div className='filter-pills aprende-pills'>
            {[[ALL, matchingArticles.length] as [string, number], ...topics].map(([name, count]) => (
              <button
                key={name}
                className={`filter-pill ${activeTopic === name ? 'filter-pill--active' : ''}`}
                onClick={() => setTopic(name)}
              >
                {name} <span className='aprende-pill__count'>{count}</span>
              </button>
            ))}
          </div>
        )}

        <div className='aprende-grid aprende-grid--list'>
          {loadingData && skeletons}
          {!loadingData && visibleArticles.map(article => (
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
