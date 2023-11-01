const useGetConfiguration =  async(sheetsID : string | undefined, configurationsArray: Array<string>, indexOfConfiguration: Array<number>) => {
    // let sheets: Array<string> =[];
    let sheets: string = "";
    
    let loading: boolean = true;
    let key = process.env.REACT_APP_PRIVATE_API_KEY;
        // 1. Initialize and get all files in drive folder (In this case are google sheets)
    function start() {
        // 2. Initialize the JavaScript client library.
        gapi.client.init({
        'apiKey': key,
        // clientId and scope are optional if auth is not required.
        }).then(function() {
        // 3. Initialize and make the API request.
        return gapi.client.request({
            'path': `https://sheets.googleapis.com/v4/spreadsheets/${sheetsID}/values/A1%3AJ2?key=${key}`,
        })
        // 4.1. If the response is succesful, get the info to display.
        }).then(function(response) {
            sheets = response.result.values[1][0];
            // console.log(response.result.values[1]);
        }, function(reason) {
            console.log('Error: ' + reason.result.error.message);
        }).then(function() {
            loading = false;
        })
    };
    
    if(loading) {
        // 1. Load the JavaScript client library.
        gapi.load('client', start);
    }
    return {sheets, loading};
}

export default useGetConfiguration;