import React from 'react';
import { IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonMenuButton, IonContent, IonHeader, IonMenu, IonPage, IonItem, IonLabel, IonList, IonPopover } from '@ionic/react';
import { personCircle, search, settings, logOut, heart } from 'ionicons/icons';
import { profile } from 'console';

export const AppBarPopOver: React.FC = () => (
    <>
        <IonToolbar color="light">
            <img src="/assets/sostek-logo.jpeg" width="80px" height="40px"/>
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
                    <IonMenuButton id="open-menu" autoHide={false} ></IonMenuButton>
                </IonButtons>
                <IonPopover trigger="open-menu" triggerAction="click">
                    <IonContent>
                        <IonList>
                            <IonItem>
                                <IonIcon icon={heart}></IonIcon> &nbsp;
                                <IonLabel>  Favoritos</IonLabel>
                            </IonItem>
                            <IonItem>
                                <IonIcon icon={personCircle}></IonIcon> &nbsp;
                                <IonLabel>Perfil</IonLabel>
                            </IonItem>
                            <IonItem>
                                <IonIcon icon={settings}></IonIcon> &nbsp;
                                <IonLabel>Ajustes</IonLabel>
                            </IonItem>
                            <IonItem>
                                <IonIcon icon={logOut}></IonIcon> &nbsp;
                                <IonLabel>Log Out</IonLabel>
                            </IonItem>
                        </IonList>
                    </IonContent>
                </IonPopover>
            </IonButtons>     
        </IonToolbar> 
       </>
    
);

export default AppBarPopOver;