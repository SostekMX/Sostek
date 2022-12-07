import { useState, useEffect} from 'react';
import { File } from '../models/File';
const useGetArticlesData = (files: Array<File> | null | undefined) => {
  let key = process.env.REACT_APP_PRIVATE_API_KEY;
  const [loading, setLoading] = useState(true);
  const [articlesData, setArticlesData] = useState<Array<Array<string>> | null>(null);
useEffect(() => {

  let allTheArticles : Array<Array<string>> = new Array<Array<string>>();

  async function makeRequest() {
      let currentId = files![0].id;
      for (let i = 0; i < files!.length; i++) {
          currentId = files![i].id;
          await gapi.client.request({
              'path': `https://sheets.googleapis.com/v4/spreadsheets/${files![i].id}/values/A1%3AJ2?key=${key}`,
          }).then(function(response) {
              //console.log(response.result.values);
              allTheArticles = [...allTheArticles, response.result.values[1]];
              /**
               * Here are two options. We must fix where the ID will be because
               * if we add data to sheets we can make it easier without chaning our app
               * logic.
               */
              //This option appends the id of the document at the final
                //allTheArticles.at(-1)?.push(currentId);
              //This option appends the id of the document at the 10 position.
                allTheArticles[allTheArticles.length - 1][10] = currentId;

          }, function(reason) {
              console.log('Error: ' + reason.result.error.message);
          })
      }
  }

  // 1. Initialize and get all files in drive folder (In this case are google sheets)
  async function start(apiRequest : Function) {
          // 2. Initialize the JavaScript client library.
          await gapi.client.init({
              'apiKey': key,
              // clientId and scope are optional if auth is not required.
          });
          await makeRequest();
          setLoading(false);
          if (allTheArticles.length == 0) {
              //setArticlesData(dummyArticlesContent);
          }
          else {
              setArticlesData(allTheArticles);
          }
  };
  
  if(files != null) {
      gapi.load('client', start);
  }
}, [files])

  return {articlesData, loading};
}

export default useGetArticlesData;