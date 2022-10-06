import { IonIcon, IonButton, IonButtons } from "@ionic/react";
import { close } from "ionicons/icons";
import { useRef, useState } from "react";
import './TutorialCard.css';

interface CardProps {
    message: string;
    imageUrl: string;
}

const TutorialCard: React.FC<CardProps> = (props) => {
  const [className, setClassName] = useState('tutorial-card');
  const onClick = () => setClassName('tutorial-card-hide');

  return (
    <div className={className}>
      <IonButtons className="tutorial-card-button">
        <IonButton type="submit" onClick={onClick}><IonIcon icon={close}></IonIcon></IonButton>
      </IonButtons>
      <div className="tutorial-card-body">
        <p>{props.message}</p>
        <img src={props.imageUrl}></img>
      </div>
    </div>
  );
};

export default TutorialCard;