import { IonButton, IonAlert, IonContent, IonInput, IonItem, IonLabel, IonPage } from '@ionic/react';
import { useEffect, useState } from 'react';
import { useHistory } from "react-router-dom";
import axios from 'axios';
import '../../theme/variables.css';
import '../../App.css';
import './LogIn.css';

const LogIn: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string | null>('');
    const [message, setMessage] = useState<string>('');
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const history = useHistory();

    useEffect(() => {
        localStorage.setItem('login', 'false');
    }, [])

    function loginUser() {
        axios.post('http://localhost:8080/user/login', {
            email: email,
            password: password,
        }).then(function (response) {
            if (response.data.success) {
                localStorage.setItem('login', 'true');
                localStorage.setItem('user_email', email);
                history.push("/tab1");
            } else {
                setMessage(response.data.error);
                setShowAlert(true);
            }
        }).catch(function (error) {
            console.log(error);
        });
    }

    return (
        <IonPage>
            <IonContent fullscreen class='bg-img'>
                <div className='auth-overlay'>
                    <div className='auth-wrapper'>
                        <img src="/assets/sostek-logo.png" className='auth-logo' alt='Sostek' />
                        <div className='auth-card'>
                            <h2 className='auth-title'>Inicio de sesi&oacute;n</h2>
                            <IonItem className='auth-input-item' lines='none'>
                                <IonLabel position='stacked' className='auth-label'>Correo</IonLabel>
                                <IonInput
                                    type='email'
                                    value={email}
                                    onIonChange={(e) => setEmail(e.target.value as string)}
                                />
                            </IonItem>
                            <IonItem className='auth-input-item' lines='none'>
                                <IonLabel position='stacked' className='auth-label'>Contrase&ntilde;a</IonLabel>
                                <IonInput
                                    type='password'
                                    value={password}
                                    onIonChange={(e) => setPassword(e.target.value as string)}
                                />
                            </IonItem>
                            <div className='auth-actions'>
                                <IonButton expand='block' color='primary' onClick={loginUser}>
                                    Iniciar sesi&oacute;n
                                </IonButton>
                                <IonButton expand='block' fill='outline' color='primary' href='SignUp'>
                                    Registrarme
                                </IonButton>
                            </div>
                        </div>
                        <IonButton fill='clear' className='auth-guest-btn' href='MainMenu'>
                            Continuar como invitado
                        </IonButton>
                    </div>
                </div>
                <IonAlert
                    isOpen={showAlert}
                    onDidDismiss={() => setShowAlert(false)}
                    header="Error al iniciar sesi&oacute;n"
                    message={message}
                    buttons={['OK']}
                />
            </IonContent>
        </IonPage>
    );
};

export default LogIn;
