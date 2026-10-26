import { getFeedback, toggleAnswer, totalScore, weakestCategory, clearScoreSession } from '../utils/scoring';

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

describe('toggleAnswer', () => {
  it('agrega una respuesta nueva al mapa', () => {
    const map = toggleAnswer(new Map(), '0:1', 'Ambiental', 10);
    expect(map.get('0:1')).toEqual({ category: 'Ambiental', value: 10 });
  });

  it('quita la respuesta si ya existe (deseleccionar)', () => {
    const marcada = toggleAnswer(new Map(), '0:1', 'Ambiental', 10);
    expect(toggleAnswer(marcada, '0:1', 'Ambiental', 10).has('0:1')).toBe(false);
  });

  it('no muta el mapa original', () => {
    const original = toggleAnswer(new Map(), '0:1', 'Social', 5);
    toggleAnswer(original, '0:1', 'Social', 5);
    expect(original.has('0:1')).toBe(true);
  });

  it('distingue opciones de preguntas distintas con el mismo indice', () => {
    let map = toggleAnswer(new Map(), '0:0', 'Ambiental', 3);
    map = toggleAnswer(map, '1:0', 'Social', 2);
    expect(map.size).toBe(2);
    expect(totalScore(map)).toBe(5);
  });
});

describe('totalScore', () => {
  it('suma el valor de todas las respuestas marcadas', () => {
    let map = toggleAnswer(new Map(), '0:0', 'Ambiental', 10);
    map = toggleAnswer(map, '1:2', 'Social', 20);
    expect(totalScore(map)).toBe(30);
  });

  it('un mapa vacio vale cero', () => {
    expect(totalScore(new Map())).toBe(0);
  });

  /* Regresion: el puntaje se derivaba en paralelo al mapa y podian separarse.
   * Marcar y desmarcar lo mismo tiene que volver exactamente a cero. */
  it('marcar y desmarcar regresa al puntaje inicial', () => {
    let map = toggleAnswer(new Map(), '0:0', 'Ambiental', 7);
    map = toggleAnswer(map, '0:1', 'Ambiental', 3);
    map = toggleAnswer(map, '0:0', 'Ambiental', 7);
    map = toggleAnswer(map, '0:1', 'Ambiental', 3);
    expect(totalScore(map)).toBe(0);
    expect(map.size).toBe(0);
  });
});

/* Dos ejes con el mismo tamano que Diseno Industrial N1: Ambiental vale 36 y
 * Economico y Social 64 (una pregunta por eje para no inflar el fixture). */
const PREGUNTAS = [
  { category: 'Ambiental', options: [{ value: 36 }, { value: 0 }] },
  { category: 'Económico y Social', options: [{ value: 64 }, { value: -2 }] },
];

describe('weakestCategory', () => {
  /* Regresion: se comparaban sumas, asi que 20 de 36 (56%) salia mas debil que
   * 30 de 64 (47%) solo porque el eje Ambiental tiene menos puntos en juego. */
  it('compara por porcentaje del maximo de cada eje, no por puntos', () => {
    const answers = new Map([
      ['0:0', { category: 'Ambiental', value: 20 }],
      ['1:0', { category: 'Económico y Social', value: 30 }],
    ]);
    expect(weakestCategory(answers, PREGUNTAS)).toBe('Económico y Social');
  });

  /* Regresion: los ejes salian de las respuestas, asi que uno sin ninguna casilla
   * marcada ni siquiera competia y nunca se recomendaba. */
  it('un eje sin respuestas cuenta con 0% y es el mas debil', () => {
    const answers = new Map([['1:0', { category: 'Económico y Social', value: 1 }]]);
    expect(weakestCategory(answers, PREGUNTAS)).toBe('Ambiental');
  });

  it('sin preguntas devuelve cadena vacia', () => {
    expect(weakestCategory(new Map(), [])).toBe('');
  });
});

describe('clearScoreSession', () => {
  it('elimina las claves de sessionStorage de la evaluacion', () => {
    sessionStorage.setItem('finalScore', '100');
    sessionStorage.setItem('maxScore', '96');
    sessionStorage.setItem('weakestCategory', 'Ambiental');

    clearScoreSession();

    expect(sessionStorage.getItem('finalScore')).toBeNull();
    expect(sessionStorage.getItem('maxScore')).toBeNull();
    expect(sessionStorage.getItem('weakestCategory')).toBeNull();
  });
});
