import { IonToast } from '@ionic/react';
import { Button, Input } from 'glisse';
import { FormEvent, useState } from 'react';
import { forgotPassword } from '../../api/auth';
import Field from '../../components/ui/Field';
import { useI18n } from '../../i18n/LanguageContext';
import AuthLayout from '../logIn/AuthLayout';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const { t, lang, apiError } = useI18n();

    async function sendResetToken(event: FormEvent) {
        event.preventDefault();
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
        <AuthLayout headline={t('forgot.headline')} desc={t('forgot.brandDesc')}>
            <h1 className='auth__title'>{t('forgot.title')}</h1>
            <p className='auth__sub'>{sent ? t('forgot.sent') : t('forgot.prompt')}</p>

            {!sent && (
                <form className='form-stack' onSubmit={sendResetToken}>
                    <Field id='forgot-email' label={t('auth.email')}>
                        <Input id='forgot-email' type='email' autoComplete='email' placeholder={t('auth.emailPh')} value={email} onValueChange={setEmail} />
                    </Field>
                    <Button type='submit' variant='filled' className='btn-lg btn-block' disabled={loading}>
                        {loading ? t('forgot.sending') : t('forgot.submit')}
                    </Button>
                </form>
            )}

            <div className='auth__links'>
                <a className='text-link' href='/'>{t('auth.backToLogin')}</a>
            </div>

            <IonToast
                isOpen={showToast}
                onDidDismiss={() => setShowToast(false)}
                message={apiError(message)}
                duration={4000}
                color={isError ? 'danger' : 'success'}
                position='bottom'
            />
        </AuthLayout>
    );
};

export default ForgotPassword;
