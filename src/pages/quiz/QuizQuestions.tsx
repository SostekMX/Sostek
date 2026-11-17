import { IonContent, IonPage, useIonRouter } from '@ionic/react';
import { Button } from 'glisse';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import AppBarPopOver from '../../components/layout/AppBarPopOver';
import QuestionNav from '../../components/QuestionNav';
import QuizQuestionCard from '../../components/QuizQuestionCard';
import LoadError from '../../components/ui/LoadError';
import useQuizzes from '../../hooks/useQuizzes';
import { useI18n } from '../../i18n/LanguageContext';
import { axisOf, isMixedAxis } from '../../utils/axis';
import { isComplete, QUIZ_RESULT_KEY, QuizAnswers, questionCount, scoreQuiz, shuffledIndices } from '../../utils/quiz';
import '../evaluation/Evaluation.css';
import './Quiz.css';

interface RouteParams {
  level: string;
  type: string;
}

const QuizQuestions: React.FC = () => {
  const { level, type } = useParams<RouteParams>();
  const { t, tx } = useI18n();
  const router = useIonRouter();
  const { quizzes, loading, failed, isRefreshing, reload } = useQuizzes();
  const [answers, setAnswers] = useState<QuizAnswers>({});

  const quiz = quizzes.find(q => q.level === Number(level) && q.type === Number(type));
  const key = `${level}/${type}`;

  /* Las respuestas arrancan en blanco en cada quiz: el outlet de Ionic no desmonta la
     pagina al navegar entre parametros. */
  useEffect(() => setAnswers({}), [key]);

  /* El orden barajado depende solo del quiz y de cuantas opciones tiene cada pregunta. La
     revalidacion contra el backend entrega un arreglo nuevo con el mismo contenido: si el
     orden dependiera de ese objeto, las opciones se moverian bajo el dedo a media respuesta. */
  const shape = quiz ? quiz.blocks.flatMap(b => b.questions.map(q => q.options.length)).join(',') : '';
  const orders = useMemo(
    () => (shape ? shape.split(',').map(n => shuffledIndices(Number(n))) : []),
    // `key` va a proposito: otro quiz con la misma forma tambien se baraja de nuevo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key, shape]
  );

  const total = quiz ? questionCount(quiz) : 0;
  const answered = useMemo(() => new Set(Object.keys(answers).map(Number)), [answers]);
  const complete = quiz ? isComplete(quiz, answers) : false;
  const remaining = total - answered.size;

  function jumpTo(index: number) {
    document.getElementById(`q-${index}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* Recarga a proposito, igual que la evaluacion: la pagina de resultados lee la sesion una
     sola vez y el outlet no la desmonta. */
  function submit() {
    if (!quiz || !complete) return;
    sessionStorage.setItem(QUIZ_RESULT_KEY, JSON.stringify(scoreQuiz(quiz, answers)));
    window.location.assign('/quiz/resultados');
  }

  const submitButton = (
    <div className='quiz-submit'>
      <Button variant='filled' className='btn-lg btn-block' disabled={!complete} onClick={submit}>
        {t('quiz.submit')}
      </Button>
      {!complete && (
        <p className='quiz-hint' aria-live='polite'>
          {remaining === 1 ? t('quiz.remainingOne') : t('quiz.remaining', { n: remaining })}
        </p>
      )}
    </div>
  );

  let index = 0;

  return (
    <IonPage>
      <AppBarPopOver />
      <IonContent fullscreen>
        <div className='page evaluation quiz'>
          {loading && (
            <div className='evaluation__questions'>
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className='question question--skeleton shimmer' />)}
            </div>
          )}

          {!loading && !quiz && failed && quizzes.length === 0 && (
            <LoadError
              title={t('quiz.loadFail')}
              text={t('quiz.loadFailEmpty')}
              retrying={isRefreshing}
              onRetry={() => void reload()}
            />
          )}

          {!loading && !quiz && (!failed || quizzes.length > 0) && (
            <div className='page-message'>
              <p>{t('quiz.notFound')}</p>
              <Button className='btn-line quiz-message__cta' onClick={() => router.push('/quiz', 'back')}>
                {t('quiz.backToStart')}
              </Button>
            </div>
          )}

          {!loading && quiz && (
            <>
              <header className='page-head'>
                <p className='quiz-kicker'>
                  {t('quiz.level', { n: quiz.level })} · {t('quiz.type', { n: quiz.type })}
                </p>
                <h1 className='page-head__title'>{tx(quiz.title)}</h1>
                {quiz.focus && <p className='page-head__lead'>{tx(quiz.focus)}</p>}
                <p className='quiz-run__intro'>
                  <strong>{t('quiz.meta', { q: total, b: quiz.blocks.length })}.</strong> {t('quiz.intro')}
                </p>
              </header>

              <div className='evaluation__layout'>
                <QuestionNav total={total} answered={answered} onJump={jumpTo} submit={submitButton} />

                <div className='evaluation__questions'>
                  {quiz.blocks.map((block, b) => {
                    const axis = axisOf(block.name);
                    return (
                      <section
                        key={block.name}
                        className={`quiz-block${axis ? ` axis-${axis}` : ''}`}
                        aria-labelledby={`block-${b}`}
                      >
                        <header className='quiz-block__head'>
                          <p className='quiz-block__kicker'>
                            <span className={`axis-tag${axis ? ` axis-${axis}` : ''}${isMixedAxis(block.name) ? ' axis-tag--mixed' : ''}`}>
                              {t('quiz.block', { n: b + 1 })}
                            </span>
                            <span>{t('quiz.blockQuestions', { n: block.questions.length })}</span>
                          </p>
                          <h2 className='quiz-block__name' id={`block-${b}`}>{tx(block.name)}</h2>
                        </header>

                        {block.questions.map(question => {
                          const i = index++;
                          return (
                            <QuizQuestionCard
                              key={i}
                              id={`q-${i}`}
                              number={i + 1}
                              question={question}
                              order={orders[i] ?? question.options.map((_, o) => o)}
                              value={answers[i]}
                              onAnswer={option => setAnswers(prev => ({ ...prev, [i]: option }))}
                            />
                          );
                        })}
                      </section>
                    );
                  })}
                  <div className='evaluation__submit'>{submitButton}</div>
                </div>
              </div>
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default QuizQuestions;
