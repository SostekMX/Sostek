/* Quiz de sostenibilidad para proyectos de negocio (GET /quiz). Fuente: el PDF de ponderacion de Carlos.
 *
 * Cada opcion trae su escalon (score: 0 nula, 1 y 2 parciales, 3 optima) y cada pregunta su peso
 * (weight: 4 estandar, 5 estrategica). La opcion vale score * weight / 3 puntos: 0, 1.33, 2.67, 4
 * o 0, 1.67, 3.33, 5. Todo se suma en tercios enteros (score * weight) y se divide entre 3 solo al
 * final: un test vale 300 tercios = 100 puntos exactos, sin que los 1.33 sumados den 99.99. Al
 * mostrar se redondea a 2 decimales; como todo total es k/3, los decimales solo pueden ser .00,
 * .33 o .67, asi que el redondeo nunca lo sube al tramo siguiente (19.67 sigue abajo de 20).
 * Nada mas esta fijo: los bloques, las preguntas y los tramos salen de los datos.
 */

export const MAX_SCORE = 3;

/* Cache de contenido en localStorage (todos los quizzes) y resultado del ultimo intento en
   sessionStorage. .v2 desde que hay pesos y tramos: lo guardado con la forma anterior no se lee. */
export const QUIZ_CACHE_KEY = 'quiz.v2';
export const QUIZ_RESULT_KEY = 'sostekQuiz.result.v2';
export const OLD_QUIZ_CACHE_KEY = 'quiz';

export interface QuizOption {
  text: string;
  score: number;
}

export interface QuizQuestion {
  text: string;
  weight: number;
  options: QuizOption[];
}

export interface QuizBlock {
  name: string;
  questions: QuizQuestion[];
}

/* Retroalimentacion final: aplica desde min puntos hasta el min del siguiente tramo. */
export interface QuizTier {
  min: number;
  title: string;
  text: string;
}

export interface Quiz {
  level: number;
  type: number;
  title: string;
  summary?: string;
  focus?: string;
  blocks: QuizBlock[];
  tiers: QuizTier[];
}

/* Clave: la posicion de la pregunta al recorrer los bloques en orden (0, 1, 2...).
   Valor: el indice original de la opcion elegida, no el de pantalla, que va barajado. */
export type QuizAnswers = Record<number, number>;

export type Classification = 'optimal' | 'partial' | 'none';

export interface QuizItem {
  number: number;
  question: string;
  weight: number;
  chosen: QuizOption;
  chosenThirds: number;
  optimal: QuizOption;
  classification: Classification;
}

export interface BlockResult {
  name: string;
  thirds: number;
  maxThirds: number;
  percent: number;
  items: QuizItem[];
}

export interface QuizResult {
  level: number;
  type: number;
  title: string;
  thirds: number;
  maxThirds: number;
  questions: number;
  tier: QuizTier;
  counts: Record<Classification, number>;
  blocks: BlockResult[];
}

/* 3 = optima, 1-2 = parcial, 0 = nula. */
export function classify(score: number): Classification {
  if (score >= MAX_SCORE) return 'optimal';
  if (score <= 0) return 'none';
  return 'partial';
}

export function toPoints(thirds: number): number {
  return thirds / 3;
}

/* 2 decimales como maximo: 57.67, 60, 100. */
export function formatPoints(points: number): string {
  return String(Math.round(points * 100) / 100);
}

export function percentOf(thirds: number, maxThirds: number): number {
  return maxThirds > 0 ? Math.round((thirds / maxThirds) * 100) : 0;
}

/* El tramo de un total: el de mayor min que no lo rebasa. */
export function tierOf(points: number, tiers: QuizTier[]): QuizTier {
  const sorted = [...tiers].sort((a, b) => a.min - b.min);
  if (sorted.length === 0) throw new Error('El quiz no trae tramos de retroalimentacion');
  return sorted.reduce((found, tier) => (points >= tier.min ? tier : found), sorted[0]);
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
      return {
        number: index,
        question: question.text,
        weight: question.weight,
        chosen,
        chosenThirds: chosen.score * question.weight,
        optimal,
        classification,
      };
    });
    const thirds = items.reduce((sum, item) => sum + item.chosenThirds, 0);
    const maxThirds = items.reduce((sum, item) => sum + MAX_SCORE * item.weight, 0);
    return { name: block.name, thirds, maxThirds, percent: percentOf(thirds, maxThirds), items };
  });

  const thirds = blocks.reduce((sum, block) => sum + block.thirds, 0);
  const maxThirds = blocks.reduce((sum, block) => sum + block.maxThirds, 0);
  return {
    level: quiz.level,
    type: quiz.type,
    title: quiz.title,
    thirds,
    maxThirds,
    questions: index,
    tier: tierOf(toPoints(thirds), quiz.tiers),
    counts,
    blocks,
  };
}

/* Fisher-Yates sobre 0..n-1. En el PDF la mejor opcion suele ir al final (en el Nivel 3, siempre):
   sin barajar, se adivinaria. rand se inyecta para poder probarlo. */
export function shuffledIndices(n: number, rand: () => number = Math.random): number[] {
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}
