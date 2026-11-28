# Sostek

Plataforma educativa de sostenibilidad para estudiantes y docentes de la facultad. Sirve para aprender sobre sostenibilidad (**APRENDE**), jugar Survivor (**JUEGA**) y evaluar qué tan sostenibles son los proyectos académicos (**EVALÚATE**). Funciona en web y está preparada para iOS y Android con Capacitor.

- **En producción:** https://sostek.vercel.app
- **Este repo:** el frontend, con Ionic React 6, TypeScript, Create React App y Capacitor 4.
- **El backend** está en otro repo: [SostekMX/Sostek-backend](https://github.com/SostekMX/Sostek-backend).

> **¿Primera vez?** Sigue **«Tus primeros 30 minutos»** en [`ONBOARDING_FRONTEND.md`](ONBOARDING_FRONTEND.md): levanta los dos repos en tu máquina con el contenido real, sin pedir ninguna cuenta.

---

## Correr el frontend

Necesitas Node 24 (está en `.nvmrc`) y Git. No hace falta instalar Ionic CLI global, porque viene en las dependencias.

```bash
git clone https://github.com/SostekMX/Sostek.git
cd Sostek
npm install
cp .env.example .env     # REACT_APP_BACKEND_URL=http://localhost:8080
npm run start            # http://localhost:3000
```

Para tener datos, levanta también el backend con `npm run dev:memoria` (ve su README). Sin backend, la app abre, pero solo muestra lo que tenga en caché.

| Comando | Qué hace |
|---|---|
| `npm run start` | Servidor de desarrollo en `localhost:3000` (`ionic serve`) |
| `npm run build` | Build de producción en `build/`. Es lo que corre Vercel |
| `npm test -- --watchAll=false` | Tests, una sola corrida (lo que usa CI) |

---

## Secciones de la app

| Pestaña | Nombre | Qué tiene |
|-----|--------|-------------|
| 1 | **APRENDE** | Artículos y presentaciones de sostenibilidad, con búsqueda y favoritos |
| 2 | **JUEGA** | El juego Survivor: video, instructivo con las 48 cartas y descarga de la versión física. La versión online está pendiente |
| 3 | **EVALÚATE** | Evaluaciones por carrera y nivel, y el quiz de proyectos de negocio |

El login es opcional: todo funciona como invitado. Con una cuenta se guardan el perfil, los favoritos y el puntaje.

---

## Estructura

```
src/
├── App.tsx                 # Rutas, pestañas y navegación
├── config.ts               # BACKEND_URL, desde REACT_APP_BACKEND_URL
├── api/                    # TODA llamada HTTP pasa por aquí; no uses axios directo en las páginas
│   ├── client.ts           # Instancia de axios; agrega el token automáticamente
│   ├── auth.ts             # login, signup, forgotPassword, resetPassword
│   ├── user.ts             # perfil, avatar, eliminar cuenta, puntaje, favoritos
│   └── content.ts          # artículos, presentaciones, evaluaciones, tutorial, quiz
├── pages/
│   ├── logIn/, signUp/, forgotPassword/, resetPassword/   # Autenticación (AuthLayout comparte el marco)
│   ├── tab1/               # APRENDE
│   ├── tab2/               # JUEGA
│   ├── tab3/               # EVALÚATE (evaluaciones y acceso al quiz)
│   ├── document/           # Detalle de un artículo
│   ├── presentation/       # Visor de slides
│   ├── evaluation/         # Cuestionario de una evaluación
│   ├── finalScoreEvaluation/  # Resultado de la evaluación y artículos recomendados
│   ├── quiz/               # Quiz: QuizStart (nivel y tipo), QuizQuestions, QuizResults
│   ├── profile/            # Perfil y foto
│   └── favorites/          # Favoritos del usuario
├── components/
│   ├── layout/             # AppBarPopOver (barra superior), SideNav (escritorio), GlassTabBar (móvil), LanguageToggle
│   ├── ui/                 # Field, PasswordInput, LoadError
│   ├── ArticleCarrousel, DocumentCard, EvaluationCard, QuestionTestCard, QuestionNav
│   ├── QuizEntry, QuizQuestionCard
│   └── ErrorBoundary, PrivateRoute
├── hooks/                  # useFavorites (actualización optimista), useQuizzes, useMediaQuery
├── utils/                  # Lógica pura: scoring, quiz, search, axis, cache, image, session
├── i18n/                   # es.ts y en.ts (textos de la interfaz), content.en.json (contenido en inglés)
├── context/AppContext.tsx  # Estado global: búsqueda, tutorial, puntaje
├── theme/variables.css     # Colores, tipografía y espaciado
└── __tests__/              # Tests con Jest y Testing Library
```

`ios/` es el proyecto nativo de Capacitor. `android/` no se versiona: ve `DESPLIEGUE.md`.

---

## Documentación

| Archivo | Para qué |
|---|---|
| [`ONBOARDING_FRONTEND.md`](ONBOARDING_FRONTEND.md) | Empezar desde cero: los primeros 30 minutos, la historia del proyecto y qué no romper |
| [`AVANCE_SOSTEK.md`](AVANCE_SOSTEK.md) | Estado actual: qué está hecho, qué falta, bugs conocidos y prioridades |
| [`ARQUITECTURA.md`](ARQUITECTURA.md) | Cómo encajan el frontend, el backend y los datos, y las fricciones reales |
| [`API_CONTRACTS.md`](API_CONTRACTS.md) | El contrato de cada endpoint del backend que consume `src/api/` |
| [`DESPLIEGUE.md`](DESPLIEGUE.md) | Producción: Vercel, Render, variables, CORS, rollback y apps nativas (como referencia) |
| [`ACCESOS.md`](ACCESOS.md) | Las cuentas del proyecto, quién las administra, cómo pedir acceso y la migración a Supabase |
