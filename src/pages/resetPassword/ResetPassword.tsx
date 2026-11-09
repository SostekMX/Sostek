import { IonAlert, IonToast } from '@ionic/react';
import { Button, Input } from 'glisse';
import { FormEvent, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { resetPassword as resetPasswordRequest } from '../../api/auth';
import Field from '../../components/ui/Field';
import PasswordInput from '../../components/ui/PasswordInput';
import { useI18n } from '../../i18n/LanguageContext';
import AuthLayout from '../logIn/AuthLayout';

const ResetPassword: React.FC = () => {
    const location = useLocation();
    const tokenFromUrl = new URLSearchParams(location.search).get('token') ?? '';
    const [token, setToken] = useState(tokenFromUrl);
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const history = useHistory();
    const { t, apiError } = useI18n();

    async function resetPassword(event: FormEvent) {
        event.preventDefault();
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
        <AuthLayout headline={t('reset.headline')} desc={t('reset.brandDesc')}>
            <h1 className='auth__title'>{t('reset.title')}</h1>
            <p className='auth__sub'>{t('reset.subtitle')}</p>

            <form className='form-stack' onSubmit={resetPassword}>
                <Field id='reset-token' label={t('reset.code')}>
                    <Input id='reset-token' autoComplete='one-time-code' placeholder={t('reset.code')} value={token} onValueChange={setToken} />
                </Field>
                <Field id='reset-password' label={t('reset.newPassword')}>
                    <PasswordInput id='reset-password' autoComplete='new-password' placeholder={t('auth.passwordPh')} value={newPassword} onValueChange={setNewPassword} />
                </Field>
                <Button type='submit' variant='filled' className='btn-lg btn-block' disabled={loading}>
                    {loading ? t('reset.changing') : t('reset.submit')}
                </Button>
            </form>

            <div className='auth__links'>
                <a className='text-link' href='/'>{t('auth.backToLogin')}</a>
            </div>

            <IonToast
                isOpen={showAlert && !success}
                onDidDismiss={() => setShowAlert(false)}
                message={apiError(message)}
                duration={3500}
                color='danger'
                position='bottom'
            />
            <IonAlert
                isOpen={showAlert && success}
                onDidDismiss={() => { setShowAlert(false); history.replace('/'); }}
                cssClass='sos-alert'
                header={t('reset.doneHeader')}
                message={t('reset.doneMsg')}
                buttons={[{ text: t('nav.login'), handler: () => history.replace('/') }]}
            />
        </AuthLayout>
    );
};

export default ResetPassword;
