import {
    IonContent,
    IonItem,
    IonInput,
    IonToast,
    IonPage,
    IonButton,
} from '@ionic/react';
import { useHistory } from "react-router-dom";
import '../../App.css';
import '../logIn/LogIn.css';
import './SignUp.css';
import useMediaQuery, { DESKTOP_QUERY } from '../../hooks/useMediaQuery';
import { useEffect, useRef, useState } from 'react';
import { signup } from '../../api/auth';
import { startSession } from '../../utils/session';
import { useI18n } from '../../i18n/LanguageContext';

const SignUp: React.FC = () => {
    const [email, setEmail] = useState<string | null>('');
    const [password, setPassword] = useState<string | null>('');
    const [name, setName] = useState<string | null>('');
    const [surname, setSurname] = useState<string | null>('');
    const [birthDate, setBirthDate] = useState<string | null>('');
    const [occupation, setOccupation] = useState<string | null>('');
    const [gender, setGender] = useState<string | null>('');
    const [message, setMessage] = useState<string>('');
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [genderOpen, setGenderOpen] = useState(false);
    const genderRef = useRef<HTMLDivElement>(null);
    const isDesktop = useMediaQuery(DESKTOP_QUERY);
    const history = useHistory();
    const { t, apiError } = useI18n();

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (genderRef.current && !genderRef.current.contains(e.target as Node)) {
                setGenderOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    function signUpUser() {
        if (!password || password.length < 8) {
            setMessage(t('errors.passwordMin'));
            setShowAlert(true);
            return;
        }
        signup({
            email, password, name, surname,
            birth_date: birthDate, occupation, gender
        }).then(function (data) {
            if (data.success) {
                startSession(email as string, data.token);
                history.push("/tab1");
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

    return (
        <IonPage>
            <IonContent fullscreen>
                {/* En mobile .signup-split es un div sin estilos; en escritorio pone la marca
                    a la izquierda y el formulario a la derecha. */}
                <div className='signup-split'>
                {/* Panel de marca: el mismo de LogIn, solo en escritorio. */}
                {isDesktop && (
                    <aside className='login-brand auth-brand'>
                        <img src="/assets/sostek-logo.png" className='login-brand__logo' alt='Sostek' />
                        <div className='login-brand__content'>
                            <p className='login-brand__headline'>{t('signup.headline')}</p>
                            <p className='login-brand__desc'>{t('signup.brandDesc')}</p>
                        </div>
                        <p className='login-brand__footer'>SOSTEK &copy; 2025</p>
                    </aside>
                )}
                <div className='signup-page'>

                    {/* Header */}
                    <div className='signup-header'>
                        <p className='signup-header__tag'>{t('signup.tag')}</p>
                        <h1 className='signup-header__title'>{t('signup.title')}</h1>
                        <p className='signup-header__subtitle'>
                            {t('signup.subtitle')}
                        </p>
                    </div>

                    {/* Tarjeta de formulario */}
                    <div className='signup-card'>
                        <div className='signup-card__header'>
                            <div className='signup-card__icon'>🌱</div>
                            <div>
                                <h2 className='signup-card__section-title'>{t('signup.sectionTitle')}</h2>
                                <p className='signup-card__section-desc'>{t('signup.sectionDesc')}</p>
                            </div>
                        </div>

                        <div className='signup-fields'>
                            <div className='signup-field'>
                                <label className='signup-field__label'>{t('form.name')}</label>
                                <IonItem className='signup-field__item' lines='none'>
                                    <IonInput
                                        type='text'
                                        placeholder={t('form.namePh')}
                                        value={name}
                                        onIonChange={(e) => setName(e.target.value as string)}
                                    />
                                </IonItem>
                            </div>
                            <div className='signup-field'>
                                <label className='signup-field__label'>{t('form.surname')}</label>
                                <IonItem className='signup-field__item' lines='none'>
                                    <IonInput
                                        type='text'
                                        placeholder={t('form.surnamePh')}
                                        value={surname}
                                        onIonChange={(e) => setSurname(e.target.value as string)}
                                    />
                                </IonItem>
                            </div>
                            <div className='signup-field signup-field--full'>
                                <label className='signup-field__label'>{t('auth.email')}</label>
                                <IonItem className='signup-field__item' lines='none'>
                                    <IonInput
                                        type='email'
                                        placeholder={t('auth.emailPh')}
                                        value={email}
                                        onIonChange={(e) => setEmail(e.target.value as string)}
                                    />
                                </IonItem>
                            </div>
                            <div className='signup-field signup-field--full'>
                                <label className='signup-field__label'>{t('auth.password')}</label>
                                <IonItem className='signup-field__item' lines='none'>
                                    <IonInput
                                        type='password'
                                        placeholder={t('auth.passwordPh')}
                                        value={password}
                                        onIonChange={(e) => setPassword(e.target.value as string)}
                                    />
                                </IonItem>
                            </div>
                            <div className='signup-field'>
                                <label className='signup-field__label'>{t('form.birth')}</label>
                                <IonItem className='signup-field__item' lines='none'>
                                    <IonInput
                                        type='date'
                                        value={birthDate}
                                        onIonChange={(e) => setBirthDate(e.target.value as string)}
                                    />
                                </IonItem>
                            </div>
                            <div className='signup-field'>
                                <label className='signup-field__label'>{t('form.occupation')}</label>
                                <IonItem className='signup-field__item' lines='none'>
                                    <IonInput
                                        type='text'
                                        placeholder={t('form.occupationPh')}
                                        value={occupation}
                                        onIonChange={(e) => setOccupation(e.target.value as string)}
                                    />
                                </IonItem>
                            </div>
                            <div className='signup-field' ref={genderRef}>
                                <label className='signup-field__label'>{t('form.sex')}</label>
                                <div className='signup-select-wrapper'>
                                    <button
                                        type='button'
                                        className={`signup-select-btn ${genderOpen ? 'open' : ''}`}
                                        onClick={() => setGenderOpen(o => !o)}
                                    >
                                        <span className={gender ? '' : 'placeholder'}>
                                            {gender === 'masculino' ? t('form.male') : gender === 'femenino' ? t('form.female') : t('form.select')}
                                        </span>
                                        <span className={`signup-select-chevron ${genderOpen ? 'open' : ''}`}>&#8964;</span>
                                    </button>
                                    <div className={`signup-select-dropdown ${genderOpen ? 'open' : ''}`}>
                                        <button type='button' onClick={() => { setGender('masculino'); setGenderOpen(false); }}>
                                            {t('form.male')}
                                        </button>
                                        <button type='button' onClick={() => { setGender('femenino'); setGenderOpen(false); }}>
                                            {t('form.female')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='signup-actions'>
                            <IonButton expand='block' color='primary' onClick={signUpUser} className='signup-btn-main'>
                                {t('signup.submit')}
                            </IonButton>
                            <IonButton expand='block' fill='clear' href='/' className='signup-btn-back'>
                                {t('signup.haveAccount')}
                            </IonButton>
                        </div>
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

export default SignUp;
