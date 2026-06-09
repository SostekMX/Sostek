import React, { useContext, useState } from 'react';
import DocumentCard from './DocumentCard';
import './ArticleCarrousel.css';
import AppContext from '../context/AppContext';
import useFavorites from '../hooks/useFavorites';

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
  slides: string[];
}

interface Props {
  articlesData: Article[] | null | undefined;
  loadingData: boolean;
  presentations: Presentation[] | null | undefined;
}

type FilterType = 'all' | 'article' | 'presentation';

const FILTERS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'Ambos' },
  { value: 'article', label: 'Artículos' },
  { value: 'presentation', label: 'Presentaciones' },
];

const ArticleCarrousel: React.FC<Props> = ({ articlesData, loadingData, presentations }) => {
  const [filterType, setFilterType] = useState<FilterType>('all');
  const { search } = useContext(AppContext);
  const { isLoggedIn, isFavorite, addFavorite, removeFavorite } = useFavorites();

  const normalize = (s: string) =>
    s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

  const searchNorm = normalize(search);

  const articleCards = articlesData
    ?.filter(article =>
      normalize(article.category ?? '').includes(searchNorm) ||
      normalize(article.title ?? '').includes(searchNorm)
    )
    .map(article => (
      <DocumentCard
        key={article._id}
        name={article.title}
        description={article.body}
        img_url={article.image}
        id={article._id}
        type={article.type}
        imgAuthor={article.author_image || undefined}
        imgPage={article.page_image || undefined}
        isLoggedIn={isLoggedIn}
        isFavorite={isFavorite(article._id)}
        onToggleFavorite={() =>
          isFavorite(article._id) ? removeFavorite(article._id) : addFavorite(article._id, 'article')
        }
      />
    ));

  const presentationCards = presentations
    ?.filter(pres => normalize(pres.name ?? '').includes(searchNorm))
    .map(pres => (
      <DocumentCard
        key={pres._id}
        name={pres.name}
        description=""
        img_url={pres.slides?.[0] ?? ''}
        id={pres._id}
        type="presentation"
        imgAuthor={undefined}
        imgPage={undefined}
        isLoggedIn={isLoggedIn}
        isFavorite={isFavorite(pres._id)}
        onToggleFavorite={() =>
          isFavorite(pres._id) ? removeFavorite(pres._id) : addFavorite(pres._id, 'presentation')
        }
      />
    ));

  const showArticles = filterType === 'all' || filterType === 'article';
  const showPresentations = filterType === 'all' || filterType === 'presentation';

  return (
    <div>
      <div className='filter-pills'>
        {FILTERS.map(f => (
          <button
            key={f.value}
            className={`filter-pill ${filterType === f.value ? 'filter-pill--active' : ''}`}
            onClick={() => setFilterType(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className='carrousel-list'>
        {loadingData && Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className='doc-card-skeleton'>
            <div className='doc-card-skeleton__image shimmer' />
            <div className='doc-card-skeleton__body'>
              <div className='doc-card-skeleton__badge shimmer' />
              <div className='doc-card-skeleton__title shimmer' />
              <div className='doc-card-skeleton__desc shimmer' />
            </div>
          </div>
        ))}
        {!loadingData && showArticles && articleCards}
        {!loadingData && showPresentations && presentationCards}
      </div>
    </div>
  );
};

export default ArticleCarrousel;
