import { useState, useEffect } from 'react';
import { Evaluation } from '../models/Evaluation.model';

const useGetEvaluationData = (sheetsID : string | undefined) => {
    const [evaluation, setEvaluation] = useState<Array<Evaluation> | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    let key = process.env.REACT_APP_PRIVATE_API_KEY;
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
            'path': `https://sheets.googleapis.com/v4/spreadsheets/${sheetsID}/values:batchGet?ranges=preguntas!A2%3AB50&ranges=respuestas!A2%3AG50&ranges=puntos!A2%3AG50&key=${key}`,
        })
        // 2. If the response is succesful, then we have to iterate over all the documents to get the info to display.
        }).then(function(response) {
        setEvaluation(response.result.valueRanges);
        }, function(reason) {
        console.log('Error: ' + reason?.result?.error?.message);
        }).then(function() {
            setLoading(false);
        }).catch(function() {
            setLoading(false);
        })
    };
    
    if(loading) {
        // 1. Load the JavaScript client library.
        gapi.load('client', start);
    }
    }, [])
    return {evaluation, loading};
}

export default useGetEvaluationData;