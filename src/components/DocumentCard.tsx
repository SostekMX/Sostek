import React from 'react';
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
    id:string
}

const DocumentCard: React.FC<DocumentProps> = ({name, description, img_url, id}) => {
    return(
        < >
            <IonCard button routerDirection='forward'  href={`/Documents/${id}`}>
                <IonCardHeader>
                    <IonImg src={img_url} className="document-card-image"/>
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