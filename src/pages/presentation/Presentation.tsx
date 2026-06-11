import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory } from 'react-router-dom';
import { IonContent, IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonButton, IonIcon, IonList, IonItem, IonLabel, IonPopover } from '@ionic/react';
import { menuOutline, heart, personCircle, logOut } from 'ionicons/icons';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Lazy } from 'swiper';
import axios from 'axios';
import { BACKEND_URL } from '../../config';
import './Presentation.css';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/lazy';
import '@ionic/react/css/ionic-swiper.css';

interface RouteParams {
  driveId: string;
}

const Presentation: React.FC = () => {
  const { driveId } = useParams<RouteParams>();
  const [slides, setSlides] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { current: popoverId } = useRef(`pres-menu-${Math.random().toString(36).substr(2, 6)}`);
  const history = useHistory();

  const isUserLogged = sessionStorage.getItem('login') === 'true';

  useEffect(() => {
    axios.get(`${BACKEND_URL}/presentations`)
      .then(res => {
        if (res.data.success) {
          const match = res.data.presentations.find((p: any) => p._id === driveId);
          if (match) setSlides(match.slides);
        }
      })
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
  }, [driveId]);

  function logOutUser() {
    sessionStorage.setItem('login', 'false');
    sessionStorage.removeItem('token');
    history.replace('/');
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="dark-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tab1" text="" />
          </IonButtons>
          <IonButtons slot="end">
            <IonButton id={popoverId}>
              <IonIcon slot="icon-only" icon={menuOutline} />
            </IonButton>
            <IonPopover trigger={popoverId} triggerAction="click">
              <IonList>
                {isUserLogged && <IonItem href="/Favorites"><IonIcon icon={heart} color="secondary" />&nbsp;<IonLabel>Favoritos</IonLabel></IonItem>}
                {isUserLogged && <IonItem href="/Profile"><IonIcon icon={personCircle} color="secondary" />&nbsp;<IonLabel>Perfil</IonLabel></IonItem>}
                {!isUserLogged && <IonItem href="/"><IonIcon icon={personCircle} color="secondary" />&nbsp;<IonLabel>Iniciar Sesión</IonLabel></IonItem>}
                {isUserLogged && <IonItem onClick={logOutUser}><IonIcon icon={logOut} color="secondary" />&nbsp;<IonLabel>Log Out</IonLabel></IonItem>}
              </IonList>
            </IonPopover>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen class='bg-img'>
        {!loading && (
          <Swiper
            key={driveId}
            className='mySwiper'
            direction={"horizontal"}
            modules={[Pagination, Lazy]}
            pagination={true}
            lazy={true}
            initialSlide={0}
          >
            {slides.map((url, index) => (
              <SwiperSlide key={index}>
                <img src={url} alt={`slide ${index + 1}`} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Presentation;
