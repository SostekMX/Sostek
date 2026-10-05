export interface Feedback {
  titulo: string;
  mensaje: string;
}

export type AnswerMap = Map<string, { category: string; value: number }>;

/* El feedback va por porcentaje del maximo alcanzable, no por puntaje absoluto:
 * cada evaluacion tiene su propia escala (de 86 a 100 puntos segun la carrera y el
 * nivel), asi que un corte fijo premiaba o castigaba segun la evaluacion elegida. */
export function getFeedback(score: number, maxScore: number): Feedback {
  const pct = maxScore > 0 ? score / maxScore : 0;

  if (pct >= 0.85) return {
    titulo: "¡Excelente!",
    mensaje: "Tu proyecto demuestra un alto compromiso con la sostenibilidad en todas sus dimensiones. ¡Sigue así!"
  };
  if (pct >= 0.70) return {
    titulo: "Muy bien",
    mensaje: "Tu proyecto tiene una base sólida de sostenibilidad. Hay algunas áreas que puedes seguir fortaleciendo para alcanzar el nivel óptimo."
  };
  if (pct >= 0.50) return {
    titulo: "Buen avance",
    mensaje: "Tu proyecto va por buen camino, pero aún hay aspectos de sostenibilidad que requieren mayor atención y desarrollo."
  };
  if (pct >= 0.30) return {
    titulo: "En desarrollo",
    mensaje: "Tu proyecto tiene potencial, pero necesita trabajar más en varias de sus dimensiones de sostenibilidad para cumplir con los estándares requeridos."
  };
  return {
    titulo: "Por mejorar",
    mensaje: "Tu proyecto necesita replantear su enfoque de sostenibilidad. Te recomendamos revisar los artículos disponibles para orientar el desarrollo de tu proyecto."
  };
}

/* El mapa de respuestas es la unica fuente de verdad: el puntaje se deriva de el con
 * totalScore(), en vez de llevarse aparte. Antes se mantenian los dos en paralelo y
 * podian desincronizarse. */
export function toggleAnswer(
  map: AnswerMap,
  key: string,
  category: string,
  value: number
): AnswerMap {
  const next = new Map(map);
  if (next.has(key)) next.delete(key);
  else next.set(key, { category, value });
  return next;
}

export function totalScore(answers: AnswerMap): number {
  let total = 0;
  answers.forEach(({ value }) => { total += value; });
  return total;
}

/* El eje mas debil se compara por porcentaje del maximo de cada eje, no por puntos: en
 * Diseno Industrial N1 "Ambiental" vale 36 y "Economico y Social" 64, asi que comparando
 * sumas el primero salia como el mas debil casi siempre. Los ejes salen de las preguntas
 * y no de las respuestas, para que un eje sin ninguna casilla marcada cuente con 0%. */
export function weakestCategory(
  answers: AnswerMap,
  questions: { category: string; options: { value: number }[] }[]
): string {
  const maxByCategory = new Map<string, number>();
  questions.forEach(q =>
    maxByCategory.set(q.category, (maxByCategory.get(q.category) ?? 0) + computeMaxScore([q]))
  );
  const scoreByCategory = new Map<string, number>();
  answers.forEach(({ category, value }) =>
    scoreByCategory.set(category, (scoreByCategory.get(category) ?? 0) + value)
  );

  let weakest = '';
  let lowest = Infinity;
  maxByCategory.forEach((max, category) => {
    const pct = max > 0 ? (scoreByCategory.get(category) ?? 0) / max : 1;
    if (pct < lowest) {
      lowest = pct;
      weakest = category;
    }
  });
  return weakest;
}

export function clearScoreSession() {
  sessionStorage.removeItem("finalScore");
  sessionStorage.removeItem("maxScore");
  sessionStorage.removeItem("weakestCategory");
}

export function computeMaxScore(questions: { options: { value: number }[] }[]): number {
  return questions.reduce((total, question) =>
    total + question.options.reduce((sum, option) => sum + (option.value > 0 ? option.value : 0), 0)
  , 0);
}
