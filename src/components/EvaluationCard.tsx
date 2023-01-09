import React, { useState } from 'react';
import './EvaluationCard.css';
import { IonCard, 
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle, 
    IonImg, 
    IonText,

 } from '@ionic/react';
interface EvaluationCardProps{
    name: string,
    img: string
    id: string
}

const EvaluationCard: React.FC<EvaluationCardProps> = ({name, img, id}) => {
    const [imgLoading, setImgLoading] = useState(true);
    return(
        <div className='evaluation__container'>
            <IonCard
            className='evaluation__card' 
            button 
            routerDirection='forward'  
            href={`/Evaluation/${name}/${id}` }>
                <IonImg className="evaluation-card-image"
                    onIonImgDidLoad={() => {setImgLoading(false)}}
                    src={imgLoading ? 
                        "https://mir-s3-cdn-cf.behance.net/project_modules/disp/35771931234507.564a1d2403b3a.gif" 
                        : "https://images.squarespace-cdn.com/content/v1/5e45e5757350894b2a8b7b22/1594786912198-9XNHE7NDFGDN0M9JEHYJ/image-asset.jpeg?format=750w"} 
                />
                <br />
                    <IonCardSubtitle className='title ion-text-center'>{name}</IonCardSubtitle>
                    <br />
            </IonCard>
        </div>
    );
};

export default EvaluationCard;