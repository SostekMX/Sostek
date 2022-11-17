import React, { useState } from 'react';
import { useParams } from 'react-router';
import { IonContent, IonImg, IonLoading, IonPage } from '@ionic/react';
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
        <>
        {
        !loading && <Swiper
        className='mySwiper'
        direction={"vertical"}
        modules={[Pagination, Lazy]}
        pagination={true}
        lazy={true}
        >
          {
            urlImages?.map((url : any) => {
                console.log(url.id);
                return (
                    <SwiperSlide>
                      <IonImg 
                    onIonImgDidLoad={() => {setImgLoading(false)}}
                    onError={(e) => {console.log(e)}}
                    src={ imgLoading ? "https://mir-s3-cdn-cf.behance.net/project_modules/disp/35771931234507.564a1d2403b3a.gif" : `https://drive.google.com/uc?id=${url.id}`}/></SwiperSlide>
                )
            })
          }
        </Swiper>
        }
        </>
      </IonContent>
      </IonPage>
  )
}

export default Presentation;