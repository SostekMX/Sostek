import { IonButton, IonToast, IonContent, IonInput, IonItem, IonPage } from '@ionic/react';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import '../logIn/LogIn.css';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const history = useHistory();

    async function sendResetToken() {
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:8080/user/forgot-password', { email });
            if (response.data.success) {
                sessionStorage.setItem('reset_token', response.data.reset_token);
                history.push('/ResetPassword');
            } else {
                setMessage(response.data.error);
                setShowAlert(true);
            }
        } catch (error: any) {
            setMessage(error.response?.data?.error ?? 'Error al enviar la solicitud');
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
                                <span className='login-welcome__text'>RECUPERAR ACCESO</span>
                                <span className='login-welcome__line' />
                            </div>
                            <h2 className='login-title'>&#191;Olvidaste tu contrase&#241;a?</h2>
                            <p className='login-subtitle'>Ingresa tu correo y obtendr&#225;s un c&#243;digo para restablecer tu contrase&#241;a.</p>
                            <div className='login-fields'>
                                <div className='login-field'>
                                    <label className='login-field__label'>Correo electr&#243;nico</label>
                                    <IonItem className='login-field__item' lines='none'>
                                        <IonInput
                                            type='email'
                                            placeholder='usuario@ejemplo.com'
                                            value={email}
                                            onIonChange={(e) => setEmail(e.target.value as string)}
                                        />
                                    </IonItem>
                                </div>
                            </div>
                            <IonButton expand='block' color='primary' onClick={sendResetToken} disabled={loading} className='login-btn-main'>
                                {loading ? 'Enviando...' : 'Obtener c&#243;digo'}
                            </IonButton>
                            <IonButton expand='block' fill='clear' href='/' className='login-btn-secondary'>
                                Volver al inicio de sesi&#243;n
                            </IonButton>
                        </div>
                    </div>
                </div>
                <IonToast
                    isOpen={showAlert}
                    onDidDismiss={() => setShowAlert(false)}
                    message={message}
                    duration={3500}
                    color="danger"
                    position="bottom"
                />
            </IonContent>
        </IonPage>
    );
};

export default ForgotPassword;
