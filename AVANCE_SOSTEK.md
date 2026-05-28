# AVANCE SOSTEK — Fuente de Verdad del Proyecto

> Última actualización: 2026-05-28 (sesión 3)  
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

## Estado actual por módulo

### ✅ IMPLEMENTADO Y FUNCIONAL

> Resuelto en sesión 2:
> - Pantalla gris al entrar como invitado — hooks ahora terminan loading siempre (`.catch()` + optional chaining + guards en Tab1 y ArticleCarrousel)
> - Repositorio reorganizado — archivos muertos eliminados, `components/layout/` creado, imports limpiados

- **Login / Registro** — formularios completos, integración con backend (`/user/login`, `/user/signup`). Sesión guardada en `sessionStorage`.
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
- **Perfil** — edición de nombre y apellido (`/user/edit`)

---

### 🐛 BUGS RESUELTOS

1. ✅ **Pantalla gris al entrar como invitado** — hooks con `.catch()` + optional chaining + guards en Tab1 y ArticleCarrousel
2. ✅ **Ruta `/score/:name` registrada en `App.tsx`** — flujo de evaluación completo
3. ✅ **Mensajes de resultado reescritos** — `FinalScoreEvaluation` con lógica limpia y 5 rangos distintos
4. ✅ **Profile campos reconectados** — `birthDate`, `occupation`, `gender` conectados al estado y al POST
5. ✅ **README rehecho** — comando correcto, estructura, variables de entorno
6. ✅ **`NativeStorage` eliminado** — reemplazado por `sessionStorage` en `Evaluation.tsx` y demás archivos
7. ✅ **Repositorio reorganizado** — archivos muertos eliminados, `components/layout/` creado

---

### ⚠️ INCOMPLETO / A MEDIAS

| Elemento | Ubicación | Estado |
|----------|-----------|--------|
| Favoritos | `AppBarPopOver.tsx:74` | Visible en el menú, sin ruta ni lógica |
| Ajustes | `AppBarPopOver.tsx:90` | Visible en el menú, sin ruta ni lógica |
| Modo oscuro | `AppContext.tsx` | Variable `dark` definida, nunca aplicada a la UI |
| Juego online | `Tab2.tsx` | Placeholder "en construcción" |
| Categoría "Otros" en evaluaciones | `Tab3.tsx:42` | Retorna `<div></div>` vacío, sin contenido |
| `FinalScoreEvaluation` | `App.tsx` | ~~Importado pero sin ruta registrada~~ import limpiado, **la ruta sigue faltando** (ver bug #1) |

---

### ❌ NO IMPLEMENTADO

- Juego "Survivor" versión online (requiere desarrollo en Unity + WebGL export)
- Sistema de favoritos (guardar artículos)
- Pantalla de ajustes
- Modo oscuro funcional
- Backend incluido en el repo (está desacoplado — se asume servidor local en `:8080`)
- Autenticación persistente (al refrescar la app, la sesión se pierde porque usa `sessionStorage`)
- Recuperación de contraseña
- Notificaciones push

---

## Prioridades recomendadas

### 🔴 Urgente (bugs que bloquean flujos completos)

1. **Registrar la ruta `/score/:name`** en `App.tsx` → desbloquea el flujo completo de evaluación
2. **Corregir mensajes de resultado** en `FinalScoreEvaluation.tsx` → feedback real al usuario
3. **Reconectar campos del perfil** en `Profile.tsx` → guardar todos los campos

### 🟡 Importante (mejoras de calidad)

4. Eliminar todas las llamadas a `NativeStorage` y usar solo `sessionStorage` / `localStorage` en web
5. Cambiar `sessionStorage` por `localStorage` en el login → sesión persistente al refrescar
6. Corregir README: `npm run start`

### 🟢 Backlog (funcionalidades nuevas)

7. Implementar pantalla de Favoritos
8. Implementar pantalla de Ajustes (toggle modo oscuro, idioma, etc.)
9. Implementar modo oscuro completo
10. Juego online en Tab 2 (Unity WebGL)
11. Agregar contenido a la categoría "Otros" en Tab 3

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
