import React, { useState } from 'react';
import { IonCol, IonContent, IonItem,  IonList, IonRow, IonSelect, IonSelectOption} from '@ionic/react';
import DocumentCard from './DocumentCard'
import './ArticleCarrousel.css'
import { dummyArticles } from '../pages/document/DocumentsData';
interface RouteParams {
}


const ArticleCarrousel: React.FC = () => {
    const [currentOption, setCurrentOption] = useState('');
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
                        dummyArticles.map((data,key) =>{
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
                    })}
                    </div>
            </IonCol>
            
           
           
           
        
        
       
        
       
    
    );
};

export default ArticleCarrousel;