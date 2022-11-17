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
    type: string
}

const DocumentCard: React.FC<DocumentProps> = ({name, description, img_url, id, type}) => {
    const [imgLoading, setImgLoading] = useState(true);
    return(
        < >
            <IonCard button routerDirection='forward'  href={type === "article" ? `/Documents/${id}` : `/presentation/${id}` }>
                <IonCardHeader>
                    <IonImg className="document-card-image"
                    onIonImgDidLoad={() => {setImgLoading(false)}}
                    src={imgLoading ? "https://mir-s3-cdn-cf.behance.net/project_modules/disp/35771931234507.564a1d2403b3a.gif" : img_url} 
                    />
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