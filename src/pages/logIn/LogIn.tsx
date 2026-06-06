import { IonButton, IonAlert, IonContent, IonInput, IonItem, IonPage } from '@ionic/react';
import { useEffect, useState } from 'react';
import { useHistory } from "react-router-dom";
import axios from 'axios';
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
                localStorage.setItem('token', response.data.token);
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
            <IonContent fullscreen>
                <div className='login-split'>

                    {/* Panel izquierdo — solo desktop */}
                    <div className='login-brand'>
                        <img src="/assets/sostek-logo.png" className='login-brand__logo' alt='Sostek' />
                        <div className='login-brand__content'>
                            <p className='login-brand__tag'>Plataforma Educativa</p>
                            <h1 className='login-brand__headline'>
                                Aprende,<br />eval&uacute;a<br />y crece.
                            </h1>
                            <p className='login-brand__desc'>
                                Mide el nivel de sostenibilidad de tus proyectos acad&eacute;micos
                                y accede a contenido especializado.
                            </p>
                            <a
                                href='https://sostek.tec.mx/es'
                                target='_blank'
                                rel='noopener noreferrer'
                                className='login-brand__site-link'
                            >
                                🌿 Visitar sitio oficial de <u>SOSTEK</u>
                            </a>
                        </div>
                        <p className='login-brand__footer'>SOSTEK &copy; 2025</p>
                    </div>

                    {/* Panel derecho — formulario */}
                    <div className='login-form-panel'>
                        <div className='login-form-inner'>

                            {/* Logo — solo mobile */}
                            <img src="/assets/sostek-logo.png" className='login-logo-mobile' alt='Sostek' />

                            <div className='login-welcome'>
                                <span className='login-welcome__line' />
                                <span className='login-welcome__text'>BIENVENIDO</span>
                                <span className='login-welcome__line' />
                            </div>

                            <h2 className='login-title'>Iniciar sesi&oacute;n</h2>
                            <p className='login-subtitle'>Ingresa tus credenciales para continuar.</p>

                            <div className='login-fields'>
                                <div className='login-field'>
                                    <label className='login-field__label'>Correo electr&oacute;nico</label>
                                    <IonItem className='login-field__item' lines='none'>
                                        <IonInput
                                            type='email'
                                            placeholder='usuario@ejemplo.com'
                                            value={email}
                                            onIonChange={(e) => setEmail(e.target.value as string)}
                                        />
                                    </IonItem>
                                </div>
                                <div className='login-field'>
                                    <label className='login-field__label'>Contrase&ntilde;a</label>
                                    <IonItem className='login-field__item' lines='none'>
                                        <IonInput
                                            type='password'
                                            placeholder='••••••••'
                                            value={password}
                                            onIonChange={(e) => setPassword(e.target.value as string)}
                                        />
                                    </IonItem>
                                </div>
                            </div>

                            <IonButton expand='block' color='primary' onClick={loginUser} className='login-btn-main'>
                                Iniciar sesi&oacute;n
                            </IonButton>

                            <IonButton expand='block' fill='clear' href='/ForgotPassword' className='login-btn-secondary'>
                                &iquest;Olvidaste tu contrase&ntilde;a?
                            </IonButton>

                            <IonButton expand='block' fill='clear' href='SignUp' className='login-btn-secondary'>
                                &iquest;No tienes cuenta? Reg&iacute;strate
                            </IonButton>

                            <div className='login-divider'>
                                <span /><small>o</small><span />
                            </div>

                            <IonButton expand='block' fill='clear' href='MainMenu' className='login-btn-guest'>
                                Continuar como invitado
                            </IonButton>


                        </div>
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
