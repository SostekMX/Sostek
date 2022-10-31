import { IonContent, IonItem, IonRow, IonButton, IonLabel, IonInput, IonSelect, IonSelectOption } from '@ionic/react';

import './Profile.css'

const Profile: React.FC = () => {
    return (
      <IonContent fullscreen class='bg-img'>
        <IonRow class='modify-form'>
                <h2>Modificar Perfil</h2>
            </IonRow>
            <IonRow class='space'></IonRow>
            <IonRow className='align-center'>
                <IonItem color='none' className='input-field'>
                    <IonLabel position='stacked' >Nombre</IonLabel> 
                    <IonInput type='text' placeholder='[Nombre actual]'></IonInput>
                </IonItem>
                <IonItem color='none' className='input-field'>
                    <IonLabel position='stacked' >Apellido</IonLabel> 
                    <IonInput type='text' placeholder='[Apellido actual]'></IonInput>
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
          </IonRow>
          <IonRow class='space'></IonRow>
          <IonRow className='align-center'>
              <IonButton color='light-green' href='MainMenu'>Guardar cambios</IonButton>
          </IonRow>
      </IonContent>
    );
  };
  
  export default Profile;
  