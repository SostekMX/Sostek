import { IonContent, IonPage } from '@ionic/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getEvaluations } from '../../api/content';
import AppBarPopOver from '../../components/layout/AppBarPopOver';
import './Tab3.css';
import EvaluationCard from '../../components/EvaluationCard';
import { readCache } from '../../utils/cache';

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
  const [evaluations, setEvaluations] = useState<EvaluationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadEvaluations = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await getEvaluations();
      if (!response?.success || !Array.isArray(response.evaluations)) {
        throw new Error('Respuesta de evaluaciones inválida');
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

  /* Agrupar por carrera reemplaza a las pills de filtro: con los tres niveles en fila
     bajo el nombre de la carrera, filtrar y agrupar hacian el mismo trabajo. */
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
      <IonContent fullscreen class='app-dark-bg'>
        <div className='evalua-page'>
          {/* display: contents en mobile, asi que el header queda donde siempre; en
              escritorio arma la fila de titulo + "Como funciona". */}
          <div className='evalua-intro'>
            <header className='evalua-header'>
              <h1 className='evalua-header__title'>Eval&uacute;ate</h1>
              <p className='evalua-header__subtitle'>
                Autodiagn&oacute;sticos de sostenibilidad para tu proyecto. Elige el nivel que
                corresponde a la etapa en la que vas: al terminar te decimos cu&aacute;l fue tu
                eje m&aacute;s d&eacute;bil y con qu&eacute; art&iacute;culos reforzarlo.
              </p>
            </header>

            {/* Solo escritorio: en mobile el subtitulo ya lo cuenta en una linea. */}
            <aside className='evalua-howto' aria-label='Cómo funciona'>
              <p className='evalua-howto__title'>C&oacute;mo funciona</p>
              <ol className='evalua-howto__steps'>
                <li>
                  <span><strong>Elige tu nivel.</strong> Cada carrera tiene tres, seg&uacute;n el semestre en que vas.</span>
                </li>
                <li>
                  <span><strong>Contesta sobre tu proyecto.</strong> Marca todo lo que ya hayas considerado.</span>
                </li>
                <li>
                  <span><strong>Revisa tu resultado.</strong> Te damos tu puntaje, tu eje m&aacute;s d&eacute;bil y art&iacute;culos para reforzarlo.</span>
                </li>
              </ol>
            </aside>
          </div>

          {!loading && failed && (
            <div className='content-load-error' role='alert'>
              <h2 className='content-load-error__title'>No pudimos actualizar las evaluaciones</h2>
              <p className='content-load-error__description'>
                {evaluations.length > 0
                  ? 'Puedes consultar las evaluaciones guardadas mientras recuperamos la conexión.'
                  : 'Revisa tu conexión e inténtalo nuevamente.'}
              </p>
              <button
                type='button'
                className='content-load-error__button'
                disabled={isRefreshing}
                onClick={() => void loadEvaluations()}
              >
                {isRefreshing ? 'Reintentando...' : 'Reintentar'}
              </button>
            </div>
          )}

          {loading && (
            <div className='evaluation-grid'>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className='eval-card-skeleton'>
                  <div className='eval-card-skeleton__header'>
                    <div className='eval-card-skeleton__icon shimmer' />
                    <div className='eval-card-skeleton__badge shimmer' />
                  </div>
                  <div className='eval-card-skeleton__title shimmer' />
                  <div className='eval-card-skeleton__desc shimmer' />
                  <div className='eval-card-skeleton__desc eval-card-skeleton__desc--short shimmer' />
                </div>
              ))}
            </div>
          )}

          {!loading && groups.map(group => (
            <section className='evalua-group' key={group.career}>
              <h2 className='evalua-group__title'>
                {group.career}
                <span className='evalua-group__count'>{group.items.length} {group.items.length === 1 ? 'nivel' : 'niveles'}</span>
              </h2>
              <div className='evaluation-grid'>
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

          {/* No confundir una respuesta vacía con una petición fallida. */}
          {!loading && !failed && evaluations.length === 0 && (
            <p className='tab3-empty'>Todavía no hay evaluaciones disponibles.</p>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab3;
