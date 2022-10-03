import './QuestionTestCard.css';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonList, IonRadioGroup, IonListHeader, IonLabel, IonRadio } from '@ionic/react';
import { useState } from 'react';

interface props {
    question: string;
    comments: string;
    options: Array<string>;
}

/* Question card component that requires a question, comments (could be specific instructions for particular questions),
 * options (an array of all the options, doesn't matter the size).
 */
const QuestionTestCard: React.FC<props> = ({ question, comments, options }) => {
    // Variable that holds the choice the user selected
    const [selection, setSelection] = useState<string>();

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
                    <IonRadioGroup onIonChange={e => setSelection(e.detail.value)}>
                        {
                            // Iterates through all the elements in the array to create option components in React
                            options.map(option => (
                                <IonItem>
                                    <IonRadio slot="start" value={option} />
                                    <IonLabel>{option}</IonLabel>
                                </IonItem>
                            ))
                        }
                    </IonRadioGroup>
                </IonList>
            </IonCardContent>
        </IonCard>
    );
};

export default QuestionTestCard;