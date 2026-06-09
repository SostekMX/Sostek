import { IonButton, IonToast, IonAlert, IonContent, IonInput, IonItem, IonPage } from '@ionic/react';
import { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_URL } from '../../config';
import '../logIn/LogIn.css';

const ResetPassword: React.FC = () => {
    const location = useLocation();
    const tokenFromUrl = new URLSearchParams(location.search).get('token') ?? '';
    const [token, setToken] = useState<string>(tokenFromUrl);
    const [newPassword, setNewPassword] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const history = useHistory();

    async function resetPassword() {
        if (newPassword.length < 8) {
            setMessage('La contraseña debe tener al menos 8 caracteres');
            setSuccess(false);
            setShowAlert(true);
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post(`${BACKEND_URL}/user/reset-password`, {
                token,
                new_password: newPassword,
            });
            if (response.data.success) {
                setMessage('Contraseña actualizada. Ya puedes iniciar sesión.');
                setSuccess(true);
                setShowAlert(true);
            } else {
                setMessage(response.data.error);
                setSuccess(false);
                setShowAlert(true);
            }
        } catch (error: any) {
            setMessage(error.response?.data?.error ?? 'Error al cambiar la contraseña');
            setSuccess(false);
            setShowAlert(true);
        } finally {
            setLoading(false);
        }
    }

    return (
        <IonPage>
            <IonContent fullscreen>
                <div className='login-split'>
                    <div className='login-form-panel'>
                        <div className='login-form-inner'>
                            <img src="/assets/sostek-logo.png" className='login-logo-mobile' alt='Sostek' />
                            <div className='login-welcome'>
                                <span className='login-welcome__line' />
                                <span className='login-welcome__text'>NUEVA CONTRASE&Ntilde;A</span>
                                <span className='login-welcome__line' />
                            </div>
                            <h2 className='login-title'>Cambiar contrase&ntilde;a</h2>
                            <p className='login-subtitle'>Ingresa el c&oacute;digo que recibiste y tu nueva contrase&ntilde;a.</p>
                            <div className='login-fields'>
                                <div className='login-field'>
                                    <label className='login-field__label'>C&oacute;digo de recuperaci&oacute;n</label>
                                    <IonItem className='login-field__item' lines='none'>
                                        <IonInput
                                            type='text'
                                            placeholder='Código de recuperación'
                                            value={token}
                                            onIonChange={(e) => setToken(e.target.value as string)}
                                        />
                                    </IonItem>
                                </div>
                                <div className='login-field'>
                                    <label className='login-field__label'>Nueva contrase&ntilde;a</label>
                                    <IonItem className='login-field__item' lines='none'>
                                        <IonInput
                                            type='password'
                                            placeholder='Mínimo 8 caracteres'
                                            value={newPassword}
                                            onIonChange={(e) => setNewPassword(e.target.value as string)}
                                        />
                                    </IonItem>
                                </div>
                            </div>
                            <IonButton expand='block' color='primary' onClick={resetPassword} disabled={loading} className='login-btn-main'>
                                {loading ? 'Cambiando...' : 'Cambiar contraseña'}
                            </IonButton>
                            <IonButton expand='block' fill='clear' href='/' className='login-btn-secondary'>
                                Volver al inicio de sesi&oacute;n
                            </IonButton>
                        </div>
                    </div>
                </div>
                <IonToast
                    isOpen={showAlert && !success}
                    onDidDismiss={() => setShowAlert(false)}
                    message={message}
                    duration={3500}
                    color="danger"
                    position="bottom"
                />
                <IonAlert
                    isOpen={showAlert && success}
                    onDidDismiss={() => { setShowAlert(false); history.replace('/'); }}
                    cssClass="dark-alert"
                    header="Contrasena actualizada"
                    message="Ya puedes iniciar sesion con tu nueva contrasena."
                    buttons={[{ text: 'Iniciar sesion', handler: () => history.replace('/') }]}
                />
            </IonContent>
        </IonPage>
    );
};

export default ResetPassword;
