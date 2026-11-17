import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import QuizResults from '../pages/quiz/QuizResults';
import { Quiz, QUIZ_RESULT_KEY, scoreQuiz } from '../utils/quiz';

jest.mock('../components/layout/AppBarPopOver', () => () => null);

const QUIZ: Quiz = {
  level: 3,
  type: 2,
  title: 'Empresa Rentable',
  feedbackDraft: true,
  blocks: [
    {
      name: 'Ambiental y Eficiencia Operativa',
      questions: [{
        text: '¿Cómo se gestiona la energía?',
        options: [0, 1, 2, 3].map(score => ({ text: `Energía ${score}`, score, feedback: `Por qué energía ${score}` })),
      }],
    },
    {
      name: 'Gobernanza, Riesgos y Finanzas Responsables',
      questions: [{
        text: '¿Cómo se rinde cuentas?',
        options: [0, 1, 2, 3].map(score => ({ text: `Reporte ${score}`, score, feedback: `Por qué reporte ${score}` })),
      }],
    },
  ],
};

const renderResults = () => render(<MemoryRouter><QuizResults /></MemoryRouter>);

describe('resultados del quiz', () => {
  beforeEach(() => sessionStorage.clear());

  it('pinta la calificacion global, por bloque y la retroalimentacion de la sesion', () => {
    // Energia optima (3) y reporte parcial (1): 4 de 6 puntos.
    sessionStorage.setItem(QUIZ_RESULT_KEY, JSON.stringify(scoreQuiz(QUIZ, { 0: 3, 1: 1 })));
    renderResults();

    expect(screen.getByText('67')).toBeTruthy();
    expect(screen.getByText('100%')).toBeTruthy();
    expect(screen.getByText('33%')).toBeTruthy();
    expect(screen.getByText('Por qué reporte 1')).toBeTruthy();
    expect(screen.getByText('Retroalimentación preliminar: el equipo la está revisando.')).toBeTruthy();
  });

  it('muestra la opcion optima solo cuando la respuesta no lo fue', () => {
    sessionStorage.setItem(QUIZ_RESULT_KEY, JSON.stringify(scoreQuiz(QUIZ, { 0: 3, 1: 1 })));
    renderResults();

    expect(screen.getAllByText('Opción óptima')).toHaveLength(1);
    expect(screen.getByText('Reporte 3')).toBeTruthy();
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
});
