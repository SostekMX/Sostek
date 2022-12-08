import React, { useContext, useEffect, useState } from 'react';
import { IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonMenuButton, IonContent, IonHeader, IonMenu, IonPage, IonItem, IonLabel, IonList, IonPopover, IonSearchbar } from '@ionic/react';
import { personCircle, settings, logOut, heart, informationCircleOutline } from 'ionicons/icons';
import { search as iconSearch } from 'ionicons/icons' ;
import { NativeStorage } from '@ionic-native/native-storage';
import { useHistory } from "react-router-dom";
import { useLocalStorage } from '../hooks/useLocalStorage';
import AppContext from '../context/AppContext';
export const AppBarPopOver: React.FC = () => {
    const [isUserLogged, setIsUserLogged] = useState<boolean>(false);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    //const [searchContent, setSearchContent] = useLocalStorage("search", "");
    const {search, tutorial, changeSearch, toggleTutorial} = useContext(AppContext)
    const history = useHistory();

    useEffect(() => {
        // NativeStorage.getItem("login").then(
        //   data => setIsUserLogged(data)
        // )
        let isTrue  = sessionStorage.getItem("login") === 'true';
        setIsUserLogged(isTrue)
    }, [])

    function logOutUser(){
        sessionStorage.setItem("login", 'false');
        //NativeStorage.setItem("login", false);
        history.goBack();
    }
    function activateTutorial() {
        localStorage.setItem("tutorial", "true");
        toggleTutorial!(true);
    }
    
    return <>
        <IonToolbar color='primary' /* class="transparent" */>
        <a href="/MainMenu"><img src="/assets/sostek-logo.png" height="40px"/></a>
            <IonButtons slot="primary">
                {isSearching && 
                <IonButton>
                    <IonSearchbar color="primary" style={{"width":"50vw", "margin":"auto", }}
                 animated={true} 
                 onIonBlur= {() => {setIsSearching(false)}}
                 onIonFocus={ () => {setIsSearching(true)}}
                 onIonInput= { (e) => {changeSearch!(e.target.value!)}}
                 onIonClear={() => {changeSearch!("")}}
                 value={search}
                 placeholder="Búsqueda..."></IonSearchbar>
                </IonButton>
                }
                {!isSearching && <IonButton
                onClick={() => {setIsSearching(true)}}>
                    <IonIcon slot="icon-only" icon={iconSearch} />
                </IonButton>}
            </IonButtons>
            <IonButtons slot="primary">
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

export default AppBarPopOver;