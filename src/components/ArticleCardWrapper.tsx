import React, { useEffect, useState } from 'react';
import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonImg } from '@ionic/react';
import DocumentCard from './DocumentCard';
interface props {
  fileId: string;
}

const ArticleCardWrapper: React.FC<props> = ({fileId}) => {
    let key = process.env.REACT_APP_PRIVATE_API_KEY;
    const [article, setArticle] = useState({
      values: [
      ]
    });
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
          'path': `https://sheets.googleapis.com/v4/spreadsheets/${fileId}/values/A1%3AF2?key=${key}`,

        })
        // 2. If the response is succesful, then we have to iterate over all the documents to get the info to display.
      }).then(function(response) {
        console.log(response.result.values);
        setArticle(response.result.values);
        setHasNotBeenCalled(false);
      }, function(reason) {
        console.log('Error: ' + reason.result.error.message);
      });
    };
    
    if (hasNotBeenCalled) {
      // 1. Load the JavaScript client library.
      gapi.load('client', start);
    }
  }, [])
  

  return (
    <>
    {
      article.values.length !== 0 && <DocumentCard 
          name={article.values[1][0]} 
          description={article.values[1][3]} 
          img_url={article.values[1][4]} 
          id={article.values[1][1]}
        />
            
    }
    </>
  )
}

export default ArticleCardWrapper;