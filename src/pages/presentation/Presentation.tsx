import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { IonContent, IonIcon, IonPage, useIonRouter } from '@ionic/react';
import { Button } from 'glisse';
import { arrowBackOutline, chevronBackOutline, chevronForwardOutline, contractOutline, expandOutline } from 'ionicons/icons';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Keyboard } from 'swiper';
import type { Swiper as SwiperInstance } from 'swiper';
import { getPresentations } from '../../api/content';
import useMediaQuery, { DESKTOP_QUERY } from '../../hooks/useMediaQuery';
import { sized } from '../../utils/image';
import { useI18n } from '../../i18n/LanguageContext';
import './Presentation.css';
import 'swiper/css';
import 'swiper/css/pagination';
import '@ionic/react/css/ionic-swiper.css';

interface RouteParams {
  driveId: string;
}

const Presentation: React.FC = () => {
  const { driveId } = useParams<RouteParams>();
  const { t } = useI18n();
  const router = useIonRouter();
  const [slides, setSlides] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [loading, setLoading] = useState(true);

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

  const goBack = () => (router.canGoBack() ? router.goBack() : router.push('/tab1', 'back'));

  return (
    <IonPage>
      <div className='float-bar float-bar--start'>
        <Button icon={<IonIcon icon={arrowBackOutline} aria-hidden='true' />} aria-label={t('doc.backToLearn')} onClick={goBack} />
      </div>

      <IonContent fullscreen scrollY={false}>
        <div className='pres'>
          {title && <h1 className='pres__title'>{title}</h1>}

          {loading && <div className='pres__skeleton shimmer' aria-busy='true' />}

          {!loading && slides.length === 0 && <p className='page-message'>{t('pres.fail')}</p>}

          {isDesktop && !loading && slides.length > 0 && <SlideStage key={driveId} slides={slides} />}

          {!isDesktop && !loading && slides.length > 0 && (
            <Swiper key={driveId} className='pres__swiper' direction='horizontal' modules={[Pagination]} pagination initialSlide={0}>
              {slides.map((url, index) => (
                <SwiperSlide key={index}>
                  <img src={sized(url, 1920)} alt={t('pres.slideAlt', { i: index + 1, n: slides.length })} />
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

/* Escritorio: la diapositiva al tamano maximo que quepa, flechas de vidrio sobre ella,
   teclado, tira de miniaturas y pantalla completa. */
const SlideStage: React.FC<{ slides: string[] }> = ({ slides }) => {
  const { t } = useI18n();
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
    <div className='stage' ref={stageRef}>
      <div className='stage__view'>
        <Swiper
          className='stage__swiper'
          modules={[Keyboard]}
          keyboard={{ enabled: true }}
          spaceBetween={48}
          onSwiper={setSwiper}
          onSlideChange={s => setIndex(s.activeIndex)}
        >
          {slides.map((url, i) => (
            <SwiperSlide key={i}>
              <img src={sized(url, 1920)} alt={t('pres.slideAlt', { i: i + 1, n: slides.length })} />
            </SwiperSlide>
          ))}
        </Swiper>

        <Button
          className='stage__nav stage__nav--prev'
          icon={<IonIcon icon={chevronBackOutline} aria-hidden='true' />}
          onClick={() => swiper?.slidePrev()}
          disabled={index === 0}
          aria-label={t('pres.prev')}
          aria-keyshortcuts='ArrowLeft'
        />
        <Button
          className='stage__nav stage__nav--next'
          icon={<IonIcon icon={chevronForwardOutline} aria-hidden='true' />}
          onClick={() => swiper?.slideNext()}
          disabled={index === last}
          aria-label={t('pres.next')}
          aria-keyshortcuts='ArrowRight'
        />
      </div>

      <div className='stage__footer'>
        <div>
          <p className='stage__count' aria-live='polite'>
            <span className='stage__current'>{index + 1}</span> {t('pres.ofTotal', { n: slides.length })}
          </p>
          <p className='stage__hint'>{t('pres.hint')}</p>
        </div>

        <div className='stage__strip' ref={stripRef}>
          {slides.map((url, i) => (
            <button
              key={i}
              type='button'
              className='stage__thumb'
              onClick={() => swiper?.slideTo(i)}
              aria-label={t('pres.goTo', { i: i + 1 })}
              aria-current={i === index ? 'true' : undefined}
            >
              <img src={sized(url, 320)} alt='' loading='lazy' decoding='async' />
            </button>
          ))}
        </div>

        <Button
          icon={<IonIcon icon={isFull ? contractOutline : expandOutline} aria-hidden='true' />}
          onClick={toggleFullscreen}
          aria-label={isFull ? t('pres.exitFull') : t('pres.enterFull')}
          title={isFull ? t('pres.exitFullKey') : t('pres.enterFullKey')}
          aria-keyshortcuts='F'
        />
      </div>
    </div>
  );
};

export default Presentation;
