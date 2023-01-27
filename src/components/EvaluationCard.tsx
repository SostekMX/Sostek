import React, { useState } from 'react';
import './EvaluationCard.css';
import { IonCard, 
    IonCardSubtitle, 
    IonImg
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
                <img className={imgLoading ? "image-card-loading visible" : "image-card-loading hidden"}
                    src="/assets/Spinner-1s-200px_transparent.svg"
                    alt="loading image" />
                <IonImg className={imgLoading ? "evaluationCard__image hidden" : "evaluationCard__image visible" }
                    onIonImgDidLoad={() => {setImgLoading(false)}}
                    src={imgLoading ? 
                        "/assets/Spinner-1s-200px_transparent.svg" 
                        : img} 
                />
                <div className='evaluation-card__title-container'>
                    <IonCardSubtitle className='evaluation__title ion-text-center'>{name}</IonCardSubtitle>
                </div>
            </IonCard>
        </div>
    );
};

export default EvaluationCard;