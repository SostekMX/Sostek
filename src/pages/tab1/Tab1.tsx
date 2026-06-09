import { IonContent, IonHeader, IonPage } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../../config';
import './Tab1.css';
import ArticleCarrousel, { Article, Presentation } from '../../components/ArticleCarrousel';
import AppBarPopOver from '../../components/layout/AppBarPopOver';

const Tab1: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const cached = localStorage.getItem("articles");
    if (cached) {
      setArticles(JSON.parse(cached));
      setLoadingData(false);
    }

    Promise.all([
      axios.get(`${BACKEND_URL}/articles`),
      axios.get(`${BACKEND_URL}/presentations`),
    ]).then(([artRes, presRes]) => {
      if (artRes.data.success) {
        const reversed = [...artRes.data.articles].reverse();
        setArticles(reversed);
        localStorage.setItem("articles", JSON.stringify(reversed));
      }
      if (presRes.data.success) setPresentations(presRes.data.presentations);
    }).catch(err => console.log(err))
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
