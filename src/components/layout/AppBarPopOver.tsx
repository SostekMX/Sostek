import React, { useContext } from 'react';
import './AppBarPopOver.css';
import { IonIcon } from '@ionic/react';
import { Menu } from 'glisse';
import { heartOutline, logOutOutline, personCircleOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import AppContext from '../../context/AppContext';
import { clearSession, isLoggedIn, readAvatar } from '../../utils/session';
import { useI18n } from '../../i18n/LanguageContext';

/* Menu de cuenta (favoritos, perfil, salir) en el movil. Sin sesion no hay nada que ofrecer:
   la barra inferior ya lleva a iniciar sesion. */
export const AppMenu: React.FC = () => {
    const history = useHistory();
    const { t } = useI18n();
    if (!isLoggedIn()) return null;

    const { url, pos } = readAvatar();

    return (
        <Menu
            aria-label={t('nav.menu')}
            className='app-menu'
            icon={url
                ? <img src={url} alt='' className='app-menu__avatar' style={{ objectPosition: `${pos.x}% ${pos.y}%` }} />
                : undefined}
            items={[
                { label: t('nav.favorites'), icon: <IonIcon icon={heartOutline} aria-hidden='true' />, onSelect: () => history.push('/Favorites') },
                { label: t('nav.profile'), icon: <IonIcon icon={personCircleOutline} aria-hidden='true' />, onSelect: () => history.push('/Profile') },
                'separator',
                {
                    label: t('nav.logout'),
                    icon: <IonIcon icon={logOutOutline} aria-hidden='true' />,
                    destructive: true,
                    onSelect: () => { clearSession(); history.replace('/'); },
                },
            ]}
        />
    );
};

/* Encabezado del movil: logo a la izquierda y menu de cuenta junto al boton de idioma. En
   escritorio logo y menu viven en la barra lateral y esto se esconde por CSS. */
const AppBarPopOver: React.FC = () => {
    const { changeSearch } = useContext(AppContext);
    const { t } = useI18n();
    return (
        <header className='appbar'>
            <a onClick={() => changeSearch!('')} href='/MainMenu' className='appbar__logo' aria-label={t('appbar.home')}>
                <span className='logo' role='img' aria-label='SOSTEK' />
            </a>
            <div className='appbar__end'>
                <AppMenu />
            </div>
        </header>
    );
};

export default AppBarPopOver;
