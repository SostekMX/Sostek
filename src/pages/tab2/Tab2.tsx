import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import AppBarPopOver from '../../components/AppBarPopOver';
import ExploreContainer from '../../components/ExploreContainer';
import './Tab2.css';

const Tab2: React.FC = () => {
  return (
    <IonPage>
      <AppBarPopOver></AppBarPopOver>
      <IonContent fullscreen class='bg-img' >
        <IonHeader collapse="condense">
        </IonHeader>
        <div className='under_construction-container'>
          <p className='under_construction_text'><b>El juego online sigue en construcci&oacute;n. Mientras tanto puedes disfrutar de la versi&oacute;n física que puedes descargar en el siguiente enlace:</b></p>
          <p className='under_construction_link'><a href="https://drive.google.com/file/d/1ZBfQKAAVHg7BtDwt1iblhgKk3ykbTOO3/view">Descargar versi&oacute;n f&iacute;sica</a></p>
        </div>
        <div className='video-container'>
          <h1 className='video-container__title'><b>Survival</b></h1>
          <video className='video-container__video' controls width="100%">
            <source src="/assets/survivor.m4v"/>
          </video>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
