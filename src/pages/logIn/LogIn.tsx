import { IonToast } from '@ionic/react';
import { Button, Input } from 'glisse';
import { FormEvent, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { login } from '../../api/auth';
import { getProfile } from '../../api/user';
import Field from '../../components/ui/Field';
import { useI18n } from '../../i18n/LanguageContext';
import { clearSession, startSession } from '../../utils/session';
import AuthLayout from './AuthLayout';

const LogIn: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const history = useHistory();
    const { t, lang, apiError } = useI18n();

    // Entrar al login cierra la sesion completa; antes quedaba el token y se seguia mandando.
    useEffect(() => {
        clearSession();
    }, []);

    function loginUser(event: FormEvent) {
        event.preventDefault();
        login(email, password).then(function (data) {
            if (data.success) {
                startSession(email, data.token);
                fetchAvatar().finally(() => history.push('/tab1'));
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
        <AuthLayout
            headline={t('login.headline')}
            desc={t('login.desc')}
            extra={
                <a href={`https://sostek.tec.mx/${lang}`} target='_blank' rel='noopener noreferrer' className='auth__site'>
                    {t('login.visitSite')}
                </a>
            }
        >
            <h1 className='auth__title'>{t('login.title')}</h1>
            <p className='auth__sub'>{t('login.subtitle')}</p>

            <form className='form-stack' onSubmit={loginUser}>
                <Field id='login-email' label={t('auth.email')}>
                    <Input id='login-email' type='email' autoComplete='email' placeholder={t('auth.emailPh')} value={email} onValueChange={setEmail} />
                </Field>
                <Field id='login-password' label={t('auth.password')}>
                    <Input id='login-password' type='password' autoComplete='current-password' placeholder='••••••••' value={password} onValueChange={setPassword} />
                </Field>
                <Button type='submit' variant='filled' className='btn-lg btn-block'>{t('login.title')}</Button>
            </form>

            <div className='auth__links auth__links--split'>
                <a className='text-link' href='/ForgotPassword'>{t('login.forgot')}</a>
                <a className='text-link' href='/SignUp'>{t('login.noAccount')}</a>
            </div>

            <button type='button' className='auth__guest' onClick={() => history.push('/MainMenu')}>{t('login.guest')}</button>

            <IonToast
                isOpen={showAlert}
                onDidDismiss={() => setShowAlert(false)}
                message={apiError(message)}
                duration={3500}
                color='danger'
                position='bottom'
            />
        </AuthLayout>
    );
};

export default LogIn;
