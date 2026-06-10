# AVANCE SOSTEK — Fuente de Verdad del Proyecto

> Última actualización: 2026-06-09
> Rama activa: `development`
> Stack: Ionic React 6 + TypeScript + Capacitor 4 + Backend Node.js/MongoDB

---

## ¿Qué es este repositorio?

La aplicación **web/móvil de SOSTEK**: una plataforma educativa de sostenibilidad para estudiantes y docentes de la facultad. Tiene tres secciones principales accesibles desde el menú inferior:

| Tab | Nombre | Propósito |
|-----|--------|-----------|
| 1 | **APRENDE** | Artículos y presentaciones de sostenibilidad (contenido desde backend MongoDB) |
| 2 | **JUEGA** | Videojuego "Survivor" — versión física descargable + video; versión online pendiente |
| 3 | **EVALÚATE** | Evaluaciones tipo cuestionario para medir el nivel de sostenibilidad de proyectos académicos |

El backend (login/registro/perfil/contenido) es un servidor externo en `http://localhost:8080` que **no está en este repositorio**.

---

## Estructura del proyecto

```
src/
├── App.tsx                          # Router principal + MainTabs + lógica de ocultar tab bar
├── config.ts                        # BACKEND_URL desde variable de entorno REACT_APP_BACKEND_URL
├── context/
│   └── AppContext.tsx               # Estado global: search, tutorial, score, transparentToolbar
├── components/
│   ├── ErrorBoundary.tsx            # Error boundary global — pantalla de error con botón "Reintentar"
│   ├── PrivateRoute.tsx             # HOC de ruta privada — redirige a / si no hay sesión activa
│   ├── layout/
│   │   ├── AppBarPopOver.tsx        # Toolbar: búsqueda, menú lateral, logout
│   │   └── AppBarMenu.tsx           # ⚠️ HUÉRFANO — ya no se importa en ningún lado
│   ├── ArticleCarrousel.tsx         # Carrusel horizontal de artículos y presentaciones
│   ├── ArticleCardModal.tsx         # Modal del artículo más reciente
│   ├── DocumentCard.tsx             # Tarjeta de artículo/presentación en la lista (con botón favorito)
│   ├── EvaluationCard.tsx           # Tarjeta de evaluación en Tab3
│   ├── QuestionTestCard.tsx         # Tarjeta de pregunta con checkboxes
│   ├── TutorialCard.tsx             # Slide individual del tutorial (legacy, no usado activamente)
│   └── tutorial/
│       ├── InitialTutorial.tsx      # Tutorial — ya no se usa desde Tab1; Tab2 consume GET /tutorial directamente
│       └── TutorialComponent.tsx   # Wrapper del tutorial (legacy)
├── pages/
│   ├── logIn/         LogIn.tsx          # Pantalla de inicio de sesión
│   ├── signUp/        SignUp.tsx          # Pantalla de registro
│   ├── forgotPassword/ ForgotPassword.tsx # Solicitud de token de recuperación
│   ├── resetPassword/  ResetPassword.tsx  # Cambio de contraseña con token
│   ├── tab1/          Tab1.tsx            # APRENDE — artículos + presentaciones
│   ├── tab2/          Tab2.tsx            # JUEGA — video + descarga
│   ├── tab3/          Tab3.tsx            # EVALÚATE — lista de evaluaciones
│   ├── document/      Documents.tsx       # Detalle completo de un artículo
│   ├── presentation/  Presentation.tsx    # Viewer de slides
│   ├── evaluation/    Evaluation.tsx      # Evaluación con preguntas y checkboxes
│   ├── finalScoreEvaluation/ FinalScoreEvaluation.tsx # Resultados y feedback
│   └── profile/       Profile.tsx         # Edición de perfil del usuario
├── hooks/
│   ├── useFavorites.ts              # GET/POST/DELETE /user/favorites con optimistic update
│   ├── useGetDocuments.ts           # Hook legacy — solo usado por TutorialComponent
│   └── useGetArticlesData.ts        # Hook legacy — solo usado por TutorialComponent
├── utils/
│   ├── scoring.ts                   # Lógica pura: getFeedback, applyAnswer, computeCategoryScores, clearScoreSession
│   └── search.ts                    # normalize() — elimina tildes y pasa a minúsculas
├── __tests__/
│   ├── scoring.test.ts              # 14 tests: rangos de feedback, seleccionar/deseleccionar, agrupación por categoría
│   ├── search.test.ts               # 5 tests: tildes, mayúsculas, cadena vacía
│   └── favorites.test.ts            # 6 tests: isFavorite, add, remove, lista vacía
└── models/
    └── File.ts                      # Modelo legacy — solo usado por tutorial
```

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

