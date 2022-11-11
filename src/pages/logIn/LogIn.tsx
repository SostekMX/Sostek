import { IonButton, IonAlert, IonContent, IonInput, IonItem, IonLabel, IonRow } from '@ionic/react';
import { useState } from 'react';
import { useHistory } from "react-router-dom";
import  axios  from 'axios';


/* Theme variables */
import '../../theme/variables.css';
import '../../App.css';

import './LogIn.css'

const LogIn: React.FC = () => {

    const [email, setEmail] = useState<string | null>('');
    const [password, setPassword] = useState<string | null>('');
    const [message, setMessage] = useState<string>('');
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const history = useHistory();

    function loginUser() {
        axios.post('http://localhost:8080/user/login', {
            email: email,
            password: password,
        }).then(function (response) {
            if (response.data.success){
                history.push("/tab1");
            }else{
                setMessage(response.data.error)
                setShowAlert(true)
            }
        }).catch(function (error) {
            console.log(error);
        });
    }
    
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
                    <IonInput type='email'
                    value={email} onIonChange={(e) => setEmail(e.target.value as string)} ></IonInput>
                </IonItem>

                <IonItem color='none' className='input-field'>
                    <IonLabel position='stacked'  >Contraseña: </IonLabel> 
                    <IonInput type='password'
                        value={password} onIonChange={(e) => setPassword(e.target.value as string)}
                    ></IonInput>
                </IonItem>
            </IonRow>
            <IonRow class='space'></IonRow>
            <IonRow className='align-center'>
                
                <IonButton color='light-green' onClick={loginUser} >Iniciar sesión</IonButton>
                
                <IonButton color='greyish-blue' href='SignUp'>Registrarme</IonButton>
                
            </IonRow>
            <IonRow class='space'></IonRow>
            <IonRow className='align-center'>
                <IonButton color='secondary' href='MainMenu'>Continuar como invitado</IonButton>
            </IonRow>
            <br></br>
            <IonAlert
                isOpen={showAlert}
                onDidDismiss={() => setShowAlert(false)}
                header="Error al iniciar sesión"
                message={message}
                buttons={['OK']}
            />
           
            
        </IonContent>
    );

};

export default LogIn;
