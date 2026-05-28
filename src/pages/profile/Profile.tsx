import { IonContent, IonItem, IonRow, IonButton, IonLabel, IonInput, IonSelect, IonSelectOption, IonAlert } from '@ionic/react';
import { useEffect, useState } from 'react';
import axios from 'axios';

import './Profile.css'

const Profile: React.FC = () => {

    const [email, setEmail] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [surname, setSurname] = useState<string>('');
    const [birthDate, setBirthDate] = useState<string>('');
    const [occupation, setOccupation] = useState<string>('');
    const [gender, setGender] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [showAlert, setShowAlert] = useState<boolean>(false);

    useEffect(() => {
        setEmail(localStorage.getItem('user_email') ?? '');
    }, []);

    function editUser() {
        axios.post('http://localhost:8080/user/edit', {
            email,
            name,
            surname,
            birth_date: birthDate,
            occupation,
            gender,
        }).then(function (response) {
            setMessage(response.data.message);
            setShowAlert(true);
        }).catch(function (error) {
            console.log(error);
        });
    }

    return (
        <IonContent fullscreen class='bg-img'>
            <IonRow class='modify-form'>
                <h2>Modificar Perfil</h2>
            </IonRow>
            <IonRow class='space'></IonRow>
            <IonRow className='align-center'>
                <IonItem color='none' className='input-field'>
                    <IonLabel position='stacked'>Nombre</IonLabel>
                    <IonInput value={name} onIonChange={(e) => setName(e.target.value as string)} type='text' />
                </IonItem>
                <IonItem color='none' className='input-field'>
                    <IonLabel position='stacked'>Apellido</IonLabel>
                    <IonInput value={surname} onIonChange={(e) => setSurname(e.target.value as string)} type='text' />
                </IonItem>
                <IonItem color='none' className='input-field'>
                    <IonLabel position='stacked'>Fecha de nacimiento</IonLabel>
                    <IonInput value={birthDate} onIonChange={(e) => setBirthDate(e.target.value as string)} type='date' />
                </IonItem>
                <IonItem color='none' className='input-field'>
                    <IonLabel position='stacked'>Ocupación</IonLabel>
                    <IonInput value={occupation} onIonChange={(e) => setOccupation(e.target.value as string)} type='text' />
                </IonItem>
                <IonItem color='none' className='input-field'>
                    <IonLabel position='stacked'>Sexo</IonLabel>
                    <IonSelect value={gender} onIonChange={(e) => setGender(e.target.value as string)}>
                        <IonSelectOption value="masculino">Masculino</IonSelectOption>
                        <IonSelectOption value="femenino">Femenino</IonSelectOption>
                    </IonSelect>
                </IonItem>
                <IonAlert
                    isOpen={showAlert}
                    onDidDismiss={() => setShowAlert(false)}
                    header="Mensaje"
                    message={message}
                    buttons={['OK']}
                />
            </IonRow>
            <IonRow class='space'></IonRow>
            <IonRow className='align-center'>
                <IonButton color='light-green' onClick={editUser}>Guardar cambios</IonButton>
                <IonButton href="/MainMenu">Regresar</IonButton>
            </IonRow>
        </IonContent>
    );
};
  
  export default Profile;
  