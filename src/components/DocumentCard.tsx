import React from 'react';
import './DocumentCard.css';
import { IonCard, 
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle, 
    IonContent, 
    IonImg, 
    IonText,

 } from '@ionic/react';
 import { IonReactRouter } from '@ionic/react-router';

import Documents from '../pages/Documents'
import {Route } from 'react-router-dom';


interface DocumentProps{
    name: string,
    description: string,
    img_url :string,
    id:string
}

const DocumentCard: React.FC<DocumentProps> = ({name, description, img_url, id}) => {
    return(
        <IonContent >
            <IonReactRouter>
            <Route exact path='/Documents/:title/:img'>
                <Documents/>
            </Route>
            </IonReactRouter>
            <IonCard button  href={'/Documents/'+id}>
                <IonCardHeader>
                    <IonImg src={img_url}></IonImg> 
                </IonCardHeader>
                <IonCardContent >
                    <IonCardSubtitle className='title'>{name}</IonCardSubtitle>
                    <IonText className='description'>
                        {description}
                    </IonText>
                </IonCardContent>
            </IonCard>
        </IonContent>
        
        
        
    );
};

export default DocumentCard;