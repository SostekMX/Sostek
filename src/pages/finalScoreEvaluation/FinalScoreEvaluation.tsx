import { IonPage, IonContent, IonHeader, IonButton } from '@ionic/react';
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import AppBarPopOver from '../../components/layout/AppBarPopOver';
import AppContext from '../../context/AppContext';
import './FinalScoreEvaluation.css';

interface Params {
    name: string
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
                <div className="under_construction-container">
                    <p className="under_construction_text">
                        <b>Resultado de la evaluación: {name}</b>
                    </p>
                    <p className="under_construction_text" style={{ fontSize: "2rem" }}>
                        <b>{score} pts</b>
                    </p>
                    <p className="under_construction_text">
                        <b>{titulo}</b>
                    </p>
                    <p className="under_construction_text">
                        {mensaje}
                    </p>
                    {weakestCategory && (
                        <>
                            <p className="under_construction_text">
                                Tu área con menor puntaje es:{" "}
                                <b className="finalScoreEvaluation__category">
                                    {weakestCategory}
                                </b>
                            </p>
                            <p className="under_construction_text">
                                Encuentra artículos relacionados para reforzar esta área:
                            </p>
                            <IonButton
                                href="/MainMenu"
                                color="light-green"
                                className="finalScoreEvaluation__button"
                                onClick={() => {
                                    changeSearch!(weakestCategory);
                                    clearScoreSession(totalCategories);
                                }}
                            >
                                Artículos recomendados
                            </IonButton>
                        </>
                    )}
                </div>
            </IonContent>
        </IonPage>
    );
}

export default FinalScoreEvaluation;