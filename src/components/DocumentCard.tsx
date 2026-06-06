import React, { useState } from 'react';
import './DocumentCard.css';
import { IonCard, IonImg } from '@ionic/react';

interface DocumentProps {
    name: string;
    description: string;
    img_url: string;
    id: string;
    type: string;
    imgAuthor: string | undefined;
    imgPage: string | undefined;
}

const DocumentCard: React.FC<DocumentProps> = ({ name, description, img_url, id, type }) => {
    const [imgLoading, setImgLoading] = useState(true);
    return (
        <IonCard
            className='document-card'
            button
            routerDirection='forward'
            routerLink={type === 'article' ? `/Documents/${id}` : `/presentation/${id}`}
        >
            <div className='document-card__image-wrapper'>
                <img
                    className={`image-card-loading ${imgLoading ? 'visible' : 'hidden'}`}
                    src="/assets/Spinner-1s-200px_transparent.svg"
                    alt=""
                />
                <IonImg
                    className={`document-card-image ${imgLoading ? 'hidden' : 'visible'}`}
                    src={img_url}
                    onIonImgDidLoad={() => setImgLoading(false)}
                />
            </div>
            <div className='document-card__content'>
                <span className='document-card__type-badge'>
                    {type === 'presentation' ? 'Presentación' : 'Artículo'}
                </span>
                <p className='document-card__title'>{name}</p>
                {description && (
                    <p className='document-card__description'>{description}</p>
                )}
            </div>
        </IonCard>
    );
};

export default DocumentCard;
