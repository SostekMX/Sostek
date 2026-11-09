import { IonAlert, IonContent, IonIcon, IonPage, IonToast } from '@ionic/react';
import { Button, Input, SegmentedControl } from 'glisse';
import { cameraOutline } from 'ionicons/icons';
import { FormEvent, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent, ChangeEvent, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router';
import { deleteAccount, editProfile, getProfile, uploadAvatar } from '../../api/user';
import AppBarPopOver from '../../components/layout/AppBarPopOver';
import Field from '../../components/ui/Field';
import { useI18n } from '../../i18n/LanguageContext';
import { clearSession, readAvatar, readEmail } from '../../utils/session';
import './Profile.css';

const Profile: React.FC = () => {
    const { t, apiError } = useI18n();
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [occupation, setOccupation] = useState('');
    const [gender, setGender] = useState('');
    const [avatar, setAvatar] = useState('');
    const [cropPos, setCropPos] = useState({ x: 50, y: 50 });
    const [cropMode, setCropMode] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, startCropX: 50, startCropY: 50 });
    const history = useHistory();
    const email = readEmail();
    const fullName = [name, surname].filter(Boolean).join(' ');

    useEffect(() => {
        setCropPos(readAvatar().pos);

        getProfile().then(data => {
            if (data.success) {
                const u = data.user;
                setName(u.name ?? '');
                setSurname(u.surname ?? '');
                setBirthDate(u.birth_date ?? '');
                setOccupation(u.occupation ?? '');
                setGender(u.gender ?? '');
                const avatarUrl = u.avatar ?? '';
                setAvatar(avatarUrl);
                localStorage.setItem('avatar', avatarUrl);
            }
        }).catch(err => console.error(err));
    }, []);

    function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setCropPos({ x: 50, y: 50 });
        setCropMode(true);
    }

    function onCropPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
        e.currentTarget.setPointerCapture(e.pointerId);
        dragRef.current = {
            isDragging: true,
            startX: e.clientX,
            startY: e.clientY,
            startCropX: cropPos.x,
            startCropY: cropPos.y,
        };
    }

    function onCropPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
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
        const formData = new FormData();
        formData.append('avatar', selectedFile);
        setAvatarUploading(true);
        try {
            const data = await uploadAvatar(formData);
            if (data.success) {
                const url = data.avatar_url;
                setAvatar(url);
                localStorage.setItem('avatar', url);
                localStorage.setItem('avatar_position', JSON.stringify(cropPos));
            } else {
                // "La imagen no debe superar 5MB", "Formato no valido"...: antes se perdian.
                setMessage(data.error);
                setShowAlert(true);
            }
        } catch (err) {
            console.error(err);
            setMessage(t('errors.uploadFail'));
            setShowAlert(true);
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

    /* El recorte es un dialogo: Esc lo cierra, el foco entra al abrirlo y vuelve al botón
       que lo abrio al cerrarlo. */
    useEffect(() => {
        if (!cropMode) return;
        const previous = document.activeElement as HTMLElement | null;
        dialogRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !avatarUploading) cancelCrop(); };
        window.addEventListener('keydown', onKey);
        return () => {
            window.removeEventListener('keydown', onKey);
            previous?.focus();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cropMode]);

    function trapFocus(e: ReactKeyboardEvent<HTMLDivElement>) {
        if (e.key !== 'Tab') return;
        const buttons = Array.from(dialogRef.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? []);
        if (buttons.length === 0) return;
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }

    function deleteUser() {
        deleteAccount().then(() => {
            // clearSession() borra todo lo de la cuenta; la cache de contenido (articulos,
            // evaluaciones, instructivo) no es de nadie y se queda.
            clearSession();
            history.replace('/');
        }).catch(err => console.error(err));
    }

    function editUser(event: FormEvent) {
        event.preventDefault();
        editProfile({
            name, surname,
            birth_date: birthDate, occupation, gender,
        }).then(data => {
            if (data.success) {
                history.replace('/tab1');
            } else {
                // Los validadores responden con `error`; solo el fallo de la base usa `message`.
                setMessage(data.error ?? data.message);
                setShowAlert(true);
            }
        }).catch(err => console.error(err));
    }

    return (
        <IonPage>
            <AppBarPopOver />

            {cropMode && (
                <div className='crop-overlay'>
                    <div className='crop-dialog' role='dialog' aria-modal='true' aria-labelledby='crop-title' ref={dialogRef} onKeyDown={trapFocus}>
                        <h2 className='crop-title' id='crop-title'>{t('profile.cropTitle')}</h2>
                        <div
                            className='crop-circle'
                            onPointerDown={onCropPointerDown}
                            onPointerMove={onCropPointerMove}
                            onPointerUp={onCropPointerUp}
                            onPointerCancel={onCropPointerUp}
                        >
                            <img src={previewUrl} alt={t('profile.cropTitle')} style={{ objectPosition: `${cropPos.x}% ${cropPos.y}%` }} draggable={false} />
                        </div>
                        <p className='crop-hint'>{t('profile.cropHint')}</p>
                        <div className='crop-actions'>
                            <Button variant='filled' className='btn-lg' onClick={handleUploadConfirm} disabled={avatarUploading}>
                                {avatarUploading ? t('profile.uploading') : t('profile.upload')}
                            </Button>
                            <Button className='btn-lg btn-line' onClick={cancelCrop}>{t('common.cancel')}</Button>
                        </div>
                    </div>
                </div>
            )}

            <IonContent fullscreen>
                <div className='page profile'>
                    <header className='page-head'>
                        <h1 className='page-head__title'>{t('profile.title')}</h1>
                        <p className='page-head__lead'>{t('profile.text')}</p>
                    </header>

                    <div className='profile__layout'>
                        <section className='profile-id'>
                            {avatar
                                ? <img src={avatar} alt='' className='profile-id__avatar' style={{ objectPosition: `${cropPos.x}% ${cropPos.y}%` }} />
                                : <span className='profile-id__avatar profile-id__monogram' aria-hidden='true'>{(fullName || email || 'S').charAt(0)}</span>}
                            <div className='profile-id__text'>
                                <p className='profile-id__name'>{fullName || t('profile.noName')}</p>
                                {email && <p className='profile-id__line'>{email}</p>}
                                {occupation && <p className='profile-id__line'>{occupation}</p>}
                            </div>
                            <input
                                ref={fileInputRef}
                                type='file'
                                accept='image/jpeg,image/png,image/webp'
                                style={{ display: 'none' }}
                                onChange={handleFileSelect}
                            />
                            <Button icon={<IonIcon icon={cameraOutline} aria-hidden='true' />} onClick={() => fileInputRef.current?.click()}>
                                {t('profile.changePhoto')}
                            </Button>
                        </section>

                        <div className='profile__main'>
                            <form className='profile-card form-stack' onSubmit={editUser}>
                                <h2 className='section-title'>{t('profile.dataTitle')}</h2>
                                <div className='profile-grid'>
                                    <Field id='pf-name' label={t('form.name')}>
                                        <Input id='pf-name' autoComplete='given-name' value={name} onValueChange={setName} />
                                    </Field>
                                    <Field id='pf-surname' label={t('form.surname')}>
                                        <Input id='pf-surname' autoComplete='family-name' value={surname} onValueChange={setSurname} />
                                    </Field>
                                    <Field id='pf-birth' label={t('form.birth')}>
                                        <Input id='pf-birth' type='date' value={birthDate} onValueChange={setBirthDate} />
                                    </Field>
                                    <Field id='pf-occupation' label={t('form.occupation')}>
                                        <Input id='pf-occupation' value={occupation} onValueChange={setOccupation} />
                                    </Field>
                                    <Field label={t('form.sex')} className='full segmented-wide'>
                                        <SegmentedControl
                                            aria-label={t('form.sex')}
                                            items={[
                                                { value: 'masculino', label: t('form.male') },
                                                { value: 'femenino', label: t('form.female') },
                                            ]}
                                            value={gender || null}
                                            onValueChange={setGender}
                                        />
                                    </Field>
                                </div>
                                <div>
                                    <Button type='submit' variant='filled' className='btn-lg'>{t('profile.save')}</Button>
                                </div>
                            </form>

                            <section className='profile-danger' aria-labelledby='profile-danger-title'>
                                <div>
                                    <h2 className='profile-danger__title' id='profile-danger-title'>{t('profile.delete')}</h2>
                                    <p className='profile-danger__text'>{t('profile.dangerText')}</p>
                                </div>
                                <Button destructive className='btn-line' onClick={() => setShowDeleteConfirm(true)}>{t('profile.delete')}</Button>
                            </section>
                        </div>
                    </div>
                </div>

                <IonToast
                    isOpen={showAlert}
                    onDidDismiss={() => setShowAlert(false)}
                    message={apiError(message)}
                    duration={3500}
                    color='danger'
                    position='bottom'
                />
                <IonAlert
                    isOpen={showDeleteConfirm}
                    onDidDismiss={() => setShowDeleteConfirm(false)}
                    cssClass='sos-alert'
                    header={t('profile.delete')}
                    message={t('profile.deleteConfirm')}
                    buttons={[
                        { text: t('common.cancel'), role: 'cancel' },
                        { text: t('common.delete'), role: 'destructive', handler: deleteUser },
                    ]}
                />
            </IonContent>
        </IonPage>
    );
};

export default Profile;
