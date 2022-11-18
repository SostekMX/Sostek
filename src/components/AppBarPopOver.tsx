import React, { useEffect, useState } from 'react';
import { IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonMenuButton, IonContent, IonHeader, IonMenu, IonPage, IonItem, IonLabel, IonList, IonPopover } from '@ionic/react';
import { personCircle, search, settings, logOut, heart } from 'ionicons/icons';
import { NativeStorage } from '@ionic-native/native-storage';
import { useHistory } from "react-router-dom";

export const AppBarPopOver: React.FC = () => {
    const [isUserLogged, setIsUserLogged] = useState<boolean>(false);
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
    
    return <>
        <IonToolbar color='primary' /* class="transparent" */>
        <a href="/MainMenu"><img src="/assets/sostek-logo.png" height="40px"/></a>
            <IonMenu contentId="main-content">
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>Menu Content</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent className="ion-padding">This is the menu content.</IonContent>
            </IonMenu>
            <IonButtons slot="primary">
                <IonButton>
                    <IonIcon slot="icon-only" icon={search} />
                </IonButton>
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