---

## Estado actual por módulo

### ✅ IMPLEMENTADO Y FUNCIONAL

- **Login / Registro** — formularios completos, JWT guardado en `sessionStorage`, redirige a `/tab1`
- **Tab 1 — APRENDE**
  - Artículos cargados desde `GET /articles` (backend MongoDB)
  - Modal del artículo más reciente al entrar
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
- **Guardar puntaje** (`POST /user/score`) — se envía `score_test` al backend al finalizar una evaluación si el usuario está logueado
- **Recuperación de contraseña** — pantalla `ForgotPassword.tsx` (email → token por response) + `ResetPassword.tsx` (token + nueva contraseña); rutas `/ForgotPassword` y `/ResetPassword`; link desde `LogIn.tsx`
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
| Ajustes | `AppBarPopOver.tsx` | Visible en el menú, sin ruta ni lógica |
| Juego online | `Tab2.tsx` | Placeholder "en construcción" |
| Tutorial popup (InitialTutorial) | `InitialTutorial.tsx` | Ya no se usa desde Tab1; el contenido del tutorial está integrado en Tab2 |

---

### ❌ NO IMPLEMENTADO

- Pantalla de ajustes
- Juego online en Tab 2 (Unity WebGL — largo plazo)

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
| ~~T1~~ | ~~Unit tests frontend (Jest)~~ | ✅ Resuelto — 23 tests en 3 suites: `scoring.test.ts` (getFeedback, applyAnswer, computeCategoryScores, clearScoreSession), `search.test.ts` (normalize con tildes), `favorites.test.ts` (isFavorite, add, remove) |

### 🔒 SEGURIDAD / CALIDAD — PENDIENTE BACKEND

| # | Tarea | Detalle |
|---|-------|---------|
| BS1 | Variables de entorno | Documentar y verificar que ningún secreto esté hardcodeado en el repo del backend |
| BS2 | Sanitizar inputs + NoSQL injection | `express-mongo-sanitize` (global) + `express-validator` por endpoint + `helmet`. Código listo en `INFO_PARA_BACKEND.md` → sección BS2 |
| BS5 | HTTPS / SSL (producción) | El backend corre en HTTP — para deploy: configurar TLS en el servidor (nginx/caddy o plataforma como Railway/Render). Sin HTTPS, tokens y contraseñas viajan en texto plano y los navegadores bloquean llamadas HTTP desde un frontend HTTPS (mixed content). No aplica en desarrollo local. |
| BT1 | Unit tests backend (Jest + Supertest) | Testear validaciones, lógica de autenticación, queries a MongoDB |

---

### 🐛 BUGS CONOCIDOS

