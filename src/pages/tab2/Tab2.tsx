import React, { useEffect, useState } from 'react';
import { IonContent, IonIcon, IonPage } from '@ionic/react';
import { downloadOutline } from 'ionicons/icons';
import { getTutorial } from '../../api/content';
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

type ResourceKey = keyof GameCard['resources'];

const AXES: { key: ResourceKey; label: string }[] = [
  { key: 'ambiental', label: 'Ambiental' },
  { key: 'economico', label: 'Económico' },
  { key: 'social', label: 'Social' },
];

/* Casi todas las cartas mueven entre -3 y +3; con la escala en el maximo real (10) esas
   barras serian rayitas. Lo que pasa de 5 llena media pista y el numero dice el resto. */
const METER_SCALE = 5;

/* El eje que mas suma una carta de solucion pinta su borde en escritorio. */
const dominantAxis = (r: GameCard['resources']): ResourceKey =>
  AXES.reduce((best, { key }) => (r[key] > r[best] ? key : best), 'ambiental' as ResourceKey);

const Tab2: React.FC = () => {
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [loading, setLoading] = useState(true);
  const [cardFilter, setCardFilter] = useState<CardFilter>('scenario');
  const [rulesOpen, setRulesOpen] = useState(false);

  /* Mismo cache que APRENDE y EVALUATE: sin el, un backend dormido (Render tarda en
     despertar) o caido dejaba las reglas en blanco aunque ya se hubieran visto antes. */
  useEffect(() => {
    const cached = localStorage.getItem("tutorial");
    if (cached) {
      setTutorial(JSON.parse(cached));
      setLoading(false);
    }

    getTutorial()
      .then(data => {
        if (data.success) {
          setTutorial(data.tutorial);
          localStorage.setItem("tutorial", JSON.stringify(data.tutorial));
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
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

          {/* Bloque superior. En mobile es una columna en el orden del DOM;
              en desktop el grid coloca descarga y aviso en la columna
              derecha, sin alterar ese orden. */}
          <div className='juega-top'>

            {/* Video */}
            <div className='juega-video-wrapper'>
              <video
                className='juega-video'
                controls
                poster="/assets/survivor-poster.png"
                preload="metadata"
              >
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
              <div className='juega-download-card__icon'><IonIcon icon={downloadOutline} /></div>
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

            <div className='juega-top__howto'>
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
            </div>

            {/* Reglas. El card se renderiza siempre para conservar su
                celda en el grid; lo que cambia es el contenido. */}
            <div className='juega-rules'>
              <p className='juega-section-label'>REGLAS</p>
              {loading ? (
                <div className='juega-rules__skeleton'>
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className='juega-rules__skeleton-line shimmer' />
                  ))}
                </div>
              ) : tutorial ? (
                <>
                  <p className={`juega-rules__text ${rulesOpen ? '' : 'juega-rules__text--clamped'}`}>
                    {tutorial.rules}
                  </p>
                  <button className='juega-rules__toggle' onClick={() => setRulesOpen(o => !o)}>
                    {rulesOpen ? 'Ver menos' : 'Ver todas las reglas'}
                  </button>
                </>
              ) : (
                <p className='juega-empty'>
                  No pudimos cargar el instructivo. Revisa tu conexión e intenta de nuevo.
                </p>
              )}
            </div>

          </div>

          {/* Tarjetas */}
          {(loading || tutorial) && (
            <>
              <div className='juega-section-header'>
                <p className='juega-section-label'>TARJETAS DEL JUEGO</p>
                <h2 className='juega-section-title'>Explora las cartas</h2>
              </div>
            </>
          )}

          {loading && (
            <>
              <div className='juega-filter-pills'>
                <div className='juega-filter-pill juega-filter-pill--skeleton shimmer' />
                <div className='juega-filter-pill juega-filter-pill--skeleton shimmer' />
              </div>

              <div className='juega-cards-list'>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className='juega-game-card juega-game-card--skeleton'>
                    <div className='juega-game-card__skeleton-name shimmer' />
                    <div className='juega-game-card__skeleton-line shimmer' />
                    <div className='juega-game-card__skeleton-line shimmer' />
                    <div className='juega-game-card__skeleton-line shimmer' />
                    <div className='juega-game-card__skeleton-line juega-game-card__skeleton-line--short shimmer' />
                  </div>
                ))}
              </div>
            </>
          )}

          {!loading && tutorial && (
            <>
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
                  <div
                    key={i}
                    className={`juega-game-card juega-game-card--${card.type}${card.type === 'solution' ? ` axis-${dominantAxis(card.resources)}` : ''}`}
                  >
                    {/* Solo escritorio: el tipo de carta como en la carta impresa. */}
                    <p className='juega-game-card__kind'>{card.type === 'scenario' ? 'Escenario' : 'Solución'}</p>
                    <p className='juega-game-card__name'>{card.name}</p>
                    <p className='juega-game-card__desc'>{card.description}</p>
                    {card.type === 'solution' && (
                      <div className='juega-game-card__resources'>
                        <span>🌿 {formatResource(card.resources.ambiental)}</span>
                        <span>💰 {formatResource(card.resources.economico)}</span>
                        <span>👥 {formatResource(card.resources.social)}</span>
                      </div>
                    )}
                    {/* Solo escritorio: los mismos recursos como barras que salen del cero
                        hacia la derecha (suma) o la izquierda (resta), cada una con el color
                        de su eje. */}
                    {card.type === 'solution' && (
                      <dl className='juega-game-card__meter'>
                        {AXES.map(({ key, label }) => {
                          const value = card.resources[key];
                          const width = Math.min(Math.abs(value), METER_SCALE) / METER_SCALE * 50;
                          return (
                            <div key={key} className={`juega-meter__row axis-${key}`}>
                              <dt className='juega-meter__label'>{label}</dt>
                              <dd className='juega-meter__track'>
                                <span
                                  className={`juega-meter__bar${value < 0 ? ' juega-meter__bar--neg' : ''}`}
                                  style={{ width: `${width}%` }}
                                />
                              </dd>
                              <dd className='juega-meter__value'>{formatResource(value)}</dd>
                            </div>
                          );
                        })}
                      </dl>
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
