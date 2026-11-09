import React from 'react';
import { Glass, SegmentedControl } from 'glisse';
import { Lang, useI18n } from '../../i18n/LanguageContext';
import './LanguageToggle.css';

const ITEMS = [
  { value: 'es', label: 'ES' },
  { value: 'en', label: 'EN' },
];

/* Una sola instancia, hija de IonApp: se ve en todas las pantallas y ninguna la desmonta. */
const LanguageToggle: React.FC = () => {
  const { lang, setLang, t } = useI18n();
  return (
    <Glass className='lang-toggle'>
      <SegmentedControl
        aria-label={t('lang.label')}
        items={ITEMS}
        value={lang}
        onValueChange={value => setLang(value as Lang)}
      />
    </Glass>
  );
};

export default LanguageToggle;
