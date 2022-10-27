import { IonContent, IonRow} from '@ionic/react';

import './Profile.css'

const Profile: React.FC = () => {
    return (
      <IonContent fullscreen class='bg-img'>
        <IonRow class= 'align-center'>
            <h2> Modificar perfil </h2>
        </IonRow>
      </IonContent>
    );
  };
  
  export default Profile;
  