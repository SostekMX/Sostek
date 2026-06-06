import React, { useContext, useState } from 'react';
import DocumentCard from './DocumentCard';
import './ArticleCarrousel.css';
import AppContext from '../context/AppContext';

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

      {loadingData && (
        <img
          className="imageArticleLoading visible"
          src="/assets/Spinner-1s-200px_transparent.svg"
          alt="cargando"
          style={{ position: 'fixed' }}
        />
      )}

      <div className='carrousel-list'>
        {!loadingData && showArticles && articleCards}
        {!loadingData && showPresentations && presentationCards}
      </div>
    </div>
  );
};

export default ArticleCarrousel;
