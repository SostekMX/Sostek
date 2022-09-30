import './QuestionTestCard.css';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonSelect, IonList, IonSelectOption } from '@ionic/react';

interface props {
    title: string;
    question: string;
    options: {
        ans1: string;   
        ans2: string;   
        ans3: string;   
        ans4: string;   
        ans5: string;   
    }
}

const QuestionTestCard: React.FC<props> = ({ title, question, options }) => {
  return (
        <IonCard>
            <IonCardHeader>
                <IonCardTitle>{title}</IonCardTitle>
            </IonCardHeader>

            <IonCardContent>
                <IonLabel>{question}</IonLabel>
                <IonList>
                    <IonItem>
                        <IonSelect placeholder="Select fruit">
                            <IonSelectOption value={options.ans1}>{options.ans1}</IonSelectOption>
                            <IonSelectOption value={options.ans2}>{options.ans2}</IonSelectOption>
                            <IonSelectOption value={options.ans3}>{options.ans3}</IonSelectOption>
                            <IonSelectOption value={options.ans4}>{options.ans4}</IonSelectOption>
                            <IonSelectOption value={options.ans5}>{options.ans5}</IonSelectOption>
                        </IonSelect>
                    </IonItem>
                </IonList>
            </IonCardContent>
        </IonCard>
  );
};

export default QuestionTestCard;