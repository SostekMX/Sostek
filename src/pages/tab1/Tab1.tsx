import { IonContent, IonHeader, IonPage } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { getArticles, getPresentations } from '../../api/content';
import './Tab1.css';
import ArticleCarrousel, { Article, Presentation } from '../../components/ArticleCarrousel';
import AppBarPopOver from '../../components/layout/AppBarPopOver';

const Tab1: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const cachedArticles = localStorage.getItem("articles");
    const cachedPresentations = localStorage.getItem("presentations");

    if (cachedArticles) setArticles(JSON.parse(cachedArticles));
    if (cachedPresentations) setPresentations(JSON.parse(cachedPresentations));
    if (cachedArticles) setLoadingData(false);

    Promise.all([
      getArticles(),
      getPresentations(),
    ]).then(([articlesData, presentationsData]) => {
      if (articlesData.success) {
        const reversed = [...articlesData.articles].reverse();
        setArticles(reversed);
        localStorage.setItem("articles", JSON.stringify(reversed));
      }
      if (presentationsData.success) {
        setPresentations(presentationsData.presentations);
        localStorage.setItem("presentations", JSON.stringify(presentationsData.presentations));
      }
    }).catch(err => console.error(err))
      .finally(() => setLoadingData(false));
  }, []);

  return (
    <IonPage>
      <AppBarPopOver />
      <IonContent fullscreen class='app-dark-bg'>
        <IonHeader collapse="condense" />
        <ArticleCarrousel
          articlesData={articles}
          loadingData={loadingData}
          presentations={presentations}
        />
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
