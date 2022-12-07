import { IonIcon, IonButton, IonButtons } from "@ionic/react";
import { Icon } from "ionicons/dist/types/components/icon/icon";
import { arrowForward, close } from "ionicons/icons";
import { useRef, useState } from "react";
import './TutorialCard.css';

interface CardProps {
  message: string;
  character: string; // Ej. gota1, gota2, mundo1, maceta3
  align: string; // Opciones: left, right
}

interface CardSlides {
  slides: CardProps[];
}

const TutorialCard: React.FC<CardSlides> = (props) => {
  const nSlides = props.slides.length;
  const [currSlide, nextSlide] = useState(0);
  const onClickNext = () => nextSlide(currSlide+1);
  const [className, setClassName] = useState('tutorial-card');
  const onClickEnd = () => {
    sessionStorage.setItem("tutorial", "false");
    setClassName('tutorial-card-hide');
  }
  var dialogueClass = "dialogue-box db-"+props.slides[currSlide].align;
  var showNext = 'tutorial-card-button-bottom';
  if(currSlide == nSlides-1){
    showNext = 'tutorial-card-hide';
  }
  var characterImgUrl:string[] = [];
  for(var i = 0; i < nSlides; i++){
    const aux = '/assets/characters/'+props.slides[i].character+'.png'
    characterImgUrl.push(aux);
  }

  return (
    <div className={className}>
      <IonButtons className="tutorial-card-button">
        <IonButton type="submit" onClick={onClickEnd}><IonIcon icon={close}></IonIcon></IonButton>
      </IonButtons>
      <div className="tutorial-card-body">
        <div className={dialogueClass}>
          <p>{props.slides[currSlide].message}</p>
        </div>
        <div className="img-arrow">
          <img src={characterImgUrl[currSlide]} className={props.slides[currSlide].align}></img>
          <IonButtons className={showNext}>
            <IonButton type="submit" className="float-bottom" onClick={onClickNext}><IonIcon icon={arrowForward}></IonIcon></IonButton>
          </IonButtons>
        </div>
      </div>
    </div>
  );
};

export default TutorialCard;