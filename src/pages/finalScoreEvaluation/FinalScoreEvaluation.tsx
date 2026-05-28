import { IonPage, IonContent, IonHeader, IonButton } from '@ionic/react';
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import AppBarPopOver from '../../components/layout/AppBarPopOver';
import AppContext from '../../context/AppContext';
import './FinalScoreEvaluation.css';

interface Params {
    name: string;
}

interface Feedback {
    titulo: string;
    mensaje: string;
}

function getFeedback(score: number): Feedback {
    if (score >= 150) return {
        titulo: "¡Excelente!",
        mensaje: "Tu proyecto demuestra un alto compromiso con la sostenibilidad en todas sus dimensiones. ¡Sigue así!"
    };
    if (score >= 120) return {
        titulo: "Muy bien",
        mensaje: "Tu proyecto tiene una base sólida de sostenibilidad. Hay algunas áreas que puedes seguir fortaleciendo para alcanzar el nivel óptimo."
    };
    if (score >= 90) return {
        titulo: "Buen avance",
        mensaje: "Tu proyecto va por buen camino, pero aún hay aspectos de sostenibilidad que requieren mayor atención y desarrollo."
    };
    if (score >= 50) return {
        titulo: "En desarrollo",
        mensaje: "Tu proyecto tiene potencial, pero necesita trabajar más en varias de sus dimensiones de sostenibilidad para cumplir con los estándares requeridos."
    };
    return {
        titulo: "Por mejorar",
        mensaje: "Tu proyecto necesita replantear su enfoque de sostenibilidad. Te recomendamos revisar los artículos disponibles para orientar el desarrollo de tu proyecto."
    };
}

function clearScoreSession(totalCategories: number) {
    for (let i = 0; i < totalCategories; i++) {
        sessionStorage.removeItem(`categoryScore${i}`);
        sessionStorage.removeItem(`category${i}`);
    }
    sessionStorage.removeItem("finalScore");
    sessionStorage.removeItem("totalCategories");
}

const FinalScoreEvaluation: React.FC = () => {
    const [score, setScore] = useState<number>(0);
    const [weakestCategory, setWeakestCategory] = useState<string>("");
    const { changeSearch } = useContext(AppContext);

    useEffect(() => {
        setScore(Number(sessionStorage.getItem("finalScore")));
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
