import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import { Button, Glass, Input } from 'glisse';
import { chevronBack, chevronForward, closeOutline, heart, heartOutline, searchOutline } from 'ionicons/icons';
import DocumentCard from './DocumentCard';
import './ArticleCarrousel.css';
import AppContext from '../context/AppContext';
import useFavorites from '../hooks/useFavorites';
import { normalize, matchesSearch } from '../utils/search';
import { axisOf } from '../utils/axis';
import { sized } from '../utils/image';
import useMediaQuery, { DESKTOP_QUERY } from '../hooks/useMediaQuery';
import { useI18n } from '../i18n/LanguageContext';

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
  bibliography?: string;
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

const ALL = '__all__';

/* Cuantos articulos ocupa la portada: uno grande y cuatro al lado. */
const FEATURE_COUNT = 5;

const axisClass = (category?: string) => {
  const axis = axisOf(category);
  return axis ? `axis-${axis}` : '';
};

const ArticleCarrousel: React.FC<Props> = ({ articlesData, loadingData, presentations }) => {
  const [topic, setTopic] = useState(ALL);
  const { search, changeSearch } = useContext(AppContext);
  const { t, tx, localizeArticle } = useI18n();
  const { isLoggedIn, isFavorite, addFavorite, removeFavorite } = useFavorites();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const presRowRef = useRef<HTMLDivElement>(null);
  const [presOverflow, setPresOverflow] = useState(false);
  const [query, setQuery] = useState(search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setQuery(search), [search]);

  function onQuery(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => changeSearch!(value), 300);
  }

  function clearQuery() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setQuery('');
    changeSearch!('');
  }

  const searchNorm = normalize(search);

  const matchingArticles = useMemo(
    () => (articlesData ?? []).filter(article => matchesSearch(article, search) || matchesSearch(localizeArticle(article), search)),
    [articlesData, search, localizeArticle]
  );

  /* Los temas salen de los datos, ordenados por cuantos articulos tienen: si manana se
     siembra una categoria nueva aparece sola. Los conteos siguen a la busqueda activa. */
  const topics = useMemo(() => {
    const counts = new Map<string, number>();
    matchingArticles.forEach(a => {
      if (a.category) counts.set(a.category, (counts.get(a.category) ?? 0) + 1);
    });
    return Array.from(counts.entries()).sort(([a, x], [b, y]) => (y - x) || a.localeCompare(b));
  }, [matchingArticles]);

  // Si una busqueda nueva deja fuera el tema elegido, se vuelve a Todos en vez de quedar en blanco.
  const activeTopic = topics.some(([name]) => name === topic) ? topic : ALL;
  const visibleArticles = activeTopic === ALL
    ? matchingArticles
    : matchingArticles.filter(a => a.category === activeTopic);

  const visiblePresentations = (presentations ?? [])
    .filter(pres => normalize(pres.name ?? '').includes(searchNorm));

  /* Portada: con "Todos" y sin busqueda, que es cuando la lista esta en su orden natural
     (lo mas nuevo primero). Sus articulos no se repiten en la cuadricula de abajo. */
  const showCover = !loadingData && activeTopic === ALL && !searchNorm && visibleArticles.length > FEATURE_COUNT;
  const [lead, ...sideArticles] = showCover ? visibleArticles.slice(0, FEATURE_COUNT) : [];
  const gridArticles = showCover ? visibleArticles.slice(FEATURE_COUNT) : visibleArticles;

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

  const skeletons = Array.from({ length: 6 }).map((_, i) => (
    <div key={i} className='doc-card-skeleton'>
      <div className='doc-card-skeleton__image shimmer' />
      <div className='doc-card-skeleton__body'>
        <div className='doc-card-skeleton__badge shimmer' />
        <div className='doc-card-skeleton__title shimmer' />
        <div className='doc-card-skeleton__desc shimmer' />
      </div>
    </div>
  ));

  const localLead = lead && localizeArticle(lead);

  return (
    <div className={`aprende${showCover ? ' aprende--cover' : ''}`}>
      {/* El encabezado no se desmonta al buscar: el campo conserva el foco aunque la portada desaparezca. */}
      <header className='mast'>
        <h1 className='mast__title'>{t('learn.title')}</h1>
        <div className='search' role='search'>
          <Input
            aria-label={t('appbar.openSearch')}
            placeholder={t('appbar.search')}
            icon={<IonIcon icon={searchOutline} aria-hidden='true' />}
            value={query}
            onValueChange={onQuery}
            enterKeyHint='search'
          />
          {query && (
            <button type='button' className='search__clear' aria-label={t('appbar.clearSearch')} onClick={clearQuery}>
              <IonIcon icon={closeOutline} aria-hidden='true' />
            </button>
          )}
        </div>
      </header>

      {showCover && lead && (
        <section className='cover' aria-label={t('learn.latest')}>
          <div className={`cover__frame ${axisClass(lead.category)}`}>
            <img className='cover__img' src={lead.image} alt='' />
            <div className='cover__shade' />
            <Link to={`/Documents/${lead._id}`} className='cover__story'>
              {lead.category && <span className='axis-tag'>{tx(lead.category)}</span>}
              <h2 className='cover__headline'>{localLead.title}</h2>
              {localLead.subtitle && <p className='cover__sub'>{localLead.subtitle}</p>}
              {lead.author && <p className='cover__by'>{t('learn.by', { author: lead.author })}</p>}
            </Link>
            {isLoggedIn && (
              <Button
                className='cover__fav'
                icon={<IonIcon icon={isFavorite(lead._id) ? heart : heartOutline} aria-hidden='true' />}
                aria-label={isFavorite(lead._id) ? t('card.removeFav') : t('card.addFav')}
                aria-pressed={isFavorite(lead._id)}
                onClick={() => isFavorite(lead._id) ? removeFavorite(lead._id) : addFavorite(lead._id, 'article')}
              />
            )}
          </div>

          <Glass className='recent'>
            <h2 className='recent__title'>{t('learn.alsoRecent')}</h2>
            <div className='recent__list'>
              {sideArticles.map(article => (
                <Link key={article._id} to={`/Documents/${article._id}`} className={`recent__item ${axisClass(article.category)}`}>
                  <img src={sized(article.image, 320)} alt='' loading='lazy' decoding='async' />
                  <span className='recent__text'>
                    {article.category && <span className='axis-tag'>{tx(article.category)}</span>}
                    <span className='recent__name'>{localizeArticle(article).title}</span>
                  </span>
                </Link>
              ))}
            </div>
          </Glass>
        </section>
      )}

      <div className='aprende__body'>
        {!loadingData && visiblePresentations.length > 0 && (
          <section className='section aprende-section'>
            <div className='aprende-section-head'>
              <h2 className='section-title'>{t('learn.presentations')}</h2>
              {isDesktop && presOverflow && (
                <div className='aprende-row-nav'>
                  <Button className='btn-line' icon={<IonIcon icon={chevronBack} aria-hidden='true' />} aria-label={t('learn.prevPres')} onClick={() => scrollPres(-1)} />
                  <Button className='btn-line' icon={<IonIcon icon={chevronForward} aria-hidden='true' />} aria-label={t('learn.morePres')} onClick={() => scrollPres(1)} />
                </div>
              )}
            </div>
            <div className='aprende-grid aprende-grid--row' ref={presRowRef}>
              {visiblePresentations.map(pres => (
                <DocumentCard
                  key={pres._id}
                  name={pres.name}
                  description=''
                  img_url={pres.cover || pres.slides?.[0] || ''}
                  id={pres._id}
                  type='presentation'
                  meta={t(pres.slides?.length === 1 ? 'learn.slide' : 'learn.slides', { n: pres.slides?.length ?? 0 })}
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

        <section className='section aprende-section'>
          <div className='aprende-section-head aprende-section-head--wrap'>
            <h2 className='section-title'>{showCover ? t('learn.moreArticles') : t('learn.articles')}</h2>

            {!loadingData && topics.length > 1 && (
              <div className='topic-tabs'>
                {[[ALL, matchingArticles.length] as [string, number], ...topics].map(([name, count]) => (
                  <button
                    key={name}
                    type='button'
                    className={`topic-tab ${axisClass(name)}`}
                    aria-pressed={activeTopic === name}
                    onClick={() => setTopic(name)}
                  >
                    {name === ALL ? t('learn.all') : tx(name)}
                    <span className='topic-tab__count'>{count}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className='aprende-grid aprende-grid--list'>
            {loadingData && skeletons}
            {!loadingData && gridArticles.map(article => {
              const local = localizeArticle(article);
              return (
                <DocumentCard
                  key={article._id}
                  name={local.title}
                  description={local.subtitle || local.body}
                  img_url={article.image}
                  id={article._id}
                  type={article.type}
                  category={article.category}
                  meta={article.author}
                  isLoggedIn={isLoggedIn}
                  isFavorite={isFavorite(article._id)}
                  onToggleFavorite={() =>
                    isFavorite(article._id) ? removeFavorite(article._id) : addFavorite(article._id, 'article')
                  }
                />
              );
            })}
          </div>

          {!loadingData && visibleArticles.length === 0 && (
            <p className='empty'>
              {search ? t('learn.noMatch', { q: search }) : t('learn.noArticles')}
            </p>
          )}
        </section>
      </div>
    </div>
  );
};

export default ArticleCarrousel;
