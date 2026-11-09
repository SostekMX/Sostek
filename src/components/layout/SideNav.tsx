import React, { useLayoutEffect, useRef, useState } from 'react';
import { IonContent, IonIcon, IonMenu, useIonRouter } from '@ionic/react';
import { Glass } from 'glisse';
import {
  bookOutline, layersOutline, clipboardOutline, heartOutline,
  personCircleOutline, logOutOutline, logInOutline,
} from 'ionicons/icons';
import { clearSession, isLoggedIn, readAvatar, readEmail } from '../../utils/session';
import { TKey, useI18n } from '../../i18n/LanguageContext';
import './SideNav.css';

interface Props {
  activeTab: string | null;
  pathname: string;
}

const SECTIONS: { tab: string; href: string; label: TKey; icon: string }[] = [
  { tab: 'tab1', href: '/tab1', label: 'nav.learn', icon: bookOutline },
  { tab: 'tab2', href: '/tab2', label: 'nav.play', icon: layersOutline },
  { tab: 'tab3', href: '/tab3', label: 'nav.assess', icon: clipboardOutline },
];

/* Navegacion de escritorio: una barra de vidrio que flota sobre el follaje. El lente marca
   la seccion actual y se desliza entre enlaces. Solo se pinta dentro del IonSplitPane
   (>= 768px); en movil el menu queda cerrado y sin gesto para abrirlo. */
const SideNav: React.FC<Props> = ({ activeTab, pathname }) => {
  const router = useIonRouter();
  const { t, lang } = useI18n();
  const isUserLogged = isLoggedIn();
  const email = readEmail();
  const avatar = readAvatar();
  const navRef = useRef<HTMLElement>(null);
  const [lens, setLens] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const measure = () => {
      const current = nav.querySelector('[aria-current="page"]');
      if (!current) return setLens(null);
      const box = nav.getBoundingClientRect();
      const rect = current.getBoundingClientRect();
      setLens({ top: rect.top - box.top, left: rect.left - box.left, width: rect.width, height: rect.height });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    return () => observer.disconnect();
  }, [activeTab, pathname, lang, isUserLogged]);

  /* Un <a> real para que funcionen el clic central y "abrir en otra pestana"; el clic normal
     navega con el router de Ionic y sin animacion, como cambiar de pestana. */
  const link = (href: string, label: string, icon: string, active: boolean, extra = '') => (
    <a
      key={href}
      href={href}
      className={`sidenav__link ${extra}`}
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
      <IonContent className='sidenav__content' scrollY={false}>
        <Glass className='sidenav__glass'>
          <nav className='sidenav__inner' aria-label={t('nav.main')} ref={navRef}>
            {lens && (
              <Glass
                className='sidenav__lens'
                aria-hidden='true'
                style={{ width: lens.width, height: lens.height, transform: `translate(${lens.left}px, ${lens.top}px)` }}
              />
            )}

            <a href='/MainMenu' className='sidenav__logo' onClick={e => { e.preventDefault(); router.push('/MainMenu', 'none'); }}>
              <span className='logo' role='img' aria-label='SOSTEK' />
            </a>

            <div className='sidenav__group'>
              {SECTIONS.map(s => link(s.href, t(s.label), s.icon, activeTab === s.tab))}
              {isUserLogged && link('/Favorites', t('nav.favorites'), heartOutline, pathname === '/Favorites')}
            </div>

            <div className='sidenav__account'>
              {isUserLogged ? (
                <>
                  <a
                    href='/Profile'
                    className='sidenav__link'
                    aria-current={pathname === '/Profile' ? 'page' : undefined}
                    title={email || t('nav.profile')}
                    onClick={e => { e.preventDefault(); router.push('/Profile', 'none'); }}
                  >
                    {avatar.url
                      ? <img src={avatar.url} alt='' className='sidenav__avatar' style={{ objectPosition: `${avatar.pos.x}% ${avatar.pos.y}%` }} />
                      : <IonIcon icon={personCircleOutline} aria-hidden='true' />}
                    <span className='sidenav__label'>{t('nav.profile')}</span>
                  </a>
                  <button
                    className='sidenav__link'
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
        </Glass>
      </IonContent>
    </IonMenu>
  );
};

export default SideNav;
