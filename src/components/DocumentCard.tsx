import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import { Button } from 'glisse';
import { heart, heartOutline } from 'ionicons/icons';
import { axisOf } from '../utils/axis';
import { sized } from '../utils/image';
import { useI18n } from '../i18n/LanguageContext';
import './DocumentCard.css';

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
    const { t, tx } = useI18n();
    const [imgState, setImgState] = useState<'loading' | 'ok' | 'error'>('loading');
    const axis = axisOf(category);
    const href = type === 'presentation' ? `/presentation/${id}` : `/Documents/${id}`;

    return (
        <article className={`doc-card${axis ? ` axis-${axis}` : ''}`}>
            <div className='doc-card__media'>
                {imgState === 'loading' && <div className='doc-card__placeholder shimmer' />}
                {imgState === 'error' && <div className='doc-card__placeholder' />}
                {imgState !== 'error' && (
                    <img
                        className={`doc-card__img${imgState === 'ok' ? ' doc-card__img--ready' : ''}`}
                        src={sized(img_url, 800)}
                        alt=''
                        loading='lazy'
                        decoding='async'
                        onLoad={() => setImgState('ok')}
                        onError={() => setImgState('error')}
                    />
                )}
            </div>
            <div className='doc-card__body'>
                <span className='axis-tag'>
                    {tx(category) || (type === 'presentation' ? t('card.presentation') : t('card.article'))}
                </span>
                <h3 className='doc-card__title'>
                    {/* El ::after del enlace cubre la tarjeta: toda es clicable y el corazon sigue siendo un boton aparte. */}
                    <Link to={href} className='doc-card__link'>{name}</Link>
                </h3>
                {description && <p className='doc-card__desc'>{description}</p>}
                {meta && <p className='doc-card__meta'>{meta}</p>}
            </div>
            {isLoggedIn && (
                <Button
                    className='doc-card__fav'
                    icon={<IonIcon icon={isFavorite ? heart : heartOutline} aria-hidden='true' />}
                    aria-label={isFavorite ? t('card.removeFav') : t('card.addFav')}
                    aria-pressed={!!isFavorite}
                    onClick={() => onToggleFavorite?.()}
                />
            )}
        </article>
    );
};

export default DocumentCard;
