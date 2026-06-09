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
    const [cropPos, setCropPos] = useState({ x: 50, y: 50 });
    const [cropMode, setCropMode] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [message, setMessage] = useState<string>('');
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, startCropX: 50, startCropY: 50 });
    const history = useHistory();

    useEffect(() => {
        setEmail(localStorage.getItem('user_email') ?? '');
        const savedPos = localStorage.getItem('avatar_position');
        if (savedPos) setCropPos(JSON.parse(savedPos));

        const token = localStorage.getItem('token');
        axios.get(`${BACKEND_URL}/user/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            if (res.data.success) {
                const u = res.data.user;
                setName(u.name ?? '');
                setSurname(u.surname ?? '');
                setBirthDate(u.birth_date ?? '');
                setOccupation(u.occupation ?? '');
                setGender(u.gender ?? '');
                const avatarUrl = u.avatar ?? '';
                setAvatar(avatarUrl);
                localStorage.setItem('avatar', avatarUrl);
            }
        }).catch(err => console.log(err));
    }, []);

    function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setCropPos({ x: 50, y: 50 });
        setCropMode(true);
    }

    function onCropPointerDown(e: React.PointerEvent<HTMLDivElement>) {
        e.currentTarget.setPointerCapture(e.pointerId);
        dragRef.current = {
            isDragging: true,
            startX: e.clientX,
            startY: e.clientY,
            startCropX: cropPos.x,
            startCropY: cropPos.y,
        };
    }

    function onCropPointerMove(e: React.PointerEvent<HTMLDivElement>) {
        if (!dragRef.current.isDragging) return;
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        const newX = Math.max(0, Math.min(100, dragRef.current.startCropX - dx * 0.4));
        const newY = Math.max(0, Math.min(100, dragRef.current.startCropY - dy * 0.4));
        setCropPos({ x: newX, y: newY });
    }

    function onCropPointerUp() {
        dragRef.current.isDragging = false;
    }

    async function handleUploadConfirm() {
        if (!selectedFile) return;
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('avatar', selectedFile);
        setAvatarUploading(true);
        try {
            const res = await axios.post(`${BACKEND_URL}/user/avatar`, formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                const url = res.data.avatar_url;
                setAvatar(url);
                localStorage.setItem('avatar', url);
                localStorage.setItem('avatar_position', JSON.stringify(cropPos));
            }
        } catch (err) {
            console.log(err);
        } finally {
            setAvatarUploading(false);
            setCropMode(false);
            URL.revokeObjectURL(previewUrl);
        }
    }

    function cancelCrop() {
        setCropMode(false);
        URL.revokeObjectURL(previewUrl);
        setSelectedFile(null);
    }

    function deleteUser() {
        const token = localStorage.getItem('token');
        axios.delete(`${BACKEND_URL}/user`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(() => {
            localStorage.clear();
            history.replace('/');
        }).catch(err => console.error(err));
    }

    function editUser() {
        const token = localStorage.getItem('token');
        axios.post(`${BACKEND_URL}/user/edit`, {
            email, name, surname,
            birth_date: birthDate, occupation, gender,
        }, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            if (res.data.success) {
                history.replace('/tab1');
            } else {
                setMessage(res.data.message);
                setShowAlert(true);
            }
        }).catch(err => console.log(err));
    }

    const avatarStyle = { objectPosition: `${cropPos.x}% ${cropPos.y}%` };

    return (
        <IonPage>
            <AppBarPopOver />

            {cropMode && (
                <div className='crop-overlay'>
                    <p className='crop-title'>Ajusta tu foto</p>
                    <div
                        className='crop-circle-preview'
                        onPointerDown={onCropPointerDown}
                        onPointerMove={onCropPointerMove}
                        onPointerUp={onCropPointerUp}
                        onPointerCancel={onCropPointerUp}
                    >
                        <img
                            src={previewUrl}
                            alt='preview'
                            className='crop-img'
                            style={{ objectPosition: `${cropPos.x}% ${cropPos.y}%` }}
                            draggable={false}
                        />
                    </div>
                    <p className='crop-hint'>Arrastra para ajustar la posicion</p>
                    <div className='crop-actions'>
                        <button
                            className='crop-btn crop-btn--confirm'
                            onClick={handleUploadConfirm}
                            disabled={avatarUploading}
                        >
                            {avatarUploading ? 'Subiendo...' : 'Subir foto'}
                        </button>
                        <button className='crop-btn crop-btn--cancel' onClick={cancelCrop}>
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            <IonContent fullscreen class='app-dark-bg'>
                <div className='profile-container'>
                    <div className='profile-avatar'>
                        {avatar
                            ? <img src={avatar} alt='avatar' className='profile-avatar__img' style={avatarStyle} />
                            : <IonIcon icon={personCircleOutline} className='profile-avatar__icon' />
                        }
                        <input
                            ref={fileInputRef}
                            type='file'
                            accept='image/jpeg,image/png,image/webp'
                            style={{ display: 'none' }}
                            onChange={handleFileSelect}
                        />
                        <button
                            className='profile-avatar__change-btn'
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <IonIcon icon={cameraOutline} />
                            Cambiar foto
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
