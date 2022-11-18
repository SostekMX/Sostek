import {
  IonContent,
  IonItem,
  IonInput,
  IonLabel,
  IonAlert,
  setupIonicReact,
  IonRow,
  IonButton,
  IonSelect,
  IonSelectOption
} from '@ionic/react';

import { useHistory } from "react-router-dom";


/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import '../../theme/variables.css';
import '../../App.css';

import { useState } from 'react';
import axios from 'axios';

setupIonicReact();

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
            email: email,
            password: password,
            name: name,
            surname: surname,
            birth_date: birthDate,
            occupation: occupation,
            gender: gender
        }).then(function (response) {
            if(response.data.success){
                history.push("/");
            }else{ 
                setMessage(response.data.error)
                setShowAlert(true)
            }
        }).catch(function (error) {
            console.log(error);
        });
    }


    return(
        <IonContent fullscreen class='bg-img'>
            <IonRow class='align-center'>
                <img src="/assets/sostek-logo.png" height="50px"/>
            </IonRow>
           
            <IonRow className='align-center'>
                <h2>Registro</h2>
            </IonRow>
            <IonRow class='space'></IonRow>
            <IonRow className='align-center'>
                <IonItem color='none' className='input-field'>
                    <IonLabel position='stacked'>Nombre: </IonLabel> 
                    <IonInput type='text'
                    value={name} onIonChange={(e) => setName(e.target.value as string)}></IonInput>
                </IonItem>
                <IonItem color='none' className='input-field'>
                    <IonLabel position='stacked'  >Apellido: </IonLabel> 
                    <IonInput type='text'
                    value={surname} onIonChange={(e) => setSurname(e.target.value as string)}></IonInput>
                </IonItem>
                <IonItem color='none' className='input-field'>
                    <IonLabel position='stacked'  >Correo: </IonLabel> 
                    <IonInput type='email'
                    value={email} onIonChange={(e) => setEmail(e.target.value as string)} ></IonInput>
                </IonItem>
                <IonItem color='none' className='input-field'>
                    <IonLabel position='stacked'  >Contraseña: </IonLabel> 
                    <IonInput type='password'
                        value={password} onIonChange={(e) => setPassword(e.target.value as string)}
                    ></IonInput>
                </IonItem>
                <IonItem color='none' className='input-field'>
                    <IonLabel position='stacked' >Año de nacimiento</IonLabel> 
                    <IonInput value={birthDate} onIonChange={(e) => setBirthDate(e.target.value as string)} type='date'></IonInput>
                </IonItem>
                <IonItem color='none' className='input-field'>
                    <IonLabel position='stacked' >Ocupación</IonLabel> 
                    <IonInput value={occupation} onIonChange={(e) => setOccupation(e.target.value as string)} type='text' placeholder='[Ocupación actual]'></IonInput>
                </IonItem>
                <IonItem color='none' className='input-field'>
                    <IonLabel position='stacked' >Sexo</IonLabel> 
                    <IonSelect value={gender} onIonChange={(e) => setGender(e.target.value as string)}>
                      <IonSelectOption value="masculino">Masculino</IonSelectOption>
                      <IonSelectOption value="femenino">Femenino</IonSelectOption>
                    </IonSelect>
                </IonItem>
            </IonRow>
            <IonRow class='space'></IonRow>
            <IonRow className='align-center'>
                <IonButton color='greyish-blue' onClick={signUpUser}>Registrarme</IonButton>
                <IonButton href="/"> Regresar  </IonButton>
            </IonRow>
            <IonAlert
                isOpen={showAlert}
                onDidDismiss={() => setShowAlert(false)}
                header="Error al crear usuario"
                message={message}
                buttons={['OK']}
            />
        </IonContent>
    );
};

export default SignUp;
