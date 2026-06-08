import './QuestionTestCard.css';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonList, IonRadioGroup, IonListHeader, IonLabel, IonRadio, IonCheckbox } from '@ionic/react';
import { useContext, useState } from 'react';
import AppContext from '../context/AppContext';

interface props {
    question: string | undefined;
    category: string | undefined;
    comments: string | undefined;
    options: Array<string> | undefined;
    points: Array<string> | undefined;
}

/* Question card component that requires a question, comments (could be specific instructions for particular questions),
 * options (an array of all the options, doesn't matter the size).
 */
const QuestionTestCard: React.FC<props> = ({ question, category, comments, options, points }) => {
    // Variable that holds the choice the user selected
    const [selection, setSelection] = useState<string>();
    let sumArray : Array<boolean> = [];

    const { addScore } = useContext(AppContext);

    return (
        <IonCard className="eval-card" style={{'--color': '#f0f0f0'} as any}>
            <IonCardHeader>
                <IonCardTitle>{question}</IonCardTitle>
            </IonCardHeader>

            <IonCardContent>
                <IonList>
                    {comments &&
                        <IonListHeader>
                            <IonLabel>{comments}</IonLabel>
                        </IonListHeader>
                    }
                    {options && options.map((option, index) => (
                        <IonItem key={index} class="ion-text-wrap">
                            <IonCheckbox
                                onIonChange={(_e: any) => addScore!(category!, `${question}${option}${points![index]}`, index)}
                                class="ion-text-wrap"
                                slot="start"
                                value={Number(points![index])}
                            />
                            <IonLabel class="ion-text-wrap">{option}</IonLabel>
                        </IonItem>
                    ))}
                </IonList>
            </IonCardContent>
        </IonCard>
    );
};

export default QuestionTestCard;