import { IonButton, IonToast, IonContent, IonInput, IonItem, IonPage } from '@ionic/react';
import { useState } from 'react';
import { forgotPassword } from '../../api/auth';
import '../logIn/LogIn.css';
import useMediaQuery, { DESKTOP_QUERY } from '../../hooks/useMediaQuery';
import { useI18n } from '../../i18n/LanguageContext';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [isError, setIsError] = useState<boolean>(false);
    const [showToast, setShowToast] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [sent, setSent] = useState<boolean>(false);
    const isDesktop = useMediaQuery(DESKTOP_QUERY);
    const { t, lang, apiError } = useI18n();

    async function sendResetToken() {
        setLoading(true);
        try {
            const data = await forgotPassword(email, lang);
            if (data.success) {
                setMessage(data.message);
                setIsError(false);
                setShowToast(true);
                setSent(true);
            } else {
                setMessage(data.error);
                setIsError(true);
                setShowToast(true);
            }
        } catch (error: any) {
            setMessage(error.response?.data?.error ?? t('errors.sendFail'));
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
                    {/* Panel de marca: el mismo de LogIn, solo en escritorio. */}
                    {isDesktop && (
                        <aside className='login-brand auth-brand'>
                            <img src="/assets/sostek-logo.png" className='login-brand__logo' alt='Sostek' />
                            <div className='login-brand__content'>
                                <p className='login-brand__headline'>{t('forgot.headline')}</p>
                                <p className='login-brand__desc'>{t('forgot.brandDesc')}</p>
                            </div>
                            <p className='login-brand__footer'>SOSTEK &copy; 2025</p>
                        </aside>
                    )}
                    <div className='login-form-panel'>
                        <div className='login-form-inner'>
                            <img src="/assets/sostek-logo.png" className='login-logo-mobile' alt='Sostek' />
                            <div className='login-welcome'>
                                <span className='login-welcome__line' />
                                <span className='login-welcome__text'>{t('forgot.welcome')}</span>
                                <span className='login-welcome__line' />
                            </div>
                            <h2 className='login-title'>{t('forgot.title')}</h2>
                            <p className='login-subtitle'>
                                {sent
                                    ? t('forgot.sent')
                                    : t('forgot.prompt')}
                            </p>
                            {!sent && (
                                <>
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
                                    </div>
                                    <IonButton expand='block' color='primary' onClick={sendResetToken} disabled={loading} className='login-btn-main'>
                                        {loading ? t('forgot.sending') : t('forgot.submit')}
                                    </IonButton>
                                </>
                            )}
                            <IonButton expand='block' fill='clear' href='/' className='login-btn-secondary'>
                                {t('auth.backToLogin')}
                            </IonButton>
                        </div>
                    </div>
                </div>
                <IonToast
                    isOpen={showToast}
                    onDidDismiss={() => setShowToast(false)}
                    message={apiError(message)}
                    duration={4000}
                    color={isError ? 'danger' : 'success'}
                    position="bottom"
                />
            </IonContent>
        </IonPage>
    );
};

export default ForgotPassword;
