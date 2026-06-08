import React, { useState } from 'react';
import './DocumentCard.css';
import { IonCard, IonIcon, IonImg } from '@ionic/react';
import { heart, heartOutline } from 'ionicons/icons';

interface DocumentProps {
    name: string;
    description: string;
    img_url: string;
    id: string;
    type: string;
    imgAuthor: string | undefined;
    imgPage: string | undefined;
    isFavorite?: boolean;
    isLoggedIn?: boolean;
    onToggleFavorite?: () => void;
}

const DocumentCard: React.FC<DocumentProps> = ({ name, description, img_url, id, type, isFavorite, isLoggedIn, onToggleFavorite }) => {
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
                {isLoggedIn && (
                    <button
                        className={`document-card__fav-btn ${isFavorite ? 'document-card__fav-btn--active' : ''}`}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onToggleFavorite?.();
                        }}
                    >
                        <IonIcon icon={isFavorite ? heart : heartOutline} />
                    </button>
                )}
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
