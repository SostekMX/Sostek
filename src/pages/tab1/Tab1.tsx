import TutorialCard from '../../components/TutorialCard';
import {  IonContent, IonHeader, IonLoading, IonPage } from '@ionic/react';
import './Tab1.css';
import ArticleCarrousel from '../../components/ArticleCarrousel';
import AppBarPopOver from '../../components/layout/AppBarPopOver';
import useGetDocuments from '../../hooks/useGetDocuments';
import { NativeStorage } from '@ionic-native/native-storage';
import React, { useContext, useEffect, useState } from 'react';
import useGetPresentations from '../../hooks/useGetPresentations';
import InitialTutorial from '../../components/tutorial/InitialTutorial';
import AppContext from '../../context/AppContext';
import useGetSingleExcelAllData from '../../hooks/useGetSingleExcelAllData';
import ArticleCardModal from '../../components/ArticleCardModal';

const Tab1: React.FC = () => {
  let presentationDriveID = process.env.REACT_APP_PRESENTATIONS_DRIVE_ID;

  //const {files, lastFile, loading } = useGetDocuments(driveID);
  const { articlesDataReversed, lastArticleData, loadingData } = useGetSingleExcelAllData('1ChvjU94csQ3ncWFOU_HmbiFq6HU3H3TwJ-XwfzMrjPc');
  const [displayTutorial, setDisplayTutorial] = useState<boolean>(false);
  const {presentations, loadingForAllPresentations} = useGetPresentations(presentationDriveID);
  const { tutorial } = useContext(AppContext); 
  //addToFiles(files);
  useEffect(() => {
    // NativeStorage.getItem("login").then(
    //   data => setIsUserLogged(data)
    // )
    let isTrue  = localStorage.getItem("tutorial") === 'true';
    if (localStorage.getItem("tutorial") === undefined) {
      isTrue = true;
    }
    setDisplayTutorial(isTrue == true && tutorial === true);

}, [localStorage, tutorial])
  return (
    <IonPage>
      <AppBarPopOver></AppBarPopOver>
      <IonContent fullscreen class='bg-img'> 
        <IonHeader collapse="condense">
      
        </IonHeader>
        {
          !loadingData && !loadingForAllPresentations && <>
            {lastArticleData && <ArticleCardModal
              title={lastArticleData[0]}
              subtitle={lastArticleData[1]}
              body={lastArticleData[3]}
              imageUrl={lastArticleData[4]}
              author={lastArticleData[5]}
              id={articlesDataReversed!.length - 1}
            />}
             {displayTutorial &&<InitialTutorial />}
            <ArticleCarrousel articlesData={articlesDataReversed} loadingData={loadingData} presentations={presentations}/>
          </>
        }
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
