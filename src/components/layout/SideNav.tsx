import React from 'react';
import { IonContent, IonIcon, IonMenu, useIonRouter } from '@ionic/react';
import {
  bookOutline, gameControllerOutline, clipboardOutline, heartOutline,
  personCircleOutline, logOutOutline, logInOutline,
} from 'ionicons/icons';
import { clearSession, readAvatar } from '../../utils/session';
import './SideNav.css';

interface Props {
  activeTab: 'tab1' | 'tab2' | 'tab3' | null;
  pathname: string;
}

const SECTIONS = [
  { tab: 'tab1', href: '/tab1', label: 'Aprende', icon: bookOutline },
  { tab: 'tab2', href: '/tab2', label: 'Juega', icon: gameControllerOutline },
  { tab: 'tab3', href: '/tab3', label: 'Evalúate', icon: clipboardOutline },
] as const;

/* Navegacion de escritorio: los mismos destinos que el tab bar mas las opciones del popover
   del header, siempre a la vista. Solo se pinta dentro del IonSplitPane (>= 768px); en
   mobile el menu queda cerrado y sin gesto para abrirlo. */
const SideNav: React.FC<Props> = ({ activeTab, pathname }) => {
  const router = useIonRouter();
  const isUserLogged = sessionStorage.getItem('login') === 'true';
  const email = localStorage.getItem('user_email') || '';
  const avatar = readAvatar();

  /* Un <a> real para que funcionen el clic central y "abrir en otra pestana"; el clic normal
     navega con el router de Ionic y sin animacion, como cambiar de tab. */
  const link = (href: string, label: string, icon: string, active: boolean, extra = '') => (
    <a
      href={href}
      className={`sidenav__link ${active ? 'sidenav__link--active' : ''} ${extra}`}
      aria-current={active ? 'page' : undefined}
      title={label}
      onClick={e => { e.preventDefault(); router.push(href, 'none'); }}
    >
      <IonIcon icon={icon} aria-hidden='true' />
      <span className='sidenav__label'>{label}</span>
    </a>
  );

  return (
    <IonMenu contentId='main' swipeGesture={false} className='sidenav'>
      <IonContent className='sidenav__content'>
        <nav className='sidenav__inner' aria-label='Principal'>
          <a href='/MainMenu' className='sidenav__logo' onClick={e => { e.preventDefault(); router.push('/MainMenu', 'none'); }}>
            <img src='/assets/sostek-logo.png' alt='SOSTEK' />
          </a>

          <div className='sidenav__group'>
            {SECTIONS.map(s => link(s.href, s.label, s.icon, activeTab === s.tab))}
          </div>

          {isUserLogged && (
            <div className='sidenav__group sidenav__group--divided'>
              {link('/Favorites', 'Favoritos', heartOutline, pathname === '/Favorites')}
            </div>
          )}

          <div className='sidenav__account'>
            {isUserLogged ? (
              <>
                <a
                  href='/Profile'
                  className={`sidenav__user ${pathname === '/Profile' ? 'sidenav__link--active' : ''}`}
                  aria-current={pathname === '/Profile' ? 'page' : undefined}
                  title='Perfil'
                  onClick={e => { e.preventDefault(); router.push('/Profile', 'none'); }}
                >
                  {avatar.url
                    ? <img src={avatar.url} alt='' className='sidenav__avatar' style={{ objectPosition: `${avatar.pos.x}% ${avatar.pos.y}%` }} />
                    : <IonIcon icon={personCircleOutline} className='sidenav__avatar sidenav__avatar--icon' aria-hidden='true' />}
                  <span className='sidenav__user-text'>
                    <span className='sidenav__user-title'>Perfil</span>
                    {email && <span className='sidenav__user-email'>{email}</span>}
                  </span>
                </a>
                <button
                  className='sidenav__link sidenav__link--quiet'
                  title='Cerrar sesión'
                  onClick={() => { clearSession(); router.push('/', 'root', 'replace'); }}
                >
                  <IonIcon icon={logOutOutline} aria-hidden='true' />
                  <span className='sidenav__label'>Cerrar sesión</span>
                </button>
              </>
            ) : (
              link('/', 'Iniciar sesión', logInOutline, false, 'sidenav__link--cta')
            )}
          </div>
        </nav>
      </IonContent>
    </IonMenu>
  );
};

export default SideNav;
