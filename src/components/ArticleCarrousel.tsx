import React, { useState, useEffect } from 'react';
import { IonCol, IonItem,  IonList, IonRow, IonSelect, IonSelectOption} from '@ionic/react';
import DocumentCard from './DocumentCard'
import './ArticleCarrousel.css'
import { dummyArticles } from '../pages/document/DocumentsData';
import ArticleCardWrapper from './ArticleCardWrapper';


const ArticleCarrousel: React.FC = () => {
    const [currentOption, setCurrentOption] = useState('');
    const [files, setFiles] = useState([]);
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
            'path': `https://www.googleapis.com/drive/v3/files?includeItemsFromAllDrives=true&orderBy=modifiedTime&q='${driveID}'%20in%20parents%20and%20trashed%20%3D%20false&supportsAllDrives=true&key=${key}`,
        })
        // 2. If the response is succesful, then we have to iterate over all the documents to get the info to display.
        }).then(function(response) {
        console.log("files", response.result.files);
        setFiles(response.result.files);
        setHasNotBeenCalled(false);
        }, function(reason) {
        console.log('Error: ' + reason.result.error.message);
        });
    };
    
    if(hasNotBeenCalled) {
        // 1. Load the JavaScript client library.
        gapi.load('client', start);
    }
    }, [])

    return(
            <IonCol>
                <IonRow className='filter-aligned'>
                   
                    <IonList className='filter-size filter-rounded_border'>
                        <IonItem className='filter-item-size'>
                            <IonSelect placeholder="Filtrar   " interface='popover' onIonChange={(op) => setCurrentOption(op.detail.value)}>
                            <IonSelectOption value="presentacion" className='option-filter' >Presentaciones</IonSelectOption>
                            <IonSelectOption value="articulo" className='option-filter' >Artículos</IonSelectOption>
                            <IonSelectOption value="ambos" className='option-filter' >Ambos</IonSelectOption>
                            </IonSelect>
                        </IonItem>
                    </IonList>
                </IonRow>
                <div className="ion-content-scroll-host">
                    {
                        files.length === 0 ? dummyArticles.map((data,key) =>{
                            if(currentOption === "ambos" || currentOption === ""){
                                return(
                                        <DocumentCard  
                                            key={key}
                                            name= {data.title} 
                                            description = {data.description} 
                                            img_url= {data.url_img}  
                                            id = {data.id}
                                        />
                                    );
                            }
                            else {
                                if(data.type === currentOption){
                                    return(
                                            <DocumentCard
                                                key={key}
                                                name= {data.title} 
                                                description = {data.description} 
                                                img_url= {data.url_img}  
                                                id = {data.id}
                                            />

                                        );
                                }
                            }
                    }) : files.map((file : any, key) =>{
                        return(
                            <ArticleCardWrapper fileId={file.id} />
                        );
                })
                    }
                    </div>
            </IonCol>
            
           
           
           
        
        
       
        
       
    
    );
};

export default ArticleCarrousel;