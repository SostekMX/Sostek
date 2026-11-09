import React from 'react';
import { IonContent, IonIcon, IonMenu, useIonRouter } from '@ionic/react';
import {
  bookOutline, gameControllerOutline, clipboardOutline, heartOutline,
  personCircleOutline, logOutOutline, logInOutline,
} from 'ionicons/icons';
import { clearSession, isLoggedIn, readAvatar, readEmail } from '../../utils/session';
import { TKey, useI18n } from '../../i18n/LanguageContext';
import './SideNav.css';

interface Props {
  activeTab: 'tab1' | 'tab2' | 'tab3' | null;
  pathname: string;
}

const SECTIONS: { tab: string; href: string; label: TKey; hint: TKey; icon: string }[] = [
  { tab: 'tab1', href: '/tab1', label: 'nav.learn', hint: 'nav.learnHint', icon: bookOutline },
  { tab: 'tab2', href: '/tab2', label: 'nav.play', hint: 'nav.playHint', icon: gameControllerOutline },
  { tab: 'tab3', href: '/tab3', label: 'nav.assess', hint: 'nav.assessHint', icon: clipboardOutline },
];

/* Navegacion de escritorio: los mismos destinos que el tab bar mas las opciones del popover
   del header, siempre a la vista. Solo se pinta dentro del IonSplitPane (>= 768px); en
   mobile el menu queda cerrado y sin gesto para abrirlo. */
const SideNav: React.FC<Props> = ({ activeTab, pathname }) => {
  const router = useIonRouter();
  const { t } = useI18n();
  const isUserLogged = isLoggedIn();
  const email = readEmail();
  const avatar = readAvatar();

  /* Un <a> real para que funcionen el clic central y "abrir en otra pestana"; el clic normal
     navega con el router de Ionic y sin animacion, como cambiar de tab. */
  const link = (href: string, label: string, icon: string, active: boolean, extra = '', hint = '') => (
    <a
      key={href}
      href={href}
      className={`sidenav__link ${active ? 'sidenav__link--active' : ''} ${extra}`}
      aria-current={active ? 'page' : undefined}
      title={label}
      onClick={e => { e.preventDefault(); router.push(href, 'none'); }}
    >
      <IonIcon icon={icon} aria-hidden='true' />
      <span className='sidenav__text'>
        <span className='sidenav__label'>{label}</span>
        {hint && <span className='sidenav__hint'>{hint}</span>}
      </span>
    </a>
  );

  return (
    <IonMenu contentId='main' swipeGesture={false} className='sidenav'>
      <IonContent className='sidenav__content'>
        <nav className='sidenav__inner' aria-label={t('nav.main')}>
          <a href='/MainMenu' className='sidenav__logo' onClick={e => { e.preventDefault(); router.push('/MainMenu', 'none'); }}>
            <img src='/assets/sostek-logo.png' alt='SOSTEK' />
          </a>
          {/* Firma de la marca: los tres ejes que recorren toda la app. */}
          <div className='sidenav__axes' aria-hidden='true'>
            <span className='axis-ambiental' />
            <span className='axis-economico' />
            <span className='axis-social' />
          </div>

          <div className='sidenav__group'>
            {SECTIONS.map(s => link(s.href, t(s.label), s.icon, activeTab === s.tab, '', t(s.hint)))}
          </div>

          {isUserLogged && (
            <div className='sidenav__group sidenav__group--divided'>
              {link('/Favorites', t('nav.favorites'), heartOutline, pathname === '/Favorites')}
            </div>
          )}

          <div className='sidenav__account'>
            {isUserLogged ? (
              <>
                <a
                  href='/Profile'
                  className={`sidenav__user ${pathname === '/Profile' ? 'sidenav__link--active' : ''}`}
                  aria-current={pathname === '/Profile' ? 'page' : undefined}
                  title={t('nav.profile')}
                  onClick={e => { e.preventDefault(); router.push('/Profile', 'none'); }}
                >
                  {avatar.url
                    ? <img src={avatar.url} alt='' className='sidenav__avatar' style={{ objectPosition: `${avatar.pos.x}% ${avatar.pos.y}%` }} />
                    : <IonIcon icon={personCircleOutline} className='sidenav__avatar sidenav__avatar--icon' aria-hidden='true' />}
                  <span className='sidenav__user-text'>
                    <span className='sidenav__user-title'>{t('nav.profile')}</span>
                    {email && <span className='sidenav__user-email'>{email}</span>}
                  </span>
                </a>
                <button
                  className='sidenav__link sidenav__link--quiet'
                  title={t('nav.logout')}
                  onClick={() => { clearSession(); router.push('/', 'root', 'replace'); }}
                >
                  <IonIcon icon={logOutOutline} aria-hidden='true' />
                  <span className='sidenav__label'>{t('nav.logout')}</span>
                </button>
              </>
            ) : (
              link('/', t('nav.login'), logInOutline, false, 'sidenav__link--cta')
            )}
          </div>
        </nav>
      </IonContent>
    </IonMenu>
  );
};

export default SideNav;
