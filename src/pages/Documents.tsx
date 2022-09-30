import React from 'react';
import { IonCol, IonContent, IonHeader, IonImg, IonRow, IonText, IonTitle} from '@ionic/react';
import './Documents.css'
import { useParams } from 'react-router';
import { dummyArticles } from './DocumentsData';

interface RouteParams {
    id:string

}
const Documents: React.FC = () => {
    const {id} = useParams<RouteParams>();
    const article = dummyArticles.find((article) => article.id === id);
    return(
       <IonContent>
           <IonHeader>
                <img src={article?.url_img} className="imageArticle"></img>
           </IonHeader>
           <br></br>
           <IonCol>
                <IonRow>
                    <IonTitle className='title'>
                        {article?.title}
                    </IonTitle>
                </IonRow>
                <br></br>
                <IonRow className = 'content-row'>
                    <IonText>
                        {article?.content}
                    </IonText>
                </IonRow>
            </IonCol>
            
       </IonContent>
    );
};

export default Documents;