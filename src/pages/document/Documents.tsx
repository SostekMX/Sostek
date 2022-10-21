import React from 'react';
import { IonCol, IonContent, IonHeader, IonImg, IonRow, IonText, IonTitle} from '@ionic/react';
import './Documents.css'
import { RouteComponentProps, useParams } from 'react-router';
import { dummyArticlesContent } from './DocumentsData';

interface RouteParams{
    id:string,
}

interface DocumentProps {
    name: string,
    description: string,
    img_url: string
}
const Documents: React.FC<DocumentProps> = ({name, description, img_url}) => {
    name = name || dummyArticlesContent[0][2]
    description= description || dummyArticlesContent[0][4]
    img_url= img_url || dummyArticlesContent[0][5]
    console.log(name, description, img_url)

    return(
       <IonContent fullscreen class='bg'>
           <IonHeader>
                <img src={img_url} className="imageArticle" />
           </IonHeader>
           <br></br>
           <IonCol>
                <IonRow>
                    <IonTitle className='title__document'>
                        {name}
                    </IonTitle>
                </IonRow>
                <br></br>
                <IonRow className = 'content-row content__document'>
                    <IonText>
                        {description}
                    </IonText>
                </IonRow>
            </IonCol>
            
       </IonContent>
    );
};

export default Documents;