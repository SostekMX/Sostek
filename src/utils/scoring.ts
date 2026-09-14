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

export function computeCategoryScores(answers: AnswerMap): { categories: string[]; scores: number[] } {
  const categories: string[] = [];
  const scores: number[] = [];
  answers.forEach(({ category, value }) => {
    const idx = categories.indexOf(category);
    if (idx !== -1) {
      scores[idx] += value;
    } else {
      categories.push(category);
      scores[categories.length - 1] = value;
    }
  });
  return { categories, scores };
}

export function clearScoreSession(totalCategories: number) {
  for (let i = 0; i < totalCategories; i++) {
    sessionStorage.removeItem(`categoryScore${i}`);
    sessionStorage.removeItem(`category${i}`);
  }
  sessionStorage.removeItem("finalScore");
  sessionStorage.removeItem("totalCategories");
  sessionStorage.removeItem("maxScore");
}

export function computeMaxScore(questions: { options: { value: number }[] }[]): number {
  return questions.reduce((total, question) =>
    total + question.options.reduce((sum, option) => sum + (option.value > 0 ? option.value : 0), 0)
  , 0);
}
