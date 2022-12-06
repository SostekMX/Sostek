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
    id:string,
    type: string,
    imgAuthor: string | undefined,
    imgPage: string | undefined
}

const DocumentCard: React.FC<DocumentProps> = ({name, description, img_url, id, type, imgAuthor, imgPage}) => {
    const [imgLoading, setImgLoading] = useState(true);
    return(
        < >
            <IonCard button routerDirection='forward'  href={type === "article" ? `/Documents/${id}` : `/presentation/${id}` }>
                <IonImg className="document-card-image"
                    onIonImgDidLoad={() => {setImgLoading(false)}}
                    src={imgLoading ? "https://mir-s3-cdn-cf.behance.net/project_modules/disp/35771931234507.564a1d2403b3a.gif" : img_url} 
                />
                <IonCardHeader>
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
                    <IonCardSubtitle className='title'>{name}</IonCardSubtitle>
                    <IonText className='description'>
                        {description}
                    </IonText>
                </IonCardContent>
            </IonCard>
        </>
    );
};

export default DocumentCard;