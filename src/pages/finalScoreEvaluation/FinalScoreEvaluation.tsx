import { IonPage, IonContent, IonHeader, IonButton } from '@ionic/react';
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { saveScore } from '../../api/user';
import AppBarPopOver from '../../components/layout/AppBarPopOver';
import AppContext from '../../context/AppContext';
import { getFeedback, clearScoreSession } from '../../utils/scoring';
import './FinalScoreEvaluation.css';

interface Params {
    name: string;
}

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
                                    onClick={() => {
                                        changeSearch!(weakestCategory);
                                        clearScoreSession();
                                    }}
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
