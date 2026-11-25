# Sesión del 17 de noviembre de 2026: quiz de proyectos de negocio

Ramas: `feature/quiz-nivel3` en los dos repos. **Publicado el 17 de noviembre** (ver «Publicación»).

## Qué es

Un quiz de sostenibilidad para proyectos de negocio, diseñado por Carlos, con acceso desde EVALÚATE: un banner entre «Cómo funciona» y las evaluaciones por carrera. Al principio quedó en APRENDE por error y se movió en la misma sesión. El flujo tiene tres pasos:
1. Se elige el nivel. El 1 y el 2 salen como «Próximamente» mientras no tengan datos.
2. Se elige el tipo de proyecto, que es obligatorio: Modelo de Negocio o Empresa Rentable.
3. Se contesta por bloques y se ven los resultados.

## Datos (backend)

- `seed/quiz_nivel3.txt` es el original de Carlos. `seed/quiz_data.json` es la fuente del seed y trae la retroalimentación.
- Un test comprueba que el JSON y el `.txt` digan lo mismo, en el mismo orden.
- Colección nueva `quizzes`, con un documento por nivel y tipo (índice único). No se reusó `evaluations` por dos razones: su esquema exige `career`, y `GET /evaluations` lista todo, así que el quiz habría aparecido en EVALÚATE.
- `npm run seed:quiz` es idempotente: hace `replaceOne` con upsert por nivel y tipo. No borra nada.
- `GET /quiz` acepta `?level=N` opcional y responde `{ success, quizzes }`.
- La retroalimentación es un borrador (`feedbackDraft: true` por quiz): 184 justificaciones, una por opción.

## Pantallas (frontend)

- `/quiz`: nivel y tipo. Son radios nativos dentro de tarjetas, así que el teclado y el estado deshabilitado salen del navegador.
- `/quiz/:level/:type`: las preguntas van por bloque y reutilizan `QuestionNav` y los estilos de la evaluación. Las opciones se barajan en cada intento. «Obtener resultados» solo se habilita con todo contestado.
- `/quiz/resultados`: muestra el % global, el % por bloque, el conteo de óptimas, parciales y nulas, y la retroalimentación por pregunta con el filtro «Por mejorar».
- El veredicto reutiliza `getFeedback` de la evaluación.
- El cálculo vive en `src/utils/quiz.ts` y tiene tests.
- Llaves propias:
  - localStorage: `quiz`
  - sessionStorage: `sostekQuiz.result`
- Color nuevo: `--caution` para «parcial».
- Gobernanza no tiene eje y se pinta en marfil.

## Verificado

- Backend en memoria con el JSON sembrado y frontend real.
- Recorrido completo a 360, 390 y 2000 px.
- Con respuestas de puntaje i % 4, los resultados coinciden con la cuenta a mano: 48 % global; 50, 50 y 43 % por bloque; 5 óptimas, 12 parciales y 6 nulas.
- Sin errores en la consola.

## Publicación

1. `development` se adelantó a `main` en los dos repos (fast-forward).
2. `npm run seed:quiz` contra Atlas: Nivel 3, tipos 1 y 2, 23 preguntas cada uno.
3. Backend: PR #4 (`feature/quiz-nivel3` → `development`) y PR #6 (`development` → `main`). Render lo publicó en ~1 min; `GET /quiz?level=3` responde en producción.
4. Frontend: PR #44 (`feature/quiz-nivel3` → `development`) y PR #45 (`development` → `main`). Vercel lo publicó en https://sostek.vercel.app.
5. Recorrido completo contra producción a 2000 px: mismos resultados que en local y sin errores en la consola.
6. La corrección de seguridad del backend (`chore/cambios-pendientes`, PR #5) quedó abierta para revisión, ya al día con `development` y sin conflictos.

## Pendiente

- Que Carlos revise la retroalimentación y luego poner `feedbackDraft: false` y volver a sembrar. Mientras tanto se muestra el aviso «Retroalimentación preliminar».
- Revisar e integrar el PR #5 del backend (sanea el body antes de usarlo).
- Contenido de los niveles 1 y 2: basta con agregarlo al JSON y sembrarlo.
- El resultado no se guarda en el perfil: `POST /user/score` solo tiene `score_test`, que es de la evaluación. Haría falta un campo nuevo.
- El contenido del quiz pasa por `tx()`, pero todavía no tiene traducción en `content.en.json`. En inglés se ve en español.
