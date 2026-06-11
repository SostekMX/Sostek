import { getFeedback, applyAnswer, computeCategoryScores, clearScoreSession } from '../utils/scoring';

describe('getFeedback', () => {
  it('devuelve Excelente para puntaje >= 150', () => {
    expect(getFeedback(150).titulo).toBe('¡Excelente!');
    expect(getFeedback(200).titulo).toBe('¡Excelente!');
  });

  it('devuelve Muy bien para puntaje 120-149', () => {
    expect(getFeedback(120).titulo).toBe('Muy bien');
    expect(getFeedback(149).titulo).toBe('Muy bien');
  });

  it('devuelve Buen avance para puntaje 90-119', () => {
    expect(getFeedback(90).titulo).toBe('Buen avance');
    expect(getFeedback(119).titulo).toBe('Buen avance');
  });

  it('devuelve En desarrollo para puntaje 50-89', () => {
    expect(getFeedback(50).titulo).toBe('En desarrollo');
    expect(getFeedback(89).titulo).toBe('En desarrollo');
  });

  it('devuelve Por mejorar para puntaje < 50', () => {
    expect(getFeedback(49).titulo).toBe('Por mejorar');
    expect(getFeedback(0).titulo).toBe('Por mejorar');
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
