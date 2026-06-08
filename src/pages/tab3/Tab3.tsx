import { IonContent, IonPage } from '@ionic/react';
import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import AppBarPopOver from '../../components/layout/AppBarPopOver';
import AppContext from '../../context/AppContext';
import './Tab3.css';
import EvaluationCard from '../../components/EvaluationCard';

interface EvaluationItem {
  _id: string;
  name: string;
  career: string;
  description?: string;
}

const FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'architect', label: 'Arquitectura' },
  { value: 'design', label: 'Diseño' },
  { value: 'others', label: 'Otros' },
] as const;

type FilterValue = typeof FILTERS[number]['value'];

const Tab3: React.FC = () => {
  const [currentOption, setCurrentOption] = useState<FilterValue>('all');
  const [evaluations, setEvaluations] = useState<EvaluationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { search, changeSearch } = useContext(AppContext);

  useEffect(() => {
    axios.get('http://localhost:8080/evaluations')
      .then(res => {
        if (res.data.success) setEvaluations(res.data.evaluations);
      })
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = [...evaluations]
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter(ev => ev.name.toLowerCase().includes(search.toLowerCase()))
    .filter(ev => {
      if (currentOption === 'architect') return ev.career === 'Arquitectura';
      if (currentOption === 'design') return ev.career === 'Diseño Industrial';
      if (currentOption === 'others') return ev.career !== 'Arquitectura' && ev.career !== 'Diseño Industrial';
      return true;
    });

  return (
    <IonPage>
      <AppBarPopOver />
      <IonContent fullscreen class='app-dark-bg'>
        <div className='filter-pills'>
          {FILTERS.map(f => (
            <button
              key={f.value}
              className={`filter-pill ${currentOption === f.value ? 'filter-pill--active' : ''}`}
              onClick={() => { setCurrentOption(f.value); changeSearch!(''); }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading && (
          <img
            className="imageArticleLoading visible"
            src="/assets/Spinner-1s-200px_transparent.svg"
            alt="cargando"
            style={{ position: 'fixed' }}
          />
        )}

        {!loading && (
          <div className='evaluation-grid'>
            {filtered.map(ev => (
              <EvaluationCard key={ev._id} name={ev.name} id={ev._id} career={ev.career} description={ev.description} />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <p className='tab3-empty'>No hay evaluaciones para este filtro.</p>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Tab3;
