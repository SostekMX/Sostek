export interface Feedback {
  titulo: string;
  mensaje: string;
}

export type AnswerMap = Map<string, { category: string; value: number }>;

export function getFeedback(score: number): Feedback {
  if (score >= 150) return {
    titulo: "¡Excelente!",
    mensaje: "Tu proyecto demuestra un alto compromiso con la sostenibilidad en todas sus dimensiones. ¡Sigue así!"
  };
  if (score >= 120) return {
    titulo: "Muy bien",
    mensaje: "Tu proyecto tiene una base sólida de sostenibilidad. Hay algunas áreas que puedes seguir fortaleciendo para alcanzar el nivel óptimo."
  };
  if (score >= 90) return {
    titulo: "Buen avance",
    mensaje: "Tu proyecto va por buen camino, pero aún hay aspectos de sostenibilidad que requieren mayor atención y desarrollo."
  };
  if (score >= 50) return {
    titulo: "En desarrollo",
    mensaje: "Tu proyecto tiene potencial, pero necesita trabajar más en varias de sus dimensiones de sostenibilidad para cumplir con los estándares requeridos."
  };
  return {
    titulo: "Por mejorar",
    mensaje: "Tu proyecto necesita replantear su enfoque de sostenibilidad. Te recomendamos revisar los artículos disponibles para orientar el desarrollo de tu proyecto."
  };
}

export function applyAnswer(
  map: AnswerMap,
  score: number,
  category: string,
  answer: string,
  value: number
): { score: number; map: AnswerMap } {
  const newMap = new Map(map);
  if (newMap.has(answer)) {
    const prev = newMap.get(answer)!.value;
    newMap.delete(answer);
    return { score: score - prev, map: newMap };
  }
  newMap.set(answer, { category, value });
  return { score: score + value, map: newMap };
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
}
