import { useState } from 'react';
import { IonIcon } from '@ionic/react';
import { Glass } from 'glisse';
import { chevronDownOutline } from 'ionicons/icons';
import { useI18n } from '../i18n/LanguageContext';
import './QuestionNav.css';

interface Props {
    total: number;
    answered: Set<number>;
    onJump: (index: number) => void;
    submit: React.ReactNode;
}

/* Navegador del cuestionario: una capsula de vidrio pegada arriba mientras las preguntas
 * pasan por debajo. Lleva el avance y un numero por pregunta, relleno cuando ya tiene al
 * menos una opcion marcada. Desde 1024 es la columna derecha, siempre abierta.
 */
const QuestionNav: React.FC<Props> = ({ total, answered, onJump, submit }) => {
    const { t } = useI18n();
    const [open, setOpen] = useState(false);
    const percent = total > 0 ? (answered.size / total) * 100 : 0;

    return (
        <Glass className={`qnav${open ? ' qnav--open' : ''}`}>
            <button type='button' className='qnav__toggle' aria-expanded={open} onClick={() => setOpen(o => !o)}>
                <span>{t('qnav.toggle', { a: answered.size, b: total })}</span>
                <IonIcon icon={chevronDownOutline} aria-hidden='true' />
            </button>

            <p className='qnav__count'>
                <strong>{answered.size}</strong> {t('qnav.answered', { b: total })}
            </p>

            <div className='qnav__bar'>
                <div className='qnav__fill' style={{ width: `${percent}%` }} />
            </div>

            <div className='qnav__panel'>
                <p className='qnav__title'>{t('qnav.title')}</p>
                <div className='qnav__grid'>
                    {Array.from({ length: total }, (_, i) => (
                        <button
                            key={i}
                            type='button'
                            className={`qnav__chip${answered.has(i) ? ' qnav__chip--done' : ''}`}
                            aria-label={t(answered.has(i) ? 'qnav.goDone' : 'qnav.goPending', { i: i + 1 })}
                            onClick={() => { onJump(i); setOpen(false); }}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
                <div className='qnav__submit'>{submit}</div>
            </div>
        </Glass>
    );
};

export default QuestionNav;
