import { IonPage, IonContent, IonHeader, IonButton, useIonRouter } from '@ionic/react';
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { saveScore } from '../../api/user';
import AppBarPopOver from '../../components/layout/AppBarPopOver';
import AppContext from '../../context/AppContext';
import { getFeedback, clearScoreSession } from '../../utils/scoring';
import { matchesSearch } from '../../utils/search';
import { axisOf, isMixedAxis } from '../../utils/axis';
import { readCache } from '../../utils/cache';
import useMediaQuery, { DESKTOP_QUERY } from '../../hooks/useMediaQuery';
import { Article } from '../../components/ArticleCarrousel';
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

/* Anillo del puntaje: el trazo cubre la fraccion score/max. La animacion de llenado es el
   unico movimiento de la pantalla y se apaga con prefers-reduced-motion (ver el CSS). */
const RING_R = 88;
const RING_C = 2 * Math.PI * RING_R;

const FinalScoreEvaluation: React.FC = () => {
    /* Se lee de sessionStorage en el primer render y no en un efecto, para no pintar un
       "0 puntos / Por mejorar" falso mientras tanto. null = no hay resultado que mostrar. */
    const [result] = useState(() => {
        const stored = sessionStorage.getItem("finalScore");
        if (stored === null) return null;
        return {
            score: Number(stored),
            maxScore: Number(sessionStorage.getItem("maxScore")),
            weakestCategory: sessionStorage.getItem("weakestCategory") ?? "",
        };
    });
    const { changeSearch } = useContext(AppContext);
    const isDesktop = useMediaQuery(DESKTOP_QUERY);
    const router = useIonRouter();

    useEffect(() => {
        /* score_test es un solo numero que se sobrescribe. Guardar en cada visita pisaba el
           resultado real con un 0 al volver con "atras" despues del CTA (que limpia la
           sesion) y lo repetia en cada recarga. Se guarda una vez por envio. */
        const pending = sessionStorage.getItem("scorePending");
        sessionStorage.removeItem("scorePending");
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
                <IonContent fullscreen class="app-dark-bg">
                    <div className="score-page">
                        <div className="score-card">
                            <p className="score-card__titulo">No hay un resultado que mostrar</p>
                            <p className="score-card__mensaje">
                                Contesta una evaluaci&oacute;n para ver aqu&iacute; tu puntaje.
                            </p>
                            <IonButton href="/tab3" color="primary" className="finalScoreEvaluation__button">
                                Ir a Eval&uacute;ate
                            </IonButton>
                        </div>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    const { score, maxScore, weakestCategory } = result;
    const { titulo, mensaje } = getFeedback(score, maxScore);

    function goToRecommended() {
        changeSearch!(weakestCategory);
        clearScoreSession();
    }

    /* Escritorio: otra composicion (dos columnas, anillo y vista previa de articulos), por
       eso es un render aparte; el de mobile de abajo queda tal cual. */
    if (isDesktop) {
        const pct = maxScore > 0 ? Math.min(score / maxScore, 1) : 0;
        const axis = axisOf(weakestCategory);
        const mixedAxis = isMixedAxis(weakestCategory);
        const recommended = weakestCategory ? recommendedArticles(weakestCategory, 3) : [];

        return (
            <IonPage>
                <AppBarPopOver />
                <IonContent fullscreen class="app-dark-bg">
                    <div className="score-desk">
                        <header className="score-desk__header">
                            <p className="score-desk__kicker">Resultado de tu autodiagn&oacute;stico</p>
                            <h1 className="score-desk__title">{name}</h1>
                        </header>

                        <div className={`score-desk__grid${weakestCategory ? '' : ' score-desk__grid--single'}`}>
                            <section className="score-desk__result" aria-label="Puntaje">
                                <div className="score-ring" style={{ '--ring-c': RING_C, '--ring-offset': RING_C * (1 - pct) } as any}>
                                    <svg viewBox="0 0 200 200" aria-hidden="true">
                                        <circle className="score-ring__track" cx="100" cy="100" r={RING_R} />
                                        <circle className="score-ring__fill" cx="100" cy="100" r={RING_R} />
                                    </svg>
                                    <div className="score-ring__label">
                                        <span className="score-ring__score">{score}</span>
                                        {maxScore > 0 && <span className="score-ring__max">de {maxScore} puntos</span>}
                                    </div>
                                </div>
                                <h2 className="score-desk__feedback-title">{titulo}</h2>
                                <p className="score-desk__feedback">{mensaje}</p>
                                <a
                                    href="/tab3"
                                    className="score-desk__secondary"
                                    onClick={e => { e.preventDefault(); router.push('/tab3', 'back'); }}
                                >
                                    Hacer otra evaluaci&oacute;n
                                </a>
                            </section>

                            {weakestCategory && (
                                <section
                                    className={`score-desk__weak${axis ? ` axis-${axis}` : ''}${mixedAxis ? ' score-desk__weak--mixed' : ''}`}
                                    aria-label="Eje a reforzar"
                                >
                                    <p className="score-desk__weak-label">Tu eje m&aacute;s d&eacute;bil</p>
                                    <p className="score-desk__weak-axis">{weakestCategory}</p>
                                    <p className="score-desk__weak-note">
                                        Es el &aacute;rea donde tu proyecto sum&oacute; menos en proporci&oacute;n a lo
                                        que pod&iacute;a obtener. Estas lecturas te ayudan a reforzarla.
                                    </p>

                                    {recommended.length > 0 && (
                                        <ul className="score-desk__articles">
                                            {recommended.map(a => {
                                                const aAxis = axisOf(a.category);
                                                return (
                                                    <li key={a._id}>
                                                        <a
                                                            href={`/Documents/${a._id}`}
                                                            className="score-article"
                                                            onClick={e => { e.preventDefault(); router.push(`/Documents/${a._id}`, 'forward'); }}
                                                        >
                                                            <img src={a.image} alt="" className="score-article__img" loading="lazy" />
                                                            <span className="score-article__text">
                                                                <span className={`score-article__category${aAxis ? ` axis-${aAxis}` : ''}`}>{a.category}</span>
                                                                <span className="score-article__title">{a.title}</span>
                                                                {a.author && <span className="score-article__author">{a.author}</span>}
                                                            </span>
                                                        </a>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}

                                    <IonButton
                                        href="/MainMenu"
                                        color="primary"
                                        className="score-desk__cta"
                                        onClick={goToRecommended}
                                    >
                                        Ver todos los art&iacute;culos recomendados
                                    </IonButton>
                                </section>
                            )}
                        </div>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    return (
        <IonPage>
            <AppBarPopOver />
            <IonContent fullscreen class="app-dark-bg">
                <IonHeader collapse="condense"></IonHeader>
                <div className="score-page">
                    <div className="score-card">
                        <p className="score-card__evaluation-name">{name}</p>
                        <p className="score-card__points">
                            {score}
                            {maxScore > 0 && <span className="score-card__points-max">/{maxScore}</span>}
                        </p>
                        <p className="score-card__pts-label">puntos</p>
                        <p className="score-card__titulo">{titulo}</p>
                        <p className="score-card__mensaje">{mensaje}</p>
                        {weakestCategory && (
                            <>
                                <div className="score-card__divider" />
                                <p className="score-card__weakest-label">
                                    &Aacute;rea con menor puntaje:
                                </p>
                                <p className="score-card__weakest-category">
                                    {weakestCategory}
                                </p>
                                <p className="score-card__cta-label">
                                    Encuentra art&iacute;culos para reforzar esta &aacute;rea:
                                </p>
                                <IonButton
                                    href="/MainMenu"
                                    color="primary"
                                    className="finalScoreEvaluation__button"
                                    onClick={goToRecommended}
                                >
                                    Art&iacute;culos recomendados
                                </IonButton>
                            </>
                        )}
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default FinalScoreEvaluation;
