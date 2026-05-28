import React, { useContext, useEffect, useState } from 'react';
import { IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonMenuButton, IonContent, IonHeader, IonMenu, IonPage, IonItem, IonLabel, IonList, IonPopover, IonSearchbar } from '@ionic/react';
import { personCircle, settings, logOut, heart, informationCircleOutline } from 'ionicons/icons';
import { search as iconSearch } from 'ionicons/icons' ;
import { useHistory } from "react-router-dom";
import AppContext from '../../context/AppContext';
export const AppBarMenu: React.FC = () => {
    const [isUserLogged, setIsUserLogged] = useState<boolean>(false);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    //const [searchContent, setSearchContent] = useLocalStorage("search", "");
    const {search, tutorial, changeSearch, toggleTutorial, transparentToolbar } = useContext(AppContext);
    const history = useHistory();

    useEffect(() => {
        // NativeStorage.getItem("login").then(
        //   data => setIsUserLogged(data)
        // )
        let isTrue  = localStorage.getItem("login") === 'true';
        setIsUserLogged(isTrue)
    }, [])

    function logOutUser(){
        localStorage.setItem("login", 'false');
        //NativeStorage.setItem("login", false);
        history.goBack();
    }
    function activateTutorial() {
        localStorage.setItem("tutorial", "true");
        toggleTutorial!(true);
    }
    
    return <>
        <IonToolbar color='transparent'>
            <IonButtons slot='start'>
                 <a href="/MainMenu"><img src="/assets/sostek-logo.png" height="40px"/></a>
            </IonButtons>
            <IonButtons slot="end">
                <IonButtons slot="end">
                    <IonMenuButton id="open-menu" autoHide={false}></IonMenuButton>
                </IonButtons>
                <IonPopover trigger="open-menu" triggerAction="click">
                    <IonContent>
                        <IonList>
                        {isUserLogged &&
                            <IonItem>
                                    <IonIcon icon={heart} color='secondary'></IonIcon> &nbsp;
                                    <IonLabel>  Favoritos</IonLabel>
                                </IonItem>
                        } 
                        {isUserLogged &&
                            <IonItem  href='/Profile'>
                                    <IonIcon icon={personCircle} color='secondary'></IonIcon> &nbsp;
                                    <IonLabel>  Perfil</IonLabel>
                            </IonItem>
                        } 
                        {!isUserLogged &&
                            <IonItem  href='/'>
                                    <IonIcon icon={personCircle} color='secondary'></IonIcon> &nbsp;
                                    <IonLabel>Iniciar Sesi&oacute;n
                                    </IonLabel>
                            </IonItem>
                        } 
                            {isUserLogged && <IonItem>
                                <IonIcon icon={settings} color='secondary'></IonIcon> &nbsp;
                                 <IonLabel>Ajustes</IonLabel>
                            </IonItem>
                            }
                            <IonItem
                                onClick={activateTutorial}
                            >
                            <IonIcon icon={informationCircleOutline} color='secondary' /> &nbsp;
                                <IonLabel>Tutorial</IonLabel>
                            </IonItem>
                            {isUserLogged && <IonItem>
                                <IonIcon icon={logOut} color='secondary'></IonIcon> &nbsp;
                                <IonLabel
                                    onClick={logOutUser}>Log Out</IonLabel>
                            </IonItem>
                            }
                        </IonList>
                    </IonContent>
                </IonPopover>
            </IonButtons>
        </IonToolbar>
    </>;
    
};

export default AppBarMenu;