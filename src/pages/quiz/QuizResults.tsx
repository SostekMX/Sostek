import { IonContent, IonPage, useIonRouter } from '@ionic/react';
import { Button, Glass, SegmentedControl } from 'glisse';
import { useState } from 'react';
import AppBarPopOver from '../../components/layout/AppBarPopOver';
import { TKey, useI18n } from '../../i18n/LanguageContext';
import { axisOf, isMixedAxis } from '../../utils/axis';
import { Classification, formatPoints, QUIZ_RESULT_KEY, QuizResult, toPoints } from '../../utils/quiz';
import '../finalScoreEvaluation/FinalScoreEvaluation.css';
import './Quiz.css';

type Filter = 'all' | 'improve';

const LABEL: Record<Classification, TKey> = { optimal: 'quiz.optimal', partial: 'quiz.partial', none: 'quiz.none' };
const PLURAL: Record<Classification, TKey> = { optimal: 'quiz.optimalPl', partial: 'quiz.partialPl', none: 'quiz.nonePl' };
const CLASSES: Classification[] = ['optimal', 'partial', 'none'];

/* Se lee en el primer render y no en un efecto, para no pintar un 0 falso mientras tanto.
   Una entrada corrupta o sin tramo cuenta como que no hay resultado. */
function readResult(): QuizResult | null {
  try {
    const raw = sessionStorage.getItem(QUIZ_RESULT_KEY);
    const result = raw ? JSON.parse(raw) : null;
    return result?.tier ? result : null;
  } catch {
    return null;
  }
}

const pts = (thirds: number) => formatPoints(toPoints(thirds));

const axisClasses = (name: string) => {
  const axis = axisOf(name);
  return `${axis ? ` axis-${axis}` : ''}${isMixedAxis(name) ? ' axis-tag--mixed' : ''}`;
};

const QuizResults: React.FC = () => {
  const [result] = useState(readResult);
  const [filter, setFilter] = useState<Filter>('all');
  const { t, tx } = useI18n();
  const router = useIonRouter();

  if (!result) {
    return (
      <IonPage>
        <AppBarPopOver />
        <IonContent fullscreen className='canopy'>
          <div className='page score-empty'>
            <h1 className='score-empty__title'>{t('quiz.noResult')}</h1>
            <p className='score-empty__text'>{t('quiz.noResultText')}</p>
            <Button variant='filled' className='btn-lg' onClick={() => router.push('/quiz', 'root')}>{t('quiz.goQuiz')}</Button>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const toImprove = result.questions - result.counts.optimal;

  return (
    <IonPage>
      <AppBarPopOver />
      <IonContent fullscreen className='canopy'>
        <div className='page quiz-result'>
          <div className='quiz-result__top'>
            <section className='quiz-result__main' aria-label={t('quiz.resultAria')}>
              <p className='score-main__name'>
                {t('quiz.level', { n: result.level })} · {tx(result.title)}
              </p>
              <p className='quiz-result__pct'>
                {pts(result.thirds)}<span className='quiz-result__unit'>/{pts(result.maxThirds)}</span>
              </p>
              <div className='score-main__bar' aria-hidden='true'>
                <div className='score-main__fill' style={{ transform: `scaleX(${result.thirds / result.maxThirds})` }} />
              </div>
              <h1 className='score-main__verdict'>{tx(result.tier.title)}</h1>
              <p className='score-main__msg'>{tx(result.tier.text)}</p>

              <dl className='quiz-tally'>
                {CLASSES.map(c => (
                  <div key={c} className={`quiz-tally__item quiz-tone--${c}`}>
                    <dt>{t(PLURAL[c])}</dt>
                    <dd>{result.counts[c]}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <Glass className='quiz-blocks'>
              <section aria-labelledby='quiz-by-block'>
                <h2 className='quiz-blocks__title' id='quiz-by-block'>{t('quiz.byBlock')}</h2>
                <ul className='quiz-blocks__list'>
                  {result.blocks.map(block => (
                    <li key={block.name} className={`quiz-meter${axisClasses(block.name)}`}>
                      <span className='quiz-meter__name'>{tx(block.name)}</span>
                      <span className='quiz-meter__pct'>{block.percent}%</span>
                      <span className='quiz-meter__track' aria-hidden='true'>
                        <span className='quiz-meter__fill' style={{ transform: `scaleX(${block.percent / 100})` }} />
                      </span>
                      <span className='quiz-meter__points'>
                        {t('quiz.points', { a: pts(block.thirds), b: pts(block.maxThirds) })}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            </Glass>
          </div>

          <section className='quiz-feedback' aria-labelledby='quiz-feedback-title'>
            <div className='quiz-feedback__head'>
              <h2 className='section-title' id='quiz-feedback-title'>{t('quiz.review')}</h2>
              <div className='segmented-wide'>
                <SegmentedControl
                  aria-label={t('quiz.review')}
                  items={[
                    { value: 'all', label: `${t('quiz.filterAll')} ${result.questions}` },
                    { value: 'improve', label: `${t('quiz.filterImprove')} ${toImprove}` },
                  ]}
                  value={filter}
                  onValueChange={v => setFilter(v as Filter)}
                />
              </div>
            </div>
            {filter === 'improve' && toImprove === 0 && <p className='empty'>{t('quiz.allOptimal')}</p>}

            {result.blocks.map(block => {
              const items = filter === 'all' ? block.items : block.items.filter(i => i.classification !== 'optimal');
              if (items.length === 0) return null;
              return (
                <section key={block.name} className='quiz-fb-block'>
                  <h3 className={`quiz-fb-block__name axis-tag${axisClasses(block.name)}`}>{tx(block.name)}</h3>
                  <ol className='quiz-fb-list'>
                    {items.map(item => (
                      <li key={item.number} className={`quiz-fb quiz-tone--${item.classification}`}>
                        <p className='quiz-fb__question'>
                          <span className='question__number'>{item.number}.</span> {tx(item.question)}
                        </p>
                        <div className='quiz-fb__answers'>
                          <div className='quiz-fb__answer'>
                            <p className='quiz-fb__label'>
                              {t('quiz.yourAnswer')}
                              <span className='quiz-chip'>{t(LABEL[item.classification])}</span>
                            </p>
                            <p className='quiz-fb__text'>{tx(item.chosen.text)}</p>
                            <p className='quiz-fb__points'>{t('quiz.optionPoints', { a: pts(item.chosenThirds), b: item.weight })}</p>
                          </div>
                          {item.classification !== 'optimal' && (
                            <div className='quiz-fb__answer quiz-fb__answer--best'>
                              <p className='quiz-fb__label'>{t('quiz.bestAnswer')}</p>
                              <p className='quiz-fb__text'>{tx(item.optimal.text)}</p>
                              <p className='quiz-fb__points'>{t('quiz.optionPoints', { a: item.weight, b: item.weight })}</p>
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
              );
            })}
          </section>

          <div className='quiz-result__actions'>
            <Button variant='filled' className='btn-lg' onClick={() => router.push(`/quiz/${result.level}/${result.type}`, 'forward')}>
              {t('quiz.retry')}
            </Button>
            <Button className='btn-line btn-lg' onClick={() => router.push('/quiz', 'back')}>
              {t('quiz.changeType')}
            </Button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default QuizResults;
