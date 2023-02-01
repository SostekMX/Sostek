import { IonPage, IonContent, IonHeader, IonButton } from '@ionic/react';
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import AppBarPopOver from '../../components/AppBarPopOver';
import AppContext from '../../context/AppContext';
import './FinalScoreEvaluation.css';

interface Params {
    name: string
}
const FinalScoreEvaluation: React.FC = () => {
    const [score, setScore] = useState<number>(0);
    const [weakestCategory, setWeakestCategory] = useState<string>("");
    const { changeSearch } = useContext(AppContext);
    useEffect(() => {
        // NativeStorage.getItem("login").then(
        //   data => setIsUserLogged(data)
        // )
        setScore(Number(sessionStorage.getItem("finalScore")));
        let lowPunctuation = 1001;
        let lowCategory: string | null = "";
        for(let i = 0; i < Number(sessionStorage.getItem("totalCategories")); i++) {
            if(lowPunctuation > Number(sessionStorage.getItem(`categoryScore${i}`))) {
                lowPunctuation = Number(sessionStorage.getItem(`categoryScore${i}`));
                lowCategory = sessionStorage.getItem(`category${i}`);
            }
        }
        setWeakestCategory(lowCategory!);
    }, [])
    const { name } = useParams<Params>();
  return (
    <IonPage>
      <AppBarPopOver></AppBarPopOver>
      <IonContent fullscreen class="bg-img">
        <IonHeader collapse="condense"></IonHeader>
        <div className="under_construction-container">
          <p className="under_construction_text">
            <b>El resultado de la evaluación {name} que realizaste es de:</b>
          </p>
          <p className="under_construction_text">
            <b>{score}</b>
          </p>
          {
            <>
              {score >= 150 && (
                <p className="under_construction_text">
                  Felicidades, tuviste una puntuación alta
                </p>
              )}
              {score >= 120 && score < 150 && (
                <p className="under_construction_text">
                  Tu proyecto cuenta con una buena base pero todavia tienes
                  &aacute;reas por mejorar
                </p>
              )}
              {score >= 90 && score < 120 && (
                <p className="under_construction_text">
                  Felicidades, tuviste una puntuación alta
                </p>
              )}
              {score >= 50 && score < 90 && (
                <p className="under_construction_text">
                  Felicidades, tuviste una puntuación alta
                </p>
              )}
              {score < 50 && (
                <div>
                  <p className="under_construction_text">
                    Este resultado indica que tienes areas que mejorar.
                  </p>
                </div>
              )}
              {score < 150 && (
                <>
                  <p className="under_construction_text">
                    T&uacute; &aacute;rea a mejorar es{" "}
                    <b className="finalScoreEvaluation__category">
                      {weakestCategory}
                    </b>
                  </p>
                  <p className="under_construction_text">
                    Puedes dar click al siguiente botón para recomendarte
                    artículos en tus áreas más debiles
                  </p>
                  <IonButton
                    href="/MainMenu"
                    color="light-green"
                    className="finalScoreEvaluation__button"
                    onClick={(e) => {
                      changeSearch!(weakestCategory);
                      for (
                        let i = 0;
                        i < Number(sessionStorage.getItem("totalCategories"));
                        i++
                      ) {
                        sessionStorage.removeItem(`categoryScore${i}`);
                        sessionStorage.removeItem(`category${i}`);
                      }
                      sessionStorage.removeItem(`finalScore`);
                      sessionStorage.removeItem(`totalCategories`);
                    }}
                  >
                    Art&iacute;culos recomendados
                  </IonButton>
                </>
              )}
            </>
          }
        </div>
      </IonContent>
    </IonPage>
  );
}

export default FinalScoreEvaluation;