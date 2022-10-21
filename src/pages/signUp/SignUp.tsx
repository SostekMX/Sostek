
import {

  IonContent,
  IonItem,
  IonInput,
  IonLabel,

  setupIonicReact,
  IonRow,
  IonButton
} from '@ionic/react';


/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import '../../theme/variables.css';
import '../../App.css';



//import { useState } from 'react';

setupIonicReact();



const SignUp: React.FC = () => {
    return(
        <IonContent fullscreen class='bg-img'>
            <IonRow class='align-center'>
                <img src="/assets/sostek-logo.png" height="50px"/>
            </IonRow>
           
            <IonRow className='align-center'>
                <h2>Registro</h2>
            </IonRow>
            <IonRow class='space'></IonRow>
            <IonRow className='align-center'>
                <IonItem color='none' className='input-field'>
                    <IonLabel position='stacked'  >Nombre: </IonLabel> 
                    <IonInput type='text'></IonInput>
                </IonItem>
                <IonItem color='none' className='input-field'>
                    <IonLabel position='stacked'  >Correo: </IonLabel> 
                    <IonInput type='email'></IonInput>
                </IonItem>
                <IonItem color='none' className='input-field'>
                    <IonLabel position='stacked'  >Contraseña: </IonLabel> 
                    <IonInput type='password'></IonInput>
                </IonItem>
            </IonRow>
            <IonRow class='space'></IonRow>
            <IonRow className='align-center'>
                <IonButton color='greyish-blue' href=''>Registrarme</IonButton>
            </IonRow>
        </IonContent>
    );
};

export default SignUp;
