# Investigación — Pestaña EVALÚATE

Fecha: 2026-09-14. Rama: `feat/juega-layout-desktop`. **Solo lectura: no se tocó código.**

> **Estado (2026-09-14, mismo día):** los 8 hallazgos de la §8 quedaron corregidos en los
> commits `f29d65b`…`10b66ec`; cada uno lleva abajo su nota de resolución. El documento se
> conserva como registro de qué se encontró y qué pasó con cada cosa. Lo de la §9 (layout)
> sigue pendiente a propósito: eso era el rediseño, no los defectos.

Levantamiento del estado actual de la sección de evaluaciones, de punta a punta, como
insumo para el rediseño. Todo lo que aquí se afirma está verificado contra el stack
local corriendo (frontend `:3000`, backend `:8081`, Mongo en Docker `sostek-mongo`) con
las 6 evaluaciones reales sembradas desde las Google Sheets.

---

## 1 · Mapa de la sección

Tres pantallas encadenadas, más un desvío final hacia APRENDE:

```
/tab3                          lista de evaluaciones (Tab3)
   └─ /Evaluation/:name/:id    cuestionario completo (Evaluation)
        └─ /score/:name        resultado (FinalScoreEvaluation)
             └─ /MainMenu      "Artículos recomendados" → APRENDE con búsqueda precargada
```

`App.tsx:66` marca el tab EVALÚATE como activo en las tres rutas
(`/tab3`, `/Evaluation/*`, `/score/*`), así que la barra inferior no se apaga al entrar.

### Archivos

| Archivo | Rol |
| --- | --- |
| `src/pages/tab3/Tab3.tsx` | Lista + filtros por carrera + caché |
| `src/pages/tab3/Tab3.css` | 71 líneas. Grid y skeleton |
| `src/components/EvaluationCard.tsx` | Tarjeta de cada evaluación |
| `src/components/EvaluationCard.css` | Estilo de la tarjeta |
| `src/pages/evaluation/Evaluation.tsx` | Cuestionario y cálculo del puntaje final |
| `src/pages/evaluation/Evaluation.css` | 57 líneas |
| `src/components/QuestionTestCard.tsx` | Una pregunta con sus opciones |
| `src/components/QuestionTestCard.css` | Estilo de pregunta y checkbox |
| `src/pages/finalScoreEvaluation/FinalScoreEvaluation.tsx` | Pantalla de resultado |
| `src/pages/finalScoreEvaluation/FinalScoreEvaluation.css` | 93 líneas |
| `src/utils/scoring.ts` | Feedback, acumulación, categorías, máximo |
| `src/context/AppContext.tsx` | Estado global del puntaje en curso |
| `src/api/content.ts` | `getEvaluations()` / `getEvaluation(id)` |
| `src/api/user.ts` | `saveScore(score_test)` |
| `src/__tests__/scoring.test.ts` | 11 tests de `utils/scoring` |

Compartidos con el resto de la app: `AppBarPopOver` (barra superior),
`.filter-pills` / `.filter-pill` (`App.css:270-303`, compartido con `ArticleCarrousel`),
`.shimmer` (`App.css:238`), `.app-dark-bg` (`App.css:37`).

---

## 2 · Backend

### Modelo — `Sostek-backend/src/models/contentModel.ts:14-19`

```js
EvaluationSchema = { name, career, description (default ''), questions[] }
QuestionSchema   = { category, text, options[] }
OptionSchema     = { text, value:Number }
```

`career` es un enum de tres valores: `'Arquitectura' | 'Diseño Industrial' | 'Otros'`.

### Endpoints — `Sostek-backend/src/index.ts`

| Ruta | Auth | Qué devuelve |
| --- | --- | --- |
| `GET /evaluations` (`:326`) | **pública** | Todas, **sin** el arreglo `questions`, con `question_count` añadido |
| `GET /evaluations/:id` (`:343`) | **pública** | La evaluación completa, con preguntas y valores |
| `POST /user/score` (`:223`) | **requiere JWT** | Guarda `score_test` en el usuario |

Dos notas sobre el guardado:

