import ExploreContainer from '../../components/ExploreContainer';
import ArticleCardModal from '../../components/ArticleCardModal';
import TutorialCard from '../../components/TutorialCard';
import { IonCol, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
//import ExploreContainer from '../components/ExploreContainer';
import DocumentCard from '../../components/DocumentCard';
import './Tab1.css';
import { dummyArticles } from '../document/DocumentsData';
import ArticleCarrousel from '../../components/ArticleCarrousel';
import { useEffect, useState } from 'react';
import ArticleCardModalWrapper from '../../components/ArticleCardModalWrapper';
import { File } from '../../models/File';
import AppBarPopOver from '../../components/AppBarPopOver';

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
    
    const [files, setFiles] = useState<Array<File> | null | undefined>(null);
    const [lastFile, setLastFile] = useState<File | null | undefined>(null);
    const [hasNotBeenCalled, setHasNotBeenCalled] = useState(true);
    let key = process.env.REACT_APP_PRIVATE_API_KEY;
    let driveID = process.env.REACT_APP_DRIVE_ID;
    useEffect(() => {
        // 1. Initialize and get all files in drive folder (In this case are google sheets)
    function start() {
        // 2. Initialize the JavaScript client library.
        gapi.client.init({
        'apiKey': key,
        // clientId and scope are optional if auth is not required.
        }).then(function() {
        // 3. Initialize and make the API request.
        return gapi.client.request({
            'path': `https://www.googleapis.com/drive/v3/files?includeItemsFromAllDrives=true&orderBy=createdTime&q='${driveID}'%20in%20parents%20and%20trashed%20%3D%20false&supportsAllDrives=true&key=${key}`,
        })
        // 2. If the response is succesful, then we have to iterate over all the documents to get the info to display.
        }).then(function(response) {
        //console.log("files", response.result.files);
        setFiles(response.result.files);
        setLastFile(response.result.files.at(-1));
        }, function(reason) {
        console.log('Error: ' + reason.result.error.message);
        setFiles(dummyArticles);
        setLastFile(dummyArticles?.at(-1));
        })
    };
    
    if(hasNotBeenCalled) {
        // 1. Load the JavaScript client library.
        gapi.load('client', start);
        setHasNotBeenCalled(false);
        
    }
    }, [])
  return (
    <IonPage>
      <AppBarPopOver></AppBarPopOver>
      <IonContent fullscreen class='bg-img'> 
        <IonHeader collapse="condense">
      
        </IonHeader>
        
        {!hasNotBeenCalled && <> 
          <ArticleCardModalWrapper fileId={lastFile?.id} />
          <TutorialCard slides={tutorialSlides.slides} />
          <ArticleCarrousel files={files} />
        </>
        }
        
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
