import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { IonContent, IonPage } from '@ionic/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Lazy } from 'swiper';
import axios from 'axios';
import AppBarPopOver from '../../components/layout/AppBarPopOver';
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

  useEffect(() => {
    axios.get('http://localhost:8080/presentations')
      .then(res => {
        if (res.data.success) {
          const match = res.data.presentations.find((p: any) => p._id === driveId);
          if (match) setSlides(match.slides);
        }
      })
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
  }, [driveId]);

  return (
    <IonPage>
      <AppBarPopOver />
      <IonContent fullscreen class='bg-img'>
        {!loading && (
          <Swiper
            className='mySwiper'
            direction={"horizontal"}
            modules={[Pagination, Lazy]}
            pagination={true}
            lazy={true}
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
