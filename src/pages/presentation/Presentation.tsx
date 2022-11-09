import React, { useState } from 'react';
import { useParams } from 'react-router';
import { IonContent, IonImg, IonPage } from '@ionic/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Lazy } from 'swiper';
import AppBarPopOver from '../../components/AppBarPopOver';
import useGetPresentationImages from '../../hooks/useGetPresentationImages';
import './Presentation.css';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/lazy';
import '@ionic/react/css/ionic-swiper.css';

  interface RouteParams{
    driveId : string,
}
const Presentation: React.FC = () => {
  const {driveId} = useParams<RouteParams>();
  const {urlImages, loading} = useGetPresentationImages(driveId);
  const [imgLoading, setImgLoading] = useState(true);
  console.log(urlImages)
  return (
    <IonPage>
        <AppBarPopOver></AppBarPopOver>
        <IonContent fullscreen class='bg-img'>
        {//Still not working. Swipe doesnt work properly.
        }
        <div className='rotate'>
        {!loading && <Swiper className='rotate'
        modules={[Pagination, Lazy]}
        pagination={true}
        lazy={true}
        direction="vertical"
        >
          {
            urlImages?.map((url : any) => {
                console.log(url.id);
                return (
                    <SwiperSlide className='presentation-size'>
                      <IonImg 
                    onIonImgDidLoad={() => {setImgLoading(false)}}
                    src={`https://drive.google.com/uc?id=${url.id}`}/></SwiperSlide>
                )
            })
          }
        </Swiper>
        }
        </div>
      </IonContent>
      </IonPage>
  )
}

export default Presentation;