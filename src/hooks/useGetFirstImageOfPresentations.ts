import { useState, useEffect } from 'react';
const useGetFirstImageOfPresentations = (driveID : string[] | undefined) => {
    const [urlImages, setUrlImages] = useState<Array<string> | undefined | null>(undefined);
    const [loading, setLoading] = useState(true);
    let key = process.env.REACT_APP_PRIVATE_API_KEY;
    useEffect(() => {

        let allTheThumbnails : Array<string> = new Array<string>();

        async function makeRequest() {
            let currentId = driveID![0];
            for (let i = 0; i < driveID!.length; i++) {
                currentId = driveID![i];
                console.log(currentId)
                await gapi.client.request({
                    // For getting all files in folder
                    'path': `https://www.googleapis.com/drive/v3/files?includeItemsFromAllDrives=true&orderBy=createdTime&q='${currentId}'%20in%20parents%20and%20trashed%20%3D%20false&supportsAllDrives=true&fields=files(id)&key=${key}`,
                    // For getting just sheets in folder
                    //'path': `https://www.googleapis.com/drive/v3/files?includeItemsFromAllDrives=true&orderBy=createdTime&q='${driveID}'%20in%20parents%20and%20trashed%20%3D%20false%20and%20mimeType%20%3D%20'application%2Fvnd.google-apps.spreadsheet'&supportsAllDrives=true&key=${key}`,
        
                }).then(function(response) {
                    //console.log("files", response.result.files);
                    allTheThumbnails = [...allTheThumbnails, response.result.files[0].id]
                    }, function(reason) {
                    console.log('Error: ' + reason.result.error.message);
                    })
            }
            // 2. If the response is succesful, then we have to iterate over all the documents to get the info to display.
        }

        // 1. Initialize and get all files in drive folder (In this case are google sheets)
    async function start() {
        // 2. Initialize the JavaScript client library.
        await gapi.client.init({
        'apiKey': key,
        // clientId and scope are optional if auth is not required.
        });
        // 3. Initialize and make the API request.
        await makeRequest();
        setLoading(false);
        if (allTheThumbnails.length == 0) {
        }
        else {
            setUrlImages(allTheThumbnails);
        }
    };
    
    if(driveID != null) {
        // 1. Load the JavaScript client library.
        gapi.load('client', start);
    }
    }, [])
    return {urlImages, loading};
}

export default useGetFirstImageOfPresentations;