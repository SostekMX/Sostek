import React, { useState } from 'react';
import './DocumentCard.css';
import { IonCard, IonIcon, IonImg } from '@ionic/react';
import { heart, heartOutline } from 'ionicons/icons';
import { axisOf } from '../utils/axis';

interface DocumentProps {
    name: string;
    description: string;
    img_url: string;
    id: string;
    type: string;
    category?: string;
    meta?: string;
    isFavorite?: boolean;
    isLoggedIn?: boolean;
    onToggleFavorite?: () => void;
}

const DocumentCard: React.FC<DocumentProps> = ({ name, description, img_url, id, type, category, meta, isFavorite, isLoggedIn, onToggleFavorite }) => {
    const [imgLoading, setImgLoading] = useState(true);
    const [imgError, setImgError] = useState(false);
    // El color del eje solo se pinta en escritorio (DocumentCard.css, >= 768px).
    const axis = axisOf(category);
    return (
        <IonCard
            className={`document-card${axis ? ` axis-${axis}` : ''}`}
            button
            routerDirection='forward'
            routerLink={type === 'presentation' ? `/presentation/${id}` : `/Documents/${id}`}
        >
            <div className='document-card__image-wrapper'>
                {imgLoading && !imgError && <div className='document-card__skeleton' />}
                {imgError && <div className='document-card__img-fallback' />}
                <IonImg
                    className={`document-card-image ${imgLoading ? 'hidden' : 'visible'}`}
                    src={img_url}
                    onIonImgDidLoad={() => setImgLoading(false)}
                    onIonError={() => { setImgLoading(false); setImgError(true); }}
                />
                {isLoggedIn && (
                    <button
                        className={`document-card__fav-btn ${isFavorite ? 'document-card__fav-btn--active' : ''}`}
                        aria-label={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                        aria-pressed={!!isFavorite}
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
                    {category || (type === 'presentation' ? 'Presentación' : 'Artículo')}
                </span>
                <p className='document-card__title'>{name}</p>
                {description && (
                    <p className='document-card__description'>{description}</p>
                )}
                {meta && <p className='document-card__meta'>{meta}</p>}
            </div>
        </IonCard>
    );
};

export default DocumentCard;
