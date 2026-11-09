import { IonToast } from '@ionic/react';
import { Button, Input, SegmentedControl } from 'glisse';
import { FormEvent, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { signup } from '../../api/auth';
import Field from '../../components/ui/Field';
import PasswordInput from '../../components/ui/PasswordInput';
import { useI18n } from '../../i18n/LanguageContext';
import { startSession } from '../../utils/session';
import AuthLayout from '../logIn/AuthLayout';

const SignUp: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [occupation, setOccupation] = useState('');
    const [gender, setGender] = useState('');
    const [message, setMessage] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const history = useHistory();
    const { t, apiError } = useI18n();

    function signUpUser(event: FormEvent) {
        event.preventDefault();
        if (password.length < 8) {
            setMessage(t('errors.passwordMin'));
            setShowAlert(true);
            return;
        }
        signup({
            email, password, name, surname,
            birth_date: birthDate, occupation, gender,
        }).then(function (data) {
            if (data.success) {
                startSession(email, data.token);
                history.push('/tab1');
            } else {
                setMessage(data.error);
                setShowAlert(true);
            }
        }).catch(function (error) {
            // Sin esto un backend caido o el limite de intentos (429) no decia nada.
            console.error(error);
            setMessage(error.response?.data?.error ?? t('errors.noServer'));
            setShowAlert(true);
        });
    }

    return (
        <AuthLayout headline={t('signup.headline')} desc={t('signup.brandDesc')} wide>
            <h1 className='auth__title'>{t('signup.title')}</h1>
            <p className='auth__sub'>{t('signup.subtitle')}</p>

            <form className='form-stack' onSubmit={signUpUser}>
                <div className='auth__grid'>
                    <Field id='su-name' label={t('form.name')}>
                        <Input id='su-name' autoComplete='given-name' placeholder={t('form.namePh')} value={name} onValueChange={setName} />
                    </Field>
                    <Field id='su-surname' label={t('form.surname')}>
                        <Input id='su-surname' autoComplete='family-name' placeholder={t('form.surnamePh')} value={surname} onValueChange={setSurname} />
                    </Field>
                    <Field id='su-email' label={t('auth.email')} className='full'>
                        <Input id='su-email' type='email' autoComplete='email' placeholder={t('auth.emailPh')} value={email} onValueChange={setEmail} />
                    </Field>
                    <Field id='su-password' label={t('auth.password')} className='full'>
                        <PasswordInput id='su-password' autoComplete='new-password' placeholder={t('auth.passwordPh')} value={password} onValueChange={setPassword} />
                    </Field>
                    <Field id='su-birth' label={t('form.birth')}>
                        <Input id='su-birth' type='date' autoComplete='bday' value={birthDate} onValueChange={setBirthDate} />
                    </Field>
                    <Field id='su-occupation' label={t('form.occupation')}>
                        <Input id='su-occupation' placeholder={t('form.occupationPh')} value={occupation} onValueChange={setOccupation} />
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
                <Button type='submit' variant='filled' className='btn-lg btn-block'>{t('signup.submit')}</Button>
            </form>

            <div className='auth__links'>
                <a className='text-link' href='/'>{t('signup.haveAccount')}</a>
            </div>

            <IonToast
                isOpen={showAlert}
                onDidDismiss={() => setShowAlert(false)}
                message={apiError(message)}
                duration={3500}
                color='danger'
                position='bottom'
            />
        </AuthLayout>
    );
};

export default SignUp;
