import { IonContent, IonPage, useIonRouter } from '@ionic/react';
import { Button } from 'glisse';
import { useState } from 'react';
import AppBarPopOver from '../../components/layout/AppBarPopOver';
import LoadError from '../../components/ui/LoadError';
import useQuizzes from '../../hooks/useQuizzes';
import { TKey, useI18n } from '../../i18n/LanguageContext';
import { questionCount } from '../../utils/quiz';
import './Quiz.css';

/* Los niveles son fijos (uno por etapa de la carrera); si tienen contenido o no sale de
   los datos, asi que el 1 y el 2 se encienden solos cuando se siembren. */
const LEVELS: { n: number; semester: TKey }[] = [
  { n: 1, semester: 'quiz.semester1' },
  { n: 2, semester: 'quiz.semester2' },
  { n: 3, semester: 'quiz.semester3' },
];

const QuizStart: React.FC = () => {
  const { t, tx } = useI18n();
  const router = useIonRouter();
  const { quizzes, loading, failed, isRefreshing, reload } = useQuizzes();
  const [level, setLevel] = useState<number | null>(null);
  const [type, setType] = useState<number | null>(null);

  const types = quizzes.filter(q => q.level === level).sort((a, b) => a.type - b.type);
  const hasLevel = (n: number) => quizzes.some(q => q.level === n);

  function pickLevel(n: number) {
    setLevel(n);
    setType(null);
  }

  return (
    <IonPage>
      <AppBarPopOver />
      <IonContent fullscreen>
        <div className='page quiz'>
          <header className='page-head'>
            <p className='quiz-kicker'>{t('quiz.kicker')}</p>
            <h1 className='page-head__title quiz__title'>{t('quiz.title')}</h1>
            <p className='page-head__lead'>{t('quiz.lead')}</p>
          </header>

          {!loading && failed && (
            <LoadError
              title={t('quiz.loadFail')}
              text={t(quizzes.length > 0 ? 'quiz.loadFailCached' : 'quiz.loadFailEmpty')}
              retrying={isRefreshing}
              onRetry={() => void reload()}
            />
          )}

          {loading && (
            <div className='quiz-levels'>
              {LEVELS.map(({ n }) => <div key={n} className='quiz-choice quiz-choice--skeleton shimmer' />)}
            </div>
          )}

          {!loading && !failed && quizzes.length === 0 && <p className='empty'>{t('quiz.empty')}</p>}

          {!loading && quizzes.length > 0 && (
            <>
              <fieldset className='quiz-step'>
                <legend className='quiz-step__title'>
                  <span className='quiz-step__n' aria-hidden='true'>01</span>
                  {t('quiz.stepLevel')}
                </legend>
                <div className='quiz-levels'>
                  {LEVELS.map(({ n, semester }) => {
                    const soon = !hasLevel(n);
                    const on = level === n;
                    return (
                      <label key={n} className={`quiz-choice quiz-level${on ? ' quiz-choice--on' : ''}${soon ? ' quiz-choice--soon' : ''}`}>
                        <input
                          type='radio'
                          name='quiz-level'
                          className='quiz-choice__input'
                          checked={on}
                          disabled={soon}
                          onChange={() => pickLevel(n)}
                        />
                        <span className='quiz-level__n' aria-hidden='true'>{n}</span>
                        <span className='quiz-level__body'>
                          <span className='quiz-level__title'>{t('quiz.level', { n })}</span>
                          <span className='quiz-level__semester'>{t(semester)}</span>
                          <span className={`quiz-badge${soon ? '' : ' quiz-badge--live'}`}>
                            {t(soon ? 'quiz.soon' : 'quiz.available')}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {level !== null && (
                <fieldset className='quiz-step quiz-step--enter'>
                  <legend className='quiz-step__title'>
                    <span className='quiz-step__n' aria-hidden='true'>02</span>
                    {t('quiz.stepType')}
                  </legend>
                  <div className='quiz-types'>
                    {types.map(quiz => {
                      const on = type === quiz.type;
                      return (
                        <label key={quiz.type} className={`quiz-choice quiz-type${on ? ' quiz-choice--on' : ''}`}>
                          <input
                            type='radio'
                            name='quiz-type'
                            className='quiz-choice__input'
                            checked={on}
                            onChange={() => setType(quiz.type)}
                          />
                          <span className='quiz-type__head'>
                            <span className='quiz-type__kicker'>{t('quiz.type', { n: quiz.type })}</span>
                            <span className='quiz-type__check' aria-hidden='true' />
                          </span>
                          <span className='quiz-type__title'>{tx(quiz.title)}</span>
                          {quiz.summary && <span className='quiz-type__summary'>{tx(quiz.summary)}</span>}
                          {quiz.focus && <span className='quiz-type__focus'>{tx(quiz.focus)}</span>}
                          <span className='quiz-type__meta'>
                            {t('quiz.meta', { q: questionCount(quiz), b: quiz.blocks.length })}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              )}

              <div className='quiz-start'>
                <Button
                  variant='filled'
                  className='btn-lg'
                  disabled={type === null}
                  onClick={() => router.push(`/quiz/${level}/${type}`, 'forward')}
                >
                  {t('quiz.start')}
                </Button>
                {type === null && <p className='quiz-hint'>{t('quiz.pickType')}</p>}
              </div>
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default QuizStart;