- `POST /user/score` hace `findOneAndUpdate` sobre un único campo `score_test`
  (`authModel.ts:42`). **Se sobrescribe**: no hay historial, ni fecha, ni referencia a
  qué evaluación se respondió. El puntaje de Arquitectura N3 pisa al de Diseño N1.
- `GET /evaluations/:id` es pública y trae los `value` de cada opción. Las respuestas
  correctas viajan al cliente antes de que el usuario conteste. Para una herramienta de
  autodiagnóstico eso es aceptable, pero conviene saberlo.

### Siembra — `seed/seedEvaluations.js`

Los 6 IDs de Google Sheets están hardcodeados (`:7-14`). Cada hoja aporta tres pestañas
(`Preguntas`, `Respuestas`, `Puntos`) que se cruzan por índice de fila y columna en
`buildQuestions()`. `description` nunca se escribe, por eso queda en `''`.

### Datos reales sembrados

| Evaluación | Preguntas | Categorías | Opciones/pregunta | Valores usados |
| --- | --- | --- | --- | --- |
| Arquitectura N1 | 23 | ECOSISTEMA, Economía y sociedad | 4–5 | 0,1,2,3 |
| Arquitectura N2 | 24 | ECOSISTEMA, Sociedad y Economía | 3–5 | 0,1 |
| Arquitectura N3 | 21 | ECOSISTEMA, Sociedad y Economía | 3–5 | 0,1,2 |
| Diseño Industrial N1 | 22 | ECOSISTEMA, Economía y sociedad | 2 | 0,4,5 |
| Diseño Industrial N2 | 22 | ECOSISTEMA, Sociedad y Economía | 2 | 0,4,5 |
| Diseño Industrial N3 | 25 | ECOSISTEMA, Sociedad y Economía | 2–5 | 0,1,2,3,4 |

Dato relevante para el rediseño: **todas tienen exactamente 2 categorías**, pero el
nombre del segundo eje no está normalizado — unas dicen "Economía y sociedad" y otras
"Sociedad y Economía". Y **ninguna evaluación usa `career: 'Otros'`**, así que ese filtro
de la UI siempre sale vacío.

---

## 3 · Pantalla 1 — la lista (`/tab3`)

### Carga y caché

`Tab3.tsx:30-46` sigue el patrón "cache-first" de Tab1:

1. Lee `localStorage["evaluations"]` y pinta de inmediato si hay algo.
2. Pide `/evaluations` y sobrescribe estado y caché.

La caché **no expira ni se invalida nunca**. Solo se limpia con
`localStorage.clear()` en `Profile.tsx:111` (al borrar la cuenta).

### Filtros

`Tab3.tsx:16-21` define 4 pills (`Todos / Arquitectura / Diseño / Otros`). El filtrado
compara `ev.career` contra literales en español (`Tab3.tsx:51-53`), y el orden es
alfabético por `name` (`:49`).

### Tarjeta — `EvaluationCard.tsx`

Acento verde de 3px arriba, icono por carrera, badge con la carrera, título,
descripción y conteo de preguntas. Navega con `href={/Evaluation/${name}/${id}}`.

### Medido en la app corriendo, viewport 1440×900

```
.filter-pills    ancho 1440   (izquierda en x=0)
.evaluation-grid ancho  720   (izquierda en x=360)
tarjeta          ancho  223
el contenido termina en y=389 de 900px de alto
```

---

## 4 · Pantalla 2 — el cuestionario (`/Evaluation/:name/:id`)

`Evaluation.tsx` pide la evaluación completa, pinta un skeleton de 3 preguntas mientras
carga y luego renderiza **todas** las preguntas de corrido en una sola página, con un
botón "Obtener resultados" al final.

Cada pregunta es un `QuestionTestCard` con `IonCheckbox` por opción. Medido a 1440px:
23 preguntas, **108 checkboxes**, tarjetas de **1393px de ancho**.

Lo que no existe en esta pantalla:

- Indicador de progreso, numeración de avance o paginación, en un formulario de 21 a 25 preguntas.
- Botón de regreso a la lista (solo el logo, que va a `/MainMenu`, otra pestaña).
- Estado de error: si `getEvaluation` falla, `evaluation` queda `null`, `loading` pasa a
  `false` y se renderiza el título, un contenedor de preguntas **vacío** y el botón de
  enviar (`Evaluation.tsx:89-115`). No hay mensaje.
