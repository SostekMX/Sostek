import ExploreContainer from '../../components/ExploreContainer';
import ArticleCardModal from '../../components/ArticleCardModal';
import TutorialCard from '../../components/TutorialCard';
import { IonCol, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
//import ExploreContainer from '../components/ExploreContainer';
import { NativeStorage } from '@ionic-native/native-storage';
import DocumentCard from '../../components/DocumentCard';
import './Tab1.css';
import { dummyArticles } from '../document/DocumentsData';
import ArticleCarrousel from '../../components/ArticleCarrousel';
import { useEffect, useRef, useState } from 'react';
import ArticleCardModalWrapper from '../../components/ArticleCardModalWrapper';
import { File } from '../../models/File';
import { runInContext } from 'vm';

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
  const [articlesUpdate, setArticlesUpdate] = useState(false);
  const didMount = useRef(false);
  let key = process.env.REACT_APP_PRIVATE_API_KEY;
  let driveID = process.env.REACT_APP_DRIVE_ID;

  function fetchArticles(){
    console.log("Executing fetchArticles()")
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
      }).then(async function(response) {
        //console.log("files", response.result.files);
        setFiles(response.result.files);
        setLastFile(response.result.files.at(-1)); 
        setArticlesUpdate(true)
      }, function(reason) {
        console.log('Error: ' + reason.result.error.message);
        setFiles(dummyArticles);
        setLastFile(dummyArticles?.at(-1));
      })
  }



  useEffect(() => {
    function runFunc(){ 
      console.log("Fetching for lastWeeklyUpdate");
      let currentDate = new Date();
      NativeStorage.getItem("lastWeeklyUpdate").then( //check if articles have been update in the past week
        data => {
          if(data < currentDate.getDate() - 7){   
            console.log("Outdated articles in native storage")
            gapi.load('client', fetchArticles)
          }else{
            NativeStorage.getItem("articlesId").then(
              data => {
                console.log("Retriving articles from local storage")
                setFiles(data)
              },
              error => {console.log("Couldn't fetch articles in local storage")
              gapi.load('client', fetchArticles)}
            )
            NativeStorage.getItem("lastFileId").then(
              data => {
                console.log("Retriving last file from local storage")
                setLastFile(data)
              },
              error => console.log("Couldn't fetch last file from local storage")
            )
          }
        },
        error => { //first time opening app
          console.log("Setting lastWeeklyUpdate for the first times")
          gapi.load('client', fetchArticles)
          NativeStorage.setItem('lastWeeklyUpdate', currentDate)
        }
      );
    }

    if(hasNotBeenCalled){
      setHasNotBeenCalled(false);
      runFunc();
    }
  }, []);
    
  useEffect(() => {

    if (!didMount.current) {
      didMount.current = true;
      return;
    }

    NativeStorage.setItem('articlesId', JSON.stringify(files)).then(
      data => console.log("Storing articles in local storage"),
      error => console.log("Error saving articles in local storage")
    )
    NativeStorage.setItem('lastFileId', JSON.stringify(lastFile)).then(
      data => console.log("Storing last file in local storage"),
      error => console.log("Error saving last file in local storage")
    )
  }, [articlesUpdate])

  return (
    <IonPage>
      <IonContent fullscreen class='bg-img'> 
        <IonHeader collapse="condense">
        </IonHeader>
        
        <> 
          <ArticleCardModalWrapper fileId={lastFile?.id} />
          <TutorialCard slides={tutorialSlides.slides} />
          <ArticleCarrousel files={files} />
        </>
        
        
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
