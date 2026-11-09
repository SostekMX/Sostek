import React, { ComponentPropsWithoutRef, useState } from 'react';
import { IonIcon } from '@ionic/react';
import { Input } from 'glisse';
import { eyeOffOutline, eyeOutline } from 'ionicons/icons';
import { useI18n } from '../../i18n/LanguageContext';

const PasswordInput: React.FC<Omit<ComponentPropsWithoutRef<typeof Input>, 'type'>> = props => {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  return (
    <div className='password-input'>
      <Input {...props} type={visible ? 'text' : 'password'} />
      <button
        type='button'
        className='password-input__toggle'
        aria-label={t(visible ? 'auth.hidePassword' : 'auth.showPassword')}
        onClick={() => setVisible(current => !current)}
      >
        <IonIcon icon={visible ? eyeOffOutline : eyeOutline} aria-hidden='true' />
      </button>
    </div>
  );
};

export default PasswordInput;
