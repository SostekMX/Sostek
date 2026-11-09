import { IonContent, IonPage } from '@ionic/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getEvaluations } from '../../api/content';
import AppBarPopOver from '../../components/layout/AppBarPopOver';
import './Tab3.css';
import EvaluationCard from '../../components/EvaluationCard';
import LoadError from '../../components/ui/LoadError';
import { readCache } from '../../utils/cache';
import { useI18n } from '../../i18n/LanguageContext';

interface EvaluationItem {
  _id: string;
  name: string;
  career: string;
  description?: string;
  question_count?: number;
}

/* El nivel sale del nombre ("Arquitectura Nivel 2") porque GET /evaluations no trae un
   campo propio y no vale la pena migrar el modelo por un dato que ya esta ahi. Lo que no
   calce se ordena al final de su grupo y conserva su nombre completo en la tarjeta. */
function levelOf(name: string): number | undefined {
  const match = /nivel\s*(\d+)/i.exec(name);
  return match ? Number(match[1]) : undefined;
}

const Tab3: React.FC = () => {
  const { t, tx } = useI18n();
  const [evaluations, setEvaluations] = useState<EvaluationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadEvaluations = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await getEvaluations();
      if (!response?.success || !Array.isArray(response.evaluations)) {
        throw new Error('Respuesta de evaluaciones invalida');
      }
      setEvaluations(response.evaluations);
      localStorage.setItem('evaluations', JSON.stringify(response.evaluations));
      setFailed(false);
    } catch (error) {
      console.error('Error loading evaluations:', error);
      setFailed(true);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const cached = readCache<EvaluationItem[]>('evaluations');
    if (Array.isArray(cached)) {
      setEvaluations(cached);
      setLoading(false);
    }
    void loadEvaluations();
  }, [loadEvaluations]);

  /* Agrupar por carrera reemplaza a un filtro: con los tres niveles en fila bajo el nombre
     de la carrera, filtrar y agrupar harian el mismo trabajo. */
  const groups = useMemo(() => {
    const byCareer = new Map<string, EvaluationItem[]>();
    evaluations.forEach(ev => {
      const list = byCareer.get(ev.career);
      if (list) list.push(ev);
      else byCareer.set(ev.career, [ev]);
    });

    return Array.from(byCareer.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([career, items]) => ({
        career,
        items: items.sort((a, b) =>
          ((levelOf(a.name) ?? 99) - (levelOf(b.name) ?? 99)) || a.name.localeCompare(b.name)
        ),
      }));
  }, [evaluations]);

  return (
    <IonPage>
      <AppBarPopOver />
      <IonContent fullscreen>
        <div className='page evalua'>
          <header className='page-head'>
            <h1 className='page-head__title'>{t('assess.title')}</h1>
            <p className='page-head__lead'>{t('assess.subtitle')}</p>
          </header>

          <ol className='evalua-steps' aria-label={t('assess.howTitle')}>
            <li><strong>{t('assess.step1Title')}</strong> {t('assess.step1')}</li>
            <li><strong>{t('assess.step2Title')}</strong> {t('assess.step2')}</li>
            <li><strong>{t('assess.step3Title')}</strong> {t('assess.step3')}</li>
          </ol>

          {!loading && failed && (
            <LoadError
              title={t('assess.updateFail')}
              text={t(evaluations.length > 0 ? 'assess.updateFailCached' : 'assess.updateFailEmpty')}
              retrying={isRefreshing}
              onRetry={() => void loadEvaluations()}
            />
          )}

          {loading && (
            <div className='evalua-grid'>
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className='level level--skeleton shimmer' />)}
            </div>
          )}

          {!loading && groups.map(group => (
            <section className='evalua-group' key={group.career}>
              <h2 className='evalua-group__title'>{tx(group.career)}</h2>
              <div className='evalua-grid'>
                {group.items.map(ev => (
                  <EvaluationCard
                    key={ev._id}
                    name={ev.name}
                    id={ev._id}
                    level={levelOf(ev.name)}
                    description={ev.description}
                    questionCount={ev.question_count}
                  />
                ))}
              </div>
            </section>
          ))}

          {/* Una respuesta vacia no es una peticion fallida: esa ya la avisa LoadError. */}
          {!loading && !failed && evaluations.length === 0 && (
            <p className='empty'>{t('assess.empty')}</p>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab3;
