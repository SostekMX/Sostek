import { IonButton, IonToast, IonContent, IonInput, IonItem, IonPage } from '@ionic/react';
import { useEffect, useState } from 'react';
import { useHistory } from "react-router-dom";
import { login } from '../../api/auth';
import { getProfile } from '../../api/user';
import { clearSession, startSession } from '../../utils/session';
import { useI18n } from '../../i18n/LanguageContext';
import '../../App.css';
import './LogIn.css';

const LogIn: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string | null>('');
    const [message, setMessage] = useState<string>('');
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const history = useHistory();
    const { t, lang, apiError } = useI18n();

    // Entrar al login cierra la sesion completa; antes quedaba el token y se seguia mandando.
    useEffect(() => {
        clearSession();
    }, [])

    function loginUser() {
        login(email, password ?? '').then(function (data) {
            if (data.success) {
                startSession(email, data.token);
                fetchAvatar().finally(() => history.push("/tab1"));
            } else {
                setMessage(data.error);
                setShowAlert(true);
            }
        }).catch(function (error) {
            // Sin esto un backend caido o el limite de intentos (429) no decia nada.
            console.error(error);
            setMessage(error.response?.data?.error ?? t('errors.noServer'));
            setShowAlert(true);
        });
    }

    // Trae la foto de perfil antes de navegar para que el header la muestre desde el primer render
    function fetchAvatar() {
        return getProfile().then(data => {
            if (data.success) {
                localStorage.setItem('avatar', data.user.avatar ?? '');
            }
        }).catch(err => console.error(err));
    }

    return (
        <IonPage>
            <IonContent fullscreen>
                <div className='login-split'>

                    {/* Panel izquierdo — solo desktop */}
                    <div className='login-brand'>
                        <img src="/assets/sostek-logo.png" className='login-brand__logo' alt='Sostek' />
                        <div className='login-brand__content'>
                            <p className='login-brand__tag'>{t('auth.platform')}</p>
                            <h1 className='login-brand__headline'>
                                {t('login.headline')}
                            </h1>
                            <p className='login-brand__desc'>
                                {t('login.desc')}
                            </p>
                            <a
                                href={`https://sostek.tec.mx/${lang}`}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='login-brand__site-link'
                            >
                                {t('login.visitSite')}
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
                                <span className='login-welcome__text'>{t('login.welcome')}</span>
                                <span className='login-welcome__line' />
                            </div>

                            <h2 className='login-title'>{t('login.title')}</h2>
                            <p className='login-subtitle'>{t('login.subtitle')}</p>

                            <div className='login-fields'>
                                <div className='login-field'>
                                    <label className='login-field__label'>{t('auth.email')}</label>
                                    <IonItem className='login-field__item' lines='none'>
                                        <IonInput
                                            type='email'
                                            placeholder={t('auth.emailPh')}
                                            value={email}
                                            onIonChange={(e) => setEmail(e.target.value as string)}
                                        />
                                    </IonItem>
                                </div>
                                <div className='login-field'>
                                    <label className='login-field__label'>{t('auth.password')}</label>
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
                                {t('login.title')}
                            </IonButton>

                            <IonButton expand='block' fill='clear' href='/ForgotPassword' className='login-btn-secondary'>
                                {t('login.forgot')}
                            </IonButton>

                            <IonButton expand='block' fill='clear' href='SignUp' className='login-btn-secondary'>
                                {t('login.noAccount')}
                            </IonButton>

                            <div className='login-divider'>
                                <span /><small>{t('login.or')}</small><span />
                            </div>

                            <IonButton expand='block' fill='clear' href='MainMenu' className='login-btn-guest'>
                                {t('login.guest')}
                            </IonButton>


                        </div>
                    </div>
                </div>

                <IonToast
                    isOpen={showAlert}
                    onDidDismiss={() => setShowAlert(false)}
                    message={apiError(message)}
                    duration={3500}
                    color="danger"
                    position="bottom"
                />
            </IonContent>
        </IonPage>
    );
};

export default LogIn;
