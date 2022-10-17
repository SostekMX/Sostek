import React, { useState, useEffect } from 'react';
import { IonCol, IonItem,  IonList, IonRow, IonSelect, IonSelectOption} from '@ionic/react';
import DocumentCard from './DocumentCard'
import './ArticleCarrousel.css'

interface props {
    files: Array<{
        driveId: "0AGxiS_Xq3bvYUk9PVA"
        id: "1x1J2haBHZBTpVHkiQ19UN_lpYTSlxr1T44TOzqeSdgQ"
        kind: "drive#file"
        mimeType:"application/vnd.google-apps.spreadsheet"
        name: "secondArticle"
        teamDriveId: "0AGxiS_Xq3bvYUk9PVA"
    }>;
  }

const ArticleCarrousel: React.FC<props> = ({files}) => {
    let key = process.env.REACT_APP_PRIVATE_API_KEY;
    const [currentOption, setCurrentOption] = useState('');
    const [hasNotBeenCalled, setHasNotBeenCalled] = useState(true);
    const [articlesData, setArticlesData] = useState(new Array<[]>());
  useEffect(() => {

    let allTheArticles = new Array<[]>();

    async function makeRequest() {
        for (let i = 0; i < files.length; i++) {
            await gapi.client.request({
                'path': `https://sheets.googleapis.com/v4/spreadsheets/${files[i].id}/values/A1%3AH2?key=${key}`,
            }).then(function(response) {
                console.log(`Response.result vuelta ${i}`,response.result.values[1]);
                allTheArticles = [...allTheArticles, response.result.values[1]];
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
            setHasNotBeenCalled(false);
            setArticlesData(allTheArticles);
            console.log(articlesData);

    };
    
    if(files.length > 0) {
        gapi.load('client', start);
        console.log("After gapi.load", articlesData);
    }
  }, [files])

    return(
            <IonCol>
                <IonRow className='filter-aligned'>
                   
                    <IonList className='filter-size filter-rounded_border'>
                        <IonItem className='filter-item-size'>
                            <IonSelect placeholder="Filtrar   " interface='popover' onIonChange={(op) => setCurrentOption(op.detail.value)}>
                            <IonSelectOption value="article" className='option-filter' >Presentaciones</IonSelectOption>
                            <IonSelectOption value="presentation" className='option-filter' >Artículos</IonSelectOption>
                            <IonSelectOption value="ambos" className='option-filter' >Ambos</IonSelectOption>
                            </IonSelect>
                        </IonItem>
                    </IonList>
                </IonRow>
                <div className="ion-content-scroll-host">
                    {
                        !hasNotBeenCalled && articlesData.map((article : any, key) =>{
                        if(currentOption === "ambos" || currentOption === ""){
                            return(
                                <div>
                                {
                                    article.length !== 0 && <DocumentCard 
                                    name={article[1]} 
                                    description={article[4]} 
                                    img_url={article[5]} 
                                    id={article[0]}
                                    />
                                }
                                </div>
                            );
                        }
                        else {
                            console.log(article[3])
                            if(article[3] === currentOption){
                                return(
                                    <div>
                                    {
                                        article.length !== 0 && <DocumentCard 
                                        name={article[1]} 
                                        description={article[4]} 
                                        img_url={article[5]} 
                                        id={article[0]}
                                        />
                                    }
                                    </div>
                                );
                            }
                        }
                })
                    }
                    </div>
            </IonCol>
            
           
           
           
        
        
       
        
       
    
    );
};

export default ArticleCarrousel;