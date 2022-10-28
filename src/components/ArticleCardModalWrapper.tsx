import React, { useEffect, useState } from 'react';
import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonImg } from '@ionic/react';
import DocumentCard from './DocumentCard';
import ArticleCardModal from './ArticleCardModal';
import { dummyArticlesContent } from '../pages/document/DocumentsData';
import { NativeStorage } from '@ionic-native/native-storage';
interface props {
  fileId: string | null | undefined;
}

const ArticleCardModalWrapper: React.FC<props> = ({fileId}) => {
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
          'path': `https://sheets.googleapis.com/v4/spreadsheets/${fileId}/values/A1%3AH2?key=${key}`,

        })
        // 2. If the response is succesful, then we have to set the information to get the info to display.
      }).then(function(response) {
        //.log(response.result)
        setArticle(response.result.values[1]);
        setHasNotBeenCalled(false);
        NativeStorage.setItem('lastFile', JSON.stringify(article))
      }, function(reason) {
        console.log('Error: ' + reason.result.error.message);
        setArticle(dummyArticlesContent[0]);
      });
    }
    
    if (hasNotBeenCalled) {
      // 1. Load the JavaScript client library.
      gapi.load('client', start);
    }

    // NativeStorage.getItem('lastFile').then(
    //   data => {
    //     setArticle(data)
    //   },
    //   error => {
    //     gapi.load('cliente', start)
    //   }
    // )

  }, [fileId])
  

  return (
    <div>
    {
        <ArticleCardModal 
            title={article[1]} 
            subtitle={article[2]}
            body={article[4]}
            imageUrl={article[5]} 
            author={article[6]}
        />
    }
    </div>
  )
}

export default ArticleCardModalWrapper;