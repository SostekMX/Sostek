import React from 'react';
import { IonCard, IonIcon } from '@ionic/react';
import { businessOutline, colorPaletteOutline, schoolOutline, helpCircleOutline } from 'ionicons/icons';
import './EvaluationCard.css';

interface EvaluationCardProps {
    name: string;
    id: string;
    career: string;
    description?: string;
    questionCount?: number;
}

const EVALUATION_META: Record<string, { icon: string; description: string }> = {
    'Arquitectura Nivel 1': {
        icon: businessOutline,
        description: 'Mide si conoces y tomaste en cuenta los factores ambientales y sociales básicos en el análisis de tu proyecto.',
    },
    'Arquitectura Nivel 2': {
        icon: businessOutline,
        description: 'Mide cómo integras estrategias de sostenibilidad en el diseño y desarrollo de tu proyecto.',
    },
    'Arquitectura Nivel 3': {
        icon: businessOutline,
        description: 'Mide si tu proyecto plantea sistemas y programas de sostenibilidad a largo plazo.',
    },
    'Diseño Industrial Nivel 1': {
        icon: colorPaletteOutline,
        description: 'Mide tu conocimiento básico sobre impacto ambiental y sostenibilidad en el diseño de productos.',
    },
    'Diseño Industrial Nivel 2': {
        icon: colorPaletteOutline,
        description: 'Mide cómo consideras la sostenibilidad en tu proceso de diseño y selección de materiales.',
    },
    'Diseño Industrial Nivel 3': {
        icon: colorPaletteOutline,
        description: 'Mide qué tan profundo integra tu proyecto criterios de sostenibilidad en todo su ciclo de vida.',
    },
};

function getCareerMeta(name: string, career: string) {
    return EVALUATION_META[name] ?? {
        icon: schoolOutline,
        description: 'Evaluación general de sostenibilidad para proyectos académicos.',
    };
}

const EvaluationCard: React.FC<EvaluationCardProps> = ({ name, id, career, description, questionCount }) => {
    const meta = getCareerMeta(name, career);
    const displayDescription = description ?? meta.description;

    return (
        <IonCard
            className='evaluation__card'
            button
            routerDirection='forward'
            href={`/Evaluation/${name}/${id}`}
        >
            <div className='evaluation-card__accent' />
            <div className='evaluation-card__body'>
                <div className='evaluation-card__header'>
                    <IonIcon icon={meta.icon} className='evaluation-card__icon' />
                    <span className='evaluation-card__badge'>{career}</span>
                </div>
                <p className='evaluation__title'>{name}</p>
                <p className='evaluation-card__desc'>{displayDescription}</p>
                {questionCount !== undefined && (
                    <p className='evaluation-card__meta'>
                        <IonIcon icon={helpCircleOutline} />
                        {questionCount} preguntas
                    </p>
                )}
            </div>
        </IonCard>
    );
};

export default EvaluationCard;
