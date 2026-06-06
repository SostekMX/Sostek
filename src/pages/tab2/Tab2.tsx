import { IonContent, IonHeader, IonPage } from '@ionic/react';
import AppBarPopOver from '../../components/layout/AppBarPopOver';
import './Tab2.css';

const Tab2: React.FC = () => {
  return (
    <IonPage>
      <AppBarPopOver />
      <IonContent fullscreen class='app-dark-bg'>
        <IonHeader collapse="condense" />
        <div className='juega-page'>

          <div className='juega-hero'>
            <p className='juega-hero__label'>VIDEOJUEGO EDUCATIVO</p>
            <h1 className='juega-hero__title'>Survivor</h1>
            <p className='juega-hero__subtitle'>Aprende sobre sostenibilidad mientras juegas</p>
          </div>

          <div className='juega-video-wrapper'>
            <video className='juega-video' controls>
              <source src="/assets/survivor.m4v" />
            </video>
          </div>

          <a
            href="https://drive.google.com/file/d/1ZBfQKAAVHg7BtDwt1iblhgKk3ykbTOO3/view"
            target="_blank"
            rel="noopener noreferrer"
            className='juega-download-card'
          >
            <div className='juega-download-card__icon'>&#8595;</div>
            <div>
              <p className='juega-download-card__title'>Versi&oacute;n f&iacute;sica</p>
              <p className='juega-download-card__desc'>Descarga y juega sin conexi&oacute;n a internet</p>
            </div>
          </a>

          <div className='juega-wip'>
            <div className='juega-wip__dot' />
            <p className='juega-wip__text'>La versi&oacute;n online est&aacute; en construcci&oacute;n &mdash; pr&oacute;ximamente disponible</p>
          </div>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
