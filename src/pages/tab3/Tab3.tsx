import { IonContent, IonPage } from '@ionic/react';
import { useEffect, useMemo, useState } from 'react';
import { getEvaluations } from '../../api/content';
import AppBarPopOver from '../../components/layout/AppBarPopOver';
import './Tab3.css';
import EvaluationCard from '../../components/EvaluationCard';

interface EvaluationItem {
  _id: string;
  name: string;
  career: string;
  description?: string;
  question_count?: number;
}

const TODOS = 'all';

const Tab3: React.FC = () => {
  const [currentOption, setCurrentOption] = useState<string>(TODOS);
  const [evaluations, setEvaluations] = useState<EvaluationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const cached = localStorage.getItem("evaluations");
    if (cached) {
      setEvaluations(JSON.parse(cached));
      setLoading(false);
    }

    getEvaluations()
      .then(data => {
        if (data.success) {
          setEvaluations(data.evaluations);
          localStorage.setItem("evaluations", JSON.stringify(data.evaluations));
        } else {
          setFailed(true);
        }
      })
      .catch(err => { console.error(err); setFailed(true); })
      .finally(() => setLoading(false));
  }, []);

  /* Las carreras salen de los datos, no de una lista fija: antes habia una pill "Otros"
     que nunca tuvo nada detras, porque ninguna evaluacion usa esa carrera. */
  const careers = useMemo(
    () => Array.from(new Set(evaluations.map(ev => ev.career))).sort((a, b) => a.localeCompare(b)),
    [evaluations]
  );

  /* Si la carrera activa desaparece en un refetch, la lista quedaria vacia sin
     explicacion. */
  const activeOption = currentOption === TODOS || careers.includes(currentOption) ? currentOption : TODOS;

  const filtered = [...evaluations]
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter(ev => activeOption === TODOS || ev.career === activeOption);

  return (
    <IonPage>
      <AppBarPopOver />
      <IonContent fullscreen class='app-dark-bg'>
        <div className='filter-pills'>
          {[TODOS, ...careers].map(option => (
            <button
              key={option}
              className={`filter-pill ${activeOption === option ? 'filter-pill--active' : ''}`}
              onClick={() => setCurrentOption(option)}
            >
              {option === TODOS ? 'Todos' : option}
            </button>
          ))}
        </div>

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

        {!loading && (
          <div className='evaluation-grid'>
            {filtered.map(ev => (
              <EvaluationCard key={ev._id} name={ev.name} id={ev._id} career={ev.career} description={ev.description} questionCount={ev.question_count} />
            ))}
          </div>
        )}

        {/* Un fallo de red no es un filtro sin resultados: si la peticion fallo y no
            hubo cache que mostrar, el mensaje tiene que decir eso y no culpar al filtro. */}
        {!loading && filtered.length === 0 && (
          <p className='tab3-empty'>
            {failed && evaluations.length === 0
              ? 'No pudimos cargar las evaluaciones. Revisa tu conexión e intenta de nuevo.'
              : 'No hay evaluaciones para este filtro.'}
          </p>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Tab3;
