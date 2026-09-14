import { useState } from 'react';
import './QuestionNav.css';

interface Props {
    total: number;
    answered: Set<number>;
    onJump: (index: number) => void;
    submit: React.ReactNode;
}

/* Navegador del cuestionario: un chip por pregunta, relleno cuando ya tiene al menos una
 * opcion marcada. En desktop se queda fijo a la derecha; en mobile se pliega detras del
 * boton, que ademas hace de resumen del avance para que plegado siga diciendo algo.
 */
const QuestionNav: React.FC<Props> = ({ total, answered, onJump, submit }) => {
    const [open, setOpen] = useState(false);

    return (
        <aside className={`qnav ${open ? 'qnav--open' : ''}`}>
            <button
                type='button'
                className='qnav__toggle'
                aria-expanded={open}
                onClick={() => setOpen(o => !o)}
            >
                Preguntas &middot; {answered.size} de {total}
            </button>

            <div className='qnav__panel'>
                <p className='qnav__title'>Preguntas</p>
                <div className='qnav__grid'>
                    {Array.from({ length: total }, (_, i) => (
                        <button
                            key={i}
                            type='button'
                            className={`qnav__chip ${answered.has(i) ? 'qnav__chip--done' : ''}`}
                            aria-label={`Ir a la pregunta ${i + 1}, ${answered.has(i) ? 'contestada' : 'sin contestar'}`}
                            onClick={() => { onJump(i); setOpen(false); }}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
                <div className='qnav__submit'>{submit}</div>
            </div>
        </aside>
    );
};

export default QuestionNav;
