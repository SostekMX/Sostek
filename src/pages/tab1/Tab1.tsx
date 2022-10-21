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


const exampleCard = {
  message: 'Bienvenidos a Sostek, este es un tutorial. Probamos mas texto para ver la alineacion del contenido.',
  character: 'gota2',
  align: 'right'
}
const exampleCard2 = {
  message: 'Bienvenidos a Sostek, este es otro tutorial.',
  character: 'mundo1',
  align: 'left'
}
const tutorialSlides = {
  slides: [exampleCard, exampleCard2]
}

const dummyArticle = {
  imageUrl : "/assets/article-img.jpeg",
  title : "Nombre del artículo",
  subtitle : "Subtitulo del articulo",
  author : "Fulanito de Tal",
  body : "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?"
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
      <IonContent fullscreen class='bg-img'> 
        <IonHeader collapse="condense">
        </IonHeader>
        
        {!hasNotBeenCalled && <> 
          <ArticleCardModalWrapper fileId={lastFile?.id} />
          <ArticleCarrousel files={files} />
        </>
        }
        
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
