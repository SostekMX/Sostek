import { IonItem, IonLabel, IonRadio, IonRadioGroup } from '@ionic/react';
import { useI18n } from '../i18n/LanguageContext';
import { QuizQuestion } from '../utils/quiz';
import './QuestionTestCard.css';

interface Props {
    id: string;
    number: number;
    question: QuizQuestion;
    /* Orden en pantalla: indices originales de las opciones, ya barajados. */
    order: number[];
    value: number | undefined;
    onAnswer: (option: number) => void;
}

/* Pregunta de opcion unica con el mismo aspecto que las de la evaluacion. El valor es el
 * indice original de la opcion, asi que el barajado no toca el puntaje.
 */
const QuizQuestionCard: React.FC<Props> = ({ id, number, question, order, value, onAnswer }) => {
    const { tx } = useI18n();
    const optionsInGrid = question.options.length >= 4 && question.options.every(o => tx(o.text).length <= 60);
    const labelId = `${id}-text`;

    return (
        <section id={id} className='question'>
            <h3 className='question__text' id={labelId}>
                <span className='question__number'>{number}.</span> {tx(question.text)}
            </h3>

            <IonRadioGroup
                value={value}
                aria-labelledby={labelId}
                /* ionChange tambien llega cuando `value` cambia desde React; solo se avisa
                   si es una eleccion nueva. */
                onIonChange={e => {
                    if (e.detail.value !== undefined && e.detail.value !== value) onAnswer(e.detail.value);
                }}
            >
                <div className={`question__options${optionsInGrid ? ' question__options--grid' : ''}`}>
                    {order.map(index => (
                        <IonItem key={index} lines='none' className={`question__option${value === index ? ' question__option--on' : ''}`}>
                            <IonRadio slot='start' mode='md' value={index} />
                            <IonLabel className='question__label'>{tx(question.options[index].text)}</IonLabel>
                        </IonItem>
                    ))}
                </div>
            </IonRadioGroup>
        </section>
    );
};

export default QuizQuestionCard;
