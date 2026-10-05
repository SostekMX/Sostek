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
import QuestionNav from "../../components/QuestionNav";
import QuestionTestCard, { Option } from "../../components/QuestionTestCard";
import { AnswerMap, computeMaxScore, toggleAnswer, totalScore, weakestCategory } from "../../utils/scoring";
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
    setEvaluation(null);
    setLoading(true);

    getEvaluation(id)
      .then(data => {
        if (data.success) setEvaluation(data.evaluation);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const score = useMemo(() => totalScore(answers), [answers]);

  /* Que preguntas estan contestadas sale del mismo mapa: la clave es
     `${indicePregunta}:${indiceOpcion}`, asi que basta con quedarse con la primera mitad.
     Una pregunta cuenta una sola vez por mas opciones que se marquen. */
  const answered = useMemo(
    () => new Set(Array.from(answers.keys()).map(key => Number(key.split(':')[0]))),
    [answers]
  );

  const total = evaluation?.questions.length ?? 0;

  /* scroll-margin-top en la tarjeta evita que la barra sticky tape la pregunta, asi que
     no hay que calcular desplazamientos a mano. */
  function jumpTo(index: number) {
    document.getElementById(`q-${index}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleToggle(key: string, category: string, value: number) {
    setAnswers(prev => toggleAnswer(prev, key, category, value));
  }

  function setFinalScore() {
    const questions = evaluation?.questions ?? [];
    sessionStorage.setItem("finalScore", String(score));
    sessionStorage.setItem("maxScore", String(computeMaxScore(questions)));
    sessionStorage.setItem("weakestCategory", weakestCategory(answers, questions));
    sessionStorage.setItem("scorePending", "1");
  }

  /* El mismo elemento se renderiza en el panel y al final de las preguntas: un elemento
     de React es un descriptor inmutable, no hace falta un componente para reusarlo. */
  const submitButton = (
    <IonButton
      onClick={setFinalScore}
      color="primary"
      href={`/score/${name}`}
      expand="block"
    >
      Obtener resultados
    </IonButton>
  );

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
        {!loading && !evaluation && (
          <p className="page-message">
            No pudimos cargar esta evaluaci&oacute;n. Revisa tu conexi&oacute;n e intenta de nuevo.
          </p>
        )}
        {!loading && evaluation && (
          <>
            <h1 className="header__title">{name}</h1>

            <div className="eval-progress">
              <div className="eval-progress__bar">
                <div className="eval-progress__fill" style={{ width: `${total > 0 ? (answered.size / total) * 100 : 0}%` }} />
              </div>
              <span className="eval-progress__count">{answered.size} de {total}</span>
            </div>

            {/* El nav va antes que las preguntas en el DOM para que en mobile el
                desplegable quede arriba; en desktop la colocacion explicita del grid lo
                manda a la columna derecha. */}
            <div className="evaluation__layout">
              <QuestionNav total={total} answered={answered} onJump={jumpTo} submit={submitButton} />

              <div className="evaluation__questions">
                {evaluation?.questions.map((question, index) => (
                  <QuestionTestCard
                    key={index}
                    id={`q-${index}`}
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
                <IonRow className="align-center evaluation__submit">{submitButton}</IonRow>
              </div>
            </div>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Evaluation;
