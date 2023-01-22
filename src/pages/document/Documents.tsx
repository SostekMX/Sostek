import React, { useContext, useEffect, useState } from 'react';
import { IonCardSubtitle, IonCol, IonContent, IonHeader, IonImg, IonPage, IonRow, IonText, IonTitle} from '@ionic/react';
import './Documents.css'
import { RouteComponentProps, useParams } from 'react-router';
import { dummyArticlesContent } from './DocumentsData';
import AppBarPopOver from '../../components/AppBarPopOver';
import { AppBarMenu } from '../../components/AppBarMenu';
import useGetDocumentData from '../../hooks/useGetDocumentData';
import AppContext from '../../context/AppContext';

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
    const {article, loading} = useGetDocumentData(id);
    const [hasNotBeenCalled, setHasNotBeenCalled] = useState(true);
  useEffect(() => {

  }, [loading]);

    return(
      <IonPage>
        <div className={loading ? 'colorful_appbar_document' : 'colorful_appbar_document hidden'}><AppBarPopOver /></div>
        <div className={loading ? 'transparent_appbar_document' : 'transparent_appbar_document visible'}><AppBarMenu /></div>
        
       {/* <IonContent fullscreen class='bg-img'> */}
        <IonContent fullscreen class='bg-img'>
          <img className={loading ? "imageArticleLoading visible" : "imageArticleLoading hidden"}
          src="/assets/Spinner-1s-200px_transparent.svg"
          alt="loading image" />
          <img className={loading ? "imageArticle hidden" : "imageArticle visible"}
          src={loading ? "/assets/Spinner-1s-200px_transparent.svg" : article[4]} 
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
                        {article[0]}
                    </IonText>
                </IonRow>
                <br></br>
                <IonRow className = 'content-row content__document'>
                    <IonText>
                        {article[3]}
                    </IonText>
                </IonRow>
            </IonCol>
            
       </IonContent>
       </IonPage>
    );
};

export default Documents;