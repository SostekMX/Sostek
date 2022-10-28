import React, { useState, useEffect } from 'react';
import { IonCol, IonItem,  IonList, IonRow, IonSelect, IonSelectOption} from '@ionic/react';
import DocumentCard from './DocumentCard';
import { File } from '../models/File';
import { dummyArticlesContent } from '../pages/document/DocumentsData';
import './ArticleCarrousel.css'

interface props {
    files: Array<File> | null | undefined;
  }

const ArticleCarrousel: React.FC<props> = ({files}) => {
    let key = process.env.REACT_APP_PRIVATE_API_KEY;
    const [currentOption, setCurrentOption] = useState('');
    const [hasNotBeenCalled, setHasNotBeenCalled] = useState(true);
    const [articlesData, setArticlesData] = useState<Array<Array<string>> | null>(null);
  useEffect(() => {

    let allTheArticles : Array<Array<string>> = new Array<Array<string>>();

    async function makeRequest() {
        let currentId = files![0].id;
        for (let i = 0; i < files!.length; i++) {
            currentId = files![i].id;
            await gapi.client.request({
                'path': `https://sheets.googleapis.com/v4/spreadsheets/${files![i].id}/values/A1%3AH2?key=${key}`,
            }).then(function(response) {
                //console.log(files);
                allTheArticles = [...allTheArticles, response.result.values[1]];
                allTheArticles.at(-1)?.push(currentId);
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
            if (allTheArticles.length == 0) {
                setArticlesData(dummyArticlesContent);
            }
            else {
                setArticlesData(allTheArticles);
            }
    };
    
    if(files != null) {
        gapi.load('client', start);
        //console.log("After gapi.load", articlesData);
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
                        !hasNotBeenCalled && articlesData!.map((article : any, key) =>{
                        if(currentOption === "ambos" || currentOption === ""){
                            return(
                                <div key={article[8]}>
                                {
                                    article.length !== 0 && <DocumentCard 
                                    name={article[1]} 
                                    description={article[4]} 
                                    img_url={article[5]} 
                                    id={article[8]}
                                    />
                                }
                                </div>
                            );
                        }
                        else {
                            //console.log(article[3])
                            if(article[3] === currentOption){
                                return(
                                    <div key={article[8]}>
                                    {
                                        article.length !== 0 && <DocumentCard 
                                        name={article[1]} 
                                        description={article[4]} 
                                        img_url={article[5]} 
                                        id={article[8]}
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