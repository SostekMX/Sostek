# ONBOARDING — Guía para quien edite este repo por primera vez

> Si es tu primera vez en este repo, leé esto antes de tocar código.
> Después de esta guía, leé `AVANCE_SOSTEK.md` — ese archivo es la fuente de verdad del estado actual (qué está hecho, qué falta, prioridades).

## 1. Historia rápida (por qué el proyecto está armado así)

Sostek **no nació así**. La versión original cargaba todo el contenido (artículos, presentaciones, evaluaciones, tutorial) directo desde **Google Sheets y Google Drive**, usando `gapi.client` en el navegador — sin backend propio, sin base de datos.

Esa parte del equipo dejó de tener acceso a las API keys y credenciales necesarias para mantener esa integración (Google Cloud Console, IDs de carpetas de Drive, etc.). Por eso se migró **todo el contenido a un backend propio (Node.js + Express + MongoDB)**, con imágenes en Cloudinary. Esta migración ya terminó por completo:

- Google APIs eliminadas del código — no queda ninguna llamada a `gapi.client`
- Todo el contenido se lee del backend vía REST (`GET /articles`, `/presentations`, `/evaluations`, `/tutorial`)
- Lo único que sigue en Google Drive es el **archivo zip de descarga del juego físico** (un link externo, no contenido de la app)

**Por qué vas a ver cosas raras en `package.json`:** quedaron dependencias de esa época sin usar (`@types/gapi*`, `cordova-plugin-nativestorage`, `@ionic-native/native-storage`, `@awesome-cordova-plugins/native-storage`). No las necesitas, no las borres por las dudas sin avisar — pero tampoco asumas que tenés que configurar nada de Google para que la app funcione.

**Otro dato de contexto:** hay un deploy viejo en `https://sostek.pages.dev` (Cloudflare Pages) que lo maneja un compañero que inició el proyecto hace años y corre el build viejo (pre-MongoDB). Se decidió abandonarlo — el link público real va a ser un dominio propio sobre Render. Detalle completo en `AVANCE_SOSTEK.md` → sección "Despliegue".

---

## 2. Qué es este repo, en una línea

App educativa de sostenibilidad (Ionic React + TypeScript) con 3 secciones: **APRENDE** (artículos/presentaciones), **JUEGA** (videojuego Survivor) y **EVALÚATE** (cuestionarios de sostenibilidad). El login es opcional — toda la app funciona en modo invitado.

Para el detalle de stack, estructura de carpetas y rutas: ver `README.md`. Para qué está hecho y qué falta: ver `AVANCE_SOSTEK.md`.

---

## 3. Cómo conseguir acceso a todo

Este repo (frontend) **no alcanza solo** para tener todo funcionando. Vas a necesitar que alguien del equipo te dé:

| Qué necesitás | Para qué | A quién pedirlo |
|---|---|---|
| Acceso al repo del **backend** (no está en este repo) | Correr el servidor de usuarios/contenido en `localhost:8080` | Quien mantiene el backend actualmente |
| Connection string de **MongoDB Atlas** | El backend la necesita para conectarse a la base de datos | Backend / quien tenga acceso al cluster |
| Credenciales de **Cloudinary** | Subida de avatares e imágenes de contenido (las URLs ya guardadas en MongoDB funcionan sin esto; solo lo necesitás si vas a subir/cambiar imágenes desde el backend) | Backend |
| Acceso a **Render** (organización del proyecto) | Ver logs y variables de entorno de los servicios `sostek-backend` y `sostek-frontend` desplegados | Quien administre Render hoy |
| Acceso al repo de **GitHub** | Pushear, abrir PRs | Quien sea owner/admin del repo |

El frontend (este repo) en desarrollo local **solo necesita** la variable `REACT_APP_BACKEND_URL` (ver `.env.example`). Si no la definís, cae al fallback `http://localhost:8080`.

---

## 4. Cómo correr todo en tu máquina

```bash
git clone [url-del-repo]
cd Sostek
git checkout development
npm install
cp .env.example .env
npm run start          # http://localhost:3000
```

- Si **no** tenés el backend corriendo: podés usar toda la app como invitado (botón "Continuar como invitado"). Login, perfil y favoritos no van a funcionar.
- Si **sí** tenés el backend: correlo por separado (repo distinto) en `localhost:8080`, o cambiá `REACT_APP_BACKEND_URL` para apuntar a otro lado (ej. `https://sostek-backend.onrender.com` si querés probar contra el backend de producción).

---

## 5. Reglas para no romper nada

Estas reglas ya están en `CLAUDE.md`, pero las más importantes para no meter la pata:

1. **Es una app de celular.** Cuando algo se vea distinto en mobile vs. desktop, priorizá la vista mobile.
2. **No llames a `axios` directo desde una página o componente.** Toda llamada HTTP pasa por `src/api/` (`client.ts`, `auth.ts`, `user.ts`, `content.ts`). El cliente ya agrega el token automáticamente — no lo pases a mano.
3. **No uses `NativeStorage`** en código que corre en web — solo funciona compilado como app nativa (Capacitor). Para web usá `localStorage` o `sessionStorage` según corresponda (ver la tabla en `AVANCE_SOSTEK.md` → "Arquitectura de datos" para saber cuál usar en cada caso).
4. **No reorganices carpetas "porque sí".** Si una refactorización de estructura no resuelve un problema concreto, no la hagas — genera ruido en los diffs sin beneficio real (esto se evaluó explícitamente en el refactor de 2026-06-17 y se descartó para un repo de este tamaño).
5. **Antes de implementar algo, revisá `AVANCE_SOSTEK.md`** — para no duplicar trabajo ni romper algo que ya está resuelto.
6. **Corré `npm run start` y probá el flujo a mano** antes de dar un cambio por terminado. Los tests automáticos no cubren la mayoría de la UI (ver sección 7).
7. **No dejes imports, variables o archivos sin usar.** Si encontrás código muerto, bórralo (y anotalo en `AVANCE_SOSTEK.md` si vale la pena dejar registro).
8. **Validá reglas de negocio en el backend, no solo en el frontend** (ej: longitud mínima de contraseña, duplicados de email). El frontend valida para dar feedback rápido, pero un atacante puede saltarse el frontend.

