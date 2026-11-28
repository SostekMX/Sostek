# Anatomía de Sostek

> Cómo dos repositorios separados, una base de datos en la nube y tres capas de
> almacenamiento en el navegador se combinan para formar una sola aplicación.

| | |
|---|---|
| **Repos** | `SostekMX/Sostek` (frontend) · `Sostek-backend` |
| **Puertos locales** | 3000 ↔ 8080 |
| **Datos** | MongoDB Atlas + Cloudinary |

Este documento es una investigación del sistema completo, escrita leyendo el código
de ambos repos. Complementa a los otros:

- `ONBOARDING_FRONTEND.md`: cómo empezar (incluye «Tus primeros 30 minutos») y qué no romper
- `AVANCE_SOSTEK.md`: estado actual, con qué está hecho, qué falta y los bugs
- `API_CONTRACTS.md`: el contrato de cada endpoint
- `DESPLIEGUE.md`: cómo llega cada pieza a producción, sus variables y cómo hacer rollback
- `ACCESOS.md`: las cuentas del proyecto y cómo pedir acceso
- **este archivo**: cómo encajan las piezas entre sí

---

## Contenido

1. [Las dos mitades](#1-las-dos-mitades)
2. [El contrato entre ellas](#2-el-contrato-entre-ellas)
3. [Dónde viven los datos](#3-dónde-viven-los-datos)
4. [Recorrido de una petición](#4-recorrido-de-una-petición)
5. [Las tres capas del navegador](#5-las-tres-capas-del-navegador)
6. [Autenticación](#6-autenticación)
7. [Por qué existe el backend](#7-por-qué-existe-el-backend)
8. [Local y producción](#8-local-y-producción)
9. [Fricciones reales](#9-fricciones-reales)
10. [Diseño](#10-diseño)

---

## 1. Las dos mitades

Sostek es una plataforma educativa de sostenibilidad para estudiantes y docentes de la
facultad. Lo que el usuario ve como una app es en realidad **dos programas distintos**
que corren por separado y se hablan por HTTP.

### Repositorio 1 — `Sostek` (frontend)

Ionic React 6 + TypeScript, empaquetado con Create React App y envuelto en Capacitor 4
para poder salir como app de iOS y Android desde el mismo código.

**Su responsabilidad:** pintar la interfaz, guardar la sesión del usuario en el
navegador, cachear contenido para que la app abra rápido y calcular el puntaje de las
evaluaciones. No sabe nada de bases de datos.

### Repositorio 2 — `Sostek-backend`

Node.js + Express 4 + Mongoose 6. Tiene un solo archivo de rutas, `src/index.ts`, de unas 560 líneas, y
dos archivos de modelos. Todo se escribe en TypeScript, y `npm run build` genera los `.js`
que corre el servidor.

**Su responsabilidad:** ser la única puerta a la base de datos. Valida entradas, hashea
contraseñas, firma y verifica tokens, sube imágenes a Cloudinary y devuelve JSON.
No pinta nada.

### Por qué separados

La separación no es cosmética. El frontend puede desplegarse como sitio estático en
cualquier CDN porque es solo HTML, CSS y JavaScript; el backend necesita un servidor
vivo con conexión a Mongo. Son dos ciclos de vida distintos, dos despliegues distintos
y —esto es lo que importa para trabajar— **dos repositorios que hay que clonar y correr
por separado**.

---

## 2. El contrato entre ellas

Todo lo que une a los dos repos cabe en tres decisiones: una variable de entorno, una
lista de orígenes permitidos y una forma fija de respuesta.

### La variable que apunta

El frontend no tiene ninguna URL de backend escrita en el código de las páginas.
Todo pasa por un solo archivo:

```ts
// src/config.ts
export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
```

Ese valor alimenta una única instancia de axios en `src/api/client.ts`. Cambiar a qué
backend apunta la app entera es cambiar una línea del `.env`. La disciplina es
deliberada: hubo un trabajo explícito de sacar las URLs regadas por 15 archivos y
centralizarlas aquí.

### La lista que deja pasar

Del otro lado, el backend decide quién puede hablarle. La lista de desarrollo está
escrita en el código, no en el `.env`:

```ts
// src/index.ts:30
const corsOrigins = ['http://localhost:3000', 'http://localhost:8100'];
if (process.env.CORS_ORIGIN) corsOrigins.push(...process.env.CORS_ORIGIN.split(',').map(o => o.trim()));
```

Por eso en local no hay que configurar CORS: `localhost:3000` y `localhost:8100`
(el puerto por defecto de `ionic serve`) ya vienen permitidos. `CORS_ORIGIN` solo
existe para agregar los dominios de producción; hoy es `https://sostek.vercel.app`.
Un origen que no esté en la lista no puede pedir **nada** al backend, ni siquiera el contenido
público: la app abre, pero se queda vacía.

### La forma de toda respuesta

Cada endpoint responde con un objeto que siempre trae una bandera `success`:

```json
{ "success": true,  "articles": [ ] }
{ "success": false, "error": "Correo o contraseña incorrectos" }
```

Consecuencia que conviene interiorizar: **el backend casi nunca devuelve un código de
error HTTP**. Un login fallido llega como `200 OK` con `success: false`. Por eso en el
frontend el patrón nunca es `try/catch` a secas sino `if (data.success)`. Un `.catch()`
de axios aquí solo se dispara si la red se cayó o el servidor no está.

---

## 3. Dónde viven los datos

No hay una sola base de datos. Hay cuatro lugares donde persiste información, cada uno
por una razón distinta.

```
┌──────────────────────┐   HTTP + JSON    ┌──────────────────────┐   Mongoose   ┌────────────────────────┐
│  Navegador / App     │ ───────────────► │  Servidor Express    │ ───────────► │  MongoDB Atlas         │
│  Ionic React         │                  │  rutas · JWT         │              │  users · articles      │
│  + Capacitor         │ ◄─────────────── │  validación          │              │  evaluations           │
│  localhost:3000      │  { success: … }  │  localhost:8080      │ ──┐          │  presentations         │
└──────────┬───────────┘                  └──────────────────────┘   │          │  tutorial              │
           │                                                          │          └────────────────────────┘
           │                                                          │  SDK
┌──────────┴───────────┐                                              └────────► ┌────────────────────────┐
│  EN EL DISPOSITIVO   │                                                         │  Cloudinary            │
│  sessionStorage      │   El navegador nunca habla con Mongo.                   │  avatares e imágenes   │
│  localStorage        │   Todo pasa por el servidor.                            └────────────────────────┘
│  (se pierde al       │
│   limpiar el         │
│   navegador)         │
└──────────────────────┘
```

El navegador solo conoce una dirección: la del backend. Las credenciales de Mongo y de
Cloudinary viven únicamente en el `.env` del servidor y nunca viajan al cliente.

### Las seis colecciones

Mongoose define dos archivos de modelos que se reparten la base `SostekDB`. Detalle de
diseño que vale notar: cada esquema fija su nombre de colección explícitamente en vez
de dejar que Mongoose lo pluralice solo.

| Colección | Qué guarda | Quién escribe |
|---|---|---|
| `users` | Nombre, correo, contraseña hasheada, fecha de nacimiento, ocupación, género, puntajes, avatar, favoritos y token de recuperación | La app, cuando alguien se registra o edita su perfil |
| `articles` | Título, subtítulo, cuerpo, imágenes, autor, categoría, etiquetas y bibliografía | `seed:content`, desde `seed/content/articles.json`. La app solo lee |
| `evaluations` | Nombre, carrera, descripción y las preguntas anidadas con sus opciones y valores | `seed:content`, desde `seed/content/evaluations.json` |
| `presentations` | Nombre, portada y un arreglo de URLs de slides | `seed:content`, desde `seed/content/presentations.json` |
| `tutorial` | Un único documento: título, reglas y las cartas del juego con sus recursos ambiental, económico y social | `seed:tutorial`, desde `seed/tutorial_data.json` |
| `quizzes` | Un documento por nivel (1 a 3) y tipo de proyecto (Modelo de Negocio o Empresa Rentable). Trae los bloques, las preguntas con su peso (4 o 5) y las opciones con su escalón de 0 a 3, más los 5 tramos de retroalimentación final | `seed:quiz`, desde `seed/quiz_data.json`, con upsert por nivel y tipo |

De ahí sale una división limpia:
- **El contenido es de solo lectura desde la app.** Vive versionado en los JSON de `seed/` del backend y se carga con los seeds.
- **Los datos de usuario son de lectura y escritura.** Son lo único que la app modifica.

No existe panel de administración ni endpoint para crear artículos: el contenido nuevo se
agrega a los JSON y se carga con `npm run seed:content`.

### Por qué Cloudinary y no Mongo

Cuando alguien sube una foto de perfil, el archivo no entra a la base de datos. Multer
lo recibe en memoria con un tope de 5 MB, lo filtra por tipo (solo jpg, png o webp), lo
manda a Cloudinary a la carpeta `sostek/avatars`, y lo único que se guarda en Mongo es
la URL resultante en el campo `avatar` del usuario. Las imágenes de artículos y las
slides de presentaciones siguen el mismo patrón: en Mongo hay strings de URL, no
binarios.

---

## 4. Recorrido de una petición

Secuencia real, en orden: qué pasa desde que alguien escribe su contraseña hasta que sus
favoritos aparecen en pantalla. Si entiendes estos ocho pasos, entiendes el sistema
completo.

**1. El usuario envía sus credenciales.**
`LogIn.tsx` llama a `login(email, password)` de `src/api/auth.ts`. Ninguna página usa
axios directamente — es una regla del proyecto, y existe justo para que el paso 4
funcione siempre.

**2. El backend verifica y firma.**
`POST /user/login` busca el usuario, compara con `bcryptjs.compareSync` y, si coincide,
firma un JWT con `{ id, email }` como carga útil, secreto `JWT_CODE` y vigencia de
7 días. El endpoint está detrás de un limitador de 10 intentos cada 15 minutos.

**3. El token se guarda y la sesión se marca.**
El frontend guarda tres cosas: el token en `sessionStorage`, la bandera `login: 'true'`
también en `sessionStorage`, y el correo en `localStorage` solo para mostrarlo. La
bandera y el token son deliberadamente cosas distintas.

**4. El interceptor toma el relevo.**
A partir de aquí nadie vuelve a tocar el token a mano. El interceptor de
`api/client.ts` lee `sessionStorage` en cada petición y agrega
`Authorization: Bearer …` automáticamente. Es la razón por la que `src/api/` tiene que
ser el único punto de salida HTTP.

**5. La ruta privada deja pasar.**
Al navegar a `/Favorites`, `PrivateRoute` revisa
`sessionStorage.getItem('login') === 'true'` y si no, redirige a `/`. Es un guardia de
interfaz, no de seguridad: la seguridad real ocurre en el paso siguiente.

**6. El middleware valida el token.**
`verifyToken` extrae el token del encabezado, lo verifica contra `JWT_CODE` y deposita
la carga útil en `req.user`. Si falla, responde `success: false` sin llegar nunca al
controlador.

**7. La consulta usa el correo del token.**
Aquí está la decisión de seguridad más importante del backend: **toda consulta en
nombre de un usuario filtra por `req.user.email`, jamás por un correo que venga en el
cuerpo de la petición**. Por eso nadie puede editar el perfil de otra persona mandando
su correo.

**8. La respuesta vuelve y el hook la reconcilia.**
`useFavorites` recibe el arreglo, lo pone en estado y a partir de ahí hace actualización
optimista: al marcar un favorito actualiza la lista local de inmediato y manda la
petición en paralelo, sin esperar la confirmación.

---

## 5. Las tres capas del navegador

El detalle más particular de este proyecto es que hay tres almacenes distintos del lado
del cliente, y la elección de cuál usar para cada dato es intencional en cada caso.

| Almacén | Qué guarda | Vive hasta | Por qué ahí |
|---|---|---|---|
| `sessionStorage` | Token JWT, bandera `login`, búsqueda activa, puntaje de la última evaluación y resultado del último quiz (`sostekQuiz.result.v2`) | Que se cierre la pestaña | El token estaba en `localStorage` y se movió a propósito: reduce la ventana en que una sesión queda viva en un equipo compartido |
| `localStorage` | Caché de artículos, presentaciones, evaluaciones y quizzes (`quiz.v2`); URL y recorte del avatar; correo para mostrar | Que alguien limpie el navegador | Es lo que hace que la app abra con contenido en pantalla antes de que responda la red |
| MongoDB | Perfil, contraseña, puntajes y favoritos | Siempre | Es lo único que sobrevive al dispositivo y sigue al usuario a otro equipo |

### El patrón de caché

Las pantallas de contenido siguen exactamente la misma coreografía, y vale la pena
reconocerla porque se repite en `Tab1`, `Tab3` y `Favorites`:

```ts
// pinta lo que ya había, sin esperar a nadie
const cached = localStorage.getItem("articles");
if (cached) { setArticles(JSON.parse(cached)); setLoadingData(false); }

// y en paralelo pide lo fresco y reemplaza
getArticles().then(data => {
  if (data.success) { setArticles(data.articles); localStorage.setItem("articles", ...); }
});
```

Efecto práctico: **si ya abriste la app una vez con el backend prendido, los tabs siguen
mostrando contenido aunque el backend esté apagado**. Es útil, y también es la fuente de
confusión más común al depurar — puedes estar viendo datos viejos y creer que el
servidor responde.

### El puntaje de las evaluaciones

Caso curioso de esta arquitectura: al contestar una evaluación, las respuestas viven en
el estado de la página y al enviar se vuelcan a `sessionStorage` (`finalScore`,
`maxScore`, `weakestCategory`, `scorePending`). La pantalla de
resultados no recibe nada por props ni por la ruta: **lee todo de vuelta de
`sessionStorage`**. Solo el puntaje final se manda al backend con `POST /user/score`, y
solo si hay sesión. Un invitado puede contestar una evaluación completa y ver su
resultado sin que nada salga del navegador.

El cálculo está en `src/utils/scoring.ts` y tiene tres decisiones a propósito:
- **El máximo es la suma de todas las opciones positivas.** Las preguntas son de selección
  múltiple (casillas), así que ese techo sí se alcanza.
- **La retroalimentación sale del porcentaje del máximo**, con cortes en 85, 70, 50 y 30 %.
  Los máximos van de 86 a 100 según la evaluación, así que un corte fijo en puntos no
  serviría para todas.
- **El eje más débil se elige por porcentaje del máximo de cada eje**, no por la suma: los
  dos ejes de una evaluación valen distinto (en Diseño Industrial N1, 36 contra 64). Los
  ejes salen de las preguntas y no de las respuestas, así que un eje sin ninguna casilla
  marcada también compite, con 0 %.

El nivel de cada evaluación se lee de su nombre (`/nivel\s*(\d+)/i`, en `Tab3.tsx`), porque
`GET /evaluations` no trae ese campo. Los tres niveles son etapas del proyecto, no grados de
dificultad: el 1 revisa el análisis, el 2 el diseño y el 3 la operación a largo plazo. Por eso
la lista no les pone etiquetas como «básico» o «avanzado».

El quiz de proyectos de negocio (`/quiz`) sigue el mismo camino con llave propia: guarda
el resultado completo (global, por bloque y por pregunta) en `sostekQuiz.result.v2` y la
pantalla de resultados lo lee de ahí. No se manda al backend: `score_test` es un solo
número y lo usa la evaluación.

El puntaje del quiz va de 0 a 100 y se suma en tercios exactos. Cada opción tiene un escalón
de 0 a 3 y cada pregunta un peso: 4 si es estándar y 5 si es estratégica. La opción vale
`escalón × peso / 3`, y el total se divide entre 3 solo al final. Así los 1.33 y 1.67 del PDF
de Carlos no se acumulan en un 99.99, y el redondeo a 2 decimales, que es solo para mostrar el
número, nunca cambia el tramo de retroalimentación. Las llaves llevan `.v2` desde que el quiz
tiene pesos y tramos: lo que quede guardado con la forma anterior se ignora.

---

## 6. Autenticación

El backend toma seis decisiones de seguridad que a primera vista parecen descuidos y no
lo son. Conviene conocerlas antes de "arreglarlas".

| Decisión | Razón |
|---|---|
| Los mensajes de error de login son genéricos: mismo texto para correo inexistente y para contraseña equivocada | Evita que alguien pueda averiguar qué correos están registrados probando uno por uno |
| `/user/forgot-password` responde lo mismo exista o no el correo | Misma razón: no filtrar quién tiene cuenta |
| `/user/profile` excluye explícitamente `password`, `reset_token` y `reset_token_expiry` en la proyección | Cualquier endpoint nuevo que devuelva un usuario tiene que repetir ese filtro |
| El correo de `/user/edit` se ignora si viene en el cuerpo | Se quitó del frontend a propósito; el correo se toma siempre del token |
| CORS lista orígenes explícitos, nunca `*` | Poner comodín "para arreglar el error de CORS" abre el backend a cualquier sitio |
| El token de recuperación es `crypto.randomBytes(32)` con una hora de vigencia | De un solo uso: al cambiar la contraseña se pone en `null` |

Además hay tres capas de middleware antes de cualquier ruta: `helmet` para encabezados
de seguridad, `express-mongo-sanitize` contra inyección NoSQL, y `express-validator` con
reglas por endpoint (correo válido, contraseña de 8 a 128 caracteres, longitudes máximas
en cada campo de texto).

**Consecuencia práctica de `JWT_CODE`:** el secreto no se comparte con nadie ni tiene que
coincidir con nada externo, pero sí tiene que ser *estable*. Si cambia en producción,
todos los tokens firmados con el anterior dejan de validar y todo el mundo pierde la
sesión de golpe.

---

## 7. Por qué existe el backend

Esta parte es historia del proyecto, y explica una decisión que de otro modo parecería
trabajo de más.

Al principio no había backend. El frontend leía los artículos, las evaluaciones, las
presentaciones y el tutorial **directamente de Google Sheets y Google Drive** con
`gapi.client` desde el navegador. Funcionaba, pero dependía de llaves de API de Google
atadas a cuentas personales de estudiantes, no institucionales — llaves que expiran, se
revocan y no se pueden heredar al siguiente que agarre el proyecto.

La migración a MongoDB Atlas resolvió eso. Se hizo con scripts que leían de un CSV y de
Google Sheets. Después, el contenido se siguió corrigiendo directo en Atlas: categorías para
las recomendaciones, descripciones, portadas y textos con la codificación rota. Así, esas
fuentes quedaron viejas.

En noviembre de 2026 se exportó el contenido de producción a `seed/content/*.json`, con sus
`_id`, y esos scripts se retiraron. Hoy el contenido vive versionado en el repo del backend:

| Script | Fuente | Qué hace |
|---|---|---|
| `seed:content` | `seed/content/*.json` | Hace upsert por `_id` de artículos, presentaciones y evaluaciones. No borra y conserva los favoritos |
| `seed:quiz` | `seed/quiz_data.json` | Hace upsert por nivel y tipo |
| `seed:tutorial` | `seed/tutorial_data.json` | Reemplaza el documento del tutorial |
| `seed:presentations` | Una carpeta de imágenes | Las sube a Cloudinary y agrega la presentación a `seed/content/presentations.json` |

Conclusión operativa: **para ver la app con el contenido real no necesitas acceso a Atlas.**
`npm run dev:memoria` levanta el backend con una base en memoria ya llena con esos JSON. El
acceso a Atlas solo hace falta para tocar producción, y se pide: ve `ACCESOS.md`.

---

## 8. Local y producción

### En tu máquina

Siempre son dos terminales. Conviene levantar primero el backend, para que el primer render
del frontend ya encuentre datos.

```bash
# terminal 1: Sostek-backend
npm install
npm run dev:memoria       # :8080, MongoDB en memoria con el contenido real; no toca Atlas

# terminal 2: Sostek
npm install
cp .env.example .env      # ya apunta a localhost:8080
npm run start             # ionic serve en :3000
```

`dev:memoria` no necesita `.env`. Si quieres una base que se conserve entre sesiones, el
backend usa un MongoDB local con su `.env` (ve `ONBOARDING_BACKEND.md` §2). En ese caso
solo dos variables impiden que arranque:
- `JWT_CODE`: te lo inventas, y el `.env.example` dice cómo.
- La base de datos.

Si falta alguna, el servidor lo dice al arrancar. Las de correo solo hacen falta para probar
la recuperación de contraseña: sin ellas, el servidor avisa por consola y sigue. Las de
Cloudinary solo sirven para subir avatares y para `seed:presentations`.

Los tests del backend también usan una base en memoria (`mongodb-memory-server`):
`npm test` corre sin `.env`, sin internet y sin tocar Atlas. La primera instalación baja
ese MongoDB: unos 780 MB en Windows y unos 120 MB en Linux o macOS.

### En producción

| Pieza | Dónde vive | Nota |
|---|---|---|
| Frontend (oficial) | `sostek.vercel.app` | Vercel publica `main` solo |
| Backend | `sostek-backend.onrender.com` | Render publica `main` solo. UptimeRobot le pega a `/health` para que no se duerma |
| Datos | MongoDB Atlas y Cloudinary | Si tu backend local usa el `DB_URL` de Atlas, escribe en la base real |
| Frontend en Render (abandonado) | `sostek-frontend.onrender.com` | Se sigue publicando con cada push a `main`, pero CORS no lo deja pasar, así que no carga contenido. Está pendiente de baja |
| Frontend viejo (abandonado) | `sostek.pages.dev` | Cloudflare Pages, con el build anterior al backend. Lo administra un colaborador anterior |

El paso a paso de cada pieza (variables, CORS, rollback) está en `DESPLIEGUE.md`, y de quién
es cada cuenta, en `ACCESOS.md`.

**Migración planeada:** el próximo semestre el backend y la base pasan de Render y MongoDB
Atlas a Supabase. Este documento describe lo que corre hoy.

Cada repo tiene su workflow de GitHub Actions, que corre en cada push y en cada PR a `main`
o a `development`:
- En el frontend, corre los tests y compila el build.
- En el backend, corre los tests (Jest y Supertest) y revisa que los `.js` salgan de los `.ts`.

---

## 9. Fricciones reales

Son cosas que están en el código hoy y que te van a morder si no las conoces de antemano.
No son opiniones de estilo, son trampas concretas.

### Los errores llegan como `200 OK` (*depuración*)

La pestaña Network del navegador te va a mostrar puras respuestas exitosas aunque el
login esté fallando. Hay que abrir el cuerpo de la respuesta y mirar `success`. Un
`.catch()` de axios en el frontend no atrapa errores de negocio, solo caídas de red.

### El servidor corre los `.js`, no los `.ts` (*despliegue*)

En el backend se edita el TypeScript (`src/index.ts`, `src/models/*.ts`) y se regeneran los
`.js` con `npm run build`. Render corre los `.js`. Si solo commiteas el `.ts`, el cambio
nunca llega a producción. Para que no pase en silencio, CI falla si los `.js` no coinciden
con lo que genera `tsc`.

### Local puede escribir en producción (*datos*)

Si el `.env` del backend tiene el `DB_URL` de Atlas, todo lo que hagas en localhost
(registros, favoritos, seeds) escribe en la base real. Los seeds también usan esa base.
Para trabajar sin ese riesgo, usa `npm run dev:memoria`: sobrescribe el `DB_URL` y nunca
toca Atlas.

### El contenido se identifica por su `_id` (*datos*)

Los favoritos guardan el `_id` del artículo o de la presentación, y las URLs de las
evaluaciones llevan el suyo. Si un documento de contenido se borra y se vuelve a crear con
otro `_id`, los favoritos quedan apuntando a nada. Por eso `seed:content` hace upsert y
conserva los `_id` de `seed/content`. No borres documentos para «recargarlos».

### Las categorías conectan evaluaciones y artículos (*datos*)

Al terminar una evaluación, la app recomienda artículos de la categoría más débil. Funciona
porque los dos lados usan los mismos nombres:
- los artículos, `Ambiental`, `Económico` o `Social`;
- las preguntas de las evaluaciones, `Ambiental` o `Económico y Social`.

Un test del backend lo revisa. Si cambias una categoría en un lado, cámbiala en el otro.

### CORS bloquea todo, no solo el login (*producción*)

Un frontend en un dominio que no está en `CORS_ORIGIN` no puede pedir nada al backend,
ni siquiera el contenido público. Por eso el sitio viejo de Render
(`sostek-frontend.onrender.com`) abre pero se queda vacío. Si algún día cambia la URL del
frontend, hay que agregarla a `CORS_ORIGIN` en Render (ve `DESPLIEGUE.md`).

### Ionic no desmonta la página anterior (*estado*)

Al navegar, el outlet de Ionic deja montada la página de la que sales, y su estado de React
sobrevive. Si vuelves, la encuentras como la dejaste. Si solo cambia el parámetro de la ruta
(otra evaluación) o la sesión (otra cuenta), el componente no se vuelve a crear. Por eso:
- el estado que depende de la ruta se reinicia a mano cuando cambia el parámetro, como las
  respuestas de `Evaluation` al cambiar de `id`;
- lo que depende de la sesión se vuelve a pedir al cambiar de cuenta, como los favoritos.

Cuidado también con `ionChange`: Ionic lo emite cuando cambias `checked` desde React, no solo
cuando el usuario toca la casilla. El handler de `QuestionTestCard` ignora los eventos que
piden lo que ya hay; sin esa guardia, vaciar las respuestas volvería a marcar las casillas.

### `ion-card` e `ion-button` esconden su enlace (*diseño y pruebas*)

Con `href`, los dos pintan un `<a>` dentro de su shadow root, y lo que les pones adentro queda
dentro de ese `<a>`. Esto trae dos consecuencias:
- **Un `display: flex` en el `ion-card` no llega a sus hijos.** Para igualar alturas, las
  tarjetas reservan en CSS el alto del título y de la descripción.
- **En una prueba automatizada, `click()` sobre el elemento no navega.** Hay que hacer clic
  en `elemento.shadowRoot.querySelector('a')`.

### El inglés solo cambia lo que se pinta (*idioma*)

`tx()` y `localizeArticle()` (`src/i18n/LanguageContext.tsx`) traducen al pintar. La lógica
sigue leyendo el español: los ejes, la búsqueda de artículos recomendados, el nivel y las
URLs. En `content.en.json`, los artículos se traducen por su `_id`. Todo lo demás
(evaluaciones, cartas, reglas y ejes) se traduce por su texto original en español. Por eso:
- **si cambias un texto en español, su traducción deja de aplicarse sin avisar**, y en inglés
  se ve en español hasta que actualices la llave;
- un artículo nuevo se ve en español hasta que lo agregues a `content.en.json`.

### Vercel trata los warnings como errores (*despliegue*)

Vercel compila con `CI=1`, y con eso Create React App convierte cualquier warning de
ESLint (un import sin usar, por ejemplo) en un error que tumba el deploy. CI del frontend
corre el mismo build, así que el problema aparece en el PR y no al publicar.

---

## 10. Diseño

- **Tokens.** Los colores, la tipografía y los espacios están en `src/theme/variables.css`:
  - fondo verde botella (`--bg`);
  - marfil (`--ivory`) para el texto y la acción principal;
  - liquen (`--lichen`) y el verde de marca (`--moss`) como acentos;
  - un color por eje (`--axis-*`).

  No pongas colores sueltos en el CSS de una pantalla.
- **Tipografía.** Kiona solo tiene mayúsculas, así que se usa en títulos y cifras grandes.
  Para todo lo demás se usa Raleway. El tamaño base crece con la pantalla, de 16 a 21 px
  (`App.css`).
- **Vidrio (Glisse).** Va en lo que flota sobre el fondo:
  - el panel de acceso;
  - la barra lateral y la barra inferior;
  - el menú y el resultado;
  - los controles sobre fotos.

  La lectura y los formularios no llevan vidrio.
- **La refracción de Glisse está apagada a propósito**, con una regla en `App.css`: con unos
  30 vidrios, APRENDE bajaba a 9 fps. Sin ella se ve casi igual. No la vuelvas a encender en
  elementos que estén sobre contenido que se mueve.
- **Movimiento.** Solo la entrada del acceso tiene coreografía; lo demás responde a lo que
  hace el usuario. Se respetan `prefers-reduced-motion`, `prefers-reduced-transparency` y
  `prefers-contrast`.
- **Móvil y escritorio.** Hay tres anchos:
  - abajo de 768 px es la app de celular, con las tabs abajo;
  - de 768 a 1199 px hay un riel de íconos a la izquierda;
  - desde 1200 px, una barra lateral con texto.

  Lo maneja `IonSplitPane`, en `App.tsx`, con `DESKTOP_QUERY` de `useMediaQuery`. La barra
  de tabs sigue montada porque Ionic la necesita, y en escritorio se esconde con CSS. Lo de
  escritorio va dentro de `@media (min-width: 768px)` o en una rama de JSX con
  `useMediaQuery`. **No cambies una regla que ya aplica en móvil para arreglar el
  escritorio**: compara la pantalla a 390 px antes y después.

---

*Basado en la lectura del código de los dos repositorios, `Sostek` y `Sostek-backend`, en
la rama `main`. Actualizado el 27 de noviembre de 2026.*