- Validación: se puede enviar sin contestar nada.

---

## 5 · Pantalla 3 — el resultado (`/score/:name`)

`FinalScoreEvaluation.tsx` **no recibe nada por props ni por contexto**: lee todo de
`sessionStorage`, que `Evaluation.setFinalScore()` acaba de escribir. Muestra puntaje,
un `/máximo`, título y mensaje de `getFeedback`, la categoría más débil, y un CTA.

Si hay token, dispara `saveScore(finalScore)` (`:37-42`) — fire-and-forget: un fallo
solo va a `console.error`, el usuario no se entera.

Medido a 1440px: `.score-card` ocupa **1400px de ancho** con el texto en una columna
central, y deja ~480px de vacío debajo.

Solo hay **un** camino de salida ("Artículos recomendados"), y está dentro del bloque
condicional `weakestCategory && …` (`:64-88`). Si esa categoría viene vacía, la pantalla
queda **sin ninguna acción** — y con ella se pierde la única llamada a
`clearScoreSession()` de toda la app.

No se muestra el desglose por categoría, aunque **ya está calculado y guardado**
(`category0/categoryScore0`, `category1/categoryScore1`). Solo se usa para sacar el mínimo.

---

## 6 · Estado, contexto y almacenamiento

### `AppContext` (`src/context/AppContext.tsx`)

Provider único en la raíz de la app (`App.tsx:116`). De sus 5 campos, la sección de
evaluaciones usa dos:

| Campo | Quién escribe | Quién lee |
| --- | --- | --- |
| `score` | `addScore` | `Evaluation.setFinalScore` |
| `currentAnswersAndScores` | `addScore` | `Evaluation.setFinalScore` |
| `search` | `changeSearch` | `ArticleCarrousel` (el CTA final lo usa) |

`addScore` delega en `applyAnswer` (`utils/scoring.ts:31`), que funciona como *toggle*:
si la respuesta ya está en el mapa la quita y resta su valor; si no, la agrega y suma.
La clave del mapa es la concatenación `pregunta + opción + puntos`.

### Claves de almacenamiento

| Clave | Dónde | Escrita en | Vida |
| --- | --- | --- | --- |
| `evaluations` | localStorage | `Tab3.tsx:41` | permanente, nunca expira |
| `finalScore` | sessionStorage | `Evaluation.tsx:69` | hasta `clearScoreSession` |
| `maxScore` | sessionStorage | `Evaluation.tsx:70` | ídem |
| `totalCategories` | sessionStorage | `Evaluation.tsx:64` | ídem |
| `category{i}` / `categoryScore{i}` | sessionStorage | `Evaluation.tsx:66-67` | ídem |
| `token` / `login` | sessionStorage | login | sesión |

---

## 7 · Cómo se calcula el puntaje — la cadena completa

```
IonCheckbox.onIonChange
  → addScore(category, `pregunta+opción+puntos`, index)             QuestionTestCard.tsx:37
  → applyAnswer(...)  suma o resta al score del contexto            scoring.ts:31
  → [botón] setFinalScore()  agrupa por categoría → sessionStorage  Evaluation.tsx:52
  → FinalScoreEvaluation lee sessionStorage → getFeedback(score)    scoring.ts:8
  → saveScore(score) → POST /user/score → User.score_test
```

---

## 8 · Hallazgos

Ordenados por gravedad. Los tres primeros comprometen el resultado que ve el usuario.

### A · El puntaje suma el **índice** de la opción, no su valor · crítico

> **Resuelto en `f29d65b`.** `addScore` recibe `Number(points[index])`. Verificado: las mismas
> dos opciones que producían 3 ahora producen 2.

`QuestionTestCard.tsx:37` pasa `index` como tercer argumento de `addScore`:

```tsx
onIonChange={(_e) => addScore!(category!, `...`, index)}
//                                               ^^^^^  ← esto se usa como "los puntos"
value={Number(points![index])}   // línea 40: el valor real solo vive como atributo del checkbox; nadie lo lee
```

`addScore(category, answer, value)` usa ese tercer argumento como los puntos a sumar.
O sea: marcar la 1ª opción suma 0, la 2ª suma 1, la 3ª suma 2… sin importar lo que diga
la columna `Puntos` de la Google Sheet.