---

## 6. Qué hacer con cada tipo de cambio

| Tipo de cambio | Qué hacer |
|---|---|
| Arreglás un bug | Commit `fix: ...`. Si el bug estaba listado en `AVANCE_SOSTEK.md`, márcalo resuelto ahí. |
| Agregás una funcionalidad nueva | Commit `feat: ...`. Agregá la funcionalidad a la sección correspondiente de `AVANCE_SOSTEK.md`. |
| Encontrás un bug nuevo (no lo vas a arreglar ahora) | Agregalo a la tabla de "Bugs conocidos" en `AVANCE_SOSTEK.md` con prioridad. |
| Limpiás código sin cambiar comportamiento | Commit `refactor:` o `style:` según aplique (ver tabla de tipos en `CLAUDE.md`). |
| Agregás una variable de entorno nueva | Actualizá `.env.example` y `README.md`. |
| Cambiás una regla de negocio | Actualizá `CLAUDE.md` → "Reglas de negocio críticas". |

**Reglas de commits (de `CLAUDE.md`, aplican siempre):**
- Nunca incluyas autoría de Claude/IA en el mensaje del commit, aunque hayas usado una IA para ayudarte a escribir el código.
- Español, nivel simple (A2) — mensajes cortos y claros.
- Formato `tipo: descripción corta` (`feat`, `fix`, `chore`, `style`, `refactor`, `perf`, `test`, `build`).

**Antes de abrir un PR o mergear a `development`/`main`:** corré una revisión de código (manual, o con `/review` si usás Claude Code) y los tests (`npm test`).

---

## 7. Tests y cobertura — qué hay y qué falta

```bash
npm test                                   # modo watch
npm test -- --watchAll=false               # una sola corrida (lo que usa CI)
npm test -- --coverage --watchAll=false    # reporte de cobertura
```

**Qué está cubierto hoy** (23 tests, 3 suites, en `src/__tests__/`):
- `scoring.test.ts` — lógica de puntaje de evaluaciones (`getFeedback`, `applyAnswer`, `computeCategoryScores`, `clearScoreSession`)
- `search.test.ts` — normalización de búsqueda (tildes, mayúsculas)
- `favorites.test.ts` — lógica del hook `useFavorites` (agregar/quitar/listar)

**Qué NO está cubierto:**
- Ningún componente de UI ni página (`Tab1.tsx`, `Profile.tsx`, etc.) — no hay tests de render ni de interacción
- La capa `src/api/` no tiene tests propios (se prueban indirectamente al testear lo que la usa, pero no hay mocks de axios)
- No hay tests end-to-end (E2E)

**Si agregás lógica pura nueva** (funciones sin estado de React, sin llamadas HTTP — como las de `utils/`), agregale un test siguiendo el patrón de los archivos existentes en `__tests__/`. Si agregás un componente o página nueva, no es obligatorio (todavía no hay esa cultura en el repo), pero es bienvenido.

Los tests corren automáticamente en GitHub Actions en cada push/PR a `main` o `development` — ver `.github/workflows/test.yml`. Si rompés un test, el check de CI en el PR va a salir en rojo.

---

## 8. Mapa rápido de dónde está cada cosa

```
src/
├── api/          # TODA llamada HTTP — no la rompas llamando axios directo en otro lado
├── pages/        # Una carpeta por pantalla (login, tab1, tab2, tab3, profile, etc.)
├── components/   # Piezas de UI reusadas por más de una página
├── hooks/        # useFavorites — lógica de favoritos con optimistic update
├── utils/        # Lógica pura sin React (scoring, search) — la única parte con tests hoy
├── context/      # AppContext — estado global (búsqueda activa, tutorial, score, toolbar)
└── __tests__/    # Tests de utils/ y hooks/
```

El árbol completo con comentario por archivo está en `README.md` y en `AVANCE_SOSTEK.md`.

---

## 9. Mapa de documentos del repo

| Archivo | Para qué | Quién lo actualiza |
|---|---|---|
| `README.md` | Instalación, cómo correr el proyecto, estructura | Cualquiera que cambie la instalación o estructura |
| `AVANCE_SOSTEK.md` | Estado actual: qué está hecho, qué falta, bugs conocidos, prioridades | Cualquiera, cada vez que resuelve/encuentra algo (ver sección 6) |
| `API_CONTRACTS.md` | Contrato de cada endpoint del backend (body, respuesta, errores) | Quien cambie algo en `src/api/` o le avisen de un cambio de contrato en el backend |
| `CLAUDE.md` | Convenciones de commits, code style, reglas de negocio — pensado para Claude Code pero aplica a cualquier desarrollador | Cuando cambie una convención o regla de negocio |
| `ONBOARDING_FRONTEND.md` (este archivo) | Contexto histórico y cómo empezar | Cuando cambie algo de fondo (ej. se vuelve a migrar de proveedor, cambia el flujo de acceso a credenciales) |

> Este proyecto tuvo en algún momento `INFO_FRONTEND.md` e `INFO_PARA_BACKEND.md` como canal de comunicación con el equipo de backend durante la migración a MongoDB. Ya no existen — esa coordinación ahora es directa con el equipo de backend (Slack, llamada, lo que usen), no por archivo de texto en el repo.
