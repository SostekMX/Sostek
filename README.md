# Sostek

Plataforma educativa digital de sostenibilidad para estudiantes y docentes de la facultad. Permite aprender sobre temas de sostenibilidad, evaluar proyectos académicos y acceder a contenido sobre aspectos culturales, económicos y ambientales.

> ¿Primera vez en este repo? Lee `ONBOARDING_FRONTEND.md` — tiene el contexto histórico del proyecto, cómo acceder a todos los servicios (backend, base de datos, imágenes) y las reglas para no romper nada. `AVANCE_SOSTEK.md` tiene el estado actual: qué está hecho, qué falta y bugs conocidos.

---

## Requisitos previos

Antes de instalar, asegúrate de tener lo siguiente:

- [Node.js](https://nodejs.org/) v16 o superior
- [npm](https://www.npmjs.com/) v8 o superior
- [Ionic CLI](https://ionicframework.com/docs/intro/cli) instalado globalmente:
  ```bash
  npm install -g @ionic/cli
  ```
- Git

---

## Instalación

### 1. Clonar el repositorio
```bash
git clone [url-del-repositorio]
cd Sostek
```

### 2. Cambiar a la rama de desarrollo
```bash
git checkout development
```

### 3. Instalar dependencias
```bash
npm install
```

### 4. Configurar variables de entorno

Copia el archivo de ejemplo:
```bash
cp .env.example .env
```

El frontend solo necesita una variable, la URL del backend:
```
REACT_APP_BACKEND_URL=http://localhost:8080
```

> Si no se define, `src/config.ts` cae al fallback `http://localhost:8080`. En producción se configura en el panel de Render (ver `ONBOARDING_FRONTEND.md`).

---

## Correr la aplicación

### Modo desarrollo (web)
```bash
npm run start
```
Abre automáticamente en `http://localhost:3000`.

### Build de producción
```bash
npm run build
```
Genera la carpeta `/build` lista para deploy.

---

## Backend

El sistema de usuarios (login, registro, perfil, favoritos) y todo el contenido (artículos, presentaciones, evaluaciones, tutorial) viven en un servidor backend (Node.js + Express + MongoDB) que corre por separado en `http://localhost:8080` y **no está en este repositorio**.

- Sin el backend corriendo, el login/registro/perfil no funcionan — pero puedes usar **toda la app como invitado** sin él (no vas a poder cargar contenido nuevo si no hay nada cacheado todavía en `localStorage`).
- Cómo conseguir acceso al backend (repo, credenciales de MongoDB/Cloudinary) está en `ONBOARDING_FRONTEND.md`.

---

## Estructura del proyecto

```
src/
├── App.tsx                          # Router principal + MainTabs + lógica de ocultar tab bar
├── config.ts                        # BACKEND_URL desde variable de entorno REACT_APP_BACKEND_URL
├── api/                              # Toda llamada HTTP pasa por aquí — no usar axios directo en páginas
│   ├── client.ts                    # Instancia de axios + interceptor que agrega el token automáticamente
│   ├── auth.ts                      # login, signup, forgotPassword, resetPassword
│   ├── user.ts                      # perfil, avatar, eliminar cuenta, puntaje, favoritos
│   └── content.ts                   # artículos, presentaciones, evaluaciones, tutorial
├── context/
│   └── AppContext.tsx               # Estado global: search, tutorial, score, transparentToolbar
├── components/
│   ├── ErrorBoundary.tsx            # Error boundary global
│   ├── PrivateRoute.tsx             # HOC de ruta privada — redirige a / si no hay sesión activa
│   ├── layout/AppBarPopOver.tsx     # Toolbar: búsqueda, menú lateral, logout
│   ├── ArticleCarrousel.tsx         # Carrusel horizontal de artículos y presentaciones
│   ├── DocumentCard.tsx             # Tarjeta de artículo/presentación (con botón favorito)
│   ├── EvaluationCard.tsx           # Tarjeta de evaluación en Tab3
│   └── QuestionTestCard.tsx         # Tarjeta de pregunta con checkboxes
├── pages/
│   ├── logIn/, signUp/, forgotPassword/, resetPassword/   # Autenticación
│   ├── tab1/   # APRENDE — artículos + presentaciones
│   ├── tab2/   # JUEGA — video + descarga del juego físico
│   ├── tab3/   # EVALÚATE — lista de evaluaciones
│   ├── document/, presentation/                            # Detalle de artículo / viewer de slides
│   ├── evaluation/, finalScoreEvaluation/                   # Cuestionario y resultados
│   └── profile/, favorites/                                  # Perfil y favoritos del usuario
├── hooks/
│   └── useFavorites.ts              # GET/POST/DELETE favoritos con optimistic update
├── utils/
│   ├── scoring.ts                   # Lógica pura del puntaje de evaluación
│   └── search.ts                    # normalize() — elimina tildes y pasa a minúsculas
└── __tests__/                       # Unit tests (Jest) — ver sección Testing
```

---

## Secciones de la app

| Tab | Nombre | Descripción |
|-----|--------|-------------|
| 1 | **APRENDE** | Artículos y presentaciones de sostenibilidad (contenido desde el backend) |
| 2 | **JUEGA** | Videojuego "Survivor" — descarga de versión física y video; versión online pendiente |
| 3 | **EVALÚATE** | Evaluaciones para medir la sostenibilidad de proyectos académicos |

---

## Testing

```bash
npm test                              # corre los 23 tests existentes en modo watch
npm test -- --watchAll=false          # corre una sola vez (lo que usa CI)
npm test -- --coverage --watchAll=false   # reporte de cobertura
```

Hoy la cobertura es solo de lógica pura: `utils/scoring.ts`, `utils/search.ts` y `hooks/useFavorites.ts` (23 tests, 3 suites). No hay tests de componentes ni de páginas todavía. Corre en GitHub Actions en cada push/PR a `main` o `development` (`.github/workflows/test.yml`).

**Manual (obligatorio antes de dar un cambio por terminado):** correr `npm run start` y probar el flujo afectado en el navegador, priorizando la vista mobile.

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run start` | Inicia servidor de desarrollo en `localhost:3000` |
| `npm run build` | Genera build de producción |
| `npm test` | Corre los tests (agregar `-- --coverage --watchAll=false` para reporte de cobertura) |

---

## Más documentación

| Archivo | Para qué |
|---|---|
| `ONBOARDING_FRONTEND.md` | Empezar desde cero: historia del proyecto, accesos, qué no romper |
| `AVANCE_SOSTEK.md` | Estado actual: qué está hecho, qué falta, bugs conocidos, prioridades |
| `API_CONTRACTS.md` | Contrato de cada endpoint del backend (body, respuesta, errores) que consume `src/api/` |
| `CLAUDE.md` | Convenciones del proyecto (commits, code style) — pensado para trabajar con Claude Code pero aplica igual a cualquier desarrollador |
