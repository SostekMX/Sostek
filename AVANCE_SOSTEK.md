# AVANCE SOSTEK — Fuente de Verdad del Proyecto

> Última actualización: 2026-05-28 (revisado contra código real)  
> Rama activa: `development`  
> Stack: Ionic React 6 + TypeScript + Capacitor 4 + Google APIs

---

## ¿Qué es este repositorio?

La aplicación **web/móvil de SOSTEK**: una plataforma educativa de sostenibilidad para estudiantes y docentes de la facultad. Tiene tres secciones principales accesibles desde el menú inferior:

| Tab | Nombre | Propósito |
|-----|--------|-----------|
| 1 | **APRENDE** | Artículos y presentaciones de sostenibilidad (contenido desde Google Sheets + Google Drive) |
| 2 | **JUEGA** | Videojuego "Survivor" — versión física descargable + video; versión online pendiente |
| 3 | **EVALÚATE** | Evaluaciones tipo cuestionario para medir el nivel de sostenibilidad de proyectos académicos |

El backend de usuarios (login/registro/perfil) es un servidor externo en `http://localhost:8080` que **no está en este repositorio**.

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
│   │   └── AppBarMenu.tsx           # Menú lateral (IonMenu)
│   ├── ArticleCarrousel.tsx         # Carrusel horizontal de artículos
│   ├── ArticleCardModal.tsx         # Modal del artículo más reciente
│   ├── DocumentCard.tsx             # Tarjeta de artículo en la lista
│   ├── EvaluationCard.tsx           # Tarjeta de evaluación en Tab3
│   ├── QuestionTestCard.tsx         # Tarjeta de pregunta con checkboxes
│   ├── TutorialCard.tsx             # Slide individual del tutorial
│   └── tutorial/
│       ├── InitialTutorial.tsx      # Tutorial completo al primer acceso
│       └── TutorialComponent.tsx   # Wrapper del tutorial
├── pages/
│   ├── logIn/         LogIn.tsx     # Pantalla de inicio de sesión
│   ├── signUp/        SignUp.tsx    # Pantalla de registro
│   ├── tab1/          Tab1.tsx      # APRENDE — artículos + presentaciones
│   ├── tab2/          Tab2.tsx      # JUEGA — video + descarga
│   ├── tab3/          Tab3.tsx      # EVALÚATE — lista de evaluaciones
│   ├── document/      Documents.tsx # Detalle completo de un artículo
│   ├── presentation/  Presentation.tsx # Viewer de slides de Drive
│   ├── evaluation/    Evaluation.tsx   # Evaluación con preguntas y checkboxes
│   ├── finalScoreEvaluation/ FinalScoreEvaluation.tsx # Resultados y feedback
│   └── profile/       Profile.tsx  # Edición de perfil del usuario
└── hooks/
    ├── useGetArticlesData.ts        # Artículos desde Google Sheets (con caché localStorage)
    ├── useGetDocuments.ts           # Documentos desde Drive
    ├── useGetEvaluationData.ts      # Preguntas/respuestas/puntos desde Sheets
    ├── useGetFirstImageOfPresentations.ts # Thumbnail de cada presentación
    ├── useGetPresentationImages.ts  # Todas las imágenes de una presentación
    ├── useGetPresentations.ts       # Lista de presentaciones desde Drive
    ├── useGetSingleExcelAllData.ts  # Lector genérico de Google Sheets
    └── useLocalStorage.ts           # Hook de sincronización con localStorage
