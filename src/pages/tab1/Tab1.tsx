import TutorialCard from '../../components/TutorialCard';
import {  IonContent, IonHeader, IonLoading, IonPage } from '@ionic/react';
import './Tab1.css';
import ArticleCarrousel from '../../components/ArticleCarrousel';
import ArticleCardModalWrapper from '../../components/ArticleCardModalWrapper';
import AppBarPopOver from '../../components/AppBarPopOver';
import useGetDocuments from '../../hooks/useGetDocuments';
import { NativeStorage } from '@ionic-native/native-storage';
import React, { useContext, useEffect, useState } from 'react';
import AppContext from '../../context/AppContext';
import useGetPresentations from '../../hooks/useGetPresentations';
import InitialTutorial from '../../components/tutorial/InitialTutorial';

const Tab1: React.FC = () => {
  //const { addToFiles } = useContext(AppContext);
  let driveID = process.env.REACT_APP_DRIVE_ID;
  let presentationDriveID = process.env.REACT_APP_PRESENTATIONS_DRIVE_ID;
  const {files, lastFile, loading } = useGetDocuments(driveID);
  const [displayTutorial, setDisplayTutorial] = useState<boolean>(false);

  const {presentations, loadingForAllPresentations} = useGetPresentations(presentationDriveID); 
  //addToFiles(files);
  useEffect(() => {
    // NativeStorage.getItem("login").then(
    //   data => setIsUserLogged(data)
    // )
    let isTrue  = sessionStorage.getItem("tutorial") === 'true';
    setDisplayTutorial(isTrue);

}, [sessionStorage])
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
