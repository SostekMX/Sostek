import React from 'react';
import { useI18n } from '../i18n/LanguageContext';
import './EvaluationCard.css';

interface EvaluationCardProps {
    name: string;
    id: string;
    level?: number;
    description?: string;
    questionCount?: number;
}

/* Respaldo por si la evaluacion llega sin descripcion: el seed las recrea sin ese campo. */
const FALLBACK_DESCRIPTION: Record<string, string> = {
    'Arquitectura Nivel 1': 'Mide si conoces y tomaste en cuenta los factores ambientales y sociales básicos en el análisis de tu proyecto.',
    'Arquitectura Nivel 2': 'Mide cómo integras estrategias de sostenibilidad en el diseño y desarrollo de tu proyecto.',
    'Arquitectura Nivel 3': 'Mide si tu proyecto plantea sistemas y programas de sostenibilidad a largo plazo.',
    'Diseño Industrial Nivel 1': 'Mide tu conocimiento básico sobre impacto ambiental y sostenibilidad en el diseño de productos.',
    'Diseño Industrial Nivel 2': 'Mide cómo consideras la sostenibilidad en tu proceso de diseño y selección de materiales.',
    'Diseño Industrial Nivel 3': 'Mide qué tan profundo integra tu proyecto criterios de sostenibilidad en todo su ciclo de vida.',
};

const GENERIC_DESCRIPTION = 'Evaluación general de sostenibilidad para proyectos académicos.';

const EvaluationCard: React.FC<EvaluationCardProps> = ({ name, id, level, description, questionCount }) => {
    const { t, tx } = useI18n();
    /* `||` y no `??`: el backend manda description: '' por defecto del esquema, y la
       cadena vacia no es nullish, asi que con ?? ganaba '' y la tarjeta salia sin texto. */
    const displayDescription = tx(description || FALLBACK_DESCRIPTION[name] || GENERIC_DESCRIPTION);
    /* El semestre viene al inicio de la descripcion: "(3°-4° semestre) Mide...". Sale como
       dato junto al nivel y el resto se lee como descripcion. */
    const semesterMatch = /^\s*\(([^)]+)\)\s*/.exec(displayDescription);
    const semester = semesterMatch?.[1];
    const descriptionRest = semesterMatch ? displayDescription.slice(semesterMatch[0].length) : displayDescription;

    return (
        <a className='level' href={`/Evaluation/${name}/${id}`}>
            {level !== undefined && <span className='level__n' aria-hidden='true'>{level}</span>}
            <div className='level__body'>
                <p className='level__title'>
                    {level ? t('evalCard.level', { n: level }) : tx(name)}
                    {semester && <span className='level__semester'>{semester}</span>}
                </p>
                <p className='level__desc'>{descriptionRest}</p>
                <p className='level__foot'>
                    {questionCount !== undefined && <span>{t('evalCard.questions', { n: questionCount })}</span>}
                    <span className='level__start'>{t('assess.cta')}</span>
                </p>
            </div>
        </a>
    );
};

export default EvaluationCard;
