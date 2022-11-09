import { useState, useEffect } from 'react';
import { File } from '../models/File';

const useGetDocuments = (driveID : string | undefined) => {
    const [files, setFiles] = useState<Array<File> | null | undefined>(null);
    const [lastFile, setLastFile] = useState<Array<File> | null | undefined>(null);
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
            // For getting all files in folder
            //'path': `https://www.googleapis.com/drive/v3/files?includeItemsFromAllDrives=true&orderBy=createdTime&q='${driveID}'%20in%20parents%20and%20trashed%20%3D%20false&supportsAllDrives=true&key=${key}`,
            // For getting just sheets in folder
            'path': `https://www.googleapis.com/drive/v3/files?includeItemsFromAllDrives=true&orderBy=createdTime&q='${driveID}'%20in%20parents%20and%20trashed%20%3D%20false%20and%20mimeType%20%3D%20'application%2Fvnd.google-apps.spreadsheet'&supportsAllDrives=true&key=${key}`,

        })
        // 2. If the response is succesful, then we have to iterate over all the documents to get the info to display.
        }).then(function(response) {
        //console.log("files", response.result.files);
        setFiles(response.result.files);
        setLastFile([response.result.files.at(-1)]);
        }, function(reason) {
        console.log('Error: ' + reason.result.error.message);
        //setFiles(dummyArticles);
        //setLastFile(dummyArticles?.at(-1));
        }).then(function() {
            setLoading(false);
        })
    };
    
    if(loading) {
        // 1. Load the JavaScript client library.
        gapi.load('client', start);
    }
    }, [])
    return {files, lastFile, loading};
}

export default useGetDocuments;