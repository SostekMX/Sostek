import React, { useEffect, useState } from 'react';
import { IonContent, IonIcon, IonPage } from '@ionic/react';
import { Button, SegmentedControl } from 'glisse';
import { downloadOutline, play } from 'ionicons/icons';
import { getTutorial } from '../../api/content';
import AppBarPopOver from '../../components/layout/AppBarPopOver';
import { readCache } from '../../utils/cache';
import { TKey, useI18n } from '../../i18n/LanguageContext';
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
type ResourceKey = keyof GameCard['resources'];

const formatResource = (n: number) => (n > 0 ? `+${n}` : `${n}`);

const AXES: { key: ResourceKey; labelKey: TKey; descKey: TKey }[] = [
  { key: 'ambiental', labelKey: 'axis.environmental', descKey: 'play.envDesc' },
  { key: 'economico', labelKey: 'axis.economic', descKey: 'play.econDesc' },
  { key: 'social', labelKey: 'axis.social', descKey: 'play.socDesc' },
];

/* Casi todas las cartas mueven entre -3 y +3; con la escala en el maximo real (10) esas
   barras serian rayitas. Lo que pasa de 5 llena media pista y el numero dice el resto. */
const METER_SCALE = 5;

const Tab2: React.FC = () => {
  const { t, tx } = useI18n();
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [loading, setLoading] = useState(true);
  const [cardFilter, setCardFilter] = useState<CardFilter>('scenario');
  const [rulesOpen, setRulesOpen] = useState(false);
  const [playing, setPlaying] = useState(false);

  /* Mismo cache que APRENDE y EVALUATE: sin el, un backend dormido (Render tarda en
     despertar) o caido dejaba las reglas en blanco aunque ya se hubieran visto antes. */
  useEffect(() => {
    const cached = readCache<Tutorial>('tutorial');
    if (cached) {
      setTutorial(cached);
      setLoading(false);
    }

    getTutorial()
      .then(data => {
        if (data.success) {
          setTutorial(data.tutorial);
          localStorage.setItem('tutorial', JSON.stringify(data.tutorial));
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const countOf = (type: CardFilter) => tutorial?.cards.filter(c => c.type === type).length ?? 0;
  const filteredCards = tutorial?.cards.filter(c => c.type === cardFilter) ?? [];

  return (
    <IonPage>
      <AppBarPopOver />
      <IonContent fullscreen>
        <div className='juega'>
          {/* El cartel de la pelicula: el video solo se carga cuando se pide. */}
          <section className={`film${playing ? ' film--playing' : ''}`}>
            {playing ? (
              <video className='film__video' controls autoPlay preload='metadata'>
                <source src='/assets/survivor.m4v' />
              </video>
            ) : (
              <>
                <div className='film__text'>
                  <h1 className='film__title'>Survivor</h1>
                  <div className='film__row'>
                    <p className='film__lead'>{t('play.subtitle')}</p>
                    <Button
                      variant='filled'
                      className='btn-lg film__play'
                      icon={<IonIcon icon={play} aria-hidden='true' />}
                      onClick={() => setPlaying(true)}
                    >
                      {t('play.watch')}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </section>

          <div className='juega__body'>
            <section className='juega-howto'>
              <div>
                <h2 className='section-title'>{t('play.howtoTitle')}</h2>
                <p className='juega-facts'>{t('play.facts')}</p>

                <ul className='juega-types'>
                  <li>
                    <span className='axis-tag'>{t('play.scenario')}</span>
                    <span>{t('play.scenarioDesc')}</span>
                  </li>
                  {AXES.map(({ key, labelKey, descKey }) => (
                    <li key={key} className={`axis-${key}`}>
                      <span className='axis-tag'>{t(labelKey)}</span>
                      <span>{t(descKey)}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href='https://drive.google.com/file/d/1ZBfQKAAVHg7BtDwt1iblhgKk3ykbTOO3/view'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='juega-print'
                >
                  <span>
                    <strong>{t('play.printTitle')}</strong>
                    <span>{t('play.printDesc')}</span>
                  </span>
                  <IonIcon icon={downloadOutline} aria-label={t('play.download')} />
                </a>
                <p className='juega-wip'>{t('play.wip1')}. {t('play.wip2')}.</p>
              </div>

              <div className='juega-rules'>
                <h2 className='section-title'>{t('play.rulesLabel')}</h2>
                {loading ? (
                  <div>
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div key={i} className='juega-rules__line shimmer' />
                    ))}
                  </div>
                ) : tutorial ? (
                  <>
                    <p className={`juega-rules__text${rulesOpen ? '' : ' juega-rules__text--clamped'}`}>
                      {tx(tutorial.rules)}
                    </p>
                    <button type='button' className='text-link juega-rules__toggle' onClick={() => setRulesOpen(o => !o)}>
                      {rulesOpen ? t('play.rulesLess') : t('play.rulesAll')}
                    </button>
                  </>
                ) : (
                  <p className='empty'>{t('play.rulesFail')}</p>
                )}
              </div>
            </section>

            {(loading || tutorial) && (
              <section className='section'>
                <div className='juega-cards-head'>
                  <h2 className='juega-cards-title'>{t('play.cardsTitle')}</h2>
                  {!loading && tutorial && (
                    <div className='segmented-wide'>
                      <SegmentedControl
                        aria-label={t('play.cardsTitle')}
                        items={[
                          { value: 'scenario', label: `${t('play.scenario')} ${countOf('scenario')}` },
                          { value: 'solution', label: `${t('play.solution')} ${countOf('solution')}` },
                        ]}
                        value={cardFilter}
                        onValueChange={v => setCardFilter(v as CardFilter)}
                      />
                    </div>
                  )}
                </div>

                <div className='juega-cards'>
                  {loading && Array.from({ length: 8 }).map((_, i) => <div key={i} className='game-card game-card--skeleton shimmer' />)}

                  {!loading && filteredCards.map((card, i) => (
                    <article key={i} className={`game-card game-card--${card.type}`}>
                      <h3 className='game-card__name'>{tx(card.name)}</h3>
                      <p className='game-card__desc'>{tx(card.description)}</p>
                      {card.type === 'solution' && (
                        <dl className='game-card__meter'>
                          {AXES.map(({ key, labelKey }) => {
                            const value = card.resources[key];
                            const width = Math.min(Math.abs(value), METER_SCALE) / METER_SCALE * 50;
                            return (
                              <div key={key} className={`meter axis-${key}`}>
                                <dt>{t(labelKey)}</dt>
                                <dd className='meter__track'>
                                  <span className={`meter__bar${value < 0 ? ' meter__bar--neg' : ''}`} style={{ width: `${width}%` }} />
                                </dd>
                                <dd className='meter__value'>{formatResource(value)}</dd>
                              </div>
                            );
                          })}
                        </dl>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
