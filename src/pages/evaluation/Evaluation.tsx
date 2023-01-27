import { NativeStorage } from "@ionic-native/native-storage";
import {
  IonButton,
  IonContent,
  IonHeader,
  IonLoading,
  IonPage,
  IonRow,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router";
import AppBarPopOver from "../../components/AppBarPopOver";
import QuestionTestCard from "../../components/QuestionTestCard";
import AppContext from "../../context/AppContext";
import useGetEvaluationData from "../../hooks/useGetEvaluationData";
import "./evaluation.css";

interface RouteParams {
  name: string;
  id: string;
}
const Evaluation: React.FC = () => {
  const { name, id } = useParams<RouteParams>();
  const { evaluation, loading } = useGetEvaluationData(id);
  const { score, currentAnswersAndScores } = useContext(AppContext);
  console.log(evaluation);
  function setFinalScore() {
    let arrayOfCategories: string[] = [];
    let arrayOfScore: number[] = [];
    currentAnswersAndScores.forEach((value, key) => {
      if (arrayOfCategories.includes(value.category)) {
        arrayOfScore[arrayOfCategories.indexOf(value.category)] += value.value;
      } else {
        arrayOfCategories.push(value.category);
        arrayOfScore[arrayOfCategories.indexOf(value.category)] = value.value;
      }
    });

    NativeStorage.setItem(
      `totalCategories`,
      arrayOfCategories.length.toLocaleString()
    );
    sessionStorage.setItem(
      `totalCategories`,
      arrayOfCategories.length.toLocaleString()
    );
    for (let i = 0; i < arrayOfCategories.length; i++) {
      NativeStorage.setItem(`category${i}`, arrayOfCategories[i]);
      sessionStorage.setItem(`category${i}`, arrayOfCategories[i]);
      NativeStorage.setItem(`categoryScore${i}`, arrayOfScore[i]);
      sessionStorage.setItem(
        `categoryScore${i}`,
        arrayOfScore[i].toLocaleString()
      );
    }

    NativeStorage.setItem("finalScore", score);
    sessionStorage.setItem("finalScore", score.toLocaleString());
  }

  return (
    <IonPage>
      <AppBarPopOver></AppBarPopOver>
      <IonContent fullscreen class="bg-img">
        <IonHeader collapse="condense">
          <h1 className="header__title">{name}</h1>
        </IonHeader>
        {
          <img
            className={
              loading
                ? "imageArticleLoading visible"
                : "imageArticleLoading hidden"
            }
            src="/assets/Spinner-1s-200px_transparent.svg"
            alt="loading image"
            style={{ position: "fixed" }}
          />
        }
        <div
          className={
            loading
              ? "hidden evaluation__questions"
              : "visible evaluation__questions"
          }
        >
          {!loading &&
            evaluation?.at(0)?.values.map((question, index) => {
              return (
                <QuestionTestCard
                  question={question[1]}
                  category={question[0]}
                  comments={undefined}
                  options={evaluation![1].values[index]}
                  points={evaluation![2].values[index]}
                />
              );
            })}
        </div>
        {!loading && (
          <IonRow className="align-center">
            <IonButton
              onClick={setFinalScore}
              color="secondary"
              href={`/score/${name}`}
            >
              Obtener resultados
            </IonButton>
          </IonRow>
        )}
        {/* {!loading && <h1 className='evaluation__footer__title' 
        style={{color:"white", textAlign:"center"}}>
        {
          `Resultado final: ${score}`
        }
        </h1>} */}
        <IonRow class="space"></IonRow>
      </IonContent>
    </IonPage>
  );
};

export default Evaluation;