**Verificado en la app corriendo.** En Arquitectura N1 marqué la opción 0 de la pregunta 1
(valor real 1) y la opción 3 de la pregunta 2 (valor real 1). El puntaje correcto sería **2**.
La app guardó `finalScore = 3`, que es exactamente `0 + 3`, la suma de los índices.

Consecuencia de fondo: el orden en que la hoja de cálculo lista las respuestas pasa a
decidir la calificación. En las evaluaciones de Diseño Industrial, donde las opciones son
solo dos y valen 0 o 5, el rango real de cada pregunta se aplasta a 0 o 1.

### B · El denominador está en otra escala que el numerador · crítico

> **Resuelto en `f29d65b`** — la coherencia sale del arreglo A, que deja numerador y
> denominador en la misma unidad — **y `3ee36a3`**, que hace exacto el viaje por
> `sessionStorage`. Decisión tomada: el máximo sigue siendo la suma de todas las opciones
> positivas, porque las preguntas son de selección múltiple y ese techo sí es alcanzable.
> Verificado: 100/100 en Diseño Industrial N1.

La pantalla muestra `{score}/{maxScore}`. Pero `maxScore` viene de `computeMaxScore`
(`scoring.ts:73`), que suma **el valor real** de todas las opciones positivas, mientras
que `score` es la suma de índices del hallazgo A. Son dos unidades distintas en la misma
fracción. Verificado: la pantalla mostró **"3/96"**.

Además `computeMaxScore` supone que se pueden marcar *todas* las opciones de *todas* las
preguntas. El techo alcanzable eligiendo la mejor opción de cada pregunta es mucho menor:

| Evaluación | `maxScore` mostrado | Techo real (1 mejor opción por pregunta) | Techo del puntaje que la app produce hoy |
| --- | --- | --- | --- |
| Arquitectura N1 | 96 | 26 | 202 |
| Arquitectura N2 | 92 | 24 | 213 |
| Arquitectura N3 | 86 | 33 | 167 |
| Diseño Industrial N1 | 100 | 100 | **22** |
| Diseño Industrial N2 | 100 | 100 | **22** |
| Diseño Industrial N3 | 92 | 59 | 95 |

En Arquitectura el puntaje puede **superar** su propio máximo. En Diseño Industrial jamás
puede acercársele.

### C · Los umbrales de feedback no corresponden a ninguna escala real · crítico

> **Resuelto en `b3bbe29`.** Los cortes pasan a 85/70/50/30 % de `maxScore`. Diseño Industrial
> N1 contestada perfecto ahora da "¡Excelente!" en vez de "Por mejorar".

`getFeedback` (`scoring.ts:8`) corta en 150 / 120 / 90 / 50. Cruzando con la última
columna de la tabla anterior: en **Diseño Industrial N1 y N2 el techo es 22**, así que un
alumno que conteste perfecto recibe igual *"Por mejorar — Tu proyecto necesita replantear
su enfoque de sostenibilidad"*. Es imposible obtener otro mensaje en esas dos evaluaciones.

Los 11 tests de `scoring.test.ts` pasan, porque prueban los umbrales contra números
inventados (10, 20, 100) y nunca contra los datos reales.

### D · Las descripciones de las tarjetas nunca se ven · alto

> **Resuelto en `62c1852`.** `||` en lugar de `??`. Las 6 tarjetas muestran su descripción.

`EvaluationCard.tsx:14-39` define 6 descripciones escritas a mano. La línea 50 hace:

```tsx
const displayDescription = description ?? meta.description;
```

`??` solo cae al respaldo con `null`/`undefined`. El backend manda `description: ''`
(default del esquema, el seed nunca lo llena), y **la cadena vacía no es nullish**, así que
gana `''`. Verificado: las 6 tarjetas renderizan `.evaluation-card__desc` con texto vacío.
Se ve en tu captura — entre el título y "23 preguntas" hay un hueco y nada más.

Esas 6 descripciones son, hoy, código muerto.

### E · El puntaje se acumula entre evaluaciones · alto

