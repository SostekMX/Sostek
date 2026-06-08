import React, { useContext, useEffect, useRef, useState } from 'react';
import './AppBarPopOver.css';
import { IonToolbar, IonButtons, IonButton, IonIcon, IonContent, IonItem, IonLabel, IonList, IonPopover, IonSearchbar } from '@ionic/react';
import { personCircle, settings, logOut, heart, menuOutline } from 'ionicons/icons';
import { search as iconSearch } from 'ionicons/icons';
import { useHistory, useLocation } from "react-router-dom";
import AppContext from '../../context/AppContext';

export const AppBarPopOver: React.FC = () => {
    // ID único por instancia: evita conflictos entre los AppBarPopOver de cada tab montados en el DOM
    const { current: popoverId } = useRef(`menu-${Math.random().toString(36).substr(2, 6)}`);
    const popoverRef = useRef<HTMLIonPopoverElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const { search, changeSearch, transparentToolbar } = useContext(AppContext);
    const history = useHistory();
    useLocation(); // provoca re-render al navegar, manteniendo isUserLogged actualizado

    // Leer directo en cada render para que siempre refleje el estado actual
    const isUserLogged = localStorage.getItem('login') === 'true';

    useEffect(() => {
        if (sessionStorage.getItem("search")) {
            changeSearch!(sessionStorage.getItem("search")!);
        }
    }, []);

    function handleSearch(value: string) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            changeSearch!(value);
        }, 300);
    }

    function logOutUser() {
        localStorage.setItem("login", 'false');
        localStorage.removeItem("token");
        history.replace('/');
    }


    return <>
        <IonToolbar className={transparentToolbar ? 'appbar appbar--transparent' : 'appbar'}>
            <IonButtons slot='start'>
                <a onClick={() => changeSearch!("")} href="/MainMenu" className="appbar__logo-btn">
                    <img src="/assets/sostek-logo.png" className="appbar__logo" alt="SOSTEK" />
                </a>
            </IonButtons>
            <IonButtons className={isSearching ? "appbar__searchbar-container appbar__searchbar-active" : "appbar__searchbar-container"} slot="end">
                {isSearching &&
                    <IonSearchbar
                        className="appbar__searchbar"
                        animated={true}
                        onIonBlur={() => setIsSearching(false)}
                        onIonFocus={() => setIsSearching(true)}
                        onIonInput={(e) => handleSearch(e.target.value ?? '')}
                        onIonClear={() => changeSearch!("")}
                        showClearButton="always"
                        value={search}
                        placeholder="Búsqueda..."
                    />
                }
                {!isSearching &&
                    <IonButton onClick={() => setIsSearching(true)}>
                        <IonIcon slot="icon-only" icon={iconSearch} />
                    </IonButton>
                }
            </IonButtons>
            <IonButtons slot="end">
                <IonButton id={popoverId}>
                    <IonIcon slot="icon-only" icon={menuOutline} />
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
            </IonButtons>
        </IonToolbar>
    </>;
};

export default AppBarPopOver;