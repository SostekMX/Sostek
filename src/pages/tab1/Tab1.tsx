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
const exampleCard = {
  message: 'Bienvenidos a Sostek, este es un tutorial.',
  character: 'gota2',
  align: 'right'
}
const exampleCard1 = {
  message: 'En esta pestaña puedes informarte con artículos y presentaciones.',
  character: 'gota2',
  align: 'left'
}
const exampleCard2 = {
  message: 'Si solo te interesa un tipo, puedes filtrarlos con el botón arriba de mí.',
  character: 'mundo1',
  align: 'right'
}

const exampleCard3 = {
  message: 'También debo recordarte que esta pestaña se actualiza quincenalmente.',
  character: 'mundo1',
  align: 'right'
}

const exampleCard4 = {
  message: 'Esto es todo por el momento, mientras avances en la app te seguiremos guiando.',
  character: 'gota2',
  align: 'left'
}
const tutorialSlides = {
  slides: [exampleCard, exampleCard1, exampleCard2, exampleCard3, exampleCard4]
}

const Tab1: React.FC = () => {
  //const { addToFiles } = useContext(AppContext);
  let driveID = process.env.REACT_APP_DRIVE_ID;
  let presentationDriveID = process.env.REACT_APP_PRESENTATIONS_DRIVE_ID;
  //const {files, lastFile, loading } = useGetDocuments(driveID);
  //const {presentations} = useGetPresentations(presentationDriveID); 
  //addToFiles(files);

  return (
    <IonPage>
      <AppBarPopOver></AppBarPopOver>
      <IonContent fullscreen class='bg-img'> 
        <IonHeader collapse="condense">
      
        </IonHeader>
        {/* {
          loading && <IonLoading isOpen={loading} duration={5000}  />
        }
        {
          !loading && <> 
            <ArticleCardModalWrapper files={lastFile} />
            <TutorialCard slides={tutorialSlides.slides} />
            <ArticleCarrousel files={files} presentations={presentations}/>
          </>
        } */}
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
