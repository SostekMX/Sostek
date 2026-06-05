import React, { useState } from 'react';
import './DocumentCard.css';
import { IonCard, 
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle, 
    IonImg, 
    IonText,

 } from '@ionic/react';
interface DocumentProps{
    name: string,
    description: string,
    img_url :string,
    id: string,
    type: string,
    imgAuthor: string | undefined,
    imgPage: string | undefined
}

const DocumentCard: React.FC<DocumentProps> = ({name, description, img_url, id, type, imgAuthor, imgPage}) => {
    const [imgLoading, setImgLoading] = useState(true);
    return(
        < >
            <IonCard button routerDirection='forward'  routerLink={type === "article" ? `/Documents/${id}` : `/presentation/${id}` }>
                <img className={imgLoading ? "image-card-loading visible" : "image-card-loading hidden"}
                    src="/assets/Spinner-1s-200px_transparent.svg"
                    alt="loading image" />
                <IonImg className={imgLoading ? "document-card-image hidden" : "document-card-image visible"}
                    onIonImgDidLoad={() => {setImgLoading(false)}}
                    src={imgLoading ? "/assets/Spinner-1s-200px_transparent.svg" : img_url} 
                />
                <IonCardHeader style={{"paddingTop":"10px", "paddingBottom":"5px"}}>
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
                </IonCardHeader>
                <IonCardContent >
                    <IonCardSubtitle className='document-card__title'>{name}</IonCardSubtitle>
                    <IonText className='document-card__description'>
                        {description}
                    </IonText>
                </IonCardContent>
            </IonCard>
        </>
    );
};

export default DocumentCard;