> **Resuelto en `2cf6fe6`.** Las respuestas pasan a estado local de `Evaluation`, se vacían al
> cambiar de `id`, el puntaje se deriva del mapa y las casillas son controladas.
> **Verificado end-to-end**, que era justo lo que había quedado pendiente en la §10: el ancla
> de `ion-card` vive en su shadow root, y clickeándola ahí la navegación sí ocurre. Marcando
> 3 casillas en Arquitectura N1 y entrando a N3 sin recargar, la segunda abre en 0, sin
> casillas marcadas y con su propio `maxScore` (86).

`score` y `currentAnswersAndScores` viven en el provider de la raíz, que nunca se
desmonta durante la navegación. No existe ninguna vía para regresarlos a cero: el único
lugar que los escribe es `addScore`, y la interfaz del contexto (`AppContext.tsx:4-14`)
no expone ningún reset. `clearScoreSession` limpia `sessionStorage`, no el contexto — y
además solo corre al pulsar "Artículos recomendados".

Así que quien conteste una evaluación y luego entre a otra sin recargar la página arrastra
el puntaje anterior. Lo comprobé parcialmente: al salir a `/tab3` y volver, la página del
cuestionario **seguía montada con su checkbox marcado** y al enviar reprodujo el mismo
puntaje. El aislamiento entre dos evaluaciones distintas no lo pude reproducir de punta a
punta sin navegador real (ver §10), pero por construcción del código no hay camino de reset.

### F · El CTA "Artículos recomendados" no encuentra nada · medio

> **Resuelto en `78fcde8`**, con una salvedad. Las llaves pasan a las categorías reales y la
> búsqueda mira `tags` + `category` + `title`, porque `seedArticles.js` llena `tags` y nunca
> `category`. **No verificado end-to-end**: la colección de artículos está vacía en local.

`ArticleCarrousel.tsx:40-43` traduce el eje débil a categorías de artículo:

```tsx
const CATEGORY_RECOMMENDATIONS = {
  [normalize('Ambiental')]:          [normalize('Ambiental')],
  [normalize('Económico y Social')]: [normalize('Económico'), normalize('Social')],
};
```

Las categorías que realmente traen las evaluaciones son `ECOSISTEMA`,
`Economía y sociedad` y `Sociedad y Economía`. **Ninguna de las tres coincide con esas dos
llaves.** El mapa nunca acierta y se cae al filtro genérico de la línea 64
(`categoría.includes(término) || título.includes(término)`), buscando la cadena literal
"ecosistema" en el título o la categoría de los artículos.

El comentario del código dice que las evaluaciones miden los ejes "Ambiental" y
"Económico y Social". Los datos sembrados los llaman de otra forma. Alguien renombró de
un lado y no del otro.

### G · Un fallo de red se reporta como "no hay resultados" · medio

> **Resuelto en `10b66ec`.** Cubre el rechazo de la promesa y también `success: false`, que
> también pasaba en silencio. Con caché servida no se muestra el error. Verificado bloqueando
> `*/evaluations*` por CDP, sin tocar ningún puerto del sistema.

`Tab3.tsx:44` hace `.catch(err => console.error(err))` y nada más. Sin caché previa, la
lista queda vacía y el usuario lee *"No hay evaluaciones para este filtro."* — que le
echa la culpa al filtro. Es justo el estado de error que JUEGA sí recibió en la sesión
pasada y que esta pestaña nunca tuvo.

### H · El filtro "Otros" siempre está vacío · bajo

> **Resuelto en `ecc332e`.** Las pills se derivan de las carreras presentes en los datos.

Ninguna de las 6 evaluaciones usa `career: 'Otros'`. La pill existe y al pulsarla siempre
muestra el mensaje de vacío.

### I · Detalles menores

- `getCareerMeta(name, career)` (`EvaluationCard.tsx:41`) recibe `career` y no lo usa.
- Cuando `filtered.length === 0`, se renderizan **las dos cosas**: el `.evaluation-grid`
  vacío y el mensaje (`Tab3.tsx:89-99`).
- `Evaluation.tsx:64-69` guarda números con `.toLocaleString()` y
  `FinalScoreEvaluation` los relee con `Number(...)`. Con puntajes de tres cifras funciona,
  pero a partir de 1000 `toLocaleString()` mete separador de miles y `Number("1,234")`
  devuelve `NaN`. Hoy no se dispara; es una trampa latente.
