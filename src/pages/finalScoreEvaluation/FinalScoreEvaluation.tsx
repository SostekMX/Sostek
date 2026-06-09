import { IonPage, IonContent, IonHeader, IonButton } from '@ionic/react';
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import axios from 'axios';
import { BACKEND_URL } from '../../config';
import AppBarPopOver from '../../components/layout/AppBarPopOver';
import AppContext from '../../context/AppContext';
import { getFeedback, clearScoreSession } from '../../utils/scoring';
import './FinalScoreEvaluation.css';

interface Params {
    name: string;
}

const FinalScoreEvaluation: React.FC = () => {
    const [score, setScore] = useState<number>(0);
    const [weakestCategory, setWeakestCategory] = useState<string>("");
    const { changeSearch } = useContext(AppContext);

    useEffect(() => {
        const finalScore = Number(sessionStorage.getItem("finalScore"));
        setScore(finalScore);

        const totalCategories = Number(sessionStorage.getItem("totalCategories"));
        let lowPunctuation = Infinity;
        let lowCategory = "";
        for (let i = 0; i < totalCategories; i++) {
            const categoryScore = Number(sessionStorage.getItem(`categoryScore${i}`));
            if (categoryScore < lowPunctuation) {
                lowPunctuation = categoryScore;
                lowCategory = sessionStorage.getItem(`category${i}`) ?? "";
            }
        }
        setWeakestCategory(lowCategory);

        const token = sessionStorage.getItem('token');
        if (token) {
            axios.post(`${BACKEND_URL}/user/score`, { score_test: finalScore }, {
                headers: { Authorization: `Bearer ${token}` }
            }).catch((error) => {
                console.error('Error al guardar puntaje:', error);
            });
        }
    }, []);

    const { name } = useParams<Params>();
    const { titulo, mensaje } = getFeedback(score);
    const totalCategories = Number(sessionStorage.getItem("totalCategories"));

    return (
        <IonPage>
            <AppBarPopOver />
            <IonContent fullscreen class="bg-img">
                <IonHeader collapse="condense"></IonHeader>
                <div className="score-page">
                    <div className="score-card">
                        <p className="score-card__evaluation-name">{name}</p>
                        <p className="score-card__points">{score}</p>
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
                                        clearScoreSession(totalCategories);
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
