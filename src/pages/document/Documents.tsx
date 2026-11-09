import React, { useEffect, useRef, useState } from 'react';
import { IonContent, IonIcon, IonPage, ScrollDetail, useIonRouter } from '@ionic/react';
import { Button } from 'glisse';
import { arrowBackOutline, heart, heartOutline } from 'ionicons/icons';
import { useParams } from 'react-router';
import { getArticle } from '../../api/content';
import { Article } from '../../components/ArticleCarrousel';
import { AppMenu } from '../../components/layout/AppBarPopOver';
import { axisOf } from '../../utils/axis';
import useFavorites from '../../hooks/useFavorites';
import { useI18n } from '../../i18n/LanguageContext';
import './Documents.css';

interface RouteParams {
  id: string;
}

const Documents: React.FC = () => {
  const { id } = useParams<RouteParams>();
  const { t, tx, localizeArticle } = useI18n();
  const [rawArticle, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useIonRouter();
  const { isLoggedIn, isFavorite, addFavorite, removeFavorite } = useFavorites();
  const scrollElRef = useRef<HTMLElement | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ionic reusa la pagina entre ids: sin este reinicio un fallo dejaba el articulo anterior.
    setArticle(null);
    setLoading(true);
    getArticle(id)
      .then(data => {
        if (data.success) setArticle(data.article);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  /* Progreso de lectura: se escribe directo en el DOM porque el evento llega en cada frame
     de scroll y no hace falta re-renderizar el articulo entero. */
  async function handleScroll(e: CustomEvent<ScrollDetail>) {
    if (!scrollElRef.current) {
      scrollElRef.current = await (e.target as HTMLIonContentElement).getScrollElement();
    }
    const el = scrollElRef.current;
    const max = el.scrollHeight - el.clientHeight;
    const progress = max > 0 ? Math.min(1, e.detail.scrollTop / max) : 0;
    progressRef.current?.style.setProperty('transform', `scaleX(${progress})`);
  }

  const goBack = () => (router.canGoBack() ? router.goBack() : router.push('/tab1', 'back'));

  const article = rawArticle && localizeArticle(rawArticle);
  const axis = axisOf(rawArticle?.category);
  const saved = !!rawArticle && isFavorite(rawArticle._id);
  const credit = article ? [
    article.page_image && t('doc.imageFrom', { x: article.page_image }),
    article.author_image && t('doc.imageBy', { x: article.author_image }),
  ].filter(Boolean).join(' ') : '';
  const minutes = article ? Math.max(1, Math.round(article.body.split(/\s+/).length / 200)) : 0;

  return (
    <IonPage className={axis ? `axis-${axis}` : undefined}>
      <div className='float-bar float-bar--start'>
        <Button icon={<IonIcon icon={arrowBackOutline} aria-hidden='true' />} aria-label={t('doc.backToLearn')} onClick={goBack} />
      </div>
      <div className='float-bar float-bar--end'>
        {isLoggedIn && rawArticle && (
          <Button
            className='reader__fav'
            icon={<IonIcon icon={saved ? heart : heartOutline} aria-hidden='true' />}
            aria-label={saved ? t('card.removeFav') : t('card.addFav')}
            aria-pressed={saved}
            onClick={() => (saved ? removeFavorite(rawArticle._id) : addFavorite(rawArticle._id, 'article'))}
          />
        )}
        <div className='reader__menu'><AppMenu /></div>
      </div>

      <div className='reader-progress' aria-hidden='true'>
        <div ref={progressRef} className='reader-progress__fill' />
      </div>

      <IonContent fullscreen scrollEvents onIonScroll={handleScroll}>
        {loading && (
          <div className='reader' aria-busy='true'>
            <div className='reader__hero shimmer' />
            <div className='reader__layout'>
              <div className='reader__column'>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className={`reader__line shimmer${i % 4 === 3 ? ' reader__line--short' : ''}`} />
                ))}
              </div>
            </div>
          </div>
        )}

        {!loading && !article && (
          <div className='page-message'>
            <p>{t('doc.fail')}</p>
            <Button className='btn-line btn-lg reader__retry' onClick={() => router.push('/tab1', 'back')}>{t('doc.backToLearn')}</Button>
          </div>
        )}

        {!loading && article && (
          <article className='reader'>
            <header className='reader__hero'>
              <img className='reader__img' src={article.image} alt='' decoding='async' />
              <div className='reader__shade' />
              <div className='reader__head'>
                {article.category && <span className='axis-tag'>{tx(rawArticle!.category)}</span>}
                <h1 className='reader__title'>{article.title}</h1>
                {article.subtitle && <p className='reader__subtitle'>{article.subtitle}</p>}
              </div>
            </header>

            <div className='reader__layout'>
              <div className='reader__column'>
                <div className='reader__body'>
                  {article.body.split('\n').filter(p => p.trim()).map((para, i) => <p key={i}>{para}</p>)}
                </div>

                {article.bibliography && (
                  <section className='reader__biblio'>
                    <h2 className='reader__biblio-title'>{t('doc.biblio')}</h2>
                    <ol>
                      {article.bibliography.split('\n').filter(l => l.trim()).map((line, i) => <li key={i}>{line}</li>)}
                    </ol>
                  </section>
                )}
              </div>

              <aside className='reader__aside' aria-label={t('doc.about')}>
                <dl className='reader__facts'>
                  {article.author && (
                    <div>
                      <dt>{t('doc.writtenBy')}</dt>
                      <dd>{article.author}</dd>
                    </div>
                  )}
                  <div>
                    <dt>{t('doc.reading')}</dt>
                    <dd>{t('doc.minutes', { n: minutes })}</dd>
                  </div>
                  {credit && (
                    <div>
                      <dt>{t('doc.image')}</dt>
                      <dd>{credit}</dd>
                    </div>
                  )}
                </dl>
              </aside>
            </div>
          </article>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Documents;
