import { IonButton,  IonContent, IonInput, IonItem, IonLabel, IonRow } from '@ionic/react';



/* Theme variables */
import '../../theme/variables.css';
import '../../App.css';

import './LogIn.css'

const LogIn: React.FC = () => {
    return(
        <IonContent fullscreen class='bg-img'>
            <IonRow class='logo-display '>
                <img src="/assets/sostek-logo.png" height="100px"/>
            </IonRow>
            <IonRow class='login-form'>
                <h2 >Inicio de sesión</h2>
            </IonRow>
            <IonRow class='space'></IonRow>
            <IonRow className='align-center'>
                <IonItem color='none' className='input-field'>
                    <IonLabel position='stacked'  >Correo: </IonLabel> 
                    <IonInput type='email'></IonInput>
                </IonItem>

                <IonItem color='none' className='input-field'>
                    <IonLabel position='stacked' >Contraseña: </IonLabel> 
                    <IonInput type='password'></IonInput>
                </IonItem>
            </IonRow>
            <IonRow class='space'></IonRow>
            <IonRow className='align-center'>
                
                <IonButton color='light-green' href='MainMenu'>Iniciar sesión</IonButton>
                
                <IonButton color='greyish-blue' href='SignUp'>Registrarme</IonButton>
                
            </IonRow>
            <IonRow class='space'></IonRow>
            <IonRow className='align-center'>
                <IonButton color='secondary' href='MainMenu'>Continuar como invitado</IonButton>
            </IonRow>
           
            
        </IonContent>
    );

};

export default LogIn;
