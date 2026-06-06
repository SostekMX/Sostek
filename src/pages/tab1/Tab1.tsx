import { IonContent, IonHeader, IonPage } from '@ionic/react';
import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import './Tab1.css';
import ArticleCarrousel, { Article, Presentation } from '../../components/ArticleCarrousel';
import AppBarPopOver from '../../components/layout/AppBarPopOver';
import InitialTutorial from '../../components/tutorial/InitialTutorial';
import AppContext from '../../context/AppContext';

const Tab1: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [displayTutorial, setDisplayTutorial] = useState(false);
  const { tutorial } = useContext(AppContext);

  useEffect(() => {
    const cached = localStorage.getItem("articles");
    if (cached) {
      setArticles(JSON.parse(cached));
      setLoadingData(false);
    }

    Promise.all([
      axios.get('http://localhost:8080/articles'),
      axios.get('http://localhost:8080/presentations'),
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

  useEffect(() => {
    const isTrue = localStorage.getItem("tutorial") === 'true';
    setDisplayTutorial(isTrue && tutorial === true);
  }, [tutorial]);

  return (
    <IonPage>
      <AppBarPopOver />
      <IonContent fullscreen class='app-dark-bg'>
        <IonHeader collapse="condense" />
        {displayTutorial && <InitialTutorial />}
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
