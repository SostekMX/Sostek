# ONBOARDING: guía para quien edite este repo por primera vez

> Si es tu primera vez en este repo, empieza por **«0. Tus primeros 30 minutos»**: en media hora tienes los dos repos corriendo en tu máquina con el contenido real.
> Después lee esta guía completa, y luego `AVANCE_SOSTEK.md`, que es la fuente de verdad del estado actual (qué está hecho, qué falta y las prioridades).

## 0. Tus primeros 30 minutos

**Necesitas:** Git y Node 24. La versión está en `.nvmrc`; si usas nvm, corre `nvm use`. **No necesitas** Docker, ninguna cuenta del proyecto, ni instalar Ionic CLI global.

**1. Backend** (5 a 15 minutos, casi todo es descarga). En una terminal:

```bash
git clone https://github.com/SostekMX/Sostek-backend.git
cd Sostek-backend
npm install            # la primera vez baja MongoDB para los tests y para dev:memoria (unos 780 MB en Windows)
npm run dev:memoria    # deja esta terminal abierta
```

Está listo cuando aparece `[dev:memoria] Base en memoria lista: 25 de articles.json, …`. Abre http://localhost:8080/health: debe responder `{"status":"ok"}`. La base vive en memoria, tiene el contenido real y **no toca producción**. Lo que guardes se pierde al cerrarla.

**2. Frontend** (5 minutos). En otra terminal:

```bash
git clone https://github.com/SostekMX/Sostek.git
cd Sostek
npm install
cp .env.example .env   # en cmd de Windows: copy .env.example .env
npm run start          # http://localhost:3000
```

**3. Recorre la app** (10 minutos):
- Entra con «Continuar como invitado».
- Revisa APRENDE (artículos y presentaciones), JUEGA (el instructivo) y EVALÚATE (las evaluaciones y el quiz de proyectos de negocio).
- Crea una cuenta, marca un favorito y entra a tu perfil. La cuenta vive solo en la base en memoria.

**4. Corre los tests** (2 minutos): `npm test -- --watchAll=false` en el frontend y `npm test` en el backend.

**5. Lee lo que sigue:**
- `ARQUITECTURA.md`, sobre todo §4 «Recorrido de una petición» y §9 «Fricciones reales».
- `AVANCE_SOSTEK.md`, para saber qué sigue.

**Si el puerto 8080 está ocupado:**
1. En `Sostek-backend`, crea un `.env` con `PORT=8081`.
2. En `Sostek/.env`, pon `REACT_APP_BACKEND_URL=http://localhost:8081`.
3. Reinicia los dos.

---

## 1. Historia rápida: por qué el proyecto está armado así

Sostek **no nació así**. La versión original cargaba todo el contenido directo de **Google Sheets y Google Drive** con `gapi.client` en el navegador: artículos, presentaciones, evaluaciones y el tutorial. No tenía backend propio ni base de datos.

El equipo perdió el acceso a las API keys y credenciales que necesitaba esa integración, porque eran de cuentas personales. Por eso se migró **todo el contenido a un backend propio** (Node.js, Express y MongoDB), con las imágenes en Cloudinary. Esa migración ya terminó:

- No queda ninguna llamada a `gapi.client`.
- Todo el contenido se lee del backend vía REST: `GET /articles`, `/presentations`, `/evaluations`, `/tutorial` y `/quiz`.
- El contenido vive versionado en el repo del backend (`seed/content`) y se carga a la base con los seeds.
- En Google Drive solo queda el **zip del juego físico**, que es un link externo y no contenido de la app.

**Despliegue:** el frontend oficial está en **Vercel** (`https://sostek.vercel.app`). Hay dos sitios viejos abandonados: uno en Render y otro en Cloudflare Pages (`sostek.pages.dev`), este último con la versión de 2022. El detalle está en `DESPLIEGUE.md`.

---

## 2. Qué es este repo, en una línea

Es una app educativa de sostenibilidad (Ionic React con TypeScript) con 3 secciones:
- **APRENDE**: artículos y presentaciones.
- **JUEGA**: el juego Survivor.
- **EVALÚATE**: cuestionarios de sostenibilidad por carrera y el quiz de proyectos de negocio.

