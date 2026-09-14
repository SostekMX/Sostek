import { getFeedback, applyAnswer, computeCategoryScores, clearScoreSession } from '../utils/scoring';

/* Maximos reales de las 6 evaluaciones sembradas, medidos con computeMaxScore
 * contra los datos que devuelve GET /evaluations/:id. Los umbrales tienen que
 * funcionar para todas, no solo para las de mayor escala. */
const MAXIMOS = {
  'Arquitectura Nivel 1': 96,
  'Arquitectura Nivel 2': 92,
  'Arquitectura Nivel 3': 86,
  'Diseño Industrial Nivel 1': 100,
  'Diseño Industrial Nivel 2': 100,
  'Diseño Industrial Nivel 3': 92,
};

describe('getFeedback', () => {
  it('devuelve Excelente desde el 85% del maximo', () => {
    expect(getFeedback(85, 100).titulo).toBe('¡Excelente!');
    expect(getFeedback(100, 100).titulo).toBe('¡Excelente!');
  });

  it('devuelve Muy bien entre 70% y 85%', () => {
    expect(getFeedback(70, 100).titulo).toBe('Muy bien');
    expect(getFeedback(84, 100).titulo).toBe('Muy bien');
  });

  it('devuelve Buen avance entre 50% y 70%', () => {
    expect(getFeedback(50, 100).titulo).toBe('Buen avance');
    expect(getFeedback(69, 100).titulo).toBe('Buen avance');
  });

  it('devuelve En desarrollo entre 30% y 50%', () => {
    expect(getFeedback(30, 100).titulo).toBe('En desarrollo');
    expect(getFeedback(49, 100).titulo).toBe('En desarrollo');
  });

  it('devuelve Por mejorar por debajo del 30%', () => {
    expect(getFeedback(29, 100).titulo).toBe('Por mejorar');
    expect(getFeedback(0, 100).titulo).toBe('Por mejorar');
  });

  /* Regresion: con umbrales absolutos (150/120/90/50) el maximo de Diseno
   * Industrial N1 y N2 era 100, asi que una evaluacion perfecta seguia
   * cayendo en "Por mejorar" y "¡Excelente!" era inalcanzable. */
  it('un puntaje perfecto da Excelente en las 6 evaluaciones reales', () => {
    Object.values(MAXIMOS).forEach(max => {
      expect(getFeedback(max, max).titulo).toBe('¡Excelente!');
    });
  });

  it('la mitad del maximo da el mismo mensaje en las 6 evaluaciones reales', () => {
    Object.values(MAXIMOS).forEach(max => {
      expect(getFeedback(max / 2, max).titulo).toBe('Buen avance');
    });
  });

  it('sin maximo conocido no revienta y cae en Por mejorar', () => {
    expect(getFeedback(0, 0).titulo).toBe('Por mejorar');
  });
});

describe('applyAnswer', () => {
  it('agrega una respuesta nueva al mapa y suma al puntaje', () => {
    const map = new Map();
    const result = applyAnswer(map, 0, 'Ambiental', 'opcion-A', 10);
    expect(result.score).toBe(10);
    expect(result.map.get('opcion-A')).toEqual({ category: 'Ambiental', value: 10 });
  });

  it('quita la respuesta si ya existe (deseleccionar) y resta el valor', () => {
    const map = new Map([['opcion-A', { category: 'Ambiental', value: 10 }]]);
    const result = applyAnswer(map, 10, 'Ambiental', 'opcion-A', 10);
    expect(result.score).toBe(0);
    expect(result.map.has('opcion-A')).toBe(false);
  });

  it('no muta el mapa original', () => {
    const original = new Map([['opcion-A', { category: 'Social', value: 5 }]]);
    applyAnswer(original, 5, 'Social', 'opcion-A', 5);
    expect(original.has('opcion-A')).toBe(true);
  });

  it('acumula multiples respuestas correctamente', () => {
    let map = new Map();
    let score = 0;

    const r1 = applyAnswer(map, score, 'Ambiental', 'A', 10);
    map = r1.map; score = r1.score;

    const r2 = applyAnswer(map, score, 'Social', 'B', 20);
    map = r2.map; score = r2.score;

    expect(score).toBe(30);
    expect(map.size).toBe(2);
  });
});

describe('computeCategoryScores', () => {
  it('agrupa respuestas por categoria y suma sus valores', () => {
    const answers = new Map([
      ['A', { category: 'Ambiental', value: 10 }],
      ['B', { category: 'Social', value: 20 }],
      ['C', { category: 'Ambiental', value: 15 }],
    ]);
    const { categories, scores } = computeCategoryScores(answers);
    const ambIdx = categories.indexOf('Ambiental');
    const socIdx = categories.indexOf('Social');
    expect(scores[ambIdx]).toBe(25);
    expect(scores[socIdx]).toBe(20);
  });

  it('devuelve arreglos vacios para un mapa vacio', () => {
    const { categories, scores } = computeCategoryScores(new Map());
    expect(categories).toHaveLength(0);
    expect(scores).toHaveLength(0);
  });
});

describe('clearScoreSession', () => {
  it('elimina las claves de sessionStorage de la evaluacion', () => {
    sessionStorage.setItem('finalScore', '100');
    sessionStorage.setItem('totalCategories', '2');
    sessionStorage.setItem('category0', 'Ambiental');
    sessionStorage.setItem('categoryScore0', '60');
    sessionStorage.setItem('category1', 'Social');
    sessionStorage.setItem('categoryScore1', '40');

    clearScoreSession(2);

    expect(sessionStorage.getItem('finalScore')).toBeNull();
    expect(sessionStorage.getItem('totalCategories')).toBeNull();
    expect(sessionStorage.getItem('category0')).toBeNull();
    expect(sessionStorage.getItem('categoryScore0')).toBeNull();
    expect(sessionStorage.getItem('category1')).toBeNull();
    expect(sessionStorage.getItem('categoryScore1')).toBeNull();
  });
});
