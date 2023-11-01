import { IonContent, IonItem, IonRow, IonButton, IonLabel, IonInput, IonSelect, IonSelectOption, IonAlert } from '@ionic/react';
import { useEffect, useState } from 'react';
import axios from 'axios';

import './Profile.css'



const Profile: React.FC = () => {

    const [email, setEmail] = useState< string | null>('');
    const [name, setName] = useState< string | null>('');
    const [surname, setSurname] = useState< string | null>('');
    const [message, setMessage] = useState<string>('');
    const [showAlert, setShowAlert] = useState<boolean>(false);

    useEffect(() => {
        //NativeStorage.getItem('user_email').then(
        // data => setEmail(data)
        //);
        let user_email = sessionStorage.getItem('user_email');
        setEmail(user_email);
    }, []) 

    function editUser() {
        axios.post('http://localhost:8080/user/edit', {
            email: email,
            name: name,
            surname: surname
        }).then(function (response) {
            setMessage(response.data.message)
            setShowAlert(true)
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
                    <IonLabel position='stacked' >Nombre</IonLabel> 
                    <IonInput  value={name} onIonChange={(e) => setName(e.target.value as string)} type='text'></IonInput>
                </IonItem>
                <IonItem color='none' className='input-field'>
                    <IonLabel position='stacked' >Apellido</IonLabel> 
                    <IonInput  value={surname} onIonChange={(e) => setSurname(e.target.value as string)} type='text' placeholder='[Apellido actual]'></IonInput>
                </IonItem>
                <IonItem color='none' className='input-field'>
                    <IonLabel position='stacked' >Año de nacimiento</IonLabel> 
                    <IonInput type='date'></IonInput>
                </IonItem>
                <IonItem color='none' className='input-field'>
                    <IonLabel position='stacked' >Ocupación</IonLabel> 
                    <IonInput type='text' placeholder='[Ocupación actual]'></IonInput>
                </IonItem>
                <IonItem color='none' className='input-field'>
                    <IonLabel position='stacked' >Sexo</IonLabel> 
                    <IonSelect>
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
              <IonButton href="MainMenu"> Regresar  </IonButton>
          </IonRow>
      </IonContent>
    );
  };
  
  export default Profile;
  