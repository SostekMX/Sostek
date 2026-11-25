import {
  classify, formatPoints, isComplete, percentOf, Quiz, QuizTier, questionCount, scoreQuiz, shuffledIndices, tierOf, toPoints,
} from '../utils/quiz';

const TIERS: QuizTier[] = [
  { min: 0, title: 'Nivel Base-Inicial', text: 'base' },
  { min: 20, title: 'Nivel Inicial', text: 'inicial' },
  { min: 40, title: 'Desarrollo Intermedio', text: 'intermedio' },
  { min: 60, title: 'Desarrollo Intermedio-avanzado', text: 'intermedio avanzado' },
  { min: 80, title: 'Nivel Avanzado', text: 'avanzado' },
];

const opciones = (prefijo: string) => [0, 1, 2, 3].map(score => ({ text: `${prefijo} opcion ${score}`, score }));
const pregunta = (text: string, weight: number) => ({ text, weight, options: opciones(text) });

/* Bloques disparejos (3 y 1 preguntas) y pesos mezclados a proposito: el calculo no puede suponer
   el 8/8/7 ni que todas las preguntas valen lo mismo. */
const QUIZ: Quiz = {
  level: 1,
  type: 1,
  title: 'Modelo de Negocio',
  blocks: [
    { name: 'Ambiental', questions: [pregunta('a1', 4), pregunta('a2', 5), pregunta('a3', 4)] },
    { name: 'Gobernanza', questions: [pregunta('g1', 5)] },
  ],
  tiers: TIERS,
};

/* Un test con la forma real: 23 preguntas y las estrategicas (valen 5) en 6, 7, 8, 14, 15, 16, 22 y 23. */
const ESTRATEGICAS = [6, 7, 8, 14, 15, 16, 22, 23];
const COMPLETO: Quiz = {
  ...QUIZ,
  blocks: [[1, 8], [9, 16], [17, 23]].map(([desde, hasta], b) => ({
    name: `Bloque ${b + 1}`,
    questions: Array.from({ length: hasta - desde + 1 }, (_, i) =>
      pregunta(`p${desde + i}`, ESTRATEGICAS.includes(desde + i) ? 5 : 4)),
  })),
};
const todas = (escalon: number) => Object.fromEntries(Array.from({ length: 23 }, (_, i) => [i, escalon]));

describe('classify', () => {
  it('3 es optima, 1 y 2 parciales, 0 nula', () => {
    expect(classify(3)).toBe('optimal');
    expect(classify(2)).toBe('partial');
    expect(classify(1)).toBe('partial');
    expect(classify(0)).toBe('none');
  });
});

describe('puntos en tercios', () => {
  it('un test todo optimo da 100 exactos y todo nulo da 0', () => {
    expect(toPoints(scoreQuiz(COMPLETO, todas(3)).thirds)).toBe(100);
    expect(scoreQuiz(COMPLETO, todas(0)).thirds).toBe(0);
  });

  it('todo en el primer escalon da 33.33, sin el error de sumar 1.33 y 1.67', () => {
    // 15 x 1.33 + 8 x 1.67 da 33.31; en tercios son 100, o sea 33.333...
    const resultado = scoreQuiz(COMPLETO, todas(1));
    expect(resultado.thirds).toBe(100);
    expect(formatPoints(toPoints(resultado.thirds))).toBe('33.33');
  });

  it('formatPoints deja 2 decimales como maximo', () => {
    expect(formatPoints(100)).toBe('100');
    expect(formatPoints(60)).toBe('60');
    expect(formatPoints(toPoints(173))).toBe('57.67');
    expect(formatPoints(toPoints(4))).toBe('1.33');
  });

  it('percentOf no da NaN sin preguntas', () => {
    expect(percentOf(0, 0)).toBe(0);
  });
});

describe('tierOf', () => {
  it('respeta los limites de cada tramo', () => {
    expect(tierOf(0, TIERS).title).toBe('Nivel Base-Inicial');
    expect(tierOf(19.99, TIERS).title).toBe('Nivel Base-Inicial');
    expect(tierOf(20, TIERS).title).toBe('Nivel Inicial');
    expect(tierOf(toPoints(179), TIERS).title).toBe('Desarrollo Intermedio'); // 59.67
    expect(tierOf(80, TIERS).title).toBe('Nivel Avanzado');
    expect(tierOf(100, TIERS).title).toBe('Nivel Avanzado');
  });

  it('un total sumado en tercios que cae justo en el limite toma el tramo de arriba', () => {
    expect(tierOf(toPoints(60), TIERS).title).toBe('Nivel Inicial'); // 60 tercios = 20 puntos
    expect(tierOf(toPoints(240), TIERS).title).toBe('Nivel Avanzado'); // 240 tercios = 80 puntos
  });

  it('no depende del orden en que vengan los tramos', () => {
    expect(tierOf(45, [...TIERS].reverse()).title).toBe('Desarrollo Intermedio');
  });
});

describe('scoreQuiz', () => {
  // a1 (vale 4) optima, a2 (vale 5) parcial 2, a3 (vale 4) nula, g1 (vale 5) parcial 1.
  const resultado = scoreQuiz(QUIZ, { 0: 3, 1: 2, 2: 0, 3: 1 });

  it('suma el global con el peso de cada pregunta', () => {
    // 3x4 + 2x5 + 0x4 + 1x5 = 27 tercios (9 puntos) de 54 (18 puntos)
    expect(resultado.thirds).toBe(27);
    expect(resultado.maxThirds).toBe(54);
    expect(resultado.questions).toBe(4);
  });

  it('calcula cada bloque con sus propios pesos', () => {
    expect(resultado.blocks.map(b => [b.name, b.thirds, b.maxThirds, b.percent])).toEqual([
      ['Ambiental', 22, 39, 56],
      ['Gobernanza', 5, 15, 33],
    ]);
  });

  it('elige el tramo con el total en puntos', () => {
    expect(resultado.tier.title).toBe('Nivel Base-Inicial');
    expect(scoreQuiz(COMPLETO, todas(2)).tier.title).toBe('Desarrollo Intermedio-avanzado'); // 66.67
  });

  it('cuenta optimas, parciales y nulas', () => {
    expect(resultado.counts).toEqual({ optimal: 1, partial: 2, none: 1 });
  });

  it('numera seguido entre bloques y guarda la elegida, sus puntos y la optima', () => {
    const g1 = resultado.blocks[1].items[0];
    expect(g1.number).toBe(4);
    expect(g1.weight).toBe(5);
    expect(g1.chosen.text).toBe('g1 opcion 1');
    expect(g1.chosenThirds).toBe(5);
    expect(g1.optimal.text).toBe('g1 opcion 3');
    expect(g1.classification).toBe('partial');
  });

  it('la optima es la de mayor puntaje aunque no venga al final', () => {
    const desordenado: Quiz = {
      ...QUIZ,
      blocks: [{ name: 'X', questions: [{ text: 'q', weight: 4, options: [...opciones('q')].reverse() }] }],
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
