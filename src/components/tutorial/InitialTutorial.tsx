import React, { useContext, useEffect, useState } from 'react';
import { IonIcon } from '@ionic/react';
import { close, arrowBack, arrowForward } from 'ionicons/icons';
import axios from 'axios';
import AppContext from '../../context/AppContext';
import './InitialTutorial.css';

interface TutorialCard {
  name: string;
  description: string;
  type: 'scenario' | 'solution';
  resources: { ambiental: number; economico: number; social: number };
}

interface Tutorial {
  title: string;
  rules: string;
  cards: TutorialCard[];
}

const formatResource = (n: number) => (n > 0 ? `+${n}` : `${n}`);

const SLIDES = [
  'intro',
  'rules',
  'scenario',
  'solution',
] as const;

type SlideKey = typeof SLIDES[number];

const InitialTutorial: React.FC = () => {
  const { toggleTutorial } = useContext(AppContext);
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    axios.get('http://localhost:8080/tutorial')
      .then(res => {
        if (res.data.success) setTutorial(res.data.tutorial);
      })
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  function closeTutorial() {
    localStorage.setItem('tutorial', 'false');
    toggleTutorial!(false);
  }

  if (loading || !tutorial) return null;

  const exampleScenario = tutorial.cards.find(c => c.type === 'scenario');
  const exampleSolution = tutorial.cards.find(c => c.type === 'solution');
  const totalSlides = SLIDES.length;
  const slide: SlideKey = SLIDES[current];

  return (
    <div className='itutorial-overlay'>
      <div className='itutorial-modal'>

        <button className='itutorial-close' onClick={closeTutorial}>
          <IonIcon icon={close} />
        </button>

        <div className='itutorial-slide'>

          {slide === 'intro' && (
            <>
              <p className='itutorial-label'>BIENVENIDO</p>
              <h2 className='itutorial-title'>El juego SOSTEK</h2>
              <p className='itutorial-body'>
                SOSTEK es un juego de cartas educativo donde los jugadores toman decisiones sobre proyectos de sostenibilidad.
              </p>
              <p className='itutorial-body'>
                Cada ronda presenta un <strong>escenario</strong> con un dilema ambiental, económico o social. Los jugadores proponen <strong>soluciones</strong> y suman o restan recursos según su impacto.
              </p>
              <p className='itutorial-body'>
                Gana quien logre el mejor equilibrio entre los tres recursos: <span className='itutorial-tag itutorial-tag--ambiental'>🌿 Ambiental</span> <span className='itutorial-tag itutorial-tag--economico'>💰 Económico</span> <span className='itutorial-tag itutorial-tag--social'>👥 Social</span>
              </p>
            </>
          )}

          {slide === 'rules' && (
            <>
              <p className='itutorial-label'>REGLAS</p>
              <h2 className='itutorial-title'>Cómo se juega</h2>
              <p className='itutorial-rules'>{tutorial.rules}</p>
            </>
          )}

          {slide === 'scenario' && exampleScenario && (
            <>
              <p className='itutorial-label'>TIPO DE TARJETA</p>
              <h2 className='itutorial-title'>Tarjeta de Escenario</h2>
              <p className='itutorial-body'>
                El escenario se coloca al centro de la mesa. Presenta el problema que todos los jugadores deben resolver.
              </p>
              <div className='itutorial-card-example itutorial-card-example--scenario'>
                <span className='itutorial-type-badge itutorial-type-badge--scenario'>Ejemplo</span>
                <h3 className='itutorial-card-name'>{exampleScenario.name}</h3>
                <p className='itutorial-card-desc'>{exampleScenario.description}</p>
              </div>
            </>
          )}

          {slide === 'solution' && exampleSolution && (
            <>
              <p className='itutorial-label'>TIPO DE TARJETA</p>
              <h2 className='itutorial-title'>Tarjeta de Solución</h2>
              <p className='itutorial-body'>
                Cada jugador propone una solución. Dependiendo del impacto, los recursos suben o bajan.
              </p>
              <div className='itutorial-card-example itutorial-card-example--solution'>
                <span className='itutorial-type-badge itutorial-type-badge--solution'>Ejemplo</span>
                <h3 className='itutorial-card-name'>{exampleSolution.name}</h3>
                <p className='itutorial-card-desc'>{exampleSolution.description}</p>
                <div className='itutorial-resources'>
                  <span className='itutorial-resource'>🌿 {formatResource(exampleSolution.resources.ambiental)}</span>
                  <span className='itutorial-resource'>💰 {formatResource(exampleSolution.resources.economico)}</span>
                  <span className='itutorial-resource'>👥 {formatResource(exampleSolution.resources.social)}</span>
                </div>
              </div>
            </>
          )}

        </div>

        <div className='itutorial-nav'>
          <button
            className='itutorial-nav-btn'
            onClick={() => setCurrent(s => s - 1)}
            disabled={current === 0}
          >
            <IonIcon icon={arrowBack} />
          </button>

          <div className='itutorial-dots'>
            {SLIDES.map((_, i) => (
              <span
                key={i}
                className={`itutorial-dot ${i === current ? 'itutorial-dot--active' : ''}`}
              />
            ))}
          </div>

          {current < totalSlides - 1 ? (
            <button className='itutorial-nav-btn' onClick={() => setCurrent(s => s + 1)}>
              <IonIcon icon={arrowForward} />
            </button>
          ) : (
            <button className='itutorial-nav-btn itutorial-nav-btn--done' onClick={closeTutorial}>
              ✓
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default InitialTutorial;
