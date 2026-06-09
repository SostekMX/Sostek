import React, { useContext, useEffect, useRef, useState } from 'react';
import './AppBarPopOver.css';
import { IonToolbar, IonButtons, IonButton, IonIcon, IonContent, IonItem, IonLabel, IonList, IonPopover, IonSearchbar } from '@ionic/react';
import { personCircle, settings, logOut, heart, menuOutline, search as iconSearch } from 'ionicons/icons';
import { useHistory, useLocation } from "react-router-dom";
import AppContext from '../../context/AppContext';

export const AppBarPopOver: React.FC = () => {
    const { current: popoverId } = useRef(`menu-${Math.random().toString(36).substr(2, 6)}`);
    const popoverRef = useRef<HTMLIonPopoverElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const searchbarRef = useRef<HTMLIonSearchbarElement>(null);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const { search, changeSearch, transparentToolbar } = useContext(AppContext);
    const history = useHistory();
    useLocation();

    const isUserLogged = localStorage.getItem('login') === 'true';
    const avatarUrl = localStorage.getItem('avatar') || '';
    const rawPos = localStorage.getItem('avatar_position');
    const avatarPos = rawPos ? JSON.parse(rawPos) : { x: 50, y: 50 };

    useEffect(() => {
        if (sessionStorage.getItem("search")) {
            changeSearch!(sessionStorage.getItem("search")!);
        }
    }, []);

    useEffect(() => {
        if (isSearching) {
            setTimeout(() => searchbarRef.current?.setFocus(), 80);
        }
    }, [isSearching]);

    function handleSearch(value: string) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            changeSearch!(value);
        }, 300);
    }

    function closeSearch() {
        setIsSearching(false);
        changeSearch!('');
    }

    function logOutUser() {
        localStorage.setItem("login", 'false');
        localStorage.removeItem("token");
        history.replace('/');
    }

    return <>
        <IonToolbar className={transparentToolbar ? 'appbar appbar--transparent' : 'appbar'}>

            <IonButtons slot='start'>
                {!isSearching && (
                    <a onClick={() => changeSearch!("")} href="/MainMenu" className="appbar__logo-btn">
                        <img src="/assets/sostek-logo.png" className="appbar__logo" alt="SOSTEK" />
                    </a>
                )}
            </IonButtons>

            <div slot="end" className="appbar__end">
                {isSearching ? (
                    <IonSearchbar
                        ref={searchbarRef}
                        className="appbar__searchbar"
                        animated={true}
                        onIonInput={(e) => handleSearch(e.target.value ?? '')}
                        onIonClear={closeSearch}
                        showClearButton="always"
                        value={search}
                        placeholder="Búsqueda..."
                    />
                ) : (
                    <IonButton fill="clear" onClick={() => setIsSearching(true)}>
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
                <IonPopover ref={popoverRef} trigger={popoverId} triggerAction="click">
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
                                <IonItem>
                                    <IonIcon icon={settings} color='secondary' /> &nbsp;
                                    <IonLabel>Ajustes</IonLabel>
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
