import {
    IonContent,
    IonItem,
    IonInput,
    IonAlert,
    IonPage,
    IonButton,
} from '@ionic/react';
import { useHistory } from "react-router-dom";
import '../../App.css';
import './SignUp.css';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

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
    const history = useHistory();

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
        if (!password || password.length < 6) {
            setMessage('La contraseña debe tener al menos 6 caracteres');
            setShowAlert(true);
            return;
        }
        axios.post('http://localhost:8080/user/signup', {
            email, password, name, surname,
            birth_date: birthDate, occupation, gender
        }).then(function (response) {
            if (response.data.success) {
                localStorage.setItem('login', 'true');
                localStorage.setItem('user_email', email as string);
                localStorage.setItem('token', response.data.token);
                history.push("/tab1");
            } else {
                setMessage(response.data.error);
                setShowAlert(true);
            }
        }).catch(function (error) {
            console.log(error);
        });
    }

    return (
        <IonPage>
            <IonContent fullscreen>
                <div className='signup-page'>

                    {/* Header */}
                    <div className='signup-header'>
                        <p className='signup-header__tag'>Formulario de registro</p>
                        <h1 className='signup-header__title'>Crea tu cuenta</h1>
                        <p className='signup-header__subtitle'>
                            Solo los datos esenciales. Podr&aacute;s completar tu perfil despu&eacute;s.
                        </p>
                    </div>

                    {/* Tarjeta de formulario */}
                    <div className='signup-card'>
                        <div className='signup-card__header'>
                            <div className='signup-card__icon'>🌱</div>
                            <div>
                                <h2 className='signup-card__section-title'>Informaci&oacute;n personal</h2>
                                <p className='signup-card__section-desc'>Ingresa tus datos para crear tu cuenta en SOSTEK.</p>
                            </div>
                        </div>

                        <div className='signup-fields'>
                            <div className='signup-field'>
                                <label className='signup-field__label'>Nombre</label>
                                <IonItem className='signup-field__item' lines='none'>
                                    <IonInput
                                        type='text'
                                        placeholder='Ej. Ana'
                                        value={name}
                                        onIonChange={(e) => setName(e.target.value as string)}
                                    />
                                </IonItem>
                            </div>
                            <div className='signup-field'>
                                <label className='signup-field__label'>Apellido</label>
                                <IonItem className='signup-field__item' lines='none'>
                                    <IonInput
                                        type='text'
                                        placeholder='Ej. Mart&iacute;nez'
                                        value={surname}
                                        onIonChange={(e) => setSurname(e.target.value as string)}
                                    />
                                </IonItem>
                            </div>
                            <div className='signup-field signup-field--full'>
                                <label className='signup-field__label'>Correo electr&oacute;nico</label>
                                <IonItem className='signup-field__item' lines='none'>
                                    <IonInput
                                        type='email'
                                        placeholder='usuario@ejemplo.com'
                                        value={email}
                                        onIonChange={(e) => setEmail(e.target.value as string)}
                                    />
                                </IonItem>
                            </div>
                            <div className='signup-field signup-field--full'>
                                <label className='signup-field__label'>Contrase&ntilde;a</label>
                                <IonItem className='signup-field__item' lines='none'>
                                    <IonInput
                                        type='password'
                                        placeholder='••••••••'
                                        value={password}
                                        onIonChange={(e) => setPassword(e.target.value as string)}
                                    />
                                </IonItem>
                            </div>
                            <div className='signup-field'>
                                <label className='signup-field__label'>Fecha de nacimiento</label>
                                <IonItem className='signup-field__item' lines='none'>
                                    <IonInput
                                        type='date'
                                        value={birthDate}
                                        onIonChange={(e) => setBirthDate(e.target.value as string)}
                                    />
                                </IonItem>
                            </div>
                            <div className='signup-field'>
                                <label className='signup-field__label'>Ocupaci&oacute;n</label>
                                <IonItem className='signup-field__item' lines='none'>
                                    <IonInput
                                        type='text'
                                        placeholder='Ej. Estudiante'
                                        value={occupation}
                                        onIonChange={(e) => setOccupation(e.target.value as string)}
                                    />
                                </IonItem>
                            </div>
                            <div className='signup-field' ref={genderRef}>
                                <label className='signup-field__label'>Sexo</label>
                                <div className='signup-select-wrapper'>
                                    <button
                                        type='button'
                                        className={`signup-select-btn ${genderOpen ? 'open' : ''}`}
                                        onClick={() => setGenderOpen(o => !o)}
                                    >
                                        <span className={gender ? '' : 'placeholder'}>
                                            {gender === 'masculino' ? 'Masculino' : gender === 'femenino' ? 'Femenino' : 'Selecciona'}
                                        </span>
                                        <span className={`signup-select-chevron ${genderOpen ? 'open' : ''}`}>&#8964;</span>
                                    </button>
                                    <div className={`signup-select-dropdown ${genderOpen ? 'open' : ''}`}>
                                        <button type='button' onClick={() => { setGender('masculino'); setGenderOpen(false); }}>
                                            Masculino
                                        </button>
                                        <button type='button' onClick={() => { setGender('femenino'); setGenderOpen(false); }}>
                                            Femenino
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='signup-actions'>
                            <IonButton expand='block' color='primary' onClick={signUpUser} className='signup-btn-main'>
                                Registrarme
                            </IonButton>
                            <IonButton expand='block' fill='clear' href='/' className='signup-btn-back'>
                                &iquest;Ya tienes cuenta? Inicia sesi&oacute;n
                            </IonButton>
                        </div>
                    </div>

                </div>
                <IonAlert
                    isOpen={showAlert}
                    onDidDismiss={() => setShowAlert(false)}
                    header="Error al crear usuario"
                    message={message}
                    buttons={['OK']}
                />
            </IonContent>
        </IonPage>
    );
};

export default SignUp;
