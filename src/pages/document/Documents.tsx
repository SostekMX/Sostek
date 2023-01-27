import React, { useContext, useEffect, useState } from 'react';
import { IonCardSubtitle, IonCol, IonContent, IonHeader, IonImg, IonPage, IonRow, IonText, IonTitle} from '@ionic/react';
import './Documents.css'
import { RouteComponentProps, useParams } from 'react-router';
import { dummyArticlesContent } from './DocumentsData';
import AppBarPopOver from '../../components/AppBarPopOver';
import { AppBarMenu } from '../../components/AppBarMenu';
import useGetDocumentData from '../../hooks/useGetDocumentData';
import AppContext from '../../context/AppContext';
import useGetSingleExcelAllData from '../../hooks/useGetSingleExcelAllData';

interface PropsParams{
  imgAuthor? : string,
  imgPage? : string
}

interface RouteParams{
    id:string,
    imgAuthor? : string,
    imgPage? : string
}

const Documents: React.FC<PropsParams>= ({imgAuthor, imgPage}) => {
    const {id} = useParams<RouteParams>();
    // const {article, loading} = useGetDocumentData(id);
  const { articlesData, loadingData } = useGetSingleExcelAllData('1ChvjU94csQ3ncWFOU_HmbiFq6HU3H3TwJ-XwfzMrjPc');
    return(
      <IonPage>
        <div className={loadingData ? 'colorful_appbar_document' : 'colorful_appbar_document hidden'}><AppBarPopOver /></div>
        <div className={loadingData ? 'transparent_appbar_document' : 'transparent_appbar_document visible'}><AppBarMenu /></div>
        
       {/* <IonContent fullscreen class='bg-img'> */}
        <IonContent fullscreen class='bg-img'>
          <img className={loadingData ? "imageArticleLoading visible" : "imageArticleLoading hidden"}
          src="/assets/Spinner-1s-200px_transparent.svg"
          alt="loading image" />
          <img className={loadingData ? "imageArticle hidden" : "imageArticle visible"}
          src={loadingData ? "/assets/Spinner-1s-200px_transparent.svg" : articlesData![Number(id)][4]} 
        />
        
           { (imgPage || imgAuthor) &&
                <IonCardSubtitle>
                    Imagen
                    {
                        imgPage &&
                        <>{` de ${imgPage}`}</>
                    }
                    { imgAuthor && 
                        <>{` por ${imgAuthor}`}</>
                    }
                </IonCardSubtitle>
                }
           <br></br>
           <IonCol className='content__container'>
                <IonRow>
                    <IonText className='content-row title__document ion-text-wrap'>
                        {
                            !loadingData && articlesData![Number(id)][0]
                        }
                    </IonText>
                </IonRow>
                <br></br>
                <IonRow className = 'content-row content__document'>
                    <IonText>
                        {
                        !loadingData && articlesData![Number(id)][3]
                        }
                    </IonText>
                </IonRow>
            </IonCol>
            
       </IonContent>
       </IonPage>
    );
};

export default Documents;