El login es opcional: toda la app funciona en modo invitado.

El stack y la estructura están en `README.md`. Qué está hecho y qué falta, en `AVANCE_SOSTEK.md`.

---

## 3. Accesos

**Para trabajar en el código solo necesitas acceso de escritura a los repos en GitHub.** Con `npm run dev:memoria` tienes la app completa en local, sin ninguna credencial.

Las demás cuentas (Vercel, Render, MongoDB Atlas, Cloudinary, etc.) solo hacen falta para publicar o tocar producción. Quién las administra y cómo pedir acceso está en [`ACCESOS.md`](ACCESOS.md).

El frontend solo usa una variable, `REACT_APP_BACKEND_URL` (ve `.env.example`). Si no la defines, cae a `http://localhost:8080`.

Puedes apuntar tu frontend local al backend de producción (`REACT_APP_BACKEND_URL=https://sostek-backend.onrender.com`), porque `localhost:3000` está permitido en CORS. Pero **si inicias sesión o guardas algo, escribes en la base real**, que tiene usuarios reales.

---

## 4. Reglas para no romper nada

1. **Es una app de celular.** Cuando algo se vea distinto en móvil y en escritorio, prioriza la vista móvil.
2. **No llames a `axios` directo desde una página o un componente.** Toda llamada HTTP pasa por `src/api/` (`client.ts`, `auth.ts`, `user.ts` y `content.ts`). El cliente ya agrega el token: no lo pases a mano.
3. **Para guardar datos en el navegador usa `localStorage` o `sessionStorage`**, según la tabla de `ARQUITECTURA.md` §5. El token y la sesión van en `sessionStorage`.
4. **No reorganices carpetas «porque sí».** Si una refactorización de estructura no resuelve un problema concreto, no la hagas: mete ruido en los diffs sin beneficio. Se evaluó en el refactor del 2026-06-17 y se descartó para un repo de este tamaño.
5. **Antes de implementar algo, revisa `AVANCE_SOSTEK.md`**, para no duplicar trabajo ni romper algo que ya está resuelto.
6. **Corre `npm run start` y prueba el flujo a mano** antes de dar un cambio por terminado. Los tests automáticos no cubren la mayor parte de la UI (ve §6).
7. **No dejes imports, variables ni archivos sin usar.** Si encuentras código muerto, bórralo. Además, Vercel trata los warnings de ESLint como errores y el deploy falla.
8. **Valida las reglas de negocio en el backend, no solo en el frontend**, por ejemplo la longitud mínima de la contraseña o los correos duplicados. El frontend valida para dar feedback rápido, pero un atacante puede saltárselo.
9. **Si cambias un contrato con el backend**, actualiza `API_CONTRACTS.md` y publica primero el backend (ve `DESPLIEGUE.md`).

---

## 5. Qué hacer con cada tipo de cambio

| Tipo de cambio | Qué hacer |
|---|---|
| Arreglas un bug | Commit `fix: ...`. Si el bug estaba en `AVANCE_SOSTEK.md`, márcalo como resuelto ahí. |
| Agregas una funcionalidad nueva | Commit `feat: ...`. Agrégala a la sección correspondiente de `AVANCE_SOSTEK.md`. |
| Encuentras un bug nuevo y no lo vas a arreglar ahora | Agrégalo a la tabla de «Bugs conocidos» de `AVANCE_SOSTEK.md`, con su prioridad. |
| Limpias código sin cambiar el comportamiento | Commit `refactor:` o `style:`, según aplique. |
| Agregas una variable de entorno | Actualiza `.env.example` y, si se usa en producción, `DESPLIEGUE.md`. |
| Cambias una regla de negocio o de seguridad | Actualiza `ARQUITECTURA.md` §6 y, si toca la API, `API_CONTRACTS.md`. |

**Reglas de commits (aplican siempre):**
- Nunca incluyas autoría de Claude/IA en el mensaje del commit, aunque hayas usado una IA para ayudarte a escribir el código.
- Español, nivel simple (A2): mensajes cortos y claros.
- Formato `tipo: descripción corta` o `tipo(alcance): descripción corta`, con estos tipos: `feat`, `fix`, `chore`, `style`, `refactor`, `perf`, `test`, `build`, `ci` y `docs`.
- Commits atómicos: uno por intención, que se pueda revertir solo.

