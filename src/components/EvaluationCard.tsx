import React from 'react';
import './EvaluationCard.css';
import { IonCard } from '@ionic/react';

interface EvaluationCardProps {
    name: string;
    id: string;
    career: string;
}

const EvaluationCard: React.FC<EvaluationCardProps> = ({ name, id, career }) => {
    return (
        <IonCard
            className='evaluation__card'
            button
            routerDirection='forward'
            href={`/Evaluation/${name}/${id}`}
        >
            <div className='evaluation-card__accent' />
            <div className='evaluation-card__body'>
                <p className='evaluation__title'>{name}</p>
                <span className='evaluation-card__badge'>{career}</span>
            </div>
        </IonCard>
    );
};

export default EvaluationCard;
