import {
  IonButton,
  IonContent,
  IonPage,
  IonRow,
} from "@ionic/react";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router";
import axios from "axios";
import { BACKEND_URL } from '../../config';
import AppBarPopOver from "../../components/layout/AppBarPopOver";
import QuestionTestCard from "../../components/QuestionTestCard";
import AppContext from "../../context/AppContext";
import "./evaluation.css";

interface Option {
  text: string;
  value: number;
}
interface Question {
  category: string;
  text: string;
  options: Option[];
}
interface EvaluationData {
  _id: string;
  name: string;
  career: string;
  questions: Question[];
}

interface RouteParams {
  name: string;
  id: string;
}

const Evaluation: React.FC = () => {
  const { name, id } = useParams<RouteParams>();
  const [evaluation, setEvaluation] = useState<EvaluationData | null>(null);
  const [loading, setLoading] = useState(true);
  const { score, currentAnswersAndScores } = useContext(AppContext);

  useEffect(() => {
    axios.get(`${BACKEND_URL}/evaluations/${id}`)
      .then(res => {
        if (res.data.success) setEvaluation(res.data.evaluation);
      })
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
  }, [id]);
  // console.log(evaluation);
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

    sessionStorage.setItem("totalCategories", arrayOfCategories.length.toLocaleString());
    for (let i = 0; i < arrayOfCategories.length; i++) {
      sessionStorage.setItem(`category${i}`, arrayOfCategories[i]);
      sessionStorage.setItem(`categoryScore${i}`, arrayOfScore[i].toLocaleString());
    }
    sessionStorage.setItem("finalScore", score.toLocaleString());
  }

  return (
    <IonPage>
      <AppBarPopOver></AppBarPopOver>
      <IonContent fullscreen class="app-dark-bg">
        {loading && (
          <img
            className="imageArticleLoading visible"
            src="/assets/Spinner-1s-200px_transparent.svg"
            alt="loading"
            style={{ position: "fixed" }}
          />
        )}
        {!loading && (
          <>
            <h1 className="header__title">{name}</h1>
            <div className="evaluation__questions">
              {evaluation?.questions.map((question, index) => (
                <QuestionTestCard
                  key={index}
                  question={question.text}
                  category={question.category}
                  comments={undefined}
                  options={question.options.map(o => o.text)}
                  points={question.options.map(o => String(o.value))}
                />
              ))}
            </div>
            <IonRow className="align-center evaluation__submit">
              <IonButton
                onClick={setFinalScore}
                color="primary"
                href={`/score/${name}`}
                expand="block"
              >
                Obtener resultados
              </IonButton>
            </IonRow>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Evaluation;
