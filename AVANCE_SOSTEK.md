# AVANCE SOSTEK — Fuente de Verdad del Proyecto

> Última actualización: 2026-11-24, entrega del servicio social. Los pendientes para quien siga están al final, en «Pendientes de la entrega».
> Rama activa: `development`. `main` es lo que está publicado en https://sostek.vercel.app.
> Stack: Ionic React 6, TypeScript, Capacitor 4 y Node 24, con el backend Node.js/MongoDB en otro repo

---

## ¿Qué es este repositorio?

La aplicación **web/móvil de SOSTEK**: una plataforma educativa de sostenibilidad para estudiantes y docentes de la facultad. Tiene tres secciones principales accesibles desde el menú inferior:

| Tab | Nombre | Propósito |
|-----|--------|-----------|
| 1 | **APRENDE** | Artículos y presentaciones de sostenibilidad (contenido desde backend MongoDB) |
| 2 | **JUEGA** | Videojuego "Survivor" — versión física descargable + video; versión online pendiente |
| 3 | **EVALÚATE** | Evaluaciones tipo cuestionario para medir el nivel de sostenibilidad de proyectos académicos |

El backend (login, registro, perfil y contenido) está en otro repo, [SostekMX/Sostek-backend](https://github.com/SostekMX/Sostek-backend). En local corre en `http://localhost:8080`, y en producción en `https://sostek-backend.onrender.com`.

> ¿Primera vez en este repo? Lee `ONBOARDING_FRONTEND.md` — tiene la historia del proyecto (por qué se migró de Google Sheets/Drive a esta base de datos) y cómo conseguir acceso a todo lo que necesitas. Este archivo (`AVANCE_SOSTEK.md`) es el estado actual, no el punto de partida.

---

## Estructura del proyecto

El árbol completo, con un comentario por carpeta, está en [`README.md`](README.md). Mantenerlo en un solo lugar evita que dos copias digan cosas distintas.

---

## Rutas registradas

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | `LogIn` | Pantalla de login (tab bar oculto) |
| `/SignUp` | `SignUp` | Registro (tab bar oculto) |
| `/ForgotPassword` | `ForgotPassword` | Solicitud de token por email (tab bar oculto) |
| `/ResetPassword` | `ResetPassword` | Cambio de contraseña con token (tab bar oculto) |
| `/MainMenu` | `Tab1` | Alias de entrada para invitados |
| `/tab1` | `Tab1` | APRENDE |
| `/tab2` | `Tab2` | JUEGA |
| `/tab3` | `Tab3` | EVALÚATE |
| `/Profile` | `Profile` | Perfil del usuario — ruta privada (redirige a `/` si no está logueado) |
| `/Favorites` | `Favorites` | Artículos y presentaciones guardados — ruta privada |
| `/Documents/:id` | `Documents` | Detalle de artículo |
| `/presentation/:driveId` | `Presentation` | Viewer de presentación |
| `/Evaluation/:name/:id` | `Evaluation` | Cuestionario de evaluación |
| `/score/:name` | `FinalScoreEvaluation` | Resultado de evaluación |
| `/quiz` | `QuizStart` | Quiz: elegir nivel y tipo de proyecto |
| `/quiz/:level/:type` | `QuizQuestions` | Quiz: preguntas por bloque |
| `/quiz/resultados` | `QuizResults` | Quiz: calificación global, por bloque y retroalimentación |

---

## Estado actual por módulo

### ✅ IMPLEMENTADO Y FUNCIONAL

- **Login / Registro** — formularios completos, JWT guardado en `sessionStorage`, redirige a `/tab1`
- **Tab 1 — APRENDE**
  - Artículos cargados desde `GET /articles` (backend MongoDB)
  - Carrusel de artículos + presentaciones desde `GET /presentations`
  - Búsqueda con normalización de tildes
  - Filtro por tipo (Artículos / Presentaciones / Ambos)
  - Caché offline en `localStorage`
- **Detalle de artículo** (`/Documents/:id`) — carga desde `GET /articles/:id`; diseño dark con hero 240px, badge de categoría, tipografía legible, párrafos separados por `\n`, botón de regreso; muestra sección `bibliography` si el campo llega del backend
- **Viewer de presentaciones** (`/presentation/:driveId`) — slides horizontales con Swiper desde `GET /presentations`; usa `cover` como portada si existe, si no usa `slides[0]`
- **Tab 2 — JUEGA** — video del juego, enlace de descarga, instructivo completo (reglas, tipos de tarjeta, cartas filtradas por tipo) desde `GET /tutorial`; placeholder "en construcción" para versión online
- **Tab 3 — EVALÚATE**
  - Lista de evaluaciones desde `GET /evaluations` (backend MongoDB)
  - Filtro por carrera: Arquitectura / Diseño Industrial / Otros
- **Evaluación** (`/Evaluation/:name/:id`) — preguntas desde `GET /evaluations/:id`, checkboxes, puntaje acumulado por categoría
- **Resultado de evaluación** (`/score/:name`) — puntaje, categoría más débil, feedback por rango (≥150, ≥120, ≥90, ≥50, <50), botón artículos recomendados
- **AppBar** — búsqueda con animación de apertura/cierre, menú lateral con logout (limpia token), acceso a perfil/favoritos; muestra avatar circular del usuario en el header (cargado desde `localStorage`) si tiene foto, o ícono de persona/menú si no
- **Perfil** — carga datos con `GET /user/profile`, edición con `POST /user/edit`, ambos con header JWT; UI de cambio de avatar con selector de imagen, overlay de recorte circular (drag para reposicionar), sube a `POST /user/avatar` como `multipart/form-data`; persiste posición del recorte en `localStorage`
- **Validación contraseña** — mínimo 8 caracteres en signup y reset-password antes de llamar al backend
- **Eliminar cuenta** (`DELETE /user`) — botón en `Profile.tsx`, confirmación con alert, limpia token y redirige a login
- **Quiz de proyectos de negocio** (`/quiz`) — acceso desde EVALÚATE, con un banner entre «Cómo funciona» y las carreras; dentro del quiz queda marcada la pestaña EVALÚATE; nivel (1 y 2 «Próximamente» hasta que haya datos), tipo de proyecto obligatorio, preguntas por bloque desde `GET /quiz` con opciones barajadas, «Obtener resultados» solo con todo contestado; resultados con % global y por bloque, conteo de óptimas/parciales/nulas y retroalimentación por pregunta filtrable. Puntaje en `src/utils/quiz.ts` con tests. El resultado no se guarda en el perfil (ver pendientes)
- **Guardar puntaje** (`POST /user/score`) — se envía `score_test` al backend al finalizar una evaluación si el usuario está logueado
- **Recuperación de contraseña**: `ForgotPassword.tsx` pide el correo y el backend manda un link con el token **por correo**, en el idioma de la app (el token nunca viene en la respuesta). `ResetPassword.tsx` recibe el token y la contraseña nueva. Las rutas son `/ForgotPassword` y `/ResetPassword`, con link desde `LogIn.tsx`.
- **Favoritos** — botón corazón en `DocumentCard` (lista y carrusel), hook `useFavorites.ts` con `POST/GET/DELETE /user/favorites`, página `/Favorites` que lista contenido guardado con opción de quitar

#### Fixes técnicos aplicados

- Migración completa de Google Sheets/Drive → backend MongoDB (artículos, evaluaciones, presentaciones, tutorial)
- Google APIs eliminadas por completo — script `gapi` removido de `index.html`, sin llamadas a `gapi.client` en ningún componente
- Eliminación de 6 hooks muertos de gapi (`useGetEvaluationData`, `useGetPresentations`, `useGetPresentationImages`, `useGetFirstImageOfPresentations`, `useGetSingleExcelAllData`, `useLocalStorage`)
- Eliminación de `NativeStorage` → `localStorage`
- Tab bar oculto en rutas `/`, `/SignUp`, `/ForgotPassword` y `/ResetPassword`
- Rediseño completo mobile-first de todas las pantallas principales
- `AppBarMenu.tsx` reemplazado en `Documents.tsx` por patrón correcto (`AppBarPopOver`-style con IonBackButton)

---

### ⚠️ INCOMPLETO / A MEDIAS

| Elemento | Ubicación | Estado |
|----------|-----------|--------|
| Juego online | `Tab2.tsx` | Placeholder "en construcción" |
| Quiz: retroalimentación | `seed/quiz_data.json` (backend) | Es un borrador (`feedbackDraft: true`) y la app lo marca como «preliminar». Falta que Carlos la revise || Quiz: niveles 1 y 2 | `seed/quiz_data.json` (backend) | Sin contenido: salen como «Próximamente» y se activan solos cuando haya datos || Quiz: guardar el resultado | Backend y `QuizResults.tsx` | No se guarda en el perfil: `POST /user/score` solo tiene `score_test`, que usa la evaluación. Haría falta un campo nuevo || Quiz en inglés | `src/i18n/content.en.json` | La interfaz sí está traducida; el contenido del quiz sale en español || Apps nativas | `ios/`, `capacitor.config.ts` | Nunca se publicaron. iOS no tiene equipo de firma y Android no tiene carpeta. Ve `DESPLIEGUE.md` |

---

### 🔒 SEGURIDAD / CALIDAD — PENDIENTE FRONTEND

| # | Tarea | Detalle |
|---|-------|---------|
| ~~S1~~ | ~~Scan de URLs hardcodeadas~~ | ✅ Resuelto — `BACKEND_URL` en `src/config.ts`, 15 archivos actualizados |
| ~~S2~~ | ~~Variables de entorno~~ | ✅ Resuelto — `.env.example` creado con `REACT_APP_BACKEND_URL` |
| ~~S3~~ | ~~JWT en localStorage~~ | ✅ Resuelto — `token` y `login` movidos a `sessionStorage` en 8 archivos |
| ~~S4~~ | ~~Guardias de ruta~~ | ✅ Resuelto — `PrivateRoute` en `src/components/PrivateRoute.tsx`; protege `/Profile` y `/Favorites` |
| ~~S5~~ | ~~Contraseña mínima 8 chars (frontend)~~ | ✅ Resuelto — `SignUp.tsx` y `ResetPassword.tsx` actualizados |
| ~~S6~~ | ~~Email en body de /user/edit~~ | ✅ Resuelto — removido de `Profile.tsx` |
| ~~S7~~ | ~~JSON.parse sin try/catch~~ | ✅ Resuelto — `AppBarPopOver.tsx` y `Profile.tsx` protegidos |
| ~~U1~~ | ~~Skeleton loaders en Tab1 y Tab3~~ | ✅ Resuelto — skeleton shimmer en Tab1, Tab3, Documents, Evaluation y Favorites. Spinner eliminado de toda la app |
| ~~U2~~ | ~~Cachear evaluaciones y presentaciones~~ | ✅ Resuelto — evaluaciones y presentaciones cacheadas en `localStorage`, mismo patrón que artículos |
| ~~U3~~ | ~~Error boundary global~~ | ✅ Resuelto — `ErrorBoundary.tsx` envuelve toda la app; pantalla dark con logo + botón "Reintentar" |
| ~~T1~~ | ~~Unit tests frontend (Jest)~~ | ✅ Resuelto. Hoy hay 10 suites en `src/__tests__/` (ve `ONBOARDING_FRONTEND.md` §6), y CI corre los tests y el build. |

### 🔒 SEGURIDAD / CALIDAD — PENDIENTE BACKEND

| # | Tarea | Detalle |
|---|-------|---------|
| ~~BS1~~ | ~~Variables de entorno~~ | ✅ Resuelto — sin secretos hardcodeados, `.env.example` completo |
| ~~BS2~~ | ~~Sanitizar inputs + NoSQL injection~~ | ✅ Resuelto — `helmet`, `express-mongo-sanitize` y `express-validator` activos |
| ~~BS4~~ | ~~Contraseña mínima 8 caracteres~~ | ✅ Resuelto — `isLength({ min: 8 })` en signup y reset-password |
| ~~BS5~~ | ~~HTTPS / SSL (producción)~~ | ✅ Resuelto — Render provee TLS automáticamente |
| ~~BT1~~ | ~~Unit tests backend (Jest + Supertest)~~ | ✅ Resuelto: corren en CI, que además revisa que los `.js` salgan de los `.ts` |

---

### 🐛 BUGS CONOCIDOS

| # | Descripción | Archivo(s) | Prioridad |
|---|-------------|------------|-----------|
| ~~1~~ | ~~Logout redirige a Perfil en vez de login~~ | ✅ Resuelto — `history.replace('/')` | ~~Alta~~ |
| ~~2~~ | ~~Menú hamburguesa roto en Juega y Evalúate~~ | ✅ Resuelto — ID único por instancia + `IonButton` | ~~Alta~~ |
| ~~3~~ | ~~Llamadas a gapi/Google Drive con 403 en consola~~ | ✅ Resuelto — tutorial migrado a `GET /tutorial` | ~~Alta~~ |
| ~~4~~ | ~~Presentaciones se ven de lado~~ | ✅ Resuelto — quitado `rotate(90deg)` del CSS | ~~Alta~~ |
| ~~5~~ | ~~Guardar cambios en Perfil no redirige a APRENDE~~ | ✅ Resuelto — `history.replace('/tab1')` tras éxito | ~~Media~~ |
| ~~6~~ | ~~aria-hidden sobre elemento con focus en página de presentación~~ | ✅ Resuelto (2026-10-26) — el menú compartido `AppMenu` suelta el foco del botón al abrir (`3b02662`) | ~~Baja~~ |
| ~~7~~ | ~~Meta tag deprecated~~ | ✅ Resuelto — agregado `mobile-web-app-capable` + quitado script gapi | ~~Baja~~ |
| 8 | `Failed to mount content script UI: could not find anchor element` en consola | Error de extensión del navegador (all.js), **no es un bug de la app** — ignorar | Ninguna |
| ~~9~~ | ~~`ArticleCardModal.tsx` existe pero no se importa en ningún lado~~ | ✅ Resuelto (2026-10-26) — se borró como código muerto; en escritorio la portada de APRENDE cumple ese papel (`2970d3b`) | ~~Media~~ |

---

### 🎨 MEJORAS DE DISEÑO PENDIENTES

| # | Descripción | Archivo(s) |
|---|-------------|------------|
| ~~1~~ | ~~Página de Perfil no sigue la aesthetic~~ | ✅ Resuelto — dark bg + card oscuro + avatar |
| ~~2~~ | ~~Alertas feos, no siguen la temática oscura~~ | ✅ Resuelto — IonToast para errores, IonAlert dark para confirmaciones destructivas |
| ~~3~~ | ~~Tab bar footer poco estético~~ | ✅ Resuelto — dark theme + íconos + píldora activa + borde |
| ~~4~~ | ~~Evaluación con diseño viejo~~ | ✅ Resuelto — dark theme + cards oscuras |
| ~~5~~ | ~~Las evaluaciones no tienen descripción~~ | ✅ Resuelto — backend agregó `description` (B3), `EvaluationCard.tsx` lo muestra |
| ~~6~~ | ~~Contenido de artículos difícil de leer, no sigue la aesthetic~~ | ✅ Resuelto — rediseño con hero 240px + tipografía dark |
| ~~7~~ | ~~Sin botón de regreso dentro de un artículo~~ | ✅ Resuelto — IonBackButton en IonHeader |
| ~~D1~~ | ~~Perfil sin dark theme~~ | ✅ Resuelto — app-dark-bg + card oscuro + avatar icon |
| ~~D4~~ | ~~Evaluación con diseño viejo~~ | ✅ Resuelto — dark theme + cards oscuras + botón pill |
| ~~8~~ | ~~Logo de Sostek como botón de inicio es pequeño y no intuitivo~~ | ✅ Resuelto — clase `appbar__logo-btn` con padding, border-radius y feedback táctil |
| ~~9~~ | ~~Tab2: separar texto en dos líneas~~ | ✅ Resuelto |
| ~~Header~~ | ~~Header verde brillante no sigue aesthetic dark~~ | ✅ Resuelto — dark `#0d1a0d` + borde inferior + searchbar integrado + popover oscuro |
| ~~10~~ | ~~Imágenes lentas al cargar (sin lazy loading ni placeholder optimizado)~~ | ✅ Resuelto — skeleton shimmer en `DocumentCard.tsx` + `loading="lazy"` en hero |
| ~~11~~ | ~~Filtro de búsqueda lento (sin debounce)~~ | ✅ Resuelto — debounce 300ms en `AppBarPopOver.tsx` |

---

## Prioridades recomendadas

### 🔴 Alta prioridad (bugs que rompen UX)

1. ~~Fix logout~~ ✅
2. ~~Fix menú hamburguesa~~ ✅
3. ~~Migrar tutorial al backend~~ ✅
4. ~~Fix presentaciones de lado~~ ✅

### 🟡 Media prioridad (diseño/UX)

5. ~~Guardar cambios en Perfil no redirige a APRENDE~~ ✅
6. ~~Rediseño página de Perfil~~ ✅
7. ~~Rediseño página de preguntas de Evaluación~~ ✅
8. ~~Agregar descripción e iconos a cada evaluación~~ ✅ (frontend listo, descripción dinámica pendiente de backend)
9. ~~Rediseño del contenido de artículos + botón de regreso~~ ✅
10. ~~Mejorar tab bar / nav bar~~ ✅
11. ~~Logo de Sostek no intuitivo como botón de inicio~~ ✅

### 🟢 Backlog

12. ~~Debounce en búsqueda~~ ✅
13. ~~Lazy loading de imágenes optimizado~~ ✅
14. ~~Reemplazar IonAlert por toasts/notificaciones custom~~ ✅
15. ~~[S1] Mover `http://localhost:8080` a variable de entorno~~ ✅
16. ~~[S2] Crear `.env.example` documentado~~ ✅
17. ~~[U1] Skeleton loaders en toda la app~~ ✅
18. ~~[U2] Cachear evaluaciones y presentaciones en `localStorage`~~ ✅
19. ~~[U3] Error boundary global~~ ✅
20. ~~[T1] Unit tests frontend con Jest (puntaje, búsqueda, favoritos)~~ ✅
21. ✅ Foto de perfil — frontend completo (upload + crop + reposición + header) + backend implementado (`POST /user/avatar` en Cloudinary)
22. ~~Campo `description` en evaluaciones~~ ✅ — backend agregó el campo (B3), frontend lo muestra
23. ~~Imágenes rotas en 3 artículos~~ ✅ — backend actualizó las URLs en MongoDB

---

## 🆕 Correcciones pendientes — revisión 2026-06-10

> QA manual (jefa). Pendientes de frontend — algunos dependieron de cambios del backend (coordinados directamente con el equipo de backend, ya no por archivo de texto).

| # | Descripción | Archivo(s) | Depende de backend |
|---|-------------|------------|---------------------|
| ~~C1~~ | ~~Barra de búsqueda solo visible en APRENDE — ocultarla en JUEGA y EVALÚATE~~ | `AppBarPopOver.tsx` | ✅ Resuelto — `showSearch` solo en `/tab1` y `/MainMenu` |
| ~~C2~~ | ~~Mostrar foto de perfil en el header desde que se inicia sesión~~ | `LogIn.tsx` | ✅ Resuelto — `LogIn.tsx` guarda `avatar` en `localStorage` al loguear |
| ~~C3~~ | ~~Agregar botón de regreso en presentaciones, igual que en artículos~~ | `Presentation.tsx` | ✅ Resuelto — `IonBackButton` agregado |
| ~~C4~~ | ~~La presentación "Social Innovation and Design" abre en la última slide en vez de la primera~~ | `Presentation.tsx` | ✅ Resuelto — `initialSlide={0}` + `key={driveId}` |
| ~~C5~~ | ~~Quitar botón "Ajustes" del menú~~ | `AppBarPopOver.tsx` | ✅ Resuelto — botón eliminado |
| ~~C6~~ | ~~Cambiar texto de descarga en JUEGA~~ | `Tab2.tsx` | ✅ Resuelto — ahora dice "Imprime las cartas y juega con tus amigos" |
| ~~C7~~ | ~~Bug: tras tocar "Artículos recomendados" y volver a EVALÚATE, no aparecen evaluaciones hasta tocar un filtro de carrera~~ | `Tab3.tsx` | ✅ Resuelto — Tab3 filtra solo por `currentOption` (pills de carrera), ya no depende del `search` global |
| ~~C8~~ | ~~Rediseñar pantalla de resultados (`/score/:name`) con el dark theme del resto de la app~~ | `FinalScoreEvaluation.tsx`, `.css` | ✅ Resuelto |
| ~~C9~~ | ~~Numerar cada pregunta de la evaluación (inciso 1, 2, 3...)~~ | `Evaluation.tsx`, `QuestionTestCard.tsx` | ✅ Resuelto |
| ~~C10~~ | ~~Mostrar el total de preguntas en cada tarjeta de evaluación (Tab3)~~ | `EvaluationCard.tsx`, `Tab3.tsx` | ✅ Resuelto — backend agregó `question_count` (B4), frontend lo muestra |
| ~~C11~~ | ~~Mostrar el puntaje máximo posible junto al obtenido en resultados~~ | `Evaluation.tsx`, `FinalScoreEvaluation.tsx` | ✅ Resuelto |
| ~~C12~~ | ~~Solo aparece 1 artículo recomendado al terminar una evaluación — taxonomías de `category` no coinciden entre artículos y evaluaciones~~ | `ArticleCarrousel.tsx` | ✅ Resuelto — backend renombró `evaluations.questions[].category` a `"Ambiental"` / `"Económico y Social"` (B6), matchea con el mapeo del frontend |
| ~~C13~~ | ~~2 artículos ("El impacto del cine en el medio ambiente" y "La Catástrofe Industrial de Bhopal...") — la letra "í" quedó corrupta en todo el texto (bug de encoding)~~ | — | ✅ Resuelto — backend corrigió el encoding (B5) |
| ~~C14~~ | ~~Descripciones de evaluaciones con el rango de semestre por nivel~~ | `EvaluationCard.tsx` | ✅ Resuelto — backend llenó `description` (B3), frontend ya lo muestra |
| ~~C15~~ | ~~El footer (tab bar) al entrar a un artículo o presentación no es el mismo que en APRENDE/EVALÚATE/JUEGA~~ | `App.tsx`, `App.css`, `Documents.tsx`, `Presentation.tsx`, `AppBarPopOver.css` | ✅ Resuelto — header con `.dark-toolbar` + tab activo via `getActiveTab()` |

---

## 🆕 Correcciones pendientes — revisión 2026-06-17

| # | Descripción | Archivo(s) | Estado |
|---|-------------|------------|--------|
| ~~C16~~ | ~~Ícono de descarga de "Versión física" era una flecha de texto, no un ícono real~~ | `Tab2.tsx` | ✅ Resuelto — reemplazado por `IonIcon` con `downloadOutline` de Ionicons |
| ~~C17~~ | ~~Al tocar "Artículos recomendados" tras una evaluación, el buscador filtraba pero no se mostraba abierto/activo — había que tocar la lupa manualmente para verlo~~ | `AppBarPopOver.tsx` | ✅ Resuelto — el efecto que resetea `isSearching` al cambiar de ruta ahora lo deja abierto si ya hay un término guardado en `sessionStorage` |
| ~~C18~~ | ~~La foto de perfil no aparecía en el header al iniciar sesión, solo después de entrar a Perfil~~ | `LogIn.tsx` | ✅ Resuelto — causa: `fetchAvatar` corría en paralelo con `history.push("/tab1")` (race condition); ahora se espera a que termine antes de navegar |

---

## 🆕 Refactor general — 2026-06-17

> Limpieza de código sin cambios de comportamiento. No se reorganizaron carpetas (se evaluó y se descartó para un repo de este tamaño — ver discusión, solo 2 componentes eran de una sola página).

| # | Descripción | Archivo(s) | Estado |
|---|-------------|------------|--------|
| R1 | Código muerto: `AppBarMenu.tsx` e `InitialTutorial.tsx` (huérfanos, nadie los importaba) | `components/layout/AppBarMenu.tsx`, `components/tutorial/InitialTutorial.tsx` | ✅ Borrados |
| R2 | `useLocation()` llamado sin usar su valor en `Documents.tsx` | `Documents.tsx` | ✅ Resuelto — import y llamada eliminados |
| R3 | 23+ `console.log` sueltos en catches de axios — debug residual y falta de consistencia | 14 archivos | ✅ Resuelto — se eliminó 1 línea de debug comentada (`Evaluation.tsx`) y se estandarizaron los catches reales a `console.error` |
| R4 | 15 archivos llamaban `axios` directo con `BACKEND_URL` y repetían el header `Authorization` en cada endpoint protegido — sin capa central de API | Todas las páginas + `useFavorites.ts` | ✅ Resuelto — nueva capa `src/api/` (`client.ts`, `auth.ts`, `user.ts`, `content.ts`) con interceptor que agrega el token automáticamente |
| R5 | Inconsistencia de nombre `evaluation.css` (minúscula) vs `Evaluation.tsx` | `pages/evaluation/` | ✅ Resuelto — renombrado a `Evaluation.css` |
| R6 | `ArticleCardModal.tsx` huérfano pero documentado como funcionalidad activa | `components/ArticleCardModal.tsx` | ✅ Borrado el 2026-10-26 (ver bug #9) |

---

## Arquitectura de datos

```
Backend local :8080 (MongoDB)  ←─ artículos, evaluaciones, presentaciones, tutorial, usuarios
localStorage                   ←─ caché de artículos/evaluaciones/presentaciones/quizzes, avatar URL, user_email (display)
sessionStorage                 ←─ token JWT, flag de sesión (login), búsqueda activa, scores de evaluación, resultado del quiz (sostekQuiz.result)
Google Drive                   ←─ solo el archivo de descarga del juego (zip) — ya no se usa para contenido
```

---

## Cómo correr el proyecto

Ve «Tus primeros 30 minutos» en `ONBOARDING_FRONTEND.md`. En resumen: `npm run dev:memoria` en el backend (contenido real, sin Atlas) y `npm run start` aquí.

---

## Despliegue

- **Frontend oficial:** Vercel, en `https://sostek.vercel.app`. Se publica solo al integrar a `main`.
- **Backend:** Render, en `https://sostek-backend.onrender.com`, con UptimeRobot para que no se duerma.
- **`CORS_ORIGIN`** del backend deja pasar `https://sostek.vercel.app` (verificado el 2026-11-24).
- **Sitios abandonados**, pendientes de baja: el sitio estático de Render (`sostek-frontend.onrender.com`), que CORS ya no deja pasar, y `sostek.pages.dev` (Cloudflare, la versión de 2022).
- **Dominio propio** (por ejemplo, `app.sostek.com.mx`): pendiente de decidir con la facultad. Los pasos están en `DESPLIEGUE.md`.

Las variables, el rollback, los respaldos y las apps nativas están en [`DESPLIEGUE.md`](DESPLIEGUE.md); las cuentas, en [`ACCESOS.md`](ACCESOS.md).

---

## Pendientes de la entrega (noviembre de 2026)

Esto queda para quien siga, más o menos en orden de importancia:

1. **Cuentas.** Identificar a los dueños de cada servicio y pasarlos a cuentas del proyecto o institucionales (`ACCESOS.md`). Es lo más importante: hoy varias dependen de personas que ya no están.
2. **Sitios abandonados.** Dar de baja el sitio estático de Render y `sostek.pages.dev`, o redirigirlos a `sostek.vercel.app`.
3. **Pruebas en producción** con una cuenta de prueba, no la de nadie real: guardar el puntaje, favoritos, recuperar la contraseña por correo y eliminar la cuenta. Se verificaron con el código y con tests, pero no en el navegador contra producción.
4. **Quiz:** que Carlos revise la retroalimentación; los niveles 1 y 2; decidir si el resultado se guarda en el perfil; traducir el contenido al inglés (ve la tabla de «Incompleto»).
5. **Imágenes de los artículos.** Están enlazadas a sitios ajenos y algunas ya no cargan. Conviene subirlas a Cloudinary y cambiar las URLs en `seed/content/articles.json` (backend).
6. **JUEGA online:** sigue como placeholder.
7. **Apps nativas:** antes de publicar en las tiendas, actualizar Capacitor (ve `DESPLIEGUE.md`).
8. **Deuda técnica.** Create React App está abandonado (la alternativa natural es Vite), y Ionic 6, React 18 y react-router 5 están varias versiones atrás. No bloquean nada hoy.
