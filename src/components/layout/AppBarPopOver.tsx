import React, { useContext, useEffect, useRef, useState } from 'react';
import './AppBarPopOver.css';
import { IonToolbar, IonButtons, IonButton, IonIcon, IonContent, IonItem, IonLabel, IonList, IonPopover, IonSearchbar } from '@ionic/react';
import { personCircle, logOut, heart, menuOutline, search as iconSearch } from 'ionicons/icons';
import { useHistory, useLocation } from "react-router-dom";
import AppContext from '../../context/AppContext';
import { clearSession, readAvatar } from '../../utils/session';
import useMediaQuery, { DESKTOP_QUERY } from '../../hooks/useMediaQuery';

const AppBarPopOver: React.FC = () => {
    const { current: popoverId } = useRef(`menu-${Math.random().toString(36).substr(2, 6)}`);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const searchbarRef = useRef<HTMLIonSearchbarElement>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const { search, changeSearch } = useContext(AppContext);
    const history = useHistory();
    const location = useLocation();

    const isDesktop = useMediaQuery(DESKTOP_QUERY);
    const showSearch = location.pathname === '/tab1' || location.pathname === '/MainMenu';
    // En escritorio el buscador de APRENDE esta siempre abierto: hay lugar y ahorra un clic.
    const searchOpen = isSearching || isDesktop;
    const isUserLogged = sessionStorage.getItem('login') === 'true';
    const { url: avatarUrl, pos: avatarPos } = readAvatar();

    useEffect(() => {
        if (sessionStorage.getItem("search")) {
            changeSearch!(sessionStorage.getItem("search")!);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Al navegar, abre el buscador solo si ya hay un término activo guardado
    useEffect(() => {
        const hasSearch = !!sessionStorage.getItem('search');
        setIsSearching(showSearch && hasSearch);
        setIsClosing(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

    useEffect(() => {
        if (isSearching) {
            setTimeout(() => searchbarRef.current?.setFocus(), 80);
        }
    }, [isSearching]);

    function handleSearch(value: string) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => changeSearch!(value), 300);
    }

    function openSearch() {
        setIsClosing(false);
        setIsSearching(true);
    }

    function closeSearch() {
        if (isClosing || isDesktop) return;
        setIsClosing(true);
        setTimeout(() => {
            setIsSearching(false);
            setIsClosing(false);
        }, 180);
    }

    function logOutUser() {
        clearSession();
        history.replace('/');
    }

    return <>
        {/* appbar--bare: en escritorio, fuera de APRENDE, la barra no tiene nada que mostrar
            (logo y menu viven en la barra lateral) y se esconde por CSS. */}
        <IonToolbar className={`appbar${showSearch ? '' : ' appbar--bare'}`}>

            {/* Logo — siempre visible */}
            <IonButtons slot='start'>
                <a onClick={() => changeSearch!("")} href="/MainMenu" className="appbar__logo-btn">
                    <img src="/assets/sostek-logo.png" className="appbar__logo" alt="SOSTEK" />
                </a>
            </IonButtons>

            {/* Searchbar en slot central — ocupa solo el espacio disponible entre logo y botones */}
            {showSearch && searchOpen && (
                <IonSearchbar
                    ref={searchbarRef}
                    className={`appbar__searchbar${isClosing ? ' appbar__searchbar--out' : ''}`}
                    onIonInput={(e) => handleSearch(e.target.value ?? '')}
                    onIonClear={() => { changeSearch!(''); closeSearch(); }}
                    onIonBlur={() => setTimeout(closeSearch, 120)}
                    showClearButton="always"
                    value={search}
                    placeholder={isDesktop ? 'Buscar artículos, temas…' : 'Búsqueda...'}
                />
            )}

            {/* Botones derecha — lupa + menú/avatar siempre juntos */}
            <div slot="end" className="appbar__end">
                {showSearch && !searchOpen && (
                    <IonButton fill="clear" onClick={openSearch}>
                        <IonIcon slot="icon-only" icon={iconSearch} />
                    </IonButton>
                )}

                <IonButton fill="clear" id={popoverId} className='appbar__menu-btn'>
                    {isUserLogged && avatarUrl
                        ? <img
                            src={avatarUrl}
                            alt='perfil'
                            className='appbar__avatar'
                            style={{ objectPosition: `${avatarPos.x}% ${avatarPos.y}%` }}
                          />
                        : <IonIcon slot="icon-only" icon={isUserLogged ? personCircle : menuOutline} />
                    }
                </IonButton>

                <IonPopover trigger={popoverId} triggerAction="click">
                    <IonContent>
                        <IonList>
                            {isUserLogged &&
                                <IonItem href='/Favorites'>
                                    <IonIcon icon={heart} color='secondary' /> &nbsp;
                                    <IonLabel>Favoritos</IonLabel>
                                </IonItem>
                            }
                            {isUserLogged &&
                                <IonItem href='/Profile'>
                                    <IonIcon icon={personCircle} color='secondary' /> &nbsp;
                                    <IonLabel>Perfil</IonLabel>
                                </IonItem>
                            }
                            {!isUserLogged &&
                                <IonItem href='/'>
                                    <IonIcon icon={personCircle} color='secondary' /> &nbsp;
                                    <IonLabel>Iniciar Sesión</IonLabel>
                                </IonItem>
                            }
                            {isUserLogged &&
                                <IonItem onClick={logOutUser}>
                                    <IonIcon icon={logOut} color='secondary' /> &nbsp;
                                    <IonLabel>Log Out</IonLabel>
                                </IonItem>
                            }
                        </IonList>
                    </IonContent>
                </IonPopover>
            </div>

        </IonToolbar>
    </>;
};

export default AppBarPopOver;
