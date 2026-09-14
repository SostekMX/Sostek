import {
  IonButton,
  IonContent,
  IonPage,
  IonRow,
} from "@ionic/react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { getEvaluation } from '../../api/content';
import AppBarPopOver from "../../components/layout/AppBarPopOver";
import QuestionTestCard, { Option } from "../../components/QuestionTestCard";
import { AnswerMap, computeCategoryScores, computeMaxScore, toggleAnswer, totalScore } from "../../utils/scoring";
import "./Evaluation.css";

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
  const [answers, setAnswers] = useState<AnswerMap>(new Map());

  useEffect(() => {
    /* Las respuestas arrancan en blanco en cada evaluacion. El outlet de Ionic no
       desmonta la pagina al navegar, asi que sin este borron las respuestas de la
       evaluacion anterior seguirian contando en la siguiente. */
    setAnswers(new Map());
    setLoading(true);

    getEvaluation(id)
      .then(data => {
        if (data.success) setEvaluation(data.evaluation);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const score = useMemo(() => totalScore(answers), [answers]);

  function handleToggle(key: string, category: string, value: number) {
    setAnswers(prev => toggleAnswer(prev, key, category, value));
  }

  function setFinalScore() {
    const { categories, scores } = computeCategoryScores(answers);

    sessionStorage.setItem("totalCategories", String(categories.length));
    categories.forEach((category, i) => {
      sessionStorage.setItem(`category${i}`, category);
      sessionStorage.setItem(`categoryScore${i}`, String(scores[i]));
    });
    sessionStorage.setItem("finalScore", String(score));
    sessionStorage.setItem("maxScore", String(computeMaxScore(evaluation?.questions ?? [])));
  }

  return (
    <IonPage>
      <AppBarPopOver></AppBarPopOver>
      <IonContent fullscreen class="app-dark-bg">
        {loading && (
          <div className="evaluation__skeleton">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="eval-question-skeleton">
                <div className="eval-question-skeleton__title shimmer" />
                <div className="eval-question-skeleton__option shimmer" />
                <div className="eval-question-skeleton__option shimmer" />
                <div className="eval-question-skeleton__option eval-question-skeleton__option--short shimmer" />
              </div>
            ))}
          </div>
        )}
        {!loading && (
          <>
            <h1 className="header__title">{name}</h1>
            <div className="evaluation__questions">
              {evaluation?.questions.map((question, index) => (
                <QuestionTestCard
                  key={index}
                  number={index + 1}
                  questionIndex={index}
                  question={question.text}
                  category={question.category}
                  comments={undefined}
                  options={question.options}
                  answers={answers}
                  onToggle={handleToggle}
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
