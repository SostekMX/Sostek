import { IonContent, IonPage, useIonRouter } from '@ionic/react';
import { Button, Glass } from 'glisse';
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { saveScore } from '../../api/user';
import AppBarPopOver from '../../components/layout/AppBarPopOver';
import AppContext from '../../context/AppContext';
import { getFeedback, clearScoreSession } from '../../utils/scoring';
import { matchesSearch } from '../../utils/search';
import { axisOf, isMixedAxis } from '../../utils/axis';
import { readCache } from '../../utils/cache';
import { Article } from '../../components/ArticleCarrousel';
import { useI18n } from '../../i18n/LanguageContext';
import './FinalScoreEvaluation.css';

interface Params {
    name: string;
}

/* Los primeros articulos que refuerzan el eje: misma busqueda que hace APRENDE al llegar
   con el eje como termino (categoria, titulo y tags), sobre el cache de articulos. Sin
   cache no hay vista previa y queda solo el boton a la lista completa. */
function recommendedArticles(weakest: string, limit: number): Article[] {
    return (readCache<Article[]>('articles') ?? []).filter(a => matchesSearch(a, weakest)).slice(0, limit);
}

const FinalScoreEvaluation: React.FC = () => {
    /* Se lee de sessionStorage en el primer render y no en un efecto, para no pintar un
       "0 puntos / Por mejorar" falso mientras tanto. null = no hay resultado que mostrar. */
    const [result] = useState(() => {
        const stored = sessionStorage.getItem('finalScore');
        if (stored === null) return null;
        return {
            score: Number(stored),
            maxScore: Number(sessionStorage.getItem('maxScore')),
            weakestCategory: sessionStorage.getItem('weakestCategory') ?? '',
        };
    });
    const { changeSearch } = useContext(AppContext);
    const { t, tx, lang, localizeArticle } = useI18n();
    const router = useIonRouter();

    useEffect(() => {
        /* score_test es un solo numero que se sobrescribe. Guardar en cada visita pisaba el
           resultado real con un 0 al volver con "atras" despues del CTA (que limpia la
           sesion) y lo repetia en cada recarga. Se guarda una vez por envio. */
        const pending = sessionStorage.getItem('scorePending');
        sessionStorage.removeItem('scorePending');
        if (result && pending && sessionStorage.getItem('token')) {
            saveScore(result.score).catch((error) => {
                console.error('Error al guardar puntaje:', error);
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const { name } = useParams<Params>();

    if (!result) {
        return (
            <IonPage>
                <AppBarPopOver />
                <IonContent fullscreen className='canopy'>
                    <div className='page score-empty'>
                        <h1 className='score-empty__title'>{t('score.none')}</h1>
                        <p className='score-empty__text'>{t('score.noneText')}</p>
                        <Button variant='filled' className='btn-lg' onClick={() => window.location.assign('/tab3')}>{t('score.goAssess')}</Button>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    const { score, maxScore, weakestCategory } = result;
    const { titulo, mensaje } = getFeedback(score, maxScore, lang);
    const pct = maxScore > 0 ? Math.min(score / maxScore, 1) : 0;
    const axis = axisOf(weakestCategory);
    const mixedAxis = isMixedAxis(weakestCategory);
    const recommended = weakestCategory ? recommendedArticles(weakestCategory, 3) : [];

    function goToRecommended() {
        changeSearch!(tx(weakestCategory));
        clearScoreSession();
        window.location.assign('/MainMenu');
    }

    return (
        <IonPage>
            <AppBarPopOver />
            <IonContent fullscreen className='canopy'>
                <div className={`page score${weakestCategory ? '' : ' score--single'}`}>
                    <section className='score-main' aria-label={t('score.aria')}>
                        <p className='score-main__name'>{tx(name)}</p>
                        <p className='score-main__number'>{score}</p>
                        {maxScore > 0 && <p className='score-main__max'>{t('score.ofPoints', { n: maxScore })}</p>}
                        <div className='score-main__bar' aria-hidden='true'>
                            <div className='score-main__fill' style={{ transform: `scaleX(${pct})` }} />
                        </div>
                        <h1 className='score-main__verdict'>{titulo}</h1>
                        <p className='score-main__msg'>{mensaje}</p>
                        <a
                            href='/tab3'
                            className='text-link score-main__again'
                            onClick={e => { e.preventDefault(); router.push('/tab3', 'back'); }}
                        >
                            {t('score.again')}
                        </a>
                    </section>

                    {weakestCategory && (
                        <Glass className={`score-weak${axis ? ` axis-${axis}` : ''}`}>
                            <section aria-label={t('score.weakAria')}>
                                <p className='score-weak__label'>{t('score.weakLabel')}</p>
                                <p className={`score-weak__axis${mixedAxis ? ' score-weak__axis--mixed' : ''}`}>{tx(weakestCategory)}</p>
                                <p className='score-weak__note'>{t('score.weakNote')}</p>

                                {recommended.length > 0 && (
                                    <ul className='score-weak__list'>
                                        {recommended.map(a => {
                                            const aAxis = axisOf(a.category);
                                            return (
                                                <li key={a._id}>
                                                    <a
                                                        href={`/Documents/${a._id}`}
                                                        className='score-article'
                                                        onClick={e => { e.preventDefault(); router.push(`/Documents/${a._id}`, 'forward'); }}
                                                    >
                                                        <img src={a.image} alt='' loading='lazy' />
                                                        <span className='score-article__text'>
                                                            <span className={`axis-tag${aAxis ? ` axis-${aAxis}` : ''}`}>{tx(a.category)}</span>
                                                            <span className='score-article__title'>{localizeArticle(a).title}</span>
                                                        </span>
                                                    </a>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}

                                <Button variant='filled' className='btn-lg btn-block' onClick={goToRecommended}>
                                    {t('score.allRecommended')}
                                </Button>
                            </section>
                        </Glass>
                    )}
                </div>
            </IonContent>
        </IonPage>
    );
};

export default FinalScoreEvaluation;
