/* Quiz de sostenibilidad para proyectos de negocio (GET /quiz).
 *
 * Nada esta fijo: cuantos bloques hay y cuantas preguntas trae cada uno sale de los datos.
 * Cada opcion vale de 0 a 3 y su porcentaje es puntos / (3 x preguntas), global y por bloque.
 */

export const MAX_SCORE = 3;

/* Cache de contenido en localStorage (todos los quizzes) y resultado del ultimo intento en
   sessionStorage. Prefijo propio para no chocar con las llaves de las evaluaciones. */
export const QUIZ_CACHE_KEY = 'quiz';
export const QUIZ_RESULT_KEY = 'sostekQuiz.result';

export interface QuizOption {
  text: string;
  score: number;
  feedback: string;
}

export interface QuizQuestion {
  text: string;
  options: QuizOption[];
}

export interface QuizBlock {
  name: string;
  questions: QuizQuestion[];
}

export interface Quiz {
  level: number;
  type: number;
  title: string;
  summary?: string;
  focus?: string;
  feedbackDraft?: boolean;
  blocks: QuizBlock[];
}

/* Clave: la posicion de la pregunta al recorrer los bloques en orden (0, 1, 2...).
   Valor: el indice original de la opcion elegida, no el de pantalla, que va barajado. */
export type QuizAnswers = Record<number, number>;

export type Classification = 'optimal' | 'partial' | 'none';

export interface QuizItem {
  number: number;
  question: string;
  chosen: QuizOption;
  optimal: QuizOption;
  classification: Classification;
}

export interface BlockResult {
  name: string;
  points: number;
  questions: number;
  percent: number;
  items: QuizItem[];
}

export interface QuizResult {
  level: number;
  type: number;
  title: string;
  feedbackDraft: boolean;
  points: number;
  questions: number;
  percent: number;
  counts: Record<Classification, number>;
  blocks: BlockResult[];
}

/* 3 = optima, 1-2 = parcial, 0 = nula. */
export function classify(score: number): Classification {
  if (score >= MAX_SCORE) return 'optimal';
  if (score <= 0) return 'none';
  return 'partial';
}

export function percent(points: number, questions: number): number {
  return questions > 0 ? Math.round((points / (MAX_SCORE * questions)) * 100) : 0;
}

export function questionCount(quiz: Quiz): number {
  return quiz.blocks.reduce((n, block) => n + block.questions.length, 0);
}

export function isComplete(quiz: Quiz, answers: QuizAnswers): boolean {
  return Array.from({ length: questionCount(quiz) }).every((_, i) => answers[i] !== undefined);
}

export function scoreQuiz(quiz: Quiz, answers: QuizAnswers): QuizResult {
  const counts: Record<Classification, number> = { optimal: 0, partial: 0, none: 0 };
  let index = 0;

  const blocks = quiz.blocks.map(block => {
    const items = block.questions.map(question => {
      const chosen = question.options[answers[index]];
      if (!chosen) throw new Error(`La pregunta ${index + 1} no tiene respuesta`);
      const optimal = question.options.reduce((best, option) => (option.score > best.score ? option : best));
      const classification = classify(chosen.score);
      counts[classification] += 1;
      index += 1;
      return { number: index, question: question.text, chosen, optimal, classification };
    });
    const points = items.reduce((sum, item) => sum + item.chosen.score, 0);
    return { name: block.name, points, questions: items.length, percent: percent(points, items.length), items };
  });

  const points = blocks.reduce((sum, block) => sum + block.points, 0);
  return {
    level: quiz.level,
    type: quiz.type,
    title: quiz.title,
    feedbackDraft: quiz.feedbackDraft ?? false,
    points,
    questions: index,
    percent: percent(points, index),
    counts,
    blocks,
  };
}

/* Fisher-Yates sobre 0..n-1. Las opciones vienen de la menos a la mas sostenible: sin
   barajar, la optima siempre quedaria al final. rand se inyecta para poder probarlo. */
export function shuffledIndices(n: number, rand: () => number = Math.random): number[] {
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}