**Antes de abrir un PR o integrar a `development` o `main`:** haz una revisión de código y corre los tests (`npm test -- --watchAll=false`). CI corre los tests y el build en cada PR a `development` y a `main`.

---

## 6. Tests y cobertura: qué hay y qué falta

```bash
npm test                                   # modo watch
npm test -- --watchAll=false               # una sola corrida (lo que usa CI)
npm test -- --coverage --watchAll=false    # reporte de cobertura
```

**Qué está cubierto hoy** (10 suites en `src/__tests__/`):
- **Lógica pura:**
  - `scoring` (puntaje de las evaluaciones);
  - `quiz` (puntaje y clasificación del quiz);
  - `search` (normalización de búsqueda);
  - `axis` (ejes ambiental, económico y social);
  - `cache` (lectura segura de la caché);
  - `image` (pide cada imagen al tamaño en que se muestra);
  - `i18n` (que el inglés tenga las mismas llaves que el español);
  - `favorites` (el hook `useFavorites`).
- **Pantallas:** `finalScore` (cómo se guarda el puntaje al terminar una evaluación) y `quizResults` (los resultados del quiz, que se pintan desde `sessionStorage`).

**Qué NO está cubierto:**
- Casi ninguna página tiene tests de render ni de interacción: `Tab1.tsx`, `Profile.tsx` y el resto.
- La capa `src/api/` no tiene tests propios.
- No hay tests de punta a punta (E2E).

**Si agregas lógica pura** (funciones sin estado de React y sin HTTP, como las de `utils/`), agrégale un test con el patrón de los archivos de `__tests__/`.

GitHub Actions corre los tests y el build en cada push o PR a `main` o `development` (`.github/workflows/test.yml`). Si rompes algo, el check del PR sale en rojo.

---

## 7. Mapa rápido de dónde está cada cosa

```
src/
├── api/          # TODA llamada HTTP (client, auth, user, content)
├── pages/        # Una carpeta por pantalla (tab1, tab2, tab3, quiz, evaluation, profile…)
├── components/   # Piezas de UI reusadas; layout/ (navegación) y ui/ (campos, errores)
├── hooks/        # useFavorites, useQuizzes, useMediaQuery
├── utils/        # Lógica pura: scoring, quiz, search, axis, cache, image, session
├── i18n/         # Textos en español e inglés (es.ts, en.ts) y traducción del contenido
├── context/      # AppContext: estado global (búsqueda, tutorial, puntaje)
├── theme/        # Variables de color, tipografía y espaciado
└── __tests__/    # Tests de utils, hooks y dos pantallas
```

El árbol completo, con un comentario por archivo, está en `README.md`.

---

## 8. Mapa de documentos

| Archivo | Para qué | Quién lo actualiza |
|---|---|---|
| `README.md` | Punto de entrada: qué es, cómo correrlo y la estructura | Quien cambie la instalación o la estructura |
| `ONBOARDING_FRONTEND.md` (este archivo) | Cómo empezar, el contexto histórico y las reglas | Quien cambie algo de fondo |
| `AVANCE_SOSTEK.md` | Estado actual: qué está hecho, qué falta, bugs conocidos y prioridades | Cualquiera, cada vez que resuelve o encuentra algo (ve §5) |
| `ARQUITECTURA.md` | Cómo encajan el frontend, el backend y los datos, y las fricciones reales | Quien cambie cómo se conectan las piezas |
| `API_CONTRACTS.md` | El contrato de cada endpoint del backend: body, respuesta y errores | Quien cambie algo en `src/api/` o en las rutas del backend |
| `DESPLIEGUE.md` | Producción: Vercel, Render, variables, CORS, rollback y apps nativas | Quien cambie cómo o dónde se publica |
| `ACCESOS.md` | Las cuentas del proyecto, quién las administra y cómo pedir acceso | Quien entra o sale del proyecto |
| `docs/historial/` | Bitácoras de sesiones e investigaciones pasadas | Nadie: es archivo |

El backend tiene su propio `README.md`, `ONBOARDING_BACKEND.md` y `AVANCE_SOSTEK.md`.
