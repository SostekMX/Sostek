import {
    IonContent,
    IonItem,
    IonInput,
    IonLabel,
    IonAlert,
    IonPage,
    IonButton,
    IonSelect,
    IonSelectOption
} from '@ionic/react';
import { useHistory } from "react-router-dom";
import '../../theme/variables.css';
import '../../App.css';
import './SignUp.css';
import { useState } from 'react';
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
    const history = useHistory();

    function signUpUser() {
        axios.post('http://localhost:8080/user/signup', {
            email, password, name, surname,
            birth_date: birthDate, occupation, gender
        }).then(function (response) {
            if (response.data.success) {
                history.push("/");
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
            <IonContent fullscreen class='bg-img'>
                <div className='auth-overlay'>
                    <div className='auth-wrapper'>
                        <img src="/assets/sostek-logo.png" className='auth-logo' alt='Sostek' />
                        <div className='auth-card'>
                            <h2 className='auth-title'>Registro</h2>
                            <IonItem className='auth-input-item' lines='none'>
                                <IonLabel position='stacked' className='auth-label'>Nombre</IonLabel>
                                <IonInput type='text' value={name} onIonChange={(e) => setName(e.target.value as string)} />
                            </IonItem>
                            <IonItem className='auth-input-item' lines='none'>
                                <IonLabel position='stacked' className='auth-label'>Apellido</IonLabel>
                                <IonInput type='text' value={surname} onIonChange={(e) => setSurname(e.target.value as string)} />
                            </IonItem>
                            <IonItem className='auth-input-item' lines='none'>
                                <IonLabel position='stacked' className='auth-label'>Correo</IonLabel>
                                <IonInput type='email' value={email} onIonChange={(e) => setEmail(e.target.value as string)} />
                            </IonItem>
                            <IonItem className='auth-input-item' lines='none'>
                                <IonLabel position='stacked' className='auth-label'>Contrase&ntilde;a</IonLabel>
                                <IonInput type='password' value={password} onIonChange={(e) => setPassword(e.target.value as string)} />
                            </IonItem>
                            <IonItem className='auth-input-item' lines='none'>
                                <IonLabel position='stacked' className='auth-label'>Fecha de nacimiento</IonLabel>
                                <IonInput value={birthDate} onIonChange={(e) => setBirthDate(e.target.value as string)} type='date' />
                            </IonItem>
                            <IonItem className='auth-input-item' lines='none'>
                                <IonLabel position='stacked' className='auth-label'>Ocupaci&oacute;n</IonLabel>
                                <IonInput value={occupation} onIonChange={(e) => setOccupation(e.target.value as string)} type='text' />
                            </IonItem>
                            <IonItem className='auth-input-item' lines='none'>
                                <IonLabel position='stacked' className='auth-label'>Sexo</IonLabel>
                                <IonSelect value={gender} onIonChange={(e) => setGender(e.target.value as string)} interface='popover'>
                                    <IonSelectOption value="masculino">Masculino</IonSelectOption>
                                    <IonSelectOption value="femenino">Femenino</IonSelectOption>
                                </IonSelect>
                            </IonItem>
                            <div className='auth-actions'>
                                <IonButton expand='block' color='primary' onClick={signUpUser}>
                                    Registrarme
                                </IonButton>
                                <IonButton expand='block' fill='outline' color='primary' href='/'>
                                    Regresar
                                </IonButton>
                            </div>
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
