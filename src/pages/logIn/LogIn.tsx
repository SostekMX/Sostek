import { IonButton, IonAlert, IonContent, IonInput, IonItem, IonLabel, IonRow, IonPage } from '@ionic/react';
import { useEffect, useState } from 'react';
import { useHistory } from "react-router-dom";
import { NativeStorage } from '@ionic-native/native-storage';
import  axios  from 'axios';


/* Theme variables */
import '../../theme/variables.css';
import '../../App.css';

import './LogIn.css'

const LogIn: React.FC = () => {

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string | null>('');
    const [message, setMessage] = useState<string>('');
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const history = useHistory();

    useEffect(() => {
        //NativeStorage.setItem('login', false);
        sessionStorage.setItem('login', 'false');
    }, [])


    function loginUser() {
        axios.post('http://localhost:8080/user/login', {
            email: email,
            password: password,
        }).then(function (response) {
            if (response.data.success){
                //NativeStorage.setItem('login', true);
                //NativeStorage.setItem('user_email', email);
                sessionStorage.setItem('login', 'true');
                sessionStorage.setItem('user_email', email);
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
        <IonPage>
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
        </IonPage>
    );

};

export default LogIn;
