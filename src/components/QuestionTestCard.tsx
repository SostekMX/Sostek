import './QuestionTestCard.css';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonList, IonLabel, IonCheckbox } from '@ionic/react';
import { AnswerMap } from '../utils/scoring';
import { axisOf, isMixedAxis } from '../utils/axis';

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
    /* Escritorio: el eje de la pregunta va como etiqueta con su color. "Economico y Social"
       es un eje doble y lleva los dos colores. */
    const axis = axisOf(category);
    const mixedAxis = isMixedAxis(category);
    /* Dos columnas solo si todas las opciones son cortas: una oracion larga partida en una
       columna angosta se lee peor que en una sola. */
    const optionsInGrid = options.length >= 4 && options.every(o => o.text.length <= 60);

    return (
        <IonCard id={id} className="eval-card" style={{'--color': '#f0f0f0'} as any}>
            {/* Fuera del IonCardHeader: adentro, Ionic le pone margen al titulo por no ser
                el primer hijo y la tarjeta crecia 8px en mobile aunque la etiqueta este oculta. */}
            {category && (
                <span className={`eval-card__axis${axis ? ` axis-${axis}` : ''}${mixedAxis ? ' eval-card__axis--mixed' : ''}`}>
                    {category}
                </span>
            )}
            <IonCardHeader>
                <IonCardTitle><span className="eval-card__number">{number}.</span> {question}</IonCardTitle>
            </IonCardHeader>

            <IonCardContent>
                <IonList className={optionsInGrid ? 'eval-card__options--grid' : undefined}>
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
