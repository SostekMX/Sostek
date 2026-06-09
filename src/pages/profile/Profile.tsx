import { IonContent, IonItem, IonPage, IonButton, IonLabel, IonInput, IonSelect, IonSelectOption, IonAlert, IonToast, IonIcon } from '@ionic/react';
import { personCircleOutline, cameraOutline } from 'ionicons/icons';
import { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router';
import axios from 'axios';
import { BACKEND_URL } from '../../config';
import AppBarPopOver from '../../components/layout/AppBarPopOver';
import './Profile.css';

const Profile: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [surname, setSurname] = useState<string>('');
    const [birthDate, setBirthDate] = useState<string>('');
    const [occupation, setOccupation] = useState<string>('');
    const [gender, setGender] = useState<string>('');
    const [avatar, setAvatar] = useState<string>('');
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [message, setMessage] = useState<string>('');
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const history = useHistory();

    useEffect(() => {
        setEmail(localStorage.getItem('user_email') ?? '');
        const token = localStorage.getItem('token');
        axios.get(`${BACKEND_URL}/user/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(function (response) {
            if (response.data.success) {
                const u = response.data.user;
                setName(u.name ?? '');
                setSurname(u.surname ?? '');
                setBirthDate(u.birth_date ?? '');
                setOccupation(u.occupation ?? '');
                setGender(u.gender ?? '');
                setAvatar(u.avatar ?? '');
            }
        }).catch(function (error) {
            console.log(error);
        });
    }, []);

    function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('avatar', file);
        setAvatarUploading(true);
        axios.post(`${BACKEND_URL}/user/avatar`, formData, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        }).then(res => {
            if (res.data.success) setAvatar(res.data.avatar_url);
        }).catch(err => console.log(err))
          .finally(() => setAvatarUploading(false));
    }

    function deleteUser() {
        const token = localStorage.getItem('token');
        axios.delete(`${BACKEND_URL}/user`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(() => {
            localStorage.clear();
            history.replace('/');
        }).catch((error) => {
            console.error('Error al eliminar cuenta:', error);
        });
    }

    function editUser() {
        const token = localStorage.getItem('token');
        axios.post(`${BACKEND_URL}/user/edit`, {
            email, name, surname,
            birth_date: birthDate, occupation, gender,
        }, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(function (response) {
            if (response.data.success) {
                history.replace('/tab1');
            } else {
                setMessage(response.data.message);
                setShowAlert(true);
            }
        }).catch(function (error) {
            console.log(error);
        });
    }

    return (
        <IonPage>
            <AppBarPopOver />
            <IonContent fullscreen class='app-dark-bg'>
                <div className='profile-container'>
                    <div className='profile-avatar'>
                        {avatar
                            ? <img src={avatar} alt='avatar' className='profile-avatar__img' />
                            : <IonIcon icon={personCircleOutline} className='profile-avatar__icon' />
                        }
                        <input
                            ref={fileInputRef}
                            type='file'
                            accept='image/jpeg,image/png,image/webp'
                            style={{ display: 'none' }}
                            onChange={handleAvatarChange}
                        />
                        <button
                            className='profile-avatar__change-btn'
                            onClick={() => fileInputRef.current?.click()}
                            disabled={avatarUploading}
                        >
                            <IonIcon icon={cameraOutline} />
                            {avatarUploading ? 'Subiendo...' : 'Cambiar foto'}
                        </button>
                    </div>
                    <div className='profile-card'>
                        <h2 className='profile-title'>Modificar Perfil</h2>
                        <IonItem className='profile-input-item' lines='none'>
                            <IonLabel position='stacked' className='profile-label'>Nombre</IonLabel>
                            <IonInput value={name} onIonChange={(e) => setName(e.target.value as string)} type='text' />
                        </IonItem>
                        <IonItem className='profile-input-item' lines='none'>
                            <IonLabel position='stacked' className='profile-label'>Apellido</IonLabel>
                            <IonInput value={surname} onIonChange={(e) => setSurname(e.target.value as string)} type='text' />
                        </IonItem>
                        <IonItem className='profile-input-item' lines='none'>
                            <IonLabel position='stacked' className='profile-label'>Fecha de nacimiento</IonLabel>
                            <IonInput value={birthDate} onIonChange={(e) => setBirthDate(e.target.value as string)} type='date' />
                        </IonItem>
                        <IonItem className='profile-input-item' lines='none'>
                            <IonLabel position='stacked' className='profile-label'>Ocupaci&oacute;n</IonLabel>
                            <IonInput value={occupation} onIonChange={(e) => setOccupation(e.target.value as string)} type='text' />
                        </IonItem>
                        <IonItem className='profile-input-item' lines='none'>
                            <IonLabel position='stacked' className='profile-label'>Sexo</IonLabel>
                            <IonSelect value={gender} onIonChange={(e) => setGender(e.target.value as string)} interface='popover'>
                                <IonSelectOption value="masculino">Masculino</IonSelectOption>
                                <IonSelectOption value="femenino">Femenino</IonSelectOption>
                            </IonSelect>
                        </IonItem>
                        <div className='profile-actions'>
                            <IonButton expand='block' color='primary' onClick={editUser}>
                                Guardar cambios
                            </IonButton>
                            <IonButton expand='block' fill='outline' color='primary' href="/MainMenu">
                                Regresar
                            </IonButton>
                            <IonButton expand='block' fill='clear' color='danger' onClick={() => setShowDeleteConfirm(true)}>
                                Eliminar cuenta
                            </IonButton>
                        </div>
                        <IonToast
                            isOpen={showAlert}
                            onDidDismiss={() => setShowAlert(false)}
                            message={message}
                            duration={3500}
                            color="danger"
                            position="bottom"
                        />
                        <IonAlert
                            isOpen={showDeleteConfirm}
                            onDidDismiss={() => setShowDeleteConfirm(false)}
                            cssClass="dark-alert"
                            header="Eliminar cuenta"
                            message="¿Estás seguro? Esta acción no se puede deshacer."
                            buttons={[
                                { text: 'Cancelar', role: 'cancel' },
                                { text: 'Eliminar', role: 'destructive', handler: deleteUser }
                            ]}
                        />
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Profile;
