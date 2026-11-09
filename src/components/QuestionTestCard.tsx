import { IonCheckbox, IonItem, IonLabel } from '@ionic/react';
import { AnswerMap } from '../utils/scoring';
import { axisOf, isMixedAxis } from '../utils/axis';
import { useI18n } from '../i18n/LanguageContext';
import './QuestionTestCard.css';

export interface Option {
    text: string;
    value: number;
}

interface props {
    id: string;
    number: number;
    questionIndex: number;
    question: string | undefined;
    category: string | undefined;
    options: Option[];
    answers: AnswerMap;
    onToggle: (key: string, category: string, value: number) => void;
}

/* Tarjeta de pregunta: el texto, su eje y las opciones (cualquier cantidad).
 *
 * Las casillas son controladas: lo que se ve marcado sale del mismo mapa del que sale el
 * puntaje, asi que no pueden decir cosas distintas.
 */
const QuestionTestCard: React.FC<props> = ({ id, number, questionIndex, question, category, options, answers, onToggle }) => {
    const { tx } = useI18n();
    const axis = axisOf(category);
    const mixedAxis = isMixedAxis(category);
    /* Dos columnas solo si todas las opciones son cortas: una oracion larga partida en una
       columna angosta se lee peor que en una sola. */
    const optionsInGrid = options.length >= 4 && options.every(o => tx(o.text).length <= 60);

    return (
        <section id={id} className='question'>
            {category && (
                <span className={`axis-tag${axis ? ` axis-${axis}` : ''}${mixedAxis ? ' axis-tag--mixed' : ''}`}>
                    {tx(category)}
                </span>
            )}
            <h2 className='question__text'>
                <span className='question__number'>{number}.</span> {tx(question)}
            </h2>

            <div className={`question__options${optionsInGrid ? ' question__options--grid' : ''}`}>
                {options.map((option, index) => {
                    const key = `${questionIndex}:${index}`;
                    const checked = answers.has(key);
                    return (
                        <IonItem key={key} lines='none' className={`question__option${checked ? ' question__option--on' : ''}`}>
                            <IonCheckbox
                                checked={checked}
                                /* ionChange tambien se emite cuando `checked` cambia desde
                                   React (al vaciar el mapa, por ejemplo). Solo actuamos si
                                   lo que pide el evento difiere de lo que ya tenemos, para
                                   no volver a marcar lo que acabamos de limpiar. */
                                onIonChange={(e: any) => {
                                    if (e.detail.checked !== checked) onToggle(key, category!, option.value);
                                }}
                                slot='start'
                            />
                            <IonLabel className='question__label'>{tx(option.text)}</IonLabel>
                        </IonItem>
                    );
                })}
            </div>
        </section>
    );
};

export default QuestionTestCard;
