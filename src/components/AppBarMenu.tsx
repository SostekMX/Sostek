import React from 'react';
import { IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonMenuButton, IonContent, IonHeader, IonMenu, IonPage, IonItem, IonLabel, IonList, IonImg } from '@ionic/react';
import { personCircle, search, settings, logOut, heart } from 'ionicons/icons';
import { profile } from 'console';

export const AppBarMenu: React.FC = () => (
    <>
        <IonToolbar>
            <IonImg src="/assets/sostek-logo.jpeg">
            </IonImg>
            <IonButtons slot="primary">
                <IonButton>
                    <IonIcon slot="icon-only" icon={search} />
                </IonButton>
            </IonButtons>
            <IonButtons slot="primary">
                <IonButtons slot="end">
                    <IonMenuButton autoHide={false} ></IonMenuButton>
                </IonButtons>
            </IonButtons>
        </IonToolbar> 
        <IonMenu contentId="main-content">
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
        </IonMenu>``
        </>
    
);

export default AppBarMenu;