import { IonIcon, useIonRouter } from '@ionic/react';
import { arrowForward } from 'ionicons/icons';
import { useI18n } from '../i18n/LanguageContext';
import './QuizEntry.css';

/* Acceso al quiz desde APRENDE: una franja con el follaje de fondo, toda ella es el enlace. */
const QuizEntry: React.FC = () => {
  const { t } = useI18n();
  const router = useIonRouter();

  return (
    <section className='section aprende-section'>
      <a
        href='/quiz'
        className='quiz-entry'
        onClick={e => { e.preventDefault(); router.push('/quiz', 'forward'); }}
      >
        <span className='quiz-entry__mark' aria-hidden='true'>%</span>
        <div className='quiz-entry__copy'>
          <span className='quiz-entry__kicker'>{t('quiz.kicker')}</span>
          <h2 className='quiz-entry__title'>{t('quiz.entryTitle')}</h2>
          <span className='quiz-entry__text'>{t('quiz.entryText')}</span>
        </div>
        <span className='quiz-entry__cta'>
          {t('quiz.entryCta')}
          <IonIcon icon={arrowForward} aria-hidden='true' />
        </span>
      </a>
    </section>
  );
};

export default QuizEntry;
