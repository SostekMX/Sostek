import { useState, useEffect} from 'react';
const useGetSingleExcelAllData = (sheetsID : string | null | undefined) => {
  let key = process.env.REACT_APP_PRIVATE_API_KEY;
  const [loadingData, setLoadingData] = useState(true);
  const [articlesData, setArticlesData] = useState<Array<Array<string>> | null | undefined>(null);
  const [lastArticleData, setLastArticleData] = useState<Array<string> | null | undefined>(null);
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
            'path': `https://sheets.googleapis.com/v4/spreadsheets/${sheetsID}/values:batchGet?ranges=A2%3AH50&key=${key}`,
            // 'path': `https://sheets.googleapis.com/v4/spreadsheets/${sheetsID}/values:batchGet?key=${key}`,

        })
        // 2. If the response is succesful, then we have to iterate over all the documents to get the info to display.
        }).then(function(response) {
            console.log(response.result.valueRanges[0].values)
        setArticlesData(response.result.valueRanges[0].values);
        setLastArticleData(response.result.valueRanges[0].values.at(-1));
        lastArticleData ? console.log(lastArticleData) : console.log("");
        }, function(reason) {
        console.log('Error: ' + reason.result.error.message);
        }).then(function() {
            setLoadingData(false);
        })
  };
  
  if(loadingData) {
        // 1. Load the JavaScript client library.
        gapi.load('client', start);
    }
    }, []);

  return {articlesData, lastArticleData, loadingData};
}

export default useGetSingleExcelAllData;