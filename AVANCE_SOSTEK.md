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
├── context/
│   └── AppContext.tsx               # Estado global: search, tutorial, dark, transparentToolbar
├── components/
│   ├── layout/
│   │   ├── AppBarPopOver.tsx        # Toolbar: búsqueda, menú lateral, logout
│   │   └── AppBarMenu.tsx           # ⚠️ HUÉRFANO — ya no se importa en ningún lado (reemplazado por AppBarPopOver en Documents.tsx)
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
│   ├── useGetDocuments.ts           # Documentos desde Drive (solo tutorial)
│   └── useGetArticlesData.ts        # Hook legacy — solo usado por TutorialComponent
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
| `/Profile` | `Profile` | Perfil del usuario |
| `/Documents/:id` | `Documents` | Detalle de artículo |
| `/presentation/:driveId` | `Presentation` | Viewer de presentación |
| `/Evaluation/:name/:id` | `Evaluation` | Cuestionario de evaluación |
| `/score/:name` | `FinalScoreEvaluation` | Resultado de evaluación |

---

## Estado actual por módulo

### ✅ IMPLEMENTADO Y FUNCIONAL

- **Login / Registro** — formularios completos, JWT guardado en `localStorage`, redirige a `/tab1`
- **Tab 1 — APRENDE**
  - Artículos cargados desde `GET /articles` (backend MongoDB)
  - Modal del artículo más reciente al entrar
  - Carrusel de artículos + presentaciones desde `GET /presentations`
  - Búsqueda con normalización de tildes
  - Filtro por tipo (Artículos / Presentaciones / Ambos)
  - Caché offline en `localStorage`
- **Detalle de artículo** (`/Documents/:id`) — carga desde `GET /articles/:id`; diseño dark con hero 240px, badge de categoría, tipografía legible, párrafos separados por `\n`, botón de regreso
- **Viewer de presentaciones** (`/presentation/:driveId`) — slides horizontales con Swiper desde `GET /presentations`
- **Tab 2 — JUEGA** — video del juego, enlace de descarga, instructivo completo (reglas, tipos de tarjeta, cartas filtradas por tipo) desde `GET /tutorial`; placeholder "en construcción" para versión online
- **Tab 3 — EVALÚATE**
  - Lista de evaluaciones desde `GET /evaluations` (backend MongoDB)
  - Filtro por carrera: Arquitectura / Diseño Industrial / Otros
- **Evaluación** (`/Evaluation/:name/:id`) — preguntas desde `GET /evaluations/:id`, checkboxes, puntaje acumulado por categoría
- **Resultado de evaluación** (`/score/:name`) — puntaje, categoría más débil, feedback por rango (≥150, ≥120, ≥90, ≥50, <50), botón artículos recomendados
- **AppBar** — búsqueda, menú lateral con logout (limpia token), acceso a perfil/favoritos; ID único por instancia (sin conflictos entre tabs)
- **Perfil** — carga datos con `GET /user/profile`, edición con `POST /user/edit`, ambos con header JWT
- **Validación contraseña** — mínimo 6 caracteres en signup antes de llamar al backend
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
| Modo oscuro | `AppContext.tsx` | Variable `dark` definida, nunca aplicada a la UI |
| Juego online | `Tab2.tsx` | Placeholder "en construcción" |
| Tutorial popup (InitialTutorial) | `InitialTutorial.tsx` | Ya no se usa desde Tab1; el contenido del tutorial está integrado en Tab2 |

---

### ❌ NO IMPLEMENTADO

- Pantalla de ajustes
- Modo oscuro funcional
- Juego online en Tab 2 (Unity WebGL — largo plazo)

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
| 8 | Logo de Sostek como botón de inicio es pequeño y no intuitivo | `AppBarPopOver.tsx` |
| ~~9~~ | ~~Tab2: separar texto en dos líneas~~ | ✅ Resuelto |
| ~~Header~~ | ~~Header verde brillante no sigue aesthetic dark~~ | ✅ Resuelto — dark `#0d1a0d` + borde inferior + searchbar integrado + popover oscuro |
| 10 | Imágenes lentas al cargar (sin lazy loading ni placeholder optimizado) | `DocumentCard.tsx`, `ArticleCarrousel.tsx` |
| 11 | Filtro de búsqueda lento (sin debounce) | `AppBarPopOver.tsx`, `ArticleCarrousel.tsx` |

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
11. Logo de Sostek no intuitivo como botón de inicio (`AppBarPopOver.tsx`)

### 🟢 Backlog

12. Debounce en búsqueda
13. Lazy loading de imágenes optimizado
14. Reemplazar IonAlert por toasts/notificaciones custom ✅ (hecho)
14. Pantalla de Ajustes
15. Modo oscuro funcional
16. Juego online en Tab 2
17. ⚠️ Foto de perfil — subir imagen desde el dispositivo, guardar en Cloudinary, mostrar en avatar de perfil (requiere cambios en backend: nuevo endpoint + campo `avatar` en modelo de usuario)
18. ⚠️ Campo `description` en evaluaciones — frontend listo, backend debe agregar el campo al modelo y seed (descripciones sugeridas en `INFO_FRONTEND.md`)

---

## Arquitectura de datos

```
Backend local :8080 (MongoDB)  ←─ artículos, evaluaciones, presentaciones, tutorial, usuarios
localStorage                   ←─ caché de artículos, token JWT, sesión
sessionStorage                 ←─ búsqueda activa, scores de evaluación
Google Drive                   ←─ solo el archivo de descarga del juego (zip) — ya no se usa para contenido
```

---

## Cómo correr el proyecto

```bash
npm install
npm run start        # dev server en http://localhost:3000
```

El backend debe estar corriendo por separado en `http://localhost:8080`.

> ⚠️ Al correr por primera vez después de la migración a MongoDB, limpiar la clave `articles` de `localStorage` en el navegador para evitar conflictos con el formato anterior.
