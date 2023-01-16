import React, { useEffect, useState } from 'react';
import { IonCardSubtitle, IonCol, IonContent, IonHeader, IonImg, IonPage, IonRow, IonText, IonTitle} from '@ionic/react';
import './Documents.css'
import { RouteComponentProps, useParams } from 'react-router';
import { dummyArticlesContent } from './DocumentsData';
import AppBarPopOver from '../../components/AppBarPopOver';

interface PropsParams{
  imgAuthor? : string,
  imgPage? : string
}

interface RouteParams{
    id:string,
    imgAuthor? : string,
    imgPage? : string
}

const Documents: React.FC<PropsParams>= ({imgAuthor, imgPage}) => {
    const {id} = useParams<RouteParams>();
    let key = process.env.REACT_APP_PRIVATE_API_KEY;
    const [article, setArticle] = useState<Array<string>>(
        ['1','TheTitle', 'SubtitleThe', 'article', 'Había una vez', 'https://img.freepik.com/free-photo/environmental-conservation-garden-children_1150-15276.jpg?w=740&t=st=1665674411~exp=1665675011~hmac=cce6c0e4a24265f927554dfb1b11ba792faed308b59d78e398087f7006b664ff', 'Grecia', 'TRUE']
    );
    const [hasNotBeenCalled, setHasNotBeenCalled] = useState(true)
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
          'path': `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/A1%3AH2?key=${key}`,

        })
        // 2. If the response is succesful, then we have to iterate over all the documents to get the info to display.
      }).then(function(response) {
        setArticle(response.result.values[1]);
      }, function(reason) {
        setArticle(dummyArticlesContent[0])
        console.log('Error: ' + reason.result.error.message);
      });
    };
    
    if (hasNotBeenCalled) {
      // 1. Load the JavaScript client library.
      gapi.load('client', start);
      setHasNotBeenCalled(false);
    }
  }, [])

    return(
      <IonPage>
        <AppBarPopOver></AppBarPopOver>
       <IonContent fullscreen class='bg'>
           <img src={article[4]} className="imageArticle" />
           { (imgPage || imgAuthor) &&
                <IonCardSubtitle>
                    Imagen
                    {
                        imgPage &&
                        <>{` de ${imgPage}`}</>
                    }
                    { imgAuthor && 
                        <>{` por ${imgAuthor}`}</>
                    }
                </IonCardSubtitle>
                }
           <br></br>
           <IonCol>
                <IonRow>
                    <IonText className='content-row title__document ion-text-wrap'>
                        {article[0]}
                    </IonText>
                </IonRow>
                <br></br>
                <IonRow className = 'content-row content__document'>
                    <IonText>
                        {article[3]}
                    </IonText>
                </IonRow>
            </IonCol>
            
       </IonContent>
       </IonPage>
    );
};

export default Documents;