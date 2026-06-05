import React, { useEffect, useState } from 'react';
import { IonCardSubtitle, IonCol, IonContent, IonPage, IonRow, IonText} from '@ionic/react';
import './Documents.css'
import { useParams } from 'react-router';
import axios from 'axios';
import AppBarPopOver from '../../components/layout/AppBarPopOver';
import { AppBarMenu } from '../../components/layout/AppBarMenu';

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

  useEffect(() => {
    axios.get(`http://localhost:8080/articles/${id}`)
      .then(res => {
        if (res.data.success) setArticle(res.data.article);
      })
      .catch(err => console.log(err))
      .finally(() => setLoadingData(false));
  }, [id]);

  return (
    <IonPage>
      <div className={loadingData ? 'colorful_appbar_document' : 'colorful_appbar_document hidden'}><AppBarPopOver /></div>
      <div className={loadingData ? 'transparent_appbar_document' : 'transparent_appbar_document visible'}><AppBarMenu /></div>

      <IonContent fullscreen class='bg-img'>
        <img className={loadingData ? "imageArticleLoading visible" : "imageArticleLoading hidden"}
          src="/assets/Spinner-1s-200px_transparent.svg"
          alt="loading" />
        <img className={loadingData ? "imageArticle hidden" : "imageArticle visible"}
          src={article?.image ?? ''}
          alt={article?.title ?? ''}
        />

        {(article?.page_image || article?.author_image) &&
          <IonCardSubtitle>
            Imagen
            {article?.page_image && <>{` de ${article.page_image}`}</>}
            {article?.author_image && <>{` por ${article.author_image}`}</>}
          </IonCardSubtitle>
        }
        <br />
        <IonCol className='content__container'>
          <IonRow>
            <IonText className='content-row title__document ion-text-wrap'>
              {!loadingData && article?.title}
            </IonText>
          </IonRow>
          <br />
          <IonRow className='content-row content__document'>
            <IonText>
              {!loadingData && article?.body}
            </IonText>
          </IonRow>
        </IonCol>
      </IonContent>
    </IonPage>
  );
};

export default Documents;
