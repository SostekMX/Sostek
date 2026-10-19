import React from 'react';
import { IonCard, IonIcon } from '@ionic/react';
import { businessOutline, colorPaletteOutline, schoolOutline, helpCircleOutline } from 'ionicons/icons';
import './EvaluationCard.css';

interface EvaluationCardProps {
    name: string;
    id: string;
    level?: number;
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

function getEvaluationMeta(name: string) {
    return EVALUATION_META[name] ?? {
        icon: schoolOutline,
        description: 'Evaluación general de sostenibilidad para proyectos académicos.',
    };
}

const EvaluationCard: React.FC<EvaluationCardProps> = ({ name, id, level, description, questionCount }) => {
    const meta = getEvaluationMeta(name);
    /* `||` y no `??`: el backend manda description: '' por defecto del esquema, y la
       cadena vacia no es nullish, asi que con ?? ganaba '' y la tarjeta salia sin texto. */
    const displayDescription = description || meta.description;
    /* El semestre viene al inicio de la descripcion: "(3°-4° semestre) Mide...". En mobile
       el texto se lee igual que siempre; en escritorio el parentesis se esconde y el
       semestre sale como etiqueta propia junto al numero de nivel. */
    const semesterMatch = /^\s*\(([^)]+)\)\s*/.exec(displayDescription);
    const semester = semesterMatch?.[1];
    const descriptionRest = semesterMatch ? displayDescription.slice(semesterMatch[0].length) : displayDescription;

    return (
        <IonCard
            className='evaluation__card'
            button
            routerDirection='forward'
            href={`/Evaluation/${name}/${id}`}
        >
            {/* La misma barra de siempre, ahora llena 1/3, 2/3 o el total segun el nivel:
                es el indicador de progresion, sin marcado nuevo. */}
            <div
                className='evaluation-card__accent'
                style={{ '--accent-fill': level ? `${(level / 3) * 100}%` : '100%' } as any}
            />
            <div className='evaluation-card__body'>
                <div className='evaluation-card__header'>
                    <IonIcon icon={meta.icon} className='evaluation-card__icon' />
                    {questionCount !== undefined && (
                        <span className='evaluation-card__badge'>
                            <IonIcon icon={helpCircleOutline} />
                            {questionCount} preguntas
                        </span>
                    )}
                </div>
                {/* La carrera ya esta en el encabezado del grupo, asi que la tarjeta
                    solo necesita decir de que nivel es. */}
                {level !== undefined && (
                    <div className='evaluation-card__level' aria-hidden='true'>
                        <span className='evaluation-card__level-number'>{level}</span>
                        {semester && <span className='evaluation-card__semester'>{semester}</span>}
                    </div>
                )}
                <p className='evaluation__title'>{level ? `Nivel ${level}` : name}</p>
                <p className='evaluation-card__desc'>
                    {semesterMatch
                        ? <><span className='evaluation-card__desc-semester'>{semesterMatch[0]}</span>{descriptionRest}</>
                        : displayDescription}
                </p>
                <p className='evaluation-card__start'>Empezar evaluación</p>
            </div>
        </IonCard>
    );
};

export default EvaluationCard;
