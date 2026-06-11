# Sostek

Plataforma educativa digital de sostenibilidad para estudiantes y docentes de la facultad. Permite aprender sobre temas de sostenibilidad, evaluar proyectos académicos y acceder a contenido sobre aspectos culturales, económicos y ambientales.

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

Copia el archivo de ejemplo y llena tus valores:
```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:
```
REACT_APP_PRIVATE_API_KEY=          # API Key de Google Cloud Console
REACT_APP_PRESENTATIONS_DRIVE_ID=   # ID de carpeta de presentaciones en Drive
REACT_APP_EVALUATION_DRIVE_ID=      # ID de carpeta de evaluaciones en Drive
REACT_APP_TUTORIAL_DRIVE_ID=        # ID de carpeta del tutorial en Drive
```

> **Nota:** Sin estas variables, las tabs de Aprende y Evalúate no cargarán contenido.

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

El sistema de usuarios (login, registro, perfil) requiere un servidor backend corriendo por separado en `http://localhost:8080`. Sin él, el login no funciona pero puedes usar la app completa como **invitado**.

---

## Estructura del proyecto

```
src/
├── components/
│   ├── layout/         # AppBar y navegación
│   └── tutorial/       # Componentes del tutorial inicial
├── context/            # Estado global (AppContext)
├── hooks/              # Custom hooks para Google APIs
├── models/             # Tipos TypeScript
├── pages/
│   ├── logIn/          # Pantalla de inicio de sesión
│   ├── signUp/         # Registro de usuario
│   ├── tab1/           # APRENDE — artículos y presentaciones
│   ├── tab2/           # JUEGA — videojuego Survivor
│   ├── tab3/           # EVALÚATE — evaluaciones de proyectos
│   ├── evaluation/     # Pantalla de preguntas
│   ├── finalScoreEvaluation/  # Resultados de evaluación
│   ├── document/       # Detalle de artículo
│   ├── presentation/   # Visor de presentaciones
│   └── profile/        # Perfil de usuario
└── theme/              # Variables de estilos globales
```

---

## Secciones de la app

| Tab | Nombre | Descripción |
|-----|--------|-------------|
| 1 | **APRENDE** | Artículos y presentaciones de sostenibilidad desde Google Drive |
| 2 | **JUEGA** | Videojuego "Survivor" — descarga de versión física y video |
| 3 | **EVALÚATE** | Evaluaciones para medir la sostenibilidad de proyectos académicos |

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run start` | Inicia servidor de desarrollo en `localhost:3000` |
| `npm run build` | Genera build de producción |
| `npm test` | Corre los tests |
