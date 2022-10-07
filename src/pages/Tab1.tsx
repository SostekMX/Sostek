import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import TutorialCard from '../components/TutorialCard';
import './Tab1.css';

const exampleCard = {
  message: 'Bienvenidos a Sostek, este es un tutorial.',
  character: 'gota1',
  align: 'right'
}

const Tab1: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tab 1</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <TutorialCard message={exampleCard.message} character={exampleCard.character} align={exampleCard.align}></TutorialCard>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tab 1</IonTitle>
          </IonToolbar>
        </IonHeader>
        <ExploreContainer name="Tab 1 page" />
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
