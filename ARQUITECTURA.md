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

- `ONBOARDING_FRONTEND.md` — cómo empezar, accesos, qué no romper
- `AVANCE_SOSTEK.md` — estado actual: qué está hecho, qué falta, bugs
- `API_CONTRACTS.md` — el contrato de cada endpoint
- **este archivo** — cómo encajan las piezas entre sí

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

Node.js + Express 4 + Mongoose 6. Un solo archivo de rutas (`src/index.js`, unas 520
líneas) y dos archivos de modelos.

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

```js
// src/index.js:27
const corsOrigins = ['http://localhost:3000', 'http://localhost:8100'];
if (process.env.CORS_ORIGIN) corsOrigins.push(...process.env.CORS_ORIGIN.split(','));
```

Por eso en local no hay que configurar CORS: `localhost:3000` y `localhost:8100`
(el puerto por defecto de `ionic serve`) ya vienen permitidos. `CORS_ORIGIN` solo
existe para agregar los dominios de producción.

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

### Las cinco colecciones

Mongoose define dos archivos de modelos que se reparten la base `SostekDB`. Detalle de
diseño que vale notar: cada esquema fija su nombre de colección explícitamente en vez
de dejar que Mongoose lo pluralice solo.

| Colección | Qué guarda | Quién escribe |
|---|---|---|
| `users` | Nombre, correo, contraseña hasheada, fecha de nacimiento, ocupación, género, puntajes, avatar, favoritos y token de recuperación | La app, cuando alguien se registra o edita su perfil |
| `articles` | Título, subtítulo, cuerpo, imágenes, autor, categoría, etiquetas, bibliografía | Solo los scripts de `seed/`. La app únicamente lee |
| `evaluations` | Nombre, carrera, descripción y preguntas anidadas con sus opciones y valores | Solo `seed/` |
| `presentations` | Nombre, portada y arreglo de URLs de slides | Solo `seed/` |
| `tutorial` | Un único documento: título, reglas y cartas del juego con sus recursos ambiental, económico y social | Solo `seed/` |
| `quizzes` | Un documento por nivel y tipo de proyecto: bloques, preguntas, opciones con puntaje 0–3 y su retroalimentación | Solo `seed/` (`seed:quiz`, upsert por nivel + tipo) |

De ahí sale una división limpia: **el contenido es de solo lectura desde la app** y se
carga por fuera con los seeds; **los datos de usuario son de lectura y escritura** y son
los únicos que la app modifica. No existe ningún panel de administración ni endpoint
para crear artículos.

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
| `sessionStorage` | Token JWT, bandera `login`, búsqueda activa, puntaje de la última evaluación y resultado del último quiz (`sostekQuiz.result`) | Que se cierre la pestaña | El token estaba en `localStorage` y se movió a propósito: reduce la ventana en que una sesión queda viva en un equipo compartido |
| `localStorage` | Caché de artículos, presentaciones, evaluaciones y quizzes (`quiz`); URL y recorte del avatar; correo para mostrar | Que alguien limpie el navegador | Es lo que hace que la app abra con contenido en pantalla antes de que responda la red |
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

El quiz de proyectos de negocio (`/quiz`) sigue el mismo camino con llave propia: guarda
el resultado completo (global, por bloque y por pregunta) en `sostekQuiz.result` y la
pantalla de resultados lo lee de ahí. No se manda al backend: `score_test` es un solo
número y lo usa la evaluación.

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

La migración a MongoDB Atlas resolvió eso. Los scripts de `seed/` son precisamente esa
mudanza, congelada: leen de un CSV o de un Google Sheet y escriben en Mongo. Se
corrieron una vez y quedaron ahí por si hay que recargar contenido.

### Estado de los seeds

| Script | Estado |
|---|---|
| `seed:tutorial` | Autosuficiente — lee `seed/tutorial_data.json`, que sí está en el repo |
| `seed:articles` | Necesita un `articles.csv` que **no está versionado** |
| `seed:evaluations` | Descarga de un Google Sheet vía su exportación CSV pública; hay que pasarle el ID de la hoja |
| `seed:presentations` | Requiere credenciales de Cloudinary |

Conclusión operativa importante: **armarte una base de datos propia y vacía te sirve para
probar registro, login, perfil y favoritos, pero no para ver el contenido real de la
app**. Los artículos, evaluaciones y presentaciones que ve un usuario solo existen en el
cluster `SostekDB` del proyecto. Ese acceso se pide, no se genera.

---

## 8. Local y producción

### En tu máquina

Dos terminales, siempre. El orden importa poco, pero el backend conviene levantarlo
primero para que el primer render del frontend ya encuentre datos.

