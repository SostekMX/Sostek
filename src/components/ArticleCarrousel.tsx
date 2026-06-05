import React, { useContext, useState } from 'react';
import { IonCol, IonHeader, IonItem, IonList, IonRow, IonSelect, IonSelectOption } from '@ionic/react';
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

const ArticleCarrousel: React.FC<Props> = ({ articlesData, loadingData, presentations }) => {
  const [currentOption, setCurrentOption] = useState('');
  const { search } = useContext(AppContext);

  const normalize = (s: string) =>
    s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

  const searchNorm = normalize(search);

  const articleCards = !loadingData && articlesData?.map((article) => {
    const matchesSearch =
      normalize(article.category ?? '').includes(searchNorm) ||
      normalize(article.title ?? '').includes(searchNorm);
    if (!matchesSearch) return null;
    return (
      <div key={article._id}>
        <DocumentCard
          name={article.title}
          description={article.body}
          img_url={article.image}
          id={article._id}
          type={article.type}
          imgAuthor={article.author_image || undefined}
          imgPage={article.page_image || undefined}
        />
      </div>
    );
  });

  const presentationCards = presentations?.map((pres) => {
    if (!normalize(pres.name ?? '').includes(searchNorm)) return null;
    return (
      <div key={pres._id}>
        <DocumentCard
          name={pres.name}
          description=""
          img_url={pres.slides?.[0] ?? ''}
          id={pres._id}
          type="presentation"
          imgAuthor={undefined}
          imgPage={undefined}
        />
      </div>
    );
  });

  return (
    <IonCol>
      <IonHeader>
        <IonRow className='filter-aligned'>
          <IonList className='filter-size filter-rounded_border'>
            <IonItem className='filter-item-size'>
              <IonSelect placeholder="Filtrar   " interface='popover' onIonChange={(op) => setCurrentOption(op.detail.value)}>
                <IonSelectOption value="article" className='option-filter'>Presentaciones</IonSelectOption>
                <IonSelectOption value="presentation" className='option-filter'>Artículos</IonSelectOption>
                <IonSelectOption value="" className='option-filter'>Ambos</IonSelectOption>
              </IonSelect>
            </IonItem>
          </IonList>
        </IonRow>
      </IonHeader>

      <div>
        <img
          className={loadingData ? "imageArticleLoading visible" : "imageArticleLoading hidden"}
          src="/assets/Spinner-1s-200px_transparent.svg"
          alt="loading image"
          style={{ position: "fixed" }}
        />
      </div>

      <div className={loadingData ? "ion-content-scroll-host hidden" : "ion-content-scroll-host visible"}>
        {!loadingData && (
          currentOption === "" ? (
            <div>{articleCards}{presentationCards}</div>
          ) : currentOption === "article" ? (
            <div>{presentationCards}</div>
          ) : (
            <div>{articleCards}</div>
          )
        )}
      </div>
    </IonCol>
  );
};

export default ArticleCarrousel;
