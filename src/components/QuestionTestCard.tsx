import './QuestionTestCard.css';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonList, IonRadioGroup, IonListHeader, IonLabel, IonRadio, IonCheckbox } from '@ionic/react';
import { useContext, useState } from 'react';
import AppContext from '../context/AppContext';

interface props {
    question: string | undefined;
    comments: string | undefined;
    options: Array<string> | undefined;
    points: Array<string> | undefined;
}

/* Question card component that requires a question, comments (could be specific instructions for particular questions),
 * options (an array of all the options, doesn't matter the size).
 */
const QuestionTestCard: React.FC<props> = ({ question, comments, options, points }) => {
    // Variable that holds the choice the user selected
    const [selection, setSelection] = useState<string>();
    let sumArray : Array<boolean> = [];

    const { addScore } = useContext(AppContext);

    return (
        <IonCard>
            <IonCardHeader>
                <IonCardTitle>{question}</IonCardTitle>
            </IonCardHeader>

            <IonCardContent>
                <IonList>
                    { 
                        // Verifies if there are any comments, if no, it avoids displaying an empty string within the card
                        comments &&
                        <IonListHeader>
                            <IonLabel>{comments}</IonLabel>
                        </IonListHeader>
                    }
                        {
                            // Iterates through all the elements in the array to create option components in React
                            options && options.map((option, index) => (
                                <IonItem class="ion-text-wrap">
                                    <IonCheckbox
                                    // The answer has the question and score added to prevent another answer to conflict in sumScore
                                    onIonChange={(e) => addScore!(`${question}${option}${points![index]}`, index)} 
                                    class="ion-text-wrap"
                                    slot="start" 
                                    value={Number(points![index])} />
                                    <IonLabel class="ion-text-wrap">{option}</IonLabel>
                                </IonItem>
                            ))
                        }
                </IonList>
            </IonCardContent>
        </IonCard>
    );
};

export default QuestionTestCard;