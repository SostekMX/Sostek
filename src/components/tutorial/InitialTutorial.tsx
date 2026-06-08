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

const InitialTutorial: React.FC = () => {
  const { toggleTutorial } = useContext(AppContext);
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

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

  const totalSlides = 1 + tutorial.cards.length;
  const card = currentSlide > 0 ? tutorial.cards[currentSlide - 1] : null;

  return (
    <div className='itutorial-overlay'>
      <div className='itutorial-modal'>

        <button className='itutorial-close' onClick={closeTutorial}>
          <IonIcon icon={close} />
        </button>

        <div className='itutorial-slide'>
          {currentSlide === 0 ? (
            <>
              <p className='itutorial-label'>INSTRUCTIVO</p>
              <h2 className='itutorial-title'>{tutorial.title}</h2>
              <p className='itutorial-rules'>{tutorial.rules}</p>
            </>
          ) : (
            card && (
              <>
                <span className={`itutorial-type-badge itutorial-type-badge--${card.type}`}>
                  {card.type === 'scenario' ? 'Escenario' : 'Solución'}
                </span>
                <h3 className='itutorial-card-name'>{card.name}</h3>
                <p className='itutorial-card-desc'>{card.description}</p>
                <div className='itutorial-resources'>
                  <span className='itutorial-resource itutorial-resource--ambiental'>
                    🌿 {formatResource(card.resources.ambiental)}
                  </span>
                  <span className='itutorial-resource itutorial-resource--economico'>
                    💰 {formatResource(card.resources.economico)}
                  </span>
                  <span className='itutorial-resource itutorial-resource--social'>
                    👥 {formatResource(card.resources.social)}
                  </span>
                </div>
              </>
            )
          )}
        </div>

        <div className='itutorial-nav'>
          <button
            className='itutorial-nav-btn'
            onClick={() => setCurrentSlide(s => s - 1)}
            disabled={currentSlide === 0}
          >
            <IonIcon icon={arrowBack} />
          </button>
          <span className='itutorial-progress'>{currentSlide + 1} / {totalSlides}</span>
          <button
            className='itutorial-nav-btn'
            onClick={() => setCurrentSlide(s => s + 1)}
            disabled={currentSlide === totalSlides - 1}
          >
            <IonIcon icon={arrowForward} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default InitialTutorial;
