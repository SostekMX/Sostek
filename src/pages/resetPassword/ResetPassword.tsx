import { IonButton, IonToast, IonAlert, IonContent, IonInput, IonItem, IonPage } from '@ionic/react';
import { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { resetPassword as resetPasswordRequest } from '../../api/auth';
import '../logIn/LogIn.css';
import useMediaQuery, { DESKTOP_QUERY } from '../../hooks/useMediaQuery';
import { useI18n } from '../../i18n/LanguageContext';

const ResetPassword: React.FC = () => {
    const location = useLocation();
    const tokenFromUrl = new URLSearchParams(location.search).get('token') ?? '';
    const [token, setToken] = useState<string>(tokenFromUrl);
    const [newPassword, setNewPassword] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);
    const isDesktop = useMediaQuery(DESKTOP_QUERY);
    const [loading, setLoading] = useState<boolean>(false);
    const history = useHistory();
    const { t, apiError } = useI18n();

    async function resetPassword() {
        if (newPassword.length < 8) {
            setMessage(t('errors.passwordMin'));
            setSuccess(false);
            setShowAlert(true);
            return;
        }
        setLoading(true);
        try {
            const data = await resetPasswordRequest(token, newPassword);
            if (data.success) {
                setMessage(t('reset.done'));
                setSuccess(true);
                setShowAlert(true);
            } else {
                setMessage(data.error);
                setSuccess(false);
                setShowAlert(true);
            }
        } catch (error: any) {
            setMessage(error.response?.data?.error ?? t('errors.changeFail'));
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
                    {/* Panel de marca: el mismo de LogIn, solo en escritorio. */}
                    {isDesktop && (
                        <aside className='login-brand auth-brand'>
                            <img src="/assets/sostek-logo.png" className='login-brand__logo' alt='Sostek' />
                            <div className='login-brand__content'>
                                <p className='login-brand__headline'>{t('reset.headline')}</p>
                                <p className='login-brand__desc'>{t('reset.brandDesc')}</p>
                            </div>
                            <p className='login-brand__footer'>SOSTEK &copy; 2025</p>
                        </aside>
                    )}
                    <div className='login-form-panel'>
                        <div className='login-form-inner'>
                            <img src="/assets/sostek-logo.png" className='login-logo-mobile' alt='Sostek' />
                            <div className='login-welcome'>
                                <span className='login-welcome__line' />
                                <span className='login-welcome__text'>{t('reset.welcome')}</span>
                                <span className='login-welcome__line' />
                            </div>
                            <h2 className='login-title'>{t('reset.title')}</h2>
                            <p className='login-subtitle'>{t('reset.subtitle')}</p>
                            <div className='login-fields'>
                                <div className='login-field'>
                                    <label className='login-field__label'>{t('reset.code')}</label>
                                    <IonItem className='login-field__item' lines='none'>
                                        <IonInput
                                            type='text'
                                            placeholder={t('reset.code')}
                                            value={token}
                                            onIonChange={(e) => setToken(e.target.value as string)}
                                        />
                                    </IonItem>
                                </div>
                                <div className='login-field'>
                                    <label className='login-field__label'>{t('reset.newPassword')}</label>
                                    <IonItem className='login-field__item' lines='none'>
                                        <IonInput
                                            type='password'
                                            placeholder={t('auth.passwordPh')}
                                            value={newPassword}
                                            onIonChange={(e) => setNewPassword(e.target.value as string)}
                                        />
                                    </IonItem>
                                </div>
                            </div>
                            <IonButton expand='block' color='primary' onClick={resetPassword} disabled={loading} className='login-btn-main'>
                                {loading ? t('reset.changing') : t('reset.submit')}
                            </IonButton>
                            <IonButton expand='block' fill='clear' href='/' className='login-btn-secondary'>
                                {t('auth.backToLogin')}
                            </IonButton>
                        </div>
                    </div>
                </div>
                <IonToast
                    isOpen={showAlert && !success}
                    onDidDismiss={() => setShowAlert(false)}
                    message={apiError(message)}
                    duration={3500}
                    color="danger"
                    position="bottom"
                />
                <IonAlert
                    isOpen={showAlert && success}
                    onDidDismiss={() => { setShowAlert(false); history.replace('/'); }}
                    cssClass="dark-alert"
                    header={t('reset.doneHeader')}
                    message={t('reset.doneMsg')}
                    buttons={[{ text: t('nav.login'), handler: () => history.replace('/') }]}
                />
            </IonContent>
        </IonPage>
    );
};

export default ResetPassword;