- Las respuestas son `IonCheckbox`, o sea multi-selección, incluso en preguntas
  claramente de opción única ("¿Cómo se identifica a la fauna nativa?" con 5 opciones
  escalonadas). Nada en la UI dice cuántas se pueden marcar.
- Las rutas llevan el nombre visible dentro de la URL
  (`/Evaluation/Arquitectura%20Nivel%201/:id`, `/score/Arquitectura%20Nivel%201`).
  Renombrar una evaluación rompe cualquier enlace guardado.
- El usuario invitado puede contestar todo y al final no se guarda nada, sin aviso previo.

---

## 9 · Observaciones de layout para el rediseño

Las tres pantallas fueron diseñadas para móvil y ninguna tiene una escalera de breakpoints
como la que se construyó para JUEGA. A 1440px:

| Pantalla | Ancho del contenido | Problema |
| --- | --- | --- |
| `/tab3` | grid **720px** / pills **1440px** | El tope está en `Tab3.css:65-71` y aplica **solo al grid**. Los filtros quedan pegados al borde izquierdo y las tarjetas flotando al centro: dos alineaciones distintas en la misma pantalla, visible en tu captura. Las tarjetas se comprimen a 223px y el contenido termina a 389px de 900. |
| `/Evaluation/:id` | **1393px**, sin tope | El extremo opuesto: cada opción es una fila a todo lo ancho con el checkbox a la izquierda y ~1100px vacíos a su derecha. Un formulario de 23 preguntas y 108 casillas de corrido, sin progreso ni referencia de avance. |
| `/score/:name` | **1400px**, sin tope | Un recuadro gigante alrededor de una columna de texto centrada, con ~480px muertos abajo. |

Otros puntos para considerar en el rediseño, sin salir de lo que ya existe:

- La lista no tiene encabezado propio: no hay título ni bajada que diga qué es EVALÚATE ni
  cómo funciona. La página abre directo en las pills.
- Las tarjetas no distinguen nivel 1 de nivel 3 más que por el texto del título, ni
  sugieren un orden o progresión entre ellas.
- No hay ningún indicador de "ya contestaste esta" — y el backend ya guarda un
  `score_test`, aunque hoy sea uno solo y sin referencia a la evaluación.
- El desglose por categoría ya se calcula y se guarda; mostrarlo en la pantalla de
  resultado no requiere backend nuevo.
- La pantalla de resultado tiene una sola salida, y va a *otra pestaña*. No se puede
  volver a la lista ni repetir la evaluación.

---

## 10 · Lo que no pude verificar

- **El aislamiento del puntaje entre dos evaluaciones distintas** (hallazgo E). La
  navegación cliente entre tarjetas no me respondió en Chrome headless: el outlet de Ionic
  dejó la página anterior montada y los clics sobre las tarjetas no cambiaron de ruta. Lo
  que sí verifiqué es que el estado sobrevive a la navegación y que el código no tiene
  camino de reset. Falta confirmarlo a mano en Chrome normal: contestar una evaluación,
  volver a la lista, entrar a otra **sin recargar**, y mirar el puntaje inicial.
- **El comportamiento con `/articles` poblado.** En local esa colección está vacía (falta
  `articles.csv`), así que el CTA "Artículos recomendados" no se puede probar contra datos
  reales. El desajuste de categorías del hallazgo F está verificado por código, no por
  ejecución.
- **El guardado en el perfil.** No corrí el flujo completo autenticado hasta
  `POST /user/score`; el endpoint y el modelo están leídos, la ejecución no.

---

## 11 · Referencia rápida

```bash
docker start sostek-mongo
cd Sostek-backend && PORT=8081 npm run start     # 8080 lo ocupa SearXNG
cd Sostek         && npx ionic serve --external -p=3000
```

`Sostek/.env` apunta hoy a `http://localhost:8081`. Usuario de prueba local:
`prueba@local.test` / `prueba12345`.

Las capturas de las pantallas 2 y 3 a 1440px se tomaron en el scratchpad de la sesión;
la carpeta `Claude images/` solo tiene las 4 de JUEGA del 7 de septiembre.