```

---

## Rutas registradas

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | `LogIn` | Pantalla de login (tab bar oculto) |
| `/SignUp` | `SignUp` | Registro (tab bar oculto) |
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

- **Login / Registro** — formularios completos, integración con backend (`/user/login`, `/user/signup`). ⚠️ El token JWT de la respuesta no se guarda — ver bugs conocidos.
- **Tab 1 — APRENDE**
  - Artículos cargados desde Google Sheets (hook `useGetSingleExcelAllData`)
  - Modal del artículo más reciente al entrar
  - Carrusel de artículos + presentaciones de Drive
  - Búsqueda con normalización de tildes
  - Filtro por tipo (Artículos / Presentaciones / Ambos)
  - Caché offline en `localStorage`
- **Detalle de artículo** (`/Documents/:id`) — muestra imagen, título y cuerpo completo
- **Viewer de presentaciones** (`/presentation/:driveId`) — slides verticales con Swiper + lazy loading desde Drive
- **Tab 2 — JUEGA** — video del juego, enlace de descarga, mensaje "en construcción" para versión online
- **Tab 3 — EVALÚATE**
  - Lista de evaluaciones desde Google Drive (Google Sheets)
  - Filtro por carrera: Arquitectura / Diseño Industrial / Otros
- **Evaluación** (`/Evaluation/:name/:id`) — preguntas con checkboxes, puntaje acumulado por categoría
- **Resultado de evaluación** (`/score/:name`) — muestra puntaje, categoría más débil, botón de artículos recomendados
- **Tutorial inicial** — slides con personaje al primer acceso (contenido desde Drive)
- **AppBar** — búsqueda, menú lateral con logout, acceso a perfil, reactivación de tutorial
- **Perfil** — edición de nombre, apellido, fecha de nacimiento, ocupación y sexo (`POST /user/edit`)
- **Resultado de evaluación** (`/score/:name`) — ruta registrada, mensajes de feedback diferenciados por rango (≥150, ≥120, ≥90, ≥50, <50)

---

### 🐛 BUGS CONOCIDOS (rompen funcionalidad)

| Bug | Archivo | Detalle |
|-----|---------|---------|
| Token JWT no se guarda al hacer login | `LogIn.tsx:25` | La respuesta del backend incluye `token` pero nunca se hace `localStorage.setItem('token', ...)`. Sin el token, todos los endpoints protegidos fallan |
| Token JWT no se guarda al hacer signup | `SignUp.tsx:45` | Mismo problema — el usuario hace signup pero queda sin sesión activa |
| `POST /user/edit` no envía header JWT | `Profile.tsx:22` | El backend ahora requiere `Authorization: Bearer <token>`. Sin el header, devuelve `Token requerido` y no guarda ningún cambio |
| Perfil no carga datos del usuario | `Profile.tsx` | Solo lee el email de `localStorage`. Nunca llama a `GET /user/profile`, por lo que nombre, apellido y demás campos siempre aparecen vacíos |

#### Fixes técnicos aplicados

- Eliminación de `NativeStorage` → reemplazado con `localStorage` (NativeStorage solo funciona compilado como app nativa, rompe en web)
- Pantalla gris al cargar sin API keys corregida
- `tsconfig` limpiado de opciones obsoletas
- Declaración de tipos para archivos `.css` añadida (`*.d.ts`)
- Tab bar oculto en rutas `/` y `/SignUp` via `HIDE_TABBAR_PATHS` en `App.tsx`
- Rediseño completo mobile-first: login, registro, tabs, tarjetas, perfil y resultados de evaluación

---

### ⚠️ INCOMPLETO / A MEDIAS

| Elemento | Ubicación | Estado |
|----------|-----------|--------|
| Favoritos | `AppBarPopOver.tsx:74` | Visible en el menú, sin ruta ni lógica |
| Ajustes | `AppBarPopOver.tsx:90` | Visible en el menú, sin ruta ni lógica |
| Modo oscuro | `AppContext.tsx` | Variable `dark` definida, nunca aplicada a la UI |
| Juego online | `Tab2.tsx` | Placeholder "en construcción" |
| Categoría "Otros" en evaluaciones | `Tab3.tsx:42` | Retorna `<div></div>` vacío, sin contenido |

---

### ❌ NO IMPLEMENTADO

- Juego "Survivor" versión online (requiere desarrollo en Unity + WebGL export)
- Sistema de favoritos (guardar artículos)
- Pantalla de ajustes
- Modo oscuro funcional
- Backend incluido en el repo (está desacoplado — se asume servidor local en `:8080`)
- Autenticación persistente completa (el token se guarda en `localStorage` pero los endpoints protegidos aún no lo usan — ver bugs urgentes)
- Recuperación de contraseña
- Notificaciones push

---

## Prioridades recomendadas

### 🔴 Urgente (bugs que bloquean flujos completos)

1. **Guardar token JWT en login y signup** — en `LogIn.tsx` y `SignUp.tsx`, agregar `localStorage.setItem('token', response.data.token)` al recibir respuesta exitosa. Sin esto, todos los endpoints protegidos están rotos
2. **Agregar header JWT a `POST /user/edit`** — en `Profile.tsx`, enviar `{ headers: { Authorization: \`Bearer ${localStorage.getItem('token')}\` } }` en la llamada Axios
3. **Cargar datos del usuario en perfil con `GET /user/profile`** — en `Profile.tsx`, llamar al endpoint al montar el componente para poblar nombre, apellido y demás campos

### 🟡 Importante (mejoras de calidad)

4. **Validación de contraseña mínimo 6 caracteres en signup** — en `SignUp.tsx`, validar antes de llamar al backend para dar feedback inmediato al usuario
5. **Llamar a `POST /user/score` al terminar una evaluación** — en `FinalScoreEvaluation.tsx`, si el usuario está logueado, enviar el puntaje final al backend para persistirlo en su cuenta
6. **Logout debe limpiar el token** — en `AppBarPopOver.tsx:logOutUser`, agregar `localStorage.removeItem('token')` además del `login: 'false'` existente

### 🟢 Backlog (funcionalidades nuevas)

7. **Opción "Eliminar cuenta"** en perfil o ajustes — llama a `DELETE /user` con el token JWT
8. **Llamar a `POST /user/score` al terminar el juego** — cuando la versión online de Tab 2 esté implementada
9. Implementar pantalla de Favoritos
10. Implementar pantalla de Ajustes (toggle modo oscuro, idioma, etc.)
11. Implementar modo oscuro completo
12. Juego online en Tab 2 (Unity WebGL)
13. Agregar contenido a la categoría "Otros" en Tab 3

---

## Arquitectura de datos

```
Google Sheets (ID hardcoded)  ←─ artículos/noticias (Tab 1)
Google Drive (IDs en .env)    ←─ presentaciones (Tab 1), evaluaciones (Tab 3), tutorial
Backend local :8080           ←─ usuarios (login, signup, profile)
localStorage                  ←─ caché de artículos, estado del tutorial
sessionStorage                ←─ sesión del usuario, búsqueda activa, scores de evaluación
```

**Variables de entorno requeridas** (archivo `.env` en raíz, no incluido en el repo):
- `REACT_APP_PRIVATE_API_KEY` — API Key de Google
- `REACT_APP_PRESENTATIONS_DRIVE_ID` — ID de carpeta de presentaciones en Drive
- `REACT_APP_EVALUATION_DRIVE_ID` — ID de carpeta de evaluaciones en Drive
- `REACT_APP_TUTORIAL_DRIVE_ID` — ID de carpeta del tutorial en Drive

---

## Cómo correr el proyecto

```bash
npm install
npm run start        # dev server en http://localhost:3000
```

El backend de usuarios debe estar corriendo por separado en `http://localhost:8080`.
