import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory } from 'react-router-dom';
import { IonContent, IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonButton, IonIcon, IonList, IonItem, IonLabel, IonPopover, IonTitle } from '@ionic/react';
import { menuOutline, heart, personCircle, logOut, chevronBackOutline, chevronForwardOutline, expandOutline, contractOutline } from 'ionicons/icons';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Keyboard } from 'swiper';
import type { Swiper as SwiperInstance } from 'swiper';
import { getPresentations } from '../../api/content';
import { clearSession, isLoggedIn } from '../../utils/session';
import useMediaQuery, { DESKTOP_QUERY } from '../../hooks/useMediaQuery';
import './Presentation.css';
import 'swiper/css';
import 'swiper/css/pagination';
import '@ionic/react/css/ionic-swiper.css';

interface RouteParams {
  driveId: string;
}

const Presentation: React.FC = () => {
  const { driveId } = useParams<RouteParams>();
  const [slides, setSlides] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [loading, setLoading] = useState(true);
  const { current: popoverId } = useRef(`pres-menu-${Math.random().toString(36).substr(2, 6)}`);
  const history = useHistory();

  const isUserLogged = isLoggedIn();

  useEffect(() => {
    setSlides([]);
    setLoading(true);
    getPresentations()
      .then(data => {
        if (data.success) {
          const match = data.presentations.find((p: any) => p._id === driveId);
          if (match) {
            setSlides(match.slides);
            setTitle(match.name ?? '');
          }
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [driveId]);

  function logOutUser() {
    clearSession();
    history.replace('/');
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="dark-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tab1" text={isDesktop ? 'Aprende' : ''} />
          </IonButtons>
          {isDesktop && title && <IonTitle className="presd-toolbar-title">{title}</IonTitle>}
          <IonButtons slot="end">
            <IonButton id={popoverId} className="dark-toolbar__menu-btn">
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
      <IonContent fullscreen class={isDesktop ? 'presd-content' : 'bg-img'}>
        {isDesktop && loading && (
          <div className="presd" aria-busy="true">
            <div className="presd__skeleton shimmer" />
            <div className="presd__skeleton-strip shimmer" />
          </div>
        )}
        {isDesktop && !loading && slides.length > 0 && <SlideStage key={driveId} slides={slides} />}
        {!loading && slides.length === 0 && (
          <p className="page-message">
            No pudimos cargar esta presentaci&oacute;n. Puede que ya no est&eacute; publicada o que no haya conexi&oacute;n.
          </p>
        )}
        {!isDesktop && !loading && slides.length > 0 && (
          <Swiper
            key={driveId}
            className='mySwiper'
            direction={"horizontal"}
            modules={[Pagination]}
            pagination={true}
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

/* Escritorio: la diapositiva al tamano maximo que quepa, flechas a los lados, teclado, tira
   de miniaturas y pantalla completa. Mobile sigue con el carrusel de puntos de arriba. */
const SlideStage: React.FC<{ slides: string[] }> = ({ slides }) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const [swiper, setSwiper] = useState<SwiperInstance | null>(null);
  const [index, setIndex] = useState(0);
  const [isFull, setIsFull] = useState(false);

  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else stageRef.current?.requestFullscreen();
  }

  useEffect(() => {
    const onChange = () => setIsFull(document.fullscreenElement === stageRef.current);
    /* Ionic deja la pagina montada al volver a APRENDE: offsetParent es null cuando esta
       oculta, asi la F no abre pantalla completa desde otra pantalla. */
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey && !e.altKey
        && stageRef.current?.offsetParent !== null && !(e.target instanceof HTMLInputElement)) {
        toggleFullscreen();
      }
    };
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // La miniatura actual se centra en la tira. scrollTo y no scrollIntoView, que tambien
  // moveria el scroll vertical de la pagina.
  useEffect(() => {
    const strip = stripRef.current;
    const thumb = strip?.children[index] as HTMLElement | undefined;
    if (!strip || !thumb) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    strip.scrollTo({
      left: thumb.offsetLeft - strip.clientWidth / 2 + thumb.clientWidth / 2,
      behavior: reduce ? 'auto' : 'smooth',
    });
  }, [index]);

  const last = slides.length - 1;

  return (
    <div className="presd" ref={stageRef}>
      <div className="presd__stage">
        <button
          className="presd__nav"
          onClick={() => swiper?.slidePrev()}
          disabled={index === 0}
          aria-label="Diapositiva anterior"
          aria-keyshortcuts="ArrowLeft"
        >
          <IonIcon icon={chevronBackOutline} aria-hidden="true" />
        </button>

        <Swiper
          className="presd__swiper"
          modules={[Keyboard]}
          keyboard={{ enabled: true }}
          spaceBetween={48}
          onSwiper={setSwiper}
          onSlideChange={s => setIndex(s.activeIndex)}
        >
          {slides.map((url, i) => (
            <SwiperSlide key={i}>
              <img src={url} alt={`Diapositiva ${i + 1} de ${slides.length}`} />
            </SwiperSlide>
          ))}
        </Swiper>

        <button
          className="presd__nav"
          onClick={() => swiper?.slideNext()}
          disabled={index === last}
          aria-label="Diapositiva siguiente"
          aria-keyshortcuts="ArrowRight"
        >
          <IonIcon icon={chevronForwardOutline} aria-hidden="true" />
        </button>
      </div>

      <div className="presd__footer">
        <div className="presd__count">
          <p className="presd__count-value" aria-live="polite">
            <span className="presd__count-current">{index + 1}</span> de {slides.length}
          </p>
          <p className="presd__hint">Avanza con las flechas del teclado</p>
        </div>

        <div className="presd__strip" ref={stripRef}>
          {slides.map((url, i) => (
            <button
              key={i}
              className="presd__thumb"
              onClick={() => swiper?.slideTo(i)}
              aria-label={`Ir a la diapositiva ${i + 1}`}
              aria-current={i === index ? 'true' : undefined}
            >
              <img src={url} alt="" loading="lazy" />
            </button>
          ))}
        </div>

        <button
          className="presd__icon-btn"
          onClick={toggleFullscreen}
          aria-label={isFull ? 'Salir de pantalla completa' : 'Ver en pantalla completa'}
          title={isFull ? 'Salir de pantalla completa (F)' : 'Pantalla completa (F)'}
          aria-keyshortcuts="F"
        >
          <IonIcon icon={isFull ? contractOutline : expandOutline} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default Presentation;
