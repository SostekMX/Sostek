# Sesión del 17 de noviembre de 2026: quiz de proyectos de negocio

Ramas: `feature/quiz-nivel3` en los dos repos. Las dos salen de `development` adelantada a `main` en local, sin push.

## Qué es

Un quiz de sostenibilidad para proyectos de negocio, diseñado por Carlos, con acceso desde APRENDE. El flujo tiene tres pasos:
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

## Pendiente

- Correr `npm run seed:quiz` contra Atlas.
- Que Carlos revise la retroalimentación y luego poner `feedbackDraft: false` y volver a sembrar.
- El resultado no se guarda en el perfil: `POST /user/score` solo tiene `score_test`, que es de la evaluación. Haría falta un campo nuevo.
- El contenido del quiz pasa por `tx()`, pero todavía no tiene traducción en `content.en.json`. En inglés se ve en español.