| # | Descripción | Archivo(s) | Prioridad |
|---|-------------|------------|-----------|
| ~~1~~ | ~~Logout redirige a Perfil en vez de login~~ | ✅ Resuelto — `history.replace('/')` | ~~Alta~~ |
| ~~2~~ | ~~Menú hamburguesa roto en Juega y Evalúate~~ | ✅ Resuelto — ID único por instancia + `IonButton` | ~~Alta~~ |
| ~~3~~ | ~~Llamadas a gapi/Google Drive con 403 en consola~~ | ✅ Resuelto — tutorial migrado a `GET /tutorial` | ~~Alta~~ |
| ~~4~~ | ~~Presentaciones se ven de lado~~ | ✅ Resuelto — quitado `rotate(90deg)` del CSS | ~~Alta~~ |
| ~~5~~ | ~~Guardar cambios en Perfil no redirige a APRENDE~~ | ✅ Resuelto — `history.replace('/tab1')` tras éxito | ~~Media~~ |
| 6 | aria-hidden sobre elemento con focus en página de presentación | `Presentation.tsx` — warning de accesibilidad de Ionic | Baja |
| ~~7~~ | ~~Meta tag deprecated~~ | ✅ Resuelto — agregado `mobile-web-app-capable` + quitado script gapi | ~~Baja~~ |
| 8 | `Failed to mount content script UI: could not find anchor element` en consola | Error de extensión del navegador (all.js), **no es un bug de la app** — ignorar | Ninguna |

---

### 🎨 MEJORAS DE DISEÑO PENDIENTES

| # | Descripción | Archivo(s) |
|---|-------------|------------|
| ~~1~~ | ~~Página de Perfil no sigue la aesthetic~~ | ✅ Resuelto — dark bg + card oscuro + avatar |
| ~~2~~ | ~~Alertas feos, no siguen la temática oscura~~ | ✅ Resuelto — IonToast para errores, IonAlert dark para confirmaciones destructivas |
| ~~3~~ | ~~Tab bar footer poco estético~~ | ✅ Resuelto — dark theme + íconos + píldora activa + borde |
| ~~4~~ | ~~Evaluación con diseño viejo~~ | ✅ Resuelto — dark theme + cards oscuras |
| 5 | Las evaluaciones no tienen descripción — frontend listo, falta campo `description` en backend | `EvaluationCard.tsx` usa `description` del backend si existe, fallback hardcodeado mientras tanto |
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
21. Pantalla de Ajustes (visible en menú, sin ruta ni lógica)
22. Juego online en Tab 2 (Unity WebGL — largo plazo)
23. ✅ Foto de perfil — frontend completo (upload + crop + reposición + header) + backend implementado (`POST /user/avatar` en Cloudinary)
24. ⚠️ Campo `description` en evaluaciones — frontend listo; backend debe agregar campo al modelo y seed (ver `INFO_PARA_BACKEND.md`)
25. ⚠️ Imágenes rotas en 3 artículos — backend debe actualizar URLs en MongoDB (ver `INFO_PARA_BACKEND.md`)
26. ⚠️ [LARGO PLAZO] Imágenes de artículos generadas con IA — generar 26 imágenes en Leonardo.ai (FLUX Schnell, 16:9, Stock Photo, Prompt Enhance Off), descargar nombradas como `01-cambio-climatico.jpg` etc., el backend las sube a Cloudinary y actualiza el campo `image` en MongoDB.

---

## 🆕 Correcciones pendientes — revisión 2026-06-10

> QA manual (jefa). Pendientes de frontend — algunos dependen de cambios del backend documentados en `INFO_PARA_BACKEND.md` (sección "Pendientes — revisión frontend 2026-06-10").

