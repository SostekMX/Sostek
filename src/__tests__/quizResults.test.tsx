import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import QuizResults from '../pages/quiz/QuizResults';
import { Quiz, QUIZ_RESULT_KEY, scoreQuiz } from '../utils/quiz';

jest.mock('../components/layout/AppBarPopOver', () => () => null);

const QUIZ: Quiz = {
  level: 1,
  type: 2,
  title: 'Empresa Rentable',
  blocks: [
    {
      name: 'Ambiental y Eficiencia Operativa',
      questions: [{
        text: '¿Cómo se gestiona la energía?',
        weight: 4,
        options: [0, 1, 2, 3].map(score => ({ text: `Energía ${score}`, score })),
      }],
    },
    {
      name: 'Gobernanza, Riesgos y Finanzas Responsables',
      questions: [{
        text: '¿Cómo se rinde cuentas?',
        weight: 5,
        options: [0, 1, 2, 3].map(score => ({ text: `Reporte ${score}`, score })),
      }],
    },
  ],
  tiers: [
    { min: 0, title: 'Nivel Base-Inicial', text: 'Tu proyecto aún está en una etapa exploratoria o base.' },
    { min: 80, title: 'Nivel Avanzado', text: 'Tu proyecto refleja un alto nivel de madurez.' },
  ],
};

const renderResults = () => render(<MemoryRouter><QuizResults /></MemoryRouter>);

describe('resultados del quiz', () => {
  beforeEach(() => sessionStorage.clear());

  it('pinta el puntaje, su tramo de retroalimentacion y los bloques', () => {
    // Energía óptima (3 x 4 = 4 pts) y reporte parcial (1 x 5 / 3 = 1.67 pts): 5.67 de 9.
    sessionStorage.setItem(QUIZ_RESULT_KEY, JSON.stringify(scoreQuiz(QUIZ, { 0: 3, 1: 1 })));
    renderResults();

    expect(screen.getByText('5.67')).toBeTruthy();
    expect(screen.getByText('/9')).toBeTruthy();
    expect(screen.getByText('Nivel Base-Inicial')).toBeTruthy();
    expect(screen.getByText('Tu proyecto aún está en una etapa exploratoria o base.')).toBeTruthy();
    expect(screen.getByText('100%')).toBeTruthy();
    expect(screen.getByText('33%')).toBeTruthy();
    expect(screen.queryByText(/preliminar/i)).toBeNull();
  });

  it('en la revision por pregunta muestra los puntos y la optima solo cuando la respuesta no lo fue', () => {
    sessionStorage.setItem(QUIZ_RESULT_KEY, JSON.stringify(scoreQuiz(QUIZ, { 0: 3, 1: 1 })));
    renderResults();

    expect(screen.getByText('Revisión por pregunta')).toBeTruthy();
    expect(screen.getByText('4 de 4 pts')).toBeTruthy();
    expect(screen.getByText('1.67 de 5 pts')).toBeTruthy();
    expect(screen.getAllByText('Opción óptima')).toHaveLength(1);
    expect(screen.getByText('Reporte 3')).toBeTruthy();
    expect(screen.getByText('5 de 5 pts')).toBeTruthy();
  });

  it('no usa las llaves de la evaluacion', () => {
    sessionStorage.setItem('finalScore', '40');
    renderResults();
    expect(screen.getByText('No hay un resultado que mostrar')).toBeTruthy();
  });

  it('una entrada corrupta cuenta como que no hay resultado', () => {
    sessionStorage.setItem(QUIZ_RESULT_KEY, '{roto');
    renderResults();
    expect(screen.getByText('Contesta el quiz para ver aquí tu calificación.')).toBeTruthy();
  });

  it('un resultado sin tramo, con la forma anterior, cuenta como que no hay resultado', () => {
    sessionStorage.setItem(QUIZ_RESULT_KEY, JSON.stringify({ level: 3, type: 1, points: 40, percent: 58, blocks: [] }));
    renderResults();
    expect(screen.getByText('No hay un resultado que mostrar')).toBeTruthy();
  });
});
