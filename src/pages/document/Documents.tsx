import React from 'react';
import { IonCardSubtitle, IonCol, IonContent, IonPage, IonRow, IonText} from '@ionic/react';
import './Documents.css'
import { useParams } from 'react-router';
import AppBarPopOver from '../../components/layout/AppBarPopOver';
import { AppBarMenu } from '../../components/layout/AppBarMenu';
import useGetSingleExcelAllData from '../../hooks/useGetSingleExcelAllData';

interface PropsParams{
  imgAuthor? : string,
  imgPage? : string
}

interface RouteParams{
    id: string,
    imgAuthor? : string,
    imgPage? : string
}

const Documents: React.FC<PropsParams>= ({imgAuthor, imgPage}) => {
    const {id} = useParams<RouteParams>();
  const { articlesData, loadingData } = useGetSingleExcelAllData('1ChvjU94csQ3ncWFOU_HmbiFq6HU3H3TwJ-XwfzMrjPc');
//   console.log(articlesData);
    return(
      <IonPage>
        <div className={loadingData ? 'colorful_appbar_document' : 'colorful_appbar_document hidden'}><AppBarPopOver /></div>
        <div className={loadingData ? 'transparent_appbar_document' : 'transparent_appbar_document visible'}><AppBarMenu /></div>
        
       {/* <IonContent fullscreen class='bg-img'> */}
        <IonContent fullscreen class='bg-img'>
          <img className={loadingData ? "imageArticleLoading visible" : "imageArticleLoading hidden"}
          src="/assets/Spinner-1s-200px_transparent.svg"
          alt="loading" />
          <img className={loadingData ? "imageArticle hidden" : "imageArticle visible"}
          src={loadingData ? "/assets/Spinner-1s-200px_transparent.svg" : articlesData![Number(id)][4]} 
          alt={loadingData ? "loading" : articlesData![Number(id)][0]}
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