| # | Descripción | Archivo(s) | Depende de backend |
|---|-------------|------------|---------------------|
| C1 | Barra de búsqueda solo visible en APRENDE — ocultarla en JUEGA y EVALÚATE | `AppBarPopOver.tsx` | No |
| C2 | Mostrar foto de perfil en el header desde que se inicia sesión (hoy solo aparece después de entrar a Perfil al menos una vez) | `LogIn.tsx` | No |
| C3 | Agregar botón de regreso en presentaciones, igual que en artículos | `Presentation.tsx` | No |
| C4 | La presentación "Social Innovation and Design" abre en la última slide en vez de la primera — el orden de `slides` en el backend es correcto (Slide1→Slide5), es config de Swiper | `Presentation.tsx` | No |
| C5 | Quitar botón "Ajustes" del menú (sin funcionalidad por ahora, se puede reagregar a futuro) | `AppBarPopOver.tsx`, `Documents.tsx` | No |
| C6 | Cambiar texto de descarga en JUEGA: "Descarga y juega sin conexión a internet" → "Imprime las cartas y juega con tus amigos" | `Tab2.tsx` | No |
| C7 | Bug: tras tocar "Artículos recomendados" y volver a EVALÚATE, no aparecen evaluaciones hasta tocar un filtro de carrera — el `search` global queda con el nombre de la categoría débil y filtra también las evaluaciones de Tab3 | `Tab3.tsx` | No |
| C8 | Rediseñar pantalla de resultados (`/score/:name`, aplica a todas las evaluaciones) con el dark theme del resto de la app | `FinalScoreEvaluation.tsx`, `.css` | No |
| C9 | Numerar cada pregunta de la evaluación (inciso 1, 2, 3...) | `Evaluation.tsx`, `QuestionTestCard.tsx` | No |
| C10 | Mostrar el total de preguntas en cada tarjeta de evaluación (Tab3) | `EvaluationCard.tsx`, `Tab3.tsx` | Sí — backend agrega `question_count` (B4) |
| C11 | Mostrar el puntaje máximo posible junto al obtenido en resultados — se calcula sumando los valores positivos de cada pregunta de `/evaluations/:id`, no requiere datos nuevos | `Evaluation.tsx` (calcular y guardar en sessionStorage), `FinalScoreEvaluation.tsx` (mostrar) | No |
| C12 | Solo aparece 1 artículo recomendado al terminar una evaluación — causa raíz: los 26 artículos tienen `category: null` en MongoDB, por lo que el filtro por categoría nunca matchea | — | Sí — backend puebla `category` (B2) |
| C13 | 2 artículos ("El impacto del cine en el medio ambiente" y "La Catástrofe Industrial de Bhopal...") se ven con diseño viejo — en realidad tienen datos rotos (encoding corrupto y campos vacíos/desordenados), no es un problema de UI | — | Sí — backend corrige datos (B1) |
| C14 | Descripciones de evaluaciones con el rango de semestre por nivel (Nivel 1: 3°-4°, Nivel 2: 5°-6°, Nivel 3: 7°-8°) | `EvaluationCard.tsx` (fallback opcional mientras tanto) | Sí — backend llena `description` (B3) |
| C15 | El footer (tab bar) al entrar a un artículo o presentación no es el mismo que en APRENDE/EVALÚATE/JUEGA — revisar `IonTabBar` en `App.tsx` y por qué difiere en `Documents.tsx` / `Presentation.tsx` | `App.tsx`, `Documents.tsx`, `Presentation.tsx` | No |

---

## Arquitectura de datos

```
Backend local :8080 (MongoDB)  ←─ artículos, evaluaciones, presentaciones, tutorial, usuarios
localStorage                   ←─ caché de artículos/evaluaciones/presentaciones, avatar URL, user_email (display)
sessionStorage                 ←─ token JWT, flag de sesión (login), búsqueda activa, scores de evaluación
Google Drive                   ←─ solo el archivo de descarga del juego (zip) — ya no se usa para contenido
```

---

## Cómo correr el proyecto

```bash
npm install
npm run start        # dev server en http://localhost:3000
```

El backend debe estar corriendo por separado en `http://localhost:8080`.

---

## Despliegue (Render)

- **Backend** ya está desplegado en `https://sostek-backend.onrender.com` (con UptimeRobot configurado para que no se duerma).
- **Frontend** — pendiente: configurar la variable de entorno `REACT_APP_BACKEND_URL=https://sostek-backend.onrender.com` en el panel de Render del servicio del frontend (es una env var de build de CRA, no alcanza con cambiar `.env.example`).
- En desarrollo local todo sigue igual: `REACT_APP_BACKEND_URL` no se define y `src/config.ts` cae al fallback `http://localhost:8080`.

> ⚠️ Al correr por primera vez después de la migración a MongoDB, limpiar la clave `articles` de `localStorage` en el navegador para evitar conflictos con el formato anterior.
