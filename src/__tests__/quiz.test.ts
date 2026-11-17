import { classify, isComplete, percent, Quiz, questionCount, scoreQuiz, shuffledIndices } from '../utils/quiz';

const opciones = (prefijo: string) => [0, 1, 2, 3].map(score => ({
  text: `${prefijo} opcion ${score}`,
  score,
  feedback: `${prefijo} por que vale ${score}`,
}));

/* Bloques disparejos (3 y 1 preguntas) a proposito: el calculo no puede suponer el 8/8/7
   del Nivel 3 ni que todos los bloques miden lo mismo. */
const QUIZ: Quiz = {
  level: 3,
  type: 1,
  title: 'Modelo de Negocio',
  feedbackDraft: true,
  blocks: [
    { name: 'Ambiental', questions: ['a1', 'a2', 'a3'].map(q => ({ text: q, options: opciones(q) })) },
    { name: 'Gobernanza', questions: [{ text: 'g1', options: opciones('g1') }] },
  ],
};

describe('classify', () => {
  it('3 es optima, 1 y 2 parciales, 0 nula', () => {
    expect(classify(3)).toBe('optimal');
    expect(classify(2)).toBe('partial');
    expect(classify(1)).toBe('partial');
    expect(classify(0)).toBe('none');
  });
});

describe('percent', () => {
  it('divide entre 3 por pregunta y redondea', () => {
    expect(percent(9, 3)).toBe(100);
    expect(percent(5, 3)).toBe(56);
    expect(percent(0, 3)).toBe(0);
  });

  it('sin preguntas da 0 y no NaN', () => {
    expect(percent(0, 0)).toBe(0);
  });
});

describe('scoreQuiz', () => {
  // a1 optima, a2 parcial (2), a3 nula, g1 parcial (1).
  const respuestas = { 0: 3, 1: 2, 2: 0, 3: 1 };
  const resultado = scoreQuiz(QUIZ, respuestas);

  it('calcula el global sobre todas las preguntas, no como promedio de bloques', () => {
    expect(resultado.points).toBe(6);
    expect(resultado.questions).toBe(4);
    expect(resultado.percent).toBe(50); // 6 / 12; el promedio de bloques daria (56 + 33) / 2
  });

  it('calcula cada bloque con su propio numero de preguntas', () => {
    expect(resultado.blocks.map(b => [b.name, b.points, b.questions, b.percent])).toEqual([
      ['Ambiental', 5, 3, 56],
      ['Gobernanza', 1, 1, 33],
    ]);
  });

  it('cuenta optimas, parciales y nulas', () => {
    expect(resultado.counts).toEqual({ optimal: 1, partial: 2, none: 1 });
  });

  it('numera seguido entre bloques y guarda la elegida y la optima', () => {
    const g1 = resultado.blocks[1].items[0];
    expect(g1.number).toBe(4);
    expect(g1.chosen.text).toBe('g1 opcion 1');
    expect(g1.optimal.text).toBe('g1 opcion 3');
    expect(g1.classification).toBe('partial');
  });

  it('la optima es la de mayor puntaje aunque no venga al final', () => {
    const desordenado: Quiz = {
      ...QUIZ,
      blocks: [{ name: 'X', questions: [{ text: 'q', options: [...opciones('q')].reverse() }] }],
    };
    expect(scoreQuiz(desordenado, { 0: 1 }).blocks[0].items[0].optimal.score).toBe(3);
  });

  it('falla si falta una respuesta en vez de contarla como 0', () => {
    expect(() => scoreQuiz(QUIZ, { 0: 3 })).toThrow();
  });
});

describe('isComplete', () => {
  it('solo es true con todas las preguntas contestadas', () => {
    expect(questionCount(QUIZ)).toBe(4);
    expect(isComplete(QUIZ, { 0: 1, 1: 1, 2: 1 })).toBe(false);
    expect(isComplete(QUIZ, { 0: 1, 1: 1, 2: 1, 3: 0 })).toBe(true);
  });
});

describe('shuffledIndices', () => {
  it('devuelve una permutacion de 0..n-1', () => {
    const orden = shuffledIndices(4);
    expect([...orden].sort()).toEqual([0, 1, 2, 3]);
  });

  it('con rand fijo el orden es predecible', () => {
    // rand = 0 lleva cada elemento al frente: 0,1,2,3 -> 1,2,3,0
    expect(shuffledIndices(4, () => 0)).toEqual([1, 2, 3, 0]);
  });
});
