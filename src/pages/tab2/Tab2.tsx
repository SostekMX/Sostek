import React, { useEffect, useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import axios from 'axios';
import { BACKEND_URL } from '../../config';
import AppBarPopOver from '../../components/layout/AppBarPopOver';
import './Tab2.css';

interface GameCard {
  name: string;
  description: string;
  type: 'scenario' | 'solution';
  resources: { ambiental: number; economico: number; social: number };
}

interface Tutorial {
  title: string;
  rules: string;
  cards: GameCard[];
}

type CardFilter = 'scenario' | 'solution';

const formatResource = (n: number) => (n > 0 ? `+${n}` : `${n}`);

const Tab2: React.FC = () => {
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [cardFilter, setCardFilter] = useState<CardFilter>('scenario');

  useEffect(() => {
    axios.get(`${BACKEND_URL}/tutorial`)
      .then(res => { if (res.data.success) setTutorial(res.data.tutorial); })
      .catch(err => console.log(err));
  }, []);

  const filteredCards = tutorial?.cards.filter(c => c.type === cardFilter) ?? [];

  return (
    <IonPage>
      <AppBarPopOver />
      <IonContent fullscreen class='app-dark-bg'>
        <div className='juega-page'>

          {/* Hero */}
          <div className='juega-hero'>
            <p className='juega-hero__label'>VIDEOJUEGO EDUCATIVO</p>
            <h1 className='juega-hero__title'>Survivor</h1>
            <p className='juega-hero__subtitle'>Aprende sobre sostenibilidad mientras juegas</p>
          </div>

          {/* Video */}
          <div className='juega-video-wrapper'>
            <video className='juega-video' controls>
              <source src="/assets/survivor.m4v" />
            </video>
          </div>

          {/* Descarga */}
          <a
            href="https://drive.google.com/file/d/1ZBfQKAAVHg7BtDwt1iblhgKk3ykbTOO3/view"
            target="_blank"
            rel="noopener noreferrer"
            className='juega-download-card'
          >
            <div className='juega-download-card__icon'>&#8595;</div>
            <div>
              <p className='juega-download-card__title'>Versión física</p>
              <p className='juega-download-card__desc'>Imprime las cartas y juega con tus amigos</p>
            </div>
          </a>

          {/* Versión online */}
          <div className='juega-wip'>
            <div className='juega-wip__dot' />
            <div>
              <p className='juega-wip__text'>La versión online está en construcción</p>
              <p className='juega-wip__text'>Próximamente disponible</p>
            </div>
          </div>

          {/* Instructivo */}
          <div className='juega-section-header'>
            <p className='juega-section-label'>INSTRUCTIVO</p>
            <h2 className='juega-section-title'>¿Cómo se juega?</h2>
          </div>

          {/* Stats */}
          <div className='juega-stats'>
            <div className='juega-stat'>
              <span className='juega-stat__value'>4–6</span>
              <span className='juega-stat__label'>jugadores</span>
            </div>
            <div className='juega-stat'>
              <span className='juega-stat__value'>4</span>
              <span className='juega-stat__label'>tipos de tarjeta</span>
            </div>
            <div className='juega-stat'>
              <span className='juega-stat__value'>20</span>
              <span className='juega-stat__label'>fichas por recurso</span>
            </div>
          </div>

          {/* Tipos de tarjeta */}
          <div className='juega-card-types'>
            <div className='juega-card-type juega-card-type--scenario'>
              <span className='juega-card-type__name'>Escenario</span>
              <span className='juega-card-type__desc'>Problema al centro de la mesa</span>
            </div>
            <div className='juega-card-type juega-card-type--ambiental'>
              <span className='juega-card-type__name'>🌿 Ambiental</span>
              <span className='juega-card-type__desc'>Solución de impacto ambiental</span>
            </div>
            <div className='juega-card-type juega-card-type--economico'>
              <span className='juega-card-type__name'>💰 Económico</span>
              <span className='juega-card-type__desc'>Solución de impacto económico</span>
            </div>
            <div className='juega-card-type juega-card-type--social'>
              <span className='juega-card-type__name'>👥 Social</span>
              <span className='juega-card-type__desc'>Solución de impacto social</span>
            </div>
          </div>

          {/* Reglas */}
          {tutorial && (
            <div className='juega-rules'>
              <p className='juega-section-label'>REGLAS</p>
              <p className='juega-rules__text'>{tutorial.rules}</p>
            </div>
          )}

          {/* Tarjetas */}
          {tutorial && (
            <>
              <div className='juega-section-header'>
                <p className='juega-section-label'>TARJETAS DEL JUEGO</p>
                <h2 className='juega-section-title'>Explora las cartas</h2>
              </div>

              <div className='juega-filter-pills'>
                <button
                  className={`juega-filter-pill ${cardFilter === 'scenario' ? 'juega-filter-pill--active' : ''}`}
                  onClick={() => setCardFilter('scenario')}
                >
                  Escenario ({tutorial.cards.filter(c => c.type === 'scenario').length})
                </button>
                <button
                  className={`juega-filter-pill ${cardFilter === 'solution' ? 'juega-filter-pill--active' : ''}`}
                  onClick={() => setCardFilter('solution')}
                >
                  Solución ({tutorial.cards.filter(c => c.type === 'solution').length})
                </button>
              </div>

              <div className='juega-cards-list'>
                {filteredCards.map((card, i) => (
                  <div key={i} className={`juega-game-card juega-game-card--${card.type}`}>
                    <p className='juega-game-card__name'>{card.name}</p>
                    <p className='juega-game-card__desc'>{card.description}</p>
                    {card.type === 'solution' && (
                      <div className='juega-game-card__resources'>
                        <span>🌿 {formatResource(card.resources.ambiental)}</span>
                        <span>💰 {formatResource(card.resources.economico)}</span>
                        <span>👥 {formatResource(card.resources.social)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
