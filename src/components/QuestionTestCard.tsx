import './QuestionTestCard.css';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonList, IonListHeader, IonLabel, IonCheckbox } from '@ionic/react';
import { AnswerMap } from '../utils/scoring';

export interface Option {
    text: string;
    value: number;
}

interface props {
    number: number;
    questionIndex: number;
    question: string | undefined;
    category: string | undefined;
    comments: string | undefined;
    options: Option[];
    answers: AnswerMap;
    onToggle: (key: string, category: string, value: number) => void;
}

/* Question card component that requires a question, comments (could be specific instructions for particular questions),
 * options (an array of all the options, doesn't matter the size).
 *
 * Las casillas son controladas: lo que se ve marcado sale del mismo mapa del que sale el
 * puntaje, asi que no pueden decir cosas distintas.
 */
const QuestionTestCard: React.FC<props> = ({ number, questionIndex, question, category, comments, options, answers, onToggle }) => {
    return (
        <IonCard className="eval-card" style={{'--color': '#f0f0f0'} as any}>
            <IonCardHeader>
                <IonCardTitle><span className="eval-card__number">{number}.</span> {question}</IonCardTitle>
            </IonCardHeader>

            <IonCardContent>
                <IonList>
                    {comments &&
                        <IonListHeader>
                            <IonLabel>{comments}</IonLabel>
                        </IonListHeader>
                    }
                    {options.map((option, index) => {
                        const key = `${questionIndex}:${index}`;
                        const checked = answers.has(key);
                        return (
                            <IonItem key={key} class="ion-text-wrap">
                                <IonCheckbox
                                    checked={checked}
                                    /* ionChange tambien se emite cuando `checked` cambia desde
                                       React (al vaciar el mapa, por ejemplo). Solo actuamos si
                                       lo que pide el evento difiere de lo que ya tenemos, para
                                       no volver a marcar lo que acabamos de limpiar. */
                                    onIonChange={(e: any) => {
                                        if (e.detail.checked !== checked) onToggle(key, category!, option.value);
                                    }}
                                    class="ion-text-wrap"
                                    slot="start"
                                />
                                <IonLabel class="ion-text-wrap">{option.text}</IonLabel>
                            </IonItem>
                        );
                    })}
                </IonList>
            </IonCardContent>
        </IonCard>
    );
};

export default QuestionTestCard;
