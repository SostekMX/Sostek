import React from 'react';
import { Button } from 'glisse';
import { useI18n } from '../../i18n/LanguageContext';

interface Props {
  title: string;
  text: string;
  retrying: boolean;
  onRetry: () => void;
}

const LoadError: React.FC<Props> = ({ title, text, retrying, onRetry }) => {
  const { t } = useI18n();

  return (
    <div className='load-error' role='alert'>
      <div className='load-error__copy'>
        <h2 className='load-error__title'>{title}</h2>
        <p className='load-error__text'>{text}</p>
      </div>
      <Button className='btn-line' disabled={retrying} onClick={onRetry}>
        {t(retrying ? 'load.retrying' : 'load.retry')}
      </Button>
    </div>
  );
};

export default LoadError;
