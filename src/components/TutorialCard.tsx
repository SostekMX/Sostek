import { IonIcon, IonButton, IonButtons } from "@ionic/react";
import { close } from "ionicons/icons";
import { useRef, useState } from "react";
import './TutorialCard.css';

interface CardProps {
    message: string;
    character: string; // Ej. gota1, gota2, mundo1, maceta3
    align: string; // Opciones: left, right
}

const TutorialCard: React.FC<CardProps> = (props) => {
  const [className, setClassName] = useState('tutorial-card');
  const onClick = () => setClassName('tutorial-card-hide');
  const characterImgUrl = '/assets/characters/'+props.character+'.png';

  return (
    <div className={className}>
      <div className="block-background"></div>
      <IonButtons className="tutorial-card-button">
        <IonButton type="submit" onClick={onClick}><IonIcon icon={close}></IonIcon></IonButton>
      </IonButtons>
      <div className="tutorial-card-body">
        <p>{props.message}</p>
        <img src={characterImgUrl} className={props.align}></img>
      </div>
    </div>
  );
};

export default TutorialCard;