```bash
# terminal 1 — Sostek-backend
npm install
cp .env.example .env      # JWT_CODE y DB_URL son obligatorios
npm run dev:js            # nodemon en :8080

# terminal 2 — Sostek
npm install
cp .env.example .env      # ya apunta a localhost:8080
npm run start             # ionic serve en :3000
```

De las variables del backend, solo dos impiden que arranque: `JWT_CODE` (te lo inventas,
cualquier string largo y aleatorio) y la base de datos. Las de correo solo hacen falta
para probar recuperación de contraseña — sin ellas el servidor avisa por consola y sigue
funcionando. Las de Cloudinary, solo para subir avatares y para el seed de
presentaciones.

Atajo útil: los tests del backend usan `mongodb-memory-server`, una base en memoria.
`npm test` corre sin `.env`, sin internet y sin tocar Atlas.

### En producción

| Pieza | Dónde vive | Nota |
|---|---|---|
| Backend | `sostek-backend.onrender.com` | Render, con UptimeRobot pegándole para que no se duerma |
| Frontend | `sostek-frontend.onrender.com` | Sitio estático desplegado desde `main` |
| Frontend viejo | `sostek.pages.dev` | Cloudflare Pages, build previo a la integración con el backend. Abandonado por decisión del equipo: la cuenta es de un colaborador anterior y no se puede transferir sin arriesgar la URL |
| Datos | MongoDB Atlas + Cloudinary | Compartidos entre local y producción: apuntar tu backend local al mismo `DB_URL` escribe en la base real |

Los dos repos tienen su propio workflow de GitHub Actions que corre los tests en cada
push y cada PR a `main` o `development`. El frontend tiene 23 tests sobre lógica pura
(puntaje, normalización de búsqueda, favoritos); el backend tiene 33 con Jest y
Supertest.

---

## 9. Fricciones reales

Cosas que están en el código hoy y que te van a morder si no las conoces de antemano.
No son opiniones de estilo, son trampas concretas.

### El servidor muere sin mensaje si no alcanza la base — *arranque*

`src/models/authModel.js:7` hace `mongoose.connect(DB_URL)` sin `.catch()`, en el momento
de importar el módulo. Si la base no responde, esa promesa se rechaza sin manejo y en
Node moderno eso tumba el proceso.

El síntoma que ves es un stack trace de Mongoose y el puerto 8080 muerto, en vez de un
"no me pude conectar a la base". Un `.catch()` ahí convierte diez minutos de confusión
en una línea legible.

### `index.ts` e `index.js` se sincronizan a mano — *despliegue*

El servidor corre `src/index.js`. El `.ts` existe al lado pero no se compila en cada
commit. Si editas un endpoint solo en el TypeScript, el cambio se ve bien en el PR y
**nunca llega a producción**. Lo mismo aplica a los dos archivos de modelos.

### Los errores llegan como `200 OK` — *depuración*

La pestaña Network del navegador te va a mostrar puras respuestas exitosas aunque el
login esté fallando. Hay que abrir el cuerpo de la respuesta y mirar `success`. Un
`.catch()` de axios en el frontend no atrapa errores de negocio, solo caídas de red.

### `CORS_ORIGIN` en producción apunta al dominio abandonado — *producción*

La variable en Render sigue configurada con `sostek.pages.dev`, el frontend viejo.
Mientras no se actualice al dominio que se esté usando, el login y el perfil no funcionan
desde el frontend nuevo desplegado. En local no afecta, porque `localhost:3000` está en
la lista fija del código.

### Los favoritos guardan solo el ID, sin resolver — *arquitectura*

`GET /user/favorites` devuelve pares de `content_id` y `type`, no los artículos. La
pantalla de Favoritos tiene que cruzar esos IDs contra la lista de artículos y
presentaciones que ya tiene cacheada. Funciona, pero significa que **los favoritos
dependen de que el caché de contenido esté poblado**.

### `ArticleCardModal.tsx` existe y nadie lo importa — *código muerto*

La documentación del proyecto describe un modal con el artículo más reciente al entrar a
APRENDE, pero `Tab1.tsx` no tiene rastro de esa lógica. Parece una regresión de algún
refactor anterior. Está marcado como pendiente de decisión: se reactiva o se borra.

---

*Basado en la lectura del código de ambos repositorios: `Sostek` en la rama `main` y
`Sostek-backend`, más `ONBOARDING_FRONTEND.md`, `ONBOARDING_BACKEND.md`,
`AVANCE_SOSTEK.md` y `API_CONTRACTS.md`.*
