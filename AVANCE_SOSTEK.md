# AVANCE SOSTEK — Fuente de Verdad del Proyecto

> Última actualización: 2026-06-05
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
│   │   └── AppBarMenu.tsx           # Menú lateral (IonMenu)
│   ├── ArticleCarrousel.tsx         # Carrusel horizontal de artículos y presentaciones
│   ├── ArticleCardModal.tsx         # Modal del artículo más reciente
│   ├── DocumentCard.tsx             # Tarjeta de artículo/presentación en la lista
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
│   ├── presentation/  Presentation.tsx # Viewer de slides
│   ├── evaluation/    Evaluation.tsx   # Evaluación con preguntas y checkboxes
│   ├── finalScoreEvaluation/ FinalScoreEvaluation.tsx # Resultados y feedback
│   └── profile/       Profile.tsx  # Edición de perfil del usuario
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
- **Detalle de artículo** (`/Documents/:id`) — carga desde `GET /articles/:id`
- **Viewer de presentaciones** (`/presentation/:driveId`) — slides verticales con Swiper desde `GET /presentations`
- **Tab 2 — JUEGA** — video del juego, enlace de descarga, placeholder "en construcción" para versión online
- **Tab 3 — EVALÚATE**
  - Lista de evaluaciones desde `GET /evaluations` (backend MongoDB)
  - Filtro por carrera: Arquitectura / Diseño Industrial / Otros
- **Evaluación** (`/Evaluation/:name/:id`) — preguntas desde `GET /evaluations/:id`, checkboxes, puntaje acumulado por categoría
- **Resultado de evaluación** (`/score/:name`) — puntaje, categoría más débil, feedback por rango (≥150, ≥120, ≥90, ≥50, <50), botón artículos recomendados
- **Tutorial inicial** — slides con personaje al primer acceso (aún desde Google Drive)
- **AppBar** — búsqueda, menú lateral con logout (limpia token), acceso a perfil, reactivación de tutorial
- **Perfil** — carga datos con `GET /user/profile`, edición con `POST /user/edit`, ambos con header JWT
- **Validación contraseña** — mínimo 6 caracteres en signup antes de llamar al backend

#### Fixes técnicos aplicados

- Migración completa de Google Sheets/Drive → backend MongoDB (artículos, evaluaciones, presentaciones)
- Eliminación de 6 hooks muertos de gapi (`useGetEvaluationData`, `useGetPresentations`, `useGetPresentationImages`, `useGetFirstImageOfPresentations`, `useGetSingleExcelAllData`, `useLocalStorage`)
- Eliminación de `NativeStorage` → `localStorage`
- Tab bar oculto en rutas `/` y `/SignUp`
- Rediseño completo mobile-first

---

### ⚠️ INCOMPLETO / A MEDIAS

| Elemento | Ubicación | Estado |
|----------|-----------|--------|
| Favoritos | `AppBarPopOver.tsx` | Visible en el menú, sin ruta ni lógica (backend aún no tiene endpoint) |
| Ajustes | `AppBarPopOver.tsx` | Visible en el menú, sin ruta ni lógica |
| Modo oscuro | `AppContext.tsx` | Variable `dark` definida, nunca aplicada a la UI |
| Juego online | `Tab2.tsx` | Placeholder "en construcción" |
| Tutorial | `InitialTutorial.tsx` | Aún carga desde Google Drive — pendiente migrar al backend |

---

### ❌ NO IMPLEMENTADO

- `POST /user/score` al terminar evaluación — backend listo, falta integrar en `FinalScoreEvaluation.tsx`
- `DELETE /user` — backend listo, falta UI en perfil
- Pantalla de recuperación de contraseña — backend listo (`/user/forgot-password`, `/user/reset-password`), falta pantalla en frontend
- Sistema de favoritos (backend aún no tiene endpoint)
- Pantalla de ajustes
- Modo oscuro funcional
- Juego online en Tab 2 (Unity WebGL — largo plazo)
- Recuperación de contraseña

---

## Prioridades recomendadas

### 🟡 Importante (backend ya listo, solo falta frontend)

1. **`POST /user/score`** en `FinalScoreEvaluation.tsx` — enviar puntaje si usuario logueado
2. **`DELETE /user`** — botón "Eliminar cuenta" en `Profile.tsx`
3. **Pantalla de recuperación de contraseña** — link en `LogIn.tsx` + nueva pantalla con dos pasos (email → token → nueva contraseña)

### 🟢 Backlog

4. Migrar tutorial de Google Drive al backend
5. Pantalla de Favoritos (requiere endpoint backend)
6. Pantalla de Ajustes
7. Modo oscuro funcional
8. Juego online en Tab 2

---

## Arquitectura de datos

```
Backend local :8080 (MongoDB)  ←─ artículos, evaluaciones, presentaciones, usuarios
localStorage                   ←─ caché de artículos, estado del tutorial, token JWT, sesión
sessionStorage                 ←─ búsqueda activa, scores de evaluación
Google Drive                   ←─ tutorial (pendiente migrar) + archivo descarga del juego
```

---

## Cómo correr el proyecto

```bash
npm install
npm run start        # dev server en http://localhost:3000
```

El backend debe estar corriendo por separado en `http://localhost:8080`.

> ⚠️ Al correr por primera vez después de la migración a MongoDB, limpiar la clave `articles` de `localStorage` en el navegador para evitar conflictos con el formato anterior.
