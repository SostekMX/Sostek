import React, { useState } from 'react';
import { IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonMenuButton, IonContent, IonHeader, IonMenu, IonPage, IonItem, IonLabel, IonList, IonPopover } from '@ionic/react';
import { personCircle, search, settings, logOut, heart } from 'ionicons/icons';
import { profile } from 'console';

export const AppBarPopOver: React.FC = () => {
    const [isUserLogged, setIsUserLogged] = useState<boolean>(false);
    return <>
        <IonToolbar color='primary' /* class="transparent" */>
        <a href="/MainMenu"><img src="/assets/sostek-logo.png" height="40px"/></a>z
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
                                <IonItem href='/Profile'>
                                        <IonIcon icon={personCircle} color='secondary'></IonIcon> &nbsp;
                                        {isUserLogged && <IonLabel>Perfil</IonLabel>}
                                        {!isUserLogged && <IonLabel
                                            onClick={(e) => { setIsUserLogged(true); } }>Iniciar Sesi&oacute;n</IonLabel>}
                                    </IonItem>
                            {isUserLogged && <IonItem>
                                <IonIcon icon={settings} color='secondary'></IonIcon> &nbsp;
                                 <IonLabel>Ajustes</IonLabel>
                            </IonItem>
                            }
                            {isUserLogged && <IonItem>
                                <IonIcon icon={logOut} color='secondary'></IonIcon> &nbsp;
                                <IonLabel
                                    onClick={(e) => {setIsUserLogged(false)}}>Log Out</IonLabel>
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