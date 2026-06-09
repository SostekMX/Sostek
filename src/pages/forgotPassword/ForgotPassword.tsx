import { IonButton, IonToast, IonContent, IonInput, IonItem, IonPage } from '@ionic/react';
import { useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../../config';
import '../logIn/LogIn.css';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [isError, setIsError] = useState<boolean>(false);
    const [showToast, setShowToast] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [sent, setSent] = useState<boolean>(false);

    async function sendResetToken() {
        setLoading(true);
        try {
            const response = await axios.post(`${BACKEND_URL}/user/forgot-password`, { email });
            if (response.data.success) {
                setMessage(response.data.message);
                setIsError(false);
                setShowToast(true);
                setSent(true);
            } else {
                setMessage(response.data.error);
                setIsError(true);
                setShowToast(true);
            }
        } catch (error: any) {
            setMessage(error.response?.data?.error ?? 'Error al enviar la solicitud');
            setIsError(true);
            setShowToast(true);
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
                            <p className='login-subtitle'>
                                {sent
                                    ? 'Revisa tu bandeja de entrada y sigue el link que te enviamos.'
                                    : 'Ingresa tu correo y te enviaremos un link para restablecer tu contrase&#241;a.'}
                            </p>
                            {!sent && (
                                <>
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
                                        {loading ? 'Enviando...' : 'Enviar link de recuperaci&#243;n'}
                                    </IonButton>
                                </>
                            )}
                            <IonButton expand='block' fill='clear' href='/' className='login-btn-secondary'>
                                Volver al inicio de sesi&#243;n
                            </IonButton>
                        </div>
                    </div>
                </div>
                <IonToast
                    isOpen={showToast}
                    onDidDismiss={() => setShowToast(false)}
                    message={message}
                    duration={4000}
                    color={isError ? 'danger' : 'success'}
                    position="bottom"
                />
            </IonContent>
        </IonPage>
    );
};

export default ForgotPassword;
