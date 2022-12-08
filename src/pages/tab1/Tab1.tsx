import TutorialCard from '../../components/TutorialCard';
import {  IonContent, IonHeader, IonLoading, IonPage } from '@ionic/react';
import './Tab1.css';
import ArticleCarrousel from '../../components/ArticleCarrousel';
import ArticleCardModalWrapper from '../../components/ArticleCardModalWrapper';
import AppBarPopOver from '../../components/AppBarPopOver';
import useGetDocuments from '../../hooks/useGetDocuments';
import { NativeStorage } from '@ionic-native/native-storage';
import React, { useContext, useEffect, useState } from 'react';
import useGetPresentations from '../../hooks/useGetPresentations';
import InitialTutorial from '../../components/tutorial/InitialTutorial';
import AppContext from '../../context/AppContext';

const Tab1: React.FC = () => {
  let driveID = process.env.REACT_APP_DRIVE_ID;
  let presentationDriveID = process.env.REACT_APP_PRESENTATIONS_DRIVE_ID;
  const {files, lastFile, loading } = useGetDocuments(driveID);
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
    setDisplayTutorial(isTrue === tutorial);

}, [localStorage, tutorial])
  return (
    <IonPage>
      <AppBarPopOver></AppBarPopOver>
      <IonContent fullscreen class='bg-img'> 
        <IonHeader collapse="condense">
      
        </IonHeader>
        {
          loading && loadingForAllPresentations && <IonLoading isOpen={loading} duration={5000}  />
        }
        {
          !loading && !loadingForAllPresentations && <> 
            <ArticleCardModalWrapper files={lastFile} />
             {displayTutorial &&<InitialTutorial />}
            <ArticleCarrousel files={files} presentations={presentations}/>
          </>
        }
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
